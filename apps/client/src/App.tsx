import React, { useState } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HealthAssistantWidget } from './components/chat/HealthAssistantWidget';
import { AssessmentWizardProvider } from './context/AssessmentWizardContext';
import { RequirePatient, RequireAdmin } from './components/auth/RouteGuards';
import { LoginPage } from './pages/patient/LoginPage';
import { RegisterPage } from './pages/patient/RegisterPage';
import { MyAccountPage } from './pages/patient/MyAccountPage';
import { AssessmentPage } from './pages/patient/AssessmentPage';
import { HospitalsPage } from './pages/patient/HospitalsPage';
import { SpecialistsPage } from './pages/patient/SpecialistsPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { MessageSquare } from 'lucide-react';

export const App: React.FC = () => {
  const location = useLocation();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const isAdminRoute = location.pathname.startsWith('/admin') && location.pathname !== '/admin/login';

  return (
    <AssessmentWizardProvider>
      <div className="min-h-screen flex flex-col bg-[#071326] text-slate-100 relative overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
        {/* Dynamic ambient glass mesh lights */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          {/* Top-center vibrant cyan orb */}
          <div className="absolute -top-20 left-[15%] w-[48rem] h-[38rem] bg-gradient-to-br from-cyan-500/20 via-sky-600/15 to-blue-700/10 rounded-full blur-[120px] animate-float" />
          {/* Middle-center rich sapphire blue orb */}
          <div className="absolute top-[26%] left-[24%] w-[46rem] h-[42rem] bg-gradient-to-tr from-blue-600/22 via-cyan-500/18 to-indigo-600/15 rounded-full blur-[130px] animate-pulse-subtle" />
          {/* Left-side oceanic teal orb */}
          <div className="absolute top-[35%] -left-20 w-[42rem] h-[42rem] bg-gradient-to-r from-teal-500/18 to-cyan-500/16 rounded-full blur-[120px]" />
          {/* Right-side deep cyan-blue orb */}
          <div className="absolute top-[50%] -right-20 w-[44rem] h-[44rem] bg-gradient-to-l from-blue-500/22 to-sky-400/16 rounded-full blur-[130px]" />
          {/* Bottom emerald-teal orb */}
          <div className="absolute -bottom-24 left-[15%] w-[50rem] h-[42rem] bg-gradient-to-tl from-emerald-500/16 via-teal-500/15 to-blue-600/12 rounded-full blur-[140px]" />
        </div>

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Navbar with variant */}
          <Navbar
            variant={isAdminRoute ? 'admin' : 'patient'}
            onOpenAssistant={() => setIsAssistantOpen(true)}
          />

          {/* Main Routed Content */}
          <main className="flex-1">
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Patient Portal - Protected: Mandatory Patient Authentication */}
            <Route path="/" element={<RequirePatient><AssessmentPage /></RequirePatient>} />
            <Route path="/assessment" element={<RequirePatient><AssessmentPage /></RequirePatient>} />
            <Route path="/account" element={<RequirePatient><MyAccountPage /></RequirePatient>} />

            {/* Public Informational Catalogs */}
            <Route path="/hospitals" element={<HospitalsPage />} />
            <Route path="/specialists" element={<SpecialistsPage />} />

            {/* Admin Portal */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<RequireAdmin><AdminDashboardPage /></RequireAdmin>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Floating Health Assistant Chat Widget */}
        <HealthAssistantWidget
          isOpen={isAssistantOpen}
          onClose={() => setIsAssistantOpen(false)}
        />

        {/* Floating Launcher Button (Patient Portal Only) */}
        {!isAdminRoute && !isAssistantOpen && (
          <button
            onClick={() => setIsAssistantOpen(true)}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 sm:gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 bg-gradient-to-r from-sky-600 via-blue-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 backdrop-blur-xl text-white rounded-full shadow-[0_0_25px_rgba(56,189,248,0.4)] hover:shadow-[0_0_35px_rgba(56,189,248,0.6)] transition-all duration-300 hover:scale-105 active:scale-95 select-none focus:outline-none focus:ring-4 focus:ring-cyan-400/30 border border-cyan-400/40 group"
            title="Open Virtual Health & Surgical Counselor"
          >
            <div className="relative flex items-center justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-300 animate-ping absolute" />
              <span className="w-2 h-2 rounded-full bg-cyan-400 relative" />
            </div>
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:rotate-6 text-cyan-100" />
            <span className="text-xs font-extrabold tracking-wide">Health Assistant</span>
          </button>
        )}

        {/* Footer */}
        {!isAdminRoute && <Footer />}
        </div>
      </div>
    </AssessmentWizardProvider>
  );
};

