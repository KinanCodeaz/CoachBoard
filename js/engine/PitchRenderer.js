'use strict';
// CoachBoard Pitch Renderer
// Extracted from script.js — all pitch drawing logic lives here.
// These functions read globals: cx, W, H, sport, theme, pitchOrientation,
// fieldStyle, courtImgs, customPitchColor, pitchColors, gridSnap, gridSize.
var PitchRenderer = {
  draw: function() { drawPitch(); },
  drawOverlay: function() { drawPitchAnimOverlay(); },
  drawGrid: function() { drawGrid(); }
};
function trapPath(tr){
  cx.beginPath();cx.moveTo(tr.topLeft.x,tr.topLeft.y);
  cx.lineTo(tr.topRight.x,tr.topRight.y);
  cx.lineTo(tr.bottomRight.x,tr.bottomRight.y);
  cx.lineTo(tr.bottomLeft.x,tr.bottomLeft.y);cx.closePath();
}
function trapRect(x,y,w,h){
  cx.beginPath();cx.rect(x,y,w,h);cx.closePath();
}
function drawTrapOrRect(tr,x,y,w,h){
  if(tr)trapPath(tr);else trapRect(x,y,w,h);
}

function drawPitch(){var p=pRect();var sx=p.x,sy=p.y,sw=p.w,sh=p.h;var ci=courtImgs[sport];var tr=pTrapezoid();
  if(fieldStyle==='svg'){
    if(tr){drawPitchGenPerspective(tr);}
    else{drawSVGField(sx,sy,sw,sh);}
  }else{
    if(ci&&ci.complete&&ci.naturalWidth>0){
      if(tr){
        trapPath(tr);cx.save();cx.clip();
        var m=[0,0,0,0,0,0];
        m[0]=(tr.topRight.x-tr.topLeft.x)/sw;m[1]=(tr.bottomLeft.x-tr.topLeft.x)/sh;
        m[2]=(tr.bottomRight.x-tr.topRight.x-tr.bottomLeft.x+tr.topLeft.x)/(sw*sh);m[3]=tr.topLeft.x;
        m[4]=(tr.topRight.y-tr.topLeft.y)/sw;m[5]=(tr.bottomLeft.y-tr.topLeft.y)/sh;
        m[6]=(tr.bottomRight.y-tr.topRight.y-tr.bottomLeft.y+tr.topLeft.y)/(sw*sh);m[7]=tr.topLeft.y;
        cx.setTransform(m[0],m[4],m[1],m[5],m[3],m[7]);cx.transform(1,0,m[2]/m[0],1,0,0);
        try{cx.drawImage(ci,0,0,ci.naturalWidth,ci.naturalHeight,sx,sy,sw,sh);}catch(e){}
        cx.restore();
        cx.strokeStyle='rgba(255,255,255,0.3)';cx.lineWidth=2;cx.setLineDash([]);trapPath(tr);cx.stroke();
        drawGlsPerspective(tr,'both');
      }else{
        cx.fillStyle=theme==='dark'?'#0a0e14':'#1a3a2a';cx.fillRect(sx-2,sy-2,sw+4,sh+4);
        try{cx.drawImage(ci,0,0,ci.naturalWidth,ci.naturalHeight,sx,sy,sw,sh);}catch(e){drawPitchGen(sx,sy,sw,sh);}
        cx.strokeStyle='rgba(255,255,255,0.3)';cx.lineWidth=2;cx.setLineDash([]);cx.strokeRect(sx,sy,sw,sh);
      }
    }else{
      if(tr)drawPitchGenPerspective(tr);else drawPitchGen(sx,sy,sw,sh);
    }
  }drawTeamLogos(sx,sy,sw,sh);}
function drawPitchGen(sx,sy,sw,sh){var isB=sport==='beach',isBk=sport==='basketball',isVb=sport==='volleyball',isHb=sport==='handball',pc=getPitchColor();
  if(isB){cx.fillStyle=pc;cx.fillRect(sx,sy,sw,sh);}
  else if(isBk){cx.fillStyle='#c06828';cx.fillRect(sx,sy,sw,sh);cx.fillStyle='#b05818';cx.fillRect(sx+sw*0.05,sy+sh*0.05,sw*0.9,sh*0.9);}
  else if(isVb){cx.fillStyle=pc;cx.fillRect(sx,sy,sw,sh);cx.fillStyle=lightColor(pc,20);cx.fillRect(sx,sy,sw/2,sh);}
  else if(isHb){var n=10,sw2=sw/n;for(var i=0;i<n;i++){cx.fillStyle=lightColor(pc,i%2===0?0:10);cx.fillRect(sx+i*sw2,sy,sw2+1,sh);}}
  else{var n=sport==='football'?16:10,sw2=sw/n;for(var i=0;i<n;i++){cx.fillStyle=lightColor(pc,i%2===0?0:12);cx.fillRect(sx+i*sw2,sy,sw2+1,sh);}}
  cx.strokeStyle=isB?'rgba(255,255,255,0.6)':isBk?'rgba(255,255,255,0.85)':'rgba(255,255,255,0.8)';cx.lineWidth=1.6;cx.setLineDash([]);cx.strokeRect(sx,sy,sw,sh);
  cx.beginPath();cx.moveTo(sx+sw/2,sy);cx.lineTo(sx+sw/2,sy+sh);cx.stroke();
  var ccr=sh*(isBk?0.12:isVb?0.15:isHb?0.15:sport==='futsal'?0.3:sport==='football'?0.134:0.222);cx.beginPath();cx.arc(sx+sw/2,sy+sh/2,ccr,0,Math.PI*2);cx.stroke();cx.fillStyle=cx.strokeStyle;cx.beginPath();cx.arc(sx+sw/2,sy+sh/2,3,0,Math.PI*2);cx.fill();
  if(isBk){
    cx.strokeStyle='rgba(255,255,255,0.75)';cx.lineWidth=1.5;cx.setLineDash([]);
    var laneW=sw*0.19,laneH=sh*0.42;
    cx.strokeRect(sx,sy+(sh-laneH)/2,laneW,laneH);
    cx.strokeRect(sx+sw-laneW,sy+(sh-laneH)/2,laneW,laneH);
    var ftR=laneH/2;
    cx.beginPath();cx.arc(sx+laneW,sy+sh/2,ftR,-Math.PI/2,Math.PI/2);cx.stroke();
    cx.setLineDash([4,3]);cx.beginPath();cx.arc(sx+laneW,sy+sh/2,ftR,Math.PI/2,Math.PI*1.5);cx.stroke();cx.setLineDash([]);
    cx.beginPath();cx.arc(sx+sw-laneW,sy+sh/2,ftR,Math.PI/2,Math.PI*1.5);cx.stroke();
    cx.setLineDash([4,3]);cx.beginPath();cx.arc(sx+sw-laneW,sy+sh/2,ftR,-Math.PI/2,Math.PI/2);cx.stroke();cx.setLineDash([]);
    var tp3R=sh*0.42;
    cx.lineWidth=1.5;cx.beginPath();cx.arc(sx,sy+sh/2,tp3R,-Math.PI*0.38,Math.PI*0.38);cx.stroke();
    cx.beginPath();cx.arc(sx+sw,sy+sh/2,tp3R,Math.PI-Math.PI*0.38,Math.PI+Math.PI*0.38);cx.stroke();
    var tp3Y1=sy+sh/2-tp3R*Math.sin(Math.PI*0.38),tp3Y2=sy+sh/2+tp3R*Math.sin(Math.PI*0.38);
    cx.beginPath();cx.moveTo(sx,tp3Y1);cx.lineTo(sx,sy);cx.stroke();
    cx.beginPath();cx.moveTo(sx,tp3Y2);cx.lineTo(sx,sy+sh);cx.stroke();
    cx.beginPath();cx.moveTo(sx+sw,tp3Y1);cx.lineTo(sx+sw,sy);cx.stroke();
    cx.beginPath();cx.moveTo(sx+sw,tp3Y2);cx.lineTo(sx+sw,sy+sh);cx.stroke();
    cx.lineWidth=2.5;
    var bbOff=sw*0.015,rimR=sh*0.035;
    cx.beginPath();cx.moveTo(sx+bbOff,sy+sh/2-sh*0.1);cx.lineTo(sx+bbOff,sy+sh/2+sh*0.1);cx.stroke();
    cx.beginPath();cx.moveTo(sx+sw-bbOff,sy+sh/2-sh*0.1);cx.lineTo(sx+sw-bbOff,sy+sh/2+sh*0.1);cx.stroke();
    cx.lineWidth=1.5;cx.beginPath();cx.arc(sx+bbOff+rimR+2,sy+sh/2,rimR,0,Math.PI*2);cx.stroke();
    cx.beginPath();cx.arc(sx+sw-bbOff-rimR-2,sy+sh/2,rimR,0,Math.PI*2);cx.stroke();
    cx.lineWidth=1;cx.setLineDash([3,2]);
    cx.beginPath();cx.arc(sx+bbOff+rimR+2,sy+sh/2,sh*0.08,-Math.PI/2,Math.PI/2);cx.stroke();
    cx.beginPath();cx.arc(sx+sw-bbOff-rimR-2,sy+sh/2,sh*0.08,Math.PI/2,Math.PI*1.5);cx.stroke();
    cx.setLineDash([]);
  }
  else if(isVb){cx.strokeStyle='rgba(255,255,255,0.7)';cx.lineWidth=1.4;var atkX=sw*0.18;cx.beginPath();cx.moveTo(sx+sw/2-atkX,sy);cx.lineTo(sx+sw/2-atkX,sy+sh);cx.stroke();cx.beginPath();cx.moveTo(sx+sw/2+atkX,sy);cx.lineTo(sx+sw/2+atkX,sy+sh);cx.stroke();cx.lineWidth=3;cx.beginPath();cx.moveTo(sx+sw/2,sy-3);cx.lineTo(sx+sw/2,sy+sh+3);cx.stroke();}
  else if(isHb){
    cx.strokeStyle='rgba(255,255,255,0.75)';cx.lineWidth=1.5;cx.setLineDash([]);
    var gar6=sh*0.35;
    cx.beginPath();cx.arc(sx,sy+sh/2,gar6,-Math.PI/2,Math.PI/2);cx.stroke();
    cx.beginPath();cx.arc(sx+sw,sy+sh/2,gar6,Math.PI/2,Math.PI*1.5);cx.stroke();
    cx.setLineDash([5,3]);
    var fr9=sh*0.48;
    cx.beginPath();cx.arc(sx,sy+sh/2,fr9,-Math.PI/2,Math.PI/2);cx.stroke();
    cx.beginPath();cx.arc(sx+sw,sy+sh/2,fr9,Math.PI/2,Math.PI*1.5);cx.stroke();
    cx.setLineDash([]);
    cx.fillStyle='rgba(255,255,255,0.8)';
    cx.beginPath();cx.arc(sx+sw*0.15,sy+sh/2,3,0,Math.PI*2);cx.fill();
    cx.beginPath();cx.arc(sx+sw*0.85,sy+sh/2,3,0,Math.PI*2);cx.fill();
    var gH=sh*0.14;
    cx.lineWidth=3;
    cx.beginPath();cx.moveTo(sx,sy+sh/2-gH/2);cx.lineTo(sx-5,sy+sh/2-gH/2);cx.lineTo(sx-5,sy+sh/2+gH/2);cx.lineTo(sx,sy+sh/2+gH/2);cx.stroke();
    cx.beginPath();cx.moveTo(sx+sw,sy+sh/2-gH/2);cx.lineTo(sx+sw+5,sy+sh/2-gH/2);cx.lineTo(sx+sw+5,sy+sh/2+gH/2);cx.lineTo(sx+sw,sy+sh/2+gH/2);cx.stroke();
    cx.lineWidth=1;cx.setLineDash([3,2]);
    var subX=sw*0.1125;
    cx.beginPath();cx.moveTo(sx+sw/2-subX,sy);cx.lineTo(sx+sw/2-subX,sy+sh);cx.stroke();
    cx.beginPath();cx.moveTo(sx+sw/2+subX,sy);cx.lineTo(sx+sw/2+subX,sy+sh);cx.stroke();
    cx.setLineDash([]);
  }
  else{if(!_inPerspDraw){var isP=pitchOrientation==='portrait';drawHM(sx,sy,sw,sh,isP?'T':'L');drawHM(sx,sy,sw,sh,isP?'B':'R');drawGls(sx,sy,sw,sh,'both');}else{var isP2=pitchOrientation==='portrait';drawHM(sx,sy,sw,sh,isP2?'T':'L');drawHM(sx,sy,sw,sh,isP2?'B':'R');}}}
var _inPerspDraw=false;
function drawPitchGenPerspective(tr){
  var p=pRect();
  trapPath(tr);cx.save();cx.clip();
  var sx=p.x,sy=p.y,sw=p.w,sh=p.h;
  var m=[0,0,0,0,0,0];
  m[0]=(tr.topRight.x-tr.topLeft.x)/sw;
  m[1]=(tr.bottomLeft.x-tr.topLeft.x)/sh;
  m[2]=(tr.bottomRight.x-tr.topRight.x-tr.bottomLeft.x+tr.topLeft.x)/(sw*sh);
  m[3]=tr.topLeft.x;
  m[4]=(tr.topRight.y-tr.topLeft.y)/sw;
  m[5]=(tr.bottomLeft.y-tr.topLeft.y)/sh;
  m[6]=(tr.bottomRight.y-tr.topRight.y-tr.bottomLeft.y+tr.topLeft.y)/(sw*sh);
  m[7]=tr.topLeft.y;
  cx.setTransform(m[0],m[4],m[1],m[5],m[3],m[7]);
  cx.transform(1,0,m[2]/m[0],1,0,0);
  _inPerspDraw=true;
  drawPitchGen(sx,sy,sw,sh);
  _inPerspDraw=false;
  cx.restore();
  drawGlsPerspective(tr,'both');
}
function drawHM(sx,sy,sw,sh,s){var isF=sport==='futsal'||sport==='mini',isFB=sport==='football';var isPortrait=pitchOrientation==='portrait';cx.strokeStyle=sport==='beach'?'rgba(255,255,255,0.55)':'rgba(255,255,255,0.72)';cx.lineWidth=1.4;cx.setLineDash([]);
  if(isF){if(isPortrait){var par=sw*(sport==='futsal'?0.3:0.28),fp=sh*0.15;cx.beginPath();if(s==='T')cx.arc(sx+sw/2,sy,par,0,Math.PI);else cx.arc(sx+sw/2,sy+sh,par,Math.PI,Math.PI*2);cx.stroke();cx.fillStyle=cx.strokeStyle;cx.beginPath();cx.arc(sx+sw/2,s==='T'?sy+fp:sy+sh-fp,3,0,Math.PI*2);cx.fill();var gar=sw*(sport==='futsal'?0.12:0.1);cx.beginPath();if(s==='T')cx.arc(sx+sw/2,sy,gar,0,Math.PI);else cx.arc(sx+sw/2,sy+sh,gar,Math.PI,Math.PI*2);cx.stroke();}else{var par=sh*(sport==='futsal'?0.3:0.28),fp=sw*0.15;cx.beginPath();if(s==='L')cx.arc(sx,sy+sh/2,par,-Math.PI/2,Math.PI/2);else cx.arc(sx+sw,sy+sh/2,par,Math.PI/2,Math.PI*1.5);cx.stroke();cx.fillStyle=cx.strokeStyle;cx.beginPath();cx.arc(s==='L'?sx+fp:sx+sw-fp,sy+sh/2,3,0,Math.PI*2);cx.fill();var gar=sh*(sport==='futsal'?0.12:0.1);cx.beginPath();if(s==='L')cx.arc(sx,sy+sh/2,gar,-Math.PI/2,Math.PI/2);else cx.arc(sx+sw,sy+sh/2,gar,Math.PI/2,Math.PI*1.5);cx.stroke();}}
  else if(isFB){if(isPortrait){var paH=sh*0.157,paW=sw*0.61,gaH=sh*0.052,gaW=sw*0.27;if(s==='T'){cx.strokeRect(sx+(sw-paW)/2,sy,paW,paH);cx.strokeRect(sx+(sw-gaW)/2,sy,gaW,gaH);}else{cx.strokeRect(sx+(sw-paW)/2,sy+sh-paH,paW,paH);cx.strokeRect(sx+(sw-gaW)/2,sy+sh-gaH,gaW,gaH);}}else{var paW=sw*0.157,paH=sh*0.61,gaW=sw*0.052,gaH=sh*0.27;if(s==='L'){cx.strokeRect(sx,sy+(sh-paH)/2,paW,paH);cx.strokeRect(sx,sy+(sh-gaH)/2,gaW,gaH);}else{cx.strokeRect(sx+sw-paW,sy+(sh-paH)/2,paW,paH);cx.strokeRect(sx+sw-gaW,sy+(sh-gaH)/2,gaW,gaH);}}}
  else{if(isPortrait){var par2=sw*0.25;cx.beginPath();if(s==='T')cx.arc(sx+sw/2,sy,par2,0,Math.PI);else cx.arc(sx+sw/2,sy+sh,par2,Math.PI,Math.PI*2);cx.stroke();}else{var par2=sh*0.25;cx.beginPath();if(s==='L')cx.arc(sx,sy+sh/2,par2,-Math.PI/2,Math.PI/2);else cx.arc(sx+sw,sy+sh/2,par2,Math.PI/2,Math.PI*1.5);cx.stroke();}}}
function drawGls(sx,sy,sw,sh,m){if(!_inPerspDraw){var tr=pTrapezoid();if(tr){drawGlsPerspective(tr,m);return;}}var isPortrait=pitchOrientation==='portrait';cx.strokeStyle='rgba(255,255,255,0.4)';cx.lineWidth=2.2;cx.setLineDash([]);
if(isPortrait){var gH2=5,gW2=sw*0.15;if(m==='both')cx.strokeRect(sx+sw/2-gW2/2,sy-gH2,gW2,gH2);cx.strokeRect(sx+sw/2-gW2/2,sy+sh,gW2,gH2);
}else{var gW=5,gH=sh*0.15;if(m==='both')cx.strokeRect(sx-gW,sy+sh/2-gH/2,gW,gH);cx.strokeRect(sx+sw,sy+sh/2-gH/2,gW,gH);}}
function drawGlsPerspective(tr,m){
  cx.strokeStyle='rgba(255,255,255,0.4)';cx.lineWidth=2.2;cx.setLineDash([]);
  var bg=tr.backGoal,fg=tr.frontGoal;
  if(m==='both'){
    cx.beginPath();
    cx.moveTo(bg.x,bg.y);cx.lineTo(bg.x+bg.w,bg.y);
    cx.lineTo(bg.x+bg.w,bg.y+bg.h);cx.lineTo(bg.x,bg.y+bg.h);
    cx.closePath();cx.stroke();
  }
  cx.beginPath();
  cx.moveTo(fg.x,fg.y);cx.lineTo(fg.x+fg.w,fg.y);
  cx.lineTo(fg.x+fg.w,fg.y+fg.h);cx.lineTo(fg.x,fg.y+fg.h);
  cx.closePath();cx.stroke();
}
function drawGrid(){if(!gridSnap)return;cx.strokeStyle=theme==='dark'?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.06)';cx.lineWidth=0.5;cx.beginPath();for(var x=0;x<W;x+=gridSize){cx.moveTo(x,0);cx.lineTo(x,H);}for(var y=0;y<H;y+=gridSize){cx.moveTo(0,y);cx.lineTo(W,y);}cx.stroke();}
var FieldLibrary={
futsal:{ar:2,draw:drawFieldFutsal},
football:{ar:105/68,draw:drawFieldFootball},
beach:{ar:36/27,draw:drawFieldBeach},
mini:{ar:50/30,draw:drawFieldMini},
basketball:{ar:28/15,draw:drawFieldBasketball},
volleyball:{ar:2,draw:drawFieldVolleyball},
handball:{ar:2,draw:drawFieldHandball}
};
function svgCol(base,dark,light){return theme==='dark'?base:light||base;}
function drawSVGField(sx,sy,sw,sh){
var fd=FieldLibrary[sport];if(fd&&fd.draw)fd.draw(sx,sy,sw,sh);
}
function drawFieldFutsal(sx,sy,sw,sh){
var isPortrait=pitchOrientation==='portrait';
var g=svgCol('#2d8a4e','#2d8a4e','#3a9a5e');
cx.fillStyle=g;cx.fillRect(sx,sy,sw,sh);
var ln=svgCol('#ffffff','#ffffff','#1a3a2a');cx.strokeStyle=ln;cx.lineWidth=1.8;cx.setLineDash([]);cx.strokeRect(sx,sy,sw,sh);
if(isPortrait){
var ns=12,sh2=sh/ns;for(var i=0;i<ns;i++){cx.fillStyle=i%2===0?svgCol('#2d8a4e','#2d8a4e','#3a9a5e'):svgCol('#33944e','#33944e','#42a460');cx.fillRect(sx,sy+i*sh2,sw,sh2+1);}
cx.beginPath();cx.moveTo(sx,sy+sh/2);cx.lineTo(sx+sw,sy+sh/2);cx.stroke();
var cr=sw*0.15;cx.beginPath();cx.arc(sx+sw/2,sy+sh/2,cr,0,Math.PI*2);cx.stroke();
cx.fillStyle=ln;cx.beginPath();cx.arc(sx+sw/2,sy+sh/2,3,0,Math.PI*2);cx.fill();
var par=sw*0.25;cx.beginPath();cx.arc(sx+sw/2,sy,par,0,Math.PI);cx.stroke();
cx.beginPath();cx.arc(sx+sw/2,sy+sh,par,Math.PI,Math.PI*2);cx.stroke();
var gar=sw*0.1;cx.beginPath();cx.arc(sx+sw/2,sy,gar,0,Math.PI);cx.stroke();
cx.beginPath();cx.arc(sx+sw/2,sy+sh,gar,Math.PI,Math.PI*2);cx.stroke();
var fp=sh*0.15;cx.fillStyle=ln;
cx.beginPath();cx.arc(sx+sw/2,sy+fp,3,0,Math.PI*2);cx.fill();
cx.beginPath();cx.arc(sx+sw/2,sy+sh-fp,3,0,Math.PI*2);cx.fill();
var gW2=sw*0.15;cx.strokeStyle=svgCol('rgba(255,255,255,0.5)','#ffffff','rgba(0,0,0,0.4)');cx.lineWidth=2.5;
cx.strokeRect(sx+sw/2-gW2/2,sy-6,gW2,6);cx.strokeRect(sx+sw/2-gW2/2,sy+sh,gW2,6);
}else{
var ns=12,sw2=sw/ns;for(var i=0;i<ns;i++){cx.fillStyle=i%2===0?svgCol('#2d8a4e','#2d8a4e','#3a9a5e'):svgCol('#33944e','#33944e','#42a460');cx.fillRect(sx+i*sw2,sy,sw2+1,sh);}
cx.beginPath();cx.moveTo(sx+sw/2,sy);cx.lineTo(sx+sw/2,sy+sh);cx.stroke();
var cr=sh*0.15;cx.beginPath();cx.arc(sx+sw/2,sy+sh/2,cr,0,Math.PI*2);cx.stroke();
cx.fillStyle=ln;cx.beginPath();cx.arc(sx+sw/2,sy+sh/2,3,0,Math.PI*2);cx.fill();
var par=sh*0.25;cx.beginPath();cx.arc(sx,sy+sh/2,par,-Math.PI/2,Math.PI/2);cx.stroke();
cx.beginPath();cx.arc(sx+sw,sy+sh/2,par,Math.PI/2,Math.PI*1.5);cx.stroke();
var gar=sh*0.1;cx.beginPath();cx.arc(sx,sy+sh/2,gar,-Math.PI/2,Math.PI/2);cx.stroke();
cx.beginPath();cx.arc(sx+sw,sy+sh/2,gar,Math.PI/2,Math.PI*1.5);cx.stroke();
var fp=sw*0.15;cx.fillStyle=ln;
cx.beginPath();cx.arc(sx+fp,sy+sh/2,3,0,Math.PI*2);cx.fill();
cx.beginPath();cx.arc(sx+sw-fp,sy+sh/2,3,0,Math.PI*2);cx.fill();
var gH=sh*0.15;cx.strokeStyle=svgCol('rgba(255,255,255,0.5)','#ffffff','rgba(0,0,0,0.4)');cx.lineWidth=2.5;
cx.strokeRect(sx-6,sy+sh/2-gH/2,6,gH);cx.strokeRect(sx+sw,sy+sh/2-gH/2,6,gH);
}
var ca=sw*0.008;cx.strokeStyle=ln;cx.lineWidth=1.2;
cx.beginPath();cx.arc(sx,sy,ca,0,Math.PI/2);cx.stroke();
cx.beginPath();cx.arc(sx+sw,sy,ca,Math.PI/2,Math.PI);cx.stroke();
cx.beginPath();cx.arc(sx,sy+sh,ca,-Math.PI/2,0);cx.stroke();
cx.beginPath();cx.arc(sx+sw,sy+sh,ca,Math.PI,Math.PI*1.5);cx.stroke();
}
function drawFieldFootball(sx,sy,sw,sh){
var isPortrait=pitchOrientation==='portrait';
var ln=svgCol('#ffffff','#ffffff','#1a3a2a');cx.strokeStyle=ln;cx.lineWidth=2;cx.setLineDash([]);
cx.strokeRect(sx,sy,sw,sh);
if(isPortrait){
var ns=18,sh2=sh/ns;for(var i=0;i<ns;i++){cx.fillStyle=i%2===0?svgCol('#2d8a4e','#2d8a4e','#3a9a5e'):svgCol('#359454','#359454','#44a662');cx.fillRect(sx,sy+i*sh2,sw,sh2+1);}
cx.beginPath();cx.moveTo(sx,sy+sh/2);cx.lineTo(sx+sw,sy+sh/2);cx.stroke();
var cr=sw*0.18;cx.beginPath();cx.arc(sx+sw/2,sy+sh/2,cr,0,Math.PI*2);cx.stroke();
cx.fillStyle=ln;cx.beginPath();cx.arc(sx+sw/2,sy+sh/2,3,0,Math.PI*2);cx.fill();
var paH=sh*0.157,paW=sw*0.61;cx.strokeRect(sx+(sw-paW)/2,sy,paW,paH);cx.strokeRect(sx+(sw-paW)/2,sy+sh-paH,paW,paH);
var gaH=sh*0.052,gaW=sw*0.27;cx.strokeRect(sx+(sw-gaW)/2,sy,gaW,gaH);cx.strokeRect(sx+(sw-gaW)/2,sy+sh-gaH,gaW,gaH);
var pm=sh*0.107;cx.fillStyle=ln;
cx.beginPath();cx.arc(sx+sw/2,sy+pm,3.5,0,Math.PI*2);cx.fill();
cx.beginPath();cx.arc(sx+sw/2,sy+sh-pm,3.5,0,Math.PI*2);cx.fill();
var pr=sw*0.18;cx.beginPath();cx.arc(sx+sw/2,sy+pm,pr,Math.PI*0.18,Math.PI*0.82);cx.stroke();
cx.beginPath();cx.arc(sx+sw/2,sy+sh-pm,pr,Math.PI*1.18,Math.PI*1.82);cx.stroke();
var gW2=sw*0.133;cx.strokeStyle=svgCol('rgba(255,255,255,0.45)','#ffffff','rgba(0,0,0,0.35)');cx.lineWidth=3;
cx.strokeRect(sx+sw/2-gW2/2,sy-7,gW2,7);cx.strokeRect(sx+sw/2-gW2/2,sy+sh,gW2,7);
}else{
var ns=18,sw2=sw/ns;for(var i=0;i<ns;i++){cx.fillStyle=i%2===0?svgCol('#2d8a4e','#2d8a4e','#3a9a5e'):svgCol('#359454','#359454','#44a662');cx.fillRect(sx+i*sw2,sy,sw2+1,sh);}
cx.beginPath();cx.moveTo(sx+sw/2,sy);cx.lineTo(sx+sw/2,sy+sh);cx.stroke();
var cr=sh*0.0915*1.48;cx.beginPath();cx.arc(sx+sw/2,sy+sh/2,cr,0,Math.PI*2);cx.stroke();
cx.fillStyle=ln;cx.beginPath();cx.arc(sx+sw/2,sy+sh/2,3,0,Math.PI*2);cx.fill();
var paW=sw*0.157,paH=sh*0.61;cx.strokeRect(sx,sy+(sh-paH)/2,paW,paH);cx.strokeRect(sx+sw-paW,sy+(sh-paH)/2,paW,paH);
var gaW=sw*0.052,gaH=sh*0.27;cx.strokeRect(sx,sy+(sh-gaH)/2,gaW,gaH);cx.strokeRect(sx+sw-gaW,sy+(sh-gaH)/2,gaW,gaH);
var pm=sw*0.107;cx.fillStyle=ln;
cx.beginPath();cx.arc(sx+pm,sy+sh/2,3.5,0,Math.PI*2);cx.fill();
cx.beginPath();cx.arc(sx+sw-pm,sy+sh/2,3.5,0,Math.PI*2);cx.fill();
var pr=sh*0.0915*1.48;cx.beginPath();cx.arc(sx+pm,sy+sh/2,pr,-Math.PI*0.32,Math.PI*0.32);cx.stroke();
cx.beginPath();cx.arc(sx+sw-pm,sy+sh/2,pr,Math.PI-Math.PI*0.32,Math.PI+Math.PI*0.32);cx.stroke();
var gH=sh*0.133;cx.strokeStyle=svgCol('rgba(255,255,255,0.45)','#ffffff','rgba(0,0,0,0.35)');cx.lineWidth=3;
cx.strokeRect(sx-7,sy+sh/2-gH/2,7,gH);cx.strokeRect(sx+sw,sy+sh/2-gH/2,7,gH);
}
var ca=sw*0.006;cx.strokeStyle=ln;cx.lineWidth=1.2;
cx.beginPath();cx.arc(sx,sy,ca,0,Math.PI/2);cx.stroke();
cx.beginPath();cx.arc(sx+sw,sy,ca,Math.PI/2,Math.PI);cx.stroke();
cx.beginPath();cx.arc(sx,sy+sh,ca,-Math.PI/2,0);cx.stroke();
cx.beginPath();cx.arc(sx+sw,sy+sh,ca,Math.PI,Math.PI*1.5);cx.stroke();
}
function drawFieldBeach(sx,sy,sw,sh){
cx.fillStyle=svgCol('#d4b56a','#d4b56a','#e8d090');cx.fillRect(sx,sy,sw,sh);
var ln=svgCol('rgba(255,255,255,0.75)','#ffffff','rgba(40,40,40,0.6)');cx.strokeStyle=ln;cx.lineWidth=2;cx.setLineDash([]);cx.strokeRect(sx,sy,sw,sh);
cx.beginPath();cx.moveTo(sx+sw/2,sy);cx.lineTo(sx+sw/2,sy+sh);cx.stroke();
var pm=sw*0.25;cx.fillStyle=ln;
cx.beginPath();cx.arc(sx+pm,sy+sh/2,4,0,Math.PI*2);cx.fill();
cx.beginPath();cx.arc(sx+sw-pm,sy+sh/2,4,0,Math.PI*2);cx.fill();
var ca=sh*0.037;cx.beginPath();cx.arc(sx,sy,ca,0,Math.PI/2);cx.stroke();
cx.beginPath();cx.arc(sx+sw,sy,ca,Math.PI/2,Math.PI);cx.stroke();
cx.beginPath();cx.arc(sx,sy+sh,ca,-Math.PI/2,0);cx.stroke();
cx.beginPath();cx.arc(sx+sw,sy+sh,ca,Math.PI,Math.PI*1.5);cx.stroke();
var gH=sh*0.16;cx.strokeStyle=svgCol('rgba(255,255,255,0.4)','#ffffff','rgba(0,0,0,0.3)');cx.lineWidth=3;
cx.strokeRect(sx-5,sy+sh/2-gH/2,5,gH);cx.strokeRect(sx+sw,sy+sh/2-gH/2,5,gH);
}
function drawFieldBasketball(sx,sy,sw,sh){
cx.fillStyle=svgCol('#c06828','#c06828','#d4884a');cx.fillRect(sx,sy,sw,sh);
cx.fillStyle=svgCol('#b85818','#b85818','#cc7a38');cx.fillRect(sx+sw*0.03,sy+sh*0.03,sw*0.94,sh*0.94);
var ln=svgCol('#ffffff','#ffffff','#1a2a1a');cx.strokeStyle=ln;cx.lineWidth=1.8;cx.setLineDash([]);cx.strokeRect(sx,sy,sw,sh);
cx.beginPath();cx.moveTo(sx+sw/2,sy);cx.lineTo(sx+sw/2,sy+sh);cx.stroke();
var ccr=sh*0.18;cx.beginPath();cx.arc(sx+sw/2,sy+sh/2,ccr,0,Math.PI*2);cx.stroke();
cx.fillStyle=ln;cx.beginPath();cx.arc(sx+sw/2,sy+sh/2,3,0,Math.PI*2);cx.fill();
var laneW=sw*0.19,laneH=sh*0.42;
cx.strokeRect(sx,sy+(sh-laneH)/2,laneW,laneH);cx.strokeRect(sx+sw-laneW,sy+(sh-laneH)/2,laneW,laneH);
var ftR=laneH/2;
cx.beginPath();cx.arc(sx+laneW,sy+sh/2,ftR,-Math.PI/2,Math.PI/2);cx.stroke();
cx.setLineDash([4,3]);cx.beginPath();cx.arc(sx+laneW,sy+sh/2,ftR,Math.PI/2,Math.PI*1.5);cx.stroke();cx.setLineDash([]);
cx.beginPath();cx.arc(sx+sw-laneW,sy+sh/2,ftR,Math.PI/2,Math.PI*1.5);cx.stroke();
cx.setLineDash([4,3]);cx.beginPath();cx.arc(sx+sw-laneW,sy+sh/2,ftR,-Math.PI/2,Math.PI/2);cx.stroke();cx.setLineDash([]);
var tp3R=sh*0.42;cx.lineWidth=1.5;
cx.beginPath();cx.arc(sx,sy+sh/2,tp3R,-Math.PI*0.38,Math.PI*0.38);cx.stroke();
cx.beginPath();cx.arc(sx+sw,sy+sh/2,tp3R,Math.PI-Math.PI*0.38,Math.PI+Math.PI*0.38);cx.stroke();
var tp3Y1=sy+sh/2-tp3R*Math.sin(Math.PI*0.38),tp3Y2=sy+sh/2+tp3R*Math.sin(Math.PI*0.38);
cx.beginPath();cx.moveTo(sx,tp3Y1);cx.lineTo(sx,sy);cx.stroke();
cx.beginPath();cx.moveTo(sx,tp3Y2);cx.lineTo(sx,sy+sh);cx.stroke();
cx.beginPath();cx.moveTo(sx+sw,tp3Y1);cx.lineTo(sx+sw,sy);cx.stroke();
cx.beginPath();cx.moveTo(sx+sw,tp3Y2);cx.lineTo(sx+sw,sy+sh);cx.stroke();
var bbOff=sw*0.015,rimR=sh*0.035;cx.lineWidth=2.5;
cx.beginPath();cx.moveTo(sx+bbOff,sy+sh/2-sh*0.1);cx.lineTo(sx+bbOff,sy+sh/2+sh*0.1);cx.stroke();
cx.beginPath();cx.moveTo(sx+sw-bbOff,sy+sh/2-sh*0.1);cx.lineTo(sx+sw-bbOff,sy+sh/2+sh*0.1);cx.stroke();
cx.lineWidth=1.5;cx.beginPath();cx.arc(sx+bbOff+rimR+2,sy+sh/2,rimR,0,Math.PI*2);cx.stroke();
cx.beginPath();cx.arc(sx+sw-bbOff-rimR-2,sy+sh/2,rimR,0,Math.PI*2);cx.stroke();
cx.lineWidth=1;cx.setLineDash([3,2]);
cx.beginPath();cx.arc(sx+bbOff+rimR+2,sy+sh/2,sh*0.08,-Math.PI/2,Math.PI/2);cx.stroke();
cx.beginPath();cx.arc(sx+sw-bbOff-rimR-2,sy+sh/2,sh*0.08,Math.PI/2,Math.PI*1.5);cx.stroke();cx.setLineDash([]);
}
function drawFieldVolleyball(sx,sy,sw,sh){
cx.fillStyle=svgCol('#2060a0','#2060a0','#3080c0');cx.fillRect(sx,sy,sw,sh);
cx.fillStyle=svgCol('#2870b0','#2870b0','#3890d0');cx.fillRect(sx,sy,sw/2,sh);
var ln=svgCol('#ffffff','#ffffff','#1a2a3a');cx.strokeStyle=ln;cx.lineWidth=2;cx.setLineDash([]);cx.strokeRect(sx,sy,sw,sh);
var atk=sw*0.167;cx.lineWidth=1.5;
cx.beginPath();cx.moveTo(sx+sw/2-atk,sy);cx.lineTo(sx+sw/2-atk,sy+sh);cx.stroke();
cx.beginPath();cx.moveTo(sx+sw/2+atk,sy);cx.lineTo(sx+sw/2+atk,sy+sh);cx.stroke();
cx.lineWidth=3.5;cx.strokeStyle=svgCol('#ffffff','#ffffff','#2a3a4a');
cx.beginPath();cx.moveTo(sx+sw/2,sy-2);cx.lineTo(sx+sw/2,sy+sh+2);cx.stroke();
cx.fillStyle=ln;cx.beginPath();cx.arc(sx+sw/2,sy+sh/2,3,0,Math.PI*2);cx.fill();
var zoneW=sw/6;cx.lineWidth=0.5;cx.strokeStyle=svgCol('rgba(255,255,255,0.2)','#ffffff','rgba(0,0,0,0.15)');cx.setLineDash([3,3]);
for(var i=1;i<6;i++){if(i===3)continue;cx.beginPath();cx.moveTo(sx+i*zoneW,sy);cx.lineTo(sx+i*zoneW,sy+sh);cx.stroke();}
cx.setLineDash([]);
}
function drawFieldHandball(sx,sy,sw,sh){
var ns=10,sw2=sw/ns;for(var i=0;i<ns;i++){cx.fillStyle=i%2===0?svgCol('#1a7a3a','#1a7a3a','#2a8a4a'):svgCol('#228a44','#228a44','#34945a');cx.fillRect(sx+i*sw2,sy,sw2+1,sh);}
var ln=svgCol('#ffffff','#ffffff','#1a3a2a');cx.strokeStyle=ln;cx.lineWidth=1.8;cx.setLineDash([]);cx.strokeRect(sx,sy,sw,sh);
cx.beginPath();cx.moveTo(sx+sw/2,sy);cx.lineTo(sx+sw/2,sy+sh);cx.stroke();
var cr=sh*0.15;cx.beginPath();cx.arc(sx+sw/2,sy+sh/2,cr,0,Math.PI*2);cx.stroke();
cx.fillStyle=ln;cx.beginPath();cx.arc(sx+sw/2,sy+sh/2,3,0,Math.PI*2);cx.fill();
var gar6=sh*0.3;cx.beginPath();cx.arc(sx,sy+sh/2,gar6,-Math.PI/2,Math.PI/2);cx.stroke();
cx.beginPath();cx.arc(sx+sw,sy+sh/2,gar6,Math.PI/2,Math.PI*1.5);cx.stroke();
cx.setLineDash([5,3]);var fr9=sh*0.45;
cx.beginPath();cx.arc(sx,sy+sh/2,fr9,-Math.PI/2,Math.PI/2);cx.stroke();
cx.beginPath();cx.arc(sx+sw,sy+sh/2,fr9,Math.PI/2,Math.PI*1.5);cx.stroke();cx.setLineDash([]);
cx.fillStyle=ln;
cx.beginPath();cx.arc(sx+sw*0.175,sy+sh/2,3.5,0,Math.PI*2);cx.fill();
cx.beginPath();cx.arc(sx+sw*0.825,sy+sh/2,3.5,0,Math.PI*2);cx.fill();
var gH=sh*0.15;cx.lineWidth=3;cx.strokeStyle=svgCol('#ffffff','#ffffff','#1a3a2a');
cx.beginPath();cx.moveTo(sx,sy+sh/2-gH/2);cx.lineTo(sx-5,sy+sh/2-gH/2);cx.lineTo(sx-5,sy+sh/2+gH/2);cx.lineTo(sx,sy+sh/2+gH/2);cx.stroke();
cx.beginPath();cx.moveTo(sx+sw,sy+sh/2-gH/2);cx.lineTo(sx+sw+5,sy+sh/2-gH/2);cx.lineTo(sx+sw+5,sy+sh/2+gH/2);cx.lineTo(sx+sw,sy+sh/2+gH/2);cx.stroke();
cx.lineWidth=1.2;cx.strokeStyle=ln;cx.setLineDash([3,2]);var subX=sw*0.1125;
cx.beginPath();cx.moveTo(sx+sw/2-subX,sy);cx.lineTo(sx+sw/2-subX,sy+sh);cx.stroke();
cx.beginPath();cx.moveTo(sx+sw/2+subX,sy);cx.lineTo(sx+sw/2+subX,sy+sh);cx.stroke();cx.setLineDash([]);
var fr4=sh*0.2;cx.lineWidth=1;cx.setLineDash([3,2]);
cx.beginPath();cx.arc(sx,sy+sh/2,fr4,-0.6,0.6);cx.stroke();
cx.beginPath();cx.arc(sx+sw,sy+sh/2,fr4,Math.PI-0.6,Math.PI+0.6);cx.stroke();cx.setLineDash([]);
}
function drawFieldMini(sx,sy,sw,sh){
var isPortrait=pitchOrientation==='portrait';
var ln=svgCol('#ffffff','#ffffff','#1a3a2a');cx.strokeStyle=ln;cx.lineWidth=1.8;cx.setLineDash([]);cx.strokeRect(sx,sy,sw,sh);
if(isPortrait){
var ns=8,sh2=sh/ns;for(var i=0;i<ns;i++){cx.fillStyle=i%2===0?svgCol('#2d8a4e','#2d8a4e','#3a9a5e'):svgCol('#359454','#359454','#42a460');cx.fillRect(sx,sy+i*sh2,sw,sh2+1);}
cx.beginPath();cx.moveTo(sx,sy+sh/2);cx.lineTo(sx+sw,sy+sh/2);cx.stroke();
var cr=sw*0.12;cx.beginPath();cx.arc(sx+sw/2,sy+sh/2,cr,0,Math.PI*2);cx.stroke();
cx.fillStyle=ln;cx.beginPath();cx.arc(sx+sw/2,sy+sh/2,3,0,Math.PI*2);cx.fill();
var par=sw*0.28;cx.beginPath();cx.arc(sx+sw/2,sy,par,0,Math.PI);cx.stroke();
cx.beginPath();cx.arc(sx+sw/2,sy+sh,par,Math.PI,Math.PI*2);cx.stroke();
var gar=sw*0.1;cx.beginPath();cx.arc(sx+sw/2,sy,gar,0,Math.PI);cx.stroke();
cx.beginPath();cx.arc(sx+sw/2,sy+sh,gar,Math.PI,Math.PI*2);cx.stroke();
var fp=sh*0.15;cx.fillStyle=ln;
cx.beginPath();cx.arc(sx+sw/2,sy+fp,3,0,Math.PI*2);cx.fill();
cx.beginPath();cx.arc(sx+sw/2,sy+sh-fp,3,0,Math.PI*2);cx.fill();
var gW2=sw*0.15;cx.strokeStyle=svgCol('rgba(255,255,255,0.5)','#ffffff','rgba(0,0,0,0.4)');cx.lineWidth=2;
cx.strokeRect(sx+sw/2-gW2/2,sy-5,gW2,5);cx.strokeRect(sx+sw/2-gW2/2,sy+sh,gW2,5);
}else{
var ns=8,sw2=sw/ns;for(var i=0;i<ns;i++){cx.fillStyle=i%2===0?svgCol('#2d8a4e','#2d8a4e','#3a9a5e'):svgCol('#359454','#359454','#42a460');cx.fillRect(sx+i*sw2,sy,sw2+1,sh);}
cx.beginPath();cx.moveTo(sx+sw/2,sy);cx.lineTo(sx+sw/2,sy+sh);cx.stroke();
var cr=sh*0.12;cx.beginPath();cx.arc(sx+sw/2,sy+sh/2,cr,0,Math.PI*2);cx.stroke();
cx.fillStyle=ln;cx.beginPath();cx.arc(sx+sw/2,sy+sh/2,3,0,Math.PI*2);cx.fill();
var par=sh*0.28;cx.beginPath();cx.arc(sx,sy+sh/2,par,-Math.PI/2,Math.PI/2);cx.stroke();
cx.beginPath();cx.arc(sx+sw,sy+sh/2,par,Math.PI/2,Math.PI*1.5);cx.stroke();
var gar=sh*0.1;cx.beginPath();cx.arc(sx,sy+sh/2,gar,-Math.PI/2,Math.PI/2);cx.stroke();
cx.beginPath();cx.arc(sx+sw,sy+sh/2,gar,Math.PI/2,Math.PI*1.5);cx.stroke();
var fp=sw*0.15;cx.fillStyle=ln;
cx.beginPath();cx.arc(sx+fp,sy+sh/2,3,0,Math.PI*2);cx.fill();
cx.beginPath();cx.arc(sx+sw-fp,sy+sh/2,3,0,Math.PI*2);cx.fill();
var gH=sh*0.15;cx.strokeStyle=svgCol('rgba(255,255,255,0.5)','#ffffff','rgba(0,0,0,0.4)');cx.lineWidth=2;
cx.strokeRect(sx-5,sy+sh/2-gH/2,5,gH);cx.strokeRect(sx+sw,sy+sh/2-gH/2,5,gH);
}
}
function drawPitchAnimOverlay(){
var p=pRect();if(!p||p.w<100)return;var tr=pTrapezoid();
cx.save();cx.globalAlpha=0.06;cx.globalCompositeOperation='lighter';
if(tr){
  trapPath(tr);cx.clip();
  var sx=p.x,sy=p.y,sw=p.w,sh=p.h;
  var stripeW=sw/12;
  for(var i=0;i<12;i++){
    if(i%2===0)continue;
    cx.fillStyle='rgba(255,255,255,0.6)';
    cx.fillRect(sx+i*stripeW,sy,stripeW*0.6,sh);
  }
}else{var stripeW=p.w/12;
for(var i=0;i<12;i++){
if(i%2===0)continue;
var sx=p.x+i*stripeW;
cx.fillStyle='rgba(255,255,255,0.6)';
cx.fillRect(sx,p.y,stripeW*0.6,p.h);
}}
cx.restore();}
