# TypeScript Migration — Phase 1: Toolchain Setup

**Goal:** Add build and test infrastructure without touching any application logic.

**Architecture:** Install devDependencies only. esbuild bundles TypeScript → `script.js` for the browser. `tsc --noEmit` type-checks only. Vitest + jsdom runs tests in a simulated browser environment.

**Tech Stack:** esbuild, TypeScript, Vitest, vitest-canvas-mock, jsdom

**Scope:** Phase 1 of 6

**Codebase verified:** 2026-03-23 — clean slate confirmed. No package.json, tsconfig.json, src/, or node_modules exist. script.js, index.html, style.css all present at repo root.

---

## Acceptance Criteria Coverage

Verifies: None (infrastructure phase — verified operationally)

---

<!-- START_TASK_1 -->
### Task 1: Create package.json

**Files:**
- Create: `package.json`

**Step 1: Create the file**

```json
{
  "name": "draw-this",
  "private": true,
  "scripts": {
    "build": "esbuild src/main.ts --bundle --format=iife --target=es2020 --outfile=script.js",
    "build:min": "esbuild src/main.ts --bundle --format=iife --target=es2020 --minify --outfile=script.js",
    "watch": "esbuild src/main.ts --bundle --format=iife --target=es2020 --outfile=script.js --watch",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest run",
    "check": "vitest run && tsc --noEmit"
  },
  "devDependencies": {
    "@types/jsdom": "^21.1.7",
    "esbuild": "^0.25.0",
    "jsdom": "^26.0.0",
    "typescript": "^5.8.0",
    "vitest": "^3.0.0",
    "vitest-canvas-mock": "^1.1.3"
  }
}
```

**Step 2: Verify**

No verification needed yet — install happens in Task 2.

**Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add package.json with build and test scripts"
```
<!-- END_TASK_1 -->

<!-- START_TASK_2 -->
### Task 2: Create tsconfig.json

**Files:**
- Create: `tsconfig.json`

**Step 1: Create the file**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2020", "DOM"],
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Note on `moduleResolution: "bundler"`:** This setting is required when esbuild handles module resolution. It allows TypeScript to understand `import`/`export` syntax without requiring file extensions, matching how esbuild resolves modules.

**Step 2: Commit**

```bash
git add tsconfig.json
git commit -m "chore: add tsconfig.json for type checking"
```
<!-- END_TASK_2 -->

<!-- START_TASK_3 -->
### Task 3: Create vitest.config.ts

**Files:**
- Create: `vitest.config.ts`

**Step 1: Create the file**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
})
```

**Step 2: Commit**

```bash
git add vitest.config.ts
git commit -m "chore: add vitest.config.ts with jsdom environment"
```
<!-- END_TASK_3 -->

<!-- START_TASK_4 -->
### Task 4: Create placeholder setup file and install

**Files:**
- Create: `src/test/setup.ts`

**Step 1: Create the placeholder setup file**

```typescript
// src/test/setup.ts
// Phase 1: placeholder — populated in Phase 2
import 'vitest-canvas-mock'
```

**Step 2: Install dependencies**

```bash
npm install
```

Expected: Installs without errors. `node_modules/` appears. `package-lock.json` is created.

**Step 3: Verify Vitest runs with zero tests**

```bash
npm run test:run
```

Expected output (no failures):
```
 RUN  v3.x.x

 Test Files  0 passed (0)
      Tests  0 passed (0)
   Start at  ...
   Duration  ...
```

**Step 4: Verify esbuild reports expected error (no src/main.ts yet)**

```bash
npm run build 2>&1 | head -5
```

Expected: esbuild reports `Could not resolve "src/main.ts"` or similar entry point error — this confirms esbuild is installed and configured correctly, not a setup failure.

**Step 5: Verify tsc reports no errors on empty src/**

```bash
npm run typecheck
```

Expected: exits with code 0 (no `.ts` files to type-check yet is OK).

**Step 6: Commit**

```bash
git add src/test/setup.ts package-lock.json
git commit -m "chore: add test setup placeholder and install dependencies"
```
<!-- END_TASK_4 -->
