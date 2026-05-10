'use client'

import { cn } from '@/lib/utils/cn'
import { PaywallCard } from '@/components/ui/SafetyNotice'

// ============================================================
// FeaturePageShell
// Wrapper untuk semua halaman fitur di app.
// Menghandle: paywall state, loading state, dan layout dasar.
// ============================================================

export interface FeaturePageShellProps {
  title: string
  subtitle?: string
  hasAccess: boolean
  featureName?: string
  children: React.ReactNode
  className?: string
}

export function FeaturePageShell({
  title,
  subtitle,
  hasAccess,
  featureName,
  children,
  className,
}: FeaturePageShellProps) {
  return (
    <div className={cn('page-container py-5 animate-fade-in', className)}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-ink-700 leading-snug text-balance">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1.5 text-sm text-ink-400 leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Content or Paywall */}
      {hasAccess ? (
        children
      ) : (
        <PaywallCard feature={featureName} variant="full" />
      )}
    </div>
  )
}

// ============================================================
// FeatureOutputSection
// Menampilkan output dari fitur refleksi.
// Digunakan setelah form berhasil disubmit.
// ============================================================

export interface OutputBlock {
  label: string
  content: string
  variant?: 'default' | 'highlight' | 'warning'
  icon?: React.ReactNode
}

export interface FeatureOutputSectionProps {
  blocks: OutputBlock[]
  onSave?: () => void
  onReset?: () => void
  isSaved?: boolean
  sessionId?: string
  className?: string
}

export function FeatureOutputSection({
  blocks,
  onSave,
  onReset,
  isSaved = false,
  className,
}: FeatureOutputSectionProps) {
  return (
    <div className={cn('space-y-4 animate-fade-up', className)}>
      {/* Output blocks */}
      {blocks.map((block, i) => (
        <OutputBlock key={i} block={block} />
      ))}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        {onSave && (
          <button
            onClick={onSave}
            disabled={isSaved}
            className={cn(
              'flex-1 h-11 rounded-xl text-sm font-semibold transition-all duration-200',
              isSaved
                ? 'bg-success-50 text-success-700 border border-success-50 cursor-default'
                : 'bg-teal-50 text-teal-700 border border-teal-100 hover:bg-teal-100'
            )}
          >
            {isSaved ? 'Tersimpan' : 'Simpan ke Riwayat'}
          </button>
        )}

        {onReset && (
          <button
            onClick={onReset}
            className="h-11 px-4 rounded-xl text-sm font-medium text-ink-400 hover:text-ink-600 hover:bg-cream-200 transition-all duration-200"
          >
            Coba Lain
          </button>
        )}
      </div>

      {/* Feedback */}
      <FeedbackRow />
    </div>
  )
}

function OutputBlock({ block }: { block: OutputBlock }) {
  return (
    <div
      className={cn(
        'rounded-2xl p-5 space-y-1.5',
        block.variant === 'highlight' && 'bg-teal-50 border border-teal-100',
        block.variant === 'warning'   && 'bg-gold-50 border border-gold-100',
        !block.variant || block.variant === 'default'
          ? 'bg-white shadow-card border border-cream-200'
          : '',
      )}
    >
      <div className="flex items-center gap-2">
        {block.icon && (
          <span className="w-4 h-4 text-teal-500 flex-shrink-0">{block.icon}</span>
        )}
        <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide">
          {block.label}
        </p>
      </div>
      <p className="text-sm text-ink-600 leading-relaxed">{block.content}</p>
    </div>
  )
}

function FeedbackRow() {
  return (
    <div className="flex items-center gap-3 pt-1">
      <p className="text-xs text-ink-400 flex-1">Apakah ini membantu?</p>
      <button className="text-xs text-ink-400 hover:text-teal-700 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-teal-50">
        Ya, membantu
      </button>
      <button className="text-xs text-ink-400 hover:text-ink-600 transition-colors font-medium px-3 py-1.5 rounded-lg hover:bg-cream-200">
        Kurang pas
      </button>
    </div>
  )
}

// ============================================================
// ReflectionStepIndicator
// Progress indicator untuk multi-step refleksi
// ============================================================

export function ReflectionStepIndicator({
  steps,
  currentStep,
}: {
  steps: string[]
  currentStep: number
}) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2 flex-1">
          <div
            className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors',
              i < currentStep && 'bg-teal-700 text-white',
              i === currentStep && 'bg-teal-100 text-teal-700 border-2 border-teal-600',
              i > currentStep && 'bg-cream-200 text-ink-400',
            )}
          >
            {i < currentStep ? (
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          {i < steps.length - 1 && (
            <div className={cn(
              'h-0.5 flex-1 rounded-full transition-colors',
              i < currentStep ? 'bg-teal-600' : 'bg-cream-300',
            )} />
          )}
        </div>
      ))}
    </div>
  )
}

// ============================================================
// ChoiceGrid
// Grid pemilihan kondisi / situasi
// ============================================================

export interface Choice {
  value: string
  label: string
  description?: string
}

export function ChoiceGrid({
  choices,
  selected,
  onSelect,
  multi = false,
  name,
}: {
  choices: Choice[]
  selected: string | string[]
  onSelect: (value: string) => void
  multi?: boolean
  name: string
}) {
  const isSelected = (value: string) => {
    if (multi && Array.isArray(selected)) return selected.includes(value)
    return selected === value
  }

  return (
    <div className="grid grid-cols-1 gap-2">
      {choices.map((choice) => (
        <button
          key={choice.value}
          type="button"
          onClick={() => onSelect(choice.value)}
          className={cn(
            'text-left p-4 rounded-xl border-2 transition-all duration-200',
            'hover:border-teal-300 hover:bg-teal-50/50',
            isSelected(choice.value)
              ? 'border-teal-600 bg-teal-50 shadow-sm'
              : 'border-cream-200 bg-white',
          )}
        >
          <p className={cn(
            'text-sm font-medium transition-colors',
            isSelected(choice.value) ? 'text-teal-700' : 'text-ink-600',
          )}>
            {choice.label}
          </p>
          {choice.description && (
            <p className="text-xs text-ink-400 mt-0.5 leading-relaxed">
              {choice.description}
            </p>
          )}
        </button>
      ))}
    </div>
  )
}
