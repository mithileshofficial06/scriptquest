import { useRef, useEffect, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView, Decoration } from '@codemirror/view';
import { StateEffect, StateField } from '@codemirror/state';
import { motion } from 'framer-motion';

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

      {/* Run Button */}
      <div className="p-4" style={{ borderTop: '1px solid var(--color-border)' }}>
        <motion.button
          id="run-button"
          whileHover={{ scale: isRunning ? 1 : 1.015 }}
          whileTap={{ scale: isRunning ? 1 : 0.985 }}
          onClick={onRun}
          disabled={isRunning}
          className="btn-primary w-full text-sm flex items-center justify-center gap-3"
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
  );
}
