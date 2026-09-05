/**
 * ===================================================================
 * PATHFINDER LOGIC (DURAN MAGE) - PROCEDURAL CORE ENGINE
 * Accenture Pipe/Track Planning Puzzle & Dynamic Power Flow Simulation
 * Procedural random puzzle generator with guaranteed solvability.
 * ===================================================================
 */

(function () {
  'use strict';

  // -------------------------------------------------------------
  // AUDIO SYNTHESIZER
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

    playRotate() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(540, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    }

    playPowerUp() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    }

    playLaunch() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.6);
    }

    playVictory() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = this.ctx.currentTime + idx * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.4);
      });
    }

    playTick() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(700, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.03);
    }
  }

  const sound = new SoundEngine();

  // -------------------------------------------------------------
  // PIPE DEFINITIONS & PORTS
  // -------------------------------------------------------------
  const PORTS_ORDER = ['top', 'right', 'bottom', 'left'];

  const BASE_PIPES = {
    'I': ['left', 'right'],
    'L': ['top', 'right'],
    'T': ['left', 'top', 'right'],
    'X': ['top', 'right', 'bottom', 'left'],
    'start': ['right'],
    'target': ['left']
  };

  const OPPOSITE_PORT = {
    'top': 'bottom',
    'bottom': 'top',
    'left': 'right',
    'right': 'left'
  };

  const PORT_DELTAS = {
    'top': { dr: -1, dc: 0 },
    'bottom': { dr: 1, dc: 0 },
    'left': { dr: 0, dc: -1 },
    'right': { dr: 0, dc: 1 }
  };

  // -------------------------------------------------------------
  // STAGE CONFIGURATIONS (6 Progressive Difficulty Tiers)
  // -------------------------------------------------------------
  const STAGES = [
    { id: 1, name: "Stage 1 (4x4)", size: 4, minPath: 5, maxPath: 7, timeLimit: 180 },
    { id: 2, name: "Stage 2 (4x4)", size: 4, minPath: 6, maxPath: 8, timeLimit: 200 },
    { id: 3, name: "Stage 3 (5x5)", size: 5, minPath: 7, maxPath: 10, timeLimit: 220 },
    { id: 4, name: "Stage 4 (5x5)", size: 5, minPath: 8, maxPath: 12, timeLimit: 240 },
    { id: 5, name: "Stage 5 (6x6)", size: 6, minPath: 10, maxPath: 15, timeLimit: 260 },
    { id: 6, name: "Stage 6 (7x7)", size: 7, minPath: 12, maxPath: 18, timeLimit: 300 }
  ];

  // -------------------------------------------------------------
  // PROCEDURAL PIPE PUZZLE GENERATOR (100% Solvable)
  // -------------------------------------------------------------
  function generateProceduralPipeLevel(stageIndex) {
    const config = STAGES[stageIndex] || STAGES[0];
    const size = config.size;

    // Helper: get direction name from delta
    function getDir(dr, dc) {
      if (dr === -1 && dc === 0) return 'top';
      if (dr === 1 && dc === 0) return 'bottom';
      if (dr === 0 && dc === -1) return 'left';
      if (dr === 0 && dc === 1) return 'right';
      return null;
    }

    // 1. Pick start and target positions on boundaries
    const startPos = { r: 0, c: 0 };
    const targetPos = { r: size - 1, c: size - 1 };

    // 2. Generate a random self-avoiding path from start to target
    let path = null;
    let pathAttempts = 0;

    while (!path && pathAttempts < 200) {
      pathAttempts++;
      path = findRandomPath(startPos, targetPos, size, config.minPath, config.maxPath);
    }

    // Fallback simple path if random search exhausted
    if (!path) {
      path = [];
      let r = 0, c = 0;
      path.push({ r, c });
      while (c < size - 1) { c++; path.push({ r, c }); }
      while (r < size - 1) { r++; path.push({ r, c }); }
    }

    // 3. Construct empty grid
    const grid = Array.from({ length: size }, () => Array(size).fill(null));
    const solution = {};

    // First node is Start Rocket
    const firstStepDir = getDir(path[1].r - path[0].r, path[1].c - path[0].c);
    grid[startPos.r][startPos.c] = { type: 'start' };
    const levelStart = { r: startPos.r, c: startPos.c, type: 'start', exitPort: firstStepDir };

    // Last node is Target Earth
    const lastStepDir = getDir(path[path.length - 1].r - path[path.length - 2].r, path[path.length - 1].c - path[path.length - 2].c);
    grid[targetPos.r][targetPos.c] = { type: 'target' };
    const levelTarget = { r: targetPos.r, c: targetPos.c, type: 'target', enterPort: OPPOSITE_PORT[lastStepDir] };

    // 4. Fill path intermediate cells with matching pipe types & determine solution rotation
    for (let i = 1; i < path.length - 1; i++) {
      const cur = path[i];
      const prev = path[i - 1];
      const next = path[i + 1];

      const inPort = getDir(prev.r - cur.r, prev.c - cur.c); // port facing previous cell
      const outPort = getDir(next.r - cur.r, next.c - cur.c); // port facing next cell

      const { pipeType, correctRot } = determinePipeForPorts(inPort, outPort);

      // Scramble initial rotation by 1, 2, or 3 turns of 90 deg
      const scrambleOffset = Math.floor(Math.random() * 3) + 1; // 1, 2, or 3
      const initialRot = (correctRot + scrambleOffset) % 4;

      grid[cur.r][cur.c] = { type: pipeType, rot: initialRot };
      solution[`${cur.r},${cur.c}`] = correctRot;
    }

    // 5. Fill non-path cells with random decoy pipes (70% filled)
    const decoyTypes = ['I', 'L', 'T'];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!grid[r][c] && Math.random() < 0.75) {
          const type = decoyTypes[Math.floor(Math.random() * decoyTypes.length)];
          const rot = Math.floor(Math.random() * 4);
          grid[r][c] = { type, rot };
        }
      }
    }

    return {
      id: config.id,
      name: config.name,
      size,
      timeLimit: config.timeLimit,
      start: levelStart,
      target: levelTarget,
      grid,
      solution
    };
  }

  function findRandomPath(start, target, size, minLen, maxLen) {
    const visited = new Set([`${start.r},${start.c}`]);
    const path = [start];

    function dfs(cur) {
      if (cur.r === target.r && cur.c === target.c) {
        return path.length >= minLen;
      }
      if (path.length >= maxLen) return false;

      const dirs = [
        { dr: -1, dc: 0 },
        { dr: 1, dc: 0 },
        { dr: 0, dc: -1 },
        { dr: 0, dc: 1 }
      ];

      // Shuffle directions for randomness
      for (let i = dirs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
      }

      for (const d of dirs) {
        const nr = cur.r + d.dr;
        const nc = cur.c + d.dc;
        const key = `${nr},${nc}`;

        if (nr >= 0 && nr < size && nc >= 0 && nc < size && !visited.has(key)) {
          visited.add(key);
          path.push({ r: nr, c: nc });

          if (dfs({ r: nr, c: nc })) return true;

          path.pop();
          visited.delete(key);
        }
      }

      return false;
    }

    return dfs(start) ? path : null;
  }

  function determinePipeForPorts(port1, port2) {
    // Check straight pipe ('I')
    if ((port1 === 'left' && port2 === 'right') || (port1 === 'right' && port2 === 'left')) {
      return { pipeType: 'I', correctRot: 0 };
    }
    if ((port1 === 'top' && port2 === 'bottom') || (port1 === 'bottom' && port2 === 'top')) {
      return { pipeType: 'I', correctRot: 1 };
    }

    // Check corner pipe ('L')
    const hasTop = port1 === 'top' || port2 === 'top';
    const hasRight = port1 === 'right' || port2 === 'right';
    const hasBottom = port1 === 'bottom' || port2 === 'bottom';
    const hasLeft = port1 === 'left' || port2 === 'left';

    // Base 'L': ['top', 'right'] (rot 0)
    if (hasTop && hasRight) return { pipeType: 'L', correctRot: 0 };
    // rot 1: ['right', 'bottom']
    if (hasRight && hasBottom) return { pipeType: 'L', correctRot: 1 };
    // rot 2: ['bottom', 'left']
    if (hasBottom && hasLeft) return { pipeType: 'L', correctRot: 2 };
    // rot 3: ['left', 'top']
    if (hasLeft && hasTop) return { pipeType: 'L', correctRot: 3 };

    return { pipeType: 'I', correctRot: 0 };
  }

  // -------------------------------------------------------------
  // GAME STATE
  // -------------------------------------------------------------
  const state = {
    currentStageIndex: 0,
    currentLevel: null,
    currentGrid: [],
    rotations: {}, // Map: "r,c" -> rotation (0, 1, 2, 3)
    poweredSet: new Set(),
    isSolved: false,
    isCompleted: false,
    moves: 0,
    timeRemaining: 0,
    timerInterval: null,
    levelStartTime: null,
    completedStages: new Set()
  };

  // -------------------------------------------------------------
  // DOM REFERENCES
  // -------------------------------------------------------------
  const elements = {
    levelPills: document.getElementById('level-pills'),
    boardFrame: document.getElementById('board-frame'),
    pipeGrid: document.getElementById('pipe-grid'),
    flyingRocket: document.getElementById('flying-rocket'),
    boardToast: document.getElementById('board-toast'),
    toastMsg: document.getElementById('toast-msg'),
    timerBadge: document.getElementById('timer-badge'),
    timerText: document.getElementById('timer-text'),
    movesCount: document.getElementById('moves-count'),
    btnReset: document.getElementById('btn-reset'),
    btnHint: document.getElementById('btn-hint'),
    btnLaunch: document.getElementById('btn-launch'),
    btnSound: document.getElementById('btn-sound'),
    soundIcon: document.getElementById('sound-icon'),
    btnHelp: document.getElementById('btn-help'),
    modalHelp: document.getElementById('modal-help'),
    btnCloseHelp: document.getElementById('btn-close-help'),
    btnGotHelp: document.getElementById('btn-got-help'),
    modalVictory: document.getElementById('modal-victory'),
    btnNext: document.getElementById('btn-next'),
    btnReplay: document.getElementById('btn-replay'),
    metricTime: document.getElementById('metric-time'),
    metricMoves: document.getElementById('metric-moves'),
    metricRating: document.getElementById('metric-rating'),
    confettiCanvas: document.getElementById('confetti-canvas')
  };

  // -------------------------------------------------------------
  // INITIALIZATION
  // -------------------------------------------------------------
  function initGame() {
    renderLevelSelector();
    loadStage(0, true);
    setupEventListeners();
    setupConfetti();
  }

  // -------------------------------------------------------------
  // LEVEL MANAGEMENT
  // -------------------------------------------------------------
  function renderLevelSelector() {
    elements.levelPills.innerHTML = '';
    STAGES.forEach((stage, index) => {
      const btn = document.createElement('button');
      btn.className = `level-pill ${index === state.currentStageIndex ? 'active' : ''} ${state.completedStages.has(index) ? 'completed' : ''}`;
      btn.textContent = stage.name;
      btn.addEventListener('click', () => {
        sound.init();
        loadStage(index, true);
      });
      elements.levelPills.appendChild(btn);
    });
  }

  function updateLevelPills() {
    const pills = elements.levelPills.querySelectorAll('.level-pill');
    pills.forEach((pill, idx) => {
      pill.classList.toggle('active', idx === state.currentStageIndex);
      pill.classList.toggle('completed', state.completedStages.has(idx));
    });
  }

  function loadStage(stageIndex, forceNew = true) {
    if (stageIndex < 0 || stageIndex >= STAGES.length) return;

    state.currentStageIndex = stageIndex;
    if (forceNew || !state.currentLevel) {
      state.currentLevel = generateProceduralPipeLevel(stageIndex);
    }

    const level = state.currentLevel;

    state.rotations = {};
    state.moves = 0;
    state.isSolved = false;
    state.isCompleted = false;
    state.poweredSet = new Set();
    state.timeRemaining = level.timeLimit;
    state.levelStartTime = Date.now();

    // Deep clone grid
    state.currentGrid = level.grid.map((row, r) =>
      row.map((cell, c) => {
        if (!cell) return null;
        const rot = cell.rot !== undefined ? cell.rot : 0;
        state.rotations[`${r},${c}`] = rot;
        return { ...cell, rot };
      })
    );

    elements.movesCount.textContent = state.moves;
    elements.btnLaunch.classList.remove('ready');
    elements.flyingRocket.classList.add('hidden');

    hideToast();
    closeModals();
    updateLevelPills();
    startTimer();
    renderBoard();
    updatePowerConnectivity();
  }

  // -------------------------------------------------------------
  // TIMER & HUD
  // -------------------------------------------------------------
  function startTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    updateTimerHUD();

    state.timerInterval = setInterval(() => {
      if (state.isCompleted) return;

      state.timeRemaining--;
      updateTimerHUD();

      if (state.timeRemaining <= 10 && state.timeRemaining > 0) {
        sound.playTick();
      }

      if (state.timeRemaining <= 0) {
        clearInterval(state.timerInterval);
        showToast("⏳ Time's Up! Advancing to next stage...");
        setTimeout(() => {
          hideToast();
          loadStage((state.currentStageIndex + 1) % STAGES.length, true);
        }, 1400);
      }
    }, 1000);
  }

  function updateTimerHUD() {
    const remaining = Math.max(0, state.timeRemaining);
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    elements.timerText.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    elements.timerBadge.classList.remove('warning', 'danger');
    if (remaining <= 15) {
      elements.timerBadge.classList.add('danger');
    } else if (remaining <= 35) {
      elements.timerBadge.classList.add('warning');
    }
  }

  // -------------------------------------------------------------
  // PIPE GRAPH & POWER PROPAGATION
  // -------------------------------------------------------------
  function getActivePorts(cellType, rot) {
    const basePorts = BASE_PIPES[cellType] || [];
    if (basePorts.length === 0) return [];

    return basePorts.map(port => {
      const idx = PORTS_ORDER.indexOf(port);
      const rotatedIdx = (idx + rot) % 4;
      return PORTS_ORDER[rotatedIdx];
    });
  }

  function updatePowerConnectivity() {
    const level = state.currentLevel;
    const size = level.size;
    const startPos = level.start;
    const targetPos = level.target;

    state.poweredSet = new Set();
    const queue = [{ r: startPos.r, c: startPos.c }];
    const visited = new Set([`${startPos.r},${startPos.c}`]);
    state.poweredSet.add(`${startPos.r},${startPos.c}`);

    let reachesTarget = false;

    while (queue.length > 0) {
      const cur = queue.shift();
      const curCell = state.currentGrid[cur.r][cur.c];
      if (!curCell) continue;

      const curRot = state.rotations[`${cur.r},${cur.c}`] || 0;
      let curPorts = getActivePorts(curCell.type, curRot);

      // Rocket start node always emits power in its exit direction
      if (curCell.type === 'start') {
        curPorts = [startPos.exitPort || 'right'];
      }

      curPorts.forEach(port => {
        const delta = PORT_DELTAS[port];
        if (!delta) return;
        const nr = cur.r + delta.dr;
        const nc = cur.c + delta.dc;
        const nKey = `${nr},${nc}`;

        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          const neighborCell = state.currentGrid[nr][nc];
          if (neighborCell && !visited.has(nKey)) {
            const neighborRot = state.rotations[nKey] || 0;
            let neighborPorts = getActivePorts(neighborCell.type, neighborRot);

            if (neighborCell.type === 'target') {
              neighborPorts = [targetPos.enterPort || 'left'];
            }

            const requiredPort = OPPOSITE_PORT[port];

            if (neighborPorts.includes(requiredPort)) {
              visited.add(nKey);
              state.poweredSet.add(nKey);
              queue.push({ r: nr, c: nc });

              if (nr === targetPos.r && nc === targetPos.c) {
                reachesTarget = true;
              }
            }
          }
        }
      });
    }

    // Check if newly solved
    if (reachesTarget && !state.isSolved) {
      state.isSolved = true;
      elements.btnLaunch.classList.add('ready');
      sound.playPowerUp();
      showToast("⚡ Route Complete! Ready to Launch Rocket!");
    } else if (!reachesTarget && state.isSolved) {
      state.isSolved = false;
      elements.btnLaunch.classList.remove('ready');
    }

    updateTilesPoweredClass();
  }

  function updateTilesPoweredClass() {
    const tiles = elements.pipeGrid.querySelectorAll('.pipe-tile');
    tiles.forEach(tile => {
      const r = parseInt(tile.dataset.row);
      const c = parseInt(tile.dataset.col);
      const key = `${r},${c}`;
      tile.classList.toggle('is-powered', state.poweredSet.has(key));
    });
  }

  // -------------------------------------------------------------
  // BOARD RENDERING & SVG PIPES
  // -------------------------------------------------------------
  function renderBoard() {
    const level = state.currentLevel;
    const size = level.size;

    elements.pipeGrid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    elements.pipeGrid.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    elements.pipeGrid.innerHTML = '';

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = state.currentGrid[r][c];
        const tile = document.createElement('div');
        tile.className = 'pipe-tile';
        tile.dataset.row = r;
        tile.dataset.col = c;

        if (!cell) {
          tile.classList.add('is-locked');
          elements.pipeGrid.appendChild(tile);
          continue;
        }

        const rot = state.rotations[`${r},${c}`] || 0;

        if (cell.type === 'start') {
          tile.classList.add('is-start', 'is-locked');
          tile.innerHTML = `<span class="endpoint-icon">🚀</span>`;
        } else if (cell.type === 'target') {
          tile.classList.add('is-target', 'is-locked');
          tile.innerHTML = `<span class="endpoint-icon">🌍</span>`;
        } else {
          // Render SVG Pipe representation
          tile.innerHTML = createPipeSVG(cell.type);
          tile.style.transform = `rotate(${rot * 90}deg)`;

          tile.addEventListener('click', () => {
            handleTileRotate(r, c, tile);
          });
        }

        elements.pipeGrid.appendChild(tile);
      }
    }
  }

  function createPipeSVG(type) {
    let pathD = '';

    if (type === 'I') {
      pathD = 'M 0,50 L 100,50';
    } else if (type === 'L') {
      pathD = 'M 50,0 Q 50,50 100,50';
    } else if (type === 'T') {
      pathD = 'M 0,50 L 100,50 M 50,50 L 50,0';
    } else if (type === 'X') {
      pathD = 'M 0,50 L 100,50 M 50,0 L 50,100';
    }

    return `
      <svg class="pipe-svg" viewBox="0 0 100 100">
        <path class="pipe-segment" d="${pathD}" />
        <path class="pipe-core" d="${pathD}" />
      </svg>
    `;
  }

  // -------------------------------------------------------------
  // TILE ROTATION & INTERACTION
  // -------------------------------------------------------------
  function handleTileRotate(r, c, tileElem) {
    if (state.isCompleted) return;
    sound.init();

    const cell = state.currentGrid[r][c];
    if (!cell || cell.type === 'start' || cell.type === 'target') return;

    const key = `${r},${c}`;
    const newRot = (state.rotations[key] + 1) % 4;
    state.rotations[key] = newRot;
    cell.rot = newRot;

    state.moves++;
    elements.movesCount.textContent = state.moves;

    tileElem.style.transform = `rotate(${newRot * 90}deg)`;
    sound.playRotate();

    updatePowerConnectivity();
  }

  // -------------------------------------------------------------
  // LAUNCH ROCKET & VICTORY
  // -------------------------------------------------------------
  function handleLaunch() {
    sound.init();
    if (!state.isSolved) {
      showToast("❌ Circuit is not complete yet! Rotate pipes to connect 🚀 to 🌍.");
      return;
    }

    if (state.isCompleted) return;
    state.isCompleted = true;
    if (state.timerInterval) clearInterval(state.timerInterval);

    sound.playLaunch();
    animateRocketFlight();
  }

  function animateRocketFlight() {
    const level = state.currentLevel;
    const size = level.size;
    const canvasRect = elements.pipeGrid.getBoundingClientRect();
    const frameRect = elements.boardFrame.getBoundingClientRect();

    const cellW = canvasRect.width / size;
    const cellH = canvasRect.height / size;
    const offX = canvasRect.left - frameRect.left;
    const offY = canvasRect.top - frameRect.top;

    const rocket = elements.flyingRocket;
    rocket.classList.remove('hidden');

    const startX = offX + level.start.c * cellW + (cellW - 32) / 2;
    const startY = offY + level.start.r * cellH + (cellH - 32) / 2;
    rocket.style.left = `${startX}px`;
    rocket.style.top = `${startY}px`;

    const targetX = offX + level.target.c * cellW + (cellW - 32) / 2;
    const targetY = offY + level.target.r * cellH + (cellH - 32) / 2;

    setTimeout(() => {
      rocket.style.left = `${targetX}px`;
      rocket.style.top = `${targetY}px`;
      rocket.style.transform = 'scale(1.3) rotate(45deg)';
    }, 100);

    setTimeout(() => {
      handleStageVictory();
    }, 700);
  }

  function handleStageVictory() {
    state.completedStages.add(state.currentStageIndex);
    updateLevelPills();
    sound.playVictory();
    triggerConfetti();

    const timeSpent = Math.max(1, Math.round((Date.now() - state.levelStartTime) / 1000));
    elements.metricTime.textContent = `${timeSpent}s`;
    elements.metricMoves.textContent = state.moves;

    let rating = "⭐⭐⭐";
    if (state.moves > 20 || timeSpent > 60) rating = "⭐⭐";
    if (state.moves > 35 || timeSpent > 120) rating = "⭐";
    elements.metricRating.textContent = rating;

    setTimeout(() => {
      elements.modalVictory.classList.remove('hidden');
    }, 400);
  }

  // -------------------------------------------------------------
  // HINT / AUTO-SOLVER
  // -------------------------------------------------------------
  function applySolutionHint() {
    sound.init();
    const level = state.currentLevel;
    if (!level.solution) return;

    let correctedCount = 0;

    // Fix the first unaligned solution pipe
    for (const key of Object.keys(level.solution)) {
      const [r, c] = key.split(',').map(Number);
      const targetRot = level.solution[key];

      if (state.rotations[key] !== targetRot) {
        state.rotations[key] = targetRot;
        if (state.currentGrid[r] && state.currentGrid[r][c]) {
          state.currentGrid[r][c].rot = targetRot;
        }
        correctedCount++;
        break; // Step-by-step hint for high engagement
      }
    }

    // Re-render transforms
    const tiles = elements.pipeGrid.querySelectorAll('.pipe-tile');
    tiles.forEach(tile => {
      const r = parseInt(tile.dataset.row);
      const c = parseInt(tile.dataset.col);
      const key = `${r},${c}`;
      if (state.rotations[key] !== undefined) {
        tile.style.transform = `rotate(${state.rotations[key] * 90}deg)`;
      }
    });

    sound.playRotate();
    updatePowerConnectivity();
    showToast("💡 Pipe segment aligned!");
  }

  // -------------------------------------------------------------
  // UI HELPERS
  // -------------------------------------------------------------
  let toastTimer = null;
  function showToast(message) {
    elements.toastMsg.textContent = message;
    elements.boardToast.classList.remove('hidden');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 2000);
  }

  function hideToast() {
    elements.boardToast.classList.add('hidden');
  }

  function closeModals() {
    elements.modalVictory.classList.add('hidden');
    elements.modalHelp.classList.add('hidden');
  }

  // -------------------------------------------------------------
  // EVENT LISTENERS
  // -------------------------------------------------------------
  function setupEventListeners() {
    elements.btnReset.addEventListener('click', () => {
      sound.init();
      loadStage(state.currentStageIndex, true);
    });

    elements.btnHint.addEventListener('click', applySolutionHint);
    elements.btnLaunch.addEventListener('click', handleLaunch);

    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyR') loadStage(state.currentStageIndex, true);
      if (e.code === 'KeyH') applySolutionHint();
      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleLaunch();
      }
      if (e.code === 'KeyM') toggleSound();
    });

    elements.btnSound.addEventListener('click', toggleSound);

    elements.btnHelp.addEventListener('click', () => {
      elements.modalHelp.classList.remove('hidden');
    });
    elements.btnCloseHelp.addEventListener('click', () => {
      elements.modalHelp.classList.add('hidden');
    });
    elements.btnGotHelp.addEventListener('click', () => {
      elements.modalHelp.classList.add('hidden');
    });

    elements.btnNext.addEventListener('click', () => {
      loadStage((state.currentStageIndex + 1) % STAGES.length, true);
    });
    elements.btnReplay.addEventListener('click', () => {
      loadStage(state.currentStageIndex, true);
    });
  }

  function toggleSound() {
    const muted = sound.toggleMute();
    elements.soundIcon.textContent = muted ? '🔇' : '🔊';
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

  document.addEventListener('DOMContentLoaded', initGame);
})();
