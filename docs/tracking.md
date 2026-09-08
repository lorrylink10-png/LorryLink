# Lorry Link Tracking

This stage implements foreground web live tracking only. It does not provide reliable Android background tracking while the phone is locked, the browser is suspended, or the app is killed. Native/background Android tracking belongs to the later Capacitor stage.

## Tracking Start

Driver location tracking starts after the assigned driver marks an order as:

```text
picked_up
```

Tracking remains active while the order status is:

```text
picked_up
in_transit
```

The customer's location is never tracked. Only the assigned driver's browser GPS position is sent.

## Tracking Stop

Tracking stops when the order becomes:

```text
delivered
cancelled
```

The driver-side web tracker stops its geolocation watcher, upload timer, and pending upload loop when there is no active trackable order, when the driver logs out, or when the driver leaves the driver app layout.

The lifecycle RPCs delete the current `driver_locations` row after delivery/cancellation so fresh location access ends with the delivery.

## One Row Per Order

`driver_locations.order_id` is unique. The app stores only the latest known driver position for the order:

```text
order_id
driver_id
latitude
longitude
accuracy
heading
speed
recorded_at
updated_at
```

There is no tracking history table and no route history in this stage.

## GPS Strategy

The driver web client uses:

```text
navigator.geolocation.watchPosition()
```

with high accuracy enabled where the browser supports it. The latest browser GPS fix is kept in memory.

The client sends the first valid GPS fix immediately, then throttles database writes to approximately once every 60 seconds. If a write fails because the network is temporarily unavailable, the app keeps only the latest current position and retries on the next allowed tracking cycle or when the browser comes back online.

Very stale browser positions are ignored rather than uploaded.

## Location Update RPC

Driver writes use:

```text
update_driver_location
```

The browser does not submit a trusted driver ID. The database derives the driver from:

```text
auth.uid()
```

The RPC validates:

- authenticated caller
- caller role is `driver`
- order exists
- order is assigned to the caller
- order status is `picked_up` or `in_transit`
- latitude and longitude are in valid ranges
- optional accuracy, heading, and speed values are valid

Then it upserts the latest location using `order_id` as the conflict key.

## Realtime

`driver_locations` is included in the Supabase Realtime publication by the initial database migration.

Customer tracking subscribes to Realtime changes filtered to the current order:

```text
driver_locations.order_id = current order ID
```

The customer UI listens for inserts, updates, and deletes. If the location row is deleted on delivery, the UI keeps the last known marker locally and refreshes order status so the screen can transition to completed/cancelled without becoming confusingly blank.

## Privacy And RLS

RLS remains the security boundary.

Customers can read driver location only for their own order. Assigned drivers can read/update location only for their own active delivery. Unauthenticated users and unrelated accounts cannot read or write live location rows.

No anonymous grants, public location access, broad `USING (true)` policies, or service-role app access are used.

## Map

The map uses Leaflet, React Leaflet, and OpenStreetMap tiles. OpenStreetMap attribution remains visible. The map shows current lorry position and, where useful, the pickup marker. It does not calculate routes, distance remaining, ETA, or turn-by-turn navigation.
