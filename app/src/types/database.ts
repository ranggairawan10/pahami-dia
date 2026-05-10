// ============================================================
// PAHAMI DIA: Database Types
// Diinferensikan dari schema SQL pahami_dia_rls.sql
// Update file ini jika ada perubahan schema.
// Untuk production, pertimbangkan menggunakan `supabase gen types`
// ============================================================

export type UserRole = 'suami' | 'istri'
export type AdminRole = 'platform_admin' | 'super_admin' | 'partner_admin'
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'grace_period'
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded'
export type PaymentMethod = 'qris' | 'transfer_bank' | 'gopay' | 'ovo' | 'dana'
export type PartnerStatus = 'active' | 'suspended' | 'pending_review'
export type ContentStatus = 'draft' | 'active' | 'archived'
export type SafetyEventType = 'kekerasan' | 'krisis' | 'manipulasi' | 'ancaman'
export type SafetyEventStatus = 'new' | 'in_review' | 'resolved' | 'escalated'
export type FeatureSource =
  | 'pahami_kalimatnya'
  | 'jawab_dengan_tenang'
  | 'aku_merasa_sendirian'
  | 'aku_merasa_buntu'
  | 'perbaiki_setelah_salah_bicara'
  | 'beban_tak_terlihat'
  | 'refleksi_harian'
  | 'verse_reflection'
  | 'safety_fallback'
  | 'daily_reflection_guide'
export type SavedItemSource =
  | 'pahami_kalimatnya'
  | 'jawab_dengan_tenang'
  | 'aku_merasa_sendirian'
  | 'aku_merasa_buntu'
  | 'perbaiki_setelah_salah_bicara'
  | 'beban_tak_terlihat'
  | 'ayat_pengingat'
export type ConditionCategory = 'personal_emotion' | 'relationship' | 'spiritual' | 'general'
export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed'
export type BillingInterval = 'monthly' | 'yearly'

// ============================================================
// TABLE TYPES
// ============================================================

export interface Profile {
  id: string
  user_id: string
  nickname: string
  role: UserRole
  birth_date: string | null
  partner_code_used: string | null
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface OnboardingResponse {
  id: string
  user_id: string
  answers: Record<string, string>
  created_at: string
  updated_at: string
}

export interface Trial {
  id: string
  user_id: string
  started_at: string
  expires_at: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  status: SubscriptionStatus
  started_at: string
  current_period_end: string
  cancelled_at: string | null
  payment_method: PaymentMethod | null
  gateway_customer_id: string | null
  created_at: string
  updated_at: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  billing_interval: BillingInterval
  trial_days: number
  is_active: boolean
  features: string[]
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  user_id: string
  subscription_id: string | null
  partner_code_id: string | null
  amount: number
  method: PaymentMethod
  status: PaymentStatus
  gateway_ref: string | null
  failed_reason: string | null
  created_at: string
  updated_at: string
}

export interface Partner {
  id: string
  community_name: string
  pic_name: string
  pic_email: string
  platform: string | null
  community_size: number | null
  status: PartnerStatus
  revenue_share_pct: number
  bank_account: Record<string, string> | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PartnerCode {
  id: string
  partner_id: string
  code: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PartnerReferral {
  id: string
  partner_code_id: string
  user_id: string
  registered_at: string
  converted_at: string | null
  is_active_subscriber: boolean
}

export interface PartnerPayout {
  id: string
  partner_id: string
  period_month: string
  total_referrals: number
  active_subs: number
  revenue_generated: number
  share_amount: number
  status: PayoutStatus
  paid_at: string | null
  created_at: string
  updated_at: string
}

// ============================================================
// SESSION / REFLECTION TYPES
// ============================================================

export interface PahamiSession {
  id: string
  user_id: string
  input_text: string
  context_situation: string | null
  output_emotion: string | null
  output_need: string | null
  output_responses: PahamiResponseOption[] | null
  feedback_helpful: boolean | null
  is_saved: boolean
  created_at: string
  updated_at: string
}

export interface PahamiResponseOption {
  tone: 'lembut' | 'lugas' | 'mengajak'
  text: string
}

export interface JawabSession {
  id: string
  user_id: string
  input_text: string
  intent_type: string | null
  emotion_level: string | null
  output_reflection: string | null
  output_sentences: JawabSentenceOption[] | null
  output_timing: string | null
  feedback_helpful: boolean | null
  is_saved: boolean
  created_at: string
  updated_at: string
}

export interface JawabSentenceOption {
  version: string
  text: string
}

export interface SendirianSession {
  id: string
  user_id: string
  answers: Record<string, string>
  output_validation: string | null
  output_reflection_q: string | null
  output_message_draft: string | null
  feedback_helpful: boolean | null
  is_saved: boolean
  created_at: string
  updated_at: string
}

export interface BuntuSession {
  id: string
  user_id: string
  answers: Record<string, string>
  output_ack: string | null
  output_perspective: string | null
  output_next_step: string | null
  feedback_helpful: boolean | null
  is_saved: boolean
  created_at: string
  updated_at: string
}

export interface PerbaikiSession {
  id: string
  user_id: string
  description_text: string
  current_condition: string | null
  goal_type: string | null
  output_reflection: string | null
  output_timing: string | null
  output_opener_spoken: string | null
  output_opener_text: string | null
  feedback_helpful: boolean | null
  is_saved: boolean
  created_at: string
  updated_at: string
}

export interface BebanSession {
  id: string
  user_id: string
  selected_burdens: string[]
  custom_burdens: string[] | null
  output_summary: string | null
  output_conversation_guide: string | null
  output_husband_guide: string | null
  feedback_helpful: boolean | null
  is_saved: boolean
  created_at: string
  updated_at: string
}

export interface RefleksiHarian {
  id: string
  user_id: string
  content_text: string
  guide_question_used: string | null
  created_at: string
  updated_at: string
}

export interface SavedItem {
  id: string
  user_id: string
  source_type: SavedItemSource
  source_id: string
  personal_note: string | null
  created_at: string
  updated_at: string
}

// ============================================================
// CONTENT LIBRARY TYPES
// ============================================================

export interface AyatPengingat {
  id: string
  arabic_text: string
  translation: string
  contextualization: string
  category: string
  source_ref: string
  status: ContentStatus
  created_by: string | null
  verified_by: string | null
  display_date: string | null
  created_at: string
  updated_at: string
}

export interface Condition {
  id: string
  label: string
  slug: string | null
  category: ConditionCategory
  description: string | null
  applicable_features: FeatureSource[]
  is_active: boolean
  icon_name: string | null
  order_index: number
  created_at: string
  updated_at: string
}

export interface ConditionVerseMapping {
  id: string
  condition_id: string
  verse_id: string
  relevance_note: string | null
  sort_order: number
  created_at: string
}

export interface PromptTemplate {
  id: string
  name: string
  feature_target: FeatureSource
  template_text: string
  version: number
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

// ============================================================
// ADMIN TYPES
// ============================================================

export interface AdminUser {
  id: string
  user_id: string
  admin_role: AdminRole
  partner_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SafetyEvent {
  id: string
  user_id: string
  feature_source: FeatureSource
  event_type: SafetyEventType
  trigger_keywords: string[] | null
  system_action: string
  handler_notes: string | null
  status: SafetyEventStatus
  handled_by: string | null
  created_at: string
  updated_at: string
}

export interface AdminAuditLog {
  id: string
  admin_user_id: string
  action_type: string
  target_table: string
  target_id: string | null
  old_values: Record<string, unknown> | null
  new_values: Record<string, unknown> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface AppSetting {
  key: string
  value: string
  value_type: 'string' | 'integer' | 'boolean' | 'json'
  description: string | null
  is_public: boolean
  updated_by: string | null
  updated_at: string
}

export interface FeatureFlag {
  key: string
  is_enabled: boolean
  description: string | null
  updated_by: string | null
  updated_at: string
}

// ============================================================
// VIEW TYPES
// ============================================================

export interface PartnerReferralSummary {
  partner_id: string
  partner_code_id: string
  partner_code: string
  total_referrals: number
  total_converted: number
  active_subscribers: number
  conversion_rate_pct: number | null
  first_referral_at: string | null
  latest_referral_at: string | null
}

export interface AdminProductMetrics {
  total_users: number
  active_trials: number
  active_subscribers: number
  revenue_mtd: number
  pending_safety_events: number
  active_partners: number
}

// ============================================================
// COMPOSITE TYPES (for API responses)
// ============================================================

export interface UserWithAccess {
  profile: Profile
  trial: Trial | null
  subscription: Subscription | null
  hasActiveAccess: boolean
  hasActiveTrial: boolean
  hasActiveSubscription: boolean
  trialDaysLeft: number | null
}

export interface FullAdminUser extends AdminUser {
  profile: Profile
}
