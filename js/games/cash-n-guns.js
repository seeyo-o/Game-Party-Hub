/**
 * ==========================================================================
 * DISCORD PARTY HUB - GAME 10: "CA$H 'N GUNS (SECOND EDITION)"
 * ==========================================================================
 * 100% Mengikuti Aturan Resmi Board Game Ca$h 'n Guns (Second Edition):
 * - 4-8 Pemain (bisa diuji coba mulai 3 pemain).
 * - 8 Ronde Permainan Penuh.
 * - 64 Kartu Rampokan (40 Uang Tunai, 9 Berlian, 10 Lukisan, 3 P3K, 2 Magasin).
 * - 8 Kartu Peluru per pemain di awal game (5 CLICK! dan 3 BANG!).
 * - Maksimal 3 Luka: Pemain dengan 3 Luka gugur permanen (Mati / Dead).
 * - Hak Istimewa Godfather: Memerintahkan 1 pemain mengalihkan todongan pistol.
 * - Fase Keberanian (Courage): Memilih TETAP BERDIRI (Banzai) atau TIARAP (Duck).
 * - Tembakan Serentak (Bang! Bang! Bang!): Peluru BANG mengenai pemain berdiri.
 * - Pembagian Hasil Rampokan: Pemain selamat mengambil harta secara bergiliran.
 * - Skor Akhir: Uang + Berlian + Bonus Mayoritas Berlian ($60k) + Set Lukisan.
 *
 * Terhubung ke Firebase Realtime Database: rooms/{roomCode}/cashNGunsGame
 * ==========================================================================
 */

const CashNGunsGame = (function () {
  'use strict';

  // State Lokal Modul
  let currentRoom = null;
  let currentPlayer = null;
  let isSubmitting = false;

  // Nilai Koleksi Set Lukisan (Official 2nd Edition Ladder)
  const PAINTING_LADDER = [0, 4000, 12000, 30000, 60000, 100000, 150000, 200000, 300000, 400000, 500000];

  /**
   * Helper Normalisasi State Game dari Firebase
   */
  function getGameState(roomData) {
    if (!roomData) return {};
    const state = roomData.cashNGunsGame || roomData.gameState?.cashNGuns || {};
    if (!Array.isArray(state.lootDeck)) state.lootDeck = [];
    if (!Array.isArray(state.tableLoot)) state.tableLoot = [];
    if (!Array.isArray(state.turnOrder)) state.turnOrder = [];
    if (!Array.isArray(state.eligiblePickers)) state.eligiblePickers = [];
    if (!Array.isArray(state.shootoutResults)) state.shootoutResults = [];
    if (!Array.isArray(state.finalScores)) state.finalScores = [];
    if (!Array.isArray(state.actionLogs)) state.actionLogs = [];
    if (!state.players || typeof state.players !== 'object') state.players = {};
    if (!state.holdUpChoices || typeof state.holdUpChoices !== 'object') state.holdUpChoices = {};
    if (!state.courageChoices || typeof state.courageChoices !== 'object') state.courageChoices = {};

    Object.values(state.players).forEach(p => {
      if (p) {
        if (!Array.isArray(p.bulletHand)) p.bulletHand = [];
        if (!Array.isArray(p.lootStash)) p.lootStash = [];
        if (typeof p.wounds !== 'number') p.wounds = 0;
        if (typeof p.isAlive !== 'boolean') p.isAlive = true;
      }
    });

    return state;
  }

  /**
   * Acak array menggunakan algoritma Fisher-Yates
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
   * Format angka uang dengan pemisah ribuan (e.g. $10,000)
   */
  function formatMoney(amount) {
    return '$' + (amount || 0).toLocaleString('en-US');
  }

  /**
   * Hitung Nilai Koleksi Set Lukisan
   */
  function calculatePaintingScore(count) {
    const validCount = Math.max(0, Math.min(count, 10));
    return PAINTING_LADDER[validCount] || 0;
  }

  /**
   * Pembuatan Dek Resmi 64 Kartu Harta Rampokan (Ca$h 'n Guns 2nd Edition)
   * 40 Uang Tunai + 9 Berlian + 10 Lukisan + 3 P3K + 2 Magasin = 64 Kartu
   */
  function generateLootDeck() {
    const deck = [];
    let idCounter = 1;

    // 1. Uang Tunai: 15 x $5.000, 15 x $10.000, 10 x $20.000 (Total 40 lembar)
    for (let i = 0; i < 15; i++) {
      deck.push({
        id: `cash_5k_${idCounter++}`,
        type: 'cash',
        value: 5000,
        name: 'Uang $5.000',
        icon: 'banknote',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        desc: 'Uang tunai hasil rampokan bernilai $5.000'
      });
    }
    for (let i = 0; i < 15; i++) {
      deck.push({
        id: `cash_10k_${idCounter++}`,
        type: 'cash',
        value: 10000,
        name: 'Uang $10.000',
        icon: 'banknote',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        desc: 'Uang tunai hasil rampokan bernilai $10.000'
      });
    }
    for (let i = 0; i < 10; i++) {
      deck.push({
        id: `cash_20k_${idCounter++}`,
        type: 'cash',
        value: 20000,
        name: 'Uang $20.000',
        icon: 'banknote',
        badgeColor: 'bg-teal-100 text-teal-800 border-teal-300',
        desc: 'Uang tunai hasil rampokan bernilai $20.000'
      });
    }

    // 2. Berlian (9 lembar: 5 x $1.000, 3 x $5.000, 1 x $10.000)
    for (let i = 0; i < 5; i++) {
      deck.push({
        id: `diamond_1k_${idCounter++}`,
        type: 'diamond',
        value: 1000,
        name: 'Berlian $1.000',
        icon: 'gem',
        badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
        desc: 'Berlian murni bernilai nominal $1.000 + potensi bonus $60.000'
      });
    }
    for (let i = 0; i < 3; i++) {
      deck.push({
        id: `diamond_5k_${idCounter++}`,
        type: 'diamond',
        value: 5000,
        name: 'Berlian $5.000',
        icon: 'gem',
        badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
        desc: 'Berlian murni bernilai nominal $5.000 + potensi bonus $60.000'
      });
    }
    deck.push({
      id: `diamond_10k_${idCounter++}`,
      type: 'diamond',
      value: 10000,
      name: 'Berlian $10.000',
      icon: 'gem',
      badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      desc: 'Berlian langka bernilai nominal $10.000 + potensi bonus $60.000'
    });

    // 3. Lukisan (10 lembar koleksi bertingkat)
    for (let i = 0; i < 10; i++) {
      deck.push({
        id: `painting_${idCounter++}`,
        type: 'painting',
        value: 0,
        name: 'Lukisan Antik',
        icon: 'image',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        desc: 'Karya seni legendaris. Kumpulkan sebanyak-banyaknya hingga $500.000!'
      });
    }

    // 4. Kotak P3K (3 lembar: sembuhkan semua luka kembali ke 0)
    for (let i = 0; i < 3; i++) {
      deck.push({
        id: `first_aid_${idCounter++}`,
        type: 'first_aid',
        value: 0,
        name: 'Kotak P3K',
        icon: 'cross',
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
        desc: 'Langsung menyembuhkan semua luka kembali ke 0!'
      });
    }

    // 5. Magasin Peluru (2 lembar: dapat tambahan +1 kartu BANG!)
    for (let i = 0; i < 2; i++) {
      deck.push({
        id: `ammo_${idCounter++}`,
        type: 'ammo',
        value: 0,
        name: 'Magasin Peluru',
        icon: 'plus-circle',
        badgeColor: 'bg-slate-200 text-slate-800 border-slate-400',
        desc: 'Langsung menambahkan +1 kartu BANG! baru ke tanganmu!'
      });
    }

    return shuffle(deck);
  }

  /**
   * Membuat Hand 8 Peluru Resmi untuk Tiap Pemain (5 CLICK! + 3 BANG!)
   */
  function createInitialBulletHand(playerId) {
    const hand = [];
    for (let i = 1; i <= 5; i++) {
      hand.push({
        id: `click_${playerId}_${i}_${Math.random().toString(36).substr(2, 4)}`,
        type: 'click',
        name: '💨 CLICK!',
        desc: 'Peluru kosong / Gertakan. Sasaran tidak terluka.'
      });
    }
    for (let i = 1; i <= 3; i++) {
      hand.push({
        id: `bang_${playerId}_${i}_${Math.random().toString(36).substr(2, 4)}`,
        type: 'bang',
        name: '💥 BANG!',
        desc: 'Peluru tajam mematikan! Sasaran menerima +1 Luka jika tetap berdiri.'
      });
    }
    return hand;
  }

  /**
   * Memulai Permainan Baru Ca$h 'n Guns
   */
  async function startGame() {
    if (!currentRoom || !currentPlayer?.isHost || isSubmitting) return;

    const playerList = Object.values(currentRoom.players || {});
    if (playerList.length < 3) {
      UI.Toast.show('Minimal dibutuhkan 3 pemain untuk memulai Ca$h \'n Guns!', 'warning');
      return;
    }

    isSubmitting = true;
    try {
      UI.Logger('CASH-N-GUNS', 'Starting new game of Ca$h \'n Guns...');

      const shuffledPlayers = shuffle(playerList);
      const turnOrder = shuffledPlayers.map(p => p.id);
      const godfatherId = turnOrder[0]; // Pemain pertama menjadi Godfather awal

      const deck = generateLootDeck();
      const initialTableLoot = deck.slice(0, 8);
      const remainingDeck = deck.slice(8);

      const playersObj = {};
      playerList.forEach(p => {
        playersObj[p.id] = {
          id: p.id,
          name: p.name,
          avatar: p.avatar || null,
          isAlive: true,
          hasLeft: false,
          wounds: 0,
          bulletHand: createInitialBulletHand(p.id),
          lootStash: [],
          currentAimTargetId: null,
          currentBulletCardId: null,
          courageChoice: null,
          shotThisRound: false,
          woundsReceivedThisRound: 0
        };
      });

      const initialGameState = {
        status: 'playing',
        phase: 'loot_reveal',
        round: 1,
        maxRounds: 8,
        godfatherId: godfatherId,
        godfatherDeskClaimedBy: null,
        godfatherDeskAvailable: true,
        turnOrder: turnOrder,
        players: playersObj,
        lootDeck: remainingDeck,
        tableLoot: initialTableLoot,
        holdUpChoices: {},
        godfatherChangeOrder: null,
        courageChoices: {},
        shootoutResults: [],
        eligiblePickers: [],
        pickerIndex: 0,
        currentPickerId: null,
        winnerPlayerId: null,
        finalScores: [],
        actionLogs: [
          {
            text: `🎮 Permainan Ca$h 'n Guns dimulai! 🎩 [${playersObj[godfatherId]?.name}] terpilih sebagai Godfather pertama.`,
            timestamp: Date.now()
          },
          {
            text: `💰 Ronde 1: 8 Harta Rampokan telah dibuka di tengah meja!`,
            timestamp: Date.now()
          }
        ],
        updatedAt: Date.now()
      };

      await DB.updateGameState(currentRoom.code, 'cashNGuns', initialGameState);
      UI.Sound.fanfare();
      UI.Confetti();
    } catch (err) {
      UI.Logger('CASH-N-GUNS', 'Error starting game:', err, true);
      UI.Toast.show('Gagal memulai game: ' + (err.message || 'Koneksi error'), 'error');
    } finally {
      isSubmitting = false;
    }
  }

  /**
   * Maju dari Fase Buka Harta ke Fase Todong Pistol (Hold-Up!)
   */
  async function proceedToHoldUp() {
    if (!currentRoom || !currentPlayer?.isHost || isSubmitting) return;
    const state = getGameState(currentRoom);
    if (state.phase !== 'loot_reveal') return;

    isSubmitting = true;
    try {
      await DB.updateGameState(currentRoom.code, 'cashNGuns', {
        phase: 'hold_up',
        holdUpChoices: {},
        godfatherChangeOrder: null,
        courageChoices: {},
        shootoutResults: []
      });
      UI.Sound.click();
    } catch (err) {
      UI.Logger('CASH-N-GUNS', 'Error proceeding to hold_up:', err, true);
    } finally {
      isSubmitting = false;
    }
  }

  /**
   * Fase 2: Pemain Memilih Kartu Peluru & Target Todongan Pistol
   */
  async function submitHoldUpChoice(bulletCardId, targetPlayerId) {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    const state = getGameState(currentRoom);
    if (state.phase !== 'hold_up') return;

    const me = state.players[currentPlayer.id];
    if (!me || !me.isAlive) return;

    if (!bulletCardId || !targetPlayerId) {
      UI.Toast.show('Pilih kartu peluru DAN target todongan pistolmu!', 'warning');
      return;
    }
    if (targetPlayerId === currentPlayer.id) {
      UI.Toast.show('Kamu tidak bisa menodong dirimu sendiri!', 'warning');
      return;
    }
    const targetP = state.players[targetPlayerId];
    if (!targetP || !targetP.isAlive) {
      UI.Toast.show('Target yang kamu pilih sudah gugur!', 'warning');
      return;
    }

    isSubmitting = true;
    try {
      const updatedChoices = {
        ...(state.holdUpChoices || {}),
        [currentPlayer.id]: {
          bulletCardId: bulletCardId,
          targetId: targetPlayerId
        }
      };

      const livingPlayers = Object.values(state.players || {}).filter(p => p.isAlive);
      const allReady = livingPlayers.length > 0 && livingPlayers.every(p => updatedChoices[p.id]);

      const partial = {
        holdUpChoices: updatedChoices
      };

      if (allReady) {
        // Terapkan pilihan target ke masing-masing pemain
        livingPlayers.forEach(p => {
          const choice = updatedChoices[p.id];
          if (choice && state.players[p.id]) {
            state.players[p.id].currentAimTargetId = choice.targetId;
            state.players[p.id].currentBulletCardId = choice.bulletCardId;
          }
        });
        partial.players = state.players;

        // Cek apakah Godfather masih hidup
        const godAlive = state.players[state.godfatherId]?.isAlive;
        if (godAlive) {
          partial.phase = 'godfather_privilege';
          partial.actionLogs = [
            ...(state.actionLogs || []),
            {
              text: `🔫 Semua pistol telah ditodongkan! Menunggu keputusan Hak Istimewa Godfather...`,
              timestamp: Date.now()
            }
          ];
        } else {
          // Jika Godfather gugur, langsung ke fase Keberanian
          partial.phase = 'courage';
          partial.actionLogs = [
            ...(state.actionLogs || []),
            {
              text: `🔫 Semua pistol telah ditodongkan! Bersiap untuk Fase Berdiri atau Tiarap!`,
              timestamp: Date.now()
            }
          ];
        }
      }

      await DB.updateGameState(currentRoom.code, 'cashNGuns', partial);
      UI.Sound.ding();
    } catch (err) {
      UI.Logger('CASH-N-GUNS', 'Error submitting hold up:', err, true);
    } finally {
      isSubmitting = false;
    }
  }

  /**
   * Fase 3: Hak Istimewa Godfather (Ubah Arah Todongan atau Pass)
   */
  async function applyGodfatherPrivilege(forcedPlayerId, newTargetId) {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    const state = getGameState(currentRoom);
    if (state.phase !== 'godfather_privilege') return;
    if (state.godfatherId !== currentPlayer.id) return;

    isSubmitting = true;
    try {
      const partial = {
        phase: 'courage',
        courageChoices: {}
      };

      if (forcedPlayerId && newTargetId && state.players[forcedPlayerId] && state.players[newTargetId]) {
        state.players[forcedPlayerId].currentAimTargetId = newTargetId;
        partial.players = state.players;
        partial.godfatherChangeOrder = {
          forcedPlayerId,
          newTargetId,
          forcedName: state.players[forcedPlayerId].name,
          newTargetName: state.players[newTargetId].name
        };
        partial.actionLogs = [
          ...(state.actionLogs || []),
          {
            text: `🎩 Godfather [${currentPlayer.name}] memerintahkan [${state.players[forcedPlayerId].name}] mengubah todongannya ke [${state.players[newTargetId].name}]!`,
            timestamp: Date.now()
          }
        ];
      } else {
        // Pass
        partial.godfatherChangeOrder = null;
        partial.actionLogs = [
          ...(state.actionLogs || []),
          {
            text: `🎩 Godfather [${currentPlayer.name}] memutuskan tidak mengubah todongan siapapun (Pass).`,
            timestamp: Date.now()
          }
        ];
      }

      await DB.updateGameState(currentRoom.code, 'cashNGuns', partial);
      UI.Sound.click();
    } catch (err) {
      UI.Logger('CASH-N-GUNS', 'Error in godfather privilege:', err, true);
    } finally {
      isSubmitting = false;
    }
  }

  /**
   * Fase 4: Pemain Memilih Keberanian (TETAP BERDIRI atau TIARAP)
   */
  async function submitCourageChoice(choice) {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    const state = getGameState(currentRoom);
    if (state.phase !== 'courage') return;

    const me = state.players[currentPlayer.id];
    if (!me || !me.isAlive) return;

    if (choice !== 'stand' && choice !== 'duck') return;

    isSubmitting = true;
    try {
      const updatedChoices = {
        ...(state.courageChoices || {}),
        [currentPlayer.id]: choice
      };

      const livingPlayers = Object.values(state.players || {}).filter(p => p.isAlive);
      const allReady = livingPlayers.length > 0 && livingPlayers.every(p => updatedChoices[p.id]);

      const partial = {
        courageChoices: updatedChoices
      };

      if (allReady) {
        // Semua sudah memilih, resolusi tembak-menembak seketika!
        const shootout = resolveShootout(state, updatedChoices);
        partial.phase = 'shootout';
        partial.players = shootout.updatedPlayers;
        partial.shootoutResults = shootout.results;
        partial.eligiblePickers = shootout.eligiblePickers;
        partial.pickerIndex = 0;
        partial.currentPickerId = shootout.eligiblePickers[0] || null;
        partial.actionLogs = [...(state.actionLogs || []), ...shootout.newLogs];
      }

      await DB.updateGameState(currentRoom.code, 'cashNGuns', partial);
      UI.Sound.ding();
    } catch (err) {
      UI.Logger('CASH-N-GUNS', 'Error submitting courage:', err, true);
    } finally {
      isSubmitting = false;
    }
  }

  /**
   * Evaluasi Logika Resmi Tembak-Menembak (Fase 5)
   */
  function resolveShootout(state, courageChoices) {
    const updatedPlayers = JSON.parse(JSON.stringify(state.players));
    const results = [];
    const newLogs = [];

    const livingPlayers = Object.values(updatedPlayers).filter(p => p.isAlive);

    // 1. Terapkan pilihan keberanian dan kurangi peluru yang dipakai dari tangan
    livingPlayers.forEach(p => {
      p.courageChoice = courageChoices[p.id] || 'duck';
      p.shotThisRound = false;
      p.woundsReceivedThisRound = 0;

      // Buang kartu peluru yang telah dimainkan
      if (p.currentBulletCardId) {
        p.bulletHand = (p.bulletHand || []).filter(c => c.id !== p.currentBulletCardId);
      }
    });

    // 2. Evaluasi tembakan dari pemain yang TETAP BERDIRI
    livingPlayers.forEach(shooter => {
      if (shooter.courageChoice === 'stand' && shooter.currentAimTargetId) {
        const target = updatedPlayers[shooter.currentAimTargetId];
        const choiceData = state.holdUpChoices[shooter.id];
        const cardId = choiceData?.bulletCardId;
        const playedCard = (state.players[shooter.id]?.bulletHand || []).find(c => c.id === cardId);
        const bulletType = playedCard?.type || 'click';

        if (target) {
          const targetStood = target.courageChoice === 'stand';
          let isHit = false;

          if (bulletType === 'bang') {
            if (targetStood) {
              // Kena telak!
              isHit = true;
              target.wounds = (target.wounds || 0) + 1;
              target.woundsReceivedThisRound = (target.woundsReceivedThisRound || 0) + 1;
              target.shotThisRound = true;

              if (target.wounds >= 3) {
                target.isAlive = false;
                newLogs.push({
                  text: `💀 [${target.name}] tertembak BANG! oleh [${shooter.name}], mencapai 3 Luka dan GUGUR PERMANEN!`,
                  timestamp: Date.now()
                });
              } else {
                newLogs.push({
                  text: `💥 [${target.name}] tertembak BANG! oleh [${shooter.name}] (+1 Luka: ${target.wounds}/3) dan tersungkur dari bagi harta!`,
                  timestamp: Date.now()
                });
              }
            } else {
              // Target tiarap
              newLogs.push({
                text: `💨 [${shooter.name}] menembak BANG!, namun [${target.name}] berhasil tiarap di bawah meja dengan aman!`,
                timestamp: Date.now()
              });
            }
          } else {
            // Click
            newLogs.push({
              text: `💨 [${shooter.name}] menodong [${target.name}], tetapi pelurunya hanya CLICK (kosong)!`,
              timestamp: Date.now()
            });
          }

          results.push({
            shooterId: shooter.id,
            shooterName: shooter.name,
            targetId: target.id,
            targetName: target.name,
            bulletType: bulletType,
            targetStood: targetStood,
            isHit: isHit,
            targetDied: !target.isAlive
          });
        }
      } else {
        // Shooter tiarap, peluru terbuang tanpa ditembakkan
        results.push({
          shooterId: shooter.id,
          shooterName: shooter.name,
          bulletType: 'ducked',
          isHit: false
        });
      }
    });

    // 3. Tentukan Pemain yang Berhak Mengambil Hasil Rampokan (Eligible Pickers)
    // Syarat: Hidup, TETAP BERDIRI, dan TIDAK TERKENA TEMBAKAN BANG!
    const survivors = Object.values(updatedPlayers).filter(p => p.isAlive && p.courageChoice === 'stand' && !p.shotThisRound);

    // Urutan pengambilan: Dimulai dari Godfather jika selamat, atau searah jarum jam berikutnya
    let eligiblePickers = [];
    if (survivors.length > 0) {
      const turnOrder = state.turnOrder || [];
      const godfatherId = state.godfatherId;
      const gfIdx = turnOrder.indexOf(godfatherId);

      // Susun urutan lingkaran mulai dari Godfather
      const ordered = [];
      for (let i = 0; i < turnOrder.length; i++) {
        const idx = (gfIdx + i) % turnOrder.length;
        const pid = turnOrder[idx];
        if (survivors.some(s => s.id === pid)) {
          ordered.push(pid);
        }
      }
      eligiblePickers = ordered;
    }

    return {
      updatedPlayers,
      results,
      eligiblePickers,
      newLogs
    };
  }

  /**
   * Maju dari Layar Hasil Tembakan ke Fase Pembagian Harta
   */
  async function proceedToLootSharing() {
    if (!currentRoom || !currentPlayer?.isHost || isSubmitting) return;
    const state = getGameState(currentRoom);
    if (state.phase !== 'shootout') return;

    isSubmitting = true;
    try {
      if (state.eligiblePickers.length === 0) {
        // Tidak ada yang berhak ambil harta, semua harta ronde ini hangus
        const partial = {
          phase: 'round_summary',
          tableLoot: [],
          actionLogs: [
            ...(state.actionLogs || []),
            {
              text: `⚠️ Tidak ada gangster yang selamat berdiri! Seluruh harta rampokan ronde ini hangus dibuang.`,
              timestamp: Date.now()
            }
          ]
        };
        await DB.updateGameState(currentRoom.code, 'cashNGuns', partial);
      } else {
        await DB.updateGameState(currentRoom.code, 'cashNGuns', {
          phase: 'loot_sharing',
          pickerIndex: 0,
          currentPickerId: state.eligiblePickers[0]
        });
      }
      UI.Sound.click();
    } catch (err) {
      UI.Logger('CASH-N-GUNS', 'Error proceeding to loot sharing:', err, true);
    } finally {
      isSubmitting = false;
    }
  }

  /**
   * Fase 6: Pemain Mengambil 1 Harta Rampokan dari Meja
   */
  async function pickLootItem(itemType, cardId) {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    const state = getGameState(currentRoom);
    if (state.phase !== 'loot_sharing') return;
    if (state.currentPickerId !== currentPlayer.id) {
      UI.Toast.show('Bukan giliranmu untuk mengambil harta!', 'warning');
      return;
    }

    isSubmitting = true;
    try {
      const picker = state.players[currentPlayer.id];
      if (!picker) return;

      const newTableLoot = [...state.tableLoot];
      let claimedDesk = false;
      let logText = '';

      if (itemType === 'godfather_desk') {
        if (!state.godfatherDeskAvailable) {
          UI.Toast.show('Meja Godfather sudah diambil ronde ini!', 'warning');
          return;
        }
        state.godfatherDeskAvailable = false;
        state.godfatherDeskClaimedBy = currentPlayer.id;
        claimedDesk = true;
        logText = `🎩 [${currentPlayer.name}] mengambil Meja Godfather! Akan menjadi Godfather di ronde berikutnya.`;
      } else {
        // Ambil kartu rampokan
        const cardIndex = newTableLoot.findIndex(c => c.id === cardId);
        if (cardIndex === -1) {
          UI.Toast.show('Kartu tersebut sudah tidak ada di meja!', 'warning');
          return;
        }
        const card = newTableLoot.splice(cardIndex, 1)[0];
        picker.lootStash.push(card);

        // Efek langsung kartu spesial
        if (card.type === 'first_aid') {
          picker.wounds = 0;
          logText = `🧰 [${currentPlayer.name}] mengambil Kotak P3K! Seluruh luka sembuh total kembali ke 0.`;
        } else if (card.type === 'ammo') {
          picker.bulletHand.push({
            id: `bang_bonus_${Date.now()}`,
            type: 'bang',
            name: '💥 BANG!',
            desc: 'Peluru bonus dari magasin peluru!'
          });
          logText = `🔫 [${currentPlayer.name}] mengambil Magasin Peluru! Mendapatkan +1 kartu BANG! baru.`;
        } else {
          logText = `💰 [${currentPlayer.name}] mengambil [${card.name}].`;
        }
      }

      state.tableLoot = newTableLoot;
      const actionLogs = [
        ...(state.actionLogs || []),
        { text: logText, timestamp: Date.now() }
      ];

      // Cek apakah seluruh 8 kartu meja sudah habis
      if (newTableLoot.length === 0) {
        state.phase = 'round_summary';
        state.actionLogs = actionLogs;
      } else {
        // Lanjutkan ke pengambil giliran berikutnya
        const eligible = state.eligiblePickers || [];
        const nextIdx = ((state.pickerIndex || 0) + 1) % eligible.length;
        state.pickerIndex = nextIdx;
        state.currentPickerId = eligible[nextIdx];
        state.actionLogs = actionLogs;
      }

      await DB.updateGameState(currentRoom.code, 'cashNGuns', state);
      UI.Sound.ding();
    } catch (err) {
      UI.Logger('CASH-N-GUNS', 'Error picking loot:', err, true);
    } finally {
      isSubmitting = false;
    }
  }

  /**
   * Maju ke Ronde Berikutnya (atau Akhiri Permainan jika Ronde 8 selesai)
   */
  async function nextRound() {
    if (!currentRoom || !currentPlayer?.isHost || isSubmitting) return;
    const state = getGameState(currentRoom);
    if (state.phase !== 'round_summary') return;

    isSubmitting = true;
    try {
      const livingPlayers = Object.values(state.players || {}).filter(p => p.isAlive);

      // Kondisi Game Over: Ronde 8 selesai ATAU pemain hidup tersisa <= 1
      if (state.round >= 8 || livingPlayers.length <= 1) {
        const finalScores = calculateFinalScores(state);
        const winner = finalScores[0] || null;

        await DB.updateGameState(currentRoom.code, 'cashNGuns', {
          status: 'game_over',
          phase: 'game_over',
          finalScores: finalScores,
          winnerPlayerId: winner ? winner.playerId : null,
          actionLogs: [
            ...(state.actionLogs || []),
            {
              text: `🏆 PERMAINAN SELESAI! 👑 [${winner ? winner.name : 'Tidak Ada'}] keluar sebagai Gangster Paling Tajir dengan total kekayaan ${formatMoney(winner?.grandTotal || 0)}!`,
              timestamp: Date.now()
            }
          ]
        });
        UI.Sound.fanfare();
        UI.Confetti();
        return;
      }

      // Mulai Ronde Baru
      const nextRoundNum = (state.round || 1) + 1;
      const nextGodfatherId = state.godfatherDeskClaimedBy || state.godfatherId;

      // Ambil 8 kartu baru dari sisa dek
      const deck = [...state.lootDeck];
      const newTableLoot = deck.splice(0, 8);

      // Reset per-round player status
      Object.values(state.players).forEach(p => {
        p.currentAimTargetId = null;
        p.currentBulletCardId = null;
        p.courageChoice = null;
        p.shotThisRound = false;
        p.woundsReceivedThisRound = 0;
      });

      await DB.updateGameState(currentRoom.code, 'cashNGuns', {
        phase: 'loot_reveal',
        round: nextRoundNum,
        godfatherId: nextGodfatherId,
        godfatherDeskClaimedBy: null,
        godfatherDeskAvailable: true,
        lootDeck: deck,
        tableLoot: newTableLoot,
        holdUpChoices: {},
        godfatherChangeOrder: null,
        courageChoices: {},
        shootoutResults: [],
        eligiblePickers: [],
        pickerIndex: 0,
        currentPickerId: null,
        actionLogs: [
          ...(state.actionLogs || []),
          {
            text: `🔔 Ronde ${nextRoundNum} dimulai! 🎩 Godfather ronde ini: [${state.players[nextGodfatherId]?.name}].`,
            timestamp: Date.now()
          }
        ]
      });
      UI.Sound.ding();
    } catch (err) {
      UI.Logger('CASH-N-GUNS', 'Error advancing round:', err, true);
    } finally {
      isSubmitting = false;
    }
  }

  /**
   * Perhitungan Skor Akhir Resmi Ca$h 'n Guns (Second Edition)
   */
  function calculateFinalScores(state) {
    const scores = [];
    const livingPlayers = Object.values(state.players || {}).filter(p => p.isAlive);

    // Cari jumlah kartu berlian terbanyak untuk bonus $60.000
    let maxDiamonds = 0;
    livingPlayers.forEach(p => {
      const diaCount = (p.lootStash || []).filter(c => c.type === 'diamond').length;
      if (diaCount > maxDiamonds) {
        maxDiamonds = diaCount;
      }
    });

    // Cek apakah ada seri untuk pemegang berlian terbanyak
    const topDiamondHolders = livingPlayers.filter(p => {
      const diaCount = (p.lootStash || []).filter(c => c.type === 'diamond').length;
      return diaCount === maxDiamonds && maxDiamonds > 0;
    });
    const hasSingleDiamondWinner = topDiamondHolders.length === 1;

    livingPlayers.forEach(p => {
      const stash = p.lootStash || [];

      // 1. Total Uang Tunai
      const cashTotal = stash.filter(c => c.type === 'cash').reduce((sum, c) => sum + (c.value || 0), 0);

      // 2. Nilai Nominal Berlian
      const diamondCards = stash.filter(c => c.type === 'diamond');
      const diamondCount = diamondCards.length;
      const diamondFaceTotal = diamondCards.reduce((sum, c) => sum + (c.value || 0), 0);

      // 3. Bonus Mayoritas Berlian ($60.000 jika memegang terbanyak tanpa seri)
      const getsDiamondBonus = hasSingleDiamondWinner && topDiamondHolders[0].id === p.id;
      const diamondBonusAmount = getsDiamondBonus ? 60000 : 0;
      const totalDiamondsScore = diamondFaceTotal + diamondBonusAmount;

      // 4. Koleksi Set Lukisan
      const paintingCount = stash.filter(c => c.type === 'painting').length;
      const paintingTotal = calculatePaintingScore(paintingCount);

      // 5. Total Kekayaan Bersih
      const grandTotal = cashTotal + totalDiamondsScore + paintingTotal;

      scores.push({
        playerId: p.id,
        name: p.name,
        avatar: p.avatar,
        wounds: p.wounds,
        isAlive: true,
        cashTotal,
        diamondCount,
        diamondFaceTotal,
        getsDiamondBonus,
        diamondBonusAmount,
        totalDiamondsScore,
        paintingCount,
        paintingTotal,
        grandTotal
      });
    });

    // Urutkan dari yang terkaya ke yang termiskin
    scores.sort((a, b) => b.grandTotal - a.grandTotal);

    // Tambahkan rank
    scores.forEach((s, idx) => {
      s.rank = idx + 1;
    });

    return scores;
  }

  /**
   * Reset Permainan Kembali ke Konfigurasi Awal
   */
  async function resetGame() {
    if (!currentRoom || !currentPlayer?.isHost || isSubmitting) return;
    isSubmitting = true;
    try {
      await startGame();
    } finally {
      isSubmitting = false;
    }
  }

  /**
   * ==========================================================================
   * RENDER VIEW & KOMPONEN UI
   * ==========================================================================
   */
  function render(container, roomData, activePlayer) {
    currentRoom = roomData;
    currentPlayer = activePlayer;

    if (!container || !roomData) return;

    const state = getGameState(roomData);

    if (state.status === 'game_over') {
      renderGameOverView(container, state);
    } else if (state.status === 'playing') {
      renderPlayingView(container, state);
    } else {
      renderLobbyView(container, state);
    }
  }

  /**
   * 1. Render Lobby Permainan
   */
  function renderLobbyView(container, state) {
    const isHost = currentPlayer?.isHost;
    const playerList = Object.values(currentRoom.players || {});
    const canStart = playerList.length >= 3;

    container.innerHTML = `
      <div class="w-full max-w-4xl mx-auto my-auto py-6 px-4">
        <!-- Top Bar -->
        <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl shadow-md">
              🔫
            </div>
            <div>
              <h2 class="font-display font-black text-2xl text-slate-900">Ca$h 'n Guns</h2>
              <p class="font-body text-xs text-slate-500">Board Game Gertakan & Rampokan Gangster (Second Edition)</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button 
              onclick="GameRules.open('cash-n-guns')"
              class="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-display font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <i data-lucide="book-open" class="w-4 h-4"></i>
              <span>Cara Bermain</span>
            </button>
            <button 
              onclick="App.leaveCurrentGame()"
              class="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-display font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <i data-lucide="log-out" class="w-4 h-4"></i>
              <span>Keluar Game</span>
            </button>
          </div>
        </div>

        <!-- Banner Info -->
        <div class="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 text-white mb-6 shadow-xl">
          <div class="flex items-center gap-3 mb-2">
            <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-display font-bold text-xs">
              8 Ronde Menegangkan
            </span>
            <span class="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-display font-bold text-xs">
              3 Luka = Mati Permanen
            </span>
          </div>
          <h3 class="font-display font-black text-xl mb-1">Siapkan Todongan Pistolmu!</h3>
          <p class="font-body text-xs text-slate-300 leading-relaxed max-w-2xl">
            Rampok uang jutaan dolar, berlian berkilau, dan lukisan bernilai tinggi bersama komplotanmu. Namun awas: hanya gangster yang bertahan hidup yang bisa menikmati hasil rampokan!
          </p>
        </div>

        <!-- Daftar Pemain -->
        <div class="p-6 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm mb-6">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-display font-bold text-base text-slate-800 flex items-center gap-2">
              <i data-lucide="users" class="w-4 h-4 text-emerald-600"></i>
              <span>Komplotan Gangster di Ruangan (${playerList.length} Pemain)</span>
            </h4>
            <span class="text-xs font-body text-slate-500">Minimal 3 pemain untuk bermain</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            ${playerList.map(p => `
              <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-display font-bold text-sm">
                  ${p.name.charAt(0).toUpperCase()}
                </div>
                <div class="overflow-hidden">
                  <div class="font-display font-bold text-sm text-slate-800 truncate">${p.name}</div>
                  <div class="text-[10px] font-body text-slate-500">${p.isHost ? '👑 Host' : 'Gangster'}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Tombol Aksi Host -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div class="text-xs font-body text-slate-500 text-center sm:text-left">
            ${isHost 
              ? (canStart ? '✅ Jumlah pemain mencukupi. Klik tombol untuk memulai permainan!' : '⚠️ Membutuhkan minimal 3 pemain untuk memulai.')
              : 'Menunggu Host memulai permainan...'}
          </div>
          ${isHost ? `
            <button 
              onclick="CashNGunsGame.startGame()"
              ${!canStart ? 'disabled' : ''}
              class="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-display font-black text-sm shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i data-lucide="play" class="w-5 h-5"></i>
              <span>Mulai Ca$h 'n Guns! 🔫</span>
            </button>
          ` : ''}
        </div>
      </div>
    `;

    UI.refreshIcons();
  }

  /**
   * 2. Render Tampilan Permainan Aktif
   */
  function renderPlayingView(container, state) {
    const me = state.players[currentPlayer.id] || {};
    const isHost = currentPlayer?.isHost;
    const godfather = state.players[state.godfatherId] || {};
    const isGodfather = state.godfatherId === currentPlayer.id;

    const roundHTML = `
      <div class="flex items-center gap-2">
        <span class="px-3 py-1 rounded-full bg-slate-900 text-emerald-400 font-display font-black text-xs border border-emerald-500/30">
          Ronde ${state.round} / ${state.maxRounds}
        </span>
        <span class="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-display font-bold text-xs flex items-center gap-1.5">
          <span>🎩 Godfather:</span>
          <b>${godfather.name || 'Tidak Ada'}</b>
        </span>
      </div>
    `;

    container.innerHTML = `
      <div class="w-full max-w-5xl mx-auto py-4 px-3 sm:px-4 space-y-4">
        <!-- Top Bar Navigasi -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-200">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl shadow-sm">
              🔫
            </div>
            <div>
              <h2 class="font-display font-black text-lg text-slate-900">Ca$h 'n Guns</h2>
              <div class="flex items-center gap-2 mt-0.5">${roundHTML}</div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button 
              onclick="GameRules.open('cash-n-guns')"
              class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
            >
              <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
              <span class="hidden sm:inline">Cara Bermain</span>
            </button>
            <button 
              onclick="App.leaveCurrentGame()"
              class="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-display font-bold text-xs flex items-center gap-1 cursor-pointer transition-all"
            >
              <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
              <span>Keluar</span>
            </button>
          </div>
        </div>

        <!-- Banner Fase Permainan -->
        ${renderPhaseBanner(state, me)}

        <!-- Area Meja Tengah: 8 Harta Rampokan & Meja Godfather -->
        ${renderTableCenter(state)}

        <!-- Status Seluruh Gangster (Lingkaran Todongan & Luka) -->
        ${renderGangstersGrid(state, me)}

        <!-- Dashboard Kontrol Pemain Aktif (Hand Peluru & Aksi Fase) -->
        ${renderPlayerControlPanel(state, me)}

        <!-- Riwayat Aksi Singkat -->
        ${renderActionLogs(state)}
      </div>
    `;

    UI.refreshIcons();
  }

  /**
   * Banner Penunjuk Fase Permainan
   */
  function renderPhaseBanner(state, me) {
    let title = '';
    let desc = '';
    let bgGradient = 'from-slate-900 to-slate-800';
    let icon = 'crosshair';

    switch (state.phase) {
      case 'loot_reveal':
        title = 'Fase 1: 8 Harta Rampokan Terbuka di Meja';
        desc = 'Lihat harta rampokan yang diperebutkan di meja tengah. Bersiaplah untuk menodongkan pistol!';
        bgGradient = 'from-emerald-900 via-slate-900 to-slate-900';
        icon = 'gem';
        break;
      case 'hold_up':
        title = 'Fase 2: Todong Pistol (Hold-Up!)';
        desc = 'Pilih 1 kartu peluru rahasia dari tanganmu dan tentukan siapa target yang ingin kamu todong!';
        bgGradient = 'from-rose-900 via-slate-900 to-slate-900';
        icon = 'crosshair';
        break;
      case 'godfather_privilege':
        title = 'Fase 3: Hak Istimewa Godfather';
        desc = `Godfather (${state.players[state.godfatherId]?.name}) berhak memerintahkan 1 pemain untuk mengubah sasaran todongan pistolnya!`;
        bgGradient = 'from-amber-900 via-slate-900 to-slate-900';
        icon = 'crown';
        break;
      case 'courage':
        title = 'Fase 4: Berdiri atau Tiarap? (Courage)';
        desc = 'Todongan pistol sudah terbuka! Putuskan apakah kamu TETAP BERDIRI (ambil risiko demi harta) atau TIARAP (aman di bawah meja)?';
        bgGradient = 'from-indigo-900 via-slate-900 to-slate-900';
        icon = 'shield-alert';
        break;
      case 'shootout':
        title = 'Fase 5: Tembak-Menembak! (Bang! Bang! Bang!)';
        desc = 'Peluru ditembakkan serentak! Simak siapa yang terluka dan siapa yang selamat di ronde ini.';
        bgGradient = 'from-red-950 via-rose-900 to-slate-900';
        icon = 'flame';
        break;
      case 'loot_sharing':
        title = 'Fase 6: Pembagian Harta Rampokan';
        desc = `Giliran [${state.players[state.currentPickerId]?.name || 'Pemain'}] mengambil 1 harta dari meja rampokan!`;
        bgGradient = 'from-emerald-900 via-teal-900 to-slate-900';
        icon = 'coins';
        break;
      case 'round_summary':
        title = `Ronde ${state.round} Selesai!`;
        desc = 'Seluruh harta telah dibagi. Tinjau perolehan harta dan sisa peluru komplotanmu.';
        bgGradient = 'from-slate-900 to-emerald-950';
        icon = 'award';
        break;
      default:
        title = 'Permainan Berlangsung';
        desc = 'Ca$h \'n Guns Second Edition';
    }

    return `
      <div class="p-4 sm:p-5 rounded-3xl bg-gradient-to-r ${bgGradient} text-white shadow-lg flex items-center justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div class="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 text-xl">
            <i data-lucide="${icon}" class="w-6 h-6 text-white"></i>
          </div>
          <div>
            <h3 class="font-display font-black text-base sm:text-lg text-white">${title}</h3>
            <p class="font-body text-xs text-white/80 mt-0.5 leading-relaxed">${desc}</p>
          </div>
        </div>
        ${state.phase === 'loot_reveal' && currentPlayer?.isHost ? `
          <button 
            onclick="CashNGunsGame.proceedToHoldUp()"
            class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-black text-xs shadow-md active:scale-95 transition-all whitespace-nowrap cursor-pointer"
          >
            Mulai Todong! 🔫
          </button>
        ` : ''}
        ${state.phase === 'shootout' && currentPlayer?.isHost ? `
          <button 
            onclick="CashNGunsGame.proceedToLootSharing()"
            class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-black text-xs shadow-md active:scale-95 transition-all whitespace-nowrap cursor-pointer"
          >
            Bagi Harta 💰
          </button>
        ` : ''}
        ${state.phase === 'round_summary' && currentPlayer?.isHost ? `
          <button 
            onclick="CashNGunsGame.nextRound()"
            class="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-display font-black text-xs shadow-md active:scale-95 transition-all whitespace-nowrap cursor-pointer"
          >
            ${state.round >= 8 ? 'Lihat Pemenang 🏆' : 'Ronde Berikutnya ➡️'}
          </button>
        ` : ''}
      </div>
    `;
  }

  /**
   * Area Meja Tengah: 8 Kartu Rampokan & Meja Godfather
   */
  function renderTableCenter(state) {
    const isLootPhase = state.phase === 'loot_sharing';
    const isMyPick = isLootPhase && state.currentPickerId === currentPlayer.id;

    return `
      <div class="p-4 sm:p-5 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm">
        <div class="flex items-center justify-between mb-3.5">
          <div class="flex items-center gap-2">
            <i data-lucide="gem" class="w-4 h-4 text-emerald-600"></i>
            <h4 class="font-display font-bold text-sm sm:text-base text-slate-900">
              Meja Harta Rampokan (${state.tableLoot.length} Kartu Tersisa)
            </h4>
          </div>
          ${isMyPick ? `
            <span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 font-display font-black text-xs animate-pulse">
              👉 Giliranmu Memilih Harta!
            </span>
          ` : ''}
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
          <!-- Meja Godfather Tile -->
          <div class="p-3 rounded-2xl border-2 ${state.godfatherDeskAvailable ? 'bg-amber-50/80 border-amber-300' : 'bg-slate-100 border-slate-200 opacity-60'} flex flex-col justify-between relative overflow-hidden transition-all">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xl">🎩</span>
              <span class="px-2 py-0.5 rounded-md text-[9px] font-display font-black ${state.godfatherDeskAvailable ? 'bg-amber-200 text-amber-900' : 'bg-slate-200 text-slate-500'}">
                ${state.godfatherDeskAvailable ? 'TERSEDIA' : 'SUDAH DIAMBIL'}
              </span>
            </div>
            <div>
              <div class="font-display font-bold text-xs text-slate-900">Meja Godfather</div>
              <p class="font-body text-[10px] text-slate-500 mt-0.5 leading-tight">
                ${state.godfatherDeskClaimedBy 
                  ? `Diambil oleh ${state.players[state.godfatherDeskClaimedBy]?.name}` 
                  : 'Ambil untuk jadi Godfather ronde depan & pilih giliran pertama!'}
              </p>
            </div>
            ${isMyPick && state.godfatherDeskAvailable ? `
              <button 
                onclick="CashNGunsGame.pickLootItem('godfather_desk', null)"
                class="mt-2.5 w-full py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-display font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                Ambil Meja 🎩
              </button>
            ` : ''}
          </div>

          <!-- 8 Kartu Rampokan di Meja -->
          ${state.tableLoot.map(card => {
            const cardBg = getLootCardStyle(card.type);
            return `
              <div class="p-3 rounded-2xl border-2 ${cardBg.border} ${cardBg.bg} flex flex-col justify-between transition-all hover:shadow-sm">
                <div>
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="text-lg">${cardBg.emoji}</span>
                    <span class="px-1.5 py-0.5 rounded text-[9px] font-display font-black ${cardBg.badgeClass}">
                      ${card.type.toUpperCase()}
                    </span>
                  </div>
                  <div class="font-display font-bold text-xs text-slate-900">${card.name}</div>
                  <p class="font-body text-[10px] text-slate-600 mt-0.5 leading-snug">${card.desc}</p>
                </div>
                ${isMyPick ? `
                  <button 
                    onclick="CashNGunsGame.pickLootItem('card', '${card.id}')"
                    class="mt-2.5 w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    Klaim Harta 💰
                  </button>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  function getLootCardStyle(type) {
    switch (type) {
      case 'cash':
        return {
          emoji: '💵',
          bg: 'bg-emerald-50/70',
          border: 'border-emerald-200',
          badgeClass: 'bg-emerald-200 text-emerald-900'
        };
      case 'diamond':
        return {
          emoji: '💎',
          bg: 'bg-cyan-50/70',
          border: 'border-cyan-200',
          badgeClass: 'bg-cyan-200 text-cyan-900'
        };
      case 'painting':
        return {
          emoji: '🖼️',
          bg: 'bg-amber-50/70',
          border: 'border-amber-200',
          badgeClass: 'bg-amber-200 text-amber-900'
        };
      case 'first_aid':
        return {
          emoji: '🧰',
          bg: 'bg-rose-50/70',
          border: 'border-rose-200',
          badgeClass: 'bg-rose-200 text-rose-900'
        };
      case 'ammo':
        return {
          emoji: '🔫',
          bg: 'bg-slate-100',
          border: 'border-slate-300',
          badgeClass: 'bg-slate-300 text-slate-900'
        };
      default:
        return {
          emoji: '📦',
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          badgeClass: 'bg-slate-200 text-slate-700'
        };
    }
  }

  /**
   * Grid Seluruh Gangster: Menampilkan Siapa Menodong Siapa & Status Luka
   */
  function renderGangstersGrid(state, me) {
    const playersList = (state.turnOrder || []).map(id => state.players[id]).filter(Boolean);

    return `
      <div class="p-4 sm:p-5 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm">
        <div class="flex items-center justify-between mb-3.5">
          <h4 class="font-display font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
            <i data-lucide="crosshair" class="w-4 h-4 text-rose-600"></i>
            <span>Situasi Todongan Komplotan Gangster</span>
          </h4>
          <span class="text-xs font-body text-slate-500">Maks 3 Luka sebelum Gugur</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          ${playersList.map(p => {
            const isMe = p.id === currentPlayer.id;
            const isGf = p.id === state.godfatherId;
            const isAlive = p.isAlive;
            const wounds = p.wounds || 0;

            // Target todongan pistol (hanya terlihat setelah fase hold_up selesai!)
            const showAim = state.phase !== 'hold_up' && state.phase !== 'loot_reveal';
            const aimTarget = showAim && p.currentAimTargetId ? state.players[p.currentAimTargetId] : null;

            // Pilihan Keberanian (terlihat saat shootout atau seterusnya)
            const showCourage = state.phase === 'shootout' || state.phase === 'loot_sharing' || state.phase === 'round_summary';
            const courageChoice = showCourage ? p.courageChoice : null;

            return `
              <div class="p-3.5 rounded-2xl border-2 ${isMe ? 'border-indigo-400 bg-indigo-50/30' : (isAlive ? 'border-slate-200 bg-slate-50/60' : 'border-rose-200 bg-rose-50/40 opacity-70')} flex flex-col justify-between relative overflow-hidden transition-all">
                <div>
                  <!-- Header Kartu Pemain -->
                  <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-xl ${isAlive ? 'bg-slate-900 text-white' : 'bg-rose-600 text-white'} flex items-center justify-center font-display font-bold text-xs shadow-xs">
                        ${isAlive ? p.name.charAt(0).toUpperCase() : '💀'}
                      </div>
                      <div class="overflow-hidden">
                        <div class="font-display font-bold text-xs text-slate-900 flex items-center gap-1 truncate">
                          <span>${p.name}</span>
                          ${isMe ? '<span class="text-[9px] text-indigo-600 font-black">(Kamu)</span>' : ''}
                        </div>
                        <div class="text-[10px] font-body text-slate-500">
                          ${isGf ? '🎩 The Godfather' : 'Gangster'}
                        </div>
                      </div>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-display font-black ${isAlive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
                      ${isAlive ? 'HIDUP' : 'GUGUR 💀'}
                    </span>
                  </div>

                  <!-- Indikator Luka (3 Kotak Luka) -->
                  <div class="my-2 p-2 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between">
                    <span class="text-[10px] font-display font-bold text-slate-600">Luka:</span>
                    <div class="flex items-center gap-1.5">
                      <span class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${wounds >= 1 ? 'bg-rose-500 text-white font-bold' : 'bg-slate-200 text-slate-400'}">🩸</span>
                      <span class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${wounds >= 2 ? 'bg-rose-500 text-white font-bold' : 'bg-slate-200 text-slate-400'}">🩸</span>
                      <span class="w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${wounds >= 3 ? 'bg-rose-600 text-white font-bold' : 'bg-slate-200 text-slate-400'}">💀</span>
                    </div>
                  </div>

                  <!-- Situasi Todongan Pistol -->
                  <div class="text-[11px] font-body text-slate-700 bg-white p-2 rounded-xl border border-slate-200 space-y-1">
                    <div class="flex items-center justify-between">
                      <span class="text-slate-500 text-[10px]">Todong:</span>
                      ${aimTarget ? `
                        <span class="font-display font-bold text-rose-600 flex items-center gap-1">
                          🔫 ➔ ${aimTarget.name}
                        </span>
                      ` : (showAim ? '<span class="text-slate-400 italic">Tidak menodong</span>' : '<span class="text-amber-600 font-bold">🔒 Rahasia...</span>')}
                    </div>

                    ${courageChoice ? `
                      <div class="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span class="text-slate-500 text-[10px]">Aksi:</span>
                        <span class="font-display font-bold text-xs ${courageChoice === 'stand' ? 'text-emerald-600' : 'text-slate-500'}">
                          ${courageChoice === 'stand' ? '🦅 TETAP BERDIRI' : '🏳️ TIARAP'}
                        </span>
                      </div>
                    ` : ''}
                  </div>
                </div>

                <!-- Ringkasan Harta Milik Pemain -->
                <div class="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px] font-display font-bold text-slate-600">
                  <span>Harta: ${(p.lootStash || []).length} Kartu</span>
                  <span>Peluru: ${(p.bulletHand || []).length} Butir</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Dashboard Kontrol Pemain Aktif: Hand Peluru & Aksi Tiap Fase
   */
  function renderPlayerControlPanel(state, me) {
    if (!me || !me.isAlive) {
      return `
        <div class="p-5 rounded-3xl bg-rose-50 border-2 border-rose-200 text-center space-y-2">
          <div class="text-3xl">💀</div>
          <h4 class="font-display font-black text-base text-rose-900">Kamu Telah Gugur di Permainan Ini</h4>
          <p class="font-body text-xs text-rose-700 max-w-md mx-auto">
            Kamu telah menerima 3 luka dan meninggal dunia. Kamu dapat terus menonton pertandingan teman-temanmu atau kembali ke halaman utama.
          </p>
          <button 
            onclick="App.leaveCurrentGame()"
            class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-display font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer mt-2"
          >
            Keluar dari Game 🚪
          </button>
        </div>
      `;
    }

    const isGf = state.godfatherId === currentPlayer.id;
    const livingTargets = Object.values(state.players || {}).filter(p => p.isAlive && p.id !== currentPlayer.id);

    return `
      <div class="p-4 sm:p-5 rounded-3xl bg-slate-900 text-white shadow-xl space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <span class="text-xl">💼</span>
            <h4 class="font-display font-black text-base text-white">
              Peralatan Gangster Milikmu (${me.name})
            </h4>
          </div>
          <div class="flex items-center gap-2 text-xs font-display font-bold">
            <span class="px-2.5 py-1 rounded-lg bg-slate-800 text-emerald-400 border border-slate-700">
              💰 ${(me.lootStash || []).length} Harta Dikantongi
            </span>
            <span class="px-2.5 py-1 rounded-lg bg-slate-800 text-rose-400 border border-slate-700">
              🩸 ${me.wounds || 0}/3 Luka
            </span>
          </div>
        </div>

        <!-- Tampilan Hand Peluru Milik Pemain (Hanya Terlihat oleh Pemain Bersangkutan) -->
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-display font-bold text-slate-300">
              🔫 Sisa Peluru di Tanganmu (${(me.bulletHand || []).length} Kartu):
            </span>
            <span class="text-[10px] font-body text-slate-400">
              *Peluru yang dimainkan akan terbuang permanen!
            </span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            ${(me.bulletHand || []).map(card => {
              const isBang = card.type === 'bang';
              return `
                <div class="p-2.5 rounded-xl border ${isBang ? 'bg-rose-950/60 border-rose-500/40 text-rose-200' : 'bg-slate-800/80 border-slate-700 text-slate-300'} flex items-center justify-between">
                  <div>
                    <div class="font-display font-black text-xs ${isBang ? 'text-rose-400' : 'text-slate-200'}">
                      ${card.name}
                    </div>
                    <div class="text-[9px] font-body opacity-70">${isBang ? 'Peluru Tajam' : 'Peluru Kosong'}</div>
                  </div>
                  <span class="text-sm">${isBang ? '💥' : '💨'}</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Aksi Spesifik Tiap Fase -->
        <div class="pt-3 border-t border-slate-800">
          ${renderPhaseControls(state, me, livingTargets, isGf)}
        </div>
      </div>
    `;
  }

  /**
   * Kontrol Tombol Interaktif Sesuai Fase Permainan
   */
  function renderPhaseControls(state, me, livingTargets, isGf) {
    if (state.phase === 'hold_up') {
      const myChoice = state.holdUpChoices[currentPlayer.id];
      if (myChoice) {
        const targetP = state.players[myChoice.targetId];
        return `
          <div class="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-center space-y-1">
            <div class="text-emerald-400 font-display font-bold text-sm">
              ✅ Pilihan Todongan Terkunci!
            </div>
            <p class="text-xs font-body text-slate-300">
              Kamu membidik pistolmu ke arah <b>${targetP?.name || 'Target'}</b>. Menunggu komplotan lain selesai memilih...
            </p>
          </div>
        `;
      }

      return `
        <div class="space-y-3">
          <div class="flex items-center gap-2 text-xs font-display font-bold text-rose-400">
            <i data-lucide="crosshair" class="w-4 h-4"></i>
            <span>Pilih Peluru & Target Todonganmu Sekarang:</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- 1. Pilih Peluru -->
            <div>
              <label class="block text-[11px] font-display font-bold text-slate-300 mb-1.5">
                1. Pilih Kartu Peluru Rahasia:
              </label>
              <select 
                id="select-bullet-card" 
                class="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-display font-bold text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
              >
                ${(me.bulletHand || []).map(b => `
                  <option value="${b.id}">${b.name} (${b.type === 'bang' ? 'Peluru Tajam' : 'Gertakan Kosong'})</option>
                `).join('')}
              </select>
            </div>

            <!-- 2. Pilih Sasaran -->
            <div>
              <label class="block text-[11px] font-display font-bold text-slate-300 mb-1.5">
                2. Pilih Gangster yang Ingin Ditodong:
              </label>
              <select 
                id="select-aim-target" 
                class="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-display font-bold text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
              >
                ${livingTargets.map(t => `
                  <option value="${t.id}">${t.name} (Luka: ${t.wounds || 0}/3)</option>
                `).join('')}
              </select>
            </div>
          </div>

          <button 
            onclick="CashNGunsGame.handleHoldUpSubmit()"
            class="w-full py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-display font-black text-xs sm:text-sm shadow-lg shadow-rose-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <i data-lucide="lock" class="w-4 h-4"></i>
            <span>Kunci Pilihan Todongan Pistol 🔒</span>
          </button>
        </div>
      `;
    }

    if (state.phase === 'godfather_privilege') {
      if (isGf) {
        // Godfather aktif memilih
        return `
          <div class="space-y-3 p-4 rounded-2xl bg-amber-950/60 border border-amber-500/40">
            <div class="flex items-center gap-2 text-xs font-display font-bold text-amber-400">
              <span>🎩 Hak Istimewa Godfather:</span>
              <span class="text-white/80 font-normal">Perintahkan 1 pemain mengubah arah todongan pistolnya!</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[11px] font-display font-bold text-slate-300 mb-1">Pilih Pemain yang Diperintah:</label>
                <select id="gf-forced-player" class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-display font-bold">
                  ${livingTargets.map(p => {
                    const currTarget = state.players[p.currentAimTargetId]?.name || 'Tidak Ada';
                    return `<option value="${p.id}">${p.name} (Sedang menodong: ${currTarget})</option>`;
                  }).join('')}
                </select>
              </div>
              <div>
                <label class="block text-[11px] font-display font-bold text-slate-300 mb-1">Alihkan Todongannya ke:</label>
                <select id="gf-new-target" class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-display font-bold">
                  ${Object.values(state.players || {}).filter(p => p.isAlive).map(p => `
                    <option value="${p.id}">${p.name} ${p.id === currentPlayer.id ? '(Kamu Sendiri)' : ''}</option>
                  `).join('')}
                </select>
              </div>
            </div>

            <div class="flex items-center gap-2 pt-1">
              <button 
                onclick="CashNGunsGame.handleGodfatherChangeSubmit()"
                class="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-display font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
              >
                Paksa Ubah Todongan! 🔄
              </button>
              <button 
                onclick="CashNGunsGame.applyGodfatherPrivilege(null, null)"
                class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-display font-bold text-xs border border-slate-700 transition-all cursor-pointer"
              >
                Pass (Lewati) ⏭️
              </button>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="p-3.5 rounded-2xl bg-slate-800/80 text-center text-xs font-body text-slate-300">
            🎩 Menunggu keputusan Hak Istimewa dari Godfather (<b>${state.players[state.godfatherId]?.name}</b>)...
          </div>
        `;
      }
    }

    if (state.phase === 'courage') {
      const myCourage = state.courageChoices[currentPlayer.id];
      if (myCourage) {
        return `
          <div class="p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 text-center space-y-1">
            <div class="text-indigo-400 font-display font-bold text-sm">
              ✅ Pilihan Terkunci: ${myCourage === 'stand' ? '🦅 TETAP BERDIRI' : '🏳️ TIARAP'}
            </div>
            <p class="text-xs font-body text-slate-300">
              Menunggu gangster lain memutuskan keberanian mereka...
            </p>
          </div>
        `;
      }

      // Hitung berapa gangster yang sedang menodong pemain ini
      const aimedByCount = Object.values(state.players || {}).filter(p => p.isAlive && p.currentAimTargetId === currentPlayer.id).length;

      return `
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2 text-xs font-display font-bold text-indigo-300">
              <i data-lucide="shield-alert" class="w-4 h-4"></i>
              <span>Keputusan Keberanian: Tetap Berdiri atau Tiarap?</span>
            </div>
            <span class="px-2.5 py-0.5 rounded-full ${aimedByCount > 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'} text-[10px] font-display font-bold">
              ${aimedByCount > 0 ? `⚠️ Kamu ditodong oleh ${aimedByCount} gangster!` : 'Aman: Tidak ada yang menodongmu!'}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button 
              onclick="CashNGunsGame.submitCourageChoice('stand')"
              class="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-display font-black text-xs sm:text-sm shadow-md active:scale-95 transition-all text-left flex items-start gap-3 cursor-pointer"
            >
              <span class="text-2xl">🦅</span>
              <div>
                <div class="text-sm font-black">TETAP BERDIRI! (Banzai)</div>
                <div class="text-[10px] font-body text-emerald-100 font-normal mt-0.5">
                  Berani ambil risiko ditembak demi hak mengambil harta rampokan!
                </div>
              </div>
            </button>

            <button 
              onclick="CashNGunsGame.submitCourageChoice('duck')"
              class="p-4 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 text-white font-display font-black text-xs sm:text-sm border border-slate-600 active:scale-95 transition-all text-left flex items-start gap-3 cursor-pointer"
            >
              <span class="text-2xl">🏳️</span>
              <div>
                <div class="text-sm font-black text-slate-200">TIARAP! (Menyerah)</div>
                <div class="text-[10px] font-body text-slate-400 font-normal mt-0.5">
                  Aman dari tembakan ronde ini, tetapi kehilangan hak ambil harta & peluru terbuang.
                </div>
              </div>
            </button>
          </div>
        </div>
      `;
    }

    if (state.phase === 'shootout') {
      return `
        <div class="p-3.5 rounded-2xl bg-slate-800/80 text-center text-xs font-body text-slate-300">
          💥 Tembak-menembak telah terjadi! Lihat rangkuman riwayat aksi di bawah. Host dapat melanjutkan ke Pembagian Harta.
        </div>
      `;
    }

    if (state.phase === 'loot_sharing') {
      const isMyTurn = state.currentPickerId === currentPlayer.id;
      return `
        <div class="p-3.5 rounded-2xl ${isMyTurn ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300' : 'bg-slate-800/80 text-slate-300'} text-center text-xs font-body">
          ${isMyTurn 
            ? '👉 <b>Ini giliranmu!</b> Silakan klik salah satu kartu rampokan atau Meja Godfather di area Meja Tengah di atas.' 
            : `Menunggu [${state.players[state.currentPickerId]?.name || 'Pemain'}] memilih kartu dari meja...`}
        </div>
      `;
    }

    return `
      <div class="text-xs font-body text-slate-400 text-center">
        Ca$h 'n Guns siap dilanjutkan.
      </div>
    `;
  }

  /**
   * Riwayat Aksi Log Terkini
   */
  function renderActionLogs(state) {
    const logs = (state.actionLogs || []).slice(-6).reverse();

    return `
      <div class="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
        <h5 class="font-display font-bold text-xs text-slate-700 flex items-center gap-1.5 mb-2.5">
          <i data-lucide="history" class="w-3.5 h-3.5 text-slate-500"></i>
          <span>Riwayat Aksi Komplotan</span>
        </h5>
        <div class="space-y-1.5">
          ${logs.map(log => `
            <div class="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] font-body text-slate-700 leading-snug">
              ${log.text}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * 3. Render Tampilan Game Over & Podium Kekayaan
   */
  function renderGameOverView(container, state) {
    const scores = state.finalScores || calculateFinalScores(state);
    const winner = scores[0] || null;
    const isHost = currentPlayer?.isHost;

    container.innerHTML = `
      <div class="w-full max-w-4xl mx-auto py-8 px-4 space-y-6">
        <!-- Banner Juara -->
        <div class="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white text-center shadow-2xl relative overflow-hidden">
          <div class="text-5xl mb-2">👑💰</div>
          <span class="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-display font-bold text-xs">
            Ca$h 'n Guns - Selesai 8 Ronde!
          </span>
          <h2 class="font-display font-black text-2xl sm:text-3xl text-white mt-2 mb-1">
            ${winner ? `${winner.name} Adalah Gangster Paling Tajir!` : 'Semua Gangster Telah Gugur!'}
          </h2>
          <p class="font-body text-xs sm:text-sm text-emerald-200/80 max-w-lg mx-auto">
            ${winner ? `Total Kekayaan Bersih: ${formatMoney(winner.grandTotal)}! Selamat menikmati hasil jarahan.` : 'Tidak ada satu pun gangster yang berhasil bertahan hidup dari 3 luka.'}
          </p>
        </div>

        <!-- Tabel Skor Lengkap -->
        <div class="p-6 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm space-y-4">
          <h4 class="font-display font-bold text-base text-slate-900 flex items-center gap-2">
            <i data-lucide="award" class="w-5 h-5 text-emerald-600"></i>
            <span>Papan Peringkat Hasil Jarahan Gangster</span>
          </h4>

          <div class="space-y-3">
            ${scores.map((s, idx) => {
              const isWinner = idx === 0;
              const badgeClass = isWinner ? 'bg-amber-100 text-amber-800 border-amber-300' : (idx === 1 ? 'bg-slate-200 text-slate-800' : 'bg-slate-100 text-slate-600');
              const medalEmoji = idx === 0 ? '🥇' : (idx === 1 ? '🥈' : (idx === 2 ? '🥉' : `#${idx + 1}`));

              return `
                <div class="p-4 rounded-2xl border-2 ${isWinner ? 'border-amber-400 bg-amber-50/40' : 'border-slate-200 bg-slate-50/60'} flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div class="flex items-center gap-3">
                    <span class="text-2xl">${medalEmoji}</span>
                    <div>
                      <div class="font-display font-black text-base text-slate-900 flex items-center gap-2">
                        <span>${s.name}</span>
                        ${s.playerId === currentPlayer.id ? '<span class="text-xs text-indigo-600 font-bold">(Kamu)</span>' : ''}
                      </div>
                      <div class="flex flex-wrap items-center gap-2 text-[11px] font-body text-slate-500 mt-0.5">
                        <span>💵 Uang: ${formatMoney(s.cashTotal)}</span>
                        <span>•</span>
                        <span>💎 Berlian (${s.diamondCount}): ${formatMoney(s.totalDiamondsScore)} ${s.getsDiamondBonus ? '<b>(+$60k Bonus)</b>' : ''}</span>
                        <span>•</span>
                        <span>🖼️ Lukisan (${s.paintingCount}): ${formatMoney(s.paintingTotal)}</span>
                      </div>
                    </div>
                  </div>

                  <div class="text-right shrink-0">
                    <div class="font-display font-black text-lg text-emerald-700">
                      ${formatMoney(s.grandTotal)}
                    </div>
                    <div class="text-[10px] font-body text-slate-400">Total Kekayaan</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Tombol Kembali / Main Lagi -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          ${isHost ? `
            <button 
              onclick="CashNGunsGame.resetGame()"
              class="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-sm shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
              <span>Main Lagi 🔄</span>
            </button>
          ` : ''}
          <button 
            onclick="App.returnToLobby()"
            class="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <i data-lucide="home" class="w-4 h-4"></i>
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

    UI.refreshIcons();
  }

  /**
   * Helper Handler Event Input dari UI
   */
  function handleHoldUpSubmit() {
    const cardEl = document.getElementById('select-bullet-card');
    const targetEl = document.getElementById('select-aim-target');
    if (!cardEl || !targetEl) return;
    submitHoldUpChoice(cardEl.value, targetEl.value);
  }

  function handleGodfatherChangeSubmit() {
    const forcedEl = document.getElementById('gf-forced-player');
    const newTargetEl = document.getElementById('gf-new-target');
    if (!forcedEl || !newTargetEl) return;
    applyGodfatherPrivilege(forcedEl.value, newTargetEl.value);
  }

  function cleanup() {
    isSubmitting = false;
    UI.Logger('CASH-N-GUNS', 'Cleaned up Ca$h \'n Guns game module');
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
    proceedToHoldUp,
    handleHoldUpSubmit,
    handleGodfatherChangeSubmit,
    submitHoldUpChoice,
    applyGodfatherPrivilege,
    submitCourageChoice,
    proceedToLootSharing,
    pickLootItem,
    nextRound,
    resetGame,
    cleanup
  };
})();

if (typeof window !== 'undefined') {
  window.CashNGunsGame = CashNGunsGame;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CashNGunsGame;
}
