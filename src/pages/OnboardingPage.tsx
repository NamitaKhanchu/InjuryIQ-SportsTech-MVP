import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Users, RefreshCw, ChevronRight, CheckCircle2, Activity, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';

interface OnboardingPageProps {
  onComplete: () => void;
}

export function OnboardingPage({ onComplete }: OnboardingPageProps) {
  const [step, setStep] = React.useState(1);
  const [role, setRole] = React.useState<string | null>(null);

  const nextStep = () => setStep(s => s + 1);

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-[#0F172A] rounded-[2.5rem] p-8 lg:p-12 space-y-8 shadow-2xl transition-colors duration-300"
            >
              <div className="space-y-4 text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto">
                  <Shield className="w-8 h-8 text-accent" />
                </div>
                <h1 className="text-3xl font-black text-primary dark:text-white tracking-tight transition-colors">Privacy Pledge</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Before we begin, your athlete's privacy comes first.</p>
              </div>

              <div className="space-y-4">
                {[
                  { title: 'COPPA Compliant', desc: 'We strictly adhere to Children\'s Online Privacy Protection Act standards.' },
                  { title: 'BIPA Verified', desc: 'Biometric data is encrypted and stored locally whenever possible.' },
                  { title: 'No Data Selling', desc: 'Your athlete\'s health data is never sold to third parties. Ever.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
                    <div className="mt-1">
                      <CheckCircle2 className="w-5 h-5 text-status-green" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-primary dark:text-white text-sm transition-colors">{item.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed transition-colors">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <button 
                  onClick={nextStep}
                  className="w-full py-4 bg-accent text-primary font-black rounded-2xl shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  I CONSENT & PLEDGE
                  <ChevronRight className="w-5 h-5" />
                </button>
                <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest transition-colors">
                  Your data never sold. Ever. 🔒
                </p>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-[#0F172A] rounded-[2.5rem] p-8 lg:p-12 space-y-8 shadow-2xl transition-colors duration-300"
            >
              <div className="space-y-2 text-center">
                <h1 className="text-3xl font-black text-primary dark:text-white tracking-tight transition-colors">I am a...</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Select your primary role to personalize your experience.</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'athlete', label: 'Athlete', icon: Activity, benefits: ['Track recovery', 'View body map', 'Access lab'] },
                  { id: 'parent', label: 'Parent', icon: Shield, benefits: ['Safety alerts', 'Peace of mind', 'Consent control'] },
                  { id: 'coach', label: 'Coach', icon: Users, benefits: ['Team dashboard', 'Prescriptions', 'Risk management'] },
                ].map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={cn(
                      "p-6 rounded-2xl border-2 text-left transition-all flex items-center gap-6",
                      role === r.id 
                        ? "border-accent bg-accent/5" 
                        : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                    )}
                  >
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      role === r.id ? "bg-accent text-primary" : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500"
                    )}>
                      <r.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-black text-primary dark:text-white uppercase tracking-tight transition-colors">{r.label}</h3>
                      <div className="flex gap-2 mt-1">
                        {r.benefits.map((b, i) => (
                          <span key={i} className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase transition-colors">{b} {i < 2 && '•'}</span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button 
                disabled={!role}
                onClick={nextStep}
                className="w-full py-4 bg-primary dark:bg-accent text-white dark:text-primary font-black rounded-2xl shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                CONTINUE
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-[#0F172A] rounded-[2.5rem] p-8 lg:p-12 space-y-8 shadow-2xl transition-colors duration-300"
            >
              <div className="space-y-2 text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto">
                  <RefreshCw className="w-8 h-8 text-accent" />
                </div>
                <h1 className="text-3xl font-black text-primary dark:text-white tracking-tight transition-colors">Connect your teams</h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Sync data across all your organizations.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">School Team</label>
                    <input 
                      type="text" 
                      placeholder="e.g. West High Varsity" 
                      className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-accent/50 transition-all outline-none dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Club Team</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Elite Soccer Academy" 
                      className="w-full p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-accent/50 transition-all outline-none dark:text-white"
                    />
                  </div>
                </div>

                <div className="p-4 bg-status-yellow/10 border border-status-yellow/20 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-status-yellow shrink-0 mt-0.5" />
                  <p className="text-xs text-primary dark:text-slate-300 font-medium leading-relaxed transition-colors">
                    Connecting both teams allows InjuryIQ to detect hidden load spikes from multi-team training.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={onComplete}
                  className="w-full py-4 bg-accent text-primary font-black rounded-2xl shadow-lg shadow-accent/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  FINISH SETUP
                </button>
                <button 
                  onClick={onComplete}
                  className="w-full py-2 text-slate-400 dark:text-slate-500 font-bold text-sm hover:text-primary dark:hover:text-white transition-colors"
                >
                  Skip for now (you'll miss cross-team injury alerts)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
