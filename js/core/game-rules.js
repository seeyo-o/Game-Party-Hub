/**
 * ==========================================================================
 * DISCORD PARTY HUB - GAME RULES & HOW TO PLAY MODULE
 * ==========================================================================
 * Menyediakan modal interaktif "Panduan & Cara Bermain" untuk ke-6 game
 * dengan struktur rapi: Persiapan Discord, Win Condition, Step-by-Step,
 * dan Peran / Kartu / Aturan Khusus.
 */

const GameRules = (function () {
  'use strict';

  const RULES_DATA = {
    'tentang-kita': {
      id: 'tentang-kita',
      title: 'Tentang Kita',
      subtitle: 'Kartu Deep Talk, Persepsi & Tantangan Spontan',
      icon: 'heart-handshake',
      players: '2 - 10+ Pemain',
      duration: '15 - 45 Menit',
      difficulty: 'Santai & Seru (Easy)',
      theme: 'tentang-kita',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      iconBg: 'bg-rose-500 text-white',
      accentColor: 'text-rose-600',
      discordPrep: [
        'Kumpul bersama di 1 Voice Channel santai di Discord.',
        'Pastikan mic jernih (disarankan menggunakan Voice Activity atau Push-to-Talk).',
        'Kamera/webcam opsional, tapi sangat disarankan untuk melihat ekspresi teman saat giliran kartu tantangan!',
        'Prinsip "Safe Space": Semua curhat, uneg-uneg, dan jawaban di ruang ini bersifat rahasia tongkrongan.'
      ],
      winCondition: 'Tidak ada sistem eliminasi atau skor kalah-menang. Pemenangnya adalah keakraban, tawa, dan rasa saling mengenal lebih dalam di antara teman-teman satu server!',
      steps: [
        {
          num: '1',
          title: 'Pilih Giliran Pemain & Buka Kartu',
          desc: 'Host atau pemain yang sedang aktif menekan tombol "Ambil Kartu Baru 🃏" di layar.'
        },
        {
          num: '2',
          title: 'Bacakan dengan Lantang di Discord',
          desc: 'Bacakan pertanyaan atau tantangan yang tertera di kartu dengan suara jelas agar semua teman di Voice Channel mendengar.'
        },
        {
          num: '3',
          title: 'Jawab Jujur atau Lakukan Tantangan',
          desc: 'Pemain aktif (atau teman yang ditunjuk pada kartu) menjawab pertanyaan sejujur-jujurnya atau mengeksekusi aksi tantangan spontan.'
        },
        {
          num: '4',
          title: 'Tanggapan & Diskusi Hangat',
          desc: 'Teman-teman lain di Discord boleh menimpali, bertanya lebih dalam, atau tertawa bersama sebelum Host melanjutkan ke kartu berikutnya.'
        }
      ],
      specialRules: [
        {
          name: 'Level 1: Icebreaker & Hangat',
          badge: 'Level 1',
          badgeColor: 'bg-amber-100 text-amber-800',
          desc: 'Pertanyaan santai pencair suasana: fakta unik tentang diri sendiri, kebiasaan lucu, dan kesan pertama kali kenal di server Discord.'
        },
        {
          name: 'Level 2: Deep Talk & Curhat Kejujuran',
          badge: 'Level 2',
          badgeColor: 'bg-rose-100 text-rose-800',
          desc: 'Pertanyaan mendalam tentang mimpi masa depan, prinsip hidup, pengalaman emosional, dan uneg-uneg yang belum pernah terucap.'
        },
        {
          name: 'Level 3: Wildcard & Tantangan Spontan',
          badge: 'Level 3',
          badgeColor: 'bg-purple-100 text-purple-800',
          desc: 'Aksi live interaktif: kirim meme terakhir di galeri, impersonate teman di server, atau ganti status Discord dengan kalimat konyol selama 1 ronde.'
        }
      ]
    },

    'voting': {
      id: 'voting',
      title: 'Siapa di Antara Kita',
      subtitle: 'The Voting Game (Bongkar Rahasia Tongkrongan)',
      icon: 'vote',
      players: '3 - 12+ Pemain',
      duration: '20 - 40 Menit',
      difficulty: 'Mudah & Penuh Tawa (Easy)',
      theme: 'voting',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      iconBg: 'bg-emerald-500 text-white',
      accentColor: 'text-emerald-600',
      discordPrep: [
        'Seluruh pemain berkumpul di Voice Channel Discord.',
        'Host berperan sebagai "Hakim Ketua Sidang" yang memandu jalannya voting dan interogasi.',
        'DILARANG membocorkan nama yang kamu pilih di Voice Chat sebelum fase voting ditutup oleh Host!'
      ],
      winCondition: 'Pemain yang paling sering naik ke Podium Peringkat 1 akan dinobatkan sebagai "Tersangka Utama" server. Siap-siap diinterogasi mengapa semua teman memilihmu!',
      steps: [
        {
          num: '1',
          title: 'Fase Pembacaan Kasus',
          desc: 'Sistem menampilkan 1 pertanyaan unik dan kocak (contoh: "Siapa yang paling mungkin tersesat walau sudah pakai Google Maps?").'
        },
        {
          num: '2',
          title: 'Fase Voting Rahasia (3 Hak Suara Setara)',
          desc: 'Setiap pemain memilih 3 nama teman di room. Setiap pilihan bernilai 1 suara murni (setara tanpa pembobotan). Klik "Kunci Pilihan" jika sudah yakin.'
        },
        {
          num: '3',
          title: 'Buka Podium Hasil & Peringkat',
          desc: 'Setelah semua pemain selesai (atau Host menekan "Buka Hasil"), podium Peringkat 1, 2, dan 3 peraih suara terbanyak akan terbuka serentak.'
        },
        {
          num: '4',
          title: 'Sidang Interogasi Host di Discord',
          desc: 'Host membacakan daftar voter ("Dipilih oleh: [Budi] [Siti]") dan menginterogasi satu per satu di Voice Chat apa alasan mereka memilih orang tersebut!'
        }
      ],
      specialRules: [
        {
          name: 'Aturan 3 Suara Setara',
          badge: 'Aturan Suara',
          badgeColor: 'bg-emerald-100 text-emerald-800',
          desc: 'Setiap pemain wajib memilih 3 nama teman berbeda (atau Math.min(3, total pemain - 1) jika pemain sedikit). Masing-masing bernilai 1 poin suara.'
        },
        {
          name: 'Audit Transparansi (Bongkar Voter)',
          badge: 'Fitur Khusus',
          badgeColor: 'bg-amber-100 text-amber-800',
          desc: 'Kartu hasil menampilkan deretan pill-badge berisi nama siapa saja yang memilih korban tersebut, memicu perdebatan seru dan lucu di Discord.'
        },
        {
          name: 'Kendali Ronde oleh Host',
          badge: 'Host Control',
          badgeColor: 'bg-indigo-100 text-indigo-800',
          desc: 'Tidak ada timer paksa otomatis. Host bebas membiarkan sesi debat berlangsung selama mungkin sebelum menekan tombol "Pertanyaan Berikutnya ➡️".'
        }
      ]
    },

    'guess-who': {
      id: 'guess-who',
      title: 'Guess Who? Battle Royale',
      subtitle: 'Tebak Karakter & Eliminasi Cepat (Last Man Standing)',
      icon: 'user-search',
      players: '2 - 16 Pemain',
      duration: '15 - 30 Menit',
      difficulty: 'Menengah (Taktis)',
      theme: 'guess-who',
      badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
      iconBg: 'bg-sky-500 text-white',
      accentColor: 'text-sky-600',
      discordPrep: [
        'Open mic di Discord Voice Channel.',
        'DILARANG Share Screen! Layar setiap pemain memuat kartu rahasia dan status coretan eliminasi yang berbeda-beda.',
        'Pasang telinga baik-baik saat pemain lain bertanya di Discord untuk mempersempit kemungkinan karakter lawan.'
      ],
      winCondition: 'Jadilah Last Man Standing (pemain terakhir yang bertahan hidup) atau kumpulkan poin tertinggi dengan menebak karakter rahasia lawan sebelum karaktermu ditebak!',
      steps: [
        {
          num: '1',
          title: 'Terima Karakter Rahasiamu',
          desc: 'Cek kartu "Karakter Rahasiamu" di pojok atas layar. Karakter ini harus kamu jaga kerahasiaannya sepanjang ronde.'
        },
        {
          num: '2',
          title: 'Tanya-Jawab YA / TIDAK di Voice Chat',
          desc: 'Bergiliran di Discord, ajukan 1 pertanyaan berformat YA/TIDAK (contoh: "Apakah karaktermu punya rambut kuning?", "Apakah karaktermu tokoh nyata?").'
        },
        {
          num: '3',
          title: 'Eliminasi Mandiri (Coret Kartu)',
          desc: 'Klik kartu-kartu di papanmu untuk mencoretnya (kartu berubah abu-abu pudar dengan tanda silang merah). Coretan tersimpan aman di Tab Target masing-masing lawan!'
        },
        {
          num: '4',
          title: 'Luncurkan Tebakan Karakter Lawan 🎯',
          desc: 'Jika kamu sudah yakin, klik tombol "🎯 Tebak Karakter Lawan", pilih target teman yang masih hidup, lalu pilih nama karakternya.'
        }
      ],
      specialRules: [
        {
          name: '🎯 Tebakan BENAR (+10 Poin & Eliminasi)',
          badge: '+10 Poin',
          badgeColor: 'bg-emerald-100 text-emerald-800',
          desc: 'Penebak mendapat +10 Poin. Target yang ditebak otomatis GUGUR PERMANEN (menjadi Spectator penonton tanpa respawn karakter baru).'
        },
        {
          name: '❌ Tebakan SALAH (-5 Poin Penalti)',
          badge: '-5 Poin',
          badgeColor: 'bg-rose-100 text-rose-800',
          desc: 'Penebak dikurangi -5 Poin. Karakter target tetap rahasia dan target tetap hidup di permainan.'
        },
        {
          name: 'Tab Catatan Target Mandiri',
          badge: 'Fitur Cerdas',
          badgeColor: 'bg-indigo-100 text-indigo-800',
          desc: 'Coretan kartu disimpan terpisah di memori per lawan (Target: Budi berbeda dengan Target: Siti), sehingga deduksimu tidak bercampur aduk.'
        }
      ]
    },

    'werewolf': {
      id: 'werewolf',
      title: 'Werewolf: Dusk of Deception',
      subtitle: 'Deduksi Malam & Siang Tanpa Moderator Manual',
      icon: 'moon',
      players: '5 - 18 Pemain',
      duration: '25 - 50 Menit',
      difficulty: 'Menengah - Sulit (Deduksi Vokal)',
      theme: 'werewolf',
      badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      iconBg: 'bg-indigo-600 text-white',
      accentColor: 'text-indigo-600',
      discordPrep: [
        'Semua pemain berkumpul di 1 Voice Channel Discord utama.',
        'Saat FASE MALAM: Semua pemain WAJIB MUTE MIC dan menunduk/tutup mata di Voice Chat. Sistem web menjadi Moderator Otomatis!',
        'Saat FASE SIANG: Semua pemain BEBAS UNMUTE MIC untuk berdebat, saling menuduh, dan memberikan alibi.'
      ],
      winCondition: 'Tim Warga menang jika seluruh Werewolf berhasil dieksekusi. Tim Werewolf menang jika jumlah Werewolf setara atau melebihi jumlah warga yang masih hidup.',
      steps: [
        {
          num: '1',
          title: 'Pembagian Peran Rahasia',
          desc: 'Setiap pemain menerima peran rahasia di layar (Villager, Werewolf, Seer, Doctor, atau Hunter) tanpa ada yang tahu peran teman lainnya.'
        },
        {
          num: '2',
          title: 'Fase Malam (Discord Mute Total)',
          desc: 'Layar meredup. Werewolf memilih mangsa bersama, Seer mengintip peran 1 orang, dan Doctor memilih 1 orang untuk dilindungi.'
        },
        {
          num: '3',
          title: 'Fajar & Berita Duka Kematian',
          desc: 'Moderator web mengumumkan siapa korban yang tewas malam itu (atau mengumumkan kabar baik jika korban berhasil diselamatkan oleh Doctor).'
        },
        {
          num: '4',
          title: 'Fase Siang (Debat & Voting Gantung)',
          desc: 'Semua pemain unmute Discord, menganalisis alibi, dan melakukan voting eksekusi di layar untuk menggantung 1 tersangka yang paling dicurigai.'
        }
      ],
      specialRules: [
        {
          name: '🐺 Werewolf (Serigala)',
          badge: 'Tim Serigala',
          badgeColor: 'bg-rose-100 text-rose-800',
          desc: 'Memangsa 1 warga setiap malam dan menyamar sebagai warga jujur di siang hari. Berusahalah mengadu domba warga!'
        },
        {
          name: '🔮 Seer (Penerawang)',
          badge: 'Tim Warga',
          badgeColor: 'bg-purple-100 text-purple-800',
          desc: 'Setiap malam dapat mengintip peran asli 1 pemain. Informasimu sangat krusial, tapi hati-hati agar tidak diincar serigala!'
        },
        {
          name: '💉 Doctor (Dokter)',
          badge: 'Tim Warga',
          badgeColor: 'bg-emerald-100 text-emerald-800',
          desc: 'Melindungi 1 pemain setiap malam dari gigitan Werewolf (boleh melindungi diri sendiri, namun tidak boleh orang yang sama 2 malam berturut-turut).'
        },
        {
          name: '🏹 Hunter (Pemburu)',
          badge: 'Tim Warga',
          badgeColor: 'bg-amber-100 text-amber-800',
          desc: 'Jika Hunter terbunuh (baik dimangsa malam hari atau digantung siang hari), ia berhak langsung menembak mati 1 pemain pilihannya!'
        },
        {
          name: '🌾 Villager (Warga Biasa)',
          badge: 'Tim Warga',
          badgeColor: 'bg-slate-100 text-slate-800',
          desc: 'Warga desa tanpa kekuatan supranatural di malam hari, namun memegang kekuatan suara mayoritas dalam menentukan eksekusi siang hari.'
        }
      ]
    },

    'coup': {
      id: 'coup',
      title: 'Coup: Kudeta Kota Dystopia',
      subtitle: 'Gertakan Kartu Bangsawan, Pajak, dan Kudeta Politik',
      icon: 'crown',
      players: '3 - 6 Pemain',
      duration: '15 - 25 Menit',
      difficulty: 'Menengah (Bluffing & Intrik)',
      theme: 'coup',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      iconBg: 'bg-amber-500 text-white',
      accentColor: 'text-amber-600',
      discordPrep: [
        'Open mic di Discord Voice Channel.',
        'Latih intonasi suara dan kepercayaan dirimu: DI GAME INI KAMU BEBAS MENGAKU PUNYA KARTU APAPUN (BLUFFING) walau kartumu berbeda!',
        'Setiap pemain harus waspada terhadap gertakan lawan dan siap berteriak menantang (Challenge).'
      ],
      winCondition: 'Jadilah satu-satunya pemain yang masih memiliki sisa kartu pengaruh hidup setelah seluruh kartu pengaruh lawan tereliminasi!',
      steps: [
        {
          num: '1',
          title: 'Persiapan Awal (Modal 2 Koin & 2 Kartu)',
          desc: 'Setiap pemain menerima 2 koin emas dan 2 kartu pengaruh tertutup yang dirahasiakan.'
        },
        {
          num: '2',
          title: 'Giliran Aksi (Pilih 1 Langkah)',
          desc: 'Di giliranmu, pilih 1 aksi: Income (+1 koin), Foreign Aid (+2 koin), Coup (bayar 7 koin), atau aksi karakter bangsawan.'
        },
        {
          num: '3',
          title: 'Deklarasi & Gertakan (Bluffing)',
          desc: 'Kamu boleh mengeklaim aksi karakter APAPUN tanpa perlu membuktikannya ke teman-temanmu di awal.'
        },
        {
          num: '4',
          title: 'Tantangan (Challenge) & Konsekuensi',
          desc: 'Pemain lain di Discord boleh menantang "CHALLENGE!". Jika si pelaku bohong, kartunya gugur 1. Jika jujur, penuduh yang kehilangan 1 kartu!'
        },
        {
          num: '5',
          title: 'Kudeta Mutlak (Coup 7 Koin)',
          desc: 'Bayar 7 koin emas untuk langsung mengeliminasi 1 kartu pengaruh pemain lawan secara mutlak tanpa bisa ditangkis!'
        }
      ],
      specialRules: [
        {
          name: '👑 Duke (Bangsawan Pajak)',
          badge: 'Pajak & Blokir',
          badgeColor: 'bg-purple-100 text-purple-800',
          desc: 'Aksi: Mengambil Pajak 3 Koin dari kas negara. Blokir: Dapat memblokir aksi Foreign Aid siapapun.'
        },
        {
          name: '🗡️ Assassin (Pembunuh Gelap)',
          badge: 'Eksekusi Cepat',
          badgeColor: 'bg-rose-100 text-rose-800',
          desc: 'Aksi: Bayar 3 koin untuk melenyapkan 1 kartu pengaruh pemain lain. (Dapat ditangkis oleh Contessa).'
        },
        {
          name: '💰 Captain (Kapten Bajak)',
          badge: 'Curi & Tangkis',
          badgeColor: 'bg-sky-100 text-sky-800',
          desc: 'Aksi: Mencuri 2 koin emas dari pemain lain. Blokir: Menangkis aksi pencurian Captain lawan.'
        },
        {
          name: '📜 Ambassador (Duta Besar)',
          badge: 'Tukar & Lindungi',
          badgeColor: 'bg-emerald-100 text-emerald-800',
          desc: 'Aksi: Mengintip 2 kartu dari dek dan menukar kartu tanganmu. Blokir: Menangkis aksi pencurian Captain.'
        },
        {
          name: '🛡️ Contessa (Wanita Bangsawan)',
          badge: 'Perisai Mutlak',
          badgeColor: 'bg-amber-100 text-amber-800',
          desc: 'Kemampuan Khusus: Menangkis dan menggagalkan percobaan pembunuhan dari Assassin lawan.'
        }
      ]
    },

    'costume-detective': {
      id: 'costume-detective',
      title: 'Costume Party Detective',
      subtitle: 'Sembunyikan Identitas Kostummu di 6 Ruangan Pesta',
      icon: 'glasses',
      players: '3 - 8 Pemain',
      duration: '20 - 35 Menit',
      difficulty: 'Menengah (Deduksi Visual)',
      theme: 'costume-detective',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
      iconBg: 'bg-teal-600 text-white',
      accentColor: 'text-teal-600',
      discordPrep: [
        'Open mic di Discord Voice Channel.',
        'Jaga kerahasiaan kartu kostummu dari teman-teman.',
        'Gunakan intrik vokal di Discord saat menggerakkan karakter agar lawan tidak menduga siapa kamu sebenarnya!'
      ],
      winCondition: 'Mendeduksi dan membongkar kostum asli seluruh pemain lawan, sembari menjaga agar kostum rahasiamu sendiri tetap aman tidak tertebak hingga pesta berakhir.',
      steps: [
        {
          num: '1',
          title: 'Undian Kostum Rahasia',
          desc: 'Setiap pemain mendapatkan 1 identitas kostum rahasia dari daftar tamu pesta (Vampir, Astronot, Detektif, Bajak Laut, Hantu, Badut). Karakter sisa adalah tamu pesta netral.'
        },
        {
          num: '2',
          title: 'Denah 6 Ruangan Pesta',
          desc: 'Papan pesta terdiri dari 6 ruangan: Ballroom, Perpustakaan, Dapur, Taman Belakang, Ruang Biliar, & Balkon Atap.'
        },
        {
          num: '3',
          title: 'Lempar Dadu & Gerak Karakter Bebas',
          desc: 'Di giliranmu, lempar dadu untuk menentukan langkah. Kamu boleh menggerakkan karakter SIAPAPUN (bisa kostummu atau kostum orang lain untuk mengecoh pengamatan lawan!).'
        },
        {
          num: '4',
          title: 'Interaksi Ruangan & Petunjuk',
          desc: 'Saat beberapa kostum berkumpul di satu ruangan, mintalah petunjuk atau lakukan interogasi untuk mempersempit kecurigaan.'
        },
        {
          num: '5',
          title: 'Buat Tuduhan Resmi (Accusation)',
          desc: 'Jika yakin, buat tuduhan resmi pada lawan. Tuduhan Benar mengeliminasi lawan; Tuduhan Salah membuatmu terkena penalti berat!'
        }
      ],
      specialRules: [
        {
          name: '🎭 Taktik Pengecohan (Bluff Walking)',
          badge: 'Trik Gerak',
          badgeColor: 'bg-purple-100 text-purple-800',
          desc: 'Gerakkan karakter yang bukan kostummu sesering mungkin agar teman-temanmu mengira itu adalah karakter aslimu.'
        },
        {
          name: '🎲 Dadu Ruangan & Manuver',
          badge: 'Mekanik Papan',
          badgeColor: 'bg-teal-100 text-teal-800',
          desc: 'Angka dadu menentukan seberapa jauh kamu bisa memindahkan tamu pesta antar-ruangan untuk menciptakan interogasi.'
        },
        {
          name: '🔍 Hak Tuduhan Terbatas',
          badge: 'Peringatan',
          badgeColor: 'bg-rose-100 text-rose-800',
          desc: 'Jangan asal menuduh! Kesempatan tuduhan terbatas, pastikan kamu memiliki cukup bukti deduksi sebelum meluncurkan tuduhan.'
        }
      ]
    },

    'spicy': {
      id: 'spicy',
      title: 'Spicy',
      subtitle: 'Bluffing Kartu Rempah & Angka (Wasabi, Cabe, Lada)',
      icon: 'flame',
      players: '2 - 6 Pemain',
      duration: '15 - 20 Menit',
      difficulty: 'Gertakan & Taktik (Medium)',
      theme: 'spicy',
      badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
      iconBg: 'bg-orange-500 text-white',
      accentColor: 'text-orange-600',
      discordPrep: [
        'Kumpul bersama di Voice Channel Discord.',
        'Perhatikan nada bicara dan intonasi lawan saat mengklaim kartu di Discord — suara bergetar bisa jadi tanda gertakan!',
        'Setiap pemain memegang kartu rahasia di tangan mereka dan meletakkan kartu tertutup di tumpukan meja.',
        'Jaga ekspresi poker face kamu jika bermain menggunakan webcam Discord!'
      ],
      winCondition: 'Pemain yang berhasil mengumpulkan 2 Kartu Trofi (Trophy Card) atau pemain dengan poin tertinggi saat kartu habis dinyatakan sebagai Juara Rempah Terpedas!',
      steps: [
        {
          num: '1',
          title: 'Pasang Kartu Tertutup & Nyatakan Klaim',
          desc: 'Pemain aktif meletakkan 1 kartu tertutup di tumpukan tengah sambil menyatakan jenis bumbu (Wasabi, Cabe, atau Lada) dan angka yang LEBIH TINGGI (1 hingga 10) dari klaim sebelumnya dengan jenis bumbu yang sama.'
        },
        {
          num: '2',
          title: 'Gertakan Boleh Bebas',
          desc: 'Kartu aslimu tidak harus sesuai dengan yang kamu katakan! Kamu bisa meletakkan Lada 2 dan bersumpah di Discord bahwa itu adalah Cabe 8.'
        },
        {
          num: '3',
          title: 'Momen Menantang (Challenge)',
          desc: 'Pemain berikutnya boleh memilih untuk meletakkan kartu yang lebih tinggi, pas (mengambil 1 kartu dari dek), atau MENANTANG kartu teratas dengan menepuk meja!'
        },
        {
          num: '4',
          title: 'Tantangan Spesifik: Rempah atau Angka?',
          desc: 'Penantang harus memilih secara spesifik apakah dia menuduh "REMPAHNYA SALAH" atau "ANGKANYA SALAH". Kartu dibuka untuk membuktikan siapa yang benar!'
        }
      ],
      specialRules: [
        {
          name: '🌶️ Menuduh Jenis Rempah vs Angka',
          badge: 'Mekanik Utama',
          badgeColor: 'bg-orange-100 text-orange-800',
          desc: 'Penantang hanya boleh menuduh satu aspek: bumbunya salah, atau angkanya salah. Jika pemain mengaku "Cabe 8" tapi kartunya "Cabe 3", penantang yang menuduh "Rempahnya Salah" justru KALAH karena rempahnya memang Cabe!'
        },
        {
          name: '🃏 Kartu Wildcard (Bumbu Liar & Angka Liar)',
          badge: 'Kartu Khusus',
          badgeColor: 'bg-amber-100 text-amber-800',
          desc: 'Kartu bunglon yang bisa mewakili bumbu apa saja atau angka berapa saja. Namun waspadalah: jika ditantang pada aspek yang tidak dicakup oleh sifat wildcard-nya, pemain tetap bisa kalah!'
        },
        {
          name: '🏆 Kartu Trofi & Skor Kemenangan',
          badge: 'Kemenangan',
          badgeColor: 'bg-yellow-100 text-yellow-800',
          desc: 'Pemain yang berhasil menghabiskan seluruh kartu di tangannya mendapatkan 1 Kartu Trofi bernilai besar. Game selesai seketika jika ada yang mengoleksi 2 Trofi!'
        },
        {
          name: '🔥 Bumbu Pedas Max 10 (Reset Bumbu Baru)',
          badge: 'Aturan Level 10',
          badgeColor: 'bg-red-100 text-red-800',
          desc: 'Jika ada pemain yang menyatakan angka 10, pemain berikutnya dapat memulai tumpukan baru dengan angka 1, 2, atau 3 tetapi harus menggunakan bumbu yang BERBEDA.'
        }
      ]
    },

    'trio': {
      id: 'trio',
      title: 'Trio',
      subtitle: 'Deduksi Memori Mencari 3 Angka Kembar',
      icon: 'layers',
      players: '3 - 6 Pemain',
      duration: '10 - 15 Menit',
      difficulty: 'Memori & Logika Cepat (Easy-Medium)',
      theme: 'trio',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      iconBg: 'bg-cyan-500 text-white',
      accentColor: 'text-cyan-600',
      discordPrep: [
        'Kumpul di Voice Channel Discord untuk interogasi kartu.',
        'Siapkan konsentrasi memori: perhatikan angka berapa saja yang sudah pernah dibuka oleh lawan di giliran sebelumnya.',
        'Dilarang mencatat kartu lawan — andalkan kekuatan ingatan tongkronganmu!'
      ],
      winCondition: 'Pemain pertama yang berhasil mengumpulkan 3 Set Trio (3 kartu bernilai sama) ATAU langsung menang instan jika berhasil mendapatkan Trio Angka 7!',
      steps: [
        {
          num: '1',
          title: 'Pilih Sumber Kartu',
          desc: 'Di giliranmu, kamu dapat membuka 1 kartu dari Meja (tertutup) ATAU meminta pemain lain membuka kartu dari tangan mereka.'
        },
        {
          num: '2',
          title: 'Aturan Ekstrem: Hanya Kartu Terkecil atau Terbesar!',
          desc: 'Saat meminta kartu dari tangan pemain mana pun (termasuk tanganmu sendiri), kamu HANYA boleh meminta kartu TERKECIL atau TERBESAR yang mereka miliki. Kamu tidak bisa meminta angka di tengah!'
        },
        {
          num: '3',
          title: 'Mencari Kartu Kembar',
          desc: 'Buka kartu kedua dengan cara yang sama. Jika kedua kartu tersebut BERNILAI SAMA, kamu berhak mencari kartu ketiga untuk melengkapi Trio. Jika berbeda, kedua kartu ditutup kembali dan giliranmu berakhir!'
        },
        {
          num: '4',
          title: 'Mendapatkan Trio & Giliran Lanjutan',
          desc: 'Jika ketiga kartu bernilai sama terbuka, kamu mengamankan Trio tersebut ke depan tokomu dan mendapatkan giliran baru!'
        }
      ],
      specialRules: [
        {
          name: '🔢 Urutan Tangan Wajib Rapi',
          badge: 'Mekanik Inti',
          badgeColor: 'bg-cyan-100 text-cyan-800',
          desc: 'Kartu di tangan setiap pemain SELALU otomatis terurut rapi dari angka terkecil di sebelah kiri hingga angka terbesar di sebelah kanan.'
        },
        {
          name: '✨ Kemenangan Instan Trio 7',
          badge: 'Golden Trio',
          badgeColor: 'bg-amber-100 text-amber-800',
          desc: 'Angka 7 adalah kartu legendaris bertuah emas. Siapa pun yang berhasil mengamankan Trio 7 langsung MENANG SEKETIKA tanpa perlu mengumpulkan 3 set!'
        },
        {
          name: '🎯 Set Trio Terhubung (Varian)',
          badge: 'Taktik Lanjutan',
          badgeColor: 'bg-pink-100 text-pink-800',
          desc: 'Pada mode varian, mengamankan 2 set trio yang saling terhubung (misal selisih atau jumlah tertentu) juga bisa membawa kemenangan lebih cepat.'
        },
        {
          name: '🧠 Pancingan Deduksi Discord',
          badge: 'Trik Bicara',
          badgeColor: 'bg-indigo-100 text-indigo-800',
          desc: 'Pancing lawan untuk membuka kartu terkecilnya agar kamu tahu posisi angka kunci yang kamu butuhkan untuk trio di giliranmu selanjutnya.'
        }
      ]
    },

    'secret-hitler': {
      id: 'secret-hitler',
      title: 'Secret Hitler',
      subtitle: 'Deduksi Sosial & Intrik Parlemen 1930-an',
      icon: 'briefcase',
      players: '5 - 10 Pemain',
      duration: '30 - 45 Menit',
      difficulty: 'Deduksi Sosial Mendalam (Hard & Seru)',
      theme: 'secret-hitler',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      iconBg: 'bg-red-600 text-white',
      accentColor: 'text-red-600',
      discordPrep: [
        'Semua pemain berada di Voice Channel Discord. Komunikasi mic bebas dan sangat panas selama debat parlemen.',
        'Host memfasilitasi "Malam Buta" di awal game di mana Fasis saling mengenal satu sama lain, sementara Hitler tidak tahu siapa pengikutnya (pada 7+ pemain).',
        'Prinsip Kepercayaan: Jangan percaya siapa pun 100%! Fasis akan berpura-pura menjadi Liberal paling suci demi meloloskan agenda rahasia.'
      ],
      winCondition: 'LIBERAL MENANG: Jika 5 Kebijakan Liberal disahkan ATAU Secret Hitler dieksekusi mati! FASIS MENANG: Jika 6 Kebijakan Fasis disahkan ATAU Secret Hitler terpilih menjadi Kanselir setelah 3 Kebijakan Fasis disahkan!',
      steps: [
        {
          num: '1',
          title: 'Nominasi Presiden & Kanselir',
          desc: 'Jabatan Presiden bergilir searah jarum jam. Presiden aktif menominasikan 1 pemain lain untuk menjadi calon Kanselir.'
        },
        {
          num: '2',
          title: 'Pemilihan Umum (Ja! / Nein!)',
          desc: 'Seluruh pemain di ruang voting memilih secara bersamaan "Ja!" (Setuju) atau "Nein!" (Tolak). Jika mayoritas Ja, pemerintahan terbentuk. Jika seri atau mayoritas Nein, pelacak pemilihan naik (3x gagal = kebijakan teratas langsung disahkan darurat tanpa kompromi!).'
        },
        {
          num: '3',
          title: 'Legislasi & Pengesahan Kebijakan',
          desc: 'Presiden mengambil 3 kartu teratas dek kebijakan rahasia, membuang 1 secara tertutup, lalu memberikan 2 kartu tersisa ke Kanselir. Kanselir membuang 1 kartu dan mengesahkan 1 kebijakan ke papan permainan!'
        },
        {
          num: '4',
          title: 'Kekuatan Eksekutif Presiden',
          desc: 'Jika kebijakan Fasis disahkan, Presiden mendapatkan kekuatan eksekutif spesial sesuai papan (Memeriksa Loyalti Pemain, Memilih Presiden Berikutnya, atau Mengeksekusi Mati 1 Pemain).'
        }
      ],
      specialRules: [
        {
          name: '🕊️ Fraksi Liberal (Mayoritas Buta)',
          badge: 'Liberal',
          badgeColor: 'bg-blue-100 text-blue-800',
          desc: 'Warga biasa tidak saling mengenal identitas sesama Liberal. Mereka harus mengandalkan logika matematika kebijakan dan kejujuran percakapan untuk menemukan siapa yang berbohong.'
        },
        {
          name: '💀 Fraksi Fasis & Secret Hitler',
          badge: 'Fasis',
          badgeColor: 'bg-rose-100 text-rose-800',
          desc: 'Fasis saling mengetahui identitas satu sama lain dan mengetahui siapa Hitler. Hitler harus menjaga citra bersih agar dicalonkan menjadi Kanselir di fase genting!'
        },
        {
          name: '⚠️ Zona Bahaya (Hitler Territory)',
          badge: 'Game Changer',
          badgeColor: 'bg-amber-100 text-amber-800',
          desc: 'Setelah 3 Kebijakan Fasis disahkan di papan, jika Hitler berhasil terpilih dan disahkan sebagai Kanselir, Kaum Fasis LANGSUNG MENANG SEKETIKA!'
        },
        {
          name: '🔫 Kekuatan Peluru Eksekusi Mati',
          badge: 'Eksekutif',
          badgeColor: 'bg-red-100 text-red-800',
          desc: 'Presiden berhak menunjuk 1 pemain untuk dieksekusi mati permanen dari permainan jika kebijakan fasis ke-4 atau ke-5 disahkan. Jika yang ditembak adalah Secret Hitler, Kaum Liberal langsung menang!'
        },
        {
          name: '🛑 Hak Veto Parlemen',
          badge: 'Aturan Khusus',
          badgeColor: 'bg-purple-100 text-purple-800',
          desc: 'Pada saat 5 Kebijakan Fasis telah disahkan, Presiden dan Kanselir dapat menyetujui Hak Veto bersama untuk membuang ketiga kartu kebijakan jika keduanya sepakat.'
        }
      ]
    }
  };

  /**
   * Buka Modal Panduan Game
   * @param {string} gameId - ID game yang ingin dibuka ('tentang-kita', 'voting', dst.)
   * @param {string} sourceContext - Konteks asal ('welcome' atau 'lobby')
   */
  function open(gameId = 'tentang-kita', sourceContext = 'welcome') {
    const container = document.getElementById('modal-container');
    const box = document.getElementById('modal-content');
    if (!container || !box) return;

    const game = RULES_DATA[gameId] || RULES_DATA['tentang-kita'];
    UI.Logger('RULES', `Opening rules for: [${game.id}], source: [${sourceContext}]`);

    // Ganti class box agar lebih lebar dan nyaman dibaca (max-w-4xl)
    box.className = 'w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-3xl border-2 border-slate-900/10 shadow-2xl overflow-hidden transform transition-transform duration-200 scale-95 opacity-0 my-auto';

    // Tabs Selector Bar untuk 6 Game
    const tabsHTML = Object.values(RULES_DATA).map(g => {
      const isActive = g.id === game.id;
      const activeClass = isActive 
        ? 'bg-slate-900 text-white shadow-md font-black' 
        : 'bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold';

      return `
        <button 
          onclick="GameRules.open('${g.id}', '${sourceContext}')"
          class="px-3.5 py-1.5 rounded-full text-xs font-display flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${activeClass}"
        >
          <i data-lucide="${g.icon}" class="w-3.5 h-3.5"></i>
          <span>${g.title}</span>
        </button>
      `;
    }).join('');

    // Langkah Step-by-Step HTML
    const stepsHTML = game.steps.map(s => `
      <div class="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5">
        <div class="w-7 h-7 rounded-xl bg-slate-900 text-white font-display font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
          ${s.num}
        </div>
        <div>
          <h5 class="font-display font-bold text-sm text-slate-900">${s.title}</h5>
          <p class="font-body text-xs text-slate-600 mt-1 leading-relaxed">${s.desc}</p>
        </div>
      </div>
    `).join('');

    // Peran / Aturan Khusus HTML
    const specialRulesHTML = game.specialRules.map(r => `
      <div class="p-4 rounded-2xl bg-white border-2 border-slate-900/5 shadow-xs hover:border-slate-900/15 transition-all">
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <h5 class="font-display font-bold text-sm text-slate-900">${r.name}</h5>
          <span class="px-2 py-0.5 rounded-md text-[10px] font-display font-bold ${r.badgeColor || 'bg-slate-100 text-slate-700'}">
            ${r.badge}
          </span>
        </div>
        <p class="font-body text-xs text-slate-600 leading-relaxed">${r.desc}</p>
      </div>
    `).join('');

    // Discord Preparation Items
    const discordPrepHTML = game.discordPrep.map(item => `
      <li class="flex items-start gap-2.5 text-xs text-indigo-950 font-body leading-relaxed">
        <span class="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
        <span>${item}</span>
      </li>
    `).join('');

    const backButtonText = sourceContext === 'lobby' ? '← Kembali ke Lobby' : '← Kembali ke Halaman Utama';

    box.innerHTML = `
      <!-- Sticky Top Header -->
      <div class="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-white shrink-0">
        <button 
          onclick="GameRules.close()" 
          class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
        >
          <span>${backButtonText}</span>
        </button>

        <div class="flex items-center gap-2 text-slate-800">
          <i data-lucide="book-open" class="w-4 h-4 text-indigo-600"></i>
          <span class="font-display font-black text-sm uppercase tracking-wider">Panduan & Cara Bermain</span>
        </div>

        <button 
          onclick="GameRules.close()" 
          class="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Tutup Panduan"
        >
          <i data-lucide="x" class="w-5 h-5"></i>
        </button>
      </div>

      <!-- Scrollable Tabs Selector -->
      <div class="px-5 sm:px-6 py-2.5 border-b border-slate-100 bg-slate-50/70 overflow-x-auto flex items-center gap-2 shrink-0 no-scrollbar">
        ${tabsHTML}
      </div>

      <!-- Main Scrollable Content Body -->
      <div class="px-5 sm:px-6 py-5 overflow-y-auto space-y-6 flex-1 text-slate-800">
        <!-- Game Hero Banner -->
        <div class="p-5 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100/80 border-2 border-slate-900/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl ${game.iconBg} flex items-center justify-center shadow-lg shadow-slate-900/10 shrink-0">
              <i data-lucide="${game.icon}" class="w-7 h-7"></i>
            </div>
            <div>
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <h3 class="font-display font-black text-xl sm:text-2xl text-slate-900">${game.title}</h3>
                <span class="px-2.5 py-0.5 rounded-full text-xs font-display font-bold border ${game.badgeColor}">
                  Resmi
                </span>
              </div>
              <p class="font-body text-xs sm:text-sm text-slate-500 font-medium">${game.subtitle}</p>
            </div>
          </div>

          <!-- Quick Stats Pills -->
          <div class="flex flex-wrap sm:flex-col gap-2 shrink-0">
            <span class="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-display font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs">
              <i data-lucide="users" class="w-3.5 h-3.5 text-indigo-500"></i>
              <span>${game.players}</span>
            </span>
            <span class="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-display font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs">
              <i data-lucide="clock" class="w-3.5 h-3.5 text-amber-500"></i>
              <span>${game.duration}</span>
            </span>
            <span class="px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-display font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs">
              <i data-lucide="award" class="w-3.5 h-3.5 text-emerald-500"></i>
              <span>${game.difficulty}</span>
            </span>
          </div>
        </div>

        <!-- Section 1: Persiapan di Discord -->
        <div class="p-4 sm:p-5 rounded-3xl bg-indigo-50/60 border-2 border-indigo-200/70">
          <div class="flex items-center gap-2.5 mb-3 text-indigo-950">
            <div class="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <i data-lucide="mic" class="w-4 h-4"></i>
            </div>
            <h4 class="font-display font-bold text-sm sm:text-base">Persiapan di Discord Voice Channel</h4>
          </div>
          <ul class="space-y-2">
            ${discordPrepHTML}
          </ul>
        </div>

        <!-- Section 2: Tujuan Permainan (Win Condition) -->
        <div class="p-4 sm:p-5 rounded-3xl bg-amber-50/60 border-2 border-amber-200/70">
          <div class="flex items-center gap-2.5 mb-2 text-amber-950">
            <div class="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <i data-lucide="target" class="w-4 h-4"></i>
            </div>
            <h4 class="font-display font-bold text-sm sm:text-base">Tujuan Permainan (Win Condition)</h4>
          </div>
          <p class="font-body text-xs sm:text-sm text-amber-950 leading-relaxed font-medium">
            ${game.winCondition}
          </p>
        </div>

        <!-- Section 3: Langkah-Langkah Cara Bermain -->
        <div>
          <div class="flex items-center gap-2 mb-3">
            <i data-lucide="list-ordered" class="w-5 h-5 text-indigo-600"></i>
            <h4 class="font-display font-bold text-base text-slate-900">Langkah-Langkah Cara Bermain</h4>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${stepsHTML}
          </div>
        </div>

        <!-- Section 4: Daftar Peran / Kartu / Aturan Khusus -->
        <div>
          <div class="flex items-center gap-2 mb-3">
            <i data-lucide="layers" class="w-5 h-5 text-indigo-600"></i>
            <h4 class="font-display font-bold text-base text-slate-900">Daftar Peran, Kartu & Aturan Khusus</h4>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            ${specialRulesHTML}
          </div>
        </div>
      </div>

      <!-- Sticky Bottom Footer -->
      <div class="px-5 sm:px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
        <span class="text-xs font-body text-slate-500 hidden sm:inline">
          💡 Tips: Kamu bisa berpindah membaca panduan game lain lewat tab di atas.
        </span>
        <button 
          onclick="GameRules.close()" 
          class="w-full sm:w-auto px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-display font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <i data-lucide="check" class="w-4 h-4"></i>
          <span>Saya Mengerti & Siap Bermain! 🚀</span>
        </button>
      </div>
    `;

    // Tampilkan modal
    container.classList.remove('hidden');
    requestAnimationFrame(() => {
      box.classList.remove('scale-95', 'opacity-0');
      box.classList.add('scale-100', 'opacity-100');
    });

    UI.refreshIcons();
  }

  /**
   * Tutup Modal Panduan Game
   */
  function close() {
    UI.closeModal();
  }

  return {
    open,
    close,
    getGameData: (id) => RULES_DATA[id] || RULES_DATA['tentang-kita']
  };
})();

if (typeof window !== 'undefined') {
  window.GameRules = GameRules;
}
