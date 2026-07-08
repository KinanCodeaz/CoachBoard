'use strict';
// CoachBoard Pro - Exercise Library
// Save, load, categorize, and search exercises

var ExerciseLibrary = {
  _exercises: [],
  _categories: ['passing', 'shooting', 'dribbling', 'defense', 'fitness', 'tactical', 'warmup', 'setpiece'],
  _difficulties: ['beginner', 'intermediate', 'advanced', 'professional'],

  init: function() {
    this._loadExercises();
    this._loadBuiltInExercises();
    return this;
  },

  // ============ BUILT-IN EXERCISES ============
  _loadBuiltInExercises: function() {
    var builtIn = [
      {
        id: 'ex_rondo',
        name: { en: 'Rondo 4v1', ar: 'رונدو 4 ضد 1', fr: 'Rondo 4c1' },
        category: 'passing',
        difficulty: 'intermediate',
        sport: 'futsal',
        duration: 10,
        players: 5,
        description: { en: 'Classic rondo for passing under pressure', ar: 'روندو كلاسيكي للتمرير تحت الضغط', fr: 'Rondo classique pour la passe sous pression' },
        coachingPoints: ['Quick decisions', 'Movement off the ball', 'Pressing intensity'],
        tags: ['passing', 'pressing', 'small space'],
        favorite: true,
        builtIn: true
      },
      {
        id: 'ex_shooting',
        name: { en: 'Shooting Drill', ar: 'تمرين التسديد', fr: 'Exercice de tir' },
        category: 'shooting',
        difficulty: 'beginner',
        sport: 'futsal',
        duration: 15,
        players: 2,
        description: { en: 'Basic shooting practice', ar: 'ممارسة التسديد الأساسية', fr: 'Pratique de tir de base' },
        coachingPoints: ['Follow through', 'Aim for corners', 'Body position'],
        tags: ['shooting', 'finishing'],
        favorite: false,
        builtIn: true
      },
      {
        id: 'ex_counter',
        name: { en: 'Counter Attack', ar: 'هجوم مرتدة', fr: 'Contre-attaque' },
        category: 'tactical',
        difficulty: 'advanced',
        sport: 'futsal',
        duration: 20,
        players: 10,
        description: { en: 'Fast break and counter attack patterns', ar: 'أنماط الهجوم السريع والمرتد', fr: 'Contre-attaque rapide' },
        coachingPoints: ['Speed of transition', 'Width in attack', 'Defensive recovery'],
        tags: ['tactical', 'transition', 'speed'],
        favorite: true,
        builtIn: true
      },
      {
        id: 'ex_possession',
        name: { en: 'Possession Game', ar: 'لعبة الاستحواذ', fr: 'Jeu de possession' },
        category: 'tactical',
        difficulty: 'intermediate',
        sport: 'futsal',
        duration: 15,
        players: 8,
        description: { en: 'Keep ball away from defenders', ar: 'إبقاء الكرة بعيداً عن المدافعين', fr: 'Garder le ballon loin des défenseurs' },
        coachingPoints: ['Create angles', 'Move the ball quickly', 'Patience in build-up'],
        tags: ['possession', 'passing', 'teamwork'],
        favorite: false,
        builtIn: true
      },
      {
        id: 'ex_agility',
        name: { en: 'Agility Ladder', ar: 'سلم maneuvari', fr: 'Échelle d\'agilité' },
        category: 'fitness',
        difficulty: 'beginner',
        sport: 'all',
        duration: 10,
        players: 1,
        description: { en: 'Footwork and coordination', ar: 'عمل القدم والتنسيق', fr: 'Travail de pieds et coordination' },
        coachingPoints: ['Quick feet', 'Stay on toes', 'Arm movement'],
        tags: ['agility', 'fitness', 'individual'],
        favorite: false,
        builtIn: true
      },
      {
        id: 'ex_1v1',
        name: { en: '1v1 Attacking', ar: 'هجوم 1 ضد 1', fr: '1c1 Attaque' },
        category: 'dribbling',
        difficulty: 'intermediate',
        sport: 'futsal',
        duration: 15,
        players: 2,
        description: { en: '1v1 moves and finishing', ar: 'حركات 1 ضد 1 والإنهاية', fr: 'Mouvements 1c1 et finition' },
        coachingPoints: ['Change of pace', 'Protect the ball', 'Commit the defender'],
        tags: ['1v1', 'dribbling', 'individual'],
        favorite: true,
        builtIn: true
      }
    ];

    var self = this;
    builtIn.forEach(function(ex) {
      if (!self._exercises.find(function(e) { return e.id === ex.id; })) {
        self._exercises.push(ex);
      }
    });
  },

  // ============ CRUD OPERATIONS ============
  addExercise: function(exercise) {
    var newEx = {
      id: 'ex_' + Date.now(),
      name: exercise.name || { en: 'New Exercise' },
      category: exercise.category || 'tactical',
      difficulty: exercise.difficulty || 'intermediate',
      sport: exercise.sport || 'futsal',
      duration: exercise.duration || 15,
      players: exercise.players || 2,
      description: exercise.description || { en: '' },
      coachingPoints: exercise.coachingPoints || [],
      tags: exercise.tags || [],
      pages: exercise.pages || [],
      favorite: false,
      builtIn: false,
      created: new Date().toISOString()
    };

    this._exercises.push(newEx);
    this._saveExercises();
    return newEx;
  },

  updateExercise: function(exerciseId, updates) {
    var ex = this.getExercise(exerciseId);
    if (!ex || ex.builtIn) return false;

    Object.assign(ex, updates);
    this._saveExercises();
    return true;
  },

  deleteExercise: function(exerciseId) {
    var ex = this.getExercise(exerciseId);
    if (!ex || ex.builtIn) return false;

    var idx = this._exercises.findIndex(function(e) { return e.id === exerciseId; });
    if (idx === -1) return false;

    this._exercises.splice(idx, 1);
    this._saveExercises();
    return true;
  },

  // ============ SEARCH & FILTER ============
  getExercise: function(exerciseId) {
    return this._exercises.find(function(e) { return e.id === exerciseId; }) || null;
  },

  getExercises: function(filters) {
    var result = this._exercises.slice();

    if (filters) {
      if (filters.category) {
        result = result.filter(function(e) { return e.category === filters.category; });
      }
      if (filters.difficulty) {
        result = result.filter(function(e) { return e.difficulty === filters.difficulty; });
      }
      if (filters.sport) {
        result = result.filter(function(e) { return e.sport === filters.sport || e.sport === 'all'; });
      }
      if (filters.search) {
        var search = filters.search.toLowerCase();
        result = result.filter(function(e) {
          var name = e.name.en ? e.name.en.toLowerCase() : '';
          var desc = e.description.en ? e.description.en.toLowerCase() : '';
          var tags = e.tags.join(' ').toLowerCase();
          return name.indexOf(search) !== -1 || desc.indexOf(search) !== -1 || tags.indexOf(search) !== -1;
        });
      }
      if (filters.favorite) {
        result = result.filter(function(e) { return e.favorite; });
      }
    }

    return result;
  },

  getCategories: function() {
    return this._categories.slice();
  },

  getDifficulties: function() {
    return this._difficulties.slice();
  },

  // ============ FAVORITES ============
  toggleFavorite: function(exerciseId) {
    var ex = this.getExercise(exerciseId);
    if (!ex) return false;

    ex.favorite = !ex.favorite;
    this._saveExercises();
    return ex.favorite;
  },

  // ============ IMPORT/EXPORT ============
  exportLibrary: function() {
    return JSON.stringify(this._exercises.filter(function(e) { return !e.builtIn; }), null, 2);
  },

  importLibrary: function(jsonString) {
    try {
      var exercises = JSON.parse(jsonString);
      if (!Array.isArray(exercises)) return false;

      var self = this;
      var imported = 0;
      exercises.forEach(function(ex) {
        if (!self._exercises.find(function(e) { return e.id === ex.id; })) {
          ex.builtIn = false;
          self._exercises.push(ex);
          imported++;
        }
      });

      this._saveExercises();
      return imported;
    } catch (e) {
      return false;
    }
  },

  // ============ PERSISTENCE ============
  _saveExercises: function() {
    try {
      localStorage.setItem('cb_exercises', JSON.stringify(this._exercises));
    } catch (e) {}
  },

  _loadExercises: function() {
    try {
      var data = localStorage.getItem('cb_exercises');
      if (data) {
        this._exercises = JSON.parse(data);
      }
    } catch (e) {
      this._exercises = [];
    }
  },

  // ============ UI ============
  createUI: function() {
    var panel = document.createElement('div');
    panel.id = 'exercise-panel';
    panel.className = 'panel';
    panel.style.cssText = 'position:fixed;top:60px;right:16px;width:350px;max-height:70vh;display:none;z-index:200;';

    var header = document.createElement('div');
    header.className = 'panel-header';
    header.style.cssText = 'background:linear-gradient(135deg,#8b5cf6,#6d28d9);';
    header.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;"><span>📚 Exercise Library</span><button onclick="ExerciseLibrary.toggleUI()" style="background:none;border:none;color:white;font-size:18px;cursor:pointer;">&times;</button></div>';
    panel.appendChild(header);

    // Search & Filter
    var filterDiv = document.createElement('div');
    filterDiv.style.cssText = 'padding:12px;border-bottom:1px solid var(--border);';
    filterDiv.innerHTML = '<input type="text" id="exSearch" placeholder="Search exercises..." style="width:100%;padding:8px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);margin-bottom:8px;" oninput="ExerciseLibrary._filterExercises()">' +
      '<div style="display:flex;gap:4px;">' +
      '<select id="exCategory" onchange="ExerciseLibrary._filterExercises()" style="flex:1;padding:6px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-size:11px;">' +
      '<option value="">All</option>' +
      '<option value="passing">Passing</option>' +
      '<option value="shooting">Shooting</option>' +
      '<option value="dribbling">Dribbling</option>' +
      '<option value="defense">Defense</option>' +
      '<option value="fitness">Fitness</option>' +
      '<option value="tactical">Tactical</option>' +
      '</select>' +
      '<select id="exDifficulty" onchange="ExerciseLibrary._filterExercises()" style="flex:1;padding:6px;border:1px solid var(--border);border-radius:6px;background:var(--bg);color:var(--text);font-size:11px;">' +
      '<option value="">All</option>' +
      '<option value="beginner">Beginner</option>' +
      '<option value="intermediate">Intermediate</option>' +
      '<option value="advanced">Advanced</option>' +
      '</select></div>';
    panel.appendChild(filterDiv);

    // Exercise list
    var list = document.createElement('div');
    list.id = 'exercise-list';
    list.style.cssText = 'overflow-y:auto;max-height:40vh;padding:8px;';
    panel.appendChild(list);

    // Footer
    var footer = document.createElement('div');
    footer.style.cssText = 'padding:12px;border-top:1px solid var(--border);display:flex;gap:8px;';
    footer.innerHTML = '<button class="btn-primary" style="flex:1;" onclick="ExerciseLibrary._createNew()">+ New</button>' +
      '<button class="btn-secondary" style="flex:1;" onclick="ExerciseLibrary._exportAll()">Export</button>';
    panel.appendChild(footer);

    document.body.appendChild(panel);
    return panel;
  },

  _filterExercises: function() {
    var search = (document.getElementById('exSearch') || {}).value || '';
    var category = (document.getElementById('exCategory') || {}).value || '';
    var difficulty = (document.getElementById('exDifficulty') || {}).value || '';

    var exercises = this.getExercises({
      search: search,
      category: category,
      difficulty: difficulty
    });

    this._renderList(exercises);
  },

  _renderList: function(exercises) {
    var list = document.getElementById('exercise-list');
    if (!list) return;

    list.innerHTML = '';

    if (exercises.length === 0) {
      list.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text-secondary);">No exercises found</div>';
      return;
    }

    var self = this;
    exercises.forEach(function(ex) {
      var item = document.createElement('div');
      item.style.cssText = 'padding:10px;margin:4px 0;border-radius:8px;background:var(--bg-tertiary);cursor:pointer;';

      var diffColor = { beginner: '#22c55e', intermediate: '#f59e0b', advanced: '#ef4444' };
      var color = diffColor[ex.difficulty] || '#666';

      item.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:start;">' +
        '<div style="flex:1;">' +
        '<div style="font-weight:600;">' + esc(ex.name.en || ex.name) + '</div>' +
        '<div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">' + esc(ex.category) + ' | ' + esc(ex.players) + ' players | ' + esc(ex.duration) + ' min</div>' +
        '<div style="margin-top:4px;"><span style="font-size:10px;padding:2px 6px;border-radius:4px;background:' + color + '20;color:' + color + ';">' + esc(ex.difficulty) + '</span></div>' +
        '</div>' +
        '<div style="display:flex;gap:4px;">' +
        '<button onclick="event.stopPropagation();ExerciseLibrary.toggleFavorite(\'' + ex.id + '\');ExerciseLibrary._filterExercises();" style="background:none;border:none;cursor:pointer;">' + (ex.favorite ? '⭐' : '☆') + '</button>' +
        '</div></div>';

      item.onclick = function() {
        self._showDetails(ex);
      };

      list.appendChild(item);
    });
  },

  _showDetails: function(exercise) {
    var modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'display:flex;';
    modal.innerHTML = '<div class="modal" style="max-width:450px;">' +
      '<div class="modal-header" style="background:linear-gradient(135deg,#8b5cf6,#6d28d9);color:white;">' + esc(exercise.name.en || exercise.name) + '</div>' +
      '<div class="modal-body">' +
      '<p><strong>Category:</strong> ' + esc(exercise.category) + '</p>' +
      '<p><strong>Difficulty:</strong> ' + esc(exercise.difficulty) + '</p>' +
      '<p><strong>Players:</strong> ' + esc(exercise.players) + '</p>' +
      '<p><strong>Duration:</strong> ' + esc(exercise.duration) + ' min</p>' +
      '<p><strong>Description:</strong> ' + esc(exercise.description && exercise.description.en ? exercise.description.en : (typeof exercise.description === 'string' ? exercise.description : '')) + '</p>' +
      '<p><strong>Coaching Points:</strong></p>' +
      '<ul>' + exercise.coachingPoints.map(function(p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ul>' +
      '</div>' +
      '<div class="modal-footer">' +
      '<button class="btn-secondary" onclick="this.closest(\'.modal-overlay\').remove()">Close</button>' +
      '</div></div>';

    modal.onclick = function(e) {
      if (e.target === modal) modal.remove();
    };

    document.body.appendChild(modal);
  },

  _createNew: function() {
    var name = prompt('Exercise name:');
    if (!name) return;

    this.addExercise({
      name: { en: name },
      category: 'tactical',
      difficulty: 'intermediate',
      sport: 'futsal'
    });

    this._filterExercises();
  },

  _exportAll: function() {
    var data = this.exportLibrary();
    var blob = new Blob([data], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'exercise_library.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  toggleUI: function() {
    var panel = document.getElementById('exercise-panel');
    if (!panel) {
      this.createUI();
      panel = document.getElementById('exercise-panel');
    }

    if (panel.style.display === 'none') {
      panel.style.display = 'block';
      this._filterExercises();
    } else {
      panel.style.display = 'none';
    }
  }
};
