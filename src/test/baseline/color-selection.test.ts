import { describe, it, expect, beforeEach } from 'vitest'

declare const __drawHorse: any

describe('color selection (AC1.8)', () => {
  beforeEach(() => {
    // Reset to default state
    __drawHorse.selectedColor = 'black'
  })

  it('clicking a color button sets drawHorse.selectedColor to the button id', () => {
    const redButton = document.getElementById('red') as HTMLElement
    redButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(__drawHorse.selectedColor).toBe('red')
  })

  it('clicking a different color updates selectedColor', () => {
    const blueButton = document.getElementById('blue') as HTMLElement
    blueButton.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(__drawHorse.selectedColor).toBe('blue')
  })
})
