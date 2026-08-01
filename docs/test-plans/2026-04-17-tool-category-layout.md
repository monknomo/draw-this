# Human Test Plan: Tool Category Layout

Generated from: `docs/implementation-plans/2026-04-17-tool-category-layout/`

## Prerequisites

- Run `npm install` once in the project root
- Run `npm run build` to regenerate `script.js` from the TypeScript source
- Run `npm run check` to confirm tests and typecheck are green (expect 63 tests passing)
- Open `index.html` directly in a browser (Chrome, Firefox, or Safari)
- Open browser DevTools console — it should be free of errors on load

---

## Phase 1: Initial Page Load

**Covers:** AC1.1, AC1.2, AC3.3, AC5.1, AC5.4, AC6.1–AC6.4

| Step | Action | Expected |
|------|--------|----------|
| 1 | Load `index.html` fresh (hard refresh if previously opened) | Page renders without console errors |
| 2 | Locate `#topbar` at the top of the page | Horizontal strip spanning the full window width, above `#body` |
| 3 | Inspect `#topbar`'s children | Left group `#standard-tools` contains save, oops, nado buttons; right group `#top-tools` contains a single visible tool button (pencil); a thin dark vertical divider sits between them |
| 4 | Inspect the left sidebar `#sidebar` | Contains `#colors-col` and `#category-col` side-by-side; `#sidebar` is positioned to the left of `#stretcher` (the canvas wrapper) inside `#body` |
| 5 | Inspect `#colors-col` | 10 color swatches render in order: red, orange, yellow, green, blue, violet, purple, saddlebrown, black, white. A rainbow `r` swatch is also present. `+` and `-` buttons are at the bottom of the column |
| 6 | Inspect `#category-col` | 8 category buttons in order: pen, brush, toy, stamp, eraser, filter, bucket, letter |
| 7 | Verify the `pen` category button | Highlighted (has `selectedControl` styling) |
| 8 | Verify `#top-tools` contents | Only the pencil button is visible; drips, bubbles, stamp, eraser tool buttons are hidden |
| 9 | Verify the canvas `#drawHere` | Fills the area to the right of `#sidebar` and below `#topbar`, without clipping or gaps |
| 10 | Resize the browser window (drag corner smaller and larger) | Canvas rescales smoothly; `#topbar` still spans full width; `#sidebar` stays on the left |

---

## Phase 2: Standard Tools Always Visible

**Covers:** AC1.1, AC1.3, AC1.4, AC1.5

| Step | Action | Expected |
|------|--------|----------|
| 1 | With pencil selected, draw a short stroke on the canvas | A black pencil line appears |
| 2 | Click `oops` in `#standard-tools` | The pencil stroke is erased (canvas returns to previous state) |
| 3 | Draw another stroke on the canvas | Stroke appears |
| 4 | Click `nado` in `#standard-tools` | The entire canvas clears to white |
| 5 | Click `save` in `#standard-tools` | Browser initiates a download named `screenshot-<timestamp>.jpg` |
| 6 | For each category (brush, toy, stamp, eraser, filter, bucket, letter), click the category button | The save, oops, nado buttons remain visible in `#standard-tools` every time |

---

## Phase 3: Category Switching Reveals Tools

**Covers:** AC2.1–AC2.7

| Step | Action | Expected |
|------|--------|----------|
| 1 | Click `pen` category | Only the pencil tool button is visible in `#top-tools` |
| 2 | Click `brush` category | Only the drips tool button is visible in `#top-tools` |
| 3 | Click `toy` category | Only the bubbles tool button is visible in `#top-tools` |
| 4 | Click `stamp` category | Only the stamp tool button is visible in `#top-tools` |
| 5 | Click `eraser` category | Only the eraser tool button is visible in `#top-tools` |
| 6 | Click `filter` category | `#top-tools` renders empty (no tool buttons visible) |
| 7 | Click `bucket` category | `#top-tools` renders empty |
| 8 | Click `letter` category | `#top-tools` renders empty |
| 9 | In DevTools, inspect `#top-tools` element | `data-active-category` attribute equals the most recently clicked category name |

---

## Phase 4: Category Selection State

**Covers:** AC3.1, AC3.2

| Step | Action | Expected |
|------|--------|----------|
| 1 | From fresh load (pen active) | The `pen` category button is visually highlighted |
| 2 | Click `brush` category | `pen` loses highlight; `brush` is now highlighted |
| 3 | Click `stamp` category | `brush` loses highlight; `stamp` is highlighted |
| 4 | In DevTools: `document.querySelectorAll('.category.selectedControl').length` | Returns `1` |

---

## Phase 5: Color Swatches

**Covers:** AC5.1, AC5.3, AC5.4

| Step | Action | Expected |
|------|--------|----------|
| 1 | With pencil selected, click the `red` color swatch | Red swatch visually highlights; pencil strokes draw in red |
| 2 | Click the `blue` swatch, then draw | Strokes are now blue |
| 3 | Click the `rainbow` (`r`) swatch | Swatch highlights; `drawHorse.selectedColor === 'rainbow'` in console |
| 4 | Click the `+` button at the bottom of `#colors-col` | No color change; no visible UI change; no console errors |
| 5 | Click the `-` button at the bottom of `#colors-col` | No color change; no visible UI change; no console errors |

---

## End-to-End: Draw a Picture Using Multiple Categories

**Covers:** AC4.1–AC4.3, full integration

Steps:
1. Load `index.html` fresh. Pencil is pre-selected in pen category.
2. Click the `red` color swatch; draw a horizontal line near the top of the canvas with pencil. A red line appears.
3. Click the `brush` category; the drips tool button becomes visible. Click drips and drag across the canvas; drip circles appear in red.
4. Click the `yellow` swatch. Click the `toy` category; the bubbles button becomes visible. Click bubbles and click on the canvas; yellow bubbles appear.
5. Click the `stamp` category; the stamp button becomes visible. Click stamp; the stamp chooser appears in the footer. Select a stamp (e.g., horse) and click the canvas; the stamp appears.
6. Click the `eraser` category; the eraser button becomes visible. Click eraser and drag across any drawn area; strokes are erased (white).
7. Click `oops` repeatedly; each click reverts one stroke in reverse order.
8. Click `nado`; the canvas clears completely.
9. Click `save`; a screenshot downloads.

**Expected:** Each category switch reveals exactly one tool; each tool draws its expected shape; undo, clear, and save all still work; no console errors throughout.

---

## End-to-End: Responsive Layout

**Covers:** AC6.4

Steps:
1. Load `index.html` at a typical desktop size (≥1200px wide). Confirm canvas fills the area between `#sidebar` and the right edge.
2. Drag the window narrower (down to ~800px). Canvas narrows; `#sidebar` stays on the left; `#topbar` remains a full-width strip at top.
3. Drag the window shorter vertically. Canvas height shrinks; `#topbar`, `#sidebar`, and `#stretcher` remain laid out correctly.
4. Return to full size. Canvas rescales back.

**Expected:** No overlap, clipping, or visible gaps at any size. `#topbar` is always above `#body`.

---

## Traceability

| Acceptance Criterion | Automated Test | Manual Step |
|----------------------|----------------|-------------|
| AC1.1 — standard tools always visible | — | Phase 1 step 3; Phase 2 step 6 |
| AC1.2 — visual divider | — | Phase 1 step 3 |
| AC1.3 — oops undoes last stroke | `src/test/drawHorse/undo.test.ts` | Phase 2 step 2 |
| AC1.4 — nado clears canvas | `src/test/tools/canvas-draw-calls.test.ts` | Phase 2 step 4 |
| AC1.5 — save triggers download | `src/test/save.test.ts` | Phase 2 step 5 |
| AC2.1 — pen shows pencil | `src/test/drawHorse/categories.test.ts` | Phase 3 step 1 |
| AC2.2 — brush shows drips | `src/test/drawHorse/categories.test.ts` | Phase 3 step 2 |
| AC2.3 — toy shows bubbles | `src/test/drawHorse/categories.test.ts` | Phase 3 step 3 |
| AC2.4 — stamp shows stamp | `src/test/drawHorse/categories.test.ts` | Phase 3 step 4 |
| AC2.5 — eraser shows eraser | `src/test/drawHorse/categories.test.ts` | Phase 3 step 5 |
| AC2.6 — stub categories empty | `src/test/drawHorse/categories.test.ts` | Phase 3 steps 6–8 |
| AC2.7 — non-active tools hidden | — | Phase 3 steps 1–8 |
| AC3.1 — active category has selectedControl | `src/test/drawHorse/categories.test.ts` | Phase 4 step 2 |
| AC3.2 — only one selectedControl | `src/test/drawHorse/categories.test.ts` | Phase 4 steps 2–4 |
| AC3.3 — pen active on load | `src/test/drawHorse/categories.test.ts` | Phase 1 steps 7–8 |
| AC4.1 — tool click selects tool | `src/test/drawHorse/events.test.ts` | E2E "Draw a Picture" steps 2–6 |
| AC4.2 — drawing output unchanged | `src/test/tools/canvas-draw-calls.test.ts` | E2E "Draw a Picture" steps 2–6 |
| AC4.3 — all five tools work | `tool-interface.test.ts`, `canvas-draw-calls.test.ts`, `bubbles.test.ts`, `drips.test.ts` | E2E "Draw a Picture" steps 2–6 |
| AC5.1 — 10 color swatches in colors-col | — | Phase 1 step 5 |
| AC5.2 — rainbow sets selectedColor | `src/test/drawHorse/categories.test.ts` | Phase 5 step 3 |
| AC5.3 — color swatch changes color | `src/test/drawHorse/state.test.ts` | Phase 5 steps 1–2 |
| AC5.4 — +/- buttons present, no-op | — | Phase 1 step 5; Phase 5 steps 4–5 |
| AC6.1 — colors-col + category-col side by side | — | Phase 1 step 4 |
| AC6.2 — sidebar left of canvas | — | Phase 1 step 4 |
| AC6.3 — topbar spans full width above body | — | Phase 1 step 2 |
| AC6.4 — canvas unaffected by layout | — | Phase 1 steps 9–10; E2E responsive layout |
