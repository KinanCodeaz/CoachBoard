'use strict';
// CoachBoard Pro - Main Renderer Facade
// Dispatches draw calls to per-type renderers via SEC registry.
// This is a convenience API; the actual drawing is in section-*.js draw methods.
var Renderer = {
  draw: function(el) {
    if(el.hidden) return;
    var tr = pTrapezoid();
    if(tr && !isArr(el.type) && !isFree(el.type) && !isMultiArr(el.type)){
      var t = (el.y - tr.topLeft.y) / (tr.bottomLeft.y - tr.topLeft.y);
      t = Math.max(0, Math.min(1, t));
      var sc = perspectiveScaleAt(tr, t);
      if(sc !== 1){
        cx.save();
        cx.translate(el.x, el.y);
        cx.scale(sc, sc);
        cx.translate(-el.x, -el.y);
        SEC.draw(el);
        cx.restore();
        return;
      }
    }
    SEC.draw(el);
  },

  drawAll: function(elements) {
    // Zones first, then others
    for(var i = 0; i < elements.length; i++) { if(isZone(elements[i].type)) Renderer.draw(elements[i]); }
    for(var i = 0; i < elements.length; i++) { if(!isZone(elements[i].type)) Renderer.draw(elements[i]); }
  },

  drawHandles: function(el) {
    if(el.hidden || isFree(el.type) || isArr(el.type)) return;
    var b = elBnd(el), mx = b.x + b.w/2, topY = b.y - 22;
    cx.strokeStyle = '#2f81f7'; cx.lineWidth = 1.5; cx.setLineDash([3,2]);
    cx.beginPath(); cx.moveTo(mx, b.y-4); cx.lineTo(mx, topY); cx.stroke();
    cx.setLineDash([]);
    cx.fillStyle = '#2f81f7'; cx.beginPath(); cx.arc(mx, topY, 6, 0, Math.PI*2); cx.fill();
    cx.strokeStyle = '#fff'; cx.lineWidth = 1.5; cx.stroke();
    cx.strokeStyle = '#fff'; cx.lineWidth = 1.2;
    cx.beginPath(); cx.arc(mx, topY, 3.5, Math.PI*0.8, Math.PI*2.2); cx.stroke();
    var corners = [[b.x-4,b.y-4],[b.x+b.w+4,b.y-4],[b.x-4,b.y+b.h+4],[b.x+b.w+4,b.y+b.h+4]];
    for(var i = 0; i < corners.length; i++) {
      cx.fillStyle = '#2f81f7'; cx.fillRect(corners[i][0]-4, corners[i][1]-4, 8, 8);
      cx.strokeStyle = '#fff'; cx.lineWidth = 1; cx.strokeRect(corners[i][0]-4, corners[i][1]-4, 8, 8);
    }
    var mids = [[mx,b.y-4],[mx,b.y+b.h+4],[b.x-4,b.y+b.h/2],[b.x+b.w+4,b.y+b.h/2]];
    for(var i = 0; i < mids.length; i++) {
      cx.fillStyle = '#fff'; cx.fillRect(mids[i][0]-3, mids[i][1]-3, 6, 6);
      cx.strokeStyle = '#2f81f7'; cx.lineWidth = 1; cx.strokeRect(mids[i][0]-3, mids[i][1]-3, 6, 6);
    }
  }
};
