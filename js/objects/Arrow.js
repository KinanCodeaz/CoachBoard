'use strict';
// CoachBoard Pro - Arrow Object Definition
var ArrowObject = {
  TYPES: ['arrowSolid', 'arrowDashed', 'arrowDotted', 'arrowCurved', 'arrowMulti', 'arrowDoublePoly', 'arrowSlalom'],

  create: function(type, x, y, opts) {
    opts = opts || {};
    return {
      id: uid(), type: type || 'arrowSolid',
      x: x||0, y: y||0,
      ax2: opts.ax2 || x||0, ay2: opts.ay2 || y||0,
      size: opts.size || 18,
      color: opts.color || '#ffffff', rotation:0, opacity:1,
      curve: opts.curve || 0,
      points: opts.points || null,
      lineStyle: opts.lineStyle || 'dashed',
      lineWidth: opts.lineWidth || 2,
      groupId:null, hidden:false, locked:false
    };
  },

  isArrow: function(type) {
    return ArrowObject.TYPES.indexOf(type) >= 0;
  }
};
