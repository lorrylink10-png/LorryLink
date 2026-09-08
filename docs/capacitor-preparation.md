# Capacitor Preparation

Lorry Link is now prepared to build as static frontend assets for a future locally bundled Capacitor Android app.

Target runtime:

```text
Android APK
  -> bundled HTML/CSS/JS
  -> Supabase Auth, PostgreSQL, and Realtime
```

No hosted Next.js server, Vercel function, GitHub Pages frontend, or `next start` runtime is required for application logic.

## Server Dependencies Found

The prior web app depended on runtime Next.js server behavior in these areas:

- Server Components loading Supabase data for customer and driver pages.
- `lib/supabase/server.ts` using `cookies()`.
- `proxy.ts` and `lib/supabase/middleware.ts` refreshing SSR auth cookies.
- `lib/auth/server.ts` and server redirects for route protection.
- `/auth/callback` route handler using `NextResponse` and server-side code exchange.
- Dynamic UUID routes such as `/customer/orders/[id]` and `/driver/jobs/[id]`.

These are not suitable for a pure static export where future Supabase UUIDs are not known at build time.

## Refactor Summary

The app now uses a client-side auth architecture:

```text
AuthProvider
  -> Supabase browser session
  -> profile lookup
  -> role/onboarding destination
  -> AuthGate route protection
```

`AuthGate` prevents UI flicker by showing a branded loading screen until session/profile state is known. It also shows an offline startup state when the account cannot be loaded because the device is offline.

Client-side route protection is only a user-experience guard. Security remains enforced by Supabase RLS and RPC validation.

## Static Export

Next.js is configured with:

```text
output: "export"
trailingSlash: true
images.unoptimized: true
```

The build output directory is:

```text
out/
```

This directory is intended to become the future Capacitor `webDir`.

## Route Changes

Dynamic routes were replaced with query-parameter routes:

```text
/customer/orders/[id]              -> /customer/order?id=<uuid>
/customer/orders/[id]/tracking     -> /customer/tracking/live?order=<uuid>
/driver/discover/[id]              -> /driver/discover/details?id=<uuid>
/driver/jobs/[id]                  -> /driver/job?id=<uuid>
```

URL IDs are validated as UUIDs before querying Supabase. RLS still decides whether the authenticated user may read the row.

## Supabase Access

The frontend uses:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

The public Supabase configuration is expected to be embedded in built JavaScript. No service role key, secret API key, or database password is used.

All customer/driver reads now execute through the browser Supabase client. Mutations still use the secure database functions:

```text
accept_pickup_order
mark_order_picked_up
mark_order_in_transit
mark_order_delivered
cancel_pickup_order
update_driver_location
```

## Auth Notes

Email/password signup, login, logout, and password update use Supabase Auth directly from the browser client.

Google OAuth remains web-compatible through `/auth/callback`. Inside Capacitor Android, Google OAuth will need native/deep-link callback configuration in the next Android integration stage.

Password reset remains Supabase-based. Android deep-link handling for reset links also belongs to the Capacitor stage.

## Maps, Realtime, And GPS

Leaflet and React Leaflet remain client-only and work with static export. OpenStreetMap tiles are loaded directly by the browser/WebView.

Supabase Realtime subscriptions are browser/client based. No Next.js server relays live location data.

Foreground web GPS tracking still uses:

```text
navigator.geolocation.watchPosition()
```

This is foreground web tracking only. It is not reliable Android background tracking while the phone is locked, the browser is suspended, or the app is killed. Native Android background location will be implemented later with Capacitor/native functionality.

## Removed Runtime Server Pieces

The runtime path no longer uses:

- `proxy.ts`
- `lib/supabase/server.ts`
- `lib/supabase/middleware.ts`
- `lib/auth/server.ts`
- Next.js API/route handlers for application functionality
- server redirects for protected pages

## Next Android Steps

Future Capacitor work should:

- install Capacitor packages
- set Capacitor `webDir` to `out`
- add the Android platform
- configure app scheme/deep links for Supabase Auth callbacks
- configure Google OAuth for Android
- implement native/background GPS tracking
- verify Android permissions and foreground service behavior

Do not point Capacitor at a hosted frontend URL. The UI should be bundled into the APK.
