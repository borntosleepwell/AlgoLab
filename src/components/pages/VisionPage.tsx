import { Navbar } from '../layout/Navbar';
import { motion } from 'framer-motion';

export function VisionPage() {
  return (
    <div className="min-h-screen bg-[#050505] flex flex-col selection:bg-[#F2F2F2] selection:text-[#050505] text-[#F2F2F2]">
      <Navbar />
      <div className="page-enter flex-1 flex flex-col justify-center items-center px-4 md:px-8 py-12 relative overflow-hidden">

        {/* Architectural Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
          <div className="w-full h-full grid grid-cols-4 md:grid-cols-12 border-x border-[#333333]">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="border-r border-[#333333] h-full hidden md:block" />
            ))}
          </div>
          <div className="absolute inset-0 grid grid-rows-12">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="border-b border-[#333333] w-full" />
            ))}
          </div>
        </div>

        {/* Brutalist Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex flex-col items-center text-center border-4 border-[#F2F2F2] p-8 md:p-24 bg-[#050505] shadow-[16px_16px_0px_0px_rgba(242,242,242,1)] max-w-4xl w-full"
        >
          {/* Top structural info */}
          <div className="w-full flex justify-center items-center border-b border-[#333333] pb-4 mb-8 md:mb-12">
            <img src="/logo.svg" alt="AlgoLab Logo" className="h-8 md:h-10 opacity-80 hover:opacity-100 transition-opacity" />
          </div>

          {/* Massive Typography */}
          <h1 className="font-sans font-black text-6xl md:text-8xl lg:text-[140px] uppercase tracking-tighter leading-[0.85] text-[#F2F2F2] w-full text-left md:text-center break-words">
            COMING<br />
            SOON
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              className="text-[#F2F2F2]"
            >_</motion.span>
          </h1>

          {/* Subtext */}
          <div className="w-full border-t border-[#333333] mt-12 pt-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <p className="font-serif text-sm md:text-lg text-[#aaaaaa] max-w-lg text-left leading-relaxed">
              The matrix convolution and pixel manipulation sandbox is currently undergoing heavy construction. Check back in the next iteration.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
