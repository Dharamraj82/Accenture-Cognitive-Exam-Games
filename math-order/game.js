/**
 * ===================================================================
 * MATH ORDER CHALLENGE / QUICK-FIRE BUBBLE MATH - CORE ENGINE
 * Dynamic Random Math Generator, User Config (Timer/Order/Count), & Live Solution Engine
 * Developer: Dharamraj Pd Yadav (https://github.com/Dharamraj82)
 * ===================================================================
 */

(function () {
  'use strict';

  // -------------------------------------------------------------
  // WEB AUDIO SYNTHESIZER
  // -------------------------------------------------------------
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.isMuted = false;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.isMuted = !this.isMuted;
      return this.isMuted;
    }

    playBubblePop(index) {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const baseFreqs = [440, 587.33, 739.99];
      const freq = baseFreqs[index % 3] || 440;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.3, this.ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    }

    playCorrect() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const notes = [587.33, 739.99, 880, 1174.66];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime + idx * 0.05;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
      });
    }

    playWrong() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.22);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    }

    playCelebration() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const chord = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      chord.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime + i * 0.06;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.16, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.6);
      });
    }

    playTick() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    }
  }

  const sound = new SoundEngine();

  // -------------------------------------------------------------
  // DYNAMIC MATH EXPRESSIONS GENERATOR
  // Supports solvable fractions, decimals, additions, multiplications, divisions
  // -------------------------------------------------------------
  const MATH_GENERATORS = {
    // 1. Clean Addition (e.g., 125 + 42 = 167)
    addition: () => {
      const a = (Math.floor(Math.random() * 40) + 5) * 10 + Math.floor(Math.random() * 9);
      const b = (Math.floor(Math.random() * 25) + 2) * 10 + Math.floor(Math.random() * 9);
      return { text: `${a} + ${b}`, value: a + b };
    },

    // 2. Clean Subtraction (e.g., 450 - 120 = 330)
    subtraction: () => {
      const a = (Math.floor(Math.random() * 50) + 20) * 10;
      const b = (Math.floor(Math.random() * 18) + 2) * 10;
      return { text: `${a} - ${b}`, value: a - b };
    },

    // 3. Clean Multiplication (e.g., 12 * 8 = 96, 16 * 7 = 112)
    multiplication: () => {
      const a = Math.floor(Math.random() * 18) + 8;
      const b = Math.floor(Math.random() * 8) + 4;
      return { text: `${a} * ${b}`, value: a * b };
    },

    // 4. Clean Integer Division (e.g., 900 / 3 = 300, 750 / 3 = 250)
    divisionInt: () => {
      const b = [2, 3, 4, 5, 6, 8, 10][Math.floor(Math.random() * 7)];
      const result = Math.floor(Math.random() * 40 + 10) * 5;
      const a = result * b;
      return { text: `${a} / ${b}`, value: result };
    },

    // 5. Fraction Division (e.g., 800 / 7 = 114.286, 650 / 3 = 216.667)
    divisionFraction: () => {
      const b = [3, 7, 9, 6][Math.floor(Math.random() * 4)];
      const a = (Math.floor(Math.random() * 60) + 15) * 10;
      const val = parseFloat((a / b).toFixed(3));
      return { text: `${a} / ${b}`, value: val };
    },

    // 6. Solvable Standard Fraction Operations (e.g., 2/3 - 1/3 = 0.333, 3/4 + 1/2 = 1.25)
    fractionArithmetic: () => {
      const templates = [
        { text: '3/4 + 1/2', value: 1.25 },
        { text: '5/6 - 1/3', value: 0.5 },
        { text: '2/3 + 1/4', value: 0.917 },
        { text: '7/8 - 1/4', value: 0.625 },
        { text: '4/5 + 3/10', value: 1.1 },
        { text: '9/10 - 2/5', value: 0.5 },
        { text: '5/4 * 2/3', value: 0.833 },
        { text: '3/2 / 3/4', value: 2.0 },
        { text: '7/6 + 2/3', value: 1.833 },
        { text: '8/9 - 1/3', value: 0.556 },
        { text: '1/2 + 3/5', value: 1.1 },
        { text: '5/3 - 3/4', value: 0.917 },
        { text: '7/4 - 1/2', value: 1.25 },
        { text: '3/5 * 5/2', value: 1.5 },
        { text: '4/3 + 5/6', value: 2.167 }
      ];
      return templates[Math.floor(Math.random() * templates.length)];
    },

    // 7. Decimals & Multipliers (e.g., 12.5 * 4 = 50, 0.75 * 120 = 90)
    decimalArithmetic: () => {
      const decs = [0.25, 0.5, 0.75, 1.25, 1.5, 2.5];
      const d = decs[Math.floor(Math.random() * decs.length)];
      const m = Math.floor(Math.random() * 30 + 10) * 2;
      const val = parseFloat((d * m).toFixed(2));
      return { text: `${d} * ${m}`, value: val };
    }
  };

  function generateSingleExpression(mathCategory) {
    if (mathCategory === 'fractions') {
      const fracGens = [MATH_GENERATORS.divisionFraction, MATH_GENERATORS.fractionArithmetic, MATH_GENERATORS.decimalArithmetic];
      return fracGens[Math.floor(Math.random() * fracGens.length)]();
    }
    if (mathCategory === 'arithmetic') {
      const arithGens = [MATH_GENERATORS.addition, MATH_GENERATORS.subtraction, MATH_GENERATORS.multiplication, MATH_GENERATORS.divisionInt];
      return arithGens[Math.floor(Math.random() * arithGens.length)]();
    }
    // Mixed 'all' category
    const allGens = Object.values(MATH_GENERATORS);
    return allGens[Math.floor(Math.random() * allGens.length)]();
  }

  function generateRandomQuestion(qNum, testConfig) {
    let dir = testConfig.orderDirection;
    if (dir === 'mixed') {
      dir = (Math.random() > 0.5) ? 'desc' : 'asc';
    }

    const options = [];
    const usedValues = new Set();
    let attempts = 0;

    while (options.length < 3 && attempts < 50) {
      attempts++;
      const expr = generateSingleExpression(testConfig.mathType);

      let isDuplicate = false;
      for (const val of usedValues) {
        if (Math.abs(val - expr.value) < 0.05) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        usedValues.add(expr.value);
        options.push(expr);
      }
    }

    return {
      id: qNum,
      options: options,
      order: dir // 'desc' (HIGH -> LOW) or 'asc' (LOW -> HIGH)
    };
  }

  function generateFullTestSet(testConfig, totalQuestions = 24) {
    const testSet = [];
    for (let i = 1; i <= totalQuestions; i++) {
      testSet.push(generateRandomQuestion(i, testConfig));
    }
    return testSet;
  }

  // -------------------------------------------------------------
  // GAME STATE & CONFIGURATION
  // -------------------------------------------------------------
  const config = {
    orderDirection: 'desc', // 'desc' (HIGH->LOW), 'asc' (LOW->HIGH), 'mixed'
    mathType: 'all',        // 'all', 'fractions', 'arithmetic'
    timePerQuestion: 10,    // 5, 10, 15, 20 (seconds)
    totalQuestions: 24      // 10, 15, 24, 30
  };

  const state = {
    testQuestions: [],
    currentIndex: 0,
    score: 0,
    userSelections: [],
    timer: null,
    timeRemaining: 10,
    isAnsweringLocked: false
  };

  // -------------------------------------------------------------
  // DOM REFERENCES
  // -------------------------------------------------------------
  const screens = {
    start: document.getElementById('screen-start'),
    quiz: document.getElementById('screen-quiz'),
    completed: document.getElementById('screen-completed'),
    solutions: document.getElementById('screen-solutions')
  };

  const elements = {
    btnStart: document.getElementById('btn-start'),
    qCurrent: document.getElementById('q-current'),
    qTotal: document.getElementById('q-total'),
    qScore: document.getElementById('q-score'),
    progressBar: document.getElementById('progress-bar'),
    circlesGrid: document.getElementById('circles-grid'),
    orderDirText: document.querySelector('.prompt-instruction strong'),
    feedbackAlert: document.getElementById('feedback-alert'),
    feedbackIcon: document.getElementById('feedback-icon'),
    feedbackText: document.getElementById('feedback-text'),
    finalScoreVal: document.getElementById('final-score-val'),
    finalTotalVal: document.getElementById('final-total-val'),
    btnTryAgain: document.getElementById('btn-try-again'),
    btnViewSolutionsEnd: document.getElementById('btn-view-solutions-end'),
    solutionsList: document.getElementById('solutions-list'),
    solutionsSubtitle: document.getElementById('solutions-subtitle'),
    btnStartFromSolution: document.getElementById('btn-start-from-solution'),
    btnBackToMenu: document.getElementById('btn-back-to-menu'),
    btnSound: document.getElementById('btn-sound'),
    soundIcon: document.getElementById('sound-icon'),
    confettiCanvas: document.getElementById('confetti-canvas'),

    // Config pill groups
    optOrderGroup: document.getElementById('opt-order-group'),
    optMathGroup: document.getElementById('opt-math-group'),
    optTimeGroup: document.getElementById('opt-time-group'),
    optCountGroup: document.getElementById('opt-count-group'),
    customCountInput: document.getElementById('custom-count-input')
  };

  // -------------------------------------------------------------
  // SCREEN SWITCHER
  // -------------------------------------------------------------
  function showScreen(screenKey) {
    Object.keys(screens).forEach(key => {
      screens[key].classList.toggle('hidden', key !== screenKey);
    });
  }

  // -------------------------------------------------------------
  // CONFIGURATION HANDLERS
  // -------------------------------------------------------------
  function setupConfigPills() {
    // 1. Order direction
    elements.optOrderGroup.querySelectorAll('.cfg-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        elements.optOrderGroup.querySelectorAll('.cfg-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        config.orderDirection = btn.dataset.order;
      });
    });

    // 2. Math Problem Type
    elements.optMathGroup.querySelectorAll('.cfg-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        elements.optMathGroup.querySelectorAll('.cfg-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        config.mathType = btn.dataset.type;
      });
    });

    // 3. Time per Question
    elements.optTimeGroup.querySelectorAll('.cfg-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        elements.optTimeGroup.querySelectorAll('.cfg-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        config.timePerQuestion = parseInt(btn.dataset.time, 10);
      });
    });

    // 4. Questions Count (Pills + Custom Input)
    if (elements.optCountGroup) {
      elements.optCountGroup.querySelectorAll('.cfg-pill').forEach(btn => {
        btn.addEventListener('click', () => {
          elements.optCountGroup.querySelectorAll('.cfg-pill').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const count = parseInt(btn.dataset.count, 10);
          config.totalQuestions = count;
          if (elements.customCountInput) {
            elements.customCountInput.value = count;
          }
        });
      });
    }

    if (elements.customCountInput) {
      elements.customCountInput.addEventListener('input', () => {
        let val = parseInt(elements.customCountInput.value, 10);
        if (isNaN(val) || val < 1) val = 1;
        if (val > 100) val = 100;
        config.totalQuestions = val;

        // Sync active pill if exact match
        if (elements.optCountGroup) {
          elements.optCountGroup.querySelectorAll('.cfg-pill').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.count, 10) === val);
          });
        }
      });
    }
  }

  // -------------------------------------------------------------
  // TEST INITIALIZATION & RUN
  // -------------------------------------------------------------
  function startTest() {
    sound.init();

    // Dynamically generate fresh randomized question set
    state.testQuestions = generateFullTestSet(config, config.totalQuestions);
    state.currentIndex = 0;
    state.score = 0;

    elements.qTotal.textContent = state.testQuestions.length;
    elements.qScore.textContent = state.score;

    showScreen('quiz');
    loadQuestion(0);
  }

  function loadQuestion(index) {
    if (index >= state.testQuestions.length) {
      finishTest();
      return;
    }

    state.currentIndex = index;
    state.userSelections = [];
    state.isAnsweringLocked = false;

    elements.qCurrent.textContent = index + 1;
    elements.qScore.textContent = state.score;
    hideFeedback();

    const currentQ = state.testQuestions[index];

    if (currentQ.order === 'desc') {
      elements.orderDirText.textContent = "HIGH → LOW (Largest First)";
    } else {
      elements.orderDirText.textContent = "LOW → HIGH (Smallest First)";
    }

    elements.circlesGrid.innerHTML = '';

    // Shuffle circle positions on screen
    const displayOptions = [...currentQ.options].sort(() => Math.random() - 0.5);

    displayOptions.forEach((opt, optIndex) => {
      const circle = document.createElement('div');
      circle.className = 'math-circle';
      circle.textContent = opt.text;
      circle.dataset.value = opt.value;
      circle.dataset.index = optIndex;

      circle.addEventListener('click', () => {
        handleBubbleClick(circle, opt, currentQ.order);
      });

      elements.circlesGrid.appendChild(circle);
    });

    startCountdown();
  }

  // -------------------------------------------------------------
  // COUNTDOWN TIMER
  // -------------------------------------------------------------
  function startCountdown() {
    if (state.timer) clearInterval(state.timer);

    state.timeRemaining = config.timePerQuestion;
    updateProgressBar();

    const intervalMs = 100;
    const stepDec = intervalMs / 1000;

    state.timer = setInterval(() => {
      if (state.isAnsweringLocked) return;

      state.timeRemaining -= stepDec;
      updateProgressBar();

      if (state.timeRemaining <= 3.0 && state.timeRemaining > 0 && Math.abs(state.timeRemaining % 1) < 0.15) {
        sound.playTick();
      }

      if (state.timeRemaining <= 0) {
        clearInterval(state.timer);
        handleQuestionTimeout();
      }
    }, intervalMs);
  }

  function updateProgressBar() {
    const total = config.timePerQuestion;
    const percent = Math.max(0, (state.timeRemaining / total) * 100);
    elements.progressBar.style.width = `${percent}%`;

    elements.progressBar.classList.remove('warning', 'danger');
    if (percent <= 30) {
      elements.progressBar.classList.add('danger');
    } else if (percent <= 60) {
      elements.progressBar.classList.add('warning');
    }
  }

  function handleQuestionTimeout() {
    state.isAnsweringLocked = true;
    sound.playWrong();
    showFeedback("⏳", "Time's Up!");

    revealAnswers();

    setTimeout(() => {
      loadQuestion(state.currentIndex + 1);
    }, 1200);
  }

  // -------------------------------------------------------------
  // BUBBLE SELECTION & VALIDATION
  // -------------------------------------------------------------
  function handleBubbleClick(circleElem, opt, requiredOrder) {
    if (state.isAnsweringLocked) return;
    sound.init();

    // Prevent clicking already selected circle
    if (circleElem.classList.contains('is-selected')) return;

    circleElem.classList.add('is-selected');
    const selectionNumber = state.userSelections.length + 1;
    state.userSelections.push({ elem: circleElem, opt: opt });

    // Show selection badge (1, 2, 3)
    const badge = document.createElement('span');
    badge.className = 'order-badge';
    badge.textContent = selectionNumber;
    circleElem.appendChild(badge);

    sound.playBubblePop(selectionNumber - 1);

    if (state.userSelections.length === 3) {
      validateSelections(requiredOrder);
    }
  }

  function validateSelections(requiredOrder) {
    state.isAnsweringLocked = true;
    if (state.timer) clearInterval(state.timer);

    const sel = state.userSelections;
    let isCorrect = false;

    if (requiredOrder === 'desc') {
      // HIGH -> LOW
      isCorrect = (sel[0].opt.value >= sel[1].opt.value) && (sel[1].opt.value >= sel[2].opt.value);
    } else {
      // LOW -> HIGH
      isCorrect = (sel[0].opt.value <= sel[1].opt.value) && (sel[1].opt.value <= sel[2].opt.value);
    }

    if (isCorrect) {
      state.score++;
      elements.qScore.textContent = state.score;
      sound.playCorrect();

      sel.forEach(s => {
        s.elem.classList.remove('is-selected');
        s.elem.classList.add('is-correct');
      });

      showFeedback("✓", "Correct!");

      setTimeout(() => {
        loadQuestion(state.currentIndex + 1);
      }, 550);
    } else {
      sound.playWrong();

      sel.forEach(s => {
        s.elem.classList.remove('is-selected');
        s.elem.classList.add('is-error');
      });

      showFeedback("✗", "Incorrect Order!");
      revealAnswers();

      setTimeout(() => {
        loadQuestion(state.currentIndex + 1);
      }, 1200);
    }
  }

  function revealAnswers() {
    const circles = elements.circlesGrid.querySelectorAll('.math-circle');
    circles.forEach(c => {
      const val = parseFloat(c.dataset.value);
      const valFormatted = (val % 1 === 0) ? val : val.toFixed(3);
      c.innerHTML = `<div>${c.textContent}</div><div style="font-size:0.8rem;color:#fef08a;margin-top:2px;">= ${valFormatted}</div>`;
    });
  }

  // -------------------------------------------------------------
  // TEST COMPLETE
  // -------------------------------------------------------------
  function finishTest() {
    if (state.timer) clearInterval(state.timer);

    elements.finalScoreVal.textContent = state.score;
    if (elements.finalTotalVal) {
      elements.finalTotalVal.textContent = state.testQuestions.length;
    }
    showScreen('completed');

    if (state.score >= Math.floor(state.testQuestions.length * 0.75)) {
      sound.playCelebration();
      triggerConfetti();
    }
  }

  // -------------------------------------------------------------
  // DYNAMIC TEST-BASED SOLUTION SHEET
  // -------------------------------------------------------------
  function renderSolutionSheet() {
    elements.solutionsList.innerHTML = '';

    if (!state.testQuestions || state.testQuestions.length === 0) {
      state.testQuestions = generateFullTestSet(config, config.totalQuestions);
    }

    if (elements.solutionsSubtitle) {
      elements.solutionsSubtitle.textContent = `All ${state.testQuestions.length} questions with computed values and correct sorting order:`;
    }

    state.testQuestions.forEach((q, idx) => {
      const isDesc = (q.order === 'desc');

      // Sort options strictly based on required order
      const sorted = [...q.options].sort((a, b) => isDesc ? (b.value - a.value) : (a.value - b.value));

      const item = document.createElement('div');
      item.className = 'solution-item-card';

      const exprString = q.options.map(o => o.text).join(' | ');
      const symbol = isDesc ? ' > ' : ' < ';
      const label = isDesc ? 'High to Low Order' : 'Low to High Order';

      const orderString = sorted.map(o => {
        const valFormatted = (o.value % 1 === 0) ? o.value : o.value.toFixed(3);
        return `<strong>${o.text}</strong> (${valFormatted})`;
      }).join(symbol);

      item.innerHTML = `
        <div class="solution-q-header">
          <span class="q-num">Q${idx + 1}:</span> Expressions: ${exprString}
        </div>
        <div class="solution-order-result">
          → ${label}: ${orderString}
        </div>
      `;

      elements.solutionsList.appendChild(item);
    });
  }

  function showSolutionsScreen() {
    sound.init();
    renderSolutionSheet();
    showScreen('solutions');
  }

  // -------------------------------------------------------------
  // UI HELPERS
  // -------------------------------------------------------------
  function showFeedback(icon, text) {
    elements.feedbackIcon.textContent = icon;
    elements.feedbackText.textContent = text;
    elements.feedbackAlert.classList.remove('hidden');
  }

  function hideFeedback() {
    elements.feedbackAlert.classList.add('hidden');
  }

  // -------------------------------------------------------------
  // EVENT LISTENERS
  // -------------------------------------------------------------
  function setupEventListeners() {
    setupConfigPills();

    // Start buttons
    elements.btnStart.addEventListener('click', startTest);
    elements.btnStartFromSolution.addEventListener('click', startTest);

    // Try again / Back to menu
    elements.btnTryAgain.addEventListener('click', () => {
      showScreen('start');
    });

    elements.btnBackToMenu.addEventListener('click', () => {
      showScreen('start');
    });

    // View solution sheet
    elements.btnViewSolutionsEnd.addEventListener('click', showSolutionsScreen);

    // Sound toggle
    elements.btnSound.addEventListener('click', () => {
      const muted = sound.toggleMute();
      elements.soundIcon.textContent = muted ? '🔇' : '🔊';
    });
  }

  // -------------------------------------------------------------
  // CONFETTI PARTICLES
  // -------------------------------------------------------------
  let confettiParticles = [];
  let confettiAnimationId = null;

  function setupConfetti() {
    const canvas = elements.confettiCanvas;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });
  }

  function triggerConfetti() {
    const canvas = elements.confettiCanvas;
    const ctx = canvas.getContext('2d');
    confettiParticles = [];

    const colors = ['#0070f3', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#38bdf8'];
    for (let i = 0; i < 90; i++) {
      confettiParticles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.7) * 16,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let aliveCount = 0;

      confettiParticles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.012;

        if (p.opacity > 0) {
          aliveCount++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (aliveCount > 0) {
        confettiAnimationId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    animate();
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupConfetti();
  });
})();
