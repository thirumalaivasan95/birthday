// Build-time image optimizer.
//
// Reads /public/images/*.jpg|jpeg|png and writes resized .webp variants
// to /public/images-opt/<name>-<width>.webp at 400 / 800 / 1600 widths.
// The site uses these via <img srcset> so mobile devices fetch the smaller
// (often 5-15× lighter) variant.
//
// `sharp` is OPTIONAL — if it's not installed, this script logs a warning
// and exits cleanly so dev/build still work. Install with:
//   npm install --save-dev sharp
//
// Idempotent: only generates files that don't already exist + are newer
// than their source. Safe to run on every dev/build.

import { readdirSync, statSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join, parse, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..')
const srcDir = join(root, 'public', 'images')
const outDir = join(root, 'public', 'images-opt')

const SIZES = [400, 800, 1600]
const SOURCE_EXTS = new Set(['.jpg', '.jpeg', '.png'])
const QUALITY = 72

let sharp
try {
  sharp = (await import('sharp')).default
} catch (err) {
  console.warn(
    '[optimize-images] sharp is not installed — skipping image optimisation.',
  )
  console.warn(
    '                  Install with `npm install --save-dev sharp` to enable',
  )
  console.warn(
    '                  responsive webp variants (much faster on mobile / GPRS).',
  )
  process.exit(0)
}

if (!existsSync(srcDir)) {
  console.warn(`[optimize-images] ${srcDir} not found — nothing to do`)
  process.exit(0)
}
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true })

const files = readdirSync(srcDir).filter((f) =>
  SOURCE_EXTS.has(parse(f).ext.toLowerCase()),
)

let generated = 0
let skipped = 0
const t0 = Date.now()

for (const file of files) {
  const { name } = parse(file)
  const srcPath = join(srcDir, file)
  const srcMtime = statSync(srcPath).mtimeMs

  for (const width of SIZES) {
    const outPath = join(outDir, `${name}-${width}.webp`)
    if (existsSync(outPath) && statSync(outPath).mtimeMs > srcMtime) {
      skipped++
      continue
    }
    try {
      await sharp(srcPath)
        .rotate() // honour EXIF orientation
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: QUALITY, effort: 4 })
        .toFile(outPath)
      generated++
    } catch (e) {
      console.warn(`[optimize-images] failed ${file} @ ${width}px:`, e.message)
    }
  }
}

const dt = ((Date.now() - t0) / 1000).toFixed(1)
console.log(
  `[optimize-images] ${generated} written, ${skipped} cached, ${files.length} sources (${dt}s)`,
)
