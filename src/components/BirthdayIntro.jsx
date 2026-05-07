import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Fireworks from './Fireworks.jsx'
import HeartsAndBirds from './HeartsAndBirds.jsx'

// Phases (sequential):
//   3 → 2 → 1 → boom (Happy Birthday + fireworks) → promise (manual dismiss)
//
// Only the first four phases auto-progress. The promise phase NEVER
// auto-dismisses — the user must tap "Open your gift". Each promise message
// stays on screen for 8s so it can be read in full.

const COUNTDOWN_MS = 1300
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
          {/* Soft gradient backdrop */}
          <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-rose-900/40 to-ink-900" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(230,51,107,0.25)_0%,transparent_60%)]" />

          {/* Always-on twinkles */}
          <HeartsAndBirds density={0.7} hearts butterflies sparkles birds={false} />

          {/* Realistic fireworks during boom + promise */}
          {(phase === 'boom' || phase === 'promise') && (
            <Fireworks
              active
              intensity={phase === 'boom' ? 3 : 0.9}
              duration={null /* keep dripping during the promise so the sky stays alive */}
            />
          )}

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

function Countdown({ n }) {
  return (
    <motion.div
      initial={{ scale: 0.4, opacity: 0, filter: 'blur(20px)' }}
      animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
      exit={{ scale: 6, opacity: 0, filter: 'blur(20px)' }}
      transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 text-center"
    >
      <motion.span
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
        className="block font-serif text-[18rem] leading-none text-gradient-rose sm:text-[24rem]"
        style={{
          textShadow:
            '0 0 80px rgba(230,51,107,0.65), 0 0 200px rgba(212,164,92,0.35)',
        }}
      >
        {n}
      </motion.span>
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mt-4 inline-block font-script text-2xl text-rose-300"
      >
        almost there, my love…
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
      {/* White flash on entry */}
      <motion.div
        initial={{ opacity: 0.9 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="pointer-events-none fixed inset-0 bg-white"
      />

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
        className="heading-serif mt-6 text-5xl leading-[0.95] sm:text-7xl md:text-8xl"
      >
        <span className="text-gradient-rose">Happy Birthday</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="mt-6 font-script text-4xl text-rose-200 sm:text-6xl"
      >
        my dear Meena <span className="inline-block">💖</span>
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7, duration: 0.8 }}
        className="mt-3 font-script text-3xl text-cream-50/95 sm:text-5xl"
        style={{ textShadow: '0 0 40px rgba(230,51,107,0.45)' }}
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
