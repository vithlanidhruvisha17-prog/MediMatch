import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  Shield,
  MessageSquare,
  LogOut,
  ArrowRight,
  Activity,
  Building2,
  Users,
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { seedApi } from '../../api/seed';

interface NavbarProps {
  variant?: 'patient' | 'admin';
  onOpenAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ variant = 'patient', onOpenAssistant }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isPatient: authIsPatient, isAdmin, logout } = useAuth();
  const [stats, setStats] = useState<{ totalPatients: number; totalHospitals: number; totalInquiries: number } | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (variant === 'admin') {
      seedApi.getStats().then(setStats).catch(() => {});
    }
  }, [variant, location.pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isPatient = variant === 'patient';

  const navLinks = [
    { label: 'AI Health Assessment', path: '/assessment' },
    { label: 'Hospitals Directory', path: '/hospitals' },
    { label: 'Specialists', path: '/specialists' },
    ...(authIsPatient ? [{ label: 'My Account', path: '/account' }] : [])
  ];

  return (
    <header
      className="glass-header border-b border-sky-400/20 sticky top-0 z-40 text-slate-100 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link to={isPatient ? '/' : '/admin'} className="flex items-center gap-2.5 sm:gap-3 group">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(56,189,248,0.35)] group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(56,189,248,0.5)] transition-all duration-300 border border-sky-400/40">
                <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-white">
                    MediMatch
                  </span>
                  <span className="text-[10px] sm:text-[11px] font-bold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/35 shadow-[0_0_10px_rgba(56,189,248,0.2)] backdrop-blur-md">
                    {isPatient ? 'Patient Portal' : 'Admin'}
                  </span>
                </div>
                <p className="hidden md:block text-xs text-slate-400 font-medium">
                  {isPatient
                    ? 'Surgical Financial Counseling & Medical AI Prediction'
                    : 'Manage Patient Health Profiles, AI Predictions, Provider Keys & Catalogs'}
                </p>
              </div>
            </Link>
          </div>

          {/* Center Links (Patient) or Stat Badges (Admin) */}
          {isPatient ? (
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5 glass-pill p-1 rounded-2xl border border-sky-400/25 shadow-xs">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={
                      isActive
                        ? 'px-4 py-2 rounded-xl text-xs font-bold text-cyan-300 bg-sky-500/20 shadow-[0_0_15px_rgba(56,189,248,0.25)] border border-sky-400/40 backdrop-blur-md transition-all duration-200'
                        : 'px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-sky-500/10 transition-all duration-200'
                    }
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          ) : (
            <div className="hidden lg:flex items-center gap-3">
              {stats && (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0b203e]/80 border border-sky-400/25 text-xs shadow-xs">
                    <Users className="w-3.5 h-3.5 text-sky-400" />
                    <span className="text-slate-300 font-medium">{stats.totalPatients} Patient Profiles</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0b203e]/80 border border-emerald-400/25 text-xs shadow-xs">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-slate-300 font-medium">{stats.totalHospitals} Partner Hospitals</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0b203e]/80 border border-amber-400/25 text-xs shadow-xs">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-slate-300 font-medium">{stats.totalInquiries} Inquiries</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Action CTAs & Mobile Hamburger */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {isPatient ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenAssistant}
                  className="hidden lg:inline-flex border-sky-400/35 bg-sky-500/10 text-sky-300 hover:bg-sky-500/20 text-xs"
                >
                  <MessageSquare className="w-4 h-4 text-cyan-400 mr-1" />
                  <span>Health Assistant</span>
                </Button>

                {authIsPatient && user ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/account')}
                      className="border-sky-400/35 bg-[#0b203e]/60 text-slate-200 hover:bg-sky-500/20 text-xs hidden sm:inline-flex"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
                      <span className="max-w-[120px] truncate">{user.fullName?.split(' ')[0] || 'My Account'}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        logout();
                        navigate('/login');
                      }}
                      className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 text-xs p-2 hidden sm:inline-flex"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/login')}
                      className="text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 hidden sm:inline-flex"
                    >
                      <span>Sign In</span>
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/register')}
                      className="text-xs font-semibold shadow-none hidden sm:inline-flex"
                    >
                      <span>Register</span>
                    </Button>
                  </>
                )}

                {!isAdmin && (
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => navigate('/admin/login')}
                    className="text-xs hidden sm:inline-flex ml-1 border-sky-400/30"
                  >
                    <Shield className="w-3 h-3 text-sky-400 mr-1" />
                    <span>Admin</span>
                  </Button>
                )}

                {/* Mobile Menu Hamburger Toggle */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Toggle navigation menu"
                  className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
                >
                  {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/')}
                  className="text-xs shadow-none px-2.5 sm:px-3"
                >
                  <span className="hidden sm:inline">Switch to Patient Portal</span>
                  <span className="sm:hidden">Portal</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>

                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      logout();
                      navigate('/admin/login');
                    }}
                    className="text-slate-300 hover:text-white hover:bg-slate-800"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer (Patient Portal) */}
      {isPatient && isMobileMenuOpen && (
        <div className="md:hidden border-t border-sky-400/20 glass-header px-4 pt-3 pb-6 space-y-3 shadow-2xl animate-fade-in-up">
          <nav className="space-y-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? 'text-cyan-300 bg-sky-500/20 border border-sky-400/40 shadow-xs'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-sky-400/20 space-y-2">
            {onOpenAssistant && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenAssistant();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl bg-sky-500/15 text-cyan-300 text-xs font-bold border border-sky-400/35 shadow-[0_0_15px_rgba(56,189,248,0.2)] hover:shadow-[0_0_20px_rgba(56,189,248,0.3)] transition-all"
              >
                <MessageSquare className="w-4 h-4 text-cyan-400" />
                <span>Virtual Health Assistant</span>
              </button>
            )}

            {authIsPatient && user ? (
              <div className="flex items-center gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/account');
                  }}
                  className="flex-1 text-xs justify-center"
                >
                  <UserIcon className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                  <span className="truncate">{user.fullName || 'My Account'}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="text-xs text-rose-400 hover:bg-rose-500/15 p-2"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full text-xs justify-center font-semibold"
                >
                  Sign In
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/register');
                  }}
                  className="w-full text-xs justify-center font-semibold"
                >
                  Register
                </Button>
              </div>
            )}

            {!isAdmin && (
              <Button
                variant="glass"
                size="sm"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/admin/login');
                }}
                className="w-full text-xs justify-center mt-2 border-sky-400/30"
              >
                <Shield className="w-3.5 h-3.5 mr-1 text-sky-400" />
                <span>Admin Control Panel</span>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};


