import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Shield, Users, Microscope, Heart } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';

interface CommitmentItem {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
}

interface CommitmentSectionProps {
  title?: string;
  subtitle?: string;
  items: CommitmentItem[];
  className?: string;
}

export function CommitmentSection({ 
  title = "Our Commitment",
  subtitle,
  items,
  className = '' 
}: CommitmentSectionProps) {
  return (
    <section className={cn('py-16 px-4', className)}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-nfe-ink mb-6 font-primary">
            {title}
          </h2>
          {subtitle && (
            <p className="text-lg text-nfe-muted max-w-3xl mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <Card key={index} variant="default" className="text-center h-full">
              <CardHeader>
                <item.icon 
                  className="mx-auto mb-4 text-nfe-gold" 
                  size="xl" 
                />
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-nfe-muted leading-relaxed">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pre-configured commitment items for NFE
export const nfeCommitmentItems: CommitmentItem[] = [
  {
    icon: Microscope,
    title: "Scientific Rigor",
    description: "Every formulation is backed by peer-reviewed research and clinical studies specifically focused on melanated skin."
  },
  {
    icon: Shield,
    title: "Privacy First",
    description: "Your data belongs to you. We use end-to-end encryption and never sell your personal information."
  },
  {
    icon: Users,
    title: "Inclusive Research",
    description: "Our studies include diverse populations to ensure effective solutions for all skin tones and types."
  },
  {
    icon: Heart,
    title: "Community Focused",
    description: "We're building a community-driven approach to skincare research, not just another beauty brand."
  }
];
