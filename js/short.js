// ============ SHORTCUT SYSTEM (configurable) ============
document.addEventListener('keydown', function(e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  if (typeof _shortcutListeningFor !== 'undefined' && _shortcutListeningFor) return;
  if (typeof matchShortcut !== 'function') return;

  // --- TOOLS ---
  if (matchShortcut(e, 'select')) { e.preventDefault(); setTool('select'); return; }
  if (matchShortcut(e, 'move')) { e.preventDefault(); setTool('move'); return; }

  // --- PANEL TOGGLES (1-9) ---
  if (matchShortcut(e, 'togglePlayers')) { e.preventDefault(); toggleSidebarSection(2); return; }
  if (matchShortcut(e, 'toggleEquipment')) { e.preventDefault(); toggleSidebarSection(3); return; }
  if (matchShortcut(e, 'toggleShapes')) { e.preventDefault(); toggleSidebarSection(4); return; }
  if (matchShortcut(e, 'toggleArrows')) { e.preventDefault(); toggleSidebarSection(5); return; }
  if (matchShortcut(e, 'toggleDrawing')) { e.preventDefault(); toggleSidebarSection(6); return; }
  if (matchShortcut(e, 'toggleFormations')) { e.preventDefault(); toggleSidebarSection(7); return; }
  if (matchShortcut(e, 'teamManager')) { e.preventDefault(); openTeamManagerModal(); return; }
  if (matchShortcut(e, 'toggleLayers')) { e.preventDefault(); toggleRightPanel(1); return; }
  if (matchShortcut(e, 'toggleNotes')) { e.preventDefault(); toggleRightPanel(2); return; }

  // --- ZOOM ---
  if (matchShortcut(e, 'zoomIn')) { e.preventDefault(); Camera.zoomIn(); return; }
  if (matchShortcut(e, 'zoomOut')) { e.preventDefault(); Camera.zoomOut(); return; }

  // --- SCENE ---
  if (matchShortcut(e, 'newScene')) { e.preventDefault(); saveStep(); return; }
  if (matchShortcut(e, 'clearScenes')) { e.preventDefault(); clearSteps(); return; }

  // --- EDIT ---
  if (matchShortcut(e, 'undo')) { e.preventDefault(); undo(); return; }
  if (matchShortcut(e, 'redo')) { e.preventDefault(); redo(); return; }
  if (matchShortcut(e, 'selectAll')) { e.preventDefault(); selectAllEls(); return; }
  if (matchShortcut(e, 'duplicate')) { e.preventDefault(); duplicateSel(); return; }
  if (matchShortcut(e, 'deleteEl')) { e.preventDefault(); deleteSel(); return; }
  if (matchShortcut(e, 'deselect')) {
    e.preventDefault(); selIds.clear(); updateProps(); updateLayers(); Engine.reqRender(); return;
  }
  if (matchShortcut(e, 'clearAll')) { e.preventDefault(); clearAll(); return; }

  // --- COPY / PASTE ---
  if (matchShortcut(e, 'copy')) {
    e.preventDefault();
    clipboard = [];
    selIds.forEach(function(id) {
      var el = els.find(function(e2) { return e2.id === id; });
      if (el) clipboard.push(JSON.parse(JSON.stringify(el)));
    });
    toast(lang==='ar'?'تم النسخ':'Copied');
    return;
  }
  if (matchShortcut(e, 'paste')) {
    e.preventDefault();
    if (clipboard.length) {
      selIds.clear();
      clipboard.forEach(function(cp) {
        var ne = JSON.parse(JSON.stringify(cp));
        ne.id = uid();
        ne.x += 20; ne.y += 20;
        if (ne.points) ne.points = ne.points.map(function(p) { return { x: p.x + 20, y: p.y + 20 }; });
        if (ne.ax2 !== undefined) { ne.ax2 += 20; ne.ay2 += 20; }
        els.push(ne);
        selIds.add(ne.id);
      });
      saveH(); updateProps(); updateLayers(); Engine.reqRender();
      toast(lang==='ar'?'تم اللصق':'Pasted');
    }
    return;
  }

  // --- SAVE / EXPORT ---
  if (matchShortcut(e, 'save')) { e.preventDefault(); saveProject(); return; }
  if (matchShortcut(e, 'exportImg')) { e.preventDefault(); exportImg(); return; }

  // --- GRID / GROUP ---
  if (matchShortcut(e, 'gridSnap')) {
    e.preventDefault(); gridSnap = !gridSnap;
    document.getElementById('snapInd').classList.toggle('show', gridSnap);
    Engine.reqRender(); return;
  }
  if (matchShortcut(e, 'group')) { e.preventDefault(); groupSel(); return; }
  if (matchShortcut(e, 'ungroup')) { e.preventDefault(); ungroupSel(); return; }

  // --- MOVE ELEMENT (arrows) ---
  if (matchShortcut(e, 'moveUp') || matchShortcut(e, 'moveDown') || matchShortcut(e, 'moveLeft') || matchShortcut(e, 'moveRight')) {
    e.preventDefault();
    var step = gridSnap ? gridSize : 5;
    var dx = 0, dy = 0;
    if (matchShortcut(e, 'moveUp')) dy = -step;
    if (matchShortcut(e, 'moveDown')) dy = step;
    if (matchShortcut(e, 'moveLeft')) dx = -step;
    if (matchShortcut(e, 'moveRight')) dx = step;
    selIds.forEach(function(id) {
      var el = els.find(function(e2) { return e2.id === id; });
      if (el) { el.x += dx; el.y += dy; }
    });
    saveH(); updateProps(); updateLayers(); Engine.reqRender(); return;
  }

  // --- TOGGLE SIDEBARS ---
  if (matchShortcut(e, 'toggleSidebars')) {
    e.preventDefault(); toggleLeftSidebar(); toggleRightSidebar(); return;
  }

  // --- MEASURE ---
  if (matchShortcut(e, 'measure')) { e.preventDefault(); showDistance(); return; }
});
