import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, FastForward } from 'lucide-react';

interface SimulationControlsProps {
  isPlaying: boolean;
  speed: number;
  onPlayPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

export function SimulationControls({
  isPlaying,
  speed,
  onPlayPause,
  onStepForward,
  onStepBackward,
  onReset,
  onSpeedChange
}: SimulationControlsProps) {
  const handleSpeedToggle = () => {
    if (speed === 1) onSpeedChange(2);
    else if (speed === 2) onSpeedChange(0.5);
    else onSpeedChange(1);
  };

  return (
    <div className="flex items-center gap-6">
      <ControlButton onClick={onReset} icon={<RotateCcw size={16} />} label="RST" />
      <ControlButton onClick={onStepBackward} icon={<SkipBack size={16} />} label="PRV" />
      <ControlButton
        onClick={onPlayPause}
        icon={isPlaying ? <Pause size={20} /> : <Play size={20} />}
        label={isPlaying ? 'PAUSE' : 'PLAY'}
        primary
      />
      <ControlButton onClick={onStepForward} icon={<SkipForward size={16} />} label="NXT" />
      <ControlButton
        onClick={handleSpeedToggle}
        icon={<FastForward size={16} />}
        label={`${speed}X`}
      />
    </div>
  );
}

function ControlButton({
  onClick,
  icon,
  label,
  primary = false
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  primary?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 transition-all group ${
        primary
          ? 'text-foreground'
          : 'text-mono-500 hover:text-foreground'
      }`}
      aria-label={label}
    >
      <span className={`transition-transform group-hover:scale-110 ${primary ? 'group-hover:scale-110' : ''}`}>
        {icon}
      </span>
      <span className="font-mono text-[8px] tracking-widest uppercase leading-none">
        {label}
      </span>
    </button>
  );
}
