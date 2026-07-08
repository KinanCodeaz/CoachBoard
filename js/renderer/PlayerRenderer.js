'use strict';
// CoachBoard Pro - Player Renderer
// Thin wrapper for player/ball/coach drawing. Actual drawing in section-players.js.
var PlayerRenderer = {
  draw: function(el) {
    if(el.type === 'ball') PlayerRenderer.drawBall(el);
    else if(el.type === 'coach') PlayerRenderer.drawCoach(el);
    else PlayerRenderer.drawPlayer(el);
  },

  drawBall: function(el) {
    cx.save(); cx.translate(el.x, el.y);
    var s = el.size || 10;
    var g = cx.createRadialGradient(-s*0.3, -s*0.3, s*0.1, 0, 0, s);
    g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#cccccc');
    cx.fillStyle = g; cx.beginPath(); cx.arc(0, 0, s, 0, Math.PI*2); cx.fill();
    cx.strokeStyle = 'rgba(0,0,0,0.15)'; cx.lineWidth = 0.5; cx.stroke();
    cx.restore();
  },

  drawCoach: function(el) {
    cx.save(); cx.translate(el.x, el.y);
    var s = el.size || 18;
    cx.fillStyle = el.color || '#ffc107';
    cx.beginPath(); cx.arc(0, 0, s*0.5, 0, Math.PI*2); cx.fill();
    cx.strokeStyle = 'rgba(0,0,0,0.2)'; cx.lineWidth = 1.5; cx.stroke();
    var txt = el.text || 'C';
    if(txt) {
      cx.fillStyle = '#fff'; cx.font = 'bold '+Math.max(9, s*0.4)+'px Inter,Cairo';
      cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.fillText(txt, 0, 0);
    }
    cx.restore();
  },

  drawPlayer: function(el) {
    // Delegates to section-players.js _drawPlayer via SEC.draw
    SEC.draw(el);
  }
};
