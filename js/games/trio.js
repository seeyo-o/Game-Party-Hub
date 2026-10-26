/**
 * ==========================================================================
 * DISCORD PARTY HUB - GAME 8: "TRIO (DEDUKSI MEMORI 3 KARTU KEMBAR)"
 * ==========================================================================
 * 100% Mengikuti Aturan Resmi Card Game Trio:
 * - 36 Kartu: Angka 1 sampai 12, masing-masing berjumlah 3 lembar
 * - Pembagian kartu resmi:
 *   * 3 Pemain: 9 kartu tangan, 9 kartu tertutup di Meja Tengah
 *   * 4 Pemain: 7 kartu tangan, 8 kartu tertutup di Meja Tengah
 *   * 5 Pemain: 6 kartu tangan, 6 kartu tertutup di Meja Tengah
 *   * 6 Pemain: 5 kartu tangan, 6 kartu tertutup di Meja Tengah
 * - ATURAN WAJIB PENGURUTAN: Kartu di tangan selalu otomatis terurut dari Terkecil (kiri) ke Terbesar (kanan)
 * - Pemain aktif membuka kartu bertahap (Langkah 1, 2, 3) dari Meja atau Ujung Tangan (Terkecil/Terbesar)
 * - Mismatch dijeda 3,5 detik agar pemain dapat menghafal posisi kartu
 * - Dua Mode Kemenangan Resmi:
 *   * Mode Simple: 3 Set Trio APA SAJA, ATAU Trio 7 (7-7-7)
 *   * Mode Spicy: Trio 7 (7-7-7), ATAU 2 Trio yang terhubung ke 7 (jumlah/selisih = 7)
 *
 * Terhubung ke Firebase Realtime Database: rooms/{roomCode}/trioGame
 * ==========================================================================
 */

const TrioGame = (function () {
  'use strict';

  // Module Local State
  let currentRoom = null;
  let currentPlayer = null;
  let isSubmitting = false;
  let mismatchTimer = null;

  // Metadata Visual untuk Angka 1 sampai 12
  const NUMBER_META = {
    1:  { bg: 'bg-teal-500',    border: 'border-teal-400',    text: 'text-white', badge: 'bg-teal-100 text-teal-800', emoji: '🌱' },
    2:  { bg: 'bg-emerald-500', border: 'border-emerald-400', text: 'text-white', badge: 'bg-emerald-100 text-emerald-800', emoji: '🌿' },
    3:  { bg: 'bg-lime-600',    border: 'border-lime-500',    text: 'text-white', badge: 'bg-lime-100 text-lime-800', emoji: '🍃' },
    4:  { bg: 'bg-amber-500',   border: 'border-amber-400',   text: 'text-white', badge: 'bg-amber-100 text-amber-800', emoji: '☀️' },
    5:  { bg: 'bg-orange-500',  border: 'border-orange-400',  text: 'text-white', badge: 'bg-orange-100 text-orange-800', emoji: '🔥' },
    6:  { bg: 'bg-rose-500',    border: 'border-rose-400',    text: 'text-white', badge: 'bg-rose-100 text-rose-800', emoji: '🌸' },
    7:  { bg: 'bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500', border: 'border-yellow-300', text: 'text-amber-950 font-black', badge: 'bg-yellow-200 text-amber-900 border-yellow-400 font-black', emoji: '👑', isGold: true },
    8:  { bg: 'bg-pink-500',    border: 'border-pink-400',    text: 'text-white', badge: 'bg-pink-100 text-pink-800', emoji: '🍧' },
    9:  { bg: 'bg-purple-600',  border: 'border-purple-500',  text: 'text-white', badge: 'bg-purple-100 text-purple-800', emoji: '🍇' },
    10: { bg: 'bg-indigo-600',  border: 'border-indigo-500',  text: 'text-white', badge: 'bg-indigo-100 text-indigo-800', emoji: '🌊' },
    11: { bg: 'bg-sky-600',     border: 'border-sky-500',     text: 'text-white', badge: 'bg-sky-100 text-sky-800', emoji: '💎' },
    12: { bg: 'bg-fuchsia-600', border: 'border-fuchsia-500', text: 'text-white', badge: 'bg-fuchsia-100 text-fuchsia-800', emoji: '✨' }
  };

  /**
   * Helper: Mengambil state permainan Trio dari roomData dengan normalisasi default
   */
  function getGameState(roomData) {
    if (!roomData) return {};
    const state = roomData.trioGame || roomData.gameState?.trio || {};
    if (!Array.isArray(state.revealedSteps)) state.revealedSteps = [];
    if (!Array.isArray(state.tableCards)) state.tableCards = [];
    if (!Array.isArray(state.turnOrder)) state.turnOrder = [];
    if (!Array.isArray(state.actionLogs)) state.actionLogs = [];
    if (!state.players || typeof state.players !== 'object') state.players = {};
    Object.values(state.players).forEach(p => {
      if (p) {
        if (!Array.isArray(p.hand)) p.hand = [];
        if (!Array.isArray(p.triosWon)) p.triosWon = [];
      }
    });
    return state;
  }

  /**
   * Acak array (Fisher-Yates Shuffle)
   */
  function shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * 1. MEMBUAT DEK RESMI TRIO (36 KARTU: 1-12 @ 3 LEMBAR)
   */
  function generateTrioDeck() {
    const deck = [];
    for (let num = 1; num <= 12; num++) {
      for (let copy = 1; copy <= 3; copy++) {
        deck.push({
          id: `trio_${num}_${copy}_${Math.random().toString(36).substr(2, 4)}`,
          number: num,
          copyIndex: copy
        });
      }
    }
    return shuffle(deck);
  }

  /**
   * Urutkan kartu tangan dari terkecil (kiri) ke terbesar (kanan)
   */
  function sortHand(hand) {
    return [...hand].sort((a, b) => a.number - b.number);
  }

  /**
   * Konfigurasi Pembagian Kartu Berdasarkan Jumlah Pemain
   */
  function getDealingConfig(playerCount) {
    switch (playerCount) {
      case 3: return { handSize: 9, tableSize: 9 };
      case 4: return { handSize: 7, tableSize: 8 };
      case 5: return { handSize: 6, tableSize: 6 };
      case 6: return { handSize: 5, tableSize: 6 };
      default: return { handSize: 7, tableSize: 8 };
    }
  }

  /**
   * 2. INISIALISASI PERMAINAN OLEH HOST
   */
  async function startGame(customWinMode) {
    if (!currentRoom || !currentPlayer || !currentPlayer.isHost || isSubmitting) return;

    const playersList = Object.values(currentRoom.players || {});
    if (playersList.length < 3) {
      UI.Toast('Minimal 3 pemain diperlukan untuk memainkan Trio!', 'warning');
      return;
    }

    if (playersList.length > 6) {
      UI.Toast('Maksimal 6 pemain untuk memainkan Trio!', 'warning');
      return;
    }

    isSubmitting = true;
    try {
      UI.Sound.fanfare();

      const winMode = customWinMode || currentRoom.trioGame?.winMode || 'simple';
      const config = getDealingConfig(playersList.length);

      UI.Logger('TRIO', `Starting game. Players: ${playersList.length}, Mode: ${winMode}`);

      // Acak dek 36 kartu
      const rawDeck = generateTrioDeck();

      // Bagikan kartu tangan ke setiap pemain (diurutkan otomatis dari terkecil ke terbesar)
      const playersData = {};
      const turnOrder = shuffle(playersList.map(p => p.id));

      turnOrder.forEach(pid => {
        const p = currentRoom.players[pid];
        const unSortedHand = rawDeck.splice(0, config.handSize);
        playersData[pid] = {
          id: pid,
          name: p.name,
          hand: sortHand(unSortedHand),
          triosWon: [] // Array angka trio yang berhasil dikoleksi, misal [4, 7]
        };
      });

      // Sisa kartu diletakkan tertutup di Meja Tengah
      const tableCards = rawDeck.map((card, idx) => ({
        ...card,
        tableIndex: idx,
        isRevealed: false
      }));

      const initialGameState = {
        status: 'playing', // 'playing' | 'mismatch_pause' | 'game_over'
        winMode: winMode, // 'simple' | 'spicy'
        turnOrder: turnOrder,
        turnIndex: 0,
        currentTurnPlayerId: turnOrder[0],
        players: playersData,
        tableCards: tableCards,
        revealedSteps: [], // Kartu yang sedang dibuka pada giliran aktif [stepEntry, stepEntry, ...]
        mismatchData: null,
        winnerPlayerId: null,
        winReason: null,
        actionLogs: [
          {
            text: `🃏 Permainan Trio dimulai dalam [Mode ${winMode === 'spicy' ? 'Spicy / Picante' : 'Simple'}]! Meja Tengah memiliki ${tableCards.length} kartu tertutup. Giliran pertama: [${playersData[turnOrder[0]].name}].`,
            timestamp: Date.now()
          }
        ]
      };

      await DB.updateGameState(currentRoom.code, 'trio', initialGameState);
    } catch (err) {
      UI.Logger('TRIO', 'Error starting game:', err, true);
      UI.Toast('Gagal memulai permainan Trio: ' + (err.message || err), 'error');
    } finally {
      isSubmitting = false;
    }
  }

  /**
   * Ganti Mode Kemenangan (Host Only, sebelum mulai)
   */
  async function setWinMode(mode) {
    if (!currentRoom || !currentPlayer?.isHost || isSubmitting) return;
    isSubmitting = true;
    try {
      UI.Sound.click();
      await DB.updateGameState(currentRoom.code, 'trio', { winMode: mode });
    } catch (err) {
      UI.Logger('TRIO', 'Error setting win mode:', err, true);
    } finally {
      isSubmitting = false;
    }
  }

  /**
   * Cek Apakah Pemain Memenuhi Syarat Kemenangan
   * @param {Array<number>} triosWon - Array angka set trio yang dimenangkan, misal [7] atau [1, 6]
   * @param {string} winMode - 'simple' | 'spicy'
   */
  function checkVictoryCondition(triosWon, winMode) {
    if (!triosWon || triosWon.length === 0) return { won: false };

    // Aturan Universal: Trio Angka 7 (7 - 7 - 7) selalu MENANG SEKETIKA di kedua mode!
    if (triosWon.includes(7)) {
      return {
        won: true,
        reason: 'golden_seven',
        message: 'meraih Trio Angka Emas 7 (7 - 7 - 7)! Kemenangan Mutlak!'
      };
    }

    // MODE SIMPLE: Menang jika mengumpulkan 3 Set Trio apa saja
    if (winMode === 'simple') {
      if (triosWon.length >= 3) {
        return {
          won: true,
          reason: 'three_trios',
          message: 'berhasil mengumpulkan 3 Set Trio!'
        };
      }
    }

    // MODE SPICY / PICANTE: Menang jika mengumpulkan 2 Trio yang Saling Terhubung ke 7
    // Yaitu dua angka A & B di mana: A + B = 7 ATAU |A - B| = 7
    if (winMode === 'spicy') {
      for (let i = 0; i < triosWon.length; i++) {
        for (let j = i + 1; j < triosWon.length; j++) {
          const a = triosWon[i];
          const b = triosWon[j];

          if (a + b === 7) {
            return {
              won: true,
              reason: 'spicy_sum',
              pair: [a, b],
              message: `berhasil mengumpulkan 2 Trio Terhubung ke 7 (${a} + ${b} = 7)!`
            };
          }

          if (Math.abs(a - b) === 7) {
            return {
              won: true,
              reason: 'spicy_diff',
              pair: [a, b],
              message: `berhasil mengumpulkan 2 Trio Terhubung ke 7 (|${a} - ${b}| = 7)!`
            };
          }
        }
      }
    }

    return { won: false };
  }

  /**
   * 3. AKSI PEMBUKAAN KARTU OLEH PEMAIN AKTIF
   * @param {string} sourceType - 'table' | 'player_hand'
   * @param {Object|number|string} optionsOrTarget - { tableIndex } | tableIndex ATAU { targetPlayerId, edge } | targetPlayerId
   * @param {string} [edgeParam] - 'lowest' | 'highest' (jika parameter kedua berupa string targetPlayerId)
   */
  async function revealCard(sourceType, optionsOrTarget = {}, edgeParam = null) {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    const state = getGameState(currentRoom);

    if (state.status !== 'playing') {
      UI.Toast('Tunggu sampai jeda kartu selesai!', 'warning');
      return;
    }

    if (state.currentTurnPlayerId !== currentPlayer.id) {
      UI.Toast('Bukan giliranmu!', 'warning');
      return;
    }

    isSubmitting = true;
    try {
      const newState = JSON.parse(JSON.stringify(state));
      const activePlayer = newState.players[currentPlayer.id];
      if (!activePlayer) {
        UI.Toast('Data pemain aktif tidak ditemukan!', 'error');
        return;
      }

      let revealedCard = null;
      let stepEntry = null;

      // A. Buka Kartu dari Meja Tengah
      if (sourceType === 'table') {
        let tableIndex;
        if (typeof optionsOrTarget === 'object' && optionsOrTarget !== null) {
          tableIndex = optionsOrTarget.tableIndex;
        } else {
          tableIndex = Number(optionsOrTarget);
        }

        const card = (newState.tableCards || [])[tableIndex];

        if (!card || card.isRevealed) {
          UI.Toast('Kartu meja ini sudah tidak tersedia atau sedang terbuka!', 'warning');
          return;
        }

        // Pastikan kartu meja ini belum masuk dalam revealedSteps giliran ini
        const alreadyInSteps = (newState.revealedSteps || []).some(s => s.sourceType === 'table' && s.tableIndex === tableIndex);
        if (alreadyInSteps) {
          UI.Toast('Kartu ini sudah kamu buka pada langkah sebelumnya!', 'warning');
          return;
        }

        revealedCard = { ...card };
        stepEntry = {
          sourceType: 'table',
          tableIndex: tableIndex,
          card: revealedCard,
          displayName: `Meja Tengah (Posisi #${tableIndex + 1})`
        };
      } 
      // B. Buka Kartu Ujung dari Tangan Pemain (Diri Sendiri atau Lawan)
      else if (sourceType === 'player_hand') {
        let targetPlayerId;
        let edge;
        if (typeof optionsOrTarget === 'object' && optionsOrTarget !== null) {
          targetPlayerId = optionsOrTarget.targetPlayerId;
          edge = optionsOrTarget.edge;
        } else {
          targetPlayerId = String(optionsOrTarget);
          edge = edgeParam || 'lowest';
        }

        const targetPlayer = (newState.players || {})[targetPlayerId];

        if (!targetPlayer || !targetPlayer.hand || targetPlayer.hand.length === 0) {
          UI.Toast('Pemain ini tidak memiliki kartu di tangannya!', 'warning');
          return;
        }

        // Pastikan tangan target player selalu terurut sebelum mengambil kartu
        targetPlayer.hand = sortHand(targetPlayer.hand);

        // Ambil kartu dari ujung yang belum terbuka di ronde berjalan
        const unrevealedHand = targetPlayer.hand.filter(c => !(newState.revealedSteps || []).some(s => s.sourceType === 'player_hand' && s.card && s.card.id === c.id));
        if (unrevealedHand.length === 0) {
          UI.Toast('Seluruh kartu di tangan pemain ini sedang terbuka!', 'warning');
          return;
        }

        const candidateCard = (edge === 'lowest') ? unrevealedHand[0] : unrevealedHand[unrevealedHand.length - 1];

        revealedCard = candidateCard;
        const edgeLabel = edge === 'lowest' ? 'TERKECIL (Kiri)' : 'TERBESAR (Kanan)';
        stepEntry = {
          sourceType: 'player_hand',
          targetPlayerId: targetPlayerId,
          targetPlayerName: targetPlayer.name,
          edge: edge,
          card: revealedCard,
          displayName: `Tangan [${targetPlayer.name}] - ${edgeLabel}`
        };
      }

      if (!stepEntry || !revealedCard) {
        return;
      }

      UI.Sound.pop();

      const previousSteps = newState.revealedSteps || [];
      const stepNumber = previousSteps.length + 1; // Langkah 1, 2, atau 3

      // ========================================================================
      // VALIDASI LANGKAH PEMBUKAAN KARTU
      // ========================================================================

      // LANGKAH 1: Kartu Pertama Terbuka
      if (stepNumber === 1) {
        newState.revealedSteps = [stepEntry];
        newState.actionLogs.push({
          text: `🔍 [${activePlayer.name}] membuka Kartu Ke-1: [${stepEntry.displayName}].`,
          timestamp: Date.now()
        });
        await DB.updateGameState(currentRoom.code, 'trio', newState);
        return;
      }

      // LANGKAH 2: Bandingkan dengan Kartu Pertama
      if (stepNumber === 2) {
        const firstCard = previousSteps[0].card;

        if (revealedCard.number === firstCard.number) {
          // SAMA! Lanjut ke Kartu Ke-3!
          UI.Sound.flip();
          newState.revealedSteps.push(stepEntry);
          newState.actionLogs.push({
            text: `✨ [${activePlayer.name}] membuka Kartu Ke-2: [${stepEntry.displayName}]! Angka KEMBAR! Lanjut ke kartu ke-3!`,
            timestamp: Date.now()
          });
          await DB.updateGameState(currentRoom.code, 'trio', newState);
          return;
        } else {
          // BERBEDA! Gagal pada langkah kedua!
          handleMismatch(newState, activePlayer, [...previousSteps, stepEntry]);
          await DB.updateGameState(currentRoom.code, 'trio', newState);
          return;
        }
      }

      // LANGKAH 3: Bandingkan dengan Kartu Pertama
      if (stepNumber === 3) {
        const firstCard = previousSteps[0].card;

        if (revealedCard.number === firstCard.number) {
          // 🎉 TRIO BERHASIL! Tiga Kartu Kembar Ditemukan!
          UI.Sound.fanfare();
          const allThreeSteps = [...previousSteps, stepEntry];
          const trioNumber = revealedCard.number;

          // 1. Simpan angka trio ke koleksi pemain aktif
          if (!Array.isArray(activePlayer.triosWon)) activePlayer.triosWon = [];
          activePlayer.triosWon.push(trioNumber);

          // 2. Ambil ketiga kartu keluar dari Meja atau Tangan pemiliknya
          allThreeSteps.forEach(step => {
            if (step.sourceType === 'table') {
              // Tandai kartu meja sebagai tereliminasi/diambil
              const tblCard = (newState.tableCards || [])[step.tableIndex];
              if (tblCard) {
                tblCard.isRevealed = true;
                tblCard.isClaimed = true;
              }
            } else if (step.sourceType === 'player_hand') {
              const p = (newState.players || {})[step.targetPlayerId];
              if (p && p.hand) {
                p.hand = p.hand.filter(c => c.id !== step.card.id);
                p.hand = sortHand(p.hand);
              }
            }
          });

          newState.revealedSteps = [];

          newState.actionLogs.push({
            text: `🎉 TRIO BERHASIL! [${activePlayer.name}] berhasil menemukan 3 kartu bernilai [${trioNumber}]! Trio diamankan ke koleksi.`,
            timestamp: Date.now()
          });

          // 3. Periksa Syarat Kemenangan
          const winCheck = checkVictoryCondition(activePlayer.triosWon, newState.winMode);

          if (winCheck.won) {
            newState.status = 'game_over';
            newState.winnerPlayerId = activePlayer.id;
            newState.winReason = winCheck.message;
            newState.actionLogs.push({
              text: `👑 [${activePlayer.name}] MENANG PERMAINAN karena ${winCheck.message}!`,
              timestamp: Date.now()
            });
          } else {
            // Pindahkan giliran ke pemain berikutnya
            const nextIndex = (newState.turnIndex + 1) % newState.turnOrder.length;
            newState.turnIndex = nextIndex;
            newState.currentTurnPlayerId = newState.turnOrder[nextIndex];
          }

          await DB.updateGameState(currentRoom.code, 'trio', newState);
          return;
        } else {
          // GAGAL PADA KARTU KETIGA!
          handleMismatch(newState, activePlayer, [...previousSteps, stepEntry]);
          await DB.updateGameState(currentRoom.code, 'trio', newState);
          return;
        }
      }
    } catch (err) {
      UI.Logger('TRIO', 'Error during revealCard:', err, true);
      UI.Toast('Terjadi kesalahan saat membuka kartu: ' + (err.message || err), 'error');
    } finally {
      isSubmitting = false;
    }
  }

  /**
   * Helper Menangani Kondisi Angka Berbeda (Mismatch)
   * Menyimpan status mismatch_pause selama 3,5 detik agar semua pemain dapat menghafal posisi
   */
  function handleMismatch(state, activePlayer, revealedSteps) {
    state.status = 'mismatch_pause';
    state.mismatchData = {
      revealedSteps: revealedSteps,
      expireAt: Date.now() + 3500 // Jeda 3,5 detik
    };

    state.actionLogs.push({
      text: `❌ [${activePlayer.name}] belum menemukan kartu yang cocok. Kartu akan tertutup kembali...`,
      timestamp: Date.now()
    });
  }

  /**
   * Selesaikan Jeda Mismatch & Kembalikan Kartu ke Posisi Semula
   * Pindahkan giliran ke pemain berikutnya
   */
  async function resolveMismatch() {
    if (!currentRoom || isSubmitting) return;
    const state = getGameState(currentRoom);
    if (state.status !== 'mismatch_pause') return;

    isSubmitting = true;
    try {
      const newState = JSON.parse(JSON.stringify(state));

      // Reset status & langkah
      newState.status = 'playing';
      newState.revealedSteps = [];
      newState.mismatchData = null;

      // Pastikan seluruh tangan pemain tetap terurut rapi
      Object.values(newState.players || {}).forEach(p => {
        if (p) p.hand = sortHand(p.hand || []);
      });

      // Pindahkan giliran ke pemain berikutnya
      const nextIndex = (newState.turnIndex + 1) % newState.turnOrder.length;
      newState.turnIndex = nextIndex;
      newState.currentTurnPlayerId = newState.turnOrder[nextIndex];

      await DB.updateGameState(currentRoom.code, 'trio', newState);
    } catch (err) {
      UI.Logger('TRIO', 'Error during resolveMismatch:', err, true);
    } finally {
      isSubmitting = false;
    }
  }

  /**
   * ==========================================================================
   * RENDER VIEW: PAPAN PERMAINAN TRIO
   * ==========================================================================
   */
  function render(container, roomData, player) {
    if (!container || !roomData) return;
    currentRoom = roomData;
    currentPlayer = player;

    UI.setTheme('trio');

    const state = getGameState(roomData);

    // Jika permainan belum dimulai
    if (!state.status) {
      renderPreGameView(container, roomData, player, state);
      return;
    }

    // Jika permainan selesai (Game Over)
    if (state.status === 'game_over') {
      renderGameOverView(container, roomData, player, state);
      return;
    }

    renderActiveGameView(container, roomData, player, state);
  }

  /**
   * View Pre-Game (Lobby Sebelum Host Memulai Trio)
   */
  function renderPreGameView(container, roomData, player, state) {
    const isHost = player && player.isHost;
    const playersList = Object.values(roomData.players || {});
    const winMode = state.winMode || 'simple';

    const contentHTML = `
      <div class="max-w-2xl mx-auto py-8 text-center space-y-6">
        <div class="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-cyan-500 to-pink-500 text-white flex items-center justify-center shadow-xl shadow-cyan-500/25 animate-bounce">
          <span class="text-5xl">🃏</span>
        </div>

        <div>
          <span class="px-3.5 py-1 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300 font-display font-bold text-xs uppercase tracking-wider">
            Deduksi Memori 36 Kartu
          </span>
          <h2 class="font-display font-black text-3xl sm:text-4xl text-slate-900 mt-2">Trio</h2>
          <p class="font-body text-slate-600 text-sm max-w-lg mx-auto mt-2 leading-relaxed">
            Cari 3 kartu kembar dari tangan lawan dan meja tengah. Ingat: kartu tangan selalu tersusun urut dari Terkecil ke Terbesar!
          </p>
        </div>

        <!-- Pemilih Mode Kemenangan (Host Controls) -->
        <div class="p-5 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm text-left space-y-3">
          <div class="flex items-center justify-between">
            <span class="font-display font-bold text-xs text-slate-700 uppercase tracking-wider">Pilih Mode Kemenangan:</span>
            <span class="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-display font-bold text-[10px]">
              ${winMode === 'spicy' ? 'Mode Spicy / Picante' : 'Mode Simple (Standar)'}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- Mode 1: Simple -->
            <div 
              onclick="${isHost ? "TrioGame.setWinMode('simple')" : ''}"
              class="p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                winMode === 'simple' 
                  ? 'bg-cyan-50/70 border-cyan-500 ring-2 ring-cyan-500/20' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }"
            >
              <div class="flex items-center justify-between mb-1">
                <h5 class="font-display font-black text-xs text-slate-900">1. Mode Simple (Standar)</h5>
                ${winMode === 'simple' ? '<span class="text-cyan-600 text-xs font-bold">✓ Aktif</span>' : ''}
              </div>
              <p class="font-body text-[11px] text-slate-500 leading-relaxed">
                Menang jika mengumpulkan <b>3 Set Trio apa saja</b>, ATAU langsung menang jika mendapat <b>Trio Angka 7 (👑 7-7-7)</b>!
              </p>
            </div>

            <!-- Mode 2: Spicy -->
            <div 
              onclick="${isHost ? "TrioGame.setWinMode('spicy')" : ''}"
              class="p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                winMode === 'spicy' 
                  ? 'bg-pink-50/70 border-pink-500 ring-2 ring-pink-500/20' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }"
            >
              <div class="flex items-center justify-between mb-1">
                <h5 class="font-display font-black text-xs text-slate-900">2. Mode Spicy / Picante</h5>
                ${winMode === 'spicy' ? '<span class="text-pink-600 text-xs font-bold">✓ Aktif</span>' : ''}
              </div>
              <p class="font-body text-[11px] text-slate-500 leading-relaxed">
                Menang jika dapat <b>Trio 7</b>, ATAU <b>2 Trio yang terhubung ke 7</b> (jumlah atau selisihnya menghasilkan 7, misal Trio 2 & 5)!
              </p>
            </div>
          </div>
        </div>

        <!-- Daftar Pemain di Meja -->
        <div class="p-4 rounded-3xl bg-white border-2 border-slate-900/5 shadow-sm text-left">
          <div class="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
            <span class="font-display font-bold text-xs text-slate-700">Pemain di Meja (${playersList.length}/6)</span>
            <span class="text-xs text-cyan-600 font-body font-semibold">Minimal 3 Pemain</span>
          </div>
          <div class="flex flex-wrap gap-2">
            ${playersList.map(p => `
              <div class="px-3 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-slate-800 text-xs font-display font-bold flex items-center gap-1.5">
                <span>${p.isHost ? '👑' : '🃏'}</span>
                <span>${p.name}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Tombol Mulai -->
        <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          ${isHost ? `
            <button 
              onclick="TrioGame.startGame()"
              class="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-pink-600 hover:from-cyan-700 hover:to-pink-700 text-white font-display font-black text-base shadow-xl shadow-cyan-600/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <i data-lucide="play" class="w-5 h-5"></i>
              <span>Bagikan 36 Kartu & Mulai Trio! 🎲</span>
            </button>
          ` : `
            <div class="p-3.5 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-900 font-display font-semibold text-xs flex items-center justify-center gap-2 w-full sm:w-auto">
              <span class="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping"></span>
              <span>Menunggu Host memilih mode dan memulai permainan...</span>
            </div>
          `}
          
          <button 
            onclick="App.returnToLobby()"
            class="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-bold text-xs sm:text-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
            <span>Kembali ke Lobby</span>
          </button>

          <button 
            onclick="App.leaveCurrentGame()"
            class="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-display font-bold text-xs sm:text-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <i data-lucide="log-out" class="w-4 h-4 text-rose-600"></i>
            <span>Keluar Game 🚪</span>
          </button>
        </div>
      </div>
    `;

    container.innerHTML = contentHTML;
    UI.refreshIcons();
  }

  /**
   * View Aktif Game Trio (Meja Tengah, Langkah Buka Kartu, Tangan Pemain)
   */
  function renderActiveGameView(container, roomData, player, state) {
    const isMyTurn = (state.currentTurnPlayerId === player.id);
    const turnPlayer = state.players[state.currentTurnPlayerId];
    const isMismatchPause = (state.status === 'mismatch_pause');

    // Timer Countdown untuk Jeda Mismatch (3,5 detik)
    if (isMismatchPause && !mismatchTimer) {
      mismatchTimer = setTimeout(() => {
        mismatchTimer = null;
        resolveMismatch();
      }, 3500);
    }

    // Kartu yang Sedang Terbuka pada Giliran Ini
    const steps = isMismatchPause 
      ? (state.mismatchData?.revealedSteps || [])
      : (state.revealedSteps || []);

    const stepSlotsHTML = Array.from({ length: 3 }).map((_, idx) => {
      const step = steps[idx];
      if (step) {
        const num = step.card.number;
        const meta = NUMBER_META[num] || NUMBER_META[1];
        return `
          <div class="flex-1 max-w-[130px] p-3 rounded-2xl ${meta.bg} ${meta.border} border-2 ${meta.text} flex flex-col items-center justify-between shadow-lg h-36 animate-scale-up select-none">
            <div class="w-full flex items-center justify-between text-xs font-display font-black">
              <span>#${idx + 1}</span>
              <span>${meta.emoji}</span>
            </div>
            <div class="text-4xl font-display font-black filter drop-shadow">
              ${num}
            </div>
            <div class="text-[9px] text-center font-display font-bold opacity-90 truncate w-full">
              ${step.sourceType === 'table' ? 'Meja' : (step.targetPlayerName || 'Tangan')}
            </div>
          </div>
        `;
      } else {
        return `
          <div class="flex-1 max-w-[130px] p-3 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 h-36">
            <span class="text-xl mb-1">🃏</span>
            <span class="font-display font-bold text-xs">Kartu #${idx + 1}</span>
            <span class="text-[9px] text-slate-400 mt-0.5">
              ${idx === 0 ? 'Pilih awal' : idx === 1 ? 'Cari kembar' : 'Lengkapi trio'}
            </span>
          </div>
        `;
      }
    }).join('');

    // Grid Meja Tengah (Kartu Tertutup / Terbuka)
    const tableCardsHTML = (state.tableCards || []).map((card, idx) => {
      // Periksa apakah kartu meja ini sedang terbuka di revealedSteps
      const isCurrentlyOpenInStep = steps.some(s => s.sourceType === 'table' && s.tableIndex === idx);
      const isClaimedInTrio = card.isClaimed;

      if (isClaimedInTrio) {
        return `
          <div class="w-14 h-20 sm:w-16 sm:h-24 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300 text-xs font-display font-bold select-none opacity-40">
            ✓ Trio
          </div>
        `;
      }

      if (isCurrentlyOpenInStep) {
        const meta = NUMBER_META[card.number] || NUMBER_META[1];
        return `
          <div class="w-14 h-20 sm:w-16 sm:h-24 rounded-xl ${meta.bg} ${meta.border} border-2 ${meta.text} flex flex-col items-center justify-between p-1.5 shadow-md animate-scale-up select-none">
            <span class="text-[10px] font-display font-bold self-start">${card.number}</span>
            <span class="text-xl sm:text-2xl font-display font-black">${card.number}</span>
            <span class="text-[10px] self-end">${meta.emoji}</span>
          </div>
        `;
      }

      // Kartu Tertutup di Meja Tengah
      const canClick = isMyTurn && !isMismatchPause;
      return `
        <div 
          ${canClick ? `onclick="TrioGame.revealCard('table', ${idx})"` : ''}
          class="w-14 h-20 sm:w-16 sm:h-24 rounded-xl bg-gradient-to-br from-cyan-600 to-sky-700 border-2 border-cyan-400/80 p-2 flex flex-col items-center justify-between shadow-sm transition-all select-none ${
            canClick ? 'hover:-translate-y-1.5 hover:shadow-md hover:border-pink-300 cursor-pointer active:scale-95' : 'opacity-80'
          }"
          title="${canClick ? `Buka kartu meja posisi #${idx + 1}` : 'Kartu tertutup di meja'}"
        >
          <span class="text-[9px] font-display font-bold text-cyan-200">#${idx + 1}</span>
          <span class="text-lg text-cyan-100">🃏</span>
          <span class="text-[8px] font-display font-bold text-cyan-200 uppercase">TRIO</span>
        </div>
      `;
    }).join('');

    // Barisan Kartu Tangan Seluruh Pemain (Lawan & Diri Sendiri)
    const playersHandsHTML = state.turnOrder.map(pid => {
      const p = state.players[pid];
      if (!p) return '';
      const isMe = (pid === player.id);
      const isTurn = (pid === state.currentTurnPlayerId);
      const hand = p.hand || [];

      // Kartu-kartu di tangan
      const cardsInHandHTML = hand.map((card, cIdx) => {
        // Cek apakah kartu ini sedang terbuka di revealedSteps
        const isOpenInStep = steps.some(s => s.sourceType === 'player_hand' && s.card.id === card.id);

        if (isOpenInStep || isMe) {
          // Kartu terbuka (terlihat angkanya untuk pemilik sendiri atau saat sedang di-reveal)
          const meta = NUMBER_META[card.number] || NUMBER_META[1];
          return `
            <div class="w-11 h-16 sm:w-13 sm:h-18 rounded-xl ${meta.bg} ${meta.border} border-2 ${meta.text} flex flex-col items-center justify-between p-1 shadow-sm shrink-0 select-none">
              <span class="text-[9px] font-display font-bold self-start">${card.number}</span>
              <span class="text-base sm:text-lg font-display font-black">${card.number}</span>
              <span class="text-[9px] self-end">${meta.emoji}</span>
            </div>
          `;
        } else {
          // Kartu tertutup milik lawan
          return `
            <div class="w-11 h-16 sm:w-13 sm:h-18 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-slate-600 text-slate-300 flex flex-col items-center justify-between p-1 shadow-xs shrink-0 select-none">
              <span class="text-[8px] font-display text-slate-400">#${cIdx + 1}</span>
              <span class="text-sm">🃏</span>
              <span class="text-[7px] font-display font-bold text-slate-400">?</span>
            </div>
          `;
        }
      }).join('');

      // Tombol Aksi Ujung Tangan (Hanya aktif jika giliran saya dan ada kartu di tangan target)
      const canAsk = isMyTurn && !isMismatchPause && hand.length > 0;

      // Koleksi Trio yang sudah didapat pemain ini
      const triosWonHTML = (p.triosWon || []).map(num => {
        const meta = NUMBER_META[num] || NUMBER_META[1];
        return `
          <div class="px-2 py-0.5 rounded-lg ${meta.badge} border font-display font-bold text-[10px] flex items-center gap-1 shadow-xs">
            <span>${meta.emoji}</span>
            <span>Trio ${num}</span>
          </div>
        `;
      }).join('');

      return `
        <div class="p-4 rounded-3xl border-2 transition-all space-y-3 ${
          isTurn 
            ? 'bg-cyan-50/70 border-cyan-400 ring-2 ring-cyan-400/20 shadow-sm' 
            : 'bg-white border-slate-900/10'
        }">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-xl bg-slate-900 text-white font-display font-black text-xs flex items-center justify-center shrink-0">
                ${p.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div class="font-display font-black text-xs text-slate-800 flex items-center gap-1">
                  <span>${p.name}</span>
                  ${isMe ? '<span class="text-[10px] text-cyan-600 font-bold">(Kamu)</span>' : ''}
                  ${isTurn ? '<span class="px-1.5 py-0.2 rounded-md bg-cyan-600 text-white text-[9px] font-bold">Giliran Aktif</span>' : ''}
                </div>
                <div class="text-[10px] text-slate-400 font-body">
                  ${hand.length} Kartu di Tangan (Terurut Terkecil → Terbesar)
                </div>
              </div>
            </div>

            <!-- Koleksi Trio Pemain -->
            <div class="flex items-center gap-1 flex-wrap">
              ${triosWonHTML.length > 0 ? triosWonHTML : '<span class="text-[10px] text-slate-400 italic font-body">Belum ada Trio</span>'}
            </div>
          </div>

          <!-- Barisan Kartu Terurut dengan Tombol Ujung Kiri (MIN) & Kanan (MAX) -->
          <div class="flex items-center gap-2 overflow-x-auto py-1 px-0.5 no-scrollbar">
            
            <!-- Tombol Buka Terkecil (Paling Kiri) -->
            <button
              ${canAsk ? `onclick="TrioGame.revealCard('player_hand', '${pid}', 'lowest')"` : 'disabled'}
              class="px-2.5 py-2.5 rounded-xl font-display font-bold text-[10px] shrink-0 flex items-center gap-1 transition-all ${
                canAsk 
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm active:scale-95 cursor-pointer' 
                  : 'bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed'
              }"
              title="Buka kartu paling kecil (paling kiri) dari pemain ini"
            >
              <span>⬅️</span>
              <span class="hidden sm:inline">Terkecil</span>
            </button>

            <!-- Kartu-kartu di Tangan -->
            <div class="flex items-center gap-1.5 overflow-x-auto py-1">
              ${cardsInHandHTML.length > 0 ? cardsInHandHTML : '<span class="text-xs text-slate-400 italic py-4">Tangan kosong</span>'}
            </div>

            <!-- Tombol Buka Terbesar (Paling Kanan) -->
            <button
              ${canAsk ? `onclick="TrioGame.revealCard('player_hand', '${pid}', 'highest')"` : 'disabled'}
              class="px-2.5 py-2.5 rounded-xl font-display font-bold text-[10px] shrink-0 flex items-center gap-1 transition-all ${
                canAsk 
                  ? 'bg-pink-600 hover:bg-pink-700 text-white shadow-sm active:scale-95 cursor-pointer' 
                  : 'bg-slate-100 text-slate-400 opacity-50 cursor-not-allowed'
              }"
              title="Buka kartu paling besar (paling kanan) dari pemain ini"
            >
              <span class="hidden sm:inline">Terbesar</span>
              <span>➡️</span>
            </button>

          </div>
        </div>
      `;
    }).join('');

    const contentHTML = `
      <div class="w-full max-w-5xl mx-auto space-y-5 pb-8">
        
        <!-- Header Meja Trio -->
        <div class="bg-white rounded-3xl border-2 border-slate-900/10 p-4 sm:p-5 shadow-joyful flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-pink-500 text-white flex items-center justify-center shadow-md text-2xl">
              🃏
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-display font-black text-lg text-slate-900">Meja Permainan Trio</h3>
                <span class="px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-display font-bold border border-cyan-200">
                  Mode: ${state.winMode === 'spicy' ? 'Spicy / Picante' : 'Simple'}
                </span>
              </div>
              <p class="font-body text-xs text-slate-500">
                Giliran aktif: <b class="text-cyan-600 font-display">${turnPlayer?.name || 'Pemain'}</b>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 sm:gap-3">
            <button 
              onclick="GameRules.open('trio', 'lobby')" 
              class="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              title="Lihat Aturan Main"
            >
              <i data-lucide="book-open" class="w-4 h-4 text-cyan-600"></i>
              <span>Panduan</span>
            </button>
            <button 
              onclick="App.leaveCurrentGame()" 
              class="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-2xs"
              title="Keluar dari Permainan"
            >
              <i data-lucide="log-out" class="w-4 h-4 text-rose-600"></i>
              <span>Keluar Game 🚪</span>
            </button>
          </div>
        </div>

        <!-- Banner Status Giliran / Mismatch Pause -->
        ${isMismatchPause ? `
          <div class="p-4 rounded-3xl bg-rose-500 text-white font-display flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-rose-500/25 animate-pulse">
            <div class="flex items-center gap-2.5">
              <span class="text-2xl">⏱️</span>
              <div>
                <h4 class="font-black text-sm uppercase tracking-wide">❌ Belum cocok! Hafalkan posisinya sebelum tertutup kembali...</h4>
                <p class="font-body text-xs text-rose-100">Kedua kartu akan ditutup kembali dalam 3,5 detik...</p>
              </div>
            </div>
            <button 
              onclick="TrioGame.resolveMismatch()"
              class="px-4 py-2 rounded-2xl bg-white text-rose-700 hover:bg-rose-50 font-display font-bold text-xs shadow-sm cursor-pointer active:scale-95 transition-all"
            >
              Lanjutkan Giliran Sekarang →
            </button>
          </div>
        ` : `
          <div class="p-3.5 rounded-2xl bg-white border-2 border-slate-900/5 shadow-xs flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full ${isMyTurn ? 'bg-cyan-500 animate-ping' : 'bg-slate-300'}"></span>
              <span class="font-display font-bold text-xs text-slate-700">
                ${isMyTurn ? `🎯 Giliranmu: Membuka kartu ke-${steps.length + 1}...` : `Giliran [${turnPlayer?.name || 'Pemain Lain'}]: Membuka kartu ke-${steps.length + 1}...`}
              </span>
            </div>
            <span class="text-[11px] font-display font-bold text-slate-400">
              Langkah: ${steps.length} / 3 Kartu
            </span>
          </div>
        `}

        <!-- Slot Kartu yang Sedang Terbuka pada Giliran Ini -->
        <div class="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border-4 border-slate-800 space-y-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <i data-lucide="sparkles" class="w-4 h-4 text-cyan-400"></i>
              <h4 class="font-display font-black text-sm text-cyan-300 uppercase tracking-wider">
                Kartu Terbuka Giliran Ini (${steps.length}/3)
              </h4>
            </div>
            <span class="text-[11px] text-slate-400 font-body">
              ${steps.length === 0 ? 'Buka kartu pertama untuk memulai' : steps.length === 1 ? 'Cari kartu kedua bernilai SAMA' : 'Buka kartu ketiga untuk dapatkan TRIO!'}
            </span>
          </div>

          <div class="flex items-center justify-center gap-3 sm:gap-4 py-2">
            ${stepSlotsHTML}
          </div>
        </div>

        <!-- Meja Tengah: Grid Kartu Tertutup -->
        <div class="bg-white rounded-3xl border-2 border-slate-900/10 p-5 sm:p-6 shadow-joyful space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <div class="flex items-center gap-2">
              <i data-lucide="grid" class="w-4 h-4 text-cyan-600"></i>
              <h4 class="font-display font-bold text-xs text-slate-700 uppercase tracking-wider">
                Kartu Tertutup di Meja Tengah
              </h4>
            </div>
            <span class="text-[11px] text-slate-400 font-body">
              ${isMyTurn && !isMismatchPause ? '👉 Klik salah satu kartu meja untuk membukanya' : 'Klik kartu saat giliranmu'}
            </span>
          </div>

          <div class="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 py-3">
            ${tableCardsHTML}
          </div>
        </div>

        <!-- Barisan Kartu Tangan Seluruh Pemain -->
        <div class="space-y-4">
          <div class="flex items-center justify-between px-1">
            <h4 class="font-display font-bold text-xs text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="users" class="w-4 h-4 text-slate-400"></i>
              <span>Barisan Kartu Pemain di Meja</span>
            </h4>
            <span class="text-[11px] text-slate-400 font-body">
              Gunakan tombol <b>⬅️ Terkecil</b> atau <b>➡️ Terbesar</b> untuk meminta kartu
            </span>
          </div>

          <div class="space-y-3">
            ${playersHandsHTML}
          </div>
        </div>

      </div>
    `;

    container.innerHTML = contentHTML;
    UI.refreshIcons();
  }

  /**
   * ==========================================================================
   * RENDER VIEW: GAME OVER & PODIUM TRIO
   * ==========================================================================
   */
  function renderGameOverView(container, roomData, player, state) {
    const isHost = player && player.isHost;
    const winner = state.players[state.winnerPlayerId] || { name: 'Pemenang', triosWon: [] };

    // Ranking pemain berdasarkan jumlah trio yang didapat
    const sortedPlayers = Object.values(state.players || {}).sort((a, b) => {
      if (a.id === state.winnerPlayerId) return -1;
      if (b.id === state.winnerPlayerId) return 1;
      return (b.triosWon?.length || 0) - (a.triosWon?.length || 0);
    });

    const rankingsHTML = sortedPlayers.map((p, idx) => {
      const isWinner = p.id === state.winnerPlayerId;
      const medal = isWinner ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🎖️';

      const triosBadges = (p.triosWon || []).map(num => {
        const meta = NUMBER_META[num] || NUMBER_META[1];
        return `
          <span class="px-2 py-0.5 rounded-lg ${meta.badge} border text-[10px] font-display font-bold">
            ${meta.emoji} Trio ${num}
          </span>
        `;
      }).join(' ');

      return `
        <tr class="border-b border-slate-100 ${isWinner ? 'bg-cyan-50/70 font-bold' : ''}">
          <td class="py-3 px-3 font-display font-black text-sm text-slate-800 flex items-center gap-1.5">
            <span>${medal}</span>
            <span>#${idx + 1} ${p.name}</span>
          </td>
          <td class="py-3 px-3 text-center font-display font-bold text-xs text-cyan-700">
            ${p.triosWon?.length || 0} Trio
          </td>
          <td class="py-3 px-3 text-right">
            <div class="flex items-center justify-end gap-1 flex-wrap">
              ${triosBadges || '<span class="text-xs text-slate-400 italic font-normal">Tidak ada</span>'}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    const contentHTML = `
      <div class="max-w-2xl mx-auto py-8 space-y-6">
        
        <div class="text-center space-y-3">
          <div class="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-cyan-400 to-pink-500 text-white flex items-center justify-center shadow-xl shadow-cyan-500/25 animate-bounce text-4xl">
            🏆
          </div>

          <span class="px-3.5 py-1 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300 font-display font-bold text-xs uppercase tracking-wider">
            PERMAINAN TRIO SELESAI
          </span>

          <h2 class="font-display font-black text-3xl sm:text-4xl text-slate-900">
            ${winner.name} adalah Juara Trio!
          </h2>

          <p class="font-body text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            ${state.winReason || 'Kemenangan luar biasa dengan deduksi memori tingkat tinggi!'}
          </p>
        </div>

        <!-- Tabel Peringkat Akhir -->
        <div class="bg-white rounded-3xl border-2 border-slate-900/10 p-5 shadow-joyful">
          <h4 class="font-display font-bold text-xs text-slate-700 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2">
            Papan Peringkat Akhir Koleksi Trio
          </h4>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="text-slate-400 font-display font-semibold border-b border-slate-200">
                  <th class="py-2 px-3">Pemain</th>
                  <th class="py-2 px-3 text-center">Jumlah Trio</th>
                  <th class="py-2 px-3 text-right">Set Trio yang Didapat</th>
                </tr>
              </thead>
              <tbody>
                ${rankingsHTML}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tombol Aksi Akhir -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          ${isHost ? `
            <button 
              onclick="TrioGame.startGame()"
              class="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-cyan-600 hover:bg-cyan-700 text-white font-display font-bold text-sm shadow-lg shadow-cyan-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
              <span>Main Lagi (Acak Ulang 36 Kartu) 🔄</span>
            </button>
          ` : ''}

          <button 
            onclick="App.returnToLobby()"
            class="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
            <span>Kembali ke Lobby</span>
          </button>

          <button 
            onclick="App.leaveCurrentGame()"
            class="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-display font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <i data-lucide="log-out" class="w-4 h-4 text-rose-600"></i>
            <span>Keluar Game 🚪</span>
          </button>
        </div>

      </div>
    `;

    container.innerHTML = contentHTML;
    UI.refreshIcons();
  }

  function cleanup() {
    isSubmitting = false;
    if (mismatchTimer) {
      clearTimeout(mismatchTimer);
      mismatchTimer = null;
    }
    UI.Logger('TRIO', 'Cleaned up Trio game state');
  }

  return {
    init: () => {},
    render,
    onStateChange: (roomData) => {
      currentRoom = roomData;
      const state = getGameState(roomData);
      if (state.status === 'game_over') {
        UI.Confetti();
        UI.Sound.fanfare();
      }
    },
    startGame,
    setWinMode,
    revealCard,
    resolveMismatch,
    cleanup
  };
})();

if (typeof window !== 'undefined') {
  window.TrioGame = TrioGame;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TrioGame;
}
