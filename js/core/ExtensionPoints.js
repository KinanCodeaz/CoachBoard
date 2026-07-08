'use strict';
// CoachBoard Pro - Extension Points
// before/after hooks for Export, Draw, Save via EventBus

var ExtensionPoints = {
  _hooks: {},

  // Register a hook
  register: function(hookName, callback, priority) {
    if (!this._hooks[hookName]) {
      this._hooks[hookName] = [];
    }
    this._hooks[hookName].push({
      callback: callback,
      priority: priority || 0
    });
    // Sort by priority (higher runs first)
    this._hooks[hookName].sort(function(a, b) {
      return b.priority - a.priority;
    });
    return this;
  },

  // Unregister a hook
  unregister: function(hookName, callback) {
    if (!this._hooks[hookName]) return this;
    this._hooks[hookName] = this._hooks[hookName].filter(function(h) {
      return h.callback !== callback;
    });
    return this;
  },

  // Execute before hooks (can cancel by returning false)
  before: function(hookName, data) {
    var hooks = this._hooks['before:' + hookName] || [];
    var result = data || {};

    for (var i = 0; i < hooks.length; i++) {
      try {
        var hookResult = hooks[i].callback(result);
        if (hookResult === false) {
          // Cancel the operation
          return { cancelled: true, data: result };
        }
        // Merge result if hook returns object
        if (hookResult && typeof hookResult === 'object') {
          for (var key in hookResult) {
            result[key] = hookResult[key];
          }
        }
      } catch (e) {
        console.warn('Extension hook error:', hookName, e);
      }
    }

    return { cancelled: false, data: result };
  },

  // Execute after hooks (notification only, cannot cancel)
  after: function(hookName, data) {
    var hooks = this._hooks['after:' + hookName] || [];
    var result = data || {};

    for (var i = 0; i < hooks.length; i++) {
      try {
        hooks[i].callback(result);
      } catch (e) {
        console.warn('Extension hook error:', hookName, e);
      }
    }

    return result;
  },

  // Get all hooks for a name
  getHooks: function(hookName) {
    return this._hooks[hookName] || [];
  },

  // Clear all hooks
  clear: function(hookName) {
    if (hookName) {
      delete this._hooks[hookName];
    } else {
      this._hooks = {};
    }
    return this;
  },

  // ============ PREDEFINED HOOKS ============
  // Available hook points:
  // before:export - before export (can modify format, quality, etc.)
  // after:export  - after export complete
  // before:save   - before save to file
  // after:save    - after save complete
  // before:draw   - before drawing an element (can modify element)
  // after:draw    - after drawing an element
  // before:load   - before loading a project
  // after:load    - after loading a project
  // before:undo   - before undo operation
  // after:undo    - after undo operation
  // before:redo   - before redo operation
  // after:redo    - after redo operation

  // Helper: register export hook
  onExport: function(beforeFn, afterFn) {
    if (beforeFn) this.register('before:export', beforeFn, 10);
    if (afterFn) this.register('after:export', afterFn, 10);
    return this;
  },

  // Helper: register save hook
  onSave: function(beforeFn, afterFn) {
    if (beforeFn) this.register('before:save', beforeFn, 10);
    if (afterFn) this.register('after:save', afterFn, 10);
    return this;
  },

  // Helper: register draw hook
  onDraw: function(beforeFn, afterFn) {
    if (beforeFn) this.register('before:draw', beforeFn, 10);
    if (afterFn) this.register('after:draw', afterFn, 10);
    return this;
  },

  // Helper: register load hook
  onLoad: function(beforeFn, afterFn) {
    if (beforeFn) this.register('before:load', beforeFn, 10);
    if (afterFn) this.register('after:load', afterFn, 10);
    return this;
  },

  // Helper: register undo/redo hooks
  onUndoRedo: function(beforeUndoFn, afterUndoFn) {
    if (beforeUndoFn) this.register('before:undo', beforeUndoFn, 10);
    if (afterUndoFn) this.register('after:undo', afterUndoFn, 10);
    return this;
  }
};

// ============ INTEGRATION ============
// Wire hooks into existing functions
function _extensionInit() {
  // Override export functions to fire hooks
  var origExportImage = typeof doImageExport === 'function' ? doImageExport : null;
  var origExportVideo = typeof startVideoRecording === 'function' ? startVideoRecording : null;

  if (origExportImage) {
    window.doImageExport = function() {
      var hookResult = ExtensionPoints.before('export', { type: 'image' });
      if (hookResult.cancelled) return;
      origExportImage();
      ExtensionPoints.after('export', { type: 'image' });
    };
  }

  if (origExportVideo) {
    window.startVideoRecording = function() {
      var hookResult = ExtensionPoints.before('export', { type: 'video' });
      if (hookResult.cancelled) return;
      origExportVideo();
      ExtensionPoints.after('export', { type: 'video' });
    };
  }

  // Wire into EventBus if available
  if (typeof EventBus !== 'undefined') {
    EventBus.on('export:before', function(data) {
      ExtensionPoints.before('export', data);
    });
    EventBus.on('export:after', function(data) {
      ExtensionPoints.after('export', data);
    });
  }
}

// Auto-init when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _extensionInit);
} else {
  setTimeout(_extensionInit, 0);
}
