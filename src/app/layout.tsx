import type { Metadata, Viewport } from 'next'
import './globals.css'
import AIChatbot from '@/components/AIChatbot'
import CompareDrawer from '@/components/CompareDrawer'
import CompareModal from '@/components/CompareModal'
import MobileNav from '@/components/MobileNav'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Aluga AI — Imóveis em Gurupi e Natividade-TO',
  description: 'O portal definitivo de locação de imóveis com inteligência artificial em Gurupi e Natividade, Tocantins.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Aluga AI',
  },
}

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Preconnect for performance, then load Inter from Google Fonts via <link> (bypasses PostCSS) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>
        {children}
        <AIChatbot />
        <CompareDrawer />
        <CompareModal />
        <MobileNav />
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
