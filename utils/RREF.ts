// a class to reduce an array to REF echelon form
// by using Gaussian elimination
class RREF {
  private coeff: number[][] = [];
  private rightHandSide: number[] = [];
  private augmented: number[][] = [];

  /**
   * It will get a coefficient matrix and a right hand side array
   * and will build the augmented matrix
   */
  constructor(coeff: number[][], rightHandSide: number[]) {
    this.coeff = coeff;
    this.rightHandSide = rightHandSide;
    this.buildAugmentedMatrix();
  }

  buildAugmentedMatrix(): void {
    for (let i = 0; i < this.coeff.length; i++) {
      this.augmented[i] = [...this.coeff[i], this.rightHandSide[i]];
    }
  }

  swapRows(i: number, j: number): void {
    [this.augmented[i], this.augmented[j]] = [
      this.augmented[j],
      this.augmented[i],
    ];
  }

  /**
   * it will add rowSource to rowTarget,
   * rows are of same length
   **/
  addRows(rowSource: number, rowTarget: number): void {
    for (let col = 0; col < this.augmented[rowTarget].length; col++) {
      this.augmented[rowTarget][col] = this.round(
        this.augmented[rowTarget][col] + this.augmented[rowSource][col]
      );
    }
  }

  /**
   * it will multiply row with a number,
   **/
  multiplyRow(row: number, num: number): void {
    for (let col = 0; col < this.augmented[row].length; col++) {
      this.augmented[row][col] = this.round(this.augmented[row][col] * num);
    }
  }

  /**
   * It will find the first pivot row in the augmented matrix
   * @returns [[rowIndex, colIndex], value] of the pivot
   */
  findPivotRow(startRow: number = 0): {
    row: number;
    col: number;
    value: number;
  } {
    for (let cIdx = 0; cIdx < this.augmented[0].length; cIdx++) {
      for (let rIdx = startRow; rIdx < this.augmented.length; rIdx++) {
        const elementToCheckByColumn = this.augmented[rIdx][cIdx];
        if (elementToCheckByColumn !== 0) {
          return { row: rIdx, col: cIdx, value: elementToCheckByColumn };
        }
      }
    }

    return { row: -1, col: -1, value: 0 };
  }

  isInRREF(): boolean {
    // in order to be in RREF form
    // condition 1. non zero rows must come before any rows of all zeros
    // condition 2 the first non zero element in each row from the left must be 1
    // condition 3 the first 1 on each row must be the only non zero element in its column

    // check condition 1
    let foundZeroRow = false;
    for (let rIdx = 0; rIdx < this.augmented.length; rIdx++) {
      const row = this.augmented[rIdx];
      const isZeroRow = row.every((val) => val === 0);
      if (isZeroRow) {
        foundZeroRow = true;
        continue;
      }

      // found a non zero row after a zero row
      if (foundZeroRow) {
        return false;
      }
    }

    // check condition 2 and 3
    for (let rIdx = 0; rIdx < this.augmented.length; rIdx++) {
      const row = this.augmented[rIdx];
      const firstNonZeroIdx = row.findIndex((val) => val !== 0);
      if (firstNonZeroIdx === -1) {
        continue; // zero row
      }

      // condition 2
      if (row[firstNonZeroIdx] !== 1) {
        return false;
      }

      // condition 3
      for (
        let checkRowIdx = 0;
        checkRowIdx < this.augmented.length;
        checkRowIdx++
      ) {
        if (checkRowIdx === rIdx) {
          continue;
        }
        if (this.augmented[checkRowIdx][firstNonZeroIdx] !== 0) {
          return false;
        }
      }
    }

    return true;
  }

  isImpossible(): boolean {
    // an augmented matrix is impossible if there is a row with all zero coefficients
    // and a non zero right hand side
    for (let rIdx = 0; rIdx < this.augmented.length; rIdx++) {
      const coeffRow = this.augmented[rIdx].slice(
        0,
        this.augmented[rIdx].length - 1
      );

      const rightHandSideValue =
        this.augmented[rIdx][this.augmented[rIdx].length - 1];

      const isZeroCoeffRow = coeffRow.every((val) => val === 0);
      if (isZeroCoeffRow && rightHandSideValue !== 0) {
        return true;
      }
    }
    return false;
  }

  private round(value: number, tolerance: number = 1e-10): number {
    if (Math.abs(value) < tolerance) {
      return 0;
    }
    if (Math.abs(value - Math.round(value)) < tolerance) {
      return Math.round(value);
    }
    return value;
  }

  rref() {
    let startRow = 0;
    while (!this.isInRREF()) {
      if (this.isImpossible()) {
        console.log("The system is impossible to solve.");
        break;
      }
      const {
        row: rowIdxWithNonZero,
        col: colIdxWithNonZero,
        value: pivotValue,
      } = this.findPivotRow(startRow);
      // transfer the pivot row to the top
      this.swapRows(startRow, rowIdxWithNonZero);
      // convert non zero col elemnent to 1
      this.multiplyRow(startRow, 1 / pivotValue);

      // make all other elements in the pivot column zero
      for (let rIdx = 0; rIdx < this.augmented.length; rIdx++) {
        if (rIdx === startRow) {
          continue;
        }
        const factor = -this.augmented[rIdx][colIdxWithNonZero];
        if (factor === 0) {
          continue;
        }
        // multiply the pivot row by factor and add to the target row
        const pivotRowCopy = [...this.augmented[startRow]];
        this.multiplyRow(startRow, factor);
        this.addRows(startRow, rIdx);
        // restore the pivot row
        this.augmented[startRow] = pivotRowCopy;
      }
      startRow += 1;
    }
  }

  getAugmentedMatrix(): number[][] {
    return this.augmented;
  }

  setAugmentedMatrix(augmented: number[][]): void {
    this.augmented = augmented;
  }
}

export default RREF;
