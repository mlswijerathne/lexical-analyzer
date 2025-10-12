import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import React from "react";
import {
  cstToMermaidGraph,
  generateSimpleMermaidTree,
} from "../utils/mermaidTree";

type ParseError = {
  message?: string;
  line?: number;
  column?: number;
  type?: "lexical" | "syntactic" | "runtime";
  symbol?: string;
};

type AnalysisResult = {
  lexResult: { tokens: any[]; errors: unknown[] };
  symbolTable: any[];
  cst: unknown;
  parseErrors: ParseError[];
  treeLines: string[];
  isValid: boolean;
  errorType: "lexical" | "syntactic" | "runtime" | null;
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

// Generate a well-structured PDF report for the lexical analyzer
export async function generatePdf({
  results,
  input = "",
  appName = "Lexical Analyzer",
  singlePage = false,
}: GeneratePdfArgs): Promise<void> {
  if (!results || results.length === 0) return;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  // Function to render Mermaid diagram as image using mermaid.ink
  const renderMermaidToImage = async (
    mermaidCode: string,
  ): Promise<string | null> => {
    try {
      // Enhance Mermaid configuration for better PDF rendering
      const enhancedMermaidCode = mermaidCode.replace(
        /^graph (TD|TB|LR)/m,
        'graph TB\n%%{init: {"theme":"default","themeVariables":{"fontSize":"14px","fontFamily":"Arial"},"flowchart":{"nodeSpacing":80,"rankSpacing":80,"padding":20}}}%%'
      );
      
      // Use mermaid.ink service to convert Mermaid to PNG
      const encodedDiagram = btoa(enhancedMermaidCode);
      const imgUrl = `https://mermaid.ink/img/${encodedDiagram}?type=png&theme=default`;

      // Create a temporary image to get the data URL
      const img = new Image();
      return new Promise((resolve) => {
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Add padding for better appearance
            const padding = 20;
            canvas.width = img.width + padding * 2;
            canvas.height = img.height + padding * 2;
            
            // White background
            ctx.fillStyle = "white";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Draw image with padding
            ctx.drawImage(img, padding, padding);
            resolve(canvas.toDataURL("image/png"));
          } else {
            resolve(null);
          }
        };
        img.onerror = () => resolve(null);
        img.crossOrigin = "anonymous";
        img.src = imgUrl;
      });
    } catch (error) {
      console.warn("Failed to render Mermaid diagram:", error);
      return null;
    }
  };

  const now = new Date();
  const generatedAt = now.toLocaleString();
  
  // --- Styles & helpers ---
  const headingColor: [number, number, number] = [30, 30, 30];
  
  // Track which pages have headers/footers to avoid duplicate rendering (causes blur)
  const pagesWithHeaders = new Set<number>();

  const addHeaderFooter = (pageNum: number, pageCount: number) => {
    // Skip if this page already has a header/footer
    if (pagesWithHeaders.has(pageNum)) {
      return;
    }
    pagesWithHeaders.add(pageNum);
    
    // Header
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.setFont("helvetica", "bold");
    doc.text(appName, margin, 30);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text(`Generated: ${generatedAt}`, pageWidth - margin, 30, {
      align: "right",
    });

    // Thin underline
    doc.setDrawColor(230);
    doc.setLineWidth(0.5);
    doc.line(margin, 36, pageWidth - margin, 36);

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 28;
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text(`${appName} • ${generatedAt}`, margin, footerY);
    doc.text(`Page ${pageNum} / ${pageCount}`, pageWidth - margin, footerY, {
      align: "right",
    });
  };

  // Start content on first page
  let cursorY = 60;

  // Input Section (boxed, monospace)
  doc.setFontSize(12);
  doc.setTextColor(20);
  doc.setFont("helvetica", "bold");
  doc.text("Input", margin, cursorY);
  cursorY += 20;

  const inputText = input || results.map((r) => r.input || "").join("\n");
  const wrappedInput = doc.splitTextToSize(inputText, contentWidth - 12);

  // Draw rounded rectangle background for input
  const inputBoxY = cursorY + 4;
  const inputBoxHeight = Math.min(220, wrappedInput.length * 12 + 18);
  doc.setFillColor(248, 249, 250);
  doc.roundedRect(
    margin - 6,
    inputBoxY - 8,
    contentWidth + 12,
    inputBoxHeight,
    6,
    6,
    "F",
  );

  // Monospace text
  doc.setFont("courier", "normal");
  doc.setFontSize(10);
  doc.setTextColor(40);
  doc.text(wrappedInput, margin, inputBoxY + 8);
  cursorY = inputBoxY + inputBoxHeight + 8;

  // Analysis Summary with small badges
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(20);
  doc.text("Analysis Summary", margin, cursorY);
  cursorY += 12;

  const totals = results.reduce(
    (acc, r) => ({
      tokens: acc.tokens + (r.lexResult?.tokens?.length || 0),
      errors: acc.errors + (r.parseErrors?.length || 0),
      warnings: acc.warnings + 0,
      lines: acc.lines + 1,
    }),
    { tokens: 0, errors: 0, warnings: 0, lines: 0 },
  );

  const badge = (label: string, value: string, x: number) => {
    const w = doc.getTextWidth(`${label} ${value}`) + 18;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(x, cursorY, w, 18, 4, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(60);
    doc.text(`${label} ${value}`, x + 8, cursorY + 13);
    return x + w + 10;
  };

  let badgeX = margin;
  badgeX = badge("Lines:", String(totals.lines), badgeX);
  badgeX = badge("Tokens:", String(totals.tokens), badgeX);
  badgeX = badge("Errors:", String(totals.errors), badgeX);
  badgeX = badge("Warnings:", String(totals.warnings), badgeX);
  cursorY += 50;

  // Render per-line sections: Lexical Analysis, Symbol Table, Parse Tree
  if (!results || results.length === 0) {
    doc.text("No analysis results available.", margin, cursorY);
  } else {
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerReserve = 36 + 18;
    let linesRendered = 0;

    // Always start each line on a new page when multiple lines exist (except first line and single page mode)
    for (let i = 0; i < results.length; i++) {
      const res = results[i];

      // For multiple lines analysis: always start second and subsequent lines on a new page
      if (i > 0 && !singlePage) {
        doc.addPage();
        cursorY = 60;
        const currentPageNum = doc.getNumberOfPages();
        addHeaderFooter(currentPageNum, currentPageNum);
      }

      // Check page space when singlePage: stop if out of vertical space
      if (singlePage && cursorY > pageHeight - margin - footerReserve) {
        const remaining = results.length - linesRendered;
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.text(
          `... ${remaining} line(s) omitted to fit single-page report`,
          margin,
          cursorY + 8,
        );
        cursorY += 20;
        break;
      }

      // Line heading
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      const lineTitle = `Line ${res.line || i + 1}: "${res.input ?? ""}"`;
      doc.text(lineTitle, margin, cursorY);
      cursorY += 14;

      // --- Lexical Analysis Table for this line ---
      const tokens = res.lexResult?.tokens || [];
      
      // Check if there's enough space for Lexical Analysis section
      // Minimum required space: heading + at least 3 rows of table
      const minLexicalSpace = 120;
      if (cursorY + minLexicalSpace > pageHeight - footerReserve && !singlePage) {
        doc.addPage();
        cursorY = 60;
        const currentPageNum = doc.getNumberOfPages();
        addHeaderFooter(currentPageNum, currentPageNum);
        
        // Re-add section context heading on new page
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(lineTitle, margin, cursorY);
        cursorY += 14;
      }
      
      // Add Lexical Analysis subtopic heading
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(40);
      doc.text("1. Lexical Analysis", margin, cursorY);
      cursorY += 16;
      
      if (tokens.length === 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("No tokens.", margin, cursorY);
        cursorY += 16;
      } else {
        // Show all tokens, no truncation
        const tokenRows = tokens.map((t: any) => [
          t.image ?? "",
          (t.tokenType && t.tokenType.name) || "",
          String(t.image ?? ""),
          t.startLine ?? res.line ?? "",
          t.startColumn ?? "",
        ]);

        autoTable(doc, {
          startY: cursorY,
          head: [["Token", "Type", "Value", "Line", "Col"]],
          body: tokenRows,
          styles: {
            font: "helvetica",
            fontSize: singlePage ? 8 : 10,
            cellPadding: 4,
          },
          headStyles: { fillColor: headingColor, textColor: 255 },
          margin: { left: margin, right: margin },
          columnStyles: {
            0: { cellWidth: 70 },
            1: { cellWidth: 90 },
            2: { cellWidth: contentWidth - 260 },
            3: { cellWidth: 40 },
            4: { cellWidth: 40 },
          },
          didDrawPage: (data) => {
            const pageNum = data.pageNumber;
            const pageCount = doc.getNumberOfPages();
            addHeaderFooter(pageNum, pageCount);
          },
        });
        cursorY = (doc as any).lastAutoTable
          ? (doc as any).lastAutoTable.finalY + 8
          : cursorY + (tokenRows.length + 1) * 12;
        cursorY += 8;
      }

      // --- Symbol Table for this line ---
      const symbols = res.symbolTable || [];
      
      // Check if there's enough space for Symbol Table section
      // Minimum required space: heading + at least 3 rows of table
      const minSymbolSpace = 120;
      if (cursorY + minSymbolSpace > pageHeight - footerReserve && !singlePage) {
        doc.addPage();
        cursorY = 60;
        const currentPageNum = doc.getNumberOfPages();
        addHeaderFooter(currentPageNum, currentPageNum);
        
        // Add section context on new page
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(lineTitle, margin, cursorY);
        cursorY += 14;
      }
      
      // Add Symbol Table subtopic heading
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(40);
      doc.text("2. Symbol Table", margin, cursorY);
      cursorY += 16;
      
      if (symbols.length === 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("No symbols.", margin, cursorY);
        cursorY += 16;
      } else {
        // Show all symbols, no truncation
        const symRows = symbols.map((s: any) => [
          s.id ?? "",
          s.lexeme ?? "",
          s.type ?? "",
          s.line ?? "",
          s.column ?? "",
          s.length ?? "",
          s.scope ?? "",
        ]);

        autoTable(doc, {
          startY: cursorY,
          head: [["ID", "Lexeme", "Type", "Line", "Col", "Len", "Scope"]],
          body: symRows,
          styles: {
            font: "helvetica",
            fontSize: singlePage ? 8 : 10,
            cellPadding: 4,
          },
          headStyles: { fillColor: headingColor, textColor: 255 },
          margin: { left: margin, right: margin },
          columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 110 },
            2: { cellWidth: 70 },
            3: { cellWidth: 40 },
            4: { cellWidth: 40 },
            5: { cellWidth: 40 },
            6: { cellWidth: 60 },
          },
          didDrawPage: (data) => {
            const pageNum = data.pageNumber;
            const pageCount = doc.getNumberOfPages();
            addHeaderFooter(pageNum, pageCount);
          },
        });
        cursorY = (doc as any).lastAutoTable
          ? (doc as any).lastAutoTable.finalY + 8
          : cursorY + (symRows.length + 1) * 12;
        cursorY += 8;
      }

      const estimatedDiagramHeight = 470; // Approximate height needed for diagram (increased for heading)
      if (cursorY + estimatedDiagramHeight > pageHeight - footerReserve && !singlePage) {
        doc.addPage();
        cursorY = 60;
        const currentPageNum = doc.getNumberOfPages();
        addHeaderFooter(currentPageNum, currentPageNum);
        
        // Add section context on new page
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(lineTitle, margin, cursorY);
        cursorY += 14;
      }

      // Add Parse Tree Diagram subtopic heading
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(40);
      doc.text("3. Parse Tree Diagram", margin, cursorY);
      cursorY += 16;

      // Generate Mermaid diagram
      let mermaidCode = "";
      if (res.cst) {
        mermaidCode = cstToMermaidGraph(res.cst);
      } else if (res.treeLines && res.treeLines.length > 0) {
        mermaidCode = generateSimpleMermaidTree(res.treeLines);
      }

      if (mermaidCode) {
        try {
          // Render Mermaid diagram as image
          const imgDataUrl = await renderMermaidToImage(mermaidCode);
          
          if (imgDataUrl) {
            const maxWidth = contentWidth;
            const remainingPageHeight = pageHeight - cursorY - footerReserve - 20;
            const maxHeight = singlePage ? Math.min(350, remainingPageHeight) : Math.min(500, remainingPageHeight);
            
            // Create a temporary image to get dimensions
            const tempImg = new Image();
            tempImg.src = imgDataUrl;
            
            // Wait for image to load to get its dimensions
            await new Promise<void>((resolve) => {
              tempImg.onload = () => resolve();
              tempImg.onerror = () => resolve();
            });
            
            // Calculate scaled dimensions maintaining aspect ratio
            let imgWidth = tempImg.width || maxWidth;
            let imgHeight = tempImg.height || 300;
            
            // Scale to fit within bounds
            const widthRatio = maxWidth / imgWidth;
            const heightRatio = maxHeight / imgHeight;
            const scale = Math.min(widthRatio, heightRatio, 1); // Don't upscale
            
            imgWidth = imgWidth * scale;
            imgHeight = imgHeight * scale;
            
            // Center the image horizontally
            const xOffset = margin + (contentWidth - imgWidth) / 2;
            
            // Add the image to the PDF
            doc.addImage(imgDataUrl, "PNG", xOffset, cursorY, imgWidth, imgHeight);
            cursorY += imgHeight + 20;
          } else {
            // Fallback: show Mermaid code if image rendering fails
            const mermaidLines = mermaidCode.split("\n");
            const mermaidBoxHeight = Math.min(200, mermaidLines.length * 10 + 20);
            doc.setFillColor(245, 248, 255);
            doc.roundedRect(
              margin - 6,
              cursorY - 8,
              contentWidth + 12,
              mermaidBoxHeight,
              6,
              6,
              "F",
            );

            doc.setFont("courier", "normal");
            doc.setFontSize(8);
            doc.setTextColor(40);

            const displayLines = mermaidLines.slice(
              0,
              Math.floor((mermaidBoxHeight - 20) / 10),
            );
            for (let j = 0; j < displayLines.length; j++) {
              doc.text(displayLines[j], margin, cursorY + j * 10);
            }

            cursorY += mermaidBoxHeight + 10;

            doc.setFont("helvetica", "italic");
            doc.setFontSize(9);
            doc.setTextColor(100);
            doc.text(
              "Note: Image rendering failed. Copy this code to mermaid.live for visualization",
              margin,
              cursorY,
            );
            cursorY += 15;
          }
        } catch (error) {
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.text("Mermaid diagram generation failed.", margin, cursorY);
          cursorY += 16;
        }
      } else {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("No diagram data available.", margin, cursorY);
        cursorY += 16;
      }

      // --- Parse Tree (indented lines) ---
      const treeLines = res.treeLines || [];
      
      const headingSpace = 16; // Space the heading text takes
      const postHeadingSpace = 16; // Space after heading before table
      const tableHeaderSpace = 30; // Table header row
      const minDataRowsSpace = 60; // At least 5 data rows
      const safetyBuffer = 50; // Extra buffer to prevent autoTable from breaking
      const totalMinRequiredSpace = headingSpace + postHeadingSpace + tableHeaderSpace + minDataRowsSpace + safetyBuffer;
      const availableSpace = pageHeight - cursorY - footerReserve;
      
      // If not enough space (at least 172 units), move everything to new page
      if (availableSpace < totalMinRequiredSpace && !singlePage) {
        // Not enough space - start this ENTIRE section (heading + content) on a new page
        doc.addPage();
        cursorY = 60;
        const currentPageNum = doc.getNumberOfPages();
        addHeaderFooter(currentPageNum, currentPageNum);
        
        // Re-add section context on new page
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(lineTitle, margin, cursorY);
        cursorY += 14;
      }
      
      // Check if there's enough space for Parse Tree Text section
      const estimatedTreeHeight = treeLines.length * 12 + 80; // Heading + table header + some rows
      if (cursorY + estimatedTreeHeight > pageHeight - footerReserve && !singlePage) {
        doc.addPage();
        cursorY = 60;
        const currentPageNum = doc.getNumberOfPages();
        addHeaderFooter(currentPageNum, currentPageNum);
        
        // Add section context on new page
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.text(lineTitle, margin, cursorY);
        cursorY += 14;
      }

      // Add Parse Tree (Text Format) subtopic heading
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(40);
      doc.text("4. Parse Tree (Text Format)", margin, cursorY);
      cursorY += 16;
      
      if (treeLines.length === 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text("No parse tree available.", margin, cursorY);
        cursorY += 16;
      } else {
        // Show all tree lines
        const toShow = treeLines;
        
        autoTable(doc, {
          startY: cursorY,
          head: [["Parse Tree Structure"]],
          body: toShow.map((l: string) => [l]),
          styles: {
        font: "courier",
        fontSize: singlePage ? 7 : 9,
        cellPadding: 3,
          },
          headStyles: { 
        fillColor: headingColor, 
        textColor: 255,
        minCellHeight: 14
          },
          bodyStyles: { minCellHeight: 10 },
          margin: { left: margin, right: margin },
          columnStyles: { 0: { cellWidth: contentWidth } },
          tableLineWidth: 1,
          showHead: "firstPage",
          tableWidth: "auto",
          didDrawPage: (data) => {
        const pageNum = data.pageNumber;
        const pageCount = doc.getNumberOfPages();
        addHeaderFooter(pageNum, pageCount);
          },
        });
        
        // Update cursor position after the autotable
        cursorY = (doc as any).lastAutoTable
          ? (doc as any).lastAutoTable.finalY + 8
          : cursorY + toShow.length * 12 + 8;
        
        cursorY += 8;
      }

      // Spacing between lines
      cursorY += 18;
      linesRendered++;
    }
  }

  // Ensure header/footer on all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addHeaderFooter(i, pageCount);
  }

  const filename = `lexical_report_${now.toISOString().split("T")[0]}.pdf`;
  doc.save(filename);
}

// React button component for PDF export
export default function PdfExporterButton({
  results,
  input,
  grammarRules,
  children,
}: {
  results: AnalysisResult[];
  input?: string;
  grammarRules?: string[];
  children?: React.ReactNode;
}) {
  return (
    <button
      className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition-colors"
      onClick={() =>
        generatePdf({
          results,
          input,
          grammarRules,
          appName: "Compiler Playground",
        })
      }
    >
      {children ?? "Export PDF"}
    </button>
  );
}