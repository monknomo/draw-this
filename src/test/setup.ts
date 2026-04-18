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
    <button id="screenshot" class="control"></button>
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
// Note: getDripSize is a method on tools.drips and hexToRgb, rgbToHex, standardizeColor
// are methods on tools.bucket respectively — they are accessed via __tools.drips.getDripSize()
// and __tools.bucket.hexToRgb() etc. in tests, not as standalone globals.
try {
  eval(scriptCode + `
;globalThis.__tools = tools;
globalThis.__drawHorse = drawHorse;
globalThis.__playSound = playSound;
globalThis.__pauseSound = pauseSound;
`)
} catch (error) {
  console.error('Error evaluating script.js:', error)
  throw error
}

// Fire window.onload to run drawHorse initialization sequence:
// setupColorChooser → canvas sizing → ctx assignment → resize → addListeners → setupStamps
try {
  // Manually call the onload handler since dispatchEvent doesn't trigger property-based handlers
  const onloadEvent = new Event('load', { bubbles: false, cancelable: true })
  if (window.onload) {
    window.onload(onloadEvent as any)
  }
} catch (error) {
  console.error('Error firing window.onload:', error)
  throw error
}
