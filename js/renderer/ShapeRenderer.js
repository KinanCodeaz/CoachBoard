'use strict';
// CoachBoard Pro - Shape Renderer
// Thin wrapper for zone/shape drawing. Actual drawing in section-shapes.js.
var ShapeRenderer = {
  draw: function(el) { SEC.draw(el); },

  drawZone: function(el, cx) {
    var s = el.size || 40;
    var zw = el.zoneW || s*2.4, zh = el.zoneH || s*1.6;
    var color = el.color || '#4a90d9';
    var color2 = el.zoneColor2;
    cx.save();
    cx.translate(el.x, el.y);
    cx.rotate((el.rotation || 0) * Math.PI / 180);
    cx.globalAlpha = el.opacity !== undefined ? el.opacity : 1;
    if(el.type === 'zoneCircle') {
      cx.beginPath(); cx.arc(0, 0, s, 0, Math.PI*2);
      if(color2) { var g = cx.createRadialGradient(0,0,0,0,0,s); g.addColorStop(0, color2); g.addColorStop(1, color); cx.fillStyle = g; }
      else { cx.fillStyle = color; }
      cx.fill();
      cx.strokeStyle = 'rgba(0,0,0,0.15)'; cx.lineWidth = 1; cx.stroke();
    } else {
      if(color2) { var g = cx.createLinearGradient(-zw/2,-zh/2,zw/2,zh/2); g.addColorStop(0, color2); g.addColorStop(1, color); cx.fillStyle = g; }
      else { cx.fillStyle = color; }
      if(el.type === 'zoneTriangle') {
        cx.beginPath(); cx.moveTo(0, -zh/2); cx.lineTo(-zw/2, zh/2); cx.lineTo(zw/2, zh/2); cx.closePath();
      } else {
        cx.fillRect(-zw/2, -zh/2, zw, zh);
      }
      cx.fill();
      cx.strokeStyle = 'rgba(0,0,0,0.15)'; cx.lineWidth = 1;
      if(el.type !== 'zoneTriangle') cx.strokeRect(-zw/2, -zh/2, zw, zh);
      else { cx.beginPath(); cx.moveTo(0, -zh/2); cx.lineTo(-zw/2, zh/2); cx.lineTo(zw/2, zh/2); cx.closePath(); cx.stroke(); }
    }
    cx.restore();
  }
};
