// No-op analytics helpers that can be wired to GA4 later
export function trackEvent(eventName: string, parameters?: Record<string, any>) {
  // TODO: Wire to GA4 or other analytics service
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', eventName, parameters)
  }
}

export function trackPageView(url: string) {
  // TODO: Wire to GA4
  if (process.env.NODE_ENV === 'development') {
    console.log('Page View:', url)
  }
}

// NFE-specific event helpers
export const nfeEvents = {
  enclaveAccessed: (enclaveId: string) => trackEvent('nfe.enclave.accessed', { enclaveId }),
  fileUploaded: (fileType: string, size: number) => trackEvent('nfe.file.uploaded', { fileType, size }),
  mapInteracted: (mapType: string, interaction: string) => trackEvent('nfe.map.interacted', { mapType, interaction }),
}

