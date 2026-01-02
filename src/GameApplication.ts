import { Game } from "./game/Game";
import { ClassicMode } from "./modes/ClassicMode";
import { DemoMode } from "./modes/DemoMode";
import { NormalDifficulty } from "./difficulty/DifficultyLevel";

export class GameApplication {
  async run(): Promise<void> {
    const game = Game.getInstance();
    const difficulty = new NormalDifficulty();

    // Set up demo mode
    const demoMode = new DemoMode(
      game.getGameLogic(),
      game.getRenderer(),
      game.getInputHandler()
    );

    // Set up classic mode
    const classicMode = new ClassicMode(
      game.getGameLogic(),
      game.getRenderer(),
      game.getInputHandler()
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
