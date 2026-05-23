const express = require('express')
const router = express.Router()
const { prisma } = require('../db')
const { createSubscription } = require('../services/payment')

router.post('/subscribe', async (req, res) => {
  const { name, phone, email } = req.body

  if (!name || !phone || !email) {
    return res.status(400).json({ error: 'Nome, telefone e email são obrigatórios' })
  }

  try {
    const cleaned = phone.replace(/\D/g, '')
    let subscriber = prisma.subscriber.findOne({ phone: cleaned })

    if (subscriber?.status === 'active') {
      return res.json({ message: 'Você já é assinante ativo!', alreadySubscribed: true })
    }

    if (!subscriber) {
      subscriber = prisma.subscriber.create({ name, phone: cleaned, email, status: 'pending' })
    } else {
      prisma.subscriber.update({ id: subscriber.id }, { name, email, status: 'pending' })
      subscriber = prisma.subscriber.findOne({ id: subscriber.id })
    }

    const mpResult = await createSubscription({ name, phone: cleaned, email })

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

module.exports = router
