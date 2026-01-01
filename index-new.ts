import { Game } from "./src/game/Game";
import { ClassicMode } from "./src/modes/ClassicMode";
import { NormalDifficulty } from "./src/difficulty/DifficultyLevel";

async function main() {
  const game = Game.getInstance();

  // Setup the game mode and difficulty
  const classicMode = new ClassicMode(
    game.getGameLogic(),
    game.getRenderer(),
    game.getInputHandler()
  );

  game.setGameMode(classicMode);
  game.setDifficulty(new NormalDifficulty());

  // Start the game
  await game.start();
}

main().catch(console.error);
