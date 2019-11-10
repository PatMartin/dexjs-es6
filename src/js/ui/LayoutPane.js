import {Component} from '../Component.js';

/**
 *
 * This component will create the specified layout.
 *
 */
export class LayoutPane extends Component {
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
      self.publish("resize", {})
    });
    this.initialize()
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
    }

    this.$root.append($center)
    this.config.set("center", $center);
    for (let key in panes) {
      if (this.isDefined(`layout.${key}`)) {
        this.$root.append(panes[key])
      }
    }

    this.$root.layout(this.get("layout"))

    return this;
  }

  update() {
    return this;
  };
}