import React from 'react';
import { cn } from '../../lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  variant?: 'default' | 'glass' | 'elevated' | 'subtle';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  variant = 'default',
  ...props
}) => {
  const variantStyles = {
    default: 'glass-card',
    glass: 'glass-panel',
    elevated: 'glass-card-glow',
    subtle: 'bg-[#081c38]/50 backdrop-blur-md border border-sky-400/20 shadow-none'
  };

  return (
    <div
      className={cn(
        'rounded-2xl overflow-hidden transition-all duration-300',
        variantStyles[variant],
        hover && 'card-lift cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

