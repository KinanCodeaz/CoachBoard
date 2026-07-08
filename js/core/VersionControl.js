'use strict';
// CoachBoard Pro - Version Control
// Save versions, compare, restore, auto-save

var VersionControl = {
  _versions: [],
  _maxVersions: 20,
  _autoSaveInterval: null,
  _lastAutoSave: null,

  init: function(maxVersions) {
    this._maxVersions = maxVersions || 20;
    this._loadVersions();
    return this;
  },

  // ============ SAVE VERSION ============
  // Save current state as a version
  saveVersion: function(name, description) {
    var project = null;
    if (typeof DocumentModel !== 'undefined') {
      project = DocumentModel.getProject();
    }

    if (!project) return false;

    var version = {
      id: 'v_' + Date.now(),
      name: name || 'Version ' + (this._versions.length + 1),
      description: description || '',
      timestamp: new Date().toISOString(),
      data: JSON.parse(JSON.stringify(project)),
      elementCount: typeof els !== 'undefined' ? els.length : 0
    };

    this._versions.push(version);

    // Trim old versions
    if (this._versions.length > this._maxVersions) {
      this._versions.shift();
    }

    this._saveVersions();
    this._notify('version:saved', { version: version });
    return version;
  },

  // ============ RESTORE VERSION ============
  // Restore a specific version
  restoreVersion: function(versionId) {
    var version = this.getVersion(versionId);
    if (!version) return false;

    if (!version.data) {
      var saved = localStorage.getItem('cb_version_' + version.id);
      if (saved) { try { version.data = JSON.parse(saved); } catch (e) {} }
    }
    if (!version.data) {
      if (typeof toast === 'function') toast('بيانات النسخة غير متوفرة');
      return false;
    }

    if (!confirm('Restore "' + version.name + '"? Current changes will be lost.')) {
      return false;
    }

    if (typeof DocumentModel !== 'undefined') {
      DocumentModel.setProject(JSON.parse(JSON.stringify(version.data)));
    }

    this._notify('version:restored', { version: version });
    return true;
  },

  // ============ GET VERSIONS ============
  getVersion: function(versionId) {
    for (var i = 0; i < this._versions.length; i++) {
      if (this._versions[i].id === versionId) {
        return this._versions[i];
      }
    }
    return null;
  },

  getVersions: function() {
    return this._versions.slice();
  },

  getVersionCount: function() {
    return this._versions.length;
  },

  // ============ DELETE VERSION ============
  deleteVersion: function(versionId) {
    for (var i = 0; i < this._versions.length; i++) {
      if (this._versions[i].id === versionId) {
        this._versions.splice(i, 1);
        this._saveVersions();
        this._notify('version:deleted', { versionId: versionId });
        return true;
      }
    }
    return false;
  },

  // ============ AUTO-SAVE ============
  // Start auto-saving
  startAutoSave: function(intervalMs) {
    var self = this;
    var interval = intervalMs || 60000; // Default: 1 minute

    this._autoSaveInterval = setInterval(function() {
      self.autoSave();
    }, interval);
  },

  // Stop auto-saving
  stopAutoSave: function() {
    if (this._autoSaveInterval) {
      clearInterval(this._autoSaveInterval);
      this._autoSaveInterval = null;
    }
  },

  // Perform auto-save
  autoSave: function() {
    var project = null;
    if (typeof DocumentModel !== 'undefined') {
      project = DocumentModel.getProject();
    }

    if (!project) return false;

    // Check if anything changed
    var currentJson = JSON.stringify(project);
    if (currentJson === this._lastAutoSave) return false;

    var version = this.saveVersion('Auto-save', 'Auto-saved at ' + new Date().toLocaleTimeString());
    this._lastAutoSave = currentJson;
    return version;
  },

  // ============ COMPARE ============
  // Get diff between two versions
  compareVersions: function(v1Id, v2Id) {
    var v1 = this.getVersion(v1Id);
    var v2 = this.getVersion(v2Id);

    if (!v1 || !v2) return null;

    return {
      v1: { name: v1.name, timestamp: v1.timestamp, elementCount: v1.elementCount },
      v2: { name: v2.name, timestamp: v2.timestamp, elementCount: v2.elementCount },
      elementDiff: v2.elementCount - v1.elementCount,
      timeDiff: new Date(v2.timestamp) - new Date(v1.timestamp)
    };
  },

  // ============ PERSISTENCE ============
  _saveVersions: function() {
    try {
      // Save only metadata (not full data) to save space
      var meta = this._versions.map(function(v) {
        return {
          id: v.id,
          name: v.name,
          description: v.description,
          timestamp: v.timestamp,
          elementCount: v.elementCount
        };
      });
      localStorage.setItem('cb_versions_meta', JSON.stringify(meta));

      // Save full data for recent versions
      for (var i = Math.max(0, this._versions.length - 5); i < this._versions.length; i++) {
        localStorage.setItem('cb_version_' + this._versions[i].id, JSON.stringify(this._versions[i].data));
      }
    } catch (e) {}
  },

  _loadVersions: function() {
    try {
      var meta = localStorage.getItem('cb_versions_meta');
      if (meta) {
        this._versions = JSON.parse(meta);

        // Load full data for recent versions
        for (var i = Math.max(0, this._versions.length - 5); i < this._versions.length; i++) {
          var data = localStorage.getItem('cb_version_' + this._versions[i].id);
          if (data) {
            this._versions[i].data = JSON.parse(data);
          }
        }
      }
    } catch (e) {
      this._versions = [];
    }
  },

  // ============ UI ============
  // Create version history panel
  createUI: function() {
    var panel = document.createElement('div');
    panel.id = 'version-panel';
    panel.style.cssText = 'position:fixed;top:60px;right:16px;width:280px;max-height:400px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:8px;overflow:hidden;z-index:200;display:none;';

    var header = document.createElement('div');
    header.style.cssText = 'padding:12px;border-bottom:1px solid var(--border);font-weight:600;display:flex;justify-content:space-between;align-items:center;';
    header.innerHTML = '<span>Version History</span>';
    panel.appendChild(header);

    var list = document.createElement('div');
    list.id = 'version-list';
    list.style.cssText = 'overflow-y:auto;max-height:300px;padding:8px;';
    panel.appendChild(list);

    var saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save Version';
    saveBtn.style.cssText = 'width:100%;padding:8px;border:none;background:var(--accent);color:white;cursor:pointer;';
    saveBtn.onclick = function() {
      var name = prompt('Version name:');
      if (name) {
        VersionControl.saveVersion(name);
        VersionControl._refreshUI();
      }
    };
    panel.appendChild(saveBtn);

    document.body.appendChild(panel);
    return panel;
  },

  _refreshUI: function() {
    var list = document.getElementById('version-list');
    if (!list) return;

    list.innerHTML = '';
    var versions = this.getVersions().reverse();

    for (var i = 0; i < versions.length; i++) {
      var v = versions[i];
      var item = document.createElement('div');
      item.style.cssText = 'padding:8px;border-bottom:1px solid var(--border);cursor:pointer;';
      item.innerHTML = '<div style="font-weight:500;">' + esc(v.name) + '</div>' +
        '<div style="font-size:11px;color:var(--text-secondary);">' + new Date(v.timestamp).toLocaleString() + '</div>';

      var versionId = v.id;
      item.onclick = function() {
        if (confirm('Restore this version?')) {
          VersionControl.restoreVersion(versionId);
        }
      };

      list.appendChild(item);
    }
  },

  toggleUI: function() {
    var panel = document.getElementById('version-panel');
    if (panel) {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      if (panel.style.display === 'block') {
        this._refreshUI();
      }
    }
  },

  // ============ EVENTS ============
  _notify: function(event, data) {
    if (typeof EventBus !== 'undefined') {
      EventBus.emit(event, data);
    }
  }
};
