import { Container } from '@/components/custom/container'
import { CtaSection } from './sections/cta-section'
import { FeaturesSection } from './sections/features-section'
import { HeroSection } from './sections/hero-section'
import { LandingFooter } from './sections/landing-footer'
import { LandingHeader } from './sections/landing-header'
import { ProductPreviewSection } from './sections/product-preview-section'
import { WorkflowSection } from './sections/workflow-section'

export const LandingPage = () => {
  return (
    <div className='min-h-screen bg-background text-foreground'>
      <LandingHeader />

      <main id='main-content'>
        <HeroSection />
        <Container>
          <FeaturesSection />
          <ProductPreviewSection />
          <WorkflowSection />
          <CtaSection />
        </Container>
      </main>

      <LandingFooter />
    </div>
  )
}
