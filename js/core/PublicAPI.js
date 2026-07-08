'use strict';
/**
 * CoachBoard Pro - Public API
 * Simple, coach-friendly API for programmatic access.
 * 
 * @example
 * // Add a player at position (100, 200)
 * coach.addPlayer(100, 200, { team: 'home', number: 10 });
 * 
 * @example
 * // Add a ball
 * coach.addBall(300, 150);
 * 
 * @example
 * // Export as image
 * coach.exportImage(function(blob) { console.log(blob); });
 * 
 * @namespace CoachBoardAPI
 * @version 2.0
 */

var CoachBoardAPI = {
  /**
   * Add a player element to the canvas.
   * @param {number} x - X coordinate on canvas
   * @param {number} y - Y coordinate on canvas
   * @param {Object} [options] - Player options
   * @param {string} [options.team='home'] - Team ('home' or 'away')
   * @param {number} [options.number=0] - Jersey number
   * @param {string} [options.label=''] - Player label/name
   * @param {string} [options.color] - Player color (auto-set by team if omitted)
   * @returns {Object} The created player element
   */
  addPlayer: function(x, y, options) {
    var opts = options || {};
    var el = {
      id: uid ? uid() : 'el_' + Date.now(),
      type: 'player',
      x: x || 100,
      y: y || 100,
      w: 40,
      h: 40,
      team: opts.team || 'home',
      jerseyNumber: opts.number || 0,
      label: opts.label || '',
      color: opts.team === 'away' ? '#cc0000' : '#0055aa',
      rotation: 0,
      opacity: 1,
      visible: true
    };
    if (typeof els !== 'undefined') {
      els.push(el);
    }
    return el;
  },

  /**
   * Add a ball element to the canvas.
   * @param {number} x - X coordinate on canvas
   * @param {number} y - Y coordinate on canvas
   * @param {Object} [options] - Ball options
   * @returns {Object} The created ball element
   */
  addBall: function(x, y, options) {
    var opts = options || {};
    var el = {
      id: uid ? uid() : 'el_' + Date.now(),
      type: 'ball',
      x: x || 200,
      y: y || 200,
      w: 30,
      h: 30,
      rotation: 0,
      opacity: 1,
      visible: true
    };
    if (typeof els !== 'undefined') {
      els.push(el);
    }
    return el;
  },

  /**
   * Add equipment to the canvas.
   * @param {string} type - Equipment type ('cone', 'hurdle', 'flag', 'smallGoal', etc.)
   * @param {number} x - X coordinate on canvas
   * @param {number} y - Y coordinate on canvas
   * @param {Object} [options] - Equipment options (color, size, material, etc.)
   * @returns {Object} The created equipment element
   */
  addEquipment: function(type, x, y, options) {
    var opts = options || {};
    var el = {
      id: uid ? uid() : 'el_' + Date.now(),
      type: type || 'cone',
      x: x || 150,
      y: y || 150,
      w: 30,
      h: 30,
      rotation: 0,
      opacity: 1,
      visible: true
    };
    if (typeof els !== 'undefined') {
      els.push(el);
    }
    return el;
  },

  removeElement: function(id) {
    if (typeof els !== 'undefined') {
      for (var i = 0; i < els.length; i++) {
        if (els[i].id === id) {
          els.splice(i, 1);
          return true;
        }
      }
    }
    return false;
  },

  getElements: function() {
    return typeof els !== 'undefined' ? els.slice() : [];
  },

  // ============ VIEW OPERATIONS ============
  zoomIn: function() {
    if (typeof Camera !== 'undefined') {
      Camera.zoomTo(Camera.z * 1.2);
    }
  },

  zoomOut: function() {
    if (typeof Camera !== 'undefined') {
      Camera.zoomTo(Camera.z / 1.2);
    }
  },

  zoomReset: function() {
    if (typeof Camera !== 'undefined') {
      Camera.reset();
    }
  },

  setZoom: function(level) {
    if (typeof Camera !== 'undefined') {
      Camera.zoomTo(level);
    }
  },

  getZoom: function() {
    return typeof Camera !== 'undefined' ? Camera.z : 1;
  },

  setPerspective: function(pitch, yaw) {
    if (typeof Camera !== 'undefined') {
      Camera.setPerspective(pitch, yaw);
    }
  },

  // ============ TOOL OPERATIONS ============
  setTool: function(toolId) {
    if (typeof setTool === 'function') {
      setTool(toolId);
    }
  },

  getTool: function() {
    return typeof tool !== 'undefined' ? tool : null;
  },

  // ============ PROJECT OPERATIONS ============
  newProject: function(name, sport) {
    if (typeof DocumentModel !== 'undefined') {
      var project = DocumentModel.createProject(name, sport);
      DocumentModel.setProject(project);
      return project;
    }
    return null;
  },

  saveProject: function() {
    if (typeof DocumentModel !== 'undefined') {
      return DocumentModel.saveToStorage();
    }
    return false;
  },

  loadProject: function() {
    if (typeof DocumentModel !== 'undefined') {
      return DocumentModel.loadFromStorage();
    }
    return false;
  },

  // ============ EXPORT OPERATIONS ============
  exportImage: function(callback) {
    if (typeof doImageExport === 'function') {
      doImageExport();
      return true;
    }
    return false;
  },

  exportVideo: function(duration) {
    if (typeof startVideoRecording === 'function') {
      startVideoRecording();
      return true;
    }
    return false;
  },

  // ============ UNDO/REDO ============
  undo: function() {
    if (typeof HistorySystem !== 'undefined' && HistorySystem.undo) {
      HistorySystem.undo();
      return true;
    }
    return false;
  },

  redo: function() {
    if (typeof HistorySystem !== 'undefined' && HistorySystem.redo) {
      HistorySystem.redo();
      return true;
    }
    return false;
  },

  // ============ THEME ============
  setTheme: function(theme) {
    if (typeof ThemeManager !== 'undefined' && ThemeManager.apply) {
      ThemeManager.apply(theme);
      return true;
    }
    return false;
  },

  getTheme: function() {
    return typeof ThemeManager !== 'undefined' ? ThemeManager.current() : null;
  },

  // ============ SETTINGS ============
  setSetting: function(key, value) {
    if (typeof SettingsManager !== 'undefined' && SettingsManager.set) {
      SettingsManager.set(key, value);
      return true;
    }
    return false;
  },

  getSetting: function(key) {
    return typeof SettingsManager !== 'undefined' ? SettingsManager.get(key) : null;
  },

  // ============ HELP ============
  help: function() {
    return {
      'CoachBoard Pro API': 'Simple interface for coaches',
      'addPlayer(x, y, {team, number, label})': 'Add a player',
      'addBall(x, y)': 'Add a ball',
      'addEquipment(type, x, y)': 'Add equipment (cone, goal, mannequin, etc.)',
      'removeElement(id)': 'Remove an element',
      'getElements()': 'Get all elements',
      'zoomIn() / zoomOut() / zoomReset()': 'Camera controls',
      'setZoom(level)': 'Set specific zoom level',
      'setPerspective(pitch, yaw)': 'Set 3D perspective',
      'setTool(toolId)': 'Change current tool',
      'newProject(name, sport)': 'Create new project',
      'saveProject() / loadProject()': 'Save/load project',
      'exportImage() / exportVideo()': 'Export media',
      'undo() / redo()': 'Undo/redo',
      'setTheme(theme)': 'Change theme (dark/light/grass)',
      'setSetting(key, value)': 'Change settings',
      'help()': 'Show this help'
    };
  }
};

// Global coach object
var coach = CoachBoardAPI;
