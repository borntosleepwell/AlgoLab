import { useState, useEffect, useRef } from 'react';
import { GrammarInput } from './GrammarInput';
import { GrammarVisualizer } from './GrammarVisualizer';
import { StringTester } from './StringTester';
import { SimulationControls } from '../visualizer/SimulationControls';
import {
  parseGrammar,
  generateUnitRemovalSteps,
  generateUselessRemovalSteps,
  generateCNFSteps,
} from '../../lib/automataEngine';
import type { AutomataStep, GrammarRule } from '../../lib/automataEngine';
import {
  analyzeGrammarImage,
  analyzeGrammarText,
  analyzeGrammarTransformation,
  NonGrammarError,
} from '../../lib/geminiEngine';

// ─── Gemini Icon ──────────────────────────────────────────────────────────────
function GeminiIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2C12 2 6.5 8.5 6.5 12C6.5 15.5 12 22 12 22C12 22 17.5 15.5 17.5 12C17.5 8.5 12 2 12 2Z" fill="currentColor"/>
      <path d="M2 12C2 12 8.5 6.5 12 6.5C15.5 6.5 22 12 22 12C22 12 15.5 17.5 12 17.5C8.5 17.5 2 12 2 12Z" fill="currentColor"/>
    </svg>
  );
}

// ─── LaTeX stripper — fallback for when Gemini ignores formatting rules ───────
function stripLatex(text: string): string {
  const SUB: Record<string, string> = { '0':'₀','1':'₁','2':'₂','3':'₃','4':'₄','5':'₅','6':'₆','7':'₇','8':'₈','9':'₉' };
  const SUP: Record<string, string> = { '0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','n':'ⁿ','m':'ᵐ','k':'ᵏ','i':'ⁱ' };

  return text
    // Strip display math $$...$$
    .replace(/\$\$([^$]+)\$\$/g, '$1')
    // Strip inline math $...$
    .replace(/\$([^$]+)\$/g, '$1')
    // Common LaTeX symbols → Unicode
    .replace(/\\rightarrow/g, '→')
    .replace(/\\Rightarrow/g, '⇒')
    .replace(/\\leftarrow/g, '←')
    .replace(/\\to\b/g, '→')
    .replace(/\\mid\b/g, '|')
    .replace(/\\epsilon/g, 'ε')
    .replace(/\\varepsilon/g, 'ε')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\Sigma/g, 'Σ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\cup/g, '∪')
    .replace(/\\cap/g, '∩')
    .replace(/\\in\b/g, '∈')
    .replace(/\\subseteq/g, '⊆')
    .replace(/\\emptyset/g, '∅')
    .replace(/\\forall/g, '∀')
    .replace(/\\exists/g, '∃')
    .replace(/\\ldots/g, '…')
    .replace(/\\cdots/g, '…')
    .replace(/\\cdot/g, '·')
    .replace(/\\times/g, '×')
    .replace(/\\neq/g, '≠')
    .replace(/\\leq/g, '≤')
    .replace(/\\geq/g, '≥')
    .replace(/\\neg/g, '¬')
    .replace(/\\lor\b/g, '∨')
    .replace(/\\land\b/g, '∧')
    // Subscript: _{123} or _1 → Unicode subscript digits
    .replace(/_{([^}]+)}/g, (_, inner) => inner.split('').map((c: string) => SUB[c] ?? c).join(''))
    .replace(/_([0-9])/g, (_, d) => SUB[d] ?? d)
    // Superscript: ^{n} or ^n → Unicode superscript
    .replace(/\^{([^}]+)}/g, (_, inner) => inner.split('').map((c: string) => SUP[c] ?? c).join(''))
    .replace(/\^([0-9nmki])/g, (_, c) => SUP[c] ?? c)
    // Remove any remaining backslash-commands
    .replace(/\\[a-zA-Z]+/g, '')
    // Clean up stray braces
    .replace(/[{}]/g, '')
    // Collapse multiple spaces
    .replace(/ {2,}/g, ' ');
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
    
    const strippedLine = stripLatex(line);
    const trimmed = strippedLine.trim();
    
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

// ─── Algorithm labels ─────────────────────────────────────────────────────────
const ALGO_LABEL: Record<string, string> = {
  UNIT_REMOVAL:    'Unit Production Removal',
  USELESS_REMOVAL: 'Useless Symbol Removal',
  CNF:             'Chomsky Normal Form',
};

// ═══════════════════════════════════════════════════════════════════════════════
export function AutomataLab() {
  const [simulationSteps, setSimulationSteps] = useState<AutomataStep[]>([]);
  const [algorithm, setAlgorithm]   = useState('UNIT_REMOVAL');
  const [step, setStep]             = useState(0);
  const [isPlaying, setIsPlaying]   = useState(false);
  const [speed, setSpeed]           = useState(1);
  const [startSymbol, setStartSymbol] = useState('S');
  const [initialGrammar, setInitialGrammar] = useState<GrammarRule[]>([]);
  const [finalGrammar, setFinalGrammar]     = useState<GrammarRule[]>([]);

  // AI state
  const [isAnalyzing, setIsAnalyzing]           = useState(false);
  const [isDeepAnalyzing, setIsDeepAnalyzing]   = useState(false);
  const [deepAnalysis, setDeepAnalysis]         = useState<string | null>(null);
  const [showDeepAnalysis, setShowDeepAnalysis] = useState(false);
  const [analysisLang, setAnalysisLang]         = useState<'EN' | 'ID'>('EN');
  const analysisCache = useRef<Partial<Record<'EN' | 'ID', string>>>({});

  // Popover for algorithm switcher
  const [showAlgoPopover, setShowAlgoPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowAlgoPopover(false);
      }
    };
    if (showAlgoPopover) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showAlgoPopover]);

  // Error log for AI failures
  const [errorLog, setErrorLog] = useState<string | null>(null);

  // Problem context — preserved for Deep Analyze enrichment
  const [problemContext, setProblemContext] = useState<string>('');

  // ── Core grammar loader ────────────────────────────────────────────────────
  const applyGrammar = (parsed: GrammarRule[], selectedAlgorithm: string) => {
    if (parsed.length === 0) return;
    setIsPlaying(false);
    setStep(0);
    setAlgorithm(selectedAlgorithm);
    setStartSymbol(parsed[0].left);
    setInitialGrammar(parsed);
    setDeepAnalysis(null);
    setShowDeepAnalysis(false);
    analysisCache.current = {};
    setErrorLog(null);

    let steps: AutomataStep[] = [];
    if (selectedAlgorithm === 'UNIT_REMOVAL')    steps = generateUnitRemovalSteps(parsed);
    else if (selectedAlgorithm === 'USELESS_REMOVAL') steps = generateUselessRemovalSteps(parsed);
    else if (selectedAlgorithm === 'CNF')         steps = generateCNFSteps(parsed);

    setSimulationSteps(steps);
    setFinalGrammar(steps.length > 0 ? steps[steps.length - 1].currentGrammar : parsed);
  };

  // ── Re-apply same grammar with different algorithm ─────────────────────────
  const handleReapply = (newAlgorithm: string) => {
    if (newAlgorithm === algorithm || initialGrammar.length === 0) return;
    applyGrammar(initialGrammar, newAlgorithm);
  };

  // ── Manual load ────────────────────────────────────────────────────
  const handleLoadGrammar = (input: string, algo: string) => {
    setProblemContext(''); // manual — no natural language context
    applyGrammar(parseGrammar(input), algo);
  };

  // ── AI Image load ──────────────────────────────────────────────────────────
  const handleLoadImage = async (file: File, algo: string) => {
    setIsAnalyzing(true);
    setErrorLog(null);
    try {
      const result = await analyzeGrammarImage(file);
      const parsed = parseGrammar(result.grammarRules.join('\n'));
      setProblemContext(
        result.languageDescription
          ? `Grammar loaded from image.\nLanguage: ${result.languageDescription}`
          : ''
      );
      applyGrammar(parsed, result.suggestedAlgorithm || algo);
    } catch (err: any) {
      if (err instanceof NonGrammarError) {
        setErrorLog(`[VISION] ${err.message}`);
      } else {
        setErrorLog(`[API ERROR] ${err.message || 'Failed to analyze image. Check your API key.'}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── AI Text / Soal Cerita ──────────────────────────────────────────────────
  const handleAnalyzeAIText = async (text: string, algo: string) => {
    setIsAnalyzing(true);
    setErrorLog(null);
    try {
      const result = await analyzeGrammarText(text, algo);
      const parsed = parseGrammar(result.grammarRules.join('\n'));
      // Store original soal cerita + language description as context for Deep Analyze
      setProblemContext(
        [text.trim(), result.languageDescription].filter(Boolean).join('\n→ ') 
      );
      applyGrammar(parsed, result.suggestedAlgorithm || algo);
    } catch (err: any) {
      if (err instanceof NonGrammarError) {
        setErrorLog(`[AI] ${err.message}`);
      } else {
        setErrorLog(`[API ERROR] ${err.message || 'Failed to process. Check your API key.'}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Deep Analyze ───────────────────────────────────────────────────────────
  const handleDeepAnalyze = async (lang?: 'EN' | 'ID') => {
    if (simulationSteps.length === 0) return;
    const targetLang = lang ?? analysisLang;
    setAnalysisLang(targetLang);

    if (analysisCache.current[targetLang]) {
      setDeepAnalysis(analysisCache.current[targetLang]!);
      setShowDeepAnalysis(true);
      return;
    }

    setIsDeepAnalyzing(true);
    setShowDeepAnalysis(true);
    setDeepAnalysis(null);

    try {
      const narrations = simulationSteps.map(s => s.narration);
      const result = await analyzeGrammarTransformation(
        algorithm,
        initialGrammar,
        finalGrammar,
        narrations,
        targetLang,
        problemContext || undefined
      );
      analysisCache.current[targetLang] = result;
      setDeepAnalysis(result);
    } catch (err: any) {
      const isRateLimit = err.message?.includes('Spam Detected') || err.message?.includes('batas harian');
      const fallback = isRateLimit
        ? `> [!WARNING]\n> **RATE LIMIT EXCEEDED:** ${err.message}\n\n# ${ALGO_LABEL[algorithm] ?? algorithm}\n\n## Overview\nGrammar transformed from ${initialGrammar.length} to ${finalGrammar.length} rules.`
        : `# ${ALGO_LABEL[algorithm] ?? algorithm}\n\n## Overview\nGrammar transformed from ${initialGrammar.length} to ${finalGrammar.length} rules.\n\n[Connect Gemini API for deeper AI-generated insights.]`;
      analysisCache.current[targetLang] = fallback;
      setDeepAnalysis(fallback);
    } finally {
      setIsDeepAnalyzing(false);
    }
  };

  const handleLangToggle = (newLang: 'EN' | 'ID') => {
    if (newLang === analysisLang) return;
    setAnalysisLang(newLang);
    if (analysisCache.current[newLang]) setDeepAnalysis(analysisCache.current[newLang]!);
    else handleDeepAnalyze(newLang);
  };

  // ── Playback ───────────────────────────────────────────────────────────────
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying && simulationSteps.length > 0) {
      interval = setInterval(() => {
        setStep(s => {
          if (s >= simulationSteps.length - 1) { setIsPlaying(false); return s; }
          return s + 1;
        });
      }, 3000 / speed);
    }
    return () => clearInterval(interval);
  }, [isPlaying, simulationSteps, speed]);

  // Initial load
  useEffect(() => {
    handleLoadGrammar('S -> A | bb\nA -> B | b\nB -> S | a\nC -> c', 'UNIT_REMOVAL');
  }, []);

  const handleStepForward  = () => setStep(s => Math.min(s + 1, Math.max(0, simulationSteps.length - 1)));
  const handleStepBackward = () => setStep(s => Math.max(s - 1, 0));
  const handleReset        = () => { setStep(0); setIsPlaying(false); };
  const handlePlayPause    = () => {
    if (simulationSteps.length === 0) return;
    if (step >= simulationSteps.length - 1) { setStep(0); setIsPlaying(true); }
    else setIsPlaying(!isPlaying);
  };

  const currentStepData = simulationSteps.length > 0 ? simulationSteps[step] : null;
  const currentLog = simulationSteps[step] ? { text: simulationSteps[step].narration } : null;

  return (
    <section id="automata-lab" className="w-full flex flex-col gap-0 relative z-10">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-border/10">
        <div className="flex flex-col gap-0.5">
          <h1 className="text-4xl lg:text-5xl font-serif text-foreground leading-none">
            Formal Grammar
          </h1>

          {/* Algorithm label — click to open popover switcher */}
          {algorithm && (
            <div ref={popoverRef} className="relative mt-1 w-fit">
              <button
                onClick={() => initialGrammar.length > 0 && setShowAlgoPopover(v => !v)}
                className={`flex items-center gap-1.5 group transition-all ${
                  initialGrammar.length > 0 ? 'cursor-pointer' : 'cursor-default'
                }`}
                title={initialGrammar.length > 0 ? 'Switch algorithm' : ''}
              >
                <span className="font-mono text-[10px] text-mono-500 uppercase tracking-widest group-hover:text-mono-300 transition-colors">
                  {ALGO_LABEL[algorithm] ?? algorithm}
                </span>
                {initialGrammar.length > 0 && (
                  <svg
                    width="10" height="10" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={`text-mono-700 group-hover:text-mono-400 transition-all duration-200 ${
                      showAlgoPopover ? 'rotate-180' : ''
                    }`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                )}
              </button>

              {/* Popover dropdown */}
              {showAlgoPopover && (
                <div className="absolute top-full left-0 mt-1.5 z-50 bg-[#0d0d0d] border border-white/10 shadow-2xl min-w-[240px]">
                  <div className="px-3 py-2 border-b border-white/[0.05]">
                    <span className="font-mono text-[8px] text-mono-700 uppercase tracking-widest">
                      Re-apply as
                    </span>
                  </div>
                  {[
                    { value: 'UNIT_REMOVAL',    label: 'Unit Production Removal' },
                    { value: 'USELESS_REMOVAL', label: 'Useless Symbol Removal'  },
                    { value: 'CNF',             label: 'Chomsky Normal Form'      },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => { handleReapply(opt.value); setShowAlgoPopover(false); }}
                      className={`w-full text-left px-3 py-2.5 font-mono text-[10px] flex items-center justify-between transition-all ${
                        algorithm === opt.value
                          ? 'text-foreground bg-white/[0.05] cursor-default'
                          : 'text-mono-500 hover:text-foreground hover:bg-white/[0.04] cursor-pointer'
                      }`}
                    >
                      <span>{opt.label}</span>
                      {algorithm === opt.value && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {isAnalyzing && (
          <div className="flex items-center gap-2 font-mono text-[9px] text-mono-500 uppercase tracking-widest">
            <span className="inline-block w-3 h-3 border-2 border-mono-500 border-t-transparent rounded-full animate-spin" />
            Analyzing…
          </div>
        )}
      </div>


      {/* ── Main Layout ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row items-start gap-3 p-3">

        {/* ── LEFT: Grammar Visualizer ────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">

          {/* Visualizer + Bottom Bar */}
          <div className="flex flex-col border border-border/20 bg-mono-950 overflow-hidden" style={{ minHeight: '600px' }}>
            <div className="flex flex-col flex-1">
              <GrammarVisualizer
                stepData={currentStepData}
                step={step}
                totalSteps={Math.max(1, simulationSteps.length)}
              />
            </div>

            {/* ── Bottom Row: Log Ticker + Controls ─────────────────────── */}
            <div className="border-t border-border/20 flex flex-row items-stretch">

              {/* SYS_LOG ticker */}
              <div className="flex flex-col w-[300px] flex-shrink-0 border-r border-border/20">
                <div className="px-3 py-1.5 border-b border-border/10 font-mono text-[9px] uppercase tracking-widest text-mono-500 flex items-center gap-1.5 flex-shrink-0">
                  <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                    errorLog ? 'bg-red-400' : simulationSteps.length > 0 ? 'bg-green-400 animate-pulse' : 'bg-mono-700'
                  }`} />
                  SYS_LOG
                </div>

                {/* Progress bar */}
                <div className="h-[2px] bg-mono-900 flex-shrink-0">
                  <div
                    className="h-full bg-white/20 transition-all duration-500"
                    style={{ width: simulationSteps.length > 1 ? `${(step / (simulationSteps.length - 1)) * 100}%` : '0%' }}
                  />
                </div>

                {/* Ticker */}
                <div className="flex-1 flex items-start overflow-hidden px-3 pt-3 pb-2">
                  {errorLog ? (
                    <div className="log-ticker-entry w-full font-mono text-[10px] leading-relaxed text-red-400">
                      {errorLog}
                    </div>
                  ) : !currentLog ? (
                    <span className="font-mono text-[9px] text-mono-700 italic">Load a grammar to begin.</span>
                  ) : (
                    <div key={step} className="log-ticker-entry w-full font-mono text-[10px] leading-relaxed text-mono-300">
                      <span className="text-mono-600 mr-1.5 text-[9px]">[{String(step).padStart(2, '0')}]</span>
                      {currentLog.text}
                    </div>
                  )}
                </div>

                {/* Step dots */}
                {simulationSteps.length > 0 && (
                  <div className="px-3 pb-2.5 flex items-center gap-1.5 flex-wrap">
                    {simulationSteps.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { setStep(i); setIsPlaying(false); }}
                        className={`rounded-full transition-all duration-300 ${
                          i === step    ? 'bg-white w-5 h-1.5'
                          : i < step   ? 'bg-mono-500 w-1.5 h-1.5 hover:bg-mono-400'
                                       : 'bg-mono-800 w-1.5 h-1.5 hover:bg-mono-600'
                        }`}
                        aria-label={`Go to step ${i}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Playback Controls */}
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

          {/* ── Deep Analyze ──────────────────────────────────────────────── */}
          <div className="flex flex-col gap-0">
            <div className={`deep-analysis-container rounded-xl overflow-hidden ${simulationSteps.length === 0 ? 'opacity-50' : ''}`}>
              <button
                id="deep-analyze-btn"
                onClick={() => handleDeepAnalyze()}
                disabled={simulationSteps.length === 0 || isDeepAnalyzing}
                className={`deep-analyze-btn group relative w-full py-4 flex items-center justify-center gap-3 font-serif text-2xl tracking-wide transition-all ${
                  simulationSteps.length === 0
                    ? 'bg-mono-900 text-mono-600 cursor-not-allowed'
                    : 'bg-mono-950 text-white cursor-pointer'
                }`}
              >
                {simulationSteps.length > 0 && (
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 50%, transparent 75%)' }}
                  />
                )}
                <GeminiIcon size={20} />
                <span>{isDeepAnalyzing ? 'Analyzing…' : 'Deep Analyze'}</span>
                {isDeepAnalyzing && (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            </div>

            {/* Deep Analysis Output */}
            {showDeepAnalysis && (
              <div className="mt-3 rounded-xl overflow-hidden border border-white/[0.06] bg-[#0a0a0a]">
                <div className="p-5 min-h-[80px]">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-mono text-[9px] text-mono-500 uppercase tracking-widest flex items-center gap-2">
                      <GeminiIcon size={10} />
                      <span>GEMINI_DEEP_ANALYSIS · {ALGO_LABEL[algorithm] ?? algorithm}</span>
                    </div>
                    {/* EN / ID toggle */}
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
                      <div className="h-5 rounded bg-mono-800 animate-pulse w-2/3" />
                      <div className="h-px w-full bg-mono-800 mt-0.5" />
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-2.5 rounded bg-mono-800/70 animate-pulse"
                          style={{ width: `${90 - i * 10}%`, animationDelay: `${i * 0.12}s` }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Content */}
                  {deepAnalysis && <DeepAnalysisContent text={deepAnalysis} />}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Control Panel ─────────────────────────────────────────── */}
        <div className="w-full lg:w-[340px] flex-shrink-0 flex flex-col gap-3">

          {/* Input Panel */}
          <div className="border border-border/20 bg-mono-950 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/20 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse inline-block flex-shrink-0" />
              <span className="font-serif text-lg text-foreground leading-none tracking-wide">
                Explore your idea
              </span>
            </div>
            <GrammarInput
              onLoad={handleLoadGrammar}
              onLoadImage={handleLoadImage}
              onAnalyzeAIText={handleAnalyzeAIText}
              isAnalyzing={isAnalyzing}
            />
          </div>

          {/* String Tester */}
          <StringTester grammar={finalGrammar} startSymbol={startSymbol} />
        </div>
      </div>
    </section>
  );
}
