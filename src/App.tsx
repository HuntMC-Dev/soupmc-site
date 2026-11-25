import { useEffect, useState } from 'react'
import { MotionConfig, useReducedMotion } from 'motion/react'
import { AtmosphericBackground } from './components/AtmosphericBackground'
import { FloatingSoup } from './components/FloatingSoup'
import { BrandWordmark } from './components/BrandWordmark'
import { TaglineMorph, type TaglinePhase } from './components/TaglineMorph'
import { LaunchStatus } from './components/LaunchStatus'
import { DiscordCta } from './components/DiscordCta'
import { siteConfig } from './config/site'
import huntmcLogoPng from './assets/huntmc-logo.png'
import huntmcLogoWebp from './assets/huntmc-logo.webp'
import soupPng from './assets/soup.png'
import soupWebp from './assets/soup.webp'

function HeroStage() {
  const shouldReduceMotion = useReducedMotion()

  const [firstFlipped, setFirstFlipped] = useState(() =>
    Boolean(shouldReduceMotion),
  )
  const [secondFlipped, setSecondFlipped] = useState(() =>
    Boolean(shouldReduceMotion),
  )
  const [showDivider, setShowDivider] = useState(() =>
    Boolean(shouldReduceMotion),
  )
  const [taglinePhase, setTaglinePhase] = useState<TaglinePhase>(() =>
    shouldReduceMotion ? 'true' : 'hidden',
  )

  useEffect(() => {
    if (shouldReduceMotion) {
      setFirstFlipped(true)
      setSecondFlipped(true)
      setShowDivider(true)
      setTaglinePhase('true')
      return
    }

    const t1 = window.setTimeout(() => setFirstFlipped(true), 3150)
    const t2 = window.setTimeout(() => setSecondFlipped(true), 3330)
    const t3 = window.setTimeout(() => setShowDivider(true), 4150)
    const t4 = window.setTimeout(() => setTaglinePhase('evolution'), 4550)
    const t5 = window.setTimeout(() => setTaglinePhase('true'), 6850)

    return () => {
      window.clearTimeout(t1)
      window.clearTimeout(t2)
      window.clearTimeout(t3)
      window.clearTimeout(t4)
      window.clearTimeout(t5)
    }
  }, [shouldReduceMotion])

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <AtmosphericBackground />

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-10">
        <FloatingSoup />
        <BrandWordmark
          firstFlipped={firstFlipped}
          secondFlipped={secondFlipped}
        />
        <TaglineMorph showDivider={showDivider} phase={taglinePhase} />
        <LaunchStatus />
        <DiscordCta />
      </main>

      <footer className="relative z-10 grid w-full grid-cols-1 items-center gap-3 px-6 pb-6 sm:grid-cols-3 sm:px-10">
        <div className="flex justify-center sm:justify-start">
          <a
            href="https://hunt-mc.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex origin-left cursor-pointer items-center gap-2.5 text-xs tracking-[0.06em] text-[#888] will-change-transform [backface-visibility:hidden] [transform:translateZ(0)] transition-[transform,color] duration-200 ease-out hover:[transform:translateZ(0)_scale(1.05)] hover:text-[#fafafa] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f0b000]"
          >
            <picture>
              <source srcSet={huntmcLogoWebp} type="image/webp" />
              <img
                src={huntmcLogoPng}
                alt="HuntMC"
                width={89}
                height={96}
                decoding="async"
                draggable={false}
                className="h-5 w-auto select-none opacity-85 transition-[transform,opacity,filter] duration-200 ease-out group-hover:scale-110 group-hover:opacity-100 group-hover:brightness-125 sm:h-6"
              />
            </picture>
            <span>Powered by HuntMC</span>
          </a>
        </div>

        <div className="flex items-center justify-center text-center">
          <p className="inline-flex flex-wrap items-center justify-center gap-x-1.5 text-xs tracking-[0.04em] text-[#666] select-none">
            <span>&copy; {new Date().getFullYear()}</span>
            <span className="inline-flex items-center gap-1.5">
              <picture className="inline-flex shrink-0 items-center">
                <source srcSet={soupWebp} type="image/webp" />
                <img
                  src={soupPng}
                  alt=""
                  aria-hidden="true"
                  width={1024}
                  height={682}
                  decoding="async"
                  draggable={false}
                  className="h-3.5 w-auto select-none opacity-85 sm:h-4"
                />
              </picture>
              <span>{siteConfig.brandName}.</span>
            </span>
            <span>Todos os direitos reservados.</span>
          </p>
        </div>

        <div className="hidden sm:block" aria-hidden="true" />
      </footer>
    </div>
  )
}

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <HeroStage />
    </MotionConfig>
  )
}

export default App
