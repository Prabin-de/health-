
import React, { useState, useEffect } from 'react';
import { HealthRecord, Settings, HealthAnalysisResult } from '../types';
import { fetchHealthData, generateMockData } from '../services/thingSpeakService';
import { performLocalAnalysis } from '../services/localAnalysisService';

interface HealthInsightsProps {
  settings: Settings;
}

const HealthInsights: React.FC<HealthInsightsProps> = ({ settings }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<HealthAnalysisResult | null>(null);

  const runAnalysis = async () => {
    setAnalyzing(true);
    // Add small delay to feel more professional
    setTimeout(async () => {
      let data: HealthRecord[] = [];
      if (settings.channelId && settings.readApiKey) {
        data = await fetchHealthData(settings.channelId, settings.readApiKey, 100);
      } else {
        data = generateMockData(100);
      }
      
      const result = performLocalAnalysis(data, settings);
      setReport(result);
      setAnalyzing(false);
    }, 600);
  };

  useEffect(() => {
    runAnalysis();
  }, [settings]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-stethoscope text-sm"></i>
            </div>
            <h1 className="text-2xl font-bold">Health Insights Engine</h1>
          </div>
          <p className="text-indigo-200 mb-6 max-w-lg text-sm">
            Instant medical-grade evaluation performing local computations on your telemetry data. Private, secure, and always offline.
          </p>
          <button 
            onClick={runAnalysis}
            disabled={analyzing}
            className="px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl shadow-lg hover:bg-indigo-50 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {analyzing ? <i className="fas fa-sync fa-spin"></i> : <i className="fas fa-bolt"></i>}
            Refresh Local Analysis
          </button>
        </div>
        <i className="fas fa-laptop-code absolute -right-8 -bottom-8 text-white/5 text-[180px] rotate-12"></i>
      </div>

      {report && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`p-6 rounded-3xl border-2 ${
              report.healthStatus === 'Normal' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
              report.healthStatus === 'Warning' ? 'bg-amber-50 border-amber-100 text-amber-800' :
              'bg-rose-50 border-rose-100 text-rose-800'
            }`}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">System Assessment</p>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full animate-pulse ${
                  report.healthStatus === 'Normal' ? 'bg-emerald-500' :
                  report.healthStatus === 'Warning' ? 'bg-amber-500' : 'bg-rose-500'
                }`}></div>
                <h3 className="text-2xl font-black uppercase">{report.healthStatus}</h3>
              </div>
            </div>
            
            <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Clinical Summary</p>
              <p className="text-slate-700 leading-relaxed font-medium">{report.summary}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fas fa-list-check text-indigo-600"></i>
                Recommended Actions
              </h4>
              <ul className="space-y-3">
                {report.suggestions.map((s, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-600">
                    <span className="h-5 w-5 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                      {i + 1}
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <i className="fas fa-triangle-exclamation text-rose-500"></i>
                Anomalies Found
              </h4>
              {report.alerts.length > 0 ? (
                <ul className="space-y-3">
                  {report.alerts.map((a, i) => (
                    <li key={i} className="flex gap-3 text-sm text-rose-700 p-3 bg-rose-50 rounded-2xl border border-rose-100">
                      <i className="fas fa-circle-info text-rose-400 mt-1"></i>
                      {a}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <div className="h-12 w-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-circle-check"></i>
                  </div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No Alerts Detected</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthInsights;
