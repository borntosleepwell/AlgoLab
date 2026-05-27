import { motion } from 'framer-motion';
import type { AutomataStep } from '../../lib/automataEngine';

interface AutomataCanvasProps {
  stepData: AutomataStep | null;
  step: number;
  totalSteps: number;
}

export function AutomataCanvas({ stepData, step, totalSteps }: AutomataCanvasProps) {
  if (!stepData || stepData.currentGrammar.length === 0) {
    return (
      <div className="w-full h-full min-h-[400px] md:min-h-[600px] relative bg-mono-950 flex items-center justify-center">
        <span className="font-mono text-mono-600 text-xs uppercase tracking-widest animate-pulse">
          AWAITING_GRAMMAR_DATA...
        </span>
      </div>
    );
  }

  // Very simple layout mapping:
  const grammar = stepData.currentGrammar;
  const variables = Array.from(new Set(grammar.map(g => g.left)));
  const layout = variables.map((v, i) => {
    // distribute in a circle
    const angle = (i / variables.length) * 2 * Math.PI - Math.PI / 2;
    const r = 120;
    return {
      id: v,
      x: 250 + r * Math.cos(angle),
      y: 200 + r * Math.sin(angle)
    };
  });

  const edges: { source: string, target: string, active: boolean, eliminated: boolean }[] = [];
  
  grammar.forEach(rule => {
    rule.right.forEach(r => {
      // Find variables in the right side
      variables.forEach(v => {
        if (r.includes(v)) {
          const ruleStr = `${rule.left}->${r}`;
          const active = stepData.activeRules.includes(ruleStr);
          const eliminated = stepData.eliminatedRules.includes(ruleStr);
          edges.push({ source: rule.left, target: v, active, eliminated });
        }
      });
    });
  });

  return (
    <div className="w-full h-full min-h-[400px] md:min-h-[600px] relative bg-mono-950 overflow-hidden flex items-center justify-center border border-border/20">
      <div className="absolute inset-0 bg-dot-grid pointer-events-none opacity-30" />
      
      <div className="relative w-[500px] h-[400px]">
        {/* Draw Edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          {edges.map((edge, idx) => {
            const src = layout.find(l => l.id === edge.source);
            const tgt = layout.find(l => l.id === edge.target);
            if (!src || !tgt) return null;

            // Offset the lines slightly to avoid overlapping if bidirectional
            const dx = tgt.x - src.x;
            const dy = tgt.y - src.y;
            const len = Math.sqrt(dx*dx + dy*dy) || 1;
            const nx = -dy/len * 10;
            const ny = dx/len * 10;

            return (
              <motion.line
                key={`${edge.source}-${edge.target}-${idx}`}
                x1={src.x + nx}
                y1={src.y + ny}
                x2={tgt.x + nx}
                y2={tgt.y + ny}
                stroke={edge.active ? 'var(--foreground)' : edge.eliminated ? 'red' : 'var(--border)'}
                strokeWidth={edge.active ? 2 : 1}
                strokeDasharray={edge.active ? '4 4' : edge.eliminated ? '2 4' : 'none'}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: 1, 
                  opacity: edge.eliminated ? 0.2 : 1,
                  stroke: edge.active ? 'var(--foreground)' : edge.eliminated ? 'red' : 'var(--border)'
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            );
          })}
        </svg>

        {/* Draw Nodes */}
        {layout.map((node) => {
          // A node is active if any of its rules are active
          const isActive = stepData.activeRules.some(r => r.startsWith(node.id + '->'));
          const isEliminated = stepData.eliminatedRules.some(r => r.startsWith(node.id + '->')) && !grammar.some(r => r.left === node.id && r.right.length > 0);

          return (
            <motion.div
              key={node.id}
              className="absolute w-12 h-12 -ml-6 -mt-6 flex items-center justify-center bg-mono-950 z-10 font-mono text-xs border border-mono-800"
              style={{ left: node.x, top: node.y }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: isEliminated ? 0.3 : 1,
                borderColor: isActive ? 'var(--foreground)' : 'var(--mono-800)',
                color: isActive ? 'var(--foreground)' : 'var(--mono-400)'
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <span className={isActive ? "text-foreground font-bold" : "text-mono-500"}>{node.id}</span>
              
              {isActive && (
                <motion.div
                  className="absolute inset-0 border border-foreground pointer-events-none"
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: 1.3, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
      
      {/* ASCII Corner Decorations */}
      <div className="absolute top-4 left-4 font-mono text-[10px] text-mono-700 opacity-50 whitespace-pre">
        {`[CFG]\n|`}
      </div>
      
      {/* Step Indicator overlay */}
      <div className="absolute bottom-4 right-4 font-mono text-[10px] text-mono-500 tracking-widest uppercase flex items-center gap-2">
        <span>STEP_{step + 1}/{totalSteps}</span>
        <div className="w-2 h-2 bg-foreground animate-pulse" />
      </div>
    </div>
  );
}
