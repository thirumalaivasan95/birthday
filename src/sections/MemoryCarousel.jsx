import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LiquidBlob from '../components/LiquidBlob.jsx'
import { nonScanPhotos, objectPosition } from '../data/photos.js'
import { pickRandom } from '../utils/shuffle.js'

const SLIDE_COUNT = 15
const AUTOPLAY_MS = 5000

export default function MemoryCarousel() {
  const slides = useMemo(() => pickRandom(nonScanPhotos, SLIDE_COUNT), [])

  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    if (paused) return
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), AUTOPLAY_MS)
    return () => clearInterval(t)
  }, [paused, slides.length])

  function next() { setIndex((i) => (i + 1) % slides.length) }
  function prev() { setIndex((i) => (i - 1 + slides.length) % slides.length) }

  const current = slides[index]

  return (
    <section
      id="carousel"
      className="relative overflow-hidden py-32"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <LiquidBlob className="absolute -left-32 top-1/3" size={520} from="#e6336b" to="#5c1029" opacity={0.45} />
      <LiquidBlob className="absolute -right-32 bottom-10" size={480} from="#d4a45c" to="#7d1638" opacity={0.35} delay={4} />

      <div className="container-romance text-center">
        <span className="text-[11px] uppercase tracking-[0.5em] text-rose-300">In motion</span>
        <h2 className="heading-serif mt-3 text-4xl sm:text-5xl md:text-6xl">
          <span className="text-gradient-rose">A film of us</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-cream-100/75">
          Press play on our memories. Each frame, a heartbeat.
        </p>
      </div>

      <div ref={containerRef} className="container-romance relative mt-14" style={{ perspective: 1400 }}>
        <div className="relative mx-auto aspect-[4/5] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_60px_160px_-40px_rgba(230,51,107,0.55)] sm:aspect-[16/10]">
          <AnimatePresence mode="popLayout">
            <motion.img
              key={current.src}
              src={current.src}
              alt=""
              initial={{ opacity: 0, scale: 1.15, filter: 'blur(20px)' }}
              animate={{ opacity: 1, scale: 1.05, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 1.0, filter: 'blur(8px)' }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: objectPosition(current) }}
            />
          </AnimatePresence>

          <motion.div
            key={`zoom-${index}`}
            initial={{ scale: 1 }}
            animate={{ scale: 1.08 }}
            transition={{ duration: AUTOPLAY_MS / 1000, ease: 'linear' }}
            className="pointer-events-none absolute inset-0"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/40 to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55)_100%)]" />

          <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-5 sm:gap-6 sm:p-10">
            <div className="max-w-[70%]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={`cap-${index}`}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="font-script text-2xl text-cream-50 sm:text-5xl"
                >
                  {current.caption}
                </motion.p>
              </AnimatePresence>
              <div className="mt-2 text-[10px] uppercase tracking-[0.45em] text-rose-200">
                Frame {String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <CarouselButton onClick={prev} dir="prev" />
              <CarouselButton onClick={next} dir="next" />
            </div>
          </div>

          <div className="absolute inset-x-0 top-0 h-1 bg-white/10">
            <motion.div
              key={`prog-${index}-${paused}`}
              initial={{ width: '0%' }}
              animate={{ width: paused ? '0%' : '100%' }}
              transition={{ duration: paused ? 0 : AUTOPLAY_MS / 1000, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-rose-500 via-rose-300 to-gold-400"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.src}
              onClick={() => setIndex(i)}
              className={`relative h-10 w-14 overflow-hidden rounded-md transition ${
                i === index ? 'ring-2 ring-rose-400 ring-offset-2 ring-offset-ink-900' : 'opacity-50 hover:opacity-90'
              }`}
              aria-label={`Go to frame ${i + 1}`}
            >
              <img
                src={s.src}
                alt=""
                className="h-full w-full object-cover"
                style={{ objectPosition: objectPosition(s) }}
                loading="lazy"
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function CarouselButton({ onClick, dir }) {
  return (
    <button
      onClick={onClick}
      aria-label={dir === 'next' ? 'Next' : 'Previous'}
      className="grid h-12 w-12 place-items-center rounded-full border border-white/15 bg-ink-900/60 text-cream-50 backdrop-blur transition hover:border-rose-400/60 hover:text-rose-200"
    >
      {dir === 'next' ? '→' : '←'}
    </button>
  )
}
