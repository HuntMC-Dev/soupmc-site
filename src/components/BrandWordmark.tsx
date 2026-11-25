import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

const EASE_CINEMATIC: [number, number, number, number] = [0.22, 1, 0.36, 1]
const PREFIX_CHARS = ['S', 'o', 'u', 'p'] as const

function getWaveStyle(idx: number, hoveredIdx: number | null): React.CSSProperties {
  if (hoveredIdx === null) {
    return { transform: 'translate3d(0, 0, 0) scale(1)' }
  }
  const dist = Math.abs(idx - hoveredIdx)
  if (dist === 0) {
    return { transform: 'translate3d(0, -5px, 0) scale(1.14)' }
  }
  if (dist === 1) {
    return { transform: 'translate3d(0, -2.5px, 0) scale(1.07)' }
  }
  if (dist === 2) {
    return { transform: 'translate3d(0, -1px, 0) scale(1.025)' }
  }
  return { transform: 'translate3d(0, 0, 0) scale(1)' }
}

interface FlipCharSlotProps {
  index: number
  hoveredIdx: number | null
  onHover: (idx: number | null) => void
  from: string
  to: string
  flipped: boolean
}

function FlipCharSlot({
  index,
  hoveredIdx,
  onHover,
  from,
  to,
  flipped,
}: FlipCharSlotProps) {
  const shouldReduceMotion = useReducedMotion()
  const activeChar = flipped ? to : from
  const isNear = hoveredIdx !== null && Math.abs(index - hoveredIdx) <= 1

  return (
    <span
      onPointerEnter={() => !shouldReduceMotion && onHover(index)}
      className="relative inline-grid cursor-pointer place-items-center"
      style={{ perspective: 420 }}
    >
      {/* Invisible ghosts lock exact slot width -> zero horizontal shift */}
      <span
        aria-hidden="true"
        className="pointer-events-none invisible col-start-1 row-start-1 select-none"
      >
        {from}
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none invisible col-start-1 row-start-1 select-none"
      >
        {to}
      </span>

      <span
        className={`wordmark-char wordmark-char-accent col-start-1 row-start-1 inline-flex items-center justify-center ${
          isNear ? 'wordmark-char-accent-lit' : ''
        }`}
        style={shouldReduceMotion ? undefined : getWaveStyle(index, hoveredIdx)}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={activeChar}
            initial={
              shouldReduceMotion ? false : { rotateX: -90, opacity: 0.35 }
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
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  return (
    <motion.h1
      initial={shouldReduceMotion ? { opacity: 0 } : { y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={
        shouldReduceMotion
          ? { duration: 0.25 }
          : { duration: 0.8, delay: 0.95, ease: EASE_CINEMATIC }
      }
      onPointerLeave={() => setHoveredIdx(null)}
      aria-label="SoupMC"
      className="font-display mt-6 flex items-baseline justify-center text-[clamp(2.85rem,11vw,3.75rem)] leading-[1.08] font-bold tracking-[-0.02em] whitespace-nowrap select-none sm:mt-7 sm:text-[4.5rem] lg:text-[5.25rem]"
    >
      {PREFIX_CHARS.map((ch, idx) => {
        const isNear = hoveredIdx !== null && Math.abs(idx - hoveredIdx) <= 1
        return (
          <span
            key={`${ch}-${idx}`}
            onPointerEnter={() => !shouldReduceMotion && setHoveredIdx(idx)}
            className={`wordmark-char wordmark-char-base text-[#fafafa] ${
              isNear ? 'wordmark-char-base-lit' : ''
            }`}
            style={shouldReduceMotion ? undefined : getWaveStyle(idx, hoveredIdx)}
          >
            {ch}
          </span>
        )
      })}
      <FlipCharSlot
        index={4}
        hoveredIdx={hoveredIdx}
        onHover={setHoveredIdx}
        from="H"
        to="M"
        flipped={firstFlipped}
      />
      <FlipCharSlot
        index={5}
        hoveredIdx={hoveredIdx}
        onHover={setHoveredIdx}
        from="G"
        to="C"
        flipped={secondFlipped}
      />
    </motion.h1>
  )
}
