# Jacques Prades Memorial Website

A multilingual (ไทย / EN / FR) memorial website for Jacques Leon Joseph Prades (คุณแจ็ค).

## How to update the site (no coding needed)

All editable information lives in two files:

- **`content/site.json`** — ceremony details (venue, address, Google Maps link, schedule) and flower delivery information. Every text has three versions: `th`, `en`, `fr`. A field set to `null` shows as "To be confirmed" on the site.
- **`content/updates.json`** — the announcements shown in the "Latest updates" bar. Newest entries go at the **top** of the list. Each entry has a `date`, trilingual `title` and `body`, and a `link` to the relevant page (`/ceremony`, `/flowers`, `/photos`, `/memories`, `/eulogy`, or `/`).

After editing, commit and push to `main` — Railway redeploys automatically.

## The cover photograph

Save the photo as **`public/cover.jpg`** (portrait orientation works best), then commit and push. Until then, an elegant placeholder is shown.

## Running locally

```
npm install
npm run build
npm start        # serves on http://localhost:4300
```

## Architecture

- `server/index.js` — small Express server: serves the built site and `/api/content` + `/api/updates`.
- `src/` — React + TypeScript frontend (Vite). Language choice is remembered on each visitor's device.
- `content/` — the editable JSON content described above.

## Roadmap

- **Phase 2** — secure family admin area; real photo/video uploads to persistent object storage; written memories with public/family-only moderation; downloadable archive.
- **Phase 3** — live multilingual eulogy with private iPad presenter controller synchronizing paragraphs to guests' phones.
