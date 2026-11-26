import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

export interface SoupSplashHandle {
  splash: (clientX?: number, clientY?: number) => void
}

interface FluidBlob {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  life: number
  maxLife: number
  color: string
  highlight: string
  isMicro: boolean
}

interface SurfaceRipple {
  x: number
  y: number
  radiusX: number
  radiusY: number
  life: number
  maxLife: number
}

const MAX_BLOBS = 140
const MAX_RIPPLES = 8

// Warm creamy mushroom-stew colors sampled from the bowl
const FLUID_COLORS = [
  { body: '#fce6d8', highlight: '#fff8f2' },
  { body: '#f5ccb8', highlight: '#ffefe3' },
  { body: '#ebb3a5', highlight: '#fce0d6' },
  { body: '#f8d9c4', highlight: '#fff4ea' },
] as const

export const SoupSplashCanvas = forwardRef<SoupSplashHandle>(
  function SoupSplashCanvas(_, ref) {
    const gooCanvasRef = useRef<HTMLCanvasElement>(null)
    const detailCanvasRef = useRef<HTMLCanvasElement>(null)
    const blobsRef = useRef<FluidBlob[]>([])
    const ripplesRef = useRef<SurfaceRipple[]>([])
    const rafRef = useRef<number | null>(null)
    const lastTimeRef = useRef<number>(0)

    const stopLoop = () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }

    const syncCanvas = (canvas: HTMLCanvasElement, dpr: number) => {
      const rect = canvas.getBoundingClientRect()
      const w = Math.round(rect.width * dpr)
      const h = Math.round(rect.height * dpr)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      return rect
    }

    const drawFrame = (now: number) => {
      const gooCanvas = gooCanvasRef.current
      const detailCanvas = detailCanvasRef.current
      if (!gooCanvas || !detailCanvas) {
        stopLoop()
        return
      }
      const gooCtx = gooCanvas.getContext('2d')
      const detailCtx = detailCanvas.getContext('2d')
      if (!gooCtx || !detailCtx) {
        stopLoop()
        return
      }

      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.035)
      lastTimeRef.current = now

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = syncCanvas(gooCanvas, dpr)
      syncCanvas(detailCanvas, dpr)

      gooCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      gooCtx.clearRect(0, 0, rect.width, rect.height)

      detailCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      detailCtx.clearRect(0, 0, rect.width, rect.height)

      const blobs = blobsRef.current
      const ripples = ripplesRef.current

      // 1. Expanding creamy surface ripple ring where the click landed
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]
        r.life += dt
        if (r.life >= r.maxLife) {
          ripples.splice(i, 1)
          continue
        }
        const t = r.life / r.maxLife
        const easeOut = 1 - Math.pow(1 - t, 3)
        const alpha = (1 - t) * 0.45

        detailCtx.save()
        detailCtx.beginPath()
        detailCtx.ellipse(
          r.x,
          r.y,
          r.radiusX * (0.25 + easeOut * 0.85),
          r.radiusY * (0.25 + easeOut * 0.85),
          0,
          0,
          Math.PI * 2,
        )
        detailCtx.strokeStyle = `rgba(255, 240, 228, ${alpha.toFixed(3)})`
        detailCtx.lineWidth = Math.max(1, 2.4 * (1 - t))
        detailCtx.stroke()
        detailCtx.restore()
      }

      // 2. Fluid blobs: main viscous droplets go to gooCanvas (metaball fusion),
      //    glossy specular glints + fine micro-spray go to detailCanvas
      const gravity = 580
      for (let i = blobs.length - 1; i >= 0; i--) {
        const b = blobs[i]
        b.life += dt
        if (b.life >= b.maxLife) {
          blobs.splice(i, 1)
          continue
        }

        b.vy += gravity * dt
        b.vx *= 0.988
        b.x += b.vx * dt
        b.y += b.vy * dt

        const progress = b.life / b.maxLife
        // Smooth organic growth at birth and smooth shrink at end
        const birthScale = progress < 0.08 ? 0.45 + (progress / 0.08) * 0.55 : 1
        const shrinkScale =
          progress > 0.58 ? Math.max(0, 1 - (progress - 0.58) / 0.42) : 1
        const r = b.radius * birthScale * shrinkScale
        if (r < 0.7) continue

        // Subtle velocity stretch along trajectory for fluid teardrop motion
        const speed = Math.hypot(b.vx, b.vy)
        const angle = Math.atan2(b.vy, b.vx)
        const stretch = 1 + Math.min(speed / 520, 0.52)
        const squash = 1 / Math.sqrt(stretch)

        if (!b.isMicro) {
          gooCtx.save()
          gooCtx.translate(b.x, b.y)
          gooCtx.rotate(angle)
          gooCtx.scale(stretch, squash)

          const grad = gooCtx.createRadialGradient(
            -r * 0.25,
            -r * 0.25,
            r * 0.1,
            0,
            0,
            r,
          )
          grad.addColorStop(0, b.highlight)
          grad.addColorStop(0.65, b.color)
          grad.addColorStop(1, '#cf8876')

          gooCtx.beginPath()
          gooCtx.arc(0, 0, r, 0, Math.PI * 2)
          gooCtx.fillStyle = grad
          gooCtx.fill()
          gooCtx.restore()

          // Crisp glossy highlight bead on detail layer (gives wet liquid sheen)
          if (r > 3.2 && progress < 0.78) {
            detailCtx.save()
            detailCtx.globalAlpha = (1 - progress) * 0.65
            detailCtx.fillStyle = '#fffaf5'
            detailCtx.beginPath()
            detailCtx.arc(b.x - r * 0.26, b.y - r * 0.28, r * 0.24, 0, Math.PI * 2)
            detailCtx.fill()
            detailCtx.restore()
          }
        } else {
          // Fine detached mist droplets
          detailCtx.save()
          detailCtx.translate(b.x, b.y)
          detailCtx.rotate(angle)
          detailCtx.scale(stretch, squash)
          detailCtx.globalAlpha = shrinkScale * 0.9
          detailCtx.fillStyle = b.highlight
          detailCtx.beginPath()
          detailCtx.arc(0, 0, r, 0, Math.PI * 2)
          detailCtx.fill()
          detailCtx.restore()
        }
      }

      if (blobs.length > 0 || ripples.length > 0) {
        rafRef.current = window.requestAnimationFrame(drawFrame)
      } else {
        gooCtx.clearRect(0, 0, rect.width, rect.height)
        detailCtx.clearRect(0, 0, rect.width, rect.height)
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
        const canvas = gooCanvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()

        // Default liquid center of the soup bowl
        const centerX = rect.width * 0.5
        const centerY = rect.height * 0.56

        // Bias splash origin toward actual click position, clamped inside the creamy stew ellipse
        let originX = centerX + (Math.random() - 0.5) * (rect.width * 0.16)
        let originY = centerY + (Math.random() - 0.5) * 6
        if (typeof clientX === 'number' && typeof clientY === 'number') {
          const localX = clientX - rect.left
          const localY = clientY - rect.top
          const dx = Math.max(-rect.width * 0.18, Math.min(rect.width * 0.18, localX - centerX))
          const dy = Math.max(-12, Math.min(12, localY - centerY))
          originX = centerX + dx * 0.85
          originY = centerY + dy * 0.5
        }

        // Surface ripple at impact point
        const ripples = ripplesRef.current
        if (ripples.length >= MAX_RIPPLES) ripples.shift()
        ripples.push({
          x: originX,
          y: originY + 2,
          radiusX: 34 + Math.random() * 14,
          radiusY: 11 + Math.random() * 4,
          life: 0,
          maxLife: 0.48,
        })

        const blobs = blobsRef.current

        // A) Organic base liquid crown (slower, larger blobs that fuse via metaball filter)
        const crownCount = 12
        for (let i = 0; i < crownCount; i++) {
          if (blobs.length >= MAX_BLOBS) blobs.shift()
          const palette =
            FLUID_COLORS[Math.floor(Math.random() * FLUID_COLORS.length)]
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.55
          const speed = 75 + Math.random() * 115
          blobs.push({
            x: originX + (Math.random() - 0.5) * 28,
            y: originY + (Math.random() - 0.5) * 6,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 7.5 + Math.random() * 6,
            life: 0,
            maxLife: 0.42 + Math.random() * 0.22,
            color: palette.body,
            highlight: palette.highlight,
            isMicro: false,
          })
        }

        // B) Mid-height fluid jets & separating droplets (pinch off from the crown)
        const jetCount = 14
        for (let i = 0; i < jetCount; i++) {
          if (blobs.length >= MAX_BLOBS) blobs.shift()
          const palette =
            FLUID_COLORS[Math.floor(Math.random() * FLUID_COLORS.length)]
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.35
          const speed = 175 + Math.random() * 170
          blobs.push({
            x: originX + (Math.random() - 0.5) * 22,
            y: originY + (Math.random() - 0.5) * 6,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 4.5 + Math.random() * 4.5,
            life: 0,
            maxLife: 0.58 + Math.random() * 0.3,
            color: palette.body,
            highlight: palette.highlight,
            isMicro: false,
          })
        }

        // C) Fine glossy spray droplets flying highest
        const microCount = 10
        for (let i = 0; i < microCount; i++) {
          if (blobs.length >= MAX_BLOBS) blobs.shift()
          const palette =
            FLUID_COLORS[Math.floor(Math.random() * FLUID_COLORS.length)]
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6
          const speed = 210 + Math.random() * 165
          blobs.push({
            x: originX + (Math.random() - 0.5) * 24,
            y: originY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 1.6 + Math.random() * 2,
            life: 0,
            maxLife: 0.52 + Math.random() * 0.34,
            color: palette.body,
            highlight: palette.highlight,
            isMicro: true,
          })
        }

        startLoop()
      },
    }))

    useEffect(() => stopLoop, [])

    return (
      <>
        {/* SVG metaball gooey filter so overlapping droplets fuse & pinch like real creamy soup */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute h-0 w-0 overflow-hidden"
        >
          <defs>
            <filter id="soup-goo">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"
                result="goo"
              />
              <feComposite in="SourceGraphic" in2="goo" operator="atop" />
            </filter>
          </defs>
        </svg>

        {/* Layer 1: Fused organic creamy liquid body */}
        <canvas
          ref={gooCanvasRef}
          aria-hidden="true"
          style={{ filter: 'url(#soup-goo)' }}
          className="pointer-events-none absolute -top-24 left-1/2 z-20 h-[260px] w-[320px] -translate-x-1/2 sm:-top-28 sm:h-[300px] sm:w-[380px] lg:-top-32 lg:h-[330px] lg:w-[420px]"
        />

        {/* Layer 2: Crisp surface ripples, wet specular glints & fine spray */}
        <canvas
          ref={detailCanvasRef}
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 z-20 h-[260px] w-[320px] -translate-x-1/2 sm:-top-28 sm:h-[300px] sm:w-[380px] lg:-top-32 lg:h-[330px] lg:w-[420px]"
        />
      </>
    )
  },
)
