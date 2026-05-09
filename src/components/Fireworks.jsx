import { useEffect, useRef } from 'react'
import { isLowPower as IS_LOW_POWER, isMobile as IS_MOBILE } from '../utils/device.js'

// ── Realistic canvas fireworks v2 ──────────────────────────────
//
// Enhancements over v1:
//   • Colour-temperature fade: white-hot core → vivid hue → dim ember
//   • Secondary "crackle" sparks that pop off particles mid-flight
//   • Shockwave ring expands from each detonation point
//   • Smoke / ember after-trails that linger after particles die
//   • Per-particle wind drift for organic spread
//   • Flash pulse on detonation (screen-wide brightness bump)
//   • Star-pattern burst type added (crosshair rays)
//
// Performance:
//   • Low-power path: DPR=1, ~35% particles, no gradients/trails/smoke,
//     source-over blending, 30 fps cap
//   • Mobile path: DPR capped at 1.5, ~70% particles, lighter smoke
//   • Desktop: full quality at native DPR (max 2)

const PALETTES_HUE = [340, 0, 50, 290, 200, 30, 320, 15, 170, 60]

function rand(a, b) { return a + Math.random() * (b - a) }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v }
function lerp(a, b, t) { return a + (b - a) * t }

// ── Wind — gentle global drift that shifts slowly ──────────────
let windX = 0
let windTarget = 0
let windTimer = 0
function updateWind(now) {
  if (now - windTimer > 3000) {
    windTarget = rand(-0.35, 0.35)
    windTimer = now
  }
  windX += (windTarget - windX) * 0.01
}

// ── Rocket ─────────────────────────────────────────────────────
class Rocket {
  constructor(x, targetY, hue, height) {
    this.x = x
    this.y = height
    this.startY = height
    this.targetY = targetY
    this.vx = rand(-1.6, 1.6)
    this.vy = -rand(9, 12.5)
    this.hue = hue
    this.trail = []
    this.exploded = false
    this.life = 0
  }
  update() {
    this.life++
    this.trail.push({ x: this.x, y: this.y, a: 1 })
    const max = IS_LOW_POWER ? 4 : 12
    if (this.trail.length > max) this.trail.shift()
    // Fade older trail points
    for (let i = 0; i < this.trail.length; i++) {
      this.trail[i].a = (i / this.trail.length)
    }
    this.x += this.vx + windX * 0.3
    this.y += this.vy
    this.vy += 0.18
    if (this.vy >= -0.8 || this.y <= this.targetY) this.exploded = true
  }
  draw(ctx) {
    // Trail — glowing dots that taper
    for (let i = 0; i < this.trail.length; i++) {
      const p = this.trail[i]
      const a = p.a * 0.75
      const r = 1 + (i / this.trail.length) * 2
      ctx.fillStyle = `hsla(${this.hue}, 100%, 80%, ${a})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    // Head glow
    if (IS_LOW_POWER) {
      ctx.fillStyle = `hsla(${this.hue}, 100%, 85%, 1)`
      ctx.beginPath()
      ctx.arc(this.x, this.y, 3.5, 0, Math.PI * 2)
      ctx.fill()
    } else {
      const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 10)
      grd.addColorStop(0, `hsla(0, 0%, 100%, 1)`)
      grd.addColorStop(0.25, `hsla(${this.hue}, 100%, 90%, 0.9)`)
      grd.addColorStop(0.6, `hsla(${this.hue}, 100%, 65%, 0.5)`)
      grd.addColorStop(1, `hsla(${this.hue}, 100%, 50%, 0)`)
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.arc(this.x, this.y, 10, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

// ── Particle ───────────────────────────────────────────────────
class Particle {
  constructor(x, y, hue, type, baseSpeed) {
    this.x = x
    this.y = y
    this.ox = x
    this.oy = y
    const angle = Math.random() * Math.PI * 2

    let speed
    if (type === 'ring') speed = baseSpeed * (0.93 + Math.random() * 0.14)
    else if (type === 'willow') speed = baseSpeed * (0.35 + Math.random() * 0.65)
    else if (type === 'star') {
      // 5-pointed star rays — particles cluster near 5 angles
      const arm = Math.floor(Math.random() * 5)
      const armAngle = (arm / 5) * Math.PI * 2 + rand(-0.12, 0.12)
      this.vx = Math.cos(armAngle) * baseSpeed * (0.5 + Math.random() * 0.5)
      this.vy = Math.sin(armAngle) * baseSpeed * (0.5 + Math.random() * 0.5)
      speed = 0 // already set vx/vy
    } else speed = baseSpeed * Math.random()

    if (type !== 'star') {
      this.vx = Math.cos(angle) * speed
      this.vy = Math.sin(angle) * speed
    }

    this.hue = hue + rand(-18, 18)
    this.brightness = rand(60, 85)
    this.alpha = 1
    this.trail = []
    this.size = rand(1.3, 2.6)
    this.age = 0

    // Crackle: some particles will spawn tiny secondary sparks
    this.canCrackle = !IS_LOW_POWER && (type === 'chrysanthemum' || Math.random() < 0.15)
    this.crackled = false

    if (type === 'willow') {
      this.gravity = 0.09
      this.friction = 0.935
      this.decay = rand(0.003, 0.007)
    } else if (type === 'chrysanthemum') {
      this.gravity = 0.045
      this.friction = 0.972
      this.decay = rand(0.007, 0.013)
      this.twinkle = true
    } else if (type === 'star') {
      this.gravity = 0.04
      this.friction = 0.965
      this.decay = rand(0.009, 0.016)
    } else {
      this.gravity = 0.048
      this.friction = 0.962
      this.decay = rand(0.008, 0.017)
    }
  }
  update(crackleBuf) {
    this.age++
    if (!IS_LOW_POWER) {
      this.trail.push({ x: this.x, y: this.y, alpha: this.alpha })
      if (this.trail.length > 5) this.trail.shift()
    }
    this.vx *= this.friction
    this.vy *= this.friction
    this.vy += this.gravity
    this.vx += windX * 0.08
    this.x += this.vx
    this.y += this.vy
    this.alpha -= this.decay

    // Crackle: spawn micro sparks when particle is mid-life
    if (this.canCrackle && !this.crackled && this.alpha < 0.55 && this.alpha > 0.3 && Math.random() < 0.12) {
      this.crackled = true
      const n = Math.floor(rand(2, 5))
      for (let i = 0; i < n; i++) {
        crackleBuf.push(new Sparkle(this.x, this.y, this.hue))
      }
    }
  }
  draw(ctx) {
    if (this.alpha <= 0) return
    const a = clamp(this.alpha, 0, 1)
    // Color temperature: young particles are white-hot, mature ones show hue,
    // old ones dim to ember
    const lifeFrac = 1 - a
    const bri = lerp(95, Math.max(35, this.brightness - 15), lifeFrac)
    const sat = lerp(30, 100, clamp(lifeFrac * 2, 0, 1))

    if (IS_LOW_POWER) {
      ctx.fillStyle = `hsla(${this.hue}, ${sat}%, ${bri}%, ${a})`
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
      ctx.fill()
      return
    }
    // Tail
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i]
      const a2 = (i / this.trail.length) * t.alpha * 0.5
      ctx.fillStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${a2})`
      ctx.beginPath()
      ctx.arc(t.x, t.y, this.size * 0.55, 0, Math.PI * 2)
      ctx.fill()
    }
    // Outer halo — subtle, not blobby
    ctx.fillStyle = `hsla(${this.hue}, ${sat}%, ${bri - 10}%, ${a * 0.2})`
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size * 1.7, 0, Math.PI * 2)
    ctx.fill()
    // Bright core
    ctx.fillStyle = `hsla(${this.hue}, ${sat}%, ${bri}%, ${a})`
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
    // Hot white center when young
    if (lifeFrac < 0.3) {
      ctx.fillStyle = `hsla(0, 0%, 100%, ${a * (1 - lifeFrac / 0.3) * 0.7})`
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2)
      ctx.fill()
    }
    // Twinkle
    if ((this.twinkle && Math.random() < 0.07) || Math.random() < 0.012) {
      ctx.fillStyle = `hsla(0, 0%, 100%, ${a * 0.9})`
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size * 0.45, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

// ── Sparkle (crackle micro-spark) ──────────────────────────────
class Sparkle {
  constructor(x, y, hue) {
    this.x = x
    this.y = y
    const angle = Math.random() * Math.PI * 2
    const speed = rand(1.5, 4)
    this.vx = Math.cos(angle) * speed
    this.vy = Math.sin(angle) * speed
    this.hue = hue + rand(-25, 25)
    this.alpha = 1
    this.decay = rand(0.035, 0.065)
    this.size = rand(0.8, 1.4)
  }
  update() {
    this.vx *= 0.92
    this.vy *= 0.92
    this.vy += 0.06
    this.x += this.vx
    this.y += this.vy
    this.alpha -= this.decay
  }
  draw(ctx) {
    if (this.alpha <= 0) return
    ctx.fillStyle = `hsla(${this.hue}, 80%, 90%, ${this.alpha})`
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

// ── Shockwave ring — very subtle, fades fast ──────────────────
class Shockwave {
  constructor(x, y, hue) {
    this.x = x
    this.y = y
    this.hue = hue
    this.radius = 2
    this.maxRadius = rand(30, 55)
    this.alpha = 0.25
    this.speed = rand(2.5, 4)
  }
  update() {
    this.radius += this.speed
    this.speed *= 0.94
    this.alpha *= 0.88
  }
  draw(ctx) {
    if (this.alpha < 0.015) return
    ctx.strokeStyle = `hsla(${this.hue}, 60%, 75%, ${this.alpha})`
    ctx.lineWidth = 0.8
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.stroke()
  }
  get dead() { return this.alpha < 0.02 || this.radius > this.maxRadius }
}

// ── Smoke ember ────────────────────────────────────────────────
class Smoke {
  constructor(x, y, hue) {
    this.x = x
    this.y = y
    this.vx = rand(-0.3, 0.3)
    this.vy = rand(-0.6, -0.15)
    this.hue = hue
    this.alpha = rand(0.12, 0.25)
    this.decay = rand(0.001, 0.003)
    this.size = rand(3, 7)
  }
  update() {
    this.x += this.vx + windX * 0.2
    this.y += this.vy
    this.vy -= 0.003
    this.size += 0.15
    this.alpha -= this.decay
  }
  draw(ctx) {
    if (this.alpha <= 0) return
    ctx.fillStyle = `hsla(${this.hue}, 20%, 50%, ${this.alpha})`
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
  }
}

// ── Flash pulse (screen-wide brightness on detonation) ─────────
class Flash {
  constructor(x, y, hue, w, h) {
    this.x = x
    this.y = y
    this.hue = hue
    this.alpha = 0.15
    this.w = w
    this.h = h
  }
  update() { this.alpha *= 0.78 }
  draw(ctx) {
    if (this.alpha < 0.008) return
    const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, Math.max(this.w, this.h) * 0.3)
    grd.addColorStop(0, `hsla(${this.hue}, 100%, 92%, ${this.alpha})`)
    grd.addColorStop(0.3, `hsla(${this.hue}, 100%, 70%, ${this.alpha * 0.3})`)
    grd.addColorStop(1, `hsla(${this.hue}, 100%, 50%, 0)`)
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, this.w, this.h)
  }
  get dead() { return this.alpha < 0.008 }
}

// ── Main component ─────────────────────────────────────────────
export default function Fireworks({
  active = true,
  intensity = 1.5,
  duration = null,
  bgColor = 'rgba(20, 11, 19, 0.16)',
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      if (reduce) return
    }

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let w = 0
    let h = 0
    const dpr = IS_LOW_POWER ? 1 : IS_MOBILE ? Math.min(window.devicePixelRatio || 1, 1.5) : Math.min(window.devicePixelRatio || 1, 2)

    function resize() {
      const rect = canvas.getBoundingClientRect()
      w = rect.width
      h = rect.height
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const rockets = []
    const particles = []
    const sparkles = []
    const shockwaves = []
    const smokes = []
    const flashes = []
    let raf
    let alive = true
    const start = performance.now()
    let lastSpawn = 0
    let frameSkip = 0

    function explode(x, y, hue) {
      const types = ['peony', 'peony', 'peony', 'ring', 'willow', 'chrysanthemum', 'star']
      const type = pick(types)
      const baseSpeed = type === 'ring' ? 5.5 : type === 'star' ? 5.0 : 5.8
      let count
      if (type === 'ring') count = 75
      else if (type === 'willow') count = 110
      else if (type === 'chrysanthemum') count = 140
      else if (type === 'star') count = 80
      else count = 95 + Math.floor(Math.random() * 45)

      if (IS_LOW_POWER) count = Math.round(count * 0.20)
      else if (IS_MOBILE) count = Math.round(count * 0.40)

      for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, hue, type, baseSpeed))
      }

      // Hard cap — much tighter on mobile to prevent stacking
      const maxParticles = IS_LOW_POWER ? 120 : IS_MOBILE ? 280 : 900
      if (particles.length > maxParticles) {
        particles.splice(0, particles.length - maxParticles)
      }

      // Shockwave ring — desktop only (expensive stroke on mobile)
      if (!IS_LOW_POWER && !IS_MOBILE) {
        shockwaves.push(new Shockwave(x, y, hue))
      }

      // Flash pulse — desktop only (radial gradient per frame is costly)
      if (!IS_LOW_POWER && !IS_MOBILE) {
        flashes.push(new Flash(x, y, hue, w, h))
      }

      // Smoke embers — desktop only
      if (!IS_LOW_POWER && !IS_MOBILE) {
        const smokeCount = Math.floor(rand(4, 9))
        for (let i = 0; i < smokeCount; i++) {
          smokes.push(new Smoke(
            x + rand(-30, 30),
            y + rand(-20, 20),
            hue
          ))
        }
      }

      // Simple detonation flash — cheap fillStyle arc on mobile/low-power
      if (IS_LOW_POWER || IS_MOBILE) {
        ctx.fillStyle = `hsla(${hue}, 100%, 82%, 0.28)`
        ctx.beginPath()
        ctx.arc(x, y, 30, 0, Math.PI * 2)
        ctx.fill()
      } else {
        const grd = ctx.createRadialGradient(x, y, 0, x, y, 45)
        grd.addColorStop(0, `hsla(0, 0%, 100%, 0.45)`)
        grd.addColorStop(0.2, `hsla(${hue}, 100%, 88%, 0.25)`)
        grd.addColorStop(0.6, `hsla(${hue}, 100%, 65%, 0.06)`)
        grd.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`)
        ctx.fillStyle = grd
        ctx.beginPath()
        ctx.arc(x, y, 45, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    function loop(now) {
      if (!alive) return
      updateWind(now)

      // Motion blur
      if (bgColor) {
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, w, h)
      } else {
        ctx.clearRect(0, 0, w, h)
      }

      // Spawn rockets
      const elapsed = now - start
      const allowSpawn = active && (!duration || elapsed < duration)
      if (allowSpawn) {
        const spawnInterval = 1000 / intensity
        if (now - lastSpawn > spawnInterval + rand(-120, 120)) {
          lastSpawn = now
          const x = w * rand(0.05, 0.95)
          const targetY = h * rand(0.06, 0.58)
          const hue = pick(PALETTES_HUE)
          rockets.push(new Rocket(x, targetY, hue, h))

          // Cluster bursts — desktop only (doubles draw calls on mobile)
          if (!IS_LOW_POWER && !IS_MOBILE && Math.random() < 0.38) {
            rockets.push(
              new Rocket(
                clamp(x + rand(-w * 0.2, w * 0.2), w * 0.05, w * 0.95),
                h * rand(0.06, 0.52),
                pick(PALETTES_HUE),
                h,
              ),
            )
          }
        }
      }

      // lighter blend is a GPU compositing pass — very expensive on mobile.
      // source-over looks slightly different but won't hang the phone.
      ctx.globalCompositeOperation = (IS_LOW_POWER || IS_MOBILE) ? 'source-over' : 'lighter'

      // Smoke (below everything, source-over)
      if (smokes.length > 0) {
        ctx.globalCompositeOperation = 'source-over'
        for (let i = smokes.length - 1; i >= 0; i--) {
          smokes[i].update()
          smokes[i].draw(ctx)
          if (smokes[i].alpha <= 0) smokes.splice(i, 1)
        }
        if (smokes.length > 60) smokes.splice(0, smokes.length - 60)
        ctx.globalCompositeOperation = (IS_LOW_POWER || IS_MOBILE) ? 'source-over' : 'lighter'
      }

      // Shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        shockwaves[i].update()
        shockwaves[i].draw(ctx)
        if (shockwaves[i].dead) shockwaves.splice(i, 1)
      }

      // Rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i]
        r.update()
        r.draw(ctx)
        if (r.exploded) {
          explode(r.x, r.y, r.hue)
          rockets.splice(i, 1)
        }
      }

      // Particles (with crackle buffer)
      const crackleBuf = []
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.update(crackleBuf)
        p.draw(ctx)
        if (p.alpha <= 0 || p.y > h + 40) particles.splice(i, 1)
      }
      // Add crackle sparks
      for (let i = 0; i < crackleBuf.length; i++) sparkles.push(crackleBuf[i])

      // Sparkles
      for (let i = sparkles.length - 1; i >= 0; i--) {
        sparkles[i].update()
        sparkles[i].draw(ctx)
        if (sparkles[i].alpha <= 0) sparkles.splice(i, 1)
      }
      if (sparkles.length > 150) sparkles.splice(0, sparkles.length - 150)

      // Flash pulses (screen-wide)
      if (flashes.length > 0) {
        ctx.globalCompositeOperation = 'lighter'
        for (let i = flashes.length - 1; i >= 0; i--) {
          flashes[i].update()
          flashes[i].draw(ctx)
          if (flashes[i].dead) flashes.splice(i, 1)
        }
      }

      ctx.globalCompositeOperation = 'source-over'

      // Frame-rate cap: low-power=20fps (skip 2), mobile=24fps (skip ~2.5→alt),
      // desktop=uncapped.
      raf = requestAnimationFrame((t) => {
        if (IS_LOW_POWER) {
          frameSkip = (frameSkip + 1) % 3
          if (frameSkip !== 0) {
            raf = requestAnimationFrame(loop)
            return
          }
        } else if (IS_MOBILE) {
          frameSkip = (frameSkip + 1) % 2
          if (frameSkip === 1) {
            raf = requestAnimationFrame(loop)
            return
          }
        }
        loop(t)
      })
    }
    raf = requestAnimationFrame(loop)

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [active, intensity, duration, bgColor])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  )
}
