export function formatAccuracy(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Unavailable";
  }

  return `${Math.round(value).toLocaleString("en-IN")} m`;
}

export function formatLastUpdated(value: string | null | undefined) {
  if (!value) {
    return "Not sent yet";
  }

  const diffMs = Date.now() - new Date(value).getTime();
  const diffSeconds = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSeconds < 10) {
    return "Just now";
  }

  if (diffSeconds < 60) {
    return `${diffSeconds} sec ago`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);

  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function getLocationDelayState(value: string | null | undefined) {
  if (!value) {
    return "waiting";
  }

  const diffMs = Date.now() - new Date(value).getTime();

  if (diffMs >= 5 * 60 * 1000) {
    return "old";
  }

  if (diffMs >= 3 * 60 * 1000) {
    return "delayed";
  }

  return "fresh";
}

