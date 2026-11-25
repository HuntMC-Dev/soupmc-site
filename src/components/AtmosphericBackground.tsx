import { useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { siteConfig } from '../config/site'

const EASE_CINEMATIC: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function AtmosphericBackground() {
  const spotlightRef = useRef<HTMLDivElement | null>(null)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (shouldReduceMotion) return

    const finePointerQuery = window.matchMedia(
      '(hover: hover) and (pointer: fine)',
    )
    if (!finePointerQuery.matches) return

    let rafId = 0
    let targetX = window.innerWidth * 0.5
    let targetY = window.innerHeight * 0.38

    const flush = () => {
      rafId = 0
      const el = spotlightRef.current
      if (!el) return
      el.style.setProperty('--mx', `${targetX}px`)
      el.style.setProperty('--my', `${targetY}px`)
    }

    const handlePointerMove = (event: PointerEvent) => {
      targetX = event.clientX
      targetY = event.clientY
      if (!rafId) {
        rafId = window.requestAnimationFrame(flush)
      }
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [shouldReduceMotion])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden select-none"
    >
      {/* 1. Optional atmospheric HG backdrop image */}
      {siteConfig.backdropImageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.14] blur-[2px]"
          style={{
            backgroundImage: `url(${siteConfig.backdropImageUrl})`,
            maskImage:
              'radial-gradient(ellipse at center, black 10%, transparent 72%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, black 10%, transparent 72%)',
          }}
        />
      )}

      {/* 2. Dual warm radial aura (amber + dusty rose) swelling on entrance */}
      <motion.div
        initial={
          shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.88 }
        }
        animate={{ opacity: 1, scale: 1 }}
        transition={
          shouldReduceMotion
            ? { duration: 0.25 }
            : { duration: 1.1, ease: EASE_CINEMATIC }
        }
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="aura-breathe relative -translate-y-[12vh] h-[460px] w-[460px] sm:h-[580px] sm:w-[580px] lg:h-[680px] lg:w-[680px]">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 48% 46%, rgba(244, 169, 59, 0.16) 0%, rgba(200, 118, 36, 0.07) 36%, transparent 70%)',
            }}
          />
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle at 58% 56%, rgba(229, 162, 157, 0.1) 0%, rgba(229, 162, 157, 0.03) 38%, transparent 68%)',
            }}
          />
        </div>
      </motion.div>

      {/* 3. Subtle masked dot grid */}
      <div className="bg-dot-grid absolute inset-0" />

      {/* 4. Desktop-only rAF pointer spotlight */}
      <div
        ref={spotlightRef}
        className="pointer-spotlight absolute inset-0 transition-opacity duration-500"
      />

      {/* 5. Top subtle vignette to anchor depth */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 85% 75% at 50% 45%, transparent 45%, rgba(4, 3, 3, 0.65) 100%)',
        }}
      />

      {/* 6. Ultra-fine inline SVG film grain */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.035] mix-blend-overlay"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="soupmc-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#soupmc-grain)" />
      </svg>
    </div>
  )
}
