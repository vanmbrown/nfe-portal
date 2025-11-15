'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function EnclaveConsentPage() {
  const [accepted, setAccepted] = useState(false);
  return (
    <section className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-primary font-bold text-nfe-green mb-4">Focus Group Consent</h1>
      <p className="text-nfe-muted mb-6">Please review and accept the consent to proceed to resources and uploads.</p>
      <div className="flex items-center gap-3 mb-6">
        <input id="consent" type="checkbox" className="h-5 w-5" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
        <label htmlFor="consent" className="text-nfe-ink">I agree to participate in the focus group and consent to data processing.</label>
      </div>
      <Button asChild variant={accepted ? 'primary' : 'outline'} disabled={!accepted}>
        <a href="/focus-group/enclave/resources" aria-disabled={!accepted}>Continue</a>
      </Button>
    </section>
  );
}


