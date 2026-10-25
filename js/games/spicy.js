/**
 * ==========================================================================
 * DISCORD PARTY HUB - GAME 7: "SPICY (BLUFFING REMPAH PANAS)"
 * ==========================================================================
 * 100% Mengikuti Aturan Resmi Board Game Spicy:
 * - 90 Kartu Rempah Normal (Cabai, Wasabi, Lada; Angka 1-10 @ 3 kopi)
 * - 5 Kartu Wild Spice (Rempah Bebas; Sah untuk semua bumbu, TIDAK punya angka)
 * - 5 Kartu Wild Number (Angka Bebas; Sah untuk semua angka, TIDAK punya bumbu)
 * - 3 Kartu Piala (+10 Poin)
 * - Kartu World's End (Kiamat; Diselipkan di 15-20 kartu terbawah dek)
 * - Tantangan spesifik: "Tantang ANGKA" atau "Tantang REMPAH"
 * - Penghitungan skor akhir resmi: (Kartu Tumpukan x 1) + (Piala x 10) - (Sisa Kartu Tangan x 1)
 *
 * Terhubung ke Firebase Realtime Database: rooms/{roomCode}/spicyGame
 * ==========================================================================
 */

const SpicyGame = (function () {
  'use strict';

  // Local Module State
  let currentRoom = null;
  let currentPlayer = null;
  let selectedCardId = null;
  let selectedClaimSpice = null;
  let selectedClaimNumber = null;
  let isSubmitting = false;

  // Metadata Rempah
  const SPICE_META = {
    chili: {
      id: 'chili',
      name: 'Cabai',
      emoji: '🌶️',
      colorName: 'Merah Cabai',
      gradient: 'from-rose-500 to-orange-600',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      textColor: 'text-rose-600',
      borderColor: 'border-rose-400',
      accentBg: 'bg-rose-500'
    },
    wasabi: {
      id: 'wasabi',
      name: 'Wasabi',
      emoji: '🟢',
      colorName: 'Hijau Wasabi',
      gradient: 'from-emerald-500 to-teal-600',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-400',
      accentBg: 'bg-emerald-500'
    },
    pepper: {
      id: 'pepper',
      name: 'Lada',
      emoji: '🔵',
      colorName: 'Biru Lada',
      gradient: 'from-blue-600 to-indigo-700',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-400',
      accentBg: 'bg-blue-600'
    }
  };

  /**
   * Helper: Mengambil state permainan Spicy dari room
   */
  function getGameState(roomData) {
    if (!roomData) return {};
    return roomData.spicyGame || roomData.gameState?.spicy || {};
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
   * 1. KOMPOSISI DEK ASLI SPICY (100 KARTU REMPAH + WORLD'S END)
   */
  function generateDeck() {
    const cards = [];

    // 90 Kartu Rempah Normal: 3 Jenis Rempah x Angka 1-10 x 3 Kopi
    const spices = ['chili', 'wasabi', 'pepper'];
    spices.forEach(spice => {
      for (let num = 1; num <= 10; num++) {
        for (let copy = 1; copy <= 3; copy++) {
          cards.push({
            id: `c_${spice}_${num}_${copy}_${Math.random().toString(36).substr(2, 4)}`,
            type: 'normal',
            spice: spice,
            number: num,
            name: `${SPICE_META[spice].emoji} ${SPICE_META[spice].name} ${num}`
          });
        }
      }
    });

    // 5 Kartu Wild Spice (Rempah Bebas)
    // Sah untuk semua rempah, TETAPI dianggap TIDAK punya angka (kalah jika ditantang angka)
    for (let i = 1; i <= 5; i++) {
      cards.push({
        id: `c_wild_spice_${i}_${Math.random().toString(36).substr(2, 4)}`,
        type: 'wild_spice',
        spice: 'wild',
        number: null,
        name: '✨ Wild Spice (Rempah Bebas)'
      });
    }

    // 5 Kartu Wild Number (Angka Bebas)
    // Sah untuk semua angka 1-10, TETAPI dianggap TIDAK punya rempah (kalah jika ditantang rempah)
    for (let i = 1; i <= 5; i++) {
      cards.push({
        id: `c_wild_number_${i}_${Math.random().toString(36).substr(2, 4)}`,
        type: 'wild_number',
        spice: null,
        number: 'wild',
        name: '✨ Wild Number (Angka Bebas)'
      });
    }

    return shuffle(cards);
  }

  /**
   * Helper: Selipkan kartu World's End di posisi 15-20 kartu terbawah
   */
  function insertWorldsEndCard(deck) {
    const deckCopy = [...deck];
    const worldsEndCard = {
      id: 'c_worlds_end',
      type: 'worlds_end',
      name: '☄️ Kiamat (World\'s End)'
    };

    const remainingCount = deckCopy.length;
    // Tentukan offset dari bawah (15 sampai 20 kartu dari dasar, atau tengah dek jika tersisa sedikit)
    const minFromBottom = Math.min(15, Math.floor(remainingCount / 2));
    const maxFromBottom = Math.min(20, Math.max(minFromBottom, remainingCount - 1));
    const offset = Math.floor(Math.random() * (maxFromBottom - minFromBottom + 1)) + minFromBottom;

    const insertIndex = Math.max(0, remainingCount - offset);
    deckCopy.splice(insertIndex, 0, worldsEndCard);

    return {
      deck: deckCopy,
      insertPositionFromBottom: offset
    };
  }

  /**
   * Inisialisasi Permainan Baru oleh Host
   */
  async function startGame() {
    if (!currentRoom || !currentPlayer || !currentPlayer.isHost || isSubmitting) return;

    const playersList = Object.values(currentRoom.players || {});
    if (playersList.length < 2) {
      UI.Toast('Minimal 2 pemain diperlukan untuk memainkan Spicy!', 'warning');
      return;
    }

    if (playersList.length > 6) {
      UI.Toast('Maksimal 6 pemain untuk memainkan Spicy!', 'warning');
      return;
    }

    isSubmitting = true;
    UI.Sound.fanfare();
    UI.Logger('SPICY', 'Starting new game of Spicy with players:', playersList);

    // 1. Buat dan acak 100 kartu
    let rawDeck = generateDeck();

    // 2. Bagikan 6 kartu ke masing-masing pemain
    const playersData = {};
    const turnOrder = shuffle(playersList.map(p => p.id));

    turnOrder.forEach(pid => {
      const p = currentRoom.players[pid];
      const hand = rawDeck.splice(0, 6);
      playersData[pid] = {
        id: pid,
        name: p.name,
        hand: hand,
        wonCardsCount: 0,
        trophiesCount: 0
      };
    });

    // 3. Selipkan kartu World's End di 15-20 kartu terbawah dek tersisa
    const { deck: finalDeck, insertPositionFromBottom } = insertWorldsEndCard(rawDeck);

    // 4. Siapkan Initial Game State
    const initialGameState = {
      status: 'playing', // 'playing' | 'challenge_revealed' | 'game_over'
      turnOrder: turnOrder,
      turnIndex: 0,
      currentTurnPlayerId: turnOrder[0],
      players: playersData,
      trophiesAvailable: 3,
      deck: finalDeck,
      deckCount: finalDeck.length,
      worldsEndBottomOffset: insertPositionFromBottom,
      stack: [],
      currentClaim: null,
      lastCardPlayerId: null,
      challengeResult: null,
      winnerPlayerId: null,
      endReason: null,
      finalStandings: null,
      actionLogs: [
        {
          text: `🌶️ Permainan Spicy dimulai! ${playersList.length} pemain masing-masing memegang 6 kartu. Giliran pertama: [${playersData[turnOrder[0]].name}].`,
          timestamp: Date.now()
        }
      ]
    };

    await DB.updateGameState(currentRoom.code, 'spicy', initialGameState);

    selectedCardId = null;
    selectedClaimSpice = null;
    selectedClaimNumber = null;
    isSubmitting = false;
  }

  /**
   * Validasi Deklarasi Klaim Berdasarkan Aturan Resmi
   * @param {Object|null} currentClaim - Klaim saat ini di tumpukan
   * @param {string} claimSpice - Rempah yang ingin diklaim ('chili'|'wasabi'|'pepper')
   * @param {number} claimNumber - Angka yang ingin diklaim (1-10)
   */
  function validateClaim(currentClaim, claimSpice, claimNumber) {
    if (!claimSpice || !claimNumber) {
      return { valid: false, message: 'Pilih jenis rempah dan angka klaim!' };
    }

    const num = parseInt(claimNumber, 10);
    if (isNaN(num) || num < 1 || num > 10) {
      return { valid: false, message: 'Angka harus antara 1 sampai 10!' };
    }

    // ATURAN 1: Tumpukan Baru (belum ada kartu di meja)
    if (!currentClaim) {
      if (num > 3) {
        return { valid: false, message: 'Kartu pertama di tumpukan baru WAJIB bernilai angka 1, 2, atau 3!' };
      }
      return { valid: true };
    }

    // ATURAN 2: Setelah Angka 10
    // Wajib mengulang klaim dari angka 1, 2, atau 3, dan BOLEH mengganti rempah!
    if (currentClaim.number === 10) {
      if (num > 3) {
        return { valid: false, message: 'Setelah angka 10, klaim berikutnya WAJIB diulang dari angka 1, 2, atau 3 (boleh ganti rempah)!' };
      }
      return { valid: true };
    }

    // ATURAN 3: Klaim Lanjutan Normal
    // Wajib rempah yang SAMA dan angka LEBIH TINGGI dari klaim sebelumnya
    if (claimSpice !== currentClaim.spice) {
      const reqName = SPICE_META[currentClaim.spice]?.name || currentClaim.spice;
      return { valid: false, message: `Wajib mendeklarasikan rempah yang SAMA (${reqName})!` };
    }

    if (num <= currentClaim.number) {
      return { valid: false, message: `Angka harus LEBIH BESAR dari klaim sebelumnya (minimal ${currentClaim.number + 1})!` };
    }

    return { valid: true };
  }

  /**
   * Cek & Berikan Trophy Jika Ada Pemain yang Sukses Memainkan Kartu Terakhir Tanpa Ditantang
   */
  function resolveUnchallengedLastCard(state) {
    if (!state.lastCardPlayerId) return state;

    const lastPlayer = state.players[state.lastCardPlayerId];
    if (lastPlayer && lastPlayer.hand.length === 0 && state.trophiesAvailable > 0) {
      lastPlayer.trophiesCount += 1;
      state.trophiesAvailable -= 1;

      // Ambil 6 kartu baru dari dek
      const newHand = state.deck.splice(0, 6);
      lastPlayer.hand = newHand;

      state.actionLogs.push({
        text: `🏆 [${lastPlayer.name}] berhasil menghabiskan kartu di tangannya tanpa ada yang menantang! Mendapatkan 1 Piala (+10 Poin) dan mengambil 6 kartu baru.`,
        timestamp: Date.now()
      });

      // Cek apakah menang instan (2 piala) atau piala habis
      if (lastPlayer.trophiesCount >= 2) {
        state.status = 'game_over';
        state.winnerPlayerId = lastPlayer.id;
        state.endReason = 'trophy_double';
      } else if (state.trophiesAvailable === 0) {
        state.status = 'game_over';
        state.endReason = 'trophies_depleted';
      }
    }

    state.lastCardPlayerId = null;
    return state;
  }

  /**
   * AKSI 1: MAINKAN 1 KARTU TERTUTUP (PLAY)
   */
  async function playCard() {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    const state = getGameState(currentRoom);

    if (state.status !== 'playing') {
      UI.Toast('Permainan sedang tidak dalam fase aksi aktif!', 'warning');
      return;
    }

    if (state.currentTurnPlayerId !== currentPlayer.id) {
      UI.Toast('Bukan giliranmu untuk memainkan kartu!', 'warning');
      return;
    }

    if (!selectedCardId) {
      UI.Toast('Pilih 1 kartu di tanganmu terlebih dahulu!', 'warning');
      return;
    }

    const claimValidation = validateClaim(state.currentClaim, selectedClaimSpice, selectedClaimNumber);
    if (!claimValidation.valid) {
      UI.Toast(claimValidation.message, 'warning');
      return;
    }

    isSubmitting = true;
    UI.Sound.pop();

    // Copy state mendalam
    const newState = JSON.parse(JSON.stringify(state));
    const players = newState.players;
    const player = players[currentPlayer.id];

    // 1. Berikan piala ke pemain sebelumnya jika dia habis kartu dan tidak ditantang
    resolveUnchallengedLastCard(newState);
    if (newState.status === 'game_over') {
      finalizeGame(newState);
      await DB.updateGameState(currentRoom.code, 'spicy', newState);
      isSubmitting = false;
      return;
    }

    // 2. Ambil kartu dari tangan
    const cardIndex = player.hand.findIndex(c => c.id === selectedCardId);
    if (cardIndex === -1) {
      UI.Toast('Kartu yang dipilih tidak ditemukan di tanganmu!', 'error');
      isSubmitting = false;
      return;
    }
    const playedCard = player.hand.splice(cardIndex, 1)[0];

    // 3. Masukkan ke tumpukan tengah
    const claimData = {
      spice: selectedClaimSpice,
      number: parseInt(selectedClaimNumber, 10),
      playerId: currentPlayer.id,
      playerName: currentPlayer.name
    };

    newState.stack.push({
      card: playedCard,
      claim: claimData,
      playedByPlayerId: currentPlayer.id,
      playedByPlayerName: currentPlayer.name
    });

    newState.currentClaim = claimData;

    // Catat log aksi
    const spiceInfo = SPICE_META[claimData.spice];
    newState.actionLogs.push({
      text: `🃏 [${currentPlayer.name}] meletakkan kartu tertutup dengan klaim [${spiceInfo.emoji} ${spiceInfo.name} ${claimData.number}]. (Sisa kartu di tangan: ${player.hand.length})`,
      timestamp: Date.now()
    });

    // Cek jika kartu ini adalah kartu terakhir di tangan pemain!
    if (player.hand.length === 0) {
      newState.lastCardPlayerId = currentPlayer.id;
      newState.actionLogs.push({
        text: `⚠️ [${currentPlayer.name}] telah memainkan KARTU TERAKHIR di tangannya! Pemain lain berkesempatan menantangnya sekarang.`,
        timestamp: Date.now()
      });
    }

    // 4. Pindahkan giliran ke pemain berikutnya
    const nextTurnIndex = (newState.turnIndex + 1) % newState.turnOrder.length;
    newState.turnIndex = nextTurnIndex;
    newState.currentTurnPlayerId = newState.turnOrder[nextTurnIndex];

    await DB.updateGameState(currentRoom.code, 'spicy', newState);

    selectedCardId = null;
    selectedClaimSpice = null;
    selectedClaimNumber = null;
    isSubmitting = false;
  }

  /**
   * AKSI 2: PASS (LEWATI GILIRAN & AMBIL 1 KARTU DARI DEK)
   */
  async function passTurn() {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    const state = getGameState(currentRoom);

    if (state.status !== 'playing') {
      UI.Toast('Permainan sedang tidak dalam fase aktif!', 'warning');
      return;
    }

    if (state.currentTurnPlayerId !== currentPlayer.id) {
      UI.Toast('Bukan giliranmu!', 'warning');
      return;
    }

    isSubmitting = true;
    UI.Sound.tick();

    const newState = JSON.parse(JSON.stringify(state));
    const players = newState.players;
    const player = players[currentPlayer.id];

    // 1. Berikan piala ke pemain sebelumnya jika dia habis kartu dan tidak ditantang
    resolveUnchallengedLastCard(newState);
    if (newState.status === 'game_over') {
      finalizeGame(newState);
      await DB.updateGameState(currentRoom.code, 'spicy', newState);
      isSubmitting = false;
      return;
    }

    // 2. Ambil 1 kartu dari dek
    if (newState.deck.length === 0) {
      newState.status = 'game_over';
      newState.endReason = 'deck_empty';
      finalizeGame(newState);
      await DB.updateGameState(currentRoom.code, 'spicy', newState);
      isSubmitting = false;
      return;
    }

    const drawnCard = newState.deck.shift();

    // Cek apakah kartu yang terambil adalah kartu Kiamat (World's End)!
    if (drawnCard.type === 'worlds_end') {
      UI.Sound.fanfare();
      newState.actionLogs.push({
        text: `☄️ KIAMAT TIBA! Kartu [World's End] terambil dari dek saat [${currentPlayer.name}] melakukan Pass! Permainan berakhir seketika!`,
        timestamp: Date.now()
      });
      newState.status = 'game_over';
      newState.endReason = 'worlds_end';
      finalizeGame(newState);
      await DB.updateGameState(currentRoom.code, 'spicy', newState);
      isSubmitting = false;
      return;
    }

    // Tambahkan kartu ke tangan pemain
    player.hand.push(drawnCard);

    newState.actionLogs.push({
      text: `📥 [${currentPlayer.name}] memilih PASS dan mengambil 1 kartu dari dek.`,
      timestamp: Date.now()
    });

    // 3. Pindahkan giliran ke pemain berikutnya
    const nextTurnIndex = (newState.turnIndex + 1) % newState.turnOrder.length;
    newState.turnIndex = nextTurnIndex;
    newState.currentTurnPlayerId = newState.turnOrder[nextTurnIndex];

    await DB.updateGameState(currentRoom.code, 'spicy', newState);

    selectedCardId = null;
    isSubmitting = false;
  }

  /**
   * AKSI 3: TANTANGAN (CHALLENGE ANGKA ATAU REMPAH)
   * Dapat ditekan oleh siapa saja (kecuali pemain yang meletakkan kartu teratas)
   * @param {string} challengeType - 'number' | 'spice'
   */
  async function submitChallenge(challengeType) {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    const state = getGameState(currentRoom);

    if (state.status !== 'playing') {
      UI.Toast('Tantangan tidak dapat dilakukan saat ini!', 'warning');
      return;
    }

    if (!state.stack || state.stack.length === 0 || !state.currentClaim) {
      UI.Toast('Tidak ada kartu di meja untuk ditantang!', 'warning');
      return;
    }

    // Tidak boleh menantang kartu miliknya sendiri
    if (state.currentClaim.playerId === currentPlayer.id) {
      UI.Toast('Kamu tidak bisa menantang kartu yang baru saja kamu mainkan!', 'warning');
      return;
    }

    isSubmitting = true;
    UI.Logger('SPICY', `Challenge initiated by [${currentPlayer.name}], type: [${challengeType}]`);

    const newState = JSON.parse(JSON.stringify(state));
    const players = newState.players;
    const challenger = players[currentPlayer.id];
    const topStackEntry = newState.stack[newState.stack.length - 1];
    const revealedCard = topStackEntry.card;
    const claim = newState.currentClaim;
    const defender = players[claim.playerId];

    // Evaluasi Bagian yang Ditantang Sesuai Aturan Resmi Spicy:
    let isClaimValid = false;

    if (challengeType === 'number') {
      // Menuduh ANGKANYA SALAH
      if (revealedCard.type === 'wild_spice') {
        // Wild Spice sah untuk rempah, tapi TIDAK punya angka -> Klaim angka dianggap SALAH
        isClaimValid = false;
      } else if (revealedCard.type === 'wild_number') {
        // Wild Number sah untuk semua angka 1-10 -> Klaim angka dianggap BENAR
        isClaimValid = true;
      } else {
        // Kartu normal
        isClaimValid = (revealedCard.number === claim.number);
      }
    } else if (challengeType === 'spice') {
      // Menuduh REMPAHNYA SALAH
      if (revealedCard.type === 'wild_number') {
        // Wild Number sah untuk angka, tapi TIDAK punya rempah -> Klaim rempah dianggap SALAH
        isClaimValid = false;
      } else if (revealedCard.type === 'wild_spice') {
        // Wild Spice sah untuk semua rempah -> Klaim rempah dianggap BENAR
        isClaimValid = true;
      } else {
        // Kartu normal
        isClaimValid = (revealedCard.spice === claim.spice);
      }
    }

    // Tentukan Pemenang & Pecundang Tantangan:
    // Jika klaim BENAR: Defender MENANG, Penantang KALAH
    // Jika klaim SALAH: Penantang MENANG, Defender KALAH
    let winnerId = isClaimValid ? defender.id : challenger.id;
    let loserId = isClaimValid ? challenger.id : defender.id;

    const winner = players[winnerId];
    const loser = players[loserId];
    const capturedCardsCount = newState.stack.length;

    // 1. Pemenang Mengambil Seluruh Kartu di Tumpukan Tengah (+1 Poin per Kartu)
    winner.wonCardsCount += capturedCardsCount;
    newState.stack = [];
    newState.currentClaim = null;

    // 2. Pecundang Mengambil 2 Kartu Penalti dari Dek
    const penaltyCards = [];
    let worldsEndHit = false;

    for (let p = 0; p < 2; p++) {
      if (newState.deck.length > 0) {
        const cardDrawn = newState.deck.shift();
        if (cardDrawn.type === 'worlds_end') {
          worldsEndHit = true;
          break;
        } else {
          penaltyCards.push(cardDrawn);
        }
      }
    }
    loser.hand.push(...penaltyCards);

    // 3. Cek Status Kartu Terakhir Defender (apakah tangan defender tadi 0 kartu?)
    let defenderGotTrophy = false;
    const wasDefenderLastCard = (newState.lastCardPlayerId === defender.id);

    if (wasDefenderLastCard) {
      if (winnerId === defender.id) {
        // Defender berhasil membuktikan kebenaran kartu terakhirnya!
        if (newState.trophiesAvailable > 0) {
          defender.trophiesCount += 1;
          newState.trophiesAvailable -= 1;
          defenderGotTrophy = true;

          // Defender mengambil 6 kartu baru dari dek
          const freshCards = [];
          for (let f = 0; f < 6; f++) {
            if (newState.deck.length > 0) {
              const c = newState.deck.shift();
              if (c.type === 'worlds_end') {
                worldsEndHit = true;
                break;
              } else {
                freshCards.push(c);
              }
            }
          }
          defender.hand.push(...freshCards);
        }
      } else {
        // Defender tertangkap basah berbohong pada kartu terakhirnya!
        // Tidak dapat piala, dan menerima 2 kartu penalti (sehingga tangannya tidak kosong lagi)
      }
      newState.lastCardPlayerId = null;
    }

    // 4. Pecundang Tantangan Menjadi Pemain Pertama yang Memulai Tumpukan Baru!
    const loserTurnIndex = newState.turnOrder.indexOf(loserId);
    newState.turnIndex = loserTurnIndex;
    newState.currentTurnPlayerId = loserId;

    // 5. Susun Hasil Tantangan untuk Modal / Banner Visual
    const challengeTypeName = challengeType === 'number' ? 'ANGKA 🔢' : 'REMPAH 🌶️';
    const challengeResult = {
      challengerId: challenger.id,
      challengerName: challenger.name,
      defenderId: defender.id,
      defenderName: defender.name,
      challengeType: challengeType,
      challengeTypeName: challengeTypeName,
      claim: claim,
      revealedCard: revealedCard,
      isClaimValid: isClaimValid,
      winnerId: winner.id,
      winnerName: winner.name,
      loserId: loser.id,
      loserName: loser.name,
      cardsWonCount: capturedCardsCount,
      defenderGotTrophy: defenderGotTrophy,
      timestamp: Date.now()
    };
    newState.challengeResult = challengeResult;

    // Log Hasil Tantangan
    newState.actionLogs.push({
      text: `⚡ [${challenger.name}] MENANTANG [${defender.name}] pada bagian [${challengeTypeName}]! Kartu asli dibuka: [${revealedCard.name}]. Hasil klaim: ${isClaimValid ? 'BENAR' : 'SALAH'}! [${winner.name}] MENANG tantangan dan mengamankan ${capturedCardsCount} kartu (+${capturedCardsCount} Poin). [${loser.name}] mengambil 2 kartu penalti dan memulai tumpukan baru.`,
      timestamp: Date.now()
    });

    // 6. Evaluasi Kondisi Akhir Permainan
    if (worldsEndHit) {
      newState.status = 'game_over';
      newState.endReason = 'worlds_end';
      newState.actionLogs.push({
        text: `☄️ Kartu World's End terambil saat penarikan penalti! Permainan langsung selesai!`,
        timestamp: Date.now()
      });
      finalizeGame(newState);
    } else if (winner.trophiesCount >= 2) {
      newState.status = 'game_over';
      newState.winnerPlayerId = winner.id;
      newState.endReason = 'trophy_double';
      newState.actionLogs.push({
        text: `👑 [${winner.name}] berhasil mengumpulkan 2 PIALA! Menang Instan sebagai Juara Rempah Terpedas!`,
        timestamp: Date.now()
      });
      finalizeGame(newState);
    } else if (newState.trophiesAvailable === 0) {
      newState.status = 'game_over';
      newState.endReason = 'trophies_depleted';
      newState.actionLogs.push({
        text: `🏆 Seluruh 3 Piala telah terambil! Permainan selesai.`,
        timestamp: Date.now()
      });
      finalizeGame(newState);
    } else if (newState.deck.length === 0) {
      newState.status = 'game_over';
      newState.endReason = 'deck_empty';
      finalizeGame(newState);
    } else {
      newState.status = 'challenge_revealed';
    }

    if (isClaimValid) {
      UI.Sound.fanfare();
    } else {
      UI.Sound.pop();
    }

    await DB.updateGameState(currentRoom.code, 'spicy', newState);
    isSubmitting = false;
  }

  /**
   * Tutup Tampilan Reveal Tantangan dan Lanjutkan Game
   */
  async function dismissChallengeReveal() {
    if (!currentRoom || isSubmitting) return;
    const state = getGameState(currentRoom);
    if (state.status !== 'challenge_revealed') return;

    isSubmitting = true;
    UI.Sound.click();

    await DB.updateGameState(currentRoom.code, 'spicy', {
      status: 'playing',
      challengeResult: null
    });

    isSubmitting = false;
  }

  /**
   * Hitung Skor Akhir Resmi Sesuai Board Game Spicy:
   * Skor = (Kartu Tumpukan Menang x 1) + (Piala x 10) - (Sisa Kartu di Tangan x 1)
   */
  function finalizeGame(state) {
    const playersList = Object.values(state.players || {});
    const standings = playersList.map(p => {
      const wonCardsPts = (p.wonCardsCount || 0) * 1;
      const trophyPts = (p.trophiesCount || 0) * 10;
      const handPenalty = (p.hand?.length || 0) * 1;
      const totalScore = wonCardsPts + trophyPts - handPenalty;

      return {
        id: p.id,
        name: p.name,
        wonCards: p.wonCardsCount || 0,
        trophies: p.trophiesCount || 0,
        handCount: p.hand?.length || 0,
        totalScore: totalScore,
        isInstantWinner: (p.trophiesCount >= 2)
      };
    });

    // Urutkan: Pemenang instan 2 piala di paling atas, lalu skor tertinggi
    standings.sort((a, b) => {
      if (a.isInstantWinner && !b.isInstantWinner) return -1;
      if (!a.isInstantWinner && b.isInstantWinner) return 1;
      return b.totalScore - a.totalScore;
    });

    standings.forEach((s, idx) => {
      s.rank = idx + 1;
    });

    state.finalStandings = standings;
    if (!state.winnerPlayerId && standings.length > 0) {
      state.winnerPlayerId = standings[0].id;
    }
  }

  /**
   * ==========================================================================
   * RENDER VIEW: PAPAN PERMAINAN SPICY
   * ==========================================================================
   */
  function render(container, roomData, player) {
    if (!container || !roomData) return;
    currentRoom = roomData;
    currentPlayer = player;

    UI.setTheme('spicy');

    const state = getGameState(roomData);

    // Jika permainan belum dimulai
    if (!state.status) {
      renderPreGameView(container, roomData, player);
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
   * View Pre-Game (Lobby Sebelum Host Memulai Spicy)
   */
  function renderPreGameView(container, roomData, player) {
    const isHost = player && player.isHost;
    const playersList = Object.values(roomData.players || {});

    const contentHTML = `
      <div class="max-w-2xl mx-auto py-8 text-center space-y-6">
        <div class="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-xl shadow-orange-500/25 animate-bounce">
          <span class="text-5xl">🌶️</span>
        </div>

        <div>
          <span class="px-3.5 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-300 font-display font-bold text-xs uppercase tracking-wider">
            100 Kartu Rempah & Kiamat
          </span>
          <h2 class="font-display font-black text-3xl sm:text-4xl text-stone-900 mt-2">Spicy</h2>
          <p class="font-body text-stone-600 text-sm max-w-lg mx-auto mt-2 leading-relaxed">
            Bluffing kartu rempah Wasabi, Cabai, dan Lada dengan tantangan spesifik: apakah angkanya yang bohong, atau bumbunya yang salah?
          </p>
        </div>

        <!-- Aturan Kunci Ringkas -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div class="p-4 rounded-2xl bg-white border-2 border-stone-900/5 shadow-xs">
            <div class="text-xl mb-1">🃏</div>
            <h5 class="font-display font-bold text-xs text-stone-900">Mulai dari 1, 2, 3</h5>
            <p class="font-body text-[11px] text-stone-500 mt-1">Kartu pertama di tumpukan baru wajib angka 1-3. Kartu berikutnya wajib angka lebih besar!</p>
          </div>
          <div class="p-4 rounded-2xl bg-white border-2 border-stone-900/5 shadow-xs">
            <div class="text-xl mb-1">⚡</div>
            <h5 class="font-display font-bold text-xs text-stone-900">Tantangan Spesifik</h5>
            <p class="font-body text-[11px] text-stone-500 mt-1">Tantang ANGKA atau REMPAH. Jika tuduhanmu salah pada bagian tersebut, kamu yang kalah!</p>
          </div>
          <div class="p-4 rounded-2xl bg-white border-2 border-stone-900/5 shadow-xs">
            <div class="text-xl mb-1">🏆</div>
            <h5 class="font-display font-bold text-xs text-stone-900">2 Piala = Menang</h5>
            <p class="font-body text-[11px] text-stone-500 mt-1">Habiskan kartu di tanganmu untuk meraih piala (+10 poin). Koleksi 2 piala untuk menang instan!</p>
          </div>
        </div>

        <!-- Daftar Pemain -->
        <div class="p-4 rounded-3xl bg-white border-2 border-stone-900/5 shadow-sm text-left">
          <div class="flex items-center justify-between mb-3 border-b border-stone-100 pb-2">
            <span class="font-display font-bold text-xs text-stone-700">Pemain di Meja (${playersList.length}/6)</span>
            <span class="text-xs text-stone-400 font-body">Minimal 2 Pemain</span>
          </div>
          <div class="flex flex-wrap gap-2">
            ${playersList.map(p => `
              <div class="px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-stone-800 text-xs font-display font-bold flex items-center gap-1.5">
                <span>${p.isHost ? '👑' : '🌶️'}</span>
                <span>${p.name}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Tombol Mulai -->
        <div class="pt-2">
          ${isHost ? `
            <button 
              onclick="SpicyGame.startGame()"
              class="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-display font-black text-base shadow-xl shadow-orange-600/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto"
            >
              <i data-lucide="play" class="w-5 h-5"></i>
              <span>Bagikan Kartu & Mulai Bermain 🔥</span>
            </button>
          ` : `
            <div class="p-3.5 rounded-2xl bg-orange-50 border border-orange-200 text-orange-900 font-display font-semibold text-xs flex items-center justify-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping"></span>
              <span>Menunggu Host memulai permainan...</span>
            </div>
          `}
        </div>
      </div>
    `;

    container.innerHTML = contentHTML;
    UI.refreshIcons();
  }

  /**
   * View Aktif Game Spicy (Meja Tengah, Tangan Pemain, Panel Kontrol)
   */
  function renderActiveGameView(container, roomData, player, state) {
    const isMyTurn = (state.currentTurnPlayerId === player.id);
    const myData = state.players[player.id] || { hand: [], trophiesCount: 0, wonCardsCount: 0 };
    const turnPlayer = state.players[state.currentTurnPlayerId];

    // Status Klaim Teratas
    const claim = state.currentClaim;
    const stackCount = state.stack?.length || 0;
    const canChallenge = stackCount > 0 && claim && claim.playerId !== player.id;

    // Hitung sisa kartu dek
    const deckCount = state.deck?.length || 0;

    // Render Piala Meja
    const trophiesHTML = Array.from({ length: 3 }).map((_, i) => {
      const isTaken = i >= state.trophiesAvailable;
      return `
        <div class="w-9 h-9 rounded-2xl flex items-center justify-center border-2 transition-all ${
          isTaken 
            ? 'bg-stone-100 border-stone-200 text-stone-300 opacity-40' 
            : 'bg-amber-100 border-amber-400 text-amber-600 shadow-sm animate-pulse'
        }" title="${isTaken ? 'Piala sudah terambil' : 'Piala Tersedia (+10 Poin)'}">
          <span class="text-lg">🏆</span>
        </div>
      `;
    }).join('');

    // Pemain Lain di Meja
    const otherPlayersHTML = state.turnOrder.map(pid => {
      const p = state.players[pid];
      if (!p) return '';
      const isCurrentTurn = (pid === state.currentTurnPlayerId);
      const isMe = (pid === player.id);

      return `
        <div class="p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
          isCurrentTurn 
            ? 'bg-orange-50 border-orange-400 ring-2 ring-orange-400/20 shadow-sm' 
            : 'bg-white border-stone-900/5'
        }">
          <div class="flex items-center gap-2 min-w-0">
            <div class="w-7 h-7 rounded-xl bg-stone-900 text-white font-display font-bold text-xs flex items-center justify-center shrink-0">
              ${p.name.charAt(0).toUpperCase()}
            </div>
            <div class="truncate">
              <div class="font-display font-bold text-xs text-stone-800 flex items-center gap-1">
                <span class="truncate">${p.name}</span>
                ${isMe ? '<span class="text-[10px] text-orange-600 font-semibold">(Kamu)</span>' : ''}
              </div>
              <div class="text-[10px] text-stone-500 font-body">
                📦 ${p.wonCardsCount} Kartu Menang
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <!-- Jumlah Kartu di Tangan -->
            <span class="px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700 font-display font-bold text-xs" title="Kartu di Tangan">
              🃏 ${p.hand?.length || 0}
            </span>
            <!-- Piala yang Didapat -->
            ${p.trophiesCount > 0 ? `
              <span class="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 font-display font-bold text-xs" title="Piala">
                🏆 ${p.trophiesCount}
              </span>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Kartu di Tangan Pemain
    const handCardsHTML = (myData.hand || []).map((card, idx) => {
      const isSelected = (selectedCardId === card.id);
      return renderSingleCard(card, isSelected, idx);
    }).join('');

    // Panel Klaim (Hanya tampil jika giliran pemain aktif)
    const claimBoxHTML = isMyTurn ? renderClaimBox(state.currentClaim) : '';

    // Modal Hasil Tantangan (Jika ada tantangan baru saja dibuka)
    const challengeModalHTML = (state.status === 'challenge_revealed' && state.challengeResult)
      ? renderChallengeRevealModal(state.challengeResult)
      : '';

    const contentHTML = `
      <div class="w-full max-w-5xl mx-auto space-y-5 pb-8">
        
        <!-- Header Meja Spicy -->
        <div class="bg-white rounded-3xl border-2 border-stone-900/10 p-4 sm:p-5 shadow-joyful flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shadow-md text-2xl">
              🌶️
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-display font-black text-lg text-stone-900">Meja Rempah Spicy</h3>
                <span class="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-display font-bold border border-orange-200">
                  Resmi 100 Kartu
                </span>
              </div>
              <p class="font-body text-xs text-stone-500">
                Giliran saat ini: <b class="text-orange-600 font-display">${turnPlayer?.name || 'Pemain'}</b>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <!-- Piala Tersedia -->
            <div class="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-2xl border border-stone-200/80">
              <span class="text-xs font-display font-bold text-stone-500 mr-1">Piala:</span>
              ${trophiesHTML}
            </div>

            <!-- Dek Kartu -->
            <div class="flex items-center gap-2 bg-stone-50 px-3.5 py-1.5 rounded-2xl border border-stone-200/80" title="Sisa Kartu di Dek">
              <span class="text-xs font-display font-bold text-stone-400">DEK:</span>
              <span class="font-display font-black text-sm text-stone-800">${deckCount} 🎴</span>
            </div>

            <button 
              onclick="GameRules.open('spicy', 'lobby')" 
              class="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-display font-bold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              title="Lihat Aturan Main"
            >
              <i data-lucide="book-open" class="w-3.5 h-3.5 text-orange-600"></i>
              <span>Aturan</span>
            </button>
          </div>
        </div>

        <!-- Arena Meja Tengah: Tumpukan & Tantangan -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          <!-- Kolom Kiri: Tumpukan Tengah & Tantangan (7 Kolom) -->
          <div class="lg:col-span-7 flex flex-col gap-4">
            <div class="bg-gradient-to-b from-stone-900 to-stone-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden border-4 border-stone-800">
              
              <!-- Background Accent -->
              <div class="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-orange-600/10 blur-2xl pointer-events-none"></div>

              <div class="flex items-center justify-between mb-4">
                <span class="text-xs font-display font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <i data-lucide="layers" class="w-4 h-4 text-orange-400"></i>
                  <span>Tumpukan Kartu Meja</span>
                </span>
                <span class="px-3 py-1 rounded-full bg-stone-800 border border-stone-700 text-orange-400 font-display font-bold text-xs">
                  ${stackCount} Kartu Tertutup (+${stackCount} Poin)
                </span>
              </div>

              <!-- Kartu Klaim Teratas -->
              <div class="my-4 py-4 flex flex-col items-center justify-center text-center">
                ${claim ? `
                  <div class="relative group">
                    <!-- Layer Tumpukan Kartu (Visual 3D Stack) -->
                    <div class="w-40 h-56 rounded-2xl bg-stone-800 border-2 border-stone-700 absolute -bottom-2 -right-2 transform rotate-3 opacity-60"></div>
                    <div class="w-40 h-56 rounded-2xl bg-stone-800 border-2 border-stone-700 absolute -bottom-1 -right-1 transform -rotate-2 opacity-80"></div>
                    
                    <!-- Kartu Klaim Teratas -->
                    <div class="w-40 h-56 rounded-2xl bg-gradient-to-br ${SPICE_META[claim.spice]?.gradient || 'from-orange-500 to-amber-600'} border-3 border-white/20 p-4 flex flex-col justify-between shadow-2xl relative select-none">
                      <div class="flex items-center justify-between">
                        <span class="font-display font-black text-2xl text-white">${claim.number}</span>
                        <span class="text-xl">${SPICE_META[claim.spice]?.emoji || '🌶️'}</span>
                      </div>
                      <div class="text-center my-auto">
                        <div class="text-4xl filter drop-shadow">${SPICE_META[claim.spice]?.emoji || '🌶️'}</div>
                        <div class="font-display font-black text-base text-white mt-1 uppercase tracking-wider">
                          ${SPICE_META[claim.spice]?.name || ''}
                        </div>
                      </div>
                      <div class="flex items-center justify-between transform rotate-180">
                        <span class="font-display font-black text-2xl text-white">${claim.number}</span>
                        <span class="text-xl">${SPICE_META[claim.spice]?.emoji || '🌶️'}</span>
                      </div>
                    </div>
                  </div>

                  <div class="mt-4">
                    <span class="text-xs text-stone-400 font-body">Dideklarasikan oleh:</span>
                    <h4 class="font-display font-black text-base text-orange-400">${claim.playerName}</h4>
                  </div>
                ` : `
                  <div class="w-40 h-56 rounded-2xl border-2 border-dashed border-stone-700 flex flex-col items-center justify-center text-stone-500 p-4">
                    <span class="text-3xl mb-2">🍽️</span>
                    <span class="font-display font-bold text-xs text-stone-400">Meja Kosong</span>
                    <span class="text-[10px] text-stone-500 text-center mt-1">Mulai tumpukan baru dengan angka 1, 2, atau 3!</span>
                  </div>
                `}
              </div>

              <!-- Tombol Tantangan (Bisa Ditekan Siapa Saja Kecuali Pemilik Klaim) -->
              <div class="mt-4 pt-4 border-t border-stone-800">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-display font-bold text-stone-300">Tepuk Meja & Tantang Kartu Ini:</span>
                  ${!canChallenge ? `
                    <span class="text-[10px] text-stone-500">
                      ${claim && claim.playerId === player.id ? 'Kamu pemilik kartu ini' : 'Menunggu kartu di meja'}
                    </span>
                  ` : ''}
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <button 
                    onclick="SpicyGame.submitChallenge('number')"
                    ${!canChallenge ? 'disabled' : ''}
                    class="py-3 px-3 rounded-2xl font-display font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                      canChallenge 
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-stone-950 shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer' 
                        : 'bg-stone-800 text-stone-600 opacity-50 cursor-not-allowed'
                    }"
                  >
                    <span class="text-sm">🔢</span>
                    <span>Tantang ANGKA!</span>
                    <span class="text-[10px] opacity-80 font-normal">Tuduh angkanya bohong</span>
                  </button>

                  <button 
                    onclick="SpicyGame.submitChallenge('spice')"
                    ${!canChallenge ? 'disabled' : ''}
                    class="py-3 px-3 rounded-2xl font-display font-bold text-xs flex flex-col items-center justify-center gap-1 transition-all ${
                      canChallenge 
                        ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white shadow-lg shadow-rose-500/20 active:scale-95 cursor-pointer' 
                        : 'bg-stone-800 text-stone-600 opacity-50 cursor-not-allowed'
                    }"
                  >
                    <span class="text-sm">🌶️</span>
                    <span>Tantang REMPAH!</span>
                    <span class="text-[10px] opacity-80 font-normal">Tuduh bumbunya bohong</span>
                  </button>
                </div>
              </div>

            </div>
          </div>

          <!-- Kolom Kanan: Meja Lawan & Log Aktivitas (5 Kolom) -->
          <div class="lg:col-span-5 flex flex-col gap-4">
            <!-- Daftar Pemain di Meja -->
            <div class="bg-white rounded-3xl border-2 border-stone-900/10 p-5 shadow-joyful">
              <h4 class="font-display font-bold text-xs text-stone-500 uppercase tracking-wider mb-3">
                Kondisi Meja Pemain
              </h4>
              <div class="space-y-2">
                ${otherPlayersHTML}
              </div>
            </div>

            <!-- Log Aktivitas -->
            <div class="bg-white rounded-3xl border-2 border-stone-900/10 p-5 shadow-joyful flex-1 flex flex-col">
              <h4 class="font-display font-bold text-xs text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <i data-lucide="history" class="w-3.5 h-3.5 text-orange-600"></i>
                <span>Riwayat Putaran</span>
              </h4>
              <div class="space-y-2 overflow-y-auto max-h-48 pr-1 font-body text-xs text-stone-600">
                ${(state.actionLogs || []).slice(-6).reverse().map(log => `
                  <div class="p-2 rounded-xl bg-stone-50 border border-stone-200/60 leading-relaxed">
                    ${log.text}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

        </div>

        <!-- Area Giliran Anda & Tangan Kartu -->
        <div class="bg-white rounded-3xl border-2 border-stone-900/10 p-5 sm:p-6 shadow-joyful space-y-4">
          
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div class="flex items-center gap-2">
              <i data-lucide="hand" class="w-5 h-5 text-orange-600"></i>
              <h3 class="font-display font-black text-base text-stone-900">Kartu di Tanganmu</h3>
              <span class="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-display font-bold">
                ${myData.hand?.length || 0} Kartu
              </span>
            </div>

            <!-- Indikator Giliran -->
            <div>
              ${isMyTurn ? `
                <div class="px-4 py-1.5 rounded-full bg-emerald-500 text-white font-display font-bold text-xs flex items-center gap-2 animate-pulse shadow-md shadow-emerald-500/20">
                  <span class="w-2 h-2 rounded-full bg-white"></span>
                  <span>GILIRANMU! Pilih kartu & buat klaim</span>
                </div>
              ` : `
                <div class="px-3 py-1 rounded-full bg-stone-100 text-stone-500 font-display font-bold text-xs">
                  Menunggu giliran [${turnPlayer?.name || 'Pemain Lain'}]
                </div>
              `}
            </div>
          </div>

          <!-- Rack Kartu di Tangan -->
          <div class="flex gap-3 overflow-x-auto py-2 px-1 no-scrollbar">
            ${handCardsHTML}
          </div>

          <!-- Panel Konfigurasi Klaim & Tombol Aksi (Tampil Jika Giliran Pemain) -->
          ${claimBoxHTML}

        </div>

      </div>

      <!-- Modal Reveal Hasil Tantangan -->
      ${challengeModalHTML}
    `;

    container.innerHTML = contentHTML;
    UI.refreshIcons();
  }

  /**
   * Render 1 Kartu Spesifik di Tangan Pemain
   */
  function renderSingleCard(card, isSelected, idx) {
    let cardContent = '';
    let bgStyle = '';
    let borderStyle = isSelected ? 'border-4 border-amber-400 ring-4 ring-amber-400/30 scale-105 z-10' : 'border-2 border-stone-900/10 hover:-translate-y-2';

    if (card.type === 'normal') {
      const meta = SPICE_META[card.spice];
      bgStyle = `bg-gradient-to-br ${meta.gradient} text-white`;
      cardContent = `
        <div class="flex items-center justify-between">
          <span class="font-display font-black text-xl">${card.number}</span>
          <span>${meta.emoji}</span>
        </div>
        <div class="text-center my-auto">
          <div class="text-3xl">${meta.emoji}</div>
          <div class="font-display font-bold text-xs mt-1 uppercase tracking-wider">${meta.name}</div>
        </div>
        <div class="flex items-center justify-between transform rotate-180">
          <span class="font-display font-black text-xl">${card.number}</span>
          <span>${meta.emoji}</span>
        </div>
      `;
    } else if (card.type === 'wild_spice') {
      bgStyle = 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 text-stone-950';
      cardContent = `
        <div class="flex items-center justify-between">
          <span class="font-display font-black text-xs uppercase tracking-wider">WILD</span>
          <span>🌶️🟢🔵</span>
        </div>
        <div class="text-center my-auto">
          <div class="text-3xl">✨</div>
          <div class="font-display font-black text-xs uppercase tracking-tight">Rempah Bebas</div>
          <div class="text-[9px] font-semibold opacity-75 mt-0.5">Semua Bumbu Sah</div>
        </div>
        <div class="text-[9px] font-display font-bold text-center opacity-80">
          TIDAK ADA ANGKA
        </div>
      `;
    } else if (card.type === 'wild_number') {
      bgStyle = 'bg-gradient-to-br from-purple-600 via-pink-600 to-rose-600 text-white';
      cardContent = `
        <div class="flex items-center justify-between">
          <span class="font-display font-black text-xs uppercase tracking-wider">WILD</span>
          <span class="font-display font-black text-sm">1-10</span>
        </div>
        <div class="text-center my-auto">
          <div class="text-3xl">🔢</div>
          <div class="font-display font-black text-xs uppercase tracking-tight">Angka Bebas</div>
          <div class="text-[9px] opacity-75 mt-0.5">Semua Angka Sah</div>
        </div>
        <div class="text-[9px] font-display font-bold text-center opacity-80">
          TIDAK ADA REMPAH
        </div>
      `;
    }

    return `
      <div 
        onclick="SpicyGame.selectCard('${card.id}')"
        class="w-28 h-40 rounded-2xl p-3 flex flex-col justify-between shadow-md shrink-0 cursor-pointer transition-all duration-200 select-none ${bgStyle} ${borderStyle}"
        title="Klik untuk memilih kartu ini"
      >
        ${cardContent}
      </div>
    `;
  }

  /**
   * Render Box Pengaturan Klaim (Bumbu & Angka)
   */
  function renderClaimBox(currentClaim) {
    const isNewStack = !currentClaim;
    const isAfterTen = currentClaim && currentClaim.number === 10;
    const canChangeSpice = isNewStack || isAfterTen;

    // Tentukan Rempah Default
    const activeSpice = selectedClaimSpice || (canChangeSpice ? 'chili' : currentClaim.spice);

    // Opsi Rempah
    const spiceOptions = ['chili', 'wasabi', 'pepper'].map(spiceKey => {
      const meta = SPICE_META[spiceKey];
      const isLocked = !canChangeSpice && spiceKey !== currentClaim.spice;
      const isSelected = activeSpice === spiceKey;

      let btnClass = isSelected
        ? `bg-gradient-to-r ${meta.gradient} text-white shadow-md font-black ring-2 ring-orange-500/30`
        : isLocked
          ? 'bg-stone-100 text-stone-400 opacity-40 cursor-not-allowed'
          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold';

      return `
        <button
          type="button"
          ${isLocked ? 'disabled' : ''}
          onclick="SpicyGame.selectClaimSpice('${spiceKey}')"
          class="flex-1 py-2.5 px-3 rounded-xl font-display text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${btnClass}"
        >
          <span>${meta.emoji}</span>
          <span>${meta.name}</span>
          ${isLocked ? '<span class="text-[9px]">(Terkunci)</span>' : ''}
        </button>
      `;
    }).join('');

    // Opsi Angka 1-10
    const numberButtons = Array.from({ length: 10 }, (_, i) => i + 1).map(num => {
      let isValidNum = true;

      if (isNewStack || isAfterTen) {
        isValidNum = (num >= 1 && num <= 3);
      } else {
        isValidNum = (num > currentClaim.number);
      }

      const isSelected = (parseInt(selectedClaimNumber, 10) === num);

      let numClass = isSelected
        ? 'bg-orange-600 text-white font-black shadow-md ring-2 ring-orange-400'
        : isValidNum
          ? 'bg-stone-100 hover:bg-orange-100 hover:text-orange-700 text-stone-800 font-bold cursor-pointer active:scale-95'
          : 'bg-stone-100/50 text-stone-300 opacity-40 cursor-not-allowed';

      return `
        <button
          type="button"
          ${!isValidNum ? 'disabled' : ''}
          onclick="SpicyGame.selectClaimNumber(${num})"
          class="w-10 h-10 rounded-xl font-display text-sm flex items-center justify-center transition-all ${numClass}"
        >
          ${num}
        </button>
      `;
    }).join('');

    const selectedCard = selectedCardId ? (currentRoom.spicyGame?.players[currentPlayer.id]?.hand || []).find(c => c.id === selectedCardId) : null;

    return `
      <div class="mt-4 p-5 rounded-2xl bg-orange-50/70 border-2 border-orange-200/80 space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 class="font-display font-black text-sm text-stone-900">
              Deklarasi Klaim Kartu (Boleh Jujur / Boleh Gertak!)
            </h4>
            <p class="font-body text-xs text-stone-600 mt-0.5">
              ${isNewStack 
                ? '🌟 Tumpukan baru: Wajib deklarasikan angka 1, 2, atau 3 dengan rempah bebas.' 
                : isAfterTen
                  ? '🔥 Setelah angka 10: Wajib ulang angka 1, 2, atau 3 (boleh ganti rempah)!'
                  : `🌶️ Lanjutan: Wajib rempah yang sama (${SPICE_META[currentClaim.spice]?.name}) dan angka lebih tinggi (> ${currentClaim.number}).`
              }
            </p>
          </div>

          <div class="text-xs font-display font-semibold text-stone-500">
            ${selectedCard ? `Kartu Asli: <b>${selectedCard.name}</b>` : '⚠️ Belum memilih kartu dari tangan'}
          </div>
        </div>

        <!-- 1. Pilihan Rempah -->
        <div>
          <label class="block font-display font-bold text-xs text-stone-700 mb-1.5">1. Pilih Jenis Rempah Klaim:</label>
          <div class="flex gap-2">
            ${spiceOptions}
          </div>
        </div>

        <!-- 2. Pilihan Angka -->
        <div>
          <label class="block font-display font-bold text-xs text-stone-700 mb-1.5">2. Pilih Angka Klaim:</label>
          <div class="flex flex-wrap gap-2">
            ${numberButtons}
          </div>
        </div>

        <!-- Tombol Eksekusi Aksi -->
        <div class="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onclick="SpicyGame.playCard()"
            class="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-display font-black text-sm shadow-lg shadow-orange-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <i data-lucide="send" class="w-4 h-4"></i>
            <span>Letakkan Kartu & Klaim Tertutup 🃏</span>
          </button>

          <button
            type="button"
            onclick="SpicyGame.passTurn()"
            class="w-full sm:w-auto py-3.5 px-6 rounded-2xl bg-white hover:bg-stone-100 text-stone-700 border-2 border-stone-200 font-display font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            title="Lewati giliran dan ambil 1 kartu dari dek"
          >
            <i data-lucide="inbox" class="w-4 h-4 text-stone-500"></i>
            <span>Pass (Ambil 1 Kartu Dek)</span>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Render Modal Hasil Reveal Tantangan
   */
  function renderChallengeRevealModal(result) {
    const isWinnerMe = (result.winnerId === currentPlayer.id);
    const claimMeta = SPICE_META[result.claim.spice] || { name: result.claim.spice, emoji: '🌶️' };

    return `
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/70 backdrop-blur-sm animate-fade-in">
        <div class="w-full max-w-lg bg-white rounded-3xl border-3 border-stone-900/20 shadow-2xl overflow-hidden p-6 sm:p-7 text-center space-y-5 animate-scale-up">
          
          <div>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-display font-bold text-xs uppercase tracking-wider mb-2">
              ⚡ HASIL TANTANGAN KARTU
            </div>
            <h3 class="font-display font-black text-2xl text-stone-900">
              [${result.challengerName}] Menantang [${result.defenderName}]!
            </h3>
            <p class="font-body text-xs text-stone-500 mt-1">
              Bagian yang ditantang: <b class="text-orange-600 font-display font-black text-sm">${result.challengeTypeName}</b>
            </p>
          </div>

          <!-- Perbandingan: Klaim vs Kartu Asli -->
          <div class="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div class="p-3 rounded-xl bg-white border border-stone-200/80">
              <span class="text-[10px] font-display font-bold text-stone-400 uppercase">Klaim Sebelumnya:</span>
              <div class="text-2xl mt-1">${claimMeta.emoji}</div>
              <div class="font-display font-black text-base text-stone-800">${claimMeta.name} ${result.claim.number}</div>
            </div>

            <div class="p-3 rounded-xl bg-white border-2 ${result.isClaimValid ? 'border-emerald-500 bg-emerald-50/30' : 'border-rose-500 bg-rose-50/30'}">
              <span class="text-[10px] font-display font-bold text-stone-400 uppercase">Kartu Asli Dibuka:</span>
              <div class="text-2xl mt-1">
                ${result.revealedCard.type === 'normal' ? SPICE_META[result.revealedCard.spice]?.emoji : (result.revealedCard.type === 'wild_spice' ? '✨' : '🔢')}
              </div>
              <div class="font-display font-black text-sm text-stone-900 leading-tight">
                ${result.revealedCard.name}
              </div>
            </div>
          </div>

          <!-- Banner Hasil Menang / Kalah -->
          <div class="p-4 rounded-2xl ${result.isClaimValid ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'}">
            <div class="font-display font-black text-base">
              Klaim pada bagian ${result.challengeTypeName} terbukti: <span class="uppercase font-black underline">${result.isClaimValid ? 'BENAR!' : 'SALAH!'}</span>
            </div>
            <div class="font-body text-xs mt-1.5">
              🏆 <b>${result.winnerName}</b> MENANG tantangan dan mengamankan <b>${result.cardsWonCount} Kartu</b> ke tumpukan kemenangannya!
            </div>
            <div class="font-body text-[11px] opacity-80 mt-1">
              ⚠️ <b>${result.loserName}</b> kalah tantangan dan wajib mengambil 2 kartu penalti dari dek.
            </div>
            ${result.defenderGotTrophy ? `
              <div class="mt-2 py-1 px-2.5 rounded-lg bg-amber-200 text-amber-900 font-display font-bold text-xs inline-block">
                ✨ ${result.defenderName} berhasil mempertahankan kartu terakhirnya dan meraih 1 PIALA! 🏆
              </div>
            ` : ''}
          </div>

          <!-- Tombol Lanjut -->
          <div>
            <button
              onclick="SpicyGame.dismissChallengeReveal()"
              class="w-full py-3.5 px-6 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-display font-bold text-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Lanjutkan Permainan (${result.loserName} Memulai Meja Baru) →</span>
            </button>
          </div>

        </div>
      </div>
    `;
  }

  /**
   * ==========================================================================
   * RENDER VIEW: GAME OVER & PODIUM SKOR AKHIR
   * ==========================================================================
   */
  function renderGameOverView(container, roomData, player, state) {
    const isHost = player && player.isHost;
    const standings = state.finalStandings || [];
    const winner = standings[0] || { name: 'Pemenang' };

    let endReasonText = '';
    if (state.endReason === 'trophy_double') {
      endReasonText = `👑 ${winner.name} berhasil mengumpulkan 2 Kartu Piala (+20 Poin) dan Menang Instan!`;
    } else if (state.endReason === 'trophies_depleted') {
      endReasonText = `🏆 Ketiga Piala telah habis terambil dari meja!`;
    } else if (state.endReason === 'worlds_end') {
      endReasonText = `☄️ Kartu World's End terambil dari dek! Permainan berakhir secara mendadak.`;
    } else {
      endReasonText = `🎴 Kartu di dek habis!`;
    }

    const standingsHTML = standings.map((s, idx) => {
      const isWinner = idx === 0;
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🎖️';

      return `
        <tr class="border-b border-stone-100 ${isWinner ? 'bg-amber-50/60 font-bold' : ''}">
          <td class="py-3 px-3 font-display font-black text-sm text-stone-800 flex items-center gap-1.5">
            <span>${medal}</span>
            <span>#${s.rank} ${s.name}</span>
          </td>
          <td class="py-3 px-3 text-center font-display font-semibold text-xs text-stone-600">
            ${s.wonCards} <span class="text-[10px] text-stone-400">(+${s.wonCards})</span>
          </td>
          <td class="py-3 px-3 text-center font-display font-semibold text-xs text-amber-700">
            ${s.trophies} <span class="text-[10px] text-amber-500">(+${s.trophies * 10})</span>
          </td>
          <td class="py-3 px-3 text-center font-display font-semibold text-xs text-rose-600">
            ${s.handCount} <span class="text-[10px] text-rose-400">(-${s.handCount})</span>
          </td>
          <td class="py-3 px-3 text-right font-display font-black text-base text-stone-900">
            ${s.totalScore} Poin
          </td>
        </tr>
      `;
    }).join('');

    const contentHTML = `
      <div class="max-w-2xl mx-auto py-6 space-y-6">
        
        <div class="text-center space-y-3">
          <div class="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-xl shadow-orange-500/25 animate-bounce text-4xl">
            🏆
          </div>

          <span class="px-3.5 py-1 rounded-full bg-orange-100 text-orange-800 border border-orange-300 font-display font-bold text-xs uppercase tracking-wider">
            PERMAINAN SELESAI
          </span>

          <h2 class="font-display font-black text-3xl sm:text-4xl text-stone-900">
            ${winner.name} adalah Juara Rempah!
          </h2>

          <p class="font-body text-xs sm:text-sm text-stone-600 max-w-md mx-auto leading-relaxed">
            ${endReasonText}
          </p>
        </div>

        <!-- Tabel Perhitungan Skor Resmi -->
        <div class="bg-white rounded-3xl border-2 border-stone-900/10 p-5 shadow-joyful">
          <div class="flex items-center justify-between mb-3 border-b border-stone-100 pb-2">
            <h4 class="font-display font-bold text-xs text-stone-700 uppercase tracking-wider">
              Papan Peringkat & Perincian Skor Resmi
            </h4>
            <span class="text-[10px] text-stone-400 font-body">
              (Kartu x1) + (Piala x10) - (Sisa Tangan x1)
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="text-stone-400 font-display font-semibold border-b border-stone-200">
                  <th class="py-2 px-3">Pemain</th>
                  <th class="py-2 px-3 text-center">Kartu Menang</th>
                  <th class="py-2 px-3 text-center">Piala</th>
                  <th class="py-2 px-3 text-center">Sisa Tangan</th>
                  <th class="py-2 px-3 text-right">Skor Total</th>
                </tr>
              </thead>
              <tbody>
                ${standingsHTML}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tombol Aksi Akhir -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          ${isHost ? `
            <button 
              onclick="SpicyGame.startGame()"
              class="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white font-display font-bold text-sm shadow-lg shadow-orange-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
              <span>Main Lagi (Acak Dek Baru) 🔄</span>
            </button>
          ` : ''}

          <button 
            onclick="App.returnToLobby()"
            class="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-display font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
            <span>Kembali ke Lobby</span>
          </button>
        </div>

      </div>
    `;

    container.innerHTML = contentHTML;
    UI.refreshIcons();
  }

  /**
   * Helper Klik Interaktif dari UI
   */
  function selectCard(cardId) {
    if (selectedCardId === cardId) {
      selectedCardId = null;
    } else {
      selectedCardId = cardId;
      UI.Sound.click();
    }
    if (currentRoom) {
      render(document.getElementById('app'), currentRoom, currentPlayer);
    }
  }

  function selectClaimSpice(spiceKey) {
    selectedClaimSpice = spiceKey;
    UI.Sound.click();
    if (currentRoom) {
      render(document.getElementById('app'), currentRoom, currentPlayer);
    }
  }

  function selectClaimNumber(number) {
    selectedClaimNumber = number;
    UI.Sound.click();
    if (currentRoom) {
      render(document.getElementById('app'), currentRoom, currentPlayer);
    }
  }

  function cleanup() {
    selectedCardId = null;
    selectedClaimSpice = null;
    selectedClaimNumber = null;
    isSubmitting = false;
    UI.Logger('SPICY', 'Cleaned up Spicy game state');
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
    selectCard,
    selectClaimSpice,
    selectClaimNumber,
    playCard,
    passTurn,
    submitChallenge,
    dismissChallengeReveal,
    cleanup
  };
})();

if (typeof window !== 'undefined') {
  window.SpicyGame = SpicyGame;
}
