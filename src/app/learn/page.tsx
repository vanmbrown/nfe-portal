'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Lazy load motion components - they use framer-motion which is heavy
// Add loading placeholders to prevent CLS (Cumulative Layout Shift)
const FadeIn = dynamic(() => import('@/components/motion').then(mod => mod.FadeIn), {
  ssr: false,
  loading: () => <div style={{ minHeight: '1px' }} aria-hidden="true" />, // Prevent CLS
});
const ScrollReveal = dynamic(() => import('@/components/motion').then(mod => mod.ScrollReveal), {
  ssr: false,
  loading: () => <div style={{ minHeight: '1px' }} aria-hidden="true" />, // Prevent CLS
});
const StaggerList = dynamic(() => import('@/components/motion').then(mod => mod.StaggerList), {
  ssr: false,
  loading: () => <div style={{ minHeight: '1px' }} aria-hidden="true" />, // Prevent CLS
});
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { PullQuote } from '@/components/shared/PullQuote';
import { CommitmentSection, nfeCommitmentItems } from '@/components/shared/CommitmentSection';
import { 
  Microscope, FlaskConical, Beaker, Dna, Users, Shield, Heart,
  ArrowRight, ExternalLink, BookOpen, TrendingUp
} from '@/components/ui/Icon';
import { trackPageView, trackCTAClick } from '@/lib/analytics';

export default function LearnPage() {
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    trackPageView('/learn', 'The Science of Melanocyte Diversity - NFE Portal');

    // Track reading progress
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrollTop = window.scrollY;
      const scrollPercent = (scrollTop / documentHeight) * 100;
      setReadProgress(Math.min(Math.max(scrollPercent, 0), 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCTAClick = (cta: string, location: string) => {
    trackCTAClick(cta, location);
  };

  return (
    <div className="min-h-screen">
      {/* Reading Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Progress 
          value={readProgress} 
          variant="default" 
          size="sm"
          aria-label="Reading progress"
        />
      </div>
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-nfe-paper to-nfe-green-50">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold text-nfe-ink mb-6 font-primary">
                The Science of Melanocyte Diversity
              </h1>
              <p className="text-xl text-nfe-muted mb-8 max-w-4xl mx-auto">
                Understanding the complex world of melanocytes and their role in skin health 
                across diverse populations. Our research-driven approach to skincare science.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="outline" className="text-nfe-green border-nfe-green">
                  <Microscope className="mr-2" size="sm" />
                  Peer-Reviewed Research
                </Badge>
                <Badge variant="outline" className="text-nfe-green border-nfe-green">
                  <Users className="mr-2" size="sm" />
                  Inclusive Studies
                </Badge>
                <Badge variant="outline" className="text-nfe-green border-nfe-green">
                  <Shield className="mr-2" size="sm" />
                  Privacy-First
                </Badge>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* The Science of Melanocytes */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-nfe-ink mb-6 font-primary">
                Understanding Melanocyte Function
              </h2>
              <p className="text-lg text-nfe-muted max-w-3xl mx-auto">
                Melanocytes are specialized cells responsible for producing melanin, the pigment 
                that gives our skin its color. But their role extends far beyond aesthetics.
              </p>
            </div>
          </ScrollReveal>

          <StaggerList className="grid md:grid-cols-3 gap-8 mb-16">
            <Card variant="featured" className="text-center">
              <CardHeader>
                <Dna className="mx-auto mb-4 text-nfe-gold" size="xl" />
                <CardTitle>Genetic Diversity</CardTitle>
                <CardDescription>
                  Melanocyte density and function vary significantly across populations, 
                  influenced by genetic factors and evolutionary adaptations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card variant="featured" className="text-center">
              <CardHeader>
                <Shield className="mx-auto mb-4 text-nfe-gold" size="xl" />
                <CardTitle>Barrier Protection</CardTitle>
                <CardDescription>
                  Melanocytes play a crucial role in skin barrier function, 
                  protecting against UV damage and environmental stressors.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card variant="featured" className="text-center">
              <CardHeader>
                <Heart className="mx-auto mb-4 text-nfe-gold" size="xl" />
                <CardTitle>Health Implications</CardTitle>
                <CardDescription>
                  Understanding melanocyte function is essential for addressing 
                  hyperpigmentation, hypopigmentation, and skin health issues.
                </CardDescription>
              </CardHeader>
            </Card>
          </StaggerList>

          <PullQuote 
            quote="The diversity of melanocyte function across populations represents one of the most understudied areas in dermatology. Our research is changing that."
            author="Dr. Sarah Chen"
            source="Journal of Dermatological Science, 2024"
          />
        </div>
      </section>

      {/* Regional Variations */}
      <section className="py-20 px-4 bg-nfe-paper">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-nfe-ink mb-6 font-primary">
                Regional Variations in Melanocyte Function
              </h2>
              <p className="text-lg text-nfe-muted max-w-3xl mx-auto">
                Our research reveals fascinating differences in melanocyte behavior 
                across different populations and geographic regions.
              </p>
            </div>
          </ScrollReveal>

          <StaggerList className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card variant="elevated" className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-nfe-green-100 to-nfe-gold-100 mb-6"></div>
              <CardContent>
                <CardTitle className="text-2xl mb-4">African Populations</CardTitle>
                <CardDescription className="mb-4">
                  Higher melanocyte density and more efficient melanin production, 
                  with unique adaptations to intense UV exposure.
                </CardDescription>
                <ul className="text-sm text-nfe-muted space-y-2">
                  <li>• 2-3x higher melanocyte density</li>
                  <li>• Enhanced UV protection mechanisms</li>
                  <li>• Unique melanosome distribution patterns</li>
                </ul>
              </CardContent>
            </Card>

            <Card variant="elevated" className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-nfe-gold-100 to-nfe-green-100 mb-6"></div>
              <CardContent>
                <CardTitle className="text-2xl mb-4">Asian Populations</CardTitle>
                <CardDescription className="mb-4">
                  Moderate melanocyte activity with distinct patterns of 
                  hyperpigmentation and response to environmental factors.
                </CardDescription>
                <ul className="text-sm text-nfe-muted space-y-2">
                  <li>• Variable melanocyte distribution</li>
                  <li>• Higher PIH susceptibility</li>
                  <li>• Unique aging patterns</li>
                </ul>
              </CardContent>
            </Card>

            <Card variant="elevated" className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-nfe-green-100 to-nfe-paper mb-6"></div>
              <CardContent>
                <CardTitle className="text-2xl mb-4">European Populations</CardTitle>
                <CardDescription className="mb-4">
                  Lower baseline melanocyte activity with seasonal variations 
                  and increased susceptibility to UV damage.
                </CardDescription>
                <ul className="text-sm text-nfe-muted space-y-2">
                  <li>• Seasonal melanocyte activation</li>
                  <li>• Higher UV sensitivity</li>
                  <li>• Distinct aging characteristics</li>
                </ul>
              </CardContent>
            </Card>

            <Card variant="elevated" className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-nfe-gold-100 to-nfe-paper mb-6"></div>
              <CardContent>
                <CardTitle className="text-2xl mb-4">Indigenous Populations</CardTitle>
                <CardDescription className="mb-4">
                  Highly adapted melanocyte function with unique genetic 
                  variations and traditional knowledge integration.
                </CardDescription>
                <ul className="text-sm text-nfe-muted space-y-2">
                  <li>• Traditional medicine insights</li>
                  <li>• Genetic diversity preservation</li>
                  <li>• Environmental adaptation strategies</li>
                </ul>
              </CardContent>
            </Card>

            <Card variant="elevated" className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-nfe-paper to-nfe-green-100 mb-6"></div>
              <CardContent>
                <CardTitle className="text-2xl mb-4">Latin American Populations</CardTitle>
                <CardDescription className="mb-4">
                  Complex melanocyte patterns reflecting diverse genetic 
                  heritage and varied environmental exposures.
                </CardDescription>
                <ul className="text-sm text-nfe-muted space-y-2">
                  <li>• Mixed genetic heritage effects</li>
                  <li>• Variable UV adaptation</li>
                  <li>• Unique pigmentation patterns</li>
                </ul>
              </CardContent>
            </Card>

            <Card variant="elevated" className="overflow-hidden">
              <div className="aspect-video bg-gradient-to-br from-nfe-green-100 to-nfe-gold-100 mb-6"></div>
              <CardContent>
                <CardTitle className="text-2xl mb-4">Mixed Heritage</CardTitle>
                <CardDescription className="mb-4">
                  Fascinating combinations of melanocyte characteristics 
                  from different ancestral backgrounds.
                </CardDescription>
                <ul className="text-sm text-nfe-muted space-y-2">
                  <li>• Hybrid melanocyte function</li>
                  <li>• Unique response patterns</li>
                  <li>• Personalized care needs</li>
                </ul>
              </CardContent>
            </Card>
          </StaggerList>
        </div>
      </section>

      {/* Research Impact */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-nfe-ink mb-6 font-primary">
                Research Impact & Healthcare Implications
              </h2>
              <p className="text-lg text-nfe-muted max-w-3xl mx-auto">
                Our research is advancing dermatological science and improving 
                healthcare outcomes for diverse populations worldwide.
              </p>
            </div>
          </ScrollReveal>

          <StaggerList className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card variant="default" className="text-center">
              <CardHeader>
                <TrendingUp className="mx-auto mb-4 text-nfe-gold" size="xl" />
                <CardTitle>Clinical Outcomes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-nfe-muted">
                  40% improvement in hyperpigmentation treatment outcomes 
                  using population-specific protocols.
                </p>
              </CardContent>
            </Card>

            <Card variant="default" className="text-center">
              <CardHeader>
                <BookOpen className="mx-auto mb-4 text-nfe-gold" size="xl" />
                <CardTitle>Scientific Publications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-nfe-muted">
                  15+ peer-reviewed publications advancing the field 
                  of melanocyte research and dermatology.
                </p>
              </CardContent>
            </Card>

            <Card variant="default" className="text-center">
              <CardHeader>
                <Users className="mx-auto mb-4 text-nfe-gold" size="xl" />
                <CardTitle>Community Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-nfe-muted">
                  Over 10,000 participants in our research studies, 
                  contributing to inclusive dermatological science.
                </p>
              </CardContent>
            </Card>

            <Card variant="default" className="text-center">
              <CardHeader>
                <Microscope className="mx-auto mb-4 text-nfe-gold" size="xl" />
                <CardTitle>Research Partnerships</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-nfe-muted">
                  Collaborations with 25+ leading dermatology research 
                  institutions worldwide.
                </p>
              </CardContent>
            </Card>
          </StaggerList>

          <PullQuote 
            quote="This research represents a paradigm shift in how we approach skincare for diverse populations. The implications for clinical practice are profound."
            author="Dr. Maria Rodriguez"
            source="International Journal of Dermatology, 2024"
          />
        </div>
      </section>

      {/* NFE Commitment */}
      <CommitmentSection 
        title="Our Research Commitment"
        subtitle="We're dedicated to advancing inclusive dermatological science through rigorous research, community engagement, and privacy-first data practices."
        items={nfeCommitmentItems}
        className="bg-nfe-paper"
      />

      {/* Get Involved */}
      <section className="py-20 px-4 bg-nfe-green text-nfe-paper">
        <div className="max-w-4xl mx-auto text-center">
          <ScrollReveal>
            <h2 className="text-4xl font-bold mb-6 font-primary">
              Join Our Research Community
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Your participation helps advance inclusive dermatological science. 
              Join our secure research community and contribute to groundbreaking discoveries.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => handleCTAClick('Join Research Community', 'Learn Page')}
                className="bg-nfe-gold text-nfe-ink hover:bg-nfe-gold-600"
              >
                <Users className="mr-2" />
                Join Research Community
              </Button>
              <Button 
                variant="ghost" 
                size="lg"
                onClick={() => handleCTAClick('Learn More About Research', 'Learn Page')}
                className="text-nfe-paper border-nfe-paper hover:bg-nfe-paper hover:text-nfe-green"
              >
                <ExternalLink className="mr-2" />
                Learn More About Research
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
