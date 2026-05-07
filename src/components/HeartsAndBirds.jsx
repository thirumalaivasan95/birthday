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
      const n = Math.round(5 * density)
      for (let i = 0; i < n; i++) {
        place('bird', () => {
          const size = rand(26, 52)
          // Smaller birds flap faster, like in real life.
          const flapDuration = (size / 60) * rand(0.4, 0.7)
          return {
            size,
            color: ['rgba(255, 245, 247, 0.6)', 'rgba(255, 220, 230, 0.55)', 'rgba(212, 164, 92, 0.5)'][
              Math.floor(Math.random() * 3)
            ],
            duration: rand(20, 36),
            delay: rand(0, 14),
            opacity: rand(0.45, 0.78),
            // Random vertical band for the flight (top portion of viewport)
            band: rand(8, 65),
            // Sine-wave amplitude + period for a natural undulating glide
            amplitude: rand(20, 70),
            waves: rand(2, 4),
            fromLeft: Math.random() > 0.5,
            flapDuration,
          }
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
          // Build sine-wave keyframes so the bird undulates naturally
          // instead of just gliding in a straight line. Banking rotation
          // matches the dive/climb so it feels like a real flight path.
          const STEPS = 24
          const ys = []
          const rotates = []
          for (let k = 0; k <= STEPS; k++) {
            const t = k / STEPS
            const phase = t * it.waves * Math.PI * 2
            ys.push(Math.sin(phase) * it.amplitude)
            // Bank with the direction of travel: derivative of sin = cos
            rotates.push(Math.cos(phase) * 12 * (it.fromLeft ? 1 : -1))
          }
          // Override the per-item top with the bird's flight band so birds
          // spread across the upper sky.
          const birdStyle = {
            top: `${it.band}%`,
            left: 0,
            width: it.size * 1.6,
            height: it.size,
          }
          return (
            <motion.span
              key={it.id}
              initial={{
                x: it.fromLeft ? '-15vw' : '115vw',
                opacity: 0,
              }}
              animate={{
                x: it.fromLeft ? '115vw' : '-15vw',
                y: ys,
                rotate: it.fromLeft ? rotates : rotates.map((r) => -r),
                opacity: [0, it.opacity, it.opacity, 0],
              }}
              transition={{
                duration: it.duration,
                delay: it.delay,
                repeat: Infinity,
                ease: 'linear',
                opacity: { times: [0, 0.08, 0.92, 1] },
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
                  // Mirror horizontally when flying right→left
                  transform: it.fromLeft ? 'none' : 'scaleX(-1)',
                  filter: `drop-shadow(0 0 6px ${it.color})`,
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
