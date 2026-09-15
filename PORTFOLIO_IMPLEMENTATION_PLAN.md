# Implementation Plan — ZPPSU Developer Portfolio Web App

**Target repo:** `C:\Users\ACER\OneDrive\Desktop\ZPPSU A.Y. 2026-2027\My Project\My Portfolio`
**Executor:** Antigravity Desktop (agentic IDE), driving Gemini 3.8 Flash High
**Data sources already on disk:** `PROJECTS_CATALOG.md`, `projects_inventory.json`
**Scope:** 37 projects, 5 domains, 8 live deployments, static site on Cloudflare Pages

---

## 0. How to run this with Antigravity

Paste this kickoff message into Antigravity, then attach this file:

> Read `PORTFOLIO_IMPLEMENTATION_PLAN.md` in full before writing any code. It contains a task board (T-01 … T-34) with explicit acceptance criteria. Execute tasks **strictly in order**. After each task, run its "Verify" command and paste the output. Do not start the next task until the current one passes. If a task's acceptance criteria cannot be met, stop and report the blocker instead of improvising an alternative. Do not modify any file outside the `My Portfolio` directory.

### Agent operating rules (non-negotiable)

1. **Read before write.** Before Phase 3, open and read the real `projects_inventory.json` and `PROJECTS_CATALOG.md`. Do not assume field names; map them.
2. **Sibling project folders are read-only.** You may `copy` assets out of them. Never edit, move, delete, or `git init` inside them.
3. **No invented data.** If a project's tech stack, run command, or link is not in the catalog, write `null` and add the project's slug to `data/GAPS.md`. Never guess a URL.
4. **One task = one commit.** Commit message format: `T-07: build ProjectCard component`.
5. **Never install a package not listed in this plan** without stating why and getting confirmation.
6. **Verify with real output.** "It should work" is not verification. Run the command.
7. **Windows paths contain spaces.** Always quote: `cd "C:\Users\ACER\OneDrive\Desktop\ZPPSU A.Y. 2026-2027\My Project\My Portfolio"`.

---

## 1. Architecture decision record

### 1.1 Framework: **Astro 5 + React islands** (chosen)

| Option | Verdict |
|---|---|
| **Astro 5** | **Chosen.** Content-driven site with 4 interactive elements (theme toggle, filter tabs, drawer, image gallery). Astro ships zero JS by default and hydrates only those islands. Realistic bundle: 25–40 KB gzip. Content Collections give typed, validated data from JSON out of the box. Static output deploys to Cloudflare Pages with no adapter. |
| Next.js 15 `output: 'export'` | Rejected for this build. You'd ship the full React + Next client runtime (~90 KB gzip) to render what is fundamentally a static document. App Router adds RSC/server-component rules that produce avoidable agent errors in a static export. |
| Vite + React SPA | Rejected. No SSG means weak SEO and a blank-screen LCP — the opposite of the "visual-first, instant" goal. |

**You still get React.** Vaul, Radix, and any React component work inside Astro islands via `client:load` / `client:visible`. Nothing about your Next.js experience is wasted.

### 1.2 Locked stack

| Layer | Choice | Version |
|---|---|---|
| Framework | Astro | `^5.6.0` |
| Islands | React | `^19.0.0` |
| Styling | Tailwind CSS | `^4.1.0` (via `@tailwindcss/vite`) |
| Drawer | Vaul | `^1.1.2` |
| Primitives | `@radix-ui/react-visually-hidden` | `^1.1.0` |
| Icons | `lucide-react` | `^0.460.0` |
| Validation | Zod (bundled with `astro:content`) | — |
| Screenshots | Playwright | `^1.49.0` (devDependency) |
| Image opt | `sharp` (used by `astro:assets`) | `^0.33.0` |
| Runtime | Node | `22.x` |
| Host | Cloudflare Pages | static `dist/` |

### 1.3 Performance budget (hard gates)

- Lighthouse mobile: Performance ≥ 98, Accessibility 100, Best Practices 100, SEO 100
- Total JS transferred on `/`: **≤ 45 KB gzip**
- LCP ≤ 1.5 s on simulated Slow 4G
- CLS ≤ 0.02
- No image over 250 KB in `dist/`
- Filter tab interaction: no network request, no re-render of unfiltered cards

---

## 2. Phase 0 — Environment (T-01 … T-03)

### ⚠️ T-01: Resolve the OneDrive problem (do this first)

`node_modules` inside a OneDrive-synced folder causes file-lock errors, 10× slower installs, and random build failures on Windows. Pick one:

**Option A (recommended) — build outside OneDrive, publish from GitHub:**
```powershell
mkdir C:\dev
robocopy "C:\Users\ACER\OneDrive\Desktop\ZPPSU A.Y. 2026-2027\My Project\My Portfolio" "C:\dev\my-portfolio" /E
cd C:\dev\my-portfolio
```
All later paths in this plan use `C:\dev\my-portfolio` as `$REPO`. The original folder stays as the data source (`$SOURCE`).

**Option B — stay in OneDrive:** right-click the `My Portfolio` folder → *Always keep on this device*, then exclude `node_modules` from sync via OneDrive Settings → Sync and backup → Advanced.

**Verify:** `echo $REPO` resolves, and `cd $REPO && dir` lists the copied files.

### T-02: Toolchain check
```powershell
node -v    # must be v22.x
npm -v     # must be >= 10
git --version
```
If Node is not 22.x, install it via `nvm-windows` and run `nvm use 22`.

### T-03: Define the two path variables in every script
Create `$REPO\.env.local`:
```
SOURCE_ROOT="C:\Users\ACER\OneDrive\Desktop\ZPPSU A.Y. 2026-2027\My Project"
```
Add `.env.local` to `.gitignore`. Scripts read `process.env.SOURCE_ROOT` — never hardcode the path in source files.

---

## 3. Phase 1 — Scaffold (T-04 … T-06)

### T-04: Create the Astro project
```powershell
cd C:\dev
npm create astro@latest my-portfolio -- --template minimal --typescript strict --no-install --no-git
cd my-portfolio
npm install
npx astro add react --yes
npm install tailwindcss @tailwindcss/vite vaul @radix-ui/react-visually-hidden lucide-react
npm install -D playwright @playwright/test sharp
npx playwright install chromium
```
If the folder already has files from T-01 Option A, scaffold into `C:\dev\_scaffold` and copy the generated files across, preserving `PROJECTS_CATALOG.md` and `projects_inventory.json`.

### T-05: `astro.config.mjs`
```js
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://your-domain.pages.dev', // replace in T-32
  output: 'static',
  vite: { plugins: [tailwindcss()] },
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
  build: { inlineStylesheets: 'auto' },
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
});
```

### T-06: Target file tree
Create these directories now (empty files are fine):
```
$REPO/
├─ public/
│  ├─ _headers
│  ├─ _redirects
│  ├─ favicon.svg
│  └─ og/                        # generated OG images
├─ scripts/
│  ├─ normalize-inventory.mjs
│  ├─ capture.config.mjs
│  ├─ capture-screenshots.mjs
│  ├─ collect-local-assets.mjs
│  └─ optimize-images.mjs
├─ src/
│  ├─ assets/projects/<slug>/     # source images (astro:assets processes these)
│  ├─ components/
│  │  ├─ BentoGrid.astro
│  │  ├─ BentoTile.astro
│  │  ├─ ProjectCard.astro
│  │  ├─ ProjectGrid.astro
│  │  ├─ TechBadge.astro
│  │  ├─ StatusPill.astro
│  │  ├─ SectionHeading.astro
│  │  ├─ islands/
│  │  │  ├─ ThemeToggle.tsx
│  │  │  ├─ DomainFilter.tsx
│  │  │  ├─ CaseStudyDrawer.tsx
│  │  │  └─ Gallery.tsx
│  ├─ data/
│  │  ├─ projects.json            # generated — do not hand-edit
│  │  ├─ GAPS.md                  # generated
│  │  └─ domains.ts
│  ├─ layouts/BaseLayout.astro
│  ├─ pages/
│  │  ├─ index.astro
│  │  ├─ projects/[slug].astro
│  │  ├─ 404.astro
│  │  └─ og/[slug].png.ts          # optional, T-30
│  ├─ styles/global.css
│  ├─ content.config.ts
│  └─ lib/{types.ts,format.ts}
├─ PROJECTS_CATALOG.md            # source of truth (read-only input)
├─ projects_inventory.json        # source of truth (read-only input)
└─ PORTFOLIO_IMPLEMENTATION_PLAN.md
```

**Verify T-04…T-06:** `npm run dev` serves the default page on `localhost:4321` with no console errors.

---

## 4. Phase 2 — Design system (T-07 … T-09)

### 4.1 Design plan

**Subject:** not a generic dev portfolio. This is an *institutional systems engineer's* body of work — university compliance, tournament brackets, offline LAN classrooms in buildings with no internet. The visual identity should feel like well-made operational software: dense with real information, quiet, legible, engineered. The memorable element is the **bento hero**; everything else stays disciplined.

**Color** (brief-specified values are locked; the rest is derived):

| Token | Dark | Light | Role |
|---|---|---|---|
| `canvas` | `#09090B` | `#F8F9FA` | page background |
| `surface` | `#18181B` | `#FFFFFF` | cards, tiles, drawer |
| `surface-2` | `#27272A` | `#F1F3F5` | badges, inset wells |
| `line` | `#27272A` | `#E4E4E7` | 1px borders |
| `ink` | `#FAFAFA` | `#09090B` | primary text |
| `ink-muted` | `#A1A1AA` | `#52525B` | secondary text |
| `accent` | `#34D399` | `#059669` | live/deployed state, primary CTA |
| `accent-alt` | `#818CF8` | `#4F46E5` | offline-LAN state, secondary |

The two accents are **semantic, not decorative**: emerald means "you can click this and reach a running system," indigo means "this runs on a local network, here's the command." Never use an accent for emphasis that isn't one of those two meanings.

**Type:**
- Display / headings: **Bricolage Grotesque** (variable, `wght 400–800`, `opsz`). Slightly condensed and mechanical — reads as instrumentation, not marketing.
- Body / UI: **Inter** variable, `wght 400/500`, `font-feature-settings: 'cv05','ss03'`.
- Data / commands / stack badges: **JetBrains Mono** `wght 400/500`. Used only where the content is literally code or a command — not as a decorative label face.

Type scale (1.25 major third, clamped):
```
display  clamp(2.75rem, 6vw, 4.5rem)   / lh 0.95 / tracking -0.03em
h2       clamp(1.75rem, 3vw, 2.25rem)  / lh 1.1  / tracking -0.02em
h3       1.25rem / lh 1.3
body     1rem    / lh 1.6  / max-width 68ch
small    0.875rem / lh 1.5
mono     0.8125rem / lh 1.45 / tracking 0
```

**Layout:** left-aligned throughout. Max content width `1200px`, gutters `clamp(1rem, 4vw, 2.5rem)`. Border radius is hierarchical, not uniform: bento tiles `16px`, standard cards `12px`, badges/pills `6px`, buttons `8px`. No drop shadows in dark mode — depth comes from the `#18181B` vs `#09090B` value step and a 1px `line` border. Light mode gets a single shadow token: `0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px -12px rgb(0 0 0 / 0.08)`.

**Motion:** one orchestrated moment only — the bento tiles stagger in on first paint (60 ms apart, 320 ms, `cubic-bezier(.2,.8,.2,1)`), and it never replays. Everything else is response-to-input: drawer slide, filter cross-fade, focus rings. All of it behind `@media (prefers-reduced-motion: no-preference)`.

**Deliberately avoided:** no ALL-CAPS eyebrow labels, no `01 / 02 / 03` numbering (the projects are not a sequence), no `→` glued to link text, no gradient washes, no identical-radius card kit, no single-word color accents inside headlines.

### T-07: `src/styles/global.css`
```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

@theme {
  --color-canvas:      #F8F9FA;
  --color-surface:     #FFFFFF;
  --color-surface-2:   #F1F3F5;
  --color-line:        #E4E4E7;
  --color-ink:         #09090B;
  --color-ink-muted:   #52525B;
  --color-accent:      #059669;
  --color-accent-alt:  #4F46E5;

  --font-display: "Bricolage Grotesque Variable", ui-sans-serif, system-ui, sans-serif;
  --font-sans:    "Inter Variable", ui-sans-serif, system-ui, sans-serif;
  --font-mono:    "JetBrains Mono Variable", ui-monospace, monospace;

  --radius-tile:  16px;
  --radius-card:  12px;
  --radius-pill:  6px;

  --ease-out-soft: cubic-bezier(.2,.8,.2,1);
}

.dark {
  --color-canvas:     #09090B;
  --color-surface:    #18181B;
  --color-surface-2:  #27272A;
  --color-line:       #27272A;
  --color-ink:        #FAFAFA;
  --color-ink-muted:  #A1A1AA;
  --color-accent:     #34D399;
  --color-accent-alt: #818CF8;
}

html {
  background: var(--color-canvas);
  color: var(--color-ink);
  color-scheme: light;
}
html.dark { color-scheme: dark; }

/* Theme transition — only on the toggle, never on load */
html.theme-switching,
html.theme-switching * {
  transition: background-color 220ms var(--ease-out-soft),
              border-color 220ms var(--ease-out-soft),
              color 220ms var(--ease-out-soft) !important;
}

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 4px;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### T-08: Fonts
Install locally — do **not** use the Google Fonts CDN (extra DNS + render-block):
```powershell
npm install @fontsource-variable/bricolage-grotesque @fontsource-variable/inter @fontsource-variable/jetbrains-mono
```
Import in `BaseLayout.astro`:
```astro
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/inter';
import '@fontsource-variable/jetbrains-mono';
import '../styles/global.css';
```

### T-09: Anti-FOUC theme script
In `BaseLayout.astro`, **inside `<head>`, before any stylesheet**:
```astro
<script is:inline>
  (() => {
    const stored = localStorage.getItem('theme');
    const dark = stored ? stored === 'dark'
      : matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  })();
</script>
```

**Verify Phase 2:** load the page, toggle OS dark mode, hard-refresh. There must be **zero** white flash before dark paint. Screenshot both themes.

---

## 5. Phase 3 — Data layer (T-10 … T-13)

### T-10: Inspect the real inventory first
```powershell
node -e "const d=require('./projects_inventory.json'); console.log(Array.isArray(d)?'array':'object'); console.log(JSON.stringify(Array.isArray(d)?d[0]:Object.values(d)[0],null,2))"
```
Write the discovered field names into `data/FIELD_MAP.md` as a two-column table (`source field → target field`) before writing the normalizer. **Do not skip this.**

### T-11: Canonical schema — `src/content.config.ts`
```ts
import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

const DOMAINS = ['institutional','sports','edtech','offline-lan','platforms'] as const;

const projects = defineCollection({
  loader: file('src/data/projects.json'),
  schema: ({ image }) => z.object({
    id: z.string(),                       // slug, kebab-case, unique
    name: z.string(),
    tagline: z.string().max(110),         // one line, shown on card
    domain: z.enum(DOMAINS),
    status: z.enum(['live','offline-lan','internal','archived']),
    featured: z.boolean().default(false),
    bentoOrder: z.number().int().min(1).max(6).nullable().default(null),

    stack: z.object({
      frontend: z.array(z.string()).default([]),
      backend:  z.array(z.string()).default([]),
      data:     z.array(z.string()).default([]),
      infra:    z.array(z.string()).default([]),
    }),

    links: z.object({
      live:  z.string().url().nullable().default(null),
      repo:  z.string().url().nullable().default(null),
      notes: z.string().nullable().default(null),   // e.g. "GAS Web App endpoint"
    }),

    caseStudy: z.object({
      problem:      z.string(),           // 2–4 sentences, operational framing
      architecture: z.string(),           // local-first vs cloud, why
      features:     z.array(z.string()).min(1).max(8),
      outcome:      z.string().nullable().default(null),
    }),

    run: z.object({
      commands: z.array(z.string()).default([]),   // literal shell commands
      url:      z.string().nullable().default(null), // e.g. http://0.0.0.0:5000
    }),

    metrics: z.object({
      loc:   z.number().nullable().default(null),
      tests: z.string().nullable().default(null),  // e.g. "58/58 passing"
      scale: z.string().nullable().default(null),  // e.g. "302 athletes"
    }).default({}),

    hero:    image().nullable().default(null),
    gallery: z.array(z.object({
      src: image(),
      alt: z.string(),
      caption: z.string().nullable().default(null),
    })).default([]),

    year: z.number().int().default(2026),
  }),
});

export const collections = { projects };
```

### T-12: `scripts/normalize-inventory.mjs`
Requirements:
- Read `projects_inventory.json` + parse `PROJECTS_CATALOG.md` section by section.
- Emit `src/data/projects.json` matching the schema exactly.
- Slugify names: lowercase, spaces/underscores → `-`, strip `()` and `&`.
- Map the 5 domains from the catalog's 5 headings.
- Derive `status`: `live` if a URL exists; `offline-lan` if the catalog mentions LAN/offline/0.0.0.0; `internal` for GAS endpoints; else `internal`.
- Set `featured: true` and `bentoOrder` 1–6 for exactly: `board-exam-reviewer-gabay` (1), `localclassroom` (2), `epdu-palaro-2026-chess-tournament` (3), `ched-compliance-management-app` (4), `batasph-civicph` (5), `flexible-daily-admissions-tracking-web-app` (6).
- Any field it cannot source → `null`, and append a line to `src/data/GAPS.md`: `- [ ] <slug>: missing <field>`.
- **Fail the build** (`process.exit(1)`) if the output does not contain exactly 37 entries or if any slug is duplicated.

Wire it up:
```json
"scripts": {
  "data": "node scripts/normalize-inventory.mjs",
  "dev": "npm run data && astro dev",
  "build": "npm run data && astro check && astro build"
}
```

### T-13: Domains map — `src/data/domains.ts`
```ts
export const DOMAIN_META = {
  'institutional': { label: 'Institutional systems', short: 'Institutional', count: 11 },
  'sports':        { label: 'Sports & tournaments', short: 'Sports',        count: 6 },
  'edtech':        { label: 'EdTech & AI',          short: 'EdTech',        count: 9 },
  'offline-lan':   { label: 'Offline LAN',          short: 'Offline LAN',   count: 3 },
  'platforms':     { label: 'Platforms & tools',    short: 'Platforms',     count: 8 },
} as const;
```
Counts must be **computed at build time** from the collection, not hardcoded in the UI — the object above is only a label source.

**Verify Phase 3:** `npm run data && npx astro check` → 0 errors, `projects.json` has 37 entries, `GAPS.md` exists and is reviewed by you.

---

## 6. Phase 4 — Visual assets (T-14 … T-18)

This is the phase most likely to eat time. Work in tiers; ship after Tier C and backfill.

### T-14: Tier C — copy what already exists (fastest win)
`scripts/collect-local-assets.mjs` copies from `$SOURCE_ROOT` into `src/assets/projects/<slug>/`:

| Source | Destination slug |
|---|---|
| `LocalClassroom/public/images/slides/*.png` (pick 8 best: topology, circuit, dashboard) | `localclassroom/` |
| `Local Palaro Chess/**/*.png|jpg` (logos, banners) | `local-palaro-chess/` |
| `palaro submission of music/**/*.png|jpg` | `palaro-submission-of-music/` |
| ZPPSU seal | `src/assets/brand/` |

Rules: **copy, never move**. Skip files > 5 MB and log them. Normalize filenames to kebab-case.

### T-15: Tier A — capture the 8 live deployments
`scripts/capture.config.mjs`:
```js
export const LIVE = [
  { slug: 'ched-compliance-management-app',            url: 'https://zppsu-ched-compliance.pages.dev' },
  { slug: 'batasph-civicph',                            url: 'https://civic-ph.vercel.app' },
  { slug: 'flexible-daily-admissions-tracking-web-app', url: 'https://flexible-daily-admissions-tracking-web-app.vercel.app' },
  { slug: 'epdu-palaro-2026-chess-tournament',          url: 'https://epdu-chess-2026.imdcluy.workers.dev' },
  { slug: 'receipt-submission-pe-nstp',                 url: 'https://ntstp-pe-receipt-submission-tracker.netlify.app/' },
  { slug: 'cpt-palaro-management-system',               url: 'https://comtech-palaro-webapp.netlify.app' },
];
```
`scripts/capture-screenshots.mjs` behaviour:
- Chromium, `deviceScaleFactor: 2`.
- Desktop shot `1440×900`, mobile shot `390×844`.
- `waitUntil: 'networkidle'`, then `waitForTimeout(1200)` for font swap.
- Force dark theme where supported: `page.emulateMedia({ colorScheme: 'dark' })`.
- Save to `src/assets/projects/<slug>/shot-desktop.png` and `shot-mobile.png`.
- On timeout: log to `GAPS.md`, continue — **never crash the whole run**.

### T-16: Tier B — the 12 Comtech wireframes
Capture `file:///.../Comtech One Web App/wireframe-chunk*.html` with the same script, `fullPage: false`, viewport `1440×900`. Produces 12 real screenshots for a project with no live URL.

### T-17: Tier D — local apps that need a server
Create `scripts/capture.config.mjs → LOCAL[]` entries:
```js
{ slug: 'screening-app', cwd: 'Screening_App', start: 'python app.py', port: 5000, path: '/' }
```
The script: spawn `start` in `cwd`, poll `http://localhost:<port>` for up to 45 s, capture, then kill the process tree (`taskkill /PID <pid> /T /F` on Windows).
**Run this in small batches (3–4 apps)** and expect failures — Flask apps may need a seeded DB. Anything that fails goes to Tier E. Do not spend more than 90 minutes here.

### T-18: Tier E — generated posters for the rest
For any project still without a hero: render a deterministic poster instead of a grey placeholder.
- An Astro component `PosterFallback.astro` rendering the project name in Bricolage Grotesque over the `surface` color, with the top 3 stack badges in mono and a subtle 1px grid derived from the project's domain accent.
- Seed the grid density from a hash of the slug so no two look identical.
- This is a *designed* fallback, not an apology. It must look intentional next to real screenshots.

### T-18b: Optimize
`scripts/optimize-images.mjs` — sharp pass over `src/assets/projects/**`:
- Strip metadata, resize so max width = 1600 px.
- Emit AVIF (q 55) + WebP (q 78); keep PNG only for diagrams with text.
- Generate a 20 px LQIP and write base64 into `src/data/lqip.json` keyed by path.

Then in components use `astro:assets`:
```astro
<Picture src={project.data.hero} formats={['avif','webp']}
  widths={[480, 960, 1440]} sizes="(max-width: 768px) 100vw, 60vw"
  alt={`${project.data.name} interface`} loading="lazy" decoding="async" />
```
Above-the-fold bento tile 1 uses `loading="eager"` + `fetchpriority="high"`.

**Verify Phase 4:** every one of the 37 projects resolves to either a real image or a poster. No image in `dist/` exceeds 250 KB.

---

## 7. Phase 5 — Components (T-19 … T-25)

### T-19: `BaseLayout.astro`
Slots: `head`, default. Includes fonts, global.css, theme script, skip-link (`<a href="#main" class="sr-only focus:not-sr-only">Skip to projects</a>`), header, footer. Header is `position: sticky; top: 0` with `backdrop-filter: blur(12px)` and a `border-b border-line` that only appears after 40 px of scroll (tiny inline script, `IntersectionObserver` on a sentinel — no scroll listener).

### T-20: `ThemeToggle.tsx` (island, `client:load`)
```tsx
export default function ThemeToggle() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark'));

  function toggle() {
    const root = document.documentElement;
    root.classList.add('theme-switching');
    const next = !dark;
    root.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
    setDark(next);
    setTimeout(() => root.classList.remove('theme-switching'), 260);
  }

  return (
    <button onClick={toggle} type="button"
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
      aria-pressed={dark}
      className="rounded-[--radius-pill] p-2 text-ink-muted hover:text-ink">
      {dark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
```

### T-21: `BentoGrid.astro` — the hero

**Explicit placement, 6 columns × 4 rows on desktop.** This fills the grid perfectly with no holes:

```
       col1    col2    col3    col4    col5    col6
row1 ┌───────────────────────────────┬───────────────┐
row2 │  A  Gabay (feature)           │ B CHED        │
     │                               ├───────────────┤
     │                               │ C EPDU Chess  │
row3 ├───────────────┬───────────────┴───────────────┤
     │ D LocalClass  │ E BatasPh                     │
row4 │   (tall)      ├───────────────────────────────┤
     │               │ F Flexible Admissions         │
     └───────────────┴───────────────────────────────┘
```

Tailwind classes per tile:
```
A: lg:col-start-1 lg:col-span-4 lg:row-start-1 lg:row-span-2
B: lg:col-start-5 lg:col-span-2 lg:row-start-1 lg:row-span-1
C: lg:col-start-5 lg:col-span-2 lg:row-start-2 lg:row-span-1
D: lg:col-start-1 lg:col-span-2 lg:row-start-3 lg:row-span-2
E: lg:col-start-3 lg:col-span-4 lg:row-start-3 lg:row-span-1
F: lg:col-start-3 lg:col-span-4 lg:row-start-4 lg:row-span-1
```
Container: `grid gap-4 lg:grid-cols-6 lg:auto-rows-[minmax(180px,1fr)]`
Tablet (`md`): `grid-cols-2`, A spans 2, rest span 1, natural order.
Mobile: single column, A first.

**Tile content by size:**
- Tile A: screenshot bleeding to the tile edge (top 60%), then name in display type, tagline, status pill, 3 stack badges, "Open case study" button.
- Tiles B–F: small screenshot or poster as a 96 px right-aligned thumb, name, tagline, status pill.

**Stagger:** `style={`--i: ${index}`}` + `animation-delay: calc(var(--i) * 60ms)`. Wrapped in `@media (prefers-reduced-motion: no-preference)`.

### T-22: `DomainFilter.tsx` + `ProjectGrid.astro` — zero-lag filtering

**Critical:** all 37 cards are rendered server-side into static HTML. The island **does not own the cards**. It only toggles a class on a wrapper. This is why filtering is instant.

`ProjectGrid.astro`:
```astro
<div id="project-grid" data-active="all"
     class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {projects.map(p => (
    <article data-domain={p.data.domain} class="project-card">
      <ProjectCard project={p} />
    </article>
  ))}
</div>
```
CSS (in `global.css`, not inline):
```css
#project-grid[data-active]:not([data-active="all"]) .project-card { display: none; }
#project-grid[data-active="institutional"] .project-card[data-domain="institutional"],
#project-grid[data-active="sports"]        .project-card[data-domain="sports"],
#project-grid[data-active="edtech"]        .project-card[data-domain="edtech"],
#project-grid[data-active="offline-lan"]   .project-card[data-domain="offline-lan"],
#project-grid[data-active="platforms"]     .project-card[data-domain="platforms"] { display: block; }
```
`DomainFilter.tsx` (`client:idle`) only does:
```ts
document.getElementById('project-grid')!.dataset.active = key;
history.replaceState(null, '', key === 'all' ? location.pathname : `#${key}`);
```
Accessibility: `role="tablist"`, roving `tabindex`, `aria-selected`, Left/Right/Home/End key handling, and `aria-controls="project-grid"`. Announce results with a visually hidden `aria-live="polite"` region: `"11 projects in Institutional systems"`.

On mount, read `location.hash` and apply it so links like `/#offline-lan` deep-link into a filter.

### T-23: `ProjectCard.astro`
Structure (top → bottom): 16:10 image area (`overflow-hidden`, `rounded-t-[--radius-card]`) → name (h3) → tagline (2-line clamp) → footer row: `StatusPill` on the left, up to 3 `TechBadge`s on the right with a `+N` overflow chip.
Whole card is a button that opens the drawer: `<button type="button" data-project={slug} class="case-study-trigger">`. Hover: border color shifts `line → accent/40`, nothing else moves. No lift, no shadow bloom.

### T-24: `CaseStudyDrawer.tsx` (island, `client:idle`) — Vaul

- Desktop (`≥1024px`): `direction="right"`, width `min(560px, 92vw)`, full height.
- Mobile: `direction="bottom"`, `snapPoints={[0.6, 1]}`.
- Data source: the drawer receives the **entire projects array as a prop** serialized once (it's small — under 60 KB of JSON, and it is already in the HTML). Opening is then instant with no fetch.

Drawer content order:
1. Name (display type) + `StatusPill`.
2. Primary action: if `status === 'live'` → emerald button `Open live app`, opens in new tab with `rel="noopener"`. If `offline-lan` → indigo panel headed `Run it on your network`, containing the mono commands with a copy button per line, plus `run.url`.
3. `The problem` — `caseStudy.problem`.
4. `How it's built` — `caseStudy.architecture`, then the four stack groups as labelled badge rows (frontend / backend / data / infrastructure).
5. `What it does` — `caseStudy.features` as a plain list.
6. `Gallery` — the `Gallery.tsx` sub-island: horizontal scroll-snap strip, click to open a lightbox. Keyboard: arrows navigate, Esc closes.
7. Metrics line, only if present: `2,300 LOC · 58/58 tests passing · 302 athletes`.

A11y: `aria-labelledby` pointing at the title, focus trapped inside, focus returned to the triggering card on close, Esc closes, `body` scroll locked while open.

### T-25: `StatusPill.astro` / `TechBadge.astro`
- `StatusPill`: dot + label. `live` → emerald dot + "Live"; `offline-lan` → indigo dot + "Runs on LAN"; `internal` → neutral dot + "Internal tool"; `archived` → muted + "Archived". The dot is a `<span aria-hidden="true">` and the label is real text — never color alone.
- `TechBadge`: mono, `bg-surface-2`, `radius-pill`, `px-2 py-0.5`, `text-[13px]`. No icons, no logos (licensing + weight).

**Verify Phase 5:** keyboard-only pass — Tab through header → filter tabs (arrow keys work) → cards → open drawer with Enter → Tab cycles inside drawer → Esc closes → focus is back on the card you opened. Record it.

---

## 8. Phase 6 — Pages (T-26 … T-29)

### T-26: `src/pages/index.astro`
Order on the page:
1. **Hero**, short. A single display-type statement of what this body of work is, one sentence of context, and two live counters computed at build time (`37 systems`, `8 deployed`). No photo, no gradient, no "Hi, I'm…" pattern.
2. **Bento grid** (T-21) — this is the hero image, effectively.
3. **Domain filter + full 37-card grid** with `id="main"`.
4. **Footer**: contact, GitHub, "Built with Astro, deployed on Cloudflare Pages", last-updated date from `new Date()` at build time.

### T-27: `src/pages/projects/[slug].astro`
Even though the drawer is the primary UX, generate a static page per project. Reasons: SEO (37 indexable pages), shareable links, and a `noscript` fallback.
```astro
export async function getStaticPaths() {
  const projects = await getCollection('projects');
  return projects.map(p => ({ params: { slug: p.id }, props: { project: p } }));
}
```
Render the same case-study content as the drawer, in a single-column reading layout. Cards link here via `href={`/projects/${slug}`}` and the drawer intercepts the click with `preventDefault()` — so with JS disabled, every card still works as a normal link.

### T-28: `404.astro`
Not a joke page. One line explaining what happened, one link back to the project directory.

### T-29: `public/_headers` and `_redirects`
```
/assets/*
  Cache-Control: public, max-age=31536000, immutable
/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Content-Security-Policy: default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; frame-ancestors 'none'
```

---

## 9. Phase 7 — SEO, metadata, QA (T-30 … T-31)

### T-30: Metadata
- Per-page `<title>`, `<meta name="description">` from `tagline`.
- Canonical URL from `Astro.site`.
- Open Graph + Twitter card. Generate static OG images at build: `src/pages/og/[slug].png.ts` using `satori` + `@resvg/resvg-js` (add only if time allows; otherwise ship one well-made static `og-default.png`).
- `JSON-LD`: `Person` on `/`, `SoftwareApplication` on each project page.
- `@astrojs/sitemap` integration + `robots.txt`.

### T-31: QA gate — all must pass before deploy
```powershell
npx astro check                          # 0 errors
npm run build
npx serve dist -l 4321
npx lighthouse http://localhost:4321 --preset=desktop --view
npx lighthouse http://localhost:4321 --view   # mobile
```
Checklist:
- [ ] Lighthouse mobile ≥ 98 / 100 / 100 / 100
- [ ] JS transferred on `/` ≤ 45 KB gzip (check Network tab, filter JS)
- [ ] All 37 cards render; counts per tab match the computed counts
- [ ] Dark ⇄ light: no FOUC, no unreadable text, contrast ≥ 4.5:1 on body text and ≥ 3:1 on pill text (verify with DevTools)
- [ ] Every external link `target="_blank" rel="noopener noreferrer"`
- [ ] JS disabled: cards still navigate to `/projects/<slug>`
- [ ] 320 px viewport: no horizontal scroll
- [ ] `prefers-reduced-motion: reduce` kills the bento stagger
- [ ] `GAPS.md` reviewed and either filled or accepted

---

## 10. Phase 8 — Deployment (T-32 … T-34)

### T-32: Git + GitHub
```powershell
cd C:\dev\my-portfolio
git init
git add -A
git commit -m "T-32: portfolio initial build"
gh repo create my-portfolio --public --source=. --push
```
`.gitignore` must include: `node_modules/`, `dist/`, `.astro/`, `.env.local`, `*.log`, `.DS_Store`.
If captured screenshots exceed ~100 MB total, keep them out of git and generate them in CI instead — but the simpler path is aggressive optimization in T-18b so they fit comfortably.

### T-33: Cloudflare Pages
1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → select `my-portfolio`.
2. Build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `/`
3. Environment variables → Production: `NODE_VERSION = 22`
4. Save and Deploy. First build ≈ 90 s.
5. Update `site:` in `astro.config.mjs` to the real `*.pages.dev` URL, commit, push.

**Note:** `scripts/normalize-inventory.mjs` runs during `npm run build`, so `projects_inventory.json` **must be committed** to the repo. Confirm it is not gitignored.

### T-34: Custom domain
1. Pages project → Custom domains → Set up a domain.
2. If the domain is on Cloudflare DNS, the CNAME is created automatically.
3. If external: add `CNAME @ → <project>.pages.dev` (or the ALIAS/ANAME equivalent) at your registrar.
4. Wait for the certificate to issue (usually < 5 min), then re-run T-31's Lighthouse against the live domain.
5. Enable in Cloudflare: Auto Minify off (Astro already minifies), Brotli on, Early Hints on.

---

## 11. Sequencing and time estimate

| Phase | Tasks | Est. | Blocking? |
|---|---|---|---|
| 0 Environment | T-01…T-03 | 20 min | Yes — OneDrive fix first |
| 1 Scaffold | T-04…T-06 | 25 min | Yes |
| 2 Design system | T-07…T-09 | 45 min | Yes |
| 3 Data layer | T-10…T-13 | 2–3 h | Yes — everything downstream needs it |
| 4 Assets | T-14…T-18b | 3–5 h | Partially — ship after Tier C |
| 5 Components | T-19…T-25 | 4–6 h | Yes |
| 6 Pages | T-26…T-29 | 1.5 h | Yes |
| 7 QA/SEO | T-30…T-31 | 1.5 h | Yes |
| 8 Deploy | T-32…T-34 | 45 min | — |

**Ship-early path:** T-01 → T-13, then T-14 only, then T-19 → T-34. That gives a live site in roughly one working day. Backfill screenshots (T-15 → T-18) as a second pass and let Cloudflare redeploy on each push.

---

## 12. Known risks and their mitigations

| Risk | Mitigation |
|---|---|
| OneDrive file locks break `npm install` | T-01 Option A — build in `C:\dev` |
| `projects_inventory.json` field names differ from the schema | T-10 forces an inspection + `FIELD_MAP.md` before any normalizer code |
| Local Flask/Streamlit apps won't boot for screenshots | Hard 90-minute cap; anything failing falls to the Tier E designed poster |
| Vaul + Astro hydration mismatch | Drawer is `client:idle` and receives data as a serialized prop; it never renders during SSG |
| Bundle creep from React islands | Budget gate in T-31; if exceeded, convert `DomainFilter` to a 15-line vanilla `is:inline` script (it only sets one dataset attribute) |
| Screenshots of live apps expose real student data | Review every capture before committing. Use demo/empty states, or blur with sharp. **Check this explicitly** — several of these systems hold real records. |
| 37 hero images bloat the repo | T-18b AVIF pass; target < 80 KB per hero |

---

## 13. Content you still need to write (not the agent's job)

The agent can scaffold these, but the words should be yours. For each of the 37 projects:
- `tagline` — one line, ≤ 110 chars, says what the system does for whom. Not the tech stack.
- `caseStudy.problem` — 2–4 sentences on the operational situation that made you build it.
- `caseStudy.architecture` — why local-first or why cloud, in one paragraph.

Write the 6 flagship ones first. The remaining 31 can launch with a tagline plus a stub, and get filled in over time — `GAPS.md` tracks them.
