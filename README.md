# Lexical Analyzer

A modern web application for lexical analysis and tokenization, built with React and TypeScript. This tool provides an intuitive interface for analyzing source code and text, generating detailed tokenization results with export capabilities.

## Features

- **Interactive Editor**: Real-time code editing with syntax highlighting
- **Token Analysis**: Comprehensive lexical analysis with detailed token breakdown
- **History Management**: Track and review previous analysis sessions
- **PDF Export**: Generate professional reports of analysis results
- **Responsive Design**: Optimized for desktop and mobile devices

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 4
- **Package Manager**: pnpm
- **Code Quality**: ESLint with TypeScript support

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── EditorPane.tsx
│   ├── ResultsPanel.tsx
│   ├── HistoryPanel.tsx
│   ├── PdfExporter.tsx
│   └── SidebarStats.tsx
├── utils/              # Utility functions
│   └── history.ts
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles
```

## Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- pnpm (recommended package manager)

### Installation

```bash
# Clone the repository
git clone https://github.com/mlswijerathne/lexical-analyzer.git

cd lexical-analyzer

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The application will be available at `http://localhost:5173`.

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint


## Usage

1. **Input Source Code**: Paste or type your source code in the editor pane
2. **Run Analysis**: Click the analyze button to perform lexical analysis
3. **Review Results**: Examine the tokenization results in the results panel
4. **Export Data**: Generate PDF reports or save analysis history
5. **Track Progress**: Monitor analysis statistics in the sidebar

