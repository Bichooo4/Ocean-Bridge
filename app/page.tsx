import { LandingNav }        from '@/components/landing/LandingNav'
import { HeroSection }       from '@/components/landing/HeroSection'
import { StatsSection }      from '@/components/landing/StatsSection'
import { FeaturesSection }   from '@/components/landing/FeaturesSection'
import { HowItWorksSection } from '@/components/landing/HowItWorksSection'
import { CTASection }        from '@/components/landing/CTASection'
import { LandingFooter }     from '@/components/landing/LandingFooter'

export default function LandingPage() {
  return (
    <main>
      <LandingNav />
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <LandingFooter />
    </main>
  )
}
