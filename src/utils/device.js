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

// Old iOS Safari (SE-class hardware): WebKit + small viewport.
const isOldSafari =
  isMobile && /AppleWebKit/i.test(ua) && !/Chrome|CriOS|FxiOS/i.test(ua)

// Slow CPU (≤2 cores) or tiny RAM (≤2 GB).
const cpu = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4
const ram = typeof navigator !== 'undefined' ? navigator.deviceMemory || 4 : 4
const isWeakHw = cpu <= 2 || ram <= 2

// Slow network (2G / GPRS / save-data).
const conn =
  typeof navigator !== 'undefined' ? navigator.connection || navigator.mozConnection || navigator.webkitConnection : null
const isSlowNet =
  !!conn && (/(^|\b)(2g|slow-2g)(\b|$)/i.test(conn.effectiveType || '') || conn.saveData === true)

// "Lite" mode: skip the most expensive eye-candy (heavy CSS blur, RAF
// path morphs, hundreds of motion subscribers, animated decorative
// overlays). Triggered by old iOS Safari, weak hardware, OR a slow
// network — any one of those is reason enough to render the simplest
// possible scene so the page stops hanging.
export const isLowPower = isOldSafari || isWeakHw || isSlowNet
