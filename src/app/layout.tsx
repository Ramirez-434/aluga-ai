import type { Metadata } from 'next'
import './globals.css'
import AIChatbot from '@/components/AIChatbot'
import CompareDrawer from '@/components/CompareDrawer'
import CompareModal from '@/components/CompareModal'
import { Toaster } from 'sonner'

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
        <Toaster 
          position="bottom-right"
          richColors
          toastOptions={{
            style: { borderRadius: '14px', fontSize: '14px' }
          }}
        />
      </body>
    </html>
  )
}
