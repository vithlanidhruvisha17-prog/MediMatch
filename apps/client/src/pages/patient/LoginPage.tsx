import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Stethoscope, Lock, Mail, ArrowRight, AlertCircle, Sparkles, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Retrieve redirect URL from query string if available
  const searchParams = new URLSearchParams(location.search);
  const redirectPath = searchParams.get('redirect') || '/assessment';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await apiClient.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);

      if (res.data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate(redirectPath);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoPatient = () => {
    setEmail('rajesh.sharma@example.com');
    setPassword('patient123');
    setError(null);
  };

  const fillDemoAdmin = () => {
    setEmail('admin@medimatch.health');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="relative min-h-[82vh] flex items-center justify-center px-4 py-12">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 gradient-glow-primary pointer-events-none -z-10 opacity-75" />

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full border-2 border-cyan-400/60 bg-gradient-to-tr from-sky-500/20 to-blue-600/30 flex items-center justify-center text-cyan-300 mx-auto shadow-[0_0_25px_rgba(56,189,248,0.4)] mb-4 p-4 transition-transform hover:scale-105">
            <Stethoscope className="w-8 h-8 stroke-[2.2] text-cyan-300 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Sign In to MediMatch</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xs mx-auto leading-relaxed">
            Access your AI surgical predictions, financial counselor quotes, and accredited hospital packages.
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-6 sm:p-8 glass-panel border border-sky-400/40 shadow-[0_0_40px_rgba(56,189,248,0.25)] rounded-3xl backdrop-blur-2xl">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2 animate-fade-in font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-cyan-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center text-xs font-bold uppercase tracking-wider py-3 mt-2 shadow-[0_0_20px_rgba(56,189,248,0.4)]"
              disabled={isLoading}
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </Button>
          </form>

          {/* Switch to Register */}
          <div className="mt-6 pt-5 border-t border-sky-400/20 text-center">
            <p className="text-xs text-slate-300">
              Don't have a patient account?{' '}
              <Link
                to={`/register?redirect=${encodeURIComponent(redirectPath)}`}
                className="font-bold text-cyan-400 hover:text-cyan-300 hover:underline ml-1"
              >
                Create Account
              </Link>
            </p>
          </div>

          {/* Quick 1-Click Demo Credentials */}
          <div className="mt-5 p-3.5 rounded-2xl glass-card border border-sky-400/25 shadow-xs">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
              Quick 1-Click Demo Accounts
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={fillDemoPatient}
                className="px-2.5 py-1.5 rounded-xl glass-pill text-[11px] font-bold text-slate-200 hover:bg-sky-500/20 hover:text-cyan-300 hover:border-sky-400/50 transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-95 border border-sky-400/25"
              >
                <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Demo Patient</span>
              </button>
              <button
                type="button"
                onClick={fillDemoAdmin}
                className="px-2.5 py-1.5 rounded-xl glass-pill text-[11px] font-bold text-slate-200 hover:bg-sky-500/20 hover:text-cyan-300 hover:border-sky-400/50 transition-all flex items-center justify-center gap-1.5 shadow-xs active:scale-95 border border-sky-400/25"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo Admin</span>
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
