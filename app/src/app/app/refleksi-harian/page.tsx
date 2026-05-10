'use client'

// ============================================================
// REFLEKSI HARIAN
// Route: /app/refleksi-harian
// ============================================================

import { useState, useTransition } from 'react'
import { saveRefleksiHarian } from '@/app/actions/features'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { cn } from '@/lib/utils/cn'

const GUIDE_QUESTIONS = [
  'Apa satu momen hari ini yang ingin kamu ingat?',
  'Apa yang terasa berat hari ini yang belum sempat kamu ceritakan?',
  'Satu hal kecil yang ingin kamu lakukan atau ubah besok.',
]

export default function RefleksiHarianPage() {
  const [content, setContent] = useState('')
  const [activeGuide, setActiveGuide] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleGuideClick(q: string) {
    setActiveGuide(q)
    if (!content) {
      setContent(`${q}\n\n`)
    } else {
      setContent(prev => prev + `\n\n${q}\n\n`)
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!content.trim()) return setError('Tulis sesuatu dulu.')
    setError(null)

    const formData = new FormData()
    formData.set('content_text', content)
    if (activeGuide) formData.set('guide_question_used', activeGuide)

    startTransition(async () => {
      const result = await saveRefleksiHarian(formData)
      if (result?.error) return setError(result.error)
      setIsSaved(true)
    })
  }

  return (
    <div className="page-container py-5 animate-fade-in">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-ink-700">Refleksi Harian</h1>
        <p className="text-sm text-ink-400 mt-1.5 leading-relaxed">
          Ruang ini sepenuhnya milikmu. Tidak ada yang menilai. Tidak ada yang membaca selain kamu.
        </p>
      </div>

      {/* Guide questions */}
      <div className="mb-4">
        <p className="text-xs text-ink-400 mb-2">Butuh titik awal? Pilih pertanyaan panduan:</p>
        <div className="space-y-2">
          {GUIDE_QUESTIONS.map((q, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleGuideClick(q)}
              className="w-full text-left text-xs text-ink-500 bg-cream-100 hover:bg-cream-200 border border-cream-200 rounded-xl px-4 py-2.5 transition-colors leading-relaxed"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert variant="error">{error}</Alert>}

        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Tulis apa saja yang ingin kamu ingat dari hari ini..."
            className="w-full min-h-[280px] bg-white border border-cream-300 rounded-2xl px-4 py-4 text-sm text-ink-700 placeholder-ink-300 resize-none focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition-all"
            rows={10}
          />
          <div className="absolute bottom-3 right-3 text-2xs text-ink-300">
            {content.length}/5000
          </div>
        </div>

        {isSaved ? (
          <div className="flex items-center justify-center gap-2 h-11 rounded-xl bg-success-50 border border-success-50">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-success-600" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-sm font-semibold text-success-700">Tersimpan</span>
          </div>
        ) : (
          <Button type="submit" variant="primary" size="lg" fullWidth loading={isPending}>
            Simpan Refleksi
          </Button>
        )}
      </form>
    </div>
  )
}
