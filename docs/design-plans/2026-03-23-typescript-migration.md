# TypeScript Migration Design

## Summary

`draw-this` is a vanilla HTML5 canvas drawing toy built as a single JavaScript file with no dependencies or build step. This migration ports that file to TypeScript while preserving every visible and audible behavior exactly. The browser continues to receive one plain JavaScript file — the TypeScript source is a developer-side concern only.

The approach is incremental and test-guarded. Before any code is ported, a baseline test suite is written against the current `script.js` by loading it into a simulated browser environment (jsdom) and asserting on canvas draw calls, audio behavior, and application state. These tests become the regression specification. Code is then ported module by module — utilities first, then individual tools, then the main application object — with each phase required to keep both the new import-based tests and the original eval-based baseline tests green. Once all modules are ported, `esbuild` bundles them into a single `script.js` that is drop-in compatible with the existing `index.html`.

## Definition of Done

- All existing visual and audio behaviors are preserved — every tool works identically to the current `script.js`
- TypeScript source compiles with no type errors (`tsc --noEmit`)
- `esbuild` produces a single `script.js` with zero runtime dependencies
- A Vitest test suite passes against both the original `script.js` (eval-based) and the TypeScript-compiled output (import-based)
- `index.html` and `style.css` are unchanged — the browser receives the same assets as today

## Acceptance Criteria

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

### typescript-migration.AC5: Build output is browser-clean

- **typescript-migration.AC5.1 Success:** tsc --noEmit exits with 0 type errors
- **typescript-migration.AC5.2 Success:** esbuild produces a single script.js file
- **typescript-migration.AC5.3 Success:** compiled script.js contains no ES module syntax (import/export)
- **typescript-migration.AC5.4 Success:** compiled script.js contains no AMD, CommonJS, or SystemJS wrappers
- **typescript-migration.AC5.5 Success:** index.html and style.css are not modified by this migration

## Glossary

- **`drawHorse`**: The main application state object in `script.js`. It holds the canvas rendering context, the active tool, the current color, the undo stack, and all event listener setup. It routes input events into whichever tool is currently selected.
- **`tools`**: A plain object acting as a plugin registry. Each key is a tool name; each value is an object implementing the `Tool` interface (draw, stopDrawing, onclick, etc.).
- **`Tool` interface**: A TypeScript interface that formalizes the shape every tool must have. Enforces the plugin contract at compile time rather than by convention.
- **`ToolSettings`**: An optional sub-object on a `Tool` carrying numeric parameters like brush width or bubble count.
- **`Stamp`**: An object holding a base64-encoded SVG string. The `%%%%` placeholder inside the SVG is replaced at render time with the currently selected color.
- **`undoStack`**: An array of `ImageData` snapshots. `endPosition()` pushes a snapshot after each stroke; the `oops` tool pops the most recent one and restores it to the canvas.
- **`endPosition()`**: A method on `drawHorse` called at the end of each drawing action. It saves a full-canvas snapshot to `undoStack`.
- **`getDripSize()`**: A helper inside the drips tool that returns 0 roughly half the time and a random size above a minimum threshold otherwise, producing irregular drip spacing.
- **`hexToRgb` / `rgbToHex`**: Conversion utilities used by the bucket fill tool to work with raw pixel data in `ImageData` arrays.
- **`standardizeColor()`**: Converts a CSS color name (e.g., `"red"`) to an RGB array by painting it onto a temporary canvas and reading back the pixel value.
- **`esbuild`**: A JavaScript bundler. Here it takes the TypeScript entry point (`src/main.ts`) and produces a single `script.js` with no module syntax — matching the format browsers expect without a module loader.
- **`tsc --noEmit`**: Runs the TypeScript compiler for type checking only, producing no output files. Used to catch type errors without generating build artifacts.
- **Vitest**: A JavaScript test runner. Used here with a jsdom environment to run tests outside the browser.
- **`vitest-canvas-mock`**: A Vitest plugin that installs a fake `<canvas>` implementation in jsdom, including a mock 2D rendering context whose method calls (e.g., `ctx.stroke()`) can be inspected in tests.
- **jsdom**: A JavaScript implementation of browser DOM APIs. Lets tests run in Node.js as if they were in a browser, without opening a real browser.
- **eval-based harness**: The baseline test strategy where `script.js` is loaded by calling `eval()` on its source inside a jsdom context. This makes `tools` and `drawHorse` available as globals without any module system.
- **import-based tests**: Tests that import from TypeScript source modules directly (e.g., `import { pencil } from '../tools/pencil'`), used in Phases 3–6 as each module is ported.
- **plugin registry**: A design pattern where a central object maps keys to implementations of a shared interface, allowing the host (`drawHorse`) to call `currentTool.draw(e)` without knowing which tool is active.
- **`drawsImmediately`**: A boolean property on a `Tool`. When `true`, the tool's `draw()` fires on the initial click rather than waiting for a drag.
- **`selectable`**: A boolean property on a `Tool`. When `false`, the tool is a one-shot action (e.g., undo, clear) and does not become the "active" tool after being clicked.
- **`ImageData`**: A browser API object containing the raw pixel data for a rectangular region of a canvas. Used here to snapshot and restore canvas state for undo.

## Architecture

Vitest with `vitest-canvas-mock` and jsdom handles all tests. esbuild bundles TypeScript source into a single `script.js` for the browser; `tsc --noEmit` performs type checking separately. The browser receives one plain JS file with no module system, no runtime helpers, no injected wrappers — identical in format to today's `script.js`.

Source is split into modules under `src/` following existing architectural boundaries. The two top-level objects (`tools` and `drawHorse`) each become their own module. Each tool becomes its own file. A shared `types.ts` defines the `Tool` interface that enforces the plugin contract.

Migration uses a two-phase test strategy:

**Phase 1 (baseline):** Tests run against the current `script.js` by evaluating it into jsdom after setting up the required DOM. `tools` and `drawHorse` are accessed as globals. These tests define the behavioral specification.

**Phase 2 (TypeScript):** The same test logic runs against TypeScript modules (imported, not evaled). Tests must stay green throughout the port. The eval-based harness is retired once all modules are ported.

### Tool plugin interface contract

The `Tool` interface is the central contract. Every entry in the `tools` registry must implement it:

```typescript
interface Tool {
  name: string;
  button: HTMLElement;
  selectable: boolean;
  drawsImmediately: boolean;
  onclick: (e: Event) => void;
  draw: (e: MouseEvent | TouchEvent) => void;
  stopDrawing: (e: MouseEvent | TouchEvent) => void;
  settings?: ToolSettings;
}

interface ToolSettings {
  width?: number;
  size?: number;
  sizeVariation?: number;
  maxNumberBubbles?: number;
}

interface Stamp {
  id: string;
  name: string;
  url: string; // base64-encoded SVG with %%%% fill placeholder
}
```

`drawHorse` is the event host. It holds all application state and routes canvas/touch/mouse events into whichever `Tool` is currently active. Tools never register their own listeners.

## Existing Patterns

The existing codebase has one dominant pattern: the `tools` object as a plugin registry with a uniform interface. This design follows that pattern exactly — TypeScript formalizes it with the `Tool` interface but does not restructure it.

The file split follows existing architectural seams:
- One file per tool (matching how tools are already isolated as object keys)
- `drawHorse` as a separate module (it is already a self-contained object)
- Sound functions as a separate utility module (already top-level functions, separate from tools and state)

No new patterns are introduced. The TypeScript module system is a build-time concept only — the browser output is a single concatenated global script, same as today.

## Implementation Phases

<!-- START_PHASE_1 -->
### Phase 1: Toolchain Setup

**Goal:** Add build and test infrastructure without touching any application logic.

**Components:**
- `package.json` — devDependencies: `esbuild`, `typescript`, `vitest`, `vitest-canvas-mock`, `jsdom`, `@types/jsdom`
- `tsconfig.json` — strict mode, `noEmit: true`, targets ES2020, lib includes DOM
- `vitest.config.ts` — jsdom environment, setup file at `src/test/setup.ts`
- `src/test/setup.ts` — placeholder setup file (empty for now)

**Dependencies:** None

**Done when:** `npm install` succeeds; `npx vitest run` exits with 0 tests (no failures); `npx esbuild src/main.ts --bundle --outfile=script.js` fails gracefully (file doesn't exist yet, not a config error)
<!-- END_PHASE_1 -->

<!-- START_PHASE_2 -->
### Phase 2: Baseline Test Suite Against Current `script.js`

**Goal:** Write tests that document current behavior and pass against the unmodified `script.js`. These tests become the regression guard for the port.

**Components:**
- `src/test/setup.ts` — sets up jsdom DOM (all element ids the script references), evals `script.js`, exposes `tools` and `drawHorse` globals with `vitest-canvas-mock` active
- `src/test/baseline/tool-interface.test.ts` — every tool implements the `Tool` plugin interface
- `src/test/baseline/sounds.test.ts` — `playSound` calls `audio.play()`, sets `style.loop`; `pauseSound` calls `audio.pause()`, resets `currentTime` to 0, clears `style.loop`
- `src/test/baseline/drips.test.ts` — `getDripSize()` distribution (roughly half return 0, non-zero values within expected range)
- `src/test/baseline/bucket-helpers.test.ts` — `hexToRgb`, `rgbToHex` round-trip; `standardizeColor` converts CSS color names to RGB
- `src/test/baseline/color-selection.test.ts` — clicking a color button sets `drawHorse.selectedColor` to the button's id; updates CSS classes
- `src/test/baseline/stamp-selection.test.ts` — clicking a stamp choice sets `drawHorse.selectedStamp`
- `src/test/baseline/undo.test.ts` — `endPosition()` pushes to `undoStack`; `oops` tool pops and restores
- `src/test/baseline/canvas-draw-calls.test.ts` — pencil calls `stroke`, eraser uses `strokeStyle = "white"`, drips calls `arc` + `fill`, stamp calls `drawImage`, nuke calls `clearRect`

**Dependencies:** Phase 1

**Done when:** All baseline tests pass against the current `script.js`; `npx vitest run` is green
<!-- END_PHASE_2 -->

<!-- START_PHASE_3 -->
### Phase 3: Port Utilities to TypeScript

**Goal:** Port the two self-contained utility areas — sound functions and bucket helpers — to TypeScript. No tools or state yet.

**Components:**
- `src/sounds.ts` — `playSound(soundId: string, loop?: boolean)` and `pauseSound(soundId: string)`
- `src/tools/bucket-helpers.ts` — `hexToRgb`, `rgbToHex`, `standardizeColor`, `matchStartColor`, `colorPixel` with full types
- `src/types.ts` — `Tool`, `ToolSettings`, `Stamp` interfaces
- `src/test/sounds.test.ts` — same assertions as baseline, now importing from `src/sounds.ts`
- `src/test/bucket-helpers.test.ts` — same assertions as baseline, now importing from `src/tools/bucket-helpers.ts`

**Dependencies:** Phase 2 (baseline tests define what must pass)

**Done when:** TypeScript files type-check; import-based tests pass; baseline eval-based tests still pass
<!-- END_PHASE_3 -->

<!-- START_PHASE_4 -->
### Phase 4: Port Tools to TypeScript

**Goal:** Port all eight tools to TypeScript as individual modules implementing the `Tool` interface.

**Components:**
- `src/tools/pencil.ts`
- `src/tools/drips.ts` — includes `getDripSize()`
- `src/tools/stamp.ts`
- `src/tools/bubbles.ts`
- `src/tools/eraser.ts`
- `src/tools/oops.ts`
- `src/tools/nuke.ts`
- `src/tools/bucket.ts` — imports from `bucket-helpers.ts`
- `src/tools/index.ts` — assembles and exports the `tools` registry object
- `src/test/tools/` — import-based tests mirroring the baseline canvas draw call and interface tests

**Dependencies:** Phase 3 (`Tool` interface and `bucket-helpers.ts` must exist)

**Done when:** All tools type-check; tool interface and canvas draw call tests pass importing from `src/tools/index.ts`; baseline tests still pass
<!-- END_PHASE_4 -->

<!-- START_PHASE_5 -->
### Phase 5: Port `drawHorse` and Stamps to TypeScript

**Goal:** Port the main application state object and stamp data.

**Components:**
- `src/stamps.ts` — the `stamps` registry (base64 SVG data) typed as `Record<string, Stamp>`
- `src/drawHorse.ts` — full `drawHorse` object with typed state, methods, and DOM references; imports from `src/tools/index.ts` and `src/stamps.ts`
- `src/main.ts` — `window.onload` initialization sequence; imports `drawHorse` and calls setup methods
- `src/test/drawHorse/` — import-based tests for color selection, stamp selection, undo stack, position calculation

**Dependencies:** Phase 4 (tools must be ported)

**Done when:** Full TypeScript source type-checks; `esbuild src/main.ts --bundle --outfile=script.js` succeeds and produces a valid file; all import-based tests pass; baseline eval tests still pass
<!-- END_PHASE_5 -->

<!-- START_PHASE_6 -->
### Phase 6: Browser Verification and Baseline Retirement

**Goal:** Confirm the esbuild output works identically in a real browser; retire the eval-based baseline tests.

**Components:**
- Built `script.js` loaded by the existing `index.html` — smoke test all tools, colors, stamps, undo, clear
- Retirement of `src/test/baseline/` directory (eval-based tests replaced by import-based equivalents)
- `package.json` scripts finalized: `build`, `watch`, `typecheck`, `test`, `check`

**Dependencies:** Phase 5

**Done when:** All tools behave correctly in browser; `npm run check` (vitest + tsc) passes; no eval-based tests remain; `script.js` output has no runtime module wrappers or injected helpers
<!-- END_PHASE_6 -->

## Additional Considerations

**Known bugs preserved intentionally:** The `audio.style.loop` assignment (should be the `loop` attribute), the duplicate `selectedColor` property in `drawHorse`, the swapped increase/decrease controls in `settings`, and the hardcoded `colorPixel` color in `bucket` are all documented in `CLAUDE.md` as known issues. The TypeScript port preserves these behaviors exactly — fixing them is out of scope and would invalidate the behavioral tests.

**Bubble images remain external:** The three `cdn.glitch.global` URLs in `bubbles.ts` are preserved as-is. Inlining them is tracked in GitHub issue #11 and is out of scope for this migration.

**`bucket` tool remains hidden:** The bucket button stays commented out in `index.html`. The TypeScript implementation is included in `src/tools/bucket.ts` for completeness but the UI exposure is unchanged.
