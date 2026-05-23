'use client'

import { useState } from 'react'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://radar-patriota-backend.onrender.com'

export default function Home() {
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatPhone = (value: string) => {
    const n = value.replace(/\D/g, '').slice(0, 11)
    if (n.length <= 2) return n
    if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`
    return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${BACKEND_URL}/api/payment/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, phone: form.phone.replace(/\D/g, '') })
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      if (data.alreadySubscribed) { window.location.href = '/sucesso?already=true'; return }
      if (data.init_point) window.location.href = data.init_point
    } catch {
      setError('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">

      {/* Header */}
      <header className="border-b border-yellow-500/20 py-4">
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-3">
          <span className="text-2xl">🇧🇷</span>
          <div>
            <div className="text-xl font-black text-yellow-400 tracking-widest">RADAR PATRIOTA</div>
            <div className="text-xs text-gray-500 uppercase tracking-widest">O briefing diário conservador</div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-14 text-center">
        <div className="inline-flex items-center gap-2 bg-red-900/40 border border-red-500/40 text-red-400 text-xs font-bold px-4 py-2 rounded-full mb-8 uppercase tracking-widest">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          Eleições 2026 — Fique por dentro de tudo
        </div>

        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
          As notícias que a{' '}
          <span className="text-red-500 line-through opacity-70">mídia</span>{' '}
          <span className="text-yellow-400">tenta esconder</span>
          <br />
          <span className="text-3xl md:text-4xl text-gray-300 font-bold">direto no seu WhatsApp</span>
        </h1>

        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-6">
          Todo dia às <strong className="text-white">8h da manhã</strong> você recebe as{' '}
          <strong className="text-white">5 principais notícias conservadoras</strong> do Brasil,
          análise política e o que está acontecendo de verdade.
        </p>

        <div className="text-4xl font-black text-green-400 mb-1">
          R$9,90<span className="text-lg text-gray-500">/mês</span>
        </div>
        <p className="text-gray-600 text-sm mb-12">Menos que um café. Cancele quando quiser.</p>

        {/* Form */}
        <div id="assinar" className="bg-[#111827] border border-yellow-500/20 rounded-2xl p-8 max-w-md mx-auto shadow-2xl">
          <h2 className="text-lg font-bold text-yellow-400 mb-6">Assine agora — comece amanhã!</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text" placeholder="Seu nome completo"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
              className="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-colors"
            />
            <input
              type="tel" placeholder="WhatsApp: (11) 99999-9999"
              value={form.phone} onChange={e => setForm({ ...form, phone: formatPhone(e.target.value) })} required
              className="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-colors"
            />
            <input
              type="email" placeholder="Seu melhor e-mail"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
              className="w-full bg-[#1f2937] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-colors"
            />
            {error && <p className="text-red-400 text-sm text-left">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-lg py-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? '⏳ Processando...' : '🇧🇷 ASSINAR POR R$9,90/MÊS →'}
            </button>
          </form>
          <p className="text-xs text-gray-600 mt-4 text-center">
            🔒 Pagamento seguro via MercadoPago • Cancele a qualquer momento
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10 text-white">O que você recebe <span className="text-yellow-400">todo dia</span>:</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '📰', title: '5 Notícias Selecionadas', desc: 'As principais manchetes do dia filtradas com viés conservador, sem a narrativa da mídia paga.' },
            { icon: '🎯', title: 'Análise Política Real', desc: 'Interpretação conservadora dos fatos. Entenda o que está acontecendo de verdade no Brasil.' },
            { icon: '⚡', title: 'Todo dia às 8h', desc: 'Antes de qualquer reunião, você já está informado. Sem precisar ficar garimpando notícias.' }
          ].map((b, i) => (
            <div key={i} className="bg-[#111827] border border-gray-800 hover:border-yellow-500/30 rounded-2xl p-6 text-center transition-colors">
              <div className="text-4xl mb-4">{b.icon}</div>
              <h3 className="font-bold text-white mb-2">{b.title}</h3>
              <p className="text-gray-500 text-sm">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Numbers */}
      <section className="bg-[#0d1525] py-12 border-y border-gray-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { n: 'R$9,90', label: 'por mês — menos que um café por semana' },
              { n: '8h00', label: 'todo dia no WhatsApp — sem precisar buscar' },
              { n: '100%', label: 'conteúdo conservador, sem viés de esquerda' }
            ].map((s, i) => (
              <div key={i}>
                <div className="text-4xl font-black text-yellow-400">{s.n}</div>
                <p className="text-gray-500 text-sm mt-2">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10">Como chega no seu WhatsApp:</h2>
        <div className="max-w-sm mx-auto">
          <div className="bg-[#1a2332] border border-gray-700 rounded-3xl p-4">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-700">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-lg">🇧🇷</div>
              <div>
                <div className="font-bold text-sm">Radar Patriota</div>
                <div className="text-xs text-green-400">online</div>
              </div>
            </div>
            <div className="bg-[#0f1923] rounded-2xl rounded-tl-none p-4 text-xs text-gray-300 leading-relaxed whitespace-pre-line">
{`🇧🇷 *RADAR PATRIOTA*
📅 SEXTA-FEIRA, 23 DE MAIO
━━━━━━━━━━━━━━━━

🔴 *MANCHETE DO DIA*
STF posta polêmica às vésperas das eleições e reacende debate sobre independência do Judiciário...

━━━━━━━━━━━━━━━━
📋 *AS 5 DO DIA*

1️⃣ *CONGRESSO DERRUBA VETO*
Câmara e Senado derrubam veto em votação histórica...

2️⃣ *INFLAÇÃO ACIMA DO ESPERADO*
IPCA surpreende e pressiona economia...

[+ 3 notícias]

━━━━━━━━━━━━━━━━
🎯 *ANÁLISE CONSERVADORA*
O cenário político mostra uma polarização crescente...

🔔 *Radar Patriota* | R$9,90/mês`}
            </div>
            <div className="text-right text-xs text-gray-600 mt-2">08:00 ✓✓</div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-center mb-8">Dúvidas frequentes</h2>
        <div className="space-y-3">
          {[
            { q: 'Como recebo as notícias?', a: 'Diretamente no seu WhatsApp, todo dia às 8h da manhã. Sem precisar abrir aplicativo.' },
            { q: 'Como cancelo a assinatura?', a: 'A qualquer momento, direto no MercadoPago ou respondendo "CANCELAR" no WhatsApp. Sem burocracia.' },
            { q: 'Quais fontes são usadas?', a: 'Jovem Pan, Gazeta do Povo, Pleno News, O Antagonista e outras fontes conservadoras confiáveis.' },
            { q: 'O pagamento é seguro?', a: 'Sim. Processado pelo MercadoPago, a plataforma de pagamentos mais segura e usada do Brasil.' }
          ].map((faq, i) => (
            <div key={i} className="bg-[#111827] border border-gray-800 rounded-xl p-5">
              <h4 className="font-bold text-yellow-400 mb-1 text-sm">{faq.q}</h4>
              <p className="text-gray-400 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#0d1525] border-t border-gray-800 py-16 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-4xl font-black mb-3">
            Comece agora por <span className="text-yellow-400">R$9,90</span>
          </h2>
          <p className="text-gray-500 mb-8">Junte-se aos patriotas que já estão informados de verdade.</p>
          <button
            onClick={() => document.getElementById('assinar')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-green-500 hover:bg-green-400 text-black font-black text-xl px-12 py-5 rounded-xl transition-all transform hover:scale-105"
          >
            🇧🇷 ASSINAR AGORA — R$9,90/MÊS
          </button>
          <p className="text-xs text-gray-700 mt-4">Pagamento seguro • Cancele quando quiser</p>
        </div>
      </section>

      <footer className="border-t border-gray-900 py-6 text-center text-gray-700 text-sm">
        © 2026 Radar Patriota. Todos os direitos reservados.
      </footer>
    </main>
  )
}
