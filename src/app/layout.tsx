import type { Metadata, Viewport } from "next";
import { Geist, Montserrat } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Flavor Pairings",
  description: "Discover which ingredients pair well together",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Flavor Pairings",
  },
  openGraph: {
    title: "Flavor Pairings",
    description: "Discover which ingredients pair well together",
    type: "website",
    url: "https://flavor-pairings.vercel.app",
    siteName: "Flavor Pairings",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flavor Pairings",
    description: "Discover which ingredients pair well together",
    site: "@skip5this",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5ebe0",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${montserrat.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
