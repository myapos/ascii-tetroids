# ASCII Tetroids

A TypeScript implementation of a terminal-based block-stacking puzzle game, rendered with ASCII art.

> **Note**: This is a fan implementation inspired by the classic Tetris game. Tetris® is a registered trademark of The Tetris Company. This project is not affiliated with or endorsed by The Tetris Company.

## Getting Started

```bash
npm install
npm run dev
```

## Requirements

- **Node.js**: v20.7.0 or higher
- **npm**: v10.1.0 or higher

## Tech Stack

- **Language**: TypeScript 5.9
- **Package Manager**: npm
- **Build**: esbuild (production), tsx (development)
- **Testing**: Vitest
- **Linting**: ESLint v9
- **Audio**: Cross-platform sound system (paplay on Linux, afplay on macOS, PowerShell on Windows)

## Scripts

```bash
npm run dev          # Run game in development mode (tsx)
npm run build        # Build minified production bundle
npm test             # Run test suite
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues automatically
```

## Development Workflow

**Development:** Use `npm run dev` for fast TypeScript execution without bundling.

**Production Build:**

```bash
npm run build        # Creates dist/index.js (minified, ~8-10KB)
```

The build produces a single minified JavaScript bundle with source dependencies inlined, suitable for distribution or deployment.

**Testing:** Vitest is configured for quick unit tests during development. Tests run with `npm test` or via the git pre-push hook.

## Code Quality

ESLint runs automatically on `git push` via a pre-push hook configured in `.githooks/pre-push`. This prevents commits with lint errors.

## How to Play

Use the keyboard controls to move and rotate pieces:

| Key               | Action                         |
| ----------------- | ------------------------------ |
| **← Left Arrow**  | Move piece left                |
| **→ Right Arrow** | Move piece right               |
| **↑ Up Arrow**    | Rotate piece                   |
| **↓ Down Arrow**  | Speed up gravity (drop faster) |
| **P or Space**    | Pause/Resume game              |
| **R**             | Play again (after game over)   |
| **+**             | Increase volume                |
| **-**             | Decrease volume                |
| **Q**             | Quit game gracefully           |

Complete rows to clear them and increase your score. The game ends when pieces stack to the top of the board.

## Architecture Overview

This project uses the **Mediator Pattern** to decouple game modes and manage state transitions cleanly. The architecture is organized into distinct layers with clear separation of concerns.

### Project Structure

```
src/
├── GameApplication.ts          # Application entry point, mode orchestration
├── mainEngine.ts               # Legacy game engine
├── index.ts                    # CLI entry point
├── inputSample.txt             # Sample input file
├── types.ts                    # Shared type definitions
│
├── domain/                     # Core game domain
│   └── GameState.ts           # Game state interface and class
│
├── game/                       # Game logic layer
│   ├── Game.ts                # Game singleton, manages renderer/logic
│   ├── GameLogic.ts           # Core game rules (move, rotate, collide, etc.)
│   ├── PreviewManager.ts      # Next piece preview chamber
│   └── __tests__/             # Game logic tests
│
├── modes/                     # Game mode implementations (Mediator Pattern)
│   ├── IGameMode.ts           # Interface that all modes implement
│   ├── DemoMode.ts            # Splash screen + demo gameplay
│   ├── ClassicMode.ts         # Player-controlled game mode
│   ├── splashScreenConfig.ts  # Splash screen ASCII art
│   ├── demoFooterConfig.ts    # Demo mode footer display
│   └── __tests__/             # Mode-specific tests
│
├── state/                     # State management (Mediator Pattern)
│   ├── GameStateMediator.ts   # Centralized game state and phase tracking
│   └── ModeContext.ts         # Per-mode resource and listener management
│
├── rendering/                 # Terminal rendering layer
│   ├── Renderer.ts            # Game frame renderer
│   ├── Terminal.ts            # ANSI escape sequence wrappers
│   └── (uses alternate screen buffer for flicker-free rendering)
│
├── input/                      # Input handling layer
│   ├── InputHandler.ts        # Raw input event emission and listener management
│   └── __tests__/             # Input tests
│
├── audio/                     # Cross-platform audio system
│   ├── SoundManager.ts        # Sound effect playback (debounced)
│   ├── BackgroundMusic.ts     # Background music singleton
│   └── sounds/                # Audio assets (.wav files)
│
├── shapes/                    # Tetroids piece definitions
│   ├── createShapes.ts        # Shape factory
│   ├── leftL.ts, rightL.ts    # L-shaped pieces
│   ├── leftSigma.ts           # Left zigzag (S)
│   ├── rightSigma.ts          # Right zigzag (Z)
│   ├── square.ts              # O-shaped piece
│   ├── T.ts                   # T-shaped piece
│   ├── verticalLine.ts        # I-shaped piece
│   └── __tests__/             # Shape tests
│
├── difficulty/                # Difficulty level definitions
│   └── DifficultyLevel.ts     # Easy, Normal, Hard difficulty classes
│
├── constants/                 # Game constants
│   └── constants.ts           # Magic numbers, timeouts, chamber dimensions
│
└── utils/                     # Utility functions
    ├── clone.ts               # Deep clone chambers
    ├── debounce.ts            # Debounce function wrapper
    ├── isInBounds.ts          # Boundary checking
    ├── readFile.ts            # File I/O utilities
    ├── readMovements.ts       # Read demo movements from file
    ├── rotateMatrix.ts        # 2D matrix rotation
    ├── transposeMatrix.ts     # Matrix transpose
    └── __tests__/             # Utility tests
```

### Architectural Patterns

#### 1. **Mediator Pattern (Game State Management)**

The `GameStateMediator` class serves as a single source of truth for game state, eliminating tight coupling between game modes.

**Key Components:**

- **GameStateMediator** (`src/state/GameStateMediator.ts`)
  - Tracks game phase: `splash | demo | playing | game-over`
  - Manages selected difficulty
  - Tracks user initiation (P pressed from splash vs. auto-start)
  - Provides event system for phase change notifications
  - Singleton instance via `getGameStateMediator()`

**Benefits:**

- ✅ Modes communicate through mediator, not directly with each other
- ✅ No callback chains or flag passing between modes
- ✅ Central place to track game state
- ✅ Easy to add new game phases

**Example Usage:**

```typescript
const mediator = getGameStateMediator();
mediator.setPhase("playing"); // Update phase
mediator.setSelectedDifficulty(hard); // Store selection
const phase = mediator.getCurrentPhase(); // Query state
```

#### 2. **Mode Context Pattern (Resource Management)**

The `ModeContext` class manages per-mode resources and automatically cleans up listeners to prevent accumulation.

**Key Components:**

- **ModeContext** (`src/state/ModeContext.ts`)
  - Tracks all listeners registered by a mode
  - Provides `registerListener()` method for automatic cleanup tracking
  - Cleanup all listeners with single `cleanup()` call
  - Prevents listener leaks and memory accumulation

**Benefits:**

- ✅ Automatic listener tracking and cleanup
- ✅ No orphaned event handlers
- ✅ Clean mode transitions
- ✅ Easy to debug listener count

**Example Usage:**

```typescript
const context = new ModeContext(inputHandler);
context.registerListener("play", handlePlay); // Tracked for cleanup
context.cleanup(); // Remove all listeners
```

#### 3. **Singleton Patterns**

Several components use the singleton pattern for global state:

- **Game** (`src/game/Game.ts`) - Single game instance with shared GameState
- **GameStateMediator** (`src/state/GameStateMediator.ts`) - Single mediator for all modes
- **BackgroundMusic** (`src/audio/BackgroundMusic.ts`) - Single audio instance across modes

#### 4. **Factory Pattern**

- **createShapes()** (`src/shapes/createShapes.ts`) - Creates all 7 Tetris piece types
- **Difficulty Classes** (`src/difficulty/DifficultyLevel.ts`) - Easy/Normal/Hard difficulty objects

### Data Flow

```
User Input
    ↓
InputHandler (emits events)
    ↓
ModeContext.registerListener() (tracks listener)
    ↓
Mode Handler (DemoMode or ClassicMode)
    ↓
GameStateMediator.setPhase() (update state)
    ↓
Other modes detect phase change via mediator
    ↓
Mode exits, ModeContext.cleanup() removes all listeners
```

### Mode Transitions

```
┌─────────────────────────────────┐
│   GameApplication (Orchestrator) │
└─────────────────────────────────┘
          ↓
    ┌──────────────┐
    │  DemoMode    │
    │              │
    │ • Splash     │
    │ • Demo play  │
    └──────────────┘
          ↓
    User presses P
          ↓
    Mediator: splash → demo → playing
          ↓
    ┌──────────────┐
    │ ClassicMode  │
    │              │
    │ • Player mode│
    └──────────────┘
          ↓
    Game over or user quit
          ↓
    ModeContext.cleanup()
    Back to DemoMode
```

### Game State Lifecycle

1. **Splash Phase** (`splash`)

   - Displays splash screen with instructions
   - Waits 10 seconds for user to press P
   - If timeout → transitions to demo
   - If P pressed → transitions to playing

2. **Demo Phase** (`demo`)

   - Plays pre-recorded move sequence
   - Displays "Press P to play" footer
   - If P pressed → transitions to playing
   - If auto-restart → stays in demo

3. **Playing Phase** (`playing`)

   - User controls piece movement
   - Tracks score and level
   - On game over → waits for R (restart) or Q (quit)
   - Can press P to pause/unpause

4. **Game Over**
   - Shows "YOU LOST!!" message
   - User can press R to go back to difficulty selection
   - Or Q to quit

### Key Design Decisions

| Decision                    | Reason                                                 |
| --------------------------- | ------------------------------------------------------ |
| **Mediator Pattern**        | Decouples modes from knowing about each other          |
| **ModeContext**             | Prevents listener accumulation between mode switches   |
| **Singleton Game State**    | Shared state across all modes (chambers, score, level) |
| **Alternate Screen Buffer** | Prevents frame flicker and terminal scrolling issues   |
| **Event-Driven Input**      | Decouples input handling from game logic               |
| **Difficulty Classes**      | Easy to extend with new difficulty levels              |
| **Cross-Platform Audio**    | Works on Linux, macOS, Windows without dependencies    |

### Extension Points

To add a new game mode:

1. Create `src/modes/NewMode.ts` implementing `IGameMode`
2. Use `ModeContext` for listener tracking
3. Query `GameStateMediator` for state
4. Call `mediator.setPhase()` to signal transitions
5. Update `GameApplication.ts` to route to new mode

The game features a complete cross-platform audio system with sound effects and background music.

### Audio Features

- **Sound Effects**: Debounced sound triggers for game events

  - Move/Rotate: 400Hz beep (150ms)
  - Line Complete: 500Hz beep (300ms)
  - Game Loss: 420Hz beep (400ms)
  - Block Rest: 300Hz thud (200ms)

- **Background Music**: 12-second looping relaxing chiptune melody
  - Seamless looping without interruption
  - Volume control with +/- keys
  - Singleton pattern for single instance

### Platform Support

| Platform | Audio Library       | Volume Control               |
| -------- | ------------------- | ---------------------------- |
| Linux    | paplay (PulseAudio) | Seamless via `pactl`         |
| macOS    | afplay (CoreAudio)  | Brief interruption on change |
| Windows  | PowerShell          | Brief interruption on change |

### Implementation

- All sounds are **programmatically generated** (no external dependencies)
- Uses `process.spawn()` for cross-platform audio playback
- Automatic process cleanup on game exit (signal handlers)
- Dev/prod path resolution works in both `npm run dev` and `npm run build` modes

## Terminal Rendering Approach

This game uses the **alternate screen buffer** to prevent terminal scrolling and frame leakage issues. Here's how it works:

### The Problem

When rendering a fixed-size game frame every update cycle, terminal scrollback history can cause issues:

- Old frames from previous loops become visible
- Terminal creates scrollbars when output exceeds visible height
- Multiple frame iterations leak into each other
- Resizing the terminal reveals accumulated old content

### The Solution: Alternate Screen Buffer

The alternate screen buffer (`\x1b[1049h`) is a terminal feature used by real TUI applications (vim, tmux, less, etc.). It provides a separate display area that:

- Has **no scrollback history**
- Doesn't affect the normal terminal buffer
- Automatically cleans up when the application exits

### Implementation Details

We wrap ANSI escape codes in helper functions for readability:

```typescript
const enterAltScreen = () => process.stdout.write("\x1b[1049h");
const exitAltScreen = () => process.stdout.write("\x1b[1049l");
const moveCursorHome = () => process.stdout.write("\x1b[H");
const hideCursor = () => process.stdout.write("\x1b[?25l");
const showCursor = () => process.stdout.write("\x1b[?25h");
```

**Startup:**

```typescript
enterAltScreen(); // Switch to alternate buffer
hideCursor(); // Hide cursor for cleaner visuals
```

**Each Frame:**

```typescript
moveCursorHome(); // Position at top-left
process.stdout.write(frameContent); // Write game state
```

**Exit:**

```typescript
exitAltScreen(); // Return to normal terminal
showCursor(); // Restore cursor
```

This approach provides:

- ✅ No frame leakage between updates
- ✅ No scrolling issues
- ✅ Works at any terminal size (including resizing)
- ✅ Clean visual experience
- ✅ Proper cleanup on exit

### Completed Tasks

- [x] Removed unused utilities
- [x] Removed unused types
- [x] ESLint with TypeScript support and pre-push hook
- [x] Fixed frame leaks and flickering
- [x] Added floor and side edges
- [x] Integrated chalk for colored output
- [x] Migrated from Bun to npm (esbuild, vitest, tsx)
- [x] Game sounds and background music
- [x] Cross-platform audio system

### Future Enhancements

- [x] Score tracking
- [x] select difficulty
- [x] Refactor and organize code structure
- [x] Improved game controls
- [x] Additional game modes
- [x] splash screens
- [x] back and forth, retry handling?
- [ ] database, scores, extra output on preview
- [x] levels
- [ ] check if all columns cells has support
  - [ ] if not then move all columns with no support down until they find
- [x] colors in ascii chars
- [x] add auto mode
- [x] add music
- [x] instructions for pausing in preview
- [ ] deb packaging
