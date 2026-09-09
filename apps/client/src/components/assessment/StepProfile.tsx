import React, { useState, useEffect } from 'react';
import { useAssessmentWizard } from '../../context/AssessmentWizardContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Slider } from '../ui/Slider';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../lib/formatCurrency';
import { INDIAN_CITIES } from '@medimatch/shared';
import { User, Phone, MapPin, Mail, IndianRupee, ArrowRight, AlertCircle, ShieldCheck, Lock } from 'lucide-react';

export const StepProfile: React.FC = () => {
  const { profile, updateProfile, setCurrentStep } = useAssessmentWizard();
  const { user } = useAuth();
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>({});

  const budgetPresets = [150000, 250000, 400000, 650000, 1000000];

  useEffect(() => {
    if (user) {
      updateProfile({
        fullName: user.fullName || profile.fullName,
        email: user.email || profile.email,
        phone: profile.phone || user.phone || '',
        city: profile.city || user.city || 'Mumbai',
        age: profile.age || user.age || 45,
        gender: profile.gender || user.gender || 'Male',
        budgetCap: profile.budgetCap || user.budgetCap || 250000
      });
    }
  }, [user]);

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { fullName?: string; phone?: string } = {};

    if (!profile.fullName.trim()) {
      newErrors.fullName = 'Please enter patient full name';
    }
    if (!profile.phone.trim()) {
      newErrors.phone = 'Please enter a valid contact phone number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setCurrentStep(2);
  };

  return (
    <form onSubmit={handleContinue} className="space-y-6">
      <Card className="p-6 sm:p-8 glass-panel border border-sky-400/35 shadow-[0_0_35px_rgba(56,189,248,0.2)] rounded-3xl backdrop-blur-2xl">
        {user && (
          <div className="mb-6 p-4 rounded-2xl glass-card border border-sky-400/30 text-sky-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              <span>Signed in as <strong className="text-white">{user.email}</strong> ({user.fullName})</span>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-cyan-300 border border-sky-400/35 w-fit shadow-xs">
              Verified Patient Account
            </span>
          </div>
        )}

        <div className="border-b border-sky-400/20 pb-5 mb-6">
          <h2 className="text-xl font-bold text-white">Patient Profile & Location</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Provide baseline patient details so MediMatch can match local accredited surgical packages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                Patient Full Name <span className="text-rose-400">*</span>
              </label>
              {user && (
                <span className="text-[11px] text-cyan-400/80 flex items-center gap-1 font-medium">
                  <Lock className="w-3 h-3 text-cyan-400" />
                  <span>Account Verified</span>
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                readOnly={Boolean(user)}
                placeholder="e.g. Ramesh K. Verma"
                value={profile.fullName}
                onChange={(e) => updateProfile({ fullName: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-400 transition-all ${
                  user ? 'glass-input bg-[#091b35]/60 cursor-not-allowed font-medium text-slate-300 border-sky-400/20' : 'glass-input focus:outline-none'
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Contact Phone Number <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                placeholder="e.g. +91 98201 23456"
                value={profile.phone}
                onChange={(e) => updateProfile({ phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm text-white placeholder:text-slate-400 focus:outline-none transition-all"
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                Age (Years)
              </label>
              <input
                type="number"
                min="1"
                max="115"
                placeholder="48"
                value={profile.age}
                onChange={(e) => updateProfile({ age: e.target.value ? Number(e.target.value) : '' })}
                className="w-full px-4 py-2.5 glass-input rounded-xl text-sm text-white focus:outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                Gender
              </label>
              <select
                value={profile.gender}
                onChange={(e) => updateProfile({ gender: e.target.value })}
                className="w-full px-3.5 py-2.5 glass-input rounded-xl text-sm text-white bg-[#081c38] focus:outline-none transition-all cursor-pointer font-medium border border-sky-400/30"
              >
                <option value="Male" className="bg-[#071326] text-white">Male</option>
                <option value="Female" className="bg-[#071326] text-white">Female</option>
                <option value="Other" className="bg-[#071326] text-white">Other</option>
              </select>
            </div>
          </div>

          {/* Target Location City */}
          <div>
            <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Target Location City <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
                <MapPin className="w-4 h-4" />
              </div>
              <select
                value={profile.city}
                onChange={(e) => updateProfile({ city: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm text-white bg-[#081c38] focus:outline-none transition-all cursor-pointer font-medium border border-sky-400/30"
              >
                {INDIAN_CITIES.map((city) => (
                  <option key={city} value={city} className="bg-[#071326] text-white">
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Email */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
                Email Address
              </label>
              {user && (
                <span className="text-[11px] text-cyan-400/80 flex items-center gap-1 font-medium">
                  <Lock className="w-3 h-3 text-cyan-400" />
                  <span>Account Verified</span>
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                readOnly={Boolean(user)}
                placeholder="patient@example.com"
                value={profile.email}
                onChange={(e) => updateProfile({ email: e.target.value })}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-400 transition-all ${
                  user ? 'glass-input bg-[#091b35]/60 cursor-not-allowed font-medium text-slate-300 border-sky-400/20' : 'glass-input focus:outline-none'
                }`}
              />
            </div>
          </div>
        </div>

        {/* Budget Limit Slider */}
        <div className="mt-8 pt-6 border-t border-sky-400/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                Maximum Budget Limit (₹)
              </span>
              <span className="text-xs text-slate-400">
                AI will match surgical packages and OT estimates strictly under this ceiling.
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl glass-card border border-sky-400/35 self-start sm:self-auto shadow-[0_0_15px_rgba(56,189,248,0.25)]">
              <IndianRupee className="w-4 h-4 text-cyan-400" />
              <span className="text-lg font-black text-cyan-300 tracking-tight">
                {formatCurrency(profile.budgetCap).replace('₹', '')}
              </span>
            </div>
          </div>

          <Slider
            min={40000}
            max={1500000}
            step={10000}
            value={profile.budgetCap}
            onChange={(val) => updateProfile({ budgetCap: val })}
            className="my-4"
          />

          <div className="flex items-center justify-between text-xs text-slate-400 mb-3 font-medium">
            <span>₹40,000 (Daycare/Minor)</span>
            <span>₹15,00,000 (Major Transplant/Robotic)</span>
          </div>

          {/* Budget Presets */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-xs text-slate-400 font-semibold">Quick Presets:</span>
            {budgetPresets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => updateProfile({ budgetCap: preset })}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-200 active:scale-95 ${
                  profile.budgetCap === preset
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 font-bold shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                    : 'glass-pill hover:bg-sky-500/15 text-slate-300 border-sky-400/25 font-medium'
                }`}
              >
                {formatCurrency(preset)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Continue CTA */}
      <div className="flex justify-end">
        <Button type="submit" size="lg" className="w-full sm:w-auto font-bold group">
          <span>Continue to Illness & Symptom Reporting</span>
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </form>
  );
};

