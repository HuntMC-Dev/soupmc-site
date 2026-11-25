import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

const EASE_CINEMATIC: [number, number, number, number] = [0.22, 1, 0.36, 1]
const SPRING_MORPH = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 24,
  mass: 0.9,
}

interface BrandWordmarkProps {
  suffix: 'HG' | 'MC'
}

export function BrandWordmark({ suffix }: BrandWordmarkProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.h1
      initial={
        shouldReduceMotion ? { opacity: 0 } : { y: 16, opacity: 0 }
      }
      animate={{ y: 0, opacity: 1 }}
      transition={
        shouldReduceMotion
          ? { duration: 0.25 }
          : { duration: 0.6, delay: 0.65, ease: EASE_CINEMATIC }
      }
      aria-label="SoupMC"
      className="font-display mt-6 flex items-baseline justify-center text-[clamp(2.75rem,11vw,3.5rem)] leading-none font-bold tracking-[-0.04em] select-none sm:mt-8 sm:text-[4.25rem] lg:text-[5rem]"
    >
      <span className="text-[var(--text-primary)]">Soup</span>

      {/* Stable inline-grid slot locks exact width of HG/MC -> zero horizontal shift */}
      <span className="relative inline-grid place-items-baseline overflow-visible">
        <span
          aria-hidden="true"
          className="invisible col-start-1 row-start-1 pointer-events-none"
        >
          HG
        </span>
        <span
          aria-hidden="true"
          className="invisible col-start-1 row-start-1 pointer-events-none"
        >
          MC
        </span>

        <span className="relative col-start-1 row-start-1 inline-flex items-baseline justify-start">
          <AnimatePresence mode="popLayout" initial={false}>
            {suffix === 'HG' ? (
              <motion.span
                key="HG"
                initial={false}
                animate={{
                  y: '0%',
                  opacity: 1,
                  filter: 'blur(0px)',
                  scale: 1,
                }}
                exit={
                  shouldReduceMotion
                    ? { opacity: 0 }
                    : {
                        y: '-55%',
                        opacity: 0,
                        filter: 'blur(6px)',
                        scale: 0.92,
                        transition: {
                          duration: 0.38,
                          ease: EASE_CINEMATIC,
                        },
                      }
                }
                className="inline-block bg-gradient-to-br from-[#F4A93B] via-[#F2B563] to-[#E5A29D] bg-clip-text text-transparent"
                style={{
                  filter: 'drop-shadow(0 0 22px rgba(244, 169, 59, 0.26))',
                }}
              >
                HG
              </motion.span>
            ) : (
              <motion.span
                key="MC"
                initial={
                  shouldReduceMotion
                    ? false
                    : {
                        y: '55%',
                        opacity: 0,
                        filter: 'blur(6px)',
                        scale: 0.96,
                      }
                }
                animate={{
                  y: '0%',
                  opacity: 1,
                  filter: 'blur(0px)',
                  scale: 1,
                }}
                transition={
                  shouldReduceMotion ? { duration: 0.2 } : SPRING_MORPH
                }
                className="mc-sheen-text inline-block bg-clip-text text-transparent"
                style={{
                  filter: 'drop-shadow(0 0 24px rgba(244, 169, 59, 0.3))',
                }}
              >
                MC
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </span>
    </motion.h1>
  )
}
