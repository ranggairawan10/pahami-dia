import Link from 'next/link'
import { getUser } from '@/lib/auth/helpers'

// ============================================================
// Public Layout
// Digunakan untuk halaman publik: landing, harga, komunitas, dll.
// ============================================================

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUser()

  return (
    <div className="min-h-dvh flex flex-col bg-cream-100">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-30 bg-cream-100/90 backdrop-blur-md border-b border-teal-100/50">
        <nav className="page-container-wide flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            aria-label="Pahami Dia - Beranda"
          >
            <div className="w-7 h-7 rounded-lg bg-teal-gradient flex items-center justify-center shadow-sm">
              <HeartIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-ink-700 text-base tracking-tight">
              Pahami Dia
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-6">
            <Link
              href="/harga"
              className="text-sm font-medium text-ink-500 hover:text-teal-700 transition-colors"
            >
              Harga
            </Link>
            <Link
              href="/komunitas-partner"
              className="text-sm font-medium text-ink-500 hover:text-teal-700 transition-colors"
            >
              Komunitas
            </Link>
            {user ? (
              <Link
                href="/app/hari-ini"
                className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 transition-colors shadow-sm"
              >
                Buka Aplikasi
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/masuk"
                  className="text-sm font-medium text-ink-500 hover:text-teal-700 transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  href="/daftar"
                  className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 transition-colors shadow-sm"
                >
                  Coba Gratis
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: only CTA */}
          <div className="sm:hidden">
            {user ? (
              <Link
                href="/app/hari-ini"
                className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-teal-700 text-white text-sm font-semibold"
              >
                Buka
              </Link>
            ) : (
              <Link
                href="/daftar"
                className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-teal-700 text-white text-sm font-semibold"
              >
                Coba Gratis
              </Link>
            )}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-ink-800 text-white/70 py-12 mt-16">
        <div className="page-container-wide">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-teal-gradient flex items-center justify-center">
                  <HeartIcon className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-white text-sm">Pahami Dia</span>
              </Link>
              <p className="text-xs text-white/50 leading-relaxed">
                Sebelum menjawab, pahami dulu.
              </p>
            </div>

            {/* Produk */}
            <div>
              <p className="text-xs font-semibold text-white/90 uppercase tracking-wider mb-3">
                Produk
              </p>
              <ul className="space-y-2">
                <li>
                  <Link href="/harga" className="text-xs text-white/60 hover:text-white transition-colors">
                    Harga
                  </Link>
                </li>
                <li>
                  <Link href="/#fitur" className="text-xs text-white/60 hover:text-white transition-colors">
                    Fitur
                  </Link>
                </li>
              </ul>
            </div>

            {/* Komunitas */}
            <div>
              <p className="text-xs font-semibold text-white/90 uppercase tracking-wider mb-3">
                Komunitas
              </p>
              <ul className="space-y-2">
                <li>
                  <Link href="/komunitas-partner" className="text-xs text-white/60 hover:text-white transition-colors">
                    Daftar Partner
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-xs font-semibold text-white/90 uppercase tracking-wider mb-3">
                Info
              </p>
              <ul className="space-y-2">
                <li>
                  <Link href="/bantuan" className="text-xs text-white/60 hover:text-white transition-colors">
                    Bantuan
                  </Link>
                </li>
                <li>
                  <Link href="/ketentuan" className="text-xs text-white/60 hover:text-white transition-colors">
                    Ketentuan
                  </Link>
                </li>
                <li>
                  <Link href="/privasi" className="text-xs text-white/60 hover:text-white transition-colors">
                    Privasi
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <p className="text-xs text-white/40">
              Pahami Dia adalah produk dari Nusva Group.
            </p>
            <p className="text-xs text-white/40">
              Dibuat dengan niat baik untuk keluarga muslim Indonesia.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Simple heart icon
function HeartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
    </svg>
  )
}
