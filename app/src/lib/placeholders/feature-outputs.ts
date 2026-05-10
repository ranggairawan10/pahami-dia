// ============================================================
// PAHAMI DIA: Feature Placeholder Outputs
// Digunakan selama AI belum diintegrasikan.
// Setiap output bersifat plausible dan manusiawi.
// Mengganti file ini dengan AI response tidak perlu mengubah komponen UI.
// ============================================================

export interface PahamiOutput {
  emotion_analysis: string
  underlying_need: string
  response_options: Array<{ tone: string; text: string }>
  response_to_avoid?: string
}

export interface JawabOutput {
  feeling_reflection: string
  suggested_sentences: Array<{ version: string; text: string }>
  timing_note: string
}

export interface SendirianOutput {
  validation: string
  reflection_question: string
  offer_next_step: boolean
}

export interface BuntuOutput {
  acknowledgment: string
  perspective_shift: string
  one_small_step: string
}

export interface PerbaikiOutput {
  situation_reflection: string
  timing_guidance: string
  opener_spoken: string
  opener_text: string
}

export interface BebanOutput {
  burden_summary: string
  conversation_starter: string
  husband_guide: string | null
}

// ============================================================
// PLACEHOLDER RESPONSES
// Produksi nyata: fungsi-fungsi ini akan memanggil AI API.
// Saat ini mengembalikan contoh output yang realistis.
// ============================================================

export function getPlaceholderPahamiOutput(inputText: string): PahamiOutput {
  return {
    emotion_analysis:
      'Di balik kalimat itu mungkin ada rasa lelah yang sudah lama menumpuk, ' +
      'bukan serangan yang ditujukan secara pribadi. ' +
      'Ketika seseorang berkata seperti ini, biasanya ada kebutuhan yang belum tersampaikan dengan kata yang lebih tepat.',
    underlying_need:
      'Mungkin yang sedang dibutuhkan adalah rasa ditemani, bukan bantuan teknis. ' +
      'Kehadiran yang sungguh-sungguh hadir, bukan sekadar ada secara fisik.',
    response_options: [
      {
        tone: 'lembut',
        text: 'Aku mendengarmu. Ceritakan lebih, aku mau benar-benar memahami apa yang kamu rasakan.',
      },
      {
        tone: 'lugas',
        text: 'Aku mau mengerti. Apa yang paling berat untukmu sekarang?',
      },
      {
        tone: 'mengajak',
        text: 'Boleh kita bicara? Aku ingin tahu lebih banyak tentang apa yang kamu alami hari ini.',
      },
    ],
    response_to_avoid:
      'Hindari langsung membela diri atau menjelaskan sudut pandangmu. ' +
      'Dalam momen ini, yang dibutuhkan adalah didengar, bukan diberi penjelasan.',
  }
}

export function getPlaceholderJawabOutput(inputText: string, emotionLevel?: string): JawabOutput {
  const isHighEmotion = emotionLevel === 'sangat_emosional' || emotionLevel === 'masih_kesal'

  return {
    feeling_reflection:
      'Sepertinya ada sesuatu yang penting yang ingin kamu sampaikan, ' +
      'dan kamu ingin kata-kata yang keluar bisa benar-benar mewakili apa yang kamu rasakan.',
    suggested_sentences: [
      {
        version: 'pertama',
        text: 'Ada sesuatu yang ingin aku ceritakan. Bisa kita bicara sebentar?',
      },
      {
        version: 'kedua',
        text: 'Aku mau jujur tentang sesuatu, dan aku harap kita bisa melewatinya bersama.',
      },
    ],
    timing_note: isHighEmotion
      ? 'Kondisimu sekarang masih terasa intens. Mungkin lebih baik tunggu beberapa jam dulu, atau lakukan sesuatu yang menenangkan sebelum memulai percakapan ini.'
      : 'Waktu yang paling baik biasanya saat keduanya sudah tidak terburu-buru dan tidak dalam kondisi lelah. Setelah makan malam atau sebelum tidur bisa menjadi pilihan yang lebih kondusif.',
  }
}

export function getPlaceholderSendirianOutput(): SendirianOutput {
  return {
    validation:
      'Rasa itu nyata. Mengerjakan banyak hal sambil merasa tidak benar-benar ditemani adalah beban yang berat, ' +
      'bahkan ketika tidak ada yang melihatnya. Kamu tidak salah merasakan ini.',
    reflection_question:
      'Kalau kamu bisa meminta satu hal yang paling kamu butuhkan dari pasanganmu malam ini, hal apa itu?',
    offer_next_step: true,
  }
}

export function getPlaceholderBuntuOutput(): BuntuOutput {
  return {
    acknowledgment:
      'Kamu sudah berusaha. Itu bukan hal kecil, bahkan jika hasilnya belum seperti yang kamu harapkan.',
    perspective_shift:
      'Mungkin istrimu bukan sedang menyalahkan usahamu, tapi sedang mencari cara untuk merasa dilihat. ' +
      'Kadang yang dibutuhkan bukan solusi, tapi rasa bahwa beratnya diakui.',
    one_small_step:
      'Malam ini, coba tanyakan satu pertanyaan sederhana: "Hari ini kamu lelah di bagian mana?" ' +
      'Lalu dengarkan sampai selesai tanpa memberikan saran dulu.',
  }
}

export function getPlaceholderPerbaikiOutput(currentCondition?: string): PerbaikiOutput {
  const isHighTension = currentCondition === 'pasangan_sedang_marah' || currentCondition === 'masih_tegang'

  return {
    situation_reflection:
      'Yang sudah terjadi tidak bisa diubah, tapi langkah selanjutnya bisa dipilih dengan lebih hati-hati. ' +
      'Kamu ada di sini berarti kamu ingin memperbaiki, dan itu sudah berarti banyak.',
    timing_guidance: isHighTension
      ? 'Berikan sedikit ruang dulu. Pendekatan di saat emosi masih tinggi biasanya memperburuk keadaan. Tunggu setidaknya 1-2 jam sebelum memulai.'
      : 'Kondisinya sudah cukup kondusif untuk memulai. Pilih momen saat tidak ada gangguan dari luar.',
    opener_spoken: 'Aku tahu tadi tidak berjalan dengan baik. Boleh kita bicara?',
    opener_text:
      'Hai. Aku mau bilang maaf tentang yang tadi. Aku ingin kita bisa bicara kalau kamu sudah siap.',
  }
}

export function getPlaceholderBebanOutput(
  selectedBurdens: string[],
  userRole: string
): BebanOutput {
  const burdenCount = selectedBurdens.length

  return {
    burden_summary:
      `Ada ${burdenCount} area beban yang kamu identifikasi. ` +
      'Banyak dari hal-hal ini tidak pernah terlihat atau terhitung, ' +
      'tapi nyata dan berat untuk ditanggung setiap hari. ' +
      'Mengakuinya adalah langkah pertama yang penting.',
    conversation_starter:
      'Kamu bisa memulai dengan: "Ada hal-hal yang aku kerjakan yang mungkin tidak kamu lihat. ' +
      'Boleh aku ceritakan, bukan untuk mengeluh, tapi agar kita bisa saling mengerti lebih baik?"',
    husband_guide:
      userRole === 'suami'
        ? 'Satu hal yang bisa kamu mulai hari ini: tanyakan satu pertanyaan spesifik, bukan "ada yang bisa aku bantu?" ' +
          'tapi "siapa yang jemput anak besok?" atau "belanjaan minggu ini siapa yang handle?" ' +
          'Inisiatif spesifik lebih terasa nyata daripada tawaran umum.'
        : null,
  }
}
