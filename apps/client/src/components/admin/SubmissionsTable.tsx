import React, { useState, useEffect } from 'react';
import { Assessment } from '@medimatch/shared';
import { assessmentsApi } from '../../api/assessments';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { formatCurrency } from '../../lib/formatCurrency';
import { RefreshCw, User, Sparkles, FileText, AlertCircle, Eye, Loader2, Gauge, ChevronRight, Activity } from 'lucide-react';

export const SubmissionsTable: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);

  const fetchAssessments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await assessmentsApi.getAll();
      setAssessments(data);
    } catch (err: any) {
      console.error('Failed to load assessments:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch assessments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const now = Date.now();
  const todayCount = assessments.filter(a => (now - new Date(a.createdAt).getTime()) < 24 * 3600 * 1000).length;
  const weekCount = assessments.filter(a => (now - new Date(a.createdAt).getTime()) < 7 * 24 * 3600 * 1000).length;
  const totalCount = assessments.length;

  const urgentCount = assessments.filter(a => (a.aiPriority || '').toLowerCase().includes('urgent') || (a.aiPriority || '').toLowerCase().includes('immediate')).length;
  const routineCount = Math.max(0, totalCount - urgentCount);

  return (
    <div className="bg-[#0b1d2d]/80 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl overflow-hidden transition-all">
      {/* Health Daily Header & KPI Ribbon */}
      <div className="border-b border-white/10 bg-black/20 p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Header Title with Stethoscope / Activity icon */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-300/30 flex items-center justify-center text-teal-300 shadow-[0_0_15px_rgba(45,212,191,0.25)] flex-shrink-0">
              <Activity className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Patient Health Reports
                </h2>
                <button
                  onClick={fetchAssessments}
                  disabled={isLoading}
                  className="text-slate-400 hover:text-teal-300 p-1 transition-colors"
                  title="Refresh Table"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                AI diagnostic evaluations, urgency triage & clinical indications
              </p>
            </div>
          </div>

          {/* KPI Ribbon (Matches Health Daily reference: Calls Made | Appts | Sales) */}
          <div className="flex items-center gap-1 sm:gap-2 bg-[#061421]/60 p-1.5 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
            {/* KPI 1: Submissions */}
            <div className="px-3 py-1.5 flex flex-col items-center">
              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium tracking-wider mb-1">
                <span>Today</span>
                <span>Week</span>
                <span>Month</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300 mr-1 hidden sm:inline">Reports</span>
                <span className="w-7 h-7 rounded-full bg-black/40 border border-white/15 text-white flex items-center justify-center text-xs font-bold shadow-inner">
                  {todayCount}
                </span>
                <span className="w-7 h-7 rounded-full bg-black/40 border border-white/15 text-white flex items-center justify-center text-xs font-bold shadow-inner">
                  {weekCount}
                </span>
                <span className="w-7 h-7 rounded-full bg-black/40 border border-white/15 text-white flex items-center justify-center text-xs font-bold shadow-inner">
                  {totalCount}
                </span>
              </div>
            </div>

            {/* KPI 2: Priority (Highlighted active block like "Appts" in image) */}
            <div className="px-4 py-1.5 bg-teal-500/15 border-x border-teal-400/25 rounded-xl flex flex-col items-center shadow-[0_0_20px_rgba(20,184,166,0.15)]">
              <div className="flex items-center gap-3 text-[10px] text-teal-200 font-semibold tracking-wider mb-1">
                <span>Urgent</span>
                <span>Routine</span>
                <span>Total</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-300 mr-1 hidden sm:inline">Triage</span>
                <span className="w-7 h-7 rounded-full bg-red-950/60 border border-red-500/40 text-red-300 flex items-center justify-center text-xs font-bold shadow-sm">
                  {urgentCount}
                </span>
                <span className="w-7 h-7 rounded-full bg-teal-950/60 border border-teal-400/30 text-teal-200 flex items-center justify-center text-xs font-bold shadow-sm">
                  {routineCount}
                </span>
                <span className="w-7 h-7 rounded-full bg-teal-900/60 border border-teal-300/40 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {totalCount}
                </span>
              </div>
            </div>

            {/* KPI 3: Status */}
            <div className="px-3 py-1.5 flex flex-col items-center">
              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium tracking-wider mb-1">
                <span>Today</span>
                <span>Week</span>
                <span>Month</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300 mr-1 hidden sm:inline">Active</span>
                <span className="w-7 h-7 rounded-full bg-black/40 border border-white/15 text-white flex items-center justify-center text-xs font-bold shadow-inner">
                  {todayCount}
                </span>
                <span className="w-7 h-7 rounded-full bg-black/40 border border-white/15 text-white flex items-center justify-center text-xs font-bold shadow-inner">
                  {weekCount}
                </span>
                <span className="w-7 h-7 rounded-full bg-black/40 border border-white/15 text-white flex items-center justify-center text-xs font-bold shadow-inner">
                  {totalCount}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card View (block md:hidden) */}
      <div className="block md:hidden divide-y divide-white/10">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-400 mb-2" />
            <span className="text-xs">Loading patient health submissions...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-400">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-rose-400" />
            <span className="text-xs">{error}</span>
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={fetchAssessments} className="border-teal-400/30 text-white">Retry</Button>
            </div>
          </div>
        ) : assessments.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No patient health submissions recorded yet.
          </div>
        ) : (
          assessments.map((item) => (
            <div key={item.id} className="p-4 space-y-3 bg-[#061421]/60">
              {/* Header: Name, Age, Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-teal-300/30 bg-teal-950/50 flex items-center justify-center text-teal-300 flex-shrink-0">
                    <User className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">{item.patient?.fullName || 'Anonymous Patient'}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {item.patient?.age ? `${item.patient.age} Yrs` : ''} {item.patient?.gender} &bull; {item.patient?.city || 'Mumbai'}
                    </div>
                  </div>
                </div>
                <Badge variant="success" className="text-[10px] font-bold flex-shrink-0">
                  {item.status || 'Predicted'}
                </Badge>
              </div>

              {/* AI Prediction Box */}
              <div className="p-3 bg-teal-950/40 border border-teal-400/20 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-teal-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                    AI Indication
                  </span>
                  {item.aiPriority && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-500/30">
                      {item.aiPriority}
                    </span>
                  )}
                </div>
                <div className="font-bold text-xs text-white">
                  {item.aiPredictedSurgery || 'Under AI Analysis'}
                </div>
              </div>

              {/* Budget & Action */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Budget Cap</span>
                  <span className="text-xs font-bold text-teal-300">{formatCurrency(item.patient?.budgetCap)}</span>
                </div>
                <button
                  onClick={() => setSelectedAssessment(item)}
                  className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-400 hover:text-slate-950 text-teal-200 border border-teal-400/30 flex items-center gap-1.5 text-xs font-semibold transition-all"
                >
                  <span>Dossier</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table Content (hidden md:block) - Matches Health Daily */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs text-left min-w-[820px]">
          <thead className="bg-black/25 border-b border-white/10 text-slate-300 font-semibold tracking-wider text-xs">
            <tr>
              <th className="py-3.5 px-5">Name</th>
              <th className="py-3.5 px-5">Clinical Indication</th>
              <th className="py-3.5 px-5">Urgency / Severity</th>
              <th className="py-3.5 px-5">City & Budget Cap</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5 text-right">Note / Action</th>
            </tr>
          </thead>
          <tbody className="text-slate-200 divide-y divide-white/10">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-400 mb-2" />
                  <span>Loading patient health submissions...</span>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-rose-400">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 text-rose-400" />
                  <span>{error}</span>
                  <div className="mt-2">
                    <Button variant="outline" size="sm" onClick={fetchAssessments} className="border-teal-400/30 text-white">Retry</Button>
                  </div>
                </td>
              </tr>
            ) : assessments.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-slate-400">
                  No patient health submissions recorded yet.
                </td>
              </tr>
            ) : (
              assessments.map((item) => (
                <tr key={item.id} className="hover:bg-white/[0.04] transition-colors">
                  {/* Name + Circular Avatar Icon */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full border border-teal-300/30 bg-teal-950/40 flex items-center justify-center text-teal-200 flex-shrink-0 shadow-inner">
                        <User className="w-4 h-4 stroke-[1.8]" />
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm tracking-tight">{item.patient?.fullName || 'Anonymous Patient'}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {item.patient?.age ? `${item.patient.age} Yrs` : ''} {item.patient?.gender} &bull; {item.patient?.phone}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Clinical Indication */}
                  <td className="py-4 px-5 max-w-xs">
                    <div className="font-semibold text-white truncate">{item.aiPredictedSurgery || 'General Evaluation'}</div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">{item.illnessText}</div>
                  </td>

                  {/* Urgency / Severity */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2">
                      {item.aiPriority ? (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.aiPriority.toLowerCase().includes('urgent') || item.aiPriority.toLowerCase().includes('immediate')
                            ? 'bg-red-950/60 text-red-300 border border-red-500/40'
                            : 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                        }`}>
                          {item.aiPriority}
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Routine</span>
                      )}
                      <span className="text-[10px] text-teal-300 font-mono">
                        {item.severity}/10
                      </span>
                    </div>
                  </td>

                  {/* City & Budget */}
                  <td className="py-4 px-5">
                    <div className="font-medium text-slate-300">{item.patient?.city || 'Mumbai'}</div>
                    <div className="font-bold text-teal-300 mt-0.5 font-mono">
                      {formatCurrency(item.patient?.budgetCap)}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 px-5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-white/10 text-slate-200 border border-white/15">
                      {item.status || 'Assessed'}
                    </span>
                  </td>

                  {/* Chevron Action (matches ">" in Health Daily) */}
                  <td className="py-4 px-5 text-right">
                    <button
                      onClick={() => setSelectedAssessment(item)}
                      className="w-8 h-8 rounded-lg bg-white/5 hover:bg-teal-400 hover:text-slate-950 text-slate-300 border border-white/10 inline-flex items-center justify-center transition-all group"
                      title="View Clinical Dossier"
                    >
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedAssessment && (
        <Modal
          isOpen={Boolean(selectedAssessment)}
          onClose={() => setSelectedAssessment(null)}
          title={`Clinical Dossier: ${selectedAssessment.patient?.fullName || 'Patient'}`}
          subtitle={`ID: ${selectedAssessment.id} • ${new Date(selectedAssessment.createdAt).toLocaleString()}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            {/* Patient Overview */}
            <div className="p-4 bg-[#061427]/70 rounded-[12px] border border-sky-400/20 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Phone</span>
                <div className="font-bold text-white mt-0.5">{selectedAssessment.patient?.phone}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Age / Gender</span>
                <div className="font-bold text-white mt-0.5">{selectedAssessment.patient?.age} Yrs, {selectedAssessment.patient?.gender}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Location City</span>
                <div className="font-bold text-white mt-0.5">{selectedAssessment.patient?.city}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Budget Ceiling</span>
                <div className="font-bold text-cyan-300 mt-0.5">{formatCurrency(selectedAssessment.patient?.budgetCap)}</div>
              </div>
            </div>

            {/* AI Clinical Assessment Block */}
            <div className="p-4 bg-sky-950/60 border border-sky-400/30 rounded-[12px]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-cyan-300 uppercase text-[11px] tracking-wider">
                  AI Predicted Surgical Indication
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-900/60 text-cyan-200 border border-sky-400/40">
                  {selectedAssessment.aiPriority}
                </span>
              </div>
              <div className="text-sm font-black text-white mb-2">
                {selectedAssessment.aiPredictedSurgery}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#061427]/80 p-3 rounded-lg border border-sky-400/20">
                {selectedAssessment.aiSummary}
              </p>
            </div>

            {/* Patient Reported Narrative */}
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                Reported Complaint & Medical History
              </span>
              <div className="p-3 bg-[#061427]/70 rounded-[10px] border border-sky-400/15 text-slate-200 leading-relaxed">
                {selectedAssessment.illnessText}
              </div>
            </div>

            {/* Symptoms Tagged */}
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                Active Symptoms Checklist
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedAssessment.symptoms.map((s, idx) => (
                  <span key={idx} className="px-2 py-1 bg-sky-950/60 text-cyan-300 rounded-full font-medium border border-sky-400/30">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Pre-existing conditions */}
            {selectedAssessment.preExisting && selectedAssessment.preExisting.length > 0 && (
              <div>
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px] block mb-1">
                  Comorbidities & Risk Factors
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedAssessment.preExisting.map((c, idx) => (
                    <span key={idx} className="px-2 py-1 bg-slate-800 text-slate-200 rounded-full font-medium border border-slate-700">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3">
              <Button size="sm" variant="outline" onClick={() => setSelectedAssessment(null)} className="border-sky-400/30 text-white hover:bg-sky-500/20">
                Close Dossier
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

