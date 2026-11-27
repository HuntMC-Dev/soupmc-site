/**
 * Country lookup straight from the visitor's browser, using a pool of public,
 * keyless, CORS-enabled geo-IP endpoints. No backend of our own: the site stays
 * 100% static on GitHub Pages.
 *
 * All providers are raced; the first valid ISO 3166-1 alpha-2 code wins and the
 * remaining requests are aborted. A provider that fails, rate-limits or answers
 * garbage is simply ignored.
 */

interface Provider {
  url: string
  parse: (body: string) => string | null
}

function fromJson(field: string) {
  return (body: string): string | null => {
    const data: unknown = JSON.parse(body)
    if (data && typeof data === 'object' && field in data) {
      const value = (data as Record<string, unknown>)[field]
      return typeof value === 'string' ? value : null
    }
    return null
  }
}

/** Cloudflare /cdn-cgi/trace answers `key=value` lines; the country is `loc=`. */
function fromTrace(body: string): string | null {
  const match = /^loc=([A-Za-z]{2})$/m.exec(body)
  return match ? match[1] : null
}

const PROVIDERS: Provider[] = [
  { url: 'https://www.cloudflare.com/cdn-cgi/trace', parse: fromTrace },
  { url: 'https://1.1.1.1/cdn-cgi/trace', parse: fromTrace },
  { url: 'https://api.country.is/', parse: fromJson('country') },
  { url: 'https://get.geojs.io/v1/ip/country.json', parse: fromJson('country') },
  { url: 'https://ipwho.is/?fields=country_code', parse: fromJson('country_code') },
  { url: 'https://ipinfo.io/json', parse: fromJson('country') },
  { url: 'https://api.db-ip.com/v2/free/self', parse: fromJson('countryCode') },
  {
    // Plain text: "1;BR;BRA;Brazil" (first field 1 = found).
    url: 'https://ip2c.org/self',
    parse: (body) => {
      const parts = body.trim().split(';')
      return parts[0] === '1' ? (parts[1] ?? null) : null
    },
  },
]

const TIMEOUT_MS = 15000

function normalize(code: string | null): string | null {
  if (!code) return null
  const cc = code.trim().toUpperCase()
  // Reject private/unknown placeholders some providers return (XX, T1 = Tor, ZZ).
  if (!/^[A-Z]{2}$/.test(cc) || cc === 'XX' || cc === 'ZZ') return null
  return cc
}

export function detectCountry(): Promise<string | null> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS)

  const attempts = PROVIDERS.map(async (provider) => {
    const response = await fetch(provider.url, {
      signal: controller.signal,
      credentials: 'omit',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const country = normalize(provider.parse(await response.text()))
    if (!country) throw new Error('no country')
    return country
  })

  return Promise.any(attempts)
    .then((country) => country as string | null)
    .catch(() => null)
    .finally(() => {
      window.clearTimeout(timer)
      controller.abort()
    })
}
