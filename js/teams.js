/**
 * teams.js - Team Management Module for CoachBoard Pro
 * Handles: rosters, player names/numbers, coach name, sport-aware placement,
 *          bench drawing, and roster card export.
 */

function _escHtml(s){if(!s)return'';return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}

// ============ SPORT FIELD SIZE RULES ============
// Number of players that go ON the field (including goalkeeper) per sport
var sportFieldSize = {
  football: 11, futsal: 5, beach: 5,
  basketball: 5, volleyball: 6, handball: 7, mini: 5
};

function getFieldSizeForSport(sp) {
  return sportFieldSize[sp] || 11;
}

// ============ TEAM MANAGER ============
function openTeamManager(){
  document.getElementById('teamMgrModal').classList.add('show');
  renderRosterList(); updateAssignButtons(); updateFormationSelect();
}
function closeTeamManager(){
  document.getElementById('teamMgrModal').classList.remove('show');
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
    h+='<div class="roster-item'+(activeRoster===k?' active':'')+'" onclick="selectRoster(this.dataset.name)" data-name="'+_escHtml(k)+'">';
    h+='<span class="roster-name">'+_escHtml(k)+assigned+'</span>';
    if(coach) h+='<span class="roster-coach-badge"><i class="fas fa-user-tie"></i> '+_escHtml(coach)+'</span>';
    h+='<span class="roster-cnt">'+cnt+'</span>';
    h+='<span class="roster-del" onclick="event.stopPropagation();deleteRoster(this.closest(\'[data-name]\').dataset.name)" title="'+t('delete')+'"><i class="fas fa-trash"></i></span>';
    h+='</div>';
  });
  list.innerHTML=h;
}

function selectRoster(name){ activeRoster=name; renderRosterList(); renderRosterEditor(name); }

function createNewRoster(){
  var name=prompt(t('enter_team_name'),(lang==='ar'?'\u0641\u0631\u064a\u0642':'Team')+' '+(Object.keys(teamRosters).length+1));
  if(!name||!name.trim()) return;
  name=name.trim();
  if(teamRosters[name]){ toast(lang==='ar'?'\u0627\u0644\u0627\u0633\u0645 \u0645\u0648\u062c\u0648\u062f':'Name exists'); return; }
  teamRosters[name]={name:name, coachName:'', players:[], created:new Date().toISOString()};
  saveTeamRosters(); activeRoster=name; renderRosterList(); renderRosterEditor(name);
}

function deleteRoster(name){
  if(!confirm((lang==='ar'?'\u062d\u0630\u0641':'Delete')+' "'+name+'"?')) return;
  delete teamRosters[name];
  if(teamRosterAssignment.A===name) teamRosterAssignment.A=null;
  if(teamRosterAssignment.B===name) teamRosterAssignment.B=null;
  if(activeRoster===name){
    activeRoster=null;
    var ed=document.getElementById('rosterEditor');
    if(ed) ed.innerHTML='<div class="roster-empty" id="rosterEmpty"><i class="fas fa-users" style="font-size:32px;opacity:0.2;margin-bottom:8px"></i><p>'+t('select_roster')+'</p></div>';
  }
  saveTeamRosters(); renderRosterList();
}

// ============ ROSTER EDITOR (enhanced) ============
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
  h+='<input class="roster-name-input" value="'+_escHtml(name)+'" onchange="renameRoster(this.value)" title="'+t('team_roster')+'">';

  // Coach name field
  h+='<div class="roster-coach-section">';
  h+='<label><i class="fas fa-user-tie"></i> '+(lang==='ar'?'\u0627\u0633\u0645 \u0627\u0644\u0645\u062f\u0631\u0628':'Coach name')+':</label>';
  h+='<input type="text" class="rp-coach-name" value="'+_escHtml(roster.coachName||'')+'" placeholder="'+(lang==='ar'?'\u0627\u0633\u0645 \u0627\u0644\u0645\u062f\u0631\u0628':'Enter coach name')+'" oninput="updateCoachName(this.value)">';
  h+='</div>';

  // Team logo upload
  h+='<div class="roster-logo-section">';
  h+='<label><i class="fas fa-shield-alt"></i> '+(lang==='ar'?'\u0634\u0639\u0627\u0631 \u0627\u0644\u0641\u0631\u064a\u0642':'Team logo')+':</label>';
  h+='<div class="roster-logo-area">';
  if(roster.logo){
    h+='<img class="roster-logo-preview" src="'+_escHtml(roster.logo)+'">';
    h+='<span class="roster-logo-del" onclick="removeRosterLogo()" title="'+t('delete')+'"><i class="fas fa-times"></i></span>';
  }
  h+='<input type="file" accept="image/*" onchange="loadRosterLogo(this)" class="roster-logo-input">';
  h+='</div></div>';

  // Sport info + player count
  h+='<div class="roster-sport-info">';
  h+='<span class="sport-badge"><i class="fas fa-futbol"></i> '+sport+' ('+fieldSz+' '+(lang==='ar'?'\u0644\u0627\u0639\u0628':'players')+')</span>';
  h+='<div class="roster-player-count">';
  h+='<label>'+t('num_players')+':</label>';
  h+='<input type="range" min="1" max="30" value="'+(roster.players.length||fieldSz)+'" oninput="updateRosterCount(+this.value);this.nextElementSibling.textContent=this.value">';
  h+='<span>'+(roster.players.length||fieldSz)+'</span>';
  h+='</div></div>';

  // Show names toggle + export button
  h+='<div class="roster-actions-row">';
  h+='<label class="roster-toggle-names"><input type="checkbox" '+(showPlayerNames?'checked':'')+' onchange="showPlayerNames=this.checked;saveTeamRosters();Engine.reqRender()" style="width:12px;height:12px;accent-color:var(--accent)"> '+t('show_names')+'</label>';
  h+='<button class="hbtn roster-export-btn" onclick="exportRosterCard(this.closest(\'[data-name]\').dataset.name)" data-name="'+_escHtml(name)+'"><i class="fas fa-file-image"></i> '+(lang==='ar'?'\u062a\u0635\u062f\u064a\u0631 \u0627\u0644\u0642\u0627\u0626\u0645\u0629':'Export Roster')+'</button>';
  h+='</div>';

  // Player list header
  h+='<div class="roster-list-header">';
  h+='<span class="rh-idx">#</span>';
  h+='<span class="rh-num">'+(lang==='ar'?'\u0627\u0644\u0631\u0642\u0645':'Num')+'</span>';
  h+='<span class="rh-name">'+(lang==='ar'?'\u0627\u0633\u0645 \u0627\u0644\u0644\u0627\u0639\u0628':'Player Name')+'</span>';
  h+='<span class="rh-act"></span>';
  h+='</div>';

  // Player rows
  roster.players.forEach(function(pl,i){
    var isField = i < fieldSz;
    var statusClass = pl.bench ? 'bench' : (isField ? 'field' : 'reserve');
    var statusText = pl.bench ? t('bench') : (isField ? (lang==='ar'?'\u0623\u0633\u0627\u0633\u064a':'Field') : (lang==='ar'?'\u0627\u062d\u062a\u064a\u0627\u0637':'Reserve'));
    var isGK = (i===0);
    h+='<div class="roster-player-row'+(pl.bench?' rp-bench-row':'')+(isGK&&!pl.bench?' rp-gk-row':'')+'">';
    h+='<span class="rp-idx">'+(i+1)+'</span>';
    h+='<input type="number" class="rp-num" value="'+(pl.num!==undefined?pl.num:(i+1))+'" min="0" max="99" onchange="updateRosterPlayer('+i+',\'num\',+this.value)">';
    h+='<input type="text" class="rp-name" value="'+_escHtml(pl.name||'')+'" placeholder="'+t('player_name_ph')+'" oninput="updateRosterPlayer('+i+',\'name\',this.value)">';
    h+='<span class="rp-status-badge rp-status-'+statusClass+'">'+(isGK&&!pl.bench?'GK ':'')+statusText+'</span>';
    h+='<label class="rp-bench-chk"><input type="checkbox" '+(pl.bench?'checked':'')+' onchange="updateRosterPlayer('+i+',\'bench\',this.checked);renderRosterEditor(this.closest(\'[data-name]\').dataset.name)" data-name="'+_escHtml(name)+'"></label>';
    h+='<span class="rp-del" onclick="removeRosterPlayer('+i+')" title="'+t('delete')+'"><i class="fas fa-times"></i></span>';
    h+='</div>';
  });

  ed.innerHTML=h;
}

function updateCoachName(val){
  if(!activeRoster||!teamRosters[activeRoster]) return;
  teamRosters[activeRoster].coachName=val;
  saveTeamRosters();
  renderRosterList();
}

function loadRosterLogo(input){
  if(!input.files||!input.files[0]||!activeRoster||!teamRosters[activeRoster]) return;
  var file=input.files[0], reader=new FileReader();
  reader.onload=function(e){
    teamRosters[activeRoster].logo=e.target.result;
    saveTeamRosters(); renderRosterEditor(activeRoster);
  };
  reader.readAsDataURL(file);
}

function removeRosterLogo(){
  if(!activeRoster||!teamRosters[activeRoster]) return;
  delete teamRosters[activeRoster].logo;
  saveTeamRosters(); renderRosterEditor(activeRoster);
}

function renameRoster(newName){
  newName=newName.trim(); if(!newName||!activeRoster) return;
  if(newName===activeRoster) return;
  if(teamRosters[newName]){ toast(lang==='ar'?'\u0627\u0644\u0627\u0633\u0645 \u0645\u0648\u062c\u0648\u062f':'Name exists'); return; }
  teamRosters[newName]=teamRosters[activeRoster];
  teamRosters[newName].name=newName;
  if(teamRosterAssignment.A===activeRoster) teamRosterAssignment.A=newName;
  if(teamRosterAssignment.B===activeRoster) teamRosterAssignment.B=newName;
  delete teamRosters[activeRoster]; activeRoster=newName;
  saveTeamRosters(); renderRosterList();
}

function updateRosterCount(count){
  if(!activeRoster||!teamRosters[activeRoster]) return;
  var roster=teamRosters[activeRoster];
  while(roster.players.length<count){
    var idx=roster.players.length;
    roster.players.push({num:idx+1, name:'', bench:false});
  }
  while(roster.players.length>count) roster.players.pop();
  // Auto-mark bench based on sport field size
  var fieldSz=getFieldSizeForSport(sport);
  for(var i=0;i<roster.players.length;i++){
    if(i<fieldSz) roster.players[i].bench=false;
    else roster.players[i].bench=true;
  }
  saveTeamRosters(); renderRosterEditor(activeRoster);
}

function updateRosterPlayer(idx,prop,val){
  if(!activeRoster||!teamRosters[activeRoster]) return;
  if(!teamRosters[activeRoster].players[idx]) return;
  teamRosters[activeRoster].players[idx][prop]=val;
  saveTeamRosters();
}

function removeRosterPlayer(idx){
  if(!activeRoster||!teamRosters[activeRoster]) return;
  teamRosters[activeRoster].players.splice(idx,1);
  // Re-number
  for(var i=0;i<teamRosters[activeRoster].players.length;i++){
    teamRosters[activeRoster].players[i].num=i+1;
  }
  saveTeamRosters(); renderRosterEditor(activeRoster); renderRosterList();
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
  var roster=teamRosters[activeRoster];
  var fieldSz=getFieldSizeForSport(sport);
  // Auto-assign bench: first fieldSz players = field, rest = bench
  for(var i=0;i<roster.players.length;i++){
    if(i<fieldSz) roster.players[i].bench=false;
    else roster.players[i].bench=true;
  }
  saveTeamRosters();
  // Read selected formation
  var fmtSel=document.getElementById('rosterFmtSelect');
  var defs=formationDefs[sport]||[];
  var selectedFmt=(fmtSel&&fmtSel.value)?fmtSel.value:(defs.length>0?defs[0][0]:null);
  closeTeamManager();
  if(selectedFmt) placeFormation(sport,selectedFmt);
  else Engine.reqRender();
  // Auto-enable showPlayerNames
  if(!showPlayerNames){showPlayerNames=true;saveTeamRosters();}
  toast(t('roster_placed')+' ('+fieldSz+' '+
    (lang==='ar'?'\u0644\u0627\u0639\u0628 \u0641\u064a \u0627\u0644\u0645\u0644\u0639\u0628':'players on field')+')');
}

// Update formation dropdown when team manager opens
function updateFormationSelect(){
  var sel=document.getElementById('rosterFmtSelect'); if(!sel) return;
  var defs=formationDefs[sport]||[];
  var h='';
  defs.forEach(function(d){
    h+='<option value="'+d[0]+'">'+d[1]+'</option>';
  });
  if(!defs.length) h='<option value="">'+(lang==='ar'?'\u0628\u062f\u0648\u0646 \u062a\u0634\u0643\u064a\u0644\u0629':'No formation')+'</option>';
  sel.innerHTML=h;
}

// ============ BENCH PLAYERS + COACH DRAWING ============
function drawBenchPlayers(){
  ['A','B'].forEach(function(team){
    var assignedRoster=teamRosterAssignment[team];
    if(!assignedRoster||!teamRosters[assignedRoster]) return;
    var roster=teamRosters[assignedRoster];
    var benchPlayers=roster.players.filter(function(pl){return pl.bench;});
    var coachName=roster.coachName||'';
    var p=pRect(); if(!p||p.w<50) return;
    var teamColor=team==='A'?'#4a90d9':'#e84040';
    var benchSize=10, gap=benchSize*2.8;

    // Helper to draw a single bench player
    function drawBench(bx,by,pl){
      cx.save(); cx.globalAlpha=0.9;
      cx.fillStyle=teamColor; cx.beginPath(); cx.arc(bx,by,benchSize,0,Math.PI*2); cx.fill();
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
      cx.fillText(t('bench'),bx,by-benchSize-2);
      cx.restore();
    }

    // Helper to draw coach with special marker
    function drawCoach(cx2,cy2){
      cx.save(); cx.globalAlpha=0.95;
      // Gold circle
      cx.fillStyle='#ffc107'; cx.beginPath(); cx.arc(cx2,cy2,benchSize*1.2,0,Math.PI*2); cx.fill();
      cx.strokeStyle='rgba(255,255,255,0.7)'; cx.lineWidth=2; cx.stroke();
      // Suit/tie icon
      cx.fillStyle='#1a1f2e'; cx.font='bold '+Math.max(8,benchSize*0.8)+'px Inter,Cairo';
      cx.textAlign='center'; cx.textBaseline='middle';
      cx.fillText('\u{1F454}',cx2,cy2);
      // Coach label
      var label=coachName||t('coach')||'Coach';
      cx.fillStyle='#ffc107'; cx.font='bold '+Math.max(7,benchSize*0.55)+'px Cairo,Inter';
      cx.textAlign='center'; cx.textBaseline='top';
      cx.shadowColor='rgba(0,0,0,0.5)'; cx.shadowBlur=3;
      cx.fillText(label,cx2,cy2+benchSize*1.3+3);
      cx.shadowBlur=0;
      // COACH badge above
      cx.fillStyle='rgba(255,193,7,0.4)'; cx.font='bold 7px Cairo,Inter'; cx.textBaseline='bottom';
      cx.fillText(lang==='ar'?'\u0645\u062F\u0631\u0628':'COACH',cx2,cy2-benchSize*1.2-3);
      cx.restore();
    }

    if(!pitchVertical){
      // Horizontal pitch: bench above/below
      var totalBench=benchPlayers.length;
      var hasCoach=!!coachName;
      var totalItems=totalBench+(hasCoach?1:0);
      var totalW2=totalItems*gap;
      var startX=p.x+p.w/2-totalW2/2+gap/2;
      var startY=team==='A'?p.y-benchSize*2.5:p.y+p.h+benchSize*2.5;
      if(startY<benchSize*2) startY=benchSize*2;
      if(startY>H-benchSize*2) startY=H-benchSize*2;
      // Draw coach first (on the left side of bench)
      var offset=0;
      if(hasCoach){ drawCoach(startX+offset*gap,startY); offset++; }
      benchPlayers.forEach(function(pl,i){
        drawBench(startX+(offset+i)*gap,startY,pl);
      });
    } else {
      // Vertical pitch: bench on sides
      var totalBench=benchPlayers.length;
      var hasCoach=!!coachName;
      var totalItems=totalBench+(hasCoach?1:0);
      var totalH2=totalItems*gap;
      var startY2=p.y+p.h/2-totalH2/2+gap/2;
      var startX2=team==='A'?p.x-benchSize*3:p.x+p.w+benchSize*3;
      if(startX2<benchSize*2) startX2=benchSize*2;
      if(startX2>W-benchSize*2) startX2=W-benchSize*2;
      var offset=0;
      if(hasCoach){ drawCoach(startX2,startY2+offset*gap); offset++; }
      benchPlayers.forEach(function(pl,i){
        drawBench(startX2,startY2+(offset+i)*gap,pl);
      });
    }
  });
}

// ============ EXPORT ROSTER CARD ============
function exportRosterCard(rosterName){
  if(!rosterName||!teamRosters[rosterName]) return;
  var roster=teamRosters[rosterName];
  var coachName=roster.coachName||'';
  var isAr=lang==='ar';

  // Filter: only players with names filled in
  var namedPlayers=(roster.players||[]).filter(function(pl){return pl.name&&pl.name.trim();});

  // Load logo image then draw
  var logoImg=null;
  if(roster.logo){
    logoImg=new Image();
    logoImg.onload=function(){ drawRosterCard(rosterName,roster,namedPlayers,coachName,isAr,logoImg); };
    logoImg.src=roster.logo;
  } else {
    drawRosterCard(rosterName,roster,namedPlayers,coachName,isAr,null);
  }
}

function drawRosterCard(rosterName,roster,namedPlayers,coachName,isAr,logoImg){
  var cardW=700, headerH=120, rowH=38, footerH=40;
  var coachRowH=coachName?rowH:0;
  var cardH=headerH+coachRowH+rowH+namedPlayers.length*rowH+footerH+20;

  var tmpCv=document.createElement('canvas');
  tmpCv.width=cardW; tmpCv.height=cardH;
  var tc=tmpCv.getContext('2d');

  // Background
  tc.fillStyle='#1a1f2e'; tc.fillRect(0,0,cardW,cardH);

  // Header gradient
  var hGrad=tc.createLinearGradient(0,0,cardW,0);
  hGrad.addColorStop(0,'#0d6efd'); hGrad.addColorStop(1,'#0b5ed7');
  tc.fillStyle=hGrad; tc.fillRect(0,0,cardW,headerH);

  // Team logo
  var logoX=40, logoY=20, logoSz=80;
  if(logoImg&&logoImg.complete&&logoImg.naturalWidth>0){
    tc.save();
    tc.beginPath(); tc.arc(logoX+logoSz/2,logoY+logoSz/2,logoSz/2,0,Math.PI*2); tc.clip();
    tc.drawImage(logoImg,logoX,logoY,logoSz,logoSz);
    tc.restore();
  } else {
    tc.fillStyle='rgba(255,255,255,0.15)';
    tc.beginPath(); tc.arc(logoX+logoSz/2,logoY+logoSz/2,logoSz/2,0,Math.PI*2); tc.fill();
    tc.fillStyle='rgba(255,255,255,0.4)'; tc.font='32px "Font Awesome 5 Free"';
    tc.textAlign='center'; tc.textBaseline='middle';
    tc.fillText('\uf0c0',logoX+logoSz/2,logoY+logoSz/2);
  }

  // Team name
  tc.fillStyle='#fff'; tc.font='bold 28px Cairo,Inter,sans-serif';
  tc.textAlign=isAr?'right':'left'; tc.textBaseline='middle';
  var nameX=isAr?cardW-30:logoX+logoSz+20;
  tc.fillText(rosterName,nameX,45);

  // Sport & date
  tc.fillStyle='rgba(255,255,255,0.7)'; tc.font='14px Cairo,Inter,sans-serif';
  tc.fillText(sport.toUpperCase()+' | '+namedPlayers.length+' '+(isAr?'\u0644\u0627\u0639\u0628':'players'),nameX,75);
  tc.fillStyle='rgba(255,255,255,0.5)'; tc.font='12px Cairo,Inter,sans-serif';
  tc.fillText(new Date().toLocaleDateString(isAr?'ar-MA':'en-US'),nameX,98);

  // Coach row
  var curY=headerH+10;
  if(coachName){
    tc.fillStyle='#ffc107'; tc.fillRect(15,curY,cardW-30,coachRowH-2);
    tc.fillStyle='#1a1f2e'; tc.font='bold 14px Cairo,Inter,sans-serif';
    tc.textAlign=isAr?'right':'left'; tc.textBaseline='middle';
    tc.fillText(isAr?'\u{1F3C3} \u0627\u0644\u0645\u062f\u0631\u0628: '+coachName:'Coach: '+coachName+' \u{1F3C3}',
      isAr?cardW-30:30, curY+coachRowH/2);
    curY+=coachRowH;
  }

  // Column headers (no status)
  tc.fillStyle='rgba(255,255,255,0.08)'; tc.fillRect(15,curY,cardW-30,rowH-2);
  tc.fillStyle='rgba(255,255,255,0.6)'; tc.font='bold 12px Cairo,Inter,sans-serif';
  tc.textAlign='center'; tc.textBaseline='middle';
  var colIdx=isAr?cardW-60:60, colNum=isAr?cardW-150:150, colNm=isAr?cardW/2:cardW/2;
  tc.fillText(isAr?'\u0627\u0644\u062a\u0631\u062a\u064a\u0628':'#',colIdx,curY+rowH/2);
  tc.fillText(isAr?'\u0627\u0644\u0631\u0642\u0645':'Num',colNum,curY+rowH/2);
  tc.fillText(isAr?'\u0627\u0644\u0627\u0633\u0645':'Name',colNm,curY+rowH/2);
  curY+=rowH;

  // Player rows (only named players, no status)
  var displayIdx=0;
  namedPlayers.forEach(function(pl){
    displayIdx++;
    var isGK=(displayIdx===1);
    if(displayIdx%2===0){tc.fillStyle='rgba(255,255,255,0.03)';tc.fillRect(15,curY,cardW-30,rowH-2);}

    // Index
    tc.fillStyle='rgba(255,255,255,0.4)'; tc.font='bold 13px Cairo,Inter,sans-serif';
    tc.textAlign='center'; tc.textBaseline='middle';
    tc.fillText(String(displayIdx),colIdx,curY+rowH/2);

    // Number badge
    var numBg=isGK?'#ffc107':'#0d6efd';
    tc.fillStyle=numBg;
    tc.beginPath(); tc.arc(colNum,curY+rowH/2,14,0,Math.PI*2); tc.fill();
    tc.fillStyle='#fff'; tc.font='bold 12px Cairo,Inter,sans-serif';
    tc.fillText(String(pl.num||displayIdx),colNum,curY+rowH/2);

    // Name
    tc.fillStyle='#fff'; tc.font='15px Cairo,Inter,sans-serif';
    tc.textAlign=isAr?'right':'left';
    var namePosX=isAr?colNm+80:colNm-80;
    tc.fillText(pl.name,namePosX,curY+rowH/2);

    curY+=rowH;
  });

  // Footer
  tc.fillStyle='rgba(255,255,255,0.3)'; tc.font='10px Cairo,Inter,sans-serif';
  tc.textAlign='center'; tc.textBaseline='bottom';
  tc.fillText('CoachBoard Pro \u2022 '+new Date().toLocaleDateString(isAr?'ar-MA':'en-US'),cardW/2,cardH-8);

  // Download
  tmpCv.toBlob(function(blob){
    var fileName=rosterName+'_'+(isAr?'\u0642\u0627\u0626\u0645\u0629':'roster')+'.png';
    if(window.showSaveFilePicker&&window.isSecureContext){
      window.showSaveFilePicker({
        suggestedName:fileName,
        types:[{description:'PNG Image',accept:{'image/png':['.png']}}]
      }).then(function(handle){return handle.createWritable();})
      .then(function(w){return w.write(blob).then(function(){return w.close();});})
      .catch(function(){});
    } else {
      var a=document.createElement('a');
      a.href=URL.createObjectURL(blob); a.download=fileName;
      document.body.appendChild(a); a.click();
      setTimeout(function(){document.body.removeChild(a);},200);
    }
    if(typeof toast==='function') toast(isAr?'\u062a\u0645 \u062a\u0635\u062f\u064a\u0631 \u0627\u0644\u0642\u0627\u0626\u0645\u0629':'Roster exported');
  },'image/png');
}

// Re-render after teams.js loads (drawBenchPlayers is now the real implementation)
if(typeof render === 'function') Engine.reqRender();
