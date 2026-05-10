import { useEffect, useRef, useState } from 'react'

/**
 * BackgroundMusic – plays "Epadi Vandhayo" at 50% volume on loop.
 *
 * Browsers block autoplay of audio until the user interacts with the page,
 * so we attempt to play immediately and also attach a one-time click /
 * touchstart listener as a fallback. A tiny floating 🔊 / 🔇 toggle lets
 * the visitor mute / unmute without disrupting the experience.
 */
export default function BackgroundMusic() {
  const audioRef = useRef(null)
  const [muted, setMuted] = useState(false)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.volume = 0.5
    audio.loop = true

    // Try to autoplay right away
    const tryPlay = () => {
      audio
        .play()
        .then(() => setStarted(true))
        .catch(() => {
          /* blocked – the interaction listener below will retry */
        })
    }

    tryPlay()

    // Fallback: on first user interaction, start playback
    const onInteraction = () => {
      if (audio.paused) {
        audio
          .play()
          .then(() => setStarted(true))
          .catch(() => {})
      }
      window.removeEventListener('click', onInteraction)
      window.removeEventListener('touchstart', onInteraction)
      window.removeEventListener('keydown', onInteraction)
    }

    window.addEventListener('click', onInteraction, { once: true })
    window.addEventListener('touchstart', onInteraction, { once: true })
    window.addEventListener('keydown', onInteraction, { once: true })

    return () => {
      audio.pause()
      window.removeEventListener('click', onInteraction)
      window.removeEventListener('touchstart', onInteraction)
      window.removeEventListener('keydown', onInteraction)
    }
  }, [])

  const toggleMute = () => {
    const audio = audioRef.current
    if (!audio) return

    if (!started) {
      audio
        .play()
        .then(() => {
          setStarted(true)
          setMuted(false)
        })
        .catch(() => {})
      return
    }

    audio.muted = !audio.muted
    setMuted(audio.muted)
  }

  return (
    <>
      <audio
        ref={audioRef}
        src="/audio/epadi-vandhayo.mp3"
        preload="auto"
        loop
      />

      {/* Floating mute / unmute toggle */}
      <button
        onClick={toggleMute}
        aria-label={muted ? 'Unmute background music' : 'Mute background music'}
        className="fixed bottom-5 right-5 z-[9999] flex h-11 w-11 items-center justify-center
                   rounded-full bg-black/40 text-xl text-white/80 backdrop-blur-md
                   shadow-lg shadow-rose-500/20 border border-white/10
                   transition-all duration-300 hover:scale-110 hover:bg-black/60
                   hover:text-white hover:shadow-rose-500/40"
        style={{ cursor: 'pointer' }}
      >
        {muted || !started ? '🔇' : '🔊'}
      </button>
    </>
  )
}
