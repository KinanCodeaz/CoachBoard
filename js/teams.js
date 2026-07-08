'use strict';
/**
 * teams.js - Team Management Module for CoachBoard Pro
 * Handles: rosters, player names/numbers, coach name, sport-aware placement,
 *          bench drawing, and roster card export.
 */

// ============ SPORT FIELD SIZE RULES ============
// Number of players that go ON the field (including goalkeeper) per sport
var sportFieldSize = {
  football: 11, futsal: 5, beach: 5,
  basketball: 5, volleyball: 6, handball: 7, mini: 5
};

function getFieldSizeForSport(sp) {
  return sportFieldSize[sp] || 11;
}

// ============ SERVER SYNC ============
var rostersServerUrl='';
function getRostersServerUrl(){
  if(!rostersServerUrl) rostersServerUrl=localStorage.getItem('cb_roster_server_url')||'';
  return rostersServerUrl;
}
function setRostersServerUrl(url){
  rostersServerUrl=url; localStorage.setItem('cb_roster_server_url',url);
}
function syncRostersToServer(){
  var url=getRostersServerUrl();
  if(!url){toast(lang==='ar'?'يرجى تعيين رابط الخادم في الإعدادات':'Set server URL in settings');return;}
  var data=JSON.stringify({rosters:teamRosters,assignment:teamRosterAssignment,showNames:showPlayerNames});
  var ac=new AbortController();setTimeout(function(){ac.abort();},10000);
  fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:data,signal:ac.signal})
  .then(function(r){if(r.ok){toast(lang==='ar'?'تم حفظ الفرق على الخادم':'Teams saved to server');}else{toast(lang==='ar'?'خطأ في الحفظ:'+r.status:'Save error:'+r.status);}})
  .catch(function(e){toast(lang==='ar'?'فشل الاتصال بالخادم':'Server connection failed');});
}
function loadRostersFromServer(){
  var url=getRostersServerUrl();
  if(!url){toast(lang==='ar'?'يرجى تعيين رابط الخادم في الإعدادات':'Set server URL in settings');return;}
  var ac=new AbortController();setTimeout(function(){ac.abort();},10000);
  fetch(url,{signal:ac.signal})
  .then(function(r){if(!r.ok)throw new Error(String(r.status));return r.json();})
  .then(function(data){
    if(data.rosters){teamRosters=data.rosters;teamRosterAssignment=data.assignment||{A:null,B:null};showPlayerNames=data.showNames!==undefined?data.showNames:true;
    saveTeamRosters();renderRosterList();if(activeRoster)renderRosterEditor(activeRoster);
    toast(lang==='ar'?'تم تحميل الفرق من الخادم':'Teams loaded from server');}
  })
  .catch(function(e){toast(lang==='ar'?'فشل تحميل الفرق من الخادم':'Failed to load from server');});
}
function promptServerUrl(){
  var input=document.getElementById('serverUrlInput');
  if(!input)return;
  input.value=getRostersServerUrl();
  document.getElementById('serverUrlModal').classList.add('show');
}
function confirmServerUrl(){
  var input=document.getElementById('serverUrlInput');
  if(!input)return;
  var url=input.value.trim();
  setRostersServerUrl(url);
  closeServerUrlModal();
  toast(lang==='ar'?'تم حفظ الرابط':'URL saved');
}
function closeServerUrlModal(){
  document.getElementById('serverUrlModal').classList.remove('show');
}

// ============ TEAM MANAGER ============
function openTeamManager(){
  var tmm=document.getElementById('teamMgrModal');if(!tmm)return;
  tmm.classList.add('show');
  // Auto-select current team's roster
  var assigned=teamRosterAssignment[curTeam];
  if(assigned&&teamRosters[assigned]){
    activeRoster=assigned;
  } else {
    activeRoster=null;
  }
  renderRosterList(); if(activeRoster)renderRosterEditor(activeRoster); updateAssignButtons(); updateFormationSelect();
}
function closeTeamManager(){
  var tmm=document.getElementById('teamMgrModal');if(!tmm)return;
  tmm.classList.remove('show');
  activeRoster=null;
}

function renderRosterList(){
  var list=document.getElementById('rosterList'); if(!list) return;
  var h='', keys=Object.keys(teamRosters);
  if(!keys.length){
    h='<div style="text-align:center;padding:16px;color:var(--text3);font-size:11px">';
    h+='<i class="fas fa-users" style="font-size:20px;opacity:0.2;display:block;margin-bottom:6px"></i>';
    h+=(lang==='ar'?'\u0644\u0627 \u062a\u0648\u062c\u062f \u0641\u0631\u0642':'No teams yet')+'</div>';
  }
  keys.forEach(function(k){
    var cnt=teamRosters[k].players?teamRosters[k].players.length:0;
    var coach=teamRosters[k].coachName||'';
    var assigned='';
    if(teamRosterAssignment.A===k) assigned+=' <span style="color:var(--tmA);font-size:8px">A</span>';
    if(teamRosterAssignment.B===k) assigned+=' <span style="color:var(--danger);font-size:8px">B</span>';
    h+='<div class="roster-item'+(activeRoster===k?' active':'')+'" onclick="selectRoster(\''+k.replace(/'/g,"\\'")+'\')">';
    h+='<span class="roster-name">'+esc(k)+assigned+'</span>';
    if(coach) h+='<span class="roster-coach-badge"><i class="fas fa-user-tie"></i> '+esc(coach)+'</span>';
    h+='<span class="roster-cnt">'+cnt+'</span>';
    h+='<span class="roster-del" onclick="event.stopPropagation();deleteRoster(\''+k.replace(/'/g,"\\'")+'\')" title="'+t('delete')+'"><i class="fas fa-trash"></i></span>';
    h+='</div>';
  });
  list.innerHTML=h;
}

function selectRoster(name){
  if(activeRoster===name){
    activeRoster='';
    renderRosterList();
    var ed=document.getElementById('rosterEditor');
    if(ed)ed.innerHTML='<div class="roster-empty"><i class="fas fa-users" style="font-size:32px;opacity:0.2;margin-bottom:8px"></i><p>'+t('select_roster')+'</p></div>';
    return;
  }
  activeRoster=name; renderRosterList(); renderRosterEditor(name);
}

function createNewRoster(){
  createNewRosterModal();
}

function createNewRosterModal(){
  var existing=document.getElementById('newTeamOverlay');
  if(existing)existing.remove();
  var ov=document.createElement('div');
  ov.id='newTeamOverlay';
  ov.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:1000;display:flex;align-items:center;justify-content:center';
  ov.onclick=function(e){if(e.target===ov)ov.remove();};
  var isAr=lang==='ar';
  var fieldSz=getFieldSizeForSport(sport);
  var defaultName=(isAr?'\u0641\u0631\u064A\u0642':'Team')+' '+(Object.keys(teamRosters).length+1);
  var box=document.createElement('div');
  box.style.cssText='background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:24px;max-width:480px;width:90%;max-height:85vh;overflow-y:auto';
  var h='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">';
  h+='<h3 style="font-size:16px;color:var(--accent)"><i class="fas fa-users-cog"></i> '+(isAr?'\u0625\u0646\u0634\u0627\u0621 \u0641\u0631\u064A\u0642 \u062C\u062F\u064A\u062F':'Create New Team')+'</h3>';
  h+='<button class="hbtn icon-only danger" onclick="this.closest(\'#newTeamOverlay\').remove()" style="width:28px;height:28px"><i class="fas fa-times"></i></button></div>';
  h+='<div style="margin-bottom:12px"><label style="display:block;font-size:11px;color:var(--text2);margin-bottom:4px">'+(isAr?'اسم الفريق':'Team name')+'</label>';
  h+='<input type="text" id="ntName" class="prop-input" style="width:100%;padding:8px 10px;font-size:13px" placeholder="'+(isAr?'\u0627\u0633\u0645 \u0627\u0644\u0641\u0631\u064A\u0642':'Team name')+'" value="'+defaultName+'"></div>';
  h+='<div style="margin-bottom:12px"><label style="display:block;font-size:11px;color:var(--text2);margin-bottom:4px">'+(isAr?'\u0639\u062F\u062F \u0627\u0644\u0644\u0627\u0639\u0628\u064A\u0646':'Number of players')+': <span id="ntCountVal">'+fieldSz+'</span></label>';
  h+='<input type="range" min="1" max="30" value="'+fieldSz+'" id="ntCount" oninput="document.getElementById(\'ntCountVal\').textContent=this.value" style="width:100%"></div>';
  h+='<div style="margin-bottom:12px"><label style="display:block;font-size:11px;color:var(--text2);margin-bottom:4px"><i class="fas fa-shield-alt"></i> '+(isAr?'\u0634\u0639\u0627\u0631 \u0627\u0644\u0641\u0631\u064A\u0642':'Team logo')+'</label>';
  h+='<input type="file" accept="image/*" id="ntLogo" style="font-size:11px">';
  h+='<div id="ntLogoPreview" style="display:none;margin-top:6px;width:60px;height:60px;border-radius:50%;overflow:hidden;border:2px solid var(--border)"><img id="ntLogoImg" style="width:100%;height:100%;object-fit:cover"></div></div>';
  h+='<div style="margin-bottom:12px"><label style="display:block;font-size:11px;color:var(--text2);margin-bottom:4px"><i class="fas fa-user-tie"></i> '+(isAr?'\u0627\u0633\u0645 \u0627\u0644\u0645\u062F\u0631\u0628':'Coach name')+'</label>';
  h+='<input type="text" id="ntCoach" class="prop-input" style="width:100%;padding:8px 10px;font-size:13px" placeholder="'+(isAr?'\u0627\u0633\u0645 \u0627\u0644\u0645\u062F\u0631\u0628':'Coach name')+'"></div>';
  h+='<details style="margin-bottom:12px"><summary style="cursor:pointer;font-size:12px;color:var(--accent);padding:4px 0"><i class="fas fa-cog"></i> '+(isAr?'\u062E\u064A\u0627\u0631\u0627\u062A \u0645\u062A\u0642\u062F\u0645\u0629':'Advanced options')+'</summary>';
  h+='<div style="padding:8px 0"><div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text2);margin-bottom:4px">'+(isAr?'\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0645\u0628\u0627\u0631\u0627\u0629':'Match date')+'</label>';
  h+='<input type="date" id="ntDate" class="prop-input" style="width:100%;padding:6px 8px;font-size:12px"></div>';
  h+='<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text2);margin-bottom:4px">'+(isAr?'\u0627\u0633\u0645 \u0627\u0644\u0645\u0644\u0639\u0628':'Stadium name')+'</label>';
  h+='<input type="text" id="ntStadium" class="prop-input" style="width:100%;padding:8px 10px;font-size:13px" placeholder="'+(isAr?'\u0627\u0633\u0645 \u0627\u0644\u0645\u0644\u0639\u0628':'Stadium name')+'"></div>';
  h+='<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text2);margin-bottom:4px">'+(isAr?'\u0627\u0633\u0645 \u0627\u0644\u062E\u0635\u0645':'Opponent name')+'</label>';
  h+='<input type="text" id="ntOpponent" class="prop-input" style="width:100%;padding:8px 10px;font-size:13px" placeholder="'+(isAr?'\u0627\u0633\u0645 \u0627\u0644\u062E\u0635\u0645':'Opponent name')+'"></div>';
  h+='<div style="margin-bottom:10px"><label style="display:block;font-size:11px;color:var(--text2);margin-bottom:4px">'+(isAr?'\u0646\u0648\u0639 \u0627\u0644\u0645\u0628\u0627\u0631\u0627\u0629':'Match type')+'</label>';
  h+='<select id="ntMatchType" class="prop-input" style="width:100%;padding:6px 8px;font-size:12px">';
  h+='<option value="friendly">'+(isAr?'\u0648\u062F\u064A\u0629':'Friendly')+'</option>';
  h+='<option value="official">'+(isAr?'\u0631\u0633\u0645\u064A\u0629':'Official')+'</option></select></div>';
  h+='<div style="margin-bottom:8px"><label style="display:block;font-size:11px;color:var(--text2);margin-bottom:4px"><i class="fas fa-users"></i> '+(isAr?'\u0627\u0644\u062C\u0647\u0627\u0632 \u0627\u0644\u0641\u0646\u064A \u0648\u0627\u0644\u0625\u062F\u0627\u0631\u064A':'Staff')+'</label>';
  h+='<div id="ntStaffContainer"><div class="nt-staff-row" style="display:flex;gap:6px;margin-bottom:4px">';
  h+='<input type="text" class="ntStaffName" style="flex:1;padding:6px 8px;font-size:12px;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text)" placeholder="'+(isAr?'\u0627\u0644\u0627\u0633\u0645':'Name')+'" value="'+(isAr?'\u0645\u0633\u0627\u0639\u062F \u0645\u062F\u0631\u0628':'Assistant Coach')+'">';
  h+='<input type="text" class="ntStaffRole" style="flex:0 0 100px;padding:6px 8px;font-size:12px;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text)" placeholder="'+(isAr?'\u0627\u0644\u0645\u0647\u0645\u0629':'Role')+'" value="'+(isAr?'\u0645\u0633\u0627\u0639\u062F \u0645\u062F\u0631\u0628':'Assistant Coach')+'">';
  h+='<button class="hbtn icon-only" onclick="this.parentElement.remove()" style="width:28px;height:28px;font-size:10px;flex-shrink:0"><i class="fas fa-times"></i></button></div></div>';
  h+='<button class="hbtn" style="font-size:10px;margin-top:4px" onclick="addStaffRowNewTeam()"><i class="fas fa-plus"></i> '+(isAr?'\u0625\u0636\u0627\u0641\u0629 \u0639\u0636\u0648':'Add member')+'</button></div></div></details>';
  h+='<div style="display:flex;gap:8px;margin-top:16px;justify-content:flex-end">';
  h+='<button class="hbtn" onclick="this.closest(\'#newTeamOverlay\').remove()">'+t('cancel')+'</button>';
  h+='<button class="hbtn primary" onclick="confirmNewTeam()"><i class="fas fa-check"></i> '+(isAr?'\u0625\u0646\u0634\u0627\u0621 \u0627\u0644\u0641\u0631\u064A\u0642':'Create Team')+'</button></div>';
  box.innerHTML=h;ov.appendChild(box);document.body.appendChild(ov);
  document.getElementById('ntName').focus();
  document.getElementById('ntLogo').addEventListener('change',function(){
    var file=this.files[0];if(file){var rdr=new FileReader();
    rdr.onload=function(e){document.getElementById('ntLogoPreview').style.display='block';document.getElementById('ntLogoImg').src=e.target.result;};
    rdr.readAsDataURL(file);}
  });
}

function addStaffRowNewTeam(){
  var c=document.getElementById('ntStaffContainer');var isAr=lang==='ar';
  var row=document.createElement('div');row.style.cssText='display:flex;gap:6px;margin-bottom:4px';
  row.innerHTML='<input type="text" class="ntStaffName" style="flex:1;padding:6px 8px;font-size:12px;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text)" placeholder="'+(isAr?'\u0627\u0644\u0627\u0633\u0645':'Name')+'">'
    +'<input type="text" class="ntStaffRole" style="flex:0 0 100px;padding:6px 8px;font-size:12px;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text)" placeholder="'+(isAr?'\u0627\u0644\u0645\u0647\u0645\u0629':'Role')+'">'
    +'<button class="hbtn icon-only" onclick="this.parentElement.remove()" style="width:28px;height:28px;font-size:10px;flex-shrink:0"><i class="fas fa-times"></i></button>';
  c.appendChild(row);
}

function confirmNewTeam(){
  var name=document.getElementById('ntName').value.trim();
  if(!name){toast(lang==='ar'?'\u064A\u0631\u062C\u0649 \u0625\u062F\u062E\u0627\u0644 \u0627\u0633\u0645 \u0627\u0644\u0641\u0631\u064A\u0642':'Please enter team name');return;}
  if(teamRosters[name]){toast(lang==='ar'?'\u0627\u0644\u0627\u0633\u0645 \u0645\u0648\u062C\u0648\u062F':'Name exists');return;}
  var count=parseInt(document.getElementById('ntCount').value)||getFieldSizeForSport(sport);
  var roster={name:name,coachName:document.getElementById('ntCoach').value.trim(),logo:null,players:[],staff:[],matchDate:document.getElementById('ntDate').value||'',stadium:document.getElementById('ntStadium').value.trim(),opponent:document.getElementById('ntOpponent').value.trim(),matchType:document.getElementById('ntMatchType').value||'friendly',created:new Date().toISOString()};
  var logoImg=document.getElementById('ntLogoImg');
  if(logoImg&&logoImg.src) roster.logo=logoImg.src;
  var fieldSz=getFieldSizeForSport(sport);
  for(var i=0;i<count;i++){
    var role='substitute';
    if(i===0) role='starting_gk';
    else if(i<fieldSz) role='starter';
    else role='substitute';
    roster.players.push({num:i+1,name:'',bench:i>=fieldSz,position:'',role:role});
  }
  assignDefaultPositions(roster.players,fieldSz);
  document.querySelectorAll('#ntStaffContainer .nt-staff-row').forEach(function(row){
    var sName=row.querySelector('.ntStaffName').value.trim();
    var sRole=row.querySelector('.ntStaffRole').value.trim();
    if(sName||sRole) roster.staff.push({name:sName,role:sRole});
  });
  teamRosters[name]=roster;
  saveTeamRosters();activeRoster=name;
  document.getElementById('newTeamOverlay').remove();
  renderRosterList();renderRosterEditor(name);
}

function deleteRoster(name){
  var title=lang==='ar'?'تأكيد الحذف':'Confirm Delete';
  var msg=(lang==='ar'?'حذف':'Delete')+' "'+name+'"';
  showConfirmModal(title,msg,function(ok){if(!ok)return;
  delete teamRosters[name];
  if(teamRosterAssignment.A===name) teamRosterAssignment.A=null;
  if(teamRosterAssignment.B===name) teamRosterAssignment.B=null;
  if(activeRoster===name){
    activeRoster=null;
    var ed=document.getElementById('rosterEditor');
    if(ed) ed.innerHTML='<div class="roster-empty" id="rosterEmpty"><i class="fas fa-users" style="font-size:32px;opacity:0.2;margin-bottom:8px"></i><p>'+t('select_roster')+'</p></div>';
  }
  saveTeamRosters(); renderRosterList();
  });}

function assignDefaultPositions(players,fieldSz){
  // Distribute field positions: GK, then DEF/MID/FWD
  var defCount=Math.round((fieldSz-1)*0.4);
  var midCount=Math.round((fieldSz-1)*0.35);
  var fwdCount=(fieldSz-1)-defCount-midCount;
  var posOrder=[];
  for(var d=0;d<defCount;d++)posOrder.push('DEF');
  for(var m=0;m<midCount;m++)posOrder.push('MID');
  for(var f=0;f<fwdCount;f++)posOrder.push('FWD');
  var defIdx=1,midIdx=1,fwdIdx=1;
  var isAr=lang==='ar';
  players.forEach(function(pl,i){
    if(i===0){
      pl.position='GK';
      if(!pl.name)pl.name=isAr?'حارس مرمى':'Goalkeeper';
    }else if(i<fieldSz){
      var posIdx=i-1;
      if(posIdx<posOrder.length)pl.position=posOrder[posIdx];
      else pl.position='FWD';
      if(!pl.name){
        var posName=pl.position==='DEF'?(isAr?'مدافع ':'Defender ')+defIdx++:pl.position==='MID'?(isAr?'وسط ':'Midfielder ')+midIdx++:(isAr?'مهاجم ':'Striker ')+fwdIdx++;
        pl.name=posName;
      }
    }
  });
}
function getRoleLabel(role){
  var labels={'starting_gk':lang==='ar'?'\u062D\u0627\u0631\u0633 \u0623\u0633\u0627\u0633\u064A':'Starting GK','starter':lang==='ar'?'\u0623\u0633\u0627\u0633\u064A':'Starter','sub_gk':lang==='ar'?'\u062D\u0627\u0631\u0633 \u0627\u062D\u062A\u064A\u0627\u0637':'Sub GK','substitute':lang==='ar'?'\u0627\u062D\u062A\u064A\u0627\u0637':'Substitute'};
  return labels[role]||'';
}
function getRoleColor(role){
  return {'starting_gk':'#ffc107','starter':'#28a745','sub_gk':'#fd7e14','substitute':'#6c757d'}[role]||'var(--text2)';
}
function getRolePriority(role){
  return {'starting_gk':0,'sub_gk':1,'starter':2,'substitute':3}[role]!==undefined?{'starting_gk':0,'sub_gk':1,'starter':2,'substitute':3}[role]:99;
}
function autoAssignRoles(players,fieldSz){
  // Sort: starting_gk first, then starter, then sub_gk, then substitute
  players.sort(function(a,b){return getRolePriority(a.role)-getRolePriority(b.role);});
  // Re-assign numbers
  players.forEach(function(pl,i){pl.num=i+1;});
  // Set bench: starting_gk and starter go to field (up to fieldSz), sub_gk and substitute always bench
  var onField=0;
  for(var i=0;i<players.length;i++){
    if(players[i].role==='starting_gk'||players[i].role==='starter'){
      players[i].bench=(onField>=fieldSz);
      if(!players[i].bench) onField++;
    } else {
      players[i].bench=true;
    }
  }
}
function updateCoachName(val){
  if(!activeRoster||!teamRosters[activeRoster]) return;
  teamRosters[activeRoster].coachName=val;
  saveTeamRosters(); render();
}
function loadRosterLogo(input){
  if(!input.files||!input.files[0]||!activeRoster||!teamRosters[activeRoster]) return;
  var file=input.files[0];if(!validateImageFile(file,5))return;
  var reader=new FileReader();
  reader.onload=function(e){
    teamRosters[activeRoster].logo=e.target.result;
    saveTeamRosters();renderRosterEditor(activeRoster);
    if(typeof render==='function')render();
  };
  reader.readAsDataURL(file);
}
function removeRosterLogo(){
  if(!activeRoster||!teamRosters[activeRoster]) return;
  teamRosters[activeRoster].logo=null;
  saveTeamRosters();renderRosterEditor(activeRoster);
}
function renderRosterEditor(name){
  var ed=document.getElementById('rosterEditor'); if(!ed) return;
  if(!name||!teamRosters[name]){
    ed.innerHTML='<div class="roster-empty"><i class="fas fa-users" style="font-size:32px;opacity:0.2;margin-bottom:8px"></i><p>'+t('select_roster')+'</p></div>';
    return;
  }
  var roster=teamRosters[name];
  if(!roster.coachName) roster.coachName='';
  var fieldSz=getFieldSizeForSport(sport);
  var h='';

  // Team name
  h+='<input class="roster-name-input" value="'+esc(name)+'" onchange="renameRoster(this.value)" title="'+t('team_roster')+'">';

  // Coach name field
  h+='<div class="roster-coach-section">';
  h+='<label><i class="fas fa-user-tie"></i> '+(lang==='ar'?'اسم المدرب':'Coach name')+':</label>';
  h+='<input type="text" class="rp-coach-name" value="'+esc(roster.coachName||'')+'" placeholder="'+(lang==='ar'?'اسم المدرب':'Enter coach name')+'" oninput="updateCoachName(this.value)">';
  h+='</div>';

  // Team logo upload
  h+='<div class="roster-logo-section">';
  h+='<label><i class="fas fa-shield-alt"></i> '+(lang==='ar'?'شعار الفريق':'Team logo')+':</label>';
  h+='<div class="roster-logo-area">';
  if(roster.logo){
    h+='<img class="roster-logo-preview" src="'+esc(roster.logo)+'">';
    h+='<span class="roster-logo-del" onclick="removeRosterLogo()" title="'+t('delete')+'"><i class="fas fa-times"></i></span>';
  }
  h+='<input type="file" accept="image/*" onchange="loadRosterLogo(this)" class="roster-logo-input">';
  h+='</div></div>';

  // Sport info + player count
  // Count field vs bench
  var fieldCount=0, benchCount=0;
  roster.players.forEach(function(pl){if(pl.role==='starting_gk'||pl.role==='starter')fieldCount++;else benchCount++;});
  h+='<div class="roster-sport-info">';
  h+='<span class="sport-badge"><i class="fas fa-futbol"></i> '+sport+' ('+fieldSz+' '+(lang==='ar'?'لاعب':'players')+')</span>';
  h+='<span style="font-size:9px;color:var(--text3)">'+(lang==='ar'?'ملعب':'Field')+': <strong style="color:'+(fieldCount>fieldSz?'var(--danger)':'var(--success)')+'">'+fieldCount+'</strong>/'+fieldSz+' | '+(lang==='ar'?'احتياط':'Bench')+': <strong>'+benchCount+'</strong></span>';
  h+='<div class="roster-player-count">';
  h+='<label>'+t('num_players')+':</label>';
  h+='<input type="range" min="1" max="30" value="'+(roster.players.length||fieldSz)+'" oninput="updateRosterCount(+this.value);this.nextElementSibling.textContent=this.value">';
  h+='<span>'+(roster.players.length||fieldSz)+'</span>';
  h+='</div></div>';

  // Action buttons: Bulk add, CSV import/export, PNG export, show names
  h+='<div class="roster-actions-row">';
  h+='<label class="roster-toggle-names"><input type="checkbox" '+(showPlayerNames?'checked':'')+' onchange="showPlayerNames=this.checked;saveTeamRosters();render()" style="width:12px;height:12px;accent-color:var(--accent)"> '+t('show_names')+'</label>';
  h+='<button class="hbtn roster-export-btn" onclick="bulkAddPlayers()" title="'+(lang==='ar'?'إضافة جماعية':'Bulk Add')+'" style="background:var(--success)!important"><i class="fas fa-users"></i></button>';
  h+='<button class="hbtn roster-export-btn" onclick="exportRosterCSV()" title="'+(lang==='ar'?'تصدير CSV':'Export CSV')+'" style="background:var(--accent)!important"><i class="fas fa-file-csv"></i></button>';
  h+='<input type="file" accept=".csv" id="csvImportInput" style="display:none" onchange="importRosterCSV(this)">';
  h+='<button class="hbtn roster-export-btn" onclick="document.getElementById(\'csvImportInput\').click()" title="'+(lang==='ar'?'إستيراد CSV':'Import CSV')+'" style="background:var(--warning)!important;color:#1a1f2e!important"><i class="fas fa-upload"></i></button>';
  h+='<button class="hbtn roster-export-btn" onclick="showExportDialog()" title="'+(lang==='ar'?'تصدير القائمة':'Export squad')+'" style="background:var(--accent)!important"><i class="fas fa-download"></i></button>';
  h+='<button class="hbtn roster-export-btn" onclick="exportTeam(activeRoster)" title="'+(lang==='ar'?'تصدير الفريق':'Export team data')+'" style="background:#8b5cf6!important"><i class="fas fa-file-export"></i></button>';
  h+='<button class="hbtn roster-export-btn" onclick="importTeam()" title="'+(lang==='ar'?'استيراد فريق':'Import team')+'" style="background:#10b981!important"><i class="fas fa-file-import"></i></button>';
  h+='</div>';

  // Advanced match options
  h+='<details class="roster-advanced" '+(roster.opponent||roster.stadium||roster.matchDate?'open':'')+'>';
  h+='<summary><i class="fas fa-cog"></i> '+(lang==='ar'?'خيارات المباراة المتقدمة':'Advanced match options')+'</summary>';
  h+='<div style="padding:4px 0"><div class="roster-adv-row">';
  h+='<label>'+(lang==='ar'?'تاريخ المباراة':'Match date')+':</label>';
  h+='<input type="date" class="prop-input" value="'+(roster.matchDate||'')+'" onchange="updateRosterMeta(\'matchDate\',this.value)"></div>';
  h+='<div class="roster-adv-row"><label>'+(lang==='ar'?'اسم الملعب':'Stadium')+':</label>';
  h+='<input type="text" class="prop-input" value="'+(roster.stadium||'')+'" placeholder="'+(lang==='ar'?'اسم الملعب':'Stadium name')+'" onchange="updateRosterMeta(\'stadium\',this.value)"></div>';
  h+='<div class="roster-adv-row"><label>'+(lang==='ar'?'اسم الخصم':'Opponent')+':</label>';
  h+='<input type="text" class="prop-input" value="'+(roster.opponent||'')+'" placeholder="'+(lang==='ar'?'اسم الخصم':'Opponent name')+'" onchange="updateRosterMeta(\'opponent\',this.value)"></div>';
  h+='<div class="roster-adv-row"><label>'+(lang==='ar'?'نوع المباراة':'Match type')+':</label>';
  h+='<select class="prop-input" onchange="updateRosterMeta(\'matchType\',this.value)">';
  h+='<option value="friendly"'+(roster.matchType==='friendly'?' selected':'')+'>'+(lang==='ar'?'ودية':'Friendly')+'</option>';
  h+='<option value="official"'+(roster.matchType==='official'?' selected':'')+'>'+(lang==='ar'?'رسمية':'Official')+'</option></select></div></div></details>';

  // Staff section
  h+='<details class="roster-staff-section" '+(roster.staff&&roster.staff.length?'open':'')+'>';
  h+='<summary><i class="fas fa-users"></i> '+(lang==='ar'?'الجهاز الفني والإداري':'Staff')+' <span class="staff-count">'+(roster.staff?roster.staff.length:0)+'</span></summary>';
  h+='<div id="rosterStaffContainer">';
  if(roster.staff) roster.staff.forEach(function(sm,si){
    h+='<div class="roster-staff-row" data-idx="'+si+'">';
    h+='<input type="text" class="rs-name" value="'+esc(sm.name||'')+'" placeholder="'+(lang==='ar'?'الاسم':'Name')+'" onchange="updateStaffMember('+si+',\'name\',this.value)">';
    h+='<input type="text" class="rs-role" value="'+esc(sm.role||'')+'" placeholder="'+(lang==='ar'?'المهمة':'Role')+'" onchange="updateStaffMember('+si+',\'role\',this.value)">';
    h+='<span class="rs-del" onclick="removeStaffMember('+si+')" title="'+t('delete')+'"><i class="fas fa-times"></i></span></div>';
  });
  h+='</div>';
  h+='<button class="hbtn" style="font-size:10px;margin-top:4px" onclick="addStaffMember()"><i class="fas fa-plus"></i> '+(lang==='ar'?'إضافة عضو':'Add staff')+'</button></details>';

  // Player list header (with Role column instead of bench toggle)
  h+='<div class="roster-list-header">';
  h+='<span class="rh-idx">#</span>';
  h+='<span class="rh-drag" style="min-width:18px;text-align:center"></span>';
  h+='<span class="rh-num">'+(lang==='ar'?'الرقم':'Num')+'</span>';
  h+='<span class="rh-name">'+(lang==='ar'?'اسم اللاعب':'Player Name')+'</span>';
  h+='<span class="rh-nickname" style="min-width:50px;text-align:center;font-size:8px">'+(lang==='ar'?'اللقب':'Nick')+'</span>';
  h+='<span class="rh-photo" style="min-width:30px;text-align:center;font-size:8px"><i class="fas fa-camera"></i></span>';
  h+='<span class="rh-pos" style="min-width:40px;text-align:center;font-size:8px">'+(lang==='ar'?'مركز':'Pos')+'</span>';
  h+='<span class="rh-role" style="min-width:60px;text-align:center;font-size:8px">'+(lang==='ar'?'الدور':'Role')+'</span>';
  h+='<span class="rh-act"></span>';
  h+='</div>';

  // Player rows with role selector, position dropdowns
  var posOptions=['','GK','DEF','MID','FWD'];
  var posLabels={'':'--','GK':lang==='ar'?'حارس':'GK','DEF':lang==='ar'?'دفاع':'DEF','MID':lang==='ar'?'وسط':'MID','FWD':lang==='ar'?'هجوم':'FWD'};
  var roleOptions=['starting_gk','starter','sub_gk','substitute'];
  var roleLabels={'starting_gk':lang==='ar'?'حارس أساسي':'Starting GK','starter':lang==='ar'?'أساسي':'Starter','sub_gk':lang==='ar'?'حارس احتياط':'Sub GK','substitute':lang==='ar'?'احتياط':'Substitute'};
  roster.players.forEach(function(pl,i){
    var role=pl.role||(pl.bench?'substitute':'starter');
    if(i===0&&role==='starter') role='starting_gk';
    var roleColor=getRoleColor(role);
    h+='<div class="roster-player-row" draggable="true" ondragstart="dragPlayerStart(event,'+i+')" ondragover="dragPlayerOver(event)" ondrop="dragPlayerDrop(event,'+i+')" ondragenter="this.classList.add(\'rp-drag-over\')" ondragleave="this.classList.remove(\'rp-drag-over\')">';
    h+='<span class="rp-idx">'+(i+1)+'</span>';
    h+='<span class="rp-drag-handle" title="'+(lang==='ar'?'سحب لترتيب':'Drag to reorder')+'"><i class="fas fa-grip-vertical"></i></span>';
    h+='<input type="number" class="rp-num" value="'+(pl.num!==undefined?pl.num:(i+1))+'" min="0" max="99" onchange="updateRosterPlayer('+i+',\'num\',+this.value)">';
    h+='<input type="text" class="rp-name" value="'+esc(pl.name||'')+'" placeholder="'+t('player_name_ph')+'" oninput="updateRosterPlayer('+i+',\'name\',this.value)">';
    h+='<input type="text" class="rp-nickname" value="'+esc(pl.nickname||'')+'" placeholder="'+(lang==='ar'?'اللقب':'Nick')+'" oninput="updateRosterPlayer('+i+',\'nickname\',this.value)">';
    h+='<span class="rp-photo-btn" onclick="document.getElementById(\'rpPhotoInput'+i+'\').click()" title="'+(lang==='ar'?'إضافة صورة':'Add photo')+'">';
    if(pl.photo) h+='<img class="rp-photo-thumb" src="'+esc(pl.photo)+'" onclick="event.stopPropagation();showConfirmModal(\''+(lang==='ar'?'تأكيد':'Confirm')+'\',\''+(lang==='ar'?'إزالة الصورة؟':'Remove photo?')+'\',function(ok){if(!ok)return;var inp=document.getElementById(\'rpPhotoInput'+i+'\');inp.value=\'\';updateRosterPlayer('+i+',\'photo\',null);})">';
    else h+='<i class="fas fa-camera"></i>';
    h+='</span><input type="file" id="rpPhotoInput'+i+'" accept="image/*" style="display:none" onchange="var f=this.files[0];if(f&&validateImageFile(f,2)){var r=new FileReader();r.onload=function(e){updateRosterPlayer('+i+',\'photo\',e.target.result);};r.readAsDataURL(f);}">';
    h+='<select class="rp-pos" onchange="updateRosterPlayer('+i+',\'position\',this.value)">';
    posOptions.forEach(function(po){h+='<option value="'+po+'"'+(pl.position===po?' selected':'')+'>'+posLabels[po]+'</option>';});
    h+='</select>';
    h+='<select class="rp-role" onchange="updatePlayerRole('+i+',this.value)" style="border-color:'+roleColor+'">';
    roleOptions.forEach(function(ro){h+='<option value="'+ro+'"'+(role===ro?' selected':'')+'>'+roleLabels[ro]+'</option>';});
    h+='</select>';
    h+='<span class="rp-del" onclick="removeRosterPlayer('+i+')" title="'+t('delete')+'"><i class="fas fa-times"></i></span>';
    h+='</div>';
  });

  ed.innerHTML=h;
}

var _dragPlayerIdx=-1;
function dragPlayerStart(e,i){_dragPlayerIdx=i;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',String(i));}
function dragPlayerOver(e){e.preventDefault();e.dataTransfer.dropEffect='move';}
function dragPlayerDrop(e,ti){e.preventDefault();e.target.closest('.roster-player-row')&&e.target.closest('.roster-player-row').classList.remove('rp-drag-over');if(_dragPlayerIdx<0||_dragPlayerIdx===ti||!activeRoster||!teamRosters[activeRoster])return;var pl=teamRosters[activeRoster].players.splice(_dragPlayerIdx,1)[0];teamRosters[activeRoster].players.splice(ti,0,pl);for(var i=0;i<teamRosters[activeRoster].players.length;i++){teamRosters[activeRoster].players[i].num=i+1;}_dragPlayerIdx=-1;saveTeamRosters();renderRosterEditor(activeRoster);renderRosterList();}

function bulkAddPlayers(){
  if(!activeRoster) return;
  var existing=document.getElementById('bulkAddOverlay');
  if(existing)existing.remove();
  var ov=document.createElement('div');
  ov.id='bulkAddOverlay';
  ov.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:1000;display:flex;align-items:center;justify-content:center';
  ov.onclick=function(e){if(e.target===ov)ov.remove();};
  var box=document.createElement('div');
  box.style.cssText='background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:20px;max-width:420px;width:90%;max-height:80vh;overflow-y:auto';
  var h='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px"><h3 style="font-size:14px;color:var(--accent)"><i class="fas fa-users"></i> '+(lang==='ar'?'إضافة جماعية':'Bulk Add Players')+'</h3><button class="hbtn icon-only danger" onclick="this.closest(\'#bulkAddOverlay\').remove()" style="width:24px;height:24px;font-size:10px"><i class="fas fa-times"></i></button></div>';
  h+='<p style="font-size:11px;color:var(--text2);margin-bottom:8px">'+(lang==='ar'?'أدخل أسماء اللاعبين، كل اسم في سطر. الصيغة: اسم،الرقم (اختياري)':'Enter player names, one per line. Format: Name,Num (optional)')+'</p>';
  h+='<textarea id="bulkAddTextarea" style="width:calc(100% - 16px);min-height:160px;padding:8px;background:var(--bg);border:1px solid var(--border);border-radius:4px;color:var(--text);font-size:12px;font-family:inherit;resize:vertical" placeholder="'+(lang==='ar'?'مثال:\nمحمد,10\nأحمد,7\nسعد':'Example:\nJohn,10\nJane,7\nBob')+'"></textarea>';
  h+='<div style="display:flex;gap:8px;margin-top:10px;justify-content:flex-end"><button class="hbtn" onclick="this.closest(\'#bulkAddOverlay\').remove()">'+t('cancel')+'</button><button class="hbtn primary" onclick="confirmBulkAdd(this)">'+(lang==='ar'?'إضافة':'Add')+'</button></div>';
  box.innerHTML=h;ov.appendChild(box);document.body.appendChild(ov);
  document.getElementById('bulkAddTextarea').focus();
}
function confirmBulkAdd(btn){
  if(!activeRoster||!teamRosters[activeRoster])return;
  var ta=document.getElementById('bulkAddTextarea');var txt=ta.value.trim();if(!txt)return;
  var lines=txt.split('\n').map(function(l){return l.trim();}).filter(function(l){return l;});
  var roster=teamRosters[activeRoster];
  lines.forEach(function(ln){
    var parts=ln.split(',').map(function(p){return p.trim();});
    var name=parts[0]||'',num=parts[1]?parseInt(parts[1]):(roster.players.length+1);if(isNaN(num))num=roster.players.length+1;
    roster.players.push({num:num,name:name,bench:false,position:''});
  });
  var fieldSz=getFieldSizeForSport(sport);
  for(var i=0;i<roster.players.length;i++){roster.players[i].bench=i>=fieldSz;}
  saveTeamRosters();renderRosterEditor(activeRoster);renderRosterList();
  btn.closest('#bulkAddOverlay').remove();
  toast(lines.length+' '+(lang==='ar'?'لاعب تمت إضافتهم':'players added'));
}

function exportRosterCSV(){
  if(!activeRoster||!teamRosters[activeRoster])return;
  var roster=teamRosters[activeRoster];
  var csv='\uFEFF';
  csv+=(lang==='ar'?'اسم,الرقم,احتياط,مركز':'Name,Num,Bench,Position')+'\r\n';
  roster.players.forEach(function(pl){
    csv+= (pl.name||'')+','+(pl.num!==undefined?pl.num:'')+','+(pl.bench?'Yes':'No')+','+(pl.position||'')+'\r\n';
  });
  var blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  var url=URL.createObjectURL(blob);var a=document.createElement('a');a.href=url;
  a.download=activeRoster+'_'+(lang==='ar'?'قائمة':'roster')+'.csv';
  document.body.appendChild(a);a.click();document.body.removeChild(a);URL.revokeObjectURL(url);
}
function importRosterCSV(input){
  if(!input.files||!input.files[0]||!activeRoster||!teamRosters[activeRoster])return;
  var file=input.files[0];var reader=new FileReader();
  reader.onload=function(e){
    var txt=e.target.result;var lines=txt.split('\n').filter(function(l){return l.trim();});
    if(lines.length<2){toast(lang==='ar'?'ملف غير صالح':'Invalid CSV');return;}
    var roster=teamRosters[activeRoster];roster.players=[];
    for(var i=1;i<lines.length;i++){
      var parts=lines[i].split(',').map(function(p){return p.trim();});
      if(!parts[0]&&!parts[1])continue;
      roster.players.push({name:parts[0]||'',num:parts[1]?parseInt(parts[1]):i,bench:parts[2]&&parts[2].toLowerCase()==='yes',position:parts[3]||''});
    }
    var fieldSz=getFieldSizeForSport(sport);
    for(var i=0;i<roster.players.length;i++){roster.players[i].bench=roster.players[i].bench||i>=fieldSz;}
    saveTeamRosters();renderRosterEditor(activeRoster);renderRosterList();
    toast((roster.players.length)+' '+(lang==='ar'?'لاعب تم استيرادهم':'players imported'));
    input.value='';
  };
  reader.readAsText(file);
}

function renameRoster(newName){
  newName=newName.trim(); if(!newName||!activeRoster) return;
  if(newName===activeRoster) return;
  if(teamRosters[newName]){ toast(lang==='ar'?'\u0627\u0644\u0627\u0633\u0645 \u0645\u0648\u062c\u0648\u062f':'Name exists'); return; }
  teamRosters[newName]=JSON.parse(JSON.stringify(teamRosters[activeRoster]));
  teamRosters[newName].name=newName;
  if(teamRosterAssignment.A===activeRoster) teamRosterAssignment.A=newName;
  if(teamRosterAssignment.B===activeRoster) teamRosterAssignment.B=newName;
  delete teamRosters[activeRoster]; activeRoster=newName;
  saveTeamRosters(); renderRosterList();
}

function updateRosterCount(count){
  if(!activeRoster||!teamRosters[activeRoster]) return;
  var roster=teamRosters[activeRoster];
  var fieldSz=getFieldSizeForSport(sport);
  while(roster.players.length<count){
    var idx=roster.players.length;
    roster.players.push({num:idx+1, name:'', bench:idx>=fieldSz, position:'', role:idx===0?'starting_gk':(idx<fieldSz?'starter':'substitute')});
  }
  while(roster.players.length>count) roster.players.pop();
  assignDefaultPositions(roster.players,fieldSz);
  autoAssignRoles(roster.players,fieldSz);
  saveTeamRosters(); renderRosterEditor(activeRoster);
}

function updateRosterPlayer(idx,prop,val){
  if(!activeRoster||!teamRosters[activeRoster]) return;
  if(!teamRosters[activeRoster].players[idx]) return;
  teamRosters[activeRoster].players[idx][prop]=val;
  // Preload photo into cache immediately
  if(prop==='photo'&&val){
    if(!window._photoCache) window._photoCache={};
    if(!window._photoCache[val]){
      var img=new Image();
      img.crossOrigin='anonymous';
      img.onload=function(){window._photoCache[val]=this;if(typeof render==='function')render();};
      img.src=val;
    }
  }
  saveTeamRosters();
}

function removeRosterPlayer(idx){
  if(!activeRoster||!teamRosters[activeRoster]) return;
  teamRosters[activeRoster].players.splice(idx,1);
  // Re-number and re-assign roles
  var fieldSz=getFieldSizeForSport(sport);
  for(var i=0;i<teamRosters[activeRoster].players.length;i++){
    teamRosters[activeRoster].players[i].num=i+1;
  }
  autoAssignRoles(teamRosters[activeRoster].players,fieldSz);
  saveTeamRosters(); renderRosterEditor(activeRoster); renderRosterList();
}

function updateRosterMeta(prop,val){
  if(!activeRoster||!teamRosters[activeRoster]) return;
  teamRosters[activeRoster][prop]=val;
  saveTeamRosters();
}

function updatePlayerRole(idx,role){
  if(!activeRoster||!teamRosters[activeRoster]) return;
  if(!teamRosters[activeRoster].players[idx]) return;
  teamRosters[activeRoster].players[idx].role=role;
  // Auto-set bench based on role
  teamRosters[activeRoster].players[idx].bench=(role==='substitute'||role==='sub_gk');
  var fieldSz=getFieldSizeForSport(sport);
  autoAssignRoles(teamRosters[activeRoster].players,fieldSz);
  saveTeamRosters(); renderRosterEditor(activeRoster);
}

function addStaffMember(){
  if(!activeRoster||!teamRosters[activeRoster]) return;
  if(!teamRosters[activeRoster].staff) teamRosters[activeRoster].staff=[];
  teamRosters[activeRoster].staff.push({name:'',role:lang==='ar'?'مساعد مدرب':'Assistant Coach'});
  saveTeamRosters(); renderRosterEditor(activeRoster);
}
function removeStaffMember(idx){
  if(!activeRoster||!teamRosters[activeRoster]||!teamRosters[activeRoster].staff) return;
  teamRosters[activeRoster].staff.splice(idx,1);
  saveTeamRosters(); renderRosterEditor(activeRoster);
}
function updateStaffMember(idx,prop,val){
  if(!activeRoster||!teamRosters[activeRoster]||!teamRosters[activeRoster].staff) return;
  if(!teamRosters[activeRoster].staff[idx]) return;
  teamRosters[activeRoster].staff[idx][prop]=val;
  saveTeamRosters();
}

function printRosterCard(rosterName,selectedPlayers,includeCoach){
  if(includeCoach===undefined) includeCoach=true;
  if(!rosterName||!teamRosters[rosterName]) return;
  var roster=teamRosters[rosterName];
  var isAr=lang==='ar';
  var namedPlayers=selectedPlayers||(roster.players||[]).filter(function(pl){return pl.name&&pl.name.trim();});
  var w=window.open('','_blank');
  var d=w.document;
  var dateStr=roster.matchDate?new Date(roster.matchDate+'T00:00:00').toLocaleDateString(isAr?'ar-MA':'en-US'):'';
  var matchTypeLabel=roster.matchType==='official'?(isAr?'رسمية':'Official'):(isAr?'ودية':'Friendly');
  d.write('<!DOCTYPE html><html dir="'+(isAr?'rtl':'ltr')+'"><head><meta charset="utf-8"><title>'+esc(rosterName)+'</title>');
  d.write('<style>body{font-family:Cairo,Inter,sans-serif;background:#fff;color:#1a1f2e;padding:30px;max-width:800px;margin:0 auto}');
  d.write('.header{text-align:center;border-bottom:3px solid #0d6efd;padding-bottom:15px;margin-bottom:20px}');
  d.write('.logo{width:80px;height:80px;border-radius:50%;object-fit:cover;border:3px solid #0d6efd;margin-bottom:10px}');
  d.write('h1{font-size:24px;margin:5px 0;color:#0d6efd}');
  d.write('.meta{font-size:13px;color:#666;margin:4px 0}');
  d.write('table{width:100%;border-collapse:collapse;margin-top:15px}');
  d.write('th{background:#0d6efd;color:#fff;padding:8px 12px;font-size:12px;text-align:'+(isAr?'right':'left')+'}');
  d.write('td{padding:7px 12px;border-bottom:1px solid #eee;font-size:13px}');
  d.write('tr:nth-child(even){background:#f8f9fa}');
  d.write('.num-badge{display:inline-block;width:26px;height:26px;border-radius:50%;background:#0d6efd;color:#fff;text-align:center;line-height:26px;font-weight:bold;font-size:12px}');
  d.write('.num-badge.gk{background:#ffc107;color:#1a1f2e}');
  d.write('.footer{text-align:center;margin-top:25px;font-size:11px;color:#999;border-top:1px solid #eee;padding-top:10px}');
  d.write('.staff-section{margin-top:20px;padding:12px;background:#f0f4ff;border-radius:8px}');
  d.write('.staff-section h3{font-size:14px;margin:0 0 8px 0;color:#0d6efd}');
  d.write('.staff-item{font-size:12px;margin:3px 0}');
  d.write('@media print{body{padding:15px}}');
  d.write('</style></head><body>');
  d.write('<div class="header">');
  if(roster.logo) d.write('<img class="logo" src="'+esc(roster.logo)+'">');
  d.write('<h1>'+esc(rosterName)+'</h1>');
  if(roster.coachName&&includeCoach) d.write('<div class="meta"><strong>'+(isAr?'المدرب':'Coach')+':</strong> '+esc(roster.coachName)+'</div>');
  d.write('<div class="meta">'+sport.toUpperCase()+' \u2022 '+namedPlayers.length+' '+(isAr?'لاعب':'players')+'</div>');
  if(dateStr||roster.stadium||roster.opponent){
    d.write('<div class="meta">');
    if(dateStr) d.write(dateStr+' | ');
    if(roster.stadium) d.write((isAr?'ملعب:':'Stadium:')+' '+esc(roster.stadium)+' | ');
    if(roster.opponent) d.write((isAr?'الخصم:':'vs')+' '+esc(roster.opponent)+' | ');
    d.write(matchTypeLabel);
    d.write('</div>');
  }
  d.write('</div>');
  d.write('<table><thead><tr><th>#</th><th>'+(isAr?'الرقم':'Num')+'</th><th>'+(isAr?'الاسم':'Player Name')+'</th></tr></thead><tbody>');
  namedPlayers.forEach(function(pl,idx){
    d.write('<tr><td>'+(idx+1)+'</td><td><span class="num-badge">'+esc(pl.num||(idx+1))+'</span></td><td>'+esc(pl.name||'')+'</td></tr>');
  });
  d.write('</tbody></table>');
  if(includeCoach&&roster.staff&&roster.staff.length){
    d.write('<div class="staff-section"><h3><i class="fas fa-users"></i> '+(isAr?'الجهاز الفني والإداري':'Staff')+'</h3>');
    roster.staff.forEach(function(sm){
      if(sm.name||sm.role) d.write('<div class="staff-item"><strong>'+esc(sm.role||'')+'</strong>'+(sm.name?': '+esc(sm.name):'')+'</div>');
    });
    d.write('</div>');
  }
  d.write('<div class="footer">CoachBoard Pro \u2022 '+new Date().toLocaleDateString(isAr?'ar-MA':'en-US')+'</div>');
  d.write('</body></html>');
  d.close();
  setTimeout(function(){w.print();},300);
}

function assignRosterToTeam(team){
  if(!activeRoster) return;
  teamRosterAssignment[team]=activeRoster;
  saveTeamRosters(); renderRosterList(); updateAssignButtons();
  toast(t('roster_assigned')+' - '+(team==='A'?t('teamA'):t('teamB')));
}

function unassignRoster(){
  teamRosterAssignment[curTeam]=null;
  saveTeamRosters(); updateAssignButtons(); renderRosterList();
}

function updateAssignButtons(){
  var btnA=document.getElementById('assignTeamA'),
      btnB=document.getElementById('assignTeamB'),
      unBtn=document.getElementById('unassignBtn');
  if(btnA) btnA.style.borderColor=teamRosterAssignment.A?'var(--tmA)':'var(--border)';
  if(btnB) btnB.style.borderColor=teamRosterAssignment.B?'var(--danger)':'var(--border)';
  if(unBtn) unBtn.style.display=teamRosterAssignment[curTeam]?'inline-flex':'none';
}

// ============ PLACE ROSTER (sport-aware) ============
function confirmAndPlaceRoster(){
  if(!activeRoster||!teamRosters[activeRoster]) return;
  // Auto-assign active roster to current team
  teamRosterAssignment[curTeam]=activeRoster;
  var roster=teamRosters[activeRoster];
  var fieldSz=getFieldSizeForSport(sport);
  // Set bench based on role
  roster.players.forEach(function(pl){
    pl.bench=(pl.role==='substitute'||pl.role==='sub_gk');
  });
  autoAssignRoles(roster.players,fieldSz);
  saveTeamRosters();
  // Preload all player photos
  if(!window._photoCache) window._photoCache={};
  roster.players.forEach(function(pl){
    if(pl.photo&&!window._photoCache[pl.photo]){
      var img=new Image();
      img.crossOrigin='anonymous';
      img.onload=function(){window._photoCache[pl.photo]=this;};
      img.src=pl.photo;
    }
  });
  // Read selected formation
  var fmtSel=document.getElementById('rosterFmtSelect');
  var defs=formationDefs[sport]||[];
  var selectedFmt=(fmtSel&&fmtSel.value)?fmtSel.value:(defs.length>0?defs[0][0]:null);
  closeTeamManager();
  if(selectedFmt) placeFormation(sport,selectedFmt);
  else render();
  // Auto-enable showPlayerNames
  if(!showPlayerNames){showPlayerNames=true;saveTeamRosters();}
  toast(t('roster_placed')+' ('+fieldSz+' '+
    (lang==='ar'?'\u0644\u0627\u0639\u0628 \u0641\u064a \u0627\u0644\u0645\u0644\u0639\u0628':'players on field')+')');
}

// Update formation dropdown when team manager opens
function updateFormationSelect(){
  var sel=document.getElementById('rosterFmtSelect'); if(!sel) return;
  var defs=formationDefs[sport]||[];
  var currentFmt=teamFormations[curTeam]?teamFormations[curTeam].fmt:'';
  var h='<option value="">'+(lang==='ar'?'اختر التشكيلة':'Select formation')+'</option>';
  defs.forEach(function(d){
    h+='<option value="'+esc(d[0])+'"'+(currentFmt===d[0]?' selected':'')+'>'+esc(d[1])+'</option>';
  });
  if(!defs.length) h='<option value="">'+(lang==='ar'?'\u0628\u062f\u0648\u0646 \u062a\u0634\u0643\u064a\u0644\u0629':'No formation')+'</option>';
  sel.innerHTML=h;
}

function onFormationChange(){
  // Live preview: when formation dropdown changes, re-place on pitch if any roster assigned to curTeam
  var assigned=teamRosterAssignment[curTeam];
  if(!assigned||!teamRosters[assigned]) return;
  var fmtSel=document.getElementById('rosterFmtSelect');
  if(!fmtSel||!fmtSel.value) return;
  var roster=teamRosters[assigned];
  var fieldSz=getFieldSizeForSport(sport);
  roster.players.forEach(function(pl){pl.bench=(pl.role==='substitute'||pl.role==='sub_gk');});
  autoAssignRoles(roster.players,fieldSz);
  saveTeamRosters();
  placeFormation(sport,fmtSel.value);
  // Also sync activeRoster if showing the assigned roster in the editor
  if(activeRoster!==assigned){activeRoster=assigned;renderRosterList();renderRosterEditor(assigned);}
}

// ============ TEAM EXPORT / IMPORT ============
function exportTeam(rosterName){
  if(!rosterName||!teamRosters[rosterName]){
    toast(lang==='ar'?'الرجاء اختيار فريق':'Select a team first');
    return;
  }
  var data=JSON.stringify(teamRosters[rosterName],null,2);
  var js='// CoachBoard Team Data: '+rosterName+'\nwindow._EXPORTED_TEAM_='+data+';\n';
  var blob=new Blob([js],{type:'application/javascript'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;
  a.download='team_'+(rosterName.replace(/[^a-zA-Z0-9_\-]/g,'_'))+'.js';
  a.click();
  URL.revokeObjectURL(url);
  toast(lang==='ar'?'تم تصدير الفريق':'Team exported');
}

function importTeam(){
  var inp=document.getElementById('teamImportInput');
  if(!inp){
    inp=document.createElement('input');
    inp.id='teamImportInput';
    inp.type='file';
    inp.accept='.js,.json';
    inp.style.display='none';
    document.body.appendChild(inp);
  }
  inp.onchange=function(){
    var f=inp.files[0];
    if(!f) return;
    var r=new FileReader();
    r.onload=function(e){
      var content=e.target.result;
      try{
        // Try JSON first, then JS with window._EXPORTED_TEAM_
        var data=null;
        if(f.name.endsWith('.json')){
          data=JSON.parse(content);
        } else {
          var match=content.match(/window\._EXPORTED_TEAM_=([\s\S]+?);?\s*$/);
          if(match) data=JSON.parse(match[1]);
        }
        if(!data){
          toast(lang==='ar'?'ملف غير صالح':'Invalid file');
          return;
        }
        // Import the roster
        var baseName=f.name.replace(/\.(js|json)$/,'').replace(/^team_/,'');
        var newName=baseName;
        var suffix=2;
        while(teamRosters[newName]) newName=baseName+'_'+suffix++;
        teamRosters[newName]=data;
        // Ensure players array exists
        if(!teamRosters[newName].players) teamRosters[newName].players=[];
        // Ensure staff array exists
        if(!teamRosters[newName].staff) teamRosters[newName].staff=[];
        saveTeamRosters();
        activeRoster=newName;
        renderRosterList();
        renderRosterEditor(newName);
        toast(lang==='ar'?'تم استيراد الفريق: ':'Imported: ')+newName;
      }catch(err){
        toast(lang==='ar'?'خطأ في القراءة':'Parse error');
        console.error(err);
      }
    };
    r.readAsText(f);
    inp.value='';
  };
  inp.click();
}
// ============ REMOVE TEAM FROM PITCH ============
function removeTeamFromPitch(team){
  if(team===undefined) team=curTeam;
  var removed=0;
  for(var i=els.length-1;i>=0;i--){
    if(els[i]._formationTeam===team){
      els.splice(i,1);
      removed++;
    }
  }
  selIds.clear();
  teamFormations[team]=null;
  teamFormationProps[team]=null;
  saveH();updateProps();updateLayers();renderFormationsPanel();render();
  toast((lang==='ar'?'تم إزالة الفريق من الملعب':'Team removed from pitch')+' ('+team+')');
}
// ============ BENCH PLAYERS + COACH DRAWING ============
function drawBenchPlayers(){
  if(typeof els==='undefined') return;
  ['A','B'].forEach(function(team){
    // Skip fallback if formation was placed (elements exist OR were deliberately removed)
    var hasBenchEls=els.some(function(el){return el._formationTeam===team&&(el._isBench||el._isCoach);});
    var hasFormation=teamFormations&&teamFormations[team]&&teamFormations[team].fmt;
    if(hasBenchEls||hasFormation) return;
    var assignedRoster=teamRosterAssignment[team];
    if(!assignedRoster||!teamRosters[assignedRoster]) return;
    var roster=teamRosters[assignedRoster];
    var benchPlayers=roster.players.filter(function(pl){return pl.bench;});
    var coachName=roster.coachName||'';
    if(!benchPlayers.length&&!coachName) return;
    var p=pRect(); if(!p||p.w<50) return;
    var teamColor=team==='A'?'#4a90d9':'#e84040';
    var benchSize=10, gap=benchSize*2.8, rowMax=5;

    // Helper to draw coach with (C) marker
    function drawCoach(cx2,cy2){
      cx.save(); cx.globalAlpha=0.95;
      cx.fillStyle='#ffc107'; cx.beginPath(); cx.arc(cx2,cy2,benchSize*1.2,0,Math.PI*2); cx.fill();
      cx.strokeStyle='rgba(255,255,255,0.7)'; cx.lineWidth=2; cx.stroke();
      cx.fillStyle='#1a1f2e'; cx.font='bold '+Math.max(8,benchSize*0.8)+'px Inter,Cairo';
      cx.textAlign='center'; cx.textBaseline='middle';
      cx.fillText('\u24B8',cx2,cy2); // (C) marker
      var label=coachName||t('coach')||'Coach';
      cx.fillStyle='#ffc107'; cx.font='bold '+Math.max(7,benchSize*0.55)+'px Cairo,Inter';
      cx.textAlign='center'; cx.textBaseline='top';
      cx.shadowColor='rgba(0,0,0,0.5)'; cx.shadowBlur=3;
      cx.fillText(label,cx2,cy2+benchSize*1.3+3);
      cx.shadowBlur=0;
      cx.fillStyle='rgba(255,193,7,0.4)'; cx.font='bold 7px Cairo,Inter'; cx.textBaseline='bottom';
      cx.fillText(lang==='ar'?'\u0645\u062F\u0631\u0628':'COACH',cx2,cy2-benchSize*1.2-3);
      cx.restore();
    }

    // Helper to draw a single bench player
    function drawBench(bx,by,pl){
      var isSubGK=pl.role==='sub_gk';
      var bgColor=isSubGK?'#fd7e14':teamColor;
      cx.save(); cx.globalAlpha=0.9;
      cx.fillStyle=bgColor; cx.beginPath(); cx.arc(bx,by,benchSize,0,Math.PI*2); cx.fill();
      cx.strokeStyle='rgba(255,255,255,0.5)'; cx.lineWidth=1.5; cx.stroke();
      cx.fillStyle='#fff'; cx.font='bold '+Math.max(7,benchSize*0.7)+'px Inter,Cairo';
      cx.textAlign='center'; cx.textBaseline='middle';
      cx.fillText(String(pl.num||''),bx,by);
      if(pl.name){
        cx.fillStyle=theme==='dark'?'rgba(255,255,255,0.7)':'rgba(0,0,0,0.6)';
        cx.font='bold '+Math.max(6,benchSize*0.5)+'px Cairo,Inter';
        cx.textAlign='center'; cx.textBaseline='top';
        cx.fillText(pl.name,bx,by+benchSize+3);
      }
      cx.fillStyle='rgba(255,255,255,0.3)'; cx.font='7px Cairo,Inter'; cx.textBaseline='bottom';
      cx.fillText(isSubGK?(lang==='ar'?'\u062D\u0627\u0631\u0633 \u0627\u062D\u062A\u064A\u0627\u0637':'Sub GK'):t('bench'),bx,by-benchSize-2);
      cx.restore();
    }

    // Layout in rows of rowMax, positioned away from touchline
    var totalItems=benchPlayers.length+(coachName?1:0);
    var rows=Math.ceil(totalItems/rowMax);
    var startY=team==='A'?p.y-benchSize*4:p.y+p.h+benchSize*4;
    if(startY<benchSize*2) startY=benchSize*2;
    if(startY>H-benchSize*2) startY=H-benchSize*2;
    var idx=0;
    if(coachName){
      var rowW=Math.min(rowMax,totalItems)*gap;
      var cx2=p.x+p.w/2-rowW/2+gap/2;
      drawCoach(cx2,startY);
      idx++;
    }
    benchPlayers.forEach(function(pl,i){
      var rowIdx=Math.floor((i+(coachName?1:0))/rowMax);
      var colIdx=(i+(coachName?1:0))%rowMax;
      var rowTotal=Math.min(rowMax,totalItems-rowIdx*rowMax);
      var rowW=(rowTotal-1)*gap;
      var bx=p.x+p.w/2-rowW/2+colIdx*gap;
      var by=startY+(team==='A'?-1:1)*rowIdx*benchSize*3.5;
      drawBench(bx,by,pl);
    });
  });
}

// ============ EXPORT DIALOG ============
function showExportDialog(){
  if(!activeRoster||!teamRosters[activeRoster]){toast(lang==='ar'?'الرجاء اختيار فريق':'Select a team first');return;}
  var roster=teamRosters[activeRoster];
  var isAr=lang==='ar';
  var existing=document.getElementById('exportDialogOverlay');
  if(existing)existing.remove();
  var ov=document.createElement('div');
  ov.id='exportDialogOverlay';
  ov.style.cssText='position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:1000;display:flex;align-items:center;justify-content:center';
  ov.onclick=function(e){if(e.target===ov)ov.remove();};
  var box=document.createElement('div');
  box.style.cssText='background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:24px;max-width:500px;width:90%;max-height:80vh;overflow-y:auto';
  var h='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">';
  h+='<h3 style="font-size:15px;color:var(--accent)"><i class="fas fa-file-export"></i> '+(isAr?'تصدير قائمة اللاعبين':'Export Squad List')+'</h3>';
  h+='<button class="hbtn icon-only danger" onclick="this.closest(\'#exportDialogOverlay\').remove()" style="width:28px;height:28px"><i class="fas fa-times"></i></button></div>';
  h+='<p style="font-size:11px;color:var(--text2);margin-bottom:10px">'+(isAr?'اختر اللاعبين الذين تريد تصديرهم':'Select players to export')+'</p>';
  h+='<div style="margin-bottom:8px"><label style="font-size:11px;display:flex;align-items:center;gap:6px;cursor:pointer"><input type="checkbox" id="exportSelAll" checked onchange="document.querySelectorAll(\'.export-chk\').forEach(function(c){c.checked=this.checked;},this)" style="width:14px;height:14px;accent-color:var(--accent)"> <strong>'+(isAr?'اختيار الكل':'Select All')+'</strong></label></div>';
  h+='<div style="max-height:300px;overflow-y:auto;border:1px solid var(--border);border-radius:var(--radius);padding:6px;background:var(--bg)">';
  roster.players.forEach(function(pl,i){
    if(!pl.name&&pl.num===undefined) return;
    var label=pl.name||'';
    if(pl.num!==undefined) label=(pl.num)+'. '+label;
    if(pl.position) label+=' ('+pl.position+')';
    h+='<label style="display:flex;align-items:center;gap:6px;padding:4px 6px;font-size:12px;cursor:pointer;border-radius:3px;transition:background 0.1s" onmouseenter="this.style.background=\'var(--surface)\'" onmouseleave="this.style.background=\'\'">';
    h+='<input type="checkbox" class="export-chk" checked data-idx="'+i+'" style="width:14px;height:14px;accent-color:var(--accent)">';
    h+='<span>'+(label||(isAr?'لاعب ':'Player ')+(i+1))+'</span></label>';
  });
  h+='</div>';
  h+='<div style="display:flex;align-items:center;gap:12px;margin-top:10px;flex-wrap:wrap">';
  h+='<label style="font-size:11px;display:flex;align-items:center;gap:4px;cursor:pointer"><input type="checkbox" id="exportIncludeCoach" checked style="width:14px;height:14px;accent-color:var(--accent)"> '+(isAr?'المدرب والجهاز الفني':'Coach & Staff')+'</label>';
  h+='</div>';
  h+='<div style="display:flex;gap:8px;margin-top:14px;justify-content:flex-end">';
  h+='<button class="hbtn" onclick="this.closest(\'#exportDialogOverlay\').remove()">'+t('cancel')+'</button>';
  h+='<button class="hbtn roster-export-btn" onclick="confirmExportSquad(\'png\')" title="'+(isAr?'تصدير بصيغة PNG':'Export as PNG')+'" style="background:var(--accent)!important"><i class="fas fa-file-image"></i> PNG</button>';
  h+='<button class="hbtn roster-export-btn" onclick="confirmExportSquad(\'pdf\')" title="'+(isAr?'تصدير بصيغة PDF':'Export as PDF')+'" style="background:var(--success)!important"><i class="fas fa-file-pdf"></i> PDF</button>';
  h+='</div>';
  box.innerHTML=h;ov.appendChild(box);document.body.appendChild(ov);
}
function confirmExportSquad(format){
  var ov=document.getElementById('exportDialogOverlay');
  var chks=document.querySelectorAll('.export-chk:checked');
  if(!chks.length){toast(lang==='ar'?'اختر لاعباً واحداً على الأقل':'Select at least one player');return;}
  var selected=[];
  chks.forEach(function(c){var idx=parseInt(c.dataset.idx);if(!isNaN(idx)&&teamRosters[activeRoster]&&teamRosters[activeRoster].players[idx])selected.push(teamRosters[activeRoster].players[idx]);});
  var includeCoach=document.getElementById('exportIncludeCoach')?document.getElementById('exportIncludeCoach').checked:true;
  if(ov)ov.remove();
  if(format==='pdf') printRosterCard(activeRoster,selected,includeCoach);
  else exportRosterCard(activeRoster,selected,includeCoach);
}

// ============ EXPORT ROSTER CARD ============
function exportRosterCard(rosterName,selectedPlayers,includeCoach){
  if(includeCoach===undefined) includeCoach=true;
  if(!rosterName||!teamRosters[rosterName]) return;
  var roster=teamRosters[rosterName];
  var coachName=(includeCoach?roster.coachName:'')||'';
  var isAr=lang==='ar';
  var namedPlayers=selectedPlayers||(roster.players||[]).filter(function(pl){return pl.name&&pl.name.trim();});
  var matchInfo='';
  if(roster.matchDate) matchInfo+=new Date(roster.matchDate+'T00:00:00').toLocaleDateString(isAr?'ar-MA':'en-US')+' ';
  if(roster.stadium) matchInfo+=(isAr?'ملعب: ':'Stadium: ')+roster.stadium+' ';
  if(roster.opponent) matchInfo+=(isAr?'الخصم: ':'vs ')+roster.opponent+' ';
  if(roster.matchType) matchInfo+='('+(roster.matchType==='official'?(isAr?'رسمية':'Official'):(isAr?'ودية':'Friendly'))+')';
  var logoImg=null;
  if(roster.logo){
    logoImg=new Image();
    var _ic=includeCoach;
    logoImg.onload=function(){ drawRosterCard(rosterName,roster,namedPlayers,coachName,isAr,logoImg,matchInfo,_ic); };
    logoImg.src=roster.logo;
  } else {
    drawRosterCard(rosterName,roster,namedPlayers,coachName,isAr,null,matchInfo,includeCoach);
  }
}

function drawRosterCard(rosterName,roster,namedPlayers,coachName,isAr,logoImg,matchInfo,includeCoach){
  if(includeCoach===undefined) includeCoach=true;
  var staffList=includeCoach?(roster.staff||[]):[];
  var hasStaff=staffList.length>0;
  var staffH=hasStaff?60+staffList.length*22:0;
  var cardW=700, headerH=130, rowH=36, footerH=40;
  var coachRowH=coachName?rowH:0;
  var matchRowH=matchInfo?rowH*0.8:0;
  var cardH=headerH+coachRowH+matchRowH+rowH+namedPlayers.length*rowH+staffH+footerH+20;
  if(cardH<400) cardH=400;
  var tmpCv=document.createElement('canvas');
  tmpCv.width=cardW; tmpCv.height=cardH;
  var tc=tmpCv.getContext('2d');
  tc.fillStyle='#1a1f2e'; tc.fillRect(0,0,cardW,cardH);
  var hGrad=tc.createLinearGradient(0,0,cardW,0);
  hGrad.addColorStop(0,'#0d6efd'); hGrad.addColorStop(1,'#0b5ed7');
  tc.fillStyle=hGrad; tc.fillRect(0,0,cardW,headerH);
  // Logo
  var logoX=40, logoY=25, logoSz=80;
  if(logoImg&&logoImg.complete&&logoImg.naturalWidth>0){
    tc.save(); tc.beginPath(); tc.arc(logoX+logoSz/2,logoY+logoSz/2,logoSz/2,0,Math.PI*2); tc.clip();
    tc.drawImage(logoImg,logoX,logoY,logoSz,logoSz); tc.restore();
  } else {
    tc.fillStyle='rgba(255,255,255,0.15)'; tc.beginPath(); tc.arc(logoX+logoSz/2,logoY+logoSz/2,logoSz/2,0,Math.PI*2); tc.fill();
    tc.fillStyle='rgba(255,255,255,0.4)'; tc.font='32px "Font Awesome 5 Free"'; tc.textAlign='center'; tc.textBaseline='middle';
    tc.fillText('\uf0c0',logoX+logoSz/2,logoY+logoSz/2);
  }
  // Team name
  tc.fillStyle='#fff'; tc.font='bold 28px Cairo,Inter,sans-serif';
  tc.textAlign=isAr?'right':'left'; tc.textBaseline='middle';
  var nameX=isAr?cardW-30:logoX+logoSz+20;
  tc.fillText(rosterName,nameX,50);
  // Sport & players
  tc.fillStyle='rgba(255,255,255,0.7)'; tc.font='14px Cairo,Inter,sans-serif';
  tc.fillText(sport.toUpperCase()+' | '+namedPlayers.length+' '+(isAr?'لاعب':'players'),nameX,80);
  tc.fillStyle='rgba(255,255,255,0.5)'; tc.font='11px Cairo,Inter,sans-serif';
  tc.fillText(new Date().toLocaleDateString(isAr?'ar-MA':'en-US'),nameX,105);
  // Coach row
  var curY=headerH+8;
  if(coachName){
    tc.fillStyle='#ffc107'; tc.fillRect(15,curY,cardW-30,coachRowH-2);
    tc.fillStyle='#1a1f2e'; tc.font='bold 14px Cairo,Inter,sans-serif';
    tc.textAlign=isAr?'right':'left'; tc.textBaseline='middle';
    tc.fillText((isAr?'المدرب: ':'Coach: ')+coachName, isAr?cardW-30:30, curY+coachRowH/2);
    curY+=coachRowH;
  }
  // Match info row
  if(matchInfo){
    tc.fillStyle='rgba(255,255,255,0.06)'; tc.fillRect(15,curY,cardW-30,matchRowH);
    tc.fillStyle='rgba(255,255,255,0.5)'; tc.font='12px Cairo,Inter,sans-serif';
    tc.textAlign='center'; tc.textBaseline='middle';
    tc.fillText(matchInfo,cardW/2,curY+matchRowH/2);
    curY+=matchRowH;
  }
  // Column headers (names only, no positions/roles)
  tc.fillStyle='rgba(255,255,255,0.08)'; tc.fillRect(15,curY,cardW-30,rowH-2);
  tc.fillStyle='rgba(255,255,255,0.6)'; tc.font='bold 12px Cairo,Inter,sans-serif';
  tc.textAlign='center'; tc.textBaseline='middle';
  var colIdx=isAr?cardW-60:60, colNum=isAr?cardW-150:150, colNm=isAr?cardW/2:cardW/2;
  tc.fillText(isAr?'الترتيب':'#',colIdx,curY+rowH/2);
  tc.fillText(isAr?'الرقم':'Num',colNum,curY+rowH/2);
  tc.fillText(isAr?'الاسم':'Name',colNm,curY+rowH/2);
  curY+=rowH;
  // Player rows (names only)
  var displayIdx=0;
  namedPlayers.forEach(function(pl){
    displayIdx++;
    if(displayIdx%2===0){tc.fillStyle='rgba(255,255,255,0.03)';tc.fillRect(15,curY,cardW-30,rowH-2);}
    tc.fillStyle='rgba(255,255,255,0.4)'; tc.font='bold 13px Cairo,Inter,sans-serif'; tc.textAlign='center'; tc.textBaseline='middle';
    tc.fillText(String(displayIdx),colIdx,curY+rowH/2);
    tc.fillStyle='#0d6efd';
    tc.beginPath(); tc.arc(colNum,curY+rowH/2,14,0,Math.PI*2); tc.fill();
    tc.fillStyle='#fff'; tc.font='bold 12px Cairo,Inter,sans-serif'; tc.fillText(String(pl.num||displayIdx),colNum,curY+rowH/2);
    tc.fillStyle='#fff'; tc.font='15px Cairo,Inter,sans-serif'; tc.textAlign=isAr?'right':'left';
    tc.fillText(pl.name,isAr?colNm+80:colNm-80,curY+rowH/2);
    curY+=rowH;
  });
  // Staff section
  if(hasStaff){
    curY+=8;
    tc.fillStyle='rgba(255,255,255,0.04)'; tc.fillRect(15,curY,cardW-30,staffH-8);
    tc.fillStyle='#ffc107'; tc.font='bold 13px Cairo,Inter,sans-serif'; tc.textAlign=isAr?'right':'left';
    tc.fillText((isAr?'الجهاز الفني والإداري':'Staff'),isAr?cardW-30:30,curY+18);
    curY+=28;
    staffList.forEach(function(sm){
      if(sm.name||sm.role){
        tc.fillStyle='rgba(255,255,255,0.5)'; tc.font='12px Cairo,Inter,sans-serif';
        tc.textAlign=isAr?'right':'left';
        tc.fillText((sm.role||'')+(sm.name?': '+sm.name:''),isAr?cardW-30:30,curY);
        curY+=22;
      }
    });
  }
  // Footer
  tc.fillStyle='rgba(255,255,255,0.3)'; tc.font='10px Cairo,Inter,sans-serif';
  tc.textAlign='center'; tc.textBaseline='bottom';
  tc.fillText('CoachBoard Pro \u2022 '+new Date().toLocaleDateString(isAr?'ar-MA':'en-US'),cardW/2,cardH-8);
  // Download
  tmpCv.toBlob(function(blob){
    var fileName=rosterName+'_'+(isAr?'قائمة':'roster')+'.png';
    if(window.showSaveFilePicker&&window.isSecureContext){
      window.showSaveFilePicker({suggestedName:fileName,types:[{description:'PNG Image',accept:{'image/png':['.png']}}]})
      .then(function(h){return h.createWritable();}).then(function(w){return w.write(blob).then(function(){return w.close();});}).catch(function(){});
    } else {
      var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=fileName;
      document.body.appendChild(a); a.click();
      setTimeout(function(){document.body.removeChild(a);},200);
    }
    if(typeof toast==='function') toast(isAr?'تم تصدير القائمة':'Roster exported');
  },'image/png');
}

// Re-render after teams.js loads (drawBenchPlayers is now the real implementation)
if(typeof render === 'function') render();
