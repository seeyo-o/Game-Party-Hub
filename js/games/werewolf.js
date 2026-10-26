/**
 * ==========================================================================
 * DISCORD PARTY HUB - GAME 4: "WEREWOLF (AUTOMATED MODERATOR)"
 * ==========================================================================
 * Permainan deduksi sosial malam & siang tanpa perlu moderator manual.
 * Menggunakan Firebase Realtime Database: rooms/{roomCode}/werewolfGame
 * Tema: Soft Lavender Dusk (#F3F1FF), Indigo Night (#4F46E5), Moon Amber (#F59E0B).
 */

const WerewolfGame = (function () {
  'use strict';

  // Module State
  let currentRoom = null;
  let currentPlayer = null;
  let isCardFlipped = false;
  let localNightSelection = null;
  let localDayVoteSelection = null;
  let localSeerInspectionResult = null;
  let isSubmitting = false;

  // Definitions for all Werewolf Roles
  const ROLES_DEF = {
    'werewolf': {
      id: 'werewolf',
      name: 'Werewolf (Serigala)',
      team: 'werewolf',
      teamName: 'Tim Serigala',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      icon: 'moon',
      iconBg: 'bg-rose-600',
      glowColor: 'ring-rose-500/30',
      description: 'Bangun di malam hari bersama rekan sesama serigala untuk memangsa 1 warga desa. Di siang hari, menyamarlah sebagai warga jujur agar tidak dicurigai.',
      guide: 'Pilihlah target mangsa bersama rekan serigalamu secara cermat. Di siang hari, cobalah memecah belah opini para warga desa!'
    },
    'seer': {
      id: 'seer',
      name: 'Seer (Penerawang)',
      team: 'villager',
      teamName: 'Tim Warga Desa',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
      icon: 'eye',
      iconBg: 'bg-purple-600',
      glowColor: 'ring-purple-500/30',
      description: 'Setiap malam dapat menerawang 1 pemain untuk melihat apakah ia Werewolf atau Warga Baik.',
      guide: 'Informasimu sangat berharga! Bimbing warga desa saat voting siang, namun berhati-hatilah agar serigala tidak mengincarmu di malam berikutnya.'
    },
    'doctor': {
      id: 'doctor',
      name: 'Doctor (Pelindung)',
      team: 'villager',
      teamName: 'Tim Warga Desa',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      icon: 'shield',
      iconBg: 'bg-emerald-600',
      glowColor: 'ring-emerald-500/30',
      description: 'Setiap malam dapat melindungi 1 pemain dari serangan Werewolf. Tidak boleh melindungi orang yang sama 2 malam berturut-turut!',
      guide: 'Tebak siapa yang paling mungkin diincar oleh Werewolf malam ini. Jika tebakanmu tepat, tidak ada korban yang tewas di pagi hari!'
    },
    'hunter': {
      id: 'hunter',
      name: 'Hunter (Pemburu)',
      team: 'villager',
      teamName: 'Tim Warga Desa',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: 'crosshair',
      iconBg: 'bg-amber-600',
      glowColor: 'ring-amber-500/30',
      description: 'Jika kamu terbunuh (dimangsa serigala malam hari atau digantung warga di siang hari), kamu berhak langsung menembak mati 1 pemain pilihanmu!',
      guide: 'Simpan pelurumu untuk target yang paling mencurigakan. Jangan sampai salah menembak rekan sesama warga desa!'
    },
    'villager': {
      id: 'villager',
      name: 'Villager (Warga Desa)',
      team: 'villager',
      teamName: 'Tim Warga Desa',
      badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      icon: 'users',
      iconBg: 'bg-indigo-600',
      glowColor: 'ring-indigo-500/30',
      description: 'Warga desa biasa tanpa kekuatan supranatural di malam hari. Di siang hari, gunakan logika dan analisa suara di Discord untuk menggantung Werewolf!',
      guide: 'Perhatikan kejanggalan dalam suara atau alibi teman-temanmu di Voice Chat. Kekuatan utamamu adalah suara voting mayoritas!'
    }
  };

  /**
   * Helper: Get current Werewolf Game State from room with defensive normalization
   */
  function getGameState(roomData) {
    if (!roomData) return {};
    const state = roomData.werewolfGame || roomData.gameState?.werewolf || {};
    if (!state.playerRoles || typeof state.playerRoles !== 'object') state.playerRoles = {};
    if (!state.nightActions || typeof state.nightActions !== 'object') state.nightActions = {};
    if (!state.dayVotes || typeof state.dayVotes !== 'object') state.dayVotes = {};
    if (!Array.isArray(state.actionLogs)) state.actionLogs = [];
    return state;
  }

  /**
   * Role Distribution Engine (Supports 4 to 15+ Players)
   */
  function distributeRoles(playerList) {
    const count = playerList.length;
    let rolesPool = [];

    if (count <= 3) {
      // Testing mode for small rooms
      rolesPool = ['werewolf', 'seer', 'villager'].slice(0, count);
    } else if (count === 4) {
      rolesPool = ['werewolf', 'seer', 'doctor', 'villager'];
    } else if (count === 5) {
      rolesPool = ['werewolf', 'seer', 'doctor', 'villager', 'villager'];
    } else if (count >= 6 && count <= 8) {
      // 6-8 Players: 2 Werewolves, 1 Seer, 1 Doctor, 1 Hunter, rest Villagers
      rolesPool = ['werewolf', 'werewolf', 'seer', 'doctor', 'hunter'];
      while (rolesPool.length < count) {
        rolesPool.push('villager');
      }
    } else if (count >= 9 && count <= 11) {
      // 9-11 Players: 3 Werewolves, 1 Seer, 1 Doctor, 1 Hunter, rest Villagers
      rolesPool = ['werewolf', 'werewolf', 'werewolf', 'seer', 'doctor', 'hunter'];
      while (rolesPool.length < count) {
        rolesPool.push('villager');
      }
    } else {
      // 12+ Players: 4 Werewolves, 1 Seer, 1 Doctor, 1 Hunter, rest Villagers
      rolesPool = ['werewolf', 'werewolf', 'werewolf', 'werewolf', 'seer', 'doctor', 'hunter'];
      while (rolesPool.length < count) {
        rolesPool.push('villager');
      }
    }

    // Shuffle roles randomly
    const shuffledRoles = [...rolesPool].sort(() => 0.5 - Math.random());

    const playerRoles = {};
    playerList.forEach((player, idx) => {
      const assignedRole = shuffledRoles[idx] || 'villager';
      playerRoles[player.id] = {
        id: player.id,
        name: player.name,
        role: assignedRole,
        isAlive: true,
        ready: false,
        colorIndex: player.colorIndex || idx
      };
    });

    return playerRoles;
  }

  /**
   * Check Win Condition:
   * - Villagers win if all werewolves are dead.
   * - Werewolves win if living werewolves >= living non-werewolves.
   */
  function checkWinCondition(playerRoles) {
    if (!playerRoles) return null;
    const living = Object.values(playerRoles).filter(p => p.isAlive);
    const livingWerewolves = living.filter(p => p.role === 'werewolf').length;
    const livingGood = living.filter(p => p.role !== 'werewolf').length;

    if (livingWerewolves === 0) {
      return 'villagers';
    }
    if (livingWerewolves >= livingGood) {
      return 'werewolves';
    }
    return null;
  }

  /**
   * Main Render Entry Point
   */
  function render(appEl, roomData, playerData) {
    currentRoom = roomData;
    currentPlayer = playerData;

    if (!appEl || !currentRoom) return;

    // Pastikan tema werewolf aktif
    UI.setTheme('werewolf');

    const state = getGameState(currentRoom);
    const status = state.status || 'config';

    UI.Logger('WEREWOLF', `Rendering Werewolf View [Status: ${status}]`, { round: state.round });

    switch (status) {
      case 'config':
        renderConfigView(appEl, state);
        break;
      case 'role_reveal':
        renderRoleRevealView(appEl, state);
        break;
      case 'night':
        renderNightView(appEl, state);
        break;
      case 'day_announcement':
        renderDayAnnouncementView(appEl, state);
        break;
      case 'day_voting':
        renderDayVotingView(appEl, state);
        break;
      case 'hunter_revenge':
        renderHunterRevengeView(appEl, state);
        break;
      case 'game_over':
        renderGameOverView(appEl, state);
        break;
      default:
        renderConfigView(appEl, state);
    }

    UI.refreshIcons();
  }

  /**
   * ==========================================================================
   * VIEW 1: CONFIG & PRE-GAME SETUP
   * ==========================================================================
   */
  function renderConfigView(appEl, state) {
    const isHost = currentPlayer && currentPlayer.isHost;
    const playerList = Object.values(currentRoom.players || {});
    const playerCount = playerList.length;

    // Role Preview Distribution Badges
    let werewolfCount = 1;
    if (playerCount >= 6 && playerCount <= 8) werewolfCount = 2;
    else if (playerCount >= 9 && playerCount <= 11) werewolfCount = 3;
    else if (playerCount >= 12) werewolfCount = 4;

    const hasHunter = playerCount >= 6;
    const villagerCount = Math.max(0, playerCount - (werewolfCount + 2 + (hasHunter ? 1 : 0)));

    const playersGridHTML = playerList.map((p, idx) => `
      <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-2.5">
        ${UI.Avatar({ name: p.name, size: 'sm', isHost: p.isHost, colorIndex: p.colorIndex || idx })}
        <span class="font-display font-bold text-xs text-slate-800 truncate">${p.name}</span>
        ${p.id === currentPlayer.id ? '<span class="ml-auto text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">KAMU</span>' : ''}
      </div>
    `).join('');

    const contentHTML = `
      <div class="max-w-2xl mx-auto space-y-6">
        <!-- Hero Header -->
        <div class="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white shadow-xl border-2 border-indigo-500/20 text-center relative overflow-hidden">
          <div class="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
            <i data-lucide="moon" class="w-64 h-64 text-indigo-300"></i>
          </div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-display font-bold mb-3 backdrop-blur-xs">
            <i data-lucide="sparkles" class="w-3.5 h-3.5 text-amber-300"></i>
            <span>Moderator Otomatis • Tanpa Narator Manual</span>
          </div>
          <h2 class="font-display font-black text-2xl sm:text-3xl tracking-tight text-white">
            Werewolf: Dusk of Deception 🐺
          </h2>
          <p class="font-body text-xs sm:text-sm text-indigo-200/80 mt-2 max-w-lg mx-auto leading-relaxed">
            Semua pemain dapat ikut bermain secara adil tanpa ada yang harus berkorban menjadi moderator! Aplikasi web akan mengatur giliran malam dan siang secara rahasia.
          </p>
        </div>

        <!-- Role Preview Composition -->
        <div class="p-5 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2">
              <i data-lucide="shield" class="w-4 h-4 text-indigo-600"></i>
              <h4 class="font-display font-bold text-sm text-slate-800">Distribusi Peran Otomatis (${playerCount} Pemain)</h4>
            </div>
            <button 
              onclick="GameRules.open('werewolf', 'lobby')"
              class="text-xs font-display font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            >
              <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
              <span>Panduan Peran</span>
            </button>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div class="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-center">
              <span class="block text-lg">🐺</span>
              <span class="font-display font-bold text-xs text-rose-900 block mt-1">Werewolf</span>
              <span class="text-[11px] font-display font-extrabold text-rose-600">${werewolfCount} Orang</span>
            </div>
            <div class="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-center">
              <span class="block text-lg">🔮</span>
              <span class="font-display font-bold text-xs text-purple-900 block mt-1">Seer</span>
              <span class="text-[11px] font-display font-extrabold text-purple-600">1 Orang</span>
            </div>
            <div class="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <span class="block text-lg">💉</span>
              <span class="font-display font-bold text-xs text-emerald-900 block mt-1">Doctor</span>
              <span class="text-[11px] font-display font-extrabold text-emerald-600">1 Orang</span>
            </div>
            ${hasHunter ? `
              <div class="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <span class="block text-lg">🏹</span>
                <span class="font-display font-bold text-xs text-amber-900 block mt-1">Hunter</span>
                <span class="text-[11px] font-display font-extrabold text-amber-600">1 Orang</span>
              </div>
            ` : `
              <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center opacity-60" title="Hunter aktif jika minimal 6 pemain">
                <span class="block text-lg">🏹</span>
                <span class="font-display font-bold text-xs text-slate-700 block mt-1">Hunter</span>
                <span class="text-[10px] text-slate-500">Min 6 Pemain</span>
              </div>
            `}
          </div>

          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-body text-slate-600 flex items-center justify-between">
            <span>Sisa Warga Desa (Villagers):</span>
            <span class="font-display font-bold text-slate-800">${villagerCount} Orang</span>
          </div>
        </div>

        <!-- Players Joined -->
        <div class="p-5 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm space-y-3">
          <div class="flex items-center justify-between">
            <h4 class="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
              <i data-lucide="users" class="w-4 h-4 text-indigo-600"></i>
              <span>Pemain di Ruangan (${playerCount})</span>
            </h4>
            ${playerCount < 4 ? '<span class="text-[11px] font-display font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Disarankan Min. 4 Pemain</span>' : ''}
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            ${playersGridHTML}
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="pt-2 flex flex-col sm:flex-row items-center gap-3">
          ${isHost ? `
            <button 
              onclick="WerewolfGame.startGame()"
              class="w-full sm:flex-1 py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-display font-black text-base shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i data-lucide="play" class="w-5 h-5"></i>
              <span>Mulai & Bagikan Peran Rahasia 🎭</span>
            </button>
          ` : `
            <div class="w-full p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
              <p class="font-display font-bold text-sm text-indigo-900 flex items-center justify-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></span>
                <span>Menunggu Host memulai permainan...</span>
              </p>
            </div>
          `}
          <button 
            onclick="App.returnToLobby()"
            class="w-full sm:w-auto px-5 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-bold text-sm active:scale-95 transition-all cursor-pointer"
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
   * VIEW 2: ROLE REVEAL & READY CHECK
   * ==========================================================================
   */
  function renderRoleRevealView(appEl, state) {
    const isHost = currentPlayer && currentPlayer.isHost;
    const playerRoles = state.playerRoles || {};
    const myData = playerRoles[currentPlayer.id] || { role: 'villager', ready: false };
    const myRole = ROLES_DEF[myData.role] || ROLES_DEF['villager'];

    // Fellow Werewolves List (Only visible to Werewolves!)
    let fellowWerewolvesHTML = '';
    if (myData.role === 'werewolf') {
      const werewolfPartners = Object.values(playerRoles)
        .filter(p => p.role === 'werewolf' && p.id !== currentPlayer.id)
        .map(p => p.name);

      fellowWerewolvesHTML = `
        <div class="mt-4 p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-left space-y-1 text-white">
          <span class="text-[10px] font-display font-black tracking-wider uppercase text-rose-300 block">
            🐺 Rekan Sesama Werewolf:
          </span>
          <p class="font-display font-bold text-sm text-rose-100">
            ${werewolfPartners.length > 0 ? werewolfPartners.join(', ') : 'Kamu adalah satu-satunya Werewolf di desa ini!'}
          </p>
        </div>
      `;
    }

    // Ready progress
    const allPlayers = Object.values(playerRoles);
    const readyCount = allPlayers.filter(p => p.ready).length;
    const totalCount = allPlayers.length;

    const contentHTML = `
      <div class="max-w-md mx-auto py-4 text-center space-y-6">
        <div>
          <span class="text-xs font-display font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Fase Pembagian Kartu Rahasia
          </span>
          <h2 class="font-display font-black text-2xl text-slate-900 mt-2">
            Peran Rahasiamu Telah Tiba!
          </h2>
          <p class="font-body text-xs text-slate-500 mt-1">
            Jaga kerahasiaan layarmu. Klik kartu di bawah untuk membuka identitasmu.
          </p>
        </div>

        <!-- Secret Card Container with 3D Flip -->
        <div 
          onclick="WerewolfGame.toggleCardFlip()"
          class="relative w-full max-w-xs mx-auto aspect-[3/4] cursor-pointer select-none perspective-1000 group"
          title="Klik untuk membalik kartu"
        >
          <div class="w-full h-full rounded-3xl transition-all duration-500 transform-style-3d ${isCardFlipped ? 'rotate-y-180 shadow-2xl' : 'shadow-lg hover:scale-102'}">
            <!-- Front Side: Mystery Cover -->
            <div class="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border-4 border-indigo-400/30 flex flex-col items-center justify-center p-6 text-white backface-hidden">
              <div class="w-20 h-20 rounded-3xl bg-indigo-500/20 border-2 border-indigo-400/40 flex items-center justify-center mb-4 shadow-inner">
                <i data-lucide="help-circle" class="w-10 h-10 text-indigo-200"></i>
              </div>
              <span class="font-display font-black text-xl tracking-wider text-amber-300 uppercase">
                Peran Rahasia
              </span>
              <p class="font-body text-xs text-indigo-200/70 mt-2">
                Sentuh untuk membuka kartu 👁️
              </p>
            </div>

            <!-- Back Side: Revealed Role Card -->
            <div class="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-white to-slate-50 border-4 border-indigo-600 p-6 flex flex-col justify-between text-slate-900 rotate-y-180 backface-hidden shadow-2xl">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-display font-black tracking-wider uppercase ${myRole.badgeClass}">
                    ${myRole.teamName}
                  </span>
                  <span class="text-xs font-display font-bold text-slate-400">#KartuRahasia</span>
                </div>

                <div class="w-16 h-16 mx-auto rounded-2xl ${myRole.iconBg} text-white flex items-center justify-center shadow-lg my-3">
                  <i data-lucide="${myRole.icon}" class="w-8 h-8"></i>
                </div>

                <h3 class="font-display font-black text-xl text-slate-900">
                  ${myRole.name}
                </h3>
                <p class="font-body text-xs text-slate-600 mt-2 leading-relaxed">
                  ${myRole.description}
                </p>

                ${fellowWerewolvesHTML}
              </div>

              <div class="pt-3 border-t border-slate-100">
                <span class="text-[11px] font-display font-semibold text-slate-400">
                  Sentuh lagi untuk menutup kartu
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Ready Button -->
        <div class="space-y-3">
          ${!myData.ready ? `
            <button 
              onclick="WerewolfGame.confirmReady()"
              class="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-display font-black text-base shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i data-lucide="check-circle-2" class="w-5 h-5"></i>
              <span>Saya Sudah Paham Peran Saya & Siap! ✅</span>
            </button>
          ` : `
            <div class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 font-display font-bold text-sm flex items-center justify-center gap-2">
              <i data-lucide="check" class="w-4 h-4 text-emerald-600"></i>
              <span>Kamu sudah siap! Menunggu teman-teman lain...</span>
            </div>
          `}

          <!-- Progress -->
          <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-display font-bold text-slate-600 flex items-center justify-between">
            <span>Kesiapan Seluruh Pemain:</span>
            <span class="text-indigo-600 font-black">${readyCount} / ${totalCount} Pemain Siap</span>
          </div>

          ${isHost ? `
            <button 
              onclick="WerewolfGame.forceStartNight()"
              class="w-full py-2.5 px-4 rounded-xl text-xs font-display font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-all cursor-pointer"
            >
              👑 Host: Langsung Mulai Malam Pertama 🌙
            </button>
          ` : ''}
        </div>
      </div>
    `;

    appEl.innerHTML = contentHTML;
  }

  /**
   * ==========================================================================
   * VIEW 3: NIGHT PHASE (ACTION SELECTION & SLEEP)
   * ==========================================================================
   */
  function renderNightView(appEl, state) {
    const isHost = currentPlayer && currentPlayer.isHost;
    const round = state.round || 1;
    const playerRoles = state.playerRoles || {};
    const nightActions = state.nightActions || {};
    const myData = playerRoles[currentPlayer.id] || { role: 'villager', isAlive: true };
    const myRole = ROLES_DEF[myData.role] || ROLES_DEF['villager'];

    const livingPlayers = Object.values(playerRoles).filter(p => p.isAlive);
    const livingCount = livingPlayers.length;
    const completedNightActionsCount = Object.keys(nightActions).length;
    const hasSubmittedMyAction = Boolean(nightActions[currentPlayer.id]);

    // Discord Mute Alert Banner
    const nightAlertHTML = `
      <div class="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-2 border-indigo-400/40 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div class="flex items-center gap-3.5">
          <div class="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md animate-pulse">
            <i data-lucide="moon" class="w-6 h-6"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-300 border border-rose-500/50 text-[10px] font-display font-black tracking-wider uppercase">
                🌙 FASE MALAM - RONDE ${round}
              </span>
            </div>
            <h3 class="font-display font-black text-lg sm:text-xl text-white mt-0.5">
              Malam Tiba di Desa
            </h3>
            <p class="font-body text-xs text-indigo-200/80">
              🔇 <b>WAJIB MUTE MIC DI DISCORD!</b> Jangan berbicara atau bersuara sampai fajar menyingsing.
            </p>
          </div>
        </div>

        <div class="bg-indigo-900/60 border border-indigo-400/30 px-3.5 py-2 rounded-2xl text-center shrink-0">
          <span class="text-[10px] font-display font-semibold text-indigo-300 block">Status Malam</span>
          <span class="font-display font-black text-sm text-amber-300">
            ${completedNightActionsCount} / ${livingCount} Selesai
          </span>
        </div>
      </div>
    `;

    // Dynamic Action Box according to role
    let actionBoxHTML = '';

    if (!myData.isAlive) {
      actionBoxHTML = `
        <div class="p-6 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm text-center space-y-3">
          <span class="text-3xl">🪦</span>
          <h4 class="font-display font-bold text-base text-slate-800">Kamu Telah Gugur (Spectator)</h4>
          <p class="font-body text-xs text-slate-500 max-w-sm mx-auto">
            Tetap mute mic di Discord dan saksikan pertarungan antara warga dan Werewolf secara rahasia.
          </p>
        </div>
      `;
    } else if (hasSubmittedMyAction) {
      actionBoxHTML = `
        <div class="p-6 rounded-3xl bg-white border-2 border-emerald-500/30 shadow-sm text-center space-y-4">
          <div class="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <i data-lucide="check" class="w-8 h-8"></i>
          </div>
          <div>
            <h4 class="font-display font-black text-lg text-slate-900">Aksi Malammu Berhasil Terkunci!</h4>
            <p class="font-body text-xs text-slate-500 mt-1">
              Menunggu pemain lain menyelesaikan aksi malam mereka di layar masing-masing...
            </p>
          </div>

          ${localSeerInspectionResult ? `
            <div class="p-4 rounded-2xl bg-purple-50 border-2 border-purple-300 text-purple-950 space-y-1">
              <span class="text-[10px] font-display font-black tracking-wider uppercase text-purple-700 block">
                🔮 Hasil Terawangan Penerawang:
              </span>
              <p class="font-display font-black text-base">
                ${localSeerInspectionResult.targetName} adalah <span class="${localSeerInspectionResult.isWerewolf ? 'text-rose-600 underline' : 'text-emerald-700 underline'}">${localSeerInspectionResult.isWerewolf ? '🐺 WEREWOLF!' : '🕊️ WARGA BAIK'}</span>
              </p>
            </div>
          ` : ''}

          <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
            <div 
              class="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style="width: ${(completedNightActionsCount / livingCount) * 100}%;"
            ></div>
          </div>
        </div>
      `;
    } else {
      // Living and has not locked action yet
      if (myData.role === 'werewolf') {
        const candidates = livingPlayers.filter(p => p.id !== currentPlayer.id);
        const candidatesHTML = candidates.map(c => {
          const isSelected = localNightSelection === c.id;
          const isPartner = c.role === 'werewolf';
          const partnerBadge = isPartner ? '<span class="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">Rekan Serigala</span>' : '';

          return `
            <div 
              onclick="WerewolfGame.selectNightTarget('${c.id}')"
              class="p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${isSelected ? 'border-rose-600 bg-rose-50 ring-4 ring-rose-500/20 scale-101' : 'border-slate-900/10 bg-white hover:border-rose-300'}"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                ${UI.Avatar({ name: c.name, size: 'sm', colorIndex: c.colorIndex })}
                <span class="font-display font-bold text-xs text-slate-800 truncate">${c.name}</span>
              </div>
              <div class="flex items-center gap-2">
                ${partnerBadge}
                <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-300'}">
                  ${isSelected ? '<i data-lucide="check" class="w-3 h-3"></i>' : ''}
                </div>
              </div>
            </div>
          `;
        }).join('');

        actionBoxHTML = `
          <div class="p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                <i data-lucide="moon" class="w-5 h-5"></i>
              </div>
              <div>
                <h4 class="font-display font-black text-base text-slate-900">Pilih Mangsa Werewolf Malam Ini 🐺</h4>
                <p class="font-body text-xs text-slate-500">Pilih 1 warga yang ingin kamu lenyapkan bersama kawanan serigalamu.</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              ${candidatesHTML}
            </div>

            <button 
              onclick="WerewolfGame.submitNightAction()"
              class="w-full py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-display font-bold text-sm shadow-md shadow-rose-600/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <i data-lucide="check" class="w-4 h-4"></i>
              <span>Kunci Target Mangsa 🐺</span>
            </button>
          </div>
        `;
      } else if (myData.role === 'seer') {
        const candidates = livingPlayers.filter(p => p.id !== currentPlayer.id);
        const candidatesHTML = candidates.map(c => {
          const isSelected = localNightSelection === c.id;
          return `
            <div 
              onclick="WerewolfGame.selectNightTarget('${c.id}')"
              class="p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${isSelected ? 'border-purple-600 bg-purple-50 ring-4 ring-purple-500/20 scale-101' : 'border-slate-900/10 bg-white hover:border-purple-300'}"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                ${UI.Avatar({ name: c.name, size: 'sm', colorIndex: c.colorIndex })}
                <span class="font-display font-bold text-xs text-slate-800 truncate">${c.name}</span>
              </div>
              <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-purple-600 bg-purple-600 text-white' : 'border-slate-300'}">
                ${isSelected ? '<i data-lucide="check" class="w-3 h-3"></i>' : ''}
              </div>
            </div>
          `;
        }).join('');

        actionBoxHTML = `
          <div class="p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                <i data-lucide="eye" class="w-5 h-5"></i>
              </div>
              <div>
                <h4 class="font-display font-black text-base text-slate-900">Pilih Pemain untuk Diterawang 🔮</h4>
                <p class="font-body text-xs text-slate-500">Lihat apakah pemain tersebut Werewolf atau Warga Baik.</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              ${candidatesHTML}
            </div>

            <button 
              onclick="WerewolfGame.submitNightAction()"
              class="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-display font-bold text-sm shadow-md shadow-purple-600/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <i data-lucide="eye" class="w-4 h-4"></i>
              <span>Terawang Identitas Pemain Ini 🔮</span>
            </button>
          </div>
        `;
      } else if (myData.role === 'doctor') {
        const lastSavedId = state.lastNightSavedDoctorId;
        const candidates = livingPlayers;
        const candidatesHTML = candidates.map(c => {
          const isSelected = localNightSelection === c.id;
          const isBlocked = c.id === lastSavedId;

          if (isBlocked) {
            return `
              <div class="p-3.5 rounded-2xl border-2 border-slate-200 bg-slate-100 opacity-60 flex items-center justify-between gap-3 cursor-not-allowed">
                <div class="flex items-center gap-2.5 min-w-0">
                  ${UI.Avatar({ name: c.name, size: 'sm', colorIndex: c.colorIndex })}
                  <span class="font-display font-bold text-xs text-slate-600 truncate">${c.name}</span>
                </div>
                <span class="text-[10px] font-bold text-slate-500">(Dilindungi semalam)</span>
              </div>
            `;
          }

          return `
            <div 
              onclick="WerewolfGame.selectNightTarget('${c.id}')"
              class="p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${isSelected ? 'border-emerald-600 bg-emerald-50 ring-4 ring-emerald-500/20 scale-101' : 'border-slate-900/10 bg-white hover:border-emerald-300'}"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                ${UI.Avatar({ name: c.name, size: 'sm', colorIndex: c.colorIndex })}
                <span class="font-display font-bold text-xs text-slate-800 truncate">${c.name}</span>
                ${c.id === currentPlayer.id ? '<span class="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1 rounded">Kamu</span>' : ''}
              </div>
              <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'}">
                ${isSelected ? '<i data-lucide="check" class="w-3 h-3"></i>' : ''}
              </div>
            </div>
          `;
        }).join('');

        actionBoxHTML = `
          <div class="p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <i data-lucide="shield" class="w-5 h-5"></i>
              </div>
              <div>
                <h4 class="font-display font-black text-base text-slate-900">Pilih Pemain untuk Dilindungi 💉</h4>
                <p class="font-body text-xs text-slate-500">Pemain yang dilindungi akan selamat jika diserang Werewolf malam ini.</p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              ${candidatesHTML}
            </div>

            <button 
              onclick="WerewolfGame.submitNightAction()"
              class="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-bold text-sm shadow-md shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <i data-lucide="shield" class="w-4 h-4"></i>
              <span>Kunci Perlindungan 💉</span>
            </button>
          </div>
        `;
      } else {
        // Villager or Hunter (Equal clicking participation so roles are secret)
        actionBoxHTML = `
          <div class="p-6 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm text-center space-y-4">
            <div class="w-16 h-16 mx-auto rounded-3xl bg-indigo-50 border-2 border-indigo-200 text-indigo-600 flex items-center justify-center">
              <span class="text-3xl">😴</span>
            </div>
            <div>
              <h4 class="font-display font-black text-lg text-slate-900">Desa Tertidur Pulas</h4>
              <p class="font-body text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                Sebagai ${myRole.name}, kamu tidak memiliki kekuatan gaib di malam hari. Klik tombol di bawah untuk tidur dan menunggu fajar menyingsing.
              </p>
            </div>

            <button 
              onclick="WerewolfGame.submitNightAction()"
              class="w-full max-w-sm mx-auto py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-display font-bold text-sm shadow-md shadow-indigo-600/25 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <i data-lucide="moon" class="w-4 h-4"></i>
              <span>Konfirmasi Tidur Pulas 😴</span>
            </button>
          </div>
        `;
      }
    }

    const hostActionsHTML = isHost ? `
      <div class="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-between">
        <span class="text-xs font-display font-bold text-slate-500">Panel Kontrol Host:</span>
        <button 
          onclick="WerewolfGame.resolveNight()"
          class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-display font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <i data-lucide="sun" class="w-3.5 h-3.5"></i>
          <span>Proses Malam & Terbitkan Fajar 🌅</span>
        </button>
      </div>
    ` : '';

    appEl.innerHTML = `
      <div class="max-w-3xl mx-auto py-4">
        ${nightAlertHTML}
        ${actionBoxHTML}
        ${hostActionsHTML}
      </div>
    `;
  }

  /**
   * ==========================================================================
   * VIEW 4: DAY ANNOUNCEMENT & DISCUSSION
   * ==========================================================================
   */
  function renderDayAnnouncementView(appEl, state) {
    const isHost = currentPlayer && currentPlayer.isHost;
    const round = state.round || 1;
    const nightReport = state.nightReport || {};
    const playerRoles = state.playerRoles || {};

    const livingPlayers = Object.values(playerRoles).filter(p => p.isAlive);
    const deadPlayers = Object.values(playerRoles).filter(p => !p.isAlive);

    const isSaved = nightReport.saved;
    const victim = nightReport.killedId ? playerRoles[nightReport.killedId] : null;

    const reportBoxHTML = isSaved ? `
      <div class="p-6 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-300 text-center space-y-3 shadow-md">
        <div class="w-16 h-16 mx-auto rounded-3xl bg-emerald-500 text-white flex items-center justify-center shadow-lg">
          <i data-lucide="shield-check" class="w-8 h-8"></i>
        </div>
        <h3 class="font-display font-black text-2xl text-emerald-950">
          Malam yang Damai! Tidak Ada Korban Jiwa 🛡️
        </h3>
        <p class="font-body text-xs sm:text-sm text-emerald-800 max-w-md mx-auto leading-relaxed">
          ${nightReport.message || 'Suara serigala terdengar di kejauhan, tetapi Doctor berhasil melindungi warga dengan ramuan obatnya!'}
        </p>
      </div>
    ` : (victim ? `
      <div class="p-6 rounded-3xl bg-gradient-to-br from-rose-50 to-amber-50 border-2 border-rose-300 text-center space-y-3 shadow-md">
        <div class="w-16 h-16 mx-auto rounded-3xl bg-rose-600 text-white flex items-center justify-center shadow-lg">
          <span class="text-3xl">🪦</span>
        </div>
        <div>
          <span class="px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-900 text-xs font-display font-black uppercase tracking-wider">
            Kabar Duka Kematian
          </span>
          <h3 class="font-display font-black text-2xl sm:text-3xl text-rose-950 mt-1">
            ${victim.name} Ditemukan Tewas!
          </h3>
        </div>
        <p class="font-body text-xs sm:text-sm text-rose-800 max-w-md mx-auto leading-relaxed">
          ${victim.name} telah dimangsa oleh Werewolf tadi malam. Peran aslinya adalah <b>${ROLES_DEF[victim.role]?.name || victim.role}</b>.
        </p>
        <div class="p-2.5 rounded-xl bg-white/70 border border-rose-200 text-[11px] font-display font-bold text-rose-800">
          ⚠️ Pemain yang tewas wajib MUTE MIC di Discord dan beralih menjadi penonton (Spectator).
        </div>
      </div>
    ` : `
      <div class="p-6 rounded-3xl bg-slate-50 border-2 border-slate-200 text-center">
        <p class="font-display font-bold text-sm text-slate-600">Fajar telah menyingsing di desa.</p>
      </div>
    `);

    // Status of all villagers
    const playersStatusGridHTML = Object.values(playerRoles).map(p => `
      <div class="p-3 rounded-2xl border-2 flex items-center justify-between gap-2 ${p.isAlive ? 'border-slate-200 bg-white shadow-2xs' : 'border-slate-200 bg-slate-100 opacity-50 grayscale'}">
        <div class="flex items-center gap-2 min-w-0">
          ${UI.Avatar({ name: p.name, size: 'sm', colorIndex: p.colorIndex })}
          <span class="font-display font-bold text-xs text-slate-800 truncate">${p.name}</span>
        </div>
        <span class="text-[10px] font-display font-bold px-2 py-0.5 rounded-full ${p.isAlive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'}">
          ${p.isAlive ? 'HIDUP' : 'GUGUR 🪦'}
        </span>
      </div>
    `).join('');

    const contentHTML = `
      <div class="max-w-2xl mx-auto py-4 space-y-6">
        <!-- Day Banner -->
        <div class="p-4 rounded-3xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-amber-950 shadow-md flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-white text-amber-600 flex items-center justify-center font-black">
              <i data-lucide="sun" class="w-6 h-6"></i>
            </div>
            <div>
              <span class="text-[10px] font-display font-black uppercase tracking-wider text-amber-900 block">
                ☀️ FASE SIANG - DISKUSI TERBUKA
              </span>
              <h2 class="font-display font-black text-lg sm:text-xl text-amber-950">
                Pagi Hari di Desa (Ronde ${round})
              </h2>
            </div>
          </div>
          <span class="px-3 py-1 rounded-full bg-white/80 text-amber-900 text-xs font-display font-extrabold shadow-2xs">
            🎙️ DISCORD OPEN MIC!
          </span>
        </div>

        ${reportBoxHTML}

        <!-- Living Players Status -->
        <div class="p-5 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm space-y-3">
          <div class="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h4 class="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
              <i data-lucide="users" class="w-4 h-4 text-indigo-600"></i>
              <span>Daftar Warga (${livingPlayers.length} Hidup / ${deadPlayers.length} Gugur)</span>
            </h4>
            <span class="text-xs font-display font-bold text-slate-500">Bebas Debat di Voice Chat</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            ${playersStatusGridHTML}
          </div>
        </div>

        <!-- Next Action -->
        <div class="space-y-3 pt-2">
          ${isHost ? `
            <button 
              onclick="WerewolfGame.startDayVoting()"
              class="w-full py-4 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-display font-black text-base shadow-lg shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i data-lucide="vote" class="w-5 h-5"></i>
              <span>Mulai Sidang Voting Eksekusi Siang ⚖️</span>
            </button>
          ` : `
            <div class="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center font-display font-semibold text-xs text-slate-600">
              💡 Bicarakan kecurigaanmu di Discord Voice Chat sekarang! Menunggu Host membuka sesi voting eksekusi...
            </div>
          `}
        </div>
      </div>
    `;

    appEl.innerHTML = contentHTML;
  }

  /**
   * ==========================================================================
   * VIEW 5: DAY VOTING (EXECUTION LYNCHING)
   * ==========================================================================
   */
  function renderDayVotingView(appEl, state) {
    const isHost = currentPlayer && currentPlayer.isHost;
    const playerRoles = state.playerRoles || {};
    const dayVotes = state.dayVotes || {};
    const myData = playerRoles[currentPlayer.id] || { isAlive: true };

    const livingPlayers = Object.values(playerRoles).filter(p => p.isAlive);
    const livingCount = livingPlayers.length;
    const votedCount = Object.keys(dayVotes).length;
    const hasVoted = Boolean(dayVotes[currentPlayer.id]);

    const candidateCardsHTML = livingPlayers.map(cand => {
      const isSelected = hasVoted 
        ? dayVotes[currentPlayer.id] === cand.id 
        : localDayVoteSelection === cand.id;

      const clickAction = hasVoted ? '' : `onclick="WerewolfGame.selectDayVoteTarget('${cand.id}')"`;

      return `
        <div 
          ${clickAction}
          class="p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${isSelected ? 'border-amber-500 bg-amber-50 ring-4 ring-amber-500/20 scale-101' : 'border-slate-900/10 bg-white hover:border-amber-300'}"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            ${UI.Avatar({ name: cand.name, size: 'sm', colorIndex: cand.colorIndex })}
            <div>
              <span class="font-display font-bold text-xs text-slate-900 block truncate">${cand.name}</span>
              ${cand.id === currentPlayer.id ? '<span class="text-[10px] font-bold text-slate-400">Kamu</span>' : ''}
            </div>
          </div>
          <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300'}">
            ${isSelected ? '<i data-lucide="check" class="w-3 h-3"></i>' : ''}
          </div>
        </div>
      `;
    }).join('');

    // Skip vote option
    const isSkipSelected = hasVoted 
      ? dayVotes[currentPlayer.id] === 'skip'
      : localDayVoteSelection === 'skip';

    const skipAction = hasVoted ? '' : `onclick="WerewolfGame.selectDayVoteTarget('skip')"`;

    const contentHTML = `
      <div class="max-w-2xl mx-auto py-4 space-y-6">
        <!-- Header Banner -->
        <div class="p-5 rounded-3xl bg-slate-900 text-white border-2 border-amber-500/30 shadow-lg flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black">
              <i data-lucide="scale" class="w-6 h-6"></i>
            </div>
            <div>
              <span class="text-[10px] font-display font-black uppercase tracking-wider text-amber-300 block">
                SIDANG PENGGANTUNGAN WARGA
              </span>
              <h2 class="font-display font-black text-xl text-white">
                Pilih Tersangka Werewolf
              </h2>
            </div>
          </div>
          <div class="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 text-center shrink-0">
            <span class="text-[10px] font-display font-semibold text-slate-300 block">Suara Masuk</span>
            <span class="font-display font-black text-sm text-amber-300">${votedCount} / ${livingCount}</span>
          </div>
        </div>

        ${!myData.isAlive ? `
          <div class="p-5 rounded-3xl bg-slate-100 border border-slate-300 text-center space-y-2">
            <span class="text-2xl">🪦</span>
            <h4 class="font-display font-bold text-sm text-slate-800">Kamu Sedang Menonton (Spectator)</h4>
            <p class="font-body text-xs text-slate-500">Pemain yang telah gugur tidak memiliki hak suara.</p>
          </div>
        ` : (hasVoted ? `
          <div class="p-6 rounded-3xl bg-white border-2 border-emerald-500/30 text-center space-y-3 shadow-sm">
            <div class="w-12 h-12 mx-auto rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <i data-lucide="check" class="w-6 h-6"></i>
            </div>
            <h4 class="font-display font-black text-lg text-slate-900">Suaramu Berhasil Terkunci!</h4>
            <p class="font-body text-xs text-slate-500">
              Menunggu seluruh warga selesai memberikan suara eksekusi...
            </p>
          </div>
        ` : `
          <div class="p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="font-display font-bold text-sm text-slate-800">Pilih 1 Orang untuk Digantung:</h4>
              <span class="text-xs text-amber-600 font-bold">1 Suara Mutlak</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              ${candidateCardsHTML}
            </div>

            <!-- Skip Option -->
            <div 
              ${skipAction}
              class="p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${isSkipSelected ? 'border-indigo-600 bg-indigo-50 ring-4 ring-indigo-500/20' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'}"
            >
              <div class="flex items-center gap-2.5">
                <span class="text-xl">🕊️</span>
                <div>
                  <span class="font-display font-bold text-xs text-slate-800 block">Abstain / Lewati Voting</span>
                  <span class="text-[11px] text-slate-500 font-body">Jangan gantung siapapun hari ini</span>
                </div>
              </div>
              <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSkipSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'}">
                ${isSkipSelected ? '<i data-lucide="check" class="w-3 h-3"></i>' : ''}
              </div>
            </div>

            <button 
              onclick="WerewolfGame.submitDayVote()"
              class="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-display font-black text-base shadow-lg shadow-amber-500/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <i data-lucide="scale" class="w-5 h-5"></i>
              <span>Kunci Suara Eksekusi ⚖️</span>
            </button>
          </div>
        `)}

        <!-- Host Force Resolve -->
        ${isHost ? `
          <div class="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between">
            <span class="text-xs font-display font-bold text-slate-600">Kontrol Hakim Host:</span>
            <button 
              onclick="WerewolfGame.resolveDayVoting()"
              class="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-display font-bold text-xs shadow transition-all cursor-pointer flex items-center gap-1.5"
            >
              <i data-lucide="gavel" class="w-3.5 h-3.5 text-amber-400"></i>
              <span>Ketuk Palu / Hitung Suara Sekarang 🔨</span>
            </button>
          </div>
        ` : ''}
      </div>
    `;

    appEl.innerHTML = contentHTML;
  }

  /**
   * ==========================================================================
   * VIEW 6: HUNTER REVENGE PHASE
   * ==========================================================================
   */
  function renderHunterRevengeView(appEl, state) {
    const playerRoles = state.playerRoles || {};
    const hunterDeathInfo = state.hunterPendingDeath || {};
    const hunterId = hunterDeathInfo.hunterId;
    const isMeHunter = currentPlayer.id === hunterId;

    const livingPlayers = Object.values(playerRoles).filter(p => p.isAlive && p.id !== hunterId);

    const candidatesHTML = livingPlayers.map(c => {
      const isSelected = localNightSelection === c.id;
      return `
        <div 
          onclick="${isMeHunter ? `WerewolfGame.selectNightTarget('${c.id}')` : ''}"
          class="p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${isSelected ? 'border-amber-600 bg-amber-50 ring-4 ring-amber-500/20' : 'border-slate-900/10 bg-white hover:border-amber-300'}"
        >
          <div class="flex items-center gap-2.5">
            ${UI.Avatar({ name: c.name, size: 'sm', colorIndex: c.colorIndex })}
            <span class="font-display font-bold text-xs text-slate-800 truncate">${c.name}</span>
          </div>
          <div class="w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300'}">
            ${isSelected ? '<i data-lucide="crosshair" class="w-3.5 h-3.5 text-white bg-amber-600 rounded-full"></i>' : ''}
          </div>
        </div>
      `;
    }).join('');

    const contentHTML = `
      <div class="max-w-xl mx-auto py-6 space-y-6 text-center">
        <div class="w-16 h-16 mx-auto rounded-3xl bg-amber-500 text-white flex items-center justify-center shadow-lg animate-bounce">
          <i data-lucide="crosshair" class="w-8 h-8"></i>
        </div>

        <div>
          <span class="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-display font-black uppercase tracking-wider">
            Reaksi Terakhir Pemburu!
          </span>
          <h2 class="font-display font-black text-2xl sm:text-3xl text-slate-900 mt-2">
            Tembakan Balas Dendam Hunter 🏹
          </h2>
          <p class="font-body text-xs sm:text-sm text-slate-600 mt-1 max-w-md mx-auto">
            ${isMeHunter 
              ? 'Napasmu tersengal, namun jarimu masih sempat menarik pelatuk! Pilih 1 pemain untuk ikut mati bersamamu:'
              : 'Hunter telah terbunuh, namun ia memiliki hak menembak mati 1 pemain pilihannya sebelum mengembuskan napas terakhir!'}
          </p>
        </div>

        <div class="p-5 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm text-left space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            ${candidatesHTML}
          </div>

          ${isMeHunter ? `
            <button 
              onclick="WerewolfGame.submitHunterShot()"
              class="w-full py-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-display font-black text-base shadow-lg shadow-amber-600/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2 mt-4"
            >
              <i data-lucide="crosshair" class="w-5 h-5"></i>
              <span>TEMBAK SEKARANG! 💥</span>
            </button>
          ` : `
            <div class="p-3 text-center text-xs font-display font-bold text-slate-500">
              Menunggu Hunter membidik sasarannya...
            </div>
          `}
        </div>
      </div>
    `;

    appEl.innerHTML = contentHTML;
  }

  /**
   * ==========================================================================
   * VIEW 7: GAME OVER & GRAND IDENTITY REVEAL
   * ==========================================================================
   */
  function renderGameOverView(appEl, state) {
    const isHost = currentPlayer && currentPlayer.isHost;
    const winner = state.winner;
    const isVillagerWin = winner === 'villagers';
    const playerRoles = state.playerRoles || {};

    const playersRevealHTML = Object.values(playerRoles).map(p => {
      const roleDef = ROLES_DEF[p.role] || ROLES_DEF['villager'];
      return `
        <div class="p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 ${p.role === 'werewolf' ? 'border-rose-200 bg-rose-50/50' : 'border-indigo-200 bg-white'}">
          <div class="flex items-center gap-3 min-w-0">
            ${UI.Avatar({ name: p.name, size: 'sm', colorIndex: p.colorIndex })}
            <div>
              <span class="font-display font-bold text-xs text-slate-900 block truncate">${p.name}</span>
              <span class="text-[10px] font-bold ${p.isAlive ? 'text-emerald-600' : 'text-slate-400'}">
                ${p.isAlive ? '● Hidup' : '● Gugur'}
              </span>
            </div>
          </div>
          <div class="text-right">
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-display font-black uppercase tracking-wider ${roleDef.badgeClass}">
              ${roleDef.name}
            </span>
          </div>
        </div>
      `;
    }).join('');

    const contentHTML = `
      <div class="max-w-2xl mx-auto py-6 space-y-6 text-center">
        <!-- Victory Card -->
        <div class="p-6 sm:p-8 rounded-3xl ${isVillagerWin ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-emerald-500/30' : 'bg-gradient-to-br from-rose-900 via-slate-900 to-indigo-950 text-white shadow-rose-900/30'} shadow-xl border-4 border-white/20">
          <span class="text-4xl block mb-2">${isVillagerWin ? '🏆' : '🐺'}</span>
          <h2 class="font-display font-black text-3xl sm:text-4xl tracking-tight">
            ${isVillagerWin ? 'TIM WARGA MENANG! 🎉' : 'TIM WEREWOLF MENANG! 🐺'}
          </h2>
          <p class="font-body text-xs sm:text-sm text-white/90 mt-2 max-w-md mx-auto leading-relaxed">
            ${isVillagerWin 
              ? 'Seluruh Werewolf berhasil dieksekusi! Desa kembali aman dan damai.'
              : 'Jumlah Werewolf kini setara atau melebihi sisa warga yang hidup! Serigala telah menguasai desa sepenuhnya.'}
          </p>
        </div>

        <!-- Grand Identity Reveal -->
        <div class="p-5 sm:p-6 rounded-3xl bg-white border-2 border-slate-900/10 shadow-sm text-left space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 class="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
              <i data-lucide="eye" class="w-4 h-4 text-indigo-600"></i>
              <span>Bongkar Seluruh Kartu Identitas Pemain</span>
            </h4>
            <span class="text-xs font-display font-semibold text-slate-400">Ronde Berakhir</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            ${playersRevealHTML}
          </div>
        </div>

        <!-- Actions -->
        <div class="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          ${isHost ? `
            <button 
              onclick="WerewolfGame.restartGame()"
              class="w-full sm:w-auto px-6 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-display font-black text-sm shadow-lg shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
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
   * ACTIONS & DISPATCHERS
   * ==========================================================================
   */

  /**
   * Host starts game: Distribute roles & set status to role_reveal
   */
  async function startGame() {
    if (!currentRoom || !currentPlayer?.isHost || isSubmitting) return;
    isSubmitting = true;
    try {
      UI.Sound.click();

      const playerList = Object.values(currentRoom.players || {});
      if (playerList.length < 3) {
        UI.Toast('Minimal 3 pemain untuk memulai Werewolf!', 'warning');
        return;
      }

      const playerRoles = distributeRoles(playerList);

      await DB.updateGameState(currentRoom.code, 'werewolf', {
        status: 'role_reveal',
        round: 1,
        playerRoles: playerRoles,
        nightActions: {},
        dayVotes: {},
        nightReport: null,
        lastNightSavedDoctorId: null,
        hunterPendingDeath: null,
        winner: null
      });

      UI.Toast('Kartu peran telah dibagikan secara rahasia!', 'success');
    } catch (err) {
      UI.Logger('WEREWOLF', 'Error starting game:', err, true);
      UI.Toast('Gagal memulai Werewolf: ' + (err.message || err), 'error');
    } finally {
      isSubmitting = false;
    }
  }

  function toggleCardFlip() {
    isCardFlipped = !isCardFlipped;
    UI.Sound.pop();
    render(document.getElementById('app'), currentRoom, currentPlayer);
  }

  async function confirmReady() {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    isSubmitting = true;
    try {
      UI.Sound.click();

      const state = getGameState(currentRoom);
      const playerRoles = { ...(state.playerRoles || {}) };

      if (playerRoles[currentPlayer.id]) {
        playerRoles[currentPlayer.id].ready = true;
      }

      // Check if everyone is ready
      const allReady = Object.values(playerRoles).every(p => p.ready);

      const updates = { playerRoles };
      if (allReady) {
        updates.status = 'night';
        updates.nightActions = {};
      }

      await DB.updateGameState(currentRoom.code, 'werewolf', updates);
    } catch (err) {
      UI.Logger('WEREWOLF', 'Error confirming ready:', err, true);
    } finally {
      isSubmitting = false;
    }
  }

  async function forceStartNight() {
    if (!currentRoom || !currentPlayer?.isHost || isSubmitting) return;
    isSubmitting = true;
    try {
      UI.Sound.click();
      await DB.updateGameState(currentRoom.code, 'werewolf', {
        status: 'night',
        nightActions: {}
      });
    } catch (err) {
      UI.Logger('WEREWOLF', 'Error forcing night:', err, true);
    } finally {
      isSubmitting = false;
    }
  }

  function selectNightTarget(targetId) {
    localNightSelection = targetId;
    UI.Sound.pop();
    render(document.getElementById('app'), currentRoom, currentPlayer);
  }

  async function submitNightAction() {
    if (!currentRoom || !currentPlayer || isSubmitting) return;

    const state = getGameState(currentRoom);
    const myData = (state.playerRoles || {})[currentPlayer.id];
    if (!myData || !myData.isAlive) return;

    // Validation for roles that require a target
    if (['werewolf', 'seer', 'doctor'].includes(myData.role) && !localNightSelection) {
      UI.Toast('Pilih 1 pemain terlebih dahulu!', 'warning');
      return;
    }

    if (myData.role === 'doctor' && localNightSelection === state.lastNightSavedDoctorId) {
      UI.Toast('Dokter tidak boleh melindungi pemain yang sama 2 malam berturut-turut!', 'warning');
      return;
    }

    isSubmitting = true;
    try {
      UI.Sound.click();

      // If Seer, compute result locally for instant feedback
      if (myData.role === 'seer' && localNightSelection) {
        const targetData = (state.playerRoles || {})[localNightSelection];
        localSeerInspectionResult = {
          targetName: targetData?.name || 'Pemain',
          isWerewolf: targetData?.role === 'werewolf'
        };
      }

      const nightActions = { ...(state.nightActions || {}) };
      nightActions[currentPlayer.id] = {
        targetId: localNightSelection || null,
        role: myData.role,
        confirmed: true
      };

      const livingPlayers = Object.values(state.playerRoles || {}).filter(p => p.isAlive);
      const livingCount = livingPlayers.length;
      const allDone = livingCount > 0 && livingPlayers.every(p => nightActions[p.id]);

      const updates = { nightActions };

      // Auto-resolve if all living players completed action
      if (allDone) {
        const resolved = resolveNightInternal(state, nightActions);
        Object.assign(updates, resolved);
      }

      await DB.updateGameState(currentRoom.code, 'werewolf', updates);

      localNightSelection = null;
    } catch (err) {
      UI.Logger('WEREWOLF', 'Error submitting night action:', err, true);
      UI.Toast('Gagal mengirim aksi malam: ' + (err.message || err), 'error');
    } finally {
      isSubmitting = false;
    }
  }

  /**
   * Internal night resolution logic
   */
  function resolveNightInternal(state, nightActions) {
    const playerRoles = { ...(state.playerRoles || {}) };
    let doctorTargetId = null;
    const werewolfTargetsTally = {};

    Object.entries(nightActions).forEach(([playerId, action]) => {
      if (action.role === 'doctor') {
        doctorTargetId = action.targetId;
      }
      if (action.role === 'werewolf' && action.targetId) {
        werewolfTargetsTally[action.targetId] = (werewolfTargetsTally[action.targetId] || 0) + 1;
      }
    });

    // Find werewolf victim with highest votes
    let victimId = null;
    let maxVotes = 0;
    Object.entries(werewolfTargetsTally).forEach(([targetId, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        victimId = targetId;
      }
    });

    let nightReport = {
      killedId: null,
      saved: false,
      message: 'Malam yang damai, tidak ada warga yang terluka.'
    };

    let nextStatus = 'day_announcement';
    let hunterPendingDeath = null;

    if (victimId) {
      if (victimId === doctorTargetId) {
        // Saved by Doctor
        nightReport = {
          killedId: null,
          saved: true,
          message: 'Werewolf mencoba menyerang warga, namun Doctor berhasil melindunginya! Tidak ada korban jiwa semalam.'
        };
      } else {
        // Victim Killed
        if (playerRoles[victimId]) {
          playerRoles[victimId].isAlive = false;
          nightReport = {
            killedId: victimId,
            saved: false,
            message: `${playerRoles[victimId].name} telah dimangsa oleh Werewolf!`
          };

          // If victim is Hunter, trigger Hunter revenge
          if (playerRoles[victimId].role === 'hunter') {
            nextStatus = 'hunter_revenge';
            hunterPendingDeath = { hunterId: victimId, killerType: 'werewolf' };
          }
        }
      }
    }

    // Check Win Condition (Hunter revenge executes BEFORE checking game over!)
    let winner = null;
    if (nextStatus !== 'hunter_revenge') {
      winner = checkWinCondition(playerRoles);
      if (winner) {
        nextStatus = 'game_over';
      }
    }

    return {
      playerRoles,
      status: nextStatus,
      nightReport,
      lastNightSavedDoctorId: doctorTargetId || null,
      hunterPendingDeath,
      winner: winner || null,
      nightActions: {}
    };
  }

  /**
   * Host manual resolve night button
   */
  async function resolveNight() {
    if (!currentRoom || !currentPlayer?.isHost || isSubmitting) return;
    isSubmitting = true;
    try {
      UI.Sound.click();

      const state = getGameState(currentRoom);
      const resolved = resolveNightInternal(state, state.nightActions || {});
      await DB.updateGameState(currentRoom.code, 'werewolf', resolved);
    } catch (err) {
      UI.Logger('WEREWOLF', 'Error resolving night:', err, true);
    } finally {
      isSubmitting = false;
    }
  }

  async function startDayVoting() {
    if (!currentRoom || !currentPlayer?.isHost || isSubmitting) return;
    isSubmitting = true;
    try {
      UI.Sound.click();
      await DB.updateGameState(currentRoom.code, 'werewolf', {
        status: 'day_voting',
        dayVotes: {}
      });
    } catch (err) {
      UI.Logger('WEREWOLF', 'Error starting day voting:', err, true);
    } finally {
      isSubmitting = false;
    }
  }

  function selectDayVoteTarget(targetId) {
    localDayVoteSelection = targetId;
    UI.Sound.pop();
    render(document.getElementById('app'), currentRoom, currentPlayer);
  }

  async function submitDayVote() {
    if (!currentRoom || !currentPlayer || isSubmitting) return;
    if (!localDayVoteSelection) {
      UI.Toast('Pilih 1 nama tersangka atau Abstain!', 'warning');
      return;
    }

    isSubmitting = true;
    try {
      UI.Sound.click();

      const state = getGameState(currentRoom);
      const dayVotes = { ...(state.dayVotes || {}) };
      dayVotes[currentPlayer.id] = localDayVoteSelection;

      const livingPlayers = Object.values(state.playerRoles || {}).filter(p => p.isAlive);
      const allVoted = Object.keys(dayVotes).length >= livingPlayers.length;

      const updates = { dayVotes };
      if (allVoted) {
        const resolved = resolveDayVotingInternal(state, dayVotes);
        Object.assign(updates, resolved);
      }

      await DB.updateGameState(currentRoom.code, 'werewolf', updates);

      localDayVoteSelection = null;
    } catch (err) {
      UI.Logger('WEREWOLF', 'Error submitting day vote:', err, true);
      UI.Toast('Gagal mengirim voting: ' + (err.message || err), 'error');
    } finally {
      isSubmitting = false;
    }
  }

  /**
   * Internal day vote resolution logic
   */
  function resolveDayVotingInternal(state, dayVotes) {
    const playerRoles = { ...(state.playerRoles || {}) };
    const voteTally = {};

    Object.values(dayVotes).forEach(targetId => {
      voteTally[targetId] = (voteTally[targetId] || 0) + 1;
    });

    let highestCandidate = null;
    let maxVotes = 0;
    let isTie = false;

    Object.entries(voteTally).forEach(([candId, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        highestCandidate = candId;
        isTie = false;
      } else if (count === maxVotes) {
        isTie = true;
      }
    });

    let nextStatus = 'night';
    let hunterPendingDeath = null;
    const round = (state.round || 1) + 1;

    if (!isTie && highestCandidate && highestCandidate !== 'skip') {
      const executedId = highestCandidate;
      if (playerRoles[executedId]) {
        playerRoles[executedId].isAlive = false;

        // If executed is Hunter, trigger revenge
        if (playerRoles[executedId].role === 'hunter') {
          nextStatus = 'hunter_revenge';
          hunterPendingDeath = { hunterId: executedId, killerType: 'vote' };
        }
      }
    }

    // Check Win Condition (Hunter revenge executes BEFORE checking game over!)
    let winner = null;
    if (nextStatus !== 'hunter_revenge') {
      winner = checkWinCondition(playerRoles);
      if (winner) {
        nextStatus = 'game_over';
      }
    }

    return {
      playerRoles,
      status: nextStatus,
      round: nextStatus === 'night' ? round : (state.round || 1),
      hunterPendingDeath,
      winner: winner || null,
      dayVotes: {},
      nightActions: {}
    };
  }

  async function resolveDayVoting() {
    if (!currentRoom || !currentPlayer?.isHost || isSubmitting) return;
    isSubmitting = true;
    try {
      UI.Sound.click();

      const state = getGameState(currentRoom);
      const resolved = resolveDayVotingInternal(state, state.dayVotes || {});
      await DB.updateGameState(currentRoom.code, 'werewolf', resolved);
    } catch (err) {
      UI.Logger('WEREWOLF', 'Error resolving day voting:', err, true);
    } finally {
      isSubmitting = false;
    }
  }

  async function submitHunterShot() {
    if (!currentRoom || !currentPlayer || !localNightSelection || isSubmitting) return;

    isSubmitting = true;
    try {
      UI.Sound.gong();

      const state = getGameState(currentRoom);
      const playerRoles = { ...(state.playerRoles || {}) };
      const shotTargetId = localNightSelection;

      if (playerRoles[shotTargetId]) {
        playerRoles[shotTargetId].isAlive = false;
        UI.Toast(`💥 Hunter menembak mati ${playerRoles[shotTargetId].name}!`, 'info');
      }

      const winner = checkWinCondition(playerRoles);
      const nextStatus = winner ? 'game_over' : 'night';
      const round = nextStatus === 'night' ? (state.round || 1) + 1 : (state.round || 1);

      await DB.updateGameState(currentRoom.code, 'werewolf', {
        playerRoles,
        status: nextStatus,
        round,
        hunterPendingDeath: null,
        winner: winner || null,
        dayVotes: {},
        nightActions: {}
      });

      localNightSelection = null;
    } catch (err) {
      UI.Logger('WEREWOLF', 'Error submitting hunter shot:', err, true);
      UI.Toast('Gagal menembak: ' + (err.message || err), 'error');
    } finally {
      isSubmitting = false;
    }
  }

  async function restartGame() {
    if (!currentRoom || !currentPlayer?.isHost || isSubmitting) return;
    isSubmitting = true;
    try {
      UI.Sound.click();

      await DB.updateGameState(currentRoom.code, 'werewolf', {
        status: 'config',
        round: 1,
        playerRoles: {},
        nightActions: {},
        dayVotes: {},
        nightReport: null,
        lastNightSavedDoctorId: null,
        hunterPendingDeath: null,
        winner: null
      });
    } catch (err) {
      UI.Logger('WEREWOLF', 'Error restarting game:', err, true);
    } finally {
      isSubmitting = false;
    }
  }

  function cleanup() {
    isCardFlipped = false;
    localNightSelection = null;
    localDayVoteSelection = null;
    localSeerInspectionResult = null;
    isSubmitting = false;
    UI.Logger('WEREWOLF', 'Cleaned up WerewolfGame state');
  }

  return {
    init: () => {},
    render,
    onStateChange: (roomData) => {
      currentRoom = roomData;
      const state = getGameState(roomData);
      if (state.winner) {
        UI.Confetti();
        UI.Sound.fanfare();
      }
    },
    startGame,
    toggleCardFlip,
    confirmReady,
    forceStartNight,
    selectNightTarget,
    submitNightAction,
    resolveNight,
    startDayVoting,
    selectDayVoteTarget,
    submitDayVote,
    resolveDayVoting,
    submitHunterShot,
    restartGame,
    cleanup
  };
})();

if (typeof window !== 'undefined') {
  window.WerewolfGame = WerewolfGame;
}
