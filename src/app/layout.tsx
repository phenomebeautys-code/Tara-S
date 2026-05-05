import type { Metadata, Viewport } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import './globals.css'

export const metadata: Metadata = {
  title: 'TARA-S',
  description: 'Your cycle companion — track, predict, book with confidence.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TARA-S',
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: '#C4614A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { navigator.serviceWorker.register('/sw.js') }`,
          }}
        />
      </head>
      <body>
        <NextIntlClientProvider>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
