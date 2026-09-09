import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doctor } from '@medimatch/shared';
import { doctorsApi } from '../../api/doctors';
import { inquiriesApi } from '../../api/inquiries';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { formatCurrency } from '../../lib/formatCurrency';
import { UserCheck, Search, Stethoscope, Award, Loader2, CheckCircle2 } from 'lucide-react';

export const SpecialistsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isPatient } = useAuth();
  const { showToast } = useToast();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All Specialties');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const specialties = [
    'All Specialties',
    'Surgical Oncology',
    'Cardiothoracic Surgery',
    'Orthopedics & Joint Reconstruction',
    'Surgical Gastroenterology & Laparoscopy',
    'Neurosurgery & Spine',
    'Urology & Endourology',
    'Gynecology & Laparoscopic Surgery',
    'Thoracic & Robotic Surgery',
    'Head, Neck & Endocrine Surgery'
  ];

  const fetchDoctors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await doctorsApi.getAll({
        specialty: selectedSpecialty === 'All Specialties' ? undefined : selectedSpecialty,
        search: searchTerm.trim() || undefined
      });
      setDoctors(data);
    } catch (err: any) {
      console.error('Failed to load doctors:', err);
      setError(err.response?.data?.error || err.message || 'Failed to connect to specialists directory API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleBookConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDoctor || !patientName || !patientPhone) return;

    setIsSubmitting(true);
    try {
      await inquiriesApi.create({
        patientName,
        patientPhone,
        procedure: `Specialist Consultation with ${bookingDoctor.name} (${bookingDoctor.specialty})`,
        notes: `Patient: ${patientName} (${patientPhone}). Consultation Fee: ₹${bookingDoctor.fee}. Notes: ${notes}`
      });
      const successMsg = `Appointment request scheduled with ${bookingDoctor.name}! A coordinator will call ${patientPhone} to confirm the time slot.`;
      setBookingSuccess(successMsg);
      showToast(successMsg, 'success');
      setBookingDoctor(null);
      setPatientName('');
      setPatientPhone('');
      setNotes('');
    } catch (err: any) {
      console.error('Failed to book consultation:', err);
      const errMsg = err.response?.data?.error || err.message || 'Failed to book consultation. Please try again.';
      showToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="border-b border-sky-400/20 pb-8 mb-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
          <Stethoscope className="w-4 h-4" />
          <span>Verified Surgical Faculty</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Surgical Specialists Directory ({doctors.length} Doctors)
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Connect with board-certified chief operating surgeons across oncology, cardiology, orthopedics, urology, and robotics.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-slate-200 glass-pill border border-sky-400/30 px-3.5 py-2 rounded-xl shadow-xs">
            <Award className="w-4 h-4 text-cyan-400" />
            <span>Average 25+ Years Clinical Experience</span>
          </div>
        </div>
      </div>

      {bookingSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/15 border border-emerald-400/35 text-emerald-200 text-sm flex items-center justify-between shadow-[0_0_20px_rgba(16,185,129,0.2)]">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>{bookingSuccess}</span>
          </div>
          <button onClick={() => setBookingSuccess(null)} className="text-xs font-bold text-cyan-300 hover:text-white underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 shadow-lg mb-8 border border-sky-400/35 backdrop-blur-2xl">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
          <div className="sm:col-span-7 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by doctor name, credential, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none transition-all"
            />
          </div>

          <div className="sm:col-span-5">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-3 py-2.5 glass-input rounded-xl text-sm text-white bg-[#081c38] border border-sky-400/30 focus:outline-none cursor-pointer transition-all"
            >
              {specialties.map((s) => (
                <option key={s} value={s} className="bg-[#071326] text-white">
                  {s}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Doctor Cards */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
          <p className="text-sm">Loading surgical specialists...</p>
        </div>
      ) : error ? (
        <div className="glass-panel border border-rose-500/40 rounded-2xl p-12 text-center">
          <UserCheck className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Unable to Load Specialists</h3>
          <p className="text-xs text-rose-300 mt-1 max-w-sm mx-auto">
            {error}. Please verify the backend server is active.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDoctors}
            className="mt-4 border-sky-400/35"
          >
            Try Again
          </Button>
        </div>
      ) : doctors.length === 0 ? (
        <div className="glass-panel border border-sky-400/30 rounded-2xl p-12 text-center">
          <UserCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Doctors Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting the specialty filter.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedSpecialty('All Specialties');
              setSearchTerm('');
            }}
            className="mt-4 border-sky-400/35"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <Card key={doctor.id} hover className="group p-6 flex flex-col justify-between rounded-2xl border border-sky-400/30 shadow-lg card-lift glass-card">
              <div>
                <div className="flex items-start gap-3.5 mb-3.5">
                  <img
                    src={doctor.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400'}
                    alt={doctor.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-400/40 shadow-md ring-2 ring-cyan-500/20 flex-shrink-0 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-white truncate group-hover:text-cyan-300 transition-colors">{doctor.name}</h3>
                    <span className="inline-block text-[11px] font-bold text-cyan-300 glass-pill px-2.5 py-0.5 rounded-full mt-1 border border-sky-400/30">
                      {doctor.specialty}
                    </span>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">{doctor.credentials}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 bg-[#081c38]/70 backdrop-blur-md rounded-xl text-xs text-slate-300 mb-4 border border-sky-400/20">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">Experience</span>
                    <span className="font-extrabold text-white">{doctor.yearsExp} Years</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">Consultation</span>
                    <span className="font-extrabold text-cyan-400">{formatCurrency(doctor.fee)}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!user || !isPatient) {
                    navigate('/login?redirect=/specialists');
                    return;
                  }
                  setPatientName(user.fullName || '');
                  setPatientPhone(user.phone || '');
                  setBookingDoctor(doctor);
                }}
                className="w-full border-sky-400/35 bg-sky-500/10 hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 hover:text-white text-cyan-300 font-bold py-2 shadow-xs transition-all duration-300"
              >
                Book Consultation
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* Book Doctor Modal */}
      {bookingDoctor && (
        <Modal
          isOpen={Boolean(bookingDoctor)}
          onClose={() => setBookingDoctor(null)}
          title={`Book Consultation: ${bookingDoctor.name}`}
          subtitle={`${bookingDoctor.specialty} • Fee: ${formatCurrency(bookingDoctor.fee)}`}
          maxWidth="md"
        >
          <form onSubmit={handleBookConsultation} className="space-y-4">
            <div className="p-3 bg-sky-950/60 rounded-xl border border-sky-400/30 text-xs text-cyan-200">
              Consultation includes clinical review of radiological images (MRI/CT), pathology reports, and surgical indications.
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Patient Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Patel"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full p-2.5 bg-[#061427]/80 border border-sky-400/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Contact Phone <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98000 00000"
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                className="w-full p-2.5 bg-[#061427]/80 border border-sky-400/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Primary Symptoms / Notes for Doctor
              </label>
              <textarea
                rows={2}
                placeholder="Briefly state symptoms, duration, or previous diagnosis..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 bg-[#061427]/80 border border-sky-400/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setBookingDoctor(null)}
                className="border-sky-400/30 text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                className="font-bold px-5"
              >
                Confirm Appointment Request
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

