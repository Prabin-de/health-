
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import VitalCard from './VitalCard';
import { HealthRecord, Settings } from '../types';
import { fetchHealthData, generateMockData } from '../services/thingSpeakService';

interface DashboardProps {
  settings: Settings;
}

const Dashboard: React.FC<DashboardProps> = ({ settings }) => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refreshData = useCallback(async () => {
    let data: HealthRecord[] = [];
    if (settings.channelId && settings.readApiKey) {
      data = await fetchHealthData(settings.channelId, settings.readApiKey, 40);
    } else {
      data = generateMockData(40);
    }
    
    if (data.length > 0) {
      setRecords(data);
      setLastUpdated(new Date());
    }
    setLoading(false);
  }, [settings]);

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, settings.refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshData, settings.refreshInterval]);

  const current = records.length > 0 ? records[records.length - 1] : null;

  const getStatus = (val: number, type: 'bpm' | 'spo2' | 'temp') => {
    const thresh = settings.thresholds[type];
    
    if (type === 'spo2') {
      if (val < (thresh as any).min - 5) return 'critical';
      if (val < (thresh as any).min) return 'warning';
      return 'normal';
    }

    const { min, max } = thresh as { min: number; max: number };
    if (val < min * 0.9 || val > max * 1.1) return 'critical';
    if (val < min || val > max) return 'warning';
    return 'normal';
  };

  const isFallDetected = current && current.accel > 2.5;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-slate-500 animate-pulse">Establishing secure link to ThingSpeak...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            Live Health Monitoring
            {isFallDetected && (
              <span className="bg-rose-100 text-rose-600 text-[10px] px-2 py-1 rounded-full animate-pulse border border-rose-200">
                ⚠️ POTENTIAL FALL DETECTED
              </span>
            )}
          </h1>
          <p className="text-slate-500 text-sm">Patient vitals streaming from ThingSpeak channel {settings.channelId}</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm text-right flex items-center gap-3">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sync Status</p>
            <p className="text-sm font-semibold text-emerald-600">Active</p>
          </div>
          <button 
            onClick={refreshData}
            className="h-8 w-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors flex items-center justify-center"
            title="Refresh Manual"
          >
            <i className="fas fa-sync-alt text-xs"></i>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <VitalCard 
          title="Body Temperature"
          value={current?.temp.toFixed(1) || '--'}
          unit="°C"
          icon="fa-thermometer-half"
          color="bg-amber-500"
          status={current ? getStatus(current.temp, 'temp') : 'normal'}
        />
        <VitalCard 
          title="Heart Rate"
          value={current?.bpm.toFixed(0) || '--'}
          unit="BPM"
          icon="fa-heartbeat"
          color="bg-rose-500"
          status={current ? getStatus(current.bpm, 'bpm') : 'normal'}
        />
        <VitalCard 
          title="Blood Oxygen"
          value={current?.spo2.toFixed(1) || '--'}
          unit="%"
          icon="fa-lungs"
          color="bg-sky-500"
          status={current ? getStatus(current.spo2, 'spo2') : 'normal'}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="fas fa-home text-sm"></i>
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] text-slate-500 font-medium truncate uppercase">Room Temp</p>
            <p className="text-lg font-bold text-slate-800">{current?.room_temp.toFixed(1)}°C</p>
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="fas fa-droplet text-sm"></i>
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] text-slate-500 font-medium truncate uppercase">Humidity</p>
            <p className="text-lg font-bold text-slate-800">{current?.humidity.toFixed(1)}%</p>
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
          <div className={`h-10 w-10 ${isFallDetected ? 'bg-rose-100 text-rose-600 animate-bounce' : 'bg-slate-50 text-slate-600'} rounded-xl flex items-center justify-center flex-shrink-0 transition-colors`}>
            <i className="fas fa-running text-sm"></i>
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] text-slate-500 font-medium truncate uppercase">G-Force</p>
            <p className={`text-lg font-bold ${isFallDetected ? 'text-rose-600' : 'text-slate-800'}`}>{current?.accel.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
            Patient Temperature Trend
          </h3>
          <div className="h-[280px] w-full min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={records}>
                <defs>
                  <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="created_at" hide />
                <YAxis domain={['auto', 'auto']} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                />
                <Area type="monotone" dataKey="temp" stroke="#f59e0b" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
            Heart Rate & Oxygen Vitals
          </h3>
          <div className="h-[280px] w-full min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={records}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="created_at" hide />
                <YAxis yAxisId="left" domain={['dataMin - 10', 'dataMax + 10']} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" domain={[85, 100]} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
                  labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                />
                <Line yAxisId="left" type="monotone" dataKey="bpm" stroke="#f43f5e" strokeWidth={3} dot={false} />
                <Line yAxisId="right" type="monotone" dataKey="spo2" stroke="#0ea5e9" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
