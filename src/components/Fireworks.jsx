import { useEffect, useRef } from 'react'

// Realistic canvas fireworks:
//   - Rockets ascend with luminous trails, then explode at apex
//   - Particles obey gravity, friction, and individual decay
//   - Multiple burst types: peony (full sphere), ring (perfect circle),
//     willow (slow falling), chrysanthemum (dense + sparkles)
//   - Additive blending + motion blur for that camera-shutter glow
//   - Adapts to display DPR and viewport size
//
// Use:
//   <Fireworks active intensity={2.5} duration={5000} />
//
// Props:
//   active     bool   spawn new rockets while true (default true)
//   intensity  num    rockets per second (default 1.5)
//   duration   num    ms after which spawning stops (null = forever)
//   bgColor    str    motion-blur fill applied each frame; null = transparent

const PALETTES_HUE = [340, 0, 50, 290, 200, 30, 320, 15] // rose, gold, lavender, blue, orange...

function rand(a, b) {
  return a + Math.random() * (b - a)
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

class Rocket {
  constructor(x, targetY, hue, height) {
    this.x = x
    this.y = height
    this.startY = height
    this.targetY = targetY
    this.vx = rand(-1.4, 1.4)
    this.vy = -rand(8, 11)
    this.hue = hue
    this.trail = []
    this.exploded = false
    this.life = 0
  }
  update() {
    this.life++
    this.trail.push({ x: this.x, y: this.y })
    if (this.trail.length > 10) this.trail.shift()
    this.x += this.vx
    this.y += this.vy
    this.vy += 0.18 // gravity slows ascent
    if (this.vy >= -1 || this.y <= this.targetY) this.exploded = true
  }
  draw(ctx) {
    // Trail
    for (let i = 0; i < this.trail.length; i++) {
      const p = this.trail[i]
      const a = (i / this.trail.length) * 0.7
      ctx.fillStyle = `hsla(${this.hue}, 100%, 75%, ${a})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, 1.2 + (i / this.trail.length) * 1.8, 0, Math.PI * 2)
      ctx.fill()
    }
    // Glowing head
    const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, 8)
    grd.addColorStop(0, `hsla(${this.hue}, 100%, 95%, 1)`)
    grd.addColorStop(0.4, `hsla(${this.hue}, 100%, 70%, 0.8)`)
    grd.addColorStop(1, `hsla(${this.hue}, 100%, 50%, 0)`)
    ctx.fillStyle = grd
    ctx.beginPath()
    ctx.arc(this.x, this.y, 8, 0, Math.PI * 2)
    ctx.fill()
  }
}

class Particle {
  constructor(x, y, hue, type, baseSpeed) {
    this.x = x
    this.y = y
    const angle = Math.random() * Math.PI * 2

    // Type-specific velocity profile
    let speed
    if (type === 'ring') speed = baseSpeed * (0.95 + Math.random() * 0.15)
    else if (type === 'willow') speed = baseSpeed * (0.4 + Math.random() * 0.6)
    else speed = baseSpeed * Math.random() // peony / chrysanthemum

    this.vx = Math.cos(angle) * speed
    this.vy = Math.sin(angle) * speed
    this.hue = hue + rand(-15, 15)
    this.brightness = rand(55, 80)
    this.alpha = 1
    this.trail = []
    this.size = rand(1.4, 2.4)

    if (type === 'willow') {
      this.gravity = 0.085
      this.friction = 0.94
      this.decay = rand(0.004, 0.008) // slow fade
    } else if (type === 'chrysanthemum') {
      this.gravity = 0.05
      this.friction = 0.97
      this.decay = rand(0.008, 0.014)
      this.twinkle = true
    } else {
      this.gravity = 0.05
      this.friction = 0.96
      this.decay = rand(0.008, 0.018)
    }
  }
  update() {
    this.trail.push({ x: this.x, y: this.y, alpha: this.alpha })
    if (this.trail.length > 4) this.trail.shift()
    this.vx *= this.friction
    this.vy *= this.friction
    this.vy += this.gravity
    this.x += this.vx
    this.y += this.vy
    this.alpha -= this.decay
  }
  draw(ctx) {
    if (this.alpha <= 0) return
    // Tail
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i]
      const a = (i / this.trail.length) * t.alpha * 0.6
      ctx.fillStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${a})`
      ctx.beginPath()
      ctx.arc(t.x, t.y, this.size * 0.6, 0, Math.PI * 2)
      ctx.fill()
    }
    // Head — soft halo + bright core
    const a = this.alpha
    ctx.fillStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${a * 0.55})`
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size * 2.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = `hsla(${this.hue}, 100%, ${Math.min(95, this.brightness + 20)}%, ${a})`
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fill()
    // Twinkle (chrysanthemum + occasional general)
    if ((this.twinkle && Math.random() < 0.06) || Math.random() < 0.01) {
      ctx.fillStyle = `hsla(0, 0%, 100%, ${a})`
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

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
    const dpr = Math.min(window.devicePixelRatio || 1, 2)

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
    let raf
    let alive = true
    const start = performance.now()
    let lastSpawn = 0

    function explode(x, y, hue) {
      const type = pick(['peony', 'peony', 'peony', 'ring', 'willow', 'chrysanthemum'])
      const baseSpeed = type === 'ring' ? 5.2 : 5.5
      let count
      if (type === 'ring') count = 70
      else if (type === 'willow') count = 100
      else if (type === 'chrysanthemum') count = 130
      else count = 90 + Math.floor(Math.random() * 40)

      for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, hue, type, baseSpeed))
      }

      // Bright flash on detonation
      const grd = ctx.createRadialGradient(x, y, 0, x, y, 80)
      grd.addColorStop(0, `hsla(${hue}, 100%, 90%, 0.6)`)
      grd.addColorStop(0.4, `hsla(${hue}, 100%, 70%, 0.18)`)
      grd.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`)
      ctx.fillStyle = grd
      ctx.beginPath()
      ctx.arc(x, y, 80, 0, Math.PI * 2)
      ctx.fill()
    }

    function loop(now) {
      if (!alive) return

      // Motion blur trail (fade prior frame)
      if (bgColor) {
        ctx.globalCompositeOperation = 'source-over'
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, w, h)
      } else {
        ctx.clearRect(0, 0, w, h)
      }

      // Spawn rockets while active and within duration
      const elapsed = now - start
      const allowSpawn = active && (!duration || elapsed < duration)
      if (allowSpawn) {
        const spawnInterval = 1000 / intensity
        if (now - lastSpawn > spawnInterval + rand(-150, 150)) {
          lastSpawn = now
          const x = w * rand(0.12, 0.88)
          const targetY = h * rand(0.12, 0.42)
          const hue = pick(PALETTES_HUE)
          rockets.push(new Rocket(x, targetY, hue, h))
        }
      }

      ctx.globalCompositeOperation = 'lighter'

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

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.update()
        p.draw(ctx)
        if (p.alpha <= 0 || p.y > h + 40) particles.splice(i, 1)
      }

      ctx.globalCompositeOperation = 'source-over'

      raf = requestAnimationFrame(loop)
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
