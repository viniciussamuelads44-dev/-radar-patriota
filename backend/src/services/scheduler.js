const cron = require('node-cron')
const { prisma } = require('../db')
const { generateDailyNews } = require('./news')
const { sendMessage } = require('../whatsapp')

async function runDailyEdition(force = false) {
  const today = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    .split('/').reverse().join('-')

  const existing = prisma.edition.findOne({ date: today })
  if (existing?.sent_at && !force) {
    console.log(`Edição ${today} já enviada`)
    return { skipped: true, sentCount: 0, errorCount: 0, total: 0 }
  }

  console.log('🔍 Gerando notícias do dia...')
  let content

  if (existing && !force) {
    content = existing.content
  } else {
    content = await generateDailyNews()
    if (existing) {
      prisma.edition.update({ date: today }, { content })
    } else {
      prisma.edition.create({ date: today, content })
    }
  }

  const edition = prisma.edition.findOne({ date: today })
  const subscribers = prisma.subscriber.findMany({ where: { status: 'active' } })

  console.log(`📤 Enviando para ${subscribers.length} assinantes...`)

  let sentCount = 0
  let errorCount = 0

  for (const sub of subscribers) {
    try {
      await sendMessage(sub.phone, content)
      prisma.sendLog.create({ subscriber_id: sub.id, edition_id: edition.id, phone: sub.phone, status: 'sent' })
      sentCount++
      await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000))
    } catch (err) {
      errorCount++
      prisma.sendLog.create({ subscriber_id: sub.id, edition_id: edition.id, phone: sub.phone, status: 'error', error: err.message })
      console.error(`Erro ${sub.phone}:`, err.message)
    }
  }

  prisma.edition.update({ date: today }, { sent_count: sentCount, sent_at: new Date().toISOString() })
  console.log(`✅ Enviado: ${sentCount}/${subscribers.length} | Erros: ${errorCount}`)
  return { sentCount, errorCount, total: subscribers.length }
}

function startScheduler() {
  cron.schedule('0 8 * * *', () => {
    console.log('⏰ Cron 8h: iniciando edição diária...')
    runDailyEdition().catch(console.error)
  }, { timezone: 'America/Sao_Paulo' })
  console.log('⏰ Scheduler: edição diária às 8h (Brasília)')
}

module.exports = { startScheduler, runDailyEdition }
