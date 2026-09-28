# Client Website SEO — Status

Last updated: 28 Sep 2026  
Site: https://rajput-events.vercel.app

---

## Done

### Technical SEO
- [x] SEO-focused page title and meta description (Rawalpindi / Islamabad + services)
- [x] Keyword list targeted to local event planning searches
- [x] Canonical URL set to the live site
- [x] `metadataBase` aligned with production URL
- [x] Open Graph tags (title, description, image, locale `en_PK`)
- [x] Twitter card tags (`summary_large_image`)
- [x] `robots.txt` — allow public site; block `/admin` and `/api`
- [x] `sitemap.xml` for the homepage
- [x] Web app manifest (`manifest.webmanifest`)
- [x] Admin area set to `noindex` / `nofollow` (including login)
- [x] HTML `lang` set to `en-PK`
- [x] Skip-to-main-content link for accessibility
- [x] Descriptive hero logo `alt` text

### Structured data (JSON-LD)
- [x] Organization / LocalBusiness / ProfessionalService schema
- [x] WebSite schema
- [x] WebPage schema
- [x] Contact points (email, phone), social `sameAs` links, area served

### Contact / NAP consistency (on-site)
- [x] Shared site contact config (`src/lib/site.ts`)
- [x] Email: rajputevents04@gmail.com
- [x] Instagram: https://www.instagram.com/rajputevents04/
- [x] Facebook: https://www.facebook.com/profile.php?id=61594654771025
- [x] WhatsApp: https://wa.me/923193627089
- [x] Website URL used in metadata / footer: https://rajput-events.vercel.app

### Related files
| File | Purpose |
|------|---------|
| `src/lib/site.ts` | Site URL, contact, SEO copy, location |
| `src/app/layout.tsx` | Global metadata |
| `src/app/(site)/layout.tsx` | Public layout + JSON-LD + skip link |
| `src/components/SiteJsonLd.tsx` | Schema.org JSON-LD |
| `src/app/robots.ts` | Robots rules |
| `src/app/sitemap.ts` | Sitemap |
| `src/app/manifest.ts` | PWA / install manifest |
| `src/app/admin/layout.tsx` | Admin noindex |

---

## Remaining

### High priority
- [ ] **Google Search Console** — verify property, submit `https://rajput-events.vercel.app/sitemap.xml`
- [ ] **Google Business Profile** — claim/create listing for Rawalpindi with correct name, phone, WhatsApp, website, photos
- [ ] **Custom domain** — point something like `rajputevents.com` at Vercel (stronger trust than `*.vercel.app`)
- [ ] **Open Graph image** — create a dedicated **1200×630** share image (logo alone is weak on WhatsApp / Facebook / LinkedIn)
- [ ] **Exact business address / map pin** — update JSON-LD `geo` and address once you have a real office or service address

### Content & structure
- [ ] Dedicated routes over time (better for ranking than one long homepage), e.g.:
  - `/weddings`
  - `/corporate`
  - `/private-celebrations`
  - `/contact`
- [ ] Blog or guides (optional): “Wedding venues in Islamabad”, “Mehndi planning checklist”, etc.
- [ ] Real event photos with descriptive file names and `alt` text (not only the logo)
- [ ] FAQ section with FAQ schema (common client questions)

### Trust & local SEO
- [ ] Collect Google / Facebook reviews mentioning city + service
- [ ] Keep **NAP** identical everywhere (Name, Area, Phone) — website, GBP, Instagram, Facebook
- [ ] Add business hours to Google Business Profile (and optionally to schema)
- [ ] Confirm WhatsApp Business profile links to the website

### Analytics & measurement
- [ ] Google Analytics 4 (or Vercel Analytics)
- [ ] Track enquiry form submissions as conversions
- [ ] Optional: Meta Pixel if you run Facebook/Instagram ads

### Ongoing hygiene
- [ ] Re-test rich results: [Google Rich Results Test](https://search.google.com/test/rich-results)
- [ ] Re-test sharing previews: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) / WhatsApp link preview
- [ ] After custom domain: update `SITE_URL` in `src/lib/site.ts`, Search Console, sitemap, and social bios
- [ ] Monitor Search Console for crawl errors and query impressions

---

## Quick checklist after deploy

1. Open `/robots.txt` and `/sitemap.xml` on production  
2. View page source → confirm `<title>`, meta description, and JSON-LD  
3. Submit sitemap in Search Console  
4. Share the homepage URL in WhatsApp once and confirm the preview looks acceptable  

---

## Notes

- Hash links (`#contact`, `#services`) help UX but are **not** strong SEO landing pages; real routes are better later.
- Do **not** index `/admin` — already blocked in robots and metadata.
- Until a custom domain is live, keep promoting the Vercel URL consistently so rankings are not split.
