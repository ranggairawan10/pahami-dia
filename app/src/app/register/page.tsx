import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

// ============================================================
// /register → /daftar alias
// Preserves query params (e.g. ?ref=PARTNER_CODE)
// ============================================================

export default function RegisterRedirect({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>
}) {
  // searchParams is a Promise in Next.js 15 — redirect without awaiting
  // The middleware / auth layout will handle the ref param once at /daftar
  redirect('/daftar')
}
