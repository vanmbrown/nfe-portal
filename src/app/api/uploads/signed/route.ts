import { getUser } from '@/lib/auth/mockAuth';
import { successResponse } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Local adapter: simply return the PUT endpoint; client will send file bytes there.
  const user = getUser();
  return successResponse({ url: '/api/uploads/put', userId: user.id });
}


