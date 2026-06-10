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
import SkinShop from './components/SkinShop';
import { stages } from './data/stages';
import { solutions } from './data/solutions';
import { parseLuaCode, simulateExecution, detectRepeatedPattern, refactorCodeWithFunction } from './engine/luaEngine';
import { loadProgress, markStageComplete, saveCustomLevel, loadCustomLevel, clearCustomLevel, awardBadge } from './engine/storage';
import { setSoundEnabled, playMove, playJump, playFail, playSuccess, playCoin, playClick, playDoor } from './engine/sound';


/* ===== Step animation timing ===== */
const STEP_DELAY_MS = 500;

export default function App() {
  // Game state
  const [progress, setProgress] = useState(() => loadProgress());
  const [currentStageId, setCurrentStageId] = useState(() => {
    const saved = localStorage.getItem('scriptquest_current_stage_id');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (parsed >= 1 && parsed <= stages.length) {
        return parsed;
      }
    }
    const p = loadProgress();
    return p.currentStage || 1;
  });
  const stage = stages.find((s) => s.id === currentStageId);

  // Player state
  const [playerPos, setPlayerPos] = useState({
    col: stage?.playerStart?.col ?? 0,
    row: stage?.playerStart?.row ?? 0,
  });

  // Code state
  const [code, setCode] = useState(() => {
    const s = stages.find((st) => st.id === currentStageId);
    if (!s) return '';
    const solInfo = solutions[s.id] || {};
    return solInfo.starterCode || s.starterCode || '';
  });

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

  // ═══════ Active traps state (Stages 8 & 10) ═══════
  const [activeTraps, setActiveTraps] = useState(new Set());

  // ═══════ Gamification & Customization states ═══════
  const [coins, setCoins] = useState(() => {
    return parseInt(localStorage.getItem('scriptquest_coins') || '0', 10);
  });
  const [unlockedSkins, setUnlockedSkins] = useState(() => {
    try {
      const saved = localStorage.getItem('scriptquest_unlocked_skins');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return ['default'];
  });
  const [selectedSkin, setSelectedSkin] = useState(() => {
    return localStorage.getItem('scriptquest_selected_skin') || 'default';
  });
  const [soundEnabled, setSoundEnabledState] = useState(() => {
    const saved = localStorage.getItem('scriptquest_sound_enabled');
    return saved !== 'false';
  });
  const [showSkinShop, setShowSkinShop] = useState(false);
  const [execSpeed, setExecSpeed] = useState(450); // Default speed (Normal = 450ms)
  const [lastCoinsGained, setLastCoinsGained] = useState(0);

  // Sync sound library value with state
  useEffect(() => {
    setSoundEnabled(soundEnabled);
    localStorage.setItem('scriptquest_sound_enabled', soundEnabled.toString());
  }, [soundEnabled]);

  const randomizeTraps = useCallback((s) => {
    if (!s || !s.hasTraps || !s.trapPositions) {
      setActiveTraps(new Set());
      return new Set();
    }
    const traps = new Set();
    s.trapPositions.forEach((col) => {
      if (Math.random() < 0.5) {
        traps.add(col);
      }
    });
    // Ensure at least one trap is active if possible
    if (traps.size === 0 && s.trapPositions.length > 0) {
      const randomIdx = Math.floor(Math.random() * s.trapPositions.length);
      traps.add(s.trapPositions[randomIdx]);
    }
    setActiveTraps(traps);
    return traps;
  }, []);

  // ═══════ Derived stage for active play ═══════
  // For bug hunt, we use the current bug's grid/positions.
  // For level editor in solve mode, we use the custom grid.
  const getActiveStage = useCallback(() => {
    if (!stage) return null;

    const solInfo = solutions[stage.id] || {};
    let finalHints = stage.hints || [];
    if ((!finalHints || finalHints.length === 0) && solInfo.hints) {
      finalHints = solInfo.hints;
    }
    const finalSolution = stage.solution || solInfo.solution || null;
    const finalDescription = solInfo.description || stage.description || '';

    if (stage.mode === 'bugHunt' && stage.bugs?.[currentBugIndex]) {
      const bug = stage.bugs[currentBugIndex];
      let bugHints = bug.hints || (solutions[stage.id]?.bugHints?.[bug.id]) || [];
      let bugSolution = bug.solution || (solutions[stage.id]?.bugSolutions?.[bug.id]) || null;
      
      if ((!bugHints || bugHints.length === 0) && bug.hint) {
        bugHints = [
          "💡 Check the editor carefully for bugs. What happens when the avatar runs the script?",
          "💡 Look at the lines highlighted in red or count the tiles where it goes wrong.",
          `💡 ${bug.hint}`
        ];
      }

      return {
        ...stage,
        ...bug,
        grid: bug.grid,
        playerStart: bug.playerStart,
        starPosition: bug.starPosition,
        hasRandomDoor: bug.hasRandomDoor || false,
        hints: bugHints,
        solution: bugSolution,
        description: bug.description || finalDescription,
      };
    }

    if (stage.mode === 'levelEditor' && editorMode === 'solving' && customGrid) {
      return {
        ...stage,
        grid: customGrid,
        playerStart: customPlayerStart || stage.playerStart,
        starPosition: customStarPosition || stage.starPosition,
        hints: finalHints,
        solution: finalSolution,
        description: finalDescription,
      };
    }

    return {
      ...stage,
      hints: finalHints,
      solution: finalSolution,
      description: finalDescription,
    };
  }, [stage, currentBugIndex, editorMode, customGrid, customPlayerStart, customStarPosition]);

  const activeStage = getActiveStage();

  // ═══════ Effects ═══════

  // Update active traps when level/bug changes
  useEffect(() => {
    randomizeTraps(activeStage);
  }, [currentStageId, currentBugIndex, editorMode, randomizeTraps]);

  // Randomize door state on stage change
  useEffect(() => {
    if (activeStage?.hasRandomDoor) {
      setDoorOpen(Math.random() < 0.5);
    } else {
      setDoorOpen(false);
    }
  }, [currentStageId, currentBugIndex]);

  // Persist current level ID to localStorage
  useEffect(() => {
    localStorage.setItem('scriptquest_current_stage_id', currentStageId);
  }, [currentStageId]);

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
      const solInfo = solutions[7] || {};
      setCode(saved.code || solInfo.starterCode || stage?.starterCode || '');
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

    randomizeTraps(activeStage);

    if (activeStage.hasRandomDoor) {
      setDoorOpen(Math.random() < 0.5);
    }
  }, [activeStage, randomizeTraps]);

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

    let currentTraps = activeTraps;
    if (activeStage.hasTraps) {
      currentTraps = randomizeTraps(activeStage);
    }

    // Parse the code
    const parseResult = parseLuaCode(code, { doorOpen: currentDoorOpen });
    if (parseResult.error) {
      setCodeError(parseResult.error);
      setExecutingLine(parseResult.error.line);
      setHighlightType('error');
      playFail();

      // Show hint for bug hunt on first failure
      if (stage?.mode === 'bugHunt' && !bugHintShown) {
        setBugHintShown(true);
      }
      return;
    }

    // Simulate execution
    const simResult = simulateExecution(parseResult.commands, activeStage, {
      doorOpen: currentDoorOpen,
      activeTraps: Array.from(currentTraps),
    });
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
          playFail();
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

      // Play synthesized sound effects per step action
      if (step.status === 'star') {
        playSuccess();
      } else if (step.status === 'error') {
        playFail();
      } else if (step.command === 'jump') {
        playJump();
      } else if (step.command === 'moveRight' || step.command === 'moveLeft' || step.command === 'moveUp' || step.command === 'moveDown') {
        playMove();
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
            
            // Award 10 coins for bug squash!
            setCoins((prev) => {
              const newCoins = prev + 10;
              localStorage.setItem('scriptquest_coins', newCoins.toString());
              return newCoins;
            });
            setLastCoinsGained(10);
            setTimeout(() => playCoin(), 250);
            
            setShowBugHuntOverlay(true);
          } else {
            // Calculate coins gained
            const isFirstCompletion = !progress.completedStages.includes(currentStageId);
            const isOptimal = codeLines <= (stage?.optimalLines || 0);
            const previouslyOptimal = progress.stageScores[currentStageId]?.bestLines <= (stage?.optimalLines || 0);

            let coinsGained = 0;
            if (isFirstCompletion) {
              coinsGained += 15;
            }
            if (isOptimal && !previouslyOptimal) {
              coinsGained += 20;
            }

            if (coinsGained > 0) {
              setCoins((prev) => {
                const newCoins = prev + coinsGained;
                localStorage.setItem('scriptquest_coins', newCoins.toString());
                return newCoins;
              });
              setLastCoinsGained(coinsGained);
              setTimeout(() => playCoin(), 250);
            } else {
              setLastCoinsGained(0);
            }

            // Normal stage success
            const newProgress = markStageComplete(currentStageId, codeLines);
            setProgress(newProgress);

            // Award badges for special stages
            let badge = null;
            if (stage?.mode === 'levelEditor') {
              badge = { name: 'Level Designer', icon: '🏗️' };
              awardBadge(badge);
            } else if (currentStageId === 10) {
              badge = { name: 'Flying Solo', icon: '🎖️' };
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
          let errMsg = activeStage.errorMessages?.[step.errorType] || 'Something went wrong!';
          
          if (currentStageId === 8 && step.errorType === 'trap') {
            if (!code.includes('isTrap')) {
              errMsg = activeStage.errorMessages?.trap || errMsg;
            } else {
              errMsg = (activeStage.errorMessages?.fall || errMsg).replace('line X', `line ${step.line}`);
            }
          }

          setShowError({
            line: step.line,
            errorType: step.errorType,
            message: errMsg,
          });
          // Show hint on failure in bug hunt
          if (stage?.mode === 'bugHunt' && !bugHintShown) {
            setBugHintShown(true);
          }
        }, 600);
        return;
      }

      stepIndex++;
      setTimeout(animateStep, execSpeed);
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
      const solInfo = solutions[nextStageId] || {};
      setCode(solInfo.starterCode || nextStage.starterCode || '');
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
    // Award coins for bug hunt completion
    setCoins((prev) => {
      const newCoins = prev + 15;
      localStorage.setItem('scriptquest_coins', newCoins.toString());
      return newCoins;
    });
    setLastCoinsGained(15);
    setTimeout(() => playCoin(), 300);
    // Show final celebration
    setShowCelebration(true);
  }, [currentStageId]);

  const handleSelectStage = useCallback((stageId) => {
    const targetStage = stages.find((s) => s.id === stageId);
    if (targetStage) {
      setCurrentStageId(stageId);
      setPlayerPos({
        col: targetStage.playerStart.col,
        row: targetStage.playerStart.row,
      });
      const solInfo = solutions[stageId] || {};
      setCode(solInfo.starterCode || targetStage.starterCode || '');
      setShowCelebration(false);
      setStarCollected(false);
      setShowParticles(false);
      setIsRunning(false);
      setExecutingLine(-1);
      setCodeError(null);
      setShowError(null);
      setCurrentBadge(null);
    }
  }, []);

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
    <div id="app-root" className="h-screen flex flex-col relative overflow-hidden" style={{ background: 'var(--color-bg-dark)' }}>
      {/* Background glowing auroras */}
      <div className="bg-blob bg-blob-primary" />
      <div className="bg-blob bg-blob-secondary" />

      {/* Top Header Bar */}
      <header className="glass-panel z-20 flex items-center justify-between px-6 py-2.5 border-b border-[rgba(255,255,255,0.06)]" style={{ background: 'rgba(10, 10, 15, 0.7)', backdropFilter: 'blur(12px)' }}>
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-xl">🚀</span>
          <div className="flex flex-col">
            <span className="font-black tracking-widest text-sm bg-gradient-to-r from-[#e8b94a] to-[#ffdd80] bg-clip-text text-transparent" style={{ textShadow: '0 0 10px rgba(232, 185, 74, 0.15)' }}>
              SCRIPTQUEST
            </span>
            <span className="text-[8px] uppercase font-bold tracking-wider text-[#e8b94a]/85">
              Roblox Coding Academy
            </span>
          </div>
        </div>

        {/* Controls, Coins and Shop */}
        <div className="flex items-center gap-4">
          {/* Coins Display */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/35 text-amber-400 font-extrabold text-xs shadow-[0_0_12px_rgba(245,158,11,0.15)]"
          >
            <span>🪙</span>
            <span>{coins} Coins</span>
          </motion.div>

          {/* Customize Avatar Button */}
          <motion.button 
            onClick={() => { playClick(); setShowSkinShop(true); }} 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/25 border border-purple-400/20 cursor-pointer flex items-center gap-1.5"
          >
            <span>👕</span>
            <span>Skin Shop</span>
          </motion.button>

          {/* Sound Toggle */}
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            onClick={() => setSoundEnabledState(prev => !prev)} 
            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 hover:bg-white/5 text-white/80 hover:text-white transition-all cursor-pointer text-xs"
            title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </motion.button>
        </div>
      </header>

      {/* Main content area */}
      <div className="flex flex-1 min-h-0 relative z-10">
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
              className="absolute top-5 left-5 z-10 flex flex-col gap-2"
            >
              <div className="flex items-center gap-2">
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

                {/* Prev button */}
                {currentStageId > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { playClick(); handleSelectStage(currentStageId - 1); }}
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm glass-panel border border-[#e8b94a]/30 text-[#e8b94a] hover:bg-[#e8b94a]/10 transition-all cursor-pointer"
                    title="Previous Stage"
                  >
                    ◀
                  </motion.button>
                )}

                {/* Next button */}
                {currentStageId < stages.length && (progress.completedStages.includes(currentStageId) || progress.completedStages.includes(currentStageId + 1) || currentStageId < progress.currentStage) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { playClick(); handleSelectStage(currentStageId + 1); }}
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm glass-panel border border-[#e8b94a]/30 text-[#e8b94a] hover:bg-[#e8b94a]/10 transition-all cursor-pointer"
                    title="Next Stage"
                  >
                    ▶
                  </motion.button>
                )}
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
                  onClick={() => { playClick(); handleBackToEditor(); }}
                  className="px-3 py-2 rounded-xl text-xs font-semibold glass-panel cursor-pointer"
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
            <StageHeader
              stage={activeStage}
              hasPrev={currentStageId > 1}
              hasNext={currentStageId < stages.length && (progress.completedStages.includes(currentStageId) || progress.completedStages.includes(currentStageId + 1) || currentStageId < progress.currentStage)}
              onPrevStage={() => { playClick(); handleSelectStage(currentStageId - 1); }}
              onNextStage={() => { playClick(); handleSelectStage(currentStageId + 1); }}
            />
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
              onPlayLevel={() => { playClick(); handlePlayLevel(); }}
              onSaveLevel={() => { playClick(); handleSaveCustomLevel(); }}
              onClearLevel={() => { playClick(); handleClearCustomLevel(); }}
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
              activeTraps={activeTraps}
              selectedSkin={selectedSkin}
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
            onUseHint={() => {
              playClick();
              setHintsUsed((prev) => {
                const hintsCount = activeStage?.hints?.length || 0;
                const hasSol = activeStage?.solution ? 1 : 0;
                return Math.min(prev + 1, hintsCount + hasSol);
              });
            }}
            solution={activeStage?.solution}
            execSpeed={execSpeed}
            onSpeedChange={setExecSpeed}
          />
        </motion.div>
      </div>

      {/* Bottom: Progress Bar */}
      <ProgressBar
        currentStageId={currentStageId}
        completedStages={progress.completedStages}
        onSelectStage={(id) => { playClick(); handleSelectStage(id); }}
      />

      {/* Overlays */}
      <CelebrationOverlay
        show={showCelebration}
        celebration={stage?.celebration}
        lineCount={lineCount}
        optimalLines={stage?.optimalLines ?? 0}
        lineCountChallenge={stage?.lineCountChallenge}
        onContinue={() => { playClick(); handleContinue(); }}
        onRetry={() => { playClick(); handleRetry(); }}
        badge={currentBadge}
        coinsGained={lastCoinsGained}
      />

      <BugHuntOverlay
        show={showBugHuntOverlay}
        bugData={currentBug}
        bugsSquashed={bugsSquashed}
        totalBugs={stage?.bugs?.length ?? 3}
        onNextBug={() => { playClick(); handleNextBug(); }}
        onComplete={handleBugHuntComplete}
        isLastBug={currentBugIndex >= (stage?.bugs?.length ?? 3) - 1}
      />

      <ErrorOverlay
        error={showError}
        stage={activeStage}
        onRetry={() => { playClick(); handleRetry(); }}
      />

      {/* Skin Shop Modal */}
      <SkinShop
        show={showSkinShop}
        onClose={() => setShowSkinShop(false)}
        coins={coins}
        setCoins={setCoins}
        unlockedSkins={unlockedSkins}
        setUnlockedSkins={setUnlockedSkins}
        selectedSkin={selectedSkin}
        setSelectedSkin={setSelectedSkin}
      />
    </div>
  );
}
