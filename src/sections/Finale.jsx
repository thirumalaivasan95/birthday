import { useMemo, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import LiquidBlob from '../components/LiquidBlob.jsx'
import { nonScanPhotos, objectPosition } from '../data/photos.js'
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
      className="relative flex min-h-[120vh] items-center overflow-hidden py-32"
    >
      {/* Layered backdrop */}
      <motion.div
        style={{ y: yBg, scale: scaleBg }}
        className="absolute inset-0"
      >
        <img
          src={backdrop?.src ?? ''}
          alt=""
          className="h-full w-full object-cover opacity-30"
          style={{ objectPosition: backdrop ? objectPosition(backdrop) : 'center' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-900/70 via-ink-900/85 to-ink-900" />
      </motion.div>

      <LiquidBlob
        className="absolute -left-32 top-10"
        size={680}
        from="#e6336b"
        to="#5c1029"
        opacity={0.45}
      />
      <LiquidBlob
        className="absolute -right-32 bottom-0"
        size={680}
        from="#d4a45c"
        to="#a21946"
        opacity={0.4}
        delay={3}
      />

      <div className="container-romance relative z-10 grid items-center gap-16 lg:grid-cols-12">
        {/* Words */}
        <div className="lg:col-span-7">
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
            className="heading-serif mt-6 text-5xl leading-[1.05] sm:text-6xl md:text-7xl"
          >
            <span className="text-gradient-rose">If I had to fall in love</span>
            <span className="block font-script text-4xl text-rose-300 sm:text-5xl">
              a thousand times,
            </span>
            <span className="text-gradient-rose">I would find you in every lifetime.</span>
          </motion.h2>

          <ul className="mt-12 space-y-4">
            {lines.map((line, i) => (
              <motion.li
                key={line}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: 0.2 + i * 0.12 }}
                className="flex items-start gap-4 font-serif text-lg italic leading-relaxed text-cream-50 sm:text-xl"
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
            className="mt-12 inline-flex flex-col gap-1 rounded-3xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur"
          >
            <span className="font-script text-3xl text-rose-300">— yours, always</span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-cream-100/60">
              and our little one is on the way
            </span>
          </motion.div>
        </div>

        {/* Floating tender close-ups */}
        <div className="relative hidden h-[28rem] lg:col-span-5 lg:block" style={{ perspective: 1200 }}>
          {bgPhotos.map((p, i) => (
            <FloatingPolaroid key={p.src} photo={p} index={i} />
          ))}
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
      style={{
        left: pos.left,
        top: pos.top,
        width: pos.width,
      }}
      className="absolute"
    >
      <motion.figure
        animate={{ y: [0, -14, 0, 8, 0] }}
        transition={{ duration: floatDuration, repeat: Infinity, ease: 'easeInOut' }}
        style={{ aspectRatio: '3 / 4' }}
        className="relative overflow-hidden rounded-3xl border border-white/10 shadow-[0_40px_120px_-30px_rgba(230,51,107,0.5)]"
      >
        <img
          src={photo.src}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
          style={{ objectPosition: objectPosition(photo) }}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/70 to-transparent" />
        <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 p-3 font-script text-base text-cream-50">
          {photo.caption}
        </figcaption>
      </motion.figure>
    </motion.div>
  )
}
