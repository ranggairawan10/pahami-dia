// ============================================================
// PAHAMI DIA: Format Utilities
// ============================================================

// ============================================================
// CURRENCY
// ============================================================

/**
 * Format angka menjadi format Rupiah Indonesia.
 * Contoh: 10000 -> "Rp10.000"
 */
export function formatCurrencyIDR(
  amount: number,
  options?: {
    showSymbol?: boolean
    compact?: boolean
  }
): string {
  const { showSymbol = true, compact = false } = options ?? {}

  if (compact && amount >= 1_000_000) {
    const juta = amount / 1_000_000
    const formatted = juta % 1 === 0 ? `${juta}` : `${juta.toFixed(1)}`
    return showSymbol ? `Rp${formatted} juta` : `${formatted} juta`
  }

  if (compact && amount >= 1_000) {
    const ribu = amount / 1_000
    const formatted = ribu % 1 === 0 ? `${ribu}` : `${ribu.toFixed(1)}`
    return showSymbol ? `Rp${formatted}rb` : `${formatted}rb`
  }

  const formatted = new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

  return showSymbol ? `Rp${formatted}` : formatted
}

/**
 * Format untuk menampilkan harga subscription.
 * Contoh: 10000 -> "Rp10.000 / bulan"
 */
export function formatSubscriptionPrice(
  amount: number,
  interval: 'monthly' | 'yearly' = 'monthly'
): string {
  const price = formatCurrencyIDR(amount)
  const period = interval === 'monthly' ? 'bulan' : 'tahun'
  return `${price} / ${period}`
}

// ============================================================
// DATE & TIME
// ============================================================

const LOCALE = 'id-ID'

/**
 * Format tanggal ke format Indonesia yang lengkap.
 * Contoh: "Minggu, 10 Mei 2026"
 */
export function formatDateFull(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

/**
 * Format tanggal singkat.
 * Contoh: "10 Mei 2026"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

/**
 * Format tanggal sangat singkat.
 * Contoh: "10 Mei"
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'short',
  }).format(d)
}

/**
 * Format waktu saja.
 * Contoh: "14.30"
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d)
}

/**
 * Format tanggal dan waktu.
 * Contoh: "10 Mei 2026, 14.30"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d)
}

/**
 * Format relatif (berapa lama yang lalu).
 * Contoh: "3 hari yang lalu", "baru saja"
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffSec < 60) return 'baru saja'
  if (diffMin < 60) return `${diffMin} menit yang lalu`
  if (diffHour < 24) return `${diffHour} jam yang lalu`
  if (diffDay === 1) return 'kemarin'
  if (diffDay < 7) return `${diffDay} hari yang lalu`
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} minggu yang lalu`
  if (diffDay < 365) return `${Math.floor(diffDay / 30)} bulan yang lalu`
  return `${Math.floor(diffDay / 365)} tahun yang lalu`
}

/**
 * Nama hari dalam Bahasa Indonesia.
 * Contoh: new Date('2026-05-10') -> "Minggu"
 */
export function getDayName(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(LOCALE, { weekday: 'long' }).format(d)
}

/**
 * Nama bulan dalam Bahasa Indonesia.
 * Contoh: 4 -> "Mei" (0-indexed)
 */
export function getMonthName(month: number, format: 'long' | 'short' = 'long'): string {
  const date = new Date(2026, month, 1)
  return new Intl.DateTimeFormat(LOCALE, { month: format }).format(date)
}

/**
 * Format periode bulan untuk laporan.
 * Contoh: "2026-05-01" -> "Mei 2026"
 */
export function formatPeriodMonth(dateStr: string): string {
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat(LOCALE, {
    month: 'long',
    year: 'numeric',
  }).format(d)
}

// ============================================================
// TRIAL
// ============================================================

/**
 * Menghitung sisa hari trial dari expires_at.
 * Return 0 jika trial sudah habis.
 * Return null jika tidak ada trial.
 */
export function calculateTrialDaysLeft(expiresAt: string | null | undefined): number | null {
  if (!expiresAt) return null

  const now = new Date()
  const expires = new Date(expiresAt)
  if (expires <= now) return 0

  const diffMs = expires.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

/**
 * Menghasilkan teks status trial yang ramah untuk ditampilkan.
 * Contoh: "Sisa 3 hari" atau "Trial berakhir hari ini"
 */
export function getTrialStatusText(daysLeft: number | null): string {
  if (daysLeft === null) return ''
  if (daysLeft === 0) return 'Trial berakhir hari ini'
  if (daysLeft === 1) return 'Sisa 1 hari lagi'
  return `Sisa ${daysLeft} hari lagi`
}

/**
 * Menentukan apakah trial dalam kondisi "hampir habis" (3 hari atau kurang).
 */
export function isTrialEndingSoon(daysLeft: number | null): boolean {
  if (daysLeft === null) return false
  return daysLeft <= 3
}

// ============================================================
// TEXT
// ============================================================

/**
 * Mempersingkat teks panjang dengan ellipsis.
 * Contoh: "Teks yang sangat panjang..." -> "Teks yang..."
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * Capitalize huruf pertama setiap kata.
 */
export function titleCase(str: string): string {
  return str.replace(
    /\w\S*/g,
    (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  )
}

/**
 * Format nama fitur dari slug ke label yang bisa dibaca.
 */
export function formatFeatureName(featureSlug: string): string {
  const names: Record<string, string> = {
    pahami_kalimatnya:             'Pahami Kalimatnya',
    jawab_dengan_tenang:           'Jawab dengan Tenang',
    aku_merasa_sendirian:          'Aku Merasa Sendirian',
    aku_merasa_buntu:              'Aku Merasa Buntu',
    perbaiki_setelah_salah_bicara: 'Perbaiki Setelah Salah Bicara',
    beban_tak_terlihat:            'Beban Tak Terlihat',
    refleksi_harian:               'Refleksi Harian',
    ayat_pengingat:                'Ayat Pengingat',
  }
  return names[featureSlug] ?? titleCase(featureSlug.replace(/_/g, ' '))
}

/**
 * Mendapatkan sapaan sesuai waktu hari (WIB/WITA/WIT tidak dideteksi,
 * gunakan waktu device pengguna).
 */
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 4 && hour < 11) return 'Selamat pagi'
  if (hour >= 11 && hour < 15) return 'Selamat siang'
  if (hour >= 15 && hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}

/**
 * Format angka besar dengan pemisah ribuan Indonesia.
 * Contoh: 50000 -> "50.000"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat(LOCALE).format(num)
}

/**
 * Format persentase.
 * Contoh: 25.5 -> "25,5%"
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat(LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value) + '%'
}
