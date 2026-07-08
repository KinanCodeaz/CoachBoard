'use strict';
// CoachBoard Pro - SettingsManager
// Centralized user preference persistence
// All settings in one place, organized by category

var SettingsManager = {
  _prefix: 'cb_',
  _cache: {},           // key → value (in-memory cache)
  _defaults: {},        // key → defaultValue
  _storageKey: 'cb_settings',  // single localStorage key for all settings
  _data: null,          // loaded settings object

  // Initialize: load all settings from localStorage
  init: function() {
    this._data = this._load();
    this._cache = {};
    return this;
  },

  // Get a setting value
  get: function(key, defaultVal) {
    // Check cache first
    if (this._cache.hasOwnProperty(key)) {
      return this._cache[key];
    }
    // Check loaded data
    if (this._data && this._data.hasOwnProperty(key)) {
      var val = this._data[key];
      this._cache[key] = val;
      return val;
    }
    // Check defaults
    if (this._defaults.hasOwnProperty(key)) {
      return this._defaults[key];
    }
    // Return provided default
    return defaultVal !== undefined ? defaultVal : null;
  },

  // Set a setting value
  set: function(key, value) {
    if (!this._data) this._data = {};
    this._data[key] = value;
    this._cache[key] = value;
    this._save();
    return this;
  },

  // Set multiple settings at once
  setMany: function(obj) {
    if (!this._data) this._data = {};
    for (var key in obj) {
      this._data[key] = obj[key];
      this._cache[key] = obj[key];
    }
    this._save();
    return this;
  },

  // Delete a setting
  remove: function(key) {
    if (this._data) delete this._data[key];
    delete this._cache[key];
    this._save();
    return this;
  },

  // Check if a setting exists
  has: function(key) {
    return (this._data && this._data.hasOwnProperty(key)) ||
           this._defaults.hasOwnProperty(key);
  },

  // Register defaults (called during init)
  defaults: function(obj) {
    for (var key in obj) {
      this._defaults[key] = obj[key];
    }
    return this;
  },

  // Get all settings as object
  getAll: function() {
    var result = {};
    // Apply defaults first
    for (var k in this._defaults) {
      result[k] = this._defaults[k];
    }
    // Override with saved values
    if (this._data) {
      for (var k in this._data) {
        result[k] = this._data[k];
      }
    }
    return result;
  },

  // Get all keys
  keys: function() {
    var result = {};
    for (var k in this._defaults) result[k] = true;
    if (this._data) {
      for (var k in this._data) result[k] = true;
    }
    return Object.keys(result);
  },

  // Clear all settings
  clear: function() {
    this._data = {};
    this._cache = {};
    this._save();
    return this;
  },

  // Export all settings as JSON
  export: function() {
    return JSON.stringify(this.getAll(), null, 2);
  },

  // Import settings from JSON
  import: function(jsonString) {
    try {
      var data = JSON.parse(jsonString);
      if (typeof data === 'object' && data !== null) {
        this.setMany(data);
        return true;
      }
    } catch (e) {}
    return false;
  },

  // Migrate old localStorage keys to new centralized system
  migrate: function() {
    var migrated = 0;
    var oldKeys = [
      'cb_theme', 'cb_save_pref', 'cb_custom_icons', 'cb_welcomed',
      'cb_display_style', 'cb_field_style', 'cb_fav_colors', 'cb_notes',
      'cb_team_rosters', 'cb_tool_templates', 'cb_roster_server_url'
    ];

    for (var i = 0; i < oldKeys.length; i++) {
      var oldKey = oldKeys[i];
      var newKey = oldKey.replace(/^cb_/, '');
      try {
        var val = localStorage.getItem(oldKey);
        if (val !== null) {
          // Parse JSON if possible
          try { val = JSON.parse(val); } catch (e) {}
          // Only migrate if not already in new system
          if (!this.has(newKey)) {
            this.set(newKey, val);
            migrated++;
          }
        }
      } catch (e) {}
    }

    return migrated;
  },

  // Internal: load from localStorage
  _load: function() {
    try {
      var raw = localStorage.getItem(this._storageKey);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {};
  },

  // Internal: save to localStorage
  _save: function() {
    try {
      localStorage.setItem(this._storageKey, JSON.stringify(this._data));
    } catch (e) {}
  }
};
