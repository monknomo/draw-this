# Tool Category Layout — Phase 2: CSS Layout

**Goal:** Apply flex rules to produce the target visual layout and implement category tool show/hide.

**Architecture:** Layer new structural rules on top of existing button/color styling. Remove the `#controls` rule (element dropped in Phase 1). Add flex containers for `#main`, `#topbar`, `#body`, `#sidebar`, `#colors-col`, `#category-col`. Add CSS attribute selectors for category tool show/hide.

**Tech Stack:** CSS (no build step)

**Scope:** Phase 2 of 3

**Codebase verified:** 2026-04-17

---

## Acceptance Criteria Coverage

**Verifies:** None (infrastructure phase — verified operationally via visual inspection against `docs/mockups/tool-categories.png`)

---

<!-- START_TASK_1 -->
### Task 1: Update style.css

**Files:**
- Modify: `style.css`

**Step 1: Remove the `div#controls` rule**

Delete the entire `div#controls { ... }` block (currently lines 22–27). This element no longer exists in the DOM after Phase 1.

**Step 2: Add new structural flex rules**

Add the following block after the `.row` rule:

```css
#main {
  display: flex;
  flex-direction: column;
}

#topbar {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.divider {
  width: 0.1em;
  background-color: #333;
  align-self: stretch;
  margin: 0 0.3em;
}

#body {
  display: flex;
  flex-direction: row;
  flex: 1;
}

#sidebar {
  display: flex;
  flex-direction: row;
  flex: 1;
}

#colors-col {
  display: flex;
  flex-direction: column;
}

#category-col {
  display: flex;
  flex-direction: column;
}

#top-tools {
  display: flex;
  flex-direction: row;
  align-items: center;
}

#top-tools .tool {
  display: none;
}

#top-tools[data-active-category="pen"] .tool[data-category="pen"] { display: inline-block; }
#top-tools[data-active-category="brush"] .tool[data-category="brush"] { display: inline-block; }
#top-tools[data-active-category="toy"] .tool[data-category="toy"] { display: inline-block; }
#top-tools[data-active-category="stamp"] .tool[data-category="stamp"] { display: inline-block; }
#top-tools[data-active-category="eraser"] .tool[data-category="eraser"] { display: inline-block; }
#top-tools[data-active-category="filter"] .tool[data-category="filter"] { display: inline-block; }
#top-tools[data-active-category="bucket"] .tool[data-category="bucket"] { display: inline-block; }
#top-tools[data-active-category="letter"] .tool[data-category="letter"] { display: inline-block; }

button#rainbow {
  background: linear-gradient(to bottom, red, orange, yellow, green, blue, violet);
  color: white;
  text-shadow: 0 0 2px black;
}

button#size-increase,
button#size-decrease {
  background-color: #FFF483;
  font-size: 1.2em;
  font-weight: bold;
}
```

**Step 3: Verify visually in browser**

Open `.worktrees/tool-category-layout/index.html` in a browser.

Expected:
- Left sidebar shows two narrow columns: color swatches on the left, category buttons on the right
- Top bar shows: oops / nado / screenshot | divider | pencil tool button (`pen` is the default `data-active-category`)
- Canvas fills the right area
- Tool buttons for non-`pen` categories are not visible
- Layout roughly matches `docs/mockups/tool-categories.png`

**Step 4: Manual verification checklist**

Open `.worktrees/tool-category-layout/index.html` in a browser and verify the following ACs (these cannot be unit-tested because `style.css` is not loaded in the jsdom test suite):

- **AC1.1–AC1.5**: save, oops, nado buttons are visible in the top bar at all times; a divider separates them from the tool area; clicking oops/nado/save behaves as before
- **AC2.7**: tool buttons for non-active categories (brush, toy, stamp, eraser) are NOT visible when `pen` is the active category
- **AC5.1**: all 10 existing color swatches appear in the left column
- **AC5.3**: clicking a color swatch changes the drawing color
- **AC5.4**: `+` and `-` buttons appear at the bottom of the color column; clicking them does nothing
- **AC6.1**: color swatches and category buttons appear in two side-by-side columns on the left
- **AC6.2**: the sidebar is to the left of the canvas
- **AC6.3**: the top bar spans the full width above the sidebar+canvas area
- **AC6.4**: the canvas fills the available area without being clipped

**Step 5: Run tests**

```bash
cd /Users/ggissel/code/draw-this/.worktrees/tool-category-layout
npm run test:run
```

Expected: All 56 tests pass. CSS changes do not affect the jsdom-based test suite.

**Step 6: Commit**

```bash
git add style.css
git commit -m "style: add flex layout and category show/hide CSS rules"
```
<!-- END_TASK_1 -->
