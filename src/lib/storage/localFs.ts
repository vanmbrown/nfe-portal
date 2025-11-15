import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import type { StorageAdapter, SignedUploadUrl, FinalizeResult } from './types';

const ROOT = path.join(process.cwd(), 'uploads');

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export const localFsAdapter: StorageAdapter = {
  async getSignedUploadUrl({ userId, filename, mimeType }): Promise<SignedUploadUrl> {
    // Local adapter doesn't need a signed URL. Client will PUT to our API.
    return { url: '/api/uploads/put' };
  },

  async finalizeUpload({ userId, filename, mimeType, data }): Promise<FinalizeResult> {
    const userDir = path.join(ROOT, userId);
    await ensureDir(userDir);
    const ext = path.extname(filename) || '';
    const base = path.basename(filename, ext);
    const safeBase = base.replace(/[^a-zA-Z0-9-_]/g, '_');
    const unique = `${safeBase}-${randomUUID()}${ext}`;
    const fullPath = path.join(userDir, unique);
    await fs.writeFile(fullPath, data);
    const stats = await fs.stat(fullPath);
    return {
      url: `/uploads/${userId}/${unique}`,
      filename: unique,
      size: stats.size,
      mimeType,
    };
  },

  async listUserUploads({ userId }): Promise<FinalizeResult[]> {
    const userDir = path.join(ROOT, userId);
    try {
      const files = await fs.readdir(userDir);
      const results: FinalizeResult[] = [];
      for (const f of files) {
        const full = path.join(userDir, f);
        const st = await fs.stat(full);
        if (st.isFile()) {
          results.push({ url: `/uploads/${userId}/${f}`, filename: f, size: st.size, mimeType: 'application/octet-stream' });
        }
      }
      return results;
    } catch {
      return [];
    }
  },
};


