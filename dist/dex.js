(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.dex = {}));
}(this, (function (exports) { 'use strict';

  class Csv {
    constructor(spec) {
      this.header = [];
      this.data = [];

      if (arguments.length === 0) ;
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
          } else {
            this.header = dex.array.copy(arguments[0]);
          }
        }
        // Else we have another CSV?
        else {
          this.header = dex.array.copy(arguments[0].header);
          this.data = dex.matrix.copy(arguments[0].data);
        }
      } else if (arguments.length == 2) {
        this.header = dex.array.copy(arguments[0]);
        this.data = dex.matrix.copy(arguments[1]);
      } else {
        dex.log("UNKNOWN INSTANTIATOR LENGTH: ", arguments.length);
      }
    }

    equals(csv) {
      if (csv === undefined || csv.header === undefined || csv.data === undefined) {
        return false;
      } else if (csv.data.length !== this.data.length ||
        csv.header.length !== this.header.length) {
        return false;
      } else {
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

    limitRows(limit) {
      var self = this;
      var newCsv = {header: dex.array.copy(self.header), data: []};

      var i = 0;
      for (i = 0; i < self.data.length && i < limit; i++) {
        newCsv.data.push(dex.array.copy(self.data[i]));
      }

      return new csv(newCsv);
    };

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
     * @param colIndex The name of the column header or its index.
     *
     * @return {string} The column name, or null if not found.
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
     * @param colIndex The index of the column we wish to retrieve.
     *
     * @return {any[]} The specified column.
     */
    column(colIndex) {
      var i = this.getColumnNumber(colIndex);

      return this.data.map(function (row) {
        return row[i];
      });
    };

    /**
     *
     * Make a copy of this csv.
     *
     * @returns {Csv} A copy of this csv.
     *
     */
    copy() {
      return new dex.Csv(this);
    };

    /**
     * Return a slice of this Csv as specified by it's columns.
     *
     * @param columns A list of column indices, names of a mixture
     * thereof.
     *
     * @returns {Csv} Returns a Csv consisting only of the specified
     * columns.
     *
     */
    columnSlice(columns) {
      var self = this;
      var slice = {};
      var columnNumbers = columns.map(function (column) {
        return self.getColumnNumber(column);
      });

      slice.header = dex.array.slice(self.header, columnNumbers);
      slice.data = dex.matrix.slice(self.data, columnNumbers);

      return new dex.Csv(slice.header, slice.data);
    };

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
     * Return a slice of the csv as defined by the specified columns.
     *
     * @param columns A list of columns.
     * @returns {Csv} A csv only containing the specified columns.
     *
     */
    columnSlice(columns) {
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
     *
     * Return a list of unique elements contained within the
     * specified columns.
     *
     * @param colIndex
     * @returns {*}
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
      var i, ri, ci;
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
     * @returns {boolean} True if valid, false otherwise.
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
        } else if (csv.data.every(function (row) {
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

    getColumnNumbers(exclusions) {
      var csv = this;
      var exclude = exclusions || [];
      var columnNumbers = dex.range(0, csv.header.length);
      return columnNumbers.filter(function (el) {
        return exclude.indexOf(el) < 0;
      });
    };

    selectRows(fn) {
      var subset = [];
      this.data.forEach(function (row) {
        if (fn(row)) {
          subset.push(dex.array.copy(row));
        }
      });

      return new dex.Csv(this.header, subset);
    };

    extent(columns) {
      return dex.matrix.extent(this.data, columns);
    };

    /**
     *
     * @returns {Array}
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
     * @param columnNum
     * @returns {boolean}
     *
     */
    isColumnNumeric(columnNum) {
      var csv = this;
      var i;

      for (i = 0; i < csv.data.length; i++) {
        if (!dex.object.isNumeric(csv.data[i][columnNum])) {
          return false;
        }
      }
      return true;
    };

    group(columns) {
      var csv = this;
      var ri, ci;
      var groups = {};
      var returnGroups = [];
      var values;
      var key;
      var groupName;
      var group;

      if (arguments < 1) {
        return csv;
      }

      function compare(a, b) {
        var si, h;

        for (si = 0; si < columns.length; si++) {
          h = csv.header[columns[si]];
          if (a[h] < b[h]) {
            return -1;
          } else if (a[h] > b[h]) {
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
        } else {
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
     * @returns {{}|*}
     *
     */
    numericSubset() {
      return this.columnSlice(this.getNumericIndices(csv));
    };

    categoricalSubset() {
      return this.columnSlice(this, this.getCategoricalIndices());
    };
  }

  /**
   *
   * Component provides the base functionality required to be a component within the
   * dex.js framework.
   *
   * Base capabilities:
   * <ul>
   *   <li>Provides a base lifecycle
   *     <ol>
   *       <li>render() - Create the component from the ground up.</li>
   *       <li>update() - Update the component.</li>
   *       <li>destroy() - Destroy the component.</li>
   *       <li>resize() - Resize the component</li>
   *     </ol>
   *   </li>
   *   <li>Configure the object via a Configuration object.</li>
   *   <li>Communicate with other components via publish/subscribe.</li>
   *   <li>Save and load state
   *     <ul>
   *       <li>Inside an html div element</li>
   *       <li>To and from JSON</li>
   *     </ul>
   *   </li>
   *   <li>Visual components can be configured via gui-definitions</li>
   * </ul>
   *
   */
  class Component {
    /**
     * Construct a new Component from an optionally provided configuration.
     *
     * @param {Object|Configuration} [config] - The configuration to be used in constructing
     * this new Component.
     *
     */
    constructor(newConfig = new dex.Configuration()) {
      if (newConfig instanceof dex.Configuration) {
        /**
         *
         * @type {Configuration} config - The configuration.
         */
        this.config = newConfig;
      }
      else {
        this.config = new dex.Configuration(newConfig);
      }

      /**
       *
       * @type {{contents: [], name: string, type: string}}
       */
      this.guiDefinition = {
        "type": "group",
        "name": this.config.get("id") + " Settings",
        "contents": []
      };

      /**
       * @type {string}
       */
      this.channel = this.getDomTarget();

      /**
       * @type {jQuery|HTMLElement}
       */
      this.$root = undefined;

      // Create our top level container.
      // TODO: accommodate components with special container requirements more generically
      if (this.config.get("class") === "dex-ui-slider") {
        this.$root = $(`<input id="${this.config.get("id")}" class="dex-cmp ${this.config.get("class")}"></input>`);
      }
      else {
        this.$root = $(`<div id="${this.config.get("id")}" class="dex-cmp ${this.config.get("class")}"></div>`);
      }

      /**
       * @type {jQuery|HTMLElement}
       */
      this.$parent = $("body");

      // If parent is supplied, append ourselves to it:
      if (this.config.isDefined("parent")) {
        let parent = (this.config.get("parent"));
        // If jquery node:
        if (parent instanceof $) {
          this.$parent = parent;
        }
        else {
          this.$parent = $(parent);
        }
      }

      this.$parent.append(this.$root);
    }

    /**
     *
     * Returns whether or not the named parameter is configured for this Component.
     *
     * @param {string} name - The name of the parameter.
     *
     * @return {boolean} True if defined, false otherwise.
     *
     */
    isDefined(name) {
      return this.config.isDefined(name)
    }

    /**
     *
     * A lifecycle event placeholder for components to define.  This is where
     * initialization occurs, document trees are created prior to actually being
     * rendered.
     */
    initialize() {
      dex.log(`Initializer undefined for component: ${this.getDomTarget()}`);
    }

    /**
     *
     * Set a configuration parameter.
     *
     * @param {string} name - The name of the configuration parameter.
     * @param {any} value - The value of the configuration parameter.
     *
     */
    set(name, value) {
      //dex.log(`SETTING: ${name}=${value}`)
      this.config.set(name, value);
      if (name === "parent") {
        // detach from old node
        this.$root.detach();

        let parent = value;

        if (parent instanceof $) {
          this.$parent = parent;
          parent.append(this.$root);
        }
        else {
          this.$parent = $(parent);
          this.$parent.append(this.$root);
        }
        this.initialize();
      }
      return this;
    }

    /**
     *
     * Gets the value of the specified configuration parameter.
     *
     * @param {string} name - The name of the configuration parameter.
     *
     * @return {any} The value of the configuration parameter.
     *
     */
    get(name) {
      return this.config.get(name);
    }

    /**
     *
     * Returns the gui definition for this component.
     *
     * @return {object} The gui definition for this object.
     *
     */
    getGuiDefinition() {
      return this.guiDefinition
    }

    /**
     *
     * Returns the DOM target for this component.  The dom target is of the
     * form "#${id}.${class}" and can serve as a suitable selector.
     *
     * @return {string} A string containing the dom target for this component.
     *
     * @example // Given component c with id=foo and class= bar, the call:
     * c.getDomTarget() // would return "#foo.bar"
     *
     */
    getDomTarget() {
      return `#${this.get("id")}.${this.get("class")}`
    }

    /**
     *
     * A synonym for getDomTarget.
     *
     * @returns {string} A string containing the dom target for this component.
     * This dom target is also used to create a unique channel name within the
     * dex.bus pub/sub intra-component communication channel.
     *
     */
    getChannel() {
      return this.getDomTarget();
    }

    /**
     *
     * Publish an event to the dex.bus.
     *
     * @param {string} eventType - The name of the event.
     * @param {object} event - The object payload of the event.
     *
     */
    publish(eventType, event) {
      //dex.log(`Publish: channel="${this.channel}", type="${eventType}", payload:`, event)
      dex.bus.publish(this.channel, eventType, event);
    }

    /**
     *
     * Subscribe to events from the specified channel.
     *
     * @param {Component|string} channel - The channel name or component
     * whose events were are interested in receiving.
     * @param {string} eventType - The type of events we are
     * interested in receiving.
     * @param {function(event: Object)} fn - A callback function to be invoked when the
     * event is received.
     *
     * @returns {function} Returns the callback function.  The function
     * is required as part of the unsubscribe mechanism and must be
     * retained in order to unsubscribe from these events in the future.
     */
    subscribe(channel, eventType, fn) {
      if (channel instanceof Component) {
        //dex.log(`Subscribe: cmp-channel="${channel.getDomTarget()}", type="${eventType}"`)
        return dex.bus.subscribe(channel.getDomTarget(), eventType, fn)
      }
      //dex.log(`Subscribe: str-channel="${channel}", type="${eventType}", fn:`, fn)
      return dex.bus.subscribe(channel, eventType, fn);
    }

    /**
     * Unsubscribe from the specified events.
     *
     * @param {Component|string} channel - The channel name or component
     * whose events to which we wish to unsubscribe.
     * @param {string} eventType - The type of events we are no longer
     * interested in receiving.
     * @param {function} fn - The callback function generated from the
     * subscribe activity.
     */
    unsubscribe(channel, eventType, fn) {
      if (channel instanceof Component) {
        dex.bus.unsubscribe(channel.getDomTarget(), eventType, fn);
      }
      else {
        // TODO: Is the this.channel part of this a bug?
        dex.bus.unsubscribe(this.channel, eventType, fn);
      }
    }

    /**
     *
     * A default no-op implementation of render.  Subclasses should
     * override this method with one which provides an initial rendering
     * of their specific component.  This is a great place to put
     * one-time only initialization logic.
     *
     * @return {Component} Returns this component for the purpose of method
     * chaining.
     *
     */
    render() {
      // Set up event handlers
      dex.addResizeEvent(this);
      return this;
    };

    /**
     *
     * A default no-op implementation of update.  This will update the
     * current component relative to any new setting or data changes.
     *
     * @return {Component} returns this component for the purpose of method
     * chaining.
     */
    update() {
      return this;
    };

    /**
     *
     * Saves the current component configuration to a div within the
     * DOM tree.  Currently not implemented.
     *
     * @returns {Component} Returns this component for the purpose of
     * method chaining.
     */
    save() {
      return this;
    }

    /**
     *
     * Resize the component.  Currently not implemented.
     *
     * @returns {Component} Returns this component for the purpose of
     * method chaining.
     *
     */
    resize() {
      return this;
    };

    /**
     *
     * Delete the component.  Currently not implemented.
     *
     * @returns {Component} Returns this component for the purpose of
     * method chaining.
     *
     */
    delete() {
      // TODO: Remove resize event.
    }
  }

  /**
   *
   * This class provides capabilities which ease the task of configuring things.
   *
   * @example
   *
   * // The simple cases are still simple:
   *
   * // Create a configuration where option a == "A" and b == "B".
   * var config = new Configuration({a: "A", b: "B"});
   *
   * // Another way of doing it:
   * var a="A", b="B"
   * var config = new Configuration(a, b);
   *
   */
  class Configuration {
    /**
     * Construct a new configuration object.
     *
     * @param {Object} config - An object containing our configuration.
     * Attributes with names like "a.b":"c" will be expanded as:
     * "a" : { "b" : "c" } though they can still be read and written
     * to via the dot notation shorthand.
     *
     */
    constructor(config) {
      this.config = {};
      this.configure(config);
    }

    /**
     *
     * Given a configuration, use it to define our configuration.
     * Perform dot notation expansion and leave the original
     * config supplied to us untouched.
     *
     * @param {Object} config - An object containing our configuration.
     * Attributes with names like "a.b":"c" will be expanded as:
     * "a" : { "b" : "c" } though they can still be read and written
     * to via the dot notation shorthand.
     *
     * @returns {Configuration} Returns this configuration option for
     * the purpose of method chaining.
     *
     */
    configure(config) {
      if (config) {
        this.config = dex.object.expand(config);
      }
      return this;
    }

    /**
     * Overlay the supplied configuration on top of this one.
     *
     * @param {Object} overlay - A configuration overlay to put
     * on top of this configuration.  Conflicting configuration
     * definitions will defer to the ones defined on the overlay.
     *
     * @returns {Configuration} The configuration.
     *
     */
    overlay(overlay) {
      this.config = dex.object.expandAndOverlay(overlay, this.config);
      return this;
    }

    /**
     * Underlay the supplied configuration underneath this one.
     *
     * @param {Object} underlay - A configuration underlay to put
     * underneath this configuration.  Conflicting configuration
     * definitions will defer to the ones currently defined in
     * the Configuration.  Underlay definitions will only be
     * used when the original configuration has none.
     *
     * @returns {Configuration} The configuration with the underlay
     * having been applied..
     *
     */
    underlay(underlay) {
      this.config = dex.object.expandAndOverlay(this.config, underlay);
      return this;
    }

    /**
     *
     * Get the value of the named configuration parameter.  Supports dot
     * notation shorthand.
     *
     * @param {string} name - The name of the configuration parameter we
     * seek.
     *
     * @example
     *
     * // Retrieve object "a"
     * get("a")
     *
     * // Retrieve object b which is nested in parent object a.
     * get("a.b")
     *
     */
    get(name) {
      return dex.object.getHierarchical(this.config, name);
    }

    /**
     *
     * Store the value in the specfied configuration paramter.
     *
     * @param {string} name The name of the configuration parameter.
     * Supports the dot noation shorthand.
     * @param {any} value The value of the configuration parameter.  Can be
     * any type.
     *
     * @return {Configuration} Returns the configuration object.
     *
     * @example
     *
     * // Store the value 3.14 in an object named PI which resides in a
     * // parent object named "constants" which in turn resides in a parent
     * // object named "math"
     * set("math.constants.PI", 3.14)
     *
     */
    set(name, value) {
      dex.object.setHierarchical(this.config, name, value, '.');
      return this;
    }

    /**
     * Returns whether or not the specified configuration parameter is
     * defined or not.
     *
     * @param {string} name - The name of the specified configuration parameter.
     *
     * @returns {boolean} True if defined, false otherwise.
     */
    isDefined(name) {
      return typeof this.get(name) !== "undefined"
    }
  }

  /**
   *
   * Log one or more messages or objects or a combination of both.
   *
   * @param {Mixed} [...] - A series of messages/objects to be logged.
   *
   */
  function log() {
    var msg = arguments;
    if (msg === undefined) {
      console.log("dex.log(undefined)");
    }
    for (var i = 0; i < msg.length; i++) {
      if (msg[i] === undefined) {
        console.log("dex.log(arg[" + i + "]=UNDEFINED)");
      }
      else if (typeof msg[i] == 'object') {
        console.dir(msg[i]);
      }
      else {
        console.log(msg[i]);
      }
    }
  }

  /**
   * If dex.debugging is true, log the debug message.
   *
   * @param {string|Object} msg - The object or message to be logged.
   *
   */
  function debug(msg) {
    if (dex.debugging) {
      log(msg);
    }
  }

  /**
   *
   * Log one or more messages as strings.
   *
   * @param {...string|...Object} messages - One or more string or object
   * messages to be logged as a string.
   *
   */
  function logString(...messages) {
    console.log(messages.map(function (msg) {
      if (typeof msg === "object") {
        var cache = [];
        var jsonStr = JSON.stringify(msg, function (key, value) {
          if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
              // Duplicate reference found
              try {
                // If this value does not reference a parent it can be deduped
                return JSON.parse(JSON.stringify(value));
              } catch (error) {
                // discard key if value cannot be deduped
                return;
              }
            }
            // Store value in our collection
            cache.push(value);
          }
          return value;
        });
        cache = null;
        return jsonStr;
      }
      else {
        return msg;
      }
    }).join(''));
  }

  var loggerModule = /*#__PURE__*/Object.freeze({
    __proto__: null,
    log: log,
    debug: debug,
    logString: logString
  });

  class EventBus {
    constructor(params) {
      this.subscriptions = {};
    }

    /**
     *
     * Clear all of the bus subscriptions.
     *
     */
    clear() {
      this.subscriptions = {};
    }

    /**
     *
     * Clear all subscriptions to the given channel.
     *
     */
    clear(channel) {
      if (channel) {
        this.subscriptions[channel] = {};
      }
    }

    /**
     * Clear all subscriptions of this event type to this channel.
     *
     */
    clear(channel, eventType) {
      if (channel && eventType && this.subscriptions[channel][eventType]) {
        this.subscriptions[channel][eventType] = [];
      }
    }

    /**
     * Publishes a Topic. If the topic exists in the PubSub subscriptions, the
     * corresponding function will be invoked
     *
     * @param {string} channel The channel we will publish to.
     * @param {string} eventType The event type to publish.
     * @param {Object} event The event to be published.
     *
     */
    publish(channel, eventType, event) {
      if (channel && eventType && event && this.subscriptions[channel] &&
        this.subscriptions[channel][eventType]) {
        for (const fn of this.subscriptions[channel][eventType])
          fn(event);
      }
    }

    /**
     * Subscribes a Function to a channel. The function will be invoked when the
     *  corresponding channel is published.
     *
     * @param {string} channel Identifier for storing subscriptions.
     * @param {string} eventType Second part of the identifier for storing subscriptions.
     * @param {Function} fn fn Function to be invoked when the matching channel
     *  is published to.
     *
     *  @return {Function} Returns the callback function for the purpose of
     *  later unsubscribing.
     *
     */
    subscribe(channel, eventType, fn) {
      let chan = (channel instanceof Component) ? channel.getDomTarget() : channel;

      this.subscriptions[chan] = this.subscriptions[chan] || {};
      this.subscriptions[chan][eventType] = this.subscriptions[chan][eventType] || [];
      this.subscriptions[chan][eventType].push(fn);
      return fn;
    }

    /**
     * Unsubscribe a function from a channel. Only Deletes functions stored
     *  through a variable/ or function name.
     *
     * @param {String} channel channel to unsubscribe.
     * @param {String} eventType Event type to unsubscribe.
     * @param {Function} fn The function to unsubscribe.
     *
     */
    unsubscribe(channel, eventType, fn) {
      let chan = (channel instanceof Component) ? channel.getDomTarget() : channel;

      if (this.subscriptions[chan] && this.subscriptions[chan][eventType]) {
        this.subscriptions[chan][eventType].forEach((value, index) => {
          if (value === fn) {
            this.subscriptions[chan][eventType].splice(index, 1);
          }
        });
      }
    }
  }

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
  function combinations(arr, comboLength) {
    var i, j, combs, head, tailcombs;

    var uniqueArray = dex.array.unique(arr);

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
  }
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
  function copy(arr) {
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
  function extent(arr) {
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
  function guessType(array) {
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
  function equal(a, b) {
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
  function slice(array, rowRange, maxElt) {
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
  }

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
  function findIndexes(array, condition) {
    var indices = [];
    if (array !== undefined && Array.isArray(array)) {
      array.forEach(function (elt, index) {
        if (condition(elt) == true) {
          indices.push(index);
        }
      });
    }
    return indices;
  }

  var arrayModule = /*#__PURE__*/Object.freeze({
    __proto__: null,
    combinations: combinations,
    copy: copy,
    extent: extent,
    guessType: guessType,
    equal: equal,
    slice: slice,
    findIndexes: findIndexes
  });

  /**
   * Create an ECharts based LineChart component.
   *
   */
  class LineChart extends Component {
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
          csv.header[this.get("dimension.color.index")]);
      }
      this.initialize();
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
      this.internalChart.setOption(options, true);
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

      var types = csv.guessTypes();
      //dex.log("TYPES", types);
      if (types[config.dimension.x.index] == "string") {
        options.xAxis.type = "category";
      }
      if (types[config.dimension.y.index] == "string") {
        options.yAxis.type = "category";
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
          });
          options.series.push(series);
        });
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



  var echartsModule = /*#__PURE__*/Object.freeze({
    __proto__: null,
    LineChart: LineChart
  });

  /**
   * This is the echarts module.
   *
   * @type {{LineChart?: LineChart}}
   */
  var echarts$1 = echartsModule;

  var chartsModule = /*#__PURE__*/Object.freeze({
    __proto__: null,
    echarts: echarts$1
  });

  /**
   *
   * Given a color, lighten or darken it by the requested percent.
   *
   * @param {string} color The color to modify.
   * @param {number} percent A floating point number in the range of [-1.0, 1.0].  Negative
   * values will lighten the color, positive values will darken it.
   *
   * @return {string} The lightened or darkened color in the form of #ffffff.
   *
   */
  function shadeColor(color, percent) {
    var f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255,
      p = percent < 0 ? percent * -1 : percent,
      R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
    return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) *
      0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
  }
  /**
   *
   * Given two colors, blend them together.
   *
   * @param {color} color1 - The first color to blend.
   * @param {color} color2 - The second color to blend.
   * @param {percent} percent - The percent to blend.
   * @return {string} The resulant color.
   *
   */
  function blendColors(color1, color2, percent) {
    var f = parseInt(color1.slice(1), 16), t = parseInt(color2.slice(1), 16),
      R1 = f >> 16, G1 = f >> 8 & 0x00FF,
      B1 = f & 0x0000FF, R2 = t >> 16,
      G2 = t >> 8 & 0x00FF, B2 = t & 0x0000FF;

    return "#" + (0x1000000 + (Math.round((R2 - R1) * percent) + R1) * 0x10000 +
      (Math.round((G2 - G1) * percent) + G1) * 0x100 +
      (Math.round((B2 - B1) * percent) + B1)).toString(16).slice(1);
  }
  /**
   *
   * Given an palette or array of colors and some optional color
   * assignmeents, create a colormap.
   *
   * @param {string[]} palette An array of colors within this colormap.
   * @param {object} presets An optional mapping of domain values and
   * preset color assignments.
   *
   * @return {Function} Returns the colormap function.
   *
   * @example
   * // Assigns a colormap of red, white and blue
   * var usColormap = dex.color.colormap(['red', 'white', 'blue']);

   * @example
   * // Assigns a colormap of grey, brown and yellow and reserves red for
   * // Republicans and blue for Democrats.
   * var usPartyColors = dex.color.colormap(['grey', 'brown', 'yellow'],
   *   { 'Republican' : 'red', 'Democrat' : 'blue' });
   *
   */
  function colormap(palette, presets) {
    var numColors = palette.length;
    var data2Color = presets || {};
    var currentColor = 0;

    return function (d) {
      if (data2Color[d]) {
        //dex.log("Existing Color: " + d + " = " + data2Color[d]);
        return data2Color[d];
      }
      else {
        data2Color[d] = palette[currentColor % numColors];
        //dex.log("New Color[" + currentColor + "]: " + d + " = " + data2Color[d]);
        currentColor++;
        return data2Color[d];
      }
    };
  }
  /**
   *
   * Return the list of available named colormaps.
   *
   * @param {object} options - An options list.  Ex: { shortlist: true }
   * @return {string[]} The list of available colormaps.
   *
   */
  function colormaps(options) {
    var opts = options || {};
    if (opts.shortlist) {
      return [
        "ECharts",
        "category10", "category20b", "category20c", "category20", "c64Dark",
        "c64Light", "divergingDark12", "divergingPastel12", "hueSoft128",
        "hueHard128", "crayola8", "crayola120", "YlGn_9",
        "YlGnBu_9", "GnBu_9", "BuGn_9", "PuBuGn_9", "PuBu_9",
        "BuPu_9", "RdPu_9", "PuRd_9", "OrRd_9", "YlOrRd_9", "YlOrBr_9",
        "Purples_9", "Blues_9", "Greens_9", "Oranges_9", "Reds_9",
        "Greys_9", "PuOr_11", "BrBG_11", "PRGn_11", "PiYG_11",
        "RdBu_11", "RdGy_11", "RdYlBu_11",
        "Spectral_4", "Spectral_8", "Spectral_11",
        "RdYlGn_11", "Accent_8", "Dark2_8", "Paired_12",
        "Pastel1_9", "Pastel2_8", "Set1_9", "Set2_8", "Set3_12",
        "Stop Light", "White to Red", "White to Blue",
        "Red White and Blue", "HeatMap 1"
      ];
    }
    return Object.keys(dex.color.palette);
  }
  /**
   *
   * Given a domain of 2 or more items and a range of 2 colors,
   * return a categorical interpolation across the two colors
   * based upon the supplied range.
   *
   * @param {string[]} domain 2 or more items in a categorical domain.
   * @param {string[]} range An array of 2 colors.
   *
   * @return {Function} A colormap function.
   *
   */
  function interpolateCategorical(domain, range) {
    var color = d3.scale.ordinal()
      .domain(domain)
      .range(d3.range(domain.length).map(d3.scale.linear()
        .domain([0, domain.length - 1])
        .range(range)
        .interpolate(d3.interpolateLab)));

    return function (d) {
      return color(d);
    };
  }
  /**
   *
   * Get the named colormap with the assigned presets.
   *
   * @param paletteName The name of the color palette to be used.
   * @param presets Optional user defined color presets which are
   * assigned via categorial domain.
   *
   * @return {Function} The colormap function.
   *
   */
  function getColormap(paletteName, presets) {
    var colormap = dex.color.colormap(dex.color.palette[paletteName], presets);
    return function (d) {
      return colormap(d);
    };
  }
  /**
   *
   * Pre-defined color palettes.
   *
   * @type = {Object} palette - An object with keys containing the palette name
   * indexing arrays of color definitions for that palette.
   *
   */
  var palette = {
    'Stop Light': ['#ff0000', '#ffff00', '#00ff00'],
    'White to Red': ['#ffffff', '#ff0000'],
    'White to Blue': ['#ffffff', '#0000ff'],
    'Red White and Blue': ['#ff0000', '#ffffff', '#0000ff'],
    'ECharts': [
      '#c23531', '#2f4554', '#61a0a8', '#d48265',
      '#91c7ae', '#749f83', '#ca8622', '#bda29a',
      '#6e7074', '#546570', '#c4ccd3'
    ],
    'category10': [
      '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
      '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
    ],
    'category20b': [
      '#393b79', '#5254a3', '#6b6ecf', '#9c9ede', '#637939',
      '#8ca252', '#b5cf6b', '#cedb9c', '#8c6d31', '#bd9e39',
      '#e7ba52', '#e7cb94', '#843c39', '#ad494a', '#d6616b',
      '#e7969c', '#7b4173', '#a55194', '#ce6dbd', '#de9ed6'
    ],
    'category20c': [
      '#3182bd', '#6baed6', '#9ecae1', '#c6dbef', '#e6550d',
      '#fd8d3c', '#fdae6b', '#fdd0a2', '#31a354', '#74c476',
      '#a1d99b', '#c7e9c0', '#756bb1', '#9e9ac8', '#bcbddc',
      '#dadaeb', '#636363', '#969696', '#bdbdbd', '#d9d9d9'
    ],
    'category20': [
      '#1f77b4', '#aec7e8', '#ff7f0e', '#ffbb78', '#2ca02c',
      '#98df8a', '#d62728', '#ff9896', '#9467bd', '#c5b0d5',
      '#8c564b', '#c49c94', '#e377c2', '#f7b6d2', '#7f7f7f',
      '#c7c7c7', '#bcbd22', '#dbdb8d', '#17becf', '#9edae5'
    ],
    'c64Dark': [
      '#000000', '#880000', '#AAFFEE', '#CC44CC', '#00CC55',
      '#0000AA', '#EEEE77', '#DD8855', '#664400', '#FF7777',
      '#333333', '#777777', '#AAFF66', '#0088FF', '#BBBBBB'
    ],
    'c64Light': [
      '#FFFFFF', '#880000', '#AAFFEE', '#CC44CC', '#00CC55',
      '#0000AA', '#EEEE77', '#DD8855', '#664400', '#FF7777',
      '#333333', '#777777', '#AAFF66', '#0088FF', '#BBBBBB'
    ],
    'divergingDark12': [
      '#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99',
      '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a',
      '#ffff99', '#b15928'],
    'divergingPastel12': [
      '#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3',
      '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd',
      '#ccebc5', '#ffed6f'],
    'hueSoft128': [
      "#62a96c", "#9844ed", "#37b335", "#6334ce", "#6cac16",
      "#3c4ce7", "#5e9222", "#6d19b6", "#66b450", "#b229cc",
      "#348f2d", "#de50ee", "#23af6d", "#e72fc2", "#8ea42f",
      "#2d2bb8", "#ae9620", "#7a62f3", "#d5942b", "#3c52d6",
      "#e47b24", "#542da9", "#84a953", "#a35de9", "#768930",
      "#a047c8", "#2d8346", "#f128a4", "#558338", "#d75eda",
      "#355f17", "#9d229f", "#9f8d30", "#534bbf", "#ed5322",
      "#4483f2", "#dc312d", "#5d70e7", "#ad7523", "#a272e8",
      "#6c6e1a", "#68208f", "#ada257", "#26439f", "#ba3a1e",
      "#4397dd", "#e72754", "#48a9a2", "#ed2f74", "#3d8d67",
      "#e75abe", "#305d3b", "#b82891", "#86a46f", "#7c41a4",
      "#d28047", "#5556b3", "#b0531f", "#6a8fe0", "#8d2f0d",
      "#3ba8c4", "#ce3f4c", "#3783a3", "#e97059", "#3e69b6",
      "#a18447", "#ba71d5", "#4d4f22", "#bc4eae", "#6ba385",
      "#df3d80", "#43857c", "#eb57a1", "#1c5b5a", "#be297b",
      "#6d7d4c", "#837edd", "#805f27", "#b38ad8", "#704117",
      "#9f95db", "#94292c", "#70a2c7", "#b52c58", "#48706b",
      "#ee6b99", "#344b46", "#e56177", "#376093", "#c36758",
      "#31477e", "#bb8965", "#554286", "#a19b6f", "#6f1f6a",
      "#7b9587", "#8f3888", "#505a47", "#cd7ec9", "#6e6246",
      "#ab579c", "#55412f", "#dd79b2", "#305061", "#c05081",
      "#7f98a6", "#982256", "#506c7f", "#793626", "#6e82b0",
      "#7f3441", "#7e64a9", "#845941", "#7d2453", "#af9992",
      "#80416f", "#847063", "#a76794", "#434460", "#ce8d8f",
      "#603d63", "#d17b92", "#623e43", "#a58bad", "#a16460",
      "#746687", "#a45269", "#886574"],
    'hueHard128': [
      "#74b6b1", "#5500bb", "#47c323", "#9a2bdf", "#47a100",
      "#1d1ab7", "#00a646", "#d629e2", "#79bc4c", "#d34fff",
      "#8d9c00", "#a253ff", "#5a7c00", "#ff3cde", "#176100",
      "#c100b2", "#007533", "#f400a3", "#54be82", "#5c0392",
      "#e39800", "#005ae1", "#ff8902", "#3685ff", "#fc6900",
      "#00329f", "#cea635", "#986fff", "#a18600", "#c872ff",
      "#777800", "#6d7dff", "#dca036", "#0048a4", "#ed001d",
      "#02b1f9", "#ba0000", "#55aeff", "#d03e00", "#649aff",
      "#ca5a00", "#0061c1", "#f49339", "#472881", "#93b65a",
      "#b5009a", "#017745", "#ff52ca", "#335500", "#fd77f6",
      "#009377", "#d20096", "#00babf", "#dc003d", "#00a9a5",
      "#ff3a5d", "#37b9d7", "#e10058", "#017c7b", "#ff5a4b",
      "#018dd1", "#c36c00", "#9d95ff", "#9e6f00", "#de89fe",
      "#7c5c00", "#73007f", "#bdab5a", "#ff64c6", "#0e4527",
      "#cf0069", "#77b899", "#c50070", "#005c48", "#ff6199",
      "#017690", "#a20016", "#5eb3ec", "#882300", "#016bb8",
      "#ff8557", "#153a73", "#f69158", "#004875", "#ff5f63",
      "#0088b6", "#ff7962", "#016291", "#d5a255", "#6e0e5d",
      "#a2b177", "#91005c", "#b2ac87", "#ac004f", "#005264",
      "#ff5f84", "#353e31", "#de8ee6", "#5a4a00", "#bf9af1",
      "#834700", "#98aada", "#7a0c0b", "#90aec8", "#900036",
      "#abad94", "#433268", "#d4a16d", "#2f3a5d", "#ff6d7b",
      "#433c10", "#e48ed2", "#523609", "#f887b5", "#483a20",
      "#f68aa5", "#44364f", "#e89770", "#5f284c", "#b0aaa6",
      "#6e1f29", "#c1a0c8", "#652a13", "#c7a0b3", "#4d3636",
      "#fa8b8e", "#582f3e", "#df989e"
    ],
    'crayola8': [
      'red', 'yellow', 'blue', 'green',
      'orange', 'brown', 'violet', 'black'],
    'crayola120': [
      '#EFDBC5', '#CD9575', '#FDD9B5', '#78DBE2',
      '#87A96B', '#FFA474', '#FAE7B5', '#9F8170',
      '#FD7C6E', '#232323', '#1F75FE', '#ADADD6',
      '#199EBD', '#7366BD', '#DE5D83', '#CB4154',
      '#B4674D', '#FF7F49', '#EA7E5D', '#B0B7C6',
      '#FFFF99', '#1CD3A2', '#FFAACC', '#DD4492',
      '#1DACD6', '#BC5D58', '#DD9475', '#9ACEEB',
      '#FFBCD9', '#FDDB6D', '#2B6CC4', '#EFCDB8',
      '#6E5160', '#1DF914', '#71BC78', '#6DAE81',
      '#C364C5', '#CC6666', '#E7C697', '#FCD975',
      '#A8E4A0', '#95918C', '#1CAC78', '#F0E891',
      '#FF1DCE', '#B2EC5D', '#5D76CB', '#CA3767',
      '#3BB08F', '#FDFC74', '#FCB4D5', '#FFBD88',
      '#F664AF', '#CD4A4A', '#979AAA', '#FF8243',
      '#C8385A', '#EF98AA', '#FDBCB4', '#1A4876',
      '#30BA8F', '#1974D2', '#FFA343', '#BAB86C',
      '#FF7538', '#E6A8D7', '#414A4C', '#FF6E4A',
      '#1CA9C9', '#FFCFAB', '#C5D0E6', '#FDD7E4',
      '#158078', '#FC74FD', '#F780A1', '#8E4585',
      '#7442C8', '#9D81BA', '#FF1DCE', '#FF496C',
      '#D68A59', '#FF48D0', '#E3256B', '#EE204D',
      '#FF5349', '#C0448F', '#1FCECB', '#7851A9',
      '#FF9BAA', '#FC2847', '#76FF7A', '#9FE2BF',
      '#A5694F', '#8A795D', '#45CEA2', '#FB7EFD',
      '#CDC5C2', '#80DAEB', '#ECEABE', '#FFCF48',
      '#FD5E53', '#FAA76C', '#FC89AC', '#DBD7D2',
      '#17806D', '#DEAA88', '#77DDE7', '#FDFC74',
      '#926EAE', '#F75394', '#FFA089', '#8F509D',
      '#EDEDED', '#A2ADD0', '#FF43A4', '#FC6C85',
      '#CDA4DE', '#FCE883', '#C5E384', '#FFB653'
    ],
    "YlGn_3": ["#f7fcb9", "#addd8e", "#31a354"],
    "YlGn_4": ["#ffffcc", "#c2e699", "#78c679", "#238443"],
    "YlGn_5": ["#ffffcc", "#c2e699", "#78c679", "#31a354", "#006837"],
    "YlGn_6": ["#ffffcc", "#d9f0a3", "#addd8e", "#78c679", "#31a354", "#006837"],
    "YlGn_7": ["#ffffcc", "#d9f0a3", "#addd8e", "#78c679", "#41ab5d", "#238443", "#005a32"],
    "YlGn_8": ["#ffffe5", "#f7fcb9", "#d9f0a3", "#addd8e", "#78c679", "#41ab5d", "#238443", "#005a32"],
    "YlGn_9": ["#ffffe5", "#f7fcb9", "#d9f0a3", "#addd8e", "#78c679", "#41ab5d", "#238443", "#006837", "#004529"],
    "YlGnBu_3": ["#edf8b1", "#7fcdbb", "#2c7fb8"],
    "YlGnBu_4": ["#ffffcc", "#a1dab4", "#41b6c4", "#225ea8"],
    "YlGnBu_5": ["#ffffcc", "#a1dab4", "#41b6c4", "#2c7fb8", "#253494"],
    "YlGnBu_6": ["#ffffcc", "#c7e9b4", "#7fcdbb", "#41b6c4", "#2c7fb8", "#253494"],
    "YlGnBu_7": ["#ffffcc", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#0c2c84"],
    "YlGnBu_8": ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#0c2c84"],
    "YlGnBu_9": ["#ffffd9", "#edf8b1", "#c7e9b4", "#7fcdbb", "#41b6c4", "#1d91c0", "#225ea8", "#253494", "#081d58"],
    "GnBu_3": ["#e0f3db", "#a8ddb5", "#43a2ca"],
    "GnBu_4": ["#f0f9e8", "#bae4bc", "#7bccc4", "#2b8cbe"],
    "GnBu_5": ["#f0f9e8", "#bae4bc", "#7bccc4", "#43a2ca", "#0868ac"],
    "GnBu_6": ["#f0f9e8", "#ccebc5", "#a8ddb5", "#7bccc4", "#43a2ca", "#0868ac"],
    "GnBu_7": ["#f0f9e8", "#ccebc5", "#a8ddb5", "#7bccc4", "#4eb3d3", "#2b8cbe", "#08589e"],
    "GnBu_8": ["#f7fcf0", "#e0f3db", "#ccebc5", "#a8ddb5", "#7bccc4", "#4eb3d3", "#2b8cbe", "#08589e"],
    "GnBu_9": ["#f7fcf0", "#e0f3db", "#ccebc5", "#a8ddb5", "#7bccc4", "#4eb3d3", "#2b8cbe", "#0868ac", "#084081"],
    "BuGn_3": ["#e5f5f9", "#99d8c9", "#2ca25f"],
    "BuGn_4": ["#edf8fb", "#b2e2e2", "#66c2a4", "#238b45"],
    "BuGn_5": ["#edf8fb", "#b2e2e2", "#66c2a4", "#2ca25f", "#006d2c"],
    "BuGn_6": ["#edf8fb", "#ccece6", "#99d8c9", "#66c2a4", "#2ca25f", "#006d2c"],
    "BuGn_7": ["#edf8fb", "#ccece6", "#99d8c9", "#66c2a4", "#41ae76", "#238b45", "#005824"],
    "BuGn_8": ["#f7fcfd", "#e5f5f9", "#ccece6", "#99d8c9", "#66c2a4", "#41ae76", "#238b45", "#005824"],
    "BuGn_9": ["#f7fcfd", "#e5f5f9", "#ccece6", "#99d8c9", "#66c2a4", "#41ae76", "#238b45", "#006d2c", "#00441b"],
    "PuBuGn_3": ["#ece2f0", "#a6bddb", "#1c9099"],
    "PuBuGn_4": ["#f6eff7", "#bdc9e1", "#67a9cf", "#02818a"],
    "PuBuGn_5": ["#f6eff7", "#bdc9e1", "#67a9cf", "#1c9099", "#016c59"],
    "PuBuGn_6": ["#f6eff7", "#d0d1e6", "#a6bddb", "#67a9cf", "#1c9099", "#016c59"],
    "PuBuGn_7": ["#f6eff7", "#d0d1e6", "#a6bddb", "#67a9cf", "#3690c0", "#02818a", "#016450"],
    "PuBuGn_8": ["#fff7fb", "#ece2f0", "#d0d1e6", "#a6bddb", "#67a9cf", "#3690c0", "#02818a", "#016450"],
    "PuBuGn_9": ["#fff7fb", "#ece2f0", "#d0d1e6", "#a6bddb", "#67a9cf", "#3690c0", "#02818a", "#016c59", "#014636"],
    "PuBu_3": ["#ece7f2", "#a6bddb", "#2b8cbe"],
    "PuBu_4": ["#f1eef6", "#bdc9e1", "#74a9cf", "#0570b0"],
    "PuBu_5": ["#f1eef6", "#bdc9e1", "#74a9cf", "#2b8cbe", "#045a8d"],
    "PuBu_6": ["#f1eef6", "#d0d1e6", "#a6bddb", "#74a9cf", "#2b8cbe", "#045a8d"],
    "PuBu_7": ["#f1eef6", "#d0d1e6", "#a6bddb", "#74a9cf", "#3690c0", "#0570b0", "#034e7b"],
    "PuBu_8": ["#fff7fb", "#ece7f2", "#d0d1e6", "#a6bddb", "#74a9cf", "#3690c0", "#0570b0", "#034e7b"],
    "PuBu_9": ["#fff7fb", "#ece7f2", "#d0d1e6", "#a6bddb", "#74a9cf", "#3690c0", "#0570b0", "#045a8d", "#023858"],
    "BuPu_3": ["#e0ecf4", "#9ebcda", "#8856a7"],
    "BuPu_4": ["#edf8fb", "#b3cde3", "#8c96c6", "#88419d"],
    "BuPu_5": ["#edf8fb", "#b3cde3", "#8c96c6", "#8856a7", "#810f7c"],
    "BuPu_6": ["#edf8fb", "#bfd3e6", "#9ebcda", "#8c96c6", "#8856a7", "#810f7c"],
    "BuPu_7": ["#edf8fb", "#bfd3e6", "#9ebcda", "#8c96c6", "#8c6bb1", "#88419d", "#6e016b"],
    "BuPu_8": ["#f7fcfd", "#e0ecf4", "#bfd3e6", "#9ebcda", "#8c96c6", "#8c6bb1", "#88419d", "#6e016b"],
    "BuPu_9": ["#f7fcfd", "#e0ecf4", "#bfd3e6", "#9ebcda", "#8c96c6", "#8c6bb1", "#88419d", "#810f7c", "#4d004b"],
    "RdPu_3": ["#fde0dd", "#fa9fb5", "#c51b8a"],
    "RdPu_4": ["#feebe2", "#fbb4b9", "#f768a1", "#ae017e"],
    "RdPu_5": ["#feebe2", "#fbb4b9", "#f768a1", "#c51b8a", "#7a0177"],
    "RdPu_6": ["#feebe2", "#fcc5c0", "#fa9fb5", "#f768a1", "#c51b8a", "#7a0177"],
    "RdPu_7": ["#feebe2", "#fcc5c0", "#fa9fb5", "#f768a1", "#dd3497", "#ae017e", "#7a0177"],
    "RdPu_8": ["#fff7f3", "#fde0dd", "#fcc5c0", "#fa9fb5", "#f768a1", "#dd3497", "#ae017e", "#7a0177"],
    "RdPu_9": ["#fff7f3", "#fde0dd", "#fcc5c0", "#fa9fb5", "#f768a1", "#dd3497", "#ae017e", "#7a0177", "#49006a"],
    "PuRd_3": ["#e7e1ef", "#c994c7", "#dd1c77"],
    "PuRd_4": ["#f1eef6", "#d7b5d8", "#df65b0", "#ce1256"],
    "PuRd_5": ["#f1eef6", "#d7b5d8", "#df65b0", "#dd1c77", "#980043"],
    "PuRd_6": ["#f1eef6", "#d4b9da", "#c994c7", "#df65b0", "#dd1c77", "#980043"],
    "PuRd_7": ["#f1eef6", "#d4b9da", "#c994c7", "#df65b0", "#e7298a", "#ce1256", "#91003f"],
    "PuRd_8": ["#f7f4f9", "#e7e1ef", "#d4b9da", "#c994c7", "#df65b0", "#e7298a", "#ce1256", "#91003f"],
    "PuRd_9": ["#f7f4f9", "#e7e1ef", "#d4b9da", "#c994c7", "#df65b0", "#e7298a", "#ce1256", "#980043", "#67001f"],
    "OrRd_3": ["#fee8c8", "#fdbb84", "#e34a33"],
    "OrRd_4": ["#fef0d9", "#fdcc8a", "#fc8d59", "#d7301f"],
    "OrRd_5": ["#fef0d9", "#fdcc8a", "#fc8d59", "#e34a33", "#b30000"],
    "OrRd_6": ["#fef0d9", "#fdd49e", "#fdbb84", "#fc8d59", "#e34a33", "#b30000"],
    "OrRd_7": ["#fef0d9", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#990000"],
    "OrRd_8": ["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#990000"],
    "OrRd_9": ["#fff7ec", "#fee8c8", "#fdd49e", "#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"],
    "YlOrRd_3": ["#ffeda0", "#feb24c", "#f03b20"],
    "YlOrRd_4": ["#ffffb2", "#fecc5c", "#fd8d3c", "#e31a1c"],
    "YlOrRd_5": ["#ffffb2", "#fecc5c", "#fd8d3c", "#f03b20", "#bd0026"],
    "YlOrRd_6": ["#ffffb2", "#fed976", "#feb24c", "#fd8d3c", "#f03b20", "#bd0026"],
    "YlOrRd_7": ["#ffffb2", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#b10026"],
    "YlOrRd_8": ["#ffffcc", "#ffeda0", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#b10026"],
    "YlOrRd_9": ["#ffffcc", "#ffeda0", "#fed976", "#feb24c", "#fd8d3c", "#fc4e2a", "#e31a1c", "#bd0026", "#800026"],
    "YlOrBr_3": ["#fff7bc", "#fec44f", "#d95f0e"],
    "YlOrBr_4": ["#ffffd4", "#fed98e", "#fe9929", "#cc4c02"],
    "YlOrBr_5": ["#ffffd4", "#fed98e", "#fe9929", "#d95f0e", "#993404"],
    "YlOrBr_6": ["#ffffd4", "#fee391", "#fec44f", "#fe9929", "#d95f0e", "#993404"],
    "YlOrBr_7": ["#ffffd4", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#8c2d04"],
    "YlOrBr_8": ["#ffffe5", "#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#8c2d04"],
    "YlOrBr_9": ["#ffffe5", "#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506"],
    "Purples_3": ["#efedf5", "#bcbddc", "#756bb1"],
    "Purples_4": ["#f2f0f7", "#cbc9e2", "#9e9ac8", "#6a51a3"],
    "Purples_5": ["#f2f0f7", "#cbc9e2", "#9e9ac8", "#756bb1", "#54278f"],
    "Purples_6": ["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"],
    "Purples_7": ["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#807dba", "#6a51a3", "#4a1486"],
    "Purples_8": ["#fcfbfd", "#efedf5", "#dadaeb", "#bcbddc", "#9e9ac8", "#807dba", "#6a51a3", "#4a1486"],
    "Purples_9": ["#fcfbfd", "#efedf5", "#dadaeb", "#bcbddc", "#9e9ac8", "#807dba", "#6a51a3", "#54278f", "#3f007d"],
    "Blues_3": ["#deebf7", "#9ecae1", "#3182bd"],
    "Blues_4": ["#eff3ff", "#bdd7e7", "#6baed6", "#2171b5"],
    "Blues_5": ["#eff3ff", "#bdd7e7", "#6baed6", "#3182bd", "#08519c"],
    "Blues_6": ["#eff3ff", "#c6dbef", "#9ecae1", "#6baed6", "#3182bd", "#08519c"],
    "Blues_7": ["#eff3ff", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#084594"],
    "Blues_8": ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#084594"],
    "Blues_9": ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b"],
    "Greens_3": ["#e5f5e0", "#a1d99b", "#31a354"],
    "Greens_4": ["#edf8e9", "#bae4b3", "#74c476", "#238b45"],
    "Greens_5": ["#edf8e9", "#bae4b3", "#74c476", "#31a354", "#006d2c"],
    "Greens_6": ["#edf8e9", "#c7e9c0", "#a1d99b", "#74c476", "#31a354", "#006d2c"],
    "Greens_7": ["#edf8e9", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#005a32"],
    "Greens_8": ["#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#005a32"],
    "Greens_9": ["#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#006d2c", "#00441b"],
    "Oranges_3": ["#fee6ce", "#fdae6b", "#e6550d"],
    "Oranges_4": ["#feedde", "#fdbe85", "#fd8d3c", "#d94701"],
    "Oranges_5": ["#feedde", "#fdbe85", "#fd8d3c", "#e6550d", "#a63603"],
    "Oranges_6": ["#feedde", "#fdd0a2", "#fdae6b", "#fd8d3c", "#e6550d", "#a63603"],
    "Oranges_7": ["#feedde", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#8c2d04"],
    "Oranges_8": ["#fff5eb", "#fee6ce", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#8c2d04"],
    "Oranges_9": ["#fff5eb", "#fee6ce", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#a63603", "#7f2704"],
    "Reds_3": ["#fee0d2", "#fc9272", "#de2d26"],
    "Reds_4": ["#fee5d9", "#fcae91", "#fb6a4a", "#cb181d"],
    "Reds_5": ["#fee5d9", "#fcae91", "#fb6a4a", "#de2d26", "#a50f15"],
    "Reds_6": ["#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#de2d26", "#a50f15"],
    "Reds_7": ["#fee5d9", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#99000d"],
    "Reds_8": ["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#99000d"],
    "Reds_9": ["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15", "#67000d"],
    "Greys_3": ["#f0f0f0", "#bdbdbd", "#636363"],
    "Greys_4": ["#f7f7f7", "#cccccc", "#969696", "#525252"],
    "Greys_5": ["#f7f7f7", "#cccccc", "#969696", "#636363", "#252525"],
    "Greys_6": ["#f7f7f7", "#d9d9d9", "#bdbdbd", "#969696", "#636363", "#252525"],
    "Greys_7": ["#f7f7f7", "#d9d9d9", "#bdbdbd", "#969696", "#737373", "#525252", "#252525"],
    "Greys_8": ["#ffffff", "#f0f0f0", "#d9d9d9", "#bdbdbd", "#969696", "#737373", "#525252", "#252525"],
    "Greys_9": ["#ffffff", "#f0f0f0", "#d9d9d9", "#bdbdbd", "#969696", "#737373", "#525252", "#252525", "#000000"],
    "PuOr_3": ["#f1a340", "#f7f7f7", "#998ec3"],
    "PuOr_4": ["#e66101", "#fdb863", "#b2abd2", "#5e3c99"],
    "PuOr_5": ["#e66101", "#fdb863", "#f7f7f7", "#b2abd2", "#5e3c99"],
    "PuOr_6": ["#b35806", "#f1a340", "#fee0b6", "#d8daeb", "#998ec3", "#542788"],
    "PuOr_7": ["#b35806", "#f1a340", "#fee0b6", "#f7f7f7", "#d8daeb", "#998ec3", "#542788"],
    "PuOr_8": ["#b35806", "#e08214", "#fdb863", "#fee0b6", "#d8daeb", "#b2abd2", "#8073ac", "#542788"],
    "PuOr_9": ["#b35806", "#e08214", "#fdb863", "#fee0b6", "#f7f7f7", "#d8daeb", "#b2abd2", "#8073ac", "#542788"],
    "PuOr_10": ["#7f3b08", "#b35806", "#e08214", "#fdb863", "#fee0b6", "#d8daeb", "#b2abd2", "#8073ac", "#542788", "#2d004b"],
    "PuOr_11": ["#7f3b08", "#b35806", "#e08214", "#fdb863", "#fee0b6", "#f7f7f7", "#d8daeb", "#b2abd2", "#8073ac", "#542788", "#2d004b"],
    "BrBG_3": ["#d8b365", "#f5f5f5", "#5ab4ac"],
    "BrBG_4": ["#a6611a", "#dfc27d", "#80cdc1", "#018571"],
    "BrBG_5": ["#a6611a", "#dfc27d", "#f5f5f5", "#80cdc1", "#018571"],
    "BrBG_6": ["#8c510a", "#d8b365", "#f6e8c3", "#c7eae5", "#5ab4ac", "#01665e"],
    "BrBG_7": ["#8c510a", "#d8b365", "#f6e8c3", "#f5f5f5", "#c7eae5", "#5ab4ac", "#01665e"],
    "BrBG_8": ["#8c510a", "#bf812d", "#dfc27d", "#f6e8c3", "#c7eae5", "#80cdc1", "#35978f", "#01665e"],
    "BrBG_9": ["#8c510a", "#bf812d", "#dfc27d", "#f6e8c3", "#f5f5f5", "#c7eae5", "#80cdc1", "#35978f", "#01665e"],
    "BrBG_10": ["#543005", "#8c510a", "#bf812d", "#dfc27d", "#f6e8c3", "#c7eae5", "#80cdc1", "#35978f", "#01665e", "#003c30"],
    "BrBG_11": ["#543005", "#8c510a", "#bf812d", "#dfc27d", "#f6e8c3", "#f5f5f5", "#c7eae5", "#80cdc1", "#35978f", "#01665e", "#003c30"],
    "PRGn_3": ["#af8dc3", "#f7f7f7", "#7fbf7b"],
    "PRGn_4": ["#7b3294", "#c2a5cf", "#a6dba0", "#008837"],
    "PRGn_5": ["#7b3294", "#c2a5cf", "#f7f7f7", "#a6dba0", "#008837"],
    "PRGn_6": ["#762a83", "#af8dc3", "#e7d4e8", "#d9f0d3", "#7fbf7b", "#1b7837"],
    "PRGn_7": ["#762a83", "#af8dc3", "#e7d4e8", "#f7f7f7", "#d9f0d3", "#7fbf7b", "#1b7837"],
    "PRGn_8": ["#762a83", "#9970ab", "#c2a5cf", "#e7d4e8", "#d9f0d3", "#a6dba0", "#5aae61", "#1b7837"],
    "PRGn_9": ["#762a83", "#9970ab", "#c2a5cf", "#e7d4e8", "#f7f7f7", "#d9f0d3", "#a6dba0", "#5aae61", "#1b7837"],
    "PRGn_10": ["#40004b", "#762a83", "#9970ab", "#c2a5cf", "#e7d4e8", "#d9f0d3", "#a6dba0", "#5aae61", "#1b7837", "#00441b"],
    "PRGn_11": ["#40004b", "#762a83", "#9970ab", "#c2a5cf", "#e7d4e8", "#f7f7f7", "#d9f0d3", "#a6dba0", "#5aae61", "#1b7837", "#00441b"],
    "PiYG_3": ["#e9a3c9", "#f7f7f7", "#a1d76a"],
    "PiYG_4": ["#d01c8b", "#f1b6da", "#b8e186", "#4dac26"],
    "PiYG_5": ["#d01c8b", "#f1b6da", "#f7f7f7", "#b8e186", "#4dac26"],
    "PiYG_6": ["#c51b7d", "#e9a3c9", "#fde0ef", "#e6f5d0", "#a1d76a", "#4d9221"],
    "PiYG_7": ["#c51b7d", "#e9a3c9", "#fde0ef", "#f7f7f7", "#e6f5d0", "#a1d76a", "#4d9221"],
    "PiYG_8": ["#c51b7d", "#de77ae", "#f1b6da", "#fde0ef", "#e6f5d0", "#b8e186", "#7fbc41", "#4d9221"],
    "PiYG_9": ["#c51b7d", "#de77ae", "#f1b6da", "#fde0ef", "#f7f7f7", "#e6f5d0", "#b8e186", "#7fbc41", "#4d9221"],
    "PiYG_10": ["#8e0152", "#c51b7d", "#de77ae", "#f1b6da", "#fde0ef", "#e6f5d0", "#b8e186", "#7fbc41", "#4d9221", "#276419"],
    "PiYG_11": ["#8e0152", "#c51b7d", "#de77ae", "#f1b6da", "#fde0ef", "#f7f7f7", "#e6f5d0", "#b8e186", "#7fbc41", "#4d9221", "#276419"],
    "RdBu_3": ["#ef8a62", "#f7f7f7", "#67a9cf"],
    "RdBu_4": ["#ca0020", "#f4a582", "#92c5de", "#0571b0"],
    "RdBu_5": ["#ca0020", "#f4a582", "#f7f7f7", "#92c5de", "#0571b0"],
    "RdBu_6": ["#b2182b", "#ef8a62", "#fddbc7", "#d1e5f0", "#67a9cf", "#2166ac"],
    "RdBu_7": ["#b2182b", "#ef8a62", "#fddbc7", "#f7f7f7", "#d1e5f0", "#67a9cf", "#2166ac"],
    "RdBu_8": ["#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac"],
    "RdBu_9": ["#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#f7f7f7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac"],
    "RdBu_10": ["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#053061"],
    "RdBu_11": ["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#f7f7f7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#053061"],
    "RdGy_3": ["#ef8a62", "#ffffff", "#999999"],
    "RdGy_4": ["#ca0020", "#f4a582", "#bababa", "#404040"],
    "RdGy_5": ["#ca0020", "#f4a582", "#ffffff", "#bababa", "#404040"],
    "RdGy_6": ["#b2182b", "#ef8a62", "#fddbc7", "#e0e0e0", "#999999", "#4d4d4d"],
    "RdGy_7": ["#b2182b", "#ef8a62", "#fddbc7", "#ffffff", "#e0e0e0", "#999999", "#4d4d4d"],
    "RdGy_8": ["#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#e0e0e0", "#bababa", "#878787", "#4d4d4d"],
    "RdGy_9": ["#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#ffffff", "#e0e0e0", "#bababa", "#878787", "#4d4d4d"],
    "RdGy_10": ["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#e0e0e0", "#bababa", "#878787", "#4d4d4d", "#1a1a1a"],
    "RdGy_11": ["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#ffffff", "#e0e0e0", "#bababa", "#878787", "#4d4d4d", "#1a1a1a"],
    "RdYlBu_3": ["#fc8d59", "#ffffbf", "#91bfdb"],
    "RdYlBu_4": ["#d7191c", "#fdae61", "#abd9e9", "#2c7bb6"],
    "RdYlBu_5": ["#d7191c", "#fdae61", "#ffffbf", "#abd9e9", "#2c7bb6"],
    "RdYlBu_6": ["#d73027", "#fc8d59", "#fee090", "#e0f3f8", "#91bfdb", "#4575b4"],
    "RdYlBu_7": ["#d73027", "#fc8d59", "#fee090", "#ffffbf", "#e0f3f8", "#91bfdb", "#4575b4"],
    "RdYlBu_8": ["#d73027", "#f46d43", "#fdae61", "#fee090", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4"],
    "RdYlBu_9": ["#d73027", "#f46d43", "#fdae61", "#fee090", "#ffffbf", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4"],
    "RdYlBu_10": ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee090", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4", "#313695"],
    "RdYlBu_11": ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee090", "#ffffbf", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4", "#313695"],
    "Spectral_3": ["#fc8d59", "#ffffbf", "#99d594"],
    "Spectral_4": ["#d7191c", "#fdae61", "#abdda4", "#2b83ba"],
    "Spectral_5": ["#d7191c", "#fdae61", "#ffffbf", "#abdda4", "#2b83ba"],
    "Spectral_6": ["#d53e4f", "#fc8d59", "#fee08b", "#e6f598", "#99d594", "#3288bd"],
    "Spectral_7": ["#d53e4f", "#fc8d59", "#fee08b", "#ffffbf", "#e6f598", "#99d594", "#3288bd"],
    "Spectral_8": ["#d53e4f", "#f46d43", "#fdae61", "#fee08b", "#e6f598", "#abdda4", "#66c2a5", "#3288bd"],
    "Spectral_9": ["#d53e4f", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#e6f598", "#abdda4", "#66c2a5", "#3288bd"],
    "Spectral_10": ["#9e0142", "#d53e4f", "#f46d43", "#fdae61", "#fee08b", "#e6f598", "#abdda4", "#66c2a5", "#3288bd", "#5e4fa2"],
    "Spectral_11": ["#9e0142", "#d53e4f", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#e6f598", "#abdda4", "#66c2a5", "#3288bd", "#5e4fa2"],
    "RdYlGn_3": ["#fc8d59", "#ffffbf", "#91cf60"],
    "RdYlGn_4": ["#d7191c", "#fdae61", "#a6d96a", "#1a9641"],
    "RdYlGn_5": ["#d7191c", "#fdae61", "#ffffbf", "#a6d96a", "#1a9641"],
    "RdYlGn_6": ["#d73027", "#fc8d59", "#fee08b", "#d9ef8b", "#91cf60", "#1a9850"],
    "RdYlGn_7": ["#d73027", "#fc8d59", "#fee08b", "#ffffbf", "#d9ef8b", "#91cf60", "#1a9850"],
    "RdYlGn_8": ["#d73027", "#f46d43", "#fdae61", "#fee08b", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850"],
    "RdYlGn_9": ["#d73027", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850"],
    "RdYlGn_10": ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee08b", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#006837"],
    "RdYlGn_11": ["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#d9ef8b", "#a6d96a", "#66bd63", "#1a9850", "#006837"],
    "Accent_3": ["#7fc97f", "#beaed4", "#fdc086"],
    "Accent_4": ["#7fc97f", "#beaed4", "#fdc086", "#ffff99"],
    "Accent_5": ["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0"],
    "Accent_6": ["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0", "#f0027f"],
    "Accent_7": ["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0", "#f0027f", "#bf5b17"],
    "Accent_8": ["#7fc97f", "#beaed4", "#fdc086", "#ffff99", "#386cb0", "#f0027f", "#bf5b17", "#666666"],
    "Dark2_3": ["#1b9e77", "#d95f02", "#7570b3"],
    "Dark2_4": ["#1b9e77", "#d95f02", "#7570b3", "#e7298a"],
    "Dark2_5": ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e"],
    "Dark2_6": ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02"],
    "Dark2_7": ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d"],
    "Dark2_8": ["#1b9e77", "#d95f02", "#7570b3", "#e7298a", "#66a61e", "#e6ab02", "#a6761d", "#666666"],
    "Paired_3": ["#a6cee3", "#1f78b4", "#b2df8a"],
    "Paired_4": ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c"],
    "Paired_5": ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99"],
    "Paired_6": ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c"],
    "Paired_7": ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f"],
    "Paired_8": ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00"],
    "Paired_9": ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6"],
    "Paired_10": ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a"],
    "Paired_11": ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a", "#ffff99"],
    "Paired_12": ["#a6cee3", "#1f78b4", "#b2df8a", "#33a02c", "#fb9a99", "#e31a1c", "#fdbf6f", "#ff7f00", "#cab2d6", "#6a3d9a", "#ffff99", "#b15928"],
    "Pastel1_3": ["#fbb4ae", "#b3cde3", "#ccebc5"],
    "Pastel1_4": ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4"],
    "Pastel1_5": ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6"],
    "Pastel1_6": ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc"],
    "Pastel1_7": ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc", "#e5d8bd"],
    "Pastel1_8": ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc", "#e5d8bd", "#fddaec"],
    "Pastel1_9": ["#fbb4ae", "#b3cde3", "#ccebc5", "#decbe4", "#fed9a6", "#ffffcc", "#e5d8bd", "#fddaec", "#f2f2f2"],
    "Pastel2_3": ["#b3e2cd", "#fdcdac", "#cbd5e8"],
    "Pastel2_4": ["#b3e2cd", "#fdcdac", "#cbd5e8", "#f4cae4"],
    "Pastel2_5": ["#b3e2cd", "#fdcdac", "#cbd5e8", "#f4cae4", "#e6f5c9"],
    "Pastel2_6": ["#b3e2cd", "#fdcdac", "#cbd5e8", "#f4cae4", "#e6f5c9", "#fff2ae"],
    "Pastel2_7": ["#b3e2cd", "#fdcdac", "#cbd5e8", "#f4cae4", "#e6f5c9", "#fff2ae", "#f1e2cc"],
    "Pastel2_8": ["#b3e2cd", "#fdcdac", "#cbd5e8", "#f4cae4", "#e6f5c9", "#fff2ae", "#f1e2cc", "#cccccc"],
    "Set1_3": ["#e41a1c", "#377eb8", "#4daf4a"],
    "Set1_4": ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3"],
    "Set1_5": ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00"],
    "Set1_6": ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33"],
    "Set1_7": ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628"],
    "Set1_8": ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628", "#f781bf"],
    "Set1_9": ["#e41a1c", "#377eb8", "#4daf4a", "#984ea3", "#ff7f00", "#ffff33", "#a65628", "#f781bf", "#999999"],
    "Set2_3": ["#66c2a5", "#fc8d62", "#8da0cb"],
    "Set2_4": ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3"],
    "Set2_5": ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854"],
    "Set2_6": ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f"],
    "Set2_7": ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494"],
    "Set2_8": ["#66c2a5", "#fc8d62", "#8da0cb", "#e78ac3", "#a6d854", "#ffd92f", "#e5c494", "#b3b3b3"],
    "Set3_3": ["#8dd3c7", "#ffffb3", "#bebada"],
    "Set3_4": ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072"],
    "Set3_5": ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3"],
    "Set3_6": ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462"],
    "Set3_7": ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69"],
    "Set3_8": ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5"],
    "Set3_9": ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9"],
    "Set3_10": ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd"],
    "Set3_11": ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5"],
    "Set3_12": ["#8dd3c7", "#ffffb3", "#bebada", "#fb8072",
      "#80b1d3", "#fdb462", "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f"],
    "HeatMap 1": ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
  };

  var colorModule = /*#__PURE__*/Object.freeze({
    __proto__: null,
    shadeColor: shadeColor,
    blendColors: blendColors,
    colormap: colormap,
    colormaps: colormaps,
    interpolateCategorical: interpolateCategorical,
    getColormap: getColormap,
    palette: palette
  });

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
  function randomMatrix(spec) {
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
  }
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
  function randomIndexedMatrix(spec) {
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
  }
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
  function randomIndexedIntegerMatrix(spec) {
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
  }
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
  function randomIntegerMatrix(spec) {
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
  }
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
  function identityCsv(spec) {
    var csv = {};
    csv.header = dex.datagen.identityHeader(spec);
    csv.data = dex.datagen.identityMatrix(spec);
    return csv;
  }
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
  function identityMatrix(spec) {
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
  }
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
  function identityHeader(spec) {
    return dex.range(1, spec.columns).map(function (i) {
      return "C" + i;
    });
  }
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
  function usStateInfo(format) {
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
  function salesData(seriesCount=10) {
    let csv = new dex.Csv(['Name', 'Month', 'Sales', 'Extraneous', 'Item'], []);

    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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

  var dataModule = /*#__PURE__*/Object.freeze({
    __proto__: null,
    randomMatrix: randomMatrix,
    randomIndexedMatrix: randomIndexedMatrix,
    randomIndexedIntegerMatrix: randomIndexedIntegerMatrix,
    randomIntegerMatrix: randomIntegerMatrix,
    identityCsv: identityCsv,
    identityMatrix: identityMatrix,
    identityHeader: identityHeader,
    usStateInfo: usStateInfo,
    salesData: salesData
  });

  /**
   *
   * Represents a SpecificationException.  This is thrown when the data
   * supplied to a chart does not match it's requirements.
   *
   * @param {Specification} spec - The specification which has been violated.
   * @param {string} assessment - The reason for the violation.
   *
   */
  function SpecificationException(spec, assessment) {
      this.spec = spec;
      this.assessment = assessment;
      this.name = spec.name;
      this.expected = assessment.expected;
      this.received = assessment.received;
  }

  /**
   *
   * Represents a generic DexException
   *
   * @param {string} message - The exception message.
   *
   */
  function DexException(message) {
      this.message = message;
  }

  var exceptionModule = /*#__PURE__*/Object.freeze({
    __proto__: null,
    SpecificationException: SpecificationException,
    DexException: DexException
  });

  /**
   *
   * This method returns the square distance between two points..
   *
   * @param {Object} p1 Point 1
   * @param {number} p1.x The x location of p1.
   * @param {number} p1.y The y location of p1.
   *
   * @param {Object} p2 Point 2
   * @param {number} p1.x The x location of p2.
   * @param {number} p1.y The y location of p2.
   *
   * @returns {number} The square distance between two points.
   *
   */
  function getSqDist(p1, p2) {
    var dx = p1.x - p2.x,
      dy = p1.y - p2.y;

    return dx * dx + dy * dy;
  }
  /**
   *
   * This method returns the square distance a point p and a segment
   * defined by endpoints s1 and s2.
   *
   * @param {Object} p - The point whose square distance from segment s we
   * are trying to determine.
   * @param {Object} s1 Point 1 defining the segment
   * @param {number} s1.x The x location of s1.
   * @param {number} s1.y The y location of s1.
   *
   * @param {Object} s2 Point 2 defining the segment.
   * @param {number} s1.x The x location of s2.
   * @param {number} s1.y The y location of s2.
   *
   * @returns {number} The square distance between point p and segment s defined by
   * points s1 and s2.
   *
   */
  function getSqSegDist(p, s1, s2) {

    var x = s1.x,
      y = s1.y,
      dx = s2.x - x,
      dy = s2.y - y;

    if (dx !== 0 || dy !== 0) {

      var t = ((p.x - x) * dx + (p.y - y) * dy) / (dx * dx + dy * dy);

      if (t > 1) {
        x = s2.x;
        y = s2.y;

      } else if (t > 0) {
        x += dx * t;
        y += dy * t;
      }
    }

    dx = p.x - x;
    dy = p.y - y;

    return dx * dx + dy * dy;
  }
  function simplifyRadialDist(points, sqTolerance) {

    var prevPoint = points[0],
      newPoints = [prevPoint],
      point;

    for (var i = 1, len = points.length; i < len; i++) {
      point = points[i];

      if (dex.geometry.getSqDist(point, prevPoint) > sqTolerance) {
        newPoints.push(point);
        prevPoint = point;
      }
    }

    if (prevPoint !== point) newPoints.push(point);

    return newPoints;
  }
  function simplifyDPStep(points, first, last, sqTolerance, simplified) {
    var maxSqDist = sqTolerance,
      index;

    for (var i = first + 1; i < last; i++) {
      var sqDist = dex.geometry.getSqSegDist(points[i], points[first], points[last]);

      if (sqDist > maxSqDist) {
        index = i;
        maxSqDist = sqDist;
      }
    }

    if (maxSqDist > sqTolerance) {
      if (index - first > 1) dex.geometry.simplifyDPStep(points, first, index, sqTolerance, simplified);
      simplified.push(points[index]);
      if (last - index > 1) dex.geometry.simplifyDPStep(points, index, last, sqTolerance, simplified);
    }
  }
  function simplifyDouglasPeucker(points, sqTolerance) {
    var last = points.length - 1;

    var simplified = [points[0]];
    dex.geometry.simplifyDPStep(points, 0, last, sqTolerance, simplified);
    simplified.push(points[last]);

    return simplified;
  }
  // both algorithms combined for awesome performance
  function simplify(points, tolerance, highestQuality) {
    if (points.length <= 2) return points;

    var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

    points = highestQuality ? points : dex.geometry.simplifyRadialDist(points, sqTolerance);
    points = dex.geometry.simplifyDouglasPeucker(points, sqTolerance);

    return points;
  }
  function pointInside(point, points) {
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    var x = point[0], y = point[1];

    var inside = false;
    for (var i = 0, j = points.length - 1; i < points.length; j = i++) {
      var xi = points[i][0], yi = points[i][1];
      var xj = points[j][0], yj = points[j][1];

      var intersect = ((yi > y) != (yj > y))
        && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  }
  /**
   *
   * Given an array of points, return an object containing x and y coordinate
   * extents.
   *
   * @param {Object[]} points - An array of points.
   * @param {number} points.x - The x coordinate of the point.
   * @param {number} points.y - The y coordinate of the point.
   *
   * @returns {undefined|{x: {min: *, max: *}, y: {min: *, max: *}}}
   */
  function extents(points) {
    if (points[0] === undefined || points[0][0] === undefined || points[0][1] === undefined) {
      return undefined;
    }

    var extents = {
      x: {min: points[0][0], max: points[0][0]},
      y: {min: points[0][1], max: points[0][1]}
    };

    points.forEach(function (point) {
      if (extents.x.max < point[0]) {
        extents.x.max = point[0];
      }
      if (extents.y.max < point[1]) {
        extents.y.max = point[1];
      }

      if (extents.x.min > point[0]) {
        extents.x.min = point[0];
      }
      if (extents.y.min > point[1]) {
        extents.y.min = point[1];
      }
    });
    return extents;
  }
  function rasterize(points, resolution) {
    var res = resolution || 1.0;
    var extents = dex.geometry.extents(points);
    var x, y;
    var image = [];
    for (y = extents.y.min; y <= extents.y.max; y += res) {
      var scanline = [];
      for (x = extents.x.min; x <= extents.x.max; x += res) {
        scanline.push((dex.geometry.pointInside([x, y], points)) ? 1 : 0);
      }
      image.push(scanline);
    }

    return {
      'image': image,
      'extents': extents,
      'resolution': res
    };
  }
  function maxRect(matrix) {
    /*
     Updates maximal rectangle algorithm cache

     @param int[][] matrix 2d array of 1s / 0s rep. game board
     @param int x current cache column
     @param int[] cache
     */
    function updateCache(matrix, x, cache) {
      for (var y = 0; y < rows; y++)
        if (matrix[x][y] == 1)
          cache[y]++;
        else
          cache[y] = 0;
    }

    var bestUpperLeft = {x: -1, y: -1};
    var bestLowerRight = {x: -1, y: -1};

    var cache = new Array(rows + 1), stack = []; // JS arrays have push and pop. Awesome!
    for (var i = 0; i < cache.length; i++)
      cache[i] = 0;

    for (var x = cols - 1; x >= 0; x--) {
      updateCache(matrix, x, cache);
      var width = 0;
      for (var y = 0; y < rows + 1; y++) {
        if (cache[y] > width) {
          stack.push({y: y, width: width});
          width = cache[y];
        }
        if (cache[y] < width) {
          while (true) {
            var pop = stack.pop();
            var y0 = pop.y, w0 = pop.width;
            if (((width * (y - y0)) > area(bestUpperLeft, bestLowerRight)) && (y - y0 >= minQuadY) && (width >= minQuadX)) {
              bestUpperLeft = {x: x, y: y0};
              bestLowerRight = {x: x + width - 1, y: y - 1};
            }
            width = w0;
            if (cache[y] >= width)
              break;
          }
          width = cache[y];
          if (width != 0)
            stack.push({y: y0, width: w0});
        }
      }
    }
    return {
      x: bestUpperLeft.x,
      y: bestUpperLeft.y,
      lenX: bestLowerRight.x - bestUpperLeft.x + 1,
      lenY: bestLowerRight.y - bestUpperLeft.y + 1,
      area: area(bestUpperLeft, bestLowerRight)
    };
  }
  function getRectangularArea(upperLeft, lowerRight) {
    if (upperLeft.x > lowerRight.x || upperLeft.y > lowerRight.y)
      return 0;
    return ((lowerRight.x + 1) - (upperLeft.x)) * ((lowerRight.y + 1) - (upperLeft.y));
  }

  var geometryModule = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getSqDist: getSqDist,
    getSqSegDist: getSqSegDist,
    simplifyRadialDist: simplifyRadialDist,
    simplifyDPStep: simplifyDPStep,
    simplifyDouglasPeucker: simplifyDouglasPeucker,
    simplify: simplify,
    pointInside: pointInside,
    extents: extents,
    rasterize: rasterize,
    maxRect: maxRect,
    getRectangularArea: getRectangularArea
  });

  function dimensions(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Chart Dimensions",
      "contents": [
        {
          "name": "Height",
          "description": "The height of the chart.",
          "target": ns + "height",
          "type": "int",
          "minValue": 0,
          "maxValue": 2000,
          "initialValue": 600
        },
        {
          "name": "Width",
          "description": "The width of the chart.",
          "target": ns + "width",
          "type": "int",
          "minValue": 0,
          "maxValue": 2000,
          "initialValue": 800
        },
        {
          "name": "Top Margin",
          "description": "The top margin of the chart.",
          "target": ns + "margin.top",
          "type": "int",
          "minValue": 0,
          "maxValue": 500,
          "initialValue": 50
        },
        {
          "name": "Bottom Margin",
          "description": "The bottom margin of the chart.",
          "target": ns + "margin.bottom",
          "type": "int",
          "minValue": 0,
          "maxValue": 500,
          "initialValue": 50
        },
        {
          "name": "Left Margin",
          "description": "Left top margin of the chart.",
          "target": "margin.left",
          "type": "int",
          "minValue": 0,
          "maxValue": 500,
          "initialValue": 50
        },
        {
          "name": "Right Margin",
          "description": "The right margin of the chart.",
          "target": "margin.right",
          "type": "int",
          "minValue": 0,
          "maxValue": 500,
          "initialValue": 50
        },
        {
          "name": "Transform",
          "description": "A transform to be applied to the chart.",
          "target": ns + "transform",
          "type": "string",
          "initialValue": ""
        }
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function margins(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Margins",
      "contents": [
        {
          "name": "Top",
          "description": "The top margin.",
          "target": ns + "top",
          "type": "int",
          "minValue": 0,
          "maxValue": 500,
          "initialValue": 50
        },
        {
          "name": "Bottom",
          "description": "The bottom margin.",
          "target": ns + "bottom",
          "type": "int",
          "minValue": 0,
          "maxValue": 500,
          "initialValue": 50
        },
        {
          "name": "Left",
          "description": "The left margin.",
          "target": "left",
          "type": "int",
          "minValue": 0,
          "maxValue": 500,
          "initialValue": 50
        },
        {
          "name": "Right",
          "description": "The right margin.",
          "target": "right",
          "type": "int",
          "minValue": 0,
          "maxValue": 500,
          "initialValue": 50
        }
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function font(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Font",
      "contents": [
        {
          "name": "Font Size",
          "description": "The size of the font.",
          "target": ns + "size",
          "type": "int",
          "minValue": 1,
          "maxValue": 128,
          "initialValue": 12
        },
        {
          "name": "Font Family",
          "description": "The font family.",
          "target": ns + "family",
          "type": "choice",
          "choices": [
            "serif", "courier", "sans-serif", "times-roman",
            "cursive", "fantasy", "monospace", "arial",
            "Arial Black", "Arial Narrow",
            "Arial Rounded MT Bold",
            "Courier New", "Georgia",
            "Garamond", "Times New Roman",
            "Bookman Old Style",
            "Brush Script MT", "Chalkboard",
            "Didot", "Impact",
            "Lucida Grande", "Lucida Sans Unicode", "Verdana",
            "Helvetica Neue", "Marker Felt",
            "Book Antiqua",
            "Goudy Old Style"
          ].sort(),
          "initialValue": "sans-serif"
        },
        {
          "name": "Font Style",
          "description": "The font style.",
          "target": ns + "style",
          "type": "choice",
          "choices": ["normal", "italic", "oblique", "inherit"],
          "initialValue": "normal"
        },
        {
          "name": "Font Weight",
          "description": "The weight of the font.",
          "target": "weight",
          "type": "choice",
          "choices": ["normal", "bold", "bolder", "lighter", "100", "200", "300", "400", "500",
            "600", "700", "800", "900"],
          "initialValue": "normal"
        },
        {
          "name": "Font Variant",
          "description": "The font variant.",
          "target": "variant",
          "type": "choice",
          "choices": ["normal", "inherit", "small-caps"],
          "initialValue": "normal"
        }
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function textGroup(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Text",
      "contents": [
        dex.config.gui.text(
          dex.object.expandAndOverlay(config.normal, {name: "Text: Normal"}),
          ns + "normal"),
        dex.config.gui.text(
          dex.object.expandAndOverlay(config.emphasis, {name: "Text: Emphasis"}),
          ns + "emphasis")
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function text(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Text",
      "contents": [
        {
          "type": "group",
          "name": "General",
          "contents": [
            {
              "name": "Transform",
              "description": "A transform to be applied to the text.",
              "target": ns + "transform",
              "type": "string",
              "initialValue": ""
            },
            {
              "name": "Format",
              "description": "The text format.",
              "target": ns + "format",
              "type": "string",
              "initialValue": ""
            },
            {
              "name": "Anchor",
              "description": "The text anchor.",
              "target": ns + "anchor",
              "type": "choice",
              "choices": ["middle", "start", "end"],
              "initialValue": "middle"
            },
            {
              "name": "X Offset",
              "description": "The x offset of the text.",
              "target": ns + "dx",
              "type": "int",
              "minValue": -2000,
              "maxValue": 2000,
              "initialValue": 0
            },
            {
              "name": "Y Offset",
              "description": "The y offset of the text.",
              "target": ns + "dy",
              "type": "int",
              "minValue": -2000,
              "maxValue": 2000,
              "initialValue": 0
            },
            {
              "name": "Text Decoration",
              "description": "The text decoration.",
              "target": ns + "decoration",
              "type": "choice",
              "choices": ["none", "underline", "overline", "line-through", "blink", "inherit"],
              "initialValue": "none"
            },
            {
              "name": "Writing Mode",
              "description": "The text writing mode family.",
              "target": ns + "writingMode",
              "type": "choice",
              "choices": ["inherit", "lr-tb", "rl-tb", "tb-rl", "lr", "rl", "tb"],
              "initialValue": "inherit"
            },
            {
              "name": "Text Length",
              "description": "The text length.",
              "target": ns + "textLength",
              "type": "int",
              "minValue": 1,
              "maxValue": 500,
              "initialValue": ""
            },
            {
              "name": "Length Adjust",
              "description": "The text length adjustment.",
              "target": ns + "lengthAdjust",
              "type": "choice",
              "choices": ["", "spacing", "spacingAndGlyphs"],
              "initialValue": ""
            }
          ]
        },
        dex.config.gui.font(config.font || {}, ns + "font"),
        dex.config.gui.fill(config.fill || {}, ns + "fill"),
        dex.config.gui.stroke(config.stroke || {}, ns + "stroke")
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function editableText(config, prefix) {
    var textConfig = dex.config.gui.text(config, prefix);
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    textConfig.contents[0].contents.unshift(
      {
        "name": "Text Contents",
        "description": "The text.",
        "target": ns + "text",
        "type": "string",
        "initialValue": ""
      }
    );
    return textConfig;
  }
  function fill(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Fill",
      "contents": [
        {
          "name": "Fill",
          "description": "The fill color or none.",
          "target": ns + "fillColor",
          "type": "color",
          "colors": ["none", "black", "white", "red", "green",
            "blue", "orange", "yellow", "pink", "gray", "maroon",
            "teal", "cyan", "navy", "steelblue", "olive", "silver"],
          "initialValue": "none"
        },
        {
          "name": "Fill Opacity",
          "description": "The text anchor.",
          "target": ns + "fillOpacity",
          "type": "float",
          "minValue": 0.0,
          "maxValue": 1.0,
          "initialValue": 1.0
        },
        {
          "name": "Fill Rule",
          "description": "The fill color or none.",
          "target": ns + "fillRule",
          "type": "choice",
          "choices": ["nonzero", "evenodd", "inherit"],
          "initialValue": "nonzero"
        }
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function linkGroup(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Links",
      "contents": [
        dex.config.gui.link(
          dex.object.expandAndOverlay(config.normal, {name: "Links: Normal"}),
          ns + "normal"),
        dex.config.gui.link(
          dex.object.expandAndOverlay(config.emphasis, {name: "Links: Emphasis"}),
          ns + "emphasis")
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function link(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Link",
      "contents": [
        dex.config.gui.fill(config.fill || {}, ns + "fill"),
        dex.config.gui.stroke(config.stroke || {}, ns + "stroke")
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function stroke(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Stroke",
      "contents": [
        {
          "name": "Width",
          "description": "The with (in pixels) of the stroke.",
          "target": ns + "width",
          "type": "float",
          "minValue": 0.0,
          "maxValue": 20.0,
          "initialValue": 1.0
        },
        {
          "name": "Color",
          "description": "This control allows the user to select the color by name, or 'none'.",
          "target": ns + "color",
          "type": "choice",
          "choices": ["none", "red", "green", "blue", "black", "white", "yellow",
            "purple", "orange", "pink", "cyan", "steelblue", "grey"],
          "initialValue": "black"
        },
        {
          "name": "Color",
          "description": "The stroke color, this control allows the selection of any color.",
          "target": ns + "color",
          "type": "color"
        },
        {
          "name": "Opacity",
          "description": "The stroke opacity.",
          "target": ns + "opacity",
          "type": "float",
          "minValue": 0.0,
          "maxValue": 1.0,
          "initialValue": 1.0
        },
        {
          "name": "Dash Array",
          "description": "The stroke dash array.",
          "target": ns + "dasharray",
          "type": "string",
          "initialValue": ""
        },
        {
          "name": "transform",
          "description": "The stroke transformation.",
          "target": ns + "transform",
          "type": "string",
          "initialValue": ""
        },
        {
          "name": "Line Cap",
          "description": "The line cap.",
          "target": ns + "lineCap",
          "type": "choice",
          "choices": ["inherit", "butt", "round", "square"],
          "initialValue": "inherit"
        },
        {
          "name": "Line Join",
          "description": "The line join.",
          "target": ns + "lineJoin",
          "type": "choice",
          "choices": ["miter", "round", "bevel", "inherit"],
          "initialValue": "miter"
        },
        {
          "name": "Miter Limit",
          "description": "The miter limit.",
          "target": ns + "miterLimit",
          "type": "float",
          "minValue": 0.0,
          "maxValue": 20.0,
          "initialValue": 4.0
        }
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function general(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "General Options",
      "contents": [
        {
          "name": "Resizable",
          "description": "This determines whether the chart is resizable or not.",
          "target": ns + "resizable",
          "type": "boolean",
          "initialValue": true
        },
        {
          "name": "Draggable",
          "description": "This determines whether the chart is draggable or not.",
          "target": ns + "draggable",
          "type": "boolean",
          "initialValue": false
        }
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function circleGroup(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Circles",
      "contents": [
        dex.config.gui.circle(
          dex.object.expandAndOverlay(config.normal, {name: "Circle: Normal"}),
          ns + "normal"),
        dex.config.gui.circle(
          dex.object.expandAndOverlay(config.emphasis, {name: "Circle: Emphasis"}),
          ns + "emphasis")
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function circle(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Circle",
      "contents": [
        {
          "type": "group",
          "name": "General",
          "contents": [
            {
              "name": "Radius",
              "description": "This determines the radius of the circle.",
              "target": ns + "r",
              "type": "float",
              "minValue": 0,
              "maxValue": 200,
              "initialValue": 5
            },
            {
              "name": "Transform",
              "description": "A transform to be applied to the circle.",
              "target": ns + "transform",
              "type": "string",
              "initialValue": ""
            }
          ]
        },
        dex.config.gui.fill(config.fill || {}, ns + "fill"),
        dex.config.gui.stroke(config.stroke || {}, ns + "stroke")
      ]
    };
    dex.config.gui.fill(config, ns + "fill");
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function pathGroup(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Paths",
      "contents": [
        dex.config.gui.path(
          dex.object.expandAndOverlay(config.normal, {name: "Path: Normal"}),
          ns + "normal"),
        dex.config.gui.path(
          dex.object.expandAndOverlay(config.emphasis, {name: "Path: Emphasis"}),
          ns + "emphasis")
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function path(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Path",
      "contents": [
        dex.config.gui.fill(config.fill || {}, ns + "fill"),
        dex.config.gui.stroke(config.stroke || {}, ns + "stroke")
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function brush(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Brush",
      "contents": [
        {
          "type": "group",
          "name": "Appearance",
          "contents": [
            {
              "name": "Brush Color",
              "type": "color",
              "target": ns + "color",
              "description": "Brush color",
              "intialValue": "steelblue"
            },
            {
              "name": "Brush Opacity",
              "type": "float",
              "target": ns + "opacity",
              "minValue": 0,
              "maxValue": 1,
              "description": "Brush color",
              "intialValue": .8
            },
            {
              "name": "Brush Width",
              "type": "int",
              "description": "Brush Width",
              "target": ns + "width",
              "minValue": 0,
              "maxValue": 30,
              "intialValue": 12
            },
            {
              "name": "Brush X Offset",
              "type": "int",
              "description": "Brush X Offset",
              "target": ns + "x",
              "minValue": -30,
              "maxValue": 30,
              "intialValue": -6
            }
          ]
        },
        dex.config.gui.stroke(config.stroke || {}, ns + "stroke")
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function rectangleGroup(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Rectangles",
      "contents": [
        dex.config.gui.rectangle(
          dex.object.expandAndOverlay(config.normal, {name: "Rectangle: Normal"}),
          ns + "normal"),
        dex.config.gui.rectangle(
          dex.object.expandAndOverlay(config.emphasis, {name: "Rectangle: Emphasis"}),
          ns + "emphasis")
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function rectangle(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Rectangle",
      "contents": [
        {
          "type": "group",
          "name": "General",
          "contents": [
            {
              "name": "Height",
              "description": "This determines the height of the rectangle.",
              "target": ns + "height",
              "type": "float",
              "minValue": 0,
              "maxValue": 200,
              "initialValue": 5
            },
            {
              "name": "Width",
              "description": "This determines the width of the rectangle.",
              "target": ns + "width",
              "type": "float",
              "minValue": 0,
              "maxValue": 200,
              "initialValue": 5
            },
            {
              "name": "X Radius",
              "description": "The x radius.",
              "target": ns + "rx",
              "type": "float",
              "minValue": 0,
              "maxValue": 200,
              "initialValue": 0
            },
            {
              "name": "Y Radius",
              "description": "The y radius.",
              "target": ns + "ry",
              "type": "float",
              "minValue": 0,
              "maxValue": 200,
              "initialValue": 0
            },
            {
              "name": "Transform",
              "description": "A transform to be applied to the rectangle.",
              "target": ns + "transform",
              "type": "string",
              "initialValue": ""
            }
          ]
        },
        dex.config.gui.fill(config.fill || {}, ns + "fill"),
        dex.config.gui.stroke(config.stroke || {}, ns + "stroke")
      ]
    };
    dex.config.gui.fill(config, ns + "fill");
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function c3Margins(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Margins",
      "contents": [
        {
          "name": "Top Margin",
          "description": "The top margin of the chart.",
          "target": ns + "padding.top",
          "type": "int",
          "minValue": 0,
          "maxValue": 200,
          "initialValue": 20
        },
        {
          "name": "Bottom Margin",
          "description": "The bottom margin of the chart.",
          "target": ns + "padding.bottom",
          "type": "int",
          "minValue": 0,
          "maxValue": 200,
          "initialValue": 20
        },
        {
          "name": "Left Margin",
          "description": "The left margin of the chart.",
          "target": ns + "padding.left",
          "type": "int",
          "minValue": 0,
          "maxValue": 200,
          "initialValue": 20
        },
        {
          "name": "Right Margin",
          "description": "The right margin of the chart.",
          "target": ns + "padding.right",
          "type": "int",
          "minValue": 0,
          "maxValue": 200,
          "initialValue": 20
        }
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function c3General(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "General",
      "contents": [
        dex.config.gui.c3Margins(config, prefix),
        {
          "name": "Show Tooltips",
          "description": "If true, show tooltips.",
          "type": "boolean",
          "initialValue": true,
          "target": ns + "tooltip.show"
        },
        {
          "name": "Group Tooltips",
          "description": "If true, group tooltips.",
          "type": "boolean",
          "initialValue": true,
          "target": ns + "tooltip.grouped"
        },
        {
          "name": "Show Subchart",
          "description": "If true, show subchart.",
          "type": "boolean",
          "initialValue": true,
          "target": ns + "subchart.show"
        },
        {
          "name": "Enable Zoom",
          "description": "If true, enable zoom.",
          "type": "boolean",
          "initialValue": true,
          "target": ns + "zoom.enabled"
        },
        {
          "name": "Show Points",
          "description": "If true, show points.",
          "type": "boolean",
          "initialValue": true,
          "target": ns + "point.show"
        },
        {
          "name": "Show Legend",
          "description": "Location of legend.",
          "type": "boolean",
          "initialValue": true,
          "target": ns + "legend.show"
        },
        {
          "name": "Enable Interaction",
          "description": "If true, enable chart interaction.",
          "type": "boolean",
          "initialValue": true,
          "target": ns + "interaction.enabled"
        },
        {
          "name": "Transition Duration",
          "description": "The top margin of the chart.",
          "target": ns + "transition.duration",
          "type": "int",
          "minValue": 0,
          "maxValue": 2000,
          "initialValue": 500
        },
        {
          "name": "Legend Position",
          "description": "Location of legend.",
          "type": "choice",
          "choices": ["right", "bottom", "inset"],
          "initialValue": "right",
          "target": ns + "legend.position"
        },
        {
          "name": "Color Scheme",
          "description": "Color Scheme",
          "type": "choice",
          "choices": dex.color.colormaps({shortlist: true}),
          "target": ns + "colorScheme"
        },
        {
          "name": "Type",
          "description": "Type of chart",
          "type": "choice",
          "choices": ["line", "spline", "area",
            "area-spline", "bar", "scatter", "step", "donut", "pie"],
          "target": ns + "data.type"
        },
        {
          "name": "Stack",
          "description": "Stack items",
          "type": "boolean",
          "initialValue": false,
          "target": ns + "stack"
        }
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  // ECharts configuration:
  function echartsTimeline(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Timeline",
      "contents": [
        // Put symbol in here.
        {
          "name": "Show Timeline",
          "description": "Show or hide the timeline.",
          "target": ns + "show",
          "type": "boolean",
          "initialValue": true
        },
        {
          "name": "Axis Type",
          "description": "The type of axis.",
          "target": ns + "axisType",
          "type": "choice",
          "choices": ["value", "category", "time"],
          "initialValue": "time"
        },
        {
          "name": "Autoplay",
          "description": "Whether to play automatically.",
          "target": ns + "autoPlay",
          "type": "boolean",
          "initialValue": false
        },
        {
          "name": "Rewind",
          "description": "Whether or not to support playing in reverse.",
          "target": ns + "rewind",
          "type": "boolean",
          "initialValue": false
        },
        {
          "name": "Loop",
          "description": "Whether or not to play in a loop.",
          "target": ns + "loop",
          "type": "boolean",
          "initialValue": true
        },
        {
          "name": "Realtime",
          "description": "Whether the view updates in realtime during dragging the control dot.",
          "target": ns + "realtime",
          "type": "boolean",
          "initialValue": true
        },
        {
          "name": "Inverse",
          "description": "Whether to put the timeline component reversely, which makes the elements in the front to be at the end.",
          "target": ns + "inverse",
          "type": "boolean",
          "initialValue": false
        },
        {
          "name": "Play Interval",
          "description": "Play speed, or time between frames (in milliseconds).",
          "target": ns + "playInterval",
          "type": "int",
          "minValue": 200,
          "maxValue": 20000,
          "initialValue": 2000
        },
        {
          "name": "Control Position",
          "description": "Position of the play button.",
          "target": ns + "controlPosition",
          "type": "choice",
          "choices": ["left", "right"],
          "initialValue": "left"
        },
        {
          "name": "Timeline Left Position",
          "description": "Position of the timeline.",
          "target": ns + "left",
          "type": "choice",
          "choices": ["auto", "left", "center", "right"],
          "initialValue": "auto"
        },
        {
          "name": "Timeline Top Position",
          "description": "Position of the timeline.",
          "target": ns + "top",
          "type": "choice",
          "choices": ["auto", "top", "middle", "bottom"],
          "initialValue": "auto"
        },
        {
          "name": "Padding",
          "description": "Timeline space around content.",
          "target": ns + "padding",
          "type": "int",
          "minValue": 0,
          "maxValue": 200,
          "initialValue": 5
        },
        {
          "name": "Orientation",
          "description": "Orientation of the timeline.",
          "target": ns + "orient",
          "type": "choice",
          "choices": ["vertical", "horizontal"],
          "initialValue": "horizontal"
        },
        dex.config.gui.echartsLineStyle(config.lineStyle || {}, ns + "lineStyle"),
        dex.config.gui.echartsLabelGroup(config.label || {}, ns + "label"),
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function echartsGrid(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Grid",
      "contents": [
        {
          "name": "Show Grid",
          "description": "Show or hide grid lines.",
          "target": ns + "show",
          "type": "boolean",
          "initialValue": false
        },
        {
          "name": "Left Margin",
          "description": "Gap between axis name and axis line.",
          "target": ns + "left",
          "type": "int",
          "minValue": 0,
          "maxValue": 400,
          "initialValue": 0
        },
        {
          "name": "Right Margin",
          "description": "Gap between axis name and axis line.",
          "target": ns + "right",
          "type": "int",
          "minValue": 0,
          "maxValue": 400,
          "initialValue": 0
        },
        {
          "name": "Top Margin",
          "description": "Gap between axis name and axis line.",
          "target": ns + "top",
          "type": "int",
          "minValue": 0,
          "maxValue": 400,
          "initialValue": 0
        },
        {
          "name": "Bottom",
          "description": "Gap between axis name and axis line.",
          "target": ns + "bottom",
          "type": "int",
          "minValue": 0,
          "maxValue": 400,
          "initialValue": 0
        },
        {
          "name": "Background Color",
          "description": "The color of the background.",
          "target": ns + "backgroundColor",
          "type": "color",
          "initialValue": "#FFFFFF"
        },
        {
          "name": "Border Color",
          "description": "The color of the border.",
          "target": ns + "borderColor",
          "type": "color",
          "initialValue": "#FFFFFF"
        },
        {
          "name": "Border Width",
          "description": "The border width (in pixels).",
          "target": ns + "borderWidth",
          "type": "int",
          "minValue": 0,
          "maxValue": 200,
          "initialValue": 0
        },
        {
          "name": "Contains Label",
          "description": "Set to true in order to accommodate dynamic label sizes.",
          "target": ns + "containsLabel",
          "type": "boolean",
          "initialValue": false
        },
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function echartsTextStyle(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Text Style",
      "contents": [
        {
          "name": "Text Color",
          "description": "The color of the text.",
          "target": ns + "color",
          "type": "color",
          "initialValue": "#ffffff"
        },
        {
          "name": "Font Style",
          "description": "The color of the text.",
          "target": ns + "fontStyle",
          "type": "choice",
          "choices": ["normal", "italic", "oblique"],
          "initialValue": "normal"
        },
        {
          "name": "Font Weight",
          "description": "The weight of the text.",
          "target": ns + "fontWeight",
          "type": "choice",
          "choices": ["normal", "bold", "bolder", "lighter",
            "100", "200", "300", "400", "500", "600", "700",
            "800", "900"],
          "initialValue": "normal"
        },
        {
          "name": "Font Family",
          "description": "The color of the text.",
          "target": ns + "fontFamily",
          "type": "choice",
          "choices": [
            "sans-serif", "arial", "courier", "courier new",
            "arial narrow", "allegro", "lucidia console",
            "lucida sans", "times", "arial rounded mt bold",
            "monospace"
          ],
          "initialValue": "sans-serif"
        },
        {
          "name": "Font Size",
          "description": "The font family.",
          "target": ns + "fontSize",
          "type": "int",
          "minValue": 0,
          "maxValue": 128,
          "initialValue": 12
        }
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function echartsTooltip(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Tooltips",
      "contents": [
        dex.config.gui.echartsTextStyle(config.textStyle || {}, ns + "textStyle"),
        {
          "name": "Trigger",
          "description": "Whether the tooltip is triggered by axis location or by item.",
          "target": ns + "trigger",
          "type": "choice",
          "choices": ["item", "axis", "none"],
          "initialValue": "item"
        },
        {
          "name": "Formatter",
          "description": "The text format variables {a}-{d}.",
          "target": ns + "formatter",
          "type": "string",
          "initialValue": ""
        },
        {
          "name": "Background Color",
          "description": "The background color of the tooltip.",
          "target": ns + "backgroundColor",
          "type": "color",
          "initialValue": "#FFFFFF"
        },
        {
          "name": "Border Color",
          "description": "The border color of the tooltip.",
          "target": ns + "borderColor",
          "type": "color",
          "initialValue": "#000000"
        },
        {
          "name": "Border Width",
          "description": "The border width.",
          "target": ns + "borderWidth",
          "type": "int",
          "minValue": 0,
          "maxValue": 100,
          "initialValue": 0
        },
        {
          "name": "Padding",
          "description": "The border width.",
          "target": ns + "borderWidth",
          "type": "int",
          "minValue": 0,
          "maxValue": 200,
          "initialValue": 5
        }
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function echartsLabelGroup(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Labels",
      "contents": [
        dex.config.gui.echartsLabel(
          dex.object.expandAndOverlay(config.normal, {name: "Label: Normal"}),
          ns + "normal"),
        dex.config.gui.echartsLabel(
          dex.object.expandAndOverlay(config.emphasis, {name: "Label: Emphasis"}),
          ns + "emphasis")
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function echartsLabel(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Label",
      "contents": [
        dex.config.gui.echartsTextStyle(config.textStyle || {},
          ns + "textStyle"),
        {
          "name": "Show Label",
          "description": "Show or hide the label.",
          "target": ns + "show",
          "type": "boolean",
          "initialValue": false
        },
        {
          "name": "Position",
          "description": "Position of the label.",
          "target": ns + "position",
          "type": "choice",
          "choices": ["top", "left", "right", "bottom",
            "inside", "insideLeft", "insideRight", "insideTop",
            "insideBottom", "insideLeftTop", "insideLeftBottom",
            "insideRightTop", "insideRightBottom"],
          "initialValue": "top"
        },
        {
          "name": "Formatter",
          "description": "Formatter of the label. Ex: none, comma-delimited, succinct",
          "target": ns + "formatter",
          "type": "string",
          "initialValue": ""
        }
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function echartsItemStyleGroup(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Items",
      "contents": [
        dex.config.gui.echartsItemStyle(
          dex.object.expandAndOverlay(config.normal, {name: "Item: Normal"}),
          ns + "normal"),
        dex.config.gui.echartsItemStyle(
          dex.object.expandAndOverlay(config.emphasis, {name: "Item: Emphasis"}),
          ns + "emphasis")
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function echartsItemStyle(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Item Style",
      "contents": [
        {
          "name": "Color",
          "description": "Color.",
          "target": ns + "color",
          "type": "color",
          "initialValue": "#aaaaaa"
        },
        {
          "name": "Border Color",
          "description": "Border color.",
          "target": ns + "borderColor",
          "type": "color",
          "initialValue": "#aaaaaa"
        },
        {
          "name": "Border Type",
          "description": "Border type.",
          "target": ns + "borderType",
          "type": "choice",
          "choices": ["solid", "dashed", "dotted"],
          "initialValue": "solid"
        },
        {
          "name": "Border Width",
          "description": "Border Width.",
          "target": ns + "borderWidth",
          "type": "float",
          "minValue": 0,
          "maxValue": 20,
          "initialValue": 1
        },
        {
          "name": "Shadow Blur",
          "description": "Shadow blur.",
          "target": ns + "shadowBlur",
          "type": "float",
          "minValue": 0,
          "maxValue": 20,
          "initialValue": 0
        },
        {
          "name": "Shadow Color",
          "description": "Shadow color.",
          "target": ns + "shadowColor",
          "type": "color",
          "initialValue": "#ffffff"
        },
        {
          "name": "Shadow Offset X",
          "description": "Offset distance on the horizontal direction of shadow.",
          "target": ns + "shadowOffsetX",
          "type": "float",
          "minValue": -20,
          "maxValue": 20,
          "initialValue": 0
        },
        {
          "name": "Shadow Offset X",
          "description": "Offset distance on the vertical direction of shadow.",
          "target": ns + "shadowOffsetX",
          "type": "float",
          "minValue": -20,
          "maxValue": 20,
          "initialValue": 0
        },
        {
          "name": "Opacity",
          "description": "Opacity.",
          "target": ns + "opacity",
          "type": "float",
          "minValue": 0,
          "maxValue": 1,
          "initialValue": 1
        }
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function echartsSymbol(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Symbols",
      "contents": [
        {
          "name": "Show Symbols",
          "description": "Determines whether or not to symbols.",
          "type": "boolean",
          "target": ns + "showSymbol",
          "initialValue": true
        },
        {
          "name": "Symbol Shape",
          "description": "The shape of the symbol.",
          "type": "choice",
          "choices": ["circle", "rect", "roundRect", "triangle", "diamond", "pin", "arrow"],
          "target": ns + "symbol"
        },
        {
          "name": "Symbol Size",
          "description": "The size of the symbols",
          "type": "int",
          "target": ns + "symbolSize",
          "minValue": 0,
          "maxValue": 50,
          "initialValue": 5
        },
        {
          "name": "Show All Symbols",
          "description": "Determines whether or not to show all symbols.",
          "type": "boolean",
          "target": ns + "showAllSymbol",
          "initialValue": false
        },
        {
          "name": "Symbol Rotate",
          "description": "The rotation of the symbols",
          "type": "int",
          "target": ns + "symbolRotate",
          "minValue": 0,
          "maxValue": 360,
          "initialValue": 0
        }
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function echartsLineStyleGroup(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Items",
      "contents": [
        dex.config.gui.echartsLineStyle(
          dex.object.expandAndOverlay(config.normal, {name: "Line: Normal"}),
          ns + "normal"),
        dex.config.gui.echartsLineStyle(
          dex.object.expandAndOverlay(config.emphasis, {name: "Line: Emphasis"}),
          ns + "emphasis")
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function echartsLineStyle(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Line Style",
      "contents": [
        {
          "name": "Color",
          "description": "Line color.",
          "target": ns + "color",
          "type": "color",
          "initialValue": "#000000"
        },
        {
          "name": "Width",
          "description": "Line Width.",
          "target": ns + "width",
          "type": "float",
          "minValue": 0,
          "maxValue": 10,
          "initialValue": 1
        },
        {
          "name": "Shadow Blur",
          "description": "Shadow blur.",
          "target": ns + "shadowBlur",
          "type": "float",
          "minValue": 0,
          "maxValue": 20,
          "initialValue": 0
        },
        {
          "name": "Shadow Color",
          "description": "Shadow color.",
          "target": ns + "shadowColor",
          "type": "color",
          "initialValue": "#000000"
        },
        {
          "name": "Opacity",
          "description": "Opacity.",
          "target": ns + "opacity",
          "type": "float",
          "minValue": 0,
          "maxValue": 1,
          "initialValue": 1
        },
        {
          "name": "Curveness",
          "description": "Curveness.",
          "target": ns + "curveness",
          "type": "float",
          "minValue": 0,
          "maxValue": 1,
          "initialValue": 0
        }
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function echartsAreaStyle(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Area Style",
      "contents": [
        {
          "name": "Color",
          "description": "Area color.",
          "target": ns + "color",
          "type": "color",
          "initialValue": "#000000"
        },
        {
          "name": "Shadow Blur",
          "description": "Shadow blur.",
          "target": ns + "shadowBlur",
          "type": "float",
          "minValue": 0,
          "maxValue": 20,
          "initialValue": 0
        },
        {
          "name": "Shadow Color",
          "description": "Shadow color.",
          "target": ns + "shadowColor",
          "type": "color",
          "initialValue": "#000000"
        },
        {
          "name": "Opacity",
          "description": "Opacity.",
          "target": ns + "opacity",
          "type": "float",
          "minValue": 0,
          "maxValue": 1,
          "initialValue": 1
        }
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function echartsTitle(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Title",
      "contents": [
        {
          "name": "Text",
          "description": "The text.",
          "target": ns + "text",
          "type": "string",
          "initialValue": ""
        },
        {
          "name": "Sub Text",
          "description": "The subtext.",
          "target": ns + "subtext",
          "type": "string",
          "initialValue": ""
        },
        {
          "name": "Item Gap",
          "description": "The gap between the Text and Subtext.",
          "target": ns + "itemGap",
          "type": "int",
          "minValue": 0,
          "maxValue": 200,
          "initialValue": 10
        },
        {
          "name": "Link",
          "description": "An optional hyperlink.",
          "target": ns + "link",
          "type": "string",
          "initialValue": ""
        },
        {
          "name": "Link Target",
          "description": "A tab target to open hyperlink in.",
          "target": ns + "target",
          "type": "string",
          "initialValue": ""
        },
        {
          "name": "Sub Link",
          "description": "An optional hyperlink.",
          "target": ns + "sublink",
          "type": "string",
          "initialValue": ""
        },
        {
          "name": "Sub Link Target",
          "description": "A tab target to open hyperlink in.",
          "target": ns + "subtarget",
          "type": "string",
          "initialValue": ""
        },
        {
          "name": "Text Alignment",
          "description": "Setting the title text align horizontally, supporting 'left','center','right', the default value is based on the title position.",
          "target": ns + "textAlign",
          "type": "choice",
          "choices": ["left", "center", "right"],
          "initialValue": "center"
        },
        {
          "name": "Text Baseline",
          "description": "Setting the title text align vertically, supporting 'top','middle','bottom', the default value is based on the title position.",
          "target": ns + "textBaseline",
          "type": "choice",
          "choices": ["top", "middle", "bottom"],
          "initialValue": "top"
        },
        {
          "name": "Padding",
          "description": "The padding around the title.",
          "target": ns + "padding",
          "type": "int",
          "minValue": 0,
          "maxValue": 50,
          "initialValue": 5
        },
        {
          "name": "Left",
          "description": "Left offset of the title.",
          "target": ns + "left",
          "type": "int",
          "minValue": 0,
          "maxValue": 1000,
          "initialValue": 20
        },
        {
          "name": "Right",
          "description": "Right offset of the title.",
          "target": ns + "right",
          "type": "int",
          "minValue": 0,
          "maxValue": 1000,
          "initialValue": 20
        },
        {
          "name": "Top",
          "description": "Top offset of the title.",
          "target": ns + "top",
          "type": "int",
          "minValue": 0,
          "maxValue": 1000,
          "initialValue": 20
        },
        {
          "name": "Bottom",
          "description": "Bottom offset of the title.",
          "target": ns + "bottom",
          "type": "int",
          "minValue": 0,
          "maxValue": 1000,
          "initialValue": 20
        },
        // Does not descend a level
        dex.config.gui.echartsItemStyle(config, prefix),
        dex.config.gui.echartsTextStyle(
          dex.object.expandAndOverlay({name: "Text Style"}, config.textStyle),
          ns + "textStyle"),
        dex.config.gui.echartsTextStyle(
          dex.object.expandAndOverlay({name: "Subtext Style"}, config.subtextStyle),
          ns + "subtextStyle")
      ]

    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function echartsAxisLine(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Axis Line",
      "contents": [
        {
          "name": "Show Line",
          "description": "Show or hide the axis line.",
          "target": ns + "show",
          "type": "boolean",
          "initialValue": true
        },
        {
          "name": "On Zero",
          "description": "Specifies whether X or Y axis lies on the other's origin position, where value is 0 on axis.",
          "target": ns + "onZero",
          "type": "boolean",
          "initialValue": true
        },
        dex.config.gui.echartsLineStyle(config.lineStyle || {}, ns + "lineStyle")
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function echartsAxisLabel(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Axis Label",
      "contents": [
        dex.config.gui.echartsLabel(config, prefix),
        {
          "name": "Interval",
          "description": "Interval at which to label ticks.",
          "target": ns + "interval",
          "type": "int",
          "minValue": 0,
          "maxValue": 50,
          "initialValue": 1
        },
        {
          "name": "Inside",
          "description": "Specifies whether the axis label faces Inside.",
          "target": ns + "inside",
          "type": "boolean",
          "initialValue": false
        },
        {
          "name": "Name Rotate",
          "description": "Rotation of labels.",
          "target": ns + "rotate",
          "type": "int",
          "minValue": 0,
          "maxValue": 360,
          "initialValue": 0
        },
        {
          "name": "Margin",
          "description": "The margin of the labels.",
          "target": ns + "margin",
          "type": "int",
          "minValue": 0,
          "maxValue": 200,
          "initialValue": 8
        },
        {
          "name": "Show Min Label",
          "description": "Show the minimum label?",
          "target": ns + "showMinLabel",
          "type": "boolean",
          "initialValue": false
        },
        {
          "name": "Show Max Label",
          "description": "Show the maximum label?",
          "target": ns + "showMaxLabel",
          "type": "boolean",
          "initialValue": false
        },
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function echartsAxisTicks(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Axis Ticks",
      "contents": [
        {
          "name": "Show Ticks",
          "description": "Show or hide the axis ticks.",
          "target": ns + "show",
          "type": "boolean",
          "initialValue": true
        },
        {
          "name": "Align With Label",
          "description": "Align the tick with the label?",
          "target": ns + "alignWithLabel",
          "type": "boolean",
          "initialValue": false
        },
        {
          "name": "Inside",
          "description": "Specifies whether the axis label faces Inside.",
          "target": ns + "inside",
          "type": "boolean",
          "initialValue": false
        },
        {
          "name": "Length",
          "description": "The length (in pixels) of the ticks.",
          "target": ns + "length",
          "type": "int",
          "minValue": 0,
          "maxValue": 50,
          "initialValue": 5
        },
        dex.config.gui.echartsLineStyle(config.lineStyle || {}, ns + "lineStyle")
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function columnDimensions(config, prefix, csv, dimensions) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};

    var defaults = {
      "type": "group",
      "name": "Dimensions",
      "contents": []
    };

    Object.keys(dimensions).forEach(function (dimension) {
      dimensions[dimension] = csv.getColumnName(dimensions[dimension]);

      var name = dimension.charAt(0).toUpperCase() + dimension.slice(1);
      defaults.contents.push({
        "name": name,
        "description": name + " value.",
        "target": ns + dimension,
        "type": "choice",
        "choices": csv.header,
        "initialValue": dimensions[dimension]
      });
    });

    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function echartsAxis(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Axis",
      "contents": [
        {
          "name": "Show Axis",
          "description": "Show or hide the axis.",
          "target": ns + "show",
          "type": "boolean",
          "initialValue": true
        },
        {
          "name": "Data Min",
          "description": "Set axis minimum boundary to the minimum data value.",
          "target": ns + "min",
          "type": "boolean",
          "initialValue": false,
          "filter": function (value) {
            if (value === true) {
              return "dataMin";
            }
            return undefined;
          }
        },
        {
          "name": "Data Max",
          "description": "Set axis maximum boundary to the maximum data value.",
          "target": ns + "max",
          "type": "boolean",
          "initialValue": false,
          "filter": function (value) {
            if (value === true) {
              return "dataMax";
            }
            return undefined;
          }
        },
        {
          "name": "Scale",
          "description": "It specifies whether not to contain zero position of axis compulsively.",
          "target": ns + "scale",
          "type": "boolean",
          "initialValue": false
        },
        {
          "name": "Name",
          "description": "The name of the axis.",
          "target": ns + "name",
          "type": "string",
          "initialValue": ""
        },
        {
          "name": "Name Location",
          "description": "The location of the axis name.",
          "target": ns + "nameLocation",
          "type": "choice",
          "choices": ["start", "middle", "end"],
          "initialValue": "end"
        },
        {
          "name": "Name Gap",
          "description": "Gap between axis name and axis line.",
          "target": ns + "nameGap",
          "type": "int",
          "minValue": 0,
          "maxValue": 200,
          "initialValue": 15
        },
        {
          "name": "Name Rotate",
          "description": "Rotation of axis name.",
          "target": ns + "nameRotate",
          "type": "int",
          "minValue": 0,
          "maxValue": 360,
          "initialValue": 0
        },
        {
          "name": "Name Inverse",
          "description": "Whether to inverse the name or not.",
          "target": ns + "nameInverse",
          "type": "boolean",
          "initialValue": false
        },
        {
          "name": "Split Number",
          "description": "The suggested number of segments that the axis is split into.",
          "target": ns + "splitNumber",
          "type": "int",
          "minValue": 0,
          "maxValue": 50,
          "initialValue": 600
        },
        {
          "name": "Boundary Gap",
          "description": "The boundary gap on both sides of a coordinate axis.",
          "target": ns + "boundaryGap",
          "type": "boolean",
          "initialValue": false
        },
        {
          "name": "Interactive",
          "description": "Set axis to silent (non-interactive) or not.",
          "target": ns + "silent",
          "type": "boolean",
          "initialValue": false
        },
        dex.config.gui.echartsTextStyle(config.textStyle || {}, ns + "nameTextStyle"),
        dex.config.gui.echartsAxisLine(config.axisLine || {}, ns + "axisLine"),
        dex.config.gui.echartsAxisTicks(config.axisTick || {}, ns + "axisTick"),
        dex.config.gui.echartsAxisLabel(
          dex.object.expandAndOverlay({name: "Label"}, config.axisLabel), ns + "axisLabel")
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  function echartsDataZoom(config, prefix) {
    var ns = (typeof prefix !== 'undefined') ? (prefix + ".") : "";
    var userConfig = config || {};
    var defaults = {
      "type": "group",
      "name": "Title",
      "contents": [
        dex.config.gui.echartsTextStyle(config.textStyle || {}, ns + "nameTextStyle"),
        {
          "name": "Show Data Zoom",
          "description": "Show or hide the data zoom.",
          "target": ns + "show",
          "type": "boolean",
          "initialValue": true
        },
        {
          "name": "Zoom Type",
          "description": "The type of data zoom.",
          "target": ns + "type",
          "type": "choice",
          "choices": ["inside", "slider"],
          "initialValue": "slider"
        }
      ]
    };
    return dex.object.expandAndOverlay(userConfig, defaults);
  }
  // Utility functions here:
  function disable(config, field) {
    if (config.type == "group") {
      config.contents.forEach(function (elt, i) {
        if (elt.hasOwnProperty("target") && elt.target == field) {
          delete config.contents[i];
        } else {
          disable(elt, field);
        }
      });
    }

    return config;
  }
  function sync(component, guiDef) {
    if (guiDef.type == "group") {
      guiDef.contents.forEach(function (elt, i) {
        sync(component, elt);
      });
    } else {
      var value = component.get(guiDef.target);
      var valueType = typeof value;
      if (valueType != "undefined" && valueType != "function") {
        guiDef.initialValue = value;
        dex.console.debug("SYNC: " + guiDef.target + "=" +
          chart.attr(guiDef.target));
      }
    }
    return guiDef;
  }

  var guiModule = /*#__PURE__*/Object.freeze({
    __proto__: null,
    dimensions: dimensions,
    margins: margins,
    font: font,
    textGroup: textGroup,
    text: text,
    editableText: editableText,
    fill: fill,
    linkGroup: linkGroup,
    link: link,
    stroke: stroke,
    general: general,
    circleGroup: circleGroup,
    circle: circle,
    pathGroup: pathGroup,
    path: path,
    brush: brush,
    rectangleGroup: rectangleGroup,
    rectangle: rectangle,
    c3Margins: c3Margins,
    c3General: c3General,
    echartsTimeline: echartsTimeline,
    echartsGrid: echartsGrid,
    echartsTextStyle: echartsTextStyle,
    echartsTooltip: echartsTooltip,
    echartsLabelGroup: echartsLabelGroup,
    echartsLabel: echartsLabel,
    echartsItemStyleGroup: echartsItemStyleGroup,
    echartsItemStyle: echartsItemStyle,
    echartsSymbol: echartsSymbol,
    echartsLineStyleGroup: echartsLineStyleGroup,
    echartsLineStyle: echartsLineStyle,
    echartsAreaStyle: echartsAreaStyle,
    echartsTitle: echartsTitle,
    echartsAxisLine: echartsAxisLine,
    echartsAxisLabel: echartsAxisLabel,
    echartsAxisTicks: echartsAxisTicks,
    columnDimensions: columnDimensions,
    echartsAxis: echartsAxis,
    echartsDataZoom: echartsDataZoom,
    disable: disable,
    sync: sync
  });

  class StringInput extends Configuration {
    constructor(config) {
      super(config);
      let base = {
        "name": "name",
        "label": "label",
        "desc": "description",
        "action": undefined,
        "type": "string",
        "initial": ""
      };
      this.underlay(base);
      this.update();
    }

    set(name, value) {
      dex.log("set()");
      super.set(name, value);
      return this.update()
    }

    update() {
      dex.log("update()", this);
      let self = this;
      this.$label = $(`<label class="dex-label">${this.get("name")}:</label>`)
        .attr("title", this.get("desc"));

      this.$input = $(`<input class="dex-string-input" type="text"></input>`)
        .attr("value", this.get("initial"));

      this.$input.on('input', function (event) {
        if (self.isDefined("action")) {
          self.get("action")(event);
        }
      });

      return this;
    }

    setParents(...parent) {
      if (parent && parent.length > 0) {
          this.$label.detach();
          this.$input.detach();

        if (parent.length > 1) {
          let $labelParent = (parent[0] instanceof $) ? parent[0] : $(parent[0]);
          let $inputParent = (parent[1] instanceof $) ? parent[1] : $(parent[1]);
          $labelParent.append(this.$label);
          $inputParent.append(this.$input);
        }
        else {
          let $parent = (parent[0] instanceof $) ? parent[0] : $(parent[0]);
          $parent.append(this.$label);
          $parent.append(this.$input);
        }
      }
      return this;
    }
  }

  class Choice extends Configuration {
    constructor(config) {
      super(config);
      let base = {
        "name": "choice name",
        "label": "choice label",
        "desc": "choice description",
        "action": undefined,
        "choices": ["choice 1", "choice 2", "default choice"],
        "type": "choice",
        "initial": "default choice"
      };
      this.underlay(base);
      this.update();
    }

    set(name, value) {
      dex.log("set()");
      super.set(name, value);
      return this.update()
    }

    update() {
      dex.log("update()", this);
      let self = this;

      this.$label = $(`<label class="dex-label" title="${this.get("desc")}">${this.get("name")}:</label>`);
      this.$select = $(`<select class="dex-config-choice"></select>`);

      this.get("choices").forEach(function (choice) {
        var $option = $("<option></option>")
          .attr("value", choice)
          .text(choice);

        //dex.console.log("COMPARING CHOICE: '" + choice + "' to '", guiDef);
        if (choice === self.get("initial")) {
          $option.attr("selected", "selected");
        }

        self.$select.append($option);
      });

      this.$select.multiselect({
        includeSelectAllOption: true,
        allSelectedText: 'All',
        enableFiltering: true,
        enableFullValueFiltering: true,
        onChange: function toggleOnChange(option, checked, select) {
          dex.log("toggle");
          if (checked) {
            dex.log("Checked");
            if (self.isDefined("action")) {
              self.get("action")(option, checked, select);
            }
          }
          self.$select.multiselect('updateButtonText');
        }
      });

      return this;
    }

    setParents(...parent) {
      if (parent && parent.length > 0) {
        this.$label.detach();
        this.$select.detach();

        if (parent.length > 1) {
          let $labelParent = (parent[0] instanceof $) ? parent[0] : $(parent[0]);
          let $selectParent = (parent[1] instanceof $) ? parent[1] : $(parent[1]);
          $labelParent.append(this.$label);
          $selectParent.append(this.$select);
        } else {
          let $parent = (parent[0] instanceof $) ? parent[0] : $(parent[0]);
          $parent.append(this.$label);
          $parent.append(this.$select);
        }
      }
      this.update();
      return this;
    }
  }

  /**
   *
   * @type {{echartsTextStyle?, textGroup?, columnDimensions?, text?, c3Margins?, editableText?, dimensions?, echartsItemStyle?, echartsAxis?, echartsTitle?, c3General?, margins?, echartsTooltip?, link?, circleGroup?, echartsAxisLine?, rectangle?, disable?, general?, brush?, echartsAxisLabel?, rectangleGroup?, echartsDataZoom?, pathGroup?, fill?, stroke?, echartsLabel?, echartsGrid?, echartsTimeline?, font?, sync?, echartsLabelGroup?, echartsLineStyleGroup?, echartsItemStyleGroup?, echartsAxisTicks?, path?, circle?, echartsLineStyle?, linkGroup?, echartsAreaStyle?, echartsSymbol?}}
   */
  var gui = guiModule;

  var configModule = /*#__PURE__*/Object.freeze({
    __proto__: null,
    gui: gui,
    StringInput: StringInput,
    Choice: Choice
  });

  function readCsv(path) {
    return new dex.promise(function (resolve) {

      d3.csv(path, function (input) {
        var header = Object.keys(input[0]);
        var data = input.map(function (row) {
          var csvRow = header.map(function (col) {
            return row[col];
          });
          return csvRow;
        });

        resolve(new dex.csv(header, data));
      });
    });
  }
  function readTsv(path) {
    return new dex.promise(function (resolve) {

      d3.tsv(path, function (input) {
        var header = Object.keys(input[0]);
        var data = input.map(function (row) {
          var csvRow = header.map(function (col) {
            return row[col];
          });
          return csvRow;
        });

        resolve(new dex.csv(header, data));
      });
    });
  }
  function transformXmlXpath(xpaths) {
    return function (xml) {
      var header = Object.keys(xpaths);
      var csv = new dex.csv(header);

      header.map(function (h) {
        //dex.log("XPATHS[" + h + "] = " + xpaths[h]);
        xpath = xml.evaluate(xpaths[h], xml);
        //dex.log(xpath);
        var xi = 0;
        try {
          var thisNode = xpath.iterateNext();

          while (thisNode) {
            if (!csv.data[xi]) {
              csv.data[xi] = [thisNode.textContent];
            }
            else {
              csv.data[xi].push(thisNode.textContent);
            }
            xi++;
            //dex.log("NODE", thisNode.textContent);
            thisNode = xpath.iterateNext();
          }
        }
        catch (e) {
          alert('Error: Document tree modified during iteration ' + e);
        }
      });
      return csv;
    };
  }
  function transformXmlRows(xml) {
    var xpath = "//row[1]/*";
    var xpaths = {};
    xpath = xml.evaluate(xpath, xml);

    try {
      var thisNode = xpath.iterateNext();

      while (thisNode) {
        //dex.log("NODE", thisNode.localName);
        xpaths[thisNode.localName] = "//row/" + thisNode.localName;
        thisNode = xpath.iterateNext();
      }
    }
    catch (e) {
      alert('Error: Document tree modified during iteration ' + e);
    }

    //dex.log("XPATHS", xpaths);
    return transformXmlXpath(xpaths)(xml);
  }
  function readXml(path, transformer) {
    var transform = transformer || io.transform.xml.rows;

    return new dex.promise(function (resolve) {

      d3.xml(path, function (xml) {
        resolve(transform(xml));
      });
    });
  }
  function readJson(path, transformer) {
    var transform = transformer || function (json) {
      return new dex.csv(json);
    };

    return new dex.promise(function (resolve) {

      d3.json(path, function (json) {
        resolve(transform(json));
      });
    });
  }

  var ioModule = /*#__PURE__*/Object.freeze({
    __proto__: null,
    readCsv: readCsv,
    readTsv: readTsv,
    transformXmlXpath: transformXmlXpath,
    transformXmlRows: transformXmlRows,
    readXml: readXml,
    readJson: readJson
  });

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
  function combine(matrix1, matrix2) {
    var result = dex.matrixCopy(matrix1);

    var ri;

    for (ri = 0; ri < matrix2.length; ri++) {
      result[ri] = result[ri].concat(matrix2[ri]);
    }

    return result;
  }
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
  function copy$1(matrix) {
    var matrixCopy = [];

    matrix.forEach(function (row) {
      matrixCopy.push(dex.array.copy(row));
    });

    return matrixCopy;
  }
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
  function extent$1(matrix, indices) {
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
  }
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
  function flatten(matrix) {
    return [].concat.apply([], matrix);
  }
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
  function slice$1(matrix, columns, rows) {
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
  }
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
  function uniques(matrix, columns) {

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
  }
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
  function transpose(matrix) {
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
  }
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
  function addIndex(matrix) {
    var indexMatrix = dex.matrix.copy(matrix);

    for (var ri = 0; ri < matrix.length; ri++) {
      indexMatrix[ri].unshift(ri + 1);
    }

    return indexMatrix;
  }
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
  function isColumnNumeric(matrix, columnNum) {
    for (var i = 0; i < matrix.length; i++) {
      if (!_.isNumber(matrix[i][columnNum])) {
        return false;
      }
    }
    return true;
  }
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
  function max(matrix, columnNum) {
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
  }
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
  function min(matrix, columnNum) {
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
  }

  var matrixModule = /*#__PURE__*/Object.freeze({
    __proto__: null,
    combine: combine,
    copy: copy$1,
    extent: extent$1,
    flatten: flatten,
    slice: slice$1,
    uniques: uniques,
    transpose: transpose,
    addIndex: addIndex,
    isColumnNumeric: isColumnNumeric,
    max: max,
    min: min
  });

  Function.prototype.clone = function () {
    var fct = this;
    var clone = function () {
      return fct.apply(this, arguments);
    };
    clone.prototype = fct.prototype;
    for (var property in fct) {
      if (fct.hasOwnProperty(property) && property !== 'prototype') {
        clone[property] = fct[property];
      }
    }
    return clone;
  };

  function _clone(obj) {
    return _.cloneDeep(obj)
  }

  function $clone(obj) {
    jQuery.extend(true, {}, obj);
  }

  /**
   *
   * A pretty good, but imperfect mechanism for performing a deep
   * clone of an object.
   *
   * @param obj The object to clone.
   * @returns {*} The cloned object.
   *
   * @memberof dex/object
   *
   */
  function clone(obj) {
    var copy;

    if (obj === undefined || obj === null) {
      return obj;
    }

    // Ducktyped CSV.
    if (obj.data !== undefined && obj.header !== undefined) {
      // Return a full deep copy
      return new dex.Csv(obj);
    }

    if (obj instanceof jQuery) {
      return this.$clone(obj);
    }

    // Handle the 3 simple types, and null or undefined
    //if (null == obj || "object" != typeof obj) return obj;

    switch (typeof obj) {
      case "string":
      case "number":
      case "boolean": {
        copy = obj;
        return copy;
      }
      case "function": {
        return obj.clone();
      }
    }

    //dex.log("OBJ= type(" + typeof obj + "), value('" + obj + "')", obj,
    //  obj instanceof Date, obj instanceof Object, obj instanceof Array);

    // Handle Date
    if (obj instanceof Date) {
      copy = new Date();
      copy.setTime(obj.getTime());
      return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
      copy = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        copy[i] = dex.object.clone(obj[i]);
      }
      return copy;
    }

    // DOM Nodes and dex.js components are only shallow copies.
    if (dex.object.isElement(obj) || dex.object.isNode(obj) || dex.object.isComponent(obj)) {
      return obj;
    }

    // Handle Object
    if (obj instanceof Object) {
      copy = {};
      for (var attr in obj) {
        if (obj.hasOwnProperty(attr)) copy[attr] = dex.object.clone(obj[attr]);
      }
      return copy;
    }

    throw new Error("Error COPYING: obj, type", obj, typeof obj);
  }
  /**
   *
   * Kind of misleading.  This really signals when expand should quit
   * expanding.  I need to clean this up.
   *
   * @param obj
   * @returns {boolean}
   *
   */
  function isEmpty(obj) {
    //dex.log("isEmpty(" + obj + ") typeof=" + (typeof obj));
    if (!obj || obj instanceof Array) {
      return true;
    }
    if ("object" == typeof obj) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          //dex.log("OBJ: ", obj, " contains key '" + key + "'");
          return false;
        }
      }
    }

    return true;
  }
  /**
   *
   * This method returns whether or not the supplied object is a Node.
   *
   * @param {Object} obj - The object to test.
   *
   * @returns {boolean} True if obj is a Node, false otherwise.
   *
   */
  function isNode(obj) {
    return (
      typeof Node === "object" ? obj instanceof Node :
        obj && typeof obj === "object" && typeof obj.nodeType === "number" && typeof obj.nodeName === "string"
    );
  }
  function isComponent(obj) {
    return (obj instanceof dex.Component);
  }
  /**
   *
   * This method returns whether or not the supplied object is a
   * DOM node.
   *
   * @param {Object} obj - The object to test.
   *
   * @returns {boolean} - True if obj is a DOM node, false otherwise.
   *
   */
  function isElement(obj) {
    return (
      typeof HTMLElement === "object" ? obj instanceof HTMLElement : //DOM2
        obj && typeof obj === "object" && obj.nodeType === 1 && typeof obj.nodeName === "string"
    );
  }
  /**
   *
   * This method returns a boolean representing whether obj is contained
   * within container.
   *
   * @param {Object} container - The container to test.
   * @param {Object} obj - The object to test.
   *
   * @return True if container contains obj.  False otherwise.
   *
   */
  function contains(container, obj) {
    var i = container.length;
    while (i--) {
      if (container[i] === obj) {
        return true;
      }
    }
    return false;
  }
  function couldBeADate(obj) {
    //dex.log("dex.object.couldBeADate: " + typeof obj, obj);
    if (typeof obj === "string") {
      try {
        var d = dex.moment(obj);
        if (d == null || !d.isValid() || isNaN(d.getTime())) return false;
      } catch (err) {
        return false;
      }
      return true;
    }
    if (obj instanceof Date) {
      return true;
    }
    return typeof obj == "date";
  }
  function randomString(length = 10, chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
  }

  /**
   *
   * @param {object} obj - The object to evaluate.
   * @returns {boolean} True if numeric, false otherwise.
   *
   */
  function isNumeric(obj) {
    return !isNaN(parseFloat(obj)) && isFinite(obj);
  }

  function getHierarchical(hierarchy, name) {
    //dex.log("getHierarchical", hierarchy, name);
    if ((typeof hierarchy) == "undefined" ||
      (typeof name == "undefined")) {
      return undefined;
    }

    var nsIndex = name.indexOf(".");
    if (nsIndex >= 0) {
      var key = name.substring(0, nsIndex);
      var remainingKey = name.substring(nsIndex + 1);
      //dex.log("NAME: ", key, remainingKey);
      return dex.object.getHierarchical(hierarchy[key], remainingKey);
    } else {
      return hierarchy[name];
    }
  }

  function setHierarchical(hierarchy, name, value, delimiter) {
    if (hierarchy == null) {
      hierarchy = {};
    }

    if (typeof hierarchy != 'object') {
      return hierarchy;
    }

    // Create an array of names by splitting delimiter, then call
    // this function in the 3 argument (Array of paths) context.
    if (arguments.length == 4) {
      return this.setHierarchical(hierarchy,
        name.split(delimiter), value);
    }

    // Array of paths context.
    else {
      // This is the last variable name, just set the value.
      if (name.length === 1) {
        hierarchy[name[0]] = value;
      }
      // We still have to traverse.
      else {
        // Undefined container object, just create an empty.
        if (!(name[0] in hierarchy)) {
          hierarchy[name[0]] = {};
        }

        // Recursively traverse down the hierarchy.
        dex.object.setHierarchical(hierarchy[name[0]], name.splice(1), value);
      }
    }

    return hierarchy;
  }

  /**
   *
   * This routine will take one or more objects and expand each one
   * via dex.object.expand.  The objects will then be overlaid on top
   * of each other.  Objects are supplied in descending precedence;
   * meaning that object conflicts will be resolved by taking the
   * value from the first supplied object defining it within the
   * method call.
   *
   * @returns {object} - A new object representing the expanded
   * and overlaid objects.  The objects supplied in the method
   * call will not be modified.
   *
   * @example
   *
   * Given:
   *
   * var first = {
   *   "name": "first",
   *   "screen.width" : 800
   * };
   *
   * var second = {
   *   "name": "second",
   *   "screen.width": 100,
   *   "screen.height": 600,
   *   "secondField": "Only in 2nd"
   * };
   *
   * var third = {
   *   "name": "third",
   *   "screen.width": 333,
   *   "screen.height": 333,
   *   "thirdField": "Only in 3rd"
   * };
   *
   * Calling:
   *
   * var combined = dex.object.expandAndOverlay(first, second, third);
   *
   * Yields a combined value of:
   *
   * {
   *   "name": "first",
   *   "screen": {
   *     "width": 800,
   *     "height": 600
   *   },
   *   "secondField": "Only in 2nd",
   *   "thirdField" : "Only in 3rd"
   * }
   *
   */
  function expandAndOverlay() {
    switch (arguments.length) {
      case 0: {
        return {};
      }
      case 1: {
        if (arguments[0] === undefined) {
          return {};
        }
        return dex.object.expand(arguments[0]);
      }
      default: {
        var expanded = [];
        var i;
        for (i = 0; i < arguments.length; i++) {
          if (arguments[i] === undefined) {
            expanded.push({});
          } else {
            expanded.push(dex.object.expand(arguments[i]));
          }
        }

        var overlay = dex.object.overlayObject(expanded[expanded.length - 2],
          expanded[expanded.length - 1]);

        for (i = arguments.length - 3; i >= 0; i--) {
          overlay = dex.object.overlayObject(expanded[i], overlay);
        }

        return overlay;
      }
    }
  }

  /**
   *
   * This routine supports a shorthand notation allowing the
   * user to specify deeply nested configuration options without
   * having to deal with nested json structures.
   *
   * @param {Object} cfg The configuration to expand.
   * @returns {Object} An object containing the expanded configuration.
   *   The original configuration is left untouched.
   *
   * @example
   *
   * {
   *   'cell' : {
   *     'rect' : {
   *       'width' : 10,
   *       'height' : 20
   *     }
   *   }
   * }
   *
   * becomes easier to read when expressed as:
   *
   * {
   *   'cell.rect.width'            : 10,
   *   'cell.rect.height'           : 20,
   * }
   *
   */
  function expand(cfg) {
    var ecfg = cfg;
    var name;
    var expanded = {};

    // We have nothing, return nothing.
    if (!ecfg) {
      return undefined;
    }

    for (var name in ecfg) {
      if (ecfg.hasOwnProperty(name)) {
        // Name contains hierarchy:
        if (name && name.indexOf('.') > -1) {
          expanded[name] = ecfg[name];
          dex.object.setHierarchical(expanded, name,
            dex.object.clone(expanded[name]), '.');
          delete expanded[name];
        }
        // Simple name
        else {
          // If the target is an object with no children, clone it.
          if (dex.object.isEmpty(ecfg[name])) {
            //dex.log("SET PRIMITIVE: " + name + "=" + ecfg[name]);
            expanded[name] = dex.object.clone(ecfg[name]);
            //expanded[name] = ecfg[name];
          } else {
            // CSV is a special case.  Older WebKit browsers such as
            // that used by JavaFX can't seem to detect the contructor
            // so i build in a special workaround for any attribute
            // named csv to be copied as-is.
            if (name == "csv") {
              // Link to the old csv.
              expanded[name] = ecfg[name];
              // Allocate an entire new csv.
              //expanded[name] = new dex.csv(ecfg[name]);
            } else if (ecfg[name].constructor !== undefined &&
              ecfg[name].constructor.name === "csv") {
              // Link to old csv:
              expanded[name] = ecfg[name];
              //expanded[name] = new dex.csv(ecfg[name]);
            }
            else if (ecfg[name] instanceof $) {
              expanded[name] = ecfg[name];
            }
            else {
              //dex.log("SET OBJECT: " + name + " to the expansion of", ecfg[name]);
              expanded[name] = dex.object.expand(ecfg[name]);
            }
          }
        }
      }
    }

    ecfg = undefined;
    //dex.log("CONFIG", ecfg, "EXPANDED", expanded);
    return expanded;
  }

  /**
   *
   * Overlay the top object on top of the bottom.  This method will first clone
   * the bottom object.  Then it will drop the values within the top object
   * into the clone.
   *
   * @param {Object} top - The object who's properties will be on top.
   * @param {Object} bottom - The object who's properties will be on bottom.
   * @return {Object} The overlaid object where the properties in top override
   *                  properties in bottom.  The return object is a clone or
   *                  copy.
   *
   * @memberof dex/object
   *
   */
  function overlayObject(top, bottom) {
    // Make a clone of the bottom object.
    var overlay = dex.object.clone(bottom);
    var prop;

    // If we have parameters in the top object, overlay them on top
    // of the bottom object.
    if (top !== 'undefined') {
      // Iterate over the props in top.
      for (prop in top) {
        // Arrays are special cases. [A] on top of [A,B] should give [A], not [A,B]
        if (top[prop] instanceof Array) {
          overlay[prop] = dex.array.copy(top[prop]);
        } else if ((top[prop] !== undefined && top[prop] != null &&
          top[prop].constructor !== undefined &&
          top[prop].constructor.name === "csv")) {
          overlay[prop] = new dex.csv(top[prop]);
        } else if (typeof top[prop] == 'object' && overlay[prop] != null) {
          //console.log("PROP: " + prop + ", top=" + top + ", overlay=" + overlay);
          overlay[prop] = dex.object.overlayObject(top[prop], overlay[prop]);
        }
        // Simply overwrite for simple cases and arrays.
        else {
          overlay[prop] = top[prop];
        }
      }
    }

    //console.dir(config);
    return overlay;
  }
  function getValue(hierarchy, name, defaultValue) {
    return dex.object.getHierarchical(hierarchy, name) || defaultValue;
  }

  var objectModule = /*#__PURE__*/Object.freeze({
    __proto__: null,
    _clone: _clone,
    $clone: $clone,
    clone: clone,
    isEmpty: isEmpty,
    isNode: isNode,
    isComponent: isComponent,
    isElement: isElement,
    contains: contains,
    couldBeADate: couldBeADate,
    randomString: randomString,
    isNumeric: isNumeric,
    getHierarchical: getHierarchical,
    setHierarchical: setHierarchical,
    expandAndOverlay: expandAndOverlay,
    expand: expand,
    overlayObject: overlayObject,
    getValue: getValue
  });

  class GuiPane extends Component {
    constructor(opts) {
      var base = {
        // The parent container of this pane.
        "parent": null,
        "id": "dex-ui-guipane",
        "class": "dex-ui-guipane",
        "targets": []
      };

      super(new dex.Configuration(base).overlay(opts));
      this.componentMap = {};
      this.targetList = {};
      this.controlCounter = 0;
      this.initialize();
    }

    initialize() {
      if (!$.contains(document, this.$root[0])) {
        return this;
      }
      let config = this.config;
      //let $parent = $(config.get("parent"));
      let components = config.get("targets");
      let self = this;
      let $root = this.$root;

      components.forEach(function (component, ci) {
        //dex.logString("COMPONENT[", ci,
        //  "] = parent='", component.get("parent"), "', id='", component.get("id"),
        //  "', class='", component.get("class"), "'");
        self.componentMap[component.getDomTarget()] = component;
      });

      this.addControls($root, components);

      ///////////////////
      // Enable booleans
      ///////////////////
      var $toggles = $root.find('.control-boolean input');
      //dex.log($root.find("input.dex-toggle[initialValue=true]"))
      $root.find("input.dex-toggle[initialValue=true]").prop("checked", true);

      // Collapse everything below the third tier:
      // GUI Config -> Charts -> Main Sections
      $root.find('.depth-1,.depth-2').collapse("show");
      return this;
    }

    update() {
      return this;
    };

    // TODO: Start here, work your way down and componetize everything
    addControls($target, components) {
      // Used to ensure all target names are unique.
      let config = this.config;
      this.targetList = {};
      var self = this;

      let $guiTitle = $(`<div class="dex-h1 text-center" data-toggle='collapse'
 data-target='#dex-ui-guipane-body'>Gui Configuration</div>`);
      let $guiDiv = $(`<div id="dex-ui-guipane-body" class="collapse depth-1"></div>`);
      let $guiTable = $(`<table class="dex-control-table"></table>`);
      let $guiBody = $(`<tbody></tbody>`);

      $guiDiv.append($guiTable);
      $guiTable.append($guiBody);
      $target.append($guiTitle);
      $target.append($guiDiv);

      config.get("targets").forEach(function (component) {
        let target = component.getDomTarget();
        if (target !== undefined) {
          self.addControl(target, $guiBody, component.getGuiDefinition(), 1);
        }
      });

      return this;
    }

    getTargetName(name) {
      let targetList = this.targetList;

      var targetName = name.replace(/[\. >\(\)#:]/g, '_');
      //dex.console.log("NAME(" + name + ")->" + targetName);
      if (targetList[targetName] === undefined) {
        targetList[targetName] = 1;
      } else {
        targetList[targetName]++;
      }

      return targetName + "-" + targetList[targetName];
    }

    addControl(targetComponent, $targetElt, guiDef, depth) {

      if (guiDef === undefined || guiDef.type === undefined) {
        return;
      }

      switch (guiDef.type) {
        case "group" :
          this.addGroup(targetComponent, $targetElt, guiDef, depth + 1);
          break;
        case "string" :
          this.addString(targetComponent, $targetElt, guiDef, depth);
          break;
        case "float" :
          this.addFloat(targetComponent, $targetElt, guiDef, depth);
          break;
        case "int" :
          this.addInt(targetComponent, $targetElt, guiDef, depth);
          break;
        case "boolean" :
          this.addBoolean(targetComponent, $targetElt, guiDef, depth);
          break;
        case "choice" :
          this.addChoice(targetComponent, $targetElt, guiDef, depth);
          break;
        case "multiple-choice" :
          this.addMultipleChoice(targetComponent, $targetElt, guiDef, depth);
          break;
        case "color" :
          this.addColor(targetComponent, $targetElt, guiDef, depth);
          break;
      }
      return this;
    }

    addGroup(targetComponent, $targetElt, guiDef, depth) {
      var groupTarget = this.getTargetName(
        targetComponent + ":" + guiDef.name);
      var self = this;

      let $row = $(`<tr></tr>`);
      let $groupTitle = $(`<tr><td colspan="2"><div class="dex-h${depth} "
 data-toggle='collapse' data-target='#${groupTarget}'>${guiDef.name}</div></td></tr>`);

      let $groupRow = $(`<tr id="${groupTarget}" class="depth-${depth} collapse"></tr>`);
      let $groupCol = $(`<td colspan="2"></td>`);
      let $groupDiv = $(`<div></div>`);
      let $groupTable = $(`<table class="dex-control-table"></table>`);

      $groupDiv.append($groupTable);
      $groupCol.append($groupDiv);
      $groupRow.append($groupCol);
      $targetElt.append($groupTitle);
      $targetElt.append($groupRow);

      guiDef.contents.forEach(function (contentDef) {
        self.addControl(targetComponent, $groupTable, contentDef, depth);
      });
    }

    createRow($left, $right) {
      let $row = $(`<tr></tr>`);
      let $leftCol = $(`<td class="left-column"></td>`);
      let $rightCol = $(`<td class="right-column"></td>`);
      $leftCol.append($left);
      $rightCol.append($right);
      $row.append($leftCol);
      $row.append($rightCol);
      return $row
    }

    addColor(targetComponent, $targetElt, guiDef, depth) {
      let self = this;

      let $label = $(`<label class="dex-label col-lg-4"></label>`)
        .attr("title", guiDef.description)
        .html(guiDef.name + ":");
      let $picker = $(`<input class="dex-ui-guipane-colorpicker col-lg-8" type=""color"></input>`)
        .attr("value", guiDef.initialValue)
        .attr("targetAttribute", guiDef.target)
        .attr("targetComponent", targetComponent);

      $targetElt.append(this.createRow($label, $picker));

      $picker.spectrum({
        showPalette: true,
        showAlpha: true,
        palette: [
          ["rgb(0, 0, 0)", "rgb(67, 67, 67)", "rgb(102, 102, 102)", /*"rgb(153, 153, 153)","rgb(183, 183, 183)",*/
            "rgb(204, 204, 204)", "rgb(217, 217, 217)", /*"rgb(239, 239, 239)", "rgb(243, 243, 243)",*/ "rgb(255, 255, 255)"],
          ["rgb(152, 0, 0)", "rgb(255, 0, 0)", "rgb(255, 153, 0)", "rgb(255, 255, 0)", "rgb(0, 255, 0)",
            "rgb(0, 255, 255)", "rgb(74, 134, 232)", "rgb(0, 0, 255)", "rgb(153, 0, 255)", "rgb(255, 0, 255)"],
          ["rgb(230, 184, 175)", "rgb(244, 204, 204)", "rgb(252, 229, 205)", "rgb(255, 242, 204)", "rgb(217, 234, 211)",
            "rgb(208, 224, 227)", "rgb(201, 218, 248)", "rgb(207, 226, 243)", "rgb(217, 210, 233)", "rgb(234, 209, 220)",
            "rgb(221, 126, 107)", "rgb(234, 153, 153)", "rgb(249, 203, 156)", "rgb(255, 229, 153)", "rgb(182, 215, 168)",
            "rgb(162, 196, 201)", "rgb(164, 194, 244)", "rgb(159, 197, 232)", "rgb(180, 167, 214)", "rgb(213, 166, 189)",
            "rgb(204, 65, 37)", "rgb(224, 102, 102)", "rgb(246, 178, 107)", "rgb(255, 217, 102)", "rgb(147, 196, 125)",
            "rgb(118, 165, 175)", "rgb(109, 158, 235)", "rgb(111, 168, 220)", "rgb(142, 124, 195)", "rgb(194, 123, 160)",
            "rgb(166, 28, 0)", "rgb(204, 0, 0)", "rgb(230, 145, 56)", "rgb(241, 194, 50)", "rgb(106, 168, 79)",
            "rgb(69, 129, 142)", "rgb(60, 120, 216)", "rgb(61, 133, 198)", "rgb(103, 78, 167)", "rgb(166, 77, 121)",
            /*"rgb(133, 32, 12)", "rgb(153, 0, 0)", "rgb(180, 95, 6)", "rgb(191, 144, 0)", "rgb(56, 118, 29)",
            "rgb(19, 79, 92)", "rgb(17, 85, 204)", "rgb(11, 83, 148)", "rgb(53, 28, 117)", "rgb(116, 27, 71)",*/
            "rgb(91, 15, 0)", "rgb(102, 0, 0)", "rgb(120, 63, 4)", "rgb(127, 96, 0)", "rgb(39, 78, 19)",
            "rgb(12, 52, 61)", "rgb(28, 69, 135)", "rgb(7, 55, 99)", "rgb(32, 18, 77)", "rgb(76, 17, 48)"]
        ],
        showSelectionPalette: true,
        clickoutFiresChange: true,
        showInitial: false,
        //palette: dex.color.palette['crayola120'],
        change: function (color) {
          //dex.console.log("COLOR-CHANGE", color, this);
          //$("#basic-log").text("change called: " + color.toHexString());
          var cmp = self.componentMap[this.getAttribute("targetComponent")];
          var attName = this.getAttribute("targetAttribute");
          var value = color.toHexString();
          if (cmp != undefined) {
            cmp.set(attName, value);
            cmp.save(attName, value);
            cmp.update();
          }
        }
      });
    }

    addChoice(targetComponent, $targetElt, guiDef, depth) {
      let self = this;

      self.controlCounter++;
      let id = self.controlCounter;

      let $label = $(`<label class="dex-label" title="${guiDef.description}">${guiDef.name}:</label>`);
      let $select = $(`<div class="dex-h3" id="dex-guipane-choice-${id}"></div>`);

      $targetElt.append(this.createRow($label, $select));
      var listSelector = new dex.ui.ListSelector({
        parent: `#dex-guipane-choice-${id}`,
        id: `dex-guipane-choice-selector-${id}`,
        name: guiDef.name,
        items: guiDef.choices,
        selectAll: false,
        multiple: false,
        selected : [ guiDef.initialValue ]
      }).render();

      dex.bus.subscribe(listSelector, "select", function(msg) {
        //dex.log("MSG", msg)
        var cmp = self.componentMap[targetComponent];

        if (cmp != undefined) {
          //dex.log("set-choice", cmp, attName, option.attr("value"))
          cmp.set(guiDef.target, msg.selected).update();
        }
      });
    }

    addMultipleChoice(targetComponent, $targetElt, guiDef, depth) {
      let self = this;

      self.controlCounter++;
      let id = self.controlCounter;

      let $label = $(`<label class="dex-label" title="${guiDef.description}">${guiDef.name}:</label>`);
      let $select = $(`<div class="dex-h3" id="dex-guipane-multi-choice-${id}"></div>`);

      $targetElt.append(this.createRow($label, $select));
      var listSelector = new dex.ui.ListSelector({
        parent: `#dex-guipane-multi-choice-${id}`,
        id: `dex-guipane-multi-choice-selector-${id}`,
        name: guiDef.name,
        items: guiDef.choices,
        selectAll: false,
        multiple: true,
        selected : [ guiDef.initialValue ]
      }).render();

      dex.bus.subscribe(listSelector, "select", function(msg) {
        //dex.log("MSG", msg)
        var cmp = self.componentMap[targetComponent];

        if (cmp != undefined) {
          //dex.log("set-choice", cmp, attName, option.attr("value"))
          cmp.set(guiDef.target, msg.selected).update();
        }
      });
    }

    addBoolean(targetComponent, $targetElt, guiDef, depth) {

      let $label = $(`<label class="dex-label"></label>`)
        .attr("title", guiDef.description)
        .html(guiDef.name + ":");
      let $switch = $(`<label class="switch"></label>`);
      let $input = $(`<input class="dex-toggle" type="checkbox"></input>`);
      let $span = $(`<span class="slider round"></span>`);
      $switch.append($input);
      $switch.append($span);

      $targetElt.append(this.createRow($label, $switch));

      if (guiDef.initialValue !== undefined) {
        $input.attr("initialValue", guiDef.initialValue);
      }

      var handler = function (cmp, guiDef) {
        return function () {
          var obj = $(this);
          var value = obj.prop('checked');
          //dex.log("boolean-handler", cmp, guiDef, obj, value)
          if (typeof guiDef.filter === "function") {
            value = guiDef.filter(value);
          }
          if (cmp != undefined) {
            cmp.set(guiDef.target, value);
            cmp.update();
          }
        }
      }(this.componentMap[targetComponent], guiDef);

      //$input.bootstrapToggle({
      //  on: "Yes",
      //  off: "No",
      //  onstyle: "primary",
      //  offstyle: "danger",
      //  width: 40,
      //  height: 25
      //});
      $input.change(handler);
    }

    addString(targetComponent, $targetElt, guiDef, depth) {

      let self = this;
      let $label = $(`<label class="dex-label">${guiDef.name}:</label>`)
        .attr("title", guiDef.description);

      let $input = $(`<input class="dex-string-input" type="text"></input>`)
        .attr("targetAttribute", guiDef.target)
        .attr("targetComponent", targetComponent)
        .attr("value", guiDef.initialValue)
        .attr("id", guiDef.target);

      $targetElt.append(this.createRow($label, $input));

      $input.on('input', function (event) {
        var cmp = self.componentMap[event.target.getAttribute("targetComponent")];
        var attName = event.target.getAttribute("targetAttribute");
        if (cmp != undefined) {
          //dex.log("cmp-set", cmp, attName, event.target.value)
          cmp.set(attName, event.target.value);
          cmp.update();
        }
      });
    }

    addFloat(targetComponent, $targetElt, guiDef, depth) {
      let self = this;

      let $label = $(`<tr><td colspan="2">
<label class="dex-label" title="${guiDef.description}">${guiDef.name}</label>
</td></tr>`);

      let $sliderRow = $(`<tr></tr>`);
      let $sliderCol = $(`<td colspan="2"></td>`);

      $sliderRow.append($sliderCol);

      $targetElt.append($label);
      $targetElt.append($sliderRow);

      var floatSlider = new dex.ui.Slider({
        parent: $sliderCol,
        min: guiDef.minValue,
        max: guiDef.maxValue,
        target: guiDef.target,
        targetComponent: targetComponent,
        step: guiDef.step,
        initial: guiDef.initialValue,
        onFinish: function (data) {
          //dex.log("setting " + guiDef.target + " to " + data.from)
          self.componentMap[targetComponent].set(guiDef.target, data.from).update();
        }
      });
    }

    addInt(targetComponent, $targetElt, guiDef, depth) {
      this.addFloat(targetComponent, $targetElt, guiDef, depth);
    }
  }

  class DataFilterPane extends Component {

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
      this.initialize();
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
          component.set("csv", event.csv);
          component.update();
        });
      });

      let $dfpTitle = $(`<div class="dex-h1 text-center" data-toggle='collapse'
 data-target='#dex-ui-dfp-body'>Filters</div>`);
      let $dfpDiv = $(`<div id="dex-ui-dfp-body" class="collapse depth-1"></div>`);
      let $dfpTable = $(`<table class="dex-control-table"></table>`);
      let $dfpBody = $(`<tbody></tbody>`);

      $dfpDiv.append($dfpTable);
      $dfpTable.append($dfpBody);

      $root.append($dfpTitle);
      $root.append($dfpDiv);

      var dataTypes = csv.guessTypes();
      var categoryFilters = this.createCategoryFilters($dfpBody, dataTypes);
      var numericFilters = this.createNumericFilters($dfpBody, dataTypes);

      $root.find('.depth-1,.depth-2').collapse("show");
      return this;
    }

    createCategoryFilters($parent, dataTypes) {
      var categoryFilters = [];
      let self = this;
      let csv = this.get("csv");

      if (dataTypes.includes("string")) {
        let $catRow = $("<tr></tr>");
        let $catCell = $("<td></td>");
        let $catTitle = $(`<tr><td><div class="dex-h2 text-center" data-toggle="collapse"
      data-target="#dex-cat-filters">Categorical Filters</div></tr></td>`);

        let $filters = $("<div id='dex-cat-filters' class='collapse depth-2'></div>");

        $catCell.append($filters);
        $catRow.append($catCell);

        $parent.append($catTitle);
        $parent.append($catRow);

        let stringIndexes = dex.array.findIndexes(dataTypes,
          function (elt) {
            return elt === "string"
          });

        //dex.log("STRING LOCATIONS:", stringIndexes)

        stringIndexes.forEach(function (index) {
          $filters.append(`<div class="dex-h3" id="dex-dfp-cat-filter-${index}"></div>`);
          var listSelector = new dex.ui.ListSelector({
            parent: `#dex-dfp-cat-filter-${index}`,
            id: `dex-dfp-cat-filter-list-selector-${index}`,
            name: csv.header[index],
            items: csv.unique(index),
            selectAll: true
          });
          categoryFilters.push(listSelector);

          dex.bus.subscribe(listSelector, "select", function (msg) {
            //dex.log("MSG", msg)
            self.selectedCategoryValues[csv.header[index]] = msg.selected;
            self.updateCsv();
          });
        });
      }

      categoryFilters.forEach(function (filter) {
          filter.render();
        }
      );

      return categoryFilters
    }

    createNumericFilters($parent, dataTypes) {
      var numericFilters = [];
      let self = this;

      if (dataTypes.includes("number")) {
        //dex.log("NUMBERS INCLUDED")
        let $numRow = $("<tr></tr>");
        let $numCell = $("<td></td>");
        let $numTitle = $(`<tr><td><div class="dex-h2 text-center" data-toggle="collapse"
      data-target="#dex-num-filters">Numeric Filters</div></tr></td>`);

        let $filters = $("<div id='dex-num-filters' class='collapse depth-2'></div>");

        $numCell.append($filters);
        $numRow.append($numCell);

        $parent.append($numTitle);
        $parent.append($numRow);

        let numberIndexes = dex.array.findIndexes(dataTypes,
          function (elt) {
            return elt === "number"
          });

        //dex.log("NUMBER LOCATIONS:", numberIndexes)

        numberIndexes.forEach(function (index) {
          $filters.append('<div>' + csv.header[index] + '</div>');
          $filters.append(`<div class="dex-ui-slider-parent" id="dex-dfp-num-filter-${index}"></div>`);
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
              self.selectedRanges[csv.header[index]] = {min: data.from, max: data.to};
              self.updateCsv();
            }
          }));
        });
      }

      numericFilters.forEach(function (filter) {
          filter.render();
        }
      );

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

      dex.log("Selected Csv", selectedCsv);

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

  class ConfigurationPane extends Component {
    constructor(opts) {
      var base = {
        // The parent container of this pane.
        "parent": null,
        "id": "dex-ui-configpane",
        "class": "dex-ui-configpane",
        "targets" : [],
        "csv": undefined
      };

      super(new dex.Configuration(base).overlay(opts));
      this.initialize();
      // Default filters: everything is selected
      this.selectedColumns = this.config.get("csv").header;
      this.filteredCsv = new dex.Csv(this.get("csv"));
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

      var configLayoutPane = new dex.ui.LayoutPane({
        parent: $root,
        id: "config",
        layout: {north: { size: '33%'}, south: { size: '33%' }}
      });
      configLayoutPane.render();

      var columnSelector = new dex.ui.ColumnSelector({
        parent: "#config>#north",
        id: "column-selector",
        csv: csv
      });
      columnSelector.render();

      self.subscribe(columnSelector, "select", function(event) {
        self.selectedColumns = event.csv.header;
        var targetCsv = self.filteredCsv.include(self.selectedColumns);
        targets.forEach(function(target) {
          target.set("csv", targetCsv).update();
        });
      });

      var dataFilterPane = new dex.ui.DataFilterPane({
        parent: "#config>#center",
        id: "data-filter",
        csv: csv
      });

      self.subscribe(dataFilterPane, "select", function(event) {
        self.filteredCsv = event.csv;
        var targetCsv = self.filteredCsv.include(self.selectedColumns);

        targets.forEach(function(target) {
          target.set("csv", targetCsv).update();
        });
      });

      var guiPane = new dex.ui.GuiPane({
        parent: "#config>#south",
        id: "gui-pane",
        csv: csv,
        targets: targets
      });

      dataFilterPane.render();
      guiPane.render();
    }

    update() {
      return this;
    };

  }

  class ColumnSelector extends Component {

    constructor(opts) {
      var base = {
        // The parent container of this pane.
        "parent": null,
        "id": "dex-ui-column-selector",
        "class": "dex-ui-column-selector",
        "targets": [],
        "csv": undefined
      };

      super(new dex.Configuration(base).overlay(opts));
      this.initialize();
    }

    initialize() {
      // If the chart isn't attached to the dom, just return.
      if (!$.contains(document, this.$root[0])) {
        return this;
      }

      let config = this.config;
      // Replace with root
      //let $parent = $(config.get("parent"));
      let $root = this.$root;
      let csv = config.get("csv");
      let self = this;
      //$parent.empty();

      let targets = config.get("targets");

      // Add each component as a subscriber
      targets.forEach(function (component) {
        component.subscribe(self.getChannel(), "select", function (event) {
          component.set("csv", event.csv);
          component.update();
        });
      });

      var content = `<div class="dex-cs-center">
  <div class="alert dex-xs-alert alert-success text-center" role="alert">
    Selected
  </div>
  <div id="ColumnSelectorDest"></div>
</div>
<div class="dex-cs-east">
  <div class="alert dex-xs-alert alert-primary text-center" role="alert">
    Omitted
  </div>
  <div id="ColumnSelectorSource"></div>
</div>`;

      var types = csv.guessTypes();
      $root.append(content);

      var $source = $root.find('#ColumnSelectorSource');
      var $dest = $root.find('#ColumnSelectorDest');

      let buttonText = "";
      csv.header.forEach(function (h, hi) {
        let buttonType = 'btn-primary';
        switch (types[hi]) {
          case "date" : {
            buttonType = 'btn-secondary';
            break
          }
          case "string" : {
            buttonType = 'btn-primary';
            break;
          }
          case "number" : {
            buttonType = 'btn-success';
            break;
          }
          default : {
            buttonType = 'btn-primary';
          }
        }
        buttonText = `<button type='button' class='dex-xs-btn btn btn-block ${buttonType}'>${h}</button>`;
        let $button = $(buttonText);
        $button.click(function (event) {
          // On click, remove the element from the current list and
          // add it to the seconde list.
          if ("ColumnSelectorDest" === event.currentTarget.parentElement.id) {
            // Move from dest to source
            event.currentTarget.parentElement.removeChild(event.currentTarget);
            $source.append(event.currentTarget);
          }
          else {
            // Move from source to dest
            event.currentTarget.parentElement.removeChild(event.currentTarget);
            $dest.append(event.currentTarget);
          }
          // Query the selected columns (aka button names)
          // Send a message to listeners to update their data
          let selected = $dest.find("button").map(function () {
            return $(this).text();
          }).get();
          var selectedCsv = csv.include(selected);
          self.publish("select", {
            csv: selectedCsv
          });
        });
        $dest.append($button);
      });

      var drake = dragula([$source[0], $dest[0]], {
        copy: false
      });

      drake.on('drop', function (el, target, source, sibling) {
        let selected = $dest.find("button").map(function () {
          return $(this).text();
        }).get();
        var selectedCsv = csv.include(selected);
        self.publish("select", {
          csv: selectedCsv
        });
      });

      $root.layout({
        center__paneSelector: ".dex-cs-center",
        east__paneSelector: ".dex-cs-east"
      });

      return this;
    }

    update() {
      return this;
    };

  }

  /**
   *
   * This component will create the specified layout.
   *
   */
  class LayoutPane extends Component {
    /**
     *
     * Construct the layout.
     *
     * @param {Object} opts - The layout pane options.
     * @param {jQuery|string} [opts.parent] - A string containing a pointer to an
     * HTML element or a jquery selection doing the same.  If this parameter is not
     * supplied, the component will attempt to attach to the document's body DOM
     * element.
     * @param {string} [opts.id] - The id of the top level DOM element of this
     * Component.  Default value is "dex-ui-layout"
     * @param {string} [opts.class] - The class of the top level DOM element of
     * this component.  Default value is "dex-ui-layout".
     * @param {Object} [opts.layout] - The layout parameters of this component.
     * @param {boolean} [opts.layout.resizable] - If true, allow this layout to
     * be resized.  Otherwise don't.  Default = true.
     *
     */
    constructor(opts) {
      var base = {
        // The parent container of this pane.
        "parent": null,
        "id": "dex-ui-layout",
        "class": "dex-ui-layout",
        "layout": {
          resizable: true
        }
      };

      super(new dex.Configuration(base).overlay(opts));
      let self = this;
      this.set("layout.onresize", function () {
        self.publish("resize", {});
      });
      this.initialize();
    }

    initialize() {
      // If we're not attached to a dom node, return:
      if (!$.contains(document, this.$root[0])) {
        return this;
      }
      var $center = $('<div id="center" class="ui-layout-center"></div>');

      var panes = {
        north: '<div id="north" class="ui-layout-north"></div>',
        south: '<div id="south" class="ui-layout-south"></div>',
        east: '<div id="east" class="ui-layout-east"></div>',
        west: '<div id="west" class="ui-layout-west"></div>'
      };

      this.$root.append($center);
      this.config.set("center", $center);
      for (let key in panes) {
        if (this.isDefined(`layout.${key}`)) {
          this.$root.append(panes[key]);
        }
      }

      this.$root.layout(this.get("layout"));

      return this;
    }

    update() {
      return this;
    };
  }

  class ListSelector extends Component {

    constructor(opts) {
      var base = {
        // The parent container of this pane.
        "parent": null,
        "id": "ListSelectorId",
        "class": "ListSelectorClass",
        items: [],
        selected: [],
        name: "Item",
        text: "count>0",
        actions: true,
        multiple: true,
        search: true,
        selectAll: true,
        style: "info"
      };

      super(new dex.Configuration(base).overlay(opts));
    }

    render() {
      super.render();
      let config = this.config;
      let $parent = $(config.get("parent"));
      let self = this;

      let domStr = `<select class="selectpicker" 
data-title="${config.get("name")}: None Selected"
title="${config.get("name")}: None Selected"
data-width="100%"
data-size="5"
data-style="btn-${config.get("style")}"
data-live-search="${config.get("search") ? "true" : "false"}"
data-count-selected-text="${config.get("name")}: ({0}/{1})"
data-selected-text-format="${config.get("text")}"
data-actions-box="${config.get("actions") ? "true" : "false"}"
${config.get("multiple") ? " multiple" : ""}>`;

      if (config.get("selectAll")) {
        config.set("selected", dex.array.copy(config.get("items")));
      }

      var items = config.get("items");

      let selectedMap = {};
      config.get("selected").forEach(function(item) { selectedMap[item] = true;});

      _.uniq(items).forEach(function (val) {
        domStr += `<option value="${val}"${selectedMap[val] ? " selected" : ""}>${val}</option>`;
      });
      domStr += "</select>";

      $parent.append(domStr);
      var $picker = $parent.find(".selectpicker");
      $picker.selectpicker({
        virtualScroll: (items.length > 100)
      });

      $picker.selectpicker("refresh");

        $parent.find('.selectpicker').on('hidden.bs.select',
            function (evt) {
            dex.log("SELECTED", $(this).val());
            self.publish("select", { selected: $(this).val() });
        });


        return this;
    }

    update() {
      return this;
    };

  }

  class Slider extends Component {

    constructor(opts) {
      var base = {
        id: "dex-ui-slider",
        class: "dex-ui-slider",
        range: false,
        type: "number"
      };

      super(new dex.Configuration(base).overlay(opts));

      switch (this.get("type")) {
        case "number": {
          this.internalSlider = this.createNumberSlider(this.$root);
          break
        }
        case "date": {
          this.internalSlider = this.createDateSlider(this.$root);
          break;
        }
      }
    }

    getStep(extent) {
      try {
        var delta = Math.abs(+extent[1] - extent[0]) / 100;
        if (delta < 1) {
          return delta;
        }
        return 1;
      } catch (ex) {
        return 1;
      }
    }

    getFormatter(extent) {
      var step = this.getStep(extent);
      if (step < 1) {

        return {
          from: Number,
          to: function (value) {
            return parseFloat(Math.round(value * 100) / 100).toFixed(2);
          }
        };
      }
      return {
        from: Number,
        to: function (value) {
          return Math.floor(value);
        }
      };
    }

    createNumberSlider(selection) {
      let sliderConfig = {
        skin: "big",
        type: "single",
        grid: true,
        min: this.config.get("min"),
        max: this.get("max"),
        from: (this.isDefined("initial") ? this.get("initial") : this.get("min")),
        step: this.getStep([this.get("min"), this.get("max")]),
        drag_interval: true,
        min_interval: null,
        max_interval: null,
        onFinish: this.get("onFinish")
      };
      if (this.config.get("range")) {
        sliderConfig.type = "double";
        sliderConfig.to = this.get("max");
      }
      //dex.log("Slider Config:", sliderConfig)
      return selection.ionRangeSlider(sliderConfig)
    }

    dateToTS (date) {
      return date.valueOf();
    }

    timestampToDate(timestamp) {
      var d = new Date(timestamp);

      return d.toLocaleDateString("en-US", {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    createDateSlider(selection) {
      let sliderConfig = {
        skin: "big",
        type: "single",
        grid: true,
        min: this.get("min"),
        max: this.get("max"),
        from: this.timestampToDate((this.isDefined("initial")
          ? this.get("initial").getTime() : this.get("min").getTime())),
        drag_interval: true,
        min_interval: null,
        max_interval: null,
        prettify: this.timestampToDate
      };

      if (this.config.get("range")) {
        sliderConfig.type = "double";
        sliderConfig.to = this.timestampToDate(this.get("max").getTime());
      }

      return selection.ionRangeSlider(sliderConfig);
    }

    update() {
      return this;
    };

  }

  /**
   * This implements a standard layout which divides the screen
   * between east and west.  The west side containing configuration
   * and the east side containing target components such as charts.
   * The config layout is further divided into north, center and
   * south sections which contain the column selector, data filter,
   * and gui-configuration panes respectively.
   *
   */
  class StandardLayout extends Component {

    /**
     *
     * Construct a standard layout.
     *
     * @param {Object} opts - The configuration of the Component.
     * @param {string|jquerySelection} [opts.parent] - A string or jquery
     * selection indicating the DOM node which this component is to be
     * attached.
     * @param {string} [opts.id] - The id of this component.  Defaults to
     * dex-ui-std-layout.
     * @param {string} [opts.class] - The class of this component.  Used
     * when alternate CSS styling is to be employed.  Default value is
     * dex-ui-std-layout.
     * @params {Component[]} targets - One or more components which will
     * be rendered on the west side of the screen and configured by
     * the components on the east side.
     * @params {Csv} csv - The data being displayed in the charts and
     * configuration screen.
     *
     */
    constructor(opts) {
      var base = {
        // The parent container of this pane.
        "parent": undefined,
        "id": "dex-ui-std-layout",
        "class": "dex-ui-std-layout",
        "targets" : [],
        "csv": undefined
      };

      super(new dex.Configuration(base).overlay(opts));
      this.initialize();
    }

    /**
     *
     * Initialize the component.  If it is attached to the DOM
     * document, then the component will initialize, otherwise
     * it will short circuit..
     *
     * @returns {StandardLayout} The StandardLayout is returned
     * to the caller.
     *
     */
    initialize() {
      if (!$.contains(document, this.$root[0])) {
        return this;
      }
      let config = this.config;
      let $root = this.$root;
      let csv = config.get("csv");
      let targets = config.get("targets");

      var layoutPane = new dex.ui.LayoutPane({
        parent: $root,
        id: "main",
        layout: {west: {size: '24%'}},
        resizable: true
      });
      layoutPane.render();

      config.get("targets").forEach(function (target) {
        target.set("parent", "#main>#center");
        target.set("csv", csv);
        target.render();
      });

      var configPane = new dex.ui.ConfigurationPane({
        parent: "#main>#west",
        id: "config",
        csv: csv,
        targets: targets
      });
      configPane.render();
    }

    /**
     *
     * Update the component.
     *
     * @returns {StandardLayout} The StandardLayout is returned.
     *
     */
    update() {
      return this;
    };
  }



  var uiModule = /*#__PURE__*/Object.freeze({
    __proto__: null,
    GuiPane: GuiPane,
    DataFilterPane: DataFilterPane,
    ConfigurationPane: ConfigurationPane,
    ColumnSelector: ColumnSelector,
    LayoutPane: LayoutPane,
    ListSelector: ListSelector,
    Slider: Slider,
    StandardLayout: StandardLayout
  });

  var debugging = false;

  var logger = loggerModule;

  var array = arrayModule;

  // Event Bus
  var bus = new EventBus();

  var charts = chartsModule;

  var color = colorModule;

  var data = dataModule;

  var exception = exceptionModule;

  var geometry = geometryModule;
  var config = configModule;

  var io$1 = ioModule;

  var matrix = matrixModule;
  var object = objectModule;
  var ui = uiModule;

  function addResizeEvent(target, debounceInterval = 100) {
    function handler(target) {
      return function () {
        target.resize();
      }
    }

    window.addEventListener('resize',
      _.debounce(handler(target), debounceInterval));
  }

  function addClickEvent(target, debounceInterval = 1) {
    function handler(target) {
      return function () {
        target.click();
      }
    }

    window.addEventListener('click',
      _.debounce(handler(target), debounceInterval));
  }

  (function ($) {
    $.fn.selector = {
      split: function () {
        return "";
      }
    };
  })(jQuery);

  // Fixes a jquery / bootstrap conflict
  //if ($.fn.button.noConflict != undefined) {
  //  $.fn.button.noConflict();
  //}

  exports.Component = Component;
  exports.Configuration = Configuration;
  exports.Csv = Csv;
  exports.addClickEvent = addClickEvent;
  exports.addResizeEvent = addResizeEvent;
  exports.array = array;
  exports.bus = bus;
  exports.charts = charts;
  exports.color = color;
  exports.config = config;
  exports.data = data;
  exports.debug = debug;
  exports.debugging = debugging;
  exports.exception = exception;
  exports.geometry = geometry;
  exports.io = io$1;
  exports.log = log;
  exports.logString = logString;
  exports.logger = logger;
  exports.matrix = matrix;
  exports.object = object;
  exports.ui = ui;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
