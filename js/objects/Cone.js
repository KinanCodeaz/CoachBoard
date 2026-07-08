'use strict';
// CoachBoard Pro - Cone Object Definition
var ConeObject = {
  TYPES: ['cone', 'coneDisc', 'coneTall'],
  create: function(x, y, opts) {
    opts = opts || {};
    return {
      id: uid(), type: opts.coneType || 'cone',
      x: x||0, y: y||0, size: opts.size||18,
      color: opts.color||'#ff6600', rotation:0, opacity:1,
      groupId:null, hidden:false, locked:false
    };
  }
};
