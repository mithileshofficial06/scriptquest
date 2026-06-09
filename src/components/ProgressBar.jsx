import { motion } from 'framer-motion';

const TOTAL_STAGES = 7;

export default function ProgressBar({ currentStageId, completedStages }) {
  const stageNames = [
    'Commands',
    'Variables',
    'Loops',
    'Conditionals',
    'Functions',
    'Tables',
    'Final Quest',
  ];

  return (
    <div
      id="progress-bar"
      className="glass-panel flex items-center gap-1 px-4 py-2.5 border-t border-white/5"
    >
      {/* Stage label */}
      <div className="flex items-center gap-2 mr-3 shrink-0">
        <span className="text-xs font-bold text-white/40 uppercase tracking-wider">
          Stage {currentStageId}
        </span>
      </div>

      {/* Progress trail */}
      <div className="flex items-center gap-1 flex-1 justify-center">
        {Array.from({ length: TOTAL_STAGES }, (_, i) => {
          const stageId = i + 1;
          const isCompleted = completedStages.includes(stageId);
          const isCurrent = stageId === currentStageId;

          return (
            <div key={stageId} className="flex items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.15 : 1,
                  opacity: isCurrent || isCompleted ? 1 : 0.4,
                }}
                className="relative flex flex-col items-center"
              >
                {/* Node */}
                <div
                  className={`
                    w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                    transition-all duration-300 border-2
                    ${isCompleted
                      ? 'bg-[var(--color-success)] border-[var(--color-success)] text-white'
                      : isCurrent
                        ? 'bg-[var(--color-primary)]/20 border-[var(--color-primary)] text-[var(--color-primary)]'
                        : 'bg-white/5 border-white/10 text-white/30'
                    }
                  `}
                >
                  {isCompleted ? '✓' : stageId}
                </div>

                {/* Label */}
                <span
                  className={`
                    text-[9px] mt-0.5 font-semibold whitespace-nowrap
                    ${isCurrent ? 'text-[var(--color-primary)]' : 'text-white/30'}
                  `}
                >
                  {stageNames[i]}
                </span>

                {/* Current stage glow */}
                {isCurrent && (
                  <motion.div
                    className="absolute -inset-1 rounded-xl border-2 border-[var(--color-primary)]/30"
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>

              {/* Connector line */}
              {stageId < TOTAL_STAGES && (
                <div
                  className={`
                    w-4 h-0.5 mx-0.5
                    ${isCompleted ? 'bg-[var(--color-success)]' : 'bg-white/10'}
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
