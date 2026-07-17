/**
 * CoachBoard Pro - Feedback Page Script
 * Anti-spam: Math CAPTCHA, honeypot, rate limiting, keyword filter
 * Storage: localStorage (replace with backend API for production)
 */
(function() {
  'use strict';

  // ==================== CONFIGURATION ====================
  var CONFIG = {
    MAX_PER_HOUR: 3,          // Max submissions per browser per hour
    MIN_INTERVAL_MS: 30000,   // Min 30 seconds between submissions
    MAX_MSG_LEN: 2000,        // Max message length
    MIN_MSG_LEN: 10,          // Min message length
    MAX_NAME_LEN: 60,         // Max name length
    STORAGE_KEY: 'cb_feedback',
    RATE_KEY: 'cb_feedback_rate',
    // Spam keywords (basic filter - extend as needed)
    SPAM_WORDS: [
      'viagra', 'cialis', 'casino', 'poker', 'lottery', 'bitcoin',
      'crypto', 'forex', 'click here', 'free money', 'buy now',
      'subscribe now', 'limited offer', 'earn money', 'work from home',
      'weight loss', 'pill', 'discount', 'cheap', 'order now'
    ],
    // Backend endpoint (replace with real API)
    // BACKEND_URL: 'https://your-api.com/feedback',
    BACKEND_URL: null
  };

  // ==================== CAPTCHA STATE ====================
  var captcha = { a: 0, b: 0, op: '+', answer: 0 };

  // ==================== DOM READY ====================
  document.addEventListener('DOMContentLoaded', function() {
    initForm();
    generateCaptcha();
    loadPreviousFeedback();
  });

  // ==================== INIT ====================
  function initForm() {
    var form = document.getElementById('fbForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      handleSubmit();
    });

    // Character counter for message
    var msgField = document.getElementById('fbMessage');
    if (msgField) {
      msgField.addEventListener('input', function() {
        var cnt = this.value.length;
        var counter = document.getElementById('fbCharCount');
        if (counter) {
          counter.textContent = cnt + ' / ' + CONFIG.MAX_MSG_LEN;
          counter.style.color = cnt > CONFIG.MAX_MSG_LEN * 0.9 ? '#f85149' : '';
        }
        if (cnt > CONFIG.MAX_MSG_LEN) {
          this.value = this.value.substring(0, CONFIG.MAX_MSG_LEN);
        }
      });
    }

    // Refresh captcha button
    var refreshBtn = document.getElementById('fbCaptchaRefresh');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', function() {
        generateCaptcha();
      });
    }

    // Clear errors on input
    ['fbName', 'fbEmail', 'fbMessage', 'fbCaptchaAnswer'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('input', function() {
          clearError(id);
        });
      }
    });

    // Check rate limit on load
    checkRateLimitUI();
  }

  // ==================== CAPTCHA ====================
  function generateCaptcha() {
    var ops = ['+', '-', '\u00D7'];
    captcha.op = ops[Math.floor(Math.random() * ops.length)];
    
    if (captcha.op === '+') {
      captcha.a = Math.floor(Math.random() * 20) + 1;
      captcha.b = Math.floor(Math.random() * 20) + 1;
      captcha.answer = captcha.a + captcha.b;
    } else if (captcha.op === '-') {
      captcha.a = Math.floor(Math.random() * 20) + 10;
      captcha.b = Math.floor(Math.random() * 10) + 1;
      captcha.answer = captcha.a - captcha.b;
    } else {
      captcha.a = Math.floor(Math.random() * 9) + 2;
      captcha.b = Math.floor(Math.random() * 9) + 2;
      captcha.answer = captcha.a * captcha.b;
    }

    var qEl = document.getElementById('fbCaptchaQuestion');
    if (qEl) {
      qEl.textContent = captcha.a + ' ' + captcha.op + ' ' + captcha.b + ' = ?';
    }
    var input = document.getElementById('fbCaptchaAnswer');
    if (input) input.value = '';
  }

  // ==================== VALIDATION ====================
  function validateForm() {
    var valid = true;

    // Honeypot check (bots fill hidden fields)
    var hp = document.getElementById('fbWebsite');
    if (hp && hp.value.length > 0) {
      // Silently reject - don't tell the bot why
      return false;
    }

    // Name validation
    var name = val('fbName');
    if (!name || name.length < 2) {
      showError('fbName', getNameRequiredMsg());
      valid = false;
    } else if (name.length > CONFIG.MAX_NAME_LEN) {
      showError('fbName', getMsg('nameTooLong'));
      valid = false;
    } else if (isSpamText(name)) {
      showError('fbName', getMsg('spamDetected'));
      valid = false;
    }

    // Email validation
    var email = val('fbEmail');
    if (!email || !isValidEmail(email)) {
      showError('fbEmail', getMsg('invalidEmail'));
      valid = false;
    }

    // Feedback type
    var type = val('fbType');
    if (!type) {
      valid = false;
    }

    // Message validation
    var msg = val('fbMessage');
    if (!msg || msg.length < CONFIG.MIN_MSG_LEN) {
      showError('fbMessage', getMsg('msgTooShort'));
      valid = false;
    } else if (msg.length > CONFIG.MAX_MSG_LEN) {
      showError('fbMessage', getMsg('msgTooLong'));
      valid = false;
    } else if (isSpamText(msg)) {
      showError('fbMessage', getMsg('spamDetected'));
      valid = false;
    }

    // CAPTCHA validation
    var captchaInput = val('fbCaptchaAnswer');
    if (!captchaInput || parseInt(captchaInput, 10) !== captcha.answer) {
      showError('fbCaptchaAnswer', getMsg('captchaWrong'));
      generateCaptcha();
      valid = false;
    }

    // Rate limiting
    if (!checkRateLimit()) {
      valid = false;
    }

    return valid;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isSpamText(text) {
    var lower = text.toLowerCase();
    for (var i = 0; i < CONFIG.SPAM_WORDS.length; i++) {
      if (lower.indexOf(CONFIG.SPAM_WORDS[i]) >= 0) return true;
    }
    // Check for excessive links
    var urlCount = (text.match(/https?:\/\//g) || []).length;
    if (urlCount > 2) return true;
    // Check for excessive caps
    if (text.length > 20 && text === text.toUpperCase() && /[A-Z]/.test(text)) return true;
    return false;
  }

  // ==================== RATE LIMITING ====================
  function checkRateLimit() {
    var now = Date.now();
    var rateData = getRateData();

    // Check minimum interval
    if (rateData.lastSubmit && (now - rateData.lastSubmit) < CONFIG.MIN_INTERVAL_MS) {
      showRateLimitMsg(getMsg('tooFast'));
      return false;
    }

    // Check hourly limit
    var oneHourAgo = now - 3600000;
    rateData.submissions = rateData.submissions.filter(function(t) { return t > oneHourAgo; });
    if (rateData.submissions.length >= CONFIG.MAX_PER_HOUR) {
      showRateLimitMsg(getMsg('hourlyLimit'));
      return false;
    }

    return true;
  }

  function recordSubmission() {
    var now = Date.now();
    var rateData = getRateData();
    rateData.submissions.push(now);
    rateData.lastSubmit = now;
    try { localStorage.setItem(CONFIG.RATE_KEY, JSON.stringify(rateData)); } catch(e) {}
  }

  function getRateData() {
    try {
      var d = JSON.parse(localStorage.getItem(CONFIG.RATE_KEY));
      if (d && d.submissions) return d;
    } catch(e) {}
    return { submissions: [], lastSubmit: 0 };
  }

  function checkRateLimitUI() {
    var rateData = getRateData();
    var now = Date.now();
    var oneHourAgo = now - 3600000;
    rateData.submissions = rateData.submissions.filter(function(t) { return t > oneHourAgo; });
    if (rateData.submissions.length >= CONFIG.MAX_PER_HOUR) {
      showRateLimitMsg(getMsg('hourlyLimit'));
    }
  }

  function showRateLimitMsg(msg) {
    var el = document.getElementById('fbRateLimit');
    if (el) {
      el.textContent = '';
      var icon = document.createElement('i');
      icon.className = 'fas fa-exclamation-triangle';
      el.appendChild(icon);
      el.appendChild(document.createTextNode(' ' + msg));
      el.classList.add('show');
    }
  }

  function hideRateLimitMsg() {
    var el = document.getElementById('fbRateLimit');
    if (el) el.classList.remove('show');
  }

  // ==================== SUBMIT ====================
  function handleSubmit() {
    hideRateLimitMsg();

    if (!validateForm()) return;

    var data = {
      name: val('fbName').trim(),
      email: val('fbEmail').trim().toLowerCase(),
      type: val('fbType') || 'general',
      message: val('fbMessage').trim(),
      date: new Date().toISOString(),
      userAgent: navigator.userAgent.substring(0, 100),
      lang: navigator.language
    };

    // Disable submit button
    var btn = document.getElementById('fbSubmitBtn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> ' + getMsg('sending');
    }

    if (CONFIG.BACKEND_URL) {
      // Production: Send to backend API
      sendToBackend(data);
    } else {
      // Demo: Store locally
      setTimeout(function() {
        saveLocally(data);
        recordSubmission();
        showSuccess();
        resetForm();
        loadPreviousFeedback();
      }, 800); // Simulate network delay
    }
  }

  function sendToBackend(data) {
    fetch(CONFIG.BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function(res) {
      if (!res.ok) throw new Error('Server error');
      return res.json();
    }).then(function() {
      recordSubmission();
      showSuccess();
      resetForm();
    }).catch(function(err) {
      showError('fbMessage', getMsg('serverError') + ': ' + err.message);
      var btn = document.getElementById('fbSubmitBtn');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> ' + getMsg('submitBtn');
      }
    });
  }

  function saveLocally(data) {
    try {
      var items = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
      items.unshift(data);
      // Keep last 100 entries
      if (items.length > 100) items = items.slice(0, 100);
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(items));
    } catch(e) {}
  }

  // ==================== UI HELPERS ====================
  function showSuccess() {
    var form = document.getElementById('fbForm');
    var success = document.getElementById('fbSuccess');
    if (form) form.style.display = 'none';
    if (success) success.classList.add('show');
  }

  function resetForm() {
    var form = document.getElementById('fbForm');
    if (form) {
      form.reset();
      form.style.display = '';
    }
    var success = document.getElementById('fbSuccess');
    if (success) success.classList.remove('show');
    var btn = document.getElementById('fbSubmitBtn');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> ' + getMsg('submitBtn');
    }
    generateCaptcha();
    hideRateLimitMsg();
    // Clear all errors
    ['fbName', 'fbEmail', 'fbMessage', 'fbCaptchaAnswer'].forEach(clearError);
    // Reset char counter
    var counter = document.getElementById('fbCharCount');
    if (counter) counter.textContent = '0 / ' + CONFIG.MAX_MSG_LEN;
  }

  function showError(fieldId, msg) {
    var field = document.getElementById(fieldId);
    var errEl = document.getElementById(fieldId + 'Error');
    if (field) field.classList.add('error');
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.add('show');
    }
  }

  function clearError(fieldId) {
    var field = document.getElementById(fieldId);
    var errEl = document.getElementById(fieldId + 'Error');
    if (field) field.classList.remove('error');
    if (errEl) errEl.classList.remove('show');
  }

  function val(id) {
    var el = document.getElementById(id);
    return el ? el.value : '';
  }

  function getNameRequiredMsg() {
    return getMsg('nameRequired');
  }

  // ==================== LOAD PREVIOUS FEEDBACK ====================
  function loadPreviousFeedback() {
    var container = document.getElementById('fbPrevList');
    if (!container) return;

    var items;
    try {
      items = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
    } catch(e) { items = []; }

    if (!items.length) {
      container.innerHTML = '<div class="fb-prev-empty"><i class="fas fa-comment-slash"></i>' + getMsg('noFeedback') + '</div>';
      return;
    }

    var h = '';
    var show = items.slice(0, 10); // Show last 10
    for (var i = 0; i < show.length; i++) {
      var item = show[i];
      var typeClass = ['suggestion', 'bug', 'feature'].indexOf(item.type) >= 0 ? item.type : 'general';
      var typeLabel = { suggestion: getMsg('typeSuggestion'), bug: getMsg('typeBug'), feature: getMsg('typeFeature'), general: getMsg('typeGeneral') };
      var dateStr = item.date ? new Date(item.date).toLocaleDateString() : '';
      h += '<div class="fb-prev-item">';
      h += '<div class="fb-prev-meta"><span class="fb-prev-name">' + escapeHtml(item.name) + '</span>';
      h += '<span class="fb-prev-date">' + escapeHtml(dateStr) + '</span></div>';
      h += '<span class="fb-prev-type ' + typeClass + '">' + (typeLabel[item.type] || typeLabel.general) + '</span>';
      h += '<div class="fb-prev-text">' + escapeHtml(item.message) + '</div>';
      h += '</div>';
    }
    if (items.length > 10) {
      h += '<div style="text-align:center;padding:8px;font-size:11px;color:var(--text3)">(' + items.length + ' ' + getMsg('totalFeedback') + ')</div>';
    }
    container.innerHTML = h;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ==================== i18n MESSAGES ====================
  var MSG = {
    ar: {
      nameRequired: 'الرجاء إدخال الاسم',
      nameTooLong: 'الاسم طويل جداً',
      invalidEmail: 'البريد الإلكتروني غير صالح',
      msgTooShort: 'الرسالة قصيرة جداً (10 أحرف على الأقل)',
      msgTooLong: 'الرسالة طويلة جداً',
      spamDetected: 'تم رفض المحتوى - يبدو كسبام',
      captchaWrong: 'إجابة الكابتشا غير صحيحة',
      tooFast: 'الرجاء الانتظار 30 ثانية بين الإرسال',
      hourlyLimit: 'تجاوزت الحد الأقصى (3 رسائل/ساعة). حاول لاحقاً',
      sending: 'جاري الإرسال...',
      submitBtn: 'إرسال الاقتراح',
      serverError: 'خطأ في الخادم',
      noFeedback: 'لا توجد اقتراحات بعد - كن الأول!',
      typeSuggestion: 'اقتراح',
      typeBug: 'مشكلة',
      typeFeature: 'ميزة جديدة',
      typeGeneral: 'عام',
      totalFeedback: 'إجمالي الاقتراحات'
    },
    en: {
      nameRequired: 'Please enter your name',
      nameTooLong: 'Name is too long',
      invalidEmail: 'Invalid email address',
      msgTooShort: 'Message too short (min 10 characters)',
      msgTooLong: 'Message too long',
      spamDetected: 'Content rejected - appears to be spam',
      captchaWrong: 'Incorrect CAPTCHA answer',
      tooFast: 'Please wait 30 seconds between submissions',
      hourlyLimit: 'Hourly limit reached (3/hour). Try later',
      sending: 'Sending...',
      submitBtn: 'Send Feedback',
      serverError: 'Server error',
      noFeedback: 'No feedback yet - be the first!',
      typeSuggestion: 'Suggestion',
      typeBug: 'Bug Report',
      typeFeature: 'Feature Request',
      typeGeneral: 'General',
      totalFeedback: 'total feedback'
    },
    fr: {
      nameRequired: 'Veuillez entrer votre nom',
      nameTooLong: 'Nom trop long',
      invalidEmail: 'Email invalide',
      msgTooShort: 'Message trop court (min 10 caractères)',
      msgTooLong: 'Message trop long',
      spamDetected: 'Contenu rejeté - semble être du spam',
      captchaWrong: 'Réponse CAPTCHA incorrecte',
      tooFast: 'Veuillez attendre 30 secondes',
      hourlyLimit: 'Limite horaire atteinte (3/heure)',
      sending: 'Envoi...',
      submitBtn: 'Envoyer',
      serverError: 'Erreur serveur',
      noFeedback: 'Aucun avis - soyez le premier!',
      typeSuggestion: 'Suggestion',
      typeBug: 'Bug',
      typeFeature: 'Fonctionnalité',
      typeGeneral: 'Général',
      totalFeedback: 'avis total'
    },
    es: {
      nameRequired: 'Ingrese su nombre',
      nameTooLong: 'Nombre demasiado largo',
      invalidEmail: 'Email inválido',
      msgTooShort: 'Mensaje muy corto (mín 10 caracteres)',
      msgTooLong: 'Mensaje muy largo',
      spamDetected: 'Contenido rechazado - parece spam',
      captchaWrong: 'Respuesta CAPTCHA incorrecta',
      tooFast: 'Espere 30 segundos entre envíos',
      hourlyLimit: 'Límite horario alcanzado (3/hora)',
      sending: 'Enviando...',
      submitBtn: 'Enviar',
      serverError: 'Error del servidor',
      noFeedback: 'Sin comentarios - sea el primero!',
      typeSuggestion: 'Sugerencia',
      typeBug: 'Error',
      typeFeature: 'Función',
      typeGeneral: 'General',
      totalFeedback: 'comentarios totales'
    },
    de: {
      nameRequired: 'Bitte Name eingeben',
      nameTooLong: 'Name zu lang',
      invalidEmail: 'Ungültige E-Mail',
      msgTooShort: 'Nachricht zu kurz (min 10 Zeichen)',
      msgTooLong: 'Nachricht zu lang',
      spamDetected: 'Inhalt abgelehnt - scheint Spam',
      captchaWrong: 'Falsche CAPTCHA-Antwort',
      tooFast: 'Bitte 30 Sekunden warten',
      hourlyLimit: 'Stundenlimit erreicht (3/Std)',
      sending: 'Senden...',
      submitBtn: 'Feedback senden',
      serverError: 'Serverfehler',
      noFeedback: 'Noch kein Feedback!',
      typeSuggestion: 'Vorschlag',
      typeBug: 'Fehler',
      typeFeature: 'Funktion',
      typeGeneral: 'Allgemein',
      totalFeedback: 'Feedback gesamt'
    }
  };

  function getMsg(key) {
    var lang = (document.documentElement.lang || 'ar').substring(0, 2);
    return (MSG[lang] && MSG[lang][key]) || MSG.ar[key] || MSG.en[key] || key;
  }

})();
