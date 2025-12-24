import gcd from "./gcd";
// Utility function to compute the least common multiple (LCM)
function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

export function lcmMultiple(numbers: number[]): number {
  return numbers.reduce((acc, num) => lcm(acc, num), 1);
}

export default lcm;
