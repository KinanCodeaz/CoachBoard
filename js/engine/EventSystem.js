'use strict';
// CoachBoard Event System
// Extracts mouse/touch/keyboard/context-menu bindings from script.js.
// These functions read globals: tool, selIds, els, cv, cc, etc.
var EventSystem = {
  _ctxTarget: null,

  init: function() {
    // Use CanvasPool layer 0 if available, otherwise fallback to original canvas
    var eventCanvas = (typeof CanvasPool !== 'undefined' && CanvasPool._layers.length > 0)
      ? CanvasPool.getCanvas(0)
      : cv;
    if (!eventCanvas) return;
    eventCanvas.addEventListener('mousedown', this._onMouseDown);
    eventCanvas.addEventListener('mousemove', this._onMouseMove);
    eventCanvas.addEventListener('mouseup', this._onMouseUp);
    eventCanvas.addEventListener('dblclick', this._onDblClick);
    eventCanvas.addEventListener('contextmenu', this._onContextMenu);
    document.addEventListener('click', this._onDocClick);
    eventCanvas.addEventListener('wheel', function(e) { e.preventDefault(); if (e.deltaY < 0) zoomIn(); else zoomOut(); }, { passive: false });
  },

  _onMouseDown: function(e) {
    var p = mp(e);
    if (SEC.mouseDown(e, p)) return;
    if (tool === 'playerLink') {
      var hit = hitTest(p.x, p.y);
      if (hit && isP2D(hit.type)) {
        if (!linkStart) { linkStart = { id: hit.id, x: hit.x, y: hit.y }; drawingLink = true; }
        else { playerLinks.push({ fromId: linkStart.id, toId: hit.id, color: '#ffffff', size: 3 }); linkStart = null; linkEnd = null; drawingLink = false; saveH(); reqRender(); }
      }
      return;
    }
    placeEl(tool, p.x, p.y);
    // Keep tool active for placement tools (players, equipment, etc.)
    // Only switch to select for drawing/text tools
    var drawingTools = ['pen', 'highlighter', 'text', 'number'];
    if (!e.shiftKey && drawingTools.indexOf(tool) >= 0) {
      setTool('select');
    }
  },

  _onMouseMove: function(e) {
    var p = mp(e);
    // Update cursor based on what's under the mouse
    var eventCanvas = (typeof CanvasPool !== 'undefined' && CanvasPool._layers.length > 0) ? CanvasPool.getCanvas(0) : cv;
    if (tool === 'select' && !dragging && !handleDrag && !panning) {
      var hit = hitTest(p.x, p.y);
      if (hit) {
        var ht = hitHandle(hit, p.x, p.y);
        if (ht) {
          if (ht === 'rotate') eventCanvas.style.cursor = 'grab';
          else if (ht.startsWith('resize')) eventCanvas.style.cursor = 'nwse-resize';
          else eventCanvas.style.cursor = 'pointer';
        } else {
          eventCanvas.style.cursor = 'move';
        }
      } else {
        eventCanvas.style.cursor = 'default';
      }
    } else if (tool === 'move') {
      eventCanvas.style.cursor = 'grab';
    } else if (dragging) {
      eventCanvas.style.cursor = 'move';
    } else if (handleDrag) {
      eventCanvas.style.cursor = 'nwse-resize';
    } else if (panning) {
      eventCanvas.style.cursor = 'grabbing';
    }
    if (draggingPoint) { draggingPoint.el.points[draggingPoint.idx].x = draggingPoint.origX + (p.x - draggingPoint.startX); draggingPoint.el.points[draggingPoint.idx].y = draggingPoint.origY + (p.y - draggingPoint.startY); reqRender(); return; }
    if (SEC.mouseMove(e, p)) return;
    if (tool === 'playerLink' && drawingLink && linkStart) { linkEnd = { x: p.x, y: p.y }; reqRender(); return; }
    if (rubberBanding && rbStart) { var p2 = p; var rx = Math.min(rbStart.x, p2.x), ry = Math.min(rbStart.y, p2.y), rw = Math.abs(p2.x - rbStart.x), rh = Math.abs(p2.y - rbStart.y); var pTL = projectIn(rx, ry), pBR = projectIn(rx + rw, ry + rh); if (rbDiv) { rbDiv.style.left = pTL.x + 'px'; rbDiv.style.top = pTL.y + 'px'; rbDiv.style.width = (pBR.x - pTL.x) + 'px'; rbDiv.style.height = (pBR.y - pTL.y) + 'px'; rbDiv.classList.add('active'); } selIds.clear(); els.forEach(function(el) { var ec = eCen(el); if (!el.hidden && !el.locked && ec.x >= rx && ec.x <= rx + rw && ec.y >= ry && ec.y <= ry + rh) selIds.add(el.id); }); reqRender(); return; }
    if (handleDrag) { _handleDragMove(e, p); return; }
    if (dragging && dragEl) { var dx = (p.x - dragOff.x) - _dragStarts[dragEl.id].x, dy = (p.y - dragOff.y) - _dragStarts[dragEl.id].y; selIds.forEach(function(id) { var s = _dragStarts[id]; if (!s) return; var el2 = els.find(function(e2) { return e2.id === id; }); if (!el2) return; el2.x = s.x + dx; el2.y = s.y + dy; if (s.points && el2.points) { for (var j = 0; j < el2.points.length; j++) { el2.points[j].x = s.points[j].x + dx; el2.points[j].y = s.points[j].y + dy; } } if (s.ax2 !== undefined) { el2.ax2 = s.ax2 + dx; el2.ay2 = s.ay2 + dy; } moveLinked(dx, dy, el2); }); calcGuides(dragEl); reqRender(); return; }
    if (pitchRotating) { pitchRotX = Math.max(-90, Math.min(90, pitchRotStartRX + (pitchRotStartY - e.clientY) * 0.8)); pitchRotY = Math.max(-90, Math.min(90, pitchRotStartRY + (e.clientX - pitchRotStartX) * 0.8)); applyZoom(); return; }
    if (panning) { panX += e.clientX - panLastX; panY += e.clientY - panLastY; panLastX = e.clientX; panLastY = e.clientY; applyZoom(); return; }
  },

  _onMouseUp: function(e) {
    if (draggingPoint) { if (gridSnap) { var _sg = gridSize; draggingPoint.el.points[draggingPoint.idx].x = Math.round(draggingPoint.el.points[draggingPoint.idx].x / _sg) * _sg; draggingPoint.el.points[draggingPoint.idx].y = Math.round(draggingPoint.el.points[draggingPoint.idx].y / _sg) * _sg; } draggingPoint = null; saveH(); reqRender(); return; }
    if (SEC.mouseUp(e, mp(e))) return;
    if (pitchRotating) { pitchRotating = false; return; }
    if (panning) { panning = false; return; }
    drawingFree = false; freePoints = [];
    if (handleDrag) { handleDrag = null; saveH(); reqRender(); return; }
    if (dragging) { selIds.forEach(function(id) { var el2 = els.find(function(e2) { return e2.id === id; }); if (el2) snapG(el2); }); dragging = false; dragEl = null; _dragStarts = null; guides = []; saveH(); reqRender(); return; }
  },

  _onDblClick: function(e) { SEC.dblClick(e); },

  _onContextMenu: function(e) {
    e.preventDefault(); var p = mp(e); var hit = hitTest(p.x, p.y);
    if (!hit) { hideCtx(); return; }
    selIds.clear(); selIds.add(hit.id); if (typeof updateProps === 'function') updateProps(); if (typeof updateLayers === 'function') updateLayers(); reqRender();
    EventSystem._ctxTarget = hit.id;
    var cm = document.getElementById('ctxMenu'); if (!cm) return;
    var lockLabel = document.getElementById('ctxLockLabel'); if (lockLabel) lockLabel.textContent = hit.locked ? (lang === 'ar' ? 'فتح' : 'Unlock') : (lang === 'ar' ? 'قفل' : 'Lock');
    var hideLabel = document.getElementById('ctxHideLabel'); if (hideLabel) hideLabel.textContent = hit.hidden ? (lang === 'ar' ? 'إظهار' : 'Show') : (lang === 'ar' ? 'إخفاء' : 'Hide');
    cm.style.left = e.clientX + 'px'; cm.style.top = e.clientY + 'px'; cm.classList.add('show');
  },

  _onDocClick: function(e) { var cm = document.getElementById('ctxMenu'); if (cm && !cm.contains(e.target)) hideCtx(); },

  ctxAction: function(action) {
    var el = els.find(function(e) { return e.id === EventSystem._ctxTarget; });
    if (!el) { hideCtx(); return; }
    if (action === 'delete') { els.splice(els.indexOf(el), 1); selIds.delete(el.id); saveH(); updateProps(); updateLayers(); reqRender(); }
    else if (action === 'duplicate') { var copy = JSON.parse(JSON.stringify(el)); copy.id = uid(); copy.x += 10; copy.y += 10; els.push(copy); saveH(); updateProps(); updateLayers(); reqRender(); }
    else if (action === 'front') { var idx = els.indexOf(el); if (idx < els.length - 1) { els.splice(idx, 1); els.push(el); } updateLayers(); reqRender(); }
    else if (action === 'forward') { var idx = els.indexOf(el); if (idx < els.length - 1) { var tmp = els[idx]; els[idx] = els[idx + 1]; els[idx + 1] = tmp; } updateLayers(); reqRender(); }
    else if (action === 'backward') { var idx = els.indexOf(el); if (idx > 0) { var tmp = els[idx]; els[idx] = els[idx - 1]; els[idx - 1] = tmp; } updateLayers(); reqRender(); }
    else if (action === 'back') { var idx = els.indexOf(el); if (idx > 0) { els.splice(idx, 1); els.unshift(el); } updateLayers(); reqRender(); }
    else if (action === 'lock') { el.locked = !el.locked; updateLayers(); }
    else if (action === 'hide') { el.hidden = !el.hidden; updateLayers(); reqRender(); }
    else if (action === 'zoomIn') { zoomIn(); }
    else if (action === 'zoomOut') { zoomOut(); }
    else if (action === 'selectAll') { selectAllEls(); }
    hideCtx();
  }
};

function _handleDragMove(e, p) {
  var el2 = handleDrag.el, ht = handleDrag.type;
  if (ht === 'rotate') { var angle = Math.atan2(p.y - el2.y, p.x - el2.x) * 180 / Math.PI + 90; el2.rotation = Math.round(angle) % 360; if (el2.rotation < 0) el2.rotation += 360; }
  else if (ht.startsWith('resize') && isZone(el2.type)) {
    var rot2 = (el2.rotation || 0) % 360; if (rot2 < 0) rot2 += 360;
    var swapped = (rot2 >= 67.5 && rot2 <= 112.5) || (rot2 >= 247.5 && rot2 <= 292.5);
    var rp = p;
    if (swapped) { var dx = p.x - el2.x, dy = p.y - el2.y, ca = Math.cos(-rot2 * Math.PI / 180), sa = Math.sin(-rot2 * Math.PI / 180); rp = { x: dx * ca - dy * sa + el2.x, y: dx * sa + dy * ca + el2.y }; }
    var zw = el2.zoneW || (el2.size || 18) * 2.4, zh = el2.zoneH || (el2.size || 18) * 1.6, lx = el2.x - zw / 2, rx = el2.x + zw / 2, ty = el2.y - zh / 2, by = el2.y + zh / 2;
    if (ht === 'resize_L') { var nw = rx - rp.x; if (nw > 3) { el2.zoneW = nw; el2.x = (rp.x + rx) / 2; } }
    else if (ht === 'resize_R') { var nw = rp.x - lx; if (nw > 3) { el2.zoneW = nw; el2.x = (lx + rp.x) / 2; } }
    else if (ht === 'resize_T') { var nh = by - rp.y; if (nh > 3) { el2.zoneH = nh; el2.y = (rp.y + by) / 2; } }
    else if (ht === 'resize_B') { var nh = rp.y - ty; if (nh > 3) { el2.zoneH = nh; el2.y = (ty + rp.y) / 2; } }
    else if (ht === 'resize_TL') { var nw = rx - rp.x, nh = by - rp.y; if (nw > 3 && nh > 3) { el2.zoneW = nw; el2.zoneH = nh; el2.x = (rp.x + rx) / 2; el2.y = (rp.y + by) / 2; } }
    else if (ht === 'resize_TR') { var nw = rp.x - lx, nh = by - rp.y; if (nw > 3 && nh > 3) { el2.zoneW = nw; el2.zoneH = nh; el2.x = (lx + rp.x) / 2; el2.y = (rp.y + by) / 2; } }
    else if (ht === 'resize_BL') { var nw = rx - rp.x, nh = rp.y - ty; if (nw > 3 && nh > 3) { el2.zoneW = nw; el2.zoneH = nh; el2.x = (rp.x + rx) / 2; el2.y = (ty + rp.y) / 2; } }
    else if (ht === 'resize_BR') { var nw = rp.x - lx, nh = rp.y - ty; if (nw > 3 && nh > 3) { el2.zoneW = nw; el2.zoneH = nh; el2.x = (lx + rp.x) / 2; el2.y = (ty + rp.y) / 2; } }
  } else if (ht.startsWith('resize')) {
    var dist = Math.sqrt((p.x - el2.x) ** 2 + (p.y - el2.y) ** 2);
    var startDist = Math.sqrt((handleDrag.startX - el2.x) ** 2 + (handleDrag.startY - el2.y) ** 2);
    if (startDist > 3) { var szMax = isZone(el2.type) ? 1000 : 80; var newSize = Math.max(6, Math.min(szMax, Math.round(handleDrag.startSize * dist / startDist))); el2.size = newSize; }
  }
  reqRender(); updateProps();
}

// Global ctxAction for HTML onclick handlers
function ctxAction(action) { EventSystem.ctxAction(action); }
