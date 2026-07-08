'use strict';
// CoachBoard Pro - Selection State
// Wraps selection globals for selected IDs, rubber band state, drag state.
var SelectionState = {
  get selectedIds() { return selIds; },
  get selectedCount() { return selIds.size; },
  get rubberBanding() { return rubberBanding; },
  set rubberBanding(v) { rubberBanding = v; },
  get rbStart() { return rbStart; },
  set rbStart(v) { rbStart = v; },
  get dragging() { return dragging; },
  set dragging(v) { dragging = v; },
  get dragEl() { return dragEl; },
  set dragEl(v) { dragEl = v; },
  get dragOff() { return dragOff; },
  set dragOff(v) { dragOff = v; },
  get handleDrag() { return handleDrag; },
  set handleDrag(v) { handleDrag = v; },
  get draggingPoint() { return draggingPoint; },
  set draggingPoint(v) { draggingPoint = v; }
};
