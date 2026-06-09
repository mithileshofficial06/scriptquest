import { useRef, useEffect, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { EditorView, Decoration } from '@codemirror/view';
import { StateEffect, StateField } from '@codemirror/state';
import { motion } from 'framer-motion';

/* ===== Line Highlight Extension for CodeMirror ===== */

// State effect to set the highlighted line
const setHighlightLine = StateEffect.define();

// State field that tracks which line to highlight
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

/* ===== CodeEditor Component ===== */
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

  // Update highlight line when it changes
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

  // Dark theme matching our design system
  const theme = EditorView.theme({
    '&': {
      backgroundColor: 'transparent',
      color: '#e8e8f0',
    },
    '.cm-content': {
      caretColor: '#00d4ff',
      fontFamily: 'var(--font-code)',
    },
    '.cm-gutters': {
      backgroundColor: 'rgba(0, 0, 0, 0.2)',
      color: '#8888aa',
      borderRight: '1px solid rgba(255,255,255,0.05)',
    },
    '.cm-activeLineGutter': {
      backgroundColor: 'rgba(0, 212, 255, 0.1)',
    },
    '&.cm-focused .cm-cursor': {
      borderLeftColor: '#00d4ff',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
      backgroundColor: 'rgba(0, 212, 255, 0.15)',
    },
    '.cm-activeLine': {
      backgroundColor: 'rgba(0, 212, 255, 0.03)',
    },
  }, { dark: true });

  const extensions = [
    theme,
    highlightLineField,
    EditorView.lineWrapping,
  ];

  return (
    <div id="code-editor-panel" className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-3 text-sm font-semibold text-white/60 tracking-wide uppercase">
            Lua Editor
          </span>
        </div>
      </div>

      {/* Available Functions Reference */}
      <div className="px-4 py-2 border-b border-white/5 bg-white/[0.02]">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">
          Available Commands
        </p>
        <div className="flex flex-wrap gap-1.5">
          {availableFunctions.map((fn) => (
            <motion.span
              key={fn}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-2.5 py-1 text-xs rounded-lg cursor-pointer select-none
                         bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20
                         hover:bg-[var(--color-primary)]/20 transition-colors"
              style={{ fontFamily: 'var(--font-code)' }}
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-3 mb-3 p-3 rounded-xl bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30"
        >
          <div className="flex items-start gap-2">
            <span className="text-lg">😅</span>
            <div>
              <p className="text-sm font-bold text-[var(--color-danger)]">
                Oops! Line {error.line}:
              </p>
              <p className="text-sm text-white/80 mt-0.5">{error.message}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Run Button */}
      <div className="p-3 border-t border-white/5">
        <motion.button
          id="run-button"
          whileHover={{ scale: isRunning ? 1 : 1.02 }}
          whileTap={{ scale: isRunning ? 1 : 0.98 }}
          onClick={onRun}
          disabled={isRunning}
          className="btn-primary w-full text-lg flex items-center justify-center gap-3"
          style={{
            background: isRunning
              ? 'linear-gradient(135deg, #555, #444)'
              : undefined,
          }}
        >
          {isRunning ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="inline-block"
              >
                ⚙️
              </motion.span>
              Running...
            </>
          ) : (
            <>
              <span className="text-xl">▶</span>
              Run Code
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
