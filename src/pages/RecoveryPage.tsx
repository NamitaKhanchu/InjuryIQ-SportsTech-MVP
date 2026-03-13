import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Clock, Target, Shield, CheckCircle2, Filter, Flame, Award, Search, UserPlus, Plus, X, ChevronDown, RefreshCcw } from 'lucide-react';
import { RecoveryRoadmap } from '../components/RecoveryRoadmap';
import { RecoveryRoadmap as RecoveryRoadmapType, RecoveryGoal, RecoverySession } from '../types';
import { RECOVERY_SESSIONS, MOCK_ROADMAPS, MOCK_ATHLETES } from '../constants';
import { cn } from '../lib/utils';

import { useSearchParams } from 'react-router-dom';

export function RecoveryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = (searchParams.get('view') as 'ROADMAP' | 'HUB') || 'ROADMAP';
  const highlightedSessionId = searchParams.get('highlight');
  
  const setActiveView = (view: 'ROADMAP' | 'HUB') => {
    setSearchParams({ view });
  };

  // Clear highlight after some time
  React.useEffect(() => {
    if (highlightedSessionId) {
      const timer = setTimeout(() => {
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('highlight');
        setSearchParams(newParams);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [highlightedSessionId, searchParams, setSearchParams]);

  const [activeFilter, setActiveFilter] = React.useState<'ALL' | 'RED' | 'YELLOW' | 'GREEN'>('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Initialize roadmaps from localStorage if available
  const [roadmaps, setRoadmaps] = React.useState<RecoveryRoadmapType[]>(() => {
    const saved = localStorage.getItem('recovery_roadmaps');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved roadmaps', e);
      }
    }
    return MOCK_ROADMAPS;
  });

  // Save roadmaps to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('recovery_roadmaps', JSON.stringify(roadmaps));
  }, [roadmaps]);

  const [selectedAthleteId, setSelectedAthleteId] = React.useState(MOCK_ATHLETES[0].id);
  
  // Filter roadmaps for the selected athlete
  const athleteRoadmaps = roadmaps.filter(r => r.athleteId === selectedAthleteId);
  const activeAthleteRoadmaps = athleteRoadmaps.filter(r => r.currentProgress < 100);
  const pastAthleteRoadmaps = athleteRoadmaps.filter(r => r.currentProgress === 100);
  
  const [activeRoadmapId, setActiveRoadmapId] = React.useState(activeAthleteRoadmaps[0]?.id || '');

  // Update activeRoadmapId when selectedAthleteId changes
  React.useEffect(() => {
    const currentRoadmap = roadmaps.find(r => r.id === activeRoadmapId);
    // Only reset if current roadmap doesn't belong to selected athlete or doesn't exist
    if (!currentRoadmap || currentRoadmap.athleteId !== selectedAthleteId) {
      // Prefer active roadmaps for the new athlete
      const firstActive = activeAthleteRoadmaps[0];
      if (firstActive) {
        setActiveRoadmapId(firstActive.id);
      } else {
        setActiveRoadmapId('');
      }
    }
  }, [selectedAthleteId, roadmaps]);

  const [assigningSessionId, setAssigningSessionId] = React.useState<string | null>(null);
  const [showPastRoadmaps, setShowPastRoadmaps] = React.useState(false);
  const [showCustomModal, setShowCustomModal] = React.useState(false);
  const [newSession, setNewSession] = React.useState<Partial<RecoverySession>>({
    name: '',
    duration: 10,
    targetArea: '',
    injuryReduced: '',
    type: 'GREEN'
  });

  const handleCreateCustomSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSession.name && newSession.targetArea) {
      const session: RecoverySession = {
        id: `custom-${Date.now()}`,
        name: newSession.name,
        duration: newSession.duration || 10,
        targetArea: newSession.targetArea,
        injuryReduced: newSession.injuryReduced || 'Injury risk',
        type: newSession.type as 'RED' | 'YELLOW' | 'GREEN'
      };
      setCustomSessions(prev => [...prev, session]);
      setShowCustomModal(false);
      setNewSession({
        name: '',
        duration: 10,
        targetArea: '',
        injuryReduced: '',
        type: 'GREEN'
      });
    }
  };

  const [customSessions, setCustomSessions] = React.useState<RecoverySession[]>(() => {
    const saved = localStorage.getItem('custom_recovery_sessions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse custom sessions', e);
      }
    }
    return [];
  });

  React.useEffect(() => {
    localStorage.setItem('custom_recovery_sessions', JSON.stringify(customSessions));
  }, [customSessions]);

  const allSessions = [...RECOVERY_SESSIONS, ...customSessions];

  const filteredSessions = allSessions.filter(s => {
    const matchesFilter = activeFilter === 'ALL' ? true : s.type === activeFilter;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.targetArea.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.injuryReduced.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeRoadmap = roadmaps.find(r => r.id === activeRoadmapId) || athleteRoadmaps[0];

  const handleToggleGoal = (roadmapId: string, goalId: string) => {
    setRoadmaps(prev => prev.map(r => {
      if (r.id !== roadmapId) return r;
      
      const goalIndex = r.goals.findIndex(g => g.id === goalId);
      if (goalIndex === -1) return r;
      
      const isCurrentlyCompleted = r.goals[goalIndex].isCompleted;
      
      if (!isCurrentlyCompleted) {
        // Trying to complete: check if previous are done
        const canComplete = goalIndex === 0 || r.goals[goalIndex - 1].isCompleted;
        if (!canComplete) return r;
        
        const updatedGoals = r.goals.map((g, idx) => 
          idx === goalIndex ? { ...g, isCompleted: true } : g
        );
        const completedCount = updatedGoals.filter(g => g.isCompleted).length;
        const progress = Math.round((completedCount / updatedGoals.length) * 100);

        return {
          ...r,
          currentProgress: progress,
          goals: updatedGoals
        };
      } else {
        // Trying to uncomplete: uncomplete this and all following
        const updatedGoals = r.goals.map((g, idx) => 
          idx >= goalIndex ? { ...g, isCompleted: false } : g
        );
        const completedCount = updatedGoals.filter(g => g.isCompleted).length;
        const progress = Math.round((completedCount / updatedGoals.length) * 100);

        return {
          ...r,
          currentProgress: progress,
          goals: updatedGoals
        };
      }
    }));
  };

  const handleDeleteRoadmap = (e: React.MouseEvent, roadmapId: string) => {
    e.stopPropagation();
    setRoadmaps(prev => prev.filter(r => r.id !== roadmapId));
  };

  const handleReactivateRoadmap = (e: React.MouseEvent, roadmapId: string) => {
    e.stopPropagation();
    setRoadmaps(prev => prev.map(r => {
      if (r.id !== roadmapId) return r;
      return {
        ...r,
        currentProgress: 0,
        goals: r.goals.map(g => ({ ...g, isCompleted: false }))
      };
    }));
    setActiveRoadmapId(roadmapId);
  };

  const [showSuccessToast, setShowSuccessToast] = React.useState(false);

  const handleAssignToPlayer = (athleteId: string) => {
    const athlete = MOCK_ATHLETES.find(a => a.id === athleteId);
    const session = RECOVERY_SESSIONS.find(s => s.id === assigningSessionId);
    
    if (athlete && session) {
      const newRoadmapId = `r-${Date.now()}`;
      const newRoadmap: RecoveryRoadmapType = {
        id: newRoadmapId,
        athleteId: athlete.id,
        injuryType: session.name,
        startDate: new Date().toISOString().split('T')[0],
        targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks later
        currentProgress: 0,
        goals: [
          {
            id: `g-${Date.now()}-1`,
            title: 'Introduction',
            description: `Understand the basics of ${session.name}.`,
            isCompleted: false,
            type: 'SMALL'
          },
          {
            id: `g-${Date.now()}-2`,
            title: 'First Session',
            description: `Complete your first 100% supervised ${session.name}.`,
            isCompleted: false,
            type: 'SMALL'
          },
          {
            id: `g-${Date.now()}-3`,
            title: 'Mastery',
            description: `Demonstrate proficiency in all ${session.targetArea} movements.`,
            isCompleted: false,
            type: 'BIG'
          }
        ]
      };

      setRoadmaps(prev => [...prev, newRoadmap]);
      
      // Select the athlete and the new roadmap
      setSelectedAthleteId(athlete.id);
      setActiveRoadmapId(newRoadmapId);
      
      // Switch view to ROADMAP
      setActiveView('ROADMAP');
      
      setAssigningSessionId(null);
      
      // Show success toast
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }
  };

  return (
    <div className="space-y-8 pb-20 lg:pb-8">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary dark:text-white transition-colors">Recovery Lab</h1>
          <p className="text-slate-500 dark:text-slate-400 transition-colors">Clinically validated injury prevention protocols</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-[#0F172A] px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
          <Flame className="w-5 h-5 text-status-red" />
          <span className="font-black text-primary dark:text-white uppercase tracking-tight transition-colors">7-Day Prevention Streak</span>
          <span className="text-2xl font-black text-primary dark:text-accent transition-colors">🔥 7</span>
        </div>
      </header>

      {/* Sub-Navigation Tabs */}
      <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl w-fit transition-colors">
        <button
          onClick={() => setActiveView('ROADMAP')}
          className={cn(
            "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            activeView === 'ROADMAP'
              ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-md"
              : "text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white"
          )}
        >
          Progress Roadmap
        </button>
        <button
          onClick={() => setActiveView('HUB')}
          className={cn(
            "px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
            activeView === 'HUB'
              ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-md"
              : "text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white"
          )}
        >
          Discovery Hub
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeView === 'ROADMAP' ? (
          <motion.div
            key="roadmap-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-8"
          >
            {/* Recovery Roadmap Section */}
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-primary dark:text-white uppercase tracking-tight">Player Progress</h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select an individual player to view their roadmaps</p>
                </div>
                
                <div className="relative">
                  <select
                    value={selectedAthleteId}
                    onChange={(e) => setSelectedAthleteId(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold text-primary dark:text-white focus:ring-2 focus:ring-accent outline-none transition-all cursor-pointer"
                  >
                    {MOCK_ATHLETES.map(athlete => (
                      <option key={athlete.id} value={athlete.id}>{athlete.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {activeAthleteRoadmaps.length > 0 || (activeRoadmapId && pastAthleteRoadmaps.some(r => r.id === activeRoadmapId)) ? (
                <>
                  <div className="space-y-4">
                    {activeAthleteRoadmaps.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Roadmaps</span>
                        <div className="flex flex-wrap gap-2">
                          {activeAthleteRoadmaps.map((roadmap) => (
                            <div key={roadmap.id} className="relative group">
                              <button
                                onClick={() => setActiveRoadmapId(roadmap.id)}
                                className={cn(
                                  "px-4 py-2 pr-8 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                  activeRoadmapId === roadmap.id
                                    ? "bg-accent border-accent text-primary shadow-lg shadow-accent/20"
                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-accent/50"
                                )}
                              >
                                {roadmap.injuryType}
                              </button>
                              <button
                                onClick={(e) => handleDeleteRoadmap(e, roadmap.id)}
                                className={cn(
                                  "absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition-all",
                                  activeRoadmapId === roadmap.id
                                    ? "text-primary hover:bg-black/10 opacity-100"
                                    : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100"
                                )}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {activeRoadmap && (
                    <motion.div
                      key={activeRoadmapId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                    >
                      <RecoveryRoadmap 
                        roadmap={activeRoadmap} 
                        onToggleGoal={(goalId) => handleToggleGoal(activeRoadmapId, goalId)}
                      />
                    </motion.div>
                  )}
                </>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-12 border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <Shield className="w-8 h-8 text-slate-300" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-black text-primary dark:text-white uppercase tracking-tight">No Active Roadmaps</h3>
                    <p className="text-sm text-slate-500 max-w-xs">This player doesn't have any recovery or prevention roadmaps currently in progress.</p>
                  </div>
                  <button 
                    onClick={() => setActiveView('HUB')}
                    className="px-6 py-3 bg-accent text-primary font-black rounded-xl text-xs uppercase tracking-widest hover:scale-105 transition-all"
                  >
                    Assign from Discovery Hub
                  </button>
                </div>
              )}

              {/* Past Roadmaps Collapsible */}
              {pastAthleteRoadmaps.length > 0 && (
                <div className="mt-12 pt-12 border-t border-slate-200 dark:border-slate-800">
                  <button
                    onClick={() => setShowPastRoadmaps(!showPastRoadmaps)}
                    className="flex items-center gap-3 group"
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-all",
                      showPastRoadmaps ? "bg-primary text-white" : "text-slate-400 group-hover:text-primary"
                    )}>
                      <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", showPastRoadmaps && "rotate-180")} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-black text-primary dark:text-white uppercase tracking-tight">Past Roadmaps Archive</h3>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{pastAthleteRoadmaps.length} Completed Protocols</p>
                    </div>
                  </button>

                  <AnimatePresence>
                    {showPastRoadmaps && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-6 flex flex-wrap gap-3">
                          {pastAthleteRoadmaps.map((roadmap) => (
                            <div key={roadmap.id} className="relative group">
                              <button
                                onClick={() => setActiveRoadmapId(roadmap.id)}
                                className={cn(
                                  "px-4 py-2 pr-14 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                                  activeRoadmapId === roadmap.id
                                    ? "bg-slate-800 border-slate-700 text-white shadow-lg"
                                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:border-slate-400"
                                )}
                              >
                                {roadmap.injuryType}
                              </button>
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <button
                                  onClick={(e) => handleReactivateRoadmap(e, roadmap.id)}
                                  title="Reactivate Protocol"
                                  className={cn(
                                    "p-1 rounded-md transition-all",
                                    activeRoadmapId === roadmap.id
                                      ? "text-white hover:bg-white/10 opacity-100"
                                      : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100"
                                  )}
                                >
                                  <RefreshCcw className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteRoadmap(e, roadmap.id)}
                                  title="Delete Protocol"
                                  className={cn(
                                    "p-1 rounded-md transition-all",
                                    activeRoadmapId === roadmap.id
                                      ? "text-white hover:bg-white/10 opacity-100"
                                      : "text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-0 group-hover:opacity-100"
                                  )}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="hub-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-12"
          >
            {/* NMT Session Library */}
            <section className="space-y-8">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-primary dark:text-white uppercase tracking-tight transition-colors">Prevention Library</h3>
                  <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Discover and assign protocols to individual player roadmaps</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Search Bar */}
                  <div className="relative min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search protocols, injuries, areas..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-accent focus:border-transparent transition-all outline-none"
                    />
                  </div>

                  {/* Filter Tabs */}
                  <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl transition-colors">
                    {(['ALL', 'RED', 'YELLOW', 'GREEN'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setActiveFilter(f)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                          activeFilter === f 
                            ? f === 'ALL' 
                              ? "bg-white dark:bg-slate-800 text-primary dark:text-white shadow-sm"
                              : f === 'RED'
                                ? "bg-status-red text-white shadow-lg shadow-status-red/20"
                                : f === 'YELLOW'
                                  ? "bg-status-yellow text-white shadow-lg shadow-status-yellow/20"
                                  : "bg-status-green text-white shadow-lg shadow-status-green/20"
                            : "text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-white"
                        )}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {filteredSessions.map((session) => (
                  <motion.div 
                    key={session.id}
                    whileHover={{ y: -8 }}
                    className={cn(
                      "group bg-white dark:bg-[#0F172A] rounded-3xl overflow-hidden shadow-sm border transition-all duration-500 flex flex-col",
                      highlightedSessionId === session.id 
                        ? "border-accent shadow-[0_0_30px_rgba(0,255,157,0.2)] scale-[1.02] ring-2 ring-accent/20" 
                        : "border-slate-200 dark:border-slate-800"
                    )}
                  >
                    <div className="relative h-48 bg-slate-100 dark:bg-slate-900 overflow-hidden transition-colors">
                      <img 
                        src={`https://picsum.photos/seed/${session.id}/800/600`} 
                        alt={session.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-4 right-4">
                        {customSessions.some(cs => cs.id === session.id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCustomSessions(prev => prev.filter(cs => cs.id !== session.id));
                            }}
                            className="p-2 bg-black/40 backdrop-blur-md text-white rounded-full hover:bg-red-500 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-white">
                          <Clock className="w-4 h-4" />
                          <span className="text-xs font-bold">{session.duration} min</span>
                        </div>
                        <div className={cn(
                          "px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest",
                          session.type === 'RED' ? "bg-status-red text-white" : 
                          session.type === 'YELLOW' ? "bg-status-yellow text-white" : "bg-status-green text-white"
                        )}>
                          {session.type}
                        </div>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className={cn(
                            "text-[8px] font-black uppercase tracking-[0.2em]",
                            session.type === 'RED' ? "text-status-red" : 
                            session.type === 'YELLOW' ? "text-status-yellow" : "text-status-green"
                          )}>
                            {session.type} Protocol
                          </p>
                          <span className="text-[10px] font-bold text-slate-400">{session.duration} min</span>
                        </div>
                        <h4 className="font-black text-primary dark:text-white leading-tight group-hover:text-accent transition-colors">{session.name}</h4>
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">{session.targetArea}</p>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800 transition-colors">
                        <Shield className="w-4 h-4 text-accent" />
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 leading-tight transition-colors">
                          Reduces {session.injuryReduced}
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => setAssigningSessionId(session.id)}
                        className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-accent hover:text-primary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add to Player Roadmap
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Custom Protocol Creator */}
              <div className="mt-12 p-8 bg-slate-100 dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-primary dark:text-white uppercase tracking-tight">Create Custom Protocol</h4>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Add your own specialized recovery modules to the library</p>
                  </div>
                  <button 
                    onClick={() => setShowCustomModal(true)}
                    className="px-6 py-3 bg-primary dark:bg-white text-white dark:text-primary font-black rounded-xl text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New Custom Module
                  </button>
                </div>
              </div>
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Player Assignment Modal */}
      <AnimatePresence>
        {assigningSessionId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAssigningSessionId(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-primary dark:text-white uppercase tracking-tight">Assign Protocol</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Select an individual player</p>
                  </div>
                  <button 
                    onClick={() => setAssigningSessionId(null)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-3">
                  {MOCK_ATHLETES.map((athlete) => (
                    <button
                      key={athlete.id}
                      onClick={() => handleAssignToPlayer(athlete.id)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-accent group rounded-2xl border border-slate-100 dark:border-slate-800 transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-black text-primary dark:text-white group-hover:bg-white/20">
                          {athlete.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <p className="font-black text-primary dark:text-white group-hover:text-primary">{athlete.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-primary/60">{athlete.position}</p>
                        </div>
                      </div>
                      <Plus className="w-5 h-5 text-slate-300 group-hover:text-primary" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Success Toast */}
      <AnimatePresence>
        {showSuccessToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[110] bg-status-green text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-black uppercase tracking-widest text-xs">Protocol Assigned Successfully</span>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Custom Protocol Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCustomModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
            >
              <form onSubmit={handleCreateCustomSession} className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-primary dark:text-white uppercase tracking-tight">New Protocol</h3>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Define your custom recovery module</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g., Advanced Hip Mobility"
                      value={newSession.name}
                      onChange={(e) => setNewSession(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-accent outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration (min)</label>
                      <input
                        required
                        type="number"
                        min="1"
                        value={newSession.duration}
                        onChange={(e) => setNewSession(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-accent outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Level</label>
                      <select
                        value={newSession.type}
                        onChange={(e) => setNewSession(prev => ({ ...prev, type: e.target.value as any }))}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-accent outline-none"
                      >
                        <option value="GREEN">GREEN (Safe)</option>
                        <option value="YELLOW">YELLOW (Caution)</option>
                        <option value="RED">RED (Restricted)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Area</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g., Lower Back & Hips"
                      value={newSession.targetArea}
                      onChange={(e) => setNewSession(prev => ({ ...prev, targetArea: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-accent outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Injury Reduction Goal</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g., Lower back strain risk"
                      value={newSession.injuryReduced}
                      onChange={(e) => setNewSession(prev => ({ ...prev, injuryReduced: e.target.value }))}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold focus:ring-2 focus:ring-accent outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-accent text-primary font-black rounded-2xl text-xs uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-accent/20"
                >
                  Save to Library
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
