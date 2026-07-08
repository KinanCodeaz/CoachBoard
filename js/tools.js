'use strict';
// CoachBoard Pro - Tools & Keyboard
function setTool(tt) { tool = tt; arrS = null; arrP = null; drawingArr = false; multiArrPoints = null; document.querySelectorAll('.icon-btn').forEach(function (b) { b.classList.toggle('on', b.dataset.tool === tt); b.setAttribute('aria-checked', b.dataset.tool === tt ? 'true' : 'false'); }); if (tt !== 'select' && tt !== 'move') { selIds.clear(); if (typeof updateProps === 'function') updateProps(); if (typeof render === 'function') render(); } var bs = document.getElementById('btnSelect'); var bm = document.getElementById('btnMove'); if (bs) bs.classList.toggle('on', tt === 'select'); if (bm) bm.classList.toggle('on', tt === 'move'); try { localStorage.setItem('cb_last_tool', tt); } catch(e) {} var ann = document.getElementById('ariaAnnounce'); if (ann) ann.textContent = 'Tool: ' + tt; }
function togSec(h) { h.classList.toggle('cl'); var c = h.nextElementSibling; if (c) c.classList.toggle('hide'); }
function togPanel(h) { h.classList.toggle('cl'); var c = h.nextElementSibling; if (c) c.classList.toggle('hide'); }

// duplicateSel moved to js/engine/Clipboard.js
function groupSel() { if (selIds.size < 2) return; var gid = 'g' + (grpCnt++); selIds.forEach(function (id) { var el = els.find(function (e) { return e.id === id; }); if (el) el.groupId = gid; }); saveH(); toast(t('grouped')); }
function ungroupSel() { selIds.forEach(function (id) { var el = els.find(function (e) { return e.id === id; }); if (el) el.groupId = null; }); saveH(); toast(t('ungrouped')); }
function linkBallToPlayer(pid, bid) { var ball = els.find(function (e) { return e.id === bid; }); var pl = els.find(function (e) { return e.id === pid; }); if (ball && pl) { ball.linkedToId = pid; ball.linkOffset = { x: ball.x - pl.x, y: ball.y - pl.y }; saveH(); toast(t('linked_ball')); } }
function unlinkBall(id) { var el = els.find(function (e) { return e.id === id; }); if (el && el.linkedToId) { el.linkedToId = null; el.linkOffset = null; saveH(); toast(t('unlinked')); } else { for (var i = 0; i < els.length; i++) { if (els[i].linkedToId === id) { els[i].linkedToId = null; els[i].linkOffset = null; saveH(); toast(t('unlinked')); break; } } } }
function moveLinked(dx, dy, par) { for (var i = 0; i < els.length; i++) { var el = els[i]; if (el.linkedToId === par.id && el.linkOffset) { el.x = par.x + el.linkOffset.x; el.y = par.y + el.linkOffset.y; } if (isMultiArr(el.type) && el.points) { for (var j = 0; j < el.points.length; j++) { if (el.points[j].linkedToId === par.id) { el.points[j].x = par.x + (el.points[j].linkedOffX || 0); el.points[j].y = par.y + (el.points[j].linkedOffY || 0); } } } } }

function alignEls(mode) { var se = []; selIds.forEach(function (id) { var el = els.find(function (e) { return e.id === id; }); if (el) se.push(el); }); if (se.length < 2) return; if (mode === 'left') { var mn = Math.min.apply(null, se.map(function (e) { return eCen(e).x; })); se.forEach(function (e) { e.x += mn - eCen(e).x; }); } else if (mode === 'right') { var mx = Math.max.apply(null, se.map(function (e) { return eCen(e).x; })); se.forEach(function (e) { e.x += mx - eCen(e).x; }); } else if (mode === 'centerH') { var avg = se.reduce(function (s, e) { return s + eCen(e).x; }, 0) / se.length; se.forEach(function (e) { e.x += avg - eCen(e).x; }); } else if (mode === 'centerV') { var avg2 = se.reduce(function (s, e) { return s + eCen(e).y; }, 0) / se.length; se.forEach(function (e) { e.y += avg2 - eCen(e).y; }); } saveH(); if (typeof render === 'function') render(); }
function distributeH() { var se = []; selIds.forEach(function (id) { var el = els.find(function (e) { return e.id === id; }); if (el) se.push(el); }); if (se.length < 3) return; se.sort(function (a, b) { return eCen(a).x - eCen(b).x; }); var mn = eCen(se[0]).x, mx2 = eCen(se[se.length - 1]).x, st = (mx2 - mn) / (se.length - 1); for (var i = 1; i < se.length - 1; i++) { se[i].x += mn + i * st - eCen(se[i]).x; } saveH(); if (typeof render === 'function') render(); }
function distributeV() { var se = []; selIds.forEach(function (id) { var el = els.find(function (e) { return e.id === id; }); if (el) se.push(el); }); if (se.length < 3) return; se.sort(function (a, b) { return eCen(a).y - eCen(b).y; }); var mn = eCen(se[0]).y, mx2 = eCen(se[se.length - 1]).y, st = (mx2 - mn) / (se.length - 1); for (var i = 1; i < se.length - 1; i++) { se[i].y += mn + i * st - eCen(se[i]).y; } saveH(); if (typeof render === 'function') render(); }

// updateUndoIndicator, saveH, undo, redo moved to js/engine/HistorySystem.js

function toast(msg) { var t2 = document.getElementById('toast'); if (!t2) return; t2.textContent = msg; t2.classList.add('show'); setTimeout(function () { t2.classList.remove('show'); }, 2000); }

document.addEventListener('keydown', function (e) {
  if (e.key === 'F11') { e.preventDefault(); if (typeof toggleFullscreen === 'function') toggleFullscreen(); }
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); if (typeof deleteSel === 'function') deleteSel(); }
  if (e.key === 'Escape') { selIds.clear(); setTool('select'); if (drawingLink) { linkStart = null; linkEnd = null; drawingLink = false; } arrS = null; arrP = null; drawingArr = false; multiArrPoints = null; if (typeof updateProps === 'function') updateProps(); if (typeof updateLayers === 'function') updateLayers(); if (typeof render === 'function') render(); }
  if (e.key === '?' && !e.ctrlKey && !e.metaKey) if (typeof openShortcuts === 'function') openShortcuts();
  if (e.key === 'v' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setTool('select'); }
  if (e.key === 'w' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setTool('move'); }
  if (e.key === 'e' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); if (typeof saveStep === 'function') saveStep(); }
  if (e.key === '1' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setTool('p_stand'); }
  if (e.key === '2' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setTool('gk_stand'); }
  if (e.key === '3' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setTool('ball'); }
  if (e.key === '4' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setTool('arrowSolid'); }
  if (e.key === '5' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setTool('arrowDashed'); }
  if (e.key === '6' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setTool('zoneCircle'); }
  if (e.key === '7' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setTool('pen'); }
  if (e.key === '8' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setTool('text'); }
  if (e.key === '9' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); setTool('cone'); }
  if ((e.key === '=' || e.key === '+') && !e.ctrlKey && !e.metaKey) { e.preventDefault(); if (typeof zoomIn === 'function') zoomIn(); }
  if (e.key === '-' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); if (typeof zoomOut === 'function') zoomOut(); }
  if (e.key === '0' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); Camera.zoomReset(); }
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); } if (e.key === 'Z' || e.key === 'y') { e.preventDefault(); redo(); }
    if (e.key === 'd') { e.preventDefault(); duplicateSel(); } if (e.key === 'a') { e.preventDefault(); if (typeof selectAllEls === 'function') selectAllEls(); }
    if (e.key === 's') { e.preventDefault(); if (typeof saveProject === 'function') saveProject(); }
    if (e.key === 'c') { Clipboard.copy(); }
    if (e.key === 'v') { e.preventDefault(); Clipboard.paste(); }
    if (e.key === 'g') { e.preventDefault(); GridSystem.toggle(); }
    if (e.key === 'b' && e.shiftKey) { e.preventDefault(); if (typeof CoreInit !== 'undefined' && CoreInit.quickBench) { CoreInit.quickBench().then(function(r) { toast('Render: ' + r.renderMs + 'ms | FPS: ' + r.fps + ' | Els: ' + r.elements + (r.memoryMB ? ' | Mem: ' + r.memoryMB + 'MB' : '')); }); } }
  }
  if (e.key === 'ArrowUp' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); selIds.forEach(function (id) { var el = els.find(function (e2) { return e2.id === id; }); if (el) el.y -= gridSnap ? gridSize : 5; }); saveH(); if (typeof render === 'function') render(); }
  if (e.key === 'ArrowDown' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); selIds.forEach(function (id) { var el = els.find(function (e2) { return e2.id === id; }); if (el) el.y += gridSnap ? gridSize : 5; }); saveH(); if (typeof render === 'function') render(); }
  if (e.key === 'ArrowLeft' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); selIds.forEach(function (id) { var el = els.find(function (e2) { return e2.id === id; }); if (el) el.x -= gridSnap ? gridSize : 5; }); saveH(); if (typeof render === 'function') render(); }
  if (e.key === 'ArrowRight' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); selIds.forEach(function (id) { var el = els.find(function (e2) { return e2.id === id; }); if (el) el.x += gridSnap ? gridSize : 5; }); saveH(); if (typeof render === 'function') render(); }
});
