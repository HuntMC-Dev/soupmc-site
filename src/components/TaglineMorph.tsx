import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

const EASE_CINEMATIC: [number, number, number, number] = [0.22, 1, 0.36, 1]
const EASE_STROKE: [number, number, number, number] = [0.65, 0, 0.35, 1]

export type TaglinePhase = 'hidden' | 'evolution' | 'true'

interface TaglineMorphProps {
  phase: TaglinePhase
}

export function TaglineMorph({ phase }: TaglineMorphProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="mt-3 flex min-h-[2.6rem] items-center justify-center sm:mt-4 sm:min-h-[3rem]">
      <AnimatePresence mode="wait" initial={false}>
        {phase === 'evolution' && (
          <motion.p
            key="evolution"
            initial={
              shouldReduceMotion ? { opacity: 0 } : { y: 10, opacity: 0 }
            }
            animate={{ y: 0, opacity: 1 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : {
                    y: -8,
                    opacity: 0,
                    filter: 'blur(4px)',
                    transition: { duration: 0.32, ease: EASE_CINEMATIC },
                  }
            }
            transition={{ duration: 0.5, ease: EASE_CINEMATIC }}
            className="text-center text-[clamp(1.05rem,4.2vw,1.25rem)] font-medium tracking-[-0.015em] text-[var(--text-secondary)] sm:text-[1.375rem] lg:text-[1.5rem]"
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
                : { y: 8, opacity: 0, filter: 'blur(4px)' }
            }
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            transition={
              shouldReduceMotion
                ? { duration: 0.25 }
                : { duration: 0.42, ease: EASE_CINEMATIC }
            }
            className="text-center text-[clamp(1.05rem,4.2vw,1.25rem)] font-medium tracking-[-0.015em] text-[var(--text-secondary)] sm:text-[1.375rem] lg:text-[1.5rem]"
          >
            O{' '}
            <span className="relative inline-block font-semibold text-[var(--text-primary)]">
              verdadeiro
              <svg
                aria-hidden="true"
                viewBox="0 0 132 12"
                fill="none"
                preserveAspectRatio="none"
                className="pointer-events-none absolute -bottom-[5px] left-[-2%] h-[9px] w-[104%] overflow-visible sm:-bottom-[6px] sm:h-[10px]"
              >
                <defs>
                  <linearGradient
                    id="verdadeiro-underline-grad"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#F4A93B" />
                    <stop offset="65%" stopColor="#F0AE5E" />
                    <stop offset="100%" stopColor="#E5A29D" />
                  </linearGradient>
                </defs>
                {/* Soft amber glow under-stroke */}
                <motion.path
                  d="M2 8.8C36 2.8 94 2.4 130 7.6"
                  stroke="url(#verdadeiro-underline-grad)"
                  strokeWidth="4.5"
                  strokeLinecap="round"
                  opacity={0.28}
                  style={{ filter: 'blur(3px)' }}
                  initial={
                    shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0 }
                  }
                  animate={{ pathLength: 1 }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { duration: 0.6, delay: 0.3, ease: EASE_STROKE }
                  }
                />
                {/* Crisp warm gradient curved underline */}
                <motion.path
                  d="M2 8.8C36 2.8 94 2.4 130 7.6"
                  stroke="url(#verdadeiro-underline-grad)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  initial={
                    shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0 }
                  }
                  animate={{ pathLength: 1 }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { duration: 0.6, delay: 0.3, ease: EASE_STROKE }
                  }
                />
              </svg>
            </span>{' '}
            HG
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
