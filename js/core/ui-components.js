/**
 * ==========================================================================
 * DISCORD PARTY HUB - UI COMPONENTS & REUSABLE HELPERS
 * ==========================================================================
 * Standardized UI elements, joyful animations, themes, and centralized logging.
 */

const UI = (function () {
  'use strict';

  // Avatar pastel color palette (Joyful & high-contrast)
  const AVATAR_PALETTES = [
    { bg: 'bg-indigo-500', text: 'text-white', border: 'border-indigo-600' },
    { bg: 'bg-rose-500', text: 'text-white', border: 'border-rose-600' },
    { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-600' },
    { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-600' },
    { bg: 'bg-sky-500', text: 'text-white', border: 'border-sky-600' },
    { bg: 'bg-purple-500', text: 'text-white', border: 'border-purple-600' },
    { bg: 'bg-teal-500', text: 'text-white', border: 'border-teal-600' },
    { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600' },
    { bg: 'bg-pink-500', text: 'text-white', border: 'border-pink-600' },
    { bg: 'bg-cyan-500', text: 'text-white', border: 'border-cyan-600' },
  ];

  /**
   * Simple Web Audio Synthesizer for joyful SFX
   * No external audio files needed; 100% reliable offline.
   */
  const AudioEngine = {
    ctx: null,
    muted: false,

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    },

    playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.15) {
      if (this.muted) return;
      try {
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (err) {
        // Silently ignore audio playback restrictions before user interaction
      }
    },

    click() {
      this.playTone(600, 'sine', 0.06, 0.08);
    },

    pop() {
      this.playTone(850, 'triangle', 0.09, 0.12);
    },

    tick(pitch = 500) {
      this.playTone(pitch, 'sine', 0.04, 0.1);
    },

    flip() {
      this.playTone(420, 'sine', 0.08, 0.1);
      setTimeout(() => this.playTone(560, 'sine', 0.08, 0.1), 60);
    },

    fanfare() {
      if (this.muted) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        setTimeout(() => {
          this.playTone(freq, 'triangle', 0.22, 0.15);
        }, index * 90);
      });
    }
  };

  return {
    /**
     * 1. Change active theme palette on <body>
     * Available: 'lobby', 'tentang-kita', 'voting', 'guess-who', 'werewolf', 'coup', 'costume-detective', 'spicy', 'trio', 'secret-hitler', 'cash-n-guns'
     */
    setTheme(themeName) {
      const validThemes = ['lobby', 'tentang-kita', 'voting', 'guess-who', 'werewolf', 'coup', 'costume-detective', 'spicy', 'trio', 'secret-hitler', 'cash-n-guns'];
      const targetTheme = validThemes.includes(themeName) ? themeName : 'lobby';
      
      document.body.setAttribute('data-theme', targetTheme);
      this.Logger('UI', 'Theme Changed', { theme: targetTheme });

      // Dispatch event in case submodules want to react
      window.dispatchEvent(new CustomEvent('hub:themechange', { detail: { theme: targetTheme } }));
    },

    /**
     * 2. Reusable Container with Minimalist-Joyful Aesthetic
     */
    Container({
      title = '',
      subtitle = '',
      content = '',
      footer = '',
      badge = '',
      icon = '',
      headerAction = '',
      className = '',
      id = '',
    } = {}) {
      const idAttr = id ? `id="${id}"` : '';

      const headerHTML = (title || subtitle || icon || headerAction || badge) ? `
        <div class="px-6 pt-6 pb-4 sm:px-8 sm:pt-8 flex items-start justify-between border-b border-slate-900/5">
          <div class="flex items-center gap-3">
            ${icon ? `
              <div class="w-11 h-11 rounded-2xl bg-theme-primary-light flex items-center justify-center text-theme-primary border border-theme">
                <i data-lucide="${icon}" class="w-6 h-6"></i>
              </div>` : ''}
            <div>
              <div class="flex items-center gap-2">
                ${title ? `<h2 class="font-display font-semibold text-xl sm:text-2xl text-slate-800 tracking-wide">${title}</h2>` : ''}
                ${badge ? badge : ''}
              </div>
              ${subtitle ? `<p class="font-body text-sm text-slate-500 mt-0.5">${subtitle}</p>` : ''}
            </div>
          </div>
          ${headerAction ? `<div class="flex items-center gap-2">${headerAction}</div>` : ''}
        </div>
      ` : '';

      const contentHTML = `
        <div class="p-6 sm:p-8">
          ${content}
        </div>
      `;

      const footerHTML = footer ? `
        <div class="px-6 py-4 sm:px-8 sm:py-5 bg-slate-50/60 rounded-b-3xl border-t border-slate-900/5 flex items-center justify-between">
          ${footer}
        </div>
      ` : '';

      return `
        <div ${idAttr} class="bg-theme-surface rounded-3xl border-2 border-slate-900/10 shadow-joyful transition-all duration-300 relative overflow-hidden ${className}">
          ${headerHTML}
          ${contentHTML}
          ${footerHTML}
        </div>
      `;
    },

    /**
     * 3. Reusable Button with standard active:scale-95 press effect
     */
    Button({
      text = '',
      onClick = '',
      variant = 'primary', // 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost' | 'outline'
      icon = '',
      iconRight = '',
      id = '',
      className = '',
      disabled = false,
      type = 'button',
      size = 'md', // 'sm' | 'md' | 'lg'
    } = {}) {
      const idAttr = id ? `id="${id}"` : '';
      const disabledAttr = disabled ? 'disabled' : '';
      const onClickAttr = onClick ? `onclick="${onClick}"` : '';

      // Size classes
      const sizeClasses = {
        sm: 'px-3.5 py-1.5 text-xs font-semibold rounded-xl gap-1.5',
        md: 'px-5 py-2.5 text-sm font-bold rounded-2xl gap-2',
        lg: 'px-7 py-3.5 text-base font-bold rounded-2xl gap-2.5',
      }[size] || 'px-5 py-2.5 text-sm font-bold rounded-2xl gap-2';

      // Variant styles
      const variantClasses = {
        primary: 'bg-theme-primary hover:opacity-95 text-white shadow-sm shadow-indigo-500/20 active:scale-95',
        secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 border border-slate-200',
        accent: 'bg-theme-accent hover:opacity-95 text-slate-900 shadow-sm active:scale-95',
        danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-sm shadow-rose-500/20 active:scale-95',
        ghost: 'bg-transparent hover:bg-slate-100/70 text-slate-600 active:scale-95',
        outline: 'bg-transparent border-2 border-slate-900/15 hover:border-slate-900/30 text-slate-700 active:scale-95',
      }[variant] || 'bg-theme-primary text-white';

      const disabledClass = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer';

      return `
        <button 
          type="${type}"
          ${idAttr}
          ${onClickAttr}
          ${disabledAttr}
          class="inline-flex items-center justify-center font-display transition-all duration-150 select-none ${sizeClasses} ${variantClasses} ${disabledClass} ${className}"
        >
          ${icon ? `<i data-lucide="${icon}" class="w-4 h-4 shrink-0"></i>` : ''}
          ${text ? `<span>${text}</span>` : ''}
          ${iconRight ? `<i data-lucide="${iconRight}" class="w-4 h-4 shrink-0"></i>` : ''}
        </button>
      `;
    },

    /**
     * 4. Toast Notification System (Corner pop-up, zero alert())
     */
    Toast(message, type = 'info', duration = 3500) {
      const container = document.getElementById('toast-container');
      if (!container) return;

      const id = 'toast-' + Math.random().toString(36).substring(2, 9);

      const configs = {
        success: {
          icon: 'check-circle-2',
          bgColor: 'bg-emerald-50 border-emerald-500/30 text-emerald-950',
          iconColor: 'text-emerald-600',
          badge: 'BERHASIL'
        },
        error: {
          icon: 'alert-triangle',
          bgColor: 'bg-rose-50 border-rose-500/30 text-rose-950',
          iconColor: 'text-rose-600',
          badge: 'PERHATIAN'
        },
        warning: {
          icon: 'alert-circle',
          bgColor: 'bg-amber-50 border-amber-500/30 text-amber-950',
          iconColor: 'text-amber-600',
          badge: 'INFO'
        },
        info: {
          icon: 'sparkles',
          bgColor: 'bg-indigo-50 border-indigo-500/30 text-indigo-950',
          iconColor: 'text-indigo-600',
          badge: 'UPDATE'
        }
      }[type] || {
        icon: 'info',
        bgColor: 'bg-slate-50 border-slate-300 text-slate-800',
        iconColor: 'text-slate-600',
        badge: 'INFO'
      };

      const toastHTML = `
        <div id="${id}" class="pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border-2 shadow-lg backdrop-blur-md ${configs.bgColor} toast-enter transition-all duration-200">
          <div class="mt-0.5 shrink-0 ${configs.iconColor}">
            <i data-lucide="${configs.icon}" class="w-5 h-5"></i>
          </div>
          <div class="flex-1 min-w-0 pr-1">
            <div class="text-[10px] font-black tracking-wider uppercase opacity-60 font-display">${configs.badge}</div>
            <div class="text-xs sm:text-sm font-semibold font-body leading-snug break-words">${message}</div>
          </div>
          <button onclick="UI.dismissToast('${id}')" class="text-slate-400 hover:text-slate-600 p-1 rounded-lg shrink-0">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>
      `;

      container.insertAdjacentHTML('beforeend', toastHTML);
      this.refreshIcons();
      AudioEngine.pop();

      if (duration > 0) {
        setTimeout(() => {
          this.dismissToast(id);
        }, duration);
      }
    },

    dismissToast(id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('toast-enter');
      el.classList.add('toast-leave');
      setTimeout(() => {
        el.remove();
      }, 200);
    },

    /**
     * 5. Centralized Color-Coded Browser Console Logger
     * Example: [FIREBASE] Room Created: ABCD
     */
    Logger(moduleName, action, data = null, isError = false) {
      const moduleColors = {
        FIREBASE: 'background: #6366F1; color: #FFFFFF; font-weight: bold; padding: 2px 8px; border-radius: 4px;',
        APP: 'background: #0284C7; color: #FFFFFF; font-weight: bold; padding: 2px 8px; border-radius: 4px;',
        UI: 'background: #8B5CF6; color: #FFFFFF; font-weight: bold; padding: 2px 8px; border-radius: 4px;',
        'TENTANG-KITA': 'background: #E11D48; color: #FFFFFF; font-weight: bold; padding: 2px 8px; border-radius: 4px;',
        VOTING: 'background: #10B981; color: #FFFFFF; font-weight: bold; padding: 2px 8px; border-radius: 4px;',
        'GUESS-WHO': 'background: #F59E0B; color: #1E293B; font-weight: bold; padding: 2px 8px; border-radius: 4px;'
      };

      const errorStyle = 'background: #DC2626; color: #FFFFFF; font-weight: bold; padding: 2px 8px; border-radius: 4px;';
      const badgeStyle = isError ? errorStyle : (moduleColors[moduleName.toUpperCase()] || 'background: #475569; color: #FFFFFF; font-weight: bold; padding: 2px 8px; border-radius: 4px;');
      const actionStyle = isError ? 'color: #DC2626; font-weight: bold;' : 'color: #334155; font-weight: 600;';

      const tag = `[${moduleName.toUpperCase()}]`;

      if (isError) {
        console.error(`%c${tag}%c ${action}`, badgeStyle, actionStyle, data !== null ? data : '');
      } else {
        console.log(`%c${tag}%c ${action}`, badgeStyle, actionStyle, data !== null ? data : '');
      }
    },

    /**
     * Joyful Avatar Initial Badge
     */
    Avatar({ name = 'Pemain', size = 'md', isHost = false, colorIndex = 0 } = {}) {
      const initials = (name.trim().split(' ').map(n => n[0]).slice(0, 2).join('') || 'P').toUpperCase();
      const palette = AVATAR_PALETTES[Math.abs(colorIndex) % AVATAR_PALETTES.length];

      const sizeMap = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-11 h-11 text-sm',
        lg: 'w-14 h-14 text-base',
        xl: 'w-20 h-20 text-2xl',
      };

      const dimensions = sizeMap[size] || sizeMap.md;

      return `
        <div class="relative inline-block select-none group">
          <div class="${dimensions} rounded-2xl ${palette.bg} ${palette.text} font-display font-bold flex items-center justify-center shadow-md border-2 ${palette.border} transition-transform duration-200 group-hover:scale-105">
            ${initials}
          </div>
          ${isHost ? `
            <span class="absolute -top-1.5 -right-1.5 bg-amber-400 text-amber-950 p-0.5 rounded-full shadow border-2 border-white" title="Host Ruangan">
              <i data-lucide="crown" class="w-3.5 h-3.5"></i>
            </span>
          ` : ''}
        </div>
      `;
    },

    /**
     * Joyful Pill Badge
     */
    Badge({ text = '', variant = 'neutral', icon = '', className = '' } = {}) {
      const variants = {
        primary: 'bg-theme-primary-light text-theme-primary border-theme',
        accent: 'bg-amber-100 text-amber-800 border-amber-300',
        success: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        danger: 'bg-rose-100 text-rose-800 border-rose-300',
        neutral: 'bg-slate-100 text-slate-700 border-slate-200',
      };

      const style = variants[variant] || variants.neutral;

      return `
        <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold font-display border ${style} ${className}">
          ${icon ? `<i data-lucide="${icon}" class="w-3 h-3"></i>` : ''}
          <span>${text}</span>
        </span>
      `;
    },

    /**
     * Reusable Modal Dialog
     */
    Modal({ title = '', content = '', footer = '', onClose = 'UI.closeModal()' } = {}) {
      const container = document.getElementById('modal-container');
      const box = document.getElementById('modal-content');
      if (!container || !box) return;

      box.innerHTML = `
        <div class="bg-white rounded-3xl border-2 border-slate-900/10 shadow-2xl overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 class="font-display font-bold text-lg text-slate-800">${title}</h3>
            <button onclick="${onClose}" class="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <i data-lucide="x" class="w-5 h-5"></i>
            </button>
          </div>
          <div class="p-6">
            ${content}
          </div>
          ${footer ? `
            <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              ${footer}
            </div>
          ` : ''}
        </div>
      `;

      container.classList.remove('hidden');
      requestAnimationFrame(() => {
        box.classList.remove('scale-95', 'opacity-0');
        box.classList.add('scale-100', 'opacity-100');
      });

      this.refreshIcons();
    },

    closeModal() {
      const container = document.getElementById('modal-container');
      const box = document.getElementById('modal-content');
      if (!container || !box) return;

      box.classList.remove('scale-100', 'opacity-100');
      box.classList.add('scale-95', 'opacity-0');
      setTimeout(() => {
        container.classList.add('hidden');
        box.innerHTML = '';
      }, 150);
    },

    /**
     * Re-renders Lucide icons dynamically
     */
    refreshIcons() {
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    },

    /**
     * Confetti Effect
     */
    Confetti() {
      if (typeof window.confetti === 'function') {
        window.confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.65 },
          colors: ['#6366F1', '#FB7185', '#F59E0B', '#10B981', '#0284C7']
        });
      }
    },

    Sound: AudioEngine
  };
})();
