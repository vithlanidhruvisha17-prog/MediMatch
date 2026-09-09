import React from 'react';
import { cn } from '../../lib/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => {
  return (
    <div className={cn('flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth p-1', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm transition-all whitespace-nowrap focus:outline-none flex-shrink-0 rounded-2xl cursor-pointer',
              isActive
                ? 'bg-[#2dd4bf] text-slate-950 font-extrabold shadow-[0_0_25px_rgba(45,212,191,0.4)] transform scale-[1.02]'
                : 'text-slate-300 hover:text-white hover:bg-white/5 font-medium'
            )}
          >
            {tab.icon && <span className={cn(isActive ? 'text-slate-950' : 'text-slate-400')}>{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={cn(
                  'text-[11px] px-2 py-0.5 rounded-full font-bold transition-colors',
                  isActive ? 'bg-black/25 text-slate-950' : 'bg-black/40 text-teal-300 border border-white/10'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

