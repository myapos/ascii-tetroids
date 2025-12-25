import { patterns } from "src/constants/constants";
import maskPattern from "./maskPattern";

const checkPatterns = (pattern: string[][]) => {
  // preprocess pattern
  let copyPattern = maskPattern(pattern);

  let checks = [];
  for (let i = 0; i < patterns.length; i++) {
    const currentPattern = patterns[i];

    let checkedPattern = [];
    for (let j = 0; j < currentPattern.length; j++) {
      for (let k = 0; k < currentPattern[j].length; k++) {
        if (currentPattern[j][k] === "#") {
          continue;
        }

        if (copyPattern[j][k] === "@") {
          checkedPattern.push(false);
          break;
        }

        if (currentPattern[j][k] === copyPattern[j][k]) {
          checkedPattern.push(true);
        } else {
          // console.log("checking", currentPattern[j][k], copyPattern[j][k]);
          checkedPattern.push(false);
        }
      }
    }

    const patternResult = checkedPattern.reduce(
      (acc, curr) => acc && curr,
      true
    );
    checks.push(patternResult);
  }

  // console.log("checks", checks);
  return checks.reduce((acc, curr) => acc || curr, false);
};

export default checkPatterns;
