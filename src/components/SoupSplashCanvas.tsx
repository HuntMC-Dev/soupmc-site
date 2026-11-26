import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

export interface SoupSplashHandle {
  splash: (clientX?: number, clientY?: number) => void
}

interface CubeDroplet {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  topColor: string
  faceColor: string
  bottomColor: string
  rot: number
  vRot: number
}

const MAX_DROPLETS = 96

// Exact tones from the 3D mushroom stew bowl: creamy ivory, warm peach, mushroom rose, light broth
const STEW_PALETTE = [
  { top: '#fff8f2', face: '#fae0d2', bottom: '#c48a78' },
  { top: '#fff2e8', face: '#f3c6b5', bottom: '#b57264' },
  { top: '#fce2dc', face: '#e5a099', bottom: '#9b5856' },
  { top: '#ffeedc', face: '#e8b384', bottom: '#9a5828' },
] as const

export const SoupSplashCanvas = forwardRef<SoupSplashHandle>(
  function SoupSplashCanvas(_, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const dropletsRef = useRef<CubeDroplet[]>([])
    const rafRef = useRef<number | null>(null)
    const lastTimeRef = useRef<number>(0)

    const stopLoop = () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }

    const drawFrame = (now: number) => {
      const canvas = canvasRef.current
      if (!canvas) {
        stopLoop()
        return
      }
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        stopLoop()
        return
      }

      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.035)
      lastTimeRef.current = now

      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      const targetW = Math.round(rect.width * dpr)
      const targetH = Math.round(rect.height * dpr)
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW
        canvas.height = targetH
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, rect.width, rect.height)

      const droplets = dropletsRef.current
      const gravity = 560

      for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i]
        d.life += dt
        if (d.life >= d.maxLife) {
          droplets.splice(i, 1)
          continue
        }

        d.vy += gravity * dt
        d.vx *= 0.992
        d.x += d.vx * dt
        d.y += d.vy * dt
        d.rot += d.vRot * dt

        const progress = d.life / d.maxLife
        const popIn = progress < 0.09 ? 0.55 + (progress / 0.09) * 0.45 : 1
        const shrink = progress > 0.55 ? 1 - ((progress - 0.55) / 0.45) * 0.55 : 1
        const alpha = progress > 0.6 ? Math.max(0, (1 - progress) / 0.4) : 1

        const s = Math.max(2.5, d.size * popIn * shrink)
        const half = s / 2

        ctx.save()
        ctx.translate(d.x, d.y)
        ctx.rotate(d.rot)
        ctx.globalAlpha = alpha

        // Subtle dark drop shadow behind each pixel cube for crisp separation over the bowl
        ctx.fillStyle = 'rgba(20, 10, 6, 0.38)'
        ctx.fillRect(-half + 1, -half + 2, s, s)

        // Bottom 3D bevel edge
        ctx.fillStyle = d.bottomColor
        ctx.fillRect(-half, -half + s * 0.2, s, s)

        // Main crisp Minecraft square face
        ctx.fillStyle = d.faceColor
        ctx.fillRect(-half, -half, s, s)

        // Top-edge creamy specular pixel highlight
        ctx.fillStyle = d.topColor
        ctx.fillRect(-half, -half, s, Math.max(1.5, s * 0.3))

        ctx.restore()
      }

      if (droplets.length > 0) {
        rafRef.current = window.requestAnimationFrame(drawFrame)
      } else {
        ctx.clearRect(0, 0, rect.width, rect.height)
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
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()

        const centerX = rect.width * 0.5
        const centerY = rect.height * 0.54

        // Bias origin gently toward click point, spread naturally across the stew surface
        let originX = centerX + (Math.random() - 0.5) * (rect.width * 0.14)
        let originY = centerY + (Math.random() - 0.5) * 6
        if (typeof clientX === 'number' && typeof clientY === 'number') {
          const dx = Math.max(
            -rect.width * 0.18,
            Math.min(rect.width * 0.18, clientX - rect.left - centerX),
          )
          const dy = Math.max(-10, Math.min(10, clientY - rect.top - centerY))
          originX = centerX + dx * 0.8
          originY = centerY + dy * 0.45
        }

        const droplets = dropletsRef.current
        const count = 14

        for (let i = 0; i < count; i++) {
          if (droplets.length >= MAX_DROPLETS) droplets.shift()
          const palette =
            STEW_PALETTE[Math.floor(Math.random() * STEW_PALETTE.length)]

          // Spread evenly in an airy fan with organic jitter so particles never clump into a blob
          const fanPos = (i / (count - 1)) * 2 - 1 // -1 .. +1
          const angle = -Math.PI / 2 + fanPos * 0.72 + (Math.random() - 0.5) * 0.28
          const speed = 115 + Math.random() * 150
          const isSmall = Math.random() > 0.42
          const size = isSmall ? 3.5 + Math.random() * 3 : 6.5 + Math.random() * 3.5

          droplets.push({
            x: originX + fanPos * (rect.width * 0.14) + (Math.random() - 0.5) * 14,
            y: originY + (Math.random() - 0.5) * 8,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size,
            life: 0,
            maxLife: 0.48 + Math.random() * 0.34,
            topColor: palette.top,
            faceColor: palette.face,
            bottomColor: palette.bottom,
            rot: (Math.random() - 0.5) * 0.5,
            vRot: (Math.random() - 0.5) * 6.5,
          })
        }

        startLoop()
      },
    }))

    useEffect(() => stopLoop, [])

    return (
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 z-20 h-[260px] w-[328px] -translate-x-1/2 sm:-top-28 sm:h-[300px] sm:w-[378px] lg:-top-32 lg:h-[330px] lg:w-[416px]"
      />
    )
  },
)
