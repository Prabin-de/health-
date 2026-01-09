
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { STORAGE_KEYS } from '../constants';

interface AuthProps {
  onVerify: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onVerify }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userCount, setUserCount] = useState(0);

  // Sync user count for the 10-user limit display
  useEffect(() => {
    const db = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_DB) || '[]');
    setUserCount(db.length);
  }, [isLogin]);

  const getUsers = (): (User & { code: string })[] => {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS_DB) || '[]');
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const db = getUsers();

      if (isLogin) {
        // Login Logic
        const foundUser = db.find(u => u.patientName.toLowerCase() === name.toLowerCase() && u.code === code);
        if (foundUser) {
          const sessionUser: User = {
            patientName: foundUser.patientName,
            patientCode: foundUser.patientCode,
            verifiedAt: new Date().toISOString()
          };
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(sessionUser));
          onVerify(sessionUser);
        } else {
          setError('Invalid Patient Name or Access Code.');
        }
      } else {
        // Signup Logic
        if (db.length >= 10) {
          setError('Registration limit reached (Max 10 users).');
          setLoading(false);
          return;
        }

        const userExists = db.some(u => u.patientName.toLowerCase() === name.toLowerCase());
        if (userExists) {
          setError('User already exists. Please login.');
        } else {
          const newUser = {
            patientName: name,
            patientCode: `VS-${Math.floor(1000 + Math.random() * 9000)}`,
            code: code,
            verifiedAt: new Date().toISOString()
          };
          const newDb = [...db, newUser];
          localStorage.setItem(STORAGE_KEYS.USERS_DB, JSON.stringify(newDb));
          
          // Auto-login after signup
          const sessionUser: User = {
            patientName: newUser.patientName,
            patientCode: newUser.patientCode,
            verifiedAt: newUser.verifiedAt
          };
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(sessionUser));
          onVerify(sessionUser);
        }
      }
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 selection:bg-indigo-500/30">
      <div className="w-full max-w-md">
        {/* Logo/Brand Header */}
        <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="h-20 w-20 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-indigo-500/40 transform -rotate-6">
            <i className="fas fa-shield-heart text-3xl"></i>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">VitalShield</h1>
          <div className="flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em]">Secure Health Protocol</p>
          </div>
        </div>

        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] p-8 md:p-10 shadow-3xl overflow-hidden relative">
          {/* Progress Indicator for limit */}
          {!isLogin && (
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
              <div 
                className={`h-full transition-all duration-500 ${userCount >= 10 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                style={{ width: `${(userCount / 10) * 100}%` }}
              ></div>
            </div>
          )}

          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-white">{isLogin ? 'Sign In' : 'Create Account'}</h2>
            {!isLogin && (
              <span className={`text-[10px] font-black px-2 py-1 rounded-md ${userCount >= 10 ? 'bg-rose-500/20 text-rose-400' : 'bg-indigo-500/20 text-indigo-400'} uppercase tracking-widest`}>
                {userCount}/10 slots
              </span>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-medium flex items-center gap-3 animate-in zoom-in-95">
              <i className="fas fa-exclamation-triangle"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Patient Identity</label>
              <div className="relative">
                <i className="fas fa-user absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 text-xs"></i>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-5 py-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600 text-sm font-medium"
                  placeholder="Legal Name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Access Code</label>
              <div className="relative">
                <i className="fas fa-key absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 text-xs"></i>
                <input 
                  type="password" 
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 text-white pl-12 pr-5 py-4 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600 text-sm font-medium"
                  placeholder="Enter Password"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading || (!isLogin && userCount >= 10)}
              className={`w-full py-4 ${(!isLogin && userCount >= 10) ? 'bg-slate-800 text-slate-600' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'} font-bold rounded-2xl transition-all flex items-center justify-center gap-3 disabled:cursor-not-allowed group`}
            >
              {loading ? (
                <i className="fas fa-circle-notch fa-spin"></i>
              ) : (
                <i className={`fas ${isLogin ? 'fa-sign-in-alt' : 'fa-user-plus'} group-hover:translate-x-1 transition-transform`}></i>
              )}
              {loading ? 'Processing...' : (isLogin ? 'Enter Dashboard' : 'Complete Registration')}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-800/50 text-center">
            <p className="text-slate-500 text-sm font-medium">
              {isLogin ? "New patient?" : "Already registered?"}
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="ml-2 text-indigo-400 hover:text-indigo-300 font-bold underline underline-offset-4"
              >
                {isLogin ? 'Create your profile' : 'Sign in to access'}
              </button>
            </p>
          </div>
        </div>

        <p className="mt-10 text-center text-[10px] text-slate-600 leading-relaxed uppercase tracking-[0.3em] font-black">
          Phase 1 Prototype • Limited Release
        </p>
      </div>
    </div>
  );
};

export default Auth;
