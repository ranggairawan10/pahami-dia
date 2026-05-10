'use client'

import { useEffect } from 'react'

// ============================================================
// Global Error Boundary
// ============================================================

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to monitoring service in production
    console.error('Global error:', error)
  }, [error])

  return (
    <html lang="id">
      <body className="min-h-dvh bg-cream-100 flex flex-col items-center justify-center px-4 text-center font-sans">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
          <span className="text-3xl">⚠️</span>
        </div>

        <h1 className="text-xl font-bold text-ink-700 mb-2">Ada sesuatu yang tidak berjalan dengan baik.</h1>
        <p className="text-sm text-ink-400 max-w-xs leading-relaxed mb-8">
          Ini bukan karena kamu. Tim kami sudah diberitahu. Coba muat ulang halaman.
        </p>

        <button
          onClick={reset}
          className="h-11 px-6 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 transition-colors"
        >
          Muat Ulang
        </button>
      </body>
    </html>
  )
}
