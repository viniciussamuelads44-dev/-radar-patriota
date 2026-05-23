const express = require('express')
const router = express.Router()
const { prisma } = require('../db')
const { getSubscription, getPayment } = require('../services/payment')
const { sendMessage } = require('../whatsapp')

router.post('/mercadopago', async (req, res) => {
  res.sendStatus(200)

  const { type, data } = req.body
  console.log('MP Webhook:', type, data?.id)

  try {
    if (type === 'subscription_preapproval') {
      const sub = await getSubscription(data.id)
      await handleSubscriptionUpdate(sub)
    } else if (type === 'payment') {
      const payment = await getPayment(data.id)
      if (payment.status === 'approved') {
        const email = payment.payer?.email
        if (email) await activateByEmail(email, payment.id)
      }
    }
  } catch (err) {
    console.error('Webhook error:', err.message)
  }
})

async function handleSubscriptionUpdate(sub) {
  const phone = sub.external_reference
  if (!phone) return

  const subscriber = prisma.subscriber.findOne({ phone })
  if (!subscriber) return

  if (sub.status === 'authorized') {
    await activateSubscriber(subscriber, sub.id)
  } else if (['cancelled', 'paused'].includes(sub.status)) {
    prisma.subscriber.update({ id: subscriber.id }, { status: 'cancelled', cancelled_at: new Date().toISOString() })
    console.log(`Assinante cancelado: ${phone}`)
  }
}

async function activateByEmail(email, paymentId) {
  const subscriber = prisma.subscriber.findOne({ mp_payer_email: email }) ||
                     prisma.subscriber.findOne({ email })
  if (!subscriber) return
  await activateSubscriber(subscriber, subscriber.mp_subscription_id)
}

async function activateSubscriber(subscriber, subscriptionId) {
  if (subscriber.status === 'active') return

  prisma.subscriber.update({ id: subscriber.id }, {
    status: 'active',
    activated_at: new Date().toISOString(),
    mp_subscription_id: subscriptionId || subscriber.mp_subscription_id
  })

  console.log(`✅ Assinante ativado: ${subscriber.phone} (${subscriber.name})`)

  try {
    const welcome = `🇧🇷 *BEM-VINDO AO RADAR PATRIOTA!*

Olá, *${subscriber.name}*! ✅

Sua assinatura foi confirmada com sucesso!

📲 A partir de amanhã às 8h você receberá diariamente o briefing conservador mais completo do Brasil.

*O que você vai receber:*
✅ As 5 principais notícias do dia
✅ Manchete + análise conservadora
✅ O que a mídia tenta esconder
✅ Cobertura total das eleições 2026

_Encaminhe para um patriota amigo!_ 🙏

*Radar Patriota* — R$9,90/mês`

    await sendMessage(subscriber.phone, welcome)
  } catch (err) {
    console.error(`Erro ao enviar boas-vindas para ${subscriber.phone}:`, err.message)
  }
}

module.exports = router
