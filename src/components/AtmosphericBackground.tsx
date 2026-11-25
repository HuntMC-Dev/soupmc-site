import { motion, useReducedMotion } from 'motion/react'
import { siteConfig } from '../config/site'

export function AtmosphericBackground() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 overflow-hidden select-none"
    >
      {/* Optional atmospheric HG landscape layer */}
      {siteConfig.backdropImageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.12] blur-[2px]"
          style={{
            backgroundImage: `url(${siteConfig.backdropImageUrl})`,
            maskImage:
              'radial-gradient(ellipse at center, black 10%, transparent 72%)',
            WebkitMaskImage:
              'radial-gradient(ellipse at center, black 10%, transparent 72%)',
          }}
        />
      )}

      {/* Restrained warm SoupMC radial lighting behind hero */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={
          shouldReduceMotion ? { duration: 0.25 } : { duration: 1.5, delay: 0.2 }
        }
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 52% 46% at 50% 34%, rgba(240, 176, 0, 0.06) 0%, transparent 68%), radial-gradient(ellipse 48% 42% at 56% 52%, rgba(224, 64, 26, 0.04) 0%, transparent 66%)',
        }}
      />

      {/* Subtle film grain */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.03]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="soupmc-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#soupmc-grain)" />
      </svg>

      {/* Architectural hairline corner brackets (desktop) */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={
          shouldReduceMotion ? { duration: 0.25 } : { duration: 0.8, delay: 0.7 }
        }
        className="hidden sm:block"
      >
        <div className="corner-bracket corner-bracket-tl" />
        <div className="corner-bracket corner-bracket-br" />
      </motion.div>
    </div>
  )
}
