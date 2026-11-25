import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

const EASE_CINEMATIC: [number, number, number, number] = [0.22, 1, 0.36, 1]

export type TaglinePhase = 'hidden' | 'evolution' | 'true'

interface TaglineMorphProps {
  showDivider: boolean
  phase: TaglinePhase
}

export function TaglineMorph({ showDivider, phase }: TaglineMorphProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="flex w-full flex-col items-center">
      {/* Hairline horizontal divider expanding from center at 4.15s */}
      <div className="mt-5 flex h-[2px] w-full items-center justify-center sm:mt-6">
        <motion.div
          aria-hidden="true"
          initial={
            shouldReduceMotion
              ? { scaleX: 1, opacity: 1 }
              : { scaleX: 0, opacity: 0 }
          }
          animate={
            showDivider || shouldReduceMotion
              ? { scaleX: 1, opacity: 1 }
              : { scaleX: 0, opacity: 0 }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0.25 }
              : { duration: 0.55, ease: EASE_CINEMATIC }
          }
          className="h-[1px] w-[180px] origin-center sm:w-[220px]"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.22), transparent)',
          }}
        />
      </div>

      {/* Fixed min-height tagline stage -> zero layout shift */}
      <div className="mt-5 flex min-h-[2.6rem] items-center justify-center sm:mt-6 sm:min-h-[3rem]">
        <AnimatePresence mode="wait" initial={false}>
          {phase === 'evolution' && (
            <motion.p
              key="evolution"
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { y: 12, opacity: 0, filter: 'blur(6px)' }
              }
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : {
                      y: -8,
                      opacity: 0,
                      filter: 'blur(6px)',
                      transition: { duration: 0.35, ease: EASE_CINEMATIC },
                    }
              }
              transition={{ duration: 0.7, ease: EASE_CINEMATIC }}
              className="text-center text-[clamp(1.05rem,4vw,1.25rem)] font-normal tracking-[-0.01em] text-[#8a8a8a] sm:text-[1.35rem] lg:text-[1.45rem]"
            >
              A evolução do HG
            </motion.p>
          )}

          {phase === 'true' && (
            <motion.p
              key="true"
              initial={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { y: 10, opacity: 0, filter: 'blur(6px)' }
              }
              animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
              transition={
                shouldReduceMotion
                  ? { duration: 0.25 }
                  : { duration: 0.55, ease: EASE_CINEMATIC }
              }
              className="text-center text-[clamp(1.05rem,4vw,1.25rem)] font-normal tracking-[-0.01em] text-[#a3a3a3] sm:text-[1.35rem] lg:text-[1.45rem]"
            >
              O{' '}
              <span className="relative inline-block pb-1 font-semibold text-[#fafafa]">
                verdadeiro
                {/* Clean, sharp golden-to-ember underline drawing left-to-right */}
                <motion.span
                  aria-hidden="true"
                  initial={
                    shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0 }
                  }
                  animate={{ scaleX: 1 }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { duration: 0.55, delay: 0.3, ease: EASE_CINEMATIC }
                  }
                  className="pointer-events-none absolute right-0 bottom-0 left-0 h-[2.5px] origin-left rounded-[1px]"
                  style={{
                    background:
                      'linear-gradient(90deg, #f0b000 0%, #e0401a 100%)',
                    boxShadow: '0 0 12px rgba(240, 176, 0, 0.35)',
                  }}
                />
              </span>{' '}
              HG
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
