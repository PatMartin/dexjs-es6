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

export function _clone(obj) {
  return _.cloneDeep(obj)
}

export function $clone(obj) {
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
export function clone(obj) {
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
};

/**
 *
 * Kind of misleading.  This really signals when expand should quit
 * expanding.  I need to clean this up.
 *
 * @param obj
 * @returns {boolean}
 *
 */
export function isEmpty(obj) {
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
};

/**
 *
 * This method returns whether or not the supplied object is a Node.
 *
 * @param {Object} obj - The object to test.
 *
 * @returns {boolean} True if obj is a Node, false otherwise.
 *
 */
export function isNode(obj) {
  return (
    typeof Node === "object" ? obj instanceof Node :
      obj && typeof obj === "object" && typeof obj.nodeType === "number" && typeof obj.nodeName === "string"
  );
};

export function isComponent(obj) {
  return (obj instanceof dex.Component);
};

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
export function isElement(obj) {
  return (
    typeof HTMLElement === "object" ? obj instanceof HTMLElement : //DOM2
      obj && typeof obj === "object" && obj.nodeType === 1 && typeof obj.nodeName === "string"
  );
};

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
export function contains(container, obj) {
  var i = container.length;
  while (i--) {
    if (container[i] === obj) {
      return true;
    }
  }
  return false;
};

export function couldBeADate(obj) {
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
};

export function randomString(length = 10, chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ") {
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
export function isNumeric(obj) {
  return !isNaN(parseFloat(obj)) && isFinite(obj);
}

export function getHierarchical(hierarchy, name) {
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

export function setHierarchical(hierarchy, name, value, delimiter) {
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
export function expandAndOverlay() {
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
export function expand(cfg) {
  var ecfg = cfg;
  var name, ci;
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
export function overlayObject(top, bottom) {
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
};

export function getValue(hierarchy, name, defaultValue) {
  return dex.object.getHierarchical(hierarchy, name) || defaultValue;
}