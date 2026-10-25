/**
 * ==========================================================================
 * DISCORD PARTY HUB - GAME 5: "COUP (KUDETA DYSTOPIA)"
 * ==========================================================================
 * Permainan gertakan (bluffing), manipulasi pengaruh bangsawan, dan kudeta politik.
 * Terhubung ke Firebase Realtime Database: rooms/{roomCode}/coupGame
 * Tema: Warm Gold Cream (#FFFBEB), Royal Amber (#D97706), Crimson Velvet (#E11D48).
 */

const CoupGame = (function () {
  'use strict';

  // Module Local State
  let currentRoom = null;
  let currentPlayer = null;
  let selectedTargetPlayerId = null;
  let selectedExchangeCardIds = new Set();
  let isSubmitting = false;

  // 5 Coup Character Definitions
  const ROLES_DEF = {
    'duke': {
      id: 'duke',
      name: 'Duke',
      title: 'Bangsawan Pajak',
      badgeClass: 'bg-purple-100 text-purple-900 border-purple-300',
      icon: 'crown',
      iconBg: 'bg-gradient-to-br from-purple-600 to-indigo-800 text-white',
      accentColor: 'text-purple-700',
      actionName: 'Pajak (Tax)',
      actionDesc: 'Ambil +3 Koin dari kas negara.',
      blockDesc: 'Menangkis aksi Bantuan Asing (Foreign Aid) siapapun.'
    },
    'assassin': {
      id: 'assassin',
      name: 'Assassin',
      title: 'Pembunuh Gelap',
      badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
      icon: 'swords',
      iconBg: 'bg-gradient-to-br from-rose-600 to-red-900 text-white',
      accentColor: 'text-rose-700',
      actionName: 'Membunuh (Assassinate)',
      actionDesc: 'Bayar 3 Koin untuk melenyapkan 1 kartu target.',
      blockDesc: 'Dapat ditangkis oleh Contessa.'
    },
    'captain': {
      id: 'captain',
      name: 'Captain',
      title: 'Kapten Bajak',
      badgeClass: 'bg-sky-100 text-sky-900 border-sky-300',
      icon: 'anchor',
      iconBg: 'bg-gradient-to-br from-sky-600 to-blue-900 text-white',
      accentColor: 'text-sky-700',
      actionName: 'Mencuri (Steal)',
      actionDesc: 'Curi 2 Koin emas dari pemain target.',
      blockDesc: 'Menangkis aksi pencurian Captain lawan.'
    },
    'ambassador': {
      id: 'ambassador',
      name: 'Ambassador',
      title: 'Duta Besar',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      icon: 'scroll',
      iconBg: 'bg-gradient-to-br from-emerald-600 to-teal-900 text-white',
      accentColor: 'text-emerald-700',
      actionName: 'Tukar Kartu (Exchange)',
      actionDesc: 'Ambil 2 kartu dari dek dan pilih kartu terbaikmu.',
      blockDesc: 'Menangkis aksi pencurian Captain.'
    },
    'contessa': {
      id: 'contessa',
      name: 'Contessa',
      title: 'Wanita Bangsawan',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: 'shield',
      iconBg: 'bg-gradient-to-br from-amber-500 to-yellow-800 text-white',
      accentColor: 'text-amber-700',
      actionName: 'Pertahanan Mutlak',
      actionDesc: 'Tidak memiliki aksi aktif di gilirannya.',
      blockDesc: 'Menangkis dan menggagalkan percobaan pembunuhan Assassin.'
    }
  };

  /**
   * Helper: Get current Coup Game state from room data
   */
  function getGameState(roomData) {
    if (!roomData) return {};
    return roomData.coupGame || roomData.gameState?.coup || {};
  }

  /**
   * Create & Shuffle 15-Card Coup Deck (3 of each role)
   */
  function createDeck() {
    const deck = [];
    const roles = ['duke', 'assassin', 'captain', 'ambassador', 'contessa'];
    roles.forEach(role => {
      for (let i = 0; i < 3; i++) {
        deck.push({
          id: `card_${role}_${i}_${Math.random().toString(36).substring(2, 6)}`,
          role: role,
          isAlive: true
        });
      }
    });
    return deck.sort(() => 0.5 - Math.random());
  }

  /**
   * Main Render Function
   */
  function render(appEl, roomData, playerData) {
    currentRoom = roomData;
    currentPlayer = playerData;

    if (!appEl || !currentRoom) return;

    // Aktifkan tema coup
    UI.setTheme('coup');

    const state = getGameState(currentRoom);
    const status = state.status || 'config';

    UI.Logger('COUP', `Rendering Coup View [Status: ${status}]`, { turn: state.currentTurnPlayerId });

    if (status === 'config') {
      renderConfigView(appEl, state);
    } else if (status === 'game_over') {
      renderGameOverView(appEl, state);
    } else {
      renderTableArena(appEl, state);
    }

    UI.refreshIcons();
  }

  /**
   * ==========================================================================
   * VIEW 1: CONFIG & LOBBY VIEW
   * ==========================================================================
   */
  function renderConfigView(appEl, state) {
    const isHost = currentPlayer && currentPlayer.isHost;
    const playerList = Object.values(currentRoom.players || {});
    const playerCount = playerList.length;

    const playersGridHTML = playerList.map((p, idx) => `
      <div class="p-3.5 rounded-2xl bg-white border-2 border-slate-900/5 shadow-xs flex items-center gap-3">
        ${UI.Avatar({ name: p.name, size: 'sm', isHost: p.isHost, colorIndex: p.colorIndex || idx })}
        <div class="min-w-0 flex-1">
          <span class="font-display font-bold text-xs text-slate-800 block truncate">${p.name}</span>
          <span class="text-[10px] text-slate-400 font-body">${p.isHost ? 'Pembuat Room' : 'Pemain'}</span>
        </div>
        ${p.id === currentPlayer.id ? '<span class="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">KAMU</span>' : ''}
      </div>
    `).join('');

    const contentHTML = `
      <div class="max-w-3xl mx-auto py-4 space-y-6">
        <!-- Hero Header -->
        <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900 text-white shadow-xl border-2 border-amber-500/20 text-center relative overflow-hidden">
          <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-display font-bold mb-3 backdrop-blur-xs">
            <i data-lucide="crown" class="w-4 h-4"></i>
            <span>Game Bluffing & Kudeta Politik</span>
          </div>
          <h2 class="font-display font-black text-2xl sm:text-4xl tracking-tight text-white">
            Coup: Kudeta Kota Dystopia 👑
          </h2>
          <p class="font-body text-xs sm:text-sm text-amber-100/80 mt-2 max-w-lg mx-auto leading-relaxed">
            Manipulasi kekuasaan bangsawan dan gertak lawanmu di Voice Chat Discord! Kamu bebas mengaku punya kartu apapun asalkan lawan tidak berani menantangmu.
          </p>
        </div>

        <!-- 5 Characters Overview Grid -->
        <div class="p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 class="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
              <i data-lucide="layers" class="w-4 h-4 text-amber-600"></i>
              <span>5 Karakter Bangsawan & Kemampuannya</span>
            </h4>
            <button 
              onclick="GameRules.open('coup', 'lobby')"
              class="text-xs font-display font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
            >
              <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
              <span>Buka Panduan Lengkap</span>
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            ${Object.values(ROLES_DEF).map(r => `
              <div class="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="font-display font-black text-sm text-slate-900 flex items-center gap-1.5">
                    <i data-lucide="${r.icon}" class="w-4 h-4 ${r.accentColor}"></i>
                    <span>${r.name}</span>
                  </span>
                  <span class="text-[10px] font-display font-bold px-2 py-0.5 rounded-full ${r.badgeClass}">
                    ${r.title}
                  </span>
                </div>
                <p class="font-body text-xs text-slate-600 leading-tight"><b>Aksi:</b> ${r.actionDesc}</p>
                <p class="font-body text-xs text-amber-800/90 leading-tight"><b>Tangkis:</b> ${r.blockDesc}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Players List -->
        <div class="p-5 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
              <i data-lucide="users" class="w-4 h-4 text-amber-600"></i>
              <span>Pemain di Ruangan (${playerCount} Orang)</span>
            </h4>
            <span class="text-xs font-display font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
              Ideal 2 - 6 Pemain
            </span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            ${playersGridHTML}
          </div>
        </div>

        <!-- Launch Buttons -->
        <div class="pt-2 flex flex-col sm:flex-row items-center gap-3">
          ${isHost ? `
            <button 
              onclick="CoupGame.startGame()"
              class="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-display font-black text-base shadow-lg shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i data-lucide="play" class="w-5 h-5"></i>
              <span>Mulai Kudeta Kota Dystopia 👑</span>
            </button>
          ` : `
            <div class="w-full p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center">
              <p class="font-display font-bold text-sm text-amber-900 flex items-center justify-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                <span>Menunggu Host memulai permainan Coup...</span>
              </p>
            </div>
          `}
          <button 
            onclick="App.returnToLobby()"
            class="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-bold text-sm active:scale-95 transition-all cursor-pointer"
          >
            Kembali ke Lobby
          </button>
        </div>
      </div>
    `;

    appEl.innerHTML = contentHTML;
  }

  /**
   * ==========================================================================
   * VIEW 2: MAIN COUP ARENA (MEJA PEMAIN & KARTU RAHASIA SAYA)
   * ==========================================================================
   */
  function renderTableArena(appEl, state) {
    const isHost = currentPlayer && currentPlayer.isHost;
    const playersMap = state.players || {};
    const turnOrder = state.turnOrder || [];
    const currentTurnId = state.currentTurnPlayerId;
    const isMyTurn = currentTurnId === currentPlayer.id;
    const myData = playersMap[currentPlayer.id] || { coins: 0, cards: [], isAlive: true };
    const myLivingCards = (myData.cards || []).filter(c => c.isAlive);
    const myCoins = myData.coins || 0;
    const mustCoup = myCoins >= 10;
    const status = state.status;
    const pendingAction = state.currentAction || {};
    const currentBlock = state.currentBlock || {};
    const actionLogs = state.actionLogs || [];

    // 1. MEJA PEMAIN (PLAYER TABLE GRID)
    const playerTableHTML = turnOrder.map(pid => {
      const p = playersMap[pid];
      if (!p) return '';
      const isTurn = pid === currentTurnId;
      const isMe = pid === currentPlayer.id;
      const isTarget = selectedTargetPlayerId === pid;

      // Cards representation
      const cardSlotsHTML = (p.cards || []).map((c, i) => {
        if (!c.isAlive) {
          const rDef = ROLES_DEF[c.role] || ROLES_DEF['duke'];
          return `
            <div class="px-2 py-1 rounded-xl bg-slate-200 border border-slate-300 text-slate-500 text-[10px] font-display font-bold flex items-center gap-1 line-through" title="Kartu Mati: ${rDef.name}">
              <i data-lucide="${rDef.icon}" class="w-3 h-3 text-slate-400"></i>
              <span>${rDef.name}</span>
            </div>
          `;
        } else {
          // Living card
          if (isMe) {
            const rDef = ROLES_DEF[c.role] || ROLES_DEF['duke'];
            return `
              <div class="px-2 py-1 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 text-[10px] font-display font-black flex items-center gap-1 shadow-2xs">
                <i data-lucide="${rDef.icon}" class="w-3 h-3 text-amber-700"></i>
                <span>${rDef.name}</span>
              </div>
            `;
          } else {
            return `
              <div class="w-7 h-9 rounded-lg bg-gradient-to-br from-amber-900 to-amber-950 border border-amber-400/40 shadow-xs flex items-center justify-center text-amber-300" title="Pengaruh Tertutup">
                <i data-lucide="shield" class="w-3.5 h-3.5"></i>
              </div>
            `;
          }
        }
      }).join('');

      let targetSelectAction = '';
      if (isMyTurn && status === 'action_turn' && !isMe && p.isAlive) {
        targetSelectAction = `onclick="CoupGame.selectTargetPlayer('${pid}')"`;
      }

      const activeBorder = isTurn 
        ? 'border-amber-500 bg-amber-50/80 ring-4 ring-amber-500/20 shadow-md scale-101' 
        : (isTarget ? 'border-rose-500 bg-rose-50/80 ring-4 ring-rose-500/20' : 'border-slate-900/10 bg-white');

      return `
        <div 
          ${targetSelectAction}
          class="p-3 sm:p-4 rounded-3xl border-2 transition-all flex flex-col justify-between gap-3 ${activeBorder} ${!p.isAlive ? 'opacity-40 grayscale' : (isMyTurn && !isMe ? 'cursor-pointer hover:border-amber-400' : '')}"
        >
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
              ${UI.Avatar({ name: p.name, size: 'sm', colorIndex: p.colorIndex })}
              <div class="min-w-0">
                <span class="font-display font-bold text-xs text-slate-900 block truncate">${p.name}</span>
                <span class="text-[10px] text-slate-400 font-body">${isMe ? 'KAMU' : (p.isAlive ? 'Bangsawan' : 'Gugur')}</span>
              </div>
            </div>
            ${isTurn ? `
              <span class="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-display font-black animate-pulse shrink-0">
                GILIRAN
              </span>
            ` : ''}
          </div>

          <!-- Coins & Cards -->
          <div class="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-100 text-amber-950 text-xs font-display font-black shadow-2xs">
              <span class="text-sm">🪙</span>
              <span>${p.coins} Koin</span>
            </div>
            <div class="flex items-center gap-1">
              ${cardSlotsHTML}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // 2. STATUS & REACTION BANNER
    let statusBannerHTML = '';
    const actorPlayer = playersMap[pendingAction.actorId];
    const targetPlayer = playersMap[pendingAction.targetId];
    const blockerPlayer = playersMap[currentBlock.blockerId];

    if (status === 'action_turn') {
      statusBannerHTML = `
        <div class="p-4 rounded-2xl bg-amber-500 text-white shadow-md flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="text-2xl">👑</span>
            <div>
              <span class="text-[10px] font-display font-black uppercase tracking-wider text-amber-200 block">
                FASE AKSI GILIRAN
              </span>
              <h3 class="font-display font-black text-sm sm:text-base">
                ${isMyTurn ? 'Giliranmu Memilih Aksi!' : `Giliran [${playersMap[currentTurnId]?.name || 'Pemain'}] Memilih Aksi`}
              </h3>
            </div>
          </div>
          ${mustCoup ? `
            <span class="px-3 py-1 rounded-xl bg-rose-600 text-white text-xs font-display font-black animate-bounce shadow">
              ⚠️ WAJIB COUP (10+ KOIN)
            </span>
          ` : ''}
        </div>
      `;
    } else if (status === 'action_reaction') {
      const isActor = pendingAction.actorId === currentPlayer.id;
      const isTarget = pendingAction.targetId === currentPlayer.id;

      let actionDescText = `[${actorPlayer?.name}] mendeklarasikan aksi <b>${pendingAction.type.toUpperCase()}</b>`;
      if (pendingAction.claimedRole) {
        actionDescText += ` dengan mengklaim kartu <b>${ROLES_DEF[pendingAction.claimedRole]?.name || pendingAction.claimedRole}</b>`;
      }
      if (targetPlayer) {
        actionDescText += ` kepada [${targetPlayer.name}]`;
      }

      statusBannerHTML = `
        <div class="p-4 sm:p-5 rounded-3xl bg-slate-900 text-white border-2 border-amber-400/30 shadow-xl space-y-3">
          <div class="flex items-center justify-between gap-2">
            <span class="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-display font-black tracking-wider uppercase">
              ⚡ REAKSI ATAS AKSI LAWAN
            </span>
            <span class="text-xs font-display text-slate-300">Semua pemain berhak menantang (Challenge)</span>
          </div>

          <p class="font-body text-xs sm:text-sm text-slate-200 leading-relaxed">
            ${actionDescText}!
          </p>

          ${!isActor && myData.isAlive ? `
            <div class="pt-2 flex flex-wrap items-center gap-2">
              <button 
                onclick="CoupGame.reactToAction('pass')"
                class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-display font-bold text-xs transition-all active:scale-95 cursor-pointer"
              >
                ✅ Izinkan (Pass)
              </button>

              ${pendingAction.claimedRole ? `
                <button 
                  onclick="CoupGame.reactToAction('challenge')"
                  class="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-display font-black text-xs shadow-md shadow-rose-600/30 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i>
                  <span>CHALLENGE (Tuduh Bohong!) 🚨</span>
                </button>
              ` : ''}

              ${pendingAction.type === 'foreign_aid' ? `
                <button 
                  onclick="CoupGame.reactToAction('block', 'duke')"
                  class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-display font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <i data-lucide="shield" class="w-3.5 h-3.5"></i>
                  <span>Block (Klaim Duke) 🛡️</span>
                </button>
              ` : ''}

              ${isTarget && pendingAction.type === 'assassinate' ? `
                <button 
                  onclick="CoupGame.reactToAction('block', 'contessa')"
                  class="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-display font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <i data-lucide="shield" class="w-3.5 h-3.5"></i>
                  <span>Block (Klaim Contessa) 🛡️</span>
                </button>
              ` : ''}

              ${isTarget && pendingAction.type === 'steal' ? `
                <button 
                  onclick="CoupGame.reactToAction('block', 'captain')"
                  class="px-3 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-display font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Block (Klaim Captain) 🛡️
                </button>
                <button 
                  onclick="CoupGame.reactToAction('block', 'ambassador')"
                  class="px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Block (Klaim Ambassador) 🛡️
                </button>
              ` : ''}
            </div>
          ` : `
            <div class="text-xs font-display font-semibold text-slate-400">
              ${isActor ? 'Menunggu reaksi dari pemain lain...' : 'Kamu sedang menonton...'}
            </div>
          `}
        </div>
      `;
    } else if (status === 'block_reaction') {
      const isBlocker = currentBlock.blockerId === currentPlayer.id;

      statusBannerHTML = `
        <div class="p-4 sm:p-5 rounded-3xl bg-indigo-950 text-white border-2 border-indigo-400/40 shadow-xl space-y-3">
          <div class="flex items-center justify-between gap-2">
            <span class="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 text-[10px] font-display font-black tracking-wider uppercase">
              🛡️ PERCOBAAN BLOKIR DIAJUKAN
            </span>
          </div>

          <p class="font-body text-xs sm:text-sm text-indigo-100 leading-relaxed">
            [${blockerPlayer?.name}] menyatakan <b>BLOKIR</b> dengan mengklaim kartu <b>${ROLES_DEF[currentBlock.claimedRole]?.name || currentBlock.claimedRole}</b>!
          </p>

          ${!isBlocker && myData.isAlive ? `
            <div class="pt-2 flex flex-wrap items-center gap-2">
              <button 
                onclick="CoupGame.reactToBlock('accept')"
                class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-display font-bold text-xs transition-all active:scale-95 cursor-pointer"
              >
                ✅ Terima Blokir (Aksi Batal)
              </button>

              <button 
                onclick="CoupGame.reactToBlock('challenge')"
                class="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-display font-black text-xs shadow-md shadow-rose-600/30 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i>
                <span>TANTANG BLOKIR (CHALLENGE)! 🚨</span>
              </button>
            </div>
          ` : `
            <div class="text-xs font-display font-semibold text-indigo-300">
              ${isBlocker ? 'Menunggu apakah pemain lain menerima atau menantang blokirmu...' : ''}
            </div>
          `}
        </div>
      `;
    } else if (status === 'card_reveal_choice') {
      const targetLossId = state.pendingCardLoss?.targetPlayerId;
      const isMeLosing = targetLossId === currentPlayer.id;
      const victimPlayer = playersMap[targetLossId];

      statusBannerHTML = `
        <div class="p-4 sm:p-5 rounded-3xl bg-rose-950 text-white border-2 border-rose-500/40 shadow-xl space-y-2">
          <span class="px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-300 text-[10px] font-display font-black uppercase">
            💥 KEHILANGAN PENGARUH
          </span>
          <h3 class="font-display font-black text-base text-rose-100">
            [${victimPlayer?.name}] Harus Memilih 1 Kartu untuk Dikorbankan!
          </h3>
          <p class="font-body text-xs text-rose-200">
            ${isMeLosing ? 'Pilihlah salah satu kartu hidupmu di bawah untuk dibuka dan dimatikan:' : 'Menunggu pemain memilih kartu yang gugur...'}
          </p>
        </div>
      `;
    } else if (status === 'exchange_choice') {
      const isMeExchanging = state.pendingExchange?.playerId === currentPlayer.id;
      statusBannerHTML = `
        <div class="p-4 sm:p-5 rounded-3xl bg-emerald-950 text-white border-2 border-emerald-500/40 shadow-xl space-y-2">
          <span class="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-display font-black uppercase">
            📜 AKSI AMBASSADOR
          </span>
          <h3 class="font-display font-black text-base text-emerald-100">
            Pertukaran Kartu Duta Besar
          </h3>
          <p class="font-body text-xs text-emerald-200">
            ${isMeExchanging ? 'Pilih kartu yang ingin kamu simpan di tanganmu di bawah ini:' : 'Menunggu pemain memilih kartu pertukaran...'}
          </p>
        </div>
      `;
    }

    // 3. ACTION CONTROLS FOR ACTIVE PLAYER (BOTTOM)
    let actionControlsHTML = '';
    if (isMyTurn && status === 'action_turn' && myData.isAlive) {
      if (mustCoup) {
        actionControlsHTML = `
          <div class="p-5 rounded-3xl bg-rose-50 border-2 border-rose-400 space-y-3">
            <div class="flex items-center gap-2 text-rose-900 font-display font-black text-sm">
              <i data-lucide="alert-circle" class="w-4 h-4 text-rose-600"></i>
              <span>Koinmu mencapai ${myCoins}! Kamu wajib melakukan Kudeta (Coup).</span>
            </div>
            <p class="font-body text-xs text-rose-700">Pilih salah satu pemain lawan di Meja Pemain di atas, lalu tekan tombol Coup di bawah:</p>
            <button 
              onclick="CoupGame.executeAction('coup')"
              class="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-display font-black text-base shadow-lg shadow-rose-600/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <i data-lucide="skull" class="w-5 h-5"></i>
              <span>Luncurkan Kudeta (Coup - Bayar 7 Koin) 👑</span>
            </button>
          </div>
        `;
      } else {
        actionControlsHTML = `
          <div class="p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm space-y-4">
            <div class="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 class="font-display font-black text-sm text-slate-900 flex items-center gap-2">
                <i data-lucide="play" class="w-4 h-4 text-amber-600"></i>
                <span>Pilihan Aksi Giliranmu (${myCoins} Koin)</span>
              </h4>
              <span class="text-xs font-display font-semibold text-slate-400">Pilih 1 Aksi</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              <!-- Income -->
              <button 
                onclick="CoupGame.executeAction('income')"
                class="p-3.5 rounded-2xl border-2 border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/50 text-left transition-all active:scale-98 cursor-pointer group"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="font-display font-bold text-xs text-slate-900 group-hover:text-amber-800">Income (+1 Koin)</span>
                  <span class="text-xs">🪙</span>
                </div>
                <p class="text-[11px] text-slate-500 font-body">Ambil 1 koin gratis dari kas. Aman, tanpa tantangan.</p>
              </button>

              <!-- Foreign Aid -->
              <button 
                onclick="CoupGame.executeAction('foreign_aid')"
                class="p-3.5 rounded-2xl border-2 border-slate-200 hover:border-amber-400 bg-slate-50 hover:bg-amber-50/50 text-left transition-all active:scale-98 cursor-pointer group"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="font-display font-bold text-xs text-slate-900 group-hover:text-amber-800">Foreign Aid (+2 Koin)</span>
                  <span class="text-xs">💰</span>
                </div>
                <p class="text-[11px] text-slate-500 font-body">Ambil 2 koin bantuan asing. Bisa diblokir Duke lawan.</p>
              </button>

              <!-- Tax (Duke) -->
              <button 
                onclick="CoupGame.executeAction('tax')"
                class="p-3.5 rounded-2xl border-2 border-purple-200 hover:border-purple-500 bg-purple-50/60 text-left transition-all active:scale-98 cursor-pointer group"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="font-display font-bold text-xs text-purple-950">Tax (+3 Koin)</span>
                  <span class="px-1.5 py-0.5 rounded bg-purple-200 text-purple-900 text-[9px] font-black uppercase">Duke</span>
                </div>
                <p class="text-[11px] text-purple-900/70 font-body">Klaim Duke untuk menarik pajak 3 koin emas.</p>
              </button>

              <!-- Steal (Captain) -->
              <button 
                onclick="CoupGame.executeAction('steal')"
                class="p-3.5 rounded-2xl border-2 border-sky-200 hover:border-sky-500 bg-sky-50/60 text-left transition-all active:scale-98 cursor-pointer group"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="font-display font-bold text-xs text-sky-950">Steal (+2 Koin dari Target)</span>
                  <span class="px-1.5 py-0.5 rounded bg-sky-200 text-sky-900 text-[9px] font-black uppercase">Captain</span>
                </div>
                <p class="text-[11px] text-sky-900/70 font-body">Curi 2 koin dari lawan pilihanmu di meja.</p>
              </button>

              <!-- Assassinate (Assassin) -->
              <button 
                onclick="CoupGame.executeAction('assassinate')"
                class="p-3.5 rounded-2xl border-2 border-rose-200 hover:border-rose-500 bg-rose-50/60 text-left transition-all active:scale-98 cursor-pointer group ${myCoins < 3 ? 'opacity-50 cursor-not-allowed' : ''}"
                ${myCoins < 3 ? 'disabled' : ''}
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="font-display font-bold text-xs text-rose-950">Assassinate (-3 Koin)</span>
                  <span class="px-1.5 py-0.5 rounded bg-rose-200 text-rose-900 text-[9px] font-black uppercase">Assassin</span>
                </div>
                <p class="text-[11px] text-rose-900/70 font-body">Bayar 3 koin untuk membunuh 1 kartu lawan.</p>
              </button>

              <!-- Exchange (Ambassador) -->
              <button 
                onclick="CoupGame.executeAction('exchange')"
                class="p-3.5 rounded-2xl border-2 border-emerald-200 hover:border-emerald-500 bg-emerald-50/60 text-left transition-all active:scale-98 cursor-pointer group"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="font-display font-bold text-xs text-emerald-950">Exchange (Tukar Kartu)</span>
                  <span class="px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[9px] font-black uppercase">Ambassador</span>
                </div>
                <p class="text-[11px] text-emerald-900/70 font-body">Intip 2 kartu dari dek dan tukar kartu tanganmu.</p>
              </button>
            </div>

            <!-- Coup Action -->
            <div class="pt-2">
              <button 
                onclick="CoupGame.executeAction('coup')"
                class="w-full py-3.5 px-4 rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-display font-bold text-xs sm:text-sm shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2 ${myCoins < 7 ? 'opacity-50 cursor-not-allowed' : ''}"
                ${myCoins < 7 ? 'disabled' : ''}
              >
                <i data-lucide="crown" class="w-4 h-4"></i>
                <span>Luncurkan Kudeta (Coup - Bayar 7 Koin) • Mutlak Tanpa Tangkisan</span>
              </button>
            </div>
          </div>
        `;
      }
    }

    // 4. KARTU RAHASIA SAYA (MY SECRET HAND)
    const myCardsHTML = (myData.cards || []).map(card => {
      const rDef = ROLES_DEF[card.role] || ROLES_DEF['duke'];
      const isLossChoice = status === 'card_reveal_choice' && state.pendingCardLoss?.targetPlayerId === currentPlayer.id && card.isAlive;

      return `
        <div 
          ${isLossChoice ? `onclick="CoupGame.chooseCardToReveal('${card.id}')"` : ''}
          class="p-4 sm:p-5 rounded-3xl border-2 transition-all flex-1 select-none ${card.isAlive ? (isLossChoice ? 'border-rose-500 bg-rose-50 hover:bg-rose-100 cursor-pointer ring-4 ring-rose-500/30 animate-pulse' : 'border-amber-400/60 bg-gradient-to-br from-white to-amber-50/40 shadow-sm') : 'border-slate-300 bg-slate-100 opacity-50 grayscale'}"
        >
          <div class="flex items-center justify-between mb-3">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-display font-black uppercase ${rDef.badgeClass}">
              ${rDef.name}
            </span>
            <span class="text-[10px] font-bold ${card.isAlive ? 'text-emerald-700' : 'text-rose-600 line-through'}">
              ${card.isAlive ? '● AKTIF' : '✕ MATI'}
            </span>
          </div>

          <div class="flex items-center gap-3 my-2">
            <div class="w-12 h-12 rounded-2xl ${rDef.iconBg} flex items-center justify-center shrink-0 shadow-md">
              <i data-lucide="${rDef.icon}" class="w-6 h-6"></i>
            </div>
            <div>
              <h4 class="font-display font-black text-base text-slate-900">${rDef.name}</h4>
              <p class="font-body text-xs text-slate-500">${rDef.title}</p>
            </div>
          </div>

          <div class="mt-3 pt-2.5 border-t border-slate-100/80 text-[11px] font-body text-slate-600 leading-tight space-y-1">
            <p><b>Aksi:</b> ${rDef.actionDesc}</p>
            <p><b>Tangkis:</b> ${rDef.blockDesc}</p>
          </div>

          ${isLossChoice ? `
            <div class="mt-3 pt-2 text-center text-xs font-display font-black text-rose-600 uppercase">
              👉 Klik kartu ini untuk dikorbankan
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // 5. EXCHANGE CARD SELECTOR MODAL (IF APPLICABLE)
    let exchangeCardsHTML = '';
    if (status === 'exchange_choice' && state.pendingExchange?.playerId === currentPlayer.id) {
      const drawn = state.pendingExchange.drawnCards || [];
      const pool = [...myLivingCards, ...drawn];
      const maxKeep = myLivingCards.length;

      exchangeCardsHTML = `
        <div class="p-5 rounded-3xl bg-white border-2 border-emerald-500 shadow-xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h4 class="font-display font-black text-sm text-slate-900">Pilih ${maxKeep} Kartu untuk Disimpan di Tangan</h4>
              <p class="font-body text-xs text-slate-500">Kartu sisanya akan dikocok kembali ke dalam dek.</p>
            </div>
            <span class="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-display font-bold">
              ${selectedExchangeCardIds.size} / ${maxKeep} Dipilih
            </span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            ${pool.map(c => {
              const rDef = ROLES_DEF[c.role] || ROLES_DEF['duke'];
              const isSelected = selectedExchangeCardIds.has(c.id);
              return `
                <div 
                  onclick="CoupGame.toggleExchangeCard('${c.id}', ${maxKeep})"
                  class="p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${isSelected ? 'border-emerald-600 bg-emerald-50 ring-4 ring-emerald-500/20 shadow-md scale-102' : 'border-slate-200 bg-white hover:border-emerald-300'}"
                >
                  <div class="w-8 h-8 rounded-xl ${rDef.iconBg} flex items-center justify-center text-white mb-2 shadow-xs">
                    <i data-lucide="${rDef.icon}" class="w-4 h-4"></i>
                  </div>
                  <div>
                    <span class="font-display font-black text-xs text-slate-900 block">${rDef.name}</span>
                    <span class="text-[10px] text-slate-500">${rDef.title}</span>
                  </div>
                  <div class="mt-2 text-right">
                    <span class="text-[10px] font-bold ${isSelected ? 'text-emerald-700' : 'text-slate-400'}">
                      ${isSelected ? '✓ DISIMPAN' : '○ LEPAS'}
                    </span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <button 
            onclick="CoupGame.submitExchangeChoice()"
            class="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${selectedExchangeCardIds.size !== maxKeep ? 'opacity-50 cursor-not-allowed' : ''}"
            ${selectedExchangeCardIds.size !== maxKeep ? 'disabled' : ''}
          >
            <i data-lucide="check" class="w-4 h-4"></i>
            <span>Konfirmasi Kartu Tangan Pilihanmu 📜</span>
          </button>
        </div>
      `;
    }

    // 6. ACTION LOGS SIDE DRAWER
    const logItemsHTML = actionLogs.slice(-6).reverse().map(l => `
      <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-body text-slate-700 leading-snug flex items-start gap-2">
        <span class="text-amber-600 font-bold shrink-0 mt-0.5">•</span>
        <span>${l.text}</span>
      </div>
    `).join('');

    const contentHTML = `
      <div class="w-full max-w-5xl mx-auto py-3 space-y-6">
        <!-- Top App Bar in Arena -->
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <i data-lucide="crown" class="w-5 h-5"></i>
            </div>
            <div>
              <h2 class="font-display font-black text-base sm:text-lg text-slate-900 leading-tight">
                Meja Kudeta Coup 👑
              </h2>
              <span class="text-[11px] font-body text-slate-500">Kamar #${currentRoom.code}</span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button 
              onclick="GameRules.open('coup', 'lobby')"
              class="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-display font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
              <span>Aturan</span>
            </button>
            <button 
              onclick="App.returnToLobby()"
              class="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-bold text-xs transition-all cursor-pointer"
            >
              Lobby
            </button>
          </div>
        </div>

        <!-- 1. Meja Pemain Grid -->
        <div>
          <div class="flex items-center justify-between mb-2 px-1">
            <span class="font-display font-bold text-xs text-slate-600 uppercase tracking-wider">
              Bangsawan di Meja Permainan:
            </span>
            <span class="text-xs font-body text-slate-400">
              ${turnOrder.filter(pid => playersMap[pid]?.isAlive).length} Pemain Bertahan
            </span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            ${playerTableHTML}
          </div>
        </div>

        <!-- 2. Status & Reaction Banner -->
        ${statusBannerHTML}

        <!-- 3. Exchange Modal (if active) -->
        ${exchangeCardsHTML}

        <!-- 4. Action Controls for Turn Player -->
        ${actionControlsHTML}

        <!-- 5. My Secret Influence Cards (Bottom) -->
        <div class="p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h4 class="font-display font-black text-sm text-slate-900 flex items-center gap-2">
              <i data-lucide="shield" class="w-4 h-4 text-amber-600"></i>
              <span>Kartu Pengaruh Rahasiamu (Milikmu)</span>
            </h4>
            <span class="text-xs font-display font-bold text-amber-700">
              ${myLivingCards.length} Nyawa Tersisa
            </span>
          </div>
          <div class="flex flex-col sm:flex-row gap-3">
            ${myCardsHTML}
          </div>
        </div>

        <!-- 6. Action History Log -->
        <div class="p-4 sm:p-5 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm space-y-2">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <h5 class="font-display font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <i data-lucide="history" class="w-3.5 h-3.5 text-slate-500"></i>
              <span>Riwayat Aksi & Gertakan Meja</span>
            </h5>
            <span class="text-[10px] text-slate-400 font-body">Real-Time Log</span>
          </div>
          <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            ${logItemsHTML.length > 0 ? logItemsHTML : '<p class="text-xs text-slate-400 italic">Belum ada aksi yang tercatat.</p>'}
          </div>
        </div>
      </div>
    `;

    appEl.innerHTML = contentHTML;
  }

  /**
   * ==========================================================================
   * VIEW 3: GAME OVER
   * ==========================================================================
   */
  function renderGameOverView(appEl, state) {
    const isHost = currentPlayer && currentPlayer.isHost;
    const winnerId = state.winnerId;
    const winner = (state.players || {})[winnerId];

    const contentHTML = `
      <div class="max-w-xl mx-auto py-8 text-center space-y-6">
        <div class="p-8 rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white shadow-2xl border-4 border-amber-300/40 space-y-3">
          <span class="text-5xl block animate-bounce">👑</span>
          <h2 class="font-display font-black text-3xl sm:text-4xl tracking-tight">
            ${winner?.name || 'Pemain'} Menang Kudeta!
          </h2>
          <p class="font-body text-xs sm:text-sm text-amber-100 max-w-sm mx-auto leading-relaxed">
            Menjadi satu-satunya bangsawan yang berhasil mempertahankan kartu pengaruh rahasianya di Kota Dystopia!
          </p>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          ${isHost ? `
            <button 
              onclick="CoupGame.startGame()"
              class="w-full sm:w-auto px-6 py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-display font-black text-sm shadow-lg shadow-amber-600/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <i data-lucide="rotate-ccw" class="w-4 h-4"></i>
              <span>Mainkan Ronde Baru 🔄</span>
            </button>
          ` : ''}

          <button 
            onclick="App.returnToLobby()"
            class="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-bold text-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <i data-lucide="home" class="w-4 h-4"></i>
            <span>Kembali ke Lobby 🏠</span>
          </button>
        </div>
      </div>
    `;

    appEl.innerHTML = contentHTML;
  }

  /**
   * ==========================================================================
   * GAME LOGIC & DISPATCHERS
   * ==========================================================================
   */

  /**
   * 1. Start Coup Game (Host Only)
   */
  async function startGame() {
    if (!currentRoom || !currentPlayer?.isHost) return;
    UI.Sound.click();

    const playerList = Object.values(currentRoom.players || {});
    if (playerList.length < 2) {
      UI.Toast('Minimal 2 pemain untuk memulai Coup!', 'warning');
      return;
    }

    const deck = createDeck();
    const playersMap = {};

    playerList.forEach((p, idx) => {
      const card1 = deck.pop();
      const card2 = deck.pop();
      playersMap[p.id] = {
        id: p.id,
        name: p.name,
        coins: 2, // Standard starting coins
        cards: [card1, card2],
        isAlive: true,
        colorIndex: p.colorIndex || idx
      };
    });

    const turnOrder = playerList.map(p => p.id).sort(() => 0.5 - Math.random());

    await DB.updateGameState(currentRoom.code, 'coup', {
      status: 'action_turn',
      deck: deck,
      players: playersMap,
      turnOrder: turnOrder,
      turnIndex: 0,
      currentTurnPlayerId: turnOrder[0],
      currentAction: null,
      actionReactions: {},
      currentBlock: null,
      blockReactions: {},
      pendingCardLoss: null,
      pendingExchange: null,
      actionLogs: [
        { text: `Permainan dimulai! ${playerList.length} bangsawan siap bertarung.`, timestamp: Date.now() }
      ],
      winnerId: null
    });

    UI.Toast('Kudeta dimulai! Setiap pemain menerima 2 koin dan 2 kartu rahasia.', 'success');
  }

  function selectTargetPlayer(targetId) {
    selectedTargetPlayerId = targetId;
    UI.Sound.pop();
    render(document.getElementById('app'), currentRoom, currentPlayer);
  }

  /**
   * 2. Turn Player Declares an Action
   */
  async function executeAction(actionType) {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    const state = getGameState(currentRoom);
    if (state.currentTurnPlayerId !== currentPlayer.id) return;

    const myData = state.players[currentPlayer.id];
    const myCoins = myData?.coins || 0;

    // Target validation for targetable actions
    if (['coup', 'assassinate', 'steal'].includes(actionType)) {
      if (!selectedTargetPlayerId) {
        UI.Toast('Pilih pemain target di Meja Pemain di atas terlebih dahulu!', 'warning');
        return;
      }
      if (selectedTargetPlayerId === currentPlayer.id) {
        UI.Toast('Kamu tidak bisa menargetkan dirimu sendiri!', 'warning');
        return;
      }
      if (!state.players[selectedTargetPlayerId]?.isAlive) {
        UI.Toast('Target sudah gugur!', 'warning');
        return;
      }
    }

    // Cost validations
    if (actionType === 'coup' && myCoins < 7) {
      UI.Toast('Koin tidak cukup untuk Coup (butuh 7 koin)!', 'warning');
      return;
    }
    if (actionType === 'assassinate' && myCoins < 3) {
      UI.Toast('Koin tidak cukup untuk Assassinate (butuh 3 koin)!', 'warning');
      return;
    }

    isSubmitting = true;
    UI.Sound.click();

    const targetName = state.players[selectedTargetPlayerId]?.name;
    const actionLogs = [...(state.actionLogs || [])];

    // Case 1: Income (Instant, no challenge, no block)
    if (actionType === 'income') {
      const players = { ...state.players };
      players[currentPlayer.id].coins += 1;
      actionLogs.push({ text: `[${currentPlayer.name}] mengambil Income (+1 Koin).`, timestamp: Date.now() });

      const nextTurnData = getNextTurnData(state.turnOrder, state.turnIndex, players);
      await DB.updateGameState(currentRoom.code, 'coup', {
        players,
        actionLogs,
        status: 'action_turn',
        currentTurnPlayerId: nextTurnData.playerId,
        turnIndex: nextTurnData.index,
        currentAction: null
      });
      isSubmitting = false;
      return;
    }

    // Case 2: Coup (Instant, costs 7 coins, target must lose card)
    if (actionType === 'coup') {
      const players = { ...state.players };
      players[currentPlayer.id].coins -= 7;
      actionLogs.push({ text: `[${currentPlayer.name}] meluncurkan Kudeta (COUP) kepada [${targetName}]!`, timestamp: Date.now() });

      await DB.updateGameState(currentRoom.code, 'coup', {
        players,
        actionLogs,
        status: 'card_reveal_choice',
        pendingCardLoss: {
          targetPlayerId: selectedTargetPlayerId,
          reason: 'coup',
          nextStep: 'advance_turn'
        },
        currentAction: null
      });
      selectedTargetPlayerId = null;
      isSubmitting = false;
      return;
    }

    // Case 3: Action that requires reaction (Tax, Foreign Aid, Assassinate, Steal, Exchange)
    let claimedRole = null;
    let cost = 0;
    if (actionType === 'tax') claimedRole = 'duke';
    if (actionType === 'assassinate') { claimedRole = 'assassin'; cost = 3; }
    if (actionType === 'steal') claimedRole = 'captain';
    if (actionType === 'exchange') claimedRole = 'ambassador';

    // Deduct cost immediately if assassinate
    const players = { ...state.players };
    if (cost > 0) {
      players[currentPlayer.id].coins -= cost;
    }

    actionLogs.push({
      text: `[${currentPlayer.name}] melakukan ${actionType.toUpperCase()}${targetName ? ` kepada [${targetName}]` : ''}${claimedRole ? ` (mengklaim ${ROLES_DEF[claimedRole]?.name})` : ''}.`,
      timestamp: Date.now()
    });

    await DB.updateGameState(currentRoom.code, 'coup', {
      players,
      actionLogs,
      status: 'action_reaction',
      currentAction: {
        type: actionType,
        actorId: currentPlayer.id,
        targetId: selectedTargetPlayerId || null,
        claimedRole: claimedRole,
        cost: cost
      },
      actionReactions: {}
    });

    selectedTargetPlayerId = null;
    isSubmitting = false;
  }

  /**
   * 3. Reaction to Action (Pass, Challenge, Block)
   */
  async function reactToAction(reactionType, claimedBlockRole = null) {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    const state = getGameState(currentRoom);
    if (state.status !== 'action_reaction') return;

    isSubmitting = true;
    UI.Sound.click();

    const pending = state.currentAction;
    const actionLogs = [...(state.actionLogs || [])];
    const actorId = pending.actorId;
    const actor = state.players[actorId];

    // Reaction 1: CHALLENGE the Actor's claimed role!
    if (reactionType === 'challenge') {
      UI.Sound.gong();
      const claimedRole = pending.claimedRole;
      const actorLivingCards = (actor.cards || []).filter(c => c.isAlive);
      const actorHasRole = actorLivingCards.some(c => c.role === claimedRole);

      if (actorHasRole) {
        // Actor was truthful! Challenger loses challenge
        actionLogs.push({
          text: `🚨 [${currentPlayer.name}] menantang klaim ${ROLES_DEF[claimedRole]?.name} [${actor.name}]... dan [${actor.name}] JUJUR MEMILIKINYA! [${currentPlayer.name}] kalah tantangan.`,
          timestamp: Date.now()
        });

        // Replace actor's proven card with a fresh card from deck
        const deck = [...(state.deck || [])];
        const players = { ...state.players };
        const cardIndex = players[actorId].cards.findIndex(c => c.isAlive && c.role === claimedRole);
        if (cardIndex !== -1 && deck.length > 0) {
          const provenCard = players[actorId].cards[cardIndex];
          const newCard = deck.pop();
          deck.push(provenCard);
          deck.sort(() => 0.5 - Math.random());
          players[actorId].cards[cardIndex] = newCard;
        }

        // Challenger must lose 1 card!
        await DB.updateGameState(currentRoom.code, 'coup', {
          deck,
          players,
          actionLogs,
          status: 'card_reveal_choice',
          pendingCardLoss: {
            targetPlayerId: currentPlayer.id,
            reason: 'failed_challenge',
            nextStep: 'continue_action' // action continues after challenger reveals card
          }
        });
      } else {
        // Actor was BLUFFING! Actor loses 1 card, action cancelled!
        actionLogs.push({
          text: `💥 [${currentPlayer.name}] menantang [${actor.name}]... dan KETAHUAN BOHONG! [${actor.name}] harus mengorbankan 1 kartu dan aksinya batal!`,
          timestamp: Date.now()
        });

        await DB.updateGameState(currentRoom.code, 'coup', {
          actionLogs,
          status: 'card_reveal_choice',
          pendingCardLoss: {
            targetPlayerId: actorId,
            reason: 'bluff_caught',
            nextStep: 'advance_turn'
          }
        });
      }
      isSubmitting = false;
      return;
    }

    // Reaction 2: BLOCK declared
    if (reactionType === 'block') {
      actionLogs.push({
        text: `🛡️ [${currentPlayer.name}] memblokir aksi dengan mengklaim kartu ${ROLES_DEF[claimedBlockRole]?.name || claimedBlockRole}!`,
        timestamp: Date.now()
      });

      await DB.updateGameState(currentRoom.code, 'coup', {
        actionLogs,
        status: 'block_reaction',
        currentBlock: {
          blockerId: currentPlayer.id,
          claimedRole: claimedBlockRole
        },
        blockReactions: {}
      });
      isSubmitting = false;
      return;
    }

    // Reaction 3: PASS
    if (reactionType === 'pass') {
      const reactions = { ...(state.actionReactions || {}) };
      reactions[currentPlayer.id] = 'pass';

      const livingOthers = Object.values(state.players).filter(p => p.isAlive && p.id !== actorId);
      const allPassed = livingOthers.every(p => reactions[p.id] === 'pass');

      if (allPassed) {
        // Execute the action!
        await resolveSuccessfulAction(state, pending);
      } else {
        await DB.updateGameState(currentRoom.code, 'coup', { actionReactions: reactions });
      }
      isSubmitting = false;
    }
  }

  /**
   * 4. Reaction to Block (Accept or Challenge Block)
   */
  async function reactToBlock(reactionType) {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    const state = getGameState(currentRoom);
    if (state.status !== 'block_reaction') return;

    isSubmitting = true;
    UI.Sound.click();

    const block = state.currentBlock;
    const blocker = state.players[block.blockerId];
    const actionLogs = [...(state.actionLogs || [])];

    // Accept Block: Action cancelled, turn advances
    if (reactionType === 'accept') {
      actionLogs.push({
        text: `[${currentPlayer.name}] menerima blokir dari [${blocker.name}]. Aksi dibatalkan.`,
        timestamp: Date.now()
      });

      const nextTurnData = getNextTurnData(state.turnOrder, state.turnIndex, state.players);
      await DB.updateGameState(currentRoom.code, 'coup', {
        actionLogs,
        status: 'action_turn',
        currentTurnPlayerId: nextTurnData.playerId,
        turnIndex: nextTurnData.index,
        currentAction: null,
        currentBlock: null
      });
      isSubmitting = false;
      return;
    }

    // Challenge Block!
    if (reactionType === 'challenge') {
      UI.Sound.gong();
      const blockerLivingCards = (blocker.cards || []).filter(c => c.isAlive);
      const blockerHasRole = blockerLivingCards.some(c => c.role === block.claimedRole);

      if (blockerHasRole) {
        // Blocker proved their role! Challenger loses card, block succeeds!
        actionLogs.push({
          text: `🚨 [${currentPlayer.name}] menantang blokir [${blocker.name}]... dan [${blocker.name}] JUJUR MEMILIKINYA! [${currentPlayer.name}] kehilangan 1 kartu dan aksi tetap batal!`,
          timestamp: Date.now()
        });

        // Replace blocker's card with fresh card from deck
        const deck = [...(state.deck || [])];
        const players = { ...state.players };
        const cardIndex = players[block.blockerId].cards.findIndex(c => c.isAlive && c.role === block.claimedRole);
        if (cardIndex !== -1 && deck.length > 0) {
          const provenCard = players[block.blockerId].cards[cardIndex];
          const newCard = deck.pop();
          deck.push(provenCard);
          deck.sort(() => 0.5 - Math.random());
          players[block.blockerId].cards[cardIndex] = newCard;
        }

        await DB.updateGameState(currentRoom.code, 'coup', {
          deck,
          players,
          actionLogs,
          status: 'card_reveal_choice',
          pendingCardLoss: {
            targetPlayerId: currentPlayer.id,
            reason: 'failed_challenge',
            nextStep: 'advance_turn'
          }
        });
      } else {
        // Blocker caught bluffing! Blocker loses 1 card, original action succeeds!
        actionLogs.push({
          text: `💥 [${currentPlayer.name}] menantang blokir [${blocker.name}]... dan TERBUKTI BOHONG! [${blocker.name}] harus mengorbankan 1 kartu dan aksi awal tetap berlanjut!`,
          timestamp: Date.now()
        });

        await DB.updateGameState(currentRoom.code, 'coup', {
          actionLogs,
          status: 'card_reveal_choice',
          pendingCardLoss: {
            targetPlayerId: block.blockerId,
            reason: 'bluff_caught',
            nextStep: 'continue_action'
          }
        });
      }
      isSubmitting = false;
    }
  }

  /**
   * 5. Resolve Successful Action
   */
  async function resolveSuccessfulAction(state, action) {
    const players = { ...state.players };
    const actionLogs = [...(state.actionLogs || [])];
    const actor = players[action.actorId];
    const target = players[action.targetId];

    if (action.type === 'foreign_aid') {
      actor.coins += 2;
      actionLogs.push({ text: `[${actor.name}] berhasil menerima Foreign Aid (+2 Koin).`, timestamp: Date.now() });
      const next = getNextTurnData(state.turnOrder, state.turnIndex, players);
      await DB.updateGameState(currentRoom.code, 'coup', {
        players,
        actionLogs,
        status: 'action_turn',
        currentTurnPlayerId: next.playerId,
        turnIndex: next.index,
        currentAction: null
      });
    } else if (action.type === 'tax') {
      actor.coins += 3;
      actionLogs.push({ text: `[${actor.name}] berhasil menarik Pajak Duke (+3 Koin).`, timestamp: Date.now() });
      const next = getNextTurnData(state.turnOrder, state.turnIndex, players);
      await DB.updateGameState(currentRoom.code, 'coup', {
        players,
        actionLogs,
        status: 'action_turn',
        currentTurnPlayerId: next.playerId,
        turnIndex: next.index,
        currentAction: null
      });
    } else if (action.type === 'steal') {
      const stolenCoins = Math.min(2, target.coins);
      target.coins -= stolenCoins;
      actor.coins += stolenCoins;
      actionLogs.push({ text: `[${actor.name}] berhasil mencuri ${stolenCoins} koin dari [${target.name}]!`, timestamp: Date.now() });
      const next = getNextTurnData(state.turnOrder, state.turnIndex, players);
      await DB.updateGameState(currentRoom.code, 'coup', {
        players,
        actionLogs,
        status: 'action_turn',
        currentTurnPlayerId: next.playerId,
        turnIndex: next.index,
        currentAction: null
      });
    } else if (action.type === 'assassinate') {
      actionLogs.push({ text: `[${actor.name}] berhasil mengeksekusi pembunuhan kepada [${target.name}]!`, timestamp: Date.now() });
      await DB.updateGameState(currentRoom.code, 'coup', {
        players,
        actionLogs,
        status: 'card_reveal_choice',
        pendingCardLoss: {
          targetPlayerId: target.id,
          reason: 'assassinate',
          nextStep: 'advance_turn'
        }
      });
    } else if (action.type === 'exchange') {
      const deck = [...(state.deck || [])];
      const drawnCards = [deck.pop(), deck.pop()].filter(Boolean);
      actionLogs.push({ text: `[${actor.name}] mengambil 2 kartu dari dek untuk melakukan pertukaran.`, timestamp: Date.now() });

      await DB.updateGameState(currentRoom.code, 'coup', {
        deck,
        actionLogs,
        status: 'exchange_choice',
        pendingExchange: {
          playerId: actor.id,
          drawnCards: drawnCards
        }
      });
    }
  }

  /**
   * 6. Player Chooses Which Card to Reveal/Sacrifice
   */
  async function chooseCardToReveal(cardId) {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    const state = getGameState(currentRoom);
    if (state.status !== 'card_reveal_choice') return;
    if (state.pendingCardLoss?.targetPlayerId !== currentPlayer.id) return;

    isSubmitting = true;
    UI.Sound.gong();

    const players = { ...state.players };
    const myData = players[currentPlayer.id];
    const cardIndex = myData.cards.findIndex(c => c.id === cardId && c.isAlive);

    if (cardIndex === -1) {
      isSubmitting = false;
      return;
    }

    // Kill card
    myData.cards[cardIndex].isAlive = false;
    const revealedRole = myData.cards[cardIndex].role;

    // Check if player is eliminated
    const livingCards = myData.cards.filter(c => c.isAlive);
    if (livingCards.length === 0) {
      myData.isAlive = false;
    }

    const actionLogs = [...(state.actionLogs || [])];
    actionLogs.push({
      text: `🎴 [${currentPlayer.name}] kehilangan pengaruh kartu [${ROLES_DEF[revealedRole]?.name}]!`,
      timestamp: Date.now()
    });

    // Check Win Condition: Only 1 living player left?
    const livingPlayers = Object.values(players).filter(p => p.isAlive);
    if (livingPlayers.length <= 1) {
      const winner = livingPlayers[0] || null;
      await DB.updateGameState(currentRoom.code, 'coup', {
        players,
        actionLogs,
        status: 'game_over',
        winnerId: winner ? winner.id : null
      });
      isSubmitting = false;
      return;
    }

    // Resume or advance turn based on nextStep
    const nextStep = state.pendingCardLoss?.nextStep;
    if (nextStep === 'continue_action' && state.currentAction) {
      await resolveSuccessfulAction({ ...state, players, actionLogs }, state.currentAction);
    } else {
      const nextTurnData = getNextTurnData(state.turnOrder, state.turnIndex, players);
      await DB.updateGameState(currentRoom.code, 'coup', {
        players,
        actionLogs,
        status: 'action_turn',
        currentTurnPlayerId: nextTurnData.playerId,
        turnIndex: nextTurnData.index,
        currentAction: null,
        pendingCardLoss: null
      });
    }

    isSubmitting = false;
  }

  /**
   * 7. Exchange Hand Selection
   */
  function toggleExchangeCard(cardId, maxKeep) {
    if (selectedExchangeCardIds.has(cardId)) {
      selectedExchangeCardIds.delete(cardId);
    } else {
      if (selectedExchangeCardIds.size < maxKeep) {
        selectedExchangeCardIds.add(cardId);
      }
    }
    UI.Sound.pop();
    render(document.getElementById('app'), currentRoom, currentPlayer);
  }

  async function submitExchangeChoice() {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    const state = getGameState(currentRoom);
    if (state.status !== 'exchange_choice') return;
    if (state.pendingExchange?.playerId !== currentPlayer.id) return;

    isSubmitting = true;
    UI.Sound.click();

    const myData = state.players[currentPlayer.id];
    const myLivingCards = (myData.cards || []).filter(c => c.isAlive);
    const drawn = state.pendingExchange.drawnCards || [];
    const pool = [...myLivingCards, ...drawn];

    if (selectedExchangeCardIds.size !== myLivingCards.length) {
      UI.Toast(`Pilih tepat ${myLivingCards.length} kartu untuk disimpan!`, 'warning');
      isSubmitting = false;
      return;
    }

    const newHandLivingCards = pool.filter(c => selectedExchangeCardIds.has(c.id));
    const returnedCards = pool.filter(c => !selectedExchangeCardIds.has(c.id));

    // Reconstruct player hand preserving dead cards
    const deadCards = (myData.cards || []).filter(c => !c.isAlive);
    const players = { ...state.players };
    players[currentPlayer.id].cards = [...newHandLivingCards, ...deadCards];

    // Return unselected to deck
    const deck = [...(state.deck || []), ...returnedCards];
    deck.sort(() => 0.5 - Math.random());

    const actionLogs = [...(state.actionLogs || [])];
    actionLogs.push({
      text: `[${currentPlayer.name}] telah menyelesaikan pertukaran kartu Ambassador.`,
      timestamp: Date.now()
    });

    const nextTurnData = getNextTurnData(state.turnOrder, state.turnIndex, players);
    await DB.updateGameState(currentRoom.code, 'coup', {
      deck,
      players,
      actionLogs,
      status: 'action_turn',
      currentTurnPlayerId: nextTurnData.playerId,
      turnIndex: nextTurnData.index,
      currentAction: null,
      pendingExchange: null
    });

    selectedExchangeCardIds.clear();
    isSubmitting = false;
  }

  /**
   * Helper: Calculate next living player's turn
   */
  function getNextTurnData(turnOrder, currentTurnIndex, playersMap) {
    const total = turnOrder.length;
    let nextIndex = (currentTurnIndex + 1) % total;

    // Loop until we find a living player
    for (let i = 0; i < total; i++) {
      const pid = turnOrder[nextIndex];
      if (playersMap[pid] && playersMap[pid].isAlive) {
        return { index: nextIndex, playerId: pid };
      }
      nextIndex = (nextIndex + 1) % total;
    }

    return { index: currentTurnIndex, playerId: turnOrder[currentTurnIndex] };
  }

  function cleanup() {
    selectedTargetPlayerId = null;
    selectedExchangeCardIds.clear();
    isSubmitting = false;
    UI.Logger('COUP', 'Cleaned up CoupGame state');
  }

  return {
    init: () => {},
    render,
    onStateChange: (roomData) => {
      currentRoom = roomData;
      const state = getGameState(roomData);
      if (state.winnerId) {
        UI.Confetti();
        UI.Sound.fanfare();
      }
    },
    startGame,
    selectTargetPlayer,
    executeAction,
    reactToAction,
    reactToBlock,
    chooseCardToReveal,
    toggleExchangeCard,
    submitExchangeChoice,
    cleanup
  };
})();

if (typeof window !== 'undefined') {
  window.CoupGame = CoupGame;
}
