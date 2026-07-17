var Ladder = {
  defaults: function() {
    return { rungs: 8, shadowVisible: true };
  },

  views: function() {
    return ['top'];
  },

  variants: function() {
    return [{id:'standard', label:'Ladder'}];
  },

  draw: function(ctx, el) {
    var s = el.size || 18;
    var cl = el.color || '#e8960c';
    var w = s * 1.0;
    var h = s * 3.0;
    var rw = Math.max(2.5, s * 0.13);
    var rungs = el.rungs || 8;
    var leftX = -w / 2;
    var rightX = w / 2;
    var topY = -h / 2;
    var botY = h / 2;

    if (el.shadowVisible !== false) {
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.ellipse(0, botY, w * 0.6, rw * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    var grad = ctx.createLinearGradient(0, topY, 0, botY);
    grad.addColorStop(0, EqUtils.lightColor(cl, 22));
    grad.addColorStop(1, EqUtils.lightColor(cl, -22));
    ctx.strokeStyle = grad;
    ctx.lineCap = 'round';
    ctx.lineWidth = rw;
    ctx.beginPath();
    ctx.moveTo(leftX, topY);
    ctx.lineTo(leftX, botY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rightX, topY);
    ctx.lineTo(rightX, botY);
    ctx.stroke();

    ctx.lineWidth = Math.max(1.5, s * 0.09);
    for (var i = 0; i <= rungs; i++) {
      var y = topY + (h / rungs) * i;
      ctx.beginPath();
      ctx.moveTo(leftX, y);
      ctx.lineTo(rightX, y);
      ctx.stroke();
    }

    ctx.fillStyle = EqUtils.lightColor(cl, 32);
    for (var j = 0; j <= rungs; j++) {
      var ry = topY + (h / rungs) * j;
      ctx.beginPath();
      ctx.arc(leftX, ry, rw * 0.62, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(rightX, ry, rw * 0.62, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  bounds: function(el) {
    var s = el.size || 18;
    var w = s * 1.0;
    var h = s * 3.0;
    return {x: -w / 2 - 5, y: -h / 2 - 5, w: w + 10, h: h + 10};
  }
};

EquipmentRenderer.register('ladder', Ladder);
