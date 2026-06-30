import React, { useEffect, useState } from 'react';
import { AppSettings, TicksterEventItem } from './types';
import { Save, Shield, Key, User, Building2, Calendar, RefreshCcw, AlertCircle, Globe } from 'lucide-react';
import { motion } from 'motion/react';

type Language = 'sv' | 'en';

interface SettingsProps {
  onSave: (settings: AppSettings) => void;
  initialSettings: AppSettings;
  texts: Record<string, string>;
  language: Language;
  setLanguage: (lang: Language | ((prev: Language) => Language)) => void;
}

const EVENTS_CACHE_KEY = 'tickster_events_cache';

const getEventRequestCode = (event: TicksterEventItem) => {
  return String(
    event.eventRequestCode ??
    event.requestCode ??
    event.request_code ??
    event.code ??
    event.id ??
    ''
  );
};

const readCachedEvents = (eogRequestCode: string): TicksterEventItem[] => {
  const cached = localStorage.getItem(EVENTS_CACHE_KEY);
  if (!cached) return [];

  try {
    const parsed = JSON.parse(cached);

    if (
      parsed &&
      !Array.isArray(parsed) &&
      parsed.eogRequestCode === eogRequestCode &&
      Array.isArray(parsed.items)
    ) {
      return parsed.items;
    }
  } catch (e) {
    console.error("Failed to parse cached events", e);
  }

  return [];
};

export default function Settings({ onSave, initialSettings, texts, language, setLanguage }: SettingsProps) {
  const [settings, setSettings] = useState<AppSettings>(initialSettings);
  
  // Load cached events from local storage on mount
  const [events, setEvents] = useState<TicksterEventItem[]>(() => readCachedEvents(initialSettings.eogRequestCode));

  const [fetchingEvents, setFetchingEvents] = useState(false);
  const [fetchEventsError, setFetchEventsError] = useState<string | null>(null);

  useEffect(() => {
    setSettings(initialSettings);
    setEvents(readCachedEvents(initialSettings.eogRequestCode));
  }, [initialSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'eogRequestCode') {
      setSettings(prev => ({
        ...prev,
        eogRequestCode: value,
        eventRequestCode: value === prev.eogRequestCode ? prev.eventRequestCode : '',
      }));
      setEvents(readCachedEvents(value));
      return;
    }

    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleFetchEvents = async () => {
    if (!settings.eogRequestCode || !settings.apikey) {
      setFetchEventsError(texts.fillOrganizerAndApi);
      return;
    }
    
    setFetchingEvents(true);
    setFetchEventsError(null);
    try {
      const response = await fetch('/api/fetch-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eogRequestCode: settings.eogRequestCode,
          apikey: settings.apikey
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.details || errData.error || texts.fetchEventsFailed);
      }

      const data = await response.json();
      const fetchedItems = data.items || [];
      setEvents(fetchedItems);
      localStorage.setItem(EVENTS_CACHE_KEY, JSON.stringify({
        eogRequestCode: settings.eogRequestCode,
        items: fetchedItems,
      }));
    } catch (err: any) {
      setFetchEventsError(err.message || texts.fetchEventsFailed);
    } finally {
      setFetchingEvents(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
    const safeSettings = {
      eogRequestCode: settings.eogRequestCode,
      eventRequestCode: settings.eventRequestCode,
    };
    localStorage.setItem('tickster_settings', JSON.stringify(safeSettings));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-md mx-auto space-y-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{texts.settingsTitle}</h1>
          <p className="text-slate-500">{texts.settingsDescription}</p>
        </div>
        <button
          type="button"
          onClick={() => setLanguage(prev => prev === 'sv' ? 'en' : 'sv')}
          className="flex-shrink-0 px-3 py-2 rounded-2xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
        >
          <Globe className="w-4 h-4" />
          {texts.toggleLanguage}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-6">
          {/* Section 1: Connection details and fetch helper */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{texts.stageOrganizerApi}</h3>
            </div>

            <div className="relative">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">{texts.labelOrganizerId}</label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="eogRequestCode"
                  value={settings.eogRequestCode}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-semibold text-slate-800 placeholder-slate-400"
                  placeholder={texts.placeholderOrganizerId}
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">{texts.labelApiKey}</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  name="apikey"
                  value={settings.apikey}
                  onChange={handleChange}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-semibold text-slate-800 placeholder-slate-400"
                  placeholder={texts.placeholderApiKey}
                  required
                />
              </div>
            </div>

            {/* Fetch Events Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleFetchEvents}
                disabled={fetchingEvents || !settings.eogRequestCode || !settings.apikey}
                className="w-full bg-emerald-50 hover:bg-emerald-100 active:scale-98 disabled:opacity-50 disabled:active:scale-100 text-emerald-700 text-xs font-black py-3 px-4 rounded-2xl border border-emerald-100/50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {fetchingEvents ? (
                  <>
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                    {texts.fetchingEvents}
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    {texts.fetchEvents}
                  </>
                )}
              </button>
              
              {fetchEventsError && (
                <div className="text-xs text-red-600 font-semibold mt-2.5 flex items-start gap-1.5 px-3 py-2.5 bg-red-50 rounded-xl border border-red-100">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
                  <span>{fetchEventsError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Choose Event */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{texts.stageSelectEvent}</h3>
            </div>

            {/* Dropdown list of events if they are available */}
            {events.length > 0 ? (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 block ml-1">
                  {texts.selectFromList.replace('{count}', events.length.toString())}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                  <select
                    value={settings.eventRequestCode}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSettings(prev => ({ ...prev, eventRequestCode: val }));
                    }}
                    className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-semibold text-slate-850 appearance-none cursor-pointer"
                  >
                    <option value="">{texts.selectAnEvent}</option>
                    {events.map((ev) => {
                      const eventRequestCode = getEventRequestCode(ev);
                      const dateStr = ev.startUtc ? new Date(ev.startUtc).toLocaleDateString('sv-SE', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : '';
                      const venueStr = ev.venue?.name ? ` @ ${ev.venue.name}` : '';
                      return (
                        <option key={`${ev.id ?? eventRequestCode}-${eventRequestCode}`} value={eventRequestCode}>
                          {ev.name} {dateStr || venueStr ? `(${dateStr}${venueStr})` : ''}
                        </option>
                      );
                    })}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-xs text-slate-450 font-medium">
                {texts.eventHelpText}
              </div>
            )}

            {/* Input field for selected Event ID */}
            <div className="relative">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">{texts.eventIdInputLabel}</label>
              <div className="relative">
                <input
                  type="text"
                  name="eventRequestCode"
                  value={settings.eventRequestCode}
                  onChange={handleChange}
                  className="w-full pl-4 pr-4 py-3 bg-slate-50 hover:bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-semibold text-slate-800 placeholder-slate-400"
                  placeholder={texts.placeholderManualEventId}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Credentials */}
          <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{texts.stageLogin}</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">{texts.labelUsername}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="username"
                    value={settings.username}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-semibold text-slate-800 placeholder-slate-400"
                    placeholder={texts.usernamePlaceholder}
                    required
                  />
                </div>
              </div>
              <div className="relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5 block ml-1">{texts.labelPassword}</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    value={settings.password}
                    onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 hover:bg-slate-50/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white outline-none transition-all text-sm font-semibold text-slate-800 placeholder-slate-400"
                    placeholder={texts.passwordPlaceholder}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-750 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-200/50 transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
        >
          <Save className="w-5 h-5" />
          {texts.saveSettings}
        </button>
      </form>
    </motion.div>
  );
}
