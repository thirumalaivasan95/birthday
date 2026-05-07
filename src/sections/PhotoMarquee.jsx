import { useMemo } from 'react'
import { motion } from 'framer-motion'
import LiquidBlob from '../components/LiquidBlob.jsx'
import SmartPhoto from '../components/SmartPhoto.jsx'
import { nonScanPhotos } from '../data/photos.js'
import { shuffle } from '../utils/shuffle.js'

export default function PhotoMarquee() {
  // Three independent shuffles — each row is its own random pass through
  // the album, so even when the same photos appear they sit somewhere new.
  const { rowA, rowB, rowC } = useMemo(() => {
    return {
      rowA: shuffle(nonScanPhotos),
      rowB: shuffle(nonScanPhotos),
      rowC: shuffle(nonScanPhotos),
    }
  }, [])

  return (
    <section id="marquee" className="relative overflow-hidden py-32">
      <LiquidBlob className="absolute -left-40 top-0" size={620} from="#5c1029" to="#e6336b" opacity={0.4} />
      <LiquidBlob className="absolute -right-40 bottom-0" size={620} from="#d4a45c" to="#7d1638" opacity={0.35} delay={3} />

      <div className="container-romance text-center">
        <span className="text-[11px] uppercase tracking-[0.5em] text-rose-300">A river of days</span>
        <h2 className="heading-serif mt-3 text-4xl sm:text-5xl md:text-6xl">
          <span className="text-gradient-rose">Every moment, flowing past.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-cream-100/75">
          Some loves are loud. Ours is the quiet kind that fills the room. Here
          is a stream of every small forever.
        </p>
      </div>

      <div className="relative mt-16 flex flex-col gap-6 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <Row items={rowA} duration={70} />
        <Row items={rowB} duration={85} reverse />
        <Row items={rowC} duration={100} />
      </div>
    </section>
  )
}

function Row({ items, duration = 60, reverse = false }) {
  const looped = [...items, ...items]
  return (
    <div className="overflow-hidden">
      <motion.div
        className="flex gap-4 will-change-transform"
        animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
        transition={{ duration, ease: 'linear', repeat: Infinity }}
      >
        {looped.map((p, i) => (
          <figure
            key={`${p.src}-${i}`}
            className="relative h-44 w-72 shrink-0 overflow-hidden rounded-2xl border border-white/10 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] sm:h-56 sm:w-80"
          >
            <SmartPhoto
              src={p.src}
              srcSet={p.srcSet}
              sizes="320px"
              alt=""
              fit="cover"
              focusY={p.focusY}
              className="h-full w-full"
              imgClassName="transition duration-700 hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/80 via-transparent to-transparent" />
            <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-3 font-script text-base text-cream-50">
              {p.caption}
            </figcaption>
          </figure>
        ))}
      </motion.div>
    </div>
  )
}
