import { useMemo } from 'react'
import { motion } from 'framer-motion'

const HEARTS = 18
const PARTICLES = 36

function rand(min, max) {
  return Math.random() * (max - min) + min
}

export default function HeartBackground() {
  const hearts = useMemo(
    () =>
      Array.from({ length: HEARTS }, (_, i) => ({
        id: i,
        left: rand(0, 100),
        size: rand(10, 26),
        delay: rand(0, 12),
        duration: rand(14, 28),
        opacity: rand(0.08, 0.22),
        drift: rand(-40, 40),
      })),
    [],
  )

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLES }, (_, i) => ({
        id: i,
        left: rand(0, 100),
        top: rand(0, 100),
        size: rand(1, 3),
        delay: rand(0, 6),
        duration: rand(3, 7),
      })),
    [],
  )

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Soft glows */}
      <div className="absolute -top-40 left-1/4 h-[40rem] w-[40rem] rounded-full bg-rose-500/20 blur-[120px]" />
      <div className="absolute -bottom-40 right-1/4 h-[40rem] w-[40rem] rounded-full bg-gold-500/15 blur-[120px]" />
      <div className="absolute top-1/3 right-1/3 h-[30rem] w-[30rem] rounded-full bg-rose-700/20 blur-[110px]" />

      {/* Tiny twinkling particles */}
      {particles.map((p) => (
        <motion.span
          key={`p-${p.id}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.9, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute rounded-full bg-cream-50"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            filter: 'blur(0.5px)',
          }}
        />
      ))}

      {/* Floating hearts */}
      {hearts.map((h) => (
        <motion.svg
          key={`h-${h.id}`}
          viewBox="0 0 24 24"
          initial={{ y: '110vh', x: 0, opacity: 0 }}
          animate={{
            y: '-15vh',
            x: [0, h.drift, -h.drift, 0],
            opacity: [0, h.opacity, h.opacity, 0],
          }}
          transition={{
            duration: h.duration,
            delay: h.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute fill-rose-400"
          style={{
            left: `${h.left}%`,
            width: h.size,
            height: h.size,
            filter: 'drop-shadow(0 0 6px rgba(230,51,107,0.5))',
          }}
        >
          <path d="M12 21s-7.5-4.7-9.7-9.3C.6 7.6 3.1 4 6.6 4c2 0 3.5 1.1 4.4 2.6h2c.9-1.5 2.4-2.6 4.4-2.6 3.5 0 6 3.6 4.3 7.7C19.5 16.3 12 21 12 21z" />
        </motion.svg>
      ))}

      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55)_100%)]" />
    </div>
  )
}
