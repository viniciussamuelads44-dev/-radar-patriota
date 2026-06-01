const cron = require('node-cron')
const { prisma } = require('../db')
const { generateDailyNews } = require('./news')
const { sendMessage } = require('../whatsapp')
const { createBackup } = require('./backup')
const { notifyAdmin } = require('./notify-admin')

let runningEdition = false

async function runDailyEdition(force = false) {
  if (runningEdition) { console.log('Edição já em andamento, pulando.'); return { skipped: true, sentCount: 0, errorCount: 0, total: 0 } }
  runningEdition = true
  try { return await _runDailyEdition(force) } finally { runningEdition = false }
}

async function _runDailyEdition(force = false) {
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

  try { createBackup() } catch (e) { console.error('Backup falhou:', e.message) }

  const activeCount = prisma.subscriber.count({ where: { status: 'active' } })
  notifyAdmin(`📊 *Edição ${today} enviada*\n\n✅ Enviados: ${sentCount}\n❌ Erros: ${errorCount}\n👥 Assinantes ativos: ${activeCount}`)

  return { sentCount, errorCount, total: subscribers.length }
}

async function retryFailedSends() {
  const today = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    .split('/').reverse().join('-')

  const edition = prisma.edition.findOne({ date: today })
  if (!edition) return

  const failed = prisma.sendLog.findMany({ where: { edition_id: edition.id, status: 'error' } })
  if (!failed.length) { console.log('Retry: sem erros para reenviar'); return }

  console.log(`🔁 Retry: tentando reenviar para ${failed.length} assinante(s)...`)
  let retried = 0

  for (const log of failed) {
    const sub = prisma.subscriber.findOne({ id: log.subscriber_id })
    if (!sub || sub.status !== 'active') continue
    try {
      await sendMessage(sub.phone, edition.content)
      prisma.sendLog.create({ subscriber_id: sub.id, edition_id: edition.id, phone: sub.phone, status: 'sent' })
      retried++
      await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000))
    } catch (err) {
      console.error(`Retry falhou ${sub.phone}:`, err.message)
    }
  }

  console.log(`✅ Retry concluído: ${retried}/${failed.length}`)
  if (retried > 0) notifyAdmin(`🔁 *Retry concluído*: ${retried}/${failed.length} reenviados`)
}

function checkMissedEdition() {
  if (runningEdition) return
  const today = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    .split('/').reverse().join('-')
  const hour = Number(new Intl.DateTimeFormat('pt-BR', { hour: 'numeric', hour12: false, timeZone: 'America/Sao_Paulo' }).format(new Date()))

  if (hour < 8) return

  const existing = prisma.edition.findOne({ date: today })
  if (!existing) {
    console.log('⚠️ Edição do dia não criada (Gemini falhou?) — disparando agora...')
    runDailyEdition().catch(console.error)
  } else if (!existing.sent_at || existing.sent_count === 0) {
    console.log('⚠️ Edição do dia sem envio confirmado — reenviando...')
    runDailyEdition(true).catch(console.error)
  }
}

function startScheduler() {
  cron.schedule('0 8 * * *', () => {
    console.log('⏰ Cron 8h: iniciando edição diária...')
    runDailyEdition().catch(console.error)
  }, { timezone: 'America/Sao_Paulo' })

  cron.schedule('0 9 * * *', () => {
    console.log('⏰ Cron 9h: retry de falhos...')
    retryFailedSends().catch(console.error)
    checkMissedEdition()
  }, { timezone: 'America/Sao_Paulo' })

  // Segurança: re-tenta se 8h falhou (Gemini, WhatsApp, etc.)
  cron.schedule('0 10,11,12 * * *', () => {
    checkMissedEdition()
  }, { timezone: 'America/Sao_Paulo' })

  console.log('⏰ Scheduler: edição 8h + retry 9h + verificação 9h-12h (Brasília)')

  setTimeout(checkMissedEdition, 10_000)
}

module.exports = { startScheduler, runDailyEdition }
