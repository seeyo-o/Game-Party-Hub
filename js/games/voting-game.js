/**
 * ==========================================================================
 * DISCORD PARTY HUB - GAME 2: "SIAPA DI ANTARA KITA" (THE VOTING GAME)
 * ==========================================================================
 * Permainan voting anonim untuk membongkar persepsi teman satu server Discord.
 * Tema: Mint Breeze (#F2FBF7) dengan aksen Emerald (#10B981) & Sunny Yellow (#FACC15).
 */

const VotingGame = (function () {
  'use strict';

  // 40 High-Quality Indonesian Voting Questions for Discord Hangouts
  const QUESTIONS = [
    {
      id: 1,
      text: "Siapa yang paling mungkin tertidur waktu voice chat Discord masih nyala dan ngorok di mic?",
      category: "Absurd & Malu",
      icon: "moon"
    },
    {
      id: 2,
      text: "Siapa yang paling sering bilang 'Otw' padahal aslinya baru mau bangun dari kasur?",
      category: "Kebiasaan Buruk",
      icon: "clock"
    },
    {
      id: 3,
      text: "Siapa yang paling mungkin ketipu penipuan online berkedok giveaway saldo e-wallet gratis?",
      category: "Polos & Lugu",
      icon: "alert-triangle"
    },
    {
      id: 4,
      text: "Siapa yang paling gampang baper cuma gara-gara dibalas chat pakai titik satu atau huruf kecil?",
      category: "Sensitif",
      icon: "heart-crack"
    },
    {
      id: 5,
      text: "Siapa yang punya riwayat pencarian (search history) browser paling berbahaya kalau dibuka di depan umum?",
      category: "Rahasia Gelap",
      icon: "search"
    },
    {
      id: 6,
      text: "Siapa yang paling jago bikin alasan mendadak sakit pas diajak nongkrong karena lagi mager keluar?",
      category: "Mager Parah",
      icon: "bed-double"
    },
    {
      id: 7,
      text: "Siapa yang paling sering diam-diam stalking akun media sosial mantannya tiap tengah malam?",
      category: "Gagal Move On",
      icon: "eye"
    },
    {
      id: 8,
      text: "Siapa yang paling boros dan nggak bisa nahan godaan diskon gratis ongkir tanggal kembar di marketplace?",
      category: "Finansial Hancur",
      icon: "shopping-cart"
    },
    {
      id: 9,
      text: "Siapa yang paling sering kirim meme garing di grup tapi paling keras ketawa sendirian di voice chat?",
      category: "Humor Receh",
      icon: "laugh"
    },
    {
      id: 10,
      text: "Siapa yang paling mungkin selamat dari kiamat zombie karena sifat licik dan insting cari selamatnya?",
      category: "Survival Skill",
      icon: "shield"
    },
    {
      id: 11,
      text: "Siapa yang paling sering overthinking hal sepele jam 2 pagi sampai akhirnya nggak tidur seharian?",
      category: "Overthinking",
      icon: "cloud-drizzle"
    },
    {
      id: 12,
      text: "Siapa yang kalau main game kompetitif paling gampang tantrum, nge-rage, atau nyalahin koneksi lag?",
      category: "Gamer Rage",
      icon: "flame"
    },
    {
      id: 13,
      text: "Siapa yang paling cocok jadi politisi atau pejabat korup karena omongannya manis tapi manipulatif?",
      category: "Lidah Buaya",
      icon: "briefcase"
    },
    {
      id: 14,
      text: "Siapa yang paling mungkin jadian sama orang yang baru dikenal 3 hari di game online atau server Discord?",
      category: "Bucin Kilat",
      icon: "sparkles"
    },
    {
      id: 15,
      text: "Siapa yang punya selera musik paling random, dari lagu galau 2000-an tiba-tiba lompat ke jedag-jedug koplo?",
      category: "Playlist Random",
      icon: "music"
    },
    {
      id: 16,
      text: "Siapa yang paling mungkin lupa bawa dompet atau kartu pas udah selesai makan bareng di restoran?",
      category: "Kepikunan Akut",
      icon: "wallet"
    },
    {
      id: 17,
      text: "Siapa yang paling sering kirim Voice Note sepanjang khotbah jumat padahal intinya cuma satu kalimat?",
      category: "Bacot Mania",
      icon: "mic"
    },
    {
      id: 18,
      text: "Siapa yang paling tahan nggak mandi seharian pas hari libur dan cuma rebahan di kasur marathon series?",
      category: "Rebahan Club",
      icon: "couch"
    },
    {
      id: 19,
      text: "Siapa yang paling gampang panik waktu ada masalah sepele dan malah bikin suasana makin runyam?",
      category: "Panikan",
      icon: "zap"
    },
    {
      id: 20,
      text: "Siapa yang paling berpotensi bikin sekte sesat atau komunitas teori konspirasi absurd di masa depan?",
      category: "Konspirasi",
      icon: "skull"
    },
    {
      id: 21,
      text: "Siapa yang paling sering salah sebut nama orang atau lupa nama teman yang baru aja dikenalkan 5 menit lalu?",
      category: "Memory Lemah",
      icon: "brain"
    },
    {
      id: 22,
      text: "Siapa yang paling jago pura-pura paham pas lagi diajak ngomongin topik serius padahal otaknya kosong?",
      category: "Akting Juara",
      icon: "smile"
    },
    {
      id: 23,
      text: "Siapa yang paling mungkin ditahan polisi karena kesalahpahaman konyol yang memalukan?",
      category: "Absurd",
      icon: "siren"
    },
    {
      id: 24,
      text: "Siapa yang di media sosial kelihatan estetik dan misterius, tapi aslinya receh dan hancur banget?",
      category: "Pencitraan",
      icon: "camera"
    },
    {
      id: 25,
      text: "Siapa yang paling gampang terhasut pesen makanan online tengah malam pas lagi nggak lapar-lapar amat?",
      category: "Lapar Mata",
      icon: "pizza"
    },
    {
      id: 26,
      text: "Siapa yang paling sering curhat galau dramatis di Close Friend Instagram atau second account Twitter?",
      category: "Galau Akut",
      icon: "message-square-dashed"
    },
    {
      id: 27,
      text: "Siapa yang paling mungkin nikah duluan di antara kita semua di room ini?",
      category: "Siap Nikah",
      icon: "gem"
    },
    {
      id: 28,
      text: "Siapa yang paling sering 'read' doang chat di grup terus baru balas tiga hari kemudian tanpa rasa bersalah?",
      category: "Ghosting Grup",
      icon: "check-check"
    },
    {
      id: 29,
      text: "Siapa yang paling buta arah dan sering nyasar parah padahal aplikasi Google Maps udah nyala?",
      category: "Buta Map",
      icon: "compass"
    },
    {
      id: 30,
      text: "Siapa yang paling jago debat kusir hal nggak penting sampai urat lehernya keluar demi menang argumen?",
      category: "Debat Kusir",
      icon: "swords"
    },
    {
      id: 31,
      text: "Siapa yang paling mungkin pura-pura batuk atau pura-pura putus koneksi pas disuruh bayar uang patungan?",
      category: "Pelit detected",
      icon: "coins"
    },
    {
      id: 32,
      text: "Siapa yang punya bakat jadi detektif swasta karena jago banget stalking latar belakang orang sampai ke akar-akarnya?",
      category: "Stalker FBI",
      icon: "user-check"
    },
    {
      id: 33,
      text: "Siapa yang paling sering typo absurd pas ngetik pesan penting sampai maknanya jadi ambigu atau jorok?",
      category: "Typo Parah",
      icon: "keyboard"
    },
    {
      id: 34,
      text: "Siapa yang paling mungkin kabur keluar negeri dan ganti nama identitas kalau punya utang miliaran rupiah?",
      category: "Kabur Squad",
      icon: "plane"
    },
    {
      id: 35,
      text: "Siapa yang paling gak bisa nyimpen rahasia, baru dibilang 'jangan bilang siapa-siapa' langsung cepu ke yang lain?",
      category: "Cepu detected",
      icon: "radio"
    },
    {
      id: 36,
      text: "Siapa yang kalau nonton film horor bareng suaranya paling heboh teriak dibanding jumpscare filmnya?",
      category: "Penakut",
      icon: "ghost"
    },
    {
      id: 37,
      text: "Siapa yang paling gengsi buat minta maaf duluan kalau lagi marahan sama teman atau pasangan?",
      category: "Gengsi Tinggi",
      icon: "shield-alert"
    },
    {
      id: 38,
      text: "Siapa yang paling sering nyomot cemilan atau kentang goreng temannya tanpa izin waktu nongkrong?",
      category: "Maling Kentang",
      icon: "utensils"
    },
    {
      id: 39,
      text: "Siapa yang paling cocok ikutan audisi acara reality show kencan karena drama kehidupannya tiada akhir?",
      category: "Drama Queen",
      icon: "film"
    },
    {
      id: 40,
      text: "Siapa orang yang kehadirannya paling bikin suasana voice chat Discord selalu ramai dan nggak pernah sepi?",
      category: "Party Maker",
      icon: "party-popper"
    }
  ];

  // Local state
  let currentRoom = null;
  let currentPlayer = null;
  let localSelectedVotes = new Set();
  let isSubmitting = false;

  /**
   * Helper to retrieve voting state seamlessly from room data
   */
  function getVotingState(roomData) {
    if (!roomData) return {};
    return roomData.votingGame || roomData.gameState?.voting || {};
  }

  /**
   * Calculates maximum equal votes allowed for the room
   * Default: 3 votes. If players < 4, adjusts to Math.min(3, players - 1)
   */
  function getMaxVotes(playerCount) {
    if (playerCount <= 1) return 1; // Solo testing
    return Math.min(3, Math.max(1, playerCount - 1));
  }

  return {
    /**
     * 1. Initialize voting game state
     */
    init(roomData, player) {
      currentRoom = roomData;
      currentPlayer = player;
      UI.setTheme('voting');
      UI.Logger('VOTING', 'Initialized Voting Game View');
    },

    /**
     * 2. Hook for real-time state changes from Firebase
     */
    onStateChange(roomData) {
      currentRoom = roomData;
      const votingData = getVotingState(roomData);

      // If a new round has started, clear local selection
      const playerVoteLocked = Boolean(votingData.votes && votingData.votes[currentPlayer?.id]);
      if (!playerVoteLocked && votingData.status === 'voting' && !votingData.revealed) {
        // Keep user's active in-progress picks, or if empty, let them pick
      }

      UI.Logger('VOTING', 'State change received', {
        round: votingData.round,
        status: votingData.status,
        revealed: votingData.revealed
      });
    },

    /**
     * 3. Main Render Router: Switches between Voting Phase and Results Phase
     */
    render(containerEl, roomData, player) {
      currentRoom = roomData;
      currentPlayer = player;

      // Always enforce Mint & Emerald theme
      UI.setTheme('voting');

      const votingData = getVotingState(roomData);
      const isRevealed = Boolean(votingData.revealed || votingData.status === 'results');

      if (isRevealed) {
        this.renderResultsPhase(containerEl, roomData, player, votingData);
      } else {
        this.renderVotingPhase(containerEl, roomData, player, votingData);
      }

      UI.refreshIcons();
    },

    /**
     * ==========================================================================
     * FASE 1: MEMILIH (3 HAK SUARA SETARA - TANPA TIMER)
     * ==========================================================================
     */
    renderVotingPhase(containerEl, roomData, player, votingData) {
      const playerList = Object.values(roomData.players || {});
      const isHost = Boolean(player.isHost);
      const totalPlayers = playerList.length;

      const qIndex = (votingData.questionIndex || 0) % QUESTIONS.length;
      const currentQuestion = QUESTIONS[qIndex] || QUESTIONS[0];
      const currentRound = votingData.round || 1;

      const maxVotes = getMaxVotes(totalPlayers);
      const votesMap = votingData.votes || {};
      const myLockedVotes = votesMap[player.id];
      const hasLocked = Array.isArray(myLockedVotes) && myLockedVotes.length > 0;

      // Tally how many players have locked their votes
      const totalVotedCount = Object.keys(votesMap).length;
      const progressPercent = totalPlayers > 0 ? Math.min(100, Math.round((totalVotedCount / totalPlayers) * 100)) : 0;

      // Eligible candidate list (exclude self if multiplayer, allow self if solo testing)
      const candidates = playerList.filter(p => totalPlayers === 1 || p.id !== player.id);

      // Top Header with Room Code and Lobby return
      const topHeaderHTML = `
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div class="flex items-center gap-3">
            <button 
              onclick="App.returnToLobby()"
              class="px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-900/10 font-display font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <i data-lucide="arrow-left" class="w-4 h-4"></i>
              <span>Kembali ke Lobby</span>
            </button>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
              <h1 class="font-display font-bold text-xl sm:text-2xl text-emerald-950">Siapa di Antara Kita?</h1>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-display font-bold">
              Ronde #${currentRound}
            </span>
            <div class="flex items-center gap-1.5 bg-white/90 px-3 py-1 rounded-2xl border-2 border-emerald-500/20 text-xs font-display font-bold text-emerald-900 shadow-sm">
              <span class="text-slate-400">ROOM:</span>
              <span class="text-emerald-700 font-extrabold tracking-widest">${roomData.code}</span>
            </div>
          </div>
        </div>
      `;

      // Top Question Card using UI.Container
      const questionCardContent = `
        <div class="text-center py-2 sm:py-3">
          <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-display font-bold mb-3 shadow-xs">
            <i data-lucide="${currentQuestion.icon}" class="w-3.5 h-3.5 text-emerald-700"></i>
            <span>${currentQuestion.category} • Kartu #${qIndex + 1} dari ${QUESTIONS.length}</span>
          </div>
          <h2 class="font-display font-black text-xl sm:text-3xl text-slate-900 leading-snug tracking-tight max-w-2xl mx-auto">
            "${currentQuestion.text}"
          </h2>
          <p class="font-body text-xs sm:text-sm text-emerald-800/80 mt-2 font-medium">
            Pilih <b>${maxVotes} nama teman</b> yang paling cocok dengan pertanyaan ini! Setiap pilihan bernilai 1 suara setara.
          </p>
        </div>
      `;

      const questionContainerHTML = UI.Container({
        content: questionCardContent,
        className: 'mb-5 bg-gradient-to-b from-white to-emerald-50/40 border-emerald-500/20 shadow-joyful'
      });

      // Progress bar: "X dari Y Pemain Selesai Memilih"
      const progressBarHTML = `
        <div class="p-4 rounded-2xl bg-white border-2 border-emerald-500/20 shadow-sm mb-5">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2 text-xs font-display font-bold text-emerald-900">
              <i data-lucide="vote" class="w-4 h-4 text-emerald-600"></i>
              <span>Progres Voting Ronde Ini</span>
            </div>
            <span class="text-xs font-display font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
              ${totalVotedCount} dari ${totalPlayers} Pemain Selesai
            </span>
          </div>
          <div class="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
            <div 
              class="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"
              style="width: ${progressPercent}%;"
            ></div>
          </div>
        </div>
      `;

      // Candidate Cards Grid
      const candidateCardsHTML = candidates.map((cand, idx) => {
        const isSelected = hasLocked 
          ? (myLockedVotes && myLockedVotes.includes(cand.id))
          : localSelectedVotes.has(cand.id);

        const cardBorderClass = isSelected
          ? 'border-emerald-500 bg-emerald-50/90 ring-4 ring-emerald-500/25 shadow-md scale-102'
          : 'border-slate-900/10 bg-white hover:border-emerald-300 hover:bg-slate-50/80 shadow-sm';

        const clickAction = hasLocked 
          ? '' 
          : `onclick="VotingGame.toggleVote('${cand.id}')"`;

        return `
          <div 
            ${clickAction}
            class="p-4 sm:p-5 rounded-3xl border-2 transition-all duration-200 cursor-pointer select-none relative flex flex-col items-center text-center ${cardBorderClass}"
          >
            <!-- Checkmark Indicator -->
            <div class="absolute top-3 right-3">
              <div class="w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                isSelected 
                  ? 'bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-200 scale-110' 
                  : 'bg-slate-100 text-slate-300 border border-slate-200'
              }">
                <i data-lucide="${isSelected ? 'check' : 'circle'}" class="w-3.5 h-3.5"></i>
              </div>
            </div>

            <div class="mb-2.5">
              ${UI.Avatar({ name: cand.name, size: 'lg', isHost: cand.isHost, colorIndex: cand.colorIndex || idx })}
            </div>

            <h4 class="font-display font-bold text-base text-slate-900 truncate max-w-[150px]">
              ${cand.name}
            </h4>

            <span class="mt-1 text-[11px] font-body font-semibold ${isSelected ? 'text-emerald-700 font-bold' : 'text-slate-400'}">
              ${isSelected ? '✓ Terpilih' : 'Klik untuk Pilih'}
            </span>
          </div>
        `;
      }).join('');

      // Status Banner & Action Buttons
      const selectedCount = hasLocked ? myLockedVotes.length : localSelectedVotes.size;
      const isQuotaMet = selectedCount === maxVotes;

      let actionAreaHTML = '';

      if (hasLocked) {
        // Player already locked their votes
        const chosenNames = myLockedVotes.map(id => {
          const c = playerList.find(p => p.id === id);
          return c ? c.name : 'Teman';
        }).join(', ');

        actionAreaHTML = `
          <div class="p-4 rounded-3xl bg-emerald-50 border-2 border-emerald-500/30 text-center max-w-lg mx-auto shadow-sm">
            <div class="w-10 h-10 rounded-2xl bg-emerald-500 text-white mx-auto flex items-center justify-center mb-2 shadow-sm">
              <i data-lucide="lock" class="w-5 h-5"></i>
            </div>
            <h4 class="font-display font-bold text-base text-emerald-950">Suaramu Sudah Terkunci!</h4>
            <p class="font-body text-xs text-emerald-800 mt-1">
              Kamu memilih: <span class="font-bold font-display text-emerald-950 underline">${chosenNames}</span>
            </p>
            <p class="text-[11px] text-emerald-700/80 mt-2 flex items-center justify-center gap-1.5 font-display font-semibold">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Menunggu teman lain menyelesaikan pilihan mereka...
            </p>
          </div>
        `;
      } else {
        // Player still choosing
        actionAreaHTML = `
          <div class="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto">
            <div class="px-4 py-2 rounded-2xl bg-white border-2 border-slate-900/10 text-xs font-display font-bold text-slate-700 shadow-sm">
              Pilihan: <span class="${isQuotaMet ? 'text-emerald-600 font-extrabold text-sm' : 'text-slate-900'}">${selectedCount} / ${maxVotes} Suara</span>
            </div>

            ${UI.Button({
              text: `Kunci ${maxVotes} Pilihan 🔒`,
              onClick: 'VotingGame.submitVotes()',
              variant: 'primary',
              size: 'lg',
              disabled: !isQuotaMet,
              className: `w-full sm:w-auto font-display font-extrabold text-sm sm:text-base ${
                isQuotaMet ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30 ring-4 ring-emerald-500/20' : 'bg-slate-300'
              }`
            })}
          </div>
        `;
      }

      // Host Bypass Controls (Buka Hasil Sekarang)
      const hostBypassHTML = isHost ? `
        <div class="mt-8 pt-4 border-t border-emerald-500/15 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-1.5 text-slate-500 font-display font-semibold">
            <i data-lucide="shield" class="w-4 h-4 text-emerald-600"></i>
            <span>Panel Kontrol Host</span>
          </div>

          <div class="flex items-center gap-2">
            ${UI.Button({
              text: 'Buka Hasil Sekarang ⚡',
              onClick: 'VotingGame.revealResults()',
              variant: 'accent',
              size: 'sm',
              className: 'bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold border border-amber-500/40'
            })}
          </div>
        </div>
      ` : '';

      // Assemble full voting view
      containerEl.innerHTML = `
        <div class="w-full flex flex-col justify-between">
          ${topHeaderHTML}
          ${questionContainerHTML}
          ${progressBarHTML}

          <!-- Grid Tombol Kandidat -->
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
            ${candidateCardsHTML}
          </div>

          ${actionAreaHTML}
          ${hostBypassHTML}
        </div>
      `;
    },

    /**
     * ==========================================================================
     * FASE 2: HASIL & SIDANG INTEROGASI HOST (PODIUM & AUDIT SUARA)
     * ==========================================================================
     */
    renderResultsPhase(containerEl, roomData, player, votingData) {
      const playerList = Object.values(roomData.players || {});
      const isHost = Boolean(player.isHost);
      const qIndex = (votingData.questionIndex || 0) % QUESTIONS.length;
      const currentQuestion = QUESTIONS[qIndex] || QUESTIONS[0];
      const currentRound = votingData.round || 1;

      // 1. Calculate vote tallies & audit trail: who voted for whom
      const candidateStats = {};
      playerList.forEach(p => {
        candidateStats[p.id] = {
          player: p,
          count: 0,
          voters: [] // [{ id, name }]
        };
      });

      const votesMap = votingData.votes || {};
      Object.entries(votesMap).forEach(([voterId, chosenArray]) => {
        const voterObj = roomData.players?.[voterId];
        const voterName = voterObj ? voterObj.name : 'Anonim';

        if (Array.isArray(chosenArray)) {
          chosenArray.forEach(targetId => {
            if (candidateStats[targetId]) {
              candidateStats[targetId].count += 1;
              candidateStats[targetId].voters.push({
                id: voterId,
                name: voterName
              });
            }
          });
        }
      });

      // Sort descending by vote count
      const rankedCandidates = Object.values(candidateStats).sort((a, b) => b.count - a.count);
      const winner = rankedCandidates[0];

      // Top Header
      const topHeaderHTML = `
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div class="flex items-center gap-3">
            <button 
              onclick="App.returnToLobby()"
              class="px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-900/10 font-display font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <i data-lucide="arrow-left" class="w-4 h-4"></i>
              <span>Kembali ke Lobby</span>
            </button>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
              <h1 class="font-display font-bold text-xl sm:text-2xl text-slate-900">Hasil Sidang Suara ⚖️</h1>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-display font-bold">
              Hasil Ronde #${currentRound}
            </span>
            <div class="flex items-center gap-1.5 bg-white/90 px-3 py-1 rounded-2xl border-2 border-emerald-500/20 text-xs font-display font-bold text-emerald-900 shadow-sm">
              <span class="text-slate-400">ROOM:</span>
              <span class="text-emerald-700 font-extrabold tracking-widest">${roomData.code}</span>
            </div>
          </div>
        </div>
      `;

      // Question summary pill
      const questionSummaryHTML = `
        <div class="p-4 rounded-3xl bg-white border-2 border-emerald-500/20 shadow-joyful text-center mb-6">
          <span class="text-[11px] font-display font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Pertanyaan yang Divoting
          </span>
          <p class="font-display font-bold text-lg sm:text-2xl text-slate-800 mt-1.5">
            "${currentQuestion.text}"
          </p>
        </div>
      `;

      // Host Interrogation Prompt Box
      const interrogationGuideHTML = `
        <div class="p-4 rounded-3xl bg-gradient-to-r from-amber-500/15 via-yellow-400/15 to-emerald-500/15 border-2 border-amber-400/40 shadow-sm mb-6 flex items-start gap-3.5">
          <div class="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 font-bold text-xl shadow">
            🎤
          </div>
          <div class="flex-1">
            <h4 class="font-display font-extrabold text-sm text-slate-900">
              Sidang Interogasi Voice Chat Discord
            </h4>
            <p class="font-body text-xs sm:text-sm text-slate-700 mt-0.5 leading-relaxed">
              Host berhak menunjuk para pemilih di bawah untuk menjelaskan: 
              <i>"Kenapa kalian serempak menuduh <span class="font-bold font-display text-emerald-800">${winner?.player?.name || 'orang ini'}</span> untuk pertanyaan ini?"</i>
            </p>
          </div>
        </div>
      `;

      // Ranked Candidates List (Audit & Interogasi)
      const rankedCardsHTML = rankedCandidates.map((entry, index) => {
        const rank = index + 1;
        const cand = entry.player;
        const voteCount = entry.count;
        const voters = entry.voters;

        // Rank styling (Podium 1, 2, 3)
        let rankBadge = '';
        let cardBgClass = 'bg-white border-slate-900/10';

        if (rank === 1 && voteCount > 0) {
          rankBadge = `
            <span class="px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-display font-extrabold text-xs shadow-sm flex items-center gap-1 border border-amber-500/40">
              👑 Peringkat 1 (Tersangka Utama)
            </span>
          `;
          cardBgClass = 'bg-gradient-to-r from-amber-50/60 to-yellow-50/40 border-amber-400/50 shadow-md ring-2 ring-amber-400/20';
        } else if (rank === 2 && voteCount > 0) {
          rankBadge = `
            <span class="px-3 py-1 rounded-full bg-slate-200 text-slate-800 font-display font-bold text-xs border border-slate-300">
              🥈 Peringkat 2
            </span>
          `;
          cardBgClass = 'bg-white border-slate-300';
        } else if (rank === 3 && voteCount > 0) {
          rankBadge = `
            <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-display font-bold text-xs border border-amber-200">
              🥉 Peringkat 3
            </span>
          `;
          cardBgClass = 'bg-white border-slate-200';
        } else {
          rankBadge = `
            <span class="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-display font-semibold text-xs">
              #${rank}
            </span>
          `;
        }

        // Voters Pill Badges (FITUR INTEROGASI)
        const votersPillsHTML = voters.length > 0 ? voters.map(v => `
          <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-display font-bold border border-emerald-300 shadow-xs flex items-center gap-1">
            <i data-lucide="check" class="w-3 h-3 text-emerald-600"></i>
            <span>${v.name}</span>
          </span>
        `).join('') : '<span class="text-xs italic text-slate-400 font-body">Tidak ada yang memilih (Selamat, kamu aman!)</span>';

        return `
          <div class="p-5 rounded-3xl border-2 transition-all shadow-sm ${cardBgClass}">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-900/5 pb-3 mb-3">
              <div class="flex items-center gap-3">
                ${UI.Avatar({ name: cand.name, size: 'md', isHost: cand.isHost, colorIndex: cand.colorIndex || index })}
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="font-display font-bold text-base sm:text-lg text-slate-900">${cand.name}</h3>
                    ${cand.id === currentPlayer.id ? '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">KAMU</span>' : ''}
                  </div>
                  <div class="mt-0.5">${rankBadge}</div>
                </div>
              </div>

              <!-- Vote Count Pill -->
              <div class="flex items-center gap-1.5 px-4 py-1.5 rounded-2xl bg-emerald-600 text-white font-display font-black text-sm sm:text-base shadow-sm">
                <span>${voteCount}</span>
                <span class="text-xs font-semibold opacity-90">Suara</span>
              </div>
            </div>

            <!-- Audit: Dipilih Oleh Siapa -->
            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 pt-1">
              <span class="text-xs font-display font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <i data-lucide="users" class="w-3.5 h-3.5 text-slate-400"></i>
                <span>Dipilih oleh:</span>
              </span>
              <div class="flex flex-wrap items-center gap-1.5">
                ${votersPillsHTML}
              </div>
            </div>
          </div>
        `;
      }).join('');

      // Bottom Host Controls for Next Round
      const hostControlsHTML = isHost ? `
        <div class="flex flex-wrap items-center justify-center gap-3 mt-8">
          ${UI.Button({
            text: 'Pertanyaan Berikutnya ➡️',
            onClick: 'VotingGame.nextRound()',
            variant: 'primary',
            size: 'lg',
            className: 'bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-base shadow-lg shadow-emerald-600/30'
          })}

          ${UI.Button({
            text: 'Ulang Pertanyaan Ini 🔄',
            onClick: 'VotingGame.restartRound()',
            variant: 'secondary',
            size: 'md',
            className: 'bg-white hover:bg-slate-100 text-slate-800 border-2 border-slate-900/10'
          })}

          ${UI.Button({
            text: 'Kembali ke Lobby 🏠',
            onClick: 'App.returnToLobby()',
            variant: 'outline',
            size: 'md',
            className: 'bg-white hover:bg-slate-50 text-slate-700'
          })}
        </div>
      ` : `
        <div class="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-200 text-center max-w-md mx-auto mt-8">
          <p class="font-display font-bold text-sm text-emerald-950 flex items-center justify-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            Menunggu Host melanjutkan ke pertanyaan berikutnya...
          </p>
        </div>
      `;

      // Assemble full results view
      containerEl.innerHTML = `
        <div class="w-full flex flex-col justify-between">
          ${topHeaderHTML}
          ${questionSummaryHTML}
          ${interrogationGuideHTML}

          <div class="space-y-3.5 mb-6">
            ${rankedCardsHTML}
          </div>

          ${hostControlsHTML}
        </div>
      `;
    },

    /**
     * Toggle selection of a candidate
     */
    toggleVote(candidateId) {
      if (!currentRoom || !currentPlayer) return;

      const playerList = Object.values(currentRoom.players || {});
      const maxVotes = getMaxVotes(playerList.length);

      if (localSelectedVotes.has(candidateId)) {
        localSelectedVotes.delete(candidateId);
        UI.Sound.click();
      } else {
        if (localSelectedVotes.size >= maxVotes) {
          UI.Toast(`Kamu sudah memilih ${maxVotes} teman! Batalkan pilihan lain jika ingin mengganti.`, 'warning');
          return;
        }
        localSelectedVotes.add(candidateId);
        UI.Sound.pop();
      }

      // Fast re-render
      const appEl = document.getElementById('app');
      if (appEl) {
        this.render(appEl, currentRoom, currentPlayer);
      }
    },

    /**
     * Submit and lock 3 choices
     */
    async submitVotes() {
      if (!currentRoom || !currentPlayer || isSubmitting) return;

      const playerList = Object.values(currentRoom.players || {});
      const maxVotes = getMaxVotes(playerList.length);

      if (localSelectedVotes.size !== maxVotes) {
        UI.Toast(`Pilihlah tepat ${maxVotes} nama teman sebelum mengunci!`, 'warning');
        return;
      }

      isSubmitting = true;
      UI.Sound.pop();

      try {
        const votingData = getVotingState(currentRoom);
        const choices = Array.from(localSelectedVotes);

        // Atomically write vote specifically to rooms/{roomCode}/votingGame/votes/{myPlayerId}
        if (typeof DB.submitVotingChoice === 'function') {
          await DB.submitVotingChoice(currentRoom.code, currentPlayer.id, choices);
        } else {
          await DB.updateGameState(currentRoom.code, 'voting', {
            [`votes/${currentPlayer.id}`]: choices
          });
        }

        const currentVotes = votingData.votes || {};
        const updatedVotes = {
          ...currentVotes,
          [currentPlayer.id]: choices
        };

        // Check if all players in room have completed voting
        const allVoted = playerList.length > 0 && playerList.every(p => updatedVotes[p.id]);

        if (allVoted) {
          await DB.updateGameState(currentRoom.code, 'voting', {
            status: 'results',
            revealed: true
          });
        }

        UI.Sound.fanfare();
        UI.Toast('Pilihanmu berhasil dikunci! 🔒', 'success');

        if (allVoted) {
          UI.Confetti();
        }
      } catch (err) {
        UI.Logger('VOTING', 'Error submitting votes', err, true);
        UI.Toast('Gagal mengirim suara: ' + err.message, 'error');
      } finally {
        isSubmitting = false;
      }
    },

    /**
     * Host bypass to reveal results
     */
    async revealResults() {
      if (!currentRoom || !currentPlayer?.isHost) return;

      UI.Sound.fanfare();
      UI.Confetti();
      UI.Logger('VOTING', 'Host manually revealed voting results');

      await DB.updateGameState(currentRoom.code, 'voting', {
        status: 'results',
        revealed: true
      });
    },

    /**
     * Host advances to the next round
     */
    async nextRound() {
      if (!currentRoom || !currentPlayer?.isHost) return;

      const votingData = getVotingState(currentRoom);
      const nextIndex = ((votingData.questionIndex || 0) + 1) % QUESTIONS.length;
      const nextRoundNum = (votingData.round || 1) + 1;

      localSelectedVotes.clear();
      UI.Sound.click();
      UI.Logger('VOTING', `Advancing to Round ${nextRoundNum}, Question #${nextIndex + 1}`);

      await DB.updateGameState(currentRoom.code, 'voting', {
        questionIndex: nextIndex,
        votes: {},
        status: 'voting',
        revealed: false,
        round: nextRoundNum
      });

      UI.Toast('Ronde baru dimulai! Bersiap memilih...', 'info');
    },

    /**
     * Host restarts the current question
     */
    async restartRound() {
      if (!currentRoom || !currentPlayer?.isHost) return;

      localSelectedVotes.clear();
      UI.Sound.click();

      await DB.updateGameState(currentRoom.code, 'voting', {
        votes: {},
        status: 'voting',
        revealed: false
      });

      UI.Toast('Pertanyaan diulang kembali.', 'info');
    },

    /**
     * Reset and cleanup when navigating away
     */
    cleanup() {
      localSelectedVotes.clear();
      isSubmitting = false;
      UI.Logger('VOTING', 'Cleaned up VotingGame state');
    }
  };
})();
