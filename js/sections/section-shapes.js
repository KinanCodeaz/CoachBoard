'use strict';
// CoachBoard Pro - Section: Shapes & Zones
SEC.add({
  id: 'shapes',
  tools: ['zoneCircle', 'zoneRect', 'zoneTriangle', 'zoneRect2C', 'spinRing', 'zone18'],

  elName: function(type) {
    var map = { zoneCircle: 'zone_circle_n', zoneRect: 'zone_rect_n', zoneTriangle: 'zone_tri_n', zoneRect2C: 'zone_rect_n', spinRing: 'zone_circle_n', zone18: 'zone_rect_n' };
    return t(map[type] || 'zone_circle_n');
  },

  dc: function(type) {
    return { zoneCircle: '#00e5ff', zoneRect: '#00e5ff', zoneTriangle: '#d29922', zoneRect2C: '#ff69b4', spinRing: '#00e5ff', zone18: '#40c0e8' }[type] || '#00e5ff';
  },

  bounds: function(el) {
    var s = el.size || 18, zw = el.zoneW || s * 2.4, zh = el.zoneH || s * 1.6;
    return { x: el.x - zw / 2, y: el.y - zh / 2, w: zw, h: zh };
  },

  center: function(el) {
    return { x: el.x, y: el.y };
  },

  placeEl: function(type, x, y, el) {
    var dz = { w: 2.4, h: 1.6 };
    if (type === 'zoneCircle') { dz = { w: 2, h: 2 }; }
    else if (type === 'zoneRect' || type === 'zoneRect2C') { dz = { w: 2, h: 1.4 }; }
    else if (type === 'zoneTriangle') { dz = { w: 2.4, h: 1.68 }; }
    else if (type === 'spinRing') { dz = { w: 2, h: 2 }; }
    el.size = 40;
    el.zoneW = Math.round(el.size * dz.w);
    el.zoneH = Math.round(el.size * dz.h);
    el.lineStyle = 'dashed';
    el.lineWidth = 2;
    el.zoneColor2 = type === 'zoneRect2C' ? lightColor(el.color || '#00e5ff', 60) : type === 'zone18' ? lightColor(el.color || '#00e5ff', 40) : null;
    el.zoneRepeat = 1;
  },

  draw: function(el) {
    cx.save();
    cx.translate(el.x, el.y);
    cx.rotate((el.rotation || 0) * Math.PI / 180);
    if (el.flipH) cx.scale(-1, 1);
    if (el.flipV) cx.scale(1, -1);
    var s = el.size || 18, cl = el.color || '#00e5ff', op = el.opacity !== undefined ? el.opacity : 1;
    cx.globalAlpha = op;
    switch (el.type) {
      case 'zoneCircle':
        var zw = el.zoneW || s * 2, zh = el.zoneH || s * 2, lw = el.lineWidth || 2, ls = el.lineStyle || 'dashed', c2 = el.zoneColor2, rp = el.zoneRepeat || 1;
        cx.fillStyle = cl + '20'; cx.beginPath(); cx.ellipse(0, 0, zw / 2, zh / 2, 0, 0, Math.PI * 2); cx.fill();
        if (c2 && rp > 1) { for (var zi = 0; zi < rp; zi++) { var r1 = zw * zi / rp / 2, r2 = zw * (zi + 1) / rp / 2; cx.fillStyle = zi % 2 === 0 ? cl + '30' : c2 + '30'; cx.beginPath(); cx.ellipse(0, 0, r2, zh * r2 / zw, 0, 0, Math.PI * 2); cx.fill(); } cx.fillStyle = cl + '20'; cx.beginPath(); cx.ellipse(0, 0, zw / 2, zh / 2, 0, 0, Math.PI * 2); cx.fill(); } else if (c2) { cx.fillStyle = c2 + '20'; cx.beginPath(); cx.ellipse(0, 0, zw * 0.25, zh * 0.25, 0, 0, Math.PI * 2); cx.fill(); }
        cx.strokeStyle = cl + '70'; cx.lineWidth = lw; if (ls === 'dashed') cx.setLineDash([5, 3]); else cx.setLineDash([]); cx.beginPath(); cx.ellipse(0, 0, zw / 2, zh / 2, 0, 0, Math.PI * 2); cx.stroke(); cx.setLineDash([]);
        break;
      case 'zoneRect':
        var zw = el.zoneW || s * 2, zh = el.zoneH || s * 1.4, lw = el.lineWidth || 2, ls = el.lineStyle || 'dashed', c2 = el.zoneColor2, rp = el.zoneRepeat || 1;
        cx.fillStyle = cl + '20'; cx.fillRect(-zw / 2, -zh / 2, zw, zh);
        if (c2 && rp > 1) { for (var ri = 0; ri < rp; ri++) { var rx = -zw / 2 + zw * ri / rp, rw2 = zw / rp; cx.fillStyle = ri % 2 === 0 ? cl + '30' : c2 + '30'; cx.fillRect(rx, -zh / 2, rw2, zh); } } else if (c2) { cx.fillStyle = c2 + '20'; cx.fillRect(-zw / 4, -zh / 4, zw / 2, zh / 2); }
        cx.strokeStyle = cl + '70'; cx.lineWidth = lw; if (ls === 'dashed') cx.setLineDash([5, 3]); else cx.setLineDash([]); cx.strokeRect(-zw / 2, -zh / 2, zw, zh); cx.setLineDash([]);
        break;
      case 'zoneRect2C':
        var zw = el.zoneW || s * 2, zh = el.zoneH || s * 1.4, lw = el.lineWidth || 2, ls = el.lineStyle || 'dashed', c2 = el.zoneColor2 || lightColor(cl, 60), rp = el.zoneRepeat || 1;
        cx.save(); cx.beginPath(); cx.rect(-zw / 2, -zh / 2, zw, zh); cx.clip();
        if (rp > 1) { for (var ri = 0; ri < rp; ri++) { var rx = -zw / 2 + zw * ri / rp, rw2 = zw / rp; cx.fillStyle = ri % 2 === 0 ? cl + '40' : c2 + '40'; cx.fillRect(rx, -zh / 2, rw2, zh); } } else { var g1 = cx.createLinearGradient(-zw / 2, 0, zw / 2, 0); g1.addColorStop(0, cl + '40'); g1.addColorStop(0.5, cl + '15'); g1.addColorStop(0.5, c2 + '15'); g1.addColorStop(1, c2 + '40'); cx.fillStyle = g1; cx.fillRect(-zw / 2, -zh / 2, zw, zh); }
        cx.restore(); cx.strokeStyle = cl + '80'; cx.lineWidth = lw; if (ls === 'dashed') cx.setLineDash([6, 3]); else cx.setLineDash([]); cx.strokeRect(-zw / 2, -zh / 2, zw, zh); cx.setLineDash([]);
        cx.lineWidth = Math.max(0.5, lw * 0.5); cx.strokeStyle = 'rgba(255,255,255,0.3)'; cx.beginPath(); cx.moveTo(0, -zh / 2); cx.lineTo(0, zh / 2); cx.stroke();
        break;
      case 'spinRing':
        var zw = el.zoneW || s * 2, zh = el.zoneH || s * 2, lw = el.lineWidth || 2, ls = el.lineStyle || 'dashed', spAng = spinRingPhase;
        cx.save(); cx.rotate(spAng);
        cx.strokeStyle = cl; cx.lineWidth = lw; if (ls === 'dashed') cx.setLineDash([zw * 0.2, zw * 0.15]); else cx.setLineDash([]); cx.beginPath(); cx.ellipse(0, 0, zw / 2, zh / 2, 0, 0, Math.PI * 2); cx.stroke(); cx.setLineDash([]);
        cx.strokeStyle = cl + '50'; cx.lineWidth = lw * 3; cx.beginPath(); cx.ellipse(0, 0, zw * 0.42, zh * 0.42, 0, 0, Math.PI * 1.2); cx.stroke();
        cx.fillStyle = cl + '15'; cx.beginPath(); cx.ellipse(0, 0, zw / 2, zh / 2, 0, 0, Math.PI * 2); cx.fill();
        cx.restore();
        break;
      case 'zone18':
        var zw = el.zoneW || s * 2.4, zh = el.zoneH || s * 1.6, lw = el.lineWidth || 2, ls = el.lineStyle || 'dashed';
        cx.fillStyle = cl + '20'; cx.fillRect(-zw / 2, -zh / 2, zw, zh);
        cx.strokeStyle = cl + '70'; cx.lineWidth = lw; if (ls === 'dashed') cx.setLineDash([5, 3]); else cx.setLineDash([]); cx.strokeRect(-zw / 2, -zh / 2, zw, zh); cx.setLineDash([]);
        cx.strokeStyle = cl + '50'; cx.lineWidth = Math.max(0.5, lw * 0.5);
        for (var ci = 1; ci < 6; ci++) { var cx2 = -zw / 2 + zw * ci / 6; cx.beginPath(); cx.moveTo(cx2, -zh / 2); cx.lineTo(cx2, zh / 2); cx.stroke(); }
        for (var ri = 1; ri < 3; ri++) { var cy = -zh / 2 + zh * ri / 3; cx.beginPath(); cx.moveTo(-zw / 2, cy); cx.lineTo(zw / 2, cy); cx.stroke(); }
        break;
      case 'zoneTriangle':
        var zw = el.zoneW || s * 2.4, zh = el.zoneH || s * 1.68, lw = el.lineWidth || 2, ls = el.lineStyle || 'dashed', hw = zw / 2, hh = zh / 2;
        cx.fillStyle = cl + '20'; cx.beginPath(); cx.moveTo(0, -hh); cx.lineTo(-hw, hh * 0.7); cx.lineTo(hw, hh * 0.7); cx.closePath(); cx.fill();
        cx.strokeStyle = cl + '70'; cx.lineWidth = lw; if (ls === 'dashed') cx.setLineDash([5, 3]); else cx.setLineDash([]); cx.beginPath(); cx.moveTo(0, -hh); cx.lineTo(-hw, hh * 0.7); cx.lineTo(hw, hh * 0.7); cx.closePath(); cx.stroke(); cx.setLineDash([]);
        break;
    }
    cx.globalAlpha = 1;
    cx.restore();
  },

  mouseDown: function(e, p) {
    var zoneTools = ['zoneCircle', 'zoneRect', 'zoneTriangle', 'zoneRect2C', 'spinRing', 'zone18'];
    if (zoneTools.indexOf(tool) < 0) return false;
    _shapeDrag = { sx: p.x, sy: p.y, type: tool };
    return true;
  },

  mouseMove: function(e, p) {
    if (!_shapeDrag) return false;
    var dx = p.x - _shapeDrag.sx, dy = p.y - _shapeDrag.sy;
    var w = Math.abs(dx), h = Math.abs(dy);
    if (w < 10) w = 10;
    if (h < 10) h = 10;
    _shapeDrag.w = w;
    _shapeDrag.h = h;
    _shapeDrag.cx = _shapeDrag.sx + dx / 2;
    _shapeDrag.cy = _shapeDrag.sy + dy / 2;
    reqRender();
    return true;
  },

  mouseUp: function(e, p) {
    if (!_shapeDrag) return false;
    var w = _shapeDrag.w || 60, h = _shapeDrag.h || 40;
    var cx2 = _shapeDrag.cx || _shapeDrag.sx, cy2 = _shapeDrag.cy || _shapeDrag.sy;
    var color = lastElProps.zone && lastElProps.zone.color ? lastElProps.zone.color : this.dc(_shapeDrag.type);
    var el = { id: uid(), type: _shapeDrag.type, x: cx2, y: cy2, color: color, rotation: 0, opacity: 1, size: Math.round(Math.max(w, h) / 2), zoneW: Math.round(w), zoneH: Math.round(h), lineStyle: 'dashed', lineWidth: 2, zoneColor2: null, zoneRepeat: 1, flipH: false, flipV: false, spotlight: false, spotlightColor: '#ffe864', spotlightSize: 1, poszone: false, poszoneColor: null, poszoneCount: 1, hidden: false, locked: false, groupId: null, linkedToId: null, linkOffset: null, reboundAngle: 0, viewMode: 'auto', stickBaseColor: '#333333', castShadow: false };
    els.push(el);
    selIds.clear(); selIds.add(el.id);
    saveH(); updateProps(); updateLayers();
    _shapeDrag = null;
    reqRender();
    return true;
  },

  renderOverlay: function() {
    if (!_shapeDrag || !_shapeDrag.w) return;
    cx.save();
    var cl = this.dc(_shapeDrag.type);
    cx.strokeStyle = cl;
    cx.lineWidth = 1.5;
    cx.setLineDash([4, 4]);
    cx.globalAlpha = 0.6;
    var hw = _shapeDrag.w / 2, hh = _shapeDrag.h / 2;
    cx.strokeRect(_shapeDrag.cx - hw, _shapeDrag.cy - hh, _shapeDrag.w, _shapeDrag.h);
    cx.setLineDash([]);
    cx.restore();
  }
});
