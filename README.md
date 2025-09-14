# Lexical Analyzer (React + TypeScript)

A small web app for experimenting with lexical analysis and tokenization, built with React, TypeScript and Vite.

This repository provides a browser-based UI to paste or type source text, run a lexical analysis/tokenization step, review results and history, and export output to PDF.

## Features

- Live editor pane to enter source text
- Tokenization / lexical analysis results panel
- History panel to view past analyses
- Export results to PDF
- Simple, component-based code structure for easy extension

## Tech stack

- React + TypeScript
- Vite (development server + build)
- pnpm (recommended package manager)

## Project structure

Key files and folders:

- `src/` - application source
	- `main.tsx` - app entry
	- `App.tsx` - root component
	- `components/` - UI components (Button, EditorPane, ResultsPanel, HistoryPanel, PdfExporter, SidebarStats)
	- `utils/` - helper modules (e.g. `history.ts`)
- `index.html` - HTML template used by Vite
- `vite.config.ts` - Vite configuration
- `tsconfig.json` / `tsconfig.*.json` - TypeScript configuration

## Getting started

Requirements:

- Node.js 16+ (or compatible LTS)
- pnpm (recommended) — if you use npm or yarn adjust commands accordingly

Install dependencies:

```powershell
pnpm install
```

Run the development server:

```powershell
pnpm run dev
```

Open `http://localhost:5173` (or the URL printed by Vite) to view the app.

Build for production:

```powershell
pnpm run build
```

Preview the production build locally:

```powershell
pnpm run preview
```

Run tests (if present):

```powershell
pnpm test
```



