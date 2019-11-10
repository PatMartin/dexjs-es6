/**
 *
 * Combine each column in matrix1 with each column in matrix2.
 *
 * @param {matrix} matrix1 The first matrix to combine.
 * @param {matrix} matrix2 The second matrix to combine.
 *
 * @returns {matrix} The combined matrix.
 *
 * @example
 * var matrix1 = [['m1r1c1', 'm1r1c2'], ['m1r2c1', 'm1r2c2']]
 * var matrix2 = [['m2r1c1', 'm2r1c2'], ['m2r2c1', 'm2r2c2']]
 *
 * // Returns: [['m1r1c1', 'm1r1c2', 'm2r1c1', 'm2r1c2'], ['m1r2c1', 'm1r2c2', 'm2r2c1', 'm2r2c2']]
 * var result = combine(matrix1, matrix2);
 *
 */
export function combine(matrix1, matrix2) {
  var result = dex.matrixCopy(matrix1);

  var ri;

  for (ri = 0; ri < matrix2.length; ri++) {
    result[ri] = result[ri].concat(matrix2[ri]);
  }

  return result;
};

/**
 *
 * Given a matrix, or array of arrays, return a deep copy of it.
 *
 * @param {any[any[]]} matrix - The matrix to copy.
 *
 * @returns {any[any[]]} - A deep copy of the matrix.
 *
 * @example
 *
 * var matrix1 = [[1, 2, 3], [4, 5, 6]];
 * var matrix2 = dex.matrix.copy(matrix1);
 *
 */
export function copy(matrix) {
  var matrixCopy = [];

  matrix.forEach(function (row) {
    matrixCopy.push(dex.array.copy(row));
  });

  return matrixCopy;
};

/**
 *
 * Returns an array of the minimum and maximum value in the form of: [min,max]
 * from the specified subset of the matrix.
 *
 * @param {matrix} matrix - The matrix to scan.
 * @param {number[]|number]} [indices] - When supplied, will contrain the extent
 * search to just those columns specified by this list of indices.
 *
 * @returns {number[2]>} An array of two elements: [ min, max ]
 *
 */
export function extent(matrix, indices) {
  var values = matrix;

  if (arguments.length === 2) {
    if (dex.object.isNumeric(indices)) {
      values = dex.matrix.flatten(dex.matrix.slice(matrix, [indices]));
    }
    else {
      values = dex.matrix.flatten(dex.matrix.slice(matrix, indices));
    }
  }
  else {
    values = dex.matrix.flatten(matrix);
  }

  return dex.array.extent(values);
};

/**
 *
 * Return a flattened version of the matrix.
 *
 * @param {matrix} matrix - The matrix to flatten.
 *
 * @returns {Array.<Object>} A flattened version of the matrix.
 *
 * @example
 * // Define a simple matrix.
 * var matrix = [['r1c1', 'r1c2'], ['r2c1', 'r2c2']]
 *
 * // Returns: ['r1c1', 'r1c2', 'r2c1', 'r2c2']
 * flatten(matrix);
 *
 */
export function flatten(matrix) {
  return [].concat.apply([], matrix);
};

/**
 *
 * Return the specified slice of the matrix.  The original matrix is
 * not altered.
 *
 * @param {any[any[]]} matrix The matrix to be sliced.
 * @param {number[]|string[]} columns - An array of column indices to include within the slice.
 * @param {number} [rows] If supplied, the slice will consist only of the specified
 * number of rows.
 *
 * @returns {any[any[]]} - The sliced matrix.
 *
 */
export function slice(matrix, columns, rows) {
  var matrixSlice = new Array(0);
  //dex.log("PRE-SLICE (matrixSlize):" + matrixSlice);
  var ri;

  if (arguments.length === 3) {
    for (ri = 0; ri < rows.length; ri++) {
      matrixSlice.push(dex.array.slice(matrix[rows[ri]]));
    }
  }
  else {
    for (ri = 0; ri < matrix.length; ri++) {
      //dex.log("MATRIX-SLICE-BEFORE[" + ri + "]:" + matrixSlice);
      matrixSlice.push(dex.array.slice(matrix[ri], columns));
      //dex.log("MATRIX-SLICE-AFTER[" + ri + "]" + matrixSlice);
    }
  }
  return matrixSlice;
};

/**
 *
 * Returns a matrix consisting of unique values relative to each
 * column.
 *
 * @param {matrix} matrix The matrix to evaluate.
 * @param columns The column or array of columns indexes to slice.
 *
 * @returns {Array.<Array.<Object>>} The unique values relative to each column. In the form
 * of [[ column 1 unique values], [column 2 unique values], ...]]
 *
 * @memberof dex/matrix
 *
 */
export function uniques(matrix, columns) {

  if (arguments.length === 2) {
    if (dex.object.isNumeric(columns)) {
      return dex.matrix.uniques(dex.matrix.slice(matrix, [columns]))[0];
    }
    else {
      return dex.matrix.uniques(dex.matrix.slice(matrix, columns));
    }
  }

  var ci;
  var uniques = [];
  var tmatrix = dex.matrix.transpose(matrix);
  var ncol = tmatrix.length;

  for (ci = 0; ci < ncol; ci += 1) {
    uniques.push(_.uniq(tmatrix[ci]));
  }
  return uniques;
};

/**
 *
 * Returns a transposed matrix where the rows of the new matrix are transposed
 * with it's columns.
 *
 * @param {matrix} matrix - The matrix to transpose.
 *
 * @returns {matrix} The transposed matrix, leaving the original matrix untouched.
 *
 * @example {@lang javascript}
 * // Returns [['R1C1', 'R2C1', 'R3C1'], ['R1C2', 'R2C2', 'R3C2' ]]
 * transpose([['R1C1', 'R1C2'], ['R2C1', 'R2C2], ['R3C1', 'R3C2']]);
 *
 */
export function transpose(matrix) {
  var ci;
  var ncols;
  var transposedMatrix = [];
  //dex.log("Transposing:", matrix);

  if (!matrix || matrix.length <= 0 || !matrix[0] || matrix[0].length <= 0) {
    return [];
  }

  ncols = matrix[0].length;

  for (ci = 0; ci < ncols; ci++) {
    transposedMatrix.push(matrix.map(function (row) {
      return row[ci];
    }));
  }

  return transposedMatrix;
};

/**
 *
 * Insert a new column at position 0 within this matrix which will contain
 * integer values starting at 1, 2, 3, ...  This is useful if your dataset
 * lacks an existing unique index.
 *
 * @param {matrix} matrix - The matrix to index.
 * @returns {matrix} A copy of the original matrix with the index inserted.
 *
 */
export function addIndex(matrix) {
  var indexMatrix = dex.matrix.copy(matrix);

  for (var ri = 0; ri < matrix.length; ri++) {
    indexMatrix[ri].unshift(ri + 1);
  }

  return indexMatrix;
};

/**
 *
 * Determine whether the supplied columnNum within the supplied matrix is
 * numeric or not.
 *
 * @param {matrix} matrix - The matrix to evaluate.
 * @param {number} columnNum - The column within the matrix to evaluate.
 *
 * @returns {boolean} True if the column is numeric, false otherwise.
 *
 */
export function isColumnNumeric(matrix, columnNum) {
  for (var i = 0; i < matrix.length; i++) {
    if (!_.isNumber(matrix[i][columnNum])) {
      return false;
    }
  }
  return true;
};

/**
 *
 * Return the maximum value of the specified columnNum within the
 * supplied matrix.
 *
 * @param matrix The matrix to evaluate.
 * @param columnNum The column number within the matrix to evaluate.
 * @returns {*} The maximum value of the specified column within the
 * supplied matrix.
 *
 */
export function max(matrix, columnNum) {
  var maxValue = matrix[0][columnNum];
  var i;

  if (dex.matrix.isColumnNumeric(matrix, columnNum)) {
    maxValue = parseFloat(matrix[0][columnNum]);
    for (i = 1; i < matrix.length; i++) {
      if (maxValue < parseFloat(matrix[i][columnNum])) {
        maxValue = parseFloat(matrix[i][columnNum]);
      }
    }
  }
  else {
    for (i = 1; i < matrix.length; i++) {
      if (maxValue < matrix[i][columnNum]) {
        maxValue = matrix[i][columnNum];
      }
    }
  }

  return maxValue;
};

/**
 *
 * Return the minimum value of the specified columnNum within the
 * supplied matrix.
 *
 * @param {matrix} matrix - The matrix to evaluate.
 * @param {number} columnNum - The column number within the matrix to evaluate.
 * @returns {number} The minimum value of the specified column within the
 * supplied matrix.
 *
 */
export function min(matrix, columnNum) {
  var minValue = matrix[0][columnNum];
  var i;

  if (dex.matrix.isColumnNumeric(matrix, columnNum)) {
    minValue = parseFloat(matrix[0][columnNum]);
    for (i = 1; i < matrix.length; i++) {
      if (minValue > parseFloat(matrix[i][columnNum])) {
        minValue = parseFloat(matrix[i][columnNum]);
      }
    }
  }
  else {
    for (i = 1; i < matrix.length; i++) {
      if (minValue > matrix[i][columnNum]) {
        minValue = matrix[i][columnNum];
      }
    }
  }

  return minValue;
};