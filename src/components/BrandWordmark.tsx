import { useEffect, useRef } from 'react'
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
  mass: 0.14,
  stiffness: 260,
  damping: 22,
}

const SPRING_PRESS = {
  mass: 0.16,
  stiffness: 240,
  damping: 22,
}

const WAVE_RADIUS = 135
const HOVER_SCALE_BOOST = 0.05
const HOVER_Y_LIFT = 2.2
const PRESS_SCALE_BOOST = 0.16
const PRESS_Y_LIFT = 6.5

interface RippleState {
  originX: number
  startTime: number
}

function useDockWave(
  ref: React.RefObject<HTMLSpanElement | null>,
  mouseX: MotionValue<number>,
  pressLevel: MotionValue<number>,
  rippleTick: MotionValue<number>,
  rippleRef: React.RefObject<RippleState | null>,
  disabled: boolean,
) {
  const rawScale = useTransform(
    [mouseX, pressLevel, rippleTick],
    ([xVal, pVal]: number[]) => {
      if (disabled || !ref.current) return 1
      const rect = ref.current.getBoundingClientRect()
      const center = rect.left + rect.width / 2

      let hoverScale = 0
      if (Number.isFinite(xVal)) {
        const dist = Math.abs(xVal - center)
        if (dist < WAVE_RADIUS) {
          const t = 0.5 * (1 + Math.cos((Math.PI * dist) / WAVE_RADIUS))
          const boost =
            HOVER_SCALE_BOOST + (PRESS_SCALE_BOOST - HOVER_SCALE_BOOST) * pVal
          hoverScale = t * boost
        }
      }

      let rippleScale = 0
      const ripple = rippleRef.current
      if (ripple) {
        const dist = Math.abs(center - ripple.originX)
        const delayMs = dist * 1.1
        const elapsed = performance.now() - ripple.startTime - delayMs
        if (elapsed >= 0) {
          const decay = Math.exp(-elapsed / 320)
          const atten = 1 / (1 + dist / 260)
          rippleScale =
            decay * Math.cos((elapsed / 1000) * 14.5) * atten * 0.1
        }
      }

      return 1 + hoverScale + rippleScale
    },
  )

  const rawY = useTransform(
    [mouseX, pressLevel, rippleTick],
    ([xVal, pVal]: number[]) => {
      if (disabled || !ref.current) return 0
      const rect = ref.current.getBoundingClientRect()
      const center = rect.left + rect.width / 2

      let hoverY = 0
      if (Number.isFinite(xVal)) {
        const dist = Math.abs(xVal - center)
        if (dist < WAVE_RADIUS) {
          const t = 0.5 * (1 + Math.cos((Math.PI * dist) / WAVE_RADIUS))
          const lift = HOVER_Y_LIFT + (PRESS_Y_LIFT - HOVER_Y_LIFT) * pVal
          hoverY = -t * lift
        }
      }

      let rippleY = 0
      const ripple = rippleRef.current
      if (ripple) {
        const dist = Math.abs(center - ripple.originX)
        const delayMs = dist * 1.1
        const elapsed = performance.now() - ripple.startTime - delayMs
        if (elapsed >= 0) {
          const decay = Math.exp(-elapsed / 320)
          const atten = 1 / (1 + dist / 260)
          rippleY = -decay * Math.cos((elapsed / 1000) * 14.5) * atten * 6.5
        }
      }

      return hoverY + rippleY
    },
  )

  const scale = useSpring(rawScale, SPRING_WAVE)
  const y = useSpring(rawY, SPRING_WAVE)

  return { scale, y }
}

interface WaveCharProps {
  char: string
  mouseX: MotionValue<number>
  pressLevel: MotionValue<number>
  rippleTick: MotionValue<number>
  rippleRef: React.RefObject<RippleState | null>
}

function WaveChar({
  char,
  mouseX,
  pressLevel,
  rippleTick,
  rippleRef,
}: WaveCharProps) {
  const shouldReduceMotion = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const { scale, y } = useDockWave(
    ref,
    mouseX,
    pressLevel,
    rippleTick,
    rippleRef,
    Boolean(shouldReduceMotion),
  )

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
  pressLevel: MotionValue<number>
  rippleTick: MotionValue<number>
  rippleRef: React.RefObject<RippleState | null>
  from: string
  to: string
  flipped: boolean
}

function FlipCharSlot({
  mouseX,
  pressLevel,
  rippleTick,
  rippleRef,
  from,
  to,
  flipped,
}: FlipCharSlotProps) {
  const shouldReduceMotion = useReducedMotion()
  const ref = useRef<HTMLSpanElement>(null)
  const { scale, y } = useDockWave(
    ref,
    mouseX,
    pressLevel,
    rippleTick,
    rippleRef,
    Boolean(shouldReduceMotion),
  )
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
  const rawPress = useMotionValue(0)
  const pressLevel = useSpring(rawPress, SPRING_PRESS)
  const rippleTick = useMotionValue(0)

  const isPressedRef = useRef(false)
  const lastXRef = useRef(0)
  const rippleRef = useRef<RippleState | null>(null)
  const rafRef = useRef<number | null>(null)
  const wordmarkRef = useRef<HTMLHeadingElement>(null)

  const stopRippleLoop = () => {
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  const triggerRipple = (originX: number) => {
    if (shouldReduceMotion) return
    stopRippleLoop()
    rippleRef.current = { originX, startTime: performance.now() }

    const step = () => {
      const ripple = rippleRef.current
      if (!ripple) return
      const elapsed = performance.now() - ripple.startTime
      rippleTick.set(elapsed)
      if (elapsed < 1650) {
        rafRef.current = window.requestAnimationFrame(step)
      } else {
        rippleRef.current = null
        rippleTick.set(0)
        rafRef.current = null
      }
    }

    rafRef.current = window.requestAnimationFrame(step)
  }

  // Trigger a left-to-right entrance ripple from "S" right as SoupHG finishes appearing
  useEffect(() => {
    if (shouldReduceMotion) return
    const timer = window.setTimeout(() => {
      const firstChar = wordmarkRef.current?.firstElementChild
      if (firstChar) {
        const rect = firstChar.getBoundingClientRect()
        triggerRipple(rect.left + rect.width / 2)
      }
    }, 1720)
    return () => window.clearTimeout(timer)
  }, [shouldReduceMotion])

  useEffect(() => {
    const handlePointerUp = (e: PointerEvent) => {
      if (!isPressedRef.current) return
      isPressedRef.current = false
      rawPress.set(0)
      triggerRipple(Number.isFinite(e.clientX) ? e.clientX : lastXRef.current)
    }

    const handlePointerCancel = () => {
      if (!isPressedRef.current) return
      isPressedRef.current = false
      rawPress.set(0)
    }

    window.addEventListener('pointerup', handlePointerUp, { passive: true })
    window.addEventListener('pointercancel', handlePointerCancel, {
      passive: true,
    })

    return () => {
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerCancel)
      stopRippleLoop()
    }
  }, [shouldReduceMotion, rawPress, rippleTick])

  return (
    <motion.h1
      ref={wordmarkRef}
      initial={shouldReduceMotion ? { opacity: 0 } : { y: 18, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={
        shouldReduceMotion
          ? { duration: 0.25 }
          : { duration: 0.8, delay: 0.95, ease: EASE_CINEMATIC }
      }
      onPointerMove={(e) => {
        if (shouldReduceMotion) return
        if (e.pointerType === 'mouse' || isPressedRef.current) {
          lastXRef.current = e.clientX
          mouseX.set(e.clientX)
        }
      }}
      onPointerDown={(e) => {
        if (shouldReduceMotion) return
        isPressedRef.current = true
        lastXRef.current = e.clientX
        mouseX.set(e.clientX)
        rawPress.set(1)
      }}
      onPointerLeave={() => {
        if (!isPressedRef.current) {
          mouseX.set(Number.POSITIVE_INFINITY)
        }
      }}
      aria-label="SoupMC"
      className="font-display mt-6 flex items-baseline justify-center px-4 text-[clamp(2.85rem,11vw,3.75rem)] leading-[1.08] font-bold tracking-[-0.02em] whitespace-nowrap select-none sm:mt-7 sm:text-[4.5rem] lg:text-[5.25rem]"
    >
      {PREFIX_CHARS.map((ch, idx) => (
        <WaveChar
          key={`${ch}-${idx}`}
          char={ch}
          mouseX={mouseX}
          pressLevel={pressLevel}
          rippleTick={rippleTick}
          rippleRef={rippleRef}
        />
      ))}
      <FlipCharSlot
        mouseX={mouseX}
        pressLevel={pressLevel}
        rippleTick={rippleTick}
        rippleRef={rippleRef}
        from="H"
        to="M"
        flipped={firstFlipped}
      />
      <FlipCharSlot
        mouseX={mouseX}
        pressLevel={pressLevel}
        rippleTick={rippleTick}
        rippleRef={rippleRef}
        from="G"
        to="C"
        flipped={secondFlipped}
      />
    </motion.h1>
  )
}
