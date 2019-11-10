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
export class Configuration {
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
    /**
     * @type {{Object} config}
     */
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