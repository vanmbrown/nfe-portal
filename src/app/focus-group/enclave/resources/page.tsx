export default function EnclaveResourcesPage() {
  return (
    <section className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-primary font-bold text-nfe-green mb-4">Resources</h1>
      <ul className="list-disc pl-6 text-nfe-ink">
        <li className="mb-2"><a className="text-nfe-green underline" href="/learn">Quick Start: Learn</a></li>
        <li className="mb-2"><a className="text-nfe-green underline" href="/products/face-elixir">INCI & Usage</a></li>
        <li className="mb-2"><a className="text-nfe-green underline" href="/skin-strategy">Skin Strategy</a></li>
      </ul>
      <div className="mt-6">
        <a className="text-nfe-green underline" href="/focus-group/enclave/upload">Go to Upload</a>
      </div>
    </section>
  );
}


