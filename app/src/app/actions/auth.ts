'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

// ============================================================
// AUTH SERVER ACTIONS
// Semua action mengembalikan { error?: string } atau redirect.
// Validasi dengan Zod sebelum menyentuh Supabase.
// ============================================================

// ============================================================
// REGISTER
// ============================================================

const registerSchema = z.object({
  nickname: z.string().min(2).max(50).trim(),
  email:    z.string().email().toLowerCase().trim(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*\d)/),
  role:     z.enum(['suami', 'istri']),
  ref:      z.string().max(20).optional().transform(v => v?.trim().toUpperCase() || undefined),
})

export async function registerAction(formData: FormData) {
  const raw = {
    nickname: formData.get('nickname'),
    email:    formData.get('email'),
    password: formData.get('password'),
    role:     formData.get('role'),
    ref:      formData.get('ref') || undefined,
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? 'Data tidak valid'
    return { error: firstError }
  }

  const { nickname, email, password, role, ref } = parsed.data

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname,
        role,
        partner_code: ref ?? null,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Email ini sudah digunakan. Coba masuk atau gunakan email lain.' }
    }
    return { error: 'Pendaftaran gagal. Coba lagi dalam beberapa saat.' }
  }

  redirect('/app/onboarding')
}

// ============================================================
// LOGIN
// ============================================================

const loginSchema = z.object({
  email:    z.string().email('Format email tidak valid').toLowerCase().trim(),
  password: z.string().min(1, 'Password wajib diisi'),
})

export async function loginAction(formData: FormData) {
  const raw = {
    email:    formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? 'Data tidak valid' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email:    parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Email atau password tidak sesuai. Coba lagi.' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Email belum dikonfirmasi. Periksa kotak masukmu.' }
    }
    return { error: 'Masuk gagal. Coba lagi dalam beberapa saat.' }
  }

  revalidatePath('/', 'layout')
  redirect('/app/hari-ini')
}

// ============================================================
// LOGOUT
// ============================================================

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/masuk')
}
