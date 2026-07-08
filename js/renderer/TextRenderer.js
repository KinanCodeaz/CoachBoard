'use strict';
// CoachBoard Pro - Text Renderer
// Thin wrapper for text/number drawing. Actual drawing in section-drawing.js.
var TextRenderer = {
  draw: function(el) { SEC.draw(el); },

  drawText: function(el) {
    cx.save();
    cx.translate(el.x, el.y);
    cx.rotate((el.rotation || 0) * Math.PI / 180);
    cx.globalAlpha = el.opacity !== undefined ? el.opacity : 1;
    var fs = el.fontSize || 18;
    cx.font = (el.fontWeight || 'bold') + ' ' + fs + 'px ' + (el.fontFamily || 'Cairo,Inter,sans-serif');
    cx.textAlign = 'center'; cx.textBaseline = 'middle';
    cx.fillStyle = el.color || '#ffffff';
    cx.shadowColor = 'rgba(0,0,0,0.4)'; cx.shadowBlur = 3;
    cx.fillText(el.text || '', 0, 0);
    cx.shadowBlur = 0;
    cx.restore();
  }
};
