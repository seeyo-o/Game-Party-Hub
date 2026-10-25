/**
 * ==========================================================================
 * DISCORD PARTY HUB - APP ORCHESTRATOR & LOBBY SYSTEM
 * ==========================================================================
 * Mengatur siklus hidup aplikasi, lobby matchmaking, pemilihan game,
 * sinkronisasi tema antar-pemain, dan perutean modul game.
 */

const App = (function () {
  'use strict';

  // Global Hub State
  let currentRoom = null;
  let currentPlayer = null;
  let selectedGameToLaunch = 'tentang-kita';

  const GAME_CATALOG = [
    {
      id: 'tentang-kita',
      title: 'Tentang Kita',
      subtitle: 'Kartu Deep Talk, Persepsi & Tantangan Seru',
      badge: 'SIAP DIMAINKAN',
      badgeVariant: 'accent',
      icon: 'heart-handshake',
      theme: 'tentang-kita',
      colorClasses: 'from-rose-500/10 to-amber-500/10 border-rose-300 text-rose-900',
      description: '48 kartu penuh obrolan hangat, opini tidak populer, dan tantangan spontan yang dirancang untuk mempererat tongkrongan Discord.'
    },
    {
      id: 'voting',
      title: 'Siapa di Antara Kita',
      subtitle: 'The Voting Game (Bongkar Rahasia)',
      badge: 'SIAP DIMAINKAN',
      badgeVariant: 'success',
      icon: 'vote',
      theme: 'voting',
      colorClasses: 'from-emerald-500/10 to-teal-500/10 border-emerald-300 text-emerald-900',
      description: 'Voting rahasia untuk menentukan siapa yang paling mungkin melakukan hal-hal konyol, absurd, atau heroik di server.'
    },
    {
      id: 'guess-who',
      title: 'Guess Who? Battle Royale',
      subtitle: 'Tebak Karakter & Eliminasi Cepat',
      badge: 'SIAP DIMAINKAN',
      badgeVariant: 'primary',
      icon: 'user-search',
      theme: 'guess-who',
      colorClasses: 'from-sky-500/10 to-violet-500/10 border-sky-300 text-sky-900',
      description: 'Lontarkan pertanyaan YA atau TIDAK untuk menebak karakter misterius pemain lain sebelum waktumu habis.'
    },
    {
      id: 'werewolf',
      title: 'Werewolf',
      subtitle: 'Dusk of Deception (Moderator Otomatis)',
      badge: 'SIAP DIMAINKAN',
      badgeVariant: 'accent',
      icon: 'moon',
      theme: 'werewolf',
      colorClasses: 'from-indigo-500/10 to-purple-500/10 border-indigo-300 text-indigo-900',
      description: 'Deduksi malam & siang tanpa perlu moderator manual. Werewolf memangsa, Seer menerawang, dan warga berunding di siang hari.'
    },
    {
      id: 'coup',
      title: 'Coup',
      subtitle: 'Kudeta Kota Dystopia (Bluffing)',
      badge: 'PANDUAN SIAP',
      badgeVariant: 'warning',
      icon: 'crown',
      theme: 'coup',
      colorClasses: 'from-amber-500/10 to-rose-500/10 border-amber-300 text-amber-900',
      description: 'Gertakan kartu bangsawan, manipulasi pajak, dan kudeta politik. Bebas mengaku punya kartu apapun asalkan tidak ketahuan!'
    },
    {
      id: 'costume-detective',
      title: 'Costume Party Detective',
      subtitle: 'Misteri Pesta Topeng 6 Ruangan',
      badge: 'PANDUAN SIAP',
      badgeVariant: 'warning',
      icon: 'glasses',
      theme: 'costume-detective',
      colorClasses: 'from-teal-500/10 to-violet-500/10 border-teal-300 text-teal-900',
      description: 'Sembunyikan identitas kostummu di antara 6 ruangan pesta, gerakkan karakter untuk mengecoh lawan, dan tebak samaran mereka.'
    }
  ];

  /**
   * Main App Initialization
   */
  async function init() {
    UI.Logger('APP', 'Initializing Discord Party Hub...');
    UI.setTheme('lobby');

    // Initialize Firebase
    DB.init();

    // Reconnect session if exists
    const savedSession = DB.getPlayerSession();
    if (savedSession && savedSession.roomCode) {
      UI.Logger('APP', 'Found existing player session', savedSession);
      currentPlayer = savedSession;
      connectToRoom(savedSession.roomCode);
    } else {
      renderWelcomeView();
    }
  }

  /**
   * Connect to room and listen to real-time changes
   */
  function connectToRoom(roomCode) {
    DB.listenToRoom(roomCode, (roomData) => {
      if (!roomData) {
        UI.Toast('Ruangan telah ditutup atau tidak aktif.', 'info');
        currentRoom = null;
        currentPlayer = null;
        DB.clearPlayerSession();
        UI.setTheme('lobby');
        renderWelcomeView();
        return;
      }

      currentRoom = roomData;

      // Update current player state from room data
      if (currentPlayer && roomData.players && roomData.players[currentPlayer.id]) {
        currentPlayer = {
          ...currentPlayer,
          ...roomData.players[currentPlayer.id]
        };
      }

      routeRoomState();
    });
  }

  /**
   * Directs view based on room.currentGame
   */
  function routeRoomState() {
    const appEl = document.getElementById('app');
    if (!appEl || !currentRoom) return;

    const gameMode = currentRoom.currentGame || 'lobby';
    UI.Logger('APP', `Routing room state to: [${gameMode}]`);

    // Synchronize global theme across all players
    UI.setTheme(gameMode);

    if (gameMode === 'lobby') {
      if (typeof VotingGame.cleanup === 'function') VotingGame.cleanup();
      if (typeof GuessWhoGame.cleanup === 'function') GuessWhoGame.cleanup();
      if (typeof WerewolfGame.cleanup === 'function') WerewolfGame.cleanup();
      renderLobbyView();
    } else if (gameMode === 'tentang-kita') {
      if (typeof VotingGame.cleanup === 'function') VotingGame.cleanup();
      if (typeof GuessWhoGame.cleanup === 'function') GuessWhoGame.cleanup();
      if (typeof WerewolfGame.cleanup === 'function') WerewolfGame.cleanup();
      TentangKitaGame.render(appEl, currentRoom, currentPlayer);
    } else if (gameMode === 'voting') {
      if (typeof GuessWhoGame.cleanup === 'function') GuessWhoGame.cleanup();
      if (typeof WerewolfGame.cleanup === 'function') WerewolfGame.cleanup();
      if (typeof VotingGame.onStateChange === 'function') {
        VotingGame.onStateChange(currentRoom);
      }
      VotingGame.render(appEl, currentRoom, currentPlayer);
    } else if (gameMode === 'guess-who') {
      if (typeof VotingGame.cleanup === 'function') VotingGame.cleanup();
      if (typeof WerewolfGame.cleanup === 'function') WerewolfGame.cleanup();
      if (typeof GuessWhoGame.onStateChange === 'function') {
        GuessWhoGame.onStateChange(currentRoom);
      }
      GuessWhoGame.render(appEl, currentRoom, currentPlayer);
    } else if (gameMode === 'werewolf') {
      if (typeof VotingGame.cleanup === 'function') VotingGame.cleanup();
      if (typeof GuessWhoGame.cleanup === 'function') GuessWhoGame.cleanup();
      if (typeof WerewolfGame.onStateChange === 'function') {
        WerewolfGame.onStateChange(currentRoom);
      }
      WerewolfGame.render(appEl, currentRoom, currentPlayer);
    } else if (['coup', 'costume-detective'].includes(gameMode)) {
      if (typeof VotingGame.cleanup === 'function') VotingGame.cleanup();
      if (typeof GuessWhoGame.cleanup === 'function') GuessWhoGame.cleanup();
      if (typeof WerewolfGame.cleanup === 'function') WerewolfGame.cleanup();
      renderUpcomingGameView(gameMode);
    }
  }

  /**
   * ==========================================================================
   * VIEW 1: WELCOME & ROOM CREATION / JOIN SCREEN
   * ==========================================================================
   */
  function renderWelcomeView() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    UI.setTheme('lobby');

    // Saved player name preference
    const defaultName = localStorage.getItem('hub_player_name') || '';

    const heroContentHTML = `
      <div class="max-w-md mx-auto py-2">
        <!-- Player Name Input -->
        <div class="mb-5">
          <label class="block font-display font-bold text-sm text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Nama Panggilanmu di Game</span>
            <span class="text-xs text-indigo-600 font-semibold">Tampil di Discord</span>
          </label>
          <div class="relative">
            <input 
              id="input-player-name" 
              type="text" 
              maxlength="16" 
              placeholder="Contoh: KucingOren, LordBudi..." 
              value="${defaultName}"
              class="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-900/10 font-display font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
            />
            <div class="absolute right-3.5 top-3.5 text-slate-400">
              <i data-lucide="user" class="w-5 h-5"></i>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <button 
            onclick="App.handleCreateRoom()"
            class="w-full py-4 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-display font-bold text-base shadow-lg shadow-indigo-600/25 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <i data-lucide="crown" class="w-5 h-5 text-amber-300"></i>
            <span>Buat Room Baru (Jadi Host)</span>
          </button>

          <div class="relative flex py-2 items-center">
            <div class="flex-grow border-t border-slate-200"></div>
            <span class="flex-shrink mx-3 text-xs font-display font-semibold text-slate-400 uppercase tracking-wider">Atau Gabung Room Teman</span>
            <div class="flex-grow border-t border-slate-200"></div>
          </div>

          <div class="flex gap-2">
            <input 
              id="input-room-code" 
              type="text" 
              maxlength="4" 
              placeholder="KODE (4 HURUF)" 
              class="w-1/2 px-4 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-900/10 font-display font-black text-center uppercase tracking-widest text-slate-800 placeholder:text-slate-400 placeholder:font-normal focus:bg-white focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all"
              onkeyup="this.value = this.value.toUpperCase()"
            />
            <button 
              onclick="App.handleJoinRoom()"
              class="w-1/2 py-3.5 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-display font-bold text-sm shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <i data-lucide="log-in" class="w-4 h-4"></i>
              <span>Gabung Room</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Feature preview cards - 6 Games Interactive Grid
    const featureCardsHTML = `
      <div class="mt-8">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <i data-lucide="sparkles" class="w-4 h-4 text-indigo-600"></i>
            <h3 class="font-display font-black text-sm uppercase tracking-wider text-slate-700">Pilihan Game Party Tongkrongan</h3>
          </div>
          <span class="text-xs font-display font-semibold text-slate-400">6 Game Tersedia</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- 1. Tentang Kita -->
          <div 
            onclick="GameRules.open('tentang-kita', 'welcome')"
            class="p-5 rounded-3xl bg-white/90 border-2 border-slate-900/5 shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-rose-300 transition-all cursor-pointer group flex flex-col justify-between select-none"
            title="Klik untuk melihat cara bermain Tentang Kita"
          >
            <div>
              <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
                  <i data-lucide="heart-handshake" class="w-5 h-5"></i>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-display font-bold">
                  Deep Talk
                </span>
              </div>
              <h4 class="font-display font-bold text-base text-slate-800 group-hover:text-rose-600 transition-colors">Tentang Kita</h4>
              <p class="font-body text-xs text-slate-500 mt-1 leading-relaxed">48 Kartu deep talk, uneg-uneg, dan tantangan spontan discord.</p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-display font-bold text-rose-600 group-hover:text-rose-700">
              <span>📖 Klik untuk Cara Bermain</span>
              <span class="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          <!-- 2. The Voting Game -->
          <div 
            onclick="GameRules.open('voting', 'welcome')"
            class="p-5 rounded-3xl bg-white/90 border-2 border-slate-900/5 shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group flex flex-col justify-between select-none"
            title="Klik untuk melihat cara bermain The Voting Game"
          >
            <div>
              <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-xs">
                  <i data-lucide="vote" class="w-5 h-5"></i>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-display font-bold">
                  Bongkar Rahasia
                </span>
              </div>
              <h4 class="font-display font-bold text-base text-slate-800 group-hover:text-emerald-600 transition-colors">The Voting Game</h4>
              <p class="font-body text-xs text-slate-500 mt-1 leading-relaxed">Tebak siapa yang paling mungkin melakukan hal gila di tongkrongan.</p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-display font-bold text-emerald-600 group-hover:text-emerald-700">
              <span>📖 Klik untuk Cara Bermain</span>
              <span class="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          <!-- 3. Guess Who? -->
          <div 
            onclick="GameRules.open('guess-who', 'welcome')"
            class="p-5 rounded-3xl bg-white/90 border-2 border-slate-900/5 shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-sky-300 transition-all cursor-pointer group flex flex-col justify-between select-none"
            title="Klik untuk melihat cara bermain Guess Who?"
          >
            <div>
              <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shadow-xs">
                  <i data-lucide="user-search" class="w-5 h-5"></i>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 text-[10px] font-display font-bold">
                  Battle Royale
                </span>
              </div>
              <h4 class="font-display font-bold text-base text-slate-800 group-hover:text-sky-600 transition-colors">Guess Who?</h4>
              <p class="font-body text-xs text-slate-500 mt-1 leading-relaxed">Eliminasi karakter misterius dengan logika pertanyaan cepat.</p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-display font-bold text-sky-600 group-hover:text-sky-700">
              <span>📖 Klik untuk Cara Bermain</span>
              <span class="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          <!-- 4. Werewolf -->
          <div 
            onclick="GameRules.open('werewolf', 'welcome')"
            class="p-5 rounded-3xl bg-white/90 border-2 border-slate-900/5 shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col justify-between select-none"
            title="Klik untuk melihat cara bermain Werewolf"
          >
            <div>
              <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs">
                  <i data-lucide="moon" class="w-5 h-5"></i>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-display font-bold">
                  Deduksi Malam
                </span>
              </div>
              <h4 class="font-display font-bold text-base text-slate-800 group-hover:text-indigo-600 transition-colors">Werewolf</h4>
              <p class="font-body text-xs text-slate-500 mt-1 leading-relaxed">Deduksi malam & siang tanpa perlu moderator manual.</p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-display font-bold text-indigo-600 group-hover:text-indigo-700">
              <span>📖 Klik untuk Cara Bermain</span>
              <span class="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          <!-- 5. Coup -->
          <div 
            onclick="GameRules.open('coup', 'welcome')"
            class="p-5 rounded-3xl bg-white/90 border-2 border-slate-900/5 shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group flex flex-col justify-between select-none"
            title="Klik untuk melihat cara bermain Coup"
          >
            <div>
              <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-xs">
                  <i data-lucide="crown" class="w-5 h-5"></i>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-display font-bold">
                  Gertakan & Kudeta
                </span>
              </div>
              <h4 class="font-display font-bold text-base text-slate-800 group-hover:text-amber-600 transition-colors">Coup</h4>
              <p class="font-body text-xs text-slate-500 mt-1 leading-relaxed">Gertakan kartu bangsawan, pajak, dan kudeta.</p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-display font-bold text-amber-600 group-hover:text-amber-700">
              <span>📖 Klik untuk Cara Bermain</span>
              <span class="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>

          <!-- 6. Costume Party Detective -->
          <div 
            onclick="GameRules.open('costume-detective', 'welcome')"
            class="p-5 rounded-3xl bg-white/90 border-2 border-slate-900/5 shadow-sm hover:-translate-y-1 hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group flex flex-col justify-between select-none"
            title="Klik untuk melihat cara bermain Costume Party Detective"
          >
            <div>
              <div class="flex items-center justify-between mb-3">
                <div class="w-10 h-10 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center shadow-xs">
                  <i data-lucide="glasses" class="w-5 h-5"></i>
                </div>
                <span class="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-[10px] font-display font-bold">
                  Misteri Topeng
                </span>
              </div>
              <h4 class="font-display font-bold text-base text-slate-800 group-hover:text-teal-600 transition-colors">Costume Party Detective</h4>
              <p class="font-body text-xs text-slate-500 mt-1 leading-relaxed">Sembunyikan identitas kostummu di antara 6 ruangan.</p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-display font-bold text-teal-600 group-hover:text-teal-700">
              <span>📖 Klik untuk Cara Bermain</span>
              <span class="group-hover:translate-x-1 transition-transform">→</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const fullHTML = `
      <div class="w-full max-w-5xl mx-auto my-auto py-6">
        <!-- Top App Bar -->
        <div class="flex items-center justify-between mb-8">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <span class="text-2xl">🎮</span>
            </div>
            <div>
              <h1 class="font-display font-black text-2xl sm:text-3xl tracking-tight text-slate-900">
                Discord Party Hub
              </h1>
              <p class="font-body text-xs sm:text-sm text-slate-500 font-medium">Tempat seru-seruan voice chat bareng teman satu server!</p>
            </div>
          </div>

          <button 
            onclick="App.openSettingsModal()" 
            class="p-2.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-600 border-2 border-slate-900/10 transition-all active:scale-95 shadow-sm"
            title="Pengaturan Database Firebase"
          >
            <i data-lucide="settings" class="w-5 h-5"></i>
          </button>
        </div>

        <!-- Main Card Container -->
        ${UI.Container({
          title: 'Mulai Bermain 🎉',
          subtitle: 'Masukkan namamu untuk membuat atau bergabung ke dalam ruangan.',
          icon: 'sparkles',
          content: heroContentHTML
        })}

        ${featureCardsHTML}
      </div>
    `;

    appEl.innerHTML = fullHTML;
    UI.refreshIcons();
  }

  /**
   * ==========================================================================
   * VIEW 2: IN-ROOM LOBBY SCREEN (WAITING ROOM & GAME PICKER)
   * ==========================================================================
   */
  function renderLobbyView() {
    const appEl = document.getElementById('app');
    if (!appEl || !currentRoom) return;

    const isHost = currentPlayer && currentPlayer.isHost;
    const playerList = Object.values(currentRoom.players || {});

    // Players Grid
    const playerGridHTML = playerList.map((p, index) => {
      const isMe = currentPlayer && p.id === currentPlayer.id;

      return `
        <div class="p-3 sm:p-4 rounded-2xl bg-slate-50 border-2 border-slate-900/5 flex items-center gap-3 transition-transform hover:scale-102">
          ${UI.Avatar({ name: p.name, size: 'md', isHost: p.isHost, colorIndex: p.colorIndex || index })}
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <span class="font-display font-bold text-sm text-slate-800 truncate">${p.name}</span>
              ${isMe ? '<span class="px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold shrink-0">KAMU</span>' : ''}
            </div>
            <div class="text-[11px] font-body text-slate-400 mt-0.5">
              ${p.isHost ? '👑 Pembuat Room (Host)' : 'Pemain'}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Game Selector List
    const gameListHTML = GAME_CATALOG.map((game) => {
      const isSelected = selectedGameToLaunch === game.id;
      const selectAction = isHost ? `onclick="App.selectGame('${game.id}')"` : '';
      const borderClass = isSelected ? 'border-indigo-600 bg-indigo-50/40 ring-4 ring-indigo-500/10' : 'border-slate-900/10 bg-white hover:border-slate-900/20';

      return `
        <div 
          ${selectAction}
          class="p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer select-none ${borderClass} relative flex items-start gap-3 sm:gap-4 group"
        >
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br ${game.colorClasses} border flex items-center justify-center shrink-0">
            <i data-lucide="${game.icon}" class="w-6 h-6"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <h4 class="font-display font-bold text-base text-slate-900">${game.title}</h4>
              ${UI.Badge({ text: game.badge, variant: game.badgeVariant })}
              <button 
                onclick="event.stopPropagation(); GameRules.open('${game.id}', 'lobby')"
                class="ml-auto px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-500 text-[10px] font-display font-bold flex items-center gap-1 transition-all cursor-pointer"
                title="Buka Cara Bermain ${game.title}"
              >
                <i data-lucide="book-open" class="w-3 h-3"></i>
                <span>Panduan</span>
              </button>
            </div>
            <p class="font-body text-xs text-slate-500 line-clamp-2 leading-relaxed">${game.description}</p>
          </div>
          ${isSelected ? `
            <div class="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1">
              <i data-lucide="check" class="w-3.5 h-3.5"></i>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Assemble Full In-Room Lobby View
    const lobbyContent = `
      <div class="w-full">
        <!-- Top Navigation Bar -->
        <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <span class="text-xl">🎲</span>
            </div>
            <div>
              <h2 class="font-display font-black text-xl text-slate-900">Lobby Permainan</h2>
              <p class="font-body text-xs text-slate-500">Tunggu semua teman masuk sebelum memulai game!</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Room Code Card & Copy -->
            <div class="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-2xl border-2 border-slate-900/10 shadow-sm">
              <span class="text-xs font-display font-bold text-slate-400">KODE:</span>
              <span class="font-display font-black text-lg text-indigo-600 tracking-widest">${currentRoom.code}</span>
              <button 
                onclick="App.copyRoomCode()" 
                class="ml-1 p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 active:scale-95 transition-all"
                title="Salin Kode Room"
              >
                <i data-lucide="copy" class="w-4 h-4"></i>
              </button>
            </div>

            <button 
              onclick="App.handleLeaveRoom()"
              class="px-3.5 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-200/80 font-display font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <i data-lucide="log-out" class="w-4 h-4"></i>
              <span>Keluar</span>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <!-- Left Column: Players List -->
          <div class="lg:col-span-5 flex flex-col gap-4">
            <div class="bg-white rounded-3xl border-2 border-slate-900/10 p-5 sm:p-6 shadow-joyful">
              <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div class="flex items-center gap-2">
                  <i data-lucide="users" class="w-5 h-5 text-indigo-600"></i>
                  <h3 class="font-display font-bold text-base text-slate-800">Daftar Pemain</h3>
                </div>
                <span class="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-display font-bold">
                  ${playerList.length} Orang
                </span>
              </div>

              <div class="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                ${playerGridHTML}
              </div>

              <div class="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-500 font-body flex items-center gap-2">
                <i data-lucide="info" class="w-4 h-4 text-slate-400 shrink-0"></i>
                <span>Bagikan kode <b>${currentRoom.code}</b> ke teman Discordmu untuk bergabung!</span>
              </div>
            </div>
          </div>

          <!-- Right Column: Game Selector (Host controls) -->
          <div class="lg:col-span-7 flex flex-col gap-4">
            <div class="bg-white rounded-3xl border-2 border-slate-900/10 p-5 sm:p-6 shadow-joyful">
              <div class="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <div class="flex items-center gap-2">
                  <i data-lucide="gamepad-2" class="w-5 h-5 text-indigo-600"></i>
                  <h3 class="font-display font-bold text-base text-slate-800">Pilih Game Party</h3>
                </div>
                <div class="flex items-center gap-2">
                  <button 
                    onclick="GameRules.open(App.getSelectedGame(), 'lobby')" 
                    class="px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-display font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
                    title="Buka Panduan & Aturan Permainan"
                  >
                    <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
                    <span>📖 Panduan</span>
                  </button>
                  ${isHost 
                    ? '<span class="text-xs font-display font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">👑 Khusus Host</span>' 
                    : '<span class="text-xs font-display font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">Menunggu Host...</span>'
                  }
                </div>
              </div>

              <div class="space-y-3">
                ${gameListHTML}
              </div>

              <!-- Start Button -->
              <div class="mt-6 pt-4 border-t border-slate-100">
                ${isHost ? `
                  <button 
                    onclick="App.launchSelectedGame()"
                    class="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-display font-black text-base shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <i data-lucide="play" class="w-5 h-5"></i>
                    <span>Mulai Game untuk Semua Pemain 🚀</span>
                  </button>
                ` : `
                  <div class="p-4 rounded-2xl bg-indigo-50 border-2 border-indigo-200/70 text-center">
                    <p class="font-display font-bold text-sm text-indigo-900 flex items-center justify-center gap-2">
                      <span class="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></span>
                      Menunggu Host memulai permainan...
                    </p>
                  </div>
                `}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    appEl.innerHTML = lobbyContent;
    UI.refreshIcons();
  }

  /**
   * ==========================================================================
   * VIEW 3: UPCOMING GAME STAGING & DISCORD PLAY SCREEN
   * ==========================================================================
   */
  function renderUpcomingGameView(gameMode) {
    const appEl = document.getElementById('app');
    if (!appEl || !currentRoom) return;

    const game = GAME_CATALOG.find(g => g.id === gameMode) || GAME_CATALOG[0];
    const isHost = currentPlayer && currentPlayer.isHost;

    const contentHTML = `
      <div class="max-w-xl mx-auto py-6 text-center space-y-6">
        <div class="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br ${game.colorClasses} border-2 flex items-center justify-center shadow-lg">
          <i data-lucide="${game.icon}" class="w-10 h-10"></i>
        </div>

        <div>
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-xs font-display font-bold mb-2">
            <i data-lucide="sparkles" class="w-3.5 h-3.5"></i>
            <span>Panduan & Aturan Siap Dimainkan!</span>
          </div>
          <h2 class="font-display font-black text-2xl sm:text-3xl text-slate-900">${game.title}</h2>
          <p class="font-body text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto leading-relaxed">
            ${game.description}
          </p>
        </div>

        <div class="p-5 rounded-3xl bg-white/80 border-2 border-slate-900/5 shadow-sm text-left space-y-3">
          <h4 class="font-display font-bold text-sm text-slate-800 flex items-center gap-2">
            <i data-lucide="info" class="w-4 h-4 text-indigo-600"></i>
            <span>Bisa Langsung Dimainkan di Discord!</span>
          </h4>
          <p class="font-body text-xs text-slate-500 leading-relaxed">
            Modul papan interaktif game ini sedang dalam tahap perakitan otomatis. Namun kamu dan teman-temanmu di Voice Chat Discord sudah bisa memainkannya secara seru menggunakan <b>Panduan Lengkap, Peran, & Aturan</b> resmi kami.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button 
            onclick="GameRules.open('${game.id}', 'lobby')"
            class="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-display font-bold text-sm shadow-lg shadow-indigo-600/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <i data-lucide="book-open" class="w-4 h-4"></i>
            <span>Buka Panduan & Cara Bermain 📖</span>
          </button>

          <button 
            onclick="App.returnToLobby()"
            class="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-display font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <i data-lucide="arrow-left" class="w-4 h-4"></i>
            <span>${isHost ? 'Kembali ke Lobby (Pilih Game Lain)' : 'Kembali ke Lobby'}</span>
          </button>
        </div>
      </div>
    `;

    appEl.innerHTML = `
      <div class="w-full max-w-3xl mx-auto py-6">
        ${UI.Container({
          title: `${game.title} 🎲`,
          subtitle: game.subtitle,
          icon: game.icon,
          content: contentHTML
        })}
      </div>
    `;

    // Sinkronkan juga kontainer staging terpisah jika dibutuhkan
    const stagingEl = document.getElementById(`${gameMode}-view`);
    if (stagingEl) {
      stagingEl.innerHTML = contentHTML;
    }

    UI.refreshIcons();
  }

  /**
   * ==========================================================================
   * USER ACTIONS & EVENT HANDLERS
   * ==========================================================================
   */

  async function handleCreateRoom() {
    const nameInput = document.getElementById('input-player-name');
    const name = nameInput?.value?.trim();

    if (!name) {
      UI.Toast('Masukkan nama panggilanmu terlebih dahulu!', 'warning');
      nameInput?.focus();
      return;
    }

    localStorage.setItem('hub_player_name', name);
    UI.Sound.click();

    const res = await DB.createRoom(name);
    if (res.success) {
      currentPlayer = res.player;
      currentRoom = res.roomData;
      UI.Toast(`Room berhasil dibuat! Kode: ${res.roomCode}`, 'success');
      connectToRoom(res.roomCode);
    }
  }

  async function handleJoinRoom() {
    const nameInput = document.getElementById('input-player-name');
    const codeInput = document.getElementById('input-room-code');

    const name = nameInput?.value?.trim();
    const code = codeInput?.value?.trim()?.toUpperCase();

    if (!name) {
      UI.Toast('Masukkan nama panggilanmu terlebih dahulu!', 'warning');
      nameInput?.focus();
      return;
    }

    if (!code || code.length !== 4) {
      UI.Toast('Masukkan 4 huruf kode room yang valid!', 'warning');
      codeInput?.focus();
      return;
    }

    localStorage.setItem('hub_player_name', name);
    UI.Sound.click();

    const res = await DB.joinRoom(code, name);
    if (res.success) {
      currentPlayer = res.player;
      currentRoom = res.roomData;
      UI.Toast(`Berhasil masuk ke Room: ${code}`, 'success');
      connectToRoom(code);
    }
  }

  async function handleLeaveRoom() {
    if (!currentRoom || !currentPlayer) return;

    if (confirm('Yakin ingin meninggalkan ruangan permainan?')) {
      UI.Sound.pop();
      await DB.leaveRoom(currentRoom.code, currentPlayer.id);
      currentRoom = null;
      currentPlayer = null;
      UI.setTheme('lobby');
      renderWelcomeView();
      UI.Toast('Kamu telah meninggalkan room.', 'info');
    }
  }

  function copyRoomCode() {
    if (!currentRoom) return;
    const code = currentRoom.code;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(() => {
        UI.Sound.pop();
        UI.Toast(`Kode "${code}" berhasil disalin ke clipboard!`, 'success');
      }).catch(() => {
        fallbackCopy(code);
      });
    } else {
      fallbackCopy(code);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    UI.Sound.pop();
    UI.Toast(`Kode "${text}" disalin ke clipboard!`, 'success');
  }

  function selectGame(gameId) {
    selectedGameToLaunch = gameId;
    UI.Sound.click();
    renderLobbyView();
  }

  async function launchSelectedGame() {
    if (!currentRoom || !currentPlayer?.isHost) return;
    UI.Sound.fanfare();
    UI.Confetti();
    UI.Logger('APP', `Host launched game: [${selectedGameToLaunch}]`);

    await DB.switchGame(currentRoom.code, selectedGameToLaunch);
  }

  async function returnToLobby() {
    if (!currentRoom) return;
    UI.Sound.click();
    UI.Logger('APP', 'Returning room to lobby...');

    // Host switches room state; if non-host clicks, they notify host or can return view
    if (currentPlayer?.isHost) {
      await DB.switchGame(currentRoom.code, 'lobby');
    } else {
      UI.Toast('Hanya Host yang dapat mengembalikan seluruh ruangan ke Lobby.', 'warning');
    }
  }

  /**
   * ==========================================================================
   * FIREBASE SETTINGS MODAL
   * ==========================================================================
   */
  function openSettingsModal() {
    const currentConfig = DB.getConfig();

    const contentHTML = `
      <div class="space-y-4">
        <p class="font-body text-xs text-slate-500 leading-relaxed">
          Aplikasi ini dapat langsung dimainkan dalam <b>Mode Demo</b> antar-tab browser, atau hubungkan dengan <b>Firebase Realtime Database</b> milikmu agar teman-teman di Discord bisa bergabung dari mana saja.
        </p>

        <div>
          <label class="block font-display font-semibold text-xs text-slate-700 mb-1">Database URL (Wajib untuk Online)</label>
          <input 
            id="cfg-databaseURL" 
            type="text" 
            placeholder="https://your-project-default-rtdb.firebaseio.com" 
            value="${currentConfig.databaseURL || ''}"
            class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-display font-semibold text-xs text-slate-700 mb-1">API Key</label>
            <input 
              id="cfg-apiKey" 
              type="text" 
              placeholder="AIzaSy..." 
              value="${currentConfig.apiKey || ''}"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label class="block font-display font-semibold text-xs text-slate-700 mb-1">Project ID</label>
            <input 
              id="cfg-projectId" 
              type="text" 
              placeholder="my-party-hub" 
              value="${currentConfig.projectId || ''}"
              class="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 font-mono text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div class="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-[11px] font-body">
          💡 <b>Tips Cepat:</b> Di Firebase Console, buat project baru, aktifkan Realtime Database (pilih Start in Test Mode), lalu salin Database URL ke kolom di atas.
        </div>
      </div>
    `;

    const footerHTML = `
      <button 
        onclick="App.resetToDemoConfig()" 
        class="px-4 py-2 rounded-xl text-xs font-display font-semibold text-slate-500 hover:text-slate-700"
      >
        Gunakan Demo Saja
      </button>
      <button 
        onclick="App.saveFirebaseSettings()" 
        class="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-display font-bold text-xs shadow"
      >
        Simpan & Terapkan
      </button>
    `;

    UI.Modal({
      title: 'Pengaturan Koneksi Firebase ⚙️',
      content: contentHTML,
      footer: footerHTML
    });
  }

  function saveFirebaseSettings() {
    const config = {
      apiKey: document.getElementById('cfg-apiKey')?.value?.trim() || '',
      projectId: document.getElementById('cfg-projectId')?.value?.trim() || '',
      databaseURL: document.getElementById('cfg-databaseURL')?.value?.trim() || ''
    };

    DB.saveConfig(config);
    UI.closeModal();
    setTimeout(() => {
      window.location.reload();
    }, 600);
  }

  function resetToDemoConfig() {
    DB.saveConfig({ apiKey: '', projectId: '', databaseURL: '' });
    UI.closeModal();
    UI.Toast('Beralih ke mode demo lokal.', 'info');
  }

  return {
    init,
    handleCreateRoom,
    handleJoinRoom,
    handleLeaveRoom,
    copyRoomCode,
    selectGame,
    launchSelectedGame,
    returnToLobby,
    openSettingsModal,
    saveFirebaseSettings,
    resetToDemoConfig,
    renderLobbyView,
    openGameRules: (id, ctx) => GameRules.open(id, ctx),
    getSelectedGame: () => selectedGameToLaunch
  };
})();

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
