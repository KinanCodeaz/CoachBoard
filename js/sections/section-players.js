'use strict';
// CoachBoard Pro - Section: Players
SEC.add({
  id: 'players',
  tools: ['p_stand', 'gk_stand', 'ball', 'playerLink', 'coach'],

  elName: function(type) {
    if (type === 'ball') return t('ball');
    if (type === 'gk_stand') return t('goalkeeper');
    if (type === 'coach') return t('coach');
    return t('player');
  },

  dc: function(type) {
    if (type === 'ball') return '#ffffff';
    if (type === 'gk_stand') return '#50c878';
    if (type === 'coach') return '#ffc107';
    return '#4a90d9';
  },

  bounds: function(el) {
    var s = el.size || 18;
    if (el.type === 'ball') return { x: el.x - s, y: el.y - s, w: s * 2, h: s * 2 };
    return { x: el.x - s, y: el.y - s, w: s * 2, h: s * 2 };
  },

  center: function(el) {
    return { x: el.x, y: el.y };
  },

  placeEl: function(type, x, y, el) {
    if (type === 'ball') { el.size = 10; return; }
    if (type === 'coach') {
      el.text = 'C';
      el.color = '#ffc107';
      el.size = 18;
      return;
    }
    el.text = String(nCnt++);
    el.playerName = '';
    el.nameColor = null;
    el.nameSize = null;
    el.displayStyle = lastElProps.player.displayStyle || 'circle';
    if (type === 'gk_stand') { 
      el.color = lastElProps.goalkeeper.color || (curTeam === 'A' ? '#50c878' : '#ff69b4'); 
      el.displayStyle = lastElProps.goalkeeper.displayStyle || 'circle';
    }
  },

  draw: function(el) {
    if (el.type === 'ball') {
      this._drawBall(el);
    } else if (el.type === 'coach') {
      this._drawCoach(el);
    } else {
      this._drawPlayer(el);
    }
  },

  _drawBall: function(el) {
    cx.save();
    cx.translate(el.x, el.y);
    var s = el.size || 10;
    var g = cx.createRadialGradient(-s * 0.3, -s * 0.3, s * 0.1, 0, 0, s);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(1, '#cccccc');
    cx.fillStyle = g;
    cx.beginPath();
    cx.arc(0, 0, s, 0, Math.PI * 2);
    cx.fill();
    cx.strokeStyle = 'rgba(0,0,0,0.15)';
    cx.lineWidth = 0.5;
    cx.stroke();
    cx.restore();
  },

  _drawCoach: function(el) {
    cx.save();
    cx.translate(el.x, el.y);
    var s = el.size || 18;
    cx.fillStyle = el.color || '#ffc107';
    cx.beginPath();
    cx.arc(0, 0, s * 0.5, 0, Math.PI * 2);
    cx.fill();
    cx.strokeStyle = 'rgba(0,0,0,0.2)';
    cx.lineWidth = 1.5;
    cx.stroke();
    var txt = el.text || 'C';
    if (txt) {
      cx.fillStyle = '#fff';
      cx.font = 'bold ' + Math.max(9, s * 0.4) + 'px Inter,Cairo';
      cx.textAlign = 'center';
      cx.textBaseline = 'middle';
      cx.fillText(txt, 0, 0);
    }
    cx.restore();
  },

  _drawPlayer: function(el) {
    cx.save();
    cx.translate(el.x, el.y);
    cx.rotate((el.rotation || 0) * Math.PI / 180);
    if (el.flipH) cx.scale(-1, 1);
    if (el.flipV) cx.scale(1, -1);
    var s = el.size || 18, cl = el.color || '#4a90d9', txt = el.text || '', op = el.opacity !== undefined ? el.opacity : 1;
    cx.globalAlpha = op; cx.lineCap = 'round'; cx.lineJoin = 'round';
    var ds = el.displayStyle || playerDisplayStyle || 'circle';
    // Draw photo if available
    var photoOk=false;
    if(el.playerPhoto){
      if(!window._photoCache) window._photoCache={};
      if(!window._photoCache[el.playerPhoto]){
        var img=new Image();
        img.crossOrigin='anonymous';
        img.onload=function(){window._photoCache[el.playerPhoto]=this;};
        img.src=el.playerPhoto;
      }
      if(window._photoCache[el.playerPhoto]){
        photoOk=true;
        cx.save();
        cx.beginPath(); cx.arc(0,0,s,0,Math.PI*2); cx.clip();
        try{cx.drawImage(window._photoCache[el.playerPhoto],-s,-s,s*2,s*2);}catch(e){photoOk=false;}
        cx.restore();
        cx.beginPath(); cx.arc(0,0,s,0,Math.PI*2);
        cx.strokeStyle='rgba(255,255,255,0.5)'; cx.lineWidth=2; cx.stroke();
        cx.fillStyle='#fff'; cx.font='bold '+Math.max(9,s*0.7)+'px Inter,Cairo';
        cx.textAlign='center'; cx.textBaseline='middle';
        cx.shadowColor='rgba(0,0,0,0.6)'; cx.shadowBlur=3;
        cx.fillText(txt||'',0,0); cx.shadowBlur=0;
      }
    }
    if(!photoOk){
      if (ds === 'jersey') {
        this._drawJersey(el, s, cl, txt);
      } else {
        var grd = cx.createRadialGradient(-s * 0.15, -s * 0.15, s * 0.1, 0, 0, s);
        grd.addColorStop(0, lightColor(cl, 40));
        grd.addColorStop(1, cl);
        cx.fillStyle = grd;
        cx.beginPath(); cx.arc(0, 0, s, 0, Math.PI * 2); cx.fill();
        cx.strokeStyle = 'rgba(255,255,255,0.5)'; cx.lineWidth = 2; cx.stroke();
        cx.fillStyle = '#fff'; cx.font = 'bold ' + Math.max(9, s * 0.7) + 'px Inter,Cairo';
        cx.textAlign = 'center'; cx.textBaseline = 'middle';
        cx.shadowColor = 'rgba(0,0,0,0.6)'; cx.shadowBlur = 3;
        cx.fillText(txt || '', 0, 0); cx.shadowBlur = 0;
      }
    }
    if (showPlayerNames) {
      if(el.playerNickname){
        cx.fillStyle = 'rgba(255,255,255,0.5)';
        cx.font = 'bold ' + Math.max(6, s * 0.3) + 'px Cairo,Inter';
        cx.textAlign = 'center'; cx.textBaseline = 'bottom';
        cx.shadowColor = 'rgba(0,0,0,0.4)'; cx.shadowBlur = 2;
        cx.fillText(el.playerNickname, 0, -s * 1.1);
        cx.shadowBlur = 0;
      }
      if (el.playerName) {
        var nc = el.nameColor || (theme === 'dark' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)');
        var ns = el.nameSize || Math.max(7, s * 0.42);
        cx.fillStyle = nc;
        cx.font = 'bold ' + ns + 'px Cairo,Inter';
        cx.textAlign = 'center'; cx.textBaseline = 'top';
        cx.shadowColor = 'rgba(0,0,0,0.4)'; cx.shadowBlur = 2;
        cx.fillText(el.playerName, 0, s * 1.55);
        cx.shadowBlur = 0;
      }
    }
    cx.globalAlpha = 1;
    cx.restore();
  },

  _drawJersey: function(el, s, cl, txt) {
    var cl2 = el.jerseyColor2 || lightColor(cl, -40);
    cx.fillStyle = cl;
    cx.beginPath();
    cx.moveTo(-s * 0.5, -s * 0.8);
    cx.lineTo(-s * 0.8, -s * 0.5);
    cx.lineTo(-s * 0.8, -s * 0.1);
    cx.lineTo(-s * 0.5, -s * 0.1);
    cx.lineTo(-s * 0.5, s * 0.6);
    cx.lineTo(s * 0.5, s * 0.6);
    cx.lineTo(s * 0.5, -s * 0.1);
    cx.lineTo(s * 0.8, -s * 0.1);
    cx.lineTo(s * 0.8, -s * 0.5);
    cx.lineTo(s * 0.5, -s * 0.8);
    cx.closePath();
    cx.fill();
    cx.strokeStyle = 'rgba(255,255,255,0.3)';
    cx.lineWidth = 1;
    cx.stroke();
    cx.save();
    cx.clip();
    cx.fillStyle = cl2;
    var stripeW = s * 0.25;
    for (var si = -4; si < 5; si++) {
      if (si % 2 === 0) cx.fillRect(-s + si * stripeW, -s, stripeW, s * 2);
    }
    cx.restore();
    cx.fillStyle = 'rgba(255,255,255,0.25)';
    cx.beginPath();
    cx.arc(0, -s * 0.8, s * 0.2, 0, Math.PI);
    cx.fill();
    cx.fillStyle = cl;
    cx.beginPath();
    cx.arc(0, -s * 1.0, s * 0.25, 0, Math.PI * 2);
    cx.fill();
    cx.strokeStyle = 'rgba(255,255,255,0.3)';
    cx.lineWidth = 1;
    cx.stroke();
    cx.fillStyle = '#fff';
    cx.font = 'bold ' + Math.max(8, s * 0.55) + 'px Inter,Cairo';
    cx.textAlign = 'center';
    cx.textBaseline = 'middle';
    cx.shadowColor = 'rgba(0,0,0,0.6)';
    cx.shadowBlur = 3;
    cx.fillText(txt || '', 0, s * 0.1);
    cx.shadowBlur = 0;
  }
});
