import { useMemo, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion'
import LiquidBlob from '../components/LiquidBlob.jsx'
import SmartPhoto from '../components/SmartPhoto.jsx'
import { nonScanPhotos } from '../data/photos.js'
import { pickRandom } from '../utils/shuffle.js'

const heroWords = ['Forever', 'You', '&', 'Me']

export default function Hero() {
  // A random hero photo every page load.
  const heroPhoto = useMemo(() => pickRandom(nonScanPhotos, 1)[0], [])

  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '20%'])
  const scaleBg = useTransform(scrollYProgress, [0, 1], [1.05, 1.25])
  const opacityBg = useTransform(scrollYProgress, [0, 0.9], [1, 0])

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 60, damping: 16 })
  const sy = useSpring(my, { stiffness: 60, damping: 16 })

  function handleMove(e) {
    const w = window.innerWidth
    const h = window.innerHeight
    mx.set(((e.clientX - w / 2) / w) * 18)
    my.set(((e.clientY - h / 2) / h) * 12)
  }

  return (
    <section
      id="hero"
      ref={ref}
      onMouseMove={handleMove}
      className="relative h-[110vh] w-full overflow-hidden"
    >
      <motion.div style={{ y: yBg, scale: scaleBg, opacity: opacityBg }} className="absolute inset-0">
        <SmartPhoto
          src={heroPhoto.src}
          srcSet={heroPhoto.srcSet}
          sizes="100vw"
          alt=""
          fit="cover"
          focusY={heroPhoto.focusY}
          eager
          className="h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/30 via-ink-900/55 to-ink-900" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_25%,rgba(0,0,0,0.65)_85%)]" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/%3E%3C/svg%3E\")",
          }}
        />
      </motion.div>

      <LiquidBlob className="absolute -left-40 -top-40" size={620} from="#e6336b" to="#7d1638" opacity={0.45} duration={16} />
      <LiquidBlob className="absolute -right-40 bottom-10" size={560} from="#d4a45c" to="#e6336b" opacity={0.4} duration={20} delay={2} />

      <motion.div style={{ x: sx, y: sy }} className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mb-8 inline-flex items-center gap-3 rounded-full border border-rose-400/30 bg-ink-900/40 px-5 py-2 text-[10px] uppercase tracking-[0.5em] text-rose-200 backdrop-blur"
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
          A love letter, in motion
        </motion.span>

        <h1 className="heading-serif text-7xl leading-[0.95] sm:text-9xl md:text-[10rem]">
          {heroWords.map((w, i) => (
            <motion.span
              key={w + i}
              initial={{ y: '110%', opacity: 0, filter: 'blur(12px)' }}
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.2, delay: 0.6 + i * 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="mr-4 inline-block text-gradient-rose"
            >
              {w}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mt-8 max-w-xl font-script text-3xl text-rose-200 sm:text-5xl"
        >
          and the little heart we made together.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.8 }}
          className="mt-6 max-w-lg text-sm leading-relaxed text-cream-100/75 sm:text-base"
        >
          A film made of moments — every laugh, every glance, every quiet
          Sunday — strung together for the woman who is everything.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 1 }}
        className="absolute bottom-10 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-cream-100/60"
      >
        <span className="text-[10px] uppercase tracking-[0.6em]">Scroll</span>
        <motion.span
          animate={{ y: [0, 12, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="block h-12 w-px bg-gradient-to-b from-rose-300 to-transparent"
        />
      </motion.div>
    </section>
  )
}
