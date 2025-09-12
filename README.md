# EcoSnap AI — Hackathon Build, Startup Ready
A fast, polished web app that scans products and turns them into actionable sustainability insights. Built to demo in minutes, designed to scale for real users.
## Why it matters (hackathon pitch)
- Shop smarter: see an instant eco score and simple, trustworthy reasons.
- Compare at a glance: alternatives, trade‑offs, and tips that actually help.
- Delightful demo: camera scanning, smooth animations, and AR overlays.
## What's inside (feature overview)
- Product Scanner (camera or upload) with instant eco score and summary
- AR Overlay preview that floats the score and key facts in your view
- Bulk Scan (CSV or gallery) for batch analysis and quick triage
- Dashboard with trends, badges, and personal progress
- Leaderboard and achievements to drive engagement
- Beautiful UI: glassmorphism, dark/light, micro‑interactions
- Offline‑friendly fallbacks and resilient UX states
- Privacy‑first: no secrets committed; environment-driven config
## Tech you can trust
- React + TypeScript • Vite
- Tailwind CSS + shadcn/ui
- Animation system with orchestrated transitions
- Modular hooks and a clean state store
## Project structure
```text
src/
  components/      # UI + feature widgets (AR, charts, cards, etc.)
  pages/           # Scanner, Bulk, Dashboard, Leaderboard, ARPreview
  hooks/           # useEcoScore, useVision, useCamera, useToast, etc.
  lib/             # domain utilities, data adapters, client helpers
  index.css        # design tokens and theme
public/            # manifest, icons
supabase/          # optional edge functions and SQL (self-hostable)
```
## Getting started
1. Install
```bash
npm install
```
1. Run
```bash
npm run dev
```
1. Build
```bash
npm run build
```
Environment
- Copy `.env.example` to `.env` and fill values that apply to your setup.
- Keep `.env` private; it's ignored by git.
## Demo script (2–3 minutes)
1. Open Scanner → live camera or image upload → get score + highlights.
2. Tap AR Preview → see floating score and facts overlay.
3. Bulk Scan → drop multiple items → instant grid with ranks.
4. Dashboard → badges, weekly trend, tips; then Leaderboard for social pull.
## Product thinking (startup‑oriented)
- Wedge: instant scoring + delightful UI → drive repeat scans.
- Expansion: teams, shared lists, verified brands, and incentives.
- Monetization: pro insights, enterprise dashboards, verified product badges.
- Moats: UX polish, data quality pipeline, habit loops (badges + tips).
## Accessibility & performance
- Keyboard and screen‑reader friendly components
- Motion reduced when user prefers reduced motion
- Optimized Vite build, code‑splitting, and lazy routes
## Deployment
- Ships as a static build (dist/).
- Works on any static host or serverless platform.
- Set environment variables via your hosting dashboard.
### Deploy to Vercel
Web flow (recommended)
1. Go to https://vercel.com/new and import your GitHub repo (main branch).
2. Framework: Vite. Build: npm run build. Output: dist.
3. In "Environment Variables", add the keys you use in your .env (only those starting with VITE_).
4. Deploy. Vercel will auto-build on every push to main.
Windows PowerShell (CLI, optional)
```
npm i -g vercel
vercel login
vercel link
# add each required variable (repeat for your VITE_* keys)
vercel env add VITE_APP_NAME production
vercel env add VITE_APP_VERSION production
vercel --prod
```
Post-deploy checklist
- Open the deployment URL and test Scanner, Bulk Scan, Dashboard, and AR Preview.
- Verify dark/light themes, animations, and mobile camera permissions.
- Confirm environment-driven features work (anything controlled by VITE_*).
- Set a custom domain in Vercel (optional) and enable HTTPS.
## Contributing
- Keep commits small and purposeful.
- Add or update tests/types when changing public behavior.
- Never commit secrets; use .env and provider dashboards.
— Built for hackathons, ready for real users.
