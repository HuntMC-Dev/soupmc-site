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
 *  1. Before the first render the language comes from `?lang=`, then from a
 *     country cached on a previous visit, then from the browser languages.
 *  2. The country lookup (public geo-IP pool) runs in the background. When it
 *     answers, the language may change: subscribers write the new strings
 *     straight into their DOM nodes. No React state changes, so no component
 *     re-renders, remounts or replays its entrance animation.
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
const cachedCountry = forcedLang ? null : readCachedCountry()

let current: Lang = forcedLang ?? langForCountry(cachedCountry) ?? browserLang()
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

/** Call once before the first render. */
export function initI18n() {
  applyDocument(current)
  // Explicit ?lang= wins, and a fresh cached country already decided the language.
  if (forcedLang || cachedCountry) return

  void detectCountry().then((country) => {
    if (!country) return
    writeCachedCountry(country)
    const lang = langForCountry(country)
    if (lang) setLang(lang)
  })
}
