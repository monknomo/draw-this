# Human Test Plan: TypeScript Migration

**Plan:** `docs/implementation-plans/2026-03-23-typescript-migration/`
**Coverage:** PASS — All 18 automatable acceptance criteria covered by 52 passing tests.

---

## Prerequisites

- Node.js with npm installed
- Run `npm install` in the project root
- Run `npm run build` to generate `script.js` from TypeScript source
- Run `npm run check` — all 52 tests pass, `tsc --noEmit` exits 0
- A modern browser (Chrome, Firefox, or Safari)

---

## Phase 1: Build Output Verification (AC5)

| Step | Action | Expected |
|------|--------|----------|
| 1.1 | Run `npm run typecheck` | Exit code 0, no type errors printed |
| 1.2 | Run `npm run build` then `ls -la script.js` | `script.js` exists in the project root |
| 1.3 | Open `script.js` in an editor. Search for lines starting with `import ` or `export ` | Zero matches — no ES module syntax present |
| 1.4 | Search `script.js` for `define(`, `module.exports`, `System.register` | Zero matches — no AMD/CJS/SystemJS wrappers |
| 1.5 | Run `git diff HEAD -- index.html style.css` | Empty output — neither file was modified by the migration |

---

## Phase 2: Core Drawing Tools

| Step | Action | Expected |
|------|--------|----------|
| 2.1 | Open `index.html` in a browser via file:// protocol | Page loads with a canvas area, toolbar at top, color swatches at bottom |
| 2.2 | Click the pencil tool button (should be selected by default). Click and drag on the canvas | A smooth continuous line appears in black (default color), following the mouse/finger path |
| 2.3 | Click the drips tool button. Click and drag on the canvas | Irregular filled circles of varying sizes appear scattered along the drag path. Some gaps are expected (zero-size drips are by design) |
| 2.4 | Click the stamp tool button. Verify the stamp chooser panel appears. Click a stamp (e.g., "horse"). Click on the canvas | A 50×50 pixel stamp image appears at the exact click point, colored in the currently selected color |
| 2.5 | Click the bubbles tool button. Click on the canvas | 0 to 30 bubble images scatter around the click point. Results vary per click due to randomness |
| 2.6 | Click the eraser tool button. Draw over existing content on the canvas | A white stroke covers existing content. The eraser "paints white" rather than restoring transparency |

---

## Phase 3: State Management

| Step | Action | Expected |
|------|--------|----------|
| 3.1 | Draw a line with pencil. Click the oops (undo) button | The last stroke disappears. The canvas reverts to its state before the stroke |
| 3.2 | Draw multiple strokes. Click oops repeatedly | Each click removes one stroke, in reverse order |
| 3.3 | Draw something on the canvas. Click the nuke (clear/tornado) button | The entire canvas is cleared to white |
| 3.4 | Click nuke, then click oops | Nothing happens — nuke does not push to the undo stack, so it cannot be undone. This is a known limitation |

---

## Phase 4: Color and Stamp Selection

| Step | Action | Expected |
|------|--------|----------|
| 4.1 | Click the "red" color swatch at the bottom of the page | The red swatch appears selected (visual indicator) |
| 4.2 | With red selected, draw with pencil on the canvas | Lines appear in red |
| 4.3 | Click "blue", then draw with drips | Drip circles appear in blue |
| 4.4 | Click "green", select the stamp tool, click on canvas | Stamp appears rendered in green |
| 4.5 | Click each remaining color swatch one at a time, draw a short stroke with each | Each stroke uses the newly selected color. All color swatches are functional |
| 4.6 | Select the stamp tool. Click different stamps in the stamp chooser | The stamp preview/selection changes. Clicking the canvas places the newly selected stamp |

---

## Phase 5: Sound Effects

| Step | Action | Expected |
|------|--------|----------|
| 5.1 | Select pencil and draw on the canvas | Pencil sound effect plays while drawing, stops when you release |
| 5.2 | Select drips and draw on the canvas | Dripping sound effect plays while drawing, stops on release |
| 5.3 | Select stamp and click on the canvas | Stamp sound effect plays on click |
| 5.4 | Select eraser and draw on the canvas | Eraser sound effect plays while erasing, stops on release |
| 5.5 | Click the oops button | Oops sound effect plays |
| 5.6 | Click the nuke button | Tornado sound effect plays |

---

## Phase 6: Window Resize

| Step | Action | Expected |
|------|--------|----------|
| 6.1 | Resize the browser window while the page is open | Canvas resizes to fill available space between header and footer. Existing content may be lost on resize (known behavior) |

---

## End-to-End: Full Drawing Session

**Purpose:** Validate that a complete user workflow works identically to the pre-migration `script.js`.

**Steps:**
1. Open `index.html` in the browser
2. Draw a red line with the pencil tool
3. Switch to blue, draw drips
4. Switch to green, select the horse stamp, click three times on the canvas
5. Click oops three times — the three stamps should disappear one at a time (undo is per-mouseup)
6. Switch to eraser, erase part of the blue drips
7. Click nuke — canvas clears completely
8. Select bubbles, click on the canvas — bubbles appear
9. Verify all sounds played at appropriate moments during the session

**Pass criteria:** Behavior is indistinguishable from loading the original pre-migration `script.js`.

---

## End-to-End: Build Artifact Integrity

**Purpose:** Confirm the esbuild output is a drop-in replacement for the hand-written `script.js`.

**Steps:**
1. Run `npm run build`
2. Open `index.html` — the `<script src="script.js">` tag loads the built artifact
3. Open browser DevTools console. Type `tools` and press Enter — the tools registry object is accessible on the global scope
4. Type `drawHorse` — the main state object is accessible globally
5. Type `playSound` and `pauseSound` — both are accessible as global functions
6. Verify no console errors appear during any drawing operations

---

## Human Verification Required

These items require manual testing because automated tests cannot cover them:

| Criterion | Why Manual | Steps |
|-----------|-----------|-------|
| Visual rendering fidelity | Tests verify API calls were made but cannot confirm pixels appear correctly on screen | Draw with each tool, compare visual output to pre-migration behavior |
| Sound playback | jsdom audio elements do not produce actual audio output | Perform drawing actions in Phase 5, confirm audio plays from speakers |
| Canvas resize behavior | Requires real browser viewport changes | Resize browser window per Phase 6, verify canvas adjusts |
| Touch input | Tests use MouseEvent only; touch requires real device or emulation | On a touch device or using Chrome DevTools touch emulation, draw with finger/stylus |
| Stamp SVG rendering with color fill | Tests verify `drawImage` is called but not that `%%%%` placeholder replacement produces correct colored output | Select different colors, place stamps, verify stamps render in the selected color |

---

## Traceability

| Acceptance Criterion | Automated Test | Manual Step |
|----------------------|----------------|-------------|
| AC1.1: pencil draw calls | `canvas-draw-calls.test.ts` "pencil (AC1.1)" | Phase 2, Step 2.2 |
| AC1.2: eraser white strokeStyle | `canvas-draw-calls.test.ts` "eraser (AC1.2)" | Phase 2, Step 2.6 |
| AC1.3: drips arc/fill | `canvas-draw-calls.test.ts` "drips (AC1.3)" | Phase 2, Step 2.3 |
| AC1.4: stamp drawImage | `canvas-draw-calls.test.ts` "stamp (AC1.4)" | Phase 2, Step 2.4 |
| AC1.5: nuke clearRect | `canvas-draw-calls.test.ts` "nuke (AC1.5)" | Phase 3, Step 3.3 |
| AC1.6: oops putImageData | `undo.test.ts` "AC1.6" | Phase 3, Step 3.1 |
| AC1.7: endPosition pushes undo | `state.test.ts` "AC1.7" | Phase 3, Step 3.2 |
| AC1.8: color selection | `state.test.ts` "AC1.8" | Phase 4, Steps 4.1–4.5 |
| AC1.9: stamp selection | `state.test.ts` "AC1.9" | Phase 4, Step 4.6 |
| AC2.1: playSound calls play | `sounds.test.ts` "AC2.1" | Phase 5, Steps 5.1–5.6 |
| AC2.2: playSound loop | `sounds.test.ts` "AC2.2" | Phase 5, Steps 5.1–5.4 |
| AC2.3: pauseSound calls pause | `sounds.test.ts` "AC2.3" | Phase 5, Steps 5.1–5.4 |
| AC2.4: pauseSound currentTime | `sounds.test.ts` "AC2.4" | Phase 5, Steps 5.1–5.4 |
| AC2.5: pauseSound clears loop | `sounds.test.ts` "AC2.5" | Phase 5, Steps 5.1–5.4 |
| AC3.1: tool interface functions | `tool-interface.test.ts` "AC3.1" | Covered by all Phase 2 steps |
| AC3.2: tool interface booleans | `tool-interface.test.ts` "AC3.2" | Covered by all Phase 2 steps |
| AC3.3: oops/nuke non-selectable | `tool-interface.test.ts` "AC3.3" | Phase 3, Steps 3.1, 3.3 |
| AC3.4: stamp/bubbles drawsImmediately | `tool-interface.test.ts` "AC3.4" | Phase 2, Steps 2.4, 2.5 |
| AC4.1: getDripSize zero distribution | `drips.test.ts` "AC4.1" | Phase 2, Step 2.3 |
| AC4.2: getDripSize no invalid values | `drips.test.ts` "AC4.2" | Phase 2, Step 2.3 |
| AC4.3: hex/rgb round-trip | `bucket-helpers.test.ts` "AC4.3" | N/A (bucket button hidden) |
| AC4.4: standardizeColor | `bucket-helpers.test.ts` "AC4.4" | N/A (bucket button hidden) |
| AC5.1: tsc exits 0 | CI: `npm run typecheck` | Phase 1, Step 1.1 |
| AC5.2: esbuild produces script.js | CI: `npm run build` | Phase 1, Step 1.2 |
| AC5.3: no ES module syntax | CI: grep check | Phase 1, Step 1.3 |
| AC5.4: no AMD/CJS wrappers | CI: grep check | Phase 1, Step 1.4 |
| AC5.5: index.html/style.css unchanged | CI: git diff | Phase 1, Step 1.5 |
