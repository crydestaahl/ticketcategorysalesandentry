import React from 'react';
import { TicksterResponse, TicksterTicket, AppSettings } from '../types';
import { Users, LogIn, Clock, RefreshCcw, AlertCircle, Ticket } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  settings: AppSettings;
  texts: Record<string, string>;
  tickets: TicksterTicket[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  cooldown: number;
  fetchData: () => Promise<void>;
}

export default function Dashboard({
  settings,
  texts,
  tickets,
  loading,
  error,
  lastUpdated,
  cooldown,
  fetchData,
}: DashboardProps) {

  if (loading && tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4 p-6">
        <RefreshCcw className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-slate-500 font-medium text-sm">{texts.dashboardLoading}</p>
      </div>
    );
  }

  if (error && tickets.length === 0) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <div className="bg-red-50 border border-red-100 rounded-3xl p-6 flex flex-col items-center text-center gap-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <div>
            <h3 className="text-lg font-bold text-red-900">{texts.dashboardErrorTitle}</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button 
            onClick={fetchData}
            className="px-6 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl font-semibold transition-colors"
          >
            {texts.tryAgain}
          </button>
        </div>
      </div>
    );
  }

  const totalSold = tickets.length;
  const admitted = tickets.filter(t => t?.ticket?.ticketState === 'Used').length;
  const remaining = tickets.filter(t => t?.ticket?.ticketState === 'Unused' && t?.ticket?.validForEntry).length;
  const eventName = tickets.length > 0 ? tickets[0].ticket.eventName : texts.eventFallback;
  
  const entryPercentage = totalSold > 0 ? (admitted / totalSold) * 100 : 0;

  return (
    <div className="p-6 space-y-6 max-w-lg mx-auto pb-24">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-900 leading-tight">{eventName}</h1>
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>{texts.updated}: {lastUpdated?.toLocaleTimeString() || texts.never}</span>
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

      {/* Main Stat Card (Gauge-like) */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-slate-50 relative overflow-hidden"
      >
        <div className="relative z-10 flex flex-col items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">{texts.admitted}</span>
          
          {/* Circular Progress (Simplified SVG) */}
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="80"
                fill="none"
                stroke="#F1F5F9"
                strokeWidth="16"
              />
              <motion.circle
                cx="96"
                cy="96"
                r="80"
                fill="none"
                stroke="#10B981"
                strokeWidth="16"
                strokeDasharray={502.6}
                initial={{ strokeDashoffset: 502.6 }}
                animate={{ strokeDashoffset: 502.6 - (502.6 * entryPercentage) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-slate-900">{admitted}</span>
              <span className="text-sm font-bold text-slate-400">{texts.of} {totalSold}</span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            {entryPercentage.toFixed(1)}% {texts.scanned}
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-50" />
      </motion.div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3"
        >
          <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{texts.sold}</p>
            <p className="text-2xl font-black text-slate-900">{totalSold}</p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3"
        >
          <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{texts.remaining}</p>
            <p className="text-2xl font-black text-slate-900">{remaining}</p>
          </div>
        </motion.div>
      </div>

      {/* Detailed List Preview */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold text-slate-900">{texts.latestStatus}</h3>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">{texts.live}</span>
        </div>
        
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{texts.totalInSystem}</p>
                <p className="text-xs text-slate-400">{texts.allTicketTypes}</p>
              </div>
            </div>
            <span className="font-black text-slate-900">{totalSold}</span>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <LogIn className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{texts.admittedNow}</p>
                <p className="text-xs text-slate-400">{texts.scannedTickets}</p>
              </div>
            </div>
            <span className="font-black text-emerald-600">{admitted}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
