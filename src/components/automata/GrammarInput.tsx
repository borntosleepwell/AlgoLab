import { useState, useRef, useCallback, useEffect } from 'react';
import { Paperclip, X } from 'lucide-react';

interface GrammarInputProps {
  onLoad:           (input: string, algorithm: string) => void;
  onLoadImage:      (file: File, algorithm: string) => void;
  onAnalyzeAIText:  (text: string, algorithm: string) => void;
  isAnalyzing:      boolean;
}

const ALGORITHMS = [
  { value: 'UNIT_REMOVAL',    label: 'Unit Production Removal' },
  { value: 'USELESS_REMOVAL', label: 'Useless Symbol Removal' },
  { value: 'CNF',             label: 'CNF Conversion' },
] as const;

const EXAMPLE_GRAMMARS: Record<string, string> = {
  UNIT_REMOVAL:    'S -> A | bb\nA -> B | b\nB -> S | a\nC -> c',
  USELESS_REMOVAL: 'S -> AB | a\nA -> b\nB -> BC\nC -> b\nD -> e',
  CNF:             'S -> AB | a\nA -> BC | b\nB -> b\nC -> a',
};

// Default placeholder for AI — Gemini decides the algorithm
const AI_DEFAULT_ALGO = 'CNF';

export function GrammarInput({
  onLoad,
  onLoadImage,
  onAnalyzeAIText,
  isAnalyzing,
}: GrammarInputProps) {
  const [aiText, setAiText]             = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]     = useState<string | null>(null);
  const [isDragging, setIsDragging]     = useState(false);
  const [showManual, setShowManual]     = useState(false);

  // Algorithm only in Manual section
  const [manualAlgo, setManualAlgo]     = useState<'UNIT_REMOVAL' | 'USELESS_REMOVAL' | 'CNF'>('UNIT_REMOVAL');
  const [manualRules, setManualRules]   = useState(EXAMPLE_GRAMMARS.UNIT_REMOVAL);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(140, el.scrollHeight)}px`;
  }, [aiText]);

  const handleAlgoChange = (alg: 'UNIT_REMOVAL' | 'USELESS_REMOVAL' | 'CNF') => {
    setManualAlgo(alg);
    setManualRules(EXAMPLE_GRAMMARS[alg]);
  };

  // File handling
  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
  };
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  }, []);
  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Submit AI — algorithm decided by Gemini (AI_DEFAULT_ALGO is just a hint)
  const handleSubmitAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile && !aiText.trim()) {
      onLoadImage(selectedFile, AI_DEFAULT_ALGO);
    } else if (aiText.trim()) {
      onAnalyzeAIText(aiText, AI_DEFAULT_ALGO);
    }
  };

  // Submit Manual
  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualRules.trim()) onLoad(manualRules, manualAlgo);
  };

  const hasAIInput = aiText.trim().length > 0 || selectedFile !== null;

  return (
    <div className="flex flex-col gap-0">

      {/* ── AI Vision ─────────────────────────────────────────────────── */}
      <div className="ai-assist-container mx-4 mt-4 mb-0">
        <form
          id="grammar-ai-form"
          onSubmit={handleSubmitAI}
          className={`flex flex-col border bg-mono-950 transition-colors duration-200 ${
            isDragging ? 'border-mono-400' : 'border-border/20'
          }`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
        >
          {/* Label */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <span className="font-serif text-base text-mono-300 tracking-wide">AI Vision</span>
            {selectedFile && (
              <span className="font-mono text-[9px] text-mono-500 uppercase tracking-widest">
                + image attached
              </span>
            )}
          </div>

          {/* Soal cerita textarea */}
          <textarea
            ref={textareaRef}
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            style={{ minHeight: '140px', resize: 'none' }}
            className="w-full bg-transparent border-0 text-foreground font-mono text-[12px] leading-relaxed px-4 pb-3 focus:outline-none placeholder-mono-700"
            placeholder={"Describe your grammar problem here...\n\nExample:\n  Buat CFG untuk bahasa aⁿbⁿ dimana n ≥ 1.\n  AI akan menentukan algoritma yang tepat."}
            spellCheck={false}
          />

          {/* Image thumbnail */}
          {selectedFile && previewUrl && (
            <div className="mx-4 mb-3 flex items-center gap-2 px-2 py-1.5 bg-mono-900 border border-border/20 rounded-sm w-fit">
              <div className="w-8 h-8 rounded-sm overflow-hidden flex-shrink-0 border border-border/20">
                <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
              </div>
              <span className="font-mono text-[10px] text-mono-400 max-w-[120px] truncate">
                {selectedFile.name}
              </span>
              <button type="button" onClick={removeFile} className="text-mono-600 hover:text-foreground transition-colors ml-1">
                <X size={11} />
              </button>
            </div>
          )}

          {/* Attach row */}
          <div className="flex items-center px-4 py-3 border-t border-border/10 gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white hover:text-mono-300 transition-colors"
            >
              <Paperclip size={11} />
              {selectedFile ? 'Change' : 'Attach'}
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            {!selectedFile && (
              <span className="font-mono text-[9px] text-white/50">or drop an image</span>
            )}
          </div>
        </form>
      </div>

      {/* ── Explore button ──────────────────────────────────────────────── */}
      <div className="mx-4 mt-2">
        <button
          type="submit"
          form="grammar-ai-form"
          disabled={isAnalyzing || !hasAIInput}
          className={`w-full py-3 transition-all flex items-center justify-center gap-2 border ${
            hasAIInput && !isAnalyzing
              ? 'bg-mono-900 border-border/20 text-foreground hover:bg-white hover:text-black hover:border-white cursor-pointer'
              : 'bg-mono-900 border-border/10 text-mono-600 cursor-not-allowed'
          }`}
        >
          {isAnalyzing ? (
            <>
              <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span className="font-mono text-[10px] uppercase tracking-widest">Analyzing…</span>
            </>
          ) : (
            <span className="font-serif text-lg tracking-wide leading-none">
              {selectedFile && !aiText.trim() ? 'Explore Image' : 'Explore'}
            </span>
          )}
        </button>
      </div>

      {/* ── Manual toggle ───────────────────────────────────────────────── */}
      <div className="px-4 pt-4 pb-1">
        <button
          type="button"
          onClick={() => setShowManual(v => !v)}
          className="manual-toggle-btn font-mono text-[10px] text-mono-500 uppercase tracking-widest hover:text-mono-300 transition-colors"
        >
          {showManual ? 'Hide Manual' : 'Manual'}
        </button>
      </div>

      {/* ── Manual section (collapsible): grammar + algorithm ──────────── */}
      {showManual && (
        <form onSubmit={handleSubmitManual} className="flex flex-col gap-3 px-4 pb-4 pt-1">

          {/* Grammar rules */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-mono-500 uppercase tracking-widest">
              Production Rules
            </label>
            <textarea
              value={manualRules}
              onChange={(e) => setManualRules(e.target.value)}
              className="w-full h-28 bg-background border border-border/20 text-foreground font-mono text-[11px] p-3 resize-none focus:outline-none focus:border-mono-500 transition-colors leading-relaxed"
              placeholder={'S -> AB | a\nA -> b\nB -> BC'}
              spellCheck={false}
            />
            <span className="font-mono text-[8px] text-mono-700">
              Format: S → AB | a · one variable per line
            </span>
          </div>

          {/* Algorithm selector — only in manual */}
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[9px] text-mono-500 uppercase tracking-widest">
              Algorithm
            </label>
            <div className="flex flex-col gap-1">
              {ALGORITHMS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleAlgoChange(opt.value)}
                  className={`w-full text-left px-3 py-2 font-mono text-[10px] border transition-all ${
                    manualAlgo === opt.value
                      ? 'border-white/20 bg-white/5 text-foreground'
                      : 'border-border/10 bg-transparent text-mono-600 hover:text-mono-400 hover:border-border/20'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!manualRules.trim()}
            className="w-full py-2.5 bg-foreground text-background font-mono text-[10px] uppercase tracking-widest hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Load Grammar
          </button>
        </form>
      )}

      {!showManual && <div className="pb-3" />}
    </div>
  );
}
