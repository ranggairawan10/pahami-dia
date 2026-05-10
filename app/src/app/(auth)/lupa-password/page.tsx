'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/browser'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'

// ============================================================
// LUPA PASSWORD
// Route: /lupa-password
// ============================================================

export default function LupaPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email.trim()) return setError('Masukkan email yang terdaftar.')
    setError(null)

    startTransition(async () => {
      const supabase = createClient()

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/app/account/profil`,
      })

      if (resetError) {
        // Tidak expose error detail karena alasan keamanan
        // Selalu tampilkan pesan sukses untuk mencegah user enumeration
      }

      setSent(true)
    })
  }

  if (sent) {
    return (
      <div className="animate-fade-in">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" strokeWidth={1.75}>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.55a16 16 0 0 0 6.55 6.55l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
            </svg>
          </div>
        </div>

        <div className="text-center mb-7">
          <h1 className="text-xl font-bold text-ink-700">Periksa emailmu.</h1>
          <p className="text-sm text-ink-400 mt-2 leading-relaxed max-w-xs mx-auto">
            Jika email <span className="font-medium text-ink-600">{email}</span> terdaftar di sistem kami, kamu akan menerima tautan untuk mengatur ulang password dalam beberapa menit.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs text-center text-ink-400 leading-relaxed">
            Tidak menerima email? Periksa folder spam atau coba lagi dalam beberapa menit.
          </p>

          <button
            onClick={() => setSent(false)}
            className="w-full h-11 rounded-xl border border-cream-200 text-sm font-medium text-ink-500 hover:bg-cream-100 transition-colors"
          >
            Kirim ulang ke email lain
          </button>

          <Link
            href="/masuk"
            className="block text-center text-sm text-teal-700 font-semibold hover:text-teal-800 transition-colors pt-1"
          >
            Kembali ke halaman masuk
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-in">
      {/* Heading */}
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-bold text-ink-700">Lupa password?</h1>
        <p className="text-sm text-ink-400 mt-1.5 leading-relaxed">
          Masukkan emailmu dan kami akan mengirimkan tautan untuk membuat password baru.
        </p>
      </div>

      {error && (
        <Alert variant="error" className="mb-5">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="emailmu@contoh.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          disabled={isPending}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isPending}
        >
          Kirim Tautan Reset Password
        </Button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/masuk"
          className="text-sm text-ink-400 hover:text-teal-700 transition-colors font-medium inline-flex items-center gap-1"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Kembali masuk
        </Link>
      </div>
    </div>
  )
}
