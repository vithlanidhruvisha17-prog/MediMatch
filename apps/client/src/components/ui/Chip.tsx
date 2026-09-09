import React from 'react';
import { cn } from '../../lib/cn';
import { Check } from 'lucide-react';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  variant?: 'blue' | 'dark';
  size?: 'sm' | 'md';
}

export const Chip: React.FC<ChipProps> = ({
  children,
  className,
  selected = false,
  variant = 'blue',
  size = 'md',
  onClick,
  type = 'button',
  ...props
}) => {
  const isBlue = variant === 'blue';

  const baseStyles = 'inline-flex items-center gap-1.5 font-medium transition-all duration-150 rounded-full cursor-pointer select-none focus:outline-none border text-left';

  const sizes = {
    sm: 'text-xs px-3 py-1',
    md: 'text-sm px-3.5 py-1.5'
  };

  const activeStyles = isBlue
    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.4)]'
    : 'bg-[#0e274b] text-white border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.3)]';

  const inactiveStyles = 'bg-[#0b1f3c]/70 text-slate-300 border-sky-400/25 hover:bg-[#0e274b] hover:border-sky-400/50 hover:text-white backdrop-blur-md';

  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(baseStyles, sizes[size], selected ? activeStyles : inactiveStyles, className)}
      {...props}
    >
      {selected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
      <span>{children}</span>
    </button>
  );
};

