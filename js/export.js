'use strict';
/**
 * CoachBoard Pro - Export Module v3 (export.js)
 * Image: smart crop tool with handles, advanced options, format control
 * Video: WebM/MP4/MKV via ffmpeg.wasm, progress bar, overlay
 * Download: File System Access API with fallback
 */
var ExportManager = (function() {
  var state = {
    watermarkImg: null,
    imgArea: 'all', imgFormat: 'png', imgQuality: 2,
    imgText: '', imgTextColor: '#ffffff', imgTextSize: 18, imgTextPos: 'bottom',
    imgLogoPos: 'bottom-right', imgLogoSize: 25, imgLogoOpacity: 15,
    vidWatermarkImg: null,
    vidFormat: 'webm', vidQuality: 'high', vidFps: 30, vidRes: '1080p',
    vidText: '', vidTextColor: '#ffffff', vidTextSize: 18, vidTextPos: 'bottom',
    vidLogoPos: 'bottom-right', vidLogoSize: 20, vidLogoOpacity: 15,
    lastFileName: 'coachboard', lastDirHandle: null,
    savePref: 'ask'
  };
  var _recording = false, _recorder = null;
  var isFileAPI = !!(window.showSaveFilePicker && window.isSecureContext);
  function _nativeMp4Supported() {
    return typeof MediaRecorder !== 'undefined' && typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported('video/mp4;codecs=h264');
  }
  // Crop state
  var crop = { active: false, mode: null, rect: null, startMx: 0, startMy: 0, startRect: null };
  var HANDLE_SZ = 8;
  var VIDEO_FORMATS = {
    webm:    { label: 'WebM (VP8)',       mime: 'video/webm',            ext: 'webm',  needsConvert: false },
    webmvp9: { label: 'WebM HD (VP9)',    mime: 'video/webm;codecs=vp9', ext: 'webm',  needsConvert: false },
    mp4:     { label: 'MP4 (H.264)',      mime: _nativeMp4Supported() ? 'video/mp4;codecs=h264' : 'video/webm', ext: 'mp4', needsConvert: !_nativeMp4Supported() },
    mkv:     { label: 'MKV (Matroska)',   mime: 'video/webm',            ext: 'mkv',   needsConvert: true }
  };
  var VIDEO_QUALITY = {
    low:    { label: '\u0645\u0646\u062E\u0641\u0636\u0629 (4 Mbps)',  bitrate: 4000000 },
    medium: { label: '\u0645\u062A\u0648\u0633\u0637\u0629 (8 Mbps)',  bitrate: 8000000 },
    high:   { label: '\u0639\u0627\u0644\u064A\u0629 (16 Mbps)',      bitrate: 16000000 },
    ultra:  { label: '\u0641\u0627\u0626\u0642\u0629 (32 Mbps)',      bitrate: 32000000 },
    max:    { label: '\u0642\u0635\u0648\u0649 (50 Mbps)',          bitrate: 50000000 }
  };
  var VIDEO_RESOLUTIONS = {
    '720p':  { label: 'HD 720p (1280\u00D7720)',  w: 1280, h: 720 },
    '1080p': { label: 'Full HD 1080p (1920\u00D71080)', w: 1920, h: 1080 },
    '1440p': { label: 'QHD 1440p (2560\u00D71440)', w: 2560, h: 1440 },
    '2160p': { label: '4K UHD (3840\u00D72160)', w: 3840, h: 2160 },
    'native':{ label: '\u0623\u0635\u0644\u064A (Native)', w: 0, h: 0 }
  };
  var VIDEO_ASPECTS = {
    '16:9': { label: '16:9', ratio: 16/9 },
    '4:3':  { label: '4:3',  ratio: 4/3 },
    '1:1':  { label: '1:1 (Square)', ratio: 1 },
    '9:16': { label: '9:16 (Vertical)', ratio: 9/16 }
  };

  // ==================== HELPERS ====================
  function getLogoXY(pos, cW, cH, lW, lH, m) {
    m = m || 12;
    if (pos === 'top-left')     return { x: m, y: m };
    if (pos === 'top-right')    return { x: cW - lW - m, y: m };
    if (pos === 'bottom-left')  return { x: m, y: cH - lH - m };
    if (pos === 'center')       return { x: (cW - lW) / 2, y: (cH - lH) / 2 };
    return { x: cW - lW - m, y: cH - lH - m };
  }
  function getTextY(pos, cH, fs) {
    if (pos === 'top') return fs + 10;
    if (pos === 'center') return cH / 2 + fs / 3;
    return cH - 14;
  }
  function drawTextOverlay(ctx, cW, cH, text, color, size, pos) {
    if (!text) return;
    ctx.save();
    ctx.font = 'bold ' + size + 'px Cairo,Inter,sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = pos === 'top' ? 'top' : pos === 'center' ? 'middle' : 'bottom';
    ctx.fillStyle = color;
    ctx.shadowColor = 'rgba(0,0,0,0.7)'; ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
    ctx.fillText(text, cW / 2, getTextY(pos, cH, size));
    ctx.restore();
  }
  function drawLogoOverlay(ctx, cW, cH, img, pos, szPct, opPct) {
    if (!img || !img.complete || img.naturalWidth === 0) return;
    ctx.save(); ctx.globalAlpha = opPct / 100;
    var logoSz = Math.min(cW, cH) * (szPct / 100);
    var r = img.naturalWidth / img.naturalHeight, lW, lH;
    if (r > 1) { lW = logoSz; lH = logoSz / r; } else { lH = logoSz; lW = logoSz * r; }
    var xy = getLogoXY(pos, cW, cH, lW, lH, 12);
    ctx.drawImage(img, xy.x, xy.y, lW, lH);
    ctx.restore();
  }
  function getExportArea() {
    if (crop.rect) return { sx: crop.rect.x, sy: crop.rect.y, sw: crop.rect.w, sh: crop.rect.h };
    return { sx: 0, sy: 0, sw: W, sh: H };
  }

  // ==================== DOWNLOAD HELPER ====================
  function downloadBlob(blob, defaultName) {
    var url = URL.createObjectURL(blob);
    // Check for custom filename from input
    var nameInput = document.getElementById('expFileName') || document.getElementById('vidFileName');
    if (nameInput && nameInput.value.trim()) {
      var ext = defaultName.split('.').pop();
      defaultName = nameInput.value.trim() + '.' + ext;
    }
    // Check save preference
    var useAsk = state.savePref === 'ask' && isFileAPI;
    if (!useAsk) {
      // Auto-download mode
      fallbackDownload(url, defaultName);
      return;
    }
    if (window.showSaveFilePicker) {
      var ext = defaultName.split('.').pop();
      var typeMap = {
        png:  { description: 'PNG Image', accept: { 'image/png': ['.png'] } },
        jpeg: { description: 'JPEG Image', accept: { 'image/jpeg': ['.jpg','.jpeg'] } },
        webp: { description: 'WebP Image', accept: { 'image/webp': ['.webp'] } },
        webm: { description: 'WebM Video', accept: { 'video/webm': ['.webm'] } },
        mp4:  { description: 'MP4 Video',  accept: { 'video/mp4': ['.mp4'] } },
        mkv:  { description: 'MKV Video',  accept: { 'video/x-matroska': ['.mkv'] } }
      };
      var types = typeMap[ext] ? [typeMap[ext]] : [];
      // Reuse last directory if available for faster workflow
      var opts = { suggestedName: defaultName, types: types };
      if (state.lastDirHandle) {
        try { opts.startIn = state.lastDirHandle; } catch(e) {}
      }
      window.showSaveFilePicker(opts).then(function(handle) {
        state.lastDirHandle = handle;
        return handle.createWritable();
      }).then(function(w) {
        return w.write(blob).then(function() { return w.close(); });
      }).then(function() {
        URL.revokeObjectURL(url);
        if (typeof toast === 'function') toast(typeof t === 'function' ? t('exported') : 'Exported!');
      }).catch(function(e) {
        if (e.name !== 'AbortError') fallbackDownload(url, defaultName);
        else URL.revokeObjectURL(url);
      });
    } else { fallbackDownload(url, defaultName); }
  }
  function fallbackDownload(url, name) {
    var a = document.createElement('a'); a.href = url; a.download = name; a.click();
    setTimeout(function() { URL.revokeObjectURL(url); }, 2000);
    if (typeof toast === 'function') toast(typeof t === 'function' ? t('exported') : 'Exported!');
  }

  // ==================== FFMPEG.WASM (v0.12 - single-threaded, no SharedArrayBuffer) ====================
  var _ffmpeg = null, _ffmpegLoading = null, _ffmpegReady = false;
  var _ffCdnUrls = [
    { core: 'lib/ffmpeg/ffmpeg-core.js', wasm: 'lib/ffmpeg/ffmpeg-core.wasm', main: 'lib/ffmpeg/ffmpeg.js' },
    { core: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js', wasm: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm', main: 'https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js' },
    { core: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js', wasm: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm', main: 'https://cdn.jsdelivr.net/npm/@ffmpeg/ffmpeg@0.12.10/dist/umd/ffmpeg.js' }
  ];
  function loadScript(src) {
    return new Promise(function(resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = function() { reject(new Error('Load failed: ' + src)); };
      document.head.appendChild(s);
    });
  }
  function loadFFmpeg() {
    if (_ffmpeg) return Promise.resolve(_ffmpeg);
    if (_ffmpegLoading) return _ffmpegLoading;
    _ffmpegLoading = new Promise(function(resolve, reject) {
      var idx = 0;
      function tryNext() {
        if (idx >= _ffCdnUrls.length) { reject(new Error('All CDN sources failed')); return; }
        var urls = _ffCdnUrls[idx++];
        var timeoutId = setTimeout(function() { tryNext(); }, 15000);
        loadScript(urls.core).then(function() {
          return loadScript(urls.main);
        }).then(function() {
          clearTimeout(timeoutId);
          try {
            var FFmpegWasm = FFmpeg;
            _ffmpeg = new FFmpegWasm.FFmpeg();
            _ffmpeg.on('log', function() {});
            _ffmpeg._coreUrl = urls.core;
            _ffmpeg._wasmUrl = urls.wasm;
            resolve(_ffmpeg);
          } catch(e) { reject(e); }
        }).catch(function() {
          clearTimeout(timeoutId);
          tryNext();
        });
      }
      tryNext();
    });
    return _ffmpegLoading;
  }
  function convertVideo(webmBlob, targetExt, progressCb) {
    return loadFFmpeg().then(function(ffmpeg) {
      var initP = _ffmpegReady ? Promise.resolve() : ffmpeg.load({
        coreURL: ffmpeg._coreUrl || 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js',
        wasmURL: ffmpeg._wasmUrl || 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm'
      }).then(function() { _ffmpegReady = true; });
      return initP.then(async function() {
        try {
          if (progressCb) progressCb('\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0648\u064A\u0644...');
          var webmArr = new Uint8Array(await webmBlob.arrayBuffer());
          ffmpeg.writeFile('input.webm', webmArr);
          var args = ['-i', 'input.webm'];
          if (targetExt === 'mp4') { args.push('-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '18', '-pix_fmt', 'yuv420p'); }
          else if (targetExt === 'mkv') { args.push('-c:v', 'libx264', '-preset', 'fast', '-crf', '20'); }
          args.push('output.' + targetExt);
          var code = ffmpeg.exec(args);
          if (code !== 0) throw new Error('FFmpeg exit code ' + code);
          var data = ffmpeg.readFile('output.' + targetExt);
          var mimeMap = { mp4: 'video/mp4', mkv: 'video/x-matroska' };
          var outBuf = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
          var blob = new Blob([outBuf], { type: mimeMap[targetExt] || 'video/webm' });
          try { ffmpeg.deleteFile('input.webm'); ffmpeg.deleteFile('output.' + targetExt); } catch(e) {}
          return blob;
        } catch(err) {
          try { ffmpeg.deleteFile('input.webm'); } catch(e) {}
          throw err;
        }
      });
    });
  }

  // ==================== CROP TOOL ====================
  function initCropRect() {
    var margin = 0.15;
    crop.rect = {
      x: Math.round(W * margin), y: Math.round(H * margin),
      w: Math.round(W * (1 - 2 * margin)), h: Math.round(H * (1 - 2 * margin))
    };
  }
  function getHandles(r) {
    var mx = r.x + r.w / 2, my = r.y + r.h / 2;
    return [
      { n: 'tl', x: r.x, y: r.y }, { n: 'tc', x: mx, y: r.y }, { n: 'tr', x: r.x + r.w, y: r.y },
      { n: 'ml', x: r.x, y: my }, { n: 'mr', x: r.x + r.w, y: my },
      { n: 'bl', x: r.x, y: r.y + r.h }, { n: 'bc', x: mx, y: r.y + r.h }, { n: 'br', x: r.x + r.w, y: r.y + r.h }
    ];
  }
  function hitTestHandle(mx, my, r) {
    var handles = getHandles(r);
    for (var i = 0; i < handles.length; i++) {
      if (Math.abs(mx - handles[i].x) <= HANDLE_SZ && Math.abs(my - handles[i].y) <= HANDLE_SZ) return handles[i].n;
    }
    if (mx > r.x + HANDLE_SZ && mx < r.x + r.w - HANDLE_SZ && my > r.y + HANDLE_SZ && my < r.y + r.h - HANDLE_SZ) return 'move';
    return null;
  }
  function applyCropDrag(dx, dy) {
    var r = crop.rect, s = crop.startRect;
    if (crop.mode === 'move') {
      r.x = clamp(s.x + dx, 0, W - r.w); r.y = clamp(s.y + dy, 0, H - r.h);
    } else {
      var nx = s.x, ny = s.y, nw = s.w, nh = s.h;
      if (crop.mode.indexOf('l') >= 0) { nx = clamp(s.x + dx, 0, s.x + s.w - 20); nw = s.w - (nx - s.x); }
      if (crop.mode.indexOf('r') >= 0) { nw = clamp(s.w + dx, 20, W - s.x); }
      if (crop.mode.indexOf('t') >= 0) { ny = clamp(s.y + dy, 0, s.y + s.h - 20); nh = s.h - (ny - s.y); }
      if (crop.mode.indexOf('b') >= 0) { nh = clamp(s.h + dy, 20, H - s.y); }
      r.x = Math.round(nx); r.y = Math.round(ny); r.w = Math.round(nw); r.h = Math.round(nh);
    }
  }
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function getCursorForMode(mode) {
    if (mode === 'move') return 'grab';
    if (mode === 'tl' || mode === 'br') return 'nwse-resize';
    if (mode === 'tr' || mode === 'bl') return 'nesw-resize';
    if (mode === 'tc' || mode === 'bc') return 'ns-resize';
    if (mode === 'ml' || mode === 'mr') return 'ew-resize';
    return 'default';
  }
  function drawCropOverlay(cv) {
    var ectx = cv.getContext('2d');
    var r = crop.rect; if (!r) return;
    ectx.save(); ectx.setTransform(1, 0, 0, 1, 0, 0);
    // Dim outside
    ectx.fillStyle = 'rgba(0,0,0,0.5)';
    ectx.fillRect(0, 0, cv.width, r.y);
    ectx.fillRect(0, r.y + r.h, cv.width, cv.height - r.y - r.h);
    ectx.fillRect(0, r.y, r.x, r.h);
    ectx.fillRect(r.x + r.w, r.y, cv.width - r.x - r.w, r.h);
    // Border
    ectx.strokeStyle = '#2f81f7'; ectx.lineWidth = 2; ectx.setLineDash([]);
    ectx.strokeRect(r.x, r.y, r.w, r.h);
    // Grid lines (rule of thirds)
    ectx.strokeStyle = 'rgba(255,255,255,0.2)'; ectx.lineWidth = 1;
    for (var i = 1; i <= 2; i++) {
      var gx = r.x + r.w * i / 3, gy = r.y + r.h * i / 3;
      ectx.beginPath(); ectx.moveTo(gx, r.y); ectx.lineTo(gx, r.y + r.h); ectx.stroke();
      ectx.beginPath(); ectx.moveTo(r.x, gy); ectx.lineTo(r.x + r.w, gy); ectx.stroke();
    }
    // Handles
    var handles = getHandles(r);
    ectx.fillStyle = '#fff'; ectx.strokeStyle = '#2f81f7'; ectx.lineWidth = 2;
    for (var j = 0; j < handles.length; j++) {
      ectx.fillRect(handles[j].x - 5, handles[j].y - 5, 10, 10);
      ectx.strokeRect(handles[j].x - 5, handles[j].y - 5, 10, 10);
    }
    // Size label
    ectx.fillStyle = 'rgba(47,129,247,0.9)'; ectx.font = 'bold 11px Inter,sans-serif';
    var label = r.w + ' \u00D7 ' + r.h;
    var lw = ectx.measureText(label).width + 8;
    ectx.fillRect(r.x + r.w / 2 - lw / 2, r.y - 20, lw, 16);
    ectx.fillStyle = '#fff'; ectx.textAlign = 'center'; ectx.textBaseline = 'middle';
    ectx.fillText(label, r.x + r.w / 2, r.y - 12);
    ectx.restore();
  }
  function enableCropTool() {
    var cv = document.getElementById('expCv');
    if (!cv) return;
    crop.active = true;
    initCropRect();
    drawFullPreview();
    drawCropOverlay(cv);
    showCropConfirm();
    // Handlers
    cv.onmousedown = function(e) { cropMouseDown(e, cv); };
    cv.onmousemove = function(e) { cropMouseMove(e, cv); };
    cv.onmouseup = function() { cropMouseUp(); };
    cv.ontouchstart = function(e) { e.preventDefault(); var tc=e.changedTouches[0],r=cv.getBoundingClientRect();cropMouseDown({offsetX:tc.clientX-r.left,offsetY:tc.clientY-r.top},cv); };
    cv.ontouchmove = function(e) { e.preventDefault(); var tc=e.changedTouches[0],r=cv.getBoundingClientRect();cropMouseMove({offsetX:tc.clientX-r.left,offsetY:tc.clientY-r.top},cv); };
    cv.ontouchend = function(e) { e.preventDefault(); cropMouseUp(); };
  }
  function cropMouseDown(e, cv) {
    var scX = cv.width / cv.clientWidth, scY = cv.height / cv.clientHeight;
    var mx = e.offsetX * scX, my = e.offsetY * scY;
    var hit = hitTestHandle(mx, my, crop.rect);
    if (!hit) return;
    crop.mode = hit;
    crop.startMx = mx; crop.startMy = my;
    crop.startRect = { x: crop.rect.x, y: crop.rect.y, w: crop.rect.w, h: crop.rect.h };
    cv.style.cursor = hit === 'move' ? 'grabbing' : getCursorForMode(hit);
  }
  function cropMouseMove(e, cv) {
    var scX = cv.width / cv.clientWidth, scY = cv.height / cv.clientHeight;
    var mx = e.offsetX * scX, my = e.offsetY * scY;
    if (crop.mode) {
      applyCropDrag(mx - crop.startMx, my - crop.startMy);
      drawFullPreview();
      drawCropOverlay(cv);
    } else {
      var hit = hitTestHandle(mx, my, crop.rect);
      cv.style.cursor = hit ? getCursorForMode(hit) : 'default';
    }
  }
  function cropMouseUp() {
    if (crop.mode) { crop.mode = null; crop.startRect = null; }
  }
  function confirmCrop() {
    var cv = document.getElementById('expCv');
    if (cv) {
      cv.onmousedown = null; cv.onmousemove = null; cv.onmouseup = null;
      cv.ontouchstart = null; cv.ontouchmove = null; cv.ontouchend = null;
      cv.style.cursor = 'default';
    }
    crop.active = false; // Deactivate crop mode so updateImagePreview shows cropped result
    hideCropConfirm();
    updateImagePreview();
  }
  function cancelCrop() {
    crop.rect = null;
    var cv = document.getElementById('expCv');
    if (cv) {
      cv.onmousedown = null; cv.onmousemove = null; cv.onmouseup = null;
      cv.ontouchstart = null; cv.ontouchmove = null; cv.ontouchend = null;
      cv.style.cursor = 'default';
    }
    hideCropConfirm();
    var sel = document.getElementById('expArea');
    if (sel) sel.value = 'all';
    updateImagePreview();
  }
  function showCropConfirm() {
    var bar = document.getElementById('expCropBar');
    if (bar) bar.style.display = 'flex';
  }
  function hideCropConfirm() {
    var bar = document.getElementById('expCropBar');
    if (bar) bar.style.display = 'none';
  }
  function resetCropTool() {
    crop.active = false; crop.mode = null; crop.rect = null;
    var cv = document.getElementById('expCv');
    if (cv) {
      cv.style.cursor = 'default';
      cv.onmousedown = null; cv.onmousemove = null; cv.onmouseup = null;
      cv.ontouchstart = null; cv.ontouchmove = null; cv.ontouchend = null;
    }
    hideCropConfirm();
  }
  function touchToMouse(e) {
    var t = e.changedTouches[0], r = e.target.getBoundingClientRect();
    return { offsetX: t.clientX - r.left, offsetY: t.clientY - r.top };
  }
  function drawFullPreview() {
    var cv = document.getElementById('expCv');
    if (!cv) return;
    var ectx = cv.getContext('2d');
    cv.width = Math.round(W); cv.height = Math.round(H);
    ectx.save(); ectx.setTransform(1, 0, 0, 1, 0, 0);
    // Use CanvasPool composite if available, otherwise fallback to single canvas
    if(typeof CanvasPool!=='undefined'&&CanvasPool._layers.length>0){
      // Create composited canvas at display dimensions
      var composited = CanvasPool.createComposited(cv.width, cv.height);
      ectx.drawImage(composited, 0, 0);
    } else if(window.cv){
      ectx.drawImage(window.cv, 0, 0, window.cv.width, window.cv.height, 0, 0, W, H);
    }
    ectx.restore();
  }

  // ==================== IMAGE EXPORT ====================
  function showImageDialog() {
    var modal = document.getElementById('expImgModal');
    if (modal) { modal.classList.add('show'); crop.rect = null; resetCropTool(); updateImagePreview(); }
    // Check File System Access API availability
    if (!isFileAPI) {
      state.savePref = 'auto';
      var sel = document.getElementById('expSavePref'); if (sel) { sel.value = 'auto'; sel.disabled = true; }
      var note = document.getElementById('expSaveNote'); if (note) note.style.display = 'block';
    } else {
      var pref = 'ask'; try { pref = localStorage.getItem('cb_save_pref') || 'ask'; } catch(e) {}
      state.savePref = pref;
      var sel = document.getElementById('expSavePref'); if (sel) { sel.value = pref; sel.disabled = false; }
      var note = document.getElementById('expSaveNote'); if (note) note.style.display = 'none';
    }
  }
  function closeImageDialog() {
    var modal = document.getElementById('expImgModal');
    if (modal) modal.classList.remove('show');
    resetCropTool();
  }
  function onAreaChange(sel) {
    if (sel.value === 'custom') { enableCropTool(); }
    else { resetCropTool(); updateImagePreview(); }
  }
  function updateImagePreview() {
    var ecv = document.getElementById('expCv');
    if (!ecv) return;
    var area = (document.getElementById('expArea') || {}).value || 'all';
    if (area === 'custom' && !crop.rect) return;
    var scale = +(document.getElementById('expQuality') || {}).value || 2;
    // In crop mode: draw full canvas at 1:1 scale so overlay coords match
    var inCropMode = area === 'custom' && crop.active;
    var useScale = inCropMode ? 1 : scale;
    var ea = inCropMode ? { sx: 0, sy: 0, sw: W, sh: H } : ((area === 'custom') ? getExportArea() : { sx: 0, sy: 0, sw: W, sh: H });
    ecv.width = Math.round(ea.sw * useScale); ecv.height = Math.round(ea.sh * useScale);
    var ectx = ecv.getContext('2d');
    ectx.scale(useScale, useScale);
    // Use CanvasPool composite if available, otherwise fallback
    if(typeof CanvasPool!=='undefined' && CanvasPool._layers && CanvasPool._layers.length > 0){
      var composited = CanvasPool.createComposited(Math.round(ea.sw * useScale), Math.round(ea.sh * useScale));
      ectx.drawImage(composited, 0, 0, composited.width, composited.height, 0, 0, ea.sw, ea.sh);
    } else if(window.cv){
      ectx.drawImage(window.cv, ea.sx * dpr, ea.sy * dpr, ea.sw * dpr, ea.sh * dpr, 0, 0, ea.sw, ea.sh);
    }
    if (inCropMode) {
      drawCropOverlay(ecv);
      return;
    }
    var logoPos = (document.getElementById('expLogoPos') || {}).value || 'bottom-right';
    var logoSize = +(document.getElementById('expLogoSize') || {}).value || 25;
    var logoOp = +(document.getElementById('expWmOpacity') || {}).value || 15;
    drawLogoOverlay(ectx, ea.sw, ea.sh, state.watermarkImg, logoPos, logoSize, logoOp);
    var txt = (document.getElementById('expText') || {}).value || '';
    var tcol = (document.getElementById('expTextColor') || {}).value || '#ffffff';
    var tsize = +(document.getElementById('expTextSize') || {}).value || 18;
    var tpos = (document.getElementById('expTextPos') || {}).value || 'bottom';
    drawTextOverlay(ectx, ea.sw, ea.sh, txt, tcol, tsize, tpos);
  }
  function doImageExport() {
    var ecv = document.getElementById('expCv');
    if (!ecv||!window.cv) return;
    // Auto-confirm crop if still active
    if (crop.active) confirmCrop();
    var fmt = (document.getElementById('expFormat') || {}).value || 'png';
    var scale = +(document.getElementById('expQuality') || {}).value || 2;
    var mimeMap = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' };
    var mime = mimeMap[fmt] || 'image/png';
    var quality = fmt === 'png' ? 1.0 : 0.98;
    var area = (document.getElementById('expArea') || {}).value || 'all';
    if (area === 'custom' && !crop.rect) {
      if (typeof toast === 'function') toast('\u062D\u062F\u062F \u0627\u0644\u0645\u0646\u0637\u0642\u0629 \u0623\u0648\u0644\u0627\u064B');
      return;
    }
    var ea = (area === 'custom') ? getExportArea() : { sx: 0, sy: 0, sw: W, sh: H };
    // HIGH-RES: Create offscreen composited canvas at export resolution
    var expW = Math.round(ea.sw * scale);
    var expH = Math.round(ea.sh * scale);

    // First, render all layers at current state
    Engine.render();

    // Create offscreen canvas and composite all layers
    var offscreen = document.createElement('canvas');
    offscreen.width = expW;
    offscreen.height = expH;
    var offCtx = offscreen.getContext('2d');

    if(typeof CanvasPool!=='undefined'&&CanvasPool._layers.length>0){
      // Composite all CanvasPool layers onto offscreen canvas with scaling
      CanvasPool.composite(offscreen, 1, 0, 0);
    } else {
      // Fallback: draw from original canvas
      offCtx.drawImage(window.cv || cv, 0, 0, W, H, 0, 0, expW, expH);
    }

    // Apply crop if needed
    if(area === 'custom' && crop.rect) {
      var cropped = document.createElement('canvas');
      cropped.width = expW;
      cropped.height = expH;
      var cropCtx = cropped.getContext('2d');
      cropCtx.drawImage(offscreen, -ea.sx * scale, -ea.sy * scale);
      offscreen = cropped;
    }

    // Capture the offscreen canvas
    offscreen.toBlob(function(blob) {
      if (!blob) { if (typeof toast === 'function') toast('Export failed'); }
      else {
        var name = (state.lastFileName || 'coachboard') + '-' + Date.now() + '.' + fmt;
        downloadBlob(blob, name);
        closeImageDialog();
      }
    }, mime, quality);
  }
  function loadImageWatermark(input) {
    if (!input.files || !input.files[0]) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() { state.watermarkImg = img; updateImagePreview(); };
      img.src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }

  // ==================== VIDEO EXPORT ====================
  function showVideoDialog() {
    var modal = document.getElementById('expVidModal');
    if (!modal) return;
    modal.classList.add('show');
    var prog = document.getElementById('vidProgress');
    if (prog) prog.style.display = 'none';
    var expBtn = document.getElementById('vidExportBtn');
    if (expBtn) expBtn.disabled = false;
    // Check File System Access API availability
    if (!isFileAPI) {
      state.savePref = 'auto';
      var sel = document.getElementById('vidSavePref'); if (sel) { sel.value = 'auto'; sel.disabled = true; }
      var note = document.getElementById('vidSaveNote'); if (note) note.style.display = 'block';
    } else {
      var pref = 'ask'; try { pref = localStorage.getItem('cb_save_pref') || 'ask'; } catch(e) {}
      state.savePref = pref;
      var sel = document.getElementById('vidSavePref'); if (sel) { sel.value = pref; sel.disabled = false; }
      var note = document.getElementById('vidSaveNote'); if (note) note.style.display = 'none';
    }
  }
  function closeVideoDialog() {
    if (_recorder && _recorder.state === 'recording') _recorder.stop();
    var modal = document.getElementById('expVidModal');
    if (modal) modal.classList.remove('show');
    var prog = document.getElementById('vidProgress');
    if (prog) prog.style.display = 'none';
    _recording = false;
    if (typeof setExportActive === 'function') setExportActive(false);
    var expBtn = document.getElementById('vidExportBtn');
    if (expBtn) expBtn.disabled = false;
  }
  function doVideoExport() {
    if (_recording) return;
    if (!steps || steps.length < 2) {
      if (typeof toast === 'function') toast(typeof t === 'function' ? t('add_2_scenes') : 'Add at least 2 scenes');
      return;
    }
    if (typeof animStop === 'function') animStop();
    _recording = true;
    var fmt = (document.getElementById('vidFormatSel') || {}).value || 'webm';
    var quality = (document.getElementById('vidQualitySel') || {}).value || 'high';
    var info = VIDEO_FORMATS[fmt] || VIDEO_FORMATS.webm;
    var qInfo = VIDEO_QUALITY[quality] || VIDEO_QUALITY.high;
    // Load watermark if selected
    var wmInput = document.getElementById('vidWmFile');
    if (wmInput && wmInput.files && wmInput.files[0]) {
      var reader = new FileReader();
      reader.onload = function(e) {
        var img = new Image();
        img.onload = function() { state.vidWatermarkImg = img; startVideoRecording(info, qInfo); };
        img.src = e.target.result;
      };
      reader.readAsDataURL(wmInput.files[0]);
    } else { startVideoRecording(info, qInfo); }
  }
  function startVideoRecording(formatInfo, qualityInfo) {
    var progWrap = document.getElementById('vidProgress');
    var progBar = document.getElementById('vidProgressBar');
    var progTxt = document.getElementById('vidProgressTxt');
    var progPct = document.getElementById('vidProgressPct');
    var expBtn = document.getElementById('vidExportBtn');
    if (progWrap) progWrap.style.display = 'block';
    if (progBar) progBar.style.width = '0%';
    if (progTxt) progTxt.textContent = '\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0636\u064A\u0631...';
    if (progPct) progPct.textContent = '0%';
    if (expBtn) expBtn.disabled = true;
    var fps = state.vidFps;
    var mime = formatInfo.mime; // Always record as WebM
    var bitrate = qualityInfo.bitrate;

    // HIGH-RES VIDEO: Get target resolution
    var resKey = (document.getElementById('vidResSel') || {}).value || '1080p';
    var resInfo = VIDEO_RESOLUTIONS[resKey] || VIDEO_RESOLUTIONS['1080p'];
    var origW = W, origH = H;

    // Create capture canvas at target resolution
    var captureW = resInfo.w > 0 ? resInfo.w : Math.round(W);
    var captureH = resInfo.w > 0 ? Math.round(H * (captureW / W)) : H;
    // Ensure even dimensions for video codec compatibility
    if (captureW % 2 !== 0) captureW--;
    if (captureH % 2 !== 0) captureH--;

    var captureCanvas;
    if(typeof CanvasPool!=='undefined'&&CanvasPool._layers.length>0){
      captureCanvas = CanvasPool.getCaptureCanvas(captureW, captureH);
    } else {
      // Fallback: use original canvas
      captureCanvas = window.cv || cv;
    }

    var stream;
    try { stream = captureCanvas.captureStream(30); } catch(e) {
      _recording = false;
      if (typeof setExportActive === 'function') setExportActive(false);
      if (progWrap) progWrap.style.display = 'none';
      if (expBtn) expBtn.disabled = false;
      if (typeof toast === 'function') toast('Capture not supported: ' + e.message);
      return;
    }
    if (typeof setExportActive === 'function') setExportActive(true);

    // Store original dimensions for restore
    state._videoOrigW = origW;
    state._videoOrigH = origH;

    function _createRecorder(stream, preferredMime, bitrate) {
      var mimeTry = [preferredMime, 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
      for (var mi = 0; mi < mimeTry.length; mi++) {
        if (!mimeTry[mi]) continue;
        if (typeof MediaRecorder.isTypeSupported === 'function' && !MediaRecorder.isTypeSupported(mimeTry[mi])) continue;
        try { return new MediaRecorder(stream, { mimeType: mimeTry[mi], videoBitsPerSecond: bitrate }); } catch(e) {}
      }
      throw new Error('No supported mime type');
    }
    try { _recorder = _createRecorder(stream, mime, bitrate);
      var recordedMime = _recorder.mimeType || 'video/webm'; }
    catch(e) {
      if (typeof toast === 'function') toast('Recording not supported');
      _recording = false;
      // Restore canvas
      W = state._videoOrigW || origW;
      H = state._videoOrigH || origH;
      if(typeof CanvasPool!=='undefined'&&CanvasPool._layers.length>0){
        CanvasPool.resize(W, H);
      }
      if (typeof setExportActive === 'function') setExportActive(false);
      if (progWrap) progWrap.style.display = 'none';
      if (expBtn) expBtn.disabled = false; render(); return;
    }
    var chunks = [];
    _recorder.ondataavailable = function(ev) { if (ev.data.size > 0) chunks.push(ev.data); };
    _recorder.onstop = function() {
      _recording = false;
      // Restore canvas to original resolution
      W = state._videoOrigW || origW;
      H = state._videoOrigH || origH;
      if(typeof CanvasPool!=='undefined'&&CanvasPool._layers.length>0){
        CanvasPool.resize(W, H);
      }
      render();
      var recBlob = new Blob(chunks, { type: recordedMime });
      if (formatInfo.needsConvert) {
        // Convert via ffmpeg.wasm
        if (progTxt) progTxt.textContent = '\u062C\u0627\u0631\u064A \u062A\u062D\u0645\u064A\u0644 \u0645\u062D\u0631\u0643 \u0627\u0644\u062A\u062D\u0648\u064A\u0644...';
        if (progBar) progBar.style.width = '90%';
        if (progPct) progPct.textContent = '90%';
        convertVideo(recBlob, formatInfo.ext, function(msg) {
          if (progTxt) progTxt.textContent = msg;
        }).then(function(convertedBlob) {
          var name = (state.lastFileName || 'coachboard') + '-' + Date.now() + '.' + formatInfo.ext;
          downloadBlob(convertedBlob, name);
          finishVideoExport(progWrap, expBtn);
        }).catch(function(err) {
          if (typeof toast === 'function') toast('\u0641\u0634\u0644 \u0627\u0644\u062A\u062D\u0648\u064A\u0644\u060C \u062A\u0645 \u0627\u0644\u062A\u062D\u0645\u064A\u0644 \u0628\u0627\u0645\u062A\u062F\u0627\u062F ' + formatInfo.ext + ' (\u0628\u062A\u0631\u0645\u064A\u0632 WebM)');
          var name = (state.lastFileName || 'coachboard') + '-' + Date.now() + '.' + formatInfo.ext;
          downloadBlob(recBlob, name);
          finishVideoExport(progWrap, expBtn);
        });
      } else {
        var ext = formatInfo.ext;
        var name = (state.lastFileName || 'coachboard') + '-' + Date.now() + '.' + ext;
        downloadBlob(recBlob, name);
        finishVideoExport(progWrap, expBtn);
      }
    };
    _recorder.onerror = function() {
      if (typeof toast === 'function') toast('Recording error');
      _recording = false;
      // Restore canvas to original state
      W = state._videoOrigW || origW;
      H = state._videoOrigH || origH;
      if(typeof CanvasPool!=='undefined'&&CanvasPool._layers.length>0){
        CanvasPool.resize(W, H);
      }
      render();
      if (typeof setExportActive === 'function') setExportActive(false);
      if (progWrap) progWrap.style.display = 'none';
      if (expBtn) expBtn.disabled = false;
    };
    // Read overlay settings
    var vidText = (document.getElementById('vidText') || {}).value || '';
    var vidTextColor = (document.getElementById('vidTextColor') || {}).value || '#ffffff';
    var vidTextSize = +(document.getElementById('vidTextSize') || {}).value || 18;
    var vidTextPos = (document.getElementById('vidTextPos') || {}).value || 'bottom';
    var vidLogoPos = (document.getElementById('vidLogoPos') || {}).value || 'bottom-right';
    var vidLogoSize = +(document.getElementById('vidLogoSize') || {}).value || 20;
    var vidLogoOp = +(document.getElementById('vidWmOpacity') || {}).value || 15;
    _recorder.start(50);
    var si = 0, _motionPrev = {};
    var sceneStart = Date.now();
    function getCurSceneDur() { return ((steps[si] && steps[si].dur) || 1.5) * 1000; }
    function drawMotionTrails() {
      for (var mi = 0; mi < els.length; mi++) {
        var el = els[mi]; if (!isP2D(el.type)) continue;
        var prev = _motionPrev[el.id];
        if (prev) {
          var vx = el.x - prev.x, vy = el.y - prev.y;
          var speed = Math.sqrt(vx * vx + vy * vy);
          if (speed > 0.3) {
            cx.save(); cx.globalAlpha = Math.min(0.5, speed / 20);
            cx.strokeStyle = '#ffffff'; cx.lineWidth = 2.5; cx.lineCap = 'round';
            for (var li = 1; li <= 4; li++) {
              var off = li * 3, spread = li * 3;
              cx.beginPath(); cx.moveTo(el.x - vx * 0.2 * li, el.y - vy * 0.2 * li - spread);
              cx.lineTo(el.x - vx * 0.4 * li, el.y - vy * 0.4 * li - spread); cx.stroke();
              cx.beginPath(); cx.moveTo(el.x - vx * 0.2 * li, el.y - vy * 0.2 * li + spread);
              cx.lineTo(el.x - vx * 0.4 * li, el.y - vy * 0.4 * li + spread); cx.stroke();
            }
            cx.restore();
          }
        }
        _motionPrev[el.id] = { x: el.x, y: el.y };
      }
    }
    function expLoop() {
      if (!_recording || si >= steps.length - 1) {
        if (_recorder && _recorder.state === 'recording') _recorder.stop();
        return;
      }
      var from = steps[si].els, to = steps[si + 1].els;
      var sceneDur = getCurSceneDur();
      var transDur = 300; // transition duration in ms
      var transType = (document.getElementById('vidTransSel') || {}).value || 'fade';
      function sub() {
        if (!_recording) return;
        var elapsed = Date.now() - sceneStart;
        var t2 = Math.min(1, elapsed / sceneDur);
        var ease = t2 < 0.5 ? 2 * t2 * t2 : 1 - Math.pow(-2 * t2 + 2, 2) / 2;
        interpolate(from, to, ease);
        render();
        // Composite all layers onto capture canvas for video recording
        if(typeof CanvasPool!=='undefined'&&CanvasPool._layers.length>0){
          CanvasPool.compositeToCapture();
        }
        drawMotionTrails();
        // Transition effect at end of scene
        var transProgress = 0;
        if (t2 > 0.85) {
          transProgress = (t2 - 0.85) / 0.15;
          cx.save();
          if (transType === 'fade') {
            cx.fillStyle = 'rgba(0,0,0,' + transProgress * 0.5 + ')';
            cx.fillRect(0, 0, W, H);
          } else if (transType === 'slide') {
            var slideX = -W * transProgress * 0.3;
            cx.fillStyle = 'rgba(0,0,0,0.8)';
            cx.fillRect(0, 0, W * transProgress, H);
          } else if (transType === 'wipe') {
            cx.fillStyle = 'rgba(0,0,0,0.6)';
            cx.fillRect(0, 0, W, H * transProgress);
          }
          cx.restore();
        }
        cx.save();
        drawLogoOverlay(cx, W, H, state.vidWatermarkImg, vidLogoPos, vidLogoSize, vidLogoOp);
        drawTextOverlay(cx, W, H, vidText, vidTextColor, vidTextSize, vidTextPos);
        cx.restore();
        var totalScenes = steps.length - 1;
        var pct = Math.round(((si + t2) / totalScenes) * (formatInfo.needsConvert ? 80 : 95));
        if (progBar) progBar.style.width = pct + '%';
        if (progTxt) progTxt.textContent = '\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u0635\u062F\u064A\u0631... ' + pct + '%';
        if (progPct) progPct.textContent = pct + '%';
        if (t2 < 1) setTimeout(sub, 1000 / (fps || 30));
        else { si++; sceneStart = Date.now(); expLoop(); }
      }
      sub();
    }
    setTimeout(function() { expLoop(); }, 300);
  }
  function finishVideoExport(progWrap, expBtn) {
    if (typeof setExportActive === 'function') setExportActive(false);
    if (progWrap) progWrap.style.display = 'none';
    if (expBtn) expBtn.disabled = false;
    closeVideoDialog();
  }
  function loadVideoWatermark(input) {
    if (!input.files || !input.files[0]) return;
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() { state.vidWatermarkImg = img; };
      img.src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }
  function setFileName(name) { state.lastFileName = name || 'coachboard'; }
  function setExportFileName(name) { state.customFileName = name || ''; }
  function setSavePref(pref) { state.savePref = pref; try { localStorage.setItem('cb_save_pref', pref); } catch(e) {} }

  // Phase H: SVG Export
  function exportSVG() {
    if (typeof SVGGenerator === 'undefined') { toast('SVG Generator not loaded'); return; }
    var bg = '#1a5c2a';
    try {
      if (typeof pitchColor !== 'undefined') bg = pitchColor;
      else if (typeof currentSport !== 'undefined' && typeof pitchColors !== 'undefined') bg = pitchColors[currentSport] || '#1a5c2a';
    } catch(e) {}
    var svgContent = SVGGenerator.generateDocument(els, { width: W, height: H, background: bg });
    var fileName = (state.customFileName || state.lastFileName || 'coachboard') + '.svg';
    SVGGenerator.downloadSVG(svgContent, fileName);
    toast('SVG exported!');
  }

  return {
    state: state, isFileAPI: isFileAPI,
    showImageDialog: showImageDialog, closeImageDialog: closeImageDialog,
    updateImagePreview: updateImagePreview, doImageExport: doImageExport,
    loadImageWatermark: loadImageWatermark,
    onAreaChange: onAreaChange, confirmCrop: confirmCrop, cancelCrop: cancelCrop,
    showVideoDialog: showVideoDialog, closeVideoDialog: closeVideoDialog,
    doVideoExport: doVideoExport, loadVideoWatermark: loadVideoWatermark,
    setFileName: setFileName, setExportFileName: setExportFileName,
    setSavePref: setSavePref, downloadBlob: downloadBlob,
    exportSVG: exportSVG
  };
})();

// Bridge functions
function exportImg()        { ExportManager.showImageDialog(); }
function exportSVG()        { ExportManager.exportSVG(); }
function closeExpImg()      { ExportManager.closeImageDialog(); }
function updateExpPreview() { ExportManager.updateImagePreview(); }
function doExportImg()      { ExportManager.doImageExport(); }
function loadExpWatermark(input) { ExportManager.loadImageWatermark(input); }
function showExpVid()       { ExportManager.showVideoDialog(); }
function hideExpVid()       { ExportManager.closeVideoDialog(); }
function doExportVid()      { ExportManager.doVideoExport(); }
