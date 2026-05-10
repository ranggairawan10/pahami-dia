import Link from 'next/link'

// ============================================================
// Auth Layout
// Centered, clean layout untuk halaman login dan register.
// ============================================================

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-dvh bg-cream-100 flex flex-col">
      {/* Minimal Header */}
      <header className="flex items-center justify-center h-14 px-4 flex-shrink-0">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="Pahami Dia - Beranda"
        >
          <div className="w-7 h-7 rounded-lg bg-teal-gradient flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
            </svg>
          </div>
          <span className="font-bold text-ink-700 text-base tracking-tight">
            Pahami Dia
          </span>
        </Link>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-start justify-center px-4 pt-6 pb-10">
        <div className="w-full max-w-sm">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-center gap-4 py-4 px-4">
        <Link href="/ketentuan" className="text-2xs text-ink-400 hover:text-ink-600 transition-colors">
          Ketentuan
        </Link>
        <span className="text-cream-400" aria-hidden>|</span>
        <Link href="/privasi" className="text-2xs text-ink-400 hover:text-ink-600 transition-colors">
          Privasi
        </Link>
        <span className="text-cream-400" aria-hidden>|</span>
        <Link href="/bantuan" className="text-2xs text-ink-400 hover:text-ink-600 transition-colors">
          Bantuan
        </Link>
      </footer>
    </div>
  )
}
