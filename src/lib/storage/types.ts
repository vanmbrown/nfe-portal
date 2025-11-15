export interface SignedUploadUrl {
  url: string;
  fields?: Record<string, string>;
}

export interface FinalizeResult {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface StorageAdapter {
  getSignedUploadUrl(params: { userId: string; filename: string; mimeType: string }): Promise<SignedUploadUrl>;
  finalizeUpload(params: { userId: string; filename: string; mimeType: string; data: Buffer }): Promise<FinalizeResult>;
  listUserUploads(params: { userId: string }): Promise<FinalizeResult[]>;
}


