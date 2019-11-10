import {Component} from '../Component.js';

export class DataFilterPane extends Component {

  constructor(opts) {
    var base = {
      // The parent container of this pane.
      "parent": null,
      "id": "dex-ui-datafilter",
      "class": "dex-ui-datafilter",
      "width": "30%",
      "height": "30%",
      "csv": undefined,
      "targets": []
    };

    super(new dex.Configuration(base).overlay(opts));
    this.selectedCategoryValues = {};
    this.selectedCategories = {};
    this.dateRanges = {};
    this.selectedRanges = {};
    this.initialize()
  }

  initialize() {
    if (!$.contains(document, this.$root[0])) {
      return this;
    }
    let config = this.config;
    let self = this;
    let $root = this.$root;
    let csv = config.get("csv");
    let targets = config.get("targets");

    // Add each component as a subscriber
    targets.forEach(function (component) {
      component.subscribe(self.getChannel(), "select", function (event) {
        //dex.log("DataFilterPane(select): ", event, component);
        component.set("csv", event.csv)
        component.update();
      });
    })

    let $dfpTitle = $(`<div class="dex-h1 text-center" data-toggle='collapse'
 data-target='#dex-ui-dfp-body'>Filters</div>`)
    let $dfpDiv = $(`<div id="dex-ui-dfp-body" class="collapse depth-1"></div>`)
    let $dfpTable = $(`<table class="dex-control-table"></table>`);
    let $dfpBody = $(`<tbody></tbody>`)

    $dfpDiv.append($dfpTable);
    $dfpTable.append($dfpBody)

    $root.append($dfpTitle)
    $root.append($dfpDiv)

    var dataTypes = csv.guessTypes();
    var categoryFilters = this.createCategoryFilters($dfpBody, dataTypes);
    var numericFilters = this.createNumericFilters($dfpBody, dataTypes);

    $root.find('.depth-1,.depth-2').collapse("show");
    return this;
  }

  createCategoryFilters($parent, dataTypes) {
    var categoryFilters = []
    let self = this;
    let csv = this.get("csv")

    if (dataTypes.includes("string")) {
      let $catRow = $("<tr></tr>")
      let $catCell = $("<td></td>")
      let $catTitle = $(`<tr><td><div class="dex-h2 text-center" data-toggle="collapse"
      data-target="#dex-cat-filters">Categorical Filters</div></tr></td>`)

      let $filters = $("<div id='dex-cat-filters' class='collapse depth-2'></div>")

      $catCell.append($filters)
      $catRow.append($catCell)

      $parent.append($catTitle);
      $parent.append($catRow)

      let stringIndexes = dex.array.findIndexes(dataTypes,
        function (elt) {
          return elt === "string"
        })

      //dex.log("STRING LOCATIONS:", stringIndexes)

      stringIndexes.forEach(function (index) {
        $filters.append(`<div class="dex-h3" id="dex-dfp-cat-filter-${index}"></div>`)
        var listSelector = new dex.ui.ListSelector({
          parent: `#dex-dfp-cat-filter-${index}`,
          id: `dex-dfp-cat-filter-list-selector-${index}`,
          name: csv.header[index],
          items: csv.unique(index),
          selectAll: true
        })
        categoryFilters.push(listSelector)

        dex.bus.subscribe(listSelector, "select", function (msg) {
          //dex.log("MSG", msg)
          self.selectedCategoryValues[csv.header[index]] = msg.selected
          self.updateCsv()
        })
      })
    }

    categoryFilters.forEach(function (filter) {
        filter.render();
      }
    )

    return categoryFilters
  }

  createNumericFilters($parent, dataTypes) {
    var numericFilters = []
    let self = this;

    if (dataTypes.includes("number")) {
      //dex.log("NUMBERS INCLUDED")
      let $numRow = $("<tr></tr>")
      let $numCell = $("<td></td>")
      let $numTitle = $(`<tr><td><div class="dex-h2 text-center" data-toggle="collapse"
      data-target="#dex-num-filters">Numeric Filters</div></tr></td>`)

      let $filters = $("<div id='dex-num-filters' class='collapse depth-2'></div>")

      $numCell.append($filters)
      $numRow.append($numCell)

      $parent.append($numTitle);
      $parent.append($numRow)

      let numberIndexes = dex.array.findIndexes(dataTypes,
        function (elt) {
          return elt === "number"
        })

      //dex.log("NUMBER LOCATIONS:", numberIndexes)

      numberIndexes.forEach(function (index) {
        $filters.append('<div>' + csv.header[index] + '</div>')
        $filters.append(`<div class="dex-ui-slider-parent" id="dex-dfp-num-filter-${index}"></div>`)
        var extent = dex.matrix.extent(csv.data, index);
        numericFilters.push(new dex.ui.Slider({
          parent: `#dex-dfp-num-filter-${index}`,
          min: extent[0],
          max: extent[1],
          data: csv.column(index),
          range: true,
          onFinish: function (data) {
            //dex.log("onFinish")
            //dex.log(data)
            self.selectedRanges[csv.header[index]] = {min: data.from, max: data.to}
            self.updateCsv()
          }
        }))
      })
    }

    numericFilters.forEach(function (filter) {
        filter.render();
      }
    )

    return numericFilters
  }

  getSelectValues(select) {
    var result = [];
    var options = select && select.options;
    var opt;

    for (var i = 0, iLen = options.length; i < iLen; i++) {
      opt = options[i];

      if (opt.selected) {
        result.push(opt.value || opt.text);
      }
    }
    //dex.console.log("GET SELECT VALUES: ", select, "RESULT", result);
    return result;
  }

  updateCsv() {
    // Ignore spurious events until we have completed initialization.
    let config = this.config;
    let $parent = $(config.get("parent"));
    let csv = config.get("csv");
    let self = this;

    //dex.console.log("UPDATE CSV", "INITIALIZING", INITIALIZING, "CSV", csv);
    if (this.INITIALIZING) {
      return;
    }

    var i;

    let selectedColumns = csv.header;

    //dex.log("SELECTED-COLUMNS", selectedColumns);

    // Update the selection map
    // TODO: Make sense of this
    // TODO: New logic for column selection
    $(config.get("parent") + ' .' + config.get("class") + "_category").each(function (i, obj) {
      var colMap = {};

      self.getSelectValues(obj).forEach(function (val) {
        colMap[val] = true;
      });
      self.selectedCategories[obj.id] = colMap;
    });

    //dex.log("COL-MAP", self.selectedCategories)

    // Update the csv based upon the selection map
    var selectedCsv = csv.selectRows(function (row) {
        return row.every(function (col, ci) {
          var header = csv.header[ci];

          // False if we're filtering this category but haven't selected this
          // category value.
          if (self.selectedCategories[header]) {
            //dex.console.logString("HDR: ", header, ", VAL: ", col, ", SHOW: ",
            //  self.selectedCategories[header][col]);
            if (!self.selectedCategories[header][col]) {
              return false;
            }
          }

          if (self.selectedCategoryValues[header]) {
            //dex.log("SELECTED-CAT_VAL", col, self.selectedCategoryValues[header])
            if (!(self.selectedCategoryValues[header].includes(col))) {
              //dex.log("FAILED", self.selectedCategoryValues)
              return false;
            }
            else {
              //dex.log("PASSED", col)
            }
          }

          // Screening by date range
          if (self.dateRanges[header]) {
            if (row[ci] < self.dateRanges[header].min ||
              row[ci] > self.dateRanges[header].max) {
              return false;
            }
          }

          // Screening by numeric range.
          if (self.selectedRanges[header]) {
            if (col < self.selectedRanges[header].min ||
              col > self.selectedRanges[header].max) {
              return false;
            }
          }

          // It passed our screens, must be data we care about.
          return true;
        });
      }
    );

    dex.log("Selected Csv", selectedCsv)

    // Publish the selected subset of the csv.
    dex.log("Publishing select event");
    this.publish("select", {
      "csv": selectedCsv.include(selectedColumns)
    });
  }

  update() {
    return this;
  };
}