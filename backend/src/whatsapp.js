const path = require('path')
const fs = require('fs')
const pino = require('pino')
const qrcode = require('qrcode-terminal')

const AUTH_PATH = process.env.NODE_ENV === 'production'
  ? '/var/data/auth'
  : path.join(__dirname, '../../auth')

if (!fs.existsSync(AUTH_PATH)) fs.mkdirSync(AUTH_PATH, { recursive: true })

let sock = null
let isConnected = false
let qrPending = false

async function connect() {
  const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
  } = await import('@whiskeysockets/baileys')

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_PATH)
  const { version } = await fetchLatestBaileysVersion()

  sock = makeWASocket({
    version,
    auth: state,
    logger: pino({ level: 'silent' }),
    printQRInTerminal: false,
    browser: ['Radar Patriota', 'Chrome', '3.0.0'],
    generateHighQualityLinkPreview: false,
    syncFullHistory: false
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      qrPending = true
      console.log('\n📱 ESCANEIE O QR CODE NO WHATSAPP:\n')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'close') {
      isConnected = false
      const statusCode = lastDisconnect?.error?.output?.statusCode

      if (statusCode === DisconnectReason.loggedOut) {
        console.log('Sessão encerrada. Limpando e reconectando...')
        fs.rmSync(AUTH_PATH, { recursive: true, force: true })
        fs.mkdirSync(AUTH_PATH, { recursive: true })
      } else {
        console.log(`Conexão fechada (${statusCode}). Reconectando em 5s...`)
      }
      setTimeout(() => connect().catch(console.error), 5000)
    } else if (connection === 'open') {
      isConnected = true
      qrPending = false
      console.log('✅ WhatsApp conectado!')
    }
  })
}

async function sendMessage(phone, text) {
  if (!sock || !isConnected) throw new Error('WhatsApp não conectado')

  const cleaned = phone.replace(/\D/g, '')
  const withCountry = cleaned.startsWith('55') ? cleaned : '55' + cleaned
  const jid = withCountry + '@s.whatsapp.net'

  await sock.sendMessage(jid, { text })
}

function getStatus() {
  return { connected: isConnected, qrPending }
}

module.exports = { connect, sendMessage, getStatus }
