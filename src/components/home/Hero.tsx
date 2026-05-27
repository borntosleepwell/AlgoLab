import { motion } from 'framer-motion';

export function Hero() {
  const handleGetStartedClick = () => {
    document.getElementById('lab-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative flex flex-col justify-center items-center min-h-screen w-full">
      {/* Figma background asset 1 with breathing animation */}
      <motion.div 
        className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        initial={{ scale: 1 }}
        animate={{ scale: 1.04 }}
        transition={{ duration: 12, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      >
        <img alt="" className="absolute inset-0 object-bottom w-full h-full object-cover" src="/assets/figma_bg1.png" />
      </motion.div>

      {/* Centered hero content */}
      <div className="relative z-10 flex flex-col items-center gap-[21px] text-center px-6 max-w-[1056px] mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-[16px] items-center text-white w-full"
        >
          <div className="font-sans font-bold text-[56px] md:text-[72px] leading-[1.1] text-center uppercase tracking-tight">
            <p className="mb-0">COMPUTE.</p>
            <p className="mb-0 opacity-80">DON'T JUST</p>
            <p className="mb-0">OBSERVE.</p>
          </div>
          <p className="font-serif leading-normal text-[18.6px] max-w-[722px] text-center mt-4 text-[#cccccc]">
            We design interactive algorithmic visualizers around a creative workspace to keep humans active in the computational loop.
          </p>
        </motion.div>

        {/* Get Started */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.65 }}
          className="mt-6"
        >
          <div className="hero-btn-container">
            <button
              onClick={handleGetStartedClick}
              className="bg-[#111111] hover:bg-[#222222] border-none transition-colors px-[32px] py-[11px] text-white font-serif text-[18.6px] rounded-[17px] w-full h-full block"
              aria-label="Get Started"
            >
              Get Started
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
