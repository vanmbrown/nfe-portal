// TODO: Implement signature request and upload helpers in Week 3
export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
}

export interface CloudinarySignature {
  signature: string
  timestamp: number
}

// Placeholder for server route integration
export async function getUploadSignature(): Promise<CloudinarySignature> {
  // TODO: Implement server route for signed uploads
  throw new Error('Not implemented yet')
}

export async function uploadToCloudinary(
  file: File,
  signature: CloudinarySignature
): Promise<CloudinaryUploadResult> {
  // TODO: Implement client-side upload with signature
  throw new Error('Not implemented yet')
}

