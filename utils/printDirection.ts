type Direction = "^" | "v" | "<" | ">" | string;

const isUp = (char: string) => char === "^";
const isDown = (char: string) => char === "v";
const isLeft = (char: string) => char === "<";
const isRight = (char: string) => char === ">";

const printDirection = (movement: Direction) => {
  if (isUp(movement)) {
    console.log("up");
  }
  if (isDown(movement)) {
    console.log("down");
  }
  if (isLeft(movement)) {
    console.log("left");
  }
  if (isRight(movement)) {
    console.log("right");
  }
};

export default printDirection;
