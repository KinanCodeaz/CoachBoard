/**
 * CoachBoard Pro - Export Renderer v9.4
 * Independent export canvas. Wraps Camera to return identity without triggering reqRender.
 */
var ExportRenderer = (function() {

  var RESOLUTIONS = {
    '720p':    { label: 'HD',           w: 1280,  h: 720   },
    '1080p':   { label: 'Full HD',      w: 1920,  h: 1080  },
    '1440p':   { label: 'QHD',          w: 2560,  h: 1440  },
    '2160p':   { label: '4K UHD',       w: 3840,  h: 2160  },
    '4096p':   { label: 'Cinema 4K',    w: 4096,  h: 2160  },
    '4320p':   { label: '8K UHD',       w: 7680,  h: 4320  },
    'print':   { label: 'Print 600DPI', w: 7016,  h: 4961  },
    'custom':  { label: 'Custom',       w: 1920,  h: 1080  }
  };

  var QUALITY_PROFILES = {
    'fast':     { label: '\u0633\u0631\u064A\u0639',     superSample: 1, smoothing: 'medium' },
    'balanced': { label: '\u0645\u062A\u0648\u0627\u0632\u0646', superSample: 2, smoothing: 'medium' },
    'high':     { label: '\u0639\u0627\u0644\u064A\u0629',  superSample: 2, smoothing: 'high'   },
    'ultra':    { label: '\u0641\u0627\u0626\u0642\u0629',  superSample: 4, smoothing: 'high'   },
    'maximum':  { label: '\u0642\u0635\u0648\u0649',        superSample: 4, smoothing: 'high'   }
  };

  function renderToCanvas(targetCanvas, targetCtx, opts) {
    opts = opts || {};
    var origCx = window.cx;
    var origCV = window.cv;
    var origCC = window.cc;
    var origW = window.W;
    var origH = window.H;
    var origDpr = window.dpr;

    // Save Camera state
    var origGetZoom = Camera.getZoom;
    var origGetOffset = Camera._getOffset;
    var origSetZoom = Camera.setZoom;
    var origSetPan = Camera.setPan;
    var origApply = Camera.apply;

    try {
      var exportW = opts.sourceW || origW;
      var exportH = opts.sourceH || origH;

      // Set canvas dimensions
      targetCanvas.width = exportW;
      targetCanvas.height = exportH;
      targetCtx.setTransform(1, 0, 0, 1, 0, 0);

      // Override globals
      window.cx = targetCtx;
      window.cv = targetCanvas;
      window.cc = targetCanvas;
      window.W = exportW;
      window.H = exportH;
      window.dpr = 1;

      // Disable in-progress drawing
      window.drawingArr = false;
      window.drawingFree = false;
      window.multiArrPoints = null;
      window.freePoints = [];
      window.tool = 'select';

      // Set export flag
      if (window.Engine) Engine._exportActive = true;

      // Wrap Camera to return identity WITHOUT calling apply/reqRender
      Camera.getZoom = function() { return 1; };
      Camera._getOffset = function() { return {x: 0, y: 0}; };
      Camera.setZoom = function() {};
      Camera.setPan = function() {};
      Camera.apply = function() {};

      // Call Engine.render()
      if (typeof Engine !== 'undefined' && Engine.render) {
        Engine.render();
      }
    } catch(e) {
      console.error('[ExportRenderer] renderToCanvas error:', e);
    } finally {
      // Restore Camera
      Camera.getZoom = origGetZoom;
      Camera._getOffset = origGetOffset;
      Camera.setZoom = origSetZoom;
      Camera.setPan = origSetPan;
      Camera.apply = origApply;

      // Restore globals
      window.cx = origCx;
      window.cv = origCV;
      window.cc = origCC;
      window.W = origW;
      window.H = origH;
      window.dpr = origDpr;
      if (window.Engine) Engine._exportActive = false;
    }
  }

  function renderSuperSampled(targetW, targetH, elements, opts) {
    opts = opts || {};
    var profile = QUALITY_PROFILES[opts.quality || 'high'];
    var superSample = profile ? profile.superSample : 1;
    var smoothing = profile ? profile.smoothing : 'high';

    var intW = targetW * superSample;
    var intH = targetH * superSample;

    var intCanvas = document.createElement('canvas');
    intCanvas.width = intW;
    intCanvas.height = intH;
    var intCtx = intCanvas.getContext('2d');
    intCtx.imageSmoothingEnabled = true;
    intCtx.imageSmoothingQuality = smoothing;

    var renderOpts = {
      sourceW: opts.sourceW || (typeof W !== 'undefined' ? W : 1600),
      sourceH: opts.sourceH || (typeof H !== 'undefined' ? H : 900),
      theme: opts.theme || (typeof theme !== 'undefined' ? theme : 'dark'),
      sportType: opts.sportType || (typeof sport !== 'undefined' ? sport : 'football'),
      pitchVertical: opts.pitchVertical,
      gridOn: opts.gridOn || false,
      playerLinks: opts.playerLinks,
      trails: opts.trails
    };
    renderToCanvas(intCanvas, intCtx, renderOpts);

    if (superSample === 1) return intCanvas;

    var outCanvas = document.createElement('canvas');
    outCanvas.width = targetW;
    outCanvas.height = targetH;
    var outCtx = outCanvas.getContext('2d');
    outCtx.imageSmoothingEnabled = true;
    outCtx.imageSmoothingQuality = 'high';
    outCtx.drawImage(intCanvas, 0, 0, intW, intH, 0, 0, targetW, targetH);

    return outCanvas;
  }

  function renderPreview(canvas, elements, opts) {
    opts = opts || {};
    var ctx = canvas.getContext('2d');
    var renderOpts = {
      sourceW: opts.sourceW || (typeof W !== 'undefined' ? W : 1600),
      sourceH: opts.sourceH || (typeof H !== 'undefined' ? H : 900),
      theme: opts.theme || (typeof theme !== 'undefined' ? theme : 'dark'),
      sportType: opts.sportType || (typeof sport !== 'undefined' ? sport : 'football'),
      pitchVertical: opts.pitchVertical,
      gridOn: false,
      playerLinks: opts.playerLinks,
      trails: opts.trails
    };
    renderToCanvas(canvas, ctx, renderOpts);
  }

  function renderOverlays(ctx, tW, tH, opts) {
    if (!opts) return;
    if (opts.text) {
      ctx.save();
      var fs = opts.textSize || 18;
      ctx.font = 'bold ' + fs + 'px Cairo,Inter,sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = opts.textPos === 'top' ? 'top' : opts.textPos === 'center' ? 'middle' : 'bottom';
      ctx.fillStyle = opts.textColor || '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      var ty = opts.textPos === 'top' ? fs + 10 : opts.textPos === 'center' ? tH / 2 + fs / 3 : tH - 14;
      ctx.fillText(opts.text, tW / 2, ty);
      ctx.restore();
    }
    if (opts.logoImg && opts.logoImg.complete && opts.logoImg.naturalWidth > 0) {
      ctx.save();
      ctx.globalAlpha = (opts.logoOpacity || 15) / 100;
      var logoSz = Math.min(tW, tH) * ((opts.logoSize || 25) / 100);
      var ratio = opts.logoImg.naturalWidth / opts.logoImg.naturalHeight;
      var lW, lH;
      if (ratio > 1) { lW = logoSz; lH = logoSz / ratio; } else { lH = logoSz; lW = logoSz * ratio; }
      var pos = opts.logoPos || 'bottom-right';
      var m = 12;
      var lx, ly;
      if (pos === 'top-left') { lx = m; ly = m; }
      else if (pos === 'top-right') { lx = tW - lW - m; ly = m; }
      else if (pos === 'bottom-left') { lx = m; ly = tH - lH - m; }
      else if (pos === 'center') { lx = (tW - lW) / 2; ly = (tH - lH) / 2; }
      else { lx = tW - lW - m; ly = tH - lH - m; }
      ctx.drawImage(opts.logoImg, lx, ly, lW, lH);
      ctx.restore();
    }
  }

  return {
    RESOLUTIONS: RESOLUTIONS,
    QUALITY_PROFILES: QUALITY_PROFILES,
    renderToCanvas: renderToCanvas,
    renderSuperSampled: renderSuperSampled,
    renderPreview: renderPreview,
    renderOverlays: renderOverlays
  };
})();
