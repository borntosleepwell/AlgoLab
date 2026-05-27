import type { SimulationStep } from '../../lib/graphEngine';

interface DataPanelProps {
  stepData: SimulationStep | null;
  algorithm: string;
}

export function DataPanel({ stepData, algorithm }: DataPanelProps) {
  if (!stepData) return null;

  const structName = algorithm === 'DFS' ? 'STACK' : 'QUEUE';

  return (
    <div className="flex flex-col gap-6 border border-border/20 bg-mono-950 p-5 font-mono text-[10px] uppercase tracking-widest text-mono-400">
      <div className="flex justify-between items-end border-b border-border/20 pb-2">
        <span className="text-foreground">DATA_STRUCTURE</span>
        <span>/STATE</span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-mono-500">{structName}</span>
        <div className="flex gap-2 min-h-[32px] flex-wrap">
          {stepData.stack.length === 0 && (
            <span className="text-mono-600 italic flex items-center h-8">[EMPTY]</span>
          )}
          {stepData.stack.map((node, i) => (
            <div 
              key={`struct-${node}-${i}`} 
              className="w-8 h-8 border border-foreground flex items-center justify-center text-foreground font-bold bg-mono-900"
            >
              {node}
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        <span className="text-mono-500">VISITED_NODES</span>
        <div className="flex gap-2 flex-wrap min-h-[32px]">
          {stepData.visited.length === 0 && (
            <span className="text-mono-600 italic flex items-center h-8">[NONE]</span>
          )}
          {stepData.visited.map((node) => (
            <div 
              key={`visited-${node}`} 
              className="w-8 h-8 flex items-center justify-center text-mono-500 border border-mono-700 bg-mono-950"
            >
              {node}
            </div>
          ))}
        </div>
      </div>
      
      {/* Small procedural grid visual */}
      <div className="mt-4 pt-4 border-t border-border/20 grid grid-cols-8 gap-1 opacity-50">
        {Array.from({ length: 16 }).map((_, i) => (
          <div 
            key={i} 
            className={`h-1 ${i % 3 === 0 ? 'bg-mono-500' : 'bg-transparent border border-mono-800'}`} 
          />
        ))}
      </div>
    </div>
  );
}
