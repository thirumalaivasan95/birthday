import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import HeartsAndBirds from '../components/HeartsAndBirds.jsx'
import LiquidBlob from '../components/LiquidBlob.jsx'
import SmartPhoto from '../components/SmartPhoto.jsx'
import { nonScanPhotos } from '../data/photos.js'
import { shuffle } from '../utils/shuffle.js'

const FRAME_MS = 4500

export default function AllMemoriesSlideshow() {
  // A fresh shuffle every page load so the journey never feels the same.
  const slides = useMemo(() => shuffle(nonScanPhotos), [])

  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [inView, setInView] = useState(false)
  const sectionRef = useRef(null)

  // Pause when out of view (battery / CPU friendliness).
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Autoplay
  useEffect(() => {
    if (paused || !inView) return
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), FRAME_MS)
    return () => clearInterval(t)
  }, [paused, inView, slides.length])

  // Preload neighbouring frames for seamless transitions.
  useEffect(() => {
    ;[1, 2].forEach((d) => {
      const p = slides[(index + d) % slides.length]
      if (p) {
        const img = new Image()
        img.src = p.src
      }
    })
  }, [index, slides])

  function go(delta) {
    setIndex((i) => (i + delta + slides.length) % slides.length)
  }

  const current = slides[index]
  const progress = ((index + 1) / slides.length) * 100

  return (
    <section
      id="slideshow"
      ref={sectionRef}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="relative overflow-hidden py-32"
    >
      <LiquidBlob className="absolute -left-40 top-10" size={680} from="#e6336b" to="#5c1029" opacity={0.45} />
      <LiquidBlob className="absolute -right-40 bottom-0" size={620} from="#d4a45c" to="#a21946" opacity={0.4} delay={3} />

      <HeartsAndBirds density={1.1} corners hearts butterflies sparkles birds />

      <div className="container-romance relative z-10 text-center">
        <span className="text-[11px] uppercase tracking-[0.5em] text-rose-300">
          Every moment, every you
        </span>
        <h2 className="heading-serif mt-3 text-4xl sm:text-5xl md:text-6xl">
          <span className="text-gradient-rose">A slideshow of forever.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-cream-100/75">
          Every single photo of us — shuffled fresh on every visit, playing one
          by one. Hover to pause; tap the arrows to wander.
        </p>
      </div>

      <div className="container-romance relative z-10 mt-14">
        <div
          className="relative mx-auto aspect-[4/5] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_60px_160px_-40px_rgba(230,51,107,0.55)] sm:aspect-[16/10]"
          style={{ perspective: 1400 }}
        >
          <AnimatePresence mode="popLayout">
            <motion.div
              key={current.src}
              initial={{ opacity: 0, scale: 1.05, filter: 'blur(20px)' }}
              animate={{ opacity: 1, scale: 1.0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.97, filter: 'blur(8px)' }}
              transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0"
            >
              {/* SmartPhoto with fit='contain' guarantees no faces are cropped */}
              <SmartPhoto
                src={current.src}
                srcSet={current.srcSet}
                sizes="(max-width: 640px) 100vw, 1200px"
                alt=""
                fit="contain"
                eager
                className="h-full w-full"
              />
            </motion.div>
          </AnimatePresence>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/85 via-transparent to-transparent" />

          <HeartsAndBirds density={0.5} corners hearts butterflies sparkles birds={false} />

          <div className="absolute inset-x-0 bottom-0 z-10 flex items-end justify-between gap-4 p-5 sm:gap-6 sm:p-10">
            <div className="max-w-[70%]">
              <AnimatePresence mode="wait">
                <motion.p
                  key={`cap-${index}`}
                  initial={{ y: 24, opacity: 0, filter: 'blur(6px)' }}
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ y: -10, opacity: 0, filter: 'blur(6px)' }}
                  transition={{ duration: 0.7 }}
                  className="font-script text-2xl text-cream-50 sm:text-5xl"
                  style={{ textShadow: '0 4px 30px rgba(0,0,0,0.65)' }}
                >
                  {current.caption}
                </motion.p>
              </AnimatePresence>
              <div className="mt-2 flex items-center gap-3 text-[10px] uppercase tracking-[0.4em] text-rose-200">
                <span>
                  Frame {String(index + 1).padStart(3, '0')} / {String(slides.length).padStart(3, '0')}
                </span>
                <span className="hidden h-px flex-1 bg-rose-300/30 sm:block" />
                <span className="hidden uppercase sm:inline">{current.chapter}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <Btn onClick={() => go(-1)} dir="prev" />
              <Btn onClick={() => setPaused((p) => !p)} pause={paused} />
              <Btn onClick={() => go(1)} dir="next" />
            </div>
          </div>

          <div className="absolute inset-x-0 top-0 h-1 bg-white/10">
            <motion.div
              key={`prog-${index}-${paused}`}
              initial={{ width: '0%' }}
              animate={{ width: paused ? '0%' : '100%' }}
              transition={{ duration: paused ? 0 : FRAME_MS / 1000, ease: 'linear' }}
              className="h-full bg-gradient-to-r from-rose-500 via-rose-300 to-gold-400"
            />
          </div>
        </div>

        <div className="mx-auto mt-6 max-w-6xl">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.35em] text-cream-100/60">
            <span>The journey</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="mt-2 h-[2px] w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-rose-500 via-rose-300 to-gold-400"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function Btn({ onClick, dir, pause }) {
  let label = '→'
  let aria = 'Next'
  if (dir === 'prev') { label = '←'; aria = 'Previous' }
  if (pause === true) { label = '▶'; aria = 'Resume' }
  if (pause === false) { label = '❚❚'; aria = 'Pause' }
  return (
    <button
      onClick={onClick}
      aria-label={aria}
      className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-ink-900/60 text-cream-50 backdrop-blur transition hover:border-rose-400/60 hover:text-rose-200 sm:h-11 sm:w-11"
    >
      {label}
    </button>
  )
}
