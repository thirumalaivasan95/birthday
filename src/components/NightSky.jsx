import { useId, useMemo } from 'react'

// Tranquil, full-bleed night sky:
//   - Deep gradient backdrop
//   - Twinkling stars (CSS-keyframed, GPU-cheap)
//   - Wispy clouds drifting at varied speeds (parallax depth)
//   - Optional moon: realistic disc — gradient, maria, craters,
//     surface noise, terminator shading, soft halo
//   - Optional shooting stars
//
// All pure SVG + CSS — zero network cost, GPRS-safe.

function rand(a, b) { return a + Math.random() * (b - a) }

export default function NightSky({
  withMoon = true,
  withShootingStars = true,
  starCount = 110,
  shootingStarCount = 5,
  cloudCount = 11,
  className = '',
}) {
  const stars = useMemo(
    () =>
      Array.from({ length: starCount }, () => ({
        x: rand(0, 100),
        y: rand(0, 92),
        size: rand(0.6, 2.4),
        delay: rand(0, 5),
        duration: rand(2.4, 5.5),
        min: rand(0.18, 0.45),
      })),
    [starCount],
  )

  const shootingStars = useMemo(
    () =>
      Array.from({ length: shootingStarCount }, (_, i) => ({
        delay: rand(i * 4, i * 4 + 6),
        startTop: rand(2, 50),
        startLeft: rand(-10, 75),
        travelX: rand(180, 320),
        travelY: rand(60, 160),
        duration: rand(0.9, 1.6),
        period: rand(11, 18),
        length: rand(80, 160),
      })),
    [shootingStarCount],
  )

  const clouds = useMemo(
    () =>
      Array.from({ length: cloudCount }, () => ({
        // Bias toward the upper half of the sky — that's where clouds live
        topPct: rand(2, 55),
        // Tiny → medium. Base of 10rem × scale 0.55-1.15 = 5.5-11.5 rem wide.
        scale: rand(0.55, 1.15),
        opacity: rand(0.14, 0.30),
        duration: rand(70, 160),  // slow drift, like real night clouds
        delay: rand(-130, 0),     // negative delay → cloud is mid-drift on load
        blur: rand(5, 12),
        startLeft: rand(-25, -8),
      })),
    [cloudCount],
  )

  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Deep night gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#1a0f1d_0%,#0a0612_55%,#050309_100%)]" />

      {/* Faint Milky-Way smear */}
      <div className="absolute -left-1/4 top-1/3 h-[40%] w-[150%] rotate-[-12deg] bg-[radial-gradient(ellipse,rgba(180,160,210,0.08)_0%,rgba(180,160,210,0.04)_40%,transparent_75%)] blur-2xl" />

      {/* Stars */}
      {stars.map((s, i) => (
        <span
          key={`star-${i}`}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            boxShadow: `0 0 ${s.size * 2.2}px rgba(255,255,255,0.6)`,
            opacity: s.min,
            animation: `twinkle ${s.duration}s ${s.delay}s infinite ease-in-out`,
            ['--star-min']: s.min,
          }}
        />
      ))}

      {/* Drifting clouds — wispy, semi-transparent, slow parallax */}
      {clouds.map((c, i) => (
        <Cloud key={`cloud-${i}`} cfg={c} index={i} />
      ))}

      {/* Shooting stars */}
      {withShootingStars &&
        shootingStars.map((s, i) => (
          <span
            key={`shoot-${i}`}
            className="absolute"
            style={{
              left: `${s.startLeft}%`,
              top: `${s.startTop}%`,
              width: `${s.length}px`,
              height: '2px',
              background:
                'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 30%, rgba(255,255,255,1) 90%, rgba(255,255,255,0.95) 100%)',
              filter:
                'drop-shadow(0 0 4px rgba(255,255,255,0.85)) drop-shadow(0 0 10px rgba(190,180,255,0.5))',
              transform: 'rotate(28deg)',
              transformOrigin: '100% 50%',
              opacity: 0,
              borderRadius: '999px',
              animation: `shoot-${i} ${s.period}s ${s.delay}s infinite ease-in`,
              ['--travel-x']: `${s.travelX}px`,
              ['--travel-y']: `${s.travelY}px`,
            }}
          />
        ))}

      {/* Moon */}
      {withMoon && <Moon />}

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: var(--star-min, 0.3); transform: scale(1); }
          50%      { opacity: 1;                   transform: scale(1.4); }
        }
        @keyframes moonHalo {
          0%, 100% { transform: scale(1);    opacity: 0.55; }
          50%      { transform: scale(1.06); opacity: 0.78; }
        }
        @keyframes cloudDrift {
          0%   { transform: translateX(-15vw); }
          100% { transform: translateX(140vw); }
        }
        ${shootingStars
          .map(
            (s, i) => `
          @keyframes shoot-${i} {
            0%   { opacity: 0; transform: rotate(28deg) translate(0, 0); }
            ${((1 / s.period) * 0.1 * 100).toFixed(2)}% { opacity: 1; }
            ${((s.duration / s.period) * 100).toFixed(2)}% {
              opacity: 0;
              transform: rotate(28deg) translate(${s.travelX}px, ${s.travelY}px);
            }
            100% {
              opacity: 0;
              transform: rotate(28deg) translate(${s.travelX}px, ${s.travelY}px);
            }
          }
        `,
          )
          .join('\n')}
      `}</style>
    </div>
  )
}

// A single drifting cloud — a wispy SVG with multiple soft circles, blurred
// and animated across the sky on a long, slow drift.
function Cloud({ cfg, index }) {
  return (
    <div
      className="absolute"
      style={{
        top: `${cfg.topPct}%`,
        left: `${cfg.startLeft}%`,
        // Tiny–medium clouds: 5.5 to 11.5 rem wide
        width: `${10 * cfg.scale}rem`,
        height: `${3.5 * cfg.scale}rem`,
        opacity: cfg.opacity,
        filter: `blur(${cfg.blur}px)`,
        animation: `cloudDrift ${cfg.duration}s linear ${cfg.delay}s infinite`,
        transformOrigin: 'center',
      }}
    >
      <svg viewBox="0 0 200 70" className="h-full w-full" preserveAspectRatio="none">
        <g fill="rgba(230, 220, 240, 1)">
          <ellipse cx="40"  cy="42" rx="28" ry="16" />
          <ellipse cx="80"  cy="32" rx="36" ry="20" opacity="0.95" />
          <ellipse cx="120" cy="36" rx="32" ry="18" opacity="0.9" />
          <ellipse cx="155" cy="46" rx="24" ry="14" opacity="0.85" />
          <ellipse cx="65"  cy="52" rx="26" ry="11" opacity="0.7" />
          <ellipse cx="110" cy="54" rx="28" ry="10" opacity="0.65" />
        </g>
      </svg>
    </div>
  )
}

// Realistic moon — gradient disc, maria (dark seas), craters of varied sizes,
// surface noise, terminator shading, soft halo. Exported separately so
// callers can render it ABOVE other layers (e.g. above a fireworks canvas)
// to keep it visible regardless of what's painted underneath.
export function Moon() {
  const noiseId = useId()
  return (
    <div
      className="absolute"
      style={{
        right: 'clamp(4%, 8vw, 12%)',
        top: 'clamp(5%, 7vh, 11%)',
        width: 'clamp(6rem, 16vw, 13rem)',
        height: 'clamp(6rem, 16vw, 13rem)',
      }}
    >
      {/* Outer halo — pulses gently */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(255,250,235,0.55) 0%, rgba(255,240,210,0.18) 35%, transparent 70%)',
          filter: 'blur(20px)',
          transform: 'scale(2.2)',
          animation: 'moonHalo 6s ease-in-out infinite',
        }}
      />

      {/* Moon disc */}
      <div
        className="absolute inset-0 overflow-hidden rounded-full"
        style={{
          boxShadow:
            'inset -16px -18px 34px rgba(0,0,0,0.5), inset 6px 8px 18px rgba(255,250,235,0.35), 0 0 70px rgba(255,250,235,0.4)',
        }}
      >
        {/* Base surface gradient */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 32% 28%, #fffaf0 0%, #f4e8d4 30%, #d8c8a8 65%, #8a7a5a 100%)',
          }}
        />

        {/* Maria — the large dark plains you see on the real Moon
            (Sea of Tranquility, Sea of Serenity etc.) */}
        <Maria x="38%" y="38%" w="42%" h="32%" rotate={-12} alpha={0.18} />
        <Maria x="55%" y="60%" w="32%" h="22%" rotate={20}  alpha={0.22} />
        <Maria x="20%" y="20%" w="22%" h="18%" rotate={5}   alpha={0.13} />
        <Maria x="62%" y="30%" w="20%" h="14%" rotate={-25} alpha={0.16} />

        {/* Craters — varied sizes for realism */}
        <Crater x="22%" y="28%" size="14%" intensity={0.45} />
        <Crater x="58%" y="62%" size="20%" intensity={0.30} />
        <Crater x="38%" y="55%" size="10%" intensity={0.40} />
        <Crater x="70%" y="32%" size="9%"  intensity={0.35} />
        <Crater x="46%" y="76%" size="7%"  intensity={0.38} />
        <Crater x="30%" y="70%" size="6%"  intensity={0.32} />
        <Crater x="78%" y="56%" size="6%"  intensity={0.28} />
        <Crater x="14%" y="48%" size="5%"  intensity={0.34} />
        <Crater x="48%" y="22%" size="4%"  intensity={0.30} />
        <Crater x="82%" y="74%" size="4%"  intensity={0.30} />
        <Crater x="26%" y="58%" size="3.5%" intensity={0.36} />
        <Crater x="64%" y="78%" size="3%"   intensity={0.30} />

        {/* Surface noise — adds texture / pores */}
        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full opacity-30 mix-blend-overlay"
          preserveAspectRatio="none"
        >
          <filter id={`noise-${noiseId}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" />
            <feColorMatrix values="0 0 0 0 0.4  0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0.6 0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#noise-${noiseId})`} />
        </svg>

        {/* Terminator shadow — biased toward bottom-right for depth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 78% 80%, rgba(40,28,16,0.5) 0%, transparent 55%)',
          }}
        />

        {/* Soft inner highlight from the upper-left (Sun side) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 26% 24%, rgba(255,250,235,0.35) 0%, transparent 42%)',
          }}
        />
      </div>

      {/* Three slow drifting cloud whispers IN FRONT of the moon — small,
          so they look like passing wisps rather than a cloud bank. */}
      <MoonCloud delay={-12} duration={48} top="32%" scale={0.9} opacity={0.30} />
      <MoonCloud delay={-30} duration={62} top="55%" scale={0.65} opacity={0.22} />
      <MoonCloud delay={-46} duration={75} top="20%" scale={0.8}  opacity={0.18} />
    </div>
  )
}

function MoonCloud({ delay, duration, top, scale, opacity }) {
  return (
    <div
      className="pointer-events-none absolute"
      style={{
        top,
        left: '-90%',
        // Tiny — slightly larger than the moon at most, so they veil rather than hide
        width: `${7 * scale}rem`,
        height: `${2.2 * scale}rem`,
        opacity,
        filter: 'blur(6px)',
        animation: `moonCloudDrift ${duration}s linear ${delay}s infinite`,
      }}
    >
      <svg viewBox="0 0 200 50" className="h-full w-full" preserveAspectRatio="none">
        <g fill="rgba(245, 240, 230, 1)">
          <ellipse cx="40"  cy="32" rx="30" ry="13" />
          <ellipse cx="90"  cy="22" rx="36" ry="17" />
          <ellipse cx="140" cy="28" rx="28" ry="13" />
          <ellipse cx="170" cy="34" rx="20" ry="10" opacity="0.8" />
        </g>
      </svg>
      <style>{`
        @keyframes moonCloudDrift {
          0%   { transform: translateX(0); }
          100% { transform: translateX(520%); }
        }
      `}</style>
    </div>
  )
}

function Maria({ x, y, w, h, rotate = 0, alpha = 0.18 }) {
  return (
    <span
      aria-hidden
      className="absolute"
      style={{
        left: x,
        top: y,
        width: w,
        height: h,
        transform: `rotate(${rotate}deg)`,
        background: `radial-gradient(ellipse, rgba(40,30,18,${alpha}) 0%, rgba(40,30,18,${alpha * 0.5}) 55%, transparent 80%)`,
        borderRadius: '50%',
        filter: 'blur(2px)',
      }}
    />
  )
}

function Crater({ x, y, size, intensity = 0.35 }) {
  return (
    <span
      aria-hidden
      className="absolute rounded-full"
      style={{
        left: x,
        top: y,
        width: size,
        height: size,
        background: `radial-gradient(circle, rgba(80,60,40,${intensity}) 0%, rgba(80,60,40,${intensity * 0.5}) 50%, transparent 70%)`,
        boxShadow: `inset 1px 1px 2px rgba(255,255,255,0.15)`,
      }}
    />
  )
}
