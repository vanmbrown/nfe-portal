'use client'

import React, { useState } from 'react'
import Modal from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export interface Ingredient {
  id: string | number
  name: string
  description?: string
  [key: string]: any
}

export interface EmailModalProps {
  ingredient?: Ingredient | null
  open: boolean
  onClose: () => void
  filters?: {
    skinType?: string
    concerns?: string[]
    concern?: string // Backward compatibility
  }
  ingredients?: Ingredient[]
}

export default function EmailModal({
  ingredient,
  open,
  onClose,
  filters,
  ingredients = [],
}: EmailModalProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address')
      setIsSubmitting(false)
      return
    }

    try {
      // TODO: Implement API call to save email and ingredient preferences
      // This would typically send to your backend API
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulated API call

      setSuccess(true)
      setTimeout(() => {
        setEmail('')
        setSuccess(false)
        onClose()
      }, 2000)
    } catch (err) {
      setError('Failed to save. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setError('')
    setSuccess(false)
    onClose()
  }

  const modalTitle = ingredient
    ? `Get details about ${ingredient.name}`
    : filters?.skinType && filters?.concern
    ? 'Save Your Personalized Ingredient Map'
    : 'Share Ingredient Information'

  return (
    <Modal isOpen={open} onClose={handleClose} title={modalTitle}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {ingredient ? (
          <div className="mb-4">
            <p className="text-sm text-nfe-ink mb-2">
              Enter your email to receive detailed information about <strong>{ingredient.name}</strong>.
            </p>
            {ingredient.description && (
              <p className="text-sm text-nfe-muted mb-4">{ingredient.description}</p>
            )}
          </div>
        ) : ingredients.length > 0 ? (
          <div className="mb-4">
            <p className="text-sm text-nfe-ink mb-2">
              We&apos;ll send you a personalized ingredient map based on your selections:
            </p>
            <ul className="text-sm text-nfe-muted space-y-1 mb-4">
              {filters?.skinType && <li>• Skin Type: {filters.skinType}</li>}
              {filters?.concerns && filters.concerns.length > 0 && (
                <li>• Concerns: {filters.concerns.map(c => c.replace(/_/g, ' ')).join(', ')}</li>
              )}
              {filters?.concern && !filters?.concerns && (
                <li>• Concern: {filters.concern.replace(/_/g, ' ')}</li>
              )}
              <li>• {ingredients.length} matching ingredients</li>
            </ul>
          </div>
        ) : (
          <p className="text-sm text-nfe-ink mb-4">
            Enter your email to receive ingredient information and updates.
          </p>
        )}

        <Input
          type="email"
          label="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your.email@example.com"
          error={error}
          required
          disabled={isSubmitting || success}
        />

        {success && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-800">
            ✓ Success! Check your email for details.
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || success || !email}
          >
            {isSubmitting ? 'Sending...' : success ? 'Sent!' : 'Send'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

