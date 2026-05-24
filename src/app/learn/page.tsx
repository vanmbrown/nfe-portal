'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const FadeIn = dynamic(() => import('@/components/motion').then(mod => mod.FadeIn), {
  ssr: false,
  loading: () => <div style={{ minHeight: '1px' }} aria-hidden="true" />,
});
const ScrollReveal = dynamic(() => import('@/components/motion').then(mod => mod.ScrollReveal), {
  ssr: false,
  loading: () => <div style={{ minHeight: '1px' }} aria-hidden="true" />,
});
const StaggerList = dynamic(() => import('@/components/motion').then(mod => mod.StaggerList), {
  ssr: false,
  loading: () => <div style={{ minHeight: '1px' }} aria-hidden="true" />,
});
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { CommitmentSection, nfeCommitmentItems } from '@/components/shared/CommitmentSection';
import {
  Microscope, Dna, Shield, Heart, Users, ArrowRight
} from '@/components/ui/Icon';
import { trackPageView } from '@/lib/analytics';
import Link from 'next/link';

export default function LearnPage() {
  const [readProgress, setReadProgress] = useState(0);

  useEffect(() => {
    trackPageView('/learn', 'The Science of Melanocyte Diversity - NFE');

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
                Understanding melanocyte biology is the foundation of NFE — and why melanated skin
                has long deserved more from the beauty industry.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="outline" className="text-nfe-green border-nfe-green">
                  <Microscope className="mr-2" size="sm" />
                  Science-Led
                </Badge>
                <Badge variant="outline" className="text-nfe-green border-nfe-green">
                  <Users className="mr-2" size="sm" />
                  Melanated Skin Focus
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
                Research reveals meaningful differences in melanocyte behavior
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
                  <li>• 2–3× higher melanocyte density</li>
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

      {/* NFE Commitment */}
      <CommitmentSection
        title="Our Commitment to You"
        subtitle="NFE formulations are informed by what the science of melanated skin actually shows — not trends, not guesswork."
        items={nfeCommitmentItems}
        className="bg-nfe-paper"
      />

      {/* Quiet CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-nfe-muted mb-4">
            Your skin is the data we care about most.
          </p>
          <Link
            href="/community-input"
            className="inline-flex items-center gap-2 text-nfe-gold hover:text-nfe-ink transition-colors duration-200 font-medium"
          >
            Share your skin story <ArrowRight size="sm" />
          </Link>
        </div>
      </section>
    </div>
  );
}
