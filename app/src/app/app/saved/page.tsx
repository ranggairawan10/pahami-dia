import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getUserWithProfile } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import { formatRelativeTime, formatFeatureName, truncateText } from '@/lib/utils/format'
import { EmptyState } from '@/components/ui/Alert'
import { UnsaveButton } from './UnsaveButton'

export const metadata: Metadata = { title: 'Tersimpan' }

// ============================================================
// SAVED ITEMS
// Route: /app/saved
// Menampilkan items yang secara eksplisit disimpan oleh user.
// Berbeda dari /riwayat: ini adalah hasil kurasi pengguna,
// bukan semua sesi.
// ============================================================

const FEATURE_ICONS: Record<string, string> = {
  pahami_kalimatnya:              '🔍',
  jawab_dengan_tenang:            '💬',
  aku_merasa_sendirian:           '🤍',
  aku_merasa_buntu:               '🧭',
  perbaiki_setelah_salah_bicara:  '🌿',
  beban_tak_terlihat:             '⚖️',
  ayat_pengingat:                 '📖',
}

const FEATURE_HREFS: Record<string, string> = {
  pahami_kalimatnya:              '/app/pahami-kalimatnya',
  jawab_dengan_tenang:            '/app/jawab-dengan-tenang',
  aku_merasa_sendirian:           '/app/aku-merasa-sendirian',
  aku_merasa_buntu:               '/app/aku-merasa-buntu',
  perbaiki_setelah_salah_bicara:  '/app/perbaiki-setelah-salah-bicara',
  beban_tak_terlihat:             '/app/beban-tak-terlihat',
  ayat_pengingat:                 '/app/ayat-pengingat',
}

export default async function SavedPage() {
  const { user } = await getUserWithProfile()
  if (!user) redirect('/masuk')

  const supabase = await createClient()

  // Fetch saved_items dengan detail dari masing-masing source table
  const { data: savedItems } = await supabase
    .from('saved_items')
    .select('id, source_type, source_id, personal_note, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Batch-fetch previews untuk setiap saved item
  const enrichedItems = await Promise.all(
    (savedItems ?? []).map(async (item) => {
      let preview = ''

      try {
        if (item.source_type === 'pahami_kalimatnya') {
          const { data } = await supabase
            .from('pahami_sessions')
            .select('input_text')
            .eq('id', item.source_id)
            .single()
          preview = truncateText(data?.input_text ?? '', 100)
        } else if (item.source_type === 'jawab_dengan_tenang') {
          const { data } = await supabase
            .from('jawab_sessions')
            .select('input_text')
            .eq('id', item.source_id)
            .single()
          preview = truncateText(data?.input_text ?? '', 100)
        } else if (item.source_type === 'perbaiki_setelah_salah_bicara') {
          const { data } = await supabase
            .from('perbaiki_sessions')
            .select('description_text')
            .eq('id', item.source_id)
            .single()
          preview = truncateText(data?.description_text ?? '', 100)
        } else if (item.source_type === 'beban_tak_terlihat') {
          const { data } = await supabase
            .from('beban_sessions')
            .select('selected_burdens')
            .eq('id', item.source_id)
            .single()
          const count = (data?.selected_burdens as string[])?.length ?? 0
          preview = `${count} beban diidentifikasi`
        } else if (item.source_type === 'aku_merasa_sendirian') {
          preview = 'Refleksi: aku merasa sendirian'
        } else if (item.source_type === 'aku_merasa_buntu') {
          preview = 'Refleksi: aku merasa buntu'
        } else if (item.source_type === 'ayat_pengingat') {
          const { data } = await supabase
            .from('ayat_pengingat')
            .select('source_ref, contextualization')
            .eq('id', item.source_id)
            .single()
          preview = data?.source_ref ?? 'Ayat tersimpan'
        }
      } catch {
        preview = 'Konten tersimpan'
      }

      return { ...item, preview }
    })
  )

  return (
    <div className="page-container py-5 animate-fade-in">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-ink-700">Tersimpan</h1>
        <p className="text-sm text-ink-400 mt-1.5 leading-relaxed">
          Refleksi dan catatan yang sudah kamu tandai untuk dibaca ulang.
        </p>
      </div>

      {enrichedItems.length === 0 ? (
        <EmptyState
          icon={<span className="text-2xl">🔖</span>}
          title="Belum ada yang ditandai"
          description='Setiap kali kamu menekan "Simpan ke Riwayat" di akhir refleksi, hasilnya akan muncul di sini.'
          action={
            <Link
              href="/app/hari-ini"
              className="inline-flex items-center justify-center h-10 px-5 rounded-xl bg-teal-700 text-white text-sm font-semibold"
            >
              Mulai Refleksi
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {enrichedItems.map((item) => (
            <SavedItemCard
              key={item.id}
              id={item.id}
              sourceType={item.source_type}
              preview={item.preview}
              personalNote={item.personal_note}
              createdAt={item.created_at}
            />
          ))}
        </div>
      )}

      {/* Info footer */}
      {enrichedItems.length > 0 && (
        <p className="text-xs text-center text-ink-300 mt-8 leading-relaxed">
          Hanya kamu yang bisa melihat catatan ini.
        </p>
      )}
    </div>
  )
}

// ============================================================
// Saved Item Card
// ============================================================
function SavedItemCard({
  id,
  sourceType,
  preview,
  personalNote,
  createdAt,
}: {
  id: string
  sourceType: string
  preview: string
  personalNote?: string | null
  createdAt: string
}) {
  const featureName = formatFeatureName(sourceType)
  const icon = FEATURE_ICONS[sourceType] ?? '📝'
  const href = FEATURE_HREFS[sourceType] ?? '/app/hari-ini'

  return (
    <div className="bg-white rounded-2xl border border-cream-200 shadow-card overflow-hidden">
      {/* Content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-semibold text-teal-600">{featureName}</span>
              <span className="text-2xs text-ink-300 flex-shrink-0">
                {formatRelativeTime(createdAt)}
              </span>
            </div>

            <p className="text-sm text-ink-600 leading-relaxed">{preview}</p>

            {/* Personal note */}
            {personalNote && (
              <div className="mt-2 bg-gold-50 border border-gold-100 rounded-lg px-3 py-2">
                <p className="text-xs text-gold-700 italic leading-relaxed">
                  {personalNote}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="border-t border-cream-100 flex">
        <Link
          href={href}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-teal-700 hover:bg-teal-50 transition-colors"
        >
          <span>Buka Fitur</span>
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Link>
        <div className="w-px bg-cream-100" />
        <UnsaveButton savedItemId={id} />
      </div>
    </div>
  )
}
