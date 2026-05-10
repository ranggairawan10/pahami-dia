'use client'

import { useState, useTransition } from 'react'
import { saveBebanSession } from '@/app/actions/features'
import { getPlaceholderBebanOutput } from '@/lib/placeholders/feature-outputs'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { FeatureOutputSection } from '@/components/features/FeatureShell'
import { cn } from '@/lib/utils/cn'

// ============================================================
// BEBAN TAK TERLIHAT
// Route: /app/beban-tak-terlihat
// ============================================================

const BURDEN_OPTIONS = [
  { value: 'jadwal_anak',         label: 'Mengingatkan dan mengatur jadwal anak' },
  { value: 'kebutuhan_keluarga',  label: 'Memikirkan kebutuhan keluarga sebelum ada yang memintanya' },
  { value: 'emosi_semua_orang',   label: 'Menjaga kondisi emosi semua anggota keluarga' },
  { value: 'administrasi',        label: 'Mengurus administrasi rumah tangga' },
  { value: 'mediator_keluarga',   label: 'Menjadi mediator saat ada konflik dengan keluarga besar' },
  { value: 'belanja_kebutuhan',   label: 'Memantau dan merencanakan belanja kebutuhan harian' },
  { value: 'kesehatan_anak',      label: 'Memantau kesehatan dan perkembangan anak' },
  { value: 'kebersihan_rumah',    label: 'Menjaga kebersihan dan kerapian rumah' },
  { value: 'masak_makanan',       label: 'Merencanakan dan menyiapkan makanan setiap hari' },
  { value: 'pekerjaan_kantor',    label: 'Pekerjaan atau karier yang juga harus dijaga' },
]

export default function BebanTakTerlihatPage() {
  const [step, setStep] = useState<'form' | 'output'>('form')
  const [selected, setSelected] = useState<string[]>([])
  const [customBurden, setCustomBurden] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [output, setOutput] = useState<ReturnType<typeof getPlaceholderBebanOutput> | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  function toggleBurden(value: string) {
    setSelected(prev =>
      prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]
    )
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (selected.length === 0) return setError('Pilih setidaknya satu beban yang kamu rasakan.')
    setError(null)

    const formData = new FormData()
    selected.forEach(v => formData.append('selected_burdens', v))
    if (customBurden.trim()) formData.append('custom_burdens', customBurden.trim())

    startTransition(async () => {
      const result = await saveBebanSession(formData)
      if (result?.error) return setError(result.error)
      setOutput(getPlaceholderBebanOutput(selected, 'istri'))
      setStep('output')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  return (
    <div className="page-container py-5 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink-700">Beban Tak Terlihat</h1>
        <p className="text-sm text-ink-400 mt-1.5 leading-relaxed">
          {step === 'form'
            ? 'Banyak hal yang kamu kerjakan tidak pernah dihitung. Tapi itu nyata. Mari kita lihat bersama.'
            : 'Berikut gambaran dari apa yang selama ini kamu pikul.'}
        </p>
      </div>

      {step === 'form' ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert variant="error">{error}</Alert>}

          <div className="field-wrapper">
            <label className="text-sm font-medium text-ink-600 mb-1">
              Pilih beban yang kamu rasakan
              <span className="text-xs text-ink-400 font-normal ml-2">Pilih semua yang relevan</span>
            </label>

            <div className="grid gap-2">
              {BURDEN_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleBurden(opt.value)}
                  className={cn(
                    'text-left px-4 py-3 rounded-xl border-2 text-sm transition-all flex items-center gap-3',
                    selected.includes(opt.value)
                      ? 'border-teal-600 bg-teal-50 text-teal-700'
                      : 'border-cream-200 bg-white text-ink-500 hover:border-teal-200',
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all',
                    selected.includes(opt.value) ? 'border-teal-600 bg-teal-600' : 'border-cream-300',
                  )}>
                    {selected.includes(opt.value) && (
                      <svg viewBox="0 0 24 24" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom burden */}
          <Input
            label="Ada beban lain yang belum tercantum?"
            placeholder="Tuliskan di sini (opsional)"
            value={customBurden}
            onChange={(e) => setCustomBurden(e.target.value)}
          />

          {/* Count */}
          {selected.length > 0 && (
            <p className="text-xs text-teal-600 font-medium">
              {selected.length} beban dipilih
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isPending}
            disabled={selected.length === 0}
          >
            Lihat Gambarannya
          </Button>
        </form>
      ) : output && (
        <FeatureOutputSection
          blocks={[
            { label: 'Yang selama ini kamu pikul', content: output.burden_summary, variant: 'highlight' },
            { label: 'Cara memulai percakapan tentang ini', content: output.conversation_starter, variant: 'default' },
            ...(output.husband_guide ? [{
              label: 'Untuk suami: cara mulai meringankan',
              content: output.husband_guide,
              variant: 'default' as const,
            }] : []),
          ]}
          onSave={() => setIsSaved(true)}
          onReset={() => { setStep('form'); setOutput(null); setSelected([]); setCustomBurden(''); setIsSaved(false) }}
          isSaved={isSaved}
        />
      )}
    </div>
  )
}
