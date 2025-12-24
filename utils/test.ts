const test = (actual: number, expected: number) => {
  if (actual === expected) {
    console.log(`✅ Test passed: actual: ${actual} === expected:${expected}`);
  } else {
    console.error(
      `⛔ Test failed: actual: ${actual} !== expected: ${expected}`
    );
  }
};

export default test;
