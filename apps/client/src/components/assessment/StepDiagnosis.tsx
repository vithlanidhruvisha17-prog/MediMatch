import React, { useState } from 'react';
import { useAssessmentWizard } from '../../context/AssessmentWizardContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { formatCurrency } from '../../lib/formatCurrency';
import { Hospital, Doctor } from '@medimatch/shared';
import { inquiriesApi } from '../../api/inquiries';
import { paymentsApi } from '../../services/paymentsApi';

declare global {
  interface Window {
    Razorpay: any;
  }
}

import {
  CheckCircle2,
  Sparkles,
  Building2,
  UserCheck,
  Stethoscope,
  IndianRupee,
  ShieldCheck,
  Calendar,
  Layers,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Info,
  Clock,
  HeartHandshake
} from 'lucide-react';

export const StepDiagnosis: React.FC = () => {
  const { assessmentResponse, resetWizard, setCurrentStep } = useAssessmentWizard();
  const { showToast } = useToast();

  const [selectedHospitalForBreakdown, setSelectedHospitalForBreakdown] = useState<Hospital | null>(null);
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [bookingHospital, setBookingHospital] = useState<Hospital | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  // Per-card tracking states
  const [bookingInProgressId, setBookingInProgressId] = useState<string | null>(null);
  const [bookedHospitalIds, setBookedHospitalIds] = useState<Record<string, boolean>>({});
  const [bookedDoctorIds, setBookedDoctorIds] = useState<Record<string, boolean>>({});

  const handleBookHospital = async (hosp: Hospital) => {
    if (bookingInProgressId === hosp.id || bookedHospitalIds[hosp.id]) return;

    setBookingInProgressId(hosp.id);
    try {
      const packagePriceFormatted = hosp.costBreakdown?.totalPackagePrice
        ? `₹${hosp.costBreakdown.totalPackagePrice.toLocaleString('en-IN')}`
        : 'Transparent Package';
      const budgetCapFormatted = `₹${patient.budgetCap ? patient.budgetCap.toLocaleString('en-IN') : '2,50,000'}`;

      // 1. Create the inquiry first so we have an inquiryId for the payment
      const inquiry = await inquiriesApi.create({
        patientId: patient.id,
        hospitalId: hosp.id,
        hospitalName: hosp.name,
        procedure: aiPrediction.predictedSurgery,
        notes: `Patient requested booking under budget ceiling ${budgetCapFormatted}. Total Package Quote: ${packagePriceFormatted}. Patient: ${patient.fullName} (${patient.phone})`,
        notifyVia: ['EMAIL'],
      });

      // 2. Create the payment order
      const order = await paymentsApi.createOrder({ type: 'PACKAGE_ADVANCE', inquiryId: inquiry.id });

      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'MediMatch Health',
        description: `Package Advance — ${hosp.name}`,
        handler: async function (response: any) {
          try {
            const verifyRes = await paymentsApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyRes.success) {
              setBookedHospitalIds((prev) => ({ ...prev, [hosp.id]: true }));
              const successMessage = `Payment confirmed & booking request sent for ${hosp.name}!`;
              setBookingSuccess(successMessage);
              showToast(successMessage, 'success', 6000);
              setBookingHospital(null);
              setSelectedHospitalForBreakdown(null);
            } else {
              showToast('Payment verification failed.', 'error', 6000);
            }
          } catch (err: any) {
             showToast('Error verifying payment.', 'error', 6000);
          } finally {
             setBookingInProgressId(null);
          }
        },
        prefill: { name: patient.fullName, email: patient.email, contact: patient.phone },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: function() {
            setBookingInProgressId(null);
          }
        }
      };

      new window.Razorpay(options).open();
    } catch (err: any) {
      console.error('Failed to book hospital package:', err);
      const errMsg = err.response?.data?.error || err.message || 'Failed to submit booking request. Please try again.';
      showToast(errMsg, 'error', 6000);
      setBookingInProgressId(null);
    }
  };

  // NotificationCheckboxes removed
  // Updated Card Footer Buttons section:
  // ... (will be adjusted below)

  if (!assessmentResponse) {
    return (
      <Card className="p-8 text-center glass-card border-sky-400/25 bg-[#091b35]/70">
        <Info className="w-10 h-10 text-cyan-400 mx-auto mb-3" />
        <p className="text-slate-300 font-medium">No assessment result available.</p>
        <Button onClick={resetWizard} className="mt-4" variant="primary">Start New Assessment</Button>
      </Card>
    );
  }

  const { patient, assessment, aiPrediction, matchingHospitals, recommendedDoctors } = assessmentResponse;



  const handleBookDoctor = async (doc: Doctor) => {
    if (bookingInProgressId === doc.id || bookedDoctorIds[doc.id]) return;

    setBookingInProgressId(doc.id);
    try {
      const order = await paymentsApi.createOrder({ type: 'CONSULTATION', doctorId: doc.id });
      
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: 'MediMatch Health',
        description: `Consultation fee — ${doc.name}`,
        handler: async function (response: any) {
          try {
            const verifyRes = await paymentsApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyRes.success) {
              setBookedDoctorIds((prev) => ({ ...prev, [doc.id]: true }));
              const successMessage = `Payment confirmed & consultation booked with ${doc.name}!`;
              setBookingSuccess(successMessage);
              showToast(successMessage, 'success', 6000);
            } else {
              showToast('Payment verification failed.', 'error', 6000);
            }
          } catch (err: any) {
             showToast('Error verifying payment.', 'error', 6000);
          } finally {
             setBookingInProgressId(null);
          }
        },
        prefill: { name: patient.fullName, email: patient.email, contact: patient.phone },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: function() {
            setBookingInProgressId(null);
          }
        }
      };
      
      new window.Razorpay(options).open();
    } catch (err: any) {
      console.error('Failed to initiate payment:', err);
      const errMsg = err.response?.data?.error || err.message || 'Failed to initiate payment. Please try again.';
      showToast(errMsg, 'error', 6000);
      setBookingInProgressId(null);
    }
  };

  // Priority color helper
  const getPriorityVariant = (priorityStr: string) => {
    const p = (priorityStr || '').toLowerCase();
    if (p.includes('urgent') || p.includes('immediate')) return 'danger';
    if (p.includes('moderate') || p.includes('1-2 weeks')) return 'warning';
    return 'success';
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* 1. Green Success Banner */}
      <div className="bg-emerald-500/15 border border-emerald-400/35 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_0_25px_rgba(16,185,129,0.15)] backdrop-blur-xl">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-emerald-500/25 border border-emerald-300/40">
            <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-emerald-300 tracking-tight">
              Health Assessment Saved Under Patient Account!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Record ID: <span className="font-mono font-semibold text-cyan-300">{patient.id}</span> &bull; Patient: <span className="font-bold text-white">{patient.fullName}</span> &bull; Location: {patient.city} &bull; Budget Cap: <span className="font-bold text-cyan-300">{formatCurrency(patient.budgetCap)}</span>
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={resetWizard}
          className="bg-emerald-500/20 border-emerald-400/40 text-emerald-200 hover:bg-emerald-500/30 font-bold self-stretch sm:self-auto shadow-xs"
        >
          New Assessment
        </Button>
      </div>

      {/* Booking Alert if Triggered */}
      {bookingSuccess && (
        <div className="bg-sky-500/15 border border-sky-400/35 text-cyan-200 rounded-xl p-4 text-sm flex items-center justify-between shadow-[0_0_15px_rgba(56,189,248,0.2)] backdrop-blur-md animate-fade-in">
          <div className="flex items-center gap-2 font-medium">
            <HeartHandshake className="w-5 h-5 text-cyan-400 flex-shrink-0" />
            <span>{bookingSuccess}</span>
          </div>
          <button onClick={() => setBookingSuccess(null)} className="text-xs font-bold text-cyan-300 hover:text-white underline">
            Dismiss
          </button>
        </div>
      )}

      {/* 2. AI Clinical Assessment Card */}
      <Card className="p-6 sm:p-8 glass-panel border border-sky-400/35 shadow-[0_0_40px_rgba(56,189,248,0.2)] rounded-2xl relative overflow-hidden">
        {/* Top futuristic glow bar */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-400/10 rounded-full -mr-20 -mt-20 pointer-events-none blur-3xl" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sky-400/20 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500/20 to-blue-500/20 border border-sky-400/40 flex items-center justify-center text-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.3)]">
              <Sparkles className="w-4 h-4 animate-pulse-subtle" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400">
              AI Clinical Prediction
            </span>
          </div>

          <Badge
            variant={getPriorityVariant(aiPrediction.priority)}
            className="text-xs px-3.5 py-1 font-bold shadow-xs"
          >
            {aiPrediction.priority}
          </Badge>
        </div>

        {aiPrediction.predictedSurgery.toLowerCase().includes('insufficient') && (
          <div className="p-4 sm:p-5 bg-amber-500/15 border border-amber-400/40 rounded-2xl mb-5 space-y-3 shadow-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-sm text-white">Clinical Symptoms Were Insufficient</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  The illness description or symptoms entered were generic or placeholders (e.g. &quot;NA&quot;). An accurate surgical indication and transparent hospital package estimate requires describing your real physical symptoms (such as location of pain, how long it lasts, swelling, or functional difficulties).
                </p>
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCurrentStep(2)}
                className="font-bold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 border-0 shadow-md"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>Return to Step 2 &amp; Describe Real Symptoms</span>
              </Button>
            </div>
          </div>
        )}

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Indication for Procedure:
          </span>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight mt-1 mb-3">
            {aiPrediction.predictedSurgery}
          </h1>

          <div className="p-4 bg-[#081c38]/80 rounded-xl border border-sky-400/25 mb-4 backdrop-blur-md">
            <p className="text-sm text-slate-200 leading-relaxed font-medium">
              {aiPrediction.summary}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              Specialty: <strong className="text-cyan-300">{aiPrediction.specialty}</strong>
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Evidence-based Clinical Stratification
            </span>
          </div>
        </div>
      </Card>

      {/* 3. Top Recommended Specialists (2x2 Grid) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-cyan-400" />
              <span>Top Recommended Specialists for Your Case</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Experienced surgeons specialized in {aiPrediction.specialty}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendedDoctors.map((doctor) => (
            <Card key={doctor.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 card-lift rounded-2xl glass-card border border-sky-400/30 shadow-lg">
              <img
                src={doctor.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400'}
                alt={doctor.name}
                className="w-16 h-16 rounded-xl object-cover border-2 border-sky-400/40 shadow-sm ring-2 ring-cyan-500/20 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-white truncate">{doctor.name}</h3>
                <p className="text-xs font-bold text-cyan-400 mt-0.5">{doctor.specialty}</p>
                <p className="text-xs text-slate-400 truncate mt-0.5">{doctor.credentials}</p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="text-slate-300 font-semibold">{doctor.yearsExp} Yrs Exp</span>
                  <span className="font-bold text-white">{formatCurrency(doctor.fee)} Fee</span>
                </div>
              </div>
              <Button
                variant={bookedDoctorIds[doctor.id] ? 'success' : 'outline'}
                size="sm"
                disabled={bookedDoctorIds[doctor.id] || bookingInProgressId === doctor.id}
                isLoading={bookingInProgressId === doctor.id}
                onClick={() => handleBookDoctor(doctor)}
                className={`text-xs w-full sm:w-auto self-end sm:self-center font-semibold ${
                  bookedDoctorIds[doctor.id]
                    ? 'bg-emerald-600 hover:bg-emerald-600 text-white border-emerald-500 cursor-default'
                    : 'border-sky-400/35 text-cyan-300 hover:bg-sky-500/20'
                }`}
              >
                {bookedDoctorIds[doctor.id] ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>Payment Confirmed</span>
                  </span>
                ) : bookingInProgressId === doctor.id ? (
                  'Processing...'
                ) : (
                  `Pay ${formatCurrency(doctor.fee)} to Book`
                )}
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* 4. Matching Hospitals & Surgical Packages Under Budget */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              <span>Matching Hospitals & Surgical Packages Under Budget</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Itemized estimates guaranteed under your budget ceiling of <strong className="text-white">{formatCurrency(patient.budgetCap)}</strong>
            </p>
          </div>
          <Badge variant="success" className="self-start sm:self-auto text-xs px-2.5 py-1">
            {matchingHospitals.length} Matched in {patient.city}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {matchingHospitals.map((hospital) => {
            const cost = hospital.costBreakdown;
            if (!cost) return null;

            return (
              <Card key={hospital.id} className="p-6 glass-card border border-sky-400/30 shadow-lg rounded-2xl flex flex-col justify-between card-lift">
                {/* Header Row: Title left, Total Price top-right */}
                <div>
                  <div className="flex items-start justify-between gap-3 border-b border-sky-400/20 pb-3.5 mb-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800/80 text-cyan-300 border border-sky-400/30">
                          {hospital.city}
                        </span>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/35 shadow-xs">
                          {hospital.accreditation}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white truncate">
                        {hospital.name}
                      </h3>
                      <p className="text-xs text-slate-400 truncate mt-0.5">{hospital.address}</p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Total Package
                      </span>
                      <span className="text-xl font-black text-cyan-400 tracking-tight drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">
                        {formatCurrency(cost.totalPackagePrice)}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-400 block mt-0.5">
                        Save {formatCurrency(cost.budgetSavings)}
                      </span>
                    </div>
                  </div>

                  {/* 2x2 Mini-Grid Cost Breakdown */}
                  <div className="grid grid-cols-2 gap-2.5 mb-5">
                    <div className="p-3 bg-[#081c38]/70 rounded-xl border border-sky-400/20 hover:border-sky-400/40 transition-colors">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Surgeon & Anesthesia</div>
                      <div className="text-sm font-black text-white mt-0.5">
                        {formatCurrency(cost.surgeonFee)}
                      </div>
                    </div>

                    <div className="p-3 bg-[#081c38]/70 rounded-xl border border-sky-400/20 hover:border-sky-400/40 transition-colors">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OT / Energy System</div>
                      <div className="text-sm font-black text-white mt-0.5">
                        {formatCurrency(cost.otCharges)}
                      </div>
                    </div>

                    <div className="p-3 bg-[#081c38]/70 rounded-xl border border-sky-400/20 hover:border-sky-400/40 transition-colors">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Room & Nursing Care</div>
                      <div className="text-sm font-black text-white mt-0.5">
                        {formatCurrency(cost.roomRate)}
                      </div>
                    </div>

                    <div className="p-3 bg-[#081c38]/70 rounded-xl border border-sky-400/20 hover:border-sky-400/40 transition-colors">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Medicines & Consumables</div>
                      <div className="text-sm font-black text-white mt-0.5">
                        {formatCurrency(cost.medicines)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Buttons */}
                <div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedHospitalForBreakdown(hospital)}
                      className="flex-1 text-xs font-bold border-sky-400/30 text-slate-200 hover:bg-sky-500/15 hover:text-white justify-center py-2"
                    >
                      View Full Cost Breakdown
                    </Button>
                    <Button
                      variant={bookedHospitalIds[hospital.id] ? 'success' : 'primary'}
                      size="sm"
                      disabled={bookedHospitalIds[hospital.id] || bookingInProgressId === hospital.id}
                      isLoading={bookingInProgressId === hospital.id}
                      onClick={() => handleBookHospital(hospital)}
                      className={`flex-1 text-xs font-semibold justify-center ${
                        bookedHospitalIds[hospital.id]
                          ? 'bg-emerald-600 hover:bg-emerald-600 text-white cursor-default'
                          : ''
                      }`}
                    >
                    {bookedHospitalIds[hospital.id] ? (
                      <span className="flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>Payment Confirmed</span>
                      </span>
                    ) : bookingInProgressId === hospital.id ? (
                      'Processing...'
                    ) : (
                      'Pay ₹1,000 Advance'
                    )}
                  </Button>
                </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* 5. Detailed Itemized Cost Breakdown Modal */}
      {selectedHospitalForBreakdown && selectedHospitalForBreakdown.costBreakdown && (
        <Modal
          isOpen={Boolean(selectedHospitalForBreakdown)}
          onClose={() => setSelectedHospitalForBreakdown(null)}
          title={`Surgical Cost Breakdown: ${selectedHospitalForBreakdown.name}`}
          subtitle={`${aiPrediction.predictedSurgery} • ${selectedHospitalForBreakdown.city}`}
          maxWidth="lg"
        >
          <div className="space-y-6">
            <div className="p-4 bg-sky-500/15 border border-sky-400/35 rounded-xl flex items-center justify-between shadow-[0_0_15px_rgba(56,189,248,0.2)]">
              <div>
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
                  All-Inclusive Package Estimate
                </span>
                <span className="text-2xl font-black text-white drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">
                  {formatCurrency(selectedHospitalForBreakdown.costBreakdown.totalPackagePrice)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Your Budget Ceiling:</span>
                <span className="text-sm font-bold text-slate-400 line-through">
                  {formatCurrency(patient.budgetCap)}
                </span>
                <div className="text-xs font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-400/35 px-2 py-0.5 rounded-full mt-0.5">
                  Savings: {formatCurrency(selectedHospitalForBreakdown.costBreakdown.budgetSavings)}
                </div>
              </div>
            </div>

            {/* Itemized Table - Health Daily Frosted Glass Style */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center justify-between">
                <span>Itemized Cost Schedule</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">Verified Estimate</span>
              </h4>
              <div className="bg-[#0b1d2d]/80 backdrop-blur-2xl border border-white/15 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-xs text-left min-w-[340px]">
                  <thead className="bg-black/30 border-b border-white/10 text-slate-300 font-semibold tracking-wider text-xs">
                    <tr>
                      <th className="py-3 px-4">Component</th>
                      <th className="py-3 px-4 text-right">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10 text-slate-200">
                    <tr className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">Chief Surgeon & Anesthesia Team Fee</div>
                        <div className="text-[11px] text-slate-400">Includes pre-op workup and 5 days in-hospital surgical rounds</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-teal-300">
                        {formatCurrency(selectedHospitalForBreakdown.costBreakdown.surgeonFee)}
                      </td>
                    </tr>
                    <tr className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">Operation Theatre (OT) & High-Tech Navigation</div>
                        <div className="text-[11px] text-slate-400">Sterilization, advanced harmonic scalpels, and surgical robotics</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-teal-300">
                        {formatCurrency(selectedHospitalForBreakdown.costBreakdown.otCharges)}
                      </td>
                    </tr>
                    <tr className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">Room & Nursing Accommodation</div>
                        <div className="text-[11px] text-slate-400">Estimated {selectedHospitalForBreakdown.costBreakdown.stayDurationDays} days inpatient twin/private room + nursing care</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-teal-300">
                        {formatCurrency(selectedHospitalForBreakdown.costBreakdown.roomRate)}
                      </td>
                    </tr>
                    <tr className="hover:bg-white/[0.03] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">Medicines, Consumables & Drapes</div>
                        <div className="text-[11px] text-slate-400">IV fluids, sutures, monitoring patches, and take-home medications</div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-teal-300">
                        {formatCurrency(selectedHospitalForBreakdown.costBreakdown.medicines)}
                      </td>
                    </tr>
                    <tr className="bg-teal-500/15 border-t border-teal-400/30 font-bold text-white shadow-inner">
                      <td className="py-3.5 px-4 text-sm font-bold text-white">Total Package Price</td>
                      <td className="py-3.5 px-4 text-right font-mono text-sm text-emerald-400 font-black">
                        {formatCurrency(selectedHospitalForBreakdown.costBreakdown.totalPackagePrice)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Hospital Overview */}
            <div className="p-4 bg-[#0b1d2d]/80 backdrop-blur-2xl rounded-2xl border border-white/15 text-xs text-slate-300 space-y-1.5 shadow-lg">
              <div className="font-bold text-sm text-white flex items-center justify-between">
                <span>{selectedHospitalForBreakdown.name}</span>
                <span className="text-[11px] font-semibold text-teal-300 px-2.5 py-0.5 rounded-full bg-teal-500/20 border border-teal-400/30">
                  {selectedHospitalForBreakdown.accreditation}
                </span>
              </div>
              <div className="text-slate-400">Address: {selectedHospitalForBreakdown.address}</div>
              <div className="text-slate-300 pt-1 border-t border-white/10 flex items-center gap-4">
                <span>Total Beds: <strong className="text-white">{selectedHospitalForBreakdown.beds}</strong></span>
                <span>ICU Beds: <strong className="text-teal-300">{selectedHospitalForBreakdown.icuBeds}</strong></span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedHospitalForBreakdown(null)}
                className="border-sky-400/30 text-slate-300 hover:bg-sky-500/15"
              >
                Close
              </Button>
              <Button
                variant={selectedHospitalForBreakdown && bookedHospitalIds[selectedHospitalForBreakdown.id] ? 'success' : 'primary'}
                size="sm"
                isLoading={selectedHospitalForBreakdown ? bookingInProgressId === selectedHospitalForBreakdown.id : false}
                disabled={selectedHospitalForBreakdown ? (bookedHospitalIds[selectedHospitalForBreakdown.id] || bookingInProgressId === selectedHospitalForBreakdown.id) : false}
                onClick={() => selectedHospitalForBreakdown && handleBookHospital(selectedHospitalForBreakdown)}
                className={`font-bold px-5 ${
                  selectedHospitalForBreakdown && bookedHospitalIds[selectedHospitalForBreakdown.id]
                    ? 'bg-emerald-600 hover:bg-emerald-600 text-white cursor-default'
                    : ''
                }`}
              >
                {selectedHospitalForBreakdown && bookedHospitalIds[selectedHospitalForBreakdown.id] ? (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                    <span>Booking Confirmed</span>
                  </span>
                ) : (
                  'Confirm Surgical Booking'
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

