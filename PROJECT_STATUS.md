# Project Status — Jacques Prades Memorial Website

Last updated: 17 November 2026

## Live

- Public site: https://jacques-memorial-production.up.railway.app
- Repo: https://github.com/emperatrizz/jacques-memorial (branch `main`)
- Hosting: Railway project `jacques-memorial` (separate from any other project)
- Deploys: run via Railway CLI (`npx @railway/cli up` from the project folder). GitHub is a code backup; push-to-main auto-deploy is **not** connected yet.

## Phase 1 — complete (17 Nov 2026)

- Mobile-first trilingual site (ไทย / EN / FR), language remembered per device
- Homepage with cover photograph of Jacques (added 17 Nov), name block, clickable "Latest updates" bar, section tiles
- Ceremony & Schedule and Flowers & Wreaths pages driven by `content/site.json` (fields set to `null` display as "To be confirmed")
- Updates history driven by `content/updates.json`
- Photos, Memories, and Eulogy sections show "opening soon" pages
- Verified on mobile and desktop sizes, light and dark mode, all three languages

## Phase 2 — planned (next)

### Family admin area (mobile-friendly)

- Route: `/admin`, server-rendered React page behind a session login
- Auth: single shared family password at first (bcrypt hash in a Railway environment variable, never in the repo), HTTP-only session cookie; can graduate to per-person accounts later if needed
- Capabilities, in build order:
  1. Edit ceremony details, flower info, and announcements in all three languages (writes move from repo JSON files to SQLite on a Railway volume, so edits are instant — no redeploy)
  2. Review queue for submitted memories and media: approve for public / keep family-only / reject
  3. Batch download of original uploaded files
- The public site keeps reading the same `/api/content` and `/api/updates` endpoints, so nothing visible changes during the migration

### Storage recommendation for photo/video submissions

**Cloudflare R2** (S3-compatible object storage), private bucket:

- Simplest reliable option alongside Railway; no egress fees (important if videos get shared/downloaded a lot); ~free at expected volumes (10 GB free, then ~$0.015/GB-month)
- Bucket stays **private**. The server issues short-lived signed URLs: public gallery items get them only after family approval; family-only items only to logged-in admins. Private files are never guessable or publicly addressable
- Originals preserved untouched at upload; admin area offers single and batch (zip) downloads
- Uploads: direct-to-R2 via server-issued presigned upload URLs (keeps large videos off the app server), per-file size cap (e.g. 500 MB), basic rate limiting + honeypot field for spam, strict content-type allowlist
- Metadata (contributor name, public/family-only choice, approval state) in SQLite on a Railway volume — same database as content editing
- Fallback option if R2 setup is unwanted: Backblaze B2 (similar, S3-compatible). A Railway volume alone is **not** recommended for media (single disk, no signed URLs, hard to back up)

## Phase 3 — before the ceremony

- Multilingual eulogy page (text supplied separately)
- Private iPad presenter controller advancing synchronized paragraphs on guests' phones (WebSocket broadcast, read-only for guests, with a manual-scroll fallback if the connection drops)

## Outstanding / waiting on family

- Ceremony details (dates, times, venue, Google Maps link)
- Flower delivery address, recipient, delivery instructions
- Eulogy text and translations
- Decision: connect GitHub → Railway auto-deploy, or keep CLI deploys

## Operating notes

- Never commit credentials; secrets live in Railway environment variables
- Private family submissions must never appear in public galleries, APIs, or publicly accessible storage URLs
- Editable site content: `content/site.json`, `content/updates.json` (trilingual fields `th`/`en`/`fr`)
