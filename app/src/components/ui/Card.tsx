import { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

// ============================================================
// Card Component
// Warm, soft, elevated cards dengan berbagai variant.
// ============================================================

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'teal' | 'gold' | 'cream' | 'flat'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  as?: 'div' | 'article' | 'section' | 'li'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = 'default',
      padding = 'md',
      hoverable = false,
      as: Component = 'div',
      children,
      ...props
    },
    ref
  ) => {
    return (
      <Component
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn(
          // Base
          'rounded-2xl overflow-hidden',
          'transition-all duration-250',

          // Variants
          variant === 'default' && [
            'bg-white shadow-card',
            'border border-cream-200/60',
          ],
          variant === 'elevated' && [
            'bg-white shadow-lg',
            'border border-cream-200/40',
          ],
          variant === 'outlined' && [
            'bg-white',
            'border border-cream-300',
          ],
          variant === 'teal' && [
            'bg-teal-700 text-white',
            'border border-teal-700',
          ],
          variant === 'gold' && [
            'bg-gold-accent-light border border-gold-200',
            'bg-gradient-to-br from-gold-50 to-gold-100/50',
          ],
          variant === 'cream' && [
            'bg-cream-200/60',
            'border border-cream-300/50',
          ],
          variant === 'flat' && [
            'bg-cream-100/80',
            'border border-cream-200',
          ],

          // Hover effect
          hoverable && [
            'cursor-pointer',
            'hover:shadow-card-hover hover:-translate-y-0.5',
          ],

          // Padding
          padding === 'none' && '',
          padding === 'sm' && 'p-4',
          padding === 'md' && 'p-5',
          padding === 'lg' && 'p-6',

          className
        )}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Card.displayName = 'Card'

// ============================================================
// Card sub-components
// ============================================================

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col gap-1.5 mb-4', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-base font-semibold text-ink-700 leading-snug', className)}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('text-sm text-ink-400 leading-relaxed', className)}
      {...props}
    >
      {children}
    </p>
  )
}

export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center mt-4 pt-4 border-t border-cream-200', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Card }
