import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Slider } from '../../components/ui/Slider';
import { formatCurrency } from '../../lib/formatCurrency';
import { INDIAN_CITIES } from '@medimatch/shared';
import { Stethoscope, User, Mail, Lock, Phone, MapPin, ShieldCheck, ArrowRight, AlertCircle, IndianRupee } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/assessment';

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    city: 'Mumbai',
    age: 45,
    gender: 'Male',
    budgetCap: 250000
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const budgetPresets = [150000, 250000, 400000, 650000, 1000000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password || !formData.phone.trim()) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await apiClient.post('/auth/register', formData);
      login(res.data.token, res.data.user);
      navigate(redirectPath);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please check your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative max-w-2xl mx-auto px-4 py-10 sm:py-12">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 gradient-glow-primary pointer-events-none -z-10 opacity-75" />

      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-16 h-16 rounded-full border-2 border-cyan-400/60 bg-gradient-to-tr from-sky-500/20 to-blue-600/30 flex items-center justify-center text-cyan-300 mx-auto shadow-[0_0_25px_rgba(56,189,248,0.4)] mb-4 p-4 transition-transform hover:scale-105">
          <Stethoscope className="w-8 h-8 stroke-[2.2] text-cyan-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Create Your Patient Account</h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
          Sign up to unlock instant AI health assessments, surgeon recommendations, and audited hospital pricing.
        </p>
      </div>

      <Card className="p-6 sm:p-8 glass-panel border border-sky-400/40 shadow-[0_0_40px_rgba(56,189,248,0.25)] rounded-3xl animate-fade-in-up backdrop-blur-2xl">
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2 animate-fade-in font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Account Credentials */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
              <span>Account Credentials</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="patient@example.com"
                    className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                  Create Password <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Patient Demographics */}
          <div className="pt-2 border-t border-sky-400/20">
            <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(56,189,248,0.8)]" />
              <span>Patient Profile</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                  Patient Full Name <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Anand R. Joshi"
                    className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                  Contact Phone Number <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98000 00000"
                    className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 glass-input rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3.5 py-2.5 glass-input rounded-xl text-sm text-white bg-[#081c38] focus:outline-none transition-all cursor-pointer font-medium border border-sky-400/30"
                >
                  <option value="Male" className="bg-[#071326] text-white">Male</option>
                  <option value="Female" className="bg-[#071326] text-white">Female</option>
                  <option value="Other" className="bg-[#071326] text-white">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider mb-1.5">
                  City / Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm text-white bg-[#081c38] focus:outline-none transition-all cursor-pointer font-medium border border-sky-400/30"
                  >
                    {INDIAN_CITIES.map((c) => (
                      <option key={c} value={c} className="bg-[#071326] text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Budget Ceiling Slider */}
          <div className="pt-2 border-t border-sky-400/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider block">
                  Maximum Budget Ceiling
                </span>
                <span className="text-xs text-slate-400">
                  AI will prioritize surgical estimates strictly within this limit.
                </span>
              </div>
              <div className="flex items-center gap-1 px-3.5 py-1.5 rounded-2xl bg-sky-500/15 border border-sky-400/35 self-start sm:self-auto shadow-[0_0_12px_rgba(56,189,248,0.25)]">
                <IndianRupee className="w-4 h-4 text-cyan-400" />
                <span className="text-base font-black text-cyan-300 tracking-tight">
                  {formatCurrency(formData.budgetCap).replace('₹', '')}
                </span>
              </div>
            </div>

            <Slider
              min={40000}
              max={1500000}
              step={10000}
              value={formData.budgetCap}
              onChange={(val) => setFormData({ ...formData, budgetCap: val })}
              className="my-3"
            />

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs text-slate-400 font-semibold">Presets:</span>
              {budgetPresets.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setFormData({ ...formData, budgetCap: val })}
                  className={`text-xs px-3 py-1 rounded-full border transition-all duration-200 active:scale-95 ${
                    formData.budgetCap === val
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 font-bold shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                      : 'glass-pill text-slate-300 hover:text-white hover:bg-sky-500/15 border-sky-400/25 font-medium'
                  }`}
                >
                  {formatCurrency(val)}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center text-xs font-bold uppercase tracking-wider py-3 shadow-[0_0_20px_rgba(56,189,248,0.4)]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Complete Registration & Continue</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-[11px] text-center pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted with 256-bit SSL &bull; 100% DISHA & HIPAA Compliant Data Storage</span>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-sky-400/20 text-center">
          <p className="text-xs text-slate-300">
            Already have an account?{' '}
            <Link
              to={`/login?redirect=${encodeURIComponent(redirectPath)}`}
              className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline ml-1"
            >
              Sign In
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};
