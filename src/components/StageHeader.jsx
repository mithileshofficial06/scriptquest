import { motion } from 'framer-motion';

export default function StageHeader({ stage, onPrevStage, onNextStage, hasPrev, hasNext }) {
  if (!stage) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="absolute top-5 left-5 z-10 flex items-center gap-2"
    >
      <div
        className="glass-panel rounded-2xl px-4 py-3 flex items-center gap-3"
        style={{ border: '1px solid var(--color-border-accent)' }}
      >
        {/* Stage number badge */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm"
          style={{
            background: 'var(--color-primary)',
            color: 'var(--color-bg-dark)',
            boxShadow: '0 2px 12px var(--color-primary-glow)',
          }}
        >
          {stage.id}
        </div>

        <div>
          <h1 className="text-sm font-extrabold tracking-tight leading-tight" style={{ color: 'var(--color-text)' }}>
            {stage.name}
          </h1>
          <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-dim)' }}>
            {stage.description}
          </p>
        </div>
      </div>

      {/* Prev button */}
      {hasPrev && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onPrevStage}
          className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm glass-panel border border-[#e8b94a]/30 text-[#e8b94a] hover:bg-[#e8b94a]/10 transition-all cursor-pointer"
          title="Previous Stage"
        >
          ◀
        </motion.button>
      )}

      {/* Next button */}
      {hasNext && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNextStage}
          className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm glass-panel border border-[#e8b94a]/30 text-[#e8b94a] hover:bg-[#e8b94a]/10 transition-all cursor-pointer"
          title="Next Stage"
        >
          ▶
        </motion.button>
      )}
    </motion.div>
  );
}
