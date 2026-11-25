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
      initial={shouldReduceMotion ? { opacity: 0 } : { y: 12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={
        shouldReduceMotion
          ? { duration: 0.25 }
          : { duration: 0.55, delay: 3.7, ease: EASE_CINEMATIC }
      }
      className="mt-8 flex items-center justify-center sm:mt-10"
    >
      <div
        role="status"
        aria-live="polite"
        className="group relative inline-flex min-h-[44px] items-center gap-3 rounded-full border border-[var(--border-subtle)] bg-[var(--glass-bg)] px-5 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(253,246,240,0.06)] backdrop-blur-md transition-colors duration-300 hover:border-[var(--border-hover)]"
      >
        {/* Pulsing amber indicator dot */}
        <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
          <span className="status-pulse-ring absolute inline-flex h-full w-full rounded-full bg-[#F4A93B]" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#F4A93B] shadow-[0_0_10px_rgba(244,169,59,0.85)]" />
        </span>

        {isValidCountdown ? (
          <span className="font-mono text-xs font-medium tracking-[0.14em] text-[var(--text-primary)] uppercase tabular-nums sm:text-[13px]">
            {countdown.completed ? (
              'Disponível agora'
            ) : (
              <span className="inline-flex items-center gap-2">
                <span>{pad2(countdown.days)}d</span>
                <span className="text-[var(--text-muted)]">:</span>
                <span>{pad2(countdown.hours)}h</span>
                <span className="text-[var(--text-muted)]">:</span>
                <span>{pad2(countdown.minutes)}m</span>
                <span className="text-[var(--text-muted)]">:</span>
                <span>{pad2(countdown.seconds)}s</span>
              </span>
            )}
          </span>
        ) : (
          <span className="font-mono text-xs font-medium tracking-[0.16em] text-[var(--text-primary)] uppercase tabular-nums sm:text-[13px]">
            {label}
          </span>
        )}
      </div>
    </motion.div>
  )
}
