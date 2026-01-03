import { runApplication } from "./src/GameApplication";

async function main() {
  await runApplication();
}

main().catch(console.error);
