import { useState, useEffect } from 'react';
import { earthFrames } from './earthFrames';

export function AsciiEarthAnimation() {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    // 50ms playback interval with 300 finely-stepped frames creates a slow & smooth effect
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % earthFrames.length);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-[#141414] text-white/80 font-mono text-[8px] sm:text-[10px] md:text-[12px] leading-[10px] sm:leading-[12px] md:leading-[14px] flex items-center justify-center whitespace-pre overflow-hidden">
      <div className="animate-pulse">
        {earthFrames[frameIndex]}
      </div>
    </div>
  );
}
