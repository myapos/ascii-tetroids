import chalk from "chalk";

export const demoFooterConfig = {
  contentWidth: 39,
  padding: "",
};

export const demoFooterLines = [
  { type: "top" },
  {
    type: "content",
    leading: 0,
    text: " " + chalk.green("Press P to Play") + chalk.gray("  (Q to Quit)"),
  },
  { type: "bottom" },
];
