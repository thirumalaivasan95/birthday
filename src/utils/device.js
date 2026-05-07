// Tiny device-capability flags resolved ONCE at module load.
//
// We deliberately do not subscribe to resize events: the bookkeeping
// cost across every motion-heavy component would dwarf the benefit on
// the very devices we are trying to help (old iPhone SE Safari).
// Rotate-the-phone edge cases reload the page anyway.

const ua = typeof navigator !== 'undefined' ? navigator.userAgent : ''

export const isMobile =
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(max-width: 768px)').matches ||
    /iPhone|iPod|Android.*Mobile/i.test(ua))

export const isTouch =
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(pointer: coarse)').matches ||
    'ontouchstart' in window)

export const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

// Old iOS Safari (SE-class hardware): WebKit + small viewport. Used to
// skip the most expensive eye-candy (heavy CSS blur, RAF path morphs,
// hundreds of motion subscribers) without affecting modern devices.
export const isLowPower =
  isMobile && /AppleWebKit/i.test(ua) && !/Chrome|CriOS|FxiOS/i.test(ua)
