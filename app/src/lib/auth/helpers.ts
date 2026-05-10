import 'server-only'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types/database'

// ============================================================
// Auth Helpers (Server-side only)
// Defensive: tidak akan throw error walaupun Supabase down.
// ============================================================

export async function getUser() {
  try {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) return null
    return user
  } catch (error) {
    console.error('getUser error:', error)
    return null
  }
}

export async function getProfile(): Promise<Profile | null> {
  try {
    const supabase = await createClient()
    const user = await getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) return null
    return data as Profile
  } catch (error) {
    console.error('getProfile error:', error)
    return null
  }
}

export async function getUserWithProfile() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return { user: null, profile: null }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    return { user, profile: profile as Profile | null }
  } catch (error) {
    console.error('getUserWithProfile error:', error)
    return { user: null, profile: null }
  }
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) {
    redirect('/masuk')
  }
  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  try {
    const supabase = await createClient()
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*, role:admin_roles(*)')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!adminUser) {
      redirect('/app/hari-ini')
    }
    return { user, adminUser }
  } catch (error) {
    redirect('/app/hari-ini')
  }
}

export async function requirePartnerAdmin() {
  const user = await requireAuth()
  try {
    const supabase = await createClient()
    const { data: partnerAdmin } = await supabase
      .from('partner_admins')
      .select('*, partner:community_partners(*)')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!partnerAdmin) {
      redirect('/app/hari-ini')
    }
    return { user, partnerAdmin }
  } catch (error) {
    redirect('/app/hari-ini')
  }
}
