import { useEffect, useRef, useState } from 'react'
import { isLowPower as IS_LOW_POWER } from '../utils/device.js'

// One image component, three jobs:
//
//   1. Show the WHOLE picture without cropping faces (`fit="contain"` — the
//      photo sits inside the frame, and a blurred copy fills the letterbox
//      area like the iOS Music / Apple TV poster effect).
//   2. Lazy-load via IntersectionObserver — the network only fetches images
//      as the user scrolls toward them. Critical above-the-fold images
//      should pass `eager` so they preload.
//   3. Use the responsive srcset built by scripts/optimize-images.mjs when
//      available (smaller files for mobile, biggest only for desktop).
//
// Props:
//   src         original full-size /images/foo.jpg path
//   srcSet      optional pre-built srcset string ("foo-400.webp 400w, ...")
//   sizes       sizes attribute (default sensible)
//   alt
//   fit         'contain' (default — no crop) | 'cover' (crop, focus-aware)
//   focusY      0-100, only used when fit='cover' (default 28 for selfies)
//   eager       skip lazy-load (use for hero / above-the-fold)
//   className
//   imgClassName
//   children    appears layered on top (use for captions / overlays)

export default function SmartPhoto({
  src,
  srcSet,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 50vw',
  alt = '',
  fit = 'contain',
  focusY = 28,
  eager = false,
  className = '',
  imgClassName = '',
  children,
}) {
  const [loaded, setLoaded] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(eager)
  const ref = useRef(null)

  useEffect(() => {
    if (eager || shouldLoad) return
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true)
      return
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true)
          obs.disconnect()
        }
      },
      // Start fetching ~1 viewport ahead so the user rarely sees a blank tile.
      { rootMargin: '600px 0px' },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [eager, shouldLoad])

  const objectStyle =
    fit === 'cover'
      ? { objectFit: 'cover', objectPosition: `center ${focusY}%` }
      : { objectFit: 'contain' }

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Skeleton shimmer while waiting / loading */}
      {!loaded && (
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.04)_8%,rgba(255,255,255,0.10)_18%,rgba(255,255,255,0.04)_33%)] bg-[length:200%_100%] animate-pulse" />
      )}

      {/* Blurred backdrop fills the letterbox area on contain-fit photos.
          On old iOS Safari this is the single biggest cost per photo (it
          decodes the full image a second time and runs a 28px blur on
          every paint) — fall back to a flat warm tint there. */}
      {shouldLoad && fit === 'contain' && !IS_LOW_POWER && (
        <>
          <img
            src={src}
            alt=""
            aria-hidden
            draggable={false}
            onDragStart={(e) => e.preventDefault()}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-60' : 'opacity-0'}`}
            style={{ filter: 'blur(28px) saturate(1.2)', transform: 'scale(1.15)' }}
          />
          <div className="absolute inset-0 bg-ink-900/25" />
        </>
      )}
      {shouldLoad && fit === 'contain' && IS_LOW_POWER && (
        <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-ink-900/95 to-rose-900/40" />
      )}

      {shouldLoad && (
        <img
          src={src}
          {...(srcSet ? { srcSet, sizes } : {})}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          fetchPriority={eager ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          className={`relative h-full w-full transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'} ${imgClassName}`}
          style={objectStyle}
        />
      )}

      {children}
    </div>
  )
}
