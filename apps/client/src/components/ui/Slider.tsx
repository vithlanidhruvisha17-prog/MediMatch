import React from 'react';
import { cn } from '../../lib/cn';

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  disabled?: boolean;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  disabled = false
}) => {
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className={cn('relative flex items-center select-none w-full py-2', className)}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 disabled:opacity-50"
        style={{
          background: `linear-gradient(to right, #2563EB 0%, #2563EB ${percentage}%, #E2E8F0 ${percentage}%, #E2E8F0 100%)`
        }}
      />
    </div>
  );
};

