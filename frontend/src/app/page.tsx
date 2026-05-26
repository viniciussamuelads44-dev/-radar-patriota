'use client'

import { useState, useEffect } from 'react'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://radar-patriota-backend.fly.dev'
const ELEICOES_2026 = new Date('2026-10-04T08:00:00-03:00')

function useCountdown() {
  const [t, setT] = useState({ d: 0, h: 0, m: 0, s: 0, over: false })
  useEffect(() => {
    function tick() {
      const diff = ELEICOES_2026.getTime() - Date.now()
      if (diff <= 0) { setT({ d: 0, h: 0, m: 0, s: 0, over: true }); return }
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        over: false,
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return t
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl px-4 py-3 min-w-[68px]"
      style={{ background: 'rgba(234,179,8,0.07)', border: '1px solid rgba(234,179,8,0.25)' }}>
      <span className="text-3xl font-black tabular-nums text-yellow-400">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-gray-500 text-xs uppercase tracking-wide mt-0.5">{label}</span>
    </div>
  )
}

export default function Home() {
  const { d, h, m, s, over } = useCountdown()
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
    <main className="min-h-screen text-white" style={{ backgroundColor: '#060d1f' }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes flagFloat {
          0%,100% { transform: translateY(0px) rotate(-1deg); }
          50%      { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.8); opacity: 0; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #facc15, #fbbf24, #fff, #facc15, #fbbf24);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }
        .flag-float { animation: flagFloat 4s ease-in-out infinite; }
        .star-bg {
          background-image: radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.15) 0%, transparent 100%),
                            radial-gradient(1px 1px at 40% 70%, rgba(255,255,255,0.1) 0%, transparent 100%),
                            radial-gradient(1px 1px at 70% 40%, rgba(255,255,255,0.12) 0%, transparent 100%),
                            radial-gradient(1px 1px at 90% 10%, rgba(255,255,255,0.08) 0%, transparent 100%);
        }
        .card-hover { transition: transform 0.2s, border-color 0.2s; }
        .card-hover:hover { transform: translateY(-4px); border-color: rgba(234,179,8,0.4) !important; }
      `}</style>

      {/* Banner topo */}
      <div className="text-center text-black text-xs font-black py-2 px-4 tracking-widest uppercase"
        style={{ background: 'linear-gradient(90deg, #facc15, #f59e0b, #facc15)' }}>
        🇧🇷 Eleições 2026 se aproximam — A mídia esconde. O Radar entrega a verdade. 🇧🇷
      </div>

      {/* Navbar */}
      <nav className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto"
        style={{ borderBottom: '1px solid rgba(234,179,8,0.1)' }}>
        <div className="flex items-center gap-2">
          <span className="text-xl font-black text-yellow-400 tracking-widest">RADAR PATRIOTA</span>
        </div>
        <a href="#assinar"
          className="font-bold py-2 px-5 rounded-lg text-sm transition-all hover:scale-105 text-black"
          style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
          🇧🇷 Assinar R$9,90
        </a>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-6 text-center"
        style={{ background: 'radial-gradient(ellipse at 50% 0%, #0d2340 0%, #060d1f 65%)' }}>
        <div className="absolute inset-0 star-bg opacity-40 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">

          {/* Bandeira */}
          <div className="flag-float inline-block mb-6 text-8xl" style={{ filter: 'drop-shadow(0 0 32px rgba(34,197,94,0.5))' }}>
            🇧🇷
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full px-5 py-1.5 text-sm font-semibold"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }}>
              <span className="w-2 h-2 rounded-full animate-pulse bg-red-500" />
              A mídia mainstream NÃO quer que você saiba
            </div>
          </div>

          {/* Título */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-5 leading-tight">
            As notícias que{' '}
            <span className="text-red-500 line-through opacity-60">escondem</span>{' '}
            de você<br />
            <span className="shimmer-text">direto no seu WhatsApp</span>
          </h1>

          <p className="text-base md:text-lg text-gray-400 mb-4 max-w-2xl mx-auto leading-relaxed">
            Todo dia às <strong className="text-white">8h da manhã</strong>, você recebe as{' '}
            <strong className="text-white">5 principais notícias conservadoras</strong> do Brasil —
            política, STF, eleições 2026 e tudo que a grande mídia omite.
          </p>

          <div className="text-5xl font-black text-green-400 mb-1">
            R$9,90<span className="text-xl text-gray-500">/mês</span>
          </div>
          <p className="text-gray-600 text-sm mb-8">Menos que um café. Cancele quando quiser.</p>

          {/* Countdown eleições */}
          {!over && (
            <div className="mb-10">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">
                🗳️ Eleições 2026 em
              </p>
              <div className="flex gap-3 justify-center flex-wrap mb-4">
                <CountdownUnit value={d} label="Dias" />
                <CountdownUnit value={h} label="Horas" />
                <CountdownUnit value={m} label="Min" />
                <CountdownUnit value={s} label="Seg" />
              </div>
              <div className="inline-block rounded-2xl px-6 py-4 text-sm max-w-lg mx-auto"
                style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)' }}>
                <p className="font-bold mb-1 text-yellow-400">⚠️ A desinformação está aumentando</p>
                <p className="text-gray-400 leading-relaxed">
                  Com as eleições se aproximando, nunca foi tão importante ter uma fonte conservadora confiável.
                  O Radar Patriota te mantém informado <strong className="text-white">sem filtro ideológico de esquerda.</strong>
                </p>
              </div>
            </div>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#assinar"
              className="font-bold py-4 px-10 rounded-xl text-lg transition-all hover:scale-105 text-black inline-block"
              style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 0 32px rgba(34,197,94,0.35)' }}>
              🇧🇷 Assinar por R$9,90/mês →
            </a>
            <a href="#preview"
              className="py-4 px-8 rounded-xl text-lg transition-all inline-block"
              style={{ border: '1px solid rgba(234,179,8,0.35)', color: '#facc15' }}>
              Ver exemplo do briefing
            </a>
          </div>

          {/* Selos */}
          <div className="flex flex-wrap gap-4 justify-center mt-8 text-xs text-gray-500">
            {['🔒 Pagamento seguro', '📲 Recebe no WhatsApp', '❌ Sem fidelidade', '✅ Cancele quando quiser'].map(s => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6"
        style={{ borderTop: '1px solid rgba(234,179,8,0.1)', borderBottom: '1px solid rgba(234,179,8,0.1)', background: 'rgba(234,179,8,0.02)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: '💰', value: 'R$9,90', label: 'por mês — menos que um café por semana' },
            { icon: '⏰', value: '8h00', label: 'todo dia no WhatsApp, sem precisar buscar' },
            { icon: '📰', value: '5', label: 'notícias selecionadas com viés conservador' },
            { icon: '🎯', value: '100%', label: 'conteúdo conservador, sem pauta esquerdista' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className="text-3xl font-black mb-1 text-yellow-400">{s.value}</div>
              <div className="text-gray-500 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Por que o Radar Patriota */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto rounded-2xl p-8 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0d2340 0%, #0d1b2e 100%)', border: '1px solid rgba(234,179,8,0.18)' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
            style={{ background: 'linear-gradient(90deg, #facc15, #f59e0b, #facc15)' }} />
          <p className="text-center text-xs uppercase tracking-widest mb-2 text-yellow-400">Por que assinar</p>
          <h2 className="text-2xl md:text-3xl font-black text-center mb-8 text-white">
            O Brasil que a Globo não mostra
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🔴',
                title: 'Sem filtro esquerdista',
                desc: 'Nossas fontes: Jovem Pan, Gazeta do Povo, Pleno News, O Antagonista. Zero narrativa da grande mídia financiada por interesse político.',
              },
              {
                icon: '⚡',
                title: 'Antes de todo mundo',
                desc: 'Às 8h você já sabe o que aconteceu. Chegue em qualquer reunião, roda de amigos ou debate familiar informado e com argumentos sólidos.',
              },
              {
                icon: '🎯',
                title: 'Análise real, não opinião',
                desc: 'Cada edição traz análise política conservadora baseada em fatos: liberdade, família, soberania nacional e valores cristãos.',
              },
            ].map(item => (
              <div key={item.title} className="rounded-xl p-5 card-hover"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(234,179,8,0.1)' }}>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold mb-2 text-white">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest mb-1 text-yellow-400">⭐⭐⭐⭐⭐</p>
          <p className="text-gray-500 text-xs uppercase tracking-widest mb-8">O que dizem os patriotas</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                text: '"Todo dia às 8h já estou por dentro de tudo. Chego no trabalho e enquanto todo mundo vê Globo, eu já sei a versão real dos fatos."',
                name: 'Marcos T.',
                tag: '✅ Assinante há 3 meses',
              },
              {
                text: '"R$9,90 por mês é o melhor investimento que faço. Já indiquei pra toda a família. A análise conservadora é cirúrgica e sem politicamente correto."',
                name: 'Ana Paula R.',
                tag: '🇧🇷 Patriota ativa',
              },
              {
                text: '"Com as eleições 2026 chegando, nunca precisei tanto de uma fonte confiável. O Radar Patriota é a minha âncora de informação diária."',
                name: 'Roberto C.',
                tag: '⭐ Assinante premium',
              },
            ].map(t => (
              <div key={t.name} className="rounded-2xl p-6 text-left card-hover"
                style={{ background: '#0d1b2e', border: '1px solid rgba(234,179,8,0.1)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-yellow-400">⭐⭐⭐⭐⭐</span>
                  <span className="text-gray-500 text-xs">{t.tag}</span>
                </div>
                <p className="text-gray-300 mb-4 italic text-sm leading-relaxed">{t.text}</p>
                <p className="font-bold text-sm text-yellow-400">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona */}
      <section className="py-20 px-6"
        style={{ background: 'rgba(234,179,8,0.02)', borderTop: '1px solid rgba(234,179,8,0.08)' }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs uppercase tracking-widest mb-2 text-yellow-400">Como funciona</p>
          <h2 className="text-3xl font-black text-center mb-12 text-white">
            Da apuração ao seu WhatsApp
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                icon: '🔍',
                title: 'IA varre as principais fontes conservadoras',
                desc: 'Todo dia às 7h30, nossa IA analisa Jovem Pan, Gazeta do Povo, Pleno News e O Antagonista. Seleciona as 5 notícias mais relevantes do dia.',
              },
              {
                step: '02',
                icon: '🎯',
                title: 'Gera análise política conservadora',
                desc: 'Cada edição traz manchete de impacto, resumo das 5 do dia e análise sob perspectiva conservadora: liberdade, família e soberania.',
              },
              {
                step: '03',
                icon: '📲',
                title: 'Chega no seu WhatsApp às 8h',
                desc: 'Você acorda com tudo pronto. Sem precisar garimpar notícias, sem pauta de esquerda, sem fake news. Só a verdade que importa.',
              },
            ].map(item => (
              <div key={item.step} className="rounded-2xl p-6 card-hover"
                style={{ background: '#0d1b2e', border: '1px solid rgba(234,179,8,0.12)' }}>
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-5xl font-black mb-3 leading-none" style={{ color: 'rgba(234,179,8,0.2)' }}>
                  {item.step}
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview WhatsApp */}
      <section id="preview" className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-10 text-white">
          Como chega no seu <span className="text-yellow-400">WhatsApp</span>:
        </h2>
        <div className="max-w-sm mx-auto">
          <div className="bg-[#1a2332] border border-gray-700 rounded-3xl p-4 shadow-2xl">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-700">
              <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-lg">🇧🇷</div>
              <div>
                <div className="font-bold text-sm">Radar Patriota</div>
                <div className="text-xs text-green-400">● online</div>
              </div>
            </div>
            <div className="bg-[#0f1923] rounded-2xl rounded-tl-none p-4 text-xs text-gray-300 leading-relaxed whitespace-pre-line">
{`🇧🇷 *RADAR PATRIOTA*
📅 SEGUNDA-FEIRA, 4 DE OUTUBRO
━━━━━━━━━━━━━━━━

🔴 *MANCHETE DO DIA*
STF derruba votação do Congresso e reacende debate sobre independência dos poderes às vésperas das eleições.

━━━━━━━━━━━━━━━━
📋 *AS 5 DO DIA*

1️⃣ *STF CONTRA O CONGRESSO*
Ministra anula votação por 5x4 em decisão controversa...

2️⃣ *ECONOMIA SOB PRESSÃO*
Inflação bate meta pelo 3º mês seguido...

3️⃣ *SEGURANÇA PÚBLICA*
Estado registra 40% de aumento no crime organizado...

4️⃣ *FAMÍLIA E VALORES*
Projeto educacional aprovado em 12 estados...

5️⃣ *ELEIÇÕES 2026*
Pesquisa mostra crescimento do campo conservador...

━━━━━━━━━━━━━━━━
🎯 *ANÁLISE CONSERVADORA*
O Brasil conservador cresce. A narrativa da mídia paga não reflete a realidade das urnas...

🔔 *Radar Patriota* | R$9,90/mês`}
            </div>
            <div className="text-right text-xs text-gray-600 mt-2">08:00 ✓✓</div>
          </div>
        </div>
      </section>

      {/* Formulário de assinatura */}
      <section id="assinar" className="py-16 px-6"
        style={{ background: 'rgba(234,179,8,0.02)', borderTop: '1px solid rgba(234,179,8,0.08)' }}>
        <div className="max-w-md mx-auto">
          <p className="text-center text-xs uppercase tracking-widest mb-2 text-yellow-400">Comece agora</p>
          <h2 className="text-3xl font-black text-center mb-2 text-white">Assine o Radar Patriota</h2>
          <p className="text-gray-500 text-center mb-8 text-sm">
            <strong className="text-green-400">R$9,90/mês</strong> — Menos que um café. Cancele quando quiser.
          </p>

          <div className="bg-[#0d1b2e] border border-yellow-500/20 rounded-2xl p-8 shadow-2xl">
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
              style={{ background: 'linear-gradient(90deg, #facc15, #f59e0b, #facc15)' }} />
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text" placeholder="Seu nome completo"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                className="w-full bg-[#060d1f] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-colors"
              />
              <input
                type="tel" placeholder="WhatsApp: (11) 99999-9999"
                value={form.phone} onChange={e => setForm({ ...form, phone: formatPhone(e.target.value) })} required
                className="w-full bg-[#060d1f] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-colors"
              />
              <input
                type="email" placeholder="Seu melhor e-mail"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                className="w-full bg-[#060d1f] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-colors"
              />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit" disabled={loading}
                className="w-full font-black text-lg py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-black"
                style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 4px 24px rgba(34,197,94,0.35)' }}>
                {loading ? '⏳ Processando...' : '🇧🇷 ASSINAR POR R$9,90/MÊS →'}
              </button>
            </form>
            <p className="text-xs text-gray-600 mt-4 text-center">
              🔒 Pagamento seguro via MercadoPago • Cancele a qualquer momento
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-8 text-white">Dúvidas frequentes</h2>
        <div className="space-y-3">
          {[
            { q: 'Como recebo as notícias?', a: 'Diretamente no seu WhatsApp, todo dia às 8h da manhã. Sem precisar abrir nenhum aplicativo extra.' },
            { q: 'Posso cancelar quando quiser?', a: 'Sim, a qualquer momento direto no MercadoPago. Sem multa, sem burocracia, sem perguntas.' },
            { q: 'Quais fontes são usadas?', a: 'Jovem Pan, Gazeta do Povo, Pleno News, O Antagonista e outras fontes conservadoras confiáveis. Zero pauta de esquerda.' },
            { q: 'O pagamento é seguro?', a: 'Sim. Processado pelo MercadoPago, a plataforma de pagamentos mais usada e segura do Brasil.' },
          ].map((faq, i) => (
            <div key={i} className="bg-[#0d1b2e] border border-gray-800 rounded-xl p-5 card-hover">
              <h4 className="font-bold text-yellow-400 mb-1 text-sm">{faq.q}</h4>
              <p className="text-gray-400 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-6 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0d2340 0%, #0d0a1e 100%)', borderTop: '1px solid rgba(234,179,8,0.15)' }}>
        <div className="absolute inset-0 star-bg opacity-20 pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <style>{`
            @keyframes flagBounce {
              0%,100% { transform: scale(1) rotate(-2deg); filter: drop-shadow(0 0 12px rgba(34,197,94,0.5)); }
              50%      { transform: scale(1.1) rotate(2deg); filter: drop-shadow(0 0 28px rgba(34,197,94,0.9)); }
            }
            .flag-bounce { animation: flagBounce 2s ease-in-out infinite; }
          `}</style>
          <div className="flag-bounce text-7xl mb-4 inline-block">🇧🇷</div>
          <h2 className="text-3xl md:text-4xl font-black mb-4 text-white">
            Não perca as eleições 2026 sem<br />
            <span className="shimmer-text">a verdade do seu lado</span>
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            R$9,90/mês. Menos que um café por semana.<br />
            O Brasil conservador merece estar informado.
          </p>
          <a href="#assinar"
            className="inline-block font-bold py-4 px-10 rounded-xl text-lg transition-all hover:scale-105 text-black"
            style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 0 40px rgba(34,197,94,0.4)' }}>
            🇧🇷 ASSINAR AGORA — R$9,90/MÊS
          </a>
          <p className="text-gray-600 text-sm mt-4">Pagamento seguro • Cancele quando quiser • Sem fidelidade</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-6 text-center text-gray-600 text-sm"
        style={{ borderTop: '1px solid rgba(234,179,8,0.08)' }}>
        <div className="max-w-4xl mx-auto">
          <p className="font-black text-base mb-1 text-yellow-400">🇧🇷 Radar Patriota</p>
          <p className="mb-1">© 2026 Radar Patriota. Todos os direitos reservados.</p>
          <p className="mt-2 text-xs text-gray-700 max-w-xl mx-auto">
            O Radar Patriota é um serviço de curadoria de notícias conservadoras. Não nos responsabilizamos por decisões tomadas com base no conteúdo enviado.
          </p>
        </div>
      </footer>
    </main>
  )
}
