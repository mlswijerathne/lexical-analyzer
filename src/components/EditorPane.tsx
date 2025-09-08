import Editor from '@monaco-editor/react';
import { PlayIcon, ArrowDownTrayIcon, DocumentDuplicateIcon } from '@heroicons/react/24/solid';
import { useEffect, useState } from 'react';

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

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text);

  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: '#1e1e1e', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', border: '1px solid #2d2d2d' }}>
      <div className="flex items-center justify-between mb-4">
        <label className="text-lg font-semibold">Input Expressions</label>
        <div className="flex gap-2">
          <button
            onClick={() => copyToClipboard(input)}
            className="px-3 py-1 border rounded-lg transition-colors"
            style={{ borderColor: '#3c3c3c' }}
          >
            <DocumentDuplicateIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <Editor
          height="300px"
          language="plaintext"
          value={input}
          onChange={(v) => setInput(v || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            renderWhitespace: 'none'
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

      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-3">
          <button
            onClick={analyze}
            disabled={processing || !input.trim()}
            className="px-6 py-3 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
            style={{ backgroundColor: '#0e639c' }}
          >
            <PlayIcon className="h-4 w-4" />
            {processing ? 'Analyzing...' : 'Analyze'}
          </button>
          <button
            onClick={downloadReport}
            disabled={!results}
            className="px-4 py-3 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            style={{ backgroundColor: '#388a34' }}
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Download Report
          </button>
        </div>
        <div className="text-sm" style={{ color: '#9aa0a6' }}>
          Lines: {input.split('\n').filter(l => l.trim()).length}
        </div>
      </div>
    </div>
  );
}


