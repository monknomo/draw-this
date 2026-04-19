// src/main.ts
import { drawHorse } from './drawHorse'
import { tools } from './tools/index'
import { playSound, pauseSound } from './sounds'
import { saveCanvas } from './save'

// Expose globals for compatibility with baseline tests and eval harness
declare global {
  var tools: any
  var drawHorse: any
  var playSound: any
  var pauseSound: any
}

globalThis.tools = tools as any
globalThis.drawHorse = drawHorse as any
globalThis.playSound = playSound as any
globalThis.pauseSound = pauseSound as any

// Initialize drawHorse.currentTool after circular dependency is resolved
drawHorse.currentTool = tools.pencil

window.onload = (_event) => {
  // Set up color choice click handlers
  drawHorse.setupColorChooser()

  // Assign canvas 2D context
  drawHorse.ctx = drawHorse.canvas.getContext('2d') as CanvasRenderingContext2D

  // Size canvas to window
  drawHorse.resize()

  // Register mouse and touch event listeners
  drawHorse.addListeners()

  // Set default category to 'pen'
  document.querySelector<HTMLElement>('.category[data-category="pen"]')
    ?.classList.add('selectedControl')

  // Build stamp chooser UI
  drawHorse.setupStamps()

  // Set up tool button click handlers (no-op in original, preserved)
  drawHorse.setupTools()

  // Wire screenshot button
  document.getElementById('screenshot')!.addEventListener('click', () =>
    saveCanvas(drawHorse.ctx.canvas)
  )
}
