import chalk from "chalk";

export const splashScreenConfig = {
  contentWidth: 39,
  padding: "    ",
};

export const splashScreenLines = [
  { type: "top" },
  {
    type: "content",
    leading: 4,
    text: chalk.yellow("TETRIS") + " " + chalk.cyan("- ASCII Edition"),
  },
  { type: "divider" },
  { type: "empty" },
  { type: "content", leading: 4, text: chalk.green("Press P to Play") },
  { type: "empty" },
  {
    type: "content",
    leading: 4,
    text: chalk.gray("Auto-playing demo below..."),
  },
  { type: "empty" },
  { type: "bottom" },
];
