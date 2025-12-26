import transposeMatrix from "./transposeMatrix";

function rotateMatrix<T>(matrix: T[][]) {
  const rotated = transposeMatrix(matrix);
  // reverse each row
  for (let i = 0; i < rotated.length; i++) {
    rotated[i].reverse();
  }

  return rotated;
}

export default rotateMatrix;
