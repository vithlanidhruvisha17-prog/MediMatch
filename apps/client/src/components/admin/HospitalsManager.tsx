import React, { useState, useEffect } from 'react';
import { Hospital, INDIAN_CITIES, ACCREDITATION_OPTIONS } from '@medimatch/shared';
import { hospitalsApi } from '../../api/hospitals';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Plus, Edit2, Trash2, Search, Building2, Bed, Activity, Loader2, Check } from 'lucide-react';

export const HospitalsManager: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    city: 'Mumbai',
    accreditation: 'NABH Accredited',
    address: '',
    beds: 350,
    icuBeds: 75,
    imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800',
    contactEmail: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchHospitals = async () => {
    setIsLoading(true);
    try {
      const data = await hospitalsApi.getAll({ search: search.trim() || undefined });
      setHospitals(data);
    } catch (err) {
      console.error('Failed to load hospitals:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const openAddModal = () => {
    setEditingHospital(null);
    setFormData({
      name: '',
      city: 'Mumbai',
      accreditation: 'NABH Accredited',
      address: '',
      beds: 350,
      icuBeds: 75,
      imageUrl: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800',
      contactEmail: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (h: Hospital) => {
    setEditingHospital(h);
    setFormData({
      name: h.name,
      city: h.city,
      accreditation: h.accreditation,
      address: h.address,
      beds: h.beds,
      icuBeds: h.icuBeds,
      imageUrl: h.imageUrl || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800',
      contactEmail: h.contactEmail || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await hospitalsApi.delete(id);
      setHospitals(prev => prev.filter(h => h.id !== id));
    } catch (err: any) {
      alert('Failed to delete hospital: ' + (err.message || 'Error'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address) return;

    setIsSaving(true);
    try {
      if (editingHospital) {
        const updated = await hospitalsApi.update(editingHospital.id, formData);
        setHospitals(prev => prev.map(h => (h.id === updated.id ? updated : h)));
      } else {
        const created = await hospitalsApi.create(formData);
        setHospitals(prev => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert('Failed to save hospital: ' + (err.message || 'Error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-[#0b1d2d]/80 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-2xl overflow-hidden transition-all">
      {/* Header & KPI Ribbon */}
      <div className="p-4 sm:p-5 border-b border-white/10 bg-black/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-300/30 flex items-center justify-center text-teal-300 shadow-[0_0_15px_rgba(45,212,191,0.25)] flex-shrink-0">
              <Building2 className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Hospital Catalog Manager
                </h2>
                <Button variant="primary" size="sm" onClick={openAddModal} className="text-xs font-bold shadow-[0_0_15px_rgba(45,212,191,0.3)] ml-2">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  <span>Add Hospital</span>
                </Button>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Accredited partner medical centers & surgical infrastructure
              </p>
            </div>
          </div>

          {/* Health Daily KPI Ribbon */}
          <div className="flex items-center gap-1 sm:gap-2 bg-[#061421]/60 p-1.5 rounded-2xl border border-white/10 overflow-x-auto no-scrollbar">
            <div className="px-3 py-1.5 flex flex-col items-center">
              <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium tracking-wider mb-1">
                <span>NABH</span>
                <span>JCI</span>
                <span>Total</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300 mr-1 hidden sm:inline">Tier</span>
                <span className="w-7 h-7 rounded-full bg-black/40 border border-white/15 text-white flex items-center justify-center text-xs font-bold shadow-inner">
                  {hospitals.filter(h => h.accreditation.includes('NABH')).length}
                </span>
                <span className="w-7 h-7 rounded-full bg-black/40 border border-white/15 text-white flex items-center justify-center text-xs font-bold shadow-inner">
                  {hospitals.filter(h => h.accreditation.includes('JCI')).length}
                </span>
                <span className="w-7 h-7 rounded-full bg-black/40 border border-white/15 text-white flex items-center justify-center text-xs font-bold shadow-inner">
                  {hospitals.length}
                </span>
              </div>
            </div>

            <div className="px-4 py-1.5 bg-teal-500/15 border-x border-teal-400/25 rounded-xl flex flex-col items-center shadow-[0_0_20px_rgba(20,184,166,0.15)]">
              <div className="flex items-center gap-3 text-[10px] text-teal-200 font-semibold tracking-wider mb-1">
                <span>Beds</span>
                <span>ICU</span>
                <span>Units</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-300 mr-1 hidden sm:inline">Capacity</span>
                <span className="w-7 h-7 rounded-full bg-teal-950/60 border border-teal-400/30 text-teal-200 flex items-center justify-center text-[10px] font-bold shadow-sm">
                  {hospitals.reduce((acc, h) => acc + (h.beds || 0), 0)}
                </span>
                <span className="w-7 h-7 rounded-full bg-teal-950/60 border border-teal-400/30 text-teal-200 flex items-center justify-center text-[10px] font-bold shadow-sm">
                  {hospitals.reduce((acc, h) => acc + (h.icuBeds || 0), 0)}
                </span>
                <span className="w-7 h-7 rounded-full bg-teal-900/60 border border-teal-300/40 text-white flex items-center justify-center text-xs font-bold shadow-sm">
                  {hospitals.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Filter */}
      <div className="p-4 border-b border-white/10 bg-[#061421]/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchHospitals();
          }}
          className="relative max-w-md"
        >
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            placeholder="Filter hospitals by name or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#061427]/80 border border-white/15 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
          />
        </form>
      </div>

      {/* Mobile Card View (block md:hidden) */}
      <div className="block md:hidden divide-y divide-white/10 max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="py-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-400 mb-2" />
            <span className="text-xs">Loading hospital catalog...</span>
          </div>
        ) : hospitals.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No hospitals match your search.
          </div>
        ) : (
          hospitals.map((h) => (
            <div key={h.id} className="p-4 space-y-3 bg-[#061421]/60">
              <div className="flex items-start gap-3">
                <img
                  src={h.imageUrl || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800'}
                  alt={h.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-white/15 flex-shrink-0 shadow-sm"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-sm text-white leading-snug">{h.name}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-0.5">{h.address}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-teal-950/60 border border-teal-400/25 text-teal-300">
                  {h.city}
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-950/60 text-blue-300 border border-blue-400/30">
                  {h.accreditation}
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#061427] border border-white/10 text-slate-300">
                  {h.beds} Beds ({h.icuBeds} ICU)
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(h)}
                  className="text-xs py-1.5 px-3 text-slate-300 border-white/15 hover:border-teal-400 bg-white/5 flex items-center gap-1 font-semibold"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(h.id, h.name)}
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
        <table className="w-full text-xs text-left min-w-[700px]">
          <thead className="bg-black/25 border-b border-white/10 text-slate-300 font-semibold tracking-wider text-xs sticky top-0 z-10">
            <tr>
              <th className="py-3.5 px-5">Hospital Facility</th>
              <th className="py-3.5 px-5">Metro City</th>
              <th className="py-3.5 px-5">Accreditation</th>
              <th className="py-3.5 px-5">Beds & ICU</th>
              <th className="py-3.5 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="text-slate-200 divide-y divide-white/10">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="py-14 text-center text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-teal-400 mb-2" />
                  <span>Loading hospital catalog...</span>
                </td>
              </tr>
            ) : hospitals.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-14 text-center text-slate-400">
                  No hospitals match your search.
                </td>
              </tr>
            ) : (
              hospitals.map((h) => (
                <tr key={h.id} className="hover:bg-white/[0.04] transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={h.imageUrl || 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=800'}
                        alt={h.name}
                        className="w-10 h-10 rounded-full object-cover border border-white/15 flex-shrink-0 shadow-sm"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-white truncate max-w-sm text-sm">{h.name}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-sm">{h.address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 font-semibold text-teal-300">{h.city}</td>
                  <td className="py-4 px-5">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-950/60 text-blue-300 border border-blue-400/30">
                      {h.accreditation}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-slate-300 font-mono">
                    <span className="font-bold text-white">{h.beds}</span> Beds ({h.icuBeds} ICU)
                  </td>
                  <td className="py-4 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEditModal(h)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-teal-400 hover:text-slate-950 text-slate-300 border border-white/10 inline-flex items-center justify-center transition-all"
                        title="Edit Hospital"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(h.id, h.name)}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-500 hover:text-white text-slate-400 border border-white/10 inline-flex items-center justify-center transition-all"
                        title="Delete Hospital"
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
          title={editingHospital ? 'Edit Partner Hospital' : 'Add New Partner Hospital'}
          maxWidth="md"
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Hospital Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Apollo Super Speciality Hospital"
                className="w-full p-2.5 bg-[#061427]/80 border border-sky-400/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  City
                </label>
                <select
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-2.5 bg-[#061427]/80 border border-sky-400/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                >
                  {INDIAN_CITIES.map((c) => (
                    <option key={c} value={c} className="bg-[#07162d] text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Accreditation
                </label>
                <select
                  value={formData.accreditation}
                  onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                  className="w-full p-2.5 bg-[#061427]/80 border border-sky-400/30 rounded-xl text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-400"
                >
                  <option value="NABH Accredited" className="bg-[#07162d] text-white">NABH Accredited</option>
                  <option value="JCI Accredited" className="bg-[#07162d] text-white">JCI Accredited</option>
                  <option value="NABH & JCI" className="bg-[#07162d] text-white">NABH & JCI</option>
                  <option value="ISO Certified" className="bg-[#07162d] text-white">ISO Certified</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Full Address / Campus Location <span className="text-red-400">*</span>
              </label>
              <textarea
                rows={2}
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address, landmark, sector..."
                className="w-full p-2.5 bg-[#061427]/80 border border-sky-400/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Total Beds
                </label>
                <input
                  type="number"
                  min="10"
                  value={formData.beds}
                  onChange={(e) => setFormData({ ...formData, beds: Number(e.target.value) })}
                  className="w-full p-2.5 bg-[#061427]/80 border border-sky-400/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  ICU Beds Count
                </label>
                <input
                  type="number"
                  min="2"
                  value={formData.icuBeds}
                  onChange={(e) => setFormData({ ...formData, icuBeds: Number(e.target.value) })}
                  className="w-full p-2.5 bg-[#061427]/80 border border-sky-400/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Image URL (Unsplash or CDN)
              </label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
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
                placeholder="e.g. bookings@apollohospitals.com"
                className="w-full p-2.5 bg-[#061427]/80 border border-sky-400/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
              <p className="text-[10px] text-slate-400 mt-1">Optional — hospital gets a booking notification email when a patient books.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving} className="font-bold">
                {editingHospital ? 'Update Hospital' : 'Add Hospital'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

