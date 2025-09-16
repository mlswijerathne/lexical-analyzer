import { useState } from 'react';
import { ChevronRightIcon, LightBulbIcon, XMarkIcon } from '@heroicons/react/24/solid';
import Button from './Button';

interface WelcomeSectionProps {
  onSelectExample: (example: string) => void;
  isVisible: boolean;
  onDismiss: () => void;
}

export default function WelcomeSection({ onSelectExample, isVisible, onDismiss }: WelcomeSectionProps) {
  const [selectedExample, setSelectedExample] = useState<number | null>(null);
  const [showTips, setShowTips] = useState<boolean>(false);

  const examples = [
    {
      title: "Simple Expression",
      description: "Basic arithmetic operations",
      code: "x = 5 + 3 * 2",
      explanation: "Variable assignment with arithmetic operations following operator precedence"
    },
    {
      title: "Complex Expression", 
      description: "Nested parentheses and operations",
      code: "result = (a + b) * (c - d) / 2",
      explanation: "Complex expression with multiple variables and parentheses grouping"
    },
    {
      title: "Multiple Lines",
      description: "Multi-line input analysis", 
      code: "x = 10\ny = x + 5\nz = x * y",
      explanation: "Multiple expressions analyzed line by line"
    },
    {
      title: "Error Example",
      description: "Intentional syntax error",
      code: "x = 5 + + 3",
      explanation: "Example with consecutive operators to demonstrate error detection"
    }
  ];

  if (!isVisible) return null;

  return (
    <div className="mb-8 rounded-xl shadow-xl border border-blue-500/30 bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <LightBulbIcon className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Welcome to Compiler Playground</h3>
              <p className="text-gray-300 mt-1">Get started with these example expressions</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowTips(!showTips)}
              variant="primary"
              size="sm"
            >
              {showTips ? 'Hide Tips' : 'Show Tips'}
            </Button>
            <Button
              onClick={onDismiss}
              variant="secondary"
              size="sm"
              iconLeft={<XMarkIcon className="h-4 w-4" />}
              aria-label="Dismiss welcome section"
            />
          </div>
        </div>

        {showTips && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {examples.map((example, index) => (
            <div 
              key={index}
              className={`group relative p-4 rounded-lg border transition-all cursor-pointer ${
                selectedExample === index 
                  ? 'border-blue-400 bg-blue-900/30' 
                  : 'border-gray-600/50 bg-gray-800/30 hover:border-gray-500 hover:bg-gray-700/30'
              }`}
              onClick={() => setSelectedExample(selectedExample === index ? null : index)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white mb-1 truncate">{example.title}</h4>
                  <p className="text-sm text-gray-400 mb-3">{example.description}</p>
                  <div className="bg-gray-900/50 rounded-md p-2 font-mono text-sm text-gray-300 border border-gray-600/30 overflow-x-auto">
                    {example.code}
                  </div>
                </div>
                <ChevronRightIcon 
                  className={`h-5 w-5 text-gray-400 transition-transform ml-2 flex-shrink-0 ${
                    selectedExample === index ? 'rotate-90' : 'group-hover:translate-x-1'
                  }`} 
                />
              </div>
              
              {selectedExample === index && (
                <div className="mt-4 pt-4 border-t border-gray-600/50">
                  <p className="text-sm text-gray-300 mb-4">{example.explanation}</p>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectExample(example.code);
                      setSelectedExample(null);
                    }}
                    variant="primary"
                    size="sm"
                  >
                    Try This Example
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

            <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-600/30">
              <h4 className="font-medium text-white mb-2">💡 Quick Tips</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Use variables (a-z, A-Z) and numbers (0-9, decimals)</li>
                <li>• Supported operators: +, -, *, /, =</li>
                <li>• Use parentheses for grouping: (a + b) * c</li>
                <li>• Enter multiple lines for batch analysis</li>
                <li>• Real-time error detection helps identify syntax issues</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
}