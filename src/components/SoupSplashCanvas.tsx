import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

export interface SoupSplashHandle {
  splash: (clientX?: number, clientY?: number) => void
}

interface FluidParticle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  life: number
  maxLife: number
  warmth: number // 0 = creamy ivory, 1 = rosy mushroom tint
}

interface PixelSpark {
  x: number
  y: number
  vx: number
  vy: number
  size: number // 1 or 2 grid pixels
  life: number
  maxLife: number
  r: number
  g: number
  b: number
}

// Crisp Minecraft-scale pixel grid (upscaled with nearest-neighbor -> ~4px per voxel)
const GRID_W = 96
const GRID_H = 76
const MAX_PARTICLES = 120
const MAX_SPARKS = 60

export const SoupSplashCanvas = forwardRef<SoupSplashHandle>(
  function SoupSplashCanvas(_, ref) {
    const displayCanvasRef = useRef<HTMLCanvasElement>(null)
    const offscreenRef = useRef<HTMLCanvasElement | null>(null)
    const imageDataRef = useRef<ImageData | null>(null)
    const fieldRef = useRef<Float32Array>(new Float32Array(GRID_W * GRID_H))
    const warmthFieldRef = useRef<Float32Array>(new Float32Array(GRID_W * GRID_H))

    const particlesRef = useRef<FluidParticle[]>([])
    const sparksRef = useRef<PixelSpark[]>([])
    const rafRef = useRef<number | null>(null)
    const lastTimeRef = useRef<number>(0)

    const stopLoop = () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }

    const ensureOffscreen = () => {
      if (!offscreenRef.current) {
        const c = document.createElement('canvas')
        c.width = GRID_W
        c.height = GRID_H
        offscreenRef.current = c
        const ctx = c.getContext('2d')
        if (ctx) {
          imageDataRef.current = ctx.createImageData(GRID_W, GRID_H)
        }
      }
      return offscreenRef.current
    }

    const drawFrame = (now: number) => {
      const displayCanvas = displayCanvasRef.current
      if (!displayCanvas) {
        stopLoop()
        return
      }
      const displayCtx = displayCanvas.getContext('2d')
      if (!displayCtx) {
        stopLoop()
        return
      }

      const offscreen = ensureOffscreen()
      const offCtx = offscreen.getContext('2d')
      const imgData = imageDataRef.current
      if (!offCtx || !imgData) {
        stopLoop()
        return
      }

      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.035)
      lastTimeRef.current = now

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = displayCanvas.getBoundingClientRect()
      const targetW = Math.round(rect.width * dpr)
      const targetH = Math.round(rect.height * dpr)
      if (displayCanvas.width !== targetW || displayCanvas.height !== targetH) {
        displayCanvas.width = targetW
        displayCanvas.height = targetH
      }

      const particles = particlesRef.current
      const sparks = sparksRef.current
      const field = fieldRef.current
      const warmthField = warmthFieldRef.current
      field.fill(0)
      warmthField.fill(0)

      // 1. Step ballistic fluid particles in grid coordinates
      const gravity = 158
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.life += dt
        if (p.life >= p.maxLife) {
          particles.splice(i, 1)
          continue
        }

        p.vy += gravity * dt
        p.vx *= 0.986
        p.x += p.vx * dt
        p.y += p.vy * dt

        const progress = p.life / p.maxLife
        const birth = progress < 0.08 ? 0.5 + (progress / 0.08) * 0.5 : 1
        const decay =
          progress > 0.56 ? Math.max(0, 1 - (progress - 0.56) / 0.44) : 1
        const r = p.radius * birth * decay
        if (r < 0.55) continue

        // Accumulate smooth inverse-square metaball field into local bounding box
        const r2 = r * r
        const reach = Math.ceil(r * 2.35)
        const minX = Math.max(0, Math.floor(p.x - reach))
        const maxX = Math.min(GRID_W - 1, Math.ceil(p.x + reach))
        const minY = Math.max(0, Math.floor(p.y - reach))
        const maxY = Math.min(GRID_H - 1, Math.ceil(p.y + reach))

        for (let gy = minY; gy <= maxY; gy++) {
          const dy = gy - p.y
          const dy2 = dy * dy
          const rowOffset = gy * GRID_W
          for (let gx = minX; gx <= maxX; gx++) {
            const dx = gx - p.x
            const d2 = dx * dx + dy2
            if (d2 < 0.001) {
              field[rowOffset + gx] += 8
              warmthField[rowOffset + gx] += 8 * p.warmth
            } else {
              const contrib = r2 / d2
              if (contrib > 0.08) {
                field[rowOffset + gx] += contrib
                warmthField[rowOffset + gx] += contrib * p.warmth
              }
            }
          }
        }
      }

      // 2. Rasterize metaball field into crisp pixel-art shaded mushroom stew
      const data = imgData.data
      data.fill(0)

      const THRESHOLD = 1.0
      for (let gy = 0; gy < GRID_H; gy++) {
        const rowOffset = gy * GRID_W
        for (let gx = 0; gx < GRID_W; gx++) {
          const idx = rowOffset + gx
          const val = field[idx]
          if (val < THRESHOLD) continue

          const px = idx * 4
          const above = gy > 0 ? field[idx - GRID_W] : 0
          const below = gy < GRID_H - 1 ? field[idx + GRID_W] : 0
          const left = gx > 0 ? field[idx - 1] : 0
          const right = gx < GRID_W - 1 ? field[idx + 1] : 0

          const w = Math.min(1, warmthField[idx] / val)

          // Pixel-art cel-shading matching the 3D soup bowl lighting (top-left lit, warm bottom bevel)
          if (below < THRESHOLD) {
            // Crisp dark toasted bottom-edge voxel shadow
            data[px] = Math.round(166 - w * 22)
            data[px + 1] = Math.round(102 - w * 20)
            data[px + 2] = Math.round(82 - w * 14)
            data[px + 3] = 255
          } else if (above < THRESHOLD || (left < THRESHOLD && val < 2.2)) {
            // Crisp bright creamy top-edge specular highlight
            data[px] = 255
            data[px + 1] = Math.round(244 - w * 10)
            data[px + 2] = Math.round(234 - w * 14)
            data[px + 3] = 255
          } else if (right < THRESHOLD) {
            // Subtle warm right rim
            data[px] = Math.round(224 - w * 14)
            data[px + 1] = Math.round(168 - w * 22)
            data[px + 2] = Math.round(150 - w * 18)
            data[px + 3] = 255
          } else if (val > 2.3) {
            // Inner creamy stew core
            data[px] = 253
            data[px + 1] = Math.round(231 - w * 18)
            data[px + 2] = Math.round(216 - w * 22)
            data[px + 3] = 255
          } else {
            // Mid mushroom-stew tone
            data[px] = Math.round(244 - w * 10)
            data[px + 1] = Math.round(206 - w * 28)
            data[px + 2] = Math.round(189 - w * 24)
            data[px + 3] = 255
          }
        }
      }

      // 3. Draw crisp detached 1px / 2px Minecraft spray pixels
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i]
        s.life += dt
        if (s.life >= s.maxLife) {
          sparks.splice(i, 1)
          continue
        }
        s.vy += gravity * 0.92 * dt
        s.vx *= 0.99
        s.x += s.vx * dt
        s.y += s.vy * dt

        const progress = s.life / s.maxLife
        const alpha =
          progress > 0.62 ? Math.round(((1 - progress) / 0.38) * 255) : 255
        if (alpha <= 8) continue

        const gx = Math.round(s.x)
        const gy = Math.round(s.y)
        for (let oy = 0; oy < s.size; oy++) {
          for (let ox = 0; ox < s.size; ox++) {
            const pxX = gx + ox
            const pxY = gy + oy
            if (pxX < 0 || pxX >= GRID_W || pxY < 0 || pxY >= GRID_H) continue
            const pIdx = (pxY * GRID_W + pxX) * 4
            if (data[pIdx + 3] === 0) {
              const isShadow = oy === s.size - 1 && s.size > 1
              data[pIdx] = isShadow ? Math.round(s.r * 0.72) : s.r
              data[pIdx + 1] = isShadow ? Math.round(s.g * 0.65) : s.g
              data[pIdx + 2] = isShadow ? Math.round(s.b * 0.65) : s.b
              data[pIdx + 3] = alpha
            }
          }
        }
      }

      offCtx.putImageData(imgData, 0, 0)

      // 4. Nearest-neighbor upscale onto HiDPI display canvas -> razor-sharp Minecraft pixels
      displayCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      displayCtx.clearRect(0, 0, rect.width, rect.height)
      displayCtx.imageSmoothingEnabled = false
      displayCtx.drawImage(offscreen, 0, 0, rect.width, rect.height)

      if (particles.length > 0 || sparks.length > 0) {
        rafRef.current = window.requestAnimationFrame(drawFrame)
      } else {
        displayCtx.clearRect(0, 0, rect.width, rect.height)
        rafRef.current = null
      }
    }

    const startLoop = () => {
      if (rafRef.current !== null) return
      lastTimeRef.current = performance.now()
      rafRef.current = window.requestAnimationFrame(drawFrame)
    }

    useImperativeHandle(ref, () => ({
      splash(clientX?: number, clientY?: number) {
        const canvas = displayCanvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()

        // Soup creamy liquid center in grid coordinates
        const centerX = GRID_W * 0.5
        const centerY = GRID_H * 0.58

        let originX = centerX + (Math.random() - 0.5) * 14
        let originY = centerY + (Math.random() - 0.5) * 2
        if (typeof clientX === 'number' && typeof clientY === 'number') {
          const normX = (clientX - rect.left) / rect.width
          const normY = (clientY - rect.top) / rect.height
          const dx = Math.max(-16, Math.min(16, (normX - 0.5) * GRID_W))
          const dy = Math.max(-3, Math.min(3, (normY - 0.58) * GRID_H))
          originX = centerX + dx * 0.85
          originY = centerY + dy * 0.5
        }

        const particles = particlesRef.current

        // A) Base fused stew crown (merges into organic pixel-art splash arcs)
        for (let i = 0; i < 11; i++) {
          if (particles.length >= MAX_PARTICLES) particles.shift()
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.55
          const speed = 22 + Math.random() * 34
          particles.push({
            x: originX + (Math.random() - 0.5) * 8,
            y: originY + (Math.random() - 0.5) * 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 2.3 + Math.random() * 1.5,
            life: 0,
            maxLife: 0.4 + Math.random() * 0.22,
            warmth: Math.random() * 0.85,
          })
        }

        // B) Higher separating pixel-art liquid droplets (stretch & pinch off cleanly)
        for (let i = 0; i < 13; i++) {
          if (particles.length >= MAX_PARTICLES) particles.shift()
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.35
          const speed = 46 + Math.random() * 44
          particles.push({
            x: originX + (Math.random() - 0.5) * 6,
            y: originY + (Math.random() - 0.5) * 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 1.45 + Math.random() * 1.25,
            life: 0,
            maxLife: 0.55 + Math.random() * 0.28,
            warmth: Math.random(),
          })
        }

        // C) Crisp detached 1px/2px Minecraft spray cubes flying highest
        const sparks = sparksRef.current
        const sparkPalette: [number, number, number][] = [
          [255, 244, 232],
          [247, 212, 194],
          [232, 165, 155],
          [242, 190, 148],
        ]
        for (let i = 0; i < 12; i++) {
          if (sparks.length >= MAX_SPARKS) sparks.shift()
          const [r, g, b] =
            sparkPalette[Math.floor(Math.random() * sparkPalette.length)]
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.65
          const speed = 56 + Math.random() * 46
          sparks.push({
            x: originX + (Math.random() - 0.5) * 7,
            y: originY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() > 0.45 ? 2 : 1,
            life: 0,
            maxLife: 0.54 + Math.random() * 0.34,
            r,
            g,
            b,
          })
        }

        startLoop()
      },
    }))

    useEffect(() => stopLoop, [])

    return (
      <canvas
        ref={displayCanvasRef}
        aria-hidden="true"
        style={{ imageRendering: 'pixelated' }}
        className="pointer-events-none absolute -top-24 left-1/2 z-20 h-[260px] w-[328px] -translate-x-1/2 sm:-top-28 sm:h-[300px] sm:w-[378px] lg:-top-32 lg:h-[330px] lg:w-[416px]"
      />
    )
  },
)
