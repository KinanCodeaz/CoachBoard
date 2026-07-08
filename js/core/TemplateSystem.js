'use strict';
// CoachBoard Pro - Template System
// Pre-built formations, drills, custom templates

var TemplateSystem = {
  _templates: [],
  _customTemplates: [],

  init: function() {
    this._loadBuiltInTemplates();
    this._loadCustomTemplates();
    return this;
  },

  // ============ BUILT-IN TEMPLATES ============
  _loadBuiltInTemplates: function() {
    this._templates = [
      // ============ FORMATIONS ============
      {
        id: 'formation_442',
        name: { en: '4-4-2 Formation', ar: ' formation 4-4-2', fr: 'Formation 4-4-2' },
        category: 'formation',
        sport: 'futsal',
        icon: '⚽',
        description: { en: 'Classic balanced formation', ar: 'تشكيل كلاسيكي متوازن', fr: 'Formation classique équilibrée' },
        elements: this._create442()
      },
      {
        id: 'formation_433',
        name: { en: '4-3-3 Formation', ar: ' formation 4-3-3', fr: 'Formation 4-3-3' },
        category: 'formation',
        sport: 'futsal',
        icon: '⚽',
        description: { en: 'Attacking formation', ar: 'تشكيل هجومي', fr: 'Formation offensive' },
        elements: this._create433()
      },
      {
        id: 'formation_352',
        name: { en: '3-5-2 Formation', ar: ' formation 3-5-2', fr: 'Formation 3-5-2' },
        category: 'formation',
        sport: 'futsal',
        icon: '⚽',
        description: { en: 'Midfield dominance', ar: 'سيطرة على الوسط', fr: 'Domination du milieu' },
        elements: this._create352()
      },
      {
        id: 'formation_532',
        name: { en: '5-3-2 Formation', ar: ' formation 5-3-2', fr: 'Formation 5-3-2' },
        category: 'formation',
        sport: 'futsal',
        icon: '⚽',
        description: { en: 'Defensive formation', ar: 'تشكيل دفاعي', fr: 'Formation défensive' },
        elements: this._create532()
      },
      // ============ FUTSAL ============
      {
        id: 'futsal_rotation',
        name: { en: 'Futsal Rotation', ar: 'دوران كرة القدم', fr: 'Rotation Futsal' },
        category: 'drill',
        sport: 'futsal',
        icon: '🔄',
        description: { en: 'Player rotation drill', ar: 'تمرين دوران اللاعبين', fr: 'Exercice de rotation' },
        elements: this._createFutsalRotation()
      },
      {
        id: 'futsal_pressing',
        name: { en: 'High Pressing', ar: 'ضغط عالي', fr: 'Pressing élevé' },
        category: 'drill',
        sport: 'futsal',
        icon: '🔥',
        description: { en: 'High press training', ar: 'تدريب الضغط العالي', fr: 'Entraînement pressing' },
        elements: this._createHighPressing()
      },
      // ============ BASKETBALL ============
      {
        id: 'basketball_offense',
        name: { en: 'Pick and Roll', ar: 'Pick and Roll', fr: 'Pick and Roll' },
        category: 'drill',
        sport: 'basketball',
        icon: '🏀',
        description: { en: 'Classic pick and roll', ar: 'كلاسيكي pick and roll', fr: 'Pick and roll classique' },
        elements: this._createBasketballPickRoll()
      },
      {
        id: 'basketball_zone',
        name: { en: '2-3 Zone Defense', ar: 'دفاع مناطقي 2-3', fr: 'Défense zone 2-3' },
        category: 'formation',
        sport: 'basketball',
        icon: '🏀',
        description: { en: 'Zone defense setup', ar: 'إعداد الدفاع المناطق', fr: 'Défense zone' },
        elements: this._createBasketballZone()
      },
      // ============ SOCCER ============
      {
        id: 'soccer_counter',
        name: { en: 'Counter Attack', ar: 'هجوم مرتدة', fr: 'Contre-attaque' },
        category: 'drill',
        sport: 'soccer',
        icon: '⚽',
        description: { en: 'Counter attack drill', ar: 'تمرين الهجوم المرتد', fr: 'Exercice contre-attaque' },
        elements: this._createSoccerCounter()
      },
      {
        id: 'soccer_setpiece',
        name: { en: 'Free Kick Setup', ar: 'إعداد ركلة حرة', fr: 'Coup franc' },
        category: 'setpiece',
        sport: 'soccer',
        icon: '⚽',
        description: { en: 'Free kick strategy', ar: 'استراتيجية الركلة الحرة', fr: 'Stratégie coup franc' },
        elements: this._createSoccerSetPiece()
      },
      // ============ VOLLEYBALL ============
      {
        id: 'volleyball_rotation',
        name: { en: 'Volleyball Rotation', ar: 'دوران الكرة الطائرة', fr: 'Rotation Volleyball' },
        category: 'formation',
        sport: 'volleyball',
        icon: '🏐',
        description: { en: 'Standard rotation', ar: 'دوران قياسي', fr: 'Rotation standard' },
        elements: this._createVolleyballRotation()
      },
      // ============ HANDBALL ============
      {
        id: 'handball_60',
        name: { en: '6-0 Defense', ar: 'دفاع 6-0', fr: 'Défense 6-0' },
        category: 'formation',
        sport: 'handball',
        icon: '🤾',
        description: { en: 'Flat defense line', ar: 'خط دفاع مستو', fr: 'Ligne de défense' },
        elements: this._createHandball60()
      }
    ];
  },

  // ============ FORMATION CREATORS ============
  _create442: function() {
    return [
      // GK
      { type: 'player', x: 400, y: 520, team: 'home', jerseyNumber: 1 },
      // Defenders
      { type: 'player', x: 200, y: 420, team: 'home', jerseyNumber: 2 },
      { type: 'player', x: 320, y: 440, team: 'home', jerseyNumber: 4 },
      { type: 'player', x: 480, y: 440, team: 'home', jerseyNumber: 5 },
      { type: 'player', x: 600, y: 420, team: 'home', jerseyNumber: 3 },
      // Midfielders
      { type: 'player', x: 200, y: 300, team: 'home', jerseyNumber: 7 },
      { type: 'player', x: 340, y: 320, team: 'home', jerseyNumber: 6 },
      { type: 'player', x: 460, y: 320, team: 'home', jerseyNumber: 8 },
      { type: 'player', x: 600, y: 300, team: 'home', jerseyNumber: 11 },
      // Forwards
      { type: 'player', x: 320, y: 180, team: 'home', jerseyNumber: 9 },
      { type: 'player', x: 480, y: 180, team: 'home', jerseyNumber: 10 }
    ];
  },

  _create433: function() {
    return [
      { type: 'player', x: 400, y: 520, team: 'home', jerseyNumber: 1 },
      { type: 'player', x: 200, y: 420, team: 'home', jerseyNumber: 2 },
      { type: 'player', x: 320, y: 440, team: 'home', jerseyNumber: 4 },
      { type: 'player', x: 480, y: 440, team: 'home', jerseyNumber: 5 },
      { type: 'player', x: 600, y: 420, team: 'home', jerseyNumber: 3 },
      { type: 'player', x: 260, y: 300, team: 'home', jerseyNumber: 6 },
      { type: 'player', x: 400, y: 280, team: 'home', jerseyNumber: 8 },
      { type: 'player', x: 540, y: 300, team: 'home', jerseyNumber: 7 },
      { type: 'player', x: 200, y: 160, team: 'home', jerseyNumber: 11 },
      { type: 'player', x: 400, y: 140, team: 'home', jerseyNumber: 9 },
      { type: 'player', x: 600, y: 160, team: 'home', jerseyNumber: 10 }
    ];
  },

  _create352: function() {
    return [
      { type: 'player', x: 400, y: 520, team: 'home', jerseyNumber: 1 },
      { type: 'player', x: 250, y: 440, team: 'home', jerseyNumber: 3 },
      { type: 'player', x: 400, y: 460, team: 'home', jerseyNumber: 4 },
      { type: 'player', x: 550, y: 440, team: 'home', jerseyNumber: 5 },
      { type: 'player', x: 120, y: 300, team: 'home', jerseyNumber: 2 },
      { type: 'player', x: 300, y: 320, team: 'home', jerseyNumber: 6 },
      { type: 'player', x: 400, y: 300, team: 'home', jerseyNumber: 8 },
      { type: 'player', x: 500, y: 320, team: 'home', jerseyNumber: 7 },
      { type: 'player', x: 680, y: 300, team: 'home', jerseyNumber: 11 },
      { type: 'player', x: 320, y: 160, team: 'home', jerseyNumber: 9 },
      { type: 'player', x: 480, y: 160, team: 'home', jerseyNumber: 10 }
    ];
  },

  _create532: function() {
    return [
      { type: 'player', x: 400, y: 520, team: 'home', jerseyNumber: 1 },
      { type: 'player', x: 120, y: 420, team: 'home', jerseyNumber: 2 },
      { type: 'player', x: 250, y: 440, team: 'home', jerseyNumber: 3 },
      { type: 'player', x: 400, y: 460, team: 'home', jerseyNumber: 4 },
      { type: 'player', x: 550, y: 440, team: 'home', jerseyNumber: 5 },
      { type: 'player', x: 680, y: 420, team: 'home', jerseyNumber: 6 },
      { type: 'player', x: 280, y: 300, team: 'home', jerseyNumber: 7 },
      { type: 'player', x: 400, y: 280, team: 'home', jerseyNumber: 8 },
      { type: 'player', x: 520, y: 300, team: 'home', jerseyNumber: 9 },
      { type: 'player', x: 320, y: 160, team: 'home', jerseyNumber: 10 },
      { type: 'player', x: 480, y: 160, team: 'home', jerseyNumber: 11 }
    ];
  },

  _createFutsalRotation: function() {
    return [
      { type: 'player', x: 400, y: 500, team: 'home', jerseyNumber: 1 },
      { type: 'player', x: 150, y: 350, team: 'home', jerseyNumber: 2 },
      { type: 'player', x: 300, y: 250, team: 'home', jerseyNumber: 3 },
      { type: 'player', x: 500, y: 250, team: 'home', jerseyNumber: 4 },
      { type: 'player', x: 650, y: 350, team: 'home', jerseyNumber: 5 },
      // Arrows showing rotation
      { type: 'arrow', x1: 150, y1: 350, x2: 300, y2: 250, color: '#ff0000' },
      { type: 'arrow', x1: 300, y1: 250, x2: 500, y2: 250, color: '#ff0000' },
      { type: 'arrow', x1: 500, y1: 250, x2: 650, y2: 350, color: '#ff0000' }
    ];
  },

  _createHighPressing: function() {
    return [
      { type: 'player', x: 400, y: 500, team: 'home', jerseyNumber: 1 },
      { type: 'player', x: 200, y: 380, team: 'home', jerseyNumber: 2 },
      { type: 'player', x: 350, y: 360, team: 'home', jerseyNumber: 3 },
      { type: 'player', x: 450, y: 360, team: 'home', jerseyNumber: 4 },
      { type: 'player', x: 600, y: 380, team: 'home', jerseyNumber: 5 },
      // Opponents
      { type: 'player', x: 250, y: 200, team: 'away', jerseyNumber: 6 },
      { type: 'player', x: 400, y: 180, team: 'away', jerseyNumber: 7 },
      { type: 'player', x: 550, y: 200, team: 'away', jerseyNumber: 8 },
      // Pressing arrows
      { type: 'arrow', x1: 200, y1: 380, x2: 250, y2: 200, color: '#ff0000' },
      { type: 'arrow', x1: 350, y1: 360, x2: 400, y2: 180, color: '#ff0000' },
      { type: 'arrow', x1: 450, y1: 360, x2: 550, y2: 200, color: '#ff0000' }
    ];
  },

  _createBasketballPickRoll: function() {
    return [
      { type: 'player', x: 200, y: 400, team: 'home', jerseyNumber: 1 },
      { type: 'player', x: 350, y: 300, team: 'home', jerseyNumber: 5 },
      { type: 'player', x: 500, y: 400, team: 'home', jerseyNumber: 2 },
      { type: 'player', x: 150, y: 200, team: 'home', jerseyNumber: 3 },
      { type: 'player', x: 650, y: 200, team: 'home', jerseyNumber: 4 },
      // Pick and roll arrow
      { type: 'arrow', x1: 350, y1: 300, x2: 400, y2: 200, color: '#ff0000' },
      { type: 'arrow', x1: 200, y1: 400, x2: 350, y2: 300, color: '#0000ff' }
    ];
  },

  _createBasketballZone: function() {
    return [
      // 2-3 Zone
      { type: 'player', x: 300, y: 150, team: 'home', jerseyNumber: 1 },
      { type: 'player', x: 500, y: 150, team: 'home', jerseyNumber: 2 },
      { type: 'player', x: 150, y: 300, team: 'home', jerseyNumber: 3 },
      { type: 'player', x: 400, y: 320, team: 'home', jerseyNumber: 4 },
      { type: 'player', x: 650, y: 300, team: 'home', jerseyNumber: 5 },
      // Zone outline
      { type: 'zone', x: 100, y: 100, w: 600, h: 280, color: 'rgba(0,100,255,0.2)' }
    ];
  },

  _createSoccerCounter: function() {
    return [
      { type: 'player', x: 100, y: 400, team: 'home', jerseyNumber: 1 },
      { type: 'player', x: 200, y: 300, team: 'home', jerseyNumber: 2 },
      { type: 'player', x: 300, y: 200, team: 'home', jerseyNumber: 3 },
      { type: 'player', x: 400, y: 100, team: 'home', jerseyNumber: 4 },
      { type: 'player', x: 500, y: 50, team: 'home', jerseyNumber: 5 },
      // Counter attack arrows
      { type: 'arrow', x1: 100, y1: 400, x2: 200, y2: 300, color: '#00ff00' },
      { type: 'arrow', x1: 200, y1: 300, x2: 300, y2: 200, color: '#00ff00' },
      { type: 'arrow', x1: 300, y1: 200, x2: 400, y2: 100, color: '#00ff00' },
      { type: 'arrow', x1: 400, y1: 100, x2: 500, y2: 50, color: '#00ff00' }
    ];
  },

  _createSoccerSetPiece: function() {
    return [
      // Wall
      { type: 'player', x: 280, y: 350, team: 'away', jerseyNumber: 2 },
      { type: 'player', x: 320, y: 350, team: 'away', jerseyNumber: 3 },
      { type: 'player', x: 360, y: 350, team: 'away', jerseyNumber: 4 },
      { type: 'player', x: 400, y: 350, team: 'away', jerseyNumber: 5 },
      // Kick taker
      { type: 'player', x: 250, y: 250, team: 'home', jerseyNumber: 10 },
      // Ball
      { type: 'ball', x: 260, y: 260 },
      // Target
      { type: 'player', x: 550, y: 450, team: 'home', jerseyNumber: 9 },
      // Arrow
      { type: 'arrow', x1: 260, y1: 260, x2: 550, y2: 450, color: '#ff0000' }
    ];
  },

  _createVolleyballRotation: function() {
    return [
      // Back row
      { type: 'player', x: 200, y: 450, team: 'home', jerseyNumber: 1 },
      { type: 'player', x: 400, y: 450, team: 'home', jerseyNumber: 6 },
      { type: 'player', x: 600, y: 450, team: 'home', jerseyNumber: 5 },
      // Front row
      { type: 'player', x: 200, y: 250, team: 'home', jerseyNumber: 4 },
      { type: 'player', x: 400, y: 250, team: 'home', jerseyNumber: 3 },
      { type: 'player', x: 600, y: 250, team: 'home', jerseyNumber: 2 },
      // Rotation arrows
      { type: 'arrow', x1: 200, y1: 450, x2: 200, y2: 250, color: '#ff0000' },
      { type: 'arrow', x1: 400, y1: 450, x2: 400, y2: 250, color: '#ff0000' },
      { type: 'arrow', x1: 600, y1: 450, x2: 600, y2: 250, color: '#ff0000' }
    ];
  },

  _createHandball60: function() {
    return [
      { type: 'player', x: 150, y: 400, team: 'home', jerseyNumber: 1 },
      { type: 'player', x: 250, y: 400, team: 'home', jerseyNumber: 2 },
      { type: 'player', x: 350, y: 400, team: 'home', jerseyNumber: 3 },
      { type: 'player', x: 450, y: 400, team: 'home', jerseyNumber: 4 },
      { type: 'player', x: 550, y: 400, team: 'home', jerseyNumber: 5 },
      { type: 'player', x: 650, y: 400, team: 'home', jerseyNumber: 6 },
      // Goalkeeper
      { type: 'player', x: 400, y: 500, team: 'home', jerseyNumber: 7 },
      // Zone
      { type: 'zone', x: 100, y: 350, w: 600, h: 100, color: 'rgba(0,100,255,0.2)' }
    ];
  },

  // ============ CUSTOM TEMPLATES ============
  _loadCustomTemplates: function() {
    try {
      var data = localStorage.getItem('cb_custom_templates');
      if (data) {
        this._customTemplates = JSON.parse(data);
      }
    } catch (e) {
      this._customTemplates = [];
    }
  },

  saveCustomTemplate: function(name, description, elements) {
    var template = {
      id: 'custom_' + Date.now(),
      name: { en: name, ar: name, fr: name },
      description: { en: description, ar: description, fr: description },
      category: 'custom',
      icon: '⭐',
      elements: JSON.parse(JSON.stringify(elements)),
      created: new Date().toISOString()
    };

    this._customTemplates.push(template);
    this._saveCustomTemplates();
    return template;
  },

  _saveCustomTemplates: function() {
    try {
      localStorage.setItem('cb_custom_templates', JSON.stringify(this._customTemplates));
    } catch (e) {}
  },

  deleteCustomTemplate: function(templateId) {
    for (var i = 0; i < this._customTemplates.length; i++) {
      if (this._customTemplates[i].id === templateId) {
        this._customTemplates.splice(i, 1);
        this._saveCustomTemplates();
        return true;
      }
    }
    return false;
  },

  // ============ APPLY TEMPLATE ============
  applyTemplate: function(templateId) {
    var template = this.getTemplate(templateId);
    if (!template) return false;

    // Clear existing elements
    if (typeof els !== 'undefined') {
      els.length = 0;
    }

    // Add template elements
    for (var i = 0; i < template.elements.length; i++) {
      var elDef = template.elements[i];
      var el = this._createElement(elDef);
      if (el && typeof els !== 'undefined') {
        els.push(el);
      }
    }

    // Trigger re-render
    if (typeof Engine !== 'undefined' && Engine.render) {
      Engine.render();
    }

    return true;
  },

  _createElement: function(def) {
    var base = {
      id: uid ? uid() : 'el_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      x: def.x || 0,
      y: def.y || 0,
      w: def.w || 40,
      h: def.h || 40,
      rotation: 0,
      opacity: 1,
      visible: true
    };

    if (def.type === 'player') {
      return Object.assign(base, {
        type: 'player',
        team: def.team || 'home',
        jerseyNumber: def.jerseyNumber || 0,
        label: def.label || '',
        color: def.team === 'away' ? '#cc0000' : '#0055aa'
      });
    } else if (def.type === 'ball') {
      return Object.assign(base, {
        type: 'ball',
        w: 30,
        h: 30
      });
    } else if (def.type === 'cone') {
      return Object.assign(base, {
        type: 'cone',
        w: 25,
        h: 25,
        color: '#ff6600'
      });
    } else if (def.type === 'goal') {
      return Object.assign(base, {
        type: 'goal',
        w: 120,
        h: 60,
        color: '#ffffff'
      });
    } else if (def.type === 'arrow') {
      return Object.assign(base, {
        type: 'arrow',
        x1: def.x1 || def.x,
        y1: def.y1 || def.y,
        x2: def.x2 || def.x + 100,
        y2: def.y2 || def.y,
        color: def.color || '#000000',
        lineWidth: 3
      });
    } else if (def.type === 'zone') {
      return Object.assign(base, {
        type: 'zone',
        x: def.x,
        y: def.y,
        w: def.w,
        h: def.h,
        color: def.color || 'rgba(0,100,255,0.2)'
      });
    }

    return base;
  },

  // ============ GET TEMPLATES ============
  getTemplate: function(templateId) {
    var all = this._templates.concat(this._customTemplates);
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === templateId) return all[i];
    }
    return null;
  },

  getTemplates: function(category, sport) {
    var all = this._templates.concat(this._customTemplates);
    var result = all;

    if (category) {
      result = result.filter(function(t) { return t.category === category; });
    }
    if (sport) {
      result = result.filter(function(t) { return t.sport === sport || !t.sport; });
    }

    return result;
  },

  getCategories: function() {
    return ['formation', 'drill', 'setpiece', 'custom'];
  },

  getSports: function() {
    return ['futsal', 'basketball', 'soccer', 'volleyball', 'handball'];
  }
};
