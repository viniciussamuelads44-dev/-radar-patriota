const https = require('https')

async function geminiRequest(prompt) {
  const apiKey = process.env.GEMINI_API_KEY
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    tools: [{ googleSearch: {} }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1500
    }
  })

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text
          if (!text) throw new Error('Sem resposta do Gemini: ' + JSON.stringify(json).slice(0, 300))
          resolve(text)
        } catch (e) { reject(e) }
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function generateDailyNews() {
  const now = new Date()
  const dateStr = now.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).toUpperCase()

  const prompt = `Você é o editor do RADAR PATRIOTA, briefing diário conservador para brasileiros via WhatsApp.

Hoje é ${dateStr}. Use as notícias mais recentes do Brasil de hoje.

Gere o briefing no formato EXATO abaixo, sem texto extra antes ou depois:

🇧🇷 *RADAR PATRIOTA*
📅 ${dateStr}
━━━━━━━━━━━━━━━━

🔴 *MANCHETE DO DIA*
[Frase de impacto sobre a principal notícia conservadora do dia, máx 2 linhas]

━━━━━━━━━━━━━━━━
📋 *AS 5 DO DIA*

1️⃣ *[TÍTULO EM MAIÚSCULAS]*
[Resumo em 1-2 linhas com viés conservador]

2️⃣ *[TÍTULO EM MAIÚSCULAS]*
[Resumo em 1-2 linhas com viés conservador]

3️⃣ *[TÍTULO EM MAIÚSCULAS]*
[Resumo em 1-2 linhas com viés conservador]

4️⃣ *[TÍTULO EM MAIÚSCULAS]*
[Resumo em 1-2 linhas com viés conservador]

5️⃣ *[TÍTULO EM MAIÚSCULAS]*
[Resumo em 1-2 linhas com viés conservador]

━━━━━━━━━━━━━━━━
🎯 *ANÁLISE CONSERVADORA*
[3-4 linhas analisando o cenário político sob perspectiva conservadora: liberdade, família, valores cristãos, soberania nacional]

🔔 *Radar Patriota* | R$9,90/mês

Fontes preferidas: Jovem Pan, Gazeta do Povo, Pleno News, O Antagonista. Foco em: política, economia, eleições 2026, STF, segurança pública. Viés conservador sempre.`

  const content = await geminiRequest(prompt)
  return content.trim()
}

module.exports = { generateDailyNews }
