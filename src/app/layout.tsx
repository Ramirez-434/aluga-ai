import type { Metadata } from 'next'
import './globals.css'
import AIChatbot from '@/components/AIChatbot'
import CompareDrawer from '@/components/CompareDrawer'
import CompareModal from '@/components/CompareModal'

export const metadata: Metadata = {
  title: 'Aluga AI',
  description: 'O portal definitivo de locação de imóveis direcionado por IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
        <AIChatbot />
        <CompareDrawer />
        <CompareModal />
      </body>
    </html>
  )
}
