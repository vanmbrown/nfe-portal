# Generate Supabase TypeScript Types

This script helps regenerate Supabase TypeScript types to remove `@ts-ignore` comments.

## Prerequisites

1. Supabase CLI installed: `npm install -g supabase` (or use `npx`)
2. Your Supabase project ID or database URL
3. Access to your Supabase project

## Method 1: Using Project ID (Recommended)

If you have your Supabase project ID:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/supabase.ts
```

To find your project ID:
1. Go to your Supabase project dashboard
2. Click on "Settings" → "General"
3. Copy the "Reference ID" (this is your project ID)

## Method 2: Using Database URL

If you have your database connection string:

```bash
npx supabase gen types typescript --db-url 'postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres' > src/types/supabase.ts
```

## Method 3: Using Linked Project

If your project is linked to Supabase CLI:

```bash
npx supabase gen types typescript --linked > src/types/supabase.ts
```

To link your project:
```bash
npx supabase link --project-ref YOUR_PROJECT_ID
```

## After Generating Types

1. Review the generated types file
2. Remove all `@ts-ignore` comments from:
   - `src/app/api/uploads/record/route.ts`
   - `src/app/focus-group/admin/page.tsx`
   - `src/app/focus-group/admin/uploads/page.tsx`
   - `src/app/api/focus-group/uploads/route.ts`
   - `src/app/api/focus-group/feedback/route.ts`
   - `src/components/focus-group/ProfileForm.tsx`

3. Test the build:
   ```bash
   npm run build
   ```

4. Verify no TypeScript errors remain

## Notes

- The generated types include proper column metadata for query builders
- This will fix TypeScript errors with `.eq('user_id', ...)` and similar queries
- Always commit the updated types file after regeneration




