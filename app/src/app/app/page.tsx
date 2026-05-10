import { redirect } from 'next/navigation'

// ============================================================
// /app root redirect
// Redirects to the main dashboard.
// The actual app shell lives in src/app/app/layout.tsx
// All feature pages are at /app/[feature]
// ============================================================

export default function AppIndexPage() {
  redirect('/app/hari-ini')
}
