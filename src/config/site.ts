export type LaunchMode = 'coming_soon' | 'countdown'

export interface SiteConfig {
  brandName: string
  launch: {
    mode: LaunchMode
    label: string
    /**
     * ISO 8601 date string (e.g. '2026-12-20T18:00:00-03:00').
     * To switch from "Em breve" to a live countdown, set mode to 'countdown'
     * and provide a valid future targetDate.
     */
    targetDate: string | null
  }
  /**
   * Optional Discord invite URL. Renders the Discord CTA button only when non-empty.
   */
  discordUrl: string
  /**
   * Optional atmospheric HG landscape image URL rendered behind the radial aura.
   */
  backdropImageUrl: string | null
}

export const siteConfig: SiteConfig = {
  brandName: 'SoupMC',
  launch: {
    mode: 'coming_soon',
    label: 'Em breve',
    targetDate: null,
  },
  discordUrl: 'https://discord.soupmc.com',
  backdropImageUrl: null,
}
