import type { PickupStatus } from "@/types/domain";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatWeight(value: number) {
  return `${Number(value).toLocaleString("en-IN")} kg`;
}

export function formatDimensions(length: number | null, width: number | null, height: number | null) {
  if (!length && !width && !height) {
    return "Not specified";
  }

  const values = [length, width, height].map((value) => (value ? `${value} cm` : "-"));

  return values.join(" x ");
}

export function formatStatus(status: PickupStatus) {
  return status.replaceAll("_", " ").toUpperCase();
}

export function getStatusTone(status: PickupStatus) {
  switch (status) {
    case "open":
      return "active";
    case "accepted":
      return "neutral";
    case "picked_up":
    case "in_transit":
      return "accent";
    case "delivered":
      return "success";
    case "cancelled":
      return "danger";
  }
}

export function formatPostedTime(value: string) {
  const created = new Date(value).getTime();
  const diffMs = Date.now() - created;
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));

  if (diffMinutes < 1) {
    return "Posted just now";
  }

  if (diffMinutes < 60) {
    return `Posted ${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `Posted ${diffHours} hr ago`;
  }

  return `Posted ${new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(created)}`;
}
