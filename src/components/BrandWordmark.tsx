import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

const EASE_CINEMATIC: [number, number, number, number] = [0.22, 1, 0.36, 1]
const PREFIX_CHARS = ['S', 'o', 'u', 'p'] as const

interface FlipCharSlotProps {
  from: string
  to: string
  flipped: boolean
}

function FlipCharSlot({ from, to, flipped }: FlipCharSlotProps) {
  const shouldReduceMotion = useReducedMotion()
  const activeChar = flipped ? to : from

  return (
    <span
      className="relative inline-grid place-items-center"
      style={{ perspective: 420 }}
    >
      {/* Invisible ghosts lock exact slot width -> zero horizontal shift */}
      <span aria-hidden="true" className="invisible col-start-1 row-start-1 select-none pointer-events-none">
        {from}
      </span>
      <span aria-hidden="true" className="invisible col-start-1 row-start-1 select-none pointer-events-none">
        {to}
      </span>

      <span className="wordmark-char wordmark-char-accent col-start-1 row-start-1 inline-flex items-center justify-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={activeChar}
            initial={
              shouldReduceMotion
                ? false
                : { rotateX: -90, opacity: 0.35 }
            }
            animate={{ rotateX: 0, opacity: 1 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : {
                    rotateX: 90,
                    opacity: 0.35,
                    transition: { duration: 0.2, ease: 'easeIn' },
                  }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0.15 }
                : { duration: 0.26, ease: 'easeOut' }
            }
            style={{ transformStyle: 'preserve-3d', display: 'inline-block' }}
            className="soupmc-accent-text"
          >
            {activeChar}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  )
}

interface BrandWordmarkProps {
  firstFlipped: boolean
  secondFlipped: boolean
}

export function BrandWordmark({
  firstFlipped,
  secondFlipped,
}: BrandWordmarkProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.h1
      initial={
        shouldReduceMotion
          ? { opacity: 0 }
          : { y: 18, opacity: 0, filter: 'blur(10px)' }
      }
      animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
      transition={
        shouldReduceMotion
          ? { duration: 0.25 }
          : { duration: 0.8, delay: 0.95, ease: EASE_CINEMATIC }
      }
      aria-label="SoupMC"
      className="font-display mt-6 flex items-baseline justify-center text-[clamp(2.85rem,11vw,3.75rem)] leading-[1.08] font-bold tracking-[-0.02em] whitespace-nowrap select-none sm:mt-7 sm:text-[4.5rem] lg:text-[5.25rem]"
    >
      {PREFIX_CHARS.map((ch, idx) => (
        <span key={`${ch}-${idx}`} className="wordmark-char text-[#fafafa]">
          {ch}
        </span>
      ))}
      <FlipCharSlot from="H" to="M" flipped={firstFlipped} />
      <FlipCharSlot from="G" to="C" flipped={secondFlipped} />
    </motion.h1>
  )
}
