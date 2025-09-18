import { CheckCircleIcon, ExclamationCircleIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { useState, useEffect } from 'react';

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
  input?: string;
  line?: number;
};

const getTokenColor = (tokenType: string): string => {
  const colors: Record<string, string> = {
    'NumberLiteral': 'var(--accent-primary)',
    'Identifier': 'var(--text-secondary)', 
    'Plus': 'var(--text-secondary)',
    'Minus': 'var(--text-secondary)',
    'Multiply': 'var(--text-secondary)',
    'Divide': 'var(--text-secondary)',
    'Equals': 'var(--text-secondary)',
    'LParen': 'var(--accent-error)',
    'RParen': 'var(--accent-error)'
  };
  return colors[tokenType] || 'var(--text-muted)';
};

const getErrorColor = (errorType: string): string => {
  return 'var(--accent-error)';
};

export default function ResultsPanel({ results }: { results: AnalysisResult[] }) {
  // Initialize with error rows expanded automatically
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>(() => {
    const initial: Record<number, boolean> = {};
    results.forEach((result, index) => {
      // Auto-expand if there are parse errors or if the result is invalid
      initial[index] = result.parseErrors.length > 0 || !result.isValid;
    });
    return initial;
  });

  const toggleRow = (index: number) => {
    setExpandedRows(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // Update expanded state when results change
  useEffect(() => {
    const newExpanded: Record<number, boolean> = {};
    results.forEach((result, index) => {
      // Auto-expand if there are parse errors or if the result is invalid
      newExpanded[index] = result.parseErrors.length > 0 || !result.isValid;
    });
    setExpandedRows(newExpanded);
  }, [results]);

  const totalStats = results.reduce((acc, result) => ({
    tokens: acc.tokens + result.lexResult.tokens.length,
    symbols: acc.symbols + result.symbolTable.length,
    errors: acc.errors + result.parseErrors.length,
    valid: acc.valid + (result.isValid ? 1 : 0)
  }), { tokens: 0, symbols: 0, errors: 0, valid: 0 });

  return (
    <div className="card rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-xl font-semibold text-primary">Analysis Results</h3>
            <p className="text-sm text-secondary mt-1">
              {results.length} expressions analyzed • {totalStats.valid}/{results.length} valid
            </p>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="text-center">
              <div className="accent-primary font-semibold">{totalStats.tokens}</div>
              <div className="text-muted">Tokens</div>
            </div>
            <div className="text-center">
              <div className="text-secondary font-semibold">{totalStats.symbols}</div>
              <div className="text-muted">Symbols</div>
            </div>
            <div className="text-center">
              <div className="text-red-400 font-semibold">{totalStats.errors}</div>
              <div className="text-gray-400">Errors</div>
            </div>
          </div>
        </div>      <div className="space-y-4">
        {results.map((result, index) => (
          <div key={index} className="border border-gray-600/50 rounded-lg bg-gray-800/30 overflow-hidden">
            <div className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                <h4 className="font-medium text-white flex items-center gap-2 min-w-0">
                  <span className="text-gray-400">Line {result.line}:</span>
                  <code className="bg-gray-700/50 px-3 py-1 rounded-md text-sm font-mono border border-gray-600/30 truncate">
                    {result.input}
                  </code>
                </h4>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {result.isValid ? (
                    <span className="flex items-center gap-1 text-green-400 font-medium bg-green-400/10 px-3 py-1 rounded-full border border-green-400/20">
                      <CheckCircleIcon className="h-4 w-4" />
                      ACCEPTED
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-400 font-medium bg-red-400/10 px-3 py-1 rounded-full border border-red-400/20">
                      <ExclamationCircleIcon className="h-4 w-4" />
                      REJECTED
                    </span>
                  )}
                  <button
                    onClick={() => toggleRow(index)}
                    className="flex items-center gap-2 px-3 py-1 text-white hover:text-blue-400 transition-colors bg-gray-700/50 rounded-md border border-gray-600/30"
                  >
                    {expandedRows[index] ? (
                      <ChevronDownIcon className="h-4 w-4" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {expandedRows[index] ? 'Hide Details' : 'Show Details'}
                    </span>
                  </button>
                </div>
              </div>

              {!result.isValid && result.parseErrors.length > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-red-900/20 border border-red-500/30">
                  <h5 className="font-medium text-red-400 mb-2">Errors Detected:</h5>
                  <div className="space-y-2">
                    {result.parseErrors.map((error, errorIndex) => (
                      <div key={errorIndex} className="text-sm">
                        <div className="flex items-center gap-2">
                          <span 
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: `${getErrorColor(error.type || 'runtime')}20`,
                              color: getErrorColor(error.type || 'runtime'),
                              border: `1px solid ${getErrorColor(error.type || 'runtime')}40`
                            }}
                          >
                            {(error.type || 'error').toUpperCase()}
                          </span>
                          <span className="text-gray-300">{error.message}</span>
                        </div>
                        {error.column && (
                          <div className="text-gray-400 text-xs mt-1 ml-2">
                            Position: Column {error.column}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {expandedRows[index] && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <h5 className="font-medium text-white mb-3 flex items-center gap-2">
                      <span className="text-blue-400">Tokens ({result.lexResult.tokens.length})</span>
                    </h5>
                    <div className="bg-gray-900/50 rounded-lg p-3 max-h-48 overflow-auto border border-gray-600/30">
                      {result.lexResult.tokens.map((token, i) => (
                        <div key={i} className="text-sm font-mono flex items-center justify-between py-1">
                          <span 
                            className="font-semibold"
                            style={{ color: getTokenColor(token.tokenType.name) }}
                          >
                            "{token.image}"
                          </span>
                          <span className="text-gray-400 text-xs">{token.tokenType.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-white mb-3 flex items-center gap-2">
                      <span className="text-purple-400">Symbols ({result.symbolTable.length})</span>
                    </h5>
                    <div className="bg-gray-900/50 rounded-lg p-3 max-h-48 overflow-auto border border-gray-600/30">
                      {result.symbolTable.length > 0 ? (
                        <div className="text-sm">
                          <div className="grid grid-cols-3 gap-2 font-semibold text-gray-400 border-b border-gray-600/50 pb-2 mb-2">
                            <span>ID</span>
                            <span>Lexeme</span>
                            <span>Type</span>
                          </div>
                          {result.symbolTable.map(symbol => (
                            <div key={symbol.id} className="grid grid-cols-3 gap-2 font-mono py-1">
                              <span className="text-gray-300">{symbol.id}</span>
                              <span 
                                className="font-semibold"
                                style={{ color: getTokenColor(symbol.type) }}
                              >
                                {symbol.lexeme}
                              </span>
                              <span className="text-gray-400 text-xs">{symbol.type}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">No symbols detected</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-white mb-3 flex items-center gap-2">
                      <span className="text-green-400">Parse Tree</span>
                    </h5>
                    <div className="bg-gray-900/50 rounded-lg p-3 max-h-48 overflow-auto border border-gray-600/30">
                      {result.treeLines.length > 0 ? (
                        <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap">
                          {result.treeLines.join('\n')}
                        </pre>
                      ) : (
                        <div className="text-sm text-gray-500">No parse tree available</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


