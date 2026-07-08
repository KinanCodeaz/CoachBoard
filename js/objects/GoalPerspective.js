'use strict';
// CoachBoard Pro - Goal Perspective Resolver
// Reference implementation for the Perspective System.
//
// This resolver handles smallGoal elements.
// It determines which view to render based on rotation + viewMode,
// and returns a complete render data object including visual profile.
//
// Registration:
//   PerspectiveSystem.register('smallGoal', GoalPerspective);
//   PerspectiveSystem.registerProfile('smallGoal', GoalVisualProfile);

var GoalPerspective = {
  resolve: function(el) {
    var vm = el.viewMode || el.goalView || 'auto';
    var view;

    if (vm !== 'auto') {
      view = vm;
    } else {
      view = GoalPerspective._rotationToView(el.rotation || 0);
    }

    return {
      view: view,
      svg: 'goal-' + view,
      flip: false,
      shadow: el.castShadow !== false,
      depth: GoalPerspective._depthForView(view)
    };
  },

  _rotationToView: function(rot) {
    rot = ((rot % 360) + 360) % 360;
    if (rot < 45 || rot >= 315) return 'front';
    if (rot >= 45 && rot < 135) return 'right';
    if (rot >= 135 && rot < 225) return 'back';
    return 'left';
  },

  // Depth factor per view (for future 3D effects)
  _depthForView: function(view) {
    return { front: 1, back: 0.8, left: 0.9, right: 0.9, top: 0.6, bottom: 1 }[view] || 1;
  }
};

// Visual Profile for goals
// Defines HOW to render, not WHICH view to use.
var GoalVisualProfile = {
  // Frame
  frameWidth: 5.5,
  frameHighlight: 1.5,
  frameColor: 'inherit', // inherit from el.color

  // Net
  netVisible: true,
  netColor: 'rgba(255,255,255,0.25)',
  netLineWidth: 0.5,
  netSpacing: 6, // horizontal net lines count
  netVerticals: 5, // vertical net lines count

  // Back bar (depth posts)
  backBarVisible: true,
  backBarAlpha: 0.5,

  // Shadow
  shadowOffsetX: 3,
  shadowOffsetY: 5,
  shadowAlpha: 0.15,

  // Depth perspective
  perspectiveScale: 0.55, // back bar relative to front

  // Views that show net pattern
  netViews: ['front', 'back', 'left', 'right'],

  // Views that show depth perspective
  depthViews: ['front', 'back']
};

// Register with the Perspective System
PerspectiveSystem.register('smallGoal', GoalPerspective);
PerspectiveSystem.registerProfile('smallGoal', GoalVisualProfile);
