import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import GameWorld from './components/GameWorld';
import CodeEditor from './components/CodeEditor';
import ProgressBar from './components/ProgressBar';
import CelebrationOverlay from './components/CelebrationOverlay';
import ErrorOverlay from './components/ErrorOverlay';
import StageHeader from './components/StageHeader';
import { stages } from './data/stages';
import { parseLuaCode, simulateExecution } from './engine/luaEngine';
import { loadProgress, markStageComplete } from './engine/storage';

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

  // Ref to cancel running animation
  const cancelRef = useRef(false);

  // Reset level to starting state
  const resetLevel = useCallback(() => {
    if (!stage) return;
    setPlayerPos({ col: stage.playerStart.col, row: stage.playerStart.row });
    setIsRunning(false);
    setExecutingLine(-1);
    setHighlightType('executing');
    setShowCelebration(false);
    setShowError(null);
    setCodeError(null);
    setStarCollected(false);
    setShowParticles(false);
    setIsFailing(false);
    cancelRef.current = true;
  }, [stage]);

  // Run the code
  const handleRun = useCallback(() => {
    if (!stage || isRunning) return;

    // Reset state
    setShowError(null);
    setCodeError(null);
    setShowCelebration(false);
    setStarCollected(false);
    setShowParticles(false);
    setIsFailing(false);
    setExecutingLine(-1);
    setHighlightType('executing');
    cancelRef.current = false;

    // Parse the code
    const parseResult = parseLuaCode(code);
    if (parseResult.error) {
      setCodeError(parseResult.error);
      setExecutingLine(parseResult.error.line);
      setHighlightType('error');
      return;
    }

    // Simulate execution
    const simResult = simulateExecution(parseResult.commands, stage);
    const { steps } = simResult;

    // Count actual code lines (non-empty, non-comment)
    const codeLines = code.split('\n').filter(
      (l) => l.trim() && !l.trim().startsWith('--')
    ).length;
    setLineCount(codeLines);

    // Animate step-by-step
    setIsRunning(true);
    setPlayerPos({ col: stage.playerStart.col, row: stage.playerStart.row });

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

          // Save progress
          const newProgress = markStageComplete(currentStageId, codeLines);
          setProgress(newProgress);

          // Show celebration
          setShowCelebration(true);
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
            message: stage.errorMessages?.[step.errorType] || 'Something went wrong!',
          });
        }, 600);
        return;
      }

      stepIndex++;
      setTimeout(animateStep, STEP_DELAY_MS);
    };

    // Start after a short delay to let the reset animation play
    setTimeout(animateStep, 300);
  }, [stage, code, isRunning, currentStageId]);

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
    } else {
      // No more stages — just close the overlay
      setShowCelebration(false);
    }
  }, [currentStageId]);

  return (
    <div id="app-root" className="h-screen flex flex-col bg-[var(--color-bg-dark)]">
      {/* Main content area */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Game World (60%) */}
        <motion.div
          className="relative"
          style={{ width: '60%' }}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <StageHeader stage={stage} />
          <GameWorld
            stage={stage}
            playerPos={playerPos}
            executingLine={executingLine}
            isRunning={isRunning}
            starCollected={starCollected}
            showParticles={showParticles}
            isFailing={isFailing}
          />
        </motion.div>

        {/* Divider */}
        <div className="w-px bg-white/5" />

        {/* Right: Code Editor (40%) */}
        <motion.div
          className="bg-[var(--color-bg-editor)]"
          style={{ width: '40%' }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CodeEditor
            code={code}
            onCodeChange={setCode}
            onRun={handleRun}
            isRunning={isRunning}
            highlightLine={executingLine}
            highlightType={highlightType}
            availableFunctions={stage?.availableFunctions ?? []}
            error={codeError}
          />
        </motion.div>
      </div>

      {/* Bottom: Progress Bar */}
      <ProgressBar
        currentStageId={currentStageId}
        completedStages={progress.completedStages}
      />

      {/* Overlays */}
      <CelebrationOverlay
        show={showCelebration}
        celebration={stage?.celebration}
        lineCount={lineCount}
        optimalLines={stage?.optimalLines ?? 0}
        onContinue={handleContinue}
        onRetry={handleRetry}
      />

      <ErrorOverlay
        error={showError}
        stage={stage}
        onRetry={handleRetry}
      />
    </div>
  );
}
