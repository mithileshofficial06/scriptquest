import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import GameWorld from './components/GameWorld';
import CodeEditor from './components/CodeEditor';
import ProgressBar from './components/ProgressBar';
import CelebrationOverlay from './components/CelebrationOverlay';
import ErrorOverlay from './components/ErrorOverlay';
import StageHeader from './components/StageHeader';
import BugHuntOverlay from './components/BugHuntOverlay';
import LevelEditor from './components/LevelEditor';
import { stages } from './data/stages';
import { parseLuaCode, simulateExecution, detectRepeatedPattern, refactorCodeWithFunction } from './engine/luaEngine';
import { loadProgress, markStageComplete, saveCustomLevel, loadCustomLevel, clearCustomLevel, awardBadge } from './engine/storage';

/* ===== Step animation timing ===== */
const STEP_DELAY_MS = 500;

export default function App() {
  // Game state
  const [progress, setProgress] = useState(() => loadProgress());
  const [currentStageId, setCurrentStageId] = useState(1);
  const stage = stages.find((s) => s.id === currentStageId);

  // Player state
  const [playerPos, setPlayerPos] = useState({
    col: stage?.playerStart?.col ?? 0,
    row: stage?.playerStart?.row ?? 0,
  });

  // Code state
  const [code, setCode] = useState(stage?.starterCode ?? '');

  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [executingLine, setExecutingLine] = useState(-1);
  const [highlightType, setHighlightType] = useState('executing');

  // Overlay state
  const [showCelebration, setShowCelebration] = useState(false);
  const [showError, setShowError] = useState(null);
  const [codeError, setCodeError] = useState(null);
  const [starCollected, setStarCollected] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [isFailing, setIsFailing] = useState(false);
  const [lineCount, setLineCount] = useState(0);

  // Stage 4/5 environment & wizard states
  const [doorOpen, setDoorOpen] = useState(false);
  const [suggestedPattern, setSuggestedPattern] = useState(null);
  const [funcNameInput, setFuncNameInput] = useState('');

  // ═══════ Stage 6 — Bug Hunt state ═══════
  const [currentBugIndex, setCurrentBugIndex] = useState(0);
  const [bugsSquashed, setBugsSquashed] = useState(0);
  const [showBugHuntOverlay, setShowBugHuntOverlay] = useState(false);
  const [bugHintShown, setBugHintShown] = useState(false);
  const [currentBadge, setCurrentBadge] = useState(null);

  // ═══════ Stage 7 — Level Editor state ═══════
  const [editorMode, setEditorMode] = useState('editing'); // 'editing' | 'solving'
  const [customGrid, setCustomGrid] = useState(null);
  const [customPlayerStart, setCustomPlayerStart] = useState(null);
  const [customStarPosition, setCustomStarPosition] = useState(null);

  // Ref to cancel running animation
  const cancelRef = useRef(false);

  // ═══════ Hints state ═══════
  const [hintsUsed, setHintsUsed] = useState(0);

  // ═══════ Derived stage for active play ═══════
  // For bug hunt, we use the current bug's grid/positions.
  // For level editor in solve mode, we use the custom grid.
  const getActiveStage = useCallback(() => {
    if (!stage) return null;

    if (stage.mode === 'bugHunt' && stage.bugs?.[currentBugIndex]) {
      const bug = stage.bugs[currentBugIndex];
      return {
        ...stage,
        grid: bug.grid,
        playerStart: bug.playerStart,
        starPosition: bug.starPosition,
        hasRandomDoor: bug.hasRandomDoor || false,
      };
    }

    if (stage.mode === 'levelEditor' && editorMode === 'solving' && customGrid) {
      return {
        ...stage,
        grid: customGrid,
        playerStart: customPlayerStart || stage.playerStart,
        starPosition: customStarPosition || stage.starPosition,
      };
    }

    return stage;
  }, [stage, currentBugIndex, editorMode, customGrid, customPlayerStart, customStarPosition]);

  const activeStage = getActiveStage();

  // ═══════ Effects ═══════

  // Randomize door state on stage change
  useEffect(() => {
    if (activeStage?.hasRandomDoor) {
      setDoorOpen(Math.random() < 0.5);
    } else {
      setDoorOpen(false);
    }
  }, [currentStageId, currentBugIndex]);

  // Pattern detection for functions (Stage 5)
  useEffect(() => {
    if (currentStageId === 5) {
      const patternResult = detectRepeatedPattern(code);
      setSuggestedPattern(patternResult || null);
    } else {
      setSuggestedPattern(null);
    }
  }, [code, currentStageId]);

  // Load custom level on entering Stage 7
  useEffect(() => {
    if (currentStageId === 7) {
      const saved = loadCustomLevel();
      setCustomGrid(saved.grid);
      setCustomPlayerStart(saved.playerStart);
      setCustomStarPosition(saved.starPosition);
      setCode(saved.code || stage?.starterCode || '');
      setEditorMode('editing');
    }
  }, [currentStageId]);

  // Load bug on entering Stage 6
  useEffect(() => {
    if (stage?.mode === 'bugHunt') {
      setCurrentBugIndex(0);
      setBugsSquashed(0);
      setBugHintShown(false);
      if (stage.bugs?.[0]) {
        setCode(stage.bugs[0].buggyCode);
      }
    }
  }, [currentStageId]);

  // Reset hints when stage or bug index changes
  useEffect(() => {
    setHintsUsed(0);
  }, [currentStageId, currentBugIndex]);

  // ═══════ Handlers ═══════

  const handleRefactor = useCallback(() => {
    if (!suggestedPattern || !funcNameInput.trim()) return;
    const cleanName = funcNameInput.trim().replace(/[^a-zA-Z]/g, '');
    if (!cleanName) return;

    const refactoredCode = refactorCodeWithFunction(
      code,
      cleanName,
      suggestedPattern.pattern,
      suggestedPattern.occurrences
    );

    setCode(refactoredCode);
    setFuncNameInput('');
    setSuggestedPattern(null);
  }, [code, suggestedPattern, funcNameInput]);

  // Reset level to starting state
  const resetLevel = useCallback(() => {
    if (!activeStage) return;
    setPlayerPos({ col: activeStage.playerStart.col, row: activeStage.playerStart.row });
    setIsRunning(false);
    setExecutingLine(-1);
    setHighlightType('executing');
    setShowCelebration(false);
    setShowError(null);
    setCodeError(null);
    setStarCollected(false);
    setShowParticles(false);
    setIsFailing(false);
    setShowBugHuntOverlay(false);
    cancelRef.current = true;

    if (activeStage.hasRandomDoor) {
      setDoorOpen(Math.random() < 0.5);
    }
  }, [activeStage]);

  // Run the code
  const handleRun = useCallback(() => {
    if (!activeStage || isRunning) return;

    // Reset state
    setShowError(null);
    setCodeError(null);
    setShowCelebration(false);
    setStarCollected(false);
    setShowParticles(false);
    setIsFailing(false);
    setShowBugHuntOverlay(false);
    setExecutingLine(-1);
    setHighlightType('executing');
    cancelRef.current = false;

    let currentDoorOpen = doorOpen;
    if (activeStage.hasRandomDoor) {
      currentDoorOpen = Math.random() < 0.5;
      setDoorOpen(currentDoorOpen);
    }

    // Parse the code
    const parseResult = parseLuaCode(code, { doorOpen: currentDoorOpen });
    if (parseResult.error) {
      setCodeError(parseResult.error);
      setExecutingLine(parseResult.error.line);
      setHighlightType('error');

      // Show hint for bug hunt on first failure
      if (stage?.mode === 'bugHunt' && !bugHintShown) {
        setBugHintShown(true);
      }
      return;
    }

    // Simulate execution
    const simResult = simulateExecution(parseResult.commands, activeStage, { doorOpen: currentDoorOpen });
    const { steps } = simResult;

    // Count actual code lines (non-empty, non-comment)
    const codeLines = code.split('\n').filter(
      (l) => l.trim() && !l.trim().startsWith('--')
    ).length;
    setLineCount(codeLines);

    // Animate step-by-step
    setIsRunning(true);
    setPlayerPos({ col: activeStage.playerStart.col, row: activeStage.playerStart.row });

    let stepIndex = 0;

    const animateStep = () => {
      if (cancelRef.current) {
        setIsRunning(false);
        return;
      }

      if (stepIndex >= steps.length) {
        // Ran out of steps without reaching star — show hint
        setIsRunning(false);
        setExecutingLine(-1);
        if (!simResult.success) {
          setCodeError({
            line: steps[steps.length - 1]?.line || 1,
            message: "Your avatar ran out of commands but didn't reach the star! Add more commands.",
          });
          // Show hint on failure in bug hunt
          if (stage?.mode === 'bugHunt' && !bugHintShown) {
            setBugHintShown(true);
          }
        }
        return;
      }

      const step = steps[stepIndex];

      // Update position
      setPlayerPos({ col: step.col, row: step.row });

      // Highlight current line
      if (step.line > 0) {
        setExecutingLine(step.line);
        setHighlightType(step.status === 'error' ? 'error' : 'executing');
      }

      // Handle step result
      if (step.status === 'star') {
        // WIN!
        setStarCollected(true);
        setShowParticles(true);

        setTimeout(() => {
          setIsRunning(false);
          setExecutingLine(-1);

          if (stage?.mode === 'bugHunt') {
            // Bug hunt success — show bug hunt overlay
            const newCount = bugsSquashed + 1;
            setBugsSquashed(newCount);
            setShowBugHuntOverlay(true);
          } else {
            // Normal stage success
            const newProgress = markStageComplete(currentStageId, codeLines);
            setProgress(newProgress);

            // Award badges for special stages
            let badge = null;
            if (stage?.mode === 'levelEditor') {
              badge = { name: 'Level Designer', icon: '🏗️' };
              awardBadge(badge);
            }
            setCurrentBadge(badge);
            setShowCelebration(true);
          }
        }, 800);
        return;
      }

      if (step.status === 'error') {
        // ERROR - show error overlay
        setIsFailing(true);

        setTimeout(() => {
          setIsRunning(false);
          setShowError({
            line: step.line,
            errorType: step.errorType,
            message: activeStage.errorMessages?.[step.errorType] || 'Something went wrong!',
          });
          // Show hint on failure in bug hunt
          if (stage?.mode === 'bugHunt' && !bugHintShown) {
            setBugHintShown(true);
          }
        }, 600);
        return;
      }

      stepIndex++;
      setTimeout(animateStep, STEP_DELAY_MS);
    };

    // Start after a short delay to let the reset animation play
    setTimeout(animateStep, 300);
  }, [activeStage, stage, code, isRunning, currentStageId, doorOpen, bugsSquashed, bugHintShown]);

  // Handle retry
  const handleRetry = useCallback(() => {
    resetLevel();
  }, [resetLevel]);

  // Handle continue to next stage
  const handleContinue = useCallback(() => {
    const nextStageId = currentStageId + 1;
    const nextStage = stages.find((s) => s.id === nextStageId);

    if (nextStage && !nextStage.locked) {
      setCurrentStageId(nextStageId);
      setPlayerPos({
        col: nextStage.playerStart.col,
        row: nextStage.playerStart.row,
      });
      setCode(nextStage.starterCode);
      setShowCelebration(false);
      setStarCollected(false);
      setShowParticles(false);
      setIsRunning(false);
      setExecutingLine(-1);
      setCodeError(null);
      setShowError(null);
      setCurrentBadge(null);
    } else {
      // No more stages — just close the overlay
      setShowCelebration(false);
    }
  }, [currentStageId]);

  // ═══════ Bug Hunt handlers ═══════
  const handleNextBug = useCallback(() => {
    const nextIdx = currentBugIndex + 1;
    if (stage?.bugs?.[nextIdx]) {
      setCurrentBugIndex(nextIdx);
      setCode(stage.bugs[nextIdx].buggyCode);
      setBugHintShown(false);
      setShowBugHuntOverlay(false);
      setShowError(null);
      setCodeError(null);
      setStarCollected(false);
      setShowParticles(false);
      setExecutingLine(-1);
      // Reset player position to new bug's start
      setPlayerPos({
        col: stage.bugs[nextIdx].playerStart.col,
        row: stage.bugs[nextIdx].playerStart.row,
      });
    }
  }, [currentBugIndex, stage]);

  const handleBugHuntComplete = useCallback(() => {
    setShowBugHuntOverlay(false);
    // Award badge
    const badge = { name: 'Bug Squashed', icon: '🐛' };
    awardBadge(badge);
    setCurrentBadge(badge);
    // Mark stage complete
    const newProgress = markStageComplete(currentStageId, 0);
    setProgress(newProgress);
    // Show final celebration
    setShowCelebration(true);
  }, [currentStageId]);

  // ═══════ Level Editor handlers ═══════
  const handlePlayLevel = useCallback(() => {
    setEditorMode('solving');
    if (customPlayerStart) {
      setPlayerPos({ col: customPlayerStart.col, row: customPlayerStart.row });
    }
  }, [customPlayerStart]);

  const handleBackToEditor = useCallback(() => {
    setEditorMode('editing');
    setIsRunning(false);
    setExecutingLine(-1);
    setShowError(null);
    setCodeError(null);
    setStarCollected(false);
    setShowParticles(false);
    cancelRef.current = true;
  }, []);

  const handleSaveCustomLevel = useCallback(() => {
    saveCustomLevel({
      grid: customGrid,
      playerStart: customPlayerStart,
      starPosition: customStarPosition,
      code,
    });
  }, [customGrid, customPlayerStart, customStarPosition, code]);

  const handleClearCustomLevel = useCallback(() => {
    const fresh = clearCustomLevel();
    setCustomGrid(fresh.grid);
    setCustomPlayerStart(fresh.playerStart);
    setCustomStarPosition(fresh.starPosition);
    setCode(fresh.code);
  }, []);

  // ═══════ Determine what hint to show for bug hunt ═══════
  const currentBug = stage?.mode === 'bugHunt' ? stage.bugs?.[currentBugIndex] : null;

  // ═══════ Render ═══════
  const isLevelEditor = stage?.mode === 'levelEditor';
  const isBugHunt = stage?.mode === 'bugHunt';
  const showLevelEditor = isLevelEditor && editorMode === 'editing';

  return (
    <div id="app-root" className="h-screen flex flex-col" style={{ background: 'var(--color-bg-dark)' }}>
      {/* Main content area */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Game World or Level Editor (60%) */}
        <motion.div
          className="relative"
          style={{ width: '60%' }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Stage Header — customized for bug hunt */}
          {isBugHunt && currentBug ? (
            <motion.div
              key={currentBugIndex}
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="absolute top-5 left-5 z-10"
            >
              <div
                className="glass-panel rounded-2xl px-4 py-3 flex items-center gap-3"
                style={{ border: '1px solid rgba(224, 108, 117, 0.3)' }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
                  style={{
                    background: 'rgba(224, 108, 117, 0.12)',
                    border: '1.5px solid rgba(224, 108, 117, 0.3)',
                  }}
                >
                  🐛
                </div>
                <div>
                  <h1 className="text-sm font-extrabold tracking-tight leading-tight" style={{ color: 'var(--color-text)' }}>
                    {currentBug.title}
                  </h1>
                  <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-dim)' }}>
                    {currentBug.description}
                  </p>
                </div>
              </div>

              {/* Hint — shown after first failure */}
              {bugHintShown && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 glass-panel rounded-xl px-4 py-2"
                  style={{ border: '1px solid var(--color-border-accent)' }}
                >
                  <p className="text-xs" style={{ color: 'var(--color-primary)' }}>
                    💡 <strong>Hint:</strong> {currentBug.hint}
                  </p>
                </motion.div>
              )}
            </motion.div>
          ) : isLevelEditor && editorMode === 'solving' ? (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-5 left-5 z-10"
            >
              <div className="flex items-center gap-2">
                <div
                  className="glass-panel rounded-2xl px-4 py-3 flex items-center gap-3"
                  style={{ border: '1px solid var(--color-border-accent)' }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm"
                    style={{
                      background: 'var(--color-primary)',
                      color: 'var(--color-bg-dark)',
                      boxShadow: '0 2px 12px var(--color-primary-glow)',
                    }}
                  >
                    7
                  </div>
                  <div>
                    <h1 className="text-sm font-extrabold tracking-tight leading-tight" style={{ color: 'var(--color-text)' }}>
                      Solve Your Level
                    </h1>
                    <p className="text-[11px] font-medium" style={{ color: 'var(--color-text-dim)' }}>
                      Write code to reach the star!
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleBackToEditor}
                  className="px-3 py-2 rounded-xl text-xs font-semibold glass-panel"
                  style={{
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  ← Back to Editor
                </motion.button>
              </div>
            </motion.div>
          ) : !showLevelEditor ? (
            <StageHeader stage={stage} />
          ) : null}

          {/* Render game world or level editor */}
          {showLevelEditor ? (
            <LevelEditor
              grid={customGrid || stage.grid}
              playerStart={customPlayerStart || stage.playerStart}
              starPosition={customStarPosition || stage.starPosition}
              onGridChange={setCustomGrid}
              onPlayerStartChange={setCustomPlayerStart}
              onStarPositionChange={setCustomStarPosition}
              onPlayLevel={handlePlayLevel}
              onSaveLevel={handleSaveCustomLevel}
              onClearLevel={handleClearCustomLevel}
            />
          ) : (
            <GameWorld
              stage={activeStage}
              playerPos={playerPos}
              executingLine={executingLine}
              isRunning={isRunning}
              starCollected={starCollected}
              showParticles={showParticles}
              isFailing={isFailing}
              doorOpen={doorOpen}
            />
          )}
        </motion.div>

        {/* Gradient divider */}
        <div className="divider-v" />

        {/* Right: Code Editor (40%) */}
        <motion.div
          style={{ width: '40%', background: 'var(--color-bg-editor)' }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
        >
          <CodeEditor
            code={code}
            onCodeChange={setCode}
            onRun={showLevelEditor ? undefined : handleRun}
            isRunning={isRunning}
            highlightLine={executingLine}
            highlightType={highlightType}
            availableFunctions={stage?.availableFunctions ?? []}
            error={codeError}
            doorOpen={doorOpen}
            hasRandomDoor={activeStage?.hasRandomDoor}
            suggestedPattern={suggestedPattern}
            funcNameInput={funcNameInput}
            onFuncNameInputChange={setFuncNameInput}
            onRefactor={handleRefactor}
            hints={activeStage?.hints}
            hintsUsed={hintsUsed}
            onUseHint={() => setHintsUsed((prev) => Math.min(prev + 1, activeStage?.hints?.length || 3))}
          />
        </motion.div>
      </div>

      {/* Bottom: Progress Bar */}
      <ProgressBar
        currentStageId={currentStageId}
        completedStages={progress.completedStages}
        onSelectStage={(stageId) => {
          const targetStage = stages.find((s) => s.id === stageId);
          if (targetStage) {
            setCurrentStageId(stageId);
            setPlayerPos({
              col: targetStage.playerStart.col,
              row: targetStage.playerStart.row,
            });
            setCode(targetStage.starterCode || '');
            setShowCelebration(false);
            setStarCollected(false);
            setShowParticles(false);
            setIsRunning(false);
            setExecutingLine(-1);
            setCodeError(null);
            setShowError(null);
            setCurrentBadge(null);
          }
        }}
      />

      {/* Overlays */}
      <CelebrationOverlay
        show={showCelebration}
        celebration={stage?.celebration}
        lineCount={lineCount}
        optimalLines={stage?.optimalLines ?? 0}
        lineCountChallenge={stage?.lineCountChallenge}
        onContinue={handleContinue}
        onRetry={handleRetry}
        badge={currentBadge}
      />

      <BugHuntOverlay
        show={showBugHuntOverlay}
        bugData={currentBug}
        bugsSquashed={bugsSquashed}
        totalBugs={stage?.bugs?.length ?? 3}
        onNextBug={handleNextBug}
        onComplete={handleBugHuntComplete}
        isLastBug={currentBugIndex >= (stage?.bugs?.length ?? 3) - 1}
      />

      <ErrorOverlay
        error={showError}
        stage={activeStage}
        onRetry={handleRetry}
      />
    </div>
  );
}
