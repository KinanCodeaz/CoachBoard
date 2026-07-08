'use strict';
// ============ COACHBOARD PRO - JavaScript ============
// i18n, state, tools, and save-load moved to separate files:
//   js/i18n.js, js/state.js, js/tools.js, js/save-load.js
// ============ TEAM ROSTERS ============
// teamRosters, activeRoster, teamRosterAssignment, showPlayerNames declared in js/state.js
function loadTeamRosters(){try{var d=localStorage.getItem('cb_team_rosters');if(d){var data=JSON.parse(d);teamRosters=data.rosters||{};teamRosterAssignment=data.assignment||{A:null,B:null};showPlayerNames=data.showNames!==undefined?data.showNames:true;}}catch(e){}}
function saveTeamRosters(){try{localStorage.setItem('cb_team_rosters',JSON.stringify({rosters:teamRosters,assignment:teamRosterAssignment,showNames:showPlayerNames}));}catch(e){}}
// Export state managed by ExportManager (js/export.js)
// ============ TOOL TEMPLATES ============
// toolTemplates declared in js/state.js
function loadToolTemplates(){try{var t=localStorage.getItem('cb_tool_templates');if(t)toolTemplates=JSON.parse(t);}catch(e){}}
function saveToolTemplates(){try{localStorage.setItem('cb_tool_templates',JSON.stringify(toolTemplates));}catch(e){}}
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
function drawLinks(){for(var i=0;i<els.length;i++){var el=els[i];if(!el.linkedToId||el.hidden)continue;var par=elMap[el.linkedToId];if(par){cx.strokeStyle='rgba(80,232,112,0.3)';cx.lineWidth=1.5;cx.setLineDash([4,4]);cx.beginPath();cx.moveTo(par.x,par.y);cx.lineTo(el.x,el.y);cx.stroke();cx.setLineDash([]);}}
// Draw player connection lines
for(var i=0;i<playerLinks.length;i++){var lk=playerLinks[i];var e1=elMap[lk.fromId],e2=elMap[lk.toId];if(e1&&e2&&!e1.hidden&&!e2.hidden){var cl=lk.color||'#ffffff',sz=lk.size||3;cx.save();cx.strokeStyle=cl;cx.lineWidth=sz;cx.lineCap='round';cx.beginPath();cx.moveTo(e1.x,e1.y);cx.lineTo(e2.x,e2.y);cx.stroke();cx.strokeStyle=lightColor(cl,-60);cx.lineWidth=Math.max(1,sz*0.35);cx.beginPath();cx.moveTo(e1.x,e1.y);cx.lineTo(e2.x,e2.y);cx.stroke();cx.restore();}}
// Draw link preview while drawing
if(drawingLink&&linkStart&&linkEnd){cx.save();cx.strokeStyle='#ffffff80';cx.lineWidth=3;cx.setLineDash([6,4]);cx.beginPath();cx.moveTo(linkStart.x,linkStart.y);cx.lineTo(linkEnd.x,linkEnd.y);cx.stroke();cx.setLineDash([]);cx.restore();}}
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
function _renderFrame(){if(_dirty&&!_exportActive){_dirty=false;try{posZonePhase+=0.04;spinRingPhase+=0.03;spotlightPhase+=0.05;Engine.render();}catch(e){}}
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
h+='<div class="fm-label">'+t(sport)+'</div>';
h+='<div class="fm-row">';
defs.forEach(function(d){
var active=(teamFormations[curTeam]&&teamFormations[curTeam].fmt===d[0])?' style="border-color:var(--accent);color:var(--accent)"':'';
h+='<button class="fm-btn"'+active+' onclick="placeFormation(\''+sport+'\',\''+d[0]+'\')" onmouseenter="showFormationTooltip(\''+d[1]+'\',event)" onmouseleave="hideFormationTooltip()">'+d[1]+'</button>';
});
h+='</div></div>';
fm.innerHTML=h;}
function placeFormation(sportType,fmt){
var p=pRect();
var isTeamB=curTeam==='B';
// Capture properties from existing formation players before removing
var existingFormationEls=els.filter(function(el){return el._formationTeam===curTeam;});
if(existingFormationEls.length>0){
var sample=existingFormationEls[0];
teamFormationProps[curTeam]={size:sample.size,displayStyle:sample.displayStyle,opacity:sample.opacity,jerseyColor2:sample.jerseyColor2,spotlight:sample.spotlight,poszone:sample.poszone};
// Capture color separately for field players vs GK
var fieldPlayer=existingFormationEls.find(function(e){return e.type!=='gk_stand';});
var gkPlayer=existingFormationEls.find(function(e){return e.type==='gk_stand';});
if(fieldPlayer)teamFormationProps[curTeam].fieldColor=fieldPlayer.color;
if(gkPlayer)teamFormationProps[curTeam].gkColor=gkPlayer.color;
}
// Remove previous formation players for this team
var idsToRemove=[];
els.forEach(function(el){if(el._formationTeam===curTeam)idsToRemove.push(el.id);});
idsToRemove.forEach(function(id){var idx=els.findIndex(function(e){return e.id===id;});if(idx>=0)els.splice(idx,1);});
teamFormations[curTeam]={sport:sportType,fmt:fmt};
var positions=getFormationPositions(sportType,fmt,p,isTeamB);
selIds.clear();
// Use saved properties or defaults
var savedProps=teamFormationProps[curTeam];
var defaultTeamColor=isTeamB?'#e84040':'#4a90d9';
var defaultGkColor=isTeamB?'#ff69b4':'#50c878';
var teamColor=savedProps&&savedProps.fieldColor?savedProps.fieldColor:defaultTeamColor;
var gkColor=savedProps&&savedProps.gkColor?savedProps.gkColor:defaultGkColor;
var pSize=savedProps&&savedProps.size?savedProps.size:18;
var pStyle=savedProps&&savedProps.displayStyle?savedProps.displayStyle:playerDisplayStyle;
var pOpacity=savedProps&&savedProps.opacity!==undefined?savedProps.opacity:1;
var assignedRoster=teamRosterAssignment[curTeam];
positions.forEach(function(pos,i){
var isGK=i===0;
var cl=isGK?gkColor:teamColor;
var playerName='';
var elText=String(i+1);
if(assignedRoster&&teamRosters[assignedRoster]){
var fieldPlayers=teamRosters[assignedRoster].players.filter(function(pl){return !pl.bench;});
if(i<fieldPlayers.length){
playerName=fieldPlayers[i].name||'';
if(fieldPlayers[i].num!==undefined)elText=String(fieldPlayers[i].num);
}}
var photoUrl=assignedRoster&&teamRosters[assignedRoster]&&teamRosters[assignedRoster].players[i]?teamRosters[assignedRoster].players[i].photo||'':'';
var nickname=assignedRoster&&teamRosters[assignedRoster]&&teamRosters[assignedRoster].players[i]?teamRosters[assignedRoster].players[i].nickname||'':'';
var el={id:uid(),type:isGK?'gk_stand':'p_stand',x:pos.x,y:pos.y,size:pSize,color:cl,rotation:0,opacity:pOpacity,groupId:null,linkedToId:null,linkOffset:null,text:elText,fontSize:18,hidden:false,locked:false,spotlight:savedProps?!!savedProps.spotlight:false,poszone:savedProps?!!savedProps.poszone:false,zoneColor2:null,displayStyle:pStyle,jerseyColor2:savedProps&&savedProps.jerseyColor2?savedProps.jerseyColor2:lightColor(cl,-40),_formationTeam:curTeam,playerName:playerName,playerNickname:nickname,playerPhoto:photoUrl,nameColor:null,nameSize:null};
els.push(el);selIds.add(el.id);});
// =========== BENCH + COACH AS ELEMENTS ===========
if(assignedRoster&&teamRosters[assignedRoster]){
var roster=teamRosters[assignedRoster];
var benchPlayers=roster.players.filter(function(pl){return pl.bench;});
var coachName=roster.coachName||'';
var bSize=pSize,bgap=Math.max(40,bSize*3.5),rowMax=5;
if(bSize<14)bSize=14;
var hasCoach=!!coachName;
var benchItems=[];
if(hasCoach)benchItems.push({_isCoach:true,name:coachName});
benchPlayers.forEach(function(pl){benchItems.push({_isBench:true,pl:pl});});
var benchRows=Math.ceil(benchItems.length/rowMax);
var dir=isTeamB?1:-1;
var rs=bSize*4.5;
var blockH=(benchRows-1)*rs;
var baseY;
if(isTeamB){
var spTop=p.y+p.h+bSize*2;var spBot=H-bSize*2;
if(blockH<=spBot-spTop) baseY=Math.round((spTop+spBot-blockH)/2);
else baseY=spTop;
}else{
var spTop=bSize*2;var spBot=p.y-bSize*2;
if(blockH<=spBot-spTop) baseY=Math.round((spTop+spBot+blockH)/2);
else baseY=spBot;
}
// Horizontal: position on team's side (left for A, right for B)
var benchSideX=isTeamB?p.x+p.w-bSize*2:p.x+bSize*2;
benchItems.forEach(function(item,idx){
var rowIdx=Math.floor(idx/rowMax);
var colIdx=idx%rowMax;
var rowTotal=Math.min(rowMax,benchItems.length-rowIdx*rowMax);
var rowW=(rowTotal-1)*bgap;
var ix=benchSideX+colIdx*bgap+(isTeamB?-rowW:0);
var iy=baseY+dir*rowIdx*rs;
if(item._isCoach){
els.push({id:uid(),type:'p_stand',x:ix,y:iy,size:bSize,color:'#ffc107',rotation:0,opacity:0.95,groupId:null,linkedToId:null,linkOffset:null,text:'C',fontSize:bSize*0.5,hidden:false,locked:false,spotlight:false,poszone:false,zoneColor2:null,displayStyle:'circle',jerseyColor2:'transparent',_formationTeam:curTeam,_isCoach:true,playerName:item.name||t('coach'),nameColor:'#ffc107',nameSize:Math.max(7,bSize*0.36)});selIds.add(els[els.length-1].id);
} else {
var pl=item.pl;
els.push({id:uid(),type:'p_stand',x:ix,y:iy,size:bSize,color:teamColor,rotation:0,opacity:0.9,groupId:null,linkedToId:null,linkOffset:null,text:String(pl.num||''),fontSize:bSize*0.5,hidden:false,locked:false,spotlight:false,poszone:false,zoneColor2:null,displayStyle:'circle',jerseyColor2:'transparent',_formationTeam:curTeam,_isBench:true,playerName:pl.name||'',playerNickname:pl.nickname||'',playerPhoto:pl.photo||'',nameColor:null,nameSize:Math.max(7,bSize*0.36)});selIds.add(els[els.length-1].id);
}
});
}
saveH();updateProps();updateLayers();renderFormationsPanel();render();toast(t('formation_placed')+' - '+(isTeamB?t('teamB'):t('teamA')));}
function getFormationPositions(sportType,fmt,p,isTeamB){
var pl=p;
var midY=pl.y+pl.h/2;
var positions=[];
var gkX,fieldL,fieldR;
if(!isTeamB){
gkX=pl.x+pl.w*0.06;fieldL=pl.x+pl.w*0.12;fieldR=pl.x+pl.w*0.48;
}else{
gkX=pl.x+pl.w*0.94;fieldL=pl.x+pl.w*0.88;fieldR=pl.x+pl.w*0.52;
}
positions.push(toScreen(gkX,midY));
var lines=[];
if(sportType==='futsal'){
if(fmt==='121')lines=[1,2,1];else if(fmt==='130')lines=[1,3];else if(fmt==='211')lines=[2,1,1];else if(fmt==='31')lines=[3,1];else if(fmt==='40')lines=[4];
}else if(sportType==='football'){
if(fmt==='442')lines=[4,4,2];else if(fmt==='433')lines=[4,3,3];else if(fmt==='352')lines=[3,5,2];else if(fmt==='4231')lines=[4,2,3,1];
}else if(sportType==='beach'){
if(fmt==='22')lines=[2,2];else if(fmt==='121')lines=[1,2,1];else if(fmt==='31')lines=[3,1];
}else if(sportType==='mini'){
if(fmt==='21')lines=[2,1];else if(fmt==='12')lines=[1,2];else if(fmt==='22')lines=[2,2];
}else if(sportType==='basketball'){
if(!isTeamB){fieldR=pl.x+pl.w*0.45;positions[0]=toScreen(pl.x+pl.w*0.08,midY);}
else{fieldR=pl.x+pl.w*0.55;fieldL=pl.x+pl.w*0.88;positions[0]=toScreen(pl.x+pl.w*0.92,midY);}
if(fmt==='5')lines=[2,1,2];else if(fmt==='131')lines=[1,3,1];else if(fmt==='212')lines=[2,1,2];
}else if(sportType==='volleyball'){
if(!isTeamB){fieldL=pl.x+pl.w*0.15;fieldR=pl.x+pl.w*0.45;positions[0]=toScreen(pl.x+pl.w*0.08,midY);}
else{fieldL=pl.x+pl.w*0.85;fieldR=pl.x+pl.w*0.55;positions[0]=toScreen(pl.x+pl.w*0.92,midY);}
if(fmt==='42')lines=[2,2,1];else if(fmt==='33')lines=[3,2];
}else if(sportType==='handball'){
if(fmt==='60')lines=[6];else if(fmt==='51')lines=[5,1];else if(fmt==='33')lines=[3,3];
}
for(var li=0;li<lines.length;li++){
var cnt=lines[li];
var lx;
if(!isTeamB){lx=fieldL+(fieldR-fieldL)*(li+1)/(lines.length+1);}
else{lx=fieldL-(fieldL-fieldR)*(li+1)/(lines.length+1);}
for(var pi=0;pi<cnt;pi++){
var ly=pl.y+pl.h*(pi+1)/(cnt+1);
var sp=toScreen(lx,ly);
positions.push({x:sp.x,y:sp.y});}}
  return positions;}
// ============ TEAM NAME & SCORE ============
function updateTeamName(val){teamNames[curTeam]=val;saveH();render();}
function updateTeamScore(val){teamScores[curTeam]=Math.max(0,Math.min(99,val||0));saveH();render();}
function syncTeamInfoUI(){
var ni=document.getElementById('teamNameInput');
var si=document.getElementById('teamScoreInput');
if(ni)ni.value=teamNames[curTeam]||'';
if(si)si.value=teamScores[curTeam]||0;}
function drawTeamInfo(){
var p=pRect();if(!p||p.w<50)return;
if(teamNames.A||teamScores.A>0){
var parts=[];
if(teamNames.A)parts.push(teamNames.A);
if(teamScores.A>0)parts.push(teamScores.A);
var label=parts.join(' ');
cx.save();cx.font='bold 14px Cairo,Inter';cx.textAlign='center';cx.textBaseline='bottom';
var ax=p.x+p.w*0.25,ay=p.y-6;
cx.fillStyle='rgba(74,144,217,0.8)';cx.shadowColor='rgba(0,0,0,0.5)';cx.shadowBlur=3;
cx.fillText(label,ax,ay);cx.shadowBlur=0;cx.restore();}
if(teamNames.B||teamScores.B>0){
var parts=[];
if(teamNames.B)parts.push(teamNames.B);
if(teamScores.B>0)parts.push(teamScores.B);
var label=parts.join(' ');
cx.save();cx.font='bold 14px Cairo,Inter';cx.textAlign='center';cx.textBaseline='bottom';
var bx=p.x+p.w*0.75,by=p.y-6;
cx.fillStyle='rgba(232,64,64,0.8)';cx.shadowColor='rgba(0,0,0,0.5)';cx.shadowBlur=3;
cx.fillText(label,bx,by);cx.shadowBlur=0;cx.restore();}}
// setTool, keyboard, history, save/load, toast moved to js/tools.js and js/save-load.js
// ============ EXPORT: Handled by js/export.js (ExportManager) ============
// ============ NOTES ============
/* saveNotes/loadNotes moved to js/ui.js */
// ============ STEPS / ANIMATION ============
function saveStep(){var snap=els.map(function(el){return JSON.parse(JSON.stringify(el));});steps.push({els:snap,dur:1.5});activeStep=steps.length-1;if(steps.length===1)window._initialElsSnapshot=JSON.parse(JSON.stringify(snap));renderSteps();toast(t('scene_saved'));}
function updateStep(){if(activeStep<0||activeStep>=steps.length)return;steps[activeStep].els=els.map(function(el){return JSON.parse(JSON.stringify(el));});renderSteps();toast(t('scene_saved'));}
function duplicateStep(i){if(i<0||i>=steps.length)return;var snap=JSON.parse(JSON.stringify(steps[i].els));steps.splice(i+1,0,{els:snap,dur:steps[i].dur||1.5});activeStep=i+1;els=snap.map(function(el){return JSON.parse(JSON.stringify(el));});selIds.clear();updateProps();updateLayers();renderSteps();toast(t('scene_saved'));}
function setStepDur(i,v){if(i<0||i>=steps.length)return;steps[i].dur=Math.max(0.1,Math.min(10,v));renderSteps();}
function moveStep(i,d){var ni=i+d;if(ni<0||ni>=steps.length)return;var item=steps.splice(i,1)[0];steps.splice(ni,0,item);if(activeStep===i)activeStep=ni;renderSteps();}
function goToStep(i){if(i<0||i>=steps.length)return;activeStep=i;els=steps[i].els.map(function(el){return JSON.parse(JSON.stringify(el));});selIds.clear();updateProps();updateLayers();renderSteps();render();}
function goToStepAnim(i){if(i<0||i>=steps.length)return;els=steps[i].els.map(function(el){return JSON.parse(JSON.stringify(el));});}
function deleteStep(i){steps.splice(i,1);if(activeStep>=steps.length)activeStep=steps.length-1;renderSteps();toast(t('step_deleted'));}
function clearSteps(){
  if(steps.length>0){
    window._initialElsSnapshot=JSON.parse(JSON.stringify(steps[0].els));
  }
  steps=[];activeStep=-1;renderSteps();
  if(window._initialElsSnapshot){
    els=window._initialElsSnapshot;
    window._initialElsSnapshot=null;
    selIds.clear();updateProps();updateLayers();render();
    toast(lang==='ar'?'\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0645\u0634\u0627\u0647\u062F \u0648\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0639\u0646\u0627\u0635\u0631':'Scenes cleared, elements reset');
  } else {
    toast(t('all_cleared'));
  }
}
function renderSteps(){var row=document.getElementById('stepsRow'),tot=document.getElementById('spTotal');if(!row)return;var h='';
for(var i=0;i<steps.length;i++){if(!steps[i])continue;var dur=(steps[i].dur||1.5);h+=(i>0?'<span class="scene-arrow"><i class="fas fa-chevron-'+(document.documentElement.dir==='rtl'?'left':'right')+'"></i></span>':'');h+='<div class="scene'+(i===activeStep?' act':'')+'" draggable="true" data-si="'+i+'" onclick="goToStep('+i+')" ondragstart="sceneDragStart(event,'+i+')" ondragover="sceneDragOver(event)" ondrop="sceneDrop(event,'+i+')" ondragenter="this.classList.add(\'drag-over\')" ondragleave="this.classList.remove(\'drag-over\')">'+'<span class="scene-nav" onclick="event.stopPropagation();moveStep('+i+',-1)" title="\u2190">\u25C0</span>'+'<span class="scene-num">'+(i+1)+'</span>'+'<span class="scene-dur"><input type="number" min="0.1" max="10" step="0.1" value="'+dur.toFixed(1)+'" onclick="event.stopPropagation()" onchange="event.stopPropagation();setStepDur('+i+',+this.value)" style="width:36px;background:transparent;border:1px solid transparent;color:inherit;font-size:10px;text-align:center;border-radius:2px;padding:1px" onfocus="this.style.borderColor=\'var(--accent)\'" onblur="this.style.borderColor=\'transparent\'"></span>'+'<span class="scene-info">'+(steps[i].els?steps[i].els.length:0)+' el</span>'+'<span class="scene-dup" onclick="event.stopPropagation();duplicateStep('+i+')" title="'+(lang==='ar'?'تكرار':'Duplicate')+'"><i class="fas fa-copy"></i></span>'+'<span class="scene-nav" onclick="event.stopPropagation();moveStep('+i+',1)" title="\u2192">\u25B6</span>'+'<span class="scene-x" onclick="event.stopPropagation();deleteStep('+i+')">&times;</span></div>';}
row.innerHTML=h;if(tot)tot.textContent=steps.length+' '+t('save_scene');}
function promptStepDur(i){
  var title=lang==='ar'?'مدة المشهد (بالثواني):':'Scene duration (seconds):';
  showPromptModal(title,String(steps[i].dur||1.5),function(ok,val){
    if(ok&&val!==null){var n=parseFloat(val);if(!isNaN(n)&&n>0)setStepDur(i,n);}
  });
}
var dragStepIdx=-1;
function sceneDragStart(e,i){dragStepIdx=i;e.dataTransfer.effectAllowed='move';}
function sceneDragOver(e){e.preventDefault();e.dataTransfer.dropEffect='move';}
function sceneDrop(e,ti){e.preventDefault();e.target.closest('.scene')&&e.target.closest('.scene').classList.remove('drag-over');if(dragStepIdx<0||dragStepIdx===ti)return;var item=steps.splice(dragStepIdx,1)[0];steps.splice(ti,0,item);if(activeStep===dragStepIdx)activeStep=ti;dragStepIdx=-1;renderSteps();}
function animPlay(){if(steps.length<2||animPlaying)return;animPlaying=true;_hasActiveAnimations=true;activeStep=0;document.getElementById('playBtn').innerHTML='<i class="fas fa-pause"></i> '+t('play');playAnim(0);}
function animStop(){animPlaying=false;if(animRAF)cancelAnimationFrame(animRAF);animRAF=null;trails={};_hasActiveAnimations=false;document.getElementById('playBtn').innerHTML='<i class="fas fa-play"></i> '+t('play');}
function playAnim(si){if(!animPlaying||si>=steps.length-1){animStop();return;}activeStep=si;var from=steps[si].els,to=steps[si+1].els,dur=(steps[si].dur||1.5)*1000,st2=Date.now();
function af(){if(!animPlaying)return;var t2=Math.min(1,(Date.now()-st2)/dur);var e2=t2<0.5?2*t2*t2:1-Math.pow(-2*t2+2,2)/2;
interpolate(from,to,e2);render();updateTrails();if(t2<1)animRAF=requestAnimationFrame(af);else{setTimeout(function(){playAnim(si+1);},200);}}af();}
function interpolate(from,to,t2){els=[];var fromMap={},toMap={},i;for(i=0;i<from.length;i++)fromMap[from[i].id]=from[i];for(i=0;i<to.length;i++)toMap[to[i].id]=to[i];var allIds=[],seen={};for(i=0;i<from.length;i++){if(!seen[from[i].id]){allIds.push(from[i].id);seen[from[i].id]=true;}}for(i=0;i<to.length;i++){if(!seen[to[i].id]){allIds.push(to[i].id);seen[to[i].id]=true;}}for(var ii=0;ii<allIds.length;ii++){var id=allIds[ii];var src=fromMap[id],dst=toMap[id];if(src&&dst){var cp={},keys=Object.keys(src);for(var k=0;k<keys.length;k++)cp[keys[k]]=src[keys[k]];if(isFree(cp.type)||isMultiArr(cp.type)){if(src.points&&dst.points&&src.points.length===dst.points.length){cp.points=[];for(var p=0;p<src.points.length;p++){cp.points.push({x:src.points[p].x+(dst.points[p].x-src.points[p].x)*t2,y:src.points[p].y+(dst.points[p].y-src.points[p].y)*t2});}}}else if(isArr(cp.type)){cp.x=src.x+(dst.x-src.x)*t2;cp.y=src.y+(dst.y-src.y)*t2;if(src.ax2!==undefined&&dst.ax2!==undefined){cp.ax2=src.ax2+(dst.ax2-src.ax2)*t2;cp.ay2=src.ay2+(dst.ay2-src.ay2)*t2;}}else{cp.x=src.x+(dst.x-src.x)*t2;cp.y=src.y+(dst.y-src.y)*t2;cp.rotation=(src.rotation||0)+((dst.rotation||0)-(src.rotation||0))*t2;cp.size=src.size+(dst.size-src.size)*t2;if(isZone(cp.type)){if(src.zoneW!==undefined&&dst.zoneW!==undefined)cp.zoneW=src.zoneW+(dst.zoneW-src.zoneW)*t2;if(src.zoneH!==undefined&&dst.zoneH!==undefined)cp.zoneH=src.zoneH+(dst.zoneH-src.zoneH)*t2;}}els.push(cp);}else if(src){var cp2={};var ks=Object.keys(src);for(var k=0;k<ks.length;k++)cp2[ks[k]]=src[ks[k]];els.push(cp2);}else{var cp3={};var ks2=Object.keys(dst);for(var k=0;k<ks2.length;k++)cp3[ks2[k]]=dst[ks2[k]];els.push(cp3);}}}
// ============ SETTINGS ============
/* openSettings/closeSet/rebuildSettingsModal moved to js/ui.js */
/* loadCI/resetCI/resetCIcon/setPitchColor/resetPitchColor/getPitchColor moved to js/ui.js */
/* applySportUI/applyPitchUI moved to js/ui.js */
// ============ SPORT & PITCH TOGGLE (event listener stays) ============
var spTg=document.getElementById('sp-tg');if(spTg)spTg.addEventListener('click',function(e){if(e.target.tagName==='BUTTON'){var sp2=e.target.dataset.sport;if(sp2){sport=sp2;invalidatePRect();document.querySelectorAll('#sp-tg button').forEach(function(b){b.classList.remove('on');});e.target.classList.add('on');renderFormationsPanel();render();}}});
// ============ CONTEXT MENU ============

// rbDiv declared in js/state.js
// rubberBanding cleanup is handled in section-select.js mouseUp
// ============ SHORTCUTS MODAL ============
/* openShortcuts/closeShortcuts/showDistance moved to js/ui.js */
// ============ TRAILS / PLAYER STYLE / ORIENTATION / TEAM LOGOS / COACH INFO / FAV COLORS moved to js/ui.js ============

// ============ RESIZE SIDEBARS ============
function initResize(handleId,sidebarId,isLeft){var h2=document.getElementById(handleId),sb=document.getElementById(sidebarId);if(!h2||!sb)return;h2.addEventListener('mousedown',function(e){e.preventDefault();var startX=e.clientX,startW=sb.offsetWidth;h2.classList.add('active');var onMove=function(ev){var dx=ev.clientX-startX;var nw=isLeft?startW+dx:startW-dx;nw=Math.max(80,Math.min(400,nw));sb.style.width=nw+'px';setupCanvas();};var onUp=function(){h2.classList.remove('active');document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseup',onUp);};document.addEventListener('mousemove',onMove);document.addEventListener('mouseup',onUp);});}
function initSidebarToggle(btnId,sidebarId,resizeId,isLeft){var btn=document.getElementById(btnId),sb=document.getElementById(sidebarId),rh=document.getElementById(resizeId);if(!btn||!sb)return;btn.addEventListener('click',function(){var isCollapsed=sb.classList.toggle('collapsed');btn.classList.toggle('collapsed',isCollapsed);if(rh)rh.classList.toggle('collapsed',isCollapsed);btn.title=isCollapsed?(lang==='ar'?'إظهار القائمة':'Show panel'):(lang==='ar'?'إخفاء القائمة':'Hide panel');setupCanvas();});}
// ============ START ============
init();