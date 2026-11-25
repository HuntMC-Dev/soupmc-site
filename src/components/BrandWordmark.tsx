import { useRef } from 'react'
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'

const EASE_CINEMATIC: [number, number, number, number] = [0.22, 1, 0.36, 1]
const PREFIX_CHARS = ['S', 'o', 'u', 'p'] as const

const SPRING_WAVE = {
  mass: 0.12,
  stiffness: 280,
  damping: 20,
}

const WAVE_RADIUS = 135

function useDockWave(
  ref: React.RefObject<HTMLSpanElement | null>,
  mouseX: MotionValue<number>,
  disabled: boolean,
) {
  const influence = useTransform(mouseX, (x) => {
    if (disabled || !Number.isFinite(x) || !ref.current) return 0
    const rect = ref.current.getBoundingClientRect()
    const center = rect.left + rect.width / 2
    const dist = Math.abs(x - center)
    if (dist >= WAVE_RADIUS) return 0
    // Smooth cosine bell curve: 1 at center, 0 at WAVE_RADIUS, C1-smooth everywhere
    return 0.5 * (1 + Math.cos((Math.PI * dist) / WAVE_RADIUS))
  })

  const rawScale = useTransform(influence, (t) => 1 + t * 0.16)
  const rawY = useTransform(influence, (t) => -t * 6.5)

  const scale = useSpring(rawScale, SPRING_WAVE)
  const y = useSpring(rawY, SPRING_WAVE)

  return { scale, y }
}

interface WaveCharProps {
  char: string
  mouseX: MotionValue<number>
}

function WaveChar({ char, mouseX }: WaveCharProps) {
  const shouldReduceMotion = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const { scale, y } = useDockWave(ref, mouseX, Boolean(shouldReduceMotion))

  return (
    <span ref={ref} className="inline-block cursor-pointer">
      <motion.span
        style={shouldReduceMotion ? undefined : { scale, y }}
        className="wordmark-char wordmark-char-base inline-block text-[#fafafa]"
      >
        {char}
      </motion.span>
    </span>
  )
}

interface FlipCharSlotProps {
  mouseX: MotionValue<number>
  from: string
  to: string
  flipped: boolean
}

function FlipCharSlot({ mouseX, from, to, flipped }: FlipCharSlotProps) {
  const shouldReduceMotion = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const { scale, y } = useDockWave(ref, mouseX, Boolean(shouldReduceMotion))
  const activeChar = flipped ? to : from

  return (
    <span
      ref={ref}
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

      <motion.span
        style={shouldReduceMotion ? undefined : { scale, y }}
        className="wordmark-char wordmark-char-accent col-start-1 row-start-1 inline-flex items-center justify-center"
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
      </motion.span>
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
  const mouseX = useMotionValue(Number.POSITIVE_INFINITY)

  return (
    <motion.h1
      initial={shouldReduceMotion ? { opacity: 0 } : { y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={
        shouldReduceMotion
          ? { duration: 0.25 }
          : { duration: 0.8, delay: 0.95, ease: EASE_CINEMATIC }
      }
      onPointerMove={(e) => {
        if (e.pointerType === 'mouse' && !shouldReduceMotion) {
          mouseX.set(e.clientX)
        }
      }}
      onPointerLeave={() => mouseX.set(Number.POSITIVE_INFINITY)}
      aria-label="SoupMC"
      className="font-display mt-6 flex items-baseline justify-center px-4 text-[clamp(2.85rem,11vw,3.75rem)] leading-[1.08] font-bold tracking-[-0.02em] whitespace-nowrap select-none sm:mt-7 sm:text-[4.5rem] lg:text-[5.25rem]"
    >
      {PREFIX_CHARS.map((ch, idx) => (
        <WaveChar key={`${ch}-${idx}`} char={ch} mouseX={mouseX} />
      ))}
      <FlipCharSlot mouseX={mouseX} from="H" to="M" flipped={firstFlipped} />
      <FlipCharSlot mouseX={mouseX} from="G" to="C" flipped={secondFlipped} />
    </motion.h1>
  )
}
