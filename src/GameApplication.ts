import { Game } from "./game/Game";
import { GameLogic } from "./game/GameLogic";
import { Renderer } from "./rendering/Renderer";
import { InputHandler } from "./input/InputHandler";
import { ClassicMode } from "./modes/ClassicMode";
import { DemoMode } from "./modes/DemoMode";
import { NormalDifficulty } from "./difficulty/DifficultyLevel";
import { getGameStateMediator } from "./state/GameStateMediator";

export class GameApplication {
  async run(): Promise<void> {
    // Create core components
    const gameLogic = new GameLogic();
    const renderer = new Renderer();
    const inputHandler = new InputHandler();
    const difficulty = new NormalDifficulty();
    const mediator = getGameStateMediator(); // Get singleton mediator

    // Create game container with dependencies
    const game = new Game(gameLogic, renderer, inputHandler, difficulty);

    // Set up demo mode
    const demoMode = new DemoMode(gameLogic, renderer, inputHandler, mediator);

    // Set up classic mode
    const classicMode = new ClassicMode(
      gameLogic,
      renderer,
      inputHandler,
      mediator
    );

    // Start with demo, then loop between classic game and demo on loss
    let isDemo = true;

    while (true) {
      game.setDifficulty(difficulty);

      if (isDemo) {
        game.setGameMode(demoMode);
      } else {
        game.setGameMode(classicMode);
      }

      await game.start();

      // Check if demo was exited by user (pressing P)
      if (isDemo && demoMode.isUserInitiated()) {
        // User pressed P in demo, switch to classic mode
        isDemo = false;
        demoMode.resetUserInitiatedFlag();
      } else {
        // Game ended, go back to demo
        game.reset();
        isDemo = true;
        demoMode.resetUserInitiatedFlag();
      }
    }
  }
}

export const runApplication = async () => {
  const app = new GameApplication();
  await app.run();
};
