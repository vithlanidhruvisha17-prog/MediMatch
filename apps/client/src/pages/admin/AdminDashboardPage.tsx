import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Tabs, TabItem } from '../../components/ui/Tabs';
import { SubmissionsTable } from '../../components/admin/SubmissionsTable';
import { AIModelForm } from '../../components/admin/AIModelForm';
import { PromptSandbox } from '../../components/admin/PromptSandbox';
import { InquiriesTable } from '../../components/admin/InquiriesTable';
import { HospitalsManager } from '../../components/admin/HospitalsManager';
import { DoctorsManager } from '../../components/admin/DoctorsManager';
import { DatabaseSeeder } from '../../components/admin/DatabaseSeeder';
import { seedApi } from '../../api/seed';
import {
  FileText,
  Cpu,
  MessageSquare,
  Building2,
  UserCheck,
  Database,
  Activity,
  Users,
  ChevronDown
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('submissions');
  const [stats, setStats] = useState<any>(null);

  const refreshStats = () => {
    seedApi.getStats().then(setStats).catch(() => {});
  };

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/admin/login');
    } else {
      refreshStats();
    }
  }, [isAdmin, isLoading, navigate]);

  if (isLoading || !isAdmin) {
    return null;
  }

  const tabs: TabItem[] = [
    {
      id: 'submissions',
      label: 'Patient Health Submissions',
      icon: <FileText className="w-4 h-4" />,
      count: stats?.totalAssessments
    },
    {
      id: 'ai-model',
      label: 'AI Model Integration',
      icon: <Cpu className="w-4 h-4" />
    },
    {
      id: 'inquiries',
      label: 'Inquiries',
      icon: <MessageSquare className="w-4 h-4" />,
      count: stats?.totalInquiries
    },
    {
      id: 'hospitals',
      label: 'Hospitals Manager',
      icon: <Building2 className="w-4 h-4" />,
      count: stats?.totalHospitals
    },
    {
      id: 'doctors',
      label: 'Doctors Manager',
      icon: <UserCheck className="w-4 h-4" />,
      count: stats?.totalDoctors
    },
    {
      id: 'seeder',
      label: 'Database Seeder',
      icon: <Database className="w-4 h-4" />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Mobile Tab Navigation Selector */}
      <div className="block md:hidden mb-4">
        <div className="relative">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full appearance-none glass-input rounded-xl px-4 py-3 text-sm font-bold text-white bg-[#07162d] border border-sky-400/30 shadow-xs focus:outline-none pr-10"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id} className="bg-[#07162d] text-white">
                {tab.label} {tab.count !== undefined ? `(${tab.count})` : ''}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-cyan-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Desktop Tab Navigation */}
      <div className="hidden md:block rounded-3xl border border-white/15 shadow-2xl p-1.5 mb-8 bg-[#0b1d2d]/80 backdrop-blur-2xl">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Active Tab View */}
      <div>
        {activeTab === 'submissions' && <SubmissionsTable />}

        {activeTab === 'ai-model' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6">
              <AIModelForm onConfigUpdated={refreshStats} />
            </div>
            <div className="lg:col-span-6">
              <PromptSandbox />
            </div>
          </div>
        )}

        {activeTab === 'inquiries' && <InquiriesTable />}

        {activeTab === 'hospitals' && <HospitalsManager />}

        {activeTab === 'doctors' && <DoctorsManager />}

        {activeTab === 'seeder' && <DatabaseSeeder onSeeded={refreshStats} />}
      </div>
    </div>
  );
};

