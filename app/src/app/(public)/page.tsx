import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pahami Dia | Sebelum menjawab, pahami dulu.',
  description: 'Aplikasi refleksi dan komunikasi untuk pasangan muslim. Bantu kamu memahami rasa di balik kata, dan menemukan cara merespons yang lebih tenang.',
}

// ============================================================
// Landing Page
// Route: /
// ============================================================

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <ProblemSection />
      <ForHusbandSection />
      <ForWifeSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <CommunitySection />
      <DisclaimerSection />
      <FaqSection />
    </div>
  )
}

// ============================================================
// HERO
// ============================================================
function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-cream-gradient pt-12 pb-16 sm:pt-16 sm:pb-20">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full -translate-y-1/3 translate-x-1/3 opacity-60" aria-hidden />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold-50 rounded-full translate-y-1/3 -translate-x-1/3 opacity-60" aria-hidden />

      <div className="page-container-wide relative">
        <div className="max-w-xl mx-auto text-center">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse-soft" />
            <span className="text-xs font-semibold text-teal-700">Untuk pasangan muslim Indonesia</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-ink-700 leading-tight tracking-tight text-balance mb-4">
            Sebelum menjawab,<br />
            <span className="text-teal-700">pahami dulu.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-lg text-ink-500 leading-relaxed mb-8 max-w-md mx-auto">
            Untuk pasangan yang ingin saling mendengar dengan lebih baik.
            Bukan karena kurang cinta, tapi karena sering tidak tahu harus berkata apa.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/daftar"
              className="w-full sm:w-auto inline-flex items-center justify-center h-13 px-7 rounded-2xl bg-teal-700 text-white text-base font-semibold hover:bg-teal-800 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Mulai 10 Hari Gratis
            </Link>
            <Link
              href="#cara-kerja"
              className="w-full sm:w-auto inline-flex items-center justify-center h-13 px-7 rounded-2xl bg-white text-ink-600 text-base font-medium hover:bg-cream-100 transition-colors border border-cream-200"
            >
              Lihat Cara Kerjanya
            </Link>
          </div>

          {/* Social proof */}
          <p className="mt-5 text-xs text-ink-400">
            Tidak perlu kartu kredit. Batalkan kapan saja.
          </p>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// PROBLEM
// ============================================================
function ProblemSection() {
  return (
    <section className="bg-ink-800 py-14 sm:py-18">
      <div className="page-container-wide">
        <p className="text-center text-lg sm:text-xl font-medium text-white/80 leading-relaxed max-w-xl mx-auto mb-10">
          Banyak konflik dalam rumah tangga bukan soal kurang cinta. Tapi soal kata yang salah keluar di waktu yang salah,
          dan rasa yang tidak pernah berhasil tersampaikan.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {/* Suami */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-gold-300 text-sm font-semibold mb-2">Dari suami</p>
            <p className="text-white/70 text-sm leading-relaxed italic">
              "Aku sudah kerja keras. Tapi tetap salah terus."
            </p>
            <p className="text-white/40 text-xs mt-2">
              Suami yang ingin memahami, tapi tidak tahu caranya.
            </p>
          </div>

          {/* Istri */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-teal-300 text-sm font-semibold mb-2">Dari istri</p>
            <p className="text-white/70 text-sm leading-relaxed italic">
              "Aku lelah, tapi tidak tahu bagaimana menjelaskannya."
            </p>
            <p className="text-white/40 text-xs mt-2">
              Istri yang ingin didengar, tapi sudah hampir berhenti mencoba.
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-white/50 mt-8 max-w-md mx-auto leading-relaxed">
          Masalahnya bukan pada niatmu. Tapi pada jembatan antara rasa dan kata itu, yang sering tidak ada.
        </p>
      </div>
    </section>
  )
}

// ============================================================
// UNTUK SUAMI
// ============================================================
function ForHusbandSection() {
  const points = [
    {
      title: 'Pahami apa yang istrimu maksud',
      desc: 'Di balik kata yang terdengar menyerang, sering kali ada rasa sakit yang tidak menemukan kata yang tepat.',
    },
    {
      title: 'Temukan cara merespons yang tepat',
      desc: 'Diam bukan selalu aman. Tapi salah bicara juga tidak harus jadi kebiasaan.',
    },
    {
      title: 'Ambil satu langkah kecil hari ini',
      desc: 'Kamu tidak perlu langsung berubah total. Cukup satu langkah lebih dekat dari kemarin.',
    },
  ]

  return (
    <section className="py-14 sm:py-18 bg-cream-100">
      <div className="page-container-wide">
        <div className="max-w-lg mx-auto">
          {/* Label */}
          <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-full px-3 py-1 mb-4">
            <span className="text-xs font-semibold text-teal-600">Untuk Suami</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-ink-700 mb-3 text-balance">
            Kamu tidak perlu tahu segalanya. Tapi kamu perlu tahu cara mulai.
          </h2>

          <p className="text-sm text-ink-400 leading-relaxed mb-8">
            Pahami Dia membantumu melihat apa yang sebenarnya ada di balik kata istrimu, dan menemukan cara merespons tanpa menyakiti.
          </p>

          <div className="space-y-4">
            {points.map((p, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 rounded-xl bg-teal-700 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-700">{p.title}</p>
                  <p className="text-sm text-ink-400 mt-0.5 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/daftar"
            className="mt-8 inline-flex items-center justify-center h-11 px-6 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 transition-colors shadow-sm"
          >
            Mulai dari Sini
          </Link>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// UNTUK ISTRI
// ============================================================
function ForWifeSection() {
  const points = [
    {
      title: 'Tata apa yang ingin kamu sampaikan',
      desc: 'Bukan karena kamu harus selalu sempurna dalam bicara. Tapi karena kamu layak didengar, bukan disalahpahami.',
    },
    {
      title: 'Sampaikan kebutuhan yang sesungguhnya',
      desc: 'Ada bedanya antara "kamu tidak pernah peduli" dan "aku butuh kamu ada di sini sekarang."',
    },
    {
      title: 'Akui beratmu sebelum bicara ke siapapun',
      desc: 'Kadang validasi paling awal itu dimulai dari mengenali apa yang sedang kamu pikul.',
    },
  ]

  return (
    <section className="py-14 sm:py-18 bg-white">
      <div className="page-container-wide">
        <div className="max-w-lg mx-auto">
          {/* Label */}
          <div className="inline-flex items-center gap-2 bg-gold-50 border border-gold-100 rounded-full px-3 py-1 mb-4">
            <span className="text-xs font-semibold text-gold-600">Untuk Istri</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-ink-700 mb-3 text-balance">
            Rasamu itu nyata. Dan kamu berhak menyampaikannya.
          </h2>

          <p className="text-sm text-ink-400 leading-relaxed mb-8">
            Pahami Dia memberimu ruang untuk menata rasa sebelum bicara, sehingga kamu bisa menyampaikan apa yang benar-benar kamu butuhkan.
          </p>

          <div className="space-y-4">
            {points.map((p, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-8 h-8 rounded-xl bg-gold-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-700">{p.title}</p>
                  <p className="text-sm text-ink-400 mt-0.5 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/daftar"
            className="mt-8 inline-flex items-center justify-center h-11 px-6 rounded-xl bg-gold-500 text-white text-sm font-semibold hover:bg-gold-600 transition-colors shadow-sm"
          >
            Coba Sekarang
          </Link>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// CARA KERJA
// ============================================================
function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Ceritakan Situasinya',
      desc: 'Ketik kalimat yang baru diucapkan pasanganmu, atau situasi yang sedang membuat kamu bingung. Tidak perlu panjang.',
    },
    {
      number: '02',
      title: 'Pahami Rasa di Baliknya',
      desc: 'Pahami Dia membantu kamu melihat apa yang mungkin sebenarnya sedang dirasakan dan dibutuhkan pasanganmu.',
    },
    {
      number: '03',
      title: 'Pilih Cara Merespons',
      desc: 'Tidak ada satu jawaban benar. Tapi ada cara yang lebih tenang, lebih jujur, dan lebih bertanggung jawab.',
    },
  ]

  return (
    <section id="cara-kerja" className="py-14 sm:py-18 bg-cream-100 scroll-mt-16">
      <div className="page-container-wide">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink-700 mb-3">Cara Kerjanya Sederhana</h2>
          <p className="text-sm text-ink-400 max-w-sm mx-auto leading-relaxed">
            Ini bukan tentang siapa yang menang. Ini tentang siapa yang pertama kali mau mengerti.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-5 max-w-2xl mx-auto">
          {steps.map((step, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-cream-200 shadow-card relative">
              <span className="text-5xl font-extrabold text-cream-300 leading-none absolute top-4 right-4">
                {step.number}
              </span>
              <div className="relative">
                <p className="text-sm font-bold text-ink-700 mb-2">{step.title}</p>
                <p className="text-sm text-ink-400 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================
// FITUR
// ============================================================
function FeaturesSection() {
  const features = [
    {
      icon: '🔍',
      title: 'Pahami Kalimatnya',
      desc: 'Terjemahkan kalimat pasangan menjadi rasa yang bisa kamu pahami dan respons yang lebih baik.',
    },
    {
      icon: '💬',
      title: 'Jawab dengan Tenang',
      desc: 'Susun apa yang ingin kamu sampaikan sebelum kata yang salah terlanjur keluar.',
    },
    {
      icon: '🤍',
      title: 'Aku Merasa Sendirian',
      desc: 'Ruang untuk mengakui rasa tidak ditemani, dan menemukan cara menyampaikannya.',
    },
    {
      icon: '🧭',
      title: 'Aku Merasa Buntu',
      desc: 'Untuk suami yang sudah berusaha tapi masih tidak tahu harus berbuat apa.',
    },
    {
      icon: '🌿',
      title: 'Perbaiki Setelah Salah Bicara',
      desc: 'Panduan konkret untuk mengambil langkah pertama setelah konflik terjadi.',
    },
    {
      icon: '📖',
      title: 'Ayat Pengingat',
      desc: 'Refleksi harian dari Al-Quran dan Hadis yang relevan dengan kehidupan pasangan.',
    },
  ]

  return (
    <section id="fitur" className="py-14 sm:py-18 bg-white scroll-mt-16">
      <div className="page-container-wide">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink-700 mb-3">Apa yang Bisa Kamu Lakukan</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {features.map((f, i) => (
            <div key={i} className="bg-cream-50 rounded-2xl p-5 border border-cream-200 hover:border-teal-100 hover:bg-teal-50/30 transition-colors">
              <div className="text-2xl mb-3">{f.icon}</div>
              <p className="text-sm font-semibold text-ink-700 mb-1.5">{f.title}</p>
              <p className="text-xs text-ink-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================
// PRICING
// ============================================================
function PricingSection() {
  const included = [
    'Pahami Kalimatnya tanpa batas',
    'Jawab dengan Tenang tanpa batas',
    'Aku Merasa Sendirian dan Buntu',
    'Perbaiki Setelah Salah Bicara',
    'Beban Tak Terlihat',
    'Ayat Pengingat harian',
    'Refleksi Harian pribadi',
    'Riwayat tersimpan tanpa batas',
  ]

  return (
    <section id="harga" className="py-14 sm:py-18 bg-cream-100 scroll-mt-16">
      <div className="page-container-wide">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink-700 mb-3">Satu Harga. Tanpa Kerumitan.</h2>
          <p className="text-sm text-ink-400 max-w-sm mx-auto">
            Kami tidak percaya bahwa alat untuk memperbaiki komunikasi perlu mahal atau rumit.
          </p>
        </div>

        <div className="max-w-sm mx-auto">
          <div className="bg-white rounded-3xl border border-cream-200 shadow-lg overflow-hidden">
            {/* Trial badge */}
            <div className="bg-teal-700 text-white text-center py-3 px-4">
              <p className="text-sm font-semibold">10 Hari Pertama Gratis</p>
              <p className="text-xs text-white/70 mt-0.5">Tidak perlu kartu kredit</p>
            </div>

            <div className="p-6">
              {/* Price */}
              <div className="text-center mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-extrabold text-ink-700">Rp10.000</span>
                  <span className="text-sm text-ink-400">/ bulan</span>
                </div>
                <p className="text-xs text-ink-400 mt-1">Kurang dari harga dua gelas kopi.</p>
              </div>

              {/* Features */}
              <ul className="space-y-2.5 mb-6">
                {included.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-teal-700" fill="none" stroke="currentColor" strokeWidth={3}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <span className="text-sm text-ink-600">{item}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/daftar"
                className="flex items-center justify-center w-full h-12 rounded-xl bg-teal-700 text-white text-sm font-semibold hover:bg-teal-800 transition-colors shadow-sm"
              >
                Mulai Trial Gratis
              </Link>

              <p className="text-xs text-center text-ink-400 mt-3">
                Batalkan kapan saja. Tidak ada pertanyaan.
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-ink-400 mt-4 leading-relaxed">
            Data refleksimu tidak pernah dijual. Tidak pernah digunakan untuk iklan.
          </p>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// PARTNER KOMUNITAS
// ============================================================
function CommunitySection() {
  return (
    <section className="py-14 sm:py-18 bg-white">
      <div className="page-container-wide text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-ink-700 mb-3">
          Dipercaya oleh Komunitas Keluarga Muslim
        </h2>
        <p className="text-sm text-ink-400 max-w-md mx-auto leading-relaxed mb-8">
          Pahami Dia tidak disebarkan melalui iklan. Ia hadir karena komunitas-komunitas yang
          peduli pada keluarga muslim memilih untuk merekomendasikannya.
        </p>

        {/* Partner logos placeholder */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-10 opacity-40">
          {['Cinta Quran', 'Titik Balik', 'Meaningfulways', 'Komunitas Sakinah'].map((name) => (
            <div key={name} className="bg-cream-200 rounded-lg px-5 py-2.5">
              <span className="text-sm font-semibold text-ink-500">{name}</span>
            </div>
          ))}
        </div>

        <div className="bg-cream-100 rounded-2xl border border-cream-200 p-6 max-w-md mx-auto">
          <p className="text-sm font-semibold text-ink-700 mb-1.5">Kamu mengelola komunitas keluarga muslim?</p>
          <p className="text-xs text-ink-400 mb-4 leading-relaxed">
            Bergabung sebagai partner dan bantu audiensmu dengan sesuatu yang benar-benar bermanfaat.
          </p>
          <Link
            href="/komunitas-partner"
            className="inline-flex items-center justify-center h-10 px-5 rounded-xl border-2 border-teal-600 text-teal-700 text-sm font-semibold hover:bg-teal-50 transition-colors"
          >
            Daftar sebagai Partner
          </Link>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// DISCLAIMER
// ============================================================
function DisclaimerSection() {
  return (
    <section className="py-10 bg-cream-200/60">
      <div className="page-container-wide">
        <div className="max-w-md mx-auto text-center">
          <p className="text-xs font-semibold text-ink-400 uppercase tracking-wider mb-2">Yang Perlu Kamu Tahu</p>
          <p className="text-sm text-ink-500 leading-relaxed">
            Pahami Dia adalah teman refleksi, bukan konselor, bukan ustaz, dan bukan pengganti psikolog.
            Ia tidak memberikan fatwa, tidak menentukan siapa yang benar atau salah, dan tidak bisa
            menggantikan percakapan nyata antara kamu dan pasanganmu.
          </p>
          <p className="text-sm text-ink-400 mt-3 leading-relaxed">
            Jika kamu atau pasanganmu sedang dalam situasi yang memerlukan bantuan profesional, kami sangat menganjurkan untuk segera mencarinya.
          </p>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// FAQ
// ============================================================
function FaqSection() {
  const faqs = [
    {
      q: 'Apakah Pahami Dia bisa digunakan berdua dengan pasangan?',
      a: 'Untuk sekarang, setiap akun bersifat individual dan privat. Fitur berbagi antara pasangan sedang dalam rencana pengembangan berikutnya.',
    },
    {
      q: 'Apakah refleksi yang saya tulis bisa dilihat orang lain?',
      a: 'Tidak. Semua refleksi dan jurnal yang kamu tulis bersifat privat dan terenkripsi. Tidak ada yang bisa membacanya selain kamu. Tidak kami, tidak pasanganmu, tidak siapapun.',
    },
    {
      q: 'Apakah Pahami Dia sesuai dengan nilai Islam?',
      a: 'Pahami Dia dirancang untuk membantu pasangan muslim berkomunikasi dengan lebih baik, dengan nilai sabar, empati, dan tanggung jawab sebagai landasannya. Konten Ayat Pengingat diverifikasi dari sumber yang sahih.',
    },
    {
      q: 'Bagaimana cara membatalkan langganan?',
      a: 'Kapan saja, dari halaman Subscription di dalam aplikasi, dalam maksimal tiga langkah. Tidak ada proses yang dipersulit.',
    },
    {
      q: 'Saya sedang dalam kondisi yang sangat berat. Apakah Pahami Dia bisa membantu?',
      a: 'Pahami Dia bisa menemanimu. Tapi jika kondisimu memerlukan lebih dari refleksi, kami akan mengarahkanmu ke sumber bantuan yang lebih tepat. Kamu tidak harus menghadapinya sendiri.',
    },
  ]

  return (
    <section id="faq" className="py-14 sm:py-18 bg-white scroll-mt-16">
      <div className="page-container-wide">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-ink-700">Pertanyaan yang Sering Ditanyakan</h2>
        </div>

        <div className="max-w-xl mx-auto space-y-3">
          {faqs.map((faq, i) => (
            <FaqItem key={i} question={faq.q} answer={faq.a} />
          ))}
        </div>
      </div>
    </section>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group bg-cream-50 border border-cream-200 rounded-2xl overflow-hidden">
      <summary className="flex items-center justify-between gap-3 p-5 cursor-pointer list-none">
        <span className="text-sm font-semibold text-ink-700">{question}</span>
        <div className="w-5 h-5 flex-shrink-0 text-teal-600 transition-transform group-open:rotate-45">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      </summary>
      <div className="px-5 pb-5">
        <p className="text-sm text-ink-500 leading-relaxed">{answer}</p>
      </div>
    </details>
  )
}
