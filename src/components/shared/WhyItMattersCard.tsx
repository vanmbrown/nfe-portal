'use client'

import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export interface Ingredient {
  id: string | number
  name: string
  description?: string
  benefits?: string[]
  category?: string
  layer?: string
  roles?: string[]
  [key: string]: any
}

export interface WhyItMattersCardProps {
  ingredient: Ingredient
  onClick?: () => void
  className?: string
}

export function WhyItMattersCard({ ingredient, onClick, className }: WhyItMattersCardProps) {
  const {
    name,
    description,
    benefits = [],
    category,
    layer,
    roles = [],
  } = ingredient

  return (
    <Card
      variant="default"
      hover
      onClick={onClick}
      className={cn('cursor-pointer transition-all', className)}
      aria-label={`View details for ${name}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-lg font-primary">{name}</CardTitle>
            {category && (
              <CardDescription className="mt-1">
                {category}
                {layer && ` • ${layer}`}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {description && (
          <p className="text-sm text-nfe-ink mb-3 line-clamp-3">{description}</p>
        )}
        {roles && roles.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-nfe-muted mb-1">Key Roles:</p>
            <p className="text-sm text-nfe-ink">{roles.join(' • ')}</p>
          </div>
        )}
        {benefits && benefits.length > 0 && (
          <div>
            <p className="text-xs font-medium text-nfe-muted mb-1">Benefits:</p>
            <ul className="text-sm text-nfe-ink space-y-1">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-nfe-gold mt-0.5">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {onClick && (
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full"
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
          >
            Learn More
          </Button>
        )}
      </CardContent>
    </Card>
  )
}









