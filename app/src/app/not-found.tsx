import Link from 'next/link'

// ============================================================
// 404 Not Found
// ============================================================

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-cream-100 flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-cream-200 flex items-center justify-center mb-5">
        <span className="text-3xl">🌿</span>
      </div>

      <h1 className="text-2xl font-bold text-ink-700 mb-2">Halaman ini tidak ada.</h1>
      <p className="text-sm text-ink-400 max-w-xs leading-relaxed mb-8">
        Mungkin tautannya sudah berubah atau salah ketik. Tidak apa-apa, mari kembali.
      </p>

      <Link
        href="/app/hari-ini"
        className="inline-flex items-center justify-center h-11 px-6 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  )
}
