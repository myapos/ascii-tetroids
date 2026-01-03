/**
 * Creates a debounced version of a function that can only be called
 * once within a specified interval (in milliseconds)
 */
export function debounce(func: () => void, interval: number): () => boolean {
  let lastCallTime = 0;

  return (): boolean => {
    const now = Date.now();
    if (now - lastCallTime >= interval) {
      lastCallTime = now;
      func();
      return true;
    }
    return false;
  };
}
