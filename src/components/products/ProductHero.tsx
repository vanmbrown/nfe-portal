import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { ShoppingCart, Heart, Share, Star } from '@/components/ui/Icon';
import { ProductData } from '@/content/products/face-elixir';
import { cn } from '@/lib/utils';

interface ProductHeroProps {
  product: ProductData;
  onAddToCart?: () => void;
  onAddToWishlist?: () => void;
  onShare?: () => void;
  className?: string;
}

export function ProductHero({ 
  product, 
  onAddToCart, 
  onAddToWishlist, 
  onShare,
  className = '' 
}: ProductHeroProps) {
  const mainImage = product.images[0];

  return (
    <section className={cn('py-12 px-4', className)}>
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative bg-nfe-paper rounded-lg overflow-hidden">
              <Image
                src={mainImage.src}
                alt={mainImage.alt}
                width={mainImage.width}
                height={mainImage.height}
                className="object-cover w-full h-full"
                priority
              />
            </div>
            
            {/* Additional Images */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {product.images.slice(1).map((image, index) => (
                  <div key={index} className="aspect-square relative bg-nfe-paper rounded-lg overflow-hidden">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      width={image.width}
                      height={image.height}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-nfe-ink mb-2 font-primary">
                {product.name}
              </h1>
              <p className="text-xl text-nfe-gold mb-4 font-medium">
                {product.subtitle}
              </p>
              <p className="text-lg text-nfe-muted leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Price and Rating */}
            <div className="flex items-center gap-6">
              <div className="text-3xl font-bold text-nfe-ink">
                ${product.price}
                <span className="text-lg text-nfe-muted ml-1">{product.currency}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-nfe-gold fill-current" />
                  ))}
                </div>
                <span className="text-sm text-nfe-muted">(4.8) • 127 reviews</span>
              </div>
            </div>

            {/* Key Benefits */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-nfe-ink">Key Benefits:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.benefits.slice(0, 4).map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-nfe-gold rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-nfe-ink">{benefit.title}</p>
                      <p className="text-sm text-nfe-muted">{benefit.timeline}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Specifications */}
            <Card variant="outline" className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-nfe-muted">Volume:</span>
                  <span className="ml-2 font-medium">{product.specifications.volume}</span>
                </div>
                <div>
                  <span className="text-nfe-muted">Texture:</span>
                  <span className="ml-2 font-medium">{product.specifications.texture}</span>
                </div>
                <div>
                  <span className="text-nfe-muted">Scent:</span>
                  <span className="ml-2 font-medium">{product.specifications.scent}</span>
                </div>
                <div>
                  <span className="text-nfe-muted">Shelf Life:</span>
                  <span className="ml-2 font-medium">{product.specifications.shelfLife}</span>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button 
                  size="lg" 
                  className="flex-1"
                  onClick={onAddToCart}
                >
                  <ShoppingCart className="mr-2" />
                  Add to Cart
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={onAddToWishlist}
                >
                  <Heart className="mr-2" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={onShare}
                >
                  <Share className="mr-2" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-nfe-green border-nfe-green">
                  Free Shipping
                </Badge>
                <Badge variant="outline" className="text-nfe-green border-nfe-green">
                  30-Day Returns
                </Badge>
                <Badge variant="outline" className="text-nfe-green border-nfe-green">
                  Cruelty-Free
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
