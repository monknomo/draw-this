# TypeScript Migration — Phase 3: Port Utilities to TypeScript

**Goal:** Port the two self-contained utility areas — sound functions and bucket helpers — to TypeScript modules. Add import-based tests for each. No tools or application state yet.

**Architecture:** Three new source files: `src/types.ts` (shared interfaces), `src/sounds.ts` (sound functions), `src/tools/bucket-helpers.ts` (color utilities extracted from tools.bucket). Two new test files mirror the baseline assertions but import from TypeScript modules instead of eval'd globals. `script.js` is not modified — baseline tests continue to pass against it unchanged.

**Tech Stack:** TypeScript, Vitest, jsdom

**Scope:** Phase 3 of 6

**Codebase verified:** 2026-03-23 — `src/` directory does not yet exist. `playSound`/`pauseSound` are top-level `let` arrow functions at lines 1–13 of `script.js`. The five bucket helpers (`hexToRgb`, `rgbToHex`, `standardizeColor`, `matchStartColor`, `colorPixel`) are methods on the `tools.bucket` object (lines 333–368), not standalone functions.

---

## Acceptance Criteria Coverage

### typescript-migration.AC2: Audio behaviors are preserved
- **typescript-migration.AC2.1 Success:** playSound() calls audio.play() on the correct element
- **typescript-migration.AC2.2 Success:** playSound() with loop=true sets audio.style.loop = "loop"
- **typescript-migration.AC2.3 Success:** pauseSound() calls audio.pause() on the correct element
- **typescript-migration.AC2.4 Success:** pauseSound() resets audio.currentTime to 0
- **typescript-migration.AC2.5 Success:** pauseSound() sets audio.style.loop = ""

### typescript-migration.AC4: Pure logic correctness
- **typescript-migration.AC4.3 Success:** hexToRgb() and rgbToHex() round-trip preserves color values
- **typescript-migration.AC4.4 Success:** standardizeColor() converts CSS color names to RGB arrays

---

<!-- START_SUBCOMPONENT_A (tasks 1) -->
<!-- START_TASK_1 -->
### Task 1: Create src/types.ts

**Files:**
- Create: `src/types.ts`

**Step 1: Create the file**

```typescript
// src/types.ts

export interface ToolSettings {
  width?: number
  size?: number
  sizeVariation?: number
  maxNumberBubbles?: number
}

export interface Tool {
  name: string
  button: HTMLElement
  selectable: boolean
  drawsImmediately: boolean
  onclick: (e: Event) => void
  draw: (e: MouseEvent | TouchEvent) => void
  stopDrawing: (e: MouseEvent | TouchEvent) => void
  settings?: ToolSettings
}

export interface Stamp {
  id: string
  name: string
  url: string  // base64-encoded SVG with %%%% as fill color placeholder
}
```

**Step 2: Verify**

```bash
cd /Users/ggissel/code/draw-this/.worktrees/typescript-migration
npm run typecheck
```

Expected: exits 0. `src/types.ts` has no type errors.

**Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat: add shared TypeScript interfaces (Tool, ToolSettings, Stamp)"
```
<!-- END_TASK_1 -->
<!-- END_SUBCOMPONENT_A -->

<!-- START_SUBCOMPONENT_B (tasks 2-3) -->
<!-- START_TASK_2 -->
### Task 2: Create src/sounds.ts

**Files:**
- Create: `src/sounds.ts`

The original JavaScript (script.js lines 1–13):

```javascript
let playSound = (soundId, loop) => {
  var audio = document.getElementById(soundId);
  if (loop) {
    audio.style.loop = "loop";
  }
  audio.play();
};

let pauseSound = (soundId) => {
  var audio = document.getElementById(soundId);
  audio.pause();
  audio.style.loop = "";
  audio.currentTime = 0;
};
```

**Step 1: Create the file**

Preserve the exact behavior, including the `audio.style.loop` assignment (a known bug — `loop` is not a CSS property; the correct approach would be `audio.loop = true` but we preserve the original behavior exactly).

```typescript
// src/sounds.ts

export function playSound(soundId: string, loop?: boolean): void {
  const audio = document.getElementById(soundId) as HTMLAudioElement
  if (loop) {
    // Known bug preserved from script.js: assigns to a non-standard CSS property
    // (should be audio.loop = true, but the original uses audio.style.loop = "loop")
    ;(audio.style as unknown as Record<string, string>).loop = 'loop'
  }
  audio.play()
}

export function pauseSound(soundId: string): void {
  const audio = document.getElementById(soundId) as HTMLAudioElement
  audio.pause()
  // Known bug preserved: clearing via non-standard CSS property (see playSound)
  ;(audio.style as unknown as Record<string, string>).loop = ''
  audio.currentTime = 0
}
```

**Step 2: Verify type-checks**

```bash
npm run typecheck
```

Expected: exits 0.

**Step 3: Commit**

```bash
git add src/sounds.ts
git commit -m "feat: port playSound and pauseSound to TypeScript (src/sounds.ts)"
```
<!-- END_TASK_2 -->

<!-- START_TASK_3 -->
### Task 3: Create src/test/sounds.test.ts

**Verifies:** typescript-migration.AC2.1, typescript-migration.AC2.2, typescript-migration.AC2.3, typescript-migration.AC2.4, typescript-migration.AC2.5

**Files:**
- Create: `src/test/sounds.test.ts`

This test imports from `src/sounds.ts` directly instead of using the eval'd globals. The same jsdom environment from `setup.ts` is active, so all `<audio>` elements exist in the DOM.

**Step 1: Create the file**

```typescript
// src/test/sounds.test.ts
import { playSound, pauseSound } from '../sounds'

describe('playSound (import-based)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('AC2.1: calls audio.play() on the correct element', () => {
    const audio = document.getElementById('clickSound') as HTMLAudioElement
    const playSpy = vi.spyOn(audio, 'play').mockResolvedValue(undefined)
    playSound('clickSound')
    expect(playSpy).toHaveBeenCalledOnce()
  })

  it('AC2.2: with loop=true sets audio.style.loop to "loop"', () => {
    // Known bug preserved: non-standard CSS property assignment
    // If jsdom ignores the non-standard property, mark this .skip with that note
    const audio = document.getElementById('drippingSound') as HTMLAudioElement
    playSound('drippingSound', true)
    expect((audio.style as unknown as Record<string, string>).loop).toBe('loop')
  })
})

describe('pauseSound (import-based)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('AC2.3: calls audio.pause() on the correct element', () => {
    const audio = document.getElementById('pencilSound') as HTMLAudioElement
    const pauseSpy = vi.spyOn(audio, 'pause')
    pauseSound('pencilSound')
    expect(pauseSpy).toHaveBeenCalledOnce()
  })

  it('AC2.4: resets audio.currentTime to 0', () => {
    const audio = document.getElementById('pencilSound') as HTMLAudioElement
    audio.currentTime = 5
    pauseSound('pencilSound')
    expect(audio.currentTime).toBe(0)
  })

  it('AC2.5: sets audio.style.loop to ""', () => {
    // Known bug preserved: non-standard CSS property — same jsdom caveat as AC2.2
    const audio = document.getElementById('drippingSound') as HTMLAudioElement
    ;(audio.style as unknown as Record<string, string>).loop = 'loop'
    pauseSound('drippingSound')
    expect((audio.style as unknown as Record<string, string>).loop).toBe('')
  })
})
```

**Step 2: Run the test**

```bash
npm run test:run -- src/test/sounds.test.ts
```

Expected: All 5 tests pass. Apply the same `.skip` rule as the baseline tests if AC2.2/AC2.5 fail due to jsdom's non-standard style property handling.

**Step 3: Confirm baseline tests still pass**

```bash
npm run test:run -- src/test/baseline/sounds.test.ts
```

Expected: Same result as before Phase 3 — baseline tests unaffected.

**Step 4: Commit**

```bash
git add src/test/sounds.test.ts
git commit -m "test: add import-based sound tests (AC2.1–2.5)"
```
<!-- END_TASK_3 -->
<!-- END_SUBCOMPONENT_B -->

<!-- START_SUBCOMPONENT_C (tasks 4-5) -->
<!-- START_TASK_4 -->
### Task 4: Create src/tools/bucket-helpers.ts

**Files:**
- Create: `src/tools/bucket-helpers.ts`

The five functions currently live as methods on `tools.bucket` in `script.js` (lines 333–368). They are extracted here as standalone exported functions. The key change: `standardizeColor` originally called `tools.bucket.hexToRgb()` — after extraction it calls the local `hexToRgb` directly. All other logic is identical.

The `colorPixel` bug is preserved exactly: it ignores the `fillColor` parameter and hardcodes `[100, 1, 2]`.

**Original JavaScript (for reference):**

```javascript
hexToRgb: (hex) => {
  var aRgbHex = hex.substring(1).match(/.{1,2}/g);
  return [parseInt(aRgbHex[0], 16), parseInt(aRgbHex[1], 16), parseInt(aRgbHex[2], 16)];
},

rgbToHex: (r, g, b) => {
  if (r > 255 || g > 255 || b > 255) throw "Invalid color component";
  return ((r << 16) | (g << 8) | b).toString(16);
},

standardizeColor: (str) => {
  var colorctx = document.createElement("canvas").getContext("2d");
  colorctx.fillStyle = str;
  return tools.bucket.hexToRgb(colorctx.fillStyle);  // <-- becomes hexToRgb(...)
},

matchStartColor: (pixelPos, colorLayer, startColor) => {
  var r = colorLayer.data[pixelPos];
  var g = colorLayer.data[pixelPos + 1];
  var b = colorLayer.data[pixelPos + 2];
  return r === startColor[0] && g === startColor[1] && b === startColor[2];
},

colorPixel: (pixelPos, colorLayer, fillColor) => {
  let color = [100, 1, 2];  // known bug: ignores fillColor — preserve exactly
  colorLayer.data[pixelPos] = color[0];
  colorLayer.data[pixelPos + 1] = color[1];
  colorLayer.data[pixelPos + 2] = color[2];
  colorLayer.data[pixelPos + 3] = 255;
},
```

**Step 1: Create the file**

```typescript
// src/tools/bucket-helpers.ts

export function hexToRgb(hex: string): [number, number, number] {
  const aRgbHex = hex.substring(1).match(/.{1,2}/g)!
  return [
    parseInt(aRgbHex[0], 16),
    parseInt(aRgbHex[1], 16),
    parseInt(aRgbHex[2], 16),
  ]
}

export function rgbToHex(r: number, g: number, b: number): string {
  if (r > 255 || g > 255 || b > 255) throw 'Invalid color component'
  return ((r << 16) | (g << 8) | b).toString(16)
}

export function standardizeColor(str: string): [number, number, number] {
  const colorctx = document.createElement('canvas').getContext('2d')!
  colorctx.fillStyle = str
  return hexToRgb(colorctx.fillStyle)
}

export function matchStartColor(
  pixelPos: number,
  colorLayer: ImageData,
  startColor: [number, number, number]
): boolean {
  const r = colorLayer.data[pixelPos]
  const g = colorLayer.data[pixelPos + 1]
  const b = colorLayer.data[pixelPos + 2]
  return r === startColor[0] && g === startColor[1] && b === startColor[2]
}

export function colorPixel(
  pixelPos: number,
  colorLayer: ImageData,
  _fillColor: string  // Known bug preserved: fillColor is intentionally unused
): void {
  // Known bug from script.js: hardcodes [100, 1, 2] instead of parsing _fillColor.
  // The bucket button is commented out in index.html until this is fixed (tracked separately).
  const color = [100, 1, 2]
  colorLayer.data[pixelPos] = color[0]
  colorLayer.data[pixelPos + 1] = color[1]
  colorLayer.data[pixelPos + 2] = color[2]
  colorLayer.data[pixelPos + 3] = 255
}
```

**Step 2: Verify type-checks**

```bash
npm run typecheck
```

Expected: exits 0.

**Step 3: Commit**

```bash
git add src/tools/bucket-helpers.ts
git commit -m "feat: extract bucket helpers to TypeScript module (src/tools/bucket-helpers.ts)"
```
<!-- END_TASK_4 -->

<!-- START_TASK_5 -->
### Task 5: Create src/test/bucket-helpers.test.ts

**Verifies:** typescript-migration.AC4.3, typescript-migration.AC4.4

**Files:**
- Create: `src/test/bucket-helpers.test.ts`

**Step 1: Create the file**

```typescript
// src/test/bucket-helpers.test.ts
import { hexToRgb, rgbToHex, standardizeColor } from '../tools/bucket-helpers'

describe('hexToRgb (AC4.3)', () => {
  it.each([
    ['#ff0000', [255, 0, 0]],
    ['#00ff00', [0, 255, 0]],
    ['#0000ff', [0, 0, 255]],
    ['#ffffff', [255, 255, 255]],
    ['#000000', [0, 0, 0]],
  ])('hexToRgb(%s) returns %j', (hex, expected) => {
    expect(hexToRgb(hex)).toEqual(expected)
  })
})

describe('rgbToHex (AC4.3)', () => {
  it('converts RGB components to a hex string', () => {
    expect(rgbToHex(255, 0, 0)).toBe('ff0000')
    expect(rgbToHex(0, 255, 0)).toBe('ff00')
    expect(rgbToHex(0, 0, 255)).toBe('ff')
    expect(rgbToHex(255, 255, 255)).toBe('ffffff')
  })

  it('throws on invalid components > 255', () => {
    expect(() => rgbToHex(256, 0, 0)).toThrow('Invalid color component')
  })
})

describe('hexToRgb / rgbToHex round-trip (AC4.3)', () => {
  it.each(['#ff0000', '#00ff00', '#0000ff', '#ffffff', '#000000'])(
    'round-trip preserves %s',
    (hex) => {
      const [r, g, b] = hexToRgb(hex)
      const result = '#' + rgbToHex(r, g, b).padStart(6, '0')
      expect(result).toBe(hex)
    }
  )
})

describe('standardizeColor (AC4.4)', () => {
  // standardizeColor creates a canvas, sets fillStyle to a CSS color name,
  // then reads fillStyle back (normalized to hex by the browser) and converts to RGB.
  // vitest-canvas-mock may not normalize fillStyle from CSS names to hex —
  // if this returns [0, 0, 0] for all colors, mark this describe block .skip with:
  // "mock canvas does not normalize fillStyle; covered by manual browser testing in Phase 6"
  it('converts "red" to [255, 0, 0]', () => {
    expect(standardizeColor('red')).toEqual([255, 0, 0])
  })

  it('converts "blue" to [0, 0, 255]', () => {
    expect(standardizeColor('blue')).toEqual([0, 0, 255])
  })

  it('converts "white" to [255, 255, 255]', () => {
    expect(standardizeColor('white')).toEqual([255, 255, 255])
  })

  it('converts "black" to [0, 0, 0]', () => {
    expect(standardizeColor('black')).toEqual([0, 0, 0])
  })
})
```

**Step 2: Run the test**

```bash
npm run test:run -- src/test/bucket-helpers.test.ts
```

Expected: All hexToRgb/rgbToHex tests pass. `standardizeColor` tests may need `.skip` if vitest-canvas-mock returns zeros. Apply the `.skip` with the comment provided if so.

**Step 3: Confirm baseline tests still pass**

```bash
npm run test:run -- src/test/baseline/bucket-helpers.test.ts
```

Expected: Same result as before Phase 3.

**Step 4: Commit**

```bash
git add src/test/bucket-helpers.test.ts
git commit -m "test: add import-based bucket helper tests (AC4.3–4.4)"
```
<!-- END_TASK_5 -->
<!-- END_SUBCOMPONENT_C -->

<!-- START_TASK_6 -->
### Task 6: Verify full test suite and tsc

**Step 1: Run all tests**

```bash
cd /Users/ggissel/code/draw-this/.worktrees/typescript-migration
npm run test:run
```

Expected: All test files pass. Baseline tests (in `src/test/baseline/`) must still pass — they have not changed and still test against the original `script.js`.

**Step 2: Type-check all TypeScript**

```bash
npm run typecheck
```

Expected: exits 0. All three new TypeScript files type-check without errors.

**Step 3: Final commit if needed**

```bash
git status
```

All files should be committed from Tasks 1–5. If any remain:

```bash
git add src/
git commit -m "feat: complete Phase 3 — utilities ported to TypeScript"
```
<!-- END_TASK_6 -->
