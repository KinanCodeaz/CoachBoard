var Barrier = {
  defaults: function() { return {}; },
  views: function() { return ['top']; },
  variants: function() { return [{id:'standard',label:'Barrier'}]; },

  draw: function(ctx, el) {
    var s = el.size || 18;
    var cl = el.color || '#e84040';
    var bw = s * 1.6, bh = s * 0.45;

    ctx.fillStyle = cl;
    ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-bw / 2, -bh / 2, bw, bh);
  },

  bounds: function(el) {
    var s = el.size || 18;
    return {x: -s * 0.8, y: -s * 0.225, w: s * 1.6, h: s * 0.45};
  }
};

EquipmentRenderer.register('barrier', Barrier);
