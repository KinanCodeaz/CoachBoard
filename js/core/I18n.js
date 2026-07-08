'use strict';
// CoachBoard Pro - Internationalization (i18n)
// Arabic, French, English support

var I18n = {
  _currentLang: 'en',
  _translations: {},
  _listeners: [],

  init: function(lang) {
    this._loadTranslations();
    this._currentLang = lang || this._getStoredLang() || 'en';
    // Sync language selector if present
    var sel = document.getElementById('lsel');
    if (sel) sel.value = this._currentLang;
    return this;
  },

  _getStoredLang: function() {
    try {
      return localStorage.getItem('cb_language');
    } catch (e) {
      return null;
    }
  },

  _loadTranslations: function() {
    this._translations = {
      en: {
        // App
        'app.title': 'CoachBoard Pro',
        // Menu
        'menu.save': 'Save',
        'menu.open': 'Open',
        'menu.export': 'Export',
        'menu.templates': 'Templates',
        'menu.sessions': 'Sessions',
        'menu.exercises': 'Exercises',
        'menu.video': 'Video',
        // Tools
        'tool.select': 'Select',
        'tool.move': 'Move',
        'tool.player': 'Player',
        'tool.goalkeeper': 'Goalkeeper',
        'tool.ball': 'Ball',
        'tool.coach': 'Coach',
        'tool.cone': 'Cone',
        'tool.coneDisc': 'Disc Cone',
        'tool.coneTall': 'Tall Cone',
        'tool.ring': 'Ring',
        'tool.barrier': 'Barrier',
        'tool.hurdle': 'Hurdle',
        'tool.mannequin': 'Mannequin',
        'tool.smallGoal': 'Small Goal',
        'tool.flag': 'Flag',
        'tool.ladder': 'Ladder',
        'tool.stick': 'Stick',
        'tool.hurdleArc': 'Arc Hurdle',
        'tool.arrow': 'Arrow',
        'tool.freehand': 'Freehand',
        'tool.text': 'Text',
        'tool.zone': 'Zone',
        // Actions
        'action.undo': 'Undo',
        'action.redo': 'Redo',
        'action.zoomIn': 'Zoom In',
        'action.zoomOut': 'Zoom Out',
        'action.resetView': 'Reset View',
        'action.group': 'Group',
        'action.ungroup': 'Ungroup',
        'action.duplicate': 'Duplicate',
        'action.delete': 'Delete',
        // Sidebar
        'sidebar.players': 'Players',
        'sidebar.equipment': 'Equipment',
        'sidebar.drawing': 'Drawing',
        'sidebar.templates': 'Templates',
        // Properties
        'prop.position': 'Position',
        'prop.size': 'Size',
        'prop.rotation': 'Rotation',
        'prop.opacity': 'Opacity',
        'prop.team': 'Team',
        'prop.number': 'Number',
        'prop.color': 'Color',
        // Panels
        'panel.properties': 'Properties',
        'panel.layers': 'Layers',
        'panel.notes': 'Notes',
        // Bottom
        'bottom.play': 'Play',
        'bottom.saveScene': 'Save Scene',
        'bottom.update': 'Update',
        'bottom.elements': 'elements',
        // General
        'general.ok': 'OK',
        'general.cancel': 'Cancel',
        'general.delete': 'Delete',
        'general.save': 'Save',
        'general.load': 'Load',
        'general.close': 'Close',
        'general.apply': 'Apply',
        'general.name': 'Name',
        'general.type': 'Type',
        'general.team': 'Team',
        'general.home': 'Home',
        'general.away': 'Away',
        'general.number': 'Number',
        // Messages
        'msg.saved': 'Project saved',
        'msg.loaded': 'Project loaded',
        'msg.deleted': 'Deleted',
        'msg.confirmDelete': 'Are you sure you want to delete?',
        'msg.offline': 'You are offline',
        'msg.online': 'You are back online',
        'msg.gridSnap': 'Grid Snap',
        // Sports
        'sport.futsal': 'Futsal',
        'sport.football': 'Football',
        'sport.beach': 'Beach',
        'sport.mini': 'Mini',
        'sport.basketball': 'Basketball',
        'sport.volleyball': 'Volleyball',
        'sport.handball': 'Handball',
        // Orientation
        'orient.landscape': 'Landscape',
        'orient.portrait': 'Portrait',
        // Field Style
        'field.tactical': 'Tactical',
        'field.realistic': 'Realistic',
        'field.perspective': 'Perspective',
        // Team Manager
        'team.manager': 'Team Manager',
        'team.name': 'Team Name',
        'team.score': 'Score',
        // Export
        'export.image': 'Image',
        'export.video': 'Video',
        'export.json': 'JSON',
        'export.format': 'Format',
        'export.quality': 'Quality',
        'export.area': 'Export Area',
        'export.all': 'All',
        'export.custom': 'Custom',
        // Sessions
        'session.new': 'New Session',
        'session.name': 'Session Name',
        'session.duration': 'Duration',
        'session.intensity': 'Intensity',
        'session.warmup': 'Warm Up',
        'session.main': 'Main',
        'session.cooldown': 'Cool Down',
        // Exercises
        'exercise.search': 'Search exercises...',
        'exercise.category': 'Category',
        'exercise.difficulty': 'Difficulty',
        'exercise.beginner': 'Beginner',
        'exercise.intermediate': 'Intermediate',
        'exercise.advanced': 'Advanced',
        'exercise.players': 'players',
        'exercise.min': 'min',
        // Templates
        'template.apply': 'Apply',
        'template.save': 'Save as Template',
        'template.all': 'All',
        'template.formations': 'Formations',
        'template.drills': 'Drills',
        'template.setpieces': 'Set Pieces',
        'template.custom': 'Custom'
      },
      ar: {
        // App
        'app.title': 'لوحة المدرب',
        // Menu
        'menu.save': 'حفظ',
        'menu.open': 'فتح',
        'menu.export': 'تصدير',
        'menu.templates': 'قوالب',
        'menu.sessions': 'تدريبات',
        'menu.exercises': 'تمارين',
        'menu.video': 'فيديو',
        // Tools
        'tool.select': 'تحديد',
        'tool.move': 'تحريك',
        'tool.player': 'لاعب',
        'tool.goalkeeper': 'حارس',
        'tool.ball': 'كرة',
        'tool.coach': 'مدرب',
        'tool.cone': 'قمعة',
        'tool.coneDisc': 'قمعة مسطحة',
        'tool.coneTall': 'قمعة مرتفعة',
        'tool.ring': 'حلقة',
        'tool.barrier': 'حاجز',
        'tool.hurdle': 'عائق',
        'tool.mannequin': 'دمية',
        'tool.smallGoal': 'مرمى صغير',
        'tool.flag': 'علم',
        'tool.ladder': 'سلم',
        'tool.stick': 'عصا',
        'tool.hurdleArc': 'عائق منحني',
        'tool.arrow': 'سهم',
        'tool.freehand': 'رسوم حرة',
        'tool.text': 'نص',
        'tool.zone': 'منطقة',
        // Actions
        'action.undo': 'تراجع',
        'action.redo': 'إعادة',
        'action.zoomIn': 'تكبير',
        'action.zoomOut': 'تصغير',
        'action.resetView': 'إعادة تعيين',
        'action.group': 'تجميع',
        'action.ungroup': 'فك التجميع',
        'action.duplicate': 'تكرار',
        'action.delete': 'حذف',
        // Sidebar
        'sidebar.players': 'اللاعبون',
        'sidebar.equipment': 'المعدات',
        'sidebar.drawing': 'الرسم',
        'sidebar.templates': 'القوالب',
        // Properties
        'prop.position': 'الموضع',
        'prop.size': 'الحجم',
        'prop.rotation': 'الدوران',
        'prop.opacity': 'الشفافية',
        'prop.team': 'الفريق',
        'prop.number': 'الرقم',
        'prop.color': 'اللون',
        // Panels
        'panel.properties': 'الخصائص',
        'panel.layers': 'الطبقات',
        'panel.notes': 'ملاحظات',
        // Bottom
        'bottom.play': 'تشغيل',
        'bottom.saveScene': 'حفظ مشهد',
        'bottom.update': 'تحديث',
        'bottom.elements': 'عناصر',
        // General
        'general.ok': 'موافق',
        'general.cancel': 'إلغاء',
        'general.delete': 'حذف',
        'general.save': 'حفظ',
        'general.load': 'تحميل',
        'general.close': 'إغلاق',
        'general.apply': 'تطبيق',
        'general.name': 'الاسم',
        'general.type': 'النوع',
        'general.team': 'الفريق',
        'general.home': 'المنزل',
        'general.away': 'الخارج',
        'general.number': 'الرقم',
        // Messages
        'msg.saved': 'تم حفظ المشروع',
        'msg.loaded': 'تم تحميل المشروع',
        'msg.deleted': 'تم الحذف',
        'msg.confirmDelete': 'هل أنت متأكد من الحذف؟',
        'msg.offline': 'أنت غير متصل',
        'msg.online': 'أنت متصل الآن',
        'msg.gridSnap': 'محاذاة الشبكة',
        // Sports
        'sport.futsal': 'فوتسال',
        'sport.football': 'كرة قدم',
        'sport.beach': 'شاطئية',
        'sport.mini': 'مصغرة',
        'sport.basketball': 'سلة',
        'sport.volleyball': 'طائرة',
        'sport.handball': 'يد',
        // Orientation
        'orient.landscape': 'أفقي',
        'orient.portrait': 'عمودي',
        // Field Style
        'field.tactical': 'تكتيكي',
        'field.realistic': 'واقعي',
        'field.perspective': 'منظور',
        // Team Manager
        'team.manager': 'إدارة الفرق',
        'team.name': 'اسم الفريق',
        'team.score': 'النتيجة',
        // Export
        'export.image': 'صورة',
        'export.video': 'فيديو',
        'export.json': 'JSON',
        'export.format': 'الصيغة',
        'export.quality': 'الجودة',
        'export.area': 'منطقة التصدير',
        'export.all': 'الكل',
        'export.custom': 'مخصص',
        // Sessions
        'session.new': 'تدريب جديد',
        'session.name': 'اسم التدريب',
        'session.duration': 'المدة',
        'session.intensity': 'الشدة',
        'session.warmup': 'إحماء',
        'session.main': 'رئيسي',
        'session.cooldown': 'تهدئة',
        // Exercises
        'exercise.search': 'بحث عن تمارين...',
        'exercise.category': 'الفئة',
        'exercise.difficulty': 'الصعوبة',
        'exercise.beginner': 'مبتدئ',
        'exercise.intermediate': 'متوسط',
        'exercise.advanced': 'متقدم',
        'exercise.players': 'لاعبين',
        'exercise.min': 'دقيقة',
        // Templates
        'template.apply': 'تطبيق',
        'template.save': 'حفظ كقالب',
        'template.all': 'الكل',
        'template.formations': 'تشكيلات',
        'template.drills': 'تمارين',
        'template.setpieces': 'ركائل حرة',
        'template.custom': 'مخصص'
      },
      fr: {
        // App
        'app.title': 'CoachBoard Pro',
        // Menu
        'menu.save': 'Enregistrer',
        'menu.open': 'Ouvrir',
        'menu.export': 'Exporter',
        'menu.templates': 'Modèles',
        'menu.sessions': 'Séances',
        'menu.exercises': 'Exercices',
        'menu.video': 'Vidéo',
        // Tools
        'tool.select': 'Sélection',
        'tool.move': 'Déplacer',
        'tool.player': 'Joueur',
        'tool.goalkeeper': 'Gardien',
        'tool.ball': 'Ballon',
        'tool.coach': 'Entraîneur',
        'tool.cone': 'Cône',
        'tool.coneDisc': 'Cône disque',
        'tool.coneTall': 'Cône haut',
        'tool.ring': 'Anneau',
        'tool.barrier': 'Barrière',
        'tool.hurdle': 'Haie',
        'tool.mannequin': 'Mannequin',
        'tool.smallGoal': 'Petit but',
        'tool.flag': 'Drapeau',
        'tool.ladder': 'Échelle',
        'tool.stick': 'Bâton',
        'tool.hurdleArc': 'Haie arc',
        'tool.arrow': 'Flèche',
        'tool.freehand': 'Main levée',
        'tool.text': 'Texte',
        'tool.zone': 'Zone',
        'tool.reactionBall': 'Ballon réaction',
        'tool.pole': 'Poteau',
        'tool.spotlight': 'Éclairage',
        'tool.poszone': 'Zone position',
        'tool.link': 'Lien',
        // Actions
        'action.undo': 'Annuler',
        'action.redo': 'Rétablir',
        'action.zoomIn': 'Zoom avant',
        'action.zoomOut': 'Zoom arrière',
        'action.resetView': 'Réinitialiser',
        'action.group': 'Grouper',
        'action.ungroup': 'Dégrouper',
        'action.duplicate': 'Dupliquer',
        'action.delete': 'Supprimer',
        'action.save': 'Enregistrer',
        'action.load': 'Charger',
        'action.export': 'Exporter',
        'action.newProject': 'Nouveau projet',
        'action.clearAll': 'Tout effacer',
        // Sidebar
        'sidebar.players': 'Joueurs',
        'sidebar.equipment': 'Équipement',
        'sidebar.drawing': 'Dessin',
        'sidebar.templates': 'Modèles',
        // Properties
        'prop.position': 'Position',
        'prop.size': 'Taille',
        'prop.rotation': 'Rotation',
        'prop.opacity': 'Opacité',
        'prop.team': 'Équipe',
        'prop.number': 'Numéro',
        'prop.color': 'Couleur',
        // Panels
        'panel.properties': 'Propriétés',
        'panel.layers': 'Calques',
        'panel.notes': 'Notes',
        'panel.tools': 'Outils',
        'panel.pages': 'Pages',
        'panel.versions': 'Historique',
        // Bottom
        'bottom.play': 'Jouer',
        'bottom.saveScene': 'Enregistrer scène',
        'bottom.update': 'Mettre à jour',
        'bottom.elements': 'éléments',
        // General
        'general.ok': 'OK',
        'general.cancel': 'Annuler',
        'general.delete': 'Supprimer',
        'general.save': 'Enregistrer',
        'general.load': 'Charger',
        'general.close': 'Fermer',
        'general.apply': 'Appliquer',
        'general.name': 'Nom',
        'general.type': 'Type',
        'general.team': 'Équipe',
        'general.home': 'Domicile',
        'general.away': 'Extérieur',
        'general.number': 'Numéro',
        // Messages
        'msg.saved': 'Projet enregistré',
        'msg.loaded': 'Projet chargé',
        'msg.deleted': 'Supprimé',
        'msg.confirmDelete': 'Êtes-vous sûr de vouloir supprimer ?',
        'msg.offline': 'Vous êtes hors ligne',
        'msg.online': 'Vous êtes en ligne',
        'msg.gridSnap': 'Aligner sur la grille',
        // Sports
        'sport.futsal': 'Futsal',
        'sport.football': 'Football',
        'sport.beach': 'Beach',
        'sport.mini': 'Mini',
        'sport.basketball': 'Basketball',
        'sport.volleyball': 'Volleyball',
        'sport.handball': 'Handball',
        // Orientation
        'orient.landscape': 'Paysage',
        'orient.portrait': 'Portrait',
        // Field Style
        'field.tactical': 'Tactique',
        'field.realistic': 'Réaliste',
        'field.perspective': 'Perspective',
        // Team Manager
        'team.manager': 'Gestion d\'équipe',
        'team.name': 'Nom d\'équipe',
        'team.score': 'Score',
        // Export
        'export.image': 'Image',
        'export.video': 'Vidéo',
        'export.json': 'JSON',
        'export.format': 'Format',
        'export.quality': 'Qualité',
        'export.area': 'Zone d\'export',
        'export.all': 'Tout',
        'export.custom': 'Personnalisé',
        // Sessions
        'session.new': 'Nouvelle séance',
        'session.name': 'Nom de la séance',
        'session.duration': 'Durée',
        'session.intensity': 'Intensité',
        'session.warmup': 'Échauffement',
        'session.main': 'Principal',
        'session.cooldown': 'Récupération',
        // Exercises
        'exercise.search': 'Rechercher des exercices...',
        'exercise.category': 'Catégorie',
        'exercise.difficulty': 'Difficulté',
        'exercise.beginner': 'Débutant',
        'exercise.intermediate': 'Intermédiaire',
        'exercise.advanced': 'Avancé',
        'exercise.players': 'joueurs',
        'exercise.min': 'min',
        // Templates
        'template.apply': 'Appliquer',
        'template.save': 'Enregistrer comme modèle',
        'template.all': 'Tout',
        'template.formations': 'Formations',
        'template.drills': 'Exercices',
        'template.setpieces': 'Coups francs',
        'template.custom': 'Personnalisé'
      }
    };
  },

  // ============ TRANSLATE ============
  t: function(key, params) {
    var lang = this._translations[this._currentLang];
    var fallback = this._translations['en'];

    var text = (lang && lang[key]) || (fallback && fallback[key]) || key;

    // Replace params
    if (params) {
      for (var param in params) {
        text = text.replace('{' + param + '}', params[param]);
      }
    }

    return text;
  },

  // ============ LANGUAGE ============
  setLanguage: function(lang) {
    if (this._translations[lang]) {
      this._currentLang = lang;
      try {
        localStorage.setItem('cb_language', lang);
      } catch (e) {}

      // Update document direction for RTL
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;

      // Sync language selector
      var sel = document.getElementById('lsel');
      if (sel) sel.value = lang;

      // Notify listeners
      for (var i = 0; i < this._listeners.length; i++) {
        this._listeners[i](lang);
      }

      if (typeof EventBus !== 'undefined') {
        EventBus.emit('language:changed', { language: lang });
      }

      return true;
    }
    return false;
  },

  getLanguage: function() {
    return this._currentLang;
  },

  getAvailableLanguages: function() {
    return [
      { code: 'en', name: 'English', native: 'English' },
      { code: 'ar', name: 'Arabic', native: 'العربية' },
      { code: 'fr', name: 'French', native: 'Français' }
    ];
  },

  // ============ LISTENERS ============
  onLanguageChange: function(callback) {
    this._listeners.push(callback);
  },

  // ============ UI HELPERS ============
  // Create language selector
  createLanguageSelector: function() {
    var select = document.createElement('select');
    select.id = 'lang-selector';
    select.style.cssText = 'padding:4px 8px;border:1px solid var(--border);border-radius:4px;background:var(--bg);color:var(--text);font-size:12px;';

    var langs = this.getAvailableLanguages();
    for (var i = 0; i < langs.length; i++) {
      var option = document.createElement('option');
      option.value = langs[i].code;
      option.textContent = langs[i].native;
      if (langs[i].code === this._currentLang) {
        option.selected = true;
      }
      select.appendChild(option);
    }

    var self = this;
    select.onchange = function() {
      self.setLanguage(this.value);
    };

    return select;
  },

  // Translate all elements with data-i18n attribute
  translatePage: function() {
    var elements = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < elements.length; i++) {
      var el = elements[i];
      var key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    }

    var placeholders = document.querySelectorAll('[data-i18n-placeholder]');
    for (var i = 0; i < placeholders.length; i++) {
      var el = placeholders[i];
      var key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    }
  }
};
