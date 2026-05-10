import { createClient } from '@/lib/supabase/server'
import type { AdminRole } from '@/types/database'

// ============================================================
// Role Helpers
// Semua function ini mengecek role dari sisi server.
// Reflect logic yang sama dengan SQL helper functions di RLS.
// ============================================================

/**
 * Cek apakah user yang sedang login adalah super_admin aktif.
 */
export async function isSuperAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .eq('admin_role', 'super_admin')
    .eq('is_active', true)
    .maybeSingle()

  return !!data
}

/**
 * Cek apakah user adalah platform_admin atau super_admin aktif.
 */
export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .in('admin_role', ['platform_admin', 'super_admin'])
    .eq('is_active', true)
    .maybeSingle()

  return !!data
}

/**
 * Cek apakah user adalah partner_admin aktif.
 */
export async function isPartnerAdmin(): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('admin_users')
    .select('id')
    .eq('user_id', user.id)
    .eq('admin_role', 'partner_admin')
    .eq('is_active', true)
    .maybeSingle()

  return !!data
}

/**
 * Mendapatkan partner_id dari partner_admin yang sedang login.
 * Return null jika bukan partner_admin.
 */
export async function getCurrentPartnerAdminId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('admin_users')
    .select('partner_id')
    .eq('user_id', user.id)
    .eq('admin_role', 'partner_admin')
    .eq('is_active', true)
    .maybeSingle()

  return data?.partner_id ?? null
}

/**
 * Mendapatkan admin role dari user yang sedang login.
 * Return null jika bukan admin atau tidak aktif.
 */
export async function getAdminRoleLevel(): Promise<AdminRole | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('admin_users')
    .select('admin_role')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  return (data?.admin_role as AdminRole) ?? null
}

/**
 * Mendapatkan semua informasi role user sekaligus.
 * Berguna untuk layout yang perlu menampilkan menu berbeda per role.
 */
export async function getRoleContext() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: adminData } = await supabase
    .from('admin_users')
    .select('admin_role, partner_id, is_active')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  return {
    userId: user.id,
    adminRole: (adminData?.admin_role as AdminRole) ?? null,
    partnerId: adminData?.partner_id ?? null,
    isSuperAdmin: adminData?.admin_role === 'super_admin',
    isPlatformAdmin: adminData?.admin_role === 'platform_admin',
    isPartnerAdmin: adminData?.admin_role === 'partner_admin',
    isAnyAdmin: !!adminData,
  }
}
