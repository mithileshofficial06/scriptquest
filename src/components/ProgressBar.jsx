import { motion } from 'framer-motion';
import { useState } from 'react';

const TOTAL_STAGES = 20;

const zones = [
  {
    id: 1,
    name: 'The Basics',
    stages: [1, 2, 3, 4, 5, 6, 7],
    color: '#61afef',
    bgColor: 'rgba(97, 175, 239, 0.08)',
  },
  {
    id: 2,
    name: 'Level Up',
    stages: [8, 9, 10, 11, 12],
    color: '#98c379',
    bgColor: 'rgba(152, 195, 121, 0.08)',
  },
  {
    id: 3,
    name: 'New Powers',
    stages: [13, 14, 15],
    color: '#c678dd',
    bgColor: 'rgba(198, 120, 221, 0.08)',
  },
  {
    id: 4,
    name: "You're a Creator",
    stages: [16, 17, 18],
    color: '#e5c07b',
    bgColor: 'rgba(229, 192, 123, 0.08)',
  },
  {
    id: 5,
    name: 'Boss Levels',
    stages: [19, 20],
    color: '#e06c75',
    bgColor: 'rgba(224, 108, 117, 0.08)',
  },
];

export default function ProgressBar({ currentStageId, completedStages, onSelectStage }) {
  const stageNames = [
    'Commands',
    'Loops',
    'Variables',
    'Conditionals',
    'Functions',
    'Bug Hunt',
    'Your Level',
    'Obstacle Course',
    'Speed Shift',
    'No Help Level',
    '5 Line Challenge',
    'Double Bug Hunt',
    'Parameters',
    'Inventory',
    'Loot Box',
    'Score Tracker',
    'Patrol Enemy',
    'Timed Collect',
    'The Heist',
    'Final Sandbox',
  ];
  const [expandedZone, setExpandedZone] = useState(() => {
    // Find which zone contains the current stage
    return zones.find(z => z.stages.includes(currentStageId))?.id || 1;
  });

  // Determine if a zone is locked - always false to allow free testing
  const isZoneLocked = (zone) => {
    return false;
  };

  return (
    <div
      id="progress-bar"
      className="flex flex-col px-4 py-3 max-h-[35vh] overflow-y-auto"
      style={{
        background: 'var(--color-bg-panel)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      {zones.map((zone) => {
        const locked = isZoneLocked(zone);
        const isExpanded = expandedZone === zone.id;
        const zoneComplete = zone.stages.every(sid => completedStages.includes(sid));
        const hasCurrentStage = zone.stages.includes(currentStageId);

        return (
          <div key={zone.id} className="mb-2">
            {/* Zone Header */}
            <motion.div
              className="flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all"
              style={{
                background: hasCurrentStage ? zone.bgColor : 'rgba(255,255,255,0.02)',
                border: `1px solid ${hasCurrentStage ? zone.color : 'var(--color-border-subtle)'}`,
              }}
              onClick={() => !locked && setExpandedZone(isExpanded ? null : zone.id)}
              whileHover={!locked ? { scale: 1.01 } : {}}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold"
                  style={{
                    background: locked ? 'var(--color-surface)' : zone.color,
                    color: locked ? 'var(--color-text-ghost)' : '#0a0a0f',
                  }}
                >
                  {locked ? '🔒' : zoneComplete ? '✓' : zone.id}
                </div>
                <div>
                  <div
                    className="text-xs font-bold"
                    style={{ color: locked ? 'var(--color-text-ghost)' : zone.color }}
                  >
                    {zone.name}
                  </div>
                  <div className="text-[9px]" style={{ color: 'var(--color-text-dim)' }}>
                    Stages {zone.stages[0]}–{zone.stages[zone.stages.length - 1]}
                  </div>
                </div>
              </div>
              {!locked && (
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ color: zone.color }}
                >
                  ▼
                </motion.div>
              )}
            </motion.div>

            {/* Stage Pills */}
            {isExpanded && !locked && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-wrap gap-1.5 mt-2 px-2"
              >
                {zone.stages.map((stageId) => {
                  const isCompleted = completedStages.includes(stageId);
                  const isCurrent = stageId === currentStageId;

                  return (
                    <motion.div
                      key={stageId}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="cursor-pointer px-2.5 py-1.5 rounded-md text-[10px] font-bold transition-all"
                      style={{
                        background: isCompleted
                          ? zone.color
                          : isCurrent
                            ? zone.bgColor
                            : 'var(--color-surface)',
                        border: `1px solid ${isCurrent ? zone.color : 'var(--color-border-subtle)'}`,
                        color: isCompleted ? '#0a0a0f' : isCurrent ? zone.color : 'var(--color-text-dim)',
                      }}
                      onClick={() => onSelectStage(stageId)}
                    >
                      {isCompleted ? '✓' : stageId}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
}
