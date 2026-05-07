import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

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

export default function SectionNav() {
  const [active, setActive] = useState('hero')

  useEffect(() => {
    const observers = sections.map(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return null
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id)
        },
        { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
      )
      obs.observe(el)
      return obs
    })
    return () => observers.forEach((o) => o && o.disconnect())
  }, [])

  return (
    <nav
      aria-label="Section navigation"
      className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
    >
      <ul className="flex flex-col gap-4">
        {sections.map((s) => {
          const isActive = active === s.id
          return (
            <li key={s.id} className="group relative flex items-center justify-end">
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{
                  opacity: isActive ? 1 : 0,
                  x: isActive ? 0 : 8,
                }}
                className="absolute right-7 whitespace-nowrap rounded-full border border-white/10 bg-ink-900/80 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-rose-200 backdrop-blur-md group-hover:opacity-100"
              >
                {s.label}
              </motion.span>
              <a
                href={`#${s.id}`}
                aria-label={`Jump to ${s.label}`}
                className="relative grid h-3 w-3 place-items-center"
              >
                <span
                  className={`block h-1.5 w-1.5 rounded-full transition-all ${
                    isActive
                      ? 'h-3 w-3 bg-rose-400 shadow-[0_0_18px_rgba(230,51,107,0.9)]'
                      : 'bg-cream-100/40 group-hover:bg-rose-300'
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
