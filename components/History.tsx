
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { HealthRecord, Settings } from '../types';
import { fetchMonthlyHistory, generateMockData } from '../services/thingSpeakService';

interface HistoryProps {
  settings: Settings;
}

const History: React.FC<HistoryProps> = ({ settings }) => {
  const [history, setHistory] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      let data: HealthRecord[] = [];
      if (settings.channelId && settings.readApiKey) {
        data = await fetchMonthlyHistory(settings.channelId, settings.readApiKey);
      } else {
        data = generateMockData(100);
      }
      setHistory(data);
      setLoading(false);
    };
    loadHistory();
  }, [settings]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh]">
      <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-500 font-medium">Reconstructing historical data timeline...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Historical Trends</h2>
            <p className="text-sm text-slate-500">Overview of the last 50 telemetry packets</p>
          </div>
          <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-2">
            <i className="fas fa-download"></i> Export CSV
          </button>
        </div>
        
        <div className="h-[400px] w-full min-h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={history.slice(-50)}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="created_at" 
                tickFormatter={(val) => new Date(val).toLocaleDateString()}
                minTickGap={30}
                fontSize={10}
                axisLine={false}
                tickLine={false}
              />
              <YAxis fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip 
                labelFormatter={(label) => new Date(label).toLocaleString()}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', fontSize: '12px' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="bpm" fill="#f43f5e" radius={[6, 6, 0, 0]} name="Heart Rate (BPM)" barSize={12} />
              <Bar dataKey="spo2" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Oxygen (SpO2 %)" barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Medical Log Entries</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-400 font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 uppercase text-[10px] tracking-widest">Date & Time</th>
                <th className="px-6 py-4 uppercase text-[10px] tracking-widest">Vitals (BPM / SpO2)</th>
                <th className="px-6 py-4 uppercase text-[10px] tracking-widest">Body Temp</th>
                <th className="px-6 py-4 uppercase text-[10px] tracking-widest">Environmental</th>
                <th className="px-6 py-4 uppercase text-[10px] tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {history.slice().reverse().slice(0, 25).map((record) => {
                const isWarning = record.spo2 < 94 || record.bpm > 110 || record.bpm < 55;
                return (
                  <tr key={record.entry_id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-slate-800 font-medium">{new Date(record.created_at).toLocaleDateString()}</p>
                      <p className="text-[10px] text-slate-400">{new Date(record.created_at).toLocaleTimeString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-rose-600 font-bold">{record.bpm.toFixed(0)}</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-sky-600 font-bold">{record.spo2.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-medium">
                      {record.temp.toFixed(1)}°C
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-[11px]">
                      {record.room_temp.toFixed(1)}°C | {record.humidity.toFixed(0)}% RH
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                        isWarning
                          ? 'bg-rose-50 text-rose-600 border-rose-100'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {isWarning ? 'Review Needed' : 'Stable'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-slate-50/30 text-center">
          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Showing last 25 entries • VitalShield Data Persistence</p>
        </div>
      </div>
    </div>
  );
};

export default History;
