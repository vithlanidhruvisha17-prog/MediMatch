import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { aiConfigApi } from '../../api/aiConfig';
import { AIProviderConfig } from '@medimatch/shared';
import { Eye, EyeOff, Save, CheckCircle2, Cpu, Key, Layers, Terminal } from 'lucide-react';

interface AIModelFormProps {
  onConfigUpdated?: () => void;
}

export const AIModelForm: React.FC<AIModelFormProps> = ({ onConfigUpdated }) => {
  const [provider, setProvider] = useState('gemini');
  const [apiKey, setApiKey] = useState('');
  const [maskedKey, setMaskedKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [modelName, setModelName] = useState('gemini-3.6-flash');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    aiConfigApi
      .get()
      .then((cfg) => {
        setProvider(cfg.provider || 'gemini');
        setModelName(cfg.modelName || 'gemini-3.6-flash');
        setSystemPrompt(cfg.systemPrompt || '');
        setMaskedKey(cfg.maskedApiKey || '');
      })
      .catch((err) => console.error('Failed to load AI config:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updated = await aiConfigApi.update({
        provider,
        apiKey: apiKey.trim() ? apiKey.trim() : undefined,
        modelName,
        systemPrompt
      });
      setMaskedKey(updated.maskedApiKey || '');
      setApiKey('');
      setShowKey(false);
      setSaveSuccess(true);
      onConfigUpdated?.();
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      alert('Failed to save AI configuration: ' + (err.message || 'Error'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="p-4 sm:p-6 glass-card border-sky-400/25 bg-[#091b35]/70 backdrop-blur-2xl rounded-2xl shadow-[0_0_30px_rgba(56,189,248,0.08)] flex flex-col justify-between h-full">
      <div>
        <div className="border-b border-sky-400/15 pb-4 mb-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
            <Cpu className="w-4 h-4" />
            <span>Core AI Engine Settings</span>
          </div>
          <h3 className="text-lg font-bold text-white">AI Provider Integration</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure Google Gemini credentials and customize clinical surgical reasoning prompts.
          </p>
        </div>

        {saveSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>AI settings and cryptographic keys saved successfully.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Provider Dropdown */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              AI Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full p-2.5 bg-[#061427]/80 border border-sky-400/30 rounded-xl text-xs font-semibold text-white focus:outline-none focus:ring-1 focus:ring-cyan-400 cursor-pointer"
            >
              <option value="gemini" className="bg-[#07162d] text-white">Google Gemini (Recommended / Default)</option>
              <option value="openai" className="bg-[#07162d] text-white">OpenAI (GPT-4o / Mini)</option>
              <option value="anthropic" className="bg-[#07162d] text-white">Anthropic (Claude 3.5 Sonnet)</option>
              <option value="custom" className="bg-[#07162d] text-white">Custom Enterprise LLM Endpoint</option>
            </select>
          </div>

          {/* Model Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Model Identifier
            </label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="gemini-3.6-flash or gemini-2.5-flash-lite"
              className="w-full p-2.5 bg-[#061427]/80 border border-sky-400/30 rounded-xl text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Supported Gemini models: <code className="text-cyan-300">gemini-3.6-flash</code> (Recommended / Default), <code className="text-cyan-300">gemini-2.5-flash-lite</code>
            </p>
          </div>

          {/* API Key (Encrypted at rest) with Show/Hide toggle */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                Provider API Key (AES-256 Encrypted)
              </label>
              {maskedKey && (
                <span className="text-[11px] text-cyan-400 font-mono">
                  Stored: {maskedKey}
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                placeholder={maskedKey ? 'Enter new key to replace existing...' : 'Paste your API key here (e.g. AIzaSy...)'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 bg-[#061427]/80 border border-sky-400/30 rounded-xl text-xs font-mono text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-cyan-300"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Leave blank to keep existing key. If no key is set, the system uses the intelligent clinical heuristic engine.
            </p>
          </div>

          {/* System Prompt Textarea */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              System Counselor Instructions (Prompt Engineering)
            </label>
            <textarea
              rows={6}
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="System instructions directing clinical reasoning, tone, and JSON schema output..."
              className="w-full p-3 bg-[#061427]/80 border border-sky-400/30 rounded-xl text-xs font-mono text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 leading-relaxed resize-none"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              className="w-full font-bold shadow-[0_0_20px_rgba(56,189,248,0.3)]"
            >
              <Save className="w-4 h-4 mr-2" />
              <span>Save AI Settings</span>
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

