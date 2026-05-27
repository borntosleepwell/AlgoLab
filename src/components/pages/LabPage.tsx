import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../layout/Navbar';
import { AnimatedAsciiCard } from '../ui/AnimatedAsciiCard';

// ── Lab Card ──────────────────────────────────────────────────────────────────
interface LabCardProps {
  title: string;
  description: string;
  type: 'ALGORITHMS' | 'AUTOMATA' | 'VISION';
  path: string;
  delay?: number;
}

function LabCard({ title, description, type, path, delay = 0 }: LabCardProps) {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => navigate(path)}
      className="lab-card-glow-down bg-[#f2f2f2] cursor-pointer flex flex-col overflow-hidden"
      style={{ minHeight: '400px' }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(path)}
    >
      {/* ASCII art area — white bg, black text, fills top area */}
      <div className="flex-1 flex items-center justify-center p-6 bg-[#f2f2f2]">
        <AnimatedAsciiCard type={type} />
      </div>

      {/* Label + description at the bottom */}
      <div className="px-6 py-5 border-t border-black/10 flex flex-col gap-2 items-center text-center">
        <h3 className="font-sans text-sm font-semibold text-black tracking-tight">
          {title}
        </h3>
        <p className="font-sans text-xs text-black/50 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

// ── Lab Page ──────────────────────────────────────────────────────────────────
export function LabPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <div className="page-enter flex-1 flex flex-col">

        {/* Page header */}
        <div className="px-6 sm:px-12 lg:px-20 pt-12 pb-10 max-w-[1400px] mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-3"
          >
            <span className="font-mono text-[10px] tracking-[0.25em] text-black/40 uppercase">
              [LAB_PAGE] — SELECT MODULE
            </span>
            <h1 className="text-4xl sm:text-5xl font-sans font-medium tracking-tight text-black leading-tight">
              Interactive Algorithm Workspace
            </h1>
            <p className="text-black/50 font-sans text-sm max-w-lg leading-relaxed">
              Choose a lab module to begin your exploration. Each lab offers a
              step-by-step interactive visualization environment.
            </p>
          </motion.div>
        </div>

        {/* 3-column Lab cards */}
        <div className="px-6 sm:px-12 lg:px-20 pb-20 max-w-[1400px] mx-auto w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <LabCard
              title="ALGORITHMS LAB"
              description="An interactive playground for exploring graph traversal algorithms. Input adjacency lists manually or upload a hand-drawn graph image for real-time, step-by-step interpretation powered by Gemini Vision."
              type="ALGORITHMS"
              path="/lab/graph"
              delay={0}
            />
            <LabCard
              title="AUTOMATA LAB"
              description="Explore Chomsky's hierarchy by tracing Context-Free Grammar transformations step-by-step. See how recursive rules are simplified through Unit Production and Useless Symbol removal."
              type="AUTOMATA"
              path="/lab/automata"
              delay={0.1}
            />
            <LabCard
              title="VISION LAB"
              description="Demystify image processing by stepping into matrix convolution. Watch in real-time as mathematical kernels slide across pixel grids to perform edge detection and transform raw visual data."
              type="VISION"
              path="/lab/vision"
              delay={0.2}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
