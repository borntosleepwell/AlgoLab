
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AnimatedAsciiCard } from '../ui/AnimatedAsciiCard';
import { AsciiEarthAnimation } from '../ui/AsciiEarthAnimation';

function FigmaLabCard({ title, desc, path, type }: { title: string; desc: string; path: string; type: 'ALGORITHMS' | 'AUTOMATA' | 'VISION' }) {
  const navigate = useNavigate();
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 30 },
        show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
      }}
      whileHover={{ boxShadow: "0px 0px 30px rgba(255, 255, 255, 0.15)", transition: { duration: 0.3 } }}
      onClick={() => navigate(path)}
      className="w-full max-w-[445px] h-auto min-h-[500px] md:h-[697px] bg-[#111111] border border-[#333333] rounded-[10px] flex flex-col cursor-pointer transition-all overflow-hidden"
    >
      <div className="flex-1 flex items-center justify-center p-4 md:p-6 min-h-[250px]">
        <AnimatedAsciiCard type={type} />
      </div>
      <div className="flex flex-col gap-[8px] items-center text-center pb-[22px] px-[27px]">
        <h3 className="font-serif text-[26.36px] text-white">
          {title}
        </h3>
        <p className="font-sans font-light text-[12px] text-[#aaaaaa] leading-relaxed">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}

// ── About Section ─────────────────────────────────────────────────────────────
export function AboutSection() {
  const navigate = useNavigate();
  return (
    <div className="relative w-full flex flex-col items-center overflow-hidden bg-black text-white">
      
      {/* 1. Dark separator area bridging from Hero (Swiss Modernism style) */}
      <div className="w-full pt-[80px] md:pt-[150px] pb-[150px] md:pb-[280px] px-4 md:px-8 border-b border-[#333333] flex flex-col items-center z-10 bg-[#050505]">
         <motion.div 
           initial={{ opacity: 0, y: 12 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.9 }}
           className="flex flex-col gap-6 items-center text-center max-w-[900px]"
         >
           <h2 className="font-sans font-bold text-4xl md:text-5xl uppercase tracking-tighter leading-[1.1] text-[#F2F2F2]">
             An all-in-one workspace designed for algorithmic reasoning
           </h2>
           <p className="font-serif text-xl text-[#aaaaaa] leading-relaxed max-w-[720px]">
             Choose AlgoLab for seamless manual graph building, instant AI-based visual interpretation, real-time traversal debugging, and a deeper understanding of computer science concepts.
           </p>
         </motion.div>
      </div>

      {/* 2. Interactive Animation Brutalist Box */}
      <div className="w-full bg-black flex flex-col items-center z-10 px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-[1200px] h-[400px] md:h-[500px] bg-[#0A0A0A] border border-[#333333] z-20 mt-[-50px] md:mt-[-150px] flex flex-col group transition-all hover:border-[#555555] hover:shadow-[12px_12px_0px_0px_rgba(51,51,51,1)]"
        >
           {/* Top Structural Bar */}
           <div className="w-full h-12 border-b border-[#333333] bg-[#050505] flex justify-center items-center z-10 shrink-0">
              <img src="/logo.svg" alt="Logo" className="w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
           </div>

           {/* Ascii Animation Area */}
           <div className="absolute inset-0 pt-12 overflow-hidden pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity duration-700 flex items-center justify-center">
             <AsciiEarthAnimation />
           </div>

           {/* Bottom Brutalist Block */}
           <div className="mt-auto w-full p-8 flex flex-col md:flex-row justify-between items-start md:items-end bg-[#050505]/95 backdrop-blur-sm border-t border-[#333333] z-10 gap-6">
             <div className="flex flex-col gap-4">
               <h3 className="font-sans font-bold text-3xl uppercase tracking-tighter text-[#F2F2F2] max-w-[500px] leading-[1.1]">
                 A Multi-Disciplinary Sandbox for Visual Computation
               </h3>
               <p className="font-serif text-sm text-[#aaaaaa] max-w-[500px] leading-relaxed">
                 Experience interactive tools designed to visually explain complex systems—from AI-analyzed graph traversals and formal grammar simplifications to matrix-based pixel convolutions.
               </p>
             </div>
             
             <button 
               onClick={() => navigate('/about')}
               className="shrink-0 font-mono text-xs font-bold uppercase tracking-widest text-[#050505] bg-[#F2F2F2] border border-[#F2F2F2] hover:bg-[#050505] hover:text-[#F2F2F2] transition-colors px-8 py-5 cursor-pointer"
             >
               LEARN MORE ↗
             </button>
           </div>
        </motion.div>
      </div>

      {/* 3. Lab Cards Area */}
      <div id="lab-section" className="relative w-full flex justify-center pt-[50px] md:pt-[100px] pb-[100px] md:pb-[150px] z-10 overflow-hidden bg-black">
         <motion.div 
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.15 } }
          }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="flex flex-col md:flex-row flex-wrap justify-center items-center gap-[24px] px-4 md:px-8 z-10 w-full"
        >
           <FigmaLabCard 
             title="ALGORITHMS LAB" 
             desc="An interactive playground for exploring graph traversal algorithms. Input adjacency lists manually or upload a hand-drawn graph image for real-time, step-by-step interpretation powered by Gemini Vision."
             path="/lab/graph"
             type="ALGORITHMS"
           />
           <FigmaLabCard 
             title="AUTOMATA LAB" 
             desc="Explore Chomsky's hierarchy by tracing Context-Free Grammar transformations step-by-step. See how recursive rules are simplified as the system visualizes the execution of Unit Production and Useless Symbol removal."
             path="/lab/automata"
             type="AUTOMATA"
           />
           <FigmaLabCard 
             title="VISION LAB" 
             desc="Demystify image processing by stepping into matrix convolution. Watch in real-time as mathematical kernels slide across pixel grids to perform edge detection and transform raw visual data."
             path="/lab/vision"
             type="VISION"
           />
        </motion.div>
      </div>

      {/* 4. Footer Area (Swiss Modernism style) */}
      <div className="relative w-full h-[60vh] bg-[#050505] flex items-center justify-center overflow-hidden z-0 border-t border-[#333333]">
        <motion.div 
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          viewport={{ once: true, margin: "100px" }}
          className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0 flex items-center justify-center opacity-40 mix-blend-screen"
        >
          <img src="/assets/figma_bg3.png" alt="" className="absolute inset-0 w-full h-full object-cover object-top" />
        </motion.div>
        
        <div className="relative z-10 flex flex-col items-center">
          <h2 className="font-sans font-bold text-3xl md:text-5xl text-center text-[#F2F2F2] border-4 border-[#F2F2F2] bg-[#050505] px-8 py-4 tracking-tighter uppercase mb-4 shadow-[8px_8px_0px_0px_rgba(242,242,242,1)]">
            EXPLORE YOUR CURIOSITY
          </h2>
          <div className="font-mono text-sm uppercase tracking-[0.5em] mt-8 text-[#aaaaaa]">
            AlgoLab est. 2026
          </div>
        </div>
      </div>

    </div>
  );
}
