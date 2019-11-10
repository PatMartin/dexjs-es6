/**
 *
 * Log one or more messages or objects or a combination of both.
 *
 * @param {Mixed} [...] - A series of messages/objects to be logged.
 *
 */
export function log() {
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
export function debug(msg) {
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
export function logString(...messages) {
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