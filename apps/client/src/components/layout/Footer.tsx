import React from 'react';
import { Stethoscope, ShieldCheck, HeartPulse, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="glass-header border-t border-sky-400/20 mt-20 text-slate-300 relative overflow-hidden shadow-[0_-8px_32px_rgba(0,0,0,0.5)]">
      {/* Ambient top gradient line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1 */}
          <div className="md:col-span-1 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(56,189,248,0.35)] border border-sky-400/40">
                <Stethoscope className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-white tracking-tight">MediMatch</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India's transparent surgical financial counseling and AI medical prediction platform. Enabling patients to budget accurately before surgery.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/35 text-xs text-emerald-300 font-semibold shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>NABH & JCI Hospital Standards</span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
              <span>Portals & Tools</span>
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/assessment" className="text-slate-400 hover:text-cyan-300 transition-colors inline-block hover:translate-x-0.5 transform duration-150">
                  AI Health Assessment Wizard
                </Link>
              </li>
              <li>
                <Link to="/hospitals" className="text-slate-400 hover:text-cyan-300 transition-colors inline-block hover:translate-x-0.5 transform duration-150">
                  Partner Hospitals Directory
                </Link>
              </li>
              <li>
                <Link to="/specialists" className="text-slate-400 hover:text-cyan-300 transition-colors inline-block hover:translate-x-0.5 transform duration-150">
                  Top Surgical Specialists
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-slate-400 hover:text-cyan-300 transition-colors inline-block hover:translate-x-0.5 transform duration-150">
                  Admin Control Panel
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
              <span>Clinical Specialties</span>
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="hover:text-slate-200 transition-colors">Cardiothoracic & Bypass Surgery</li>
              <li className="hover:text-slate-200 transition-colors">Joint Replacement (TKR / THR)</li>
              <li className="hover:text-slate-200 transition-colors">Surgical Oncology & Robotic Tumor Care</li>
              <li className="hover:text-slate-200 transition-colors">Minimally Invasive Laparoscopy</li>
              <li className="hover:text-slate-200 transition-colors">Laser Urology & Stone Removal</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-3.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span>Counselor Helpline</span>
            </h4>
            <p className="text-xs text-slate-400 mb-3">
              Need assistance comparing hospital surgical estimates or verifying insurance pre-authorization?
            </p>
            <div className="p-4 glass-card rounded-2xl border border-sky-400/30 hover:border-sky-400/50 transition-colors shadow-lg">
              <div className="text-xs font-bold text-slate-200">Dedicated Patient Helpline</div>
              <div className="text-base font-black text-cyan-400 mt-1 tracking-tight drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]">+91 (022) 8000-MEDI</div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>24x7 Surgical Coordination</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-sky-400/15 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} MediMatch Health Technologies India. All rights reserved.</p>
          <p className="text-[11px] text-slate-500 max-w-xl text-center sm:text-right">
            Disclaimer: MediMatch AI predictions and financial estimates are for counseling and budgeting purposes. Clinical diagnosis and surgical decisions must be made in consultation with certified doctors.
          </p>
        </div>
      </div>
    </footer>
  );
};

