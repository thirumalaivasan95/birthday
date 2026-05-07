import { lazy, Suspense, useState } from 'react'
import HeartBackground from './components/HeartBackground.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import SectionNav from './components/SectionNav.jsx'
import BirthdayIntro from './components/BirthdayIntro.jsx'
import Footer from './components/Footer.jsx'
import Hero from './sections/Hero.jsx'

// Code-split below-the-fold sections so the first paint ships only the
// hero + intro chunks. Each section becomes its own JS file the browser
// fetches when it scrolls toward it — far gentler on slow networks.
const PhotoCloud3D         = lazy(() => import('./sections/PhotoCloud3D.jsx'))
const MemoryCarousel       = lazy(() => import('./sections/MemoryCarousel.jsx'))
const AllMemoriesSlideshow = lazy(() => import('./sections/AllMemoriesSlideshow.jsx'))
const MosaicWall           = lazy(() => import('./sections/MosaicWall.jsx'))
const PhotoMarquee         = lazy(() => import('./sections/PhotoMarquee.jsx'))
const PolaroidStack        = lazy(() => import('./sections/PolaroidStack.jsx'))
const CinematicQuotes      = lazy(() => import('./sections/CinematicQuotes.jsx'))
const ScanReveal           = lazy(() => import('./sections/ScanReveal.jsx'))
const Finale               = lazy(() => import('./sections/Finale.jsx'))

function SectionFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-1 w-32 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-1/3 animate-pulse bg-gradient-to-r from-rose-500 to-gold-400" />
      </div>
    </div>
  )
}

export default function App() {
  const [introDone, setIntroDone] = useState(false)

  return (
    <div className="relative min-h-screen overflow-hidden bg-romance-gradient">
      {!introDone && <BirthdayIntro onFinish={() => setIntroDone(true)} />}

      <ScrollProgress />
      <HeartBackground />
      <SectionNav />

      <main className="relative z-10">
        <Hero />
        <Suspense fallback={<SectionFallback />}>
          <PhotoCloud3D />
          <MemoryCarousel />
          <AllMemoriesSlideshow />
          <MosaicWall />
          <PhotoMarquee />
          <PolaroidStack />
          <CinematicQuotes />
          <ScanReveal />
          <Finale />
        </Suspense>
      </main>

      <Footer />
    </div>
  )
}
