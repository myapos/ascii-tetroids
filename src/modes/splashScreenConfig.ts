import chalk from "chalk";

export const splashScreenConfig = {
  contentWidth: 39,
  padding: "    ",
};

export const splashScreenLines = [
  { type: "top" },
  { type: "empty" },
  {
    type: "content",
    leading: 0,
    text:
      chalk.cyan("###") +
      "  " +
      chalk.yellow("####") +
      "  " +
      chalk.green("###") +
      "  " +
      chalk.magenta("###") +
      "   " +
      chalk.red("#") +
      "  " +
      chalk.blue(" ##"),
  },
  {
    type: "content",
    leading: 0,
    text:
      chalk.cyan(" #") +
      "   " +
      chalk.yellow("#") +
      "     " +
      chalk.green(" #") +
      "   " +
      chalk.magenta("# #") +
      "  " +
      chalk.red(" #") +
      "  " +
      chalk.blue("#"),
  },
  {
    type: "content",
    leading: 0,
    text:
      chalk.cyan(" #") +
      "   " +
      chalk.yellow("##") +
      "    " +
      chalk.green(" #") +
      "   " +
      chalk.magenta("##") +
      "   " +
      chalk.red(" #") +
      "   " +
      chalk.blue("##"),
  },
  {
    type: "content",
    leading: 0,
    text:
      chalk.cyan(" #") +
      "   " +
      chalk.yellow("#") +
      "     " +
      chalk.green(" #") +
      "   " +
      chalk.magenta("# #") +
      "  " +
      chalk.red(" #") +
      "   " +
      chalk.blue("  #"),
  },
  {
    type: "content",
    leading: 0,
    text:
      chalk.cyan(" #") +
      "   " +
      chalk.yellow("####") +
      "   " +
      chalk.green("#") +
      "   " +
      chalk.magenta("#  #") +
      "  " +
      chalk.red("#") +
      "  " +
      chalk.blue("##"),
  },
  { type: "empty" },
  { type: "divider" },
  { type: "empty" },
  {
    type: "content",
    leading: 0,
    text: chalk.cyan("Rules:") + chalk.gray(" Stack falling blocks"),
  },
  {
    type: "content",
    leading: 0,
    text: chalk.cyan("Arrow Keys:") + chalk.gray(" Move & Rotate"),
  },
  {
    type: "content",
    leading: 0,
    text: chalk.cyan("Space:") + chalk.gray(" Pause  |  Q: Quit"),
  },
  { type: "empty" },
  { type: "divider" },
  { type: "empty" },
  {
    type: "content",
    leading: 0,
    text: chalk.gray("Original: Alexey Pajitnov (1984)"),
  },
  {
    type: "content",
    leading: 0,
    text: chalk.gray("Author: ") + chalk.grey("Myron Apostolakis (2626)"),
  },
  { type: "empty" },
  {
    type: "content",
    leading: 0,
    text: chalk.cyan("https://github.com/myapos/ascii-tetris"),
  },
  { type: "empty" },
  { type: "bottom" },
];
