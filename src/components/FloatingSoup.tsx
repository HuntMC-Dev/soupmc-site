import { useEffect } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from 'motion/react'
import soupPng from '../assets/soup.png'
import soupWebp from '../assets/soup.webp'

const EASE_CINEMATIC: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function FloatingSoup() {
  const shouldReduceMotion = useReducedMotion()

  const rawRotateX = useMotionValue(0)
  const rawRotateY = useMotionValue(0)

  const rotateX = useSpring(rawRotateX, {
    stiffness: 160,
    damping: 24,
    mass: 0.65,
  })
  const rotateY = useSpring(rawRotateY, {
    stiffness: 160,
    damping: 24,
    mass: 0.65,
  })

  useEffect(() => {
    if (shouldReduceMotion) return

    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!finePointer.matches) return

    const handlePointerMove = (event: PointerEvent) => {
      const nx = (event.clientX / window.innerWidth) * 2 - 1
      const ny = (event.clientY / window.innerHeight) * 2 - 1
      rawRotateY.set(nx * 9)
      rawRotateX.set(-ny * 7)
    }

    const handlePointerLeave = () => {
      rawRotateX.set(0)
      rawRotateY.set(0)
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      document.documentElement.removeEventListener(
        'pointerleave',
        handlePointerLeave,
      )
    }
  }, [shouldReduceMotion, rawRotateX, rawRotateY])

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Fixed-height stage container -> CLS = 0 */}
      <div
        className="relative flex h-[132px] w-[176px] items-center justify-center sm:h-[164px] sm:w-[224px] lg:h-[186px] lg:w-[256px]"
        style={{ perspective: 900 }}
      >
        {/* Layer 1: One-shot entrance animation */}
        <motion.div
          initial={
            shouldReduceMotion
              ? { opacity: 0 }
              : { y: 22, scale: 0.92, opacity: 0 }
          }
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={
            shouldReduceMotion
              ? { duration: 0.25 }
              : { duration: 0.85, ease: EASE_CINEMATIC }
          }
          className="relative h-full w-full flex items-center justify-center"
        >
          {/* Layer 2: Desktop-only subtle 3D pointer tilt */}
          <motion.div
            style={
              shouldReduceMotion
                ? undefined
                : {
                    rotateX,
                    rotateY,
                    transformStyle: 'preserve-3d',
                  }
            }
            className="relative flex h-full w-full items-center justify-center"
          >
            {/* Layer 3: Pure CSS GPU-composited continuous float (zero flicker) */}
            <div className="soup-float-layer relative flex items-center justify-center">
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
                  className="pointer-events-none h-auto w-[176px] select-none object-contain sm:w-[224px] lg:w-[256px]"
                />
              </picture>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Synced elliptical floor shadow beneath the bowl (no repaint filter on img) */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          shouldReduceMotion
            ? { duration: 0.25 }
            : { duration: 0.9, delay: 0.1, ease: EASE_CINEMATIC }
        }
        className="-mt-2 sm:-mt-3"
      >
        <div
          className="soup-shadow-layer h-[18px] w-[116px] rounded-full sm:h-[22px] sm:w-[148px] lg:h-[24px] lg:w-[168px]"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(0, 0, 0, 0.78) 0%, rgba(24, 14, 10, 0.42) 48%, transparent 74%)',
          }}
        />
      </motion.div>
    </div>
  )
}
