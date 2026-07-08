'use strict';
// CoachBoard Pro - Arrow Renderer
// Thin wrapper for arrow drawing. Actual drawing in section-arrows.js.
var ArrowRenderer = {
  draw: function(el) { SEC.draw(el); },

  drawArrowHead: function(x1, y1, x2, y2, size, color, style) {
    var dx = x2 - x1, dy = y2 - y1;
    var len = Math.sqrt(dx*dx + dy*dy) || 1;
    var ux = dx/len, uy = dy/len;
    var px = -uy, py = ux;
    var headLen = size * 0.6;
    cx.save();
    cx.fillStyle = color || '#ffffff';
    cx.strokeStyle = color || '#ffffff';
    cx.lineWidth = 1.5;
    cx.beginPath();
    if(style === 'dotted') {
      cx.setLineDash([2,3]);
    }
    cx.moveTo(x2, y2);
    cx.lineTo(x2 - ux*headLen + px*size*0.35, y2 - uy*headLen + py*size*0.35);
    cx.lineTo(x2 - ux*headLen - px*size*0.35, y2 - uy*headLen - py*size*0.35);
    cx.closePath();
    cx.fill();
    cx.setLineDash([]);
    cx.restore();
  }
};
