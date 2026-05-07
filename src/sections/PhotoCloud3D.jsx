import { useCallback, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import LiquidBlob from '../components/LiquidBlob.jsx'
import SmartPhoto from '../components/SmartPhoto.jsx'
import { nonScanPhotos } from '../data/photos.js'
import { pickRandom } from '../utils/shuffle.js'

// A casual scattered "sticky-note pile" of photos.
//
// No centre deck. Every card is its own swipeable element, placed at a
// random position with a random rotation and slight size variation.
// Swipe ANY card in ANY direction → it flies off → a fresh random photo
// appears at a new random position. Cursor parallax adds gentle ambient
// drift; deeper cards drift more.
//
// Why two motion layers? Drag and parallax both want to set x / y. We
// give the OUTER layer the cursor parallax (style.x = parX) and the
// INNER layer the drag + entry/exit animation. They don't fight.

const CARD_COUNT_DESKTOP = 14
const CARD_COUNT_MOBILE = 8

const SWIPE_THRESHOLD_PX = 70
const SWIPE_THRESHOLD_VELOCITY = 320

function rand(a, b) { return a + Math.random() * (b - a) }

// Random spawn slot anywhere in the playground.
//   isMobile only adjusts size — positions stay the same so the layout
//   feels equally full at any breakpoint.
function randomSlot(isMobile = false) {
  return {
    // % of the playground width / height — leaves a small margin so
    // cards don't get clipped at the edges.
    x: rand(2, 80),
    y: rand(0, 75),
    size: isMobile ? rand(7, 11) : rand(10, 16),  // rem
    rotate: rand(-14, 14),
    depth: rand(0.45, 1.35),                       // parallax intensity
  }
}

function makeInitialCards(count, isMobile) {
  const used = new Set()
  const cards = []
  for (let i = 0; i < count; i++) {
    const candidates = nonScanPhotos.filter((p) => !used.has(p.src))
    if (candidates.length === 0) break
    const photo = candidates[Math.floor(Math.random() * candidates.length)]
    used.add(photo.src)
    cards.push({ id: i, photo, ...randomSlot(isMobile) })
  }
  return cards
}

export default function PhotoCloud3D() {
  // We treat all viewports the same on mount; the size variation in
  // randomSlot keeps cards readable on either. The mobile flag is just
  // for initial sizing; the layout is identical.
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
  const initialCount = isMobile ? CARD_COUNT_MOBILE : CARD_COUNT_DESKTOP

  const [cards, setCards] = useState(() => makeInitialCards(initialCount, isMobile))

  // ---- Cursor parallax (whole section listens) ----------------------------
  const sectionRef = useRef(null)
  const mxRaw = useMotionValue(0)
  const myRaw = useMotionValue(0)
  const mx = useSpring(mxRaw, { stiffness: 60, damping: 18, mass: 0.7 })
  const my = useSpring(myRaw, { stiffness: 60, damping: 18, mass: 0.7 })

  function handleMove(e) {
    const r = sectionRef.current?.getBoundingClientRect()
    if (!r) return
    mxRaw.set((e.clientX - r.left - r.width / 2) / r.width)
    myRaw.set((e.clientY - r.top - r.height / 2) / r.height)
  }
  function handleLeave() {
    mxRaw.set(0)
    myRaw.set(0)
  }

  // ---- Swipe respawn ------------------------------------------------------
  const respawn = useCallback((id) => {
    setCards((prev) => {
      const used = new Set(prev.filter((c) => c.id !== id).map((c) => c.photo.src))
      const candidates = nonScanPhotos.filter((p) => !used.has(p.src))
      if (candidates.length === 0) return prev
      const fresh = candidates[Math.floor(Math.random() * candidates.length)]
      const isMob = window.innerWidth < 768
      return prev.map((c) =>
        c.id === id ? { ...c, photo: fresh, ...randomSlot(isMob) } : c,
      )
    })
  }, [])

  return (
    <section
      id="cloud"
      ref={sectionRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative overflow-hidden py-32"
    >
      <LiquidBlob className="absolute -left-40 top-10" size={680} from="#7d1638" to="#e6336b" opacity={0.4} />
      <LiquidBlob className="absolute -right-40 bottom-0" size={620} from="#d4a45c" to="#a21946" opacity={0.35} delay={3} />

      {/* Heading */}
      <div className="container-romance relative z-30 text-center">
        <span className="text-[11px] uppercase tracking-[0.5em] text-rose-300">A Cloud of Us</span>
        <h2 className="heading-serif mt-3 text-4xl sm:text-5xl md:text-6xl">
          <span className="text-gradient-rose">Move your cursor —</span>
          <span className="block font-script text-3xl text-rose-200 sm:text-4xl">
            and we move with you.
          </span>
        </h2>
        <p className="mt-3 text-[10px] uppercase tracking-[0.4em] text-rose-200/85">
          ✨ swipe any card any direction — a new memory takes its place ✨
        </p>
      </div>

      {/* The playground — cards float here, scattered */}
      <div className="relative mx-auto mt-12 h-[88vh] w-full max-w-[110rem] sm:mt-14 sm:h-[80vh]">
        {cards.map((card) => (
          <ScatteredCard
            key={`${card.id}:${card.photo.src}`}
            card={card}
            mx={mx}
            my={my}
            onSwipe={() => respawn(card.id)}
          />
        ))}
      </div>
    </section>
  )
}

// ── One scattered card ────────────────────────────────────────────────────────
function ScatteredCard({ card, mx, my, onSwipe }) {
  const { photo, x, y, size, rotate, depth } = card
  const [exiting, setExiting] = useState(null)

  // Cursor parallax — owned by the OUTER motion.div via style.x / style.y.
  // The inner div owns drag + entry/exit. They can't fight because they
  // live on different DOM elements.
  const parX = useTransform(mx, (v) => v * depth * 36)
  const parY = useTransform(my, (v) => v * depth * 22)

  function handleDragEnd(_, info) {
    const swiped =
      Math.abs(info.offset.x) > SWIPE_THRESHOLD_PX ||
      Math.abs(info.offset.y) > SWIPE_THRESHOLD_PX ||
      Math.abs(info.velocity.x) > SWIPE_THRESHOLD_VELOCITY ||
      Math.abs(info.velocity.y) > SWIPE_THRESHOLD_VELOCITY
    if (!swiped) return

    // Fling FAR in whatever direction the user pulled
    const xOff = info.offset.x || info.velocity.x * 0.05
    const yOff = info.offset.y || info.velocity.y * 0.05
    setExiting({
      x: xOff * 7,
      y: yOff * 7,
      rotate: xOff > 0 ? 60 : -60,
    })
    setTimeout(onSwipe, 380)
  }

  return (
    // Layer 1 — placement + parallax. Plain absolute, NO pointer-events-none.
    <motion.div
      className="absolute"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}rem`,
        x: parX,
        y: parY,
        zIndex: Math.round(depth * 10),
      }}
    >
      {/* Layer 2 — drag + entry/exit animation. This is the gesture target. */}
      <motion.div
        className="cursor-grab touch-pan-y select-none active:cursor-grabbing"
        style={{ aspectRatio: '3 / 4' }}
        initial={{ opacity: 0, scale: 0.5, rotate: rotate + 35, y: 30 }}
        animate={
          exiting
            ? {
                x: exiting.x,
                y: exiting.y,
                rotate: exiting.rotate,
                opacity: 0,
                scale: 0.55,
                transition: { duration: 0.4, ease: [0.4, 0, 0.6, 1] },
              }
            : {
                x: 0,
                y: 0,
                rotate,
                opacity: 1,
                scale: 1,
                transition: {
                  type: 'spring',
                  stiffness: 200,
                  damping: 22,
                  mass: 0.6,
                },
              }
        }
        drag={!exiting}
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={1}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        whileHover={{ scale: 1.06, zIndex: 50, transition: { duration: 0.2 } }}
        whileDrag={{ scale: 1.08, zIndex: 100, transition: { duration: 0.15 } }}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[1.1rem] border border-white/15 bg-ink-900 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.7),0_0_30px_-15px_rgba(230,51,107,0.5)]">
          <SmartPhoto
            src={photo.src}
            srcSet={photo.srcSet}
            sizes="14rem"
            alt=""
            fit="cover"
            focusY={photo.focusY}
            className="absolute inset-0 h-full w-full"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/85 via-transparent to-transparent" />
          <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 p-2.5 font-script text-xs leading-tight text-cream-50 sm:p-3 sm:text-sm">
            {photo.caption}
          </figcaption>
        </div>
      </motion.div>
    </motion.div>
  )
}
