var Goal = {
  defaults: function() {
    return {
      color: '#ffffff',
      goalWidth: 2.6,
      goalHeight: 1.6,
      goalDepth: 0.9,
      postThickness: 0.12,
      netVisible: true,
      shadowVisible: true
    };
  },

  views: function() {
    return ['front', 'rear', 'top'];
  },

  variants: function() {
    return [{id:'standard', label:'5-a-side'}, {id:'full', label:'Full-size'}, {id:'pugg', label:'Pugg'}];
  },

  draw: function(ctx, el) {
    var s = el.size || 18;
    var view = el.view || 'front';
    ctx.save();
    if (view === 'front') this._drawFront(ctx, s, el);
    else if (view === 'rear') this._drawRear(ctx, s, el);
    else if (view === 'top') this._drawTop(ctx, s, el);
    ctx.restore();
  },

  bounds: function(el) {
    var s = el.size || 18;
    var gw = s * (el.goalWidth || 2.6);
    var gh = s * (el.goalHeight || 1.6);
    var gd = s * (el.goalDepth || 0.9);
    var pw = s * (el.postThickness || 0.12) * 2;
    var view = el.view || 'front';
    if (view === 'front' || view === 'rear') return {x: -gw/2 - pw, y: -gh/2 - pw, w: gw + pw*2, h: gh + pw*2 + pw};
    var tW = gw / 2;
    var tD = gd * 0.55 * 0.65 * 0.8;
    return {x: -tW - pw, y: -pw, w: tW * 2 + pw * 2, h: tD * 2 + s * 0.08 + pw};
  },

  _metalV: function(ctx, x, y, w, h, cl) {
    var g = ctx.createLinearGradient(x - w/2, 0, x + w/2, 0);
    g.addColorStop(0, EqUtils.lightColor(cl, -45));
    g.addColorStop(0.15, EqUtils.lightColor(cl, -15));
    g.addColorStop(0.4, EqUtils.lightColor(cl, 20));
    g.addColorStop(0.52, '#ffffff');
    g.addColorStop(0.64, EqUtils.lightColor(cl, 20));
    g.addColorStop(0.85, EqUtils.lightColor(cl, -15));
    g.addColorStop(1, EqUtils.lightColor(cl, -45));
    ctx.fillStyle = g;
    ctx.fillRect(x - w/2, y, w, h);
  },

  _metalH: function(ctx, x, y, w, h, cl) {
    var g = ctx.createLinearGradient(0, y - h/2, 0, y + h/2);
    g.addColorStop(0, EqUtils.lightColor(cl, -45));
    g.addColorStop(0.15, EqUtils.lightColor(cl, -15));
    g.addColorStop(0.4, EqUtils.lightColor(cl, 20));
    g.addColorStop(0.52, '#ffffff');
    g.addColorStop(0.64, EqUtils.lightColor(cl, 20));
    g.addColorStop(0.85, EqUtils.lightColor(cl, -15));
    g.addColorStop(1, EqUtils.lightColor(cl, -45));
    ctx.fillStyle = g;
    ctx.fillRect(x, y - h/2, w, h);
  },

  _cap: function(ctx, x, y, r, cl) {
    var g = ctx.createRadialGradient(x - r*0.2, y - r*0.2, r*0.1, x, y, r);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.3, EqUtils.lightColor(cl, 30));
    g.addColorStop(1, EqUtils.lightColor(cl, -20));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  },

  _netFront: function(ctx, left, top, right, bottom, cols, rows) {
    var w = right - left;
    var h = bottom - top;
    var sx = w / cols;
    var sy = h / rows;
    var i, x, y;
    ctx.strokeStyle = 'rgba(255,255,255,0.18)';
    ctx.lineWidth = 0.6;
    for (i = 1; i < cols; i++) {
      x = left + sx * i;
      ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bottom); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.14)';
    for (i = 1; i < rows; i++) {
      y = top + sy * i;
      ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 0.4;
    var dcols = Math.round(cols * 1.4);
    var drows = Math.round(rows * 1.4);
    var dsx = w / dcols;
    var dsy = h / drows;
    for (i = 0; i <= dcols; i++) {
      x = left + dsx * i;
      ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(left + (bottom - top) * 0.3 + x * 0.7, bottom); ctx.stroke();
    }
    for (i = 0; i <= drows; i++) {
      y = top + dsy * i;
      ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y + (right - left) * 0.15); ctx.stroke();
    }
  },

  _drawFront: function(ctx, s, el) {
    var gw = s * (el.goalWidth || 2.6);
    var gh = s * (el.goalHeight || 1.6);
    var pt = s * (el.postThickness || 0.12);
    var pw = pt * 2;
    var halfW = gw / 2;
    var halfH = gh / 2;
    var cl = el.color || '#ffffff';

    if (el.shadowVisible !== false) {
      ctx.fillStyle = 'rgba(0,0,0,0.10)';
      ctx.beginPath();
      ctx.ellipse(0, halfH + pt * 0.8, gw * 0.56, pt * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (el.netVisible !== false) {
      this._netFront(ctx, -halfW + pw, -halfH + pw, halfW - pw, halfH - pw * 0.3, 10, 7);
    }

    this._metalV(ctx, -halfW, -halfH, pw, gh, cl);
    this._metalV(ctx, halfW, -halfH, pw, gh, cl);
    this._metalH(ctx, -halfW, -halfH, gw, pw, cl);

    this._cap(ctx, -halfW, -halfH, pw * 0.55, cl);
    this._cap(ctx, halfW, -halfH, pw * 0.55, cl);

    ctx.strokeStyle = EqUtils.hexToRgba(cl, 0.25);
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(-halfW + pw * 0.3, halfH);
    ctx.lineTo(-halfW + pw * 0.3, -halfH + pw);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(halfW - pw * 0.3, halfH);
    ctx.lineTo(halfW - pw * 0.3, -halfH + pw);
    ctx.stroke();

    ctx.strokeStyle = EqUtils.hexToRgba(cl, 0.18);
    ctx.beginPath();
    ctx.moveTo(-halfW, -halfH + pw * 0.3);
    ctx.lineTo(halfW, -halfH + pw * 0.3);
    ctx.stroke();
  },

  _drawRear: function(ctx, s, el) {
    var gw = s * (el.goalWidth || 2.6);
    var gh = s * (el.goalHeight || 1.6);
    var gd = s * (el.goalDepth || 0.9);
    var pt = s * (el.postThickness || 0.12);
    var pw = pt * 2;
    var halfW = gw / 2;
    var halfH = gh / 2;
    var cl = el.color || '#ffffff';

    if (el.shadowVisible !== false) {
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.beginPath();
      ctx.ellipse(0, halfH + pt * 0.8, gw * 0.56, pt * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalAlpha = 0.32;
    this._metalV(ctx, -halfW, -halfH, pw, gh, cl);
    this._metalV(ctx, halfW, -halfH, pw, gh, cl);
    this._metalH(ctx, -halfW, -halfH, gw, pw, cl);
    ctx.globalAlpha = 1;

    var rrW = halfW * 0.55;
    var rrTop = -halfH * 0.68;
    var rrBot = halfH;
    var rrX = gd * 0.22;
    ctx.strokeStyle = EqUtils.hexToRgba(cl, 0.30);
    ctx.lineWidth = pw * 0.35;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-rrX - rrW, rrBot);
    ctx.lineTo(rrX + rrW, rrBot);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-rrX - rrW, rrTop);
    ctx.lineTo(rrX + rrW, rrTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-rrX - rrW, rrTop);
    ctx.lineTo(-rrX - rrW, rrBot);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(rrX + rrW, rrTop);
    ctx.lineTo(rrX + rrW, rrBot);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-halfW, -halfH + pw);
    ctx.lineTo(-rrX - rrW, rrTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(halfW, -halfH + pw);
    ctx.lineTo(rrX + rrW, rrTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-halfW, halfH);
    ctx.lineTo(-rrX - rrW, rrBot);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(halfW, halfH);
    ctx.lineTo(rrX + rrW, rrBot);
    ctx.stroke();

    if (el.netVisible !== false) {
      var nL = -halfW + pw;
      var nT = -halfH + pw;
      var nR = halfW - pw;
      var nB = halfH;
      var nW = nR - nL;
      var nH = nB - nT;
      var cols = 12;
      var rows = 9;
      var sx = nW / cols;
      var sy = nH / rows;
      var sagX = nW * 0.06;
      var sagY = nH * 0.04;
      var i, x, y, t;

      ctx.strokeStyle = 'rgba(255,255,255,0.28)';
      ctx.lineWidth = 0.75;
      for (i = 1; i < cols; i++) {
        x = nL + sx * i;
        t = (i / cols) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(x, nT);
        ctx.quadraticCurveTo(x + Math.sin(t) * sagX * 0.3, nT + nH * 0.5, x, nB);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = 0.65;
      for (i = 1; i < rows; i++) {
        y = nT + sy * i;
        t = (i / rows) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(nL, y);
        ctx.quadraticCurveTo(nL + nW * 0.5, y + Math.sin(t) * sagY, nR, y);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.14)';
      ctx.lineWidth = 0.45;
      var dcols = Math.round(cols * 1.5);
      var drows = Math.round(rows * 1.5);
      var dsx = nW / dcols;
      var dsy = nH / drows;
      for (i = 0; i <= dcols; i++) {
        x = nL + dsx * i;
        t = (i / dcols) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(x, nT);
        ctx.quadraticCurveTo(x + Math.sin(t) * sagX * 0.5, nT + nH * 0.55, x + sagX * 0.4, nB);
        ctx.stroke();
      }
      for (i = 0; i <= drows; i++) {
        y = nT + dsy * i;
        t = (i / drows) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(nL, y);
        ctx.quadraticCurveTo(nL + nW * 0.5, y + Math.sin(t) * sagY * 0.8, nR, y + sagY * 0.5);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.17)';
      ctx.lineWidth = 0.5;
      for (i = 0; i <= dcols; i++) {
        x = nL + dsx * i;
        t = (i / dcols) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(x + sagX * 0.4, nT);
        ctx.quadraticCurveTo(x + Math.sin(t) * sagX * 0.5, nT + nH * 0.55, x, nB);
        ctx.stroke();
      }
      for (i = 0; i <= drows; i++) {
        y = nT + dsy * i;
        t = (i / drows) * Math.PI;
        ctx.beginPath();
        ctx.moveTo(nR, y);
        ctx.quadraticCurveTo(nL + nW * 0.5, y + Math.sin(t) * sagY * 0.8, nL, y + sagY * 0.5);
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 0.28;
    this._cap(ctx, -halfW, -halfH, pw * 0.5, cl);
    this._cap(ctx, halfW, -halfH, pw * 0.5, cl);
    ctx.globalAlpha = 1;
  },

  _drawTop: function(ctx, s, el) {
    var gw = s * (el.goalWidth || 2.6);
    var gh = s * (el.goalHeight || 1.6);
    var gd = s * (el.goalDepth || 0.9);
    var pt = s * (el.postThickness || 0.12);
    var pw = pt * 2;
    var cl = el.color || '#ffffff';
    var tW = gw / 2;
    var tD = gd * 0.55 * 0.65 * 0.8;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.beginPath();
    ctx.moveTo(-tW, 0); ctx.lineTo(tW, 0);
    ctx.lineTo(tW * 0.7, tD * 2); ctx.lineTo(-tW * 0.7, tD * 2);
    ctx.closePath(); ctx.fill();

    ctx.fillStyle = EqUtils.hexToRgba(cl, 0.38);
    ctx.fillRect(-tW * 0.65, tD * 1.6, tW * 1.3, s * 0.08);
    ctx.strokeStyle = EqUtils.hexToRgba(cl, 0.50);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-tW * 0.65, tD * 1.6, tW * 1.3, s * 0.08);

    ctx.strokeStyle = cl; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-tW, 0); ctx.lineTo(-tW, tD * 1.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tW, 0); ctx.lineTo(tW, tD * 1.6); ctx.stroke();

    ctx.beginPath(); ctx.moveTo(-tW, 0); ctx.lineTo(tW, 0); ctx.stroke();

    ctx.strokeStyle = EqUtils.hexToRgba(cl, 0.38); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-tW * 0.7, tD * 2); ctx.lineTo(-tW * 0.7, tD * 1.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(tW * 0.7, tD * 2); ctx.lineTo(tW * 0.7, tD * 1.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-tW * 0.7, tD * 2); ctx.lineTo(tW * 0.7, tD * 2); ctx.stroke();

    if (el.netVisible !== false) {
      ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 0.5;
      for (var mi2 = 1; mi2 < 8; mi2++) {
        var my2 = (tD * 2 / 8) * mi2;
        var mw2 = tW - (tW - tW * 0.7) * (mi2 / 8);
        ctx.beginPath(); ctx.moveTo(-mw2, my2); ctx.lineTo(mw2, my2); ctx.stroke();
      }
      for (var mj2 = 1; mj2 < 6; mj2++) {
        var mjf = mj2 / 6;
        var jx1 = -tW + tW * 2 * mjf;
        var jx2 = -tW * 0.7 + tW * 1.4 * mjf;
        ctx.beginPath(); ctx.moveTo(jx1, 0); ctx.lineTo(jx2, tD * 2); ctx.stroke();
      }
    }

    ctx.strokeStyle = cl; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-tW, 0); ctx.lineTo(tW, 0); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-tW + 3, 3); ctx.lineTo(tW - 3, 3); ctx.stroke();
  }
};

EquipmentRenderer.register('smallGoal', Goal);
