import Link from 'next/link'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/helpers'

// ============================================================
// Admin Layout
// Layout untuk halaman /admin/*.
// Desktop-first karena admin work dilakukan di desktop.
// ============================================================

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { adminUser } = await requireAdmin()

  const isSuperAdmin = adminUser.admin_role === 'super_admin'

  return (
    <div className="min-h-dvh bg-cream-200 flex">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-ink-800 flex flex-col">
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-teal-600 flex items-center justify-center">
              <ShieldIcon className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-white text-xs font-bold leading-none">Pahami Dia</p>
              <p className="text-white/40 text-2xs leading-none mt-0.5">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          <AdminNavSection label="Overview">
            <AdminNavItem href="/admin" label="Dashboard" icon={<DashboardIcon />} exact />
          </AdminNavSection>

          <AdminNavSection label="Pengguna">
            <AdminNavItem href="/admin/users" label="Pengguna" icon={<UsersIcon />} />
            <AdminNavItem href="/admin/subscriptions" label="Langganan" icon={<CreditCardIcon />} />
            <AdminNavItem href="/admin/payments" label="Pembayaran" icon={<ReceiptIcon />} />
          </AdminNavSection>

          <AdminNavSection label="Partner">
            <AdminNavItem href="/admin/partners" label="Partner" icon={<HandshakeIcon />} />
            <AdminNavItem href="/admin/partner-codes" label="Kode Partner" icon={<HashIcon />} />
          </AdminNavSection>

          <AdminNavSection label="Konten">
            <AdminNavItem href="/admin/quran-verses" label="Ayat Pengingat" icon={<BookIcon />} />
            <AdminNavItem href="/admin/conditions" label="Kondisi" icon={<TagIcon />} />
            {isSuperAdmin && (
              <AdminNavItem href="/admin/prompt-templates" label="Prompt Templates" icon={<CodeIcon />} />
            )}
          </AdminNavSection>

          <AdminNavSection label="Keamanan">
            <AdminNavItem href="/admin/safety-events" label="Safety Events" icon={<AlertIcon />} />
            <AdminNavItem href="/admin/audit-logs" label="Audit Logs" icon={<LogIcon />} />
          </AdminNavSection>

          {isSuperAdmin && (
            <AdminNavSection label="Sistem">
              <AdminNavItem href="/admin/settings" label="Pengaturan" icon={<SettingsIcon />} />
            </AdminNavSection>
          )}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md">
            <div className="w-6 h-6 rounded-full bg-teal-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              A
            </div>
            <div className="min-w-0">
              <p className="text-white/80 text-xs font-medium truncate">Admin</p>
              <p className="text-white/40 text-2xs truncate">{adminUser.admin_role}</p>
            </div>
          </div>
          <Link
            href="/app/hari-ini"
            className="mt-2 flex items-center gap-2 px-2 py-1.5 rounded-md text-white/50 hover:text-white/80 text-xs transition-colors"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5" />
            Kembali ke App
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-cream-300 flex items-center px-6 flex-shrink-0">
          <h1 className="text-sm font-semibold text-ink-700">Admin Panel</h1>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

// ============================================================
// Admin Navigation Components
// ============================================================
function AdminNavSection({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="pt-3 first:pt-0">
      <p className="px-2 mb-1 text-2xs font-semibold text-white/30 uppercase tracking-wider">
        {label}
      </p>
      {children}
    </div>
  )
}

function AdminNavItem({
  href,
  label,
  icon,
  exact = false,
}: {
  href: string
  label: string
  icon: React.ReactNode
  exact?: boolean
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-2 py-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors text-xs font-medium group"
    >
      <span className="w-4 h-4 text-current flex-shrink-0">{icon}</span>
      {label}
    </Link>
  )
}

// ============================================================
// Icons
// ============================================================
const iconProps = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const }

function ShieldIcon({ className }: { className?: string }) {
  return <svg {...iconProps} className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
}
function DashboardIcon() {
  return <svg {...iconProps}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
}
function UsersIcon() {
  return <svg {...iconProps}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
}
function CreditCardIcon() {
  return <svg {...iconProps}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
}
function ReceiptIcon() {
  return <svg {...iconProps}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="12" y2="16"/></svg>
}
function HandshakeIcon() {
  return <svg {...iconProps}><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"/></svg>
}
function HashIcon() {
  return <svg {...iconProps}><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
}
function BookIcon() {
  return <svg {...iconProps}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
}
function TagIcon() {
  return <svg {...iconProps}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
}
function CodeIcon() {
  return <svg {...iconProps}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
}
function AlertIcon() {
  return <svg {...iconProps}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
}
function LogIcon() {
  return <svg {...iconProps}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
}
function SettingsIcon() {
  return <svg {...iconProps}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
}
function ArrowLeftIcon({ className }: { className?: string }) {
  return <svg {...iconProps} className={className}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
}
