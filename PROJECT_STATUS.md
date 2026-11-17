# Project Status — Jacques Prades Memorial Website

Last updated: 17 November 2026 (evening — admin area shipped)

## Live

- **Public site: https://jacquesprades.com** (custom domain, 17 Nov 2026)
  - `www.jacquesprades.com` 301-redirects to the apex domain
  - Domain registered at Cloudflare Registrar (Tara's account, ~$11/yr, auto-renews); DNS at Cloudflare, records "DNS only" so Railway manages the Let's Encrypt certificate (auto-renewing)
  - The original https://jacques-memorial-production.up.railway.app stays functional
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

## Phase 2a — family admin area: SHIPPED (17 Nov 2026)

Per revised requirements, individual administrator accounts (not a shared password):

- **Owner account** (Tara): full access, manages administrators
- **Family administrator accounts**: edit ceremony/flowers/announcements and (later) moderate submissions; cannot manage the owner or other admins
- `/admin` — mobile-friendly, same visual language as the public site
- Security: bcrypt password hashing (cost 12), HTTP-only Secure session cookies (30 days), login rate limiting (8 failures / 15 min / IP), role-based access control enforced server-side, one-time owner setup page protected by a `SETUP_CODE` environment variable, invitation links (single-use, 7-day expiry) so every person sets their own password — no credentials ever stored in the repo or known to the developer
- Owner can invite, deactivate, and reactivate family administrators; deactivation kills live sessions; the owner account cannot be deactivated via the API
- Content now lives in SQLite on a Railway volume (`/data`): edits in the admin are instantly live, no redeploy. The DB seeds itself from `content/*.json` on first boot. Public endpoints unchanged
- Tested: 20-step API test of all auth/role/moderation-of-admins flows + UI pass at phone size

## Phase 2b — media uploads: planned

- Review queue for submitted memories and media: approve for public / keep family-only / reject; batch download of originals

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

- Tara: complete the one-time owner setup at `/admin` (setup code was sent privately)
- Ceremony details (dates, times, venue, Google Maps link) — now enterable via `/admin`
- Flower delivery address, recipient, delivery instructions — now enterable via `/admin`
- Eulogy text and translations
- Cloudflare account now exists (created for the domain) — ready for Phase 2b R2 storage
- Decision: connect GitHub → Railway auto-deploy, or keep CLI deploys

## Operating notes

- Never commit credentials; secrets live in Railway environment variables
- Private family submissions must never appear in public galleries, APIs, or publicly accessible storage URLs
- Editable site content: `content/site.json`, `content/updates.json` (trilingual fields `th`/`en`/`fr`)
