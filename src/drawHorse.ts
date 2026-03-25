// src/drawHorse.ts
import type { DrawHorseContext, Tool, Stamp } from './types'
import { tools } from './tools/index'
import { stamps } from './stamps'

// drawHorse is exported as a const object so tools can import it by reference.
// The circular import (tools → drawHorse → tools) is safe because tools only
// reference drawHorse inside method bodies, never at module initialization time.
export const drawHorse: DrawHorseContext & {
  header: HTMLElement
  stretcher: HTMLElement
  colors: HTMLElement
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  currentTool: Tool
  selectedColor: string
  selectedStamp: Stamp | undefined
  undoStack: ImageData[]
  pos: { x: number; y: number }
  colorChoices: HTMLCollectionOf<Element>
  canvasWidth: number
  canvasHeight: number
  stamps: Record<string, Stamp>
  setPosition: (e: MouseEvent | TouchEvent) => void
  beginPosition: (e: MouseEvent | TouchEvent) => void
  endPosition: (e: MouseEvent | TouchEvent) => void
  draw: (e: MouseEvent | TouchEvent) => void
  resize: () => void
  addListeners: () => void
  setupColorChooser: () => void
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
  colors: document.getElementById('colors') as HTMLElement,
  canvas: document.getElementById('drawHere') as HTMLCanvasElement,

  // Known bug preserved: selectedColor appears twice in script.js (lines 472 and 478).
  // JavaScript uses the last definition; TypeScript only allows one — behavior is identical.
  selectedColor: 'black',
  currentTool: undefined as unknown as Tool,  // set to tools.pencil in main.ts during initialization
  selectedStamp: undefined,
  undoStack: [],
  ctx: undefined as unknown as CanvasRenderingContext2D,  // set in window.onload
  pos: { x: 0, y: 0 },
  colorChoices: [] as unknown as HTMLCollectionOf<Element>,
  canvasWidth: 0,
  canvasHeight: 0,
  stamps,

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
    drawHorse.setPosition(e)
    // if (drawHorse.currentTool.drawsImmediately) {
    //   drawHorse.draw(e);
    // }
  },

  endPosition(e) {
    drawHorse.currentTool.stopDrawing(e)
    drawHorse.setPosition(e)
    drawHorse.undoStack.push(
      drawHorse.ctx.getImageData(0, 0, drawHorse.ctx.canvas.width, drawHorse.ctx.canvas.height)
    )
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
    drawHorse.canvasHeight = Math.floor(
      0.95 *
        (window.innerHeight - drawHorse.header.offsetHeight - drawHorse.colors.offsetHeight)
    )
    drawHorse.ctx.canvas.width = drawHorse.stretcher.offsetWidth
    drawHorse.ctx.canvas.height = drawHorse.canvasHeight
    drawHorse.stretcher.style.height = drawHorse.canvasHeight + 'px'
    drawHorse.stretcher.setAttribute(
      'style',
      `width:${drawHorse.canvasWidth}px;height:${drawHorse.canvasHeight}px;`
    )
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
        }
        tool.onclick(e)
      },
      false
    )

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

    drawHorse.canvas.addEventListener('touchmove', drawHorse.draw)
    drawHorse.canvas.addEventListener('touchstart', function (e) {
      drawHorse.beginPosition(e)
      drawHorse.draw(e)
    })
    drawHorse.canvas.addEventListener('touchend', function (e) {
      drawHorse.endPosition(e)
    })
  },

  setupColorChooser() {
    drawHorse.colorChoices = document.getElementsByClassName('colorChoice')
    for (let i = 0; i < drawHorse.colorChoices.length; i++) {
      ;(drawHorse.colorChoices[i] as HTMLElement).onclick =
        drawHorse.getColorChoiceClickHandler(drawHorse.colorChoices[i])
    }
  },

  getColorChoiceClickHandler(cc) {
    return (e) => {
      drawHorse.selectedColor = (cc as HTMLElement).id
      const colorChoiceControls = document.getElementsByClassName('colorChoice')
      for (let i = 0; i < colorChoiceControls.length; i++) {
        colorChoiceControls[i].classList.remove('selectedColorChoice')
      }
      ;(e.target as Element).classList.add('selectedColorChoice')
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
      const colorized = window.btoa(
        window
          .atob(value.url)
          .replaceAll(
            '%%%%',
            ` style='fill:${drawHorse.selectedColor};stroke:${drawHorse.selectedColor};' `
          )
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
    const stampchooser = document.getElementById('stampchooser')!
    stampchooser.style.display = ''
  },

  hideStampSelectors() {
    const stampchooser = document.getElementById('stampchooser')!
    stampchooser.style.display = 'none'
  },

  showColorSelectors() {
    const colorchooser = document.getElementById('colorchooser')!
    colorchooser.style.display = ''
  },
}
