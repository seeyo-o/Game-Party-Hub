/**
 * ==========================================================================
 * DISCORD PARTY HUB - FIREBASE REALTIME SERVICE
 * ==========================================================================
 * Centralized Firebase connection, room management, state synchronization,
 * and unified error logging with fallback capabilities.
 */

const DB = (function () {
  'use strict';

  // Default demo / placeholder config (User can customize via UI settings modal)
  const STORAGE_KEY_CONFIG = 'discord_party_hub_firebase_config';
  const STORAGE_KEY_PLAYER = 'discord_party_hub_player_session';

  let dbInstance = null;
  let activeListeners = {};
  let isOfflineMode = false;

  // BroadcastChannel for local cross-tab fallback sync when Firebase is not yet configured
  let fallbackChannel = null;
  try {
    fallbackChannel = new BroadcastChannel('discord_party_hub_sync');
  } catch (e) {
    // BroadcastChannel unsupported in older browsers
  }

  /**
   * Generates a fun, pronounceable 4-letter room code (e.g. KITA, SERU, ASIK, MAIN)
   */
  function generateRoomCode() {
    const consonants = 'BCDFGHJKLMNPRSTVWXYZ';
    const vowels = 'AEIOU';
    let code = '';
    for (let i = 0; i < 2; i++) {
      code += consonants.charAt(Math.floor(Math.random() * consonants.length));
      code += vowels.charAt(Math.floor(Math.random() * vowels.length));
    }
    return code;
  }

  /**
   * Generates unique player ID
   */
  function generatePlayerId() {
    return 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6);
  }

  return {
    /**
     * Retrieve stored Firebase config or default
     */
    getConfig() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
        if (saved) return JSON.parse(saved);
      } catch (err) {
        UI.Logger('FIREBASE', 'Error reading saved config', err, true);
      }
      return {
        apiKey: "",
        authDomain: "game-hub-ef38b.firebaseapp.com",
        databaseURL: "https://game-hub-ef38b-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "game-hub-ef38b",
        storageBucket: "game-hub-ef38b.appspot.com",
        messagingSenderId: "",
        appId: ""
      };
    },

    /**
     * Save custom config
     */
    saveConfig(config) {
      try {
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
        UI.Logger('FIREBASE', 'Config Saved to LocalStorage', config);
        UI.Toast('Konfigurasi Firebase tersimpan! Muat ulang halaman untuk menghubungkan.', 'success');
        return true;
      } catch (err) {
        UI.Logger('FIREBASE', 'Failed to save config', err, true);
        UI.Toast('Gagal menyimpan konfigurasi!', 'error');
        return false;
      }
    },

    /**
     * Check if valid databaseURL is present
     */
    isConfigured() {
      const config = this.getConfig();
      return Boolean(config && config.databaseURL && config.databaseURL.trim().length > 0);
    },

    /**
     * Initialize Firebase App & Realtime Database
     */
    init() {
      try {
        const config = this.getConfig();

        if (!config || !config.databaseURL || config.databaseURL.trim() === '') {
          UI.Logger('FIREBASE', 'No Firebase databaseURL found. Operating in Demo/Local mode.', null);
          isOfflineMode = true;
          return null;
        }

        if (!window.firebase) {
          UI.Logger('FIREBASE', 'Firebase SDK compat not found in window', null, true);
          isOfflineMode = true;
          return null;
        }

        if (!firebase.apps.length) {
          const configToInit = {
            ...config,
            apiKey: config.apiKey && config.apiKey.trim() !== '' ? config.apiKey : 'AIzaSyDummyKeyForRealtimeDatabase'
          };
          firebase.initializeApp(configToInit);
          UI.Logger('FIREBASE', 'Firebase App Initialized Successfully', { projectId: config.projectId, databaseURL: config.databaseURL });
        }

        dbInstance = firebase.database();
        isOfflineMode = false;

        // Monitor connection status
        const connectedRef = dbInstance.ref('.info/connected');
        connectedRef.on('value', (snap) => {
          if (snap.val() === true) {
            UI.Logger('FIREBASE', 'Connected to Realtime Database Server');
          } else {
            UI.Logger('FIREBASE', 'Disconnected from Realtime Database Server');
          }
        });

        return dbInstance;
      } catch (error) {
        UI.Logger('FIREBASE', 'Initialization Error', error.message, true);
        UI.Toast('Gagal terhubung ke Firebase: ' + error.message, 'warning');
        isOfflineMode = true;
        return null;
      }
    },

    isOffline() {
      return isOfflineMode;
    },

    /**
     * Save current player session
     */
    savePlayerSession(player) {
      try {
        sessionStorage.setItem(STORAGE_KEY_PLAYER, JSON.stringify(player));
      } catch (e) {}
    },

    /**
     * Get current player session
     */
    getPlayerSession() {
      try {
        const saved = sessionStorage.getItem(STORAGE_KEY_PLAYER);
        return saved ? JSON.parse(saved) : null;
      } catch (e) {
        return null;
      }
    },

    clearPlayerSession() {
      try {
        sessionStorage.removeItem(STORAGE_KEY_PLAYER);
      } catch (e) {}
    },

    /**
     * 1. CREATE ROOM
     * Creates a new game room and sets creator as HOST
     */
    async createRoom(hostName) {
      const playerId = generatePlayerId();
      const roomCode = generateRoomCode();
      const colorIndex = Math.floor(Math.random() * 10);

      const hostPlayer = {
        id: playerId,
        name: hostName.trim(),
        isHost: true,
        colorIndex: colorIndex,
        joinedAt: Date.now()
      };

      const initialRoomData = {
        code: roomCode,
        hostId: playerId,
        currentGame: 'lobby', // 'lobby' | 'tentang-kita' | 'voting' | 'guess-who'
        createdAt: Date.now(),
        players: {
          [playerId]: hostPlayer
        },
        gameState: {
          tentangKita: {
            cardIndex: 0,
            level: 'level-1',
            isFlipped: false,
            selectedAnswerer: null,
            updatedAt: Date.now()
          },
          voting: {
            questionIndex: 0,
            votes: {},
            revealed: false,
            status: 'voting',
            round: 1
          },
          guessWho: {
            status: 'config',
            themeKey: 'anime',
            subThemeKey: 'all-popular',
            cardCount: 24,
            boardCharacters: [],
            playerSecrets: {},
            playerStats: {},
            lastEvent: null,
            winnerId: null,
            round: 1
          }
        },
        votingGame: {
          questionIndex: 0,
          votes: {},
          revealed: false,
          status: 'voting',
          round: 1,
          updatedAt: Date.now()
        },
        guessWhoGame: {
          status: 'config',
          themeKey: 'anime',
          subThemeKey: 'all-popular',
          cardCount: 24,
          boardCharacters: [],
          playerSecrets: {},
          playerStats: {},
          lastEvent: null,
          winnerId: null,
          round: 1,
          updatedAt: Date.now()
        }
      };

      try {
        if (!isOfflineMode && dbInstance) {
          const roomRef = dbInstance.ref(`rooms/${roomCode}`);
          await roomRef.set(initialRoomData);

          // Configure onDisconnect: remove player or delete room if host disconnects
          const playerRef = dbInstance.ref(`rooms/${roomCode}/players/${playerId}`);
          playerRef.onDisconnect().remove();

          UI.Logger('FIREBASE', `Room Created: [${roomCode}] by Host: ${hostName}`);
        } else {
          // Local storage fallback for instant zero-config testing
          localStorage.setItem(`mock_room_${roomCode}`, JSON.stringify(initialRoomData));
          if (fallbackChannel) {
            fallbackChannel.postMessage({ type: 'ROOM_UPDATE', code: roomCode, data: initialRoomData });
          }
          UI.Logger('FIREBASE', `[LOCAL MOCK] Room Created: [${roomCode}] by Host: ${hostName}`);
          UI.Toast('Mode Demo Lokal Aktif (Masukkan config Firebase di Pengaturan untuk multiplayer online)', 'info', 4500);
        }

        const session = { ...hostPlayer, roomCode };
        this.savePlayerSession(session);
        return { success: true, roomCode, player: session, roomData: initialRoomData };
      } catch (error) {
        UI.Logger('FIREBASE', 'Error creating room', error, true);
        UI.Toast('Gagal membuat room: ' + error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    /**
     * 2. JOIN ROOM
     * Adds a player to an existing room
     */
    async joinRoom(roomCode, playerName) {
      const code = roomCode.trim().toUpperCase();
      const playerId = generatePlayerId();
      const colorIndex = Math.floor(Math.random() * 10);

      const newPlayer = {
        id: playerId,
        name: playerName.trim(),
        isHost: false,
        colorIndex: colorIndex,
        joinedAt: Date.now()
      };

      try {
        if (!isOfflineMode && dbInstance) {
          const roomRef = dbInstance.ref(`rooms/${code}`);
          const snapshot = await roomRef.once('value');

          if (!snapshot.exists()) {
            UI.Logger('FIREBASE', `Join failed: Room ${code} not found`, null, true);
            UI.Toast(`Room "${code}" tidak ditemukan! Periksa kembali kodenya.`, 'error');
            return { success: false, error: 'Room tidak ditemukan' };
          }

          const roomData = snapshot.val();

          // Add player to room
          const playerRef = dbInstance.ref(`rooms/${code}/players/${playerId}`);
          await playerRef.set(newPlayer);
          playerRef.onDisconnect().remove();

          UI.Logger('FIREBASE', `Player [${playerName}] joined Room: [${code}]`);
          const session = { ...newPlayer, roomCode: code };
          this.savePlayerSession(session);
          return { success: true, roomCode: code, player: session, roomData };
        } else {
          // Local fallback
          const raw = localStorage.getItem(`mock_room_${code}`);
          if (!raw) {
            UI.Toast(`Room "${code}" tidak ditemukan!`, 'error');
            return { success: false, error: 'Room tidak ditemukan' };
          }
          const roomData = JSON.parse(raw);
          roomData.players[playerId] = newPlayer;
          localStorage.setItem(`mock_room_${code}`, JSON.stringify(roomData));

          if (fallbackChannel) {
            fallbackChannel.postMessage({ type: 'ROOM_UPDATE', code, data: roomData });
          }

          const session = { ...newPlayer, roomCode: code };
          this.savePlayerSession(session);
          UI.Logger('FIREBASE', `[LOCAL MOCK] Player [${playerName}] joined Room: [${code}]`);
          return { success: true, roomCode: code, player: session, roomData };
        }
      } catch (error) {
        UI.Logger('FIREBASE', 'Error joining room', error, true);
        UI.Toast('Gagal bergabung ke room: ' + error.message, 'error');
        return { success: false, error: error.message };
      }
    },

    /**
     * 3. LISTEN TO ROOM UPDATES (REAL-TIME SYNC)
     */
    listenToRoom(roomCode, onUpdate) {
      const code = roomCode.trim().toUpperCase();
      this.stopListening(code);

      try {
        if (!isOfflineMode && dbInstance) {
          const roomRef = dbInstance.ref(`rooms/${code}`);
          const listener = roomRef.on('value', (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.val();
              onUpdate(data);
            } else {
              UI.Logger('FIREBASE', `Room ${code} was closed or deleted`);
              onUpdate(null);
            }
          }, (error) => {
            UI.Logger('FIREBASE', 'Room listener error', error, true);
            UI.Toast('Koneksi room terputus: ' + error.message, 'error');
          });

          activeListeners[code] = { ref: roomRef, listener };
          UI.Logger('FIREBASE', `Subscribed to real-time sync for Room: [${code}]`);
        } else {
          // Local fallback listener
          const checkLocal = () => {
            const raw = localStorage.getItem(`mock_room_${code}`);
            if (raw) {
              onUpdate(JSON.parse(raw));
            }
          };
          checkLocal();

          const handler = (event) => {
            if (event.data && event.data.code === code && event.data.type === 'ROOM_UPDATE') {
              onUpdate(event.data.data);
            }
          };

          if (fallbackChannel) {
            fallbackChannel.addEventListener('message', handler);
          }
          activeListeners[code] = { fallbackHandler: handler };
          UI.Logger('FIREBASE', `[LOCAL MOCK] Subscribed to Room: [${code}]`);
        }
      } catch (error) {
        UI.Logger('FIREBASE', 'Failed to attach listener', error, true);
      }
    },

    /**
     * Stop listening to room
     */
    stopListening(roomCode) {
      const code = roomCode?.trim().toUpperCase();
      if (!code || !activeListeners[code]) return;

      try {
        const item = activeListeners[code];
        if (item.ref && item.listener) {
          item.ref.off('value', item.listener);
        }
        if (item.fallbackHandler && fallbackChannel) {
          fallbackChannel.removeEventListener('message', item.fallbackHandler);
        }
        delete activeListeners[code];
        UI.Logger('FIREBASE', `Unsubscribed from Room: [${code}]`);
      } catch (error) {
        UI.Logger('FIREBASE', 'Error stopping listener', error, true);
      }
    },

    /**
     * 4. SWITCH GAME (HOST ONLY)
     * Changes active game in room and updates database
     */
    async switchGame(roomCode, gameKey) {
      const code = roomCode.trim().toUpperCase();
      UI.Logger('FIREBASE', `Switching Game for Room [${code}] to [${gameKey}]`);

      try {
        if (!isOfflineMode && dbInstance) {
          await dbInstance.ref(`rooms/${code}/currentGame`).set(gameKey);
        } else {
          const raw = localStorage.getItem(`mock_room_${code}`);
          if (raw) {
            const roomData = JSON.parse(raw);
            roomData.currentGame = gameKey;
            localStorage.setItem(`mock_room_${code}`, JSON.stringify(roomData));
            if (fallbackChannel) {
              fallbackChannel.postMessage({ type: 'ROOM_UPDATE', code, data: roomData });
            }
          }
        }
        return true;
      } catch (error) {
        UI.Logger('FIREBASE', 'Error switching game', error, true);
        UI.Toast('Gagal berpindah game: ' + error.message, 'error');
        return false;
      }
    },

    /**
     * 5. UPDATE GAME STATE
     * Updates sub-state for a specific game (e.g. current card, flipped status, spin answerer)
     */
    async updateGameState(roomCode, gameKey, partialState) {
      const code = roomCode.trim().toUpperCase();
      try {
        if (!isOfflineMode && dbInstance) {
          await dbInstance.ref(`rooms/${code}/gameState/${gameKey}`).update({
            ...partialState,
            updatedAt: Date.now()
          });
          if (gameKey === 'voting') {
            await dbInstance.ref(`rooms/${code}/votingGame`).update({
              ...partialState,
              updatedAt: Date.now()
            });
          }
          if (gameKey === 'guessWho') {
            await dbInstance.ref(`rooms/${code}/guessWhoGame`).update({
              ...partialState,
              updatedAt: Date.now()
            });
          }
          if (gameKey === 'werewolf') {
            await dbInstance.ref(`rooms/${code}/werewolfGame`).update({
              ...partialState,
              updatedAt: Date.now()
            });
          }
          if (gameKey === 'coup') {
            await dbInstance.ref(`rooms/${code}/coupGame`).update({
              ...partialState,
              updatedAt: Date.now()
            });
          }
          if (gameKey === 'costumeDetective') {
            await dbInstance.ref(`rooms/${code}/costumeDetectiveGame`).update({
              ...partialState,
              updatedAt: Date.now()
            });
          }
          if (gameKey === 'spicy') {
            await dbInstance.ref(`rooms/${code}/spicyGame`).update({
              ...partialState,
              updatedAt: Date.now()
            });
          }
          if (gameKey === 'trio') {
            await dbInstance.ref(`rooms/${code}/trioGame`).update({
              ...partialState,
              updatedAt: Date.now()
            });
          }
          if (gameKey === 'secretHitler' || gameKey === 'secret-hitler') {
            await dbInstance.ref(`rooms/${code}/secretHitlerGame`).update({
              ...partialState,
              updatedAt: Date.now()
            });
          }
        } else {
          const raw = localStorage.getItem(`mock_room_${code}`);
          if (raw) {
            const roomData = JSON.parse(raw);
            if (!roomData.gameState) roomData.gameState = {};
            if (!roomData.gameState[gameKey]) roomData.gameState[gameKey] = {};
            roomData.gameState[gameKey] = {
              ...roomData.gameState[gameKey],
              ...partialState,
              updatedAt: Date.now()
            };
            if (gameKey === 'voting') {
              roomData.votingGame = {
                ...(roomData.votingGame || {}),
                ...partialState,
                updatedAt: Date.now()
              };
            }
            if (gameKey === 'guessWho') {
              roomData.guessWhoGame = {
                ...(roomData.guessWhoGame || {}),
                ...partialState,
                updatedAt: Date.now()
              };
            }
            if (gameKey === 'werewolf') {
              roomData.werewolfGame = {
                ...(roomData.werewolfGame || {}),
                ...partialState,
                updatedAt: Date.now()
              };
            }
            if (gameKey === 'coup') {
              roomData.coupGame = {
                ...(roomData.coupGame || {}),
                ...partialState,
                updatedAt: Date.now()
              };
            }
            if (gameKey === 'costumeDetective') {
              roomData.costumeDetectiveGame = {
                ...(roomData.costumeDetectiveGame || {}),
                ...partialState,
                updatedAt: Date.now()
              };
            }
            if (gameKey === 'spicy') {
              roomData.spicyGame = {
                ...(roomData.spicyGame || {}),
                ...partialState,
                updatedAt: Date.now()
              };
            }
            if (gameKey === 'trio') {
              roomData.trioGame = {
                ...(roomData.trioGame || {}),
                ...partialState,
                updatedAt: Date.now()
              };
            }
            if (gameKey === 'secretHitler' || gameKey === 'secret-hitler') {
              roomData.secretHitlerGame = {
                ...(roomData.secretHitlerGame || {}),
                ...partialState,
                updatedAt: Date.now()
              };
            }
            localStorage.setItem(`mock_room_${code}`, JSON.stringify(roomData));
            if (fallbackChannel) {
              fallbackChannel.postMessage({ type: 'ROOM_UPDATE', code, data: roomData });
            }
          }
        }
        UI.Logger('FIREBASE', `State updated for [${gameKey}]`, partialState);
        return true;
      } catch (error) {
        UI.Logger('FIREBASE', `Error updating state for ${gameKey}`, error, true);
        UI.Toast('Gagal memperbarui status game: ' + error.message, 'error');
        return false;
      }
    },

    /**
     * 6. LEAVE ROOM
     */
    async leaveRoom(roomCode, playerId) {
      if (!roomCode || !playerId) return;
      const code = roomCode.trim().toUpperCase();

      try {
        this.stopListening(code);

        if (!isOfflineMode && dbInstance) {
          const playerRef = dbInstance.ref(`rooms/${code}/players/${playerId}`);
          await playerRef.remove();

          // Check if any players left
          const playersSnap = await dbInstance.ref(`rooms/${code}/players`).once('value');
          if (!playersSnap.exists() || Object.keys(playersSnap.val() || {}).length === 0) {
            // Delete room if empty
            await dbInstance.ref(`rooms/${code}`).remove();
            UI.Logger('FIREBASE', `Room [${code}] deleted (empty)`);
          } else {
            // If the leaving player was host, transfer host role to the oldest remaining player
            const players = playersSnap.val();
            const playerList = Object.values(players);
            const hasHost = playerList.some(p => p.isHost);
            if (!hasHost && playerList.length > 0) {
              const nextHost = playerList[0];
              await dbInstance.ref(`rooms/${code}/players/${nextHost.id}/isHost`).set(true);
              await dbInstance.ref(`rooms/${code}/hostId`).set(nextHost.id);
              UI.Logger('FIREBASE', `Transferred host in Room [${code}] to [${nextHost.name}]`);
            }
          }
        } else {
          const raw = localStorage.getItem(`mock_room_${code}`);
          if (raw) {
            const roomData = JSON.parse(raw);
            if (roomData.players && roomData.players[playerId]) {
              delete roomData.players[playerId];
              if (Object.keys(roomData.players).length === 0) {
                localStorage.removeItem(`mock_room_${code}`);
              } else {
                localStorage.setItem(`mock_room_${code}`, JSON.stringify(roomData));
                if (fallbackChannel) {
                  fallbackChannel.postMessage({ type: 'ROOM_UPDATE', code, data: roomData });
                }
              }
            }
          }
        }

        this.clearPlayerSession();
        UI.Logger('FIREBASE', `Player [${playerId}] left Room: [${code}]`);
        return true;
      } catch (error) {
        UI.Logger('FIREBASE', 'Error leaving room', error, true);
        return false;
      }
    }
  };
})();
