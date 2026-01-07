/**
 * OS Detection utilities
 * Provides platform-specific helpers for cross-platform compatibility
 */

export const isWindows = (): boolean => {
  return process.platform === "win32";
};

export const isUnix = (): boolean => {
  return process.platform === "linux" || process.platform === "darwin";
};

export const isMacOS = (): boolean => {
  return process.platform === "darwin";
};

export const isLinux = (): boolean => {
  return process.platform === "linux";
};

export const getOS = (): "windows" | "macos" | "linux" => {
  if (isWindows()) return "windows";
  if (isMacOS()) return "macos";
  return "linux";
};
