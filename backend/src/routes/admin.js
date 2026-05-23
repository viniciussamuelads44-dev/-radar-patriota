const express = require('express')
const router = express.Router()
const { db, prisma } = require('../db')
const { runDailyEdition } = require('../services/scheduler')
const { sendMessage, getStatus } = require('../whatsapp')
const { generateDailyNews } = require('../services/news')

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'radar-admin-2026'

router.use((req, res, next) => {
  if (req.headers['x-admin-key'] !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
})

router.get('/stats', (req, res) => {
  res.json({
    subscribers: {
      total: prisma.subscriber.count(),
      active: prisma.subscriber.count({ where: { status: 'active' } }),
      pending: prisma.subscriber.count({ where: { status: 'pending' } }),
      cancelled: prisma.subscriber.count({ where: { status: 'cancelled' } })
    },
    editions: prisma.edition.findMany().slice(0, 10),
    whatsapp: getStatus()
  })
})

router.get('/subscribers', (req, res) => {
  res.json(prisma.subscriber.findMany({ orderBy: { created_at: 'desc' } }))
})

router.post('/run-edition', async (req, res) => {
  const force = req.query.force === 'true'
  try {
    const result = await runDailyEdition(force)
    res.json({ ok: true, ...result })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/send-test', async (req, res) => {
  const { phone, message } = req.body
  try {
    await sendMessage(phone, message || '🇧🇷 Teste do Radar Patriota!')
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/generate-news', async (req, res) => {
  try {
    const content = await generateDailyNews()
    res.json({ ok: true, content })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.put('/subscriber/:id/activate', (req, res) => {
  const sub = prisma.subscriber.findOne({ id: parseInt(req.params.id) })
  if (!sub) return res.status(404).json({ error: 'Não encontrado' })
  prisma.subscriber.update({ id: sub.id }, { status: 'active', activated_at: new Date().toISOString() })
  res.json({ ok: true })
})

router.put('/subscriber/:id/deactivate', (req, res) => {
  prisma.subscriber.update(
    { id: parseInt(req.params.id) },
    { status: 'cancelled', cancelled_at: new Date().toISOString() }
  )
  res.json({ ok: true })
})

router.delete('/subscriber/:id', (req, res) => {
  db.prepare('DELETE FROM subscribers WHERE id = ?').run(parseInt(req.params.id))
  res.json({ ok: true })
})

module.exports = router
