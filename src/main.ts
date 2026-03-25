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
