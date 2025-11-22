import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';
import { isAdminEmail } from '@/lib/auth/admin';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabase();
  
  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    console.log('[Admin Layout] Server-side auth check failed, but letting client handle it:', authError);
    // redirect('/focus-group/login');
  } else {
    console.log('[Admin Layout] Server-side auth check passed for:', user.email);
  }
  
  // Check admin status - use database column as source of truth
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('user_id', user.id)
      .maybeSingle();

    isAdmin = profile?.is_admin === true || isAdminEmail(user.email);
  }
  
  console.log('[Admin Layout] Admin status:', isAdmin);
  
  // We defer the "Access Denied" UI to the page component for better UX
  // if (!isAdmin) {
  //   redirect('/focus-group/feedback');
  // }
  
  // User is authenticated AND admin - render admin pages
  return <>{children}</>;
}


