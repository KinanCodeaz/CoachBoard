'use strict';
// CoachBoard Pro - Command Pattern
// Undo/Redo per command, macro recording, compound commands

var CommandSystem = {
  _undoStack: [],
  _redoStack: [],
  _maxHistory: 50,
  _recording: false,
  _recordedCommands: [],

  // ============ CORE ============
  // Execute a command
  execute: function(command) {
    if (!command || !command.execute) return false;

    // Check if can execute
    if (command.canExecute && !command.canExecute()) return false;

    try {
      command.execute();
      this._undoStack.push(command);
      this._redoStack = [];

      // Trim history
      if (this._undoStack.length > this._maxHistory) {
        this._undoStack.shift();
      }

      // If recording, add to macro
      if (this._recording) {
        this._recordedCommands.push(command);
      }

      return true;
    } catch (e) {
      console.error('Command execution failed:', e);
      return false;
    }
  },

  // Undo last command
  undo: function() {
    if (this._undoStack.length === 0) return false;

    var command = this._undoStack.pop();
    try {
      command.undo();
      this._redoStack.push(command);
      return true;
    } catch (e) {
      console.error('Undo failed:', e);
      this._undoStack.push(command);
      return false;
    }
  },

  // Redo last undone command
  redo: function() {
    if (this._redoStack.length === 0) return false;

    var command = this._redoStack.pop();
    try {
      command.execute();
      this._undoStack.push(command);
      return true;
    } catch (e) {
      console.error('Redo failed:', e);
      this._redoStack.push(command);
      return false;
    }
  },

  // Check if can undo/redo
  canUndo: function() {
    return this._undoStack.length > 0;
  },

  canRedo: function() {
    return this._redoStack.length > 0;
  },

  // Clear history
  clear: function() {
    this._undoStack = [];
    this._redoStack = [];
  },

  // Get history info
  getHistory: function() {
    return {
      undoCount: this._undoStack.length,
      redoCount: this._redoStack.length,
      lastCommand: this._undoStack.length > 0 ?
        this._undoStack[this._undoStack.length - 1].name : null
    };
  },

  // ============ MACRO RECORDING ============
  // Start recording a macro (multiple commands as one)
  startRecording: function(macroName) {
    this._recording = true;
    this._recordedCommands = [];
    this._macroName = macroName || 'macro';
  },

  // Stop recording and get the macro
  stopRecording: function() {
    this._recording = false;
    var commands = this._recordedCommands;
    this._recordedCommands = [];

    if (commands.length === 0) return null;

    return {
      name: this._macroName,
      commands: commands,
      execute: function() {
        for (var i = 0; i < commands.length; i++) {
          commands[i].execute();
        }
      },
      undo: function() {
        for (var i = commands.length - 1; i >= 0; i--) {
          commands[i].undo();
        }
      }
    };
  },

  isRecording: function() {
    return this._recording;
  }
};

// ============ COMMAND BUILDERS ============
// Factory functions to create common commands

var Commands = {
  // Add element command
  addElement: function(element) {
    return {
      name: 'Add Element',
      execute: function() {
        if (typeof els !== 'undefined') els.push(element);
      },
      undo: function() {
        if (typeof els !== 'undefined') {
          var idx = els.indexOf(element);
          if (idx !== -1) els.splice(idx, 1);
        }
      },
      canExecute: function() {
        return typeof els !== 'undefined' && els.indexOf(element) === -1;
      }
    };
  },

  // Remove element command
  removeElement: function(element) {
    var index = -1;
    return {
      name: 'Remove Element',
      execute: function() {
        if (typeof els !== 'undefined') {
          index = els.indexOf(element);
          if (index !== -1) els.splice(index, 1);
        }
      },
      undo: function() {
        if (typeof els !== 'undefined' && index !== -1) {
          els.splice(index, 0, element);
        }
      }
    };
  },

  // Move element command
  moveElement: function(element, newX, newY) {
    var oldX = element.x;
    var oldY = element.y;
    return {
      name: 'Move Element',
      execute: function() {
        element.x = newX;
        element.y = newY;
      },
      undo: function() {
        element.x = oldX;
        element.y = oldY;
      }
    };
  },

  // Modify element command
  modifyElement: function(element, property, value) {
    var oldValue = element[property];
    return {
      name: 'Modify Element',
      execute: function() {
        element[property] = value;
      },
      undo: function() {
        element[property] = oldValue;
      }
    };
  },

  // Batch move (multiple elements)
  batchMove: function(elements, deltaX, deltaY) {
    var positions = elements.map(function(el) {
      return { x: el.x, y: el.y };
    });
    return {
      name: 'Batch Move',
      execute: function() {
        for (var i = 0; i < elements.length; i++) {
          elements[i].x += deltaX;
          elements[i].y += deltaY;
        }
      },
      undo: function() {
        for (var i = 0; i < elements.length; i++) {
          elements[i].x = positions[i].x;
          elements[i].y = positions[i].y;
        }
      }
    };
  },

  // Layer reorder command
  reorderLayer: function(layers, fromIndex, toIndex) {
    var layer = layers[fromIndex];
    return {
      name: 'Reorder Layer',
      execute: function() {
        layers.splice(fromIndex, 1);
        layers.splice(toIndex, 0, layer);
      },
      undo: function() {
        layers.splice(toIndex, 1);
        layers.splice(fromIndex, 0, layer);
      }
    };
  },

  // Composite command (multiple operations)
  composite: function(commands, name) {
    return {
      name: name || 'Composite',
      execute: function() {
        for (var i = 0; i < commands.length; i++) {
          commands[i].execute();
        }
      },
      undo: function() {
        for (var i = commands.length - 1; i >= 0; i--) {
          commands[i].undo();
        }
      }
    };
  }
};
