'use client';

import React, { useState } from 'react';

export default function EnclaveUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>('');
  const [uploadedUrl, setUploadedUrl] = useState<string>('');

  async function onUpload() {
    if (!file) return;
    setStatus('Uploading...');
    const putUrl = '/api/uploads/put?filename=' + encodeURIComponent(file.name);
    const res = await fetch(putUrl, { method: 'PUT', body: await file.arrayBuffer(), headers: { 'content-type': file.type || 'application/octet-stream' } });
    if (!res.ok) { setStatus('Upload failed'); return; }
    const saved = await res.json();
    setUploadedUrl(saved.url);
    await fetch('/api/uploads/record', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ filename: saved.filename, url: saved.url, size: saved.size, mimeType: saved.mimeType }) });
    setStatus('Uploaded');
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-primary font-bold text-nfe-green mb-4">Upload</h1>
      <p className="text-nfe-muted mb-4">Choose a file to upload (images or PDFs preferred).</p>
      <input aria-label="Select file" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <div className="mt-4 flex gap-3">
        <button className="px-4 py-2 border rounded" onClick={onUpload} disabled={!file}>Upload</button>
        {status && <span role="status" aria-live="polite" className="text-sm text-nfe-muted">{status}</span>}
      </div>
      {uploadedUrl && (
        <div className="mt-4">
          <a className="text-nfe-green underline" href={uploadedUrl} target="_blank" rel="noopener noreferrer">View uploaded file</a>
        </div>
      )}
      <div className="mt-6">
        <a className="text-nfe-green underline" href="/focus-group/enclave/message">Continue to Message</a>
      </div>
    </section>
  );
}


