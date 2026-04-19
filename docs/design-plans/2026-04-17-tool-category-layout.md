# Tool Category Layout Design

## Summary

The tool category layout refactor reorganizes the drawing toy's toolbar from a single flat panel into a two-region layout: a horizontal top bar above the canvas and a vertical sidebar to the left of it. The top bar holds a fixed set of utility actions (save, undo, clear) that are always visible, plus a filtered area showing only the tool buttons that belong to whichever category is currently selected. The sidebar holds two columns — one for color selection and one for category buttons (pen, brush, toy, stamp, eraser, and three stubs for future tools). This gives the interface room to grow without crowding the toolbar.

The show/hide behavior for tool buttons is handled without JavaScript DOM manipulation: tool buttons carry a `data-category` attribute, the `#top-tools` container carries a `data-active-category` attribute, and CSS attribute selectors make only the matching buttons visible. A single event listener in the existing `drawHorse.addListeners()` method updates that attribute when a category is clicked. The refactor is structured as three sequential phases — HTML restructure, CSS layout, JavaScript wiring — so each phase produces a working (if visually incomplete) state. The existing tool selection system, undo stack, and drawing behavior are untouched.

## Definition of Done

- The page has a `#topbar` flex row containing a standard-tools group (save, oops, nado), a visual divider, and a `#top-tools` group that shows only the tool buttons belonging to the currently selected category.
- A `#sidebar` contains two inner columns: `#colors-col` (color swatches including a rainbow `r` stub and +/- size stubs) and `#category-col` (category buttons: pen, brush, toy, stamp, eraser, filter, bucket, letter).
- Clicking a category button updates `#top-tools[data-active-category]` and highlights the selected category. The visible tool buttons change accordingly.
- The existing tool selection system (`.tool` class, `tools[el.id]` lookup) is unchanged and all current drawing tools function as before.
- +/- buttons and the rainbow `r` color are present in the UI but non-functional stubs.

## Acceptance Criteria

### tool-category-layout.AC1: Top bar standard tools are always visible
- **tool-category-layout.AC1.1 Success:** save, oops, and nado buttons appear in `#topbar` at all times regardless of selected category
- **tool-category-layout.AC1.2 Success:** A visual divider separates standard tools from the category tool area
- **tool-category-layout.AC1.3 Success:** Clicking oops undoes the last drawing action as before
- **tool-category-layout.AC1.4 Success:** Clicking nado clears the canvas as before
- **tool-category-layout.AC1.5 Success:** Clicking save triggers screenshot/download as before

### tool-category-layout.AC2: Category buttons show correct tools
- **tool-category-layout.AC2.1 Success:** Clicking 'pen' shows the pencil tool button in `#top-tools`
- **tool-category-layout.AC2.2 Success:** Clicking 'brush' shows the drips tool button
- **tool-category-layout.AC2.3 Success:** Clicking 'toy' shows the bubbles tool button
- **tool-category-layout.AC2.4 Success:** Clicking 'stamp' shows the stamp tool button
- **tool-category-layout.AC2.5 Success:** Clicking 'eraser' shows the eraser tool button
- **tool-category-layout.AC2.6 Success:** Clicking 'filter', 'bucket', or 'letter' shows an empty `#top-tools` area (no tool buttons visible)
- **tool-category-layout.AC2.7 Failure:** Tool buttons for non-active categories are not visible in `#top-tools`

### tool-category-layout.AC3: Category selection state
- **tool-category-layout.AC3.1 Success:** The active category button has the `selectedControl` class
- **tool-category-layout.AC3.2 Success:** Only one category button has `selectedControl` at a time
- **tool-category-layout.AC3.3 Success:** On page load, 'pen' is the active category and the pencil button is visible in `#top-tools`

### tool-category-layout.AC4: Tool selection still works
- **tool-category-layout.AC4.1 Success:** Clicking a visible tool button in `#top-tools` selects that tool (`selectedControl` class moves to it)
- **tool-category-layout.AC4.2 Success:** Drawing with the selected tool produces the same output as before the refactor
- **tool-category-layout.AC4.3 Success:** All five drawing tools (pencil, drips, bubbles, stamp, eraser) work correctly after the refactor

### tool-category-layout.AC5: Color column
- **tool-category-layout.AC5.1 Success:** All existing color swatches appear in `#colors-col`
- **tool-category-layout.AC5.2 Success:** The 'r' rainbow button appears in `#colors-col` and sets `selectedColor` to `'rainbow'` when clicked
- **tool-category-layout.AC5.3 Success:** Clicking any color swatch still changes the drawing color as before
- **tool-category-layout.AC5.4 Success:** `+` and `-` buttons appear at the bottom of `#colors-col`; clicking them has no effect (stubs)

### tool-category-layout.AC6: Layout matches mockup
- **tool-category-layout.AC6.1 Success:** `#colors-col` and `#category-col` are side by side as the left sidebar
- **tool-category-layout.AC6.2 Success:** `#sidebar` is to the left of `#stretcher` (canvas)
- **tool-category-layout.AC6.3 Success:** `#topbar` spans the full width above `#body`
- **tool-category-layout.AC6.4 Success:** Canvas size is unaffected by the layout change (still fills available space)

## Glossary

- **`drawHorse`**: The central application state object defined in `src/drawHorse.ts`. It holds references to the canvas context, the active tool, selected color, and the undo stack, and it wires all user input events.
- **`addListeners()`**: The method on `drawHorse` that registers all mouse and touch event handlers. It is also the correct place to add the new category-selection listener, since tools never register their own listeners.
- **Tool registry (`tools`)**: A plain JavaScript object defined in `src/tools/index.ts` where each key is a tool's DOM element `id` and each value implements the `Tool` interface. Adding an entry here and a matching `<button>` in HTML is sufficient to make a new tool work.
- **`.tool` class**: The CSS class that marks a button as a drawing-tool selector. `drawHorse` uses `closest('.tool')` to detect tool-button clicks via event delegation — any button with this class in `#top-tools` is automatically picked up.
- **`.selectedControl`**: The CSS class applied to whichever button is currently active (selected tool, selected color, or, after this refactor, selected category). Only one button in each group should hold it at a time.
- **`data-active-category`**: An HTML data attribute on `#top-tools` that records which category is selected. CSS attribute selectors (`[data-active-category="pen"] [data-category="pen"]`) read this value to show or hide tool buttons without JavaScript toggling individual element visibility.
- **`data-category`**: An HTML data attribute on each tool button in `#top-tools` that declares which category the button belongs to.
- **Event delegation**: A pattern where a single listener is attached to a parent element and checks `event.target` (or `closest()`) to determine which child was interacted with. `drawHorse.addListeners()` uses this pattern throughout, and the category listener follows the same approach.
- **CSS attribute selector**: A CSS rule that matches elements based on the presence or value of an HTML attribute, e.g. `[data-active-category="pen"]`. Used here instead of toggling CSS classes with JavaScript to control tool button visibility.
- **Flex layout**: A CSS layout mode (`display: flex`) used to arrange child elements in a row or column. The new `#topbar` and `#body` containers use flex to position the sidebar, canvas, and top bar.
- **Stub**: A UI element or category that is present in the interface but has no functional backing yet. `filter`, `bucket` (pending a bug fix), and `letter` are stubs in this design.
- **esbuild**: The bundler that compiles TypeScript source files from `src/` into the single `script.js` file loaded by `index.html`. Running `npm run build` invokes it.
- **jsdom**: A JavaScript implementation of browser DOM APIs used by the Vitest test suite so tests can run in Node without a real browser.
- **Vitest**: The test framework used by this project, configured to run in a jsdom environment with canvas mocking via `vitest-canvas-mock`.
- **`ImageData`**: A browser canvas API type representing raw pixel data. The undo stack stores snapshots as `ImageData` objects, which `putImageData` restores to the canvas.

---

## Architecture

HTML5 canvas drawing toy layout refactor. The existing flat toolbar is replaced with a two-region layout: a horizontal `#topbar` above the drawing area and a vertical `#sidebar` to the left of the canvas.

Category show/hide is driven by a `data-active-category` attribute on `#top-tools` combined with CSS attribute selectors. No JavaScript framework is involved — a single listener in `drawHorse.addListeners()` updates the data attribute on category button click. Tool buttons in `#top-tools` carry `data-category` attributes that CSS uses to show or hide them.

The existing tool selection system in `drawHorse.ts` (`.tool` class detection → `tools[el.id]` registry lookup) is preserved without modification.

### DOM hierarchy

```
<header>                          — title row, unchanged
<div id="main">                   — flex column
  <div id="topbar">               — flex row
    <div id="standard-tools">     — save, oops, nado
    <div class="divider">         — visual separator
    <div id="top-tools"           — category-filtered tool buttons
         data-active-category="pen">
  <div id="body">                 — flex row
    <div id="sidebar">            — flex row, two inner columns
      <div id="colors-col">       — color swatches + r + +/-
      <div id="category-col">     — pen, brush, toy, stamp, eraser, filter, bucket, letter
    <div id="stretcher">          — canvas, unchanged
```

### Category → tool mapping

| Category | Tools |
|----------|-------|
| pen      | pencil |
| brush    | drips |
| toy      | bubbles |
| stamp    | stamp |
| eraser   | eraser |
| filter   | *(stub — no tools yet)* |
| bucket   | *(stub — bucket tool exists but hidden due to color bug)* |
| letter   | *(stub — no tools yet)* |

---

## Existing Patterns

Investigation found the following patterns this design preserves:

- **Tool discovery via `.tool` class** (`drawHorse.ts:116`): `closest('.tool')` walks the DOM to find the tool element, then `tools[el.id]` retrieves it from the registry. All tool buttons in `#top-tools` keep the `.tool` class and their existing `id` attributes.
- **Selected state via `.selectedControl` class** (`style.css:40`): Active tool and active color buttons receive this class. Category buttons follow the same pattern.
- **Color buttons read from `button.id`** (`drawHorse.ts` `setupColorChooser`): Color buttons in `#colors-col` keep their `id` attributes (red, orange, etc.). The new `r` button gets `id="rainbow"`.
- **5em max-width tool buttons** (`style.css:29`): `#category-col` buttons inherit the existing `button.control` rule.
- **3em × 3em color swatches** (`style.css:52`): `+` and `-` buttons in `#colors-col` inherit the `.colorChoice` size rule.

New pattern introduced: `data-active-category` attribute on `#top-tools` combined with CSS attribute selectors for show/hide. This avoids JavaScript DOM manipulation for visibility and keeps the show/hide logic declarative.

---

## Implementation Phases

<!-- START_PHASE_1 -->
### Phase 1: HTML restructure

**Goal:** Reorganize `index.html` into the new DOM hierarchy without changing any behavior.

**Components:**
- `index.html` — move existing buttons into new wrapper elements (`#main`, `#topbar`, `#standard-tools`, `#top-tools`, `#body`, `#sidebar`, `#colors-col`, `#category-col`); add `data-category` attributes to tool buttons; add category buttons with class `category`; add `r` color button and `+`/`-` buttons; remove old `#controls` sidebar and `#colorchooser` from header

**Dependencies:** None (first phase)

**Done when:** `index.html` renders in browser without JS errors; all existing buttons are present and visually accessible (layout may look broken until Phase 2 CSS is applied)
<!-- END_PHASE_1 -->

<!-- START_PHASE_2 -->
### Phase 2: CSS layout

**Goal:** Apply flex layout rules to produce the target visual layout.

**Components:**
- `style.css` — add rules for `#main`, `#topbar`, `.divider`, `#body`, `#sidebar`, `#colors-col`, `#category-col`; add category show/hide attribute selector rules for `#top-tools`; remove or update rules that targeted old `#controls` and header color row

**Dependencies:** Phase 1 (new DOM structure)

**Done when:** Layout visually matches the `docs/mockups/tool-categories.png` mockup; tool buttons in `#top-tools` for the default category (`pen`) are visible; buttons for other categories are hidden
<!-- END_PHASE_2 -->

<!-- START_PHASE_3 -->
### Phase 3: Category JS wiring

**Goal:** Add category selection behavior to `drawHorse.ts`.

**Components:**
- `src/drawHorse.ts` — capture `#top-tools` DOM reference; add category listener block inside `addListeners()` that sets `data-active-category` and toggles `.selectedControl` on `.category` buttons; set default active category (`pen`) and highlight default category button during initialization in `src/main.ts`

**Dependencies:** Phase 2 (DOM structure and CSS in place)

**Done when:** Clicking each category button updates `#top-tools[data-active-category]`; the correct tool buttons become visible; `.selectedControl` moves to the clicked category button; existing tool selection and drawing behavior is unaffected; `npm run check` passes
<!-- END_PHASE_3 -->

---

## Additional Considerations

**Bucket tool:** `src/tools/bucket.ts` exists but `colorPixel()` hardcodes `[100, 1, 2]` instead of reading selected color. The `buck` category is a stub; the bucket button remains absent from `#top-tools` until that bug is fixed separately.

**Eraser color:** The eraser draws white strokes, not transparent — it only "erases" against a white background. This is a pre-existing limitation and out of scope for this refactor.

**Touch events:** `drawHorse.addListeners()` already handles touch events on the canvas. Category buttons and standard-tool buttons do not require touch handling beyond the default browser behavior.
