// TODO: Dynamic import later with ssr:false
export default function NFESkinLayersMap() {
  return (
    <section aria-labelledby="skin-map-title" className="my-8">
      <h2 id="skin-map-title" className="text-2xl font-primary font-bold text-nfe-green mb-4">
        Skin Layers Interactive Map
      </h2>
      <p className="text-nfe-muted mb-6">
        Explore the different layers of human skin and their characteristics.
      </p>
      <div className="bg-nfe-paper border border-nfe-green/20 rounded-lg p-6">
        <p className="text-center text-nfe-muted">
          Interactive map will be loaded here (dynamic import with ssr:false)
        </p>
        <ul className="mt-4 space-y-2">
          <li>Epidermis Layer</li>
          <li>Dermis Layer</li>
          <li>Subcutaneous Layer</li>
        </ul>
      </div>
    </section>
  )
}
