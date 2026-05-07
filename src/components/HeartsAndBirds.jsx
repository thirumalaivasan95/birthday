import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { isMobile as IS_MOBILE, isLowPower as IS_LOW_POWER } from '../utils/device.js'

function rand(min, max) {
  return Math.random() * (max - min) + min
}

const HeartIcon = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M12 21s-7.5-4.7-9.7-9.3C.6 7.6 3.1 4 6.6 4c2 0 3.5 1.1 4.4 2.6h2c.9-1.5 2.4-2.6 4.4-2.6 3.5 0 6 3.6 4.3 7.7C19.5 16.3 12 21 12 21z" />
  </svg>
)

// A peaceful white dove. Long, swept wings that flap SLOWLY (real doves
// glide more than they flap). Pure SVG, drawn facing right; the parent
// flips horizontally via CSS when flying right→left.
//
// `flapDuration` (seconds) sets the wing-beat rate. Default 1.6s gives
// the slow, peaceful flap of a dove (vs 0.5s for a sparrow).
const BirdIcon = ({ color = '#fff7fa', flapDuration = 1.6, ...props }) => (
  <svg viewBox="0 0 70 40" {...props}>
    {/* Forked tail */}
    <polygon points="18,20 8,16 10,20 8,24" fill={color} opacity="0.95" />
    {/* Sleek body */}
    <ellipse cx="32" cy="20" rx="10" ry="3.6" fill={color} />
    {/* Rounded head */}
    <circle cx="44" cy="18" r="3.2" fill={color} />
    {/* Short beak */}
    <polygon points="46.5,17.4 51,18.4 46.5,19.4" fill="#d4a45c" />
    {/* Eye */}
    <circle cx="44.5" cy="17.6" r="0.5" fill="#1a0b14" />

    {/* Upper wing — long and curved, like a real dove in flight.
        Slow upstroke, longer keyTime on the glide (down) phase. */}
    <path
      d="M30 19 Q 22 4 0 8 Q 18 14 30 19 Z"
      fill={color}
      opacity="0.95"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 30 19; -34 30 19; 0 30 19"
        keyTimes="0;0.45;1"
        dur={`${flapDuration}s`}
        repeatCount="indefinite"
      />
    </path>

    {/* Lower wing — in-phase with the upper (a dove's wings move together,
        not opposite like a hummingbird), slightly translucent for depth. */}
    <path
      d="M30 21 Q 22 32 4 28 Q 20 24 30 21 Z"
      fill={color}
      opacity="0.7"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 30 21; -18 30 21; 0 30 21"
        keyTimes="0;0.45;1"
        dur={`${flapDuration}s`}
        repeatCount="indefinite"
      />
    </path>

    {/* A tiny rose-coloured heart trailing behind — doves of love. */}
    <path
      d="M14 10 c-0.6,-0.8 -1.8,-0.8 -2.4,0 c-0.6,-0.8 -1.8,-0.8 -2.4,0 c-0.8,1 0.5,2.4 2.4,3.5 c1.9,-1.1 3.2,-2.5 2.4,-3.5 z"
      fill="#e6336b"
      opacity="0.8"
    >
      <animate
        attributeName="opacity"
        values="0;0.8;0"
        dur="3.2s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
)

const ButterflyIcon = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M12 12 C 7 5, 2 6, 2 12 C 2 17, 7 19, 12 12 Z M 12 12 C 17 5, 22 6, 22 12 C 22 17, 17 19, 12 12 Z M 12 6 L 12 18" />
  </svg>
)

const SparkleIcon = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M12 0 L13 10 L24 12 L13 14 L12 24 L11 14 L0 12 L11 10 Z" />
  </svg>
)

/**
 * Decorative layer of floating hearts, birds, butterflies, and sparkles.
 * Use as a `pointer-events-none absolute inset-0` overlay.
 *
 * Pass `density` to scale counts. Pass `corners` to mostly populate edges.
 */
export default function HeartsAndBirds({
  density = 1,
  corners = false,
  className = '',
  hearts = true,
  birds = true,
  butterflies = true,
  sparkles = true,
}) {
  const items = useMemo(() => {
    const arr = []
    let id = 0

    function place(type, base) {
      let left, top
      if (corners) {
        // Bias toward edges
        const edge = Math.floor(Math.random() * 4)
        if (edge === 0) { left = rand(0, 22);   top = rand(0, 100) }
        if (edge === 1) { left = rand(78, 100); top = rand(0, 100) }
        if (edge === 2) { left = rand(0, 100);  top = rand(0, 18) }
        if (edge === 3) { left = rand(0, 100);  top = rand(82, 100) }
      } else {
        left = rand(0, 100)
        top = rand(0, 100)
      }
      arr.push({ id: id++, type, left, top, ...base() })
    }

    if (hearts) {
      const n = IS_LOW_POWER ? Math.round(4 * density) : Math.round(14 * density)
      for (let i = 0; i < n; i++) {
        place('heart', () => ({
          size: rand(10, 22),
          color: ['#f9a8c4', '#e6336b', '#ffe4ec', '#fbcfe0'][Math.floor(Math.random() * 4)],
          duration: rand(8, 18),
          delay: rand(0, 8),
          drift: rand(-30, 30),
          opacity: rand(0.35, 0.85),
        }))
      }
    }

    if (birds && !IS_LOW_POWER) {
      // Doves drift across the section from off-screen to off-screen
      // (NEVER stuck in a loop inside the frame). 2–4 in flight at any
      // moment, with staggered delays so a fresh one keeps appearing.
      const baseN = IS_MOBILE ? 3 : 4
      const n = Math.max(2, Math.round(baseN * density))
      for (let i = 0; i < n; i++) {
        const size = rand(30, 48)
        // Doves flap SLOWLY — 1.4–2.2s per beat (vs 0.5s for the old bird).
        const flapDuration = rand(1.4, 2.2)
        place('bird', () => ({
          size,
          // Soft warm whites — pure dove plumage with a hint of cream.
          color: ['#fff7fa', '#fbeae0', '#f8e6d6'][Math.floor(Math.random() * 3)],
          // Long, peaceful crossings: 22–40s edge-to-edge.
          duration: rand(22, 40),
          delay: rand(0, 18),
          opacity: rand(0.7, 0.95),
          // Random flight band across the whole height (not just upper sky).
          band: rand(8, 80),
          // Gentle sine undulation — doves glide more than they wave.
          amplitude: rand(15, 45),
          waves: rand(1.2, 2.4),
          fromLeft: Math.random() > 0.5,
          flapDuration,
        }))
      }
    }

    if (butterflies && !IS_LOW_POWER) {
      const n = Math.round(5 * density)
      for (let i = 0; i < n; i++) {
        place('butterfly', () => ({
          size: rand(14, 24),
          color: ['#fcd34d', '#f9a8c4', '#fbcfe0', '#fde68a'][Math.floor(Math.random() * 4)],
          duration: rand(10, 18),
          delay: rand(0, 6),
          drift: rand(-50, 50),
          opacity: rand(0.45, 0.85),
        }))
      }
    }

    if (sparkles) {
      const n = IS_LOW_POWER ? Math.round(5 * density) : Math.round(18 * density)
      for (let i = 0; i < n; i++) {
        place('sparkle', () => ({
          size: rand(4, 10),
          color: ['#fff5f7', '#fde68a', '#fbcfe0'][Math.floor(Math.random() * 3)],
          duration: rand(2.4, 5.5),
          delay: rand(0, 6),
          opacity: rand(0.55, 0.9),
        }))
      }
    }

    return arr
  }, [density, corners, hearts, birds, butterflies, sparkles])

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {items.map((it) => {
        const style = {
          left: `${it.left}%`,
          top: `${it.top}%`,
          width: it.size,
          height: it.size,
        }

        if (it.type === 'heart') {
          return (
            <motion.span
              key={it.id}
              initial={{ y: 30, opacity: 0 }}
              animate={{
                y: [-20, -120],
                x: [0, it.drift, -it.drift, 0],
                opacity: [0, it.opacity, it.opacity, 0],
                rotate: [0, 10, -10, 0],
              }}
              transition={{
                duration: it.duration,
                delay: it.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute"
              style={style}
            >
              <HeartIcon
                width={it.size}
                height={it.size}
                fill={it.color}
                style={{ filter: `drop-shadow(0 0 8px ${it.color})` }}
              />
            </motion.span>
          )
        }

        if (it.type === 'bird') {
          // Off-screen → across → off-screen. The dove FLIES AWAY each
          // cycle and a new entry appears after `delay` (staggered across
          // birds so the sky always has 2–4 visible without ever feeling
          // looped).
          const STEPS = 16
          const ys = []
          const rotates = []
          for (let k = 0; k <= STEPS; k++) {
            const t = k / STEPS
            const phase = t * it.waves * Math.PI * 2
            ys.push(Math.sin(phase) * it.amplitude)
            // Bank gently with the climb/dive (±10°).
            rotates.push(Math.cos(phase) * 10 * (it.fromLeft ? 1 : -1))
          }
          const birdStyle = {
            top: `${it.band}%`,
            left: 0,
            width: it.size * 1.6,
            height: it.size,
            // Low-end devices: drop the glow filter — SVG drop-shadow is
            // shockingly expensive on a 2008-class GPU.
            willChange: 'transform',
          }
          return (
            <motion.span
              key={it.id}
              initial={{ x: it.fromLeft ? '-18vw' : '118vw', opacity: 0 }}
              animate={{
                x: it.fromLeft ? '118vw' : '-18vw',
                y: ys,
                rotate: it.fromLeft ? rotates : rotates.map((r) => -r),
                opacity: [0, it.opacity, it.opacity, 0],
              }}
              transition={{
                duration: it.duration,
                delay: it.delay,
                repeat: Infinity,
                // Staggered repeatDelay so a fresh dove enters as the
                // previous one exits — no synchronized flock effect.
                repeatDelay: rand(2, 8),
                ease: 'linear',
                opacity: { times: [0, 0.06, 0.94, 1] },
              }}
              className="absolute"
              style={birdStyle}
            >
              <BirdIcon
                width={it.size * 1.6}
                height={it.size}
                color={it.color}
                flapDuration={it.flapDuration}
                style={{
                  // Mirror horizontally when flying right→left.
                  transform: it.fromLeft ? 'none' : 'scaleX(-1)',
                }}
              />
            </motion.span>
          )
        }

        if (it.type === 'butterfly') {
          return (
            <motion.span
              key={it.id}
              initial={{ y: 0, opacity: 0 }}
              animate={{
                y: [0, -40, -80, -120, -160],
                x: [0, it.drift, -it.drift, it.drift / 2, 0],
                opacity: [0, it.opacity, it.opacity, it.opacity, 0],
                rotate: [0, 15, -15, 10, 0],
              }}
              transition={{
                duration: it.duration,
                delay: it.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute"
              style={style}
            >
              <ButterflyIcon
                width={it.size}
                height={it.size}
                fill={it.color}
                style={{ filter: `drop-shadow(0 0 6px ${it.color})` }}
              />
            </motion.span>
          )
        }

        if (it.type === 'sparkle') {
          return (
            <motion.span
              key={it.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1, 0], opacity: [0, it.opacity, 0] }}
              transition={{
                duration: it.duration,
                delay: it.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute"
              style={style}
            >
              <SparkleIcon
                width={it.size}
                height={it.size}
                fill={it.color}
                style={{ filter: `drop-shadow(0 0 4px ${it.color})` }}
              />
            </motion.span>
          )
        }
        return null
      })}
    </div>
  )
}
