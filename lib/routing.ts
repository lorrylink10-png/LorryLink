export function isUuid(value: string | null | undefined): value is string {
  if (!value) {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function customerOrderHref(orderId: string) {
  return `/customer/order?id=${encodeURIComponent(orderId)}`;
}

export function customerOrderTrackingHref(orderId: string) {
  return `/customer/tracking/live?order=${encodeURIComponent(orderId)}`;
}

export function driverDiscoverDetailHref(orderId: string) {
  return `/driver/discover/details?id=${encodeURIComponent(orderId)}`;
}

export function driverJobHref(orderId: string) {
  return `/driver/job?id=${encodeURIComponent(orderId)}`;
}

export function driverLoadAdsHref(created = false) {
  return created ? "/driver/ads?created=1" : "/driver/ads";
}

