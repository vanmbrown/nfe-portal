import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ChevronDown, ChevronUp, Search, HelpCircle } from '@/components/ui/Icon';
import { ProductData } from '@/content/products/face-elixir';
import { cn } from '@/lib/utils';

interface ProductFAQProps {
  product: ProductData;
  className?: string;
}

export function ProductFAQ({ product, className = '' }: ProductFAQProps) {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter FAQs based on search term
  const filteredFAQs = product.faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleFAQ(index);
    }
  };

  return (
    <section className={cn('py-12 px-4', className)}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-nfe-ink mb-4 font-primary">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-nfe-muted">
            Everything you need to know about {product.name}
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-nfe-muted" />
          </div>
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-nfe-muted rounded-lg focus:ring-2 focus:ring-nfe-gold focus:border-nfe-gold outline-none"
          />
        </div>

        {/* FAQ Count */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-nfe-gold" />
            <span className="text-nfe-muted">
              {filteredFAQs.length} of {product.faqs.length} questions
            </span>
          </div>
          {searchTerm && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchTerm('')}
            >
              Clear Search
            </Button>
          )}
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <Card variant="outline">
              <CardContent className="p-8 text-center">
                <Search className="w-12 h-12 text-nfe-muted mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-nfe-ink mb-2">
                  No FAQs found
                </h3>
                <p className="text-nfe-muted">
                  Try adjusting your search terms or browse all questions.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredFAQs.map((faq, index) => (
              <Card 
                key={index} 
                variant="outline"
                className={cn(
                  'transition-all duration-200',
                  openFAQ === index && 'ring-2 ring-nfe-gold'
                )}
              >
                <div
                  className="cursor-pointer"
                  onClick={() => toggleFAQ(index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  tabIndex={0}
                  role="button"
                  aria-expanded={openFAQ === index}
                  aria-label={`Toggle FAQ: ${faq.question}`}
                >
                  <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg pr-4">
                      {faq.question}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {openFAQ === index ? (
                        <ChevronUp className="w-5 h-5 text-nfe-gold" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-nfe-muted" />
                      )}
                    </div>
                  </div>
                  </CardHeader>
                </div>
                
                {openFAQ === index && (
                  <CardContent className="pt-0">
                    <div className="border-t border-nfe-muted/20 pt-4">
                      <p className="text-nfe-muted leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>

        {/* Contact Support */}
        <Card variant="featured" className="mt-8">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-nfe-ink mb-2">
                Still have questions?
              </h3>
              <p className="text-nfe-muted mb-4">
                Our skincare experts are here to help you find the perfect routine.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="primary" size="lg">
                  Contact Support
                </Button>
                <Button variant="outline" size="lg">
                  Schedule Consultation
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Popular Topics */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-nfe-ink mb-4 text-center">
            Popular Topics
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              'Skin Compatibility',
              'Ingredient Safety',
              'Usage Instructions',
              'Expected Results',
              'Storage & Shelf Life',
              'Pregnancy Safety'
            ].map((topic, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="cursor-pointer hover:bg-nfe-gold hover:text-nfe-ink transition-colors"
                onClick={() => setSearchTerm(topic.toLowerCase())}
              >
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
