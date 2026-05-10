'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

// ============================================================
// Shared input base styles
// ============================================================
const inputBase = [
  'w-full bg-white text-ink-700 placeholder-ink-300',
  'border border-cream-300 rounded-xl',
  'transition-all duration-200 ease-out',
  'focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600',
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-cream-100',
].join(' ')

const inputError = 'border-error-500 focus:ring-error-500/30 focus:border-error-500'

// ============================================================
// Field Wrapper
// ============================================================
export interface FieldProps {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  id?: string
  className?: string
}

export function Field({
  label,
  hint,
  error,
  required,
  id,
  className,
  children,
}: FieldProps & { children: React.ReactNode }) {
  return (
    <div className={cn('field-wrapper', className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-sm font-medium text-ink-600"
        >
          {label}
          {required && (
            <span className="text-error-500 ml-0.5" aria-hidden="true">*</span>
          )}
        </label>
      )}

      {children}

      {hint && !error && (
        <p className="text-xs text-ink-400 leading-relaxed">{hint}</p>
      )}

      {error && (
        <p className="text-xs text-error-500 flex items-center gap-1" role="alert">
          <ExclamationIcon className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

// ============================================================
// Input Component
// ============================================================
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  leftElement?: React.ReactNode
  rightElement?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      hint,
      error,
      leftElement,
      rightElement,
      id,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <Field label={label} hint={hint} error={error} required={required} id={inputId}>
        <div className="relative">
          {leftElement && (
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
              {leftElement}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            className={cn(
              inputBase,
              'h-11 px-4 text-sm',
              leftElement && 'pl-10',
              rightElement && 'pr-10',
              error && inputError,
              className
            )}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400">
              {rightElement}
            </div>
          )}
        </div>
      </Field>
    )
  }
)

Input.displayName = 'Input'

// ============================================================
// Textarea Component
// ============================================================
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  hint?: string
  error?: string
  autoResize?: boolean
  showCount?: boolean
  maxLength?: number
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      hint,
      error,
      autoResize = false,
      showCount = false,
      maxLength,
      id,
      required,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
    const currentLength = typeof value === 'string' ? value.length : 0

    return (
      <Field label={label} hint={hint} error={error} required={required} id={inputId}>
        <div className="relative">
          <textarea
            ref={ref}
            id={inputId}
            required={required}
            maxLength={maxLength}
            value={value}
            onChange={onChange}
            aria-invalid={!!error}
            className={cn(
              inputBase,
              'min-h-[100px] px-4 py-3 text-sm resize-none',
              showCount && maxLength && 'pb-7',
              error && inputError,
              className
            )}
            {...props}
          />

          {showCount && maxLength && (
            <div className="absolute bottom-2.5 right-3 text-2xs text-ink-300 pointer-events-none">
              {currentLength}/{maxLength}
            </div>
          )}
        </div>
      </Field>
    )
  }
)

Textarea.displayName = 'Textarea'

// ============================================================
// Select Component
// ============================================================
export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  error?: string
  placeholder?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      hint,
      error,
      placeholder,
      options,
      id,
      required,
      ...props
    },
    ref
  ) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

    return (
      <Field label={label} hint={hint} error={error} required={required} id={inputId}>
        <div className="relative">
          <select
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={!!error}
            className={cn(
              inputBase,
              'h-11 px-4 pr-10 text-sm appearance-none cursor-pointer',
              error && inputError,
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron icon */}
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
            <ChevronDownIcon className="w-4 h-4" />
          </div>
        </div>
      </Field>
    )
  }
)

Select.displayName = 'Select'

// ============================================================
// Icons
// ============================================================
function ExclamationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export { Input, Textarea, Select }
