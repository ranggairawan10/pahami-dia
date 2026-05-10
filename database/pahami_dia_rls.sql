-- ============================================================
-- PAHAMI DIA: Row Level Security (RLS) Policies
-- PostgreSQL via Supabase
-- Version: 1.0 | Mei 2026
-- ============================================================
-- URUTAN EKSEKUSI:
--   1. Extensions & Enums
--   2. Table Definitions (schema inference dari PRD)
--   3. Helper Functions
--   4. Triggers
--   5. Enable RLS
--   6. Policies per table
--   7. Grants
-- ============================================================



-- ============================================================
-- BAGIAN 0: EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";



-- ============================================================
-- BAGIAN 1: ENUMS
-- ============================================================

CREATE TYPE user_role_type         AS ENUM ('suami', 'istri');
CREATE TYPE admin_role_type        AS ENUM ('platform_admin', 'super_admin', 'partner_admin');
CREATE TYPE subscription_status    AS ENUM ('active', 'cancelled', 'expired', 'grace_period');
CREATE TYPE payment_status         AS ENUM ('pending', 'success', 'failed', 'refunded');
CREATE TYPE payment_method_type    AS ENUM ('qris', 'transfer_bank', 'gopay', 'ovo', 'dana');
CREATE TYPE partner_status_type    AS ENUM ('active', 'suspended', 'pending_review');
CREATE TYPE content_status_type    AS ENUM ('draft', 'active', 'archived');
CREATE TYPE safety_event_type      AS ENUM ('kekerasan', 'krisis', 'manipulasi', 'ancaman');
CREATE TYPE safety_event_status    AS ENUM ('new', 'in_review', 'resolved', 'escalated');
CREATE TYPE feature_source_type    AS ENUM (
    'pahami_kalimatnya',
    'jawab_dengan_tenang',
    'aku_merasa_sendirian',
    'aku_merasa_buntu',
    'perbaiki_setelah_salah_bicara',
    'beban_tak_terlihat',
    'refleksi_harian'
);
CREATE TYPE saved_item_source_type AS ENUM (
    'pahami_kalimatnya',
    'jawab_dengan_tenang',
    'aku_merasa_sendirian',
    'aku_merasa_buntu',
    'perbaiki_setelah_salah_bicara',
    'beban_tak_terlihat',
    'ayat_pengingat'
);
CREATE TYPE payout_status_type     AS ENUM ('pending', 'processing', 'paid', 'failed');
CREATE TYPE admin_action_type      AS ENUM (
    'insert', 'update', 'delete', 'suspend_user',
    'activate_partner', 'suspend_partner',
    'publish_content', 'archive_content',
    'resolve_safety_event', 'escalate_safety_event',
    'manual_payout', 'config_change'
);



-- ============================================================
-- BAGIAN 2: TABLE DEFINITIONS
-- (Diinferensikan dari PRD dan IA Document Pahami Dia)
-- ============================================================

-- ------------------------------------------------------------
-- 2.1 Profiles (satu baris per user)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id               UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    nickname              TEXT NOT NULL,
    role                  user_role_type NOT NULL,
    birth_date            DATE,
    partner_code_used     TEXT,
    onboarding_completed  BOOLEAN NOT NULL DEFAULT false,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2.2 Onboarding Responses (jawaban pertanyaan onboarding)
-- Data ini sensitif: hanya bisa diakses oleh user itu sendiri
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS onboarding_responses (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    answers     JSONB NOT NULL DEFAULT '{}',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2.3 Trials
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trials (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    started_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '10 days'),
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2.4 Subscriptions
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status               subscription_status NOT NULL DEFAULT 'active',
    started_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    current_period_end   TIMESTAMPTZ NOT NULL,
    cancelled_at         TIMESTAMPTZ,
    payment_method       payment_method_type,
    gateway_customer_id  TEXT,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2.5 Payments
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id      UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    partner_code_id      UUID,  -- FK ke partner_codes, nullable
    amount               INTEGER NOT NULL,  -- dalam satuan rupiah
    method               payment_method_type NOT NULL,
    status               payment_status NOT NULL DEFAULT 'pending',
    gateway_ref          TEXT,
    failed_reason        TEXT,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2.6 Partners
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS partners (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    community_name      TEXT NOT NULL,
    pic_name            TEXT NOT NULL,
    pic_email           TEXT NOT NULL UNIQUE,
    platform            TEXT,
    community_size      INTEGER,
    status              partner_status_type NOT NULL DEFAULT 'pending_review',
    revenue_share_pct   NUMERIC(5,2) NOT NULL DEFAULT 25.00,
    bank_account        JSONB,  -- terenkripsi di sisi aplikasi sebelum disimpan
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2.7 Partner Codes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS partner_codes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id  UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    code        TEXT NOT NULL UNIQUE,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2.8 Partner Referrals
-- Tabel ini HANYA boleh dibaca dalam bentuk aggregate oleh partner admin.
-- Tidak ada raw user data yang boleh terekspos.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS partner_referrals (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_code_id       UUID NOT NULL REFERENCES partner_codes(id) ON DELETE CASCADE,
    user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    registered_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    converted_at          TIMESTAMPTZ,
    is_active_subscriber  BOOLEAN NOT NULL DEFAULT false,
    UNIQUE (partner_code_id, user_id)
);

-- ------------------------------------------------------------
-- 2.9 Partner Payouts
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS partner_payouts (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id        UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    period_month      DATE NOT NULL,  -- first day of month
    total_referrals   INTEGER NOT NULL DEFAULT 0,
    active_subs       INTEGER NOT NULL DEFAULT 0,
    revenue_generated INTEGER NOT NULL DEFAULT 0,  -- rupiah
    share_amount      INTEGER NOT NULL DEFAULT 0,  -- rupiah
    status            payout_status_type NOT NULL DEFAULT 'pending',
    paid_at           TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (partner_id, period_month)
);

-- ------------------------------------------------------------
-- 2.10 Feature Session Tables (Data Sangat Sensitif)
-- Setiap tabel sesi fitur menyimpan konten refleksi pengguna.
-- TIDAK ADA pihak selain user itu sendiri yang boleh membaca isi kolom ini.
-- ------------------------------------------------------------

-- Pahami Kalimatnya
CREATE TABLE IF NOT EXISTS pahami_sessions (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id              UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    input_text           TEXT NOT NULL,       -- SENSITIF: kalimat dari pasangan
    context_situation    TEXT,
    output_emotion       TEXT,
    output_need          TEXT,
    output_responses     JSONB,
    feedback_helpful     BOOLEAN,
    is_saved             BOOLEAN NOT NULL DEFAULT false,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Jawab dengan Tenang
CREATE TABLE IF NOT EXISTS jawab_sessions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    input_text          TEXT NOT NULL,        -- SENSITIF
    intent_type         TEXT,
    emotion_level       TEXT,
    output_reflection   TEXT,
    output_sentences    JSONB,
    output_timing       TEXT,
    feedback_helpful    BOOLEAN,
    is_saved            BOOLEAN NOT NULL DEFAULT false,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aku Merasa Sendirian
CREATE TABLE IF NOT EXISTS sendirian_sessions (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    answers               JSONB NOT NULL DEFAULT '{}',    -- SENSITIF
    output_validation     TEXT,
    output_reflection_q   TEXT,
    output_message_draft  TEXT,
    feedback_helpful      BOOLEAN,
    is_saved              BOOLEAN NOT NULL DEFAULT false,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aku Merasa Buntu
CREATE TABLE IF NOT EXISTS buntu_sessions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    answers             JSONB NOT NULL DEFAULT '{}',      -- SENSITIF
    output_ack          TEXT,
    output_perspective  TEXT,
    output_next_step    TEXT,
    feedback_helpful    BOOLEAN,
    is_saved            BOOLEAN NOT NULL DEFAULT false,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Perbaiki Setelah Salah Bicara
CREATE TABLE IF NOT EXISTS perbaiki_sessions (
    id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    description_text       TEXT NOT NULL,    -- SENSITIF: deskripsi konflik
    current_condition      TEXT,
    goal_type              TEXT,
    output_reflection      TEXT,
    output_timing          TEXT,
    output_opener_spoken   TEXT,
    output_opener_text     TEXT,
    feedback_helpful       BOOLEAN,
    is_saved               BOOLEAN NOT NULL DEFAULT false,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Beban Tak Terlihat
CREATE TABLE IF NOT EXISTS beban_sessions (
    id                        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id                   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    selected_burdens          TEXT[] NOT NULL DEFAULT '{}',  -- SENSITIF
    custom_burdens            TEXT[],
    output_summary            TEXT,
    output_conversation_guide TEXT,
    output_husband_guide      TEXT,
    feedback_helpful          BOOLEAN,
    is_saved                  BOOLEAN NOT NULL DEFAULT false,
    created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2.11 Refleksi Harian (Jurnal Hati -- sangat sensitif)
-- Konten ini adalah jurnal pribadi yang paling sensitif.
-- Bahkan platform admin tidak boleh membaca isi kolom content_text.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS refleksi_harian (
    id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content_text          TEXT NOT NULL,   -- SANGAT SENSITIF: konten jurnal pribadi
    guide_question_used   TEXT,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2.12 Saved Items (Riwayat yang Disimpan)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS saved_items (
    id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_type    saved_item_source_type NOT NULL,
    source_id      UUID NOT NULL,
    personal_note  TEXT,   -- SENSITIF: catatan pribadi user
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2.13 Content Library: Ayat Pengingat
-- Dikelola oleh platform_admin dan super_admin.
-- Dapat dibaca oleh semua authenticated user jika status = 'active'.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ayat_pengingat (
    id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    arabic_text        TEXT NOT NULL,
    translation        TEXT NOT NULL,
    contextualization  TEXT NOT NULL,
    category           TEXT NOT NULL,
    source_ref         TEXT NOT NULL,   -- misal: QS. Ar-Rum: 21 atau HR. Bukhari No. 5185
    status             content_status_type NOT NULL DEFAULT 'draft',
    created_by         UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_by        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    display_date       DATE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2.14 Content Library: Conditions (konteks situasi untuk fitur)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS conditions (
    id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label                TEXT NOT NULL,
    applicable_features  TEXT[] NOT NULL DEFAULT '{}',
    is_active            BOOLEAN NOT NULL DEFAULT true,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2.15 Content Library: Prompt Templates
-- Akses dibatasi: hanya super_admin dan platform_admin dengan izin khusus.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS prompt_templates (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL,
    feature_target  feature_source_type NOT NULL,
    template_text   TEXT NOT NULL,   -- RAHASIA: jangan ekspos ke role apapun selain super_admin
    version         INTEGER NOT NULL DEFAULT 1,
    is_active       BOOLEAN NOT NULL DEFAULT false,
    created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2.16 Safety Events
-- Platform admin bisa melihat metadata event, BUKAN konten raw.
-- Kolom trigger_keywords saja yang disimpan, bukan teks asli user.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS safety_events (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_source   feature_source_type NOT NULL,
    event_type       safety_event_type NOT NULL,
    trigger_keywords TEXT[],   -- kata kunci yang memicu, BUKAN teks asli user
    system_action    TEXT NOT NULL,
    handler_notes    TEXT,
    status           safety_event_status NOT NULL DEFAULT 'new',
    handled_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 2.17 Admin Users
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    admin_role  admin_role_type NOT NULL,
    partner_id  UUID REFERENCES partners(id) ON DELETE SET NULL,
    is_active   BOOLEAN NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT partner_admin_requires_partner_id
        CHECK (
            admin_role != 'partner_admin'
            OR partner_id IS NOT NULL
        )
);

-- ------------------------------------------------------------
-- 2.18 Admin Audit Logs
-- Read-only. Tidak ada UPDATE atau DELETE policy untuk tabel ini.
-- Hanya trigger dan service role yang bisa INSERT.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    action_type     admin_action_type NOT NULL,
    target_table    TEXT NOT NULL,
    target_id       UUID,
    old_values      JSONB,
    new_values      JSONB,
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    -- Tidak ada updated_at: audit log immutable
);

-- ------------------------------------------------------------
-- 2.19 User Feedback (aggregate feedback per feature)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_feedback (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_source  feature_source_type NOT NULL,
    session_id      UUID NOT NULL,
    is_helpful      BOOLEAN NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);



-- ============================================================
-- BAGIAN 3: HELPER FUNCTIONS
-- Semua function menggunakan SECURITY DEFINER agar bisa query
-- tabel admin_users/subscriptions/trials dengan hak system,
-- tanpa membuka akses langsung ke tabel tersebut.
-- ============================================================

-- ------------------------------------------------------------
-- 3.1 is_super_admin()
-- Return true jika user yang sedang login adalah super_admin aktif.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM admin_users
        WHERE user_id    = auth.uid()
          AND admin_role = 'super_admin'
          AND is_active  = true
    );
$$;

-- ------------------------------------------------------------
-- 3.2 is_admin()
-- Return true jika user adalah platform_admin ATAU super_admin aktif.
-- Digunakan untuk akses konten library dan safety events.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM admin_users
        WHERE user_id    = auth.uid()
          AND admin_role IN ('platform_admin', 'super_admin')
          AND is_active  = true
    );
$$;

-- ------------------------------------------------------------
-- 3.3 is_partner_admin()
-- Return true jika user adalah partner_admin aktif.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_partner_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM admin_users
        WHERE user_id    = auth.uid()
          AND admin_role = 'partner_admin'
          AND is_active  = true
    );
$$;

-- ------------------------------------------------------------
-- 3.4 current_user_partner_id()
-- Mengembalikan partner_id dari partner_admin yang sedang login.
-- Mengembalikan NULL jika bukan partner_admin.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION current_user_partner_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT partner_id
    FROM admin_users
    WHERE user_id    = auth.uid()
      AND admin_role = 'partner_admin'
      AND is_active  = true
    LIMIT 1;
$$;

-- ------------------------------------------------------------
-- 3.5 has_active_subscription()
-- Return true jika user memiliki subscription yang masih aktif.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION has_active_subscription()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM subscriptions
        WHERE user_id              = auth.uid()
          AND status               IN ('active', 'grace_period')
          AND current_period_end   > now()
    );
$$;

-- ------------------------------------------------------------
-- 3.6 is_trial_active()
-- Return true jika user masih dalam periode trial.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_trial_active()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM trials
        WHERE user_id    = auth.uid()
          AND is_active  = true
          AND expires_at > now()
    );
$$;

-- ------------------------------------------------------------
-- 3.7 has_active_access()
-- Return true jika user bisa menggunakan fitur inti.
-- Syarat: trial aktif ATAU subscription aktif.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION has_active_access()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT (is_trial_active() OR has_active_subscription());
$$;

-- ------------------------------------------------------------
-- 3.8 get_admin_role()
-- Mengembalikan admin_role string dari user yang sedang login.
-- Mengembalikan NULL jika bukan admin.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_admin_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT admin_role::TEXT
    FROM admin_users
    WHERE user_id   = auth.uid()
      AND is_active = true
    LIMIT 1;
$$;



-- ============================================================
-- BAGIAN 4: TRIGGERS
-- ============================================================

-- ------------------------------------------------------------
-- 4.1 Trigger Function: updated_at otomatis
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Pasang trigger updated_at ke semua tabel yang relevan
DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'profiles', 'onboarding_responses', 'trials', 'subscriptions',
        'payments', 'partners', 'partner_codes', 'partner_payouts',
        'pahami_sessions', 'jawab_sessions', 'sendirian_sessions',
        'buntu_sessions', 'perbaiki_sessions', 'beban_sessions',
        'refleksi_harian', 'saved_items', 'ayat_pengingat',
        'conditions', 'prompt_templates', 'safety_events', 'admin_users'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format(
            'CREATE OR REPLACE TRIGGER trg_%I_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
            tbl, tbl
        );
    END LOOP;
END;
$$;

-- ------------------------------------------------------------
-- 4.2 Trigger Function: Buat profile + trial setelah user signup
-- Trigger ini dipasang pada auth.users via Supabase Database Webhooks
-- atau dengan akses ke schema auth (pastikan permission sesuai).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_nickname   TEXT;
    v_role       user_role_type;
    v_code       TEXT;
BEGIN
    -- Ambil data dari metadata registrasi
    v_nickname := NEW.raw_user_meta_data->>'nickname';
    v_role     := (NEW.raw_user_meta_data->>'role')::user_role_type;
    v_code     := NEW.raw_user_meta_data->>'partner_code';

    -- Buat profil
    INSERT INTO profiles (user_id, nickname, role, partner_code_used)
    VALUES (
        NEW.id,
        COALESCE(v_nickname, 'Pengguna'),
        COALESCE(v_role, 'suami'),
        v_code
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- Mulai trial 10 hari
    INSERT INTO trials (user_id, started_at, expires_at, is_active)
    VALUES (
        NEW.id,
        now(),
        now() + INTERVAL '10 days',
        true
    )
    ON CONFLICT (user_id) DO NOTHING;

    -- Catat referral jika ada partner code
    IF v_code IS NOT NULL AND v_code != '' THEN
        INSERT INTO partner_referrals (partner_code_id, user_id, registered_at)
        SELECT pc.id, NEW.id, now()
        FROM partner_codes pc
        WHERE pc.code      = v_code
          AND pc.is_active = true
        ON CONFLICT (partner_code_id, user_id) DO NOTHING;
    END IF;

    RETURN NEW;
END;
$$;

-- Pasang trigger ke auth.users
-- Catatan: Di Supabase, ini dilakukan via Dashboard > Database > Triggers
-- atau dengan perintah berikut jika memiliki akses ke schema auth:
CREATE OR REPLACE TRIGGER trg_on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ------------------------------------------------------------
-- 4.3 Trigger Function: Audit Log untuk Admin Mutations
-- Dipasang pada tabel-tabel yang perlu diaudit ketika dimodifikasi
-- oleh admin. Trigger ini hanya aktif ketika pelaku adalah admin.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION log_admin_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_admin_id    UUID;
    v_action      admin_action_type;
    v_old_values  JSONB;
    v_new_values  JSONB;
BEGIN
    -- Cek apakah yang melakukan perubahan adalah admin
    SELECT user_id INTO v_admin_id
    FROM admin_users
    WHERE user_id   = auth.uid()
      AND is_active = true
    LIMIT 1;

    -- Jika bukan admin, lewati logging
    IF v_admin_id IS NULL THEN
        IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
        RETURN NEW;
    END IF;

    -- Tentukan tipe aksi
    IF TG_OP = 'INSERT' THEN
        v_action     := 'insert';
        v_old_values := NULL;
        v_new_values := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        v_action     := 'update';
        v_old_values := to_jsonb(OLD);
        v_new_values := to_jsonb(NEW);
    ELSIF TG_OP = 'DELETE' THEN
        v_action     := 'delete';
        v_old_values := to_jsonb(OLD);
        v_new_values := NULL;
    END IF;

    -- Hapus kolom sensitif sebelum logging
    -- Jangan simpan konten refleksi user ke audit log
    IF TG_TABLE_NAME IN (
        'pahami_sessions', 'jawab_sessions', 'sendirian_sessions',
        'buntu_sessions', 'perbaiki_sessions', 'beban_sessions',
        'refleksi_harian', 'onboarding_responses'
    ) THEN
        v_old_values := v_old_values - 'input_text' - 'content_text'
                                     - 'answers' - 'description_text'
                                     - 'selected_burdens' - 'custom_burdens';
        v_new_values := v_new_values - 'input_text' - 'content_text'
                                     - 'answers' - 'description_text'
                                     - 'selected_burdens' - 'custom_burdens';
    END IF;

    -- Hapus data bank dari partner sebelum logging
    IF TG_TABLE_NAME = 'partners' THEN
        v_old_values := v_old_values - 'bank_account';
        v_new_values := v_new_values - 'bank_account';
    END IF;

    INSERT INTO admin_audit_logs (
        admin_user_id, action_type, target_table, target_id,
        old_values, new_values
    )
    VALUES (
        v_admin_id,
        v_action,
        TG_TABLE_NAME,
        CASE
            WHEN TG_OP = 'DELETE' THEN (OLD::JSONB->>'id')::UUID
            ELSE (NEW::JSONB->>'id')::UUID
        END,
        v_old_values,
        v_new_values
    );

    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    RETURN NEW;
END;
$$;

-- Pasang trigger audit log ke tabel yang dikelola admin
DO $$
DECLARE
    tbl TEXT;
    tables TEXT[] := ARRAY[
        'partners', 'partner_codes', 'partner_payouts',
        'ayat_pengingat', 'conditions', 'prompt_templates',
        'safety_events', 'admin_users', 'subscriptions'
    ];
BEGIN
    FOREACH tbl IN ARRAY tables LOOP
        EXECUTE format(
            'CREATE OR REPLACE TRIGGER trg_%I_audit
             AFTER INSERT OR UPDATE OR DELETE ON %I
             FOR EACH ROW EXECUTE FUNCTION log_admin_mutation();',
            tbl, tbl
        );
    END LOOP;
END;
$$;

-- ------------------------------------------------------------
-- 4.4 Trigger: Update partner_referrals.is_active_subscriber
-- Ketika subscription user berubah status, update referral record
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION sync_referral_subscriber_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE partner_referrals
    SET is_active_subscriber = (
        NEW.status IN ('active', 'grace_period')
        AND NEW.current_period_end > now()
    ),
    converted_at = CASE
        WHEN NEW.status = 'active'
             AND OLD.status != 'active'
             AND converted_at IS NULL
        THEN now()
        ELSE converted_at
    END
    WHERE user_id = NEW.user_id;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_subscriptions_sync_referral
    AFTER INSERT OR UPDATE OF status, current_period_end
    ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION sync_referral_subscriber_status();



-- ============================================================
-- BAGIAN 5: ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_responses  ENABLE ROW LEVEL SECURITY;
ALTER TABLE trials                ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners              ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_codes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_referrals     ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_payouts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE pahami_sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE jawab_sessions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sendirian_sessions    ENABLE ROW LEVEL SECURITY;
ALTER TABLE buntu_sessions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE perbaiki_sessions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE beban_sessions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE refleksi_harian       ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_items           ENABLE ROW LEVEL SECURITY;
ALTER TABLE ayat_pengingat        ENABLE ROW LEVEL SECURITY;
ALTER TABLE conditions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompt_templates      ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_events         ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users           ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_logs      ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_feedback         ENABLE ROW LEVEL SECURITY;



-- ============================================================
-- BAGIAN 6: RLS POLICIES
-- Konvensi penamaan: tabel__role__operasi
-- ============================================================

-- ============================================================
-- 6.1 TABLE: profiles
-- ============================================================

-- User hanya bisa baca profil milik sendiri
CREATE POLICY profiles__user__select
    ON profiles FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- User bisa update profil milik sendiri
CREATE POLICY profiles__user__update
    ON profiles FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Profile hanya dibuat oleh trigger (handle_new_user), bukan user langsung
-- Untuk keamanan, INSERT hanya diizinkan via service_role (trigger SECURITY DEFINER)
-- Policy ini dikosongkan untuk user biasa.

-- Admin bisa baca semua profil (untuk user management)
CREATE POLICY profiles__admin__select
    ON profiles FOR SELECT
    TO authenticated
    USING (is_admin());

-- Super admin bisa modifikasi profil jika diperlukan
CREATE POLICY profiles__super_admin__update
    ON profiles FOR UPDATE
    TO authenticated
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

-- ============================================================
-- 6.2 TABLE: onboarding_responses
-- Data ini sangat sensitif. Hanya user sendiri yang boleh akses.
-- ============================================================

CREATE POLICY onboarding_responses__user__select
    ON onboarding_responses FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY onboarding_responses__user__insert
    ON onboarding_responses FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY onboarding_responses__user__update
    ON onboarding_responses FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Admin TIDAK bisa membaca onboarding responses (data terlalu sensitif)
-- Super admin hanya bisa melihat keberadaan record, bukan isinya
-- Ini dikendalikan di application layer, bukan di policy SQL

-- ============================================================
-- 6.3 TABLE: trials
-- ============================================================

CREATE POLICY trials__user__select
    ON trials FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Trial hanya dibuat oleh trigger, bukan user langsung
-- Admin bisa melihat semua trial untuk user management
CREATE POLICY trials__admin__select
    ON trials FOR SELECT
    TO authenticated
    USING (is_admin());

-- Super admin bisa update trial (misal: perpanjang trial untuk kasus khusus)
CREATE POLICY trials__super_admin__all
    ON trials FOR ALL
    TO authenticated
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

-- ============================================================
-- 6.4 TABLE: subscriptions
-- ============================================================

CREATE POLICY subscriptions__user__select
    ON subscriptions FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY subscriptions__user__update
    ON subscriptions FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (
        user_id = auth.uid()
        -- User hanya boleh cancel, bukan mengubah status lain
        AND NEW.status IN ('cancelled')
    );

-- Admin bisa baca semua subscription
CREATE POLICY subscriptions__admin__select
    ON subscriptions FOR SELECT
    TO authenticated
    USING (is_admin());

-- Super admin bisa full access subscription
CREATE POLICY subscriptions__super_admin__all
    ON subscriptions FOR ALL
    TO authenticated
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

-- ============================================================
-- 6.5 TABLE: payments
-- ============================================================

CREATE POLICY payments__user__select
    ON payments FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- User tidak bisa INSERT atau UPDATE payment langsung
-- Payment dibuat oleh service layer (server-side via service_role)

-- Admin bisa baca semua payment
CREATE POLICY payments__admin__select
    ON payments FOR SELECT
    TO authenticated
    USING (is_admin());

-- Super admin full access
CREATE POLICY payments__super_admin__all
    ON payments FOR ALL
    TO authenticated
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

-- ============================================================
-- 6.6 TABLE: partners
-- ============================================================

-- Partner admin bisa baca data partner milik sendiri
CREATE POLICY partners__partner_admin__select
    ON partners FOR SELECT
    TO authenticated
    USING (
        is_partner_admin()
        AND id = current_user_partner_id()
    );

-- Platform admin dan super admin bisa baca semua partner
CREATE POLICY partners__admin__select
    ON partners FOR SELECT
    TO authenticated
    USING (is_admin());

-- Platform admin bisa insert dan update partner
CREATE POLICY partners__admin__insert
    ON partners FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

CREATE POLICY partners__admin__update
    ON partners FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Super admin bisa delete partner
CREATE POLICY partners__super_admin__delete
    ON partners FOR DELETE
    TO authenticated
    USING (is_super_admin());

-- ============================================================
-- 6.7 TABLE: partner_codes
-- ============================================================

-- Partner admin bisa baca kode milik partnernya
CREATE POLICY partner_codes__partner_admin__select
    ON partner_codes FOR SELECT
    TO authenticated
    USING (
        is_partner_admin()
        AND partner_id = current_user_partner_id()
    );

-- Platform admin bisa baca semua
CREATE POLICY partner_codes__admin__select
    ON partner_codes FOR SELECT
    TO authenticated
    USING (is_admin());

-- Platform admin bisa insert dan update
CREATE POLICY partner_codes__admin__insert
    ON partner_codes FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

CREATE POLICY partner_codes__admin__update
    ON partner_codes FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Super admin bisa delete
CREATE POLICY partner_codes__super_admin__delete
    ON partner_codes FOR DELETE
    TO authenticated
    USING (is_super_admin());

-- ============================================================
-- 6.8 TABLE: partner_referrals
-- KRITIS: Partner admin hanya boleh melihat aggregate, BUKAN raw data.
-- Policy di sini mencegah akses langsung ke tabel.
-- Akses aggregate harus via VIEW atau function yang sudah di-filter.
-- ============================================================

-- Partner admin: TIDAK ADA direct SELECT ke tabel ini
-- Akses hanya melalui VIEW partner_referral_summary (lihat Bagian 7)

-- Platform admin bisa baca semua referrals
CREATE POLICY partner_referrals__admin__select
    ON partner_referrals FOR SELECT
    TO authenticated
    USING (is_admin());

-- Super admin full access
CREATE POLICY partner_referrals__super_admin__all
    ON partner_referrals FOR ALL
    TO authenticated
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

-- Catatan: INSERT ke partner_referrals dilakukan oleh trigger handle_new_user
-- via SECURITY DEFINER function, bukan oleh user langsung.

-- ============================================================
-- 6.9 TABLE: partner_payouts
-- ============================================================

-- Partner admin bisa baca payout milik partnernya
CREATE POLICY partner_payouts__partner_admin__select
    ON partner_payouts FOR SELECT
    TO authenticated
    USING (
        is_partner_admin()
        AND partner_id = current_user_partner_id()
    );

-- Platform admin bisa baca dan insert semua payout
CREATE POLICY partner_payouts__admin__select
    ON partner_payouts FOR SELECT
    TO authenticated
    USING (is_admin());

CREATE POLICY partner_payouts__admin__insert
    ON partner_payouts FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

CREATE POLICY partner_payouts__admin__update
    ON partner_payouts FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Super admin bisa delete payout (misal untuk koreksi)
CREATE POLICY partner_payouts__super_admin__delete
    ON partner_payouts FOR DELETE
    TO authenticated
    USING (is_super_admin());

-- ============================================================
-- 6.10 TABLE: pahami_sessions (dan semua session tables)
-- Pattern yang sama berlaku untuk semua tabel session refleksi.
-- User hanya bisa akses milik sendiri.
-- INSERT hanya boleh jika has_active_access().
-- TIDAK ADA akses partner admin atau platform admin ke konten ini.
-- ============================================================

-- Pahami Sessions
CREATE POLICY pahami_sessions__user__select
    ON pahami_sessions FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY pahami_sessions__user__insert
    ON pahami_sessions FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND has_active_access()
    );

CREATE POLICY pahami_sessions__user__update
    ON pahami_sessions FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY pahami_sessions__user__delete
    ON pahami_sessions FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Super admin bisa akses untuk keperluan audit keamanan KRITIS saja
-- Platform admin TIDAK bisa akses konten sesi ini
CREATE POLICY pahami_sessions__super_admin__select
    ON pahami_sessions FOR SELECT
    TO authenticated
    USING (is_super_admin());

-- Jawab Sessions (pattern identik)
CREATE POLICY jawab_sessions__user__select
    ON jawab_sessions FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY jawab_sessions__user__insert
    ON jawab_sessions FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND has_active_access()
    );

CREATE POLICY jawab_sessions__user__update
    ON jawab_sessions FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY jawab_sessions__user__delete
    ON jawab_sessions FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY jawab_sessions__super_admin__select
    ON jawab_sessions FOR SELECT
    TO authenticated
    USING (is_super_admin());

-- Sendirian Sessions
CREATE POLICY sendirian_sessions__user__select
    ON sendirian_sessions FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY sendirian_sessions__user__insert
    ON sendirian_sessions FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND has_active_access()
    );

CREATE POLICY sendirian_sessions__user__update
    ON sendirian_sessions FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY sendirian_sessions__user__delete
    ON sendirian_sessions FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY sendirian_sessions__super_admin__select
    ON sendirian_sessions FOR SELECT
    TO authenticated
    USING (is_super_admin());

-- Buntu Sessions
CREATE POLICY buntu_sessions__user__select
    ON buntu_sessions FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY buntu_sessions__user__insert
    ON buntu_sessions FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND has_active_access()
    );

CREATE POLICY buntu_sessions__user__update
    ON buntu_sessions FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY buntu_sessions__user__delete
    ON buntu_sessions FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY buntu_sessions__super_admin__select
    ON buntu_sessions FOR SELECT
    TO authenticated
    USING (is_super_admin());

-- Perbaiki Sessions
CREATE POLICY perbaiki_sessions__user__select
    ON perbaiki_sessions FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY perbaiki_sessions__user__insert
    ON perbaiki_sessions FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND has_active_access()
    );

CREATE POLICY perbaiki_sessions__user__update
    ON perbaiki_sessions FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY perbaiki_sessions__user__delete
    ON perbaiki_sessions FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY perbaiki_sessions__super_admin__select
    ON perbaiki_sessions FOR SELECT
    TO authenticated
    USING (is_super_admin());

-- Beban Sessions
CREATE POLICY beban_sessions__user__select
    ON beban_sessions FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY beban_sessions__user__insert
    ON beban_sessions FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND has_active_access()
    );

CREATE POLICY beban_sessions__user__update
    ON beban_sessions FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY beban_sessions__user__delete
    ON beban_sessions FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY beban_sessions__super_admin__select
    ON beban_sessions FOR SELECT
    TO authenticated
    USING (is_super_admin());

-- ============================================================
-- 6.11 TABLE: refleksi_harian (Jurnal Hati -- paling sensitif)
-- TIDAK ADA admin apapun yang bisa membaca content_text kolom ini
-- kecuali melalui safety event workflow yang sudah didesain khusus.
-- ============================================================

CREATE POLICY refleksi_harian__user__select
    ON refleksi_harian FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY refleksi_harian__user__insert
    ON refleksi_harian FOR INSERT
    TO authenticated
    WITH CHECK (
        user_id = auth.uid()
        AND has_active_access()
    );

CREATE POLICY refleksi_harian__user__update
    ON refleksi_harian FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY refleksi_harian__user__delete
    ON refleksi_harian FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Bahkan super admin tidak punya policy SELECT ke refleksi_harian via RLS.
-- Jika diperlukan untuk audit keamanan darurat, akses hanya via
-- database admin langsung (bukan melalui aplikasi), dengan prosedur
-- yang didokumentasikan secara manual.

-- ============================================================
-- 6.12 TABLE: saved_items
-- ============================================================

CREATE POLICY saved_items__user__select
    ON saved_items FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY saved_items__user__insert
    ON saved_items FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY saved_items__user__update
    ON saved_items FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY saved_items__user__delete
    ON saved_items FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Super admin bisa akses untuk audit (tapi personal_note tetap tersembunyi
-- di level aplikasi, bukan level database)
CREATE POLICY saved_items__super_admin__select
    ON saved_items FOR SELECT
    TO authenticated
    USING (is_super_admin());

-- ============================================================
-- 6.13 TABLE: ayat_pengingat (Content Library)
-- ============================================================

-- Semua user authenticated bisa baca konten yang sudah aktif
CREATE POLICY ayat_pengingat__user__select
    ON ayat_pengingat FOR SELECT
    TO authenticated
    USING (status = 'active');

-- Platform admin dan super admin bisa baca semua status
CREATE POLICY ayat_pengingat__admin__select
    ON ayat_pengingat FOR SELECT
    TO authenticated
    USING (is_admin());

-- Platform admin bisa insert konten baru (status awal: draft)
CREATE POLICY ayat_pengingat__admin__insert
    ON ayat_pengingat FOR INSERT
    TO authenticated
    WITH CHECK (
        is_admin()
        -- Konten baru wajib masuk sebagai draft dulu
        AND NEW.status = 'draft'
    );

-- Platform admin bisa update konten
CREATE POLICY ayat_pengingat__admin__update
    ON ayat_pengingat FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Hanya super admin yang bisa delete konten
CREATE POLICY ayat_pengingat__super_admin__delete
    ON ayat_pengingat FOR DELETE
    TO authenticated
    USING (is_super_admin());

-- ============================================================
-- 6.14 TABLE: conditions (Content Library)
-- ============================================================

-- User authenticated bisa baca kondisi yang aktif
CREATE POLICY conditions__user__select
    ON conditions FOR SELECT
    TO authenticated
    USING (is_active = true);

-- Admin bisa baca semua
CREATE POLICY conditions__admin__select
    ON conditions FOR SELECT
    TO authenticated
    USING (is_admin());

CREATE POLICY conditions__admin__insert
    ON conditions FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

CREATE POLICY conditions__admin__update
    ON conditions FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY conditions__super_admin__delete
    ON conditions FOR DELETE
    TO authenticated
    USING (is_super_admin());

-- ============================================================
-- 6.15 TABLE: prompt_templates
-- SANGAT RAHASIA. Hanya super_admin yang boleh akses.
-- Platform admin biasa TIDAK boleh melihat template prompt.
-- ============================================================

CREATE POLICY prompt_templates__super_admin__all
    ON prompt_templates FOR ALL
    TO authenticated
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

-- Tidak ada policy untuk role lain. Platform admin pun tidak punya akses.

-- ============================================================
-- 6.16 TABLE: safety_events
-- Platform admin bisa melihat metadata event, BUKAN konten user.
-- Kolom trigger_keywords boleh terlihat, user_id boleh terlihat
-- hanya untuk keperluan tindak lanjut.
-- ============================================================

-- Platform admin bisa baca semua safety events
CREATE POLICY safety_events__admin__select
    ON safety_events FOR SELECT
    TO authenticated
    USING (is_admin());

-- Platform admin bisa update safety events (untuk menandai handled)
CREATE POLICY safety_events__admin__update
    ON safety_events FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Super admin full access
CREATE POLICY safety_events__super_admin__all
    ON safety_events FOR ALL
    TO authenticated
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

-- User tidak bisa baca safety events tentang dirinya sendiri
-- (untuk menghindari pengguna mengetahui kata pemicu yang dideteksi)

-- ============================================================
-- 6.17 TABLE: admin_users
-- ============================================================

-- Admin bisa lihat daftar admin lain (untuk audit internal)
CREATE POLICY admin_users__admin__select
    ON admin_users FOR SELECT
    TO authenticated
    USING (is_admin());

-- Super admin bisa kelola admin users
CREATE POLICY admin_users__super_admin__all
    ON admin_users FOR ALL
    TO authenticated
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

-- ============================================================
-- 6.18 TABLE: admin_audit_logs
-- Immutable log. Hanya bisa SELECT. Tidak ada UPDATE atau DELETE.
-- ============================================================

-- Admin bisa baca audit log
CREATE POLICY admin_audit_logs__admin__select
    ON admin_audit_logs FOR SELECT
    TO authenticated
    USING (is_admin());

-- Super admin bisa baca semua
CREATE POLICY admin_audit_logs__super_admin__select
    ON admin_audit_logs FOR SELECT
    TO authenticated
    USING (is_super_admin());

-- INSERT hanya via trigger SECURITY DEFINER. Tidak ada policy INSERT untuk user.
-- UPDATE dan DELETE: tidak ada policy = tidak ada akses untuk siapapun via RLS.

-- ============================================================
-- 6.19 TABLE: user_feedback
-- ============================================================

CREATE POLICY user_feedback__user__select
    ON user_feedback FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY user_feedback__user__insert
    ON user_feedback FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Admin bisa baca aggregate feedback (untuk product improvement)
CREATE POLICY user_feedback__admin__select
    ON user_feedback FOR SELECT
    TO authenticated
    USING (is_admin());



-- ============================================================
-- BAGIAN 7: AGGREGATE VIEW UNTUK PARTNER ADMIN
-- Partner admin TIDAK bisa query partner_referrals langsung.
-- Mereka hanya bisa akses view ini yang menampilkan aggregate saja.
-- ============================================================

CREATE OR REPLACE VIEW partner_referral_summary
WITH (security_invoker = true)
AS
SELECT
    pc.partner_id,
    pc.id                                    AS partner_code_id,
    pc.code                                  AS partner_code,
    COUNT(pr.id)                             AS total_referrals,
    COUNT(pr.id) FILTER (
        WHERE pr.converted_at IS NOT NULL
    )                                        AS total_converted,
    COUNT(pr.id) FILTER (
        WHERE pr.is_active_subscriber = true
    )                                        AS active_subscribers,
    ROUND(
        COUNT(pr.id) FILTER (
            WHERE pr.converted_at IS NOT NULL
        )::NUMERIC
        / NULLIF(COUNT(pr.id), 0) * 100,
    2)                                       AS conversion_rate_pct,
    MIN(pr.registered_at)                    AS first_referral_at,
    MAX(pr.registered_at)                    AS latest_referral_at
FROM partner_codes pc
LEFT JOIN partner_referrals pr ON pr.partner_code_id = pc.id
WHERE
    -- Partner admin hanya melihat data partner milik sendiri
    (
        is_partner_admin()
        AND pc.partner_id = current_user_partner_id()
    )
    OR is_admin()
GROUP BY pc.partner_id, pc.id, pc.code;

-- Berikan akses SELECT ke view ini untuk authenticated users
-- (RLS di view sudah handled oleh security_invoker = true)
GRANT SELECT ON partner_referral_summary TO authenticated;



-- ============================================================
-- BAGIAN 8: VIEWS UNTUK ADMIN DASHBOARD
-- View ini menggunakan is_admin() sehingga hanya admin yang bisa akses.
-- ============================================================

-- Ringkasan metrik produk untuk platform admin
CREATE OR REPLACE VIEW admin_product_metrics
WITH (security_invoker = true)
AS
SELECT
    (SELECT COUNT(*) FROM profiles)                                   AS total_users,
    (SELECT COUNT(*) FROM trials WHERE is_active = true
        AND expires_at > now())                                       AS active_trials,
    (SELECT COUNT(*) FROM subscriptions
        WHERE status IN ('active', 'grace_period')
        AND current_period_end > now())                               AS active_subscribers,
    (SELECT COALESCE(SUM(amount), 0) FROM payments
        WHERE status = 'success'
        AND created_at >= date_trunc('month', now()))                 AS revenue_mtd,
    (SELECT COUNT(*) FROM safety_events
        WHERE status = 'new')                                         AS pending_safety_events,
    (SELECT COUNT(*) FROM partners WHERE status = 'active')           AS active_partners
WHERE is_admin();  -- hanya admin yang bisa melihat view ini



-- ============================================================
-- BAGIAN 9: GRANTS
-- ============================================================

-- Berikan akses eksekusi helper functions ke authenticated users
GRANT EXECUTE ON FUNCTION is_super_admin()           TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin()                 TO authenticated;
GRANT EXECUTE ON FUNCTION is_partner_admin()         TO authenticated;
GRANT EXECUTE ON FUNCTION current_user_partner_id()  TO authenticated;
GRANT EXECUTE ON FUNCTION has_active_subscription()  TO authenticated;
GRANT EXECUTE ON FUNCTION is_trial_active()          TO authenticated;
GRANT EXECUTE ON FUNCTION has_active_access()        TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_role()           TO authenticated;

-- Berikan akses tabel ke authenticated users
-- (akses actual dikontrol oleh RLS policies di atas)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON admin_product_metrics TO authenticated;



-- ============================================================
-- BAGIAN 10: INDEKS UNTUK PERFORMA RLS QUERIES
-- RLS policies yang menggunakan user_id = auth.uid() akan
-- sangat dibantu oleh indeks pada kolom user_id dan kolom
-- yang sering difilter.
-- ============================================================

-- Indeks user_id pada semua tabel sesi (untuk policy filtering)
CREATE INDEX IF NOT EXISTS idx_pahami_sessions_user_id
    ON pahami_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_jawab_sessions_user_id
    ON jawab_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sendirian_sessions_user_id
    ON sendirian_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_buntu_sessions_user_id
    ON buntu_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_perbaiki_sessions_user_id
    ON perbaiki_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_beban_sessions_user_id
    ON beban_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_refleksi_harian_user_id
    ON refleksi_harian(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_user_id
    ON saved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id
    ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_trials_user_id
    ON trials(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id
    ON payments(user_id);

-- Indeks untuk partner admin filtering
CREATE INDEX IF NOT EXISTS idx_partner_codes_partner_id
    ON partner_codes(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_partner_code_id
    ON partner_referrals(partner_code_id);
CREATE INDEX IF NOT EXISTS idx_partner_referrals_user_id
    ON partner_referrals(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_payouts_partner_id
    ON partner_payouts(partner_id);

-- Indeks untuk helper functions (is_admin, is_partner_admin, etc.)
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id
    ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_users_role
    ON admin_users(admin_role) WHERE is_active = true;

-- Indeks untuk subscription status check (has_active_subscription)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status
    ON subscriptions(user_id, status, current_period_end);

-- Indeks untuk trial check (is_trial_active)
CREATE INDEX IF NOT EXISTS idx_trials_user_active
    ON trials(user_id, is_active, expires_at);

-- Indeks untuk safety events
CREATE INDEX IF NOT EXISTS idx_safety_events_status
    ON safety_events(status);
CREATE INDEX IF NOT EXISTS idx_safety_events_user_id
    ON safety_events(user_id);

-- Indeks untuk content library
CREATE INDEX IF NOT EXISTS idx_ayat_pengingat_status
    ON ayat_pengingat(status);
CREATE INDEX IF NOT EXISTS idx_ayat_pengingat_category
    ON ayat_pengingat(category, status);

-- Indeks untuk audit log
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_admin_user_id
    ON admin_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_created_at
    ON admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_logs_target_table
    ON admin_audit_logs(target_table);



-- ============================================================
-- BAGIAN 11: KOMENTAR DOKUMENTASI PADA TABEL DAN KOLOM SENSITIF
-- ============================================================

COMMENT ON TABLE refleksi_harian IS
'SANGAT SENSITIF: Konten jurnal pribadi user. Tidak ada admin yang memiliki akses baca via aplikasi. Akses hanya melalui database admin dengan prosedur audit manual yang terdokumentasi.';

COMMENT ON COLUMN refleksi_harian.content_text IS
'SANGAT SENSITIF: Konten jurnal hati pribadi. End-to-end encrypted di application layer sebelum disimpan.';

COMMENT ON TABLE pahami_sessions IS
'SENSITIF: Berisi kalimat yang diinput user tentang percakapan dengan pasangan. Akses hanya oleh user sendiri dan super_admin untuk keperluan audit keamanan darurat.';

COMMENT ON TABLE perbaiki_sessions IS
'SENSITIF: Berisi deskripsi konflik rumah tangga. Kolom description_text tidak boleh diekspos ke admin manapun kecuali super_admin dalam kondisi darurat.';

COMMENT ON TABLE partner_referrals IS
'PRIVASI: Partner admin hanya bisa akses via view partner_referral_summary yang menampilkan aggregate saja. Direct query ke tabel ini diblokir untuk partner_admin via RLS.';

COMMENT ON TABLE prompt_templates IS
'SANGAT RAHASIA: Berisi template prompt AI produk. Hanya super_admin yang memiliki akses. Tidak ada platform_admin biasa yang bisa melihat konten tabel ini.';

COMMENT ON TABLE admin_audit_logs IS
'IMMUTABLE: Tabel audit log tidak boleh diupdate atau dihapus oleh siapapun via aplikasi. INSERT hanya melalui trigger SECURITY DEFINER.';

COMMENT ON FUNCTION is_super_admin() IS
'Helper function: Return true jika user yang sedang login adalah super_admin aktif. Gunakan SECURITY DEFINER untuk menghindari privilege escalation.';

COMMENT ON FUNCTION has_active_access() IS
'Helper function: Return true jika user bisa menggunakan fitur inti (trial aktif ATAU subscription aktif). Digunakan dalam INSERT policy semua tabel sesi.';
