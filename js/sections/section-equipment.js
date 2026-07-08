'use strict';
// CoachBoard Pro - Section: Equipment
// DESIGN-SYSTEM: Consistent lighting (top-left), shadows, gradients, strokes
var EqDS = {
  // Delegate to DesignSystem
  groundShadow: function(cx2, x, y, w, h) {
    if (typeof DesignSystem !== 'undefined') DesignSystem.drawGroundShadow(cx2, x, y, w, h);
    else {
      cx2.save(); cx2.fillStyle = 'rgba(0,0,0,0.12)';
      cx2.beginPath(); cx2.ellipse(x + 3, y + 5, w, h, 0, 0, Math.PI * 2); cx2.fill();
      cx2.restore();
    }
  },
  gradient: function(cx2, x, y, h, color) {
    if (typeof DesignSystem !== 'undefined') return DesignSystem.gradient(cx2, x, y, h, color);
    var g = cx2.createLinearGradient(x, y - h / 2, x, y + h / 2);
    g.addColorStop(0, lightColor(color, 30)); g.addColorStop(0.5, color); g.addColorStop(1, darkColor(color, 20));
    return g;
  },
  frame: function(cx2, x1, y1, x2, y2, color, width) {
    if (typeof DesignSystem !== 'undefined') { DesignSystem.drawFrame(cx2, x1, y1, x2, y2, color, width); return; }
    cx2.strokeStyle = color; cx2.lineWidth = width || 5; cx2.lineCap = 'round';
    cx2.beginPath(); cx2.moveTo(x1, y1); cx2.lineTo(x2, y2); cx2.stroke();
    cx2.strokeStyle = 'rgba(255,255,255,0.3)'; cx2.lineWidth = 1.5;
    cx2.beginPath(); cx2.moveTo(x1 - 1, y1 - 1); cx2.lineTo(x2 - 1, y2 - 1); cx2.stroke();
  },
  outline: function(cx2, color) {
    if (typeof DesignSystem !== 'undefined') { DesignSystem.drawOutline(cx2, color); return; }
    cx2.strokeStyle = darkColor(color, 15); cx2.lineWidth = 0.5;
  }
};
SEC.add({
  id: 'equipment',
  tools: ['cone', 'coneDisc', 'coneTall', 'ring', 'barrier', 'hurdle', 'hurdleArc', 'mannequin', 'smallGoal', 'flag', 'ladder', 'stick', 'bib', 'reboundBoard'],

  elName: function(type) {
    var map = { cone: 'cone_n', coneDisc: 'cone_n', coneTall: 'cone_n', ring: 'ring_n', barrier: 'barrier_n', hurdle: 'hurdle_n', hurdleArc: 'hurdle_arc_n', mannequin: 'mannequin_n', smallGoal: 'small_goal_n', flag: 'flag_n', ladder: 'ladder_n', stick: 'stick_n', bib: 'bib_n', reboundBoard: 'rebound_board_n' };
    return t(map[type] || 'cone_n');
  },

  dc: function(type) {
    return { cone: '#e86020', coneDisc: '#ff8c42', coneTall: '#e84040', ring: '#f0c040', barrier: '#e84040', hurdle: '#e8960c', hurdleArc: '#e8960c', mannequin: '#c070f0', smallGoal: '#ffffff', flag: '#50e870', ladder: '#ffffff', stick: '#ffffff', bib: '#4a90d9', reboundBoard: '#40c0e8' }[type] || '#ffffff';
  },

  bounds: function(el) {
    var s = el.size || 18;
    if (el.type === 'mannequin') return { x: el.x - s * 0.35, y: el.y - s * 0.6, w: s * 0.7, h: s * 1.15 };
    switch (el.type) {
      case 'cone': case 'coneTall': return { x: el.x - s * 0.65, y: el.y - s, w: s * 1.3, h: s * 1.5 };
      case 'coneDisc': return { x: el.x - s, y: el.y - s * 0.3, w: s * 2, h: s * 0.6 };
      case 'ring': return { x: el.x - s, y: el.y - s, w: s * 2, h: s * 2 };
      case 'barrier': return { x: el.x - s * 0.8, y: el.y - s * 0.225, w: s * 1.6, h: s * 0.45 };
      case 'hurdle': return { x: el.x - s * 0.7, y: el.y - s, w: s * 1.4, h: s };
      case 'hurdleArc': return { x: el.x - s * 0.7, y: el.y - s * 0.5, w: s * 1.4, h: s * 1.2 };
      case 'smallGoal': return { x: el.x - s * 1.05, y: el.y - s * 0.7, w: s * 2.1, h: s * 1.4 };
      case 'flag': return { x: el.x - s * 0.2, y: el.y - s, w: s, h: s * 2 };
      case 'ladder': return { x: el.x - s * 0.6, y: el.y - s * 1.75, w: s * 1.2, h: s * 3.5 };
      case 'stick': return { x: el.x - s * 0.6, y: el.y - s * 1.15, w: s * 1.2, h: s * 2 };
      case 'bib': return { x: el.x - s * 0.55, y: el.y - s * 0.9, w: s * 1.1, h: s * 1.8 };

      case 'reboundBoard': return { x: el.x - s * 0.4, y: el.y - s * 0.9, w: s * 1.4, h: s * 2.1 };
      default: return { x: el.x - s, y: el.y - s, w: s * 2, h: s * 2 };
    }
  },

  center: function(el) {
    return { x: el.x, y: el.y };
  },

  placeEl: function(type, x, y, el) {
    // Phase F: Equipment Studio — parametric defaults
    if (type === 'cone') { el.size = 18; el.coneHeight = 1.0; el.coneBaseRadius = 1.0; el.coneTopRadius = 0.15; el.material = 'plastic'; }
    if (type === 'coneDisc') { el.size = 16; el.coneHeight = 0.3; el.coneBaseRadius = 1.0; el.material = 'plastic'; }
    if (type === 'coneTall') { el.size = 16; el.coneHeight = 1.5; el.coneBaseRadius = 0.8; el.coneTopRadius = 0.1; el.material = 'plastic'; }
    if (type === 'ring') { el.size = 18; el.ringThickness = 1.0; el.material = 'plastic'; }
    if (type === 'barrier') { el.size = 18; el.barrierWidth = 1.0; el.barrierHeight = 1.0; el.material = 'plastic'; }
    if (type === 'hurdle') { el.size = 18; el.hurdleHeight = 1.0; el.hurdleWidth = 1.0; el.material = 'metal'; }
    if (type === 'hurdleArc') { el.size = 18; el.hurdleHeight = 1.0; el.hurdleWidth = 1.0; el.material = 'plastic'; }
    if (type === 'mannequin') { el.size = 40; el.mannequinPose = 'stand'; el.material = 'plastic'; el.mannequinHeight = 1.0; }
    if (type === 'smallGoal') { el.viewMode = 'auto'; el.castShadow = true; el.goalWidth = 1.0; el.goalHeight = 1.0; el.goalDepth = 0.6; el.netDensity = 1.0; el.material = 'metal'; }
    if (type === 'flag') { el.size = 24; el.flagPoleHeight = 1.0; el.flagSize = 1.0; el.material = 'fabric'; }
    if (type === 'ladder') { el.size = 18; el.ladderRungs = 9; el.ladderWidth = 1.0; el.material = 'plastic'; }
    if (type === 'stick') { el.stickBaseColor = '#333333'; el.size = 24; el.stickHeight = 1.0; el.material = 'metal'; }
    if (type === 'bib') { el.size = 18; el.material = 'fabric'; el.bibStyle = 'vest'; }
    if (type === 'reboundBoard') { el.size = 18; el.reboundAngle = 0; el.reboundWidth = 1.0; el.reboundHeight = 1.0; el.material = 'wood'; }
  },

  draw: function(el) {
    var s = el.size || 18, cl = el.color || '#ffffff';
    // Consistent ground shadow for all equipment
    if (el.type !== 'smallGoal') {
      cx.save();
      cx.translate(el.x, el.y);
      cx.rotate((el.rotation || 0) * Math.PI / 180);
      cx.fillStyle = 'rgba(0,0,0,0.12)';
      var sw = s * 0.8, sh = s * 0.12;
      if (el.type === 'ladder' || el.type === 'stick') { sw = s * 0.5; sh = s * 0.08; }
      if (el.type === 'barrier') { sw = s * 1.2; sh = s * 0.08; }
      if (el.type === 'ring') { sw = s * 0.9; sh = s * 0.1; }
      cx.beginPath(); cx.ellipse(s * 0.08, s * 0.15, sw, sh, 0, 0, Math.PI * 2); cx.fill();
      cx.restore();
    }
    if (el.type === 'smallGoal' && el.castShadow !== false) {
      var prof0 = GoalVisualProfile;
      cx.save();
      cx.translate(el.x + (prof0.shadowOffsetX || 3), el.y + (prof0.shadowOffsetY || 5));
      cx.rotate((el.rotation || 0) * Math.PI / 180);
      if (el.flipH) cx.scale(-1, 1);
      var ss = el.size || 18;
      cx.fillStyle = 'rgba(0,0,0,'+(prof0.shadowAlpha || 0.15)+')';
      cx.fillRect(-ss * 1.05, -ss * 0.7, ss * 2.1, ss * 1.4);
      cx.restore();
    }
    cx.save();
    cx.translate(el.x, el.y);
    cx.rotate((el.rotation || 0) * Math.PI / 180);
    if (el.flipH) cx.scale(-1, 1);
    if (el.flipV) cx.scale(1, -1);
    var s = el.size || 18, cl = el.color || '#ffffff', op = el.opacity !== undefined ? el.opacity : 1;
    cx.globalAlpha = op;
    if (typeof customIconImages !== 'undefined' && customIconImages[el.type]) {
      var ci = customIconImages[el.type], is = ci.naturalWidth || s * 2, it = ci.naturalHeight || s * 2, sc = Math.min(s * 2 / is, s * 2 / it);
      cx.drawImage(ci, -is * sc / 2, -it * sc / 2, is * sc, it * sc);
      cx.globalAlpha = 1; cx.restore(); return;
    }
    switch (el.type) {
      case 'cone':
        // Phase F: Parametric cone with height, baseRadius, topRadius
        var ch = (el.coneHeight || 1.0) * s;
        var cbr = (el.coneBaseRadius || 1.0) * s * 0.75;
        var ctr = (el.coneTopRadius || 0.15) * s * 0.75;
        // Phase I: Material-aware gradient
        var cg;
        if (typeof MaterialSystem !== 'undefined' && el.material) {
          cg = MaterialSystem.applyGradient(cx, 0, 0, ch, cl, el.material);
        } else {
          cg = cx.createLinearGradient(0, -ch * 0.8, 0, s * 0.3);
          cg.addColorStop(0, lightColor(cl, 20)); cg.addColorStop(1, cl);
        }
        // Shadow
        cx.fillStyle = 'rgba(0,0,0,0.12)';
        cx.beginPath(); cx.ellipse(0, s * 0.5, cbr, s * 0.12, 0, 0, Math.PI * 2); cx.fill();
        // Body
        cx.fillStyle = cg;
        cx.beginPath(); cx.moveTo(0, -ch * 0.8); cx.lineTo(-cbr, s * 0.35); cx.lineTo(cbr, s * 0.35); cx.closePath(); cx.fill();
        cx.strokeStyle = 'rgba(255,255,255,0.3)'; cx.lineWidth = 1; cx.stroke();
        // Highlight
        cx.fillStyle = 'rgba(255,255,255,0.35)';
        cx.beginPath(); cx.moveTo(-s * 0.1, -ch * 0.55); cx.lineTo(s * 0.15, -ch * 0.55); cx.lineTo(s * 0.35, -s * 0.1); cx.lineTo(-s * 0.4, -s * 0.1); cx.closePath(); cx.fill();
        // Base ellipse
        cx.fillStyle = cl;
        cx.beginPath(); cx.ellipse(0, s * 0.32, cbr, s * 0.1, 0, 0, Math.PI * 2); cx.fill();
        // Top cap
        if (ctr > 0) {
          cx.fillStyle = lightColor(cl, 15);
          cx.beginPath(); cx.ellipse(0, -ch * 0.8, ctr, ctr * 0.3, 0, 0, Math.PI * 2); cx.fill();
        }
        break;
      case 'coneDisc':
        // DESIGN-SYSTEM: 3D raised look with gradient, shadow, highlight
        // Shadow
        cx.fillStyle = 'rgba(0,0,0,0.12)';
        cx.beginPath(); cx.ellipse(3, 5, s, s * 0.25, 0, 0, Math.PI * 2); cx.fill();
        // Main body gradient
        var dg = cx.createLinearGradient(0, -s * 0.3, 0, s * 0.3);
        dg.addColorStop(0, lightColor(cl, 40)); dg.addColorStop(0.5, cl); dg.addColorStop(1, darkColor(cl, 20));
        cx.fillStyle = dg;
        cx.beginPath(); cx.ellipse(0, 0, s, s * 0.3, 0, 0, Math.PI * 2); cx.fill();
        // Top highlight
        cx.fillStyle = lightColor(cl, 50);
        cx.beginPath(); cx.ellipse(0, -s * 0.04, s * 0.85, s * 0.2, 0, 0, Math.PI * 2); cx.fill();
        // Edge highlight
        cx.strokeStyle = 'rgba(255,255,255,0.3)'; cx.lineWidth = 1;
        cx.beginPath(); cx.ellipse(0, 0, s, s * 0.3, 0, 0, Math.PI * 2); cx.stroke();
        // Bottom rim
        cx.strokeStyle = 'rgba(0,0,0,0.1)'; cx.lineWidth = 0.8;
        cx.beginPath(); cx.ellipse(0, s * 0.02, s * 0.92, s * 0.24, 0, 0.2, Math.PI); cx.stroke();
        // Outline
        cx.strokeStyle = darkColor(cl, 15); cx.lineWidth = 0.5;
        cx.beginPath(); cx.ellipse(0, 0, s, s * 0.3, 0, 0, Math.PI * 2); cx.stroke();
        break;
      case 'coneTall':
        var tg = cx.createLinearGradient(0, -s * 1.3, 0, s * 0.5);
        tg.addColorStop(0, lightColor(cl, 40)); tg.addColorStop(1, cl);
        cx.fillStyle = tg; cx.beginPath(); cx.moveTo(0, -s * 1.3); cx.lineTo(-s * 0.5, s * 0.5); cx.lineTo(s * 0.5, s * 0.5); cx.closePath(); cx.fill();
        cx.strokeStyle = 'rgba(255,255,255,0.5)'; cx.lineWidth = 1.5; cx.stroke();
        cx.fillStyle = 'rgba(255,255,255,0.15)'; cx.fillRect(-s * 0.45, s * 0.2, s * 0.9, s * 0.3);
        break;
      case 'ring':
        // DESIGN-SYSTEM: gradient ring with shadow
        cx.save();
        // Outer ring with gradient
        var rg2 = cx.createLinearGradient(0, -s, 0, s);
        rg2.addColorStop(0, lightColor(cl, 25));
        rg2.addColorStop(0.5, cl);
        rg2.addColorStop(1, darkColor(cl, 20));
        cx.strokeStyle = rg2; cx.lineWidth = 3;
        cx.beginPath(); cx.arc(0, 0, s, 0, Math.PI * 2); cx.stroke();
        // Inner glow
        cx.strokeStyle = cl + '30'; cx.lineWidth = 7;
        cx.beginPath(); cx.arc(0, 0, s, 0, Math.PI * 2); cx.stroke();
        // Highlight arc (top-left light)
        cx.strokeStyle = 'rgba(255,255,255,0.35)'; cx.lineWidth = 1.5;
        cx.beginPath(); cx.arc(0, 0, s, -Math.PI * 0.8, -Math.PI * 0.2); cx.stroke();
        cx.restore();
        break;
      case 'barrier':
        var bw = s * 1.6, bh = s * 0.45;
        // DESIGN-SYSTEM: gradient fill with highlight
        var bg = cx.createLinearGradient(0, -bh / 2, 0, bh / 2);
        bg.addColorStop(0, lightColor(cl, 15));
        bg.addColorStop(1, darkColor(cl, 10));
        cx.fillStyle = bg;
        cx.fillRect(-bw / 2, -bh / 2, bw, bh);
        // Highlight bar
        cx.fillStyle = 'rgba(255,255,255,0.3)';
        cx.fillRect(-bw / 2, -bh / 2, bw, bh * 0.15);
        // Outline
        cx.strokeStyle = darkColor(cl, 20); cx.lineWidth = 0.5;
        cx.strokeRect(-bw / 2, -bh / 2, bw, bh);
        break;
      case 'hurdle':
        // Phase F: Parametric hurdle with height, width
        var hw = (el.hurdleWidth || 1.0) * s * 1.4;
        var hh = (el.hurdleHeight || 1.0) * s;
        // DESIGN-SYSTEM: gradient frames with outline
        var hg = cx.createLinearGradient(0, -hh, 0, 0);
        hg.addColorStop(0, lightColor(cl, 15));
        hg.addColorStop(1, darkColor(cl, 10));
        cx.strokeStyle = hg; cx.lineCap = 'round';
        // Legs
        cx.lineWidth = 2.5;
        cx.beginPath(); cx.moveTo(-hw / 2, 0); cx.lineTo(-hw / 2, -hh); cx.stroke();
        cx.beginPath(); cx.moveTo(hw / 2, 0); cx.lineTo(hw / 2, -hh); cx.stroke();
        // Bar (thicker)
        cx.lineWidth = 3.5; cx.beginPath(); cx.moveTo(-hw / 2, -hh); cx.lineTo(hw / 2, -hh); cx.stroke();
        // Highlight on bar
        cx.strokeStyle = 'rgba(255,255,255,0.3)'; cx.lineWidth = 1;
        cx.beginPath(); cx.moveTo(-hw / 2, -hh - 1); cx.lineTo(hw / 2, -hh - 1); cx.stroke();
        // Outline
        cx.strokeStyle = darkColor(cl, 15); cx.lineWidth = 0.5;
        cx.beginPath(); cx.moveTo(-hw / 2, 0); cx.lineTo(-hw / 2, -hh); cx.stroke();
        cx.beginPath(); cx.moveTo(hw / 2, 0); cx.lineTo(hw / 2, -hh); cx.stroke();
        cx.beginPath(); cx.moveTo(-hw / 2, -hh); cx.lineTo(hw / 2, -hh); cx.stroke();
        break;
      case 'hurdleArc':
        // Continuous arch/dome leaning backward (all elements connected)
        cx.lineCap = 'round'; cx.lineJoin = 'round';
        // Shadow
        cx.fillStyle = 'rgba(0,0,0,0.06)';
        cx.beginPath(); cx.ellipse(s * 0.12, s * 0.1, s * 0.65, s * 0.04, 0, 0, Math.PI * 2); cx.fill();
        // Draw the arch as one continuous path tilted backward
        cx.save();
        cx.translate(s * 0.15, 0); // shift right for backward lean
        cx.rotate(-0.12); // slight rotation for backward lean
        var haw2 = s * 0.55, hah2 = s * 0.5;
        cx.strokeStyle = darkColor(cl, 18); cx.lineWidth = s * 0.09;
        cx.beginPath(); cx.moveTo(-haw2, s * 0.06);
        cx.quadraticCurveTo(-haw2, -hah2, 0, -hah2);
        cx.quadraticCurveTo(haw2, -hah2, haw2, s * 0.06);
        cx.stroke();
        cx.strokeStyle = cl; cx.lineWidth = s * 0.055;
        cx.beginPath(); cx.moveTo(-haw2, s * 0.06);
        cx.quadraticCurveTo(-haw2, -hah2, 0, -hah2);
        cx.quadraticCurveTo(haw2, -hah2, haw2, s * 0.06);
        cx.stroke();
        cx.restore();
        break;
      case 'mannequin':
        // Professional training mannequin with body silhouette
        cx.lineCap = 'round'; cx.lineJoin = 'round';
        // Shadow
        cx.fillStyle = 'rgba(0,0,0,0.15)';
        cx.beginPath(); cx.ellipse(0, s * 0.6, s * 0.35, s * 0.06, 0, 0, Math.PI * 2); cx.fill();
        // Base stand (heavy base)
        cx.fillStyle = '#2a2a2a';
        cx.beginPath();
        cx.ellipse(0, s * 0.55, s * 0.3, s * 0.06, 0, 0, Math.PI * 2);
        cx.fill();
        cx.strokeStyle = '#444'; cx.lineWidth = 1;
        cx.stroke();
        // Stand pole with gradient
        var stpg = cx.createLinearGradient(-s * 0.03, 0, s * 0.03, 0);
        stpg.addColorStop(0, '#444'); stpg.addColorStop(0.5, '#666'); stpg.addColorStop(1, '#444');
        cx.fillStyle = stpg;
        cx.fillRect(-s * 0.03, s * 0.2, s * 0.06, s * 0.35);
        // Body (torso) with gradient
        var mg = cx.createLinearGradient(-s * 0.18, 0, s * 0.18, 0);
        mg.addColorStop(0, darkColor(cl, 15));
        mg.addColorStop(0.3, lightColor(cl, 15));
        mg.addColorStop(0.7, cl);
        mg.addColorStop(1, darkColor(cl, 10));
        cx.fillStyle = mg;
        cx.beginPath();
        cx.moveTo(-s * 0.15, s * 0.2); // bottom left
        cx.lineTo(-s * 0.12, -s * 0.15); // hip left
        cx.lineTo(-s * 0.18, -s * 0.35); // shoulder left
        cx.lineTo(-s * 0.08, -s * 0.45); // neck left
        cx.lineTo(s * 0.08, -s * 0.45); // neck right
        cx.lineTo(s * 0.18, -s * 0.35); // shoulder right
        cx.lineTo(s * 0.12, -s * 0.15); // hip right
        cx.lineTo(s * 0.15, s * 0.2); // bottom right
        cx.closePath();
        cx.fill();
        // Body outline
        cx.strokeStyle = darkColor(cl, 20); cx.lineWidth = 1.5;
        cx.stroke();
        // Head with gradient
        var mhg = cx.createRadialGradient(0, -s * 0.55, 0, 0, -s * 0.55, s * 0.1);
        mhg.addColorStop(0, lightColor(cl, 20));
        mhg.addColorStop(1, cl);
        cx.fillStyle = mhg;
        cx.beginPath();
        cx.arc(0, -s * 0.55, s * 0.1, 0, Math.PI * 2);
        cx.fill();
        cx.strokeStyle = darkColor(cl, 20); cx.lineWidth = 1.5;
        cx.stroke();
        // Arms with gradient
        cx.strokeStyle = cl; cx.lineWidth = s * 0.06;
        // Left arm
        cx.beginPath();
        cx.moveTo(-s * 0.18, -s * 0.35);
        cx.lineTo(-s * 0.25, -s * 0.1);
        cx.stroke();
        // Right arm
        cx.beginPath();
        cx.moveTo(s * 0.18, -s * 0.35);
        cx.lineTo(s * 0.25, -s * 0.1);
        cx.stroke();
        // Highlight on body
        cx.fillStyle = 'rgba(255,255,255,0.15)';
        cx.beginPath();
        cx.moveTo(-s * 0.1, s * 0.15);
        cx.lineTo(-s * 0.08, -s * 0.3);
        cx.lineTo(0, -s * 0.3);
        cx.lineTo(0, s * 0.15);
        cx.closePath();
        cx.fill();
        break;
      case 'smallGoal':
        var rp = resolvePerspective(el);
        var gv = rp.view;
        var prof = rp.profile || GoalVisualProfile;
        var ph = s * 1.4, pw = s * 1.05, pb = pw * (prof.perspectiveScale || 0.55), sc = prof.perspectiveScale || 0.65;
        cx.save(); cx.setLineDash([]); cx.lineCap = 'round'; cx.lineJoin = 'round';
        if (gv === 'back') {
          var bw2 = pw * 0.96, bh2 = ph * 0.46, tnY1 = -ph / 2, tnY2 = -bh2;
          // DESIGN-SYSTEM: consistent top-left lighting for frame
          cx.strokeStyle = cl + '30'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(-pw, tnY1); cx.lineTo(-pw, ph / 2); cx.stroke();
          cx.beginPath(); cx.moveTo(pw, tnY1); cx.lineTo(pw, ph / 2); cx.stroke();
          // Frame bar with gradient
          var fbg = cx.createLinearGradient(-pw, tnY1, pw, tnY1);
          fbg.addColorStop(0, lightColor(cl, 15)); fbg.addColorStop(0.5, cl); fbg.addColorStop(1, darkColor(cl, 10));
          cx.fillStyle = fbg; var fch2 = s * 0.07; cx.fillRect(-pw, tnY1 - fch2 / 2, 2 * pw, fch2);
          // Highlight on frame bar
          cx.fillStyle = 'rgba(255,255,255,0.25)';
          cx.fillRect(-pw, tnY1 - fch2 / 2, 2 * pw, fch2 * 0.3);
          for (var ti = 1; ti <= 4; ti++) { var tt = ti / 5, ty = tnY2 + (tnY1 - tnY2) * tt, tw = bw2 + (pw - bw2) * tt, sag = s * 0.02 * Math.sin(tt * Math.PI); cx.strokeStyle = 'rgba(255,255,255,0.5)'; cx.lineWidth = 0.7; cx.beginPath(); cx.moveTo(-tw + sag, ty); cx.lineTo(tw - sag, ty); cx.stroke(); }
          for (var tj = 0; tj <= 4; tj++) { var tr = tj / 4, txf = -bw2 + 2 * bw2 * tr, txp = -pw + 2 * pw * tr; cx.strokeStyle = 'rgba(255,255,255,0.4)'; cx.lineWidth = 0.6; cx.beginPath(); cx.moveTo(txf, tnY2); cx.lineTo(txp, tnY1); cx.stroke(); }
          cx.strokeStyle = 'rgba(255,255,255,0.6)'; cx.lineWidth = 0.8;
          for (var ni = 1; ni < 7; ni++) { var nt2 = ni / 7, ny2 = tnY2 + 2 * bh2 * nt2, sag2 = s * 0.05 * Math.sin(nt2 * Math.PI); cx.beginPath(); cx.moveTo(-bw2 + sag2, ny2); cx.lineTo(bw2 - sag2, ny2); cx.stroke(); }
          for (var nj = 1; nj < 6; nj++) { var nx2 = -bw2 + (2 * bw2 / 6) * nj; cx.beginPath(); cx.moveTo(nx2, tnY2); cx.lineTo(nx2, tnY2 + 2 * bh2); cx.stroke(); }
          var bpw2 = s * 0.08, bph2 = s * 0.07; cx.fillStyle = cl + '90'; cx.fillRect(-bw2 - bpw2 / 2, tnY2, bpw2, 2 * bh2); cx.fillRect(bw2 - bpw2 / 2, tnY2, bpw2, 2 * bh2); cx.fillRect(-bw2, tnY2 - bph2 / 2, 2 * bw2, bph2);
          cx.fillStyle = 'rgba(255,255,255,0.25)'; cx.fillRect(-bw2 - bpw2 / 2 + 1, tnY2 + 1, 2, 2 * bh2 - 2); cx.fillRect(bw2 - bpw2 / 2 - 1, tnY2 + 1, 2, 2 * bh2 - 2); cx.fillRect(-bw2 + 1, tnY2 - bph2 / 2 + 1, 2 * bw2 - 2, 2);
        } else if (gv === 'top') {
          // Improved top view with base, posts, and net
          var tW = pw, tD = pb * sc * 0.8;
          cx.fillStyle = 'rgba(255,255,255,0.04)'; cx.beginPath();
          cx.moveTo(-tW, 0); cx.lineTo(tW, 0); cx.lineTo(tW * 0.7, tD * 2); cx.lineTo(-tW * 0.7, tD * 2); cx.closePath(); cx.fill();
          // Bottom base
          cx.fillStyle = cl + '60'; cx.fillRect(-tW * 0.65, tD * 1.6, tW * 1.3, s * 0.08);
          cx.strokeStyle = cl + '80'; cx.lineWidth = 1.5; cx.strokeRect(-tW * 0.65, tD * 1.6, tW * 1.3, s * 0.08);
          // Side posts
          cx.strokeStyle = cl; cx.lineWidth = 3;
          cx.beginPath(); cx.moveTo(-tW, 0); cx.lineTo(-tW, tD * 1.6); cx.stroke();
          cx.beginPath(); cx.moveTo(tW, 0); cx.lineTo(tW, tD * 1.6); cx.stroke();
          // Crossbar
          cx.beginPath(); cx.moveTo(-tW, 0); cx.lineTo(tW, 0); cx.stroke();
          // Back posts
          cx.strokeStyle = cl + '60'; cx.lineWidth = 2;
          cx.beginPath(); cx.moveTo(-tW * 0.7, tD * 2); cx.lineTo(-tW * 0.7, tD * 1.6); cx.stroke();
          cx.beginPath(); cx.moveTo(tW * 0.7, tD * 2); cx.lineTo(tW * 0.7, tD * 1.6); cx.stroke();
          cx.beginPath(); cx.moveTo(-tW * 0.7, tD * 2); cx.lineTo(tW * 0.7, tD * 2); cx.stroke();
          // Net lines
          cx.strokeStyle = 'rgba(255,255,255,0.2)'; cx.lineWidth = 0.5;
          for (var mi2 = 1; mi2 < 8; mi2++) { var my2 = 0 + (tD * 2 / 8) * mi2; var mw2 = tW - (tW - tW * 0.7) * (mi2 / 8); cx.beginPath(); cx.moveTo(-mw2, my2); cx.lineTo(mw2, my2); cx.stroke(); }
          for (var mj2 = 1; mj2 < 6; mj2++) { var mjf = mj2 / 6; var jx1 = -tW + tW * 2 * mjf, jx2 = -tW * 0.7 + tW * 1.4 * mjf; cx.beginPath(); cx.moveTo(jx1, 0); cx.lineTo(jx2, tD * 2); cx.stroke(); }
          // Top highlight
          cx.strokeStyle = cl; cx.lineWidth = 5;
          cx.beginPath(); cx.moveTo(-tW, 0); cx.lineTo(tW, 0); cx.stroke();
          cx.strokeStyle = 'rgba(255,255,255,0.4)'; cx.lineWidth = 1.5;
          cx.beginPath(); cx.moveTo(-tW + 3, 3); cx.lineTo(tW - 3, 3); cx.stroke();
        } else if (gv === 'persp') {
          // Perspective view: front is large, back recedes into screen (smaller)
          var fw = prof.frameWidth || 5.5;
          var fhl = prof.frameHighlight || 1.5;
          var nc = prof.netColor || 'rgba(255,255,255,0.25)';
          var nlw = prof.netLineWidth || 0.5;
          // Back bar is 90% of front width (subtle depth)
          var bw3 = pw * 0.90;
          var bh3 = ph * 0.85;
          // Back bar shifted up to simulate depth going INTO screen
          var depthY = -ph * 0.08;
          // --- Ground shadow (subtle) ---
          cx.fillStyle = 'rgba(0,0,0,0.06)';
          cx.beginPath();
          cx.moveTo(-pw, ph * 0.5);
          cx.lineTo(pw, ph * 0.5);
          cx.lineTo(bw3, ph * 0.5 + depthY + bh3 * 0.5);
          cx.lineTo(-bw3, ph * 0.5 + depthY + bh3 * 0.5);
          cx.closePath();
          cx.fill();
          // --- Back frame (smaller, further away) ---
          cx.strokeStyle = cl + '60';
          cx.lineWidth = fw * 0.6;
          cx.beginPath(); cx.moveTo(-bw3, depthY - bh3 / 2); cx.lineTo(-bw3, depthY + bh3 / 2); cx.stroke();
          cx.beginPath(); cx.moveTo(bw3, depthY - bh3 / 2); cx.lineTo(bw3, depthY + bh3 / 2); cx.stroke();
          cx.beginPath(); cx.moveTo(-bw3, depthY - bh3 / 2); cx.lineTo(bw3, depthY - bh3 / 2); cx.stroke();
          // --- Net (perspective trapezoid) ---
          cx.strokeStyle = nc; cx.lineWidth = nlw;
          for (var pi = 1; pi < 7; pi++) {
            var pct = pi / 7;
            var ny3 = -ph / 2 + ph * pct;
            var nw3 = pw + (bw3 - pw) * pct;
            cx.beginPath(); cx.moveTo(-nw3, ny3 + depthY * pct); cx.lineTo(nw3, ny3 + depthY * pct); cx.stroke();
          }
          for (var pj = 1; pj < 6; pj++) {
            var pctj = pj / 6;
            var nxTop = -pw + pw * 2 * pctj;
            var nxBot = -bw3 + bw3 * 2 * pctj;
            cx.beginPath(); cx.moveTo(nxTop, -ph / 2); cx.lineTo(nxBot, depthY - bh3 / 2); cx.stroke();
          }
          // --- Side depth panels ---
          cx.fillStyle = cl + '08';
          cx.beginPath();
          cx.moveTo(-pw, -ph / 2); cx.lineTo(-bw3, depthY - bh3 / 2);
          cx.lineTo(-bw3, depthY + bh3 / 2); cx.lineTo(-pw, ph / 2);
          cx.closePath(); cx.fill();
          cx.beginPath();
          cx.moveTo(pw, -ph / 2); cx.lineTo(bw3, depthY - bh3 / 2);
          cx.lineTo(bw3, depthY + bh3 / 2); cx.lineTo(pw, ph / 2);
          cx.closePath(); cx.fill();
          // --- Front frame (large, closest) ---
          cx.strokeStyle = cl; cx.lineWidth = fw;
          cx.beginPath(); cx.moveTo(-pw, -ph / 2); cx.lineTo(-pw, ph / 2); cx.stroke();
          cx.beginPath(); cx.moveTo(pw, -ph / 2); cx.lineTo(pw, ph / 2); cx.stroke();
          cx.beginPath(); cx.moveTo(-pw, -ph / 2); cx.lineTo(pw, -ph / 2); cx.stroke();
          cx.strokeStyle = 'rgba(255,255,255,0.35)'; cx.lineWidth = fhl;
          cx.beginPath(); cx.moveTo(-pw + 3, -ph / 2 + 3); cx.lineTo(-pw + 3, ph / 2 - 3); cx.stroke();
          cx.beginPath(); cx.moveTo(pw - 3, -ph / 2 + 3); cx.lineTo(pw - 3, ph / 2 - 3); cx.stroke();
        } else {
          // Front/Left/Right view — use profile for frame and net
          var fw = prof.frameWidth || 5.5;
          var fhl = prof.frameHighlight || 1.5;
          var nc = prof.netColor || 'rgba(255,255,255,0.25)';
          var nlw = prof.netLineWidth || 0.5;
          // Back depth posts
          cx.strokeStyle = cl + '40'; cx.lineWidth = 1;
          cx.beginPath(); cx.moveTo(-pb * sc, -ph * sc / 2); cx.lineTo(-pb * sc, ph * sc / 2); cx.stroke();
          cx.beginPath(); cx.moveTo(pb * sc, -ph * sc / 2); cx.lineTo(pb * sc, ph * sc / 2); cx.stroke();
          cx.beginPath(); cx.moveTo(-pb * sc, -ph * sc / 2); cx.lineTo(pb * sc, -ph * sc / 2); cx.stroke();
          // Net horizontal lines
          cx.strokeStyle = nc; cx.lineWidth = nlw;
          for (var mi = 1; mi < 7; mi++) { var my = -ph / 2 + (ph / 7) * mi; cx.beginPath(); cx.moveTo(-pw, my); cx.lineTo(pw, my); cx.stroke(); }
          // Net vertical lines
          for (var mj = 1; mj < 6; mj++) { var mx = -pw + (pw * 2 / 6) * mj; cx.beginPath(); cx.moveTo(mx, -ph / 2); cx.lineTo(mx, ph / 2); cx.stroke(); }
          // Side net perspective lines
          cx.strokeStyle = 'rgba(255,255,255,0.25)'; cx.lineWidth = 0.4;
          for (var si2 = 1; si2 < 5; si2++) { var st2 = si2 / 5, fy2 = -ph / 2 + ph * st2, by2 = -ph * sc / 2 + ph * sc * st2; cx.beginPath(); cx.moveTo(-pw, fy2); cx.lineTo(-pb * sc, by2); cx.stroke(); cx.beginPath(); cx.moveTo(pw, fy2); cx.lineTo(pb * sc, by2); cx.stroke(); }
          for (var ti2 = 1; ti2 < 4; ti2++) { var tt2 = ti2 / 4, ft2 = -pw + (-pw + pb * sc) * tt2; cx.beginPath(); cx.moveTo(ft2, -ph / 2); cx.lineTo(ft2 - (pw - pb * sc) / 4, -ph * sc / 2); cx.stroke(); }
          // Depth frame connections
          cx.strokeStyle = cl + '50'; cx.lineWidth = 1; cx.beginPath(); cx.moveTo(-pw, -ph / 2); cx.lineTo(-pb * sc, -ph * sc / 2); cx.stroke();
          cx.beginPath(); cx.moveTo(pw, -ph / 2); cx.lineTo(pb * sc, -ph * sc / 2); cx.stroke(); cx.beginPath(); cx.moveTo(-pw, ph / 2); cx.lineTo(-pb * sc, ph * sc / 2); cx.stroke();
          cx.beginPath(); cx.moveTo(pw, ph / 2); cx.lineTo(pb * sc, ph * sc / 2); cx.stroke();
          // Main frame (uses profile frameWidth)
          cx.strokeStyle = cl; cx.lineWidth = fw; cx.beginPath(); cx.moveTo(-pw, -ph / 2); cx.lineTo(-pw, ph / 2); cx.stroke();
          cx.beginPath(); cx.moveTo(pw, -ph / 2); cx.lineTo(pw, ph / 2); cx.stroke(); cx.beginPath(); cx.moveTo(-pw, -ph / 2); cx.lineTo(pw, -ph / 2); cx.stroke();
          // Frame highlight (uses profile frameHighlight)
          cx.strokeStyle = 'rgba(255,255,255,0.35)'; cx.lineWidth = fhl; cx.beginPath(); cx.moveTo(-pw + 3, -ph / 2 + 3); cx.lineTo(-pw + 3, ph / 2 - 3); cx.stroke();
          cx.beginPath(); cx.moveTo(pw - 3, -ph / 2 + 3); cx.lineTo(pw - 3, ph / 2 - 3); cx.stroke();
        }
        cx.restore();
        break;
      case 'flag':
        // Phase F: Parametric flag with poleHeight, flagSize
        var fpH = (el.flagPoleHeight || 1.0) * s;
        var fs = (el.flagSize || 1.0) * s;
        // Pole with gradient
        var pg = cx.createLinearGradient(0, fpH, 0, -fpH);
        pg.addColorStop(0, '#555'); pg.addColorStop(0.5, '#888'); pg.addColorStop(1, '#666');
        cx.strokeStyle = pg; cx.lineWidth = 2; cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(0, fpH * 0.5); cx.lineTo(0, -fpH * 0.5); cx.stroke();
        // Pole highlight
        cx.strokeStyle = 'rgba(255,255,255,0.25)'; cx.lineWidth = 0.8;
        cx.beginPath(); cx.moveTo(-0.5, fpH * 0.5); cx.lineTo(-0.5, -fpH * 0.5); cx.stroke();
        // Flag cloth with gradient
        var fg = cx.createLinearGradient(0, -fpH * 0.5, 0, -fpH * 0.5 + fs * 0.4);
        fg.addColorStop(0, lightColor(cl, 25)); fg.addColorStop(0.5, cl); fg.addColorStop(1, darkColor(cl, 15));
        cx.fillStyle = fg;
        cx.beginPath();
        cx.moveTo(0, -fpH * 0.5);
        cx.lineTo(fs * 0.6, -fpH * 0.5 + fs * 0.15);
        cx.lineTo(fs * 0.5, -fpH * 0.5 + fs * 0.3);
        cx.lineTo(0, -fpH * 0.5 + fs * 0.4);
        cx.closePath();
        cx.fill();
        // Cloth outline
        cx.strokeStyle = darkColor(cl, 20); cx.lineWidth = 0.5; cx.stroke();
        // Cloth fold lines
        cx.strokeStyle = 'rgba(255,255,255,0.2)'; cx.lineWidth = 0.5;
        cx.beginPath();
        cx.moveTo(fs * 0.1, -fpH * 0.5 + fs * 0.05);
        cx.quadraticCurveTo(fs * 0.3, -fpH * 0.5 + fs * 0.15, fs * 0.15, -fpH * 0.5 + fs * 0.35);
        cx.stroke();
        break;
      case 'ladder':
        // Phase F: Parametric ladder with rungs, width
        var lw2 = (el.ladderWidth || 1.0) * s * 1.2;
        var lh = s * 3.5;
        var rungs = el.ladderRungs || 9;
        // DESIGN-SYSTEM: gradient rails with outline
        var lg = cx.createLinearGradient(0, -lh / 2, 0, lh / 2);
        lg.addColorStop(0, lightColor(cl, 15));
        lg.addColorStop(1, darkColor(cl, 10));
        cx.strokeStyle = lg; cx.lineCap = 'butt';
        // Side rails
        cx.lineWidth = 2;
        cx.beginPath(); cx.moveTo(-lw2 / 2, -lh / 2); cx.lineTo(-lw2 / 2, lh / 2); cx.stroke();
        cx.beginPath(); cx.moveTo(lw2 / 2, -lh / 2); cx.lineTo(lw2 / 2, lh / 2); cx.stroke();
        // Outline rails
        cx.strokeStyle = darkColor(cl, 15); cx.lineWidth = 0.4;
        cx.beginPath(); cx.moveTo(-lw2 / 2, -lh / 2); cx.lineTo(-lw2 / 2, lh / 2); cx.stroke();
        cx.beginPath(); cx.moveTo(lw2 / 2, -lh / 2); cx.lineTo(lw2 / 2, lh / 2); cx.stroke();
        // Rungs (parametric count)
        cx.strokeStyle = cl; cx.lineWidth = 1.5;
        for (var j = 0; j < rungs; j++) { cx.beginPath(); cx.moveTo(-lw2 / 2, -lh / 2 + (lh / (rungs - 1)) * j); cx.lineTo(lw2 / 2, -lh / 2 + (lh / (rungs - 1)) * j); cx.stroke(); }
        break;
      case 'stick':
        var baseCl = el.stickBaseColor || '#333333';
        // DESIGN-SYSTEM: gradient pole with highlight
        var sg = cx.createLinearGradient(-s * 0.08, 0, s * 0.08, 0);
        sg.addColorStop(0, darkColor(cl, 10));
        sg.addColorStop(0.3, lightColor(cl, 20));
        sg.addColorStop(0.7, cl);
        sg.addColorStop(1, darkColor(cl, 15));
        cx.strokeStyle = sg; cx.lineWidth = s * 0.18; cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(0, -s * 1.6); cx.lineTo(0, s * 0.04); cx.stroke();
        // Highlight stripe
        cx.strokeStyle = 'rgba(255,255,255,0.25)'; cx.lineWidth = s * 0.04;
        cx.beginPath(); cx.moveTo(-s * 0.02, -s * 1.5); cx.lineTo(-s * 0.02, s * 0.02); cx.stroke();
        // Base with gradient
        var sbg = cx.createLinearGradient(0, s * 0.08, 0, s * 0.32);
        sbg.addColorStop(0, lightColor(baseCl, 10));
        sbg.addColorStop(1, darkColor(baseCl, 10));
        cx.fillStyle = sbg; cx.beginPath();
        cx.moveTo(-s * 0.26, s * 0.32); cx.lineTo(-s * 0.1, s * 0.08);
        cx.quadraticCurveTo(0, -s * 0.01, s * 0.1, s * 0.08);
        cx.lineTo(s * 0.26, s * 0.32);
        cx.closePath(); cx.fill();
        cx.strokeStyle = darkColor(baseCl, 12); cx.lineWidth = 0.4; cx.stroke();
        break;
      case 'bib':
        var bg = cx.createLinearGradient(0, -s * 0.9, 0, s * 0.9);
        bg.addColorStop(0, lightColor(cl, 15)); bg.addColorStop(1, darkColor(cl, 10));
        cx.fillStyle = bg; cx.beginPath();
        cx.moveTo(-s * 0.5, -s * 0.9); cx.lineTo(s * 0.5, -s * 0.9);
        cx.quadraticCurveTo(s * 0.55, -s * 0.4, s * 0.5, 0);
        cx.lineTo(s * 0.3, s * 0.9); cx.lineTo(-s * 0.3, s * 0.9);
        cx.lineTo(-s * 0.5, 0);
        cx.quadraticCurveTo(-s * 0.55, -s * 0.4, -s * 0.5, -s * 0.9);
        cx.closePath(); cx.fill();
        cx.strokeStyle = 'rgba(255,255,255,0.3)'; cx.lineWidth = 1; cx.stroke();
        // Neck/arm holes
        cx.fillStyle = 'rgba(0,0,0,0.1)';
        cx.beginPath(); cx.ellipse(-s * 0.2, -s * 0.25, s * 0.12, s * 0.08, -0.3, 0, Math.PI * 2); cx.fill();
        cx.beginPath(); cx.ellipse(s * 0.2, -s * 0.25, s * 0.12, s * 0.08, 0.3, 0, Math.PI * 2); cx.fill();
        // Number placeholder
        if (el.color) {
          cx.fillStyle = '#ffffff40'; cx.font = 'bold '+(s*0.35)+'px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'middle';
          cx.fillText((el.bibNum||''), 0, s * 0.2);
        }
        break;
      case 'reboundBoard':
        var rAngle = (el.reboundAngle || 0) * Math.PI / 180;
        cx.save(); cx.translate(s * 0.3, 0); cx.rotate(rAngle);
        var rw = s * 0.6, rh = s * 1.6;
        var rg = cx.createLinearGradient(0, -rh/2, 0, rh/2);
        rg.addColorStop(0, lightColor(cl, 30)); rg.addColorStop(1, darkColor(cl, 20));
        cx.fillStyle = rg; cx.fillRect(-rw/2, -rh/2, rw, rh);
        cx.strokeStyle = 'rgba(255,255,255,0.4)'; cx.lineWidth = 1; cx.strokeRect(-rw/2, -rh/2, rw, rh);
        // Support leg
        cx.strokeStyle = darkColor(cl, 30); cx.lineWidth = 2.5; cx.lineCap = 'round';
        cx.beginPath(); cx.moveTo(-rw/2, rh/2); cx.lineTo(-rw/2 - s * 0.35, rh/2 + s * 0.2); cx.stroke();
        cx.beginPath(); cx.moveTo(rw/2, rh/2); cx.lineTo(rw/2 + s * 0.35, rh/2 + s * 0.2); cx.stroke();
        cx.restore();
        break;
    }
    cx.globalAlpha = 1;
    cx.restore();
  }
});
