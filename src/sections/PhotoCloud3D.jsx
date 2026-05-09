import { useCallback, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import LiquidBlob from '../components/LiquidBlob.jsx'
import SmartPhoto from '../components/SmartPhoto.jsx'
import { nonScanPhotos } from '../data/photos.js'
import { isMobile as IS_MOBILE, isTouch as IS_TOUCH, isLowPower as IS_LOW_POWER } from '../utils/device.js'

// A casual scattered "sticky-note pile" of photos.
//
// No centre deck. Every card is its own swipeable element, placed at a
// random position with a random rotation and slight size variation.
// Swipe ANY card in ANY direction → it flies off → a fresh random photo
// appears at a DIFFERENT random position. Cursor parallax adds gentle
// ambient drift; deeper cards drift more.
//
// Desktop: mouse drag works exactly like mobile touch — drag a card
// far enough and it vanishes, reappearing elsewhere with a new photo.
//
// Why two motion layers? Drag and parallax both want to set x / y. We
// give the OUTER layer the cursor parallax (style.x = parX) and the
// INNER layer the drag + entry/exit animation. They don't fight.

// Grid dimensions — more cards for a denser, richer cloud
const GRID_DESKTOP = { cols: 6, rows: 4 }   // 24 slots
const GRID_MOBILE  = { cols: 4, rows: 5 }   // 20 slots

const SWIPE_THRESHOLD_PX = 40
const SWIPE_THRESHOLD_VELOCITY = 200

function rand(a, b) { return a + Math.random() * (b - a) }

// Pick a slot inside cell (col,row), jittered. Returns playground-%.
function slotInCell(col, row, cols, rows, isMobile) {
  const cellW = 100 / cols
  const cellH = 100 / rows
  // jitter inside ~65% of the cell so neighbours can overlap a touch
  const jx = rand(0.08, 0.58)
  const jy = rand(0.08, 0.58)
  return {
    x: col * cellW + cellW * jx,
    y: row * cellH + cellH * jy,
    size: isMobile ? rand(8, 11) : rand(11, 16), // rem — medium
    rotate: rand(-16, 16),
    depth: rand(0.4, 1.3),
  }
}

// Build a shuffled list of every (col,row) cell. We then assign one
// card per cell so distribution is guaranteed.
function shuffledCells(cols, rows) {
  const cells = []
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) cells.push([c, r])
  for (let i = cells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cells[i], cells[j]] = [cells[j], cells[i]]
  }
  return cells
}

function makeInitialCards(grid, isMobile) {
  const { cols, rows } = grid
  const cells = shuffledCells(cols, rows)
  const used = new Set()
  const cards = []
  for (let i = 0; i < cells.length; i++) {
    const candidates = nonScanPhotos.filter((p) => !used.has(p.src))
    if (candidates.length === 0) break
    const photo = candidates[Math.floor(Math.random() * candidates.length)]
    used.add(photo.src)
    const [c, r] = cells[i]
    cards.push({ id: i, photo, cell: [c, r], ...slotInCell(c, r, cols, rows, isMobile) })
  }
  return cards
}

// Pick a random cell that is NOT the current one
function pickDifferentCell(currentCell, cols, rows) {
  let col, row
  let attempts = 0
  do {
    col = Math.floor(Math.random() * cols)
    row = Math.floor(Math.random() * rows)
    attempts++
  } while (col === currentCell[0] && row === currentCell[1] && attempts < 20)
  return [col, row]
}

export default function PhotoCloud3D() {
  const grid = IS_MOBILE ? GRID_MOBILE : GRID_DESKTOP
  const [cards, setCards] = useState(() => makeInitialCards(grid, IS_MOBILE))

  // ---- Cursor parallax (desktop only — touch devices don't get mousemove
  //      reliably and the spring subscribers are the most expensive thing
  //      on this section for low-power phones) -----------------------------
  const enableParallax = !IS_TOUCH && !IS_LOW_POWER
  const sectionRef = useRef(null)
  const mxRaw = useMotionValue(0)
  const myRaw = useMotionValue(0)
  const mxSpring = useSpring(mxRaw, { stiffness: 60, damping: 18, mass: 0.7 })
  const mySpring = useSpring(myRaw, { stiffness: 60, damping: 18, mass: 0.7 })
  const mx = enableParallax ? mxSpring : null
  const my = enableParallax ? mySpring : null

  function handleMove(e) {
    if (!enableParallax) return
    const r = sectionRef.current?.getBoundingClientRect()
    if (!r) return
    mxRaw.set((e.clientX - r.left - r.width / 2) / r.width)
    myRaw.set((e.clientY - r.top - r.height / 2) / r.height)
  }
  function handleLeave() {
    if (!enableParallax) return
    mxRaw.set(0)
    myRaw.set(0)
  }

  // ---- Swipe respawn — card reappears at a DIFFERENT random position ------
  const respawn = useCallback((id) => {
    setCards((prev) => {
      const used = new Set(prev.filter((c) => c.id !== id).map((c) => c.photo.src))
      const candidates = nonScanPhotos.filter((p) => !used.has(p.src))
      if (candidates.length === 0) {
        // All photos used — just recycle from full pool
        const fallback = nonScanPhotos[Math.floor(Math.random() * nonScanPhotos.length)]
        return prev.map((c) => {
          if (c.id !== id) return c
          const newCell = pickDifferentCell(c.cell, grid.cols, grid.rows)
          return { ...c, photo: fallback, cell: newCell, ...slotInCell(newCell[0], newCell[1], grid.cols, grid.rows, IS_MOBILE) }
        })
      }
      const fresh = candidates[Math.floor(Math.random() * candidates.length)]
      return prev.map((c) => {
        if (c.id !== id) return c
        // Pick a DIFFERENT cell for the new position
        const newCell = pickDifferentCell(c.cell, grid.cols, grid.rows)
        return { ...c, photo: fresh, cell: newCell, ...slotInCell(newCell[0], newCell[1], grid.cols, grid.rows, IS_MOBILE) }
      })
    })
  }, [grid.cols, grid.rows])

  return (
    <section
      id="cloud"
      ref={sectionRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative overflow-hidden py-32"
    >
      {!IS_LOW_POWER && (
        <>
          <LiquidBlob className="absolute -left-40 top-10" size={680} from="#7d1638" to="#e6336b" opacity={0.4} />
          <LiquidBlob className="absolute -right-40 bottom-0" size={620} from="#d4a45c" to="#a21946" opacity={0.35} delay={3} />
          <LiquidBlob className="absolute left-1/3 top-1/2" size={400} from="#e6336b" to="#d4a45c" opacity={0.2} delay={5} />
        </>
      )}

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
          ✨ drag any card to fling it away — a new memory appears somewhere else ✨
        </p>
      </div>

      {/* The playground — cards float here, scattered */}
      <div className="relative mx-auto mt-12 h-[100vh] w-full max-w-[120rem] sm:mt-14 sm:h-[90vh]">
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
  // live on different DOM elements. When parallax is disabled (touch /
  // low-power) we feed a frozen motion-value so no subscribers run.
  const zeroX = useMotionValue(0)
  const zeroY = useMotionValue(0)
  const parX = useTransform(mx ?? zeroX, (v) => v * depth * 36)
  const parY = useTransform(my ?? zeroY, (v) => v * depth * 22)

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
    // After exit animation, respawn in a different spot
    setTimeout(() => {
      setExiting(null)
      onSwipe()
    }, 380)
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
        whileHover={{ scale: 1.08, zIndex: 50, transition: { duration: 0.2 } }}
        whileDrag={{ scale: 1.1, zIndex: 100, rotate: rotate * 0.5, transition: { duration: 0.15 } }}
      >
        <div
          className="relative h-full w-full overflow-hidden rounded-[1.1rem] border border-white/15 bg-ink-900 shadow-[0_25px_60px_-20px_rgba(0,0,0,0.7),0_0_30px_-15px_rgba(230,51,107,0.5)]"
          onDragStart={(e) => e.preventDefault()}
        >
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
