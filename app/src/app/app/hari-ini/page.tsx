import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getUserWithProfile } from '@/lib/auth/helpers'
import { getUserAccessInfo } from '@/lib/auth/access'
import { createClient } from '@/lib/supabase/server'
import { getGreeting, formatDate, getTrialStatusText } from '@/lib/utils/format'
import { PaywallCard } from '@/components/ui/SafetyNotice'

export const metadata: Metadata = { title: 'Hari Ini' }

// ============================================================
// Dashboard (Hari Ini)
// Route: /app/hari-ini
// ============================================================

export default async function HariIniPage() {
  const { user, profile } = await getUserWithProfile()
  if (!user || !profile) redirect('/masuk')

  const access = await getUserAccessInfo(user.id)

  // Redirect ke onboarding jika belum selesai
  if (!profile.onboarding_completed) {
    redirect('/app/onboarding')
  }

  // Ambil data tambahan secara paralel
  const supabase = await createClient()

  const [{ data: todayVerse }, { data: lastRefleksi }, { data: recentSessions }] = await Promise.all([
    // Ayat hari ini (random dari yang aktif)
    supabase
      .from('ayat_pengingat')
      .select('id, source_ref, contextualization')
      .eq('status', 'active')
      .order('display_date', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle(),

    // Refleksi harian terakhir
    supabase
      .from('refleksi_harian')
      .select('id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    // Sesi terakhir
    supabase
      .from('pahami_sessions')
      .select('id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  const today = new Date()
  const greeting = getGreeting()
  const dateStr = formatDate(today)

  return (
    <div className="page-container py-5 space-y-6 animate-fade-in">
      {/* Greeting */}
      <div>
        <p className="text-xs text-ink-400 font-medium uppercase tracking-wider">{dateStr}</p>
        <h1 className="text-xl font-bold text-ink-700 mt-0.5">
          {greeting}, {profile.nickname}.
        </h1>
      </div>

      {/* Access Status Card */}
      <AccessStatusCard access={access} />

      {/* Paywall if no access */}
      {!access.hasActiveAccess && (
        <PaywallCard variant="inline" />
      )}

      {/* Ayat Pengingat Harian */}
      {todayVerse && (
        <Link href={`/app/ayat-pengingat/${todayVerse.id}`} className="block">
          <div className="bg-gradient-to-br from-teal-700 to-teal-800 rounded-2xl p-5 text-white shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">Ayat Hari Ini</span>
              <span className="text-xs text-white/40">{todayVerse.source_ref}</span>
            </div>
            {todayVerse.contextualization && !todayVerse.contextualization.startsWith('[') && (
              <p className="text-sm text-white/85 leading-relaxed line-clamp-3">
                {todayVerse.contextualization}
              </p>
            )}
            {(!todayVerse.contextualization || todayVerse.contextualization.startsWith('[')) && (
              <p className="text-sm text-white/70 leading-relaxed italic">
                Buka untuk membaca ayat hari ini.
              </p>
            )}
            <div className="flex items-center gap-1 mt-3 text-white/50">
              <span className="text-xs">Baca selengkapnya</span>
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </div>
        </Link>
      )}

      {/* Pertanyaan Refleksi */}
      <div className="bg-gold-50 border border-gold-100 rounded-2xl p-5">
        <p className="text-xs font-semibold text-gold-500 uppercase tracking-wider mb-2">Refleksi Hari Ini</p>
        <p className="text-sm font-medium text-ink-700 leading-relaxed">
          {getDailyReflectionQuestion(profile.role, lastRefleksi?.created_at)}
        </p>
        <Link
          href="/app/refleksi-harian"
          className="mt-3 inline-flex items-center text-xs font-semibold text-gold-600 hover:text-gold-700 transition-colors"
        >
          Tulis di Refleksi Harian
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">Mulai dari Sini</p>
        <div className="grid grid-cols-2 gap-3">
          {getQuickActions(profile.role).map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="bg-white border border-cream-200 shadow-card rounded-2xl p-4 hover:border-teal-100 hover:shadow-card-hover transition-all duration-200 group"
            >
              <div className="text-2xl mb-2">{action.icon}</div>
              <p className="text-xs font-semibold text-ink-700 leading-snug">{action.title}</p>
              <p className="text-2xs text-ink-400 mt-0.5 leading-relaxed">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Semua Fitur */}
      <div>
        <p className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">Semua Fitur</p>
        <div className="space-y-2">
          {ALL_FEATURES.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="flex items-center gap-3 bg-white border border-cream-200 rounded-xl p-4 hover:border-teal-100 transition-all duration-200"
            >
              <span className="text-xl flex-shrink-0 w-8 text-center">{f.icon}</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink-700 truncate">{f.title}</p>
                <p className="text-xs text-ink-400 truncate">{f.desc}</p>
              </div>
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-ink-300 flex-shrink-0 ml-auto" fill="none" stroke="currentColor" strokeWidth={2}>
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Access Status Card
// ============================================================
function AccessStatusCard({
  access,
}: {
  access: {
    hasActiveAccess: boolean
    hasActiveTrial: boolean
    hasActiveSubscription: boolean
    trialDaysLeft: number | null
  }
}) {
  if (access.hasActiveSubscription) {
    return (
      <div className="flex items-center gap-2 bg-success-50 border border-success-50 rounded-xl px-4 py-2.5">
        <span className="w-2 h-2 rounded-full bg-success-500" />
        <p className="text-xs font-medium text-success-700">Langganan aktif. Semua fitur terbuka.</p>
      </div>
    )
  }

  if (access.hasActiveTrial) {
    return (
      <div className="flex items-center justify-between bg-teal-50 border border-teal-100 rounded-xl px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse-soft" />
          <p className="text-xs font-medium text-teal-700">
            {getTrialStatusText(access.trialDaysLeft)}
          </p>
        </div>
        <Link href="/app/subscription" className="text-2xs font-semibold text-teal-600 hover:text-teal-700">
          Detail
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between bg-gold-50 border border-gold-100 rounded-xl px-4 py-2.5">
      <p className="text-xs font-medium text-gold-700">Trial selesai. Lanjutkan untuk akses penuh.</p>
      <Link href="/app/subscription" className="text-2xs font-bold text-gold-600">
        Rp10.000/bulan
      </Link>
    </div>
  )
}

// ============================================================
// Helpers
// ============================================================
function getDailyReflectionQuestion(role: string, lastRefleksiDate?: string): string {
  const questions = {
    suami: [
      'Satu hal yang belum sempat kamu katakan kepada istrimu hari ini, apa itu?',
      'Kapan terakhir kali kamu benar-benar mendengarkan istrimu tanpa memikirkan jawabanmu?',
      'Apa yang bisa kamu lakukan berbeda besok?',
    ],
    istri: [
      'Apa yang terasa paling berat hari ini dan belum sempat kamu ceritakan kepada siapapun?',
      'Satu hal yang kamu syukuri dari hari ini, sekecil apapun.',
      'Kalau kamu bisa meminta satu hal dari pasanganmu hari ini, hal apa itu?',
    ],
  }
  const pool = questions[role as keyof typeof questions] ?? questions.istri
  const idx = new Date().getDate() % pool.length
  return pool[idx]
}

function getQuickActions(role: string) {
  const baseActions = [
    {
      href: '/app/pahami-kalimatnya',
      icon: '🔍',
      title: 'Pahami Kalimatnya',
      desc: 'Ada kalimat yang membuat kamu bingung?',
    },
    {
      href: '/app/jawab-dengan-tenang',
      icon: '💬',
      title: 'Jawab dengan Tenang',
      desc: 'Susun kata sebelum bicara.',
    },
  ]

  if (role === 'suami') {
    return [
      ...baseActions,
      {
        href: '/app/aku-merasa-buntu',
        icon: '🧭',
        title: 'Aku Merasa Buntu',
        desc: 'Sudah berusaha tapi masih bingung.',
      },
      {
        href: '/app/perbaiki-setelah-salah-bicara',
        icon: '🌿',
        title: 'Perbaiki Setelah Salah Bicara',
        desc: 'Ambil langkah pertama.',
      },
    ]
  }

  return [
    ...baseActions,
    {
      href: '/app/aku-merasa-sendirian',
      icon: '🤍',
      title: 'Aku Merasa Sendirian',
      desc: 'Ruang untuk mengakui rasamu.',
    },
    {
      href: '/app/beban-tak-terlihat',
      icon: '⚖️',
      title: 'Beban Tak Terlihat',
      desc: 'Lihat apa yang selama ini kamu tanggung.',
    },
  ]
}

const ALL_FEATURES = [
  { href: '/app/pahami-kalimatnya', icon: '🔍', title: 'Pahami Kalimatnya', desc: 'Terjemahkan rasa di balik kata' },
  { href: '/app/jawab-dengan-tenang', icon: '💬', title: 'Jawab dengan Tenang', desc: 'Susun kata sebelum bicara' },
  { href: '/app/aku-merasa-sendirian', icon: '🤍', title: 'Aku Merasa Sendirian', desc: 'Ruang untuk mengakui rasamu' },
  { href: '/app/aku-merasa-buntu', icon: '🧭', title: 'Aku Merasa Buntu', desc: 'Panduan saat tidak tahu harus berbuat apa' },
  { href: '/app/perbaiki-setelah-salah-bicara', icon: '🌿', title: 'Perbaiki Setelah Salah Bicara', desc: 'Langkah pertama menuju perbaikan' },
  { href: '/app/beban-tak-terlihat', icon: '⚖️', title: 'Beban Tak Terlihat', desc: 'Kenali beban yang tidak pernah dihitung' },
  { href: '/app/ayat-pengingat', icon: '📖', title: 'Ayat Pengingat', desc: 'Refleksi dari Al-Quran dan Hadis' },
  { href: '/app/refleksi-harian', icon: '✍️', title: 'Refleksi Harian', desc: 'Jurnal hati pribadimu' },
]
