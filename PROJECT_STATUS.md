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

## Phase 2b — submissions & media: SHIPPED (17 Nov 2026, live-tested)

- Visitors (no accounts) share photos, videos, and written memories in ไทย/EN/FR from `/photos` and `/memories`; optional name; choice of **Public (after family approval)** or **Family only**
- Storage: private Cloudflare R2 bucket `jacques-memorial-media` (Tara's account). Browsers upload directly via short-lived presigned PUT URLs (1 h); nothing public ever touches the bucket directly. Originals preserved untouched
- Privacy: everything lands in a pending queue; the public gallery serves only approved+public items through 15-minute signed URLs; family-only items are never exposed through public endpoints (verified by test) and even "approved" family items stay private
- Moderation (owner + family admins): `/admin` → Submissions — filters by status/visibility, inline previews, approve/reject/restore, per-file original downloads, streaming ZIP batch export (folders per contributor incl. their message), delete (also removes R2 objects)
- Public gallery items have a "Save" button that downloads the original (camera-roll friendly)
- Protection: honeypot field, 10 submissions/hour/IP, content-type allowlist (common photo/video types only — nothing executable), size caps 50 MB photos / 1 GB videos, upload-token verification, signed-URL tamper rejection
- Recoverability: media lives in R2 independently of Railway; metadata via the owner's one-click database backup button. Storage usage/cost: Cloudflare dashboard → R2 (free tier 10 GB)
- Tested: 22-step local suite + live end-to-end on jacquesprades.com (real upload into R2, CORS preflight, moderation by Tara, gallery display, deletion)

### Storage recommendation for photo/video submissions

**Cloudflare R2** (S3-compatible object storage), private bucket:

- Simplest reliable option alongside Railway; no egress fees (important if videos get shared/downloaded a lot); ~free at expected volumes (10 GB free, then ~$0.015/GB-month)
- Bucket stays **private**. The server issues short-lived signed URLs: public gallery items get them only after family approval; family-only items only to logged-in admins. Private files are never guessable or publicly addressable
- Originals preserved untouched at upload; admin area offers single and batch (zip) downloads
- Uploads: direct-to-R2 via server-issued presigned upload URLs (keeps large videos off the app server), per-file size cap (e.g. 500 MB), basic rate limiting + honeypot field for spam, strict content-type allowlist
- Metadata (contributor name, public/family-only choice, approval state) in SQLite on a Railway volume — same database as content editing
- Fallback option if R2 setup is unwanted: Backblaze B2 (similar, S3-compatible). A Railway volume alone is **not** recommended for media (single disk, no signed URLs, hard to back up)

## Phase 3 — live eulogy: SHIPPED (17 Nov 2026, placeholder text)

- Admin → Eulogy: edit/reorder aligned trilingual paragraphs, no redeploys; speech stays **private until explicitly published** (currently unpublished; 5 clearly marked placeholder paragraphs seeded for rehearsal)
- Presenter (`/admin/eulogy/present`, built for iPad Safari, responsive web — no native app): huge current paragraph with prev/next context, big Back/Next/Start/End controls, keyboard & presenter-remote keys, double-tap guard, progress counter, connection dot, reload-safe (place kept server-side)
- One controller at a time: control tokens; a second device must explicitly take over, the first is cleanly locked out with a "take control back" option
- Guests (`/eulogy`): trilingual, large text with independent A−/A+ (remembered per device), live paragraph highlighted and auto-centered, free rereading with a floating "Return to live", late joiners sync instantly; WebSocket with auto-reconnect + 10s HTTP polling fallback; revealed text is always readable as the static fallback
- **Progressive reveal** (Tara's request after device rehearsal, 17 Nov): paragraphs appear one by one as read — unread paragraphs never leave the server, so guests cannot read ahead; stepping back or ending never hides words already heard; "Reveal whole text" toggle for after the ceremony; rehearsal reset button; preview mirrors the reveal behavior
- Rehearsal guest preview carries the full ไทย/English/Français selector (same reader component as the public page: A−/A+, reveal-as-read, Return to live); switching language is per-device and never affects the presenter. Rehearsal guest URL for phones: `/admin/eulogy/preview` (requires admin sign-in; placeholder speech stays off the public site)
- Rehearsal session fully isolated from the public live session (admin-only, separate state, WS subscription requires an admin session; verified) + admin "guest view" preview page
- Also shipped: Open Graph/Twitter sharing preview (1200×630 photo at https://jacquesprades.com/og.jpg, absolute URLs, verified in live page metadata) for WhatsApp/LINE/Facebook
- Tested: 11 API checks (privacy, control takeover, unauthorized attempts, bounds) + 7-scenario simulated multi-guest WebSocket suite (3 guests, late join, reconnection, rehearsal isolation, end-of-reading) + UI pass at phone and iPad viewports + production WS smoke test. **Not tested on physical iPads/phones — a real-device rehearsal is recommended before the ceremony**

## Life & Legacy + memorial QR (17 Nov 2026)

- `/life` — trilingual biography (gem tile on the homepage): early life, journey to Thailand, jewellery career, achievements, legacy; photographs (stored under `biography/` in R2, streamed with caching); curated external articles with title/description/link. All editable in Admin → Life & Legacy, live without redeploys
- **Real biography published (17 Nov 2026)**: Tara's English text verbatim in six sections (Auvergne/Paris early years, years of adventure, Thailand, Gamma Creations, family, his story), with French and Thai translations by Claude (Tara to review; the site avoids the word "died" — EN "passed away", FR "s'est éteint", TH "จากไป"; Tara in Thai is ทาร่า)
- **Section photographs placed (17 Nov 2026)**: 15 family photographs evaluated, restored and placed into per-section carousels — Early years (2: the 1937 baby photo with the handwritten overlay removed, a straightened/cropped street photo), Adventure (4: motorcycles, Land Rover, trekking, with Robert), Thailand (3: at home, with Khun Chotip — straightened/cropped, Jewelry Designer Club 1998), Gamma (4: desk with orchids, drafting table, booth 1995, French press spread), Family (2). Originals untouched; web copies resized to 1600px. Carousels auto-advance every 4.5s, stop on touch/scroll, respect reduced-motion
- Memorial QR: `/qr.png` (4096px, decode-verified) and `/qr.svg` link to jacquesprades.com; `/qr-card.html` — printable A6 card in the site identity (seal, cursive name, white QR panel, trilingual invitation); `/qr-card-large.png` — 2480×3496 print-ready card image (A6@600dpi / A4@300dpi). Physical phone-scan test by the family recommended

## Outstanding / waiting on family

- Tara: complete the one-time owner setup at `/admin` (setup code was sent privately)
- Ceremony details (dates, times, venue, Google Maps link) — now enterable via `/admin`
- Flower delivery address, recipient, delivery instructions — now enterable via `/admin`
- Eulogy text and translations
- Cloudflare account now exists (created for the domain) — ready for Phase 2b R2 storage
- Decision: connect GitHub → Railway auto-deploy, or keep CLI deploys

## Operating notes

- Owner-authorized automation key (`ADMIN_API_TOKEN` env var, 17 Nov): lets the family's trusted tooling (Claude, from Tara's machine) publish announcements, edit content, and moderate via the admin API. Admin-level only — cannot manage accounts or change passwords. Rotate anytime by replacing the variable in Railway.

- Never commit credentials; secrets live in Railway environment variables
- Private family submissions must never appear in public galleries, APIs, or publicly accessible storage URLs
- Editable site content: `content/site.json`, `content/updates.json` (trilingual fields `th`/`en`/`fr`)
