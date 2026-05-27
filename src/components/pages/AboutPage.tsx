import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const LinkedinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export function AboutPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-[#F2F2F2] font-sans selection:bg-[#F2F2F2] selection:text-[#050505]" style={{ backgroundColor: '#050505', color: '#F2F2F2' }}>

      {/* Brutalist Top Navbar */}
      <header className="w-full border-b border-[#333333] px-8 py-6 flex justify-between items-center sticky top-0 z-50 bg-[#050505]">
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate('/')}
            className="font-mono text-sm font-bold uppercase tracking-widest hover:text-[#aaaaaa] transition-colors flex items-center gap-2"
          >
            <span className="text-lg leading-none">←</span> BACK
          </button>
        </div>
        <div className="font-serif text-3xl italic pr-2 flex items-center gap-3">
          <img src="/logo.svg" alt="AlgoLab Logo" className="w-8 h-8" />
          AlgoLab
        </div>
      </header>

      {/* Massive Hero Section */}
      <main className="w-full">

        {/* Huge Typography Hero with Massive White Space */}
        <section className="w-full pt-[15vh] pb-[10vh] px-8 border-b border-[#333333]">
          <div className="max-w-[1800px] mx-auto">
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-[12vw] leading-[0.8] font-bold tracking-tighter text-[#F2F2F2] uppercase m-0 p-0"
            >
              DEMYSTIFYING
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="text-[12vw] leading-[0.8] font-bold tracking-tighter text-[#F2F2F2] uppercase m-0 p-0 md:ml-[10vw]"
            >
              THE ABSTRACT.
            </motion.h1>
          </div>
        </section>

        {/* Info Grid with Negative Space */}
        <section className="w-full border-b border-[#333333]">
          <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-12 min-h-[40vh]">

            {/* Tech Engine Meta Data */}
            <div className="col-span-12 md:col-span-3 p-8 border-b md:border-b-0 md:border-r border-[#333333] flex flex-col justify-between">
              <div className="flex flex-col gap-12">
                <div>
                  <h3 className="font-mono text-xs uppercase font-bold tracking-[0.2em] mb-4 text-[#F2F2F2]">The Approach</h3>
                  <p className="font-sans text-xl leading-snug">Visual Learning First</p>
                </div>
                <div>
                  <p className="font-mono text-sm leading-relaxed text-[#aaaaaa] text-justify">
                    I didn't want to build just another tool that generates boring, static diagrams. By integrating Gemini Vision AI, AlgoLab can actually look at your messy, hand-drawn graphs from your notebook and instantly translate them into interactive, stepping-stone logic.
                  </p>
                </div>
              </div>
            </div>

            {/* Photo Section */}
            <div className="col-span-12 md:col-span-3 border-b md:border-b-0 md:border-r border-[#333333] relative min-h-[300px] overflow-hidden group bg-[#111111] flex items-center justify-center">
              {/* Overlay for Swiss Brutalism effect (grayscale by default, color on hover) */}
              <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none"></div>

              {/* 
                TODO: Replace '/assets/profile.jpg' with your actual photo path!
                Drop your photo in the public/assets/ folder and rename it.
              */}
              <img
                src="/assets/founder.png"
                alt="Creator Profile"
                className="absolute inset-0 w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700"
              />
            </div>

            {/* Main Core Mission Statement */}
            <div className="col-span-12 md:col-span-6 p-8 md:p-16 flex items-center">
              <div className="flex flex-col gap-8 max-w-[800px]">
                <p className="font-serif text-3xl md:text-4xl leading-[1.3] text-[#F2F2F2] text-justify">
                  As an informatics engineering student, I constantly struggled to visualize how algorithms actually worked behind the scenes. <strong className="font-sans font-bold">AlgoLab was born out of that exact frustration.</strong>
                </p>
                <p className="font-sans text-xl leading-[1.6] text-[#aaaaaa] text-justify">
                  Staring at raw code made it incredibly difficult to grasp traversals like DFS and BFS, or to wrap my head around the abstract rules of formal grammars. I built this interactive laboratory to help fellow students who face the same struggles—and honestly, to give myself a tool I could rely on whenever I hit a wall with a complex data structure.
                </p>
                <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between border-t border-[#333333] pt-8">
                  <p className="font-mono text-sm uppercase tracking-widest text-[#A62533]">
                    // Built by a student, for students.
                  </p>
                  <div className="flex gap-4">
                    <a href="https://www.linkedin.com/in/aqshanayaka/" target="_blank" rel="noopener noreferrer" className="text-[#050505] bg-[#F2F2F2] border border-[#F2F2F2] hover:bg-[#050505] hover:text-[#F2F2F2] transition-colors p-3 flex items-center justify-center" aria-label="LinkedIn">
                      <LinkedinIcon />
                    </a>
                    <a href="https://www.instagram.com/aqsha.n/" target="_blank" rel="noopener noreferrer" className="text-[#F2F2F2] border border-[#333333] hover:border-[#F2F2F2] transition-colors p-3 flex items-center justify-center" aria-label="Instagram">
                      <InstagramIcon />
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Core Modules Grid */}
        <section className="w-full">
          <div className="max-w-[1800px] mx-auto grid grid-cols-1 md:grid-cols-3">

            {/* Module 1 */}
            <div className="p-12 md:p-16 border-b md:border-b-0 md:border-r border-[#333333] aspect-square flex flex-col justify-between hover:bg-[#F2F2F2] hover:text-[#050505] transition-colors group cursor-crosshair">
              <div className="font-mono text-6xl md:text-8xl font-light tracking-tighter opacity-20 group-hover:opacity-100 text-[#A62533] transition-all">01</div>
              <div>
                <h2 className="font-sans text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">Graph Intelligence</h2>
                <p className="font-serif text-lg md:text-xl opacity-80 group-hover:opacity-100 leading-snug">
                  More than just drawing nodes and edges. Upload a sketch of your hand-drawn graph, and let our AI read, translate, and execute space-search algorithms (Dijkstra, A*, BFS, DFS) right before your eyes.
                </p>
              </div>
            </div>

            {/* Module 2 */}
            <div className="p-12 md:p-16 border-b md:border-b-0 md:border-r border-[#333333] aspect-square flex flex-col justify-between hover:bg-[#F2F2F2] hover:text-[#050505] transition-colors group cursor-crosshair">
              <div className="font-mono text-6xl md:text-8xl font-light tracking-tighter opacity-20 group-hover:opacity-100 text-[#A62533] transition-all">02</div>
              <div>
                <h2 className="font-sans text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">Formal Automata</h2>
                <p className="font-serif text-lg md:text-xl opacity-80 group-hover:opacity-100 leading-snug">
                  Simplifying the complex. Watch as the machine parses Context-Free Grammars (CFG), eliminates useless symbols, and restructures computational language logic step-by-step without a black box.
                </p>
              </div>
            </div>

            {/* Module 3 */}
            <div className="p-12 md:p-16 aspect-square flex flex-col justify-between hover:bg-[#F2F2F2] hover:text-[#050505] transition-colors group cursor-crosshair">
              <div className="font-mono text-6xl md:text-8xl font-light tracking-tighter opacity-20 group-hover:opacity-100 text-[#A62533] transition-all">03</div>
              <div>
                <h2 className="font-sans text-3xl md:text-4xl font-bold uppercase tracking-tight mb-4">Vision Convolutions</h2>
                <p className="font-serif text-lg md:text-xl opacity-90 group-hover:opacity-80 leading-snug">
                  Dissecting what the machine sees. Understand how a kernel matrix slides across thousands of pixels to detect edges, sharpen images, and extract visual data mathematically.
                </p>
              </div>
            </div>

          </div>
        </section>

        {/* Footer Area with empty space */}
        <section className="w-full border-t border-[#333333] h-[30vh] flex items-center justify-center bg-[#050505] text-[#F2F2F2]">
          <div className="font-mono text-sm uppercase tracking-[0.5em] opacity-70">
            AlgoLab est. 2026
          </div>
        </section>

      </main>
    </div>
  );
}
