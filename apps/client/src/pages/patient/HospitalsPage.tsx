import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hospital, INDIAN_CITIES, ACCREDITATION_OPTIONS } from '@medimatch/shared';
import { hospitalsApi } from '../../api/hospitals';
import { inquiriesApi } from '../../api/inquiries';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { HospitalCard } from '../../components/hospitals/HospitalCard';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Search, Building2, MapPin, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';

export const HospitalsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isPatient } = useAuth();
  const { showToast } = useToast();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>('All Cities');
  const [selectedAccreditation, setSelectedAccreditation] = useState<string>('All Accreditations');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [bookingHospital, setBookingHospital] = useState<Hospital | null>(null);
  const [bookingName, setBookingName] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  const fetchHospitals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await hospitalsApi.getAll({
        city: selectedCity === 'All Cities' ? undefined : selectedCity,
        accreditation: selectedAccreditation === 'All Accreditations' ? undefined : selectedAccreditation,
        search: searchTerm.trim() || undefined
      });
      setHospitals(data);
    } catch (err: any) {
      console.error('Failed to load hospitals:', err);
      setError(err.response?.data?.error || err.message || 'Failed to connect to hospital catalog API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [selectedCity, selectedAccreditation]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchHospitals();
  };

  const handleConfirmVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingHospital || !bookingName || !bookingPhone) return;

    setIsSubmittingBooking(true);
    try {
      await inquiriesApi.create({
        patientName: bookingName,
        patientPhone: bookingPhone,
        hospitalId: bookingHospital.id,
        hospitalName: bookingHospital.name,
        procedure: 'Hospital Visit & Preliminary Surgical Consultation',
        notes: `Visitor: ${bookingName} (${bookingPhone}). Notes: ${bookingNotes}`
      });
      const successMsg = `Your visit request at ${bookingHospital.name} has been received! Our surgical desk will contact ${bookingPhone} within 2 hours.`;
      setBookingSuccessMsg(successMsg);
      showToast(successMsg, 'success');
      setBookingHospital(null);
      setBookingName('');
      setBookingPhone('');
      setBookingNotes('');
    } catch (err: any) {
      console.error('Failed to register visit:', err);
      const errMsg = err.response?.data?.error || err.message || 'Failed to register visit. Please try again.';
      showToast(errMsg, 'error');
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="border-b border-sky-400/20 pb-8 mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-cyan-300 bg-sky-500/15 border border-sky-400/35 mb-3 shadow-[0_0_12px_rgba(56,189,248,0.25)]">
          <Building2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Accredited Healthcare Network</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Partner Hospitals Directory ({hospitals.length} Hospitals)
            </h1>
            <p className="text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Browse premier NABH and JCI accredited surgical facilities across India with audited clinical beds and transparent OT infrastructure.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 glass-pill px-4 py-2.5 rounded-xl shadow-xs border border-sky-400/30">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% NABH / JCI Verified</span>
          </div>
        </div>
      </div>

      {bookingSuccessMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 backdrop-blur-md border border-emerald-400/35 text-emerald-200 text-sm flex items-center justify-between shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{bookingSuccessMsg}</span>
          </div>
          <button onClick={() => setBookingSuccessMsg(null)} className="text-xs font-bold text-cyan-300 hover:text-white underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-lg mb-8 border border-sky-400/35 backdrop-blur-2xl">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
          {/* Search Bar */}
          <div className="sm:col-span-6 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by hospital name, area, or landmark..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none transition-all"
            />
          </div>

          {/* City Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3 py-2.5 glass-input rounded-xl text-sm text-white bg-[#081c38] border border-sky-400/30 focus:outline-none cursor-pointer transition-all"
            >
              <option value="All Cities" className="bg-[#071326] text-white">All Cities (Pan India)</option>
              {INDIAN_CITIES.map((c) => (
                <option key={c} value={c} className="bg-[#071326] text-white">
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Accreditation Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedAccreditation}
              onChange={(e) => setSelectedAccreditation(e.target.value)}
              className="w-full px-3 py-2.5 glass-input rounded-xl text-sm text-white bg-[#081c38] border border-sky-400/30 focus:outline-none cursor-pointer transition-all"
            >
              {ACCREDITATION_OPTIONS.map((acc) => (
                <option key={acc} value={acc} className="bg-[#071326] text-white">
                  {acc}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Grid of Hospitals */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
          <p className="text-sm">Loading hospital network directory...</p>
        </div>
      ) : error ? (
        <div className="glass-card border border-rose-500/40 rounded-2xl p-12 text-center">
          <Building2 className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Unable to Load Hospitals</h3>
          <p className="text-xs text-rose-300 mt-1 max-w-sm mx-auto">
            {error}. Please verify the backend server is active.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchHospitals}
            className="mt-4 border-sky-400/35"
          >
            Retry Connection
          </Button>
        </div>
      ) : hospitals.length === 0 ? (
        <div className="glass-card border border-sky-400/30 rounded-2xl p-12 text-center">
          <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Hospitals Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or clearing the city and accreditation filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCity('All Cities');
              setSelectedAccreditation('All Accreditations');
              setSearchTerm('');
            }}
            className="mt-4 border-sky-400/35"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hospitals.map((hospital) => (
            <HospitalCard
              key={hospital.id}
              hospital={hospital}
              onBookVisit={(h) => {
                if (!user || !isPatient) {
                  navigate('/login?redirect=/hospitals');
                  return;
                }
                setBookingName(user.fullName || '');
                setBookingPhone(user.phone || '');
                setBookingHospital(h);
              }}
            />
          ))}
        </div>
      )}

      {/* Book Visit Modal */}
      {bookingHospital && (
        <Modal
          isOpen={Boolean(bookingHospital)}
          onClose={() => setBookingHospital(null)}
          title={`Book Hospital Visit & Tour`}
          subtitle={bookingHospital.name}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmVisit} className="space-y-4">
            <div className="p-3.5 bg-[#081b36] rounded-xl border border-sky-400/25 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-white">{bookingHospital.name}</div>
              <div className="text-slate-400">{bookingHospital.address} &bull; {bookingHospital.city}</div>
              <div>Accreditation: <strong className="text-cyan-300">{bookingHospital.accreditation}</strong> &bull; Beds: {bookingHospital.beds}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1">
                Your Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Anand Joshi"
                value={bookingName}
                onChange={(e) => setBookingName(e.target.value)}
                className="w-full p-2.5 glass-input rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1">
                Contact Phone <span className="text-rose-400">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98000 00000"
                value={bookingPhone}
                onChange={(e) => setBookingPhone(e.target.value)}
                className="w-full p-2.5 glass-input rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 uppercase tracking-wider mb-1">
                Preferred Visit Date / Specific Clinical Question
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Would like an OT tour and insurance desk pre-check this Saturday."
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                className="w-full p-2.5 glass-input rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none transition-all resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setBookingHospital(null)}
                className="border-sky-400/30 text-slate-300 hover:bg-sky-500/15"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmittingBooking}
                className="font-bold px-5"
              >
                Confirm Visit Request
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

