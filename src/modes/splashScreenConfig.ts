import chalk from "chalk";

export const splashScreenConfig = {
  contentWidth: 45,
  padding: "    ",
};

const ASCII = [
  {
    type: "content",
    leading: 0,
    text:
      chalk.cyan(" ### ") +
      "  " +
      chalk.gray("###") +
      "   " +
      chalk.green("###") +
      "    " +
      chalk.magenta("#") +
      "    " +
      chalk.red("#"),
  },
  {
    type: "content",
    leading: 0,
    text:
      chalk.cyan("#   #") +
      "  " +
      chalk.gray("#") +
      "    " +
      chalk.green("#   #") +
      "   " +
      chalk.magenta("#") +
      "    " +
      chalk.red("#"),
  },
  {
    type: "content",
    leading: 0,
    text:
      chalk.cyan("#####") +
      "  " +
      chalk.gray("##") +
      "   " +
      chalk.green("#") +
      "       " +
      chalk.magenta("#") +
      "    " +
      chalk.red("#"),
  },
  {
    type: "content",
    leading: 0,
    text:
      chalk.cyan("#   #") +
      "  " +
      chalk.gray("  #") +
      "  " +
      chalk.green("#   #") +
      "   " +
      chalk.magenta("#") +
      "    " +
      chalk.red("#"),
  },
  {
    type: "content",
    leading: 0,
    text:
      chalk.cyan("#   #") +
      "  " +
      chalk.gray("###") +
      "   " +
      chalk.green("###") +
      "    " +
      chalk.magenta("#") +
      "    " +
      chalk.red("#"),
  },
];

const TETROIDS = [
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
      "  " +
      chalk.red("###") +
      "  " +
      chalk.blue("#") +
      "  " +
      chalk.yellow("###") +
      "  " +
      chalk.gray("###"),
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
      chalk.red("# #") +
      "  " +
      chalk.blue("#") +
      "  " +
      chalk.yellow("#  #") +
      " " +
      chalk.gray("#"),
  },
  {
    type: "content",
    leading: 0,
    text:
      chalk.cyan(" #") +
      "   " +
      chalk.yellow("###") +
      "   " +
      chalk.green(" #") +
      "   " +
      chalk.magenta("##") +
      "   " +
      chalk.red("# #") +
      "  " +
      chalk.blue("#") +
      "  " +
      chalk.yellow("#  #") +
      " " +
      chalk.gray("##"),
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
      chalk.red("# #") +
      "  " +
      chalk.blue("#") +
      "  " +
      chalk.yellow("#  #") +
      "  " +
      chalk.gray(" #"),
  },
  {
    type: "content",
    leading: 0,
    text:
      chalk.cyan(" #") +
      "   " +
      chalk.yellow("####") +
      "  " +
      chalk.green(" #") +
      "   " +
      chalk.magenta("#  #") +
      " " +
      chalk.red("###") +
      "  " +
      chalk.blue("#") +
      "  " +
      chalk.yellow("###") +
      "  " +
      chalk.gray("###"),
  },
];

export const splashScreenLines = [
  { type: "top" },
  { type: "empty" },
  ...ASCII,
  { type: "empty" },
  ...TETROIDS,

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
    text: chalk.gray("Author: ") + chalk.gray("Myron Apostolakis (2026)"),
  },
  { type: "empty" },
  {
    type: "content",
    leading: 0,
    text: chalk.cyan("https://github.com/myapos/ascii-tetroids"),
  },
  { type: "empty" },
  { type: "bottom" },
];
