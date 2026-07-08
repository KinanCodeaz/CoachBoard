'use strict';
// CoachBoard Pro - Section: Select, Move & Pan
SEC.add({
  id: 'select',
  tools: ['select', 'move', 'pan'],
  elName: function(type) { return type === 'pan' ? t('pan') : t('select_tool'); },
  dc: function(type) { return '#ffffff'; },
  placeEl: function() {},
  mouseDown: function(e, p) {
    if (tool === 'pan') {
      if (pitch3d) { pitchRotating = true; pitchRotStartX = e.clientX; pitchRotStartY = e.clientY; pitchRotStartRX = pitchRotX; pitchRotStartRY = pitchRotY; e.preventDefault(); return true; }
      panning = true; e.preventDefault(); panLastX = e.clientX; panLastY = e.clientY; return true;
    }
    if (tool === 'select' || tool === 'move') {
      panning = false; // clear stale pan state
      if (selIds.size === 1) {
        for (var i = 0; i < els.length; i++) {
          if (selIds.has(els[i].id)) {
            var h = hitHandle(els[i], p.x, p.y);
            if (h) {
              var _s = els[i].size || 18;
              handleDrag = { type: h, el: els[i], startX: p.x, startY: p.y, startSize: _s, startRot: els[i].rotation || 0, startZoneW: els[i].zoneW || _s * 2.4, startZoneH: els[i].zoneH || _s * 1.6 };
              return true;
            }
          }
        }
      }
      var hit = hitTest(p.x, p.y);
      if (hit) {
        // Check for point-specific hit on multi-arrow elements
        if (isMultiArr(hit.type) && hit.points) {
          for (var pi = 0; pi < hit.points.length; pi++) {
            var pdxx = Math.abs(p.x - hit.points[pi].x), pdyy = Math.abs(p.y - hit.points[pi].y);
            if (pdxx < 8 && pdyy < 8) {
              if (hit.points[pi].linkedToId) hit.points[pi].linkedToId = null;
              draggingPoint = { el: hit, idx: pi, startX: p.x, startY: p.y, origX: hit.points[pi].x, origY: hit.points[pi].y };
              selIds.clear(); selIds.add(hit.id); updateProps(); updateLayers(); reqRender(); return true;
            }
          }
        }
        if (e.shiftKey) { selIds.has(hit.id) ? selIds.delete(hit.id) : selIds.add(hit.id); }
        else if (!e.ctrlKey && !e.metaKey) { selIds.clear(); selIds.add(hit.id); }
        else { selIds.add(hit.id); }
        dragging = true; dragEl = hit;
        dragOff = { x: p.x - hit.x, y: p.y - hit.y };
        _dragStarts = {};
        selIds.forEach(function(id) {
          var el2 = els.find(function(e2) { return e2.id === id; });
          if (el2) _dragStarts[id] = { x: el2.x, y: el2.y, ax2: el2.ax2, ay2: el2.ay2, points: el2.points ? el2.points.map(function(pt) { return { x: pt.x, y: pt.y }; }) : null };
        });
        els.sort(function(a, b) { return a.id === hit.id ? 1 : b.id === hit.id ? -1 : 0; });
        updateProps(); updateLayers(); reqRender();
        return true;
      } else if (tool === 'select') {
        selIds.clear();
        rubberBanding = true; rbStart = { x: p.x, y: p.y };
        updateProps(); updateLayers(); reqRender();
        return true;
      } else if (tool === 'move') {
        panning = true; panLastX = e.clientX; panLastY = e.clientY;
        return true;
      }
    }
    return false;
  },
  mouseMove: function(e, p) {
    if (pitchRotating) {
      pitchRotX = Math.max(-90, Math.min(90, pitchRotStartRX + (pitchRotStartY - e.clientY) * 0.8));
      pitchRotY = Math.max(-90, Math.min(90, pitchRotStartRY + (e.clientX - pitchRotStartX) * 0.8));
      applyZoom(); return true;
    }
    if (panning) {
      var dx = e.clientX - panLastX, dy = e.clientY - panLastY;
      panX += dx; panY += dy; panLastX = e.clientX; panLastY = e.clientY;
      applyZoom(); return true;
    }
    if ((tool === 'select' || tool === 'move' || tool === 'pan') && !pitchRotating) {
      if (tool !== 'pan' && tool !== 'move') panning = false; // unstuck pan state for select
      var over = hitTest(p.x, p.y);
      if (tool === 'pan' || (tool === 'move' && !over)) {
        document.getElementById('cc').style.cursor = 'grab';
      } else {
        document.getElementById('cc').style.cursor = over ? 'grab' : 'default';
      }
    }
    return false;
  },
  mouseUp: function(e, p) {
    if (pitchRotating) { pitchRotating = false; return true; }
    if (panning) { panning = false; return true; }
    if (rubberBanding) {
      rubberBanding = false;
      var rb = document.getElementById('rubberBand');
      if (rb) { rb.style.display = 'none'; rb.style.width = '0'; rb.style.height = '0'; }
      reqRender(); return true;
    }
    return false;
  }
});
