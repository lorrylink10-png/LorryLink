import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { withAppBasePath } from "@/lib/site-url";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Lorry Link",
    template: "%s | Lorry Link",
  },
  description: "Connect parcels with lorries across India.",
  icons: {
    icon: withAppBasePath("/icon.png"),
    apple: withAppBasePath("/icon.png"),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0F2747",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
