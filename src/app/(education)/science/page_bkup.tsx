import NFESkinLayersMap from '@/components/interactive/NFESkinLayersMap'
import NFEMelanocyteMap from '@/components/interactive/NFEMelanocyteMap'

export default function Science() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-primary font-bold text-nfe-green mb-6">
        Interactive Science
      </h1>
      <p className="text-lg text-nfe-muted mb-8">
        Explore our interactive scientific visualizations and research tools.
      </p>
      
      <NFESkinLayersMap />
      <NFEMelanocyteMap />
    </div>
  )
}


