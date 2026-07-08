'use strict';
// CoachBoard Pro - Ball Object Definition
var BallObject = {
  TYPE: 'ball',
  create: function(x, y, opts) {
    opts = opts || {};
    return {
      id: uid(), type: BallObject.TYPE,
      x: x||0, y: y||0, size: opts.size||10,
      color: opts.color||'#ffffff', rotation:0, opacity:1,
      groupId:null, linkedToId:null, linkOffset:null,
      text:'', fontSize:18, hidden:false, locked:false,
      spotlight:false, poszone:false
    };
  }
};
