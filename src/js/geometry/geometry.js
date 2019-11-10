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
export function getSqDist(p1, p2) {
  var dx = p1.x - p2.x,
    dy = p1.y - p2.y;

  return dx * dx + dy * dy;
};

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
export function getSqSegDist(p, s1, s2) {

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
};

export function simplifyRadialDist(points, sqTolerance) {

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
};

export function simplifyDPStep(points, first, last, sqTolerance, simplified) {
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
};

export function simplifyDouglasPeucker(points, sqTolerance) {
  var last = points.length - 1;

  var simplified = [points[0]];
  dex.geometry.simplifyDPStep(points, 0, last, sqTolerance, simplified);
  simplified.push(points[last]);

  return simplified;
};

// both algorithms combined for awesome performance
export function simplify(points, tolerance, highestQuality) {
  if (points.length <= 2) return points;

  var sqTolerance = tolerance !== undefined ? tolerance * tolerance : 1;

  points = highestQuality ? points : dex.geometry.simplifyRadialDist(points, sqTolerance);
  points = dex.geometry.simplifyDouglasPeucker(points, sqTolerance);

  return points;
};

export function pointInside(point, points) {
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
};

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
export function extents(points) {
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
};

export function rasterize(points, resolution) {
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
};

export function maxRect(matrix) {
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
};

export function getRectangularArea(upperLeft, lowerRight) {
  if (upperLeft.x > lowerRight.x || upperLeft.y > lowerRight.y)
    return 0;
  return ((lowerRight.x + 1) - (upperLeft.x)) * ((lowerRight.y + 1) - (upperLeft.y));
};