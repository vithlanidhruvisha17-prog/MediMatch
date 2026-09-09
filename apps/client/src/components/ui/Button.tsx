import React from 'react';
import { cn } from '../../lib/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'dark' | 'outline' | 'ghost' | 'success' | 'danger' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none rounded-xl active:scale-[0.98]';

  const variants = {
    primary: 'bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white focus:ring-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.3)] hover:shadow-[0_0_28px_rgba(56,189,248,0.5)] border border-cyan-400/40',
    dark: 'bg-[#091b35] hover:bg-[#0c2448] text-white focus:ring-sky-500 border border-sky-400/25',
    outline: 'border border-sky-400/35 bg-[#0b203e]/60 backdrop-blur-md hover:bg-sky-500/20 text-sky-100 hover:text-white focus:ring-sky-400 shadow-xs hover:border-sky-400/60',
    ghost: 'bg-transparent hover:bg-sky-500/15 text-slate-300 hover:text-white focus:ring-sky-400',
    success: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white focus:ring-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-emerald-400/40',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.3)] border border-rose-400/40',
    glass: 'bg-[#0c2547]/60 backdrop-blur-md hover:bg-[#0f2d57]/80 text-white border border-sky-400/40 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(56,189,248,0.3)] focus:ring-sky-400'
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 h-8',
    md: 'text-sm px-4.5 py-2 gap-2 h-10',
    lg: 'text-base px-6 py-2.5 gap-2.5 h-12'
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
      {children}
    </button>
  );
};

