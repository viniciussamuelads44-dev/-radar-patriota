'use client'

import { useState } from 'react'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://radar-patriota-backend.fly.dev'

export default function EleitoralPage() {
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatPhone = (v: string) => {
    const n = v.replace(/\D/g, '').slice(0, 11)
    if (n.length <= 2) return n
    if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`
    return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${BACKEND_URL}/api/payment/subscribe-eleitoral`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, phone: form.phone.replace(/\D/g, '') })
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      if (data.alreadySubscribed) { window.location.href = '/eleitoral/sucesso?already=true'; return }
      if (data.init_point) window.location.href = data.init_point
    } catch { setError('Erro de conexão. Tente novamente.') }
    finally { setLoading(false) }
  }

  return (
    <main className="min-h-screen text-white" style={{ backgroundColor: '#060d1f' }}>

      {/* Hero */}
      <section className="text-center px-4 pt-16 pb-12">
        <div className="inline-block bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-wider">
          🗳️ Eleições 2026 — Acesso por 3 meses
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6" style={{ maxWidth: 800, margin: '0 auto 24px' }}>
          Saiba <span style={{ color: '#facc15' }}>antes de todos</span><br />o que vai acontecer<br />em outubro de 2026
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-8" style={{ maxWidth: 580, margin: '0 auto 32px' }}>
          Todo dia às 7h30, no seu WhatsApp: pesquisas, alianças, movimentos de bastidor e análise estratégica da corrida presidencial. Sem filtro.
        </p>
        <a href="#assinar" className="inline-block font-bold text-black text-xl px-10 py-4 rounded-xl shadow-lg"
          style={{ backgroundColor: '#facc15' }}>
          Quero acompanhar por R$22,22 →
        </a>
        <p className="text-gray-500 text-sm mt-3">Pagamento único • 3 meses de acesso • Cancela quando quiser</p>
      </section>

      {/* O que você recebe */}
      <section className="px-4 py-14" style={{ backgroundColor: '#0a1628' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            O que chega no seu WhatsApp todo dia
          </h2>
          <div className="space-y-4">
            {[
              ['📊', 'Termômetro das pesquisas', 'Datafolha, Quaest, Atlas Intel — números reais com análise do que significam.'],
              ['🎯', 'Os 3 movimentos do dia', 'O que cada candidato fez, disse ou deixou de fazer — e o impacto no placar.'],
              ['🤝', 'Alianças e bastidores', 'O que está sendo costurado nos bastidores antes de sair na imprensa.'],
              ['📉', 'Quem caiu e quem subiu', 'Um placar rápido de quem ganhou e quem perdeu pontos no dia.'],
              ['🧠', 'Análise estratégica', 'O que a direita precisa fazer para vencer. Direto e sem rodeios.'],
            ].map(([icon, title, desc]) => (
              <div key={title as string} className="flex gap-4 items-start p-4 rounded-xl" style={{ backgroundColor: '#0f1f3d' }}>
                <span className="text-2xl">{icon}</span>
                <div>
                  <div className="font-bold text-white">{title as string}</div>
                  <div className="text-gray-400 text-sm mt-1">{desc as string}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Prova social */}
      <section className="px-4 py-14">
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-300">O que dizem os leitores do Radar Patriota</h2>
          <div className="space-y-4">
            {[
              ['Marcos A., empresário', 'Em 5 minutos por dia fico mais informado que assistindo 1h de jornal. Sem a narrativa do PT.'],
              ['Ana C., professora', 'Finalmente uma análise eleitoral que não me trata como idiota. Vale muito os R$22,22.'],
              ['Rodrigo F., advogado', 'Todo dia minha mulher me pede pra contar o que veio no briefing. Compartilhamos a conta.'],
            ].map(([name, text]) => (
              <div key={name as string} className="p-5 rounded-xl" style={{ backgroundColor: '#0a1628', borderLeft: '3px solid #facc15' }}>
                <p className="text-gray-300 italic mb-3">&ldquo;{text as string}&rdquo;</p>
                <p className="text-yellow-400 text-sm font-semibold">{name as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Formulário */}
      <section id="assinar" className="px-4 py-16" style={{ backgroundColor: '#0a1628' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div className="text-center mb-8">
            <div className="text-5xl font-black text-yellow-400 mb-1">R$22,22</div>
            <div className="text-gray-400">pagamento único — acesso até outubro/2026</div>
            <div className="text-green-400 text-sm mt-1">≈ R$7,41/mês pela análise mais completa do Brasil</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text" required placeholder="Seu nome"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg text-white text-base outline-none"
              style={{ backgroundColor: '#0f1f3d', border: '1px solid #1e3a6e' }}
            />
            <input
              type="tel" required placeholder="WhatsApp (11) 99999-9999"
              value={form.phone} onChange={e => setForm(f => ({ ...f, phone: formatPhone(e.target.value) }))}
              className="w-full px-4 py-3 rounded-lg text-white text-base outline-none"
              style={{ backgroundColor: '#0f1f3d', border: '1px solid #1e3a6e' }}
            />
            <input
              type="email" required placeholder="Seu e-mail"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-4 py-3 rounded-lg text-white text-base outline-none"
              style={{ backgroundColor: '#0f1f3d', border: '1px solid #1e3a6e' }}
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full font-black text-black text-lg py-4 rounded-xl shadow-lg transition"
              style={{ backgroundColor: loading ? '#a0a0a0' : '#facc15', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Aguarde...' : '🗳️ Quero o Briefing Eleitoral — R$22,22'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-xs mt-4">
            Pagamento seguro via Mercado Pago • Pix ou cartão • Você receberá o primeiro briefing amanhã às 7h30
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-4 py-14">
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 className="text-2xl font-bold text-center mb-8">Perguntas frequentes</h2>
          <div className="space-y-5">
            {[
              ['Por quanto tempo tenho acesso?', 'Seu acesso começa na confirmação do pagamento e vai até outubro de 2026 — mês das eleições presidenciais.'],
              ['É cobrado todo mês?', 'Não. R$22,22 uma única vez. Sem renovação automática, sem surpresas.'],
              ['Qual é a diferença para o Radar Patriota?', 'O Radar Patriota cobre todo o noticiário conservador. O Briefing Eleitoral é 100% focado na corrida de 2026 — candidatos, pesquisas, alianças e estratégia.'],
              ['Como recebo?', 'Direto no WhatsApp que você cadastrar, todo dia às 7h30.'],
              ['Posso cancelar?', 'Como é pagamento único, não há assinatura pra cancelar. O acesso expira automaticamente em outubro/2026.'],
            ].map(([q, a]) => (
              <div key={q as string}>
                <div className="font-bold text-white mb-1">{q as string}</div>
                <div className="text-gray-400 text-sm">{a as string}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="text-center px-4 py-16" style={{ backgroundColor: '#0a1628' }}>
        <h2 className="text-3xl font-black mb-4">2026 vai ser a eleição mais importante da sua vida.</h2>
        <p className="text-gray-300 mb-8">Acompanhe cada movimento com análise que a grande mídia não vai te dar.</p>
        <a href="#assinar" className="inline-block font-bold text-black text-xl px-10 py-4 rounded-xl shadow-lg"
          style={{ backgroundColor: '#facc15' }}>
          Garantir acesso por R$22,22 →
        </a>
      </section>

    </main>
  )
}
