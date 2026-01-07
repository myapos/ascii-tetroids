import { spawn } from "child_process";
import { resolve } from "path";
import { existsSync } from "fs";
import { debounce } from "../utils/debounce.js";
import {
  SOUND_MOVE_DEBOUNCE,
  SOUND_BLOCK_REST_DEBOUNCE,
} from "../constants/constants.js";

// When bundled, resolve paths relative to where node is being run from
// In dev mode (tsx), files are in src/audio/sounds
// In prod mode (node dist/), files are in dist/sounds
function getSoundPath(filename: string): string {
  const prodPath = resolve(process.cwd(), "dist/sounds", filename);
  const devPath = resolve(process.cwd(), "src/audio/sounds", filename);
  return existsSync(prodPath) ? prodPath : devPath;
}

export type SoundType = "move" | "lineComplete" | "gameLoss" | "blockRest";

interface SoundConfig {
  path: string;
  defaultVolume?: number;
}

const SOUND_LIBRARY: Record<SoundType, SoundConfig> = {
  move: {
    path: getSoundPath("move.wav"),
    defaultVolume: 0.5,
  },
  lineComplete: {
    path: getSoundPath("line-complete.wav"),
    defaultVolume: 0.7,
  },
  gameLoss: {
    path: getSoundPath("game-loss.wav"),
    defaultVolume: 0.8,
  },
  blockRest: {
    path: getSoundPath("block-rest.wav"),
    defaultVolume: 0.6,
  },
};

export class SoundManager {
  private volume = 0.5; // Default volume 0.0 - 1.0
  private playMove = debounce(
    () => this.playSound("move"),
    SOUND_MOVE_DEBOUNCE
  );
  private playLineComplete = debounce(
    () => this.playSound("lineComplete"),
    SOUND_MOVE_DEBOUNCE
  );
  private playGameLoss = debounce(
    () => this.playSound("gameLoss"),
    SOUND_MOVE_DEBOUNCE
  );
  private playBlockRest = debounce(
    () => this.playSound("blockRest"),
    SOUND_BLOCK_REST_DEBOUNCE
  );

  setVolume(volume: number): void {
    this.volume = Math.max(0.0, Math.min(1.0, volume));
  }

  getVolume(): number {
    return this.volume;
  }

  increaseVolume(): void {
    this.setVolume(this.volume + 0.1);
  }

  decreaseVolume(): void {
    this.setVolume(this.volume - 0.1);
  }

  play(soundType: SoundType): void {
    switch (soundType) {
      case "move":
        this.playMove();
        break;
      case "lineComplete":
        this.playLineComplete();
        break;
      case "gameLoss":
        this.playGameLoss();
        break;
      case "blockRest":
        this.playBlockRest();
        break;
    }
  }

  private playSound(soundType: SoundType): void {
    const config = SOUND_LIBRARY[soundType];
    if (!config) {
      return;
    }

    // Use absolute path with forward slashes for consistency
    const absolutePath = resolve(config.path).replace(/\\/g, "/");

    if (!existsSync(absolutePath)) {
      console.warn(`Sound file not found: ${absolutePath}`);
      return;
    }

    const platform = process.platform;

    if (platform === "win32") {
      // Windows - Use PowerShell with PlaySync
      const psScript = `[System.Reflection.Assembly]::LoadWithPartialName('System.Media') | Out-Null; (New-Object System.Media.SoundPlayer("${absolutePath}")).PlaySync()`;
      const proc = spawn("powershell", ["-NoProfile", "-Command", psScript], {
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      });

      proc.stderr?.on("data", (data) => {
        console.error(`[SoundManager] PowerShell error: ${data}`);
      });

      proc.on("error", (err) => {
        console.error(
          `[SoundManager] Failed to spawn PowerShell: ${err.message}`
        );
      });
    } else if (platform === "darwin") {
      // macOS
      const proc = spawn("afplay", [absolutePath], {
        detached: true,
        stdio: "ignore",
      });
      proc.unref();
    } else {
      // Linux - paplay
      const volumeValue = Math.round(this.volume * 65536);
      const proc = spawn("paplay", [`--volume=${volumeValue}`, absolutePath], {
        detached: true,
        stdio: "ignore",
      });
      proc.unref();
    }
  }
}
