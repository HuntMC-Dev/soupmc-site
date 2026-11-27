import { motion, useReducedMotion } from 'motion/react'
import { siteConfig } from '../config/site'
import { Text } from '../i18n/Text'

const EASE_CINEMATIC: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function DiscordCta() {
  const shouldReduceMotion = useReducedMotion()
  const url = siteConfig.discordUrl.trim()

  if (!url) return null

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 0 } : { y: 14, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={
        shouldReduceMotion
          ? { duration: 0.25 }
          : { duration: 0.65, delay: 9.35, ease: EASE_CINEMATIC }
      }
      className="mt-7 flex items-center justify-center sm:mt-8"
    >
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-[48px] cursor-pointer items-center gap-3 rounded-[8px] bg-[#fafafa] px-7 py-3.5 text-sm font-semibold tracking-[0.04em] text-[#0f0f0f] shadow-[0_4px_20px_rgba(255,255,255,0.1)] will-change-transform [backface-visibility:hidden] [transform:translateZ(0)] transition-[transform,box-shadow] duration-200 ease-out hover:[transform:translateZ(0)_scale(1.04)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.2)] active:[transform:translateZ(0)_scale(0.98)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0b000]"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-[19px] w-[19px] shrink-0 [transform:translateZ(0)]"
        >
          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
        </svg>
        <Text k="discord.cta" />
      </a>
    </motion.div>
  )
}
