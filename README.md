# CoachBoard Pro

مرحباً! هذا المستودع يحتوي على تطبيق "CoachBoard Pro" — لوحة تكتيكية متقدمة للمدربين تعمل كواجهة ويب ثابتة (Single Page App).

## نظرة عامة
- واجهة مستخدم HTML/CSS/JS (Vanilla).
- يمكنك إنشاء تشكيلات، تحريك اللاعبين، حفظ المشاهد، وتصدير صور وفيديوهات.
- لا حاجة لبناء (no build step) — التطبيق يعمل كسيرفر ملفات ثابت.

## تشغيل محلي سريع
1. انسخ المستودع محلياً:
   ```bash
   git clone https://github.com/KinanCodeaz/CoachBoard.git
   cd CoachBoard
   ```
2. شغّل خادم HTTP محلي (يوصى لتصدير الملفات):
   - باستخدام Python 3:
     ```bash
     python3 -m http.server 8000
     # افتح http://localhost:8000/index.html
     ```
   - أو باستخدام serve (npm):
     ```bash
     npm install -g serve
     serve -s . -l 5000
     # افتح http://localhost:5000/index.html
     ```

> ملاحظة: فتح index.html عبر file:// قد يحد من سلوك تنزيل الفيديو/الصور. استخدم HTTP محلياً.

## بنية المشروع (مهمة)
- index.html — نقطة الدخول للتطبيق.
- style.css — الأنماط الرئيسية للواجهة.
- script.js — تهيئة التطبيق وبعض الدوال العليا.
- js/ — جميع وحدات جافاسكربت:
  - js/core/  — المنطق الأساسي (SceneGraph, ToolRegistry, Export, VideoExport, SessionBuilder,...)
  - js/engine/ — محرك العرض، كاميرا، شبكة، أنظمة التصادم والرسوم.
  - js/renderer/ — رسّامو العناصر (اللاعبين، الأسهم، المعدات).
  - js/objects/ — تعريف الكائنات (Player, Ball, Goal, ...)
  - js/sections/ — أقسام واجهة المستخدم.
  - svg/ — أيقونات وموارد SVG المستخدمة.

## مهام مقترحة للتطوير (أبدأ بها إن رغبت)
1. إضافة README مفصل (هذا الملف بدأناه).
2. إعداد GitHub Pages لنشر التطبيق تلقائياً.
3. إضافة ملف LICENSE (اختر الرخصة المفضلة).
4. كتابة اختبارات بسيطة أو أداة مراقبة الأداء لعمليات الرسم.
5. تدقيق وصول (accessibility) — تحسين سمات ARIA، التباينات اللونية، ودعم لوحة المفاتيح.

## مساهمة
إذا تريدني أن أبدأ العمل الآن، حدِّد أولوياتك (مثال: نشر GitHub Pages، تدقيق الوصول، مراجعة تصدير الفيديو، أو إصلاحات أداء). يمكنك أيضاً السماح لي بفتح pull requests مباشرة للتعديلات.

---

# CoachBoard Pro (English)

CoachBoard Pro is a browser-based tactical board for coaches — create formations, animations and export images/videos. This is a static SPA built with HTML, CSS and vanilla JavaScript.

Quick start:

```bash
git clone https://github.com/KinanCodeaz/CoachBoard.git
cd CoachBoard
# serve locally
python3 -m http.server 8000
# open http://localhost:8000/index.html
```

Project layout and development suggestions are provided above.

If you want, I can now:
- Enable GitHub Pages deployment (add workflow + docs)
- Add LICENSE
- Start a security/performance/accessibility code review
- Implement small fixes and open pull requests

Tell me which task to perform next and I will proceed.
