// TODO: Dynamic import later with ssr:false
export default function NFEMelanocyteMap() {
  return (
    <section aria-labelledby="melanocyte-map-title" className="my-8">
      <h2 id="melanocyte-map-title" className="text-2xl font-primary font-bold text-nfe-green mb-4">
        Melanocyte Distribution Map
      </h2>
      <p className="text-nfe-muted mb-6">
        Visualize melanocyte distribution patterns across different skin regions.
      </p>
      <div className="bg-nfe-paper border border-nfe-green/20 rounded-lg p-6">
        <p className="text-center text-nfe-muted">
          Interactive map will be loaded here (dynamic import with ssr:false)
        </p>
        <ul className="mt-4 space-y-2">
          <li>Facial Melanocytes</li>
          <li>Body Melanocytes</li>
          <li>Extremity Melanocytes</li>
        </ul>
      </div>
    </section>
  )
}

