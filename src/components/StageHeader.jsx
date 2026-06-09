import { motion } from 'framer-motion';

export default function StageHeader({ stage }) {
  if (!stage) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="absolute top-5 left-5 z-10"
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
    </motion.div>
  );
}
