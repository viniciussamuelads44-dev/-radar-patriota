const express = require('express')
const router = express.Router()
const { prisma } = require('../db')
const { createSubscription, createOneTimePayment, PLANS } = require('../services/payment')

router.post('/subscribe', async (req, res) => {
  const { name, phone, email, plan = 'monthly' } = req.body

  if (!name || !phone || !email) {
    return res.status(400).json({ error: 'Nome, telefone e email são obrigatórios' })
  }

  if (!PLANS[plan]) {
    return res.status(400).json({ error: 'Plano inválido' })
  }

  try {
    const cleaned = phone.replace(/\D/g, '')
    let subscriber = prisma.subscriber.findOne({ phone: cleaned })

    if (subscriber?.status === 'active') {
      return res.json({ message: 'Você já é assinante ativo!', alreadySubscribed: true })
    }

    if (!subscriber) {
      subscriber = prisma.subscriber.create({ name, phone: cleaned, email, plan, status: 'pending' })
    } else {
      prisma.subscriber.update({ id: subscriber.id }, { name, email, plan, status: 'pending' })
      subscriber = prisma.subscriber.findOne({ id: subscriber.id })
    }

    const mpResult = await createSubscription({ name, phone: cleaned, email, plan })

    if (!mpResult.init_point) {
      throw new Error(mpResult.message || 'Erro ao criar assinatura no MercadoPago')
    }

    prisma.subscriber.update({ id: subscriber.id }, {
      mp_subscription_id: mpResult.id,
      mp_payer_email: email
    })

    res.json({ init_point: mpResult.init_point, subscription_id: mpResult.id })
  } catch (err) {
    console.error('Erro ao criar assinatura:', err.message)
    res.status(500).json({ error: 'Erro interno. Tente novamente.' })
  }
})

router.post('/subscribe-eleitoral', async (req, res) => {
  const { name, phone, email } = req.body
  if (!name || !phone || !email) {
    return res.status(400).json({ error: 'Nome, telefone e email são obrigatórios' })
  }
  try {
    const cleaned = phone.replace(/\D/g, '')
    let subscriber = prisma.subscriber.findOne({ phone: cleaned })

    if (subscriber?.status === 'active' && subscriber?.plan === 'eleitoral') {
      return res.json({ message: 'Você já é assinante ativo!', alreadySubscribed: true })
    }

    if (!subscriber) {
      subscriber = prisma.subscriber.create({ name, phone: cleaned, email, plan: 'eleitoral', status: 'pending', mp_payer_email: email })
    } else {
      prisma.subscriber.update({ id: subscriber.id }, { name, email, plan: 'eleitoral', status: 'pending', mp_payer_email: email })
      subscriber = prisma.subscriber.findOne({ id: subscriber.id })
    }

    const mpResult = await createOneTimePayment({ name, phone: cleaned, email })

    if (!mpResult.init_point) {
      throw new Error(mpResult.message || 'Erro ao criar pagamento no MercadoPago')
    }

    res.json({ init_point: mpResult.init_point })
  } catch (err) {
    console.error('Erro ao criar pagamento eleitoral:', err.message)
    res.status(500).json({ error: 'Erro interno. Tente novamente.' })
  }
})

module.exports = router
