# Lorry Link Database Foundation

This document describes the initial Supabase database foundation for Lorry Link. It covers the schema, role model, security boundaries, and backend lifecycle functions only. Authentication UI, pickup forms, maps, GPS UI, Realtime subscriptions, and Capacitor are intentionally out of scope for this stage.

## Supabase Client Model

The static Next.js app uses the official browser Supabase package:

- `@supabase/supabase-js`

Both browser and server clients use:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

No privileged server-only key is used by the app foundation. All app clients are expected to respect Row Level Security.

## Enums

`user_role`

- `customer`
- `driver`

`verification_status`

- `pending`
- `verified`
- `rejected`

`lorry_status`

- `available`
- `busy`
- `inactive`

`pickup_status`

- `open`
- `accepted`
- `picked_up`
- `in_transit`
- `delivered`
- `cancelled`

## Tables

`profiles`

One row per Supabase Auth user. The primary key is the same UUID as `auth.users.id`.

Important fields:

- `id`
- `full_name`
- `phone`
- `email`
- `role`
- `avatar_url`
- `created_at`
- `updated_at`

`role` is nullable. This is deliberate because a first-time Google OAuth user may not have chosen whether they are a customer or driver yet.

`driver_profiles`

Driver-specific onboarding/profile data. This is not automatically created for every user.

Important fields:

- `id`
- `user_id`
- `driving_license_no`
- `address`
- `verification_status`
- `created_at`
- `updated_at`

`user_id` is unique, so one profile can have at most one driver profile.

`lorries`

Vehicles owned by drivers. A driver can register multiple lorries.

Important fields:

- `id`
- `driver_id`
- `registration_number`
- `vehicle_name`
- `vehicle_type`
- `capacity_kg`
- `vehicle_photo_url`
- `status`
- `created_at`
- `updated_at`

`registration_number` is unique. `capacity_kg` must be positive.

`pickup_orders`

Customer parcel pickup advertisements and their lifecycle state.

Important fields:

- Customer: `customer_id`
- Pickup: `pickup_pincode`, `pickup_address`, `pickup_latitude`, `pickup_longitude`
- Drop: `drop_pincode`, `drop_address`, `drop_latitude`, `drop_longitude`
- Parcel: `parcel_name`, `parcel_details`, `weight_kg`, dimensions
- Money: `budget`
- Assignment: `assigned_driver_id`, `assigned_lorry_id`
- Lifecycle timestamps: `accepted_at`, `picked_up_at`, `in_transit_at`, `delivered_at`, `cancelled_at`

Pickup GPS coordinates are required. Drop GPS coordinates are nullable for now.

PIN codes are stored as text and constrained to six-digit Indian PIN code format. Coordinates and numeric parcel fields have database-level validation.

`driver_locations`

Stores only the latest known driver position for an active delivery.

Important fields:

- `order_id`
- `driver_id`
- `latitude`
- `longitude`
- `accuracy`
- `heading`
- `speed`
- `recorded_at`
- `updated_at`

`order_id` is unique, so there is at most one current location row per pickup order. This stage does not create location history.

## Relationships

```text
auth.users
    |
    v
profiles
    |
    +------------ Customer ------------+
    |                                  |
    |                                  v
    |                            pickup_orders
    |                                  |
    |                                  | assigned driver/lorry
    |                                  v
    |                           driver_locations
    |
    +------------ Driver
                    |
                    +-- driver_profiles
                    |
                    +-- lorries
```

## Auth And Profile Creation

An `auth.users` trigger creates one `profiles` row after signup.

The trigger safely reads optional metadata:

- `full_name`
- `name`
- `phone`
- `avatar_url`
- `picture`
- `role`

Only exact role metadata values are accepted:

- `customer`
- `driver`

Any other role metadata produces `role = null`. This prevents unexpected OAuth metadata from breaking signup or being cast unsafely.

## Google First-Login Role Behavior

Email/password signup can later pass the selected role through signup metadata.

Google OAuth does not know the user's Lorry Link role, so the profile may initially have:

```text
role = null
```

The user can later call `set_initial_user_role(p_role)` once. The function only updates the authenticated caller's own profile and only when the current role is null.

Once the role is set, ordinary profile updates cannot change it, and the initial-role RPC rejects another change.

## Order Lifecycle

Normal successful flow:

```text
OPEN
  |
  v
ACCEPTED
  |
  v
PICKED UP
  |
  v
IN TRANSIT
  |
  v
DELIVERED
```

Cancellation flow:

```text
OPEN/ACCEPTED
      |
      v
  CANCELLED
```

Lifecycle transitions are performed through RPC functions, not unrestricted direct table updates.

## RPC Functions

`set_initial_user_role(p_role user_role)`

- Requires authentication.
- Uses `auth.uid()` as identity.
- Updates only the caller's profile.
- Works only when `profiles.role is null`.
- Rejects later role switching.

`accept_pickup_order(p_order_id uuid, p_lorry_id uuid)`

- Requires authentication.
- Requires the caller to be a driver.
- Verifies the selected lorry belongs to the caller.
- Verifies the selected lorry is available.
- Atomically accepts only an open, unassigned pickup order.
- Sets the selected lorry to busy.
- Does not trust a caller-provided driver ID.

The function locks the selected lorry row and uses a conditional order update. If two drivers attempt to accept the same pickup simultaneously, only one conditional update can succeed.

`mark_order_picked_up(p_order_id uuid)`

- Caller must be the assigned driver.
- Current status must be `accepted`.
- Sets status to `picked_up`.

`mark_order_in_transit(p_order_id uuid)`

- Caller must be the assigned driver.
- Current status must be `picked_up`.
- Sets status to `in_transit`.

`mark_order_delivered(p_order_id uuid)`

- Caller must be the assigned driver.
- Current status must be `in_transit`.
- Sets status to `delivered`.
- Restores the assigned lorry to `available`.
- Deletes the active `driver_locations` row for the completed order.

`cancel_pickup_order(p_order_id uuid)`

- Caller must be the customer that owns the order.
- Current status must be `open` or `accepted`.
- Sets status to `cancelled`.
- Restores the assigned lorry to `available` when applicable.
- Deletes any active tracking row for the cancelled order.

`update_driver_location(...)`

- Requires authentication.
- Requires the caller to be a driver.
- Uses `auth.uid()` as the driver identity.
- Requires the order to be assigned to the caller.
- Requires order status to be `picked_up` or `in_transit`.
- Validates latitude, longitude, accuracy, heading, and speed.
- Upserts one latest location row using `order_id`.

## RLS Model

RLS is explicitly enabled for:

- `profiles`
- `driver_profiles`
- `lorries`
- `pickup_orders`
- `driver_locations`

`profiles`

- Authenticated users can select only their own profile.
- Authenticated users can update only safe personal fields on their own profile.
- Normal clients cannot update `role`.

`driver_profiles`

- Drivers can select only their own driver profile.
- Inserts and updates require `user_id = auth.uid()`.
- Inserts and updates require the caller's profile role to be `driver`.
- Drivers cannot set their own verification status through direct table access.

`lorries`

- Drivers can select, insert, update, and delete their own lorries.
- Inserts and updates require the caller's profile role to be `driver`.
- Customers can select only the lorry assigned to their own order.
- Lorry status is not granted as a normal client-editable column.

`pickup_orders`

- Customers can insert their own open pickup orders.
- Customers can select their own pickup orders.
- Drivers can select open pickup orders for Discover.
- Assigned drivers can select their assigned orders.
- No broad direct update access is granted for order lifecycle fields.

`driver_locations`

- Only the assigned driver can insert or update the latest location for an order.
- The order must be `picked_up` or `in_transit`.
- Customers can read live location only for their own order.
- Assigned drivers can read their own current location row.
- Unrelated customers and unrelated drivers cannot read live location.

## Explicit Grants

The migration explicitly grants table, column, enum, and function access to the `authenticated` database role.

No application table grants are given to anonymous clients. Signup itself is handled by Supabase Auth.

Column-level grants protect sensitive lifecycle fields from direct writes:

- `profiles.role`
- `pickup_orders.status`
- `pickup_orders.assigned_driver_id`
- `pickup_orders.assigned_lorry_id`
- lifecycle timestamp columns

## Realtime Plan

The migration adds `public.driver_locations` to the `supabase_realtime` publication when that publication exists and the table is not already included.

The customer tracking page subscribes to `driver_locations` for the customer's own assigned order, with RLS still controlling row visibility.

## Migration

Initial migration file:

```text
supabase/migrations/20260906000100_initial_lorry_link_schema.sql
```

Driver lifecycle tightening migration:

```text
supabase/migrations/20260906000200_tighten_driver_lifecycle_rpcs.sql
```

Driver foreground tracking RPC migration:

```text
supabase/migrations/20260906000300_driver_location_rpc.sql
```

If the Supabase CLI is not linked or authenticated locally, run unapplied SQL files in order through the Supabase dashboard SQL Editor for the Mumbai project.
