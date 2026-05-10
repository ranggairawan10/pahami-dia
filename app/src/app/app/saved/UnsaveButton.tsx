'use client'

import { useState, useTransition } from 'react'
import { unsaveItem } from '@/app/actions/features'

// ============================================================
// UnsaveButton
// Client component karena butuh interactive state.
// Dipisah dari SavedPage karena SavedPage adalah server component.
// ============================================================

export function UnsaveButton({ savedItemId }: { savedItemId: string }) {
  const [removed, setRemoved] = useState(false)
  const [isPending, startTransition] = useTransition()

  if (removed) {
    return (
      <div className="flex-1 flex items-center justify-center py-2.5">
        <span className="text-xs text-ink-300">Dihapus</span>
      </div>
    )
  }

  function handleUnsave() {
    startTransition(async () => {
      const result = await unsaveItem(savedItemId)
      if (result.success) setRemoved(true)
    })
  }

  return (
    <button
      onClick={handleUnsave}
      disabled={isPending}
      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-ink-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      {isPending ? (
        <span className="text-xs text-ink-300">...</span>
      ) : (
        <>
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2}>
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
          </svg>
          <span>Hapus</span>
        </>
      )}
    </button>
  )
}
