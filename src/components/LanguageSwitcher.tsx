import { useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { LANG_NAME, LANGS, type Lang } from '../i18n/messages'
import { chooseLang, getLang, subscribe, t } from '../i18n/store'
import { LanguageFlag } from './LanguageFlag'

const EASE_CINEMATIC: [number, number, number, number] = [0.22, 1, 0.36, 1]

/**
 * Top-right language picker. Only this component follows the language through
 * React; the page texts keep swapping in place (see i18n/Text.tsx).
 */
export function LanguageSwitcher() {
  const shouldReduceMotion = useReducedMotion()
  const lang = useSyncExternalStore(subscribe, getLang)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([])
  const menuId = useId()

  useEffect(() => {
    if (!open) return

    const focusIndex = LANGS.indexOf(getLang())
    itemRefs.current[focusIndex]?.focus()

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const pick = (value: Lang) => {
    chooseLang(value)
    setOpen(false)
    buttonRef.current?.focus()
  }

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    const items = itemRefs.current.filter(Boolean) as HTMLButtonElement[]
    const index = items.indexOf(document.activeElement as HTMLButtonElement)
    let next = -1
    if (e.key === 'ArrowDown') next = (index + 1) % items.length
    else if (e.key === 'ArrowUp') next = (index - 1 + items.length) % items.length
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = items.length - 1
    else if (e.key === 'Tab') setOpen(false)
    if (next >= 0) {
      e.preventDefault()
      items[next]?.focus()
    }
  }

  return (
    <motion.div
      ref={rootRef}
      initial={shouldReduceMotion ? { opacity: 0 } : { y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={
        shouldReduceMotion
          ? { duration: 0.25 }
          : { duration: 0.7, delay: 0.7, ease: EASE_CINEMATIC }
      }
      className="fixed top-4 right-4 z-30 sm:top-6 sm:right-8"
    >
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`${t('lang.switcher', lang)}: ${LANG_NAME[lang]}`}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault()
            setOpen(true)
          }
        }}
        className="group inline-flex h-10 cursor-pointer items-center gap-2 rounded-[8px] border border-white/10 bg-white/[0.04] px-3 font-mono text-xs font-bold tracking-[0.12em] text-[#d8d8d8] uppercase backdrop-blur-sm transition-[border-color,background-color,color] duration-200 ease-out hover:border-[#f0b000]/45 hover:bg-white/[0.07] hover:text-[#fafafa] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0b000] aria-expanded:border-[#f0b000]/45 aria-expanded:text-[#fafafa]"
      >
        <LanguageFlag lang={lang} className="h-[14px] w-[21px] shrink-0" />
        <span>{lang}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 12 12"
          className={`h-3 w-3 shrink-0 text-[#888] transition-transform duration-200 ease-out group-hover:text-[#f0b000] ${open ? 'rotate-180' : ''}`}
        >
          <path
            d="M2.5 4.5 6 8l3.5-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            aria-label={t('lang.switcher', lang)}
            onKeyDown={onMenuKeyDown}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: EASE_CINEMATIC }}
            className="absolute top-full right-0 mt-2 min-w-[11rem] origin-top-right overflow-hidden rounded-[10px] border border-white/10 bg-[#161616]/95 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.6)] backdrop-blur-md"
          >
            {LANGS.map((value, i) => {
              const active = value === lang
              return (
                <button
                  key={value}
                  ref={(el) => {
                    itemRefs.current[i] = el
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  lang={value}
                  tabIndex={-1}
                  onClick={() => pick(value)}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-[6px] px-3 py-2.5 text-left text-sm transition-colors duration-150 outline-none hover:bg-white/[0.07] focus-visible:bg-white/[0.09] ${active ? 'text-[#fafafa]' : 'text-[#bdbdbd]'}`}
                >
                  <LanguageFlag lang={value} className="h-[14px] w-[21px] shrink-0" />
                  <span className="flex-1">{LANG_NAME[value]}</span>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 12 12"
                    className={`h-3 w-3 shrink-0 text-[#f0b000] ${active ? 'opacity-100' : 'opacity-0'}`}
                  >
                    <path
                      d="M2.5 6.2 5 8.5l4.5-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
