'use strict';
// CoachBoard Pro - Dummy (Mannequin) Object Definition
var DummyObject = {
  TYPE: 'mannequin',
  create: function(x, y, opts) {
    opts = opts || {};
    return {
      id: uid(), type: DummyObject.TYPE,
      x: x||0, y: y||0, size: opts.size||40,
      color: opts.color||'#8B4513', rotation:0, opacity:1,
      groupId:null, hidden:false, locked:false
    };
  }
};
