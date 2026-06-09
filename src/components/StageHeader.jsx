import { motion } from 'framer-motion';

export default function StageHeader({ stage }) {
  if (!stage) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-4 left-4 z-10 flex items-center gap-3"
    >
      {/* Stage badge */}
      <div className="glass-panel rounded-2xl px-4 py-2.5 flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent-purple))',
          }}
        >
          {stage.id}
        </div>
        <div>
          <h1 className="text-base font-extrabold tracking-tight leading-tight">
            {stage.name}
          </h1>
          <p className="text-xs text-white/50 font-semibold">
            {stage.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
