import { useState } from 'react';
import EditorPane from './components/EditorPanel';
import ResultsPanel from './components/ResultsPanel';
import SidebarStats from './components/SidebarStats';
import HistoryPanel from './components/HistoryPanel';
import WelcomeSection from './components/WelcomeSection';
import Button from './components/Button';
import Footer from './components/Footer';
import { ClockIcon} from '@heroicons/react/24/solid';
import { addToHistory, type HistorySummary } from './utils/history';
import { generatePdf } from './components/PdfExporter';
import { createToken, Lexer, CstParser, type IToken } from 'chevrotain';


// -------------------- Define Tokens --------------------
const WhiteSpace = createToken({ name: 'WhiteSpace', pattern: /\s+/, group: Lexer.SKIPPED });
const Plus = createToken({ name: 'Plus', pattern: /\+/ });
const Minus = createToken({ name: 'Minus', pattern: /-/ });
const Multiply = createToken({ name: 'Multiply', pattern: /\*/ });
const Divide = createToken({ name: 'Divide', pattern: /\// });
const Equals = createToken({ name: 'Equals', pattern: /=/ });
const LParen = createToken({ name: 'LParen', pattern: /\(/ });
const RParen = createToken({ name: 'RParen', pattern: /\)/ });
const NumberLiteral = createToken({ name: 'NumberLiteral', pattern: /[0-9]+(?:\.[0-9]+)?/ });
const Identifier = createToken({ name: 'Identifier', pattern: /[a-zA-Z][a-zA-Z0-9]*/ });

const allTokens = [WhiteSpace, Plus, Minus, Multiply, Divide, Equals, LParen, RParen, NumberLiteral, Identifier];
const ExpressionLexer = new Lexer(allTokens, { positionTracking: 'full' });

// -------------------- Parser (CST) --------------------

// -------------------- Types --------------------
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
  lexResult: { tokens: IToken[]; errors: unknown[] };
  symbolTable: SymbolRow[];
  cst: unknown;
  parseErrors: ParseError[];
  treeLines: string[];
  isValid: boolean;
  errorType: 'lexical' | 'syntactic' | 'runtime' | null;
  input?: string;
  line?: number;
};

// History types removed per request

// -------------------- Utilities --------------------
function buildSymbolTable(tokenVector: IToken[]): SymbolRow[] {
  const table = new Map<string, SymbolRow>();
  let id = 1;
  for (const t of tokenVector) {
    if (t.tokenType.name === 'NumberLiteral' || t.tokenType.name === 'Identifier') {
      const key = t.image;
      if (!table.has(key)) {
        table.set(key, {
          id: id++,
          lexeme: key,
          type: t.tokenType.name,
          line: t.startLine || 1,
          column: t.startColumn || 1,
          length: key.length,
          scope: 'global'
        });
      }
    }
  }
  return Array.from(table.values());
}

function cstToIndentedLines(cstNode: any, depth = 0): string[] {
  if (!cstNode) return [];
  const indent = '  '.repeat(depth);
  const lines = [];
  
  if (cstNode.name) {
    lines.push(`${indent}${cstNode.name}`);
    if (cstNode.children) {
      for (const key of Object.keys(cstNode.children)) {
        const childArray = cstNode.children[key];
        for (const child of childArray) {
          if ((child as any).name) {
            lines.push(...cstToIndentedLines(child, depth + 1));
          } else if ((child as any).image) {
            lines.push(`${indent}  ${(child as any).tokenType.name}: "${(child as any).image}"`);
          }
        }
      }
    }
  }
  return lines;
}

function processMultilineInput(input: string): AnalysisResult[] {
  const lines = input.split('\n').filter(line => line.trim());
  const results: AnalysisResult[] = [];
  
  lines.forEach((line, index) => {
    if (line.trim()) {
      const lineResult = analyzeExpression(line.trim(), index + 1);
      results.push({
        line: index + 1,
        input: line.trim(),
        ...lineResult
      });
    }
  });
  
  return results;
}

function analyzeExpression(input: string, _lineNumber = 1): AnalysisResult {
  try {
    // Clear previous parser state
    parserInstance.reset();
    
    // Pre-analysis for better error detection
    const preAnalysisErrors = preAnalyzeInput(input);
    
    // Tokenize
    const lexResult = ExpressionLexer.tokenize(input);
    
    if (lexResult.errors.length > 0) {
      return {
        lexResult: { tokens: lexResult.tokens, errors: lexResult.errors },
        symbolTable: [],
        cst: null,
        parseErrors: (lexResult.errors as unknown[]).map(e => ({
          message: (e as any)?.message,
          line: (e as any)?.line || 1,
          column: (e as any)?.column || 1,
          type: 'lexical',
          symbol: ((e as any)?.column ? input[(e as any).column - 1] : undefined)
        })) as ParseError[],
        treeLines: [],
        isValid: false,
        errorType: 'lexical'
      };
    }

    // Build symbol table
    const symbolTable = buildSymbolTable(lexResult.tokens);

    // Enhanced parsing with better error recovery
    const parseResult = parseWithEnhancedErrorHandling(lexResult.tokens, input);
    
    // Combine pre-analysis errors with parse errors
    const allErrors = [...preAnalysisErrors, ...parseResult.errors];
    
    // Check if parsing was successful
    const isValid = allErrors.length === 0 && parseResult.cst && parseResult.cst.name;

    // Prepare visualization lines
    const treeLines = parseResult.cst ? cstToIndentedLines(parseResult.cst) : [];

    return {
      lexResult: { tokens: lexResult.tokens, errors: [] },
      symbolTable,
      cst: parseResult.cst,
      parseErrors: allErrors,
      treeLines,
      isValid,
      errorType: allErrors.length > 0 ? (allErrors[0].type || 'syntactic') : null
    };
  } catch (error) {
    return {
      lexResult: { tokens: [], errors: [] },
      symbolTable: [],
      cst: null,
      parseErrors: [{ message: (error as Error).message, line: 1, column: 1, type: 'runtime' }],
      treeLines: [],
      isValid: false,
      errorType: 'runtime'
    };
  }
}

function preAnalyzeInput(input: string): ParseError[] {
  const errors: ParseError[] = [];
  const chars = input.split('');
  
  // Check for operators at start or end
  const operators = ['+', '-', '*', '/'];
  const firstNonSpace = input.trim()[0];
  const lastNonSpace = input.trim()[input.trim().length - 1];
  
  if (operators.includes(firstNonSpace)) {
    const position = input.indexOf(firstNonSpace) + 1;
    errors.push({
      message: `Unexpected operator '${firstNonSpace}' at beginning of expression`,
      line: 1,
      column: position,
      type: 'syntactic',
      symbol: firstNonSpace
    });
  }
  
  if (operators.includes(lastNonSpace)) {
    const position = input.lastIndexOf(lastNonSpace) + 1;
    errors.push({
      message: `Unexpected operator '${lastNonSpace}' at end of expression`,
      line: 1,
      column: position,
      type: 'syntactic',
      symbol: lastNonSpace
    });
  }
  
  // Check for consecutive operators
  for (let i = 0; i < chars.length - 1; i++) {
    const current = chars[i];
    const next = chars[i + 1];
    
    if (operators.includes(current) && operators.includes(next)) {
      errors.push({
        message: `Consecutive operators '${current}${next}' are not allowed`,
        line: 1,
        column: i + 1,
        type: 'syntactic',
        symbol: current
      });
    }
  }
  
  // Check for unmatched parentheses
  let parenCount = 0;
  const parenStack: { char: string; pos: number }[] = [];
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    if (char === '(') {
      parenCount++;
      parenStack.push({ char, pos: i + 1 });
    } else if (char === ')') {
      parenCount--;
      if (parenCount < 0) {
        errors.push({
          message: `Unmatched closing parenthesis ')'`,
          line: 1,
          column: i + 1,
          type: 'syntactic',
          symbol: ')'
        });
        parenCount = 0; // Reset to continue checking
      } else {
        parenStack.pop();
      }
    }
  }
  
  // Check for unclosed parentheses
  parenStack.forEach(paren => {
    errors.push({
      message: `Unmatched opening parenthesis '('`,
      line: 1,
      column: paren.pos,
      type: 'syntactic',
      symbol: '('
    });
  });
  
  // Check for empty parentheses
  const emptyParenPattern = /\(\s*\)/g;
  let match;
  while ((match = emptyParenPattern.exec(input)) !== null) {
    errors.push({
      message: `Empty parentheses '()' are not allowed`,
      line: 1,
      column: match.index + 1,
      type: 'syntactic',
      symbol: '()'
    });
  }
  
  // Check for invalid characters
  const validChars = /^[a-zA-Z0-9+\-*/=()\s.]*$/;
  if (!validChars.test(input)) {
    for (let i = 0; i < chars.length; i++) {
      const char = chars[i];
      if (!/[a-zA-Z0-9+\-*/=()\s.]/.test(char)) {
        errors.push({
          message: `Invalid character '${char}'`,
          line: 1,
          column: i + 1,
          type: 'lexical',
          symbol: char
        });
      }
    }
  }
  
  return errors;
}

function parseWithEnhancedErrorHandling(tokens: IToken[], originalInput: string) {
  const errors: ParseError[] = [];
  let cst = null;
  
  try {
    parserInstance.input = tokens;
    cst = parserInstance.statement();
    
    // Get parser errors with enhanced messages
    const parserErrors = (parserInstance.errors || []).map((e: any) => {
      const errToken: IToken | undefined = e?.token as IToken | undefined;
      const isEOF = (errToken as any)?.tokenType?.name === 'EOF' || !errToken || (errToken as any)?.image === undefined;
      const lastToken = tokens[tokens.length - 1] as IToken | undefined;
      const line = errToken?.startLine ?? lastToken?.endLine ?? lastToken?.startLine ?? 1;
      const computedColumnFromLast = (lastToken?.endColumn ?? ((lastToken?.startColumn || 0) + ((lastToken?.image?.length || 1) - 1))) + 1;
      let column = errToken?.startColumn ?? (isEOF ? computedColumnFromLast : 1);
      if ((!column || column === 1) && lastToken) {
        column = computedColumnFromLast;
      }
      const symbol = errToken?.image ?? (isEOF ? 'EOF' : undefined);
      
      // Generate user-friendly error message
      const message = generateUserFriendlyErrorMessage(e, errToken, originalInput);
      
      return {
        message,
        line,
        column,
        type: 'syntactic' as const,
        symbol
      };
    });
    
    errors.push(...parserErrors);
    
  } catch (parseError) {
    errors.push({
      message: `Parse error: ${(parseError as Error).message}`,
      line: 1,
      column: 1,
      type: 'runtime',
      symbol: undefined
    });
  }
  
  return { cst, errors };
}

function generateUserFriendlyErrorMessage(_error: any, token: IToken | undefined, originalInput: string): string {
  const tokenImage = token?.image;
  const tokenType = token?.tokenType?.name;
  const position = token?.startColumn || 1;
  const char = originalInput[position - 1];
  
  // Common error patterns with friendly messages
  if (tokenImage === '*' || tokenImage === '/' || tokenImage === '+' || tokenImage === '-') {
    if (position === 1) {
      return `Expression cannot start with operator '${tokenImage}'`;
    }
    
    const prevChar = originalInput[position - 2];
    if (['+', '-', '*', '/'].includes(prevChar)) {
      return `Consecutive operators '${prevChar}${tokenImage}' are not allowed`;
    }
    
    if (position === originalInput.trim().length) {
      return `Expression cannot end with operator '${tokenImage}'`;
    }
    
    return `Unexpected operator '${tokenImage}' at position ${position}`;
  }
  
  if (tokenImage === '(' || tokenImage === ')') {
    if (tokenImage === ')') {
      return `Unmatched closing parenthesis ')'`;
    } else {
      return `Unmatched opening parenthesis '('`;
    }
  }
  
  if (tokenType === 'EOF' || !tokenImage) {
    const lastChar = originalInput.trim()[originalInput.trim().length - 1];
    if (['+', '-', '*', '/'].includes(lastChar)) {
      return `Expression cannot end with operator '${lastChar}'`;
    }
    return `Unexpected end of expression`;
  }
  
  if (char && !/[a-zA-Z0-9+\-*/=()\s.]/.test(char)) {
    return `Invalid character '${char}' at position ${position}`;
  }
  
  // Default fallback message
  return `Syntax error at position ${position}${tokenImage ? `: unexpected '${tokenImage}'` : ''}`;
}

// Enhanced parser class with better error recovery
class EnhancedExpressionParser extends CstParser {
  public assignment!: (idxInOriginal?: number) => any;
  public statement!: (idxInOriginal?: number) => any;
  public expression!: (idxInOriginal?: number) => any;
  public expressionPrime!: (idxInOriginal?: number) => any;
  public term!: (idxInOriginal?: number) => any;
  public termPrime!: (idxInOriginal?: number) => any;
  public factor!: (idxInOriginal?: number) => any;
  
  constructor() {
    super(allTokens, { 
      recoveryEnabled: true,
      maxLookahead: 3
    });

    const $ = this;

    $.RULE('statement', () => {
      $.OR([
        { ALT: () => { $.SUBRULE($.assignment); } },
        { ALT: () => { $.SUBRULE($.expression); } }
      ]);
    });

    $.RULE('assignment', () => {
      $.CONSUME(Identifier);
      $.CONSUME(Equals);
      $.SUBRULE($.expression);
    });

    $.RULE('expression', () => {
      $.SUBRULE($.term);
      $.SUBRULE($.expressionPrime);
    });

    $.RULE('expressionPrime', () => {
      $.MANY(() => {
        $.OR([
          { ALT: () => { $.CONSUME(Plus); } },
          { ALT: () => { $.CONSUME(Minus); } }
        ]);
        $.SUBRULE2($.term);
      });
    });

    $.RULE('term', () => {
      $.SUBRULE($.factor);
      $.SUBRULE($.termPrime);
    });

    $.RULE('termPrime', () => {
      $.MANY(() => {
        $.OR([
          { ALT: () => { $.CONSUME(Multiply); } },
          { ALT: () => { $.CONSUME(Divide); } }
        ]);
        $.SUBRULE2($.factor);
      });
    });

    $.RULE('factor', () => {
      $.OR([
        { ALT: () => { $.CONSUME(NumberLiteral); } },
        { ALT: () => { $.CONSUME(Identifier); } },
        { ALT: () => { 
          $.CONSUME(LParen); 
          $.SUBRULE($.expression); 
          $.CONSUME(RParen); 
        } }
      ]);
    });

    this.performSelfAnalysis();
  }
}

const parserInstance = new EnhancedExpressionParser();

// History management removed per request

// Samples removed per request

// -------------------- Main Component --------------------
export default function CompilerPlayground() {
  const [input, setInput] = useState<string>('3 + 4 * 5\n(a + b) * c\nx + y + z');
  const [results, setResults] = useState<AnalysisResult[] | null>(null);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  // Removed Grammar feature per request


  const analyze = async () => {
    if (!input.trim()) return;
    
    setProcessing(true);
    
    // Simulate processing time for better UX
    setTimeout(() => {
      const multilineResults = processMultilineInput(input);
      setResults(multilineResults);
      // Build a small summary and add to history (store input and stats)
      try {
        const summary: HistorySummary = multilineResults.reduce((acc, r) => ({
          tokens: acc.tokens + r.lexResult.tokens.length,
          symbols: acc.symbols + r.symbolTable.length,
          errors: acc.errors + r.parseErrors.length,
          valid: acc.valid + (r.isValid ? 1 : 0)
        }), { tokens: 0, symbols: 0, errors: 0, valid: 0 });

        addToHistory({ input, summary });
      } catch (e) {
        // ignore history errors
      }
      setProcessing(false);
    }, 300);
  };

  // Removed sample loader per request

  // History loading removed

  // clipboard handled in EditorPane

  const downloadReport = () => {
    if (!results) return;
    // Call centralized PDF generator, request single-page compact export
    generatePdf({ results, input, singlePage: true });
  };

  // markers handled in EditorPane

  const getTotalStats = () => {
    if (!results) return { tokens: 0, symbols: 0, errors: 0, valid: 0 };
    
    return results.reduce(
      (acc, result) => ({
        tokens: acc.tokens + result.lexResult.tokens.length,
        symbols: acc.symbols + result.symbolTable.length,
        errors: acc.errors + result.parseErrors.length,
        valid: acc.valid + (result.isValid ? 1 : 0)
      }),
      { tokens: 0, symbols: 0, errors: 0, valid: 0 }
    );
  };

  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-primary text-primary">
      {/* History Panel */}
      {showHistory && (
        <HistoryPanel 
          onClose={() => setShowHistory(false)} 
          onSelectItem={(historyInput) => {
            setInput(historyInput);
            setShowHistory(false);
          }} 
        />
      )}
      
      {/* Header */}
      <div className="border-b border-primary bg-secondary">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-primary">
                Compiler Playground
              </h1>
              <p className="text-lg mt-2 text-secondary">
                Professional Lexical Analyzer & Parser
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowHistory(true)}
                iconLeft={<ClockIcon className="h-4 w-4" />}
                variant="primary"
                size="md"
              >
                History
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
          {/* Input Section */}
          <div className="xl:col-span-3 space-y-6">
            <WelcomeSection 
              isVisible={showWelcome}
              onDismiss={() => setShowWelcome(false)}
              onSelectExample={(example) => {
                setInput(example);
                setShowWelcome(false);
              }}
            />
            <EditorPane
              input={input}
              setInput={setInput}
              analyze={analyze}
              processing={processing}
              results={results}
              downloadReport={downloadReport}
            />
            {results && <ResultsPanel results={results} />}
          </div>
          
          {/* Sidebar */}
          <div className="xl:col-span-1">
            <div className="sticky top-6 space-y-6 lg:space-y-8">
              <SidebarStats stats={stats} />

              {/* Grammar UI removed per request */}

              {/* Token Types */}
              <div className="card rounded-xl p-6">
                <h3 className="text-xl font-semibold mb-6 text-primary">Token Types</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-2 rounded-lg bg-tertiary hover-bg transition-colors">
                    <span className="font-mono font-medium accent-primary">NumberLiteral</span>
                    <span className="text-xs px-2 py-1 rounded bg-tertiary text-muted">0-9, decimals</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-tertiary hover-bg transition-colors">
                    <span className="font-mono font-medium text-secondary">Identifier</span>
                    <span className="text-xs px-2 py-1 rounded bg-tertiary text-muted">a-z, A-Z</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-tertiary hover-bg transition-colors">
                    <span className="font-mono font-medium text-secondary">Plus</span>
                    <span className="text-xs px-2 py-1 rounded bg-tertiary text-muted">+</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-tertiary hover-bg transition-colors">
                    <span className="font-mono font-medium text-secondary">Minus</span>
                    <span className="text-xs px-2 py-1 rounded bg-tertiary text-muted">-</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-tertiary hover-bg transition-colors">
                    <span className="font-mono font-medium text-secondary">Multiply</span>
                    <span className="text-xs px-2 py-1 rounded bg-tertiary text-muted">*</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-tertiary hover-bg transition-colors">
                    <span className="font-mono font-medium text-secondary">Divide</span>
                    <span className="text-xs px-2 py-1 rounded bg-tertiary text-muted">/</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-tertiary hover-bg transition-colors">
                    <span className="font-mono font-medium text-secondary">Equals</span>
                    <span className="text-xs px-2 py-1 rounded bg-tertiary text-muted">=</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded-lg bg-tertiary hover-bg transition-colors">
                    <span className="font-mono font-medium accent-error">Parentheses</span>
                    <span className="text-xs px-2 py-1 rounded bg-tertiary text-muted">( )</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer onOpenHistory={() => setShowHistory(true)} />
    </div>
  );
}