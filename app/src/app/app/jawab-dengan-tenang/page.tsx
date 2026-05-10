'use client'

// ============================================================
// JAWAB DENGAN TENANG
// Route: /app/jawab-dengan-tenang
// ============================================================

import { useState, useTransition } from 'react'
import { saveJawabSession } from '@/app/actions/features'
import { getPlaceholderJawabOutput } from '@/lib/placeholders/feature-outputs'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { FeatureOutputSection } from '@/components/features/FeatureShell'
import { cn } from '@/lib/utils/cn'

const INTENT_OPTIONS = [
  { value: 'meminta_maaf',           label: 'Meminta maaf dengan tulus' },
  { value: 'mengungkapkan_perasaan', label: 'Mengungkapkan perasaanku' },
  { value: 'klarifikasi',            label: 'Mengklarifikasi sesuatu' },
  { value: 'mengungkapkan_kebutuhan',label: 'Mengungkapkan kebutuhanku' },
  { value: 'belum_tahu',             label: 'Belum tahu, bantu aku menemukan' },
]

const EMOTION_OPTIONS = [
  { value: 'tenang',          label: 'Cukup tenang' },
  { value: 'sedikit_tegang',  label: 'Sedikit tegang' },
  { value: 'masih_kesal',     label: 'Masih ada rasa kesal' },
  { value: 'sangat_emosional',label: 'Sangat emosional sekarang' },
]

export default function JawabDenganTenangPage() {
  const [step, setStep] = useState<'form' | 'output'>('form')
  const [inputText, setInputText] = useState('')
  const [intent, setIntent] = useState('')
  const [emotion, setEmotion] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [output, setOutput] = useState<ReturnType<typeof getPlaceholderJawabOutput> | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!inputText.trim()) return setError('Ceritakan apa yang ingin kamu sampaikan.')
    setError(null)

    const formData = new FormData()
    formData.set('input_text', inputText)
    formData.set('intent_type', intent)
    formData.set('emotion_level', emotion)

    startTransition(async () => {
      const result = await saveJawabSession(formData)
      if (result?.error) return setError(result.error)
      setOutput(getPlaceholderJawabOutput(inputText, emotion))
      setStep('output')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  return (
    <div className="page-container py-5 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink-700">Jawab dengan Tenang</h1>
        <p className="text-sm text-ink-400 mt-1.5 leading-relaxed">
          {step === 'form'
            ? 'Ada sesuatu yang ingin kamu sampaikan tapi belum menemukan kata yang tepat? Mulai dari sini.'
            : 'Berikut kata-kata yang mungkin bisa membantu.'}
        </p>
      </div>

      {step === 'form' ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert variant="error">{error}</Alert>}

          <Textarea
            label="Apa yang ingin kamu sampaikan?"
            placeholder="Ceritakan apa yang ada di pikiranmu. Tidak perlu rapi. Tidak perlu sempurna."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={4}
            showCount
            maxLength={500}
            required
          />

          <div className="field-wrapper">
            <label className="text-sm font-medium text-ink-600">Niat utamamu menyampaikan ini</label>
            <div className="grid gap-2">
              {INTENT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setIntent(v => v === opt.value ? '' : opt.value)}
                  className={cn(
                    'text-left px-4 py-3 rounded-xl border-2 text-sm transition-all',
                    intent === opt.value
                      ? 'border-teal-600 bg-teal-50 text-teal-700 font-medium'
                      : 'border-cream-200 bg-white text-ink-500 hover:border-teal-200',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field-wrapper">
            <label className="text-sm font-medium text-ink-600">Kondisi emosimu saat ini</label>
            <div className="grid grid-cols-2 gap-2">
              {EMOTION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setEmotion(v => v === opt.value ? '' : opt.value)}
                  className={cn(
                    'px-3 py-2.5 rounded-xl border-2 text-xs font-medium transition-all text-center',
                    emotion === opt.value
                      ? 'border-gold-500 bg-gold-50 text-gold-700'
                      : 'border-cream-200 bg-white text-ink-500 hover:border-gold-200',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={isPending}>
            Bantu Aku Menyusun Kata
          </Button>
        </form>
      ) : output && (
        <FeatureOutputSection
          blocks={[
            { label: 'Yang sepertinya sedang kamu rasakan', content: output.feeling_reflection },
            { label: 'Kalimat yang bisa kamu coba', content: output.suggested_sentences.map((s, i) => `${i + 1}. ${s.text}`).join('\n\n'), variant: 'highlight' },
            { label: 'Waktu yang mungkin lebih tepat', content: output.timing_note, variant: 'default' },
          ]}
          onSave={() => setIsSaved(true)}
          onReset={() => { setStep('form'); setOutput(null); setIsSaved(false) }}
          isSaved={isSaved}
        />
      )}
    </div>
  )
}
