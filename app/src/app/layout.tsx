import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

// ============================================================
// Font: Plus Jakarta Sans
// ============================================================
const jakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-jakarta',
  display: 'swap',
  preload: true,
})

// ============================================================
// Metadata
// ============================================================
export const metadata: Metadata = {
  title: {
    default: 'Pahami Dia',
    template: '%s | Pahami Dia',
  },
  description:
    'Sebelum menjawab, pahami dulu. Aplikasi refleksi dan komunikasi untuk pasangan muslim.',
  keywords: [
    'komunikasi pasangan',
    'aplikasi muslim',
    'rumah tangga',
    'refleksi',
    'pahami pasangan',
  ],
  authors: [{ name: 'Pahami Dia' }],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  ),
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    siteName: 'Pahami Dia',
    title: 'Pahami Dia',
    description:
      'Sebelum menjawab, pahami dulu. Teman refleksi untuk pasangan muslim.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pahami Dia',
    description: 'Sebelum menjawab, pahami dulu.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF7F2' },
    { media: '(prefers-color-scheme: dark)', color: '#FAF7F2' },
  ],
}

// ============================================================
// Root Layout
// ============================================================
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className={jakartaSans.variable} suppressHydrationWarning>
      <body className="bg-cream-100 text-ink-700 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
