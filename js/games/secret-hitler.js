/**
 * ==========================================================================
 * DISCORD PARTY HUB - GAME 9: "SECRET HITLER" (DEDUKSI SOSIAL & POLITIK)
 * ==========================================================================
 * 100% Mengikuti Aturan Resmi Board Game Secret Hitler (5-10 Pemain):
 * - Distribusi Peran Resmi (Liberal, Fascist, Secret Hitler)
 * - Pengetahuan Awal Berdasarkan Jumlah Pemain (5-6 vs 7-10 pemain)
 * - Dek Kebijakan (6 Liberal, 11 Fascist) & Reshuffle Otomatis jika < 3 kartu
 * - Papan Liberal (5 Slot) & Election Tracker (0-3) dengan Aturan Chaos
 * - Papan Fascist (6 Slot) dengan Kekuatan Eksekutif Dinamis (5-6, 7-8, 9-10 pemain)
 * - Fase Pemilihan Pemerintah, Batas Masa Jabatan (Term Limits), Voting JA! / NEIN!
 * - Cek Kemenangan Instan Hitler Territory (Fascist >= 3 & Hitler terpilih Kanselir)
 * - Sesi Legislatif (Presiden 3 -> Kanselir 2 -> Sahkan 1) & Hak Veto (Fascist >= 5)
 * - Kekuatan Eksekutif: Policy Peek, Investigate Loyalty, Special Election, Execution
 *
 * Terhubung ke Firebase Realtime Database: rooms/{roomCode}/secretHitlerGame
 * ==========================================================================
 */

const SecretHitlerGame = (function () {
  'use strict';

  // Module Local State
  let currentRoom = null;
  let currentPlayer = null;
  let isSubmitting = false;
  let isRoleRevealed = false; // Toggle tampilan kartu peran sendiri

  /**
   * Helper: Mengambil state permainan Secret Hitler dari roomData
   */
  function getGameState(roomData) {
    if (!roomData) return {};
    return roomData.secretHitlerGame || roomData.gameState?.secretHitler || {};
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
   * 1. DISTRIBUSI PERAN RESMI (5-10 PEMAIN)
   */
  function getRoleDistribution(playerCount) {
    switch (playerCount) {
      case 5:  return { liberals: 3, fascists: 1, hitler: 1 };
      case 6:  return { liberals: 4, fascists: 1, hitler: 1 };
      case 7:  return { liberals: 4, fascists: 2, hitler: 1 };
      case 8:  return { liberals: 5, fascists: 2, hitler: 1 };
      case 9:  return { liberals: 5, fascists: 3, hitler: 1 };
      case 10: return { liberals: 6, fascists: 3, hitler: 1 };
      default: return { liberals: 3, fascists: 1, hitler: 1 };
    }
  }

  /**
   * Buat Dek Kebijakan Resmi (6 Liberal, 11 Fascist = 17 Kartu)
   */
  function generatePolicyDeck() {
    const deck = [];
    for (let i = 1; i <= 6; i++) {
      deck.push({ id: `lib_${i}_${Math.random().toString(36).substr(2, 4)}`, type: 'liberal' });
    }
    for (let i = 1; i <= 11; i++) {
      deck.push({ id: `fas_${i}_${Math.random().toString(36).substr(2, 4)}`, type: 'fascist' });
    }
    return shuffle(deck);
  }

  /**
   * Dapatkan Konfigurasi Kekuatan Eksekutif Papan Fascist
   * Berdasarkan jumlah pemain awal (5-6, 7-8, atau 9-10)
   */
  function getFascistBoardPowers(playerCount) {
    if (playerCount <= 6) {
      return {
        1: null,
        2: null,
        3: 'policy_peek',
        4: 'execution',
        5: 'execution_and_veto'
      };
    } else if (playerCount <= 8) {
      return {
        1: null,
        2: 'investigate_loyalty',
        3: 'special_election',
        4: 'execution',
        5: 'execution_and_veto'
      };
    } else {
      return {
        1: 'investigate_loyalty',
        2: 'investigate_loyalty',
        3: 'special_election',
        4: 'execution',
        5: 'execution_and_veto'
      };
    }
  }

  /**
   * 2. INISIALISASI PERMAINAN BARU OLEH HOST
   */
  async function startGame() {
    if (!currentRoom || !currentPlayer || !currentPlayer.isHost || isSubmitting) return;

    const playersList = Object.values(currentRoom.players || {});
    if (playersList.length < 5) {
      UI.Toast('Minimal 5 pemain diperlukan untuk memainkan Secret Hitler!', 'warning');
      return;
    }

    if (playersList.length > 10) {
      UI.Toast('Maksimal 10 pemain untuk memainkan Secret Hitler!', 'warning');
      return;
    }

    isSubmitting = true;
    UI.Sound.fanfare();

    const playerCount = playersList.length;
    const dist = getRoleDistribution(playerCount);

    // Susun array peran
    const rolePool = [];
    for (let i = 0; i < dist.liberals; i++) rolePool.push('liberal');
    for (let i = 0; i < dist.fascists; i++) rolePool.push('fascist');
    rolePool.push('hitler');

    const shuffledRoles = shuffle(rolePool);
    const turnOrder = shuffle(playersList.map(p => p.id));

    const playersData = {};
    turnOrder.forEach((pid, idx) => {
      const p = currentRoom.players[pid];
      const assignedRole = shuffledRoles[idx];
      const assignedParty = (assignedRole === 'liberal') ? 'liberal' : 'fascist'; // Hitler memegang kartu partai Fascist!

      playersData[pid] = {
        id: pid,
        name: p.name,
        role: assignedRole,
        party: assignedParty,
        isAlive: true,
        isInvestigated: false
      };
    });

    const policyDeck = generatePolicyDeck();
    const powersConfig = getFascistBoardPowers(playerCount);

    const initialGameState = {
      status: 'playing',
      phase: 'nomination', // 'nomination' | 'voting' | 'vote_reveal' | 'legislative_president' | 'legislative_chancellor' | 'veto_pending' | 'executive_action' | 'game_over'
      initialPlayerCount: playerCount,
      powersConfig: powersConfig,
      turnOrder: turnOrder,
      players: playersData,
      presidentIndex: 0,
      presidentCandidateId: turnOrder[0],
      chancellorCandidateId: null,
      lastElectedPresidentId: null,
      lastElectedChancellorId: null,
      specialElectionReturnIndex: null, // Jika ada pemilu khusus
      
      // Papan & Kebijakan
      liberalPolicies: 0,
      fascistPolicies: 0,
      electionTracker: 0,
      vetoUnlocked: false,
      vetoRequested: false,

      // Dek Kebijakan
      deck: policyDeck,
      discardPile: [],
      legislativeCards: [], // 3 kartu yang ditarik untuk sesi legislatif

      // Pemungutan Suara
      votes: {}, // { [playerId]: 'ja' | 'nein' }
      lastVoteResult: null,

      // Kekuatan Eksekutif
      activeExecutivePower: null,
      executiveDetails: null, // Hasil investigasi atau intip kebijakan

      // Kondisi Menang
      winnerTeam: null, // 'liberal' | 'fascist'
      winReason: null,

      actionLogs: [
        {
          text: `🗳️ Permainan Secret Hitler dimulai dengan ${playerCount} pemain! Peran rahasia telah dibagikan. Kandidat Presiden pertama: [${playersData[turnOrder[0]].name}].`,
          timestamp: Date.now()
        }
      ]
    };

    await DB.updateGameState(currentRoom.code, 'secretHitler', initialGameState);
    isSubmitting = false;
  }

  /**
   * Helper: Hitung Jumlah Pemain yang Masih Hidup
   */
  function getLivingPlayers(players) {
    return Object.values(players || {}).filter(p => p.isAlive);
  }

  /**
   * Helper: Validasi Apakah Seorang Pemain Boleh Dicalonkan Menjadi Kanselir (Term Limits)
   */
  function canBeNominatedChancellor(candidateId, state) {
    const candidate = state.players[candidateId];
    if (!candidate || !candidate.isAlive) return false;
    if (candidateId === state.presidentCandidateId) return false; // Tidak bisa menominasikan diri sendiri

    // 1. Kanselir Terakhir yang Terpilih TIDAK BOLEH dicalonkan
    if (candidateId === state.lastElectedChancellorId) return false;

    // 2. Presiden Terakhir TIDAK BOLEH jika pemain hidup > 5 orang
    const livingCount = getLivingPlayers(state.players).length;
    if (livingCount > 5 && candidateId === state.lastElectedPresidentId) {
      return false;
    }

    return true;
  }

  /**
   * 3. FASE 1: NOMINASI KANSELIR OLEH PRESIDEN
   */
  async function nominateChancellor(candidateId) {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    const state = getGameState(currentRoom);

    if (state.phase !== 'nomination') return;
    if (state.presidentCandidateId !== currentPlayer.id) {
      UI.Toast('Hanya Kandidat Presiden yang dapat menominasikan Kanselir!', 'warning');
      return;
    }

    if (!canBeNominatedChancellor(candidateId, state)) {
      UI.Toast('Pemain ini terkena batas masa jabatan (Term Limits) atau tidak sah!', 'warning');
      return;
    }

    isSubmitting = true;
    UI.Sound.click();

    const candidate = state.players[candidateId];
    const newState = JSON.parse(JSON.stringify(state));

    newState.chancellorCandidateId = candidateId;
    newState.phase = 'voting';
    newState.votes = {};
    newState.lastVoteResult = null;

    newState.actionLogs.push({
      text: `📜 Presiden [${currentPlayer.name}] menominasikan [${candidate.name}] sebagai Kanselir! Pemungutan suara JA! / NEIN! dimulai.`,
      timestamp: Date.now()
    });

    await DB.updateGameState(currentRoom.code, 'secretHitler', newState);
    isSubmitting = false;
  }

  /**
   * 4. FASE 1: PEMUNGUTAN SUARA RAHASIA (VOTING JA! / NEIN!)
   */
  async function castVote(voteChoice) {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    const state = getGameState(currentRoom);

    if (state.phase !== 'voting') return;
    const myPlayerData = state.players[currentPlayer.id];
    if (!myPlayerData || !myPlayerData.isAlive) {
      UI.Toast('Pemain yang sudah gugur tidak memiliki hak suara!', 'warning');
      return;
    }

    isSubmitting = true;
    UI.Sound.pop();

    const newState = JSON.parse(JSON.stringify(state));
    newState.votes = newState.votes || {};
    newState.votes[currentPlayer.id] = voteChoice; // 'ja' | 'nein'

    // Cek apakah seluruh pemain hidup sudah memberikan suara
    const livingPlayers = getLivingPlayers(newState.players);
    const livingVotedCount = livingPlayers.filter(p => newState.votes[p.id]).length;

    if (livingVotedCount >= livingPlayers.length) {
      // Seluruh suara masuk! Buka hasil pemilihan secara serentak
      processVoteResults(newState, livingPlayers);
    }

    await DB.updateGameState(currentRoom.code, 'secretHitler', newState);
    isSubmitting = false;
  }

  /**
   * Evaluasi Hasil Voting Pemilihan Pemerintah
   */
  function processVoteResults(state, livingPlayers) {
    let jaCount = 0;
    let neinCount = 0;
    const voteDetails = {};

    livingPlayers.forEach(p => {
      const v = state.votes[p.id] || 'nein';
      voteDetails[p.id] = { name: p.name, vote: v };
      if (v === 'ja') jaCount++;
      else neinCount++;
    });

    const isPassed = jaCount > neinCount; // Mayoritas murni (> 50%)
    const chancellor = state.players[state.chancellorCandidateId];
    const president = state.players[state.presidentCandidateId];

    state.phase = 'vote_reveal';
    state.lastVoteResult = {
      jaCount,
      neinCount,
      isPassed,
      voteDetails
    };

    if (isPassed) {
      UI.Sound.fanfare();
      state.actionLogs.push({
        text: `✅ PEMILIHAN LOLOS! (${jaCount} JA vs ${neinCount} NEIN). [${president.name}] dan [${chancellor.name}] resmi menjabat!`,
        timestamp: Date.now()
      });

      // CEK KEMENANGAN INSTAN HITLER:
      // Jika di papan sudah ada >= 3 Kebijakan Fascist DAN Kanselir terpilih adalah Hitler -> Fasis Menang Seketika!
      if (state.fascistPolicies >= 3 && chancellor.role === 'hitler') {
        state.phase = 'game_over';
        state.status = 'game_over';
        state.winnerTeam = 'fascist';
        state.winReason = `Secret Hitler ([${chancellor.name}]) berhasil terpilih sebagai Kanselir saat 3+ Kebijakan Fasis telah disahkan! Kaum Fasis Menguasai Pemerintahan!`;
        state.actionLogs.push({
          text: `💀 KEMENANGAN FASIS MUTLAK: ${state.winReason}`,
          timestamp: Date.now()
        });
        return;
      }
    } else {
      UI.Sound.pop();
      state.electionTracker += 1;
      state.actionLogs.push({
        text: `❌ PEMILIHAN GAGAL! (${jaCount} JA vs ${neinCount} NEIN). Election Tracker naik menjadi [${state.electionTracker}/3].`,
        timestamp: Date.now()
      });

      // ATURAN CHAOS (Election Tracker mencapai 3):
      if (state.electionTracker >= 3) {
        triggerChaosEnactment(state);
      }
    }
  }

  /**
   * Aturan Chaos: Ambil 1 kartu dari dek dan langsung sahkan tanpa kekuatan eksekutif
   */
  function triggerChaosEnactment(state) {
    ensurePolicyDeck(state);
    const chaosCard = state.deck.shift();

    state.actionLogs.push({
      text: `⚡ CHAOS PARLEMEN! Tiga kali pemilihan gagal berturut-turut! Rakyat mengesahkan kebijakan darurat teratas dek: [${chaosCard.type.toUpperCase()}]!`,
      timestamp: Date.now()
    });

    if (chaosCard.type === 'liberal') {
      state.liberalPolicies += 1;
    } else {
      state.fascistPolicies += 1;
    }

    state.electionTracker = 0;
    // Hapus status term limits saat Chaos terjadi
    state.lastElectedPresidentId = null;
    state.lastElectedChancellorId = null;

    // Cek kemenangan game
    if (state.liberalPolicies >= 5) {
      state.phase = 'game_over';
      state.status = 'game_over';
      state.winnerTeam = 'liberal';
      state.winReason = '5 Kebijakan Liberal berhasil disahkan di Parlemen!';
    } else if (state.fascistPolicies >= 6) {
      state.phase = 'game_over';
      state.status = 'game_over';
      state.winnerTeam = 'fascist';
      state.winReason = '6 Kebijakan Fasis berhasil disahkan di Parlemen!';
    }
  }

  /**
   * Tutup Hasil Reveal Voting dan Melangkah ke Fase Berikutnya
   */
  async function proceedAfterVoteReveal() {
    if (!currentRoom || isSubmitting) return;
    const state = getGameState(currentRoom);
    if (state.phase !== 'vote_reveal') return;

    isSubmitting = true;
    UI.Sound.click();

    const newState = JSON.parse(JSON.stringify(state));
    const voteResult = newState.lastVoteResult;

    if (voteResult && voteResult.isPassed) {
      // Masuk ke Sesi Legislatif Presiden
      newState.electionTracker = 0;
      newState.phase = 'legislative_president';
      ensurePolicyDeck(newState);
      // Ambil 3 kartu teratas
      newState.legislativeCards = newState.deck.splice(0, 3);
      newState.actionLogs.push({
        text: `🏛️ Sesi Legislatif: Presiden [${newState.players[newState.presidentCandidateId].name}] mengambil 3 kartu kebijakan rahasia...`,
        timestamp: Date.now()
      });
    } else {
      // Pemilihan gagal: Pindahkan giliran Presiden ke pemain berikutnya
      advancePresidentTurn(newState);
      newState.phase = 'nomination';
      newState.chancellorCandidateId = null;
    }

    await DB.updateGameState(currentRoom.code, 'secretHitler', newState);
    isSubmitting = false;
  }

  /**
   * Helper: Pastikan Dek Memiliki Minimal 3 Kartu (Kocok Ulang Discard Pile jika < 3)
   */
  function ensurePolicyDeck(state) {
    if (!state.deck) state.deck = [];
    if (!state.discardPile) state.discardPile = [];

    if (state.deck.length < 3) {
      const combined = [...state.deck, ...state.discardPile];
      state.deck = shuffle(combined);
      state.discardPile = [];
      state.actionLogs.push({
        text: `🎴 Sisa dek kurang dari 3 kartu: Tumpukan kartu buangan dikocok ulang bersama sisa dek! (${state.deck.length} kartu di dek).`,
        timestamp: Date.now()
      });
    }
  }

  /**
   * 5. FASE 2: PRESIDEN MEMBUANG 1 KARTU & MENERUSKAN 2 KARTU KE KANSELIR
   */
  async function presidentDiscardPolicy(cardIndex) {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    const state = getGameState(currentRoom);

    if (state.phase !== 'legislative_president') return;
    if (state.presidentCandidateId !== currentPlayer.id) {
      UI.Toast('Hanya Presiden yang dapat membuang kartu pada tahap ini!', 'warning');
      return;
    }

    isSubmitting = true;
    UI.Sound.pop();

    const newState = JSON.parse(JSON.stringify(state));
    const discardedCard = newState.legislativeCards.splice(cardIndex, 1)[0];
    newState.discardPile.push(discardedCard);

    newState.phase = 'legislative_chancellor';
    newState.actionLogs.push({
      text: `📜 Presiden telah membuang 1 kartu secara tertutup dan meneruskan 2 kartu kebijakan ke Kanselir [${newState.players[newState.chancellorCandidateId].name}].`,
      timestamp: Date.now()
    });

    await DB.updateGameState(currentRoom.code, 'secretHitler', newState);
    isSubmitting = false;
  }

  /**
   * 6. FASE 2: KANSELIR MENGESAHKAN 1 KARTU (ATAU MENGAJUKAN VETO)
   */
  async function chancellorEnactPolicy(cardIndex) {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    const state = getGameState(currentRoom);

    if (state.phase !== 'legislative_chancellor') return;
    if (state.chancellorCandidateId !== currentPlayer.id) {
      UI.Toast('Hanya Kanselir yang dapat mengesahkan kartu!', 'warning');
      return;
    }

    isSubmitting = true;
    UI.Sound.fanfare();

    const newState = JSON.parse(JSON.stringify(state));
    const enactedCard = newState.legislativeCards.splice(cardIndex, 1)[0];
    const discardedCard = newState.legislativeCards.splice(0, 1)[0];
    newState.discardPile.push(discardedCard);

    // Sahkan kebijakan
    const isLiberal = (enactedCard.type === 'liberal');
    if (isLiberal) {
      newState.liberalPolicies += 1;
    } else {
      newState.fascistPolicies += 1;
    }

    // Perbarui Term Limits
    newState.lastElectedPresidentId = newState.presidentCandidateId;
    newState.lastElectedChancellorId = newState.chancellorCandidateId;

    newState.actionLogs.push({
      text: `⚖️ KANSELIR TELAH MENGESAHKAN: [${enactedCard.type.toUpperCase()}]! (Skor: ${newState.liberalPolicies} Liberal vs ${newState.fascistPolicies} Fascist).`,
      timestamp: Date.now()
    });

    // Cek Kemenangan Game
    if (newState.liberalPolicies >= 5) {
      newState.phase = 'game_over';
      newState.status = 'game_over';
      newState.winnerTeam = 'liberal';
      newState.winReason = '5 Kebijakan Liberal berhasil disahkan di Parlemen!';
      await DB.updateGameState(currentRoom.code, 'secretHitler', newState);
      isSubmitting = false;
      return;
    }

    if (newState.fascistPolicies >= 6) {
      newState.phase = 'game_over';
      newState.status = 'game_over';
      newState.winnerTeam = 'fascist';
      newState.winReason = '6 Kebijakan Fasis berhasil disahkan di Parlemen!';
      await DB.updateGameState(currentRoom.code, 'secretHitler', newState);
      isSubmitting = false;
      return;
    }

    // Aktifkan Hak Veto jika Fascist Policies sudah mencapai 5
    if (newState.fascistPolicies >= 5) {
      newState.vetoUnlocked = true;
    }

    // Cek Kekuatan Eksekutif jika kebijakan yang disahkan adalah FASCIST
    if (!isLiberal) {
      const power = newState.powersConfig[newState.fascistPolicies];
      if (power) {
        newState.phase = 'executive_action';
        newState.activeExecutivePower = power;
        newState.actionLogs.push({
          text: `⚡ Kekuatan Eksekutif Terbuka untuk Presiden: [${getPowerName(power)}]!`,
          timestamp: Date.now()
        });
        await DB.updateGameState(currentRoom.code, 'secretHitler', newState);
        isSubmitting = false;
        return;
      }
    }

    // Jika tidak ada kekuatan eksekutif, majukan giliran Presiden
    advancePresidentTurn(newState);
    newState.phase = 'nomination';
    newState.chancellorCandidateId = null;

    await DB.updateGameState(currentRoom.code, 'secretHitler', newState);
    isSubmitting = false;
  }

  /**
   * Opsi Veto oleh Kanselir (Aktif setelah 5 Kebijakan Fascist)
   */
  async function requestVeto() {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    const state = getGameState(currentRoom);

    if (state.phase !== 'legislative_chancellor' || !state.vetoUnlocked) return;
    if (state.chancellorCandidateId !== currentPlayer.id) return;

    isSubmitting = true;
    UI.Sound.pop();

    const newState = JSON.parse(JSON.stringify(state));
    newState.phase = 'veto_pending';
    newState.actionLogs.push({
      text: `🛑 Kanselir [${currentPlayer.name}] MENGAJUKAN HAK VETO untuk membuang kedua kebijakan! Menunggu persetujuan Presiden...`,
      timestamp: Date.now()
    });

    await DB.updateGameState(currentRoom.code, 'secretHitler', newState);
    isSubmitting = false;
  }

  /**
   * Respon Presiden atas Pengajuan Veto (Setujui atau Tolak)
   */
  async function respondVeto(accept) {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    const state = getGameState(currentRoom);

    if (state.phase !== 'veto_pending') return;
    if (state.presidentCandidateId !== currentPlayer.id) return;

    isSubmitting = true;
    const newState = JSON.parse(JSON.stringify(state));

    if (accept) {
      UI.Sound.fanfare();
      // Buang kedua kartu ke discard pile
      newState.discardPile.push(...newState.legislativeCards);
      newState.legislativeCards = [];
      newState.electionTracker += 1;

      newState.actionLogs.push({
        text: `🛑 Presiden MENYETUJUI HAK VETO! Kedua kebijakan dibuang tanpa disahkan. Election Tracker naik menjadi [${newState.electionTracker}/3].`,
        timestamp: Date.now()
      });

      if (newState.electionTracker >= 3) {
        triggerChaosEnactment(newState);
      }

      advancePresidentTurn(newState);
      newState.phase = 'nomination';
      newState.chancellorCandidateId = null;
    } else {
      UI.Sound.pop();
      newState.phase = 'legislative_chancellor';
      newState.actionLogs.push({
        text: `❌ Presiden MENOLAK HAK VETO! Kanselir wajib mensahkan 1 dari 2 kartu kebijakan.`,
        timestamp: Date.now()
      });
    }

    await DB.updateGameState(currentRoom.code, 'secretHitler', newState);
    isSubmitting = false;
  }

  /**
   * 7. FASE 3: EKSEKUSI KEKUATAN PRESIDEN (EXECUTIVE ACTIONS)
   */
  // A. Policy Peek: Selesai intip 3 kartu teratas
  async function completePolicyPeek() {
    if (!currentRoom || isSubmitting) return;
    const state = getGameState(currentRoom);
    if (state.phase !== 'executive_action' || state.activeExecutivePower !== 'policy_peek') return;

    isSubmitting = true;
    UI.Sound.click();

    const newState = JSON.parse(JSON.stringify(state));
    newState.activeExecutivePower = null;
    advancePresidentTurn(newState);
    newState.phase = 'nomination';
    newState.chancellorCandidateId = null;

    newState.actionLogs.push({
      text: `👁️ Presiden telah selesai mengintip 3 kartu teratas dek kebijakan rahasia.`,
      timestamp: Date.now()
    });

    await DB.updateGameState(currentRoom.code, 'secretHitler', newState);
    isSubmitting = false;
  }

  // B. Investigate Loyalty: Periksa kartu keanggotaan partai
  async function investigatePlayer(targetId) {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    const state = getGameState(currentRoom);

    if (state.phase !== 'executive_action' || state.activeExecutivePower !== 'investigate_loyalty') return;
    if (state.presidentCandidateId !== currentPlayer.id) return;

    const target = state.players[targetId];
    if (!target || !target.isAlive || target.isInvestigated || targetId === currentPlayer.id) {
      UI.Toast('Target tidak valid atau sudah pernah diselidiki!', 'warning');
      return;
    }

    isSubmitting = true;
    UI.Sound.click();

    const newState = JSON.parse(JSON.stringify(state));
    newState.players[targetId].isInvestigated = true;
    newState.executiveDetails = {
      targetId: targetId,
      targetName: target.name,
      party: target.party // 'liberal' atau 'fascist'
    };

    newState.actionLogs.push({
      text: `🔍 Presiden telah memeriksa Kartu Keanggotaan Partai milik [${target.name}].`,
      timestamp: Date.now()
    });

    await DB.updateGameState(currentRoom.code, 'secretHitler', newState);
    isSubmitting = false;
  }

  // Selesai melihat hasil investigasi
  async function dismissInvestigation() {
    if (!currentRoom || isSubmitting) return;
    const state = getGameState(currentRoom);
    if (!state.executiveDetails) return;

    isSubmitting = true;
    UI.Sound.click();

    const newState = JSON.parse(JSON.stringify(state));
    newState.executiveDetails = null;
    newState.activeExecutivePower = null;
    advancePresidentTurn(newState);
    newState.phase = 'nomination';
    newState.chancellorCandidateId = null;

    await DB.updateGameState(currentRoom.code, 'secretHitler', newState);
    isSubmitting = false;
  }

  // C. Special Election: Presiden menunjuk calon Presiden berikutnya
  async function callSpecialElection(targetId) {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    const state = getGameState(currentRoom);

    if (state.phase !== 'executive_action' || state.activeExecutivePower !== 'special_election') return;
    if (state.presidentCandidateId !== currentPlayer.id) return;

    const target = state.players[targetId];
    if (!target || !target.isAlive || targetId === currentPlayer.id) {
      UI.Toast('Pilih pemain hidup selain dirimu sendiri!', 'warning');
      return;
    }

    isSubmitting = true;
    UI.Sound.fanfare();

    const newState = JSON.parse(JSON.stringify(state));
    const nextNormalIndex = (newState.presidentIndex + 1) % newState.turnOrder.length;
    newState.specialElectionReturnIndex = nextNormalIndex;

    newState.presidentIndex = newState.turnOrder.indexOf(targetId);
    newState.presidentCandidateId = targetId;
    newState.chancellorCandidateId = null;
    newState.phase = 'nomination';
    newState.activeExecutivePower = null;

    newState.actionLogs.push({
      text: `💼 PEMILU KHUSUS: Presiden menunjuk [${target.name}] menjadi Kandidat Presiden berikutnya!`,
      timestamp: Date.now()
    });

    await DB.updateGameState(currentRoom.code, 'secretHitler', newState);
    isSubmitting = false;
  }

  // D. Execution: Presiden mengeksekusi mati 1 pemain
  async function executePlayer(targetId) {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    const state = getGameState(currentRoom);

    if (state.phase !== 'executive_action') return;
    if (state.activeExecutivePower !== 'execution' && state.activeExecutivePower !== 'execution_and_veto') return;
    if (state.presidentCandidateId !== currentPlayer.id) return;

    const target = state.players[targetId];
    if (!target || !target.isAlive || targetId === currentPlayer.id) {
      UI.Toast('Target eksekusi tidak sah!', 'warning');
      return;
    }

    isSubmitting = true;
    UI.Sound.fanfare();

    const newState = JSON.parse(JSON.stringify(state));
    newState.players[targetId].isAlive = false;

    newState.actionLogs.push({
      text: `💀 EKSEKUSI MATI! Presiden telah mengeksekusi mati [${target.name}]!`,
      timestamp: Date.now()
    });

    // CEK KEMENANGAN LIBERAL:
    // Jika pemain yang dieksekusi adalah Secret Hitler -> Liberal Menang Seketika!
    if (target.role === 'hitler') {
      newState.phase = 'game_over';
      newState.status = 'game_over';
      newState.winnerTeam = 'liberal';
      newState.winReason = `Secret Hitler ([${target.name}]) berhasil dieksekusi mati oleh Presiden! Kemenangan Kaum Liberal!`;
      newState.actionLogs.push({
        text: `🕊️ KEMENANGAN LIBERAL: ${newState.winReason}`,
        timestamp: Date.now()
      });
      await DB.updateGameState(currentRoom.code, 'secretHitler', newState);
      isSubmitting = false;
      return;
    }

    newState.actionLogs.push({
      text: `🕊️ [${target.name}] BUKAN Secret Hitler! Permainan tetap berlanjut.`,
      timestamp: Date.now()
    });

    newState.activeExecutivePower = null;
    advancePresidentTurn(newState);
    newState.phase = 'nomination';
    newState.chancellorCandidateId = null;

    await DB.updateGameState(currentRoom.code, 'secretHitler', newState);
    isSubmitting = false;
  }

  /**
   * Helper: Pindahkan Giliran Presiden ke Pemain Hidup Berikutnya
   */
  function advancePresidentTurn(state) {
    if (state.specialElectionReturnIndex !== null && state.specialElectionReturnIndex !== undefined) {
      state.presidentIndex = state.specialElectionReturnIndex;
      state.specialElectionReturnIndex = null;
    } else {
      state.presidentIndex = (state.presidentIndex + 1) % state.turnOrder.length;
    }

    // Lewati pemain yang sudah mati
    let loopCount = 0;
    while (!state.players[state.turnOrder[state.presidentIndex]].isAlive && loopCount < state.turnOrder.length) {
      state.presidentIndex = (state.presidentIndex + 1) % state.turnOrder.length;
      loopCount++;
    }

    state.presidentCandidateId = state.turnOrder[state.presidentIndex];
  }

  function getPowerName(power) {
    switch (power) {
      case 'policy_peek': return 'Intip 3 Kebijakan (Policy Peek)';
      case 'investigate_loyalty': return 'Penyelidikan Loyalti Partai';
      case 'special_election': return 'Tunjuk Pemilu Khusus (Special Election)';
      case 'execution': return 'Peluru Eksekusi Mati';
      case 'execution_and_veto': return 'Peluru Eksekusi Mati + Buka Hak Veto';
      default: return '';
    }
  }

  /**
   * ==========================================================================
   * RENDER VIEW: PAPAN PERMAINAN SECRET HITLER
   * ==========================================================================
   */
  function render(container, roomData, player) {
    if (!container || !roomData) return;
    currentRoom = roomData;
    currentPlayer = player;

    UI.setTheme('secret-hitler');

    const state = getGameState(roomData);

    if (!state.status) {
      renderPreGameView(container, roomData, player);
      return;
    }

    if (state.status === 'game_over') {
      renderGameOverView(container, roomData, player, state);
      return;
    }

    renderActiveGameView(container, roomData, player, state);
  }

  /**
   * View Pre-Game (Lobby Sebelum Host Memulai Secret Hitler)
   */
  function renderPreGameView(container, roomData, player) {
    const isHost = player && player.isHost;
    const playersList = Object.values(roomData.players || {});
    const count = playersList.length;
    const dist = getRoleDistribution(count);

    const contentHTML = `
      <div class="max-w-2xl mx-auto py-8 text-center space-y-6">
        <div class="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-red-600 via-rose-700 to-stone-900 text-white flex items-center justify-center shadow-xl shadow-red-600/25 animate-bounce">
          <span class="text-5xl">💼</span>
        </div>

        <div>
          <span class="px-3.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-300 font-display font-bold text-xs uppercase tracking-wider">
            Deduksi Sosial & Intrik Parlemen 1930-an
          </span>
          <h2 class="font-display font-black text-3xl sm:text-4xl text-stone-900 mt-2">Secret Hitler</h2>
          <p class="font-body text-stone-600 text-sm max-w-lg mx-auto mt-2 leading-relaxed">
            Kaum Liberal berusaha mengesahkan 5 undang-undang atau menemukan Hitler. Kaum Fasis berusaha merebut kekuasaan lewat 6 undang-undang atau meloloskan Hitler sebagai Kanselir.
          </p>
        </div>

        <!-- Rincian Distribusi Peran -->
        <div class="p-5 rounded-3xl bg-white border-2 border-stone-900/10 shadow-sm text-left space-y-3">
          <div class="flex items-center justify-between border-b border-stone-100 pb-2">
            <span class="font-display font-bold text-xs text-stone-700 uppercase tracking-wider">
              Komposisi Peran untuk ${count} Pemain:
            </span>
            <span class="text-xs text-stone-500 font-body">${count < 5 ? '⚠️ Minimal 5 Pemain' : '✓ Siap Dimainkan'}</span>
          </div>

          <div class="grid grid-cols-3 gap-3 text-center">
            <div class="p-3 rounded-2xl bg-blue-50 border border-blue-200">
              <span class="text-2xl">🕊️</span>
              <div class="font-display font-black text-lg text-blue-700">${dist.liberals}</div>
              <div class="text-[11px] font-display font-bold text-blue-900">Liberal</div>
            </div>

            <div class="p-3 rounded-2xl bg-red-50 border border-red-200">
              <span class="text-2xl">💀</span>
              <div class="font-display font-black text-lg text-red-700">${dist.fascists}</div>
              <div class="text-[11px] font-display font-bold text-red-900">Fascist</div>
            </div>

            <div class="p-3 rounded-2xl bg-amber-50 border border-amber-300">
              <span class="text-2xl">👑</span>
              <div class="font-display font-black text-lg text-amber-800">1</div>
              <div class="text-[11px] font-display font-bold text-amber-950">Secret Hitler</div>
            </div>
          </div>
        </div>

        <!-- Daftar Pemain di Meja -->
        <div class="p-4 rounded-3xl bg-white border-2 border-stone-900/5 shadow-sm text-left">
          <div class="flex items-center justify-between mb-3 border-b border-stone-100 pb-2">
            <span class="font-display font-bold text-xs text-stone-700">Pemain di Parlemen (${count}/10)</span>
            <span class="text-xs text-red-600 font-body font-semibold">5 - 10 Pemain</span>
          </div>
          <div class="flex flex-wrap gap-2">
            ${playersList.map(p => `
              <div class="px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-stone-800 text-xs font-display font-bold flex items-center gap-1.5">
                <span>${p.isHost ? '👑' : '🏛️'}</span>
                <span>${p.name}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Tombol Mulai -->
        <div class="pt-2">
          ${isHost ? `
            <button 
              onclick="SecretHitlerGame.startGame()"
              ${count < 5 ? 'disabled' : ''}
              class="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-stone-900 hover:from-red-700 hover:to-stone-950 text-white font-display font-black text-base shadow-xl shadow-red-600/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 mx-auto ${
                count < 5 ? 'opacity-50 cursor-not-allowed' : ''
              }"
            >
              <i data-lucide="play" class="w-5 h-5"></i>
              <span>Bagikan Peran & Mulai Sidang Parlemen 🏛️</span>
            </button>
          ` : `
            <div class="p-3.5 rounded-2xl bg-stone-100 border border-stone-200 text-stone-700 font-display font-semibold text-xs flex items-center justify-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
              <span>Menunggu Host memulai pemilihan...</span>
            </div>
          `}
        </div>

      </div>
    `;

    container.innerHTML = contentHTML;
    UI.refreshIcons();
  }

  /**
   * View Aktif Game Secret Hitler (Papan Liberal, Papan Fascist, Kursi Parlemen, Sesi Voting/Legislatif)
   */
  function renderActiveGameView(container, roomData, player, state) {
    const myData = state.players[player.id];
    const isPresident = (state.presidentCandidateId === player.id);
    const isChancellor = (state.chancellorCandidateId === player.id);
    const isAlive = myData?.isAlive;

    const presidentObj = state.players[state.presidentCandidateId];
    const chancellorObj = state.chancellorCandidateId ? state.players[state.chancellorCandidateId] : null;

    // Render Papan Liberal (5 Slot)
    const liberalSlotsHTML = Array.from({ length: 5 }).map((_, idx) => {
      const isEnacted = idx < state.liberalPolicies;
      return `
        <div class="flex-1 min-w-[55px] h-24 sm:h-28 rounded-2xl border-2 flex flex-col items-center justify-between p-2 select-none transition-all ${
          isEnacted 
            ? 'bg-blue-600 border-blue-400 text-white shadow-md animate-scale-up' 
            : 'bg-blue-900/40 border-blue-700/60 text-blue-300/60'
        }">
          <span class="text-[10px] font-display font-bold self-start">#${idx + 1}</span>
          <div class="text-2xl">${isEnacted ? '🕊️' : '⚖️'}</div>
          <span class="text-[9px] font-display font-bold tracking-wider uppercase">${isEnacted ? 'LIBERAL' : 'KOSONG'}</span>
        </div>
      `;
    }).join('');

    // Render Election Tracker (0 sampai 3)
    const electionTrackerHTML = Array.from({ length: 4 }).map((_, idx) => {
      const isActive = idx === state.electionTracker;
      return `
        <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-display font-black text-xs transition-all ${
          isActive 
            ? 'bg-amber-400 border-yellow-300 text-amber-950 scale-110 shadow-md animate-pulse' 
            : 'bg-stone-800 border-stone-700 text-stone-500'
        }" title="${idx === 3 ? 'CHAOS: Langsung sahkan kebijakan darurat teratas!' : `Pemilu gagal ke-${idx}`}">
          ${idx === 3 ? '⚡' : idx}
        </div>
      `;
    }).join('');

    // Render Papan Fascist (6 Slot)
    const fascistSlotsHTML = Array.from({ length: 6 }).map((_, idx) => {
      const slotNum = idx + 1;
      const isEnacted = slotNum <= state.fascistPolicies;
      const power = state.powersConfig[slotNum];
      const isHitlerDanger = slotNum >= 3; // Zona Bahaya Hitler Territory

      let powerIcon = '';
      let powerLabel = '';
      if (power === 'policy_peek') {
        powerIcon = '👁️';
        powerLabel = 'Peek';
      } else if (power === 'investigate_loyalty') {
        powerIcon = '🔍';
        powerLabel = 'Loyalty';
      } else if (power === 'special_election') {
        powerIcon = '💼';
        powerLabel = 'Election';
      } else if (power === 'execution') {
        powerIcon = '💀';
        powerLabel = 'Kill';
      } else if (power === 'execution_and_veto') {
        powerIcon = '💀🛑';
        powerLabel = 'Kill+Veto';
      } else if (slotNum === 6) {
        powerIcon = '👑';
        powerLabel = 'Fascist Win';
      }

      return `
        <div class="flex-1 min-w-[55px] h-24 sm:h-28 rounded-2xl border-2 flex flex-col items-center justify-between p-2 select-none relative transition-all ${
          isEnacted 
            ? 'bg-red-600 border-red-400 text-white shadow-md animate-scale-up' 
            : isHitlerDanger
              ? 'bg-red-950/60 border-red-800/80 text-red-300/70'
              : 'bg-stone-900/50 border-stone-700/60 text-stone-400/60'
        }">
          <div class="w-full flex items-center justify-between text-[10px] font-display font-bold">
            <span>#${slotNum}</span>
            <span>${powerIcon}</span>
          </div>
          <div class="text-xl sm:text-2xl">${isEnacted ? '💀' : powerIcon || '—'}</div>
          <span class="text-[8px] font-display font-bold tracking-tight uppercase text-center truncate w-full">
            ${isEnacted ? 'FASCIST' : powerLabel || 'KOSONG'}
          </span>
        </div>
      `;
    }).join('');

    // Daftar Pemain / Parlemen
    const playersTableHTML = state.turnOrder.map(pid => {
      const p = state.players[pid];
      if (!p) return '';
      const isMe = (pid === player.id);
      const isPres = (pid === state.presidentCandidateId);
      const isChanc = (pid === state.chancellorCandidateId);
      const isDead = !p.isAlive;
      const isLastPres = (pid === state.lastElectedPresidentId);
      const isLastChanc = (pid === state.lastElectedChancellorId);

      // Status voting
      let voteBadge = '';
      if (state.phase === 'voting') {
        const hasVoted = state.votes && state.votes[pid];
        voteBadge = hasVoted 
          ? '<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-display font-bold">Sudah Voting ✓</span>'
          : '<span class="px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 text-[10px] font-display font-bold">Memilih...</span>';
      } else if (state.phase === 'vote_reveal' && state.lastVoteResult) {
        const v = state.lastVoteResult.voteDetails[pid]?.vote;
        voteBadge = v === 'ja'
          ? '<span class="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-display font-black shadow-xs">JA!</span>'
          : '<span class="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-display font-black shadow-xs">NEIN!</span>';
      }

      return `
        <div class="p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-2 ${
          isDead 
            ? 'bg-stone-100 border-stone-200 opacity-50' 
            : isPres 
              ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-400/20 shadow-xs'
              : isChanc
                ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                : 'bg-white border-stone-900/5'
        }">
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-xl font-display font-black text-xs flex items-center justify-center shrink-0 ${
              isDead ? 'bg-stone-300 text-stone-600' : 'bg-stone-900 text-white'
            }">
              ${isDead ? '💀' : p.name.charAt(0).toUpperCase()}
            </div>
            <div class="truncate">
              <div class="font-display font-bold text-xs text-stone-800 flex items-center gap-1">
                <span class="truncate">${p.name}</span>
                ${isMe ? '<span class="text-[10px] text-blue-600 font-bold">(Kamu)</span>' : ''}
              </div>
              <div class="flex items-center gap-1 mt-0.5">
                ${isPres ? '<span class="px-1.5 py-0.2 rounded bg-blue-600 text-white text-[9px] font-display font-bold">Presiden</span>' : ''}
                ${isChanc ? '<span class="px-1.5 py-0.2 rounded bg-amber-600 text-white text-[9px] font-display font-bold">Kanselir</span>' : ''}
                ${isLastChanc ? '<span class="px-1.5 py-0.2 rounded bg-stone-200 text-stone-700 text-[9px] font-display font-semibold" title="Term Limit Kanselir">Term Limit</span>' : ''}
                ${isDead ? '<span class="text-[10px] text-rose-600 font-bold">GUGUR</span>' : ''}
              </div>
            </div>
          </div>

          <div class="shrink-0 flex items-center gap-2">
            ${voteBadge}
            ${(state.phase === 'nomination' && isPresident && !isChanc && !isPres && isAlive && canBeNominatedChancellor(pid, state)) ? `
              <button
                onclick="SecretHitlerGame.nominateChancellor('${pid}')"
                class="px-2.5 py-1 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-display font-bold text-[10px] active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                Pilih Kanselir ⚖️
              </button>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    // Panel Identitas Rahasia Pribadi
    const secretCardHTML = renderSecretIdentityDossier(myData, state);

    // Dialog / Kontrol Interaktif Sesuai Fase Aktif
    const phaseActionBoxHTML = renderPhaseActionControls(state, player);

    const contentHTML = `
      <div class="w-full max-w-5xl mx-auto space-y-5 pb-8">
        
        <!-- Top App Bar -->
        <div class="bg-white rounded-3xl border-2 border-stone-900/10 p-4 sm:p-5 shadow-joyful flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 via-rose-700 to-stone-900 text-white flex items-center justify-center shadow-md text-2xl">
              💼
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-display font-black text-lg text-stone-900">Parlemen Secret Hitler</h3>
                <span class="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 text-[10px] font-display font-bold border border-stone-200">
                  ${state.initialPlayerCount} Pemain
                </span>
              </div>
              <p class="font-body text-xs text-stone-500">
                Presiden: <b class="text-blue-600 font-display">${presidentObj?.name || '—'}</b> | 
                Kanselir: <b class="text-amber-600 font-display">${chancellorObj?.name || 'Belum dipilih'}</b>
              </p>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <button 
              onclick="SecretHitlerGame.toggleRoleReveal()"
              class="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm"
              title="Buka/Tutup Kartu Peran Rahasia"
            >
              <span>${isRoleRevealed ? 'Sembunyikan Peran 🙈' : 'Lihat Peran Rahasiamu 👁️'}</span>
            </button>

            <button 
              onclick="GameRules.open('secret-hitler', 'lobby')" 
              class="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-display font-bold text-xs flex items-center gap-1 cursor-pointer transition-all active:scale-95"
              title="Lihat Aturan Main"
            >
              <i data-lucide="book-open" class="w-4 h-4 text-red-600"></i>
              <span>Aturan</span>
            </button>
          </div>
        </div>

        <!-- Kartu Identitas Rahasia (Bila Di-Toggle Buka) -->
        ${secretCardHTML}

        <!-- Papan Kebijakan: Liberal & Fascist -->
        <div class="grid grid-cols-1 gap-5">
          
          <!-- PAPAN LIBERAL (5 SLOT BIRU) -->
          <div class="bg-gradient-to-r from-blue-900 via-blue-950 to-slate-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border-3 border-blue-800 space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-blue-800/80 pb-3">
              <div class="flex items-center gap-2">
                <span class="text-xl">🕊️</span>
                <h4 class="font-display font-black text-sm uppercase tracking-wider text-blue-300">
                  Papan Kebijakan Liberal (${state.liberalPolicies}/5)
                </h4>
              </div>
              <span class="text-[11px] font-display font-bold text-blue-300 bg-blue-800/60 px-3 py-1 rounded-full border border-blue-700">
                5 Kebijakan = Kemenangan Kaum Liberal
              </span>
            </div>

            <!-- 5 Slot Kebijakan Liberal -->
            <div class="flex gap-2.5 sm:gap-3 justify-between overflow-x-auto py-1">
              ${liberalSlotsHTML}
            </div>

            <!-- Election Tracker -->
            <div class="flex items-center justify-between pt-2 border-t border-blue-800/50 text-xs">
              <span class="font-display font-bold text-blue-200 flex items-center gap-1.5">
                <span>Election Tracker (Gagal Pemilu):</span>
              </span>
              <div class="flex items-center gap-2">
                ${electionTrackerHTML}
              </div>
            </div>
          </div>

          <!-- PAPAN FASCIST (6 SLOT MERAH) -->
          <div class="bg-gradient-to-r from-red-950 via-stone-950 to-neutral-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border-3 border-red-800 space-y-4">
            <div class="flex flex-wrap items-center justify-between gap-2 border-b border-red-800/80 pb-3">
              <div class="flex items-center gap-2">
                <span class="text-xl">💀</span>
                <h4 class="font-display font-black text-sm uppercase tracking-wider text-red-400">
                  Papan Kebijakan Fascist (${state.fascistPolicies}/6)
                </h4>
              </div>
              <div class="flex items-center gap-2">
                ${state.fascistPolicies >= 3 ? `
                  <span class="px-2.5 py-0.5 rounded-full bg-red-600 text-white font-display font-black text-[10px] animate-pulse">
                    ⚠️ HITLER TERRITORY AKTIF
                  </span>
                ` : ''}
                <span class="text-[11px] font-display font-bold text-red-300 bg-red-900/60 px-3 py-1 rounded-full border border-red-800">
                  6 Kebijakan = Kemenangan Kaum Fasis
                </span>
              </div>
            </div>

            <!-- 6 Slot Kebijakan Fascist -->
            <div class="flex gap-2.5 sm:gap-3 justify-between overflow-x-auto py-1">
              ${fascistSlotsHTML}
            </div>

            <!-- Dek Counter -->
            <div class="flex items-center justify-between pt-2 border-t border-red-800/50 text-xs text-stone-400">
              <span>Sisa Dek Kebijakan: <b>${state.deck?.length || 0} Kartu</b> (Discard: ${state.discardPile?.length || 0})</span>
              ${state.vetoUnlocked ? `
                <span class="text-amber-400 font-display font-bold flex items-center gap-1">
                  <span>🛑 Hak Veto Terbuka!</span>
                </span>
              ` : ''}
            </div>
          </div>

        </div>

        <!-- Box Aksi Sesuai Fase Permainan -->
        ${phaseActionBoxHTML}

        <!-- Meja Parlemen & Daftar Pemain -->
        <div class="bg-white rounded-3xl border-2 border-stone-900/10 p-5 shadow-joyful space-y-3">
          <div class="flex items-center justify-between border-b border-stone-100 pb-2">
            <h4 class="font-display font-bold text-xs text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="users" class="w-4 h-4 text-stone-500"></i>
              <span>Anggota Parlemen (${getLivingPlayers(state.players).length} Hidup)</span>
            </h4>
            <span class="text-[11px] text-stone-400 font-body">Term Limits aktif untuk Kanselir/Presiden sebelumnya</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            ${playersTableHTML}
          </div>
        </div>

        <!-- Log Parlemen -->
        <div class="bg-white rounded-3xl border-2 border-stone-900/10 p-5 shadow-joyful">
          <h4 class="font-display font-bold text-xs text-stone-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <i data-lucide="history" class="w-3.5 h-3.5 text-red-600"></i>
            <span>Risalah Sidang Parlemen</span>
          </h4>
          <div class="space-y-1.5 overflow-y-auto max-h-36 pr-1 font-body text-xs text-stone-600">
            ${(state.actionLogs || []).slice(-8).reverse().map(log => `
              <div class="p-2 rounded-xl bg-stone-50 border border-stone-200/60 leading-relaxed">
                ${log.text}
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;

    container.innerHTML = contentHTML;
    UI.refreshIcons();
  }

  /**
   * Render Dossier / Kartu Identitas Rahasia Pribadi Pemain
   */
  function renderSecretIdentityDossier(myData, state) {
    if (!myData || !isRoleRevealed) return '';

    const isHitler = (myData.role === 'hitler');
    const isFascist = (myData.role === 'fascist');
    const isLiberal = (myData.role === 'liberal');

    // Pengetahuan Rekan
    let teammateInfoHTML = '';
    const allPlayers = Object.values(state.players || {});

    if (isFascist) {
      const otherFascists = allPlayers.filter(p => p.role === 'fascist' && p.id !== myData.id);
      const hitlerPlayer = allPlayers.find(p => p.role === 'hitler');
      teammateInfoHTML = `
        <div class="p-3 rounded-2xl bg-red-950/40 border border-red-800 text-xs text-red-200 space-y-1 text-left mt-2">
          <div class="font-bold">Informasi Intelijen Kaum Fasis:</div>
          <div>• Secret Hitler: <b class="text-amber-400">${hitlerPlayer?.name || 'Tidak diketahui'}</b></div>
          ${otherFascists.length > 0 ? `
            <div>• Rekan Fasis: <b>${otherFascists.map(f => f.name).join(', ')}</b></div>
          ` : ''}
        </div>
      `;
    } else if (isHitler) {
      if (state.initialPlayerCount <= 6) {
        const fascistPlayer = allPlayers.find(p => p.role === 'fascist');
        teammateInfoHTML = `
          <div class="p-3 rounded-2xl bg-amber-950/40 border border-amber-800 text-xs text-amber-200 space-y-1 text-left mt-2">
            <div class="font-bold">Info Game 5-6 Pemain (Hitler Mengetahui Rekan):</div>
            <div>• Rekan Fasismu: <b class="text-red-400">${fascistPlayer?.name || 'Tidak diketahui'}</b></div>
          </div>
        `;
      } else {
        teammateInfoHTML = `
          <div class="p-3 rounded-2xl bg-amber-950/40 border border-amber-800 text-xs text-amber-200 space-y-1 text-left mt-2">
            <div class="font-bold">Info Game 7-10 Pemain:</div>
            <div>Kamu TIDAK TAHU siapa para pengikut Fasismu! Mereka mengenalmu, tapi kamu harus menebak siapa yang melindungimu di parlemen.</div>
          </div>
        `;
      }
    } else {
      teammateInfoHTML = `
        <div class="p-3 rounded-2xl bg-blue-950/40 border border-blue-800 text-xs text-blue-200 space-y-1 text-left mt-2">
          <div class="font-bold">Prinsip Warga Liberal:</div>
          <div>Kamu tidak mengetahui identitas siapa pun! Gunakan deduksi voting dan undang-undang untuk mencari teman sejatimu.</div>
        </div>
      `;
    }

    return `
      <div class="p-5 rounded-3xl bg-stone-900 border-2 border-stone-800 text-white shadow-2xl animate-scale-up space-y-3">
        <div class="flex items-center justify-between border-b border-stone-800 pb-2">
          <span class="font-display font-bold text-xs text-stone-400 uppercase tracking-wider">
            BERKAS RAHASIA IDENTITAS DIRI
          </span>
          <button 
            onclick="SecretHitlerGame.toggleRoleReveal()"
            class="text-xs text-stone-400 hover:text-white"
          >
            ✕ Tutup
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-center">
          <!-- Kartu Peran -->
          <div class="p-4 rounded-2xl border-2 ${
            isLiberal 
              ? 'bg-blue-600/30 border-blue-500 text-blue-200' 
              : isHitler 
                ? 'bg-amber-600/30 border-amber-500 text-amber-200' 
                : 'bg-red-600/30 border-red-500 text-red-200'
          }">
            <span class="text-3xl">${isLiberal ? '🕊️' : isHitler ? '👑' : '💀'}</span>
            <div class="font-display font-black text-xl text-white mt-1">
              ${isLiberal ? 'LIBERAL' : isHitler ? 'SECRET HITLER' : 'FASCIST'}
            </div>
            <div class="text-[11px] font-body opacity-80 mt-1">
              ${isLiberal ? 'Bebaskan Jerman & Sahkan 5 Kebijakan Liberal' : isHitler ? 'Tetap bersih agar terpilih sebagai Kanselir di zona bahaya!' : 'Bantu Hitler meraih kursi Kanselir atau sahkan 6 Kebijakan Fasis!'}
            </div>
          </div>

          <!-- Kartu Keanggotaan Partai (Party Membership) -->
          <div class="p-4 rounded-2xl border-2 ${
            myData.party === 'liberal' 
              ? 'bg-blue-900/30 border-blue-600 text-blue-300' 
              : 'bg-red-900/30 border-red-600 text-red-300'
          }">
            <div class="text-xs font-display font-bold text-stone-400">Kartu Keanggotaan Partai:</div>
            <div class="font-display font-black text-lg text-white mt-2">
              ${myData.party === 'liberal' ? 'LIBERAL PARTY' : 'FASCIST PARTY'}
            </div>
            <div class="text-[10px] opacity-75 mt-1">
              (Hanya kartu ini yang terlihat jika kamu diinvestigasi oleh Presiden)
            </div>
          </div>
        </div>

        ${teammateInfoHTML}
      </div>
    `;
  }

  /**
   * Render Box Interaktif Berdasarkan Fase Permainan Saat Ini
   */
  function renderPhaseActionControls(state, player) {
    const isPres = (state.presidentCandidateId === player.id);
    const isChanc = (state.chancellorCandidateId === player.id);
    const isAlive = state.players[player.id]?.isAlive;

    // 1. FASE NOMINASI KANSELIR
    if (state.phase === 'nomination') {
      const presObj = state.players[state.presidentCandidateId];
      return `
        <div class="p-5 rounded-3xl bg-amber-50 border-2 border-amber-300 text-stone-900 shadow-sm space-y-2">
          <div class="flex items-center gap-2">
            <span class="text-xl">🏛️</span>
            <h4 class="font-display font-black text-sm">Fase Nominasi Kanselir</h4>
          </div>
          <p class="font-body text-xs text-stone-600 leading-relaxed">
            ${isPres 
              ? '<b>Kamu adalah Presiden!</b> Pilih salah satu anggota parlemen yang sah pada daftar di bawah untuk dicalonkan menjadi Kanselir.' 
              : `Menunggu Presiden <b>${presObj?.name}</b> menominasikan seorang Kandidat Kanselir...`
            }
          </p>
        </div>
      `;
    }

    // 2. FASE PEMUNGUTAN SUARA (VOTING JA! / NEIN!)
    if (state.phase === 'voting') {
      const presObj = state.players[state.presidentCandidateId];
      const chancObj = state.players[state.chancellorCandidateId];
      const hasVoted = state.votes && state.votes[player.id];

      return `
        <div class="p-5 rounded-3xl bg-white border-2 border-stone-900/10 shadow-joyful text-center space-y-4">
          <div>
            <span class="px-3 py-1 rounded-full bg-stone-100 text-stone-800 font-display font-bold text-xs uppercase tracking-wider">
              PEMUNGUTAN SUARA PARLEMEN
            </span>
            <h4 class="font-display font-black text-xl text-stone-900 mt-1">
              Apakah Anda menyetujui Pemerintahan [${presObj?.name}] & [${chancObj?.name}]?
            </h4>
            <p class="font-body text-xs text-stone-500 mt-1">
              Pilihanmu bersifat rahasia sampai seluruh pemain yang hidup selesai memberikan suara.
            </p>
          </div>

          ${isAlive ? `
            ${hasVoted ? `
              <div class="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 font-display font-bold text-sm">
                ✓ Kamu telah memilih <b>${hasVoted.toUpperCase()}!</b> Menunggu anggota parlemen lainnya...
              </div>
            ` : `
              <div class="flex items-center justify-center gap-4 max-w-sm mx-auto">
                <button
                  onclick="SecretHitlerGame.castVote('ja')"
                  class="flex-1 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-base shadow-lg shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>JA! (Setuju)</span>
                </button>

                <button
                  onclick="SecretHitlerGame.castVote('nein')"
                  class="flex-1 py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-display font-black text-base shadow-lg shadow-rose-600/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>NEIN! (Tolak)</span>
                </button>
              </div>
            `}
          ` : `
            <div class="text-xs text-stone-400 italic font-body">
              Kamu telah gugur dan tidak memiliki hak suara.
            </div>
          `}
        </div>
      `;
    }

    // 3. FASE VOTE REVEAL (HASIL SUARA BERSAMA)
    if (state.phase === 'vote_reveal') {
      const res = state.lastVoteResult;
      return `
        <div class="p-5 rounded-3xl bg-white border-2 border-stone-900/10 shadow-joyful text-center space-y-4 animate-scale-up">
          <div>
            <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${res?.isPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'} font-display font-bold text-xs uppercase tracking-wider mb-1">
              ${res?.isPassed ? '✓ PEMILIHAN DISETUJUI' : '✕ PEMILIHAN DITOLAK'}
            </div>
            <h4 class="font-display font-black text-2xl text-stone-900">
              Hasil Voting: ${res?.jaCount} JA vs ${res?.neinCount} NEIN
            </h4>
            <p class="font-body text-xs text-stone-500 mt-1">
              ${res?.isPassed 
                ? 'Pemerintahan resmi terbentuk dan melangkah ke Sesi Legislatif.' 
                : 'Pemerintahan gagal terbentuk! Election tracker bertambah +1.'
              }
            </p>
          </div>

          <button
            onclick="SecretHitlerGame.proceedAfterVoteReveal()"
            class="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-display font-bold text-sm shadow-md active:scale-95 transition-all cursor-pointer"
          >
            Lanjutkan Sidang Parlemen →
          </button>
        </div>
      `;
    }

    // 4. SESI LEGISLATIF: PRESIDEN (3 KARTU)
    if (state.phase === 'legislative_president') {
      const cards = state.legislativeCards || [];
      return `
        <div class="p-5 rounded-3xl bg-white border-2 border-stone-900/10 shadow-joyful text-center space-y-4">
          <div>
            <span class="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-display font-bold text-xs uppercase tracking-wider">
              SESI LEGISLATIF PRESIDEN
            </span>
            <h4 class="font-display font-black text-xl text-stone-900 mt-1">
              ${isPres ? 'Pilih 1 Kebijakan untuk DIBUANG secara Rahasia' : `Presiden [${state.players[state.presidentCandidateId]?.name}] sedang meninjau 3 kartu kebijakan...`}
            </h4>
            <p class="font-body text-xs text-stone-500 mt-1">
              2 kartu yang tersisa akan diteruskan ke Kanselir tanpa diketahui oleh anggota parlemen lainnya.
            </p>
          </div>

          ${isPres ? `
            <div class="flex flex-wrap items-center justify-center gap-3 py-2">
              ${cards.map((c, idx) => `
                <div class="w-28 h-40 rounded-2xl border-2 flex flex-col justify-between p-3 shadow-md transition-all select-none ${
                  c.type === 'liberal' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-red-600 border-red-400 text-white'
                }">
                  <span class="text-xs font-display font-bold uppercase">${c.type}</span>
                  <div class="text-3xl my-auto">${c.type === 'liberal' ? '🕊️' : '💀'}</div>
                  <button
                    onclick="SecretHitlerGame.presidentDiscardPolicy(${idx})"
                    class="py-1.5 px-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-display font-bold text-[10px] active:scale-95 transition-all cursor-pointer shadow-xs"
                  >
                    Buang Ini 🗑️
                  </button>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="py-4 text-xs text-stone-400 italic font-body">
              🔒 Tiga kartu kebijakan sedang berada di tangan Presiden secara rahasia.
            </div>
          `}
        </div>
      `;
    }

    // 5. SESI LEGISLATIF: KANSELIR (2 KARTU)
    if (state.phase === 'legislative_chancellor') {
      const cards = state.legislativeCards || [];
      return `
        <div class="p-5 rounded-3xl bg-white border-2 border-stone-900/10 shadow-joyful text-center space-y-4">
          <div>
            <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-display font-bold text-xs uppercase tracking-wider">
              SESI LEGISLATIF KANSELIR
            </span>
            <h4 class="font-display font-black text-xl text-stone-900 mt-1">
              ${isChanc ? 'Pilih 1 Kebijakan untuk DISAHKAN ke Papan' : `Kanselir [${state.players[state.chancellorCandidateId]?.name}] sedang memilih 1 kebijakan untuk disahkan...`}
            </h4>
            <p class="font-body text-xs text-stone-500 mt-1">
              Kartu yang tidak dipilih akan dibuang secara tertutup ke tumpukan kartu buangan.
            </p>
          </div>

          ${isChanc ? `
            <div class="flex flex-wrap items-center justify-center gap-4 py-2">
              ${cards.map((c, idx) => `
                <div class="w-32 h-44 rounded-2xl border-2 flex flex-col justify-between p-3.5 shadow-lg transition-all select-none ${
                  c.type === 'liberal' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-red-600 border-red-400 text-white'
                }">
                  <span class="text-xs font-display font-bold uppercase">${c.type}</span>
                  <div class="text-4xl my-auto">${c.type === 'liberal' ? '🕊️' : '💀'}</div>
                  <button
                    onclick="SecretHitlerGame.chancellorEnactPolicy(${idx})"
                    class="py-2 px-3 rounded-xl bg-white text-stone-900 hover:bg-stone-100 font-display font-black text-xs active:scale-95 transition-all cursor-pointer shadow-sm"
                  >
                    Sahkan Ini ⚖️
                  </button>
                </div>
              `).join('')}
            </div>

            ${state.vetoUnlocked ? `
              <div class="pt-2">
                <button
                  onclick="SecretHitlerGame.requestVeto()"
                  class="px-5 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-amber-300 font-display font-bold text-xs active:scale-95 transition-all cursor-pointer shadow-md"
                >
                  🛑 Ajukan Hak Veto (Minta Presiden Buang Kedua Kartu)
                </button>
              </div>
            ` : ''}
          ` : `
            <div class="py-4 text-xs text-stone-400 italic font-body">
              🔒 Dua kartu kebijakan sedang berada di tangan Kanselir secara rahasia.
            </div>
          `}
        </div>
      `;
    }

    // 6. FASE VETO PENDING (PRESIDEN MERESPON VETO)
    if (state.phase === 'veto_pending') {
      return `
        <div class="p-5 rounded-3xl bg-amber-50 border-2 border-amber-400 text-stone-900 shadow-joyful text-center space-y-4">
          <div class="text-3xl">🛑</div>
          <div>
            <h4 class="font-display font-black text-xl">Kanselir Mengajukan Hak Veto!</h4>
            <p class="font-body text-xs text-stone-600 mt-1">
              ${isPres 
                ? 'Sebagai Presiden, apakah Anda setuju untuk membuang kedua kartu tanpa mengesahkan kebijakan apapun?' 
                : 'Menunggu persetujuan Presiden atas pengajuan veto Kanselir...'
              }
            </p>
          </div>

          ${isPres ? `
            <div class="flex items-center justify-center gap-3">
              <button
                onclick="SecretHitlerGame.respondVeto(true)"
                class="py-3 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-display font-bold text-sm active:scale-95 transition-all cursor-pointer"
              >
                Setujui Veto (Buang Kedua Kartu)
              </button>

              <button
                onclick="SecretHitlerGame.respondVeto(false)"
                class="py-3 px-6 rounded-2xl bg-stone-800 hover:bg-stone-900 text-white font-display font-bold text-sm active:scale-95 transition-all cursor-pointer"
              >
                Tolak Veto (Paksa Sahkan 1 Kartu)
              </button>
            </div>
          ` : ''}
        </div>
      `;
    }

    // 7. FASE KEKUATAN EKSEKUTIF (EXECUTIVE ACTION)
    if (state.phase === 'executive_action') {
      return renderExecutivePowerBox(state, player);
    }

    return '';
  }

  /**
   * Render Box Aksi Kekuatan Eksekutif Presiden
   */
  function renderExecutivePowerBox(state, player) {
    const isPres = (state.presidentCandidateId === player.id);
    const power = state.activeExecutivePower;
    const livingCandidates = getLivingPlayers(state.players).filter(p => p.id !== player.id);

    // A. Policy Peek
    if (power === 'policy_peek') {
      const top3 = state.deck.slice(0, 3);
      return `
        <div class="p-5 rounded-3xl bg-stone-900 text-white border-2 border-stone-800 shadow-joyful text-center space-y-4 animate-scale-up">
          <div>
            <span class="px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-display font-bold text-xs uppercase tracking-wider">
              KEKUATAN EKSEKUTIF: POLICY PEEK 👁️
            </span>
            <h4 class="font-display font-black text-xl mt-1">
              ${isPres ? 'Tiga Kartu Teratas Dek Kebijakan' : 'Presiden sedang mengintip 3 kartu teratas dek kebijakan...'}
            </h4>
          </div>

          ${isPres ? `
            <div class="flex justify-center gap-3 py-2">
              ${top3.map(c => `
                <div class="w-24 h-36 rounded-2xl border-2 flex flex-col justify-between p-3 select-none ${
                  c.type === 'liberal' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-red-600 border-red-400 text-white'
                }">
                  <span class="text-[10px] font-display font-bold uppercase">${c.type}</span>
                  <span class="text-3xl my-auto">${c.type === 'liberal' ? '🕊️' : '💀'}</span>
                </div>
              `).join('')}
            </div>
            <button
              onclick="SecretHitlerGame.completePolicyPeek()"
              class="px-6 py-2.5 rounded-2xl bg-white text-stone-950 font-display font-bold text-xs hover:bg-stone-100 cursor-pointer active:scale-95"
            >
              Selesai Mengintip (Lanjutkan Sidang) →
            </button>
          ` : `
            <div class="text-xs text-stone-400 italic py-3 font-body">
              Presiden melihat urutan 3 kartu secara rahasia.
            </div>
          `}
        </div>
      `;
    }

    // B. Investigate Loyalty
    if (power === 'investigate_loyalty') {
      const details = state.executiveDetails;
      if (details) {
        return `
          <div class="p-5 rounded-3xl bg-stone-900 text-white border-2 border-stone-800 shadow-joyful text-center space-y-4 animate-scale-up">
            <span class="px-3 py-1 rounded-full bg-amber-400 text-amber-950 font-display font-bold text-xs uppercase tracking-wider">
              HASIL PENYELIDIKAN LOYALTI PARTAI 🔍
            </span>
            <h4 class="font-display font-black text-xl">
              Kartu Partai [${details.targetName}]:
            </h4>
            <div class="p-4 rounded-2xl inline-block px-8 ${
              details.party === 'liberal' ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
            } font-display font-black text-2xl shadow-lg">
              ${details.party === 'liberal' ? '🕊️ LIBERAL PARTY' : '💀 FASCIST PARTY'}
            </div>
            <div>
              ${isPres ? `
                <button
                  onclick="SecretHitlerGame.dismissInvestigation()"
                  class="px-6 py-2.5 rounded-2xl bg-white text-stone-950 font-display font-bold text-xs hover:bg-stone-100 cursor-pointer active:scale-95"
                >
                  Selesai Meneliti (Lanjutkan Sidang) →
                </button>
              ` : `
                <p class="text-xs text-stone-400 font-body">Presiden sedang meninjau dokumen partai...</p>
              `}
            </div>
          </div>
        `;
      }

      return `
        <div class="p-5 rounded-3xl bg-white border-2 border-stone-900/10 shadow-joyful text-center space-y-3">
          <span class="px-3 py-1 rounded-full bg-red-100 text-red-800 font-display font-bold text-xs uppercase tracking-wider">
            KEKUATAN EKSEKUTIF: PENYELIDIKAN LOYALTI 🔍
          </span>
          <h4 class="font-display font-black text-xl text-stone-900">
            ${isPres ? 'Pilih 1 Anggota Parlemen untuk Diselidiki Kartu Partainya:' : 'Presiden sedang memilih pemain untuk diselidiki...'}
          </h4>

          ${isPres ? `
            <div class="flex flex-wrap justify-center gap-2 pt-1">
              ${livingCandidates.filter(c => !c.isInvestigated).map(c => `
                <button
                  onclick="SecretHitlerGame.investigatePlayer('${c.id}')"
                  class="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-display font-bold text-xs active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  🔍 Selidiki ${c.name}
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }

    // C. Special Election
    if (power === 'special_election') {
      return `
        <div class="p-5 rounded-3xl bg-white border-2 border-stone-900/10 shadow-joyful text-center space-y-3">
          <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-800 font-display font-bold text-xs uppercase tracking-wider">
            KEKUATAN EKSEKUTIF: PEMILU KHUSUS 💼
          </span>
          <h4 class="font-display font-black text-xl text-stone-900">
            ${isPres ? 'Tunjuk Siapa Saja Menjadi Kandidat Presiden Berikutnya:' : 'Presiden sedang menunjuk Kandidat Presiden pemilu khusus...'}
          </h4>

          ${isPres ? `
            <div class="flex flex-wrap justify-center gap-2 pt-1">
              ${livingCandidates.map(c => `
                <button
                  onclick="SecretHitlerGame.callSpecialElection('${c.id}')"
                  class="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-display font-bold text-xs active:scale-95 transition-all cursor-pointer shadow-xs"
                >
                  💼 Tunjuk ${c.name}
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }

    // D. Execution
    if (power === 'execution' || power === 'execution_and_veto') {
      return `
        <div class="p-5 rounded-3xl bg-red-950 text-white border-2 border-red-800 shadow-joyful text-center space-y-3 animate-pulse">
          <span class="px-3 py-1 rounded-full bg-red-600 text-white font-display font-black text-xs uppercase tracking-wider">
            💀 KEKUATAN EKSEKUTIF: PELURU EKSEKUSI MATI
          </span>
          <h4 class="font-display font-black text-xl text-red-200">
            ${isPres ? 'Pilih 1 Pemain untuk Dieksekusi Mati Permanen:' : 'Presiden sedang memutuskan siapa yang akan dieksekusi mati...'}
          </h4>
          <p class="font-body text-xs text-red-300 max-w-md mx-auto">
            Jika yang dieksekusi adalah Secret Hitler, Kaum Liberal langsung MENANG SEKETIKA!
          </p>

          ${isPres ? `
            <div class="flex flex-wrap justify-center gap-2 pt-2">
              ${livingCandidates.map(c => `
                <button
                  onclick="if(confirm('Yakin ingin mengeksekusi mati [${c.name}]?')) SecretHitlerGame.executePlayer('${c.id}')"
                  class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-display font-black text-xs active:scale-95 transition-all cursor-pointer shadow-md"
                >
                  🔫 Tembak ${c.name}
                </button>
              `).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }

    return '';
  }

  /**
   * ==========================================================================
   * RENDER VIEW: GAME OVER & PENGUMUMAN PEMENANG SECRET HITLER
   * ==========================================================================
   */
  function renderGameOverView(container, roomData, player, state) {
    const isHost = player && player.isHost;
    const isLiberalWin = (state.winnerTeam === 'liberal');

    // Tampilkan peran seluruh pemain secara terbuka di akhir game
    const allPlayersList = Object.values(state.players || {});
    const playersRevealHTML = allPlayersList.map(p => {
      const isHitler = (p.role === 'hitler');
      const isFascist = (p.role === 'fascist');
      return `
        <div class="p-3 rounded-2xl border flex items-center justify-between ${
          isHitler 
            ? 'bg-amber-50 border-amber-300 text-amber-950' 
            : isFascist 
              ? 'bg-red-50 border-red-300 text-red-950' 
              : 'bg-blue-50 border-blue-300 text-blue-950'
        }">
          <div class="font-display font-bold text-xs flex items-center gap-1.5">
            <span>${isHitler ? '👑' : isFascist ? '💀' : '🕊️'}</span>
            <span>${p.name}</span>
          </div>
          <span class="px-2 py-0.5 rounded-lg text-[10px] font-display font-black uppercase ${
            isHitler 
              ? 'bg-amber-200 text-amber-900' 
              : isFascist 
                ? 'bg-red-200 text-red-900' 
                : 'bg-blue-200 text-blue-900'
          }">
            ${isHitler ? 'SECRET HITLER' : isFascist ? 'FASCIST' : 'LIBERAL'}
          </span>
        </div>
      `;
    }).join('');

    const contentHTML = `
      <div class="max-w-2xl mx-auto py-8 space-y-6 text-center">
        
        <div class="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-4xl shadow-2xl animate-bounce ${
          isLiberalWin 
            ? 'bg-blue-600 text-white shadow-blue-600/30' 
            : 'bg-red-600 text-white shadow-red-600/30'
        }">
          ${isLiberalWin ? '🕊️' : '💀'}
        </div>

        <div>
          <span class="px-3.5 py-1 rounded-full text-xs font-display font-black uppercase tracking-wider ${
            isLiberalWin ? 'bg-blue-100 text-blue-800 border border-blue-300' : 'bg-red-100 text-red-800 border border-red-300'
          }">
            ${isLiberalWin ? 'KEMENANGAN KAUM LIBERAL' : 'KEMENANGAN KAUM FASIS'}
          </span>
          <h2 class="font-display font-black text-3xl sm:text-4xl text-stone-900 mt-2">
            ${isLiberalWin ? 'Jerman Tetap Merdeka & Bebas!' : 'Kaum Fasis Menguasai Jerman!'}
          </h2>
          <p class="font-body text-xs sm:text-sm text-stone-600 max-w-md mx-auto mt-2 leading-relaxed">
            ${state.winReason || 'Pertempuran politik di parlemen telah berakhir.'}
          </p>
        </div>

        <!-- Pengungkapan Peran Seluruh Pemain -->
        <div class="bg-white rounded-3xl border-2 border-stone-900/10 p-5 shadow-joyful text-left space-y-3">
          <h4 class="font-display font-bold text-xs text-stone-700 uppercase tracking-wider border-b border-stone-100 pb-2">
            Pengungkapan Seluruh Identitas Rahasia
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${playersRevealHTML}
          </div>
        </div>

        <!-- Tombol Aksi Akhir -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          ${isHost ? `
            <button 
              onclick="SecretHitlerGame.startGame()"
              class="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-display font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
              <span>Sidang Ulang (Acak Peran Baru) 🔄</span>
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

  function toggleRoleReveal() {
    isRoleRevealed = !isRoleRevealed;
    UI.Sound.click();
    if (currentRoom) {
      render(document.getElementById('app'), currentRoom, currentPlayer);
    }
  }

  function cleanup() {
    isSubmitting = false;
    isRoleRevealed = false;
    UI.Logger('SECRET-HITLER', 'Cleaned up SecretHitler game state');
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
    toggleRoleReveal,
    nominateChancellor,
    castVote,
    proceedAfterVoteReveal,
    presidentDiscardPolicy,
    chancellorEnactPolicy,
    requestVeto,
    respondVeto,
    completePolicyPeek,
    investigatePlayer,
    dismissInvestigation,
    callSpecialElection,
    executePlayer,
    cleanup
  };
})();

if (typeof window !== 'undefined') {
  window.SecretHitlerGame = SecretHitlerGame;
}
