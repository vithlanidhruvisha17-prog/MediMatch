import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const RequirePatient: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isPatient, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Verifying patient credentials...</p>
      </div>
    );
  }

  if (!user || !isPatient) {
    const target = location.pathname + location.search;
    const loginPath = !target || target === '/' ? '/login' : `/login?redirect=${encodeURIComponent(target)}`;
    return <Navigate to={loginPath} replace />;
  }

  return <>{children}</>;
};

export const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-slate-700 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Verifying administrator credentials...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};
