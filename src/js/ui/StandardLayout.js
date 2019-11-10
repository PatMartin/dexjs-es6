import {Component} from '../Component.js';

/**
 * This implements a standard layout which divides the screen
 * between east and west.  The west side containing configuration
 * and the east side containing target components such as charts.
 * The config layout is further divided into north, center and
 * south sections which contain the column selector, data filter,
 * and gui-configuration panes respectively.
 *
 */
export class StandardLayout extends Component {

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
    let self = this;
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