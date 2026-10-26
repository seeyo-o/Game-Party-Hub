/**
 * ==========================================================================
 * DISCORD PARTY HUB - GAME 6: "COSTUME PARTY DETECTIVE"
 * ==========================================================================
 * Permainan deduksi visual & pesta kostum rahasia di antara 6 ruangan pesta.
 * Terhubung ke Firebase Realtime Database: rooms/{roomCode}/costumeDetectiveGame
 * Tema: Mystery Mint (#F0FDFA), Teal Detective (#0D9488), Costume Violet (#7C3AED).
 */

const CostumeDetectiveGame = (function () {
  'use strict';

  // Module Local State
  let currentRoom = null;
  let currentPlayer = null;
  let selectedCharacterId = null;
  let isRolling = false;
  let isSubmitting = false;

  // 20 Iconic Costumed Characters
  const CHARACTERS_LIST = [
    { id: 'drakula', name: 'Drakula', emoji: '🧛', badgeClass: 'bg-rose-100 text-rose-900 border-rose-300' },
    { id: 'zombie', name: 'Zombie', emoji: '🧟', badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    { id: 'penyihir', name: 'Penyihir', emoji: '🧙‍♀️', badgeClass: 'bg-purple-100 text-purple-900 border-purple-300' },
    { id: 'bajak_laut', name: 'Bajak Laut', emoji: '🏴‍☠️', badgeClass: 'bg-slate-200 text-slate-800 border-slate-400' },
    { id: 'ninja', name: 'Ninja', emoji: '🥷', badgeClass: 'bg-zinc-800 text-white border-zinc-950' },
    { id: 'koboi', name: 'Koboi', emoji: '🤠', badgeClass: 'bg-amber-100 text-amber-900 border-amber-300' },
    { id: 'astronot', name: 'Astronot', emoji: '👨‍🚀', badgeClass: 'bg-sky-100 text-sky-900 border-sky-300' },
    { id: 'badut', name: 'Badut', emoji: '🤡', badgeClass: 'bg-red-100 text-red-900 border-red-300' },
    { id: 'hantu', name: 'Hantu', emoji: '👻', badgeClass: 'bg-slate-100 text-slate-700 border-slate-300' },
    { id: 'robot', name: 'Robot', emoji: '🤖', badgeClass: 'bg-cyan-100 text-cyan-900 border-cyan-300' },
    { id: 'dino', name: 'Dino', emoji: '🦖', badgeClass: 'bg-lime-100 text-lime-900 border-lime-300' },
    { id: 'peri', name: 'Peri', emoji: '🧚', badgeClass: 'bg-pink-100 text-pink-900 border-pink-300' },
    { id: 'detektif', name: 'Detektif', emoji: '🕵️', badgeClass: 'bg-stone-100 text-stone-900 border-stone-300' },
    { id: 'raja', name: 'Raja', emoji: '👑', badgeClass: 'bg-yellow-100 text-yellow-900 border-yellow-300' },
    { id: 'duyung', name: 'Putri Duyung', emoji: '🧜‍♀️', badgeClass: 'bg-teal-100 text-teal-900 border-teal-300' },
    { id: 'superhero', name: 'Superhero', emoji: '🦸', badgeClass: 'bg-blue-100 text-blue-900 border-blue-300' },
    { id: 'mumi', name: 'Mumi', emoji: '🩹', badgeClass: 'bg-orange-100 text-orange-900 border-orange-300' },
    { id: 'alien', name: 'Alien', emoji: '👽', badgeClass: 'bg-green-100 text-green-900 border-green-300' },
    { id: 'ksatria', name: 'Ksatria', emoji: '🛡️', badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
    { id: 'koki', name: 'Koki', emoji: '👨‍🍳', badgeClass: 'bg-neutral-100 text-neutral-800 border-neutral-300' }
  ];

  // 6 Colorful Party Rooms (2 Rows x 3 Columns Adjacent Grid)
  const ROOMS_DEF = {
    'red': {
      id: 'red',
      name: 'Ballroom Merah',
      colorName: 'Merah',
      headerBg: 'bg-rose-600 text-white',
      borderClass: 'border-rose-400',
      bgClass: 'bg-rose-50/60',
      tagColor: 'text-rose-700 bg-rose-100 border-rose-300',
      icon: 'music',
      row: 0,
      col: 0,
      adjacent: ['blue', 'green']
    },
    'blue': {
      id: 'blue',
      name: 'Perpustakaan Biru',
      colorName: 'Biru',
      headerBg: 'bg-sky-600 text-white',
      borderClass: 'border-sky-400',
      bgClass: 'bg-sky-50/60',
      tagColor: 'text-sky-700 bg-sky-100 border-sky-300',
      icon: 'book',
      row: 0,
      col: 1,
      adjacent: ['red', 'yellow', 'purple']
    },
    'yellow': {
      id: 'yellow',
      name: 'Dapur Kuning',
      colorName: 'Kuning',
      headerBg: 'bg-amber-500 text-amber-950',
      borderClass: 'border-amber-400',
      bgClass: 'bg-amber-50/60',
      tagColor: 'text-amber-800 bg-amber-100 border-amber-300',
      icon: 'coffee',
      row: 0,
      col: 2,
      adjacent: ['blue', 'orange']
    },
    'green': {
      id: 'green',
      name: 'Taman Belakang Hijau',
      colorName: 'Hijau',
      headerBg: 'bg-emerald-600 text-white',
      borderClass: 'border-emerald-400',
      bgClass: 'bg-emerald-50/60',
      tagColor: 'text-emerald-700 bg-emerald-100 border-emerald-300',
      icon: 'trees',
      row: 1,
      col: 0,
      adjacent: ['red', 'purple']
    },
    'purple': {
      id: 'purple',
      name: 'Ruang Biliar Ungu',
      colorName: 'Ungu',
      headerBg: 'bg-purple-600 text-white',
      borderClass: 'border-purple-400',
      bgClass: 'bg-purple-50/60',
      tagColor: 'text-purple-700 bg-purple-100 border-purple-300',
      icon: 'sparkles',
      row: 1,
      col: 1,
      adjacent: ['green', 'orange', 'blue']
    },
    'orange': {
      id: 'orange',
      name: 'Balkon Atap Oranye',
      colorName: 'Oranye',
      headerBg: 'bg-orange-500 text-white',
      borderClass: 'border-orange-400',
      bgClass: 'bg-orange-50/60',
      tagColor: 'text-orange-800 bg-orange-100 border-orange-300',
      icon: 'sun',
      row: 1,
      col: 2,
      adjacent: ['yellow', 'purple']
    }
  };

  /**
   * Helper: Get current game state with defensive normalization
   */
  function getGameState(roomData) {
    if (!roomData) return {};
    const state = roomData.costumeDetectiveGame || roomData.gameState?.costumeDetective || {};
    if (!Array.isArray(state.actionLogs)) state.actionLogs = [];
    if (!Array.isArray(state.turnOrder)) state.turnOrder = [];
    if (!state.boardCharacters || typeof state.boardCharacters !== 'object') state.boardCharacters = {};
    if (!state.playerSecrets || typeof state.playerSecrets !== 'object') state.playerSecrets = {};
    if (!state.diceState || typeof state.diceState !== 'object') state.diceState = {};
    return state;
  }

  /**
   * Main Render Entry Point
   */
  function render(appEl, roomData, playerData) {
    currentRoom = roomData;
    currentPlayer = playerData;

    if (!appEl || !currentRoom) return;

    // Aktifkan tema costume-detective
    UI.setTheme('costume-detective');

    const state = getGameState(currentRoom);
    const status = state.status || 'config';

    UI.Logger('COSTUME-DETECTIVE', `Rendering View [Status: ${status}]`, { turn: state.currentTurnPlayerId });

    if (status === 'config') {
      renderConfigView(appEl, state);
    } else if (status === 'game_over') {
      renderGameOverView(appEl, state);
    } else {
      renderPartyArena(appEl, state);
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

    const charactersPreviewHTML = CHARACTERS_LIST.map(c => `
      <div class="p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2">
        <span class="text-xl">${c.emoji}</span>
        <span class="font-display font-bold text-xs text-slate-800 truncate">${c.name}</span>
      </div>
    `).join('');

    const contentHTML = `
      <div class="max-w-4xl mx-auto py-4 space-y-6">
        <!-- Hero Header -->
        <div class="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-teal-950 via-slate-900 to-indigo-950 text-white shadow-xl border-2 border-teal-500/20 text-center relative overflow-hidden">
          <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-display font-bold mb-3 backdrop-blur-xs">
            <i data-lucide="glasses" class="w-4 h-4"></i>
            <span>Misteri Pesta Topeng 6 Ruangan</span>
          </div>
          <h2 class="font-display font-black text-2xl sm:text-4xl tracking-tight text-white">
            Costume Party Detective 🎭
          </h2>
          <p class="font-body text-xs sm:text-sm text-teal-100/80 mt-2 max-w-lg mx-auto leading-relaxed">
            Sembunyikan identitas kostummu di antara 20 tamu pesta! Gerakkan karakter secara misterius untuk mengecoh teman-temanmu di Voice Chat Discord, dan interogasi lawan hingga tersisa satu pemenang.
          </p>
        </div>

        <!-- 20 Characters Roster -->
        <div class="p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h4 class="font-display font-black text-sm text-slate-900 flex items-center gap-2">
              <i data-lucide="users" class="w-4 h-4 text-teal-600"></i>
              <span>Daftar 20 Karakter Tamu Pesta Kostum</span>
            </h4>
            <span class="text-xs font-display font-semibold text-slate-400">Setiap pemain dapat 1 kostum rahasia</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
            ${charactersPreviewHTML}
          </div>
        </div>

        <!-- 6 Rooms Preview -->
        <div class="p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm space-y-3">
          <h4 class="font-display font-black text-sm text-slate-900 flex items-center gap-2">
            <i data-lucide="layout-grid" class="w-4 h-4 text-teal-600"></i>
            <span>Denah 6 Ruangan Pesta (2 Baris x 3 Kolom)</span>
          </h4>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            ${Object.values(ROOMS_DEF).map(r => `
              <div class="p-3 rounded-2xl border-2 ${r.borderClass} ${r.bgClass} flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl ${r.headerBg} flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  <i data-lucide="${r.icon}" class="w-4 h-4"></i>
                </div>
                <div>
                  <span class="font-display font-black text-xs text-slate-900 block">${r.name}</span>
                  <span class="text-[10px] text-slate-500 font-body">Ruang Bersebelahan</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="pt-2 flex flex-col sm:flex-row items-center gap-3">
          ${isHost ? `
            <button 
              onclick="CostumeDetectiveGame.startGame()"
              class="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-display font-black text-base shadow-lg shadow-teal-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i data-lucide="play" class="w-5 h-5"></i>
              <span>Mulai Pesta Topeng & Sebar Kostum 🎭</span>
            </button>
          ` : `
            <div class="w-full p-4 rounded-2xl bg-teal-50 border border-teal-200 text-center">
              <p class="font-display font-bold text-sm text-teal-900 flex items-center justify-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping"></span>
                <span>Menunggu Host memulai pesta kostum...</span>
              </p>
            </div>
          `}
          <button 
            onclick="App.returnToLobby()"
            class="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-bold text-sm active:scale-95 transition-all cursor-pointer"
          >
            Kembali ke Lobby
          </button>
          <button 
            onclick="App.leaveCurrentGame()"
            class="w-full sm:w-auto px-6 py-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-display font-bold text-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <i data-lucide="log-out" class="w-4 h-4 text-rose-600"></i>
            <span>Keluar Game 🚪</span>
          </button>
        </div>
      </div>
    `;

    appEl.innerHTML = contentHTML;
  }

  /**
   * ==========================================================================
   * VIEW 2: PARTY ARENA (6 ROOMS GRID & DICE ACTIONS)
   * ==========================================================================
   */
  function renderPartyArena(appEl, state) {
    const isHost = currentPlayer && currentPlayer.isHost;
    const currentTurnId = state.currentTurnPlayerId;
    const isMyTurn = currentTurnId === currentPlayer.id;
    const turnOrder = state.turnOrder || [];
    const playerSecrets = state.playerSecrets || {};
    const boardCharacters = state.boardCharacters || {};
    const dice = state.diceState || {};
    const actionLogs = state.actionLogs || [];

    // My secret character
    const mySecretCharId = playerSecrets[currentPlayer.id];
    const mySecretChar = mySecretCharId ? boardCharacters[mySecretCharId] : null;
    const isMyCharAlive = mySecretChar?.isAlive;

    // Characters grouped by room
    const charactersByRoom = { red: [], blue: [], yellow: [], green: [], purple: [], orange: [] };
    Object.values(boardCharacters).forEach(c => {
      if (c.isAlive && charactersByRoom[c.roomId]) {
        charactersByRoom[c.roomId].push(c);
      }
    });

    // 1. TOP HEADER & SECRET CARD
    const secretCardHTML = mySecretChar ? `
      <div class="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 border-2 border-teal-400/40 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3.5">
          <div class="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-3xl shrink-0 shadow-md">
            <span>${mySecretChar.emoji}</span>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-teal-500/30 text-teal-300 border border-teal-400/40 text-[10px] font-display font-black tracking-wider uppercase">
                IDENTITAS KOSTUM RAHASIAMU
              </span>
              <span class="text-[10px] font-display font-bold px-2 py-0.5 rounded-full ${isMyCharAlive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}">
                ${isMyCharAlive ? '● HIDUP DI PESTA' : '✕ SUDAH TERELIMINASI'}
              </span>
            </div>
            <h3 class="font-display font-black text-xl text-white mt-1">
              ${mySecretChar.name}
            </h3>
            <p class="font-body text-xs text-teal-200/80">
              ${isMyCharAlive 
                ? 'Jaga kerahasiaanmu! Gerakkan pion kostum lain untuk mengecoh pengamatan lawan di Discord.' 
                : 'Karaktermu telah gugur, tetapi JANGAN BOCORKAN KEPADA SIAPAPUN! Tetaplah mengocok dadu dan bermain sampai akhir pesta.'}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <button 
            onclick="GameRules.open('costume-detective', 'lobby')"
            class="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-display font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
            <span>Aturan</span>
          </button>
          <button 
            onclick="App.leaveCurrentGame()" 
            class="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-400/30 font-display font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            title="Keluar dari Permainan"
          >
            <i data-lucide="log-out" class="w-3.5 h-3.5 text-rose-300"></i>
            <span>Keluar Game 🚪</span>
          </button>
        </div>
      </div>
    ` : '';

    // 2. TURN & DICE ACTION CONTROLLER BANNER
    let diceControllerHTML = '';
    const turnPlayer = currentRoom.players?.[currentTurnId];

    if (!dice.hasRolled) {
      // Waiting to roll dice
      diceControllerHTML = `
        <div class="p-5 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3 text-left">
            <div class="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-black shrink-0">
              <i data-lucide="dice-5" class="w-6 h-6"></i>
            </div>
            <div>
              <span class="text-[10px] font-display font-bold text-slate-400 uppercase tracking-wider block">
                GILIRAN AKTIF
              </span>
              <h4 class="font-display font-black text-base text-slate-900">
                ${isMyTurn ? 'Giliranmu Mengocok Dadu Aksi!' : `Giliran [${turnPlayer?.name || 'Pemain'}] Mengocok Dadu`}
              </h4>
              <p class="font-body text-xs text-slate-500">
                ${isMyTurn ? 'Kocok dadu untuk menentukan jenis gerakan atau interogasi di pesta.' : 'Menunggu pemain aktif mengocok dadu...'}
              </p>
            </div>
          </div>

          ${isMyTurn ? `
            <button 
              onclick="CostumeDetectiveGame.rollDice()"
              class="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-display font-black text-sm shadow-md shadow-teal-600/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 ${isRolling ? 'opacity-50 pointer-events-none' : ''}"
            >
              <i data-lucide="dice-5" class="w-5 h-5 ${isRolling ? 'animate-spin' : ''}"></i>
              <span>🎲 Kocok Dadu Aksi Sekarang</span>
            </button>
          ` : ''}
        </div>
      `;
    } else {
      // Dice has been rolled! Showing instructions
      let diceBadgeColor = 'bg-teal-600 text-white';
      if (dice.rollType === 'eliminate') diceBadgeColor = 'bg-rose-600 text-white';
      if (dice.rollType === 'pull_color') diceBadgeColor = 'bg-indigo-600 text-white';

      diceControllerHTML = `
        <div class="p-5 rounded-3xl bg-white border-2 border-teal-500 shadow-md space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div class="flex items-center gap-3">
              <div class="px-3.5 py-2 rounded-2xl ${diceBadgeColor} text-center font-display font-black text-xs shrink-0 shadow-sm">
                ${dice.label}
              </div>
              <div>
                <h4 class="font-display font-black text-base text-slate-900">${dice.description}</h4>
                <p class="font-body text-xs text-slate-500 mt-0.5">
                  ${isMyTurn ? '👇 Ikuti instruksi di bawah ini dengan mengklik karakter/ruangan di denah pesta:' : `Sedang dieksekusi oleh [${turnPlayer?.name || 'Pemain'}]...`}
                </p>
              </div>
            </div>

            ${isMyTurn ? `
              <div class="flex items-center gap-2">
                ${dice.rollType === 'eliminate' ? `
                  <button 
                    onclick="CostumeDetectiveGame.skipElimination()" 
                    class="px-3 py-1.5 rounded-xl text-xs font-display font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 transition-all cursor-pointer"
                    title="Lewati aksi jika tidak ingin mengeliminasi atau tidak ada target"
                  >
                    ⏭️ Lewati Eliminasi
                  </button>
                ` : ''}
                <button 
                  onclick="CostumeDetectiveGame.cancelSelection()" 
                  class="px-3 py-1.5 rounded-xl text-xs font-display font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all self-start sm:self-auto cursor-pointer"
                >
                  Reset Pilihan
                </button>
              </div>
            ` : ''}
          </div>

          <!-- Interactive Action Guidance -->
          ${isMyTurn ? `
            <div class="p-3 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-950 font-body flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <i data-lucide="help-circle" class="w-4 h-4 text-teal-600 shrink-0"></i>
                <span>
                  ${dice.rollType === 'move_free' 
                    ? (selectedCharacterId ? 'Sekarang klik salah satu RUANGAN SEBELAHNYA yang berkedip hijau untuk memindahkan karakter.' : 'Klik 1 Karakter mana saja di denah pesta untuk dipindahkan.')
                    : (dice.rollType === 'pull_color' 
                      ? `Klik 1 Karakter dari ruangan lain untuk ditarik masuk ke [${ROOMS_DEF[dice.targetRoomId]?.name}].` 
                      : 'Klik 1 Karakter di ruangan yang memiliki MINIMAL 2 TAMU untuk dieliminasi!')}
                </span>
              </div>
              ${selectedCharacterId ? `
                <span class="px-2 py-0.5 rounded-lg bg-teal-200 text-teal-900 font-display font-bold text-[11px] shrink-0">
                  Karakter Dipilih: ${boardCharacters[selectedCharacterId]?.name}
                </span>
              ` : ''}
            </div>
          ` : ''}
        </div>
      `;
    }

    // 3. THE 6 ROOMS GRID (2 ROWS x 3 COLUMNS)
    const selectedCharData = selectedCharacterId ? boardCharacters[selectedCharacterId] : null;

    const roomsHTML = Object.values(ROOMS_DEF).map(room => {
      const charsInRoom = charactersByRoom[room.id] || [];
      const hasMultiple = charsInRoom.length >= 2;

      // Check if this room can be clicked as a destination for move_free
      const isAdjacentToSelected = selectedCharData && room.adjacent.includes(selectedCharData.roomId);
      const isDestinationRoom = dice.rollType === 'move_free' && selectedCharacterId && isAdjacentToSelected;

      // Characters rendered inside room
      const charactersHTML = charsInRoom.map(c => {
        const isSelected = selectedCharacterId === c.id;
        const canBeEliminated = dice.rollType === 'eliminate' && hasMultiple;

        let charClickAction = '';
        if (isMyTurn && dice.hasRolled) {
          if (dice.rollType === 'move_free') {
            charClickAction = `onclick="CostumeDetectiveGame.selectCharacter('${c.id}')"`;
          } else if (dice.rollType === 'pull_color' && c.roomId !== dice.targetRoomId) {
            charClickAction = `onclick="CostumeDetectiveGame.pullCharacterToRoom('${c.id}', '${dice.targetRoomId}')"`;
          } else if (dice.rollType === 'eliminate' && canBeEliminated) {
            charClickAction = `onclick="CostumeDetectiveGame.eliminateCharacter('${c.id}')"`;
          }
        }

        const borderGlow = isSelected 
          ? 'ring-4 ring-teal-500 border-teal-600 scale-105 shadow-md' 
          : (canBeEliminated && isMyTurn ? 'hover:ring-4 hover:ring-rose-400 hover:border-rose-500 cursor-pointer animate-pulse' : 'hover:border-slate-400');

        return `
          <div 
            ${charClickAction}
            class="px-2.5 py-1.5 rounded-xl border-2 transition-all flex items-center gap-1.5 select-none ${c.badgeClass} ${borderGlow} ${isMyTurn ? 'cursor-pointer' : ''}"
            title="${c.name} (${room.name})"
          >
            <span class="text-base">${c.emoji}</span>
            <span class="font-display font-bold text-xs truncate max-w-[90px]">${c.name}</span>
          </div>
        `;
      }).join('');

      let roomClickAction = '';
      if (isDestinationRoom) {
        roomClickAction = `onclick="CostumeDetectiveGame.moveSelectedCharacterToRoom('${room.id}')"`;
      }

      const roomHighlightClass = isDestinationRoom 
        ? 'ring-4 ring-emerald-400 border-emerald-500 bg-emerald-50/90 shadow-lg cursor-pointer animate-pulse scale-101' 
        : (dice.rollType === 'pull_color' && dice.targetRoomId === room.id ? 'ring-4 ring-indigo-400 border-indigo-500 bg-indigo-50/80 shadow-md' : `${room.borderClass} ${room.bgClass}`);

      return `
        <div 
          ${roomClickAction}
          class="p-4 rounded-3xl border-2 transition-all duration-200 flex flex-col justify-between min-h-[190px] sm:min-h-[220px] ${roomHighlightClass}"
        >
          <!-- Room Header -->
          <div class="flex items-center justify-between border-b border-slate-900/5 pb-2 mb-2">
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-lg ${room.headerBg} flex items-center justify-center font-bold text-xs shadow-2xs">
                <i data-lucide="${room.icon}" class="w-3.5 h-3.5"></i>
              </div>
              <h5 class="font-display font-black text-xs sm:text-sm text-slate-900">${room.name}</h5>
            </div>

            <!-- Interrogation safety badge -->
            <span class="px-2 py-0.5 rounded-full text-[10px] font-display font-bold flex items-center gap-1 ${hasMultiple ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'}" title="${hasMultiple ? 'Bisa dieliminasi karena ada minimal 2 karakter' : 'Aman! Tidak bisa dieliminasi karena sendirian'}">
              ${hasMultiple ? '👥 2+ Tamu' : '🛡️ Aman'}
            </span>
          </div>

          <!-- Characters Container -->
          <div class="flex-1 flex flex-wrap content-start gap-1.5 py-1">
            ${charactersHTML.length > 0 ? charactersHTML : '<span class="text-xs text-slate-400 italic my-auto mx-auto font-body">Ruangan Kosong</span>'}
          </div>

          <!-- Bottom Room Indicator -->
          <div class="pt-2 border-t border-slate-900/5 flex items-center justify-between text-[10px] text-slate-500 font-display font-semibold">
            <span>${charsInRoom.length} Tamu Kostum</span>
            ${isDestinationRoom ? '<span class="text-emerald-700 font-black animate-bounce">👉 Klik untuk Pindah ke Sini!</span>' : ''}
          </div>
        </div>
      `;
    }).join('');

    // 4. ACTION LOGS
    const logItemsHTML = actionLogs.slice(-6).reverse().map(l => `
      <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-body text-slate-700 leading-snug flex items-start gap-2">
        <span class="text-teal-600 font-bold shrink-0 mt-0.5">•</span>
        <span>${l.text}</span>
      </div>
    `).join('');

    const contentHTML = `
      <div class="w-full max-w-5xl mx-auto py-3 space-y-6">
        <!-- Top Secret Hand -->
        ${secretCardHTML}

        <!-- Dice Controller -->
        ${diceControllerHTML}

        <!-- 6 Rooms Grid: 2 Rows x 3 Columns -->
        <div>
          <div class="flex items-center justify-between mb-2.5 px-1">
            <div class="flex items-center gap-2">
              <i data-lucide="layout-grid" class="w-4 h-4 text-teal-600"></i>
              <span class="font-display font-bold text-xs text-slate-700 uppercase tracking-wider">
                Denah Pesta Topeng (6 Ruangan Bersebelahan):
              </span>
            </div>
            <span class="text-xs font-body text-slate-400">
              ${Object.values(boardCharacters).filter(c => c.isAlive).length} / 20 Karakter Masih Berpesta
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            ${roomsHTML}
          </div>
        </div>

        <!-- Action History Log -->
        <div class="p-4 sm:p-5 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm space-y-2">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2">
            <h5 class="font-display font-bold text-xs text-slate-800 flex items-center gap-1.5">
              <i data-lucide="history" class="w-3.5 h-3.5 text-slate-500"></i>
              <span>Riwayat Gerakan & Interogasi Pesta</span>
            </h5>
            <span class="text-[10px] text-slate-400 font-body">Real-Time Mystery Log</span>
          </div>
          <div class="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            ${logItemsHTML.length > 0 ? logItemsHTML : '<p class="text-xs text-slate-400 italic">Belum ada pergerakan karakter.</p>'}
          </div>
        </div>
      </div>
    `;

    appEl.innerHTML = contentHTML;
  }

  /**
   * ==========================================================================
   * VIEW 3: GAME OVER & GRAND REVEAL MODAL
   * ==========================================================================
   */
  function renderGameOverView(appEl, state) {
    const isHost = currentPlayer && currentPlayer.isHost;
    const winnerPlayerId = state.winnerPlayerId;
    const winnerPlayer = currentRoom.players?.[winnerPlayerId];
    const playerSecrets = state.playerSecrets || {};
    const boardCharacters = state.boardCharacters || {};

    const revealCardsHTML = Object.entries(playerSecrets).map(([pid, charId]) => {
      const p = currentRoom.players?.[pid];
      const char = boardCharacters[charId];
      const isWinner = pid === winnerPlayerId;

      return `
        <div class="p-4 rounded-2xl border-2 flex items-center justify-between gap-3 ${isWinner ? 'border-amber-400 bg-amber-50 shadow-md ring-4 ring-amber-400/20' : 'border-slate-200 bg-white shadow-2xs'}">
          <div class="flex items-center gap-3 min-w-0">
            ${UI.Avatar({ name: p?.name || 'Pemain', size: 'md' })}
            <div>
              <span class="font-display font-bold text-xs text-slate-900 block truncate">${p?.name || 'Pemain'}</span>
              <span class="text-[10px] font-bold ${char?.isAlive ? 'text-emerald-700' : 'text-slate-400'}">
                ${char?.isAlive ? '● Bertahan Hidup' : '✕ Tereliminasi'}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-2xl">${char?.emoji || '🎭'}</span>
            <div class="text-right">
              <span class="font-display font-black text-xs text-slate-900 block">${char?.name || 'Kostum'}</span>
              ${isWinner ? '<span class="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black uppercase">JUARA PESTA 👑</span>' : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    const contentHTML = `
      <div class="max-w-2xl mx-auto py-8 text-center space-y-6">
        <!-- Victory Announcement -->
        <div class="p-8 rounded-3xl bg-gradient-to-br from-teal-600 via-teal-700 to-indigo-800 text-white shadow-2xl border-4 border-teal-300/40 space-y-3">
          <span class="text-5xl block animate-bounce">🏆</span>
          <h2 class="font-display font-black text-3xl sm:text-4xl tracking-tight">
            ${winnerPlayer ? `Detektif [${winnerPlayer.name}] Menang!` : 'Pesta Kostum Telah Berakhir!'}
          </h2>
          <p class="font-body text-xs sm:text-sm text-teal-100 max-w-sm mx-auto leading-relaxed">
            Karakter rahasianya berhasil menjadi yang terakhir bertahan di pesta tanpa tertebak oleh para detektif lainnya!
          </p>
        </div>

        <!-- Grand Reveal Table -->
        <div class="p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm text-left space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h4 class="font-display font-black text-sm text-slate-900 flex items-center gap-2">
              <i data-lucide="eye" class="w-4 h-4 text-teal-600"></i>
              <span>Pengungkapan Identitas Seluruh Detektif (Grand Reveal)</span>
            </h4>
            <span class="text-xs font-display font-semibold text-slate-400">Pesta Selesai</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${revealCardsHTML}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          ${isHost ? `
            <button 
              onclick="CostumeDetectiveGame.startGame()"
              class="w-full sm:w-auto px-6 py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-display font-black text-sm shadow-lg shadow-teal-600/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
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

          <button 
            onclick="App.leaveCurrentGame()"
            class="w-full sm:w-auto px-6 py-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-display font-bold text-sm active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <i data-lucide="log-out" class="w-4 h-4 text-rose-600"></i>
            <span>Keluar Game 🚪</span>
          </button>
        </div>
      </div>
    `;

    appEl.innerHTML = contentHTML;
  }

  /**
   * ==========================================================================
   * ACTIONS & DISPATCHERS
   * ==========================================================================
   */

  /**
   * 1. Start Costume Party Game (Host Only)
   */
  async function startGame() {
    if (!currentRoom || !currentPlayer?.isHost || isSubmitting) return;
    isSubmitting = true;
    try {
      UI.Sound.click();

      const playerList = Object.values(currentRoom.players || {});
      if (playerList.length < 2) {
        UI.Toast('Minimal 2 pemain untuk memulai Costume Party Detective!', 'warning');
        return;
      }

      // Shuffle characters and distribute to 6 rooms evenly
      const roomKeys = ['red', 'blue', 'yellow', 'green', 'purple', 'orange'];
      const shuffledChars = [...CHARACTERS_LIST].sort(() => 0.5 - Math.random());

      const boardCharacters = {};
      shuffledChars.forEach((c, idx) => {
        const roomIndex = idx % 6;
        boardCharacters[c.id] = {
          id: c.id,
          name: c.name,
          emoji: c.emoji,
          badgeClass: c.badgeClass,
          roomId: roomKeys[roomIndex],
          isAlive: true
        };
      });

      // Deal 1 secret character to each player from the 20
      const playerSecrets = {};
      playerList.forEach((p, idx) => {
        playerSecrets[p.id] = shuffledChars[idx].id;
      });

      const turnOrder = playerList.map(p => p.id).sort(() => 0.5 - Math.random());

      await DB.updateGameState(currentRoom.code, 'costumeDetective', {
        status: 'playing',
        turnOrder: turnOrder,
        turnIndex: 0,
        currentTurnPlayerId: turnOrder[0],
        playerSecrets: playerSecrets,
        boardCharacters: boardCharacters,
        diceState: {
          hasRolled: false,
          rollType: null,
          targetRoomId: null,
          label: '',
          description: ''
        },
        actionLogs: [
          { text: `Pesta topeng dimulai! 20 karakter berkostum telah disebar ke 6 ruangan.`, timestamp: Date.now() }
        ],
        winnerPlayerId: null
      });

      UI.Toast('Pesta dimulai! 1 karakter rahasia telah dibagikan ke masing-masing pemain.', 'success');
    } catch (err) {
      UI.Logger('COSTUME-DETECTIVE', 'Error starting game:', err, true);
      UI.Toast('Gagal memulai Costume Party Detective: ' + (err.message || err), 'error');
    } finally {
      isSubmitting = false;
    }
  }

  /**
   * 2. Roll Action Dice
   */
  async function rollDice() {
    if (!currentRoom || !currentPlayer || isRolling || isSubmitting) return;
    const state = getGameState(currentRoom);
    if (state.currentTurnPlayerId !== currentPlayer.id) return;
    if (state.diceState?.hasRolled) return;

    isRolling = true;
    try {
      UI.Sound.pop();

      // 6 Possible Dice Outcomes:
      // 1: Free Move
      // 2-5: Pull to Specific Room Color (Red, Blue, Yellow, or random from Green/Purple/Orange)
      // 6: Eliminate (Interrogate)
      const rollNumber = Math.floor(Math.random() * 6) + 1;
      let rollType = 'move_free';
      let targetRoomId = null;
      let label = '';
      let description = '';

      const roomKeys = ['red', 'blue', 'yellow', 'green', 'purple', 'orange'];

      if (rollNumber === 1 || rollNumber === 2) {
        rollType = 'move_free';
        label = '🏃 PINDAH BEBAS';
        description = 'Pilih 1 karakter mana saja di papan, lalu klik ruangan sebelahnya untuk memindahkannya!';
      } else if (rollNumber >= 3 && rollNumber <= 5) {
        rollType = 'pull_color';
        targetRoomId = roomKeys[Math.floor(Math.random() * roomKeys.length)];
        const r = ROOMS_DEF[targetRoomId];
        label = `🔴🟡🔵 TARIK KE ${r.name.toUpperCase()}`;
        description = `Tarik 1 karakter dari ruangan mana saja untuk masuk ke [${r.name}]!`;
      } else {
        // Check if any room has >= 2 characters to eliminate (anti soft-lock)
        const livingChars = Object.values(state.boardCharacters || {}).filter(c => c.isAlive);
        const roomCounts = {};
        livingChars.forEach(c => {
          roomCounts[c.roomId] = (roomCounts[c.roomId] || 0) + 1;
        });
        const hasEligibleRoom = Object.values(roomCounts).some(cnt => cnt >= 2);

        if (!hasEligibleRoom) {
          rollType = 'move_free';
          label = '🏃 PINDAH BEBAS (ANTI SOFT-LOCK)';
          description = 'Seluruh tamu pesta berdiri sendirian di ruangan! Dadu dialihkan menjadi Pindah Bebas.';
        } else {
          rollType = 'eliminate';
          label = '💀 ELIMINASI (INTEROGASI)';
          description = 'Pilih 1 karakter di ruangan yang berisi minimal 2 tamu untuk dieliminasi dari pesta!';
        }
      }

      const actionLogs = [...(state.actionLogs || [])];
      actionLogs.push({
        text: `🎲 [${currentPlayer.name}] mengocok dadu dan mendapatkan hasil: "${label}".`,
        timestamp: Date.now()
      });

      await DB.updateGameState(currentRoom.code, 'costumeDetective', {
        actionLogs,
        diceState: {
          hasRolled: true,
          rollType,
          targetRoomId,
          label,
          description
        }
      });

      selectedCharacterId = null;
    } catch (err) {
      UI.Logger('COSTUME-DETECTIVE', 'Error rolling dice:', err, true);
      UI.Toast('Gagal mengocok dadu: ' + (err.message || err), 'error');
    } finally {
      isRolling = false;
    }
  }

  function selectCharacter(charId) {
    selectedCharacterId = charId;
    UI.Sound.pop();
    render(document.getElementById('app'), currentRoom, currentPlayer);
  }

  function cancelSelection() {
    selectedCharacterId = null;
    UI.Sound.click();
    render(document.getElementById('app'), currentRoom, currentPlayer);
  }

  /**
   * 3. Move Free: Move selected character to adjacent room
   */
  async function moveSelectedCharacterToRoom(destinationRoomId) {
    if (!currentRoom || !currentPlayer || !selectedCharacterId || isSubmitting) return;
    const state = getGameState(currentRoom);
    if (state.currentTurnPlayerId !== currentPlayer.id) return;

    isSubmitting = true;
    try {
      UI.Sound.click();

      const boardCharacters = { ...state.boardCharacters };
      const char = boardCharacters[selectedCharacterId];
      if (!char) return;
      const prevRoomName = ROOMS_DEF[char.roomId]?.name;
      const destRoomName = ROOMS_DEF[destinationRoomId]?.name;

      char.roomId = destinationRoomId;

      const actionLogs = [...(state.actionLogs || [])];
      actionLogs.push({
        text: `[${currentPlayer.name}] memindahkan [${char.emoji} ${char.name}] dari ${prevRoomName} ke ${destRoomName}.`,
        timestamp: Date.now()
      });

      const nextTurnData = getNextTurnData(state.turnOrder, state.turnIndex);

      await DB.updateGameState(currentRoom.code, 'costumeDetective', {
        boardCharacters,
        actionLogs,
        currentTurnPlayerId: nextTurnData.playerId,
        turnIndex: nextTurnData.index,
        diceState: { hasRolled: false }
      });

      selectedCharacterId = null;
    } catch (err) {
      UI.Logger('COSTUME-DETECTIVE', 'Error moving character:', err, true);
      UI.Toast('Gagal memindahkan karakter: ' + (err.message || err), 'error');
    } finally {
      isSubmitting = false;
    }
  }

  /**
   * 4. Pull to Color Room: Pull character into target room
   */
  async function pullCharacterToRoom(charId, targetRoomId) {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    const state = getGameState(currentRoom);
    if (state.currentTurnPlayerId !== currentPlayer.id) return;

    isSubmitting = true;
    try {
      UI.Sound.click();

      const boardCharacters = { ...state.boardCharacters };
      const char = boardCharacters[charId];
      if (!char) return;
      const targetRoomName = ROOMS_DEF[targetRoomId]?.name;

      char.roomId = targetRoomId;

      const actionLogs = [...(state.actionLogs || [])];
      actionLogs.push({
        text: `[${currentPlayer.name}] menarik [${char.emoji} ${char.name}] masuk ke ${targetRoomName}.`,
        timestamp: Date.now()
      });

      const nextTurnData = getNextTurnData(state.turnOrder, state.turnIndex);

      await DB.updateGameState(currentRoom.code, 'costumeDetective', {
        boardCharacters,
        actionLogs,
        currentTurnPlayerId: nextTurnData.playerId,
        turnIndex: nextTurnData.index,
        diceState: { hasRolled: false }
      });

      selectedCharacterId = null;
    } catch (err) {
      UI.Logger('COSTUME-DETECTIVE', 'Error pulling character:', err, true);
      UI.Toast('Gagal menarik karakter: ' + (err.message || err), 'error');
    } finally {
      isSubmitting = false;
    }
  }

  /**
   * 5. Eliminate Character in room with >= 2 characters
   */
  async function eliminateCharacter(charId) {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    const state = getGameState(currentRoom);
    if (state.currentTurnPlayerId !== currentPlayer.id) return;

    const boardCharacters = { ...state.boardCharacters };
    const char = boardCharacters[charId];
    if (!char || !char.isAlive) return;

    // Protection rule: character standing alone in a room cannot be eliminated!
    const charsInSameRoom = Object.values(boardCharacters).filter(c => c.isAlive && c.roomId === char.roomId);
    if (charsInSameRoom.length < 2) {
      UI.Toast('Karakter yang sendirian di dalam ruangan aman dan tidak bisa dieliminasi!', 'warning');
      return;
    }

    isSubmitting = true;
    try {
      UI.Sound.gong();

      char.isAlive = false;

      const roomName = ROOMS_DEF[char.roomId]?.name;
      const actionLogs = [...(state.actionLogs || [])];
      actionLogs.push({
        text: `💥 [${currentPlayer.name}] menginterogasi dan MENGELIMINASI [${char.emoji} ${char.name}] di ${roomName}!`,
        timestamp: Date.now()
      });

      // Check Win Condition
      const winResult = checkVictory(state.playerSecrets, boardCharacters);

      if (winResult.gameOver) {
        await DB.updateGameState(currentRoom.code, 'costumeDetective', {
          boardCharacters,
          actionLogs,
          status: 'game_over',
          winnerPlayerId: winResult.winnerPlayerId,
          winnerCharacterId: winResult.winnerCharacterId,
          diceState: { hasRolled: false }
        });
      } else {
        const nextTurnData = getNextTurnData(state.turnOrder, state.turnIndex);
        await DB.updateGameState(currentRoom.code, 'costumeDetective', {
          boardCharacters,
          actionLogs,
          currentTurnPlayerId: nextTurnData.playerId,
          turnIndex: nextTurnData.index,
          diceState: { hasRolled: false }
        });
      }

      selectedCharacterId = null;
    } catch (err) {
      UI.Logger('COSTUME-DETECTIVE', 'Error eliminating character:', err, true);
      UI.Toast('Gagal mengeliminasi karakter: ' + (err.message || err), 'error');
    } finally {
      isSubmitting = false;
    }
  }

  /**
   * Skip elimination turn if player chooses not to or can't eliminate
   */
  async function skipElimination() {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    const state = getGameState(currentRoom);
    if (state.currentTurnPlayerId !== currentPlayer.id) return;

    isSubmitting = true;
    try {
      UI.Sound.click();

      const actionLogs = [...(state.actionLogs || [])];
      actionLogs.push({
        text: `⏭️ [${currentPlayer.name}] melewati giliran eliminasi.`,
        timestamp: Date.now()
      });

      const nextTurnData = getNextTurnData(state.turnOrder, state.turnIndex);
      await DB.updateGameState(currentRoom.code, 'costumeDetective', {
        actionLogs,
        currentTurnPlayerId: nextTurnData.playerId,
        turnIndex: nextTurnData.index,
        diceState: { hasRolled: false }
      });

      selectedCharacterId = null;
    } catch (err) {
      UI.Logger('COSTUME-DETECTIVE', 'Error skipping elimination:', err, true);
    } finally {
      isSubmitting = false;
    }
  }

  /**
   * Helper: Check Victory Condition
   * a) Only 1 Character alive on the entire board, OR
   * b) Only 1 Player-owned Character alive on the board!
   */
  function checkVictory(playerSecrets, boardCharacters) {
    const allLivingChars = Object.values(boardCharacters).filter(c => c.isAlive);

    // Rule A: Exactly 1 character left overall
    if (allLivingChars.length === 1) {
      const lastCharId = allLivingChars[0].id;
      const ownerEntry = Object.entries(playerSecrets).find(([pid, cid]) => cid === lastCharId);
      return {
        gameOver: true,
        winnerPlayerId: ownerEntry ? ownerEntry[0] : null,
        winnerCharacterId: lastCharId
      };
    }

    // Rule B: Exactly 1 player-owned character alive!
    const livingPlayerEntries = Object.entries(playerSecrets).filter(([pid, cid]) => boardCharacters[cid]?.isAlive);
    if (livingPlayerEntries.length === 1) {
      return {
        gameOver: true,
        winnerPlayerId: livingPlayerEntries[0][0],
        winnerCharacterId: livingPlayerEntries[0][1]
      };
    }

    if (livingPlayerEntries.length === 0) {
      return {
        gameOver: true,
        winnerPlayerId: null,
        winnerCharacterId: null
      };
    }

    return { gameOver: false };
  }

  /**
   * Helper: Get next player's turn in rotation
   */
  function getNextTurnData(turnOrder, currentTurnIndex) {
    const total = turnOrder.length;
    const nextIndex = (currentTurnIndex + 1) % total;
    return { index: nextIndex, playerId: turnOrder[nextIndex] };
  }

  function cleanup() {
    selectedCharacterId = null;
    isRolling = false;
    isSubmitting = false;
    UI.Logger('COSTUME-DETECTIVE', 'Cleaned up CostumeDetectiveGame state');
  }

  return {
    init: () => {},
    render,
    onStateChange: (roomData) => {
      currentRoom = roomData;
      const state = getGameState(roomData);
      if (state.winnerPlayerId) {
        UI.Confetti();
        UI.Sound.fanfare();
      }
    },
    startGame,
    rollDice,
    selectCharacter,
    cancelSelection,
    moveSelectedCharacterToRoom,
    pullCharacterToRoom,
    eliminateCharacter,
    skipElimination,
    cleanup
  };
})();

if (typeof window !== 'undefined') {
  window.CostumeDetectiveGame = CostumeDetectiveGame;
}
