import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { siteConfig } from '../config/site'

const EASE_CINEMATIC: [number, number, number, number] = [0.22, 1, 0.36, 1]

interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
  completed: boolean
}

function getCountdownParts(targetMs: number): CountdownParts {
  const diff = targetMs - Date.now()
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, completed: true }
  }
  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return { days, hours, minutes, seconds, completed: false }
}

function pad2(value: number): string {
  return String(value).padStart(2, '0')
}

export function LaunchStatus() {
  const shouldReduceMotion = useReducedMotion()
  const { mode, label, targetDate } = siteConfig.launch

  const parsedTargetMs =
    mode === 'countdown' && targetDate ? Date.parse(targetDate) : Number.NaN
  const isValidCountdown =
    mode === 'countdown' && Number.isFinite(parsedTargetMs)

  const [countdown, setCountdown] = useState<CountdownParts>(() =>
    isValidCountdown
      ? getCountdownParts(parsedTargetMs)
      : { days: 0, hours: 0, minutes: 0, seconds: 0, completed: false },
  )

  useEffect(() => {
    if (!isValidCountdown) return

    setCountdown(getCountdownParts(parsedTargetMs))
    const timer = window.setInterval(() => {
      setCountdown(getCountdownParts(parsedTargetMs))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [isValidCountdown, parsedTargetMs])

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={shouldReduceMotion ? { opacity: 0 } : { y: 14, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={
        shouldReduceMotion
          ? { duration: 0.25 }
          : { duration: 0.7, delay: 8.6, ease: EASE_CINEMATIC }
      }
      className="mt-8 flex items-center justify-center text-center sm:mt-10"
    >
      {isValidCountdown ? (
        <p className="font-mono text-[clamp(1.5rem,4.8vw,2.4rem)] font-bold tracking-[0.16em] text-[#fafafa] uppercase tabular-nums [text-shadow:0_2px_0_rgba(0,0,0,0.75),0_6px_18px_rgba(0,0,0,0.9),0_0_28px_rgba(240,176,0,0.2)]">
          {countdown.completed ? (
            'DISPONÍVEL AGORA'
          ) : (
            <span className="inline-flex items-baseline gap-2 sm:gap-3">
              <span>{pad2(countdown.days)}d</span>
              <span className="text-[#f0b000]">:</span>
              <span>{pad2(countdown.hours)}h</span>
              <span className="text-[#f0b000]">:</span>
              <span>{pad2(countdown.minutes)}m</span>
              <span className="text-[#f0b000]">:</span>
              <span>{pad2(countdown.seconds)}s</span>
            </span>
          )}
        </p>
      ) : (
        <p className="font-display pl-[0.24em] text-[clamp(1.65rem,5vw,2.6rem)] font-bold tracking-[0.24em] text-[#fafafa] uppercase [text-shadow:0_2px_0_rgba(0,0,0,0.75),0_6px_18px_rgba(0,0,0,0.9),0_0_28px_rgba(240,176,0,0.22)]">
          {label}
        </p>
      )}
    </motion.div>
  )
}
