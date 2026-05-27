import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface TerminalProps {
  text: string;
  className?: string;
  speed?: number;
}

export function Terminal({ text, className, speed = 30 }: TerminalProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setDisplayedText('');
    setCurrentIndex(0);
  }, [text]);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed + (Math.random() * 20)); // slight randomness for realistic typing
      
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text, speed]);

  return (
    <div className={cn("font-mono text-[10px] text-foreground bg-mono-950 border border-border/20 p-5 w-full relative uppercase tracking-widest", className)}>
      <div className="absolute top-0 left-0 w-full flex justify-between px-2 -mt-[5px]">
        <div className="w-2 h-2 border border-border/50 bg-mono-950" />
        <div className="w-2 h-2 border border-border/50 bg-mono-950" />
      </div>
      <div className="flex gap-4 mb-4 border-b border-border/20 pb-2">
        <span className="text-foreground">SYSTEM_LOG</span>
        <span className="text-mono-500">Y_2026</span>
      </div>
      <div className="min-h-[4rem] leading-loose">
        <span className="text-mono-500 mr-3">[{'>'}]</span>
        <span>{displayedText}</span>
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          className="inline-block w-[6px] h-[12px] bg-foreground ml-2 align-middle"
        />
      </div>
    </div>
  );
}
