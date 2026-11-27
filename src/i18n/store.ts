import { detectCountry } from './geo'
import {
  HTML_LANG,
  LANGS,
  MESSAGES,
  OG_LOCALE,
  type Lang,
  type MessageKey,
} from './messages'

/**
 * Language store that lives OUTSIDE React on purpose.
 *
 * Flow:
 *  1. Before the first render the language comes from `?lang=`, then from the
 *     visitor's own pick in the language switcher, then from a country cached
 *     on a previous visit, then from the browser languages.
 *  2. The country lookup (public geo-IP pool) runs in the background. When it
 *     answers, the language may change: subscribers write the new strings
 *     straight into their DOM nodes. No React state changes, so no component
 *     re-renders, remounts or replays its entrance animation.
 *  3. A pick in the language switcher is saved and always wins over the
 *     country, including a lookup that answers after the pick.
 *
 * Country rule (same as the game servers): Brazil and the other Portuguese
 * speaking countries -> pt, Spanish speaking countries -> es. Any other
 * country keeps whatever the browser asked for.
 */

const PORTUGUESE_COUNTRIES = new Set(['BR', 'PT', 'AO', 'MZ', 'CV', 'GW', 'ST', 'TL'])

const SPANISH_COUNTRIES = new Set([
  'AR', 'BO', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'ES', 'GQ', 'GT', 'HN', 'MX',
  'NI', 'PA', 'PE', 'PR', 'PY', 'SV', 'UY', 'VE',
])

const COUNTRY_CACHE_KEY = 'soupmc.geo.country'
const COUNTRY_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000
const CHOSEN_LANG_KEY = 'soupmc.lang'

type Listener = (lang: Lang) => void

function isLang(value: string | null | undefined): value is Lang {
  return !!value && (LANGS as readonly string[]).includes(value)
}

function langForCountry(country: string | null): Lang | null {
  if (!country) return null
  if (PORTUGUESE_COUNTRIES.has(country)) return 'pt'
  if (SPANISH_COUNTRIES.has(country)) return 'es'
  return null
}

function browserLang(): Lang {
  const candidates = navigator.languages?.length
    ? navigator.languages
    : [navigator.language]
  for (const tag of candidates) {
    const base = tag?.toLowerCase().split('-')[0]
    if (isLang(base)) return base
  }
  return 'en'
}

function queryLang(): Lang | null {
  const value = new URLSearchParams(window.location.search)
    .get('lang')
    ?.toLowerCase()
    .split('-')[0]
  return isLang(value) ? value : null
}

function readChosenLang(): Lang | null {
  try {
    const value = window.localStorage.getItem(CHOSEN_LANG_KEY)
    return isLang(value) ? value : null
  } catch {
    return null
  }
}

function readCachedCountry(): string | null {
  try {
    const raw = window.localStorage.getItem(COUNTRY_CACHE_KEY)
    if (!raw) return null
    const { country, at } = JSON.parse(raw) as { country?: string; at?: number }
    if (typeof country !== 'string' || typeof at !== 'number') return null
    if (Date.now() - at > COUNTRY_CACHE_TTL_MS) return null
    return country
  } catch {
    return null
  }
}

function writeCachedCountry(country: string) {
  try {
    window.localStorage.setItem(
      COUNTRY_CACHE_KEY,
      JSON.stringify({ country, at: Date.now() }),
    )
  } catch {
    // Storage blocked (private mode, policy): the lookup just runs again next visit.
  }
}

const forcedLang = queryLang()
let chosenLang: Lang | null = forcedLang ? null : readChosenLang()
const cachedCountry = forcedLang || chosenLang ? null : readCachedCountry()

let current: Lang =
  forcedLang ?? chosenLang ?? langForCountry(cachedCountry) ?? browserLang()
const listeners = new Set<Listener>()

export function getLang(): Lang {
  return current
}

export function t(key: MessageKey, lang: Lang = current): string {
  return MESSAGES[lang][key]
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function setMeta(selector: string, value: string) {
  document.querySelector(selector)?.setAttribute('content', value)
}

function applyDocument(lang: Lang) {
  document.documentElement.lang = HTML_LANG[lang]
  document.title = t('meta.title', lang)
  setMeta('meta[name="description"]', t('meta.description', lang))
  setMeta('meta[property="og:title"]', t('meta.title', lang))
  setMeta('meta[property="og:description"]', t('meta.ogDescription', lang))
  setMeta('meta[property="og:locale"]', OG_LOCALE[lang])
  setMeta('meta[name="twitter:title"]', t('meta.title', lang))
  setMeta('meta[name="twitter:description"]', t('meta.ogDescription', lang))
}

function setLang(lang: Lang) {
  if (lang === current) return
  current = lang
  applyDocument(lang)
  for (const listener of listeners) listener(lang)
}

/** Language switcher pick: saved, and wins over any country lookup. */
export function chooseLang(lang: Lang) {
  chosenLang = lang
  try {
    window.localStorage.setItem(CHOSEN_LANG_KEY, lang)
  } catch {
    // Storage blocked: the pick still applies for this visit.
  }
  // Drop ?lang= so a reload keeps the pick instead of the link's language.
  const url = new URL(window.location.href)
  if (url.searchParams.has('lang')) {
    url.searchParams.delete('lang')
    window.history.replaceState(window.history.state, '', url)
  }
  setLang(lang)
}

/** Call once before the first render. */
export function initI18n() {
  applyDocument(current)
  // ?lang=, a saved pick or a fresh cached country already decided the language.
  if (forcedLang || chosenLang || cachedCountry) return

  void detectCountry().then((country) => {
    if (!country) return
    writeCachedCountry(country)
    const lang = langForCountry(country)
    // The visitor may have picked a language while the lookup was running.
    if (lang && !chosenLang) setLang(lang)
  })
}
