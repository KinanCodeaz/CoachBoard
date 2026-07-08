'use strict';
// CoachBoard Pro - Core Initialization
// Initialize all core modules in correct order

var CoreInit = {
  init: function() {
    console.log('[Core] Initializing...');

    // 1. Foundation services (only if they have init method)
    if (typeof ResourceManager !== 'undefined' && typeof ResourceManager.init === 'function') ResourceManager.init();
    if (typeof ThemeManager !== 'undefined' && typeof ThemeManager.init === 'function') ThemeManager.init();
    if (typeof SettingsManager !== 'undefined' && typeof SettingsManager.init === 'function') SettingsManager.init();
    if (typeof EventBus !== 'undefined' && typeof EventBus.init === 'function') EventBus.init();
    if (typeof I18n !== 'undefined' && typeof I18n.init === 'function') I18n.init();

    // 2. Tool system
    if (typeof ToolRegistry !== 'undefined' && typeof ToolRegistry.init === 'function') ToolRegistry.init();

    // 3. Document model
    if (typeof DocumentModel !== 'undefined' && typeof DocumentModel.init === 'function') DocumentModel.init();

    // 4. Scene graph
    if (typeof SceneGraph !== 'undefined' && typeof SceneGraph.init === 'function') SceneGraph.init();

    // 5. Version control
    if (typeof VersionControl !== 'undefined' && typeof VersionControl.init === 'function') VersionControl.init();

    // 6. Template system
    if (typeof TemplateSystem !== 'undefined' && typeof TemplateSystem.init === 'function') TemplateSystem.init();

    // 7. Extension points
    // ExtensionPoints auto-inits via DOMContentLoaded

    // 8. Pages UI (after DOM ready)
    var self = this;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        self._initUI();
      });
    } else {
      setTimeout(function() {
        self._initUI();
      }, 0);
    }

    // 9. Offline support
    if (typeof OfflineSupport !== 'undefined' && typeof OfflineSupport.init === 'function') OfflineSupport.init();

    // 10. Background jobs
    if (typeof BackgroundJob !== 'undefined' && typeof BackgroundJob.init === 'function') BackgroundJob.init();

    // 11. Video export
    if (typeof VideoExport !== 'undefined' && typeof VideoExport.init === 'function') VideoExport.init();

    // 12. Session builder
    if (typeof SessionBuilder !== 'undefined' && typeof SessionBuilder.init === 'function') SessionBuilder.init();

    // 13. Exercise library
    if (typeof ExerciseLibrary !== 'undefined' && typeof ExerciseLibrary.init === 'function') ExerciseLibrary.init();

    // 14. Visual effects
    if (typeof VisualEffects !== 'undefined' && typeof VisualEffects.init === 'function') VisualEffects.init();

    console.log('[Core] Initialized successfully');
    console.log('[Core] Available modules:', this._getModuleList());
  },

  _initUI: function() {
    // Initialize Pages UI
    if (typeof PagesUI !== 'undefined' && typeof PagesUI.init === 'function') {
      PagesUI.init();
    }

    // Initialize Template UI
    if (typeof TemplateUI !== 'undefined' && typeof TemplateUI.init === 'function') {
      TemplateUI.init();
    }

    // Language selector is in index.html - no need to create here

    // Wire Public API to coach object
    if (typeof CoachBoardAPI !== 'undefined') {
      window.coach = CoachBoardAPI;
    }

    // Wire command system to existing undo/redo
    this._wireCommandSystem();

    // Restore last used tool
    try {
      var lastTool = localStorage.getItem('cb_last_tool');
      if (lastTool && typeof setTool === 'function') setTool(lastTool);
    } catch(e) {}
  },

  _wireCommandSystem: function() {
    // Override existing undo/redo to use CommandSystem
    if (typeof CommandSystem !== 'undefined') {
      var origUndo = typeof undo === 'function' ? undo : null;
      var origRedo = typeof redo === 'function' ? redo : null;

      if (origUndo) {
        window.undo = function() {
          if (CommandSystem.canUndo()) {
            CommandSystem.undo();
          } else if (origUndo) {
            origUndo();
          }
        };
      }

      if (origRedo) {
        window.redo = function() {
          if (CommandSystem.canRedo()) {
            CommandSystem.redo();
          } else if (origRedo) {
            origRedo();
          }
        };
      }
    }
  },

  _getModuleList: function() {
    var modules = [];
    var moduleNames = [
      'ResourceManager', 'ThemeManager', 'SettingsManager', 'EventBus',
      'ToolRegistry', 'GeometryEngine', 'VectorEngine', 'DocumentModel',
      'BackgroundJob', 'ExtensionPoints', 'PublicAPI', 'SceneGraph',
      'CommandPattern', 'PagesUI', 'OfflineSupport', 'VersionControl', 'I18n'
    ];

    for (var i = 0; i < moduleNames.length; i++) {
      if (typeof window[moduleNames[i]] !== 'undefined') {
        modules.push(moduleNames[i]);
      }
    }

    return modules.join(', ');
  },

  // Get status of all modules
  getStatus: function() {
    return {
      initialized: true,
      modules: this._getModuleList(),
      online: typeof OfflineSupport !== 'undefined' ? OfflineSupport.isOnline() : true,
      language: typeof I18n !== 'undefined' ? I18n.getLanguage() : 'en',
      versions: typeof VersionControl !== 'undefined' ? VersionControl.getVersionCount() : 0
    };
  },

  // Quick performance benchmark
  quickBench: function() {
    var results = {};
    // 1. Render time
    var t0 = performance.now();
    if (typeof render === 'function') render();
    results.renderMs = Math.round(performance.now() - t0);
    // 2. Element count
    results.elements = typeof els !== 'undefined' ? els.length : 0;
    // 3. Step count
    results.steps = typeof scenes !== 'undefined' ? scenes.length : 0;
    // 4. Memory (if available)
    if (performance.memory) {
      results.memoryMB = Math.round(performance.memory.usedJSHeapSize / 1048576);
    }
    // 5. FPS estimate (sample 10 frames)
    var frames = 0;
    var fpsStart = performance.now();
    function countFrame() {
      frames++;
      if (performance.now() - fpsStart < 500) requestAnimationFrame(countFrame);
      else results.fps = Math.round(frames / ((performance.now() - fpsStart) / 1000));
    }
    requestAnimationFrame(countFrame);
    // Return after brief delay to allow FPS sampling
    return new Promise(function(resolve) {
      setTimeout(function() {
        resolve(results);
      }, 600);
    });
  }
};

// Auto-init when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    CoreInit.init();
  });
} else {
  CoreInit.init();
}
