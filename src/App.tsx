import { useEffect, useState } from 'react'
import { MotionConfig, useReducedMotion } from 'motion/react'
import { AtmosphericBackground } from './components/AtmosphericBackground'
import { FloatingSoup } from './components/FloatingSoup'
import { BrandWordmark } from './components/BrandWordmark'
import { TaglineMorph, type TaglinePhase } from './components/TaglineMorph'
import { LaunchStatus } from './components/LaunchStatus'
import { DiscordCta } from './components/DiscordCta'
import { siteConfig } from './config/site'

function HeroStage() {
  const shouldReduceMotion = useReducedMotion()

  const [wordmarkSuffix, setWordmarkSuffix] = useState<'HG' | 'MC'>(() =>
    shouldReduceMotion ? 'MC' : 'HG',
  )
  const [taglinePhase, setTaglinePhase] = useState<TaglinePhase>(() =>
    shouldReduceMotion ? 'true' : 'hidden',
  )

  useEffect(() => {
    if (shouldReduceMotion) {
      setWordmarkSuffix('MC')
      setTaglinePhase('true')
      return
    }

    const morphBrandTimer = window.setTimeout(() => {
      setWordmarkSuffix('MC')
    }, 1600)

    const taglineOneTimer = window.setTimeout(() => {
      setTaglinePhase('evolution')
    }, 2050)

    const taglineTwoTimer = window.setTimeout(() => {
      setTaglinePhase('true')
    }, 2950)

    return () => {
      window.clearTimeout(morphBrandTimer)
      window.clearTimeout(taglineOneTimer)
      window.clearTimeout(taglineTwoTimer)
    }
  }, [shouldReduceMotion])

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col overflow-hidden bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      <AtmosphericBackground />

      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-12">
        <FloatingSoup />
        <BrandWordmark suffix={wordmarkSuffix} />
        <TaglineMorph phase={taglinePhase} />
        <LaunchStatus />
        <DiscordCta />
      </main>

      <footer className="relative z-10 pb-5 text-center">
        <p className="font-mono text-[11px] tracking-[0.12em] text-[var(--text-muted)] opacity-45 select-none">
          &copy; {siteConfig.brandName}
        </p>
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
