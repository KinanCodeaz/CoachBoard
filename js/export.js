/**
 * CoachBoard Pro - Export Module v9
 * Presentation-quality export pipeline.
 * Uses ExportRenderer for independent vector rendering.
 * Never reads from the editor canvas.
 */
var ExportManager = (function() {
  var state = {
    watermarkImg: null,
    vidWatermarkImg: null,
    vidFormat: 'webmvp9', vidQuality: 'high', vidFps: 30, vidRes: '1080p',
    lastFileName: 'coachboard', lastDirHandle: null,
    savePref: 'ask',
    imgRes: '2160p', imgProfile: 'high'
  };
  var _recording = false, _recorder = null, _exportCancelled = false;
  var _exportStartTime = 0;
  var isFileAPI = !!(window.showSaveFilePicker && window.isSecureContext);
  var crop = { active: false, mode: null, rect: null, startMx: 0, startMy: 0, startRect: null };
  var HANDLE_SZ = 8;

  var VIDEO_FORMATS = {
    webm:    { label: 'WebM (VP8)',       mime: 'video/webm',            ext: 'webm' },
    webmvp9: { label: 'WebM HD (VP9)',    mime: 'video/webm;codecs=vp9', ext: 'webm' },
    mp4:     { label: 'MP4 (H.264)',      mime: 'video/webm',            ext: 'mp4' },
    mkv:     { label: 'MKV (VP9)',        mime: 'video/webm;codecs=vp9', ext: 'mkv' }
  };
  var VIDEO_QUALITY = {
    low:    { label: '\u0645\u0646\u062E\u0641\u0636\u0629 (8 Mbps)',   bitrate: 8000000 },
    medium: { label: '\u0645\u062A\u0648\u0633\u0637\u0629 (16 Mbps)',  bitrate: 16000000 },
    high:   { label: '\u0639\u0627\u0644\u064A\u0629 (25 Mbps)',      bitrate: 25000000 },
    ultra:  { label: '\u0641\u0627\u0626\u0642\u0629 (40 Mbps)',      bitrate: 40000000 },
    max:    { label: '\u0642\u0635\u0648\u0649 (60 Mbps)',          bitrate: 60000000 }
  };

  // ==================== HELPERS ====================
  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function _formatTime(ms) {
    var s = Math.floor(ms / 1000);
    var m = Math.floor(s / 60);
    s = s % 60;
    return (m > 0 ? m + 'm ' : '') + s + 's';
  }
  function _updateProgress(pct, txt, progBar, progTxt, progPct, progTime) {
    if (progBar) progBar.style.width = pct + '%';
    if (progTxt) progTxt.textContent = txt;
    if (progPct) progPct.textContent = pct + '%';
    if (progTime && _exportStartTime > 0) {
      var elapsed = Date.now() - _exportStartTime;
      var eta = pct > 0 ? (elapsed / pct * (100 - pct)) : 0;
      progTime.textContent = _formatTime(elapsed) + (pct > 0 && pct < 100 ? ' | ~' + _formatTime(eta) : '');
    }
  }
  function _getSteps() {
    try {
      if (typeof Animation !== 'undefined' && typeof Animation.getSteps === 'function') return Animation.getSteps();
    } catch(e) {}
    return typeof steps !== 'undefined' ? steps : [];
  }
  function _loadWatermark(input, callback) {
    if (!input || !input.files || !input.files[0]) { callback(null); return; }
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() { callback(img); };
      img.src = e.target.result;
    };
    reader.readAsDataURL(input.files[0]);
  }

  // ==================== EXPORT CONTEXT BUILDER ====================
  function _buildExportOpts(opts) {
    opts = opts || {};
    return {
      sportType: typeof sportType !== 'undefined' ? sportType : 'football',
      theme: typeof theme !== 'undefined' ? theme : 'dark',
      pitchColor: opts.pitchColor || null,
      gridOn: typeof gridOn !== 'undefined' ? gridOn : false,
      teamA: typeof teamA !== 'undefined' ? teamA : null,
      teamB: typeof teamB !== 'undefined' ? teamB : null,
      teamALogo: typeof teamALogo !== 'undefined' ? teamALogo : null,
      teamBLogo: typeof teamBLogo !== 'undefined' ? teamBLogo : null,
      showTeamInfo: typeof showTeamInfo !== 'undefined' ? showTeamInfo : true,
      showBench: typeof showBench !== 'undefined' ? showBench : true,
      measureData: null,
      playerLinks: typeof playerLinks !== 'undefined' ? playerLinks : [],
      trails: typeof trails !== 'undefined' ? trails : [],
      coachInfo: typeof coachInfo !== 'undefined' ? coachInfo : null,
      sourceW: typeof W !== 'undefined' ? W : 1600,
      sourceH: typeof H !== 'undefined' ? H : 900
    };
  }

  // ==================== DOWNLOAD ====================
  function downloadBlob(blob, defaultName) {
    var url = URL.createObjectURL(blob);
    var nameInput = document.getElementById('expFileName') || document.getElementById('vidFileName');
    if (nameInput && nameInput.value.trim()) {
      var ext = defaultName.split('.').pop();
      defaultName = nameInput.value.trim() + '.' + ext;
    }
    if (state.savePref === 'ask' && isFileAPI && window.showSaveFilePicker) {
      var ext = defaultName.split('.').pop();
      var typeMap = {
        png:  { description: 'PNG Image',     accept: { 'image/png': ['.png'] } },
        jpeg: { description: 'JPEG Image',    accept: { 'image/jpeg': ['.jpg','.jpeg'] } },
        webp: { description: 'WebP Image',    accept: { 'image/webp': ['.webp'] } },
        webm: { description: 'WebM Video',    accept: { 'video/webm': ['.webm'] } },
        mp4:  { description: 'MP4 Video',     accept: { 'video/mp4': ['.mp4'] } }
      };
      var opts = { suggestedName: defaultName, types: typeMap[ext] ? [typeMap[ext]] : [] };
      if (state.lastDirHandle) { try { opts.startIn = state.lastDirHandle; } catch(e) {} }
      window.showSaveFilePicker(opts).then(function(handle) {
        state.lastDirHandle = handle;
        return handle.createWritable();
      }).then(function(w) {
        return w.write(blob).then(function() { return w.close(); });
      }).then(function() {
        URL.revokeObjectURL(url);
        if (typeof toast === 'function') toast(typeof t === 'function' ? t('exported') : 'Exported!');
      }).catch(function(e) {
        if (e.name !== 'AbortError') _fallbackDownload(url, defaultName);
        else URL.revokeObjectURL(url);
      });
    } else { _fallbackDownload(url, defaultName); }
  }
  function _fallbackDownload(url, name) {
    var a = document.createElement('a'); a.href = url; a.download = name; a.click();
    setTimeout(function() { URL.revokeObjectURL(url); }, 2000);
    if (typeof toast === 'function') toast(typeof t === 'function' ? t('exported') : 'Exported!');
  }
  function _canvasToBlob(canvas, mime, callback) {
    try {
      var dataUrl = canvas.toDataURL(mime);
      if (dataUrl && dataUrl.indexOf('data:image') === 0 && dataUrl.length > 200) {
        var parts = dataUrl.split(',');
        if (parts.length >= 2) {
          var byteStr = atob(parts[1].trim());
          var arr = new Uint8Array(byteStr.length);
          for (var i = 0; i < byteStr.length; i++) arr[i] = byteStr.charCodeAt(i);
          var blob = new Blob([arr], { type: mime });
          if (blob.size > 0) { callback(blob); return; }
        }
      }
    } catch(e) { console.error('[Export] toDataURL failed:', e); }
    try {
      canvas.toBlob(function(blob) {
        if (blob && blob.size > 0) { callback(blob); return; }
        callback(null);
      }, mime);
      return;
    } catch(e) { console.error('[Export] toBlob failed:', e); }
    callback(null);
  }

  // ==================== IMAGE EXPORT ====================
  function showImageDialog() {
    var modal = document.getElementById('expImgModal');
    if (modal) { modal.classList.add('show'); crop.rect = null; _resetCropTool(); _updateImagePreview(); _onFormatChange(); }
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
    _resetCropTool();
  }
  function _onFormatChange() {
    var fmt = (document.getElementById('expFormat') || {}).value || 'png';
    var wrap = document.getElementById('expImgQualityWrap');
    if (wrap) wrap.style.display = (fmt === 'png') ? 'none' : 'block';
  }
  function onAreaChange(sel) {
    if (sel.value === 'custom') { _enableCropTool(); }
    else { _resetCropTool(); _updateImagePreview(); }
  }
  function _updateImagePreview() {
    var ecv = document.getElementById('expCv');
    if (!ecv) return;
    var area = (document.getElementById('expArea') || {}).value || 'all';
    if (area === 'custom' && !crop.rect) return;
    var resKey = (document.getElementById('expRes') || {}).value || '1080p';
    var profileKey = (document.getElementById('expProfile') || {}).value || 'high';
    var resInfo = ExportRenderer.RESOLUTIONS[resKey] || ExportRenderer.RESOLUTIONS['1080p'];
    var targetW = resInfo.w;
    var targetH = resInfo.h;
    if (resKey === 'custom') {
      targetW = +(document.getElementById('expCustomW') || {}).value || 1920;
      targetH = +(document.getElementById('expCustomH') || {}).value || 1080;
    }
    // Scale preview to fit in the modal
    var maxPreviewW = 320;
    var maxPreviewH = 220;
    var previewScale = Math.min(maxPreviewW / targetW, maxPreviewH / targetH);
    var previewW = Math.round(targetW * previewScale);
    var previewH = Math.round(targetH * previewScale);
    ecv.width = previewW;
    ecv.height = previewH;
    // Use ExportRenderer to render preview
    var elements = typeof els !== 'undefined' ? els : [];
    ExportRenderer.renderPreview(ecv, elements, {
      sourceW: typeof W !== 'undefined' ? W : 1600,
      sourceH: typeof H !== 'undefined' ? H : 900,
      theme: typeof theme !== 'undefined' ? theme : 'dark',
      sportType: typeof sport !== 'undefined' ? sport : 'football',
      pitchVertical: typeof pitchVertical !== 'undefined' ? pitchVertical : false,
      playerLinks: typeof playerLinks !== 'undefined' ? playerLinks : [],
      trails: typeof trails !== 'undefined' ? trails : []
    });
    // Overlays
    var logoPos = (document.getElementById('expLogoPos') || {}).value || 'bottom-right';
    var logoSize = +(document.getElementById('expLogoSize') || {}).value || 25;
    var logoOp = +(document.getElementById('expWmOpacity') || {}).value || 15;
    ExportRenderer.renderOverlays(ecv.getContext('2d'), previewW, previewH, {
      text: (document.getElementById('expText') || {}).value || '',
      textColor: (document.getElementById('expTextColor') || {}).value || '#ffffff',
      textSize: (+(document.getElementById('expTextSize') || {}).value || 18) * previewScale,
      textPos: (document.getElementById('expTextPos') || {}).value || 'bottom',
      logoImg: state.watermarkImg,
      logoPos: logoPos,
      logoSize: logoSize,
      logoOpacity: logoOp
    });
    if (area === 'custom' && crop.rect) _drawCropOverlay(ecv);
  }
  function doImageExport() {
    if (crop.active) _confirmCrop();
    var fmt = (document.getElementById('expFormat') || {}).value || 'png';
    var resKey = (document.getElementById('expRes') || {}).value || '1080p';
    var profileKey = (document.getElementById('expProfile') || {}).value || 'high';
    var mimeMap = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' };
    var mime = mimeMap[fmt] || 'image/png';
    var area = (document.getElementById('expArea') || {}).value || 'all';
    if (area === 'custom' && !crop.rect) {
      if (typeof toast === 'function') toast('\u062D\u062F\u062F \u0627\u0644\u0645\u0646\u0637\u0629 \u0623\u0648\u0644\u0627\u16BE');
      return;
    }
    var resInfo = ExportRenderer.RESOLUTIONS[resKey] || ExportRenderer.RESOLUTIONS['1080p'];
    var targetW = resInfo.w;
    var targetH = resInfo.h;
    if (resKey === 'custom') {
      targetW = +(document.getElementById('expCustomW') || {}).value || 1920;
      targetH = +(document.getElementById('expCustomH') || {}).value || 1080;
    }
    // Apply crop
    var elements = typeof els !== 'undefined' ? els : [];
    var renderOpts = {
      elements: elements,
      sourceW: typeof W !== 'undefined' ? W : 1600,
      sourceH: typeof H !== 'undefined' ? H : 900,
      theme: typeof theme !== 'undefined' ? theme : 'dark',
      sportType: typeof sport !== 'undefined' ? sport : 'football',
      pitchVertical: typeof pitchVertical !== 'undefined' ? pitchVertical : false,
      gridOn: typeof gridOn !== 'undefined' ? gridOn : false,
      playerLinks: typeof playerLinks !== 'undefined' ? playerLinks : [],
      trails: typeof trails !== 'undefined' ? trails : [],
      quality: profileKey
    };
    var resultCanvas = ExportRenderer.renderSuperSampled(targetW, targetH, elements, renderOpts);
    // Apply overlays
    var ectx = resultCanvas.getContext('2d');
    var compressionQuality = +(document.getElementById('expImgQuality') || {}).value || 98;
    ExportRenderer.renderOverlays(ectx, targetW, targetH, {
      text: (document.getElementById('expText') || {}).value || '',
      textColor: (document.getElementById('expTextColor') || {}).value || '#ffffff',
      textSize: +(document.getElementById('expTextSize') || {}).value || 18,
      textPos: (document.getElementById('expTextPos') || {}).value || 'bottom',
      logoImg: state.watermarkImg,
      logoPos: (document.getElementById('expLogoPos') || {}).value || 'bottom-right',
      logoSize: +(document.getElementById('expLogoSize') || {}).value || 25,
      logoOpacity: +(document.getElementById('expWmOpacity') || {}).value || 15
    });
    var name = (state.lastFileName || 'coachboard') + '-' + Date.now() + '.' + fmt;
    _canvasToBlob(resultCanvas, mime, function(blob) {
      if (blob) {
        downloadBlob(blob, name);
        closeImageDialog();
      } else {
        closeImageDialog();
        if (typeof toast === 'function') toast('\u274C \u0641\u0634\u0644 \u0627\u0644\u062A\u0635\u062F\u064A\u0631', 5000);
      }
    });
  }
  function loadImageWatermark(input) {
    _loadWatermark(input, function(img) { state.watermarkImg = img; _updateImagePreview(); });
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
    var _steps = _getSteps();
    if (!_steps || _steps.length < 2) {
      if (typeof toast === 'function') toast(lang==='ar'?'\u0623\u0636\u0641 \u0645\u0634\u0647\u062F\u064A\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644':'Add at least 2 scenes');
      return;
    }
    if (typeof Animation !== 'undefined' && typeof Animation.stop === 'function') Animation.stop();
    _recording = true;
    var fmt = (document.getElementById('vidFormatSel') || {}).value || 'webmvp9';
    var quality = (document.getElementById('vidQualitySel') || {}).value || 'high';
    var formatInfo = VIDEO_FORMATS[fmt] || VIDEO_FORMATS.webmvp9;
    var qualityInfo = VIDEO_QUALITY[quality] || VIDEO_QUALITY.high;
    var wmInput = document.getElementById('vidWmFile');
    _loadWatermark(wmInput, function(img) {
      state.vidWatermarkImg = img;
      _startVideoRecording(_steps, formatInfo, qualityInfo);
    });
  }

  function _startVideoRecording(allSteps, formatInfo, qualityInfo) {
    var progWrap = document.getElementById('vidProgress');
    var progBar = document.getElementById('vidProgressBar');
    var progTxt = document.getElementById('vidProgressTxt');
    var progPct = document.getElementById('vidProgressPct');
    var progTime = document.getElementById('vidProgressTime');
    var expBtn = document.getElementById('vidExportBtn');
    var cancelBtn = document.getElementById('vidCancelBtn');
    _exportCancelled = false;
    _exportStartTime = Date.now();
    if (progWrap) progWrap.style.display = 'block';
    _updateProgress(0, '\u062C\u0627\u0631\u064A \u0627\u0644\u062A\u062D\u0636\u064A\u0631...', progBar, progTxt, progPct, progTime);
    if (expBtn) expBtn.disabled = true;
    if (cancelBtn) { cancelBtn.style.display = 'inline-flex'; cancelBtn.disabled = false; }

    var fps = state.vidFps || 30;
    var totalScenes = allSteps.length - 1;

    // Target resolution
    var resKey = (document.getElementById('vidResSel') || {}).value || '1080p';
    var resInfo = ExportRenderer.RESOLUTIONS[resKey] || ExportRenderer.RESOLUTIONS['1080p'];
    var targetW = resInfo.w || W;
    var targetH = resInfo.h || H;
    if (resKey === 'native') { targetW = W; targetH = H; }

    // Quality profile for video (use balanced for speed)
    var profileKey = (document.getElementById('vidProfile') || {}).value || 'balanced';
    var profile = ExportRenderer.QUALITY_PROFILES[profileKey] || ExportRenderer.QUALITY_PROFILES.balanced;

    // Overlays config
    var vidText = (document.getElementById('vidText') || {}).value || '';
    var vidTextColor = (document.getElementById('vidTextColor') || {}).value || '#ffffff';
    var vidTextSize = +(document.getElementById('vidTextSize') || {}).value || 18;
    var vidTextPos = (document.getElementById('vidTextPos') || {}).value || 'bottom';
    var vidLogoPos = (document.getElementById('vidLogoPos') || {}).value || 'bottom-right';
    var vidLogoSize = +(document.getElementById('vidLogoSize') || {}).value || 20;
    var vidLogoOp = +(document.getElementById('vidWmOpacity') || {}).value || 15;

    if (typeof setExportActive === 'function') setExportActive(true);

    // Offscreen canvas at target resolution
    var offCanvas = document.createElement('canvas');
    offCanvas.width = targetW;
    offCanvas.height = targetH;
    var offCtx = offCanvas.getContext('2d');
    offCtx.imageSmoothingEnabled = true;
    offCtx.imageSmoothingQuality = profile.smoothing || 'high';

    // Capture stream from offscreen canvas
    var _stream = null;
    try { _stream = offCanvas.captureStream(fps); } catch(e) { console.error('[Video] captureStream FAILED:', e); }
    if (!_stream) {
      _finishVideo(progWrap, expBtn, progTime);
      if (typeof toast === 'function') toast('\u274C \u0641\u0634\u0644 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0641\u064A\u062F\u064A\u0648', 5000);
      return;
    }

    // MediaRecorder with actual bitrate
    var _mime = formatInfo.mime || 'video/webm;codecs=vp9';
    var _rec = null;
    try { _rec = new MediaRecorder(_stream, { mimeType: _mime, videoBitsPerSecond: qualityInfo.bitrate }); } catch(e) { _rec = null; }
    if (!_rec) try { _rec = new MediaRecorder(_stream, { videoBitsPerSecond: qualityInfo.bitrate }); } catch(e2) { _rec = null; }
    if (!_rec) try { _rec = new MediaRecorder(_stream); } catch(e3) { _rec = null; }
    if (!_rec) {
      _finishVideo(progWrap, expBtn, progTime);
      if (typeof toast === 'function') toast('\u274C \u0627\u0644\u0645\u0633\u062C\u0644 \u063A\u064A\u0631 \u0645\u062A\u0627\u062D', 5000);
      return;
    }

    var _chunks = [];
    _rec.ondataavailable = function(ev) { if (ev.data && ev.data.size > 0) _chunks.push(ev.data); };
    _rec.onstop = function() {
      var blob = new Blob(_chunks, { type: _rec.mimeType || _mime });
      var name = (state.lastFileName || 'coachboard') + '-' + Date.now() + '.' + (formatInfo.ext || 'webm');
      if (blob.size > 0) downloadBlob(blob, name);
      else if (typeof toast === 'function') toast('\u274C \u0641\u0634\u0644 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0641\u064A\u062F\u064A\u0648', 5000);
      _finishVideo(progWrap, expBtn, progTime);
    };

    _recorder = _rec;
    _rec.start(100);

    // Frame-accurate deterministic rendering
    var sceneIdx = 0;
    var renderOpts = {
      sourceW: typeof W !== 'undefined' ? W : 1600,
      sourceH: typeof H !== 'undefined' ? H : 900,
      theme: typeof theme !== 'undefined' ? theme : 'dark',
      sportType: typeof sport !== 'undefined' ? sport : 'football',
      pitchVertical: typeof pitchVertical !== 'undefined' ? pitchVertical : false,
      gridOn: typeof gridOn !== 'undefined' ? gridOn : false,
      playerLinks: typeof playerLinks !== 'undefined' ? playerLinks : [],
      trails: typeof trails !== 'undefined' ? trails : []
    };

    function _renderScene() {
      if (!_recording || _exportCancelled || sceneIdx >= totalScenes) {
        try { if (_rec.state === 'recording') _rec.stop(); } catch(e) {}
        return;
      }
      var from = allSteps[sceneIdx].els;
      var to = allSteps[sceneIdx + 1].els;
      var sceneDur = ((allSteps[sceneIdx] && allSteps[sceneIdx].dur) || 1.5);
      var totalFrames = Math.ceil(sceneDur * fps);
      var frameIdx = 0;

      function _renderFrame() {
        if (!_recording || _exportCancelled) { try { if (_rec.state === 'recording') _rec.stop(); } catch(e) {} return; }

        // Deterministic interpolation
        var t = frameIdx / Math.max(1, totalFrames - 1);
        t = Math.min(1, t);
        var ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

        // Interpolate elements
        if (typeof Animation !== 'undefined' && typeof Animation.interpolate === 'function') Animation.interpolate(from, to, ease);
        else interpolate(from, to, ease);

        // Render to offscreen canvas using ExportRenderer
        var currentEls = typeof els !== 'undefined' ? els : [];
        renderOpts.elements = currentEls;
        ExportRenderer.renderToCanvas(offCanvas, offCtx, renderOpts);

        // Apply overlays
        ExportRenderer.renderOverlays(offCtx, targetW, targetH, {
          text: vidText,
          textColor: vidTextColor,
          textSize: vidTextSize,
          textPos: vidTextPos,
          logoImg: state.vidWatermarkImg,
          logoPos: vidLogoPos,
          logoSize: vidLogoSize,
          logoOpacity: vidLogoOp
        });

        // Notify stream of new frame
        try {
          var tracks = _stream.getVideoTracks();
          if (tracks && tracks[0] && typeof tracks[0].requestFrame === 'function') tracks[0].requestFrame();
        } catch(e) {}

        // Progress
        var pct = Math.round(((sceneIdx + t) / totalScenes) * 95);
        _updateProgress(pct, '\u062C\u0627\u0631\u064A \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0641\u064A\u062F\u064A\u0648... ' + pct + '%', progBar, progTxt, progPct, progTime);

        frameIdx++;
        if (frameIdx < totalFrames && !_exportCancelled) {
          // Use requestAnimationFrame for smoother rendering, but track frame count
          requestAnimationFrame(function() { _renderFrame(); });
        } else {
          sceneIdx++;
          setTimeout(_renderScene, 0);
        }
      }
      _renderFrame();
    }
    _renderScene();
  }

  function _finishVideo(progWrap, expBtn, progTime) {
    if (typeof setExportActive === 'function') setExportActive(false);
    _updateProgress(100, lang==='ar'?'\u062A\u0645 \u0627\u0644\u062A\u0635\u062F\u064A\u0631 \u0628\u0646\u062C\u0627\u062D!':'Export complete!', document.getElementById('vidProgressBar'), document.getElementById('vidProgressTxt'), document.getElementById('vidProgressPct'), progTime);
    var cancelBtn = document.getElementById('vidCancelBtn');
    if (cancelBtn) cancelBtn.style.display = 'none';
    _recording = false;
    _exportCancelled = false;
    if (progWrap) setTimeout(function(){ progWrap.style.display = 'none'; }, 2000);
    if (expBtn) expBtn.disabled = false;
    closeVideoDialog();
  }
  function loadVideoWatermark(input) {
    _loadWatermark(input, function(img) { state.vidWatermarkImg = img; });
  }

  // ==================== CROP TOOL ====================
  function _initCropRect() {
    var margin = 0.15;
    crop.rect = {
      x: Math.round(W * margin), y: Math.round(H * margin),
      w: Math.round(W * (1 - 2 * margin)), h: Math.round(H * (1 - 2 * margin))
    };
  }
  function _getHandles(r) {
    var mx = r.x + r.w / 2, my = r.y + r.h / 2;
    return [
      { n: 'tl', x: r.x, y: r.y }, { n: 'tc', x: mx, y: r.y }, { n: 'tr', x: r.x + r.w, y: r.y },
      { n: 'ml', x: r.x, y: my }, { n: 'mr', x: r.x + r.w, y: my },
      { n: 'bl', x: r.x, y: r.y + r.h }, { n: 'bc', x: mx, y: r.y + r.h }, { n: 'br', x: r.x + r.w, y: r.y + r.h }
    ];
  }
  function _hitTestHandle(mx, my, r) {
    var handles = _getHandles(r);
    for (var i = 0; i < handles.length; i++) {
      if (Math.abs(mx - handles[i].x) <= HANDLE_SZ && Math.abs(my - handles[i].y) <= HANDLE_SZ) return handles[i].n;
    }
    if (mx > r.x + HANDLE_SZ && mx < r.x + r.w - HANDLE_SZ && my > r.y + HANDLE_SZ && my < r.y + r.h - HANDLE_SZ) return 'move';
    return null;
  }
  function _applyCropDrag(dx, dy) {
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
  function _getCursorForMode(mode) {
    if (mode === 'move') return 'grab';
    if (mode === 'tl' || mode === 'br') return 'nwse-resize';
    if (mode === 'tr' || mode === 'bl') return 'nesw-resize';
    if (mode === 'tc' || mode === 'bc') return 'ns-resize';
    if (mode === 'ml' || mode === 'mr') return 'ew-resize';
    return 'default';
  }
  function _drawCropOverlay(canvas) {
    var ectx = canvas.getContext('2d');
    var r = crop.rect; if (!r) return;
    ectx.save(); ectx.setTransform(1, 0, 0, 1, 0, 0);
    ectx.fillStyle = 'rgba(0,0,0,0.5)';
    ectx.fillRect(0, 0, canvas.width, r.y);
    ectx.fillRect(0, r.y + r.h, canvas.width, canvas.height - r.y - r.h);
    ectx.fillRect(0, r.y, r.x, r.h);
    ectx.fillRect(r.x + r.w, r.y, canvas.width - r.x - r.w, r.h);
    ectx.strokeStyle = '#2f81f7'; ectx.lineWidth = 2; ectx.setLineDash([]);
    ectx.strokeRect(r.x, r.y, r.w, r.h);
    ectx.strokeStyle = 'rgba(255,255,255,0.2)'; ectx.lineWidth = 1;
    for (var i = 1; i <= 2; i++) {
      var gx = r.x + r.w * i / 3, gy = r.y + r.h * i / 3;
      ectx.beginPath(); ectx.moveTo(gx, r.y); ectx.lineTo(gx, r.y + r.h); ectx.stroke();
      ectx.beginPath(); ectx.moveTo(r.x, gy); ectx.lineTo(r.x + r.w, gy); ectx.stroke();
    }
    var handles = _getHandles(r);
    ectx.fillStyle = '#fff'; ectx.strokeStyle = '#2f81f7'; ectx.lineWidth = 2;
    for (var j = 0; j < handles.length; j++) {
      ectx.fillRect(handles[j].x - 5, handles[j].y - 5, 10, 10);
      ectx.strokeRect(handles[j].x - 5, handles[j].y - 5, 10, 10);
    }
    ectx.fillStyle = 'rgba(47,129,247,0.9)'; ectx.font = 'bold 11px Inter,sans-serif';
    var label = r.w + ' \u00D7 ' + r.h;
    var lw = ectx.measureText(label).width + 8;
    ectx.fillRect(r.x + r.w / 2 - lw / 2, r.y - 20, lw, 16);
    ectx.fillStyle = '#fff'; ectx.textAlign = 'center'; ectx.textBaseline = 'middle';
    ectx.fillText(label, r.x + r.w / 2, r.y - 12);
    ectx.restore();
  }
  function _enableCropTool() {
    var cvEl = document.getElementById('expCv');
    if (!cvEl) return;
    crop.active = true;
    _initCropRect();
    _updateImagePreview();
    _drawCropOverlay(cvEl);
    _showCropConfirm();
    cvEl.onmousedown = function(e) { _cropMouseDown(e, cvEl); };
    cvEl.onmousemove = function(e) { _cropMouseMove(e, cvEl); };
    cvEl.onmouseup = function() { _cropMouseUp(); };
    cvEl.ontouchstart = function(e) { e.preventDefault(); var tc=e.changedTouches[0],r=cvEl.getBoundingClientRect();_cropMouseDown({offsetX:(tc.clientX-r.left)*cvEl.width/cvEl.clientWidth,offsetY:(tc.clientY-r.top)*cvEl.height/cvEl.clientHeight},cvEl); };
    cvEl.ontouchmove = function(e) { e.preventDefault(); var tc=e.changedTouches[0],r=cvEl.getBoundingClientRect();_cropMouseMove({offsetX:(tc.clientX-r.left)*cvEl.width/cvEl.clientWidth,offsetY:(tc.clientY-r.top)*cvEl.height/cvEl.clientHeight},cvEl); };
    cvEl.ontouchend = function(e) { e.preventDefault(); _cropMouseUp(); };
  }
  function _cropMouseDown(e, cvEl) {
    var scX = cvEl.width / cvEl.clientWidth, scY = cvEl.height / cvEl.clientHeight;
    var mx = e.offsetX * scX, my = e.offsetY * scY;
    var hit = _hitTestHandle(mx, my, crop.rect);
    if (!hit) return;
    crop.mode = hit;
    crop.startMx = mx; crop.startMy = my;
    crop.startRect = { x: crop.rect.x, y: crop.rect.y, w: crop.rect.w, h: crop.rect.h };
    cvEl.style.cursor = hit === 'move' ? 'grabbing' : _getCursorForMode(hit);
  }
  function _cropMouseMove(e, cvEl) {
    var scX = cvEl.width / cvEl.clientWidth, scY = cvEl.height / cvEl.clientHeight;
    var mx = e.offsetX * scX, my = e.offsetY * scY;
    if (crop.mode) {
      _applyCropDrag(mx - crop.startMx, my - crop.startMy);
      _updateImagePreview();
      _drawCropOverlay(cvEl);
    } else {
      var hit = _hitTestHandle(mx, my, crop.rect);
      cvEl.style.cursor = hit ? _getCursorForMode(hit) : 'default';
    }
  }
  function _cropMouseUp() {
    if (crop.mode) { crop.mode = null; crop.startRect = null; }
  }
  function _confirmCrop() {
    var cvEl = document.getElementById('expCv');
    if (cvEl) {
      cvEl.onmousedown = null; cvEl.onmousemove = null; cvEl.onmouseup = null;
      cvEl.ontouchstart = null; cvEl.ontouchmove = null; cvEl.ontouchend = null;
      cvEl.style.cursor = 'default';
    }
    crop.active = false;
    _hideCropConfirm();
    _updateImagePreview();
  }
  function cancelCrop() {
    crop.rect = null;
    var cvEl = document.getElementById('expCv');
    if (cvEl) {
      cvEl.onmousedown = null; cvEl.onmousemove = null; cvEl.onmouseup = null;
      cvEl.ontouchstart = null; cvEl.ontouchmove = null; cvEl.ontouchend = null;
      cvEl.style.cursor = 'default';
    }
    _hideCropConfirm();
    var sel = document.getElementById('expArea');
    if (sel) sel.value = 'all';
    _updateImagePreview();
  }
  function _showCropConfirm() { var bar = document.getElementById('expCropBar'); if (bar) bar.style.display = 'flex'; }
  function _hideCropConfirm() { var bar = document.getElementById('expCropBar'); if (bar) bar.style.display = 'none'; }
  function _resetCropTool() {
    crop.active = false; crop.mode = null; crop.rect = null;
    var cvEl = document.getElementById('expCv');
    if (cvEl) {
      cvEl.style.cursor = 'default';
      cvEl.onmousedown = null; cvEl.onmousemove = null; cvEl.onmouseup = null;
      cvEl.ontouchstart = null; cvEl.ontouchmove = null; cvEl.ontouchend = null;
    }
    _hideCropConfirm();
  }

  // ==================== PUBLIC API ====================
  function setFileName(name) { state.lastFileName = name || 'coachboard'; }
  function setSavePref(pref) { state.savePref = pref; try { localStorage.setItem('cb_save_pref', pref); } catch(e) {} }
  function cancelExport() { _exportCancelled = true; if (_recorder && _recorder.state === 'recording') _recorder.stop(); if (typeof setExportActive === 'function') setExportActive(false); _recorder = null; }

  return {
    state: state, isFileAPI: isFileAPI,
    showImageDialog: showImageDialog, closeImageDialog: closeImageDialog,
    updateImagePreview: _updateImagePreview, doImageExport: doImageExport,
    loadImageWatermark: loadImageWatermark,
    onAreaChange: onAreaChange, confirmCrop: _confirmCrop, cancelCrop: cancelCrop,
    showVideoDialog: showVideoDialog, closeVideoDialog: closeVideoDialog,
    doVideoExport: doVideoExport, loadVideoWatermark: loadVideoWatermark,
    setFileName: setFileName, setSavePref: setSavePref, cancelExport: cancelExport,
    onFormatChange: _onFormatChange
  };
})();

// Bridge functions
function exportImg()        { ExportManager.showImageDialog(); }
function closeExpImg()      { ExportManager.closeImageDialog(); }
function doExportImg()      { ExportManager.doImageExport(); }
function showExpVid()       { ExportManager.showVideoDialog(); }
function hideExpVid()       { ExportManager.closeVideoDialog(); }
function doExportVid()      { ExportManager.doVideoExport(); }
