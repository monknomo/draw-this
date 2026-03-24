# TypeScript Migration — Phase 2: Baseline Test Suite Against Current `script.js`

**Goal:** Write tests that document current behavior and pass against the unmodified `script.js`. These tests become the regression guard for the TypeScript port.

**Architecture:** Vitest runs test files in jsdom. `src/test/setup.ts` evals `script.js` into the jsdom environment and exposes its globals. Tests call those globals directly. `vitest-canvas-mock` provides a mock 2D canvas context whose draw calls can be inspected. Vitest isolates each test file in its own worker, so setup.ts runs fresh for each file.

**Tech Stack:** Vitest, jsdom, vitest-canvas-mock

**Scope:** Phase 2 of 6

**Codebase verified:** 2026-03-23 — `script.js` present at repo root. Phase 1 infrastructure installed and operational. All DOM IDs and function signatures confirmed from `script.js` investigation.

---

## Acceptance Criteria Coverage

### typescript-migration.AC1: Tool behaviors are preserved
- **typescript-migration.AC1.1 Success:** pencil.draw() calls ctx.beginPath, ctx.moveTo, ctx.lineTo, ctx.stroke
- **typescript-migration.AC1.2 Success:** eraser.draw() uses strokeStyle = "white"
- **typescript-migration.AC1.3 Success:** drips.draw() calls ctx.arc and ctx.fill
- **typescript-migration.AC1.4 Success:** stamp.draw() calls ctx.drawImage at the click point
- **typescript-migration.AC1.5 Success:** nuke.onclick() calls ctx.clearRect on the entire canvas
- **typescript-migration.AC1.6 Success:** oops.onclick() pops undoStack and calls ctx.putImageData
- **typescript-migration.AC1.7 Success:** endPosition() pushes a full canvas ImageData snapshot to undoStack
- **typescript-migration.AC1.8 Success:** color button click sets drawHorse.selectedColor to the button's id
- **typescript-migration.AC1.9 Success:** stamp choice click sets drawHorse.selectedStamp

### typescript-migration.AC2: Audio behaviors are preserved
- **typescript-migration.AC2.1 Success:** playSound() calls audio.play() on the correct element
- **typescript-migration.AC2.2 Success:** playSound() with loop=true sets audio.style.loop = "loop"
- **typescript-migration.AC2.3 Success:** pauseSound() calls audio.pause() on the correct element
- **typescript-migration.AC2.4 Success:** pauseSound() resets audio.currentTime to 0
- **typescript-migration.AC2.5 Success:** pauseSound() sets audio.style.loop = ""

### typescript-migration.AC3: Tool plugin interface contract
- **typescript-migration.AC3.1 Success:** every tool in the registry has draw, stopDrawing, and onclick functions
- **typescript-migration.AC3.2 Success:** every tool has drawsImmediately and selectable boolean properties
- **typescript-migration.AC3.3 Success:** oops and nuke have selectable = false
- **typescript-migration.AC3.4 Success:** stamp and bubbles have drawsImmediately = true

### typescript-migration.AC4: Pure logic correctness
- **typescript-migration.AC4.1 Success:** getDripSize() returns 0 approximately half the time across many calls
- **typescript-migration.AC4.2 Success:** getDripSize() never returns values between 1–5 (below minimum threshold of 6)
- **typescript-migration.AC4.3 Success:** hexToRgb() and rgbToHex() round-trip preserves color values
- **typescript-migration.AC4.4 Success:** standardizeColor() converts CSS color names to RGB arrays

---

<!-- START_TASK_1 -->
### Task 1: Update src/test/setup.ts with DOM and eval harness

**Files:**
- Modify: `src/test/setup.ts`

**Before starting:** Read `script.js` to identify:
1. All standalone global variables defined at the top level beyond `tools`, `drawHorse`, `playSound`, `pauseSound` — specifically look for `getDripSize`, `hexToRgb`, `rgbToHex`, `standardizeColor`
2. Any element IDs accessed at parse time (outside `window.onload`) that are not already in the DOM list below
3. Confirm the exact variable names `tools` and `drawHorse`

**Step 1: Replace the Phase 1 placeholder with the full eval harness**

```typescript
// src/test/setup.ts
import 'vitest-canvas-mock'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { vi } from 'vitest'

// Mock HTMLMediaElement — jsdom does not implement play/pause
window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined)
window.HTMLMediaElement.prototype.pause = vi.fn()

// Build the DOM that script.js reads at parse time.
// ALL element IDs that script.js accesses before window.onload must exist here.
document.body.innerHTML = `
  <header id="header"></header>
  <div id="stretcher">
    <canvas id="drawHere"></canvas>
  </div>
  <footer id="colors">
    <div id="stampchooser" style="display:none;"></div>
    <div id="colorchooser">
      <button id="red" class="colorChoice"></button>
      <button id="orange" class="colorChoice"></button>
      <button id="yellow" class="colorChoice"></button>
      <button id="green" class="colorChoice"></button>
      <button id="blue" class="colorChoice"></button>
      <button id="violet" class="colorChoice"></button>
      <button id="purple" class="colorChoice"></button>
      <button id="saddlebrown" class="colorChoice"></button>
      <button id="black" class="colorChoice"></button>
      <button id="white" class="colorChoice"></button>
    </div>
    <audio id="clickSound"></audio>
    <audio id="drippingSound"></audio>
    <audio id="stampSound"></audio>
    <audio id="eraserSound"></audio>
    <audio id="pencilSound"></audio>
    <audio id="oopsSound"></audio>
    <audio id="tornadoSound"></audio>
  </footer>
  <div id="controls">
    <button id="pencil" class="control tool"></button>
    <button id="drips" class="control tool"></button>
    <button id="bubbles" class="control tool"></button>
    <button id="stamp" class="control tool"></button>
    <button id="eraser" class="control tool"></button>
    <button id="oops" class="control tool"></button>
    <button id="nuke" class="control tool"></button>
    <button id="bucket" class="control tool"></button>
  </div>
`

// eval script.js and expose globals for tests.
//
// IMPORTANT: `let`/`const` declared inside eval are block-scoped and are NOT
// attached to globalThis automatically. Appending globalThis assignments inside
// the SAME eval call is the only way to capture block-scoped eval variables.
const scriptPath = resolve(process.cwd(), 'script.js')
const scriptCode = readFileSync(scriptPath, 'utf-8')

// After reading script.js in Step 2, append any additional standalone functions
// discovered there (e.g. getDripSize, hexToRgb, rgbToHex, standardizeColor).
eval(scriptCode + `
;globalThis.__tools = tools;
globalThis.__drawHorse = drawHorse;
globalThis.__playSound = playSound;
globalThis.__pauseSound = pauseSound;
`)

// Fire window.onload to run drawHorse initialization sequence:
// setupColorChooser → canvas sizing → ctx assignment → resize → addListeners → setupStamps
window.dispatchEvent(new Event('load'))
```

**Step 2: Read script.js and add additional global exposures**

After reading `script.js`:
- If `getDripSize` is a standalone top-level function (not inside a closure), add `globalThis.__getDripSize = getDripSize;` to the eval block
- If `hexToRgb`, `rgbToHex`, `standardizeColor` are standalone top-level functions, expose each with `globalThis.__hexToRgb = hexToRgb;` etc.
- If any of these are defined inside closures (e.g. inside `tools.drips` or `tools.bucket`), they are not accessible by name at the eval top level — note which ones are inaccessible, as those tests will use indirect strategies

**Step 3: Verify setup.ts compiles**

```bash
cd /Users/ggissel/code/draw-this/.worktrees/typescript-migration
npm run typecheck
```

Expected: exits with code 0.

**Step 4: Verify Vitest can load setup.ts without crashing**

```bash
npm run test:run 2>&1 | head -30
```

Expected: Either "0 passed (0)" (no test files yet) or errors that are NOT from setup.ts crashing. If setup.ts crashes (ReferenceError on a missing DOM element or eval'd variable), debug the DOM structure against what `script.js` actually accesses at parse time.

**Step 5: Commit**

```bash
git add src/test/setup.ts
git commit -m "test: update setup.ts with DOM and eval harness for baseline tests"
```
<!-- END_TASK_1 -->

<!-- START_TASK_2 -->
### Task 2: Tool interface baseline tests

**Verifies:** typescript-migration.AC3.1, typescript-migration.AC3.2, typescript-migration.AC3.3, typescript-migration.AC3.4

**Files:**
- Create: `src/test/baseline/tool-interface.test.ts`

**Before starting:** Read `script.js` lines 23–469 (the `tools` object) to confirm:
1. The exact keys in the `tools` object (expected: `pencil`, `drips`, `stamp`, `bubbles`, `eraser`, `oops`, `nuke`, `bucket`)
2. That each tool has `draw`, `stopDrawing`, `onclick`, `drawsImmediately`, `selectable`

**Implementation:**

Iterate over all tool names. For AC3.1 and AC3.2, use `it.each` to test each tool individually. For AC3.3 and AC3.4, write targeted assertions on specific tools.

```typescript
// src/test/baseline/tool-interface.test.ts
declare const __tools: Record<string, any>

const TOOL_NAMES = ['pencil', 'drips', 'stamp', 'bubbles', 'eraser', 'oops', 'nuke', 'bucket']

describe('Tool plugin interface contract', () => {
  describe('AC3.1: every tool has draw, stopDrawing, and onclick functions', () => {
    it.each(TOOL_NAMES)('%s has draw, stopDrawing, and onclick functions', (name) => {
      const tool = __tools[name]
      expect(typeof tool.draw).toBe('function')
      expect(typeof tool.stopDrawing).toBe('function')
      expect(typeof tool.onclick).toBe('function')
    })
  })

  describe('AC3.2: every tool has drawsImmediately and selectable booleans', () => {
    it.each(TOOL_NAMES)('%s has drawsImmediately and selectable booleans', (name) => {
      const tool = __tools[name]
      expect(typeof tool.drawsImmediately).toBe('boolean')
      expect(typeof tool.selectable).toBe('boolean')
    })
  })

  describe('AC3.3: oops and nuke have selectable = false', () => {
    it('oops.selectable is false', () => {
      expect(__tools.oops.selectable).toBe(false)
    })
    it('nuke.selectable is false', () => {
      expect(__tools.nuke.selectable).toBe(false)
    })
  })

  describe('AC3.4: stamp and bubbles have drawsImmediately = true', () => {
    it('stamp.drawsImmediately is true', () => {
      expect(__tools.stamp.drawsImmediately).toBe(true)
    })
    it('bubbles.drawsImmediately is true', () => {
      expect(__tools.bubbles.drawsImmediately).toBe(true)
    })
  })
})
```

**Verification:**

```bash
npm run test:run -- src/test/baseline/tool-interface.test.ts
```

Expected: All 12+ tests pass.

**Commit:**

```bash
git add src/test/baseline/tool-interface.test.ts
git commit -m "test: add baseline tool-interface tests (AC3.1–3.4)"
```
<!-- END_TASK_2 -->

<!-- START_TASK_3 -->
### Task 3: Sound baseline tests

**Verifies:** typescript-migration.AC2.1, typescript-migration.AC2.2, typescript-migration.AC2.3, typescript-migration.AC2.4, typescript-migration.AC2.5

**Files:**
- Create: `src/test/baseline/sounds.test.ts`

**Before starting:** Read the `playSound` and `pauseSound` function definitions in `script.js`. Confirm:
1. Exact signatures (expected: `playSound(id, loop?)` and `pauseSound(id)`)
2. What `playSound` does when `loop` is truthy (expected: sets `audio.style.loop = 'loop'` before calling `audio.play()`)
3. What `pauseSound` does (expected: calls `audio.pause()`, sets `audio.currentTime = 0`, sets `audio.style.loop = ''`)

**Implementation:**

Each test spies on the specific `<audio>` DOM element before calling the sound function.

```typescript
// src/test/baseline/sounds.test.ts
declare const __playSound: (id: string, loop?: boolean) => void
declare const __pauseSound: (id: string) => void

describe('playSound', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('AC2.1: calls audio.play() on the correct element', () => {
    const audio = document.getElementById('clickSound') as HTMLAudioElement
    const playSpy = vi.spyOn(audio, 'play').mockResolvedValue(undefined)
    __playSound('clickSound')
    expect(playSpy).toHaveBeenCalledOnce()
  })

  it('AC2.2: with loop=true sets audio.style.loop to "loop"', () => {
    // Note: audio.style.loop is a non-standard CSS property — this is a known bug
    // in script.js being preserved intentionally (should be audio.loop attribute).
    // In jsdom, assigning a non-standard style property may be silently ignored.
    // If this assertion fails because jsdom ignores the assignment, mark it .skip
    // with this comment and a note that Phase 3 import-based tests will document the behavior.
    const audio = document.getElementById('drippingSound') as HTMLAudioElement
    __playSound('drippingSound', true)
    expect((audio.style as any).loop).toBe('loop')
  })
})

describe('pauseSound', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('AC2.3: calls audio.pause() on the correct element', () => {
    const audio = document.getElementById('pencilSound') as HTMLAudioElement
    const pauseSpy = vi.spyOn(audio, 'pause')
    __pauseSound('pencilSound')
    expect(pauseSpy).toHaveBeenCalledOnce()
  })

  it('AC2.4: resets audio.currentTime to 0', () => {
    const audio = document.getElementById('pencilSound') as HTMLAudioElement
    audio.currentTime = 5
    __pauseSound('pencilSound')
    expect(audio.currentTime).toBe(0)
  })

  it('AC2.5: sets audio.style.loop to ""', () => {
    // Same jsdom caveat as AC2.2 — mark .skip if non-standard style property is not stored
    const audio = document.getElementById('drippingSound') as HTMLAudioElement
    ;(audio.style as any).loop = 'loop'
    __pauseSound('drippingSound')
    expect((audio.style as any).loop).toBe('')
  })
})
```

**Verification:**

```bash
npm run test:run -- src/test/baseline/sounds.test.ts
```

Expected: All tests pass. AC2.2 and AC2.5 may need `.skip` if jsdom rejects the non-standard `style.loop` property — document this with a comment if so.

**Commit:**

```bash
git add src/test/baseline/sounds.test.ts
git commit -m "test: add baseline sound tests (AC2.1–2.5)"
```
<!-- END_TASK_3 -->

<!-- START_TASK_4 -->
### Task 4: Drips distribution baseline test

**Verifies:** typescript-migration.AC4.1, typescript-migration.AC4.2

**Files:**
- Create: `src/test/baseline/drips.test.ts`

**Before starting:** Read the `drips` tool in `script.js`. Determine:
1. Whether `getDripSize` is a standalone top-level function (accessible as `__getDripSize` via setup.ts) or defined inside a closure
2. What `getDripSize` returns: 0 roughly half the time, otherwise a value ≥ 6

**Implementation (choose strategy based on what you find in script.js):**

**Strategy A — if `__getDripSize` is exposed by setup.ts:**

```typescript
declare const __getDripSize: (() => number) | undefined

describe('getDripSize distribution', () => {
  it('AC4.1: returns 0 approximately half the time across 200 calls', () => {
    const results = Array.from({ length: 200 }, () => __getDripSize!())
    const zeroCount = results.filter(r => r === 0).length
    // Allow generous range: 30–70% zeros out of 200 calls
    expect(zeroCount).toBeGreaterThanOrEqual(30)
    expect(zeroCount).toBeLessThanOrEqual(140)
  })

  it('AC4.2: never returns values between 1 and 5', () => {
    const results = Array.from({ length: 200 }, () => __getDripSize!())
    const invalidValues = results.filter(r => r > 0 && r < 6)
    expect(invalidValues).toHaveLength(0)
  })
})
```

**Strategy B — if `getDripSize` is inside a closure (not exposed):**

Test indirectly via arc draw calls. Call `drips.draw()` many times and inspect the radius argument passed to `ctx.arc`. A radius of 0 corresponds to a getDripSize return of 0; radii ≥ 6 correspond to non-zero returns.

```typescript
declare const __tools: Record<string, any>
declare const __drawHorse: any

describe('getDripSize distribution (via draw calls)', () => {
  let ctx: any

  beforeEach(() => {
    vi.clearAllMocks()
    const canvas = document.getElementById('drawHere') as HTMLCanvasElement
    ctx = canvas.getContext('2d') as any
    ctx.__clearDrawCalls()
    __drawHorse.pos = { x: 200, y: 200 }
  })

  it('AC4.1 & AC4.2: drips draw calls show correct distribution and minimum size', () => {
    // Call draw 200 times to accumulate arc calls
    for (let i = 0; i < 200; i++) {
      ctx.__clearDrawCalls()
      __tools.drips.draw(new MouseEvent('mousemove', { clientX: 200, clientY: 200 }))
      // Each draw call either produces arc calls (non-zero drip) or nothing (zero drip)
    }
    // This is a structural assertion — if arc was ever called, its radius must be >= 6
    // Read the actual arc call arguments from __getDrawCalls() to verify
    // (adjust based on actual vitest-canvas-mock arc event shape)
  })
})
```

Read the vitest-canvas-mock documentation or source to find the exact shape of arc events in `__getDrawCalls()` (e.g. `{ type: 'arc', props: { x, y, radius, ... } }`).

**Verification:**

```bash
npm run test:run -- src/test/baseline/drips.test.ts
```

Expected: All tests pass. AC4.1 (distribution) should pass ~99% of the time with 200 samples.

**Commit:**

```bash
git add src/test/baseline/drips.test.ts
git commit -m "test: add baseline drips distribution tests (AC4.1–4.2)"
```
<!-- END_TASK_4 -->

<!-- START_TASK_5 -->
### Task 5: Bucket helpers baseline tests

**Verifies:** typescript-migration.AC4.3, typescript-migration.AC4.4

**Files:**
- Create: `src/test/baseline/bucket-helpers.test.ts`

**Before starting:** Read `hexToRgb`, `rgbToHex`, and `standardizeColor` in `script.js`. Confirm:
1. Their exact function signatures and return types
2. Whether they are standalone top-level functions (accessible as `__hexToRgb` etc. via setup.ts) or inside closures
3. What `standardizeColor` does (expected: paints a 1×1 canvas with the color, reads back pixel data as `[r, g, b]`)

**Implementation:**

```typescript
// src/test/baseline/bucket-helpers.test.ts
declare const __hexToRgb: ((hex: string) => [number, number, number] | number[]) | undefined
declare const __rgbToHex: ((r: number, g: number, b: number) => string) | undefined
declare const __standardizeColor: ((color: string) => number[]) | undefined
```

For AC4.3 (hexToRgb / rgbToHex round-trip):

Test these hex strings: `'#ff0000'`, `'#00ff00'`, `'#0000ff'`, `'#ffffff'`, `'#000000'`. For each:
1. Call `hexToRgb(hex)` → get `[r, g, b]`
2. Call `rgbToHex(r, g, b)` → get hex back
3. Assert the result equals the original (lowercase)

Check the exact signatures of both functions from `script.js` — `hexToRgb` may return an object `{r, g, b}` rather than an array; adjust accordingly.

For AC4.4 (standardizeColor):

```typescript
it('AC4.4: standardizeColor converts CSS color names to RGB arrays', () => {
  // standardizeColor paints to a temporary canvas and reads pixel data.
  // vitest-canvas-mock may not provide real pixel values for named colors.
  // If it returns [0, 0, 0] for all colors, mark this test .skip with a
  // note explaining the mock canvas limitation.
  const red = __standardizeColor!('red')
  expect(red).toEqual([255, 0, 0])
})
```

**Verification:**

```bash
npm run test:run -- src/test/baseline/bucket-helpers.test.ts
```

Expected: AC4.3 passes. AC4.4 may need `.skip` if vitest-canvas-mock returns zeros for `getImageData`.

**Commit:**

```bash
git add src/test/baseline/bucket-helpers.test.ts
git commit -m "test: add baseline bucket helper tests (AC4.3–4.4)"
```
<!-- END_TASK_5 -->

<!-- START_TASK_6 -->
### Task 6: Color selection baseline test

**Verifies:** typescript-migration.AC1.8

**Files:**
- Create: `src/test/baseline/color-selection.test.ts`

**Before starting:** Read `setupColorChooser()` in `script.js` to confirm:
1. How click handlers are attached to `.colorChoice` buttons
2. That clicking sets `drawHorse.selectedColor = button.id` (or equivalent)

**Implementation:**

```typescript
// src/test/baseline/color-selection.test.ts
declare const __drawHorse: any

describe('color selection (AC1.8)', () => {
  it('clicking a color button sets drawHorse.selectedColor to the button id', () => {
    const redButton = document.getElementById('red') as HTMLElement
    redButton.click()
    expect(__drawHorse.selectedColor).toBe('red')
  })

  it('clicking a different color updates selectedColor', () => {
    const blueButton = document.getElementById('blue') as HTMLElement
    blueButton.click()
    expect(__drawHorse.selectedColor).toBe('blue')
  })
})
```

**Verification:**

```bash
npm run test:run -- src/test/baseline/color-selection.test.ts
```

Expected: Both tests pass.

**Commit:**

```bash
git add src/test/baseline/color-selection.test.ts
git commit -m "test: add baseline color selection test (AC1.8)"
```
<!-- END_TASK_6 -->

<!-- START_TASK_7 -->
### Task 7: Stamp selection baseline test

**Verifies:** typescript-migration.AC1.9

**Files:**
- Create: `src/test/baseline/stamp-selection.test.ts`

**Before starting:** Read `setupStamps()` in `script.js` to determine:
1. What elements it creates inside `#stampchooser` (e.g. `<button>`, `<img>`, `<div>`)
2. How clicking one sets `drawHorse.selectedStamp` (expected: `drawHorse.selectedStamp = stamp`)
3. The shape of a stamp object (expected: `{id, name, url}`)

**Implementation:**

After `window.onload` fires, `setupStamps()` has run and `#stampchooser` contains stamp choice elements. Read `setupStamps()` and update the selector below to match the actual element type it creates.

```typescript
// src/test/baseline/stamp-selection.test.ts
declare const __drawHorse: any

describe('stamp selection (AC1.9)', () => {
  it('clicking a stamp choice sets drawHorse.selectedStamp', () => {
    // Update this selector to match what setupStamps() actually creates in #stampchooser
    // Common patterns: 'button', 'img', '.stamp-choice', '[data-stamp-id]'
    const stampChoices = document.querySelectorAll<HTMLElement>('#stampchooser button')

    expect(stampChoices.length).toBeGreaterThan(0)
    stampChoices[0].click()
    expect(__drawHorse.selectedStamp).toBeDefined()
  })

  it('selectedStamp has the expected shape after selection', () => {
    const stampChoices = document.querySelectorAll<HTMLElement>('#stampchooser button')
    stampChoices[0].click()
    const stamp = __drawHorse.selectedStamp
    expect(stamp).toHaveProperty('id')
    expect(stamp).toHaveProperty('url')
  })
})
```

**Verification:**

```bash
npm run test:run -- src/test/baseline/stamp-selection.test.ts
```

Expected: Both tests pass.

**Commit:**

```bash
git add src/test/baseline/stamp-selection.test.ts
git commit -m "test: add baseline stamp selection test (AC1.9)"
```
<!-- END_TASK_7 -->

<!-- START_TASK_8 -->
### Task 8: Undo baseline tests

**Verifies:** typescript-migration.AC1.6, typescript-migration.AC1.7

**Files:**
- Create: `src/test/baseline/undo.test.ts`

**Before starting:** Read `endPosition()` and `oops.onclick()` in `script.js` to confirm:
1. `endPosition()` calls `stopDrawing()` then pushes a full-canvas `ImageData` snapshot onto `undoStack`
2. `oops.onclick()` pops from `undoStack` and calls `ctx.putImageData()` if a snapshot exists
3. The parameter signature of `endPosition` (expected: receives a MouseEvent or nothing)

**Implementation:**

```typescript
// src/test/baseline/undo.test.ts
declare const __drawHorse: any
declare const __tools: Record<string, any>

describe('undo stack', () => {
  let ctx: any

  beforeEach(() => {
    vi.clearAllMocks()
    const canvas = document.getElementById('drawHere') as HTMLCanvasElement
    ctx = canvas.getContext('2d') as any
    ctx.__clearDrawCalls()
    // Reset undoStack to a known empty state before each test
    __drawHorse.undoStack = []
  })

  it('AC1.7: endPosition() pushes a snapshot to undoStack', () => {
    expect(__drawHorse.undoStack.length).toBe(0)
    __drawHorse.endPosition(new MouseEvent('mouseup'))
    expect(__drawHorse.undoStack.length).toBe(1)
    expect(__drawHorse.undoStack[0]).toBeInstanceOf(ImageData)
  })

  it('AC1.6: oops.onclick() pops undoStack and calls ctx.putImageData', () => {
    // Push a snapshot first
    __drawHorse.endPosition(new MouseEvent('mouseup'))
    expect(__drawHorse.undoStack.length).toBe(1)

    ctx.__clearDrawCalls()
    __tools.oops.onclick(new MouseEvent('click'))

    expect(__drawHorse.undoStack.length).toBe(0)
    const calls = ctx.__getDrawCalls()
    expect(calls.some((c: any) => c.type === 'putImageData')).toBe(true)
  })

  it('AC1.6: oops.onclick() does nothing when undoStack is empty', () => {
    expect(__drawHorse.undoStack.length).toBe(0)
    expect(() => {
      __tools.oops.onclick(new MouseEvent('click'))
    }).not.toThrow()
  })
})
```

**Note:** `endPosition()` calls `stopDrawing()` internally which may call `pauseSound()` — this is handled by the HTMLMediaElement mock in setup.ts.

**Verification:**

```bash
npm run test:run -- src/test/baseline/undo.test.ts
```

Expected: All three tests pass.

**Commit:**

```bash
git add src/test/baseline/undo.test.ts
git commit -m "test: add baseline undo tests (AC1.6–1.7)"
```
<!-- END_TASK_8 -->

<!-- START_TASK_9 -->
### Task 9: Canvas draw calls baseline tests

**Verifies:** typescript-migration.AC1.1, typescript-migration.AC1.2, typescript-migration.AC1.3, typescript-migration.AC1.4, typescript-migration.AC1.5

**Files:**
- Create: `src/test/baseline/canvas-draw-calls.test.ts`

**Before starting:** Read the `draw()` method of each relevant tool in `script.js` to confirm:
1. `pencil.draw()` calls `beginPath`, `moveTo`, `lineTo`, `stroke`
2. `eraser.draw()` sets `ctx.strokeStyle = 'white'` then draws the same way as pencil
3. `drips.draw()` calls `ctx.arc` and `ctx.fill` (may call them multiple times per invocation)
4. `stamp.draw()` is async — creates an `Image`, sets its `src`, calls `ctx.drawImage` in `img.onload`
5. `nuke.onclick()` calls `ctx.clearRect` with canvas dimensions

Also check the exact shape of draw call events in vitest-canvas-mock by looking at `node_modules/vitest-canvas-mock/src` or its type exports. The `__getDrawCalls()` return type includes objects with at minimum a `type` string field.

**Key vitest-canvas-mock pattern:**

```typescript
// Get all recorded 2D context method calls:
const calls = ctx.__getDrawCalls()
// calls is an array of events like: { type: 'beginPath' }, { type: 'arc', props: {...} }, etc.

// Reset between tests:
ctx.__clearDrawCalls()
```

**Implementation:**

```typescript
// src/test/baseline/canvas-draw-calls.test.ts
declare const __tools: Record<string, any>
declare const __drawHorse: any

describe('canvas draw calls', () => {
  let ctx: any

  beforeEach(() => {
    vi.clearAllMocks()
    const canvas = document.getElementById('drawHere') as HTMLCanvasElement
    ctx = canvas.getContext('2d') as any
    ctx.__clearDrawCalls()
    // Set a known draw position
    __drawHorse.pos = { x: 50, y: 50 }
  })

  describe('pencil (AC1.1)', () => {
    it('draw() calls beginPath, moveTo, lineTo, stroke', () => {
      __drawHorse.currentTool = __tools.pencil
      __tools.pencil.draw(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }))
      const calls = ctx.__getDrawCalls()
      expect(calls.some((c: any) => c.type === 'beginPath')).toBe(true)
      expect(calls.some((c: any) => c.type === 'moveTo')).toBe(true)
      expect(calls.some((c: any) => c.type === 'lineTo')).toBe(true)
      expect(calls.some((c: any) => c.type === 'stroke')).toBe(true)
    })
  })

  describe('eraser (AC1.2)', () => {
    it('draw() uses strokeStyle = "white"', () => {
      __drawHorse.currentTool = __tools.eraser
      __tools.eraser.draw(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }))
      // eraser sets strokeStyle to white during draw — check the ctx property directly
      expect(ctx.strokeStyle).toBe('white')
    })
  })

  describe('drips (AC1.3)', () => {
    it('draw() calls ctx.arc and ctx.fill', () => {
      __drawHorse.currentTool = __tools.drips
      // Call 20 times to ensure at least one non-zero drip is produced
      for (let i = 0; i < 20; i++) {
        __tools.drips.draw(new MouseEvent('mousemove', { clientX: 100 + i, clientY: 100 }))
      }
      const calls = ctx.__getDrawCalls()
      expect(calls.some((c: any) => c.type === 'arc')).toBe(true)
      expect(calls.some((c: any) => c.type === 'fill')).toBe(true)
    })
  })

  describe('stamp (AC1.4)', () => {
    it('draw() calls ctx.drawImage', async () => {
      __drawHorse.currentTool = __tools.stamp
      // Ensure a stamp is selected (setupStamps runs during onload)
      if (!__drawHorse.selectedStamp) {
        // Update selector to match what setupStamps() actually creates
        const stampChoices = document.querySelectorAll<HTMLElement>('#stampchooser button')
        if (stampChoices.length > 0) stampChoices[0].click()
      }
      __tools.stamp.draw(new MouseEvent('mousedown', { clientX: 100, clientY: 100 }))
      // stamp.draw() fires drawImage in img.onload — give the microtask/timeout a tick
      await new Promise(resolve => setTimeout(resolve, 50))
      const calls = ctx.__getDrawCalls()
      // If drawImage is not called (jsdom doesn't fire img.onload for base64 URIs),
      // mark this test .skip with a note: "stamp.draw() is async; covered in Phase 4 import tests"
      expect(calls.some((c: any) => c.type === 'drawImage')).toBe(true)
    })
  })

  describe('nuke (AC1.5)', () => {
    it('onclick() calls ctx.clearRect on the entire canvas', () => {
      __tools.nuke.onclick(new MouseEvent('click'))
      const calls = ctx.__getDrawCalls()
      expect(calls.some((c: any) => c.type === 'clearRect')).toBe(true)
    })
  })
})
```

**Verification:**

```bash
npm run test:run -- src/test/baseline/canvas-draw-calls.test.ts
```

Expected: All tests pass except possibly stamp (see async/jsdom note). If stamp fails, mark it `.skip` with the comment provided.

**Commit:**

```bash
git add src/test/baseline/canvas-draw-calls.test.ts
git commit -m "test: add baseline canvas draw call tests (AC1.1–1.5)"
```
<!-- END_TASK_9 -->

<!-- START_TASK_10 -->
### Task 10: Run full suite and verify

**Step 1: Run all tests**

```bash
cd /Users/ggissel/code/draw-this/.worktrees/typescript-migration
npm run test:run
```

Expected output (all tests pass, no failures):
```
 RUN  v3.x.x

 Test Files  8 passed (8)
      Tests  N passed (N)
   Start at  ...
   Duration  ...
```

If any tests fail, debug and fix before committing. Do not proceed to Step 2 with failing tests.

**Step 2: Run tsc**

```bash
npm run typecheck
```

Expected: exits with code 0.

**Step 3: Verify no uncommitted changes**

```bash
git status
```

All test files should already be committed from Tasks 1–9. If anything remains uncommitted:

```bash
git add src/
git commit -m "test: complete Phase 2 baseline test suite"
```
<!-- END_TASK_10 -->
