import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import soupPng from '../assets/soup.png'
import soupWebp from '../assets/soup.webp'
import { SoupSplashCanvas, type SoupSplashHandle } from './SoupSplashCanvas'

const EASE_CINEMATIC: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function FloatingSoup() {
  const shouldReduceMotion = useReducedMotion()
  const [popKey, setPopKey] = useState(0)
  const splashRef = useRef<SoupSplashHandle>(null)

  // Trigger recoil + liquid splash right as the soup finishes appearing (650ms)
  useEffect(() => {
    if (shouldReduceMotion) return
    const timer = window.setTimeout(() => {
      setPopKey((prev) => prev + 1)
      splashRef.current?.splash()
    }, 650)
    return () => window.clearTimeout(timer)
  }, [shouldReduceMotion])

  const handleSoupClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (shouldReduceMotion) return
    setPopKey((prev) => prev + 1)
    const hasCoords = e.clientX !== 0 || e.clientY !== 0
    splashRef.current?.splash(
      hasCoords ? e.clientX : undefined,
      hasCoords ? e.clientY : undefined,
    )
  }

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* HiDPI voxel stew splash canvas positioned right over the soup bowl */}
      <SoupSplashCanvas ref={splashRef} />

      {/* Fixed-height stage container -> CLS = 0 */}
      <div className="relative flex h-[132px] w-[176px] items-center justify-center sm:h-[162px] sm:w-[220px] lg:h-[184px] lg:w-[248px]">
        {/* Layer 1: Smooth entrance (0.00s - 0.90s, no persistent filter layer) */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={
            shouldReduceMotion
              ? { duration: 0.25 }
              : { duration: 0.9, ease: EASE_CINEMATIC }
          }
          className="relative flex h-full w-full items-center justify-center"
        >
          {/* Layer 2: Pure GPU CSS hover lift + click spring pop */}
          <button
            type="button"
            onClick={handleSoupClick}
            aria-label="Sopa 3D do SoupMC"
            className="cursor-pointer border-0 bg-transparent p-0 outline-none will-change-transform [backface-visibility:hidden] [transform:translateZ(0)] transition-transform duration-200 ease-out hover:[transform:translateZ(0)_scale(1.045)] active:[transform:translateZ(0)_scale(0.96)] focus-visible:ring-2 focus-visible:ring-[#f0b000]/60 focus-visible:ring-offset-4 focus-visible:ring-offset-[#0f0f0f]"
          >
            <motion.div
              key={popKey}
              initial={popKey === 0 ? false : { scale: 0.92, rotate: -3 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 16,
                mass: 0.7,
              }}
            >
              {/* Layer 3: Decoupled vertical bob (5.4s) + out-of-phase organic tilt (7.3s) */}
              <div className="soup-float-layer relative flex items-center justify-center">
                <div className="soup-sway-layer relative flex items-center justify-center">
                  <picture>
                    <source srcSet={soupWebp} type="image/webp" />
                    <img
                      src={soupPng}
                      alt="Sopa 3D do SoupMC"
                      width={1024}
                      height={682}
                      decoding="async"
                      fetchPriority="high"
                      draggable={false}
                      className="pointer-events-none h-auto w-[176px] select-none object-contain sm:w-[220px] lg:w-[248px]"
                    />
                  </picture>

                  {/* Subtle specular light sweep masked strictly to the soup silhouette */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 overflow-hidden"
                    style={{
                      WebkitMaskImage: `url(${soupPng})`,
                      maskImage: `url(${soupPng})`,
                      WebkitMaskSize: 'contain',
                      maskSize: 'contain',
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskPosition: 'center',
                    }}
                  >
                    <div className="soup-sheen-sweep" />
                  </div>
                </div>
              </div>
            </motion.div>
          </button>
        </motion.div>
      </div>

      {/* Synced elliptical floor shadow beneath the bowl */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          shouldReduceMotion
            ? { duration: 0.25 }
            : { duration: 0.9, delay: 0.1, ease: EASE_CINEMATIC }
        }
        className="-mt-2 sm:-mt-3"
      >
        <div
          className="soup-shadow-layer h-[16px] w-[112px] rounded-full sm:h-[20px] sm:w-[142px] lg:h-[22px] lg:w-[162px]"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.76) 0%, rgba(15, 15, 15, 0.35) 52%, transparent 76%)',
          }}
        />
      </motion.div>
    </div>
  )
}
