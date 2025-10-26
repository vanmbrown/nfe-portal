'use client';

import NFESkinLayersMap from '@/components/interactive/NFESkinLayersMap'
import NFEMelanocyteMap from '@/components/interactive/NFEMelanocyteMap'
import { FadeIn, ScrollReveal, StaggerList } from '@/components/motion'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge, CategoryBadge } from '@/components/ui/Badge'
import { NewsletterSignup } from '@/components/forms/NewsletterSignup'
import { 
  Microscope, FlaskConical, Shield, Heart, Check, Users, Dna
} from '@/components/ui/Icon'
import { trackPageView, trackCTAClick } from '@/lib/analytics'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    trackPageView('/', 'NFE Portal - Well Aging Through Science');
  }, []);

  const handleCTAClick = (cta: string, location: string) => {
    trackCTAClick(cta, location);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-nfe-paper to-nfe-green-50">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold text-nfe-ink mb-6 font-primary">
                Understanding Melanocyte Diversity
              </h1>
              <p className="text-xl text-nfe-muted mb-8 max-w-3xl mx-auto">
                Science-backed skincare for melanated skin through barrier-first approach. 
                Join our research community to advance inclusive dermatological science.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => handleCTAClick('Explore Science', 'Hero')}
                  className="bg-nfe-gold text-nfe-ink hover:bg-nfe-gold-600"
                >
                  <Microscope className="mr-2" />
                  Explore the Science
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={() => handleCTAClick('Join Focus Group', 'Hero')}
                >
                  <Users className="mr-2" />
                  Join Focus Group
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Brand Promise Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-nfe-ink mb-6 font-primary">
                Not For Everyone
              </h2>
              <p className="text-lg text-nfe-muted max-w-3xl mx-auto">
                Our quiet luxury approach focuses on evidence-led formulations 
                specifically designed for melanated skin needs.
              </p>
            </div>
          </ScrollReveal>

          <StaggerList className="grid md:grid-cols-3 gap-8">
            <Card variant="featured" className="text-center">
              <CardHeader>
                <FlaskConical size="xl" className="mx-auto mb-4 text-nfe-gold" />
                <CardTitle>Science-First</CardTitle>
                <CardDescription>
                  Every ingredient is backed by peer-reviewed research and clinical studies.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card variant="featured" className="text-center">
              <CardHeader>
                <Shield className="mx-auto mb-4 text-nfe-gold" size="xl" />
                <CardTitle>Barrier-First</CardTitle>
                <CardDescription>
                  We prioritize skin barrier health to prevent inflammation and hyperpigmentation.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card variant="featured" className="text-center">
              <CardHeader>
                <Heart className="mx-auto mb-4 text-nfe-gold" size="xl" />
                <CardTitle>Inclusive Research</CardTitle>
                <CardDescription>
                  Our studies include diverse populations to ensure effective solutions for all skin tones.
                </CardDescription>
              </CardHeader>
            </Card>
          </StaggerList>
        </div>
      </section>

      {/* Hero Products Section */}
      <section className="py-20 px-4 bg-nfe-paper">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-nfe-ink mb-6 font-primary">
                Our Formulations
              </h2>
              <p className="text-lg text-nfe-muted max-w-3xl mx-auto">
                Carefully crafted products that address the unique needs of melanated skin.
              </p>
            </div>
          </ScrollReveal>

          <StaggerList className="grid md:grid-cols-2 gap-12">
            <Card variant="elevated" className="overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-nfe-green-100 to-nfe-gold-100 mb-6"></div>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <CategoryBadge category="Face Care" />
                  <Badge variant="success">New</Badge>
                </div>
                <CardTitle className="text-2xl mb-4">Face Elixir</CardTitle>
                <CardDescription className="mb-6">
                  THD Ascorbate + Bakuchiol + Peptides. A potent, barrier-first serum 
                  designed specifically for melanated skin.
                </CardDescription>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <Check className="text-nfe-green" size="sm" />
                    <span className="text-sm">15% THD Ascorbate (stable vitamin C)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="text-nfe-green" size="sm" />
                    <span className="text-sm">1% Bakuchiol (retinol alternative)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="text-nfe-green" size="sm" />
                    <span className="text-sm">Copper peptides for skin repair</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold text-nfe-green">$89</span>
                  <Button variant="primary">Learn More</Button>
                </div>
              </CardContent>
            </Card>

            <Card variant="elevated" className="overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-nfe-gold-100 to-nfe-green-100 mb-6"></div>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <CategoryBadge category="Body Care" />
                  <Badge variant="info">Best Seller</Badge>
                </div>
                <CardTitle className="text-2xl mb-4">Body Elixir</CardTitle>
                <CardDescription className="mb-6">
                  Ceramide Complex + Botanical Oils. A luxurious body serum featuring 
                  cacay oil and blue tansy for comprehensive nourishment.
                </CardDescription>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <Check className="text-nfe-green" size="sm" />
                    <span className="text-sm">Ceramide complex for barrier repair</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="text-nfe-green" size="sm" />
                    <span className="text-sm">Cacay oil (non-comedogenic)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="text-nfe-green" size="sm" />
                    <span className="text-sm">Blue tansy for anti-inflammatory benefits</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-3xl font-bold text-nfe-green">$79</span>
                  <Button variant="primary">Learn More</Button>
                </div>
              </CardContent>
            </Card>
          </StaggerList>
        </div>
      </section>

      {/* Interactive Science Preview */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-nfe-ink mb-6 font-primary">
                Interactive Science Layer
              </h2>
              <p className="text-lg text-nfe-muted max-w-3xl mx-auto">
                Explore the science behind melanocyte diversity and skin barrier function 
                through our interactive research tools.
              </p>
            </div>
          </ScrollReveal>
          
          <StaggerList className="grid md:grid-cols-2 gap-8">
            <Card variant="default" className="p-8">
              <CardHeader>
                <CardTitle className="text-2xl mb-4">
                  <Microscope className="inline mr-2" />
                  Skin Layers Map
                </CardTitle>
                <CardDescription>
                  Interactive visualization of skin layer interactions with active ingredients.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NFESkinLayersMap />
              </CardContent>
            </Card>
            
            <Card variant="default" className="p-8">
              <CardHeader>
                <CardTitle className="text-2xl mb-4">
                  <Dna className="inline mr-2" />
                  Melanocyte Map
                </CardTitle>
                <CardDescription>
                  Educational tool showing melanocyte distribution and function across populations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NFEMelanocyteMap />
              </CardContent>
            </Card>
          </StaggerList>
        </div>
      </section>

      {/* Focus Group Invitation */}
      <section className="py-20 px-4 bg-nfe-green text-nfe-paper">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-4xl font-bold mb-6 font-primary">
              Join Our Research Community
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Your skin, your data, your privacy. Participate in secure, private research 
              that advances inclusive dermatological science.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => handleCTAClick('Join Research Community', 'Focus Group')}
                className="bg-nfe-gold text-nfe-ink hover:bg-nfe-gold-600"
              >
                <Users className="mr-2" />
                Join Research Community
              </Button>
              <Button 
                variant="ghost" 
                size="lg"
                onClick={() => handleCTAClick('Learn More', 'Focus Group')}
                className="text-nfe-paper border-nfe-paper hover:bg-nfe-paper hover:text-nfe-green"
              >
                Learn More
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 px-4 bg-nfe-paper">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-nfe-ink mb-6 font-primary">
                Stay Connected
              </h2>
              <p className="text-lg text-nfe-muted">
                Join our community for updates, exclusive content, and research insights.
              </p>
            </div>
          </ScrollReveal>

          <FadeIn>
            <Card variant="featured" className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <NewsletterSignup />
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </section>
    </div>
  )
}