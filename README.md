# Rajput Events

Professional event management website for **Rajput Events** — weddings and corporate occasions, beautifully orchestrated.

**Tagline:** Every Occasion, Beautifully Orchestrated.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Nodemailer (Gmail SMTP contact form)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Copy `.env.example` to `.env` and fill in your Gmail App Password:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=rajputevents04@gmail.com
SMTP_PASS=your-gmail-app-password
CONTACT_TO=rajputevents04@gmail.com
CONTACT_FROM_NAME=Rajput Events Website
```

### Gmail App Password

1. Enable 2-Step Verification on the Google Account.
2. Go to Google Account → Security → App passwords.
3. Create an app password for “Mail”.
4. Paste it into `SMTP_PASS` in `.env`.

## Brand

| Colour | Hex | Usage |
| --- | --- | --- |
| Midnight Navy | `#0B1736` | Main backgrounds |
| Champagne Gold | `#C9A45C` | Logo, borders, highlights |
| Warm Ivory | `#F7F3EA` | Light sections |
| Charcoal | `#252833` | Body text on light |

**Fonts:** Cinzel (headings), Montserrat (body), Cormorant Garamond (accent).

**Contact:** rajputevents04@gmail.com · @rajputevents · rajputevents.com
