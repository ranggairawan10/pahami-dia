import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getUserWithProfile } from '@/lib/auth/helpers'
import { getUserAccessInfo } from '@/lib/auth/access'
import { logoutAction } from '@/app/actions/auth'
import { getTrialStatusText } from '@/lib/utils/format'

export const metadata: Metadata = { title: 'Akun' }

// ============================================================
// ACCOUNT PAGE
// Route: /app/account
// ============================================================

export default async function AccountPage() {
  const { user, profile } = await getUserWithProfile()
  if (!user || !profile) redirect('/masuk')

  const access = await getUserAccessInfo(user.id)

  return (
    <div className="page-container py-5 animate-fade-in">
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-teal-gradient flex items-center justify-center text-white text-xl font-bold shadow-sm flex-shrink-0">
          {profile.nickname.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-bold text-ink-700">{profile.nickname}</p>
          <p className="text-sm text-ink-400">{profile.role === 'suami' ? 'Suami' : 'Istri'}</p>
        </div>
      </div>

      {/* Status */}
      <div className="mb-5">
        {access.hasActiveSubscription ? (
          <div className="flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-xl px-4 py-2.5">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <p className="text-xs font-medium text-teal-700">Langganan aktif</p>
            <Link href="/app/subscription" className="ml-auto text-2xs text-teal-600 font-semibold">
              Detail
            </Link>
          </div>
        ) : access.hasActiveTrial ? (
          <div className="flex items-center gap-2 bg-gold-50 border border-gold-100 rounded-xl px-4 py-2.5">
            <span className="w-2 h-2 rounded-full bg-gold-400 animate-pulse-soft" />
            <p className="text-xs font-medium text-gold-700">
              {getTrialStatusText(access.trialDaysLeft)}
            </p>
            <Link href="/app/subscription" className="ml-auto text-2xs text-gold-600 font-semibold">
              Berlangganan
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-cream-200 border border-cream-300 rounded-xl px-4 py-2.5">
            <p className="text-xs text-ink-500">Trial selesai</p>
            <Link href="/app/subscription" className="ml-auto text-2xs text-teal-700 font-semibold">
              Lanjutkan
            </Link>
          </div>
        )}
      </div>

      {/* Menu Sections */}
      <div className="space-y-3">
        {/* Profil */}
        <MenuSection title="Profil">
          <MenuItem label="Edit profil" href="/app/account/profil" />
          <MenuItem label="Notifikasi" href="/app/account/notifikasi" />
        </MenuSection>

        {/* Langganan */}
        <MenuSection title="Langganan">
          <MenuItem label="Status langganan" href="/app/subscription" />
          <MenuItem label="Riwayat pembayaran" href="/app/subscription" />
        </MenuSection>

        {/* Privasi */}
        <MenuSection title="Privasi dan Data">
          <MenuItem label="Unduh semua dataku" href="/app/account/privasi" />
          <MenuItem label="Hapus akun dan semua data" href="/app/account/privasi" destructive />
        </MenuSection>

        {/* Info */}
        <MenuSection title="Info">
          <MenuItem label="Ketentuan Layanan" href="/ketentuan" external />
          <MenuItem label="Kebijakan Privasi" href="/privasi" external />
          <MenuItem label="Bantuan" href="/bantuan" external />
        </MenuSection>
      </div>

      {/* Logout */}
      <div className="mt-6">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full h-11 rounded-xl border-2 border-red-100 text-red-500 text-sm font-semibold hover:bg-red-50 transition-colors"
          >
            Keluar
          </button>
        </form>
      </div>

      {/* Version */}
      <p className="text-center text-2xs text-ink-300 mt-6">
        Pahami Dia v0.1.0
      </p>
    </div>
  )
}

function MenuSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-2xs font-semibold text-ink-400 uppercase tracking-wider mb-2 px-1">{title}</p>
      <div className="bg-white rounded-2xl border border-cream-200 shadow-card divide-y divide-cream-100 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function MenuItem({
  label,
  href,
  destructive = false,
  external = false,
}: {
  label: string
  href: string
  destructive?: boolean
  external?: boolean
}) {
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`flex items-center justify-between px-4 py-3.5 transition-colors ${
        destructive
          ? 'text-red-500 hover:bg-red-50'
          : 'text-ink-600 hover:bg-cream-50'
      }`}
    >
      <span className="text-sm font-medium">{label}</span>
      <svg viewBox="0 0 24 24" className="w-4 h-4 text-ink-300" fill="none" stroke="currentColor" strokeWidth={2}>
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </Link>
  )
}
