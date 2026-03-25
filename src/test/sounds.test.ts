// src/test/sounds.test.ts
import { playSound, pauseSound } from '../sounds'

describe('playSound (import-based)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('AC2.1: calls audio.play() on the correct element', () => {
    const audio = document.getElementById('clickSound') as HTMLAudioElement
    const playSpy = vi.spyOn(audio, 'play').mockResolvedValue(undefined)
    playSound('clickSound')
    expect(playSpy).toHaveBeenCalledOnce()
  })

  it('AC2.2: with loop=true sets audio.style.loop to "loop"', () => {
    // Known bug preserved: non-standard CSS property assignment
    // If jsdom ignores the non-standard property, mark this .skip with that note
    const audio = document.getElementById('drippingSound') as HTMLAudioElement
    playSound('drippingSound', true)
    expect((audio.style as unknown as Record<string, string>).loop).toBe('loop')
  })
})

describe('pauseSound (import-based)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('AC2.3: calls audio.pause() on the correct element', () => {
    const audio = document.getElementById('pencilSound') as HTMLAudioElement
    const pauseSpy = vi.spyOn(audio, 'pause')
    pauseSound('pencilSound')
    expect(pauseSpy).toHaveBeenCalledOnce()
  })

  it('AC2.4: resets audio.currentTime to 0', () => {
    const audio = document.getElementById('pencilSound') as HTMLAudioElement
    audio.currentTime = 5
    pauseSound('pencilSound')
    expect(audio.currentTime).toBe(0)
  })

  it('AC2.5: sets audio.style.loop to ""', () => {
    // Known bug preserved: non-standard CSS property — same jsdom caveat as AC2.2
    const audio = document.getElementById('drippingSound') as HTMLAudioElement
    ;(audio.style as unknown as Record<string, string>).loop = 'loop'
    pauseSound('drippingSound')
    expect((audio.style as unknown as Record<string, string>).loop).toBe('')
  })
})
