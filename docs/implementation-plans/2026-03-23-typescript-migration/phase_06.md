# TypeScript Migration — Phase 6: Browser Verification and Baseline Retirement

**Goal:** Confirm the esbuild output works identically in a real browser. Retire the eval-based baseline tests (they have been replaced by import-based equivalents). Verify `npm run check` passes with zero errors.

**Architecture:** This is an operational phase — no new code is written. The browser test is manual (open `index.html`, smoke test each tool). Baseline retirement deletes `src/test/baseline/` after confirming all import-based tests cover the same ACs.

**Tech Stack:** Browser (manual), Vitest, esbuild, TypeScript

**Scope:** Phase 6 of 6

**Codebase verified:** 2026-03-23 — Phase 5 complete. Built `script.js` exists. All TypeScript source in `src/`. Baseline tests exist at `src/test/baseline/`. Import-based tests exist in `src/test/sounds.test.ts`, `src/test/bucket-helpers.test.ts`, `src/test/tools/`, `src/test/drawHorse/`.

---

## Acceptance Criteria Coverage

### typescript-migration.AC5: Build output is browser-clean
- **typescript-migration.AC5.5 Success:** index.html and style.css are not modified by this migration

*Note: AC5.1–5.4 were verified in Phase 5 Task 6. This phase confirms they remain true after baseline retirement.*

---

<!-- START_TASK_1 -->
### Task 1: Build production script.js

**Step 1: Build the minified production bundle**

```bash
cd /Users/ggissel/code/draw-this/.worktrees/typescript-migration
npm run build:min
```

Expected: exits 0. `script.js` is updated with a minified IIFE bundle.

**Step 2: Verify build artifacts (AC5.1–5.4)**

```bash
npm run typecheck
```

Expected: exits 0.

```bash
grep -c "^import\|^export" script.js || true
```

Expected: 0 — no top-level module syntax.

```bash
grep -c "define(\|module\.exports\|System\.register" script.js || true
```

Expected: 0 — no module system wrappers.

**Step 3: Verify index.html and style.css unchanged (AC5.5)**

```bash
git diff HEAD -- index.html style.css
```

Expected: no output — both files are unmodified.

**Step 4: Commit**

```bash
git add script.js
git commit -m "build: regenerate minified script.js from TypeScript source"
```
<!-- END_TASK_1 -->

<!-- START_TASK_2 -->
### Task 2: Manual browser smoke test

**This task is manual — there is no automated verification.**

**Step 1: Open the app in a browser**

Open `index.html` directly in a browser (file:// is fine — no dev server needed):

```bash
open /Users/ggissel/code/draw-this/.worktrees/typescript-migration/index.html
```

**Step 2: Smoke test each tool**

Test each of the following scenarios and confirm they work identically to the original:

| Tool | Test | Expected |
|------|------|----------|
| pencil | Draw lines with mouse | Smooth lines in selected color |
| drips | Draw with drips | Irregular filled circles scattered |
| stamp | Select a stamp, click canvas | Stamp image placed at click point |
| bubbles | Click canvas | Scattered bubble images |
| eraser | Draw over existing content | White stroke erases |
| oops (undo) | Draw something, click oops | Last stroke removed |
| nuke (clear) | Draw something, click nuke | Canvas cleared |
| colors | Click each color swatch | Color changes, subsequent strokes use new color |
| stamp chooser | Select stamp tool, choose different stamps | Stamp images change correctly |

**Step 3: If any tool behaves differently from the original**

Compare the built `script.js` against the original using `git diff`. The original behavior is documented in:
- `/Users/ggissel/code/draw-this/.worktrees/typescript-migration/README.md`
- The baseline test files in `src/test/baseline/`

Fix the TypeScript source, rebuild (`npm run build:min`), and re-test.

**Step 4: Note results**

Record whether manual smoke test passed. If all tools work correctly, proceed to Task 3.
<!-- END_TASK_2 -->

<!-- START_TASK_3 -->
### Task 3: Verify import-based tests cover all baseline ACs

Before retiring baseline tests, confirm every AC tested in baseline has an equivalent import-based test.

**Step 1: Review the AC coverage mapping**

| AC | Baseline test file | Import-based test file |
|----|-------------------|----------------------|
| AC1.1 pencil draw calls | baseline/canvas-draw-calls.test.ts | src/test/tools/canvas-draw-calls.test.ts |
| AC1.2 eraser white | baseline/canvas-draw-calls.test.ts | src/test/tools/canvas-draw-calls.test.ts |
| AC1.3 drips arc/fill | baseline/canvas-draw-calls.test.ts | src/test/tools/canvas-draw-calls.test.ts |
| AC1.4 stamp drawImage | baseline/canvas-draw-calls.test.ts | src/test/tools/canvas-draw-calls.test.ts |
| AC1.5 nuke clearRect | baseline/canvas-draw-calls.test.ts | src/test/tools/canvas-draw-calls.test.ts |
| AC1.6 oops putImageData | baseline/undo.test.ts | src/test/drawHorse/undo.test.ts |
| AC1.7 endPosition pushes | baseline/undo.test.ts | src/test/drawHorse/state.test.ts |
| AC1.8 color selection | baseline/color-selection.test.ts | src/test/drawHorse/state.test.ts |
| AC1.9 stamp selection | baseline/stamp-selection.test.ts | src/test/drawHorse/state.test.ts |
| AC2.1–2.5 sounds | baseline/sounds.test.ts | src/test/sounds.test.ts |
| AC3.1–3.4 tool interface | baseline/tool-interface.test.ts | src/test/tools/tool-interface.test.ts |
| AC4.1–4.2 getDripSize | baseline/drips.test.ts | src/test/tools/ (drips test — create if missing) |
| AC4.3 hexToRgb round-trip | baseline/bucket-helpers.test.ts | src/test/bucket-helpers.test.ts |
| AC4.4 standardizeColor | baseline/bucket-helpers.test.ts | src/test/bucket-helpers.test.ts |

**Step 2: Add any missing import-based coverage**

If AC4.1 and AC4.2 (getDripSize distribution) are not yet covered by an import-based test, create `src/test/tools/drips.test.ts`:

```typescript
// src/test/tools/drips.test.ts
import { getDripSize } from '../../tools/drips'

describe('getDripSize (import-based)', () => {
  it('AC4.1: returns 0 approximately half the time across 200 calls', () => {
    const results = Array.from({ length: 200 }, () => getDripSize())
    const zeroCount = results.filter(r => r === 0).length
    expect(zeroCount).toBeGreaterThanOrEqual(30)
    expect(zeroCount).toBeLessThanOrEqual(140)
  })

  it('AC4.2: never returns values between 1 and 5', () => {
    const results = Array.from({ length: 200 }, () => getDripSize())
    const invalidValues = results.filter(r => r > 0 && r < 6)
    expect(invalidValues).toHaveLength(0)
  })
})
```

```bash
npm run test:run -- src/test/tools/drips.test.ts
```

Expected: Both tests pass.

**Step 3: Commit any new test files**

```bash
git add src/test/tools/drips.test.ts
git commit -m "test: add import-based getDripSize tests (AC4.1–4.2)"
```
<!-- END_TASK_3 -->

<!-- START_TASK_4 -->
### Task 4: Retire baseline tests

**Before deleting:** Run all tests one final time to confirm everything passes while baseline tests still exist.

```bash
cd /Users/ggissel/code/draw-this/.worktrees/typescript-migration
npm run test:run
```

Expected: All tests pass (both baseline and import-based).

**Step 1: Delete the baseline test directory**

```bash
rm -rf src/test/baseline/
```

**Step 2: Run tests again without baseline**

```bash
npm run test:run
```

Expected: All remaining import-based tests pass. Test count is lower (baseline files removed).

**Step 3: Commit**

```bash
git add -A
git commit -m "test: retire eval-based baseline tests (replaced by import-based equivalents)"
```
<!-- END_TASK_4 -->

<!-- START_TASK_5 -->
### Task 5: Run npm run check and finalize

**Step 1: Run the combined check**

```bash
cd /Users/ggissel/code/draw-this/.worktrees/typescript-migration
npm run check
```

Expected: `vitest run && tsc --noEmit` both pass with 0 failures and 0 type errors.

**Step 2: Verify final state of index.html and style.css (AC5.5)**

```bash
git diff main -- index.html style.css
```

Expected: no output — both files are identical to the main branch.

**Step 3: Update README.md**

The README currently says "no build step, no dev server, and no test suite." Update it to reflect the new developer workflow (the browser experience is unchanged):

Update the "Running" section to add:
```markdown
## Running

Open `index.html` directly in a browser. There is no dev server. Changes to `style.css` or `index.html` take effect immediately on page refresh.

For development on `script.js`, the project now uses TypeScript. Edit files in `src/` and run:

- `npm run build` — compile TypeScript to `script.js`
- `npm run watch` — watch for changes and rebuild automatically
- `npm run test` — run tests
- `npm run check` — run tests + type-check
- `npm run typecheck` — type-check only (no output files)
```

**Step 4: Commit README**

```bash
git add README.md
git commit -m "docs: update README to reflect TypeScript build workflow"
```

**Step 5: Final status check**

```bash
git status
git log --oneline -10
```

Expected: Working tree clean. Recent commits show the Phase 6 work.
<!-- END_TASK_5 -->
