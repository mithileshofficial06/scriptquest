import { motion, AnimatePresence } from 'framer-motion';
import { TILE_SIZE, TILE_PLATFORM, TILE_WALL, TILE_DOOR, GRID_COLS, GRID_ROWS } from '../data/stages';

/* ═══════════════════════════════════════════════════
   Premium SVG Avatar — refined Roblox-style character
   ═══════════════════════════════════════════════════ */
function Avatar({ col, row, isJumping, isFailing, direction }) {
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;

  return (
    <motion.g
      animate={{
        x,
        y,
        rotate: isFailing ? [0, -12, 12, -8, 0] : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 180,
        damping: 18,
        duration: 0.45,
      }}
    >
      {/* Drop shadow */}
      <ellipse
        cx={TILE_SIZE / 2}
        cy={TILE_SIZE - 1}
        rx={16}
        ry={3}
        fill="rgba(0,0,0,0.4)"
      />

      {/* Body — gradient fill */}
      <defs>
        <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e8b94a" />
          <stop offset="100%" stopColor="#c99630" />
        </linearGradient>
        <linearGradient id="headGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f5e6c8" />
          <stop offset="100%" stopColor="#e8d5a8" />
        </linearGradient>
        <linearGradient id="legGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2a2a3a" />
          <stop offset="100%" stopColor="#1a1a28" />
        </linearGradient>
      </defs>

      {/* Body */}
      <rect
        x={15} y={18} width={30} height={28} rx={4}
        fill="url(#bodyGrad)"
        stroke="#b8862a"
        strokeWidth={1.5}
      />
      {/* Body shine */}
      <rect
        x={17} y={20} width={8} height={12} rx={2}
        fill="rgba(255,255,255,0.15)"
      />

      {/* Head */}
      <rect
        x={12} y={2} width={36} height={20} rx={4}
        fill="url(#headGrad)"
        stroke="#c9b88a"
        strokeWidth={1.5}
      />

      {/* Eyes — darker, more expressive */}
      <rect
        x={direction === 'left' ? 17 : 21}
        y={8} width={7} height={8} rx={2}
        fill="#1a1a28"
      >
        <animate
          attributeName="height"
          values="8;2;8"
          dur="3.5s"
          repeatCount="indefinite"
          begin="1.5s"
        />
      </rect>
      <rect
        x={direction === 'left' ? 30 : 34}
        y={8} width={7} height={8} rx={2}
        fill="#1a1a28"
      >
        <animate
          attributeName="height"
          values="8;2;8"
          dur="3.5s"
          repeatCount="indefinite"
          begin="1.5s"
        />
      </rect>
      {/* Eye highlights */}
      <rect
        x={direction === 'left' ? 19 : 23}
        y={9} width={2} height={2} rx={1}
        fill="rgba(255,255,255,0.7)"
      />
      <rect
        x={direction === 'left' ? 32 : 36}
        y={9} width={2} height={2} rx={1}
        fill="rgba(255,255,255,0.7)"
      />

      {/* Mouth */}
      <path
        d={`M ${23} ${16} Q ${30} ${21} ${37} ${16}`}
        fill="none"
        stroke="#8a7a6a"
        strokeWidth={1.5}
        strokeLinecap="round"
      />

      {/* Arms */}
      <rect x={6} y={22} width={9} height={6} rx={3} fill="#d4a23a" stroke="#b8862a" strokeWidth={1} />
      <rect x={45} y={22} width={9} height={6} rx={3} fill="#d4a23a" stroke="#b8862a" strokeWidth={1} />

      {/* Legs */}
      <rect x={18} y={46} width={10} height={10} rx={3} fill="url(#legGrad)" />
      <rect x={32} y={46} width={10} height={10} rx={3} fill="url(#legGrad)" />

      {/* Shoes */}
      <rect x={16} y={54} width={14} height={4} rx={2} fill="#1a1a28" stroke="#2a2a3a" strokeWidth={0.5} />
      <rect x={30} y={54} width={14} height={4} rx={2} fill="#1a1a28" stroke="#2a2a3a" strokeWidth={0.5} />
    </motion.g>
  );
}

/* ═══════════════════════════════════════════
   Star Collectible — golden with warm glow
   ═══════════════════════════════════════════ */
function Star({ col, row, collected }) {
  const cx = col * TILE_SIZE + TILE_SIZE / 2;
  const cy = row * TILE_SIZE + TILE_SIZE / 2;

  return (
    <AnimatePresence>
      {!collected && (
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Outer glow */}
          <circle cx={cx} cy={cy} r={28} fill="rgba(232,185,74,0.06)">
            <animate attributeName="r" values="24;30;24" dur="3s" repeatCount="indefinite" />
          </circle>
          {/* Inner glow */}
          <circle cx={cx} cy={cy} r={18} fill="rgba(232,185,74,0.12)">
            <animate attributeName="r" values="16;20;16" dur="2s" repeatCount="indefinite" />
          </circle>
          {/* Star shape */}
          <motion.polygon
            points={starPoints(cx, cy, 15, 7)}
            fill="#e8b94a"
            stroke="#f0d78c"
            strokeWidth={1.5}
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
          {/* Sparkle highlights */}
          <circle cx={cx - 4} cy={cy - 5} r={1.5} fill="#fff" opacity={0.9}>
            <animate attributeName="opacity" values="0.9;0.2;0.9" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx={cx + 3} cy={cy + 2} r={1} fill="#f0d78c" opacity={0.6}>
            <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2.2s" repeatCount="indefinite" begin="0.5s" />
          </circle>
        </motion.g>
      )}
    </AnimatePresence>
  );
}

function starPoints(cx, cy, outerR, innerR) {
  const points = [];
  for (let i = 0; i < 5; i++) {
    const outerAngle = (Math.PI / 2) + (i * 2 * Math.PI / 5);
    const innerAngle = outerAngle + Math.PI / 5;
    points.push(`${cx + outerR * Math.cos(outerAngle)},${cy - outerR * Math.sin(outerAngle)}`);
    points.push(`${cx + innerR * Math.cos(innerAngle)},${cy - innerR * Math.sin(innerAngle)}`);
  }
  return points.join(' ');
}

/* ═══════════════════════════════════════════════════════
   Platform Tile — dark stone with subtle golden accents
   ═══════════════════════════════════════════════════════ */
function PlatformTile({ col, row, isTop }) {
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;

  return (
    <g>
      {/* Main block — dark stone */}
      <rect
        x={x} y={y}
        width={TILE_SIZE} height={TILE_SIZE}
        fill="#1a1e24"
        stroke="#12151a"
        strokeWidth={0.5}
      />
      {/* Subtle stone texture */}
      <rect x={x + 5} y={y + 12} width={12} height={8} rx={1} fill="rgba(255,255,255,0.02)" />
      <rect x={x + 28} y={y + 25} width={18} height={10} rx={1} fill="rgba(255,255,255,0.015)" />
      <rect x={x + 10} y={y + 38} width={15} height={8} rx={1} fill="rgba(255,255,255,0.02)" />

      {/* Top edge — golden accent line (only on topmost platform row) */}
      {isTop && (
        <>
          <rect
            x={x} y={y}
            width={TILE_SIZE} height={2}
            fill="var(--color-primary)"
            opacity={0.5}
          />
          <rect
            x={x} y={y + 2}
            width={TILE_SIZE} height={3}
            fill="rgba(232,185,74,0.1)"
          />
          {/* Small decorative notches */}
          <rect x={x + 10} y={y - 1} width={2} height={3} rx={1} fill="rgba(232,185,74,0.3)" />
          <rect x={x + 30} y={y - 2} width={2} height={4} rx={1} fill="rgba(232,185,74,0.25)" />
          <rect x={x + 48} y={y - 1} width={2} height={3} rx={1} fill="rgba(232,185,74,0.2)" />
        </>
      )}
    </g>
  );
}

/* ═══════════════════════════════════════════
   Roblox Door Tile — dynamic neon open/closed
   ═══════════════════════════════════════════ */
function DoorTile({ col, row, isOpen }) {
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;

  return (
    <g>
      {/* Door Frame — Neon glow */}
      <rect
        x={x + 2}
        y={y + 2}
        width={TILE_SIZE - 4}
        height={TILE_SIZE - 4}
        rx={6}
        fill="rgba(20, 20, 28, 0.95)"
        stroke={isOpen ? '#98c379' : '#e06c75'}
        strokeWidth={3}
        style={{
          filter: `drop-shadow(0 0 8px ${isOpen ? 'rgba(152, 195, 121, 0.4)' : 'rgba(224, 108, 117, 0.4)'})`,
          transition: 'stroke 0.4s, filter 0.4s',
        }}
      />

      {/* Door glass/energy screen */}
      <motion.rect
        x={x + 6}
        y={y + 6}
        width={TILE_SIZE - 12}
        height={TILE_SIZE - 12}
        rx={4}
        fill={isOpen ? 'rgba(152, 195, 121, 0.1)' : 'rgba(224, 108, 117, 0.85)'}
        animate={{
          opacity: isOpen ? [0.1, 0.2, 0.1] : [0.8, 0.95, 0.8],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{
          transition: 'fill 0.4s',
        }}
      />

      {/* Lock/Unlock Icon */}
      {!isOpen ? (
        <g transform={`translate(${x + TILE_SIZE / 2 - 8}, ${y + TILE_SIZE / 2 - 10})`}>
          <path
            d="M 4 7 V 4 A 4 4 0 0 1 12 4 V 7"
            fill="none"
            stroke="#ffffff"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <rect x={1} y={6} width={14} height={11} rx={2} fill="#ffffff" />
          <circle cx={8} cy={11} r={1.5} fill="#e06c75" />
        </g>
      ) : (
        <g transform={`translate(${x + TILE_SIZE / 2 - 8}, ${y + TILE_SIZE / 2 - 8})`}>
          <path
            d="M 2 8 L 6 12 L 14 4"
            fill="none"
            stroke="#ffffff"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      )}

      {/* Warning stripe at bottom */}
      <rect x={x + 8} y={y + TILE_SIZE - 8} width={TILE_SIZE - 16} height={3} fill="#1a1e24" />
    </g>
  );
}

/* ═══════════════════════════
   Ambient particles (dust)
   ═══════════════════════════ */
function AmbientParticle({ x, y, delay, size }) {
  return (
    <motion.circle
      cx={x} cy={y} r={size}
      fill="rgba(232,185,74,0.15)"
      animate={{
        cy: [y, y - 40, y - 80],
        opacity: [0, 0.3, 0],
        cx: [x, x + 10, x + 5],
      }}
      transition={{
        duration: 6 + Math.random() * 4,
        delay,
        repeat: Infinity,
        ease: 'easeOut',
      }}
    />
  );
}

/* ═══════════════════════════════════════════
   Particle burst on star collection
   ═══════════════════════════════════════════ */
function ParticleBurst({ x, y, active }) {
  if (!active) return null;
  const particles = Array.from({ length: 16 }, (_, i) => {
    const angle = (i / 16) * Math.PI * 2;
    const dist = 35 + Math.random() * 35;
    return {
      tx: Math.cos(angle) * dist,
      ty: Math.sin(angle) * dist,
      color: ['#e8b94a', '#f0d78c', '#c678dd', '#98c379', '#61afef', '#e06c75'][i % 6],
      size: 3 + Math.random() * 5,
    };
  });

  return (
    <g>
      {particles.map((p, i) => (
        <motion.rect
          key={i}
          x={x - p.size / 2}
          y={y - p.size / 2}
          width={p.size}
          height={p.size}
          rx={1}
          fill={p.color}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{
            opacity: 0,
            x: p.tx,
            y: p.ty,
            scale: 0,
            rotate: Math.random() * 360,
          }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
      ))}
    </g>
  );
}

/* ═════════════════════════════════
   Main GameWorld Component
   ═════════════════════════════════ */
export default function GameWorld({ stage, playerPos, executingLine, isRunning, starCollected, showParticles, isFailing, doorOpen }) {
  if (!stage) return null;

  const { grid, starPosition } = stage;
  const width = GRID_COLS * TILE_SIZE;
  const height = GRID_ROWS * TILE_SIZE;

  const direction = playerPos.col > (stage.playerStart?.col ?? 0) ? 'right' : 'left';

  return (
    <div
      id="game-world"
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at 50% 30%, var(--color-sky-mid) 0%, var(--color-sky-top) 50%, var(--color-bg-dark) 100%)`,
      }}
    >
      {/* Background stars — dim, elegant */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 40 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 2 + 0.5,
              height: Math.random() * 2 + 0.5,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 55}%`,
              opacity: Math.random() * 0.3 + 0.05,
              background: i % 7 === 0 ? 'rgba(232,185,74,0.5)' : 'rgba(255,255,255,0.4)',
              animation: `twinkle ${4 + Math.random() * 6}s infinite ${Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Subtle radial glow behind the game area */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: '60%',
          height: '60%',
          top: '15%',
          left: '20%',
          background: 'radial-gradient(ellipse, rgba(232,185,74,0.03) 0%, transparent 70%)',
        }}
      />

      <svg
        viewBox={`-10 -20 ${width + 20} ${height + 30}`}
        className="max-w-full max-h-full"
        style={{ filter: 'drop-shadow(0 0 50px rgba(0,0,0,0.4))' }}
      >
        {/* Ambient floating particles */}
        {Array.from({ length: 8 }, (_, i) => (
          <AmbientParticle
            key={i}
            x={60 + i * 80}
            y={height - 40}
            delay={i * 1.5}
            size={1 + Math.random()}
          />
        ))}

        {/* Grid tiles */}
        {grid.map((rowTiles, rowIdx) =>
          rowTiles.map((tile, colIdx) => {
            if (tile === TILE_PLATFORM) {
              // Determine if this is the topmost platform tile (air above)
              const isTop = rowIdx === 0 || grid[rowIdx - 1]?.[colIdx] !== TILE_PLATFORM;
              return <PlatformTile key={`${rowIdx}-${colIdx}`} col={colIdx} row={rowIdx} isTop={isTop} />;
            }
            if (tile === TILE_WALL) {
              return (
                <rect
                  key={`${rowIdx}-${colIdx}`}
                  x={colIdx * TILE_SIZE}
                  y={rowIdx * TILE_SIZE}
                  width={TILE_SIZE}
                  height={TILE_SIZE}
                  fill="#1a1e24"
                  stroke="#12151a"
                  strokeWidth={0.5}
                />
              );
            }
            if (tile === TILE_DOOR) {
              return (
                <DoorTile
                  key={`${rowIdx}-${colIdx}`}
                  col={colIdx}
                  row={rowIdx}
                  isOpen={doorOpen}
                />
              );
            }
            return null;
          })
        )}

        {/* Star */}
        <Star col={starPosition.col} row={starPosition.row} collected={starCollected} />

        {/* Particle burst */}
        <ParticleBurst
          x={starPosition.col * TILE_SIZE + TILE_SIZE / 2}
          y={starPosition.row * TILE_SIZE + TILE_SIZE / 2}
          active={showParticles}
        />

        {/* Avatar */}
        <Avatar
          col={playerPos.col}
          row={playerPos.row}
          isJumping={false}
          isFailing={isFailing}
          direction={direction}
        />

        {/* Executing line badge */}
        {isRunning && executingLine > 0 && (
          <>
            <motion.rect
              x={playerPos.col * TILE_SIZE + 7}
              y={playerPos.row * TILE_SIZE - 16}
              width={46}
              height={14}
              rx={7}
              fill="rgba(232, 185, 74, 0.85)"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
            />
            <motion.text
              x={playerPos.col * TILE_SIZE + 30}
              y={playerPos.row * TILE_SIZE - 6}
              textAnchor="middle"
              fill="#0a0a0f"
              fontSize="9"
              fontFamily="var(--font-code)"
              fontWeight="bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              L{executingLine}
            </motion.text>
          </>
        )}
      </svg>
    </div>
  );
}
