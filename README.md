# ASCII Tetris

A TypeScript implementation of Tetris using ASCII art for display.

## Getting Started

```bash
npm install
npm run dev
```

## Tech Stack

- **Language**: TypeScript 5.9
- **Package Manager**: npm
- **Build**: esbuild (production), tsx (development)
- **Testing**: Vitest
- **Linting**: ESLint v9

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
| **Q**             | Quit game gracefully           |

Complete rows to clear them and increase your score. The game ends when pieces stack to the top of the board.

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

### Future Enhancements

- [ ] Score tracking with persistent storage
- [ ] Refactoor and organize code structure
- [x] Improved game controls
- [ ] Additional game modes
- [ ] splash screens
- [x] back and forth, retry handling?
- [ ] database, scores, extra output on preview
- [ ] levels --> OK
- [ ] check if all columns cells has support
  - [ ] if not then move all columns with no support down until they find
- [x] colors in ascii chars
- [ ] add auto mode
- [ ] add music
- [ ] instructions for pausing in preview
- [ ] deb packaging
