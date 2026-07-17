var Flag = {
  defaults: function() { return {}; },
  views: function() { return ['top']; },
  variants: function() { return [{id:'standard',label:'Flag'}]; },

  draw: function(ctx, el) {
    var s = el.size || 18;
    var cl = el.color || '#50e870';

    ctx.strokeStyle = '#888';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, s); ctx.lineTo(0, -s); ctx.stroke();

    ctx.fillStyle = cl;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s * 0.8, -s * 0.6);
    ctx.lineTo(0, -s * 0.2);
    ctx.closePath();
    ctx.fill();
  },

  bounds: function(el) {
    var s = el.size || 18;
    return {x: -s * 0.2, y: -s, w: s, h: s * 2};
  }
};

EquipmentRenderer.register('flag', Flag);
