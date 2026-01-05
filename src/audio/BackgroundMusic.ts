import { spawn, ChildProcess, execSync } from "child_process";
import { resolve } from "path";
import { existsSync } from "fs";
import { AUDIO_VOLUME_UPDATE_DELAY } from "../constants/constants.js";

// When bundled, resolve paths relative to where node is being run from
// In dev mode (tsx), files are in src/audio/sounds
// In prod mode (node dist/), files are in dist/sounds
const MUSIC_PATH = (() => {
  const prodPath = resolve(
    process.cwd(),
    "dist/sounds",
    "background-music.wav"
  );
  const devPath = resolve(
    process.cwd(),
    "src/audio/sounds",
    "background-music.wav"
  );
  return existsSync(prodPath) ? prodPath : devPath;
})();

export class BackgroundMusic {
  private static instance: BackgroundMusic | null = null;
  private process: ChildProcess | null = null;
  private paplayPid: number | null = null;
  private isPlaying = false;
  private volume = 0.5;

  private constructor() {
    // Ensure music stops when process exits
    process.on("exit", () => this.stop());
    process.on("SIGINT", () => {
      this.stop();
      process.exit(0);
    });
    process.on("SIGTERM", () => {
      this.stop();
      process.exit(0);
    });
  }

  /**
   * Get the singleton instance of BackgroundMusic
   */
  static getInstance(): BackgroundMusic {
    if (!BackgroundMusic.instance) {
      BackgroundMusic.instance = new BackgroundMusic();
    }
    return BackgroundMusic.instance;
  }

  /**
   * Start playing background music in a loop
   */
  play(): void {
    if (this.isPlaying) {
      return; // Already playing
    }

    this.isPlaying = true;
    this.startMusic();
  }

  /**
   * Stop playing background music
   */
  stop(): void {
    if (!this.isPlaying) {
      return;
    }

    this.isPlaying = false;
    if (this.paplayPid) {
      try {
        if (process.platform === "win32") {
          // Windows: use taskkill
          execSync(`taskkill /PID ${this.paplayPid} /F`, { stdio: "ignore" });
        } else {
          // Linux/macOS: use kill -9
          execSync(`kill -9 ${this.paplayPid}`, { stdio: "ignore" });
        }
      } catch {
        // Process already dead, ignore
      }
      this.paplayPid = null;
    }
    this.process = null;
  }

  /**
   * Set volume (0.0 - 1.0) without interrupting music
   */
  setVolume(volume: number): void {
    const newVolume = Math.max(0.0, Math.min(1.0, volume));

    if (newVolume !== this.volume) {
      this.volume = newVolume;

      // If music is playing on Linux, adjust volume via pactl
      if (this.isPlaying && this.paplayPid && process.platform === "linux") {
        try {
          const volumePercent = Math.round(newVolume * 100);
          execSync(`pactl set-sink-volume @DEFAULT_SINK@ ${volumePercent}%`, {
            stdio: "ignore",
          });
        } catch {
          // pactl not available or failed, no big deal
        }
      }
      // Note: macOS and Windows will experience a brief interruption on volume change
      // This is acceptable as they don't have seamless volume APIs like PulseAudio
    }
  }

  /**
   * Get current volume
   */
  getVolume(): number {
    return this.volume;
  }

  /**
   * Increase volume
   */
  increaseVolume(): void {
    this.setVolume(this.volume + 0.1);
  }

  /**
   * Decrease volume
   */
  decreaseVolume(): void {
    this.setVolume(this.volume - 0.1);
  }

  /**
   * Internal method to start the music process
   */
  private startMusic(): void {
    const platform = process.platform;

    if (platform === "darwin") {
      // macOS - afplay in loop
      const command = "bash";
      const args = [
        "-c",
        `while true; do afplay "${MUSIC_PATH}" 2>/dev/null || break; done`,
      ];
      this.process = spawn(command, args, {
        stdio: "ignore",
        detached: true,
      });
      if (this.process.pid) {
        this.paplayPid = this.process.pid;
        this.process.unref();
      }
    } else if (platform === "win32") {
      // Windows - PowerShell loop
      const command = "powershell";
      const args = [
        "-c",
        `while ($true) { & "${MUSIC_PATH}" 2>$null; if ($LASTEXITCODE -ne 0) { break } }`,
      ];
      this.process = spawn(command, args, {
        stdio: "ignore",
        detached: true,
      });
      if (this.process.pid) {
        this.paplayPid = this.process.pid;
        this.process.unref();
      }
    } else {
      // Linux - spawn paplay directly, auto-replay when it ends
      this.spawnPaplayLoop();
    }
  }

  /**
   * Spawn paplay and restart it when finished (Linux only)
   */
  private spawnPaplayLoop(): void {
    if (!this.isPlaying) {
      return;
    }

    const paplay = spawn("paplay", [MUSIC_PATH], {
      stdio: "ignore",
      detached: false,
    });

    if (paplay.pid) {
      this.paplayPid = paplay.pid;
    }

    // When this paplay finishes, start the next one
    paplay.on("close", () => {
      if (this.isPlaying) {
        // Restart the music
        setTimeout(() => {
          this.spawnPaplayLoop();
        }, AUDIO_VOLUME_UPDATE_DELAY);
      }
    });

    paplay.on("error", () => {
      if (this.isPlaying) {
        // Restart if there was an error
        setTimeout(() => {
          this.spawnPaplayLoop();
        }, AUDIO_VOLUME_UPDATE_DELAY);
      }
    });
  }
}
