import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { seedApi } from '../../api/seed';
import { Database, Play, CheckCircle2, Server, Terminal, RefreshCw, Layers } from 'lucide-react';

export const DatabaseSeeder: React.FC<{ onSeeded?: () => void }> = ({ onSeeded }) => {
  const [stats, setStats] = useState<any>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    'Database Seeder ready. Click "Run Database Seeder" to populate hospitals, doctors, and patient profiles.'
  ]);

  const loadStats = async () => {
    try {
      const data = await seedApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleSeed = async () => {
    setIsSeeding(true);
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Triggering bulk seed routine...`]);

    try {
      const result = await seedApi.triggerSeed();
      if (result.logs && result.logs.length > 0) {
        setLogs((prev) => [...prev, ...result.logs]);
      } else {
        setLogs((prev) => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Seed complete! Refreshed ${result.counts?.hospitalsCount ?? 'all'} hospitals and ${result.counts?.doctorsCount ?? 'all'} specialists.`
        ]);
      }
      await loadStats();
      onSeeded?.();
    } catch (err: any) {
      setLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] ERROR during database seeding: ${err.message || err}`
      ]);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Control Card */}
      <div className="lg:col-span-5 space-y-5">
        <Card className="p-4 sm:p-6 glass-card border-sky-400/25 bg-[#091b35]/70 backdrop-blur-2xl rounded-2xl shadow-[0_0_30px_rgba(56,189,248,0.08)]">
          <div className="border-b border-sky-400/15 pb-4 mb-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
              <Database className="w-4 h-4" />
              <span>Data Provisioning & Replication</span>
            </div>
            <h3 className="text-lg font-bold text-white">Database Seeder</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Bulk-populate accredited Indian hospitals, specialist doctors, and demo clinical records into PostgreSQL.
            </p>
          </div>

          {stats && (
            <div className="p-4 bg-[#061427]/70 rounded-xl border border-sky-400/20 text-xs space-y-2 mb-4 text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Database Mode:</span>
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  {stats.databaseStatus}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-sky-400/15">
                <span className="text-slate-400">Partner Hospitals:</span>
                <span className="font-bold text-white">{stats.totalHospitals}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Specialist Faculty:</span>
                <span className="font-bold text-white">{stats.totalDoctors}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Patient Profiles:</span>
                <span className="font-bold text-white">{stats.totalPatients}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Inquiries Logged:</span>
                <span className="font-bold text-white">{stats.totalInquiries}</span>
              </div>
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            isLoading={isSeeding}
            onClick={handleSeed}
            className="w-full font-bold shadow-[0_0_20px_rgba(56,189,248,0.3)]"
          >
            <Play className="w-4 h-4 mr-2 text-white" />
            <span>Run Database Seeder</span>
          </Button>

          <p className="text-[11px] text-slate-400 text-center mt-2">
            Safe to run repeatedly. Seeds and updates catalogs without data corruption.
          </p>
        </Card>
      </div>

      {/* Terminal Log Console */}
      <div className="lg:col-span-7">
        <Card className="p-4 sm:p-5 glass-card border-sky-400/25 bg-[#091b35]/70 backdrop-blur-2xl rounded-2xl shadow-[0_0_30px_rgba(56,189,248,0.08)] flex flex-col h-full">
          <div className="flex items-center justify-between pb-3 border-b border-sky-400/15 mb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Seeder Execution Logs & Diagnostics
              </span>
            </div>
            <button
              onClick={() => setLogs([])}
              className="text-[11px] text-slate-400 hover:text-cyan-300 font-medium"
            >
              Clear Log
            </button>
          </div>

          <div className="flex-1 bg-[#030914] p-4 rounded-xl border border-sky-400/30 text-cyan-300 font-mono text-xs overflow-y-auto max-h-[380px] space-y-1.5 leading-relaxed shadow-inner">
            {logs.map((line, idx) => (
              <div key={idx} className="break-all">
                <span className="text-slate-500 select-none mr-2">&gt;</span>
                {line}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

