# Tool Category Layout — Test Requirements

Maps each acceptance criterion from `docs/design-plans/2026-04-17-tool-category-layout.md` to either an automated test (with file path, type, and assertion) or a human-verified check (with justification and verification approach).

## Test Environment Constraints

- Vitest + jsdom + `vitest-canvas-mock`.
- `src/test/setup.ts` injects a minimal DOM fixture and evals the compiled `script.js` bundle; TypeScript source changes require `npm run build` before tests observe them.
- The fixture does **not** load `style.css`. Any AC whose observable behavior depends on CSS (e.g. `display:none` driven by `#top-tools[data-active-category]` attribute selectors, flex positioning, divider appearance, gradient rendering) cannot be validated with `getComputedStyle` in jsdom. Those ACs are routed to human verification.
- The fixture is intentionally flatter than production `index.html` — it replaces `#controls` with `#top-tools` and adds `#category-col`, but does not reproduce the full `#main > #topbar > #body > #sidebar` hierarchy. ACs that assert structural container relationships are routed to human verification.
- Automated category-layout tests live in `src/test/drawHorse/categories.test.ts`.

---

## AC1: Top bar standard tools are always visible

### tool-category-layout.AC1.1 — save, oops, nado always visible in `#topbar`

- **Verification:** Human
- **Justification:** "Visible" means CSS-driven visibility inside `#topbar`. The test fixture does not load `style.css` and does not place the standard-tools buttons inside a `#topbar` container, so the structural claim cannot be automated.
- **Approach:** Open `index.html` in a browser. Confirm the `save`, `oops`, and `nado` buttons render inside `#standard-tools` at the top of the page. Click every category button in turn; confirm the three standard buttons remain rendered each time.

### tool-category-layout.AC1.2 — Visual divider separates standard tools from category tool area

- **Verification:** Human
- **Justification:** The `.divider` element is a CSS-styled empty div. Its visual separation depends on `style.css` rules (`width`, `background-color`, `align-self: stretch`) which are not loaded in jsdom.
- **Approach:** Open `index.html`. Confirm a thin dark vertical line sits between `#standard-tools` and `#top-tools` inside `#topbar`.

### tool-category-layout.AC1.3 — Clicking oops undoes the last drawing action

- **Verification:** Automated (existing coverage)
- **Test type:** Unit
- **Test file:** `src/test/drawHorse/undo.test.ts`
- **Assertion:** Existing undo-stack tests assert the `oops` tool pops the last `ImageData` snapshot and restores it via `putImageData`. The refactor does not alter the oops tool or undo stack, so existing coverage remains authoritative.

### tool-category-layout.AC1.4 — Clicking nado clears the canvas

- **Verification:** Automated (existing coverage)
- **Test type:** Unit
- **Test file:** `src/test/tools/canvas-draw-calls.test.ts`
- **Assertion:** Existing test asserts the nuke tool calls `ctx.clearRect` over the full canvas. Refactor does not alter this tool.

### tool-category-layout.AC1.5 — Clicking save triggers screenshot/download

- **Verification:** Automated (existing coverage)
- **Test type:** Unit
- **Test file:** `src/test/save.test.ts`
- **Assertion:** Existing save-button test asserts the screenshot handler fires and produces a download. Refactor does not change the screenshot control.

---

## AC2: Category buttons show correct tools

### tool-category-layout.AC2.1 — Clicking 'pen' shows pencil tool button

- **Verification:** Automated (attribute-level) + Human (visual show/hide)
- **Test type:** Unit
- **Test file:** `src/test/drawHorse/categories.test.ts`
- **Assertion:** Clicking the `.category[data-category="pen"]` button sets `#top-tools` `dataset.activeCategory === 'pen'`. (The attribute is the declarative contract CSS consumes.)
- **Human approach:** In a browser, click `pen` and confirm only the pencil tool button is visible in `#top-tools`. CSS-driven visibility cannot be asserted in jsdom without the stylesheet.

### tool-category-layout.AC2.2 — Clicking 'brush' shows drips tool button

- **Verification:** Automated (attribute-level) + Human (visual show/hide)
- **Test type:** Unit
- **Test file:** `src/test/drawHorse/categories.test.ts`
- **Assertion:** Clicking `.category[data-category="brush"]` sets `#top-tools.dataset.activeCategory === 'brush'`.
- **Human approach:** Click `brush` in the browser; confirm only the drips tool button is visible.

### tool-category-layout.AC2.3 — Clicking 'toy' shows bubbles tool button

- **Verification:** Automated (attribute-level) + Human (visual show/hide)
- **Test type:** Unit
- **Test file:** `src/test/drawHorse/categories.test.ts`
- **Assertion:** Clicking `.category[data-category="toy"]` sets `#top-tools.dataset.activeCategory === 'toy'`.
- **Human approach:** Click `toy` in the browser; confirm only the bubbles tool button is visible.

### tool-category-layout.AC2.4 — Clicking 'stamp' shows stamp tool button

- **Verification:** Automated (attribute-level) + Human (visual show/hide)
- **Test type:** Unit
- **Test file:** `src/test/drawHorse/categories.test.ts`
- **Assertion:** Clicking `.category[data-category="stamp"]` sets `#top-tools.dataset.activeCategory === 'stamp'`.
- **Human approach:** Click `stamp` in the browser; confirm only the stamp tool button is visible.

### tool-category-layout.AC2.5 — Clicking 'eraser' shows eraser tool button

- **Verification:** Automated (attribute-level) + Human (visual show/hide)
- **Test type:** Unit
- **Test file:** `src/test/drawHorse/categories.test.ts`
- **Assertion:** Clicking `.category[data-category="eraser"]` sets `#top-tools.dataset.activeCategory === 'eraser'`.
- **Human approach:** Click `eraser` in the browser; confirm only the eraser tool button is visible.

### tool-category-layout.AC2.6 — Clicking 'filter', 'bucket', or 'letter' shows empty `#top-tools`

- **Verification:** Automated (attribute-level) + Human (visual emptiness)
- **Test type:** Unit
- **Test file:** `src/test/drawHorse/categories.test.ts`
- **Assertion:** For each stub (`filter`, `bucket`, `letter`), clicking `.category[data-category="<stub>"]` sets `#top-tools.dataset.activeCategory` to the stub name. Because no tool button carries `data-category` matching a stub (bucket is a pre-existing stub hidden elsewhere), the CSS `display:none` default prevails in production.
- **Human approach:** Click `filter`, `bucket`, and `letter` in turn; confirm the `#top-tools` area renders empty (no tool buttons).

### tool-category-layout.AC2.7 — Tool buttons for non-active categories are not visible

- **Verification:** Human
- **Justification:** The hide behavior is driven entirely by `#top-tools .tool { display: none }` plus the `[data-active-category="X"] .tool[data-category="X"] { display: inline-block }` overrides in `style.css`. jsdom computes `getComputedStyle` without loading the stylesheet, so every tool button reports `display: block` regardless of `data-active-category`. The automated `data-active-category` assertion in AC2.1–AC2.6 covers the attribute contract; the actual visibility can only be verified in a real browser.
- **Approach:** In the browser, for each category (pen, brush, toy, stamp, eraser), click the category button and confirm only tool buttons with the matching `data-category` are visible; all others are hidden.

---

## AC3: Category selection state

### tool-category-layout.AC3.1 — Active category button has `selectedControl` class

- **Verification:** Automated
- **Test type:** Unit
- **Test file:** `src/test/drawHorse/categories.test.ts`
- **Assertion:** After clicking `.category[data-category="brush"]`, that element's `classList.contains('selectedControl')` is `true`.

### tool-category-layout.AC3.2 — Only one category button has `selectedControl` at a time

- **Verification:** Automated
- **Test type:** Unit
- **Test file:** `src/test/drawHorse/categories.test.ts`
- **Assertion:** Pre-seed `.category[data-category="pen"]` with `selectedControl`. Click `.category[data-category="brush"]`. Assert the pen button no longer has `selectedControl` and the brush button now does. Extends to: after any click, `document.querySelectorAll('.category.selectedControl').length === 1`.

### tool-category-layout.AC3.3 — On page load, 'pen' is active and pencil button is visible

- **Verification:** Automated (attribute/class state) + Human (visual)
- **Test type:** Unit
- **Test file:** `src/test/drawHorse/categories.test.ts`
- **Assertion:** After `window.onload` runs (executed by the test setup), `#top-tools.dataset.activeCategory === 'pen'` and the `.category[data-category="pen"]` button has the `selectedControl` class. (The latter requires the `main.ts` default-category initialization line to be exercised by the setup.)
- **Human approach:** Load `index.html` fresh; confirm the pencil button is the only tool visible in `#top-tools` and the `pen` category button is highlighted.

---

## AC4: Tool selection still works

### tool-category-layout.AC4.1 — Clicking a visible tool button selects that tool

- **Verification:** Automated (existing coverage, still applicable)
- **Test type:** Unit
- **Test file:** `src/test/drawHorse/events.test.ts` (or equivalent existing tool-click handler tests)
- **Assertion:** Existing tests for `.tool` click delegation assert that clicking a `.tool` element sets `drawHorse.currentTool` to `tools[el.id]` and moves `selectedControl`. These tests are unaffected by the refactor because the `.tool` class and registry lookup are preserved.

### tool-category-layout.AC4.2 — Drawing with selected tool produces same output

- **Verification:** Automated (existing coverage)
- **Test type:** Unit
- **Test file:** `src/test/tools/canvas-draw-calls.test.ts`
- **Assertion:** Existing canvas-draw-calls suite asserts each tool produces the same `ctx` API call sequence. Refactor does not touch tool modules, so existing assertions remain authoritative.

### tool-category-layout.AC4.3 — All five drawing tools work after refactor

- **Verification:** Automated (existing coverage)
- **Test type:** Unit
- **Test files:**
  - `src/test/tools/tool-interface.test.ts` — every tool implements the `Tool` interface
  - `src/test/tools/canvas-draw-calls.test.ts` — pencil, drips, stamp, eraser draw calls
  - `src/test/tools/bubbles.test.ts` — bubbles-specific behavior
  - `src/test/tools/drips.test.ts` — drips-specific behavior
- **Assertion:** Existing suites cover all five tools. A green `npm run test:run` after the refactor confirms they still function.

---

## AC5: Color column

### tool-category-layout.AC5.1 — All existing color swatches appear in `#colors-col`

- **Verification:** Human
- **Justification:** The test fixture keeps color buttons inside `#colorchooser` (in the footer) for compatibility with `showColorSelectors`/`hideColorSelectors` helpers; it does not reproduce `#colors-col`. Asserting the production DOM's child ordering inside `#colors-col` without loading `index.html` is not meaningful. Also, "appear" implies rendered, which depends on CSS.
- **Approach:** Open `index.html`. Confirm all 10 existing color swatches (red, orange, yellow, green, blue, violet, purple, saddlebrown, black, white) are rendered inside `#colors-col`.

### tool-category-layout.AC5.2 — Rainbow `r` button sets `selectedColor` to `'rainbow'`

- **Verification:** Automated
- **Test type:** Unit
- **Test file:** `src/test/drawHorse/categories.test.ts`
- **Assertion:** Click `document.getElementById('rainbow')` and assert `drawHorse.selectedColor === 'rainbow'`. The test fixture seeds `<button id="rainbow" class="colorChoice">r</button>` inside `#colorchooser` per Phase 3 Task 2 Step 2.

### tool-category-layout.AC5.3 — Clicking any color swatch changes the drawing color

- **Verification:** Automated (existing coverage)
- **Test type:** Unit
- **Test file:** `src/test/drawHorse/state.test.ts`
- **Assertion:** Existing drawHorse state tests assert `setupColorChooser` wires each `.colorChoice` button to set `selectedColor = button.id`. The refactor does not change `setupColorChooser` or the color-button `id` attributes.

### tool-category-layout.AC5.4 — `+` and `-` buttons appear at bottom of `#colors-col`; clicks are no-ops

- **Verification:** Human
- **Justification:** "Appear at the bottom of `#colors-col`" is a CSS layout assertion, and "no-op on click" is the absence of a handler — true by default and not worth a dedicated test. jsdom cannot validate vertical ordering within a flex column without `style.css`.
- **Approach:** Open `index.html`. Confirm `+` and `-` buttons render at the bottom of `#colors-col` (below all color swatches). Click each and confirm no visible state change (no color change, no console error).

---

## AC6: Layout matches mockup

### tool-category-layout.AC6.1 — `#colors-col` and `#category-col` are side by side as the left sidebar

- **Verification:** Human
- **Justification:** Layout structural claim depends on `style.css` (`#sidebar { display: flex; flex-direction: row }`). jsdom without the stylesheet cannot compute positions.
- **Approach:** Open `index.html`. Confirm `#colors-col` and `#category-col` are visible as two adjacent columns inside `#sidebar` on the left of the page.

### tool-category-layout.AC6.2 — `#sidebar` is to the left of `#stretcher`

- **Verification:** Human
- **Justification:** Horizontal ordering inside `#body { display: flex; flex-direction: row }` is CSS-dependent.
- **Approach:** Open `index.html`. Confirm `#sidebar` sits to the left of the canvas (`#stretcher`) inside `#body`.

### tool-category-layout.AC6.3 — `#topbar` spans full width above `#body`

- **Verification:** Human
- **Justification:** Vertical stacking and full-width spanning depend on `#main { display: flex; flex-direction: column }`.
- **Approach:** Open `index.html`. Confirm `#topbar` is a horizontal strip above `#body` that spans the full window width.

### tool-category-layout.AC6.4 — Canvas size is unaffected by layout change

- **Verification:** Human
- **Justification:** The `resize()` formula was updated to subtract `#topbar.offsetHeight` instead of the footer height. Validating that the resulting canvas "still fills available space" requires a real browser with `style.css` loaded; jsdom's `offsetHeight` is always 0 for un-styled elements, making any automated dimension check meaningless.
- **Approach:** Open `index.html`. Confirm the canvas fills the area to the right of `#sidebar` and below `#topbar`, without clipping or gaps. Resize the window and confirm the canvas rescales.

---

## Summary

| AC | Verification | Test File (if automated) |
|---|---|---|
| AC1.1 | Human | — |
| AC1.2 | Human | — |
| AC1.3 | Automated | `src/test/drawHorse/undo.test.ts` |
| AC1.4 | Automated | `src/test/tools/canvas-draw-calls.test.ts` |
| AC1.5 | Automated | `src/test/save.test.ts` |
| AC2.1 | Automated + Human | `src/test/drawHorse/categories.test.ts` |
| AC2.2 | Automated + Human | `src/test/drawHorse/categories.test.ts` |
| AC2.3 | Automated + Human | `src/test/drawHorse/categories.test.ts` |
| AC2.4 | Automated + Human | `src/test/drawHorse/categories.test.ts` |
| AC2.5 | Automated + Human | `src/test/drawHorse/categories.test.ts` |
| AC2.6 | Automated + Human | `src/test/drawHorse/categories.test.ts` |
| AC2.7 | Human | — |
| AC3.1 | Automated | `src/test/drawHorse/categories.test.ts` |
| AC3.2 | Automated | `src/test/drawHorse/categories.test.ts` |
| AC3.3 | Automated + Human | `src/test/drawHorse/categories.test.ts` |
| AC4.1 | Automated | `src/test/drawHorse/events.test.ts` |
| AC4.2 | Automated | `src/test/tools/canvas-draw-calls.test.ts` |
| AC4.3 | Automated | `src/test/tools/tool-interface.test.ts`, `canvas-draw-calls.test.ts`, `bubbles.test.ts`, `drips.test.ts` |
| AC5.1 | Human | — |
| AC5.2 | Automated | `src/test/drawHorse/categories.test.ts` |
| AC5.3 | Automated | `src/test/drawHorse/state.test.ts` |
| AC5.4 | Human | — |
| AC6.1 | Human | — |
| AC6.2 | Human | — |
| AC6.3 | Human | — |
| AC6.4 | Human | — |

Every AC maps to automated coverage, human verification, or both. All AC2.x success criteria have partial automated coverage at the `data-active-category` attribute level; full CSS-driven visibility is verified by a human in a real browser during Phase 2 Step 4 (and again at end of Phase 3).
