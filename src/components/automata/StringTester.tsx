import { useState } from 'react';
import { testStringCYK } from '../../lib/automataEngine';
import type { GrammarRule } from '../../lib/automataEngine';

interface StringTesterProps {
  grammar: GrammarRule[];
  startSymbol: string;
}

export function StringTester({ grammar, startSymbol }: StringTesterProps) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<{ accepted: boolean; checked: boolean; input: string } | null>(null);

  const handleTest = () => {
    if (!input.trim() && input !== '') return;
    const cyk = testStringCYK(grammar, input.trim(), startSymbol);
    setResult({ accepted: cyk.accepted, checked: true, input: input.trim() });
  };

  return (
    <div className="border border-border/20 bg-mono-950 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-border/10 font-mono text-[9px] uppercase tracking-widest text-mono-500 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block" />
        STRING_TESTER
        <span className="ml-auto text-mono-700">CYK</span>
      </div>

      <div className="p-4 flex flex-col gap-3">
        {/* Input row */}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => { setInput(e.target.value); setResult(null); }}
            onKeyDown={e => e.key === 'Enter' && handleTest()}
            className="flex-1 bg-background border border-border/20 text-foreground font-mono text-[11px] px-3 py-2 focus:outline-none focus:border-mono-500 transition-colors placeholder-mono-700"
            placeholder="e.g.  aab"
            spellCheck={false}
          />
          <button
            onClick={handleTest}
            disabled={grammar.length === 0}
            className="font-mono text-[9px] uppercase tracking-widest px-4 py-2 bg-mono-900 border border-border/20 text-mono-400 hover:text-foreground hover:bg-mono-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Test
          </button>
        </div>

        {/* Result */}
        {result && (
          <div className={`flex items-center gap-3 px-3 py-2.5 border transition-all duration-500 log-ticker-entry ${
            result.accepted
              ? 'border-green-500/30 bg-green-500/5'
              : 'border-red-500/30 bg-red-500/5'
          }`}>
            <span className={`text-lg ${result.accepted ? 'text-green-400' : 'text-red-400'}`}>
              {result.accepted ? '✓' : '✗'}
            </span>
            <div className="flex flex-col gap-0.5">
              <span className={`font-mono text-[11px] font-semibold ${result.accepted ? 'text-green-400' : 'text-red-400'}`}>
                "{result.input || 'ε'}" {result.accepted ? 'ACCEPTED' : 'REJECTED'}
              </span>
              <span className="font-mono text-[9px] text-mono-600">
                {result.accepted
                  ? `String dapat diturunkan dari ${startSymbol}`
                  : `String tidak dapat diturunkan dari ${startSymbol}`}
              </span>
            </div>
          </div>
        )}

        {/* Grammar empty warning */}
        {grammar.length === 0 && (
          <span className="font-mono text-[9px] text-mono-700 italic">
            Load a grammar first to test strings.
          </span>
        )}

        {/* Start symbol indicator */}
        {grammar.length > 0 && (
          <div className="flex items-center gap-2 font-mono text-[9px] text-mono-700">
            <span>Start symbol:</span>
            <span className="text-mono-500 px-1.5 py-0.5 border border-border/20">{startSymbol}</span>
          </div>
        )}
      </div>
    </div>
  );
}
