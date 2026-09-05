/**
 * ===================================================================
 * DIRECTIONAL DOORS & GRID MAZE - PROCEDURAL CORE ENGINE
 * Full game logic, dynamic random procedural maze generator with guaranteed
 * solvability, multi-key BFS pathfinder, Web Audio, and touch/keyboard controls.
 * ===================================================================
 */

(function () {
  'use strict';

  // -------------------------------------------------------------
  // AUDIO SYNTHESIZER (Zero-dependency Web Audio API)
  // -------------------------------------------------------------
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.isMuted = false;
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

    toggleMute() {
      this.isMuted = !this.isMuted;
      return this.isMuted;
    }

    playMove() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(480, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    }

    playKeyCollect() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + index * 0.05;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.22);
      });
    }

    playWallHit() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.28);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.28);
    }

    playDoorUnlock() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + index * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    }

    playVictory() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const chord = [523.25, 659.25, 783.99, 1046.5];
      chord.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.8);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.8);
      });
    }

    playTimeout() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const notes = [400, 350, 300, 240];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + idx * 0.1;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.18);
      });
    }

    playTick() {
      if (this.isMuted) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    }
  }

  const sound = new SoundEngine();

  // -------------------------------------------------------------
  // STAGE CONFIGURATIONS (8 Progressive Difficulty Tiers)
  // -------------------------------------------------------------
  const STAGES = [
    { id: 1, name: "Stage 1 (3x3)", size: 3, keys: 1, timeLimit: 25, wallRatio: 0.15 },
    { id: 2, name: "Stage 2 (3x3)", size: 3, keys: 2, timeLimit: 25, wallRatio: 0.18 },
    { id: 3, name: "Stage 3 (4x4)", size: 4, keys: 2, timeLimit: 30, wallRatio: 0.20 },
    { id: 4, name: "Stage 4 (4x4)", size: 4, keys: 3, timeLimit: 35, wallRatio: 0.22 },
    { id: 5, name: "Stage 5 (5x5)", size: 5, keys: 2, timeLimit: 40, wallRatio: 0.24 },
    { id: 6, name: "Stage 6 (6x6)", size: 6, keys: 3, timeLimit: 45, wallRatio: 0.25 },
    { id: 7, name: "Stage 7 (7x7)", size: 7, keys: 3, timeLimit: 55, wallRatio: 0.26 },
    { id: 8, name: "Stage 8 (8x8)", size: 8, keys: 4, timeLimit: 65, wallRatio: 0.28 }
  ];

  // -------------------------------------------------------------
  // PROCEDURAL RANDOM LEVEL GENERATOR (Guaranteed Solvable)
  // -------------------------------------------------------------
  function generateProceduralLevel(stageIndex) {
    const config = STAGES[stageIndex] || STAGES[0];
    const size = config.size;
    const numKeys = config.keys;

    // Helper: random integer in [0, max - 1]
    const randInt = (max) => Math.floor(Math.random() * max);

    // 1. Pick Start position
    const start = { r: randInt(size), c: randInt(size) };

    // 2. Pick Door position (at least Manhattan distance floor(size * 0.8) away)
    let door = null;
    let attempts = 0;
    while (!door && attempts < 100) {
      attempts++;
      const r = randInt(size);
      const c = randInt(size);
      const dist = Math.abs(r - start.r) + Math.abs(c - start.c);
      if (dist >= Math.max(2, size - 2)) {
        door = { r, c };
      }
    }
    if (!door) {
      door = { r: (start.r + size - 1) % size, c: (start.c + size - 1) % size };
    }

    // 3. Pick Keys
    const keys = [];
    const occupied = new Set([`${start.r},${start.c}`, `${door.r},${door.c}`]);

    let keyAttempts = 0;
    while (keys.length < numKeys && keyAttempts < 200) {
      keyAttempts++;
      const r = randInt(size);
      const c = randInt(size);
      const keyStr = `${r},${c}`;
      if (!occupied.has(keyStr)) {
        occupied.add(keyStr);
        keys.push({ r, c });
      }
    }

    // 4. Candidate walls from all remaining unoccupied cells
    const candidateCells = [];
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const keyStr = `${r},${c}`;
        if (!occupied.has(keyStr)) {
          candidateCells.push({ r, c });
        }
      }
    }

    // Shuffle candidate cells
    for (let i = candidateCells.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [candidateCells[i], candidateCells[j]] = [candidateCells[j], candidateCells[i]];
    }

    // 5. Intelligent wall placement with BFS solvability check
    const targetWallCount = Math.floor(size * size * config.wallRatio);
    const walls = [];

    const tempLevel = { size, start, door, keys, walls };

    for (const cell of candidateCells) {
      if (walls.length >= targetWallCount) break;

      // Temporarily add wall
      walls.push(cell);

      // Verify that start -> all keys -> door is still 100% solvable
      const testPath = solveBFSFullPath(start, keys, door, tempLevel);
      if (!testPath || testPath.length === 0) {
        // Disconnected the puzzle! Remove this wall
        walls.pop();
      }
    }

    return {
      id: config.id,
      name: config.name,
      size,
      timeLimit: config.timeLimit,
      start,
      door,
      keys,
      walls
    };
  }

  // -------------------------------------------------------------
  // GAME STATE
  // -------------------------------------------------------------
  const state = {
    currentStageIndex: 0,
    currentLevel: null,
    playerPos: { r: 0, c: 0 },
    remainingKeys: [],
    collectedKeysCount: 0,
    moves: 0,
    timeRemaining: 0,
    timerInterval: null,
    levelStartTime: null,
    isDoorUnlocked: false,
    isLevelCompleted: false,
    isTransitioning: false,
    showingSolution: false,
    solutionPath: [],
    revealedWalls: new Set(),
    completedStages: new Set()
  };

  // -------------------------------------------------------------
  // DOM REFERENCES
  // -------------------------------------------------------------
  const elements = {
    levelButtonsContainer: document.getElementById('level-buttons'),
    hudLevelTitle: document.getElementById('hud-level-title'),
    hudKeysCount: document.getElementById('hud-keys-count'),
    hudTimerText: document.getElementById('hud-timer-text'),
    timerRingProgress: document.getElementById('timer-ring-progress'),
    hudMovesCount: document.getElementById('hud-moves-count'),
    gridBoard: document.getElementById('grid-board'),
    boardAlert: document.getElementById('board-alert'),
    alertIcon: document.getElementById('alert-icon'),
    alertMsg: document.getElementById('alert-msg'),
    btnReset: document.getElementById('btn-reset'),
    btnSolution: document.getElementById('btn-solution'),
    solutionBtnText: document.getElementById('solution-btn-text'),
    btnSound: document.getElementById('btn-sound'),
    soundIcon: document.getElementById('sound-icon'),
    btnInstructions: document.getElementById('btn-instructions'),
    modalInstructions: document.getElementById('modal-instructions'),
    btnCloseInstructions: document.getElementById('btn-close-instructions'),
    btnGotIt: document.getElementById('btn-got-it'),
    modalVictory: document.getElementById('modal-victory'),
    btnNextLevel: document.getElementById('btn-next-level'),
    btnReplayLevel: document.getElementById('btn-replay-level'),
    statTime: document.getElementById('stat-time'),
    statMoves: document.getElementById('stat-moves'),
    statStars: document.getElementById('stat-stars'),
    modalGameComplete: document.getElementById('modal-game-complete'),
    btnRestartGame: document.getElementById('btn-restart-game'),
    confettiCanvas: document.getElementById('confetti-canvas'),
    dpadContainer: document.getElementById('dpad-container')
  };

  // -------------------------------------------------------------
  // INITIALIZATION
  // -------------------------------------------------------------
  function initGame() {
    renderStageButtons();
    loadStage(0, true);
    setupEventListeners();
    setupConfetti();
  }

  // -------------------------------------------------------------
  // STAGE MANAGEMENT
  // -------------------------------------------------------------
  function renderStageButtons() {
    elements.levelButtonsContainer.innerHTML = '';
    STAGES.forEach((stage, index) => {
      const btn = document.createElement('button');
      btn.className = `btn-level ${index === state.currentStageIndex ? 'active' : ''} ${state.completedStages.has(index) ? 'completed' : ''}`;
      btn.innerHTML = `${stage.name}`;
      btn.addEventListener('click', () => {
        sound.init();
        loadStage(index, true);
      });
      elements.levelButtonsContainer.appendChild(btn);
    });
  }

  function updateStageButtons() {
    const btns = elements.levelButtonsContainer.querySelectorAll('.btn-level');
    btns.forEach((btn, idx) => {
      btn.classList.toggle('active', idx === state.currentStageIndex);
      btn.classList.toggle('completed', state.completedStages.has(idx));
    });
  }

  function loadStage(stageIndex, forceNew = true) {
    if (stageIndex < 0 || stageIndex >= STAGES.length) return;

    state.currentStageIndex = stageIndex;
    if (forceNew || !state.currentLevel) {
      state.currentLevel = generateProceduralLevel(stageIndex);
    }

    const level = state.currentLevel;

    // Reset runtime state
    state.playerPos = { ...level.start };
    state.remainingKeys = level.keys.map(k => ({ ...k }));
    state.collectedKeysCount = 0;
    state.moves = 0;
    state.isDoorUnlocked = false;
    state.isLevelCompleted = false;
    state.isTransitioning = false;
    state.showingSolution = false;
    state.solutionPath = [];
    state.revealedWalls.clear();
    state.timeRemaining = level.timeLimit;
    state.levelStartTime = Date.now();

    // UI Updates
    elements.hudLevelTitle.textContent = level.name;
    elements.hudKeysCount.textContent = state.remainingKeys.length;
    elements.hudMovesCount.textContent = state.moves;
    elements.solutionBtnText.textContent = "Show Solution Path";

    hideAlert();
    closeAllModals();
    updateStageButtons();
    startTimer();
    renderBoard();
  }

  // -------------------------------------------------------------
  // TIMER & HUD
  // -------------------------------------------------------------
  function startTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);
    updateTimerDisplay();

    state.timerInterval = setInterval(() => {
      if (state.isLevelCompleted || state.isTransitioning) return;

      state.timeRemaining--;
      updateTimerDisplay();

      if (state.timeRemaining <= 5 && state.timeRemaining > 0) {
        sound.playTick();
      }

      if (state.timeRemaining <= 0) {
        clearInterval(state.timerInterval);
        handleTimerExceeded();
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const level = state.currentLevel;
    const totalTime = level.timeLimit;
    const remaining = Math.max(0, state.timeRemaining);

    elements.hudTimerText.textContent = `${remaining}s`;

    const percentage = (remaining / totalTime) * 100;
    elements.timerRingProgress.setAttribute('stroke-dasharray', `${percentage}, 100`);

    elements.timerRingProgress.classList.remove('warning', 'danger');
    if (remaining <= 5) {
      elements.timerRingProgress.classList.add('danger');
    } else if (remaining <= 10) {
      elements.timerRingProgress.classList.add('warning');
    }
  }

  function handleTimerExceeded() {
    if (state.isLevelCompleted || state.isTransitioning) return;
    state.isTransitioning = true;
    sound.playTimeout();

    showAlert("⏳", "Time's Up! Moving to Next Stage...");

    setTimeout(() => {
      hideAlert();
      const nextIndex = (state.currentStageIndex + 1) % STAGES.length;
      loadStage(nextIndex, true);
    }, 1400);
  }

  // -------------------------------------------------------------
  // BOARD RENDERING
  // -------------------------------------------------------------
  function renderBoard() {
    const level = state.currentLevel;
    const size = level.size;

    elements.gridBoard.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    elements.gridBoard.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    elements.gridBoard.innerHTML = '';

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const tile = document.createElement('div');
        tile.className = 'grid-tile';
        tile.dataset.row = r;
        tile.dataset.col = c;

        // Start tile highlight
        if (r === level.start.r && c === level.start.c) {
          tile.classList.add('start-tile');
        }

        // Check if player is on this tile
        if (r === state.playerPos.r && c === state.playerPos.c) {
          tile.classList.add('entity-player');
          tile.innerHTML = `<span class="player-avatar">👤</span>`;
        }
        // Check if Door is on this tile
        else if (r === level.door.r && c === level.door.c) {
          const unlocked = state.remainingKeys.length === 0;
          if (unlocked) {
            tile.classList.add('door-unlocked');
          }
          tile.innerHTML = `
            <div class="door-container">
              <span class="door-icon">🚪</span>
              <span class="door-lock-badge">${unlocked ? '🔓' : '🔒'}</span>
            </div>
          `;
        }
        // Check if Key is on this tile
        else if (isKeyAt(r, c)) {
          tile.innerHTML = `<span class="key-icon">🔑</span>`;
        }
        // Check if wall was recently revealed
        else if (state.revealedWalls.has(`${r},${c}`)) {
          tile.classList.add('wall-revealed');
          tile.innerHTML = `<span class="wall-icon">🧱</span>`;
        }

        // Check if part of solution path
        if (state.showingSolution && state.solutionPath.length > 0) {
          const stepIndex = state.solutionPath.findIndex(p => p.r === r && p.c === c);
          if (stepIndex >= 0 && !(r === state.playerPos.r && c === state.playerPos.c)) {
            tile.classList.add('solution-step');
            const stepNum = document.createElement('span');
            stepNum.className = 'step-number';
            stepNum.textContent = stepIndex + 1;
            tile.appendChild(stepNum);
          }
        }

        tile.addEventListener('click', () => {
          handleTileClick(r, c);
        });

        elements.gridBoard.appendChild(tile);
      }
    }
  }

  function isKeyAt(r, c) {
    return state.remainingKeys.some(k => k.r === r && k.c === c);
  }

  function isWallAt(r, c, level = state.currentLevel) {
    if (!level) return false;
    return level.walls.some(w => w.r === r && w.c === c);
  }

  // -------------------------------------------------------------
  // PLAYER MOVEMENT & COLLISION LOGIC
  // -------------------------------------------------------------
  function movePlayer(dr, dc) {
    if (state.isLevelCompleted || state.isTransitioning) return;
    sound.init();

    const level = state.currentLevel;
    const newR = state.playerPos.r + dr;
    const newC = state.playerPos.c + dc;

    // Check bounds
    if (newR < 0 || newR >= level.size || newC < 0 || newC >= level.size) {
      return;
    }

    // Check Invisible Wall Collision
    if (isWallAt(newR, newC)) {
      handleWallCollision(newR, newC);
      return;
    }

    // Valid move
    state.playerPos.r = newR;
    state.playerPos.c = newC;
    state.moves++;
    elements.hudMovesCount.textContent = state.moves;
    sound.playMove();

    // Check Key Collection
    const keyIndex = state.remainingKeys.findIndex(k => k.r === newR && k.c === newC);
    if (keyIndex !== -1) {
      state.remainingKeys.splice(keyIndex, 1);
      state.collectedKeysCount++;
      elements.hudKeysCount.textContent = state.remainingKeys.length;
      sound.playKeyCollect();

      if (state.remainingKeys.length === 0) {
        state.isDoorUnlocked = true;
        sound.playDoorUnlock();
        showAlert("🔓", "All keys collected! Door is unlocked!");
        setTimeout(hideAlert, 1200);
      }
    }

    // Check Door Entry
    if (newR === level.door.r && newC === level.door.c) {
      if (state.remainingKeys.length === 0) {
        handleLevelComplete();
        return;
      } else {
        showAlert("🔒", `Collect all keys first! (${state.remainingKeys.length} left)`);
        setTimeout(hideAlert, 1200);
      }
    }

    // If solution path was visible, recalculate from new position
    if (state.showingSolution) {
      state.solutionPath = solveBFSFullPath(state.playerPos, state.remainingKeys, level.door, level) || [];
    }

    renderBoard();
  }

  function handleWallCollision(wr, wc) {
    sound.playWallHit();
    state.moves++;
    elements.hudMovesCount.textContent = state.moves;

    // Reveal wall
    state.revealedWalls.add(`${wr},${wc}`);
    renderBoard();

    showAlert("💥", "Invisible Wall Hit! Resetting to Start...");
    state.isTransitioning = true;

    setTimeout(() => {
      // Teleport back to start point
      state.playerPos = { ...state.currentLevel.start };
      state.isTransitioning = false;
      hideAlert();
      renderBoard();
    }, 600);
  }

  function handleTileClick(targetR, targetC) {
    const dr = targetR - state.playerPos.r;
    const dc = targetC - state.playerPos.c;

    // Only allow adjacent cardinal steps
    if (Math.abs(dr) + Math.abs(dc) === 1) {
      movePlayer(dr, dc);
    }
  }

  // -------------------------------------------------------------
  // LEVEL VICTORY & COMPLETION
  // -------------------------------------------------------------
  function handleLevelComplete() {
    if (state.isLevelCompleted) return;
    state.isLevelCompleted = true;
    if (state.timerInterval) clearInterval(state.timerInterval);

    state.completedStages.add(state.currentStageIndex);
    updateStageButtons();

    sound.playVictory();
    triggerConfetti();

    const timeSpent = Math.max(1, Math.round((Date.now() - state.levelStartTime) / 1000));
    elements.statTime.textContent = `${timeSpent}s`;
    elements.statMoves.textContent = state.moves;

    const level = state.currentLevel;
    const optimalMoves = (level.size * 2) + (level.keys.length * 2);
    let stars = "⭐⭐⭐";
    if (state.moves > optimalMoves * 2 || timeSpent > level.timeLimit * 0.75) {
      stars = "⭐⭐";
    }
    if (state.moves > optimalMoves * 3 || timeSpent > level.timeLimit * 0.9) {
      stars = "⭐";
    }
    elements.statStars.textContent = stars;

    renderBoard();

    const isGameComplete = state.currentStageIndex === STAGES.length - 1;
    setTimeout(() => {
      if (isGameComplete) {
        elements.modalGameComplete.classList.remove('hidden');
      } else {
        elements.modalVictory.classList.remove('hidden');
      }
    }, 400);
  }

  // -------------------------------------------------------------
  // BFS SOLUTION PATH SOLVER
  // -------------------------------------------------------------
  function toggleSolutionPath() {
    sound.init();
    if (state.showingSolution) {
      state.showingSolution = false;
      state.solutionPath = [];
      elements.solutionBtnText.textContent = "Show Solution Path";
      renderBoard();
      return;
    }

    const path = solveBFSFullPath(state.playerPos, state.remainingKeys, state.currentLevel.door, state.currentLevel);
    if (path && path.length > 0) {
      state.showingSolution = true;
      state.solutionPath = path;
      elements.solutionBtnText.textContent = "Hide Solution Path";
      renderBoard();
    } else {
      showAlert("⚠️", "No accessible path found!");
      setTimeout(hideAlert, 1500);
    }
  }

  function solveBFSFullPath(startPos, keysList, doorPos, level) {
    let currentStart = { ...startPos };
    let unvisitedKeys = [...keysList];
    let fullPath = [];

    // Greedily visit closest remaining key
    while (unvisitedKeys.length > 0) {
      let bestPath = null;
      let bestKeyIndex = -1;

      for (let i = 0; i < unvisitedKeys.length; i++) {
        const p = findShortestBFSPath(currentStart, unvisitedKeys[i], level);
        if (p && (bestPath === null || p.length < bestPath.length)) {
          bestPath = p;
          bestKeyIndex = i;
        }
      }

      if (!bestPath) return null; // Unreachable key

      fullPath = fullPath.concat(bestPath);
      currentStart = { ...unvisitedKeys[bestKeyIndex] };
      unvisitedKeys.splice(bestKeyIndex, 1);
    }

    // Then find path from last key (or start) to door
    const pathToDoor = findShortestBFSPath(currentStart, doorPos, level);
    if (!pathToDoor) return null;

    fullPath = fullPath.concat(pathToDoor);
    return fullPath;
  }

  function findShortestBFSPath(start, target, level) {
    if (start.r === target.r && start.c === target.c) return [];

    const queue = [[start]];
    const visited = new Set([`${start.r},${start.c}`]);
    const dirs = [
      { dr: -1, dc: 0 },
      { dr: 1, dc: 0 },
      { dr: 0, dc: -1 },
      { dr: 0, dc: 1 }
    ];

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];

      if (current.r === target.r && current.c === target.c) {
        return path.slice(1); // Exclude starting point
      }

      for (const d of dirs) {
        const nr = current.r + d.dr;
        const nc = current.c + d.dc;
        const key = `${nr},${nc}`;

        if (
          nr >= 0 && nr < level.size &&
          nc >= 0 && nc < level.size &&
          !visited.has(key) &&
          !isWallAt(nr, nc, level)
        ) {
          visited.add(key);
          queue.push([...path, { r: nr, c: nc }]);
        }
      }
    }

    return null;
  }

  // -------------------------------------------------------------
  // UI HELPERS & NOTIFICATIONS
  // -------------------------------------------------------------
  function showAlert(icon, message) {
    elements.alertIcon.textContent = icon;
    elements.alertMsg.textContent = message;
    elements.boardAlert.classList.remove('hidden');
  }

  function hideAlert() {
    elements.boardAlert.classList.add('hidden');
  }

  function closeAllModals() {
    elements.modalInstructions.classList.add('hidden');
    elements.modalVictory.classList.add('hidden');
    elements.modalGameComplete.classList.add('hidden');
  }

  // -------------------------------------------------------------
  // EVENT LISTENERS
  // -------------------------------------------------------------
  function setupEventListeners() {
    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          movePlayer(-1, 0);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          movePlayer(1, 0);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          movePlayer(0, -1);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          movePlayer(0, 1);
          break;
        case 'r':
        case 'R':
          loadStage(state.currentStageIndex, true);
          break;
        case 'h':
        case 'H':
          toggleSolutionPath();
          break;
        case 'm':
        case 'M':
          toggleSound();
          break;
      }
    });

    // Mobile D-Pad
    elements.dpadContainer.querySelectorAll('.dpad-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const dir = btn.dataset.dir;
        if (dir === 'up') movePlayer(-1, 0);
        if (dir === 'down') movePlayer(1, 0);
        if (dir === 'left') movePlayer(0, -1);
        if (dir === 'right') movePlayer(0, 1);
      });
    });

    // Action buttons
    elements.btnReset.addEventListener('click', () => {
      sound.init();
      loadStage(state.currentStageIndex, true);
    });

    elements.btnSolution.addEventListener('click', toggleSolutionPath);

    // Sound toggle
    elements.btnSound.addEventListener('click', toggleSound);

    // Instructions modal
    elements.btnInstructions.addEventListener('click', () => {
      elements.modalInstructions.classList.remove('hidden');
    });
    elements.btnCloseInstructions.addEventListener('click', () => {
      elements.modalInstructions.classList.add('hidden');
    });
    elements.btnGotIt.addEventListener('click', () => {
      elements.modalInstructions.classList.add('hidden');
    });

    // Victory modal
    elements.btnReplayLevel.addEventListener('click', () => {
      loadStage(state.currentStageIndex, true);
    });

    elements.btnNextLevel.addEventListener('click', () => {
      const next = (state.currentStageIndex + 1) % STAGES.length;
      loadStage(next, true);
    });

    // Game complete restart
    elements.btnRestartGame.addEventListener('click', () => {
      state.completedStages.clear();
      loadStage(0, true);
    });
  }

  function toggleSound() {
    const muted = sound.toggleMute();
    elements.soundIcon.textContent = muted ? '🔇' : '🔊';
  }

  // -------------------------------------------------------------
  // CONFETTI PARTICLES EFFECT
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
        p.vy += 0.35; // Gravity
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

  // Boot on DOM ready
  document.addEventListener('DOMContentLoaded', initGame);
})();
