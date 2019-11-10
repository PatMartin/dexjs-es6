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
export class Component {
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
      let parent = (this.config.get("parent"))
      // If jquery node:
      if (parent instanceof $) {
        this.$parent = parent
      }
      else {
        this.$parent = $(parent)
      }
    }

    this.$parent.append(this.$root)
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
    dex.log(`Initializer undefined for component: ${this.getDomTarget()}`)
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
      this.$root.detach()

      let parent = value

      if (parent instanceof $) {
        this.$parent = parent
        parent.append(this.$root)
      }
      else {
        this.$parent = $(parent)
        this.$parent.append(this.$root)
      }
      this.initialize()
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
      dex.bus.unsubscribe(channel.getDomTarget(), eventType, fn)
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