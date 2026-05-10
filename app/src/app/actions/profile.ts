'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/helpers'

// ============================================================
// PROFILE SERVER ACTIONS
// ============================================================

const updateProfileSchema = z.object({
  nickname: z.string().min(2).max(50).trim(),
  role:     z.enum(['suami', 'istri']),
})

export async function updateProfileAction(formData: FormData) {
  const user = await getUser()
  if (!user) return { error: 'Tidak terautentikasi.' }

  const raw = {
    nickname: formData.get('nickname'),
    role:     formData.get('role'),
  }

  const parsed = updateProfileSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Data tidak valid' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('profiles')
    .update({
      nickname:   parsed.data.nickname,
      role:       parsed.data.role,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  if (error) return { error: 'Gagal memperbarui profil. Coba lagi.' }

  revalidatePath('/app/account')
  return { success: true }
}

// ============================================================
// ONBOARDING
// ============================================================

const onboardingSchema = z.object({
  feeling_lately:    z.string().min(1),
  conflict_response: z.string().min(1),
  main_hope:         z.string().min(1),
})

export async function saveOnboardingAction(formData: FormData) {
  const user = await getUser()
  if (!user) return { error: 'Tidak terautentikasi.' }

  const raw = {
    feeling_lately:    formData.get('feeling_lately'),
    conflict_response: formData.get('conflict_response'),
    main_hope:         formData.get('main_hope'),
  }

  const parsed = onboardingSchema.safeParse(raw)
  if (!parsed.success) return { error: 'Mohon jawab semua pertanyaan.' }

  const supabase = await createClient()

  // Simpan onboarding responses
  await supabase.from('onboarding_responses').upsert({
    user_id: user.id,
    answers: {
      feeling_lately:    parsed.data.feeling_lately,
      conflict_response: parsed.data.conflict_response,
      main_hope:         parsed.data.main_hope,
    },
  }, { onConflict: 'user_id' })

  // Tandai onboarding selesai
  await supabase
    .from('profiles')
    .update({ onboarding_completed: true })
    .eq('user_id', user.id)

  revalidatePath('/app/hari-ini')
  return { success: true }
}

// ============================================================
// CANCEL SUBSCRIPTION
// ============================================================

export async function cancelSubscriptionAction(subscriptionId: string) {
  const user = await getUser()
  if (!user) return { error: 'Tidak terautentikasi.' }

  const supabase = await createClient()

  // Hanya boleh cancel subscription milik sendiri
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status:       'cancelled',
      cancelled_at: new Date().toISOString(),
      updated_at:   new Date().toISOString(),
    })
    .eq('id', subscriptionId)
    .eq('user_id', user.id)

  if (error) return { error: 'Gagal membatalkan langganan. Hubungi tim kami.' }

  revalidatePath('/app/subscription')
  return { success: true }
}
