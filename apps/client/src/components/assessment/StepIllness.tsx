import React, { useState } from 'react';
import { useAssessmentWizard } from '../../context/AssessmentWizardContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
import { Slider } from '../ui/Slider';
import {
  CONDITION_CATEGORIES,
  SYMPTOM_LIST,
  PRE_EXISTING_CONDITIONS,
  DURATION_OPTIONS,
  validateClinicalInput
} from '@medimatch/shared';
import {
  ArrowLeft,
  Sparkles,
  AlertCircle,
  FileText,
  Clock,
  Gauge,
  Activity,
  ShieldAlert,
  ClipboardList,
  CheckCircle2
} from 'lucide-react';

export const StepIllness: React.FC = () => {
  const {
    illness,
    updateIllness,
    toggleSymptom,
    togglePreExisting,
    submitAssessment,
    isSubmitting,
    submissionError,
    setCurrentStep
  } = useAssessmentWizard();

  const [validationError, setValidationError] = useState<string | null>(null);

  const validationResult = validateClinicalInput(illness.illnessText, illness.symptoms);
  const textLength = (illness.illnessText || '').trim().length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validationResult.isValid) {
      setValidationError(validationResult.reason || 'Please describe your illness or primary symptoms in detail.');
      return;
    }
    setValidationError(null);
    await submitAssessment();
  };

  const getSeverityLabel = (val: number) => {
    if (val <= 3) return { label: 'Mild Discomfort (1-3)', color: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/40 shadow-[0_0_8px_rgba(16,185,129,0.25)]' };
    if (val <= 7) return { label: 'Moderate Impairment (4-7)', color: 'bg-amber-500/15 text-amber-300 border-amber-400/40 shadow-[0_0_8px_rgba(245,158,11,0.25)]' };
    return { label: 'Severe / Acute Limitation (8-10)', color: 'bg-rose-500/15 text-rose-300 border-rose-400/40 shadow-[0_0_8px_rgba(244,63,94,0.25)]' };
  };

  const severityBadge = getSeverityLabel(illness.severity);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Primary Complaint & Condition Section */}
      <Card className="p-6 sm:p-8 glass-panel border border-sky-400/35 shadow-[0_0_35px_rgba(56,189,248,0.2)] rounded-3xl backdrop-blur-2xl">
        <div className="border-b border-sky-400/20 pb-5 mb-6">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <FileText className="w-4 h-4" />
            <span>Clinical Reporting</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Illness & Diagnosis Context</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
            Describe what you are experiencing in your own words, and optionally select a suspected diagnosis.
          </p>
        </div>

        <div className="space-y-5">
          {/* Free-text Description */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                Describe Your Illness & Symptoms in Detail <span className="text-rose-400">*</span>
              </label>
              <span className={`text-[11px] font-mono font-semibold ${
                textLength >= 15 && validationResult.isValid ? 'text-emerald-400' : textLength > 0 ? 'text-amber-400' : 'text-slate-400'
              }`}>
                {textLength}/15 min chars
              </span>
            </div>
            <textarea
              rows={4}
              value={illness.illnessText}
              onChange={(e) => {
                updateIllness({ illnessText: e.target.value });
                if (validationError) setValidationError(null);
              }}
              placeholder="e.g. Experiencing persistent, debilitating pain in the right knee especially when climbing stairs or walking for more than 10 minutes. Doctor recommended knee replacement. Crepitus and morning stiffness observed."
              className={`w-full p-3.5 glass-input rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none transition-all resize-none leading-relaxed ${
                validationError || (textLength > 0 && !validationResult.isValid)
                  ? 'border-rose-400/60 focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30'
                  : textLength >= 15
                  ? 'border-emerald-400/50 focus:border-emerald-400'
                  : ''
              }`}
            />
            
            {/* Real-time Guidance / Error Display */}
            {validationError ? (
              <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1.5 font-medium bg-rose-500/10 border border-rose-500/25 px-3 py-1.5 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{validationError}</span>
              </p>
            ) : textLength > 0 && !validationResult.isValid ? (
              <p className="text-xs text-amber-300 mt-1.5 flex items-center gap-1.5 font-medium bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-400" />
                <span>{validationResult.reason}</span>
              </p>
            ) : textLength >= 15 && validationResult.isValid ? (
              <p className="text-xs text-emerald-300 mt-1.5 flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Clinical description meets AI evaluation criteria.</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">
                Note: Generic placeholders like &quot;NA&quot;, &quot;none&quot;, or random text are rejected by the AI counselor. Please provide meaningful symptoms.
              </p>
            )}
          </div>

          {/* Grouped Condition Master Dropdown & Condition Detail */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                Common Condition / Diagnosis Master List
              </label>
              <select
                value={illness.conditionKey}
                onChange={(e) => updateIllness({ conditionKey: e.target.value })}
                className="w-full p-3 glass-input rounded-xl text-sm text-white bg-[#081c38] border border-sky-400/30 focus:outline-none transition-all cursor-pointer font-medium"
              >
                <option value="" className="bg-[#071326] text-slate-400">-- Select suspected condition (or leave blank for AI to diagnose) --</option>
                {CONDITION_CATEGORIES.map((cat) => (
                  <optgroup key={cat.category} label={cat.category} className="bg-[#071326] text-cyan-300 font-bold">
                    {cat.conditions.map((cond) => (
                      <option key={cond} value={cond} className="bg-[#071326] text-white">
                        {cond}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                Condition Details / Sub-Type (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Grade IV Osteoarthritis, Medial Compartment"
                value={illness.conditionDetail}
                onChange={(e) => updateIllness({ conditionDetail: e.target.value })}
                className="w-full p-3 glass-input rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Duration & Severity Section */}
      <Card className="p-6 sm:p-8 glass-panel border border-sky-400/35 shadow-[0_0_35px_rgba(56,189,248,0.2)] rounded-3xl backdrop-blur-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Duration Button Group */}
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200 mb-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Symptom Duration</span>
            </div>
            <p className="text-xs text-slate-400 mb-3">How long have you been experiencing these clinical signs?</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DURATION_OPTIONS.map((dur) => (
                <button
                  key={dur}
                  type="button"
                  onClick={() => updateIllness({ durationBucket: dur })}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all text-center active:scale-95 ${
                    illness.durationBucket === dur
                      ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                      : 'glass-pill text-slate-300 border-sky-400/25 hover:bg-sky-500/15'
                  }`}
                >
                  {dur}
                </button>
              ))}
            </div>
          </div>

          {/* Severity Slider 1-10 */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200">
                <Gauge className="w-4 h-4 text-cyan-400" />
                <span>Severity Score (1 – 10)</span>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${severityBadge.color}`}>
                {severityBadge.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2">
              Rate how severely this illness impacts your mobility or daily life.
            </p>

            <Slider
              min={1}
              max={10}
              step={1}
              value={illness.severity}
              onChange={(val) => updateIllness({ severity: val })}
              className="my-3"
            />

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>1 - Mild</span>
              <span>5 - Moderate</span>
              <span>10 - Critical / Debilitating</span>
            </div>
          </div>
        </div>
      </Card>

      {/* 40-Symptom Chip Multi-Select Grid */}
      <Card className="p-6 sm:p-8 glass-panel border border-sky-400/35 shadow-[0_0_35px_rgba(56,189,248,0.2)] rounded-3xl backdrop-blur-2xl">
        <div className="border-b border-sky-400/20 pb-4 mb-4 flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <Activity className="w-4 h-4" />
              <span>Symptom Checklist (~40 Indicators)</span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">Select All Symptoms You Have Observed</h3>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full glass-pill text-cyan-300 border-sky-400/35 shadow-[0_0_10px_rgba(56,189,248,0.2)]">
            {illness.symptoms.length} Selected
          </span>
        </div>

        <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-1 py-1">
          {SYMPTOM_LIST.map((symptom) => {
            const isSelected = illness.symptoms.includes(symptom);
            return (
              <Chip
                key={symptom}
                variant="blue"
                size="sm"
                selected={isSelected}
                onClick={() => toggleSymptom(symptom)}
              >
                {symptom}
              </Chip>
            );
          })}
        </div>

        {/* Free-text symptom notes */}
        <div className="mt-4 pt-4 border-t border-sky-400/20">
          <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1.5">
            Additional Symptom Notes
          </label>
          <input
            type="text"
            placeholder="e.g. Worse in cold weather or early morning; swelling increases after walking."
            value={illness.symptomNotes}
            onChange={(e) => updateIllness({ symptomNotes: e.target.value })}
            className="w-full p-2.5 glass-input rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none transition-all"
          />
        </div>
      </Card>

      {/* Pre-Existing Conditions & Medical History */}
      <Card className="p-6 sm:p-8 glass-panel border border-sky-400/35 shadow-[0_0_35px_rgba(56,189,248,0.2)] rounded-3xl backdrop-blur-2xl">
        <div className="border-b border-sky-400/20 pb-4 mb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Pre-Existing Conditions & Medical History</span>
          </div>
          <h3 className="text-base font-bold text-white mt-0.5">Surgical Risk & Comorbidity Factors</h3>
          <p className="text-xs text-slate-400">Chips toggle highlighted when selected.</p>
        </div>

        {/* Pre-Existing Chips */}
        <div className="flex flex-wrap gap-2 mb-5">
          {PRE_EXISTING_CONDITIONS.map((cond) => {
            const isSelected = illness.preExisting.includes(cond);
            return (
              <Chip
                key={cond}
                variant="dark"
                size="sm"
                selected={isSelected}
                onClick={() => togglePreExisting(cond)}
              >
                {cond}
              </Chip>
            );
          })}
        </div>

        {/* Free-text Medical History */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1.5">
            Prior Surgeries, Medications, or Diagnostic Reports (X-Ray / MRI / Biopsy)
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Previous appendectomy in 2012. Takes blood pressure medication (Telmisartan 40mg). Had MRI 2 weeks ago showing severe medial meniscus degeneration."
            value={illness.medicalHistoryText}
            onChange={(e) => updateIllness({ medicalHistoryText: e.target.value })}
            className="w-full p-2.5 glass-input rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none transition-all resize-none"
          />
        </div>
      </Card>

      {/* Submission Error Alert */}
      {submissionError && (
        <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{submissionError}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(1)}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Profile</span>
        </Button>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          className="w-full sm:w-auto font-bold shadow-[0_0_25px_rgba(56,189,248,0.4)] px-8"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          <span>Submit & Predict AI Medical Analysis</span>
        </Button>
      </div>
    </form>
  );
};

