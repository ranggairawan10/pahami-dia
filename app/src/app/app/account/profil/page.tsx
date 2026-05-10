import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getUserWithProfile } from '@/lib/auth/helpers'
import EditProfilClient from './EditProfilClient'

export const metadata: Metadata = { title: 'Edit Profil' }

// ============================================================
// EDIT PROFIL PAGE
// Server component: mengambil data profil dari server
// Client component: menghandle form interaktif
// ============================================================

export default async function EditProfilPage() {
  const { user, profile } = await getUserWithProfile()
  if (!user || !profile) redirect('/masuk')

  return (
    <EditProfilClient
      initialNickname={profile.nickname}
      initialRole={profile.role}
    />
  )
}
