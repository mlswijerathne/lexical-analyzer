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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => {
        // Close when clicking the backdrop
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] flex flex-col bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <ClockIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Analysis History</h2>
              <p className="text-gray-400 text-sm">Your recent lexical analysis sessions</p>
            </div>
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
              iconLeft={<TrashIcon className="h-5 w-5" />}
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
              <ClockIcon className="h-12 w-12 mb-4 text-gray-500" />
              <p className="text-gray-400">No history found</p>
              <p className="text-sm text-gray-500">Analyze expressions to create history entries</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {history.map((item) => (
                <li 
                  key={item.id} 
                  className="border border-gray-600/50 rounded-lg p-4 cursor-pointer transition-all hover:border-gray-500/50 hover:bg-gray-700/30 bg-gray-800/30"
                  onClick={() => onSelectItem(item.input)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <div 
                        className="font-mono text-sm mb-2 text-gray-300 truncate"
                        style={{
                          whiteSpace: 'pre-wrap',
                          overflowWrap: 'break-word'
                        }}
                      >
                        {formatInput(item.input)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(item.timestamp)}
                      </div>
                    </div>
                    {item.summary && (
                      <div className="flex gap-3 text-xs flex-shrink-0">
                        <div title="Tokens" className="text-center">
                          <div className="text-blue-400 font-semibold">{item.summary.tokens}</div>
                          <div className="text-gray-500">Tokens</div>
                        </div>
                        <div title="Symbols" className="text-center">
                          <div className="text-purple-400 font-semibold">{item.summary.symbols}</div>
                          <div className="text-gray-500">Symbols</div>
                        </div>
                        <div title="Valid Expressions" className="text-center">
                          <div className="text-green-400 font-semibold">{item.summary.valid}</div>
                          <div className="text-gray-500">Valid</div>
                        </div>
                        <div title="Errors" className="text-center">
                          <div className={`font-semibold ${item.summary.errors > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            {item.summary.errors}
                          </div>
                          <div className="text-gray-500">Errors</div>
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
