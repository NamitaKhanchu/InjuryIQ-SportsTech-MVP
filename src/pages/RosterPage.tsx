import React from 'react';
import { motion } from 'motion/react';
import { Shield, AlertCircle, CheckCircle2, Plus, Filter } from 'lucide-react';
import { MOCK_ATHLETES } from '../constants';
import { cn } from '../lib/utils';

export function RosterPage() {
  const [filter, setFilter] = React.useState<'ALL' | 'ACTION' | 'VERIFIED'>('ALL');

  const filteredAthletes = MOCK_ATHLETES.filter(a => {
    if (filter === 'ACTION') return a.consent === 'ACTION_REQUIRED';
    if (filter === 'VERIFIED') return a.consent === 'VERIFIED';
    return true;
  });

  const missingConsentCount = MOCK_ATHLETES.filter(a => a.consent === 'ACTION_REQUIRED').length;

  return (
    <div className="space-y-8 pb-20 lg:pb-8">
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary dark:text-white transition-colors">Compliance & Readiness Hub</h1>
            <p className="text-slate-500 dark:text-slate-400 transition-colors">Protecting 12,400+ youth athletes across 847 clubs</p>
          </div>
          <button className="bg-accent text-primary font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-accent/20 transition-all active:scale-95">
            <Plus className="w-5 h-5" />
            Add New Player
          </button>
        </div>

        {missingConsentCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-status-red/10 dark:bg-status-red/20 border border-status-red/20 dark:border-status-red/30 p-4 rounded-2xl flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3 text-status-red">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold">{missingConsentCount} players missing consent — your club has liability exposure.</span>
            </div>
            <button className="text-status-red font-bold hover:underline">Fix now →</button>
          </motion.div>
        )}
      </section>

      <div className="bg-white dark:bg-[#0F172A] rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl transition-colors">
            {(['ALL', 'ACTION', 'VERIFIED'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  filter === f 
                    ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm" 
                    : "text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white"
                )}
              >
                {f === 'ALL' ? 'All Athletes' : f === 'ACTION' ? 'Action Required' : 'Verified'}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter by Position</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider transition-colors">
                <th className="px-6 py-4 font-semibold">Player Name</th>
                <th className="px-6 py-4 font-semibold">Position</th>
                <th className="px-6 py-4 font-semibold text-center">Age</th>
                <th className="px-6 py-4 font-semibold">Today's Status</th>
                <th className="px-6 py-4 font-semibold">Privacy & Consent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAthletes.map((athlete) => (
                <tr key={athlete.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary dark:text-white font-bold transition-colors">
                        {athlete.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-primary dark:text-white group-hover:text-accent transition-colors">{athlete.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium transition-colors">{athlete.position}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium text-center transition-colors">{athlete.age}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                      athlete.status === 'SAFE' && "bg-status-green/10 dark:bg-status-green/20 text-status-green",
                      athlete.status === 'CAUTION' && "bg-status-yellow/10 dark:bg-status-yellow/20 text-status-yellow",
                      athlete.status === 'OVERLOAD_RISK' && "bg-status-red/10 dark:bg-status-red/20 text-status-red"
                    )}>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        athlete.status === 'SAFE' && "bg-status-green",
                        athlete.status === 'CAUTION' && "bg-status-yellow",
                        athlete.status === 'OVERLOAD_RISK' && "bg-status-red animate-pulse"
                      )} />
                      {athlete.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "flex items-center gap-2 font-medium text-sm",
                      athlete.consent === 'VERIFIED' ? "text-status-green" : "text-status-red"
                    )}>
                      {athlete.consent === 'VERIFIED' ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Consent Verified</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 animate-pulse-red" />
                          <span>Action Required</span>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
