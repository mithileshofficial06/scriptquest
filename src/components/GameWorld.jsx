import { motion, AnimatePresence } from 'framer-motion';
import { TILE_SIZE, TILE_PLATFORM, TILE_WALL, GRID_COLS, GRID_ROWS } from '../data/stages';

/* ===== SVG Avatar Component — Roblox-style boxy character ===== */
function Avatar({ col, row, isJumping, isFailing, direction }) {
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;

  return (
    <motion.g
      animate={{
        x,
        y,
        rotate: isFailing ? [0, -15, 15, -10, 0] : 0,
      }}
      transition={{
        type: 'spring',
        stiffness: 200,
        damping: 20,
        duration: 0.4,
      }}
    >
      {/* Shadow */}
      <ellipse
        cx={TILE_SIZE / 2}
        cy={TILE_SIZE - 2}
        rx={18}
        ry={4}
        fill="rgba(0,0,0,0.3)"
      />
      {/* Body */}
      <rect
        x={15}
        y={18}
        width={30}
        height={28}
        rx={3}
        fill="#00d4ff"
        stroke="#0099cc"
        strokeWidth={2}
      />
      {/* Head */}
      <rect
        x={12}
        y={2}
        width={36}
        height={20}
        rx={3}
        fill="#ffd93d"
        stroke="#ccaa00"
        strokeWidth={2}
      />
      {/* Eyes */}
      <rect
        x={direction === 'left' ? 16 : 20}
        y={8}
        width={8}
        height={8}
        rx={1}
        fill="#1a1a2e"
      >
        <animate
          attributeName="height"
          values="8;2;8"
          dur="3s"
          repeatCount="indefinite"
          begin="1s"
        />
      </rect>
      <rect
        x={direction === 'left' ? 28 : 32}
        y={8}
        width={8}
        height={8}
        rx={1}
        fill="#1a1a2e"
      >
        <animate
          attributeName="height"
          values="8;2;8"
          dur="3s"
          repeatCount="indefinite"
          begin="1s"
        />
      </rect>
      {/* Smile */}
      <path
        d={`M ${22} ${16} Q ${30} ${22} ${38} ${16}`}
        fill="none"
        stroke="#1a1a2e"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Arms */}
      <rect x={5} y={22} width={10} height={6} rx={2} fill="#00bbdd" />
      <rect x={45} y={22} width={10} height={6} rx={2} fill="#00bbdd" />
      {/* Legs */}
      <rect x={18} y={46} width={10} height={10} rx={2} fill="#4a6741" />
      <rect x={32} y={46} width={10} height={10} rx={2} fill="#4a6741" />
      {/* Shoes */}
      <rect x={16} y={54} width={14} height={4} rx={2} fill="#333" />
      <rect x={30} y={54} width={14} height={4} rx={2} fill="#333" />
    </motion.g>
  );
}

/* ===== Star Collectible ===== */
function Star({ col, row, collected }) {
  const cx = col * TILE_SIZE + TILE_SIZE / 2;
  const cy = row * TILE_SIZE + TILE_SIZE / 2;

  return (
    <AnimatePresence>
      {!collected && (
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Glow */}
          <circle cx={cx} cy={cy} r={22} fill="rgba(255,217,61,0.2)">
            <animate
              attributeName="r"
              values="18;24;18"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          {/* Star shape */}
          <motion.polygon
            points={starPoints(cx, cy, 16, 8)}
            fill="#ffd93d"
            stroke="#ffaa00"
            strokeWidth={2}
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
          {/* Inner sparkle */}
          <circle cx={cx - 4} cy={cy - 4} r={2} fill="#fff" opacity={0.8}>
            <animate
              attributeName="opacity"
              values="0.8;0.2;0.8"
              dur="1.5s"
              repeatCount="indefinite"
            />
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

/* ===== Platform Tile ===== */
function PlatformTile({ col, row }) {
  const x = col * TILE_SIZE;
  const y = row * TILE_SIZE;

  return (
    <g>
      {/* Main block */}
      <rect
        x={x}
        y={y}
        width={TILE_SIZE}
        height={TILE_SIZE}
        fill="#4a6741"
        stroke="#3d5636"
        strokeWidth={1}
      />
      {/* Top grass strip */}
      <rect
        x={x}
        y={y}
        width={TILE_SIZE}
        height={6}
        fill="#6bcb77"
        rx={1}
      />
      {/* Grass tufts */}
      <rect x={x + 8} y={y - 3} width={3} height={5} rx={1} fill="#5daa68" />
      <rect x={x + 25} y={y - 4} width={3} height={6} rx={1} fill="#6bcb77" />
      <rect x={x + 42} y={y - 2} width={3} height={4} rx={1} fill="#5daa68" />
      {/* Dirt texture dots */}
      <circle cx={x + 15} cy={y + 30} r={2} fill="#3d5636" opacity={0.5} />
      <circle cx={x + 40} cy={y + 20} r={1.5} fill="#3d5636" opacity={0.4} />
      <circle cx={x + 30} cy={y + 45} r={2} fill="#3d5636" opacity={0.3} />
    </g>
  );
}

/* ===== Cloud decoration ===== */
function Cloud({ x, y, scale = 1 }) {
  return (
    <motion.g
      animate={{ x: [x, x + 30, x] }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
    >
      <g transform={`translate(${x}, ${y}) scale(${scale})`}>
        <ellipse cx={0} cy={0} rx={30} ry={16} fill="rgba(255,255,255,0.08)" />
        <ellipse cx={-20} cy={4} rx={20} ry={12} fill="rgba(255,255,255,0.06)" />
        <ellipse cx={22} cy={5} rx={18} ry={10} fill="rgba(255,255,255,0.06)" />
      </g>
    </motion.g>
  );
}

/* ===== Particle burst on star collection ===== */
function ParticleBurst({ x, y, active }) {
  if (!active) return null;
  const particles = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const dist = 40 + Math.random() * 30;
    return {
      tx: Math.cos(angle) * dist,
      ty: Math.sin(angle) * dist,
      color: ['#ffd93d', '#ff6b9d', '#00d4ff', '#6bcb77', '#a855f7'][i % 5],
      size: 4 + Math.random() * 4,
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
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      ))}
    </g>
  );
}

/* ===== Main GameWorld Component ===== */
export default function GameWorld({ stage, playerPos, executingLine, isRunning, starCollected, showParticles, isFailing }) {
  if (!stage) return null;

  const { grid, starPosition } = stage;
  const width = GRID_COLS * TILE_SIZE;
  const height = GRID_ROWS * TILE_SIZE;

  // Determine avatar facing direction from movement
  const direction = playerPos.col > (stage.playerStart?.col ?? 0) ? 'right' : 'left';

  return (
    <div
      id="game-world"
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{
        background: `linear-gradient(180deg, var(--color-sky-top) 0%, var(--color-sky-bottom) 60%, #1a1a2e 100%)`,
      }}
    >
      {/* Background stars */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              opacity: Math.random() * 0.5 + 0.1,
              animation: `blink ${3 + Math.random() * 4}s infinite ${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <svg
        viewBox={`-10 -20 ${width + 20} ${height + 30}`}
        className="max-w-full max-h-full"
        style={{ filter: 'drop-shadow(0 0 40px rgba(0,0,0,0.3))' }}
      >
        {/* Clouds */}
        <Cloud x={50} y={30} scale={1.2} />
        <Cloud x={300} y={15} scale={0.8} />
        <Cloud x={520} y={40} scale={1} />

        {/* Grid tiles */}
        {grid.map((rowTiles, rowIdx) =>
          rowTiles.map((tile, colIdx) => {
            if (tile === TILE_PLATFORM) {
              return <PlatformTile key={`${rowIdx}-${colIdx}`} col={colIdx} row={rowIdx} />;
            }
            if (tile === TILE_WALL) {
              return (
                <rect
                  key={`${rowIdx}-${colIdx}`}
                  x={colIdx * TILE_SIZE}
                  y={rowIdx * TILE_SIZE}
                  width={TILE_SIZE}
                  height={TILE_SIZE}
                  fill="#5a4a3a"
                  stroke="#4a3a2a"
                  strokeWidth={1}
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

        {/* Executing line indicator */}
        {isRunning && executingLine > 0 && (
          <motion.rect
            x={playerPos.col * TILE_SIZE + 5}
            y={playerPos.row * TILE_SIZE - 18}
            width={50}
            height={16}
            rx={8}
            fill="rgba(0, 212, 255, 0.9)"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
          >
          </motion.rect>
        )}
        {isRunning && executingLine > 0 && (
          <motion.text
            x={playerPos.col * TILE_SIZE + 30}
            y={playerPos.row * TILE_SIZE - 7}
            textAnchor="middle"
            fill="#fff"
            fontSize="10"
            fontFamily="var(--font-code)"
            fontWeight="bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            Line {executingLine}
          </motion.text>
        )}
      </svg>
    </div>
  );
}
