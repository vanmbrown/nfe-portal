import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { AlertCircle, CheckCircle, Info } from '@/components/ui/Icon';
import { ProductData } from '@/content/products/face-elixir';
import { cn } from '@/lib/utils';

interface IngredientListProps {
  product: ProductData;
  className?: string;
}

export function IngredientList({ product, className = '' }: IngredientListProps) {
  const [sortBy, setSortBy] = useState<'alphabetical' | 'concentration' | 'safety'>('alphabetical');
  const [showAll, setShowAll] = useState(false);

  // Sort ingredients based on current sort option
  const sortedIngredients = [...product.ingredients].sort((a, b) => {
    switch (sortBy) {
      case 'alphabetical':
        return a.inci.localeCompare(b.inci);
      case 'concentration':
        const aConc = parseFloat(a.concentration?.replace('%', '') || '0');
        const bConc = parseFloat(b.concentration?.replace('%', '') || '0');
        return bConc - aConc;
      case 'safety':
        const safetyOrder = { safe: 0, caution: 1, avoid: 2 };
        return safetyOrder[a.safety] - safetyOrder[b.safety];
      default:
        return 0;
    }
  });

  const displayedIngredients = showAll ? sortedIngredients : sortedIngredients.slice(0, 6);

  const getSafetyIcon = (safety: string) => {
    switch (safety) {
      case 'safe':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'caution':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'avoid':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSafetyColor = (safety: string) => {
    switch (safety) {
      case 'safe':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'caution':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'avoid':
        return 'bg-red-50 text-red-800 border-red-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  return (
    <section className={cn('py-12 px-4', className)}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-nfe-ink mb-4 font-primary">
            Complete Ingredient List (INCI)
          </h2>
          <p className="text-lg text-nfe-muted">
            Every ingredient in {product.name}, with concentrations, benefits, and safety information.
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          <div className="flex gap-2">
            <Button
              variant={sortBy === 'alphabetical' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSortBy('alphabetical')}
            >
              A-Z
            </Button>
            <Button
              variant={sortBy === 'concentration' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSortBy('concentration')}
            >
              Concentration
            </Button>
            <Button
              variant={sortBy === 'safety' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSortBy('safety')}
            >
              Safety
            </Button>
          </div>
        </div>

        {/* Ingredients Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {displayedIngredients.map((ingredient, index) => (
            <Card key={index} variant="outline" className="h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{ingredient.name}</CardTitle>
                    <p className="text-sm text-nfe-muted font-mono">{ingredient.inci}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSafetyIcon(ingredient.safety)}
                    <Badge 
                      variant="outline" 
                      className={getSafetyColor(ingredient.safety)}
                    >
                      {ingredient.safety}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {ingredient.concentration && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-nfe-ink">Concentration:</span>
                      <Badge variant="default">{ingredient.concentration}</Badge>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-sm font-medium text-nfe-ink">Source:</span>
                    <p className="text-sm text-nfe-muted mt-1">{ingredient.source}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-nfe-ink">Benefits:</span>
                    <ul className="text-sm text-nfe-muted mt-1 space-y-1">
                      {ingredient.benefits.map((benefit, benefitIndex) => (
                        <li key={benefitIndex} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 bg-nfe-gold rounded-full mt-2 flex-shrink-0"></span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Show More/Less Button */}
        {product.ingredients.length > 6 && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll ? 'Show Less' : `Show All ${product.ingredients.length} Ingredients`}
            </Button>
          </div>
        )}

        {/* Safety Information */}
        <Card variant="featured" className="mt-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Info className="w-6 h-6 text-nfe-gold flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-nfe-ink mb-2">
                  Ingredient Safety & Transparency
                </h3>
                <p className="text-nfe-muted mb-4">
                  All ingredients are carefully selected for their safety profile and efficacy. 
                  We avoid known irritants and use only non-comedogenic ingredients suitable for melanated skin.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>No parabens</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>No sulfates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>No phthalates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>No artificial fragrances</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>No mineral oil</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>No animal testing</span>
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
