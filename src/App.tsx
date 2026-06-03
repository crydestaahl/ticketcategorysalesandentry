import React, { useState, useEffect } from 'react';
import { AppSettings, TicksterResponse } from './types';
import Dashboard from './components/Dashboard';
import CategoriesAndSections from './components/CategoriesAndSections';
import Settings from './Settings';
import { LayoutDashboard, Settings as SettingsIcon, Layers, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Language = 'sv' | 'en';

const DEFAULT_SETTINGS: AppSettings = {
  eogRequestCode: '',
  eventRequestCode: '',
  apikey: '',
  username: '',
  password: '',
};

const translations = {
  sv: {
    navDashboard: 'Dashboard',
    navCategories: 'Kategori & Sekt.',
    navSettings: 'Inställningar',
    toggleLanguage: 'EN',
    missingFieldsError: 'Vänligen fyll i alla fält i inställningarna.',
    fetchDataError: 'Kunde inte hämta data',
    settingsTitle: 'Inställningar',
    settingsDescription: 'Konfigurera din koppling lokalt',
    stageOrganizerApi: '1. Arrangör & API-nyckel',
    labelOrganizerId: 'Arrangörs ID (eogRequestCode)',
    labelApiKey: 'API Nyckel',
    placeholderOrganizerId: 'T.ex. G72XGAEATMY9GUX',
    placeholderApiKey: 'Din Tickster API-nyckel',
    fetchEvents: 'HÄMTA EVENEMANG',
    fetchingEvents: 'HÄMTAR EVENEMANG...',
    fillOrganizerAndApi: 'Fyll i Arrangörs ID och API Nyckel först.',
    fetchEventsFailed: 'Misslyckades att hämta evenemang',
    stageSelectEvent: '2. Välj Evenemang',
    selectFromList: 'Välj från lista ({count} st)',
    selectAnEvent: '-- Välj ett evenemang --',
    placeholderManualEventId: 'Insprat ID eller skriv in manuellt...',
    eventIdInputLabel: 'Egen inställning: Evenemangs ID (eventRequestCode)',
    usernamePlaceholder: 'User',
    passwordPlaceholder: 'Pass',
    stageLogin: '3. Inloggning',
    labelUsername: 'Användarnamn',
    labelPassword: 'Lösenord',
    saveSettings: 'Spara & Tillämpa Inställningar',
    eventHelpText: 'Spara eller fyll i Arrangörs ID & API-nyckel och klicka på "Hämta evenemang" ovan för att välja från din lista.',
    dashboardLoading: 'Hämtar biljettdata...',
    categoriesLoading: 'Hämtar fördelning...',
    dashboardErrorTitle: 'Ett fel uppstod',
    tryAgain: 'Försök igen',
    updated: 'Uppdaterad',
    never: 'Aldrig',
    admitted: 'Insläppta',
    of: 'av',
    scanned: 'Scannade',
    sold: 'Sålda',
    remaining: 'Kvar',
    latestStatus: 'Senaste status',
    live: 'Live',
    totalInSystem: 'Totalt i systemet',
    allTicketTypes: 'Alla biljettyper',
    admittedNow: 'Insläppta nu',
    scannedTickets: 'Scannade biljetter',
    categorySplitTitle: 'Uppdelning',
    categorySplitHeading: 'Uppdelning',
    categorySplitOverview: 'Kategori- & Sektionsfördelning',
    categoriesTab: 'Kategorier',
    sectionsTab: 'Sektioner',
    searchCategoryPlaceholder: 'Sök på kategori...',
    searchSectionPlaceholder: 'Sök på sektion...',
    clear: 'Rensa',
    noMatchesFound: 'Inga matchande resultat hittades',
    noCategoriesAvailable: 'Inga kategorier tillgängliga',
    noSectionsAvailable: 'Inga sektioner tillgängliga',
    viewAll: 'Visa alla',
    leftToScan: 'st kvar att skanna',
    sectionDataMissing: 'Ingen sektionsdata finns för denna kategori.',
    sectionsIn: 'Sektioner i {name}',
    admittedOfSold: '{admitted} av {sold} insläppta',
    admittedSold: '{admitted} insläppta / {sold} sålda',
    admittedPercentage: '{percent}% insläppta',
    eventFallback: 'Väntar på data...',
  },
  en: {
    navDashboard: 'Dashboard',
    navCategories: 'Category & Sec.',
    navSettings: 'Settings',
    toggleLanguage: 'SV',
    missingFieldsError: 'Please fill in all settings fields.',
    fetchDataError: 'Could not fetch data',
    settingsTitle: 'Settings',
    settingsDescription: 'Configure your connection locally',
    stageOrganizerApi: '1. Organizer & API key',
    labelOrganizerId: 'Organizer ID (eogRequestCode)',
    labelApiKey: 'API Key',
    placeholderOrganizerId: 'Ex. G72XGAEATMY9GUX',
    placeholderApiKey: 'Your Tickster API key',
    fetchEvents: 'FETCH EVENTS',
    fetchingEvents: 'FETCHING EVENTS...',
    fillOrganizerAndApi: 'Fill in Organizer ID and API Key first.',
    fetchEventsFailed: 'Failed to fetch events',
    stageSelectEvent: '2. Select Event',
    selectFromList: 'Choose from list ({count})',
    selectAnEvent: '-- Select an event --',
    placeholderManualEventId: 'Paste event ID or type manually...',
    eventIdInputLabel: 'Custom event ID (eventRequestCode)',
    usernamePlaceholder: 'User',
    passwordPlaceholder: 'Pass',
    stageLogin: '3. Login',
    labelUsername: 'Username',
    labelPassword: 'Password',
    saveSettings: 'Save & Apply Settings',
    eventHelpText: 'Save or fill in Organizer ID & API Key and click "FETCH EVENTS" above to choose from your list.',
    dashboardLoading: 'Loading ticket data...',
    categoriesLoading: 'Loading breakdown...',
    dashboardErrorTitle: 'An error occurred',
    tryAgain: 'Try again',
    updated: 'Updated',
    never: 'Never',
    admitted: 'Admitted',
    of: 'of',
    scanned: 'Scanned',
    sold: 'Sold',
    remaining: 'Remaining',
    latestStatus: 'Latest status',
    live: 'Live',
    totalInSystem: 'Total in system',
    allTicketTypes: 'All ticket types',
    admittedNow: 'Admitted now',
    scannedTickets: 'Scanned tickets',
    categorySplitTitle: 'Breakdown',
    categorySplitHeading: 'Breakdown',
    categorySplitOverview: 'Category & Section breakdown',
    categoriesTab: 'Categories',
    sectionsTab: 'Sections',
    searchCategoryPlaceholder: 'Search category...',
    searchSectionPlaceholder: 'Search section...',
    clear: 'Clear',
    noMatchesFound: 'No matching results found',
    noCategoriesAvailable: 'No categories available',
    noSectionsAvailable: 'No sections available',
    viewAll: 'View all',
    leftToScan: 'left to scan',
    sectionDataMissing: 'No section data available for this category.',
    sectionsIn: 'Sections in {name}',
    admittedOfSold: '{admitted} of {sold} admitted',
    admittedSold: '{admitted} admitted / {sold} sold',
    admittedPercentage: '{percent}% admitted',
    eventFallback: 'Waiting for data...',
  },
} as const;

export default function App() {
  const [view, setView] = useState<'dashboard' | 'categories' | 'settings'>('dashboard');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('tickster_language');
    return saved === 'en' ? 'en' : 'sv';
  });
  const texts = translations[language];
  
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

  useEffect(() => {
    localStorage.setItem('tickster_language', language);
  }, [language]);

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
      setError(texts.missingFieldsError);
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
        throw new Error(errData.details || errData.error || texts.fetchDataError);
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
                texts={texts}
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
                texts={texts}
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
              <Settings onSave={handleSaveSettings} initialSettings={settings} texts={texts} />
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
          <span className="text-[9px] font-bold uppercase tracking-wider">{texts.navDashboard}</span>
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
          <span className="text-[9px] font-bold uppercase tracking-wider">{texts.navCategories}</span>
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
          <span className="text-[9px] font-bold uppercase tracking-wider">{texts.navSettings}</span>
        </button>
      
        <button
          onClick={() => setLanguage(prev => prev === 'sv' ? 'en' : 'sv')}
          className="flex-none px-3 py-3 rounded-3xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all text-[9px] font-bold uppercase tracking-wider flex items-center gap-2"
        >
          <Globe className="w-4 h-4" />
          {texts.toggleLanguage}
        </button>
      </nav>
    </div>
  );
}
