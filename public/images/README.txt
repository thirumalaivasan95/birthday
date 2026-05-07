Drop your photos in this folder.

Reference them in the code as "/images/your-file.jpg".

Where to plug them in:
  - src/data/timeline.js          → set `image` for each chapter
  - src/pages/Gallery.jsx          → set `src` for each photo in the `photos` array
  - src/pages/Home.jsx             → swap any <ImagePlaceholder hint=... /> for <ImagePlaceholder src="/images/foo.jpg" />
  - src/pages/BabyAnnouncement.jsx → swap the ultrasound placeholder for a real image

Recommended:
  - JPG/WebP, ~1600–2400px on the long edge
  - keep file names lowercase, no spaces (use hyphens)
