import { useEffect, useRef, type RefObject } from 'react'
import type { MessageKey } from './messages'
import { getLang, subscribe, t } from './store'

function writeText(el: HTMLElement, value: string) {
  const node = el.firstChild
  // Reuse React's own text node so React and the DOM never disagree.
  if (node && node.nodeType === Node.TEXT_NODE && !node.nextSibling) {
    if (node.nodeValue !== value) node.nodeValue = value
  } else if (el.textContent !== value) {
    el.textContent = value
  }
}

interface TextProps {
  k: MessageKey
  className?: string
}

/**
 * Translated text. Renders the current language and, when the language
 * changes later (geo lookup answered), swaps the text in place, without a
 * React re-render, remount or animation replay.
 */
export function Text({ k, className }: TextProps) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // The language may have changed between render and commit.
    writeText(el, t(k))
    return subscribe((lang) => writeText(el, t(k, lang)))
  }, [k])

  return (
    <span ref={ref} className={className}>
      {t(k, getLang())}
    </span>
  )
}

/** Same in-place swap for a translated attribute (alt, aria-label...). */
export function useI18nAttr(
  ref: RefObject<HTMLElement | null>,
  attr: string,
  key: MessageKey,
) {
  useEffect(() => {
    // Resolve the element on every change: it may have been remounted
    // (e.g. a keyed motion wrapper) since the effect ran.
    const apply = (lang = getLang()) =>
      ref.current?.setAttribute(attr, t(key, lang))
    apply()
    return subscribe(apply)
  }, [ref, attr, key])
}
