import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// ============================================================
// Supabase Auth Callback
// Menangani email confirmation dan OAuth callback.
// ============================================================

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code  = searchParams.get('code')
  const next  = searchParams.get('next') ?? '/app/hari-ini'
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${origin}/masuk?error=${encodeURIComponent(error)}`)
  }

  if (code) {
    const supabase = await createClient()
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (!exchangeError) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/masuk?error=auth_callback_failed`)
}
