const https = require('https')

async function mpRequest(method, path, body = null) {
  const bodyStr = body ? JSON.stringify(body) : null
  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'api.mercadopago.com',
      path,
      method,
      headers: {
        'Authorization': `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        ...(bodyStr ? { 'Content-Length': Buffer.byteLength(bodyStr) } : {})
      }
    }, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => { try { resolve(JSON.parse(data)) } catch (e) { reject(e) } })
    })
    req.on('error', reject)
    if (bodyStr) req.write(bodyStr)
    req.end()
  })
}

async function createSubscription({ name, phone, email }) {
  const BACKEND_URL = process.env.BACKEND_URL || 'https://radar-patriota-backend.onrender.com'
  const FRONTEND_URL = process.env.FRONTEND_URL || 'https://radar-patriota.vercel.app'

  return mpRequest('POST', '/preapproval', {
    reason: 'Radar Patriota — Notícias Conservadoras Diárias',
    auto_recurring: {
      frequency: 1,
      frequency_type: 'months',
      transaction_amount: 9.90,
      currency_id: 'BRL'
    },
    payer_email: email,
    back_url: `${FRONTEND_URL}/sucesso`,
    notification_url: `${BACKEND_URL}/api/webhook/mercadopago`,
    external_reference: phone
  })
}

async function getSubscription(id) {
  return mpRequest('GET', `/preapproval/${id}`)
}

async function getPayment(id) {
  return mpRequest('GET', `/v1/payments/${id}`)
}

module.exports = { createSubscription, getSubscription, getPayment }
