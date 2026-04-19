# Tool Category Layout — Phase 3: Category JS Wiring

**Goal:** Wire category click behavior into drawHorse.ts and main.ts, and test it.

**Architecture:** Single event listener block added to `addListeners()`. Null-checked `#top-tools` reference inside the handler so tests without the full DOM don't throw. Default category (`pen`) `selectedControl` applied in `main.ts` `window.onload` after `addListeners()`.

**Tech Stack:** TypeScript, Vitest

**Scope:** Phase 3 of 3

**Codebase verified:** 2026-04-17

---

## Acceptance Criteria Coverage

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
- **tool-category-layout.AC3.3 Success:** On page load, 'pen' is the active category

### tool-category-layout.AC5: Color column (partial)
- **tool-category-layout.AC5.2 Success:** The 'r' rainbow button appears in `#colors-col` and sets `selectedColor` to `'rainbow'` when clicked

### tool-category-layout.AC4: Tool selection still works
- **tool-category-layout.AC4.1 Success:** Clicking a visible tool button in `#top-tools` selects that tool (`selectedControl` class moves to it)
- **tool-category-layout.AC4.2 Success:** Drawing with the selected tool produces the same output as before the refactor
- **tool-category-layout.AC4.3 Success:** All five drawing tools (pencil, drips, bubbles, stamp, eraser) work correctly after the refactor

---

<!-- START_SUBCOMPONENT_A (tasks 1-2) -->
<!-- START_TASK_1 -->
### Task 1: Add category listener to drawHorse.ts and initialization to main.ts

**Verifies:** tool-category-layout.AC2.1–AC2.7, AC3.1, AC3.2, AC3.3

**Files:**
- Modify: `src/drawHorse.ts` (add listener block after the document click listener in `addListeners()`)
- Modify: `src/main.ts` (add default category init after `addListeners()`)

**Step 1: Read `src/drawHorse.ts`**

Read the file to find the exact closing `})` of the document click listener in `addListeners()` (currently around line 131). This is the insertion point.

**Step 2: Add category listener block in `src/drawHorse.ts`**

Immediately after the closing `})` of the document click listener, add:

```typescript
document.querySelectorAll('.category').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const cat = (e.currentTarget as HTMLElement).dataset.category
    const topTools = document.querySelector('#top-tools') as HTMLElement | null
    if (cat && topTools) {
      topTools.dataset.activeCategory = cat
    }
    document.querySelectorAll('.category').forEach(b =>
      b.classList.remove('selectedControl')
    )
    ;(e.currentTarget as HTMLElement).classList.add('selectedControl')
  })
})
```

**Step 3: Add default category initialization in `src/main.ts`**

Read `src/main.ts` to find the `drawHorse.addListeners()` call. Immediately after that line, add:

```typescript
document.querySelector<HTMLElement>('.category[data-category="pen"]')
  ?.classList.add('selectedControl')
```

**Step 4: Update `resize()` in `src/drawHorse.ts` and the parallel formula in `src/main.ts`**

The current `resize()` formula subtracts `drawHorse.colors.offsetHeight` (the footer) to calculate available canvas height. After the layout restructure, the footer is nearly empty and the visual height boundary is now `#topbar`, not the footer.

In `src/drawHorse.ts`, in the `resize()` method, replace lines 92-95:

```typescript
// BEFORE:
drawHorse.canvasHeight = Math.floor(
  0.95 *
    (window.innerHeight - drawHorse.header.offsetHeight - drawHorse.colors.offsetHeight)
)

// AFTER:
const topbar = document.getElementById('topbar') as HTMLElement | null
drawHorse.canvasHeight = Math.floor(
  0.95 *
    (window.innerHeight - drawHorse.header.offsetHeight - (topbar?.offsetHeight ?? 0))
)
```

In `src/main.ts`, lines 29-32 contain a duplicate of the same initial sizing formula (overwritten immediately by `resize()` on line 46, but should stay consistent). Apply the same replacement:

```typescript
// BEFORE:
drawHorse.canvasHeight = Math.floor(
  0.95 *
    (window.innerHeight - drawHorse.header.offsetHeight - drawHorse.colors.offsetHeight)
)

// AFTER:
const topbar = document.getElementById('topbar') as HTMLElement | null
drawHorse.canvasHeight = Math.floor(
  0.95 *
    (window.innerHeight - drawHorse.header.offsetHeight - (topbar?.offsetHeight ?? 0))
)
```

Note: The `main.ts` initial sizing is immediately overwritten by `resize()` on line 46, so this is a code-consistency fix, not a functional requirement.

**Step 5: Typecheck**

```bash
cd /Users/ggissel/code/draw-this/.worktrees/tool-category-layout
npm run typecheck
```

Expected: Zero errors.
<!-- END_TASK_1 -->

<!-- START_TASK_2 -->
### Task 2: Update test setup and write category tests

**Verifies:** tool-category-layout.AC2.1–AC2.7, AC3.1, AC3.2, AC5.2

**Files:**
- Modify: `src/test/setup.ts` (update DOM to match new structure)
- Create: `src/test/drawHorse/categories.test.ts`

**Step 1: Read `src/test/setup.ts`**

Read the file to find the `document.body.innerHTML` template string and the `<div id="controls">` block inside it.

**Step 2: Update the DOM template in `src/test/setup.ts`**

Make these changes to the `document.body.innerHTML` template string:

1. Change only the **opening** tag of the controls div: replace `<div id="controls">` with `<div id="top-tools" data-active-category="pen">`. The closing `</div>` stays as-is.

2. Add `data-category` attributes to each tool button inside that div:
   - `id="pencil"` → add `data-category="pen"`
   - `id="drips"` → add `data-category="brush"`
   - `id="bubbles"` → add `data-category="toy"`
   - `id="stamp"` → add `data-category="stamp"`
   - `id="eraser"` → add `data-category="eraser"`
   - `id="bucket"` → add `data-category="bucket"` (it's a stub category — keep the button but mark its category)
   - `id="oops"`, `id="nuke"`, `id="screenshot"` → no `data-category` (these are actions, not category tools)

3. Also add `<button id="rainbow" class="colorChoice">r</button>` inside the `<div id="colorchooser">` block (after the `white` button). This is needed for the AC5.2 test.

4. After the `#top-tools` closing `</div>`, add:

```html
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
```

**Note on test fixture scope:** The fixture intentionally does not replicate the full `#main > #topbar > #body > #sidebar` container hierarchy from `index.html`. It renames `#controls` to `#top-tools` and adds category buttons, which is sufficient to exercise the category JS logic. The following ACs rely on visual verification in a browser (Phase 2 Step 3) rather than automated tests: AC1.1–AC1.5 (standard tools visible in topbar), AC2.7 (non-active tools hidden via CSS), AC5.1/AC5.3/AC5.4 (color column layout), AC6.1–AC6.4 (overall layout matches mockup).

**Step 3: Run existing tests to confirm nothing broke**

```bash
cd /Users/ggissel/code/draw-this/.worktrees/tool-category-layout
npm run test:run
```

Expected: All 56 tests still pass. If any fail, the `data-category` attributes or id renaming introduced a conflict — check which test references the element by name and fix.

**Step 4: Create `src/test/drawHorse/categories.test.ts`**

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { drawHorse } from '../../drawHorse'

describe('category selection', () => {
  beforeEach(() => {
    drawHorse.addListeners()
  })

  it('clicking a category button sets data-active-category on #top-tools (AC2.1–AC2.5)', () => {
    const topTools = document.getElementById('top-tools') as HTMLElement
    const categories = ['pen', 'brush', 'toy', 'stamp', 'eraser']
    for (const cat of categories) {
      const btn = document.querySelector(`.category[data-category="${cat}"]`) as HTMLElement
      btn.click()
      expect(topTools.dataset.activeCategory).toBe(cat)
    }
  })

  it('clicking a stub category sets data-active-category to that stub (AC2.6)', () => {
    const topTools = document.getElementById('top-tools') as HTMLElement
    const filterBtn = document.querySelector('.category[data-category="filter"]') as HTMLElement
    filterBtn.click()
    expect(topTools.dataset.activeCategory).toBe('filter')
  })

  it('clicking a category adds selectedControl to that button (AC3.1)', () => {
    const brushBtn = document.querySelector('.category[data-category="brush"]') as HTMLElement
    brushBtn.click()
    expect(brushBtn.classList.contains('selectedControl')).toBe(true)
  })

  it('clicking a new category removes selectedControl from the previous one (AC3.2)', () => {
    const penBtn = document.querySelector('.category[data-category="pen"]') as HTMLElement
    const brushBtn = document.querySelector('.category[data-category="brush"]') as HTMLElement
    penBtn.classList.add('selectedControl')
    brushBtn.click()
    expect(penBtn.classList.contains('selectedControl')).toBe(false)
    expect(brushBtn.classList.contains('selectedControl')).toBe(true)
  })

  it('clicking the rainbow color button sets selectedColor to rainbow (AC5.2)', () => {
    const rainbowBtn = document.getElementById('rainbow') as HTMLElement
    rainbowBtn.click()
    expect((globalThis as any).__drawHorse.selectedColor).toBe('rainbow')
  })
})
```

**Step 5: Build, then run all tests and typecheck**

The test harness evals `script.js` (the compiled bundle). TypeScript source changes must be compiled before running tests.

```bash
npm run build
npm run check
```

Expected: Build succeeds with no errors. All tests pass (56 existing + 5 new = 61 total), zero typecheck errors.

**Step 6: Commit**

```bash
git add src/drawHorse.ts src/main.ts src/test/setup.ts src/test/drawHorse/categories.test.ts
git commit -m "feat: wire category selection into drawHorse and add tests"
```
<!-- END_TASK_2 -->
<!-- END_SUBCOMPONENT_A -->
