# TypeScript Migration — Phase 5: Port drawHorse and Stamps to TypeScript

**Goal:** Port the main application state object (`drawHorse`) and stamp data to TypeScript. Create `src/main.ts` as the entry point. Verify esbuild produces a browser-ready `script.js`.

**Architecture:** `src/stamps.ts` extracts stamp data from `drawHorse.stamps`. `src/drawHorse.ts` (Phase 4's stub) is replaced with the full implementation — it imports `tools` from `src/tools/index.ts` and `stamps` from `src/stamps.ts`. Tools import `drawHorse` from `src/drawHorse.ts` (circular dependency — safe because tools only reference drawHorse inside method bodies, not at module initialization time). `src/main.ts` runs the window.onload initialization sequence. esbuild bundles everything into a single IIFE `script.js`.

**Tech Stack:** TypeScript, esbuild, Vitest, jsdom

**Scope:** Phase 5 of 6

**Codebase verified:** 2026-03-23 — `drawHorse` object spans lines 471–728 of `script.js`. 8 active stamps (horse, beetle, anteater, kitty, bunny, manatee, whale, toucan) at lines 480–545. window.onload at lines 733–766. Duplicate `selectedColor` confirmed at lines 472 and 478 (known bug — only one will appear in TypeScript but behavior is preserved since the second definition is the one JS uses).

---

## Acceptance Criteria Coverage

### typescript-migration.AC1: Tool behaviors are preserved
- **typescript-migration.AC1.6 Success:** oops.onclick() pops undoStack and calls ctx.putImageData
- **typescript-migration.AC1.7 Success:** endPosition() pushes a full canvas ImageData snapshot to undoStack
- **typescript-migration.AC1.8 Success:** color button click sets drawHorse.selectedColor to the button's id
- **typescript-migration.AC1.9 Success:** stamp choice click sets drawHorse.selectedStamp

### typescript-migration.AC5: Build output is browser-clean
- **typescript-migration.AC5.1 Success:** tsc --noEmit exits with 0 type errors
- **typescript-migration.AC5.2 Success:** esbuild produces a single script.js file
- **typescript-migration.AC5.3 Success:** compiled script.js contains no ES module syntax (import/export)
- **typescript-migration.AC5.4 Success:** compiled script.js contains no AMD, CommonJS, or SystemJS wrappers

---

<!-- START_SUBCOMPONENT_A (tasks 1) -->
<!-- START_TASK_1 -->
### Task 1: Create src/stamps.ts

**Files:**
- Create: `src/stamps.ts`

**Before starting:** Read `script.js` lines 479–545 to extract the 8 active stamp objects. Each has `id`, `name`, and `url` (base64-encoded SVG string). Do NOT read beyond line 545 — the stamp data is large due to base64 SVGs, but you need all 8 entries. Two commented-out stamps (palm, cactus) at lines 547–554 are excluded.

**Step 1: Create the file**

Structure the file to match the exact stamp objects from `script.js`. Preserve the `url` values exactly.

```typescript
// src/stamps.ts
import type { Stamp } from './types'

export const stamps: Record<string, Stamp> = {
  horse: {
    id: 'horse',
    name: 'Horse',
    url: '/* copy exact base64 url from script.js */',
  },
  beetle: {
    id: 'beetle',
    name: 'Beetle',
    url: '/* copy exact base64 url from script.js */',
  },
  anteater: {
    id: 'anteater',
    name: 'Anteater',
    url: '/* copy exact base64 url from script.js */',
  },
  kitty: {
    id: 'kitty',
    name: 'Kitty',
    url: '/* copy exact base64 url from script.js */',
  },
  bunny: {
    id: 'bunny',
    name: 'Bunny',
    url: '/* copy exact base64 url from script.js */',
  },
  manatee: {
    id: 'manatee',
    name: 'Manatee',
    url: '/* copy exact base64 url from script.js */',
  },
  whale: {
    id: 'whale',
    name: 'Whale',
    url: '/* copy exact base64 url from script.js */',
  },
  toucan: {
    id: 'toucan',
    name: 'Toucan',
    url: '/* copy exact base64 url from script.js */',
  },
}
```

**Step 2: Copy the exact url values from script.js**

For each stamp, find the `url:` value in `script.js` and paste it into the corresponding entry. Each URL is a long base64 string. The TypeScript file will be large — this is expected.

**Step 3: Verify**

```bash
cd /Users/ggissel/code/draw-this/.worktrees/typescript-migration
npm run typecheck
```

Expected: exits 0.

**Step 4: Commit**

```bash
git add src/stamps.ts
git commit -m "feat: extract stamp data to src/stamps.ts"
```
<!-- END_TASK_1 -->
<!-- END_SUBCOMPONENT_A -->

<!-- START_SUBCOMPONENT_B (tasks 2) -->
<!-- START_TASK_2 -->
### Task 2: Replace src/drawHorse.ts with full implementation

**Files:**
- Modify (replace): `src/drawHorse.ts`

**IMPORTANT: Circular dependency.** `drawHorse.ts` imports `tools` from `./tools/index`. Tools import `drawHorse` from `../drawHorse`. This circular dependency is safe because:
1. When drawHorse.ts executes, it imports tools/index.ts first
2. tools/index.ts imports pencil.ts etc., which import drawHorse.ts (partially loaded)
3. At that point, `drawHorse` is not yet exported — but tools only USE it inside method bodies, not at module initialization
4. By the time any tool method is called (after window.onload), `drawHorse` is fully initialized
5. Result: the circular dependency resolves correctly at runtime

**Before starting:** Read `script.js` lines 471–728 for the complete drawHorse object. Key things to note:
- `selectedColor` appears twice (lines 472 and 478) — include it only once in TypeScript (both values are `"black"` — TypeScript won't allow duplicate property names)
- `ctx` starts as `undefined` — use definite assignment assertion
- `beginPosition` has a commented-out `drawsImmediately` block — preserve the comment
- The `draw` method checks `e.buttons === 1` for mouse or `e.touches.length > 0` for touch
- `addListeners` uses the global `event` object in the original (bug) — use `e` parameter instead for TypeScript compatibility
- `colorChoices` is `HTMLCollectionOf<Element>` or similar

**Note on DrawHorseContext scope:** The `DrawHorseContext` interface defined in Phase 4 covers only the subset of drawHorse properties that tools reference. The full `drawHorse` object in `drawHorse.ts` has additional properties (`header`, `stretcher`, `colors`, `canvas`, `canvasWidth`, `canvasHeight`, etc.) not in the interface — these are defined inline in the object literal's type annotation.

**Step 1: Replace the Phase 4 stub with the full implementation**

```typescript
// src/drawHorse.ts
import type { DrawHorseContext, Tool, Stamp } from './types'
import { tools } from './tools/index'
import { stamps } from './stamps'

// drawHorse is exported as a const object so tools can import it by reference.
// The circular import (tools → drawHorse → tools) is safe because tools only
// reference drawHorse inside method bodies, never at module initialization time.
export const drawHorse: DrawHorseContext & {
  header: HTMLElement
  stretcher: HTMLElement
  colors: HTMLElement
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  currentTool: Tool
  selectedColor: string
  selectedStamp: Stamp | undefined
  undoStack: ImageData[]
  pos: { x: number; y: number }
  colorChoices: HTMLCollectionOf<Element>
  canvasWidth: number
  canvasHeight: number
  stamps: Record<string, Stamp>
  setPosition: (e: MouseEvent | TouchEvent) => void
  beginPosition: (e: MouseEvent | TouchEvent) => void
  endPosition: (e: MouseEvent | TouchEvent) => void
  draw: (e: MouseEvent | TouchEvent) => void
  resize: () => void
  addListeners: () => void
  setupColorChooser: () => void
  getColorChoiceClickHandler: (cc: Element) => (e: Event) => void
  makeStampChoiceHandler: (cc: Element) => (e: Event) => void
  setupStamps: () => void
  setupTools: () => void
  showStampSelectors: () => void
  hideStampSelectors: () => void
  showColorSelectors: () => void
} = {
  header: document.getElementById('header') as HTMLElement,
  stretcher: document.getElementById('stretcher') as HTMLElement,
  colors: document.getElementById('colors') as HTMLElement,
  canvas: document.getElementById('drawHere') as HTMLCanvasElement,

  // Known bug preserved: selectedColor appears twice in script.js (lines 472 and 478).
  // JavaScript uses the last definition; TypeScript only allows one — behavior is identical.
  selectedColor: 'black',
  currentTool: tools.pencil,
  selectedStamp: undefined,
  undoStack: [],
  ctx: undefined as unknown as CanvasRenderingContext2D,  // set in window.onload
  pos: { x: 0, y: 0 },
  colorChoices: [] as unknown as HTMLCollectionOf<Element>,
  canvasWidth: 0,
  canvasHeight: 0,
  stamps,

  setPosition(e) {
    if (e.target === drawHorse.canvas) e.preventDefault()
    const bcr = (e.target as Element).getBoundingClientRect()
    const touch = (e as TouchEvent).touches?.[0]
    if (touch) {
      drawHorse.pos.x = touch.clientX - bcr.x
      drawHorse.pos.y = touch.clientY - bcr.y
    } else {
      drawHorse.pos.x = (e as MouseEvent).clientX - bcr.x
      drawHorse.pos.y = (e as MouseEvent).clientY - bcr.y
    }
  },

  beginPosition(e) {
    drawHorse.setPosition(e)
    // if (drawHorse.currentTool.drawsImmediately) {
    //   drawHorse.draw(e);
    // }
  },

  endPosition(e) {
    drawHorse.currentTool.stopDrawing(e)
    drawHorse.setPosition(e)
    drawHorse.undoStack.push(
      drawHorse.ctx.getImageData(0, 0, drawHorse.ctx.canvas.width, drawHorse.ctx.canvas.height)
    )
  },

  draw(e) {
    const me = e as MouseEvent
    const te = e as TouchEvent
    if ((me.buttons && me.buttons === 1) || (te.touches && te.touches.length > 0)) {
      drawHorse.currentTool.draw(e)
    }
  },

  resize() {
    drawHorse.canvasWidth = drawHorse.stretcher.offsetWidth
    drawHorse.canvasHeight = Math.floor(
      0.95 *
        (window.innerHeight - drawHorse.header.offsetHeight - drawHorse.colors.offsetHeight)
    )
    drawHorse.ctx.canvas.width = drawHorse.stretcher.offsetWidth
    drawHorse.ctx.canvas.height = drawHorse.canvasHeight
    drawHorse.stretcher.style.height = drawHorse.canvasHeight + 'px'
    drawHorse.stretcher.setAttribute(
      'style',
      `width:${drawHorse.canvasWidth}px;height:${drawHorse.canvasHeight}px;`
    )
  },

  addListeners() {
    window.addEventListener('resize', drawHorse.resize)

    // The original uses the implicit global `event` object (e.g., `event.target.closest(".tool")`).
    // TypeScript strict mode does not allow implicit globals. Using the `e` parameter is
    // semantically equivalent in all standard browser event dispatch paths.
    document.addEventListener(
      'click',
      function (e) {
        const toolEl = (e.target as Element).closest?.('.tool')
        if (!toolEl) return
        const tool = tools[toolEl.id]
        const toolControls = document.getElementsByClassName('tool')

        if (tool.selectable) {
          for (let i = 0; i < toolControls.length; i++) {
            toolControls[i].classList.remove('selectedControl')
          }
          toolEl.classList.add('selectedControl')
          drawHorse.currentTool = tool
        }
        tool.onclick(e)
      },
      false
    )

    drawHorse.canvas.addEventListener('mousemove', function (e) {
      if (!drawHorse.currentTool.drawsImmediately) drawHorse.draw(e)
    })
    drawHorse.canvas.addEventListener('mousedown', function (e) {
      drawHorse.beginPosition(e)
      drawHorse.draw(e)
    })
    drawHorse.canvas.addEventListener('mouseup', function (e) {
      drawHorse.endPosition(e)
    })

    drawHorse.canvas.addEventListener('touchmove', drawHorse.draw)
    drawHorse.canvas.addEventListener('touchstart', function (e) {
      drawHorse.beginPosition(e)
      drawHorse.draw(e)
    })
    drawHorse.canvas.addEventListener('touchend', function (e) {
      drawHorse.endPosition(e)
    })
  },

  setupColorChooser() {
    drawHorse.colorChoices = document.getElementsByClassName('colorChoice')
    for (let i = 0; i < drawHorse.colorChoices.length; i++) {
      ;(drawHorse.colorChoices[i] as HTMLElement).onclick =
        drawHorse.getColorChoiceClickHandler(drawHorse.colorChoices[i])
    }
  },

  getColorChoiceClickHandler(cc) {
    return (e) => {
      drawHorse.selectedColor = (cc as HTMLElement).id
      const colorChoiceControls = document.getElementsByClassName('colorChoice')
      for (let i = 0; i < colorChoiceControls.length; i++) {
        colorChoiceControls[i].classList.remove('selectedColorChoice')
      }
      ;(e.target as Element).classList.add('selectedColorChoice')
    }
  },

  makeStampChoiceHandler(cc) {
    return (_e) => {
      drawHorse.selectedStamp = drawHorse.stamps[(cc as HTMLElement).id]
    }
  },

  setupStamps() {
    Object.entries(drawHorse.stamps).forEach(([_key, value]) => {
      const stampchooser = document.getElementById('stampchooser')!
      const colorized = window.btoa(
        window
          .atob(value.url)
          .replaceAll(
            '%%%%',
            ` style='fill:${drawHorse.selectedColor};stroke:${drawHorse.selectedColor};' `
          )
      )
      stampchooser.innerHTML +=
        `<button id='${value.id}' class='stampchoice'>` +
        `<img width='30px' max-width='30px' max-height='30px' ` +
        `src='data:image/svg+xml;base64,${colorized}' alt='${value.name}'/>` +
        `</button>`
    })

    const stampChoices = document.getElementsByClassName('stampchoice')
    for (let i = 0; i < stampChoices.length; i++) {
      ;(stampChoices[i] as HTMLElement).onclick = drawHorse.makeStampChoiceHandler(stampChoices[i])
    }
    drawHorse.selectedStamp = drawHorse.stamps['horse']
  },

  setupTools() {
    // Original body is a no-op loop — preserved for structural parity
    const toolButtons = document.getElementsByClassName('tool')
    for (let i = 0; i < toolButtons.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _toolButton = toolButtons[i]
    }
  },

  showStampSelectors() {
    const stampchooser = document.getElementById('stampchooser')!
    stampchooser.style.display = ''
  },

  hideStampSelectors() {
    const stampchooser = document.getElementById('stampchooser')!
    stampchooser.style.display = 'none'
  },

  showColorSelectors() {
    const colorchooser = document.getElementById('colorchooser')!
    colorchooser.style.display = ''
  },
}
```

**Step 2: Update src/types.ts to remove DrawHorseContext if it conflicts**

The `DrawHorseContext` interface in `types.ts` (added in Phase 4) only listed the subset of properties tools need. The full drawHorse object has additional properties. The TypeScript type in this file can be the full union or you can just remove `DrawHorseContext` from `types.ts` since it's no longer needed as a separate type (the drawHorse.ts file defines its own inline type). Check if any tool still imports `DrawHorseContext` from `../types` — if so, keep it; if not, it can be removed.

**Step 3: Verify type-checks**

```bash
npm run typecheck
```

Expected: exits 0. There may be TypeScript errors on first pass due to type mismatches in the inline type annotation — adjust the type to match what TypeScript infers. If typing the entire object inline is too complex, use `as any` for specific properties that are genuinely hard to type (e.g. `ctx: undefined as any`) and add comments explaining why.

**Step 4: Commit**

```bash
git add src/drawHorse.ts
git commit -m "feat: replace drawHorse stub with full TypeScript implementation"
```
<!-- END_TASK_2 -->
<!-- END_SUBCOMPONENT_B -->

<!-- START_SUBCOMPONENT_C (tasks 3) -->
<!-- START_TASK_3 -->
### Task 3: Create src/main.ts

**Files:**
- Create: `src/main.ts`

This is the esbuild entry point. It runs the `window.onload` initialization sequence. The original `window.onload` block is in `script.js` lines 733–766.

**Step 1: Create the file**

```typescript
// src/main.ts
import { drawHorse } from './drawHorse'

window.onload = (_event) => {
  // Set up color choice click handlers
  drawHorse.setupColorChooser()

  // Calculate initial canvas dimensions
  drawHorse.canvasWidth = drawHorse.stretcher.offsetWidth
  drawHorse.canvasHeight = Math.floor(
    0.95 *
      (window.innerHeight - drawHorse.header.offsetHeight - drawHorse.colors.offsetHeight)
  )
  document.body.style.margin = '0'
  drawHorse.canvas.style.width = String(drawHorse.stretcher.offsetWidth)
  drawHorse.canvas.style.height = String(drawHorse.canvasHeight)
  drawHorse.stretcher.style.height = drawHorse.canvasHeight + 'px'
  drawHorse.stretcher.setAttribute(
    'style',
    `width:${drawHorse.canvasWidth}px;height:${drawHorse.canvasHeight}px;`
  )

  // Assign canvas 2D context
  drawHorse.ctx = drawHorse.canvas.getContext('2d') as CanvasRenderingContext2D

  // Size canvas to window
  drawHorse.resize()

  // Register mouse and touch event listeners
  drawHorse.addListeners()

  // Build stamp chooser UI
  drawHorse.setupStamps()

  // Set up tool button click handlers (no-op in original, preserved)
  drawHorse.setupTools()
}
```

**Step 2: Verify type-checks**

```bash
npm run typecheck
```

Expected: exits 0.

**Step 3: Commit**

```bash
git add src/main.ts
git commit -m "feat: add src/main.ts entry point with window.onload initialization"
```
<!-- END_TASK_3 -->
<!-- END_SUBCOMPONENT_C -->

<!-- START_SUBCOMPONENT_D (tasks 4-5) -->
<!-- START_TASK_4 -->
### Task 4: Create src/test/drawHorse/state.test.ts

**Verifies:** typescript-migration.AC1.7, typescript-migration.AC1.8, typescript-migration.AC1.9

**Files:**
- Create: `src/test/drawHorse/state.test.ts`

Tests import `drawHorse` from `../../drawHorse` directly. The setup.ts still evals `script.js` and fires `window.onload`, which means the drawHorse TypeScript module is initialized alongside the eval harness. Tests set `drawHorse.ctx` to the mock canvas context.

**Key consideration:** Both the eval'd `script.js` and the imported `drawHorse.ts` module run in the same jsdom environment. The imported `drawHorse` object is different from the eval'd `__drawHorse` — they are separate objects. This test file tests the TypeScript `drawHorse` module directly.

**Important note on DOM handler ordering:** If color button click handlers produce unexpected results (e.g., the eval harness `drawHorse` intercepts clicks instead of the TypeScript module's `drawHorse`), add a `beforeEach` that calls `drawHorse.setupColorChooser()` to reset the onclick handlers to the TypeScript module's version.

```typescript
// src/test/drawHorse/state.test.ts
import { drawHorse } from '../../drawHorse'

describe('drawHorse state (import-based)', () => {
  let ctx: any

  beforeEach(() => {
    vi.clearAllMocks()
    const canvas = document.getElementById('drawHere') as HTMLCanvasElement
    ctx = canvas.getContext('2d') as any
    ctx.__clearDrawCalls()
    drawHorse.ctx = ctx
    drawHorse.undoStack = []
    drawHorse.selectedColor = 'black'
  })

  describe('AC1.7: endPosition() pushes to undoStack', () => {
    it('pushes an ImageData snapshot after each call', () => {
      expect(drawHorse.undoStack.length).toBe(0)
      drawHorse.endPosition(new MouseEvent('mouseup'))
      expect(drawHorse.undoStack.length).toBe(1)
    })
  })

  describe('AC1.8: color button click sets selectedColor', () => {
    it('clicking a color button sets drawHorse.selectedColor to the button id', () => {
      // setupColorChooser is called in window.onload (which runs from setup.ts via __drawHorse)
      // For the TypeScript drawHorse object, call setupColorChooser directly
      drawHorse.setupColorChooser()
      const redButton = document.getElementById('red') as HTMLElement
      redButton.click()
      expect(drawHorse.selectedColor).toBe('red')
    })
  })

  describe('AC1.9: stamp choice click sets selectedStamp', () => {
    it('clicking a stamp choice sets drawHorse.selectedStamp', () => {
      // setupStamps populates #stampchooser — call it on the TypeScript drawHorse
      // Note: stampchooser may already have entries from the eval harness (setup.ts)
      // Clear it first to avoid duplicates
      const stampchooser = document.getElementById('stampchooser')!
      stampchooser.innerHTML = ''
      drawHorse.setupStamps()

      const stampChoices = document.querySelectorAll<HTMLElement>('#stampchooser .stampchoice')
      expect(stampChoices.length).toBeGreaterThan(0)
      stampChoices[0].click()
      expect(drawHorse.selectedStamp).toBeDefined()
    })
  })
})
```

**Step 1: Run the test**

```bash
npm run test:run -- src/test/drawHorse/state.test.ts
```

Expected: All tests pass. If `setupColorChooser` click handlers conflict with the eval harness (both attach handlers to the same buttons), adjust by resetting `onclick` on color buttons before calling `drawHorse.setupColorChooser()` in the test.

**Step 2: Commit**

```bash
git add src/test/drawHorse/state.test.ts
git commit -m "test: add import-based drawHorse state tests (AC1.7–1.9)"
```
<!-- END_TASK_4 -->

<!-- START_TASK_5 -->
### Task 5: Create src/test/drawHorse/undo.test.ts

**Verifies:** typescript-migration.AC1.6

**Files:**
- Create: `src/test/drawHorse/undo.test.ts`

```typescript
// src/test/drawHorse/undo.test.ts
import { drawHorse } from '../../drawHorse'
import { tools } from '../../tools/index'

describe('undo (import-based)', () => {
  let ctx: any

  beforeEach(() => {
    vi.clearAllMocks()
    const canvas = document.getElementById('drawHere') as HTMLCanvasElement
    ctx = canvas.getContext('2d') as any
    ctx.__clearDrawCalls()
    drawHorse.ctx = ctx
    drawHorse.undoStack = []
  })

  it('AC1.6: oops.onclick() pops undoStack and calls ctx.putImageData', () => {
    drawHorse.endPosition(new MouseEvent('mouseup'))
    expect(drawHorse.undoStack.length).toBe(1)

    ctx.__clearDrawCalls()
    tools.oops.onclick(new MouseEvent('click'))

    expect(drawHorse.undoStack.length).toBe(0)
    const calls = ctx.__getDrawCalls()
    expect(calls.some((c: any) => c.type === 'putImageData')).toBe(true)
  })
})
```

**Step 1: Run the test**

```bash
npm run test:run -- src/test/drawHorse/undo.test.ts
```

Expected: Test passes.

**Step 2: Confirm baseline tests still pass**

```bash
npm run test:run -- src/test/baseline/
```

Expected: All baseline tests still pass.

**Step 3: Commit**

```bash
git add src/test/drawHorse/undo.test.ts
git commit -m "test: add import-based undo test (AC1.6)"
```
<!-- END_TASK_5 -->
<!-- END_SUBCOMPONENT_D -->

<!-- START_TASK_6 -->
### Task 6: Verify esbuild build (AC5.1–AC5.4)

**Verifies:** typescript-migration.AC5.1, typescript-migration.AC5.2, typescript-migration.AC5.3, typescript-migration.AC5.4

**Step 1: Type-check (AC5.1)**

```bash
cd /Users/ggissel/code/draw-this/.worktrees/typescript-migration
npm run typecheck
```

Expected: exits 0 — no TypeScript errors.

**Step 2: Build with esbuild (AC5.2)**

```bash
npm run build
```

Expected: exits 0. `script.js` is created/updated at the repo root.

**Step 3: Verify no ES module syntax (AC5.3)**

```bash
grep -c "^import\|^export" script.js || true
```

Expected: 0 — esbuild's IIFE format removes all module syntax.

**Step 4: Verify no module wrappers (AC5.4)**

esbuild's `--format=iife` wraps output in `(() => { ... })()`. This is NOT AMD, CommonJS, or SystemJS. Verify:

```bash
head -3 script.js
```

Expected: The file begins with something like `(() => {` — this is an IIFE, not a module system wrapper.

```bash
grep -c "define(\|module\.exports\|System\.register" script.js || true
```

Expected: 0 — no AMD (`define`), CommonJS (`module.exports`), or SystemJS (`System.register`) wrappers.

**Step 5: Basic sanity check on compiled script.js**

```bash
wc -l script.js
```

Expected: a large number (tens of thousands of lines due to base64 stamp data). If the output is very small (< 100 lines), esbuild may have tree-shaken everything — check that `main.ts` actually calls drawHorse methods and that the entry point is correct.

**Step 6: Commit build if script.js changed significantly**

The generated `script.js` is checked into the repo (it is the browser asset). If it has changed from the Phase 1 version, commit it:

```bash
git add script.js
git commit -m "build: regenerate script.js from TypeScript source"
```
<!-- END_TASK_6 -->

<!-- START_TASK_7 -->
### Task 7: Run full test suite and verify

**Step 1: Run all tests**

```bash
cd /Users/ggissel/code/draw-this/.worktrees/typescript-migration
npm run test:run
```

Expected: All test files pass. Baseline tests must still pass — `script.js` is still the same original file that the eval harness reads (the built output does not affect the eval harness since setup.ts reads `script.js` from disk and the original file was the pre-TypeScript version).

Wait — at this point, `npm run build` has just replaced `script.js` with the esbuild output. The baseline eval harness reads `script.js` from disk. If the built output differs from the original in any behavior, baseline tests may fail.

**This is the expected outcome and a feature, not a bug:** if baseline tests now fail, it means the TypeScript port has a behavioral difference that needs to be fixed before Phase 6. Fix any failing baseline tests by correcting the TypeScript implementation.

**Step 2: Type-check**

```bash
npm run typecheck
```

Expected: exits 0.

**Step 3: Run combined check**

```bash
npm run check
```

Expected: `vitest run && tsc --noEmit` both pass.

**Step 4: Final commit**

```bash
git status
```

All files should be committed. If any remain:

```bash
git add -A
git commit -m "feat: complete Phase 5 — drawHorse and stamps ported to TypeScript"
```
<!-- END_TASK_7 -->
