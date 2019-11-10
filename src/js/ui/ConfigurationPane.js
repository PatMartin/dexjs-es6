import {Component} from '../Component.js';

export class ConfigurationPane extends Component {
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
    columnSelector.render()

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

    dataFilterPane.render()
    guiPane.render();
  }

  update() {
    return this;
  };

}