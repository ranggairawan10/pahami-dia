'use client'

import { createBrowserClient } from '@supabase/ssr'

// ============================================================
// Supabase Browser Client
// Gunakan di 'use client' components.
// Menggunakan anon key -- akses dikontrol oleh RLS.
// ============================================================

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
