'use strict';
// CoachBoard Pro - Document Model
// Project → Pages → Layers → Objects
// Backward compatible: els[] still works. Document Model wraps it.

var DocumentModel = {
  _currentProject: null,

  // Create a new project
  createProject: function(name, sport) {
    return {
      meta: {
        id: uid ? uid() : 'proj_' + Date.now(),
        name: name || 'Untitled',
        author: '',
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        sport: sport || 'futsal',
        tags: [],
        version: '1.0'
      },
      settings: {
        theme: 'dark',
        grid: true,
        snap: true,
        perspective: false,
        pitchOrientation: 'landscape'
      },
      pages: [
        {
          id: 'page_1',
          name: 'Page 1',
          notes: '',
          layers: [
            {
              id: 'layer_1',
              name: 'Default',
              visible: true,
              locked: false,
              elements: []
            }
          ],
          thumbnail: null
        }
      ],
      sessions: [],
      exercises: []
    };
  },

  // Initialize with current project
  init: function() {
    if (!this._currentProject) {
      this._currentProject = this.createProject();
    }
    return this;
  },

  // Get current project
  getProject: function() {
    return this._currentProject;
  },

  // Set current project
  setProject: function(project) {
    this._currentProject = project;
    this._syncToElements();
  },

  // ============ PAGES ============
  // Get current page
  getCurrentPage: function() {
    var project = this._currentProject;
    if (!project || !project.pages || project.pages.length === 0) return null;
    return project.pages[project._currentPageIndex || 0];
  },

  // Get all pages
  getPages: function() {
    return this._currentProject ? this._currentProject.pages : [];
  },

  // Add a page
  addPage: function(name) {
    var project = this._currentProject;
    if (!project) return null;

    var page = {
      id: 'page_' + Date.now(),
      name: name || 'Page ' + (project.pages.length + 1),
      notes: '',
      layers: [
        {
          id: 'layer_' + Date.now(),
          name: 'Default',
          visible: true,
          locked: false,
          elements: []
        }
      ],
      thumbnail: null
    };

    project.pages.push(page);
    project.meta.modified = new Date().toISOString();
    return page;
  },

  // Remove a page
  removePage: function(pageId) {
    var project = this._currentProject;
    if (!project) return false;

    var idx = project.pages.findIndex(function(p) { return p.id === pageId; });
    if (idx === -1 || project.pages.length <= 1) return false;

    project.pages.splice(idx, 1);
    project.meta.modified = new Date().toISOString();
    return true;
  },

  // Switch to a page
  switchPage: function(pageId) {
    var project = this._currentProject;
    if (!project) return false;

    var idx = project.pages.findIndex(function(p) { return p.id === pageId; });
    if (idx === -1) return false;

    // Save current elements to current page
    this._syncFromElements();

    // Switch
    project._currentPageIndex = idx;

    // Load new page elements
    this._syncToElements();
    return true;
  },

  // ============ LAYERS ============
  // Get current page's layers
  getLayers: function() {
    var page = this.getCurrentPage();
    return page ? page.layers : [];
  },

  // Add a layer
  addLayer: function(name) {
    var page = this.getCurrentPage();
    if (!page) return null;

    var layer = {
      id: 'layer_' + Date.now(),
      name: name || 'Layer ' + (page.layers.length + 1),
      visible: true,
      locked: false,
      elements: []
    };

    page.layers.push(layer);
    return layer;
  },

  // Remove a layer
  removeLayer: function(layerId) {
    var page = this.getCurrentPage();
    if (!page || page.layers.length <= 1) return false;

    var idx = page.layers.findIndex(function(l) { return l.id === layerId; });
    if (idx === -1) return false;

    page.layers.splice(idx, 1);
    return true;
  },

  // Toggle layer visibility
  toggleLayerVisibility: function(layerId) {
    var layers = this.getLayers();
    for (var i = 0; i < layers.length; i++) {
      if (layers[i].id === layerId) {
        layers[i].visible = !layers[i].visible;
        return layers[i].visible;
      }
    }
    return null;
  },

  // Toggle layer lock
  toggleLayerLock: function(layerId) {
    var layers = this.getLayers();
    for (var i = 0; i < layers.length; i++) {
      if (layers[i].id === layerId) {
        layers[i].locked = !layers[i].locked;
        return layers[i].locked;
      }
    }
    return null;
  },

  // ============ ELEMENTS ============
  // Add element to a layer
  addElement: function(element, layerId) {
    var page = this.getCurrentPage();
    if (!page) return false;

    // Find layer
    var layer = null;
    if (layerId) {
      layer = page.layers.find(function(l) { return l.id === layerId; });
    } else {
      layer = page.layers[0]; // Default to first layer
    }

    if (!layer) return false;
    if (layer.locked) return false;

    layer.elements.push(element);
    return true;
  },

  // Remove element
  removeElement: function(elementId) {
    var page = this.getCurrentPage();
    if (!page) return false;

    for (var i = 0; i < page.layers.length; i++) {
      var layer = page.layers[i];
      var idx = layer.elements.findIndex(function(e) { return e.id === elementId; });
      if (idx !== -1) {
        layer.elements.splice(idx, 1);
        return true;
      }
    }
    return false;
  },

  // Get element by ID
  getElement: function(elementId) {
    var page = this.getCurrentPage();
    if (!page) return null;

    for (var i = 0; i < page.layers.length; i++) {
      var el = page.layers[i].elements.find(function(e) { return e.id === elementId; });
      if (el) return el;
    }
    return null;
  },

  // Get all visible elements (across all visible layers)
  getVisibleElements: function() {
    var page = this.getCurrentPage();
    if (!page) return [];

    var result = [];
    for (var i = 0; i < page.layers.length; i++) {
      var layer = page.layers[i];
      if (layer.visible && !layer.locked) {
        result = result.concat(layer.elements);
      }
    }
    return result;
  },

  // ============ SYNC WITH LEGACY ============
  // Sync from DocumentModel to els[] (for backward compatibility)
  _syncToElements: function() {
    var page = this.getCurrentPage();
    if (!page) return;

    // Clear current elements
    if (typeof els !== 'undefined') {
      els.length = 0;

      // Add all visible layer elements
      for (var i = 0; i < page.layers.length; i++) {
        var layer = page.layers[i];
        if (layer.visible) {
          for (var j = 0; j < layer.elements.length; j++) {
            els.push(layer.elements[j]);
          }
        }
      }
    }
  },

  // Sync from els[] to DocumentModel (save current state)
  _syncFromElements: function() {
    var page = this.getCurrentPage();
    if (!page) return;

    // Save to first layer
    if (page.layers.length > 0) {
      page.layers[0].elements = (typeof els !== 'undefined') ? els.slice() : [];
    }
  },

  // ============ SAVE/LOAD ============
  // Export project as JSON
  exportJSON: function() {
    this._syncFromElements();
    return JSON.stringify(this._currentProject, null, 2);
  },

  // Import project from JSON
  importJSON: function(jsonString) {
    try {
      var project = JSON.parse(jsonString);
      if (project && project.meta && project.pages) {
        this.setProject(project);
        return true;
      }
    } catch (e) {}
    return false;
  },

  // Save to localStorage
  saveToStorage: function(key) {
    var k = key || 'cb_document_model';
    try {
      this._syncFromElements();
      localStorage.setItem(k, JSON.stringify(this._currentProject));
      return true;
    } catch (e) {
      return false;
    }
  },

  // Load from localStorage
  loadFromStorage: function(key) {
    var k = key || 'cb_document_model';
    try {
      var data = localStorage.getItem(k);
      if (data) {
        this.importJSON(data);
        return true;
      }
    } catch (e) {}
    return false;
  }
};
