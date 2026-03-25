# NEST Ulasli — Private Luxury Villas

Live: **https://nest-ulasli.vercel.app**

Luxury villa rental website for NEST Ulasli — a twin-villa estate in Kocaeli, Turkey, opening September 2026.

## Pages

| Route | Visibility | Description |
|-------|-----------|-------------|
| `/` | Public | Landing page — hero with Ken Burns effect, feature strip |
| `/gallery` | Public | Categorised media gallery (Exterior, Interior, Construction) with lightbox |
| `/book` | Public | 5-step guided booking flow with calendar, pricing, WhatsApp/email CTA |
| `/planner` | Private link | Investment ROI planner — scenario analysis, area charts, villa breakdown |
| `/admin` | Private link | Availability manager — add/edit/remove booked dates per villa |

## Tech Stack

- **React 18** + **TypeScript** + **Vite 5**
- **react-router-dom** v6 (SPA routing)
- **Recharts** (area charts on planner page)
- **react-day-picker** + **date-fns** (booking calendar)
- **Vercel** (deployment, auto-deploy on push to main)
- Custom CSS (no framework) with CSS custom properties

## Internationalisation

3 languages supported: **English**, **Turkish**, **Arabic** (RTL).

- Translation files: `src/i18n/{en,tr,ar}.json`
- React Context-based i18n with `t()` function and `{{param}}` interpolation
- Language selector in nav bar (EN / TR / ع)
- Preference persisted in localStorage
- Arabic font: Noto Sans Arabic (Google Fonts)

## Colour Palette

Dark forest green luxury theme:
- Brand: `#2c5e3f`
- Background: `#f4f5f0`
- Ink: `#1a1f16`
- Serif headings: Playfair Display

## Availability System

Booked dates are managed via `/admin` and stored in localStorage. The booking page reads from the same store to show unavailable dates on the calendar.

- Store: `src/availability.ts`
- Admin: `src/AdminPage.tsx`
- Consumer: `src/BookingPage.tsx`

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
npm run build    # production build (vite)
```

## Private Links

These pages are not shown in the navigation but accessible via direct URL:

- **Investment Planner**: https://nest-ulasli.vercel.app/planner
- **Admin Extranet**: https://nest-ulasli.vercel.app/admin
