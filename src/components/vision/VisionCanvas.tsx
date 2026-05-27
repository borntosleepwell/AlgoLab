import { motion } from 'framer-motion';
import type { VisionStep } from '../../lib/visionEngine';
import { PixelInspector } from './PixelInspector';

interface VisionCanvasProps {
  currentStepData: VisionStep | null;
  step: number;
  totalSteps: number;
}

const MOCK_ASCII_ART_ORIGINAL = `
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@@@@@@@@@@@@@@@%++%@@@@@@@@@@@@@
@@@@@@@@@@@@@*......*@@@@@@@@@@@
@@@@@@@@@@@%..........%@@@@@@@@@
@@@@@@@@@@#...-+**+-...#@@@@@@@@
@@@@@@@@@+..-#@@@@@@#-..+@@@@@@@
@@@@@@@@=..=@@@@@@@@@@=..=@@@@@@
@@@@@@@+..*@@@@@@@@@@@@*..+@@@@@
@@@@@@@..-@@@@@@@@@@@@@@-..@@@@@
@@@@@@#..+@@@@@@@@@@@@@@+..#@@@@
@@@@@@#..+@@@@@@@@@@@@@@+..#@@@@
@@@@@@@..-@@@@@@@@@@@@@@-..@@@@@
@@@@@@@+..*@@@@@@@@@@@@*..+@@@@@
@@@@@@@@=..=@@@@@@@@@@=..=@@@@@@
@@@@@@@@@+..-#@@@@@@#-..+@@@@@@@
@@@@@@@@@@#...-+**+-...#@@@@@@@@
@@@@@@@@@@@%..........%@@@@@@@@@
@@@@@@@@@@@@@*......*@@@@@@@@@@@
@@@@@@@@@@@@@@@%++%@@@@@@@@@@@@@
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
`;

const MOCK_ASCII_ART_EDGE = `
................................
.............../==\\.............
............./......\\...........
.........../..........\\.........
........./..../====\\....\\.......
......../../========\\..\\........
......./../==========\\..\\.......
....../../============\\..\\......
....../..|============|..\\......
......|..|============|..|......
......|..|============|..|......
....../..|============|..\\......
....../..\\============/..\\......
.......\\..\\==========/../.......
........\\..\\========/../........
.........\\....\\====/..../.......
...........\\........../.........
.............\\....../...........
...............\\==/.............
................................
`;

export function VisionCanvas({ currentStepData, step, totalSteps }: VisionCanvasProps) {
  const isEdgeDetect = currentStepData?.type === 'CONVOLUTION' || currentStepData?.type === 'EDGE_DETECT';

  return (
    <div className="w-full flex flex-col gap-6 h-full">
      
      {/* Progress Bar */}
      <div className="w-full h-1 bg-border/30 relative">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-foreground"
          initial={{ width: '0%' }}
          animate={{ width: `${((step) / (totalSteps - 1)) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
        
        {/* Left: Original / Target Image */}
        <div className="flex flex-col gap-2 relative">
          <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-mono-400 uppercase">
            <span>Input Matrix (Original)</span>
            <span>20x32px</span>
          </div>
          <div className="flex-1 border border-border/20 bg-mono-950 flex items-center justify-center p-4 overflow-hidden relative group">
             <pre className="font-mono text-[8px] leading-[8px] sm:text-[10px] sm:leading-[10px] text-mono-300">
               {MOCK_ASCII_ART_ORIGINAL}
             </pre>
             
             {/* Target Pixel Overlay */}
             {currentStepData?.targetPixel && (
               <motion.div 
                 layoutId="target-pixel"
                 className="absolute w-8 h-8 border border-red-500 bg-red-500/20 backdrop-blur-[1px] pointer-events-none"
                 style={{
                    left: `calc(50% - 100px + ${currentStepData.targetPixel.x * 2}px)`,
                    top: `calc(50% - 100px + ${currentStepData.targetPixel.y * 2}px)`
                 }}
               />
             )}
          </div>
        </div>

        {/* Right: Output / Processed Image */}
        <div className="flex flex-col gap-2 relative">
           <div className="flex items-center justify-between text-[10px] font-mono tracking-widest text-foreground uppercase">
            <span>Output Matrix ({currentStepData?.type || 'AWAITING'})</span>
            {isEdgeDetect && <span className="text-red-400">KERNEL_ACTIVE</span>}
          </div>
          <div className="flex-1 border border-foreground/30 bg-background flex items-center justify-center p-4 overflow-hidden relative">
             <motion.pre 
                key={isEdgeDetect ? 'edge' : 'orig'}
                initial={{ opacity: 0, filter: 'blur(5px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                className="font-mono text-[8px] leading-[8px] sm:text-[10px] sm:leading-[10px] text-foreground"
             >
               {isEdgeDetect ? MOCK_ASCII_ART_EDGE : MOCK_ASCII_ART_ORIGINAL}
             </motion.pre>
          </div>
        </div>
      </div>

      {/* Bottom: Inspector */}
      <div className="h-auto">
         <PixelInspector stepData={currentStepData} />
      </div>

    </div>
  );
}
