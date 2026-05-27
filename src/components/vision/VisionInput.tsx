import { Upload, SlidersHorizontal, Settings2 } from 'lucide-react';

interface VisionInputProps {
  onOperatorSelect: (operator: string) => void;
  currentOperator: string;
}

const OPERATORS = [
  { id: 'GRAYSCALE', label: 'Grayscale', desc: 'Luminance Extraction' },
  { id: 'SOBEL', label: 'Sobel', desc: 'Gradient Edge Detection' },
  { id: 'PREWITT', label: 'Prewitt', desc: 'Discrete Differentiation' },
  { id: 'ROBERTS', label: 'Roberts Cross', desc: 'Diagonal Edge Detection' },
  { id: 'MANUAL', label: 'Manual Input', desc: 'Custom Convolution Kernel' },
];

export function VisionInput({ onOperatorSelect, currentOperator }: VisionInputProps) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-sm font-sans">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-mono tracking-widest uppercase text-mono-400">
          Source Material
        </h3>
        
        <button className="w-full flex items-center justify-between p-4 border border-border/30 bg-mono-950/50 hover:bg-mono-900 transition-colors group">
          <div className="flex items-center gap-3">
            <Upload size={16} className="text-mono-400 group-hover:text-foreground transition-colors" />
            <span className="text-sm">Load Image Matrix</span>
          </div>
          <span className="text-[10px] font-mono text-mono-500">.PNG / .JPG</span>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono tracking-widest uppercase text-mono-400">
            Computational Operator
          </h3>
          <SlidersHorizontal size={14} className="text-mono-500" />
        </div>

        <div className="flex flex-col gap-2">
          {OPERATORS.map(op => (
            <button
              key={op.id}
              onClick={() => onOperatorSelect(op.id)}
              className={`flex flex-col items-start p-3 border transition-all ${
                currentOperator === op.id 
                  ? 'border-foreground bg-foreground/5 text-foreground' 
                  : 'border-border/30 bg-mono-950/20 text-mono-400 hover:border-border/60 hover:text-foreground'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-medium text-sm">{op.label}</span>
                {currentOperator === op.id && <Settings2 size={14} />}
              </div>
              <span className="text-[10px] font-mono tracking-wide opacity-70 mt-1">
                {op.desc}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-4 p-4 border border-foreground/20 bg-foreground/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-1">
           <div className="w-1.5 h-1.5 bg-foreground animate-pulse" />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-foreground/80">
          Operator Status: <span className="font-bold">{currentOperator}</span>
        </p>
        <p className="font-mono text-[10px] text-mono-500 mt-2">
          Awaiting execution command to process matrix.
        </p>
      </div>
    </div>
  );
}
