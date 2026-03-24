import { describe, it, expect, beforeEach, vi } from 'vitest'

declare const __playSound: (id: string, loop?: boolean) => void
declare const __pauseSound: (id: string) => void

describe('playSound', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('AC2.1: calls audio.play() on the correct element', () => {
    const audio = document.getElementById('clickSound') as HTMLAudioElement
    const playSpy = vi.spyOn(audio, 'play').mockResolvedValue(undefined)
    __playSound('clickSound')
    expect(playSpy).toHaveBeenCalledOnce()
  })

  it('AC2.2: with loop=true sets audio.style.loop to "loop"', () => {
    // Note: audio.style.loop is a non-standard CSS property — this is a known bug
    // in script.js being preserved intentionally (should be audio.loop attribute).
    // In jsdom, assigning a non-standard style property may be silently ignored.
    // If this assertion fails because jsdom ignores the assignment, mark it .skip
    // with this comment and a note that Phase 3 import-based tests will document the behavior.
    const audio = document.getElementById('drippingSound') as HTMLAudioElement
    __playSound('drippingSound', true)
    expect((audio.style as any).loop).toBe('loop')
  })
})

describe('pauseSound', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('AC2.3: calls audio.pause() on the correct element', () => {
    const audio = document.getElementById('pencilSound') as HTMLAudioElement
    const pauseSpy = vi.spyOn(audio, 'pause')
    __pauseSound('pencilSound')
    expect(pauseSpy).toHaveBeenCalledOnce()
  })

  it('AC2.4: resets audio.currentTime to 0', () => {
    const audio = document.getElementById('pencilSound') as HTMLAudioElement
    audio.currentTime = 5
    __pauseSound('pencilSound')
    expect(audio.currentTime).toBe(0)
  })

  it('AC2.5: sets audio.style.loop to ""', () => {
    // Same jsdom caveat as AC2.2 — mark .skip if non-standard style property is not stored
    const audio = document.getElementById('drippingSound') as HTMLAudioElement
    ;(audio.style as any).loop = 'loop'
    __pauseSound('drippingSound')
    expect((audio.style as any).loop).toBe('')
  })
})
