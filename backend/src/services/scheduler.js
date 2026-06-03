const cron = require('node-cron')
const { prisma } = require('../db')
const { generateDailyNews } = require('./news')
const { sendMessage } = require('../whatsapp')
const { createBackup } = require('./backup')
const { notifyAdmin } = require('./notify-admin')

let runningEdition = false

async function runDailyEdition(force = false, period = 'manha') {
  if (runningEdition) { console.log('Edição já em andamento, pulando.'); return { skipped: true, sentCount: 0, errorCount: 0, total: 0 } }
  runningEdition = true
  try { return await _runDailyEdition(force, period) } finally { runningEdition = false }
}

async function _runDailyEdition(force = false, period = 'manha') {
  const today = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    .split('/').reverse().join('-')

  const editionDate = `${today}-${period}`
  const existing = prisma.edition.findOne({ date: editionDate })
  if (existing?.sent_at && !force) {
    console.log(`Edição ${editionDate} já enviada`)
    return { skipped: true, sentCount: 0, errorCount: 0, total: 0 }
  }

  console.log(`🔍 Gerando notícias ${period}...`)
  let content

  if (existing && !force) {
    content = existing.content
  } else {
    content = await generateDailyNews(period)
    if (existing) {
      prisma.edition.update({ date: editionDate }, { content })
    } else {
      prisma.edition.create({ date: editionDate, content })
    }
  }

  const edition = prisma.edition.findOne({ date: editionDate })
  const subscribers = prisma.subscriber.findMany({ where: { status: 'active' } })

  console.log(`📤 Enviando ${period} para ${subscribers.length} assinantes...`)

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

  prisma.edition.update({ date: editionDate }, { sent_count: sentCount, sent_at: new Date().toISOString() })
  console.log(`✅ ${period} enviado: ${sentCount}/${subscribers.length} | Erros: ${errorCount}`)

  try { createBackup() } catch (e) { console.error('Backup falhou:', e.message) }

  const activeCount = prisma.subscriber.count({ where: { status: 'active' } })
  const label = period === 'tarde' ? '🌇 Vespertina' : '🌅 Matinal'
  notifyAdmin(`📊 *Edição ${label} ${today} enviada*\n\n✅ Enviados: ${sentCount}\n❌ Erros: ${errorCount}\n👥 Assinantes ativos: ${activeCount}`)

  return { sentCount, errorCount, total: subscribers.length }
}

async function retryFailedSends(period = 'manha') {
  const today = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    .split('/').reverse().join('-')

  const editionDate = `${today}-${period}`
  const edition = prisma.edition.findOne({ date: editionDate })
  if (!edition) return

  const failed = prisma.sendLog.findMany({ where: { edition_id: edition.id, status: 'error' } })
  if (!failed.length) { console.log(`Retry ${period}: sem erros para reenviar`); return }

  console.log(`🔁 Retry ${period}: tentando reenviar para ${failed.length} assinante(s)...`)
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
      console.error(`Retry ${period} falhou ${sub.phone}:`, err.message)
    }
  }

  console.log(`✅ Retry ${period} concluído: ${retried}/${failed.length}`)
  if (retried > 0) notifyAdmin(`🔁 *Retry ${period} concluído*: ${retried}/${failed.length} reenviados`)
}

function checkMissedEdition(period = 'manha') {
  if (runningEdition) return
  const today = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    .split('/').reverse().join('-')
  const hour = Number(new Intl.DateTimeFormat('pt-BR', { hour: 'numeric', hour12: false, timeZone: 'America/Sao_Paulo' }).format(new Date()))

  const minHour = period === 'tarde' ? 18 : 6
  if (hour < minHour) return

  const editionDate = `${today}-${period}`
  const existing = prisma.edition.findOne({ date: editionDate })
  if (!existing) {
    console.log(`⚠️ Edição ${period} não criada — disparando agora...`)
    runDailyEdition(false, period).catch(console.error)
  } else if (!existing.sent_at || existing.sent_count === 0) {
    console.log(`⚠️ Edição ${period} sem envio confirmado — reenviando...`)
    runDailyEdition(true, period).catch(console.error)
  }
}

function startScheduler() {
  // Manhã: disparo 6h30, retry 7h30, verificação 8h/9h/10h
  cron.schedule('30 6 * * *', () => {
    console.log('⏰ Cron 6h30: iniciando edição matinal...')
    runDailyEdition(false, 'manha').catch(console.error)
  }, { timezone: 'America/Sao_Paulo' })

  cron.schedule('30 7 * * *', () => {
    console.log('⏰ Cron 7h30: retry manhã...')
    retryFailedSends('manha').catch(console.error)
    checkMissedEdition('manha')
  }, { timezone: 'America/Sao_Paulo' })

  cron.schedule('0 8,9,10 * * *', () => {
    checkMissedEdition('manha')
  }, { timezone: 'America/Sao_Paulo' })

  // Tarde: disparo 18h, retry 19h, verificação 20h/21h
  cron.schedule('0 18 * * *', () => {
    console.log('⏰ Cron 18h: iniciando edição vespertina...')
    runDailyEdition(false, 'tarde').catch(console.error)
  }, { timezone: 'America/Sao_Paulo' })

  cron.schedule('0 19 * * *', () => {
    console.log('⏰ Cron 19h: retry tarde...')
    retryFailedSends('tarde').catch(console.error)
    checkMissedEdition('tarde')
  }, { timezone: 'America/Sao_Paulo' })

  cron.schedule('0 20,21 * * *', () => {
    checkMissedEdition('tarde')
  }, { timezone: 'America/Sao_Paulo' })

  console.log('⏰ Scheduler: manhã 6h30 + tarde 18h (Brasília)')

  setTimeout(() => checkMissedEdition('manha'), 10_000)
  setTimeout(() => checkMissedEdition('tarde'), 12_000)
}

module.exports = { startScheduler, runDailyEdition, checkMissedEdition }
