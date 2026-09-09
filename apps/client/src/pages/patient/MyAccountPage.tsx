import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { Assessment, Inquiry } from '@medimatch/shared';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatCurrency } from '../../lib/formatCurrency';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Activity,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Stethoscope,
  ArrowRight,
  LogOut,
  Loader2
} from 'lucide-react';

export const MyAccountPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assessments' | 'inquiries'>('assessments');

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const [assessmentsRes, inquiriesRes] = await Promise.all([
          apiClient.get<Assessment[]>('/patients/me/assessments'),
          apiClient.get<Inquiry[]>('/patients/me/inquiries')
        ]);
        setAssessments(assessmentsRes.data || []);
        setInquiries(inquiriesRes.data || []);
      } catch (err) {
        console.error('Failed to load patient history:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Patient Profile Header Card */}
      <div className="glass-panel rounded-2xl border border-sky-400/30 p-6 sm:p-8 shadow-[0_0_30px_rgba(56,189,248,0.1)] mb-8 bg-[#091b35]/70 backdrop-blur-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-[0_0_25px_rgba(56,189,248,0.35)] border border-sky-300/30">
              <User className="w-8 h-8 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  {user?.fullName || 'Patient Profile'}
                </h1>
                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider glass-pill text-cyan-300 border border-sky-400/30 bg-sky-950/50 shadow-[0_0_12px_rgba(56,189,248,0.2)]">
                  Verified Patient
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-2 font-medium">
                <span>{user?.email}</span>
                <span className="text-slate-600">•</span>
                <span>{user?.phone}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/assessment')}
              className="text-xs font-bold uppercase tracking-wider shadow-lg flex-1 sm:flex-none justify-center"
            >
              <Activity className="w-4 h-4 mr-1.5" />
              <span>New Assessment</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-xs font-semibold text-slate-300 border-sky-400/30 hover:text-red-300 hover:border-red-500/50 hover:bg-red-500/10 bg-[#061427]/60"
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Demographics Overview Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-sky-400/15">
          <div className="p-3.5 bg-[#061427]/70 backdrop-blur-md rounded-xl border border-sky-400/20 shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 truncate">
              Location City
            </span>
            <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span className="truncate">{user?.city || 'Mumbai'}</span>
            </span>
          </div>

          <div className="p-3.5 bg-[#061427]/70 backdrop-blur-md rounded-xl border border-sky-400/20 shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 truncate">
              Age & Gender
            </span>
            <span className="text-xs font-bold text-white truncate">
              {user?.age ? `${user.age} yrs` : '45 yrs'} • {user?.gender || 'Not Specified'}
            </span>
          </div>

          <div className="p-3.5 bg-[#061427]/70 backdrop-blur-md rounded-xl border border-sky-400/20 shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 truncate">
              Budget Cap
            </span>
            <span className="text-xs font-bold text-cyan-300 truncate">
              {user?.budgetCap ? formatCurrency(user.budgetCap) : '₹2,50,000'}
            </span>
          </div>

          <div className="p-3.5 bg-[#061427]/70 backdrop-blur-md rounded-xl border border-sky-400/20 shadow-xs">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 truncate">
              Total Assessments
            </span>
            <span className="text-xs font-bold text-white truncate">
              {assessments.length} Completed
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-sky-400/20 mb-6 overflow-x-auto whitespace-nowrap pb-0.5">
        <button
          onClick={() => setActiveTab('assessments')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex-shrink-0 ${
            activeTab === 'assessments'
              ? 'border-sky-400 text-sky-300 shadow-[0_4px_12px_rgba(56,189,248,0.25)]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          My AI Health Assessments ({assessments.length})
        </button>
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`pb-3 px-4 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex-shrink-0 ${
            activeTab === 'inquiries'
              ? 'border-sky-400 text-sky-300 shadow-[0_4px_12px_rgba(56,189,248,0.25)]'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Hospital Inquiries & Bookings ({inquiries.length})
        </button>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="min-h-[30vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400">Loading your health history...</p>
        </div>
      ) : (
        <>
          {/* Tab 1: Assessments */}
          {activeTab === 'assessments' && (
            <div>
              {assessments.length === 0 ? (
                <Card className="p-10 text-center glass-card border-sky-400/25 bg-[#091b35]/60">
                  <div className="w-12 h-12 rounded-full bg-sky-950/60 border border-sky-400/30 text-cyan-400 flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white">No Assessments Yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
                    Start an AI health assessment to receive predicted surgical indications, urgency triage, and itemized packages.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/assessment')}
                    className="text-xs font-bold uppercase tracking-wider"
                  >
                    Take First Assessment
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {assessments.map((a) => (
                    <Card key={a.id} variant="elevated" hover className="p-5 glass-card border-sky-400/25 bg-[#091b35]/70 rounded-2xl hover:border-sky-400/50 hover:shadow-[0_0_25px_rgba(56,189,248,0.15)] transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-400/15 pb-3 mb-3">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-xl bg-sky-950/60 border border-sky-400/30 flex items-center justify-center text-cyan-400 font-bold text-xs shadow-[0_0_10px_rgba(56,189,248,0.2)]">
                            <Activity className="w-4 h-4" />
                          </span>
                          <div>
                            <h3 className="text-sm font-bold text-white">
                              {a.aiPredictedSurgery || 'General Surgical Evaluation'}
                            </h3>
                            <span className="text-[11px] text-slate-400">
                              Assessed on {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {a.aiPriority && (
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              a.aiPriority.toLowerCase().includes('urgent') || a.aiPriority.toLowerCase().includes('immediate')
                                ? 'bg-red-950/60 text-red-300 border border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.2)]'
                                : 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
                            }`}>
                              {a.aiPriority}
                            </span>
                          )}
                          <Badge variant="neutral">{a.status}</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs text-slate-300">
                        <div className="p-3 bg-[#061427]/70 rounded-xl border border-sky-400/15">
                          <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block mb-1">Reported Symptoms</span>
                          <p className="line-clamp-2 text-slate-200">{a.illnessText}</p>
                        </div>
                        <div className="p-3 bg-[#061427]/70 rounded-xl border border-sky-400/15">
                          <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block mb-1">Clinical Indicators</span>
                          <p className="text-slate-200 font-medium">Severity: {a.severity}/10 • Duration: {a.durationBucket}</p>
                        </div>
                        <div className="p-3 bg-[#061427]/70 rounded-xl border border-sky-400/15">
                          <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block mb-1">AI Clinical Summary</span>
                          <p className="line-clamp-2 text-slate-200">{a.aiSummary || 'Clinical analysis recorded.'}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Inquiries */}
          {activeTab === 'inquiries' && (
            <div>
              {inquiries.length === 0 ? (
                <Card className="p-10 text-center glass-card border-sky-400/25 bg-[#091b35]/60 rounded-2xl shadow-glass">
                  <div className="w-12 h-12 rounded-2xl bg-sky-950/60 border border-sky-400/30 text-cyan-400 flex items-center justify-center mx-auto mb-3 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white">No Booking Inquiries</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
                    You haven't requested any hospital visits or specialist consultations yet.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/hospitals')}
                    className="text-xs font-semibold text-slate-300 border-sky-400/30 hover:border-sky-400 bg-[#061427]/60"
                  >
                    Browse Partner Hospitals
                  </Button>
                </Card>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((inq) => (
                    <Card key={inq.id} variant="elevated" hover className="p-5 glass-card border-sky-400/25 bg-[#091b35]/70 rounded-2xl hover:border-sky-400/50 hover:shadow-[0_0_25px_rgba(56,189,248,0.15)] transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-400/15 pb-3 mb-3">
                        <div className="flex items-center gap-3">
                          <span className="w-9 h-9 rounded-xl bg-emerald-950/60 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold text-xs shadow-[0_0_10px_rgba(52,211,153,0.2)]">
                            <Building2 className="w-4 h-4" />
                          </span>
                          <div>
                            <h3 className="text-sm font-bold text-white">
                              {inq.procedure}
                            </h3>
                            <span className="text-[11px] text-slate-400">
                              Requested on {new Date(inq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        <Badge variant={inq.status === 'Contacted' ? 'success' : inq.status === 'Closed' ? 'neutral' : 'warning'}>
                          {inq.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                        {inq.hospitalName && (
                          <div className="p-3 bg-[#061427]/70 rounded-xl border border-sky-400/15">
                            <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block mb-1">Facility</span>
                            <p className="text-white font-medium">{inq.hospitalName}</p>
                          </div>
                        )}
                        {inq.notes && (
                          <div className="p-3 bg-[#061427]/70 rounded-xl border border-sky-400/15">
                            <span className="font-bold text-slate-400 text-[10px] uppercase tracking-wider block mb-1">Request Details</span>
                            <p className="text-slate-300 line-clamp-2">{inq.notes}</p>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
