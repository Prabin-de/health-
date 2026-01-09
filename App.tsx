
import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import History from './components/History';
import HealthInsights from './components/HealthInsights';
import Settings from './components/Settings';
import Auth from './components/Auth';
import { Settings as SettingsType, User } from './types';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'insights' | 'settings'>('dashboard');
  const [settings, setSettings] = useState<SettingsType>(DEFAULT_SETTINGS);

  useEffect(() => {
    // Load Settings
    const savedSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (savedSettings) setSettings(JSON.parse(savedSettings));

    // Load User Session
    const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.USER);
    setUser(null);
  };

  if (!user) {
    return <Auth onVerify={setUser} />;
  }

  const NavItem: React.FC<{ tab: typeof activeTab; icon: string; label: string }> = ({ tab, icon, label }) => {
    const isActive = activeTab === tab;
    return (
      <button 
        onClick={() => setActiveTab(tab)}
        className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold transition-all group ${
          isActive 
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
            : 'text-slate-500 hover:bg-slate-100'
        }`}
      >
        <i className={`fas ${icon} ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'} transition-colors`}></i>
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <aside className="w-full md:w-72 bg-white border-r border-slate-100 p-6 flex flex-col gap-8 md:sticky md:top-0 md:h-screen">
        <div className="flex items-center gap-3 px-2">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
            <i className="fas fa-shield-heart text-xl"></i>
          </div>
          <div>
            <h1 className="font-bold text-slate-800 tracking-tight leading-none">VitalShield</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Hardware Sync</p>
          </div>
        </div>

        <div className="px-2 py-3 bg-slate-50 rounded-2xl flex items-center gap-3">
          <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-sm">
            <i className="fas fa-user text-slate-400"></i>
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-800 truncate">{user.patientName}</p>
            <p className="text-[10px] text-slate-500">Local ID: {user.patientCode}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2 flex-grow">
          <NavItem tab="dashboard" icon="fa-chart-pie" label="Vitals Dashboard" />
          <NavItem tab="history" icon="fa-clock-rotate-left" label="Patient History" />
          <NavItem tab="insights" icon="fa-stethoscope" label="Health Insights" />
          <div className="mt-auto pt-8 border-t border-slate-50 flex flex-col gap-2">
            <NavItem tab="settings" icon="fa-gear" label="Configuration" />
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold text-rose-500 hover:bg-rose-50 transition-all"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      <main className="flex-grow p-4 md:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard settings={settings} />}
          {activeTab === 'history' && <History settings={settings} />}
          {activeTab === 'insights' && <HealthInsights settings={settings} />}
          {activeTab === 'settings' && <Settings settings={settings} onUpdate={setSettings} />}
        </div>
      </main>
    </div>
  );
};

export default App;
