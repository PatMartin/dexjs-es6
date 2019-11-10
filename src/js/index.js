export var debugging = false;

// Classes
export * from './Csv';
export * from './Component';
export * from './Configuration';
import EventBus from './EventBus';

import * as loggerModule from './logger/logger.js';

export var logger = loggerModule;
export {log, debug, logString} from './logger/logger.js';

// Arrays.
import * as arrayModule from './array/array.js';

export var array = arrayModule;

// Event Bus
export var bus = new EventBus();

import * as chartsModule from './chart/charts.js';

export var charts = chartsModule;

// Color
import * as colorModule from './color/color.js';

export var color = colorModule;

// Data
import * as dataModule from './data/data.js';

export var data = dataModule;

// Exception
import * as exceptionModule from './exception/exception.js';

export var exception = exceptionModule;

// Geometry
import * as geometryModule from './geometry/geometry.js';

export var geometry = geometryModule;

// GUI
import * as configModule from './config/config.js';
export var config = configModule;

// IO
import * as ioModule from './io/io.js';

export var io = ioModule;

// Matrices
import * as matrixModule from './matrix/matrix.js';

export var matrix = matrixModule;

// Objects
import * as objectModule from './object/object.js';
export var object = objectModule;

// UI
import * as uiModule from './ui/ui.js';
export var ui = uiModule;

export function addResizeEvent(target, debounceInterval = 100) {
  function handler(target) {
    return function () {
      target.resize();
    }
  }

  window.addEventListener('resize',
    _.debounce(handler(target), debounceInterval));
}

export function addClickEvent(target, debounceInterval = 1) {
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