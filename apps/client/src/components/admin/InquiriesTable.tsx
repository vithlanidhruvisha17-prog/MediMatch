import React, { useState, useEffect } from 'react';
import { Inquiry } from '@medimatch/shared';
import { inquiriesApi } from '../../api/inquiries';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { RefreshCw, MessageSquare, Phone, Building2, Calendar, CheckCircle2, Clock, XCircle, Loader2, User } from 'lucide-react';

export const InquiriesTable: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInquiries = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await inquiriesApi.getAll();
      setInquiries(data);
    } catch (err: any) {
      console.error('Failed to load inquiries:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch inquiries');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const updated = await inquiriesApi.updateStatus(id, newStatus);
      setInquiries(prev => prev.map(inq => (inq.id === id ? updated : inq)));
    } catch (err: any) {
      alert('Failed to update inquiry status: ' + (err.message || 'Error'));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Contacted':
        return <Badge variant="success" className="font-bold">Contacted</Badge>;
      case 'Closed':
        return <Badge variant="neutral" className="font-medium">Closed</Badge>;
      case 'New':
      default:
        return <Badge variant="primary" className="font-bold">New</Badge>;
    }
  };

  const now = Date.now();
  const todayCount = inquiries.filter(i => (now - new Date(i.createdAt).getTime()) < 24 * 3600 * 1000).length;
  const weekCount = inquiries.filter(i => (now - new Date(i.createdAt).getTime()) < 7 * 24 * 3600 * 1000).length;
  const totalCount = inquiries.length;

  const newCount = inquiries.filter(i => (i.status || '').toLowerCase() === 'new').length;
  const contactedCount = inquiries.filter(i => (i.status || '').toLowerCase() === 'contacted').length;

  return (
    <div className="bg-[#0b1d2d]/80 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl overflow-hidden transition-all">
      {/* Health Daily Header & KPI Ribbon */}
      <div className="border-b border-white/10 bg-black/20 p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Header Title with Phone icon */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-300/30 flex items-center justify-center text-teal-300 shadow-[0_0_15px_rgba(45,212,191,0.25)] flex-shrink-0">
              <Phone className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Patient Consultation Calls & Inquiries
                </h2>
                <button
                  onClick={fetchInquiries}
                  disabled={isLoading}
                  className="text-slate-400 hover:text-teal-300 p-1 transition-colors"
                  title="Refresh Inquiries"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Hospital tour bookings, specialist callbacks & surgery inquiries
              </p>
            </div>
          </div>

          {/* KPI Ribbon (Matches Health Daily reference: Calls Made | Appts | Sales) */}
          <div className="flex items-center gap-1 sm:gap-2 bg-[#061421]/60 p-1.5 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
            {/* KPI 1: Inquiries */}
            <div className="px-3 py-1.5 flex flex-col items-center">
              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium tracking-wider mb-1">
                <span>Today</span>
                <span>Week</span>
                <span>Month</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300 mr-1 hidden sm:inline">Calls</span>
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

            {/* KPI 2: Contacted (Highlighted active block like "Appts" in image) */}
            <div className="px-4 py-1.5 bg-teal-500/15 border-x border-teal-400/25 rounded-xl flex flex-col items-center shadow-[0_0_20px_rgba(20,184,166,0.15)]">
              <div className="flex items-center gap-3 text-[10px] text-teal-200 font-semibold tracking-wider mb-1">
                <span>New</span>
                <span>Done</span>
                <span>Total</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-300 mr-1 hidden sm:inline">Status</span>
                <span className="w-7 h-7 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 flex items-center justify-center text-xs font-bold shadow-sm">
                  {newCount}
                </span>
                <span className="w-7 h-7 rounded-full bg-emerald-950/60 border border-emerald-400/30 text-emerald-200 flex items-center justify-center text-xs font-bold shadow-sm">
                  {contactedCount}
                </span>
                <span className="w-7 h-7 rounded-full bg-teal-900/60 border border-teal-300/40 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {totalCount}
                </span>
              </div>
            </div>

            {/* KPI 3: Resolution */}
            <div className="px-3 py-1.5 flex flex-col items-center">
              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium tracking-wider mb-1">
                <span>Today</span>
                <span>Week</span>
                <span>Month</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300 mr-1 hidden sm:inline">Closed</span>
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
            <span className="text-xs">Loading inquiries...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-400">
            <div className="text-xs font-semibold mb-2">{error}</div>
            <Button variant="outline" size="sm" onClick={fetchInquiries} className="border-teal-400/30 text-white">Retry</Button>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No patient inquiries received yet.
          </div>
        ) : (
          inquiries.map((inq) => (
            <div key={inq.id} className="p-4 space-y-3 bg-[#061421]/60">
              {/* Patient Name & Status Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-teal-300/30 bg-teal-950/50 flex items-center justify-center text-teal-300 flex-shrink-0">
                    <User className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-white">
                      {inq.patient?.fullName || 'Prospective Patient'}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {inq.patient?.city || 'Mumbai'}
                    </div>
                  </div>
                </div>
                <div>{getStatusBadge(inq.status)}</div>
              </div>

              {/* Direct Phone Call */}
              {inq.patient?.phone && (
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${inq.patient.phone}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-950/60 hover:bg-teal-900/60 border border-teal-400/30 text-teal-300 font-mono text-xs font-semibold transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{inq.patient.phone}</span>
                  </a>
                </div>
              )}

              {/* Procedure & Requested Provider */}
              <div className="p-3 bg-[#061421]/70 rounded-xl border border-white/10 space-y-1 text-xs">
                <div>
                  <span className="font-semibold text-slate-400">Procedure: </span>
                  <span className="font-bold text-white">{inq.procedure}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-400">Provider: </span>
                  <span className="text-slate-200">{inq.doctorName || inq.hospitalName || 'General Consultation'}</span>
                </div>
              </div>

              {/* Status Selector */}
              <div className="flex items-center justify-between pt-1 border-t border-white/10">
                <span className="text-xs font-bold text-slate-400">Status:</span>
                <select
                  value={inq.status}
                  onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                  className="px-3 py-1.5 bg-[#061427] border border-white/15 rounded-lg text-xs text-teal-300 font-medium focus:outline-none focus:ring-1 focus:ring-teal-400 cursor-pointer"
                >
                  <option value="New" className="bg-[#07162d] text-white">Mark New</option>
                  <option value="Contacted" className="bg-[#07162d] text-white">Mark Contacted</option>
                  <option value="Closed" className="bg-[#07162d] text-white">Mark Closed</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (hidden md:block) - Matches Health Daily */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-xs text-left min-w-[760px]">
          <thead className="bg-black/25 border-b border-white/10 text-slate-300 font-semibold tracking-wider text-xs">
            <tr>
              <th className="py-3.5 px-5">Name</th>
              <th className="py-3.5 px-5">Contact Phone</th>
              <th className="py-3.5 px-5">Location</th>
              <th className="py-3.5 px-5">Procedure / Indication</th>
              <th className="py-3.5 px-5">Provider</th>
              <th className="py-3.5 px-5">Status</th>
              <th className="py-3.5 px-5 text-right">Update</th>
            </tr>
          </thead>
          <tbody className="text-slate-200 divide-y divide-white/10">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-14 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-400 mb-2" />
                  <span>Loading inquiries...</span>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={7} className="py-14 text-center text-rose-400">
                  <div className="font-semibold mb-2">{error}</div>
                  <Button variant="outline" size="sm" onClick={fetchInquiries} className="border-teal-400/30 text-white">Retry</Button>
                </td>
              </tr>
            ) : inquiries.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-14 text-center text-slate-400">
                  No patient inquiries received yet.
                </td>
              </tr>
            ) : (
              inquiries.map((inq) => (
                <tr key={inq.id} className="hover:bg-white/[0.04] transition-colors">
                  {/* Name + Circular Avatar Icon */}
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full border border-teal-300/30 bg-teal-950/40 flex items-center justify-center text-teal-200 flex-shrink-0 shadow-inner">
                        <User className="w-4 h-4 stroke-[1.8]" />
                      </div>
                      <div className="font-medium text-white text-sm">
                        {inq.patient?.fullName || 'Prospective Patient'}
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="py-4 px-5 font-mono text-teal-300">
                    {inq.patient?.phone || 'Direct Web Lead'}
                  </td>

                  {/* City */}
                  <td className="py-4 px-5 text-slate-300">
                    {inq.patient?.city || 'Mumbai'}
                  </td>

                  {/* Procedure */}
                  <td className="py-4 px-5 font-medium text-white max-w-xs truncate">
                    {inq.procedure}
                  </td>

                  {/* Provider */}
                  <td className="py-4 px-5 text-slate-300 max-w-xs truncate">
                    {inq.doctorName || inq.hospitalName || 'General Consultation'}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-5">
                    {getStatusBadge(inq.status)}
                  </td>

                  {/* Update Status Dropdown */}
                  <td className="py-4 px-5 text-right">
                    <select
                      value={inq.status}
                      onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                      className="px-3 py-1 bg-[#061427] border border-white/15 rounded-lg text-xs text-teal-300 focus:outline-none focus:ring-1 focus:ring-teal-400 cursor-pointer"
                    >
                      <option value="New" className="bg-[#07162d] text-white">Mark New</option>
                      <option value="Contacted" className="bg-[#07162d] text-white">Mark Contacted</option>
                      <option value="Closed" className="bg-[#07162d] text-white">Mark Closed</option>
                    </select>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

