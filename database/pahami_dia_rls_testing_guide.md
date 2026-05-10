# PAHAMI DIA: Panduan Pengujian RLS dan Security Checklist
**Version 1.0 | Mei 2026 | Internal Use Only**

---

## BAGIAN A: CARA MENGUJI RLS

### A.1 Filosofi Pengujian RLS

RLS di PostgreSQL bekerja berdasarkan identity pengguna yang sedang aktif dalam koneksi database. Artinya, cara paling akurat untuk menguji adalah dengan berpura-pura menjadi user dengan role tertentu menggunakan `SET ROLE` atau dengan memanfaatkan Supabase's `auth.uid()` injection.

Ada dua pendekatan utama:

**Pendekatan 1: Supabase MFA / service_role test client**
Gunakan dua client: satu dengan JWT user biasa, satu dengan service_role. Bandingkan hasil query yang sama dari kedua client.

**Pendekatan 2: Direct PostgreSQL session impersonation**
Gunakan `SET LOCAL ROLE` dan inject `auth.uid()` secara manual via `SET LOCAL request.jwt.claims`.

---

### A.2 Setup Test Environment

```sql
-- Jalankan ini di awal setiap sesi pengujian
-- Buat user test: satu user biasa, satu partner admin, satu platform admin, satu super admin

-- Pastikan extension uuid-ossp tersedia
SELECT uuid_generate_v4();

-- Simpan UUID test users ke variabel (jalankan satu per satu dan catat hasilnya)
-- Di Supabase, buat via Auth dashboard atau API:
-- user_biasa@test.com
-- partner_admin@test.com
-- platform_admin@test.com
-- super_admin@test.com

-- Setelah user dibuat di auth.users, insert ke admin_users untuk admin roles:
-- (Ganti UUID dengan UUID aktual dari auth.users)

INSERT INTO admin_users (user_id, admin_role, partner_id, is_active)
VALUES
    ('[uuid_platform_admin]', 'platform_admin', NULL, true),
    ('[uuid_super_admin]',    'super_admin',     NULL, true),
    ('[uuid_partner_admin]',  'partner_admin',   '[uuid_partner]', true);
```

---

### A.3 Template Pengujian: Impersonasi User via JWT

Di Supabase, setiap request membawa JWT yang berisi `sub` (user UUID). Untuk testing lokal, gunakan pola ini:

```sql
-- Simulate menjadi user biasa dengan uid = '[uuid_user_biasa]'
SET LOCAL request.jwt.claims = '{"sub": "[uuid_user_biasa]", "role": "authenticated"}';
SET LOCAL ROLE authenticated;

-- Sekarang jalankan query yang akan diuji
SELECT * FROM pahami_sessions;
-- Harusnya: hanya muncul baris milik user_biasa
-- Jika muncul baris user lain: POLICY GAGAL

-- Coba akses data user lain secara langsung
SELECT * FROM pahami_sessions WHERE user_id = '[uuid_user_lain]';
-- Harusnya: 0 baris
-- Jika muncul baris: POLICY GAGAL KRITIS
```

---

### A.4 Test Cases Wajib

Jalankan setiap test case ini dan catat hasilnya. Semua test dengan label HARUS GAGAL memang harus menghasilkan 0 baris atau error permission.

---

#### TEST GROUP 1: User Biasa (User Standard)

```sql
-- Setup: Login sebagai user_biasa (uid = X)
-- Asumsi: ada pahami_sessions dengan user_id = X dan user_id = Y

-- TC-U-01: User bisa baca sesi miliknya sendiri
-- HARUS BERHASIL: Muncul baris milik X
SELECT * FROM pahami_sessions WHERE user_id = '[uid_X]';

-- TC-U-02: User tidak bisa baca sesi milik user lain
-- HARUS GAGAL: 0 baris
SELECT * FROM pahami_sessions WHERE user_id = '[uid_Y]';

-- TC-U-03: User bisa INSERT sesi baru jika trial aktif
-- HARUS BERHASIL (jika trial aktif)
INSERT INTO pahami_sessions (user_id, input_text, context_situation)
VALUES ('[uid_X]', 'Kamu tidak pernah peduli', 'setelah pulang kerja');

-- TC-U-04: User tidak bisa INSERT sesi dengan user_id orang lain
-- HARUS GAGAL: RLS violation
INSERT INTO pahami_sessions (user_id, input_text)
VALUES ('[uid_Y]', 'Teks yang dicuri');

-- TC-U-05: User tidak bisa INSERT sesi jika trial SUDAH habis
-- Setup: expire trial X dulu
UPDATE trials SET expires_at = now() - INTERVAL '1 day' WHERE user_id = '[uid_X]';
-- HARUS GAGAL: has_active_access() = false
INSERT INTO pahami_sessions (user_id, input_text)
VALUES ('[uid_X]', 'Teks setelah trial habis');

-- TC-U-06: User tidak bisa akses partner_referrals sama sekali
-- HARUS GAGAL: 0 baris (tidak ada policy untuk user biasa)
SELECT * FROM partner_referrals;

-- TC-U-07: User tidak bisa akses admin_audit_logs
-- HARUS GAGAL: 0 baris
SELECT * FROM admin_audit_logs;

-- TC-U-08: User tidak bisa akses prompt_templates
-- HARUS GAGAL: 0 baris
SELECT * FROM prompt_templates;

-- TC-U-09: User bisa baca ayat_pengingat yang status = active
-- HARUS BERHASIL
SELECT * FROM ayat_pengingat WHERE status = 'active';

-- TC-U-10: User tidak bisa baca ayat_pengingat status = draft
-- HARUS GAGAL: 0 baris
SELECT * FROM ayat_pengingat WHERE status = 'draft';

-- TC-U-11: User tidak bisa baca refleksi_harian milik user lain
-- HARUS GAGAL: 0 baris
SELECT * FROM refleksi_harian WHERE user_id = '[uid_Y]';

-- TC-U-12: User tidak bisa membatalkan subscription orang lain
-- HARUS GAGAL
UPDATE subscriptions
SET status = 'cancelled'
WHERE user_id = '[uid_Y]';
```

---

#### TEST GROUP 2: Partner Admin

```sql
-- Setup: Login sebagai partner_admin (uid = P, partner_id = PA)

-- TC-PA-01: Partner admin bisa baca data partner miliknya
-- HARUS BERHASIL
SELECT * FROM partners WHERE id = '[uuid_partner_A]';

-- TC-PA-02: Partner admin tidak bisa baca data partner lain
-- HARUS GAGAL: 0 baris
SELECT * FROM partners WHERE id = '[uuid_partner_B]';

-- TC-PA-03: Partner admin tidak bisa baca partner_referrals langsung
-- HARUS GAGAL: 0 baris (tidak ada policy SELECT untuk partner_admin)
SELECT * FROM partner_referrals;

-- TC-PA-04: Partner admin bisa baca aggregate via view
-- HARUS BERHASIL: Muncul data aggregate partner miliknya saja
SELECT * FROM partner_referral_summary;

-- TC-PA-05: Partner admin tidak bisa melihat user_id di partner_referral_summary
-- VERIFIKASI: View tidak boleh mengekspos user_id
-- Pastikan kolom user_id tidak ada di view output

-- TC-PA-06: Partner admin tidak bisa akses pahami_sessions sama sekali
-- HARUS GAGAL: 0 baris
SELECT * FROM pahami_sessions;

-- TC-PA-07: Partner admin tidak bisa akses refleksi_harian
-- HARUS GAGAL: 0 baris
SELECT * FROM refleksi_harian;

-- TC-PA-08: Partner admin tidak bisa akses sendirian_sessions
-- HARUS GAGAL: 0 baris
SELECT * FROM sendirian_sessions;

-- TC-PA-09: Partner admin tidak bisa akses perbaiki_sessions
-- HARUS GAGAL: 0 baris
SELECT * FROM perbaiki_sessions;

-- TC-PA-10: Partner admin tidak bisa akses prompt_templates
-- HARUS GAGAL: 0 baris
SELECT * FROM prompt_templates;

-- TC-PA-11: Partner admin tidak bisa akses safety_events
-- HARUS GAGAL: 0 baris
SELECT * FROM safety_events;

-- TC-PA-12: Partner admin bisa baca payout miliknya
-- HARUS BERHASIL
SELECT * FROM partner_payouts WHERE partner_id = '[uuid_partner_A]';

-- TC-PA-13: Partner admin tidak bisa baca payout partner lain
-- HARUS GAGAL: 0 baris
SELECT * FROM partner_payouts WHERE partner_id = '[uuid_partner_B]';

-- TC-PA-14: Partner admin tidak bisa insert ke partner_payouts
-- HARUS GAGAL: Permission denied
INSERT INTO partner_payouts (partner_id, period_month, total_referrals, active_subs, revenue_generated, share_amount)
VALUES ('[uuid_partner_A]', '2026-05-01', 100, 50, 500000, 125000);
```

---

#### TEST GROUP 3: Platform Admin

```sql
-- Setup: Login sebagai platform_admin (uid = AD)

-- TC-AD-01: Platform admin bisa baca semua profiles
-- HARUS BERHASIL
SELECT COUNT(*) FROM profiles;

-- TC-AD-02: Platform admin bisa baca semua subscriptions
-- HARUS BERHASIL
SELECT COUNT(*) FROM subscriptions;

-- TC-AD-03: Platform admin bisa baca safety_events
-- HARUS BERHASIL
SELECT * FROM safety_events WHERE status = 'new';

-- TC-AD-04: Platform admin bisa insert ayat_pengingat dengan status draft
-- HARUS BERHASIL
INSERT INTO ayat_pengingat (arabic_text, translation, contextualization, category, source_ref, status)
VALUES ('...', 'Terjemahan', 'Konteks', 'sabar', 'QS. Al-Baqarah: 155', 'draft');

-- TC-AD-05: Platform admin TIDAK bisa insert ayat_pengingat dengan status langsung active
-- HARUS GAGAL (WITH CHECK mencegah ini)
INSERT INTO ayat_pengingat (arabic_text, translation, contextualization, category, source_ref, status)
VALUES ('...', 'Terjemahan', 'Konteks', 'sabar', 'QS. Al-Baqarah: 155', 'active');

-- TC-AD-06: Platform admin tidak bisa baca pahami_sessions
-- HARUS GAGAL: 0 baris (tidak ada policy untuk platform_admin di sesi table)
SELECT * FROM pahami_sessions;

-- TC-AD-07: Platform admin tidak bisa baca refleksi_harian
-- HARUS GAGAL: 0 baris
SELECT * FROM refleksi_harian;

-- TC-AD-08: Platform admin tidak bisa baca perbaiki_sessions
-- HARUS GAGAL: 0 baris
SELECT * FROM perbaiki_sessions;

-- TC-AD-09: Platform admin tidak bisa baca prompt_templates
-- HARUS GAGAL: 0 baris (hanya super_admin)
SELECT * FROM prompt_templates;

-- TC-AD-10: Platform admin bisa baca audit logs
-- HARUS BERHASIL
SELECT * FROM admin_audit_logs LIMIT 10;

-- TC-AD-11: Platform admin tidak bisa hapus ayat_pengingat
-- HARUS GAGAL: Permission denied
DELETE FROM ayat_pengingat WHERE id = '[any_id]';

-- TC-AD-12: Platform admin tidak bisa modifikasi admin_users
-- HARUS GAGAL
INSERT INTO admin_users (user_id, admin_role) VALUES ('[uuid_random]', 'platform_admin');

-- TC-AD-13: Audit log terbuat ketika platform admin update ayat_pengingat
-- HARUS BERHASIL dan tercatat di admin_audit_logs
UPDATE ayat_pengingat SET status = 'active' WHERE id = '[id_draft_test]';
SELECT * FROM admin_audit_logs
WHERE action_type = 'update'
  AND target_table = 'ayat_pengingat'
ORDER BY created_at DESC LIMIT 1;
-- Harusnya: ada satu baris baru
```

---

#### TEST GROUP 4: Super Admin

```sql
-- Setup: Login sebagai super_admin (uid = SA)

-- TC-SA-01: Super admin bisa baca semua pahami_sessions
-- HARUS BERHASIL
SELECT COUNT(*) FROM pahami_sessions;

-- TC-SA-02: Super admin bisa baca prompt_templates
-- HARUS BERHASIL
SELECT * FROM prompt_templates;

-- TC-SA-03: Super admin bisa insert admin_users baru
-- HARUS BERHASIL
INSERT INTO admin_users (user_id, admin_role, is_active)
VALUES ('[uuid_new_admin]', 'platform_admin', true);

-- TC-SA-04: Super admin bisa delete konten library
-- HARUS BERHASIL
DELETE FROM ayat_pengingat WHERE id = '[id_test]';

-- TC-SA-05: Super admin TIDAK bisa baca refleksi_harian via RLS
-- HARUS GAGAL: 0 baris (tidak ada policy, by design)
SELECT * FROM refleksi_harian WHERE user_id = '[uid_random]';
-- Jika ini berhasil: POLICY KRITIS GAGAL

-- TC-SA-06: Audit log terbuat untuk semua aksi super admin
-- Jalankan beberapa aksi, lalu:
SELECT * FROM admin_audit_logs
WHERE admin_user_id = '[uid_SA]'
ORDER BY created_at DESC LIMIT 5;
-- Harusnya: semua aksi tercatat

-- TC-SA-07: Super admin tidak bisa update admin_audit_logs
-- HARUS GAGAL: Immutable log
UPDATE admin_audit_logs SET action_type = 'insert' WHERE id = '[any_id]';

-- TC-SA-08: Super admin tidak bisa delete admin_audit_logs
-- HARUS GAGAL
DELETE FROM admin_audit_logs WHERE id = '[any_id]';
```

---

#### TEST GROUP 5: Trigger Verification

```sql
-- TC-TR-01: Profile dan trial terbuat otomatis setelah signup
-- Buat user baru via Supabase Auth API
-- Kemudian:
SELECT * FROM profiles WHERE user_id = '[uuid_new_user]';
-- Harusnya: 1 baris
SELECT * FROM trials WHERE user_id = '[uuid_new_user]';
-- Harusnya: 1 baris dengan expires_at = now() + 10 days

-- TC-TR-02: Partner code dari signup URL teratribusi ke partner_referrals
-- Signup dengan ?ref=CODE123
SELECT * FROM partner_referrals WHERE user_id = '[uuid_new_user]';
-- Harusnya: 1 baris dengan partner_code_id yang sesuai

-- TC-TR-03: updated_at berubah otomatis saat row diupdate
-- Catat updated_at sebelum
SELECT updated_at FROM profiles WHERE user_id = '[uid_X]';
-- Update nickname
UPDATE profiles SET nickname = 'NamaBaru' WHERE user_id = '[uid_X]';
-- Cek updated_at sesudah
SELECT updated_at FROM profiles WHERE user_id = '[uid_X]';
-- Harusnya: berbeda (lebih baru)

-- TC-TR-04: partner_referrals.is_active_subscriber sync saat subscription berubah
-- Set subscription user menjadi active
UPDATE subscriptions SET status = 'active', current_period_end = now() + INTERVAL '30 days'
WHERE user_id = '[uid_X]';
-- Cek referral record
SELECT is_active_subscriber FROM partner_referrals WHERE user_id = '[uid_X]';
-- Harusnya: true
-- Cancel subscription
UPDATE subscriptions SET status = 'cancelled' WHERE user_id = '[uid_X]';
-- Cek lagi
SELECT is_active_subscriber FROM partner_referrals WHERE user_id = '[uid_X]';
-- Harusnya: false
```

---

#### TEST GROUP 6: Helper Functions

```sql
-- TC-HF-01: is_trial_active() return true untuk user dengan trial aktif
SELECT is_trial_active();  -- jalankan sebagai user dengan trial aktif
-- Harusnya: true

-- TC-HF-02: is_trial_active() return false setelah trial habis
-- Expire trial dulu, kemudian:
SELECT is_trial_active();
-- Harusnya: false

-- TC-HF-03: has_active_access() return true jika trial aktif
SELECT has_active_access();
-- Harusnya: true (jika trial masih aktif)

-- TC-HF-04: has_active_access() return true jika subscription aktif (meski trial habis)
-- Expire trial, tapi activate subscription
SELECT has_active_access();
-- Harusnya: true

-- TC-HF-05: has_active_access() return false jika keduanya tidak aktif
-- Expire trial DAN tidak ada subscription aktif
SELECT has_active_access();
-- Harusnya: false

-- TC-HF-06: current_user_partner_id() return UUID partner untuk partner_admin
-- Jalankan sebagai partner_admin
SELECT current_user_partner_id();
-- Harusnya: UUID partner yang sesuai

-- TC-HF-07: current_user_partner_id() return NULL untuk user biasa
-- Jalankan sebagai user biasa
SELECT current_user_partner_id();
-- Harusnya: NULL
```

---

## BAGIAN B: SECURITY CHECKLIST

Checklist ini dijalankan sebelum setiap deployment ke production dan setelah setiap perubahan schema atau policy.

---

### B.1 Checklist Isolation Data User

| No | Item | Status | Catatan |
|----|------|--------|---------|
| 1 | User hanya bisa SELECT data dengan user_id = auth.uid() | [ ] | Uji TC-U-01, TC-U-02 |
| 2 | User tidak bisa INSERT data dengan user_id orang lain | [ ] | Uji TC-U-04 |
| 3 | User tidak bisa INSERT sesi jika trial dan subscription keduanya tidak aktif | [ ] | Uji TC-U-05 |
| 4 | User tidak bisa akses partner_referrals | [ ] | Uji TC-U-06 |
| 5 | User tidak bisa akses admin_audit_logs | [ ] | Uji TC-U-07 |
| 6 | User tidak bisa akses prompt_templates | [ ] | Uji TC-U-08 |
| 7 | User tidak bisa baca ayat_pengingat dengan status draft atau archived | [ ] | Uji TC-U-10 |
| 8 | User tidak bisa memodifikasi subscription orang lain | [ ] | Uji TC-U-12 |
| 9 | User tidak bisa DELETE trial orang lain | [ ] | Test manual |
| 10 | User tidak bisa UPDATE profil orang lain | [ ] | Test manual |

---

### B.2 Checklist Partner Admin Isolation

| No | Item | Status | Catatan |
|----|------|--------|---------|
| 11 | Partner admin tidak bisa baca raw partner_referrals | [ ] | Uji TC-PA-03 |
| 12 | Partner admin hanya melihat aggregate via view | [ ] | Uji TC-PA-04 |
| 13 | View partner_referral_summary tidak mengekspos user_id | [ ] | Uji TC-PA-05 |
| 14 | Partner admin tidak bisa akses pahami_sessions | [ ] | Uji TC-PA-06 |
| 15 | Partner admin tidak bisa akses refleksi_harian | [ ] | Uji TC-PA-07 |
| 16 | Partner admin tidak bisa akses sendirian_sessions | [ ] | Uji TC-PA-08 |
| 17 | Partner admin tidak bisa akses perbaiki_sessions | [ ] | Uji TC-PA-09 |
| 18 | Partner admin tidak bisa akses jawab_sessions | [ ] | Test manual |
| 19 | Partner admin tidak bisa akses buntu_sessions | [ ] | Test manual |
| 20 | Partner admin tidak bisa akses beban_sessions | [ ] | Test manual |
| 21 | Partner admin tidak bisa akses onboarding_responses | [ ] | Test manual |
| 22 | Partner admin tidak bisa akses prompt_templates | [ ] | Uji TC-PA-10 |
| 23 | Partner admin tidak bisa akses safety_events | [ ] | Uji TC-PA-11 |
| 24 | Partner admin hanya bisa baca data partner miliknya sendiri | [ ] | Uji TC-PA-01, TC-PA-02 |
| 25 | Partner admin tidak bisa INSERT ke partner_payouts | [ ] | Uji TC-PA-14 |
| 26 | Partner admin tidak bisa baca payout partner lain | [ ] | Uji TC-PA-13 |

---

### B.3 Checklist Platform Admin Boundaries

| No | Item | Status | Catatan |
|----|------|--------|---------|
| 27 | Platform admin tidak bisa baca pahami_sessions | [ ] | Uji TC-AD-06 |
| 28 | Platform admin tidak bisa baca refleksi_harian | [ ] | Uji TC-AD-07 |
| 29 | Platform admin tidak bisa baca perbaiki_sessions | [ ] | Uji TC-AD-08 |
| 30 | Platform admin tidak bisa baca prompt_templates | [ ] | Uji TC-AD-09 |
| 31 | Platform admin tidak bisa DELETE content library | [ ] | Uji TC-AD-11 |
| 32 | Platform admin tidak bisa modifikasi admin_users | [ ] | Uji TC-AD-12 |
| 33 | Platform admin wajib mulai dari status draft saat insert konten | [ ] | Uji TC-AD-05 |
| 34 | Semua mutasi platform admin tercatat di audit_logs | [ ] | Uji TC-AD-13 |

---

### B.4 Checklist Super Admin Boundaries

| No | Item | Status | Catatan |
|----|------|--------|---------|
| 35 | Super admin TIDAK bisa baca refleksi_harian via aplikasi | [ ] | Uji TC-SA-05 |
| 36 | Semua aksi super admin tercatat di audit_logs | [ ] | Uji TC-SA-06 |
| 37 | Super admin tidak bisa UPDATE admin_audit_logs | [ ] | Uji TC-SA-07 |
| 38 | Super admin tidak bisa DELETE admin_audit_logs | [ ] | Uji TC-SA-08 |

---

### B.5 Checklist Trigger Integrity

| No | Item | Status | Catatan |
|----|------|--------|---------|
| 39 | Profile terbuat otomatis setelah signup | [ ] | Uji TC-TR-01 |
| 40 | Trial terbuat otomatis setelah signup dengan durasi 10 hari | [ ] | Uji TC-TR-01 |
| 41 | Partner referral teratribusi jika ada kode valid saat signup | [ ] | Uji TC-TR-02 |
| 42 | updated_at berubah otomatis saat row diupdate | [ ] | Uji TC-TR-03 |
| 43 | is_active_subscriber sync ketika subscription berubah | [ ] | Uji TC-TR-04 |
| 44 | Audit log tidak menyimpan konten refleksi user (input_text, content_text, answers) | [ ] | Cek kolom old_values di audit_logs |
| 45 | Audit log tidak menyimpan bank_account partner | [ ] | Cek kolom old_values untuk tabel partners |

---

### B.6 Checklist Konfigurasi Supabase

| No | Item | Status | Catatan |
|----|------|--------|---------|
| 46 | service_role key TIDAK diekspos ke frontend | [ ] | Audit codebase |
| 47 | anon key hanya digunakan untuk halaman publik, bukan fitur app | [ ] | Audit codebase |
| 48 | JWT expiry dikonfigurasi maksimal 1 jam | [ ] | Cek Auth settings |
| 49 | Refresh token rotation diaktifkan | [ ] | Cek Auth settings |
| 50 | Email confirmation diaktifkan untuk registrasi | [ ] | Cek Auth settings |
| 51 | Rate limiting diaktifkan untuk Auth endpoints | [ ] | Cek Auth settings |
| 52 | PGRST_DB_ANON_ROLE dikonfigurasi ke role anon yang terbatas | [ ] | Cek API settings |
| 53 | Kolom bank_account dienkripsi di application layer sebelum disimpan | [ ] | Audit application code |
| 54 | Kolom content_text di refleksi_harian dienkripsi di application layer | [ ] | Audit application code |
| 55 | JWT claims tidak mengandung data sensitif | [ ] | Inspect JWT payload |

---

### B.7 Checklist Application Layer (Non-SQL)

| No | Item | Status | Catatan |
|----|------|--------|---------|
| 56 | API endpoint untuk fitur sesi melakukan validasi has_active_access() sebelum memanggil AI | [ ] | Audit API handlers |
| 57 | Partner admin dashboard tidak menampilkan user_id atau nama pengguna | [ ] | Audit UI code |
| 58 | Safety event display di admin panel menyembunyikan konten raw user | [ ] | Audit UI code |
| 59 | Proses pembatalan subscription maksimal 3 langkah (tidak ada dark pattern) | [ ] | UX audit |
| 60 | Proses hapus akun menghapus SEMUA data user secara cascade | [ ] | Test via API |

---

### B.8 Checklist Privasi Data (PDPA Compliance)

| No | Item | Status | Catatan |
|----|------|--------|---------|
| 61 | Ada mekanisme user untuk mengunduh semua datanya (data export) | [ ] | Audit fitur akun |
| 62 | Ada mekanisme user untuk menghapus semua datanya | [ ] | Audit fitur akun |
| 63 | Partner tidak menerima data personal pengguna dalam bentuk apapun | [ ] | Audit partner dashboard dan payout report |
| 64 | Data refleksi tidak dikirim ke pihak ketiga (termasuk AI provider) tanpa mekanisme zero-retention | [ ] | Audit AI API calls |
| 65 | Kebijakan privasi menjelaskan dengan akurat apa yang disimpan dan apa yang tidak | [ ] | Legal review |

---

## BAGIAN C: NOTES PENTING UNTUK TIM DEVELOPMENT

### C.1 Tentang Service Role

Di Supabase, koneksi menggunakan `service_role` key akan melewati seluruh RLS secara otomatis. Ini adalah desain yang benar untuk server-side operations. Pastikan:

- `service_role` key HANYA digunakan di server-side (API routes, background jobs, triggers)
- Tidak pernah ada `service_role` key di frontend code, environment variables frontend, atau bundle yang dikirim ke browser

### C.2 Tentang Refleksi Harian dan Enkripsi

RLS policy mencegah akses admin ke `refleksi_harian` via query aplikasi. Namun perlu dipahami bahwa database admin yang memiliki akses langsung ke PostgreSQL tetap bisa membaca data ini. Untuk melindungi data ini secara end-to-end, aplikasi HARUS mengenkripsi `content_text` sebelum menyimpannya, dan mendekripsi ketika menampilkannya. Kunci enkripsi harus dikelola di sisi user device atau key management service yang terpisah.

### C.3 Tentang Audit Log Immutability

Tabel `admin_audit_logs` tidak memiliki policy UPDATE atau DELETE. Ini berarti siapapun yang mengakses database via authenticated role tidak bisa memodifikasi atau menghapus log. Namun database superuser (postgres) tetap bisa melakukannya. Untuk audit trail yang benar-benar immutable di production, pertimbangkan untuk mengirimkan log ke external system (seperti AWS CloudTrail, Datadog, atau Loki) secara real-time via database webhooks.

### C.4 Tentang Partner Code di URL

Partner code yang dikirim via URL parameter (`?ref=CODE123`) harus divalidasi di server sebelum disimpan ke `raw_user_meta_data` saat registrasi. Pastikan:

- Kode divalidasi keberadaannya di `partner_codes` sebelum disimpan
- Kode yang tidak valid diabaikan dengan tenang, bukan menyebabkan error registrasi
- SQL injection tidak mungkin terjadi karena kode divalidasi via prepared statement

### C.5 Tentang Performa RLS

Setiap query yang melewati RLS akan menambahkan overhead karena policy perlu dievaluasi. Helper functions seperti `has_active_access()` melakukan query ke tabel lain. Untuk meminimalkan overhead:

- Fungsi helper sudah ditandai `STABLE` agar PostgreSQL bisa meng-cache hasilnya dalam satu transaksi
- Indeks sudah dibuat pada semua kolom yang digunakan dalam policy filters
- Jika ada query yang sangat sering dijalankan dan menunjukkan slow query, pertimbangkan materialized view untuk status akses user

### C.6 Perubahan Policy di Production

Setiap perubahan RLS policy di production harus melalui prosedur:

1. Tulis migration file baru (jangan edit file existing)
2. Test di staging environment dengan seluruh test cases di Bagian A
3. Review oleh minimal dua orang (satu developer, satu non-developer yang paham security model)
4. Deploy di luar jam sibuk
5. Monitor query logs selama 30 menit setelah deployment

---

*Dokumen ini adalah living document. Setiap kali ada penambahan tabel, fitur, atau role baru, test cases dan checklist di sini harus diperbarui sebelum fitur tersebut masuk ke production.*

*Security bukan feature. Ia adalah fondasi. Tidak ada fitur yang lebih penting dari kepercayaan pengguna bahwa data mereka aman.*
