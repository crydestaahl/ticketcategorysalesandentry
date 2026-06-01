import React, { useState, useMemo } from 'react';
import { TicksterTicket, AppSettings } from '../types';
import { Layers, MapPin, Search, Inbox, Ticket, Clock, RefreshCcw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CategoriesAndSectionsProps {
  settings: AppSettings;
  tickets: TicksterTicket[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  cooldown: number;
  fetchData: () => Promise<void>;
}

export default function CategoriesAndSections({
  settings,
  tickets,
  loading,
  error,
  lastUpdated,
  cooldown,
  fetchData,
}: CategoriesAndSectionsProps) {
  const [activeTab, setActiveTab] = useState<'category' | 'section'>('category');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Group tickets by target field ("goodsName" or "section")
  const groupedData = useMemo(() => {
    const field = activeTab === 'category' ? 'goodsName' : 'section';
    const groups: Record<string, { name: string; sold: number; admitted: number; remaining: number }> = {};
    
    tickets.forEach(ticketObj => {
      const ticket = ticketObj?.ticket;
      if (!ticket) return;
      
      let key = ticket[field];
      if (!key || key.trim() === '') {
        key = field === 'section' ? 'Ospecificerad sektion' : 'Ospecificerad biljettyp';
      }
      
      if (!groups[key]) {
        groups[key] = { name: key, sold: 0, admitted: 0, remaining: 0 };
      }
      
      groups[key].sold += 1;
      if (ticket.ticketState === 'Used') {
        groups[key].admitted += 1;
      } else if (ticket.ticketState === 'Unused' && ticket.validForEntry) {
        groups[key].remaining += 1;
      }
    });

    return Object.values(groups)
      .map(group => ({
        ...group,
        percentage: group.sold > 0 ? (group.admitted / group.sold) * 100 : 0
      }))
      .sort((a, b) => b.sold - a.sold); // Sort by highest sold first
  }, [tickets, activeTab]);

  const categorySectionBreakdown = useMemo(() => {
    const breakdown: Record<string, {
      section: string;
      sold: number;
      admitted: number;
      remaining: number;
      percentage: number;
    }[]> = {};

    if (activeTab !== 'category') {
      return breakdown;
    }

    const map: Record<string, Record<string, { section: string; sold: number; admitted: number; remaining: number }>> = {};

    tickets.forEach(ticketObj => {
      const ticket = ticketObj?.ticket;
      if (!ticket) return;

      const category = ticket.goodsName && ticket.goodsName.trim() !== ''
        ? ticket.goodsName
        : 'Ospecificerad biljettyp';
      const section = ticket.section && ticket.section.trim() !== ''
        ? ticket.section
        : 'Ospecificerad sektion';

      if (!map[category]) {
        map[category] = {};
      }

      if (!map[category][section]) {
        map[category][section] = { section, sold: 0, admitted: 0, remaining: 0 };
      }

      map[category][section].sold += 1;
      if (ticket.ticketState === 'Used') {
        map[category][section].admitted += 1;
      } else if (ticket.ticketState === 'Unused' && ticket.validForEntry) {
        map[category][section].remaining += 1;
      }
    });

    Object.keys(map).forEach(category => {
      breakdown[category] = Object.values(map[category]).map(sectionGroup => ({
        ...sectionGroup,
        percentage: sectionGroup.sold > 0 ? (sectionGroup.admitted / sectionGroup.sold) * 100 : 0,
      })).sort((a, b) => b.sold - a.sold);
    });

    return breakdown;
  }, [tickets, activeTab]);

  // Filter grouped data based on search
  const filteredGroupedData = useMemo(() => {
    if (!searchTerm.trim()) return groupedData;
    const term = searchTerm.toLowerCase();
    return groupedData.filter(group => group.name.toLowerCase().includes(term));
  }, [groupedData, searchTerm]);

  // If loading and there are no tickets yet
  if (loading && tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 p-6">
        <RefreshCcw className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-slate-500 font-medium text-sm">Hämtar fördelning...</p>
      </div>
    );
  }

  // If error and there are no tickets yet
  if (error && tickets.length === 0) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 flex flex-col items-center text-center gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div>
            <h3 className="text-lg font-bold text-red-900">Ett fel uppstod</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button 
            onClick={fetchData}
            className="px-6 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-semibold transition-colors"
          >
            Försök igen
          </button>
        </div>
      </div>
    );
  }

  const eventName = tickets.length > 0 ? tickets[0].ticket.eventName : "Kategori & Sektion";

  return (
    <div className="p-6 space-y-6 max-w-lg mx-auto pb-24">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-450 uppercase tracking-wider leading-none">Uppdelning</h1>
          <h2 className="text-2xl font-black text-slate-900 leading-tight block">{eventName}</h2>
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>Uppdaterad: {lastUpdated?.toLocaleTimeString() || 'Aldrig'}</span>
          </div>
        </div>
        <button 
          onClick={fetchData}
          disabled={loading || cooldown > 0}
          className={`relative p-3 rounded-2xl bg-white border border-slate-100 shadow-sm text-slate-600 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 ${loading ? 'animate-spin' : ''}`}
        >
          {cooldown > 0 ? (
            <span className="text-[10px] font-black text-emerald-600 absolute inset-0 flex items-center justify-center">
              {cooldown}
            </span>
          ) : (
            <RefreshCcw className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Kategori- & Sektionsfördelning */}
      <div className="space-y-4">
        {/* Tab Controls */}
        <div className="bg-slate-100 p-1.5 rounded-2xl flex relative w-full gap-1 shadow-inner border border-slate-200/50">
          <button
            onClick={() => { setActiveTab('category'); setSearchTerm(''); setExpandedCategory(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'category'
                ? 'bg-white text-slate-900 shadow-md shadow-slate-200 border-b border-slate-100'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            Kategorier
          </button>
          <button
            onClick={() => { setActiveTab('section'); setSearchTerm(''); setExpandedCategory(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === 'section'
                ? 'bg-white text-slate-900 shadow-md shadow-slate-200 border-b border-slate-100'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Sektioner
          </button>
        </div>

        {/* Search Input bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'category' ? "Sök på kategori..." : "Sök på sektion..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-16 py-3 bg-white border border-slate-200 rounded-2xl text-sm outline-none shadow-sm focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-slate-800 placeholder-slate-400"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1 hover:bg-slate-50 rounded-lg transition-all"
            >
              Rensa
            </button>
          )}
        </div>

        {/* Items List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredGroupedData.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-3xl p-8 text-center border border-slate-100 shadow-sm flex flex-col items-center gap-3"
              >
                <Inbox className="w-10 h-10 text-slate-300" />
                <p className="text-sm font-semibold text-slate-400">
                  {searchTerm ? 'Inga matchande resultat hittades' : `Inga ${activeTab === 'category' ? 'kategorier' : 'sektioner'} tillgängliga`}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-xs font-bold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all px-3 py-1.5 rounded-lg"
                  >
                    Visa alla
                  </button>
                )}
              </motion.div>
            ) : (
              filteredGroupedData.map((group) => (
                <motion.div
                  layout
                  key={group.name}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.2 }}
                  className={`bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-3 transition-colors ${
                    activeTab === 'category' ? 'hover:border-slate-200 cursor-pointer' : ''
                  }`}
                  onClick={() => {
                    if (activeTab === 'category') {
                      setExpandedCategory(prev => prev === group.name ? null : group.name);
                    }
                  }}
                >
                  {/* Row Top Details */}
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex gap-2.5 items-center min-w-0">
                      <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                        activeTab === 'category' 
                          ? 'bg-purple-50 text-purple-600' 
                          : 'bg-indigo-50 text-indigo-600'
                      }`}>
                        {activeTab === 'category' ? <Ticket className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm md:text-base truncate" title={group.name}>
                          {group.name}
                        </p>
                        <p className="text-xs text-slate-400 font-medium">
                          {group.remaining} st kvar att skanna
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-base font-black text-slate-900 block leading-none">
                        {group.sold}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                        Sålda
                      </span>
                    </div>
                  </div>

                  {/* Progress bar tracking admitted percentage */}
                  <div className="space-y-1.5">
                    <div className="relative w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${group.percentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute h-full bg-emerald-500 rounded-full animate-none"
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-bold">
                      <span>{group.admitted} av {group.sold} insläppta</span>
                      <span className="text-emerald-600">{group.percentage.toFixed(0)}%</span>
                    </div>
                  </div>

                  {activeTab === 'category' && expandedCategory === group.name && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-slate-100 pt-4"
                    >
                      <p className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-3">
                        Sektioner i {group.name}
                      </p>
                      <div className="space-y-3">
                        {categorySectionBreakdown[group.name]?.length ? (
                          categorySectionBreakdown[group.name].map((section) => (
                            <div key={section.section} className="flex items-center justify-between gap-3 rounded-3xl bg-slate-50 p-3">
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-800 text-sm truncate" title={section.section}>
                                  {section.section}
                                </p>
                                <p className="text-[11px] text-slate-500">
                                  {section.admitted} insläppta / {section.sold} sålda
                                </p>
                              </div>
                              <div className="text-right text-[11px] text-slate-500 font-bold">
                                {section.percentage.toFixed(0)}% insläppta
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">Ingen sektionsdata finns för denna kategori.</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
