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

const BirdIcon = (props) => (
  // simple "M-shaped" silhouette — a flying bird at distance
  <svg viewBox="0 0 64 24" {...props}>
    <path
      d="M2 16 C 10 4, 18 4, 24 14 C 30 24, 34 24, 40 14 C 46 4, 54 4, 62 16"
      fill="none"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
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
      const n = Math.round(4 * density)
      for (let i = 0; i < n; i++) {
        place('bird', () => ({
          size: rand(28, 48),
          color: 'rgba(255, 245, 247, 0.55)',
          duration: rand(18, 30),
          delay: rand(0, 10),
          opacity: rand(0.4, 0.7),
          fromLeft: Math.random() > 0.5,
        }))
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
          // Birds glide across the screen
          return (
            <motion.span
              key={it.id}
              initial={{
                x: it.fromLeft ? '-30vw' : '30vw',
                y: 0,
                opacity: 0,
              }}
              animate={{
                x: it.fromLeft ? '110vw' : '-110vw',
                y: [0, -20, 10, -10, 0],
                opacity: [0, it.opacity, it.opacity, 0],
              }}
              transition={{
                duration: it.duration,
                delay: it.delay,
                repeat: Infinity,
                ease: 'linear',
                times: [0, 0.1, 0.9, 1],
              }}
              className="absolute"
              style={{ ...style, width: it.size * 2 }}
            >
              <BirdIcon
                width={it.size * 2}
                height={it.size * 0.75}
                stroke={it.color}
                fill="transparent"
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
