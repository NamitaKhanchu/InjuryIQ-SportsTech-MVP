import React from 'react';
import { motion } from 'motion/react';
import { QrCode, Shield, Lock, Smartphone, AlertCircle, CheckCircle2, MessageCircle, Activity, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export function CommunicationPage() {
  const [role, setRole] = React.useState<'PARENT' | 'COACH' | 'TRAINER'>('PARENT');

  return (
    <div className="space-y-8 pb-20 lg:pb-8">
      <header>
        <h1 className="text-3xl font-bold text-primary dark:text-white transition-colors">Communication Hub</h1>
        <p className="text-slate-500 dark:text-slate-400 transition-colors">Bridge the gap between objective data and subjective reporting</p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Panel A: Link & Verify */}
        <section className="bg-white dark:bg-[#0F172A] p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-8 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-xl font-black text-primary dark:text-white uppercase tracking-tight transition-colors">Link & Verify</h2>
          </div>

          <div className="space-y-6">
            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center space-y-4 transition-colors">
              <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Your Unique Link Code</span>
              <div className="text-4xl font-black text-primary dark:text-white tracking-[0.2em] transition-colors">847 291</div>
              <button className="text-accent font-bold text-sm hover:underline">Regenerate Code</button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800 transition-colors" />
              <span className="text-xs font-bold text-slate-300 dark:text-slate-700 uppercase transition-colors">OR</span>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800 transition-colors" />
            </div>

            <button className="w-full py-4 bg-primary dark:bg-slate-800 text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-primary/90 dark:hover:bg-slate-700 transition-all">
              <QrCode className="w-5 h-5" />
              Scan QR Code
            </button>
          </div>

          <div className="space-y-4">
            <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Role</span>
            <div className="grid grid-cols-3 gap-2">
              {(['PARENT', 'COACH', 'TRAINER'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={cn(
                    "py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                    role === r 
                      ? "bg-accent text-primary shadow-lg shadow-accent/20" 
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 transition-colors">
              <span>Feature Permissions</span>
              <Lock className="w-3 h-3" />
            </div>
            {[
              { label: 'View Safety Status', unlocked: true },
              { label: 'Receive Alerts', unlocked: true },
              { label: 'View Biometrics', unlocked: role !== 'PARENT' },
              { label: 'Issue Prescriptions', unlocked: role === 'TRAINER' },
            ].map((f, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl transition-colors">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">{f.label}</span>
                {f.unlocked ? <CheckCircle2 className="w-4 h-4 text-status-green" /> : <Lock className="w-4 h-4 text-slate-300 dark:text-slate-700" />}
              </div>
            ))}
          </div>
        </section>

        {/* Panel B: Objective vs Subjective Bridge */}
        <section className="bg-white dark:bg-[#0F172A] p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-8 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-xl font-black text-primary dark:text-white uppercase tracking-tight transition-colors">Data Bridge</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl space-y-2 transition-colors">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Athlete Reported</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-primary dark:text-white transition-colors">4/5</span>
                  <span className="text-xs font-bold text-status-green">Fine</span>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl space-y-2 transition-colors">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Sensor Data</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-status-red">HIGH</span>
                  <span className="text-xs font-bold text-status-red">Load Spike</span>
                </div>
              </div>
            </div>

            <motion.div 
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="p-6 bg-status-yellow/10 border border-status-yellow/20 rounded-2xl space-y-3"
            >
              <div className="flex items-center gap-2 text-status-yellow">
                <AlertCircle className="w-5 h-5" />
                <span className="font-black text-sm uppercase tracking-tight">Visual Discrepancy Alert</span>
              </div>
              <p className="text-xs text-primary dark:text-slate-300 font-medium leading-relaxed transition-colors">
                Marcus reported feeling fine (4/5) but wearable data shows <span className="text-status-red font-bold">HIGH load</span> — flagging for coach review.
              </p>
              <button className="w-full py-3 bg-status-yellow text-white font-black text-xs rounded-xl uppercase tracking-widest">
                Escalate to Coach
              </button>
            </motion.div>

            <div className="space-y-4">
              <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Recent Activity</span>
              <div className="space-y-3">
                {[
                  { user: 'Coach Martinez', action: 'Reviewed load data', time: '2m ago' },
                  { user: 'Marcus', action: 'Submitted wellness report', time: '1h ago' },
                ].map((a, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 transition-colors" />
                      <span className="font-bold text-primary dark:text-white transition-colors">{a.user}</span>
                    </div>
                    <span className="text-slate-400 dark:text-slate-500 text-xs transition-colors">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Panel C: Parent Safety Alerts */}
        <section className="bg-white dark:bg-[#0F172A] p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-8 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-accent" />
            </div>
            <h2 className="text-xl font-black text-primary dark:text-white uppercase tracking-tight transition-colors">Safety Alerts</h2>
          </div>

          <div className="space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Real-time Alert Log</span>
              <div className="space-y-3">
                {[
                  { type: 'RED', msg: 'Emma just hit RED status', time: '4:32 PM', icon: AlertCircle, color: 'text-status-red' },
                  { type: 'LOAD', msg: 'Load Spike detected', time: '2:15 PM', icon: Zap, color: 'text-status-yellow' },
                  { type: 'MSG', msg: 'Coach Martinez sent a message', time: '11:05 AM', icon: MessageCircle, color: 'text-accent' },
                  { type: 'CLEAR', msg: 'Marcus cleared for play', time: '9:00 AM', icon: CheckCircle2, color: 'text-status-green' },
                ].map((alert, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                    <alert.icon className={cn("w-5 h-5 mt-0.5", alert.color)} />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-primary dark:text-white transition-colors">{alert.msg}</p>
                      <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 transition-colors">{alert.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-primary dark:bg-slate-900 text-white rounded-3xl space-y-4 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Notification Preview</span>
                <div className="w-8 h-1 bg-white/20 rounded-full" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-accent rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-xs font-bold">SafetyIQ Alert</span>
                </div>
                <p className="text-sm font-medium leading-relaxed">
                  Emma just hit <span className="text-status-red font-black uppercase">RED status</span> at 4:32 PM. Coach has been notified. Tap to view details.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-center transition-colors">
                Your club's risk management, automated.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
