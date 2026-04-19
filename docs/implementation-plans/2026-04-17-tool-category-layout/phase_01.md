# Tool Category Layout — Implementation Plan

**Goal:** Restructure index.html into the new DOM hierarchy (topbar + sidebar + canvas).

**Architecture:** Three wrapper elements — `#topbar` (standard tools + category tools), `#sidebar` (colors + categories), `#stretcher` (canvas) — all inside a `#main > #body` hierarchy. Category show/hide via `data-active-category` driven by Phase 3 JS; layout driven by Phase 2 CSS.

**Tech Stack:** HTML5, no build step required

**Scope:** Phase 1 of 3 from original design

**Codebase verified:** 2026-04-17

---

## Acceptance Criteria Coverage

This phase establishes DOM structure only. No CSS or JS wiring yet. Visual verification is the "done when" — tests verify it doesn't break existing behavior.

This phase creates the DOM structure only. CSS (Phase 2) and JS wiring (Phase 3) are required before any AC is fully verified. Final verification of all ACs happens in Phase 3.

**Verifies:** None (infrastructure phase — verified operationally)

---

<!-- START_TASK_1 -->
### Task 1: Restructure index.html

**Files:**
- Modify: `index.html` (full restructure)

**Step 1: Read the current index.html**

Read `/Users/ggissel/code/draw-this/.worktrees/tool-category-layout/index.html` to get the exact current button markup (including all base64 SVG `<img>` tags).

**Note on category names:** The mockup at `docs/mockups/tool-categories.png` shows abbreviated/different category labels (`pain`, `filt`, `stam`, `eras`). The canonical category list is the table in the design plan (`docs/design-plans/2026-04-17-tool-category-layout.md`): pen, brush, toy, stamp, eraser, filter, bucket, letter. Use the design plan names.

**Step 2: Rewrite the body structure**

Replace the header's second `.row` div (lines ~21-69) and the canvas row div (lines ~71-127) with the new structure below. The title row inside `<header>` stays unchanged.

The new body structure (after `</header>`, before `<footer>`):

```html
<div id="main">
  <div id="topbar">
    <div id="standard-tools">
      <!-- Move oops button here (preserve existing markup exactly) -->
      <!-- Move nuke button here (preserve existing markup exactly) -->
      <!-- Move screenshot button here (preserve existing markup exactly) -->
    </div>
    <div class="divider"></div>
    <div id="top-tools" data-active-category="pen">
      <!-- Move pencil button here, ADD data-category="pen" attribute -->
      <!-- Move drips button here, ADD data-category="brush" attribute -->
      <!-- Move bubbles button here, ADD data-category="toy" attribute -->
      <!-- Move stamp button here, ADD data-category="stamp" attribute -->
      <!-- Move eraser button here, ADD data-category="eraser" attribute -->
    </div>
  </div>
  <div id="body">
    <div id="sidebar">
      <div id="colors-col">
        <!-- Move all 10 color buttons here (preserve existing markup exactly) -->
        <!-- ADD new rainbow button after white: -->
        <button id="rainbow" class="colorChoice">r</button>
        <!-- ADD size stub buttons at the bottom: -->
        <button id="size-increase" class="colorChoice">+</button>
        <button id="size-decrease" class="colorChoice">-</button>
      </div>
      <div id="category-col">
        <button class="control category" data-category="pen">pen</button>
        <button class="control category" data-category="brush">brush</button>
        <button class="control category" data-category="toy">toy</button>
        <button class="control category" data-category="stamp">stamp</button>
        <button class="control category" data-category="eraser">eraser</button>
        <button class="control category" data-category="filter">filter</button>
        <button class="control category" data-category="bucket">bucket</button>
        <button class="control category" data-category="letter">letter</button>
      </div>
    </div>
    <div id="stretcher">
      <canvas id="drawHere"></canvas>
    </div>
  </div>
</div>
```

Key rules when applying this change:
- Preserve every existing button's full inner markup (the `<img>` tags with base64 SVGs, text labels, `draggable="false"`, etc.)
- The 4 hidden legacy buttons (load, share, plus, minus) are **dropped** — they were `display:none` and unused
- `id="screenshot"` keeps `class="control"` (no `tool` class — it's not a selectable drawing tool)
- `id="oops"` and `id="nuke"` keep `class="control tool"` — the existing tool system handles them as one-shot actions
- All 10 existing color buttons keep their exact markup; move them into `#colors-col` in the same order

**Footer — preserve exactly as-is:**

The `<footer id="colors">` element must be left completely unchanged. Do not move or remove any of its contents. Specifically:

- **`<div id="colorchooser">`** must remain in the footer (now empty after the color buttons have moved to `#colors-col`). The JS method `showColorSelectors()` in `drawHorse.ts` calls `document.getElementById('colorchooser')!` with a non-null assertion — removing this element will throw at runtime when the stamp tool is toggled.
- **All 7 `<audio>` elements** (clickSound, drippingSound, stampSound, eraserSound, pencilSound, oopsSound, tornadoSound) must stay in the footer. Removing them will break all sound effects.
- **`<div id="stampchooser">`** must stay in the footer. The `showStampSelectors()` / `hideStampSelectors()` methods toggle its display.
- **`footer id="colors"`** itself is referenced by `drawHorse.colors` and used in the `resize()` calculation. It must remain.

After Phase 1, the footer looks like:

```html
<footer id="colors">
  <div id="stampchooser" class="row" style="display:none;"></div>
  <div id="colorchooser"></div>  <!-- intentionally empty — color buttons moved to #colors-col -->
  <audio id="clickSound" src="assets/sounds/click.mp3"></audio>
  <audio id="drippingSound" src="assets/sounds/drip.mp3" loop></audio>
  <audio id="stampSound" src="assets/sounds/stamp.mp3"></audio>
  <audio id="eraserSound" src="assets/sounds/eraser.mp3" loop></audio>
  <audio id="pencilSound" src="assets/sounds/pencil.mp3" loop></audio>
  <audio id="oopsSound" src="assets/sounds/oops.mp3"></audio>
  <audio id="tornadoSound" src="assets/sounds/tornado.mp3"></audio>
</footer>
```

(Preserve the exact `src` attributes from the current file — the paths above are illustrative.)

**Step 3: Verify it opens without JS errors**

Open `.worktrees/tool-category-layout/index.html` in a browser (e.g. `open index.html` on macOS). Expected: page loads, no console errors, all buttons visible. The layout will look broken — that is expected and will be fixed in Phase 2.

**Step 4: Run existing tests**

```bash
cd /Users/ggissel/code/draw-this/.worktrees/tool-category-layout
npm run test:run
```

Expected: All 56 tests pass. The test suite uses jsdom fixtures defined in `src/test/setup.ts` — it does not parse `index.html` directly, so DOM restructuring does not affect test outcomes.

**Step 5: Commit**

```bash
git add index.html
git commit -m "refactor: restructure HTML into topbar/sidebar/canvas layout"
```
<!-- END_TASK_1 -->
