import { useMemo, useRef } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useScroll,
} from 'framer-motion'
import LiquidBlob from '../components/LiquidBlob.jsx'
import { nonScanPhotos, objectPosition } from '../data/photos.js'
import { pickRandom } from '../utils/shuffle.js'

const layout = [
  { x: -32, y: -22, depth: 1.2, size: 18, rotate: -6 },
  { x:  30, y: -28, depth: 0.7, size: 15, rotate: 5 },
  { x: -36, y:  18, depth: 0.9, size: 17, rotate: 4 },
  { x:  34, y:  20, depth: 1.1, size: 19, rotate: -7 },
  { x:   0, y: -34, depth: 0.5, size: 13, rotate: 0 },
  { x:   0, y:  34, depth: 0.5, size: 14, rotate: 0 },
  { x:   0, y:   0, depth: 1.6, size: 28, rotate: 0 },
]

export default function PhotoCloud3D() {
  // Random selection on every page load — no two visits are the same.
  const cards = useMemo(() => pickRandom(nonScanPhotos, layout.length), [])

  const ref = useRef(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 70, damping: 18, mass: 0.5 })
  const sy = useSpring(my, { stiffness: 70, damping: 18, mass: 0.5 })

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const scrollY = useTransform(scrollYProgress, [0, 1], [80, -80])
  const heading = useTransform(scrollYProgress, [0, 0.4, 1], [40, 0, -30])

  function handleMove(e) {
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    mx.set((e.clientX - cx) / rect.width)
    my.set((e.clientY - cy) / rect.height)
  }
  function handleLeave() {
    mx.set(0)
    my.set(0)
  }

  return (
    <section
      id="cloud"
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative flex min-h-[100vh] items-center overflow-hidden py-32"
      style={{ perspective: 1400 }}
    >
      <LiquidBlob className="absolute -left-40 top-10" size={680} from="#7d1638" to="#e6336b" opacity={0.4} />
      <LiquidBlob className="absolute -right-40 bottom-0" size={620} from="#d4a45c" to="#a21946" opacity={0.35} delay={3} />

      <motion.div
        style={{ y: heading }}
        className="container-romance pointer-events-none absolute inset-x-0 top-20 z-30 mx-auto text-center"
      >
        <span className="text-[11px] uppercase tracking-[0.5em] text-rose-300">
          A Cloud of Us
        </span>
        <h2 className="heading-serif mt-3 text-4xl sm:text-5xl md:text-6xl">
          <span className="text-gradient-rose">Move your cursor —</span>
          <span className="block font-script text-3xl text-rose-200 sm:text-4xl">
            and we move with you.
          </span>
        </h2>
      </motion.div>

      <motion.div
        style={{ y: scrollY, transformStyle: 'preserve-3d' }}
        className="relative mx-auto h-[80vh] w-full max-w-7xl"
      >
        {cards.map((c, i) => (
          <CloudCard key={c.src} card={c} cfg={layout[i]} index={i} sx={sx} sy={sy} />
        ))}
      </motion.div>
    </section>
  )
}

function CloudCard({ card, cfg, index, sx, sy }) {
  const tx = useTransform(sx, (v) => v * -60 * cfg.depth)
  const ty = useTransform(sy, (v) => v * -60 * cfg.depth)
  const rotY = useTransform(sx, (v) => v * 18 * cfg.depth + cfg.rotate)
  const rotX = useTransform(sy, (v) => v * -14 * cfg.depth)
  const z = (cfg.depth - 0.5) * 120

  return (
    <motion.figure
      initial={{ opacity: 0, scale: 0.6, rotate: cfg.rotate * 2 }}
      whileInView={{ opacity: 1, scale: 1, rotate: cfg.rotate }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 1, delay: 0.1 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      style={{
        left: `calc(50% + ${cfg.x}%)`,
        top: `calc(50% + ${cfg.y}%)`,
        width: `${cfg.size}vw`,
        minWidth: 140,
        maxWidth: 360,
        x: tx,
        y: ty,
        rotateY: rotY,
        rotateX: rotX,
        translateZ: z,
        transformStyle: 'preserve-3d',
      }}
      className="absolute -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[1.5rem] border border-white/10 shadow-[0_40px_120px_-30px_rgba(230,51,107,0.55)]"
    >
      <img
        src={card.src}
        alt=""
        loading="lazy"
        className="h-full w-full object-cover"
        style={{ aspectRatio: '3 / 4', objectPosition: objectPosition(card) }}
      />
      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900/90 to-transparent p-4 font-script text-base text-rose-100 sm:text-lg">
        {card.caption}
      </figcaption>
    </motion.figure>
  )
}
