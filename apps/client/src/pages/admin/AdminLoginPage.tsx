import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Shield, Lock, Mail, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await apiClient.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid administrator credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('admin@medimatch.health');
    setPassword('admin123');
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-12">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 gradient-glow-primary pointer-events-none -z-10 opacity-50" />

      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-700 to-indigo-900 border border-sky-400/40 flex items-center justify-center text-white mx-auto shadow-[0_0_30px_rgba(56,189,248,0.35)] mb-4 p-3.5">
            <Shield className="w-8 h-8 text-cyan-300" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Admin Control Panel</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
            Sign in to manage patient records, AI settings, catalogs, and inquiries.
          </p>
        </div>

        <Card className="p-6 sm:p-8 glass-panel border border-sky-400/35 shadow-[0_0_50px_rgba(56,189,248,0.15)] rounded-3xl backdrop-blur-3xl bg-[#091b35]/75">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-fade-in font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@medimatch.health"
                  className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Master Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
              isLoading={isLoading}
              className="w-full font-bold py-3 mt-2 shadow-[0_0_25px_rgba(56,189,248,0.35)] rounded-xl"
            >
              <span>Authenticate & Access Dashboard</span>
              <ArrowRight className="w-4 h-4 ml-2 text-white" />
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-sky-400/15">
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="w-full py-2.5 px-3.5 rounded-xl bg-sky-950/60 hover:bg-sky-900/60 border border-sky-400/30 text-cyan-300 text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xs hover:text-white"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Autofill Demo Admin Credentials</span>
            </button>
            <p className="text-[11px] text-slate-400 text-center mt-2.5">
              Default credentials: <code className="text-cyan-300">admin@medimatch.health</code> / <code className="text-cyan-300">admin123</code>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

