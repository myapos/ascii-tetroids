# ASCII Tetris

A TypeScript implementation of Tetris using ASCII art for display.

## Getting Started

```bash
bun install
bun run index.ts
```

## Tech Stack

- TypeScript
- Bun

## Testing

```bash
bun test
```

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

### TODOS

- clean up
- refactor/organization
  - not used utils removal
  - not used types removal
- terminal issues
  - frame leaks and overflows --> OK
  - flickering --> OK
- use class for code orgnization,
- add floor and side edges --> OK
- chalk ?
- Features
  - records
  - better game control --> OK
  - splash screens
  - back and forth, retry handling?
  - database, scores, extra output on preview
  - check if all columns cells has support
    - if not then move all columns with no support down until they find
  - colors in ascii chars
  - add auto mode
