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
      className="flex items-center px-6 py-2.5"
      style={{
        background: 'var(--color-bg-panel)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      {/* Stage label */}
      <div className="flex items-center gap-2 mr-5 shrink-0">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black"
          style={{
            background: 'var(--color-primary)',
            color: 'var(--color-bg-dark)',
          }}
        >
          {currentStageId}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-dim)' }}>
          Stage
        </span>
      </div>

      {/* Progress trail */}
      <div className="flex items-center gap-0.5 flex-1 justify-center">
        {Array.from({ length: TOTAL_STAGES }, (_, i) => {
          const stageId = i + 1;
          const isCompleted = completedStages.includes(stageId);
          const isCurrent = stageId === currentStageId;

          return (
            <div key={stageId} className="flex items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isCurrent ? 1.1 : 1,
                  opacity: isCurrent || isCompleted ? 1 : 0.35,
                }}
                className="relative flex flex-col items-center"
              >
                {/* Node */}
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold transition-all duration-300"
                  style={{
                    background: isCompleted
                      ? 'var(--color-accent-green)'
                      : isCurrent
                        ? 'rgba(232, 185, 74, 0.12)'
                        : 'var(--color-surface)',
                    border: `1.5px solid ${
                      isCompleted
                        ? 'var(--color-accent-green)'
                        : isCurrent
                          ? 'var(--color-primary)'
                          : 'var(--color-border-subtle)'
                    }`,
                    color: isCompleted
                      ? '#0a0a0f'
                      : isCurrent
                        ? 'var(--color-primary)'
                        : 'var(--color-text-dim)',
                  }}
                >
                  {isCompleted ? '✓' : stageId}
                </div>

                {/* Label */}
                <span
                  className="text-[8px] mt-0.5 font-semibold whitespace-nowrap"
                  style={{
                    color: isCurrent ? 'var(--color-primary)' : 'var(--color-text-ghost)',
                  }}
                >
                  {stageNames[i]}
                </span>

                {/* Current stage indicator dot */}
                {isCurrent && (
                  <motion.div
                    className="absolute -bottom-1 w-1 h-1 rounded-full"
                    style={{ background: 'var(--color-primary)' }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </motion.div>

              {/* Connector */}
              {stageId < TOTAL_STAGES && (
                <div
                  className="w-5 h-px mx-0.5"
                  style={{
                    background: isCompleted
                      ? 'var(--color-accent-green)'
                      : 'var(--color-border-subtle)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
