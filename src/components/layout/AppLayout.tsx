import React from 'react';
import { cn } from '../../lib/utils';

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AppLayout({ children, className }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground relative flex flex-col font-sans transition-colors duration-500">
      {/* Dot Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-dot-grid" />
      
      {/* Main Content Area */}
      <main className={cn("relative z-10 flex-1 flex flex-col w-full max-w-[1400px] mx-auto border-x border-border/20 px-4 sm:px-8 lg:px-12", className)}>
        {children}
      </main>
    </div>
  );
}
