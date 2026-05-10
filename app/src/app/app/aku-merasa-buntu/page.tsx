'use client'

// ============================================================
// ACU MERASA BUNTU
// Route: /app/aku-merasa-buntu
// ============================================================

import { useState, useTransition } from 'react'
import { saveBuntuSession } from '@/app/actions/features'
import { getPlaceholderBuntuOutput } from '@/lib/placeholders/feature-outputs'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { FeatureOutputSection } from '@/components/features/FeatureShell'
import { cn } from '@/lib/utils/cn'

const BUNTU_QUESTIONS = [
  {
    key: 'q1',
    text: 'Terakhir kali ada konflik atau ketegangan, apa yang biasanya kamu lakukan?',
    options: [
      { value: 'diam',          label: 'Diam dan menunggu reda sendiri' },
      { value: 'membela_diri',  label: 'Menjelaskan sudut pandangku' },
      { value: 'keluar_ruangan',label: 'Keluar atau menghindar sebentar' },
      { value: 'minta_maaf',    label: 'Langsung minta maaf meski belum tahu salahnya di mana' },
    ],
  },
  {
    key: 'q2',
    text: 'Menurut dugaanmu, apa yang paling sering membuat istrimu kecewa atau kesal?',
    options: [
      { value: 'tidak_hadir',       label: 'Tidak hadir secara emosional' },
      { value: 'tidak_membantu',    label: 'Kurang membantu urusan rumah tangga' },
      { value: 'tidak_mendengar',   label: 'Tidak benar-benar mendengarkan' },
      { value: 'tidak_tahu',        label: 'Jujur aku tidak tahu' },
    ],
  },
  {
    key: 'q3',
    text: 'Apa yang paling sulit untuk kamu katakan kepada istrimu sekarang?',
    isOpen: true,
  },
]

export default function AkuMerasaBuntuPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [openAnswer, setOpenAnswer] = useState('')
  const [resultStep, setResultStep] = useState<'form' | 'output'>('form')
  const [output, setOutput] = useState<ReturnType<typeof getPlaceholderBuntuOutput> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isSaved, setIsSaved] = useState(false)

  const currentQ = BUNTU_QUESTIONS[step]
  const isLastQ = step === BUNTU_QUESTIONS.length - 1

  function handleChoice(value: string) {
    setAnswers(prev => ({ ...prev, [currentQ.key]: value }))
    if (!isLastQ) setStep(s => s + 1)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const finalAnswers = { ...answers, [BUNTU_QUESTIONS[BUNTU_QUESTIONS.length - 1].key]: openAnswer }
    const formData = new FormData()
    Object.entries(finalAnswers).forEach(([k, v]) => formData.set(`answer_${k}`, v))

    startTransition(async () => {
      const result = await saveBuntuSession(formData)
      if (result?.error) return setError(result.error)
      setOutput(getPlaceholderBuntuOutput())
      setResultStep('output')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  return (
    <div className="page-container py-5 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink-700">Aku Merasa Buntu</h1>
        <p className="text-sm text-ink-400 mt-1.5 leading-relaxed">
          {resultStep === 'form'
            ? 'Buntu itu wajar. Mulai dari jujur dulu tentang apa yang sedang kamu rasakan.'
            : 'Ini bukan tentang siapa yang salah. Ini tentang langkah selanjutnya.'}
        </p>
      </div>

      {resultStep === 'form' ? (
        <div className="space-y-5">
          <div className="flex gap-1.5">
            {BUNTU_QUESTIONS.map((_, i) => (
              <div key={i} className={cn('h-1 flex-1 rounded-full transition-colors', i <= step ? 'bg-teal-600' : 'bg-cream-300')} />
            ))}
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          <div className="bg-white rounded-2xl border border-cream-200 shadow-card p-5">
            <p className="text-sm text-ink-400 mb-1">Pertanyaan {step + 1} dari {BUNTU_QUESTIONS.length}</p>
            <p className="text-base font-semibold text-ink-700 leading-snug mb-5">{currentQ.text}</p>

            {currentQ.isOpen ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                  placeholder="Tidak apa-apa kalau belum tahu jawabannya. Tulis apa yang terlintas."
                  value={openAnswer}
                  onChange={(e) => setOpenAnswer(e.target.value)}
                  rows={4}
                  showCount
                  maxLength={300}
                />
                <Button type="submit" variant="primary" size="md" fullWidth loading={isPending}>
                  Lihat Hasilnya
                </Button>
              </form>
            ) : (
              <div className="grid gap-2">
                {currentQ.options?.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleChoice(opt.value)}
                    className={cn(
                      'text-left px-4 py-3 rounded-xl border-2 text-sm transition-all',
                      answers[currentQ.key] === opt.value ? 'border-teal-600 bg-teal-50 text-teal-700 font-medium' : 'border-cream-200 bg-white text-ink-500 hover:border-teal-200',
                    )}
                  >{opt.label}</button>
                ))}
              </div>
            )}
          </div>

          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="text-sm text-ink-400 hover:text-ink-600">
              Kembali
            </button>
          )}
        </div>
      ) : output && (
        <FeatureOutputSection
          blocks={[
            { label: 'Apa yang sudah kamu lakukan', content: output.acknowledgment, variant: 'highlight' },
            { label: 'Yang mungkin sedang dirasakan istrimu', content: output.perspective_shift },
            { label: 'Satu langkah kecil yang bisa dimulai hari ini', content: output.one_small_step, variant: 'default' },
          ]}
          onSave={() => setIsSaved(true)}
          onReset={() => { setResultStep('form'); setOutput(null); setStep(0); setAnswers({}); setOpenAnswer(''); setIsSaved(false) }}
          isSaved={isSaved}
        />
      )}
    </div>
  )
}
