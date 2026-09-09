import React from 'react';
import { useAssessmentWizard } from '../../context/AssessmentWizardContext';
import { Stepper } from '../../components/ui/Stepper';
import { StepProfile } from '../../components/assessment/StepProfile';
import { StepIllness } from '../../components/assessment/StepIllness';
import { StepDiagnosis } from '../../components/assessment/StepDiagnosis';
import { Sparkles, ShieldCheck, HeartHandshake } from 'lucide-react';

export const AssessmentPage: React.FC = () => {
  const { currentStep, setCurrentStep } = useAssessmentWizard();

  return (
    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-80 gradient-glow-primary pointer-events-none -z-10 opacity-80" />

      {/* Title & Badge */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill border border-sky-400/35 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-3.5 shadow-[0_0_15px_rgba(56,189,248,0.25)]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse-subtle" />
          <span>AI-Powered Surgical Financial Counseling</span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
          AI Surgical Need Prediction & Cost Matching
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mt-2 leading-relaxed">
          Report your illness and symptoms to receive predicted surgical indications, urgency priority, and itemized packages across accredited hospitals under your budget.
        </p>
      </div>

      {/* Stepper Header */}
      <div className="glass-panel rounded-2xl px-6 py-2.5 shadow-[0_0_30px_rgba(56,189,248,0.15)] border border-sky-400/35 mb-8 backdrop-blur-2xl">
        <Stepper
          currentStep={currentStep}
          onStepClick={(step) => {
            // Only allow clicking back to completed steps
            if (step < currentStep) setCurrentStep(step as 1 | 2 | 3);
          }}
        />
      </div>

      {/* Wizard Step Content */}
      <div className="animate-fade-in-up transition-all duration-300">
        {currentStep === 1 && <StepProfile />}
        {currentStep === 2 && <StepIllness />}
        {currentStep === 3 && <StepDiagnosis />}
      </div>
    </div>
  );
};

