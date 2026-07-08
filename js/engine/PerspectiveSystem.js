'use strict';
// CoachBoard Pro - Perspective Rendering System v2
// Architecture: Registry + Per-Type Resolvers + Visual Profiles
//
// This system has 3 layers:
//
//   1. PerspectiveResolver — per-type logic that maps rotation → view
//   2. VisualProfile — defines HOW to render (SVG, shadows, net, frame)
//   3. PerspectiveSystem — central registry that orchestrates both
//
// Usage:
//   PerspectiveSystem.register('smallGoal', GoalPerspective);
//   var renderData = PerspectiveSystem.resolve(el);
//   // renderData = { view, svg, flip, shadow, depth, profile, ... }
//
// Backward compatibility:
//   Old elements with goalView property still work.
//   resolve() reads el.goalView as fallback.

var PerspectiveSystem = {
  // Extended view modes (superset of all possible views)
  VIEW_MODES: ['auto', 'front', 'back', 'left', 'right', 'top', 'bottom',
                'mirror', 'isometric', 'training', 'broadcast'],

  // Internal: registered resolvers per element type
  _resolvers: {},

  // Internal: registered visual profiles per element type
  _profiles: {},

  // --- Registry Methods ---

  // Register a perspective resolver for an element type.
  // resolver must implement: resolve(el) → { view, ... }
  register: function(type, resolver) {
    PerspectiveSystem._resolvers[type] = resolver;
  },

  // Register a visual profile for an element type.
  // profile is an object defining rendering parameters.
  registerProfile: function(type, profile) {
    PerspectiveSystem._profiles[type] = profile;
  },

  // Check if a type has a registered resolver.
  hasResolver: function(type) {
    return PerspectiveSystem._resolvers[type] !== undefined;
  },

  // --- Core Resolution ---

  // Resolve the full render data for an element.
  // Returns:
  //   {
  //     view:    'front'|'back'|'left'|'right'|'top'|'bottom'|'mirror'|etc,
  //     svg:     'goal-back' (optional SVG key),
  //     flip:    false (optional horizontal flip),
  //     shadow:  true  (optional shadow enabled),
  //     depth:   0.8   (optional depth/3D factor),
  //     profile: { ... } (optional visual profile)
  //   }
  //
  // Falls back to generic rotation-based resolution if no resolver registered.
  resolve: function(el) {
    var resolver = PerspectiveSystem._resolvers[el.type];
    var result;

    if (resolver) {
      result = resolver.resolve(el);
    } else {
      result = PerspectiveSystem._genericResolve(el);
    }

    // Attach visual profile if registered
    var profile = PerspectiveSystem._profiles[el.type];
    if (profile) {
      result.profile = profile;
    }

    return result;
  },

  // Get the visual profile for a type (if registered).
  getProfile: function(type) {
    return PerspectiveSystem._profiles[type] || null;
  },

  // --- Generic Fallback ---
  // Used when no type-specific resolver is registered.
  // Reads viewMode (or goalView for backward compat),
  // then resolves auto mode from rotation.

  _genericResolve: function(el) {
    var vm = el.viewMode || el.goalView || 'auto';
    var view;

    if (vm !== 'auto') {
      view = vm;
    } else {
      view = PerspectiveSystem._rotationToView(el.rotation || 0);
    }

    return {
      view: view,
      svg: null,
      flip: false,
      shadow: false,
      depth: 0
    };
  },

  // Map rotation angle to a view name.
  // Used by generic resolver and by type-specific resolvers.
  _rotationToView: function(rot) {
    rot = ((rot % 360) + 360) % 360;
    if (rot < 45 || rot >= 315) return 'front';
    if (rot >= 45 && rot < 135) return 'right';
    if (rot >= 135 && rot < 225) return 'back';
    return 'left';
  }
};

// --- Convenience global ---
function resolveView(el) {
  var result = PerspectiveSystem.resolve(el);
  return result.view;
}

// --- Full resolution (returns complete render data) ---
function resolvePerspective(el) {
  return PerspectiveSystem.resolve(el);
}
