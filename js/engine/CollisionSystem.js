'use strict';
// CoachBoard Pro - Collision System (Placeholder)
// Future: overlap detection, collision resolution, bounding box checks.
var CollisionSystem = {
  // Check if two elements overlap
  overlaps: function(a, b) {
    if(!a || !b) return false;
    var ba = elBnd(a), bb = elBnd(b);
    return ba.x < bb.x + bb.w && ba.x + ba.w > bb.x &&
           ba.y < bb.y + bb.h && ba.y + ba.h > bb.y;
  },

  // Find all elements at a point
  atPoint: function(x, y) {
    var result = [];
    for(var i = els.length - 1; i >= 0; i--) {
      var el = els[i];
      if(el.hidden || el.locked) continue;
      var b = elBnd(el);
      if(x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) result.push(el);
    }
    return result;
  },

  // Find bounding box of a set of elements
  boundingBox: function(elements) {
    if(!elements || !elements.length) return null;
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    elements.forEach(function(el) {
      var b = elBnd(el);
      if(b.x < minX) minX = b.x;
      if(b.y < minY) minY = b.y;
      if(b.x + b.w > maxX) maxX = b.x + b.w;
      if(b.y + b.h > maxY) maxY = b.y + b.h;
    });
    return {x: minX, y: minY, w: maxX - minX, h: maxY - minY};
  },

  // Resolve overlaps by pushing elements apart
  resolveOverlaps: function(elements) { /* TODO */ }
};
