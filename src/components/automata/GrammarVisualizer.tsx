import type { AutomataStep } from '../../lib/automataEngine';

interface GrammarVisualizerProps {
  stepData: AutomataStep | null;
  step: number;
  totalSteps: number;
}

function getRuleKey(left: string, right: string) {
  return `${left}->${right}`;
}

type RuleState = 'normal' | 'active' | 'eliminated' | 'new';

function getRuleState(
  ruleKey: string,
  activeRules: string[],
  eliminatedRules: string[],
  newRules: string[]
): RuleState {
  if (eliminatedRules.includes(ruleKey)) return 'eliminated';
  if (newRules.includes(ruleKey)) return 'new';
  if (activeRules.includes(ruleKey)) return 'active';
  return 'normal';
}

function ProductionChip({ text, state }: { text: string; state: RuleState }) {
  const base =
    'font-mono text-[13px] font-medium px-3 py-1.5 border transition-all duration-400 inline-flex items-center gap-1';
  const map: Record<RuleState, string> = {
    normal:    'border-white/10 text-white/50 bg-white/[0.03]',
    active:    'border-yellow-400/60 text-yellow-300 bg-yellow-400/10 shadow-[0_0_14px_rgba(234,179,8,0.18)]',
    eliminated:'border-red-500/30 text-red-400/50 bg-red-500/[0.06] line-through decoration-red-500/60',
    new:       'border-emerald-400/50 text-emerald-300 bg-emerald-400/10 shadow-[0_0_14px_rgba(52,211,153,0.14)]',
  };
  const dot: Record<RuleState, string> = {
    normal:    '',
    active:    'w-1 h-1 rounded-full bg-yellow-400 animate-pulse',
    eliminated:'',
    new:       'w-1 h-1 rounded-full bg-emerald-400',
  };
  return (
    <span className={`${base} ${map[state]}`}>
      {dot[state] && <span className={dot[state]} />}
      {text}
    </span>
  );
}

export function GrammarVisualizer({ stepData, step, totalSteps }: GrammarVisualizerProps) {
  // ── Empty state ──────────────────────────────────────────────────────────────
  if (!stepData || stepData.currentGrammar.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-mono-950 relative overflow-hidden" style={{ minHeight: 460 }}>
        {/* Decorative grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '48px 48px' }}
        />
        <div className="relative flex flex-col items-center gap-5 text-center">
          <span className="font-serif text-6xl text-white/5 select-none">G</span>
          <div className="font-mono text-[10px] text-mono-700 uppercase tracking-[0.3em] animate-pulse">
            AWAITING_GRAMMAR
          </div>
          <div className="font-mono text-[9px] text-mono-800 leading-relaxed">
            Input rules on the right panel.<br />
            Format: <span className="text-mono-600">S → AB | a</span>
          </div>
        </div>
      </div>
    );
  }

  const { currentGrammar, activeRules, eliminatedRules, newRules, phase } = stepData;
  const vars = Array.from(new Set(currentGrammar.map(r => r.left)));

  return (
    <div className="flex-1 flex flex-col bg-mono-950 relative overflow-hidden">
      {/* Subtle background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* ── Top meta bar ───────────────────────────────────────────────────── */}
      <div className="relative flex items-center justify-between px-6 py-3 border-b border-white/[0.06] flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] text-mono-700 uppercase tracking-widest">
            CFG_VISUALIZER
          </span>
          {phase && (
            <span className="font-mono text-[8px] px-2 py-0.5 border border-white/10 text-mono-500 uppercase tracking-[0.2em]">
              {phase}
            </span>
          )}
        </div>

        <div className="flex items-center gap-5">
          {/* Legend */}
          <div className="hidden md:flex items-center gap-4 font-mono text-[8px] uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-yellow-400/70">
              <span className="w-1.5 h-1.5 rounded-sm bg-yellow-400/60 inline-block" />active
            </span>
            <span className="flex items-center gap-1.5 text-red-400/50">
              <span className="w-1.5 h-1.5 rounded-sm bg-red-500/40 inline-block" />removed
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400/70">
              <span className="w-1.5 h-1.5 rounded-sm bg-emerald-400/60 inline-block" />new
            </span>
          </div>
          <span className="font-mono text-[9px] text-mono-700">
            {step + 1}<span className="text-mono-800">/{totalSteps}</span>
          </span>
        </div>
      </div>

      {/* ── Grammar rows ───────────────────────────────────────────────────── */}
      <div className="relative flex-1 overflow-y-auto">
        {currentGrammar.map((rule, ruleIdx) => {
          const isVarActive =
            activeRules.some(r => r.startsWith(`${rule.left}->`)) ||
            newRules.some(r => r.startsWith(`${rule.left}->`));

          // Collect eliminated prods for this var not currently in rule.right
          const ghostElims = eliminatedRules
            .filter(r => r.startsWith(`${rule.left}->`) && !rule.right.includes(r.split('->')[1]))
            .map(r => r.split('->')[1]);

          return (
            <div
              key={`${rule.left}-${ruleIdx}`}
              className={`group flex items-center gap-0 border-b border-white/[0.04] transition-all duration-300 ${
                isVarActive ? 'bg-white/[0.025]' : 'hover:bg-white/[0.015]'
              }`}
              style={{ minHeight: 72 }}
            >
              {/* Left: Variable column */}
              <div className={`
                flex-shrink-0 w-24 flex flex-col items-center justify-center self-stretch
                border-r border-white/[0.05] transition-all duration-300
                ${isVarActive ? 'bg-white/[0.03]' : ''}
              `}>
                {/* Active glow ring */}
                {isVarActive && (
                  <div className="absolute w-10 h-10 rounded-full border border-yellow-400/20 animate-ping pointer-events-none" />
                )}
                <span className={`
                  font-serif text-4xl font-bold leading-none transition-all duration-300
                  ${isVarActive ? 'text-white' : 'text-white/20'}
                `}>
                  {rule.left}
                </span>
              </div>

              {/* Arrow */}
              <div className="w-10 flex-shrink-0 flex items-center justify-center self-stretch">
                <span className={`font-mono text-lg transition-colors duration-300 ${isVarActive ? 'text-white/40' : 'text-white/[0.08]'}`}>
                  →
                </span>
              </div>

              {/* Productions */}
              <div className="flex-1 flex flex-wrap items-center gap-2 px-4 py-5">
                {rule.right.map((prod, pIdx) => {
                  const key = getRuleKey(rule.left, prod);
                  const state = getRuleState(key, activeRules, eliminatedRules, newRules);
                  return (
                    <span key={pIdx} className="flex items-center gap-2">
                      <ProductionChip text={prod} state={state} />
                      {pIdx < rule.right.length - 1 && (
                        <span className="font-mono text-[11px] text-white/15">|</span>
                      )}
                    </span>
                  );
                })}

                {/* Ghost eliminated productions */}
                {ghostElims.map((prod, i) => (
                  <span key={`g-${i}`} className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-white/10">|</span>
                    <ProductionChip text={prod} state="eliminated" />
                  </span>
                ))}
              </div>

              {/* Right: rule count badge */}
              <div className="w-10 flex-shrink-0 flex items-center justify-center self-stretch border-l border-white/[0.04]">
                <span className="font-mono text-[8px] text-mono-800 rotate-90 whitespace-nowrap">
                  {rule.right.length} prod
                </span>
              </div>
            </div>
          );
        })}

        {/* Fill remaining space with decorative content if < 4 rules */}
        {currentGrammar.length < 4 && (
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-8 pointer-events-none select-none opacity-[0.04]">
            <span className="font-serif text-[120px] text-white leading-none">
              {vars.join('')}
            </span>
          </div>
        )}
      </div>

      {/* ── Footer: variable status bar ──────────────────────────────────────── */}
      <div className="relative flex items-center gap-4 px-6 py-2.5 border-t border-white/[0.04] flex-shrink-0">
        {vars.map(v => {
          const isActive = activeRules.some(r => r.startsWith(`${v}->`));
          const isNew    = newRules.some(r => r.startsWith(`${v}->`));
          return (
            <span key={v} className="flex items-center gap-1.5">
              <span className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                isActive ? 'bg-yellow-400' : isNew ? 'bg-emerald-400' : 'bg-white/10'
              }`} />
              <span className={`font-mono text-[9px] transition-colors duration-300 ${
                isActive ? 'text-yellow-400/70' : isNew ? 'text-emerald-400/70' : 'text-white/15'
              }`}>
                {v}
              </span>
            </span>
          );
        })}
        <div className="ml-auto font-mono text-[8px] text-white/10 uppercase tracking-widest">
          {currentGrammar.length} variables · {currentGrammar.reduce((a, r) => a + r.right.length, 0)} productions
        </div>
      </div>
    </div>
  );
}
