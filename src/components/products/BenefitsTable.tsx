import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CheckCircle, Clock, TrendingUp } from '@/components/ui/Icon';
import { ProductData } from '@/content/products/face-elixir';
import { cn } from '@/lib/utils';

interface BenefitsTableProps {
  product: ProductData;
  className?: string;
}

export function BenefitsTable({ product, className = '' }: BenefitsTableProps) {
  const [sortBy, setSortBy] = useState<'timeline' | 'benefit'>('timeline');

  // Sort benefits based on current sort option
  const sortedBenefits = [...product.benefits].sort((a, b) => {
    if (sortBy === 'timeline') {
      // Extract numbers from timeline strings for sorting
      const aTime = parseInt(a.timeline.match(/\d+/)?.[0] || '0');
      const bTime = parseInt(b.timeline.match(/\d+/)?.[0] || '0');
      return aTime - bTime;
    }
    return a.title.localeCompare(b.title);
  });

  const getTimelineColor = (timeline: string) => {
    if (timeline.includes('Immediate') || timeline.includes('1 week')) {
      return 'bg-green-50 text-green-800 border-green-200';
    }
    if (timeline.includes('2-4 weeks') || timeline.includes('4-6 weeks')) {
      return 'bg-blue-50 text-blue-800 border-blue-200';
    }
    if (timeline.includes('6-12 weeks') || timeline.includes('8-12 weeks')) {
      return 'bg-purple-50 text-purple-800 border-purple-200';
    }
    return 'bg-gray-50 text-gray-800 border-gray-200';
  };

  const getTimelineIcon = (timeline: string) => {
    if (timeline.includes('Immediate')) {
      return <CheckCircle className="w-4 h-4" />;
    }
    if (timeline.includes('weeks')) {
      return <Clock className="w-4 h-4" />;
    }
    return <TrendingUp className="w-4 h-4" />;
  };

  return (
    <section className={cn('py-12 px-4', className)}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-nfe-ink mb-4 font-primary">
            Benefits & Ritual Expectations
          </h2>
          <p className="text-lg text-nfe-muted">
            Cosmetic skincare benefits framed with measured, claim-safe language.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'timeline' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSortBy('timeline')}
            >
              Sort by Timeline
            </Button>
            <Button
              variant={sortBy === 'benefit' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSortBy('benefit')}
            >
              Sort by Benefit
            </Button>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {sortedBenefits.map((benefit, index) => (
            <Card key={index} variant="elevated" className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between mb-4">
                  <CardTitle className="text-xl">{benefit.title}</CardTitle>
                  <Badge 
                    variant="outline" 
                    className={getTimelineColor(benefit.timeline)}
                  >
                    <div className="flex items-center gap-2">
                      {getTimelineIcon(benefit.timeline)}
                      {benefit.timeline}
                    </div>
                  </Badge>
                </div>
                <p className="text-nfe-muted leading-relaxed">
                  {benefit.description}
                </p>
              </CardHeader>
              
            </Card>
          ))}
        </div>

        {/* Proof discipline summary */}
        <Card variant="featured" className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <TrendingUp className="w-6 h-6 text-nfe-gold flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-nfe-ink mb-2">
                  Proof Discipline
                </h3>
                <p className="text-nfe-muted">
                  {product.name} is presented as cosmetic skincare. Future
                  testing, customer feedback, and review signals will be kept
                  distinct so the brand can build trust without overstating
                  results.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Timeline */}
        <Card variant="outline">
          <CardHeader>
            <CardTitle className="text-xl">Ritual Feel Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <h4 className="font-semibold text-nfe-ink">Week 1-2: Initial Hydration</h4>
                  <p className="text-sm text-nfe-muted">Skin may feel more cushioned, hydrated, and comfortable.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <h4 className="font-semibold text-nfe-ink">Week 4-6: Barrier Comfort</h4>
                  <p className="text-sm text-nfe-muted">Consistent use may support a steadier, more nourished skin feel.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <h4 className="font-semibold text-nfe-ink">Week 8-12: Visible Radiance</h4>
                  <p className="text-sm text-nfe-muted">Skin may appear more supple, radiant, and even-looking with continued use.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
