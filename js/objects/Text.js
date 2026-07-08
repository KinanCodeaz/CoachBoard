'use strict';
// CoachBoard Pro - Text Object Definition
var TextObject = {
  TYPES: ['text', 'number'],

  create: function(type, x, y, opts) {
    opts = opts || {};
    return {
      id: uid(), type: type || 'text',
      x: x||0, y: y||0,
      text: opts.text || '',
      color: opts.color || '#ffffff',
      fontSize: opts.fontSize || 18,
      fontFamily: opts.fontFamily || 'Cairo,Inter,sans-serif',
      fontWeight: opts.fontWeight || 'bold',
      rotation: opts.rotation || 0,
      opacity: opts.opacity !== undefined ? opts.opacity : 1,
      groupId:null, hidden:false, locked:false
    };
  },

  isText: function(type) { return type === 'text'; },
  isNumber: function(type) { return type === 'number'; }
};
