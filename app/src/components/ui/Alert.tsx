import { cn } from '@/lib/utils/cn'

// ============================================================
// BADGE
// ============================================================

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'teal' | 'gold' | 'success' | 'warning' | 'error' | 'muted'
  size?: 'sm' | 'md'
  dot?: boolean
}

export function Badge({
  className,
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 font-medium rounded-full',

        size === 'sm' && 'text-2xs px-2 py-0.5',
        size === 'md' && 'text-xs px-2.5 py-1',

        variant === 'default' && 'bg-cream-200 text-ink-500',
        variant === 'teal'    && 'bg-teal-50 text-teal-700 border border-teal-100',
        variant === 'gold'    && 'bg-gold-50 text-gold-600 border border-gold-100',
        variant === 'success' && 'bg-success-50 text-success-700',
        variant === 'warning' && 'bg-warning-50 text-warning-700',
        variant === 'error'   && 'bg-error-50 text-error-700',
        variant === 'muted'   && 'bg-cream-100 text-ink-400',

        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full flex-shrink-0',
            variant === 'teal'    && 'bg-teal-500',
            variant === 'gold'    && 'bg-gold-400',
            variant === 'success' && 'bg-success-500',
            variant === 'warning' && 'bg-warning-500',
            variant === 'error'   && 'bg-error-500',
            variant === 'default' && 'bg-ink-400',
            variant === 'muted'   && 'bg-ink-300',
          )}
        />
      )}
      {children}
    </span>
  )
}

// ============================================================
// ALERT
// ============================================================

export interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  children: React.ReactNode
  className?: string
  dismissible?: boolean
  onDismiss?: () => void
}

export function Alert({
  variant = 'info',
  title,
  children,
  className,
}: AlertProps) {
  const icons = {
    info:    <InfoIcon />,
    success: <CheckIcon />,
    warning: <WarningIcon />,
    error:   <XCircleIcon />,
  }

  return (
    <div
      role="alert"
      className={cn(
        'flex gap-3 p-4 rounded-xl text-sm leading-relaxed',
        variant === 'info'    && 'bg-teal-50 text-teal-800 border border-teal-100',
        variant === 'success' && 'bg-success-50 text-success-700 border border-success-50',
        variant === 'warning' && 'bg-gold-50 text-gold-700 border border-gold-100',
        variant === 'error'   && 'bg-error-50 text-error-700 border border-error-50',
        className
      )}
    >
      <span className="flex-shrink-0 w-5 h-5 mt-0.5">{icons[variant]}</span>
      <div className="min-w-0">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        <div className="opacity-90">{children}</div>
      </div>
    </div>
  )
}

// ============================================================
// LOADING STATE
// ============================================================

export interface LoadingStateProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingState({
  message = 'Sedang memuat...',
  size = 'md',
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12',
        className
      )}
      role="status"
      aria-label={message}
    >
      <div className="relative">
        <div
          className={cn(
            'rounded-full border-2 border-cream-300 animate-spin',
            'border-t-teal-600',
            size === 'sm' && 'w-8 h-8',
            size === 'md' && 'w-10 h-10',
            size === 'lg' && 'w-12 h-12',
          )}
        />
      </div>
      {message && (
        <p className="text-sm text-ink-400 animate-pulse-soft">{message}</p>
      )}
    </div>
  )
}

// ============================================================
// EMPTY STATE
// ============================================================

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-12 text-center px-6',
        className
      )}
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-cream-200 flex items-center justify-center text-ink-300">
          {icon}
        </div>
      )}
      <div className="space-y-1.5">
        <p className="font-semibold text-ink-600 text-base leading-snug">
          {title}
        </p>
        {description && (
          <p className="text-sm text-ink-400 leading-relaxed max-w-xs mx-auto">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}

// ============================================================
// ERROR STATE
// ============================================================

export interface ErrorStateProps {
  title?: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function ErrorState({
  title = 'Terjadi kesalahan',
  description = 'Coba muat ulang halaman ini. Jika masalah berlanjut, hubungi kami melalui halaman bantuan.',
  action,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-12 text-center px-6',
        className
      )}
      role="alert"
    >
      <div className="w-14 h-14 rounded-2xl bg-error-50 flex items-center justify-center">
        <XCircleIcon className="w-7 h-7 text-error-500" />
      </div>
      <div className="space-y-1.5">
        <p className="font-semibold text-ink-600 text-base">{title}</p>
        {description && (
          <p className="text-sm text-ink-400 leading-relaxed max-w-xs mx-auto">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}

// ============================================================
// Icons
// ============================================================
const svgBase = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

function InfoIcon({ className }: { className?: string }) {
  return <svg {...svgBase} className={className ?? "w-full h-full"}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
}
function CheckIcon({ className }: { className?: string }) {
  return <svg {...svgBase} className={className ?? "w-full h-full"}><polyline points="20 6 9 17 4 12"/></svg>
}
function WarningIcon({ className }: { className?: string }) {
  return <svg {...svgBase} className={className ?? "w-full h-full"}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
}
function XCircleIcon({ className }: { className?: string }) {
  return <svg {...svgBase} className={className ?? "w-full h-full"}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
}
