const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";

export const appBasePath =
  configuredBasePath && configuredBasePath !== "/"
    ? `/${configuredBasePath.replace(/^\/+|\/+$/g, "")}`
    : "";

export function withAppBasePath(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!appBasePath) {
    return normalizedPath;
  }

  if (normalizedPath === "/") {
    return appBasePath;
  }

  return `${appBasePath}${normalizedPath}`;
}

export function appUrl(path: string) {
  if (typeof window === "undefined") {
    return withAppBasePath(path);
  }

  return `${window.location.origin}${withAppBasePath(path)}`;
}
