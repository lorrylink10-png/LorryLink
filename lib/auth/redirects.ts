const SAFE_AUTH_PATHS = [
  "/",
  "/customer",
  "/driver",
  "/onboarding",
  "/auth/update-password",
  "/login",
  "/register",
];

export function getSafeRedirectPath(value: string | null | undefined, fallback = "/") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  try {
    const parsed = new URL(value, "http://lorry-link.local");

    if (parsed.origin !== "http://lorry-link.local") {
      return fallback;
    }

    const isAllowed = SAFE_AUTH_PATHS.some((path) => {
      return parsed.pathname === path || parsed.pathname.startsWith(`${path}/`);
    });

    return isAllowed ? `${parsed.pathname}${parsed.search}${parsed.hash}` : fallback;
  } catch {
    return fallback;
  }
}

