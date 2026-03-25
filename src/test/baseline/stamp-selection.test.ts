import { describe, it, expect } from 'vitest'

declare const __drawHorse: any

describe('stamp selection (AC1.9)', () => {
  it('clicking a stamp choice sets drawHorse.selectedStamp', () => {
    // After setupStamps runs during onload, #stampchooser contains stamp choice buttons
    const stampChoices = document.querySelectorAll<HTMLElement>('#stampchooser button')

    expect(stampChoices.length).toBeGreaterThan(0)
    stampChoices[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(__drawHorse.selectedStamp).toBeDefined()
  })

  it('selectedStamp has the expected shape after selection', () => {
    const stampChoices = document.querySelectorAll<HTMLElement>('#stampchooser button')
    stampChoices[0].dispatchEvent(new MouseEvent('click', { bubbles: true }))
    const stamp = __drawHorse.selectedStamp
    expect(stamp).toHaveProperty('id')
    expect(stamp).toHaveProperty('url')
  })
})
