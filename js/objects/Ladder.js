'use strict';
// CoachBoard Pro - Ladder Object Definition
var LadderObject = {
  TYPE: 'ladder',
  create: function(x, y, opts) {
    opts = opts || {};
    return {
      id: uid(), type: LadderObject.TYPE,
      x: x||0, y: y||0, size: opts.size||18,
      color: opts.color||'#cccccc', rotation:0, opacity:1,
      groupId:null, hidden:false, locked:false
    };
  }
};
