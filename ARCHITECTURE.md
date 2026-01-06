# Architecture Documentation

Detailed architectural patterns and design decisions for ASCII Tetroids.

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

## Patterns Overview

| Pattern                  | Purpose                                      | Location                               |
| ------------------------ | -------------------------------------------- | -------------------------------------- |
| **Dependency Injection** | Explicit wiring eliminates global state      | `GameApplication.ts`                   |
| **Mediator**             | Single source of truth for game state        | `GameStateMediator.ts`                 |
| **Strategy**             | Swappable game modes                         | `IGameMode`, `DemoMode`, `ClassicMode` |
| **Mode Lifecycle**       | Auto cleanup of listeners between modes      | `ModeLifecycle.ts`                     |
| **Singleton**            | Global instances (Mediator, BackgroundMusic) | `getGameStateMediator()`               |
| **Factory**              | Shape/difficulty creation                    | `createShapes()`, `DifficultyLevel`    |

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

## Game State Lifecycle

**Phases**: Splash (10s) → Demo (auto-loop) → Playing (user controls) → Game Over (retry/quit)

- **Splash**: Shows instructions, waits for P key
- **Demo**: Auto-play mode with "Press P to play" prompt
- **Playing**: User-controlled gameplay with scoring and levels
- **Game Over**: Final screen with R (retry) or Q (quit) options

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

## Terminal Rendering

Uses the **alternate screen buffer** to prevent flicker and scrolling:

- Separate display area with no scrollback history
- ANSI escape codes: `\x1b[1049h` (enter) / `\x1b[1049l` (exit)
- Works at any terminal size including during resize
- Clean visual experience with hidden cursor

Benefits:

- ✅ No frame leakage between updates
- ✅ No scrolling issues
- ✅ Proper cleanup on exit
