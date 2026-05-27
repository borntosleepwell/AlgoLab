export interface NodeData {
  id: string;
  x: number;
  y: number;
}

export interface EdgeData {
  source: string;
  target: string;
}

export interface SimulationStep {
  currentNode: string | null;
  visited: string[];
  stack: string[];
  narration: string;
  activeEdges: string[];
}

export interface GraphPipelineJSON {
  algorithm: string;
  steps: SimulationStep[];
}

/**
 * Parses raw text input into unique nodes and edges.
 * Example input:
 * A -> B
 * A -> C
 * B -> D
 */
export function parseGraphInput(input: string): { nodes: string[]; edges: EdgeData[] } {
  const edges: EdgeData[] = [];
  const nodeSet = new Set<string>();

  const lines = input.split('\n');
  for (const line of lines) {
    const parts = line.split('->').map((p) => p.trim());
    if (parts.length === 2 && parts[0] && parts[1]) {
      const source = parts[0];
      const target = parts[1];
      edges.push({ source, target });
      nodeSet.add(source);
      nodeSet.add(target);
    } else if (parts.length === 1 && parts[0]) {
      // Single node with no edges
      nodeSet.add(parts[0]);
    }
  }

  return { nodes: Array.from(nodeSet).sort(), edges };
}

/**
 * Positions nodes in a circle within the given dimensions.
 */
export function calculateCircularLayout(
  nodes: string[],
  width: number = 600,
  height: number = 600
): NodeData[] {
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 80; // 80px padding
  const nodeCount = nodes.length;

  return nodes.map((id, index) => {
    // start from top (-PI/2)
    const angle = (index / nodeCount) * 2 * Math.PI - Math.PI / 2;
    return {
      id,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  });
}

export function generateBFS(nodes: string[], edges: EdgeData[], startNode: string = nodes[0]): SimulationStep[] {
  if (!nodes.length) return [];

  const steps: SimulationStep[] = [];
  const visited = new Set<string>();
  const queue: string[] = [startNode];
  const adjList = new Map<string, string[]>();

  for (const node of nodes) {
    adjList.set(node, []);
  }
  for (const edge of edges) {
    if (adjList.has(edge.source)) {
      adjList.get(edge.source)!.push(edge.target);
    }
  }

  // Step 0: The Wow Moment
  steps.push({
    currentNode: null,
    visited: [],
    activeEdges: [],
    stack: [],
    narration: "> INITIALIZING BFS ENGINE\\n> GRAPH DEPTH DETECTED\\n> ENTERING COMPUTATIONAL SPACE",
  });

  steps.push({
    currentNode: null,
    visited: [],
    activeEdges: [],
    stack: [...queue],
    narration: `> ROOT NODE DETECTED: ${startNode}\\n> QUEUED FOR PROCESSING.`,
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (!visited.has(current)) {
      visited.add(current);
      const neighbors = adjList.get(current) || [];
      const unvisitedNeighbors = neighbors.filter(n => !visited.has(n));
      
      const activeEdges = unvisitedNeighbors.map(n => `${current}-${n}`);

      steps.push({
        currentNode: current,
        visited: Array.from(visited).filter(n => n !== current),
        activeEdges: [],
        stack: [current, ...queue],
        narration: `> PROCESSING: NODE ${current}\\n> ANALYZING ADJACENT VERTICES...`,
      });

      for (const neighbor of unvisitedNeighbors) {
        if (!queue.includes(neighbor)) {
          queue.push(neighbor);
        }
      }

      steps.push({
        currentNode: current,
        visited: Array.from(visited),
        activeEdges,
        stack: [...queue],
        narration: unvisitedNeighbors.length > 0 
          ? `> NEIGHBORS FOUND: ${unvisitedNeighbors.join(', ')}\\n> ENQUEUING.`
          : `> NO UNVISITED NEIGHBORS FOR ${current}.`,
      });
    }
  }

  steps.push({
    currentNode: null,
    visited: Array.from(visited),
    activeEdges: [],
    stack: [],
    narration: `> BFS TRAVERSAL COMPLETE.\\n> ALL REACHABLE NODES VISITED.`,
  });

  return steps;
}

export function generateDFS(nodes: string[], edges: EdgeData[], startNode: string = nodes[0]): SimulationStep[] {
  if (!nodes.length) return [];

  const steps: SimulationStep[] = [];
  const visited = new Set<string>();
  const stack: string[] = [startNode];
  const adjList = new Map<string, string[]>();

  for (const node of nodes) {
    adjList.set(node, []);
  }
  for (const edge of edges) {
    if (adjList.has(edge.source)) {
      adjList.get(edge.source)!.push(edge.target);
    }
  }

  // Step 0: The Wow Moment
  steps.push({
    currentNode: null,
    visited: [],
    activeEdges: [],
    stack: [],
    narration: "> INITIALIZING DFS ENGINE\\n> GRAPH DEPTH DETECTED\\n> ENTERING COMPUTATIONAL SPACE",
  });

  steps.push({
    currentNode: null,
    visited: [],
    activeEdges: [],
    stack: [...stack],
    narration: `> ROOT NODE DETECTED: ${startNode}\\n> PUSHED TO STACK.`,
  });

  while (stack.length > 0) {
    const current = stack.pop()!;
    
    if (!visited.has(current)) {
      steps.push({
        currentNode: current,
        visited: Array.from(visited),
        activeEdges: [],
        stack: [current, ...stack],
        narration: `> POPPING: NODE ${current}\\n> MARKING AS VISITED.`,
      });

      visited.add(current);
      const neighbors = adjList.get(current) || [];
      const unvisitedNeighbors = neighbors.filter(n => !visited.has(n));
      const activeEdges = unvisitedNeighbors.map(n => `${current}-${n}`);

      for (let i = unvisitedNeighbors.length - 1; i >= 0; i--) {
        stack.push(unvisitedNeighbors[i]);
      }

      steps.push({
        currentNode: current,
        visited: Array.from(visited),
        activeEdges,
        stack: [...stack],
        narration: unvisitedNeighbors.length > 0 
          ? `> NEIGHBORS FOUND: ${unvisitedNeighbors.join(', ')}\\n> PUSHING TO STACK.`
          : `> DEAD END AT ${current}. BACKTRACKING.`,
      });
    }
  }

  steps.push({
    currentNode: null,
    visited: Array.from(visited),
    activeEdges: [],
    stack: [],
    narration: `> DFS TRAVERSAL COMPLETE.\\n> GRAPH FULLY EXPLORED.`,
  });

  return steps;
}
