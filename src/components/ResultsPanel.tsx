import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

type SymbolRow = {
  id: number;
  lexeme: string;
  type: string;
  line: number;
  column: number;
  length: number;
  scope: string;
};

type ParseError = { message?: string; line?: number; column?: number; type?: 'lexical' | 'syntactic' | 'runtime'; symbol?: string };

type AnalysisResult = {
  lexResult: { tokens: any[]; errors: unknown[] };
  symbolTable: SymbolRow[];
  cst: unknown;
  parseErrors: ParseError[];
  treeLines: string[];
  isValid: boolean;
  errorType: 'lexical' | 'syntactic' | 'runtime' | null;
  input?: string;
  line?: number;
};

export default function ResultsPanel({ results }: { results: AnalysisResult[] }) {
  return (
    <div className="mt-6 rounded-xl p-6" style={{ backgroundColor: '#1e1e1e', boxShadow: '0 2px 8px rgba(0,0,0,0.3)', border: '1px solid #2d2d2d' }}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Results</h3>
      <div className="space-y-6">
        {results.map((result, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">
                Line {result.line}: <code className="bg-gray-100 px-2 py-1 rounded text-sm">{result.input}</code>
              </h4>
              <div className="flex items-center gap-2">
                {result.isValid ? (
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <CheckCircleIcon className="h-4 w-4" />
                    ACCEPTED
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-600 font-medium">
                    <ExclamationCircleIcon className="h-4 w-4" />
                    REJECTED
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h5 className="font-medium text-gray-700 mb-2">Tokens ({result.lexResult.tokens.length})</h5>
                <div className="bg-gray-50 rounded p-3 max-h-40 overflow-auto">
                  {result.lexResult.tokens.map((token, i) => (
                    <div key={i} className="text-sm font-mono">
                      <span className="text-blue-600">{token.image}</span> :
                      <span className="text-gray-600 ml-1">{token.tokenType.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-700 mb-2">Symbols ({result.symbolTable.length})</h5>
                <div className="bg-gray-50 rounded p-3 max-h-40 overflow-auto">
                  {result.symbolTable.length > 0 ? (
                    <div className="text-sm">
                      <div className="grid grid-cols-3 gap-2 font-semibold text-gray-600 border-b pb-1 mb-1">
                        <span>ID</span>
                        <span>Lexeme</span>
                        <span>Type</span>
                      </div>
                      {result.symbolTable.map(symbol => (
                        <div key={symbol.id} className="grid grid-cols-3 gap-2 font-mono">
                          <span>{symbol.id}</span>
                          <span className="text-blue-600">{symbol.lexeme}</span>
                          <span className="text-gray-600">{symbol.type}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No symbols</div>
                  )}
                </div>
              </div>

              <div>
                <h5 className="font-medium text-gray-700 mb-2">Parse Tree</h5>
                <div className="bg-gray-50 rounded p-3 max-h-40 overflow-auto">
                  {result.treeLines.length > 0 ? (
                    <pre className="text-sm font-mono text-gray-700 whitespace-pre-wrap">
                      {result.treeLines.join('\n')}
                    </pre>
                  ) : (
                    <div className="text-sm text-gray-500">No parse tree</div>
                  )}
                </div>
              </div>
            </div>

            {result.parseErrors.length > 0 && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                <h5 className="font-medium text-red-700 mb-1">Errors</h5>
                <ul className="text-sm text-red-600">
                  {result.parseErrors.map((error, i) => (
                    <li key={i}>• {(error.type || 'error').toUpperCase()} at line {result.line}{error.column ? `, column ${error.column}` : ''}{error.symbol ? `, symbol "${error.symbol}"` : ''}: {error.message || JSON.stringify(error)}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


