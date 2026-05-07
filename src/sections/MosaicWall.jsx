import { useMemo } from 'react'
import { motion } from 'framer-motion'
import LiquidBlob from '../components/LiquidBlob.jsx'
import TiltCard from '../components/TiltCard.jsx'
import SmartPhoto from '../components/SmartPhoto.jsx'
import { nonScanPhotos } from '../data/photos.js'
import { pickRandom } from '../utils/shuffle.js'

const TILE_COUNT = 14

// Span patterns. Mobile (2 cols) keeps every tile col-span-1 to avoid gaps.
// Larger screens get a varied pattern; combined with grid-flow-dense the
// browser packs leftover cells automatically — no holes.
const desktopPatterns = [
  'sm:col-span-2 sm:row-span-2',
  'sm:col-span-1 sm:row-span-1',
  'sm:col-span-1 sm:row-span-2',
  'sm:col-span-2 sm:row-span-1',
  'sm:col-span-1 sm:row-span-1',
  'sm:col-span-2 sm:row-span-2',
  'sm:col-span-1 sm:row-span-1',
  'sm:col-span-1 sm:row-span-2',
  'sm:col-span-2 sm:row-span-1',
  'sm:col-span-1 sm:row-span-1',
  'sm:col-span-1 sm:row-span-1',
  'sm:col-span-2 sm:row-span-2',
  'sm:col-span-1 sm:row-span-1',
  'sm:col-span-1 sm:row-span-1',
]

export default function MosaicWall() {
  const tiles = useMemo(() => pickRandom(nonScanPhotos, TILE_COUNT), [])

  return (
    <section id="mosaic" className="relative overflow-hidden py-32">
      <LiquidBlob className="absolute -left-24 top-1/4" size={520} from="#a21946" to="#e6336b" opacity={0.4} />
      <LiquidBlob className="absolute -right-24 bottom-10" size={520} from="#d4a45c" to="#5c1029" opacity={0.35} delay={2} />

      <div className="container-romance text-center">
        <span className="text-[11px] uppercase tracking-[0.5em] text-rose-300">The Wall</span>
        <h2 className="heading-serif mt-3 text-4xl sm:text-5xl md:text-6xl">
          <span className="text-gradient-rose">Memories, framed.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-cream-100/75">
          Hover any photo — they tilt the way real memories do, just slightly,
          just for you.
        </p>
      </div>

      <div className="container-romance mt-14">
        <div
          className="grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] sm:grid-cols-4 sm:gap-5 lg:auto-rows-[220px] lg:grid-cols-6"
          style={{ gridAutoFlow: 'dense' }}
        >
          {tiles.map((p, i) => (
            <motion.div
              key={p.src}
              initial={{ opacity: 0, y: 30, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: (i % 8) * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className={`col-span-1 row-span-1 ${desktopPatterns[i % desktopPatterns.length]}`}
            >
              <TiltCard intensity={14} className="h-full w-full">
                <div className="relative h-full w-full">
                  <SmartPhoto
                    src={p.src}
                    srcSet={p.srcSet}
                    sizes="(max-width: 640px) 50vw, 25vw"
                    alt=""
                    fit="cover"
                    focusY={p.focusY}
                    className="absolute inset-0 h-full w-full"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/85 via-ink-900/10 to-transparent"
                    style={{ transform: 'translateZ(20px)' }}
                  />
                  <figcaption
                    className="pointer-events-none absolute inset-x-0 bottom-0 p-3 font-script text-sm text-cream-50 sm:p-4 sm:text-base lg:text-lg"
                    style={{ transform: 'translateZ(40px)' }}
                  >
                    {p.caption}
                  </figcaption>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
