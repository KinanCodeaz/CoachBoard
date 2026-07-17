# Keyboard Report — Sprint 0.79.09-A

## Root Cause

**No modal guard in the keyboard handler.**

All keyboard shortcuts fired unconditionally regardless of whether a modal/dialog was open. This caused:
- **Space** saved scenes behind Team Manager / Save / Load dialogs
- **V** changed tool behind modals
- **W** activated move tool behind modals
- **Ctrl+A** selected elements behind modals
- **Delete** removed elements behind modals

**Secondary issue:** `e.code` is based on US QWERTY physical key positions. On AZERTY keyboards, key labels differ from physical positions (e.g., labeled Q is at physical KeyA, labeled A is at physical KeyQ). Previous code had no layout detection.

---

## Files Modified

| File | Lines | Change |
|------|-------|--------|
| `index.html` | 634-636 | Added modal guard: `if(e.target.closest('.modal-overlay.show'))return;` |
| `index.html` | 612-642 | AZERTY detection: `_detectKbd` listener + `qCode`/`aCode` layout-aware mapping |
| `index.html` | 652 | AZERTY move tool: `isAz&&c==='KeyZ'` for W-labeled key on AZERTY |
| `index.html` | 666,669,677 | Layout-aware code checks: `aCode` for selectAll, `qCode` for toggleFsSidebars |
| `index.html` | 633-678 | All Ctrl shortcuts now have `return` — no fall-through |
| `index.html` | 679-684 | Arrow keys wrapped in `if(!ctrl)` |
| `js/shortcuts.js` | 1-4 | Replaced dead code with reference warning |
| `script.js` | 1040, 1165 | Updated stale comments about keyboard location |

---

## Functions Modified

### `index.html` — inline keyboard handler (lines 609-688)

| Function | Status | Description |
|----------|--------|-------------|
| `_detectKbd(e)` | ✅ Added | Auto-detects QWERTY vs AZERTY from first non-Ctrl letter press |
| Main `keydown` listener | ✅ Fixed | Layout-aware, modal-guarded, all shortcuts return |
| `openShortcuts()` | Unchanged | Opens shortcuts help modal |
| `closeShortcuts()` | Unchanged | Closes shortcuts help modal |

### `script.js` — supporting functions

| Function | Status | Description |
|----------|--------|-------------|
| `selectAllEls()` | Unchanged | Clears selection, selects all visible+unlocked |
| `setTool(tt)` | ✅ Already fixed | Resets all drawing state, sets cursor |
| `toggleFsSidebars()` | Unchanged | Toggles `.fs-show` class on both sidebars |
| `saveStep()` | Unchanged | Snaps current elements into steps array |

---

## Regression Test Results

Test environment: QWERTY layout (default), no modals open.

| Shortcut | Expected | Actual | Status |
|----------|----------|--------|--------|
| `Ctrl+A` | Select all elements | ✅ | |
| `Ctrl+Z` | Undo last action | ✅ | |
| `Ctrl+Y` | Redo last action | ✅ | |
| `Ctrl+C` | Copy selected | ✅ | |
| `Ctrl+V` | Paste clipboard | ✅ | |
| `Ctrl+Q` | Toggle side panels | ✅ | |
| `Delete` | Delete selected | ✅ | |
| `Space` | Save scene/step | ✅ | |
| `W` | Activate move/pan tool | ✅ | |
| `Escape` | Deselect, reset tool | ✅ | |
| `1`-`9` | Quick tools | ✅ | |
| `+` / `-` | Zoom in/out | ✅ | |
| `?` | Open shortcuts help | ✅ | |
| `Arrow keys` | Move selected element | ✅ | |
| `V` | Select tool | ✅ | |

### Modal guard tests

| Scenario | Shortcut | Expected | Status |
|----------|----------|----------|--------|
| Team Manager open | `Space` | Blocked (no scene save) | ✅ |
| Team Manager open | `V` | Blocked (no tool change) | ✅ |
| Team Manager open | `Delete` | Blocked (no deletion) | ✅ |
| Save dialog open | `Ctrl+A` | Blocked (no select all) | ✅ |
| Any modal open | `Escape` | Blocked (no canvas action) | ✅ |

---

## Remaining Keyboard Issues

| # | Issue | Severity | Notes |
|---|-------|----------|-------|
| 1 | **No Escape-to-close-modal** | 🟢 Low | User must click X or Cancel to close modals |
| 2 | **AZERTY detection delayed** | 🟢 Low | If first keypress is Ctrl+Q, detection hasn't run; defaults to QWERTY which is wrong for AZERTY. Corrects on next non-Ctrl press. |
| 3 | **No Enter-to-submit in modals** | 🟢 Low | Works natively for focused form elements inside modals |
| 4 | **_detectKbd could throw before main handler** | 🟢 Low | Simple logic; exception unlikely |
| 5 | **shortcuts.js still on disk** | 🟢 Low | Reference-only file; not loaded |

---

## Architecture Summary

```
keydown event
  │
  ├── _detectKbd (L614) — layout detection only
  │     └── Sets _azerty (null → true/false)
  │
  └── Main handler (L631)
        ├── TagName guard (INPUT/TEXTAREA/SELECT)
        ├── Modal guard (.modal-overlay.show)
        ├── Fallback layout detection (if _azerty===null)
        ├── Non-Ctrl shortcuts (V, W, 1-9, zoom, arrows)
        ├── Ctrl shortcuts (Z,Y,D,A,S,C,V,G,U,E,Q)
        └── Arrow keys (only when !ctrl)
```
