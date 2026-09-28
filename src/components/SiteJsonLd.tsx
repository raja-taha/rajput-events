import {
  SITE_CONTACT,
  SITE_LOCATION,
  SITE_SEO,
  SITE_URL,
} from "@/lib/site";

export function SiteJsonLd() {
  const organization = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "ProfessionalService"],
    "@id": `${SITE_URL}/#organization`,
    name: SITE_SEO.name,
    legalName: SITE_SEO.name,
    url: SITE_URL,
    logo: `${SITE_URL}/images/logo.png`,
    image: `${SITE_URL}/images/logo.png`,
    description: SITE_SEO.description,
    email: SITE_CONTACT.email,
    telephone: SITE_CONTACT.phoneE164,
    slogan: SITE_SEO.tagline,
    foundingDate: "2024",
    areaServed: [
      {
        "@type": "City",
        name: "Rawalpindi",
      },
      {
        "@type": "City",
        name: "Islamabad",
      },
    ],
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE_LOCATION.city,
      addressRegion: SITE_LOCATION.region,
      addressCountry: SITE_LOCATION.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      // Approximate Twin Cities centre — refine when you have an exact venue/office pin
      latitude: 33.6844,
      longitude: 73.0479,
    },
    sameAs: [SITE_CONTACT.instagram, SITE_CONTACT.facebook, SITE_CONTACT.whatsapp],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        email: SITE_CONTACT.email,
        telephone: SITE_CONTACT.phoneE164,
        availableLanguage: ["English", "Urdu"],
        areaServed: SITE_LOCATION.country,
      },
    ],
    knowsAbout: [
      "Wedding planning",
      "Corporate events",
      "Private celebrations",
      "Venue and vendor management",
      "Decor and styling direction",
      "Guest experience",
    ],
    priceRange: "$$",
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_SEO.name,
    description: SITE_SEO.description,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-PK",
  };

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/#webpage`,
    url: SITE_URL,
    name: SITE_SEO.title,
    description: SITE_SEO.description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#organization` },
    primaryImageOfPage: `${SITE_URL}/images/logo.png`,
    inLanguage: "en-PK",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPage) }}
      />
    </>
  );
}
