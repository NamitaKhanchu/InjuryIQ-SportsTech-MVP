import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Circle, Flag, Target, ChevronRight } from 'lucide-react';
import { RecoveryRoadmap as RecoveryRoadmapType, RecoveryGoal } from '../types';
import { cn } from '../lib/utils';

interface RecoveryRoadmapProps {
  roadmap: RecoveryRoadmapType;
  onToggleGoal: (goalId: string) => void;
}

export function RecoveryRoadmap({ roadmap, onToggleGoal }: RecoveryRoadmapProps) {
  const goals = roadmap.goals;

  const completedCount = goals.filter(g => g.isCompleted).length;
  const totalCount = goals.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-primary dark:text-white uppercase tracking-tight transition-colors">
            Recovery Roadmap
          </h3>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            {roadmap.injuryType}
          </p>
        </div>
        <div className="text-right">
          <span className="text-3xl font-black text-accent">{progressPercentage}%</span>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Overall Progress</p>
        </div>
      </div>

      <div className="relative">
        {/* Progress Bar Background */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 rounded-full" />
        
        {/* Active Progress Bar */}
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          className="absolute top-1/2 left-0 h-1 bg-accent -translate-y-1/2 rounded-full z-10"
        />

        {/* Goals Track */}
        <div className="relative z-20 flex justify-between items-center px-2">
          {goals.map((goal, index) => {
            const isLocked = !goal.isCompleted && index > 0 && !goals[index - 1].isCompleted;
            
            return (
              <div key={goal.id} className="flex flex-col items-center gap-3">
                <motion.button
                  whileHover={!isLocked ? { scale: 1.1 } : {}}
                  whileTap={!isLocked ? { scale: 0.9 } : {}}
                  onClick={() => onToggleGoal(goal.id)}
                  disabled={isLocked}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 shadow-lg",
                    goal.isCompleted 
                      ? "bg-accent border-accent text-primary" 
                      : isLocked
                        ? "bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-200 dark:text-slate-700 cursor-not-allowed"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
                  )}
                >
                  {goal.type === 'BIG' ? (
                    <Flag className={cn("w-5 h-5", goal.isCompleted ? "fill-current" : "")} />
                  ) : goal.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </motion.button>
                
                <div className="absolute top-12 w-32 text-center">
                  <p className={cn(
                    "text-[10px] font-black uppercase tracking-tighter leading-tight",
                    goal.isCompleted ? "text-primary dark:text-white" : isLocked ? "text-slate-300 dark:text-slate-700" : "text-slate-400"
                  )}>
                    {goal.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Goal Details List */}
      <div className="pt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal, index) => {
          const isLocked = !goal.isCompleted && index > 0 && !goals[index - 1].isCompleted;
          
          return (
            <div 
              key={goal.id}
              onClick={() => !isLocked && onToggleGoal(goal.id)}
              className={cn(
                "p-4 rounded-2xl border transition-all cursor-pointer group",
                goal.isCompleted 
                  ? "bg-accent/5 border-accent/20" 
                  : isLocked
                    ? "bg-slate-50/50 dark:bg-slate-900/30 border-slate-100 dark:border-slate-800 opacity-50 cursor-not-allowed"
                    : "bg-white dark:bg-[#0F172A] border-slate-200 dark:border-slate-800 hover:border-accent/50"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "mt-1 p-1.5 rounded-lg transition-colors",
                  goal.isCompleted 
                    ? "bg-accent text-primary" 
                    : isLocked
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-accent/20 group-hover:text-accent"
                )}>
                  {goal.type === 'BIG' ? <Target className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className={cn(
                      "text-sm font-black uppercase tracking-tight",
                      goal.isCompleted ? "text-primary dark:text-white" : isLocked ? "text-slate-400 dark:text-slate-600" : "text-slate-600 dark:text-slate-300"
                    )}>
                      {goal.title}
                    </h4>
                    {goal.type === 'BIG' && (
                      <span className="text-[8px] font-black bg-primary text-white px-1.5 py-0.5 rounded uppercase tracking-widest">
                        Final Goal
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {goal.description}
                  </p>
                </div>
                {!isLocked && (
                  <ChevronRight className={cn(
                    "w-4 h-4 mt-1 transition-transform",
                    goal.isCompleted ? "text-accent" : "text-slate-300 group-hover:translate-x-1"
                  )} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
