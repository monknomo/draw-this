# TypeScript Migration — Phase 4: Port Tools to TypeScript

**Goal:** Port all eight drawing tools to individual TypeScript modules implementing the `Tool` interface. Create import-based tests that mirror the baseline canvas draw call and interface tests.

**Architecture:** Each tool becomes a file in `src/tools/`. Tools reference the `drawHorse` application state object by importing it from `src/drawHorse.ts`. Phase 4 creates a typed stub for `src/drawHorse.ts` (empty object cast to `DrawHorseContext`) — Phase 5 replaces this with the full implementation. This approach avoids circular import issues at initialization time: all `drawHorse` references live inside method bodies that are only called at runtime (after `window.onload`). `src/tools/index.ts` assembles all tools into the registry object. Import-based tests set `drawHorse` properties directly (the exported object is mutable).

**Tech Stack:** TypeScript, Vitest, jsdom, vitest-canvas-mock

**Scope:** Phase 4 of 6

**Codebase verified:** 2026-03-23 — `src/types.ts`, `src/sounds.ts`, `src/tools/bucket-helpers.ts` exist from Phase 3. No `src/tools/` tool files exist. Full method implementations for all 8 tools extracted from `script.js` lines 23–468.

---

## Acceptance Criteria Coverage

### typescript-migration.AC1: Tool behaviors are preserved
- **typescript-migration.AC1.1 Success:** pencil.draw() calls ctx.beginPath, ctx.moveTo, ctx.lineTo, ctx.stroke
- **typescript-migration.AC1.2 Success:** eraser.draw() uses strokeStyle = "white"
- **typescript-migration.AC1.3 Success:** drips.draw() calls ctx.arc and ctx.fill
- **typescript-migration.AC1.4 Success:** stamp.draw() calls ctx.drawImage at the click point
- **typescript-migration.AC1.5 Success:** nuke.onclick() calls ctx.clearRect on the entire canvas

### typescript-migration.AC3: Tool plugin interface contract
- **typescript-migration.AC3.1 Success:** every tool in the registry has draw, stopDrawing, and onclick functions
- **typescript-migration.AC3.2 Success:** every tool has drawsImmediately and selectable boolean properties
- **typescript-migration.AC3.3 Success:** oops and nuke have selectable = false
- **typescript-migration.AC3.4 Success:** stamp and bubbles have drawsImmediately = true

### typescript-migration.AC4: Pure logic correctness
- **typescript-migration.AC4.1 & AC4.2 Note:** getDripSize distribution is covered by baseline tests in Phase 2. Import-based coverage for AC4.1/AC4.2 is added in Phase 6 Task 3.

---

<!-- START_SUBCOMPONENT_A (tasks 1-2) -->
<!-- START_TASK_1 -->
### Task 1: Add DrawHorseContext interface to src/types.ts

**Files:**
- Modify: `src/types.ts`

**Step 1: Append to the end of src/types.ts**

```typescript
// DrawHorseContext: the subset of drawHorse properties that tools reference.
// Defined here so tools can import the type without importing the full drawHorse module.
export interface DrawHorseContext {
  ctx: CanvasRenderingContext2D
  pos: { x: number; y: number }
  selectedColor: string
  selectedStamp: Stamp | undefined
  undoStack: ImageData[]
  setPosition: (e: MouseEvent | TouchEvent) => void
  showColorSelectors: () => void
  hideStampSelectors: () => void
  showStampSelectors: () => void
}
```

**Step 2: Verify**

```bash
cd /Users/ggissel/code/draw-this/.worktrees/typescript-migration
npm run typecheck
```

Expected: exits 0.

**Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat: add DrawHorseContext interface to types.ts"
```
<!-- END_TASK_1 -->

<!-- START_TASK_2 -->
### Task 2: Create src/drawHorse.ts stub

**Files:**
- Create: `src/drawHorse.ts`

This file is a Phase 4 stub. It exports a typed `drawHorse` object as an empty cast — tools reference it, and Phase 4 tests mutate its properties directly. Phase 5 replaces this file with the full implementation.

**Step 1: Create the file**

```typescript
// src/drawHorse.ts
// Phase 4 stub — Phase 5 replaces this with the full implementation.
// The exported object is mutated in place during window.onload initialization.
import type { DrawHorseContext } from './types'

export const drawHorse: DrawHorseContext = {} as DrawHorseContext
```

**Step 2: Verify**

```bash
npm run typecheck
```

Expected: exits 0.

**Step 3: Commit**

```bash
git add src/drawHorse.ts
git commit -m "feat: add drawHorse.ts stub for Phase 4 tool compilation"
```
<!-- END_TASK_2 -->
<!-- END_SUBCOMPONENT_A -->

<!-- START_SUBCOMPONENT_B (tasks 3-5) -->
<!-- START_TASK_3 -->
### Task 3: Create src/tools/pencil.ts and src/tools/eraser.ts

**Files:**
- Create: `src/tools/pencil.ts`
- Create: `src/tools/eraser.ts`

Pencil and eraser are nearly identical — eraser uses `strokeStyle = 'white'` instead of `drawHorse.selectedColor`.

**Step 1: Create src/tools/pencil.ts**

Original draw method in script.js: calls `playSound('pencilSound')`, sets `beginPath`, `lineWidth = 5`, `lineCap = 'round'`, `strokeStyle = drawHorse.selectedColor`, `moveTo(pos)`, `setPosition(e)`, `lineTo(pos)`, `stroke()`. The `settings.controls` array has swapped increase/decrease labels (known bug — preserve exactly).

Note: The original pencil tool includes a `settings.controls` array. This UI is never rendered (see CLAUDE.md Known Issues). The TypeScript port omits the controls array to avoid dead code.

```typescript
// src/tools/pencil.ts
import type { Tool, ToolSettings } from '../types'
import { drawHorse } from '../drawHorse'
import { playSound, pauseSound } from '../sounds'

const settings: ToolSettings & { controls: Array<{ id: string; name: string; onclick: () => void }> } = {
  width: 5,
  controls: [
    { id: 'increase', name: '+', onclick: () => { settings.width!-- } },
    // Known bug preserved: 'decrease' control increments (swapped)
    { id: 'decrease', name: '+', onclick: () => { settings.width!++ } },
  ],
}

export const pencil: Tool = {
  name: 'pencil',
  button: document.getElementById('pencil') as HTMLElement,
  drawsImmediately: false,
  selectable: true,
  settings,

  onclick(_e) {
    playSound('clickSound')
    drawHorse.showColorSelectors()
    drawHorse.hideStampSelectors()
  },

  draw(e) {
    playSound('pencilSound')
    drawHorse.ctx.beginPath()
    drawHorse.ctx.lineWidth = 5
    drawHorse.ctx.lineCap = 'round'
    drawHorse.ctx.strokeStyle = drawHorse.selectedColor
    drawHorse.ctx.moveTo(drawHorse.pos.x, drawHorse.pos.y)
    drawHorse.setPosition(e)
    drawHorse.ctx.lineTo(drawHorse.pos.x, drawHorse.pos.y)
    drawHorse.ctx.stroke()
  },

  stopDrawing(_e) {
    pauseSound('pencilSound')
  },
}
```

**Step 2: Create src/tools/eraser.ts**

Identical to pencil except `strokeStyle = 'white'` and plays/pauses `eraserSound`. Also includes the `console.log` from the original.

Note: The original eraser's `settings.controls` array modifies `tools.pencil.settings.width` (cross-tool reference — likely a copy-paste bug in the original). The settings UI is never rendered (documented known issue in CLAUDE.md), so this has no visible effect. The TypeScript port changes this to modify the eraser's own settings for module isolation.

```typescript
// src/tools/eraser.ts
import type { Tool, ToolSettings } from '../types'
import { drawHorse } from '../drawHorse'
import { playSound, pauseSound } from '../sounds'

const settings: ToolSettings & { controls: Array<{ id: string; name: string; onclick: () => void }> } = {
  width: 5,
  controls: [
    { id: 'increase', name: '+', onclick: () => { settings.width!-- } },
    { id: 'decrease', name: '+', onclick: () => { settings.width!++ } },
  ],
}

export const eraser: Tool = {
  name: 'eraser',
  button: document.getElementById('eraser') as HTMLElement,
  drawsImmediately: false,
  selectable: true,
  settings,

  onclick(_e) {
    playSound('clickSound')
    drawHorse.showColorSelectors()
    drawHorse.hideStampSelectors()
  },

  draw(e) {
    playSound('eraserSound')
    drawHorse.ctx.beginPath()
    drawHorse.ctx.lineWidth = 5
    drawHorse.ctx.lineCap = 'round'
    drawHorse.ctx.strokeStyle = 'white'  // Eraser is white-only (known limitation)
    drawHorse.ctx.moveTo(drawHorse.pos.x, drawHorse.pos.y)
    drawHorse.setPosition(e)
    drawHorse.ctx.lineTo(drawHorse.pos.x, drawHorse.pos.y)
    drawHorse.ctx.stroke()
    console.log(drawHorse.ctx)  // Preserved from original script.js
  },

  stopDrawing(_e) {
    pauseSound('eraserSound')
  },
}
```

**Step 3: Verify**

```bash
npm run typecheck
```

Expected: exits 0.

**Step 4: Commit**

```bash
git add src/tools/pencil.ts src/tools/eraser.ts
git commit -m "feat: port pencil and eraser tools to TypeScript"
```
<!-- END_TASK_3 -->

<!-- START_TASK_4 -->
### Task 4: Create src/tools/drips.ts

**Files:**
- Create: `src/tools/drips.ts`

The drips tool has an inline helper `getDripSize()` that must also be exported (for use in Phase 4 import-based tests).

**Note on getDripSize access path:** The original calls `tools.drips.getDripSize()` via the registry. The TypeScript port calls the module-level `getDripSize()` directly. This is functionally equivalent but eliminates the indirect call path.

**Step 1: Read the exact getDripSize logic from script.js (lines 73–139)**

The function returns 0 roughly half the time. When non-zero: 90% chance of `Math.floor(Math.random() * 10)`, 10% chance of `Math.floor(Math.random() * 10 + 15)`. Values < 6 are clamped to 0.

Note: The original drips tool includes a `settings.controls` array. This UI is never rendered (see CLAUDE.md Known Issues). The TypeScript port omits the controls array to avoid dead code.

```typescript
// src/tools/drips.ts
import type { Tool } from '../types'
import { drawHorse } from '../drawHorse'
import { playSound, pauseSound } from '../sounds'

// Exported for testing — verifies AC4.1 and AC4.2 in import-based tests
export function getDripSize(): number {
  let size = 0
  if (Math.random() < 0.5) {
    if (Math.random() < 0.9) {
      size = Math.floor(Math.random() * 10)
    } else {
      size = Math.floor(Math.random() * 10 + 15)
    }
    if (size < 6) {
      size = 0
    }
  }
  return size
}

export const drips: Tool = {
  name: 'drips',
  button: document.getElementById('drips') as HTMLElement,
  drawsImmediately: false,
  selectable: true,
  settings: { width: 5 },

  onclick(_e) {
    playSound('clickSound')
    drawHorse.showColorSelectors()
    drawHorse.hideStampSelectors()
  },

  draw(e) {
    playSound('drippingSound')
    drawHorse.setPosition(e)
    drawHorse.ctx.fillStyle = drawHorse.selectedColor
    drawHorse.ctx.beginPath()
    drawHorse.ctx.arc(
      drawHorse.pos.x,
      drawHorse.pos.y,
      getDripSize(),
      0,
      Math.PI * 2,
      true
    )
    drawHorse.ctx.closePath()
    drawHorse.ctx.fill()
  },

  stopDrawing(_e) {
    pauseSound('drippingSound')
  },
}
```

**Step 2: Verify**

```bash
npm run typecheck
```

Expected: exits 0.

**Step 3: Commit**

```bash
git add src/tools/drips.ts
git commit -m "feat: port drips tool to TypeScript (exports getDripSize)"
```
<!-- END_TASK_4 -->

<!-- START_TASK_5 -->
### Task 5: Create src/tools/eraser.ts (continuation of Task 3)

Note: Eraser is created as part of Task 3 with pencil. See the eraser.ts code snippet in Task 3.

**Important note on eraser controls cross-tool reference:** In the original code, the eraser tool's `settings.controls` array modifies `tools.pencil.settings.width` (cross-tool reference — likely a copy-paste bug in the original). The settings UI is never rendered (documented known issue in CLAUDE.md), so this has no visible effect. The TypeScript port changes this to modify the eraser's own settings for module isolation, eliminating the cross-tool coupling with dead code.

<!-- Boundary between Task 3 eraser and Task 5 oops/nuke -->

### Task 5: Create src/tools/oops.ts and src/tools/nuke.ts

**Files:**
- Create: `src/tools/oops.ts`
- Create: `src/tools/nuke.ts`

Both are one-shot action tools (`selectable: false`). Their `draw` and `stopDrawing` are no-ops.

**Step 1: Create src/tools/oops.ts**

```typescript
// src/tools/oops.ts
import type { Tool } from '../types'
import { drawHorse } from '../drawHorse'
import { playSound } from '../sounds'

export const oops: Tool = {
  name: 'oops',
  button: document.getElementById('oops') as HTMLElement,
  drawsImmediately: false,
  selectable: false,

  onclick(_e) {
    playSound('oopsSound')
    const imageData = drawHorse.undoStack.pop()
    if (imageData) {
      drawHorse.ctx.putImageData(imageData, 0, 0)
    }
  },

  draw(_e) {},
  stopDrawing(_e) {},
}
```

**Step 2: Create src/tools/nuke.ts**

```typescript
// src/tools/nuke.ts
import type { Tool } from '../types'
import { drawHorse } from '../drawHorse'
import { playSound } from '../sounds'

export const nuke: Tool = {
  name: 'nuke',
  button: document.getElementById('nuke') as HTMLElement,
  drawsImmediately: false,
  selectable: false,

  onclick(_e) {
    playSound('tornadoSound')
    drawHorse.ctx.clearRect(
      0,
      0,
      drawHorse.ctx.canvas.width,
      drawHorse.ctx.canvas.height
    )
  },

  draw(_e) {},
  stopDrawing(_e) {},
}
```

**Step 3: Verify**

```bash
npm run typecheck
```

Expected: exits 0.

**Step 4: Commit**

```bash
git add src/tools/oops.ts src/tools/nuke.ts
git commit -m "feat: port oops and nuke tools to TypeScript"
```
<!-- END_TASK_5 -->
<!-- END_SUBCOMPONENT_B -->

<!-- START_SUBCOMPONENT_C (tasks 6-7) -->
<!-- START_TASK_6 -->
### Task 6: Create src/tools/stamp.ts

**Files:**
- Create: `src/tools/stamp.ts`

The stamp rendering pipeline: `atob(selectedStamp.url)` → replaceAll `%%%%` with fill style → `btoa(...)` → `data:image/svg+xml;base64,` URI → `new Image(50, 50)` → `img.onload` → `ctx.drawImage`. The `draw` call is async (drawImage fires in img.onload).

Note: The original stamp tool includes a `settings.controls` array. This UI is never rendered (see CLAUDE.md Known Issues). The TypeScript port omits the controls array to avoid dead code.

```typescript
// src/tools/stamp.ts
import type { Tool } from '../types'
import { drawHorse } from '../drawHorse'
import { playSound } from '../sounds'

export const stamp: Tool = {
  name: 'stamp',
  button: document.getElementById('stamp') as HTMLElement,
  drawsImmediately: true,
  selectable: true,
  settings: { width: 5 },

  onclick(_e) {
    playSound('clickSound')
    drawHorse.showStampSelectors()
    drawHorse.showColorSelectors()
  },

  draw(_e) {
    playSound('stampSound')
    const img = new Image(50, 50)
    img.src =
      'data:image/svg+xml;base64,' +
      window.btoa(
        window.atob(drawHorse.selectedStamp!.url).replaceAll(
          '%%%%',
          ` style='fill:${drawHorse.selectedColor};stroke:${drawHorse.selectedColor};' `
        )
      )
    img.onload = function () {
      drawHorse.ctx.drawImage(img, drawHorse.pos.x - 25, drawHorse.pos.y - 25, 50, 50)
    }
  },

  stopDrawing(_e) {},
}
```

**Step 1: Verify**

```bash
npm run typecheck
```

Expected: exits 0.

**Step 2: Commit**

```bash
git add src/tools/stamp.ts
git commit -m "feat: port stamp tool to TypeScript"
```
<!-- END_TASK_6 -->

<!-- START_TASK_7 -->
### Task 7: Create src/tools/bubbles.ts

**Files:**
- Create: `src/tools/bubbles.ts`

Bubbles places 0–30 bubble images at random offsets around the click point. Three external CDN URLs are preserved as-is (tracked in GitHub issue #11 for future inlining — out of scope here).

**Note on settings access path:** The original accesses `tools.bubbles.settings.maxNumberBubbles` etc. via the registry. The TypeScript port accesses these as a local constant, eliminating the indirect access path.

**Step 1: Read the exact draw() implementation from script.js lines 189–241**

The settings object shape: `{ size: 35, sizeVariation: 15, maxNumberBubbles: 30 }`. The draw method loops up to `settings.maxNumberBubbles` times, creating Image objects with one of three CDN URLs, random offsets, and random sizes within `± sizeVariation`. All drawImage calls happen in `img.onload`.

```typescript
// src/tools/bubbles.ts
import type { Tool, ToolSettings } from '../types'
import { drawHorse } from '../drawHorse'
import { playSound } from '../sounds'

const BUBBLE_URL_1 =
  'https://cdn.glitch.global/ecc7c6c7-2450-49b5-b5e7-94175cb9ac28/bubble.svg?v=1652888646403'
const BUBBLE_URL_2 =
  'https://cdn.glitch.global/ecc7c6c7-2450-49b5-b5e7-94175cb9ac28/bubble2.svg?v=1652888650037'
const BUBBLE_URL_3 =
  'https://cdn.glitch.global/ecc7c6c7-2450-49b5-b5e7-94175cb9ac28/bubble3.svg?v=1652888653363'

const settings: ToolSettings = {
  size: 35,
  sizeVariation: 15,
  maxNumberBubbles: 30,
}

export const bubbles: Tool = {
  name: 'bubbles',
  button: document.getElementById('bubbles') as HTMLElement,
  drawsImmediately: true,
  selectable: true,
  settings,

  onclick(_e) {
    playSound('clickSound')
    drawHorse.showColorSelectors()
    drawHorse.hideStampSelectors()
  },

  draw(_e) {
    const totalBubbles = Math.floor(Math.random() * settings.maxNumberBubbles!)
    for (let i = 0; i < totalBubbles; i++) {
      const img = new Image(settings.size, settings.size)
      const bubbleChoice = Math.random()
      img.src =
        bubbleChoice < 0.33
          ? BUBBLE_URL_1
          : bubbleChoice < 0.5
          ? BUBBLE_URL_2
          : BUBBLE_URL_3

      const positive = Math.floor(Math.random() * 2) % 2 === 0 ? -1 : 1
      const xOffset = positive * Math.floor(Math.random() * (i * settings.size!))
      const yOffset = Math.floor(Math.random() * (i * settings.size!))
      const bubbleSizeSign = Math.floor(Math.random() * 2) % 2 === 0 ? -1 : 1
      const bubbleSize = Math.floor(
        settings.size! + bubbleSizeSign * Math.floor(Math.random() * settings.sizeVariation!)
      )

      img.onload = function () {
        drawHorse.ctx.drawImage(
          img,
          drawHorse.pos.x - settings.size! / 2 + xOffset,
          drawHorse.pos.y - settings.size! / 2 - yOffset,
          bubbleSize,
          bubbleSize
        )
      }
    }
  },

  stopDrawing(_e) {},
}
```

**Step 2: Verify**

```bash
npm run typecheck
```

Expected: exits 0.

**Step 3: Commit**

```bash
git add src/tools/bubbles.ts
git commit -m "feat: port bubbles tool to TypeScript (CDN URLs preserved)"
```
<!-- END_TASK_7 -->
<!-- END_SUBCOMPONENT_C -->

<!-- START_SUBCOMPONENT_D (tasks 8) -->
<!-- START_TASK_8 -->
### Task 8: Create src/tools/bucket.ts

**Files:**
- Create: `src/tools/bucket.ts`

The bucket tool imports `hexToRgb`, `rgbToHex`, `matchStartColor`, `colorPixel`, `standardizeColor` from `./bucket-helpers`. The full scanline flood fill algorithm is ported from `script.js` lines 324–468.

**Step 1: Read the bucket draw() method from script.js lines 400–465 carefully**

The flood fill algorithm:
1. Get `outlineData = getImageData(0, 0, width, height)` — current canvas state
2. `clearRect` the canvas
3. Get `imageData = getImageData(0, 0, width, height)` — blank canvas
4. `setPosition(e)` — get click position
5. `startColor` = RGB at click position in outlineData
6. Scanline fill loop using `pixelStack`, `matchStartColor`, `colorPixel`
7. `putImageData(imageData)` then `putImageData(outlineData)` — overlay result

**Step 2: Create src/tools/bucket.ts**

```typescript
// src/tools/bucket.ts
import type { Tool } from '../types'
import { drawHorse } from '../drawHorse'
import { playSound } from '../sounds'
import {
  hexToRgb,
  rgbToHex,
  matchStartColor,
  colorPixel,
} from './bucket-helpers'

export const bucket: Tool = {
  name: 'bucket',
  button: document.getElementById('bucket') as HTMLElement,
  drawsImmediately: true,
  selectable: true,

  onclick(_e) {
    playSound('clickSound')
    drawHorse.showColorSelectors()
    drawHorse.hideStampSelectors()
  },

  draw(e) {
    console.log('start')
    const { ctx } = drawHorse
    const { width, height } = ctx.canvas

    const outlineData = ctx.getImageData(0, 0, width, height)
    ctx.clearRect(0, 0, width, height)
    const imageData = ctx.getImageData(0, 0, width, height)

    drawHorse.setPosition(e)

    const startColor: [number, number, number] = [
      outlineData.data[0],
      outlineData.data[1],
      outlineData.data[2],
    ]
    const startColorHex =
      '#' +
      ('000000' + rgbToHex(outlineData.data[0], outlineData.data[1], outlineData.data[2])).slice(-6)
    void startColorHex  // used indirectly via standardizeColor in original — preserved for parity

    const pixelStack: [number, number][] = [[drawHorse.pos.x, drawHorse.pos.y]]

    while (pixelStack.length) {
      const newPos = pixelStack.pop()!
      let x = newPos[0]
      let y = newPos[1]
      let pixelPos = (y * width + x) * 4

      while (y-- >= 0 && matchStartColor(pixelPos, outlineData, startColor)) {
        pixelPos -= width * 4
      }
      pixelPos += width * 4
      ++y

      let reachLeft = false
      let reachRight = false

      while (y++ < height - 1 && matchStartColor(pixelPos, outlineData, startColor)) {
        colorPixel(pixelPos, imageData, drawHorse.selectedColor)

        if (x > 0) {
          if (matchStartColor(pixelPos - 4, outlineData, startColor)) {
            if (!reachLeft) {
              pixelStack.push([x - 1, y])
              reachLeft = true
            }
          } else if (reachLeft) {
            reachLeft = false
          }
        }

        if (x < width - 1) {
          if (matchStartColor(pixelPos + 4, imageData, startColor)) {
            if (!reachRight) {
              pixelStack.push([x + 1, y])
              reachRight = true
            }
          } else if (reachRight) {
            reachRight = false
          }
        }

        pixelPos += width * 4
      }
    }

    ctx.putImageData(imageData, 0, 0)
    ctx.putImageData(outlineData, 0, 0)
    console.log('finis')
  },

  stopDrawing(_e) {},
}
```

**Note on bucket.draw():** The original `script.js` calls `ctx.putImageData(imageData)` and `ctx.putImageData(outlineData)` without x/y arguments. `putImageData` requires x and y. Pass `0, 0` for both — this matches the intent (top-left origin).

**Step 3: Verify**

```bash
npm run typecheck
```

Expected: exits 0.

**Step 4: Commit**

```bash
git add src/tools/bucket.ts
git commit -m "feat: port bucket tool to TypeScript (imports bucket-helpers)"
```
<!-- END_TASK_8 -->
<!-- END_SUBCOMPONENT_D -->

<!-- START_SUBCOMPONENT_E (tasks 9) -->
<!-- START_TASK_9 -->
### Task 9: Create src/tools/index.ts

**Files:**
- Create: `src/tools/index.ts`

Assembles and exports the tools registry object. This is the module imported by tests and (in Phase 5) by drawHorse.

```typescript
// src/tools/index.ts
import type { Tool } from '../types'
import { pencil } from './pencil'
import { drips } from './drips'
import { stamp } from './stamp'
import { bubbles } from './bubbles'
import { eraser } from './eraser'
import { oops } from './oops'
import { nuke } from './nuke'
import { bucket } from './bucket'

export const tools: Record<string, Tool> = {
  pencil,
  drips,
  stamp,
  bubbles,
  eraser,
  oops,
  nuke,
  bucket,
}
```

**Step 1: Verify**

```bash
npm run typecheck
```

Expected: exits 0.

**Step 2: Commit**

```bash
git add src/tools/index.ts
git commit -m "feat: add tools registry index (src/tools/index.ts)"
```
<!-- END_TASK_9 -->
<!-- END_SUBCOMPONENT_E -->

<!-- START_SUBCOMPONENT_F (tasks 10-11) -->
<!-- START_TASK_10 -->
### Task 10: Create src/test/tools/tool-interface.test.ts

**Verifies:** typescript-migration.AC3.1, typescript-migration.AC3.2, typescript-migration.AC3.3, typescript-migration.AC3.4

**Files:**
- Create: `src/test/tools/tool-interface.test.ts`

This test imports from `src/tools/index.ts` directly instead of using `__tools` from the eval harness. Same assertions as the baseline test.

```typescript
// src/test/tools/tool-interface.test.ts
import { tools } from '../../tools/index'

const TOOL_NAMES = ['pencil', 'drips', 'stamp', 'bubbles', 'eraser', 'oops', 'nuke', 'bucket']

describe('Tool plugin interface contract (import-based)', () => {
  describe('AC3.1: every tool has draw, stopDrawing, and onclick functions', () => {
    it.each(TOOL_NAMES)('%s has draw, stopDrawing, and onclick', (name) => {
      const tool = tools[name]
      expect(typeof tool.draw).toBe('function')
      expect(typeof tool.stopDrawing).toBe('function')
      expect(typeof tool.onclick).toBe('function')
    })
  })

  describe('AC3.2: every tool has drawsImmediately and selectable booleans', () => {
    it.each(TOOL_NAMES)('%s has drawsImmediately and selectable booleans', (name) => {
      const tool = tools[name]
      expect(typeof tool.drawsImmediately).toBe('boolean')
      expect(typeof tool.selectable).toBe('boolean')
    })
  })

  describe('AC3.3: oops and nuke have selectable = false', () => {
    it('oops.selectable is false', () => expect(tools.oops.selectable).toBe(false))
    it('nuke.selectable is false', () => expect(tools.nuke.selectable).toBe(false))
  })

  describe('AC3.4: stamp and bubbles have drawsImmediately = true', () => {
    it('stamp.drawsImmediately is true', () => expect(tools.stamp.drawsImmediately).toBe(true))
    it('bubbles.drawsImmediately is true', () => expect(tools.bubbles.drawsImmediately).toBe(true))
  })
})
```

**Step 1: Verify**

```bash
npm run test:run -- src/test/tools/tool-interface.test.ts
```

Expected: All 12+ tests pass.

**Step 2: Commit**

```bash
git add src/test/tools/tool-interface.test.ts
git commit -m "test: add import-based tool interface tests (AC3.1–3.4)"
```
<!-- END_TASK_10 -->

<!-- START_TASK_11 -->
### Task 11: Create src/test/tools/canvas-draw-calls.test.ts

**Verifies:** typescript-migration.AC1.1, typescript-migration.AC1.2, typescript-migration.AC1.3, typescript-migration.AC1.4, typescript-migration.AC1.5

**Files:**
- Create: `src/test/tools/canvas-draw-calls.test.ts`

Tests import `tools` from `src/tools/index.ts` and set up `drawHorse` properties directly (since `drawHorse` is exported as a mutable object from `src/drawHorse.ts`).

**Key pattern:** Before each test, configure the `drawHorse` stub with the mock canvas context and a known position.

```typescript
// src/test/tools/canvas-draw-calls.test.ts
import { tools } from '../../tools/index'
import { drawHorse } from '../../drawHorse'

describe('canvas draw calls (import-based)', () => {
  let ctx: any

  beforeEach(() => {
    vi.clearAllMocks()
    const canvas = document.getElementById('drawHere') as HTMLCanvasElement
    ctx = canvas.getContext('2d') as any
    ctx.__clearDrawCalls()

    // Wire drawHorse stub to the jsdom canvas for this test
    drawHorse.ctx = ctx
    drawHorse.pos = { x: 50, y: 50 }
    drawHorse.selectedColor = 'black'
    drawHorse.undoStack = []
    drawHorse.setPosition = (e) => {
      if (e instanceof MouseEvent) {
        drawHorse.pos = { x: e.clientX, y: e.clientY }
      }
    }
    drawHorse.showColorSelectors = () => {}
    drawHorse.hideStampSelectors = () => {}
    drawHorse.showStampSelectors = () => {}
  })

  describe('pencil (AC1.1)', () => {
    it('draw() calls beginPath, moveTo, lineTo, stroke', () => {
      tools.pencil.draw(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }))
      const calls = ctx.__getDrawCalls()
      expect(calls.some((c: any) => c.type === 'beginPath')).toBe(true)
      expect(calls.some((c: any) => c.type === 'moveTo')).toBe(true)
      expect(calls.some((c: any) => c.type === 'lineTo')).toBe(true)
      expect(calls.some((c: any) => c.type === 'stroke')).toBe(true)
    })
  })

  describe('eraser (AC1.2)', () => {
    it('draw() uses strokeStyle = "white"', () => {
      tools.eraser.draw(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }))
      expect(ctx.strokeStyle).toBe('white')
    })
  })

  describe('drips (AC1.3)', () => {
    it('draw() calls ctx.arc and ctx.fill', () => {
      // Call 20 times to ensure at least one non-zero drip
      for (let i = 0; i < 20; i++) {
        tools.drips.draw(new MouseEvent('mousemove', { clientX: 100, clientY: 100 }))
      }
      const calls = ctx.__getDrawCalls()
      expect(calls.some((c: any) => c.type === 'arc')).toBe(true)
      expect(calls.some((c: any) => c.type === 'fill')).toBe(true)
    })
  })

  describe('stamp (AC1.4)', () => {
    it('draw() calls ctx.drawImage', async () => {
      // Set up a minimal selectedStamp
      drawHorse.selectedStamp = {
        id: 'test',
        name: 'Test',
        // Minimal valid base64 SVG with %%%% placeholder
        url: window.btoa('<svg xmlns="http://www.w3.org/2000/svg"><circle %%%%/></svg>'),
      }
      tools.stamp.draw(new MouseEvent('mousedown', { clientX: 100, clientY: 100 }))
      await new Promise((resolve) => setTimeout(resolve, 50))
      const calls = ctx.__getDrawCalls()
      // If jsdom doesn't fire img.onload for base64 SVG URIs, mark this .skip with:
      // "stamp.draw() drawImage is async via img.onload; jsdom may not fire onload for data URIs"
      expect(calls.some((c: any) => c.type === 'drawImage')).toBe(true)
    })
  })

  describe('nuke (AC1.5)', () => {
    it('onclick() calls ctx.clearRect on the entire canvas', () => {
      tools.nuke.onclick(new MouseEvent('click'))
      const calls = ctx.__getDrawCalls()
      expect(calls.some((c: any) => c.type === 'clearRect')).toBe(true)
    })
  })
})
```

**Step 1: Run the test**

```bash
npm run test:run -- src/test/tools/canvas-draw-calls.test.ts
```

Expected: All tests pass except possibly stamp (apply `.skip` if drawImage is not called due to jsdom's async image loading).

**Step 2: Confirm baseline tests still pass**

```bash
npm run test:run -- src/test/baseline/
```

Expected: All baseline tests still pass — `script.js` is unchanged.

**Step 3: Commit**

```bash
git add src/test/tools/canvas-draw-calls.test.ts
git commit -m "test: add import-based canvas draw call tests (AC1.1–1.5)"
```
<!-- END_TASK_11 -->
<!-- END_SUBCOMPONENT_F -->

<!-- START_TASK_12 -->
### Task 12: Run full test suite and verify

**Step 1: Run all tests**

```bash
cd /Users/ggissel/code/draw-this/.worktrees/typescript-migration
npm run test:run
```

Expected: All test files pass. Baseline tests in `src/test/baseline/` must still pass unchanged.

**Step 2: Type-check all TypeScript**

```bash
npm run typecheck
```

Expected: exits 0.

**Step 3: Final commit if needed**

```bash
git status
```

All files should be committed from Tasks 1–11. If anything remains:

```bash
git add src/
git commit -m "feat: complete Phase 4 — all tools ported to TypeScript"
```
<!-- END_TASK_12 -->
