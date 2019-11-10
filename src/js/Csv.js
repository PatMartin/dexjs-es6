/**
 * This class provides a Csv implementation with lots of capabilities.
 */
export class Csv {
  /**
   *
   * Construct a new Csv from the supplied specification.
   *
   * @param {Csv|{header:[], data:[][]}|header[],data[][]|headerAndData[][]|{}} spec - A highly
   * configurable specification for the Csv.
   *
   * @example
   *
   * // Construct an empty Csv
   * var csv = new dex.Csv()
   *
   * // Different ways to construct a csv with headers C1,C2 and with rows
   * // row1 = [ "R1C1", "R1C2" ]
   * // row2 = [ "R2C1", "R2C2" ]
   *
   * // From an object:
   * var csv = new dex.Csv(
   *   {header: ["C1","C2"], data: [["R1C1","R1C2"],["R2C1","R2C2"]]})
   *
   * // From header/data arrays:
   * var csv = new dex.Csv(["C1","C2"], [["R1C1","R1C2"],["R2C1","R2C2"]])
   *
   * // From a single array where the first row is the header:
   * var csv = new dex.Csv([["C1","C2"],["R1C1","R1C2"],["R2C1","R2C2"]])
   *
   * // From another csv:
   * var csv2 = new dex.Csv(csv)
   *
   */
  constructor(spec) {
    /**
     *
     * @type {string[]}
     */
    this.header = [];
    /**
     *
     * @type {*[][]}
     */
    this.data = [];

    if (arguments.length === 0) {
      // Will return an empty csv so do nothing.
    }
    // Instantiate either with an empty header or CSV ducktyped object.
    else if (arguments.length === 1) {
      if (Array.isArray(arguments[0])) {
        var args = Array.from(arguments);
        if (Array.isArray(args[0][0])) {
          // First row is header, then data
          if (Array.isArray(args[0][0])) {
            var i;
            for (i = 0; i < args[0][0].length; i++) {
              this.header.push(args[0][0][i]);
            }
            for (i = 1; i < args[0][i]; i++) {
              this.data.push(dex.array.clone(args[0][i]));
            }
          }
        }
        // Array of json/csv objects
        else if (typeof args[0][0] == "object") {
          this.header = Object.keys(args[0][0]);
          var i;
          for (i = 0; i < args[0].length; i++) {
            var row = [];
            this.header.forEach(function (hdr) {
              row.push(args[0][i][hdr]);
            });
            this.data.push(row);
          }
        }
        else {
          this.header = dex.array.copy(arguments[0]);
        }
      }
      // Else we have another CSV?
      else {
        this.header = dex.array.copy(arguments[0].header);
        this.data = dex.matrix.copy(arguments[0].data);
      }
    }
    else if (arguments.length == 2) {
      this.header = dex.array.copy(arguments[0]);
      this.data = dex.matrix.copy(arguments[1]);
    }
    else {
      dex.log("UNKNOWN INSTANTIATOR LENGTH: ", arguments.length);
    }
  }

  /**
   *
   * Determine if this Csv is equivalent to the supplied csv.
   *
   * @param {Csv|Object} csv - The csv to compare to.  As long as the
   * supplied object has a header array attribute and a data array of
   * arrays attribute, it can satisfy the equivalency test.
   *
   * @returns {boolean} True if equivalent, false otherwise.
   *
   */
  equals(csv) {
    if (csv === undefined || csv.header === undefined || csv.data === undefined) {
      return false;
    }
    else if (csv.data.length !== this.data.length ||
      csv.header.length !== this.header.length) {
      return false;
    }
    else {
      if (this.header.every(function (h, hi) {
        return csv.header[hi] === h;
      }) === false) {
        return false;
      }
      if (this.data.every(function (row, ri) {
        return row.every(function (col, ci) {
          //dex.log("Compare: " + col + " vs " + csv.data[ri][ci]);
          return csv.data[ri][ci] === col;
        })
      }) === false) {
        return false;
      }
    }

    return true;
  };

  /**
   *
   * Return a subset of this Csv consisting of at most $limit rows.
   *
   * @param {number} limit - The maximum number of rows in the resulting
   * Csv.
   *
   */
  limitRows(limit) {
    var self = this;
    var newCsv = {header: dex.array.copy(self.header), data: []};

    var i = 0;
    for (i = 0; i < self.data.length && i < limit; i++) {
      newCsv.data.push(dex.array.copy(self.data[i]));
    }

    return new csv(newCsv);
  };

  /**
   *
   * Returns the requested column index if it exists, otherwise
   * the default value is returned.
   *
   * @param {number} colIndex
   * @param {*} defaultValue - The default value.  Could be anything, but
   * presumably it is a number.
   *
   * @returns {number|*} Either returns the columnIndex or the defaultValue.
   *
   */
  getColumnNumber(colIndex, defaultValue) {
    var csv = this;
    if (colIndex === undefined) {
      return defaultValue;
    }

    var colNum = csv.header.indexOf(colIndex);

    if (colNum >= 0) {
      return colNum;
    }

    if (colIndex >= 0 && colIndex < csv.header.length) {
      return colIndex;
    }

    return undefined;
  };

  /**
   *  Return the name of the column as the supplied index.
   *
   *  If a string is supplied, return the string if it is the name
   *  of a header.  If an integer is supplied, return the name of
   *  the header if that header exists.  This allows us to enable
   *  users to index columns via header name or by index.
   *
   * @param {number|string} colIndex - The name of the column header or its index.
   *
   * @return {string|null} The column name, or null if not found.
   *
   */
  columnName(colIndex) {
    var csv = this;
    if (colIndex === undefined) {
      return null;
    }

    var colNum = csv.getColumnNumber(colIndex);

    if (colNum >= 0) {
      return csv.header[colNum];
    }

    return null;
  };

  /**
   *
   * Retrieve the column referred to by the column index.  The
   * column index can be a header name or a value column number.
   *
   * @param {number|string} colIndex The integer index or column name
   * of the column we wish to retrieve.
   *
   * @return {*[]} An array with the specified column contents.
   *
   */
  column(colIndex) {
    var i = this.getColumnNumber(colIndex);

    return this.data.map(function (row) {
      return row[i];
    });
  };

  /**
   *
   * Make a deep copy of this csv.
   *
   * @return {Csv} A copy of this csv.
   *
   */
  copy() {
    return new dex.Csv(this);
  };

  /**
   * Return a Csv consisting of only the specified columns.
   *
   * @param columns A list of column indices, names of a mixture
   * thereof.
   *
   * @returns {Csv} Returns a Csv consisting only of the specified
   * columns.
   *
   */
  include(columns) {
    var self = this;
    var slice = {};
    var columnNumbers = columns.map(function (column) {
      return self.getColumnNumber(column);
    });

    slice.header = dex.array.slice(self.header, columnNumbers);
    slice.data = dex.matrix.slice(self.data, columnNumbers);

    return new dex.Csv(slice.header, slice.data);
  };

  /**
   * Return a Csv consisting of only the columns which are not
   * excluded by "columns".
   *
   * @param {number[]|string[]} columns - A list of column indices, names
   * of a mixture thereof.  These columns will be excluded from
   * the resulting Csv.
   *
   * @returns {Csv} Returns a Csv consisting only of the columns which
   * were not excluded.
   *
   */
  exclude(columns) {
    var self = this;
    var slice = {};
    var columnNumbers = columns.map(function (column) {
      return self.getColumnNumber(column);
    });
    var complement = dex.range(0, self.header.length).filter(function (elt) {
      return !(columnNumbers.includes(elt));
    });

    slice.header = dex.array.slice(self.header, complement);
    slice.data = dex.matrix.slice(self.data, complement);

    return new dex.Csv(slice.header, slice.data);
  };

  /**
   *
   * Return a list of unique elements contained within the
   * specified columns.
   *
   * @param colIndex
   * @returns {*[]} An array of unique values contained in colIndex.
   */
  unique(colIndex) {
    return _.uniq(this.column(colIndex))
  }

  /**
   *  Given a column index, return the name of the column.
   *  If a string is supplied, return the string if it is the name
   *  of a header.  If an integer is supplied, return the name of
   *  the header if that header exists.  This allows us to enable
   *  users to index columns via header name or by index.
   *
   * @param colIndex The name of the column header or its index.
   *
   * @returns {string} The column name or null if not found.
   *
   */
  getColumnName(colIndex) {
    var csv = this;
    if (colIndex === undefined) {
      return null;
    }

    var colNum = csv.getColumnNumber(colIndex);

    if (colNum >= 0) {
      return csv.header[colNum];
    }

    return null;
  };

  /**
   *
   * Return a list of column names containing only numeric values.
   *
   * @returns {string[]} A list of column names which contain
   * only numeric values.
   *
   */
  getNumericColumnNames() {
    var csv = this;
    var possibleNumeric =
      {};
    var i, j, ri, ci;
    var numericColumns = [];

    for (i = 0; i < csv.header.length; i++) {
      possibleNumeric[csv.header[i]] = true;
    }

    // Iterate thru the data, skip the header.
    for (ri = 0; ri < csv.data.length; ri++) {
      for (ci = 0; ci < csv.data[ri].length && ci < csv.header.length; ci++) {
        if (possibleNumeric[csv.header[ci]] && !dex.object.isNumeric(csv.data[ri][ci])) {
          possibleNumeric[csv.header[ci]] = false;
        }
      }
    }

    for (ci = 0; ci < csv.header.length; ci++) {
      if (possibleNumeric[csv.header[ci]]) {
        numericColumns.push(csv.header[ci]);
      }
    }

    return numericColumns;
  };

  /**
   * Return whether or not this Csv object is valid or not. Tests to
   * ensure that csv is defined with data and a header.
   *
   * @return {boolean} True if valid, false otherwise.
   *
   */
  invalid() {
    var csv = this;
    return csv === undefined || csv.data === undefined || csv.header === undefined;
  };

  /**
   *
   * Attempt to guess the types of each column.  Return an array containing
   * either date | number | string
   *
   * @returns {string[]}  A list of column types representing our best
   * guess at what they contain.
   *
   */
  guessTypes() {
    var csv = this;
    var types = [];

    if (this.invalid(csv)) {
      return types;
    }

    csv.header.forEach(function (hdr, hi) {

      if (csv.data.every(function (row) {
        // This is miscategorizing stuff like: CATEGORY-1 as a date
        // return (row[hi] instanceof Date);
        // So lets be pickier:
        //dex.log("COULD BE A DATE: '" + row[hi] + "' = " + dex.object.couldBeADate(row[hi]));
        return dex.object.couldBeADate(row[hi]);
      })) {
        types.push("date");
      }
      else if (csv.data.every(function (row) {
        return !isNaN(row[hi]);
      })) {
        types.push("number");
      }
      // Not a number, so lets try dates.
      else if (csv.data.every(function (row) {
        return dex.object.couldBeADate(row[hi]);
      })) {
        types.push("date");
      }
      // Congratulations, you have a string!!
      else {
        types.push("string");
      }
    });

    return types;
  };

  /**
   * Return an array of valid column numbers minus exclusions.
   *
   * @param {string[]|number[]} exclusions - An array of column names
   * or indexes to be excluded from our column number list.
   *
   * @returns {number[]} A list of non excluded column numbers.
   *
   */
  getColumnNumbers(exclusions) {
    var csv = this;
    var exclude = (exclusions || []).map(function (e) {
      // Allows us to support columnName exclusions as well as
      // index exclusions.
      return csv.getColumnNumber(e);
    });
    var columnNumbers = dex.range(0, csv.header.length);
    return columnNumbers.filter(function (el) {
      return exclude.indexOf(el) < 0;
    });
  };

  /**
   *
   * Select all rows meet the criteria imposed by our matcher
   * function.
   *
   * @param {}Function(row: *[])} matchFn - A function which receives
   * an array argument representing the row in the CSV.  The function
   * returns true if the row is to be selected.  False otherwise.
   *
   * @returns {Csv} A csv containing only rows which match the selection
   * criteria imposed by the matchFn
   *
   */
  selectRows(matchFn) {
    var subset = [];
    this.data.forEach(function (row) {
      if (matchFn(row)) {
        subset.push(dex.array.copy(row));
      }
    });

    return new dex.Csv(this.header, subset);
  };

  /**
   * Return the extent of the csv data.
   *
   * @param {number|number[]|string|string[]} [columns] - An optional
   * argument specifying one or more columns to be included in the
   * extent search.  If not supplied, the entire csv.data is considered.
   * Otherwise, only the specified columns are considered.
   *
   */
  extent(columns) {
    var csv = this;
    // Columns is not supplied, consider the entire data
    if (typeof columns === "undefined") {
      return dex.matrix.extent(this.data);
    }
    // Columns is a single numeric index, pass it on
    else if (dex.object.isNumeric(columns)) {
      return dex.matrix.extent(this.data, columns);
    }
    // Columns is a single column name, convert to numeric and pass it on.
    else if (typeof columns === "string") {
      return dex.matrix.extent(this.data, csv.getColumnNumber(columns));
    }
    // Presumably an array:
    else {
      // Convert array elements into column numbers so we can
      // support lists of column names.
      var colNums = columns.map(function (c) {
        return csv.getColumnNumber(c)
      });
      // If the array is not empty, call as normal.
      if (colNums.length > 0) {
        return dex.matrix.extent(this.data, colNums);
      }
      // Empty array, omit the columns and consider the entire csv data.
      else {
        return dex.matrix.extent(this.data);
      }
    }
  };

  /**
   *
   * Return an array of column numbers for columns which appear
   * to contain numeric data.
   *
   * @returns {number[]} An array of column indexes for columns
   * containing numeric data.
   *
   */
  getNumericIndices() {
    var csv = this;
    var possibleNumeric = {};
    var i, j;
    var numericIndices = [];

    for (i = 0; i < csv.header.length; i++) {
      possibleNumeric[csv.header[i]] = true;
    }

    // Iterate thru the data, skip the header.
    for (i = 1; i < csv.data.length; i++) {
      for (j = 0; j < csv.data[i].length && j < csv.header.length; j++) {
        if (possibleNumeric[csv.header[j]] && !dex.object.isNumeric(csv.data[i][j])) {
          //console.log("csv.header[" + j + "]=" + csv.header[j] + " is not numeric due to csv.data[" + i + "]["
          //  + j + "]=" + csv.data[i][j]);
          possibleNumeric[csv.header[j]] = false;
        }
      }
    }

    for (i = 0; i < csv.header.length; i++) {
      if (possibleNumeric[csv.header[i]]) {
        numericIndices.push(i);
      }
    }

    return numericIndices;
  };

  /**
   *
   * Return an array of column numbers for columns which appear
   * to contain categorical data.
   *
   * @returns {number[]} An array of column indexes for columns
   * containing categorical data.
   *
   */
  getCategoricalIndices() {
    var csv = this;
    var possibleNumeric = {};
    var i, j;
    var categoricalIndices = [];

    for (i = 0; i < csv.header.length; i++) {
      possibleNumeric[csv.header[i]] = true;
    }

    // Iterate thru the data, skip the header.
    for (i = 1; i < csv.data.length; i++) {
      for (j = 0; j < csv.data[i].length && j < csv.header.length; j++) {
        if (possibleNumeric[csv.header[j]] && !dex.object.isNumeric(csv.data[i][j])) {
          //console.log("csv.header[" + j + "]=" + csv.header[j] + " is not numeric due to csv.data[" + i + "]["
          //  + j + "]=" + csv.data[i][j]);
          possibleNumeric[csv.header[j]] = false;
        }
      }
    }

    for (i = 0; i < csv.header.length; i++) {
      if (!possibleNumeric[csv.header[i]]) {
        categoricalIndices.push(i);
      }
    }

    return categoricalIndices;
  };

  /**
   *
   * Test if a column is numeric or not.
   *
   * @param {string|number} columnIndex - The column index specified as by header or by
   * a numeric column index.
   *
   * @returns {boolean} True if numeric, false otherwise.
   *
   */
  isColumnNumeric(columnIndex) {
    var csv = this;
    var i;
    var colNum = csv.getColumnNumber(columnIndex);

    for (i = 0; i < csv.data.length; i++) {
      if (!dex.object.isNumeric(csv.data[i][colNum])) {
        return false;
      }
    }
    return true;
  };

  /**
   *
   * Return a structure based on regrouping the csv by the specified
   * columns.
   *
   * TODO: Figure out exactly what this does.  I should have documented
   * TODO: it better back when I wrote it years ago.
   *
   * @param columns - The columns to group by.
   *
   * @returns {this|Csv}
   */
  group(columns) {
    var csv = this;
    var ri, ci;
    var groups = {};
    var returnGroups = [];
    var values;
    var key;
    var otherColumns;
    var otherHeaders;
    var groupName;
    var group;

    if (arguments < 1) {
      return csv;
    }

    function compare(a, b) {
      var si, h;

      for (si = 0; si < columns.length; si++) {
        h = csv.header[columns[si]]
        if (a[h] < b[h]) {
          return -1;
        }
        else if (a[h] > b[h]) {
          return 1
        }
      }

      return 0;
    }

    //otherColumns = dex.array.difference(dex.range(0, csv.header.length), columns);
    //otherHeaders = dex.array.slice(csv.header, otherColumns);

    for (ri = 0; ri < csv.data.length; ri += 1) {
      values = dex.array.slice(csv.data[ri], columns);
      key = values.join(':::');

      if (groups[key]) {
        group = groups[key];
      }
      else {
        group = {
          'key': key,
          'values': [],
          'csv': new dex.Csv(csv.header, [])
        };
        for (ci = 0; ci < values.length; ci++) {
          group.values.push({'name': csv.header[columns[ci]], 'value': values[ci]});
        }
        groups[key] = group;
      }
      //group.csv.data.push(dex.array.slice(csv.data[ri], otherColumns));
      group.csv.data.push(csv.data[ri]);
      //groups[key] = group;
    }

    for (groupName in groups) {
      if (groups.hasOwnProperty(groupName)) {
        returnGroups.push(groups[groupName]);
      }
    }

    return returnGroups.sort(compare);
  };

  /**
   *
   * Create a new csv from this one which contains only numeric data.
   *
   * @returns {Csv} A numeric subset.
   *
   */
  numericSubset() {
    return this.include(this.getNumericIndices(csv));
  };

  /**
   *
   * Create a new csv from this one which contains only categorical data.
   *
   * @returns {Csv} A categorical subset.
   *
   */
  categoricalSubset() {
    return this.include(this, this.getCategoricalIndices());
  };
}