'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth/helpers'
import { hasActiveAccess } from '@/lib/auth/access'

// ============================================================
// FEATURE SERVER ACTIONS
// Setiap action:
//   1. Cek auth
//   2. Cek akses (trial / subscription)
//   3. Validasi input dengan Zod
//   4. Simpan ke database
//   5. Return session ID atau error
// ============================================================

// ============================================================
// PAHAMI KALIMATNYA
// ============================================================

const pahamiSchema = z.object({
  input_text:        z.string().min(3, 'Ceritakan sedikit lebih banyak').max(1000).trim(),
  context_situation: z.string().max(200).optional().transform(v => v?.trim() || undefined),
  user_feeling:      z.string().max(100).optional(),
  user_response:     z.string().max(100).optional(),
})

export async function savePahamiSession(formData: FormData) {
  const user = await getUser()
  if (!user) return { error: 'Kamu perlu masuk terlebih dahulu.' }

  const active = await hasActiveAccess(user.id)
  if (!active) return { error: 'Akses tidak aktif.', paywall: true }

  const raw = {
    input_text:        formData.get('input_text'),
    context_situation: formData.get('context_situation') || undefined,
    user_feeling:      formData.get('user_feeling') || undefined,
    user_response:     formData.get('user_response') || undefined,
  }

  const parsed = pahamiSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Input tidak valid' }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('pahami_sessions')
    .insert({
      user_id:           user.id,
      input_text:        parsed.data.input_text,
      context_situation: parsed.data.context_situation ?? null,
      output_emotion:    null,
      output_need:       null,
      output_responses:  null,
    })
    .select('id')
    .single()

  if (error || !data) return { error: 'Gagal menyimpan. Coba lagi.' }

  revalidatePath('/app/pahami-kalimatnya')
  return { sessionId: data.id, success: true }
}

// ============================================================
// JAWAB DENGAN TENANG
// ============================================================

const jawabSchema = z.object({
  input_text:    z.string().min(3, 'Ceritakan sedikit lebih banyak').max(1000).trim(),
  intent_type:   z.string().max(100).optional(),
  emotion_level: z.string().max(50).optional(),
})

export async function saveJawabSession(formData: FormData) {
  const user = await getUser()
  if (!user) return { error: 'Kamu perlu masuk terlebih dahulu.' }

  const active = await hasActiveAccess(user.id)
  if (!active) return { error: 'Akses tidak aktif.', paywall: true }

  const raw = {
    input_text:    formData.get('input_text'),
    intent_type:   formData.get('intent_type') || undefined,
    emotion_level: formData.get('emotion_level') || undefined,
  }

  const parsed = jawabSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Input tidak valid' }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('jawab_sessions')
    .insert({
      user_id:       user.id,
      input_text:    parsed.data.input_text,
      intent_type:   parsed.data.intent_type ?? null,
      emotion_level: parsed.data.emotion_level ?? null,
    })
    .select('id')
    .single()

  if (error || !data) return { error: 'Gagal menyimpan. Coba lagi.' }

  revalidatePath('/app/jawab-dengan-tenang')
  return { sessionId: data.id, success: true }
}

// ============================================================
// ACU MERASA SENDIRIAN
// ============================================================

const sendirianSchema = z.object({
  answers: z.record(z.string(), z.string()),
})

export async function saveSendirianSession(formData: FormData) {
  const user = await getUser()
  if (!user) return { error: 'Kamu perlu masuk terlebih dahulu.' }

  const active = await hasActiveAccess(user.id)
  if (!active) return { error: 'Akses tidak aktif.', paywall: true }

  const rawAnswers: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('answer_') && typeof value === 'string') {
      rawAnswers[key.replace('answer_', '')] = value
    }
  }

  const parsed = sendirianSchema.safeParse({ answers: rawAnswers })
  if (!parsed.success) return { error: 'Mohon jawab semua pertanyaan.' }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sendirian_sessions')
    .insert({
      user_id: user.id,
      answers: parsed.data.answers,
    })
    .select('id')
    .single()

  if (error || !data) return { error: 'Gagal menyimpan. Coba lagi.' }

  revalidatePath('/app/aku-merasa-sendirian')
  return { sessionId: data.id, success: true }
}

// ============================================================
// ACU MERASA BUNTU
// ============================================================

export async function saveBuntuSession(formData: FormData) {
  const user = await getUser()
  if (!user) return { error: 'Kamu perlu masuk terlebih dahulu.' }

  const active = await hasActiveAccess(user.id)
  if (!active) return { error: 'Akses tidak aktif.', paywall: true }

  const rawAnswers: Record<string, string> = {}
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('answer_') && typeof value === 'string') {
      rawAnswers[key.replace('answer_', '')] = value
    }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('buntu_sessions')
    .insert({
      user_id: user.id,
      answers: rawAnswers,
    })
    .select('id')
    .single()

  if (error || !data) return { error: 'Gagal menyimpan. Coba lagi.' }

  revalidatePath('/app/aku-merasa-buntu')
  return { sessionId: data.id, success: true }
}

// ============================================================
// PERBAIKI SETELAH SALAH BICARA
// ============================================================

const perbaikiSchema = z.object({
  description_text:  z.string().min(3, 'Ceritakan sedikit lebih banyak').max(1000).trim(),
  current_condition: z.string().max(100).optional(),
  goal_type:         z.string().max(100).optional(),
})

export async function savePerbaikiSession(formData: FormData) {
  const user = await getUser()
  if (!user) return { error: 'Kamu perlu masuk terlebih dahulu.' }

  const active = await hasActiveAccess(user.id)
  if (!active) return { error: 'Akses tidak aktif.', paywall: true }

  const raw = {
    description_text:  formData.get('description_text'),
    current_condition: formData.get('current_condition') || undefined,
    goal_type:         formData.get('goal_type') || undefined,
  }

  const parsed = perbaikiSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Input tidak valid' }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('perbaiki_sessions')
    .insert({
      user_id:           user.id,
      description_text:  parsed.data.description_text,
      current_condition: parsed.data.current_condition ?? null,
      goal_type:         parsed.data.goal_type ?? null,
    })
    .select('id')
    .single()

  if (error || !data) return { error: 'Gagal menyimpan. Coba lagi.' }

  revalidatePath('/app/perbaiki-setelah-salah-bicara')
  return { sessionId: data.id, success: true }
}

// ============================================================
// BEBAN TAK TERLIHAT
// ============================================================

const bebanSchema = z.object({
  selected_burdens: z.array(z.string()).min(1, 'Pilih setidaknya satu beban'),
  custom_burdens:   z.array(z.string()).optional(),
})

export async function saveBebanSession(formData: FormData) {
  const user = await getUser()
  if (!user) return { error: 'Kamu perlu masuk terlebih dahulu.' }

  const active = await hasActiveAccess(user.id)
  if (!active) return { error: 'Akses tidak aktif.', paywall: true }

  const selectedRaw = formData.getAll('selected_burdens').filter(v => typeof v === 'string') as string[]
  const customRaw   = formData.getAll('custom_burdens').filter(v => typeof v === 'string' && v.trim()) as string[]

  const parsed = bebanSchema.safeParse({
    selected_burdens: selectedRaw,
    custom_burdens:   customRaw.length > 0 ? customRaw : undefined,
  })

  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Pilih setidaknya satu beban' }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('beban_sessions')
    .insert({
      user_id:          user.id,
      selected_burdens: parsed.data.selected_burdens,
      custom_burdens:   parsed.data.custom_burdens ?? null,
    })
    .select('id')
    .single()

  if (error || !data) return { error: 'Gagal menyimpan. Coba lagi.' }

  revalidatePath('/app/beban-tak-terlihat')
  return { sessionId: data.id, success: true }
}

// ============================================================
// REFLEKSI HARIAN
// ============================================================

const refleksiSchema = z.object({
  content_text:        z.string().min(1, 'Tulis sesuatu').max(5000).trim(),
  guide_question_used: z.string().optional(),
  entry_id:            z.string().uuid().optional(),
})

export async function saveRefleksiHarian(formData: FormData) {
  const user = await getUser()
  if (!user) return { error: 'Kamu perlu masuk terlebih dahulu.' }

  const active = await hasActiveAccess(user.id)
  if (!active) return { error: 'Akses tidak aktif.', paywall: true }

  const raw = {
    content_text:        formData.get('content_text'),
    guide_question_used: formData.get('guide_question_used') || undefined,
    entry_id:            formData.get('entry_id') || undefined,
  }

  const parsed = refleksiSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Input tidak valid' }

  const supabase = await createClient()

  if (parsed.data.entry_id) {
    // Update existing
    const { error } = await supabase
      .from('refleksi_harian')
      .update({
        content_text: parsed.data.content_text,
        updated_at:   new Date().toISOString(),
      })
      .eq('id', parsed.data.entry_id)
      .eq('user_id', user.id)

    if (error) return { error: 'Gagal memperbarui catatan.' }
    revalidatePath('/app/refleksi-harian')
    return { success: true, entryId: parsed.data.entry_id }
  }

  // Insert new
  const { data, error } = await supabase
    .from('refleksi_harian')
    .insert({
      user_id:             user.id,
      content_text:        parsed.data.content_text,
      guide_question_used: parsed.data.guide_question_used ?? null,
    })
    .select('id')
    .single()

  if (error || !data) return { error: 'Gagal menyimpan catatan.' }

  revalidatePath('/app/refleksi-harian')
  return { success: true, entryId: data.id }
}

// ============================================================
// SAVE / UNSAVE ITEMS
// ============================================================

const savedItemSchema = z.object({
  source_type: z.enum([
    'pahami_kalimatnya', 'jawab_dengan_tenang',
    'aku_merasa_sendirian', 'aku_merasa_buntu',
    'perbaiki_setelah_salah_bicara', 'beban_tak_terlihat', 'ayat_pengingat',
  ]),
  source_id:    z.string().uuid(),
  personal_note: z.string().max(500).optional(),
})

export async function saveItem(formData: FormData) {
  const user = await getUser()
  if (!user) return { error: 'Kamu perlu masuk terlebih dahulu.' }

  const raw = {
    source_type:   formData.get('source_type'),
    source_id:     formData.get('source_id'),
    personal_note: formData.get('personal_note') || undefined,
  }

  const parsed = savedItemSchema.safeParse(raw)
  if (!parsed.success) return { error: 'Data tidak valid.' }

  const supabase = await createClient()

  const { error } = await supabase.from('saved_items').upsert({
    user_id:       user.id,
    source_type:   parsed.data.source_type,
    source_id:     parsed.data.source_id,
    personal_note: parsed.data.personal_note ?? null,
  }, { onConflict: 'user_id,source_type,source_id' })

  if (error) return { error: 'Gagal menyimpan.' }

  revalidatePath('/app/riwayat')
  return { success: true }
}

export async function unsaveItem(savedItemId: string) {
  const user = await getUser()
  if (!user) return { error: 'Kamu perlu masuk terlebih dahulu.' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('saved_items')
    .delete()
    .eq('id', savedItemId)
    .eq('user_id', user.id)

  if (error) return { error: 'Gagal menghapus.' }

  revalidatePath('/app/riwayat')
  revalidatePath('/app/saved')
  return { success: true }
}

// ============================================================
// FEATURE FEEDBACK
// ============================================================

export async function submitFeedback(
  sessionTable: string,
  sessionId: string,
  isHelpful: boolean
) {
  const user = await getUser()
  if (!user) return { error: 'Tidak terautentikasi.' }

  const allowed = [
    'pahami_sessions', 'jawab_sessions', 'sendirian_sessions',
    'buntu_sessions', 'perbaiki_sessions', 'beban_sessions',
  ]
  if (!allowed.includes(sessionTable)) return { error: 'Tabel tidak valid.' }

  const supabase = await createClient()

  await supabase
    .from(sessionTable as 'pahami_sessions')
    .update({ feedback_helpful: isHelpful })
    .eq('id', sessionId)
    .eq('user_id', user.id)

  return { success: true }
}
