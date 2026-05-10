import { z } from 'zod'

// ============================================================
// PAHAMI DIA: Common Zod Schemas
// Schema validasi untuk form-form yang digunakan di seluruh app.
// ============================================================

// ============================================================
// AUTH SCHEMAS
// ============================================================

export const registerSchema = z.object({
  nickname: z
    .string()
    .min(2, 'Nama panggilan minimal 2 karakter')
    .max(50, 'Nama panggilan maksimal 50 karakter')
    .trim(),

  email: z
    .string()
    .email('Format email tidak valid')
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(
      /^(?=.*[a-z])(?=.*\d)/,
      'Password harus mengandung huruf dan angka'
    ),

  confirmPassword: z.string(),

  role: z.enum(['suami', 'istri'], {
    required_error: 'Pilih peranmu dalam rumah tangga',
  }),

  partner_code: z
    .string()
    .max(20, 'Kode partner tidak valid')
    .optional()
    .transform((v) => v?.trim().toUpperCase() || undefined),

  agree_terms: z
    .boolean()
    .refine((v) => v === true, 'Kamu perlu menyetujui ketentuan layanan'),
})
.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Password dan konfirmasi password tidak sama',
    path: ['confirmPassword'],
  }
)

export type RegisterFormData = z.infer<typeof registerSchema>

// ---

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email atau nomor HP wajib diisi')
    .trim(),

  password: z
    .string()
    .min(1, 'Password wajib diisi'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// ---

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Format email tidak valid')
    .toLowerCase()
    .trim(),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

// ---

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(
      /^(?=.*[a-z])(?=.*\d)/,
      'Password harus mengandung huruf dan angka'
    ),

  confirmPassword: z.string(),
})
.refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Password dan konfirmasi password tidak sama',
    path: ['confirmPassword'],
  }
)

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

// ============================================================
// ONBOARDING SCHEMAS
// ============================================================

export const onboardingSchema = z.object({
  feeling_lately: z.enum([
    'tidak_didengarkan',
    'tidak_tahu_harus_berkata_apa',
    'terlalu_banyak_ditanggung_sendiri',
    'ingin_lebih_dekat_tapi_tidak_tahu_caranya',
  ], {
    required_error: 'Pilih salah satu yang paling mendekati',
  }),

  conflict_response: z.enum([
    'langsung_bicara_tapi_sering_salah_kata',
    'diam_dulu_tapi_lama_lama_meledak',
    'menghindari_konflik',
    'coba_bicara_tapi_tidak_didengar',
  ], {
    required_error: 'Pilih salah satu',
  }),

  main_hope: z.enum([
    'pahami_pasangan',
    'sampaikan_perasaan',
    'komunikasi_lebih_baik',
    'tenang_sebelum_bereaksi',
  ], {
    required_error: 'Pilih salah satu',
  }),
})

export type OnboardingFormData = z.infer<typeof onboardingSchema>

// ============================================================
// PROFILE SCHEMAS
// ============================================================

export const updateProfileSchema = z.object({
  nickname: z
    .string()
    .min(2, 'Nama panggilan minimal 2 karakter')
    .max(50, 'Nama panggilan maksimal 50 karakter')
    .trim(),

  role: z.enum(['suami', 'istri']),
})

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>

// ============================================================
// FEATURE SCHEMAS
// ============================================================

export const pahamiKalimatnyaSchema = z.object({
  input_text: z
    .string()
    .min(5, 'Ceritakan sedikit lebih banyak agar kami bisa membantu')
    .max(1000, 'Teks terlalu panjang')
    .trim(),

  context_situation: z
    .string()
    .max(200, 'Konteks terlalu panjang')
    .optional(),
})

export type PahamiKalimatnyaFormData = z.infer<typeof pahamiKalimatnyaSchema>

// ---

export const jawabDenganTenangSchema = z.object({
  input_text: z
    .string()
    .min(5, 'Ceritakan sedikit lebih banyak agar kami bisa membantu')
    .max(1000, 'Teks terlalu panjang')
    .trim(),

  intent_type: z.enum([
    'meminta_maaf',
    'mengungkapkan_perasaan',
    'klarifikasi',
    'mengungkapkan_kebutuhan',
    'belum_tahu',
  ]),

  emotion_level: z.enum([
    'tenang',
    'sedikit_tegang',
    'masih_kesal',
    'sangat_emosional',
  ]),
})

export type JawabDenganTenangFormData = z.infer<typeof jawabDenganTenangSchema>

// ---

export const perbaikiSetelahSalahBicaraSchema = z.object({
  description_text: z
    .string()
    .min(5, 'Ceritakan sedikit lebih banyak agar kami bisa membantu')
    .max(1000, 'Teks terlalu panjang')
    .trim(),

  current_condition: z.enum([
    'pasangan_sedang_marah',
    'masih_tegang',
    'tidak_bicara_beberapa_jam',
    'perlu_memulai',
  ]),

  goal_type: z.enum([
    'meminta_maaf',
    'membuka_percakapan',
    'memberi_waktu_tapi_tetap_peduli',
    'belum_tahu',
  ]),
})

export type PerbaikiSetelahSalahBicaraFormData = z.infer<
  typeof perbaikiSetelahSalahBicaraSchema
>

// ---

export const refleksiHarianSchema = z.object({
  content_text: z
    .string()
    .min(1, 'Tuliskan sesuatu')
    .max(5000, 'Catatan terlalu panjang')
    .trim(),

  guide_question_used: z
    .string()
    .optional(),
})

export type RefleksiHarianFormData = z.infer<typeof refleksiHarianSchema>

// ---

export const savedItemNoteSchema = z.object({
  personal_note: z
    .string()
    .max(500, 'Catatan terlalu panjang')
    .optional(),
})

export type SavedItemNoteFormData = z.infer<typeof savedItemNoteSchema>

// ============================================================
// FEEDBACK SCHEMA
// ============================================================

export const featureFeedbackSchema = z.object({
  is_helpful: z.boolean(),
  session_id: z.string().uuid(),
  feature_source: z.string(),
})

export type FeatureFeedbackFormData = z.infer<typeof featureFeedbackSchema>

// ============================================================
// PARTNER REGISTRATION SCHEMA
// ============================================================

export const partnerRegistrationSchema = z.object({
  community_name: z
    .string()
    .min(3, 'Nama komunitas minimal 3 karakter')
    .max(100)
    .trim(),

  pic_name: z
    .string()
    .min(2, 'Nama minimal 2 karakter')
    .max(100)
    .trim(),

  pic_email: z
    .string()
    .email('Format email tidak valid')
    .toLowerCase()
    .trim(),

  platform: z
    .string()
    .max(50)
    .optional()
    .transform((v) => v?.trim()),

  community_size: z
    .number()
    .int('Harus berupa angka bulat')
    .min(1)
    .optional(),

  message: z
    .string()
    .max(500, 'Pesan terlalu panjang')
    .optional()
    .transform((v) => v?.trim()),
})

export type PartnerRegistrationFormData = z.infer<typeof partnerRegistrationSchema>
