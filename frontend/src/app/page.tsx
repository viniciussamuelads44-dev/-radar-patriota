'use client'

import { useState, useEffect, useRef } from 'react'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://radar-patriota-backend.fly.dev'

const PLANS = [
  { id: 'monthly',    name: 'Mensal',     price: 12.90, priceStr: 'R$12,90', billedAs: 'R$12,90 cobrado todo mês', badge: null,           badgeColor: null,    savings: null },
  { id: 'quarterly',  name: 'Trimestral', price: 9.90,  priceStr: 'R$9,90',  billedAs: 'R$29,70 cobrado a cada 3 meses', badge: 'Mais Popular', badgeColor: '#22c55e', savings: 'Economize 23%' },
  { id: 'semiannual', name: 'Semestral',  price: 6.90,  priceStr: 'R$6,90',  billedAs: 'R$41,40 cobrado a cada 6 meses', badge: 'Melhor Valor',  badgeColor: '#facc15', savings: 'Economize 46%' },
]

export default function Home() {
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'quarterly' | 'semiannual'>('quarterly')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scrollPct, setScrollPct] = useState(0)
  const [showStickyBtn, setShowStickyBtn] = useState(true)

  const activePlan = PLANS.find(p => p.id === selectedPlan) || PLANS[1]

  useEffect(() => {
    const fn = () => {
      const el = document.documentElement
      setScrollPct((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100)
      const formEl = document.getElementById('assinar')
      if (formEl) {
        const rect = formEl.getBoundingClientRect()
        setShowStickyBtn(rect.bottom > window.innerHeight || rect.top > window.innerHeight)
      }
    }
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  const formatPhone = (v: string) => {
    const n = v.replace(/\D/g, '').slice(0, 11)
    if (n.length <= 2) return n
    if (n.length <= 7) return `(${n.slice(0, 2)}) ${n.slice(2)}`
    return `(${n.slice(0, 2)}) ${n.slice(2, 7)}-${n.slice(7)}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const res = await fetch(`${BACKEND_URL}/api/payment/subscribe`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, phone: form.phone.replace(/\D/g, ''), plan: selectedPlan })
      })
      const data = await res.json()
      if (data.error) { setError(data.error); return }
      if (data.alreadySubscribed) { window.location.href = '/sucesso?already=true'; return }
      if (data.init_point) window.location.href = data.init_point
    } catch { setError('Erro de conexão. Tente novamente.') }
    finally { setLoading(false) }
  }

  return (
    <main className="min-h-screen text-white" style={{ backgroundColor: '#060d1f' }}>
      <style>{`
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes flagFloat { 0%,100%{transform:translateY(0px) rotate(-1deg)} 50%{transform:translateY(-12px) rotate(1deg)} }
        @keyframes slideUp { from{transform:translateY(100px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulseGreen { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4)} 70%{box-shadow:0 0 0 12px rgba(34,197,94,0)} }
        .shimmer-text { background:linear-gradient(90deg,#facc15,#fbbf24,#fff,#facc15,#fbbf24);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:shimmer 3s linear infinite; }
        .flag-float { animation:flagFloat 4s ease-in-out infinite; }
        .star-bg { background-image:radial-gradient(1px 1px at 10% 20%,rgba(255,255,255,0.15) 0%,transparent 100%),radial-gradient(1px 1px at 40% 70%,rgba(255,255,255,0.1) 0%,transparent 100%),radial-gradient(1px 1px at 70% 40%,rgba(255,255,255,0.12) 0%,transparent 100%),radial-gradient(1px 1px at 90% 10%,rgba(255,255,255,0.08) 0%,transparent 100%); }
        .card-hover { transition:transform 0.2s,border-color 0.2s; }
        .card-hover:hover { transform:translateY(-4px);border-color:rgba(234,179,8,0.4) !important; }
        .fade-in { animation:fadeIn 0.6s ease forwards; }
        .pulse-btn { animation:pulseGreen 2s infinite; }
        .plan-card { transition:all 0.2s; }
        .plan-card:hover { transform:translateY(-2px); }
      `}</style>

      {/* Barra de progresso */}
      <div className="fixed top-0 left-0 z-50 h-0.5 bg-yellow-400 transition-all duration-150"
        style={{ width: `${scrollPct}%` }} />

      {/* Banner topo */}
      <div className="text-center text-black text-xs font-black py-2 px-4 tracking-widest uppercase"
        style={{ background: 'linear-gradient(90deg,#facc15,#f59e0b,#facc15)' }}>
        🇧🇷 Briefing conservador diário direto no seu WhatsApp — a partir de R$6,90/mês
      </div>

      {/* Navbar */}
      <nav className="px-6 py-4 flex items-center justify-between max-w-6xl mx-auto"
        style={{ borderBottom: '1px solid rgba(234,179,8,0.1)' }}>
        <span className="text-xl font-black text-yellow-400 tracking-widest">RADAR PATRIOTA</span>
        <a href="#assinar"
          className="font-bold py-2 px-5 rounded-lg text-sm transition-all hover:scale-105 text-black"
          style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
          🇧🇷 A partir de R$6,90
        </a>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-6 text-center"
        style={{ background: 'radial-gradient(ellipse at 50% 0%,#0d2340 0%,#060d1f 65%)' }}>
        <div className="absolute inset-0 star-bg opacity-40 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto">
          <div className="flag-float inline-block mb-6 text-8xl" style={{ filter: 'drop-shadow(0 0 32px rgba(34,197,94,0.5))' }}>🇧🇷</div>

          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 rounded-full px-5 py-1.5 text-sm font-semibold"
              style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.4)', color: '#facc15' }}>
              <span className="w-2 h-2 rounded-full animate-pulse bg-yellow-400" />
              Curadoria conservadora independente
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-5 leading-tight">
            Acorde sabendo o que<br />
            <span className="shimmer-text">a grande mídia não conta</span>
          </h1>

          <p className="text-base md:text-xl text-gray-400 mb-4 max-w-2xl mx-auto leading-relaxed">
            Todo dia às <strong className="text-white">8h da manhã</strong>, você recebe no WhatsApp um briefing
            conservador completo — sem pauta política, sem censura, sem algoritmo.
            <strong className="text-white"> Os fatos que importam, com a análise que você merece.</strong>
          </p>

          <div className="text-5xl font-black text-green-400 mb-1">
            A partir de R$6,90<span className="text-xl text-gray-500">/mês</span>
          </div>
          <p className="text-gray-600 text-sm mb-8">Escolha o plano ideal. Cancele quando quiser.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#assinar"
              className="font-bold py-4 px-10 rounded-xl text-lg transition-all hover:scale-105 text-black inline-block pulse-btn"
              style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 0 32px rgba(34,197,94,0.35)' }}>
              🇧🇷 Ver planos — a partir de R$6,90/mês →
            </a>
            <a href="#preview"
              className="py-4 px-8 rounded-xl text-lg transition-all inline-block"
              style={{ border: '1px solid rgba(234,179,8,0.35)', color: '#facc15' }}>
              Ver exemplo do briefing
            </a>
          </div>

          <div className="flex flex-wrap gap-4 justify-center mt-8 text-xs text-gray-500">
            {['🔒 Pagamento seguro', '📲 Recebe no WhatsApp', '❌ Sem fidelidade', '✅ Cancele quando quiser'].map(ss => (
              <span key={ss}>{ss}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Problema */}
      <section className="py-16 px-6" style={{ background: 'rgba(234,179,8,0.02)', borderTop: '1px solid rgba(234,179,8,0.1)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest mb-2 text-yellow-400">Você se identifica com isso?</p>
          <h2 className="text-2xl md:text-3xl font-black mb-8 text-white">
            Cansado de não ter tempo para se informar com profundidade?
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-left">
            {[
              '😤 Abre o noticiário e não sabe por onde começar — informação demais, contexto de menos',
              '🤔 Quer uma análise conservadora completa, mas leva horas garimpando em várias fontes',
              '😰 Sente que as notícias importantes chegam tarde ou sem o contexto que você precisa',
              '📱 Perde tempo no celular sem conseguir uma visão clara do que realmente aconteceu',
              '🎯 Quer acompanhar política nacional com perspectiva conservadora e valores cristãos',
              '😔 Precisa de uma fonte confiável que resuma o dia de forma objetiva e prática',
            ].map((p, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl p-4"
                style={{ background: 'rgba(234,179,8,0.04)', border: '1px solid rgba(234,179,8,0.1)' }}>
                <span className="text-lg flex-shrink-0">{p.split(' ')[0]}</span>
                <p className="text-gray-400 text-sm leading-relaxed">{p.split(' ').slice(1).join(' ')}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl p-6"
            style={{ background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <p className="text-green-400 font-bold text-lg mb-1">✅ O Radar Patriota resolve tudo isso.</p>
            <p className="text-gray-400 text-sm">Uma mensagem no WhatsApp todo dia às 8h. Sem garimpar, sem perder tempo, com análise conservadora completa.</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6"
        style={{ borderTop: '1px solid rgba(234,179,8,0.1)', borderBottom: '1px solid rgba(234,179,8,0.1)', background: 'rgba(234,179,8,0.02)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: '💰', value: 'R$6,90', label: 'por mês no plano semestral — menos que um café por semana' },
            { icon: '⏰', value: '8h00', label: 'todo dia no WhatsApp, sem precisar buscar' },
            { icon: '📰', value: '7', label: 'seções por edição: manchete, notícias, análise e mais' },
            { icon: '🎯', value: '100%', label: 'conteúdo conservador, curado diariamente por IA' },
          ].map(item => (
            <div key={item.label}>
              <div className="text-3xl mb-1">{item.icon}</div>
              <div className="text-3xl font-black mb-1 text-yellow-400">{item.value}</div>
              <div className="text-gray-500 text-sm">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* O que você recebe */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto rounded-2xl p-8 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#0d2340 0%,#0d1b2e 100%)', border: '1px solid rgba(234,179,8,0.18)' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
            style={{ background: 'linear-gradient(90deg,#facc15,#f59e0b,#facc15)' }} />
          <p className="text-center text-xs uppercase tracking-widest mb-2 text-yellow-400">O que você recebe</p>
          <h2 className="text-2xl md:text-3xl font-black text-center mb-8 text-white">
            7 seções em cada edição diária
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: '🔴', title: 'Manchete do Dia', desc: 'A notícia mais importante do dia em 2-3 linhas de alto impacto. O que está em jogo para o Brasil.' },
              { icon: '📋', title: 'As 5 do Dia', desc: 'Cinco notícias aprofundadas com contexto completo. Quem fez, o que significa, por que importa para você.' },
              { icon: '🕵️', title: 'O que pouca gente fala', desc: 'Um fato relevante que não ganhou destaque no noticiário do dia. Contexto que faz diferença.' },
              { icon: '🎯', title: 'Análise do Dia', desc: 'Análise política profunda sob perspectiva conservadora: liberdade, família, valores cristãos e soberania nacional.' },
              { icon: '🗳️', title: 'Termômetro Político', desc: 'Como os eventos de hoje impactam o cenário político nacional. Quem sai fortalecido e o que esperar.' },
              { icon: '✝️', title: 'Pensamento do Dia', desc: 'Um versículo bíblico ou frase de um líder conservador para começar o dia com reflexão.' },
            ].map(item => (
              <div key={item.title} className="rounded-xl p-5 card-hover flex gap-4"
                style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(234,179,8,0.1)' }}>
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-bold mb-1 text-white text-sm">{item.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview WhatsApp */}
      <section id="preview" className="max-w-4xl mx-auto px-6 py-16">
        <p className="text-center text-xs uppercase tracking-widest mb-2 text-yellow-400">Exemplo real</p>
        <h2 className="text-2xl font-bold text-center mb-10 text-white">
          Como chega no seu <span className="text-yellow-400">WhatsApp</span>:
        </h2>
        <div className="max-w-sm mx-auto">
          <div className="bg-[#1a2332] border border-gray-700 rounded-3xl p-4 shadow-2xl">
            <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-700">
              <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center text-lg">🇧🇷</div>
              <div>
                <div className="font-bold text-sm">Radar Patriota</div>
                <div className="text-xs text-gray-500">Briefing diário</div>
              </div>
            </div>
            <div className="bg-[#0f1923] rounded-2xl rounded-tl-none p-4 text-xs text-gray-300 leading-relaxed whitespace-pre-line">
{`🇧🇷 *RADAR PATRIOTA*
📅 TERÇA, 26 DE MAIO DE 2026
━━━━━━━━━━━━━━━━

🔴 *MANCHETE DO DIA*
Congresso debate projeto de lei sobre regulação de plataformas digitais — saiba os pontos principais.

━━━━━━━━━━━━━━━━
📋 *AS 5 DO DIA*

1️⃣ *VOTAÇÃO NO SENADO*
Projeto que altera regras de redes sociais vai à votação esta semana. Confira os principais pontos...

2️⃣ *ECONOMIA*
Relatório do Banco Central aponta queda na inflação de serviços pelo terceiro mês consecutivo...

━━━━━━━━━━━━━━━━
🕵️ *O QUE POUCA GENTE FALA*
Aprovação de emenda constitucional sobre propriedade rural passou com pouco destaque...

━━━━━━━━━━━━━━━━
🎯 *ANÁLISE DO DIA*
O cenário conservador nacional e os desdobramentos desta semana...

🔔 *Radar Patriota* | A partir de R$6,90/mês`}
            </div>
            <div className="text-right text-xs text-gray-600 mt-2">08:00 ✓✓</div>
          </div>
        </div>
      </section>

      {/* Por que assinar */}
      <section className="py-16 px-6" style={{ background: 'rgba(234,179,8,0.02)', borderTop: '1px solid rgba(234,179,8,0.08)' }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs uppercase tracking-widest mb-2 text-yellow-400">Por que assinar</p>
          <h2 className="text-2xl md:text-3xl font-black text-center mb-8 text-white">Análise conservadora diária, sem complicação</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🎯', title: 'Perspectiva conservadora', desc: 'Curadoria feita com foco em valores conservadores: liberdade, família, soberania nacional e fé. Análise política clara e objetiva.' },
              { icon: '⚡', title: 'Pronto às 8h todo dia', desc: 'Você acorda já informado. Chega preparado em qualquer reunião, debate familiar ou roda de amigos.' },
              { icon: '📲', title: 'Direto no WhatsApp', desc: 'Sem instalar app, sem cadastro complicado, sem navegar em sites. Uma mensagem completa por dia no seu WhatsApp.' },
            ].map(item => (
              <div key={item.title} className="rounded-xl p-5 card-hover"
                style={{ background: '#0d1b2e', border: '1px solid rgba(234,179,8,0.1)' }}>
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="font-bold mb-2 text-white">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Como funciona */}
      <section className="py-20 px-6" style={{ background: 'rgba(234,179,8,0.02)', borderTop: '1px solid rgba(234,179,8,0.08)' }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs uppercase tracking-widest mb-2 text-yellow-400">Como funciona</p>
          <h2 className="text-3xl font-black text-center mb-12 text-white">Da apuração ao seu WhatsApp</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '🔍', title: 'IA analisa as principais fontes conservadoras', desc: 'Todo dia às 7h30, nossa IA analisa dezenas de fontes conservadoras nacionais e seleciona as notícias mais relevantes do dia.' },
              { step: '02', icon: '🎯', title: 'Gera 7 seções de análise completa', desc: 'Manchete, 5 notícias aprofundadas, destaque especial, análise política, termômetro nacional e pensamento do dia.' },
              { step: '03', icon: '📲', title: 'Chega no seu WhatsApp às 8h', desc: 'Você acorda com tudo pronto. Sem precisar garimpar notícias ou perder tempo em vários sites. Uma mensagem completa.' },
            ].map(item => (
              <div key={item.step} className="rounded-2xl p-6 card-hover"
                style={{ background: '#0d1b2e', border: '1px solid rgba(234,179,8,0.12)' }}>
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-5xl font-black mb-3 leading-none" style={{ color: 'rgba(234,179,8,0.2)' }}>{item.step}</div>
                <h3 className="text-lg font-bold mb-2 text-white">{item.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-16 px-6" style={{ background: 'rgba(234,179,8,0.02)', borderTop: '1px solid rgba(234,179,8,0.08)' }}>
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs uppercase tracking-widest mb-2 text-yellow-400">Quem já assina</p>
          <h2 className="text-2xl md:text-3xl font-black text-center mb-8 text-white">
            O que os leitores estão dizendo
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'João Paulo M.',
                city: 'São Paulo — SP',
                stars: '★★★★★',
                text: '"Assino há 3 meses e não consigo mais imaginar minha manhã sem o Radar. Chego ao trabalho informado, com contexto, sem ter gastado 1 hora garimpando notícias. Vale cada centavo."',
              },
              {
                name: 'Carla Rodrigues',
                city: 'Belo Horizonte — MG',
                stars: '★★★★★',
                text: '"Finalmente uma análise com os valores que acredito — família, fé e liberdade. É diferente de tudo que eu lia antes. Recomendei para o meu marido e para os meus pais."',
              },
              {
                name: 'Marcos Silva',
                city: 'Goiânia — GO',
                stars: '★★★★★',
                text: '"Todo dia às 8h em ponto chega no meu WhatsApp. Já usei para me preparar para debates na minha comunidade. A análise conservadora é profunda e honesta."',
              },
            ].map((t, i) => (
              <div key={i} className="rounded-xl p-6 card-hover flex flex-col gap-4"
                style={{ background: '#0d1b2e', border: '1px solid rgba(234,179,8,0.12)' }}>
                <p className="text-yellow-400 text-sm font-bold">{t.stars}</p>
                <p className="text-gray-300 text-sm leading-relaxed italic flex-1">{t.text}</p>
                <div>
                  <p className="font-bold text-white text-sm">{t.name}</p>
                  <p className="text-gray-600 text-xs">{t.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credibilidade / Missão */}
      <section className="py-14 px-6" style={{ borderTop: '1px solid rgba(234,179,8,0.08)' }}>
        <div className="max-w-4xl mx-auto rounded-2xl p-8"
          style={{ background: 'linear-gradient(135deg,#0d2340 0%,#0a1520 100%)', border: '1px solid rgba(234,179,8,0.18)' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
            style={{ background: 'linear-gradient(90deg,#facc15,#f59e0b,#facc15)' }} />
          <p className="text-center text-xs uppercase tracking-widest mb-2 text-yellow-400">Nossa missão</p>
          <h2 className="text-2xl md:text-3xl font-black text-center mb-4 text-white">
            Informação conservadora,<br />sem pauta, sem censura
          </h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto text-sm leading-relaxed mb-8">
            O Radar Patriota nasceu da frustração com a grande mídia. Criado por brasileiros que valorizam
            família, liberdade e fé — entregamos análise diária sem vínculo com partido, sem patrocinador
            político, sem agenda oculta. Só os fatos que importam, com a perspectiva que você merece.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🚫', label: 'Sem vínculo político', desc: 'Independente de partidos e patrocinadores' },
              { icon: '✝️', label: 'Valores cristãos', desc: 'Família, fé e soberania como bússola' },
              { icon: '🔒', label: 'Seus dados protegidos', desc: 'Nunca vendemos ou compartilhamos' },
              { icon: '📲', label: 'Só no WhatsApp', desc: 'Sem rastreio, sem algoritmo, sem feed' },
            ].map((item, i) => (
              <div key={i} className="text-center rounded-xl p-4"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(234,179,8,0.08)' }}>
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="font-bold text-white text-xs mb-1">{item.label}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Garantia */}
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto rounded-2xl p-8 text-center"
          style={{ background: 'linear-gradient(135deg,#0d2340,#0a1f35)', border: '2px solid rgba(34,197,94,0.3)' }}>
          <div className="text-6xl mb-4">🛡️</div>
          <h3 className="text-2xl font-black mb-3 text-white">Satisfação Garantida</h3>
          <p className="text-gray-400 leading-relaxed mb-4">
            Se nos primeiros <strong className="text-white">7 dias</strong> você não ficar satisfeito com a qualidade do briefing,
            cancele sem burocracia pelo MercadoPago. <strong className="text-green-400">Sem perguntas, sem multa.</strong>
          </p>
          <p className="text-sm text-gray-500">Cancele quando quiser, diretamente pelo MercadoPago.</p>
        </div>
      </section>

      {/* FORMULÁRIO + PLANOS */}
      <section id="assinar" className="py-16 px-6" style={{ background: 'rgba(234,179,8,0.02)', borderTop: '1px solid rgba(234,179,8,0.08)' }}>
        <div className="max-w-lg mx-auto">
          <p className="text-center text-xs uppercase tracking-widest mb-2 text-yellow-400">Escolha seu plano</p>
          <h2 className="text-3xl font-black text-center mb-2 text-white">Assine o Radar Patriota</h2>
          <p className="text-gray-500 text-center mb-4 text-sm">
            Quanto mais longo o plano, <strong className="text-green-400">maior o desconto</strong>. Cancele quando quiser.
          </p>

          <div className="mb-6 rounded-xl py-3 px-4 text-center text-sm"
            style={{ background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.15)' }}>
            💡 <span className="text-gray-400">O valor cobrado é <strong className="text-white">simbólico</strong> — serve apenas para cobrir os custos do sistema de análise, curadoria e envio das edições diárias.</span>
          </div>

          {/* Seletor de planos */}
          <div className="space-y-3 mb-6">
            {PLANS.map(plan => (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPlan(plan.id as 'monthly' | 'quarterly' | 'semiannual')}
                className="plan-card relative w-full rounded-xl p-4 text-left border-2"
                style={{
                  background: selectedPlan === plan.id ? 'rgba(34,197,94,0.08)' : 'rgba(0,0,0,0.3)',
                  borderColor: selectedPlan === plan.id ? '#22c55e' : 'rgba(75,85,99,0.5)',
                }}
              >
                {plan.badge && (
                  <span className="absolute -top-2.5 right-3 text-xs font-black px-2.5 py-0.5 rounded-full"
                    style={{ background: plan.badgeColor!, color: '#000' }}>
                    {plan.badge}
                  </span>
                )}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: selectedPlan === plan.id ? '#22c55e' : '#4b5563' }}>
                      {selectedPlan === plan.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white text-sm">{plan.name}</p>
                      <p className="text-gray-500 text-xs truncate">{plan.billedAs}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-green-400 text-xl leading-none">
                      {plan.priceStr}<span className="text-sm text-gray-400 font-normal">/mês</span>
                    </p>
                    {plan.savings && (
                      <p className="text-yellow-400 text-xs font-bold mt-0.5">{plan.savings}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Formulário */}
          <div className="bg-[#0d1b2e] border border-yellow-500/20 rounded-2xl p-8 shadow-2xl relative">
            <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl"
              style={{ background: 'linear-gradient(90deg,#facc15,#f59e0b,#facc15)' }} />

            <p className="text-center text-sm text-gray-400 mb-5">
              Plano selecionado: <strong className="text-white">{activePlan.name}</strong> — <strong className="text-green-400">{activePlan.priceStr}/mês</strong>
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Seu nome completo"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                className="w-full bg-[#060d1f] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-colors" />
              <input type="tel" placeholder="WhatsApp: (11) 99999-9999"
                value={form.phone} onChange={e => setForm({ ...form, phone: formatPhone(e.target.value) })} required
                className="w-full bg-[#060d1f] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-colors" />
              <input type="email" placeholder="Seu melhor e-mail"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required
                className="w-full bg-[#060d1f] border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-colors" />
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button type="submit" disabled={loading}
                className="w-full font-black text-lg py-4 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-black pulse-btn"
                style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 4px 24px rgba(34,197,94,0.35)' }}>
                {loading ? '⏳ Processando...' : `🇧🇷 ASSINAR — ${activePlan.priceStr}/MÊS →`}
              </button>
            </form>
            <p className="text-xs text-gray-600 mt-4 text-center">🔒 Pagamento seguro via MercadoPago • Cancele a qualquer momento</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-center mb-8 text-white">Dúvidas frequentes</h2>
        <div className="space-y-3">
          {[
            { q: 'Como recebo as notícias?', a: 'Diretamente no seu WhatsApp, todo dia às 8h da manhã. Sem precisar abrir nenhum aplicativo extra.' },
            { q: 'Qual a diferença entre os planos?', a: 'O conteúdo é idêntico nos 3 planos. A diferença é apenas o preço: quanto mais longo o período, maior o desconto. Mensal R$12,90 | Trimestral R$9,90/mês | Semestral R$6,90/mês.' },
            { q: 'Posso cancelar quando quiser?', a: 'Sim, a qualquer momento direto no MercadoPago. Sem multa, sem burocracia, sem perguntas.' },
            { q: 'Quais fontes são usadas?', a: 'Fontes conservadoras nacionais confiáveis. Nossa IA seleciona e organiza as notícias mais relevantes do dia.' },
            { q: 'O pagamento é seguro?', a: 'Sim. Processado pelo MercadoPago, a plataforma de pagamentos mais usada e segura do Brasil.' },
            { q: 'São quantas mensagens por dia?', a: 'Uma única mensagem completa às 8h com todas as 7 seções. Sem spam, sem interrupções no seu dia.' },
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
        style={{ background: 'linear-gradient(160deg,#0d2340 0%,#0d0a1e 100%)', borderTop: '1px solid rgba(234,179,8,0.15)' }}>
        <div className="absolute inset-0 star-bg opacity-20 pointer-events-none" />
        <div className="relative max-w-2xl mx-auto">
          <div className="text-7xl mb-4">🇧🇷</div>
          <h2 className="text-3xl md:text-4xl font-black mb-4 text-white">
            Chega de depender da mídia<br />
            <span className="shimmer-text">que não representa você</span>
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Por menos de um café por semana, acorde todo dia informado com<br />
            análise conservadora, independente e honesta — direto no WhatsApp.
          </p>
          <a href="#assinar"
            className="inline-block font-bold py-4 px-10 rounded-xl text-lg transition-all hover:scale-105 text-black pulse-btn"
            style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)', boxShadow: '0 0 40px rgba(34,197,94,0.4)' }}>
            🇧🇷 VER PLANOS — A PARTIR DE R$6,90/MÊS
          </a>
          <p className="text-gray-600 text-sm mt-4">Pagamento seguro • Cancele quando quiser • 3 planos disponíveis</p>
        </div>
      </section>

      {/* Botão sticky */}
      {showStickyBtn && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 fade-in"
          style={{ background: 'rgba(6,13,31,0.97)', borderTop: '1px solid rgba(234,179,8,0.2)', backdropFilter: 'blur(8px)' }}>
          <div className="max-w-md mx-auto flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 leading-tight">Briefing conservador diário no WhatsApp</p>
              <p className="text-xs text-yellow-400 font-bold leading-tight">A partir de R$6,90/mês</p>
            </div>
            <a href="#assinar"
              className="flex-shrink-0 font-black text-sm py-3 px-6 rounded-xl text-black transition-all hover:scale-105 pulse-btn"
              style={{ background: 'linear-gradient(135deg,#22c55e,#16a34a)' }}>
              🇧🇷 A partir de R$6,90 →
            </a>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-10 pb-24 px-6 text-center text-gray-600 text-sm"
        style={{ borderTop: '1px solid rgba(234,179,8,0.08)' }}>
        <div className="max-w-4xl mx-auto">
          <p className="font-black text-base mb-1 text-yellow-400">🇧🇷 Radar Patriota</p>
          <p className="mb-1">© 2026 Radar Patriota. Todos os direitos reservados.</p>
          <p className="mt-2 text-xs text-gray-700 max-w-xl mx-auto">
            O Radar Patriota é um serviço independente de curadoria de notícias conservadoras. Não nos responsabilizamos por decisões tomadas com base no conteúdo enviado.
          </p>
          <p className="mt-3 text-xs text-gray-600">
            Operado por Vinicius Samuel — Contato:{' '}
            <a href="mailto:viniciussamuelads44@gmail.com" className="text-yellow-500 underline">
              viniciussamuelads44@gmail.com
            </a>
            {' '}·{' '}
            <a href="https://wa.me/5531935013167" target="_blank" rel="noopener noreferrer" className="text-yellow-500 underline">
              WhatsApp (31) 93501-3167
            </a>
          </p>
          <div className="mt-3 flex justify-center gap-4 text-xs">
            <a href="/privacidade" className="text-yellow-600 underline hover:text-yellow-400">Política de Privacidade</a>
            <a href="/cancelar" className="text-yellow-600 underline hover:text-yellow-400">Cancelar Assinatura</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
