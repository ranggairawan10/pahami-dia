'use client'

import { useState, useTransition } from 'react'
import { savePahamiSession } from '@/app/actions/features'
import { getPlaceholderPahamiOutput } from '@/lib/placeholders/feature-outputs'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { PaywallCard } from '@/components/ui/SafetyNotice'
import { FeatureOutputSection } from '@/components/features/FeatureShell'
import { cn } from '@/lib/utils/cn'

// ============================================================
// Pahami Kalimatnya Page
// Route: /app/pahami-kalimatnya
// ============================================================

// Access check happens in layout. This is a client component
// that receives access status via props from a wrapper.

// Server wrapper for access check
// src/app/(app)/pahami-kalimatnya/page.tsx should be a server component
// For simplicity, we export the client component directly and
// handle access in the same file using a server-fetched prop pattern.

// Since this needs to be client for interactivity, we'll use
// the pattern: Server Component imports Client Component

export default function PahamiKalimatnyaPage() {
  // Note: In production, hasAccess comes from server via parent layout
  // or a parallel server component. For MVP, we check on submit.
  return <PahamiKalimatnyaClient />
}

// ============================================================
// Response type choices
// ============================================================
const RESPONSE_CHOICES = [
  { value: 'diam',               label: 'Diam' },
  { value: 'membela_diri',       label: 'Membela diri' },
  { value: 'menjelaskan_panjang',label: 'Menjelaskan panjang lebar' },
  { value: 'pergi_menghindar',   label: 'Pergi atau menghindar' },
  { value: 'marah',              label: 'Marah atau meledak' },
  { value: 'bingung',            label: 'Bingung, tidak tahu harus berkata apa' },
  { value: 'ingin_memperbaiki',  label: 'Ingin memperbaiki tapi tidak tahu caranya' },
]

const SITUATION_CHOICES = [
  { value: 'setelah_pulang_kerja', label: 'Setelah pulang kerja' },
  { value: 'saat_mengurus_anak',   label: 'Saat mengurus anak bersama' },
  { value: 'setelah_pertengkaran', label: 'Setelah pertengkaran' },
  { value: 'saat_aktivitas_rutin', label: 'Di tengah aktivitas rutin' },
  { value: 'tiba_tiba',           label: 'Tiba-tiba tanpa konteks jelas' },
]

const FEELING_CHOICES = [
  { value: 'terluka',   label: 'Terluka' },
  { value: 'kecewa',    label: 'Kecewa' },
  { value: 'marah',     label: 'Marah' },
  { value: 'bingung',   label: 'Bingung' },
  { value: 'sedih',     label: 'Sedih' },
  { value: 'frustrasi', label: 'Frustrasi' },
]

// ============================================================
// Client Component
// ============================================================
function PahamiKalimatnyaClient() {
  const [step, setStep] = useState<'form' | 'output'>('form')
  const [error, setError] = useState<string | null>(null)
  const [isPaywall, setIsPaywall] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [output, setOutput] = useState<ReturnType<typeof getPlaceholderPahamiOutput> | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  // Form state
  const [inputText, setInputText] = useState('')
  const [situation, setSituation] = useState('')
  const [feeling, setFeeling] = useState('')
  const [responseType, setResponseType] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!inputText.trim()) return setError('Ceritakan kalimat yang ingin kamu pahami.')
    setError(null)

    const formData = new FormData()
    formData.set('input_text', inputText)
    formData.set('context_situation', situation)
    formData.set('user_feeling', feeling)
    formData.set('user_response', responseType)

    startTransition(async () => {
      const result = await savePahamiSession(formData)

      if (result?.error) {
        if (result.paywall) return setIsPaywall(true)
        return setError(result.error)
      }

      // Generate placeholder output
      const placeholder = getPlaceholderPahamiOutput(inputText)
      setOutput(placeholder)
      setStep('output')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  function handleReset() {
    setStep('form')
    setOutput(null)
    setIsSaved(false)
    setInputText('')
    setSituation('')
    setFeeling('')
    setResponseType('')
  }

  if (isPaywall) {
    return (
      <div className="page-container py-5">
        <PaywallCard feature="Pahami Kalimatnya" variant="full" />
      </div>
    )
  }

  return (
    <div className="page-container py-5 animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink-700">Pahami Kalimatnya</h1>
        <p className="text-sm text-ink-400 mt-1.5 leading-relaxed">
          {step === 'form'
            ? 'Ada kalimat pasanganmu yang masih mengganjal? Ceritakan, dan mari kita lihat bersama apa yang mungkin ada di baliknya.'
            : 'Ini kemungkinan yang ada di balik kalimat yang kamu ceritakan.'}
        </p>
      </div>

      {step === 'form' ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert variant="error">{error}</Alert>}

          {/* Kalimat utama */}
          <Textarea
            label="Kalimat pasanganmu"
            placeholder='Ketik kalimat yang baru saja diucapkan pasanganmu, misalnya: "Kamu nggak pernah ada buat aku."'
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            showCount
            maxLength={500}
            required
            hint="Tidak perlu sempurna. Ketik apa adanya."
          />

          {/* Situasi */}
          <div className="field-wrapper">
            <label className="text-sm font-medium text-ink-600">
              Kalimat ini diucapkan saat...
            </label>
            <div className="flex flex-wrap gap-2">
              {SITUATION_CHOICES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setSituation(s => s === c.value ? '' : c.value)}
                  className={cn(
                    'px-3.5 py-2 rounded-xl text-xs font-medium border-2 transition-all duration-200',
                    situation === c.value
                      ? 'border-teal-600 bg-teal-50 text-teal-700'
                      : 'border-cream-200 bg-white text-ink-500 hover:border-teal-200',
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Perasaan */}
          <div className="field-wrapper">
            <label className="text-sm font-medium text-ink-600">
              Ketika mendengar kalimat itu, aku merasa...
            </label>
            <div className="flex flex-wrap gap-2">
              {FEELING_CHOICES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setFeeling(f => f === c.value ? '' : c.value)}
                  className={cn(
                    'px-3.5 py-2 rounded-xl text-xs font-medium border-2 transition-all duration-200',
                    feeling === c.value
                      ? 'border-gold-500 bg-gold-50 text-gold-700'
                      : 'border-cream-200 bg-white text-ink-500 hover:border-gold-200',
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Biasanya merespons */}
          <div className="field-wrapper">
            <label className="text-sm font-medium text-ink-600">
              Biasanya aku merespons dengan...
            </label>
            <div className="grid grid-cols-1 gap-2">
              {RESPONSE_CHOICES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setResponseType(r => r === c.value ? '' : c.value)}
                  className={cn(
                    'text-left px-4 py-3 rounded-xl border-2 text-sm transition-all duration-200',
                    responseType === c.value
                      ? 'border-teal-600 bg-teal-50 text-teal-700 font-medium'
                      : 'border-cream-200 bg-white text-ink-500 hover:border-teal-200',
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={isPending}
          >
            Pahami Kalimat Ini
          </Button>
        </form>
      ) : (
        output && (
          <FeatureOutputSection
            blocks={[
              {
                label: 'Rasa yang mungkin ada di balik kalimat ini',
                content: output.emotion_analysis,
                variant: 'default',
              },
              {
                label: 'Yang mungkin sebenarnya dibutuhkan',
                content: output.underlying_need,
                variant: 'highlight',
              },
              {
                label: 'Cara merespons yang bisa dicoba',
                content: output.response_options.map((r, i) =>
                  `${i + 1}. ${r.text}`
                ).join('\n\n'),
                variant: 'default',
              },
              ...(output.response_to_avoid
                ? [{
                    label: 'Respons yang sebaiknya dihindari',
                    content: output.response_to_avoid,
                    variant: 'warning' as const,
                  }]
                : []),
            ]}
            onSave={() => setIsSaved(true)}
            onReset={handleReset}
            isSaved={isSaved}
          />
        )
      )}
    </div>
  )
}
