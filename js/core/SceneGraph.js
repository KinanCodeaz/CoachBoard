'use strict';
// CoachBoard Pro - Scene Graph
// Object hierarchy, groups, z-order, spatial queries

var SceneGraph = {
  _root: null,
  _selected: null,
  _hovered: null,
  _nodeMap: {},

  init: function() {
    this._root = {
      id: 'root',
      type: 'root',
      children: [],
      visible: true,
      locked: false
    };
    this._nodeMap = {};
    this._nodeMap['root'] = this._root;
    return this;
  },

  // ============ NODE OPERATIONS ============
  // Create a node from element
  createNode: function(element) {
    var node = {
      id: element.id || ('node_' + Date.now()),
      element: element,
      type: element.type || 'unknown',
      children: [],
      parent: null,
      visible: element.visible !== false,
      locked: false,
      opacity: element.opacity || 1,
      transform: {
        x: element.x || 0,
        y: element.y || 0,
        rotation: element.rotation || 0,
        scaleX: 1,
        scaleY: 1
      }
    };
    this._nodeMap[node.id] = node;
    return node;
  },

  // Add node to parent (or root)
  addNode: function(node, parentId) {
    var parent = parentId ? this._nodeMap[parentId] : this._root;
    if (!parent) return false;

    // Remove from old parent
    if (node.parent) {
      this.removeNode(node.id, true);
    }

    node.parent = parent;
    parent.children.push(node);
    return true;
  },

  // Remove node (optionally keep children)
  removeNode: function(nodeId, keepChildren) {
    var node = this._nodeMap[nodeId];
    if (!node || !node.parent) return false;

    var parent = node.parent;
    var idx = parent.children.indexOf(node);
    if (idx === -1) return false;

    parent.children.splice(idx, 1);

    if (keepChildren) {
      // Move children to parent
      for (var i = 0; i < node.children.length; i++) {
        node.children[i].parent = parent;
        parent.children.push(node.children[i]);
      }
    } else {
      // Remove all children recursively
      this._removeChildrenRecursive(node);
    }

    node.parent = null;
    delete this._nodeMap[nodeId];
    return true;
  },

  _removeChildrenRecursive: function(node) {
    for (var i = node.children.length - 1; i >= 0; i--) {
      this._removeChildrenRecursive(node.children[i]);
      delete this._nodeMap[node.children[i].id];
    }
    node.children = [];
  },

  // Get node by ID
  getNode: function(nodeId) {
    return this._nodeMap[nodeId] || null;
  },

  // Get root node
  getRoot: function() {
    return this._root;
  },

  // ============ GROUPING ============
  // Group selected nodes
  group: function(nodeIds) {
    if (!nodeIds || nodeIds.length < 2) return null;

    var nodes = [];
    for (var i = 0; i < nodeIds.length; i++) {
      var node = this._nodeMap[nodeIds[i]];
      if (node && node.parent) nodes.push(node);
    }

    if (nodes.length < 2) return null;

    // Find common parent
    var commonParent = nodes[0].parent;
    for (var i = 1; i < nodes.length; i++) {
      if (nodes[i].parent !== commonParent) {
        commonParent = this._root;
        break;
      }
    }

    // Create group node
    var groupNode = {
      id: 'group_' + Date.now(),
      type: 'group',
      children: [],
      parent: commonParent,
      visible: true,
      locked: false,
      opacity: 1,
      transform: { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 }
    };

    this._nodeMap[groupNode.id] = groupNode;

    // Move nodes into group
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var idx = commonParent.children.indexOf(node);
      if (idx !== -1) commonParent.children.splice(idx, 1);
      node.parent = groupNode;
      groupNode.children.push(node);
    }

    // Add group to parent
    commonParent.children.push(groupNode);

    return groupNode;
  },

  // Ungroup a group node
  ungroup: function(nodeId) {
    var node = this._nodeMap[nodeId];
    if (!node || node.type !== 'group' || !node.parent) return false;

    var parent = node.parent;
    var idx = parent.children.indexOf(node);
    if (idx === -1) return false;

    parent.children.splice(idx, 1);

    // Move children to parent
    for (var i = 0; i < node.children.length; i++) {
      node.children[i].parent = parent;
      parent.children.push(node.children[i]);
    }

    delete this._nodeMap[nodeId];
    return true;
  },

  // ============ Z-ORDER ============
  // Bring to front
  bringToFront: function(nodeId) {
    var node = this._nodeMap[nodeId];
    if (!node || !node.parent) return false;

    var parent = node.parent;
    var idx = parent.children.indexOf(node);
    if (idx === -1 || idx === parent.children.length - 1) return false;

    parent.children.splice(idx, 1);
    parent.children.push(node);
    return true;
  },

  // Send to back
  sendToBack: function(nodeId) {
    var node = this._nodeMap[nodeId];
    if (!node || !node.parent) return false;

    var parent = node.parent;
    var idx = parent.children.indexOf(node);
    if (idx <= 0) return false;

    parent.children.splice(idx, 1);
    parent.children.unshift(node);
    return true;
  },

  // Move up one layer
  moveUp: function(nodeId) {
    var node = this._nodeMap[nodeId];
    if (!node || !node.parent) return false;

    var parent = node.parent;
    var idx = parent.children.indexOf(node);
    if (idx === -1 || idx === parent.children.length - 1) return false;

    var temp = parent.children[idx];
    parent.children[idx] = parent.children[idx + 1];
    parent.children[idx + 1] = temp;
    return true;
  },

  // Move down one layer
  moveDown: function(nodeId) {
    var node = this._nodeMap[nodeId];
    if (!node || !node.parent) return false;

    var parent = node.parent;
    var idx = parent.children.indexOf(node);
    if (idx <= 0) return false;

    var temp = parent.children[idx];
    parent.children[idx] = parent.children[idx - 1];
    parent.children[idx - 1] = temp;
    return true;
  },

  // ============ VISIBILITY & LOCK ============
  setVisibility: function(nodeId, visible) {
    var node = this._nodeMap[nodeId];
    if (!node) return false;
    node.visible = visible;
    if (node.element) node.element.visible = visible;
    return true;
  },

  setLock: function(nodeId, locked) {
    var node = this._nodeMap[nodeId];
    if (!node) return false;
    node.locked = locked;
    return true;
  },

  // ============ SPATIAL QUERIES ============
  // Get all visible nodes (depth-first)
  getVisibleNodes: function() {
    var result = [];
    this._traverseVisible(this._root, result);
    return result;
  },

  _traverseVisible: function(node, result) {
    if (!node.visible) return;
    if (node.type !== 'root') result.push(node);
    for (var i = 0; i < node.children.length; i++) {
      this._traverseVisible(node.children[i], result);
    }
  },

  // Hit test at point
  hitTest: function(x, y) {
    var visible = this.getVisibleNodes();
    for (var i = visible.length - 1; i >= 0; i--) {
      var node = visible[i];
      if (node.element && !node.locked) {
        var el = node.element;
        if (x >= el.x && x <= el.x + (el.w || 0) &&
            y >= el.y && y <= el.y + (el.h || 0)) {
          return node;
        }
      }
    }
    return null;
  },

  // Get bounding box of all nodes
  getBoundingBox: function() {
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    var nodes = this.getVisibleNodes();

    for (var i = 0; i < nodes.length; i++) {
      var el = nodes[i].element;
      if (!el) continue;
      if (el.x < minX) minX = el.x;
      if (el.y < minY) minY = el.y;
      if (el.x + (el.w || 0) > maxX) maxX = el.x + (el.w || 0);
      if (el.y + (el.h || 0) > maxY) maxY = el.y + (el.h || 0);
    }

    return {
      x: minX, y: minY,
      width: maxX - minX, height: maxY - minY
    };
  },

  // ============ EXPORT ============
  // Get tree structure for debugging
  getTree: function(nodeId, depth) {
    var node = nodeId ? this._nodeMap[nodeId] : this._root;
    if (!node) return null;

    var result = {
      id: node.id,
      type: node.type,
      visible: node.visible,
      locked: node.locked,
      children: []
    };

    if (depth === undefined || depth > 0) {
      for (var i = 0; i < node.children.length; i++) {
        var childDepth = depth !== undefined ? depth - 1 : undefined;
        var child = this.getTree(node.children[i].id, childDepth);
        if (child) result.children.push(child);
      }
    }

    return result;
  },

  // Get node count
  getCount: function() {
    return Object.keys(this._nodeMap).length;
  },

  // Clear entire scene
  clear: function() {
    this._root.children = [];
    this._nodeMap = {};
    this._nodeMap['root'] = this._root;
    this._selected = null;
    this._hovered = null;
  }
};
