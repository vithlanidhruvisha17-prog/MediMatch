import React, { useState, useEffect } from 'react';
import { Doctor } from '@medimatch/shared';
import { doctorsApi } from '../../api/doctors';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { formatCurrency } from '../../lib/formatCurrency';
import { Plus, Edit2, Trash2, Search, UserCheck, Stethoscope, Loader2 } from 'lucide-react';

export const DoctorsManager: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: 'Surgical Oncology',
    credentials: 'MS, MCh (Surgical Oncology)',
    yearsExp: 20,
    fee: 1500,
    photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
    contactEmail: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const data = await doctorsApi.getAll({ search: search.trim() || undefined });
      setDoctors(data);
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const openAddModal = () => {
    setEditingDoctor(null);
    setFormData({
      name: '',
      specialty: 'Surgical Oncology',
      credentials: 'MS, MCh (Surgical Oncology)',
      yearsExp: 20,
      fee: 1500,
      photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
      contactEmail: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (d: Doctor) => {
    setEditingDoctor(d);
    setFormData({
      name: d.name,
      specialty: d.specialty,
      credentials: d.credentials,
      yearsExp: d.yearsExp,
      fee: d.fee,
      photoUrl: d.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400',
      contactEmail: d.contactEmail || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove ${name}?`)) return;
    try {
      await doctorsApi.delete(id);
      setDoctors(prev => prev.filter(d => d.id !== id));
    } catch (err: any) {
      alert('Failed to delete doctor: ' + (err.message || 'Error'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.credentials) return;

    setIsSaving(true);
    try {
      if (editingDoctor) {
        const updated = await doctorsApi.update(editingDoctor.id, formData);
        setDoctors(prev => prev.map(d => (d.id === updated.id ? updated : d)));
      } else {
        const created = await doctorsApi.create(formData);
        setDoctors(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Failed to save doctor: ' + (err.message || 'Error'));
    } finally {
      setIsSaving(false);
    }
  };

  const totalDoctors = doctors.length;
  const surgicalCount = doctors.filter(d => (d.specialty || '').toLowerCase().includes('surg')).length;
  const clinicalCount = totalDoctors - surgicalCount;
  const seniorExpCount = doctors.filter(d => (d.yearsExp || 0) >= 15).length;
  const midExpCount = doctors.filter(d => (d.yearsExp || 0) >= 10 && (d.yearsExp || 0) < 15).length;

  return (
    <div className="bg-[#0b1d2d]/80 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl overflow-hidden">
      {/* Top Header + Health Daily 3-Column KPI Ribbon */}
      <div className="p-5 border-b border-white/10 bg-black/20 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Left Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
              <span>Specialist Doctor Faculty</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 font-semibold">
                {totalDoctors} Active
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Surgical leadership, medical credentials, consult fees, and availability.
            </p>
          </div>
        </div>

        {/* Right: Actions + Health Daily 3-Column KPI Ribbon */}
        <div className="flex flex-wrap items-center gap-4 justify-between xl:justify-end">
          <Button
            variant="primary"
            size="sm"
            onClick={openAddModal}
            className="text-xs font-bold shadow-[0_0_20px_rgba(20,184,166,0.35)] bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 border-0"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Add Specialist</span>
          </Button>

          {/* 3-Column Metric Ribbon */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-2xl p-1 shadow-inner">
            {/* KPI 1: Specialty */}
            <div className="px-3.5 py-1.5 flex flex-col items-center">
              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium tracking-wider mb-1">
                <span>Surgical</span>
                <span>Clinical</span>
                <span>Total</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300 mr-1 hidden sm:inline">Faculty</span>
                <span className="w-7 h-7 rounded-full bg-black/40 border border-white/15 text-white flex items-center justify-center text-xs font-bold shadow-inner">
                  {surgicalCount}
                </span>
                <span className="w-7 h-7 rounded-full bg-black/40 border border-white/15 text-white flex items-center justify-center text-xs font-bold shadow-inner">
                  {clinicalCount}
                </span>
                <span className="w-7 h-7 rounded-full bg-black/40 border border-white/15 text-white flex items-center justify-center text-xs font-bold shadow-inner">
                  {totalDoctors}
                </span>
              </div>
            </div>

            {/* KPI 2: Experience (Highlighted active block like reference) */}
            <div className="px-4 py-1.5 bg-teal-500/15 border-x border-teal-400/25 rounded-xl flex flex-col items-center shadow-[0_0_20px_rgba(20,184,166,0.15)]">
              <div className="flex items-center gap-3 text-[10px] text-teal-200 font-semibold tracking-wider mb-1">
                <span>&gt;15 Yrs</span>
                <span>&gt;10 Yrs</span>
                <span>Total</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-300 mr-1 hidden sm:inline">Experience</span>
                <span className="w-7 h-7 rounded-full bg-teal-900/80 border border-teal-400/40 text-teal-200 flex items-center justify-center text-xs font-bold shadow-sm">
                  {seniorExpCount}
                </span>
                <span className="w-7 h-7 rounded-full bg-teal-950/60 border border-teal-400/30 text-teal-300 flex items-center justify-center text-xs font-bold shadow-sm">
                  {midExpCount}
                </span>
                <span className="w-7 h-7 rounded-full bg-teal-900/60 border border-teal-300/40 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {totalDoctors}
                </span>
              </div>
            </div>

            {/* KPI 3: Status */}
            <div className="px-3.5 py-1.5 flex flex-col items-center">
              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium tracking-wider mb-1">
                <span>Direct</span>
                <span>Partner</span>
                <span>Total</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300 mr-1 hidden sm:inline">Status</span>
                <span className="w-7 h-7 rounded-full bg-black/40 border border-white/15 text-white flex items-center justify-center text-xs font-bold shadow-inner">
                  {totalDoctors}
                </span>
                <span className="w-7 h-7 rounded-full bg-black/40 border border-white/15 text-white flex items-center justify-center text-xs font-bold shadow-inner">
                  {totalDoctors}
                </span>
                <span className="w-7 h-7 rounded-full bg-black/40 border border-white/15 text-white flex items-center justify-center text-xs font-bold shadow-inner">
                  {totalDoctors}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-white/10 bg-black/15">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchDoctors();
          }}
          className="relative max-w-md"
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            placeholder="Filter specialists by name or specialty..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-black/40 border border-white/15 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-400 focus:border-teal-400/50"
          />
        </form>
      </div>

      {/* Mobile Card View (block md:hidden) */}
      <div className="block md:hidden divide-y divide-white/10 max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-400 mb-2" />
            <span className="text-xs">Loading specialist doctors...</span>
          </div>
        ) : doctors.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No doctors match your filter.
          </div>
        ) : (
          doctors.map((d) => (
            <div key={d.id} className="p-4 space-y-3 hover:bg-white/[0.02]">
              <div className="flex items-start gap-3">
                <img
                  src={d.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400'}
                  alt={d.name}
                  className="w-12 h-12 rounded-full object-cover border border-white/15 shadow-md flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-white leading-snug">{d.name}</h4>
                  <span className="inline-block text-[11px] font-semibold text-teal-300 mt-0.5">
                    {d.specialty}
                  </span>
                  <p className="text-xs text-slate-400 mt-0.5">{d.credentials}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="font-medium text-slate-300">
                  Experience: <strong className="text-white">{d.yearsExp} Years</strong>
                </span>
                <span className="font-bold text-white">
                  Fee: <span className="text-teal-300">{formatCurrency(d.fee)}</span>
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(d)}
                  className="text-xs py-1.5 px-3 text-slate-300 border-white/20 hover:border-teal-400 bg-white/5 flex items-center gap-1 font-semibold"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(d.id, d.name)}
                  className="text-xs py-1.5 px-3 text-rose-400 hover:bg-rose-500/10 flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View (hidden md:block) - Matches Health Daily */}
      <div className="hidden md:block overflow-x-auto max-h-[600px] overflow-y-auto">
        <table className="w-full text-xs text-left min-w-[750px]">
          <thead className="bg-black/25 border-b border-white/10 text-slate-300 font-semibold tracking-wider text-xs sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th className="py-3.5 px-5">Specialist Doctor</th>
              <th className="py-3.5 px-5">Specialty</th>
              <th className="py-3.5 px-5">Credentials</th>
              <th className="py-3.5 px-5">Experience</th>
              <th className="py-3.5 px-5">Consultation Fee</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10 text-slate-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-400 mb-2" />
                  <span>Loading specialist doctors...</span>
                </td>
              </tr>
            ) : doctors.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-14 text-center text-slate-400">
                  No doctors match your filter.
                </td>
              </tr>
            ) : (
              doctors.map((d) => (
                <tr key={d.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={d.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400'}
                        alt={d.name}
                        className="w-10 h-10 rounded-full object-cover border border-teal-300/30 shadow-md flex-shrink-0"
                      />
                      <div>
                        <div className="font-bold text-white text-sm">{d.name}</div>
                        {d.contactEmail && (
                          <div className="text-[11px] text-slate-400">{d.contactEmail}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    <span className="font-semibold text-teal-300 px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-400/20">
                      {d.specialty}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-slate-300 max-w-xs">{d.credentials}</td>
                  <td className="py-4 px-5 font-semibold text-white">
                    <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                      {d.yearsExp} Years
                    </span>
                  </td>
                  <td className="py-4 px-5 font-bold text-emerald-400 text-sm">
                    {formatCurrency(d.fee)}
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(d)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-teal-500/20 text-slate-400 hover:text-teal-300 border border-white/10 flex items-center justify-center transition-colors"
                        title="Edit Doctor"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(d.id, d.name)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-white/10 flex items-center justify-center transition-colors"
                        title="Delete Doctor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingDoctor ? 'Edit Doctor Faculty' : 'Add New Specialist Doctor'}
          maxWidth="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Doctor Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dr. Ramesh Gupta"
                className="w-full p-2.5 bg-[#061427]/80 border border-sky-400/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Specialty
              </label>
              <input
                type="text"
                required
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                placeholder="e.g. Orthopedics & Joint Reconstruction"
                className="w-full p-2.5 bg-[#061427]/80 border border-sky-400/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Degrees & Credentials <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.credentials}
                onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
                placeholder="e.g. MBBS, MS (Ortho), MCh, AO Spine Fellow"
                className="w-full p-2.5 bg-[#061427]/80 border border-sky-400/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.yearsExp}
                  onChange={(e) => setFormData({ ...formData, yearsExp: Number(e.target.value) })}
                  className="w-full p-2.5 bg-[#061427]/80 border border-sky-400/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Consultation Fee (₹)
                </label>
                <input
                  type="number"
                  min="200"
                  step="50"
                  value={formData.fee}
                  onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                  className="w-full p-2.5 bg-[#061427]/80 border border-sky-400/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Photo URL
              </label>
              <input
                type="url"
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                className="w-full p-2.5 bg-[#061427]/80 border border-sky-400/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Contact Email <span className="font-normal text-slate-400">(for booking notifications)</span>
              </label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="e.g. dr.sharma@clinic.com"
                className="w-full p-2.5 bg-[#061427]/80 border border-sky-400/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
              <p className="text-[10px] text-slate-400 mt-1">Optional — doctor gets a booking notification email when a patient books.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving} className="font-bold">
                {editingDoctor ? 'Update Specialist' : 'Add Specialist'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

