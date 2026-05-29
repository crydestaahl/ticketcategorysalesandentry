import React, { useState, useEffect } from 'react';
import { AppSettings, TicksterResponse } from './types';
import Dashboard from './components/Dashboard';
import CategoriesAndSections from './components/CategoriesAndSections';
import Settings from './Settings';
import { LayoutDashboard, Settings as SettingsIcon, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DEFAULT_SETTINGS: AppSettings = {
  eogRequestCode: '',
  eventRequestCode: '',
  apikey: '',
  username: '',
  password: '',
};

export default function App() {
  const [view, setView] = useState<'dashboard' | 'categories' | 'settings'>('dashboard');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  
  // Lifted state for Ticket database
  const [data, setData] = useState<TicksterResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Load initial settings and cached data on mount
  useEffect(() => {
    const saved = localStorage.getItem('tickster_settings');
    let hasSettings = false;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        if (parsed.apikey && parsed.eogRequestCode && parsed.eventRequestCode && parsed.username && parsed.password) {
          hasSettings = true;
        }
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }

    if (!hasSettings) {
      setView('settings'); // Force settings if none exist
    }

    // Load cached tickets
    const cachedData = localStorage.getItem('tickster_cache');
    const cachedTime = localStorage.getItem('tickster_cache_time');
    if (cachedData && cachedTime) {
      try {
        setData(JSON.parse(cachedData));
        setLastUpdated(new Date(parseInt(cachedTime)));
      } catch (e) {
        console.error("Failed to parse cached data", e);
      }
    }
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Unified ticket fetcher
  const fetchData = async (currentSettings = settings) => {
    if (cooldown > 0) return;
    
    if (!currentSettings.apikey || !currentSettings.eogRequestCode || !currentSettings.eventRequestCode || !currentSettings.username || !currentSettings.password) {
      setError("Vänligen fyll i alla fält i inställningarna.");
      setView('settings');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/fetch-tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentSettings),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.details || errData.error || 'Kunde inte hämta data');
      }

      const result = await response.json();
      const now = new Date();
      
      setData(result);
      setLastUpdated(now);
      localStorage.setItem('tickster_cache', JSON.stringify(result));
      localStorage.setItem('tickster_cache_time', now.getTime().toString());
      
      setCooldown(30);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Only auto-fetch if setup is finished and we have no loaded data yet
  useEffect(() => {
    const hasAllSettings = settings.apikey && settings.eogRequestCode && settings.eventRequestCode && settings.username && settings.password;
    if (hasAllSettings && !data && !loading) {
      fetchData(settings);
    }
  }, [settings, data]);

  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    setView('dashboard');
    // Force instant refresh after saving settings
    fetchData(newSettings);
  };

  const tickets = data?.tickets || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      {/* Content Area */}
      <main className="pb-28">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <Dashboard 
                settings={settings} 
                tickets={tickets} 
                loading={loading} 
                error={error} 
                lastUpdated={lastUpdated} 
                cooldown={cooldown} 
                fetchData={() => fetchData()} 
              />
            </motion.div>
          )}

          {view === 'categories' && (
            <motion.div
              key="categories"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <CategoriesAndSections 
                settings={settings} 
                tickets={tickets} 
                loading={loading} 
                error={error} 
                lastUpdated={lastUpdated} 
                cooldown={cooldown} 
                fetchData={() => fetchData()} 
              />
            </motion.div>
          )}

          {view === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              <Settings onSave={handleSaveSettings} initialSettings={settings} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl shadow-slate-200/50 rounded-[32px] p-2 flex items-center justify-around z-50">
        <button
          onClick={() => setView('dashboard')}
          className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-3xl transition-all ${
            view === 'dashboard' 
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Dashboard</span>
        </button>

        <button
          onClick={() => {
            // Only switch to view if we have settings populated, otherwise it pushes to settings
            const hasSettings = settings.apikey && settings.eogRequestCode && settings.eventRequestCode && settings.username && settings.password;
            if (hasSettings) {
              setView('categories');
            } else {
              setView('settings');
            }
          }}
          className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-3xl transition-all ${
            view === 'categories' 
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Kategori & Sekt.</span>
        </button>
        
        <button
          onClick={() => setView('settings')}
          className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-3xl transition-all ${
            view === 'settings' 
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="text-[9px] font-bold uppercase tracking-wider">Inställningar</span>
        </button>
      </nav>
    </div>
  );
}
