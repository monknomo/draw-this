import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    // Only this repo's tests. Sibling git worktrees under .worktrees/ and .claude/
    // (both gitignored) each carry their own src/test copies that would otherwise be
    // globbed and run against the root's freshly-built script.js, producing spurious
    // failures unrelated to the code under test.
    include: ['src/**/*.test.ts'],
    exclude: ['**/node_modules/**', '.worktrees/**', '.claude/**'],
  },
})
