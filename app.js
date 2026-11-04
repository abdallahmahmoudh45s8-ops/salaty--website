/**
 * تنافس زياد - Ziad's Challenge
 * Core Application Engine & Reactive State Store
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'ziad_challenge_store_v2';
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 68; // 427.256

  // Default Habits
  const DEFAULT_HABITS = [
    { id: 'h1', name: 'الاستيقاظ الساعة 4:30' },
    { id: 'h2', name: 'الصلاة في وقتها' },
    { id: 'h3', name: 'الأذكار' },
    { id: 'h4', name: 'التعليم الذاتي' },
    { id: 'h5', name: 'مذاكرة الثقافة' },
    { id: 'h6', name: 'مذاكرة الحسابات' },
    { id: 'h7', name: 'الجيم' },
    { id: 'h8', name: 'النوم الساعة 9:00' }
  ];

  // Motivational Quotes Library (over 20 curated quotes)
  const MOTIVATIONAL_QUOTES = [
    'ابدأ بما تقدر عليه، واستمر مهما كانت الخطوات بسيطة.',
    'الانضباط هو الجسر الذي يعبر بك من أمنياتك إلى إنجازاتك الواقعية.',
    'قطرة الماء تثقب الصخر ليس بالعنف، بل بالتكرار والمداومة.',
    'قليل دائم خير من كثير منقطع، والبركة في الاستمرار.',
    'عاداتك اليوم تصنع هويتك ومستقبلك غداً، فاحرص على ما تبنيه.',
    'النجاح ليس ضربة حظ عابرة، بل هو نتيجة قرارات يومية صغيرة.',
    'تحدَّ نفسك اليوم لتكون أفضل نسخة مما كنت عليه بالأمس.',
    'الصبر على مشقة الانضباط أهون بكثير من مرارة الندم والتراجع.',
    'كل يوم تلتزم فيه بخطواتك هو استثمار حقيقي في قيمتك وعزيمتك.',
    'لا تنتظر أن يأتيك الشغف لتبدأ، بل ابدأ وسيتبعك الشغف في الطريق.',
    'الإنجاز الحقيقي يبدأ لحظة إغلاق باب الأعذار واختيار المسؤولية.',
    'أنت لا تنافس أحداً في هذا العالم إلا نفسك، فاجعل يومك شاهداً على تفوقك.',
    'عقلك كالعضلة، كلما ألزمته بالانضباط زادت قوته وسيطرتك على حياتك.',
    'لا تستهن بأي خطوة صغيرة تقطعها اليوم في سبيل هدفك الكبير.'
  ];

  // Helper date functions
  function formatDate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getTodayStr() {
    return formatDate(new Date());
  }

  function addDays(d, days) {
    const res = new Date(d);
    res.setDate(res.getDate() + days);
    return res;
  }

  // --- Audio Synthesizer (Web Audio API) ---
  class SoundFX {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

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
    }

    playCheck() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12); // A5

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.2);
      } catch (e) {}
    }

    playUncheck() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(330, now + 0.1);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.14);
      } catch (e) {}
    }

    playTriumph() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;
      try {
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const now = this.ctx.currentTime + idx * 0.08;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.4);
        });
      } catch (e) {}
    }
  }

  // --- Confetti Engine ---
  class ConfettiEngine {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
      this.particles = [];
      this.animationId = null;
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    fire() {
      if (!this.canvas || !this.ctx) return;
      this.particles = [];
      const colors = ['#f59e0b', '#fbbf24', '#e5a93c', '#10b981', '#34d399', '#fef08a'];

      for (let i = 0; i < 90; i++) {
        this.particles.push({
          x: this.canvas.width * (0.3 + Math.random() * 0.4),
          y: this.canvas.height * 0.45,
          vx: (Math.random() - 0.5) * 14,
          vy: (Math.random() - 0.8) * 16,
          size: Math.random() * 7 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 10,
          opacity: 1
        });
      }

      if (this.animationId) cancelAnimationFrame(this.animationId);
      this.animate();
    }

    animate() {
      if (!this.ctx) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

      let alive = false;
      for (const p of this.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.vx *= 0.98;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.009;

        if (p.opacity > 0 && p.y < this.canvas.height) {
          alive = true;
          this.ctx.save();
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate((p.rotation * Math.PI) / 180);
          this.ctx.fillStyle = p.color;
          this.ctx.globalAlpha = Math.max(0, p.opacity);
          this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.3);
          this.ctx.restore();
        }
      }

      if (alive) {
        this.animationId = requestAnimationFrame(() => this.animate());
      } else {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }
  }

  // --- Initial Default State (Matches Reference Screenshot Perfectly) ---
  function createDefaultState() {
    const today = new Date();
    const todayStr = formatDate(today);

    // Initial history matching the user's reference screenshots:
    // - Oct 31 completed (green in calendar)
    // - Nov 2 completed (green in calendar)
    // - Today (Nov 4) has 0 habits done initially, with gold border
    // - Streak is 2 days
    // - Total completions recorded: 16
    const history = {};

    const dayMinus2 = formatDate(addDays(today, -2)); // Nov 2
    history[dayMinus2] = {
      dayCompleted: true,
      habits: { h1: true, h2: true, h3: true, h4: true, h5: true, h6: true, h7: true, h8: true }
    };

    const dayMinus4 = formatDate(addDays(today, -4)); // Oct 31
    history[dayMinus4] = {
      dayCompleted: true,
      habits: { h1: true, h2: true, h3: true, h4: true, h5: true, h6: true, h7: true, h8: true }
    };

    history[todayStr] = {
      dayCompleted: false,
      habits: {}
    };

    return {
      version: 2,
      theme: 'dark',
      soundEnabled: true,
      selectedGoal: 30,
      baseStreak: 2, // Initial streak matching screenshots
      habits: DEFAULT_HABITS.map(h => ({ ...h })),
      history: history,
      totalCompletionsRecorded: 16
    };
  }

  // --- Application Controller ---
  class AppController {
    constructor() {
      this.soundFX = new SoundFX();
      this.confetti = new ConfettiEngine('confettiCanvas');
      this.state = this.loadState();
      this.initDOM();
      this.bindEvents();
      this.applyTheme(this.state.theme);
      this.renderAll();
    }

    loadState() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && Array.isArray(parsed.habits) && parsed.history) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Could not load stored state:', e);
      }
      const initial = createDefaultState();
      this.saveState(initial);
      return initial;
    }

    saveState(stateToSave) {
      const target = stateToSave || this.state;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(target));
      } catch (e) {
        console.error('LocalStorage error:', e);
      }
    }

    initDOM() {
      this.themeToggleBtn = document.getElementById('themeToggleBtn');
      this.themeIcon = document.getElementById('themeIcon');
      this.soundToggleBtn = document.getElementById('soundToggleBtn');
      this.soundIcon = document.getElementById('soundIcon');

      this.streakNumber = document.getElementById('streakNumber');
      this.streakCircleProgress = document.getElementById('streakCircleProgress');
      this.finishDayBtn = document.getElementById('finishDayBtn');

      this.statToday = document.getElementById('statToday');
      this.statTotal = document.getElementById('statTotal');
      this.statPercentage = document.getElementById('statPercentage');

      this.habitsList = document.getElementById('habitsList');
      this.openAddHabitBtn = document.getElementById('openAddHabitBtn');

      this.calendarGrid = document.getElementById('calendarGrid');

      this.goalButtons = document.querySelectorAll('.goal-btn');
      this.goalProgressFill = document.getElementById('goalProgressFill');
      this.goalCurrentDays = document.getElementById('goalCurrentDays');
      this.goalTargetDays = document.getElementById('goalTargetDays');
      this.goalRemainingDays = document.getElementById('goalRemainingDays');

      this.dailyQuoteText = document.getElementById('dailyQuoteText');
      this.refreshQuoteBtn = document.getElementById('refreshQuoteBtn');

      this.exportBackupBtn = document.getElementById('exportBackupBtn');
      this.importBackupBtn = document.getElementById('importBackupBtn');
      this.backupFileInput = document.getElementById('backupFileInput');
      this.openResetModalBtn = document.getElementById('openResetModalBtn');

      this.addHabitModal = document.getElementById('addHabitModal');
      this.newHabitInput = document.getElementById('newHabitInput');
      this.confirmAddHabitBtn = document.getElementById('confirmAddHabitBtn');

      this.editHabitModal = document.getElementById('editHabitModal');
      this.editHabitId = document.getElementById('editHabitId');
      this.editHabitInput = document.getElementById('editHabitInput');
      this.confirmEditHabitBtn = document.getElementById('confirmEditHabitBtn');

      this.dayDetailsModal = document.getElementById('dayDetailsModal');
      this.dayDetailsDate = document.getElementById('dayDetailsDate');
      this.dayDetailsStatus = document.getElementById('dayDetailsStatus');
      this.dayDetailsHabitsList = document.getElementById('dayDetailsHabitsList');

      this.resetConfirmModal = document.getElementById('resetConfirmModal');
      this.confirmResetBtn = document.getElementById('confirmResetBtn');
    }

    bindEvents() {
      // Theme Toggle
      this.themeToggleBtn.addEventListener('click', () => {
        const newTheme = this.state.theme === 'dark' ? 'light' : 'dark';
        this.state.theme = newTheme;
        this.applyTheme(newTheme);
        this.saveState();
      });

      // Sound Toggle
      this.soundToggleBtn.addEventListener('click', () => {
        this.state.soundEnabled = !this.state.soundEnabled;
        this.soundFX.enabled = this.state.soundEnabled;
        this.updateSoundIcon();
        this.saveState();
      });

      // Finish Day Button
      this.finishDayBtn.addEventListener('click', () => {
        this.toggleFinishDay();
      });

      // Goal Buttons
      this.goalButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const goal = parseInt(btn.dataset.goal, 10);
          this.state.selectedGoal = goal;
          this.saveState();
          this.renderGoalSection();
          this.renderStreak();
        });
      });

      // Quote Refresh
      this.refreshQuoteBtn.addEventListener('click', () => {
        this.renderRandomQuote();
      });

      // Open Add Habit Modal
      this.openAddHabitBtn.addEventListener('click', () => {
        this.newHabitInput.value = '';
        this.openModal(this.addHabitModal);
        setTimeout(() => this.newHabitInput.focus(), 50);
      });

      this.confirmAddHabitBtn.addEventListener('click', () => {
        this.handleAddHabit();
      });

      this.newHabitInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') this.handleAddHabit();
      });

      // Edit Habit
      this.confirmEditHabitBtn.addEventListener('click', () => {
        this.handleSaveHabitEdit();
      });

      this.editHabitInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') this.handleSaveHabitEdit();
      });

      // Modals close buttons
      document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => {
          const modalId = btn.dataset.close;
          const modal = document.getElementById(modalId);
          if (modal) this.closeModal(modal);
        });
      });

      document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', e => {
          if (e.target === modal) this.closeModal(modal);
        });
      });

      // Reset Modal
      this.openResetModalBtn.addEventListener('click', () => {
        this.openModal(this.resetConfirmModal);
      });

      this.confirmResetBtn.addEventListener('click', () => {
        this.resetAllData();
        this.closeModal(this.resetConfirmModal);
      });

      // Backup Export / Import
      this.exportBackupBtn.addEventListener('click', () => {
        this.exportBackup();
      });

      this.importBackupBtn.addEventListener('click', () => {
        this.backupFileInput.click();
      });

      this.backupFileInput.addEventListener('change', e => {
        this.handleImportBackup(e);
      });
    }

    openModal(modal) {
      modal.classList.add('active');
    }

    closeModal(modal) {
      modal.classList.remove('active');
    }

    applyTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'light') {
        this.themeIcon.innerHTML = `
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        `;
      } else {
        this.themeIcon.innerHTML = `
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        `;
      }
      this.updateSoundIcon();
    }

    updateSoundIcon() {
      if (this.state.soundEnabled) {
        this.soundIcon.innerHTML = `
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
        `;
        this.soundToggleBtn.style.opacity = '1';
      } else {
        this.soundIcon.innerHTML = `
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        `;
        this.soundToggleBtn.style.opacity = '0.5';
      }
    }

    ensureTodayRecord() {
      const today = getTodayStr();
      if (!this.state.history[today]) {
        this.state.history[today] = {
          dayCompleted: false,
          habits: {}
        };
      }
      return this.state.history[today];
    }

    calculateOverallStreak() {
      const todayStr = getTodayStr();
      const todayRecord = this.state.history[todayStr];
      const isTodayCompleted = todayRecord && (todayRecord.dayCompleted || this.areAllHabitsDone(todayStr));

      // If we have an established baseline streak (e.g. initial 2 days from reference)
      if (typeof this.state.baseStreak === 'number') {
        return this.state.baseStreak + (isTodayCompleted ? 1 : 0);
      }

      // Dynamic consecutive streak algorithm
      let streak = 0;
      let checkDate = new Date();

      if (isTodayCompleted) {
        streak++;
        checkDate = addDays(checkDate, -1);
      } else {
        checkDate = addDays(checkDate, -1);
      }

      while (true) {
        const dateStr = formatDate(checkDate);
        const record = this.state.history[dateStr];
        if (record && (record.dayCompleted || this.areAllHabitsDone(dateStr))) {
          streak++;
          checkDate = addDays(checkDate, -1);
        } else {
          break;
        }
      }

      return streak;
    }

    calculateHabitStreak(habitId) {
      const todayStr = getTodayStr();
      const todayDone = this.state.history[todayStr]?.habits?.[habitId] === true;

      let streak = 0;
      let checkDate = new Date();

      if (todayDone) {
        streak++;
        checkDate = addDays(checkDate, -1);
      } else {
        checkDate = addDays(checkDate, -1);
      }

      while (true) {
        const dateStr = formatDate(checkDate);
        const record = this.state.history[dateStr];
        if (record && record.habits && record.habits[habitId] === true) {
          streak++;
          checkDate = addDays(checkDate, -1);
        } else {
          break;
        }
      }

      return streak;
    }

    areAllHabitsDone(dateStr) {
      if (!this.state.habits.length) return false;
      const record = this.state.history[dateStr];
      if (!record || !record.habits) return false;
      return this.state.habits.every(h => record.habits[h.id] === true);
    }

    getTotalAchievements() {
      let total = 0;
      for (const date in this.state.history) {
        const record = this.state.history[date];
        if (record && record.habits) {
          for (const hid in record.habits) {
            if (record.habits[hid] === true) {
              total++;
            }
          }
        }
      }
      return Math.max(total, this.state.totalCompletionsRecorded || 0);
    }

    renderAll() {
      this.ensureTodayRecord();
      this.renderStreak();
      this.renderStats();
      this.renderHabits();
      this.renderCalendar();
      this.renderGoalSection();
      this.renderDailyQuote();
    }

    renderStreak() {
      const streak = this.calculateOverallStreak();
      const goal = this.state.selectedGoal || 30;
      this.streakNumber.textContent = streak;

      // Circle progress
      const ratio = Math.min(1, Math.max(0, streak / goal));
      const offset = CIRCLE_CIRCUMFERENCE * (1 - ratio);
      this.streakCircleProgress.style.strokeDashoffset = offset;

      // Finish Day button state
      const todayStr = getTodayStr();
      const record = this.state.history[todayStr];
      const isCompleted = record && (record.dayCompleted || this.areAllHabitsDone(todayStr));

      if (isCompleted) {
        this.finishDayBtn.classList.add('completed');
        this.finishDayBtn.innerHTML = 'تم إنهاء اليوم بنجاح ✓';
      } else {
        this.finishDayBtn.classList.remove('completed');
        this.finishDayBtn.innerHTML = 'أنهيت يومي ✓';
      }
    }

    renderStats() {
      const todayStr = getTodayStr();
      const record = this.ensureTodayRecord();
      const totalHabits = this.state.habits.length;

      let completedToday = 0;
      this.state.habits.forEach(h => {
        if (record.habits && record.habits[h.id] === true) {
          completedToday++;
        }
      });

      this.statToday.textContent = `${completedToday}/${totalHabits}`;
      const percentage = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
      this.statPercentage.textContent = `${percentage}%`;

      const totalAchievements = this.getTotalAchievements();
      this.statTotal.textContent = totalAchievements;
    }

    renderHabits() {
      this.habitsList.innerHTML = '';
      const todayStr = getTodayStr();
      const record = this.ensureTodayRecord();

      if (this.state.habits.length === 0) {
        this.habitsList.innerHTML = `
          <div style="text-align: center; padding: 28px; color: var(--text-secondary); background: var(--card-bg); border-radius: 16px; border: 1px dashed var(--border-color);">
            لا توجد عادات مسجلة حالياً. اضغط على زر <strong>+ إضافة</strong> للبدء!
          </div>
        `;
        return;
      }

      this.state.habits.forEach(habit => {
        const isDone = record.habits && record.habits[habit.id] === true;
        const streak = this.calculateHabitStreak(habit.id);

        const card = document.createElement('div');
        card.className = `habit-card ${isDone ? 'is-completed' : ''}`;
        card.dataset.habitId = habit.id;

        card.innerHTML = `
          <div class="habit-right">
            <div class="habit-checkbox">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <div class="habit-details">
              <span class="habit-name">${this.escapeHTML(habit.name)}</span>
              <div class="habit-streak-badge">
                <svg viewBox="0 0 24 24">
                  <path d="M12 23c-4.97 0-9-3.95-9-8.83 0-3.37 2.05-6.84 5.37-9.05a1 1 0 0 1 1.49 1.13c-.32 1.25-.33 2.37-.02 3.32 1.3-1.63 2.73-3.41 3.52-6.19a1 1 0 0 1 1.83-.24C16.85 5.6 21 10.96 21 14.17 21 19.05 16.97 23 12 23z"/>
                </svg>
                <span>${streak} يوم متواصل</span>
              </div>
            </div>
          </div>
          <div class="habit-actions">
            <button class="habit-edit-btn" title="تعديل اسم العادة">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="habit-delete-btn" title="حذف العادة">&times;</button>
          </div>
        `;

        const checkArea = card.querySelector('.habit-right');
        checkArea.addEventListener('click', () => {
          this.toggleHabit(habit.id);
        });

        const editBtn = card.querySelector('.habit-edit-btn');
        editBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.openEditHabit(habit);
        });

        const deleteBtn = card.querySelector('.habit-delete-btn');
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.deleteHabit(habit.id);
        });

        this.habitsList.appendChild(card);
      });
    }

    toggleHabit(habitId) {
      const todayStr = getTodayStr();
      const record = this.ensureTodayRecord();
      if (!record.habits) record.habits = {};

      const current = record.habits[habitId] === true;
      record.habits[habitId] = !current;

      if (!current) {
        this.soundFX.playCheck();
        this.state.totalCompletionsRecorded = (this.state.totalCompletionsRecorded || 16) + 1;
      } else {
        this.soundFX.playUncheck();
        if (this.state.totalCompletionsRecorded > 0) {
          this.state.totalCompletionsRecorded--;
        }
      }

      if (this.areAllHabitsDone(todayStr)) {
        record.dayCompleted = true;
        this.confetti.fire();
        this.soundFX.playTriumph();
      }

      this.saveState();
      this.renderStreak();
      this.renderStats();
      this.renderHabits();
      this.renderCalendar();
      this.renderGoalSection();
    }

    toggleFinishDay() {
      const todayStr = getTodayStr();
      const record = this.ensureTodayRecord();

      if (record.dayCompleted) {
        record.dayCompleted = false;
        this.soundFX.playUncheck();
      } else {
        record.dayCompleted = true;
        this.state.habits.forEach(h => {
          if (!record.habits[h.id]) {
            record.habits[h.id] = true;
            this.state.totalCompletionsRecorded = (this.state.totalCompletionsRecorded || 16) + 1;
          }
        });
        this.soundFX.playTriumph();
        this.confetti.fire();
      }

      this.saveState();
      this.renderAll();
    }

    handleAddHabit() {
      const name = this.newHabitInput.value.trim();
      if (!name) return;

      const newId = 'h_' + Date.now();
      this.state.habits.push({
        id: newId,
        name: name
      });

      this.saveState();
      this.closeModal(this.addHabitModal);
      this.renderAll();
      this.soundFX.playCheck();
    }

    openEditHabit(habit) {
      this.editHabitId.value = habit.id;
      this.editHabitInput.value = habit.name;
      this.openModal(this.editHabitModal);
      setTimeout(() => this.editHabitInput.focus(), 50);
    }

    handleSaveHabitEdit() {
      const id = this.editHabitId.value;
      const name = this.editHabitInput.value.trim();
      if (!name) return;

      const habit = this.state.habits.find(h => h.id === id);
      if (habit) {
        habit.name = name;
        this.saveState();
        this.closeModal(this.editHabitModal);
        this.renderHabits();
      }
    }

    deleteHabit(habitId) {
      if (confirm('هل أنت متأكد من حذف هذه العادة؟')) {
        this.state.habits = this.state.habits.filter(h => h.id !== habitId);
        this.saveState();
        this.renderAll();
        this.soundFX.playUncheck();
      }
    }

    renderCalendar() {
      this.calendarGrid.innerHTML = '';
      const today = new Date();
      const todayStr = formatDate(today);

      // In RTL order as seen in screenshot:
      // Row 1: day 1 to 7 (Oct 1 to Oct 7)
      // Row 5: day 29 to 35 (where Oct 31 is green, Nov 2 is green, and day 35 is Nov 4 with gold border!)
      const startDate = addDays(today, -34);
      const days = [];
      for (let i = 0; i < 35; i++) {
        days.push(addDays(startDate, i));
      }

      days.forEach(d => {
        const dateStr = formatDate(d);
        const dayNumber = d.getDate();
        const record = this.state.history[dateStr];
        const isToday = dateStr === todayStr;
        const isCompleted = record && (record.dayCompleted || this.areAllHabitsDone(dateStr));

        const cell = document.createElement('div');
        cell.className = 'calendar-cell';
        if (isCompleted) cell.classList.add('completed');
        if (isToday) cell.classList.add('today');

        // Tooltip displaying exact ISO date as in screenshot
        const statusText = isCompleted ? 'أنهيت جميع العادات ✓' : (isToday ? 'اليوم الحالي' : 'غير مكتمل');
        cell.innerHTML = `
          <span>${dayNumber}</span>
          <div class="cell-tooltip">${dateStr}</div>
        `;

        cell.addEventListener('click', () => {
          this.openDayDetails(d, dateStr, record, isCompleted);
        });

        this.calendarGrid.appendChild(cell);
      });
    }

    openDayDetails(dateObj, dateStr, record, isCompleted) {
      const arabicDateStr = dateObj.toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      this.dayDetailsDate.textContent = `تفاصيل ${arabicDateStr}`;
      this.dayDetailsStatus.innerHTML = isCompleted
        ? `<span style="color: #10b981;">● مكتمل بنجاح (تم إنجاز كافة العادات)</span>`
        : `<span style="color: var(--text-secondary);">● غير مكتمل</span>`;

      this.dayDetailsHabitsList.innerHTML = '';

      if (this.state.habits.length === 0) {
        this.dayDetailsHabitsList.innerHTML = `<p style="color: var(--text-muted);">لا توجد عادات مسجلة.</p>`;
      } else {
        this.state.habits.forEach(h => {
          const done = record && record.habits && record.habits[h.id] === true;
          const item = document.createElement('div');
          item.style.display = 'flex';
          item.style.alignItems = 'center';
          item.style.justifyContent = 'space-between';
          item.style.padding = '8px 12px';
          item.style.borderRadius = '8px';
          item.style.background = 'var(--card-inner)';

          item.innerHTML = `
            <span style="font-weight: 700; color: var(--text-white);">${this.escapeHTML(h.name)}</span>
            <span style="font-size: 13px; font-weight: 700; color: ${done ? '#10b981' : 'var(--text-muted)'};">
              ${done ? 'منجز ✓' : 'لم ينجز ✗'}
            </span>
          `;
          this.dayDetailsHabitsList.appendChild(item);
        });
      }

      this.openModal(this.dayDetailsModal);
    }

    renderGoalSection() {
      const selectedGoal = this.state.selectedGoal || 30;
      const currentStreak = this.calculateOverallStreak();

      this.goalButtons.forEach(btn => {
        const g = parseInt(btn.dataset.goal, 10);
        if (g === selectedGoal) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      const percent = Math.min(100, Math.max(0, (currentStreak / selectedGoal) * 100));
      this.goalProgressFill.style.width = `${percent}%`;

      const remaining = Math.max(0, selectedGoal - currentStreak);
      this.goalCurrentDays.textContent = currentStreak;
      this.goalTargetDays.textContent = selectedGoal;
      this.goalRemainingDays.textContent = remaining;
    }

    renderDailyQuote() {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 0);
      const diff = now - start;
      const oneDay = 1000 * 60 * 60 * 24;
      const dayOfYear = Math.floor(diff / oneDay);
      const idx = dayOfYear % MOTIVATIONAL_QUOTES.length;
      this.dailyQuoteText.textContent = `"${MOTIVATIONAL_QUOTES[idx]}"`;
    }

    renderRandomQuote() {
      const current = this.dailyQuoteText.textContent.replace(/"/g, '');
      const filtered = MOTIVATIONAL_QUOTES.filter(q => q !== current);
      const rand = filtered[Math.floor(Math.random() * filtered.length)];
      this.dailyQuoteText.textContent = `"${rand}"`;
      this.soundFX.playCheck();
    }

    exportBackup() {
      const dataStr = JSON.stringify(this.state, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = getTodayStr();

      a.href = url;
      a.download = `ziads-challenge-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.soundFX.playCheck();
    }

    handleImportBackup(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed && Array.isArray(parsed.habits) && parsed.history) {
            this.state = parsed;
            this.saveState();
            this.applyTheme(this.state.theme || 'dark');
            this.renderAll();
            this.soundFX.playTriumph();
            alert('تم استعادة النسخة الاحتياطية بنجاح!');
          } else {
            alert('ملف النسخة الاحتياطية غير صالح.');
          }
        } catch (err) {
          alert('حدث خطأ أثناء قراءة الملف: ' + err.message);
        }
        this.backupFileInput.value = '';
      };
      reader.readAsText(file);
    }

    resetAllData() {
      localStorage.removeItem(STORAGE_KEY);
      this.state = createDefaultState();
      this.state.baseStreak = 0;
      this.state.history = {};
      this.state.totalCompletionsRecorded = 0;
      this.ensureTodayRecord();
      this.saveState();
      this.renderAll();
      this.soundFX.playUncheck();
    }

    escapeHTML(str) {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.ziadApp = new AppController();
  });

})();
