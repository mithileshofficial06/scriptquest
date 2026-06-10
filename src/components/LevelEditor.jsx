import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TILE_SIZE, GRID_COLS, GRID_ROWS } from '../data/stages';

/* ═══════════════════════════════════════════════
   Tool definitions
   ═══════════════════════════════════════════════ */
const TOOLS = [
  { id: 'platform', label: 'Platform', icon: '🧱', tile: 1 },
  { id: 'empty', label: 'Erase', icon: '💨', tile: 0 },
  { id: 'start', label: 'Start', icon: '🏃', tile: -1 },
  { id: 'star', label: 'Star', icon: '⭐', tile: -2 },
];

/* ═══════════════════════════════════════════════
   Level Editor Component
   ═══════════════════════════════════════════════ */
export default function LevelEditor({
  grid,
  playerStart,
  starPosition,
  onGridChange,
  onPlayerStartChange,
  onStarPositionChange,
  onPlayLevel,
  onSaveLevel,
  onClearLevel,
}) {
  const [activeTool, setActiveTool] = useState('platform');
  const [isPainting, setIsPainting] = useState(false);

  const width = GRID_COLS * TILE_SIZE;
  const height = GRID_ROWS * TILE_SIZE;

  const handleTileAction = useCallback((col, row) => {
    const tool = TOOLS.find(t => t.id === activeTool);
    if (!tool) return;

    if (tool.id === 'start') {
      onPlayerStartChange({ col, row });
      return;
    }
    if (tool.id === 'star') {
      onStarPositionChange({ col, row });
      return;
    }

    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = tool.tile;
    onGridChange(newGrid);
  }, [activeTool, grid, onGridChange, onPlayerStartChange, onStarPositionChange]);

  const handleMouseDown = useCallback((col, row) => {
    setIsPainting(true);
    handleTileAction(col, row);
  }, [handleTileAction]);

  const handleMouseEnter = useCallback((col, row) => {
    if (isPainting) {
      handleTileAction(col, row);
    }
  }, [isPainting, handleTileAction]);

  const handleMouseUp = useCallback(() => {
    setIsPainting(false);
  }, []);

  return (
    <div
      className="relative w-full h-full flex flex-col"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Tool Palette */}
      <div
        className="flex items-center gap-2 px-5 py-3"
        style={{
          background: 'var(--color-bg-panel)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span
          className="text-[10px] font-bold uppercase tracking-[0.2em] mr-2"
          style={{ color: 'var(--color-text-dim)' }}
        >
          Tools
        </span>
        {TOOLS.map((tool) => (
          <motion.button
            key={tool.id}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTool(tool.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
            style={{
              background: activeTool === tool.id
                ? 'rgba(232, 185, 74, 0.12)'
                : 'var(--color-surface)',
              border: `1.5px solid ${activeTool === tool.id
                ? 'var(--color-primary)'
                : 'var(--color-border)'}`,
              color: activeTool === tool.id
                ? 'var(--color-primary)'
                : 'var(--color-text-secondary)',
            }}
          >
            <span>{tool.icon}</span>
            <span>{tool.label}</span>
          </motion.button>
        ))}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Action buttons */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onClearLevel}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text-dim)',
          }}
        >
          🗑️ Clear
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onSaveLevel}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border-accent)',
            color: 'var(--color-primary)',
          }}
        >
          💾 Save
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onPlayLevel}
          className="px-4 py-1.5 rounded-lg text-xs font-bold"
          style={{
            background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-soft) 100%)',
            color: '#0a0a0f',
            boxShadow: '0 2px 12px var(--color-primary-glow)',
          }}
        >
          ▶ Play My Level
        </motion.button>
      </div>

      {/* Grid Canvas */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden select-none"
        style={{
          background: `radial-gradient(ellipse at 50% 30%, var(--color-sky-mid) 0%, var(--color-sky-top) 50%, var(--color-bg-dark) 100%)`,
          cursor: activeTool === 'platform' ? 'cell' : activeTool === 'empty' ? 'crosshair' : 'pointer',
        }}
      >
        <svg
          viewBox={`-10 -20 ${width + 20} ${height + 30}`}
          className="max-w-full max-h-full"
          style={{ filter: 'drop-shadow(0 0 50px rgba(0,0,0,0.4))' }}
        >
          {/* Grid cells */}
          {grid.map((rowTiles, rowIdx) =>
            rowTiles.map((tile, colIdx) => {
              const x = colIdx * TILE_SIZE;
              const y = rowIdx * TILE_SIZE;
              const isPlatform = tile === 1;

              return (
                <g
                  key={`${rowIdx}-${colIdx}`}
                  onMouseDown={() => handleMouseDown(colIdx, rowIdx)}
                  onMouseEnter={() => handleMouseEnter(colIdx, rowIdx)}
                  style={{ cursor: 'inherit' }}
                >
                  {/* Background cell */}
                  <rect
                    x={x}
                    y={y}
                    width={TILE_SIZE}
                    height={TILE_SIZE}
                    fill={isPlatform ? '#1a1e24' : 'rgba(255,255,255,0.015)'}
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={0.5}
                  />
                  {/* Platform fill */}
                  {isPlatform && (
                    <>
                      <rect
                        x={x + 5} y={y + 12}
                        width={12} height={8} rx={1}
                        fill="rgba(255,255,255,0.02)"
                      />
                      <rect
                        x={x + 28} y={y + 25}
                        width={18} height={10} rx={1}
                        fill="rgba(255,255,255,0.015)"
                      />
                      {/* Top edge accent if air above */}
                      {(rowIdx === 0 || grid[rowIdx - 1]?.[colIdx] !== 1) && (
                        <rect
                          x={x} y={y}
                          width={TILE_SIZE} height={2}
                          fill="var(--color-primary)"
                          opacity={0.5}
                        />
                      )}
                    </>
                  )}
                </g>
              );
            })
          )}

          {/* Star marker */}
          <g>
            <circle
              cx={starPosition.col * TILE_SIZE + TILE_SIZE / 2}
              cy={starPosition.row * TILE_SIZE + TILE_SIZE / 2}
              r={18}
              fill="rgba(232,185,74,0.12)"
            >
              <animate attributeName="r" values="16;20;16" dur="2s" repeatCount="indefinite" />
            </circle>
            <text
              x={starPosition.col * TILE_SIZE + TILE_SIZE / 2}
              y={starPosition.row * TILE_SIZE + TILE_SIZE / 2 + 7}
              textAnchor="middle"
              fontSize="22"
            >
              ⭐
            </text>
          </g>

          {/* Player start marker */}
          <g>
            <rect
              x={playerStart.col * TILE_SIZE + 10}
              y={playerStart.row * TILE_SIZE + 5}
              width={TILE_SIZE - 20}
              height={TILE_SIZE - 10}
              rx={6}
              fill="rgba(232, 185, 74, 0.15)"
              stroke="var(--color-primary)"
              strokeWidth={2}
              strokeDasharray="4,3"
            >
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
            </rect>
            <text
              x={playerStart.col * TILE_SIZE + TILE_SIZE / 2}
              y={playerStart.row * TILE_SIZE + TILE_SIZE / 2 + 6}
              textAnchor="middle"
              fontSize="18"
            >
              🏃
            </text>
          </g>

          {/* Grid lines overlay for clarity */}
          {Array.from({ length: GRID_COLS + 1 }, (_, i) => (
            <line
              key={`v${i}`}
              x1={i * TILE_SIZE} y1={0}
              x2={i * TILE_SIZE} y2={height}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={0.5}
            />
          ))}
          {Array.from({ length: GRID_ROWS + 1 }, (_, i) => (
            <line
              key={`h${i}`}
              x1={0} y1={i * TILE_SIZE}
              x2={width} y2={i * TILE_SIZE}
              stroke="rgba(255,255,255,0.04)"
              strokeWidth={0.5}
            />
          ))}
        </svg>
      </div>

      {/* Bottom instructions */}
      <div
        className="px-5 py-2 text-center"
        style={{
          background: 'var(--color-bg-panel)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-dim)' }}>
          Click and drag to paint tiles • Place a start 🏃 and a star ⭐ • Then click <strong style={{ color: 'var(--color-primary)' }}>Play My Level</strong> to write code and solve it!
        </p>
      </div>
    </div>
  );
}
