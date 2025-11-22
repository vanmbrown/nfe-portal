import { createServerSupabase as createServerSupabaseClient } from '@/lib/supabase/server';
import { FocusGroupProvider } from './context/FocusGroupContext';
import FocusGroupClientLayout from './components/FocusGroupClientLayout';
import { isAdminEmail } from '@/lib/auth/admin';

// Force dynamic rendering to prevent caching of admin status
export const dynamic = 'force-dynamic';

export default async function FocusGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Let client layout handle authentication redirects to avoid redirect loops
  // Server layout will attempt to fetch user and profile, but won't redirect
  const supabase = await createServerSupabaseClient();

  // Get authenticated user (may be null for login page)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch profile for current user (if authenticated)
  let profile = null;
  if (user) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching profile in layout:', error);
    }
    
    profile = data;
  }

  // Check admin status - prioritize database column, fallback to email
  // Handle both boolean true and string "true" cases
  const rawIsAdmin = profile?.is_admin;

  const profileIsAdmin =
  rawIsAdmin === true ||
  (typeof rawIsAdmin === "number" && rawIsAdmin === 1) ||
  (typeof rawIsAdmin === "string" && rawIsAdmin.toLowerCase() === "true");
  const emailIsAdmin = user?.email ? isAdminEmail(user.email) : false;
  const isAdmin = profileIsAdmin || emailIsAdmin;
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('[FocusGroup Layout] Admin Check:', {
      profileId: profile?.id,
      is_admin: profile?.is_admin,
      is_admin_type: typeof profile?.is_admin,
      profileIsAdmin,
      emailIsAdmin,
      isAdminResult: isAdmin
    });
  }

  return (
    <FocusGroupProvider profile={profile} isAdmin={isAdmin}>
      <FocusGroupClientLayout>
        {children}
      </FocusGroupClientLayout>
    </FocusGroupProvider>
  );
}
