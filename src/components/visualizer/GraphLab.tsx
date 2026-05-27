import { useState, useEffect, useRef } from 'react';
import { GraphInput } from './GraphInput';
import { AlgorithmCanvas } from './AlgorithmCanvas';
import { SimulationControls } from './SimulationControls';
import {
  parseGraphInput, calculateCircularLayout,
  generateBFS, generateDFS
} from '../../lib/graphEngine';
import { analyzeGraphImage, analyzeGraphText, analyzeTraversal, NonGraphError } from '../../lib/geminiEngine';
import type { NodeData, EdgeData, SimulationStep } from '../../lib/graphEngine';

// ─── Gemini Icon ──────────────────────────────────────────────────────────────
function GeminiIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C12 2 6.5 8.5 6.5 12C6.5 15.5 12 22 12 22C12 22 17.5 15.5 17.5 12C17.5 8.5 12 2 12 2Z" fill="currentColor"/>
      <path d="M2 12C2 12 8.5 6.5 12 6.5C15.5 6.5 22 12 22 12C22 12 15.5 17.5 12 17.5C8.5 17.5 2 12 2 12Z" fill="currentColor"/>
    </svg>
  );
}


// ─── Inline Markdown Parser ─────────────────────────────────────────────────────
function parseInline(text: string) {
  const boldParts = text.split(/(\*\*.*?\*\*)/g);
  return boldParts.map((boldPart, i) => {
    if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
      return <strong key={`b-${i}`} className="font-bold text-mono-200">{boldPart.slice(2, -2)}</strong>;
    }
    const codeParts = boldPart.split(/(`.*?`)/g);
    return codeParts.map((codePart, j) => {
      if (codePart.startsWith('`') && codePart.endsWith('`')) {
        return <code key={`c-${i}-${j}`} className="font-mono bg-mono-800/80 text-purple-300/90 px-1 py-0.5 rounded-sm text-[10px] whitespace-nowrap">{codePart.slice(1, -1)}</code>;
      }
      return codePart;
    });
  });
}

// ─── Deep Analysis Renderer ───────────────────────────────────────────────────
function DeepAnalysisContent({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const indentMatch = line.match(/^\s*/);
    const indent = indentMatch ? indentMatch[0].length : 0;
    const trimmed = line.trim();
    
    if (!trimmed) {
      elements.push(<div key={i} className="h-2" />);
      return;
    }

    // H1: # Title
    const h1Match = trimmed.match(/^#\s+(.+)$/);
    if (h1Match) {
      elements.push(
        <div key={i} className="mb-4 mt-2">
          <h2 className="font-serif text-xl text-foreground leading-snug">{parseInline(h1Match[1])}</h2>
          <div className="mt-2 h-[2px] w-full" style={{ background: 'linear-gradient(90deg, #4285F4, #EA4335, #FBBC04, #34A853, transparent)' }} />
        </div>
      );
      return;
    }

    // H2: ## Section
    const h2Match = trimmed.match(/^##\s+(.+)$/);
    if (h2Match) {
      elements.push(
        <h3 key={i} className="font-mono text-[10px] font-bold text-mono-300 uppercase tracking-[0.15em] mt-6 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: 'linear-gradient(135deg, #4285F4, #9B72CB)' }} />
          {parseInline(h2Match[1])}
        </h3>
      );
      return;
    }

    // Numbered step list: 1. 2. 3.
    const listMatch = trimmed.match(/^(\d+)\.\s+(.+)$/);
    if (listMatch) {
      elements.push(
        <div key={i} className="flex items-start gap-3 mt-4 mb-2 px-3 py-2 bg-mono-900/40 border-l-2 border-purple-500/50 rounded-r shadow-sm">
          <span className="font-mono text-[10px] font-bold text-purple-400/80 pt-px min-w-[18px] leading-relaxed">[{listMatch[1].padStart(2, '0')}]</span>
          <p className="font-mono text-[11px] text-mono-300 leading-relaxed">{parseInline(listMatch[2])}</p>
        </div>
      );
      return;
    }

    // Dash / bullet / asterisk
    const dashMatch = trimmed.match(/^[-•*]\s+(.+)$/);
    if (dashMatch) {
      // Calculate dynamic margin based on indentation
      let ml = 'ml-2';
      let bullet = '›';
      let bulletColor = 'text-mono-500';
      
      if (indent >= 2 && indent < 4) { ml = 'ml-6'; bullet = '▪'; bulletColor = 'text-blue-400/70'; }
      else if (indent >= 4) { ml = 'ml-10'; bullet = '◦'; bulletColor = 'text-mono-600'; }

      elements.push(
        <div key={i} className={`flex items-start gap-2 ${ml} my-1`}>
          <span className={`font-mono text-[9px] ${bulletColor} pt-0.5 flex-shrink-0`}>{bullet}</span>
          <p className="font-mono text-[11px] text-mono-400 leading-relaxed">{parseInline(dashMatch[1])}</p>
        </div>
      );
      return;
    }

    // Regular body text
    elements.push(
      <p key={i} className="font-mono text-[11px] text-mono-300 leading-loose my-1.5">{parseInline(trimmed)}</p>
    );
  });

  return <div className="flex flex-col gap-0 pb-4">{elements}</div>;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function GraphLab() {
  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [edges, setEdges] = useState<EdgeData[]>([]);
  const [simulationSteps, setSimulationSteps] = useState<SimulationStep[]>([]);
  const [algorithm, setAlgorithm] = useState("BFS");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDeepAnalyzing, setIsDeepAnalyzing] = useState(false);
  const [deepAnalysis, setDeepAnalysis] = useState<string | null>(null);
  const [showDeepAnalysis, setShowDeepAnalysis] = useState(false);
  // Language toggle: cache both EN and ID so switching doesn't re-fetch
  const [analysisLang, setAnalysisLang] = useState<'EN' | 'ID'>('EN');
  const analysisCache = useRef<Partial<Record<'EN' | 'ID', string>>>({});

  // System log: accumulates all narrations + error messages
  const [systemLog, setSystemLog] = useState<{ step: number; text: string; isError?: boolean }[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  // Playback state
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const applyParsedResult = (
    rawNodes: string[],
    rawEdges: Array<[string, string]>,
    rawSteps: SimulationStep[],
    selectedAlgorithm: string
  ) => {
    setAlgorithm(selectedAlgorithm);
    const layoutNodes = calculateCircularLayout(rawNodes, 600, 600);
    const constructedEdges: EdgeData[] = rawEdges.map(e => ({ source: e[0], target: e[1] }));
    setNodes(layoutNodes);
    setEdges(constructedEdges);

    const safeSteps = rawSteps.map((s: any) => ({
      ...s,
      visited: s.visited || [],
      stack: s.stack || [],
      queue: s.queue || [],
      activeEdges: s.activeEdges || [],
      narration: s.narration || ""
    }));
    setSimulationSteps(safeSteps);
    const logs = safeSteps.map((s: SimulationStep, i: number) => ({ step: i, text: s.narration }));
    setSystemLog(logs);
  };

  // ── Load from manual adjacency text ───────────────────────────────────────
  const handleLoadGraphText = (input: string, selectedAlgorithm: string) => {
    setIsPlaying(false);
    setStep(0);
    setAlgorithm(selectedAlgorithm);
    setDeepAnalysis(null);
    setShowDeepAnalysis(false);
    analysisCache.current = {};
    setSystemLog([]);

    const parsed = parseGraphInput(input);
    const layoutNodes = calculateCircularLayout(parsed.nodes, 600, 600);
    setNodes(layoutNodes);
    setEdges(parsed.edges);

    let steps: SimulationStep[] = [];
    if (selectedAlgorithm === "BFS") steps = generateBFS(parsed.nodes, parsed.edges);
    else if (selectedAlgorithm === "DFS") steps = generateDFS(parsed.nodes, parsed.edges);
    setSimulationSteps(steps);

    const logs = steps.map((s, i) => ({ step: i, text: s.narration }));
    setSystemLog(logs);
  };

  // ── Load from AI image ─────────────────────────────────────────────────────
  const handleLoadGraphImage = async (file: File) => {
    setIsAnalyzing(true);
    setIsPlaying(false);
    setStep(0);
    setDeepAnalysis(null);
    setShowDeepAnalysis(false);
    analysisCache.current = {};
    setSystemLog([]);

    try {
      const jsonResult = await analyzeGraphImage(file);
      applyParsedResult(
        jsonResult.nodes,
        jsonResult.edges as Array<[string, string]>,
        jsonResult.steps as SimulationStep[],
        jsonResult.algorithm || "DFS"
      );
    } catch (err: any) {
      if (err instanceof NonGraphError) {
        // Non-graph error → show in system log only
        setSystemLog([{
          step: -1,
          text: `[ERROR] ${err.message}`,
          isError: true
        }]);
      } else {
        setSystemLog([{
          step: -1,
          text: `[API ERROR] ${err.message || "Failed to analyze image. Check your API key."}`,
          isError: true
        }]);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Load from AI text/problem ──────────────────────────────────────────────
  const handleAnalyzeAIText = async (text: string, selectedAlgorithm: string) => {
    setIsAnalyzing(true);
    setIsPlaying(false);
    setStep(0);
    setDeepAnalysis(null);
    setShowDeepAnalysis(false);
    analysisCache.current = {};
    setSystemLog([]);

    try {
      const jsonResult = await analyzeGraphText(text, selectedAlgorithm);
      applyParsedResult(
        jsonResult.nodes,
        jsonResult.edges as Array<[string, string]>,
        jsonResult.steps as SimulationStep[],
        jsonResult.algorithm || selectedAlgorithm
      );
    } catch (err: any) {
      if (err instanceof NonGraphError) {
        setSystemLog([{
          step: -1,
          text: `[ERROR] ${err.message}`,
          isError: true
        }]);
      } else {
        setSystemLog([{
          step: -1,
          text: `[API ERROR] ${err.message || "Failed to process text. Check your API key."}`,
          isError: true
        }]);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Deep Analysis (button-triggered only) ──────────────────────────────────
  const handleDeepAnalyze = async (lang?: 'EN' | 'ID') => {
    if (simulationSteps.length === 0) return;
    const targetLang = lang ?? analysisLang;
    setAnalysisLang(targetLang);

    // Serve from cache if available
    if (analysisCache.current[targetLang]) {
      setDeepAnalysis(analysisCache.current[targetLang]!);
      setShowDeepAnalysis(true);
      return;
    }

    setIsDeepAnalyzing(true);
    setShowDeepAnalysis(true);
    setDeepAnalysis(null);

    try {
      const result = await analyzeTraversal(
        algorithm,
        simulationSteps.map(s => ({ ...s, currentNode: s.currentNode ?? undefined })),
        targetLang
      );
      analysisCache.current[targetLang] = result;
      setDeepAnalysis(result);
    } catch (err: any) {
      const summary = systemLog
        .filter(l => !l.isError)
        .map(l => `Step ${l.step}: ${l.text}`)
        .join('\n');
      const fallback = `# ${algorithm} Traversal Summary\n\n## Step-by-Step Walkthrough\n${summary}\n\n## Conclusion\n[Connect Gemini API for deeper AI-generated insights]`;
      analysisCache.current[targetLang] = fallback;
      setDeepAnalysis(fallback);
    } finally {
      setIsDeepAnalyzing(false);
    }
  };

  // ── Language toggle for existing analysis ─────────────────────────────────
  const handleLangToggle = (newLang: 'EN' | 'ID') => {
    if (newLang === analysisLang) return;
    setAnalysisLang(newLang);
    if (analysisCache.current[newLang]) {
      setDeepAnalysis(analysisCache.current[newLang]!);
    } else {
      handleDeepAnalyze(newLang);
    }
  };

  // ── Playback interval ──────────────────────────────────────────────────────
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && simulationSteps.length > 0) {
      interval = setInterval(() => {
        setStep((s) => {
          if (s >= simulationSteps.length - 1) { setIsPlaying(false); return s; }
          return s + 1;
        });
      }, 3000 / speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, simulationSteps, speed]);

  // ── Auto-scroll log ────────────────────────────────────────────────────────
  useEffect(() => {
    if (logRef.current) {
      const activeEl = logRef.current.querySelector(`[data-step="${step}"]`);
      activeEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [step]);

  const handleStepForward = () => setStep(s => Math.min(s + 1, Math.max(0, simulationSteps.length - 1)));
  const handleStepBackward = () => setStep(s => Math.max(s - 1, 0));
  const handleReset = () => { setStep(0); setIsPlaying(false); };
  const handlePlayPause = () => {
    if (simulationSteps.length === 0) return;
    if (step >= simulationSteps.length - 1) { setStep(0); setIsPlaying(true); }
    else setIsPlaying(!isPlaying);
  };

  const currentStepData = simulationSteps.length > 0 ? simulationSteps[step] : null;

  return (
    <section id="graph-lab" className="w-full flex flex-col gap-0 relative z-10">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-border/10">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-4xl lg:text-5xl font-serif text-foreground leading-none">
            Graph Traversal
          </h1>
        </div>
      </div>

      {/* ── Main Layout ────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row items-start gap-3 p-3">

        {/* ── LEFT: Visualization + Deep Analysis ────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">

          {/* Canvas Box */}
          <div className="flex flex-col border border-border/20 bg-mono-950 overflow-hidden">
            <div className="flex-1 min-h-[500px] lg:min-h-[640px]">
              <AlgorithmCanvas
                nodes={nodes}
                edges={edges}
                currentStepData={currentStepData}
                step={step}
                totalSteps={Math.max(1, simulationSteps.length)}
              />
            </div>

            {/* ── Bottom Row: System Log + Mixtape Controls ─────────────── */}
            <div className="border-t border-border/20 flex flex-row items-stretch">

              {/* System Log — ticker panel */}
              <div className="flex flex-col w-[300px] flex-shrink-0 border-r border-border/20">

                {/* Header */}
                <div className="px-3 py-1.5 border-b border-border/10 font-mono text-[9px] uppercase tracking-widest text-mono-500 flex items-center gap-1.5 flex-shrink-0">
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${simulationSteps.length > 0 ? 'bg-green-400 animate-pulse' : 'bg-mono-700'}`} />
                  SYS_LOG
                </div>

                {/* Progress bar */}
                <div className="h-[2px] bg-mono-900 flex-shrink-0">
                  <div
                    className="h-full bg-white/20 transition-all duration-500"
                    style={{
                      width: simulationSteps.length > 1
                        ? `${(step / (simulationSteps.length - 1)) * 100}%`
                        : '0%'
                    }}
                  />
                </div>

                {/* Single-entry ticker */}
                <div className="flex-1 flex items-start overflow-hidden px-3 pt-3 pb-2">
                  {systemLog.length === 0 ? (
                    <span className="font-mono text-[9px] text-mono-700 italic">Load a graph to begin.</span>
                  ) : (() => {
                    const entry = systemLog.find(e => !e.isError && e.step === step)
                      ?? systemLog.find(e => e.isError);
                    if (!entry) return null;
                    return (
                      <div
                        key={step}
                        className={`log-ticker-entry w-full font-mono text-[10px] leading-relaxed ${
                          entry.isError ? 'text-red-400' : 'text-mono-300'
                        }`}
                      >
                        {!entry.isError && (
                          <span className="text-mono-600 mr-1.5 text-[9px]">
                            [{String(entry.step).padStart(2, '0')}]
                          </span>
                        )}
                        {entry.text}
                      </div>
                    );
                  })()}
                </div>

                {/* Step dots — clickable pagination */}
                {simulationSteps.length > 0 && (
                  <div className="px-3 pb-2.5 flex items-center gap-1.5 flex-wrap">
                    {simulationSteps.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { setStep(i); setIsPlaying(false); }}
                        className={`rounded-full transition-all duration-300 ${
                          i === step
                            ? 'bg-white w-5 h-1.5'
                            : i < step
                            ? 'bg-mono-500 w-1.5 h-1.5 hover:bg-mono-400'
                            : 'bg-mono-800 w-1.5 h-1.5 hover:bg-mono-600'
                        }`}
                        aria-label={`Go to step ${i}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Playback Controls — centered */}
              <div className="flex-1 flex items-center justify-center bg-mono-950/60">
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
            </div>
          </div>

          {/* ── Deep Analyze Button ─────────────────────────────────────── */}
          <div className="flex flex-col gap-0">
            <div className={`deep-analysis-container rounded-xl overflow-hidden ${simulationSteps.length === 0 ? 'opacity-50' : ''}`}>
              <button
                id="deep-analyze-btn"
                onClick={() => handleDeepAnalyze()}
                disabled={simulationSteps.length === 0 || isDeepAnalyzing}
                className={`deep-analyze-btn group w-full py-4 flex items-center justify-center gap-3 font-serif text-2xl tracking-wide transition-all ${
                  simulationSteps.length === 0
                    ? 'bg-mono-900 text-mono-600 cursor-not-allowed'
                    : 'bg-mono-950 text-white cursor-pointer'
                }`}
              >
                {/* White shimmer — appears on hover only, no color gradient */}
                {simulationSteps.length > 0 && (
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                    style={{
                      background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 50%, transparent 75%)'
                    }}
                  />
                )}
                <GeminiIcon size={20} />
                <span>
                  {isDeepAnalyzing ? 'Analyzing…' : 'Deep Analyze'}
                </span>
                {isDeepAnalyzing && (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            </div>

            {/* ── Deep Analysis Output (below canvas, on demand) ────────── */}
            {showDeepAnalysis && (
              <div className="mt-3 rounded-xl overflow-hidden border border-white/[0.06] bg-[#0a0a0a]">
                <div className="p-5 min-h-[80px]">

                  {/* Header bar with label + lang toggle */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-mono text-[9px] text-mono-500 uppercase tracking-widest flex items-center gap-2">
                      <GeminiIcon size={10} />
                      <span>GEMINI_DEEP_ANALYSIS · {algorithm}</span>
                    </div>
                    {/* IND / ENG toggle */}
                    <div className="flex items-center gap-0 border border-border/20 overflow-hidden rounded-sm">
                      {(['EN', 'ID'] as const).map(l => (
                        <button
                          key={l}
                          onClick={() => handleLangToggle(l)}
                          disabled={isDeepAnalyzing}
                          className={`font-mono text-[9px] uppercase tracking-widest px-2.5 py-1 transition-all ${
                            analysisLang === l
                              ? 'bg-foreground text-background'
                              : 'text-mono-500 hover:text-mono-300 hover:bg-mono-800'
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Loading skeleton */}
                  {isDeepAnalyzing && !deepAnalysis && (
                    <div className="flex flex-col gap-2.5">
                      <div className="h-5 rounded bg-mono-800 animate-pulse w-2/3" style={{ animationDelay: '0s' }} />
                      <div className="h-px w-full bg-mono-800 mt-0.5" />
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-2.5 rounded bg-mono-800/70 animate-pulse" style={{ width: `${90 - i * 10}%`, animationDelay: `${i * 0.12}s` }} />
                      ))}
                      <div className="h-2.5 rounded bg-mono-800/50 animate-pulse w-1/2 mt-1" />
                    </div>
                  )}

                  {/* Rendered content */}
                  {deepAnalysis && <DeepAnalysisContent text={deepAnalysis} />}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Control Panel ─────────────────────────────────────────── */}
        <div className="w-full lg:w-[340px] flex-shrink-0 flex flex-col gap-3">

          {/* Unified Input */}
          <div className="border border-border/20 bg-mono-950 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/20 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse inline-block flex-shrink-0" />
              <span className="font-serif text-lg text-foreground leading-none tracking-wide">Explore your idea</span>
            </div>
            <GraphInput
              onLoadText={handleLoadGraphText}
              onLoadImage={handleLoadGraphImage}
              onAnalyzeAIText={handleAnalyzeAIText}
              isAnalyzing={isAnalyzing}
            />
          </div>

        </div>
      </div>
    </section>
  );
}
