import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AIChatbot from '@/components/AIChatbot'
import CompareDrawer from '@/components/CompareDrawer'
import CompareModal from '@/components/CompareModal'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Aluga AI — Imóveis em Gurupi e Natividade-TO',
  description: 'O portal definitivo de locação de imóveis com inteligência artificial em Gurupi e Natividade, Tocantins.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Aluga AI',
  },
  themeColor: '#3b82f6',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className={inter.className}>
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
