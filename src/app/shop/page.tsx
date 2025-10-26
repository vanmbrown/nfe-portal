export default function Shop() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-primary font-bold text-nfe-green mb-6">
        Research Materials
      </h1>
      <p className="text-lg text-nfe-muted mb-8">
        Access research materials and tools for your NFE studies.
      </p>
      
      <h2 className="text-2xl font-primary font-bold text-nfe-green mb-6">Available Resources</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-nfe-paper border border-nfe-green/20 rounded-lg p-6">
          <h3 className="text-xl font-primary font-bold text-nfe-green mb-2">
            Research Kits
          </h3>
          <p className="text-nfe-muted">
            Comprehensive research materials for focus group studies.
          </p>
        </div>
        
        <div className="bg-nfe-paper border border-nfe-green/20 rounded-lg p-6">
          <h3 className="text-xl font-primary font-bold text-nfe-green mb-2">
            Data Tools
          </h3>
          <p className="text-nfe-muted">
            Advanced tools for data collection and analysis.
          </p>
        </div>
        
        <div className="bg-nfe-paper border border-nfe-green/20 rounded-lg p-6">
          <h3 className="text-xl font-primary font-bold text-nfe-green mb-2">
            Documentation
          </h3>
          <p className="text-nfe-muted">
            Guides and documentation for research protocols.
          </p>
        </div>
      </div>
    </div>
  )
}


