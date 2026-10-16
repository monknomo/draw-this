// src/drawHorse.ts
import type { DrawHorseContext, Tool, Stamp } from './types'
import { tools } from './tools/index'
import { stamps } from './stamps'
import { colorizeStamp } from './tools/stamp/colorize'
import { SIZE_DEFAULT, nextSize } from './sizeControl'
import { DEFAULT_PALETTE, swatchColors, cyclePalette, type Palette } from './palettes'
import { playSound } from './sounds'

const noopTool: Tool = {
  name: 'noop',
  button: document.createElement('button'),
  selectable: false,
  drawsImmediately: false,
  onclick: () => {},
  draw: () => {},
  stopDrawing: () => {},
}

// drawHorse is exported as a const object so tools can import it by reference.
// The circular import (tools → drawHorse → tools) is safe because tools only
// reference drawHorse inside method bodies, never at module initialization time.
export const drawHorse: DrawHorseContext & {
  header: HTMLElement
  stretcher: HTMLElement
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  currentTool: Tool
  selectedColor: string
  activePalette: Palette
  selectedStamp: Stamp | undefined
  undoStack: ImageData[]
  pos: { x: number; y: number }
  colorChoices: HTMLCollectionOf<Element>
  canvasWidth: number
  canvasHeight: number
  stamps: Record<string, Stamp>
  brushSize: number
  setPosition: (e: MouseEvent | TouchEvent) => void
  beginPosition: (e: MouseEvent | TouchEvent) => void
  endPosition: (e: MouseEvent | TouchEvent) => void
  draw: (e: MouseEvent | TouchEvent) => void
  resize: () => void
  addListeners: () => void
  updateSizeControls: (feedback?: 'pop' | 'nudge') => void
  changeSize: (direction: 1 | -1) => void
  setupColorChooser: () => void
  renderColorChoices: () => void
  applyPalette: (palette: Palette) => void
  setupPalettePicker: () => void
  getColorChoiceClickHandler: (cc: Element) => (e: Event) => void
  makeStampChoiceHandler: (cc: Element) => (e: Event) => void
  setupStamps: () => void
  setupTools: () => void
  showStampSelectors: () => void
  hideStampSelectors: () => void
  showColorSelectors: () => void
} = {
  header: document.getElementById('header') as HTMLElement,
  stretcher: document.getElementById('stretcher') as HTMLElement,
  canvas: document.getElementById('drawHere') as HTMLCanvasElement,

  // Known bug preserved: selectedColor appears twice in script.js (lines 472 and 478).
  // JavaScript uses the last definition; TypeScript only allows one — behavior is identical.
  selectedColor: 'black',
  activePalette: DEFAULT_PALETTE,
  currentTool: undefined as unknown as Tool,  // set to tools.pencil in main.ts during initialization
  selectedStamp: undefined,
  undoStack: [],
  ctx: undefined as unknown as CanvasRenderingContext2D,  // set in window.onload
  pos: { x: 0, y: 0 },
  colorChoices: [] as unknown as HTMLCollectionOf<Element>,
  canvasWidth: 0,
  canvasHeight: 0,
  stamps,
  brushSize: SIZE_DEFAULT,

  setPosition(e) {
    if (e.target === drawHorse.canvas) e.preventDefault()
    const bcr = (e.target as Element).getBoundingClientRect()
    const touch = (e as TouchEvent).touches?.[0]
    if (touch) {
      drawHorse.pos.x = touch.clientX - bcr.x
      drawHorse.pos.y = touch.clientY - bcr.y
    } else {
      drawHorse.pos.x = (e as MouseEvent).clientX - bcr.x
      drawHorse.pos.y = (e as MouseEvent).clientY - bcr.y
    }
  },

  beginPosition(e) {
    drawHorse.undoStack.push(
      drawHorse.ctx.getImageData(0, 0, drawHorse.ctx.canvas.width, drawHorse.ctx.canvas.height)
    )
    drawHorse.setPosition(e)
  },

  endPosition(e) {
    drawHorse.currentTool.stopDrawing(e)
    drawHorse.setPosition(e)
  },

  draw(e) {
    const me = e as MouseEvent
    const te = e as TouchEvent
    if ((me.buttons && me.buttons === 1) || (te.touches && te.touches.length > 0)) {
      drawHorse.currentTool.draw(e)
    }
  },

  resize() {
    drawHorse.canvasWidth = drawHorse.stretcher.offsetWidth
    const topbar = document.getElementById('topbar') as HTMLElement | null
    drawHorse.canvasHeight = Math.floor(
      0.95 *
        (window.innerHeight - drawHorse.header.offsetHeight - (topbar?.offsetHeight ?? 0))
    )
    drawHorse.ctx.canvas.width = drawHorse.stretcher.offsetWidth
    drawHorse.ctx.canvas.height = drawHorse.canvasHeight
    drawHorse.stretcher.style.height = drawHorse.canvasHeight + 'px'
    drawHorse.stretcher.setAttribute(
      'style',
      `width:${drawHorse.canvasWidth}px;height:${drawHorse.canvasHeight}px;`
    )
    drawHorse.ctx.fillStyle = 'white'
    drawHorse.ctx.fillRect(0, 0, drawHorse.ctx.canvas.width, drawHorse.ctx.canvas.height)
  },

  // Sync the size UI: enable +/- only for tools that honor the global brush size,
  // and redraw the preview dot. `feedback` plays a pop (size changed) or nudge (hit a limit).
  updateSizeControls(feedback?: 'pop' | 'nudge') {
    const enabled = !!drawHorse.currentTool.usesSize
    for (const id of ['size-increase', 'size-decrease']) {
      const btn = document.getElementById(id) as HTMLButtonElement | null
      if (btn) btn.disabled = !enabled
    }
    const preview = document.getElementById('size-preview')
    const dot = document.getElementById('size-dot')
    if (!preview || !dot) return
    preview.classList.toggle('disabled', !enabled)
    preview.dataset.size = String(drawHorse.brushSize)
    preview.title = `Size ${drawHorse.brushSize}`
    const px = Math.round(4 + drawHorse.brushSize * 0.78)  // ~7px at default, ~43px at max
    dot.style.width = dot.style.height = `${px}px`
    if (feedback) {
      dot.classList.remove('pop', 'nudge')
      void dot.offsetWidth  // restart the animation
      dot.classList.add(feedback)
    }
  },

  changeSize(direction: 1 | -1) {
    const before = drawHorse.brushSize
    drawHorse.brushSize = nextSize(before, direction)
    // Same click sound as tool buttons, restarted so rapid presses each get a pop.
    const click = document.getElementById('clickSound') as HTMLAudioElement | null
    if (click) {
      click.currentTime = 0
      void click.play()?.catch?.(() => {})
    }
    drawHorse.updateSizeControls(drawHorse.brushSize === before ? 'nudge' : 'pop')
  },

  addListeners() {
    window.addEventListener('resize', drawHorse.resize)

    // The original uses the implicit global `event` object (e.g., `event.target.closest(".tool")`).
    // TypeScript strict mode does not allow implicit globals. Using the `e` parameter is
    // semantically equivalent in all standard browser event dispatch paths.
    document.addEventListener(
      'click',
      function (e) {
        const toolEl = (e.target as Element).closest?.('.tool')
        if (!toolEl) return
        const tool = tools[toolEl.id]
        const toolControls = document.getElementsByClassName('tool')

        if (tool.selectable) {
          for (let i = 0; i < toolControls.length; i++) {
            toolControls[i].classList.remove('selectedControl')
          }
          toolEl.classList.add('selectedControl')
          drawHorse.currentTool = tool
          // Brush size is global and persists across tool changes.
          drawHorse.updateSizeControls()
        }
        tool.onclick(e)
      },
      false
    )

    const sizeIncreaseBtn = document.getElementById('size-increase')
    const sizeDecreaseBtn = document.getElementById('size-decrease')
    if (sizeIncreaseBtn) {
      sizeIncreaseBtn.addEventListener('click', () => {
        drawHorse.changeSize(1)
      })
    }
    if (sizeDecreaseBtn) {
      sizeDecreaseBtn.addEventListener('click', () => {
        drawHorse.changeSize(-1)
      })
    }

    document.querySelectorAll('.category').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cat = (e.currentTarget as HTMLElement).dataset.category
        const topTools = document.querySelector('#top-tools') as HTMLElement | null
        document.querySelectorAll('.tool').forEach(t => t.classList.remove('selectedControl'))
        if (cat && topTools) {
          topTools.dataset.activeCategory = cat
          const firstTool = topTools.querySelector<HTMLElement>(`.tool[data-category="${cat}"]`)
          if (firstTool) {
            firstTool.click()
          } else {
            drawHorse.currentTool = noopTool
          }
        }
        document.querySelectorAll('.category').forEach(b =>
          b.classList.remove('selectedControl')
        )
        ;(e.currentTarget as HTMLElement).classList.add('selectedControl')
      })
    })

    drawHorse.canvas.addEventListener('mousemove', function (e) {
      if (!drawHorse.currentTool.drawsImmediately) drawHorse.draw(e)
    })
    drawHorse.canvas.addEventListener('mousedown', function (e) {
      drawHorse.beginPosition(e)
      drawHorse.draw(e)
    })
    drawHorse.canvas.addEventListener('mouseup', function (e) {
      drawHorse.endPosition(e)
    })
    drawHorse.canvas.addEventListener('mouseleave', function (e) {
      drawHorse.currentTool.stopDrawing(e)
    })
    drawHorse.canvas.addEventListener('mouseenter', function (e) {
      drawHorse.beginPosition(e)
    })

    drawHorse.canvas.addEventListener('touchmove', drawHorse.draw)
    drawHorse.canvas.addEventListener('touchstart', function (e) {
      drawHorse.beginPosition(e)
      drawHorse.draw(e)
    })
    drawHorse.canvas.addEventListener('touchend', function (e) {
      drawHorse.endPosition(e)
    })
  },

  // Render swatches dynamically from the active palette. Each swatch stores its
  // color in a data-color attribute (colors may be hex, which can't be an element
  // id or id-selector) and is painted via inline style.backgroundColor. The rainbow
  // swatch is special: data-color="rainbow", its gradient look comes from CSS.
  renderColorChoices() {
    const container = document.getElementById('swatches')
    if (!container) return

    let html = swatchColors(drawHorse.activePalette)
      .map(
        color =>
          `<button class="colorChoice" data-color="${color}" ` +
          `style="background-color:${color}"></button>`
      )
      .join('')
    html += `<button id="rainbow" class="colorChoice" data-color="rainbow"></button>`
    container.innerHTML = html

    drawHorse.setupColorChooser()

    // Restore/initialize the selected-swatch highlight for the current selectedColor.
    const selected = container.querySelector(
      `.colorChoice[data-color="${drawHorse.selectedColor}"]`
    )
    if (selected) selected.classList.add('selectedColorChoice')
  },

  setupColorChooser() {
    drawHorse.colorChoices = document.getElementsByClassName('colorChoice')
    for (let i = 0; i < drawHorse.colorChoices.length; i++) {
      ;(drawHorse.colorChoices[i] as HTMLElement).onclick =
        drawHorse.getColorChoiceClickHandler(drawHorse.colorChoices[i])
    }
  },

  // Apply a palette: set state and re-render swatches. The current color survives the
  // swap when the new palette still offers it (rainbow and the shared neutrals always
  // do); otherwise fall back to black, which is always available and always visible.
  // Swatch highlighting is restored by renderColorChoices().
  applyPalette(palette) {
    drawHorse.activePalette = palette
    const keep =
      drawHorse.selectedColor === 'rainbow' ||
      swatchColors(palette).includes(drawHorse.selectedColor)
    if (!keep) drawHorse.selectedColor = 'black'
    drawHorse.renderColorChoices()
  },

  // Two arrow buttons step through the palettes like a ring buffer: ▶ (above the
  // swatches) goes to the next palette, ◀ (below them) to the previous, and both wrap.
  // Assigned via onclick (not addEventListener) so wiring twice never double-steps.
  setupPalettePicker() {
    const step = (direction: 1 | -1) => () => {
      playSound('clickSound')
      drawHorse.applyPalette(cyclePalette(drawHorse.activePalette, direction))
    }
    const next = document.getElementById('palette-next')
    const prev = document.getElementById('palette-prev')
    if (next) next.onclick = step(1)
    if (prev) prev.onclick = step(-1)
  },

  getColorChoiceClickHandler(cc) {
    return (e) => {
      drawHorse.selectedColor = (cc as HTMLElement).dataset.color ?? ''
      const colorChoiceControls = document.getElementsByClassName('colorChoice')
      for (let i = 0; i < colorChoiceControls.length; i++) {
        colorChoiceControls[i].classList.remove('selectedColorChoice')
      }
      ;(e.currentTarget as Element).classList.add('selectedColorChoice')
    }
  },

  makeStampChoiceHandler(cc) {
    return (_e) => {
      drawHorse.selectedStamp = drawHorse.stamps[(cc as HTMLElement).id]
    }
  },

  setupStamps() {
    Object.entries(drawHorse.stamps).forEach(([_key, value]) => {
      const stampchooser = document.getElementById('stampchooser')!
      const colorized = colorizeStamp(
        value.url,
        drawHorse.selectedColor,
        drawHorse.activePalette.colors
      )
      stampchooser.innerHTML +=
        `<button id='${value.id}' class='stampchoice'>` +
        `<img width='30px' max-width='30px' max-height='30px' ` +
        `src='data:image/svg+xml;base64,${colorized}' alt='${value.name}'/>` +
        `</button>`
    })

    const stampChoices = document.getElementsByClassName('stampchoice')
    for (let i = 0; i < stampChoices.length; i++) {
      ;(stampChoices[i] as HTMLElement).onclick = drawHorse.makeStampChoiceHandler(stampChoices[i])
    }
    drawHorse.selectedStamp = drawHorse.stamps['horse']
  },

  setupTools() {
    // Original body is a no-op loop — preserved for structural parity
    const toolButtons = document.getElementsByClassName('tool')
    for (let i = 0; i < toolButtons.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _toolButton = toolButtons[i]
    }
  },

  showStampSelectors() {
    // visibility is CSS-driven by #top-tools[data-active-category="stamp"] ~ #stampchooser
  },

  hideStampSelectors() {
    // visibility is CSS-driven by #top-tools[data-active-category="stamp"] ~ #stampchooser
  },

  showColorSelectors() {
    // The layout refactor renamed #colorchooser → #colors-col and colors are now
    // always visible. Guard the lookup so tool onclick handlers don't throw when
    // the element is absent; there is nothing to toggle.
    const colorsCol = document.getElementById('colors-col')
    if (colorsCol) colorsCol.style.display = ''
  },
}
