import {
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
} from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { LANG_NAME, LANGS, type Lang } from '../i18n/messages'
import { chooseLang, getLang, subscribe, t } from '../i18n/store'

const EASE_CINEMATIC: [number, number, number, number] = [0.22, 1, 0.36, 1]
const EASE_ENTER: [number, number, number, number] = [0.16, 1, 0.3, 1]
const EASE_EXIT: [number, number, number, number] = [0.4, 0, 1, 1]
/** Time without typing before type-to-search starts over. */
const TYPEAHEAD_MS = 600

function LanguagesIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3.5"
    >
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  )
}

function ChevronsUpDownIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3.5 shrink-0"
    >
      <path d="m7 15 5 5 5-5" />
      <path d="m7 9 5-5 5 5" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3.5"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

/**
 * Top-right language picker, same pattern as the platform Select (quiet
 * variant): borderless trigger with the language written in itself, elevated
 * list with neutral highlight and the check on the right.
 * Keyboard: arrows, Home/End, type-to-search, Enter or Space picks, Esc and
 * Tab close. Screen readers: `combobox` trigger pointing to a `listbox`, the
 * active option goes through `aria-activedescendant`.
 *
 * Only this component follows the language through React; the page texts
 * keep swapping in place (see i18n/Text.tsx).
 */
export function LanguageSwitcher() {
  const shouldReduceMotion = useReducedMotion()
  const lang = useSyncExternalStore(subscribe, getLang)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const typed = useRef({ text: '', timer: 0 })
  const listId = useId()
  const labelId = `${listId}-label`
  const valueId = `${listId}-value`
  const selectedIndex = LANGS.indexOf(lang)

  useEffect(() => {
    const state = typed.current
    return () => window.clearTimeout(state.timer)
  }, [])

  // On open: the current language is active and the list takes the focus.
  useEffect(() => {
    if (!open) return
    setActive(selectedIndex)
    listRef.current?.focus()

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const close = (refocus: boolean) => {
    setOpen(false)
    if (refocus) triggerRef.current?.focus()
  }

  const choose = (i: number) => {
    const value: Lang | undefined = LANGS[i]
    close(true)
    if (value && value !== lang) chooseLang(value)
  }

  /** Next option whose name starts with what was typed (same letter cycles). */
  const typeahead = (key: string, from: number): number => {
    const state = typed.current
    window.clearTimeout(state.timer)
    state.text += key.toLocaleLowerCase()
    state.timer = window.setTimeout(() => {
      state.text = ''
    }, TYPEAHEAD_MS)
    const same = [...state.text].every((c) => c === state.text[0])
    const needle = same ? state.text[0] : state.text
    const start = same ? from + 1 : Math.max(from, 0)
    for (let n = 0; n < LANGS.length; n++) {
      const i = (start + n) % LANGS.length
      if (LANG_NAME[LANGS[i]].toLocaleLowerCase().startsWith(needle)) return i
    }
    return -1
  }

  const printable = (e: KeyboardEvent) =>
    e.key.length === 1 && e.key !== ' ' && !e.ctrlKey && !e.metaKey && !e.altKey

  const onTriggerKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
    } else if (printable(e)) {
      // Closed: typing switches right away, like a native select.
      const i = typeahead(e.key, selectedIndex)
      if (i >= 0 && LANGS[i] !== lang) chooseLang(LANGS[i])
    }
  }

  const onListKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = LANGS.length - 1
    if (e.key === 'ArrowDown') setActive((a) => Math.min(a + 1, last))
    else if (e.key === 'ArrowUp') setActive((a) => (a < 0 ? last : Math.max(a - 1, 0)))
    else if (e.key === 'Home' || e.key === 'PageUp') setActive(0)
    else if (e.key === 'End' || e.key === 'PageDown') setActive(last)
    else if (e.key === 'Enter' || e.key === ' ') choose(active)
    else if (e.key === 'Escape') close(true)
    else if (e.key === 'Tab') {
      close(false)
      return
    } else if (printable(e)) {
      const i = typeahead(e.key, active)
      if (i >= 0) setActive(i)
    } else return
    e.preventDefault()
  }

  const label = t('lang.switcher', lang)

  return (
    <motion.div
      ref={rootRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={
        shouldReduceMotion
          ? { duration: 0.25 }
          : { duration: 0.8, delay: 0.7, ease: EASE_CINEMATIC }
      }
      // Content lines up with the 28px inset of the decorative corner brackets
      // (trigger has 10px padding), vertically centered on their 40px arm.
      className="fixed top-3 right-3 z-30 sm:top-[30px] sm:right-[18px]"
    >
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-labelledby={`${labelId} ${valueId}`}
        data-state={open ? 'open' : 'closed'}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKey}
        className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-[6px] px-2.5 text-[13px] font-medium tracking-[0.01em] text-[#9a9a9a] transition-[background-color,color] duration-[120ms] ease-linear select-none hover:bg-white/[0.06] hover:text-[#fafafa] hover:duration-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f0b000] data-[state=open]:bg-white/[0.06] data-[state=open]:text-[#fafafa] pointer-coarse:h-11"
      >
        <span className="flex shrink-0 items-center text-[#6f6f6f]">
          <LanguagesIcon />
        </span>
        <span id={labelId} className="sr-only">
          {label}
        </span>
        <span id={valueId} lang={lang}>
          {LANG_NAME[lang]}
        </span>
        <span className="flex items-center text-[#6f6f6f]">
          <ChevronsUpDownIcon />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={listRef}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-label={label}
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            onKeyDown={onListKey}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { duration: 0.16, ease: EASE_ENTER },
            }}
            exit={{ opacity: 0, transition: { duration: 0.1, ease: EASE_EXIT } }}
            className="absolute top-full right-0 mt-1.5 min-w-full origin-top-right rounded-[8px] bg-[#1a1a1a] p-1 text-[#fafafa] shadow-[0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_0_rgba(255,255,255,0.05),0_2px_4px_-1px_rgba(0,0,0,0.5),0_8px_20px_-4px_rgba(0,0,0,0.6)] outline-none"
          >
            {LANGS.map((value, i) => {
              const isSelected = value === lang
              return (
                <div
                  key={value}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={isSelected}
                  lang={value}
                  data-active={i === active ? 'true' : 'false'}
                  onPointerMove={() => {
                    if (i !== active) setActive(i)
                  }}
                  onClick={() => choose(i)}
                  className={`flex h-8 cursor-pointer items-center gap-2 rounded-[6px] pr-1.5 pl-2 text-[13px] whitespace-nowrap select-none pointer-coarse:h-11 ${i === active ? 'bg-white/[0.06]' : ''}`}
                >
                  <span className="min-w-0 flex-1">{LANG_NAME[value]}</span>
                  <span className="flex size-4 shrink-0 items-center justify-center text-[#9a9a9a]">
                    {isSelected ? <CheckIcon /> : null}
                  </span>
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
