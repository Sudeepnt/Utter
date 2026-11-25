import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
const figtree = localFont({
  src: "../public/assets/Figtree.ttf",
  display: "swap",
  variable: "--font-figtree",
});
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:4174");
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Utter — Say it. Skip the typing.",
  description:
    "Private voice dictation for Mac and Windows. Hold a key, speak, and paste your thoughts into the app you're using. Local speech models. No account needed.",
  icons: { icon: "/assets/utter-logo.png", apple: "/assets/utter-logo.png" },
  openGraph: {
    title: "Utter — Say it. Skip the typing.",
    description:
      "Big thoughts deserve more than a blinking cursor. Meet private, on-device dictation.",
    images: [
      {
        url: "/assets/utter-logo.png",
        width: 1254,
        height: 1254,
        alt: "Utter's open-mouthed mascot",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Utter — Say it. Skip the typing.",
    images: ["/assets/utter-logo.png"],
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={figtree.variable} data-scroll-behavior="smooth">
      <body>
        <noscript>
          <style>{`.reveal{opacity:1!important;transform:none!important}.interactive-demo,.menu-toggle{display:none!important}.navigation{display:flex!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
