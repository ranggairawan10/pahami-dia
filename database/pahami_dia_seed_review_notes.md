# PAHAMI DIA: Catatan Review Seed Data
**Untuk: Tim Admin, Tim Konten, dan Advisor Islamic Review**
**Version 1.0 | Mei 2026 | Confidential**

---

## BAGIAN A: UNTUK TIM ADMIN

### A.1 Urutan Aktivasi Setelah Seed Berhasil

Seed data didesain agar tidak ada yang langsung aktif ke pengguna. Semua fitur sensitif dimulai dalam keadaan `is_active = false` atau `status = 'draft'`. Ini disengaja agar tidak ada konten yang belum diverifikasi terekspos ke pengguna nyata.

Urutan aktivasi yang direkomendasikan:

**Tahap 1 (Sebelum soft launch):**
Konfirmasi bahwa feature flag `safety_ai_scan_enabled` sudah bernilai `true`. Ini adalah satu-satunya flag yang aktif dari seed dan tidak boleh dinonaktifkan di production.

**Tahap 2 (Setelah Islamic review selesai):**
Aktifkan `quran_reflection_enabled` setelah semua 10 ayat di tabel `ayat_pengingat` sudah diisi dan diubah statusnya dari `draft` ke `active` oleh admin.

**Tahap 3 (Setelah prompt template review selesai):**
Aktifkan `ai_generation_enabled` setelah semua 8 prompt template (kecuali `safety_fallback` yang statis) sudah diuji dan disetujui.

**Tahap 4 (Setelah payment gateway terkonfigurasi):**
Aktifkan `payments_enabled` dan lakukan transaksi test end-to-end sebelum membuka ke pengguna.

**Tahap 5 (Setelah partner onboarding pertama selesai):**
Aktifkan `partner_dashboard_enabled`.

---

### A.2 Setting yang Perlu Diperbarui Sebelum Launch

Berikut daftar app_settings yang menggunakan nilai placeholder dan perlu diperbarui:

| Key | Nilai Seed | Yang Perlu Dilakukan |
|-----|-----------|---------------------|
| `support_email` | halo@pahamidiaapp.com | Ganti dengan email support aktual |
| `default_ai_model` | claude-sonnet-4-20250514 | Verifikasi model ini masih tersedia dan sesuai API key |
| `ios_app_version` | 0.1.0 | Update saat versi pertama selesai build |
| `android_app_version` | 0.1.0 | Update saat versi pertama selesai build |
| `partner_payout_day` | 10 | Sesuaikan dengan siklus keuangan internal |
| `partner_default_revenue_share_pct` | 25.00 | Konfirmasi dengan founder sebelum onboarding partner pertama |

---

### A.3 Feature Flags: Kapan Mengaktifkan

| Flag | Default | Kondisi Aman untuk Aktifkan |
|------|---------|---------------------------|
| `safety_ai_scan_enabled` | TRUE | Selalu aktif di production |
| `ai_generation_enabled` | false | Setelah semua prompt template diuji |
| `quran_reflection_enabled` | false | Setelah Islamic review selesai |
| `payments_enabled` | false | Setelah payment gateway live test berhasil |
| `partner_dashboard_enabled` | false | Setelah partner pertama onboarding |
| `push_notifications_enabled` | false | Setelah infrastruktur notifikasi ready |
| `daily_reflection_guide_enabled` | false | Bisa setelah ai_generation_enabled aktif |
| `analytics_enabled` | false | Setelah analytics provider terkonfigurasi |
| `maintenance_mode` | false | Jangan aktifkan kecuali benar-benar perlu |
| `shared_space_enabled` | false | Belum masuk MVP. Jangan aktifkan dulu |
| `onboarding_v2_enabled` | false | Hanya aktifkan saat A/B test dijalankan |

---

### A.4 Subscription Plan

Plan `Teman Tumbuh Bulanan` sudah dalam status `is_active = true`. Artinya halaman pricing sudah bisa menampilkan plan ini segera setelah seed dijalankan.

Yang perlu diperhatikan: harga `10000` (Rupiah) di tabel `subscription_plans` adalah data referensi untuk tampilan UI. Harga aktual yang ditagihkan dikonfigurasi langsung di payment gateway (Midtrans, Xendit, atau provider lain yang dipilih). Pastikan keduanya konsisten.

---

### A.5 Cara Mengaktifkan Ayat Pengingat Satu Per Satu

Setelah tim Islamic review mengisi `arabic_text` dan `translation` serta menyetujui `contextualization`, admin mengaktifkan ayat tersebut dengan query berikut di Supabase SQL Editor:

```sql
-- Contoh: mengaktifkan Ar-Ra'd 13:28 setelah review selesai
UPDATE ayat_pengingat
SET
    arabic_text       = '[teks Arab yang sudah diverifikasi]',
    translation       = '[terjemahan yang sudah dipilih]',
    contextualization = '[kontekstualisasi yang sudah disetujui]',
    status            = 'active',
    verified_by       = '[UUID admin yang melakukan verifikasi]'
WHERE
    id = 'a0000001-0000-0000-0000-000000000001';
```

Jalankan ini satu per satu, bukan sekaligus, agar setiap ayat bisa dikonfirmasi terpisah.

---

### A.6 Cara Mengaktifkan Prompt Template Satu Per Satu

```sql
-- Aktifkan template setelah review dan testing selesai
UPDATE prompt_templates
SET is_active = true
WHERE name = 'understand_sentence_v1';
```

Lakukan testing fungsional setiap template sebelum mengaktifkannya di production. Panduan testing ada di file `pahami_dia_rls_testing_guide.md`.

---

## BAGIAN B: UNTUK TIM KONTEN

### B.1 Kondisi Emosional: Yang Sudah Ada dan Kemungkinan Penambahan

20 kondisi emosional yang diseed sudah mencakup rentang yang cukup luas. Namun ada beberapa kondisi yang mungkin perlu ditambahkan berdasarkan feedback pengguna awal:

Kemungkinan kondisi tambahan untuk roadmap:
- Merasa tidak cukup baik sebagai pasangan
- Keluarga besar ikut campur
- Masalah keuangan rumah tangga
- Berbeda pendapat tentang cara mendidik anak
- Kurang waktu bersama karena kesibukan

Penambahan kondisi baru harus melalui proses:
1. Diskusi dengan tim konten dan product
2. Penentuan `applicable_features` yang relevan
3. Pemetaan ke ayat atau hadis yang sesuai (jika ada)
4. Testing di staging sebelum masuk production

---

### B.2 Kontekstualisasi Ayat: Apa yang Perlu Diperhatikan

Setiap ayat memiliki field `contextualization` yang sudah diisi sebagai draft awal di seed. Ini bukan untuk ditampilkan ke pengguna tanpa review. Yang perlu dicek oleh tim konten:

Pertama, apakah kontekstualisasi terasa alami dalam Bahasa Indonesia yang digunakan target pengguna (25 sampai 40 tahun, muslim Indonesia)?

Kedua, apakah kontekstualisasi menghindari framing yang bisa menyalahkan satu pihak dalam hubungan?

Ketiga, apakah kalimatnya tidak terdengar seperti ceramah atau khotbah?

Keempat, apakah panjang kontekstualisasi sesuai (idealnya 2 sampai 3 kalimat, maksimal 50 kata)?

---

### B.3 Prompt Templates: Panduan Review Konten

Prompt templates ditulis oleh tim product dan engineering, tapi tim konten perlu memvalidasi hal berikut sebelum template diaktifkan:

Untuk setiap template, pastikan:

Pertama, instruksi kepada AI menggunakan bahasa yang jelas dan tidak ambigu. Ambiguitas dalam instruksi berisiko menghasilkan output yang tidak konsisten.

Kedua, tone yang diinstruksikan (hangat, tidak menggurui, tidak menghakimi) tercermin dalam output aktual saat template diuji.

Ketiga, aturan keamanan di setiap template sudah mencakup skenario yang paling mungkin terjadi di konteks target pengguna Indonesia.

Keempat, output format JSON yang diinstruksikan bisa diparsing dengan benar oleh aplikasi. Ini perlu diverifikasi bersama tim engineering.

---

### B.4 Kata Pemicu Safety: Perlu Dikurasi Terpisah

Seed data ini tidak menyertakan daftar kata pemicu safety karena itu bukan data statis. Daftar kata pemicu dikelola di level aplikasi (bukan database) dan perlu dikurasi oleh tim konten bersama advisor.

Panduan untuk tim konten dalam menyusun daftar kata pemicu:

Pertama, fokus pada kata yang spesifik dan kontekstual, bukan kata umum. "Pukul" saja tidak cukup sebagai pemicu. "Dipukul suami" atau "suami memukulku" lebih tepat.

Kedua, pertimbangkan variasi penulisan informal (typo umum, singkatan, bahasa gaul) karena pengguna Indonesia sering menulis secara tidak formal.

Ketiga, pastikan daftar tidak terlalu sensitif sehingga memicu false positive yang tinggi dan mengganggu pengalaman pengguna normal.

Keempat, daftar ini harus diperbarui secara berkala berdasarkan safety events yang muncul di dashboard admin.

---

## BAGIAN C: UNTUK ADVISOR ISLAMIC REVIEW

### C.1 Apa yang Perlu Diverifikasi

Seluruh konten Islamic dalam seed ini ditandai dengan status `draft` dan menggunakan teks placeholder. Tidak ada konten ini yang ditampilkan ke pengguna sampai advisor melakukan verifikasi dan admin mengubah statusnya menjadi `active`.

Yang perlu diverifikasi oleh advisor:

**Untuk setiap ayat (10 ayat):**

1. Kebenaran teks Arab dari mushaf standar (direkomendasikan: mushaf Madinah edisi terbaru)
2. Ketepatan terjemahan Bahasa Indonesia yang dipilih (direkomendasikan: Terjemahan Kemenag RI 2019 atau terjemahan lain yang sudah dikaji)
3. Kebenaran referensi: nama surah, nomor surah, nomor ayat
4. Kelayakan contextualization draft yang sudah disiapkan. Jika perlu diubah, berikan revisi tertulis
5. Konfirmasi bahwa kontekstualisasi tidak menyimpang dari makna ayat dan tidak mengundang kontroversi

**Untuk setiap kondisi-ayat mapping (37 mapping):**

Pastikan setiap ayat yang dipetakan ke kondisi tertentu memang relevan dan tidak terasa dipaksakan. Jika ada mapping yang kurang tepat, berikan rekomendasi mapping yang lebih sesuai.

---

### C.2 Catatan tentang Terjemahan

Beberapa terjemahan yang umum digunakan di Indonesia dan status lisensinya:

**Terjemahan Kemenag RI 2019:** Diterbitkan oleh pemerintah Indonesia. Dapat digunakan untuk keperluan pendidikan dan dakwah. Disarankan untuk mengkonfirmasi langsung ke Kemenag untuk penggunaan komersial dalam aplikasi.

**Terjemahan Quraish Shihab (Al-Mishbah):** Memiliki hak cipta penerbit. Perlu izin tertulis untuk penggunaan komersial.

**Terjemahan sendiri:** Jika advisor memilih menerjemahkan sendiri untuk keperluan aplikasi ini, pastikan terjemahan tersebut sudah disetujui oleh minimal satu advisor lain.

Rekomendasi: Gunakan Terjemahan Kemenag RI 2019 dengan atribusi yang jelas, dan konfirmasi penggunaan secara tertulis ke pihak terkait sebelum launch.

---

### C.3 Kontekstualisasi: Batas yang Harus Dijaga

Kontekstualisasi dalam Pahami Dia bukan tafsir dan bukan fatwa. Ia hanya jembatan emosional antara makna ayat dan kondisi pengguna. Batas yang harus dijaga:

Pertama, kontekstualisasi tidak boleh memberikan pendapat hukum fikih apapun.

Kedua, kontekstualisasi tidak boleh mengklaim satu interpretasi sebagai satu-satunya interpretasi yang benar.

Ketiga, kontekstualisasi tidak boleh digunakan untuk melegitimasi situasi yang berbahaya (misalnya: menggunakan ayat tentang sabar untuk membenarkan istri bertahan dalam situasi kekerasan).

Keempat, jika suatu ayat memiliki konteks turun (asbabun nuzul) yang spesifik dan berbeda dari kontekstualisasi yang ditulis, advisor berhak dan wajib merevisinya.

---

### C.4 Ayat yang Mungkin Perlu Perhatian Khusus

**Az-Zumar 39:53 (ampunan):**
Ayat ini sering dikutip dalam konteks spiritual individual. Dalam konteks hubungan pasangan, pastikan kontekstualisasi tidak terkesan sebagai izin untuk terus menyakiti dengan alasan Allah Maha Pengampun. Kontekstualisasi draft sudah mencoba menghindari ini, tapi perlu review lebih teliti.

**Al-Baqarah 2:286 (ujian tidak melebihi kemampuan):**
Dalam konteks kondisi 'sedang diuji', pastikan kontekstualisasi tidak terkesan meremehkan beratnya yang dirasakan pengguna. Keseimbangan antara penghiburan dan validasi rasa berat sangat penting di sini.

**At-Talaq 65:3 (tawakal):**
Ayat ini berada dalam konteks surah yang membahas talak dan iddah. Gunakan hanya bagian yang berkaitan dengan tawakal dan kecukupan dari Allah, tanpa membawa konteks hukum nikah-cerai ke dalam kontekstualisasi untuk menghindari kerancuan.

**Al-Fatihah 1:6 (petunjuk):**
Menggunakan satu ayat dari Al-Fatihah secara terpisah perlu kehati-hatian agar tidak terkesan mengurangi kesatuan surah tersebut. Pertimbangkan apakah ini bisa diganti dengan ayat lain yang lebih standalone, atau pastikan kontekstualisasinya memperjelas bahwa ini adalah bagian dari doa yang lebih utuh.

---

### C.5 Proses Review yang Direkomendasikan

1. Advisor menerima akses ke staging environment (bukan production)
2. Advisor mengisi form review untuk setiap ayat (template form bisa disiapkan oleh tim admin)
3. Untuk setiap ayat: setujui atau revisi arabic_text, terjemahan, dan kontekstualisasi
4. Advisor menandatangani dokumen persetujuan sebelum konten diaktifkan
5. Tim admin mengimplementasikan persetujuan ke database
6. Advisor diberikan akses view-only ke production untuk memastikan implementasi sesuai

---

### C.6 Pembaruan Konten di Masa Mendatang

Setiap penambahan ayat atau hadis baru di masa mendatang harus melalui proses review yang sama. Tidak ada konten Islamic yang bisa langsung diaktifkan tanpa melalui advisor.

Untuk hadis, selain verifikasi teks dan terjemahan, advisor perlu memastikan:
- Derajat hadis (sahih, hasan, dan sebagainya)
- Nama periwayat dan nama kitab secara lengkap
- Tidak menggunakan hadis yang dhaif atau maudhu

---

*Dokumen ini adalah panduan operasional untuk tiga tim yang berbeda. Simpan di tempat yang bisa diakses oleh ketiga tim, tapi tidak oleh publik.*

*Keberhasilan Pahami Dia sangat bergantung pada kepercayaan pengguna bahwa konten Islamic yang ditampilkan sudah diverifikasi dengan benar. Proses ini mungkin memakan waktu, tapi tidak ada yang lebih mahal dari kehilangan kepercayaan komunitas muslim terhadap sebuah produk.*
