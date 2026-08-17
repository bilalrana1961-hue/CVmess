# CVmess

CVmess is a transparent meal ordering and monthly billing app for the CV 105 community. It replaces phone-call ordering and manual bill calculations with a tracked member → officer → bill workflow.

## Included

- Member sign-up and sign-in with email, phone, unit, and password
- Daily and weekly menus with prices and order cut-off times
- Pending, confirmed, rejected, and cancelled order states
- Instant in-app confirmation notifications through Supabase Realtime
- Itemised monthly bills calculated only from confirmed orders
- Mess officer order queue, bulk actions, and live operational totals
- Menu creation, editing, and availability controls
- Member billing table and payment-status tracking
- Responsive khaki/olive interface for desktop and mobile
- Demo mode when Supabase environment variables are absent

## Connect Supabase

The production Supabase project and schema are configured. For a fresh installation:

1. Create a Supabase project and run `supabase/migrations/202608160001_initial_cvmess.sql`.
2. Copy `.env.example` to `.env.local` and add the project URL and publishable key.
3. Add the deployed `/auth/confirm` and `/auth/callback` URLs to Supabase Auth redirect URLs.
4. Let the designated officer create and verify an account, then promote only that email with the statement documented at the bottom of the migration.

The database uses Row Level Security. Members can only access their own orders, notifications, and payment record; officers can manage menus and order decisions.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Without `.env.local`, the same URL runs a fully interactive sample workspace. Use the “Switch to officer/member” card in the sidebar to test the whole flow.

## Production

Set the two Supabase environment variables on your hosting provider, build with `npm run build`, and start with `npm run start`.
