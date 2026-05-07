import { useMemo, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import LiquidBlob from '../components/LiquidBlob.jsx'
import SmartPhoto from '../components/SmartPhoto.jsx'
import { nonScanPhotos } from '../data/photos.js'
import { pickRandom } from '../utils/shuffle.js'

const lines = [
  'For every quiet morning I wake beside you,',
  'For every laugh that fills the kitchen,',
  'For the way you hum to yourself,',
  'For the small hand that will soon hold ours,',
  'I love you. I love you. I love you.',
]

export default function Finale() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end end'],
  })
  const yBg = useTransform(scrollYProgress, [0, 1], ['10%', '-10%'])
  const scaleBg = useTransform(scrollYProgress, [0, 1], [1.2, 1.05])

  // 4 random tender close-ups: 1 backdrop + 3 floating polaroids.
  const [backdrop, ...bgPhotos] = useMemo(
    () => pickRandom(nonScanPhotos, 4),
    [],
  )

  return (
    <section
      id="finale"
      ref={ref}
      className="relative flex min-h-[120vh] items-center overflow-hidden py-24 sm:py-32"
    >
      {/* Layered backdrop */}
      <motion.div style={{ y: yBg, scale: scaleBg }} className="absolute inset-0">
        <img
          src={backdrop?.src ?? ''}
          alt=""
          className="h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/70 via-ink-900/85 to-ink-900" />
      </motion.div>

      <LiquidBlob className="absolute -left-32 top-10" size={680} from="#e6336b" to="#5c1029" opacity={0.45} />
      <LiquidBlob className="absolute -right-32 bottom-0" size={680} from="#d4a45c" to="#a21946" opacity={0.4} delay={3} />

      <div className="container-romance relative z-10 grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Words */}
        <div className="order-2 lg:order-1 lg:col-span-7">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-3 rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-[10px] uppercase tracking-[0.5em] text-rose-200 backdrop-blur"
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
            Forever
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1, delay: 0.1 }}
            className="heading-serif mt-6 text-4xl leading-[1.05] sm:text-5xl md:text-6xl lg:text-7xl"
          >
            <span className="text-gradient-rose">If I had to fall in love</span>
            <span className="block font-script text-3xl text-rose-300 sm:text-4xl md:text-5xl">
              a thousand times,
            </span>
            <span className="text-gradient-rose">I would find you in every lifetime.</span>
          </motion.h2>

          <ul className="mt-10 space-y-4 sm:mt-12">
            {lines.map((line, i) => (
              <motion.li
                key={line}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: 0.2 + i * 0.12 }}
                className="flex items-start gap-4 font-serif text-base italic leading-relaxed text-cream-50 sm:text-lg md:text-xl"
              >
                <span className="mt-2 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-rose-500/80">
                  <svg viewBox="0 0 24 24" className="h-2.5 w-2.5 fill-cream-50" aria-hidden>
                    <path d="M12 21s-7.5-4.7-9.7-9.3C.6 7.6 3.1 4 6.6 4c2 0 3.5 1.1 4.4 2.6h2c.9-1.5 2.4-2.6 4.4-2.6 3.5 0 6 3.6 4.3 7.7C19.5 16.3 12 21 12 21z" />
                  </svg>
                </span>
                <span>{line}</span>
              </motion.li>
            ))}
          </ul>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-10 inline-flex flex-col gap-1 rounded-3xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur sm:mt-12"
          >
            <span className="font-script text-3xl text-rose-300">— yours, always</span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-cream-100/60">
              and our little one is on the way
            </span>
          </motion.div>
        </div>

        {/* Floating tender close-ups — visible on ALL screens */}
        <div className="order-1 lg:order-2 lg:col-span-5">
          {/* Mobile: a graceful 3-card overlapping stack */}
          <div className="relative mx-auto block aspect-[4/5] max-w-sm sm:max-w-md lg:hidden" style={{ perspective: 1200 }}>
            {bgPhotos.map((p, i) => (
              <FloatingPolaroidMobile key={p.src} photo={p} index={i} />
            ))}
          </div>

          {/* Desktop: the original collage */}
          <div className="relative hidden h-[28rem] lg:block" style={{ perspective: 1200 }}>
            {bgPhotos.map((p, i) => (
              <FloatingPolaroid key={p.src} photo={p} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FloatingPolaroid({ photo, index }) {
  const positions = [
    { left: '10%', top: '5%',  width: '55%' },
    { left: '35%', top: '35%', width: '50%' },
    { left: '5%',  top: '60%', width: '60%' },
  ]
  const pos = positions[index]
  const rotate = index % 2 === 0 ? -6 : 4
  const floatDuration = 6 + index * 1.5

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: rotate * 1.5 }}
      whileInView={{ opacity: 1, y: 0, rotate }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 1, delay: 0.3 + index * 0.15 }}
      style={{ left: pos.left, top: pos.top, width: pos.width }}
      className="absolute"
    >
      <motion.figure
        animate={{ y: [0, -14, 0, 8, 0] }}
        transition={{ duration: floatDuration, repeat: Infinity, ease: 'easeInOut' }}
        style={{ aspectRatio: '3 / 4' }}
        className="relative overflow-hidden rounded-3xl border border-white/10 shadow-[0_40px_120px_-30px_rgba(230,51,107,0.5)]"
      >
        <SmartPhoto src={photo.src} srcSet={photo.srcSet} sizes="(max-width: 640px) 60vw, 25vw" alt="" fit="cover" focusY={photo.focusY} className="h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/70 to-transparent" />
        <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 p-3 font-script text-base text-cream-50">
          {photo.caption}
        </figcaption>
      </motion.figure>
    </motion.div>
  )
}

function FloatingPolaroidMobile({ photo, index }) {
  // Three overlapping cards in the centre, fanned out for a romantic look.
  const positions = [
    { left: '8%',  top: '4%',  width: '60%', rotate: -5 },
    { left: '38%', top: '20%', width: '58%', rotate: 6 },
    { left: '18%', top: '46%', width: '64%', rotate: -3 },
  ]
  const pos = positions[index]
  const floatDuration = 6 + index * 1.5

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: pos.rotate * 1.5 }}
      whileInView={{ opacity: 1, y: 0, rotate: pos.rotate }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 1, delay: 0.2 + index * 0.12 }}
      style={{ left: pos.left, top: pos.top, width: pos.width, zIndex: index }}
      className="absolute"
    >
      <motion.figure
        animate={{ y: [0, -10, 0, 6, 0] }}
        transition={{ duration: floatDuration, repeat: Infinity, ease: 'easeInOut' }}
        style={{ aspectRatio: '3 / 4' }}
        className="relative overflow-hidden rounded-3xl border border-white/15 bg-cream-50/5 shadow-[0_30px_80px_-25px_rgba(230,51,107,0.55)]"
      >
        <SmartPhoto src={photo.src} srcSet={photo.srcSet} sizes="(max-width: 640px) 60vw, 25vw" alt="" fit="cover" focusY={photo.focusY} className="h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/70 to-transparent" />
        <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 p-2 font-script text-xs text-cream-50 sm:text-sm">
          {photo.caption}
        </figcaption>
      </motion.figure>
    </motion.div>
  )
}
