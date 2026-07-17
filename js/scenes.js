// ============ STEPS / ANIMATION (extracted from script.js) ============
function _migrateSteps(){var changed=false;steps.forEach(function(s,i){if(!s.name){s.name=(lang==='ar'?'مشهد ':'Scene ')+(i+1);changed=true;}});return changed;}
function _nextSceneName(){return(lang==='ar'?'مشهد ':'Scene ')+(steps.length+1);}
function saveStep(){var snap=els.map(function(el){return JSON.parse(JSON.stringify(el));});steps.push({els:snap,dur:1.5,name:_nextSceneName()});activeStep=steps.length-1;if(steps.length===1)window._initialElsSnapshot=JSON.parse(JSON.stringify(snap));renderSteps();toast(t('scene_saved'));}
function updateStep(){if(activeStep<0||activeStep>=steps.length)return;steps[activeStep].els=els.map(function(el){return JSON.parse(JSON.stringify(el));});renderSteps();toast(t('scene_saved'));}
function duplicateStep(i){if(i<0||i>=steps.length)return;var src=steps[i];var snap=JSON.parse(JSON.stringify(src.els));var name=src.name?(src.name+(lang==='ar'?' (نسخة)':' (copy)')):_nextSceneName();steps.splice(i+1,0,{els:snap,dur:src.dur||1.5,name:name});activeStep=i+1;els=snap.map(function(el){return JSON.parse(JSON.stringify(el));});selIds.clear();updateProps();updateLayers();renderSteps();toast(t('scene_saved'));}
function copyStep(i){if(i<0||i>=steps.length)return;_stepClipboard=JSON.parse(JSON.stringify(steps[i]));toast(t('scene_copied'));}
function pasteStep(){if(!_stepClipboard){toast(t('no_scene_to_paste'));return;}var snap=JSON.parse(JSON.stringify(_stepClipboard.els));var name=_stepClipboard.name?(_stepClipboard.name+(lang==='ar'?' (لصق)':' (paste)')):_nextSceneName();var insertAt=activeStep>=0?activeStep+1:steps.length;steps.splice(insertAt,0,{els:snap,dur:_stepClipboard.dur||1.5,name:name});activeStep=insertAt;els=snap.map(function(el){return JSON.parse(JSON.stringify(el));});selIds.clear();updateProps();updateLayers();renderSteps();toast(t('scene_pasted'));}
function renameStep(i){if(i<0||i>=steps.length)return;var cur=steps[i].name||'';var n=prompt(t('scene_name'),cur);if(n!==null&&n.trim()){steps[i].name=n.trim();renderSteps();toast(t('scene_renamed'));}}
function setStepDur(i,v){if(i<0||i>=steps.length)return;steps[i].dur=Math.max(0.1,Math.min(10,v));renderSteps();}
function moveStep(i,d){var ni=i+d;if(ni<0||ni>=steps.length)return;var item=steps.splice(i,1)[0];steps.splice(ni,0,item);if(activeStep===i)activeStep=ni;renderSteps();}
function goToStep(i){if(i<0||i>=steps.length)return;activeStep=i;els=steps[i].els.map(function(el){return JSON.parse(JSON.stringify(el));});selIds.clear();updateProps();updateLayers();renderSteps();Engine.reqRender();}
function goToStepAnim(i){if(i<0||i>=steps.length)return;els=steps[i].els.map(function(el){return JSON.parse(JSON.stringify(el));});}
function deleteStep(i){steps.splice(i,1);if(activeStep>=steps.length)activeStep=steps.length-1;if(steps.length<2)animStop();renderSteps();toast(t('step_deleted'));}
function clearSteps(){
  if(steps.length>0){
    window._initialElsSnapshot=JSON.parse(JSON.stringify(steps[0].els));
  }
  steps=[];activeStep=-1;renderSteps();
  if(window._initialElsSnapshot){
    els=window._initialElsSnapshot;
    window._initialElsSnapshot=null;
    selIds.clear();updateProps();updateLayers();Engine.reqRender();
    toast(lang==='ar'?'تم حذف المشاهد وإعادة العناصر':'Scenes cleared, elements reset');
  } else {
    toast(t('all_cleared'));
  }
}
function renderSteps(){var row=document.getElementById('stepsRow'),tot=document.getElementById('spTotal');if(!row)return;var h='';
for(var i=0;i<steps.length;i++){var dur=(steps[i].dur||1.5);var sname=steps[i].name||((lang==='ar'?'مشهد ':'Scene ')+(i+1));h+=(i>0?'<span class="scene-arrow"><i class="fas fa-chevron-'+(document.documentElement.dir==='rtl'?'left':'right')+'"></i></span>':'');h+='<div class="scene'+(i===activeStep?' act':'')+'" draggable="true" data-si="'+i+'" onclick="goToStep('+i+')" ondragstart="sceneDragStart(event,'+i+')" ondragover="sceneDragOver(event)" ondrop="sceneDrop(event,'+i+')" ondragenter="this.classList.add(\'drag-over\')" ondragleave="this.classList.remove(\'drag-over\')">'+'<span class="scene-nav" onclick="event.stopPropagation();moveStep('+i+',-1)" title="\u2190">\u25C0</span>'+'<span class="scene-num">'+(i+1)+'</span>'+'<span class="scene-name" ondblclick="event.stopPropagation();renameStep('+i+')" title="'+t('rename_scene')+'">'+sname+'</span>'+'<span class="scene-dur">'+steps[i].els.length+' el | '+dur.toFixed(1)+'s</span>'+'<span class="scene-actions">'+'<span class="scene-act-btn" onclick="event.stopPropagation();duplicateStep('+i+')" title="'+t('duplicate_scene')+'"><i class="fas fa-clone"></i></span>'+'<span class="scene-act-btn" onclick="event.stopPropagation();copyStep('+i+')" title="'+t('copy_scene')+'"><i class="fas fa-copy"></i></span>'+'<span class="scene-act-btn" onclick="event.stopPropagation();renameStep('+i+')" title="'+t('rename_scene')+'"><i class="fas fa-pen"></i></span>'+'</span>'+'<span class="scene-nav" onclick="event.stopPropagation();moveStep('+i+',1)" title="\u2192">\u25B6</span>'+'<span class="scene-dur-btn" onclick="event.stopPropagation();promptStepDur('+i+')" title="\u23F1">\u23F1</span>'+'<span class="scene-x" onclick="event.stopPropagation();deleteStep('+i+')">&times;</span></div>';}
row.innerHTML=h;if(tot)tot.textContent=steps.length+' '+t('save_scene');}
function promptStepDur(i){var v=prompt((lang==='ar'?'مدة المشهد (بالثواني):':'Scene duration (seconds):'),String(steps[i].dur||1.5));if(v!==null){var n=parseFloat(v);if(!isNaN(n)&&n>0)setStepDur(i,n);}}
var dragStepIdx=-1;
function sceneDragStart(e,i){dragStepIdx=i;e.dataTransfer.effectAllowed='move';}
function sceneDragOver(e){e.preventDefault();e.dataTransfer.dropEffect='move';}
function sceneDrop(e,ti){e.preventDefault();e.target.closest('.scene')&&e.target.closest('.scene').classList.remove('drag-over');if(dragStepIdx<0||dragStepIdx===ti)return;var item=steps.splice(dragStepIdx,1)[0];steps.splice(ti,0,item);if(activeStep===dragStepIdx)activeStep=ti;dragStepIdx=-1;renderSteps();}
function animPlay(){if(steps.length<2||animPlaying){animStop();return;}animPlaying=true;activeStep=0;document.getElementById('playBtn').innerHTML='<i class="fas fa-pause"></i> '+t('play');playAnim(0);}
function animStop(){animPlaying=false;if(animRAF)cancelAnimationFrame(animRAF);animRAF=null;trails={};document.getElementById('playBtn').innerHTML='<i class="fas fa-play"></i> '+t('play');}
function playAnim(si){if(!animPlaying||si>=steps.length-1){animStop();return;}activeStep=si;var from=steps[si].els,to=steps[si+1].els,dur=(steps[si].dur||1.5)*1000,st2=Date.now();
function af(){if(!animPlaying)return;var t2=Math.min(1,(Date.now()-st2)/dur);var e2=t2<0.5?2*t2*t2:1-Math.pow(-2*t2+2,2)/2;
interpolate(from,to,e2);Engine.reqRender();updateTrails();if(t2<1)animRAF=requestAnimationFrame(af);else{setTimeout(function(){playAnim(si+1);},200);}}af();}
function interpolate(from,to,t2){els=[];var mx=Math.max(from.length,to.length);for(var i=0;i<mx;i++){if(i<from.length&&i<to.length){var src=from[i];var cp={};var keys=Object.keys(src);for(var k=0;k<keys.length;k++)cp[keys[k]]=src[keys[k]];if(!isFree(cp.type)&&!isArr(cp.type)){cp.x=src.x+(to[i].x-src.x)*t2;cp.y=src.y+(to[i].y-src.y)*t2;cp.rotation=(src.rotation||0)+((to[i].rotation||0)-(src.rotation||0))*t2;cp.size=src.size+(to[i].size-src.size)*t2;}els.push(cp);}else if(i<from.length){var cp2={};var ks=Object.keys(from[i]);for(var k=0;k<ks.length;k++)cp2[ks[k]]=from[i][ks[k]];els.push(cp2);}else{var cp3={};var ks2=Object.keys(to[i]);for(var k=0;k<ks2.length;k++)cp3[ks2[k]]=to[i][ks2[k]];els.push(cp3);}}}
// ============ ANIMATION API ============
var Animation={getSteps:function(){return steps;},setEls:function(newEls){els=newEls;},stop:animStop,interpolate:interpolate,saveStep:saveStep,updateStep:updateStep,goToStep:goToStep,deleteStep:deleteStep,clearSteps:clearSteps,duplicateStep:duplicateStep,copyStep:copyStep,pasteStep:pasteStep,renameStep:renameStep,play:function(){animPlay();},canPlay:function(){return steps.length>=2;},getActiveStep:function(){return activeStep;},isPlaying:function(){return animPlaying;}};
// ============ TRAILS ============
var trails={};
function updateTrails(){els.forEach(function(el){if(isP2D(el.type)){if(!trails[el.id])trails[el.id]=[];trails[el.id].push({x:el.x,y:el.y});if(trails[el.id].length>20)trails[el.id].shift();}});}
function drawTrails(){if(!animPlaying)return;Object.keys(trails).forEach(function(id){var tr=trails[id];if(!tr||tr.length<2)return;cx.save();cx.strokeStyle='rgba(74,144,217,0.3)';cx.lineWidth=2;cx.beginPath();cx.moveTo(tr[0].x,tr[0].y);for(var i=1;i<tr.length;i++)cx.lineTo(tr[i].x,tr[i].y);cx.stroke();cx.restore();});}
// ============ START ============
init();
