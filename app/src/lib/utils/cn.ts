import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Menggabungkan class names Tailwind dengan benar.
 * Menghindari konflik antara class Tailwind yang saling menimpa.
 *
 * Contoh:
 *   cn('px-4 py-2', 'px-6') -> 'py-2 px-6'
 *   cn('text-sm', condition && 'text-lg') -> 'text-sm' atau 'text-lg'
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
