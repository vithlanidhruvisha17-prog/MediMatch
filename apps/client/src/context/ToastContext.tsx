import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success', duration = 5000) => {
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newToast: ToastItem = { id, message, type };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Floating Toast Container (Top-right, below navbar, stays visible on scroll) */}
      <div
        aria-live="polite"
        className="fixed top-24 right-4 sm:right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-2xl bg-[#081a36]/90 backdrop-blur-2xl flex items-start gap-3 transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
              toast.type === 'success'
                ? 'border-emerald-400/40 shadow-[0_0_25px_rgba(52,211,153,0.25)]'
                : toast.type === 'error'
                ? 'border-rose-400/40 shadow-[0_0_25px_rgba(244,63,94,0.25)]'
                : 'border-sky-400/40 shadow-[0_0_25px_rgba(56,189,248,0.25)]'
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white">
                {toast.type === 'success'
                  ? 'Booking Confirmed'
                  : toast.type === 'error'
                  ? 'Action Failed'
                  : 'Notice'}
              </p>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors flex-shrink-0"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}
