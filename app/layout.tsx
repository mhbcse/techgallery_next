import type { Metadata } from 'next'
import { Hanken_Grotesk, Inter, JetBrains_Mono } from 'next/font/google'
import Providers from './providers'
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

export const metadata: Metadata = {
  title: 'Tech Gallery - High-Performance Peripherals',
  description:
    'The definitive source for high-performance peripheral engineering. Keyboards, mice and audio gear designed for the relentless, built for the elite.',
  icons: {
    icon: '/assets/logo-vertical-blue.png',
  },
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
