import { createClient } from '@supabase/supabase-js'

// ============================================================
// Supabase Admin Client (Service Role)
// SERVER-ONLY. Jangan gunakan di 'use client' components.
// Melewati RLS -- gunakan hanya untuk operasi yang memang
// memerlukan akses penuh (background jobs, webhooks, triggers).
// ============================================================

// Guard: pastikan tidak dijalankan di browser
if (typeof window !== 'undefined') {
  throw new Error(
    'Admin Supabase client tidak boleh digunakan di browser. ' +
    'Gunakan hanya di server-side code.'
  )
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error(
    'SUPABASE_SERVICE_ROLE_KEY tidak ditemukan. ' +
    'Pastikan environment variable sudah dikonfigurasi.'
  )
}

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)
