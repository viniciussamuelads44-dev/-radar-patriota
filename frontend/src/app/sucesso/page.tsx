'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SuccessContent() {
  const params = useSearchParams()
  const already = params.get('already')

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <div className="text-7xl mb-6">🇧🇷</div>
        <h1 className="text-4xl font-black text-yellow-400 mb-4">
          {already ? 'Você já é Patriota!' : 'Bem-vindo ao Radar Patriota!'}
        </h1>
        <p className="text-gray-300 text-lg mb-8">
          {already
            ? 'Sua assinatura está ativa. Continue recebendo os briefings diários às 8h.'
            : 'Assinatura confirmada! Você vai receber uma mensagem de boas-vindas no WhatsApp em instantes.'}
        </p>

        {!already && (
          <div className="bg-[#111827] border border-green-500/30 rounded-2xl p-6 mb-8 text-left">
            <h3 className="font-bold text-green-400 mb-3">✅ O que acontece agora:</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>📲 Mensagem de boas-vindas no seu WhatsApp</li>
              <li>⏰ Primeiro briefing amanhã às 8h da manhã</li>
              <li>📰 As 5 notícias do dia + análise conservadora</li>
              <li>🇧🇷 Cobertura completa das eleições 2026</li>
            </ul>
          </div>
        )}

        <Link
          href="/"
          className="inline-block bg-yellow-500 hover:bg-yellow-400 text-black font-bold px-8 py-3 rounded-xl transition-all"
        >
          Voltar ao início
        </Link>
      </div>
    </main>
  )
}

export default function Sucesso() {
  return (
    <Suspense>
      <SuccessContent />
    </Suspense>
  )
}
