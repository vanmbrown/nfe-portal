# Fix "Email Link Expired" Error

## The Error

When you click an email confirmation link from Supabase, you might see:
```
error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired
```

## Why This Happens

Supabase email confirmation links expire after a certain time (usually 1 hour by default). If you click the link after it expires, you'll get this error.

## Solutions

### Option 1: Register Again (Easiest)

1. Go to `/focus-group/login`
2. Click "Don't have an account? Sign up"
3. Register with the same email
4. Check your email immediately
5. Click the confirmation link right away (within the hour)

### Option 2: Disable Email Confirmation (For Development)

If you're still in development/testing phase:

1. Go to Supabase Dashboard
2. Click **Authentication** → **Settings**
3. Scroll to **"Email Auth"** section
4. Find **"Enable email confirmations"**
5. **Toggle it OFF**
6. Now you can log in immediately after registration

### Option 3: Resend Confirmation Email

1. Go to Supabase Dashboard
2. Click **Authentication** → **Users**
3. Find your user by email
4. Click the three dots (⋯) next to the user
5. Click **"Resend confirmation email"**
6. Check your email and click the new link immediately

### Option 4: Manually Confirm User (For Testing)

1. Go to Supabase Dashboard
2. Click **Authentication** → **Users**
3. Find your user by email
4. Click on the user to open details
5. Find **"Email Confirmed"** field
6. Toggle it to **Confirmed** (green checkmark)

## Prevention

- **Check email immediately** after registration
- **Click confirmation link within 1 hour**
- For development: **Disable email confirmation** until ready for production

## What I Fixed

I've added error handling so expired links will:
1. Show a helpful error message on the login page
2. Explain what happened
3. Guide you to register again or contact support

The error will now be displayed clearly instead of showing a cryptic URL error.








