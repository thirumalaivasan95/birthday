# Forever You & Me 💖

A single-page, cinematic love story for the woman you love.
Counts down `3 → 2 → 1 → 🎆`, opens with a hand-written promise, then plays through a multi-chapter photo album that **shuffles fresh every single visit** — so it never feels the same twice.

> Built for **Sriram & Meena**, with a little chapter for the little one on the way.

---

## ⚡ TL;DR — the 30-second version

```bash
npm install
npm run dev          # → http://localhost:5173
```

…and you're looking at a working dev preview of the whole site.
To deploy, push to GitHub and connect the repo to Netlify — that's it.

---

## 📖 Table of contents

1. [What you're looking at](#-what-youre-looking-at)
2. [Requirements](#-requirements)
3. [Run it locally](#-run-it-locally-in-3-commands)
4. [Add your own photos](#-add-your-own-photos)
5. [Build & deploy](#-build--deploy)
6. [Every npm script, explained](#-every-npm-script-explained)
7. [How the speed magic works](#-how-the-speed-magic-works)
8. [Low-power mode (old phones / 2G)](#-low-power-mode-old-phones--2g)
9. [The folder map](#-the-folder-map)
10. [Tech stack](#-tech-stack)
11. [Troubleshooting](#-troubleshooting)

---

## 🎬 What you're looking at

Each "section" is its own chapter of the love story. They appear in this order as you scroll:

| # | Section | What it does |
|---|---|---|
| 0 | **BirthdayIntro** | Full-screen overlay on first load: `3 → 2 → 1 → 🎆 Happy Birthday`, then 5 hand-written promise messages. Closes only when she taps **Open your gift**. |
| 1 | **Hero** | Ken-Burns parallax of a random photo + the "Forever You & Me" title that tracks the cursor. |
| 2 | **PhotoCloud3D** | Scattered "sticky-note pile" of photos in a jittered grid. **Drag any card** in any direction → it flies away → a fresh memory takes its place. |
| 3 | **MemoryCarousel** | Auto-playing slideshow with smooth blur cross-fades. |
| 4 | **AllMemoriesSlideshow** | Every photo of you two, shuffled fresh, playing one by one. White doves drift across the sky in the background. |
| 5 | **MosaicWall** | Hover-tilt mosaic — `grid-flow-dense` so there are zero gaps. |
| 6 | **PhotoMarquee** | Three rows of memories drifting in opposite directions. |
| 7 | **PolaroidStack** | Tap-through deck of polaroids. |
| 8 | **CinematicQuotes** | Full-bleed scroll-driven quote scenes. |
| 9 | **ScanReveal** | A reverent moment for the ultrasound (`IMG_1887.jpg`). |
| 10 | **Finale** | A poem and floating polaroids; works on mobile too. |

Plus, always visible:

- **HeartBackground** — fixed layer of floating hearts and twinkling particles behind everything.
- **SectionNav** — right-side dot nav; labels appear on hover and briefly on scroll, then auto-hide after 2 s.
- **ScrollProgress** — thin gradient bar at the top.

---

## 🛠 Requirements

| Tool | Version | Where to get it |
|---|---|---|
| **Node.js** | 18 LTS or newer (tested on 22) | <https://nodejs.org/en/download> |
| **npm** | bundled with Node | — |
| **OS** | Windows, macOS, or Linux | All work; `sharp` ships prebuilt binaries for each |
| **Free RAM** | ~1 GB | Image optimisation briefly peaks around 500 MB |

> 💡 **Prefer Bun?** `bun install` + `bun run dev` works perfectly. The npm scripts are the *supported* path because that's what Netlify runs in production.

---

## 🚀 Run it locally (in 3 commands)

```bash
# 1) Install everything
npm install

# 2) (One-time, ~2 min) Build smaller webp copies of every photo
npm run optimize

# 3) Start the dev server with hot reload
npm run dev
# → opens http://localhost:5173
```

Step 2 is one-time only — every subsequent `npm run dev` re-uses the cache and finishes in seconds.

---

## 📷 Add your own photos

The site **auto-discovers** any image in `public/images/`. You don't have to register filenames anywhere.

### Just dropping in new pictures

1. Copy your photos into `public/images/`. Accepted: `.jpg`, `.jpeg`, `.png`, `.webp`, `.heic`, `.avif`, `.gif`. Filename can be anything.
2. Restart `npm run dev` (or run `npm run preassets` manually).
3. Every section picks them up automatically — they enter the random shuffle.

### Giving a specific photo a hand-written caption

Open `src/data/photos.js` and add an entry to the `curated` map:

```js
'IMG_2024.jpg': {
  caption: 'The day everything changed',
  chapter: 'tender',     // vows | tender | everyday | adventures | celebrations | little-one
  focusY: 22,            // where to anchor the face: 0 = top, 100 = bottom (default 28)
}
```

Anything *not* in `curated` gets a random caption from `captionPool` (also in `photos.js`) — but the choice is **stable**: the same filename always gets the same caption, because we hash it. Feels intentional, not random.

### Marking a new ultrasound

Add the filename to `SCAN_FILES` in `src/data/photos.js`. It will be excluded from the random slideshow and reserved for the dedicated `ScanReveal` section.

---

## 📦 Build & deploy

### Local build

```bash
npm run build      # outputs everything to dist/
npm run preview    # serve dist/ locally to verify before shipping
```

### Deploy to Netlify (recommended path)

The easy way — **drag & drop**:

```bash
npm run build
```

Then drop the `dist/` folder onto <https://app.netlify.com/drop>. Done.

The robust way — **git-connected**:

1. Push the repo to GitHub.
2. On Netlify → *Add new site → Import an existing project → pick the repo*.
3. Netlify reads `netlify.toml` automatically. You don't need to configure anything:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - SPA redirect: pre-wired
   - Cache headers for `/images-opt/*`: pre-wired (1 year, immutable)
4. First deploy takes ~2 min (image optimisation runs once and caches).
5. Every future `git push` re-deploys automatically.

---

## 🧰 Every npm script, explained

| Script | Run when… | What it actually does |
|---|---|---|
| `npm run dev` | You're developing | Re-syncs the photo manifest + optimised images, then starts Vite at `:5173` with hot reload |
| `npm run build` | You want a production bundle | Same pre-step, then writes the optimised production site to `dist/` |
| `npm run preview` | You want to test the production build locally | Serves `dist/` on `:4173` |
| `npm run manifest` | You added/removed a photo manually | Re-scans `public/images/` and rewrites `src/data/imageManifest.js` |
| `npm run optimize` | You added new photos | Runs sharp to generate `public/images-opt/<name>-{400,800,1600}.webp` for responsive `srcset` |
| `npm run preassets` | Manual force-refresh | Runs `optimize` + `manifest` together. Runs **automatically** before `dev` and `build`, so you rarely call it directly. |

---

## ⚡ How the speed magic works

The site is graphically rich but engineered to feel instant on weak connections:

- **Responsive `srcset`** — every photo gets 400 / 800 / 1600 px WebP copies. A phone fetches a ~20 KB version instead of the ~1 MB original.
- **Lazy loading via `IntersectionObserver`** — images don't even start downloading until the user scrolls within ~600 px of them.
- **Code-split sections** — every chapter below the hero is a separate JS chunk. The browser only downloads chapter 5's JS when you're nearly there.
- **Skeleton placeholders** — every image slot shows a tasteful shimmer until its bytes arrive. The layout never jumps.
- **Aggressive HTTP caching** — Netlify serves `/images-opt/*` with `Cache-Control: max-age=31536000, immutable` (configured in `netlify.toml`). Repeat visits feel instant.
- **`display=swap` fonts** — Google Fonts never block first paint.

**Real-world numbers** (Chrome DevTools throttling):

| Network profile | First hero paint | Slideshow first frame |
|---|---|---|
| Fast 4G | ~0.3 s | ~0.6 s |
| Slow 3G | <2 s | ~3–4 s |
| GPRS | ~6–10 s | continues populating gracefully |

---

## 🪫 Low-power mode (old phones / 2G)

The site auto-detects weak devices and **silently downgrades** the heaviest decorations so the page stops hanging on a 2008-class phone or a GPRS connection.

### What triggers it

In `src/utils/device.js` — any **one** of these turns on `isLowPower`:

- Old iOS Safari (e.g. iPhone SE on Safari)
- `navigator.hardwareConcurrency ≤ 2` (≤ 2 CPU cores)
- `navigator.deviceMemory ≤ 2` (≤ 2 GB RAM)
- `navigator.connection.effectiveType` is `2g` or `slow-2g`
- The browser has `Save-Data: on`

### What gets disabled when it triggers

| Layer | Normal device | Low-power |
|---|---|---|
| `LiquidBlob` morphing gradients | Animated SVG with 50 px CSS blur | **Removed entirely** |
| `HeartBackground` particles & hearts | 36 particles + 18 hearts animating forever | **Static gradient only**, no motion |
| `BirthdayIntro` fireworks canvas | Full physics canvas (RAF + 100s of particles) | **Skipped** — CSS radial bloom replaces it |
| Doves & butterflies overlay | 4 doves + 5 butterflies + 14 hearts + 18 sparkles | Hearts 4, sparkles 5, **no doves, no butterflies** |
| Photo collage cursor parallax | `useSpring` per card | Disabled |
| `SmartPhoto` blurred letterbox | Duplicate decoded image at 28 px blur | Flat warm gradient |
| Image counts on the night sky | 140 stars, shooting stars, 11 clouds | 40 stars, no shooting stars, 4 clouds |

Net effect: **~80–90% fewer continuously-animated nodes**, **zero CSS blur passes per frame**, **no `requestAnimationFrame` canvas loops**.

The story still reads beautifully — just calmer.

---

## 🗂 The folder map

```
.
├── public/
│   ├── images/              ← 📥 drop your photos here (any filename)
│   └── images-opt/          ← 🤖 auto-generated webp variants (gitignored)
├── scripts/
│   ├── generate-photo-manifest.mjs   ← rewrites src/data/imageManifest.js
│   └── optimize-images.mjs           ← sharp resizer → 400 / 800 / 1600 webp
├── src/
│   ├── App.jsx                 ← single-page composition; lazy-loads chapters
│   ├── main.jsx                ← React mount point
│   ├── index.css               ← Tailwind layer + custom utility classes
│   │
│   ├── components/             ← reusable building blocks
│   │   ├── BirthdayIntro.jsx        countdown → boom → promise overlay
│   │   ├── Fireworks.jsx            canvas-based real-physics fireworks
│   │   ├── NightSky.jsx             stars + clouds + the moon
│   │   ├── HeartsAndBirds.jsx       hearts, sparkles, butterflies, white doves
│   │   ├── HeartBackground.jsx      fixed-position floating hearts layer
│   │   ├── LiquidBlob.jsx           morphing gradient SVG blob
│   │   ├── SmartPhoto.jsx           lazy-load image with blurred letterbox + srcset
│   │   ├── TiltCard.jsx             iPhone-style 3D-Touch hover parallax
│   │   ├── ScrollProgress.jsx       gradient bar at the top of the page
│   │   ├── SectionNav.jsx           right-side dot navigation
│   │   └── Footer.jsx
│   │
│   ├── sections/              ← the 10 chapters of the love story
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
│   │
│   ├── data/
│   │   ├── photos.js                ✏️ curated captions + caption pool + scan list
│   │   └── imageManifest.js         🤖 AUTO-GENERATED — do not edit by hand
│   │
│   └── utils/
│       ├── shuffle.js               deterministic-on-first-load randomness
│       └── device.js                isMobile / isTouch / isLowPower flags
│
├── netlify.toml             ← build + cache headers + SPA redirect
├── tailwind.config.js       ← custom rose / gold / ink palette
├── vite.config.js
└── package.json
```

---

## 🧪 Tech stack

- **React 18** + **Vite 5** — fast dev server, code splitting, instant HMR.
- **Tailwind CSS 3** — utility-first styling with a custom rose / gold / ink palette.
- **Framer Motion 11** — page transitions, parallax, drag gestures, layout animations.
- **Canvas 2D** — physics-based fireworks (rocket trails, gravity, multi-burst).
- **sharp** — build-time WebP resizer for responsive `srcset`.
- **Google Fonts** — *Cormorant Garamond*, *Dancing Script*, *Inter*, *Noto Serif Tamil*.

---

## 🆘 Troubleshooting

### `npm install` finished but `npm run dev` errors with "Cannot find module @rollup/rollup-win32-x64-msvc"

A stale `os: linux` pin from WSL is the culprit. Fix it once:

```bash
npm config delete os
rm -rf node_modules package-lock.json     # or `del` on Windows PowerShell
npm install
```

### Photos aren't showing up after I dropped them in `public/images/`

The dev server reads a generated manifest, not the folder directly. Fix it:

```bash
npm run preassets       # regenerates manifest + optimised webp
```

…or just restart `npm run dev` (the `predev` hook runs `preassets` for you).

### The intro plays every time I refresh — can I skip it?

Yep, there's an emergency **Skip ✕** button in the top-right corner of the intro overlay (`src/components/BirthdayIntro.jsx`). Tap it to dismiss instantly.

### The site feels sluggish on my old phone

That's exactly what `low-power` mode is for — see the section above. If your phone *isn't* triggering it but should, you can tighten the rules in `src/utils/device.js`.

### Captions look wrong on certain photos (face cropped weird)

The face anchor is wrong. In `src/data/photos.js`, add a `focusY` for that filename — `0` is the very top of the photo, `100` is the very bottom. `28` is a good default for upper-body selfies; `45–55` works for full-body shots; `15–22` for tight headshots.

---

Made with ♥ by your lovely husband ❣️ **Sriram** ❣️
