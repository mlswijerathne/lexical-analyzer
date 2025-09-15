import { QuestionMarkCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';
import Button from './Button';

interface KeyboardShortcutsProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function KeyboardShortcuts({ isVisible, onClose }: KeyboardShortcutsProps) {
  if (!isVisible) return null;

  const shortcuts = [
    {
      category: "Editor",
      items: [
        { keys: ["Ctrl", "+", "Enter"], description: "Analyze expressions" },
        { keys: ["Ctrl", "+", "S"], description: "Save/Download report" },
        { keys: ["Ctrl", "+", "A"], description: "Select all text" },
        { keys: ["Ctrl", "+", "Z"], description: "Undo" },
        { keys: ["Ctrl", "+", "Y"], description: "Redo" },
        { keys: ["Ctrl", "+", "C"], description: "Copy text" },
        { keys: ["Ctrl", "+", "V"], description: "Paste text" }
      ]
    },
    {
      category: "Navigation", 
      items: [
        { keys: ["Ctrl", "+", "G"], description: "Go to line" },
        { keys: ["Ctrl", "+", "F"], description: "Find in editor" },
        { keys: ["Home"], description: "Go to line start" },
        { keys: ["End"], description: "Go to line end" },
        { keys: ["Ctrl", "+", "Home"], description: "Go to document start" },
        { keys: ["Ctrl", "+", "End"], description: "Go to document end" }
      ]
    },
    {
      category: "UI",
      items: [
        { keys: ["Esc"], description: "Close dialogs/panels" },
        { keys: ["Ctrl", "+", "H"], description: "Toggle history panel" },
        { keys: ["F1"], description: "Show this help" }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-600 rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <QuestionMarkCircleIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white">Keyboard Shortcuts</h3>
                <p className="text-gray-400 text-sm">Master these shortcuts to boost your productivity</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="secondary"
              size="sm"
              iconLeft={<XMarkIcon className="h-4 w-4" />}
              aria-label="Close shortcuts help"
            />
          </div>

          <div className="space-y-6">
            {shortcuts.map((category, categoryIndex) => (
              <div key={categoryIndex}>
                <h4 className="text-lg font-medium text-white mb-3 border-b border-gray-600/50 pb-2">
                  {category.category}
                </h4>
                <div className="space-y-3">
                  {category.items.map((shortcut, shortcutIndex) => (
                    <div key={shortcutIndex} className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">{shortcut.description}</span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center gap-1">
                            <kbd className="bg-gray-700/50 border border-gray-600/50 rounded px-2 py-1 text-xs font-mono text-gray-200">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-gray-500 text-xs">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-lg bg-blue-900/20 border border-blue-500/30">
            <h5 className="font-medium text-blue-400 mb-2">💡 Pro Tips</h5>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Press F1 at any time to show this help dialog</li>
              <li>• Use Ctrl+Enter to quickly analyze your expressions</li>
              <li>• Monaco Editor supports many VS Code shortcuts</li>
              <li>• Use Ctrl+/ to toggle line comments in multi-line mode</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}