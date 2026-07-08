'use strict';function loadCustomIcons(){try{var d=localStorage.getItem('cb_custom_icons');if(d)customIcons=JSON.parse(d);}catch(e){}applyCustomIcons();}
function saveCustomIcons(){try{localStorage.setItem('cb_custom_icons',JSON.stringify(customIcons));}catch(e){}}
function loadIconFile(type,input){if(!input.files||!input.files[0])return;var file=input.files[0];if(!validateImageFile(file,2))return;var reader=new FileReader();reader.onload=function(e){customIcons[type]=e.target.result;var img=new Image();img.onload=function(){customIconImages[type]=img;render();rebuildSettingsModal();};img.src=e.target.result;saveCustomIcons();applyCustomIcons();};reader.readAsDataURL(file);}
function resetCustomIcon(type){delete customIcons[type];delete customIconImages[type];saveCustomIcons();applyCustomIcons();}
function applyCustomIcons(){document.querySelectorAll('.icon-btn[data-tool]').forEach(function(btn){var tp=btn.dataset.tool;if(customIcons[tp]){var img=btn.querySelector('img.ci-icon');if(!img){img=document.createElement('img');img.className='ci-icon';img.style.cssText='width:18px;height:18px;object-fit:contain;border-radius:2px';var ic=btn.querySelector('i');if(ic)ic.style.display='none';btn.insertBefore(img,btn.querySelector('.icon-label'));}img.src=customIcons[tp];if(!customIconImages[tp]){var ci=new Image();ci.onload=function(t){return function(){customIconImages[t]=ci;};}(tp);ci.src=customIcons[tp];}}else{var img=btn.querySelector('img.ci-icon');if(img){img.remove();var ic=btn.querySelector('i');if(ic)ic.style.display='';}delete customIconImages[tp];}});}
function loadDefaultPitchImages(){var map={futsal:'assets/futsal.png',football:'assets/soccer.png',beach:'assets/beach.png',basketball:'assets/basketball.png',volleyball:'assets/volleyball.png',handball:'assets/handball.png',mini:'assets/soccer.png'};Object.keys(map).forEach(function(sp){if(courtImgs[sp])return;var img=new Image();img.onload=function(){if(!courtImgs[sp])courtImgs[sp]=img;};img.onerror=function(){};img.src=map[sp];});}
function toggleFullscreen(){
  try{
    if(!document.fullscreenElement){
      document.documentElement.requestFullscreen().catch(function(err){
        console.log('Fullscreen request failed:', err.message);
      });
    }else{
      document.exitFullscreen().catch(function(err){
        console.log('Exit fullscreen failed:', err.message);
      });
    }
  }catch(e){}
}
function exportProjectJSON(){
  var defaultName=(teamNames.A||'CoachBoard')+' - '+new Date().toLocaleDateString();
  showPromptModal(t('save_project'),defaultName,function(ok,nm){
    if(!ok||!nm)return;
    var data={version:'2.0',exportDate:new Date().toISOString(),projectName:nm,els:els,nCnt:nCnt,grpCnt:grpCnt,steps:steps,sport:sport,pitchColors:pitchColors,customPitchColor:customPitchColor,playerDisplayStyle:playerDisplayStyle,pitch3d:pitch3d,fieldStyle:fieldStyle,teamNames:teamNames,teamScores:teamScores,teamFormations:teamFormations,teamFormationProps:teamFormationProps,coachInfo:coachInfo,teamLogos:teamLogos,teamLogoOpacity:teamLogoOpacity,favoriteColors:favoriteColors,playerLinks:playerLinks,teamRosters:teamRosters,teamRosterAssignment:teamRosterAssignment,showPlayerNames:showPlayerNames};
var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;a.download=nm.replace(/[^a-z0-9]/gi,'_')+'.json';a.click();URL.revokeObjectURL(url);toast(t('exported'));
  });}
function importProjectJSON(){var inp=document.createElement('input');inp.type='file';inp.accept='.json';inp.onchange=function(e){var file=e.target.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(ev){try{var d=JSON.parse(ev.target.result);
els=d.els||[];nCnt=d.nCnt||1;grpCnt=d.grpCnt||1;steps=d.steps||[];sport=d.sport||'futsal';
if(d.pitchColors)pitchColors=d.pitchColors;if(d.customPitchColor!==undefined)customPitchColor=d.customPitchColor;
if(d.playerDisplayStyle)playerDisplayStyle=d.playerDisplayStyle;if(d.pitch3d!==undefined)pitch3d=d.pitch3d;else if(d.pitchVertical!==undefined)pitch3d=d.pitchVertical;document.getElementById('cc').classList.toggle('pitch-3d',pitch3d);if(pitch3d){pitchRotX=35;pitchRotY=0;}else{pitchRotX=0;pitchRotY=0;}applyZoom();
if(d.fieldStyle)fieldStyle=d.fieldStyle;if(d.teamNames)teamNames=d.teamNames;if(d.teamScores)teamScores=d.teamScores;
if(d.teamFormations)teamFormations=d.teamFormations;if(d.teamFormationProps)teamFormationProps=d.teamFormationProps;
if(d.coachInfo)coachInfo=d.coachInfo;if(d.teamLogos)teamLogos=d.teamLogos;if(d.teamLogoOpacity)teamLogoOpacity=d.teamLogoOpacity;
if(d.favoriteColors)favoriteColors=d.favoriteColors;if(d.playerLinks)playerLinks=d.playerLinks;
if(d.teamRosters){teamRosters=d.teamRosters;saveTeamRosters();}if(d.teamRosterAssignment){teamRosterAssignment=d.teamRosterAssignment;saveTeamRosters();}if(d.showPlayerNames!==undefined){showPlayerNames=d.showPlayerNames;saveTeamRosters();}
selIds.clear();hist=[];hI=-1;saveH();renderSteps();applySportUI();applyPitchUI();syncTeamInfoUI();renderFormationsPanel();updateProps();updateLayers();toast(t('loaded'));render();}catch(err){toast('Error: '+err.message);}};reader.readAsText(file);};inp.click();}
function showWelcome(){var w=document.getElementById('welcomeModal');if(w)w.classList.add('show');}
function closeWelcome(){var w=document.getElementById('welcomeModal');if(w)w.classList.remove('show');try{localStorage.setItem('cb_welcomed','1');}catch(e){}}
function checkWelcome(){if(!localStorage.getItem('cb_welcomed'))setTimeout(showWelcome,500);}
function showFormationTooltip(fmt,e){var tip=document.getElementById('fmTooltip');if(!tip)return;
var rect=e.target.getBoundingClientRect();tip.style.left=rect.left+'px';tip.style.top=(rect.bottom+8)+'px';
var h='<div style="font-weight:700;margin-bottom:4px">'+fmt+'</div>';
h+='<div style="font-size:9px;color:var(--text2)">'+t('click_to_place')+'</div>';
tip.innerHTML=h;tip.classList.add('show');}
function hideFormationTooltip(){var tip=document.getElementById('fmTooltip');if(tip)tip.classList.remove('show');}
function drawCanvasWatermark(){
if(!coachInfo.name)return;
var p=pRect();if(!p||p.w<100)return;
cx.save();cx.globalAlpha=0.08;cx.font='bold 14px Cairo,Inter';cx.textAlign='right';cx.textBaseline='bottom';
cx.fillStyle=theme==='dark'?'#fff':'#000';
cx.fillText(coachInfo.name,p.x+p.w-10,p.y+p.h-10);
cx.font='9px Cairo,Inter';cx.fillText(new Date().toLocaleDateString(),p.x+p.w-10,p.y+p.h-26);
cx.restore();}
function openSettings(){rebuildSettingsModal();var m=document.getElementById('setModal');if(m)m.classList.add('show');}
function closeSet(){var m=document.getElementById('setModal');if(m)m.classList.remove('show');}
function rebuildSettingsModal(){var m=document.getElementById('setModal');if(!m)return;var q=m.querySelector('.modal');
var sports=['futsal','football','beach','mini','basketball','volleyball','handball'];
var sportsAR={futsal:'فوتسال',football:'كرة قدم',beach:'شاطئية',mini:'مصغرة',basketball:'سلة',volleyball:'كرة طائرة',handball:'كرة يد'};
var h='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><h2 style="font-size:14px"><i class="fas fa-cog"></i> '+t('pitch_settings')+'</h2><button class="hbtn icon-only danger" onclick="closeSet()" style="width:24px;height:24px"><i class="fas fa-times"></i></button></div>';
h+='<div class="settings-tabs" id="settingsTabs">';
h+='<button class="settings-tab on" onclick="switchSettingsTab(\'field\',this)"><i class="fas fa-futbol"></i> الملعب</button>';
h+='<button class="settings-tab" onclick="switchSettingsTab(\'icons\',this)"><i class="fas fa-icons"></i> الأيقونات</button>';
h+='<button class="settings-tab" onclick="switchSettingsTab(\'team\',this)"><i class="fas fa-shield-alt"></i> الفرق</button>';
h+='<button class="settings-tab" onclick="switchSettingsTab(\'coach\',this)"><i class="fas fa-user-tie"></i> المدرب</button>';
h+='<button class="settings-tab" onclick="switchSettingsTab(\'lang\',this)"><i class="fas fa-globe"></i> اللغة</button>';
h+='<button class="settings-tab" onclick="switchSettingsTab(\'shortcuts\',this)"><i class="fas fa-keyboard"></i> الاختصارات</button>';
h+='</div>';
// Field tab
h+='<div class="settings-tab-content" id="tab-field">';
h+='<div style="display:flex;gap:8px;align-items:center;margin-bottom:10px"><label style="font-size:11px;color:var(--text2);min-width:45px">الرياضية:</label><select class="prop-input" style="flex:1;font-size:11px" onchange="sport=this.value;applySportUI();render();rebuildSettingsModal()">';
sports.forEach(function(sp2){h+='<option value="'+sp2+'"'+(sport===sp2?' selected':'')+'>'+sportsAR[sp2]+'</option>';});
h+='</select></div>';
h+='<div style="display:flex;gap:8px;align-items:center;margin-bottom:10px"><label style="font-size:11px;color:var(--text2);min-width:45px">الخلفية:</label><div style="display:flex;gap:6px;align-items:center"><input type="file" accept="image/*" onchange="loadCI(\''+sport+'\',this)" style="font-size:9px;flex:1">'+(courtImgs[sport]?'<img src="'+courtImgs[sport].src+'" style="width:32px;height:20px;border-radius:4px;border:1px solid var(--border)"><button class="hbtn danger" onclick="delete courtImgs[\''+sport+'\'];render();rebuildSettingsModal()" style="font-size:8px;padding:2px 4px"><i class="fas fa-times"></i></button>':'')+'</div></div>';
h+='<div style="display:flex;gap:8px;align-items:center;margin-bottom:10px"><label style="font-size:11px;color:var(--text2);min-width:45px">المظهر:</label><div style="display:flex;gap:3px;flex-wrap:wrap">';
var themes=[{id:'dark',icon:'fa-moon',label:'داكن'},{id:'light',icon:'fa-sun',label:'فاتح'},{id:'ocean',icon:'fa-water',label:'محيط'},{id:'pink',icon:'fa-heart',label:'وردي'},{id:'purple',icon:'fa-gem',label:'بنفسجي'},{id:'forest',icon:'fa-leaf',label:'غابة'}];
themes.forEach(function(th){h+='<button class="hbtn'+(theme===th.id?' primary':'')+'" onclick="theme=\''+th.id+'\';ThemeManager.apply(\''+th.id+'\');updateThemeIcon();rebuildSettingsModal();render()" style="font-size:9px;padding:2px 6px" title="'+th.label+'"><i class="fas '+th.icon+'" style="margin-inline-end:1px"></i>'+th.label+'</button>';});
h+='</div></div>';
h+='<div style="display:flex;gap:8px;align-items:center;margin-bottom:10px"><label style="font-size:11px;color:var(--text2);min-width:45px">النمط:</label><div style="display:flex;gap:4px"><button class="hbtn'+(fieldStyle==='svg'?' primary':'')+'" onclick="setFieldStyle(\'svg\');rebuildSettingsModal()" style="font-size:10px;padding:3px 8px"><i class="fas fa-drafting-compass" style="margin-inline-end:2px"></i>تكتيكي</button><button class="hbtn'+(fieldStyle==='realistic'?' primary':'')+'" onclick="setFieldStyle(\'realistic\');rebuildSettingsModal()" style="font-size:10px;padding:3px 8px"><i class="fas fa-image" style="margin-inline-end:2px"></i>واقعي</button></div></div>';
h+='<div style="display:flex;gap:8px;align-items:center;margin-bottom:10px"><label style="font-size:11px;color:var(--text2);min-width:45px">اللون:</label><input type="color" id="pitchColorPicker" value="'+(customPitchColor||pitchColors[sport]||'#1a7a3a')+'" onchange="setPitchColor(this.value)" style="width:32px;height:22px;border:none;cursor:pointer"><button class="hbtn" onclick="resetPitchColor()" style="font-size:9px;padding:2px 6px">إعادة</button></div>';
h+='</div>';
// Icons tab
h+='<div class="settings-tab-content" id="tab-icons" style="display:none">';
var tools=['cone','coneDisc','coneTall','ring','barrier','hurdle','mannequin','smallGoal','flag','ladder','stick','ball'];
h+='<div style="display:flex;flex-wrap:wrap;gap:4px">';
tools.forEach(function(tp){var ln=tp==='coneDisc'?'cone_disc':tp==='coneTall'?'cone_tall':tp==='smallGoal'?'small_goal':tp;h+='<div style="text-align:center;position:relative"><input type="file" accept="image/*" id="ci_'+tp+'" style="display:none" onchange="loadIconFile(\''+tp+'\',this)"><div class="icon-btn" style="cursor:pointer;width:36px;height:36px" onclick="document.getElementById(\'ci_'+tp+'\').click()"><i class="fas fa-upload" style="font-size:8px;color:var(--text3)"></i><span class="icon-label" style="font-size:6px">'+t(ln)+'</span></div>'+(customIcons[tp]?'<button class="hbtn icon-only danger" style="position:absolute;top:-3px;right:-3px;width:14px;height:14px;font-size:7px;padding:0;border-radius:50%" onclick="resetCIcon(\''+tp+'\')" title="'+t('reset')+'"><i class="fas fa-times"></i></button>':'')+'</div>';});
h+='</div></div>';
// Team tab
h+='<div class="settings-tab-content" id="tab-team" style="display:none">';
h+='<div style="margin-bottom:10px"><h3 style="font-size:12px;color:var(--accent);margin-bottom:6px"><i class="fas fa-shield-alt"></i> شعارات الفرق</h3>';
h+='<div style="display:flex;gap:6px;align-items:center;margin-bottom:6px"><label style="font-size:10px;color:var(--text2);min-width:40px">فريق أ:</label><input type="file" accept="image/*" onchange="loadTeamLogo(\'A\',this)" style="font-size:9px">';
if(teamLogos.A)h+='<img class="logo-preview" src="'+teamLogos.A.src+'" style="width:20px;height:20px">';
h+='<label style="font-size:9px;color:var(--text2)">شفافية:</label><input type="range" min="5" max="50" value="'+Math.round(teamLogoOpacity.A*100)+'" style="width:50px" oninput="teamLogoOpacity.A=this.value/100;render()"></div>';
h+='<div style="display:flex;gap:6px;align-items:center"><label style="font-size:10px;color:var(--text2);min-width:40px">فريق ب:</label><input type="file" accept="image/*" onchange="loadTeamLogo(\'B\',this)" style="font-size:9px">';
if(teamLogos.B)h+='<img class="logo-preview" src="'+teamLogos.B.src+'" style="width:20px;height:20px">';
h+='<label style="font-size:9px;color:var(--text2)">شفافية:</label><input type="range" min="5" max="50" value="'+Math.round(teamLogoOpacity.B*100)+'" style="width:50px" oninput="teamLogoOpacity.B=this.value/100;render()"></div></div>';
h+='</div>';
// Coach tab
h+='<div class="settings-tab-content" id="tab-coach" style="display:none">';
h+='<div style="display:flex;gap:6px;align-items:center;margin-bottom:8px"><label style="font-size:10px;color:var(--text2);min-width:35px">الاسم:</label><input type="text" class="prop-input" style="flex:1;font-size:10px;padding:3px 6px" value="'+(coachInfo.name||'')+'" oninput="coachInfo.name=this.value;render()" placeholder="اسم المدرب..."></div>';
h+='<div style="display:flex;gap:6px;align-items:center;margin-bottom:6px"><label style="font-size:10px;color:var(--text2);min-width:35px">الشعار:</label><input type="file" accept="image/*" onchange="loadCoachLogo(this)" style="font-size:9px">';
if(coachInfo.logo)h+='<img class="logo-preview" src="'+coachInfo.logo.src+'" style="width:20px;height:20px">';
h+='</div>';
h+='<div style="display:flex;gap:6px;align-items:center;margin-bottom:4px"><label style="font-size:9px;color:var(--text2)">شفافية:</label><input type="range" min="5" max="60" value="'+Math.round(coachInfo.logoOpacity*100)+'" style="flex:1" oninput="coachInfo.logoOpacity=this.value/100;render()"></div>';
h+='<div style="display:flex;gap:6px;align-items:center"><label style="font-size:9px;color:var(--text2)">الحجم:</label><input type="range" min="30" max="200" value="'+coachInfo.logoSize+'" style="flex:1" oninput="coachInfo.logoSize=+this.value;render()"></div></div>';
// Language tab
h+='<div class="settings-tab-content" id="tab-lang" style="display:none">';
h+='<div style="display:flex;flex-direction:column;gap:6px">';
var langs=[{v:'ar',l:'العربية'},{v:'en',l:'English'},{v:'fr',l:'Français'},{v:'es',l:'Español'},{v:'de',l:'Deutsch'}];
langs.forEach(function(ln){h+='<label style="display:flex;align-items:center;gap:8px;padding:6px 8px;border-radius:6px;cursor:pointer;background:'+(I18n.getLanguage()===ln.v?'var(--accent-bg)':'transparent')+';border:1px solid '+(I18n.getLanguage()===ln.v?'var(--accent-border)':'transparent')+'" onclick="I18n.setLanguage(\''+ln.v+'\');rebuildSettingsModal()"><input type="radio" name="lang" value="'+ln.v+'"'+(I18n.getLanguage()===ln.v?' checked':'')+' style="margin:0"><span style="font-size:11px">'+ln.l+'</span></label>';});
h+='</div></div>';
// Shortcuts tab
h+='<div class="settings-tab-content" id="tab-shortcuts" style="display:none">';
h+='<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><p style="font-size:10px;color:var(--text2)">اضغط على أي اختصار لتعديله</p><button class="hbtn" onclick="resetShortcuts()" style="font-size:9px;padding:2px 6px"><i class="fas fa-undo" style="margin-inline-end:2px"></i>إعادة الافتراضي</button></div>';
var savedSC=loadShortcuts();
var shortcuts=[
{k:savedSC[0]||'ctrl+z',l:'تراجع',fn:'undo()'},
{k:savedSC[1]||'ctrl+y',l:'إعادة',fn:'redo()'},
{k:savedSC[2]||'ctrl+d',l:'تكرار',fn:'duplicateSel()'},
{k:savedSC[3]||'ctrl+a',l:'تحديد الكل',fn:'selectAllEls()'},
{k:savedSC[4]||'ctrl+s',l:'حفظ',fn:'exportProjectJSON()'},
{k:savedSC[5]||'ctrl+g',l:'شبكة',fn:'toggleGridSnap()'},
{k:savedSC[6]||'delete',l:'حذف',fn:'deleteSel()'},
{k:savedSC[7]||'v',l:'أداة التحديد',fn:"setTool('select')"},
{k:savedSC[8]||'1',l:'لاعب',fn:"setTool('p_stand')"},
{k:savedSC[9]||'2',l:'حارس',fn:"setTool('gk_stand')"},
{k:savedSC[10]||'3',l:'كرة',fn:"setTool('ball')"},
{k:savedSC[11]||'4',l:'سهم',fn:"setTool('arrowSolid')"},
{k:savedSC[12]||'5',l:'منطقة',fn:"setTool('zoneCircle')"},
{k:savedSC[13]||'6',l:'قلم',fn:"setTool('pen')"},
{k:savedSC[14]||'7',l:'نص',fn:"setTool('text')"},
{k:savedSC[15]||'8',l:'رقم',fn:"setTool('number')"},
{k:savedSC[16]||'9',l:'مساحة حرة',fn:"setTool('freehand')"},
{k:savedSC[17]||'?',l:'الاختصارات',fn:'openSettings()'},
{k:savedSC[18]||'f11',l:'شاشة كاملة',fn:'toggleFullscreen()'}
];
h+='<div class="sc-grid" style="gap:4px">';
shortcuts.forEach(function(sc,i){
h+='<div class="sc-item" style="display:flex;align-items:center;gap:6px;padding:4px 6px;border-bottom:1px solid var(--border)"><kbd id="sc_key_'+i+'" onclick="editShortcut('+i+')" style="cursor:pointer;min-width:60px;text-align:center" title="اضغط للتعديل">'+sc.k.toUpperCase()+'</kbd><span style="font-size:10px;flex:1">'+sc.l+'</span></div>';
});
h+='</div></div>';
h+='<div class="modal-actions" style="margin-top:12px"><button class="hbtn primary" onclick="closeSet()">'+t('done')+'</button><button class="hbtn danger" onclick="resetCI()">'+t('reset')+'</button></div>';
q.innerHTML=h;
// Show field tab by default
var firstTab=document.getElementById('tab-field');
if(firstTab){firstTab.style.display='block';firstTab.style.visibility='visible';}}
function switchSettingsTab(tab,btn){
var contents=document.querySelectorAll('.settings-tab-content');
for(var i=0;i<contents.length;i++){contents[i].style.display='none';contents[i].style.visibility='hidden';}
var tabs=document.querySelectorAll('.settings-tab');
for(var i=0;i<tabs.length;i++){tabs[i].classList.remove('on');}
var el=document.getElementById('tab-'+tab);
if(el){el.style.display='block';el.style.visibility='visible';}
if(btn)btn.classList.add('on');}
function editShortcut(i){var el=document.getElementById('sc_key_'+i);if(!el)return;var old=el.textContent;el.textContent='...';el.style.background='var(--accent-bg)';function onKey(e){e.preventDefault();var k=e.key.toLowerCase();if(e.ctrlKey)k='ctrl+'+k;if(e.shiftKey)k='shift+'+k;if(e.altKey)k='alt+'+k;el.textContent=k.toUpperCase();el.style.background='';document.removeEventListener('keydown',onKey);el.blur();saveShortcuts(i,k);}document.addEventListener('keydown',onKey);}
function saveShortcuts(idx,key){try{var sc=JSON.parse(localStorage.getItem('cb_shortcuts')||'{}');sc[idx]=key;localStorage.setItem('cb_shortcuts',JSON.stringify(sc));}catch(e){}}
function loadShortcuts(){try{return JSON.parse(localStorage.getItem('cb_shortcuts')||'{}');}catch(e){return {};}}
function resetShortcuts(){try{localStorage.removeItem('cb_shortcuts');rebuildSettingsModal();}catch(e){}}
function loadCI(sp2,input){if(!input.files||!input.files[0])return;var file=input.files[0];if(!validateImageFile(file,5))return;var reader=new FileReader();reader.onload=function(e){var img=new Image();img.onload=function(){courtImgs[sp2]=img;render();};img.src=e.target.result;};reader.readAsDataURL(file);}
function resetCI(){courtImgs={futsal:null,football:null,beach:null,mini:null,basketball:null,volleyball:null,handball:null};customIcons={};customIconImages={};saveCustomIcons();render();rebuildSettingsModal();}
function resetCIcon(type){resetCustomIcon(type);render();rebuildSettingsModal();}
function setPitchColor(c){customPitchColor=c;render();}
function resetPitchColor(){customPitchColor=null;render();}
function getPitchColor(){return customPitchColor||pitchColors[sport]||'#1a7a3a';}
function applySportUI(){document.querySelectorAll('#sp-tg button').forEach(function(b){b.classList.toggle('on',b.dataset.sport===sport);});updateSportLabel();}
function applyPitchUI(){updateFSDropdownUI();updateOrientDropdownUI();}
// ============ CONTEXT MENU ============
function hideCtx(){var cm=document.getElementById('ctxMenu');if(cm)cm.classList.remove('show');}
// Hide context menu on any modal click
document.querySelectorAll('.modal-overlay').forEach(function(mo){mo.addEventListener('click',function(){hideCtx();});});
function openShortcuts(){rebuildSettingsModal();var m=document.getElementById('setModal');if(m)m.classList.add('show');var scBtns=document.querySelectorAll('.settings-tab');for(var i=0;i<scBtns.length;i++){if(scBtns[i].textContent.indexOf('اختصارات')>=0){switchSettingsTab('shortcuts',scBtns[i]);break;}}}
function closeShortcuts(){closeSet();}
function showDistance(){var se=[];selIds.forEach(function(id){var el=els.find(function(e2){return e2.id===id;});if(el)se.push(el);});if(se.length!==2)return;var e1=se[0],e2b=se[1],c1=eCen(e1),c2=eCen(e2b);var dx=c2.x-c1.x,dy=c2.y-c1.y,d=Math.sqrt(dx*dx+dy*dy);var pr=pRect(),realD;if(sport==='football')realD=d*(105/pr.fw);else if(sport==='futsal')realD=d*(40/pr.fw);else if(sport==='basketball')realD=d*(28/pr.fw);else if(sport==='volleyball')realD=d*(18/pr.fw);else if(sport==='handball')realD=d*(40/pr.fw);else realD=d*(40/pr.fw);
toast(t('measure')+': '+realD.toFixed(1)+'m');}
// ============ TRAILS ============
var trails={};
function updateTrails(){els.forEach(function(el){if(isP2D(el.type)){if(!trails[el.id])trails[el.id]=[];trails[el.id].push({x:el.x,y:el.y});if(trails[el.id].length>20)trails[el.id].shift();}});}
function drawTrails(){if(!animPlaying)return;Object.keys(trails).forEach(function(id){var tr=trails[id];if(!tr||tr.length<2)return;cx.save();cx.strokeStyle='rgba(74,144,217,0.3)';cx.lineWidth=2;cx.beginPath();cx.moveTo(tr[0].x,tr[0].y);for(var i=1;i<tr.length;i++)cx.lineTo(tr[i].x,tr[i].y);cx.stroke();cx.restore();});}
function setPlayerStyle(s2){playerDisplayStyle=s2;try{localStorage.setItem('cb_display_style',s2);}catch(e){}els.forEach(function(el){if(isP2D(el.type))el.displayStyle=s2;});var body=document.getElementById('styleToggleBody');if(body)body.querySelectorAll('button').forEach(function(b){b.classList.toggle('on',b.dataset.style===s2);});render();}
function setOrientation(val,el){pitchOrientation=val;invalidatePRect();updateOrientDropdownUI();setupCanvas();render();var m=document.getElementById('orientMenu');if(m)m.classList.remove('show');}
function toggleAlignDropdown(){var m=document.getElementById('alignMenu');if(m)m.classList.toggle('show');}
function toggleSportDropdown(){var m=document.getElementById('sportMenu');if(m)m.classList.toggle('show');}
function setSport(s2){sport=s2;applySportUI();render();updateSportLabel();var m=document.getElementById('sportMenu');if(m)m.classList.remove('show');}
function updateSportLabel(){var lbl=document.getElementById('sportLabel');var labels={futsal:'فوتسال',football:'كرة قدم',beach:'شاطئية',mini:'مصغرة',basketball:'سلة',volleyball:'كرة طائرة',handball:'كرة يد'};if(lbl)lbl.textContent=labels[sport]||sport;}
function toggleOrientDropdown(){var m=document.getElementById('orientMenu');if(m){m.classList.toggle('show');}}
function updateOrientDropdownUI(){var lbl=document.getElementById('orientLabel');var items=document.querySelectorAll('#orientMenu .fs-option');var labels={landscape:lang==='ar'?'\u0623\u0641\u0642\u064a':'Horizontal',portrait:lang==='ar'?'\u0639\u0645\u0648\u062f\u064a':'Vertical'};if(lbl)lbl.textContent=labels[pitchOrientation]||labels.landscape;if(items){items.forEach(function(it){it.classList.remove('on');});var idx={landscape:0,portrait:1}[pitchOrientation];if(idx!==undefined&&items[idx])items[idx].classList.add('on');}}
function setDirectionOfPlay(dir){directionOfPlay=dir;render();}
function setFieldStyle(s2){fieldStyle=s2;try{localStorage.setItem('cb_field_style',s2);}catch(e){}if(s2==='realistic')loadDefaultPitchImages();updateFSDropdownUI();render();}
function toggleFSDropdown(){var m=document.getElementById('fsMenu');if(m){m.classList.toggle('show');if(m.classList.contains('show'))drawFSMiniPreviews();}}
function selectFieldStyle(s2,el){fieldStyle=s2;try{localStorage.setItem('cb_field_style',s2);}catch(e){}if(s2==='realistic')loadDefaultPitchImages();updateFSDropdownUI();render();var m=document.getElementById('fsMenu');if(m)m.classList.remove('show');}
function updateFSDropdownUI(){var lbl=document.getElementById('fsLabel');var items=document.querySelectorAll('#fsMenu .fs-option');
  if(lbl){lbl.textContent=fieldStyle==='svg'?(lang==='ar'?'تكتيكي':'Tactical'):(lang==='ar'?'واقعي':'Realistic');}
  items.forEach(function(it){it.classList.remove('on');});
  if(fieldStyle==='svg'&&items[0])items[0].classList.add('on');
  if(fieldStyle==='realistic'&&items[1])items[1].classList.add('on');
  drawFSMiniPreviews();}
function drawFSMiniPreviews(){drawMiniPreview('fspSvg','svg');drawMiniPreview('fspReal','realistic');}
function drawMiniPreview(id,mode){var c=document.getElementById(id);if(!c)return;var g=c.getContext('2d');var w=c.width,h=c.height;g.clearRect(0,0,w,h);g.fillStyle='#1a3a2a';g.fillRect(0,0,w,h);
  if(mode==='svg'){g.strokeStyle='rgba(255,255,255,0.8)';g.lineWidth=1;g.strokeRect(2,2,w-4,h-4);g.beginPath();g.moveTo(w/2,2);g.lineTo(w/2,h-2);g.stroke();g.beginPath();g.arc(w/2,h/2,h*0.25,0,Math.PI*2);g.stroke();}
  else if(mode==='realistic'){g.fillStyle='#1a7a3a';g.fillRect(0,0,w,h);g.strokeStyle='rgba(255,255,255,0.4)';g.lineWidth=1;g.strokeRect(2,2,w-4,h-4);g.beginPath();g.moveTo(w/2,2);g.lineTo(w/2,h-2);g.stroke();}}
document.addEventListener('click',function(e){var dd=document.getElementById('fsDropdown'),od=document.getElementById('orientDropdown'),ad=document.getElementById('alignDropdown'),sd=document.getElementById('sportDropdown');var m=document.getElementById('fsMenu'),om=document.getElementById('orientMenu'),am=document.getElementById('alignMenu'),sm=document.getElementById('sportMenu');if(dd&&!dd.contains(e.target)&&m)m.classList.remove('show');if(od&&!od.contains(e.target)&&om)om.classList.remove('show');if(ad&&!ad.contains(e.target)&&am)am.classList.remove('show');if(sd&&!sd.contains(e.target)&&sm)sm.classList.remove('show');});
function drawTeamLogos(sx,sy,sw,sh){
var tr=pTrapezoid();
if(tr){
  if(teamLogos.A&&teamLogos.A.complete&&teamLogos.A.naturalWidth>0){
    cx.save();cx.globalAlpha=teamLogoOpacity.A;
    var aLx=trapX(tr,'left',0.1),aRx=trapX(tr,'right',0.1);
    var aY=trapY(tr,0.25),aW=(aRx-aLx)*0.35,aH=tr.height*0.35;
    cx.drawImage(teamLogos.A,0,0,teamLogos.A.naturalWidth,teamLogos.A.naturalHeight,aLx+(aRx-aLx)*0.15,aY,aW,aH);
    cx.restore();}
  if(teamLogos.B&&teamLogos.B.complete&&teamLogos.B.naturalWidth>0){
    cx.save();cx.globalAlpha=teamLogoOpacity.B;
    var bLx=trapX(tr,'left',0.1),bRx=trapX(tr,'right',0.1);
    var bY=trapY(tr,0.25),bW=(bRx-bLx)*0.35,bH=tr.height*0.35;
    cx.drawImage(teamLogos.B,0,0,teamLogos.B.naturalWidth,teamLogos.B.naturalHeight,bLx+(bRx-bLx)*0.5,bY,bW,bH);
    cx.restore();}
}else{
if(teamLogos.A&&teamLogos.A.complete&&teamLogos.A.naturalWidth>0){
cx.save();cx.globalAlpha=teamLogoOpacity.A;
var lx2,ly2,lw2,lh2;
lx2=sx;ly2=sy;lw2=sw/2;lh2=sh;
cx.drawImage(teamLogos.A,0,0,teamLogos.A.naturalWidth,teamLogos.A.naturalHeight,lx2+lw2*0.3,ly2+lh2*0.2,lw2*0.4,lh2*0.6);
cx.restore();}
if(teamLogos.B&&teamLogos.B.complete&&teamLogos.B.naturalWidth>0){
cx.save();cx.globalAlpha=teamLogoOpacity.B;
var lx3,ly3,lw3,lh3;
lx3=sx+sw/2;ly3=sy;lw3=sw/2;lh3=sh;
cx.drawImage(teamLogos.B,0,0,teamLogos.B.naturalWidth,teamLogos.B.naturalHeight,lx3+lw3*0.3,ly3+lh3*0.2,lw3*0.4,lh3*0.6);
cx.restore();}}
}
function loadTeamLogo(team,input){if(!input.files||!input.files[0])return;var file=input.files[0];if(!validateImageFile(file,5))return;var reader=new FileReader();reader.onload=function(e){var img=new Image();img.onload=function(){teamLogos[team]=img;render();rebuildSettingsModal();};img.src=e.target.result;};reader.readAsDataURL(file);}
// ============ COACH INFO ============
function drawCoachInfo(){
var p=pRect();if(!p||p.w<50)return;
if(coachInfo.logo&&coachInfo.logo.complete&&coachInfo.logo.naturalWidth>0){
cx.save();cx.globalAlpha=coachInfo.logoOpacity;
var cx2=p.x+p.fw*coachInfo.logoX,cy2=p.y+p.fh*coachInfo.logoY;
var s2=coachInfo.logoSize;
cx.drawImage(coachInfo.logo,cx2-s2/2,cy2-s2/2,s2,s2);
cx.restore();}
if(coachInfo.name){
cx.save();cx.font='bold 11px Cairo,Inter';cx.textAlign='center';cx.textBaseline='top';
var cx3=p.x+p.fw*coachInfo.logoX,cy3=p.y+p.fh*coachInfo.logoY+coachInfo.logoSize/2+4;
cx.fillStyle='rgba(255,255,255,0.5)';cx.fillText(coachInfo.name,cx3,cy3);
cx.restore();}}
function loadCoachLogo(input){if(!input.files||!input.files[0])return;var file=input.files[0];if(!validateImageFile(file,5))return;var reader=new FileReader();reader.onload=function(e){var img=new Image();img.onload=function(){coachInfo.logo=img;render();rebuildSettingsModal();};img.src=e.target.result;};reader.readAsDataURL(file);}
// ============ FAVORITE COLORS ============
function loadFavColors(){try{var d=localStorage.getItem('cb_fav_colors');if(d)favoriteColors=JSON.parse(d);}catch(e){}}
function saveFavColors(){try{localStorage.setItem('cb_fav_colors',JSON.stringify(favoriteColors));}catch(e){}}
function addFavColor(c){if(favoriteColors.indexOf(c)<0){favoriteColors.push(c);saveFavColors();updateProps();}}
function removeFavColor(c){favoriteColors=favoriteColors.filter(function(x){return x!==c;});saveFavColors();updateProps();}
function saveNotes(){try{var na=document.getElementById('notesArea');if(na)localStorage.setItem('cb_notes',na.value);}catch(e){}}
function loadNotes(){try{var n=localStorage.getItem('cb_notes');if(n){var na=document.getElementById('notesArea');if(na)na.value=n;}}catch(e){}}
// ============ GENERIC PROMPT / CONFIRM MODALS ============
var _promptCallback=null,_confirmCallback=null;
function showPromptModal(title,defaultVal,callback){
  var tEl=document.getElementById('promptModalTitle'),iEl=document.getElementById('promptModalInput');
  if(tEl)tEl.textContent=title;if(iEl)iEl.value=defaultVal||'';
  _promptCallback=callback;document.getElementById('promptModal').classList.add('show');
  if(iEl){iEl.focus();iEl.select();}
}
function closePromptModal(confirmed){
  var iEl=document.getElementById('promptModalInput');
  document.getElementById('promptModal').classList.remove('show');
  if(_promptCallback)_promptCallback(confirmed,iEl?iEl.value:null);
  _promptCallback=null;
}
// Allow Enter to confirm in prompt modal
document.addEventListener('keydown',function(e){
  if(e.key==='Enter'&&document.getElementById('promptModal').classList.contains('show')){e.preventDefault();closePromptModal(true);}
  if(e.key==='Escape'&&document.getElementById('promptModal').classList.contains('show')){closePromptModal(false);}
  if(e.key==='Escape'&&document.getElementById('confirmModal').classList.contains('show')){closeConfirmModal(false);}
  if(e.key==='Enter'&&document.getElementById('textModal').classList.contains('show')&&e.target.id==='txtModalInput'){e.preventDefault();confirmTextModal();}
  if(e.key==='Escape'&&document.getElementById('textModal').classList.contains('show')){e.preventDefault();closeTextModal();}
});
function showConfirmModal(title,msg,callback){
  var tEl=document.getElementById('confirmModalTitle'),mEl=document.getElementById('confirmModalMsg');
  if(tEl)tEl.textContent=title;if(mEl)mEl.textContent=msg;
  _confirmCallback=callback;document.getElementById('confirmModal').classList.add('show');
}
function closeConfirmModal(confirmed){
  document.getElementById('confirmModal').classList.remove('show');
  if(_confirmCallback)_confirmCallback(confirmed);
  _confirmCallback=null;
}
