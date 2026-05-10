import { createClient } from '@/lib/supabase/server'
import type { Trial, Subscription, UserWithAccess } from '@/types/database'

// ============================================================
// Access Helpers
// Menentukan apakah pengguna memiliki akses ke fitur inti.
// Reflect logic yang sama dengan SQL helper functions di RLS.
// ============================================================

/**
 * Cek apakah user memiliki trial yang masih aktif.
 */
export async function hasActiveTrial(userId?: string): Promise<boolean> {
  const supabase = await createClient()

  let targetUserId = userId
  if (!targetUserId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    targetUserId = user.id
  }

  const { data } = await supabase
    .from('trials')
    .select('id')
    .eq('user_id', targetUserId)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  return !!data
}

/**
 * Cek apakah user memiliki subscription yang masih aktif.
 * Grace period dihitung sebagai aktif.
 */
export async function hasActiveSubscription(userId?: string): Promise<boolean> {
  const supabase = await createClient()

  let targetUserId = userId
  if (!targetUserId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return false
    targetUserId = user.id
  }

  const { data } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', targetUserId)
    .in('status', ['active', 'grace_period'])
    .gt('current_period_end', new Date().toISOString())
    .maybeSingle()

  return !!data
}

/**
 * Cek apakah user bisa menggunakan fitur inti.
 * Return true jika trial aktif ATAU subscription aktif.
 * Ini adalah gate utama untuk semua fitur berbayar.
 */
export async function hasActiveAccess(userId?: string): Promise<boolean> {
  const [trial, subscription] = await Promise.all([
    hasActiveTrial(userId),
    hasActiveSubscription(userId),
  ])
  return trial || subscription
}

/**
 * Mendapatkan data trial user secara lengkap.
 */
export async function getTrialData(userId?: string): Promise<Trial | null> {
  const supabase = await createClient()

  let targetUserId = userId
  if (!targetUserId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    targetUserId = user.id
  }

  const { data } = await supabase
    .from('trials')
    .select('*')
    .eq('user_id', targetUserId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data as Trial | null
}

/**
 * Mendapatkan data subscription aktif user.
 */
export async function getActiveSubscription(userId?: string): Promise<Subscription | null> {
  const supabase = await createClient()

  let targetUserId = userId
  if (!targetUserId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    targetUserId = user.id
  }

  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', targetUserId)
    .in('status', ['active', 'grace_period'])
    .gt('current_period_end', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data as Subscription | null
}

/**
 * Menghitung sisa hari trial.
 * Return null jika tidak ada trial aktif.
 * Return 0 jika trial hari ini berakhir.
 */
export async function getTrialDaysLeft(userId?: string): Promise<number | null> {
  const trial = await getTrialData(userId)
  if (!trial || !trial.is_active) return null

  const now = new Date()
  const expiresAt = new Date(trial.expires_at)
  if (expiresAt <= now) return 0

  const diffMs = expiresAt.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

/**
 * Mendapatkan seluruh informasi akses user sekaligus.
 * Berguna untuk layout yang perlu menampilkan status akses.
 * Melakukan semua query secara paralel untuk efisiensi.
 */
export async function getUserAccessInfo(userId?: string): Promise<Omit<UserWithAccess, 'profile'>> {
  const [trial, subscription, daysLeft] = await Promise.all([
    getTrialData(userId),
    getActiveSubscription(userId),
    getTrialDaysLeft(userId),
  ])

  const trialActive = !!(
    trial &&
    trial.is_active &&
    new Date(trial.expires_at) > new Date()
  )

  const subscriptionActive = !!(
    subscription &&
    ['active', 'grace_period'].includes(subscription.status) &&
    new Date(subscription.current_period_end) > new Date()
  )

  return {
    trial,
    subscription,
    hasActiveAccess: trialActive || subscriptionActive,
    hasActiveTrial: trialActive,
    hasActiveSubscription: subscriptionActive,
    trialDaysLeft: daysLeft,
  }
}
