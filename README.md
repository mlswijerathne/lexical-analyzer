# Lexical Analyzer

A modern web application for lexical analysis and tokenization, built with React and TypeScript. Analyze mathematical expressions and simple statements, visualize parse trees, review tokens and symbols, export reports, and revisit past analyses.

## Features

- **Interactive editor (Monaco)**: Real-time code editing with VS Code–like shortcuts
- **Token analysis (Chevrotain)**: Detailed token breakdown with positions
- **CST parsing & validation**: Enhanced error detection and recovery, per-line analysis support
- **Tree visualization (Mermaid)**: Simplified syntax tree rendering for quick inspection
- **History management**: Save and revisit previous analysis sessions
- **PDF export (jsPDF)**: Generate professional, shareable reports
- **Keyboard shortcuts**: Built-in cheat sheet and common productivity keys
- **Responsive UI**: Dark-themed, desktop-first layout

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **Build tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Editor**: Monaco Editor
- **Parsing**: Chevrotain
- **Diagrams**: Mermaid
- **PDF**: jsPDF (+ autotable)
- **UI**: Headless UI, Heroicons
- **Package manager**: pnpm
- **Code quality**: ESLint (TypeScript)

## Project Structure

```
src/
├── components/
│   ├── Button.tsx
│   ├── EditorPanel.tsx
│   ├── ResultsPanel.tsx
│   ├── HistoryPanel.tsx
│   ├── SidebarStats.tsx
│   ├── WelcomeSection.tsx
│   ├── KeyboardShortcuts.tsx
│   ├── PdfExporter.tsx
│   ├── MermaidTree.tsx
│   └── Footer.tsx
├── utils/
│   ├── history.ts
│   └── mermaidTree.ts
├── types/
│   └── mermaid.d.ts
├── styles/
│   └── theme.css
├── App.tsx
├── main.tsx
└── index.css
```

## Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm (recommended)

### Installation

```bash
# Clone the repository
git clone https://github.com/mlswijerathne/lexical-analyzer.git

cd lexical-analyzer

# Install dependencies
pnpm install

# Start the development server
pnpm dev
```

The app will be available at `http://localhost:5173`.

### Available Scripts

- `pnpm dev`: Start development server
- `pnpm build`: Type-check and build for production to `dist/`
- `pnpm preview`: Preview the production build
- `pnpm lint`: Run ESLint

## Usage

1. **Enter expressions**: Type or paste one or more expressions (multi-line supported) in the editor.
2. **Analyze**: Click Analyze or press `Ctrl + Enter`.
3. **Review**: Inspect tokens, symbol table, errors, and the syntax tree.
4. **Export**: Use the export action or press `Ctrl + S` to generate a PDF report.
5. **History**: Toggle the history panel to restore a previous session.

### Keyboard Shortcuts (highlights)

- `Ctrl + Enter`: Analyze expressions
- `Ctrl + S`: Save/Download report
- `Ctrl + H`: Toggle history panel
- `F1`: Open keyboard shortcuts
- `Ctrl + F / G / Home / End`: Common navigation (Monaco/VS Code style)

## Build & Deploy

```bash
pnpm build
pnpm preview
```

The production build is output to `dist/` and can be deployed to any static host (e.g., GitHub Pages, Netlify, Vercel, S3/CloudFront).

## Acknowledgements

- Chevrotain — tokenization and parsing
- Monaco Editor — in-browser code editor
- Mermaid — diagram rendering
- jsPDF — report generation
- Tailwind CSS & Vite — DX and build tooling

