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

export default function BugHuntOverlay({
  show,
  bugData,
  bugsSquashed,
  totalBugs,
  onNextBug,
  onComplete,
  isLastBug,
}) {
  if (!bugData) return null;

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
          {/* Floating bug particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 20 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute text-xl"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-5%',
                }}
                animate={{
                  y: ['0vh', '110vh'],
                  x: [0, (Math.random() - 0.5) * 80],
                  rotate: [0, Math.random() * 360],
                  opacity: [0, 0.6, 0.6, 0],
                }}
                transition={{
                  duration: 5 + Math.random() * 3,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              >
                {i % 3 === 0 ? '🔨' : i % 3 === 1 ? '✨' : '🐛'}
              </motion.div>
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
            {/* Bug squash animation */}
            <motion.div
              className="text-5xl text-center mb-4"
              initial={{ scale: 2, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 12 }}
            >
              🔨
            </motion.div>

            {/* Title */}
            <h2 className="text-xl font-black text-center mb-2 text-gradient">
              Bug Squashed!
            </h2>

            {/* Progress */}
            <div className="flex justify-center mb-5">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold"
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border-accent)',
                  color: 'var(--color-primary)',
                }}
              >
                🐛 {bugsSquashed} of {totalBugs} bugs fixed
              </div>
            </div>

            {/* Explanation */}
            <div
              className="rounded-2xl p-5 mb-5"
              style={{
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h3
                className="text-[10px] font-bold uppercase tracking-[0.2em] mb-3"
                style={{ color: 'var(--color-accent-green)' }}
              >
                🔍 What was the bug?
              </h3>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--color-text-secondary)' }}>
                {renderBoldText(bugData.explanation)}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              {isLastBug ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onComplete}
                  className="btn-primary flex-1 text-xs py-3"
                >
                  🏆 Complete Stage
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onNextBug}
                  className="btn-primary flex-1 text-xs py-3"
                >
                  Next Bug →
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
