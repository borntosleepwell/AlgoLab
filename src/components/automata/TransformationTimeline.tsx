import type { AutomataStep } from '../../lib/automataEngine';

interface TransformationTimelineProps {
  stepData: AutomataStep | null;
}

export function TransformationTimeline({ stepData }: TransformationTimelineProps) {
  if (!stepData) return null;

  return (
    <div className="flex flex-col gap-6 border border-border/20 bg-mono-950 p-5 font-mono text-[10px] uppercase tracking-widest text-mono-400">
      <div className="flex justify-between items-end border-b border-border/20 pb-2">
        <span className="text-foreground">GRAMMAR_STATE</span>
        <span>/TIMELINE</span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-mono-500 mb-2">CURRENT_PRODUCTIONS</span>
        
        <div className="flex flex-col gap-1 text-sm bg-background p-4 border border-border/20">
          {stepData.currentGrammar.length === 0 && (
            <span className="text-mono-600 italic">EMPTY</span>
          )}
          {stepData.currentGrammar.map((rule, idx) => {
            return (
              <div key={`${rule.left}-${idx}`} className="flex gap-4">
                <span className="text-foreground font-bold w-4 text-right">{rule.left}</span>
                <span className="text-mono-500">→</span>
                <div className="flex flex-wrap gap-x-2">
                  {rule.right.map((r, i) => {
                    const ruleStr = `${rule.left}->${r}`;
                    const isActive = stepData.activeRules.includes(ruleStr);
                    const isEliminated = stepData.eliminatedRules.includes(ruleStr);
                    const isNew = stepData.newRules.includes(ruleStr);
                    
                    let className = 'text-mono-400';
                    if (isActive) className = 'bg-foreground text-background font-bold px-1';
                    else if (isEliminated) className = 'line-through opacity-30';
                    else if (isNew) className = 'text-foreground underline decoration-dashed underline-offset-4';
                    else className = 'text-mono-400';

                    return (
                      <div key={`${r}-${i}`} className="flex items-center">
                        <span className={className}>{r}</span>
                        {i < rule.right.length - 1 && <span className="text-mono-600 ml-2">|</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Small procedural grid visual */}
      <div className="mt-4 pt-4 border-t border-border/20 grid grid-cols-4 gap-1 opacity-50">
        {Array.from({ length: 8 }).map((_, i) => (
          <div 
            key={i} 
            className={`h-1 ${i % 2 === 0 ? 'bg-mono-500' : 'bg-transparent border border-mono-800'}`} 
          />
        ))}
      </div>
    </div>
  );
}
