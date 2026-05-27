import { useState, useEffect } from 'react';
import { VisionInput } from './VisionInput';
import { VisionCanvas } from './VisionCanvas';
import { SimulationControls } from '../visualizer/SimulationControls';
import { Terminal } from '../ui/Terminal';
import { generateMockVisionSteps } from '../../lib/visionEngine';
import type { VisionStep } from '../../lib/visionEngine';

export function VisionLab() {
  const [operator, setOperator] = useState('SOBEL');
  const [simulationSteps, setSimulationSteps] = useState<VisionStep[]>([]);
  
  // Playback State
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    // Generate steps when operator changes
    const steps = generateMockVisionSteps(operator);
    setSimulationSteps(steps);
    setStep(0);
    setIsPlaying(false);
  }, [operator]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && simulationSteps.length > 0) {
      interval = setInterval(() => {
        setStep((s) => {
          if (s >= simulationSteps.length - 1) {
            setIsPlaying(false);
            return s;
          }
          return s + 1;
        });
      }, 3000 / speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, simulationSteps, speed]);

  const handleStepForward = () => setStep(s => Math.min(s + 1, Math.max(0, simulationSteps.length - 1)));
  const handleStepBackward = () => setStep(s => Math.max(s - 1, 0));
  const handleReset = () => {
    setStep(0);
    setIsPlaying(false);
  };
  const handlePlayPause = () => {
    if (simulationSteps.length === 0) return;
    if (step >= simulationSteps.length - 1) {
      setStep(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const currentStepData = simulationSteps.length > 0 ? simulationSteps[step] : null;

  return (
    <section id="vision-lab" className="w-full flex flex-col gap-8 relative z-10 max-w-[1400px] mx-auto">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-serif text-foreground">Vision Processing: {operator}</h2>
          <div className="flex items-center gap-3 font-mono text-[10px] text-mono-400 uppercase tracking-widest">
            <span>[VISION_LAB]</span>
            <span className="w-1 h-1 rounded-full bg-foreground" />
            <span>©3.11LABS</span>
            <span className="w-1 h-1 rounded-full bg-foreground" />
            <span>IMAGE COMPUTATION</span>
          </div>
        </div>
        
        <SimulationControls 
          isPlaying={isPlaying}
          speed={speed}
          onPlayPause={handlePlayPause}
          onStepForward={handleStepForward}
          onStepBackward={handleStepBackward}
          onReset={handleReset}
          onSpeedChange={setSpeed}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_320px] gap-8 items-start">
        
        {/* Left Column: Input Panel */}
        <div className="flex flex-col gap-8 sticky top-8">
          <VisionInput 
            currentOperator={operator}
            onOperatorSelect={setOperator}
          />
        </div>

        {/* Center Column: Canvas */}
        <div className="w-full min-h-[500px] lg:min-h-[700px] flex flex-col">
          <VisionCanvas 
            currentStepData={currentStepData}
            step={step}
            totalSteps={Math.max(1, simulationSteps.length)}
          />
        </div>
        
        {/* Right Column: Terminal & Metadata */}
        <div className="flex flex-col gap-8 sticky top-8">
          <Terminal 
            text={currentStepData?.narration || "AWAITING INITIALIZATION..."} 
            speed={20}
          />
          
          <div className="p-5 border border-border/20 bg-mono-950 font-mono text-[10px] uppercase tracking-widest text-mono-400 flex flex-col gap-4">
            <div className="flex justify-between items-end border-b border-border/20 pb-2">
              <span className="text-foreground">Computational Optics</span>
              <span>/VISION</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex flex-col gap-1">
                <span>PIXEL</span>
                <span className="text-foreground">ANALYSIS</span>
              </div>
              <div className="flex flex-col gap-1">
                <span>KERNEL</span>
                <span className="text-foreground">CONVOLUTION</span>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4 border-t border-border/20 pt-4">
              <div className="flex items-center gap-2 text-foreground">
                <span className="text-xl">✜</span>
                <span>©2026 ALGO_LAB</span>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span>SCIENTIFIC</span>
                <span>PROCEDURAL</span>
                <span>SYSTEMS</span>
                <span>V1.0.0</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
