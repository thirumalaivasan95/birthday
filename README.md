# Forever You & Me — A Romantic Photo Album Site

A single-page, cinematic love story site built for one purpose: to surprise the woman you love. A 3-2-1 countdown opens onto fireworks under a real night sky, then a hand-written promise, then a multi-section album that randomises every visit so it never feels the same twice.

> Built for **Sriram & Meena**, with a little chapter for the little one on the way.

---

## What's inside

- **Birthday intro** — `3 → 2 → 1 → boom → promise`. Realistic canvas fireworks across a starry sky with a luminous moon. The promise must be opened by tap; never auto-dismisses.
- **Hero** — Ken-Burns parallax of a random photo, mouse-tracked title.
- **PhotoCloud3D** — iPhone-3D-Touch parallax cloud; cards tilt with the cursor.
- **MemoryCarousel** — Auto-playing slideshow with smooth blur transitions.
- **AllMemoriesSlideshow** — Every single photo of you two, fresh-shuffled per visit.
- **MosaicWall** — Hover-tilt mosaic with `grid-flow-dense` so there are no gaps.
- **PhotoMarquee** — Three rows of memories drifting in opposite directions.
- **PolaroidStack** — Tap-through deck of polaroids.
- **CinematicQuotes** — Full-bleed scroll-driven quote scenes.
- **ScanReveal** — A reverent moment for the ultrasound (`IMG_1887.jpg`).
- **Finale** — A poem and floating polaroids; works on mobile too.
- **SectionNav** — Right-side dot nav. Labels appear on hover and briefly on scroll, then auto-hide after 2 s.

---

## Requirements

| Tool | Version | Notes |
|---|---|---|
| **Node.js** | **18+ LTS recommended** (tested on 22) | https://nodejs.org/en/download |
| **npm** | comes with Node | `bun` works too — see notes |
| **OS** | Windows / macOS / Linux | sharp ships prebuilt binaries for all three |
| **RAM** | 1 GB free | image optimisation peaks ~500 MB |

> **Bun?** The repo also works with `bun install` + `bun run dev`. The npm scripts are the supported path because they're what Netlify runs.

---

## Install & run (3 steps)

```bash
# 1. Get the dependencies
npm install

# 2. (one-time, ~2 min) Build optimised webp variants of every photo
npm run optimize

# 3. Start the dev server
npm run dev      # opens http://localhost:5173
```

**That's it.** `npm run dev` automatically regenerates the photo manifest and the optimised images via the `predev` hook, so subsequent runs only do incremental work (cached).

> **Windows note:** if `npm install` succeeds but `npm run dev` errors with "Cannot find module @rollup/rollup-win32-x64-msvc", run `npm config delete os` (a stale Linux pin from WSL is the culprit), then delete `node_modules` and `package-lock.json` and `npm install` again.

---

## Adding more photos

The site auto-discovers any image in `public/images/` regardless of filename. To add new memories:

1. Drop the file(s) into [`public/images/`](public/images/). Any of `.jpg`, `.jpeg`, `.png`, `.webp`, `.heic`, `.avif`, `.gif`. Filename can be anything.
2. Restart `npm run dev` (or run `npm run preassets` manually).
3. Every section will pick them up — the random shuffle includes them automatically.

To give a specific photo a hand-written caption or a custom face-focus:

```js
// src/data/photos.js — add to the `curated` map:
'IMG_2024.jpg': {
  caption: 'The day everything changed',
  chapter: 'tender',
  focusY: 22,           // 0 = top of photo, 100 = bottom; default is 28
}
```

To mark a new ultrasound: add the filename to `SCAN_FILES` in [`src/data/photos.js`](src/data/photos.js).

---

## Build for production

```bash
npm run build           # outputs dist/
npm run preview         # serve dist/ locally to verify
```

---

## Deploy to Netlify

**Easiest — drag & drop**

```bash
npm run build
```
Then drop the `dist/` folder onto https://app.netlify.com/drop.

**Recommended — git-connected**

1. Push the repo to GitHub.
2. Netlify → *Add new site → Import an existing project → pick the repo*.
3. Netlify reads [`netlify.toml`](netlify.toml) automatically:
   - Build: `npm run build`
   - Publish dir: `dist`
   - SPA redirect already wired
4. First deploy takes ~2 min (image optimisation runs once and caches).

---

## npm scripts

| Script | What it does |
|---|---|
| `npm run dev` | Run manifest+optimize, then start Vite at `:5173` |
| `npm run build` | Same pre-step, then production build to `dist/` |
| `npm run preview` | Serve the built `dist/` for verification |
| `npm run manifest` | Re-scan `public/images/` and write `src/data/imageManifest.js` |
| `npm run optimize` | Generate `public/images-opt/<name>-{400,800,1600}.webp` (sharp) |
| `npm run preassets` | Both of the above. Runs automatically before dev/build. |

---

## Performance — slow networks (GPRS / 2G)

The site is graphically rich but engineered to load quickly on weak connections:

- **Responsive `srcset`** — every photo has 400 / 800 / 1600 px webp variants. Mobile devices fetch the small one (~10–30 KB instead of ~1 MB).
- **`IntersectionObserver` lazy load** — images only fetch when the user scrolls within ~600 px of them.
- **Code-split sections** — every section below the hero is a separate JS chunk; the browser only downloads what the user is actually about to see.
- **Skeleton placeholders** — every image slot shows a tasteful shimmer until its bytes arrive, so the layout never jumps.
- **Cached static assets** — Netlify serves `/images-opt/*` with year-long immutable cache headers (configured in `netlify.toml`).
- **Minimal blocking** — fonts are loaded with `display=swap`; the canvas fireworks respect `prefers-reduced-motion`.

On Chrome DevTools "Slow 3G" throttling: hero paints in <2 s, slideshow first frame in ~3–4 s. On true GPRS: the hero photo will take ~6–10 s but the page is interactive almost immediately and continues populating.

---

## Project structure

```
.
├── public/
│   ├── images/              ← drop your photos here (any name)
│   └── images-opt/          ← auto-generated webp variants (gitignored)
├── scripts/
│   ├── generate-photo-manifest.mjs
│   └── optimize-images.mjs
├── src/
│   ├── App.jsx              ← single-page composition + lazy sections
│   ├── main.jsx
│   ├── index.css
│   ├── components/
│   │   ├── BirthdayIntro.jsx     ← 3-2-1 → boom → promise overlay
│   │   ├── Fireworks.jsx         ← canvas-based with real physics
│   │   ├── NightSky.jsx          ← stars + realistic moon
│   │   ├── HeartsAndBirds.jsx
│   │   ├── HeartBackground.jsx
│   │   ├── LiquidBlob.jsx        ← morphing SVG blob
│   │   ├── SmartPhoto.jsx        ← no-crop image with blurred backdrop + srcset
│   │   ├── TiltCard.jsx          ← iPhone-3D-Touch hover parallax
│   │   ├── ScrollProgress.jsx
│   │   ├── SectionNav.jsx
│   │   └── Footer.jsx
│   ├── sections/
│   │   ├── Hero.jsx
│   │   ├── PhotoCloud3D.jsx
│   │   ├── MemoryCarousel.jsx
│   │   ├── AllMemoriesSlideshow.jsx
│   │   ├── MosaicWall.jsx
│   │   ├── PhotoMarquee.jsx
│   │   ├── PolaroidStack.jsx
│   │   ├── CinematicQuotes.jsx
│   │   ├── ScanReveal.jsx
│   │   └── Finale.jsx
│   ├── data/
│   │   ├── photos.js             ← curated captions + caption pool + scan list
│   │   └── imageManifest.js      ← AUTO-GENERATED, do not edit
│   └── utils/
│       └── shuffle.js
├── netlify.toml
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## Tech

- **React 18** + **Vite 5**
- **Tailwind CSS 3** with a custom rose / gold / ink palette
- **Framer Motion 11** — page transitions, parallax, layout, gestures
- **Canvas 2D** — realistic fireworks with rocket trails, gravity, multiple burst types
- **sharp** — build-time webp resizer (responsive `srcset`)
- **Google Fonts** — *Cormorant Garamond*, *Dancing Script*, *Inter*

---

Made with ♥ by your lovely husband ❣️ Sriram ❣️
