import Link from 'next/link'
import { requirePartnerAdmin } from '@/lib/auth/helpers'

// ============================================================
// Partner Admin Layout
// Layout untuk halaman /partner/*.
// ============================================================

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requirePartnerAdmin()

  const navItems = [
    { href: '/partner', label: 'Dashboard', exact: true },
    { href: '/partner/referrals', label: 'Referral' },
    { href: '/partner/revenue', label: 'Revenue' },
    { href: '/partner/campaigns', label: 'Materi' },
    { href: '/partner/payouts', label: 'Pembayaran' },
  ]

  return (
    <div className="min-h-dvh bg-cream-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-cream-300">
        <div className="page-container-wide flex items-center justify-between h-14">
          <Link href="/partner" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gold-gradient flex items-center justify-center">
              <PartnerIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <span className="text-sm font-bold text-ink-700">Pahami Dia</span>
              <span className="ml-1.5 text-2xs font-medium text-gold-500 bg-gold-50 px-1.5 py-0.5 rounded-full">
                Partner
              </span>
            </div>
          </Link>

          <Link
            href="/app/hari-ini"
            className="text-xs text-ink-400 hover:text-teal-700 transition-colors font-medium"
          >
            Kembali ke App
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="page-container-wide border-t border-cream-200">
          <nav className="flex gap-0 overflow-x-auto scrollbar-none">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex-shrink-0 px-4 py-2.5 text-xs font-medium text-ink-400 hover:text-teal-700 border-b-2 border-transparent hover:border-teal-700 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-6">
        <div className="page-container-wide">
          {children}
        </div>
      </main>
    </div>
  )
}

function PartnerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  )
}
