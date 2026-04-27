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
  Dna,
  Video,
  Upload,
  Play,
  Eye
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import { analyzeAthleteStrain } from '../services/aiService';
import { analyzeCvVideo, type CvAnalysisResult } from '../services/cvAnalysisService';
import { MOCK_ATHLETES } from '../constants';
import { AnatomicalModel } from '../components/AnatomicalModel';
import { StrainMap, AiAssessment } from '../types';

export function AnalysisPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [view, setView] = React.useState<'FRONT' | 'BACK'>('FRONT');
  const [selectedPart, setSelectedPart] = React.useState<string | null>(null);
  const [cycleAware, setCycleAware] = React.useState(false);
  const [isScanning, setIsScanning] = React.useState(false);
  const [assessment, setAssessment] = React.useState<AiAssessment | null>(null);
  const [selectedAthleteId, setSelectedAthleteId] = React.useState(MOCK_ATHLETES[0].id);
  const [isShared, setIsShared] = React.useState(false);
  const [analysisMode, setAnalysisMode] = React.useState<'SMART' | 'CV'>('SMART');
  const [isCvAnalyzing, setIsCvAnalyzing] = React.useState(false);
  const [cvFile, setCvFile] = React.useState<File | null>(null);
  const [cvVideo, setCvVideo] = React.useState<string | null>(null);
  const [cvResults, setCvResults] = React.useState<CvAnalysisResult | null>(null);
  const [cvHistory, setCvHistory] = React.useState<any[]>([]);
  const [showHistory, setShowHistory] = React.useState(false);
  const cvVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const cvCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const cvStageRef = React.useRef<HTMLDivElement | null>(null);
  const [cvNow, setCvNow] = React.useState(0);

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

  // Handle dashboard shortcuts
  React.useEffect(() => {
    const athleteId = searchParams.get('athleteId');
    const autoScan = searchParams.get('autoScan');

    if (athleteId) {
      setSelectedAthleteId(athleteId);
      
      if (autoScan === 'true') {
        // Delay slightly to allow component to settle
        const timer = setTimeout(() => {
          handleSmartScan();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [searchParams]);

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

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCvFile(file);
      setCvVideo(url);
      setCvResults(null);
    }
  };

  const handleCvAnalyze = async () => {
    if (!cvFile) return;
    setIsCvAnalyzing(true);
    try {
      const result = await analyzeCvVideo(cvFile);
      setCvResults(result);

      if (result.annotatedVideoUrl) {
        setCvVideo(result.annotatedVideoUrl);
      }
      
      // Add to mock history
      setCvHistory(prev => [{
        id: Math.random().toString(),
        date: new Date().toISOString().split('T')[0],
        summary: (result.summary || 'CV analysis complete').slice(0, 72),
        strain: result.detectedMuscles?.some(m => m.strain === 'high') ? 'high' : 'low'
      }, ...prev]);
    } catch (e) {
      console.error('CV analysis failed', e);
      // Keep UI usable even if backend isn't running yet.
      setCvResults({
        detectedMuscles: [
          { name: 'Right Quad', strain: 'high', confidence: 0.94 },
          { name: 'Left Hamstring', strain: 'medium', confidence: 0.88 },
          { name: 'Lower Back', strain: 'low', confidence: 0.91 },
        ],
        summary:
          'CV backend unavailable. Showing demo results. Start your teammate’s backend on localhost:4000 (or set CV_BACKEND_URL) to enable real analysis.',
        overlayPoints: [
          { x: 0.33, y: 0.25, severity: 'high' },
          { x: 0.5, y: 0.5, severity: 'medium' },
        ],
      });
    } finally {
      setIsCvAnalyzing(false);
    }
  };

  const telemetryNow = React.useMemo(() => {
    const tel = cvResults?.telemetry;
    if (!tel?.length) return null;
    // Find closest telemetry point to current time.
    let best = tel[0];
    let bestD = Math.abs(best.t - cvNow);
    for (let i = 1; i < tel.length; i++) {
      const d = Math.abs(tel[i].t - cvNow);
      if (d < bestD) {
        best = tel[i];
        bestD = d;
      }
    }
    return best;
  }, [cvResults?.telemetry, cvNow]);

  const riskColor = (risk?: 'low' | 'medium' | 'high' | null) => {
    if (risk === 'high') return 'rgba(255, 59, 48, 0.95)';
    if (risk === 'medium') return 'rgba(255, 149, 0, 0.95)';
    return 'rgba(52, 199, 89, 0.9)';
  };

  const POSE_CONNECTIONS: Array<[number, number]> = [
    // torso
    [11, 12], [11, 23], [12, 24], [23, 24],
    // left arm
    [11, 13], [13, 15],
    // right arm
    [12, 14], [14, 16],
    // left leg
    [23, 25], [25, 27], [27, 29], [29, 31],
    // right leg
    [24, 26], [26, 28], [28, 30], [30, 32],
    // shoulders to head-ish
    [11, 0], [12, 0],
  ];

  React.useEffect(() => {
    const video = cvVideoRef.current;
    const canvas = cvCanvasRef.current;
    const stage = cvStageRef.current;
    if (!video || !canvas || !stage) return;
    if (!cvResults?.telemetry?.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;

    const resize = () => {
      const rect = stage.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ro = new ResizeObserver(() => resize());
    ro.observe(stage);
    resize();

    const draw = () => {
      const rect = stage.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      // Map normalized pose coords (0..1) to the actual displayed video rect when using object-contain.
      // Without this, points drift into the letterboxed area and the skeleton appears offset.
      const vw = video.videoWidth || 0;
      const vh = video.videoHeight || 0;
      if (vw <= 0 || vh <= 0) {
        raf = window.requestAnimationFrame(draw);
        return;
      }
      const scale = Math.min(w / vw, h / vh);
      const drawW = vw * scale;
      const drawH = vh * scale;
      const offX = (w - drawW) / 2;
      const offY = (h - drawH) / 2;
      const px = (nx: number) => offX + nx * drawW;
      const py = (ny: number) => offY + ny * drawH;

      // Find nearest telemetry point to currentTime.
      const t = video.currentTime || cvNow;
      const tel = cvResults.telemetry!;
      let best = tel[0];
      let bestD = Math.abs(best.t - t);
      for (let i = 1; i < tel.length; i++) {
        const d = Math.abs(tel[i].t - t);
        if (d < bestD) {
          best = tel[i];
          bestD = d;
        }
      }

      const points = best.pose?.points;
      if (points?.length) {
        const leftRisk = best.leftRisk ?? null;
        const rightRisk = best.rightRisk ?? null;

        const leftCol = riskColor(leftRisk);
        const rightCol = riskColor(rightRisk);
        const baseCol = 'rgba(0, 212, 170, 0.55)'; // accent-ish teal

        const getCol = (idxA: number, idxB: number) => {
          // Color lower limbs based on side risk; others use base.
          const leftSet = new Set([23, 25, 27, 29, 31, 24]); // include hips
          const rightSet = new Set([24, 26, 28, 30, 32, 23]);
          const isLeft = leftSet.has(idxA) && leftSet.has(idxB);
          const isRight = rightSet.has(idxA) && rightSet.has(idxB);
          if (isLeft) return leftCol;
          if (isRight) return rightCol;
          return baseCol;
        };

        // Draw connections (skeleton lines)
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        for (const [a, b] of POSE_CONNECTIONS) {
          const pa = points[a];
          const pb = points[b];
          if (!pa || !pb) continue;
          if ((pa.v ?? 1) < 0.35 || (pb.v ?? 1) < 0.35) continue;
          ctx.strokeStyle = getCol(a, b);
          ctx.beginPath();
          ctx.moveTo(px(pa.x), py(pa.y));
          ctx.lineTo(px(pb.x), py(pb.y));
          ctx.stroke();
        }

        // Draw keypoints (knee markers stronger, like your screenshot)
        const kneeRadius = 10;
        const dotRadius = 4;
        const kneeL = points[25];
        const kneeR = points[26];

        const drawDot = (p: {x:number;y:number;v?:number}, r: number, fill: string) => {
          if ((p.v ?? 1) < 0.35) return;
          ctx.fillStyle = fill;
          ctx.beginPath();
          ctx.arc(px(p.x), py(p.y), r, 0, Math.PI * 2);
          ctx.fill();
        };

        for (let i = 0; i < points.length; i++) {
          const p = points[i];
          if (!p) continue;
          // Skip knees; drawn below.
          if (i === 25 || i === 26) continue;
          drawDot(p, dotRadius, 'rgba(0, 255, 157, 0.75)');
        }
        if (kneeL) drawDot(kneeL, kneeRadius, riskColor(leftRisk));
        if (kneeR) drawDot(kneeR, kneeRadius, riskColor(rightRisk));
      }

      raf = window.requestAnimationFrame(draw);
    };

    raf = window.requestAnimationFrame(draw);
    return () => {
      ro.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [cvResults, cvNow]);

  const activeEvent = React.useMemo(() => {
    const evts = cvResults?.events;
    if (!evts?.length) return null;
    let best = evts[0];
    let bestD = Math.abs(best.t - cvNow);
    for (let i = 1; i < evts.length; i++) {
      const d = Math.abs(evts[i].t - cvNow);
      if (d < bestD) {
        best = evts[i];
        bestD = d;
      }
    }
    return bestD <= 0.35 ? best : null;
  }, [cvResults?.events, cvNow]);

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

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setAnalysisMode('SMART')}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
              analysisMode === 'SMART' 
                ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm" 
                : "text-slate-500 hover:text-primary dark:hover:text-white"
            )}
          >
            <Brain className="w-4 h-4" />
            Smart Scan
          </button>
          <button
            onClick={() => setAnalysisMode('CV')}
            className={cn(
              "px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
              analysisMode === 'CV' 
                ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm" 
                : "text-slate-500 hover:text-primary dark:hover:text-white"
            )}
          >
            <Eye className="w-4 h-4" />
            CV Analysis
          </button>
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
        <AnimatePresence>
          {analysisMode === 'SMART' && (
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50, width: 0, margin: 0, padding: 0 }}
              transition={{ duration: 0.5, ease: "circOut" }}
              className="lg:col-span-5 bg-white dark:bg-[#0F172A] p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center space-y-8 min-h-[650px] relative overflow-hidden lab-grid"
            >
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
                
                {!assessment && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-[2px] rounded-2xl">
                    <button 
                      onClick={handleSmartScan}
                      disabled={isScanning}
                      className="text-center space-y-4 p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-[220px] hover:scale-105 active:scale-95 transition-all group disabled:scale-100"
                    >
                      {isScanning ? (
                        <div className="space-y-4">
                          <Loader2 className="w-12 h-12 text-accent mx-auto animate-spin" />
                          <p className="text-[10px] font-black text-accent uppercase tracking-widest">Scanning...</p>
                        </div>
                      ) : (
                        <>
                          <Brain className="w-12 h-12 text-accent mx-auto group-hover:animate-bounce" />
                          <p className="text-xs font-black text-primary dark:text-white uppercase tracking-widest">Run AI Smart Scan</p>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
              
              <div className="mt-auto w-full">
                <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex gap-3 items-start">
                  <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    <span className="font-bold text-slate-700 dark:text-slate-200 uppercase">Smart Scan Logic:</span> Aggregates historical athlete data, past CV biomechanical breakdowns, and wearable metrics (HRV, Load) to generate a holistic predictive risk profile.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analysis & Mitigations Panel */}
        <motion.div 
          layout
          className={cn(
            "space-y-8 transition-all duration-500",
            analysisMode === 'SMART' ? "lg:col-span-7" : "lg:col-span-12"
          )}
        >
          <AnimatePresence mode="wait">
            {analysisMode === 'SMART' ? (
              <motion.div
                key="smart-scan-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
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
                          <div className="px-2 py-0.5 bg-accent/10 rounded text-[8px] font-black text-accent uppercase">Gemini 2.0 Flash</div>
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
              </motion.div>
            ) : (
              <motion.div
                key="cv-analysis-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="bg-white/80 dark:bg-[#0F172A]/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 dark:border-slate-800 min-h-[600px] flex flex-col">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center">
                        <Video className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-black text-primary dark:text-white text-xl uppercase tracking-tight">CV Biomechanical Lab</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Video-based movement tracking & strain detection</p>
                      </div>
                    </div>

                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                      <button 
                        onClick={() => setShowHistory(false)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                          !showHistory ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm" : "text-slate-500"
                        )}
                      >
                        New Analysis
                      </button>
                      <button 
                        onClick={() => setShowHistory(true)}
                        className={cn(
                          "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                          showHistory ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm" : "text-slate-500"
                        )}
                      >
                        History
                      </button>
                    </div>
                  </div>

                  {showHistory ? (
                    <div className="flex-1 space-y-4">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Past CV Breakdowns</h4>
                      {cvHistory.length > 0 ? (
                        <div className="space-y-3">
                          {cvHistory.map(item => (
                            <div key={item.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:border-accent transition-all cursor-pointer">
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "w-10 h-10 rounded-xl flex items-center justify-center",
                                  item.strain === 'high' ? "bg-status-red/10 text-status-red" : "bg-status-green/10 text-status-green"
                                )}>
                                  <Play className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-primary dark:text-white">{item.summary}</p>
                                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{item.date} • {item.strain} Strain Detected</p>
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-accent transition-all" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 space-y-4">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center">
                            <Video className="w-8 h-8 text-slate-300" />
                          </div>
                          <div className="text-center space-y-1">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">No History Found</p>
                            <p className="text-[10px] text-slate-400 max-w-[200px]">Upload and analyze a video to start building this athlete's biomechanical record.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : !cvVideo ? (
                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-12 space-y-6">
                      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center">
                        <Upload className="w-10 h-10 text-slate-300" />
                      </div>
                      <div className="text-center space-y-2">
                        <h4 className="font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tight">Upload Athlete Footage</h4>
                        <p className="text-slate-400 text-xs max-w-xs">Upload a video of {athlete.name} performing a squat, sprint, or jump for biomechanical breakdown.</p>
                      </div>
                      <label className="px-8 py-3 bg-primary text-white font-black rounded-xl text-xs uppercase tracking-widest cursor-pointer hover:scale-105 transition-all">
                        Select Video File
                        <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                      </label>
                    </div>
                  ) : (
                    <div className="flex-1 space-y-6">
                      <div ref={cvStageRef} className="relative aspect-video bg-black rounded-2xl overflow-hidden group">
                        <video
                          ref={cvVideoRef}
                          src={cvVideo}
                          className="w-full h-full object-contain"
                          controls
                          onTimeUpdate={(e) => {
                            const t = (e.currentTarget as HTMLVideoElement).currentTime;
                            setCvNow(t);
                          }}
                        />
                        <canvas
                          ref={cvCanvasRef}
                          className="absolute inset-0 pointer-events-none"
                        />
                        
                        {isCvAnalyzing && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center space-y-4">
                            <motion.div 
                              animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5]
                              }}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className="w-24 h-24 border-2 border-accent rounded-full flex items-center justify-center"
                            >
                              <div className="w-16 h-16 border border-accent/30 rounded-full animate-ping" />
                            </motion.div>
                            <div className="text-center">
                              <p className="text-accent font-black uppercase tracking-[0.2em] text-xs">CV Engine Processing</p>
                              <p className="text-white/60 text-[10px] uppercase tracking-widest mt-1">Tracking 32 Biomechanical Markers</p>
                            </div>
                            
                            {/* Scanning line for video */}
                            <motion.div 
                              initial={{ top: '0%' }}
                              animate={{ top: '100%' }}
                              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                              className="absolute left-0 right-0 h-0.5 bg-accent/80 shadow-[0_0_15px_rgba(0,255,157,1)]"
                            />
                          </div>
                        )}

                        {cvResults && (
                          <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-3 left-3 max-w-[min(520px,92%)] space-y-2">
                              <div className="bg-black/70 backdrop-blur-md p-3 rounded-xl border border-white/10">
                                <p className="text-[10px] font-black text-accent uppercase tracking-widest mb-2">Pose Telemetry</p>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between gap-6">
                                    <span className="text-sm text-white/60 font-bold">Frame</span>
                                    <span className="text-sm text-white font-black tabular-nums">{telemetryNow?.frame ?? '—'}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-6">
                                    <span className="text-sm text-white/60 font-bold">Left Knee Angle</span>
                                    <span className="text-sm text-white font-black tabular-nums">{telemetryNow?.leftKneeAngle ?? '—'}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-6">
                                    <span className="text-sm text-white/60 font-bold">Right Knee Angle</span>
                                    <span className="text-sm text-white font-black tabular-nums">{telemetryNow?.rightKneeAngle ?? '—'}</span>
                                  </div>
                                </div>
                              </div>

                              {activeEvent && (
                                <div
                                  className={cn(
                                    "bg-black/75 backdrop-blur-md p-4 rounded-2xl border-2 shadow-2xl",
                                    activeEvent.risk === 'high'
                                      ? "border-status-red"
                                      : activeEvent.risk === 'medium'
                                        ? "border-status-yellow"
                                        : "border-status-green"
                                  )}
                                >
                                  <div className="space-y-1">
                                    <div className="flex items-start justify-between gap-3">
                                      <p className="text-sm font-black uppercase tracking-tight text-white">
                                        {activeEvent.side === 'R'
                                          ? 'Right Knee'
                                          : activeEvent.side === 'L'
                                            ? 'Left Knee'
                                            : 'Knee'}
                                      </p>
                                      <span
                                        className={cn(
                                          "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                          activeEvent.risk === 'high'
                                            ? "text-status-red border-status-red/40 bg-status-red/10"
                                            : activeEvent.risk === 'medium'
                                              ? "text-status-yellow border-status-yellow/40 bg-status-yellow/10"
                                              : "text-status-green border-status-green/40 bg-status-green/10"
                                        )}
                                      >
                                        {activeEvent.risk.toUpperCase()}
                                      </span>
                                    </div>

                                    <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest tabular-nums">
                                      IC: {activeEvent.ic.toFixed(2)}s • Now: {cvNow.toFixed(2)}s
                                    </p>

                                    <p className="text-white text-sm font-bold">Cue: {activeEvent.cue}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {!isCvAnalyzing && !cvResults && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <button 
                              onClick={handleCvAnalyze}
                              className="w-16 h-16 bg-accent text-primary rounded-full flex items-center justify-center hover:scale-110 transition-all shadow-xl"
                            >
                              <Play className="w-8 h-8 fill-current ml-1" />
                            </button>
                          </div>
                        )}
                      </div>

                      {cvResults ? (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-4"
                        >
                          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">CV Analysis Summary</h4>
                            <p className="text-sm font-bold text-primary dark:text-white leading-relaxed">{cvResults.summary}</p>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            {cvResults.detectedMuscles.map((m: any, i: number) => (
                              <div key={i} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{m.name}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className={cn(
                                    "text-[10px] font-black uppercase",
                                    m.strain === 'high' ? "text-status-red" : m.strain === 'medium' ? "text-status-yellow" : "text-status-green"
                                  )}>{m.strain} Strain</span>
                                  <span className="text-[8px] text-slate-400">{(m.confidence * 100).toFixed(0)}% Conf.</span>
                                </div>
                              </div>
                            ))}
                          </div>

                          <button 
                            onClick={() => { setCvVideo(null); setCvFile(null); }}
                            className="w-full py-3 border border-slate-200 dark:border-slate-800 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                          >
                            Reset Analysis
                          </button>
                        </motion.div>
                      ) : (
                        <div className="flex gap-4">
                          <button 
                            onClick={handleCvAnalyze}
                            disabled={isCvAnalyzing}
                            className="flex-1 py-4 bg-accent text-primary font-black rounded-2xl shadow-lg hover:scale-[1.02] active:scale-95 transition-all uppercase tracking-widest text-xs"
                          >
                            {isCvAnalyzing ? 'Processing Biometrics...' : 'Run CV Breakdown'}
                          </button>
                          <button 
                            onClick={() => { setCvVideo(null); setCvFile(null); }}
                            className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black rounded-2xl hover:bg-slate-200 transition-all"
                          >
                            <Upload className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
