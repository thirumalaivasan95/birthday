import { useMemo, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import SmartPhoto from '../components/SmartPhoto.jsx'
import { nonScanPhotos } from '../data/photos.js'
import { pickRandom } from '../utils/shuffle.js'

const SCRIPTS = [
  {
    eyebrow: 'The Look',
    quote: 'In a sea of people, my eyes will always search for you — and only you.',
    sub: 'And the day I called you forever, the world stood very still.',
  },
  {
    eyebrow: 'The Tide',
    quote: 'Salt air, soft sun, and the sound of you laughing — that is the colour of my happiness.',
    sub: 'Some moments belong to the sea forever.',
  },
  {
    eyebrow: 'The Blessing',
    quote: 'We held our hands together, and quietly thanked the universe for letting us find each other.',
    sub: 'Of all the lives, this one — with you.',
  },
  {
    eyebrow: 'The Vow',
    quote: 'Your eyes have a way of softening the whole world. I would build my home in that gaze.',
    sub: 'Every glance, a homecoming.',
  },
]

export default function CinematicQuotes() {
  // Pair each script with a random photo on every page load.
  const scenes = useMemo(() => {
    const pics = pickRandom(nonScanPhotos, SCRIPTS.length)
    return SCRIPTS.map((s, i) => ({ ...s, photo: pics[i] }))
  }, [])

  return (
    <section id="cinema" className="relative">
      {scenes.map((s, i) => (
        <Scene key={i} scene={s} index={i} />
      ))}
    </section>
  )
}

function Scene({ scene, index }) {
  const ref = useRef(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(scrollYProgress, [0, 1], ['-12%', '12%'])
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.18, 1.05, 1.18])
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0.85, 0.55, 0.55, 0.85])
  const textY = useTransform(scrollYProgress, [0, 0.5, 1], [60, 0, -60])
  const textOpacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0])

  return (
    <div
      ref={ref}
      className="relative h-[110vh] w-full overflow-hidden"
      style={{ marginTop: index === 0 ? 0 : '-1px' }}
    >
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <SmartPhoto
          src={scene.photo.src}
          srcSet={scene.photo.srcSet}
          sizes="100vw"
          alt=""
          fit="cover"
          focusY={scene.photo.focusY}
          className="h-full w-full"
        />
      </motion.div>

      <motion.div style={{ opacity: overlayOpacity }} className="absolute inset-0 bg-ink-900" />

      <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/30 to-ink-900" />

      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="container-romance relative z-10 flex h-full flex-col items-center justify-center text-center"
      >
        <span className="text-[11px] uppercase tracking-[0.5em] text-rose-300">
          {scene.eyebrow}
        </span>
        <h3 className="heading-serif mt-6 max-w-4xl text-3xl leading-[1.15] sm:text-5xl md:text-7xl">
          <span className="font-script text-5xl text-rose-300 sm:text-6xl">"</span>
          {scene.quote}
          <span className="font-script text-5xl text-rose-300 sm:text-6xl">"</span>
        </h3>
        <p className="mt-8 max-w-xl text-base italic text-cream-100/80 sm:text-lg">
          {scene.sub}
        </p>
      </motion.div>
    </div>
  )
}
