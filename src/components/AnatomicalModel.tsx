import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { StrainMap } from '../types';

interface AnatomicalModelProps {
  view: 'FRONT' | 'BACK';
  strainData: StrainMap;
  className?: string;
  onPartClick?: (partId: string) => void;
  selectedPart?: string;
}

export function AnatomicalModel({ view, strainData, className, onPartClick, selectedPart }: AnatomicalModelProps) {
  const getColor = (partId: string) => {
    const level = strainData[partId];
    const isSelected = selectedPart === partId;
    
    if (level === 'high') return isSelected ? 'fill-status-red stroke-status-red stroke-2' : 'fill-status-red/40 stroke-status-red/60';
    if (level === 'medium') return isSelected ? 'fill-status-yellow stroke-status-yellow stroke-2' : 'fill-status-yellow/40 stroke-status-yellow/60';
    if (level === 'low') return isSelected ? 'fill-status-green stroke-status-green stroke-2' : 'fill-status-green/20 stroke-status-green/40';
    
    return isSelected 
      ? 'fill-slate-300 dark:fill-slate-600 stroke-slate-400 dark:stroke-slate-500 stroke-2' 
      : 'fill-slate-100 dark:fill-slate-800 stroke-slate-200 dark:stroke-slate-700';
  };

  // Simplified but descriptive paths for a professional look
  const parts = view === 'FRONT' ? [
    { id: 'head', d: "M100,20 c-10,0 -18,8 -18,18 s8,18 18,18 s18,-8 18,-18 s-8,-18 -18,-18", label: 'Head' },
    { id: 'neck', d: "M90,56 h20 v10 h-20 z", label: 'Neck' },
    { id: 'chest', d: "M75,70 h50 l10,40 h-70 z", label: 'Chest' },
    { id: 'abs', d: "M80,115 h40 l5,50 h-50 z", label: 'Abs' },
    { id: 'shoulder_l', d: "M60,75 a15,15 0 1,0 15,0 z", label: 'Left Shoulder' },
    { id: 'shoulder_r', d: "M125,75 a15,15 0 1,0 15,0 z", label: 'Right Shoulder' },
    { id: 'arm_l', d: "M45,95 h15 v80 h-15 z", label: 'Left Arm' },
    { id: 'arm_r', d: "M140,95 h15 v80 h-15 z", label: 'Right Arm' },
    { id: 'quad_l', d: "M75,180 l-10,100 h25 l10,-100 z", label: 'Left Quad' },
    { id: 'quad_r', d: "M110,180 l10,100 h25 l-10,-100 z", label: 'Right Quad' },
    { id: 'knee_l', d: "M68,285 a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0", label: 'Left Knee' },
    { id: 'knee_r', d: "M116,285 a8,8 0 1,0 16,0 a8,8 0 1,0 -16,0", label: 'Right Knee' },
    { id: 'calf_l', d: "M65,305 l5,80 h15 l5,-80 z", label: 'Left Calf' },
    { id: 'calf_r', d: "M110,305 l5,80 h15 l5,-80 z", label: 'Right Calf' },
  ] : [
    { id: 'head', d: "M100,20 c-10,0 -18,8 -18,18 s8,18 18,18 s18,-8 18,-18 s-8,-18 -18,-18", label: 'Head' },
    { id: 'back_upper', d: "M70,70 h60 l5,60 h-70 z", label: 'Upper Back' },
    { id: 'back_lower', d: "M75,135 h50 l5,40 h-60 z", label: 'Lower Back' },
    { id: 'shoulder_l', d: "M60,75 a15,15 0 1,0 15,0 z", label: 'Left Shoulder' },
    { id: 'shoulder_r', d: "M125,75 a15,15 0 1,0 15,0 z", label: 'Right Shoulder' },
    { id: 'glutes', d: "M75,180 h50 l10,30 h-70 z", label: 'Glutes' },
    { id: 'hamstring_l', d: "M75,215 l-10,70 h25 l10,-70 z", label: 'Left Hamstring' },
    { id: 'hamstring_r', d: "M110,215 l10,70 h25 l-10,-70 z", label: 'Right Hamstring' },
    { id: 'calf_l', d: "M65,305 l5,80 h15 l5,-80 z", label: 'Left Calf' },
    { id: 'calf_r', d: "M110,305 l5,80 h15 l5,-80 z", label: 'Right Calf' },
  ];

  return (
    <div className={cn("relative aspect-[1/2] w-full max-w-[350px] mx-auto", className)}>
      <svg viewBox="0 0 200 450" className="w-full h-full drop-shadow-2xl filter transition-all duration-500">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Body Outline */}
        <path 
          d="M100,15 L115,15 L125,30 L135,60 L150,70 L165,90 L165,180 L155,200 L145,300 L140,400 L120,430 L100,430 L80,430 L60,400 L55,300 L45,200 L35,180 L35,90 L50,70 L65,60 L75,30 L85,15 Z" 
          className="fill-slate-50 dark:fill-slate-900/50 stroke-slate-200 dark:stroke-slate-800 stroke-2 transition-colors duration-500"
        />

        {/* Muscle Groups */}
        {parts.map((part) => (
          <motion.path
            key={part.id}
            id={part.id}
            d={part.d}
            className={cn(
              "transition-all duration-500 cursor-pointer",
              getColor(part.id)
            )}
            onClick={() => onPartClick?.(part.id)}
            whileHover={{ scale: 1.02, filter: "url(#glow)" }}
            whileTap={{ scale: 0.98 }}
            animate={strainData[part.id] === 'high' ? { 
              opacity: [0.7, 1, 0.7],
              filter: ["url(#glow)", "url(#glow)", "url(#glow)"]
            } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        ))}
      </svg>
      
      {/* View Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black text-white uppercase tracking-widest">
        {view} VIEW
      </div>
    </div>
  );
}
