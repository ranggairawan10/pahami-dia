import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getUserWithProfile } from '@/lib/auth/helpers'
import { getUserAccessInfo } from '@/lib/auth/access'
import { TrialBanner } from '@/components/ui/SafetyNotice'

// ============================================================
// User App Layout
// Layout utama untuk semua halaman /app/*.
// Termasuk: top header, bottom navigation, dan trial banner.
// ============================================================

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile } = await getUserWithProfile()

  if (!user || !profile) {
    redirect('/masuk')
  }

  const accessInfo = await getUserAccessInfo(user.id)

  return (
    <div className="min-h-dvh bg-cream-100 flex flex-col">
      {/* Trial Banner: tampil di atas saat trial hampir habis */}
      {accessInfo.hasActiveTrial && accessInfo.trialDaysLeft !== null && accessInfo.trialDaysLeft <= 3 && (
        <TrialBanner daysLeft={accessInfo.trialDaysLeft} />
      )}

      {/* App Header */}
      <header className="app-header">
        <div className="page-container flex items-center justify-between h-14">
          {/* Logo */}
          <Link
            href="/app/hari-ini"
            className="flex items-center gap-2"
            aria-label="Pahami Dia"
          >
            <div className="w-7 h-7 rounded-lg bg-teal-gradient flex items-center justify-center shadow-sm">
              <AppHeartIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-ink-700 text-base tracking-tight">
              Pahami Dia
            </span>
          </Link>

          {/* Right: account */}
          <Link
            href="/app/account"
            className="w-8 h-8 rounded-full bg-teal-primary-light flex items-center justify-center text-teal-700 text-sm font-bold hover:bg-teal-100 transition-colors"
            aria-label="Akun saya"
          >
            {profile.nickname.charAt(0).toUpperCase()}
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-bottom-nav">
        {children}
      </main>

      {/* Bottom Navigation */}
      <AppBottomNav />
    </div>
  )
}

// ============================================================
// Bottom Navigation Component
// ============================================================
function AppBottomNav() {
  const navItems = [
    {
      href: '/app/hari-ini',
      label: 'Hari Ini',
      icon: <HomeIcon />,
    },
    {
      href: '/app/pahami-kalimatnya',
      label: 'Pahami',
      icon: <HeartSearchIcon />,
    },
    {
      href: '/app/ayat-pengingat',
      label: 'Ayat',
      icon: <BookIcon />,
    },
    {
      href: '/app/refleksi-harian',
      label: 'Refleksi',
      icon: <PenIcon />,
    },
    {
      href: '/app/account',
      label: 'Akun',
      icon: <PersonIcon />,
    },
  ]

  return (
    <nav className="bottom-nav" aria-label="Navigasi utama">
      <div className="flex items-stretch h-16">
        {navItems.map((item) => (
          <BottomNavItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </div>
    </nav>
  )
}

function BottomNavItem({
  href,
  label,
  icon,
}: {
  href: string
  label: string
  icon: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex-1 flex flex-col items-center justify-center gap-0.5 text-ink-400 hover:text-teal-700 transition-colors group"
    >
      <span className="w-6 h-6 flex items-center justify-center text-current">
        {icon}
      </span>
      <span className="text-2xs font-medium text-current">{label}</span>
    </Link>
  )
}

// ============================================================
// Icons (inline SVG untuk tidak perlu library icon)
// ============================================================
function AppHeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12L12 3l9 9" />
      <path d="M9 21V12h6v9" />
      <path d="M3 12v9h18v-9" />
    </svg>
  )
}

function HeartSearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  )
}

function PenIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
