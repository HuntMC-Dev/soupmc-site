import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

export interface SoupSplashHandle {
  splash: () => void
}

interface Droplet {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  topColor: string
  frontColor: string
  shadowColor: string
  rot: number
  vRot: number
}

interface Plume {
  x: number
  baseY: number
  angle: number
  maxHeight: number
  width: number
  life: number
  maxLife: number
  color: string
  highlight: string
}

const MAX_DROPLETS = 120
const MAX_PLUMES = 18

// Colors sampled directly from the 3D mushroom stew surface and bowl highlights
const DROPLET_PALETTES = [
  { top: '#fff5ec', front: '#f9ded0', shadow: '#c58773' },
  { top: '#fde8dc', front: '#f1c7b8', shadow: '#b37062' },
  { top: '#f6d0c7', front: '#e4a39c', shadow: '#9c5b58' },
  { top: '#ffe9cf', front: '#e8b382', shadow: '#8c4b20' },
] as const

export const SoupSplashCanvas = forwardRef<SoupSplashHandle>(
  function SoupSplashCanvas(_, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const dropletsRef = useRef<Droplet[]>([])
    const plumesRef = useRef<Plume[]>([])
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

      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.04)
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
      const plumes = plumesRef.current

      // 1. Render rising creamy stew plumes (fast up, smooth collapse)
      for (let i = plumes.length - 1; i >= 0; i--) {
        const p = plumes[i]
        p.life += dt
        if (p.life >= p.maxLife) {
          plumes.splice(i, 1)
          continue
        }
        const progress = p.life / p.maxLife
        // Fast burst up (peak around 0.28), smooth recoil
        const heightCurve =
          progress < 0.3
            ? Math.sin((progress / 0.3) * (Math.PI / 2))
            : Math.cos(((progress - 0.3) / 0.7) * (Math.PI / 2))
        const h = p.maxHeight * Math.max(0, heightCurve)
        const alpha = progress < 0.75 ? 0.92 : Math.max(0, (1 - progress) / 0.25) * 0.92

        ctx.save()
        ctx.translate(p.x, p.baseY)
        ctx.rotate(p.angle)
        ctx.globalAlpha = alpha

        // Pixel-stepped voxel column for authentic Minecraft stew feel
        const steps = Math.max(2, Math.round(h / 5))
        for (let s = 0; s < steps; s++) {
          const frac = s / steps
          const segW = Math.max(4, Math.round(p.width * (1 - frac * 0.45)))
          const segH = 6
          const segY = -s * 5 - segH
          // Shadow rim
          ctx.fillStyle = '#9c5b58'
          ctx.fillRect(-segW / 2 - 1, segY + 1, segW + 2, segH)
          // Main stew body
          ctx.fillStyle = s >= steps - 2 ? p.highlight : p.color
          ctx.fillRect(-segW / 2, segY, segW, segH)
        }
        ctx.restore()
      }

      // 2. Render 3D-shaded voxel stew droplets under ballistic gravity
      const gravity = 640
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
        const fadeOut = progress > 0.65 ? Math.max(0, (1 - progress) / 0.35) : 1
        const scale = progress < 0.12 ? 0.6 + (progress / 0.12) * 0.4 : 1 - progress * 0.28
        const s = Math.max(3, d.size * scale)
        const half = s / 2

        ctx.save()
        ctx.translate(d.x, d.y)
        ctx.rotate(d.rot)
        ctx.globalAlpha = fadeOut

        // Bottom 3D bevel shadow
        ctx.fillStyle = d.shadowColor
        ctx.fillRect(-half, -half + s * 0.22, s, s)

        // Main voxel face
        ctx.fillStyle = d.frontColor
        ctx.fillRect(-half, -half, s, s)

        // Crisp top specular highlight strip
        ctx.fillStyle = d.topColor
        ctx.fillRect(-half, -half, s, Math.max(1.5, s * 0.32))

        ctx.restore()
      }

      if (droplets.length > 0 || plumes.length > 0) {
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
      splash() {
        const canvas = canvasRef.current
        if (!canvas) return
        const rect = canvas.getBoundingClientRect()
        const originX = rect.width * 0.5
        // Right at the creamy stew surface inside the bowl
        const originY = rect.height * 0.56

        const plumes = plumesRef.current
        const plumeCount = 4
        for (let i = 0; i < plumeCount; i++) {
          if (plumes.length >= MAX_PLUMES) plumes.shift()
          const spread = (i - (plumeCount - 1) / 2) / ((plumeCount - 1) / 2)
          plumes.push({
            x: originX + spread * (rect.width * 0.11) + (Math.random() - 0.5) * 8,
            baseY: originY + (Math.random() - 0.5) * 4,
            angle: spread * 0.42 + (Math.random() - 0.5) * 0.16,
            maxHeight: (28 + Math.random() * 24) * (1 - Math.abs(spread) * 0.22),
            width: 8 + Math.random() * 4,
            life: 0,
            maxLife: 0.36 + Math.random() * 0.14,
            color: i % 2 === 0 ? '#f6d3c1' : '#eab1a6',
            highlight: '#fff3e8',
          })
        }

        const droplets = dropletsRef.current
        const burstCount = 20
        for (let i = 0; i < burstCount; i++) {
          if (droplets.length >= MAX_DROPLETS) droplets.shift()
          const palette =
            DROPLET_PALETTES[Math.floor(Math.random() * DROPLET_PALETTES.length)]
          // Fan upward from -68deg to +68deg around vertical (-PI/2)
          const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.38
          const speed = 155 + Math.random() * 195
          const size = 5 + Math.random() * 6.5

          droplets.push({
            x: originX + (Math.random() - 0.5) * (rect.width * 0.28),
            y: originY + (Math.random() - 0.5) * 8,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size,
            life: 0,
            maxLife: 0.58 + Math.random() * 0.34,
            topColor: palette.top,
            frontColor: palette.front,
            shadowColor: palette.shadow,
            rot: (Math.random() - 0.5) * 0.4,
            vRot: (Math.random() - 0.5) * 5.2,
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
        className="pointer-events-none absolute -top-24 left-1/2 z-20 h-[260px] w-[320px] -translate-x-1/2 sm:-top-28 sm:h-[300px] sm:w-[380px] lg:-top-32 lg:h-[330px] lg:w-[420px]"
      />
    )
  },
)
