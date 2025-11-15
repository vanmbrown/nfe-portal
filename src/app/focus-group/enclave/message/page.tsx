'use client';

import React, { useState } from 'react';

export default function EnclaveMessagePage() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState('');

  async function submit() {
    setStatus('Saving...');
    const res = await fetch('/api/enclave/message', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) });
    if (!res.ok) { setStatus('Failed'); return; }
    setStatus('Saved');
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-primary font-bold text-nfe-green mb-4">Message</h1>
      <label className="block mb-2 text-nfe-ink" htmlFor="msg">Your message</label>
      <textarea id="msg" className="w-full border rounded p-2" rows={6} value={text} onChange={(e) => setText(e.target.value)} />
      <div className="mt-4 flex gap-3">
        <button className="px-4 py-2 border rounded" onClick={submit} disabled={!text}>Save</button>
        {status && <span role="status" aria-live="polite" className="text-sm text-nfe-muted">{status}</span>}
      </div>
      <div className="mt-6">
        <a className="text-nfe-green underline" href="/focus-group/enclave/thank-you">Finish</a>
      </div>
    </section>
  );
}


