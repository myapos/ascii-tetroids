type Grid = string[][];

const floodFill = (
  grid: Grid,
  startX: number,
  startY: number,
  newChar: string
): void => {
  const rows = grid.length;
  const cols = grid[0].length;

  // Get the original color at the start point
  const oldColor = grid[startX][startY];

  // If the old color is the same as the new color, there's nothing to do
  if (oldColor === newChar) return;

  // Queue for BFS
  const queue: [number, number][] = [[startX, startY]];

  // Directions for moving up, down, left, right
  const directions = [
    [0, 1], // Right
    [0, -1], // Left
    [1, 0], // Down
    [-1, 0], // Up
  ];

  // Perform BFS
  while (queue.length > 0) {
    const [x, y] = queue.shift()!;

    // Check bounds and color
    if (x < 0 || x >= rows || y < 0 || y >= cols || grid[x][y] !== oldColor) {
      continue;
    }

    // Change the color of the current cell
    grid[x][y] = newChar;

    // Add neighboring cells to the queue
    for (const [dx, dy] of directions) {
      queue.push([x + dx, y + dy]);
    }
  }
};

export default floodFill;
