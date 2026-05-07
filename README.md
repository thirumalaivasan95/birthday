# Forever You & Me — A Romantic Photo Album Site

A stunning, animated, multi-page love story site built with **React + Vite + Bun**, **Tailwind CSS**, **Framer Motion**, and **React Router**. Designed for one purpose: to make her smile.

## Pages

- **Home** — animated hero, photo cluster, parallax scroll, teaser cards
- **Our Story** — alternating timeline of every chapter of you two
- **Gallery** — filterable masonry grid with a lightbox viewer
- **Letters** — readable love letters that open in a beautiful modal
- **Little One** — the baby announcement page with milestones & wishes

Plus: floating hearts background, twinkling particles, page transitions, custom serif + script typography, fully responsive (mobile → 4K), and reduced-motion friendly.

## Run it locally

```bash
bun install
bun run dev
```

Open http://localhost:5173.

## Build for production

```bash
bun run build
```

Output goes to `dist/`.

## Deploy to Netlify (the easy way)

**Option A — Drag & drop**

1. Run `bun run build`.
2. Go to https://app.netlify.com/drop and drag the `dist/` folder onto the page. Done.

**Option B — Connect a git repo (recommended)**

1. Push this folder to GitHub.
2. In Netlify: *Add new site → Import an existing project → pick the repo*.
3. Netlify auto-detects `netlify.toml` — build command `bun run build`, publish dir `dist`. Click deploy.

`netlify.toml` already includes the SPA fallback so direct links to `/our-story`, `/gallery`, etc. work after refresh.

## Adding your photos

1. Drop image files into `public/images/` (use hyphens, no spaces — e.g. `first-date.jpg`).
2. Reference them by path: `/images/first-date.jpg`.
3. Update these files with the real paths:

| Page | File | What to edit |
| ---- | ---- | ------------ |
| Our Story timeline | `src/data/timeline.js` | set `image` for each chapter |
| Gallery grid | `src/pages/Gallery.jsx` | set `src` in the `photos` array |
| Home hero cluster | `src/pages/Home.jsx` | replace the three `<ImagePlaceholder>` tags |
| Baby page | `src/pages/BabyAnnouncement.jsx` | the ultrasound placeholder |

Until you add photos, every spot shows an elegant animated placeholder so the site still looks beautiful.

## Personalising the words

- **Names / dates / story beats** → `src/data/timeline.js`
- **Love letters** → `letters` array in `src/pages/Letters.jsx`
- **Baby milestones & wishes** → `milestones` and `wishes` arrays in `src/pages/BabyAnnouncement.jsx`
- **Hero headline & quote** → `src/pages/Home.jsx`

## Tech

- React 18 + Vite 5
- Bun as the runtime / package manager
- Tailwind CSS 3 (custom rose / gold / ink palette)
- Framer Motion 11 (page transitions, stagger, parallax, layout animations)
- React Router 6
- Google Fonts: *Cormorant Garamond*, *Dancing Script*, *Inter*

Made with ♥ by your lovely husband ❣️sriram ❣️
