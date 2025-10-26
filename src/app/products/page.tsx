'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { FadeIn, StaggerList } from '@/components/motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { 
  ShoppingCart, Heart, Star, ArrowRight, 
  Microscope, Shield, Heart as HeartIcon
} from '@/components/ui/Icon';
import { trackPageView, trackCTAClick } from '@/lib/analytics';
import { faceElixirData } from '@/content/products/face-elixir';
import { bodyElixirData } from '@/content/products/body-elixir';

export default function ProductsPage() {
  useEffect(() => {
    trackPageView('/products', 'Products - NFE Beauty');
  }, []);

  const handleCTAClick = (cta: string, location: string) => {
    trackCTAClick(cta, location);
  };

  const products = [faceElixirData, bodyElixirData];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-nfe-paper to-nfe-green-50">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-6xl font-bold text-nfe-ink mb-6 font-primary">
                NFE Products
              </h1>
              <p className="text-xl text-nfe-muted mb-8 max-w-4xl mx-auto">
                Science-backed skincare formulated specifically for melanated skin. 
                Our barrier-first approach ensures effective, safe, and inclusive beauty solutions.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Badge variant="outline" className="text-nfe-green border-nfe-green">
                  <Microscope className="mr-2" size="sm" />
                  Research-Backed
                </Badge>
                <Badge variant="outline" className="text-nfe-green border-nfe-green">
                  <Shield className="mr-2" size="sm" />
                  Barrier-First
                </Badge>
                <Badge variant="outline" className="text-nfe-green border-nfe-green">
                  <HeartIcon className="mr-2" size="sm" />
                  Inclusive
                </Badge>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <StaggerList className="grid md:grid-cols-2 gap-8">
            {products.map((product, index) => (
              <Card key={product.id} variant="elevated" className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-nfe-green-100 to-nfe-gold-100 relative">
                  {/* Product Image Placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-nfe-gold/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <HeartIcon className="w-12 h-12 text-nfe-gold" />
                      </div>
                      <p className="text-nfe-muted font-medium">{product.name}</p>
                    </div>
                  </div>
                </div>
                
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <CardTitle className="text-2xl">{product.name}</CardTitle>
                    <div className="text-2xl font-bold text-nfe-ink">
                      ${product.price}
                    </div>
                  </div>
                  <CardDescription className="text-nfe-gold font-medium">
                    {product.subtitle}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <p className="text-nfe-muted mb-6 leading-relaxed">
                    {product.shortDescription}
                  </p>
                  
                  {/* Key Benefits */}
                  <div className="space-y-3 mb-6">
                    <h4 className="font-semibold text-nfe-ink">Key Benefits:</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {product.benefits.slice(0, 3).map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-nfe-gold rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-nfe-ink">{benefit.title}</p>
                            <p className="text-xs text-nfe-muted">{benefit.timeline}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Specifications */}
                  <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div>
                      <span className="text-nfe-muted">Volume:</span>
                      <span className="ml-2 font-medium">{product.specifications.volume}</span>
                    </div>
                    <div>
                      <span className="text-nfe-muted">Texture:</span>
                      <span className="ml-2 font-medium">{product.specifications.texture}</span>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-nfe-gold fill-current" />
                      ))}
                    </div>
                    <span className="text-sm text-nfe-muted">(4.8) • 127 reviews</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <Button 
                        className="flex-1"
                        onClick={() => handleCTAClick(`View ${product.name}`, 'Products Page')}
                        asChild
                      >
                        <Link href={`/products/${product.id}`}>
                          View Details
                          <ArrowRight className="ml-2" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="lg">
                        <Heart className="mr-2" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-nfe-green border-nfe-green">
                        Free Shipping
                      </Badge>
                      <Badge variant="outline" className="text-nfe-green border-nfe-green">
                        30-Day Returns
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </StaggerList>
        </div>
      </section>

      {/* Why Choose NFE */}
      <section className="py-20 px-4 bg-nfe-paper">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-nfe-ink mb-6 font-primary">
              Why Choose NFE Products?
            </h2>
            <p className="text-lg text-nfe-muted max-w-3xl mx-auto">
              Our products are designed with melanated skin in mind, backed by rigorous research 
              and formulated with the highest quality ingredients.
            </p>
          </div>

          <StaggerList className="grid md:grid-cols-3 gap-8">
            <Card variant="default" className="text-center">
              <CardHeader>
                <Microscope className="mx-auto mb-4 text-nfe-gold" size="xl" />
                <CardTitle>Research-Backed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-nfe-muted">
                  Every ingredient is selected based on clinical studies and dermatological research 
                  specifically focused on melanated skin concerns.
                </p>
              </CardContent>
            </Card>

            <Card variant="default" className="text-center">
              <CardHeader>
                <Shield className="mx-auto mb-4 text-nfe-gold" size="xl" />
                <CardTitle>Barrier-First Approach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-nfe-muted">
                  Our formulations prioritize skin barrier health, ensuring long-term skin health 
                  and preventing common issues like hyperpigmentation.
                </p>
              </CardContent>
            </Card>

            <Card variant="default" className="text-center">
              <CardHeader>
                <HeartIcon className="mx-auto mb-4 text-nfe-gold" size="xl" />
                <CardTitle>Inclusive Beauty</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-nfe-muted">
                  We believe beauty should be inclusive. Our products are designed for all skin tones 
                  and types, with a focus on melanated skin needs.
                </p>
              </CardContent>
            </Card>
          </StaggerList>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-nfe-green text-nfe-paper">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6 font-primary">
            Ready to Transform Your Skincare?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of satisfied customers who have discovered the power of 
            science-backed skincare for melanated skin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => handleCTAClick('Shop All Products', 'Products Page CTA')}
              className="bg-nfe-gold text-nfe-ink hover:bg-nfe-gold-600"
            >
              <ShoppingCart className="mr-2" />
              Shop All Products
            </Button>
            <Button 
              variant="ghost" 
              size="lg"
              onClick={() => handleCTAClick('Learn About Science', 'Products Page CTA')}
              className="text-nfe-paper border-nfe-paper hover:bg-nfe-paper hover:text-nfe-green"
            >
              Learn About Our Science
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
