'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { ButtonLink } from './Button'

// ============================================================
// TrialBanner, PaywallCard, SafetyNotice
// ============================================================

export interface TrialBannerProps {
  daysLeft: number
  className?: string
}

export function TrialBanner({ daysLeft, className }: TrialBannerProps) {
  const isLastDay = daysLeft === 0
  return (
    <div
      className={cn(
        'w-full px-4 py-2.5 flex items-center justify-between gap-3 text-sm animate-slide-down',
        isLastDay
          ? 'bg-yellow-500 text-white'
          : 'bg-teal-50 text-teal-700 border-b border-teal-100',
        className
      )}
      role="status"
    >
      <p className="font-medium text-xs leading-snug">
        {isLastDay
          ? 'Trial-mu berakhir hari ini. Lanjutkan untuk tetap bisa menggunakan semua fitur.'
          : `Trial aktif. Sisa ${daysLeft} hari lagi.`}
      </p>
      <Link
        href="/app/subscription"
        className={cn(
          'flex-shrink-0 inline-flex items-center justify-center h-7 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors duration-200',
          isLastDay
            ? 'bg-white text-yellow-600 hover:bg-yellow-50'
            : 'bg-teal-700 text-white hover:bg-teal-800'
        )}
      >
        {isLastDay ? 'Subscribe Sekarang' : 'Lihat Detail'}
      </Link>
    </div>
  )
}

export interface PaywallCardProps {
  feature?: string
  variant?: 'inline' | 'full' | 'minimal'
  className?: string
}

export function PaywallCard({ feature, variant = 'inline', className }: PaywallCardProps) {
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-2 p-3 bg-cream-200 rounded-xl', className)}>
        <LockIcon className="w-4 h-4 text-ink-400 flex-shrink-0" />
        <p className="text-sm text-ink-400">Fitur ini membutuhkan langganan aktif.</p>
        <Link
          href="/app/subscription"
          className="ml-auto flex-shrink-0 text-xs font-semibold text-teal-700 hover:text-teal-800 transition-colors"
        >
          Mulai
        </Link>
      </div>
    )
  }

  if (variant === 'full') {
    return (
      <div className={cn('flex flex-col items-center text-center gap-5 py-12 px-6', className)}>
        <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center">
          <LockIcon className="w-8 h-8 text-teal-300" />
        </div>
        <div className="space-y-2">
          <p className="text-base font-semibold text-ink-700">
            {feature ? `${feature} membutuhkan langganan aktif.` : 'Fitur ini membutuhkan langganan aktif.'}
          </p>
          <p className="text-sm text-ink-400 leading-relaxed max-w-xs">
            Lanjutkan dengan Rp10.000 per bulan. Batalkan kapan saja.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <ButtonLink href="/app/subscription" size="lg" fullWidth>
            Mulai Berlangganan
          </ButtonLink>
          <p className="text-xs text-ink-400 text-center">Rp10.000 / bulan. Batalkan kapan saja.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      'bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-100 rounded-2xl p-5 flex flex-col gap-4',
      className
    )}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
          <LockIcon className="w-5 h-5 text-teal-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-teal-800 leading-snug">
            {feature ? `Lanjutkan menggunakan ${feature}` : 'Trial-mu sudah selesai'}
          </p>
          <p className="text-xs text-teal-600 mt-1 leading-relaxed">
            Data dan catatanmu tetap aman. Lanjutkan dengan Rp10.000 per bulan.
          </p>
        </div>
      </div>
      <ButtonLink href="/app/subscription" size="md" fullWidth>
        Lanjutkan dengan Rp10.000/bulan
      </ButtonLink>
      <p className="text-xs text-teal-500 text-center">Batalkan kapan saja. Tidak ada pertanyaan.</p>
    </div>
  )
}

export interface SafetyNoticeProps {
  onContinue?: () => void
  className?: string
}

export function SafetyNotice({ onContinue, className }: SafetyNoticeProps) {
  return (
    <div
      className={cn('bg-white rounded-2xl border border-cream-200 shadow-md p-5 space-y-4', className)}
      role="dialog"
      aria-label="Informasi bantuan"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
          <HeartIcon className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink-700">Hei, sebentar.</p>
          <p className="text-xs text-ink-400 mt-0.5 leading-relaxed">
            Sepertinya situasi yang kamu hadapi lebih berat dari biasanya. Kami ingin memastikan kamu baik-baik saja.
          </p>
        </div>
      </div>

      <p className="text-sm text-ink-500 leading-relaxed">
        Jika kamu atau orang yang kamu cintai sedang dalam situasi yang tidak aman, ada orang yang bisa membantu.
      </p>

      <div className="space-y-2">
        <SafetyContact name="Yayasan Pulih" description="Konseling dan pemulihan psikologis" contact="021-788-42580" />
        <SafetyContact name="Into The Light Indonesia" description="Layanan kesehatan jiwa dan krisis" contact="119 ext 8" />
        <SafetyContact name="Komnas Perempuan" description="Perlindungan dan pendampingan" contact="021-3903963" />
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <a
          href="tel:119"
          className="inline-flex items-center justify-center w-full h-11 px-5 text-sm font-semibold rounded-xl bg-teal-700 text-white hover:bg-teal-800 transition-colors"
        >
          Hubungi Bantuan Sekarang
        </a>
        {onContinue && (
          <button
            onClick={onContinue}
            className="text-xs text-ink-400 hover:text-ink-600 transition-colors py-1 text-center"
          >
            Aku baik-baik saja, lanjutkan
          </button>
        )}
      </div>
    </div>
  )
}

function SafetyContact({ name, description, contact }: { name: string; description: string; contact: string }) {
  return (
    <a
      href={`tel:${contact.replace(/\s/g, '')}`}
      className="flex items-center justify-between p-3 bg-cream-100 rounded-xl hover:bg-cream-200 transition-colors group"
    >
      <div>
        <p className="text-xs font-semibold text-ink-600">{name}</p>
        <p className="text-2xs text-ink-400">{description}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-xs font-mono font-medium text-teal-700">{contact}</span>
        <PhoneIcon className="w-3.5 h-3.5 text-teal-600 group-hover:text-teal-700" />
      </div>
    </a>
  )
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}
function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>
  )
}
function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.41 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.55a16 16 0 0 0 6.55 6.55l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  )
}
