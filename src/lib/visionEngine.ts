export type PixelData = number; // 0-255 grayscale
export type Kernel = number[][];

export interface VisionStep {
  id: string;
  narration: string;
  type: 'GRAYSCALE' | 'CONVOLUTION' | 'EDGE_DETECT' | 'SUMMARY';
  kernel?: Kernel;
  kernelName?: string;
  targetPixel?: { x: number; y: number };
  neighborhood?: PixelData[][];
  calculationResult?: number;
}

export const SOBEL_X: Kernel = [
  [-1, 0, 1],
  [-2, 0, 2],
  [-1, 0, 1]
];

export const PREWITT_X: Kernel = [
  [-1, 0, 1],
  [-1, 0, 1],
  [-1, 0, 1]
];

export const ROBERTS_X: Kernel = [
  [1, 0],
  [0, -1]
];

export const generateMockVisionSteps = (operator: string): VisionStep[] => {
  const steps: VisionStep[] = [];
  
  steps.push({
    id: 'step-0',
    narration: "> INITIALIZING VISION LAB...\n> LOADING IMAGE DATA...\n> CONVERTING TO GRAYSCALE MATRIX.",
    type: 'GRAYSCALE'
  });

  if (operator === 'GRAYSCALE') {
    steps.push({
      id: 'step-1',
      narration: "> GRAYSCALE CONVERSION COMPLETE.\n> READY FOR INSPECTION.",
      type: 'SUMMARY'
    });
    return steps;
  }

  let selectedKernel: Kernel = SOBEL_X;
  if (operator === 'PREWITT') selectedKernel = PREWITT_X;
  if (operator === 'ROBERTS') selectedKernel = ROBERTS_X;

  steps.push({
    id: 'step-1',
    narration: `> APPLYING ${operator} OPERATOR.\n> KERNEL MATRIX LOADED.\n> INITIATING CONVOLUTION SWEEP.`,
    type: 'CONVOLUTION',
    kernel: selectedKernel,
    kernelName: operator
  });

  // Mock a few pixel sweeps
  steps.push({
    id: 'step-2',
    narration: "> ANALYZING LOCAL NEIGHBORHOOD [X: 12, Y: 45]\n> COMPUTING DOT PRODUCT WITH KERNEL.",
    type: 'CONVOLUTION',
    kernel: selectedKernel,
    kernelName: operator,
    targetPixel: { x: 12, y: 45 },
    neighborhood: [
      [120, 125, 130],
      [110, 115, 120],
      [100, 105, 110]
    ],
    calculationResult: 45 // Mock result
  });

  steps.push({
    id: 'step-3',
    narration: "> ANALYZING LOCAL NEIGHBORHOOD [X: 13, Y: 45]\n> DETECTING INTENSITY GRADIENT.",
    type: 'CONVOLUTION',
    kernel: selectedKernel,
    kernelName: operator,
    targetPixel: { x: 13, y: 45 },
    neighborhood: [
      [125, 130, 200],
      [115, 120, 190],
      [105, 110, 180]
    ],
    calculationResult: 180 // High edge response
  });

  steps.push({
    id: 'step-4',
    narration: "> EDGE DETECTION SWEEP COMPLETE.\n> NORMALIZING MAGNITUDES.\n> RENDER READY.",
    type: 'EDGE_DETECT',
    kernel: selectedKernel,
    kernelName: operator
  });

  return steps;
};
