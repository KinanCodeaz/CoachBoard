'use strict';
// CoachBoard Pro - ThemeManager
// Canvas-only theming: UI stays dark, canvas background changes

var ThemeManager = {
  _current: 'dark',
  _canvasTheme: 'dark',
  _themes: {},
  _canvasThemes: {},
  _storageKey: 'cb-theme',
  _canvasStorageKey: 'cb-canvas-theme',

  init: function() {
    this._registerBuiltinThemes();
    this._registerCanvasThemes();
    var saved = this._loadSaved();
    if (saved && this._themes[saved]) {
      this._current = saved;
    }
    var savedCanvas = this._loadCanvasSaved();
    if (savedCanvas && this._canvasThemes[savedCanvas]) {
      this._canvasTheme = savedCanvas;
    }
    // Apply saved UI theme
    this.apply(this._current);
    // Apply canvas theme
    this.applyCanvasTheme(this._canvasTheme);
  },

  _registerBuiltinThemes: function() {
    this.register('dark', {
      name: { en: 'Dark', ar: 'داكن' },
      vars: {
        '--bg': '#0d1117', '--bg2': '#161b22', '--bg3': '#1c2333',
        '--surface': '#21262d', '--surface2': '#282e38',
        '--border': '#30363d', '--border2': '#484f58',
        '--text': '#e6edf3', '--text2': '#8b949e', '--text3': '#6e7681',
        '--accent': '#2f81f7', '--accent2': '#1f6feb',
        '--accent-bg': 'rgba(47,129,247,0.1)', '--accent-border': 'rgba(47,129,247,0.4)',
        '--success': '#3fb950', '--success-bg': 'rgba(63,185,80,0.12)',
        '--danger': '#f85149', '--danger-bg': 'rgba(248,81,73,0.12)',
        '--warning': '#d29922', '--warning-bg': 'rgba(210,153,34,0.12)',
        '--tmA': '#4a90d9', '--tmA-bg': 'rgba(74,144,217,0.15)',
        '--tmB': '#f85149', '--tmB-bg': 'rgba(248,81,73,0.15)',
        '--tmAgk': '#3fb950', '--tmBgk': '#f778ba',
        '--shadow': '0 8px 24px rgba(0,0,0,0.4)', '--shadow-sm': '0 1px 3px rgba(0,0,0,0.3)',
        '--bg-secondary': '#161b22', '--bg-tertiary': '#1c2333',
        '--text-secondary': '#8b949e', '--accent-dim': 'rgba(47,129,247,0.15)', '--accent-hover': '#1f6feb'
      }
    });
    this.register('light', {
      name: { en: 'Light', ar: 'فاتح' },
      vars: {
        '--bg': '#f6f8fa', '--bg2': '#ffffff', '--bg3': '#f0f3f6',
        '--surface': '#ffffff', '--surface2': '#f6f8fa',
        '--border': '#d0d7de', '--border2': '#afb8c1',
        '--text': '#1f2328', '--text2': '#656d76', '--text3': '#8b949e',
        '--accent': '#0969da', '--accent2': '#0550ae',
        '--accent-bg': 'rgba(9,105,218,0.08)', '--accent-border': 'rgba(9,105,218,0.3)',
        '--success': '#1a7f37', '--success-bg': 'rgba(26,127,55,0.1)',
        '--danger': '#cf222e', '--danger-bg': 'rgba(207,34,46,0.1)',
        '--warning': '#9a6700', '--warning-bg': 'rgba(154,103,0,0.1)',
        '--tmA': '#0969da', '--tmA-bg': 'rgba(9,105,218,0.12)',
        '--tmB': '#cf222e', '--tmB-bg': 'rgba(207,34,46,0.12)',
        '--tmAgk': '#1a7f37', '--tmBgk': '#bf3989',
        '--shadow': '0 8px 24px rgba(140,149,159,0.2)', '--shadow-sm': '0 1px 3px rgba(140,149,159,0.15)',
        '--bg-secondary': '#ffffff', '--bg-tertiary': '#f0f3f6',
        '--text-secondary': '#656d76', '--accent-dim': 'rgba(9,105,218,0.1)', '--accent-hover': '#0550ae'
      }
    });
    this.register('ocean', {
      name: { en: 'Ocean', ar: 'محيط' },
      vars: {
        '--bg': '#0a1628', '--bg2': '#0f1f35', '--bg3': '#142842',
        '--surface': '#1a3050', '--surface2': '#1f3a5a',
        '--border': '#2a4a6a', '--border2': '#3a5a7a',
        '--text': '#e0f0ff', '--text2': '#80b0d0', '--text3': '#5090b0',
        '--accent': '#00aaff', '--accent2': '#0088dd',
        '--accent-bg': 'rgba(0,170,255,0.12)', '--accent-border': 'rgba(0,170,255,0.4)',
        '--success': '#00cc88', '--success-bg': 'rgba(0,204,136,0.12)',
        '--danger': '#ff6666', '--danger-bg': 'rgba(255,102,102,0.12)',
        '--warning': '#ffaa00', '--warning-bg': 'rgba(255,170,0,0.12)',
        '--tmA': '#00aaff', '--tmA-bg': 'rgba(0,170,255,0.15)',
        '--tmB': '#ff6666', '--tmB-bg': 'rgba(255,102,102,0.15)',
        '--tmAgk': '#00cc88', '--tmBgk': '#ff99cc',
        '--shadow': '0 8px 24px rgba(0,0,0,0.5)', '--shadow-sm': '0 1px 3px rgba(0,0,0,0.4)',
        '--bg-secondary': '#0f1f35', '--bg-tertiary': '#142842',
        '--text-secondary': '#80b0d0', '--accent-dim': 'rgba(0,170,255,0.15)', '--accent-hover': '#0088dd'
      }
    });
    this.register('pink', {
      name: { en: 'Pink', ar: 'وردي' },
      vars: {
        '--bg': '#1a0a14', '--bg2': '#251018', '--bg3': '#2e1520',
        '--surface': '#3a1a28', '--surface2': '#442030',
        '--border': '#5a2a40', '--border2': '#6a3a50',
        '--text': '#ffe0f0', '--text2': '#d0a0c0', '--text3': '#b080a0',
        '--accent': '#ff66aa', '--accent2': '#ee4488',
        '--accent-bg': 'rgba(255,102,170,0.12)', '--accent-border': 'rgba(255,102,170,0.4)',
        '--success': '#66ddaa', '--success-bg': 'rgba(102,221,170,0.12)',
        '--danger': '#ff6688', '--danger-bg': 'rgba(255,102,136,0.12)',
        '--warning': '#ffaa66', '--warning-bg': 'rgba(255,170,102,0.12)',
        '--tmA': '#ff66aa', '--tmA-bg': 'rgba(255,102,170,0.15)',
        '--tmB': '#ff6688', '--tmB-bg': 'rgba(255,102,136,0.15)',
        '--tmAgk': '#66ddaa', '--tmBgk': '#ffaa66',
        '--shadow': '0 8px 24px rgba(0,0,0,0.5)', '--shadow-sm': '0 1px 3px rgba(0,0,0,0.4)',
        '--bg-secondary': '#251018', '--bg-tertiary': '#2e1520',
        '--text-secondary': '#d0a0c0', '--accent-dim': 'rgba(255,102,170,0.15)', '--accent-hover': '#ee4488'
      }
    });
    this.register('purple', {
      name: { en: 'Purple', ar: 'بنفسجي' },
      vars: {
        '--bg': '#140a1a', '--bg2': '#1c1022', '--bg3': '#22152a',
        '--surface': '#2a1a35', '--surface2': '#32203e',
        '--border': '#422a50', '--border2': '#523a60',
        '--text': '#f0e0ff', '--text2': '#c0a0d0', '--text3': '#a080b0',
        '--accent': '#aa66ff', '--accent2': '#8844ee',
        '--accent-bg': 'rgba(170,102,255,0.12)', '--accent-border': 'rgba(170,102,255,0.4)',
        '--success': '#66ddaa', '--success-bg': 'rgba(102,221,170,0.12)',
        '--danger': '#ff6688', '--danger-bg': 'rgba(255,102,136,0.12)',
        '--warning': '#ffaa66', '--warning-bg': 'rgba(255,170,102,0.12)',
        '--tmA': '#aa66ff', '--tmA-bg': 'rgba(170,102,255,0.15)',
        '--tmB': '#ff6688', '--tmB-bg': 'rgba(255,102,136,0.15)',
        '--tmAgk': '#66ddaa', '--tmBgk': '#ffaa66',
        '--shadow': '0 8px 24px rgba(0,0,0,0.5)', '--shadow-sm': '0 1px 3px rgba(0,0,0,0.4)',
        '--bg-secondary': '#1c1022', '--bg-tertiary': '#22152a',
        '--text-secondary': '#c0a0d0', '--accent-dim': 'rgba(170,102,255,0.15)', '--accent-hover': '#8844ee'
      }
    });
    this.register('forest', {
      name: { en: 'Forest', ar: 'غابة' },
      vars: {
        '--bg': '#0a1a0a', '--bg2': '#0f220f', '--bg3': '#142a14',
        '--surface': '#1a351a', '--surface2': '#203e20',
        '--border': '#2a502a', '--border2': '#3a603a',
        '--text': '#e0ffe0', '--text2': '#a0d0a0', '--text3': '#80b080',
        '--accent': '#44cc44', '--accent2': '#33aa33',
        '--accent-bg': 'rgba(68,204,68,0.12)', '--accent-border': 'rgba(68,204,68,0.4)',
        '--success': '#66dd66', '--success-bg': 'rgba(102,221,102,0.12)',
        '--danger': '#ff6666', '--danger-bg': 'rgba(255,102,102,0.12)',
        '--warning': '#ffaa00', '--warning-bg': 'rgba(255,170,0,0.12)',
        '--tmA': '#44cc44', '--tmA-bg': 'rgba(68,204,68,0.15)',
        '--tmB': '#ff6666', '--tmB-bg': 'rgba(255,102,102,0.15)',
        '--tmAgk': '#66dd66', '--tmBgk': '#ffaa66',
        '--shadow': '0 8px 24px rgba(0,0,0,0.5)', '--shadow-sm': '0 1px 3px rgba(0,0,0,0.4)',
        '--bg-secondary': '#0f220f', '--bg-tertiary': '#142a14',
        '--text-secondary': '#a0d0a0', '--accent-dim': 'rgba(68,204,68,0.15)', '--accent-hover': '#33aa33'
      }
    });
  },

  _registerCanvasThemes: function() {
    this.registerCanvas('dark', { name: { en: 'Dark', ar: 'داكن' }, bg: '#0d1117', grid: 'rgba(255,255,255,0.06)' });
    this.registerCanvas('light', { name: { en: 'Light', ar: 'فاتح' }, bg: '#f0f4f0', grid: 'rgba(0,0,0,0.08)' });
    this.registerCanvas('ocean', { name: { en: 'Ocean', ar: 'محيط' }, bg: '#0a1628', grid: 'rgba(100,180,255,0.08)' });
    this.registerCanvas('sunset', { name: { en: 'Sunset', ar: 'غروب' }, bg: '#1a0f0a', grid: 'rgba(255,150,80,0.08)' });
    this.registerCanvas('forest', { name: { en: 'Forest', ar: 'غابة' }, bg: '#0a1a0a', grid: 'rgba(100,200,100,0.08)' });
    this.registerCanvas('pink', { name: { en: 'Pink', ar: 'وردي' }, bg: '#1a0a14', grid: 'rgba(255,120,180,0.08)' });
    this.registerCanvas('purple', { name: { en: 'Purple', ar: 'بنفسجي' }, bg: '#140a1a', grid: 'rgba(180,120,255,0.08)' });
  },

  register: function(id, config) { this._themes[id] = config; },
  registerCanvas: function(id, config) { this._canvasThemes[id] = config; },

  apply: function(themeId) {
    if (!this._themes[themeId]) return false;
    this._current = themeId;
    // Sync global theme variable
    if (typeof theme !== 'undefined') theme = themeId;
    var vars = this._themes[themeId].vars;
    var el = document.documentElement;
    el.setAttribute('data-theme', themeId);
    for (var key in vars) { el.style.setProperty(key, vars[key]); }
    this._save(themeId);
    return true;
  },

  applyCanvasTheme: function(themeId) {
    if (!this._canvasThemes[themeId]) return false;
    this._canvasTheme = themeId;
    var ct = this._canvasThemes[themeId];
    var cc = document.getElementById('cc');
    if (cc) {
      cc.style.background = ct.bg;
      cc.setAttribute('data-canvas-theme', themeId);
    }
    // Update canvas grid color via CSS variable
    document.documentElement.style.setProperty('--canvas-grid', ct.grid);
    this._saveCanvas(themeId);
    return true;
  },

  current: function() { return this._current; },
  canvasCurrent: function() { return this._canvasTheme; },
  get: function(id) { return this._themes[id] || null; },
  getCanvas: function(id) { return this._canvasThemes[id] || null; },

  list: function() {
    var r = [];
    for (var id in this._themes) r.push({ id: id, name: this._themes[id].name });
    return r;
  },

  listCanvas: function() {
    var r = [];
    for (var id in this._canvasThemes) r.push({ id: id, name: this._canvasThemes[id].name });
    return r;
  },

  toggle: function() { return this._current; },

  setCustom: function(id, config) {
    if (!id || !config || !config.vars) return false;
    this.register(id, config); this.apply(id); return true;
  },

  export: function(id) {
    var t = this._themes[id];
    if (!t) return null;
    return JSON.stringify({id: id, name: t.name, vars: t.vars}, null, 2);
  },

  import: function(jsonString) {
    try { var d = JSON.parse(jsonString); if (d.id && d.vars) { this.register(d.id, d); return d.id; } } catch (e) {}
    return null;
  },

  getVar: function(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); },

  _save: function(id) { try { localStorage.setItem(this._storageKey, id); } catch (e) {} },
  _saveCanvas: function(id) { try { localStorage.setItem(this._canvasStorageKey, id); } catch (e) {} },
  _loadSaved: function() { try { return localStorage.getItem(this._storageKey); } catch (e) { return null; } },
  _loadCanvasSaved: function() { try { return localStorage.getItem(this._canvasStorageKey); } catch (e) { return null; } }
};
