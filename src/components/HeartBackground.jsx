import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { isMobile as IS_MOBILE, isLowPower as IS_LOW_POWER } from '../utils/device.js'

// Counts halved on mobile, halved again on old iOS Safari. Each motion
// element costs a subscription + transform-update per frame; on the SE
// the difference between 18 hearts and 6 hearts is ~30% of the budget.
const HEARTS      = IS_LOW_POWER ? 8  : IS_MOBILE ? 18 : 18
const PARTICLES   = IS_LOW_POWER ? 16 : IS_MOBILE ? 36 : 36
const BUTTERFLIES = IS_LOW_POWER ? 4  : IS_MOBILE ? 15 : 15

function rand(min, max) {
  return Math.random() * (max - min) + min
}

// Highly polished, natural Butterfly SVG with clear antennae and organic wings
function ButterflySVG({ color = '#f9a8c4', ...props }) {
  return (
    <svg viewBox="0 0 100 100" {...props}>
      {/* Distinct Antennae */}
      <path d="M48,30 C45,15 30,15 25,20" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <path d="M52,30 C55,15 70,15 75,20" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      
      {/* Left Wings */}
      <path d="M47,40 C15,5 0,40 20,65 C25,72 47,60 47,60 Z" fill={color} opacity="0.9" />
      <path d="M47,60 C20,70 15,95 35,95 C45,95 47,75 47,75 Z" fill={color} opacity="0.75" />

      {/* Right Wings */}
      <path d="M53,40 C85,5 100,40 80,65 C75,72 53,60 53,60 Z" fill={color} opacity="0.9" />
      <path d="M53,60 C80,70 85,95 65,95 C55,95 53,75 53,75 Z" fill={color} opacity="0.75" />
      
      {/* Tapered Body */}
      <rect x="47" y="30" width="6" height="35" rx="3" fill={color} opacity="1" />
    </svg>
  )
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

  const butterflies = useMemo(
    () =>
      Array.from({ length: BUTTERFLIES }, (_, i) => ({
        id: i,
        left: rand(0, 100),
        size: rand(12, 28),
        delay: rand(0, 12),
        duration: rand(14, 30),
        opacity: rand(0.3, 0.7), // Higher opacity for a vibrant glow
        drift1: rand(-30, 30),
        drift2: rand(-60, 60),
        drift3: rand(-30, 30),
        color: ['#fb7185', '#fbcfe0', '#fde68a', '#e6336b', '#fda4af'][Math.floor(Math.random() * 5)],
        flapSpeed: rand(0.4, 0.9), // Faster flutter
      })),
    [],
  )

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {IS_LOW_POWER ? (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 25% 0%, rgba(230,51,107,0.18) 0%, transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(212,164,92,0.12) 0%, transparent 55%)',
          }}
        />
      ) : (
        <>
          <div className="absolute -top-40 left-1/4 h-[40rem] w-[40rem] rounded-full bg-rose-500/20 blur-[120px]" />
          <div className="absolute -bottom-40 right-1/4 h-[40rem] w-[40rem] rounded-full bg-gold-500/15 blur-[120px]" />
          {!IS_MOBILE && (
            <div className="absolute top-1/3 right-1/3 h-[30rem] w-[30rem] rounded-full bg-rose-700/20 blur-[110px]" />
          )}
        </>
      )}

      {!IS_LOW_POWER && particles.map((p) => (
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

      {!IS_LOW_POWER && hearts.map((h) => (
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

      {/* Butterflies — fluttery, glowing, upward-drifting like hearts but with unique character */}
      {!IS_LOW_POWER && butterflies.map((b) => (
        <motion.div
          key={`bf-${b.id}`}
          initial={{ y: '110vh', x: 0, opacity: 0, rotate: 0 }}
          animate={{
            y: ['110vh', '70vh', '40vh', '10vh', '-15vh'],
            x: [0, b.drift1, b.drift2, b.drift3, 0],
            opacity: [0, b.opacity, b.opacity * 0.6, b.opacity, 0],
            rotate: [0, b.drift1 > 0 ? 15 : -15, b.drift2 > b.drift1 ? 25 : -25, b.drift3 > b.drift2 ? 15 : -15, 0],
          }}
          transition={{
            y: { duration: b.duration, delay: b.delay, repeat: Infinity, ease: ['easeIn', 'easeOut', 'easeIn', 'easeOut'] },
            x: { duration: b.duration, delay: b.delay, repeat: Infinity, ease: 'easeInOut' },
            opacity: { duration: b.duration, delay: b.delay, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: b.duration, delay: b.delay, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="absolute origin-center"
          style={{
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            filter: `drop-shadow(0 0 6px rgba(255,255,255,0.4)) drop-shadow(0 0 12px ${b.color})`,
          }}
        >
          {/* Inner div handles the elegant flapping using scaleX */}
          <motion.div
            animate={{ scaleX: [1, 0.15, 1] }}
            transition={{
              duration: b.flapSpeed,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            style={{ width: '100%', height: '100%', transformOrigin: 'center' }}
          >
            <ButterflySVG
              width={b.size}
              height={b.size}
              color={b.color}
            />
          </motion.div>
        </motion.div>
      ))}

      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55)_100%)]" />
    </div>
  )
}
