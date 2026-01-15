# NFE Site Owner's Manual (Short)

## Repo and stack
- Repo: https://github.com/vanmbrown/nfe-portal
- Framework: Next.js (App Router)
- Hosting: TBD (please confirm provider and project name)

## Articles: add/edit
- Metadata list: `src/content/articles/articles.json`
- Article content: `src/content/articles/*.md` or `*.mdx`
- Article images: `public/images/articles/`
- Behavior: The article pages read `articles.json` and render MD/MDX content.

## Key copy edits
- Home hero: `src/app/page.tsx`
- Subscribe page copy: `src/app/subscribe/page.tsx`
- Community Input page copy: `src/app/community-input/page.tsx`
- Products/Ritual cards copy: 
  - `/products`: `src/app/products/page.tsx`
  - `/shop`: `src/app/shop/page.tsx`
- Our Story: `src/app/our-story/page.tsx`
- Science intro: `src/components/nfe/ScienceTab.tsx`

## Form submissions and storage
- Database: Supabase (project URL in `.env.local`)
- Tables (service role access):
  - `subscribers` (Subscribe)
  - `waitlist` (Waitlist)
  - `community_input` (Community Input)
- View/export: Supabase Dashboard → Table Editor → select table → Export (CSV)

## Email (Resend)
- Resend project/account: Vanessa McCaleb (vanessa.mccaleb)
- API key: `RESEND_API_KEY` in environment
- From address: `notifications@nfebeauty.com`
- Templates:
  - Subscribe confirmation (subject: "Welcome to the NFE Community") is inline HTML in `src/app/api/subscribe/route.ts`
  - Owner notifications are inline HTML in `src/app/api/subscribe/route.ts` and `src/app/api/waitlist/route.ts`

## Deployment workflow (to confirm)
- Current assumption: push to `main` triggers deploy
- Please confirm: hosting provider + project name + deployment trigger

## Production environment variables (to confirm)
These must be set in production:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `FORWARD_TO_AI_URL` (optional)

## Support window
- Proposed: 1–2 weeks post‑launch for production-only fixes

