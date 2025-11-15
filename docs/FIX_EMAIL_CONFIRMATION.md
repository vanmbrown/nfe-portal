# Fix "Email not confirmed" Error

## Quick Fix: Disable Email Confirmation (Recommended for Development)

Supabase requires email confirmation by default. For development, you can disable this:

### Steps:

1. **Go to Supabase Dashboard**
   - Open your project at [supabase.com](https://supabase.com)
   - Navigate to your project

2. **Disable Email Confirmation**
   - Click **Authentication** in the left sidebar
   - Click **Settings** (gear icon)
   - Scroll down to **"Email Auth"** section
   - Find **"Enable email confirmations"**
   - **Toggle it OFF** (should be gray/unchecked)

3. **Save Changes**
   - Changes are saved automatically

4. **Try Logging In Again**
   - Go back to your login page
   - Try logging in with your credentials
   - It should work now!

---

## Alternative: Confirm Your Email

If you want to keep email confirmation enabled:

1. **Check Your Email**
   - Look for an email from Supabase
   - Subject: "Confirm your signup" or similar
   - Click the confirmation link

2. **If You Don't See the Email**
   - Check spam/junk folder
   - In Supabase: **Authentication** → **Users**
   - Find your user
   - Click the three dots (⋯) → **Resend confirmation email**

3. **After Confirming**
   - Try logging in again

---

## For Production

When you're ready for production:
- Re-enable email confirmation
- This ensures only verified users can access the portal
- Helps prevent spam accounts

---

## Still Having Issues?

If disabling email confirmation doesn't work:

1. **Check if account exists**
   - Supabase Dashboard → **Authentication** → **Users**
   - Verify your email is listed

2. **Try creating a new account**
   - Use the "Sign up" option on the login page
   - With email confirmation disabled, you can log in immediately

3. **Reset password if needed**
   - Supabase Dashboard → **Authentication** → **Users**
   - Find your user → Click three dots → **Reset password**








