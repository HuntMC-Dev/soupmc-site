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
      {/* Hairline horizontal divider with restrained warm glow expanding from center at 4.15s */}
      <div className="relative mt-5 flex h-[10px] w-full items-center justify-center sm:mt-6">
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
          className="relative flex w-[200px] origin-center items-center justify-center sm:w-[250px]"
        >
          {/* Soft warm diffused halo */}
          <span
            className="pointer-events-none absolute inset-x-4 h-[6px] rounded-full blur-[5px]"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(240, 176, 0, 0.22) 30%, rgba(255, 214, 102, 0.38) 50%, rgba(240, 176, 0, 0.22) 70%, transparent 100%)',
            }}
          />
          {/* Crisp luminous core hairline */}
          <span
            className="relative h-[1px] w-full"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(240, 176, 0, 0.32) 25%, rgba(255, 232, 166, 0.72) 50%, rgba(240, 176, 0, 0.32) 75%, transparent 100%)',
            }}
          />
        </motion.div>
      </div>

      {/* Fixed min-height tagline stage -> only the changing words morph while HG stays anchored */}
      <div className="mt-5 flex min-h-[3.2rem] items-center justify-center sm:mt-6 sm:min-h-[3.8rem]">
        {phase !== 'hidden' && (
          <motion.p
            initial={shouldReduceMotion ? { opacity: 0 } : { y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={
              shouldReduceMotion
                ? { duration: 0.25 }
                : { duration: 0.7, ease: EASE_CINEMATIC }
            }
            className="inline-flex items-baseline justify-center text-center text-[clamp(1.35rem,5.2vw,1.75rem)] font-medium tracking-[-0.015em] text-[#dcdcdc] [text-shadow:0_2px_0_rgba(0,0,0,0.8),0_6px_16px_rgba(0,0,0,0.88)] sm:text-[1.95rem] lg:text-[2.2rem]"
          >
            {/* Leading article: A -> O */}
            <motion.span
              layout
              transition={{ duration: 0.45, ease: EASE_CINEMATIC }}
              className="relative inline-grid place-items-center"
            >
              <span aria-hidden="true" className="invisible col-start-1 row-start-1 select-none">
                O
              </span>
              <span aria-hidden="true" className="invisible col-start-1 row-start-1 select-none">
                A
              </span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={phase === 'true' ? 'O' : 'A'}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, y: -6, transition: { duration: 0.2, ease: EASE_CINEMATIC } }
                  }
                  transition={{ duration: 0.26, ease: EASE_CINEMATIC }}
                  className="col-start-1 row-start-1 inline-block"
                >
                  {phase === 'true' ? 'O' : 'A'}
                </motion.span>
              </AnimatePresence>
            </motion.span>

            <span>&nbsp;</span>

            {/* Center word: evolução -> verdadeiro */}
            <motion.span
              layout
              transition={{ duration: 0.45, ease: EASE_CINEMATIC }}
              className="relative inline-flex items-baseline justify-center"
            >
              <AnimatePresence mode="wait" initial={false}>
                {phase === 'evolution' ? (
                  <motion.span
                    key="evolucao"
                    initial={false}
                    animate={{ opacity: 1, y: 0 }}
                    exit={
                      shouldReduceMotion
                        ? { opacity: 0 }
                        : {
                            opacity: 0,
                            y: -10,
                            transition: { duration: 0.28, ease: EASE_CINEMATIC },
                          }
                    }
                    className="inline-block text-[#e5e5e5]"
                  >
                    evolução
                  </motion.span>
                ) : (
                  <motion.span
                    key="verdadeiro"
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={
                      shouldReduceMotion
                        ? { duration: 0.2 }
                        : { duration: 0.42, ease: EASE_CINEMATIC }
                    }
                    className="verdadeiro-highlight relative inline-block pb-1 font-semibold text-[#fafafa]"
                  >
                    verdadeiro
                    {/* Clean, sharp golden-to-ember underline drawing left-to-right */}
                    <motion.span
                      aria-hidden="true"
                      initial={shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={
                        shouldReduceMotion
                          ? { duration: 0 }
                          : { duration: 0.55, delay: 0.28, ease: EASE_CINEMATIC }
                      }
                      className="verdadeiro-underline pointer-events-none absolute right-0 bottom-0 left-0 h-[3px] origin-left rounded-[1px]"
                      style={{
                        background:
                          'linear-gradient(90deg, #ffd24c 0%, #f0b000 50%, #e0401a 100%)',
                      }}
                    />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.span>

            {/* Connector " do" collapses smoothly when switching to "O verdadeiro HG" */}
            <AnimatePresence initial={false}>
              {phase === 'evolution' && (
                <motion.span
                  key="do"
                  initial={{ opacity: 1, width: 'auto' }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={
                    shouldReduceMotion
                      ? { opacity: 0, width: 0 }
                      : {
                          opacity: 0,
                          width: 0,
                          transition: { duration: 0.3, ease: EASE_CINEMATIC },
                        }
                  }
                  className="inline-block overflow-hidden whitespace-pre"
                >
                  {' do'}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Anchored " HG" stays mounted and never blinks */}
            <motion.span
              layout
              transition={{ duration: 0.45, ease: EASE_CINEMATIC }}
              className="inline-block whitespace-pre"
            >
              {' HG'}
            </motion.span>
          </motion.p>
        )}
      </div>
    </div>
  )
}
