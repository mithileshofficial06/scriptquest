import { useRef, useEffect, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView, Decoration } from '@codemirror/view';
import { StateEffect, StateField } from '@codemirror/state';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════════════
   Line Highlight Extension for CodeMirror
   ═══════════════════════════════════════════════ */

const setHighlightLine = StateEffect.define();

const highlightLineField = StateField.define({
  create() {
    return { line: -1, type: 'executing' };
  },
  update(value, tr) {
    for (const e of tr.effects) {
      if (e.is(setHighlightLine)) {
        return e.value;
      }
    }
    return value;
  },
  provide(field) {
    return EditorView.decorations.from(field, (value) => {
      if (value.line <= 0) return Decoration.none;
      return (view) => {
        const doc = view.state.doc;
        if (value.line > doc.lines) return Decoration.none;
        const lineInfo = doc.line(value.line);
        const className = value.type === 'error' ? 'cm-error-line' : 'cm-executing-line';
        const deco = Decoration.line({ class: className });
        return Decoration.set([deco.range(lineInfo.from)]);
      };
    });
  },
});

/* ═══════════════════════════════════════════════
   Premium Code Editor Component
   ═══════════════════════════════════════════════ */
export default function CodeEditor({
  code,
  onCodeChange,
  onRun,
  isRunning,
  highlightLine,
  highlightType,
  availableFunctions,
  error,
  doorOpen,
  hasRandomDoor,
  suggestedPattern,
  funcNameInput,
  onFuncNameInputChange,
  onRefactor,
  hints,
  hintsUsed,
  onUseHint,
  solution,
  execSpeed,
  onSpeedChange,
}) {
  const editorRef = useRef(null);
  const viewRef = useRef(null);

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: setHighlightLine.of({
          line: highlightLine || -1,
          type: highlightType || 'executing',
        }),
      });
    }
  }, [highlightLine, highlightType]);

  const handleEditorCreate = useCallback((view) => {
    viewRef.current = view;
  }, []);

  // Premium dark theme
  const theme = EditorView.theme({
    '&': {
      backgroundColor: 'transparent',
      color: '#e2e0e8',
    },
    '.cm-content': {
      caretColor: 'var(--color-primary)',
      fontFamily: 'var(--font-code)',
    },
    '.cm-gutters': {
      backgroundColor: 'rgba(0, 0, 0, 0.15)',
      color: 'var(--color-text-dim)',
      borderRight: '1px solid var(--color-border)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'rgba(232, 185, 74, 0.06)',
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: 'var(--color-primary)',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
      backgroundColor: 'rgba(232, 185, 74, 0.1)',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(232, 185, 74, 0.02)',
    },
  }, { dark: true });

  const extensions = [
    theme,
    highlightLineField,
    EditorView.lineWrapping,
  ];

  return (
    <div id="code-editor-panel" className="flex flex-col h-full">
      {/* Editor chrome header */}
      <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#e06c75]/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#e8b94a]/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#98c379]/70" />
          <span className="ml-3 text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: 'var(--color-text-dim)' }}>
            Lua Editor
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md" style={{ background: 'var(--color-surface)' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: isRunning ? 'var(--color-primary)' : 'var(--color-accent-green)', animation: isRunning ? 'glowPulse 1s infinite' : 'none' }} />
          <span className="text-[10px] font-semibold" style={{ color: 'var(--color-text-dim)' }}>
            {isRunning ? 'Executing' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Available Commands */}
      <div className="px-5 py-3" style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(232, 185, 74, 0.01)' }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: 'var(--color-text-dim)' }}>
          Commands
        </p>
        <div className="flex flex-wrap gap-1.5">
          {availableFunctions.map((fn) => (
            <motion.span
              key={fn}
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              className="px-3 py-1.5 text-xs rounded-lg cursor-pointer select-none transition-all duration-200"
              style={{
                fontFamily: 'var(--font-code)',
                fontSize: '11px',
                background: 'var(--color-surface)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-border-accent)',
                fontWeight: 500,
              }}
              onClick={() => {
                if (!isRunning) {
                  onCodeChange(code + fn + '\n');
                }
              }}
            >
              {fn}
            </motion.span>
          ))}
        </div>
      </div>

      {/* Environment Variables */}
      {hasRandomDoor && (
        <div className="px-5 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--color-border)', background: 'rgba(232, 185, 74, 0.005)' }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--color-text-dim)' }}>
            Environment
          </p>
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg" style={{ background: 'var(--color-surface)' }}>
            <span className="font-code text-xs" style={{ color: 'var(--color-text-secondary)' }}>doorOpen = </span>
            <div className="flex items-center gap-1.5">
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: doorOpen ? 'var(--color-success)' : 'var(--color-danger)',
                  boxShadow: `0 0 6px ${doorOpen ? 'var(--color-success)' : 'var(--color-danger)'}`,
                  transition: 'background 0.3s, box-shadow 0.3s',
                }}
              />
              <span className="text-xs font-bold font-code uppercase" style={{ color: doorOpen ? 'var(--color-success)' : 'var(--color-danger)', transition: 'color 0.3s' }}>
                {doorOpen ? 'true' : 'false'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Refactoring Suggestion Card */}
      <AnimatePresence>
        {suggestedPattern && (
          <motion.div
            initial={{ opacity: 0, height: 0, margin: 0 }}
            animate={{ opacity: 1, height: 'auto', margin: '12px 16px 4px 16px' }}
            exit={{ opacity: 0, height: 0, margin: 0 }}
            className="p-4 rounded-xl border glow-border"
            style={{
              background: 'rgba(232, 185, 74, 0.03)',
              borderColor: 'var(--color-border-accent)',
              overflow: 'hidden',
            }}
          >
            <p className="text-xs font-bold text-gradient mb-1.5 flex items-center gap-1.5">
              <span>💡 Code Wizard Tip!</span>
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] mb-3 leading-relaxed">
              I noticed you are repeating this pattern 3 times! Want to turn it into a custom function?
            </p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {suggestedPattern.pattern.map((cmd, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded text-[10px] font-code"
                  style={{
                    background: 'var(--color-bg-dark)',
                    color: 'var(--color-primary)',
                    border: '1px solid var(--color-border)',
                  }}
                >
                  {cmd}()
                </span>
              ))}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Function name (e.g. hop)"
                value={funcNameInput}
                onChange={(e) => onFuncNameInputChange(e.target.value.replace(/[^a-zA-Z]/g, ''))}
                className="flex-1 px-3 py-2 rounded-lg text-xs font-code"
                style={{
                  background: 'var(--color-bg-dark)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  outline: 'none',
                }}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onRefactor}
                disabled={!funcNameInput.trim()}
                className="px-4 py-2 text-xs font-bold rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-soft) 100%)',
                  color: '#0a0a0f',
                  opacity: funcNameInput.trim() ? 1 : 0.5,
                  cursor: funcNameInput.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                Name It!
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editor Area */}
      <div className="flex-1 overflow-hidden min-h-0">
        <CodeMirror
          ref={editorRef}
          value={code}
          onChange={(val) => onCodeChange(val)}
          extensions={extensions}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightActiveLine: true,
            foldGutter: false,
            dropCursor: true,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: false,
            highlightSelectionMatches: false,
            searchKeymap: false,
          }}
          editable={!isRunning}
          onCreateEditor={handleEditorCreate}
          className="h-full"
        />
      </div>

      {/* Hint Display */}
      <AnimatePresence>
        {hints && hintsUsed > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-4 mt-3 overflow-hidden"
          >
            <div
              className="p-3 rounded-xl"
              style={{
                background: 'rgba(232, 185, 74, 0.04)',
                border: '1px solid rgba(232, 185, 74, 0.12)',
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">💡</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--color-primary)' }}>
                  {hintsUsed > hints.length ? 'Solution Answer' : `Hint ${hintsUsed} of ${hints.length}`}
                </span>
              </div>
              <div className="space-y-2">
                {hints.slice(0, Math.min(hintsUsed, hints.length)).map((hint, i) => (
                  <motion.p
                    key={i}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-xs leading-relaxed whitespace-pre-line"
                    style={{
                      color: (hintsUsed > hints.length ? i === hints.length - 1 : i === hintsUsed - 1) ? 'var(--color-text)' : 'var(--color-text-dim)',
                      paddingLeft: '8px',
                      borderLeft: `2px solid ${(hintsUsed > hints.length ? i === hints.length - 1 : i === hintsUsed - 1) ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    }}
                  >
                    {hint}
                  </motion.p>
                ))}

                {hintsUsed > hints.length && solution && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 rounded-lg border border-dashed border-[#e8b94a]/30 bg-[#e8b94a]/5"
                  >
                    <p className="text-xs font-bold text-yellow-400 mb-1">🔑 Exact Solution Code:</p>
                    <pre
                      onClick={() => {
                        navigator.clipboard.writeText(solution);
                        alert('Solution code copied to clipboard!');
                      }}
                      className="text-[10px] leading-relaxed font-mono text-[#e2e0e8] bg-[#0d0f14]/80 p-2.5 rounded border border-gray-800 overflow-x-auto select-all cursor-pointer hover:bg-[#0d0f14] transition-all"
                      title="Click to copy code"
                      style={{ whiteSpace: 'pre' }}
                    >
                      {solution}
                    </pre>
                    <p className="text-[9px] text-gray-400 mt-1">🖱️ Click on the code box to copy it!</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-3 p-3 rounded-xl"
          style={{
            background: 'rgba(224, 108, 117, 0.06)',
            border: '1px solid rgba(224, 108, 117, 0.15)',
          }}
        >
          <div className="flex items-start gap-2.5">
            <span className="text-base mt-0.5">⚠</span>
            <div>
              <p className="text-xs font-bold" style={{ color: 'var(--color-danger)' }}>
                Line {error.line}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{error.message}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Run Button + Hint Button */}
      <div className="p-4 flex flex-col gap-3" style={{ borderTop: '1px solid var(--color-border)' }}>
        {/* Speed Slider */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em]" style={{ color: 'var(--color-text-dim)' }}>
              Speed:
            </span>
            <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
              {execSpeed === 800 ? '🐌 Slow' : execSpeed === 450 ? '🚶 Normal' : execSpeed === 200 ? '⚡ Fast' : '🚀 Turbo'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="3"
            step="1"
            value={execSpeed === 800 ? 0 : execSpeed === 450 ? 1 : execSpeed === 200 ? 2 : 3}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              const speeds = [800, 450, 200, 60];
              onSpeedChange(speeds[val]);
              playClick();
            }}
            disabled={isRunning}
            className="w-28 accent-[#e8b94a] cursor-pointer h-1.5 rounded-lg appearance-none bg-[#111218]"
            style={{
              outline: 'none',
            }}
          />
        </div>

        <div className="flex gap-2">
          {/* Hint Button */}
          {hints && (hints.length > 0 || solution) && (() => {
            const maxHints = hints.length + (solution ? 1 : 0);
            const isExhausted = hintsUsed >= maxHints;
            const isReadyForSolution = hintsUsed === hints.length && solution;
            
            return (
              <motion.button
                id="hint-button"
                whileHover={{ scale: isExhausted ? 1 : 1.05 }}
                whileTap={{ scale: isExhausted ? 1 : 0.95 }}
                onClick={onUseHint}
                disabled={isExhausted || isRunning}
                className="relative flex items-center justify-center gap-1.5 px-4 rounded-xl text-xs font-bold transition-all duration-200"
                style={{
                  background: isExhausted
                    ? 'var(--color-surface)'
                    : isReadyForSolution
                      ? 'rgba(232, 185, 74, 0.12)'
                      : 'rgba(232, 185, 74, 0.06)',
                  border: `1.5px solid ${
                    isExhausted
                      ? 'var(--color-border)'
                      : isReadyForSolution
                        ? 'var(--color-primary)'
                        : 'var(--color-border-accent)'
                  }`,
                  color: isExhausted
                    ? 'var(--color-text-dim)'
                    : 'var(--color-primary)',
                  opacity: isExhausted ? 0.5 : 1,
                  cursor: isExhausted ? 'not-allowed' : 'pointer',
                  minWidth: '85px',
                }}
                animate={!isExhausted && !isRunning ? {
                  boxShadow: [
                    '0 0 0 0 rgba(232, 185, 74, 0)',
                    isReadyForSolution ? '0 0 16px rgba(232, 185, 74, 0.4)' : '0 0 12px rgba(232, 185, 74, 0.25)',
                    '0 0 0 0 rgba(232, 185, 74, 0)'
                  ]
                } : { boxShadow: 'none' }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <span className="text-base">{isReadyForSolution ? '🔑' : '💡'}</span>
                <span>
                  {isReadyForSolution ? 'Solution' : isExhausted ? '0' : (hints.length - hintsUsed)}
                </span>
              </motion.button>
            );
          })()}

          {/* Run button */}
          <motion.button
            id="run-button"
            whileHover={{ scale: isRunning ? 1 : 1.015 }}
            whileTap={{ scale: isRunning ? 1 : 0.985 }}
            onClick={onRun}
            disabled={isRunning}
            className="btn-primary shimmer-btn flex-1 text-sm flex items-center justify-center gap-3"
            style={{
              ...(isRunning ? {
                background: 'var(--color-surface)',
                color: 'var(--color-text-dim)',
                boxShadow: 'none',
                border: '1px solid var(--color-border)',
              } : {}),
            }}
          >
            {isRunning ? (
              <>
                <motion.div
                  className="w-4 h-4 rounded-full border-2 border-t-transparent"
                  style={{ borderColor: 'var(--color-text-dim)', borderTopColor: 'transparent' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
                Executing...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 1.5L12 7L3 12.5V1.5Z" fill="currentColor" />
                </svg>
                Run Code
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
