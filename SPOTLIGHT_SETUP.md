# Spotlight administration

Public route: `https://terqyn.com/#/spotlight`
Admin route: `https://terqyn.com/#/spotlight-admin`

The public page starts locked and fails closed if storage or authorization is unavailable. Demo personnel accounts cannot grant promotion permissions. The former sample codes, sample giveaways, rolling countdowns, and browser-only entry confirmations have been removed.

## Activation still required

Apply `database/spotlight-setup.sql` once in the existing Terqyn production Supabase project `skuwewlgtddqtcnpwhas`. The connected Supabase account did not have permission, so this setup has NOT been applied or verified against production. Do not unlock the section until the database checks below pass. No new service key is required; clients use the existing publishable key and database-enforced RLS.

The SQL starts with a locked setting and zero promotions. It seeds only the existing, email-verified `colbylevesque@gmail.com` account as a Spotlight admin. If that verified account does not exist, no admin is seeded. Other admins must be deliberately added to `hq_spotlight_admins` by a database administrator using their verified existing auth user IDs. Clients have no permission to edit that allowlist.

## Human workflow

1. Sign in at the admin route with an authorized Terqyn account.
2. Create a giveaway or promo code with a title, description, perks, start/end times, eligibility, terms, optional quantity, and HTTPS entry/redemption page.
3. Save draft. Preview the saved content. Set up the actual giveaway entry destination or checkout discount separately.
4. Click **Launch / authorize schedule** and confirm. This approves the exact saved content and time window. Dates alone never publish a draft.
5. Explicitly **Unlock Spotlight** when ready. The page displays only launched promotions within their approved dates. Future starts appear only after manual scheduling authorization; ended promotions disappear automatically.
6. Use **Pause** for individual promotions or **Lock Spotlight now** for all promotions. Editing a published promotion returns it to draft and requires a new launch.

The page displays quantity and discount details, but the linked entry/checkout system must enforce redemption limits, issue discounts, collect entries, and support human winner selection. This page never fabricates entry success or picks winners.

## Required production verification after SQL activation

- Run Supabase security advisors; confirm RLS on all four new tables and no browser write access to the allowlist or audit log.
- Anonymous users and signed-in non-admins must fail insert/update attempts and must not read drafts, paused, future, expired, or locked promotions.
- A verified allowlisted admin can save and preview a draft while the public section remains locked.
- Launching without an action URL or with an expired end date must fail. Direct edits to a published promotion with status still published must fail.
- Explicit launch plus unlock must expose only the intended current promotion. Pausing or locking must hide it. Public views recheck every 30 seconds; database access restrictions apply immediately.
- Confirm create/edit/launch/pause/lock operations produce immutable audit rows. Removing an admin's allowlist membership must immediately deny subsequent writes.
- Test on desktop and mobile with the actual admin account. No real-account end-to-end test was possible during preparation.

Local checks: `node --test spotlight.test.cjs` and JavaScript syntax checks. These cover fail-closed rendering, unverified and unauthorized sign-in, explicit launch, time/status filtering, and output escaping. They do not replace live RLS or admin-account tests.
