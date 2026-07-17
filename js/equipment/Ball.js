var Ball = {
  _img: null,
  _loaded: false,
  _loadStarted: false,

  _init: function() {
    if (this._loadStarted) return;
    this._loadStarted = true;
    var self = this;
    var img = new Image();
    img.onload = function() {
      self._loaded = true;
      self._img = img;
      if (typeof Engine !== 'undefined') Engine.reqRender();
    };
    img.onerror = function() { self._loaded = false; };
    if (location.protocol === 'file:') {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'assets/ballon.svg', true);
        xhr.responseType = 'text';
        xhr.onload = function() {
          if ((xhr.status === 0 || xhr.status === 200) && xhr.responseText) {
            var svgText = xhr.responseText;
            var blob = new Blob([svgText], { type: 'image/svg+xml' });
            var reader = new FileReader();
            reader.onload = function(ev) {
              img.src = ev.target.result;
            };
            reader.onerror = function() { self._loaded = false; };
            reader.readAsDataURL(blob);
          } else {
            self._loaded = false;
          }
        };
        xhr.onerror = function() { self._loaded = false; };
        xhr.send();
      } catch(e) { self._loaded = false; }
    } else {
      img.src = 'assets/ballon.svg';
    }
  },

  defaults: function() { return { variant: 'classic' }; },

  views: function() { return ['top']; },

  variants: function() { return [
    { id: 'classic', label: '\u0643\u0631\u0629 \u0627\u0641\u062A\u0631\u0627\u0636\u064A\u0629' },
    { id: 'realistic', label: '\u0643\u0631\u0629 \u062D\u0642\u064A\u0642\u064A\u0629' }
  ]; },

  draw: function(ctx, el) {
    if (!this._loadStarted) this._init();
    var s = el.size || 10;
    var isRealistic = el.variant === 'realistic';
    if (isRealistic && this._loaded && this._img && this._img.naturalWidth) {
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.beginPath();
      ctx.ellipse(0, s * 0.85, s * 0.7, s * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(this._img, -s, -s, s * 2, s * 2);
    } else {
      var cl = el.color || '#ffffff';
      var r = parseInt(cl.slice(1,3),16) || 255;
      var g = parseInt(cl.slice(3,5),16) || 255;
      var b = parseInt(cl.slice(5,7),16) || 255;
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(0, s * 0.85, s * 0.7, s * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();
      var grad = ctx.createRadialGradient(-s * 0.25, -s * 0.25, s * 0.1, 0, 0, s);
      grad.addColorStop(0, 'rgb(' + Math.min(255,r+40) + ',' + Math.min(255,g+40) + ',' + Math.min(255,b+40) + ')');
      grad.addColorStop(0.6, cl);
      grad.addColorStop(1, 'rgb(' + Math.max(0,r-60) + ',' + Math.max(0,g-60) + ',' + Math.max(0,b-60) + ')');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, s, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      for (var i = 0; i < 5; i++) {
        var a = (i * 72 - 90) * Math.PI / 180, pr = s * 0.32;
        i === 0 ? ctx.moveTo(Math.cos(a) * pr, Math.sin(a) * pr) : ctx.lineTo(Math.cos(a) * pr, Math.sin(a) * pr);
      }
      ctx.closePath();
      ctx.fill();
    }
  },

  bounds: function(el) {
    var s = el.size || 10;
    return {x: -s, y: -s, w: s * 2, h: s * 2};
  }
};

Ball._init();
EquipmentRenderer.register('ball', Ball);
