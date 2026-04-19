import { describe, it, expect } from 'vitest'
import { drawHorse } from '../../drawHorse'

// Test default pen category on page load — runs directly after window.onload in setup.ts
// (AC3.3)
it('on page load, pen category has selectedControl and #top-tools shows pen (AC3.3)', () => {
  const penBtn = document.querySelector('.category[data-category="pen"]') as HTMLElement
  const topTools = document.getElementById('top-tools') as HTMLElement
  expect(penBtn.classList.contains('selectedControl')).toBe(true)
  expect(topTools.dataset.activeCategory).toBe('pen')
})

describe('category selection', () => {
  it('clicking a category button sets data-active-category on #top-tools (AC2.1–AC2.5)', () => {
    const topTools = document.getElementById('top-tools') as HTMLElement
    const categories = ['pen', 'brush', 'toy', 'stamp', 'eraser']
    for (const cat of categories) {
      const btn = document.querySelector(`.category[data-category="${cat}"]`) as HTMLElement
      btn.click()
      expect(topTools.dataset.activeCategory).toBe(cat)
    }
  })

  it('clicking stub categories sets data-active-category to each stub (AC2.6)', () => {
    const topTools = document.getElementById('top-tools') as HTMLElement
    for (const cat of ['filter', 'bucket', 'letter']) {
      const btn = document.querySelector(`.category[data-category="${cat}"]`) as HTMLElement
      btn.click()
      expect(topTools.dataset.activeCategory).toBe(cat)
    }
  })

  it('clicking a category adds selectedControl to that button (AC3.1)', () => {
    const brushBtn = document.querySelector('.category[data-category="brush"]') as HTMLElement
    brushBtn.click()
    expect(brushBtn.classList.contains('selectedControl')).toBe(true)
  })

  it('clicking a new category removes selectedControl from the previous one (AC3.2)', () => {
    const penBtn = document.querySelector('.category[data-category="pen"]') as HTMLElement
    const brushBtn = document.querySelector('.category[data-category="brush"]') as HTMLElement
    penBtn.classList.add('selectedControl')
    brushBtn.click()
    expect(penBtn.classList.contains('selectedControl')).toBe(false)
    expect(brushBtn.classList.contains('selectedControl')).toBe(true)
  })

  it('clicking the rainbow color button sets selectedColor to rainbow (AC5.2)', () => {
    const rainbowBtn = document.getElementById('rainbow') as HTMLElement
    rainbowBtn.click()
    expect((globalThis as any).__drawHorse.selectedColor).toBe('rainbow')
  })
})
