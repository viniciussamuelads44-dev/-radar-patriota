require('dotenv').config()
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }))
app.use(express.json())

app.use('/api/payment', require('./routes/payment'))
app.use('/api/webhook', require('./routes/webhook'))
app.use('/api/admin', require('./routes/admin'))

app.get('/health', (req, res) => {
  const { getStatus } = require('./whatsapp')
  res.json({ ok: true, ...getStatus() })
})

const PORT = process.env.PORT || 3001

async function main() {
  const { connect } = require('./whatsapp')
  const { startScheduler } = require('./services/scheduler')

  try {
    await connect()
  } catch (err) {
    console.error('Erro ao conectar WhatsApp:', err.message)
  }

  startScheduler()

  app.listen(PORT, () => {
    console.log(`🚀 Radar Patriota Backend rodando na porta ${PORT}`)
  })
}

main().catch(console.error)
