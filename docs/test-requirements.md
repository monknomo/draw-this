# Test Requirements: TypeScript Migration

**Source:** `docs/design-plans/2026-03-23-typescript-migration.md`
**Generated:** 2026-03-24

This file maps each acceptance criterion to its automated test coverage and provides a manual verification checklist for criteria that cannot be fully automated.

---

## Automated Test Coverage

### AC1: Tool behaviors are preserved

| AC | Description | Test file | Test name pattern |
|----|-------------|-----------|-------------------|
| AC1.1 | pencil.draw() calls ctx.beginPath, moveTo, lineTo, stroke | `src/test/tools/canvas-draw-calls.test.ts` | "AC1.1: pencil draw calls" |
| AC1.2 | eraser.draw() uses strokeStyle = "white" | `src/test/tools/canvas-draw-calls.test.ts` | "AC1.2: eraser white" |
| AC1.3 | drips.draw() calls ctx.arc and ctx.fill | `src/test/tools/canvas-draw-calls.test.ts` | "AC1.3: drips arc/fill" |
| AC1.4 | stamp.draw() calls ctx.drawImage at click point | `src/test/tools/canvas-draw-calls.test.ts` | "AC1.4: stamp drawImage" |
| AC1.5 | nuke.onclick() calls ctx.clearRect on entire canvas | `src/test/tools/canvas-draw-calls.test.ts` | "AC1.5: nuke clearRect" |
| AC1.6 | oops.onclick() pops undoStack and calls ctx.putImageData | `src/test/drawHorse/undo.test.ts` | "AC1.6: oops putImageData" |
| AC1.7 | endPosition() pushes full canvas ImageData to undoStack | `src/test/drawHorse/state.test.ts` | "AC1.7: endPosition pushes" |
| AC1.8 | color button click sets drawHorse.selectedColor to button id | `src/test/drawHorse/state.test.ts` | "AC1.8: color selection" |
| AC1.9 | stamp choice click sets drawHorse.selectedStamp | `src/test/drawHorse/state.test.ts` | "AC1.9: stamp selection" |

**Baseline equivalents** (Phase 2, retired in Phase 6): `src/test/baseline/canvas-draw-calls.test.ts`, `src/test/baseline/undo.test.ts`, `src/test/baseline/color-selection.test.ts`, `src/test/baseline/stamp-selection.test.ts`

---

### AC2: Audio behaviors are preserved

| AC | Description | Test file | Test name pattern |
|----|-------------|-----------|-------------------|
| AC2.1 | playSound() calls audio.play() on correct element | `src/test/sounds.test.ts` | "AC2.1: playSound calls play" |
| AC2.2 | playSound() with loop=true sets audio.style.loop = "loop" | `src/test/sounds.test.ts` | "AC2.2: playSound loop" |
| AC2.3 | pauseSound() calls audio.pause() on correct element | `src/test/sounds.test.ts` | "AC2.3: pauseSound calls pause" |
| AC2.4 | pauseSound() resets audio.currentTime to 0 | `src/test/sounds.test.ts` | "AC2.4: pauseSound currentTime" |
| AC2.5 | pauseSound() sets audio.style.loop = "" | `src/test/sounds.test.ts` | "AC2.5: pauseSound clears loop" |

**Baseline equivalent** (Phase 2, retired in Phase 6): `src/test/baseline/sounds.test.ts`

---

### AC3: Tool plugin interface contract

| AC | Description | Test file | Test name pattern |
|----|-------------|-----------|-------------------|
| AC3.1 | every tool has draw, stopDrawing, onclick functions | `src/test/tools/tool-interface.test.ts` | "AC3.1: all tools have draw/stopDrawing/onclick" |
| AC3.2 | every tool has drawsImmediately and selectable booleans | `src/test/tools/tool-interface.test.ts` | "AC3.2: all tools have drawsImmediately/selectable" |
| AC3.3 | oops and nuke have selectable = false | `src/test/tools/tool-interface.test.ts` | "AC3.3: oops and nuke selectable=false" |
| AC3.4 | stamp and bubbles have drawsImmediately = true | `src/test/tools/tool-interface.test.ts` | "AC3.4: stamp and bubbles drawsImmediately=true" |

**Baseline equivalent** (Phase 2, retired in Phase 6): `src/test/baseline/tool-interface.test.ts`

---

### AC4: Pure logic correctness

| AC | Description | Test file | Test name pattern |
|----|-------------|-----------|-------------------|
| AC4.1 | getDripSize() returns 0 ~half the time across 200 calls | `src/test/tools/drips.test.ts` | "AC4.1: getDripSize zero distribution" |
| AC4.2 | getDripSize() never returns values between 1–5 | `src/test/tools/drips.test.ts` | "AC4.2: getDripSize no invalid values" |
| AC4.3 | hexToRgb() and rgbToHex() round-trip preserves color values | `src/test/bucket-helpers.test.ts` | "AC4.3: hexToRgb/rgbToHex round-trip" |
| AC4.4 | standardizeColor() converts CSS color names to RGB arrays | `src/test/bucket-helpers.test.ts` | "AC4.4: standardizeColor" |

**Notes:**
- AC4.1 and AC4.2 use import-based tests on the exported `getDripSize` function from `src/tools/drips.ts`. Baseline coverage in Phase 2 uses `__tools.drips.getDripSize()` indirectly.
- AC4.4 depends on vitest-canvas-mock providing real pixel values for named CSS colors. If the mock returns zeros for all colors, the test must be marked `.skip` with a note explaining the canvas mock limitation.

**Baseline equivalent** (Phase 2, retired in Phase 6): `src/test/baseline/drips.test.ts`, `src/test/baseline/bucket-helpers.test.ts`

---

### AC5: Build output is browser-clean

| AC | Description | Verification method |
|----|-------------|---------------------|
| AC5.1 | `tsc --noEmit` exits with 0 type errors | Automated: `npm run typecheck` (CI gate) |
| AC5.2 | esbuild produces a single `script.js` file | Automated: `ls script.js` after `npm run build` |
| AC5.3 | `script.js` contains no ES module syntax (import/export) | Automated: `grep -c "^import\|^export" script.js` → 0 |
| AC5.4 | `script.js` contains no AMD/CJS/SystemJS wrappers | Automated: `grep -c "define(\|module\.exports\|System\.register" script.js` → 0 |
| AC5.5 | `index.html` and `style.css` are not modified | Automated: `git diff HEAD -- index.html style.css` → no output |

AC5.1–5.4 are verified in Phase 5 Task 6. AC5.5 is verified in Phase 6 Task 1 and Task 5.

---

## Manual Verification Checklist

The following must be verified manually in a real browser (Phase 6 Task 2). No automated test covers these.

**Environment:** Open `index.html` directly in a browser (file:// protocol, no dev server needed).

| # | Tool | Action | Expected result |
|---|------|--------|-----------------|
| 1 | pencil | Click and drag on canvas | Smooth lines drawn in selected color |
| 2 | drips | Click and drag on canvas | Irregular filled circles scattered along drag path |
| 3 | stamp | Select a stamp, click canvas | Stamp image placed at click point, 50×50px |
| 4 | bubbles | Click canvas | 0–30 bubble images scattered around click point |
| 5 | eraser | Draw, then drag eraser over content | White stroke erases content |
| 6 | oops (undo) | Draw something, click oops | Last stroke removed; canvas returns to pre-stroke state |
| 7 | nuke (clear) | Draw something, click nuke | Entire canvas cleared |
| 8 | colors | Click each color swatch | Color changes; subsequent strokes use new color |
| 9 | stamp chooser | Select stamp tool, choose different stamps | Stamp preview changes; clicking canvas uses new stamp |
| 10 | sounds | Perform drawing actions | Appropriate sound effects play (pencil, drips, stamp, eraser, oops, nuke/tornado) |

**Pass criteria:** All 10 scenarios behave identically to opening the original `script.js` in a browser before migration.

---

## Running All Automated Tests

```bash
cd /Users/ggissel/code/draw-this/.worktrees/typescript-migration

# Run all tests
npm run test:run

# Run tests + type-check (full CI gate)
npm run check
```

Expected output: all tests pass, `tsc --noEmit` exits 0.

### Expected test file inventory (post-Phase 6)

```
src/test/
  sounds.test.ts               — AC2.1–2.5
  bucket-helpers.test.ts       — AC4.3–4.4
  tools/
    tool-interface.test.ts     — AC3.1–3.4
    canvas-draw-calls.test.ts  — AC1.1–1.5
    drips.test.ts              — AC4.1–4.2
  drawHorse/
    undo.test.ts               — AC1.6
    state.test.ts              — AC1.7–1.9
```

Note: `src/test/baseline/` exists during Phases 2–5 and is deleted in Phase 6 Task 4.
