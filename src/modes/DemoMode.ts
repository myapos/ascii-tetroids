import type { IGameMode } from "src/modes/IGameMode";
import type { GameState } from "src/domain/GameState";
import type { IDifficultyLevel } from "src/difficulty/DifficultyLevel";
import {
  EasyDifficulty,
  NormalDifficulty,
  HardDifficulty,
} from "src/difficulty/DifficultyLevel";
import type { UserMove } from "src/types";
import { ClassicMode } from "src/modes/ClassicMode";
import { GameLogic } from "src/game/GameLogic";
import { Renderer } from "src/rendering/Renderer";
import { InputHandler } from "src/input/InputHandler";
import { Terminal } from "src/rendering/Terminal";
import { readMovements } from "src/utils/readMovements";
import chalk from "chalk";
import {
  splashScreenConfig,
  splashScreenLines,
} from "src/modes/splashScreenConfig";
import { demoFooterConfig, demoFooterLines } from "src/modes/demoFooterConfig";
import {
  SPLASH_SCREEN_DELAY,
  DIFFICULTY_SELECTION_TIMEOUT,
} from "src/constants/constants";
import { getGameStateMediator } from "src/state/GameStateMediator";
import { ModeContext } from "src/state/ModeContext";

export class DemoMode implements IGameMode {
  private gameLogic: GameLogic;
  private renderer: Renderer;
  private inputHandler: InputHandler;
  private classicMode!: ClassicMode;
  private modeContext!: ModeContext;
  private playListener: ((event: unknown) => void) | null = null;
  private menuActive = false;

  constructor(
    gameLogic: GameLogic,
    renderer: Renderer,
    inputHandler: InputHandler
  ) {
    this.gameLogic = gameLogic;
    this.renderer = renderer;
    this.inputHandler = inputHandler;
  }

  async initialize(): Promise<void> {
    const movements = (await readMovements()) as UserMove[];
    this.classicMode = new ClassicMode(
      this.gameLogic,
      this.renderer,
      this.inputHandler,
      movements,
      () => this.displayDemoFooter()
    );
  }

  async play(
    gameState: GameState,
    difficulty: IDifficultyLevel
  ): Promise<void> {
    const mediator = getGameStateMediator();
    this.modeContext = new ModeContext(this.inputHandler);
    this.modeContext.activate();

    await this.initialize();
    this.displaySplashScreen();
    mediator.setPhase("splash");

    // Wait for user to press P or timeout
    const { userInitiatedPlay, selectedDifficulty } =
      await this.waitForPlayOrTimeout(difficulty);

    // Track user initiation in mediator
    mediator.setUserInitiated(userInitiatedPlay);

    // Use selected difficulty if user initiated play, otherwise use default
    let gameModeDifficulty = selectedDifficulty || difficulty;

    try {
      const mode = new ClassicMode(
        this.gameLogic,
        this.renderer,
        this.inputHandler,
        userInitiatedPlay ? undefined : await readMovements(),
        userInitiatedPlay ? undefined : () => this.displayDemoFooter()
      );

      // If not user-initiated, we're in demo phase - mode will signal when to exit
      if (!userInitiatedPlay) {
        mediator.setPhase("demo");
      } else {
        mediator.setPhase("playing");
      }

      await mode.play(gameState, gameModeDifficulty);

      // Check if user pressed play during demo
      if (mediator.getCurrentPhase() === "playing" && !userInitiatedPlay) {
        // User pressed P during demo, transition to player mode
        gameModeDifficulty = mediator.getSelectedDifficulty() || difficulty;

        // Clean up demo mode listeners before starting player mode
        this.modeContext.cleanup();

        // Restart game in player mode
        const playerMode = new ClassicMode(
          this.gameLogic,
          this.renderer,
          this.inputHandler
        );
        await playerMode.play(gameState, gameModeDifficulty);
      }
    } finally {
      // Clean up all listeners
      this.modeContext.cleanup();
      mediator.reset();
    }
  }

  private async waitForPlayOrTimeout(
    defaultDifficulty: IDifficultyLevel
  ): Promise<{
    userInitiatedPlay: boolean;
    selectedDifficulty?: IDifficultyLevel;
  }> {
    const mediator = getGameStateMediator();
    return new Promise((resolve) => {
      let userPressed = false;
      let isInDemoPhase = false;

      this.playListener = async () => {
        // If we're in demo phase, handle showing the menu
        if (isInDemoPhase) {
          const selectedDifficulty = await this.showDifficultyMenu();
          mediator.setSelectedDifficulty(selectedDifficulty);
          mediator.setPhase("playing");
          // Note: Don't resolve here - just signal phase change
          // ClassicMode will detect this via mediator and exit the demo loop
          return;
        }

        // Otherwise, we're in splash screen phase
        userPressed = true;

        // Show difficulty menu (clears itself on selection)
        const selectedDifficulty = await this.showDifficultyMenu();

        resolve({ userInitiatedPlay: true, selectedDifficulty });
      };

      this.modeContext.registerListener("play", this.playListener);
      this.inputHandler.start();

      // Timeout after 10 seconds to auto-start demo
      setTimeout(() => {
        if (!userPressed) {
          // Set flag to indicate we're in demo phase now
          isInDemoPhase = true;
          // Don't clean up the listener - keep it active for P presses during demo
          resolve({
            userInitiatedPlay: false,
            selectedDifficulty: defaultDifficulty,
          });
        }
      }, SPLASH_SCREEN_DELAY);
    });
  }

  private displaySplashScreen(): void {
    Terminal.moveCursorHome();
    console.clear();

    const splashArt = splashScreenLines
      .map((line) => this.formatLine(line, splashScreenConfig))
      .join("\n");
    console.log(splashArt);
  }

  private async showDifficultyMenu(): Promise<IDifficultyLevel> {
    // Prevent showing menu multiple times
    if (this.menuActive) {
      return new NormalDifficulty();
    }
    this.menuActive = true;

    const menuText = Terminal.colorizeText(
      "\n\nSELECT DIFFICULTY:\n\n1 - Easy\n2 - Normal (default)\n3 - Hard\n\nSelection will default to Normal in 15 seconds...\n\n"
    );

    Terminal.write(menuText);

    return new Promise((resolve) => {
      let timeoutId: NodeJS.Timeout | null = null;

      const cleanup = () => {
        this.menuActive = false;
        this.inputHandler.unregisterDifficultySelectionHandlers(
          easyHandler,
          normalHandler,
          hardHandler
        );
      };

      const easyHandler = () => {
        if (timeoutId) clearTimeout(timeoutId);
        console.clear();
        Terminal.moveCursorHome();
        Terminal.clearFromCursorToEndOfScreen();
        cleanup();
        resolve(new EasyDifficulty());
      };

      const normalHandler = () => {
        if (timeoutId) clearTimeout(timeoutId);
        console.clear();
        Terminal.moveCursorHome();
        Terminal.clearFromCursorToEndOfScreen();
        cleanup();
        resolve(new NormalDifficulty());
      };

      const hardHandler = () => {
        if (timeoutId) clearTimeout(timeoutId);
        console.clear();
        Terminal.moveCursorHome();
        Terminal.clearFromCursorToEndOfScreen();
        cleanup();
        resolve(new HardDifficulty());
      };

      this.inputHandler.registerDifficultySelectionHandlers(
        easyHandler,
        normalHandler,
        hardHandler
      );

      timeoutId = setTimeout(() => {
        console.clear();
        Terminal.moveCursorHome();
        Terminal.clearFromCursorToEndOfScreen();
        cleanup();
        resolve(new NormalDifficulty());
      }, DIFFICULTY_SELECTION_TIMEOUT);
    });
  }

  private formatLine(
    line: { type: string; leading?: number; text?: string },
    config: {
      contentWidth: number;
      borderLeft?: string;
      borderRight?: string;
      padding: string;
    }
  ): string {
    const {
      contentWidth,
      borderLeft = chalk.cyan("║"),
      borderRight = chalk.cyan("║"),
      padding,
    } = config;

    switch (line.type) {
      case "top":
        return `${padding}${chalk.cyan("╔")}${chalk.cyan(
          "═".repeat(contentWidth)
        )}${chalk.cyan("╗")}`;
      case "divider":
        return `${padding}${chalk.cyan("╠")}${chalk.cyan(
          "═".repeat(contentWidth)
        )}${chalk.cyan("╣")}`;
      case "bottom":
        return `${padding}${chalk.cyan("╚")}${chalk.cyan(
          "═".repeat(contentWidth)
        )}${chalk.cyan("╝")}`;
      case "empty":
        return `${padding}${borderLeft}${" ".repeat(
          contentWidth
        )}${borderRight}`;
      case "content": {
        const leadingSpaces = " ".repeat(line.leading || 0);
        const textLength = this.stripAnsi(line.text || "");
        const rightPadding = Math.max(
          0,
          contentWidth - line.leading! - textLength.length
        );
        return `${padding}${borderLeft}${leadingSpaces}${line.text}${" ".repeat(
          rightPadding
        )}${borderRight}`;
      }
      default:
        return "";
    }
  }

  private stripAnsi(str: string): string {
    const ansiRegex = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, "g");
    return str.replace(ansiRegex, "");
  }

  private displayDemoFooter(): void {
    const footerSplashArt = demoFooterLines
      .map((line) => this.formatLine(line, demoFooterConfig))
      .join("\n");
    console.log(footerSplashArt);
  }

  isUserInitiated(): boolean {
    return getGameStateMediator().isUserInitiated();
  }

  resetUserInitiatedFlag(): void {
    getGameStateMediator().setUserInitiated(false);
  }
}
