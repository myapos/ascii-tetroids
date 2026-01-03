import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { debounce } from "../utils/debounce.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export type SoundType = "move" | "lineComplete" | "gameLoss";

interface SoundConfig {
  path: string;
  defaultVolume?: number;
}

const SOUND_LIBRARY: Record<SoundType, SoundConfig> = {
  move: {
    path: join(__dirname, "sounds", "move.wav"),
    defaultVolume: 0.5,
  },
  lineComplete: {
    path: join(__dirname, "sounds", "line-complete.wav"),
    defaultVolume: 0.7,
  },
  gameLoss: {
    path: join(__dirname, "sounds", "game-loss.wav"),
    defaultVolume: 0.8,
  },
};

export class SoundManager {
  private volume = 0.5; // Default volume 0.0 - 1.0
  private playMove = debounce(() => this.playSound("move"), 100);
  private playLineComplete = debounce(
    () => this.playSound("lineComplete"),
    100
  );
  private playGameLoss = debounce(() => this.playSound("gameLoss"), 100);

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
    }
  }

  private playSound(soundType: SoundType): void {
    const config = SOUND_LIBRARY[soundType];
    if (!config) {
      console.error(`Unknown sound type: ${soundType}`);
      return;
    }

    const platform = process.platform;
    let command: string;
    let args: string[];

    if (platform === "darwin") {
      // macOS
      command = "afplay";
      args = [config.path];
    } else if (platform === "win32") {
      // Windows
      command = "powershell";
      args = [
        "-c",
        "Add-Type -AssemblyName System.Media; [System.Media.SystemSounds]::Beep.Play()",
      ];
    } else {
      // Linux - paplay volume range is 0-65536
      const volumeValue = Math.round(this.volume * 65536);
      command = "paplay";
      args = [`--volume=${volumeValue}`, config.path];
    }

    spawn(command, args, {
      stdio: "ignore",
      detached: true,
    }).unref();
  }
}
