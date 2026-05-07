import { useEffect, useId, useRef } from 'react'
import { motion } from 'framer-motion'
import { isMobile as IS_MOBILE, isLowPower as IS_LOW_POWER, prefersReducedMotion as RM } from '../utils/device.js'

// Two blob path "frames" we morph between.
const FRAMES = [
  'M44.4,-58.7C56.6,-49.9,64.1,-34.6,67.5,-18.6C70.9,-2.6,70.3,14.1,62.6,27.6C54.9,41.1,40.1,51.4,24.4,58.6C8.7,65.7,-7.9,69.8,-22.5,65.5C-37.2,61.2,-49.9,48.6,-58.5,33.7C-67.1,18.8,-71.6,1.7,-69.4,-14.6C-67.1,-30.9,-58.1,-46.5,-44.7,-55.4C-31.3,-64.3,-13.5,-66.6,2.5,-69.6C18.5,-72.6,32.2,-67.4,44.4,-58.7Z',
  'M50.7,-66.5C63.6,-55.7,70.1,-37.7,71.7,-20.4C73.3,-3.1,69.9,13.5,62.4,28.7C54.9,43.9,43.3,57.7,28.4,64.6C13.5,71.6,-4.7,71.7,-20.7,65.4C-36.7,59.1,-50.4,46.4,-58.6,31.3C-66.8,16.3,-69.4,-1.1,-65.7,-17.6C-62.1,-34,-52.3,-49.4,-39.1,-60.1C-25.9,-70.7,-9.4,-76.6,4.6,-77.7C18.6,-78.7,37.8,-77.4,50.7,-66.5Z',
  'M40.8,-55.6C52.2,-46.5,59.6,-32.4,64.6,-17C69.6,-1.7,72.2,15,66.6,27.7C61,40.5,47.1,49.3,32.6,57.4C18.1,65.5,3,72.9,-13.4,72.6C-29.8,72.4,-47.6,64.7,-58.7,51.4C-69.7,38.1,-74,19.1,-72.6,1C-71.2,-17,-64.1,-34.1,-52.4,-44.5C-40.7,-54.9,-24.4,-58.6,-8.4,-60.7C7.6,-62.7,15.3,-63.2,40.8,-55.6Z',
  'M47.7,-61.5C61.7,-51.5,72.6,-36,76.7,-19C80.7,-2,77.9,16.4,69.4,30.6C60.9,44.7,46.7,54.7,31.5,61.6C16.3,68.5,0.1,72.4,-15.6,69.4C-31.3,66.4,-46.6,56.7,-57.4,43.4C-68.2,30.1,-74.5,13.3,-73.5,-3.1C-72.5,-19.6,-64.1,-35.6,-51.7,-46.4C-39.4,-57.2,-23,-62.7,-5.3,-66C12.3,-69.3,33.7,-71.4,47.7,-61.5Z',
]

/**
 * Liquid morphing SVG blob — drifts between path frames forever.
 * Use for organic, romantic background shapes.
 */
export default function LiquidBlob({
  className = '',
  size = 600,
  from = '#e6336b',
  to = '#d4a45c',
  duration = 14,
  opacity = 0.55,
  blur = 50,
  delay = 0,
}) {
  const id = useId()
  const pathRef = useRef(null)
  const raf = useRef(null)

  // On low-power devices we skip the blob entirely. A 50px CSS blur on a
  // 600px element + per-frame path morph is the single most expensive
  // thing the page does — a 2008-class GPU literally cannot keep up.
  // The gradients on the section do most of the visual work anyway.
  // When the user prefers reduced motion we still RENDER the blob, but
  // statically, so the gradient warmth remains.
  const skip = IS_LOW_POWER
  const animate = !RM && !skip

  // Halve the canvas + blur on phones: a 50px blur on a 600px element is
  // arguably the single most expensive thing GPU-accelerated WebKit does.
  const renderSize = IS_MOBILE ? Math.round(size * 0.6) : size
  const renderBlur = IS_MOBILE ? Math.round(blur * 0.55) : blur

  useEffect(() => {
    if (!animate) return
    let active = true
    let t = delay * -1000

    function tick(now) {
      if (!active) return
      const period = duration * 1000
      const elapsed = ((now - t) % period) / period
      const i = Math.floor(elapsed * FRAMES.length)
      const next = (i + 1) % FRAMES.length
      const segment = elapsed * FRAMES.length - i

      const a = FRAMES[i]
      const b = FRAMES[next]
      const merged = lerpPath(a, b, ease(segment))
      if (pathRef.current) pathRef.current.setAttribute('d', merged)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      active = false
      cancelAnimationFrame(raf.current)
    }
  }, [duration, delay, animate])

  if (skip) return null

  return (
    <motion.svg
      viewBox="-100 -100 200 200"
      width={renderSize}
      height={renderSize}
      className={`pointer-events-none select-none ${className}`}
      style={{ filter: `blur(${renderBlur}px)`, opacity }}
      aria-hidden
    >
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      <path
        ref={pathRef}
        d={FRAMES[0]}
        fill={`url(#grad-${id})`}
      />
    </motion.svg>
  )
}

// ---- helpers ----------------------------------------------------------------

function ease(t) {
  // smoothstep
  return t * t * (3 - 2 * t)
}

// Numerically interpolate two SVG paths that share the same command sequence.
function lerpPath(a, b, t) {
  const numsA = a.match(/-?\d+\.?\d*/g).map(Number)
  const numsB = b.match(/-?\d+\.?\d*/g).map(Number)
  let i = 0
  return a.replace(/-?\d+\.?\d*/g, () => {
    const v = numsA[i] + (numsB[i] - numsA[i]) * t
    i++
    return v.toFixed(2)
  })
}
