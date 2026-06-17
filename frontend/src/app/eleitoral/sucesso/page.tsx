'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function SucessoContent() {
  const params = useSearchParams()
  const already = params.get('already') === 'true'

  return (
    <main className="min-h-screen flex items-center justify-center text-white px-4" style={{ backgroundColor: '#060d1f' }}>
      <div className="text-center" style={{ maxWidth: 520 }}>
        <div className="text-7xl mb-6">{already ? '✅' : '🎉'}</div>
        <h1 className="text-3xl font-black mb-4">
          {already ? 'Você já é assinante!' : 'Pagamento confirmado!'}
        </h1>
        <p className="text-gray-300 text-lg mb-6">
          {already
            ? 'Seu acesso ao Briefing Eleitoral 2026 já está ativo.'
            : 'Bem-vindo ao Briefing Eleitoral 2026. Você receberá uma mensagem de confirmação no WhatsApp em instantes.'}
        </p>
        <div className="p-5 rounded-xl mb-8" style={{ backgroundColor: '#0a1628', border: '1px solid #1e3a6e' }}>
          <p className="text-yellow-400 font-bold mb-2">🗳️ O que acontece agora</p>
          <ul className="text-gray-300 text-sm space-y-2 text-left">
            <li>• Você receberá uma mensagem de boas-vindas no WhatsApp</li>
            <li>• O primeiro briefing chega amanhã às 7h30</li>
            <li>• Seu acesso vai até outubro/2026</li>
          </ul>
        </div>
        <a href="/eleitoral" className="text-yellow-400 text-sm underline">
          ← Voltar para a página
        </a>
      </div>
    </main>
  )
}

export default function SucessoPage() {
  return (
    <Suspense>
      <SucessoContent />
    </Suspense>
  )
}
