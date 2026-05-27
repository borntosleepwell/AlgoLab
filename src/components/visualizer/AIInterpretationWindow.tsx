import { Terminal } from '../ui/Terminal';
import type { SimulationStep } from '../../lib/graphEngine';

interface AIInterpretationWindowProps {
  stepData: SimulationStep | null;
  algorithm: string;
}

export function AIInterpretationWindow({ stepData, algorithm }: AIInterpretationWindowProps) {
  if (!stepData) {
    return (
      <div className="flex flex-col gap-8">
        <Terminal text="AWAITING GRAPH INITIALIZATION..." speed={20} />
      </div>
    );
  }

  const structName = algorithm === 'DFS' ? 'STACK' : 'QUEUE';

  return (
    <div className="flex flex-col gap-6">
      
      {/* Current State Window */}
      <div className="border border-border/20 bg-mono-950 p-5 font-mono text-[10px] uppercase tracking-widest text-mono-400">
        <div className="flex justify-between items-end border-b border-border/20 pb-2 mb-4">
          <span className="text-foreground">CURRENT_STATE</span>
          <span>/MEMORY</span>
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-mono-600">CURRENT NODE</span>
            <span className="text-foreground text-sm font-bold">
              {stepData.currentNode || "[NONE]"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-mono-600">{structName}</span>
            <div className="flex gap-2 flex-wrap mt-1">
              {stepData.stack.length === 0 && <span className="text-mono-500 italic">[EMPTY]</span>}
              {stepData.stack.map((node, i) => (
                <div key={`s-${node}-${i}`} className="w-6 h-6 border border-foreground bg-mono-900 text-foreground flex items-center justify-center font-bold">
                  {node}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-mono-600">VISITED</span>
            <div className="flex gap-2 flex-wrap mt-1">
              {stepData.visited.length === 0 && <span className="text-mono-500 italic">[NONE]</span>}
              {stepData.visited.map((node, i) => (
                <div key={`v-${node}-${i}`} className="w-6 h-6 border border-mono-700 text-mono-400 flex items-center justify-center">
                  {node}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Explanation Terminal */}
      <div className="flex flex-col gap-2">
         <span className="font-mono text-[10px] uppercase tracking-widest text-mono-500">AI_REASONING_ENGINE</span>
         <Terminal text={stepData.narration} speed={15} />
      </div>

      {/* Concept Explanation (Placeholder for Future 'Focus Mode') */}
      <div className="border border-border/20 bg-mono-950/50 p-4 border-l-2 border-l-foreground/50">
        <p className="font-mono text-[10px] leading-relaxed text-mono-400">
          <span className="text-foreground">CONCEPT:</span> AI Interpretation analyzes the uploaded image to structure data, whilst the playback engine maps state transitions over time.
        </p>
      </div>

    </div>
  );
}
