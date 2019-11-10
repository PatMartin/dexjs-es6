import {Component} from '../../Component.js';

/**
 * Create an ECharts based LineChart component.
 *
 */
export class LineChart extends Component {
  /**
   *
   * Create a new instance of a ECharts LineChart component.
   *
   * @param {Object} opts - The configuration of the Component.
   * @param {string|jquerySelection} [opts.parent] - A string or jquery
   * selection indicating the DOM node which this component is to be
   * attached.
   * @param {string} [opts.id] - The id of this component.  Defaults to
   * dex-chart-echarts-linechart.
   * @param {string} [opts.class] - The class of this component.  Used
   * when alternate CSS styling is to be employed.  Default value is
   * dex-chart-echarts-linechart.
   * @param {Object} [opts.dimension] - The x, y, and color dimensions for
   * this chart.
   * @param {Object} [opts.dimension.color] - The color dimension for this
   * chart.
   * @param {string} [opts.dimension.color.type] - The color type.  "category"
   * by default.
   * @param {number} [opts.dimension.color.index] - The column index in the
   * csv data to use for coloring.
   * @param {Object} [opts.dimension.x] - The x dimension of this chart.
   * @param {string} [opts.dimension.x.type] - The type of X dimension.  "value" is
   * the default.
   * @param {number} [opts.dimension.x.index] - The column index in the csv data
   * to use for the X dimension.
   * @param {Object} [opts.dimension.y] - The y dimension of this chart.
   * @param {string} [opts.dimension.y.type] - The type of Y dimension.  "value" is
   * the default.
   * @param {number} [opts.dimension.y.index] - The column index in the csv data
   * to use for the Y dimension.
   *
   * @return {LineChart} Returns a new LineChart instance.
   *
   */
  constructor(opts) {
    var base = {
      "parent": undefined,
      "id": "dex-chart-echarts-linechart",
      "class": "dex-chart-echarts-linechart",
      "dimension": {
        color: {type: "category", index: 0},
        x: {type: "value", index: 1},
        y: {type: "value", index: 2}
      },
      "palette": "ECharts",
      "dimensions": {"series": 0, "x": 1, "y": 2},
      "options": {
        "xAxis.nameLocation": "middle",
        "yAxis.nameLocation": "middle",
        "yAxis.nameTextStyle": {"color": "red", "fontSize": 24},
        "xAxis.nameTextStyle": {"color": "red", "fontSize": 24}
      }
    };

    super(new dex.Configuration(base).overlay(opts));

    if (csv.header && csv.header.length >= 3) {
      this.set("options.title.text",
        csv.header[this.get("dimension.x.index")] + " vs " +
        csv.header[this.get("dimension.y.index")] + " by " +
        csv.header[this.get("dimension.color.index")])
    }
    this.initialize()
  }

  /**
   *
   * Return the gui definition after having overlaid the supplied
   * configuration options.
   *
   * @param {Object} opts - The supplied configuration options.
   *
   * @returns {Object} Returns the gui definition after having overlaid
   * the supplied configuration options.
   *
   */
  getGuiDefinition(opts = {}) {
    var base = super.getGuiDefinition();
    var defaults = {
      "type": "group",
      "name": "EChart Line Chart Settings",
      "contents": [
        {
          "type": "group",
          "name": "General Options",
          "contents": [
            dex.config.gui.echartsTitle({}, "options.title"),
            dex.config.gui.echartsGrid({}, "options.grid"),
            dex.config.gui.echartsTooltip({}, "options.tooltip"),
            dex.config.gui.echartsSymbol({}, "series"),

            dex.config.gui.columnDimensions({},
              "dimensions",
              this.get("csv"),
              this.get("dimensions")),
            {
              "name": "Color Scheme",
              "description": "The color scheme.",
              "target": "palette",
              "type": "choice",
              "choices": dex.color.colormaps({shortlist: true}),
              "initialValue": "ECharts"
            },
            {
              "name": "Display Legend",
              "description": "Determines whether or not to draw the legend or not.",
              "type": "boolean",
              "target": "options.legend.show",
              "initialValue": true
            },
            {
              "name": "Background Color",
              "description": "The color of the background.",
              "target": "options.backgroundColor",
              "type": "color",
              "initialValue": "#000000"
            },
            {
              "name": "Series Type",
              "description": "The series type",
              "type": "choice",
              "target": "series.type",
              "choices": ["line", "scatter", "effectScatter", "bar"]
            },
            {
              "name": "Stack Series",
              "description": "Stack the series or not.",
              "type": "boolean",
              "target": "series.stack",
              "initialValue": false
            },
            {
              "name": "Clip Overflow",
              "description": "Clip overflow.",
              "type": "boolean",
              "target": "series.clipOverflow",
              "initialValue": true
            },
            {
              "name": "Connect Nulls",
              "description": "Connect nulls.",
              "type": "boolean",
              "target": "series.connectNulls",
              "initialValue": false
            },
            {
              "name": "Step",
              "description": "Stack the series or not.",
              "type": "boolean",
              "target": "series.step",
              "initialValue": false
            }
          ]
        },
        dex.config.gui.echartsLabelGroup({}, "series.label"),
        {
          "type": "group",
          "name": "Axis",
          "contents": [
            dex.config.gui.echartsAxis({name: "X Axis"}, "options.xAxis"),
            dex.config.gui.echartsDataZoom({name: "X Axis Data Zoom"}, "xAxisDataZoom"),
            dex.config.gui.echartsAxis({name: "Y Axis"}, "options.yAxis"),
            dex.config.gui.echartsDataZoom({name: "Y Axis Data Zoom"}, "yAxisDataZoom"),
          ]
        }
      ]
    };

    var guiDef = dex.object.expandAndOverlay(opts, defaults, base);
    //dex.config.gui.sync(this, guiDef);
    return guiDef;
  };

  /**
   *
   * Initialize the LineChart.  If the chart is attached to the DOM
   * document, then the chart will initialize echarts and update it.
   *
   * @returns {LineChart} The LineChart is returned to the caller.
   *
   */
  initialize() {
    // If we are attached to a dom element
    if ($.contains(document, this.$root[0])) {
      this.internalChart = echarts.init(this.$root[0]);
      this.update();
    }
    return this;
  }

  /**
   *
   * Resize the chart.
   *
   * @returns {LineChart} The LineChart is returned.
   *
   */
  resize() {
    this.internalChart.resize();
    return this;
  }

  /**
   *
   * Add click events.
   *
   * @returns {LineChart} The LineChart is returned.
   *
   */
  enableClickEvent() {
    dex.addClickEvent(this);
    return this;
  }

  /**
   *
   * A click event.
   *
   * @returns {LineChart} The LineChart is returned.
   *
   */
  click() {
    return this;
  }

  /**
   *
   * Update the chart.
   *
   * @returns {LineChart} The LineChart is returned.
   *
   */
  update() {
    super.update();
    let options = this.calculateOptions();
    //dex.log("New Options", options)

    //notMerge = true preserves the transition
    // Otherwise, this.internalChart.clear()
    this.internalChart.setOption(options, true)
    this.internalChart.resize();
    return this;
  }

  /**
   *
   * Used internally to calculate the various charting options
   * based upon the user settings.
   *
   * @returns {Object} The calculated options are returned.
   */
  calculateOptions() {
    let config = this.config.config;
    let csv = config.csv;

    //dex.log("OVERLAYING-OPTIONS", config.options)
    let options = dex.object.expandAndOverlay(config.options, {
      color: dex.color.palette[config.palette],
      legend: {show: true, type: "scroll"},
      title: {text: ""},
      dataZoom: [
        {
          orient: "horizontal",
          show: true,
          realtime: true,
          start: 0,
          end: 100,
          xAxisIndex: 0
        },
        {
          orient: "vertical",
          show: true,
          realtime: true,
          start: 0,
          end: 100,
          yAxisIndex: 0
        },
      ],
      xAxis: {
        type: config.dimension.x.type,
        name: csv.header[config.dimension.x.index]
      },
      yAxis: {
        type: config.dimension.y.type,
        name: csv.header[config.dimension.y.index]
      },
      tooltip: {
        trigger: 'axis'
      },
      series: []
    });

    var types = csv.guessTypes()
    //dex.log("TYPES", types);
    if (types[config.dimension.x.index] == "string") {
      options.xAxis.type = "category"
    }
    if (types[config.dimension.y.index] == "string") {
      options.yAxis.type = "category"
    }
    // Figure out if we can lay this chart out by groups.
    var groups = csv.group([config.dimension.color.index]);
    var xs = groups.map(function (group, gi) {
      return group.csv.column(config.dimension.x.index)
    });

    var EQUAL_GROUPS = true;
    for (var i = 1; i < xs.length; i++) {
      if (!dex.array.equal(xs[i - 1], xs[i - 1])) {
        EQUAL_GROUPS = false;
        break;
      }
    }

    if (EQUAL_GROUPS) {
      //options.tooltip.trigger = "axis"
      // Lay out a single x axis series with y data arrays.
      options.xAxis.data = xs[0];
      groups.forEach(function (group) {
        var series = dex.object.expandAndOverlay(config.series, {
          "name": group.key,
          "type": 'line',
          "data": group.csv.column(config.dimension.y.index)
        })
        options.series.push(series);
      })
    } else {
      //options.tooltip.trigger = "item";
      _.uniq(csv.column(config.dimension.color.index)).forEach(function (name) {
        let series = csv.selectRows(function (row) {
          return row[config.dimension.color.index] === name
        }).include([config.dimension.x.index, config.dimension.y.index]);

        options.series.push(
          dex.object.expandAndOverlay(config.series, {name: name, type: 'line', data: series.data}));
      });
    }

    //dex.log("OPTIONS", options);
    //dex.log(JSON.stringify(options));
    return options;
  }
}
