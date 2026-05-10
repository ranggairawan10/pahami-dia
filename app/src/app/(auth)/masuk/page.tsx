'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { loginAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'

// ============================================================
// Login Page
// Route: /masuk
// ============================================================

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')

  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await loginAction(formData)
      if (result?.error) {
        setError(result.error)
      }
      // Successful login redirects server-side
    })
  }

  return (
    <div className="animate-fade-in">
      {/* Heading */}
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-bold text-ink-700">Selamat kembali.</h1>
        <p className="text-sm text-ink-400 mt-1.5">
          Masuk untuk melanjutkan refleksimu.
        </p>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="error" className="mb-5">
          {error}
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="emailmu@contoh.com"
          autoComplete="email"
          required
          disabled={isPending}
        />

        <div>
          <Input
            name="password"
            type="password"
            label="Password"
            placeholder="Password kamu"
            autoComplete="current-password"
            required
            disabled={isPending}
          />
          <div className="flex justify-end mt-1.5">
            <Link
              href="/lupa-password"
              className="text-xs text-teal-700 hover:text-teal-800 font-medium transition-colors"
            >
              Lupa password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isPending}
          className="mt-2"
        >
          Masuk
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 my-6">
        <div className="flex-1 h-px bg-cream-300" />
        <span className="text-xs text-ink-300">atau</span>
        <div className="flex-1 h-px bg-cream-300" />
      </div>

      {/* Register link */}
      <p className="text-sm text-ink-400 text-center">
        Belum punya akun?{' '}
        <Link
          href="/daftar"
          className="text-teal-700 font-semibold hover:text-teal-800 transition-colors"
        >
          Daftar gratis 10 hari
        </Link>
      </p>
    </div>
  )
}
