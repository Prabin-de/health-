
import React, { useState } from 'react';
import { Settings as SettingsType } from '../types';
import { STORAGE_KEYS } from '../constants';

interface SettingsProps {
  settings: SettingsType;
  onUpdate: (newSettings: SettingsType) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  const [formData, setFormData] = useState(settings);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const resp = await fetch(`https://api.thingspeak.com/channels/${formData.channelId}/feeds.json?api_key=${formData.readApiKey}&results=1`);
      if (resp.ok) {
        setTestResult({ success: true, message: "Handshake Successful! Data link is active." });
      } else {
        setTestResult({ success: false, message: "Link Failed. Check Channel ID or API Key." });
      }
    } catch (e) {
      setTestResult({ success: false, message: "Network Error. Could not reach ThingSpeak." });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(formData));
    alert('Local system parameters updated.');
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8">
      {/* 1. Hardware Cloud Settings */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <i className="fas fa-tower-broadcast text-xl"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">ThingSpeak Data Sync</h2>
            <p className="text-slate-500 text-sm">Main telemetry link for ESP32 hardware</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Channel ID</label>
            <input 
              type="text" 
              value={formData.channelId}
              onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-sm"
              placeholder="e.g. 3205334"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Poll Rate (Seconds)</label>
            <input 
              type="number" 
              value={formData.refreshInterval}
              onChange={(e) => setFormData({ ...formData, refreshInterval: parseInt(e.target.value) })}
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Read API Key</label>
            <input 
              type="password" 
              value={formData.readApiKey}
              onChange={(e) => setFormData({ ...formData, readApiKey: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Write API Key</label>
            <input 
              type="password" 
              value={formData.writeApiKey}
              onChange={(e) => setFormData({ ...formData, writeApiKey: e.target.value })}
              className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono text-sm"
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-4">
          <button 
            onClick={testConnection}
            disabled={testing}
            className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-xl transition-all flex items-center gap-2 text-sm"
          >
            {testing ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-vial"></i>}
            Test Hardware Link
          </button>
          {testResult && (
            <span className={`text-xs font-bold ${testResult.success ? 'text-emerald-500' : 'text-rose-500'}`}>
              {testResult.message}
            </span>
          )}
        </div>
      </div>

      {/* 2. Vitals Thresholds */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-100">
            <i className="fas fa-heart-pulse text-xl"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Local Alert Parameters</h2>
            <p className="text-slate-500 text-sm">Defined "Normal" ranges for clinical evaluation</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-3 p-5 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BPM Normal Range</p>
            <div className="flex items-center gap-2">
              <input type="number" value={formData.thresholds.bpm.min} onChange={(e) => setFormData({...formData, thresholds: {...formData.thresholds, bpm: {...formData.thresholds.bpm, min: parseInt(e.target.value)}}})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold" />
              <input type="number" value={formData.thresholds.bpm.max} onChange={(e) => setFormData({...formData, thresholds: {...formData.thresholds, bpm: {...formData.thresholds.bpm, max: parseInt(e.target.value)}}})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold" />
            </div>
          </div>
          <div className="space-y-3 p-5 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Body Temp Range (°C)</p>
            <div className="flex items-center gap-2">
              <input type="number" step="0.1" value={formData.thresholds.temp.min} onChange={(e) => setFormData({...formData, thresholds: {...formData.thresholds, temp: {...formData.thresholds.temp, min: parseFloat(e.target.value)}}})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold" />
              <input type="number" step="0.1" value={formData.thresholds.temp.max} onChange={(e) => setFormData({...formData, thresholds: {...formData.thresholds, temp: {...formData.thresholds.temp, max: parseFloat(e.target.value)}}})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold" />
            </div>
          </div>
          <div className="space-y-3 p-5 bg-slate-50 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SpO2 Floor (%)</p>
            <input type="number" value={formData.thresholds.spo2.min} onChange={(e) => setFormData({...formData, thresholds: {...formData.thresholds, spo2: {min: parseInt(e.target.value)}}})} className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold" />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          onClick={handleSubmit}
          className="px-12 py-5 bg-indigo-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all transform active:scale-95"
        >
          Update System
        </button>
      </div>
    </div>
  );
};

export default Settings;
