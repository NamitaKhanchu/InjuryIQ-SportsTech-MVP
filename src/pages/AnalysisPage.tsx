import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Share2, 
  AlertTriangle, 
  Info, 
  ToggleLeft, 
  ToggleRight, 
  Activity, 
  Loader2, 
  ChevronDown, 
  Users, 
  Zap, 
  ShieldCheck, 
  ArrowRight,
  Brain,
  Search,
  Dna
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { analyzeAthleteStrain } from '../services/aiService';
import { MOCK_ATHLETES } from '../constants';
import { AnatomicalModel } from '../components/AnatomicalModel';
import { StrainMap, AiAssessment } from '../types';

export function AnalysisPage() {
  const navigate = useNavigate();
  const [view, setView] = React.useState<'FRONT' | 'BACK'>('FRONT');
  const [selectedPart, setSelectedPart] = React.useState<string | null>(null);
  const [cycleAware, setCycleAware] = React.useState(false);
  const [isScanning, setIsScanning] = React.useState(false);
  const [assessment, setAssessment] = React.useState<AiAssessment | null>(null);
  const [selectedAthleteId, setSelectedAthleteId] = React.useState(MOCK_ATHLETES[0].id);
  const [isShared, setIsShared] = React.useState(false);

  const athlete = MOCK_ATHLETES.find(a => a.id === selectedAthleteId) || MOCK_ATHLETES[0];

  const handleSmartScan = async () => {
    setIsScanning(true);
    setSelectedPart(null);
    try {
      // Simulate "Biomechanical Scan" delay for effect
      await new Promise(resolve => setTimeout(resolve, 2500));
      const result = await analyzeAthleteStrain(athlete, cycleAware);
      setAssessment(result);
    } catch (error) {
      console.error("Scan failed", error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleMitigationClick = (sessionId: string) => {
    navigate(`/recovery?view=HUB&highlight=${sessionId}`);
  };

  // Reset assessment when athlete changes
  React.useEffect(() => {
    setSelectedPart(null);
    setAssessment(null);
    setIsShared(false);
  }, [selectedAthleteId]);

  const handleShare = () => {
    setIsShared(true);
    setTimeout(() => setIsShared(false), 3000);
  };

  return (
    <div className="space-y-8 pb-20 lg:pb-8">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-primary dark:text-white transition-colors">InjuryIQ <span className="text-accent">Smart Lab</span></h1>
            <p className="text-slate-500 dark:text-slate-400 transition-colors">Predictive biomechanical risk & Digital Twin analysis</p>
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
          <div className="flex flex-col items-end mr-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Female Focus</span>
            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Cycle-Aware Mode</span>
          </div>
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

      <AnimatePresence>
        {cycleAware && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-primary dark:bg-slate-900 text-white p-6 rounded-3xl space-y-4 overflow-hidden border border-white/10 relative"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Dna className="w-24 h-24" />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-accent text-primary text-xs font-black rounded-full uppercase">Luteal Phase Analysis</div>
                <span className="font-bold">Hormonal Sensitivity Enabled</span>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed max-w-2xl relative z-10">
              Current phase increases ACL laxity and reduces glycogen sparing. AI sensitivity has been increased by <span className="text-accent font-bold">15%</span> for lateral movement strain.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Digital Twin Panel */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0F172A] p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center space-y-8 min-h-[650px] transition-colors duration-300 relative overflow-hidden lab-grid">
          {isScanning && (
            <motion.div 
              initial={{ top: '0%' }}
              animate={{ top: '100%' }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-accent/50 shadow-[0_0_15px_rgba(0,255,157,0.8)] z-20"
            />
          )}

          <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-fit transition-colors relative z-10">
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
            <AnatomicalModel 
              view={view} 
              strainData={assessment?.strains || {}} 
              selectedPart={selectedPart || undefined}
              onPartClick={setSelectedPart}
            />
            
            {!assessment && !isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-[2px] rounded-2xl">
                <div className="text-center space-y-4 p-6 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 max-w-[200px]">
                  <Brain className="w-10 h-10 text-accent mx-auto animate-pulse" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Initialize Digital Twin Scan</p>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleSmartScan}
            disabled={isScanning}
            className={cn(
              "w-full py-4 font-black rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3",
              isScanning 
                ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed" 
                : "bg-primary text-white hover:bg-slate-800 active:scale-95"
            )}
          >
            {isScanning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                BIOMECHANICAL SCANNING...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 text-accent" />
                RUN AI SMART SCAN
              </>
            )}
          </button>
        </div>

        {/* Analysis & Mitigations Panel */}
        <div className="lg:col-span-7 space-y-6 lab-grid p-1 rounded-[2.5rem]">
          <AnimatePresence mode="wait">
            {isScanning ? (
              <motion.div
                key="scanning"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-8 min-h-[500px] flex flex-col items-center justify-center text-center"
              >
                <div className="relative">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="w-32 h-32 border-4 border-accent/20 border-t-accent rounded-full"
                  />
                  <Brain className="w-12 h-12 text-accent absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-black uppercase tracking-tight">Deep Reasoning Engine</h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md">Analyzing HRV trends, training load, sleep metrics, and biomechanical symmetry for {athlete.name}...</p>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3].map(i => (
                    <motion.div 
                      key={i}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                      className="w-2 h-2 bg-accent rounded-full"
                    />
                  ))}
                </div>
              </motion.div>
            ) : assessment ? (
              <motion.div
                key="assessment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* AI Summary Card */}
                <div className="bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6 transition-colors duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-black text-primary dark:text-white text-xl uppercase tracking-tight transition-colors">Risk Assessment</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium transition-colors">InjuryIQ Analysis • {athlete.name}</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleShare}
                      className={cn(
                        "p-3 rounded-2xl transition-all",
                        isShared ? "bg-status-green text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-accent hover:text-primary"
                      )}
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">AI Summary</span>
                      <div className="px-2 py-0.5 bg-accent/10 rounded text-[8px] font-black text-accent uppercase">Gemini 3.1 Flash</div>
                    </div>
                    <p className="text-primary dark:text-white font-bold text-lg leading-snug transition-colors">
                      {assessment.summary}
                    </p>
                  </div>

                  {/* Mitigations List */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Actionable Mitigations</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {assessment.mitigations.map((m, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleMitigationClick(m.sessionId)}
                          className="group flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-accent hover:shadow-lg hover:shadow-accent/5 transition-all text-left"
                        >
                          <div className="space-y-1">
                            <span className="text-[10px] font-black text-accent uppercase tracking-widest">{m.area}</span>
                            <p className="text-sm font-bold text-primary dark:text-white group-hover:text-accent transition-colors">{m.action}</p>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Selected Part Detail (if any) */}
                <AnimatePresence>
                  {selectedPart && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="bg-primary dark:bg-slate-900 p-8 rounded-3xl text-white space-y-4 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          assessment.strains[selectedPart] === 'high' ? "bg-status-red" : 
                          assessment.strains[selectedPart] === 'medium' ? "bg-status-yellow" : "bg-status-green"
                        )}>
                          <Activity className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-black uppercase tracking-tight text-lg">{selectedPart.replace('_', ' ')} Analysis</h4>
                          <p className="text-white/50 text-xs font-bold uppercase tracking-widest">Local Strain: {assessment.strains[selectedPart]}</p>
                        </div>
                      </div>
                      <p className="text-white/70 text-sm leading-relaxed">
                        The AI has detected <span className="text-white font-bold uppercase">{assessment.strains[selectedPart]}</span> strain in this specific muscle group. This is likely due to {assessment.strains[selectedPart] === 'high' ? 'cumulative overload and poor recovery metrics' : 'normal training adaptation'}.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-100/50 dark:bg-slate-900/30 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 flex flex-col items-center text-center space-y-6 transition-colors min-h-[500px] justify-center"
              >
                <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm transition-colors">
                  <Search className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">Awaiting AI Scan</h3>
                  <p className="text-slate-400 dark:text-slate-500 text-sm max-w-[320px] mx-auto">Click "Run AI Smart Scan" to initialize the InjuryIQ engine and generate a predictive risk assessment for {athlete.name}.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
