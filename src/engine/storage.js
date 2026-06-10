/**
 * localStorage helper for persisting game progress.
 */

const STORAGE_KEY = 'scriptquest_progress';

const DEFAULT_PROGRESS = {
  currentStage: 1,
  completedStages: [],
  stageScores: {}, // stageId -> { lines, bestLines, completed }
};

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to load progress from localStorage:', e);
  }
  return { ...DEFAULT_PROGRESS };
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn('Failed to save progress to localStorage:', e);
  }
}

export function markStageComplete(stageId, lineCount) {
  const progress = loadProgress();

  if (!progress.completedStages.includes(stageId)) {
    progress.completedStages.push(stageId);
  }

  const existing = progress.stageScores[stageId];
  progress.stageScores[stageId] = {
    completed: true,
    lines: lineCount,
    bestLines: existing ? Math.min(existing.bestLines, lineCount) : lineCount,
  };

  // Unlock next stage
  if (stageId >= progress.currentStage) {
    progress.currentStage = stageId + 1;
  }

  saveProgress(progress);
  return progress;
}

export function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  return { ...DEFAULT_PROGRESS };
}

/* ═══════════════════════════════════════════════
   Custom Level persistence (Stage 7)
   ═══════════════════════════════════════════════ */

const CUSTOM_LEVEL_KEY = 'scriptquest_custom_level';

const DEFAULT_CUSTOM_LEVEL = {
  grid: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  playerStart: { col: 1, row: 5 },
  starPosition: { col: 10, row: 5 },
  code: '-- Solve your own level!\n-- Write the code to reach the star.\n\n',
};

export function saveCustomLevel(levelData) {
  try {
    localStorage.setItem(CUSTOM_LEVEL_KEY, JSON.stringify(levelData));
  } catch (e) {
    console.warn('Failed to save custom level:', e);
  }
}

export function loadCustomLevel() {
  try {
    const raw = localStorage.getItem(CUSTOM_LEVEL_KEY);
    if (raw) {
      return { ...DEFAULT_CUSTOM_LEVEL, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to load custom level:', e);
  }
  return { ...DEFAULT_CUSTOM_LEVEL, grid: DEFAULT_CUSTOM_LEVEL.grid.map(r => [...r]) };
}

export function clearCustomLevel() {
  localStorage.removeItem(CUSTOM_LEVEL_KEY);
  return { ...DEFAULT_CUSTOM_LEVEL, grid: DEFAULT_CUSTOM_LEVEL.grid.map(r => [...r]) };
}

/* ═══════════════════════════════════════════════
   Badge tracking
   ═══════════════════════════════════════════════ */

const BADGES_KEY = 'scriptquest_badges';

export function loadBadges() {
  try {
    const raw = localStorage.getItem(BADGES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load badges:', e);
  }
  return [];
}

export function awardBadge(badge) {
  const badges = loadBadges();
  if (!badges.find((b) => b.name === badge.name)) {
    badges.push({ ...badge, earnedAt: Date.now() });
    try {
      localStorage.setItem(BADGES_KEY, JSON.stringify(badges));
    } catch (e) {
      console.warn('Failed to save badge:', e);
    }
  }
  return badges;
}
