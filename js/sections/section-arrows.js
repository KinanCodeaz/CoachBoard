'use strict';
// CoachBoard Pro - Section: Arrows
SEC.add({
  id: 'arrows',
  tools: ['arrowSolid', 'arrowDashed', 'arrowDotted', 'arrowCurved', 'arrowMulti', 'arrowDoublePoly', 'arrowSlalom'],

  elName: function(type) {
    return t('arrow_n');
  },

  dc: function(type) {
    return { arrowSolid: '#ffffff', arrowDashed: '#f0c040', arrowDotted: '#40c0e8', arrowCurved: '#c070f0', arrowMulti: '#50e870', arrowDoublePoly: '#f0c040', arrowSlalom: '#ff6b2b' }[type] || '#ffffff';
  },

  bounds: function(el) {
    if (el.ax2 !== undefined) {
      var mX = Math.min(el.x, el.ax2) - 10, mY = Math.min(el.y, el.ay2) - 10;
      return { x: mX, y: mY, w: Math.max(el.x, el.ax2) + 10 - mX, h: Math.max(el.y, el.ay2) + 10 - mY };
    }
    if (el.points && el.points.length) {
      var mnx = Infinity, mny = Infinity, mxx = -Infinity, mxy = -Infinity;
      for (var i = 0; i < el.points.length; i++) { var pt = el.points[i]; if (pt.x < mnx) mnx = pt.x; if (pt.y < mny) mny = pt.y; if (pt.x > mxx) mxx = pt.x; if (pt.y > mxy) mxy = pt.y; }
      return { x: mnx - 10, y: mny - 10, w: mxx - mnx + 20, h: mxy - mny + 20 };
    }
    var s = el.size || 18;
    return { x: el.x - s, y: el.y - s, w: s * 2, h: s * 2 };
  },

  center: function(el) {
    if (el.ax2 !== undefined) return { x: (el.x + el.ax2) / 2, y: (el.y + el.ay2) / 2 };
    if (el.points && el.points.length) {
      var sx = 0, sy = 0;
      for (var i = 0; i < el.points.length; i++) { sx += el.points[i].x; sy += el.points[i].y; }
      return { x: sx / el.points.length, y: sy / el.points.length };
    }
    return { x: el.x, y: el.y };
  },

  placeEl: function(type, x, y, el) {
    el.color = el.color || this.dc(type);
    if (type === 'arrowCurved') el.curve = 40;
    if (type === 'arrowDoublePoly') el.size = 3;
    if (type === 'arrowSlalom') { el.slalomAmp = 15; el.slalomFreq = 2; }
  },

  draw: function(el) {
    if (el.type === 'arrowSolid' || el.type === 'arrowDashed' || el.type === 'arrowDotted' || el.type === 'arrowCurved') {
      this._drawArrow(el);
    } else if (el.type === 'arrowMulti') {
      this._drawMultiArrow(el);
    } else if (el.type === 'arrowDoublePoly') {
      this._drawArrowDoublePoly(el);
    } else if (el.type === 'arrowSlalom') {
      this._drawSlalom(el);
    }
  },

  _drawArrow: function(el) {
    if (el.ax2 === undefined) return;
    cx.save();
    var cl = el.color || '#ffffff';
    cx.strokeStyle = cl; cx.fillStyle = cl; cx.lineWidth = el.size || 2.5; cx.setLineDash([]);
    if (el.type === 'arrowDashed') cx.setLineDash([10, 6]);
    else if (el.type === 'arrowDotted') cx.setLineDash([4, 4]);
    var x1 = el.x, y1 = el.y, x2 = el.ax2, y2 = el.ay2;
    if (el.type === 'arrowCurved' && el.curve) {
      var mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, l = Math.sqrt(dx * dx + dy * dy) || 1;
      var nx = -dy / l, ny = dx / l, ccx = mx + nx * el.curve, ccy = my + ny * el.curve;
      cx.beginPath(); cx.moveTo(x1, y1); cx.quadraticCurveTo(ccx, ccy, x2, y2); cx.stroke();
      var tt = 0.94, tx = (1 - tt) * (1 - tt) * x1 + 2 * (1 - tt) * tt * ccx + tt * tt * x2, ty = (1 - tt) * (1 - tt) * y1 + 2 * (1 - tt) * tt * ccy + tt * tt * y2;
      this._drawAH(x2, y2, Math.atan2(y2 - ty, x2 - tx), cl);
    } else {
      cx.beginPath(); cx.moveTo(x1, y1); cx.lineTo(x2, y2); cx.stroke();
      this._drawAH(x2, y2, Math.atan2(y2 - y1, x2 - x1), cl);
    }
    cx.setLineDash([]);
    cx.restore();
  },

  _drawMultiArrow: function(el) {
    if (!el.points || el.points.length < 2) return;
    cx.save();
    var cl = el.color || '#50e870';
    cx.strokeStyle = cl; cx.fillStyle = cl; cx.lineWidth = el.size || 2.5; cx.setLineDash([]);
    cx.beginPath(); cx.moveTo(el.points[0].x, el.points[0].y);
    for (var i = 1; i < el.points.length; i++) cx.lineTo(el.points[i].x, el.points[i].y);
    cx.stroke();
    var lp = el.points[el.points.length - 1], pp = el.points[el.points.length - 2];
    this._drawAH(lp.x, lp.y, Math.atan2(lp.y - pp.y, lp.x - pp.x), cl);
    for (var i = 0; i < el.points.length; i++) { cx.fillStyle = cl; cx.beginPath(); cx.arc(el.points[i].x, el.points[i].y, 4, 0, Math.PI * 2); cx.fill(); cx.strokeStyle = '#fff'; cx.lineWidth = 1; cx.stroke(); }
    cx.restore();
  },

  _drawArrowDoublePoly: function(el) {
    if (!el.points || el.points.length < 2) return;
    cx.save();
    var cl = el.color || '#f0c040';
    cx.fillStyle = cl; cx.lineCap = 'round'; cx.lineJoin = 'round';
    var pts = el.points, offset = 8;
    for (var i = 0; i < pts.length - 1; i++) {
      var x1 = pts[i].x, y1 = pts[i].y, x2 = pts[i + 1].x, y2 = pts[i + 1].y, dx = x2 - x1, dy = y2 - y1, l = Math.sqrt(dx * dx + dy * dy) || 1;
      var nx = -dy / l, ny = dx / l;
      cx.strokeStyle = cl; cx.lineWidth = 3; cx.setLineDash([]); cx.beginPath(); cx.moveTo(x1, y1); cx.lineTo(x2, y2); cx.stroke();
      cx.strokeStyle = cl; cx.lineWidth = 1.5; cx.setLineDash([8, 5]); cx.beginPath(); cx.moveTo(x1 - nx * offset, y1 - ny * offset); cx.lineTo(x2 - nx * offset, y2 - ny * offset); cx.stroke();
    }
    var lp = pts[pts.length - 1], pp = pts[pts.length - 2];
    this._drawAH(lp.x, lp.y, Math.atan2(lp.y - pp.y, lp.x - pp.x), cl);
    var dx2 = lp.x - pp.x, dy2 = lp.y - pp.y, l2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
    var nh2x = -dy2 / l2, nh2y = dx2 / l2;
    this._drawAH(lp.x - nh2x * offset, lp.y - nh2y * offset, Math.atan2(lp.y - pp.y, lp.x - pp.x), cl);
    for (var i = 0; i < pts.length; i++) { cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(pts[i].x, pts[i].y, 3, 0, Math.PI * 2); cx.fill(); cx.strokeStyle = cl; cx.lineWidth = 1.5; cx.stroke(); }
    cx.restore();
  },

  _drawSlalom: function(el) {
    if (el.ax2 === undefined && (!el.points || el.points.length < 2)) return;
    cx.save();
    var cl = el.color || '#ff6b2b', amp = el.slalomAmp || 15, freq = el.slalomFreq || 2;
    cx.strokeStyle = cl; cx.fillStyle = cl; cx.lineWidth = el.size || 2.5; cx.lineCap = 'round'; cx.lineJoin = 'round';
    var x1, y1, x2, y2;
    if (el.ax2 !== undefined) { x1 = el.x; y1 = el.y; x2 = el.ax2; y2 = el.ay2; }
    else { x1 = el.points[0].x; y1 = el.points[0].y; x2 = el.points[el.points.length - 1].x; y2 = el.points[el.points.length - 1].y; }
    var dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy) || 1, nx = -dy / len, ny = dx / len, steps = 40;
    var lastPx = x1, lastPy = y1;
    cx.setLineDash([]); cx.beginPath(); cx.moveTo(x1, y1);
    for (var i = 1; i <= steps; i++) { var t = i / steps, px = x1 + dx * t + nx * Math.sin(t * freq * Math.PI * 2) * amp, py = y1 + dy * t + ny * Math.sin(t * freq * Math.PI * 2) * amp; cx.lineTo(px, py); lastPx = px; lastPy = py; }
    cx.stroke();
    this._drawAH(x2, y2, Math.atan2(y2 - (y1 + dy * 0.95 + ny * Math.sin(0.95 * freq * Math.PI * 2) * amp), x2 - (x1 + dx * 0.95 + nx * Math.sin(0.95 * freq * Math.PI * 2) * amp)), cl);
    cx.fillStyle = cl; cx.beginPath(); cx.arc(x1, y1, 4, 0, Math.PI * 2); cx.fill(); cx.strokeStyle = '#fff'; cx.lineWidth = 1; cx.stroke();
    cx.restore();
  },

  _drawAH: function(x, y, a, cl) {
    var h = 12; cx.fillStyle = cl;
    cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x - h * Math.cos(a - Math.PI / 6), y - h * Math.sin(a - Math.PI / 6)); cx.lineTo(x - h * Math.cos(a + Math.PI / 6), y - h * Math.sin(a + Math.PI / 6)); cx.closePath(); cx.fill();
  },

  mouseDown: function(e, p) {
    if (tool === 'arrowSolid' || tool === 'arrowDashed' || tool === 'arrowDotted') {
      drawingArr = true; arrS = { x: p.x, y: p.y }; arrP = { x: p.x + 1, y: p.y }; reqRender(); return true;
    }
    if (tool === 'arrowCurved') {
      if (!arrS) { arrS = { x: p.x, y: p.y }; arrP = { x: p.x, y: p.y }; reqRender(); }
      else { var d = Math.sqrt((p.x - arrS.x) ** 2 + (p.y - arrS.y) ** 2); if (d > 12) { els.push({ id: uid(), type: 'arrowCurved', x: arrS.x, y: arrS.y, ax2: p.x, ay2: p.y, color: '#c070f0', size: 2.5, rotation: 0, opacity: 1, groupId: null, linkedToId: null, linkOffset: null, curve: 40, hidden: false, locked: false }); selIds.clear(); selIds.add(els[els.length - 1].id); saveH(); updateProps(); updateLayers(); } arrS = null; arrP = null; reqRender(); }
      return true;
    }
    if (tool === 'arrowMulti' || tool === 'arrowDoublePoly' || tool === 'arrowSlalom') {
      if (!multiArrPoints) multiArrPoints = []; multiArrPoints.push({ x: p.x, y: p.y }); reqRender(); return true;
    }
    return false;
  },

  mouseMove: function(e, p) {
    if (tool === 'arrowCurved' && arrS && !drawingArr) { arrP = { x: p.x, y: p.y }; reqRender(); return true; }
    if (drawingArr && arrS) { arrP = { x: p.x, y: p.y }; reqRender(); return true; }
  },

  mouseUp: function(e, p) {
    if (drawingArr && arrS) {
      var d = Math.sqrt((p.x - arrS.x) ** 2 + (p.y - arrS.y) ** 2);
      if (d > 12) {
        var aColMap = { arrowSolid: '#ffffff', arrowDashed: '#f0c040', arrowDotted: '#40c0e8', arrowCurved: '#c070f0', arrowMulti: '#50e870', arrowDoublePoly: '#f0c040', arrowSlalom: '#ff6b2b' };
        els.push({ id: uid(), type: tool, x: arrS.x, y: arrS.y, ax2: p.x, ay2: p.y, color: aColMap[tool] || '#ffffff', size: 2.5, rotation: 0, opacity: 1, groupId: null, linkedToId: null, linkOffset: null, curve: 0, hidden: false, locked: false });
        selIds.clear(); selIds.add(els[els.length - 1].id); saveH(); updateProps(); updateLayers();
      }
      drawingArr = false; arrS = null; arrP = null; reqRender(); return true;
    }
  },

  dblClick: function(e) {
    if ((tool === 'arrowMulti' || tool === 'arrowDoublePoly' || tool === 'arrowSlalom') && multiArrPoints && multiArrPoints.length >= 2) {
      var aColMap = { arrowMulti: '#50e870', arrowDoublePoly: '#f0c040', arrowSlalom: '#ff6b2b' };
      var el = { id: uid(), type: tool, x: multiArrPoints[0].x, y: multiArrPoints[0].y, points: multiArrPoints.slice(), color: aColMap[tool] || '#ff6b2b', size: tool === 'arrowDoublePoly' ? 3 : 2.5, rotation: 0, opacity: 1, groupId: null, linkedToId: null, linkOffset: null, text: '', fontSize: 18, hidden: false, locked: false };
      if (tool === 'arrowSlalom') { el.slalomAmp = 15; el.slalomFreq = 2; }
      // Link points to nearby players
      for (var pi = 0; pi < el.points.length; pi++) {
        for (var ei = 0; ei < els.length; ei++) {
          var other = els[ei];
          if (isP2D(other.type) && Math.abs(el.points[pi].x - other.x) < 15 && Math.abs(el.points[pi].y - other.y) < 15) {
            el.points[pi].linkedToId = other.id; el.points[pi].linkedOffX = el.points[pi].x - other.x; el.points[pi].linkedOffY = el.points[pi].y - other.y; break;
          }
        }
      }
      els.push(el); selIds.clear(); selIds.add(el.id); saveH(); updateProps(); updateLayers();
      multiArrPoints = null; reqRender(); return true;
    }
  },

  renderOverlay: function() {
    if (tool === 'arrowCurved' && arrS && arrP && !drawingArr) {
      this._drawArrow({ type: 'arrowCurved', x: arrS.x, y: arrS.y, ax2: arrP.x, ay2: arrP.y, color: '#c070f0', size: 2.5, curve: 40 });
    }
    if (drawingArr && arrS && arrP) {
      this._drawArrow({ type: tool, x: arrS.x, y: arrS.y, ax2: arrP.x, ay2: arrP.y, color: this.dc(tool), size: 2.5, curve: 0 });
    }
    if (tool === 'arrowMulti' && multiArrPoints && multiArrPoints.length > 0) {
      cx.save();
      var cl = '#50e870'; cx.strokeStyle = cl; cx.lineWidth = 2.5; cx.setLineDash([]);
      cx.beginPath(); cx.moveTo(multiArrPoints[0].x, multiArrPoints[0].y);
      for (var mi = 1; mi < multiArrPoints.length; mi++) cx.lineTo(multiArrPoints[mi].x, multiArrPoints[mi].y);
      cx.stroke(); cx.fillStyle = cl;
      for (var mi = 0; mi < multiArrPoints.length; mi++) { cx.beginPath(); cx.arc(multiArrPoints[mi].x, multiArrPoints[mi].y, 4, 0, Math.PI * 2); cx.fill(); }
      cx.restore();
    }
    if (tool === 'arrowSlalom' && multiArrPoints && multiArrPoints.length > 0) {
      cx.save();
      var _mc2 = '#ff6b2b'; cx.strokeStyle = _mc2; cx.lineWidth = 2.5; cx.setLineDash([]);
      cx.beginPath(); cx.moveTo(multiArrPoints[0].x, multiArrPoints[0].y);
      for (var mi = 1; mi < multiArrPoints.length; mi++) cx.lineTo(multiArrPoints[mi].x, multiArrPoints[mi].y);
      cx.stroke(); cx.fillStyle = _mc2;
      for (var mi = 0; mi < multiArrPoints.length; mi++) { cx.beginPath(); cx.arc(multiArrPoints[mi].x, multiArrPoints[mi].y, 4, 0, Math.PI * 2); cx.fill(); }
      cx.restore();
    }
    if (tool === 'arrowDoublePoly' && multiArrPoints && multiArrPoints.length > 0) {
      cx.save();
      var _mc = '#f0c040'; cx.strokeStyle = _mc; cx.lineWidth = 3; cx.setLineDash([]);
      cx.beginPath(); cx.moveTo(multiArrPoints[0].x, multiArrPoints[0].y);
      for (var mi = 1; mi < multiArrPoints.length; mi++) cx.lineTo(multiArrPoints[mi].x, multiArrPoints[mi].y);
      cx.stroke();
      cx.strokeStyle = _mc + '80'; cx.lineWidth = 1.5; cx.setLineDash([6, 4]);
      cx.beginPath(); cx.moveTo(multiArrPoints[0].x, multiArrPoints[0].y);
      for (var mi = 1; mi < multiArrPoints.length; mi++) cx.lineTo(multiArrPoints[mi].x, multiArrPoints[mi].y);
      cx.stroke(); cx.fillStyle = _mc;
      for (var mi = 0; mi < multiArrPoints.length; mi++) { cx.beginPath(); cx.arc(multiArrPoints[mi].x, multiArrPoints[mi].y, 4, 0, Math.PI * 2); cx.fill(); }
      cx.restore();
    }
  }
});
