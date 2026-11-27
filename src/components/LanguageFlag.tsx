import { useId } from 'react'
import type { Lang } from '../i18n/messages'

/**
 * Inline SVG flags (emoji flags do not render on Windows).
 * pt -> Brazil, es -> Spain, en -> United States.
 */

function BrazilFlag() {
  return (
    <>
      <rect width="24" height="16" fill="#009b3a" />
      <path d="M12 2.2 21.4 8 12 13.8 2.6 8Z" fill="#fedf00" />
      <circle cx="12" cy="8" r="3.6" fill="#002776" />
      <path
        d="M8.5 7.1c2.4-.5 4.9-.2 7 .9"
        fill="none"
        stroke="#fff"
        strokeWidth="0.7"
      />
    </>
  )
}

function SpainFlag() {
  return (
    <>
      <rect width="24" height="16" fill="#aa151b" />
      <rect y="4" width="24" height="8" fill="#f1bf00" />
    </>
  )
}

const US_STRIPE = 16 / 13

function UnitedStatesFlag() {
  const stars: Array<[number, number]> = []
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 5; col++) {
      stars.push([1.2 + col * 1.9 + (row % 2) * 0.95, 1.2 + row * 2])
    }
  }
  return (
    <>
      <rect width="24" height="16" fill="#fff" />
      {Array.from({ length: 7 }, (_, i) => (
        <rect
          key={i}
          y={i * 2 * US_STRIPE}
          width="24"
          height={US_STRIPE}
          fill="#b22234"
        />
      ))}
      <rect width="10.4" height={7 * US_STRIPE} fill="#3c3b6e" />
      {stars.map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="0.42" fill="#fff" />
      ))}
    </>
  )
}

const FLAGS: Record<Lang, () => React.JSX.Element> = {
  pt: BrazilFlag,
  es: SpainFlag,
  en: UnitedStatesFlag,
}

export function LanguageFlag({ lang, className }: { lang: Lang; className?: string }) {
  const Flag = FLAGS[lang]
  const clipId = `flag-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 16"
      className={className}
      shapeRendering="geometricPrecision"
    >
      <clipPath id={clipId}>
        <rect width="24" height="16" rx="2" />
      </clipPath>
      <g clipPath={`url(#${clipId})`}>
        <Flag />
      </g>
      <rect
        x="0.25"
        y="0.25"
        width="23.5"
        height="15.5"
        rx="1.8"
        fill="none"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="0.5"
      />
    </svg>
  )
}
