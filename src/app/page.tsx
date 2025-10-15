import NFESkinLayersMap from '@/components/interactive/NFESkinLayersMap'
import NFEMelanocyteMap from '@/components/interactive/NFEMelanocyteMap'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="text-4xl font-primary font-bold text-nfe-green mb-4">
          Welcome to NFE Portal
        </h1>
        <p className="text-lg text-nfe-muted mb-8">
          Secure focus group enclaves with interactive science layer for NFE research.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-primary font-bold text-nfe-green mb-6">
          Interactive Science Layer
        </h2>
        <NFESkinLayersMap />
        <NFEMelanocyteMap />
      </section>
    </div>
  )
}

