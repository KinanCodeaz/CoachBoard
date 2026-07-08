'use strict';
// CoachBoard Pro - Goal Object Definition (smallGoal)
var GoalObject = {
  TYPE: 'smallGoal',
  create: function(x, y, opts) {
    opts = opts || {};
    return {
      id: uid(), type: GoalObject.TYPE,
      x: x||0, y: y||0, size: opts.size||18,
      color: opts.color||'#ffffff', rotation:0, opacity:1,
      groupId:null, hidden:false, locked:false
    };
  }
};
