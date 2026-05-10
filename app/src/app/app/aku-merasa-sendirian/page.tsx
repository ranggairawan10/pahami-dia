'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { saveSendirianSession } from '@/app/actions/features'
import { getPlaceholderSendirianOutput } from '@/lib/placeholders/feature-outputs'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Alert } from '@/components/ui/Alert'
import { FeatureOutputSection } from '@/components/features/FeatureShell'
import { cn } from '@/lib/utils/cn'

// ============================================================
// ACU MERASA SENDIRIAN
// Route: /app/aku-merasa-sendirian
// ============================================================

const QUESTIONS = [
  {
    key: 'q1',
    text: 'Kapan terakhir kali kamu merasa benar-benar ditemani oleh pasanganmu?',
    options: [
      { value: 'hari_ini', label: 'Hari ini' },
      { value: 'minggu_ini', label: 'Minggu ini' },
      { value: 'lama_sekali', label: 'Sudah lama sekali' },
      { value: 'tidak_ingat', label: 'Tidak ingat' },
    ],
  },
  {
    key: 'q2',
    text: 'Apa yang paling membuatmu merasa tidak ditemani?',
    options: [
      { value: 'tidak_didengar',      label: 'Tidak didengarkan' },
      { value: 'tidak_dilibatkan',    label: 'Tidak dilibatkan dalam keputusan' },
      { value: 'tidak_ada_secara_emosional', label: 'Ada secara fisik tapi tidak hadir secara emosional' },
      { value: 'semua_sendiri',       label: 'Mengerjakan segalanya sendiri' },
    ],
  },
  {
    key: 'q3',
    text: 'Kalau kamu bisa meminta satu hal dari pasanganmu sekarang, apa itu?',
    isOpen: true,
  },
]

export default function AkuMerasaSendirianPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [openAnswer, setOpenAnswer] = useState('')
  const [resultStep, setResultStep] = useState<'form' | 'output'>('form')
  const [output, setOutput] = useState<ReturnType<typeof getPlaceholderSendirianOutput> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isSaved, setIsSaved] = useState(false)

  const currentQ = QUESTIONS[step]
  const isLastQ = step === QUESTIONS.length - 1

  function handleChoice(value: string) {
    setAnswers(prev => ({ ...prev, [currentQ.key]: value }))
    if (!isLastQ) setStep(s => s + 1)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const finalAnswers = { ...answers, [QUESTIONS[QUESTIONS.length - 1].key]: openAnswer }
    const formData = new FormData()
    Object.entries(finalAnswers).forEach(([k, v]) => formData.set(`answer_${k}`, v))

    startTransition(async () => {
      const result = await saveSendirianSession(formData)
      if (result?.error) return setError(result.error)
      setOutput(getPlaceholderSendirianOutput())
      setResultStep('output')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })
  }

  return (
    <div className="page-container py-5 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink-700">Aku Merasa Sendirian</h1>
        <p className="text-sm text-ink-400 mt-1.5 leading-relaxed">
          {resultStep === 'form'
            ? 'Tidak apa-apa merasa seperti ini. Ruang ini aman. Ceritakan.'
            : 'Terima kasih sudah berbagi. Rasamu itu nyata.'}
        </p>
      </div>

      {resultStep === 'form' ? (
        <div className="space-y-5">
          {/* Progress */}
          <div className="flex gap-1.5">
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors duration-300',
                  i <= step ? 'bg-teal-600' : 'bg-cream-300',
                )}
              />
            ))}
          </div>

          {error && <Alert variant="error">{error}</Alert>}

          {/* Question Card */}
          <div className="bg-white rounded-2xl border border-cream-200 shadow-card p-5">
            <p className="text-sm text-ink-400 mb-1">
              Pertanyaan {step + 1} dari {QUESTIONS.length}
            </p>
            <p className="text-base font-semibold text-ink-700 leading-snug mb-5">
              {currentQ.text}
            </p>

            {currentQ.isOpen ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Textarea
                  placeholder="Tulis apa yang terlintas. Tidak ada jawaban yang salah."
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
                      answers[currentQ.key] === opt.value
                        ? 'border-teal-600 bg-teal-50 text-teal-700 font-medium'
                        : 'border-cream-200 bg-white text-ink-500 hover:border-teal-200',
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Back button */}
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="text-sm text-ink-400 hover:text-ink-600 transition-colors"
            >
              Kembali ke pertanyaan sebelumnya
            </button>
          )}
        </div>
      ) : output && (
        <FeatureOutputSection
          blocks={[
            { label: 'Yang ingin kami akui', content: output.validation, variant: 'highlight' },
            { label: 'Pertanyaan untuk direnungkan', content: output.reflection_question, variant: 'default' },
            ...(output.offer_next_step ? [{
              label: 'Kalau kamu siap',
              content: 'Pahami Dia bisa membantu kamu menyusun kalimat untuk menyampaikan ini ke pasanganmu.',
              variant: 'default' as const,
            }] : []),
          ]}
          onSave={() => setIsSaved(true)}
          onReset={() => { setResultStep('form'); setOutput(null); setStep(0); setAnswers({}); setOpenAnswer(''); setIsSaved(false) }}
          isSaved={isSaved}
        />
      )}
      {resultStep === 'output' && output?.offer_next_step && (
        <div className="mt-4">
          <Link
            href="/app/jawab-dengan-tenang"
            className="flex items-center justify-center w-full h-11 rounded-xl border-2 border-teal-300 text-teal-700 text-sm font-semibold hover:bg-teal-50 transition-colors"
          >
            Susun Kalimat untuk Pasanganku
          </Link>
        </div>
      )}
    </div>
  )
}
