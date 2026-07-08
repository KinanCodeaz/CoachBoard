'use strict';function t(key){return(T[lang]&&T[lang][key])||T.ar[key]||key;}
var _pRectCache=null,_pRectKey='';
function pRectLandscape(){var key=W+','+H+','+sport+','+pitchOrientation;if(_pRectKey===key&&_pRectCache)return _pRectCache;var pad=Math.max(30,Math.min(W,H)*0.05),ratios={futsal:2,football:105/68,beach:36/27,mini:50/30,basketball:28/15,volleyball:18/9,handball:40/20},ar=ratios[sport]||2;if(typeof pitchOrientation!=='undefined'&&pitchOrientation==='portrait')ar=1/ar;var w=Math.max(80,W-2*pad),h=w/ar;if(h>H-2*pad){h=Math.max(80,H-2*pad);w=h*ar;}var px=(W-w)/2,py=(H-h)/2;var r={x:px,y:py,w:Math.max(10,w),h:Math.max(10,h),fw:Math.max(10,w),fh:Math.max(10,h)};_pRectCache=r;_pRectKey=key;return r;}
function pRect(){return pRectLandscape();}
function invalidatePRect(){_pRectCache=null;_pRectKey='';}
function toScreen(lx,ly){return{x:lx,y:ly};}
function toLandscape(sx,sy){return{x:sx,y:sy};}
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;');}
function validateImageFile(file,maxMB){
  if(!file)return false;var max=maxMB||2;
  if(file.size>max*1024*1024){toast(t('file_too_large')+' ('+max+'MB '+(lang==='ar'?'كحد أقصى':'max')+')');return false;}
  return true;}
function isArr(tp){return tp==='arrowSolid'||tp==='arrowDashed'||tp==='arrowDotted'||tp==='arrowCurved';}
function isMultiArr(tp){return tp==='arrowMulti'||tp==='arrowDoublePoly'||tp==='arrowSlalom';}
function isP2D(tp){return tp==='p_stand'||tp==='gk_stand';}
function isFree(tp){return tp==='freehand'||tp==='highlighter';}
function isZone(tp){return tp==='zoneCircle'||tp==='zoneRect'||tp==='zoneTriangle'||tp==='zoneRect2C'||tp==='spinRing'||tp==='zone18';}
var _uidCnt=0;function uid(){return Date.now()+'_'+(++_uidCnt)+'_'+Math.random().toString(36).substr(2,5);}
function lightColor(hex,amt){var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);r=Math.min(255,Math.max(0,r+amt));g=Math.min(255,Math.max(0,g+amt));b=Math.min(255,Math.max(0,b+amt));return'#'+(r<16?'0':'')+r.toString(16)+(g<16?'0':'')+g.toString(16)+(b<16?'0':'')+b.toString(16);}
function darkColor(hex,amt){var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);r=Math.max(0,Math.min(255,r-amt));g=Math.max(0,Math.min(255,g-amt));b=Math.max(0,Math.min(255,b-amt));return'#'+(r<16?'0':'')+r.toString(16)+(g<16?'0':'')+g.toString(16)+(b<16?'0':'')+b.toString(16);}
function ptSegDist(px,py,x1,y1,x2,y2){var dx=x2-x1,dy=y2-y1,l2=dx*dx+dy*dy;if(l2===0)return Math.sqrt((px-x1)**2+(py-y1)**2);var tt=Math.max(0,Math.min(1,((px-x1)*dx+(py-y1)*dy)/l2));return Math.sqrt((px-(x1+tt*dx))**2+(py-(y1+tt*dy))**2);}
function eCen(el){if(isArr(el.type)&&el.ax2!==undefined)return{x:(el.x+el.ax2)/2,y:(el.y+el.ay2)/2};if((isFree(el.type)||isMultiArr(el.type))&&el.points&&el.points.length){var sx=0,sy=0;for(var i=0;i<el.points.length;i++){sx+=el.points[i].x;sy+=el.points[i].y;}return{x:sx/el.points.length,y:sy/el.points.length};}return{x:el.x,y:el.y};}
function aCol(tp){
  if(typeof SEC!=='undefined'){var _s=SEC.byTool(tp);if(_s&&_s.dc)return _s.dc(tp);}
  return{arrowSolid:'#ffffff',arrowDashed:'#f0c040',arrowDotted:'#40c0e8',arrowCurved:'#c070f0',arrowMulti:'#50e870',arrowDoublePoly:'#f0c040',arrowSlalom:'#ff6b2b'}[tp]||'#ffffff';}
function dc(tp){
  if(typeof SEC!=='undefined'){var _s=SEC.byTool(tp);if(_s&&_s.dc)return _s.dc(tp);}
  return{ball:'#ffffff',text:'#ffffff',number:'#e8960c'}[tp]||'#ffffff';}
function elName(el){
  if(typeof SEC!=='undefined'){var _s=SEC.byTool(el.type);if(_s&&_s.elName)return _s.elName(el.type)+' '+(el.text||(els.indexOf(el)+1));}
  return t('player')+' '+(el.text||(els.indexOf(el)+1));}
function elBnd(el){
  if(typeof SEC!=='undefined'){var _s=SEC.byTool(el.type);if(_s&&_s.bounds)return _s.bounds(el);}
  var s=el.size||18;return{x:el.x-s,y:el.y-s,w:s*2,h:s*2};}
function lerp(a,b,t){return a+(b-a)*t;}
function pTrapezoid(){
  if(!pitchPerspective||!pitchPerspective.enabled)return null;
  var p=pRect(),diff=pitchPerspective.scaleDiff,
      topShrink=p.w*diff/2,bottomGrow=p.w*diff/2,
      tiltOffset=Math.sin(pitchPerspective.tilt*Math.PI/180)*p.h*0.03;
  return{
    topLeft:{x:p.x+topShrink,y:p.y-tiltOffset},
    topRight:{x:p.x+p.w-topShrink,y:p.y-tiltOffset},
    bottomRight:{x:p.x+p.w+bottomGrow,y:p.y+p.h+tiltOffset},
    bottomLeft:{x:p.x-bottomGrow,y:p.y+p.h+tiltOffset},
    topWidth:p.w-topShrink*2,bottomWidth:p.w+bottomGrow*2,
    height:p.h+tiltOffset*2,centerX:p.x+p.w/2,centerY:p.y+p.h/2,
    backGoal:{x:p.x-bottomGrow,y:p.y+p.h+tiltOffset-2,w:p.w+bottomGrow*2,h:5},
    frontGoal:{x:p.x+topShrink,y:p.y-tiltOffset-5,w:p.w-topShrink*2,h:5}
  };
}
function pitchBounds(){return pTrapezoid()||pRect();}
function trapX(tr,side,t){if(side==='left')return lerp(tr.topLeft.x,tr.bottomLeft.x,t);return lerp(tr.topRight.x,tr.bottomRight.x,t);}
function trapY(tr,t){return lerp(tr.topLeft.y,tr.bottomLeft.y,t);}
function perspectiveScaleAt(tr,t){var diff=pitchPerspective.scaleDiff;return 1-diff/2+diff*t;}
function isPerspective(){return pitchPerspective&&pitchPerspective.enabled;}
