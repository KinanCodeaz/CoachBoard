var Cone = {
  defaults: function() {
    return { shadowVisible: true };
  },

  views: function() {
    return ['top'];
  },

  variants: function() {
    return [{id:'standard', label:'Cone'}, {id:'flat', label:'Flat'}, {id:'tall', label:'Tall'}];
  },

  draw: function(ctx, el) {
    var s = el.size || 18;
    var cl = el.color || '#ff7a1a';
    if (el.type === 'coneDisc') {
      this._drawDisc(ctx, s, cl, el);
    } else if (el.type === 'coneTall') {
      this._drawCone(ctx, s * 0.9, s * 2.6, cl, el);
    } else {
      this._drawCone(ctx, s * 1.7, s * 1.35, cl, el);
    }
  },

  bounds: function(el) {
    var s = el.size || 18;
    if (el.type === 'coneDisc') return {x: -s, y: -s * 0.35, w: s * 2, h: s * 0.7};
    if (el.type === 'coneTall') return {x: -s * 0.6, y: -s * 2.6, w: s * 1.2, h: s * 3.1};
    return {x: -s * 0.85, y: -s * 0.8, w: s * 1.7, h: s * 1.5};
  },

  _drawCone: function(ctx, w, h, cl, el) {
    var topY = -h * 0.55;
    var baseY = h * 0.45;
    var topW = w * 0.32;

    if (el.shadowVisible !== false) {
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.beginPath();
      ctx.ellipse(0, baseY, w * 0.55, w * 0.12, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    var grad = ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    grad.addColorStop(0, EqUtils.lightColor(cl, -28));
    grad.addColorStop(0.5, cl);
    grad.addColorStop(1, EqUtils.lightColor(cl, 28));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-topW / 2, topY);
    ctx.lineTo(topW / 2, topY);
    ctx.lineTo(w / 2, baseY);
    ctx.lineTo(-w / 2, baseY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = EqUtils.hexToRgba(cl, 0.55);
    ctx.lineWidth = 1;
    ctx.stroke();

    var t = baseY - topY;
    var bandY = topY + t * 0.42;
    var bandH = h * 0.13;
    var wAtBand = topW + (w - topW) * 0.42;
    var d = (w - wAtBand) * 0.05;
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.beginPath();
    ctx.moveTo(-wAtBand / 2, bandY - bandH / 2);
    ctx.lineTo(wAtBand / 2, bandY - bandH / 2);
    ctx.lineTo(wAtBand / 2 + d, bandY + bandH / 2);
    ctx.lineTo(-wAtBand / 2 - d, bandY + bandH / 2);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = EqUtils.lightColor(cl, 35);
    ctx.beginPath();
    ctx.ellipse(0, topY, topW / 2, topW * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = EqUtils.hexToRgba(cl, 0.35);
    ctx.beginPath();
    ctx.ellipse(0, baseY, w / 2, w * 0.11, 0, 0, Math.PI * 2);
    ctx.fill();
  },

  _drawDisc: function(ctx, s, cl, el) {
    if (el.shadowVisible !== false) {
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.beginPath();
      ctx.ellipse(0, s * 0.12, s * 0.95, s * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    var grad = ctx.createLinearGradient(0, -s * 0.26, 0, s * 0.26);
    grad.addColorStop(0, EqUtils.lightColor(cl, 22));
    grad.addColorStop(1, EqUtils.lightColor(cl, -22));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.9, s * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = EqUtils.hexToRgba(cl, 0.6);
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.55, s * 0.17, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
};

EquipmentRenderer.register('cone', Cone);
EquipmentRenderer.register('coneDisc', Cone);
EquipmentRenderer.register('coneTall', Cone);
