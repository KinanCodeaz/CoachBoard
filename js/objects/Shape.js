'use strict';
// CoachBoard Pro - Shape (Zone) Object Definition
var ShapeObject = {
  TYPES: ['zoneCircle', 'zoneRect', 'zoneTriangle', 'zoneRect2C', 'spinRing', 'zone18'],

  create: function(type, x, y, opts) {
    opts = opts || {};
    var isCircle = type === 'zoneCircle' || type === 'spinRing';
    return {
      id: uid(), type: type || 'zoneCircle',
      x: x||0, y: y||0,
      size: opts.size || 40,
      zoneW: opts.zoneW || (isCircle ? opts.size*2 : opts.size*2.4),
      zoneH: opts.zoneH || (isCircle ? opts.size*2 : opts.size*1.6),
      color: opts.color || '#4a90d9',
      zoneColor2: opts.zoneColor2 || null,
      rotation: opts.rotation || 0,
      opacity: opts.opacity !== undefined ? opts.opacity : 1,
      zoneRepeat: opts.zoneRepeat || 1,
      lineStyle: opts.lineStyle || 'dashed',
      lineWidth: opts.lineWidth || 2,
      groupId:null, hidden:false, locked:false
    };
  },

  isZone: function(type) {
    return ShapeObject.TYPES.indexOf(type) >= 0;
  }
};
