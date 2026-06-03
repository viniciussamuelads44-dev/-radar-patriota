const https = require('https')

async function geminiRequest(prompt, model = 'gemini-2.5-flash') {
  const apiKey = process.env.GEMINI_API_KEY
  const body = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    tools: [{ googleSearch: {} }],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4000
    }
  })

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
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

async function generateDailyNews(period = 'manha') {
  const now = new Date()
  const dateStr = now.toLocaleDateString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).toUpperCase()

  const isTarde = period === 'tarde'

  const prompt = isTarde
    ? `Você é o editor-chefe do RADAR PATRIOTA, o briefing conservador mais completo do Brasil, entregue via WhatsApp.

Hoje é ${dateStr}. É fim de tarde — pesquise o que aconteceu NO BRASIL ao longo deste dia usando o Google Search. Foque nos desdobramentos mais recentes das últimas horas.

Seu público: brasileiros conservadores, cristãos, que valorizam família, liberdade, propriedade privada e soberania nacional. Eles desconfiam da mídia mainstream e querem a verdade sem filtro.

Gere o RESUMO VESPERTINO no formato EXATO abaixo. Sem texto extra antes ou depois.

🇧🇷 *RADAR PATRIOTA — EDIÇÃO DA TARDE*
📅 ${dateStr}
━━━━━━━━━━━━━━━━

🔥 *O DIA EM DESTAQUE*
[2-3 linhas sobre o acontecimento mais impactante do dia até agora. Tom direto e contundente.]

━━━━━━━━━━━━━━━━
📋 *O QUE ACONTECEU HOJE*

1️⃣ *[TÍTULO FORTE EM MAIÚSCULAS]*
[4-5 linhas com o que aconteceu + impacto para o Brasil conservador.]

2️⃣ *[TÍTULO FORTE EM MAIÚSCULAS]*
[4-5 linhas com o que aconteceu + impacto para o Brasil conservador.]

3️⃣ *[TÍTULO FORTE EM MAIÚSCULAS]*
[4-5 linhas com o que aconteceu + impacto para o Brasil conservador.]

4️⃣ *[TÍTULO FORTE EM MAIÚSCULAS]*
[4-5 linhas com o que aconteceu + impacto para o Brasil conservador.]

5️⃣ *[TÍTULO FORTE EM MAIÚSCULAS]*
[4-5 linhas com o que aconteceu + impacto para o Brasil conservador.]

━━━━━━━━━━━━━━━━
🕵️ *O QUE A MÍDIA ESCONDE*
[3-4 linhas sobre fatos relevantes do dia que os veículos progressistas estão ignorando ou distorcendo.]

━━━━━━━━━━━━━━━━
🎯 *ANÁLISE DA TARDE*
[5-6 linhas de análise política conservadora dos eventos do dia. Conecte com eleições 2026. Cite nomes reais. Seja direto e contundente.]

━━━━━━━━━━━━━━━━
🗳️ *ELEIÇÕES 2026 — PLACAR DO DIA*
[2-3 linhas: como o dia de hoje move o tabuleiro eleitoral. Quem ganhou, quem perdeu.]

━━━━━━━━━━━━━━━━
✝️ *PENSAMENTO DA TARDE*
[1 versículo bíblico OU frase de líder conservador. Formato: "Frase" — Autor]

🔔 *Radar Patriota* — Informação sem censura, às 6h30 e às 18h.

Fontes: Jovem Pan, Gazeta do Povo, Pleno News, O Antagonista, CNN Brasil, G1. Foco: política nacional, STF, economia, segurança pública, eleições 2026, liberdade de expressão.`

    : `Você é o editor-chefe do RADAR PATRIOTA, o briefing conservador mais completo do Brasil, entregue diariamente via WhatsApp.

Hoje é ${dateStr}. Pesquise as notícias mais quentes do Brasil de HOJE usando o Google Search.

Seu público: brasileiros conservadores, cristãos, que valorizam família, liberdade, propriedade privada e soberania nacional. Eles desconfiam da mídia mainstream e querem a verdade sem filtro.

Gere o briefing no formato EXATO abaixo. Seja DETALHADO, IMPACTANTE e APROFUNDADO em cada seção. Sem texto extra antes ou depois do briefing.

🇧🇷 *RADAR PATRIOTA*
📅 ${dateStr}
━━━━━━━━━━━━━━━━

🔴 *MANCHETE DO DIA*
[2-3 linhas de ALTO IMPACTO sobre a notícia mais importante do dia. Tom urgente, direto, indignado se necessário. Diga o que está em jogo para o Brasil conservador.]

━━━━━━━━━━━━━━━━
📋 *AS 5 DO DIA*

1️⃣ *[TÍTULO FORTE EM MAIÚSCULAS]*
[4-5 linhas: O que aconteceu + contexto + por que importa para o conservador + quem se beneficia ou quem é responsável. Seja específico com nomes, valores e datas.]

2️⃣ *[TÍTULO FORTE EM MAIÚSCULAS]*
[4-5 linhas: O que aconteceu + contexto + por que importa para o conservador + quem se beneficia ou quem é responsável. Seja específico com nomes, valores e datas.]

3️⃣ *[TÍTULO FORTE EM MAIÚSCULAS]*
[4-5 linhas: O que aconteceu + contexto + por que importa para o conservador + quem se beneficia ou quem é responsável. Seja específico com nomes, valores e datas.]

4️⃣ *[TÍTULO FORTE EM MAIÚSCULAS]*
[4-5 linhas: O que aconteceu + contexto + por que importa para o conservador + quem se beneficia ou quem é responsável. Seja específico com nomes, valores e datas.]

5️⃣ *[TÍTULO FORTE EM MAIÚSCULAS]*
[4-5 linhas: O que aconteceu + contexto + por que importa para o conservador + quem se beneficia ou quem é responsável. Seja específico com nomes, valores e datas.]

━━━━━━━━━━━━━━━━
🕵️ *O QUE A MÍDIA ESCONDE*
[3-4 linhas revelando o que a Globo, Folha e demais veículos progressistas estão ignorando ou distorcendo hoje. Seja específico: qual fato está sendo omitido e por quê interessa à esquerda que ele não apareça.]

━━━━━━━━━━━━━━━━
🎯 *ANÁLISE DO DIA*
[6-8 linhas de análise política profunda sob perspectiva conservadora. Conecte os eventos do dia com o cenário das eleições 2026. Fale sobre: ameaças à liberdade, avanço do estado, situação econômica, projetos de poder do PT, resistência conservadora. Cite atores políticos reais pelo nome. Seja contundente.]

━━━━━━━━━━━━━━━━
🗳️ *ELEIÇÕES 2026 — TERMÔMETRO*
[2-3 linhas sobre como os eventos de hoje afetam o cenário eleitoral de 2026. Quem sai fortalecido? Quem sai enfraquecido? O que a direita precisa fazer?]

━━━━━━━━━━━━━━━━
✝️ *PENSAMENTO DO DIA*
[1 versículo bíblico OU 1 frase de um líder conservador (Bolsonaro, Reagan, Thatcher, etc.) que se conecta com o momento político atual. Formato: "Frase" — Autor]

🔔 *Radar Patriota* — Informação sem censura, às 6h30 e às 18h.

Fontes: Jovem Pan, Gazeta do Povo, Pleno News, O Antagonista, CNN Brasil, G1 (para comparar narrativas). Foco prioritário em: política nacional, STF, economia, segurança pública, eleições 2026, liberdade de expressão, pauta conservadora.`

  try {
    const content = await geminiRequest(prompt, 'gemini-2.5-flash')
    return content.trim()
  } catch (err) {
    if (err.message.includes('503') || err.message.includes('UNAVAILABLE')) {
      console.log('gemini-2.5-flash sobrecarregado, usando gemini-2.5-flash-lite...')
      const content = await geminiRequest(prompt, 'gemini-2.5-flash-lite')
      return content.trim()
    }
    throw err
  }
}

module.exports = { generateDailyNews }
