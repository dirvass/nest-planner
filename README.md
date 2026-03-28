# VERDE Ulaşlı — Turkey's First Agro-Luxury Villa Estate

Live: **https://verde-ulasli.com**

Twin-villa agro-luxury estate in Kocaeli, Ulaşlı — opening September 2026.

## Pages

| Route | Visibility | Description |
|-------|-----------|-------------|
| `/` | Public | Home — hero, agro-luxury intro, two villas, experiences, location, CTA, footer |
| `/story` | Public | Our Story — 10-section narrative (history, philosophy, agro-culture, Verde etymology, location) |
| `/experience` | Public | Experiences — 10 experience cards + 4 seasonal packages |
| `/gallery` | Public | Gallery — categorised media (Exterior, Interior, Construction) with lightbox |
| `/book` | Public | Booking — 5-step guided flow, calendar, enquiry-based (no public pricing), WhatsApp/email CTA |
| `/planner` | Private | Investment ROI planner — scenario analysis, area charts, villa breakdown |
| `/admin` | Private | Availability manager — add/edit/remove booked dates per villa |

## Brand Identity

**VERDE** = Italian for "green" — the colour of paradise in Islamic tradition, the language of Italian elegance, and the essence of the land.

### Colour Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--verde-deep` | `#0E1A16` | Hero overlays, footer, dark sections |
| `--brand` | `#2D5040` | Buttons, links, accents |
| `--sand` | `#C9B99A` | Warm accents |
| `--gold` | `#C3A564` | Luxury accents, dividers |
| `--mist` | `#EBE8E1` | Light text on dark backgrounds |

### Typography
- Headings: Playfair Display (serif)
- Body: Inter (sans-serif)
- Arabic: Noto Sans Arabic

## Tech Stack

- **React 18** + **TypeScript** + **Vite 5**
- **react-router-dom** v6 (SPA routing)
- **Recharts** (area charts on planner page)
- **react-day-picker** + **date-fns** (booking calendar)
- **Vercel** (deployment, auto-deploy on push to main)
- Custom CSS with CSS custom properties (no framework)

## Internationalisation

3 languages: **English**, **Turkish**, **Arabic** (RTL).

- Translation files: `src/i18n/{en,tr,ar}.json`
- React Context-based i18n with `t()` function
- Language selector in nav bar (EN / TR / ع)
- Preference persisted in localStorage

## Feature Flags

| Flag | File | Default | Purpose |
|------|------|---------|---------|
| `SHOW_PRICING` | `BookingPage.tsx` | `false` | Toggle pricing breakdown visibility |

## Media Structure

```
public/media/
  dis-mekan/       # 12 exterior renders
  ic-mekan/        # 7 interior renders
  insaat-sureci/   # 10 construction photos
  videolar/        # 4 site videos (mp4)
```

## Development

```bash
npm install
npm run dev      # local dev server
npm run build    # production build
```

## Private Links

- **Investment Planner**: https://verde-ulasli.com/planner
- **Admin Extranet**: https://verde-ulasli.com/admin
