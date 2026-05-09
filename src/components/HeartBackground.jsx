import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { isMobile as IS_MOBILE, isLowPower as IS_LOW_POWER } from '../utils/device.js'

// Counts halved on mobile, halved again on old iOS Safari. Each motion
// element costs a subscription + transform-update per frame; on the SE
// the difference between 18 hearts and 6 hearts is ~30% of the budget.
const HEARTS      = IS_LOW_POWER ? 6  : IS_MOBILE ? 10 : 18
const PARTICLES   = IS_LOW_POWER ? 12 : IS_MOBILE ? 20 : 36
const BUTTERFLIES = IS_LOW_POWER ? 0  : IS_MOBILE ? 8  : 15

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

  // Realistic Butterfly Behavioral Model:
  // - Calculates trajectory angle so it always faces forward (no flying backwards).
  // - "Fly and Rest" pattern: Flies to a waypoint, sits/rests, then flies again.
  const butterflies = useMemo(
    () =>
      Array.from({ length: BUTTERFLIES }, (_, i) => {
        const left = rand(10, 90)
        const top = rand(10, 90)
        
        // Generate 3 waypoints for the "Fly -> Sit -> Fly -> Sit -> Fly" behavior
        const wp1x = rand(-20, 20); const wp1y = rand(-20, 20);
        let ang1 = (Math.atan2(wp1y, wp1x) * 180) / Math.PI + 90;
        
        const wp2x = wp1x + rand(-20, 20); const wp2y = wp1y + rand(-20, 20);
        let ang2 = (Math.atan2(wp2y - wp1y, wp2x - wp1x) * 180) / Math.PI + 90;
        
        const wp3x = wp2x + rand(-20, 20); const wp3y = wp2y + rand(-20, 20);
        let ang3 = (Math.atan2(wp3y - wp2y, wp3x - wp2x) * 180) / Math.PI + 90;

        // Ensure smooth rotation (no snapping 360 degrees backwards)
        if (ang2 - ang1 > 180) ang2 -= 360;
        if (ang2 - ang1 < -180) ang2 += 360;
        if (ang3 - ang2 > 180) ang3 -= 360;
        if (ang3 - ang2 < -180) ang3 += 360;

        // Keyframes: 
        // 0: Spawn
        // 1: Arrive at WP1 (Fly)
        // 2: Sitting at WP1, turning to face WP2
        // 3: Arrive at WP2 (Fly)
        // 4: Sitting at WP2, turning to face WP3
        // 5: Arrive at WP3 and despawn (Fly)
        const xOffsets = [0, wp1x, wp1x, wp2x, wp2x, wp3x].map(v => `${v}vw`);
        const yOffsets = [0, wp1y, wp1y, wp2y, wp2y, wp3y].map(v => `${v}vh`);
        const rotations = [ang1, ang1, ang2, ang2, ang3, ang3];
        const opacities = [0, rand(0.25, 0.45), rand(0.25, 0.45), rand(0.25, 0.45), rand(0.25, 0.45), 0];

        return {
          id: i,
          left,
          top,
          xOffsets,
          yOffsets,
          rotations,
          opacities,
          size: rand(10, 20),
          color: ['#fb7185', '#fbcfe0', '#fde68a', '#e6336b', '#fda4af'][Math.floor(Math.random() * 5)],
          flapSpeed: rand(1.0, 1.8), // Very slow, lazy natural flapping
          duration: rand(25, 40), // Long life cycle to allow for sitting pauses
          delay: rand(0, 15),
        }
      }),
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

      {/* Butterflies — pure SVG, organic multi-waypoint flight path */}
      {!IS_LOW_POWER && butterflies.map((b) => (
        <motion.div
          key={`bf-${b.id}`}
          initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
          animate={{
            x: b.xOffsets,
            y: b.yOffsets,
            rotate: b.rotations,
            opacity: b.opacities,
          }}
          transition={{
            duration: b.duration,
            delay: b.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute origin-center"
          style={{
            left: `${b.left}%`,
            top: `${b.top}%`,
            width: b.size,
            height: b.size,
            filter: `drop-shadow(0 0 5px ${b.color})`,
          }}
        >
          {/* Inner div handles the elegant flapping using scaleX */}
          <motion.div
            animate={{ scaleX: [1, 0.4, 1] }}
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
