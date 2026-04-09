import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Activity, Heart, RefreshCw, Zap, Info, TrendingUp, TrendingDown, AlertCircle, Shield, Users, ChevronRight } from 'lucide-react';
import { MOCK_ATHLETES } from '../constants';
import { cn } from '../lib/utils';
import { LineChart, Line, ResponsiveContainer, YAxis, BarChart, Bar, Cell } from 'recharts';

export function DashboardPage() {
  const navigate = useNavigate();
  const redFlagAthletes = MOCK_ATHLETES.filter(a => a.status === 'OVERLOAD_RISK');
  const cautionAthletes = MOCK_ATHLETES.filter(a => a.status === 'CAUTION');
  const safeAthletes = MOCK_ATHLETES.filter(a => a.status === 'SAFE');

  const teamReadinessData = [
    { name: 'Red', value: redFlagAthletes.length, color: '#FF3B30' },
    { name: 'Yellow', value: cautionAthletes.length, color: '#FF9500' },
    { name: 'Green', value: safeAthletes.length, color: '#34C759' },
  ];

  return (
    <div className="space-y-8 pb-20 lg:pb-8">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary dark:text-white transition-colors">Team Readiness Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 transition-colors">Real-time injury risk monitoring for your roster</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-[#0F172A] px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <Users className="w-5 h-5 text-accent" />
          <span className="font-black text-primary dark:text-white uppercase tracking-tight transition-colors">Active Roster</span>
          <span className="text-2xl font-black text-primary dark:text-accent transition-colors">{MOCK_ATHLETES.length}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Team Status Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white dark:bg-[#0F172A] p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 space-y-8 transition-colors duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-primary dark:text-white uppercase tracking-tight">Readiness Distribution</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current squad availability</p>
            </div>
            <div className="flex items-center gap-4">
              {teamReadinessData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamReadinessData}>
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {teamReadinessData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="p-6 bg-status-red/5 rounded-3xl border border-status-red/10 text-center space-y-2">
              <p className="text-3xl font-black text-status-red">{redFlagAthletes.length}</p>
              <p className="text-[10px] font-black text-status-red uppercase tracking-widest">High Risk</p>
            </div>
            <div className="p-6 bg-status-yellow/5 rounded-3xl border border-status-yellow/10 text-center space-y-2">
              <p className="text-3xl font-black text-status-yellow">{cautionAthletes.length}</p>
              <p className="text-[10px] font-black text-status-yellow uppercase tracking-widest">Caution</p>
            </div>
            <div className="p-6 bg-status-green/5 rounded-3xl border border-status-green/10 text-center space-y-2">
              <p className="text-3xl font-black text-status-green">{safeAthletes.length}</p>
              <p className="text-[10px] font-black text-status-green uppercase tracking-widest">Available</p>
            </div>
          </div>
        </motion.div>

        {/* Red Flags Sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-[#0F172A] p-8 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 space-y-8 transition-colors duration-300"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-status-red" />
              <h2 className="text-2xl font-black text-primary dark:text-white uppercase tracking-tight">Red Flags</h2>
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Immediate attention required</p>
          </div>

          <div className="space-y-4">
            {redFlagAthletes.length > 0 ? (
              redFlagAthletes.map(athlete => (
                <div 
                  key={athlete.id} 
                  onClick={() => navigate(`/analysis?athleteId=${athlete.id}&autoScan=true`)}
                  className="group p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-status-red/50 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-status-red/10 flex items-center justify-center font-black text-status-red">
                        {athlete.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-primary dark:text-white">{athlete.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{athlete.position}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-status-red transition-colors" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3 text-accent" />
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">Load: {athlete.load}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3 text-status-red" />
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">HRV: {athlete.hrv}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center space-y-4">
                <div className="w-12 h-12 bg-status-green/10 rounded-full flex items-center justify-center mx-auto">
                  <Shield className="w-6 h-6 text-status-green" />
                </div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No high-risk athletes</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Team Load Trends */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Avg Team Load', value: '68%', icon: Zap, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Avg Sleep', value: '7.4h', icon: Activity, color: 'text-status-green', bg: 'bg-status-green/10' },
          { label: 'Team Wellness', value: '4.2/5', icon: Heart, color: 'text-status-yellow', bg: 'bg-status-yellow/10' },
        ].map((metric, i) => (
          <motion.div 
            key={i}
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4 transition-colors duration-300"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", metric.bg)}>
              <metric.icon className={cn("w-6 h-6", metric.color)} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{metric.label}</p>
              <p className="text-2xl font-black text-primary dark:text-white transition-colors">{metric.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
