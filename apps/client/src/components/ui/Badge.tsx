import React from 'react';
import { cn } from '../../lib/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'primary' | 'dark' | 'warning' | 'danger' | 'outline' | 'neutral';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'neutral',
  size = 'md',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-semibold rounded-full select-none tracking-tight';

  const variants = {
    success: 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/35 shadow-[0_0_10px_rgba(16,185,129,0.2)]',
    primary: 'bg-sky-500/15 text-sky-300 border border-sky-400/35 shadow-[0_0_10px_rgba(56,189,248,0.2)]',
    dark: 'bg-[#081b36] text-slate-200 border border-sky-400/25',
    warning: 'bg-amber-500/15 text-amber-300 border border-amber-400/35',
    danger: 'bg-rose-500/15 text-rose-300 border border-rose-400/35',
    outline: 'bg-white/5 text-slate-200 border border-sky-400/30 backdrop-blur-sm',
    neutral: 'bg-slate-800/60 text-slate-300 border border-slate-700/60'
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5'
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
};

