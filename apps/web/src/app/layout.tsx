import type { Metadata } from "next";
import { caveat, inter, manrope } from "./fonts";
import "./globals.css";

const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  || (vercelDomain ? `https://${vercelDomain}` : "http://localhost:3000");

const TITLE = "LUMEA — Skincare made simple";
const DESCRIPTION =
  "Thoughtful skincare formulas for healthy, glowing skin. " +
  "Discover LUMEA's routine in four simple steps: cleanse, treat, " +
  "moisturise and protect.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "LUMEA",
    images: [
      {
        url: "/og-image.png?v=3",
        width: 1200,
        height: 630,
        alt: "LUMEA — Skincare made simple",
      },
    ],
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable} ${caveat.variable} antialiased`}>
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
