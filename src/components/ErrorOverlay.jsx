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
          style={{ background: 'rgba(4, 4, 8, 0.85)', backdropFilter: 'blur(10px)' }}
        >
          <motion.div
            initial={{ scale: 0.8, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
            className="glass-panel rounded-3xl p-8 max-w-sm w-full mx-4"
            style={{
              border: '1px solid rgba(224, 108, 117, 0.15)',
              boxShadow: '0 0 40px rgba(224, 108, 117, 0.08)',
            }}
          >
            {/* Icon */}
            <motion.div
              className="text-4xl text-center mb-4"
              animate={{ rotate: [0, -8, 8, -4, 0] }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              😅
            </motion.div>

            {/* Title */}
            <h2 className="text-lg font-black text-center mb-4" style={{ color: 'var(--color-danger)' }}>
              Oops!
            </h2>

            {/* Error detail */}
            <div
              className="rounded-xl p-4 mb-5"
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid var(--color-border)',
              }}
            >
              <p className="text-[11px] font-semibold mb-1.5" style={{ fontFamily: 'var(--font-code)', color: 'var(--color-text-dim)' }}>
                Line {error.line}
              </p>
              <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                {friendlyMessage}
              </p>
            </div>

            {/* Tip */}
            <p className="text-[11px] text-center mb-5" style={{ color: 'var(--color-text-dim)' }}>
              💡 Read through your commands and think about where
              the avatar is after each step.
            </p>

            {/* Retry */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onRetry}
              className="btn-primary w-full text-xs py-3"
            >
              Try Again
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
