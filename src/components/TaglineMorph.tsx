import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { subscribe, t } from '../i18n/store'
import { Text } from '../i18n/Text'

const EASE_CINEMATIC: [number, number, number, number] = [0.22, 1, 0.36, 1]

export type TaglinePhase = 'hidden' | 'evolution' | 'true'

/** Wait for the final phrase (and its underline) to land before resizing. */
const SETTLE_DELAY_MS = 900
/**
 * The center slot is locked to the wider phrase so "HG" stays still during the
 * swap. When the final phrase is much narrower (some languages), that lock
 * would leave visible gaps, so after the swap the slot is released and the
 * article and "HG" glide in.
 */
const SHRINK_RATIO = 0.15

interface TaglineMorphProps {
  showDivider: boolean
  phase: TaglinePhase
}

export function TaglineMorph({ showDivider, phase }: TaglineMorphProps) {
  const shouldReduceMotion = useReducedMotion()
  const articleKey =
    phase === 'true' ? 'tagline.true.article' : 'tagline.evolution.article'
  const articleSlotRef = useRef<HTMLSpanElement>(null)
  const suffixRef = useRef<HTMLSpanElement>(null)
  const evolutionGhostRef = useRef<HTMLSpanElement>(null)
  const trueGhostRef = useRef<HTMLSpanElement>(null)

  // Direct DOM (FLIP) on purpose: it also has to follow in-place language
  // swaps, which never re-render this component.
  useEffect(() => {
    if (phase !== 'true') return

    const fitSlot = () => {
      const evolutionGhost = evolutionGhostRef.current
      const trueGhost = trueGhostRef.current
      if (!evolutionGhost || !trueGhost) return
      const movers = [articleSlotRef.current, suffixRef.current].filter(
        (el): el is HTMLSpanElement => el !== null,
      )
      const before = movers.map((el) => el.getBoundingClientRect().left)

      evolutionGhost.style.display = ''
      const evolutionWidth = evolutionGhost.getBoundingClientRect().width
      const trueWidth = trueGhost.getBoundingClientRect().width
      evolutionGhost.style.display =
        evolutionWidth - trueWidth > trueWidth * SHRINK_RATIO ? 'none' : ''

      if (shouldReduceMotion) return
      movers.forEach((el, i) => {
        const dx = before[i] - el.getBoundingClientRect().left
        if (Math.abs(dx) < 0.5) return
        el.animate(
          [{ transform: `translateX(${dx}px)` }, { transform: 'translateX(0)' }],
          { duration: 520, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
        )
      })
    }

    const timer = window.setTimeout(
      fitSlot,
      shouldReduceMotion ? 0 : SETTLE_DELAY_MS,
    )
    const unsubscribe = subscribe(fitSlot)
    return () => {
      window.clearTimeout(timer)
      unsubscribe()
    }
  }, [phase, shouldReduceMotion])

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

      {/* Fixed min-height tagline stage -> locked slot widths keep the article and "HG" 100% stationary */}
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
            {/* Leading article: locked inline-grid slot sized for both phases */}
            <span
              ref={articleSlotRef}
              className="relative inline-grid place-items-center"
            >
              <span
                aria-hidden="true"
                className="pointer-events-none invisible col-start-1 row-start-1 select-none"
              >
                <Text k="tagline.true.article" />
              </span>
              <span
                aria-hidden="true"
                className="pointer-events-none invisible col-start-1 row-start-1 select-none"
              >
                <Text k="tagline.evolution.article" />
              </span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={t(articleKey)}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={
                    shouldReduceMotion
                      ? { opacity: 0 }
                      : {
                          opacity: 0,
                          y: -6,
                          transition: { duration: 0.2, ease: EASE_CINEMATIC },
                        }
                  }
                  transition={{ duration: 0.26, ease: EASE_CINEMATIC }}
                  className="col-start-1 row-start-1 inline-block"
                >
                  <Text k={articleKey} />
                </motion.span>
              </AnimatePresence>
            </span>

            <span>&nbsp;</span>

            {/* Center slot: locked inline-grid width holds both middle phrases (current language) so "HG" NEVER moves */}
            <span className="relative inline-grid place-items-center">
              <span
                ref={evolutionGhostRef}
                aria-hidden="true"
                className="pointer-events-none invisible col-start-1 row-start-1 whitespace-nowrap select-none"
              >
                <Text k="tagline.evolution.middle" />
              </span>
              <span
                ref={trueGhostRef}
                aria-hidden="true"
                className="pointer-events-none invisible col-start-1 row-start-1 pb-1 font-semibold whitespace-nowrap select-none"
              >
                <Text k="tagline.true.middle" />
              </span>

              <span className="col-start-1 row-start-1 inline-flex items-baseline justify-center whitespace-nowrap">
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
                              transition: { duration: 0.26, ease: EASE_CINEMATIC },
                            }
                      }
                      className="inline-block text-[#e5e5e5]"
                    >
                      <Text k="tagline.evolution.middle" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="verdadeiro"
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={
                        shouldReduceMotion
                          ? { duration: 0.2 }
                          : { duration: 0.38, ease: EASE_CINEMATIC }
                      }
                      className="verdadeiro-highlight relative inline-block pb-1 font-semibold text-[#fafafa]"
                    >
                      <Text k="tagline.true.middle" />
                      {/* Clean, sharp golden-to-ember underline drawing left-to-right */}
                      <motion.span
                        aria-hidden="true"
                        initial={shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={
                          shouldReduceMotion
                            ? { duration: 0 }
                            : { duration: 0.55, delay: 0.24, ease: EASE_CINEMATIC }
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
              </span>
            </span>

            {/* Anchored " HG" stays 100% stationary with zero horizontal movement */}
            <span ref={suffixRef} className="inline-block whitespace-pre">
              <Text k="tagline.suffix" />
            </span>
          </motion.p>
        )}
      </div>
    </div>
  )
}
