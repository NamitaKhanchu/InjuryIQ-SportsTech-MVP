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

  // Tapered, smoother regions for a more “clinical” look.
  // NOTE: These regions are intentionally approximate; we apply a per-view calibration transform
  // so they line up with the chosen anatomy images.
  const CAL =
    view === 'FRONT'
      ? { scale: 1.0, dx: 0, dy: 0 }
      : { scale: 1.0, dx: 0, dy: 0 };
  const cx = 100;
  const cy = 225;
  const overlayTransform = `translate(${CAL.dx} ${CAL.dy}) translate(${cx} ${cy}) scale(${CAL.scale}) translate(${-cx} ${-cy})`;

  const parts =
    view === 'FRONT'
      ? [
          { id: 'head', d: 'M100 28c-13 0-23 10-23 23s10 23 23 23 23-10 23-23-10-23-23-23Z', label: 'Head' },
          { id: 'neck', d: 'M87 76c0-6 5-11 11-11h4c6 0 11 5 11 11v12H87V76Z', label: 'Neck' },
          { id: 'chest', d: 'M66 96c10-10 22-16 34-16s24 6 34 16l10 42c-20 11-44 11-88 0l10-42Z', label: 'Chest' },
          { id: 'abs', d: 'M78 142c7 3 15 5 22 5s15-2 22-5l8 62c-9 7-19 11-30 11s-21-4-30-11l8-62Z', label: 'Abs' },
          { id: 'shoulder_l', d: 'M72 114c0-12 10-22 22-22 6 0 11 2 15 6-4 12-15 21-28 21-3 0-6-1-9-2Z', label: 'Left Shoulder' },
          { id: 'shoulder_r', d: 'M128 114c0-12-10-22-22-22-6 0-11 2-15 6 4 12 15 21 28 21 3 0 6-1 9-2Z', label: 'Right Shoulder' },
          { id: 'arm_l', d: 'M46 132c0-12 7-22 17-27l10 10c-7 6-11 15-11 25v92c0 10 4 19 11 25l-10 10c-10-5-17-15-17-27V132Z', label: 'Left Arm' },
          { id: 'arm_r', d: 'M154 132c0-12-7-22-17-27l-10 10c7 6 11 15 11 25v92c0 10-4 19-11 25l10 10c10-5 17-15 17-27V132Z', label: 'Right Arm' },
          { id: 'quad_l', d: 'M83 230c-12 5-20 16-23 32l-6 58c8 9 17 14 28 14 9 0 18-3 26-9l7-62c2-15-3-27-14-33H83Z', label: 'Left Quad' },
          { id: 'quad_r', d: 'M117 230c12 5 20 16 23 32l6 58c-8 9-17 14-28 14-9 0-18-3-26-9l-7-62c-2-15 3-27 14-33h18Z', label: 'Right Quad' },
          { id: 'calf_l', d: 'M66 360c7 6 15 9 24 9s17-3 24-9l-7 70c-4 10-10 15-17 15H90c-7 0-13-5-17-15l-7-70Z', label: 'Left Calf' },
          { id: 'calf_r', d: 'M110 360c7 6 15 9 24 9s17-3 24-9l-7 70c-4 10-10 15-17 15h-4c-7 0-13-5-17-15l-7-70Z', label: 'Right Calf' },
        ]
      : [
          { id: 'head', d: 'M100 28c-13 0-23 10-23 23s10 23 23 23 23-10 23-23-10-23-23-23Z', label: 'Head' },
          { id: 'back_upper', d: 'M62 98c13-13 25-18 38-18s25 5 38 18l8 58c-17 9-32 13-46 13s-29-4-46-13l8-58Z', label: 'Upper Back' },
          { id: 'back_lower', d: 'M76 164c7 4 15 6 24 6s17-2 24-6l10 46c-10 10-21 15-34 15s-24-5-34-15l10-46Z', label: 'Lower Back' },
          { id: 'shoulder_l', d: 'M72 114c0-12 10-22 22-22 6 0 11 2 15 6-4 12-15 21-28 21-3 0-6-1-9-2Z', label: 'Left Shoulder' },
          { id: 'shoulder_r', d: 'M128 114c0-12-10-22-22-22-6 0-11 2-15 6 4 12 15 21 28 21 3 0 6-1 9-2Z', label: 'Right Shoulder' },
          { id: 'hamstring_l', d: 'M78 274c-10 6-18 16-22 29l-6 52c8 8 18 12 30 12 10 0 19-3 27-9l6-55c1-13-4-24-15-29H78Z', label: 'Left Hamstring' },
          { id: 'hamstring_r', d: 'M122 274c10 6 18 16 22 29l6 52c-8 8-18 12-30 12-10 0-19-3-27-9l-6-55c-1-13 4-24 15-29h20Z', label: 'Right Hamstring' },
          { id: 'calf_l', d: 'M66 360c7 6 15 9 24 9s17-3 24-9l-7 70c-4 10-10 15-17 15H90c-7 0-13-5-17-15l-7-70Z', label: 'Left Calf' },
          { id: 'calf_r', d: 'M110 360c7 6 15 9 24 9s17-3 24-9l-7 70c-4 10-10 15-17 15h-4c-7 0-13-5-17-15l-7-70Z', label: 'Right Calf' },
        ];

  const resolvedBackdropUrl = backdropUrl || (view === 'FRONT' ? '/anatomy-front.png' : '/anatomy-back.png');
  // Match SVG aspect ratio to the underlying image so the overlay and image letterbox identically.
  // Front image: 625x975 ≈ 0.641. Back image: 682x1024 ≈ 0.666.
  const viewBoxWidth = view === 'FRONT' ? 288 : 300; // 450 * ratio ~= width
  const viewBox = `0 0 ${viewBoxWidth} 450`;
  const xPad = (viewBoxWidth - 200) / 2;

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
      <img
        src={resolvedBackdropUrl}
        alt=""
        aria-hidden="true"
        className={cn(
          'absolute inset-0 w-full h-full object-contain',
          // Makes the black background visually disappear by blending with the container.
          'mix-blend-screen opacity-95',
          // Slight tuning for “x-ray” look.
          'contrast-125 brightness-110 saturate-50'
        )}
      />

      <svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet" className="relative w-full h-full drop-shadow-2xl filter transition-all duration-500">
        <defs>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="bodyFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
            <stop offset="55%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.04)" />
          </linearGradient>
          <linearGradient id="bodyStroke" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(0,212,170,0.35)" />
            <stop offset="100%" stopColor="rgba(0,212,170,0.05)" />
          </linearGradient>
        </defs>

        {/* Muscle Groups (calibrated to align with image) */}
        <g transform={`translate(${xPad} 0)`}>
          <g transform={overlayTransform}>
            {parts.map((part) => (
              <motion.path
                key={part.id}
                id={part.id}
                d={part.d}
                fill="transparent"
                vectorEffect="non-scaling-stroke"
                className={cn(
                  'transition-all duration-300 cursor-pointer',
                  // Keep highlights soft and minimal.
                  'drop-shadow-[0_6px_14px_rgba(0,0,0,0.20)]',
                  'mix-blend-screen',
                  getColor(part.id)
                )}
                onClick={() => onPartClick?.(part.id)}
                whileHover={{ scale: 1.01, filter: 'url(#softGlow)' }}
                whileTap={{ scale: 0.98 }}
                animate={
                  strainData[part.id] === 'high'
                    ? {
                        opacity: [0.55, 0.95, 0.55],
                      }
                    : undefined
                }
                transition={strainData[part.id] === 'high' ? { repeat: Infinity, duration: 1.8 } : undefined}
              />
            ))}
          </g>
        </g>
      </svg>
    </div>
  );
}
