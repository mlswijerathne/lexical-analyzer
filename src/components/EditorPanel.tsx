import Editor from '@monaco-editor/react';
import { PlayIcon, ArrowDownTrayIcon, DocumentDuplicateIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';
import Button from './Button';
import KeyboardShortcuts from './KeyboardShortcuts';

type ParseError = { message?: string; line?: number; column?: number; type?: 'lexical' | 'syntactic' | 'runtime'; symbol?: string };
type AnalysisResult = {
  lexResult: { tokens: any[]; errors: unknown[] };
  symbolTable: any[];
  cst: unknown;
  parseErrors: ParseError[];
  treeLines: string[];
  isValid: boolean;
  errorType: 'lexical' | 'syntactic' | 'runtime' | null;
  input?: string;
  line?: number;
};

export default function EditorPane({
  input,
  setInput,
  analyze,
  processing,
  results,
  downloadReport
}: {
  input: string;
  setInput: (v: string) => void;
  analyze: () => void;
  processing: boolean;
  results: AnalysisResult[] | null;
  downloadReport: () => void;
}) {
  const [editorMounted, setEditorMounted] = useState<boolean>(false);
  const [monacoApi, setMonacoApi] = useState<any>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [showShortcuts, setShowShortcuts] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  useEffect(() => {
    if (!editorInstance || !monacoApi) return;
    
    // Add keyboard shortcuts
    editorInstance.addCommand(monacoApi.KeyMod.CtrlCmd | monacoApi.KeyCode.Enter, () => {
      if (!processing && input.trim()) {
        analyze();
      }
    });
    
    editorInstance.addCommand(monacoApi.KeyMod.CtrlCmd | monacoApi.KeyCode.KeyS, () => {
      if (results) {
        downloadReport();
      }
    });
    
    editorInstance.addCommand(monacoApi.KeyCode.F1, () => {
      setShowShortcuts(true);
    });
    
    // Add global F1 listener
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      // Open help (F1)
      if (e.key === 'F1') {
        e.preventDefault();
        setShowShortcuts(true);
        return;
      }

      // Close help (Escape)
      if (e.key === 'Escape') {
        setShowShortcuts(false);
        return;
      }

      // Cross-platform modifier detection (Ctrl on Windows/Linux, Meta on macOS)
      const mod = (e.ctrlKey || e.metaKey);

      // Save / Download report (Ctrl+S or Cmd+S) - prevent browser "Save page" dialog
      if (mod && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        if (results) {
          downloadReport();
        }
        return;
      }

      // Analyze (Ctrl+Enter / Cmd+Enter)
      if (mod && e.key === 'Enter') {
        e.preventDefault();
        if (!processing && input.trim()) {
          analyze();
        }
        return;
      }
    };
    
    window.addEventListener('keydown', handleGlobalKeydown);
    
    return () => {
      window.removeEventListener('keydown', handleGlobalKeydown);
    };
  }, [editorInstance, monacoApi, processing, input, analyze, results, downloadReport]);

  useEffect(() => {
    if (!editorInstance || !monacoApi) return;
    const model = editorInstance.getModel();
    if (!model) return;
    const markers: any[] = [];
    if (results) {
      results.forEach((res) => {
        if (res.parseErrors && res.parseErrors.length > 0) {
          res.parseErrors.forEach((e) => {
            const lineNumber = res.line || 1;
            const column = e.column || 1;
            markers.push({
              severity: monacoApi.MarkerSeverity.Error,
              message: `${(e.type || 'error').toUpperCase()}: ${e.message || 'Error'}`,
              startLineNumber: lineNumber,
              startColumn: column,
              endLineNumber: lineNumber,
              endColumn: Math.max(column + 1, column)
            });
          });
        }
      });
    }
    monacoApi.editor.setModelMarkers(model, 'analysis', markers);
  }, [results, editorInstance, monacoApi]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  return (
    <>
      <KeyboardShortcuts isVisible={showShortcuts} onClose={() => setShowShortcuts(false)} />
      
      <div className="rounded-xl p-6 shadow-xl border border-gray-700/50 bg-gradient-to-br from-gray-800 to-gray-900">
        <div className="flex items-center justify-between mb-6">
          <div>
            <label className="text-xl font-semibold text-white">Input Expressions</label>
            <p className="text-sm text-gray-400 mt-1">Enter mathematical expressions or variable assignments</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => copyToClipboard(input)}
              variant="secondary"
              size="sm"
              iconLeft={<DocumentDuplicateIcon className="h-4 w-4" />}
              aria-label="Copy to clipboard"
            >
              {copySuccess ? '✓ Copied!' : 'Copy'}
            </Button>
            <Button 
              onClick={() => setShowShortcuts(true)}
              variant="secondary"
              size="sm"
              iconLeft={<QuestionMarkCircleIcon className="h-4 w-4" />}
              aria-label="Show keyboard shortcuts"
            >
              Help (F1)
            </Button>
          </div>
        </div>

        <div className="border border-white-600/50 rounded-lg overflow-hidden shadow-inner bg-gray-900/50">
          <Editor
            height="320px"
            language="plaintext"
            value={input}
            onChange={(v) => setInput(v || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: 'JetBrains Mono, Consolas, Monaco, monospace',
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              renderWhitespace: 'none',
              lineNumbers: 'on',
              folding: false,
              renderLineHighlight: 'all',
              cursorBlinking: 'smooth',
              smoothScrolling: true,
              contextmenu: true,
              selectOnLineNumbers: true,
              automaticLayout: true
            }}
            onMount={(editor, monaco) => {
              setEditorInstance(editor);
              setMonacoApi(monaco);
              if (!editorMounted) {
                monaco.editor.setTheme('vs-dark');
                setEditorMounted(true);
              }
            }}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={analyze}
              disabled={processing || !input.trim()}
              iconLeft={<PlayIcon className="h-4 w-4" />}
              variant="primary"
              size="lg"
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Analyzing...
                </span>
              ) : (
                'Analyze (Ctrl+Enter)'
              )}
            </Button>
            <Button
              onClick={downloadReport}
              disabled={!results}
              iconLeft={<ArrowDownTrayIcon className="h-4 w-4" />}
              variant="success"
              size="md"
            >
              Download Report (Ctrl+S)
            </Button>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
               Lines: {input.split('\n').filter(l => l.trim()).length}
            </span>
            <span className="flex items-center gap-1">
               Characters: {input.length}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}


