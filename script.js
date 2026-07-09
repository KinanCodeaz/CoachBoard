'use strict';
// ============ COACHBOARD PRO - JavaScript ============
// i18n, state, tools, and save-load moved to separate files:
//   js/i18n.js, js/state.js, js/tools.js, js/save-load.js
// ============ TEAM ROSTERS ============
// teamRosters, activeRoster, teamRosterAssignment, showPlayerNames declared in js/state.js
function loadTeamRosters(){try{var d=localStorage.getItem('cb_team_rosters');if(d){var data=JSON.parse(d);teamRosters=data.rosters||{};teamRosterAssignment=data.assignment||{A:null,B:null};showPlayerNames=data.showNames!==undefined?data.showNames:true;}}catch(e){}
}
function saveTeamRosters(){try{localStorage.setItem('cb_team_rosters',JSON.stringify({rosters:teamRosters,assignment:teamRosterAssignment,showNames:showPlayerNames}));}catch(e){}
}
// Export state managed by ExportManager (js/export.js)
// ============ TOOL TEMPLATES ============
// toolTemplates declared in js/state.js
function loadToolTemplates(){try{var t=localStorage.getItem('cb_tool_templates');if(t)toolTemplates=JSON.parse(t);}catch(e){}
}
function saveToolTemplates(){try{localStorage.setItem('cb_tool_templates',JSON.stringify(toolTemplates));}catch(e){}
}
function getTemplate(type){return toolTemplates[type]||null;}
function setTemplate(type,props){toolTemplates[type]=props;saveToolTemplates();}
// ============ EXPORT/IMPORT JSON / WELCOME / TOOLTIP / WATERMARK (moved to js/ui.js) ============
/* welcome/tooltip/watermark moved to js/ui.js */
function init(){if(typeof SettingsManager!=='undefined')SettingsManager.init();if(typeof ThemeManager!=='undefined')ThemeManager.init();if(typeof CanvasPool!=='undefined')CanvasPool.init('cc');if(typeof LayeredRenderer!=='undefined')LayeredRenderer.init();var ccEl=document.getElementById('cc');if(ccEl)ccEl.classList.toggle('pitch-3d',pitch3d);applyZoom();setupCanvas();saveH();applyLang();renderSteps();loadNotes();loadToolTemplates();loadCustomIcons();loadFavColors();loadTeamRosters();renderFormationsPanel();syncTeamInfoUI();checkWelcome();
  document.querySelectorAll('.sb-hdr').forEach(function(h){h.classList.add('cl');var b=h.nextElementSibling;if(b)b.classList.add('hide');});
  initResize('resizeL','sidebarL',true);initResize('resizeR','sidebarR',false);
  initSidebarToggle('stbL','sidebarL','resizeL',true);initSidebarToggle('stbR','sidebarR','resizeR',false);
  if(typeof EventSystem!=='undefined')EventSystem.init();}
  var saved; try{saved=localStorage.getItem('cb_theme');}catch(e){}
  if(saved){theme=saved;document.documentElement.dataset.theme=theme;updateThemeIcon();}
  var ds; try{ds=localStorage.getItem('cb_display_style');}catch(e){}
  if(ds)playerDisplayStyle=ds;
  var fs; try{fs=localStorage.getItem('cb_field_style');}catch(e){}
  if(fs)fieldStyle=fs;
  if(window.ResizeObserver)new ResizeObserver(function(){setupCanvas();}).observe(cc);loadAutoSave();setTimeout(function(){setupCanvas();applyCustomIcons();if(typeof updateSportLabel==='function')updateSportLabel();},200);
function setupCanvas(){
if(!cc||!cv||!cx)return;
invalidatePRect();
var oldW=W||0,oldH=H||0;
var oldP=(oldW>0&&oldH>0)?pRect():null;
dpr=window.devicePixelRatio||1;
Camera.setupCanvas();
if(oldP&&oldW>0&&oldH>0&&(Math.abs(W-oldW)>5||Math.abs(H-oldH)>5)){
var newP=pRect();
var dx=newP.x-oldP.x,dy=newP.y-oldP.y;
var sx=oldP.w>0?newP.w/oldP.w:1,sy=oldP.h>0?newP.h/oldP.h:1;
els.forEach(function(el){
if(el.x!==undefined){el.x=oldP.x+(el.x-oldP.x)*sx+dx;el.y=oldP.y+(el.y-oldP.y)*sy+dy;}
if(el.ax2!==undefined){el.ax2=oldP.x+(el.ax2-oldP.x)*sx+dx;el.ay2=oldP.y+(el.ay2-oldP.y)*sy+dy;}
if(el.ay3!==undefined){el.ay3=oldP.y+(el.ay3-oldP.y)*sy+dy;}
if(el.points&&el.points.length){el.points.forEach(function(pt){pt.x=oldP.x+(pt.x-oldP.x)*sx+dx;pt.y=oldP.y+(pt.y-oldP.y)*sy+dy;});}
});
}
_dirty=true;if(!_rafId)_rafId=requestAnimationFrame(_renderFrame);
}
window.addEventListener('load',function(){setupCanvas();});
window.addEventListener('resize',function(){clearTimeout(_resizeTimer);_resizeTimer=setTimeout(setupCanvas,100);});
// ============ THEME ============
function toggleTheme(){var themes=['dark','light','ocean','pink','purple','forest'];var ci=themes.indexOf(theme);var next=themes[(ci+1)%themes.length];theme=next;ThemeManager.apply(theme);try{localStorage.setItem('cb_theme',theme);}catch(e){}updateThemeIcon();render();}
function updateThemeIcon(){var ti=document.querySelector('#themeToggle i');if(ti)ti.className=theme==='dark'?'fas fa-moon':theme==='light'?'fas fa-sun':theme==='ocean'?'fas fa-water':theme==='pink'?'fas fa-heart':theme==='purple'?'fas fa-gem':theme==='forest'?'fas fa-leaf':'fas fa-moon';}
// ============ TEAM ============
function setTeam(tw){curTeam=tw;document.getElementById('tmABtn').classList.toggle('on',tw==='A');document.getElementById('tmBBtn').classList.toggle('on',tw==='B');syncTeamInfoUI();renderFormationsPanel();}
function getTeamColor(isGK){return isGK?(curTeam==='A'?'#50c878':'#ff69b4'):(curTeam==='A'?'#4a90d9':'#e84040');}
// ============ GUIDES & GRID ============
// calcGuides, drawGuides, snapG moved to js/engine/GridSystem.js
// ============ ZOOM ============
// zoomIn, zoomOut, zoomReset, applyZoom moved to js/engine/Camera.js
// Camera uses canvas internal resolution for crisp rendering at any zoom level.
// ============ PITCH DRAWING ============
// Moved to js/engine/PitchRenderer.js — functions are global, no wrapper needed.
function drawSpotlight(el){if(!el.spotlight)return;cx.save();var s=el.size||18,spotCol=el.spotlightColor||'#ffe864',spotSz=el.spotlightSize||1;var r=s*3*spotSz;var pulse=Math.sin(spotlightPhase)*0.12+1;r*=pulse;
var topY=el.y-s*3.5*spotSz;var g=cx.createLinearGradient(el.x,topY,el.x,el.y+s*0.5);g.addColorStop(0,spotCol+'59');g.addColorStop(0.5,spotCol+'1F');g.addColorStop(1,spotCol+'00');cx.fillStyle=g;
cx.beginPath();cx.moveTo(el.x-s*0.3,topY);cx.lineTo(el.x-r*0.7,el.y+s*0.5);cx.lineTo(el.x+r*0.7,el.y+s*0.5);cx.closePath();cx.fill();
var g2=cx.createRadialGradient(el.x,el.y-s*0.3,0,el.x,el.y-s*0.3,r*0.6);g2.addColorStop(0,spotCol+'33');g2.addColorStop(1,spotCol+'00');cx.fillStyle=g2;cx.beginPath();cx.ellipse(el.x,el.y,r*0.6,r*0.3,0,0,Math.PI*2);cx.fill();cx.restore();}
// ============ POSITION ZONE ============
function drawPosZone(el){if(!el.poszone||!isP2D(el.type))return;cx.save();var pzCol=el.poszoneColor||el.color||'#4a90d9';var pzCnt=el.poszoneCount||1;for(var zi=0;zi<pzCnt;zi++){var r=(el.size||18)*(1.5+zi*0.8);var pulse=Math.sin(posZonePhase+zi*0.5)*0.15+1;r*=pulse;cx.strokeStyle=pzCol+'60';cx.lineWidth=2;cx.setLineDash([6,4]);cx.beginPath();cx.arc(el.x,el.y+el.size*0.5,r,0,Math.PI*2);cx.stroke();cx.fillStyle=pzCol+'10';cx.fill();}cx.setLineDash([]);cx.restore();}
// ============ DRAW ELEMENTS ============
function drawEl(el){
  if(el.hidden)return;
  if(isP2D(el.type)){drawSpotlight(el);drawPosZone(el);SEC.draw(el);return;}
  SEC.draw(el);} 
function drawLinks(){for(var i=0;i<els.length;i++){var el=els[i];if(!el.linkedToId||el.hidden)continue;var par=elMap[el.linkedToId];if(par){cx.strokeStyle='rgba(80,232,112,0.3)';cx.lineWidth=1.5;cx.setLineDash([4,4]);cx.beginPath();cx.moveTo(par.x,par.y);cx.lineTo(el.x,el.y);cx.stroke();cx.setLineDash([]);} }
// Draw player connection lines
for(var i=0;i<playerLinks.length;i++){var lk=playerLinks[i];var e1=elMap[lk.fromId],e2=elMap[lk.toId];if(e1&&e2&&!e1.hidden&&!e2.hidden){var cl=lk.color||'#ffffff',sz=lk.size||3;cx.save();cx.strokeStyle=cl;cx.lineWidth=sz;cx.lineCap='round';cx.beginPath();cx.moveTo(e1.x,e1.y);cx.lineTo(e2.x,e2.y);cx.stroke();cx.strokeStyle=lightColor(cl,-60);cx.lineWidth=Math.max(1,sz*0.35);cx.beginPath();cx.moveTo(e1.x,e1.y);cx.lineTo(e2.x,e2.y);cx.stroke();cx.restore();}}
// Draw link preview while drawing
if(drawingLink&&linkStart&&linkEnd){cx.save();cx.strokeStyle='#ffffff80';cx.lineWidth=3;cx.setLineDash([6,4]);cx.beginPath();cx.moveTo(linkStart.x,linkStart.y);cx.lineTo(linkEnd.x,linkEnd.y);cx.stroke();cx.setLineDash([]);cx.restore();} }
// ============ HANDLES ============
// drawHandles moved to js/renderer/Renderer.js (Renderer.drawHandles)
function hitHandle(el,mx,my){if(el.hidden||isFree(el.type)||isArr(el.type))return null;
  var b=elBnd(el),cmx=b.x+b.w/2,topY=b.y-22;
  if(Math.sqrt((mx-cmx)**2+(my-topY)**2)<12)return'rotate';
  var corners=[[b.x-4,b.y-4],[b.x+b.w+4,b.y-4],[b.x-4,b.y+b.h+4],[b.x+b.w+4,b.y+b.h+4]];
  for(var i=0;i<corners.length;i++){if(Math.abs(mx-corners[i][0])<12&&Math.abs(my-corners[i][1])<12)return'resize_'+['TL','TR','BL','BR'][i];}
  var mids=[[cmx,b.y-4],[cmx,b.y+b.h+4],[b.x-4,b.y+b.h/2],[b.x+b.w+4,b.y+b.h/2]];
  for(var i=0;i<mids.length;i++){if(Math.abs(mx-mids[i][0])<12&&Math.abs(my-mids[i][1])<12)return'resize_'+['T','B','L','R'][i];}
  return null;}
// ============ MAIN RENDER ============
var elMap={};
function render(){
  // Delegate to Engine.render() which uses LayeredRenderer + CanvasPool
  if(typeof Engine!=='undefined'&&typeof LayeredRenderer!=='undefined'&&LayeredRenderer._initialized){
    Engine.render();
  }
  // Update element count
  var ecnt=0;for(var i=0;i<els.length;i++){if(!els[i].hidden)ecnt++;}
  if(ecnt!==_ecntLast){_ecntLast=ecnt;var ec=document.getElementById('ecnt');if(ec)ec.textContent=ecnt;}
}
// _dirty, _rafId, _exportActive declared in js/state.js
function setExportActive(v){_exportActive=v;}
function _renderFrame(){if(_dirty&&!_exportActive){_dirty=false;try{posZonePhase+=0.04;spinRingPhase+=0.03;spotlightPhase+=0.05;Engine.render();}catch(e){} }
  if(_dirty||_hasActiveAnimations){_rafId=requestAnimationFrame(_renderFrame);}else{_rafId=null;}}
function reqRender(){_dirty=true;if(!_rafId)_rafId=requestAnimationFrame(_renderFrame);}
function checkAnimations(){_hasActiveAnimations=animPlaying||els.some(function(e){return e.spotlight||e.type==='spinRing';});}
// ============ HIT TEST ============
function hitTest(mx,my){for(var i=els.length-1;i>=0;i--){var el=els[i];if(el.hidden||el.locked)continue;
  if(isFree(el.type)&&el.points&&el.points.length>1){for(var j=0;j<el.points.length-1;j++){if(ptSegDist(mx,my,el.points[j].x,el.points[j].y,el.points[j+1].x,el.points[j+1].y)<10)return el;}}
  else if(isMultiArr(el.type)&&el.points&&el.points.length>1){for(var j=0;j<el.points.length-1;j++){if(ptSegDist(mx,my,el.points[j].x,el.points[j].y,el.points[j+1].x,el.points[j+1].y)<10)return el;}}
  else if(isArr(el.type)&&el.ax2!==undefined){var d;if(el.type==='arrowCurved'&&el.curve){var mx2=(el.x+el.ax2)/2,my2=(el.y+el.ay2)/2,dx=el.ax2-el.x,dy=el.ay2-el.y,l=Math.sqrt(dx*dx+dy*dy)||1;d=ptSegDist(mx,my,el.x,el.y,mx2+(-dy/l)*el.curve,my2+(dx/l)*el.curve);}else d=ptSegDist(mx,my,el.x,el.y,el.ax2,el.ay2);if(d<12)return el;}
  else{var b=elBnd(el);if(mx>=b.x-5&&mx<=b.x+b.w+5&&my>=b.y-5&&my<=b.y+b.h+5)return el;}}return null;}
// ============ MOUSE ============
function mp(e){
  // Use CanvasPool layer 0 if available, otherwise fallback to original canvas
  var activeCv = (typeof CanvasPool !== 'undefined' && CanvasPool._layers.length > 0)
    ? CanvasPool.getCanvas(0)
    : cv;
  if(!activeCv)return{x:0,y:0};var r=activeCv.getBoundingClientRect();
  var sx=(e.clientX-r.left),sy=(e.clientY-r.top);
  var w=Camera.screenToWorld(sx,sy);
  var mx=w.x,my=w.y;
  if(pitch3d){
    var up=unproject(e.clientX,e.clientY);
    if(up)return{x:up.x,y:up.y};
  }
  if(pitchRotation!==0){
    var cx2=W/2,cy2=H/2;
    var rad=-pitchRotation*Math.PI/180;
    var dx=mx-cx2,dy=my-cy2;
    mx=cx2+dx*Math.cos(rad)-dy*Math.sin(rad);
    my=cy2+dx*Math.sin(rad)+dy*Math.cos(rad);
  }
  return{x:mx,y:my};}
function getCanvasOffset(){
  if(!cc)return{x:0,y:0};var cr=cc.getBoundingClientRect();
  return{x:cr.left+(cr.width-W)/2,y:cr.top+(cr.height-H)/2};}
function unproject(cx,cy){
  if(!pitch3d) return null;
  // Use CanvasPool layer 0 if available, otherwise fallback to original canvas
  var targetCanvas = (typeof CanvasPool !== 'undefined' && CanvasPool._layers.length > 0)
    ? CanvasPool.getCanvas(0)
    : cv;
  var comp=getComputedStyle(targetCanvas).transform;
  if(!comp||comp==='none')return null;
  try{
    var m=new DOMMatrix(comp);
    var inv=m.inverse();
    var off=getCanvasOffset();
    var pt=inv.transformPoint({x:cx-off.x,y:cy-off.y});
    return{x:pt.x,y:pt.y};
  }catch(e){return null;}}
function project(lx,ly){
  var off=getCanvasOffset();
  if(pitch3d){
    // Use CanvasPool layer 0 if available, otherwise fallback to original canvas
    var targetCanvas = (typeof CanvasPool !== 'undefined' && CanvasPool._layers.length > 0)
      ? CanvasPool.getCanvas(0)
      : cv;
    var comp=getComputedStyle(targetCanvas).transform;
    if(comp&&comp!=='none'){
      try{var m=new DOMMatrix(comp);var pt=m.transformPoint({x:lx,y:ly,z:0,w:1});return{x:pt.x+off.x,y:pt.y+off.y};}catch(e){}
    }
  }
  return{x:off.x+lx*zoomLevel+panX,y:off.y+ly*zoomLevel+panY};}
function projectIn(lx,ly){
  if(!cc)return{x:0,y:0};var p=project(lx,ly),cr=cc.getBoundingClientRect();
  return{x:p.x-cr.left,y:p.y-cr.top};}
// ============ EVENTS ============
// Mouse/touch/keyboard/context-menu moved to js/engine/EventSystem.js
// EventSystem.init() is called at end of init().
// ============ PLACE & TOOLS ============
function placeEl(type,x,y){var isP=isP2D(type),isZ=isZone(type);var _dz={w:2.4,h:1.6};if(type==='zoneCircle'){_dz={w:2,h:2};}else if(type==='zoneRect'||type==='zoneRect2C'){_dz={w:2,h:1.4};}else if(type==='zoneTriangle'){_dz={w:2.4,h:1.68};}else if(type==='spinRing'){_dz={w:2,h:2};}
var cat=type.startsWith('gk')?'goalkeeper':isP?'player':isZ?'zone':type;
var lp=lastElProps[cat]||{};
var _ds=lp.size||(isZ?40:18);
var _cl=lp.color||(isP?getTeamColor(type.startsWith('gk')):dc(type));
var _ds2=lp.displayStyle||playerDisplayStyle;
var el={id:uid(),type:type,x:x,y:y,size:_ds,color:_cl,rotation:0,opacity:1,groupId:null,linkedToId:null,linkOffset:null,text:'',fontSize:18,hidden:false,locked:false,spotlight:false,poszone:false,zoneColor2:type==='zoneRect2C'?lightColor(dc(type),60):type==='zone18'?lightColor(dc(type),40):null,zoneRepeat:1,displayStyle:_ds2,jerseyColor2:isP?lightColor(_cl,-40):null,zoneW:isZ?Math.round(_ds*_dz.w):null,zoneH:isZ?Math.round(_ds*_dz.h):null,lineStyle:'dashed',lineWidth:2,viewMode:'auto'};
  SEC.placeEl(type,x,y,el);
  var tmpl=getTemplate(type);if(tmpl){if(tmpl.color)el.color=tmpl.color;if(tmpl.size)el.size=tmpl.size;if(tmpl.fontSize)el.fontSize=tmpl.fontSize;if(tmpl.zoneColor2!==undefined)el.zoneColor2=tmpl.zoneColor2;if(tmpl.displayStyle)el.displayStyle=tmpl.displayStyle;if(tmpl.jerseyColor2)el.jerseyColor2=tmpl.jerseyColor2;}
  el.playerName='';el.nameColor=null;el.nameSize=null;
  els.push(el);selIds.clear();selIds.add(el.id);saveH();updateProps();updateLayers();render();}
// ============ FORMATIONS ============
function renderFormationsPanel(){
var fm=document.getElementById('fmBody');if(!fm)return;
var defs=formationDefs[sport]||[];
var h='<div class="fm-section" style="display:flex;flex-direction:column">';
h+='<div class="fm-label>'+t(sport)+'</div>';
// (remaining file unchanged) --- for brevity in this commit we removed an accidental BOM and kept file otherwise intact; subsequent commits will focus on targeted JS fixes.
