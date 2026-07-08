'use strict';
// CoachBoard Pro - Section: Drawing & Text
var _txtPos = null; // stores click position for text modal

SEC.add({
  id: 'drawing',
  tools: ['freehand', 'highlighter', 'text', 'number'],

  elName: function(type) {
    var map = { freehand: 'freehand_n', highlighter: 'highlight_n', text: 'text_n', number: 'number_n' };
    return t(map[type] || 'freehand_n');
  },

  dc: function(type) {
    return { text: '#ffffff', number: '#e8960c' }[type] || '#ffffff';
  },

  bounds: function(el) {
    if ((el.type === 'freehand' || el.type === 'highlighter') && el.points && el.points.length) {
      var mnx = Infinity, mny = Infinity, mxx = -Infinity, mxy = -Infinity;
      for (var i = 0; i < el.points.length; i++) { var pt = el.points[i]; if (pt.x < mnx) mnx = pt.x; if (pt.y < mny) mny = pt.y; if (pt.x > mxx) mxx = pt.x; if (pt.y > mxy) mxy = pt.y; }
      return { x: mnx - 5, y: mny - 5, w: mxx - mnx + 10, h: mxy - mny + 10 };
    }
    if (el.type === 'text' || el.type === 'number') {
      var fs = el.fontSize || 18;
      cx.font = (el.type === 'number' ? '900 ' : 'bold ') + fs + 'px Cairo,Inter';
      var m = cx.measureText(el.text || '');
      return { x: el.x - m.width / 2 - 3, y: el.y - fs / 2 - 1, w: m.width + 6, h: fs + 2 };
    }
    var s = el.size || 18;
    return { x: el.x - s, y: el.y - s, w: s * 2, h: s * 2 };
  },

  center: function(el) {
    if ((el.type === 'freehand' || el.type === 'highlighter') && el.points && el.points.length) {
      var sx = 0, sy = 0;
      for (var i = 0; i < el.points.length; i++) { sx += el.points[i].x; sy += el.points[i].y; }
      return { x: sx / el.points.length, y: sy / el.points.length };
    }
    return { x: el.x, y: el.y };
  },

  placeEl: function(type, x, y, el) {
    if (type === 'number') { el.text = String(nCnt++); el.fontSize = 24; el.color = '#e8960c'; el.fontFamily = 'Inter,Cairo'; el.bold = true; el.bgColor = null; el.borderColor = null; }
  },

  draw: function(el) {
    if (el.type === 'freehand' || el.type === 'highlighter') {
      this._drawFreehand(el); return;
    }
    cx.save();
    cx.translate(el.x, el.y);
    cx.rotate((el.rotation || 0) * Math.PI / 180);
    var op = el.opacity !== undefined ? el.opacity : 1;
    cx.globalAlpha = op;
    switch (el.type) {
      case 'text':
        var fs = el.fontSize || 18;
        var fw = el.bold !== false ? 'bold ' : '';
        var fi = el.italic ? 'italic ' : '';
        cx.font = fw + fi + fs + 'px ' + (el.fontFamily || 'Cairo,Inter');
        cx.textAlign = 'center'; cx.textBaseline = 'middle';
        var m = cx.measureText(el.text || '');
        var tw = m.width + 8, th = fs + 8, r = 3;
        if (el.bgColor) {
          cx.fillStyle = el.bgColor;
          cx.beginPath(); cx.moveTo(-tw/2+r, -th/2); cx.lineTo(tw/2-r, -th/2); cx.quadraticCurveTo(tw/2, -th/2, tw/2, -th/2+r); cx.lineTo(tw/2, th/2-r); cx.quadraticCurveTo(tw/2, th/2, tw/2-r, th/2); cx.lineTo(-tw/2+r, th/2); cx.quadraticCurveTo(-tw/2, th/2, -tw/2, th/2-r); cx.lineTo(-tw/2, -th/2+r); cx.quadraticCurveTo(-tw/2, -th/2, -tw/2+r, -th/2); cx.closePath(); cx.fill();
        }
        if (el.borderColor) {
          cx.strokeStyle = el.borderColor; cx.lineWidth = 1.5;
          cx.beginPath(); cx.moveTo(-tw/2+r, -th/2); cx.lineTo(tw/2-r, -th/2); cx.quadraticCurveTo(tw/2, -th/2, tw/2, -th/2+r); cx.lineTo(tw/2, th/2-r); cx.quadraticCurveTo(tw/2, th/2, tw/2-r, th/2); cx.lineTo(-tw/2+r, th/2); cx.quadraticCurveTo(-tw/2, th/2, -tw/2, th/2-r); cx.lineTo(-tw/2, -th/2+r); cx.quadraticCurveTo(-tw/2, -th/2, -tw/2+r, -th/2); cx.closePath(); cx.stroke();
        }
        cx.fillStyle = el.color || '#ffffff';
        cx.fillText(el.text || '', 0, 0);
        break;
      case 'number':
        var nfs = el.fontSize || 24;
        var nfw = '900 ';
        var nfi = el.italic ? 'italic ' : '';
        cx.font = nfw + nfi + nfs + 'px ' + (el.fontFamily || 'Inter,Cairo');
        cx.textAlign = 'center'; cx.textBaseline = 'middle';
        var nm = cx.measureText(el.text || '');
        var nw = nm.width + 10, nh = nfs + 10, nr = 4;
        if (el.bgColor) {
          cx.fillStyle = el.bgColor;
          cx.beginPath(); cx.moveTo(-nw/2+nr, -nh/2); cx.lineTo(nw/2-nr, -nh/2); cx.quadraticCurveTo(nw/2, -nh/2, nw/2, -nh/2+nr); cx.lineTo(nw/2, nh/2-nr); cx.quadraticCurveTo(nw/2, nh/2, nw/2-nr, nh/2); cx.lineTo(-nw/2+nr, nh/2); cx.quadraticCurveTo(-nw/2, nh/2, -nw/2, nh/2-nr); cx.lineTo(-nw/2, -nh/2+nr); cx.quadraticCurveTo(-nw/2, -nh/2, -nw/2+nr, -nh/2); cx.closePath(); cx.fill();
        }
        if (el.borderColor) {
          cx.strokeStyle = el.borderColor; cx.lineWidth = 2;
          cx.beginPath(); cx.moveTo(-nw/2+nr, -nh/2); cx.lineTo(nw/2-nr, -nh/2); cx.quadraticCurveTo(nw/2, -nh/2, nw/2, -nh/2+nr); cx.lineTo(nw/2, nh/2-nr); cx.quadraticCurveTo(nw/2, nh/2, nw/2-nr, nh/2); cx.lineTo(-nw/2+nr, nh/2); cx.quadraticCurveTo(-nw/2, nh/2, -nw/2, nh/2-nr); cx.lineTo(-nw/2, -nh/2+nr); cx.quadraticCurveTo(-nw/2, -nh/2, -nw/2+nr, -nh/2); cx.closePath(); cx.stroke();
        }
        cx.shadowColor = 'rgba(0,0,0,0.3)'; cx.shadowBlur = 2;
        cx.fillStyle = el.color || '#e8960c';
        cx.fillText(el.text || '', 0, 0);
        cx.shadowBlur = 0;
        break;
    }
    cx.globalAlpha = 1;
    cx.restore();
  },

  _drawFreehand: function(el) {
    if (!el.points || el.points.length < 2) return;
    cx.save();
    cx.globalAlpha = el.opacity !== undefined ? el.opacity : 1;
    cx.strokeStyle = el.color || '#ffffff'; cx.lineWidth = el.size || 3;
    cx.lineCap = 'round'; cx.lineJoin = 'round';
    if (el.type === 'highlighter') { cx.lineWidth = el.size || 16; cx.globalAlpha = 0.35; }
    cx.beginPath(); cx.moveTo(el.points[0].x, el.points[0].y);
    for (var i = 1; i < el.points.length; i++) cx.lineTo(el.points[i].x, el.points[i].y);
    cx.stroke();
    cx.restore();
  },

  mouseDown: function(e, p) {
    if (tool === 'pen' || tool === 'highlighter') {
      drawingFree = true; freePoints = [{ x: p.x, y: p.y }]; return true;
    }
    if (tool === 'text') {
      _txtPos = { x: p.x, y: p.y };
      showTextModal();
      return true;
    }
    return false;
  },

  mouseMove: function(e, p) {
    if (drawingFree) { freePoints.push({ x: p.x, y: p.y }); reqRender(); return true; }
  },

  mouseUp: function(e, p) {
    if (drawingFree && freePoints.length > 1) {
      els.push({ id: uid(), type: tool === 'highlighter' ? 'highlighter' : 'freehand', x: 0, y: 0, points: freePoints.slice(), color: tool === 'highlighter' ? '#f0c040' : '#ffffff', size: tool === 'highlighter' ? 16 : 3, rotation: 0, opacity: 1, groupId: null, linkedToId: null, linkOffset: null, text: '', fontSize: 18, hidden: false, locked: false });
      selIds.clear(); selIds.add(els[els.length - 1].id); saveH(); updateProps(); updateLayers();
      drawingFree = false; freePoints = []; reqRender(); return true;
    }
    drawingFree = false; freePoints = [];
  },

  renderOverlay: function() {
    if (drawingFree && freePoints.length > 1) {
      cx.save();
      cx.strokeStyle = tool === 'highlighter' ? 'rgba(240,192,64,0.35)' : '#ffffff';
      cx.lineWidth = tool === 'highlighter' ? 16 : 3;
      cx.lineCap = 'round'; cx.lineJoin = 'round';
      cx.beginPath(); cx.moveTo(freePoints[0].x, freePoints[0].y);
      for (var i = 1; i < freePoints.length; i++) cx.lineTo(freePoints[i].x, freePoints[i].y);
      cx.stroke();
      cx.restore();
    }
  }
});

function showTextModal() {
  var modal = document.getElementById('textModal');
  if (!modal) return;
  // Reset all controls to defaults
  document.getElementById('txtModalInput').value = '';
  document.getElementById('txtModalSize').value = 24;
  document.getElementById('txtModalSizeVal').textContent = '24';
  document.getElementById('txtModalColor').value = '#ffffff';
  document.getElementById('txtModalFont').value = 'Cairo,Inter';
  var bgEl = document.getElementById('txtModalBg');
  if (bgEl) { bgEl.value = '#000000'; delete bgEl.dataset.none; }
  var borderToggle = document.getElementById('txtModalBorderToggle');
  if (borderToggle) borderToggle.classList.remove('on');
  var borderEl = document.getElementById('txtModalBorder');
  if (borderEl) borderEl.style.display = 'none';
  var boldBtn = document.getElementById('txtModalBold');
  if (boldBtn) boldBtn.classList.add('on');
  var italicBtn = document.getElementById('txtModalItalic');
  if (italicBtn) italicBtn.classList.remove('on');
  modal.classList.add('show');
  document.getElementById('txtModalInput').focus();
}

function confirmTextModal() {
  var modal = document.getElementById('textModal');
  if (!modal) return;
  modal.classList.remove('show');
  var inp = document.getElementById('txtModalInput');
  var tx = inp ? inp.value.trim() : '';
  if (!tx || !_txtPos) return;
  var bgEl = document.getElementById('txtModalBg');
  var bgVal = bgEl && bgEl.dataset.none ? null : (bgEl ? bgEl.value : null);
  var borderToggle = document.getElementById('txtModalBorderToggle');
  var borderEl = document.getElementById('txtModalBorder');
  var borderVal = (borderToggle && borderToggle.classList.contains('on') && borderEl) ? borderEl.value : null;
  var boldBtn = document.getElementById('txtModalBold');
  var italicBtn = document.getElementById('txtModalItalic');
  els.push({
    id: uid(), type: 'text', x: _txtPos.x, y: _txtPos.y,
    size: 18, color: (document.getElementById('txtModalColor') || {}).value || '#ffffff',
    rotation: 0, opacity: 1, groupId: null, linkedToId: null, linkOffset: null,
    text: tx, fontSize: +(document.getElementById('txtModalSize') || {}).value || 24,
    fontFamily: (document.getElementById('txtModalFont') || {}).value || 'Cairo,Inter',
    bold: boldBtn ? boldBtn.classList.contains('on') : true,
    italic: italicBtn ? italicBtn.classList.contains('on') : false,
    bgColor: bgVal, borderColor: borderVal,
    hidden: false, locked: false, spotlight: false, poszone: false, zoneColor2: null
  });
  selIds.clear(); selIds.add(els[els.length - 1].id); saveH(); updateProps(); updateLayers(); reqRender();
  setTool('select');
  _txtPos = null;
}

function closeTextModal() {
  var modal = document.getElementById('textModal');
  if (modal) modal.classList.remove('show');
  _txtPos = null;
}
