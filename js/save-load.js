'use strict';
// CoachBoard Pro - Project Save & Load
function saveProject() { document.getElementById('saveModal').classList.add('show'); document.getElementById('projectNameInput').focus(); }
function closeSaveModal() { document.getElementById('saveModal').classList.remove('show'); }
function doSaveProject() {
  var nm = document.getElementById('projectNameInput').value.trim() || 'Untitled';
  var data = {
    els: els, nCnt: nCnt, grpCnt: grpCnt, steps: steps, sport: sport,
    pitchColors: pitchColors, customPitchColor: customPitchColor,
    notes: document.getElementById('notesArea').value,
    playerDisplayStyle: playerDisplayStyle, pitch3d: pitch3d,
    pitchRotX: pitchRotX, pitchRotY: pitchRotY, fieldStyle: fieldStyle,
    teamNames: teamNames, teamScores: teamScores,
    teamFormations: teamFormations, teamFormationProps: teamFormationProps,
    coachInfo: coachInfo, teamLogos: teamLogos, teamLogoOpacity: teamLogoOpacity,
    favoriteColors: favoriteColors, playerLinks: playerLinks,
    teamRosters: teamRosters, teamRosterAssignment: teamRosterAssignment,
    showPlayerNames: showPlayerNames
  };
  try {
    var projects = JSON.parse(localStorage.getItem('cb_projects') || '{}');
    projects[nm] = { data: JSON.stringify(data), date: new Date().toISOString() };
    try { localStorage.setItem('cb_projects', JSON.stringify(projects)); } catch (e) { toast(lang === 'ar' ? 'فشل الحفظ' : 'Save failed'); return; }
    toast(t('saved')); closeSaveModal();
  } catch (e) { }
}
function loadProject() {
  var ml = document.getElementById('loadModal'), list = document.getElementById('savedList');
  var projects = {}; try { projects = JSON.parse(localStorage.getItem('cb_projects') || '{}'); } catch (e) { }
  var h = '', keys = Object.keys(projects);
  if (!keys.length) h = '<p style="text-align:center;color:var(--text3);padding:12px">' + t('no_project') + '</p>';
  keys.forEach(function (k) {
    var safeName = esc(k);
    h += '<div class="saved-item" data-project="' + safeName + '"><span class="saved-name">' + safeName + '</span><span class="saved-date">' + new Date(projects[k].date).toLocaleDateString() + '</span><span class="saved-del"><i class="fas fa-trash"></i></span></div>';
  });
  list.innerHTML = h;
  list.onclick = function (e) {
    var item = e.target.closest('.saved-item'); var del = e.target.closest('.saved-del');
    if (!item) return; var name = item.dataset.project;
    if (del) { delProject(name); return; } doLoadProject(name);
  };
  ml.classList.add('show');
}
function closeLoadModal() { document.getElementById('loadModal').classList.remove('show'); }
function delProject(name) { try { var projects = JSON.parse(localStorage.getItem('cb_projects') || '{}'); delete projects[name]; localStorage.setItem('cb_projects', JSON.stringify(projects)); loadProject(); toast(t('project_deleted')); } catch (e) { } }
function doLoadProject(name) {
  try {
    var projects = JSON.parse(localStorage.getItem('cb_projects') || '{}');
    if (!projects[name]) return;
    var d = JSON.parse(projects[name].data);
    els = d.els || []; nCnt = d.nCnt || 1; grpCnt = d.grpCnt || 1; steps = d.steps || []; sport = d.sport || 'futsal';
    if (d.playerDisplayStyle) playerDisplayStyle = d.playerDisplayStyle;
    if (d.fieldStyle) fieldStyle = d.fieldStyle;
    if (d.pitch3d !== undefined) pitch3d = d.pitch3d; else if (d.pitchVertical !== undefined) pitch3d = d.pitchVertical;
    document.getElementById('cc').classList.toggle('pitch-3d', pitch3d);
    if (pitch3d) { pitchRotX = 35; pitchRotY = 0; } else { pitchRotX = 0; pitchRotY = 0; }
    if (typeof applyZoom === 'function') applyZoom();
    if (d.customPitchColor) customPitchColor = d.customPitchColor;
    if (d.teamNames) teamNames = d.teamNames;
    if (d.teamScores) teamScores = d.teamScores;
    if (d.teamFormations) teamFormations = d.teamFormations;
    if (d.teamFormationProps) teamFormationProps = d.teamFormationProps;
    if (d.coachInfo) coachInfo = d.coachInfo;
    if (d.teamLogos) teamLogos = d.teamLogos;
    if (d.teamLogoOpacity) teamLogoOpacity = d.teamLogoOpacity;
    if (d.favoriteColors) favoriteColors = d.favoriteColors;
    if (d.playerLinks) playerLinks = d.playerLinks;
    if (d.teamRosters) { teamRosters = d.teamRosters; if (typeof saveTeamRosters === 'function') saveTeamRosters(); }
    if (d.teamRosterAssignment) { teamRosterAssignment = d.teamRosterAssignment; if (typeof saveTeamRosters === 'function') saveTeamRosters(); }
    if (d.showPlayerNames !== undefined) { showPlayerNames = d.showPlayerNames; if (typeof saveTeamRosters === 'function') saveTeamRosters(); }
    if (d.notes) document.getElementById('notesArea').value = d.notes;
    selIds.clear(); hist = []; hI = -1; saveH();
    if (typeof renderSteps === 'function') renderSteps();
    if (typeof applySportUI === 'function') applySportUI();
    if (typeof applyPitchUI === 'function') applyPitchUI();
    if (typeof syncTeamInfoUI === 'function') syncTeamInfoUI();
    if (typeof renderFormationsPanel === 'function') renderFormationsPanel();
    if (typeof updateProps === 'function') updateProps();
    if (typeof updateLayers === 'function') updateLayers();
    if (typeof render === 'function') render();
    closeLoadModal(); toast(t('loaded'));
  } catch (e) { }
}
function autoSave() {
  try {
    localStorage.setItem('cb_autosave', JSON.stringify({
      els: els, nCnt: nCnt, grpCnt: grpCnt, steps: steps, sport: sport,
      playerDisplayStyle: playerDisplayStyle, fieldStyle: fieldStyle, lastElProps: lastElProps
    }));
  } catch (e) { }
}
function loadAutoSave() {
  try {
    var d = JSON.parse(localStorage.getItem('cb_autosave'));
    if (d && d.els && d.els.length) {
      els = d.els; nCnt = d.nCnt || 1; grpCnt = d.grpCnt || 1; steps = d.steps || [];
      sport = d.sport || 'futsal';
      if (d.playerDisplayStyle) playerDisplayStyle = d.playerDisplayStyle;
      if (d.fieldStyle) fieldStyle = d.fieldStyle;
      if (d.lastElProps) { for (var k in d.lastElProps) { if (lastElProps[k]) for (var p in d.lastElProps[k]) { lastElProps[k][p] = d.lastElProps[k][p]; } } }
      if (typeof applySportUI === 'function') applySportUI();
      if (typeof applyPitchUI === 'function') applyPitchUI();
    }
  } catch (e) { }
}
