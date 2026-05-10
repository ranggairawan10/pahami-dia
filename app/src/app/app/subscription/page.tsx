import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getUserWithProfile } from '@/lib/auth/helpers'
import { getUserAccessInfo } from '@/lib/auth/access'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatCurrencyIDR, calculateTrialDaysLeft, getTrialStatusText } from '@/lib/utils/format'
import { Button } from '@/components/ui/Button'
import type { SubscriptionPlan } from '@/types/database'

export const metadata: Metadata = { title: 'Subscription' }

// ============================================================
// SUBSCRIPTION PAGE
// Route: /app/subscription
// ============================================================

export default async function SubscriptionPage() {
  const { user, profile } = await getUserWithProfile()
  if (!user || !profile) redirect('/masuk')

  const access = await getUserAccessInfo(user.id)

  // Fetch plan info
  const supabase = await createClient()
  const { data: plan } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .single()

  return (
    <div className="page-container py-5 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink-700">Langganan</h1>
        <p className="text-sm text-ink-400 mt-1.5">Kelola status aksesmu di Pahami Dia.</p>
      </div>

      {/* Current Status */}
      <CurrentStatusCard access={access} />

      {/* Plan Details */}
      {plan && (
        <div className="mt-5 bg-white rounded-2xl border border-cream-200 shadow-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-ink-700">{plan.name}</p>
            <span className="text-lg font-extrabold text-teal-700">
              {formatCurrencyIDR(plan.price)}<span className="text-xs font-normal text-ink-400">/bln</span>
            </span>
          </div>

          <ul className="space-y-2">
            {(plan.features as string[]).map((f, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-teal-700" fill="none" stroke="currentColor" strokeWidth={3}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-xs text-ink-600">{f}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          {!access.hasActiveSubscription && (
            <div className="pt-2 space-y-3">
              <div className="bg-cream-100 rounded-xl p-3 text-center">
                <p className="text-xs text-ink-400 leading-relaxed">
                  Pembayaran belum tersedia di versi ini. Kami akan segera mengaktifkan fitur pembayaran.
                </p>
              </div>
              <p className="text-xs text-center text-ink-400">
                Batalkan kapan saja. Tidak ada pertanyaan. Tidak ada penalti.
              </p>
            </div>
          )}
        </div>
      )}

      {/* History placeholder */}
      <div className="mt-5">
        <p className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-3">Riwayat Pembayaran</p>
        <div className="bg-cream-100 rounded-xl p-4 text-center">
          <p className="text-xs text-ink-400">Belum ada riwayat pembayaran.</p>
        </div>
      </div>

      {/* Privacy note */}
      <p className="text-xs text-center text-ink-400 mt-6 leading-relaxed">
        Data refleksimu tidak pernah dijual. Tidak pernah digunakan untuk iklan.
        Ia hanya milikmu.
      </p>
    </div>
  )
}

function CurrentStatusCard({
  access,
}: {
  access: {
    hasActiveAccess: boolean
    hasActiveTrial: boolean
    hasActiveSubscription: boolean
    trialDaysLeft: number | null
    trial: { expires_at: string } | null
    subscription: { current_period_end: string; status: string } | null
  }
}) {
  if (access.hasActiveSubscription && access.subscription) {
    return (
      <div className="bg-teal-50 border border-teal-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
          <span className="text-sm font-semibold text-teal-700">Langganan Aktif</span>
        </div>
        <p className="text-xs text-teal-600 leading-relaxed">
          Tagihan berikutnya: {formatDate(access.subscription.current_period_end)}
        </p>
      </div>
    )
  }

  if (access.hasActiveTrial && access.trial) {
    const daysLeft = calculateTrialDaysLeft(access.trial.expires_at)
    return (
      <div className="bg-gold-50 border border-gold-100 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-pulse-soft" />
          <span className="text-sm font-semibold text-gold-700">Trial Aktif</span>
        </div>
        <p className="text-sm font-bold text-gold-600 mb-1">
          {getTrialStatusText(daysLeft)}
        </p>
        <p className="text-xs text-gold-600 leading-relaxed">
          Trial berakhir: {formatDate(access.trial.expires_at)}
        </p>
      </div>
    )
  }

  return (
    <div className="bg-cream-200 border border-cream-300 rounded-2xl p-5">
      <p className="text-sm font-semibold text-ink-600 mb-1">Trial selesai</p>
      <p className="text-xs text-ink-400 leading-relaxed">
        Datamu aman. Berlangganan untuk melanjutkan semua fitur.
      </p>
    </div>
  )
}
