'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveOnboardingAction } from '@/app/actions/profile'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { cn } from '@/lib/utils/cn'

// ============================================================
// ONBOARDING
// Route: /app/onboarding
// First-time setup untuk user baru.
// 3 pertanyaan singkat untuk memahami konteks.
// ============================================================

interface OnboardingStep {
  key: string
  title: string
  subtitle: string
  options: Array<{ value: string; label: string; desc?: string }>
}

const STEPS: OnboardingStep[] = [
  {
    key: 'feeling_lately',
    title: 'Apa yang paling sering kamu rasakan di rumah tangga belakangan ini?',
    subtitle: 'Tidak ada jawaban yang benar atau salah. Pilih yang paling mendekati.',
    options: [
      {
        value: 'tidak_didengarkan',
        label: 'Merasa tidak didengarkan',
        desc: 'Bicara tapi terasa tidak sampai.',
      },
      {
        value: 'tidak_tahu_harus_berkata_apa',
        label: 'Tidak tahu harus berkata apa',
        desc: 'Ada yang ingin disampaikan tapi kata yang tepat tidak kunjung datang.',
      },
      {
        value: 'terlalu_banyak_ditanggung_sendiri',
        label: 'Terlalu banyak yang ditanggung sendiri',
        desc: 'Pundak terasa penuh tapi tidak tahu bagaimana minta tolong.',
      },
      {
        value: 'ingin_lebih_dekat_tapi_tidak_tahu_caranya',
        label: 'Ingin lebih dekat tapi tidak tahu caranya',
        desc: 'Ada jarak yang terasa nyata meski tidak ada pertengkaran besar.',
      },
    ],
  },
  {
    key: 'conflict_response',
    title: 'Saat ada ketegangan atau konflik, biasanya kamu...',
    subtitle: 'Ini bukan penilaian. Ini titik awal untuk memahami polamu.',
    options: [
      {
        value: 'langsung_bicara_tapi_sering_salah_kata',
        label: 'Langsung bicara, tapi sering salah kata',
        desc: 'Niat baik tapi hasilnya sering justru memperkeruh.',
      },
      {
        value: 'diam_dulu_tapi_lama_lama_meledak',
        label: 'Diam dulu, tapi lama-lama meledak',
        desc: 'Menahan sampai ada satu titik yang tidak bisa ditahan lagi.',
      },
      {
        value: 'menghindari_konflik',
        label: 'Sebisa mungkin menghindari konflik',
        desc: 'Lebih baik diam daripada membuat keadaan makin buruk.',
      },
      {
        value: 'coba_bicara_tapi_tidak_didengar',
        label: 'Sudah mencoba bicara, tapi tidak didengar',
        desc: 'Kata sudah disampaikan, tapi seperti tidak ada yang menangkap.',
      },
    ],
  },
  {
    key: 'main_hope',
    title: 'Apa yang paling ingin kamu perbaiki?',
    subtitle: 'Satu hal yang paling berarti jika bisa berubah mulai dari sekarang.',
    options: [
      {
        value: 'pahami_pasangan',
        label: 'Lebih memahami pasanganku',
        desc: 'Ingin tahu apa yang sebenarnya ada di balik kata dan sikapnya.',
      },
      {
        value: 'sampaikan_perasaan',
        label: 'Bisa menyampaikan perasaanku dengan lebih baik',
        desc: 'Apa yang ada di hati sering tidak keluar dengan tepat.',
      },
      {
        value: 'komunikasi_lebih_baik',
        label: 'Komunikasi yang lebih tenang dan produktif',
        desc: 'Bicara tanpa berakhir dengan pertengkaran atau keheningan yang menyakitkan.',
      },
      {
        value: 'tenang_sebelum_bereaksi',
        label: 'Lebih tenang sebelum bereaksi',
        desc: 'Tidak mau terus menyesal setelah kata sudah terlanjur keluar.',
      },
    ],
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const currentStep = STEPS[step]
  const isLastStep = step === STEPS.length - 1
  const progress = ((step + 1) / STEPS.length) * 100

  function handleSelect(value: string) {
    const newAnswers = { ...answers, [currentStep.key]: value }
    setAnswers(newAnswers)

    if (!isLastStep) {
      // Auto-advance to next step
      setTimeout(() => setStep(s => s + 1), 200)
    } else {
      // Submit
      const formData = new FormData()
      Object.entries(newAnswers).forEach(([k, v]) => formData.set(k, v))

      startTransition(async () => {
        const result = await saveOnboardingAction(formData)
        if (result?.error) {
          setError(result.error)
          return
        }
        router.push('/app/hari-ini')
      })
    }
  }

  return (
    <div className="min-h-dvh bg-cream-100 flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-cream-300">
        <div
          className="h-full bg-teal-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col page-container pt-8 pb-12">
        {/* Step indicator */}
        <p className="text-xs text-ink-400 font-medium mb-8">
          Langkah {step + 1} dari {STEPS.length}
        </p>

        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-7 h-7 rounded-lg bg-teal-gradient flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="currentColor">
              <path d="M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z" />
            </svg>
          </div>
          <span className="font-bold text-ink-700">Pahami Dia</span>
        </div>

        {/* Question */}
        <div className="mb-6 animate-fade-in" key={step}>
          <h1 className="text-xl font-bold text-ink-700 leading-snug text-balance mb-2">
            {currentStep.title}
          </h1>
          <p className="text-sm text-ink-400 leading-relaxed">
            {currentStep.subtitle}
          </p>
        </div>

        {error && (
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
        )}

        {/* Options */}
        <div className="space-y-3 animate-fade-in" key={`opts-${step}`}>
          {currentStep.options.map((option) => {
            const isSelected = answers[currentStep.key] === option.value

            return (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                disabled={isPending}
                className={cn(
                  'w-full text-left p-4 rounded-2xl border-2 transition-all duration-200',
                  'hover:border-teal-300 hover:shadow-sm active:scale-[0.99]',
                  isSelected
                    ? 'border-teal-600 bg-teal-50 shadow-sm'
                    : 'border-cream-200 bg-white',
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                    isSelected
                      ? 'border-teal-600 bg-teal-600'
                      : 'border-cream-300',
                  )}>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div>
                    <p className={cn(
                      'text-sm font-semibold leading-snug',
                      isSelected ? 'text-teal-700' : 'text-ink-700',
                    )}>
                      {option.label}
                    </p>
                    {option.desc && (
                      <p className="text-xs text-ink-400 mt-0.5 leading-relaxed">
                        {option.desc}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Loading state */}
        {isPending && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-4 h-4 rounded-full border-2 border-cream-300 border-t-teal-600 animate-spin" />
            <span className="text-xs text-ink-400">Menyimpan preferensimu...</span>
          </div>
        )}

        {/* Back button */}
        {step > 0 && !isPending && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="mt-6 text-sm text-ink-400 hover:text-ink-600 transition-colors mx-auto"
          >
            Kembali
          </button>
        )}

        {/* Skip */}
        {!isPending && (
          <button
            onClick={() => {
              const formData = new FormData()
              Object.entries(answers).forEach(([k, v]) => formData.set(k, v))
              if (!formData.get('feeling_lately')) formData.set('feeling_lately', 'tidak_didengarkan')
              if (!formData.get('conflict_response')) formData.set('conflict_response', 'belum_tahu')
              if (!formData.get('main_hope')) formData.set('main_hope', 'komunikasi_lebih_baik')
              startTransition(async () => {
                await saveOnboardingAction(formData)
                router.push('/app/hari-ini')
              })
            }}
            className="mt-4 text-xs text-ink-300 hover:text-ink-400 transition-colors mx-auto"
          >
            Lewati untuk sekarang
          </button>
        )}
      </div>
    </div>
  )
}
