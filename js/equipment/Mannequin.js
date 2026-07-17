var Mannequin = {
  defaults: function() {
    return { shadowVisible: true };
  },

  views: function() {
    return ['front', 'side'];
  },

  variants: function() {
    return [{id:'standard', label:'Standard'}];
  },

  draw: function(ctx, el) {
    var s = el.size || 18;
    var cl = el.color || '#ffffff';
    var view = el.view || 'front';
    ctx.save();
    if (view === 'side') this._drawSide(ctx, s, el, cl);
    else this._drawFront(ctx, s, el, cl);
    ctx.restore();
  },

  bounds: function(el) {
    var s = el.size || 18;
    var view = el.view || 'front';
    if (view === 'side') return {x: -s * 0.4, y: -s * 4.5, w: s * 0.8, h: s * 5.1};
    return {x: -s * 1.0, y: -s * 4.5, w: s * 2.0, h: s * 5.1};
  },

  _drawFront: function(ctx, s, el, cl) {
    var baseW = s * 1.6;
    var baseH = s * 0.15;
    var baseY = s * 0.3;
    var bodyW = s * 1.5;
    var bodyH = s * 1.5;
    var bodyBotY = -s * 1.2;
    var bodyTopY = bodyBotY - bodyH;
    var bodyTopW = bodyW * 1.08;
    var bodyBotW = bodyW * 0.92;
    var pipeW = s * 0.07;

    if (el.shadowVisible !== false) {
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath();
      ctx.ellipse(0, baseY + baseH * 0.6, baseW * 0.55, baseH * 1.0, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    var bg = ctx.createLinearGradient(-baseW / 2, 0, baseW / 2, 0);
    bg.addColorStop(0, '#111111');
    bg.addColorStop(0.25, '#2a2a2a');
    bg.addColorStop(0.5, '#353535');
    bg.addColorStop(0.75, '#2a2a2a');
    bg.addColorStop(1, '#111111');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(-baseW / 2, baseY, baseW, baseH, 3);
    ctx.fill();
    ctx.strokeStyle = '#444444';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.roundRect(-baseW / 2, baseY, baseW, baseH, 3);
    ctx.stroke();

    var legBot = baseY;
    var legTop = bodyBotY;
    var halfLeg = (legBot - legTop) / 2;
    var bendY = legTop + halfLeg;

    var innerX = s * 0.18;
    var outerStartX = s * 0.40;
    var outerTopX = bodyW * 0.46;

    ctx.strokeStyle = cl;
    ctx.lineWidth = pipeW;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(-innerX, legBot);
    ctx.lineTo(-innerX, legTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(innerX, legBot);
    ctx.lineTo(innerX, legTop);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-outerStartX, legBot);
    ctx.lineTo(-outerStartX, bendY);
    ctx.quadraticCurveTo(-outerStartX, bendY - s * 0.2, -outerTopX, legTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(outerStartX, legBot);
    ctx.lineTo(outerStartX, bendY);
    ctx.quadraticCurveTo(outerStartX, bendY - s * 0.2, outerTopX, legTop);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-outerTopX, legTop);
    ctx.lineTo(-outerTopX, bodyTopY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(outerTopX, legTop);
    ctx.lineTo(outerTopX, bodyTopY);
    ctx.stroke();

    var headR = s * 0.35;
    var headCY = bodyTopY - headR * 1.2;

    ctx.strokeStyle = cl;
    ctx.lineWidth = pipeW;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.arc(0, headCY, headR, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = EqUtils.hexToRgba(cl, 0.5);
    ctx.lineWidth = 0.7;
    var pad = s * 0.06;
    var cols = 7;
    var rows = 10;

    for (var c = 1; c < cols; c++) {
      var t = c / cols;
      var topX = -bodyTopW / 2 + bodyTopW * t;
      var botX = -bodyBotW / 2 + bodyBotW * t;
      ctx.beginPath();
      ctx.moveTo(topX, bodyTopY + pad);
      ctx.lineTo(botX, bodyBotY - pad);
      ctx.stroke();
    }
    for (var r = 1; r < rows; r++) {
      var t2 = r / rows;
      var curY = bodyTopY + pad + (bodyH - pad * 2) * t2;
      var curW = bodyTopW + (bodyBotW - bodyTopW) * t2;
      ctx.beginPath();
      ctx.moveTo(-curW / 2, curY);
      ctx.lineTo(curW / 2, curY);
      ctx.stroke();
    }

    ctx.strokeStyle = cl;
    ctx.lineWidth = pipeW * 0.7;
    ctx.beginPath();
    ctx.moveTo(-bodyTopW / 2, bodyTopY);
    ctx.lineTo(bodyTopW / 2, bodyTopY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-bodyBotW / 2, bodyBotY);
    ctx.lineTo(bodyBotW / 2, bodyBotY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-bodyTopW / 2, bodyTopY);
    ctx.lineTo(-bodyBotW / 2, bodyBotY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bodyTopW / 2, bodyTopY);
    ctx.lineTo(bodyBotW / 2, bodyBotY);
    ctx.stroke();
  },

  _drawSide: function(ctx, s, el, cl) {
    var baseW = s * 0.6;
    var baseH = s * 0.15;
    var baseY = s * 0.3;

    if (el.shadowVisible !== false) {
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.beginPath();
      ctx.ellipse(0, baseY + baseH * 0.6, baseW * 0.6, baseH * 1.0, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    var bg = ctx.createLinearGradient(-baseW / 2, 0, baseW / 2, 0);
    bg.addColorStop(0, '#111111');
    bg.addColorStop(0.5, '#353535');
    bg.addColorStop(1, '#111111');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(-baseW / 2, baseY, baseW, baseH, 3);
    ctx.fill();

    var poleBot = baseY;
    var poleTop = -s * 3.8;
    var poleW = s * 0.1;

    var pGrad = ctx.createLinearGradient(-poleW, 0, poleW, 0);
    pGrad.addColorStop(0, EqUtils.lightColor(cl, -40));
    pGrad.addColorStop(0.3, EqUtils.lightColor(cl, -10));
    pGrad.addColorStop(0.5, EqUtils.lightColor(cl, 25));
    pGrad.addColorStop(0.6, '#ffffff');
    pGrad.addColorStop(0.75, EqUtils.lightColor(cl, 0));
    pGrad.addColorStop(1, EqUtils.lightColor(cl, -40));
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.moveTo(-poleW, poleBot);
    ctx.lineTo(-poleW, poleTop + s * 0.3);
    ctx.quadraticCurveTo(-poleW, poleTop, 0, poleTop);
    ctx.quadraticCurveTo(poleW, poleTop, poleW, poleTop + s * 0.3);
    ctx.lineTo(poleW, poleBot);
    ctx.closePath();
    ctx.fill();
  }
};

EquipmentRenderer.register('mannequin', Mannequin);
