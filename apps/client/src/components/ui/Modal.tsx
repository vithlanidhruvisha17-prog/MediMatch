import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'lg'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={cn(
          'glass-panel rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] w-full max-h-[92dvh] flex flex-col border border-sky-400/40 overflow-hidden relative backdrop-blur-2xl text-slate-100',
          maxWidths[maxWidth]
        )}
      >
        {(title || subtitle) && (
          <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-sky-400/25 flex items-start justify-between bg-[#081a36]/70 backdrop-blur-md">
            <div>
              {title && <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">{title}</h3>}
              {subtitle && <p className="text-xs text-sky-300/70 mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors flex-shrink-0 ml-2 border border-transparent hover:border-sky-400/30"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-[#091f3d]/60">{children}</div>
      </div>
    </div>
  );
};

