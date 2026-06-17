const https = require('https')

const PLANS = {
  monthly:    { label: 'Mensal',     frequency: 1, amount: 12.90 },
  quarterly:  { label: 'Trimestral', frequency: 3, amount: 29.70 },
  semiannual: { label: 'Semestral',  frequency: 6, amount: 41.40 },
  eleitoral:  { label: 'Eleitoral',  oneTime: true, amount: 29.00 }
}

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

async function createSubscription({ name, phone, email, plan = 'monthly' }) {
  const BACKEND_URL = process.env.BACKEND_URL || 'https://radar-patriota-backend.fly.dev'
  const FRONTEND_URL = process.env.FRONTEND_URL || 'https://radar-patriota.vercel.app'
  const planConfig = PLANS[plan] || PLANS.monthly

  return mpRequest('POST', '/preapproval', {
    reason: `Radar Patriota — Plano ${planConfig.label}`,
    auto_recurring: {
      frequency: planConfig.frequency,
      frequency_type: 'months',
      transaction_amount: planConfig.amount,
      currency_id: 'BRL'
    },
    payer_email: email,
    back_url: `${FRONTEND_URL}/sucesso`,
    notification_url: `${BACKEND_URL}/api/webhook/mercadopago`,
    external_reference: phone
  })
}

async function createOneTimePayment({ name, phone, email }) {
  const BACKEND_URL = process.env.BACKEND_URL || 'https://radar-patriota-backend.fly.dev'
  const FRONTEND_URL = process.env.FRONTEND_URL || 'https://radar-patriota.vercel.app'

  return mpRequest('POST', '/checkout/preferences', {
    items: [{
      id: 'briefing_eleitoral_2026',
      title: 'Briefing Eleitoral 2026 — 3 meses',
      description: 'Análise eleitoral diária via WhatsApp até outubro/2026',
      quantity: 1,
      unit_price: 29.00,
      currency_id: 'BRL'
    }],
    payer: { name, email },
    external_reference: phone,
    back_urls: {
      success: `${FRONTEND_URL}/eleitoral/sucesso`,
      failure: `${FRONTEND_URL}/eleitoral`,
      pending: `${FRONTEND_URL}/eleitoral/sucesso`
    },
    auto_return: 'approved',
    notification_url: `${BACKEND_URL}/api/webhook/mercadopago`
  })
}

async function getSubscription(id) {
  return mpRequest('GET', `/preapproval/${id}`)
}

async function getPayment(id) {
  return mpRequest('GET', `/v1/payments/${id}`)
}

module.exports = { createSubscription, createOneTimePayment, getSubscription, getPayment, PLANS }
