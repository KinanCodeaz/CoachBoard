'use strict';
// CoachBoard Pro - ToolRegistry
// Load tool definitions from config.json files
// Enables Configuration-Driven Architecture

var ToolRegistry = {
  _tools: {},        // toolId → config
  _loaded: false,
  _basePath: 'assets/tools/',

  // Initialize: create default configs for all tools
  init: function(callback) {
    var self = this;
    var toolIds = this._discoverTools();

    // Create default configs for all tools (no file loading)
    toolIds.forEach(function(id) {
      if (!self._tools[id]) {
        self._tools[id] = self._createDefault(id);
      }
    });

    this._loaded = true;
    callback && callback();
  },

  // Discover available tools (hardcoded list for now)
  _discoverTools: function() {
    return [
      'smallGoal',
      'cone',
      'coneDisc',
      'coneTall',
      'ring',
      'barrier',
      'hurdle',
      'hurdleArc',
      'mannequin',
      'flag',
      'ladder',
      'stick',
      'bib',
      'reboundBoard',
      'ball',
      'p_stand',
      'p_gk',
      'p_jersey'
    ];
  },

  // Load a single tool config
  loadTool: function(toolId, callback) {
    var self = this;
    var url = this._basePath + toolId + '/config.json';

    ResourceManager.loadSVG(url, function(svgText, data) {
      if (data && data.loaded) {
        try {
          var config = JSON.parse(data.svgText);
          self._tools[toolId] = config;
          callback && callback(config);
        } catch (e) {
          console.warn('ToolRegistry: Failed to parse config for ' + toolId, e);
          callback && callback(null);
        }
      } else {
        // Config not found, create minimal default
        self._tools[toolId] = self._createDefault(toolId);
        callback && callback(self._tools[toolId]);
      }
    });
  },

  // Get tool config (sync)
  get: function(toolId) {
    return this._tools[toolId] || null;
  },

  // Check if tool is registered
  has: function(toolId) {
    return !!this._tools[toolId];
  },

  // Get tool capabilities
  capabilities: function(toolId) {
    var config = this._tools[toolId];
    return config ? config.capabilities : null;
  },

  // Check if tool supports a capability
  supports: function(toolId, capability) {
    var caps = this.capabilities(toolId);
    return caps ? !!caps[capability] : false;
  },

  // Get tool properties schema
  properties: function(toolId) {
    var config = this._tools[toolId];
    return config ? config.properties : null;
  },

  // Get default value for a property
  propertyDefault: function(toolId, propName) {
    var props = this.properties(toolId);
    if (props && props[propName]) {
      return props[propName].default;
    }
    return null;
  },

  // Get tool name (localized)
  name: function(toolId, lang) {
    var config = this._tools[toolId];
    if (config && config.name) {
      return config.name[lang] || config.name.en || toolId;
    }
    return toolId;
  },

  // Get tool category
  category: function(toolId) {
    var config = this._tools[toolId];
    return config ? config.category : null;
  },

  // Get all tools in a category
  byCategory: function(category) {
    var result = [];
    for (var id in this._tools) {
      if (this._tools[id].category === category) {
        result.push(id);
      }
    }
    return result;
  },

  // List all registered tools
  list: function() {
    var result = [];
    for (var id in this._tools) {
      result.push({
        id: id,
        name: this._tools[id].name,
        category: this._tools[id].category
      });
    }
    return result;
  },

  // Create minimal default config for unknown tools
  _createDefault: function(toolId) {
    return {
      id: toolId,
      name: { en: toolId, ar: toolId },
      category: 'unknown',
      capabilities: {
        selectable: true,
        movable: true,
        rotatable: true,
        resizable: true,
        flippable: false,
        perspective: false,
        animatable: false,
        exportable: true,
        groupable: true,
        linkable: false,
        copyable: true,
        deletable: true
      },
      properties: {
        x: { type: 'number', default: 0 },
        y: { type: 'number', default: 0 },
        size: { type: 'number', default: 18 },
        color: { type: 'color', default: '#ffffff' },
        rotation: { type: 'angle', default: 0 },
        opacity: { type: 'range', min: 0, max: 1, default: 1 }
      }
    };
  },

  // Export all configs as JSON
  export: function() {
    return JSON.stringify(this._tools, null, 2);
  }
};
