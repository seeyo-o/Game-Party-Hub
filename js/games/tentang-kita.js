/**
 * ==========================================================================
 * DISCORD PARTY HUB - GAME 1: "TENTANG KITA"
 * ==========================================================================
 * Permainan kartu deep talk, persepsi, dilema moral, dan tantangan seru
 * bernuansa hangat (Terracotta Rose & Amber) dengan 3D Flip Card & Roulette Penjawab.
 * 
 * Didukung 175 kartu lengkap (Level 1, Level 2, Level 3, Wildcard)
 * dengan pengacakan Fisher-Yates Shuffle tanpa blokir permanen.
 */

const TentangKitaGame = (function () {
  'use strict';

  // Retrieve full deck from external data file (tentang-kita-data.js)
  function getCards() {
    if (typeof window !== 'undefined' && window.TENTANG_KITA_CARDS && window.TENTANG_KITA_CARDS.length > 0) {
      return window.TENTANG_KITA_CARDS;
    }
    if (typeof TENTANG_KITA_CARDS !== 'undefined' && Array.isArray(TENTANG_KITA_CARDS)) {
      return TENTANG_KITA_CARDS;
    }
    return [];
  }

  // Fisher-Yates Shuffle Algorithm for unbiased random distribution
  function fisherYatesShuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // Local state
  let currentRoom = null;
  let currentPlayer = null;
  let isSpinningLocal = false;

  const LEVEL_FILTERS = [
    { key: 'all', label: 'Semua Kartu (175)', icon: 'layers' },
    { key: 'level-1', label: 'Level 1: Persepsi (45)', icon: 'smile' },
    { key: 'level-2', label: 'Level 2: Deep Talk (45)', icon: 'heart' },
    { key: 'level-3', label: 'Level 3: Dilema (45)', icon: 'scale' },
    { key: 'wildcard', label: 'Wildcard: Tantangan (40)', icon: 'flame' }
  ];

  function getFilteredCards(levelKey) {
    const pool = getCards();
    if (!levelKey || levelKey === 'all') return pool;
    return pool.filter(c => c.level === levelKey);
  }

  return {
    getCards,
    getFilteredCards,
    fisherYatesShuffle,

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

      const allCards = getCards();
      const gameState = roomData.gameState?.tentangKita || {
        cardIndex: 0,
        level: 'all',
        isFlipped: false,
        selectedAnswerer: null
      };

      const currentLevel = gameState.level || 'all';
      const filtered = getFilteredCards(currentLevel);

      // Determine active card from Fisher-Yates shuffled list or fallback safely
      let shuffledIds = (Array.isArray(gameState.shuffledIds) && gameState.shuffledIds.length > 0)
        ? gameState.shuffledIds
        : null;

      // If shuffledIds doesn't match the current filter count, Host initializes fresh shuffle
      if (!shuffledIds || shuffledIds.length !== filtered.length) {
        shuffledIds = filtered.map(c => c.id);
        if (player.isHost && filtered.length > 0) {
          const freshShuffled = fisherYatesShuffle(shuffledIds);
          DB.updateGameState(roomData.code, 'tentangKita', {
            shuffledIds: freshShuffled,
            orderIndex: 0,
            cardId: freshShuffled[0],
            cardIndex: 0
          });
          shuffledIds = freshShuffled;
        }
      }

      let orderIndex = (typeof gameState.orderIndex === 'number')
        ? gameState.orderIndex
        : (typeof gameState.cardIndex === 'number' ? gameState.cardIndex : 0);

      if (orderIndex < 0) orderIndex = 0;
      if (orderIndex >= filtered.length) orderIndex = 0;

      const currentCardId = gameState.cardId || (shuffledIds ? shuffledIds[orderIndex] : filtered[orderIndex]?.id);
      const activeCard = allCards.find(c => c.id === currentCardId) || filtered[orderIndex] || filtered[0] || allCards[0] || {
        id: 1,
        level: 'level-1',
        levelName: 'Level 1: Persepsi',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
        question: 'Memuat kartu Tentang Kita...',
        prompt: 'Silakan tunggu sebentar...'
      };

      const isFlipped = Boolean(gameState.isFlipped);
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
                <span class="text-xs font-display font-medium text-white/80">Kartu #${orderIndex + 1} dari ${filtered.length}</span>
              </div>

              <div class="text-center my-auto py-6">
                <div class="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center border-2 border-white/40 shadow-inner animate-float">
                  <i data-lucide="help-circle" class="w-8 h-8 sm:w-10 sm:h-10 text-white"></i>
                </div>
                <h3 class="font-display font-bold text-2xl sm:text-3xl tracking-wide text-white drop-shadow-sm">Tentang Kita</h3>
                <p class="font-body text-xs sm:text-sm text-white/90 mt-2 max-w-xs mx-auto">Klik kartu untuk membuka pertanyaan & mulai obrolan hangat!</p>
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
                <span class="text-xs font-bold font-display text-slate-400">#${activeCard.id} (${orderIndex + 1}/${filtered.length})</span>
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
              class="px-3.5 py-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 border-2 border-slate-900/10 font-display font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all active:scale-95 shadow-sm cursor-pointer"
            >
              <i data-lucide="arrow-left" class="w-4 h-4"></i>
              <span>Kembali ke Lobby</span>
            </button>
            <button 
              onclick="App.leaveCurrentGame()" 
              class="px-3.5 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-display font-bold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-2xs"
              title="Keluar dari Permainan"
            >
              <i data-lucide="log-out" class="w-4 h-4 text-rose-600"></i>
              <span>Keluar Game 🚪</span>
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
            class="text-xs text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-white/60 cursor-pointer"
            title="Reset giliran"
          >
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>
      ` : '';

      // Bottom Control Buttons (Responsive with Skip & Next)
      const controlsHTML = `
        <div class="flex flex-col items-center gap-3 mt-6">
          <!-- Primary Actions -->
          <div class="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
            ${UI.Button({
              text: 'Spin Penjawab 🎲',
              onClick: 'TentangKitaGame.spinAnswerer()',
              variant: 'accent',
              size: 'lg',
              className: 'bg-amber-400 hover:bg-amber-500 text-amber-950 font-display font-black text-sm sm:text-base border-2 border-amber-500/40 shadow-sm'
            })}

            ${UI.Button({
              text: isFlipped ? 'Tutup Kartu 🔄' : 'Balik Kartu 🔄',
              onClick: 'TentangKitaGame.toggleFlip()',
              variant: 'secondary',
              size: 'md',
              className: 'bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-900/15 font-display font-bold'
            })}

            ${UI.Button({
              icon: 'fast-forward',
              text: '⏭️ Skip / Ganti Pertanyaan',
              onClick: 'TentangKitaGame.skipCard()',
              variant: 'outline',
              size: 'md',
              className: 'bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border-2 border-rose-300 font-display font-bold active:scale-95 transition-all shadow-xs'
            })}

            ${UI.Button({
              iconRight: 'arrow-right',
              text: '➡️ Pertanyaan Berikutnya',
              onClick: 'TentangKitaGame.nextCard()',
              variant: 'primary',
              size: 'lg',
              className: 'bg-rose-600 hover:bg-rose-700 text-white font-display font-black shadow-md shadow-rose-600/30 active:scale-95 transition-all'
            })}
          </div>

          <!-- Secondary Navigation & Reshuffle -->
          <div class="flex items-center justify-center gap-2 pt-1">
            ${UI.Button({
              icon: 'chevron-left',
              text: 'Sebelumnya',
              onClick: 'TentangKitaGame.prevCard()',
              variant: 'outline',
              size: 'sm',
              disabled: orderIndex === 0,
              className: 'bg-white text-slate-700 text-xs font-display'
            })}

            ${UI.Button({
              icon: 'shuffle',
              text: 'Kocok Ulang Deck',
              onClick: 'TentangKitaGame.shuffleDeck()',
              variant: 'outline',
              size: 'sm',
              className: 'bg-white text-slate-700 text-xs font-display'
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
     * Change active level filter & reset to fresh Fisher-Yates shuffle
     */
    async setLevel(levelKey) {
      if (!currentRoom) return;
      UI.Sound.click();
      UI.Logger('TENTANG-KITA', 'Filter Changed', levelKey);

      const filtered = getFilteredCards(levelKey);
      const shuffledIds = fisherYatesShuffle(filtered.map(c => c.id));

      await DB.updateGameState(currentRoom.code, 'tentangKita', {
        level: levelKey,
        shuffledIds: shuffledIds,
        orderIndex: 0,
        cardId: shuffledIds[0],
        cardIndex: 0,
        isFlipped: false,
        selectedAnswerer: null
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
     * Next card in the Fisher-Yates shuffled sequence
     */
    async nextCard() {
      if (!currentRoom) return;
      UI.Sound.click();

      const gameState = currentRoom.gameState?.tentangKita || {};
      const currentLevel = gameState.level || 'all';
      const filtered = getFilteredCards(currentLevel);
      let shuffledIds = (Array.isArray(gameState.shuffledIds) && gameState.shuffledIds.length > 0)
        ? [...gameState.shuffledIds]
        : fisherYatesShuffle(filtered.map(c => c.id));
      let orderIndex = (typeof gameState.orderIndex === 'number') ? gameState.orderIndex : 0;

      let nextIndex = orderIndex + 1;
      // Reshuffle seamlessly when all cards in this category have been shown
      if (nextIndex >= shuffledIds.length) {
        shuffledIds = fisherYatesShuffle(filtered.map(c => c.id));
        nextIndex = 0;
        UI.Toast('🔀 Semua kartu di level ini sudah terbuka! Mengocok ulang tumpukan...', 'info', 2500);
      }

      const nextCardId = shuffledIds[nextIndex];
      await DB.updateGameState(currentRoom.code, 'tentangKita', {
        shuffledIds: shuffledIds,
        orderIndex: nextIndex,
        cardId: nextCardId,
        cardIndex: nextIndex,
        isFlipped: false,
        selectedAnswerer: null
      });
    },

    /**
     * Skip / Ganti Pertanyaan: skips to next card without delay
     */
    async skipCard() {
      if (!currentRoom) return;
      UI.Sound.pop();

      const gameState = currentRoom.gameState?.tentangKita || {};
      const currentLevel = gameState.level || 'all';
      const filtered = getFilteredCards(currentLevel);
      let shuffledIds = (Array.isArray(gameState.shuffledIds) && gameState.shuffledIds.length > 0)
        ? [...gameState.shuffledIds]
        : fisherYatesShuffle(filtered.map(c => c.id));
      let orderIndex = (typeof gameState.orderIndex === 'number') ? gameState.orderIndex : 0;

      let nextIndex = orderIndex + 1;
      if (nextIndex >= shuffledIds.length) {
        shuffledIds = fisherYatesShuffle(filtered.map(c => c.id));
        nextIndex = 0;
      }

      const nextCardId = shuffledIds[nextIndex];
      UI.Toast('⏭️ Pertanyaan di-skip! Mengambil kartu acak berikutnya...', 'info', 1800);

      await DB.updateGameState(currentRoom.code, 'tentangKita', {
        shuffledIds: shuffledIds,
        orderIndex: nextIndex,
        cardId: nextCardId,
        cardIndex: nextIndex,
        isFlipped: false,
        selectedAnswerer: null
      });
    },

    /**
     * Previous card in the sequence
     */
    async prevCard() {
      if (!currentRoom) return;
      UI.Sound.click();

      const gameState = currentRoom.gameState?.tentangKita || {};
      const currentLevel = gameState.level || 'all';
      const filtered = getFilteredCards(currentLevel);
      const shuffledIds = (Array.isArray(gameState.shuffledIds) && gameState.shuffledIds.length > 0)
        ? gameState.shuffledIds
        : filtered.map(c => c.id);
      const orderIndex = (typeof gameState.orderIndex === 'number') ? gameState.orderIndex : 0;

      if (orderIndex > 0) {
        const prevIndex = orderIndex - 1;
        const prevCardId = shuffledIds[prevIndex];
        await DB.updateGameState(currentRoom.code, 'tentangKita', {
          orderIndex: prevIndex,
          cardId: prevCardId,
          cardIndex: prevIndex,
          isFlipped: false
        });
      }
    },

    /**
     * Reshuffle deck with Fisher-Yates and reset index
     */
    async shuffleDeck() {
      if (!currentRoom) return;
      UI.Sound.click();

      const gameState = currentRoom.gameState?.tentangKita || {};
      const currentLevel = gameState.level || 'all';
      const filtered = getFilteredCards(currentLevel);
      const newOrder = fisherYatesShuffle(filtered.map(c => c.id));

      UI.Toast('🔀 Tumpukan kartu berhasil dikocok ulang secara acak!', 'success', 2000);

      await DB.updateGameState(currentRoom.code, 'tentangKita', {
        shuffledIds: newOrder,
        orderIndex: 0,
        cardId: newOrder[0],
        cardIndex: 0,
        isFlipped: false,
        selectedAnswerer: null
      });
    },

    /**
     * Alias for backward compatibility
     */
    randomCard() {
      return this.shuffleDeck();
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
    },

    /**
     * Reset and cleanup when navigating away
     */
    cleanup() {
      isSpinningLocal = false;
      UI.Logger('TENTANG-KITA', 'Cleaned up TentangKitaGame state');
    }
  };
})();

// Export for testing environments if available
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TentangKitaGame;
}
