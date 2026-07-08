'use strict';
// CoachBoard Pro - Touch Experience v0.79.09
// Pinch zoom, two-finger pan, long-press context menu, auto-scroll, large handles
(function () {
  var touchCv = (typeof CanvasPool !== 'undefined' && CanvasPool._layers.length > 0)
    ? CanvasPool.getCanvas(0)
    : cv;
  if (typeof touchCv === 'undefined' || !touchCv) return;

  var lastTouchDist = 0, isTouching = false, longPressTimer = null;
  var LONG_PRESS_MS = 500, DOUBLE_TAP_DELAY = 300, DOUBLE_TAP_DIST = 30;
  var _lastTapTime = 0, _lastTapX = 0, _lastTapY = 0;
  var _touchStartPos = null, _longPressFired = false;

  // Two-finger pan state
  var _pinchStartMid = null, _pinchStartZoom = 1, _pinchStartPanX = 0, _pinchStartPanY = 0;
  var _isPinching = false;

  // Auto-scroll state
  var _autoScrollTimer = null, _autoScrollDx = 0, _autoScrollDy = 0;
  var AUTO_SCROLL_ZONE = 40, AUTO_SCROLL_SPEED = 8;

  function touchPos(e) {
    if (e.changedTouches && e.changedTouches.length > 0)
      return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    if (e.touches && e.touches.length > 0)
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    return null;
  }

  function fire(e, type, extra) {
    var p = touchPos(e);
    if (!p) return;
    var ev = new MouseEvent(type, {
      clientX: p.x, clientY: p.y, button: 0,
      bubbles: true, cancelable: true, view: window
    });
    if (extra) for (var k in extra) ev[k] = extra[k];
    touchCv.dispatchEvent(ev);
  }

  function getMidpoint(t1, t2) {
    return { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
  }

  function getDist(t1, t2) {
    var dx = t1.clientX - t2.clientX, dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ===== Long Press Context Menu =====
  function fireLongPress(e) {
    if (_longPressFired) return;
    _longPressFired = true;
    var p = touchPos(e);
    if (!p) return;
    // Hit test
    var hit = null;
    if (typeof hitTest === 'function') hit = hitTest(p.x, p.y);
    // Build context menu
    var existing = document.getElementById('touchCtxMenu');
    if (existing) existing.remove();
    var menu = document.createElement('div');
    menu.id = 'touchCtxMenu';
    menu.style.cssText = 'position:fixed;z-index:10000;background:var(--bg2,#1e1e2e);border:1px solid var(--border,#333);border-radius:8px;padding:4px 0;box-shadow:0 8px 24px rgba(0,0,0,0.5);min-width:140px;font-size:13px;';
    var items = [];
    if (hit) {
      items.push({ label: 'Select', icon: 'fa-mouse-pointer', fn: function() { selIds.clear(); selIds.add(hit.id); updateProps(); updateLayers(); reqRender(); }});
      items.push({ label: 'Duplicate', icon: 'fa-copy', fn: function() { duplicateSel(); }});
      items.push({ label: 'Delete', icon: 'fa-trash', fn: function() { deleteSel(); }, danger: true});
    } else {
      items.push({ label: 'Paste', icon: 'fa-paste', fn: function() { pasteClipboard(); }});
      items.push({ label: 'Duplicate', icon: 'fa-copy', fn: function() { duplicateSel(); }});
      items.push({ label: 'Select All', icon: 'fa-object-group', fn: function() { selectAllEls(); }});
      items.push({ label: 'Undo', icon: 'fa-undo', fn: function() { undo(); }});
    }
    for (var i = 0; i < items.length; i++) {
      var item = items[i];
      var btn = document.createElement('div');
      btn.style.cssText = 'padding:8px 16px;cursor:pointer;display:flex;align-items:center;gap:8px;' + (item.danger ? 'color:#ef4444;' : 'color:var(--text,#fff);');
      btn.innerHTML = '<i class="fas ' + item.icon + '" style="width:16px;text-align:center"></i>' + item.label;
      btn.addEventListener('click', (function(fn) { return function(e) { e.stopPropagation(); menu.remove(); fn(); }; })(item.fn));
      menu.appendChild(btn);
    }
    document.body.appendChild(menu);
    // Position
    var mx = Math.min(p.x, window.innerWidth - 160);
    var my = Math.min(p.y, window.innerHeight - 120);
    menu.style.left = mx + 'px';
    menu.style.top = my + 'px';
    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(30);
  }

  // ===== Auto-Scroll Near Edges =====
  function startAutoScroll(dx, dy) {
    _autoScrollDx = dx; _autoScrollDy = dy;
    if (_autoScrollTimer) return;
    _autoScrollTimer = setInterval(function() {
      if (typeof panX !== 'undefined' && typeof panY !== 'undefined') {
        panX += _autoScrollDx;
        panY += _autoScrollDy;
        if (typeof applyZoom === 'function') applyZoom();
        else if (typeof reqRender === 'function') reqRender();
      }
    }, 16);
  }

  function stopAutoScroll() {
    if (_autoScrollTimer) { clearInterval(_autoScrollTimer); _autoScrollTimer = null; }
    _autoScrollDx = 0; _autoScrollDy = 0;
  }

  function checkAutoScroll(clientX, clientY) {
    var dx = 0, dy = 0;
    if (clientX < AUTO_SCROLL_ZONE) dx = AUTO_SCROLL_SPEED;
    else if (clientX > window.innerWidth - AUTO_SCROLL_ZONE) dx = -AUTO_SCROLL_SPEED;
    if (clientY < AUTO_SCROLL_ZONE) dy = AUTO_SCROLL_SPEED;
    else if (clientY > window.innerHeight - AUTO_SCROLL_ZONE) dy = -AUTO_SCROLL_SPEED;
    if (dx !== 0 || dy !== 0) startAutoScroll(dx, dy);
    else stopAutoScroll();
  }

  // ===== Event Handlers =====
  touchCv.addEventListener('touchstart', function (e) {
    e.preventDefault();
    isTouching = true;
    _longPressFired = false;

    // Close any open context menu
    var oldMenu = document.getElementById('touchCtxMenu');
    if (oldMenu) oldMenu.remove();

    // Single touch
    if (e.touches.length === 1) {
      var now = Date.now(), p = touchPos(e);
      _touchStartPos = { x: p.x, y: p.y, time: now };

      // Double-tap detection
      if (now - _lastTapTime < DOUBLE_TAP_DELAY &&
          Math.abs(p.x - _lastTapX) < DOUBLE_TAP_DIST &&
          Math.abs(p.y - _lastTapY) < DOUBLE_TAP_DIST) {
        touchCv.dispatchEvent(new MouseEvent('dblclick', {
          clientX: p.x, clientY: p.y, button: 0,
          bubbles: true, cancelable: true, view: window
        }));
        _lastTapTime = 0;
        if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
        return;
      }
      _lastTapTime = now; _lastTapX = p.x; _lastTapY = p.y;

      // Long press timer
      longPressTimer = setTimeout(function() {
        fireLongPress(e);
      }, LONG_PRESS_MS);

      fire(e, 'mousedown');
      fire(e, 'mousemove');
    }

    // Two-finger: pinch zoom + pan
    if (e.touches.length === 2) {
      if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
      _isPinching = true;
      lastTouchDist = getDist(e.touches[0], e.touches[1]);
      _pinchStartMid = getMidpoint(e.touches[0], e.touches[1]);
      _pinchStartZoom = typeof zoomLevel !== 'undefined' ? zoomLevel : 1;
      _pinchStartPanX = typeof panX !== 'undefined' ? panX : 0;
      _pinchStartPanY = typeof panY !== 'undefined' ? panY : 0;
      // Cancel any ongoing mouse drag
      touchCv.dispatchEvent(new MouseEvent('mouseup', {
        clientX: _pinchStartMid.x, clientY: _pinchStartMid.y, button: 0,
        bubbles: true, cancelable: true, view: window
      }));
    }
  }, { passive: false });

  touchCv.addEventListener('touchmove', function (e) {
    e.preventDefault();
    if (!isTouching) return;

    // Cancel long press if finger moved
    if (e.touches.length === 1 && _touchStartPos) {
      var p = touchPos(e);
      var moved = Math.abs(p.x - _touchStartPos.x) + Math.abs(p.y - _touchStartPos.y);
      if (moved > 10 && longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
    }

    // Two-finger pinch + pan
    if (e.touches.length === 2 && _isPinching) {
      var dist = getDist(e.touches[0], e.touches[1]);
      var mid = getMidpoint(e.touches[0], e.touches[1]);

      // Zoom
      if (lastTouchDist > 0) {
        var factor = dist / lastTouchDist;
        var newZoom = Math.max(0.15, Math.min(5, _pinchStartZoom * factor));
        if (typeof Camera !== 'undefined' && Camera.setZoom) Camera.setZoom(newZoom);
        else if (typeof zoomLevel !== 'undefined') zoomLevel = newZoom;
      }
      lastTouchDist = dist;

      // Pan
      if (_pinchStartMid) {
        var dpr2 = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
        var dx = (mid.x - _pinchStartMid.x) / dpr2;
        var dy = (mid.y - _pinchStartMid.y) / dpr2;
        if (typeof panX !== 'undefined') panX = _pinchStartPanX + dx;
        if (typeof panY !== 'undefined') panY = _pinchStartPanY + dy;
        if (typeof applyZoom === 'function') applyZoom();
      }
      return;
    }

    // Single touch: auto-scroll near edges
    if (e.touches.length === 1) {
      var tp = touchPos(e);
      checkAutoScroll(tp.clientX, tp.clientY);
    }

    fire(e, 'mousemove');
  }, { passive: false });

  touchCv.addEventListener('touchend', function (e) {
    e.preventDefault();
    stopAutoScroll();
    if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
    _touchStartPos = null;

    if (e.touches.length === 0) {
      isTouching = false;
      lastTouchDist = 0;
      _isPinching = false;
      _pinchStartMid = null;
      fire(e, 'mouseup');
    } else if (e.touches.length === 1) {
      // Went from 2 to 1 finger: restart single touch
      lastTouchDist = 0;
      _isPinching = false;
      _pinchStartMid = null;
      var re = touchPos(e);
      if (re) {
        touchCv.dispatchEvent(new MouseEvent('mousedown', {
          clientX: re.x, clientY: re.y, button: 0,
          bubbles: true, cancelable: true, view: window
        }));
      }
    }
  }, { passive: false });

  touchCv.addEventListener('touchcancel', function (e) {
    isTouching = false; lastTouchDist = 0; _isPinching = false; _pinchStartMid = null;
    stopAutoScroll();
    if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
    _touchStartPos = null;
    fire(e, 'mouseup');
  }, { passive: false });

  // Close context menu on outside click
  document.addEventListener('click', function(e) {
    var menu = document.getElementById('touchCtxMenu');
    if (menu && !menu.contains(e.target)) menu.remove();
  });

  // ===== Floating Touch Toolbar Sync =====
  function syncTouchToolbar() {
    var tb = document.getElementById('touchToolbar');
    if (!tb) return;
    var btns = tb.querySelectorAll('.tt-btn');
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      var t = btn.getAttribute('data-tool');
      if (t) btn.classList.toggle('on', typeof tool !== 'undefined' && tool === t);
    }
  }
  // Observe tool changes
  var _origSetTool = typeof setTool === 'function' ? setTool : null;
  if (_origSetTool) {
    window.setTool = function(tt) {
      _origSetTool(tt);
      syncTouchToolbar();
    };
  }

  // ===== Touch Styles =====
  var ts = document.createElement('style');
  ts.textContent =
    '#layer_0{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;touch-action:none}' +
    '.zoom-btn,.hbtn,.menu-item,.icon-btn{cursor:pointer;-webkit-tap-highlight-color:transparent}' +
    '#zoomCtrl{bottom:16px}@media(hover:none)and(pointer:coarse){' +
    '.zoom-btn{width:36px;height:36px;font-size:14px}' +
    '.hbtn{padding:6px 10px;min-height:34px}' +
    '.hbtn.icon-only{padding:5px 7px}' +
    '.sb-body .icon-btn{min-height:36px}' +
    '.layer-item{min-height:34px}' +
    '.prop-group{margin-bottom:4px}' +
    'input[type=range]{height:24px}' +
    'input[type=color]{height:28px;width:36px}' +
    '.color-dot{width:20px;height:20px}' +
    '}';
  document.head.appendChild(ts);
})();
