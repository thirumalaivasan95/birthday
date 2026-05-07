import { useState } from 'react'

/**
 * Lightweight image with skeleton + lazy loading.
 * No tilt or animation here — wrap in <TiltCard> or motion.div if needed.
 */
export default function Photo({
  src,
  alt = '',
  className = '',
  imgClassName = '',
  eager = false,
}) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className={`relative overflow-hidden bg-ink-800 ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-[linear-gradient(110deg,rgba(255,255,255,0.04)_8%,rgba(255,255,255,0.10)_18%,rgba(255,255,255,0.04)_33%)] bg-[length:200%_100%]" />
      )}
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-[opacity,transform] duration-700 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${imgClassName}`}
      />
    </div>
  )
}
