import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { aiConfigApi } from '../../api/aiConfig';
import { Terminal, Play, Clock, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

export const PromptSandbox: React.FC = () => {
  const [testQuery, setTestQuery] = useState(
    'Patient Profile: 62 y/o Male in Bangalore with severe osteoarthritis right knee for 8 months. Budget ₹3,00,000. Recommend surgery and provide clinical counseling.'
  );
  const [output, setOutput] = useState<string | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [providerInfo, setProviderInfo] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);

  const handleExecute = async () => {
    if (!testQuery.trim() || isExecuting) return;

    setIsExecuting(true);
    setOutput(null);

    try {
      const result = await aiConfigApi.executeSandbox(testQuery);
      setOutput(result.response);
      setLatency(result.latencyMs);
      setProviderInfo(`${result.provider} (${result.model})`);
      setIsSuccess(result.success);
    } catch (err: any) {
      setOutput(`Error executing prompt: ${err.message || err}`);
      setIsSuccess(false);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Card className="p-4 sm:p-6 glass-card border-sky-400/25 bg-[#091b35]/70 backdrop-blur-2xl rounded-2xl shadow-[0_0_30px_rgba(56,189,248,0.08)] flex flex-col justify-between h-full">
      <div>
        <div className="border-b border-sky-400/15 pb-4 mb-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
            <Terminal className="w-4 h-4" />
            <span>Interactive Diagnostic Testbed</span>
          </div>
          <h3 className="text-lg font-bold text-white">AI Prompt Sandbox & Test Execution</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Test prompt execution against saved instructions in real-time to inspect model behavior and output schema.
          </p>
        </div>

        <div className="space-y-4">
          {/* Test Query Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Test Clinical Prompt Query
              </label>
              <button
                type="button"
                onClick={() =>
                  setTestQuery(
                    'Patient Profile: 54 y/o Female with ultrasound showing recurrent gallbladder stones & biliary colic. Budget ₹1,20,000 in Mumbai.'
                  )
                }
                className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline font-medium"
              >
                Load Sample Gallstone Case
              </button>
            </div>
            <textarea
              rows={4}
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              placeholder="Enter sample patient symptoms, age, location, and budget..."
              className="w-full p-3 bg-[#061427]/80 border border-sky-400/30 rounded-xl text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 resize-none leading-relaxed"
            />
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            isLoading={isExecuting}
            onClick={handleExecute}
            className="w-full font-bold shadow-[0_0_20px_rgba(56,189,248,0.3)]"
          >
            <Play className="w-4 h-4 mr-2" />
            <span>Execute Test & Stream Response</span>
          </Button>

          {/* Execution Telemetry */}
          {(latency !== null || providerInfo) && (
            <div className="flex items-center justify-between p-2.5 bg-[#061427]/70 rounded-xl border border-sky-400/20 text-xs">
              <div className="flex items-center gap-2">
                {isSuccess ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                )}
                <span className="font-semibold text-slate-200">{providerInfo}</span>
              </div>
              {latency !== null && (
                <div className="flex items-center gap-1 text-slate-400 font-mono">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{latency} ms</span>
                </div>
              )}
            </div>
          )}

          {/* Read-Only Output Pane */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Live AI Model Output Pane
            </label>
            <div className="bg-[#030914] text-cyan-300 p-4 rounded-xl border border-sky-400/30 font-mono text-xs overflow-x-auto min-h-[200px] max-h-[260px] overflow-y-auto leading-relaxed shadow-inner">
              {isExecuting ? (
                <div className="flex items-center gap-2 text-slate-400 py-8 justify-center">
                  <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Contacting AI model provider pipeline...</span>
                </div>
              ) : output ? (
                <pre className="whitespace-pre-wrap">{output}</pre>
              ) : (
                <span className="text-slate-500 italic">
                  No test executed yet. Click &apos;Execute Test&apos; to view the model response.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

