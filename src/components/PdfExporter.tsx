import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import React from 'react';

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

type GeneratePdfArgs = {
  results: AnalysisResult[];
  input?: string;
  grammarRules?: string[];
  appName?: string;
  singlePage?: boolean;
};

//Generate a well-structured PDF report for the lexical analyzer.
export async function generatePdf({ results, input = '', appName = 'Lexical Analyzer', singlePage = false }: GeneratePdfArgs) {
  if (!results || results.length === 0) return;

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  const now = new Date();
  const generatedAt = now.toLocaleString();
  // --- Styles & helpers ---
  const headingColor: [number, number, number] = [30, 30, 30];

  const addHeaderFooter = (pageNum: number, pageCount: number) => {
    // Header
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'bold');
    doc.text(appName, margin, 30);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    doc.text(`Generated: ${generatedAt}`, pageWidth - margin, 30, { align: 'right' });

    // Thin underline
    doc.setDrawColor(230);
    doc.setLineWidth(0.5);
    doc.line(margin, 36, pageWidth - margin, 36);

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 28;
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`${appName} • ${generatedAt}`, margin, footerY);
    doc.text(`Page ${pageNum} / ${pageCount}`, pageWidth - margin, footerY, { align: 'right' });
  };

  // Start content on first page
  let cursorY = 60;

  // Input Section (boxed, monospace)
  doc.setFontSize(12);
  doc.setTextColor(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Input', margin, cursorY);
  cursorY += 20;

  const inputText = input || results.map(r => r.input || '').join('\n');
  const wrappedInput = doc.splitTextToSize(inputText, contentWidth - 12);

  // Draw rounded rectangle background for input
  const inputBoxY = cursorY + 4;
  const inputBoxHeight = Math.min(220, wrappedInput.length * 12 + 18);
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(margin - 6, inputBoxY - 8, contentWidth + 12, inputBoxHeight, 6, 6, 'F');

  // Monospace text
  doc.setFont('courier', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(40);
  doc.text(wrappedInput, margin, inputBoxY + 8);
  cursorY = inputBoxY + inputBoxHeight + 8;

  // Analysis Summary with small badges
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(20);
  doc.text('Analysis Summary', margin, cursorY);
  cursorY += 12;

  const totals = results.reduce(
    (acc, r) => ({
      tokens: acc.tokens + (r.lexResult?.tokens?.length || 0),
      errors: acc.errors + (r.parseErrors?.length || 0),
      warnings: acc.warnings + 0,
      lines: acc.lines + 1
    }),
    { tokens: 0, errors: 0, warnings: 0, lines: 0 }
  );

  const badge = (label: string, value: string, x: number) => {
    const w = doc.getTextWidth(`${label} ${value}`) + 18;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(x, cursorY, w, 18, 4, 4, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text(`${label} ${value}`, x + 8, cursorY + 13);
    return x + w + 10;
  };

  let badgeX = margin;
  badgeX = badge('Lines:', String(totals.lines), badgeX);
  badgeX = badge('Tokens:', String(totals.tokens), badgeX);
  badgeX = badge('Errors:', String(totals.errors), badgeX);
  badgeX = badge('Warnings:', String(totals.warnings), badgeX);
  cursorY += 50;

  // Token Table - prepare rows
  // Render per-line sections: Lexical Analysis, Symbol Table, Parse Tree
  if (!results || results.length === 0) {
    doc.text('No analysis results available.', margin, cursorY);
  } else {
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerReserve = 36 + 18;
  let linesRendered = 0;

    // Use one page per line if multiple lines and not forcing single page
    const useOnePagePerLine = results.length >= 2 && !singlePage;
    
    for (let i = 0; i < results.length; i++) {
      const res = results[i];
      
      // Start a new page for each line (except the first one) when useOnePagePerLine is true
      if (useOnePagePerLine && i > 0) {
        doc.addPage();
        cursorY = 60;
        // Add header/footer to the new page
        addHeaderFooter(i + 1, results.length); // +1 because page nums are 1-indexed
      }
      
      // Check page space when singlePage: stop if out of vertical space
      if (singlePage && cursorY > pageHeight - margin - footerReserve) {
        const remaining = results.length - linesRendered;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.text(`... ${remaining} line(s) omitted to fit single-page report`, margin, cursorY + 8);
        cursorY += 20;
        break;
      }

      // Line heading
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      const lineTitle = `Line ${res.line || i + 1}: "${res.input ?? ''}"`;
      doc.text(lineTitle, margin, cursorY);
      cursorY += 14;

      // --- Lexical Analysis Table for this line ---
      const tokens = res.lexResult?.tokens || [];
      if (tokens.length === 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('No tokens.', margin, cursorY);
        cursorY += 16;
      } else {
        // Show all tokens, no truncation
        let tokenRows = tokens.map((t: any) => [t.image ?? '', (t.tokenType && t.tokenType.name) || '', String(t.image ?? ''), t.startLine ?? res.line ?? '', t.startColumn ?? '']);

        autoTable(doc, {
          startY: cursorY,
          head: [['Token', 'Type', 'Value', 'Line', 'Col']],
          body: tokenRows,
          styles: { font: 'helvetica', fontSize: singlePage ? 8 : 10, cellPadding: 4 },
          headStyles: { fillColor: headingColor, textColor: 255 },
          margin: { left: margin, right: margin },
          columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 90 }, 2: { cellWidth: contentWidth - 260 }, 3: { cellWidth: 40 }, 4: { cellWidth: 40 } },
          didDrawPage: (data) => {
            const pageNum = data.pageNumber;
            const pageCount = doc.getNumberOfPages();
            addHeaderFooter(pageNum, pageCount);
          }
        });
  cursorY = (doc as any).lastAutoTable ? ((doc as any).lastAutoTable.finalY + 8) : (cursorY + (tokenRows.length + 1) * 12);
        cursorY += 8;
      }

      // --- Symbol Table for this line ---
      const symbols = res.symbolTable || [];
      if (symbols.length === 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('No symbols.', margin, cursorY);
        cursorY += 16;
      } else {
        // Show all symbols, no truncation
        let symRows = symbols.map((s: any) => [s.id ?? '', s.lexeme ?? '', s.type ?? '', s.line ?? '', s.column ?? '', s.length ?? '', s.scope ?? '']);

        autoTable(doc, {
          startY: cursorY,
          head: [['ID', 'Lexeme', 'Type', 'Line', 'Col', 'Len', 'Scope']],
          body: symRows,
          styles: { font: 'helvetica', fontSize: singlePage ? 8 : 10, cellPadding: 4 },
          headStyles: { fillColor: headingColor, textColor: 255 },
          margin: { left: margin, right: margin },
          columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 110 }, 2: { cellWidth: 70 }, 3: { cellWidth: 40 }, 4: { cellWidth: 40 }, 5: { cellWidth: 40 }, 6: { cellWidth: 60 } },
          didDrawPage: (data) => {
            const pageNum = data.pageNumber;
            const pageCount = doc.getNumberOfPages();
            addHeaderFooter(pageNum, pageCount);
          }
        });
  cursorY = (doc as any).lastAutoTable ? ((doc as any).lastAutoTable.finalY + 8) : (cursorY + (symRows.length + 1) * 12);
        cursorY += 8;
      }

      // --- Parse Tree (indented lines) ---
      const treeLines = res.treeLines || [];
      if (treeLines.length === 0) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('No parse tree available.', margin, cursorY);
        cursorY += 16;
      } else {
        // Show all tree lines regardless of page constraints
        let toShow = treeLines;
        autoTable(doc, {
          startY: cursorY,
          head: [['Parse Tree']],
          body: toShow.map((l: string) => [l]),
          styles: { font: 'courier', fontSize: singlePage ? 7 : 9, cellPadding: 3 },
          headStyles: { fillColor: headingColor, textColor: 255 },
          margin: { left: margin, right: margin },
          columnStyles: { 0: { cellWidth: contentWidth } },
          didDrawPage: (data) => {
            const pageNum = data.pageNumber;
            const pageCount = doc.getNumberOfPages();
            addHeaderFooter(pageNum, pageCount);
          }
        });
  cursorY = (doc as any).lastAutoTable ? ((doc as any).lastAutoTable.finalY + 8) : (cursorY + toShow.length * 12 + 8);
        cursorY += 8; // Add a bit more space after the parse tree
      }

      // spacing between lines
      cursorY += 18;
      linesRendered++;
    }
  }

  // Ensure header/footer on first page if table didn't trigger didDrawPage
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addHeaderFooter(i, pageCount);
  }

  const filename = `lexical_report_${now.toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

// Also export a lightweight React button component if consuming components want it
export default function PdfExporterButton({ results, input, grammarRules, children }: { results: AnalysisResult[]; input?: string; grammarRules?: string[]; children?: React.ReactNode }) {
  return (
    <button
      className="px-3 py-1 rounded bg-green-600 text-white"
      onClick={() => generatePdf({ results, input, grammarRules, appName: 'Compiler Playground' })}
    >
      {children ?? 'Export PDF'}
    </button>
  );
}
