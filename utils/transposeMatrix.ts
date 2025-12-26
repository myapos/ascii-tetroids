import { swapSimple } from "./swap";

function transposeMatrix<T>(matrix: T[][]) {
  const transposed: T[][] = [];
  for (let i = 0; i < matrix[0].length; i++) {
    transposed.push([]);
    for (let j = 0; j < matrix.length; j++) {
      transposed[i].push(matrix[j][i]);
    }
  }
  return transposed;
}

export function transposeMatrixInPlace<T>(matrix: T[][]): T[][] {
  // Only works for square matrices
  if (matrix.length === 0 || matrix.length !== matrix[0].length) {
    throw new Error(
      "transposeMatrixInPlace only works for square matrices. Use transposeMatrix() for non-square matrices."
    );
  }

  // True in-place swap for square matrices
  for (let i = 0; i < matrix.length; i++) {
    for (let j = i + 1; j < matrix[i].length; j++) {
      const temp = matrix[i][j];
      matrix[i][j] = matrix[j][i];
      matrix[j][i] = temp;
    }
  }
  return matrix;
}

export default transposeMatrix;
