'use strict';
// CoachBoard Pro - Equipment Renderer
// Thin wrapper for equipment drawing. Actual drawing in section-equipment.js.
var EquipmentRenderer = {
  draw: function(el) { SEC.draw(el); },

  // Equipment types: cone, coneDisc, coneTall, ring, barrier, hurdle,
  // mannequin, smallGoal, flag, ladder, stick, hurdleArc, bib, reboundBoard
  getBounds: function(el) {
    var s = el.size || 18;
    if(el.type === 'barrier') return {x: el.x - s*1.5, y: el.y - s*0.3, w: s*3, h: s*0.6};
    if(el.type === 'ladder') return {x: el.x - s, y: el.y - s*1.5, w: s*2, h: s*3};
    if(el.type === 'stick') return {x: el.x - 2, y: el.y - s, w: 4, h: s*2};
    return {x: el.x - s, y: el.y - s, w: s*2, h: s*2};
  }
};
