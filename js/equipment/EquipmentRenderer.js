var EquipmentRenderer = {
  _modules: {},

  register: function(type, module) {
    this._modules[type] = module;
  },

  draw: function(ctx, el) {
    var m = this._modules[el.type];
    if (m && m.draw) { m.draw(ctx, el); return true; }
    return false;
  },

  bounds: function(el) {
    var m = this._modules[el.type];
    if (m && m.bounds) return m.bounds(el);
    return null;
  },

  defaults: function(type) {
    var m = this._modules[type];
    if (m && m.defaults) return m.defaults();
    return {};
  },

  views: function(type) {
    var m = this._modules[type];
    if (m && m.views) return m.views();
    return ['top'];
  },

  variants: function(type) {
    var m = this._modules[type];
    if (m && m.variants) return m.variants();
    return ['standard'];
  }
};

var EqUtils = {
  hexToRgba: function(hex, alpha) {
    var r = parseInt(hex.slice(1,3), 16);
    var g = parseInt(hex.slice(3,5), 16);
    var b = parseInt(hex.slice(5,7), 16);
    return 'rgba('+r+','+g+','+b+','+alpha+')';
  },

  lightColor: function(hex, amt) {
    var r = parseInt(hex.slice(1,3),16);
    var g = parseInt(hex.slice(3,5),16);
    var b = parseInt(hex.slice(5,7),16);
    r = Math.min(255, Math.max(0, r + amt));
    g = Math.min(255, Math.max(0, g + amt));
    b = Math.min(255, Math.max(0, b + amt));
    return '#' + (r<16?'0':'')+r.toString(16) + (g<16?'0':'')+g.toString(16) + (b<16?'0':'')+b.toString(16);
  },

  drawShadow: function(ctx, x, y, w, h, alpha) {
    alpha = alpha || 0.2;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,'+alpha+')';
    ctx.beginPath();
    ctx.ellipse(x, y + h * 0.5, w * 0.5, h * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  drawPostGradient: function(ctx, x, y, w, h, color) {
    var grad = ctx.createLinearGradient(x - w/2, y, x + w/2, y);
    grad.addColorStop(0, this.lightColor(color, 20));
    grad.addColorStop(0.25, color);
    grad.addColorStop(0.75, color);
    grad.addColorStop(1, this.lightColor(color, -20));
    ctx.fillStyle = grad;
    ctx.fillRect(x - w/2, y - h/2, w, h);
  },

  drawBarGradient: function(ctx, x, y, w, h, color) {
    var grad = ctx.createLinearGradient(x, y - h/2, x, y + h/2);
    grad.addColorStop(0, this.lightColor(color, 15));
    grad.addColorStop(0.5, color);
    grad.addColorStop(1, this.lightColor(color, -15));
    ctx.fillStyle = grad;
    ctx.fillRect(x - w/2, y - h/2, w, h);
  }
};
