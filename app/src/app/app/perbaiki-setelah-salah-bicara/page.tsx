'use client'

import { useState, useTransition } from 'react'
import { savePerbaikiSession } from '@/app/actions/features'
import { getPlaceholderPerbaikiOutput } from '@/lib/placeholders/feature-outputs'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { FeatureOutputSection } from '@/components/features/FeatureShell'
import { cn } from '@/lib/utils/cn'

// ============================================================
// PERBAIKI SETELAH SALAH BICARA
// Route: /app/perbaiki-setelah-salah-bicara
// ============================================================

const CONDITION_OPTIONS = [
  { value: 'pasangan_sedang_marah', label: 'Pasanganku masih marah' },
  { value: 'masih_tegang',          label: 'Suasana masih tegang di antara kami' },
  { value: 'tidak_bicara_beberapa_jam', label: 'Kami belum bicara beberapa jam ini' },
  { value: 'perlu_memulai',         label: 'Aku yang perlu memulai, tapi belum tahu caranya' },
]

const GOAL_OPTIONS = [
  { value: 'meminta_maaf',                     label: 'Meminta maaf dengan sungguh-sungguh' },
  { value: 'membuka_percakapan',               label: 'Membuka kembali percakapan' },
  { value: 'memberi_waktu_tapi_tetap_peduli',  label: 'Memberi ruang tapi menunjukkan bahwa aku peduli' },
  { value: 'belum_tahu',                       label: 'Belum tahu, bantu aku menemukan' },
]

export default function PerbaikiSetelahSalahBicaraPage() {
  const [step, setStep] = useState<'form' | 'output'>('form')
  const [description, setDescription] = useState('')
  const [condition, setCondition] = useState('')
  const [goal, setGoal] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [output, setOutput] = useState<ReturnType<typeof getPlaceholderPerbaikiOutput> | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!description.trim()) return setError('Ceritakan sedikit apa yang terjadi.')
    setError(null)

    const formData = new FormData()
    formData.set('description_text', description)
    formData.set('current_condition', condition)
    formData.set('goal_type', goal)

    startTransition(async () => {
      const result = await savePerbaikiSession(formData)
      if (result?.error) return setError(result.error)
      setOutput(getPlaceholderPerbaikiOutput(condition))
      setStep('output')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  return (
    <div className="page-container py-5 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink-700">Perbaiki Setelah Salah Bicara</h1>
        <p className="text-sm text-ink-400 mt-1.5 leading-relaxed">
          {step === 'form'
            ? 'Kamu sudah ada di sini. Itu langkah pertamanya. Ceritakan apa yang terjadi, dan kita cari langkah selanjutnya bersama.'
            : 'Tidak ada yang perlu terburu-buru. Ini langkah yang bisa kamu pilih.'}
        </p>
      </div>

      {step === 'form' ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <Alert variant="error">{error}</Alert>}

          <Textarea
            label="Apa yang terjadi?"
            placeholder="Ceritakan singkat apa yang terjadi. Tidak perlu urut, tidak perlu lengkap."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            showCount
            maxLength={500}
            hint="Deskripsi ini tidak dibagikan ke siapapun. Hanya untuk membantu kami memahami situasimu."
          />

          <div className="field-wrapper">
            <label className="text-sm font-medium text-ink-600">Kondisi sekarang seperti apa?</label>
            <div className="grid gap-2">
              {CONDITION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCondition(v => v === opt.value ? '' : opt.value)}
                  className={cn(
                    'text-left px-4 py-3 rounded-xl border-2 text-sm transition-all',
                    condition === opt.value ? 'border-teal-600 bg-teal-50 text-teal-700 font-medium' : 'border-cream-200 bg-white text-ink-500 hover:border-teal-200',
                  )}
                >{opt.label}</button>
              ))}
            </div>
          </div>

          <div className="field-wrapper">
            <label className="text-sm font-medium text-ink-600">Apa yang ingin kamu capai?</label>
            <div className="grid gap-2">
              {GOAL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setGoal(v => v === opt.value ? '' : opt.value)}
                  className={cn(
                    'text-left px-4 py-3 rounded-xl border-2 text-sm transition-all',
                    goal === opt.value ? 'border-teal-600 bg-teal-50 text-teal-700 font-medium' : 'border-cream-200 bg-white text-ink-500 hover:border-teal-200',
                  )}
                >{opt.label}</button>
              ))}
            </div>
          </div>

          <Button type="submit" variant="primary" size="lg" fullWidth loading={isPending}>
            Bantu Aku Mulai
          </Button>
        </form>
      ) : output && (
        <FeatureOutputSection
          blocks={[
            { label: 'Tentang situasimu', content: output.situation_reflection },
            { label: 'Waktu yang mungkin lebih tepat', content: output.timing_guidance, variant: 'default' },
            { label: 'Kalimat pembuka untuk diucapkan langsung', content: output.opener_spoken, variant: 'highlight' },
            { label: 'Atau kirim via pesan teks dulu', content: output.opener_text, variant: 'default' },
          ]}
          onSave={() => setIsSaved(true)}
          onReset={() => { setStep('form'); setOutput(null); setDescription(''); setCondition(''); setGoal(''); setIsSaved(false) }}
          isSaved={isSaved}
        />
      )}
    </div>
  )
}
