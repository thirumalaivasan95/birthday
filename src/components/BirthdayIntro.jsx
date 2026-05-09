import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Fireworks from './Fireworks.jsx'
import HeartsAndBirds from './HeartsAndBirds.jsx'
import NightSky, { Moon } from './NightSky.jsx'
import { isMobile as IS_MOBILE, isLowPower as IS_LOW_POWER } from '../utils/device.js'

// Phases (sequential):
//   3 → 2 → 1 → boom (Happy Birthday + fireworks) → promise (manual dismiss)
//
// Only the first four phases auto-progress. The promise phase NEVER
// auto-dismisses — the user must tap "Open your gift". Each promise message
// stays on screen for 8s so it can be read in full.

// Each digit gets a comfortable 2.0s on screen — long enough to read,
// short enough to keep momentum. Combined with the 0.5s exit, the user
// reliably sees all of 3 → 2 → 1 without any digit being skipped.
const COUNTDOWN_MS = 2000
const BOOM_MS = 5500
const PROMISE_MS = 8000  // each promise message visible this long

const PROMISES = [
  'I am here for you, always.',
  'I will take care of you, every day, every breath.',
  'I will protect our future, our family, our little ones.',
  'You are safe with me — today, tomorrow, forever.',
  '— with all my love, your husband, Sriram',
]

export default function BirthdayIntro({ onFinish }) {
  const [phase, setPhase] = useState('3')

  useEffect(() => {
    if (phase === 'finished' || phase === 'promise') return

    const next = {
      '3': '2',
      '2': '1',
      '1': 'boom',
      'boom': 'promise',
    }[phase]

    if (!next) return

    const ms = phase === 'boom' ? BOOM_MS : COUNTDOWN_MS
    const t = setTimeout(() => setPhase(next), ms)
    return () => clearTimeout(t)
  }, [phase])

  function finish() {
    setPhase('finished')
    onFinish?.()
  }

  return (
    <AnimatePresence>
      {phase !== 'finished' && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1.4, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-ink-900"
        >
          {/* Layer 1 — night sky backdrop: deep space gradient, stars,
              and shooting stars. Moon is intentionally OFF here so we can
              re-render it above the fireworks canvas (otherwise the canvas
              motion-blur would paint over it). */}
          <NightSky
            withMoon={false}
            withShootingStars={!IS_LOW_POWER}
            starCount={IS_LOW_POWER ? 50 : IS_MOBILE ? 140 : 140}
            cloudCount={IS_LOW_POWER ? 5 : IS_MOBILE ? 11 : 11}
          />

          {/* Soft warming overlay — keeps it romantic, not cold */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(230,51,107,0.14)_0%,transparent_65%)]" />

          {/* Layer 2 — hearts / butterflies / sparkles */}
          <HeartsAndBirds
            density={IS_LOW_POWER ? 0.35 : IS_MOBILE ? 0.7 : 0.7}
            hearts
            butterflies={!IS_LOW_POWER}
            sparkles
            birds={false}
          />

          {/* Layer 3 — realistic fireworks during boom + promise.
              bgColor is null so the canvas doesn't paint over the moon /
              stars beneath. Particle trails still work via each particle's
              own trail array.

              On low-power devices the canvas runs in "lite" mode (DPR=1,
              ~40% particles, no radial gradients, ~30fps) — visually
              still vivid bursts, just lighter on the GPU. */}
          {(phase === 'boom' || phase === 'promise') && (
            <Fireworks
              active
              intensity={IS_LOW_POWER ? 1.3 : IS_MOBILE ? 3.2 : 3.2}
              duration={null}
              bgColor={null}
            />
          )}

          {/* Layer 4 — the moon ALWAYS sits above everything else, so it
              stays visible no matter what the fireworks paint. */}
          <div className="pointer-events-none absolute inset-0 z-[5]">
            <Moon />
          </div>

          {/* Skip — emergency exit only */}
          <button
            onClick={finish}
            className="absolute right-5 top-5 z-50 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-cream-100/70 backdrop-blur transition hover:border-rose-400/60 hover:text-rose-200"
          >
            Skip ✕
          </button>

          {/* Phases */}
          <AnimatePresence mode="wait">
            {phase === '3' && <Countdown key="3" n="3" />}
            {phase === '2' && <Countdown key="2" n="2" />}
            {phase === '1' && <Countdown key="1" n="1" />}
            {phase === 'boom' && <Boom key="boom" />}
            {phase === 'promise' && <Promise key="promise" onDone={finish} />}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const COUNTDOWN_SUBTITLES = {
  '3': 'almost there, my love…',
  '2': 'Jee Bhoommmm',
  '1': 'bhaaaaaaaa',
}

function Countdown({ n }) {
  return (
    <motion.div
      initial={{ scale: 0.55, opacity: 0, filter: 'blur(14px)' }}
      animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
      exit={{ scale: 1.6, opacity: 0, filter: 'blur(14px)' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 flex w-full max-w-full flex-col items-center justify-center gap-6 px-6 text-center"
    >
      {/* The digit. Generous padding + line-height keeps swashes from being
          clipped at the top/bottom on any viewport. */}
      <motion.span
        key={`digit-${n}`}
        initial={{ scale: 0.85 }}
        animate={{ scale: [0.95, 1.04, 1] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        className="block font-serif text-gradient-rose"
        style={{
          fontSize: 'clamp(7rem, 34vw, 20rem)',
          lineHeight: 1.1,
          paddingBlock: '0.1em',
          textShadow:
            '0 0 60px rgba(230,51,107,0.7), 0 0 140px rgba(212,164,92,0.35)',
        }}
      >
        {n}
      </motion.span>
      {/* The per-phase subtitle */}
      <motion.span
        key={`sub-${n}`}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="inline-block font-script text-rose-300"
        style={{
          fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
          textShadow: '0 0 30px rgba(230,51,107,0.45)',
        }}
      >
        {COUNTDOWN_SUBTITLES[n] || 'almost there, my love…'}
      </motion.span>
    </motion.div>
  )
}

function Boom() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 px-6 text-center"
    >
      {/* Romantic entry — three radial blooms (rose, gold, soft pink) expand
          outward in slight succession, then a love heart pulses once. No
          harsh white flash. */}
      <RomanticBloom />
      <BeatingHeart />

      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="block text-[11px] uppercase tracking-[0.6em] text-rose-300"
      >
        🎉 the day the world got luckier 🎉
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        className="heading-serif mt-6 text-5xl leading-[1.05] sm:text-7xl md:text-8xl"
        style={{
          textShadow:
            '0 0 50px rgba(230,51,107,0.7), 0 0 120px rgba(212,164,92,0.45), 0 0 220px rgba(230,51,107,0.35)',
        }}
      >
        <span className="text-gradient-rose">Happy Birthday</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="mt-6 font-script text-4xl text-rose-200 sm:text-6xl"
        style={{ textShadow: '0 0 35px rgba(230,51,107,0.55)' }}
      >
        my dear Meena <span className="inline-block">💖</span>
      </motion.p>

      {/* Tamil — needs Noto Serif Tamil to actually render the glyphs.
          Same gradient + halo treatment as the English line above. */}
      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7, duration: 0.8 }}
        className="mt-4 font-tamil text-3xl font-semibold leading-[1.3] sm:text-5xl md:text-6xl"
        style={{
          background:
            'linear-gradient(135deg, #fff5f7 0%, #f9a8c4 35%, #e6336b 70%, #d4a45c 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          color: 'transparent',
          textShadow:
            '0 0 40px rgba(230,51,107,0.65), 0 0 100px rgba(212,164,92,0.4)',
          filter:
            'drop-shadow(0 0 10px rgba(230,51,107,0.35)) drop-shadow(0 0 24px rgba(212,164,92,0.25))',
        }}
      >
        குட்டி பாப்பா
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 1 }}
        className="mx-auto mt-10 h-px w-40 bg-gradient-to-r from-transparent via-rose-300 to-transparent"
      />
    </motion.div>
  )
}

// Romantic entry — three radial blooms in succession (rose, gold, soft pink)
// expanding to fill the screen, plus a tender vignette warm-up. Replaces the
// harsh white flash with a warm, candle-glow feel.
function RomanticBloom() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[5]">
      {/* Soft warm wash that rises in for 0.6s and lingers */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.6, 0.25] }}
        transition={{ duration: 1.6, times: [0, 0.35, 1], ease: 'easeOut' }}
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(255, 220, 200, 0.85) 0%, rgba(230, 51, 107, 0.5) 35%, rgba(125, 22, 56, 0.2) 60%, transparent 85%)',
        }}
      />
      {/* Three expanding rings — like dropping a stone in a pond of light */}
      {[0, 0.18, 0.36].map((delay, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0.85 }}
          animate={{ scale: 5, opacity: 0 }}
          transition={{
            duration: 1.6,
            delay,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background: i === 1
              ? 'radial-gradient(circle, rgba(212,164,92,0.55) 0%, rgba(212,164,92,0.0) 60%)'
              : 'radial-gradient(circle, rgba(255,180,200,0.55) 0%, rgba(230,51,107,0) 60%)',
            filter: 'blur(8px)',
          }}
        />
      ))}
      {/* A subtle global brighten that fades — replaces the cold white flash
          with a warm honeyed lift */}
      <motion.div
        initial={{ opacity: 0.55 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 1.0, ease: 'easeOut' }}
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(255, 244, 220, 0.5) 0%, rgba(230, 51, 107, 0.15) 50%, transparent 90%)',
        }}
      />
    </div>
  )
}

// A single love-heart that pulses once on entry, behind the title.
function BeatingHeart() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{
        opacity: [0, 0.85, 0.55, 0.7, 0.45, 0],
        scale: [0.4, 1.15, 0.95, 1.1, 0.95, 1.6],
      }}
      transition={{ duration: 2.6, times: [0, 0.18, 0.32, 0.5, 0.65, 1], ease: 'easeOut' }}
      className="pointer-events-none fixed left-1/2 top-1/2 z-[6] -translate-x-1/2 -translate-y-1/2"
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        className="h-64 w-64 sm:h-96 sm:w-96"
        style={{
          filter:
            'drop-shadow(0 0 50px rgba(230,51,107,0.85)) drop-shadow(0 0 120px rgba(230,51,107,0.55))',
        }}
      >
        <defs>
          <radialGradient id="heart-grad" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#ffe4ec" />
            <stop offset="40%" stopColor="#f472a6" />
            <stop offset="80%" stopColor="#e6336b" />
            <stop offset="100%" stopColor="#a21946" />
          </radialGradient>
        </defs>
        <path
          d="M12 21s-7.5-4.7-9.7-9.3C.6 7.6 3.1 4 6.6 4c2 0 3.5 1.1 4.4 2.6h2c.9-1.5 2.4-2.6 4.4-2.6 3.5 0 6 3.6 4.3 7.7C19.5 16.3 12 21 12 21z"
          fill="url(#heart-grad)"
        />
      </svg>
    </motion.div>
  )
}

function Promise({ onDone }) {
  const [i, setI] = useState(0)
  const isLast = i >= PROMISES.length - 1

  useEffect(() => {
    if (isLast) return // freeze on the signature
    const t = setTimeout(() => setI(i + 1), PROMISE_MS)
    return () => clearTimeout(t)
  }, [i, isLast])

  // Show button after the FIRST message has had its full 8 seconds —
  // so she gets to read the opener undistracted, but is then in control.
  const showButton = i >= 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.9 }}
      className="relative z-10 max-w-3xl px-6 text-center"
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-[10px] uppercase tracking-[0.6em] text-rose-300"
      >
        a promise, written in light
      </motion.span>

      <div className="mt-8 flex min-h-[14rem] items-center justify-center sm:min-h-[12rem]">
        <AnimatePresence mode="wait">
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 28, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -16, filter: 'blur(10px)' }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className={`font-serif italic leading-tight text-cream-50 ${
              isLast
                ? 'font-script not-italic text-3xl text-rose-200 sm:text-5xl'
                : 'text-3xl sm:text-5xl'
            }`}
          >
            {PROMISES[i]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Reading-progress dots — full bar drains over PROMISE_MS */}
      <div className="mt-8 flex flex-col items-center gap-3">
        <div className="flex items-center justify-center gap-2">
          {PROMISES.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === i ? 'w-8 bg-rose-400' : idx < i ? 'w-3 bg-rose-300/70' : 'w-1.5 bg-cream-100/30'
              }`}
            />
          ))}
        </div>
        {!isLast && (
          <motion.div
            key={`bar-${i}`}
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: PROMISE_MS / 1000, ease: 'linear' }}
            className="h-px bg-gradient-to-r from-rose-400 to-gold-400"
            style={{ maxWidth: '12rem' }}
          />
        )}
      </div>

      {/* The button — visible after the first message, required to dismiss */}
      <AnimatePresence>
        {showButton && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              boxShadow: [
                '0 0 60px rgba(230,51,107,0.5)',
                '0 0 100px rgba(230,51,107,0.75)',
                '0 0 60px rgba(230,51,107,0.5)',
              ],
            }}
            exit={{ opacity: 0, y: 10 }}
            transition={{
              duration: 0.7,
              boxShadow: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' },
            }}
            onClick={onDone}
            className="group mt-12 inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-rose-500 via-rose-400 to-gold-400 px-8 py-4 text-sm uppercase tracking-[0.25em] text-ink-900"
          >
            Open your gift
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </motion.button>
        )}
      </AnimatePresence>

      {!showButton && (
        <p className="mt-12 text-[10px] uppercase tracking-[0.4em] text-cream-100/40">
          take your time, my love
        </p>
      )}
    </motion.div>
  )
}
