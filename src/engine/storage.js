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
