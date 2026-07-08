'use strict';
// CoachBoard Pro - Geometry Engine
// All geometric calculations in one place.
// Snap, align, distribute, distance, angle, curves, collision, guides.

var GeometryEngine = {
  // ============ SNAP ============
  // Snap point to grid
  snapToGrid: function(x, y, gridSize) {
    var gs = gridSize || 20;
    return {
      x: Math.round(x / gs) * gs,
      y: Math.round(y / gs) * gs
    };
  },

  // Snap point to nearby elements
  snapToElements: function(x, y, elements, snapRadius) {
    var sr = snapRadius || 10;
    var bestDist = sr;
    var bestSnap = null;

    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      if (el.hidden) continue;

      // Snap to center
      var dist = this.distance(x, y, el.x, el.y);
      if (dist < bestDist) {
        bestDist = dist;
        bestSnap = { x: el.x, y: el.y, type: 'center', element: el };
      }

      // Snap to edges
      var b = typeof elBnd === 'function' ? elBnd(el) : { x: el.x - 18, y: el.y - 18, w: 36, h: 36 };
      var edges = [
        { x: b.x, y: b.y + b.h / 2 },           // left
        { x: b.x + b.w, y: b.y + b.h / 2 },     // right
        { x: b.x + b.w / 2, y: b.y },           // top
        { x: b.x + b.w / 2, y: b.y + b.h }     // bottom
      ];

      for (var j = 0; j < edges.length; j++) {
        dist = this.distance(x, y, edges[j].x, edges[j].y);
        if (dist < bestDist) {
          bestDist = dist;
          bestSnap = { x: edges[j].x, y: edges[j].y, type: 'edge', element: el };
        }
      }
    }

    return bestSnap;
  },

  // Snap to alignment guides
  snapToGuides: function(x, y, elements, snapRadius) {
    var sr = snapRadius || 8;
    var guides = this.getAlignmentGuides(elements);
    var bestSnap = null;
    var bestDist = sr;

    for (var i = 0; i < guides.length; i++) {
      var g = guides[i];
      var dist;
      if (g.axis === 'x') {
        dist = Math.abs(y - g.value);
        if (dist < bestDist) {
          bestDist = dist;
          bestSnap = { x: x, y: g.value, type: 'guide', guide: g };
        }
      } else {
        dist = Math.abs(x - g.value);
        if (dist < bestDist) {
          bestDist = dist;
          bestSnap = { x: g.value, y: y, type: 'guide', guide: g };
        }
      }
    }

    return bestSnap;
  },

  // Get alignment guides for elements
  getAlignmentGuides: function(elements) {
    var guides = [];
    var visible = elements.filter(function(e) { return !e.hidden; });

    // Collect unique x and y positions
    var xPositions = {};
    var yPositions = {};

    for (var i = 0; i < visible.length; i++) {
      var el = visible[i];
      xPositions[el.x] = true;
      yPositions[el.y] = true;

      // Also include edges
      var b = typeof elBnd === 'function' ? elBnd(el) : { x: el.x - 18, y: el.y - 18, w: 36, h: 36 };
      xPositions[b.x] = true;
      xPositions[b.x + b.w] = true;
      yPositions[b.y] = true;
      yPositions[b.y + b.h] = true;
    }

    for (var x in xPositions) guides.push({ axis: 'y', value: parseFloat(x) });
    for (var y in yPositions) guides.push({ axis: 'x', value: parseFloat(y) });

    return guides;
  },

  // ============ ALIGN ============
  alignLeft: function(elements) {
    if (elements.length < 2) return;
    var minX = Math.min.apply(null, elements.map(function(e) { return e.x; }));
    elements.forEach(function(e) { e.x = minX; });
  },

  alignRight: function(elements) {
    if (elements.length < 2) return;
    var maxX = Math.max.apply(null, elements.map(function(e) { return e.x; }));
    elements.forEach(function(e) { e.x = maxX; });
  },

  alignTop: function(elements) {
    if (elements.length < 2) return;
    var minY = Math.min.apply(null, elements.map(function(e) { return e.y; }));
    elements.forEach(function(e) { e.y = minY; });
  },

  alignBottom: function(elements) {
    if (elements.length < 2) return;
    var maxY = Math.max.apply(null, elements.map(function(e) { return e.y; }));
    elements.forEach(function(e) { e.y = maxY; });
  },

  alignCenterH: function(elements) {
    if (elements.length < 2) return;
    var avgX = elements.reduce(function(s, e) { return s + e.x; }, 0) / elements.length;
    elements.forEach(function(e) { e.x = avgX; });
  },

  alignCenterV: function(elements) {
    if (elements.length < 2) return;
    var avgY = elements.reduce(function(s, e) { return s + e.y; }, 0) / elements.length;
    elements.forEach(function(e) { e.y = avgY; });
  },

  // ============ DISTRIBUTE ============
  distributeHorizontal: function(elements) {
    if (elements.length < 3) return;
    elements.sort(function(a, b) { return a.x - b.x; });
    var minX = elements[0].x;
    var maxX = elements[elements.length - 1].x;
    var step = (maxX - minX) / (elements.length - 1);
    for (var i = 1; i < elements.length - 1; i++) {
      elements[i].x = minX + i * step;
    }
  },

  distributeVertical: function(elements) {
    if (elements.length < 3) return;
    elements.sort(function(a, b) { return a.y - b.y; });
    var minY = elements[0].y;
    var maxY = elements[elements.length - 1].y;
    var step = (maxY - minY) / (elements.length - 1);
    for (var i = 1; i < elements.length - 1; i++) {
      elements[i].y = minY + i * step;
    }
  },

  distributeEvenH: function(elements) {
    if (elements.length < 3) return;
    elements.sort(function(a, b) { return a.x - b.x; });
    var minX = elements[0].x;
    var maxX = elements[elements.length - 1].x;
    var totalWidth = maxX - minX;
    var gap = totalWidth / (elements.length - 1);
    for (var i = 1; i < elements.length - 1; i++) {
      elements[i].x = minX + i * gap;
    }
  },

  distributeEvenV: function(elements) {
    if (elements.length < 3) return;
    elements.sort(function(a, b) { return a.y - b.y; });
    var minY = elements[0].y;
    var maxY = elements[elements.length - 1].y;
    var totalHeight = maxY - minY;
    var gap = totalHeight / (elements.length - 1);
    for (var i = 1; i < elements.length - 1; i++) {
      elements[i].y = minY + i * gap;
    }
  },

  // ============ DISTANCE & ANGLE ============
  distance: function(x1, y1, x2, y2) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  },

  angle: function(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  },

  angleDeg: function(x1, y1, x2, y2) {
    return this.angle(x1, y1, x2, y2) * 180 / Math.PI;
  },

  // ============ CURVES ============
  // Catmull-Rom spline through points
  catmullRom: function(points, segments) {
    var seg = segments || 20;
    var result = [];

    if (points.length < 2) return points;

    for (var i = 0; i < points.length - 1; i++) {
      var p0 = points[Math.max(0, i - 1)];
      var p1 = points[i];
      var p2 = points[Math.min(points.length - 1, i + 1)];
      var p3 = points[Math.min(points.length - 1, i + 2)];

      for (var t = 0; t < seg; t++) {
        var tt = t / seg;
        var tt2 = tt * tt;
        var tt3 = tt2 * tt;

        var x = 0.5 * (
          (2 * p1.x) +
          (-p0.x + p2.x) * tt +
          (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * tt2 +
          (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * tt3
        );

        var y = 0.5 * (
          (2 * p1.y) +
          (-p0.y + p2.y) * tt +
          (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * tt2 +
          (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * tt3
        );

        result.push({ x: x, y: y });
      }
    }

    result.push(points[points.length - 1]);
    return result;
  },

  // Quadratic bezier curve
  quadraticBezier: function(p0, p1, p2, t) {
    var mt = 1 - t;
    return {
      x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
      y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y
    };
  },

  // Cubic bezier curve
  cubicBezier: function(p0, p1, p2, p3, t) {
    var mt = 1 - t;
    var mt2 = mt * mt;
    var mt3 = mt2 * mt;
    var t2 = t * t;
    var t3 = t2 * t;

    return {
      x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
      y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y
    };
  },

  // ============ COLLISION ============
  // AABB collision detection
  collides: function(a, b) {
    var aBounds = typeof elBnd === 'function' ? elBnd(a) : { x: a.x - 18, y: a.y - 18, w: 36, h: 36 };
    var bBounds = typeof elBnd === 'function' ? elBnd(b) : { x: b.x - 18, y: b.y - 18, w: 36, h: 36 };

    return !(aBounds.x + aBounds.w < bBounds.x ||
             bBounds.x + bBounds.w < aBounds.x ||
             aBounds.y + aBounds.h < bBounds.y ||
             bBounds.y + bBounds.h < aBounds.y);
  },

  // Point in rectangle
  pointInRect: function(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
  },

  // Point in circle
  pointInCircle: function(px, py, cx, cy, r) {
    return this.distance(px, py, cx, cy) <= r;
  },

  // ============ SMART SPACING ============
  smartSpaceHorizontal: function(elements, spacing) {
    if (elements.length < 2) return;
    elements.sort(function(a, b) { return a.x - b.x; });
    var currentX = elements[0].x;
    for (var i = 1; i < elements.length; i++) {
      var b = typeof elBnd === 'function' ? elBnd(elements[i - 1]) : { w: 36 };
      currentX += b.w / 2 + spacing;
      elements[i].x = currentX;
      var b2 = typeof elBnd === 'function' ? elBnd(elements[i]) : { w: 36 };
      currentX += b2.w / 2;
    }
  },

  smartSpaceVertical: function(elements, spacing) {
    if (elements.length < 2) return;
    elements.sort(function(a, b) { return a.y - b.y; });
    var currentY = elements[0].y;
    for (var i = 1; i < elements.length; i++) {
      var b = typeof elBnd === 'function' ? elBnd(elements[i - 1]) : { h: 36 };
      currentY += b.h / 2 + spacing;
      elements[i].y = currentY;
      var b2 = typeof elBnd === 'function' ? elBnd(elements[i]) : { h: 36 };
      currentY += b2.h / 2;
    }
  }
};
