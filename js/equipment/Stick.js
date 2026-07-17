var Stick = {
  defaults: function() {
    return { shadowVisible: true };
  },

  views: function() {
    return ['top'];
  },

  variants: function() {
    return [{id:'standard', label:'Stick'}];
  },

  draw: function(ctx, el) {
    var s = el.size || 18;
    var cl = el.color || '#ffffff';
    var poleH = s * 3.2;
    var poleR = s * 0.09;
    var baseR = s * 0.45;
    var baseH = s * 0.25;
    var baseY = baseH * 0.4;

    if (el.shadowVisible !== false) {
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath();
      ctx.ellipse(0, baseY + baseH * 0.3, baseR * 1.2, baseR * 0.25, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    var bgrad = ctx.createLinearGradient(-baseR, baseY, baseR, baseY);
    bgrad.addColorStop(0, '#1a1a1a');
    bgrad.addColorStop(0.3, '#333333');
    bgrad.addColorStop(0.5, '#444444');
    bgrad.addColorStop(0.7, '#333333');
    bgrad.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = bgrad;
    ctx.beginPath();
    ctx.ellipse(0, baseY, baseR, baseH * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    var btop = ctx.createRadialGradient(0, baseY - baseH * 0.3, 1, 0, baseY - baseH * 0.3, baseR);
    btop.addColorStop(0, '#555555');
    btop.addColorStop(0.5, '#333333');
    btop.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = btop;
    ctx.beginPath();
    ctx.ellipse(0, baseY - baseH * 0.25, baseR * 0.7, baseH * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    var socket = ctx.createRadialGradient(0, baseY - baseH * 0.35, 1, 0, baseY - baseH * 0.35, baseR * 0.35);
    socket.addColorStop(0, '#222222');
    socket.addColorStop(1, '#111111');
    ctx.fillStyle = socket;
    ctx.beginPath();
    ctx.ellipse(0, baseY - baseH * 0.35, baseR * 0.35, baseH * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    var pTop = baseY - baseH * 0.35 - poleH;

    var pGrad = ctx.createLinearGradient(-poleR, 0, poleR, 0);
    pGrad.addColorStop(0, EqUtils.lightColor(cl, -50));
    pGrad.addColorStop(0.2, EqUtils.lightColor(cl, -20));
    pGrad.addColorStop(0.45, EqUtils.lightColor(cl, 30));
    pGrad.addColorStop(0.55, '#ffffff');
    pGrad.addColorStop(0.7, EqUtils.lightColor(cl, 10));
    pGrad.addColorStop(0.85, EqUtils.lightColor(cl, -25));
    pGrad.addColorStop(1, EqUtils.lightColor(cl, -50));
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.moveTo(-poleR, baseY - baseH * 0.35);
    ctx.lineTo(-poleR, pTop + poleR);
    ctx.quadraticCurveTo(-poleR, pTop, 0, pTop);
    ctx.quadraticCurveTo(poleR, pTop, poleR, pTop + poleR);
    ctx.lineTo(poleR, baseY - baseH * 0.35);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-poleR * 0.3, baseY - baseH * 0.35 - 2);
    ctx.lineTo(-poleR * 0.3, pTop + poleR + 2);
    ctx.stroke();

    var tGrad = ctx.createRadialGradient(-poleR * 0.15, pTop - poleR * 0.15, 1, 0, pTop, poleR * 1.2);
    tGrad.addColorStop(0, '#ffffff');
    tGrad.addColorStop(0.3, EqUtils.lightColor(cl, 40));
    tGrad.addColorStop(1, cl);
    ctx.fillStyle = tGrad;
    ctx.beginPath();
    ctx.ellipse(0, pTop, poleR, poleR * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  },

  bounds: function(el) {
    var s = el.size || 18;
    var baseR = s * 0.45;
    var poleH = s * 3.2;
    var baseH = s * 0.25;
    var r = Math.max(baseR, s * 0.3);
    return {x: -r, y: -poleH - baseH, w: r * 2, h: poleH + baseH * 2 + 6};
  }
};

EquipmentRenderer.register('stick', Stick);
