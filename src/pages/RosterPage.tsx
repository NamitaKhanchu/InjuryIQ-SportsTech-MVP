import React from 'react';
import { motion } from 'motion/react';
import { Activity, Plus, Filter, X, ChevronDown, Check, Trash2 } from 'lucide-react';
import { MOCK_ATHLETES } from '../constants';
import { cn } from '../lib/utils';
import { Athlete } from '../types';

const POSITIONS = ['Forward', 'Midfielder', 'Defender', 'Goalkeeper'];

export function RosterPage() {
  const [athletes, setAthletes] = React.useState<Athlete[]>(MOCK_ATHLETES);
  const [selectedPosition, setSelectedPosition] = React.useState<string | 'ALL'>('ALL');
  const [isPositionFilterOpen, setIsPositionFilterOpen] = React.useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [newPlayer, setNewPlayer] = React.useState({
    name: '',
    position: 'Forward',
    age: 14
  });

  const filteredAthletes = selectedPosition === 'ALL' 
    ? athletes 
    : athletes.filter(a => a.position === selectedPosition);

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    const athlete: Athlete = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPlayer.name,
      position: newPlayer.position,
      age: Number(newPlayer.age),
      status: 'SAFE',
      hrv: 70,
      hrvTrend: [70, 70, 70, 70, 70, 70, 70],
      load: 50,
      sleep: 8,
      wellness: 5,
      teamSync: { school: 'none', club: 'none' }
    };
    setAthletes(prev => [athlete, ...prev]);
    setIsAddModalOpen(false);
    setNewPlayer({ name: '', position: 'Forward', age: 14 });
  };

  const handleDeletePlayer = (id: string) => {
    setAthletes(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-8 pb-20 lg:pb-8">
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary dark:text-white transition-colors">Athlete Readiness Hub</h1>
            <p className="text-slate-500 dark:text-slate-400 transition-colors">Monitoring 12,400+ youth athletes across 847 clubs</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-accent text-primary font-bold px-6 py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-accent/20 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            Add New Player
          </button>
        </div>
      </section>

      <div className="bg-white dark:bg-[#0F172A] rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative">
            <button 
              onClick={() => setIsPositionFilterOpen(!isPositionFilterOpen)}
              className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">
                {selectedPosition === 'ALL' ? 'Filter by Position' : `Position: ${selectedPosition}`}
              </span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", isPositionFilterOpen && "rotate-180")} />
            </button>

            {isPositionFilterOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsPositionFilterOpen(false)} 
                />
                <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-20 py-2 overflow-hidden">
                  <button
                    onClick={() => {
                      setSelectedPosition('ALL');
                      setIsPositionFilterOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    All Positions
                    {selectedPosition === 'ALL' && <Check className="w-4 h-4 text-accent" />}
                  </button>
                  {POSITIONS.map(pos => (
                    <button
                      key={pos}
                      onClick={() => {
                        setSelectedPosition(pos);
                        setIsPositionFilterOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      {pos}
                      {selectedPosition === pos && <Check className="w-4 h-4 text-accent" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider transition-colors">
                <th className="px-6 py-4 font-semibold">Player Name</th>
                <th className="px-6 py-4 font-semibold">Position</th>
                <th className="px-6 py-4 font-semibold text-center">Age</th>
                <th className="px-6 py-4 font-semibold">Today's Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
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
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlayer(athlete.id);
                      }}
                      className="p-2 text-slate-400 hover:text-status-red hover:bg-status-red/10 rounded-lg transition-all"
                      title="Delete Player"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Player Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsAddModalOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            <form onSubmit={handleAddPlayer} className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-primary dark:text-white uppercase tracking-tight">Add Player</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Register a new athlete to the hub</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., John Doe"
                    value={newPlayer.name}
                    onChange={(e) => setNewPlayer(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-accent outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Position</label>
                    <select
                      value={newPlayer.position}
                      onChange={(e) => setNewPlayer(prev => ({ ...prev, position: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-accent outline-none"
                    >
                      {POSITIONS.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Age</label>
                    <input
                      required
                      type="number"
                      min="5"
                      max="25"
                      value={newPlayer.age}
                      onChange={(e) => setNewPlayer(prev => ({ ...prev, age: Number(e.target.value) }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-accent outline-none"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-accent text-primary font-black rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs"
              >
                Confirm Registration
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
