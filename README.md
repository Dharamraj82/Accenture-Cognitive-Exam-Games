# Accenture Cognitive Assessment Games

A web-based practice suite for the Accenture Critical Thinking & Cognitive Assessment, built purely with HTML, CSS, and Vanilla JavaScript.

---

## Games Overview

### 1. Directional Doors & Grid Maze (`/grid-maze/`)
- **Goal**: Collect all keys and reach the exit door before the timer runs out.
- **Rules**: The grid contains hidden invisible walls. Hitting a wall resets you back to the start.
- **Controls**: `Arrow Keys` / `W A S D`, on-screen touch D-Pad, or click adjacent tiles.
- **Features**: 8 progressive difficulty stages (3x3 to 8x8) with guaranteed solvable procedural mazes and a dynamic BFS path solver.

### 2. Pathfinder Logic / Duran Mage (`/motion-flow/`)
- **Goal**: Connect the starting Rocket to the Earth destination by rotating pipe segments.
- **Rules**: Click pipe tiles to rotate them 90 degrees until electricity flows continuously from start to finish.
- **Controls**: `Click` to rotate, `Space` or click **Launch Rocket** to finish, `H` for hints.
- **Features**: 6 progressive stages (4x4 to 7x7) with procedural circuit generation and live power flow simulation.

### 3. Math Order Challenge (`/math-order/`)
- **Goal**: Evaluate mental math expressions rapidly and select the circles in the requested order (High to Low or Low to High).
- **Settings**:
  - Question count: Choose 5, 10, 15, 24, 30, or enter any custom number.
  - Math types: Basic Arithmetic, Fractions & Decimals, or Mixed.
  - Timer: 5s, 10s, 15s, or 20s per question.
- **Features**: Procedural question generation, dynamic countdown bar, and a post-test solution sheet.

---

## Features

- **Procedural Generation**: Every session generates fresh, randomized levels that are 100% solvable.
- **Web Audio**: Native browser sound effects with zero external audio assets.
- **Clean White UI**: Minimalist corporate design with subtle rectangular borders and high contrast.
- **Responsive**: Works on desktop, tablet, and mobile devices.

---

## How to Run (No Installation Required)

Because this project is built 100% with standard HTML, CSS, and JavaScript:

1. **Directly in Browser**: Double-click `index.html` to open it in Chrome, Edge, or Firefox.
2. **VS Code Live Server**: Open the project folder in VS Code and click **"Go Live"** at the bottom right.
3. **GitHub Pages**: You can enable GitHub Pages in your repository settings to play online anywhere.

---

## Project Structure

```text
Game/
├── index.html          # Main Dashboard
├── grid-maze/          # Directional Doors & Grid Maze
├── motion-flow/        # Pathfinder Logic (Duran Mage)
├── math-order/         # Math Order Challenge
└── README.md           # Documentation
```

---

## Developer

- **Developer**: [Dharamraj Pd Yadav](https://github.com/Dharamraj82)
- **Contributions**: Suggest new changes or report issues by opening a pull request on [GitHub](https://github.com/Dharamraj82).
