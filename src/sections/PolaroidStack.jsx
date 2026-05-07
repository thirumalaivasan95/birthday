import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import LiquidBlob from '../components/LiquidBlob.jsx'
import SmartPhoto from '../components/SmartPhoto.jsx'
import { nonScanPhotos } from '../data/photos.js'
import { pickRandom } from '../utils/shuffle.js'

const STACK_SIZE = 8

export default function PolaroidStack() {
  const stack = useMemo(() => pickRandom(nonScanPhotos, STACK_SIZE), [])
  const [order, setOrder] = useState(stack.map((_, i) => i))

  function shuffleNext() {
    setOrder((o) => {
      const next = [...o]
      next.push(next.shift())
      return next
    })
  }
  function reverse() {
    setOrder((o) => {
      const next = [...o]
      next.unshift(next.pop())
      return next
    })
  }

  return (
    <section id="polaroid" className="relative overflow-hidden py-32">
      <LiquidBlob className="absolute -left-32 top-1/4" size={520} from="#e6336b" to="#a21946" opacity={0.4} />
      <LiquidBlob className="absolute -right-32 bottom-10" size={520} from="#d4a45c" to="#7d1638" opacity={0.35} delay={2} />

      <div className="container-romance text-center">
        <span className="text-[11px] uppercase tracking-[0.5em] text-rose-300">Polaroids</span>
        <h2 className="heading-serif mt-3 text-4xl sm:text-5xl md:text-6xl">
          <span className="text-gradient-rose">A stack of forevers.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-cream-100/75">
          Tap the deck to flip through — eight little time capsules of us.
        </p>
      </div>

      <div className="container-romance mt-20 flex flex-col items-center gap-10">
        <div className="relative h-[26rem] w-72 sm:h-[30rem] sm:w-80" style={{ perspective: 1400 }}>
          {order.map((stackIndex, displayIndex) => {
            const p = stack[stackIndex]
            const isTop = displayIndex === 0
            const z = order.length - displayIndex
            return (
              <motion.div
                key={p.src}
                layout
                initial={false}
                animate={{
                  y: displayIndex * 8,
                  x: displayIndex * 4,
                  rotate: isTop ? 0 : (displayIndex % 2 === 0 ? -1 : 1) * (3 + displayIndex),
                  scale: 1 - displayIndex * 0.03,
                  zIndex: z,
                }}
                transition={{ type: 'spring', stiffness: 230, damping: 26 }}
                className="absolute inset-0"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Polaroid photo={p} top={isTop} />
              </motion.div>
            )
          })}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={reverse}
            className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-[11px] uppercase tracking-[0.3em] text-cream-50/80 backdrop-blur transition hover:border-rose-400/40 hover:text-rose-200"
          >
            ← Previous
          </button>
          <button
            onClick={shuffleNext}
            className="rounded-full border border-rose-400/40 bg-rose-500/15 px-5 py-2 text-[11px] uppercase tracking-[0.3em] text-rose-200 backdrop-blur transition hover:bg-rose-500/25"
          >
            Next →
          </button>
        </div>
      </div>
    </section>
  )
}

function Polaroid({ photo, top }) {
  return (
    <motion.figure
      whileHover={top ? { y: -8, rotate: -2 } : {}}
      transition={{ type: 'spring', stiffness: 250, damping: 22 }}
      className="relative h-full w-full overflow-hidden rounded-[1.25rem] bg-cream-50 p-3 pb-14 shadow-[0_40px_80px_-25px_rgba(0,0,0,0.65)]"
    >
      <div className="relative h-[78%] w-full overflow-hidden rounded-[0.75rem] bg-ink-800">
        <SmartPhoto
          src={photo.src}
          srcSet={photo.srcSet}
          sizes="(max-width: 640px) 80vw, 320px"
          alt=""
          fit="contain"
          className="h-full w-full"
        />
      </div>
      <figcaption className="absolute inset-x-0 bottom-3 px-4 text-center font-script text-xl text-ink-900 sm:text-2xl">
        {photo.caption}
      </figcaption>
    </motion.figure>
  )
}
