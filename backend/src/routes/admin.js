const express = require('express')
const router = express.Router()
const { db, prisma } = require('../db')
const { runDailyEdition } = require('../services/scheduler')
const { sendMessage, getStatus, getQR } = require('../whatsapp')
const QRCode = require('qrcode')
const { generateDailyNews } = require('../services/news')
const { createBackup, DB_PATH } = require('../services/backup')

const ADMIN_KEY = process.env.ADMIN_SECRET_KEY || 'radar-admin-2026'

router.use((req, res, next) => {
  const key = req.headers['x-admin-key'] || req.query.key
  if (key !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
})

router.get('/qr', async (req, res) => {
  const qr = getQR()
  if (!qr) {
    const { connected } = getStatus()
    return res.send(`<html><body style="background:#0a0f1e;color:white;font-family:sans-serif;text-align:center;padding:60px">
      <h2>${connected ? '✅ WhatsApp já está conectado!' : '⏳ QR ainda não gerado. Aguarde 10s e recarregue.'}</h2>
    </body></html>`)
  }
  const dataUrl = await QRCode.toDataURL(qr, { width: 500, margin: 2, errorCorrectionLevel: 'H', color: { dark: '#000000', light: '#ffffff' } })
  res.send(`<html><body style="background:#0a0f1e;color:white;font-family:sans-serif;text-align:center;padding:40px">
    <h2>📱 Escaneie com o WhatsApp</h2>
    <p style="color:#aaa">WhatsApp → Aparelhos conectados → Conectar aparelho</p>
    <div style="background:white;padding:16px;display:inline-block;margin:20px auto">
      <img src="${dataUrl}" style="display:block;width:400px;height:400px"/>
    </div>
    <p style="color:#aaa;font-size:13px">Atualiza em <span id="t">15</span>s</p>
    <script>let n=15;setInterval(()=>{n--;document.getElementById('t').innerText=n;if(n<=0)location.reload()},1000)</script>
  </body></html>`)
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
  const period = ['manha', 'tarde'].includes(req.query.period) ? req.query.period : 'manha'
  try {
    const result = await runDailyEdition(force, period)
    res.json({ ok: true, period, ...result })
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

router.post('/backup', (req, res) => {
  try {
    const dest = createBackup()
    const path = require('path')
    res.json({ ok: true, file: path.basename(dest) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/backup/download', (req, res) => {
  try {
    res.download(DB_PATH, 'radar.db')
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
