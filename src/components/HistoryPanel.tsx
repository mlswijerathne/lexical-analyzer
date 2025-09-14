import React from 'react';
import { getHistory, clearHistory, type HistoryItem } from '../utils/history';
import { XMarkIcon, TrashIcon, ClockIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import Button from './Button';

interface HistoryPanelProps {
  onClose: () => void;
  onSelectItem: (input: string) => void;
}

export default function HistoryPanel({ onClose, onSelectItem }: HistoryPanelProps) {
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load history on component mount
  React.useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setIsLoading(true);
    // Small delay to allow UI to show loading state
    setTimeout(() => {
      const items = getHistory();
      setHistory(items);
      setIsLoading(false);
    }, 100);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      clearHistory();
      setHistory([]);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Format input preview (truncate if too long, preserve line breaks)
  const formatInput = (input: string) => {
    const maxLength = 150;
    const lines = input.split('\n');
    const truncatedLines = lines.map(line => {
      if (line.length <= maxLength) return line;
      return line.substring(0, maxLength) + '...';
    });
    
    // Limit to max 3 lines with indication if there are more
    const maxLines = 3;
    if (truncatedLines.length > maxLines) {
      return truncatedLines.slice(0, maxLines).join('\n') + '\n...';
    }
    
    return truncatedLines.join('\n');
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        // Close when clicking the backdrop
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col"
        style={{ backgroundColor: '#252526', color: '#d4d4d4', border: '1px solid #2d2d2d' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#333' }}>
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5" style={{ color: '#0e639c' }} />
            <h2 className="text-xl font-bold" style={{ color: '#e7e7e7' }}>Lexical Analysis History</h2>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={loadHistory}
              variant="secondary"
              size="sm"
              title="Refresh"
              iconLeft={<ArrowPathIcon className="h-5 w-5" />}
              aria-label="Refresh history"
            />
            <Button
              onClick={handleClearHistory}
              variant="secondary"
              size="sm"
              title="Clear All History"
              disabled={history.length === 0}
              iconLeft={<TrashIcon className="h-5 w-5" style={{ color: history.length === 0 ? '#555' : '#F44747' }} />}
              aria-label="Clear history"
            />
            <Button
              onClick={onClose}
              variant="secondary" 
              size="sm"
              title="Close"
              iconLeft={<XMarkIcon className="h-5 w-5" />}
              aria-label="Close"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-pulse text-gray-400">Loading history...</div>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <ClockIcon className="h-12 w-12 mb-4" style={{ color: '#555' }} />
              <p style={{ color: '#9aa0a6' }}>No history found</p>
              <p className="text-sm" style={{ color: '#666' }}>Analyze expressions to create history entries</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {history.map((item) => (
                <li 
                  key={item.id} 
                  className="border rounded-lg p-4 cursor-pointer transition-colors"
                  style={{ borderColor: '#333', backgroundColor: '#1e1e1e' }}
                  onClick={() => onSelectItem(item.input)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div 
                        className="font-mono text-sm mb-2" 
                        style={{ 
                          color: '#CEA47C',
                          whiteSpace: 'pre-wrap',
                          overflowWrap: 'break-word'
                        }}
                      >
                        {formatInput(item.input)}
                      </div>
                      <div className="text-xs" style={{ color: '#9aa0a6' }}>
                        {formatDate(item.timestamp)}
                      </div>
                    </div>
                    {item.summary && (
                      <div className="flex gap-3 text-xs">
                        <div title="Tokens">
                          <span style={{ color: '#9aa0a6' }}>Tokens: </span>
                          <span>{item.summary.tokens}</span>
                        </div>
                        <div title="Symbols">
                          <span style={{ color: '#9aa0a6' }}>Symbols: </span>
                          <span>{item.summary.symbols}</span>
                        </div>
                        <div title="Valid Expressions">
                          <span style={{ color: '#9aa0a6' }}>Valid: </span>
                          <span style={{ color: '#6A9955' }}>{item.summary.valid}</span>
                        </div>
                        <div title="Errors">
                          <span style={{ color: '#9aa0a6' }}>Errors: </span>
                          <span style={{ color: item.summary.errors > 0 ? '#F14C4C' : '#6A9955' }}>{item.summary.errors}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
