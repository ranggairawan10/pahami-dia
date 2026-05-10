'use client'

import { forwardRef } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'

// ============================================================
// Button Component
// Supports: primary, secondary, ghost, danger, gold, outline
// Sizes: sm, md, lg
// States: loading, disabled
// asChild: renders children directly with button styles applied
// ============================================================

type ButtonBaseProps = {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  asChild?: boolean
}

export type ButtonProps = ButtonBaseProps &
  React.ButtonHTMLAttributes<HTMLButtonElement>

function getButtonClasses({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  className = '',
}: {
  variant?: ButtonBaseProps['variant']
  size?: ButtonBaseProps['size']
  fullWidth?: boolean
  loading?: boolean
  disabled?: boolean
  className?: string
}) {
  const isDisabled = disabled || loading
  return cn(
    'relative inline-flex items-center justify-center gap-2 font-semibold',
    'select-none transition-all duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'active:scale-[0.98]',
    isDisabled && 'opacity-50 cursor-not-allowed active:scale-100',
    fullWidth && 'w-full',
    variant === 'primary' && [
      'bg-teal-700 text-white shadow-sm',
      'hover:bg-teal-800 focus-visible:ring-teal-600',
      'border border-teal-700 hover:border-teal-800',
    ],
    variant === 'secondary' && [
      'bg-teal-50 text-teal-700',
      'hover:bg-teal-100 focus-visible:ring-teal-600',
      'border border-teal-200',
    ],
    variant === 'ghost' && [
      'bg-transparent text-ink-500',
      'hover:bg-cream-200 hover:text-ink-700 focus-visible:ring-teal-600',
      'border border-transparent',
    ],
    variant === 'outline' && [
      'bg-transparent text-teal-700',
      'hover:bg-teal-50 focus-visible:ring-teal-600',
      'border border-teal-300',
    ],
    variant === 'danger' && [
      'bg-red-600 text-white shadow-sm',
      'hover:bg-red-700 focus-visible:ring-red-500',
      'border border-red-600 hover:border-red-700',
    ],
    variant === 'gold' && [
      'bg-gold-500 text-white shadow-sm',
      'hover:bg-gold-600 focus-visible:ring-yellow-400',
      'border border-gold-500 hover:border-gold-600',
    ],
    size === 'sm' && 'h-8 px-3 text-xs rounded-md',
    size === 'md' && 'h-11 px-5 text-sm rounded-lg',
    size === 'lg' && 'h-13 px-6 text-base rounded-xl',
    className
  )
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      disabled,
      leftIcon,
      rightIcon,
      asChild,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading
    const classes = getButtonClasses({ variant, size, fullWidth, loading, disabled, className })

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={classes}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <LoadingSpinner
              size={size === 'sm' ? 'xs' : 'sm'}
              color={variant === 'primary' || variant === 'danger' || variant === 'gold' ? 'white' : 'teal'}
            />
          </span>
        )}
        <span className={cn('flex items-center gap-2', loading && 'invisible')}>
          {leftIcon && <span className="flex-shrink-0 w-4 h-4">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0 w-4 h-4">{rightIcon}</span>}
        </span>
      </button>
    )
  }
)

Button.displayName = 'Button'

// ============================================================
// ButtonLink — a Link styled as a Button
// Use instead of <Button asChild><Link ...>
// ============================================================

export interface ButtonLinkProps extends ButtonBaseProps {
  href: string
  className?: string
  children: React.ReactNode
  target?: string
  rel?: string
}

export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  className,
  children,
  target,
  rel,
}: ButtonLinkProps) {
  const classes = getButtonClasses({ variant, size, fullWidth, loading, className })
  return (
    <Link href={href} className={classes} target={target} rel={rel}>
      {leftIcon && <span className="flex-shrink-0 w-4 h-4">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="flex-shrink-0 w-4 h-4">{rightIcon}</span>}
    </Link>
  )
}

// ============================================================
// Loading Spinner
// ============================================================
export function LoadingSpinner({
  size = 'sm',
  color = 'teal',
}: {
  size?: 'xs' | 'sm' | 'md'
  color?: 'teal' | 'white' | 'gold'
}) {
  return (
    <svg
      className={cn(
        'animate-spin',
        size === 'xs' && 'w-3 h-3',
        size === 'sm' && 'w-4 h-4',
        size === 'md' && 'w-5 h-5',
        color === 'teal' && 'text-teal-700',
        color === 'white' && 'text-white',
        color === 'gold' && 'text-yellow-500',
      )}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

export { Button, getButtonClasses }
