import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, AlertTriangle, Info, ToggleLeft, ToggleRight, Activity, Loader2, ChevronDown, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { generatePrescription } from '../services/injuryService';
import { MOCK_ATHLETES } from '../constants';

type BodyPart = 'hamstring' | 'quad' | 'ankle' | 'shoulder' | 'back' | 'knee' | 'none';

export function AnalysisPage() {
  const [view, setView] = React.useState<'FRONT' | 'BACK'>('FRONT');
  const [selectedPart, setSelectedPart] = React.useState<BodyPart>('none');
  const [cycleAware, setCycleAware] = React.useState(false);
  const [aiPrescription, setAiPrescription] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedAthleteId, setSelectedAthleteId] = React.useState(MOCK_ATHLETES[0].id);
  const [isShared, setIsShared] = React.useState(false);

  const athlete = MOCK_ATHLETES.find(a => a.id === selectedAthleteId) || MOCK_ATHLETES[0];

  const handlePartClick = async (part: BodyPart) => {
    setSelectedPart(part);
    setIsShared(false);
    if (part !== 'none') {
      setLoading(true);
      const prescription = await generatePrescription(athlete, part);
      setAiPrescription(prescription);
      setLoading(false);
    } else {
      setAiPrescription(null);
    }
  };

  // Reset prescription when athlete changes
  React.useEffect(() => {
    setSelectedPart('none');
    setAiPrescription(null);
    setIsShared(false);
  }, [selectedAthleteId]);

  // Mock risk data based on athlete status and specific player profiles
  const getRiskData = (part: BodyPart) => {
    if (part === 'none') return null;
    
    // Emma Rodriguez (ID: 2) - Overload Risk
    if (athlete.id === '2') {
      if (part === 'hamstring') return { risk: 'HIGH', overload: 92 };
      if (part === 'ankle') return { risk: 'MODERATE', overload: 65 };
      if (part === 'back') return { risk: 'MODERATE', overload: 58 };
    }
    
    // Marcus Thompson (ID: 1) - Caution
    if (athlete.id === '1') {
      if (part === 'quad') return { risk: 'MODERATE', overload: 75 };
      if (part === 'knee') return { risk: 'MODERATE', overload: 60 };
    }

    // Leo Chen (ID: 3) - Safe
    if (athlete.id === '3') {
      return { risk: 'LOW', overload: 15 };
    }

    // Default low risk
    return { risk: 'LOW', overload: 20 };
  };

  const currentData = getRiskData(selectedPart);

  const handleShare = () => {
    setIsShared(true);
    setTimeout(() => setIsShared(false), 3000);
  };

  return (
    <div className="space-y-8 pb-20 lg:pb-8">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-primary dark:text-white transition-colors">Digital Twin Body Map</h1>
            <p className="text-slate-500 dark:text-slate-400 transition-colors">Real-time biomechanical risk visualization</p>
          </div>
          
          <div className="relative">
            <select
              value={selectedAthleteId}
              onChange={(e) => setSelectedAthleteId(e.target.value)}
              className="appearance-none pl-10 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-primary dark:text-white focus:ring-2 focus:ring-accent outline-none transition-all cursor-pointer shadow-sm"
            >
              {MOCK_ATHLETES.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white dark:bg-[#0F172A] p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-sm font-bold text-slate-600 dark:text-slate-300 ml-2">Cycle-Aware Mode</span>
          <button 
            onClick={() => setCycleAware(!cycleAware)}
            className="transition-transform active:scale-90"
          >
            {cycleAware ? (
              <ToggleRight className="w-10 h-10 text-accent" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            )}
          </button>
        </div>
      </header>

      {cycleAware && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-primary dark:bg-slate-900 text-white p-6 rounded-3xl space-y-4 overflow-hidden border border-white/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 bg-accent text-primary text-xs font-black rounded-full uppercase">Luteal Phase</div>
              <span className="font-bold">Cycle-aware training = smarter, not softer</span>
            </div>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            Luteal phase increases ACL injury risk 2-8x — <span className="text-accent font-bold">reduce lateral cutting today.</span>
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Body Map Panel */}
        <div className="bg-white dark:bg-[#0F172A] p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center space-y-8 min-h-[600px] transition-colors duration-300">
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-fit transition-colors">
            {(['FRONT', 'BACK'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                  view === v 
                    ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm" 
                    : "text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white"
                )}
              >
                {v}
              </button>
            ))}
          </div>

          <div className="relative flex-1 flex items-center justify-center w-full">
            {/* SVG Silhouette with interactive parts */}
            <svg viewBox="0 0 200 500" className="h-[500px] w-auto">
              {/* Head */}
              <circle cx="100" cy="40" r="25" fill="currentColor" className="text-slate-100 dark:text-slate-800 transition-colors" />
              
              {/* Torso / Back */}
              <motion.rect 
                x="70" y="70" width="60" height="120" rx="10" 
                fill={getRiskData('back')?.risk === 'HIGH' ? '#FF3B30' : getRiskData('back')?.risk === 'MODERATE' ? '#FF9500' : 'currentColor'} 
                className={cn(
                  "transition-colors cursor-pointer hover:opacity-80",
                  getRiskData('back')?.risk === 'LOW' && "text-slate-100 dark:text-slate-800"
                )}
                onClick={() => handlePartClick('back')}
              />

              {/* Shoulders */}
              <motion.circle 
                cx="65" cy="85" r="12" 
                fill={getRiskData('shoulder')?.risk === 'HIGH' ? '#FF3B30' : getRiskData('shoulder')?.risk === 'MODERATE' ? '#FF9500' : 'currentColor'} 
                className={cn(
                  "transition-colors cursor-pointer hover:opacity-80",
                  getRiskData('shoulder')?.risk === 'LOW' && "text-slate-100 dark:text-slate-800"
                )}
                onClick={() => handlePartClick('shoulder')}
              />
              <motion.circle 
                cx="135" cy="85" r="12" 
                fill={getRiskData('shoulder')?.risk === 'HIGH' ? '#FF3B30' : getRiskData('shoulder')?.risk === 'MODERATE' ? '#FF9500' : 'currentColor'} 
                className={cn(
                  "transition-colors cursor-pointer hover:opacity-80",
                  getRiskData('shoulder')?.risk === 'LOW' && "text-slate-100 dark:text-slate-800"
                )}
                onClick={() => handlePartClick('shoulder')}
              />

              {/* Arms */}
              <rect x="40" y="95" width="20" height="80" rx="10" fill="currentColor" className="text-slate-100 dark:text-slate-800 transition-colors" />
              <rect x="140" y="95" width="20" height="80" rx="10" fill="currentColor" className="text-slate-100 dark:text-slate-800 transition-colors" />
              
              {/* Legs - Interactive Parts */}
              {/* Thighs (Hamstring/Quad) */}
              <motion.path
                d="M70 195 L60 300 L85 300 L95 195 Z"
                fill={getRiskData(view === 'FRONT' ? 'quad' : 'hamstring')?.risk === 'HIGH' ? '#FF3B30' : getRiskData(view === 'FRONT' ? 'quad' : 'hamstring')?.risk === 'MODERATE' ? '#FF9500' : '#34C759'}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handlePartClick(view === 'FRONT' ? 'quad' : 'hamstring')}
                whileTap={{ scale: 0.98 }}
              />
              <motion.path
                d="M105 195 L115 300 L140 300 L130 195 Z"
                fill={getRiskData(view === 'FRONT' ? 'quad' : 'hamstring')?.risk === 'HIGH' ? '#FF3B30' : getRiskData(view === 'FRONT' ? 'quad' : 'hamstring')?.risk === 'MODERATE' ? '#FF9500' : '#34C759'}
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handlePartClick(view === 'FRONT' ? 'quad' : 'hamstring')}
              />

              {/* Knees */}
              <motion.circle 
                cx="72" cy="315" r="10" 
                fill={getRiskData('knee')?.risk === 'HIGH' ? '#FF3B30' : getRiskData('knee')?.risk === 'MODERATE' ? '#FF9500' : '#34C759'} 
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handlePartClick('knee')}
              />
              <motion.circle 
                cx="128" cy="315" r="10" 
                fill={getRiskData('knee')?.risk === 'HIGH' ? '#FF3B30' : getRiskData('knee')?.risk === 'MODERATE' ? '#FF9500' : '#34C759'} 
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handlePartClick('knee')}
              />
              
              {/* Lower Legs */}
              <rect x="62" y="330" width="20" height="100" rx="10" fill="#34C759" />
              <rect x="118" y="330" width="20" height="100" rx="10" fill="#34C759" />

              {/* Ankles */}
              <motion.rect 
                x="62" y="435" width="20" height="15" rx="4" 
                fill={getRiskData('ankle')?.risk === 'HIGH' ? '#FF3B30' : getRiskData('ankle')?.risk === 'MODERATE' ? '#FF9500' : '#34C759'} 
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handlePartClick('ankle')}
              />
              <motion.rect 
                x="118" y="435" width="20" height="15" rx="4" 
                fill={getRiskData('ankle')?.risk === 'HIGH' ? '#FF3B30' : getRiskData('ankle')?.risk === 'MODERATE' ? '#FF9500' : '#34C759'} 
                className="cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => handlePartClick('ankle')}
              />
            </svg>

            {/* Labels */}
            <div className="absolute top-0 left-0 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-status-green" />
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 transition-colors">Low Risk</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-status-yellow" />
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 transition-colors">Moderate</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-status-red" />
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 transition-colors">High Risk</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prescription Panel */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {selectedPart !== 'none' ? (
              <motion.div
                key={`${selectedAthleteId}-${selectedPart}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white dark:bg-[#0F172A] p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-8 transition-colors duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center",
                      currentData?.risk === 'HIGH' ? "bg-status-red/10" : 
                      currentData?.risk === 'MODERATE' ? "bg-status-yellow/10" : "bg-status-green/10"
                    )}>
                      <AlertTriangle className={cn(
                        "w-6 h-6",
                        currentData?.risk === 'HIGH' ? "text-status-red" : 
                        currentData?.risk === 'MODERATE' ? "text-status-yellow" : "text-status-green"
                      )} />
                    </div>
                    <div>
                      <h3 className="font-black text-primary dark:text-white text-xl uppercase tracking-tight transition-colors">Coaching Prescription</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium transition-colors">{athlete.name} • {selectedPart.toUpperCase()}</p>
                    </div>
                  </div>
                  <button className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-accent hover:text-primary transition-all">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 min-h-[160px] flex flex-col justify-center transition-colors">
                  {loading ? (
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Loader2 className="w-8 h-8 text-accent animate-spin" />
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">AI Engine Analyzing...</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Risk Level</span>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-black",
                          currentData?.risk === 'HIGH' ? "bg-status-red text-white" : 
                          currentData?.risk === 'MODERATE' ? "bg-status-yellow text-white" : "bg-status-green text-white"
                        )}>
                          {currentData?.risk} RISK
                        </span>
                      </div>
                      <p className="text-primary dark:text-white font-bold text-lg leading-snug transition-colors">
                        {aiPrescription}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-0.5 bg-accent/10 rounded text-[8px] font-black text-accent uppercase">AI Generated</div>
                        <div className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase transition-colors">Verified by InjuryIQ</div>
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-primary dark:text-white transition-colors">Overload Intensity</span>
                    <span className={cn(
                      "text-sm font-black",
                      currentData?.risk === 'HIGH' ? "text-status-red" : 
                      currentData?.risk === 'MODERATE' ? "text-status-yellow" : "text-status-green"
                    )}>{currentData?.overload || 0}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden transition-colors">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${currentData?.overload || 0}%` }}
                      className={cn(
                        "h-full",
                        currentData?.risk === 'HIGH' ? "bg-status-red" : 
                        currentData?.risk === 'MODERATE' ? "bg-status-yellow" : "bg-status-green"
                      )}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleShare}
                  disabled={isShared}
                  className={cn(
                    "w-full py-4 font-black rounded-2xl shadow-lg transition-all",
                    isShared 
                      ? "bg-status-green text-white cursor-default" 
                      : "bg-accent text-primary shadow-accent/20 hover:scale-[1.02] active:scale-95"
                  )}
                >
                  {isShared ? "SHARED WITH ATHLETE!" : "SHARE WITH ATHLETE"}
                </button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-100/50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 flex flex-col items-center text-center space-y-4 transition-colors"
              >
                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm transition-colors">
                  <Activity className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-400 dark:text-slate-500">No Body Part Selected</h3>
                  <p className="text-slate-400 dark:text-slate-500 text-sm max-w-[240px]">Tap any color-coded muscle group on the body map to view specific coaching prescriptions for {athlete.name}.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
