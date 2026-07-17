# CoachBoard Pro

مرحباً! هذا المستودع يحتوي على تطبيق "CoachBoard Pro" — لوحة تكتيكية متقدمة للمدربين تعمل كواجهة ويب ثابتة (Single Page App).


  

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

