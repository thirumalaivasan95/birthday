import { useMemo } from 'react'
import { motion } from 'framer-motion'

function rand(min, max) {
  return Math.random() * (max - min) + min
}

const HeartIcon = (props) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path d="M12 21s-7.5-4.7-9.7-9.3C.6 7.6 3.1 4 6.6 4c2 0 3.5 1.1 4.4 2.6h2c.9-1.5 2.4-2.6 4.4-2.6 3.5 0 6 3.6 4.3 7.7C19.5 16.3 12 21 12 21z" />
  </svg>
)

// A proper love-bird with body, head, beak, eye, tail, and two wings that
// flap independently (upstroke + downstroke). Pure SVG — no images, no CSS
// classes — so it works inline anywhere with zero network cost (GPRS-safe).
//
// `flapDuration` (seconds) sets the wing-beat rate. Smaller birds in real
// life flap faster, so callers can pass a faster rate for tiny birds.
const BirdIcon = ({ color = 'currentColor', flapDuration = 0.55, ...props }) => (
  <svg viewBox="0 0 60 36" {...props}>
    {/* Tail */}
    <polygon points="22,18 16,15 16,22" fill={color} />
    {/* Body */}
    <ellipse cx="30" cy="18" rx="6.5" ry="3.2" fill={color} />
    {/* Head */}
    <circle cx="36.2" cy="16" r="2.6" fill={color} />
    {/* Beak */}
    <polygon points="38.8,15.4 42.5,16.5 38.8,17.6" fill="#d4a45c" />
    {/* Eye */}
    <circle cx="36.6" cy="15.4" r="0.45" fill="#1a0b14" />

    {/* Upper wing — rotates up then back down for the flap.
        transform-origin is the bird's shoulder. */}
    <path
      d="M30 17 Q 22 6 8 11 Q 22 14 30 17 Z"
      fill={color}
      opacity="0.9"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 30 17; -28 30 17; 0 30 17"
        keyTimes="0;0.5;1"
        dur={`${flapDuration}s`}
        repeatCount="indefinite"
      />
    </path>

    {/* Lower wing — opposite phase, slightly more transparent for depth. */}
    <path
      d="M30 19 Q 22 30 8 25 Q 22 22 30 19 Z"
      fill={color}
      opacity="0.6"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        values="0 30 19; 22 30 19; 0 30 19"
        keyTimes="0;0.5;1"
        dur={`${flapDuration}s`}
        repeatCount="indefinite"
      />
    </path>

    {/* A tiny floating heart trailing behind, because love-birds. */}
    <path
      d="M16 8 c-0.5,-0.7 -1.6,-0.7 -2.1,0 c-0.5,-0.7 -1.6,-0.7 -2.1,0 c-0.7,0.9 0.4,2.1 2.1,3.1 c1.7,-1 2.8,-2.2 2.1,-3.1 z"
      fill="#e6336b"
      opacity="0.85"
    >
      <animate
        attributeName="opacity"
        values="0;0.85;0"
        dur="2.4s"
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
      const n = Math.round(14 * density)
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

    if (birds) {
      // Aim for 2–4 visible birds at any moment. They wander between
      // random waypoints rather than gliding straight across.
      const n = Math.max(2, Math.round(4 * density))
      for (let i = 0; i < n; i++) {
        const size = rand(28, 46)
        const flapDuration = (size / 60) * rand(0.42, 0.62)
        // 7 waypoints across the whole section, looped so it repeats
        // seamlessly. Heading + horizontal flip computed per segment
        // so the bird always faces where it's flying.
        const wpCount = 7
        const xs = []
        const ys = []
        for (let k = 0; k < wpCount; k++) {
          xs.push(rand(4, 96))
          ys.push(rand(8, 88))
        }
        xs.push(xs[0]); ys.push(ys[0])
        const rotates = []
        const flips = []
        for (let k = 0; k < xs.length - 1; k++) {
          const dx = xs[k + 1] - xs[k]
          const dy = ys[k + 1] - ys[k]
          const angle = Math.atan2(dy, dx) * (180 / Math.PI)
          const flip = Math.abs(angle) > 90
          let r = flip ? 180 - angle : angle
          if (r > 35) r = 35
          if (r < -35) r = -35
          rotates.push(r)
          flips.push(flip)
        }
        rotates.push(rotates[0]); flips.push(flips[0])

        arr.push({
          id: id++,
          type: 'bird',
          // left/top unused for birds (we drive them via xs/ys), but the
          // shared placement contract expects them.
          left: xs[0],
          top: ys[0],
          size,
          color: ['rgba(255,245,247,0.85)', 'rgba(255,220,230,0.8)', 'rgba(212,164,92,0.75)'][i % 3],
          duration: rand(26, 42),
          delay: rand(0, 8),
          opacity: rand(0.7, 0.95),
          flapDuration,
          xs, ys, rotates, flips,
        })
      }
    }

    if (butterflies) {
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
      const n = Math.round(18 * density)
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
          // Wander between random waypoints — NOT a straight glide.
          // Outer motion drives left/top across the section in % units;
          // inner motion handles per-segment heading + horizontal flip
          // so the bird visually faces where it's flying. Both share
          // the same `times` array so headings stay in sync with motion.
          const times = it.xs.map((_, k) => k / (it.xs.length - 1))
          // Hold full opacity across the whole loop (the seamless waypoint
          // closure means the bird never needs to disappear). The `initial`
          // opacity 0 still fades it in gracefully on first cycle.
          const opacityFrames = it.xs.map(() => it.opacity)
          return (
            <motion.div
              key={it.id}
              className="absolute"
              style={{ top: 0, left: 0, width: it.size * 1.6, height: it.size }}
              initial={{ left: `${it.xs[0]}%`, top: `${it.ys[0]}%`, opacity: 0 }}
              animate={{
                left: it.xs.map((x) => `${x}%`),
                top:  it.ys.map((y) => `${y}%`),
                opacity: opacityFrames,
              }}
              transition={{
                duration: it.duration,
                delay: it.delay,
                repeat: Infinity,
                ease: 'easeInOut',
                times,
              }}
            >
              <motion.div
                style={{ width: '100%', height: '100%' }}
                animate={{
                  rotate: it.rotates,
                  scaleX: it.flips.map((f) => (f ? -1 : 1)),
                }}
                transition={{
                  duration: it.duration,
                  delay: it.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  times,
                }}
              >
                <BirdIcon
                  width={it.size * 1.6}
                  height={it.size}
                  color={it.color}
                  flapDuration={it.flapDuration}
                  style={{ filter: `drop-shadow(0 0 8px ${it.color})` }}
                />
              </motion.div>
            </motion.div>
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
