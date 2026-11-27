export const LANGS = ['pt', 'es', 'en'] as const
export type Lang = (typeof LANGS)[number]

/** BCP 47 tag written to <html lang> and og:locale for each language. */
export const HTML_LANG: Record<Lang, string> = {
  pt: 'pt-BR',
  es: 'es',
  en: 'en',
}

export const OG_LOCALE: Record<Lang, string> = {
  pt: 'pt_BR',
  es: 'es_LA',
  en: 'en_US',
}

const pt = {
  'meta.title': 'SoupMC - O verdadeiro HG',
  'meta.description':
    'SoupMC - A evolução do HG. O verdadeiro HG está chegando. Em breve.',
  'meta.ogDescription': 'O verdadeiro HG está chegando. Em breve.',
  'tagline.evolution.article': 'A',
  'tagline.evolution.middle': 'evolução do',
  'tagline.true.article': 'O',
  'tagline.true.middle': 'verdadeiro',
  'tagline.suffix': ' HG',
  'launch.comingSoon': 'Em breve',
  'launch.availableNow': 'Disponível agora',
  'discord.cta': 'Entrar no Discord',
  'soup.alt': 'Sopa 3D do SoupMC',
  'footer.poweredBy': 'Powered by HuntMC',
  'footer.rights': 'Todos os direitos reservados.',
}

export type MessageKey = keyof typeof pt

const es: Record<MessageKey, string> = {
  'meta.title': 'SoupMC - El verdadero HG',
  'meta.description':
    'SoupMC - La evolución del HG. El verdadero HG está por llegar. Próximamente.',
  'meta.ogDescription': 'El verdadero HG está por llegar. Próximamente.',
  'tagline.evolution.article': 'La',
  'tagline.evolution.middle': 'evolución del',
  'tagline.true.article': 'El',
  'tagline.true.middle': 'verdadero',
  'tagline.suffix': ' HG',
  'launch.comingSoon': 'Próximamente',
  'launch.availableNow': 'Disponible ahora',
  'discord.cta': 'Únete al Discord',
  'soup.alt': 'Sopa 3D de SoupMC',
  'footer.poweredBy': 'Powered by HuntMC',
  'footer.rights': 'Todos los derechos reservados.',
}

const en: Record<MessageKey, string> = {
  'meta.title': 'SoupMC - The true HG',
  'meta.description':
    'SoupMC - The evolution of HG. The true HG is coming. Coming soon.',
  'meta.ogDescription': 'The true HG is coming. Coming soon.',
  'tagline.evolution.article': 'The',
  'tagline.evolution.middle': 'evolution of',
  'tagline.true.article': 'The',
  'tagline.true.middle': 'true',
  'tagline.suffix': ' HG',
  'launch.comingSoon': 'Coming soon',
  'launch.availableNow': 'Available now',
  'discord.cta': 'Join our Discord',
  'soup.alt': 'SoupMC 3D soup',
  'footer.poweredBy': 'Powered by HuntMC',
  'footer.rights': 'All rights reserved.',
}

export const MESSAGES: Record<Lang, Record<MessageKey, string>> = { pt, es, en }
