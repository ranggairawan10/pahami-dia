'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { registerAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { cn } from '@/lib/utils/cn'

// ============================================================
// Register Page
// Route: /daftar
// Partner code: dari URL ?ref=CODE atau diketik manual
// ============================================================

export default function RegisterPage() {
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref') ?? ''

  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<'suami' | 'istri' | ''>('')
  const [agreed, setAgreed] = useState(false)
  const [showPartnerCode, setShowPartnerCode] = useState(!!refCode)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!role) return setError('Pilih peranmu dalam rumah tangga.')
    if (!agreed) return setError('Kamu perlu menyetujui ketentuan layanan.')

    const formData = new FormData(e.currentTarget)
    formData.set('role', role)

    startTransition(async () => {
      const result = await registerAction(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="animate-fade-in">
      {/* Heading */}
      <div className="mb-7 text-center">
        <h1 className="text-2xl font-bold text-ink-700">Mulai dari sini.</h1>
        <p className="text-sm text-ink-400 mt-1.5">
          10 hari gratis. Tidak perlu kartu kredit.
        </p>
      </div>

      {/* Error */}
      {error && (
        <Alert variant="error" className="mb-5">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nama Panggilan */}
        <Input
          name="nickname"
          type="text"
          label="Nama panggilan"
          placeholder="Nama yang ingin kami panggil"
          autoComplete="given-name"
          required
          disabled={isPending}
        />

        {/* Peran */}
        <div className="field-wrapper">
          <label className="text-sm font-medium text-ink-600">
            Peranmu dalam rumah tangga
            <span className="text-error-500 ml-0.5" aria-hidden>*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['suami', 'istri'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                disabled={isPending}
                className={cn(
                  'h-11 rounded-xl border-2 text-sm font-semibold transition-all duration-200',
                  role === r
                    ? 'border-teal-600 bg-teal-50 text-teal-700'
                    : 'border-cream-200 bg-white text-ink-500 hover:border-teal-200',
                )}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Email */}
        <Input
          name="email"
          type="email"
          label="Email"
          placeholder="emailmu@contoh.com"
          autoComplete="email"
          required
          disabled={isPending}
        />

        {/* Password */}
        <Input
          name="password"
          type="password"
          label="Password"
          placeholder="Minimal 8 karakter, ada huruf dan angka"
          autoComplete="new-password"
          required
          disabled={isPending}
          hint="Minimal 8 karakter, kombinasi huruf dan angka."
        />

        {/* Partner Code */}
        {showPartnerCode ? (
          <Input
            name="ref"
            type="text"
            label="Kode komunitas (opsional)"
            placeholder="Ketik kode di sini"
            defaultValue={refCode}
            disabled={isPending}
            hint="Kode dari komunitas yang merekomendasikan Pahami Dia."
          />
        ) : (
          <button
            type="button"
            onClick={() => setShowPartnerCode(true)}
            className="text-xs text-teal-700 hover:text-teal-800 font-medium transition-colors"
          >
            Punya kode komunitas? Masukkan di sini
          </button>
        )}

        {/* Terms */}
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="relative flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="sr-only"
            />
            <div
              className={cn(
                'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200',
                agreed
                  ? 'border-teal-600 bg-teal-600'
                  : 'border-cream-300 bg-white group-hover:border-teal-300',
              )}
            >
              {agreed && (
                <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          </div>
          <span className="text-sm text-ink-500 leading-relaxed">
            Dengan mendaftar, kamu menyetujui{' '}
            <Link href="/ketentuan" className="text-teal-700 underline underline-offset-2">Ketentuan Layanan</Link>{' '}
            dan{' '}
            <Link href="/privasi" className="text-teal-700 underline underline-offset-2">Kebijakan Privasi</Link>.
          </span>
        </label>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={isPending}
          className="mt-2"
        >
          Mulai 10 Hari Gratis
        </Button>
      </form>

      {/* Login link */}
      <p className="text-sm text-ink-400 text-center mt-6">
        Sudah punya akun?{' '}
        <Link
          href="/masuk"
          className="text-teal-700 font-semibold hover:text-teal-800 transition-colors"
        >
          Masuk
        </Link>
      </p>
    </div>
  )
}
