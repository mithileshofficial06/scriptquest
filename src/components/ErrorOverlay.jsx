import { motion, AnimatePresence } from 'framer-motion';

export default function ErrorOverlay({ error, stage, onRetry }) {
  const friendlyMessage = error
    ? stage?.errorMessages?.[error.errorType] || error.message || "Something went wrong!"
    : null;

  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(10, 10, 30, 0.8)', backdropFilter: 'blur(6px)' }}
        >
          <motion.div
            initial={{ scale: 0.7, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.7, y: 30 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="glass-panel rounded-3xl p-8 max-w-md w-full mx-4 border border-[var(--color-danger)]/30"
            style={{
              boxShadow: '0 0 40px rgba(255, 71, 87, 0.15)',
            }}
          >
            {/* Emoji */}
            <motion.div
              className="text-5xl text-center mb-4"
              animate={{ rotate: [0, -10, 10, -5, 0] }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              😅
            </motion.div>

            {/* Title */}
            <h2 className="text-xl font-black text-center text-[var(--color-danger)] mb-2">
              Oops!
            </h2>

            {/* Error message */}
            <div className="bg-black/20 rounded-xl p-4 mb-5">
              <p className="text-sm text-white/60 mb-1" style={{ fontFamily: 'var(--font-code)' }}>
                Line {error.line}:
              </p>
              <p className="text-base text-white/90 font-semibold">
                {friendlyMessage}
              </p>
            </div>

            {/* Tip */}
            <p className="text-xs text-center text-white/40 mb-5">
              💡 Tip: Read through your commands and think about where the avatar is
              after each step!
            </p>

            {/* Retry button */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={onRetry}
              className="btn-secondary w-full text-base"
            >
              Try Again! 🔄
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
