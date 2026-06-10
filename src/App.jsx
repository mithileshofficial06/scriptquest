import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import GameWorld from './components/GameWorld';
import CodeEditor from './components/CodeEditor';
import ProgressBar from './components/ProgressBar';
import CelebrationOverlay from './components/CelebrationOverlay';
import ErrorOverlay from './components/ErrorOverlay';
import StageHeader from './components/StageHeader';
import { stages } from './data/stages';
import { parseLuaCode, simulateExecution, detectRepeatedPattern, refactorCodeWithFunction } from './engine/luaEngine';
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
  
  // Stage 4/5 environment & wizard states
  const [doorOpen, setDoorOpen] = useState(false);
  const [suggestedPattern, setSuggestedPattern] = useState(null);
  const [funcNameInput, setFuncNameInput] = useState('');

  // Randomize door state on stage change
  useEffect(() => {
    if (stage?.hasRandomDoor) {
      setDoorOpen(Math.random() < 0.5);
    } else {
      setDoorOpen(false);
    }
  }, [currentStageId, stage]);

  // Pattern detection for functions (Stage 5)
  useEffect(() => {
    if (currentStageId === 5) {
      const patternResult = detectRepeatedPattern(code);
      if (patternResult) {
        setSuggestedPattern(patternResult);
      } else {
        setSuggestedPattern(null);
      }
    } else {
      setSuggestedPattern(null);
    }
  }, [code, currentStageId]);

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

    if (stage.hasRandomDoor) {
      setDoorOpen(Math.random() < 0.5);
    }
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

    let currentDoorOpen = doorOpen;
    if (stage.hasRandomDoor) {
      currentDoorOpen = Math.random() < 0.5;
      setDoorOpen(currentDoorOpen);
    }

    // Parse the code
    const parseResult = parseLuaCode(code, { doorOpen: currentDoorOpen });
    if (parseResult.error) {
      setCodeError(parseResult.error);
      setExecutingLine(parseResult.error.line);
      setHighlightType('error');
      return;
    }

    // Simulate execution
    const simResult = simulateExecution(parseResult.commands, stage, { doorOpen: currentDoorOpen });
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
    <div id="app-root" className="h-screen flex flex-col" style={{ background: 'var(--color-bg-dark)' }}>
      {/* Main content area */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Game World (60%) */}
        <motion.div
          className="relative"
          style={{ width: '60%' }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
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
            doorOpen={doorOpen}
          />
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
            onRun={handleRun}
            isRunning={isRunning}
            highlightLine={executingLine}
            highlightType={highlightType}
            availableFunctions={stage?.availableFunctions ?? []}
            error={codeError}
            doorOpen={doorOpen}
            hasRandomDoor={stage?.hasRandomDoor}
            suggestedPattern={suggestedPattern}
            funcNameInput={funcNameInput}
            onFuncNameInputChange={setFuncNameInput}
            onRefactor={handleRefactor}
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
        lineCountChallenge={stage?.lineCountChallenge}
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
