'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfileAction } from '@/app/actions/profile'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { cn } from '@/lib/utils/cn'

// ============================================================
// EDIT PROFIL
// Route: /app/account/profil
// Client component karena form interaktif.
// Nickname dan role dari parent server component.
// ============================================================

export interface EditProfilClientProps {
  initialNickname: string
  initialRole: 'suami' | 'istri'
}

export default function EditProfilClient({ initialNickname, initialRole }: EditProfilClientProps) {
  const router = useRouter()
  const [nickname, setNickname] = useState(initialNickname)
  const [role, setRole] = useState<'suami' | 'istri'>(initialRole)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!nickname.trim()) return setError('Nama panggilan tidak boleh kosong.')
    setError(null)
    setSuccess(false)

    const formData = new FormData()
    formData.set('nickname', nickname)
    formData.set('role', role)

    startTransition(async () => {
      const result = await updateProfileAction(formData)
      if (result?.error) return setError(result.error)
      setSuccess(true)
      setTimeout(() => router.push('/app/account'), 1200)
    })
  }

  return (
    <div className="page-container py-5 animate-fade-in">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-ink-400 hover:text-ink-600 transition-colors mb-4"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Kembali
        </button>
        <h1 className="text-xl font-bold text-ink-700">Edit Profil</h1>
      </div>

      {error && <Alert variant="error" className="mb-5">{error}</Alert>}
      {success && <Alert variant="success" className="mb-5">Profil berhasil diperbarui.</Alert>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Nama panggilan"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={50}
          required
          disabled={isPending}
        />

        <div className="field-wrapper">
          <label className="text-sm font-medium text-ink-600">Peran dalam rumah tangga</label>
          <div className="grid grid-cols-2 gap-2">
            {(['suami', 'istri'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                disabled={isPending}
                className={cn(
                  'h-11 rounded-xl border-2 text-sm font-semibold transition-all',
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

        <Button type="submit" variant="primary" size="lg" fullWidth loading={isPending}>
          Simpan Perubahan
        </Button>
      </form>
    </div>
  )
}
