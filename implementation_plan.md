# Algo Lab - Implementation Plan

An atmospheric AI-powered learning platform for algorithms, automata, and computational logic with an immersive experimental UI.

## Goal
Build a React web application called "Algo Lab" that teaches algorithms through immersive visual simulations and terminal-like interactions. The visual identity will be heavily inspired by brutal minimalism, experimental typography, monochrome interfaces, and elegant ASCII art aesthetics, creating an atmosphere of a futuristic, calm, and intelligent research lab.

## User Review Required

> [!IMPORTANT]
> **Project Directory**: I will initialize the project using Vite in a new subdirectory called `algo-lab` within `d:\Aqsha\Tugas\GoogleVibeCode`. 
> **Dependencies**: The stack will be React, Tailwind CSS, and Framer Motion. I will also install `lucide-react` for minimal SVG icons, and `clsx` + `tailwind-merge` for easier Tailwind class management.
> Please let me know if this directory structure and dependency list is acceptable before I run the setup commands.

## Proposed Changes

### 1. Initialization and Setup
- Run `npx create-vite@latest algo-lab --template react` (or `react-ts` if you prefer TypeScript).
- Install Tailwind CSS and its dependencies.
- Install `framer-motion` for smooth, subtle transitions and animations.
- Install `lucide-react` for minimal functional icons.

### 2. Global Styles & Design System
- Configure `tailwind.config.js` with:
  - A monochrome color palette (pure black, off-black, various shades of gray, pure white, soft white).
  - Typography settings: A combination of an elegant sans-serif (e.g., Inter or Geist) for UI and a crisp monospace font (e.g., JetBrains Mono or Space Mono) for ASCII and terminal text.
- Create a global CSS file (`index.css`) that includes:
  - A subtle static noise overlay using a CSS background image or SVG filter to give the app a textured, atmospheric feel.
  - Custom scrollbar styling (thin, minimal).
  - Selection colors (inverted monochrome).

### 3. Core Components

#### [NEW] `src/components/layout/AppLayout.jsx`
The main wrapper providing the grid structure, thin borders, and the noise texture overlay.

#### [NEW] `src/components/layout/Navbar.jsx`
A minimal, floating navigation bar with tiny interface typography and subtle hover states.

#### [NEW] `src/components/home/Hero.jsx`
A spacious landing section featuring experimental typography, large elegant headings, and an elegant ASCII art visualizer component.

#### [NEW] `src/components/ui/Terminal.jsx`
A small AI narration terminal module simulating typed output with monospaced text, mimicking an intelligent AI assistant explaining concepts.

#### [NEW] `src/components/visualizer/AlgorithmCanvas.jsx`
The core learning module. It will feature:
- A dotted/grid background.
- Procedural-looking graphics simulating nodes and edges (e.g., Graph BFS or Automata states) using Framer Motion for slow, deliberate animations.
- Mock visualization data for the initial prototype.

#### [NEW] `src/components/visualizer/SimulationControls.jsx`
Play, pause, and step-forward/backward buttons with extremely minimal graphic elements (thin lines, tiny labels).

### 4. Page Assembly
#### [MODIFY] `src/App.jsx`
Assemble the `AppLayout`, `Navbar`, `Hero`, and `AlgorithmCanvas` together to form the single-page learning interface.

## Verification Plan

### Automated Tests
- Build the project using `npm run build` to verify there are no compilation or bundling errors.

### Manual Verification
- Run the local dev server using `npm run dev`.
- Preview the application in the browser (or capture screenshots) to verify:
  - The monochrome, brutalist aesthetic is strictly maintained.
  - The noise texture and typography meet the requested editorial and atmospheric vibe.
  - Framer Motion animations are slow, subtle, and calming (no rapid or chaotic movement).
  - The terminal typing animations work seamlessly.
  - Layout is responsive and spacious.
