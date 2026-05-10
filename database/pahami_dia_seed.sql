-- ============================================================
-- PAHAMI DIA: Seed Data
-- PostgreSQL via Supabase
-- Version: 1.0 | Mei 2026
-- ============================================================
-- URUTAN EKSEKUSI:
--   1. Schema additions (tabel baru + kolom tambahan)
--   2. Enum additions
--   3. Subscription plans
--   4. Emotional conditions
--   5. Verse library (placeholder)
--   6. Condition-verse mappings
--   7. Prompt templates
--   8. App settings
--   9. Feature flags
--  10. Seed verification queries
-- ============================================================
-- PENTING:
--   Jalankan file ini SETELAH pahami_dia_rls.sql berhasil.
--   File ini menggunakan service_role atau superuser.
--   Jangan jalankan sebagai authenticated user biasa.
-- ============================================================

BEGIN;

-- ============================================================
-- BAGIAN 1: SCHEMA ADDITIONS
-- Tabel baru dan kolom tambahan yang belum ada di schema utama.
-- ============================================================

-- ------------------------------------------------------------
-- 1.1 Subscription Plans
-- Menyimpan definisi plan berlangganan. Saat ini hanya satu plan.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscription_plans (
    id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name              TEXT NOT NULL,
    slug              TEXT NOT NULL UNIQUE,
    description       TEXT,
    price             INTEGER NOT NULL,          -- dalam Rupiah, tanpa desimal
    billing_interval  TEXT NOT NULL              -- 'monthly' | 'yearly'
                      CHECK (billing_interval IN ('monthly', 'yearly')),
    trial_days        INTEGER NOT NULL DEFAULT 0,
    is_active         BOOLEAN NOT NULL DEFAULT true,
    features          JSONB NOT NULL DEFAULT '[]',
    sort_order        INTEGER NOT NULL DEFAULT 0,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_subscription_plans_updated_at
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- 1.2 App Settings
-- Key-value store untuk konfigurasi aplikasi yang bisa diubah
-- tanpa deploy ulang. Dikelola oleh super_admin.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS app_settings (
    key          TEXT PRIMARY KEY,
    value        TEXT NOT NULL,
    value_type   TEXT NOT NULL DEFAULT 'string'  -- 'string' | 'integer' | 'boolean' | 'json'
                 CHECK (value_type IN ('string', 'integer', 'boolean', 'json')),
    description  TEXT,
    is_public    BOOLEAN NOT NULL DEFAULT false,  -- true = bisa dibaca anon, false = hanya admin
    updated_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 1.3 Feature Flags
-- Toggle fitur tanpa deploy ulang. Dikelola oleh super_admin.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feature_flags (
    key          TEXT PRIMARY KEY,
    is_enabled   BOOLEAN NOT NULL DEFAULT false,
    description  TEXT,
    updated_by   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- 1.4 Tambahan kolom pada tabel conditions (jika belum ada)
-- Kolom ini memperkaya data kondisi yang ada.
-- ------------------------------------------------------------
ALTER TABLE conditions
    ADD COLUMN IF NOT EXISTS slug         TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS category     TEXT NOT NULL DEFAULT 'general'
                                          CHECK (category IN (
                                              'personal_emotion',
                                              'relationship',
                                              'spiritual',
                                              'general'
                                          )),
    ADD COLUMN IF NOT EXISTS description  TEXT,
    ADD COLUMN IF NOT EXISTS icon_name    TEXT,
    ADD COLUMN IF NOT EXISTS order_index  INTEGER NOT NULL DEFAULT 0;

-- ------------------------------------------------------------
-- 1.5 Condition-Verse Mappings
-- Relasi many-to-many antara kondisi emosional dan ayat/hadis.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS condition_verse_mappings (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    condition_id    UUID NOT NULL REFERENCES conditions(id) ON DELETE CASCADE,
    verse_id        UUID NOT NULL REFERENCES ayat_pengingat(id) ON DELETE CASCADE,
    relevance_note  TEXT,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (condition_id, verse_id)
);

-- ------------------------------------------------------------
-- 1.6 Enable RLS untuk tabel baru
-- ------------------------------------------------------------
ALTER TABLE subscription_plans       ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings             ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags            ENABLE ROW LEVEL SECURITY;
ALTER TABLE condition_verse_mappings ENABLE ROW LEVEL SECURITY;

-- Policies untuk subscription_plans
-- Semua authenticated user bisa baca plan yang aktif
CREATE POLICY subscription_plans__user__select
    ON subscription_plans FOR SELECT
    TO authenticated
    USING (is_active = true);

CREATE POLICY subscription_plans__admin__all
    ON subscription_plans FOR ALL
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Policies untuk app_settings
CREATE POLICY app_settings__public__select
    ON app_settings FOR SELECT
    TO anon, authenticated
    USING (is_public = true);

CREATE POLICY app_settings__admin__select
    ON app_settings FOR SELECT
    TO authenticated
    USING (is_admin());

CREATE POLICY app_settings__super_admin__all
    ON app_settings FOR ALL
    TO authenticated
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

-- Policies untuk feature_flags
CREATE POLICY feature_flags__admin__select
    ON feature_flags FOR SELECT
    TO authenticated
    USING (is_admin());

CREATE POLICY feature_flags__super_admin__all
    ON feature_flags FOR ALL
    TO authenticated
    USING (is_super_admin())
    WITH CHECK (is_super_admin());

-- Policies untuk condition_verse_mappings
CREATE POLICY condition_verse_mappings__user__select
    ON condition_verse_mappings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY condition_verse_mappings__admin__all
    ON condition_verse_mappings FOR ALL
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- ------------------------------------------------------------
-- 1.7 Enum additions untuk feature_source_type
-- Menambah dua nilai baru untuk prompt templates tambahan.
-- ------------------------------------------------------------
ALTER TYPE feature_source_type ADD VALUE IF NOT EXISTS 'verse_reflection';
ALTER TYPE feature_source_type ADD VALUE IF NOT EXISTS 'safety_fallback';
ALTER TYPE feature_source_type ADD VALUE IF NOT EXISTS 'daily_reflection_guide';

-- ============================================================
-- BAGIAN 2: SUBSCRIPTION PLANS
-- ============================================================

INSERT INTO subscription_plans (
    id,
    name,
    slug,
    description,
    price,
    billing_interval,
    trial_days,
    is_active,
    features,
    sort_order
)
VALUES (
    's0000001-0000-0000-0000-000000000001',
    'Teman Tumbuh Bulanan',
    'teman-tumbuh-bulanan',
    'Akses penuh ke semua fitur Pahami Dia. Tidak ada kontrak. Batalkan kapan saja.',
    10000,
    'monthly',
    10,
    true,
    '[
        "Pahami Kalimatnya tanpa batas",
        "Jawab dengan Tenang tanpa batas",
        "Aku Merasa Sendirian tanpa batas",
        "Aku Merasa Buntu tanpa batas",
        "Perbaiki Setelah Salah Bicara tanpa batas",
        "Beban Tak Terlihat tanpa batas",
        "Ayat Pengingat harian",
        "Refleksi Harian pribadi",
        "Riwayat tersimpan tanpa batas"
    ]'::JSONB,
    1
)
ON CONFLICT (slug) DO UPDATE SET
    name             = EXCLUDED.name,
    description      = EXCLUDED.description,
    price            = EXCLUDED.price,
    trial_days       = EXCLUDED.trial_days,
    features         = EXCLUDED.features,
    updated_at       = now();

-- ============================================================
-- BAGIAN 3: EMOTIONAL CONDITIONS
-- ============================================================
-- Catatan:
-- applicable_features menggunakan nilai dari enum feature_source_type.
-- category: personal_emotion | relationship | spiritual | general
-- slug: digunakan sebagai identifier API dan query string.
-- order_index: urutan tampil di UI (dimulai dari 1).
-- ============================================================

INSERT INTO conditions (
    id, label, slug, category, description, applicable_features,
    is_active, order_index
)
VALUES

-- KATEGORI: personal_emotion
(
    'c0000001-0000-0000-0000-000000000001',
    'Lelah',
    'lelah',
    'personal_emotion',
    'Kelelahan fisik atau emosional yang terasa menumpuk dan belum tersalurkan.',
    ARRAY['aku_merasa_sendirian', 'refleksi_harian', 'beban_tak_terlihat'],
    true, 1
),
(
    'c0000001-0000-0000-0000-000000000002',
    'Cemas',
    'cemas',
    'personal_emotion',
    'Kekhawatiran tentang sesuatu yang belum terjadi atau sedang berlangsung.',
    ARRAY['pahami_kalimatnya', 'jawab_dengan_tenang', 'refleksi_harian'],
    true, 2
),
(
    'c0000001-0000-0000-0000-000000000003',
    'Merasa Bersalah',
    'merasa_bersalah',
    'personal_emotion',
    'Rasa bersalah atas sesuatu yang sudah dikatakan atau dilakukan.',
    ARRAY['perbaiki_setelah_salah_bicara', 'jawab_dengan_tenang', 'refleksi_harian'],
    true, 3
),
(
    'c0000001-0000-0000-0000-000000000004',
    'Sedang Diuji',
    'sedang_diuji',
    'personal_emotion',
    'Merasa sedang melewati masa sulit yang terasa berat untuk dihadapi.',
    ARRAY['aku_merasa_sendirian', 'refleksi_harian'],
    true, 4
),
(
    'c0000001-0000-0000-0000-000000000005',
    'Bingung Mengambil Keputusan',
    'bingung_mengambil_keputusan',
    'personal_emotion',
    'Tidak tahu harus memilih apa dalam sebuah situasi yang penting.',
    ARRAY['jawab_dengan_tenang', 'refleksi_harian'],
    true, 5
),
(
    'c0000001-0000-0000-0000-000000000006',
    'Ingin Lebih Sabar',
    'ingin_lebih_sabar',
    'personal_emotion',
    'Menyadari bahwa reaksi sendiri sering terlalu cepat dan ingin berubah.',
    ARRAY['pahami_kalimatnya', 'jawab_dengan_tenang', 'refleksi_harian'],
    true, 6
),
(
    'c0000001-0000-0000-0000-000000000007',
    'Ingin Memperbaiki Diri',
    'ingin_memperbaiki_diri',
    'personal_emotion',
    'Ada dorongan untuk menjadi versi yang lebih baik, tapi tidak tahu mulai dari mana.',
    ARRAY['refleksi_harian', 'jawab_dengan_tenang'],
    true, 7
),
(
    'c0000001-0000-0000-0000-000000000008',
    'Bersyukur',
    'bersyukur',
    'personal_emotion',
    'Sedang merasakan rasa syukur dan ingin mencatatnya atau merenungkannya lebih dalam.',
    ARRAY['refleksi_harian'],
    true, 8
),

-- KATEGORI: spiritual
(
    'c0000001-0000-0000-0000-000000000009',
    'Merasa Jauh dari Allah',
    'merasa_jauh_dari_allah',
    'spiritual',
    'Ada jarak yang terasa antara diri sendiri dengan Allah, dan ingin kembali dekat.',
    ARRAY['refleksi_harian'],
    true, 9
),

-- KATEGORI: relationship
(
    'c0000001-0000-0000-0000-000000000010',
    'Butuh Ketenangan dalam Rumah Tangga',
    'butuh_ketenangan_rumah_tangga',
    'relationship',
    'Rumah tangga terasa tegang dan ada kerinduan akan kedamaian.',
    ARRAY['pahami_kalimatnya', 'jawab_dengan_tenang', 'refleksi_harian'],
    true, 10
),
(
    'c0000001-0000-0000-0000-000000000011',
    'Marah kepada Pasangan',
    'marah_kepada_pasangan',
    'relationship',
    'Ada kemarahan yang belum tersalurkan terhadap pasangan.',
    ARRAY['pahami_kalimatnya', 'perbaiki_setelah_salah_bicara'],
    true, 11
),
(
    'c0000001-0000-0000-0000-000000000012',
    'Merasa Tidak Didengar',
    'merasa_tidak_didengar',
    'relationship',
    'Perasaan bahwa apa yang disampaikan tidak benar-benar sampai ke pasangan.',
    ARRAY['aku_merasa_sendirian', 'jawab_dengan_tenang'],
    true, 12
),
(
    'c0000001-0000-0000-0000-000000000013',
    'Takut Salah Bicara',
    'takut_salah_bicara',
    'relationship',
    'Ada sesuatu yang ingin disampaikan tapi takut kata-kata yang keluar justru memperburuk.',
    ARRAY['jawab_dengan_tenang', 'aku_merasa_buntu'],
    true, 13
),
(
    'c0000001-0000-0000-0000-000000000014',
    'Ingin Meminta Maaf',
    'ingin_meminta_maaf',
    'relationship',
    'Menyadari ada kesalahan dan ingin meminta maaf dengan tulus, bukan sekadar formalitas.',
    ARRAY['perbaiki_setelah_salah_bicara', 'jawab_dengan_tenang'],
    true, 14
),
(
    'c0000001-0000-0000-0000-000000000015',
    'Ingin Memaafkan',
    'ingin_memaafkan',
    'relationship',
    'Ada luka yang masih terasa, tapi ada juga keinginan untuk memaafkan dan melanjutkan.',
    ARRAY['refleksi_harian', 'pahami_kalimatnya'],
    true, 15
),
(
    'c0000001-0000-0000-0000-000000000016',
    'Istri Merasa Sendirian',
    'istri_merasa_sendirian',
    'relationship',
    'Merasa mengerjakan segalanya sendiri tanpa ada yang benar-benar melihat.',
    ARRAY['aku_merasa_sendirian', 'beban_tak_terlihat'],
    true, 16
),
(
    'c0000001-0000-0000-0000-000000000017',
    'Suami Merasa Buntu',
    'suami_merasa_buntu',
    'relationship',
    'Sudah berusaha tapi tetap terasa salah, dan tidak tahu harus berbuat apa lagi.',
    ARRAY['aku_merasa_buntu', 'jawab_dengan_tenang'],
    true, 17
),
(
    'c0000001-0000-0000-0000-000000000018',
    'Luka Lama Terpicu',
    'luka_lama_terpicu',
    'relationship',
    'Sebuah kejadian kecil memicu rasa sakit yang lebih dalam dari masa lalu.',
    ARRAY['pahami_kalimatnya', 'refleksi_harian', 'aku_merasa_sendirian'],
    true, 18
),
(
    'c0000001-0000-0000-0000-000000000019',
    'Komunikasi Terasa Buntu',
    'komunikasi_terasa_buntu',
    'relationship',
    'Percakapan dengan pasangan sering berakhir dengan diam, salah paham, atau frustrasi.',
    ARRAY['pahami_kalimatnya', 'jawab_dengan_tenang', 'perbaiki_setelah_salah_bicara'],
    true, 19
),
(
    'c0000001-0000-0000-0000-000000000020',
    'Ingin Membangun Ulang Kepercayaan',
    'ingin_membangun_ulang_kepercayaan',
    'relationship',
    'Ada jarak atau luka yang membuat kepercayaan perlu dibangun kembali perlahan.',
    ARRAY['perbaiki_setelah_salah_bicara', 'jawab_dengan_tenang', 'refleksi_harian'],
    true, 20
)

ON CONFLICT (slug) DO UPDATE SET
    label               = EXCLUDED.label,
    category            = EXCLUDED.category,
    description         = EXCLUDED.description,
    applicable_features = EXCLUDED.applicable_features,
    order_index         = EXCLUDED.order_index,
    updated_at          = now();

-- ============================================================
-- BAGIAN 4: VERSE LIBRARY (PLACEHOLDER)
-- ============================================================
-- CATATAN KRITIS UNTUK TIM KONTEN DAN TIM ISLAMIC REVIEW:
--
-- Seluruh baris di bawah ini menggunakan teks PLACEHOLDER.
-- arabic_text dan translation WAJIB diisi oleh admin setelah:
--   1. Verifikasi sumber teks Arab dari mushaf standar (Utsmani)
--   2. Pemilihan terjemahan yang sumber lisensinya jelas
--      (Kemenag RI 2019, atau terjemahan lain yang diverifikasi)
--   3. Review kontekstualisasi oleh advisor dengan kompetensi Islam
--
-- Field yang sudah terisi adalah: source_ref, category, contextualization
-- yang diisi sebagai panduan awal saja, BUKAN untuk ditampilkan ke user
-- sebelum diverifikasi.
--
-- Status semua ayat: 'draft' - tidak akan tampil ke user sampai diubah
-- menjadi 'active' oleh admin setelah verifikasi selesai.
-- ============================================================

INSERT INTO ayat_pengingat (
    id,
    arabic_text,
    translation,
    contextualization,
    category,
    source_ref,
    status,
    display_date
)
VALUES

-- Verse 1: Ar-Ra'd 13:28 - Ketenangan
(
    'a0000001-0000-0000-0000-000000000001',
    '[PLACEHOLDER: Teks Arab QS. Ar-Ra''d 13:28 belum diisi. Admin harap isi setelah verifikasi dari mushaf standar Utsmani.]',
    '[PLACEHOLDER: Terjemahan QS. Ar-Ra''d 13:28 belum diisi. Admin harap isi menggunakan terjemahan yang sumber lisensinya sudah diverifikasi. Referensi umum: "Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram."]',
    '[DRAFT - belum diverifikasi] Ketika hati terasa penuh dan tidak ada yang bisa mengisinya, ayat ini mengingatkan bahwa ketenangan sejati memiliki sumber yang tidak pernah kering. Bukan tentang kondisi yang sempurna, tapi tentang kepada siapa kita berpulang.',
    'sabar',
    'QS. Ar-Ra''d (13): 28',
    'draft',
    NULL
),

-- Verse 2: Al-Insyirah 94:5-6 - Kemudahan setelah kesulitan
(
    'a0000001-0000-0000-0000-000000000002',
    '[PLACEHOLDER: Teks Arab QS. Al-Insyirah 94:5-6 belum diisi.]',
    '[PLACEHOLDER: Terjemahan QS. Al-Insyirah 94:5-6 belum diisi. Referensi umum: "Maka sesungguhnya bersama kesulitan ada kemudahan. Sesungguhnya bersama kesulitan ada kemudahan."]',
    '[DRAFT - belum diverifikasi] Ayat ini tidak berkata bahwa setelah kesulitan pasti ada kemudahan. Ia berkata bahwa bersama kesulitan sudah ada kemudahan. Keduanya hadir bersamaan. Masa sulit yang kamu lewati sekarang tidak menghalangi kemudahan itu datang.',
    'sabar',
    'QS. Al-Insyirah (94): 5-6',
    'draft',
    NULL
),

-- Verse 3: Al-Baqarah 2:153 - Sabar dan shalat
(
    'a0000001-0000-0000-0000-000000000003',
    '[PLACEHOLDER: Teks Arab QS. Al-Baqarah 2:153 belum diisi.]',
    '[PLACEHOLDER: Terjemahan QS. Al-Baqarah 2:153 belum diisi. Referensi umum: "Wahai orang-orang yang beriman, mohonlah pertolongan kepada Allah dengan sabar dan shalat. Sesungguhnya Allah beserta orang-orang yang sabar."]',
    '[DRAFT - belum diverifikasi] Sabar di sini bukan diam tanpa suara. Sabar adalah cara kita berdiri kokoh ketika segala sesuatu terasa berat, sambil tetap meminta pertolongan. Ada janji nyata di ujung ayat ini: Allah beserta mereka yang sabar.',
    'sabar',
    'QS. Al-Baqarah (2): 153',
    'draft',
    NULL
),

-- Verse 4: At-Talaq 65:3 - Tawakal
(
    'a0000001-0000-0000-0000-000000000004',
    '[PLACEHOLDER: Teks Arab QS. At-Talaq 65:3 belum diisi.]',
    '[PLACEHOLDER: Terjemahan QS. At-Talaq 65:3 belum diisi. Referensi umum: "...Dan barangsiapa bertawakal kepada Allah, niscaya Allah akan mencukupkan keperluannya. Sesungguhnya Allah melaksanakan urusan-Nya. Sungguh, Allah telah mengadakan ketentuan bagi setiap sesuatu."]',
    '[DRAFT - belum diverifikasi] Tawakal bukan berarti tidak berusaha. Tawakal adalah mengusahakan yang bisa diusahakan, lalu meletakkan sisanya ke tangan Yang paling tahu. Ketika keputusan terasa terlalu besar untuk ditanggung sendiri, ayat ini menjadi tempat berpijak.',
    'sabar',
    'QS. At-Talaq (65): 3',
    'draft',
    NULL
),

-- Verse 5: Az-Zumar 39:53 - Ampunan
(
    'a0000001-0000-0000-0000-000000000005',
    '[PLACEHOLDER: Teks Arab QS. Az-Zumar 39:53 belum diisi.]',
    '[PLACEHOLDER: Terjemahan QS. Az-Zumar 39:53 belum diisi. Referensi umum: "...Janganlah kamu berputus asa dari rahmat Allah. Sesungguhnya Allah mengampuni dosa semuanya. Sungguh, Dialah Yang Maha Pengampun, Maha Penyayang."]',
    '[DRAFT - belum diverifikasi] Tidak ada luka yang terlalu dalam untuk diampuni. Tidak ada jarak yang terlalu jauh untuk dijembatani. Ayat ini bukan izin untuk terus menyakiti, tapi ini adalah pintu yang selalu terbuka bagi siapapun yang ingin kembali.',
    'tobat',
    'QS. Az-Zumar (39): 53',
    'draft',
    NULL
),

-- Verse 6: Ibrahim 14:7 - Syukur
(
    'a0000001-0000-0000-0000-000000000006',
    '[PLACEHOLDER: Teks Arab QS. Ibrahim 14:7 belum diisi.]',
    '[PLACEHOLDER: Terjemahan QS. Ibrahim 14:7 belum diisi. Referensi umum: "Dan ingatlah ketika Tuhanmu memaklumkan, ''Sesungguhnya jika kamu bersyukur, niscaya Aku akan menambah nikmat kepadamu, tetapi jika kamu mengingkari nikmat-Ku, maka pasti azab-Ku sangat berat.''"]',
    '[DRAFT - belum diverifikasi] Syukur bukan hanya soal mengucapkan kata. Ia adalah cara melihat: menemukan yang baik di tengah yang terasa kurang. Janji di ayat ini bukan sekadar motivasi. Ia adalah hukum sebab-akibat yang berlaku nyata dalam kehidupan.',
    'syukur',
    'QS. Ibrahim (14): 7',
    'draft',
    NULL
),

-- Verse 7: Al-Baqarah 2:286 - Ujian tidak melebihi kemampuan
(
    'a0000001-0000-0000-0000-000000000007',
    '[PLACEHOLDER: Teks Arab QS. Al-Baqarah 2:286 belum diisi.]',
    '[PLACEHOLDER: Terjemahan QS. Al-Baqarah 2:286 belum diisi. Referensi umum: "Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya..."]',
    '[DRAFT - belum diverifikasi] Ketika beban terasa melebihi kemampuan, ayat ini bukan penghiburan kosong. Ia adalah pernyataan dari Yang menciptakan kamu tentang kapasitas yang Dia sendiri yang tahu. Mungkin bukan kamu yang perlu berubah, tapi cara kamu melihat dirimu sendiri.',
    'sabar',
    'QS. Al-Baqarah (2): 286',
    'draft',
    NULL
),

-- Verse 8: Ar-Rum 30:21 - Rumah tangga, mawaddah wa rahmah
(
    'a0000001-0000-0000-0000-000000000008',
    '[PLACEHOLDER: Teks Arab QS. Ar-Rum 30:21 belum diisi.]',
    '[PLACEHOLDER: Terjemahan QS. Ar-Rum 30:21 belum diisi. Referensi umum: "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh pada yang demikian itu benar-benar terdapat tanda-tanda bagi kaum yang berpikir."]',
    '[DRAFT - belum diverifikasi] Mawaddah dan rahmah itu bukan sesuatu yang langsung ada dari awal. Ia adalah sesuatu yang Allah jadikan di antara dua orang yang memilih untuk terus hadir satu sama lain. Ketenangan dalam rumah tangga bukan kebetulan. Ia dibangun.',
    'rumah_tangga',
    'QS. Ar-Rum (30): 21',
    'draft',
    NULL
),

-- Verse 9: Al-Baqarah 2:186 - Allah dekat dan mengabulkan doa
(
    'a0000001-0000-0000-0000-000000000009',
    '[PLACEHOLDER: Teks Arab QS. Al-Baqarah 2:186 belum diisi.]',
    '[PLACEHOLDER: Terjemahan QS. Al-Baqarah 2:186 belum diisi. Referensi umum: "Dan apabila hamba-hamba-Ku bertanya kepadamu Muhammad tentang Aku, maka sesungguhnya Aku dekat. Aku kabulkan permohonan orang yang berdoa apabila dia berdoa kepada-Ku..."]',
    '[DRAFT - belum diverifikasi] Tidak perlu suara keras untuk didengar. Tidak perlu kata-kata yang sempurna. Tidak perlu kondisi yang bersih terlebih dahulu. Ayat ini berkata Allah sudah dekat, bahkan sebelum kamu memulai doamu.',
    'doa',
    'QS. Al-Baqarah (2): 186',
    'draft',
    NULL
),

-- Verse 10: Al-Fatihah 1:6 - Petunjuk di jalan yang lurus
(
    'a0000001-0000-0000-0000-000000000010',
    '[PLACEHOLDER: Teks Arab QS. Al-Fatihah 1:6 belum diisi.]',
    '[PLACEHOLDER: Terjemahan QS. Al-Fatihah 1:6 belum diisi. Referensi umum: "Tunjukilah kami jalan yang lurus."]',
    '[DRAFT - belum diverifikasi] Ayat yang paling sering diucapkan manusia setiap harinya adalah permintaan untuk dipandu, bukan untuk tahu segalanya. Ketika kamu tidak tahu harus memilih apa, permintaan paling jujur yang bisa diucapkan mungkin hanya tiga kata ini.',
    'petunjuk',
    'QS. Al-Fatihah (1): 6',
    'draft',
    NULL
)

ON CONFLICT (id) DO UPDATE SET
    arabic_text       = EXCLUDED.arabic_text,
    translation       = EXCLUDED.translation,
    contextualization = EXCLUDED.contextualization,
    category          = EXCLUDED.category,
    source_ref        = EXCLUDED.source_ref,
    updated_at        = now();

-- ============================================================
-- BAGIAN 5: CONDITION-VERSE MAPPINGS
-- ============================================================
-- Setiap kondisi emosional dipetakan ke ayat yang paling relevan.
-- Satu kondisi bisa terhubung ke beberapa ayat.
-- Satu ayat bisa terhubung ke beberapa kondisi.
-- ============================================================

INSERT INTO condition_verse_mappings (condition_id, verse_id, relevance_note, sort_order)
VALUES

-- Ar-Ra'd 13:28 (ketenangan) -> lelah, cemas, butuh ketenangan, komunikasi buntu
('c0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001',
 'Ketenangan hati relevan untuk kondisi lelah yang mendalam.', 1),
('c0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000001',
 'Kecemasan bisa diredakan dengan mengingat sumber ketenangan.', 1),
('c0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000001',
 'Ketenangan rumah tangga terhubung langsung dengan ketenangan hati.', 1),
('c0000001-0000-0000-0000-000000000019', 'a0000001-0000-0000-0000-000000000001',
 'Saat komunikasi buntu, kembali ke ketenangan hati adalah titik awal.', 1),
('c0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000001',
 'Merasa jauh dari Allah sering ditandai dengan hilangnya ketenangan hati.', 1),

-- Al-Insyirah 94:5-6 (kemudahan) -> sedang diuji, komunikasi buntu, luka lama, lelah
('c0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000002',
 'Pengingat bahwa masa sulit bukan permanen.', 1),
('c0000001-0000-0000-0000-000000000019', 'a0000001-0000-0000-0000-000000000002',
 'Komunikasi yang terasa buntu adalah masa sulit yang juga akan berlalu.', 2),
('c0000001-0000-0000-0000-000000000018', 'a0000001-0000-0000-0000-000000000002',
 'Luka lama adalah beban yang berat, dan ada kemudahan yang menanti.', 1),
('c0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000002',
 'Kelelahan tidak berlangsung selamanya.', 2),

-- Al-Baqarah 2:153 (sabar) -> marah kepada pasangan, luka lama, ingin lebih sabar, komunikasi buntu
('c0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000003',
 'Sabar saat marah adalah bentuk sabar yang paling nyata.', 1),
('c0000001-0000-0000-0000-000000000018', 'a0000001-0000-0000-0000-000000000003',
 'Menghadapi luka lama membutuhkan sabar yang aktif, bukan pasif.', 2),
('c0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000003',
 'Keinginan lebih sabar mendapat landasan dari ayat ini.', 1),
('c0000001-0000-0000-0000-000000000019', 'a0000001-0000-0000-0000-000000000003',
 'Kesabaran dalam menghadapi komunikasi yang buntu.', 2),

-- At-Talaq 65:3 (tawakal) -> cemas, bingung, sedang diuji
('c0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000004',
 'Kecemasan berkurang ketika ada tempat bersandar yang pasti.', 2),
('c0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000004',
 'Kebingungan mengambil keputusan diselesaikan dengan tawakal setelah berusaha.', 1),
('c0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004',
 'Ujian terasa lebih ringan ketika ada tempat menyerahkan hasilnya.', 2),

-- Az-Zumar 39:53 (ampunan) -> merasa bersalah, merasa jauh dari Allah, ingin memaafkan, ingin meminta maaf
('c0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000005',
 'Rasa bersalah butuh pintu yang terbuka, bukan tembok.', 1),
('c0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000005',
 'Jauh dari Allah bukan berarti ditolak. Pintu ampunan selalu terbuka.', 2),
('c0000001-0000-0000-0000-000000000015', 'a0000001-0000-0000-0000-000000000005',
 'Memaafkan menjadi lebih mudah ketika kita sendiri menghayati besarnya ampunan.', 1),
('c0000001-0000-0000-0000-000000000014', 'a0000001-0000-0000-0000-000000000005',
 'Meminta maaf dengan tulus dimulai dari keyakinan bahwa ampunan itu nyata.', 1),

-- Ibrahim 14:7 (syukur) -> bersyukur, ingin memperbaiki diri
('c0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000006',
 'Landasan teologis bagi kondisi bersyukur.', 1),
('c0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000006',
 'Memperbaiki diri sering dimulai dari belajar bersyukur atas yang sudah ada.', 1),

-- Al-Baqarah 2:286 (ujian tidak melebihi kemampuan) -> lelah, merasa bersalah, sedang diuji
('c0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000007',
 'Kelelahan yang terasa melebihi kemampuan direspons oleh ayat ini.', 3),
('c0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000007',
 'Beban rasa bersalah tidak melampaui apa yang bisa ditanggung.', 2),
('c0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000007',
 'Keyakinan bahwa ujian sudah disesuaikan dengan kapasitas.', 3),

-- Ar-Rum 30:21 (rumah tangga) -> butuh ketenangan rumah tangga, sendirian, buntu, kepercayaan
('c0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000008',
 'Dasar teologis ketenangan dalam rumah tangga.', 2),
('c0000001-0000-0000-0000-000000000016', 'a0000001-0000-0000-0000-000000000008',
 'Pengingat bahwa rasa tenteram adalah tujuan asal sebuah pernikahan.', 1),
('c0000001-0000-0000-0000-000000000017', 'a0000001-0000-0000-0000-000000000008',
 'Suami yang buntu diingatkan bahwa mawaddah wa rahmah dibangun berdua.', 1),
('c0000001-0000-0000-0000-000000000020', 'a0000001-0000-0000-0000-000000000008',
 'Membangun ulang kepercayaan dimulai dari kembali ke fondasi ini.', 1),

-- Al-Baqarah 2:186 (Allah dekat) -> merasa jauh dari Allah, cemas, butuh ketenangan
('c0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000009',
 'Antitesis dari merasa jauh: Allah justru yang paling dekat.', 3),
('c0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000009',
 'Kecemasan berkurang ketika tahu ada yang mendengar doa.', 3),
('c0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000009',
 'Doa adalah salah satu jalan menuju ketenangan rumah tangga.', 3),

-- Al-Fatihah 1:6 (petunjuk) -> bingung, ingin memperbaiki diri, ingin membangun kepercayaan
('c0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000010',
 'Meminta petunjuk adalah langkah pertama dari kebingungan.', 2),
('c0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000010',
 'Memperbaiki diri dimulai dari meminta ditunjukkan jalannya.', 2),
('c0000001-0000-0000-0000-000000000020', 'a0000001-0000-0000-0000-000000000010',
 'Membangun ulang membutuhkan petunjuk tentang jalan yang benar.', 2)

ON CONFLICT (condition_id, verse_id) DO UPDATE SET
    relevance_note = EXCLUDED.relevance_note,
    sort_order     = EXCLUDED.sort_order;

-- ============================================================
-- BAGIAN 6: PROMPT TEMPLATES
-- ============================================================
-- Setiap template adalah system prompt yang akan dikirim ke AI API
-- setelah variabel {{...}} diganti oleh aplikasi dengan data aktual.
--
-- CATATAN KEAMANAN:
-- Tabel ini hanya bisa diakses oleh super_admin (lihat RLS policy).
-- Jangan ekspos konten template ke endpoint publik apapun.
-- Setiap perubahan template harus melalui proses review dan testing.
-- Status 'is_active = false' pada seed: admin harus aktifkan secara manual
-- setelah review internal.
-- ============================================================

INSERT INTO prompt_templates (
    id, name, feature_target, template_text, version, is_active
)
VALUES

-- ------------------------------------------------------------
-- Template 1: Pahami Kalimatnya
-- ------------------------------------------------------------
(
    'p0000001-0000-0000-0000-000000000001',
    'understand_sentence_v1',
    'pahami_kalimatnya',
    $TEMPLATE$
Kamu adalah asisten refleksi komunikasi untuk pasangan muslim Indonesia, bagian dari aplikasi bernama Pahami Dia.

Seorang {{user_role}} datang kepadamu membawa kalimat yang baru saja diucapkan oleh pasangannya. Tugasmu adalah membantu mereka memahami rasa di balik kalimat tersebut, dan menemukan kemungkinan cara merespons yang lebih baik.

Input yang kamu terima:
- Peran pengguna: {{user_role}}
- Kalimat dari pasangan: {{input_text}}
- Situasi saat kalimat ini diucapkan: {{context_situation}}

Berikan respons HANYA dalam format JSON berikut ini, tanpa preamble, tanpa markdown, tanpa backtick:
{
  "emotion_analysis": "Penjelasan singkat tentang rasa yang mungkin ada di balik kalimat tersebut. Tulis dengan empati, bukan diagnosis. Maksimal 3 kalimat. Mulai dari kemungkinan, bukan kepastian.",
  "underlying_need": "Terjemahan kebutuhan emosional yang mungkin tersembunyi. Mulai dengan kalimat 'Mungkin yang sedang dibutuhkan adalah...'",
  "response_options": [
    {
      "tone": "lembut",
      "text": "Kalimat respons dengan nada yang lembut dan membuka ruang. Terasa alami, bukan kaku."
    },
    {
      "tone": "lugas",
      "text": "Kalimat respons yang jujur dan langsung tapi tidak menyerang."
    },
    {
      "tone": "mengajak",
      "text": "Kalimat respons yang mengajak bicara lebih dalam."
    }
  ]
}

Aturan yang wajib dipatuhi:
1. Jangan pernah menyimpulkan siapa yang salah atau siapa yang benar.
2. Jangan memberikan pendapat hukum syariah apapun.
3. Jangan menghasilkan kalimat respons yang bersifat ultimatum, ancaman, atau manipulatif.
4. Framing selalu berbasis pemahaman, bukan penghakiman.
5. Semua output dalam Bahasa Indonesia yang hangat dan tidak menggurui.
6. Jika input mengandung kata atau frasa yang mengindikasikan kekerasan fisik, ancaman serius, atau situasi yang membahayakan keselamatan, jangan berikan analisis komunikasi biasa. Kembalikan JSON ini saja: {"safety_flag": true}
7. Jangan berasumsi bahwa pasangan adalah sosok jahat atau berbahaya.
8. Maksimal 120 kata per field.
9. Kalimat respons yang disarankan bukan script untuk dihafal. Ia adalah titik tolak.
    $TEMPLATE$,
    1,
    false
),

-- ------------------------------------------------------------
-- Template 2: Jawab dengan Tenang
-- ------------------------------------------------------------
(
    'p0000001-0000-0000-0000-000000000002',
    'calm_response_v1',
    'jawab_dengan_tenang',
    $TEMPLATE$
Kamu adalah asisten refleksi komunikasi untuk pasangan muslim Indonesia, bagian dari aplikasi bernama Pahami Dia.

Seseorang datang kepadamu karena ingin menyampaikan sesuatu kepada pasangannya, tapi belum menemukan kata yang tepat. Tugasmu adalah membantu mereka menyusun kalimat yang lebih tenang, jujur, dan tidak merusak hubungan.

Input yang kamu terima:
- Peran pengguna: {{user_role}}
- Apa yang ingin disampaikan: {{input_text}}
- Niat utama: {{intent_type}}
  (Kemungkinan nilai: meminta_maaf | mengungkapkan_perasaan | klarifikasi | mengungkapkan_kebutuhan | belum_tahu)
- Kondisi emosi saat ini: {{emotion_level}}
  (Kemungkinan nilai: tenang | sedikit_tegang | masih_kesal | sangat_emosional)

Berikan respons HANYA dalam format JSON berikut ini, tanpa preamble, tanpa markdown, tanpa backtick:
{
  "feeling_reflection": "Refleksi singkat tentang apa yang mungkin sedang dirasakan pengguna. Maksimal 2 kalimat. Tulis seolah kamu sedang mencerminkan kembali apa yang kamu tangkap, agar pengguna bisa mengonfirmasi.",
  "suggested_sentences": [
    {
      "version": "pertama",
      "text": "Kalimat yang bisa dicoba, disesuaikan dengan niat dan kondisi emosi."
    },
    {
      "version": "kedua",
      "text": "Alternatif dengan pendekatan sedikit berbeda."
    }
  ],
  "timing_note": "Satu atau dua kalimat tentang kapan situasi biasanya lebih kondusif. Praktis, bukan teori."
}

Aturan yang wajib dipatuhi:
1. Jangan menghasilkan kalimat yang terdengar seperti ultimatum, manipulasi, atau serangan.
2. Jika emotion_level adalah 'sangat_emosional', timing_note harus menyarankan memberi jeda sebentar sebelum berbicara.
3. Jangan pernah menyimpulkan siapa yang benar atau salah.
4. Kalimat yang dihasilkan adalah titik tolak, bukan script yang harus diikuti kata per kata.
5. Jika input mengandung indikasi kekerasan atau ancaman, kembalikan: {"safety_flag": true}
6. Semua output dalam Bahasa Indonesia yang hangat dan tidak menggurui.
7. Maksimal 120 kata per suggested_sentence.
    $TEMPLATE$,
    1,
    false
),

-- ------------------------------------------------------------
-- Template 3: Aku Merasa Sendirian
-- ------------------------------------------------------------
(
    'p0000001-0000-0000-0000-000000000003',
    'lonely_reflection_v1',
    'aku_merasa_sendirian',
    $TEMPLATE$
Kamu adalah asisten refleksi emosional untuk pasangan muslim Indonesia, bagian dari aplikasi bernama Pahami Dia.

Seseorang datang kepadamu karena merasa tidak ditemani, tidak didengar, atau kelelahan yang tidak pernah tervalidasi. Tugasmu bukan memberikan solusi atau nasihat. Tugasmu adalah mengakui rasa yang mereka sampaikan, dan membantu mereka menemukan satu langkah kecil jika mereka membutuhkannya.

Input yang kamu terima:
- Jawaban reflektif pengguna (dalam format JSON): {{answers_json}}
  Setiap kunci dalam JSON adalah label pertanyaan, nilainya adalah jawaban pengguna.

Berikan respons HANYA dalam format JSON berikut ini, tanpa preamble, tanpa markdown, tanpa backtick:
{
  "validation": "Kalimat yang mengakui beratnya yang sedang dirasakan. Tidak membandingkan. Tidak memberikan solusi terburu-buru. Tidak menggunakan kata 'tapi' setelah pengakuan. Maksimal 3 kalimat. Dimulai dengan mengakui, bukan dengan pertanyaan.",
  "reflection_question": "Satu pertanyaan yang bisa direnungkan sendiri oleh pengguna, bukan dijawab ke sistem. Pertanyaan yang membantu mereka menemukan apa yang paling mereka butuhkan saat ini.",
  "offer_next_step": true
}

Catatan untuk offer_next_step: set true jika jawaban pengguna mengindikasikan kesiapan untuk bicara ke pasangan. Set false jika pengguna masih butuh ruang untuk diri sendiri terlebih dahulu.

Aturan yang wajib dipatuhi:
1. Jangan pernah menggunakan frasa 'Aku mengerti perasaanmu' karena terdengar tidak tulus dalam konteks ini.
2. Jangan menyarankan pengguna untuk lebih bersabar atau lebih bersyukur sebagai solusi langsung.
3. Jangan menyalahkan pasangan berdasarkan input pengguna.
4. Jangan pula membela pasangan dengan cara yang membuat pengguna merasa tidak divalidasi.
5. Jika ada indikasi situasi berbahaya atau kekerasan, kembalikan: {"safety_flag": true}
6. Semua output dalam Bahasa Indonesia yang hangat, dewasa, dan tidak menggurui.
7. Validasi harus terasa seperti kata dari teman yang bijak, bukan dari sistem.
    $TEMPLATE$,
    1,
    false
),

-- ------------------------------------------------------------
-- Template 4: Aku Merasa Buntu
-- ------------------------------------------------------------
(
    'p0000001-0000-0000-0000-000000000004',
    'stuck_husband_v1',
    'aku_merasa_buntu',
    $TEMPLATE$
Kamu adalah asisten refleksi untuk pasangan muslim Indonesia, bagian dari aplikasi bernama Pahami Dia.

Seorang suami datang kepadamu karena merasa sudah berusaha keras tapi tetap salah, atau tidak tahu harus berkata atau berbuat apa. Tugasmu adalah mengakui usahanya, membantu dia melihat situasi dari perspektif lain, dan memberikan satu langkah kecil yang konkret.

Input yang kamu terima:
- Jawaban reflektif pengguna (dalam format JSON): {{answers_json}}
  Setiap kunci dalam JSON adalah label pertanyaan, nilainya adalah jawaban pengguna.

Berikan respons HANYA dalam format JSON berikut ini, tanpa preamble, tanpa markdown, tanpa backtick:
{
  "acknowledgment": "Pengakuan atas usaha yang sudah dilakukan. Tulus, bukan basa-basi. Maksimal 2 kalimat. Jangan langsung melompat ke apa yang kurang atau apa yang perlu diperbaiki.",
  "perspective_shift": "Refleksi tentang apa yang mungkin sedang dirasakan istri, berdasarkan jawaban yang diberikan. Ditulis dengan empati untuk kedua pihak. Bukan ceramah. Maksimal 3 kalimat.",
  "one_small_step": "Satu langkah konkret yang bisa dilakukan hari ini atau malam ini. Bukan nasihat besar tentang menjadi suami sempurna. Sesuatu yang kecil, spesifik, dan bisa langsung dilakukan."
}

Aturan yang wajib dipatuhi:
1. Jangan membuat suami merasa semakin bersalah atau dipermalukan.
2. Framing selalu berbasis pertumbuhan, bukan kegagalan.
3. Jangan menyalahkan istri berdasarkan input suami.
4. Langkah konkret harus terasa manusiawi dan dapat dilakukan, bukan terlalu idealis.
5. Jika ada indikasi kekerasan atau situasi berbahaya, kembalikan: {"safety_flag": true}
6. Semua output dalam Bahasa Indonesia yang hangat, tidak menggurui, dan tidak menghakimi.
    $TEMPLATE$,
    1,
    false
),

-- ------------------------------------------------------------
-- Template 5: Perbaiki Setelah Salah Bicara
-- ------------------------------------------------------------
(
    'p0000001-0000-0000-0000-000000000005',
    'repair_after_conflict_v1',
    'perbaiki_setelah_salah_bicara',
    $TEMPLATE$
Kamu adalah asisten refleksi untuk pasangan muslim Indonesia, bagian dari aplikasi bernama Pahami Dia.

Seseorang datang kepadamu setelah konflik terjadi. Kata yang salah sudah keluar. Suasana masih tegang. Tugasmu bukan menilai siapa yang benar atau salah. Tugasmu adalah membantu mereka mengambil satu langkah pertama menuju perbaikan.

Input yang kamu terima:
- Peran pengguna: {{user_role}}
- Deskripsi singkat apa yang terjadi: {{description_text}}
- Kondisi sekarang: {{current_condition}}
  (Kemungkinan nilai: pasangan_sedang_marah | masih_tegang | tidak_bicara_beberapa_jam | perlu_memulai)
- Yang ingin dicapai: {{goal_type}}
  (Kemungkinan nilai: meminta_maaf | membuka_percakapan | memberi_waktu_tapi_tetap_peduli | belum_tahu)

Berikan respons HANYA dalam format JSON berikut ini, tanpa preamble, tanpa markdown, tanpa backtick:
{
  "situation_reflection": "Refleksi singkat tentang situasi tanpa penilaian benar atau salah. Satu atau dua kalimat yang membuat pengguna merasa dipahami, bukan dihakimi.",
  "timing_guidance": "Panduan waktu yang praktis berdasarkan kondisi yang dipilih. Kapan dan bagaimana kondisi biasanya lebih tepat untuk pendekatan.",
  "opener_spoken": "Kalimat pembuka yang bisa diucapkan langsung. Terasa alami, tidak kaku, tidak terdengar seperti membaca teks.",
  "opener_text": "Kalimat pembuka yang bisa dikirim via pesan teks jika bertatap muka terasa terlalu berat dulu. Boleh sedikit lebih panjang dari opener_spoken."
}

Aturan yang wajib dipatuhi:
1. Jangan menyimpulkan siapa yang salah berdasarkan deskripsi input.
2. Kalimat pembuka tidak boleh mengandung permintaan maaf yang terasa dipaksakan atau performatif.
3. Jika current_condition mengindikasikan suasana sangat tegang, timing_guidance harus menyarankan memberi jeda dulu.
4. Jangan pernah menyarankan pengguna untuk bertahan dalam situasi yang berbahaya demi keharmonisan.
5. Jika ada indikasi kekerasan dalam deskripsi, kembalikan: {"safety_flag": true}
6. Semua output dalam Bahasa Indonesia yang hangat dan tidak menggurui.
    $TEMPLATE$,
    1,
    false
),

-- ------------------------------------------------------------
-- Template 6: Beban Tak Terlihat
-- ------------------------------------------------------------
(
    'p0000001-0000-0000-0000-000000000006',
    'invisible_load_v1',
    'beban_tak_terlihat',
    $TEMPLATE$
Kamu adalah asisten refleksi untuk pasangan muslim Indonesia, bagian dari aplikasi bernama Pahami Dia.

Seseorang datang kepadamu untuk mengidentifikasi beban yang tidak terlihat dalam rumah tangganya. Tugasmu adalah membantu mereka melihat gambarannya dengan lebih jelas, dan menemukan cara memulai percakapan tentang hal ini dengan pasangan.

Input yang kamu terima:
- Peran pengguna: {{user_role}}
- Daftar beban yang dipilih: {{selected_burdens}}
  (Berupa array teks)
- Beban tambahan yang ditulis sendiri: {{custom_burdens}}
  (Berupa array teks, bisa kosong)

Berikan respons HANYA dalam format JSON berikut ini, tanpa preamble, tanpa markdown, tanpa backtick:
{
  "burden_summary": "Ringkasan hangat tentang beban yang dipilih, ditulis seolah kamu sedang mencerminkan kembali apa yang mereka sampaikan. Bukan daftar. Paragraf singkat yang terasa personal. Maksimal 4 kalimat.",
  "conversation_starter": "Panduan untuk memulai percakapan tentang beban ini dengan pasangan. Berikan satu atau dua kalimat konkret yang bisa menjadi titik awal, tanpa menyerang atau menuntut.",
  "husband_guide": null
}

Catatan untuk husband_guide: jika user_role adalah 'suami', isi field ini dengan panduan singkat untuk suami tentang cara mengenali dan mulai meringankan beban yang tidak terlihat. Berikan satu langkah konkret yang bisa dimulai hari ini. Jika bukan suami, biarkan nilai null.

Aturan yang wajib dipatuhi:
1. Output tidak boleh memperkuat framing bahwa istri harus menanggung semua beban demi keharmonisan.
2. Output tidak boleh membuat suami merasa dituduh atau diserang.
3. Conversation_starter harus terasa seperti undangan berdialog, bukan tuntutan atau keluhan.
4. Jika ada indikasi kekerasan dalam input, kembalikan: {"safety_flag": true}
5. Semua output dalam Bahasa Indonesia yang hangat dan tidak menggurui.
    $TEMPLATE$,
    1,
    false
),

-- ------------------------------------------------------------
-- Template 7: Verse Reflection (Ayat Pengingat)
-- ------------------------------------------------------------
(
    'p0000001-0000-0000-0000-000000000007',
    'verse_reflection_v1',
    'verse_reflection',
    $TEMPLATE$
Kamu adalah asisten refleksi untuk pasangan muslim Indonesia, bagian dari aplikasi bernama Pahami Dia.

Tugasmu adalah menghasilkan kontekstualisasi singkat dari sebuah ayat Al-Quran atau hadis, yang relevan dengan kondisi emosional pengguna saat ini. Ini bukan tafsir mendalam dan bukan ceramah. Ini adalah satu jembatan singkat antara makna ayat dan kehidupan nyata yang mungkin sedang dirasakan pengguna.

Input yang kamu terima:
- Referensi ayat: {{verse_ref}}
- Terjemahan ayat: {{verse_translation}}
- Kondisi emosional pengguna saat ini: {{user_condition}}

Berikan respons HANYA dalam format JSON berikut ini, tanpa preamble, tanpa markdown, tanpa backtick:
{
  "contextualization": "Satu atau dua kalimat yang menghubungkan makna ayat dengan kondisi yang mungkin sedang dirasakan pengguna. Bukan khotbah. Bukan ceramah. Seperti kata seorang sahabat yang mengingatkan dengan lembut. Maksimal 50 kata."
}

Aturan yang wajib dipatuhi:
1. Jangan pernah menggunakan ayat untuk menyalahkan, menghakimi, atau mempermalukan.
2. Jangan memberikan tafsir yang kontroversial atau tidak memiliki dasar yang kuat.
3. Jangan menggunakan ayat untuk melegitimasi situasi yang berbahaya.
4. Output hanya kontekstualisasi, bukan pengulangan terjemahan.
5. Bahasa harus hangat dan terasa alami, bukan formal atau kaku.
6. Jika kondisi pengguna mengindikasikan situasi darurat keselamatan, kembalikan: {"safety_flag": true}
7. Semua output dalam Bahasa Indonesia.
    $TEMPLATE$,
    1,
    false
),

-- ------------------------------------------------------------
-- Template 8: Daily Reflection Guide (Pemandu Jurnal Harian)
-- ------------------------------------------------------------
(
    'p0000001-0000-0000-0000-000000000008',
    'daily_reflection_guide_v1',
    'daily_reflection_guide',
    $TEMPLATE$
Kamu adalah asisten refleksi untuk pasangan muslim Indonesia, bagian dari aplikasi bernama Pahami Dia.

Tugasmu adalah menghasilkan tiga pertanyaan panduan opsional untuk membantu pengguna memulai jurnal hariannya. Pertanyaan ini tidak wajib dijawab dan pengguna bebas untuk mengabaikannya.

Input yang kamu terima:
- Hari ke berapa pengguna menggunakan aplikasi: {{usage_day}}
- Fitur terakhir yang digunakan pengguna: {{last_feature_used}}
  (Bisa kosong jika belum ada aktivitas)
- Kondisi emosi yang dipilih hari ini (opsional): {{today_condition}}
  (Bisa kosong jika tidak dipilih)

Berikan respons HANYA dalam format JSON berikut ini, tanpa preamble, tanpa markdown, tanpa backtick:
{
  "guide_questions": [
    "Pertanyaan pertama: membantu pengguna mengingat atau mencatat momen bermakna hari ini. Bisa positif atau netral.",
    "Pertanyaan kedua: mengajak pengguna merenungkan sesuatu yang terasa berat atau tidak selesai hari ini.",
    "Pertanyaan ketiga: mengarah pada satu hal kecil yang ingin dilakukan atau diubah besok."
  ]
}

Aturan yang wajib dipatuhi:
1. Pertanyaan tidak boleh terasa seperti kewajiban, ujian, atau evaluasi.
2. Pertanyaan harus terbuka, bukan pertanyaan ya atau tidak.
3. Pertanyaan tidak boleh memicu rasa bersalah atau tekanan.
4. Jika today_condition mengindikasikan kondisi emosi yang berat (lelah, luka lama, sendirian), sertakan satu pertanyaan yang lembut tentang apa yang paling dibutuhkan pengguna saat ini.
5. Sesuaikan tone pertanyaan dengan usage_day: hari awal lebih ringan dan memperkenalkan, hari-hari berikutnya bisa lebih dalam.
6. Semua pertanyaan dalam Bahasa Indonesia yang hangat dan tidak menggurui.
    $TEMPLATE$,
    1,
    false
),

-- ------------------------------------------------------------
-- Template 9: Safety Fallback
-- Ini bukan prompt untuk AI. Ini adalah template respons statis
-- yang digunakan ketika sistem mendeteksi safety flag.
-- Tidak dikirim ke AI API. Dikembalikan langsung oleh aplikasi.
-- ------------------------------------------------------------
(
    'p0000001-0000-0000-0000-000000000009',
    'safety_fallback_v1',
    'safety_fallback',
    $TEMPLATE$
{
  "is_static_response": true,
  "safety_response": {
    "message": "Hei, sebentar. Sepertinya situasi yang kamu hadapi lebih berat dari yang biasanya. Kami ingin memastikan kamu baik-baik saja. Ada orang yang bisa membantu jika kamu atau orang yang kamu cintai sedang dalam situasi yang tidak aman.",
    "resources": [
      {
        "name": "Yayasan Pulih",
        "description": "Layanan konseling dan pemulihan psikologis",
        "contact": "021-788-42580",
        "type": "phone"
      },
      {
        "name": "Into The Light Indonesia",
        "description": "Layanan kesehatan jiwa dan krisis",
        "contact": "119 ext 8",
        "type": "phone"
      },
      {
        "name": "Komnas Perempuan",
        "description": "Komisi Nasional Anti Kekerasan terhadap Perempuan",
        "contact": "021-3903963",
        "type": "phone"
      }
    ],
    "continue_label": "Aku baik-baik saja, lanjutkan",
    "help_label": "Buka informasi bantuan"
  }
}
    $TEMPLATE$,
    1,
    false
)

ON CONFLICT (id) DO UPDATE SET
    template_text = EXCLUDED.template_text,
    updated_at    = now();

-- ============================================================
-- BAGIAN 7: APP SETTINGS
-- ============================================================

INSERT INTO app_settings (key, value, value_type, description, is_public)
VALUES

('app_name',
 'Pahami Dia',
 'string',
 'Nama aplikasi yang ditampilkan di seluruh antarmuka.',
 true),

('app_tagline',
 'Sebelum menjawab, pahami dulu.',
 'string',
 'Tagline utama aplikasi.',
 true),

('trial_days',
 '10',
 'integer',
 'Durasi trial dalam hari. Ubah nilai ini untuk menyesuaikan durasi trial tanpa deploy ulang.',
 false),

('monthly_price',
 '10000',
 'integer',
 'Harga berlangganan bulanan dalam Rupiah. Perubahan nilai ini hanya berlaku untuk subscription baru.',
 true),

('currency',
 'IDR',
 'string',
 'Kode mata uang yang digunakan.',
 true),

('currency_symbol',
 'Rp',
 'string',
 'Simbol mata uang yang ditampilkan di UI.',
 true),

('grace_period_days',
 '3',
 'integer',
 'Jumlah hari grace period setelah pembayaran gagal sebelum akun dikunci.',
 false),

('data_retention_days_after_trial',
 '30',
 'integer',
 'Berapa hari data pengguna disimpan setelah trial habis dan tidak subscribe.',
 false),

('max_sessions_per_day',
 '20',
 'integer',
 'Batas maksimum penggunaan fitur AI per pengguna per hari. 0 = tidak ada batas.',
 false),

('safety_contact_yayasan_pulih',
 '021-788-42580',
 'string',
 'Nomor kontak Yayasan Pulih untuk referensi keamanan pengguna.',
 false),

('safety_contact_into_the_light',
 '119 ext 8',
 'string',
 'Nomor kontak Into The Light Indonesia.',
 false),

('safety_contact_komnas_perempuan',
 '021-3903963',
 'string',
 'Nomor kontak Komnas Perempuan.',
 false),

('support_email',
 'halo@pahamidiaapp.com',
 'string',
 'Email support yang ditampilkan ke pengguna.',
 true),

('default_ai_model',
 'claude-sonnet-4-20250514',
 'string',
 'Model AI default yang digunakan untuk semua fitur generatif. Ubah untuk A/B testing model.',
 false),

('ai_max_tokens',
 '1000',
 'integer',
 'Batas maksimum token untuk setiap respons AI.',
 false),

('partner_default_revenue_share_pct',
 '25.00',
 'string',
 'Persentase revenue share default untuk partner baru. Bisa di-override per partner.',
 false),

('partner_payout_day',
 '10',
 'integer',
 'Tanggal setiap bulan saat revenue share dibayarkan ke partner.',
 false),

('ios_app_version',
 '0.1.0',
 'string',
 'Versi iOS app saat ini. Digunakan untuk force update jika diperlukan.',
 true),

('android_app_version',
 '0.1.0',
 'string',
 'Versi Android app saat ini.',
 true),

('min_required_ios_version',
 '0.1.0',
 'string',
 'Versi iOS minimum yang didukung. Pengguna dengan versi lebih lama akan diminta update.',
 true),

('min_required_android_version',
 '0.1.0',
 'string',
 'Versi Android minimum yang didukung.',
 true)

ON CONFLICT (key) DO UPDATE SET
    value       = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at  = now();

-- ============================================================
-- BAGIAN 8: FEATURE FLAGS
-- ============================================================

INSERT INTO feature_flags (key, is_enabled, description)
VALUES

('payments_enabled',
 false,
 'Aktifkan untuk memungkinkan pengguna melakukan pembayaran subscription. Set false untuk maintenance atau testing.'),

('partner_dashboard_enabled',
 false,
 'Aktifkan untuk membuka akses dashboard partner. Set false saat partner system belum siap.'),

('ai_generation_enabled',
 false,
 'Master switch untuk semua fitur yang menggunakan AI API. Set false jika ada masalah dengan AI provider.'),

('quran_reflection_enabled',
 false,
 'Aktifkan fitur Ayat Pengingat. Set false sampai seluruh konten ayat sudah diverifikasi tim Islamic review.'),

('daily_reflection_guide_enabled',
 false,
 'Aktifkan fitur pertanyaan panduan AI di Refleksi Harian. Jika false, pertanyaan panduan tetap ada tapi bersifat statis.'),

('push_notifications_enabled',
 false,
 'Aktifkan push notification ke pengguna. Set false selama testing.'),

('onboarding_v2_enabled',
 false,
 'Aktifkan versi kedua onboarding flow jika sedang dalam A/B test. Default false.'),

('maintenance_mode',
 false,
 'Jika true, semua pengguna ditampilkan halaman maintenance dan tidak bisa mengakses fitur. Hanya admin yang bisa bypass.'),

('shared_space_enabled',
 false,
 'Fitur berbagi refleksi antar pasangan. Belum masuk MVP. Aktifkan saat fitur ini selesai dibangun dan diuji.'),

('safety_ai_scan_enabled',
 true,
 'Scan input pengguna untuk kata pemicu safety sebelum dikirim ke AI. Selalu true di production.'),

('analytics_enabled',
 false,
 'Kirim event analytics ke dashboard. Set false saat setup analytics belum selesai.')

ON CONFLICT (key) DO UPDATE SET
    is_enabled  = EXCLUDED.is_enabled,
    description = EXCLUDED.description,
    updated_at  = now();

-- ============================================================
-- BAGIAN 9: VERIFIKASI SEED
-- Jalankan query ini setelah seed selesai untuk memastikan
-- semua data berhasil dimasukkan dengan benar.
-- ============================================================

DO $$
DECLARE
    v_plan_count       INTEGER;
    v_condition_count  INTEGER;
    v_verse_count      INTEGER;
    v_mapping_count    INTEGER;
    v_template_count   INTEGER;
    v_settings_count   INTEGER;
    v_flag_count       INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_plan_count      FROM subscription_plans;
    SELECT COUNT(*) INTO v_condition_count FROM conditions;
    SELECT COUNT(*) INTO v_verse_count     FROM ayat_pengingat;
    SELECT COUNT(*) INTO v_mapping_count   FROM condition_verse_mappings;
    SELECT COUNT(*) INTO v_template_count  FROM prompt_templates;
    SELECT COUNT(*) INTO v_settings_count  FROM app_settings;
    SELECT COUNT(*) INTO v_flag_count      FROM feature_flags;

    RAISE NOTICE '========================================';
    RAISE NOTICE 'PAHAMI DIA: Seed Verification';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Subscription plans   : % (expected: 1)',  v_plan_count;
    RAISE NOTICE 'Conditions           : % (expected: 20)', v_condition_count;
    RAISE NOTICE 'Verses               : % (expected: 10)', v_verse_count;
    RAISE NOTICE 'Condition-Verse maps : % (expected: 37)', v_mapping_count;
    RAISE NOTICE 'Prompt templates     : % (expected: 9)',  v_template_count;
    RAISE NOTICE 'App settings         : % (expected: 21)', v_settings_count;
    RAISE NOTICE 'Feature flags        : % (expected: 11)', v_flag_count;
    RAISE NOTICE '========================================';

    IF v_plan_count != 1 THEN
        RAISE WARNING 'MISMATCH: subscription_plans count = %', v_plan_count;
    END IF;
    IF v_condition_count != 20 THEN
        RAISE WARNING 'MISMATCH: conditions count = %', v_condition_count;
    END IF;
    IF v_verse_count != 10 THEN
        RAISE WARNING 'MISMATCH: ayat_pengingat count = %', v_verse_count;
    END IF;
    IF v_template_count != 9 THEN
        RAISE WARNING 'MISMATCH: prompt_templates count = %', v_template_count;
    END IF;

    RAISE NOTICE 'Seed verification selesai.';
END;
$$;

COMMIT;

-- ============================================================
-- BAGIAN 10: CATATAN SETELAH SEED
-- ============================================================
-- Langkah yang WAJIB dilakukan setelah seed ini berhasil:
--
-- 1. Verifikasi dan aktifkan ayat_pengingat:
--    UPDATE ayat_pengingat SET status = 'active'
--    WHERE id = '[id]';
--    Lakukan ini HANYA setelah arabic_text dan translation
--    sudah diisi dan diverifikasi oleh tim Islamic review.
--
-- 2. Aktifkan prompt templates setelah review internal:
--    UPDATE prompt_templates SET is_active = true
--    WHERE name = 'understand_sentence_v1';
--    Lakukan per template, tidak sekaligus, agar bisa diuji satu per satu.
--
-- 3. Aktifkan feature flags sesuai kesiapan:
--    UPDATE feature_flags SET is_enabled = true WHERE key = 'ai_generation_enabled';
--    Aktifkan dalam urutan: safety_ai_scan_enabled (sudah true) ->
--    ai_generation_enabled -> quran_reflection_enabled -> payments_enabled ->
--    partner_dashboard_enabled
--
-- 4. Aktifkan subscription plan:
--    Plan sudah is_active = true dari seed.
--    Pastikan payment gateway sudah terkonfigurasi sebelum
--    mengaktifkan feature flag payments_enabled.
--
-- 5. Review default_ai_model di app_settings:
--    Pastikan model yang disebutkan masih tersedia dan
--    sesuai dengan API key yang sudah dikonfigurasi.
-- ============================================================
