import { motion } from 'framer-motion';
import type { NodeData, EdgeData, SimulationStep } from '../../lib/graphEngine';

interface AlgorithmCanvasProps {
  nodes: NodeData[];
  edges: EdgeData[];
  currentStepData: SimulationStep | null;
  step: number;
  totalSteps: number;
}

export function AlgorithmCanvas({ nodes, edges, currentStepData, step, totalSteps }: AlgorithmCanvasProps) {
  if (!currentStepData || nodes.length === 0) {
    return (
      <div className="w-full h-full min-h-[400px] md:min-h-[600px] relative bg-mono-950 flex items-center justify-center">
        <span className="font-mono text-mono-600 text-xs uppercase tracking-widest animate-pulse">
          AWAITING_GRAPH_DATA...
        </span>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[400px] md:min-h-[600px] relative bg-mono-950 overflow-hidden flex items-center justify-center border border-border/20">
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-dot-grid pointer-events-none opacity-30" />
      
      {/* Procedural ASCII Background Wow Moment */}
      {step === 0 && (
         <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 0.15, y: 0, scale: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute inset-0 overflow-hidden font-mono text-[8px] sm:text-[10px] leading-tight text-foreground pointer-events-none whitespace-pre flex flex-col items-center justify-center select-none mix-blend-screen"
         >
            {Array.from({ length: 40 }).map((_, i) => (
               <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05, duration: 1 }}
               >
                 {Array.from({ length: 15 }).map(() => Math.random().toString(36).substring(2, 8)).join(' ')}
               </motion.div>
            ))}
         </motion.div>
      )}
      
      {/* Canvas Area */}
      <div className="relative w-[600px] h-[600px]">
        {/* Draw Edges */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          {edges.map((edge) => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            const edgeId = `${edge.source}-${edge.target}`;
            const isActive = currentStepData.activeEdges.includes(edgeId);
            const isVisited = currentStepData.visited.includes(edge.source) && currentStepData.visited.includes(edge.target);

            return (
              <motion.line
                key={edgeId}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={isActive || isVisited ? 'var(--foreground)' : 'var(--border)'}
                strokeWidth={isActive ? 2 : 1}
                strokeDasharray={isActive ? '4 4' : 'none'}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: 1, 
                  opacity: 1,
                  stroke: isActive || isVisited ? 'var(--foreground)' : 'var(--border)'
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            );
          })}
        </svg>

        {/* Draw Nodes */}
        {nodes.map((node, i) => {
          const isActive = currentStepData.currentNode === node.id;
          const isVisited = currentStepData.visited.includes(node.id);

          return (
            <motion.div
              key={node.id}
              className="absolute w-12 h-12 -ml-6 -mt-6 flex items-center justify-center bg-mono-950 z-10 font-mono text-xs"
              style={{ left: node.x, top: node.y }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                color: isActive ? 'var(--background)' : isVisited ? 'var(--mono-400)' : 'var(--foreground)',
                backgroundColor: isActive ? 'var(--foreground)' : 'var(--mono-950)',
                borderColor: isActive ? 'var(--foreground)' : isVisited ? 'var(--mono-600)' : 'var(--border)',
                textShadow: isActive ? 'none' : isVisited ? 'none' : '0 0 5px var(--foreground)'
              }}
              transition={{ 
                duration: step === 0 ? 0.8 : 0.4, 
                delay: step === 0 ? i * 0.1 : 0, 
                ease: "easeOut" 
              }}
            >
              <div className="absolute inset-0 flex items-center justify-between pointer-events-none opacity-30 px-1 border border-inherit">
                <span>[</span><span>]</span>
              </div>
              <span className={isActive ? "font-bold text-background" : "font-medium"}>{node.id}</span>
              
              {/* Ping effect for active nodes */}
              {isActive && (
                <motion.div
                  className="absolute inset-0 border border-foreground pointer-events-none"
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
      
      {/* ASCII Corner Decorations */}
      <div className="absolute top-4 left-4 font-mono text-[10px] text-mono-700 opacity-50 whitespace-pre">
        {`+--\n|`}
      </div>
      <div className="absolute top-4 right-4 font-mono text-[10px] text-mono-700 opacity-50 whitespace-pre text-right">
        {`--+\n  |`}
      </div>
      <div className="absolute bottom-4 left-4 font-mono text-[10px] text-mono-700 opacity-50 whitespace-pre">
        {`|\n+--`}
      </div>
      
      {/* Step Indicator overlay */}
      <div className="absolute bottom-4 right-4 font-mono text-[10px] text-mono-500 tracking-widest uppercase flex items-center gap-2">
        <span>STEP_{step}/{totalSteps - 1}</span>
        <div className="w-2 h-2 bg-foreground animate-pulse" />
      </div>
    </div>
  );
}
