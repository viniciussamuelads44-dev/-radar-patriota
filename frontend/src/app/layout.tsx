import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Radar Patriota — Notícias Conservadoras no WhatsApp',
  description: 'Receba todo dia às 8h as principais notícias conservadoras do Brasil direto no seu WhatsApp por apenas R$9,90/mês.',
  keywords: 'notícias conservadoras, direita, Brasil, eleições 2026, WhatsApp',
  openGraph: {
    title: 'Radar Patriota — As notícias que a mídia tenta esconder',
    description: 'Briefing diário conservador direto no WhatsApp por apenas R$9,90/mês',
    type: 'website'
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
