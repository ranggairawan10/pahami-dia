import Link from 'next/link'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getUserWithProfile } from '@/lib/auth/helpers'
import { redirect } from 'next/navigation'
import type { AyatPengingat, Condition } from '@/types/database'

export const metadata: Metadata = { title: 'Ayat Pengingat' }

// ============================================================
// Ayat Pengingat
// Route: /app/ayat-pengingat
// Fetch dari database: ayat_pengingat dan conditions
// ============================================================

const CATEGORIES = [
  { value: 'all',           label: 'Semua' },
  { value: 'sabar',         label: 'Sabar' },
  { value: 'rumah_tangga',  label: 'Rumah Tangga' },
  { value: 'doa',           label: 'Doa' },
  { value: 'tobat',         label: 'Tobat' },
  { value: 'syukur',        label: 'Syukur' },
  { value: 'petunjuk',      label: 'Petunjuk' },
]

export default async function AyatPengingatPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { user } = await getUserWithProfile()
  if (!user) redirect('/masuk')

  const params = await searchParams
  const category = params.category ?? 'all'

  const supabase = await createClient()

  // Fetch ayat yang aktif
  let query = supabase
    .from('ayat_pengingat')
    .select('id, source_ref, contextualization, category, display_date')
    .eq('status', 'active')
    .order('display_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  if (category !== 'all') {
    query = query.eq('category', category)
  }

  const { data: verses } = await query

  // Fetch kondisi untuk mapping
  const { data: conditions } = await supabase
    .from('conditions')
    .select('id, label, slug, category')
    .eq('is_active', true)
    .order('order_index')

  return (
    <div className="page-container py-5 animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-ink-700">Ayat Pengingat</h1>
        <p className="text-sm text-ink-400 mt-1.5 leading-relaxed">
          Refleksi harian dari Al-Quran dan Hadis. Bukan ceramah, bukan fatwa. Hanya pengingat yang lembut.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 mb-5">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.value}
            href={cat.value === 'all' ? '/app/ayat-pengingat' : `/app/ayat-pengingat?category=${cat.value}`}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              category === cat.value
                ? 'bg-teal-700 text-white'
                : 'bg-white border border-cream-200 text-ink-500 hover:border-teal-200'
            }`}
          >
            {cat.label}
          </Link>
        ))}
      </div>

      {/* Verses */}
      {!verses || verses.length === 0 ? (
        <VerseEmptyState category={category} />
      ) : (
        <div className="space-y-3">
          {verses.map((verse) => (
            <VerseCard key={verse.id} verse={verse as AyatPengingat} />
          ))}
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-ink-400 text-center mt-8 leading-relaxed px-4">
        Seluruh konten ayat dan hadis diverifikasi sebelum ditampilkan.
        Pahami Dia tidak memberikan fatwa atau interpretasi hukum syariah.
      </p>
    </div>
  )
}

// ============================================================
// Verse Card
// ============================================================
function VerseCard({ verse }: { verse: AyatPengingat }) {
  const isPlaceholder = verse.contextualization?.startsWith('[')

  if (isPlaceholder) return null

  return (
    <div className="bg-white rounded-2xl border border-cream-200 shadow-card p-5 space-y-3">
      {/* Source */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full">
          {verse.source_ref}
        </span>
        <span className="text-xs text-ink-300 capitalize">
          {verse.category?.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Contextualization */}
      {verse.contextualization && (
        <p className="text-sm text-ink-600 leading-relaxed">
          {verse.contextualization}
        </p>
      )}

      {/* Arabic text placeholder indicator */}
      <div className="pt-2 border-t border-cream-100">
        <p className="text-xs text-ink-300 italic">
          Teks Arab dan terjemahan tersedia setelah verifikasi konten selesai.
        </p>
      </div>
    </div>
  )
}

function VerseEmptyState({ category }: { category: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-2xl bg-cream-200 flex items-center justify-center mb-4">
        <span className="text-2xl">📖</span>
      </div>
      <p className="text-sm font-semibold text-ink-600">
        {category === 'all' ? 'Ayat sedang dalam proses verifikasi' : `Belum ada ayat untuk kategori ini`}
      </p>
      <p className="text-xs text-ink-400 mt-1.5 max-w-xs leading-relaxed">
        Tim kami sedang memverifikasi konten ayat. Kembali lagi dalam beberapa hari.
      </p>
    </div>
  )
}
