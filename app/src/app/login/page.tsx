import { redirect } from 'next/navigation'

// ============================================================
// /login → /masuk alias
// Supports both English and Indonesian route names.
// Main implementation lives at src/app/(auth)/masuk/page.tsx
// ============================================================

export default function LoginRedirect() {
  redirect('/masuk')
}
