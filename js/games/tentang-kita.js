/**
 * ==========================================================================
 * DISCORD PARTY HUB - GAME 1: "TENTANG KITA"
 * ==========================================================================
 * Permainan kartu deep talk, persepsi, dilema moral, dan tantangan seru
 * bernuansa hangat (Terracotta Rose & Amber) dengan 3D Flip Card & Roulette Penjawab.
 */

const TentangKitaGame = (function () {
  'use strict';

  // 48 High-Quality Indonesian Cards across 4 Distinct Levels
  const CARDS_DATA = [
    // ----------------------------------------------------
    // LEVEL 1: ICEBREAKER & PERSEPSI (12 Kartu)
    // ----------------------------------------------------
    {
      id: 1,
      level: 'level-1',
      levelName: 'Level 1: Icebreaker & Persepsi',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      question: 'Kesan pertama apa yang kamu miliki tentang aku waktu pertama kali kita kenal atau ngobrol di voice chat?',
      prompt: 'Jawab dengan jujur! Jangan ragu ceritakan apakah ekspektasimu beda jauh dengan kenyataannya sekarang.'
    },
    {
      id: 2,
      level: 'level-1',
      levelName: 'Level 1: Icebreaker & Persepsi',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      question: 'Kalau aku dijadikan karakter anime atau film kartun, peran apa yang paling cocok buat aku?',
      prompt: 'Protagonis ceroboh, villain jenius, comic relief, atau mentor bijak di balik layar?'
    },
    {
      id: 3,
      level: 'level-1',
      levelName: 'Level 1: Icebreaker & Persepsi',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      question: 'Hal apa tentang diriku yang menurutmu paling bertolak belakang antara penampilan luar dan sifat asliku?',
      prompt: 'Misalnya: Kelihatan galak/pendiam tapi aslinya receh, atau kelihatan santai padahal overthinker.'
    },
    {
      id: 4,
      level: 'level-1',
      levelName: 'Level 1: Icebreaker & Persepsi',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      question: 'Kalau kita semua terdampar di pulau terpencil tanpa internet, siapa yang bakal survive paling lama dan siapa yang panik duluan?',
      prompt: 'Sebutkan alasannya berdasarkan kepribadian masing-masing di room ini!'
    },
    {
      id: 5,
      level: 'level-1',
      levelName: 'Level 1: Icebreaker & Persepsi',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      question: 'Apa hal paling absurd atau receh yang pernah bikin kamu ketawa terpingkal-pingkal sampai kehabisan nafas?',
      prompt: 'Bisa video meme jadul, kejadian memalukan teman, atau salah paham konyol.'
    },
    {
      id: 6,
      level: 'level-1',
      levelName: 'Level 1: Icebreaker & Persepsi',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      question: 'Kalau kamu harus mendeskripsikan kepribadianku cuma pakai 3 emoji, emoji apa aja yang kamu pilih dan kenapa?',
      prompt: 'Pemain lain boleh setuju atau memberi alternatif emoji versinya!'
    },
    {
      id: 7,
      level: 'level-1',
      levelName: 'Level 1: Icebreaker & Persepsi',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      question: 'Apa satu topik bahasan yang kalau disinggung, kamu bisa ngomong non-stop selama 3 jam tanpa rasa bosan?',
      prompt: 'Bisa hobi khusus, konspirasi, game tertentu, drama pop culture, atau filosofi kopi.'
    },
    {
      id: 8,
      level: 'level-1',
      levelName: 'Level 1: Icebreaker & Persepsi',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      question: 'Di antara kita semua di room ini, siapa yang menurutmu punya playlist lagu paling random atau ' + 'guilty pleasure' + ' paling mengejutkan?',
      prompt: 'Pemain yang dituduh wajib membeberkan 1 lagu paling aneh di history Spotify / YouTube-nya.'
    },
    {
      id: 9,
      level: 'level-1',
      levelName: 'Level 1: Icebreaker & Persepsi',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      question: 'Apa first impression paling salah atau fitnah paling konyol yang pernah orang lain simpulkan tentang kamu?',
      prompt: 'Bagaimana caramu membuktikan kalau tuduhan itu sama sekali keliru?'
    },
    {
      id: 10,
      level: 'level-1',
      levelName: 'Level 1: Icebreaker & Persepsi',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      question: 'Kalau kamu bisa menghapus satu kebiasaan kecil yang sering bikin kamu canggung saat nongkrong, apa itu?',
      prompt: 'Misal: Suka pura-pura cek HP waktu hening, bingung posisi tangan, atau ketawa palsu.'
    },
    {
      id: 11,
      level: 'level-1',
      levelName: 'Level 1: Icebreaker & Persepsi',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      question: 'Siapa di server ini yang punya aura paling mirip sosok "kakak yang bisa diandalkan" dan siapa yang ber-vibe "adik yang harus dijagain"?',
      prompt: 'Sebutkan orangnya dan ceritakan momen yang membuktikannya.'
    },
    {
      id: 12,
      level: 'level-1',
      levelName: 'Level 1: Icebreaker & Persepsi',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      question: 'Apa julukan atau nama panggilan paling konyol yang pernah kamu dapatkan waktu zaman sekolah / masa kecil?',
      prompt: 'Ceritakan latar belakang asal muasal nama panggilan legendaris tersebut!'
    },

    // ----------------------------------------------------
    // LEVEL 2: DEEP TALK & MASA LALU (12 Kartu)
    // ----------------------------------------------------
    {
      id: 13,
      level: 'level-2',
      levelName: 'Level 2: Deep Talk & Masa Lalu',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      question: 'Momen apa dalam setahun terakhir yang paling bikin kamu sadar bahwa dirimu sudah banyak bertumbuh dan berubah?',
      prompt: 'Bisa responsmu terhadap sebuah masalah, cara memperlakukan orang lain, atau berdamai dengan kegagalan.'
    },
    {
      id: 14,
      level: 'level-2',
      levelName: 'Level 2: Deep Talk & Masa Lalu',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      question: 'Apa nasihat kehidupan yang dulu sering disepelekan waktu remaja, tapi sekarang baru kamu sadari kebenarannya?',
      prompt: 'Pesan dari orang tua, guru, mantan, atau buku yang baru terasa dampaknya sekarang.'
    },
    {
      id: 15,
      level: 'level-2',
      levelName: 'Level 2: Deep Talk & Masa Lalu',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      question: 'Kalau kamu bisa mengirim pesan suara berdurasi 10 detik ke dirimu di umur 15 tahun, apa kalimat yang ingin kamu bisikkan?',
      prompt: 'Tarik nafas dalam-dalam sebelum menjawab, resapi perjalanan yang sudah kamu lewati.'
    },
    {
      id: 16,
      level: 'level-2',
      levelName: 'Level 2: Deep Talk & Masa Lalu',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      question: 'Apa penyesalan atau unsaid words yang sering tiba-tiba muncul di pikiranmu jam 2 pagi sebelum tidur?',
      prompt: 'Apakah kamu sudah memaafkan dirimu sendiri atas hal tersebut?'
    },
    {
      id: 17,
      level: 'level-2',
      levelName: 'Level 2: Deep Talk & Masa Lalu',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      question: 'Kapan terakhir kali kamu merasa benar-benar bangga pada dirimu sendiri, meskipun tidak ada orang lain yang melihat atau memujinya?',
      prompt: 'Kemenangan kecil tetaplah kemenangan yang patut dirayakan bersama malam ini.'
    },
    {
      id: 18,
      level: 'level-2',
      levelName: 'Level 2: Deep Talk & Masa Lalu',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      question: 'Apa ketakutan terbesar tentang masa depan yang jarang kamu ceritakan ke orang lain karena takut dihakimi?',
      prompt: 'Tentang karier, kesendirian, ekspektasi keluarga, atau kesehatan mental?'
    },
    {
      id: 19,
      level: 'level-2',
      levelName: 'Level 2: Deep Talk & Masa Lalu',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      question: 'Hal apa yang paling kamu syukuri dari caramu dibesarkan oleh orang tuamu atau keluargamu di masa kecil?',
      prompt: 'Nilai moral atau kenangan apa yang paling membekas hingga membentuk karaktermu hari ini?'
    },
    {
      id: 20,
      level: 'level-2',
      levelName: 'Level 2: Deep Talk & Masa Lalu',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      question: 'Pernahkah kamu kehilangan teman atau seseorang yang dulu sangat dekat, dan apa pelajaran paling berharga dari perpisahan itu?',
      prompt: 'Kadang orang datang sebagai berkah, kadang sebagai cermin pelajaran.'
    },
    {
      id: 21,
      level: 'level-2',
      levelName: 'Level 2: Deep Talk & Masa Lalu',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      question: 'Bagian mana dari rutinitas hidupmu saat ini yang sedang terasa paling melelahkan, dan bagaimana caramu tetap waras bertahan?',
      prompt: 'Teman-teman di room ini siap mendengarkan dan menjadi safe space untukmu.'
    },
    {
      id: 22,
      level: 'level-2',
      levelName: 'Level 2: Deep Talk & Masa Lalu',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      question: 'Apa arti kata "rumah" atau tempat pulang yang sesungguhnya buat kamu saat ini?',
      prompt: 'Apakah itu tempat fisik, orang tertentu, hobi, atau perasaan damai di dalam diri sendiri?'
    },
    {
      id: 23,
      level: 'level-2',
      levelName: 'Level 2: Deep Talk & Masa Lalu',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      question: 'Kalau hari ini adalah hari terakhir kamu bisa berbicara dengan seseorang yang sangat berarti, apa kalimat yang ingin kamu sampaikan?',
      prompt: 'Jangan biarkan kata-kata penuh cinta tersimpan sampai terlambat diungkapkan.'
    },
    {
      id: 24,
      level: 'level-2',
      levelName: 'Level 2: Deep Talk & Masa Lalu',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      question: 'Pujian apa yang pernah kamu terima dan masih kamu ingat jelas sampai hari ini karena begitu menyentuh hatimu?',
      prompt: 'Siapa yang mengatakannya dan kenapa kalimat itu terasa begitu tulus?'
    },

    // ----------------------------------------------------
    // LEVEL 3: DILEMA & UNPOPULAR OPINION (12 Kartu)
    // ----------------------------------------------------
    {
      id: 25,
      level: 'level-3',
      levelName: 'Level 3: Dilema & Unpopular Opinion',
      badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
      question: 'Apa satu Unpopular Opinion paling kontroversial yang kamu pegang teguh, tapi biasanya kamu simpan sendiri biar tidak dihujat?',
      prompt: 'Bisa tentang makanan, relasi, film overrated, atau standar industri kerja.'
    },
    {
      id: 26,
      level: 'level-3',
      levelName: 'Level 3: Dilema & Unpopular Opinion',
      badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
      question: 'Kamu lebih memilih tahu tanggal pasti kapan kamu meninggal, ATAU tahu penyebab pasti bagaimana kamu meninggal?',
      prompt: 'Pilih satu dan jelaskan bagaimana pengetahuan itu akan mengubah caramu menjalani hidup.'
    },
    {
      id: 27,
      level: 'level-3',
      levelName: 'Level 3: Dilema & Unpopular Opinion',
      badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
      question: 'Apakah kebohongan demi kebaikan (White Lies) itu benar-benar ada, atau cuma dalih orang yang takut bertanggung jawab?',
      prompt: 'Kapan terakhir kali kamu berbohong demi kebaikan orang lain?'
    },
    {
      id: 28,
      level: 'level-3',
      levelName: 'Level 3: Dilema & Unpopular Opinion',
      badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
      question: 'Kamu lebih memilih punya pekerjaan impian dengan penghasilan pas-pasan, ATAU kerjaan membosankan tapi gajinya fantastis?',
      prompt: 'Apakah idealisme masih bisa menang melawan realitas cicilan hidup?'
    },
    {
      id: 29,
      level: 'level-3',
      levelName: 'Level 3: Dilema & Unpopular Opinion',
      badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
      question: 'Kalau kamu ditawari kemampuan bisa membaca isi pikiran semua orang tanpa bisa dimatikan selamanya, maukah kamu menerimanya?',
      prompt: 'Bayangkan mengetahui apa yang orang lain pikirkan tentangmu di setiap detik.'
    },
    {
      id: 30,
      level: 'level-3',
      levelName: 'Level 3: Dilema & Unpopular Opinion',
      badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
      question: 'Apa tren atau kebiasaan modern zaman sekarang yang menurutmu sudah sangat toxic tapi masih sering dinormalisasi banyak orang?',
      prompt: 'Contoh: Hustle culture gila-gilaan, pamer kesedihan di medsos, atau ghosting tanpa kabar.'
    },
    {
      id: 31,
      level: 'level-3',
      levelName: 'Level 3: Dilema & Unpopular Opinion',
      badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
      question: 'Lebih baik dicintai habis-habisan oleh orang yang tidak terlalu kamu sukai, ATAU mencintai setengah mati orang yang tidak pernah membalas perasaanmu?',
      prompt: 'Pilih salah satu, tidak ada jawaban abu-abu!'
    },
    {
      id: 32,
      level: 'level-3',
      levelName: 'Level 3: Dilema & Unpopular Opinion',
      badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
      question: 'Apakah menurutmu mantan pacar bisa benar-benar murni berteman tanpa sisa rasa baper atau motif tersembunyi?',
      prompt: 'Debatkan berdasarkan pengalaman nyata atau prinsipmu sendiri!'
    },
    {
      id: 33,
      level: 'level-3',
      levelName: 'Level 3: Dilema & Unpopular Opinion',
      badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
      question: 'Kalau kamu menemukan tas koper berisi uang tunai 1 Miliar di pinggir jalan sepi tanpa CCTV dan tanpa saksi mata, apa tindakan jujurmu?',
      prompt: 'Apakah langsung lapor polisi, simpan diam-diam, atau sedekahkan separuh?'
    },
    {
      id: 34,
      level: 'level-3',
      levelName: 'Level 3: Dilema & Unpopular Opinion',
      badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
      question: 'Apakah maaf itu wajib diberikan kepada setiap orang yang menyakiti kita, atau ada perbuatan yang sepenuhnya sah untuk tidak pernah dimaafkan?',
      prompt: 'Bagaimana batas toleransi moralmu dalam hal memaafkan?'
    },
    {
      id: 35,
      level: 'level-3',
      levelName: 'Level 3: Dilema & Unpopular Opinion',
      badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
      question: 'Pilih salah satu: Memutar waktu mundur 10 tahun ke masa lalu dengan seluruh memorimu saat ini, ATAU melompat 10 tahun ke depan dengan uang 100 Miliar?',
      prompt: 'Apakah kamu memilih kesempatan memperbaiki masa lalu atau kepastian finansial masa depan?'
    },
    {
      id: 36,
      level: 'level-3',
      levelName: 'Level 3: Dilema & Unpopular Opinion',
      badgeColor: 'bg-orange-100 text-orange-900 border-orange-300',
      question: 'Apa satu hal paling overhyped di dunia ini yang menurut banyak orang keren/hebat, tapi menurut pandangan pribadimu biasa saja?',
      prompt: 'Waktunya berpendapat tanpa takut dicap anti-mainstream!'
    },

    // ----------------------------------------------------
    // WILDCARD: TANTANGAN SPONTAN DISCORD (12 Kartu)
    // ----------------------------------------------------
    {
      id: 37,
      level: 'wildcard',
      levelName: 'Wildcard: Tantangan Spontan Discord',
      badgeColor: 'bg-red-100 text-red-900 border-red-300',
      question: '🔥 WILDCARD TANTANGAN: Nyanyikan potongan reff lagu galau atau lagu dangdut paling heboh di voice chat sekarang juga!',
      prompt: 'Pemain lain wajib memberikan tepuk tangan atau sound effect di mic saat selesai.'
    },
    {
      id: 38,
      level: 'wildcard',
      levelName: 'Wildcard: Tantangan Spontan Discord',
      badgeColor: 'bg-red-100 text-red-900 border-red-300',
      question: '🔥 WILDCARD TANTANGAN: Ungkapkan apa foto atau tangkapan layar paling terakhir yang ada di galeri ponselmu!',
      prompt: 'Deskripsikan dengan detail dan jujur mengapa foto itu ada di galerimu.'
    },
    {
      id: 39,
      level: 'wildcard',
      levelName: 'Wildcard: Tantangan Spontan Discord',
      badgeColor: 'bg-red-100 text-red-900 border-red-300',
      question: '🔥 WILDCARD TANTANGAN: Berikan gombalan maut paling cheesy ke salah satu pemain di room ini selama 30 detik tanpa boleh tertawa!',
      prompt: 'Kalau kamu tertawa duluan, kamu wajib mengulanginya ke pemain yang lain!'
    },
    {
      id: 40,
      level: 'wildcard',
      levelName: 'Wildcard: Tantangan Spontan Discord',
      badgeColor: 'bg-red-100 text-red-900 border-red-300',
      question: '🔥 WILDCARD TANTANGAN: Tirukan suara salah satu karakter anime, kartun, atau bot suara Discord selama 15 detik!',
      prompt: 'Gunakan seluruh bakat akting terpendammu malam ini!'
    },
    {
      id: 41,
      level: 'wildcard',
      levelName: 'Wildcard: Tantangan Spontan Discord',
      badgeColor: 'bg-red-100 text-red-900 border-red-300',
      question: '🔥 WILDCARD TANTANGAN: Bacakan pesan teks terakhir yang kamu kirim di chat WhatsApp dengan nada pembaca berita formal TV!',
      prompt: 'Intonasi serius dan artikulasi tegas adalah kunci kelucuan tantangan ini.'
    },
    {
      id: 42,
      level: 'wildcard',
      levelName: 'Wildcard: Tantangan Spontan Discord',
      badgeColor: 'bg-red-100 text-red-900 border-red-300',
      question: '🔥 WILDCARD TANTANGAN: Kirim satu emoji paling absurd di channel text Discord yang sedang aktif tanpa penjelasan apapun!',
      prompt: 'Lihat bagaimana reaksi orang-orang yang melihatnya.'
    },
    {
      id: 43,
      level: 'wildcard',
      levelName: 'Wildcard: Tantangan Spontan Discord',
      badgeColor: 'bg-red-100 text-red-900 border-red-300',
      question: '🔥 WILDCARD TANTANGAN: Tiru gaya bicara atau kalimat andalan salah satu teman di room ini sampai ada yang berhasil menebak!',
      prompt: 'Jangan sebut namanya dulu, biarkan teman-teman lain menebak siapa yang kamu tiru.'
    },
    {
      id: 44,
      level: 'wildcard',
      levelName: 'Wildcard: Tantangan Spontan Discord',
      badgeColor: 'bg-red-100 text-red-900 border-red-300',
      question: '🔥 WILDCARD TANTANGAN: Buatlah pantun 4 baris spontan atau freestyle sajak tentang suasana nongkrong kita malam ini!',
      prompt: 'Contoh: Masak air biar matang... yuk lanjut jangan sampai tegang!'
    },
    {
      id: 45,
      level: 'wildcard',
      levelName: 'Wildcard: Tantangan Spontan Discord',
      badgeColor: 'bg-red-100 text-red-900 border-red-300',
      question: '🔥 WILDCARD TANTANGAN: Ceritakan satu "Guilty Pleasure" atau kebiasaan anehmu saat sendirian di kamar yang belum pernah diketahui orang lain!',
      prompt: 'Ruangan ini aman dan rahasiamu terjamin!'
    },
    {
      id: 46,
      level: 'wildcard',
      levelName: 'Wildcard: Tantangan Spontan Discord',
      badgeColor: 'bg-red-100 text-red-900 border-red-300',
      question: '🔥 WILDCARD TANTANGAN: Berikan pujian tulus, hangat, dan spesifik kepada 2 orang pemain di room ini!',
      prompt: 'Sebutkan kontribusi atau sifat baik mereka yang paling kamu hargai.'
    },
    {
      id: 47,
      level: 'wildcard',
      levelName: 'Wildcard: Tantangan Spontan Discord',
      badgeColor: 'bg-red-100 text-red-900 border-red-300',
      question: '🔥 WILDCARD TANTANGAN: Lakukan akting marah dramatis ala sinetron jadul kepada orang yang ada di atas nama akunmu!',
      prompt: 'Gunakan kalimat legendaris: "Tega sekali kamu melakukan ini kepadaku!!"'
    },
    {
      id: 48,
      level: 'wildcard',
      levelName: 'Wildcard: Tantangan Spontan Discord',
      badgeColor: 'bg-red-100 text-red-900 border-red-300',
      question: '🔥 WILDCARD TANTANGAN: Ganti status ' + 'About Me' + ' atau Custom Status Discord-mu dengan kalimat pilihan Host selama 10 menit!',
      prompt: 'Host berhak menentukan kalimat status yang lucu dan tidak melanggar aturan.'
    }
  ];

  // Local state
  let currentRoom = null;
  let currentPlayer = null;
  let isSpinningLocal = false;

  const LEVEL_FILTERS = [
    { key: 'all', label: 'Semua Kartu (48)', icon: 'layers' },
    { key: 'level-1', label: 'Level 1: Persepsi', icon: 'smile' },
    { key: 'level-2', label: 'Level 2: Deep Talk', icon: 'heart' },
    { key: 'level-3', label: 'Level 3: Dilema', icon: 'scale' },
    { key: 'wildcard', label: 'Wildcard: Tantangan', icon: 'flame' }
  ];

  function getFilteredCards(levelKey) {
    if (!levelKey || levelKey === 'all') return CARDS_DATA;
    return CARDS_DATA.filter(c => c.level === levelKey);
  }

  return {
    getCards() {
      return CARDS_DATA;
    },

    /**
     * Initializes or renders game state
     */
    init(roomData, player) {
      currentRoom = roomData;
      currentPlayer = player;
      UI.setTheme('tentang-kita');
      UI.Logger('TENTANG-KITA', 'Initialized Game View');
    },

    /**
     * Renders game container inside target element
     */
    render(containerEl, roomData, player) {
      currentRoom = roomData;
      currentPlayer = player;

      const gameState = roomData.gameState?.tentangKita || {
        cardIndex: 0,
        level: 'all',
        isFlipped: false,
        selectedAnswerer: null
      };

      const currentLevel = gameState.level || 'all';
      const filtered = getFilteredCards(currentLevel);
      const safeIndex = Math.min(Math.max(0, gameState.cardIndex || 0), filtered.length - 1);
      const activeCard = filtered[safeIndex] || CARDS_DATA[0];
      const isFlipped = Boolean(gameState.isFlipped);
      const isHost = player.isHost;

      const playerList = Object.values(roomData.players || {});
      const chosenPlayer = playerList.find(p => p.id === gameState.selectedAnswerer);

      // Render Level Filter Pills
      const levelFiltersHTML = LEVEL_FILTERS.map(filter => {
        const isActive = currentLevel === filter.key;
        const activeClass = isActive
          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-bold scale-105'
          : 'bg-white/80 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200/80 font-semibold';

        return `
          <button 
            onclick="TentangKitaGame.setLevel('${filter.key}')"
            class="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-display transition-all duration-200 flex items-center gap-1.5 shrink-0 ${activeClass} active:scale-95 cursor-pointer"
          >
            <i data-lucide="${filter.icon}" class="w-3.5 h-3.5"></i>
            <span>${filter.label}</span>
          </button>
        `;
      }).join('');

      // Render Players Row for Roulette
      const playersRouletteHTML = playerList.map((p, idx) => {
        const isChosen = chosenPlayer && chosenPlayer.id === p.id;
        const chosenClass = isChosen ? 'roulette-active ring-4 ring-amber-400' : 'border-slate-200';

        return `
          <div 
            id="roulette-player-${p.id}"
            data-player-id="${p.id}"
            class="flex items-center gap-2 px-3 py-1.5 bg-white rounded-2xl border-2 transition-all duration-200 ${chosenClass} shadow-sm"
          >
            ${UI.Avatar({ name: p.name, size: 'sm', isHost: p.isHost, colorIndex: p.colorIndex || idx })}
            <div class="text-xs font-bold font-display truncate max-w-[90px] sm:max-w-[120px] text-slate-800">
              ${p.name}
            </div>
            ${p.id === currentPlayer.id ? '<span class="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-bold">KAMU</span>' : ''}
          </div>
        `;
      }).join('');

      // Center Card with 3D Flip
      const cardContentHTML = `
        <div class="w-full max-w-xl mx-auto perspective-1000 my-4 sm:my-6">
          <div 
            id="tentang-kita-card"
            onclick="TentangKitaGame.toggleFlip()"
            class="card-flip-inner cursor-pointer w-full min-h-[340px] sm:min-h-[380px] rounded-3xl ${isFlipped ? 'is-flipped' : ''}"
          >
            <!-- SISI DEPAN (FRONT COVER) -->
            <div class="absolute inset-0 w-full h-full backface-hidden rounded-3xl p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-rose-500 via-rose-600 to-amber-500 text-white shadow-joyful-lg border-4 border-white/30 card-glow">
              <div class="flex items-center justify-between">
                <span class="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold font-display tracking-wider uppercase border border-white/30 flex items-center gap-1.5">
                  <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-200"></i>
                  <span>${activeCard.levelName.split(':')[0]}</span>
                </span>
                <span class="text-xs font-display font-medium text-white/80">Kartu #${safeIndex + 1} dari ${filtered.length}</span>
              </div>

              <div class="text-center my-auto py-6">
                <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/40 shadow-inner animate-float">
                  <i data-lucide="help-circle" class="w-8 h-8 sm:w-10 sm:h-10 text-white"></i>
                </div>
                <h3 class="font-display font-bold text-2xl sm:text-3xl tracking-wide text-white drop-shadow-sm">Tentang Kita</h3>
                <p class="font-body text-xs sm:text-sm text-white/90 mt-2 max-w-xs mx-auto">Klik kartu untuk membuka pertanyaan seru & buka isi hatimu!</p>
              </div>

              <div class="flex items-center justify-between text-xs text-white/80 border-t border-white/20 pt-3">
                <span class="flex items-center gap-1.5">
                  <i data-lucide="rotate-cw" class="w-3.5 h-3.5"></i>
                  Klik untuk balik kartu
                </span>
                <span class="font-display font-bold">Discord Party Hub</span>
              </div>
            </div>

            <!-- SISI BELAKANG (QUESTION / BACK) -->
            <div class="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl p-6 sm:p-8 flex flex-col justify-between bg-white text-slate-800 shadow-joyful-lg border-4 border-rose-500/20 card-glow">
              <div class="flex items-center justify-between border-b border-slate-100 pb-3">
                <span class="px-3 py-1 rounded-full text-xs font-bold font-display tracking-wider uppercase border ${activeCard.badgeColor} flex items-center gap-1.5">
                  <i data-lucide="message-circle" class="w-3.5 h-3.5"></i>
                  <span>${activeCard.levelName}</span>
                </span>
                <span class="text-xs font-bold font-display text-slate-400">#${activeCard.id}</span>
              </div>

              <div class="my-auto py-4 text-center">
                <p class="font-display font-bold text-lg sm:text-2xl text-slate-800 leading-snug tracking-tight">
                  "${activeCard.question}"
                </p>
                <div class="mt-4 p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 max-w-md mx-auto">
                  <p class="font-body text-xs sm:text-sm text-amber-900/90 leading-relaxed italic">
                    💡 ${activeCard.prompt}
                  </p>
                </div>
              </div>

              <div class="flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 pt-3">
                <span class="flex items-center gap-1">
                  <i data-lucide="rotate-cw" class="w-3.5 h-3.5"></i>
                  Klik lagi untuk tutup kartu
                </span>
                <span class="font-display font-semibold text-rose-500">Tutup saat selesai berdiskusi</span>
              </div>
            </div>
          </div>
        </div>
      `;

      // Header controls & back button
      const headerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div class="flex items-center gap-3">
            <button 
              onclick="App.returnToLobby()"
              class="px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border-2 border-slate-900/10 font-display font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
            >
              <i data-lucide="arrow-left" class="w-4 h-4"></i>
              <span>Kembali ke Lobby</span>
            </button>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
              <h1 class="font-display font-bold text-xl sm:text-2xl text-slate-900">Tentang Kita</h1>
            </div>
          </div>

          <!-- Room Code Pill -->
          <div class="flex items-center gap-2 bg-white/80 px-3.5 py-1.5 rounded-2xl border-2 border-slate-900/10 text-xs font-display font-bold text-slate-700">
            <span>ROOM:</span>
            <span class="text-rose-600 font-extrabold text-sm tracking-widest">${roomData.code}</span>
          </div>
        </div>
      `;

      // Answerer notification banner
      const answererBannerHTML = chosenPlayer ? `
        <div class="mb-4 p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-amber-500/15 border-2 border-amber-500/30 flex items-center justify-between gap-3 animate-float">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-display font-bold text-lg shadow">
              🎯
            </div>
            <div>
              <div class="text-[10px] sm:text-xs font-black font-display tracking-widest uppercase text-amber-900">Giliran Menjawab Sekarang:</div>
              <div class="text-base sm:text-lg font-display font-bold text-slate-900 flex items-center gap-2">
                <span>${chosenPlayer.name}</span>
                ${chosenPlayer.id === currentPlayer.id ? '<span class="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">KAMU! 🎉</span>' : ''}
              </div>
            </div>
          </div>
          <button 
            onclick="TentangKitaGame.clearAnswerer()" 
            class="text-xs text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-white/60"
            title="Reset giliran"
          >
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>
      ` : '';

      // Bottom Control Buttons
      const controlsHTML = `
        <div class="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 mt-6">
          ${UI.Button({
            text: 'Spin Penjawab 🎲',
            onClick: 'TentangKitaGame.spinAnswerer()',
            variant: 'accent',
            size: 'lg',
            className: 'bg-amber-400 hover:bg-amber-500 text-amber-950 font-display font-black text-sm sm:text-base border-2 border-amber-500/40'
          })}

          ${UI.Button({
            text: isFlipped ? 'Tutup Kartu' : 'Balik Kartu 🔄',
            onClick: 'TentangKitaGame.toggleFlip()',
            variant: 'secondary',
            size: 'md',
            className: 'bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-900/15'
          })}

          <div class="flex items-center gap-2">
            ${UI.Button({
              icon: 'chevron-left',
              text: 'Prev',
              onClick: 'TentangKitaGame.prevCard()',
              variant: 'outline',
              size: 'md',
              disabled: safeIndex === 0,
              className: 'bg-white'
            })}

            ${UI.Button({
              iconRight: 'chevron-right',
              text: 'Next',
              onClick: 'TentangKitaGame.nextCard()',
              variant: 'primary',
              size: 'md',
              disabled: safeIndex >= filtered.length - 1,
              className: 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
            })}

            ${UI.Button({
              icon: 'shuffle',
              text: 'Acak',
              onClick: 'TentangKitaGame.randomCard()',
              variant: 'outline',
              size: 'md',
              className: 'bg-white'
            })}
          </div>
        </div>
      `;

      // Assemble full game view HTML
      containerEl.innerHTML = `
        <div class="w-full flex flex-col justify-between">
          ${headerHTML}

          <!-- Filters Row -->
          <div class="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-3">
            ${levelFiltersHTML}
          </div>

          <!-- Players Mini Bar for Roulette -->
          <div class="flex items-center gap-2 overflow-x-auto py-1 mb-2 scrollbar-none">
            <span class="text-xs font-display font-bold text-slate-400 shrink-0">Pemain:</span>
            ${playersRouletteHTML}
          </div>

          ${answererBannerHTML}

          <!-- 3D Card Display -->
          ${cardContentHTML}

          <!-- Game Action Controls -->
          ${controlsHTML}
        </div>
      `;

      UI.refreshIcons();
    },

    /**
     * Change active level filter
     */
    async setLevel(levelKey) {
      if (!currentRoom) return;
      UI.Sound.click();
      UI.Logger('TENTANG-KITA', 'Filter Changed', levelKey);

      await DB.updateGameState(currentRoom.code, 'tentangKita', {
        level: levelKey,
        cardIndex: 0,
        isFlipped: false
      });
    },

    /**
     * 3D Card flip toggle
     */
    async toggleFlip() {
      if (!currentRoom) return;
      UI.Sound.flip();

      const currentFlipped = currentRoom.gameState?.tentangKita?.isFlipped || false;
      await DB.updateGameState(currentRoom.code, 'tentangKita', {
        isFlipped: !currentFlipped
      });
    },

    /**
     * Next card
     */
    async nextCard() {
      if (!currentRoom) return;
      UI.Sound.click();

      const currentLevel = currentRoom.gameState?.tentangKita?.level || 'all';
      const filtered = getFilteredCards(currentLevel);
      const currentIndex = currentRoom.gameState?.tentangKita?.cardIndex || 0;

      if (currentIndex < filtered.length - 1) {
        await DB.updateGameState(currentRoom.code, 'tentangKita', {
          cardIndex: currentIndex + 1,
          isFlipped: false
        });
      }
    },

    /**
     * Previous card
     */
    async prevCard() {
      if (!currentRoom) return;
      UI.Sound.click();

      const currentIndex = currentRoom.gameState?.tentangKita?.cardIndex || 0;
      if (currentIndex > 0) {
        await DB.updateGameState(currentRoom.code, 'tentangKita', {
          cardIndex: currentIndex - 1,
          isFlipped: false
        });
      }
    },

    /**
     * Random card
     */
    async randomCard() {
      if (!currentRoom) return;
      UI.Sound.pop();

      const currentLevel = currentRoom.gameState?.tentangKita?.level || 'all';
      const filtered = getFilteredCards(currentLevel);
      const randomIndex = Math.floor(Math.random() * filtered.length);

      await DB.updateGameState(currentRoom.code, 'tentangKita', {
        cardIndex: randomIndex,
        isFlipped: false
      });
    },

    /**
     * Spin Penjawab (Roulette Feature)
     * Rapidly cycles through player names with sound & visual ticker,
     * then settles on a chosen player and updates Firebase state!
     */
    spinAnswerer() {
      if (!currentRoom || isSpinningLocal) return;

      const playerList = Object.values(currentRoom.players || {});
      if (playerList.length === 0) {
        UI.Toast('Tidak ada pemain di dalam room!', 'warning');
        return;
      }

      isSpinningLocal = true;
      UI.Logger('TENTANG-KITA', 'Starting Roulette Spin...');

      let cycleCount = 0;
      const totalCycles = 20 + Math.floor(Math.random() * 10); // Between 20-30 iterations
      let intervalMs = 60;
      let currentIndex = 0;

      const runTick = () => {
        // Remove previous highlight
        playerList.forEach(p => {
          const el = document.getElementById(`roulette-player-${p.id}`);
          if (el) el.classList.remove('roulette-active');
        });

        // Highlight current player in rotation
        const activeP = playerList[currentIndex % playerList.length];
        const activeEl = document.getElementById(`roulette-player-${activeP.id}`);
        if (activeEl) {
          activeEl.classList.add('roulette-active');
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }

        UI.Sound.tick(400 + (cycleCount * 15));
        cycleCount++;
        currentIndex++;

        if (cycleCount < totalCycles) {
          // Progressively slow down rotation
          if (cycleCount > totalCycles - 8) {
            intervalMs += 40;
          } else if (cycleCount > totalCycles - 14) {
            intervalMs += 20;
          }
          setTimeout(runTick, intervalMs);
        } else {
          // Spin finalized!
          const chosen = activeP;
          isSpinningLocal = false;

          UI.Sound.fanfare();
          UI.Confetti();
          UI.Toast(`🎯 Giliran Menjawab: ${chosen.name}!`, 'info', 4000);
          UI.Logger('TENTANG-KITA', `Winner selected: ${chosen.name} (${chosen.id})`);

          // Update in Firebase so everyone in room sees the answerer
          DB.updateGameState(currentRoom.code, 'tentangKita', {
            selectedAnswerer: chosen.id
          });
        }
      };

      runTick();
    },

    /**
     * Clear active answerer
     */
    async clearAnswerer() {
      if (!currentRoom) return;
      await DB.updateGameState(currentRoom.code, 'tentangKita', {
        selectedAnswerer: null
      });
    }
  };
})();
