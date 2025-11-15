/**
 * @deprecated This file is deprecated. Prisma has been migrated to Supabase.
 * 
 * All database operations should now use Supabase:
 * - Client-side: use createClientSupabase() from '@/lib/supabase/client'
 * - Server-side: use createServerSupabase() from '@/lib/supabase/server'
 * 
 * This file is kept for reference only and will be removed in a future update.
 * 
 * DO NOT USE: import { prisma } from '@/lib/db'
 * USE INSTEAD: import { createServerSupabase } from '@/lib/supabase/server'
 */

// Legacy Prisma client - DO NOT USE
// import { PrismaClient } from '@prisma/client';
// 
// declare global {
//   var prisma: PrismaClient | undefined;
// }
// 
// export const prisma: PrismaClient = global.prisma || new PrismaClient();
// 
// if (process.env.NODE_ENV !== 'production') {
//   global.prisma = prisma;
// }
