import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getUserWithProfile } from '@/lib/auth/helpers'
import { createClient } from '@/lib/supabase/server'
import { formatRelativeTime, formatFeatureName, truncateText } from '@/lib/utils/format'
import { EmptyState } from '@/components/ui/Alert'

export const metadata: Metadata = { title: 'Riwayat' }

// ============================================================
// RIWAYAT
// Route: /app/riwayat
// ============================================================

type SessionType = {
  id: string
  feature: string
  preview: string
  created_at: string
  is_saved: boolean
}

export default async function RiwayatPage() {
  const { user } = await getUserWithProfile()
  if (!user) redirect('/masuk')

  const supabase = await createClient()

  // Fetch dari semua session tables secara paralel
  const [pahami, jawab, sendirian, buntu, perbaiki, beban, refleksi] = await Promise.all([
    supabase.from('pahami_sessions').select('id, input_text, created_at, is_saved').eq('user_id', user.id).eq('is_saved', true).order('created_at', { ascending: false }).limit(20),
    supabase.from('jawab_sessions').select('id, input_text, created_at, is_saved').eq('user_id', user.id).eq('is_saved', true).order('created_at', { ascending: false }).limit(20),
    supabase.from('sendirian_sessions').select('id, created_at, is_saved').eq('user_id', user.id).eq('is_saved', true).order('created_at', { ascending: false }).limit(20),
    supabase.from('buntu_sessions').select('id, created_at, is_saved').eq('user_id', user.id).eq('is_saved', true).order('created_at', { ascending: false }).limit(20),
    supabase.from('perbaiki_sessions').select('id, description_text, created_at, is_saved').eq('user_id', user.id).eq('is_saved', true).order('created_at', { ascending: false }).limit(20),
    supabase.from('beban_sessions').select('id, selected_burdens, created_at, is_saved').eq('user_id', user.id).eq('is_saved', true).order('created_at', { ascending: false }).limit(20),
    supabase.from('refleksi_harian').select('id, content_text, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
  ])

  // Compile all sessions
  const allSessions: SessionType[] = [
    ...(pahami.data ?? []).map(s => ({
      id: s.id,
      feature: 'pahami_kalimatnya',
      preview: truncateText(s.input_text, 80),
      created_at: s.created_at,
      is_saved: s.is_saved,
    })),
    ...(jawab.data ?? []).map(s => ({
      id: s.id,
      feature: 'jawab_dengan_tenang',
      preview: truncateText(s.input_text, 80),
      created_at: s.created_at,
      is_saved: s.is_saved,
    })),
    ...(sendirian.data ?? []).map(s => ({
      id: s.id,
      feature: 'aku_merasa_sendirian',
      preview: 'Sesi refleksi: aku merasa sendirian',
      created_at: s.created_at,
      is_saved: s.is_saved,
    })),
    ...(buntu.data ?? []).map(s => ({
      id: s.id,
      feature: 'aku_merasa_buntu',
      preview: 'Sesi refleksi: aku merasa buntu',
      created_at: s.created_at,
      is_saved: s.is_saved,
    })),
    ...(perbaiki.data ?? []).map(s => ({
      id: s.id,
      feature: 'perbaiki_setelah_salah_bicara',
      preview: truncateText(s.description_text, 80),
      created_at: s.created_at,
      is_saved: s.is_saved,
    })),
    ...(beban.data ?? []).map(s => ({
      id: s.id,
      feature: 'beban_tak_terlihat',
      preview: `${s.selected_burdens?.length ?? 0} beban diidentifikasi`,
      created_at: s.created_at,
      is_saved: s.is_saved,
    })),
    ...(refleksi.data ?? []).map(s => ({
      id: s.id,
      feature: 'refleksi_harian',
      preview: truncateText(s.content_text, 80),
      created_at: s.created_at,
      is_saved: true,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const FEATURE_ICONS: Record<string, string> = {
    pahami_kalimatnya:              '🔍',
    jawab_dengan_tenang:            '💬',
    aku_merasa_sendirian:           '🤍',
    aku_merasa_buntu:               '🧭',
    perbaiki_setelah_salah_bicara:  '🌿',
    beban_tak_terlihat:             '⚖️',
    refleksi_harian:                '✍️',
  }

  return (
    <div className="page-container py-5 animate-fade-in">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-ink-700">Riwayat</h1>
        <p className="text-sm text-ink-400 mt-1.5">Semua refleksi yang sudah kamu simpan.</p>
      </div>

      {allSessions.length === 0 ? (
        <EmptyState
          icon={<span className="text-2xl">📂</span>}
          title="Belum ada yang tersimpan"
          description="Setiap kali kamu menyimpan hasil refleksi, ia akan muncul di sini."
          action={
            <Link href="/app/hari-ini" className="text-sm font-semibold text-teal-700">
              Mulai Refleksi
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {allSessions.map((session) => (
            <div
              key={`${session.feature}-${session.id}`}
              className="bg-white rounded-2xl border border-cream-200 shadow-card p-4 flex items-start gap-3"
            >
              <span className="text-xl flex-shrink-0 mt-0.5">{FEATURE_ICONS[session.feature] ?? '📝'}</span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-ink-400">{formatFeatureName(session.feature)}</p>
                <p className="text-sm text-ink-600 mt-0.5 leading-relaxed line-clamp-2">{session.preview}</p>
                <p className="text-2xs text-ink-300 mt-1">{formatRelativeTime(session.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
