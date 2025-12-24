// Utility function to compute the greatest common divisor (GCD)
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export default gcd;
