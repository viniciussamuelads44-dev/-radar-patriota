const express = require('express')
const router = express.Router()
const { prisma } = require('../db')
const { getSubscription, getPayment } = require('../services/payment')
const { sendMessage } = require('../whatsapp')
const { generateCancelToken } = require('../services/cancel')
const { notifyAdmin } = require('../services/notify-admin')

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://frontend-eta-ten-qxe8qap1z0.vercel.app'

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
        const phone = payment.external_reference
        if (email) await activateByEmail(email, payment.id, phone)
        else if (phone) await activateByPhone(phone, payment.id)
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
    notifyAdmin(`❌ *Assinatura cancelada*\n\nNome: ${subscriber.name}\nFone: ${subscriber.phone}`)
  }
}

async function activateByEmail(email, paymentId, phone = null) {
  let subscriber = prisma.subscriber.findOne({ mp_payer_email: email }) ||
                   prisma.subscriber.findOne({ email })
  if (!subscriber && phone) subscriber = prisma.subscriber.findOne({ phone })
  if (!subscriber) return
  await activateSubscriber(subscriber, paymentId)
}

async function activateByPhone(phone, paymentId) {
  const subscriber = prisma.subscriber.findOne({ phone })
  if (!subscriber) return
  await activateSubscriber(subscriber, paymentId)
}

async function activateSubscriber(subscriber, subscriptionId) {
  if (subscriber.status === 'active') return

  const isEleitoral = subscriber.plan === 'eleitoral'
  const expiresAt = isEleitoral
    ? new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    : null

  prisma.subscriber.update({ id: subscriber.id }, {
    status: 'active',
    activated_at: new Date().toISOString(),
    mp_subscription_id: subscriptionId || subscriber.mp_subscription_id,
    ...(expiresAt ? { expires_at: expiresAt } : {})
  })

  console.log(`✅ Assinante ativado: ${subscriber.phone} (${subscriber.name})`)

  notifyAdmin(`🎉 *Nova assinatura!*\n\nNome: ${subscriber.name}\nFone: ${subscriber.phone}\nEmail: ${subscriber.email || '—'}`)

  try {
    const today = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
      .split('/').reverse().join('-')

    if (isEleitoral) {
      const todayEdition = prisma.edition.findOne({ date: `${today}-eleitoral` })
      const nextLine = todayEdition
        ? '📲 O briefing de hoje já está disponível — você o receberá em instantes!'
        : '📲 Todo dia às 7h30 você recebe a análise mais completa da corrida presidencial 2026.'

      const welcome = `🗳️ *BEM-VINDO AO BRIEFING ELEITORAL 2026!*

Olá, *${subscriber.name}*! ✅

Pagamento confirmado — você está dentro.

${nextLine}

*O que você vai receber todo dia:*
✅ Termômetro atualizado das pesquisas
✅ Os 3 movimentos eleitorais do dia
✅ Alianças e bastidores
✅ Quem ganhou e quem perdeu
✅ Análise estratégica conservadora

_Seu acesso vai até outubro/2026 — eleições presidenciais._

🗳️ *Briefing Eleitoral 2026* — R$29 por 3 meses`

      await sendMessage(subscriber.phone, welcome)

      if (todayEdition) {
        await new Promise(r => setTimeout(r, 2000))
        await sendMessage(subscriber.phone, todayEdition.content)
        prisma.sendLog.create({ subscriber_id: subscriber.id, edition_id: todayEdition.id, phone: subscriber.phone, status: 'sent' })
        console.log(`🗳️ Edição eleitoral do dia enviada para: ${subscriber.phone}`)
      }
    } else {
      const todayEdition = prisma.edition.findOne({ date: `${today}-manha` }) ||
                           prisma.edition.findOne({ date: today })

      const cancelToken = generateCancelToken(subscriber.phone)
      const cancelLink = `${FRONTEND_URL}/cancelar?phone=${subscriber.phone}&token=${cancelToken}`

      const nextBriefingLine = todayEdition
        ? '📲 O briefing de hoje já está disponível — você o receberá em instantes!'
        : '📲 Todo dia às 6h30 você receberá o briefing conservador mais completo do Brasil.'

      const planInfo = {
        monthly:    'R$12,90/mês (Plano Mensal)',
        quarterly:  'R$9,90/mês (Plano Trimestral — cobrado R$29,70 a cada 3 meses)',
        semiannual: 'R$7,90/mês (Plano Semestral — cobrado R$47,40 a cada 6 meses)'
      }
      const planLabel = planInfo[subscriber.plan] || planInfo.monthly

      const welcome = `🇧🇷 *BEM-VINDO AO RADAR PATRIOTA!*

Olá, *${subscriber.name}*! ✅

Sua assinatura foi confirmada com sucesso!

${nextBriefingLine}

*O que você vai receber:*
✅ As 5 principais notícias do dia
✅ Manchete + análise conservadora
✅ O que a mídia tenta esconder
✅ Cobertura total das eleições 2026

_Encaminhe para um patriota amigo!_ 🙏

*Radar Patriota* — ${planLabel}

_Para cancelar a qualquer momento:_
${cancelLink}`

      await sendMessage(subscriber.phone, welcome)

      if (todayEdition) {
        await new Promise(r => setTimeout(r, 2000))
        await sendMessage(subscriber.phone, todayEdition.content)
        prisma.sendLog.create({ subscriber_id: subscriber.id, edition_id: todayEdition.id, phone: subscriber.phone, status: 'sent' })
        console.log(`📰 Edição do dia enviada para novo assinante: ${subscriber.phone}`)
      }
    }
  } catch (err) {
    console.error(`Erro ao enviar boas-vindas para ${subscriber.phone}:`, err.message)
  }
}

module.exports = router
