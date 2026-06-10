import { motion, AnimatePresence } from 'framer-motion';

/** Parse **bold** markers into <strong> elements */
function renderBoldText(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold" style={{ color: 'var(--color-primary)' }}>
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function CelebrationOverlay({
  show,
  celebration,
  lineCount,
  optimalLines,
  lineCountChallenge,
  onContinue,
  onRetry,
  badge,
  coinsGained,
}) {
  if (!celebration) return null;

  const canOptimize = lineCount > optimalLines;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(4, 4, 8, 0.88)', backdropFilter: 'blur(12px)' }}
        >
          {/* Floating golden particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 35 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  width: 4 + Math.random() * 6,
                  height: 4 + Math.random() * 6,
                  left: `${Math.random() * 100}%`,
                  top: '-3%',
                  background: ['#e8b94a', '#f0d78c', '#c678dd', '#98c379', '#61afef', '#e06c75'][i % 6],
                  borderRadius: i % 3 === 0 ? '50%' : '2px',
                  rotate: `${Math.random() * 360}deg`,
                }}
                animate={{
                  y: ['0vh', '105vh'],
                  x: [0, (Math.random() - 0.5) * 150],
                  rotate: [0, Math.random() * 540],
                  opacity: [0, 0.8, 0.8, 0],
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  delay: Math.random() * 2.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            ))}
          </div>

          {/* Card */}
          <motion.div
            initial={{ scale: 0.6, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.6, y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 16 }}
            className="glass-panel glow-border rounded-3xl p-8 max-w-md w-full mx-4 relative"
          >
            {/* Trophy */}
            <motion.div
              className="text-5xl text-center mb-5"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              🏆
            </motion.div>

            {/* Title */}
            <h2 className="text-xl font-black text-center mb-3 text-gradient">
              {celebration.title}
            </h2>

            {/* Coins and Line count */}
            <div className="flex justify-center gap-3 mb-5">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border-accent)',
                  color: 'var(--color-primary)',
                }}
              >
                📝 {lineCount} lines of code
              </div>

              {coinsGained > 0 && (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                  style={{
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    color: '#f59e0b',
                  }}
                >
                  🪙 +{coinsGained} Coins {coinsGained > 15 ? 'Optimal! 🚀' : ''}
                </motion.div>
              )}
            </div>

            {/* Badge award */}
            {badge && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                className="flex justify-center mb-5"
              >
                <div
                  className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-bold"
                  style={{
                    background: 'linear-gradient(135deg, rgba(232,185,74,0.12) 0%, rgba(232,185,74,0.04) 100%)',
                    border: '1.5px solid var(--color-border-accent)',
                    color: 'var(--color-primary)',
                    boxShadow: '0 0 30px var(--color-primary-glow), inset 0 1px 0 rgba(255,255,255,0.06)',
                    animation: 'shimmer 3s infinite',
                    backgroundSize: '200% auto',
                  }}
                >
                  <span className="text-xl">{badge.icon}</span>
                  <span>{badge.name}</span>
                </div>
              </motion.div>
            )}

            {/* Real Code Reveal */}
            <div
              className="rounded-2xl p-5 mb-5"
              style={{
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h3
                className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: 'var(--color-primary)' }}
              >
                🔍 Real Code Reveal — {celebration.concept}
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--color-text-secondary)' }}>
                {renderBoldText(celebration.explanation)}
              </p>

              {/* Code hint — shows the better approach */}
              {celebration.codeHint && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-4"
                >
                  <div
                    className="rounded-xl px-4 py-3"
                    style={{
                      background: 'rgba(232, 185, 74, 0.06)',
                      border: '1px solid rgba(232, 185, 74, 0.12)',
                    }}
                  >
                    <code
                      className="text-sm font-semibold block"
                      style={{ fontFamily: 'var(--font-code)', color: 'var(--color-primary)' }}
                    >
                      {celebration.codeHint}
                    </code>
                  </div>
                  {celebration.codeHintLabel && (
                    <p className="text-[11px] mt-2 text-center" style={{ color: 'var(--color-text-dim)' }}>
                      {celebration.codeHintLabel}
                    </p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Line count challenge / optimization prompt */}
            {canOptimize && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center mb-5 p-3 rounded-xl"
                style={{
                  background: 'rgba(198, 120, 221, 0.06)',
                  border: '1px solid rgba(198, 120, 221, 0.12)',
                }}
              >
                <p className="text-sm font-semibold" style={{ color: 'var(--color-accent-purple)' }}>
                  {celebration.retryPrompt
                    ? celebration.retryPrompt
                    : lineCountChallenge
                      ? `✨ Can you do it in under ${lineCountChallenge} lines?`
                      : '✨ Can you reach the star in fewer lines?'
                  }
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-dim)' }}>
                  Best possible: {optimalLines} {optimalLines === 1 ? 'line' : 'lines'}
                </p>
              </motion.div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRetry}
                className="btn-secondary flex-1 text-xs py-3"
              >
                {canOptimize && celebration.codeHint ? 'Try with repeat()' : 'Try Again'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onContinue}
                className="btn-primary flex-1 text-xs py-3"
              >
                {canOptimize ? 'Continue →' : 'Next Stage →'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
