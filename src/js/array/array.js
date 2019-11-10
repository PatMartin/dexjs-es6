/**
 *
 * Returns all possible combinations of length comboLength
 * from the given array.
 *
 * @param {*[]} arr - The array to be used to generate combinations.
 * @param {number} comboLength - The length of the combinations to
 * be generated.
 * @returns {*[*[]]} An array containing combination arrays.
 *
 * @example:
 *
 * // returns: [[1,2], [1,3], [1,4], [2,3], [2,4], [3,4]]
 * dex.array.getCombinations([1, 1,2,3,4], 2)
 *
 */
export function combinations(arr, comboLength) {
  var i, j, combs, head, tailcombs;

  var uniqueArray = dex.array.unique(arr)

  // There is no way to take e.g. sets of 5 elements from
  // a set of 4.
  if (comboLength > uniqueArray.length || comboLength <= 0) {
    return [];
  }

  // K-sized set has only one K-sized subset.
  if (comboLength == uniqueArray.length) {
    return [uniqueArray];
  }

  // There is N 1-sized subsets in a N-sized set.
  if (comboLength == 1) {
    combs = [];
    for (i = 0; i < uniqueArray.length; i++) {
      combs.push([uniqueArray[i]]);
    }
    return combs;
  }

  // Assert {1 < k < set.length}

  // Algorithm description:
  // To get k-combinations of a set, we want to join each element
  // with all (k-1)-combinations of the other elements. The set of
  // these k-sized sets would be the desired result. However, as we
  // represent sets with lists, we need to take duplicates into
  // account. To avoid producing duplicates and also unnecessary
  // computing, we use the following approach: each element i
  // divides the list into three: the preceding elements, the
  // current element i, and the subsequent elements. For the first
  // element, the list of preceding elements is empty. For element i,
  // we compute the (k-1)-computations of the subsequent elements,
  // join each with the element i, and store the joined to the set of
  // computed k-combinations. We do not need to take the preceding
  // elements into account, because they have already been the i:th
  // element so they are already computed and stored. When the length
  // of the subsequent list drops below (k-1), we cannot find any
  // (k-1)-combs, hence the upper limit for the iteration:
  combs = [];
  for (i = 0; i < uniqueArray.length - comboLength + 1; i++) {
    // head is a list that includes only our current element.
    head = uniqueArray.slice(i, i + 1);
    // We take smaller combinations from the subsequent elements
    tailcombs = dex.arrayCombinations(uniqueArray.slice(i + 1), comboLength - 1);
    // For each (k-1)-combination we join it with the current
    // and store it to the set of k-combinations.
    for (j = 0; j < tailcombs.length; j++) {
      combs.push(head.concat(tailcombs[j]));
    }
  }
  return combs;
};

/**
 *
 * Create a deep copy of array arr.
 *
 * @param {any[]} arr - The array to copy.
 * @return A deep copy of array arr.
 *
 * @example
 *
 * var array1 = [ "A", "B", "C" ];
 * var array2 = dex.arrayCopy(array1);
 *
 */
export function copy(arr) {
  return $.extend(true, [], arr);
}

/**
 *
 * Return the extent of the array.  This means an array consisting
 * of [ minimum, maximum ] values encountered in array arr.
 *
 * @param {number[]|string[]} arr - The array whose extent we are trying
 * to determine.
 *
 * @returns {number[min, max]|string[min, max]} - Returns an array containing [ min, max ].
 *
 */
export function extent(arr) {
  var min = arr[0];
  var max = arr[0];

  arr.forEach(function (val) {
    if (min > val) {
      min = val;
    }
    if (max < val) {
      max = val;
    }
  });

  return [min, max];
}

/**
 *
 * Guess the common datatype contained within the array.
 *
 * @param {string[]|date[]|number[]} array - An array of something whose
 * type we need to determine.
 *
 * @returns {string} - Returns the type classified as one of
 * number, date or string.
 *
 */
export function guessType(array) {
  if (array.every(function (elt) {
    return dex.object.isNumeric(elt)
  })) {
    return "number";
  }

  // Not a number, so lets try dates.
  if (array.every(function (elt) {
    return dex.object.couldBeADate(elt);
  })) {
    return "date";
  }
  // Congratulations, you have a string!!
  return "string";
}

/**
 * Returns whether or not two arrays contain the same set of
 * elements regardless of order.
 *
 * @param {*[]} a - The first array to be compared.
 * @param {*[]} b - The second array to be compared.
 *
 * @returns {boolean} True if equivalent, false otherwise.
 */
export function equal(a, b) {
  if (a == null || b == null) return false;
  if (a === b) return true;
  if (a.length != b.length) return false;

  var sa = dex.array.copy(a).sort();
  var sb = dex.array.copy(b).sort();

  for (var i = 0; i < sa.length; ++i) {
    if (sa[i] !== sb[i]) return false;
  }
  return true;
}

/**
 *
 * Return the specified slice of an array without modifying the original array.
 *
 * @param {any[]} array - The array to slice.
 * @param {number[]|number} rowRange - If supplied an array, return the elements in
 * the columns defined by the rowRange.  If rowRange is a number, return the
 * array starting at the given index.
 * @param {number} maxElt - If supplied, return at most, this number of elements
 * in the resulant array.
 *
 * @returns {any[]} The specified array slice.
 *
 * @example
 * var myArray = [ 1, 2, 3, 4, 5 ];
 *
 * // Returns: [ 3, 4, 5]
 * slice(myArray, 2);
 *
 * // Returns: [ 1, 3, 5 ]
 * slice(myArray, [0, 2, 4]);
 *
 * // returns a copy of the array:
 * slice(myArray);
 *
 */
export function slice(array, rowRange, maxElt) {
  var arraySlice = [];
  var range;
  var i;

  var arrayCopy = dex.array.copy(array);

  // Numeric.
  // Array.
  // Object.  Numeric with start and end.
  if (arguments.length === 2) {
    if (Array.isArray(rowRange)) {
      range = rowRange;
    }
    else {
      range = dex.range(rowRange, arrayCopy.length - rowRange);
    }
  }
  else if (arguments.length < 2) {
    return arrayCopy;
  }
  else {
    if (Array.isArray(rowRange)) {
      range = rowRange;
    }
    else {
      range = dex.range(rowRange, maxElt);
    }
  }

  for (i = 0; i < range.length && (!maxElt || i < maxElt); i++) {
    arraySlice.push(arrayCopy[range[i]]);
  }
  //dex.console.log("AFTER: array.slice(range=" + range + "): arraySlice=" + arraySlice);
  return arraySlice;
};


/**
 *
 * Returns elements of an array where the supplied condition is matched.
 *
 * @param {*[]} array - The array to evaluate.
 * @param {function} condition - A conditional function that when true, indicates
 * that the index of this element should be returned.
 * @returns {number[]} An array consisting of the indexes of the elements
 * which match the supplied condition.
 *
 * @example
 *
 * // returns [ 0, 1, 2, 3]
 * dex.array.findIndexes([1,2,3,4,5],function(e){return e<5;}));
 * // returns [3, 5]
 * dex.array.findIndexes(["a", "b", "c", "d", "e", "d"],
 *   function(e) {return e=="d";}
 *
 */
export function findIndexes(array, condition) {
  var indices = [];
  if (array !== undefined && Array.isArray(array)) {
    array.forEach(function (elt, index) {
      if (condition(elt) == true) {
        indices.push(index);
      }
    });
  }
  return indices;
};
