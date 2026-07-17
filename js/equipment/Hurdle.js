var Hurdle = {
  defaults: function() { return {}; },
  views: function() { return ['top']; },
  variants: function() { return [{id:'standard',label:'Hurdle'}]; },

  draw: function(ctx, el) {
    var s = el.size || 18;
    var cl = el.color || '#e8960c';
    var hw = s * 1.4, hh = s;

    ctx.strokeStyle = cl;
    ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-hw / 2, 0); ctx.lineTo(-hw / 2, -hh); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hw / 2, 0); ctx.lineTo(hw / 2, -hh); ctx.stroke();
    ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(-hw / 2, -hh); ctx.lineTo(hw / 2, -hh); ctx.stroke();
  },

  bounds: function(el) {
    var s = el.size || 18;
    return {x: -s * 0.7, y: -s, w: s * 1.4, h: s};
  }
};

EquipmentRenderer.register('hurdle', Hurdle);
