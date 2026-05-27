export interface GrammarRule {
  left: string;
  right: string[];
}

export interface AutomataStep {
  currentGrammar: GrammarRule[];
  activeRules: string[];       // e.g. ["A->B"]  highlighted in yellow
  eliminatedRules: string[];   // e.g. ["A->B"]  struck-through in red
  newRules: string[];          // e.g. ["A->b","A->S"] newly added
  narration: string;           // System log message
  phase: string;               // Phase label shown in header
}

// ── Parser ────────────────────────────────────────────────────────────────────
export function parseGrammar(input: string): GrammarRule[] {
  const rules: GrammarRule[] = [];
  const lines = input.split('\n');
  for (const line of lines) {
    const clean = line.trim();
    if (!clean) continue;
    const sep = clean.includes('→') ? '→' : '->';
    const parts = clean.split(sep).map(p => p.trim());
    if (parts.length === 2) {
      const left = parts[0].trim();
      const right = parts[1].split('|').map(p => p.trim()).filter(Boolean);
      if (left && right.length > 0) rules.push({ left, right });
    }
  }
  return rules;
}

function deepCopy(g: GrammarRule[]): GrammarRule[] {
  return JSON.parse(JSON.stringify(g));
}

function isVar(s: string) { return s.length === 1 && s === s.toUpperCase() && /[A-Z]/.test(s); }

// ── Unit Production Removal ───────────────────────────────────────────────────
export function generateUnitRemovalSteps(initial: GrammarRule[]): AutomataStep[] {
  if (initial.length === 0) return [];
  const steps: AutomataStep[] = [];

  steps.push({
    currentGrammar: deepCopy(initial),
    activeRules: [], eliminatedRules: [], newRules: [],
    narration: 'Memulai penghapusan Unit Production. Memindai setiap aturan produksi untuk mencari produksi unit (A → B).',
    phase: 'INIT',
  });

  let grammar = deepCopy(initial);
  let changed = true;

  while (changed) {
    changed = false;
    for (const rule of grammar) {
      const unitProds = rule.right.filter(r => isVar(r) && r !== rule.left);
      for (const unit of unitProds) {
        // Highlight the unit production
        steps.push({
          currentGrammar: deepCopy(grammar),
          activeRules: [`${rule.left}->${unit}`],
          eliminatedRules: [], newRules: [],
          narration: `Ditemukan Unit Production: ${rule.left} → ${unit}. Mencari semua derivasi dari ${unit}.`,
          phase: 'DETECT',
        });

        const targetRule = grammar.find(r => r.left === unit);
        if (targetRule) {
          const toAdd = targetRule.right.filter(r => !rule.right.includes(r) && r !== rule.left);

          steps.push({
            currentGrammar: deepCopy(grammar),
            activeRules: targetRule.right.map(r => `${unit}->${r}`),
            eliminatedRules: [`${rule.left}->${unit}`],
            newRules: toAdd.map(r => `${rule.left}->${r}`),
            narration: `Menghapus ${rule.left} → ${unit}. Menyalin produksi ${unit}: { ${targetRule.right.join(' | ')} } ke ${rule.left}.`,
            phase: 'REPLACE',
          });

          // Apply
          rule.right = rule.right.filter(r => r !== unit);
          toAdd.forEach(r => { if (!rule.right.includes(r)) rule.right.push(r); });
          changed = true;

          steps.push({
            currentGrammar: deepCopy(grammar),
            activeRules: [], eliminatedRules: [],
            newRules: toAdd.map(r => `${rule.left}->${r}`),
            narration: `Grammar diperbarui. ${rule.left} sekarang menghasilkan: { ${rule.right.join(' | ')} }.`,
            phase: 'APPLY',
          });
        }
        break; // one at a time per pass
      }
      if (changed) break;
    }
  }

  steps.push({
    currentGrammar: deepCopy(grammar),
    activeRules: [], eliminatedRules: [], newRules: [],
    narration: 'Unit Production Removal selesai. Semua produksi unit telah dieliminasi dari grammar.',
    phase: 'DONE',
  });

  return steps;
}

// ── Useless Symbol Removal ────────────────────────────────────────────────────
export function generateUselessRemovalSteps(initial: GrammarRule[]): AutomataStep[] {
  if (initial.length === 0) return [];
  const steps: AutomataStep[] = [];

  steps.push({
    currentGrammar: deepCopy(initial),
    activeRules: [], eliminatedRules: [], newRules: [],
    narration: 'Fase 1: Menentukan variabel yang "generating" — variabel yang dapat menghasilkan string terminal.',
    phase: 'PHASE 1',
  });

  let grammar = deepCopy(initial);

  // Phase 1: generating variables
  const generating = new Set<string>();
  let changed = true;
  while (changed) {
    changed = false;
    for (const rule of grammar) {
      if (!generating.has(rule.left)) {
        const canGenerate = rule.right.some(r =>
          [...r].every(ch => !isVar(ch) || generating.has(ch))
        );
        if (canGenerate) { generating.add(rule.left); changed = true; }
      }
    }
  }

  const nonGenerating = grammar.map(r => r.left).filter(v => !generating.has(v));

  if (nonGenerating.length > 0) {
    const elim = grammar.flatMap(r =>
      r.right.some(rr => [...rr].some(ch => isVar(ch) && nonGenerating.includes(ch)))
        ? r.right.filter(rr => [...rr].some(ch => isVar(ch) && nonGenerating.includes(ch)))
            .map(rr => `${r.left}->${rr}`)
        : []
    ).concat(nonGenerating.flatMap(v => grammar.find(r => r.left === v)?.right.map(r => `${v}->${r}`) ?? []));

    steps.push({
      currentGrammar: deepCopy(grammar),
      activeRules: [...generating].flatMap(v => grammar.find(r => r.left === v)?.right.map(r => `${v}->${r}`) ?? []),
      eliminatedRules: elim,
      newRules: [],
      narration: `Variabel non-generating ditemukan: { ${nonGenerating.join(', ')} }. Menghapus semua aturan yang mengandung simbol ini.`,
      phase: 'NON-GEN',
    });

    grammar = grammar
      .map(r => ({
        ...r,
        right: r.right.filter(rr => [...rr].every(ch => !isVar(ch) || generating.has(ch)))
      }))
      .filter(r => generating.has(r.left) && r.right.length > 0);
  } else {
    steps.push({
      currentGrammar: deepCopy(grammar),
      activeRules: [], eliminatedRules: [], newRules: [],
      narration: 'Semua variabel dapat menghasilkan string terminal. Tidak ada simbol non-generating.',
      phase: 'PHASE 1',
    });
  }

  steps.push({
    currentGrammar: deepCopy(grammar),
    activeRules: [], eliminatedRules: [], newRules: [],
    narration: 'Fase 2: Analisis keterjangkauan (reachability) dari simbol awal S.',
    phase: 'PHASE 2',
  });

  // Phase 2: reachable
  const startSym = grammar[0]?.left ?? 'S';
  const reachable = new Set<string>([startSym]);
  changed = true;
  while (changed) {
    changed = false;
    for (const rule of grammar) {
      if (reachable.has(rule.left)) {
        for (const r of rule.right) {
          for (const ch of r) {
            if (isVar(ch) && !reachable.has(ch)) { reachable.add(ch); changed = true; }
          }
        }
      }
    }
  }

  const unreachable = grammar.map(r => r.left).filter(v => !reachable.has(v));

  if (unreachable.length > 0) {
    steps.push({
      currentGrammar: deepCopy(grammar),
      activeRules: [],
      eliminatedRules: unreachable.flatMap(v => grammar.find(r => r.left === v)?.right.map(r => `${v}->${r}`) ?? []),
      newRules: [],
      narration: `Variabel tidak terjangkau: { ${unreachable.join(', ')} }. Menghapus semua aturan produksinya.`,
      phase: 'UNREACHABLE',
    });

    grammar = grammar.filter(r => reachable.has(r.left));
  } else {
    steps.push({
      currentGrammar: deepCopy(grammar),
      activeRules: [], eliminatedRules: [], newRules: [],
      narration: 'Semua variabel dapat dijangkau dari simbol awal S.',
      phase: 'PHASE 2',
    });
  }

  steps.push({
    currentGrammar: deepCopy(grammar),
    activeRules: [], eliminatedRules: [], newRules: [],
    narration: 'Penghapusan simbol useless selesai. Grammar telah disederhanakan dan siap untuk transformasi lanjutan.',
    phase: 'DONE',
  });

  return steps;
}

// ── CNF Conversion ────────────────────────────────────────────────────────────
export function generateCNFSteps(initial: GrammarRule[]): AutomataStep[] {
  if (initial.length === 0) return [];
  const steps: AutomataStep[] = [];

  steps.push({
    currentGrammar: deepCopy(initial),
    activeRules: [], eliminatedRules: [], newRules: [],
    narration: 'Memulai konversi ke Chomsky Normal Form (CNF). CNF mensyaratkan setiap aturan berbentuk A→BC atau A→a.',
    phase: 'INIT',
  });

  let grammar = deepCopy(initial);
  let counter = 1;

  // Step: replace terminals in long rules
  const termMap: Record<string, string> = {};
  const getTermVar = (t: string) => {
    if (!termMap[t]) { termMap[t] = `T${counter++}`; }
    return termMap[t];
  };

  const longRules = grammar.filter(r => r.right.some(rr => rr.length > 1));
  if (longRules.length > 0) {
    steps.push({
      currentGrammar: deepCopy(grammar),
      activeRules: longRules.flatMap(r => r.right.filter(rr => rr.length > 1).map(rr => `${r.left}->${rr}`)),
      eliminatedRules: [], newRules: [],
      narration: 'Fase 1: Mengisolasi terminal dalam aturan panjang. Setiap terminal a dalam aturan panjang diganti dengan variabel baru Tₐ.',
      phase: 'TERM ISOLATION',
    });

    const added: GrammarRule[] = [];
    grammar = grammar.map(r => ({
      ...r,
      right: r.right.map(rr => {
        if (rr.length <= 1) return rr;
        return [...rr].map(ch => {
          if (!isVar(ch)) {
            const tv = getTermVar(ch);
            if (!added.find(a => a.left === tv)) added.push({ left: tv, right: [ch] });
            return tv;
          }
          return ch;
        }).join('');
      })
    }));
    grammar.push(...added);

    steps.push({
      currentGrammar: deepCopy(grammar),
      activeRules: [], eliminatedRules: [],
      newRules: added.map(r => `${r.left}->${r.right[0]}`),
      narration: `Variabel terminal baru ditambahkan: { ${Object.entries(termMap).map(([t,v]) => `${v}→${t}`).join(', ')} }.`,
      phase: 'TERM ISOLATION',
    });
  }

  // Step: break rules with >2 vars
  const longVarRules = grammar.filter(r => r.right.some(rr => rr.length > 2));
  if (longVarRules.length > 0) {
    steps.push({
      currentGrammar: deepCopy(grammar),
      activeRules: longVarRules.flatMap(r => r.right.filter(rr => rr.length > 2).map(rr => `${r.left}->${rr}`)),
      eliminatedRules: [], newRules: [],
      narration: 'Fase 2: Memecah aturan dengan lebih dari 2 variabel menggunakan variabel biner baru (binarization).',
      phase: 'BINARIZE',
    });

    const newRules: GrammarRule[] = [];
    grammar = grammar.map(r => ({
      ...r,
      right: r.right.flatMap(rr => {
        if (rr.length <= 2) return [rr];
        // binarize
        const chars = [...rr];
        let result = chars[chars.length - 1];
        const added: string[] = [];
        for (let i = chars.length - 2; i > 0; i--) {
          const nv = `D${counter++}`;
          newRules.push({ left: nv, right: [chars[i] + result] });
          added.push(`${nv}->${chars[i]}${result}`);
          result = nv;
        }
        return [chars[0] + result];
      })
    }));
    grammar.push(...newRules);

    steps.push({
      currentGrammar: deepCopy(grammar),
      activeRules: [], eliminatedRules: [],
      newRules: newRules.map(r => `${r.left}->${r.right[0]}`),
      narration: 'Binarization selesai. Semua aturan kini memiliki tepat 2 simbol di sisi kanan.',
      phase: 'BINARIZE',
    });
  }

  steps.push({
    currentGrammar: deepCopy(grammar),
    activeRules: [], eliminatedRules: [], newRules: [],
    narration: 'Konversi ke Chomsky Normal Form selesai. Setiap aturan kini berbentuk A→BC atau A→a.',
    phase: 'DONE',
  });

  return steps;
}

// ── String Acceptance (CYK) ───────────────────────────────────────────────────
export interface CYKResult {
  accepted: boolean;
  table: string[][][];   // [row][col] = list of vars that can derive the substring
  input: string;
}

export function testStringCYK(grammar: GrammarRule[], input: string, startSymbol: string): CYKResult {
  const n = input.length;
  if (n === 0) {
    const accepted = grammar.some(r => r.left === startSymbol && r.right.includes('ε'));
    return { accepted, table: [[[]]], input };
  }

  // Build table
  const table: string[][][] = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => [])
  );

  // Fill diagonal (length-1 substrings)
  for (let i = 0; i < n; i++) {
    const ch = input[i];
    for (const rule of grammar) {
      if (rule.right.includes(ch) && !table[i][i].includes(rule.left)) {
        table[i][i].push(rule.left);
      }
    }
  }

  // Fill rest
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      for (let k = i; k < j; k++) {
        for (const rule of grammar) {
          for (const rr of rule.right) {
            if (rr.length === 2) {
              const [B, C] = [rr[0], rr[1]];
              if (table[i][k].includes(B) && table[k + 1][j].includes(C)) {
                if (!table[i][j].includes(rule.left)) table[i][j].push(rule.left);
              }
            }
          }
        }
      }
    }
  }

  return {
    accepted: table[0][n - 1].includes(startSymbol),
    table,
    input,
  };
}
