import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.lorrylink.app",
  appName: "Lorry Link",
  webDir: "webview-shell",
  server: {
    url: "https://lorrylink10-png.github.io/LorryLink/",
    cleartext: false,
  },
};

export default config;
