'use client';

import React, { useEffect } from 'react';
import { FadeIn, ScrollReveal, StaggerList } from '@/components/motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PullQuote } from '@/components/shared/PullQuote';
import { CommitmentSection, nfeCommitmentItems } from '@/components/shared/CommitmentSection';
import { 
  Microscope, Users, Shield, Heart, Dna, Beaker, 
  ArrowRight, ExternalLink, Mail, Phone, MessageCircle,
  TrendingUp, BookOpen, Award, Globe
} from '@/components/ui/Icon';
import { trackPageView, trackCTAClick } from '@/lib/analytics';

export default function AboutPage() {
  useEffect(() => {
    trackPageView('/about', 'About NFE - Mission, Approach, and Commitment');
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
                About NFE
              </h1>
              <p className="text-xl text-nfe-muted mb-8 max-w-4xl mx-auto">
                We&apos;re revolutionizing dermatological research by focusing on melanated skin 
                and creating inclusive solutions for diverse populations worldwide.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="outline" className="text-nfe-green border-nfe-green">
                  <Microscope className="mr-2" size="sm" />
                  Research-Driven
                </Badge>
                <Badge variant="outline" className="text-nfe-green border-nfe-green">
                  <Users className="mr-2" size="sm" />
                  Community-Focused
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

      {/* Mission & Origin */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
              <div>
                <h2 className="text-4xl font-bold text-nfe-ink mb-6 font-primary">
                  Our Mission
                </h2>
                <p className="text-lg text-nfe-muted mb-6 leading-relaxed">
                  NFE (Not For Everyone) was born from a simple observation: the beauty industry 
                  has long ignored the unique needs of melanated skin. We&apos;re changing that.
                </p>
                <p className="text-lg text-nfe-muted mb-6 leading-relaxed">
                  Our mission is to advance dermatological science through rigorous research, 
                  community engagement, and privacy-first data practices that serve diverse populations.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg"
                    onClick={() => handleCTAClick('Learn About Our Research', 'About Page')}
                  >
                    <BookOpen className="mr-2" />
                    Learn About Our Research
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => handleCTAClick('Join Our Community', 'About Page')}
                  >
                    <Users className="mr-2" />
                    Join Our Community
                  </Button>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-nfe-green-100 to-nfe-gold-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Dna className="w-24 h-24 text-nfe-gold mx-auto mb-4" />
                    <p className="text-nfe-muted font-medium">Research & Innovation</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <PullQuote 
            quote="The beauty industry has systematically excluded melanated skin from research and product development. We're not just filling a gap—we're building a new foundation for inclusive dermatological science."
            author="Dr. Sarah Chen, Founder & Chief Scientific Officer"
            source="NFE Research Institute"
          />
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-20 px-4 bg-nfe-paper">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-nfe-ink mb-6 font-primary">
                Our Approach to Melanated Skin Science
              </h2>
              <p className="text-lg text-nfe-muted max-w-3xl mx-auto">
                We combine cutting-edge research with community-driven insights to create 
                solutions that truly serve melanated skin needs.
              </p>
            </div>
          </ScrollReveal>

          <StaggerList className="grid md:grid-cols-3 gap-8">
            <Card variant="elevated" className="text-center">
              <CardHeader>
                <Microscope className="mx-auto mb-4 text-nfe-gold" size="xl" />
                <CardTitle>Scientific Rigor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-nfe-muted leading-relaxed">
                  Every formulation is backed by peer-reviewed research and clinical studies 
                  specifically focused on melanated skin concerns and responses.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated" className="text-center">
              <CardHeader>
                <Users className="mx-auto mb-4 text-nfe-gold" size="xl" />
                <CardTitle>Community-Driven</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-nfe-muted leading-relaxed">
                  Our research is guided by real community needs and feedback, ensuring our 
                  solutions address actual problems faced by people with melanated skin.
                </p>
              </CardContent>
            </Card>

            <Card variant="elevated" className="text-center">
              <CardHeader>
                <Shield className="mx-auto mb-4 text-nfe-gold" size="xl" />
                <CardTitle>Privacy-First</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-nfe-muted leading-relaxed">
                  Your data belongs to you. We use end-to-end encryption and never sell 
                  your personal information, ensuring your privacy is always protected.
                </p>
              </CardContent>
            </Card>
          </StaggerList>
        </div>
      </section>

      {/* Technology & Accessibility */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-nfe-ink mb-6 font-primary">
                  Technology & Accessibility Commitment
                </h2>
                <p className="text-lg text-nfe-muted mb-6 leading-relaxed">
                  We believe that advanced skincare science should be accessible to everyone. 
                  Our technology platform is designed with inclusivity at its core.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-nfe-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Globe className="w-4 h-4 text-nfe-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-nfe-ink mb-1">Global Accessibility</h3>
                      <p className="text-nfe-muted">Our platform is designed to work across different devices, languages, and accessibility needs.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-nfe-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-nfe-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-nfe-ink mb-1">Data Security</h3>
                      <p className="text-nfe-muted">End-to-end encryption and privacy-first design ensure your information stays secure.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-nfe-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Heart className="w-4 h-4 text-nfe-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-nfe-ink mb-1">Inclusive Design</h3>
                      <p className="text-nfe-muted">Every feature is designed with diverse users in mind, from color contrast to screen reader compatibility.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-nfe-gold-100 to-nfe-green-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Beaker className="w-24 h-24 text-nfe-gold mx-auto mb-4" />
                    <p className="text-nfe-muted font-medium">Innovation & Inclusion</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 bg-nfe-paper">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-nfe-ink mb-6 font-primary">
                Our Team
              </h2>
              <p className="text-lg text-nfe-muted max-w-3xl mx-auto">
                We&apos;re a diverse team of scientists, researchers, and community advocates 
                united by our commitment to inclusive dermatological science.
              </p>
            </div>
          </ScrollReveal>

          <StaggerList className="grid md:grid-cols-3 gap-8">
            <Card variant="default" className="text-center">
              <CardHeader>
                <div className="w-24 h-24 bg-nfe-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Microscope className="w-12 h-12 text-nfe-gold" />
                </div>
                <CardTitle>Dr. Sarah Chen</CardTitle>
                <p className="text-nfe-gold font-medium">Founder & Chief Scientific Officer</p>
              </CardHeader>
              <CardContent>
                <p className="text-nfe-muted text-sm">
                  Leading dermatologist with 15+ years of experience in melanated skin research. 
                  Published author and advocate for inclusive dermatological science.
                </p>
              </CardContent>
            </Card>

            <Card variant="default" className="text-center">
              <CardHeader>
                <div className="w-24 h-24 bg-nfe-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-12 h-12 text-nfe-gold" />
                </div>
                <CardTitle>Dr. Maria Rodriguez</CardTitle>
                <p className="text-nfe-gold font-medium">Head of Community Research</p>
              </CardHeader>
              <CardContent>
                <p className="text-nfe-muted text-sm">
                  Community health specialist focused on inclusive research methodologies. 
                  Expert in building trust and engagement with diverse populations.
                </p>
              </CardContent>
            </Card>

            <Card variant="default" className="text-center">
              <CardHeader>
                <div className="w-24 h-24 bg-nfe-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-12 h-12 text-nfe-gold" />
                </div>
                <CardTitle>Alex Kim</CardTitle>
                <p className="text-nfe-gold font-medium">Chief Technology Officer</p>
              </CardHeader>
              <CardContent>
                <p className="text-nfe-muted text-sm">
                  Privacy and security expert with a passion for accessible technology. 
                  Leads our technical infrastructure and user experience design.
                </p>
              </CardContent>
            </Card>
          </StaggerList>
        </div>
      </section>

      {/* Compliance & Trust */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-nfe-ink mb-6 font-primary">
                Compliance & Trust
              </h2>
              <p className="text-lg text-nfe-muted max-w-3xl mx-auto">
                We maintain the highest standards of research ethics, data protection, 
                and regulatory compliance in everything we do.
              </p>
            </div>
          </ScrollReveal>

          <StaggerList className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card variant="outline" className="text-center">
              <CardHeader>
                <Award className="mx-auto mb-4 text-nfe-gold" size="xl" />
                <CardTitle>IRB Approved</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-nfe-muted">
                  All research protocols reviewed and approved by independent ethics boards
                </p>
              </CardContent>
            </Card>

            <Card variant="outline" className="text-center">
              <CardHeader>
                <Shield className="mx-auto mb-4 text-nfe-gold" size="xl" />
                <CardTitle>GDPR Compliant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-nfe-muted">
                  Full compliance with international data protection regulations
                </p>
              </CardContent>
            </Card>

            <Card variant="outline" className="text-center">
              <CardHeader>
                <BookOpen className="mx-auto mb-4 text-nfe-gold" size="xl" />
                <CardTitle>Peer Reviewed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-nfe-muted">
                  Research published in top-tier dermatological journals
                </p>
              </CardContent>
            </Card>

            <Card variant="outline" className="text-center">
              <CardHeader>
                <TrendingUp className="mx-auto mb-4 text-nfe-gold" size="xl" />
                <CardTitle>Transparent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-nfe-muted">
                  Open about our methods, findings, and limitations
                </p>
              </CardContent>
            </Card>
          </StaggerList>
        </div>
      </section>

      {/* Our Commitment */}
      <CommitmentSection 
        title="Our Commitment to You"
        subtitle="We're dedicated to advancing inclusive dermatological science through rigorous research, community engagement, and privacy-first data practices."
        items={nfeCommitmentItems}
        className="bg-nfe-paper"
      />

      {/* Contact Information */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-nfe-ink mb-6 font-primary">
                Get in Touch
              </h2>
              <p className="text-lg text-nfe-muted">
                Have questions about our research or want to get involved? We&apos;d love to hear from you.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            <Card variant="outline" className="text-center">
              <CardHeader>
                <Mail className="mx-auto mb-4 text-nfe-gold" size="xl" />
                <CardTitle>Email Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-nfe-muted mb-4">
                  For general inquiries and research questions
                </p>
                <Button variant="outline" size="sm">
                  <Mail className="mr-2" />
                  hello@nfe-beauty.com
                </Button>
              </CardContent>
            </Card>

            <Card variant="outline" className="text-center">
              <CardHeader>
                <MessageCircle className="mx-auto mb-4 text-nfe-gold" size="xl" />
                <CardTitle>Community</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-nfe-muted mb-4">
                  Join our research community and focus groups
                </p>
                <Button variant="outline" size="sm">
                  <Users className="mr-2" />
                  Join Community
                </Button>
              </CardContent>
            </Card>

            <Card variant="outline" className="text-center">
              <CardHeader>
                <Phone className="mx-auto mb-4 text-nfe-gold" size="xl" />
                <CardTitle>Research Partnerships</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-nfe-muted mb-4">
                  For institutional collaborations and partnerships
                </p>
                <Button variant="outline" size="sm">
                  <ExternalLink className="mr-2" />
                  Research Partnerships
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}