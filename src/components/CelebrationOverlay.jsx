import { motion, AnimatePresence } from 'framer-motion';

export default function CelebrationOverlay({
  show,
  celebration,
  lineCount,
  optimalLines,
  onContinue,
  onRetry,
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
          style={{ background: 'rgba(10, 10, 30, 0.85)', backdropFilter: 'blur(8px)' }}
        >
          {/* Floating confetti particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 40 }, (_, i) => (
              <motion.div
                key={i}
                className="absolute rounded"
                style={{
                  width: 8 + Math.random() * 8,
                  height: 8 + Math.random() * 8,
                  left: `${Math.random() * 100}%`,
                  top: '-5%',
                  background: ['#ffd93d', '#ff6b9d', '#00d4ff', '#6bcb77', '#a855f7'][i % 5],
                  rotate: `${Math.random() * 360}deg`,
                }}
                animate={{
                  y: ['0vh', '110vh'],
                  x: [0, (Math.random() - 0.5) * 200],
                  rotate: [0, Math.random() * 720],
                }}
                transition={{
                  duration: 3 + Math.random() * 3,
                  delay: Math.random() * 2,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            ))}
          </div>

          {/* Card */}
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 50 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="glass-panel glow-border rounded-3xl p-8 max-w-lg w-full mx-4 relative"
          >
            {/* Trophy icon */}
            <motion.div
              className="text-6xl text-center mb-4"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🏆
            </motion.div>

            {/* Title */}
            <h2 className="text-2xl font-black text-center mb-2 text-gradient">
              {celebration.title}
            </h2>

            {/* Line count badge */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
                <span className="text-sm font-bold text-[var(--color-accent-yellow)]">
                  📝 {lineCount} lines of code
                </span>
              </div>
            </div>

            {/* Real Code Reveal */}
            <div className="bg-black/30 rounded-2xl p-5 mb-4 border border-white/5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)] mb-3">
                🔍 Real Code Reveal — {celebration.concept}
              </h3>
              <p className="text-sm text-white/80 leading-relaxed whitespace-pre-line">
                {celebration.explanation}
              </p>
            </div>

            {/* Optimization challenge */}
            {canOptimize && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center mb-4 p-3 rounded-xl bg-[var(--color-accent-purple)]/10 border border-[var(--color-accent-purple)]/20"
              >
                <p className="text-sm font-semibold text-[var(--color-accent-purple)]">
                  ✨ Can you reach the star in fewer lines?
                </p>
                <p className="text-xs text-white/50 mt-1">
                  Best possible: {optimalLines} lines
                </p>
              </motion.div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 mt-5">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onRetry}
                className="btn-secondary flex-1 text-sm"
              >
                Try Again
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onContinue}
                className="btn-primary flex-1 text-sm"
              >
                {canOptimize ? 'Continue Anyway →' : 'Next Stage →'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
