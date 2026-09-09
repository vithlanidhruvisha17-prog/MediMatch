import React from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { cn } from '../../lib/cn';

interface Step {
  number: number;
  label: string;
}

interface StepperProps {
  currentStep: number;
  steps?: Step[];
  onStepClick?: (step: number) => void;
}

const DEFAULT_STEPS: Step[] = [
  { number: 1, label: 'Profile' },
  { number: 2, label: 'Illness Details' },
  { number: 3, label: 'AI Diagnosis' }
];

export const Stepper: React.FC<StepperProps> = ({
  currentStep,
  steps = DEFAULT_STEPS,
  onStepClick
}) => {
  return (
    <div className="flex items-center justify-center space-x-2 sm:space-x-4 py-4 w-full">
      {steps.map((step, index) => {
        const isCompleted = currentStep > step.number;
        const isCurrent = currentStep === step.number;
        const isAccessible = onStepClick && step.number <= currentStep;

        return (
          <React.Fragment key={step.number}>
            <button
              type="button"
              disabled={!isAccessible}
              onClick={() => isAccessible && onStepClick?.(step.number)}
              className={cn(
                'flex items-center gap-2.5 text-sm font-semibold transition-all duration-200 focus:outline-none',
                isAccessible ? 'cursor-pointer' : 'cursor-default',
                isCurrent && 'text-cyan-400',
                isCompleted && 'text-slate-200 hover:text-cyan-300',
                !isCurrent && !isCompleted && 'text-slate-500'
              )}
            >
              <div
                className={cn(
                  'w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 shadow-sm',
                  isCompleted && 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white shadow-emerald-500/30 shadow-md border border-emerald-400/40',
                  isCurrent && 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white ring-4 ring-cyan-500/30 shadow-md shadow-cyan-500/40 scale-105 border border-cyan-300/60',
                  !isCurrent && !isCompleted && 'bg-[#091e3b]/80 text-slate-400 border border-sky-400/20'
                )}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3] animate-fade-in" /> : step.number}
              </div>
              <span className={cn(
                'hidden sm:inline font-semibold tracking-tight transition-colors',
                isCurrent ? 'text-cyan-300 font-bold' : isCompleted ? 'text-slate-200' : 'text-slate-500'
              )}>
                {step.label}
              </span>
            </button>

            {index < steps.length - 1 && (
              <div className="flex items-center px-1 sm:px-2">
                <div
                  className={cn(
                    'w-6 sm:w-12 h-0.5 rounded-full transition-all duration-300',
                    currentStep > step.number
                      ? 'bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 shadow-[0_0_8px_rgba(56,189,248,0.4)]'
                      : 'bg-slate-700/60'
                  )}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

