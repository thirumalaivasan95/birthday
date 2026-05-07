import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

/**
 * iPhone-3D-Touch / Apple TV poster style tilt.
 * Children get a 3D parallax tilt that follows the cursor.
 *
 * Place layered children inside <TiltCard> and pass `depth` (0–60)
 * as a prop on the inner element via style={{ transform: `translateZ(...)` }}
 * — TiltCard sets perspective so child translateZ() reads correctly.
 */
export default function TiltCard({
  children,
  intensity = 14,
  glare = true,
  className = '',
  rounded = 'rounded-3xl',
}) {
  const ref = useRef(null)
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)

  const spring = { stiffness: 180, damping: 18, mass: 0.4 }
  const sx = useSpring(mx, spring)
  const sy = useSpring(my, spring)

  const rotateY = useTransform(sx, [0, 1], [intensity, -intensity])
  const rotateX = useTransform(sy, [0, 1], [-intensity, intensity])
  const glareX = useTransform(sx, [0, 1], ['0%', '100%'])
  const glareY = useTransform(sy, [0, 1], ['0%', '100%'])

  function handleMove(e) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    mx.set(Math.min(Math.max(x, 0), 1))
    my.set(Math.min(Math.max(y, 0), 1))
  }

  function handleLeave() {
    mx.set(0.5)
    my.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
      className={`relative ${className}`}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
        }}
        className={`relative h-full w-full ${rounded} overflow-hidden`}
      >
        {children}

        {glare && (
          <motion.div
            aria-hidden
            style={{
              background: useTransform(
                [glareX, glareY],
                ([x, y]) =>
                  `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.35), rgba(255,255,255,0) 55%)`,
              ),
            }}
            className="pointer-events-none absolute inset-0 mix-blend-overlay"
          />
        )}
      </motion.div>
    </motion.div>
  )
}
