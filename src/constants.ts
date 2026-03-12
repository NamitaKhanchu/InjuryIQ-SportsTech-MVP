import { Athlete, RecoverySession, RecoveryRoadmap } from './types';

export const MOCK_ROADMAPS: RecoveryRoadmap[] = [
  {
    id: 'r1',
    athleteId: '1',
    injuryType: 'Ankle Stability & ACL Prevention',
    startDate: '2026-03-01',
    targetDate: '2026-04-01',
    currentProgress: 60,
    goals: [
      {
        id: 'g1',
        title: 'Initial Assessment',
        description: 'Complete baseline mobility and strength testing.',
        isCompleted: true,
        type: 'SMALL'
      },
      {
        id: 'g2',
        title: 'Balance Mastery',
        description: 'Hold single-leg stand for 60 seconds with eyes closed.',
        isCompleted: true,
        type: 'SMALL'
      },
      {
        id: 'g3',
        title: 'Proprioception Phase',
        description: 'Complete 5 sessions of wobble board training.',
        isCompleted: false,
        type: 'SMALL'
      },
      {
        id: 'g4',
        title: 'Plyometric Readiness',
        description: 'Demonstrate perfect landing mechanics in jump tests.',
        isCompleted: false,
        type: 'SMALL'
      },
      {
        id: 'g5',
        title: 'Full Return to Play',
        description: 'Clearance for 100% intensity match participation.',
        isCompleted: false,
        type: 'BIG'
      }
    ]
  },
  {
    id: 'r2',
    athleteId: '1',
    injuryType: 'Shoulder Mobility (Prevention)',
    startDate: '2026-03-05',
    targetDate: '2026-03-25',
    currentProgress: 25,
    goals: [
      {
        id: 'g6',
        title: 'Range Check',
        description: 'Measure internal and external rotation symmetry.',
        isCompleted: true,
        type: 'SMALL'
      },
      {
        id: 'g7',
        title: 'Scapular Control',
        description: 'Perform 3 sets of 15 Scapular Wall Slides with perfect form.',
        isCompleted: false,
        type: 'SMALL'
      },
      {
        id: 'g8',
        title: 'Rotator Cuff Strength',
        description: 'Complete band-resisted external rotation protocol.',
        isCompleted: false,
        type: 'SMALL'
      },
      {
        id: 'g9',
        title: 'Overhead Stability',
        description: 'Hold 5lb kettlebell in overhead carry for 40 yards.',
        isCompleted: false,
        type: 'BIG'
      }
    ]
  },
  {
    id: 'r3',
    athleteId: '1',
    injuryType: 'Hamstring Strain Recovery',
    startDate: '2026-02-20',
    targetDate: '2026-03-30',
    currentProgress: 80,
    goals: [
      {
        id: 'g10',
        title: 'Pain-Free Walk',
        description: 'Achieve 10,000 steps without localized discomfort.',
        isCompleted: true,
        type: 'SMALL'
      },
      {
        id: 'g11',
        title: 'Isometric Loading',
        description: 'Hold bridge position for 45 seconds pain-free.',
        isCompleted: true,
        type: 'SMALL'
      },
      {
        id: 'g12',
        title: 'Eccentric Strength',
        description: 'Perform 3x8 Nordic Hamstring Curls with controlled descent.',
        isCompleted: true,
        type: 'SMALL'
      },
      {
        id: 'g13',
        title: 'Sprint Progression',
        description: 'Reach 90% of max velocity in controlled environment.',
        isCompleted: false,
        type: 'SMALL'
      },
      {
        id: 'g14',
        title: 'Match Fit',
        description: 'Complete full team training session without restrictions.',
        isCompleted: false,
        type: 'BIG'
      }
    ]
  },
  {
    id: 'r4',
    athleteId: '2',
    injuryType: 'Acute Overload Management',
    startDate: '2026-03-10',
    targetDate: '2026-03-17',
    currentProgress: 15,
    goals: [
      {
        id: 'g15',
        title: 'Reduced Load Training',
        description: 'Limit training intensity to <60% max HR.',
        isCompleted: true,
        type: 'SMALL'
      },
      {
        id: 'g16',
        title: 'Sleep Optimization',
        description: 'Achieve 8+ hours of sleep for 3 consecutive nights.',
        isCompleted: false,
        type: 'SMALL'
      }
    ]
  },
  {
    id: 'r5',
    athleteId: '3',
    injuryType: 'Core Stability Maintenance',
    startDate: '2026-03-01',
    targetDate: '2026-04-01',
    currentProgress: 45,
    goals: [
      {
        id: 'g17',
        title: 'Plank Progression',
        description: 'Hold 2-minute front plank with perfect alignment.',
        isCompleted: true,
        type: 'SMALL'
      }
    ]
  },
  {
    id: 'r6',
    athleteId: '1',
    injuryType: 'Post-Season Recovery (Completed)',
    startDate: '2026-01-15',
    targetDate: '2026-02-15',
    currentProgress: 100,
    goals: [
      {
        id: 'g18',
        title: 'Active Rest Phase',
        description: 'Complete 4 weeks of low-impact activity.',
        isCompleted: true,
        type: 'BIG'
      }
    ]
  }
];

export const MOCK_ATHLETES: Athlete[] = [
  {
    id: '1',
    name: 'Marcus Thompson',
    position: 'Midfielder',
    age: 14,
    status: 'CAUTION',
    consent: 'VERIFIED',
    hrv: 68,
    hrvTrend: [62, 65, 64, 67, 70, 68, 68],
    load: 75,
    sleep: 7.5,
    wellness: 4,
    teamSync: { school: 'synced', club: 'synced' }
  },
  {
    id: '2',
    name: 'Emma Rodriguez',
    position: 'Forward',
    age: 15,
    status: 'OVERLOAD_RISK',
    consent: 'VERIFIED',
    hrv: 42,
    hrvTrend: [55, 52, 50, 48, 45, 43, 42],
    load: 92,
    sleep: 6.2,
    wellness: 2,
    teamSync: { school: 'pending', club: 'synced' }
  },
  {
    id: '3',
    name: 'Leo Chen',
    position: 'Defender',
    age: 13,
    status: 'SAFE',
    consent: 'ACTION_REQUIRED',
    hrv: 75,
    hrvTrend: [70, 72, 74, 73, 75, 76, 75],
    load: 45,
    sleep: 8.5,
    wellness: 5,
    teamSync: { school: 'none', club: 'synced' }
  }
];

export const RECOVERY_SESSIONS: RecoverySession[] = [
  {
    id: 's1',
    name: 'Rest + Mobility Protocol',
    duration: 12,
    targetArea: 'Full Body',
    injuryReduced: 'General Overuse',
    type: 'RED'
  },
  {
    id: 's2',
    name: 'Neuromuscular Training',
    duration: 7,
    targetArea: 'Lower Body',
    injuryReduced: 'ACL Strain',
    type: 'YELLOW'
  },
  {
    id: 's3',
    name: 'Performance Activation',
    duration: 10,
    targetArea: 'Core & Glutes',
    injuryReduced: 'Muscle Fatigue',
    type: 'GREEN'
  },
  {
    id: 's4',
    name: 'HSS RIIP REPS Protocol',
    duration: 7,
    targetArea: 'Lower Body',
    injuryReduced: 'ACL injury risk by 62%',
    type: 'YELLOW'
  }
];
