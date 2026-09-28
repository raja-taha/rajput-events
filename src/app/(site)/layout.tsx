import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteJsonLd } from "@/components/SiteJsonLd";
import { SITE_SEO, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    absolute: SITE_SEO.title,
  },
  description: SITE_SEO.description,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: SITE_SEO.title,
    description: SITE_SEO.description,
    url: SITE_URL,
  },
};

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SiteJsonLd />
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
