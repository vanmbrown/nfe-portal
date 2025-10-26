import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { 
  Clock, CheckCircle, AlertCircle, Info, 
  Sun, Moon, Droplets, Shield, Heart
} from '@/components/ui/Icon';
import { ProductData } from '@/content/products/face-elixir';
import { cn } from '@/lib/utils';

interface UsageGuideProps {
  product: ProductData;
  className?: string;
}

export function UsageGuide({ product, className = '' }: UsageGuideProps) {
  const [activeStep, setActiveStep] = useState(0);

  const usageSteps = [
    {
      icon: Droplets,
      title: 'Cleanse',
      description: 'Start with clean, dry skin. Use a gentle cleanser suitable for your skin type.',
      details: 'Remove all makeup, sunscreen, and impurities. Pat skin dry with a clean towel.',
      timing: '2-3 minutes'
    },
    {
      icon: Clock,
      title: 'Wait',
      description: 'Allow skin to completely dry before applying the serum.',
      details: 'This ensures maximum absorption and prevents dilution of active ingredients.',
      timing: '2-5 minutes'
    },
    {
      icon: Droplets,
      title: 'Apply',
      description: product.usage.application,
      details: 'Use gentle, upward motions. Avoid the eye area and any sensitive areas.',
      timing: '1-2 minutes'
    },
    {
      icon: Shield,
      title: 'Protect',
      description: 'Follow with SPF during the day or a moisturizer at night.',
      details: 'This completes your routine and protects your skin barrier.',
      timing: '1-2 minutes'
    }
  ];

  const getStepIcon = (index: number) => {
    if (index < activeStep) {
      return <CheckCircle className="w-6 h-6 text-green-600" />;
    }
    if (index === activeStep) {
      return <Clock className="w-6 h-6 text-nfe-gold" />;
    }
    return <div className="w-6 h-6 border-2 border-nfe-muted rounded-full" />;
  };

  return (
    <section className={cn('py-12 px-4', className)}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-nfe-ink mb-4 font-primary">
            How to Use {product.name}
          </h2>
          <p className="text-lg text-nfe-muted">
            Follow these simple steps for optimal results and skin safety.
          </p>
        </div>

        {/* Usage Frequency */}
        <Card variant="featured" className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Clock className="w-6 h-6 text-nfe-gold flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-nfe-ink mb-2">
                  Usage Frequency
                </h3>
                <p className="text-nfe-muted mb-4">
                  {product.usage.frequency}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-nfe-paper rounded-lg">
                    <Sun className="w-5 h-5 text-nfe-gold mx-auto mb-2" />
                    <div className="font-semibold">Morning</div>
                    <div className="text-nfe-muted">With SPF</div>
                  </div>
                  <div className="text-center p-3 bg-nfe-paper rounded-lg">
                    <Moon className="w-5 h-5 text-nfe-gold mx-auto mb-2" />
                    <div className="font-semibold">Evening</div>
                    <div className="text-nfe-muted">With moisturizer</div>
                  </div>
                  <div className="text-center p-3 bg-nfe-paper rounded-lg">
                    <Heart className="w-5 h-5 text-nfe-gold mx-auto mb-2" />
                    <div className="font-semibold">Consistency</div>
                    <div className="text-nfe-muted">Daily use</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step-by-Step Guide */}
        <div className="space-y-6 mb-8">
          <h3 className="text-2xl font-semibold text-nfe-ink text-center mb-6">
            Step-by-Step Application
          </h3>
          
          {usageSteps.map((step, index) => (
            <Card 
              key={index} 
              variant={index === activeStep ? 'elevated' : 'outline'}
              className={cn(
                'transition-all duration-300 cursor-pointer',
                index === activeStep && 'ring-2 ring-nfe-gold'
              )}
              onClick={() => setActiveStep(index)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getStepIcon(index)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h4 className="text-lg font-semibold text-nfe-ink">
                        Step {index + 1}: {step.title}
                      </h4>
                      <Badge variant="outline" className="text-nfe-muted">
                        {step.timing}
                      </Badge>
                    </div>
                    <p className="text-nfe-muted mb-2">
                      {step.description}
                    </p>
                    {index === activeStep && (
                      <p className="text-sm text-nfe-muted">
                        {step.details}
                      </p>
                    )}
                  </div>
                  <step.icon className="w-8 h-8 text-nfe-gold flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tips and Warnings */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card variant="outline">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Pro Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {product.usage.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-nfe-gold rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-nfe-muted">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card variant="outline">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                Important Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-nfe-muted">
                    Always patch test before first use
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-nfe-muted">
                    Start with every other day if you have sensitive skin
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-nfe-muted">
                    Discontinue use if irritation occurs
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-nfe-muted">
                    Consult a dermatologist if you have skin conditions
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Expected Timeline */}
        <Card variant="featured">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 text-nfe-gold flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-nfe-ink mb-2">
                  Expected Results Timeline
                </h3>
                <p className="text-nfe-muted mb-4">
                  {product.usage.timeline}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-nfe-paper rounded-lg">
                    <div className="text-lg font-bold text-nfe-gold mb-1">Week 1-2</div>
                    <div className="text-nfe-muted">Initial hydration and texture improvement</div>
                  </div>
                  <div className="text-center p-3 bg-nfe-paper rounded-lg">
                    <div className="text-lg font-bold text-nfe-gold mb-1">Week 4-6</div>
                    <div className="text-nfe-muted">Visible improvement in target concerns</div>
                  </div>
                  <div className="text-center p-3 bg-nfe-paper rounded-lg">
                    <div className="text-lg font-bold text-nfe-gold mb-1">Week 8-12</div>
                    <div className="text-nfe-muted">Optimal results with consistent use</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
