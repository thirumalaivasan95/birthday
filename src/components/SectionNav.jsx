import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const sections = [
  { id: 'hero', label: 'Beginning' },
  { id: 'cloud', label: 'A Cloud of Us' },
  { id: 'carousel', label: 'In Motion' },
  { id: 'slideshow', label: 'Every Moment' },
  { id: 'mosaic', label: 'The Wall' },
  { id: 'marquee', label: 'River of Days' },
  { id: 'polaroid', label: 'Polaroids' },
  { id: 'cinema', label: 'Cinema' },
  { id: 'scan', label: 'Little One' },
  { id: 'finale', label: 'Forever' },
]

const HIDE_DELAY_MS = 1500
// Trigger line is 35% from top of viewport — when a section's top crosses
// above this line, that section becomes "active". This reliably catches
// every section, even tall ones, where IntersectionObserver's narrow band
// would miss them.
const TRIGGER_OFFSET = 0.35

export default function SectionNav() {
  const [active, setActive] = useState('hero')
  const [activeLabelVisible, setActiveLabelVisible] = useState(false)
  const [hovered, setHovered] = useState(null)
  const hideTimer = useRef(null)
  const ticking = useRef(false)

  // Scroll-driven active-section detection.
  // For each scroll, find which section's top-edge is the most-recently
  // crossed above the trigger line — that's the one the user is reading.
  useEffect(() => {
    function detect() {
      const triggerY = window.scrollY + window.innerHeight * TRIGGER_OFFSET
      let current = sections[0].id
      for (const s of sections) {
        const el = document.getElementById(s.id)
        if (!el) continue
        const top = el.getBoundingClientRect().top + window.scrollY
        if (top <= triggerY) current = s.id
      }
      setActive((prev) => (prev === current ? prev : current))
    }

    function onScroll() {
      // Reveal label briefly + restart hide timer
      setActiveLabelVisible(true)
      clearTimeout(hideTimer.current)
      hideTimer.current = setTimeout(
        () => setActiveLabelVisible(false),
        HIDE_DELAY_MS,
      )
      // Detect active section (rAF-throttled)
      if (!ticking.current) {
        ticking.current = true
        requestAnimationFrame(() => {
          detect()
          ticking.current = false
        })
      }
    }

    detect() // initial
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', detect, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', detect)
      clearTimeout(hideTimer.current)
    }
  }, [])

  function refreshTimer() {
    setActiveLabelVisible(true)
    clearTimeout(hideTimer.current)
    hideTimer.current = setTimeout(
      () => setActiveLabelVisible(false),
      HIDE_DELAY_MS,
    )
  }

  return (
    <nav
      aria-label="Section navigation"
      onMouseEnter={refreshTimer}
      className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
    >
      <ul className="flex flex-col gap-4">
        {sections.map((s) => {
          const isActive = active === s.id
          const isHovered = hovered === s.id
          // Show this label only when (it's the active one AND a recent
          // scroll happened) OR when the user is hovering this specific dot.
          const showLabel = (isActive && activeLabelVisible) || isHovered
          return (
            <li
              key={s.id}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered((h) => (h === s.id ? null : h))}
              className="relative flex items-center justify-end"
            >
              <AnimatePresence>
                {showLabel && (
                  <motion.span
                    key="label"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8, transition: { duration: 0.4 } }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className={`pointer-events-none absolute right-7 whitespace-nowrap rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.3em] backdrop-blur-md ${
                      isActive
                        ? 'border-rose-400/40 bg-rose-500/20 text-rose-200'
                        : 'border-white/10 bg-ink-900/80 text-cream-100/80'
                    }`}
                  >
                    {s.label}
                  </motion.span>
                )}
              </AnimatePresence>
              <a
                href={`#${s.id}`}
                aria-label={`Jump to ${s.label}`}
                className="relative grid h-3 w-3 place-items-center"
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    isActive
                      ? 'h-3 w-3 bg-rose-400 shadow-[0_0_18px_rgba(230,51,107,0.9)]'
                      : 'h-1.5 w-1.5 bg-cream-100/40 hover:bg-rose-300'
                  }`}
                />
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
