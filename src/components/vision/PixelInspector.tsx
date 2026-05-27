import { motion } from 'framer-motion';
import type { VisionStep } from '../../lib/visionEngine';

interface PixelInspectorProps {
  stepData: VisionStep | null;
}

export function PixelInspector({ stepData }: PixelInspectorProps) {
  if (!stepData || !stepData.kernel || !stepData.neighborhood) {
    return (
      <div className="w-full h-full min-h-[300px] flex items-center justify-center border border-border/20 bg-mono-950/20">
        <div className="text-center font-mono text-[10px] text-mono-500 uppercase tracking-widest">
          <p>No Pixel Selected</p>
          <p>Awaiting Convolution Focus</p>
        </div>
      </div>
    );
  }

  const { kernel, neighborhood, calculationResult } = stepData;

  // Assuming 3x3 for simplicity
  return (
    <div className="w-full flex flex-col gap-6 p-6 border border-border/30 bg-mono-950/50">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-mono tracking-widest uppercase text-foreground">
          Local Convolution Math
        </h3>
        <span className="font-mono text-[10px] text-mono-400">
          [{stepData.targetPixel?.x}, {stepData.targetPixel?.y}]
        </span>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-4 font-mono text-sm">
        {/* Neighborhood Matrix */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-mono-500 mb-2">IMAGE</span>
          <div className="grid grid-cols-3 gap-1 border-l-2 border-r-2 border-foreground/30 p-2">
            {neighborhood.flat().map((val, i) => (
              <div key={`n-${i}`} className="w-8 h-8 flex items-center justify-center bg-mono-900 text-mono-300 text-xs">
                {val}
              </div>
            ))}
          </div>
        </div>

        <div className="text-mono-500 text-xl">*</div>

        {/* Kernel Matrix */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-mono-500 mb-2">KERNEL</span>
          <div className="grid grid-cols-3 gap-1 border-l-2 border-r-2 border-foreground/30 p-2">
            {kernel.flat().map((val, i) => (
              <div key={`k-${i}`} className="w-8 h-8 flex items-center justify-center bg-foreground/10 text-foreground text-xs">
                {val}
              </div>
            ))}
          </div>
        </div>

        <div className="text-mono-500 text-xl">=</div>

        {/* Result */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-mono-500 mb-2">RESULT</span>
          <motion.div 
            key={calculationResult}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 flex items-center justify-center border border-foreground bg-foreground text-background font-bold text-lg"
          >
            {calculationResult}
          </motion.div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border/20">
        <p className="font-mono text-[10px] text-mono-400 leading-relaxed uppercase tracking-wide">
          Equation: Σ (Neighborhood[i,j] * Kernel[i,j])
          <br />
          The sum of element-wise multiplication yields the new pixel intensity.
        </p>
      </div>
    </div>
  );
}
