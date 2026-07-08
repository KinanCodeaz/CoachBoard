'use strict';
// CoachBoard Pro - Template UI
// Template browser, save/load custom templates

var TemplateUI = {
  _panel: null,
  _listContainer: null,
  _currentCategory: null,
  _currentSport: null,

  init: function() {
    this._createPanel();
    return this;
  },

  _createPanel: function() {
    this._panel = document.createElement('div');
    this._panel.id = 'template-panel';
    this._panel.style.cssText = 'position:fixed;top:60px;left:16px;width:320px;max-height:calc(100vh - 120px);background:var(--bg-secondary);border:1px solid var(--border);border-radius:12px;overflow:hidden;z-index:200;display:none;box-shadow:0 8px 32px rgba(0,0,0,0.3);';

    // Header
    var header = document.createElement('div');
    header.style.cssText = 'padding:16px;border-bottom:1px solid var(--border);background:linear-gradient(135deg,var(--accent),var(--accent-hover));color:white;';
    header.innerHTML = '<div style="font-size:16px;font-weight:700;">📋 Template Library</div>';
    this._panel.appendChild(header);

    // Filters
    var filters = document.createElement('div');
    filters.style.cssText = 'padding:12px;border-bottom:1px solid var(--border);display:flex;gap:8px;flex-wrap:wrap;';

    // Sport filter
    var sportSelect = document.createElement('select');
    sportSelect.style.cssText = 'padding:6px 10px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-size:12px;flex:1;';
    sportSelect.innerHTML = '<option value="">All Sports</option>' +
      '<option value="futsal">⚽ Futsal</option>' +
      '<option value="basketball">🏀 Basketball</option>' +
      '<option value="soccer">⚽ Soccer</option>' +
      '<option value="volleyball">🏐 Volleyball</option>' +
      '<option value="handball">🤾 Handball</option>';
    var self = this;
    sportSelect.onchange = function() {
      self._currentSport = this.value || null;
      self._refreshList();
    };
    filters.appendChild(sportSelect);

    // Category filter
    var catSelect = document.createElement('select');
    catSelect.style.cssText = 'padding:6px 10px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-size:12px;flex:1;';
    catSelect.innerHTML = '<option value="">All Types</option>' +
      '<option value="formation">📊 Formations</option>' +
      '<option value="drill">🏃 Drills</option>' +
      '<option value="setpiece">⚽ Set Pieces</option>' +
      '<option value="custom">⭐ Custom</option>';
    catSelect.onchange = function() {
      self._currentCategory = this.value || null;
      self._refreshList();
    };
    filters.appendChild(catSelect);

    this._panel.appendChild(filters);

    // Template list
    this._listContainer = document.createElement('div');
    this._listContainer.style.cssText = 'overflow-y:auto;max-height:400px;padding:8px;';
    this._panel.appendChild(this._listContainer);

    // Save Custom button
    var saveBtn = document.createElement('button');
    saveBtn.textContent = '💾 Save Current as Template';
    saveBtn.style.cssText = 'width:100%;padding:12px;border:none;background:linear-gradient(135deg,#22c55e,#16a34a);color:white;font-weight:600;cursor:pointer;';
    saveBtn.onclick = function() {
      TemplateUI._saveCurrentAsTemplate();
    };
    this._panel.appendChild(saveBtn);

    document.body.appendChild(this._panel);
    this._refreshList();
  },

  _refreshList: function() {
    this._listContainer.innerHTML = '';

    var templates = TemplateSystem.getTemplates(this._currentCategory, this._currentSport);

    for (var i = 0; i < templates.length; i++) {
      var t = templates[i];
      var item = this._createTemplateItem(t);
      this._listContainer.appendChild(item);
    }

    if (templates.length === 0) {
      var empty = document.createElement('div');
      empty.style.cssText = 'padding:24px;text-align:center;color:var(--text-secondary);';
      empty.textContent = 'No templates found';
      this._listContainer.appendChild(empty);
    }
  },

  _createTemplateItem: function(template) {
    var item = document.createElement('div');
    item.style.cssText = 'padding:12px;margin:4px 0;border-radius:8px;background:var(--bg-tertiary);cursor:pointer;transition:all 0.15s;display:flex;align-items:center;gap:12px;';
    item.onmouseenter = function() { item.style.transform = 'translateX(4px)'; item.style.background = 'var(--accent-dim)'; };
    item.onmouseleave = function() { item.style.transform = 'none'; item.style.background = 'var(--bg-tertiary)'; };

    // Icon
    var icon = document.createElement('div');
    icon.style.cssText = 'font-size:24px;width:40px;text-align:center;';
    icon.textContent = template.icon || '📋';
    item.appendChild(icon);

    // Info
    var info = document.createElement('div');
    info.style.cssText = 'flex:1;';

    var name = document.createElement('div');
    name.style.cssText = 'font-weight:600;font-size:14px;';
    name.textContent = template.name.en || template.name;
    info.appendChild(name);

    var desc = document.createElement('div');
    desc.style.cssText = 'font-size:11px;color:var(--text-secondary);margin-top:2px;';
    desc.textContent = template.description.en || template.description || '';
    info.appendChild(desc);

    var tags = document.createElement('div');
    tags.style.cssText = 'margin-top:4px;display:flex;gap:4px;';
    if (template.sport) {
      var sportTag = document.createElement('span');
      sportTag.style.cssText = 'font-size:10px;padding:2px 6px;border-radius:4px;background:var(--accent-dim);color:var(--accent);';
      sportTag.textContent = template.sport;
      tags.appendChild(sportTag);
    }
    if (template.category) {
      var catTag = document.createElement('span');
      catTag.style.cssText = 'font-size:10px;padding:2px 6px;border-radius:4px;background:var(--bg-secondary);color:var(--text-secondary);';
      catTag.textContent = template.category;
      tags.appendChild(catTag);
    }
    info.appendChild(tags);

    item.appendChild(info);

    // Apply button
    var applyBtn = document.createElement('button');
    applyBtn.textContent = 'Apply';
    applyBtn.style.cssText = 'padding:6px 12px;border:none;border-radius:6px;background:var(--accent);color:white;font-size:12px;cursor:pointer;';
    applyBtn.onclick = function(e) {
      e.stopPropagation();
      TemplateSystem.applyTemplate(template.id);
      TemplateUI.hide();
      if (typeof EventBus !== 'undefined') {
        EventBus.emit('template:applied', { template: template });
      }
    };
    item.appendChild(applyBtn);

    // Click to apply
    item.onclick = function() {
      TemplateSystem.applyTemplate(template.id);
      TemplateUI.hide();
    };

    return item;
  },

  _saveCurrentAsTemplate: function() {
    if (typeof els === 'undefined' || els.length === 0) {
      alert('No elements to save as template');
      return;
    }

    var name = prompt('Template name:');
    if (!name) return;

    var description = prompt('Description (optional):') || '';

    TemplateSystem.saveCustomTemplate(name, description, els);
    this._refreshList();

    if (typeof EventBus !== 'undefined') {
      EventBus.emit('template:saved', { name: name });
    }
  },

  // ============ SHOW/HIDE ============
  toggle: function() {
    if (this._panel.style.display === 'none') {
      this.show();
    } else {
      this.hide();
    }
  },

  show: function() {
    this._panel.style.display = 'block';
    this._refreshList();
  },

  hide: function() {
    this._panel.style.display = 'none';
  },

  isVisible: function() {
    return this._panel && this._panel.style.display !== 'none';
  }
};
