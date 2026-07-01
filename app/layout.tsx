import type { Metadata } from 'next'
import { Hanken_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'
import Providers from './providers'
import { serverFetch } from '@/api/server'
import type { Settings, SingleResponse } from '@/api/types'
import '@/index.css'

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  let favicon = '/assets/logo-vertical-blue.png'
  try {
    const res = await serverFetch<SingleResponse<Settings>>('/api/v1/settings')
    if (res.data?.favicon_url) favicon = res.data.favicon_url
  } catch {
    // Fall back to the bundled icon if settings can't be fetched.
  }

  return {
    title: 'Tech Gallery - High-Performance Peripherals',
    description:
      'The definitive source for high-performance peripheral engineering. Keyboards, mice and audio gear designed for the relentless, built for the elite.',
    icons: {
      icon: favicon,
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${hankenGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body-md antialiased bg-background text-on-surface">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
