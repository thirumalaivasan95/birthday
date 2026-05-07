import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import LiquidBlob from '../components/LiquidBlob.jsx'
import HeartsAndBirds from '../components/HeartsAndBirds.jsx'
import { photos, objectPosition } from '../data/photos.js'

const scan = photos.find((p) => p.isScan)

const stages = [
  'And then…',
  'two heartbeats became three.',
  'A tiny hand. A new universe.',
  'You — already a mother. Already a miracle.',
]

export default function ScanReveal() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const yBg = useTransform(scrollYProgress, [0, 1], ['10%', '-10%'])
  const scaleImg = useTransform(scrollYProgress, [0, 0.5, 1], [1.18, 1.0, 1.05])
  const haloScale = useTransform(scrollYProgress, [0, 1], [0.9, 1.4])

  if (!scan) return null

  return (
    <section
      id="scan"
      ref={ref}
      className="relative flex min-h-[120vh] items-center overflow-hidden py-32"
    >
      {/* Soft glow backdrop */}
      <motion.div
        style={{ y: yBg }}
        className="absolute inset-0 bg-gradient-to-b from-ink-900 via-rose-900/20 to-ink-900"
      />

      <LiquidBlob
        className="absolute -left-40 top-10"
        size={620}
        from="#e6336b"
        to="#5c1029"
        opacity={0.5}
      />
      <LiquidBlob
        className="absolute -right-40 bottom-0"
        size={680}
        from="#fff5f7"
        to="#d4a45c"
        opacity={0.35}
        delay={2}
      />

      <HeartsAndBirds density={0.9} corners hearts butterflies sparkles birds />

      <div className="container-romance relative z-10 grid items-center gap-16 lg:grid-cols-12">
        {/* Words */}
        <div className="lg:col-span-5">
          <motion.span
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-3 rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-[10px] uppercase tracking-[0.5em] text-rose-200 backdrop-blur"
          >
            <motion.span
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              className="h-1.5 w-1.5 rounded-full bg-rose-400"
            />
            A new little heartbeat
          </motion.span>

          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1, delay: 0.1 }}
            className="heading-serif mt-6 text-5xl leading-[1.05] sm:text-6xl md:text-7xl"
          >
            <span className="font-script text-4xl text-rose-300 sm:text-5xl">and now…</span>
            <span className="block text-gradient-rose">we are three.</span>
          </motion.h2>

          <ul className="mt-10 space-y-5">
            {stages.map((line, i) => (
              <motion.li
                key={line}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, delay: 0.2 + i * 0.18 }}
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

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-10 max-w-md text-base leading-relaxed text-cream-100/80"
          >
            On your birthday, my love, the most precious gift is the one inside
            you. I will be here for you, with you, and for both of you — for
            the rest of my life.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-8 inline-flex flex-col gap-1 rounded-3xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur"
          >
            <span className="font-script text-3xl text-rose-300">— Sriram</span>
            <span className="text-[10px] uppercase tracking-[0.4em] text-cream-100/60">
              your loving, caring, supporting husband
            </span>
          </motion.div>
        </div>

        {/* The scan, with reverence */}
        <div className="relative lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-xl"
          >
            {/* Outer pulsing halo */}
            <motion.div
              style={{ scale: haloScale }}
              animate={{ opacity: [0.35, 0.7, 0.35] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,rgba(230,51,107,0.55)_0%,rgba(212,164,92,0.25)_45%,transparent_75%)] blur-2xl"
            />
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -inset-4 rounded-[2.5rem] border border-rose-300/40"
            />

            {/* The scan */}
            <motion.figure
              style={{ scale: scaleImg }}
              className="relative overflow-hidden rounded-[2.5rem] border border-white/15 shadow-[0_60px_180px_-30px_rgba(230,51,107,0.65)]"
            >
              <img
                src={scan.src}
                alt="our little one"
                className="h-full w-full object-cover"
                style={{ aspectRatio: '4 / 5', objectPosition: objectPosition(scan) }}
              />
              {/* Subtle inner glow */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55)_100%)]" />
              {/* Caption ribbon */}
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-900 via-ink-900/70 to-transparent p-6 text-center">
                <span className="block font-script text-3xl text-rose-200 sm:text-4xl">
                  {scan.caption}
                </span>
                <span className="mt-2 block text-[10px] uppercase tracking-[0.4em] text-cream-100/70">
                  hello, little one — we have been waiting
                </span>
              </figcaption>
            </motion.figure>

            {/* Floating tiny heart in front of the scan */}
            <motion.div
              animate={{ y: [0, -12, 0], scale: [1, 1.15, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-4 -top-4 grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-rose-500 to-gold-400 text-2xl shadow-[0_0_60px_rgba(230,51,107,0.7)]"
            >
              💗
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
