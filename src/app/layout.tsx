import type { Metadata } from "next";
import { Cinzel, Montserrat, Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
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
  title: {
    default: "Rajput Events | Every Occasion, Beautifully Orchestrated",
    template: "%s | Rajput Events",
  },
  description:
    "Rajput Events plans and manages weddings and corporate occasions with elegance, dependability, and care. Celebrations planned. Memories perfected.",
  keywords: [
    "Rajput Events",
    "event management",
    "wedding planner",
    "corporate events",
    "event planning",
  ],
  authors: [{ name: "Rajput Events" }],
  openGraph: {
    title: "Rajput Events",
    description: "Every Occasion, Beautifully Orchestrated.",
    url: "https://rajputevents.com",
    siteName: "Rajput Events",
    type: "website",
    images: [
      {
        url: "/images/logo.jpg",
        width: 1024,
        height: 1024,
        alt: "Rajput Events logo",
      },
    ],
  },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: "/images/logo.jpg",
  },
  metadataBase: new URL("https://rajputevents.com"),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cinzel.variable} ${montserrat.variable} ${cormorant.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-navy text-ivory font-[family-name:var(--font-body)]">
        {children}
      </body>
    </html>
  );
}
