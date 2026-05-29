import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import type { Schema } from "@google/generative-ai";
import type { GraphPipelineJSON } from "./graphEngine";

// ─── Shared response schema ───────────────────────────────────────────────────
const responseSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    lab: { type: SchemaType.STRING },
    algorithm: { type: SchemaType.STRING },
    isGraphTraversal: { type: SchemaType.BOOLEAN },
    errorReason: { type: SchemaType.STRING },
    nodes: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING }
    },
    edges: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING }
      }
    },
    steps: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          currentNode: { type: SchemaType.STRING },
          visited: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
          },
          stack: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
          },
          queue: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING }
          },
          narration: { type: SchemaType.STRING }
        },
        required: ["visited", "narration"]
      }
    }
  },
  required: ["lab", "algorithm", "isGraphTraversal", "nodes", "edges", "steps"]
};

// ─── Types ────────────────────────────────────────────────────────────────────
export interface GeminiGraphJSON extends GraphPipelineJSON {
  lab: string;
  isGraphTraversal: boolean;
  errorReason?: string;
  nodes: string[];
  edges: [string, string][];
}

// ─── Typed error for non-graph content ───────────────────────────────────────
export class NonGraphError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'NonGraphError';
  }
}

// ─── Image analysis prompt ────────────────────────────────────────────────────
const IMAGE_PROMPT = `You are an expert graph traversal analysis system.

Analyze the uploaded image carefully.

STEP 1 — Validation:
Determine if the image contains a graph traversal problem or graph structure (nodes/edges, BFS, DFS, tree traversal, adjacency matrix/list, etc.).
- Set "isGraphTraversal": true  if it IS a graph traversal problem.
- Set "isGraphTraversal": false if it is NOT (e.g. a photo, bar chart, math equation, plain text, or unrelated diagram).
- If false, set "errorReason" to a short, clear sentence explaining why this is not a graph traversal problem.
- If false, return empty arrays for nodes, edges, steps and STOP.

STEP 2 — Extraction (only if isGraphTraversal is true):
- Extract all nodes (labels, letters, numbers).
- Extract all directed edges as [source, target] pairs.
- Choose the most appropriate algorithm: "BFS" or "DFS" based on the problem.
- Generate a detailed step-by-step traversal simulation. Each step must have: currentNode, visited[], stack[] or queue[], and a short narration string.
- Set "lab" to "graph".

Return ONLY valid JSON matching the schema. No explanation outside JSON.`;

// ─── Text/problem analysis prompt ────────────────────────────────────────────
function buildTextPrompt(problemText: string, algorithm: string): string {
  return `You are an expert graph traversal analysis system.

A user has pasted the following graph problem or description:
"""
${problemText}
"""

STEP 1 — Validation:
Determine if this text describes a graph traversal problem (BFS, DFS, tree traversal, graph nodes/edges, adjacency list, etc.).
- Set "isGraphTraversal": true  if it IS a graph traversal problem.
- Set "isGraphTraversal": false if it is NOT (e.g. a math equation, essay, or unrelated topic).
- If false, set "errorReason" to a short, clear sentence explaining why this is not a graph traversal problem.
- If false, return empty arrays for nodes, edges, steps and STOP.

STEP 2 — Extraction (only if isGraphTraversal is true):
- Extract all nodes from the problem description.
- Extract all directed edges as [source, target] pairs.
- Use algorithm: "${algorithm}" as specified by the user.
- Generate a detailed step-by-step traversal simulation. Each step must have: currentNode, visited[], stack[] or queue[], and a short narration string.
- Set "lab" to "graph".

Return ONLY valid JSON matching the schema. No explanation outside JSON.`;
}

// ─── Deep analysis prompt ─────────────────────────────────────────────────────
function buildDeepAnalysisPrompt(algorithm: string, traversalSummary: string, lang: 'EN' | 'ID'): string {
  const isID = lang === 'ID';

  return `You are an expert computer science educator explaining graph traversal to a university student.

The following is a ${algorithm} graph traversal simulation data:
"""
${traversalSummary}
"""

Write a comprehensive, rigorous, and highly educational deep analysis ${isID ? 'IN INDONESIAN (Bahasa Indonesia)' : 'IN ENGLISH'}.

Your response MUST follow this exact structure. Use these exact Markdown markers:

# [Write a concise, specific title here — e.g. "${algorithm} Traversal Analysis on Graph with N Nodes"]

## ${isID ? 'Penjelasan Algoritma' : 'Algorithm Overview'}
${isID
      ? 'Jelaskan dalam satu paragraf: esensi dari algoritma yang digunakan, analogi dunia nyatanya (jika relevan), serta karakteristik utama struktur data pendukungnya (LIFO dengan Stack untuk DFS, atau FIFO dengan Queue untuk BFS) dalam konteks kasus ini.'
      : 'Explain in one paragraph: the essence of the algorithm used, its real-world analogy (if relevant), and the key characteristics of its supporting data structure (LIFO with Stack for DFS, or FIFO with Queue for BFS) in the context of this case.'}

## ${isID ? 'Aturan Penelusuran (Tie-Breaking Rule)' : 'Traversal & Tie-Breaking Rule'}
${isID
      ? 'Sebutkan aturan yang digunakan jika terdapat beberapa kandidat node tetangga yang bisa dikunjungi secara bersamaan (misalnya: berdasarkan urutan alfabetis atau nilai bobot terkecil).'
      : 'State the rule used when there are multiple neighbor node candidates that can be visited simultaneously (e.g., based on alphabetical order or smallest weight value).'}

## ${isID ? 'Langkah-langkah Traversal' : 'Step-by-Step Walkthrough'}
${isID
      ? 'Narasikan setiap langkah dari data simulasi secara kronologis. Gunakan format list seperti di bawah ini untuk SETIAP langkah:'
      : 'Narrate each step from the simulation data chronologically. Use the following list format for EVERY step:'}

1. **${isID ? 'Langkah' : 'Step'} 1: Node \`[Nama_Node]\`**
   * **${isID ? 'Aksi' : 'Action'}:** [${isID ? 'Penjelasan singkat apa yang terjadi, node mana yang diekstrak' : 'Brief explanation of what happens, which node is extracted'}]
   * **${isID ? 'Status Kondisi' : 'State Tracking'}:**
     * \`Visited\` = \`[...]\`
     * \`${algorithm === 'BFS' ? 'Queue' : 'Stack'}\` = \`[...]\`
   * **${isID ? 'Alasan' : 'Rationale'}:** [${isID ? 'Mengapa tetangga tertentu dimasukkan ke stack/queue dan mengapa urutannya demikian' : 'Why certain neighbors are pushed/enqueued and why in that specific order'}]

[${isID ? 'Lanjutkan format di atas untuk Step 2, 3, dan seterusnya hingga selesai.' : 'Continue the exact format above for Step 2, 3, and so on until finished.'}]

## ${isID ? 'Kesimpulan & Analisis Kompleksitas' : 'Conclusion & Complexity Analysis'}
* **${isID ? 'Urutan Hasil Traversal' : 'Final Traversal Order'}:** [${isID ? 'Tampilkan urutan akhir node yang dikunjungi, misal: A -> B -> D' : 'Show the final visited order, e.g., A -> B -> D'}]
* **${isID ? 'Kompleksitas Waktu & Ruang' : 'Time & Space Complexity'}:** ${isID
      ? 'Jelaskan kompleksitas O(V+E) secara spesifik dengan memasukkan jumlah V (node) dan E (edge) aktual dari graf ini.'
      : 'Explain O(V+E) complexity specifically by inserting the actual number of V (nodes) and E (edges) from this graph.'}
* **${isID ? 'Evaluasi Efektivitas' : 'Suitability'}:** [${isID ? 'Berikan 1-2 kalimat analisis apakah algoritma ini adalah pilihan terbaik untuk karakteristik graf tersebut.' : 'Give 1-2 sentences analyzing whether this algorithm was the best choice for this graph characteristics.'}]

IMPORTANT: Use the exact markers # and ## as shown. Do not alter the headings. Maintain a professional, academic tone.`;
}

// ─── Internal helpers ─────────────────────────────────────────────────────────
function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({ inlineData: { data: base64Data, mimeType: file.type } });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ─── Local Rate Limiter (Anti-Spam) ──────────────────────────────────────────
function checkRateLimit() {
  const MAX_RPM = 10;
  const MAX_RPD = 20;

  const now = Date.now();
  const historyRaw = localStorage.getItem('algo_gemini_usage');
  let history: number[] = historyRaw ? JSON.parse(historyRaw) : [];

  // Filter 24h
  history = history.filter(time => now - time < 24 * 60 * 60 * 1000);

  if (history.length >= MAX_RPD) {
    throw new Error('Anda telah mencapai batas harian. Coba lagi besok.');
  }

  // Filter 1 minute
  const requestsLastMinute = history.filter(time => now - time < 60 * 1000).length;
  if (requestsLastMinute >= MAX_RPM) {
    throw new Error('Terlalu banyak permintaan (Spam Detected). Tunggu 1 menit.');
  }

  history.push(now);
  localStorage.setItem('algo_gemini_usage', JSON.stringify(history));
}

function getApiKey(): string {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) throw new Error("Missing VITE_GEMINI_API_KEY. Please set it in your .env file.");
  return key;
}

function getStructuredModel(apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: "gemini-3-flash-preview",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema
    }
  });
}

function getTextModel(apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
}

function parseAndValidate(jsonText: string): GeminiGraphJSON {
  let text = jsonText.trim();
  if (text.startsWith('```json')) text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  else if (text.startsWith('```')) text = text.replace(/^```\n?/, '').replace(/\n?```$/, '');

  const parsed = JSON.parse(text) as GeminiGraphJSON;

  if (!parsed.isGraphTraversal) {
    const reason = parsed.errorReason || "The content does not contain a graph traversal problem.";
    throw new NonGraphError(reason);
  }

  return parsed;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Analyzes an image for graph traversal content using Gemini Vision.
 * Throws NonGraphError if the image is not a graph traversal problem.
 */
export async function analyzeGraphImage(file: File): Promise<GeminiGraphJSON> {
  checkRateLimit();
  const apiKey = getApiKey();
  const model = getStructuredModel(apiKey);
  const imagePart = await fileToGenerativePart(file);

  try {
    const result = await model.generateContent([IMAGE_PROMPT, imagePart]);
    return parseAndValidate(result.response.text());
  } catch (err) {
    if (err instanceof NonGraphError) throw err;
    throw new Error(`Failed to process image with AI: ${(err as any)?.message || err}`);
  }
}

/**
 * Analyzes a pasted text problem for graph traversal content using Gemini.
 * Throws NonGraphError if the text is not a graph traversal problem.
 */
export async function analyzeGraphText(problemText: string, algorithm: string): Promise<GeminiGraphJSON> {
  checkRateLimit();
  const apiKey = getApiKey();
  const model = getStructuredModel(apiKey);

  try {
    const result = await model.generateContent(buildTextPrompt(problemText, algorithm));
    return parseAndValidate(result.response.text());
  } catch (err) {
    if (err instanceof NonGraphError) throw err;
    throw new Error(`Failed to process text with AI: ${(err as any)?.message || err}`);
  }
}

/**
 * Performs a deep structured analysis of a completed graph traversal simulation.
 */
export async function analyzeTraversal(
  algorithm: string,
  steps: { currentNode?: string; visited: string[]; stack: string[]; narration: string }[],
  lang: 'EN' | 'ID' = 'EN'
): Promise<string> {
  checkRateLimit();
  const apiKey = getApiKey();
  const model = getTextModel(apiKey);

  const traversalSummary = steps
    .map((s, i) => `Step ${i}: Node=${s.currentNode || 'N/A'}, Visited=[${s.visited.join(', ')}], Stack/Queue=[${s.stack.join(', ')}] — ${s.narration}`)
    .join('\n');

  const result = await model.generateContent(buildDeepAnalysisPrompt(algorithm, traversalSummary, lang));
  return result.response.text();
}


// ═══════════════════════════════════════════════════════════════════════════════
//  GRAMMAR / AUTOMATA AI — Formal Grammar Analysis
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Grammar response schema ──────────────────────────────────────────────────
const grammarSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    isGrammarProblem: { type: SchemaType.BOOLEAN },
    errorReason: { type: SchemaType.STRING },
    grammarRules: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING }
    },
    startSymbol: { type: SchemaType.STRING },
    suggestedAlgorithm: { type: SchemaType.STRING },
    languageDescription: { type: SchemaType.STRING },
  },
  required: ['isGrammarProblem', 'grammarRules', 'startSymbol', 'suggestedAlgorithm', 'languageDescription'],
};

// ─── Types ────────────────────────────────────────────────────────────────────
export interface GeminiGrammarJSON {
  isGrammarProblem: boolean;
  errorReason?: string;
  grammarRules: string[];   // e.g. ["S -> AB | a", "A -> b"]
  startSymbol: string;
  suggestedAlgorithm: string;    // "UNIT_REMOVAL" | "USELESS_REMOVAL" | "CNF"
  languageDescription: string;
}

export class NonGrammarError extends Error {
  constructor(reason: string) { super(reason); this.name = 'NonGrammarError'; }
}

// ─── Prompts ──────────────────────────────────────────────────────────────────
const GRAMMAR_IMAGE_PROMPT = `You are an expert in formal language theory and context-free grammars (CFG).

Analyze the uploaded image carefully.

STEP 1 — Validation:
Determine if the image contains a formal grammar problem.
This includes: production rules (A → BC), language descriptions (e.g. aⁿbⁿ), CFG diagrams, or automata theory exercises.
- Set "isGrammarProblem": true  if it IS a grammar/formal language problem.
- Set "isGrammarProblem": false if it is NOT (e.g. a photo, bar chart, or unrelated content).
- If false, set "errorReason" to a short clear explanation.
- If false, return empty grammarRules and STOP.

STEP 2 — Extraction (only if isGrammarProblem is true):
If the image shows explicit grammar rules: extract them verbatim.
If the image describes a language in natural language: design an appropriate CFG for that language.

Output:
- grammarRules: array of strings in format "S -> AB | a" (use single-character uppercase variables like S, A, B, C).
- startSymbol: the start symbol (usually "S").
- suggestedAlgorithm: one of "UNIT_REMOVAL", "USELESS_REMOVAL", or "CNF" — whichever is most relevant.
- languageDescription: a short (1 sentence) description of what language the grammar generates.

Return ONLY valid JSON matching the schema. No explanation outside JSON.`;

function buildGrammarTextPrompt(problemText: string, algorithm: string): string {
  return `You are an expert in formal language theory and context-free grammars (CFG).

A student has submitted the following problem or language description:
"""
${problemText}
"""

STEP 1 — Validation:
Determine if this describes a formal grammar or formal language problem.
This includes: requests to build a CFG, describe a language, or transform grammar rules.
- Set "isGrammarProblem": true  if it IS related to formal grammars/languages.
- Set "isGrammarProblem": false if it is NOT (e.g. a graph problem, essay, or unrelated topic).
- If false, set "errorReason" to a short clear explanation.
- If false, return empty grammarRules and STOP.

STEP 2 — Grammar Design (only if isGrammarProblem is true):
Design an appropriate Context-Free Grammar (CFG) for this language/problem.

Rules:
- Use single-character uppercase letters for variables (S, A, B, C, D, T).
- Use lowercase letters/symbols for terminals (a, b, c, 0, 1).
- Format each rule as "S -> AB | a" (alternatives separated by |).
- One variable per array element: ["S -> AB | a", "A -> b"].
- Prefer simpler grammars; avoid unnecessary variables.
- If the problem already provides grammar rules, extract them directly.

Output:
- grammarRules: array of production rule strings.
- startSymbol: the start symbol.
- suggestedAlgorithm: "${algorithm}" (or override with a more appropriate one: UNIT_REMOVAL, USELESS_REMOVAL, or CNF).
- languageDescription: one sentence describing the language generated.

Return ONLY valid JSON matching the schema. No explanation outside JSON.`;
}

function buildGrammarDeepAnalysisPrompt(
  algorithm: string,
  initialGrammar: string,
  finalGrammar: string,
  steps: string,
  lang: 'EN' | 'ID',
  problemContext?: string,
): string {
  const isID = lang === 'ID';
  const algoName: Record<string, string> = {
    UNIT_REMOVAL: isID ? 'Penghapusan Unit Production' : 'Unit Production Removal',
    USELESS_REMOVAL: isID ? 'Penghapusan Simbol Useless' : 'Useless Symbol Removal',
    CNF: 'Chomsky Normal Form (CNF) Conversion',
  };
  const name = algoName[algorithm] ?? algorithm;

  return `You are an expert computer science educator explaining formal grammar transformations to a university student.

Algorithm performed: ${name}
${problemContext ? `
Problem Context (original student problem):
${problemContext}
` : ''}Initial Grammar:
${initialGrammar}

Final Grammar:
${finalGrammar}

Transformation Steps:
${steps}

Write a complete deep analysis ${isID ? 'IN INDONESIAN (Bahasa Indonesia)' : 'IN ENGLISH'}.

Your response MUST follow this exact structure using these exact markers:

# [Write a specific title for this transformation — e.g. "${name} on Grammar G"]

## ${isID ? 'Gambaran Algoritma' : 'Algorithm Overview'}
${isID
      ? 'Satu paragraf menjelaskan: definisi algoritma yang digunakan, mengapa transformasi ini perlu dilakukan (urgensinya), dan apa dampak struktural utamanya terhadap aturan produksi dalam teori bahasa formal.'
      : 'One paragraph explaining: the definition of the algorithm used, why this transformation is necessary (its urgency), and its main structural impact on production rules in formal language theory.'}

## ${isID ? 'Analisis Transformasi' : 'Transformation Analysis'}
${isID
      ? 'Uraikan setiap langkah transformasi dari data pengubah secara kronologis. Gunakan format list berikut untuk SETIAP langkah penting:\n1. **Langkah N: [Nama Sub-Proses]**\n   * **Kondisi Awal:** Aturan produksi atau simbol yang ditargetkan.\n   * **Operasi/Aksi:** Penjelasan teknis mengenai apa yang dihapus, diganti, atau ditambahkan dan alasan logis di baliknya.\n   * **Hasil Aturan:** Tampilkan aturan produksi yang terbentuk setelah langkah ini selesai.'
      : 'Break down each transformation step from the data chronologically. Use the following list format for EVERY significant step:\n1. **Step N: [Sub-Process Name]**\n   * **Initial State:** Target production rules or symbols.\n   * **Operation/Action:** Technical explanation of what was removed, replaced, or added, and the rationale behind it.\n   * **Resulting Rules:** Show the production rules formed after this step is completed.'}

## ${isID ? 'Perbandingan Grammar' : 'Grammar Comparison'}
${isID
      ? 'Lakukan analisis komparatif antara grammar awal dan akhir dengan mencakup:\n* **Perubahan Komponen:** Bandingkan jumlah Variabel/Non-Terminal dan Aturan Produksi (apakah berkurang atau bertambah).\n* **Analisis Ekuivalensi:** Jelaskan mengapa bahasa (Language) yang dihasilkan oleh kedua grammar tetap sama (ekuivalen) meskipun bentuk mekanismenya berubah.\n* **Contoh Kasus:** Berikan satu contoh string pendek yang valid dan tunjukkan secara singkat bahwa string tersebut dapat diturunkan oleh kedua grammar.'
      : 'Perform a comparative analysis between the initial and final grammar by including:\n* **Component Changes:** Compare the set of Variables/Non-Terminals and Production Rules (whether they are reduced or expanded).\n* **Equivalence Analysis:** Explain why the language generated by both grammars remains identical (equivalent) despite the structural changes.\n* **Example Case:** Provide one short valid string example and briefly show that it can be derived by both grammars.'}

## ${isID ? 'Kesimpulan' : 'Conclusion'}
${isID
      ? 'Dua atau tiga kalimat yang menyimpulkan hasil akhir transformasi ini. Sebutkan secara spesifik relevansi bentuk akhir grammar ini dalam konteks hierarki Chomsky, proses parsing (seperti efisiensi implementasi pada LL/LR atau algoritma CYK jika relevan), atau pembuatan syntax analyzer pada compiler.'
      : 'Two or three sentences summarizing the final outcome of this transformation. Specifically mention the relevance of this final grammar form within the Chomsky hierarchy, parsing processes (such as implementation efficiency in LL/LR or the CYK algorithm if relevant), or syntax analyzer construction in compilers.'}

IMPORTANT: Use the exact markers # and ## as shown. Be precise and technically accurate.

CRITICAL FORMATTING RULES — STRICTLY FOLLOW THESE:
- Do NOT use LaTeX notation. Do NOT wrap any text in dollar signs ($).
- Do NOT use \\rightarrow, \\mid, \\epsilon, \\lambda, or any backslash LaTeX command.
- Use plain Unicode symbols instead: → for arrows, | for alternatives, ε for epsilon, ∈ for "in".
- Write grammar rules as plain text like: S → AB | a (NOT $S \\rightarrow AB \\mid a$).
- For superscripts write: a^n or aⁿ (Unicode). Never write $a^n$.
- For subscript variable names like D₁: write D1 or D₁ (Unicode). Never write $D_1$ or D_1.`;
}

// ─── Grammar model helper ─────────────────────────────────────────────────────
function getGrammarModel(apiKey: string) {
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: 'gemini-3-flash-preview',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: grammarSchema,
    },
  });
}

function parseGrammarResponse(jsonText: string): GeminiGrammarJSON {
  let text = jsonText.trim();
  if (text.startsWith('```json')) text = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  else if (text.startsWith('```')) text = text.replace(/^```\n?/, '').replace(/\n?```$/, '');
  const parsed = JSON.parse(text) as GeminiGrammarJSON;
  if (!parsed.isGrammarProblem) {
    throw new NonGrammarError(parsed.errorReason || 'The content does not contain a grammar problem.');
  }
  return parsed;
}

// ─── Public Grammar API ───────────────────────────────────────────────────────

/**
 * Reads grammar rules from an uploaded image using Gemini Vision.
 * Supports both explicit grammar rules and natural language language descriptions.
 * Throws NonGrammarError if the image is not grammar-related.
 */
export async function analyzeGrammarImage(file: File): Promise<GeminiGrammarJSON> {
  checkRateLimit();
  const apiKey = getApiKey();
  const model = getGrammarModel(apiKey);
  const imagePart = await fileToGenerativePart(file);
  try {
    const result = await model.generateContent([GRAMMAR_IMAGE_PROMPT, imagePart]);
    return parseGrammarResponse(result.response.text());
  } catch (err) {
    if (err instanceof NonGrammarError) throw err;
    throw new Error(`Failed to process image: ${(err as any)?.message || err}`);
  }
}

/**
 * Converts a natural language problem description ("soal cerita") into
 * grammar rules using Gemini.
 * Throws NonGrammarError if the text is not a grammar problem.
 */
export async function analyzeGrammarText(
  problemText: string,
  algorithm: string
): Promise<GeminiGrammarJSON> {
  checkRateLimit();
  const apiKey = getApiKey();
  const model = getGrammarModel(apiKey);
  try {
    const result = await model.generateContent(buildGrammarTextPrompt(problemText, algorithm));
    return parseGrammarResponse(result.response.text());
  } catch (err) {
    if (err instanceof NonGrammarError) throw err;
    throw new Error(`Failed to process text: ${(err as any)?.message || err}`);
  }
}

/**
 * Performs a deep analysis of a grammar transformation.
 */
export async function analyzeGrammarTransformation(
  algorithm: string,
  initialRules: { left: string; right: string[] }[],
  finalRules: { left: string; right: string[] }[],
  narrations: string[],
  lang: 'EN' | 'ID' = 'EN',
  problemContext?: string
): Promise<string> {
  checkRateLimit();
  const apiKey = getApiKey();
  const model = getTextModel(apiKey);

  const fmtGrammar = (g: { left: string; right: string[] }[]) =>
    g.map(r => `  ${r.left} → ${r.right.join(' | ')}`).join('\n');

  const stepsText = narrations
    .map((n, i) => `[${String(i).padStart(2, '0')}] ${n}`)
    .join('\n');

  const prompt = buildGrammarDeepAnalysisPrompt(
    algorithm,
    fmtGrammar(initialRules),
    fmtGrammar(finalRules),
    stepsText,
    lang,
    problemContext,
  );

  const result = await model.generateContent(prompt);
  return result.response.text();
}
