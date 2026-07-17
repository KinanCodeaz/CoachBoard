// ============ ONBOARDING SYSTEM v1.0 ============
// Self-contained module - no dependencies on main script.js
// Folder: how-to/first_step.js
(function(){
'use strict';

var STORAGE_KEY='cb_onboarding_done';
var LANG_KEY='cb_lang';
var isRTL=document.documentElement.dir==='rtl';

// ---- TRANSLATIONS ----
var T={
ar:{
welcome:'مرحباً بك في CoachBoard',
subtitle:'أداة تكتيكية احترفة للمدربين الرياضيين. سنتعرف معاً على واجهة البرنامج خطوة بخطوة.',
chooseLang:'اختر لغتك المفضلة',
start:'ابدأ الشرح',
skip:'تخطي',
next:'التالي',
prev:'السابق',
done:'ابدأ الآن!',
finish:'ممتاز! أنت جاهز',
finishDesc:'الآن يمكنك البدء في رسم التكتيكات والتدريبات. استمتع!',
replay:'إعادة التعريف',
steps:[
{title:'شريط الأدوات العلوي',desc:'هنا تجد جميع الأدوات الأساسية مثل تحديد العناصر وتحريك الملعب، بالإضافة إلى أزرار التراجع والإعادة وتصدير الصور.'},
{title:'مساحة الرسم',desc:'هذا هو الملعب الإلكتروني حيث تقوم برسم التكتيكات والتدريبات. يمكنك تحريك العناصر وتنظيمها كما تشاء.'},
{title:'قائمة الأدوات',desc:'من هذه القائمة تختار الأدوات المختلفة: اللاعبون، المعدات، الأشكال، الأسهم، والرسم الحر.'},
{title:'قائمة الخصائص',desc:'عند تحديد عنصر، ستظهر خصائصه هنا: اللون، الحجم، الشفافية، والدوران. يمكنك تعديل كل شيء بسهولة.'},
{title:'إدارة المشاهد',desc:'من هنا تنشئ مشاهد تدريبية متعددة وتحولها إلى فيديوهات أو صور تعليمية.'}
]
},
en:{
welcome:'Welcome to CoachBoard',
subtitle:'A professional tactical tool for sports coaches. Let\'s take a quick tour of the interface.',
chooseLang:'Choose your language',
start:'Start Tour',
skip:'Skip',
next:'Next',
prev:'Back',
done:'Get Started!',
finish:'All Set!',
finishDesc:'You\'re ready to start drawing tactics and training sessions. Enjoy!',
replay:'Replay Tutorial',
steps:[
{title:'Top Toolbar',desc:'This is where you find essential tools like Select, Move/Pan, Undo/Redo, and Export options.'},
{title:'Canvas Area',desc:'This is the digital pitch where you draw tactics and training drills. Place and arrange elements freely.'},
{title:'Tools Panel',desc:'Choose from various tools here: Players, Equipment, Shapes & Zones, Arrows, and Free Drawing.'},
{title:'Properties Panel',desc:'When you select an element, its properties appear here: color, size, opacity, and rotation. Full control at your fingertips.'},
{title:'Scene Manager',desc:'Create multiple training scenes and convert them into videos or educational images.'}
]
},
fr:{
welcome:'Bienvenue sur CoachBoard',
subtitle:'Un outil tactique professionnel pour les entraîneurs sportifs. Découvrons l\'interface ensemble.',
chooseLang:'Choisissez votre langue',
start:'Commencer',
skip:'Passer',
next:'Suivant',
prev:'Précédent',
done:'C\'est parti!',
finish:'Tout est prêt!',
finishDesc:'Vous êtes prêt à dessiner des tactiques et des exercices d\'entraînement. Amusez-vous!',
replay:'Revoir le tutoriel',
steps:[
{title:'Barre d\'outils',desc:'Retrouvez ici les outils essentiels : Sélection, Déplacement, Annuler/Refaire, et Exporter.'},
{title:'Zone de dessin',desc:'C\'est le terrain numérique où vous dessinez vos tactiques et exercices. Placez et organisez librement les éléments.'},
{title:'Panneau d\'outils',desc:'Choisissez parmi divers outils : Joueurs, Équipements, Formes, Flèches, et Dessin libre.'},
{title:'Panneau de propriétés',desc:'Lorsque vous sélectionnez un élément, ses propriétés apparaissent ici : couleur, taille, opacité et rotation.'},
{title:'Gestionnaire de scènes',desc:'Créez plusieurs scènes d\'entraînement et transformez-les en vidéos ou images éducatives.'}
]
},
es:{
welcome:'Bienvenido a CoachBoard',
subtitle:'Una herramienta táctica profesional para entrenadores deportivos. Conozcamos la interfaz.',
chooseLang:'Elige tu idioma',
start:'Comenzar',
skip:'Omitir',
next:'Siguiente',
prev:'Anterior',
done:'¡Empezar!',
finish:'¡Todo listo!',
finishDesc:'Estás listo para dibujar tácticas y sesiones de entrenamiento. ¡Disfruta!',
replay:'Repetir tutorial',
steps:[
{title:'Barra de herramientas',desc:'Aquí encontrarás herramientas esenciales: Seleccionar, Mover, Deshacer/Rehacer, y Exportar.'},
{title:'Área de dibujo',desc:'Este es el campo digital donde dibujas tácticas y ejercicios. Coloca y organiza elementos libremente.'},
{title:'Panel de herramientas',desc:'Elige entre varias herramientas: Jugadores, Equipos, Formas, Flechas, y Dibujo libre.'},
{title:'Panel de propiedades',desc:'Al seleccionar un elemento, sus propiedades aparecen aquí: color, tamaño, opacidad y rotación.'},
{title:'Gestor de escenas',desc:'Crea múltiples escenas de entrenamiento y conviértelas en videos o imágenes educativas.'}
]
},
de:{
welcome:'Willkommen bei CoachBoard',
subtitle:'Ein professionelles taktisches Tool für Sporttrainer. Lassen Sie uns die Oberfläche erkunden.',
chooseLang:'Wählen Sie Ihre Sprache',
start:'Tour starten',
skip:'Überspringen',
next:'Weiter',
prev:'Zurück',
done:'Los geht\'s!',
finish:'Alles bereit!',
finishDesc:'Sie sind bereit, Taktiken und Trainingseinheiten zu zeichnen. Viel Spaß!',
replay:'Tutorial wiederholen',
steps:[
{title:'Symbolleiste',desc:'Hier finden Sie wichtige Tools: Auswahl, Verschieben, Rückgängig/Wiederherstellen und Exportieren.'},
{title:'Zeichenbereich',desc:'Dies ist das digitale Spielfeld, auf dem Sie Taktiken und Übungen zeichnen. Platzieren Sie Elemente frei.'},
{title:'Werkzeugleiste',desc:'Wählen Sie aus verschiedenen Werkzeugen: Spieler, Ausrüstung, Formen, Pfeile und Freihandzeichnen.'},
{title:'Eigenschaften-Panel',desc:'Beim Auswählen eines Elements werden seine Eigenschaften angezeigt: Farbe, Größe, Transparenz und Rotation.'},
{title:'Szenen-Manager',desc:'Erstellen Sie mehrere Trainingsszenen und verwandeln Sie sie in Videos oder Bilder.'}
]
}
};

// ---- STATE ----
var currentLang='ar';
var currentStep=0;
var overlay=null;
var spotlight=null;
var progressBar=null;
var skipBtn=null;
var onComplete=null;

// ---- LANGUAGE HELPERS ----
function getUILang(){
var saved=null;
try{saved=localStorage.getItem(LANG_KEY);}catch(e){}
return saved||'ar';
}
function t(key){return(T[currentLang]&&T[currentLang][key])||(T.ar[key])||key;}

// ---- MAIN API ----
window.Onboarding={
show:function(callback){
currentLang=getUILang();
currentStep=0;
onComplete=callback||null;
var done=null;
try{done=localStorage.getItem(STORAGE_KEY);}catch(e){}
if(done==='true')return;
showWelcome();
},
showTutorial:function(){
currentLang=getUILang();
currentStep=0;
showStep(0);
},
isDone:function(){try{return localStorage.getItem(STORAGE_KEY)==='true';}catch(e){return false;}}
};

// ---- WELCOME SCREEN ----
function showWelcome(){
createBase();
var steps=t('steps');
var langs=[
{code:'ar',flag:'🇸🇦',name:'العربية'},
{code:'en',flag:'🇺🇸',name:'English'},
{code:'fr',flag:'🇫🇷',name:'Français'},
{code:'es',flag:'🇪🇸',name:'Español'},
{code:'de',flag:'🇩🇪',name:'Deutsch'}
];
var h='<div class="ob-welcome">';
h+='<span class="ob-logo">⚽</span>';
h+='<h1>'+t('welcome')+'</h1>';
h+='<p class="ob-subtitle">'+t('subtitle')+'</p>';
h+='<p style="font-size:12px;font-weight:600;color:var(--text2,#a0a3b1);margin-bottom:10px">'+t('chooseLang')+'</p>';
h+='<div class="ob-lang-grid">';
langs.forEach(function(l){
h+='<button class="ob-lang-btn'+(l.code===currentLang?' selected':'')+'" onclick="Onboarding._pickLang(\''+l.code+'\')">';
h+='<span class="ob-lang-flag">'+l.flag+'</span>';
h+='<span class="ob-lang-name">'+l.name+'</span>';
h+='</button>';
});
h+='</div>';
h+='<div class="ob-actions">';
h+='<button class="ob-btn ob-btn-ghost" onclick="Onboarding._skipAll()">'+t('skip')+'</button>';
h+='<button class="ob-btn ob-btn-primary" id="obStartBtn" onclick="Onboarding._start()">'+t('start')+' →</button>';
h+='</div>';
h+='</div>';
overlay.innerHTML=h;
overlay.classList.add('show');
}

window.Onboarding._pickLang=function(lang){
currentLang=lang;
var btns=overlay.querySelectorAll('.ob-lang-btn');
btns.forEach(function(b){
var code=b.querySelector('.ob-lang-name').textContent;
var langMap={'العربية':'ar','English':'en','Français':'fr','Español':'es','Deutsch':'de'};
b.classList.toggle('selected',langMap[code]===lang);
});
// Re-render with new language
var w=overlay.querySelector('.ob-welcome');
if(w)showWelcome();
};

window.Onboarding._start=function(){
currentStep=0;
showStep(0);
};

window.Onboarding._skipAll=function(){
try{localStorage.setItem(STORAGE_KEY,'true');}catch(e){}
removeAll();
if(onComplete)onComplete();
};

window.Onboarding._next=function(){
currentStep++;
var steps=t('steps');
if(currentStep>=steps.length){
showFinish();
}else{
showStep(currentStep);
}
};

window.Onboarding._prev=function(){
if(currentStep>0){currentStep--;showStep(currentStep);}
};

window.Onboarding._close=function(){
try{localStorage.setItem(STORAGE_KEY,'true');}catch(e){}
removeAll();
if(onComplete)onComplete();
};

// ---- TOUR STEPS ----
// Target selectors for each step
var stepTargets=[
'header',        // toolbar (top header)
'cc',            // canvas area
'sidebarL',      // tools panel (left sidebar)
'sidebarR',      // properties panel (right sidebar)
'bottomPanel'    // scene manager (bottom)
];

function showStep(idx){
createBase();
// Remove any existing spotlight labels
document.querySelectorAll('.ob-spotlight-label').forEach(function(el){el.remove();});
var steps=t('steps');
var step=steps[idx];
var total=steps.length;

// Progress bar
progressBar=document.createElement('div');
progressBar.className='ob-progress';
progressBar.style.width=((idx+1)/total*100)+'%';
document.body.appendChild(progressBar);

// Skip button
skipBtn=document.createElement('button');
skipBtn.className='ob-skip';
skipBtn.textContent=t('skip');
skipBtn.onclick=function(){Onboarding._close();};
document.body.appendChild(skipBtn);

// Spotlight on target
var targetId=stepTargets[idx];
var target=document.getElementById(targetId);
var cardLeft=50,cardTop=50;
var spotRect=null;
if(target){
spotRect=target.getBoundingClientRect();
spotlight=document.createElement('div');
spotlight.className='ob-spotlight';
spotlight.style.left=(spotRect.left-8)+'px';
spotlight.style.top=(spotRect.top-8)+'px';
spotlight.style.width=(spotRect.width+16)+'px';
spotlight.style.height=(spotRect.height+16)+'px';
document.body.appendChild(spotlight);

// Add label on spotlight
var spotLabel=document.createElement('div');
spotLabel.className='ob-spotlight-label';
spotLabel.textContent=step.title;
spotLabel.style.left=(spotRect.left+spotRect.width/2)+'px';
spotLabel.style.top=(spotRect.top-32)+'px';
document.body.appendChild(spotLabel);
}

// Position step card near the target
if(spotRect){
var pw=360,ph=180;
var spaceRight=window.innerWidth-spotRect.right-20;
var spaceLeft=spotRect.left-20;
var spaceBottom=window.innerHeight-spotRect.bottom-20;
var spaceTop=spotRect.top-20;

if(spaceRight>pw+40){
// Right of target
cardLeft=(spotRect.right+25);
cardTop=Math.max(10,Math.min(spotRect.top,(window.innerHeight-ph)/2));
}else if(spaceLeft>pw+40){
// Left of target
cardLeft=(spotRect.left-25-pw);
cardTop=Math.max(10,Math.min(spotRect.top,(window.innerHeight-ph)/2));
}else if(spaceBottom>ph+40){
// Below target
cardTop=(spotRect.bottom+25);
cardLeft=Math.max(10,Math.min(spotRect.left+spotRect.width/2-pw/2,window.innerWidth-pw-10));
}else{
// Above target
cardTop=Math.max(10,spotRect.top-25-ph);
cardLeft=Math.max(10,Math.min(spotRect.left+spotRect.width/2-pw/2,window.innerWidth-pw-10));
}
}

var stepEl=document.createElement('div');
stepEl.className='ob-step';
stepEl.style.left=cardLeft+'px';
stepEl.style.top=cardTop+'px';
stepEl.style.transform='none';

var h='<div class="ob-step-num">'+(idx+1)+'</div>';
h+='<div class="ob-step-title">'+step.title+'</div>';
h+='<div class="ob-step-desc">'+step.desc+'</div>';
h+='<div class="ob-step-actions">';
if(idx>0)h+='<button class="ob-btn ob-btn-ghost" style="padding:6px 14px;font-size:11px" onclick="Onboarding._prev()">← '+t('prev')+'</button>';
h+='<div class="ob-step-dots">';
for(var i=0;i<total;i++)h+='<div class="ob-step-dot'+(i===idx?' active':'')+'"></div>';
h+='</div>';
if(idx<total-1){
h+='<button class="ob-btn ob-btn-primary" style="padding:6px 16px;font-size:11px" onclick="Onboarding._next()">'+t('next')+' →</button>';
}else{
h+='<button class="ob-btn ob-btn-primary" style="padding:6px 16px;font-size:11px;background:#22c55e" onclick="Onboarding._close()">'+t('done')+' ✓</button>';
}
h+='</div>';
stepEl.innerHTML=h;
document.body.appendChild(stepEl);

// Animate spotlight
if(spotlight){
spotlight.style.transition='all 0.5s cubic-bezier(0.4,0,0.2,1)';
}
}

// ---- FINISH SCREEN ----
function showFinish(){
removeAll();
createBase();
var h='<div class="ob-welcome">';
h+='<span class="ob-complete-icon">🎉</span>';
h+='<h1>'+t('finish')+'</h1>';
h+='<p class="ob-subtitle">'+t('finishDesc')+'</p>';
h+='<div class="ob-actions">';
h+='<button class="ob-btn ob-btn-primary" onclick="Onboarding._close()">'+t('done')+' 🚀</button>';
h+='</div>';
h+='</div>';
overlay.innerHTML=h;
overlay.classList.add('show');
}

// ---- DOM HELPERS ----
function createBase(){
removeAll();
// Load CSS
if(!document.getElementById('ob-css')){
var link=document.createElement('link');
link.id='ob-css';
link.rel='stylesheet';
link.href='how-to/first_step.css';
document.head.appendChild(link);
}

// Backdrop
var bd=document.createElement('div');
bd.className='ob-backdrop';
bd.id='ob-backdrop';
bd.onclick=function(){Onboarding._close();};
document.body.appendChild(bd);

// Overlay
overlay=document.createElement('div');
overlay.id='ob-overlay';
overlay.className='ob-overlay';
document.body.appendChild(overlay);
}

function removeAll(){
var els=['ob-backdrop','ob-overlay','ob-css'];
els.forEach(function(id){
var el=document.getElementById(id);
if(el)el.remove();
});
// Also remove dynamically added elements
document.querySelectorAll('.ob-step,.ob-spotlight,.ob-spotlight-label,.ob-progress,.ob-skip').forEach(function(el){el.remove();});
}

})();
