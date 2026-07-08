'use strict';
// CoachBoard Pro - Viewport State
// Wraps viewport globals for zoom, pan, 3D rotation.
var ViewportState = {
  get zoom() { return zoomLevel; },
  set zoom(v) { zoomLevel = v; },
  get panX() { return panX; },
  set panX(v) { panX = v; },
  get panY() { return panY; },
  set panY(v) { panY = v; },
  get pitch3d() { return pitch3d; },
  set pitch3d(v) { pitch3d = v; },
  get pitchRotX() { return pitchRotX; },
  set pitchRotX(v) { pitchRotX = v; },
  get pitchRotY() { return pitchRotY; },
  set pitchRotY(v) { pitchRotY = v; },
  get pitchRotation() { return pitchRotation; },
  set pitchRotation(v) { pitchRotation = v; },
  get pitchOrientation() { return pitchOrientation; },
  set pitchOrientation(v) { pitchOrientation = v; },
  get directionOfPlay() { return directionOfPlay; },
  set directionOfPlay(v) { directionOfPlay = v; },

  get canvasWidth() { return W; },
  get canvasHeight() { return H; },
  get dpr() { return dpr; }
};
