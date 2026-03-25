// src/sounds.ts

export function playSound(soundId: string, loop?: boolean): void {
  const audio = document.getElementById(soundId) as HTMLAudioElement
  if (loop) {
    // Known bug preserved from script.js: assigns to a non-standard CSS property
    // (should be audio.loop = true, but the original uses audio.style.loop = "loop")
    ;(audio.style as unknown as Record<string, string>).loop = 'loop'
  }
  audio.play()
}

export function pauseSound(soundId: string): void {
  const audio = document.getElementById(soundId) as HTMLAudioElement
  audio.pause()
  // Known bug preserved: clearing via non-standard CSS property (see playSound)
  ;(audio.style as unknown as Record<string, string>).loop = ''
  audio.currentTime = 0
}
