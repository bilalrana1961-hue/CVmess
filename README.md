# CVmess

CVmess is a transparent meal ordering and monthly billing app for the CV 105 community. It replaces phone-call ordering and manual bill calculations with a tracked member → officer → bill workflow.

## Included

- Member sign-up and sign-in with email, phone, room, and password
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

1. Create a Supabase project.
2. Open its SQL editor and run `supabase/migrations/202608160001_initial_cvmess.sql`.
3. Copy `.env.example` to `.env.local` and add the project URL and anon key.
4. In Supabase Authentication, enable Email and choose whether email confirmation is required.
5. Create the mess officer through the normal sign-up form, then run the final `update profiles set role = 'officer'...` statement shown at the bottom of the migration.

The database uses Row Level Security. Members can only access their own orders, notifications, and payment record; officers can manage menus and order decisions.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Without `.env.local`, the same URL runs a fully interactive sample workspace. Use the “Switch to officer/member” card in the sidebar to test the whole flow.

## Production

Set the two Supabase environment variables on your hosting provider, build with `npm run build`, and start with `npm run start`.
