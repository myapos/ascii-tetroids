# Architecture Documentation

Detailed architectural patterns, diagrams, and design decisions for ASCII Tetroids.

## Project Structure

```
src/
├── GameApplication.ts          # Application entry point, explicit dependency wiring
├── mainEngine.ts               # Legacy game engine
├── index.ts                    # CLI entry point
├── inputSample.txt             # Sample input file
├── types.ts                    # Shared type definitions
│
├── domain/                    # Core game domain
│   └── GameState.ts           # Game state interface and class
│
├── game/                      # Game logic layer
│   ├── Game.ts                # Game container (receives all dependencies)
│   ├── GameLogic.ts           # Core game rules (move, rotate, collide, etc.)
│   ├── PreviewManager.ts      # Next piece preview chamber
│   └── __tests__/             # Game logic tests
│
├── modes/                     # Game mode implementations (Strategy Pattern)
│   ├── IGameMode.ts           # Interface that all modes implement
│   ├── DemoMode.ts            # Splash screen + demo gameplay
│   ├── ClassicMode.ts         # Player-controlled game mode
│   ├── splashScreenConfig.ts  # Splash screen ASCII art
│   ├── demoFooterConfig.ts    # Demo mode footer display
│   └── __tests__/             # Mode-specific tests
│
├── state/                     # State management (Mediator Pattern)
│   ├── GameStateMediator.ts   # Centralized game state and phase tracking (Singleton)
│   └── ModeLifecycle.ts       # Per-mode resource and listener management
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

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          GameApplication                                │
│                       (Entry Point, DI Container)                       │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
                ▼                   ▼                   ▼
        ┌──────────────┐   ┌──────────────┐   ┌──────────────────┐
        │  GameLogic   │   │  Renderer    │   │  InputHandler    │
        │ (Game Rules) │   │  (Terminal)  │   │  (Event Emitter) │
        └──────────────┘   └──────────────┘   └──────────────────┘
                │                   │                   │
                └───────────────────┼───────────────────┘
                                    │
                                    ▼
                        ┌─────────────────────┐
                        │  Game Container     │
                        │  (Orchestrator)     │
                        └─────────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
                ▼                   ▼                   ▼
        ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐
        │  DemoMode   │    │ ClassicMode │    │GameStateMediator│
        │ (Strategy)  │    │ (Strategy)  │    │   (Singleton)   │
        └─────────────┘    └─────────────┘    └─────────────────┘
                │                   │                   ▲
                │                   │                   │
                ▼                   ▼                   │
        ┌─────────────────────────────────────────────────┐
        │        ModeLifecycle (Per-Mode)                 │
        │   - registerListener(event, handler)            │
        │   - cleanup() on mode exit                      │
        └─────────────────────────────────────────────────┘
                                    │
                                    ▼
        ┌─────────────────────────────────────────────────┐
        │           Audio System                          │
        │  - SoundManager (effects)                       │
        │  - BackgroundMusic (singleton)                  │
        └─────────────────────────────────────────────────┘


Legend:
  → Dependency flow (top-down injection)
  ↑ State queries/updates
  ● Singleton pattern
```

## UML Class Diagram

```
┌──────────────────────────────┐
│      <<interface>>           │
│       IGameMode              │
├──────────────────────────────┤
│ + play(gameState, diff): ... │
└──────────────────────────────┘
         △                △
         │ implements     │ implements
         │                │
    ┌────────────┐   ┌─────────────┐
    │ DemoMode   │   │ ClassicMode │
    ├────────────┤   ├─────────────┤
    │ - modeLife │   │ - modeLife  │
    │ - renderer │   │ - renderer  │
    │ - gameLogic│   │ - gameLogic │
    │ - mediator │   │ - mediator  │
    └────────────┘   └─────────────┘
         │                │
         └────────┬───────┘
                  │ uses
                  ▼
    ┌──────────────────────────┐
    │   ModeLifecycle          │
    ├──────────────────────────┤
    │ - inputHandler           │
    │ - listeners: Map         │
    ├──────────────────────────┤
    │ + registerListener()     │
    │ + cleanup()              │
    │ + activate()             │
    │ + isRunning(): boolean   │
    └──────────────────────────┘
         │
         │ uses
         ▼
    ┌──────────────────────────┐
    │   InputHandler           │
    ├──────────────────────────┤
    │ - listeners: Map         │
    │ - stdin: ReadStream      │
    ├──────────────────────────┤
    │ + on(event, handler)     │
    │ + off(event, handler)    │
    │ + emit(event)            │
    │ + start()                │
    │ + stop()                 │
    └──────────────────────────┘


┌──────────────────────────────┐
│    GameStateMediator         │
│   <<singleton>>              │
├──────────────────────────────┤
│ - currentPhase: GamePhase    │
│ - selectedDifficulty         │
│ - isUserInitiatedGame        │
│ - eventListeners: Map        │
├──────────────────────────────┤
│ + getCurrentPhase()          │
│ + setPhase(phase)            │
│ + getSelectedDifficulty()    │
│ + setSelectedDifficulty()    │
│ + on(eventType, handler)     │
│ + emit(event)                │
└──────────────────────────────┘
         △
         │ injected
         │ into modes
         │
    ┌────────────────────────────┐
    │    Game Container          │
    ├────────────────────────────┤
    │ - gameLogic                │
    │ - renderer                 │
    │ - inputHandler             │
    │ - difficulty               │
    ├────────────────────────────┤
    │ + runMode(mode)            │
    └────────────────────────────┘


┌──────────────────────────────┐
│     GameLogic                │
├──────────────────────────────┤
│ - shapes: Map                │
│ - gameRules                  │
├──────────────────────────────┤
│ + rotateShape(chamber)       │
│ + moveShapeDown(chamber)     │
│ + moveShapeWithGas(ch, dir)  │
│ + restShape(chamber)         │
│ + checkFilledRows(chamber)   │
│ + checkIfPlayerLost()        │
└──────────────────────────────┘


┌──────────────────────────────┐
│     Renderer                 │
├──────────────────────────────┤
│ - terminal: Terminal         │
│ - outputBuffer               │
├──────────────────────────────┤
│ + renderFrame(chamber, prev) │
│ + enterGame()                │
│ + exitGame()                 │
└──────────────────────────────┘
         │
         │ uses
         ▼
    ┌──────────────────────────┐
    │    Terminal              │
    ├──────────────────────────┤
    │ - stdout                 │
    │ - ansiBuf                │
    ├──────────────────────────┤
    │ + write(text)            │
    │ + colorizeText(text)     │
    │ + clear()                │
    └──────────────────────────┘


┌──────────────────────────────┐
│    GameState                 │
├──────────────────────────────┤
│ - chamber: number[][]        │
│ - previewChamber: number[][] │
│ - score: number              │
│ - level: number              │
│ - isPaused: boolean          │
│ - isActive: boolean          │
│ - gravitySpeed: number       │
├──────────────────────────────┤
│ + reset(chamber, preview)    │
└──────────────────────────────┘


Key Relationships:
  ──────→  Dependency (uses)
  ───implements→  Implementation
  - - - -→  Optional/Reference
  △       Inheritance/Implementation
```

## Architectural Patterns

### 1. Dependency Injection (Application Layer)

The `GameApplication` class wires up all dependencies explicitly, eliminating global state:

**Key Components:**

- **GameApplication** (`src/GameApplication.ts`)
  - Creates core components: `GameLogic`, `Renderer`, `InputHandler`
  - Gets singleton mediator: `getGameStateMediator()`
  - Creates `Game` container with all dependencies
  - Creates modes with injected dependencies
  - Manages game loop orchestration

**Benefits:**

- ✅ No hidden `getInstance()` calls in modes
- ✅ All dependencies visible in constructors
- ✅ Easy to mock for testing
- ✅ Clear data flow from entry point

**Example:**

```typescript
const gameLogic = new GameLogic();
const renderer = new Renderer();
const inputHandler = new InputHandler();
const mediator = getGameStateMediator();

const game = new Game(gameLogic, renderer, inputHandler, difficulty);
const classicMode = new ClassicMode(
  gameLogic,
  renderer,
  inputHandler,
  mediator
);
```

### 2. Mediator Pattern (Game State Management)

The `GameStateMediator` class serves as a single source of truth for game state, eliminating tight coupling between game modes.

**Key Components:**

- **GameStateMediator** (`src/state/GameStateMediator.ts`) - Singleton
  - Tracks game phase: `splash | demo | playing | game-over`
  - Manages selected difficulty
  - Tracks user initiation (P pressed from splash vs. auto-start)
  - Provides event system for phase change notifications
  - Created once via `getGameStateMediator()`, then injected into modes

**Benefits:**

- ✅ Modes receive mediator as dependency, not via global function
- ✅ Single source of truth for game state
- ✅ Modes communicate through mediator, not directly with each other
- ✅ Central place to track game state
- ✅ Easy to add new game phases

**Example Usage:**

```typescript
// In constructor
constructor(..., mediator: GameStateMediator) {
  this.mediator = mediator;
}

// In methods
this.mediator.setPhase("playing"); // Update phase
this.mediator.setSelectedDifficulty(hard); // Store selection
const phase = this.mediator.getCurrentPhase(); // Query state
```

### 3. Strategy Pattern (Game Modes)

The `IGameMode` interface defines a contract for different game modes to implement:

**Key Components:**

- **IGameMode** (`src/modes/IGameMode.ts`)
  - Defines `play(gameState, difficulty): Promise<void>`
  - Implemented by `DemoMode` and `ClassicMode`
  - Modes can be swapped without changing game logic

**Benefits:**

- ✅ Easy to add new game modes
- ✅ Each mode encapsulates its own logic
- ✅ Game logic is independent of mode implementation

### 4. Mode Lifecycle Pattern (Resource Management)

The `ModeLifecycle` class manages the mode lifecycle - setup and cleanup of resources - and automatically cleans up listeners to prevent accumulation.

**Key Components:**

- **ModeLifecycle** (`src/state/ModeContext.ts`)
  - Manages mode lifecycle: activation and cleanup
  - Tracks all listeners registered by a mode
  - Provides `registerListener()` method for automatic cleanup tracking
  - Cleanup all listeners with single `cleanup()` call
  - Prevents listener leaks and memory accumulation
  - Similar to React/Vue onMount/onUnmount lifecycle hooks

**Benefits:**

- ✅ Guaranteed cleanup in all cases (prevents resource leaks)
- ✅ Automatic listener tracking and cleanup
- ✅ No orphaned event handlers
- ✅ Clean mode transitions
- ✅ Easy to debug listener count

**Example Usage:**

```typescript
const lifecycle = new ModeLifecycle(inputHandler);
lifecycle.activate(); // onMount

lifecycle.registerListener("play", handlePlay); // Tracked for cleanup

try {
  // ... mode runs ...
} finally {
  lifecycle.cleanup(); // onUnmount - guaranteed to run
}
```

### 5. Singleton Pattern (Mediator & Audio)

A few components use singleton for global state:

- **GameStateMediator** (`src/state/GameStateMediator.ts`) - Single mediator for all modes (passed via DI)
- **BackgroundMusic** (`src/audio/BackgroundMusic.ts`) - Single audio instance across modes

### 6. Factory Pattern

- **createShapes()** (`src/shapes/createShapes.ts`) - Creates all 7 Tetroids piece types
- **Difficulty Classes** (`src/difficulty/DifficultyLevel.ts`) - Easy/Normal/Hard difficulty objects

## Data Flow

```
User Input
    ↓
InputHandler (emits events)
    ↓
ModeLifecycle.registerListener() (tracks listener)
    ↓
Mode Handler (DemoMode or ClassicMode)
    ↓
GameStateMediator.setPhase() (update state)
    ↓
Other modes detect phase change via mediator
    ↓
Mode exits, ModeLifecycle.cleanup() removes all listeners
```

## Mode Transitions

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
    ModeLifecycle.cleanup()
    Back to DemoMode
```

## Game State Lifecycle

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

## Key Design Decisions

| Decision                    | Reason                                                 |
| --------------------------- | ------------------------------------------------------ |
| **Mediator Pattern**        | Decouples modes from knowing about each other          |
| **ModeLifecycle**           | Prevents listener accumulation between mode switches   |
| **Singleton Game State**    | Shared state across all modes (chambers, score, level) |
| **Alternate Screen Buffer** | Prevents frame flicker and terminal scrolling issues   |
| **Event-Driven Input**      | Decouples input handling from game logic               |
| **Difficulty Classes**      | Easy to extend with new difficulty levels              |
| **Cross-Platform Audio**    | Works on Linux, macOS, Windows without dependencies    |

## Extension Points

To add a new game mode:

1. Create `src/modes/NewMode.ts` implementing `IGameMode`
2. Use `ModeLifecycle` for listener tracking
3. Query `GameStateMediator` for state
4. Call `mediator.setPhase()` to signal transitions
5. Update `GameApplication.ts` to route to new mode

## Audio System

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

## Terminal Rendering

Uses the **alternate screen buffer** to prevent terminal scrolling and frame leakage:

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
