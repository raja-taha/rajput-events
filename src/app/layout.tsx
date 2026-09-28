import type { Metadata } from "next";
import { Cinzel, Montserrat, Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import { SITE_CONTACT, SITE_SEO, SITE_URL } from "@/lib/site";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-admin",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_SEO.title,
    template: `%s | ${SITE_SEO.name}`,
  },
  description: SITE_SEO.description,
  applicationName: SITE_SEO.name,
  keywords: [...SITE_SEO.keywords],
  authors: [{ name: SITE_SEO.name, url: SITE_URL }],
  creator: SITE_SEO.name,
  publisher: SITE_SEO.name,
  category: "Event planning",
  classification: "Wedding and event management",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: SITE_SEO.locale,
    url: SITE_URL,
    siteName: SITE_SEO.name,
    title: SITE_SEO.title,
    description: SITE_SEO.description,
    images: [
      {
        url: "/images/logo.png",
        width: 1024,
        height: 1024,
        alt: `${SITE_SEO.name} logo`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_SEO.title,
    description: SITE_SEO.description,
    images: ["/images/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/images/logo.png", type: "image/png", sizes: "1024x1024" },
    ],
    apple: [{ url: "/images/logo.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.svg",
  },
  other: {
    "contact:email": SITE_CONTACT.email,
    "contact:phone_number": SITE_CONTACT.phoneE164,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-PK"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${cinzel.variable} ${montserrat.variable} ${cormorant.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-navy text-ivory font-[family-name:var(--font-body)]"
      >
        {children}
      </body>
    </html>
  );
}
