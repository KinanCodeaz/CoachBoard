'use strict';
// CoachBoard Pro - Player Object Definition
// Defines the schema and default properties for player elements.
var PlayerObject = {
  TYPE_P_STAND: 'p_stand',
  TYPE_GK_STAND: 'gk_stand',
  TYPE_COACH: 'coach',

  create: function(type, x, y, opts) {
    opts = opts || {};
    return {
      id: uid(),
      type: type || PlayerObject.TYPE_P_STAND,
      x: x || 0, y: y || 0,
      size: opts.size || 18,
      color: opts.color || '#4a90d9',
      rotation: opts.rotation || 0,
      opacity: opts.opacity !== undefined ? opts.opacity : 1,
      groupId: opts.groupId || null,
      linkedToId: opts.linkedToId || null,
      linkOffset: opts.linkOffset || null,
      text: opts.text || '',
      fontSize: opts.fontSize || 18,
      hidden: false, locked: false,
      spotlight: opts.spotlight || false,
      poszone: opts.poszone || false,
      displayStyle: opts.displayStyle || 'circle',
      jerseyColor2: opts.jerseyColor2 || null,
      playerName: opts.playerName || '',
      nameColor: opts.nameColor || null,
      nameSize: opts.nameSize || null
    };
  },

  isPlayer: function(type) { return type === PlayerObject.TYPE_P_STAND || type === PlayerObject.TYPE_GK_STAND; },
  isGoalkeeper: function(type) { return type === PlayerObject.TYPE_GK_STAND; },
  isCoach: function(type) { return type === PlayerObject.TYPE_COACH; }
};
