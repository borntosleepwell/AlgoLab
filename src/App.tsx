import { useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/home/Hero';
import { AboutSection } from './components/home/AboutSection';
import { GraphLabPage } from './components/pages/GraphLabPage';
import { AutomataPage } from './components/pages/AutomataPage';
import { VisionPage } from './components/pages/VisionPage';
import { AboutPage } from './components/pages/AboutPage';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function HomePage() {
  const aboutRef = useRef<HTMLDivElement>(null);

  const handleScrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      <Navbar onScrollToAbout={handleScrollToAbout} />
      <div className="page-enter flex-1 flex flex-col">
        <Hero />
        <div ref={aboutRef} id="about-section">
          <AboutSection />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/lab/graph" element={<GraphLabPage />} />
        <Route path="/lab/automata" element={<AutomataPage />} />
        <Route path="/lab/vision" element={<VisionPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </>
  );
}

export default App;
