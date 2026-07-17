var Ring = {
  defaults: function() { return {}; },
  views: function() { return ['top']; },
  variants: function() { return [{id:'standard',label:'Ring'}]; },

  draw: function(ctx, el) {
    var s = el.size || 18;
    var cl = el.color || '#f0c040';
    ctx.strokeStyle = cl;
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.stroke();
    ctx.strokeStyle = EqUtils.hexToRgba(cl, 0.12);
    ctx.lineWidth = 7;
    ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.stroke();
  },

  bounds: function(el) {
    var s = el.size || 18;
    return {x: -s, y: -s, w: s * 2, h: s * 2};
  }
};

EquipmentRenderer.register('ring', Ring);
