/**
 * Creates a matrix of random numbers within the specified range.
 *
 * @param {Object} spec - The matrix specification object.
 * @param {number} spec.rows - The number of rows of data to generate.
 * @param {number} spec.columns - The number of columns of data to generate.
 * @param {number} spec.min - The minimum value of the data.
 * @param {number} spec.max - The maximum value of the data.
 *
 * @returns {number[][]} A matrix containing the randomly generated data.  Each value
 * will fall between the specified min and max values.
 *
 */
export function randomMatrix(spec) {
  var ri, ci;

  //{rows:10, columns: 4, min, 0, max:100})
  var matrix = [];
  var range = spec.max - spec.min;
  for (ri = 0; ri < spec.rows; ri++) {
    var row = [];

    for (ci = 0; ci < spec.columns; ci++) {
      row.push(Math.random() * range + spec.min);
    }
    matrix.push(row);
  }
  return matrix;
};

/**
 * Creates a matrix of random numbers within the specified range.
 *
 * @param {Object} spec - The matrix specification object.
 * @param {number} spec.rows - The number of rows of data to generate.
 * @param {number} spec.columns - The number of columns of data to generate.
 * @param {number} spec.min - The minimum value of the data.
 * @param {number} spec.max - The maximum value of the data.
 *
 * @returns {number[][]} A matrix containing the randomly generated data.  Each value
 * will fall between the specified min and max values.  The first column will
 * contain a series of indexes representing row number.
 *
 */
export function randomIndexedMatrix(spec) {
  var ri, ci;

  //{rows:10, columns: 4, min, 0, max:100})
  var matrix = [];
  var range = spec.max - spec.min;
  for (ri = 0; ri < spec.rows; ri++) {
    var row = [];

    row.push(ri + 1);
    for (ci = 0; ci < spec.columns - 1; ci++) {
      row.push(Math.random() * range + spec.min);
    }
    matrix.push(row);
  }
  return matrix;
};

/**
 * Creates a matrix of random integers within the specified range.
 *
 * @param {Object} spec - The matrix specification object.
 * @param {number} spec.rows - The number of rows of data to generate.
 * @param {number} spec.columns - The number of columns of data to generate.
 * @param {number} spec.min - The minimum value of the data.
 * @param {number} spec.max - The maximum value of the data.
 *
 * @returns {number[][]} A matrix containing the randomly generated data.  Each value
 * will fall between the specified min and max values.  The first column will
 * contain a series of indexes representing row number.
 *
 */
export function randomIndexedIntegerMatrix(spec) {
  var ri, ci;

  //{rows:10, columns: 4, min, 0, max:100})
  var matrix = [];
  var range = spec.max - spec.min;
  for (ri = 0; ri < spec.rows; ri++) {
    var row = [];

    row.push(ri + 1);
    for (ci = 0; ci < spec.columns - 1; ci++) {
      row.push(Math.round(Math.random() * range + spec.min));
    }
    matrix.push(row);
  }
  return matrix;
};

/**
 * Creates a matrix of random integers within the specified range.
 *
 * @param {Object} spec - The matrix specification object.
 * @param {number} spec.rows - The number of rows of data to generate.
 * @param {number} spec.columns - The number of columns of data to generate.
 * @param {number} spec.min - The minimum value of the data.
 * @param {number} spec.max - The maximum value of the data.
 *
 * @returns {number[][]} A matrix containing the randomly generated data.  Each value
 * will fall between the specified min and max values.
 *
 */
export function randomIntegerMatrix(spec) {
  var ri, ci;

  //{rows:10, columns: 4, min, 0, max:100})
  var matrix = [];
  var range = spec.max - spec.min;
  for (ri = 0; ri < spec.rows; ri++) {
    var row = [];

    for (ci = 0; ci < spec.columns; ci++) {
      row.push(Math.round(Math.random() * range + spec.min));
    }
    matrix.push(row);
  }
  return matrix;
};

/**
 * Creates a csv of random integers within the specified range.
 *
 * @param spec The csv specification.
 * @param {number} spec.rows - The number of rows of data to be generated.
 * @param {number} spec.columns - The number of columns of data to be generated.
 *
 * @return {Object} A csv object which contains an identity header
 * and rows full of identity data.  Which means, the first column
 * header will be named "C1", the second will be named "C2" and so on.
 * The first column of the first row will be R1C1, The second column of
 * the first row will be R1C2, and so on.  This construct is very useful
 * when debugging various CSV transformations.
 *
 */
export function identityCsv(spec) {
  var ri, ci;
  var csv = {};
  csv.header = dex.datagen.identityHeader(spec);
  csv.data = dex.datagen.identityMatrix(spec);
  return csv;
};

/**
 * This method will return an identity function meeting the supplied
 * specification.
 *
 * @param {object} spec - The identityMatrix specification.
 * @param {number} spec.rows - The number of rows to generate.
 * @param {number} spec.columns - The number of columns to generate.
 *
 * @example
 * // Returns: [['R1C1', 'R1C2' ], ['R2C1', 'R2C2'], ['R3C1', 'R3C2']]
 * identityMatrix({rows: 3, columns: 2});
 *
 * @returns {string[][]} The identity matrix.
 *
 */
export function identityMatrix(spec) {
  var ri, ci;

  // { rows:10, columns:4 })
  var matrix = [];
  for (ri = 0; ri < spec.rows; ri++) {
    var row = [];

    for (ci = 0; ci < spec.columns; ci++) {
      row.push("R" + (ri + 1) + "C" + (ci + 1));
    }
    matrix.push(row);
  }
  return matrix;
};

/**
 * Returns an identity header array.
 *
 * @param spec - The specification for the header array.
 * @param spec.columns - The number of columns to generate.
 *
 * @example
 * // Returns: [ 'C1', 'C2', 'C3' ]
 * identityHeader({ columns: 3 });
 *
 * @return {string[]} Returns an array of the specified columns
 * header names; C1, C2, ...
 *
 */
export function identityHeader(spec) {
  return dex.range(1, spec.columns).map(function (i) {
    return "C" + i;
  });
};

/**
 *
 * Returns US State mapping information of state names to abbreviations.
 *
 * @param {name2abbrev|abbrev2Name} format - Specifies whether the user
 * wishes to get a structure which maps full names to abbreviations or
 * vice versa.
 *
 * @returns {Object} The specified abbreviation/name mapping structure.
 */
export function usStateInfo(format) {
  var stateData = [
    {
      "name": "Alabama",
      "abbreviation": "AL"
    },
    {
      "name": "Alaska",
      "abbreviation": "AK"
    },
    {
      "name": "American Samoa",
      "abbreviation": "AS"
    },
    {
      "name": "Arizona",
      "abbreviation": "AZ"
    },
    {
      "name": "Arkansas",
      "abbreviation": "AR"
    },
    {
      "name": "California",
      "abbreviation": "CA"
    },
    {
      "name": "Colorado",
      "abbreviation": "CO"
    },
    {
      "name": "Connecticut",
      "abbreviation": "CT"
    },
    {
      "name": "Delaware",
      "abbreviation": "DE"
    },
    {
      "name": "District of Columbia",
      "abbreviation": "DC"
    },
    {
      "name": "Federated States Of Micronesia",
      "abbreviation": "FM"
    },
    {
      "name": "Florida",
      "abbreviation": "FL"
    },
    {
      "name": "Georgia",
      "abbreviation": "GA"
    },
    {
      "name": "Guam",
      "abbreviation": "GU"
    },
    {
      "name": "Hawaii",
      "abbreviation": "HI"
    },
    {
      "name": "Idaho",
      "abbreviation": "ID"
    },
    {
      "name": "Illinois",
      "abbreviation": "IL"
    },
    {
      "name": "Indiana",
      "abbreviation": "IN"
    },
    {
      "name": "Iowa",
      "abbreviation": "IA"
    },
    {
      "name": "Kansas",
      "abbreviation": "KS"
    },
    {
      "name": "Kentucky",
      "abbreviation": "KY"
    },
    {
      "name": "Louisiana",
      "abbreviation": "LA"
    },
    {
      "name": "Maine",
      "abbreviation": "ME"
    },
    {
      "name": "Marshall Islands",
      "abbreviation": "MH"
    },
    {
      "name": "Maryland",
      "abbreviation": "MD"
    },
    {
      "name": "Massachusetts",
      "abbreviation": "MA"
    },
    {
      "name": "Michigan",
      "abbreviation": "MI"
    },
    {
      "name": "Minnesota",
      "abbreviation": "MN"
    },
    {
      "name": "Mississippi",
      "abbreviation": "MS"
    },
    {
      "name": "Missouri",
      "abbreviation": "MO"
    },
    {
      "name": "Montana",
      "abbreviation": "MT"
    },
    {
      "name": "Nebraska",
      "abbreviation": "NE"
    },
    {
      "name": "Nevada",
      "abbreviation": "NV"
    },
    {
      "name": "New Hampshire",
      "abbreviation": "NH"
    },
    {
      "name": "New Jersey",
      "abbreviation": "NJ"
    },
    {
      "name": "New Mexico",
      "abbreviation": "NM"
    },
    {
      "name": "New York",
      "abbreviation": "NY"
    },
    {
      "name": "North Carolina",
      "abbreviation": "NC"
    },
    {
      "name": "North Dakota",
      "abbreviation": "ND"
    },
    {
      "name": "Northern Mariana Islands",
      "abbreviation": "MP"
    },
    {
      "name": "Ohio",
      "abbreviation": "OH"
    },
    {
      "name": "Oklahoma",
      "abbreviation": "OK"
    },
    {
      "name": "Oregon",
      "abbreviation": "OR"
    },
    {
      "name": "Palau",
      "abbreviation": "PW"
    },
    {
      "name": "Pennsylvania",
      "abbreviation": "PA"
    },
    {
      "name": "Puerto Rico",
      "abbreviation": "PR"
    },
    {
      "name": "Rhode Island",
      "abbreviation": "RI"
    },
    {
      "name": "South Carolina",
      "abbreviation": "SC"
    },
    {
      "name": "South Dakota",
      "abbreviation": "SD"
    },
    {
      "name": "Tennessee",
      "abbreviation": "TN"
    },
    {
      "name": "Texas",
      "abbreviation": "TX"
    },
    {
      "name": "Utah",
      "abbreviation": "UT"
    },
    {
      "name": "Vermont",
      "abbreviation": "VT"
    },
    {
      "name": "Virgin Islands",
      "abbreviation": "VI"
    },
    {
      "name": "Virginia",
      "abbreviation": "VA"
    },
    {
      "name": "Washington",
      "abbreviation": "WA"
    },
    {
      "name": "West Virginia",
      "abbreviation": "WV"
    },
    {
      "name": "Wisconsin",
      "abbreviation": "WI"
    },
    {
      "name": "Wyoming",
      "abbreviation": "WY"
    }
  ];

  if (format == 'name2abbrev') {
    var nameIndex = {};

    stateData.forEach(function (row) {
      nameIndex[row.name] = row.abbreviation;
    });

    return nameIndex;
  }
  else if (format == 'abbrev2name') {
    var abbrevIndex = {};

    stateData.forEach(function (row) {
      abbrevIndex[row.abbreviation] = row.name;
    });

    return abbrevIndex;
  }

  return stateData;
}

/**
 *
 * Generate some fake sales data.
 *
 * @param {number} seriesCount The number of series to generate.
 *
 * @return {Csv} A CSV containing the headers [ Name, Month, Sales, Extraneous and Item ]
 * A salesman's name will be randomly generated for each series and sales figures will be
 * randomly assigned for 12 months worth of data across the year relative to the sale of
 * the items: Car and Truck.
 *
 */
export function salesData(seriesCount=10) {
  let csv = new dex.Csv(['Name', 'Month', 'Sales', 'Extraneous', 'Item'], []);

  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  var items = ["Car", "Truck" ];

  for (var nameIndex = 0; nameIndex < seriesCount; nameIndex++) {
    var name = faker.name.firstName();
    months.forEach(function (month) {
      items.forEach(function (item) {
        csv.data.push([name, month, faker.random.number(), faker.random.number(), item]);
      });
    });
  }

  return csv;
}