# Keyboard Trace — Sprint 0.79.09-A

## Trace Methodology

Each shortcut traced through:
1. Physical key press → DOM event
2. `_detectKbd` listener (index.html:614)
3. Main `keydown` listener (index.html:631)
4. Guard clauses
5. Handler function
6. Final action + render

---

## Trace 1: Ctrl+A (Select All)

### QWERTY Layout (default)

| Step | Component | Action |
|------|-----------|--------|
| 0 | Physical key | Key labeled **A** at home-row left |
| 1 | Browser | `keydown` event: `{code:'KeyA', ctrlKey:true, shiftKey:false, key:'a'}` |
| 2 | `_detectKbd` (L614) | `e.ctrlKey` → skip (no detection on Ctrl) |
| 3 | Main listener (L631) | Fires |
| 4 | Guard: tagName (L632) | `INPUT\|TEXTAREA\|SELECT` → passes (not in input) |
| 5 | Guard: modal | ❌ **MISSING** — no modal check |
| 6 | `c='KeyA', ctrl=true, shift=false` | `isAz=false`, `aCode='KeyA'` |
| 7 | Non-Ctrl block (L647) | `!ctrl` = false → skip |
| 8 | Ctrl block (L662) | `ctrl` = true → enter |
| 9 | `c===aCode` (L666) | `'KeyA' === 'KeyA'` → **true** ✅ |
| 10 | `e.preventDefault()` | Executed ✅ |
| 11 | `selectAllEls()` | Called (script.js:1023) |
| 12 | `selIds.clear()` | Clears current selection |
| 13 | `els.forEach(...)` | Adds all visible+unlocked elements to selIds |
| 14 | `updateProps()` | Refreshes properties panel |
| 15 | `updateLayers()` | Refreshes layers panel |
| 16 | `Engine.reqRender()` | Schedules canvas redraw |
| 17 | `return` (L666) | Stops handler ✅ |
| 18 | No `stopPropagation()` | Event bubbles to document |
| **Result** | ✅ | All elements selected |

### AZERTY Layout (detected)

| Step | Component | Action |
|------|-----------|--------|
| 0 | Physical key | Key labeled **A** at top-row left (physical KeyQ) |
| 1 | Browser | `keydown`: `{code:'KeyQ', ctrlKey:true, key:'q'}` |
| 2 | `_detectKbd` | Ctrl → skip |
| 3 | Main listener | `_azerty=true`, `isAz=true` |
| 4 | `aCode` | `'KeyQ'` (swapped for AZERTY) |
| 5 | `c===aCode` | `'KeyQ' === 'KeyQ'` → **true** ✅ |
| **Result** | ✅ | Select All on layout-aware key |

---

## Trace 2: Ctrl+Q (Toggle Sidebars)

### QWERTY Layout (default)

| Step | Component | Action |
|------|-----------|--------|
| 0 | Physical key | Key labeled **Q** at top-row left |
| 1 | Browser | `keydown`: `{code:'KeyQ', ctrlKey:true, shiftKey:false, key:'q'}` |
| 2 | `_detectKbd` | Ctr → skip |
| 3 | Main listener | Fires |
| 4 | Guard: tagName | Passes |
| 5 | Guard: modal | ❌ **MISSING** |
| 6 | `isAz=false, qCode='KeyQ'` | |
| 7 | Ctrl block | `ctrl=true` → enter |
| 8 | `c===qCode && !shift` (L674) | `'KeyQ' === 'KeyQ'` → **true** ✅ |
| 9 | `e.preventDefault()` | Executed ✅ |
| 10 | `toggleFsSidebars()` | Called (script.js:145) |
| 11 | `_fsSidebarsVisible = !_fsSidebarsVisible` | Toggle state |
| 12 | `sidebarL.classList.toggle('fs-show', ...)` | Show/hide left sidebar |
| 13 | `sidebar-r.classList.toggle('fs-show', ...)` | Show/hide right sidebar |
| 14 | `setTimeout(setupCanvas, 310)` | Recalc canvas layout |
| 15 | `return` (L674) | Stops handler ✅ |
| **Result** | ✅ | Side panels toggle |

### AZERTY Layout

| Step | Component | Action |
|------|-----------|--------|
| 0 | Physical key | Key labeled **Q** at home-row left (physical KeyA) |
| 1 | Browser | `keydown`: `{code:'KeyA', ctrlKey:true, key:'a'}` |
| 2 | `_detectKbd` | Ctrl → skip |
| 3 | Main listener | `isAz=true, qCode='KeyA'` |
| 4 | `c===qCode` | `'KeyA' === 'KeyA'` → **true** ✅ |
| **Result** | ✅ | Side panels toggle on AZERTY |

---

## Trace 3: W (Move Tool)

### QWERTY Layout

| Step | Component | Action |
|------|-----------|--------|
| 0 | Physical key | Key labeled **W** at top-row position 2 |
| 1 | Browser | `keydown`: `{code:'KeyW', ctrlKey:false, shiftKey:false, key:'w'}` |
| 2 | `_detectKbd` | Not KeyQ/KeyA → skip |
| 3 | Main listener | Fires |
| 4 | Guard: tagName | Passes |
| 5 | Guard: modal | ❌ **MISSING** |
| 6 | `isAz=false, ctrl=false` | |
| 7 | Non-Ctrl block (L647) | `!ctrl` = true → enter |
| 8 | `c==='KeyW'` (L649) | `'KeyW' === 'KeyW'` → **true** ✅ |
| 9 | `e.preventDefault()` | Executed ✅ |
| 10 | `setTool('move')` | Called (script.js:920) |
| 11 | `tool = 'move'` | Tool state set |
| 12 | Toolbar UI toggle | `.icon-btn[data-tool=move]` gets `.on` class |
| 13 | Cursor set to `'grab'` | Visual feedback |
| 14 | Drawing state reset | `arrS, arrP, drawingArr, multiArrPoints, drawingFree, freePoints, drawingZone, zoneStart, zonePreview, linkStart, linkEnd, drawingLink, handleDrag` all cleared |
| 15 | `return` (L649) | Stops handler ✅ |
| **Result** | ✅ | Move tool activated, cursor = grab |

### AZERTY Layout

| Step | Component | Action |
|------|-----------|--------|
| 0 | Physical key | Key labeled **W** at bottom-row left (physical KeyZ) |
| 1 | Browser | `keydown`: `{code:'KeyZ', ctrlKey:false, key:'z'}` |
| 2 | Main listener | `isAz=true, ctrl=false` |
| 3 | Non-Ctrl block | `!ctrl` = true |
| 4 | `c==='KeyW'` | `'KeyZ' === 'KeyW'` → false |
| 5 | `isAz && c==='KeyZ'` | `true && true` → **true** ✅ |
| **Result** | ✅ | Move tool activated on AZERTY W-labeled key |

---

## Trace 4: Space (Save Scene) — Behind Modal

| Step | Component | Action |
|------|-----------|--------|
| 0 | Physical key | Space |
| 1 | Guard: modal | ❌ **MISSING** — shortcut fires behind modal |
| 2 | `if(c==='Space'&&!ctrl)` (L646) | → `saveStep()` |
| 3 | `e.preventDefault()` | Blocks page scroll |
| 4 | `saveStep()` | Pushes scene snapshot |
| 5 | `toast(t('scene_saved'))` | Shows toast BEHIND modal |
| **Risk** | 🔴 | User opens Team Manager → Space saves scene = data corruption |
| **Fix** | ✅ | Add `if (modal) return;` before any shortcut processing |

---

## Issues Found

| # | Issue | Location | Severity |
|---|-------|----------|----------|
| 1 | **No modal guard** — all shortcuts fire behind open dialogs | L631 before L639 | 🔴 Critical |
| 2 | **AZERTY detection** relies on first non-Ctrl keypress — edge case if Ctrl is pressed first | L614-630 | 🟠 Medium |
| 3 | **Space saves scene** even in modals | L646 | 🟠 Medium |
| 4 | **Shortcuts work after keyboard layout switch** — relies on _azerty being set correctly | L635-637 | 🟡 Low |
| 5 | **Only TWO listeners** (detect + main) — clean, no duplication | L614+L631 | ✅ Good |
| 6 | **All Ctrl shortcuts have `return`** — no fall-through | L663-674 | ✅ Good |
| 7 | **All handlers call Engine.reqRender()** or equivalent | Throughout | ✅ Good |
