import { useState, useRef, useCallback, useEffect } from 'react';
import { X, Paperclip } from 'lucide-react';

interface GraphInputProps {
  onLoadText: (input: string, algorithm: string) => void;
  onLoadImage: (file: File) => void;
  onAnalyzeAIText: (text: string, algorithm: string) => void;
  isAnalyzing: boolean;
}

export function GraphInput({ onLoadText, onLoadImage, onAnalyzeAIText, isAnalyzing }: GraphInputProps) {
  const [adjacency, setAdjacency] = useState("A -> B\nA -> C\nB -> D\nB -> E\nC -> E");
  const [aiText, setAiText] = useState("");
  const [algorithm, setAlgorithm] = useState("DFS");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(160, el.scrollHeight)}px`;
  }, [aiText]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
  }, []);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (adjacency.trim()) onLoadText(adjacency, algorithm);
  };

  const handleAnalyzeAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiText.trim()) onAnalyzeAIText(aiText, algorithm);
    else if (selectedFile) onLoadImage(selectedFile);
  };

  const hasAIInput = aiText.trim().length > 0 || selectedFile !== null;

  return (
    <div className="flex flex-col gap-0">

      {/* ── Section A: AI Vision ─────────────────────────────────────── */}
      <div className="ai-assist-container mx-4 mt-4 mb-0">
        <form
          id="ai-vision-form"
          onSubmit={handleAnalyzeAI}
          className={`flex flex-col border bg-mono-950 transition-colors duration-200 ${
            isDragging ? 'border-mono-400' : 'border-border/20'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {/* Label row */}
          <div className="flex items-center justify-between px-4 pt-3 pb-2">
            <span className="font-serif text-base text-mono-300 tracking-wide">AI Vision</span>
            {selectedFile && (
              <span className="font-mono text-[9px] text-mono-500 uppercase tracking-widest">
                + image attached
              </span>
            )}
          </div>

          {/* Textarea — large, auto-resize */}
          <textarea
            ref={textareaRef}
            value={aiText}
            onChange={(e) => setAiText(e.target.value)}
            style={{ minHeight: '160px', resize: 'none' }}
            className="w-full bg-transparent border-0 text-foreground font-mono text-[12px] leading-relaxed px-4 pb-3 focus:outline-none placeholder-mono-700 transition-colors"
            placeholder={"Describe your graph problem here...\n\nExample:\n  Find BFS traversal starting from node A.\n  Nodes: A, B, C, D\n  Edges: A→B, A→C, B→D, C→D"}
          />

          {/* Image thumbnail strip (if file selected) */}
          {selectedFile && previewUrl && (
            <div className="mx-4 mb-3 flex items-center gap-2 px-2 py-1.5 bg-mono-900 border border-border/20 rounded-sm w-fit">
              <div className="w-8 h-8 rounded-sm overflow-hidden flex-shrink-0 border border-border/20">
                <img src={previewUrl} alt="preview" className="w-full h-full object-cover" />
              </div>
              <span className="font-mono text-[10px] text-mono-400 max-w-[120px] truncate">
                {selectedFile.name}
              </span>
              <button
                type="button"
                onClick={removeFile}
                className="text-mono-600 hover:text-foreground transition-colors ml-1"
                aria-label="Remove image"
              >
                <X size={11} />
              </button>
            </div>
          )}

          {/* Action bar — attach only, no Explore */}
          <div className="flex items-center px-4 py-3 border-t border-border/10 gap-3">

            {/* Attach button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-white hover:text-mono-300 transition-colors"
              title="Attach an image of your graph problem"
            >
              <Paperclip size={11} />
              {selectedFile ? 'Change' : 'Attach'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />

            {/* Drop hint */}
            {!selectedFile && (
              <span className="font-mono text-[9px] text-white/50">
                or drop an image
              </span>
            )}
          </div>
        </form>
      </div>

      {/* ── Explore — separate container below ────────────────────────── */}
      <div className="mx-4 mt-2">
        <button
          type="submit"
          form="ai-vision-form"
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

      {/* ── Manual toggle button ──────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-1">
        <button
          type="button"
          onClick={() => setShowManual(v => !v)}
          className="manual-toggle-btn font-mono text-[10px] text-mono-500 uppercase tracking-widest hover:text-mono-300 transition-colors"
        >
          {showManual ? 'Hide Manual' : 'Manual'}
        </button>
      </div>

      {/* ── Section B: Manual Adjacency + Algorithm (collapsible) ─────── */}
      {showManual && (
        <form onSubmit={handleSubmitManual} className="flex flex-col gap-2 px-4 pb-4 pt-1">
          <label className="font-mono text-[9px] text-mono-500 uppercase tracking-widest flex items-center gap-1.5">
            Adjacency List
          </label>
          <textarea
            value={adjacency}
            onChange={(e) => setAdjacency(e.target.value)}
            className="w-full h-24 bg-background border border-border/20 text-foreground font-mono text-xs p-3 resize-none focus:outline-none focus:border-mono-500 transition-colors"
            placeholder={"A -> B\nA -> C\nB -> D"}
          />

          <label className="font-mono text-[9px] text-mono-500 uppercase tracking-widest mt-1">
            Algorithm
          </label>
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="w-full bg-background border border-border/20 text-foreground font-mono text-xs p-2.5 focus:outline-none focus:border-mono-500 transition-colors cursor-pointer"
          >
            <option value="DFS" className="bg-mono-950 text-white">Depth-First Search (DFS)</option>
            <option value="BFS" className="bg-mono-950 text-white">Breadth-First Search (BFS)</option>
          </select>

          <button
            type="submit"
            disabled={isAnalyzing || !adjacency.trim()}
            className="w-full py-2 bg-foreground text-background font-mono text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed mt-1"
          >
            Load Graph
          </button>
        </form>
      )}
    </div>
  );
}
