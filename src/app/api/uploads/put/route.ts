import { NextRequest } from 'next/server';
import { localFsAdapter } from '@/lib/storage/localFs';
import { getUser } from '@/lib/auth/mockAuth';
import { successResponse, ApiErrors } from '@/lib/api/response';

export async function PUT(req: NextRequest) {
  try {
    const user = getUser();
    const filename = req.nextUrl.searchParams.get('filename') || 'upload.bin';
    const mimeType = req.headers.get('content-type') || 'application/octet-stream';
    const arrayBuffer = await req.arrayBuffer();
    const data = Buffer.from(arrayBuffer);
    const saved = await localFsAdapter.finalizeUpload({ userId: user.id, filename, mimeType, data });
    return successResponse(saved, 201, 'File uploaded successfully');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return ApiErrors.internalError('Upload failed', message);
  }
}


