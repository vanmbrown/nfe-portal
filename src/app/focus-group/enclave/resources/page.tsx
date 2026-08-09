export default function EnclaveResourcesPage() {
  // "Quick Start: Learn" pointed at /learn, a second Science surface now
  // retired in favour of one authoritative /science. "Skin Strategy" pointed at
  // a prototype withdrawn from the public maison; if participants need it, it
  // should be rebuilt inside this authenticated environment rather than linked
  // out to a public route.
  return (
    <section className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-primary font-bold text-nfe-green mb-4">Resources</h1>
      <ul className="list-disc pl-6 text-nfe-ink">
        <li className="mb-2"><a className="text-nfe-green underline" href="/science">Science, Method &amp; Proof</a></li>
        <li className="mb-2"><a className="text-nfe-green underline" href="/products/face-elixir">INCI &amp; Usage</a></li>
        <li className="mb-2"><a className="text-nfe-green underline" href="/inci">Ingredient Glossary</a></li>
      </ul>
      <div className="mt-6">
        <a className="text-nfe-green underline" href="/focus-group/upload">Go to Upload</a>
      </div>
    </section>
  );
}
