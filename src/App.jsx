import { useState } from 'react'
import HeartBackground from './components/HeartBackground.jsx'
import ScrollProgress from './components/ScrollProgress.jsx'
import SectionNav from './components/SectionNav.jsx'
import BirthdayIntro from './components/BirthdayIntro.jsx'
import Footer from './components/Footer.jsx'
import Hero from './sections/Hero.jsx'
import PhotoCloud3D from './sections/PhotoCloud3D.jsx'
import MemoryCarousel from './sections/MemoryCarousel.jsx'
import AllMemoriesSlideshow from './sections/AllMemoriesSlideshow.jsx'
import MosaicWall from './sections/MosaicWall.jsx'
import PhotoMarquee from './sections/PhotoMarquee.jsx'
import PolaroidStack from './sections/PolaroidStack.jsx'
import CinematicQuotes from './sections/CinematicQuotes.jsx'
import ScanReveal from './sections/ScanReveal.jsx'
import Finale from './sections/Finale.jsx'

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
        <PhotoCloud3D />
        <MemoryCarousel />
        <AllMemoriesSlideshow />
        <MosaicWall />
        <PhotoMarquee />
        <PolaroidStack />
        <CinematicQuotes />
        <ScanReveal />
        <Finale />
      </main>

      <Footer />
    </div>
  )
}
