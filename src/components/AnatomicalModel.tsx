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
  /**
   * Optional image backdrop (drop files in `public/` and pass `/your-file.png`).
   * This is purely visual and does not affect click/strain logic.
   */
  backdropUrl?: string;
}

export function AnatomicalModel({ view, strainData, className, onPartClick, selectedPart, backdropUrl }: AnatomicalModelProps) {
  const getColor = (partId: string) => {
    const level = strainData[partId];
    const isSelected = selectedPart === partId;
    
    // Default: invisible (we still keep it clickable via fill="transparent")
    if (!level && !isSelected) return 'fill-transparent stroke-transparent';

    // Subtle highlight palette so the underlying image stays clear.
    if (level === 'high')
      return isSelected
        ? 'fill-status-red/55 stroke-status-red/80 stroke-[2.5]'
        : 'fill-status-red/38 stroke-status-red/55 stroke-[2.25]';
    if (level === 'medium')
      return isSelected
        ? 'fill-status-yellow/50 stroke-status-yellow/75 stroke-[2.5]'
        : 'fill-status-yellow/34 stroke-status-yellow/50 stroke-[2.25]';
    if (level === 'low')
      return isSelected
        ? 'fill-status-green/38 stroke-status-green/60 stroke-[2.5]'
        : 'fill-status-green/24 stroke-status-green/40 stroke-[2.25]';

    // Selected but no strain: faint neutral highlight
    return 'fill-white/26 stroke-white/35 stroke-[2.25]';
  };

  const resolvedBackdropUrl = backdropUrl || (view === 'FRONT' ? '/anatomy-front.png' : '/anatomy-back.png');

  // Use the image's native pixel coordinates as the overlay coordinate system.
  // This guarantees that highlights line up with the actual image, even with letterboxing.
  const IMG = view === 'FRONT' ? { w: 400, h: 624 } : { w: 408, h: 612 };

  type Pt = { x: number; y: number };
  type Part = { id: string; d: string; label: string };

  const frame =
    view === 'FRONT'
      ? { x: 77, y: 38, w: 246, h: 563 } // tuned for anatomy-front.png (400x624)
      : { x: 75, y: 42, w: 257, h: 538 }; // tuned for anatomy-back.png (408x612)

  const p = (nx: number, ny: number): Pt => ({
    x: frame.x + nx * frame.w,
    y: frame.y + ny * frame.h,
  });

  const poly = (pts: Pt[]) =>
    `M ${pts[0].x} ${pts[0].y} ` + pts.slice(1).map((q) => `L ${q.x} ${q.y}`).join(' ') + ' Z';

  const ellipse = (c: Pt, rx: number, ry: number) =>
    `M ${c.x - rx} ${c.y} a ${rx} ${ry} 0 1 0 ${rx * 2} 0 a ${rx} ${ry} 0 1 0 ${-rx * 2} 0`;

  const parts: Part[] =
    view === 'FRONT'
      ? [
          { id: 'head', label: 'Head', d: ellipse(p(0.5, 0.055), frame.w * 0.085, frame.h * 0.055) },
          { id: 'neck', label: 'Neck', d: poly([p(0.47, 0.115), p(0.53, 0.115), p(0.54, 0.155), p(0.46, 0.155)]) },
          { id: 'chest', label: 'Chest', d: poly([p(0.34, 0.17), p(0.66, 0.17), p(0.72, 0.30), p(0.28, 0.30)]) },
          { id: 'abs', label: 'Abs', d: poly([p(0.38, 0.30), p(0.62, 0.30), p(0.66, 0.42), p(0.34, 0.42)]) },
          { id: 'shoulder_l', label: 'Left Shoulder', d: ellipse(p(0.38, 0.19), frame.w * 0.08, frame.h * 0.05) },
          { id: 'shoulder_r', label: 'Right Shoulder', d: ellipse(p(0.62, 0.19), frame.w * 0.08, frame.h * 0.05) },
          // Quads / hamstrings / calves
          { id: 'quad_l', label: 'Left Quad', d: poly([p(0.38, 0.46), p(0.455, 0.46), p(0.47, 0.66), p(0.365, 0.66)]) },
          { id: 'quad_r', label: 'Right Quad', d: poly([p(0.545, 0.46), p(0.62, 0.46), p(0.635, 0.66), p(0.53, 0.66)]) },
          // Front view: map hamstrings to the same approximate thigh regions (keeps demo strain IDs usable).
          { id: 'hamstring_l', label: 'Left Hamstring', d: poly([p(0.38, 0.48), p(0.455, 0.48), p(0.47, 0.66), p(0.365, 0.66)]) },
          { id: 'hamstring_r', label: 'Right Hamstring', d: poly([p(0.545, 0.48), p(0.62, 0.48), p(0.635, 0.66), p(0.53, 0.66)]) },
          { id: 'calf_l', label: 'Left Calf', d: poly([p(0.41, 0.68), p(0.455, 0.68), p(0.465, 0.92), p(0.395, 0.92)]) },
          { id: 'calf_r', label: 'Right Calf', d: poly([p(0.545, 0.68), p(0.59, 0.68), p(0.605, 0.92), p(0.535, 0.92)]) },
        ]
      : [
          { id: 'head', label: 'Head', d: ellipse(p(0.5, 0.058), frame.w * 0.085, frame.h * 0.055) },
          { id: 'back_upper', label: 'Upper Back', d: poly([p(0.35, 0.18), p(0.65, 0.18), p(0.70, 0.32), p(0.30, 0.32)]) },
          { id: 'back_lower', label: 'Lower Back', d: poly([p(0.40, 0.32), p(0.60, 0.32), p(0.64, 0.44), p(0.36, 0.44)]) },
          { id: 'shoulder_l', label: 'Left Shoulder', d: ellipse(p(0.38, 0.20), frame.w * 0.08, frame.h * 0.05) },
          { id: 'shoulder_r', label: 'Right Shoulder', d: ellipse(p(0.62, 0.20), frame.w * 0.08, frame.h * 0.05) },
          { id: 'hamstring_l', label: 'Left Hamstring', d: poly([p(0.38, 0.48), p(0.455, 0.48), p(0.47, 0.66), p(0.365, 0.66)]) },
          { id: 'hamstring_r', label: 'Right Hamstring', d: poly([p(0.545, 0.48), p(0.62, 0.48), p(0.635, 0.66), p(0.53, 0.66)]) },
          { id: 'calf_l', label: 'Left Calf', d: poly([p(0.41, 0.68), p(0.455, 0.68), p(0.465, 0.92), p(0.395, 0.92)]) },
          { id: 'calf_r', label: 'Right Calf', d: poly([p(0.545, 0.68), p(0.59, 0.68), p(0.605, 0.92), p(0.535, 0.92)]) },
        ];

  const viewBox = `0 0 ${IMG.w} ${IMG.h}`;

  // Both images now have real alpha channels, so use normal rendering.
  const imageStyle: React.CSSProperties = {
    opacity: 1,
    filter: 'contrast(1.15) brightness(1.05) saturate(0.9)',
  };

  return (
    <div
      className={cn(
        'relative aspect-[1/2] w-full max-w-[380px] mx-auto rounded-[2.5rem] overflow-hidden',
        'bg-transparent ring-1 ring-slate-200/60 dark:ring-white/10 shadow-2xl shadow-black/10',
        className
      )}
      style={{
        backgroundImage: `radial-gradient(circle at 20% 15%, rgba(0,212,170,0.12), transparent 45%), radial-gradient(circle at 80% 85%, rgba(0,212,170,0.06), transparent 55%), radial-gradient(circle at 50% 50%, rgba(255,255,255,0.04), transparent 55%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 opacity-20 lab-grid" />

      <svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet" className="relative w-full h-full drop-shadow-2xl filter transition-all duration-500">
        <defs>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Backdrop image inside SVG so overlays share the same coordinate space */}
        <image
          href={resolvedBackdropUrl}
          x={0}
          y={0}
          width={IMG.w}
          height={IMG.h}
          preserveAspectRatio="xMidYMid meet"
          style={imageStyle}
        />

        {/* Muscle Groups */}
        {parts.map((part) => (
          <motion.path
            key={part.id}
            id={part.id}
            d={part.d}
            fill="transparent"
            vectorEffect="non-scaling-stroke"
            className={cn(
              'transition-all duration-200 cursor-pointer',
              'mix-blend-screen',
              getColor(part.id)
            )}
            onClick={() => onPartClick?.(part.id)}
            whileHover={{ filter: 'url(#softGlow)' }}
            whileTap={{ scale: 0.98 }}
            animate={strainData[part.id] === 'high' ? { opacity: [0.7, 1, 0.7] } : undefined}
            transition={strainData[part.id] === 'high' ? { repeat: Infinity, duration: 1.6 } : undefined}
          />
        ))}
      </svg>
    </div>
  );
}
